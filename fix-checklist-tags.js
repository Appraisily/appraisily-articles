/**
 * Fix Checklist Item Tags Script
 * 
 * This script fixes the common issue with checklist-item shortcodes 
 * that have incorrect closing syntax (/ / />)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

async function main() {
  // Find all markdown files in content/articles
  const files = glob.sync('content/articles/**/*.md');
  
  console.log(`Found ${files.length} files to process`);
  let fixedFiles = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Look for the pattern with incorrect self-closing tags
      const pattern = /{{<\s*interactive-modules\/checklist-item\s+([^>]*?)\s*\/\s*\/\s*>}}/g;
      
      if (pattern.test(content)) {
        // If found, replace with correct format
        const fixedContent = content.replace(pattern, 
          (match, attributes) => `{{< interactive-modules/checklist-item ${attributes} />}}`
        );
        
        // Write the fixed content back to the file
        fs.writeFileSync(file, fixedContent, 'utf8');
        fixedFiles++;
        console.log(`Fixed: ${file}`);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  console.log(`\nCompleted! Fixed ${fixedFiles} files out of ${files.length} total files.`);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});