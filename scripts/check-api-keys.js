/**
 * Script to check for API keys and other sensitive information in the codebase
 * Run this before committing code to ensure no sensitive data is pushed
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Patterns to search for (using regular expressions)
const sensitivePatterns = [
  {
    name: 'Anthropic API Key',
    pattern: /sk-ant-api[0-9A-Za-z_-]{10,}/g
  },
  {
    name: 'Generic API Key Pattern',
    pattern: /api[-_]?key["']?\s*[:=]\s*["']([^"'\s]{8,})["']/gi
  },
  {
    name: 'Authorization Header',
    pattern: /Authorization["']?\s*[:=]\s*["']Bearer\s+([^"'\s]{8,})["']/gi
  },
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN\s+PRIVATE\s+KEY-----/g
  },
  {
    name: 'Generic Secret',
    pattern: /secret["']?\s*[:=]\s*["']([^"'\s]{8,})["']/gi
  },
  {
    name: 'Generic Password',
    pattern: /password["']?\s*[:=]\s*["']([^"'\s]{8,})["']/gi
  }
];

// Files and directories to ignore
const ignorePatterns = [
  /node_modules/,
  /\.git/,
  /\.env/,
  /\.env\./,
  /public\//,
  /resources/,
  /\.DS_Store/,
  /main_page\//,
  /\_gen\//
];

// Function to check if a path should be ignored
function shouldIgnore(filePath) {
  return ignorePatterns.some(pattern => pattern.test(filePath));
}

// Function to check a single file for sensitive information
async function checkFile(filePath) {
  if (shouldIgnore(filePath)) {
    return [];
  }
  
  // Check if file is binary
  try {
    const { stdout } = await execAsync(`file "${filePath}"`);
    if (stdout.includes('binary') || stdout.includes('executable') || 
        stdout.includes('image data') || stdout.includes('compressed')) {
      return [];
    }
  } catch (error) {
    // If the file command fails, assume it's a text file and continue
  }
  
  // Read file content
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for sensitive patterns
    const findings = [];
    
    for (const { name, pattern } of sensitivePatterns) {
      const matches = content.match(pattern);
      
      if (matches && matches.length > 0) {
        findings.push({
          pattern: name,
          file: filePath,
          count: matches.length
        });
      }
    }
    
    return findings;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

// Function to recursively check all files in a directory
async function checkDirectory(dir) {
  const allFindings = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      
      if (shouldIgnore(filePath)) {
        continue;
      }
      
      try {
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          const dirFindings = await checkDirectory(filePath);
          allFindings.push(...dirFindings);
        } else {
          const fileFindings = await checkFile(filePath);
          allFindings.push(...fileFindings);
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return allFindings;
}

// Function to check git staged files only
async function checkGitStagedFiles() {
  const allFindings = [];
  
  try {
    // Get list of staged files
    const { stdout } = await execAsync('git diff --cached --name-only');
    const files = stdout.trim().split('\n').filter(Boolean);
    
    for (const file of files) {
      if (shouldIgnore(file)) {
        continue;
      }
      
      try {
        const filePath = path.join(process.cwd(), file);
        const fileFindings = await checkFile(filePath);
        allFindings.push(...fileFindings);
      } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error getting staged files:', error.message);
  }
  
  return allFindings;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const stagedOnly = args.includes('--staged');
  const rootDir = path.resolve(__dirname, '..');
  
  console.log('Checking for sensitive information in codebase...');
  console.log(`Mode: ${stagedOnly ? 'Staged files only' : 'All files'}`);
  
  let findings = [];
  
  if (stagedOnly) {
    findings = await checkGitStagedFiles();
  } else {
    findings = await checkDirectory(rootDir);
  }
  
  if (findings.length === 0) {
    console.log('✅ No sensitive information found!');
    process.exit(0);
  } else {
    console.error(`⚠️ Found ${findings.length} potential issues:`);
    
    // Group findings by file
    const fileMap = {};
    for (const finding of findings) {
      if (!fileMap[finding.file]) {
        fileMap[finding.file] = [];
      }
      fileMap[finding.file].push(finding);
    }
    
    // Print findings grouped by file
    for (const [file, fileFindings] of Object.entries(fileMap)) {
      console.error(`\nFile: ${file}`);
      for (const finding of fileFindings) {
        console.error(`  - ${finding.pattern}: ${finding.count} match(es)`);
      }
    }
    
    console.error('\nPlease remove sensitive information before committing.');
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});