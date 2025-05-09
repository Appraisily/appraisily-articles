const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Directory to search in
const contentDir = path.join(__dirname, 'content', 'articles');

// Function to find all markdown files
function findMarkdownFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(file => file.endsWith('.md')).map(file => path.join(dir, file));
}

// Get all markdown files
const markdownFiles = findMarkdownFiles(contentDir);
console.log(`Found ${markdownFiles.length} markdown files to process`);

let fixedCount = 0;

// Process each file
markdownFiles.forEach(filePath => {
  try {
    // Read file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it contains JSON structured_data
    if (content.includes("structured_data: '{") || content.includes('structured_data: \'{"')) {
      console.log(`Fixing file: ${path.basename(filePath)}`);
      
      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        console.log(`  No frontmatter found in ${path.basename(filePath)}, skipping`);
        return;
      }
      
      const frontmatter = frontmatterMatch[1];
      
      // Extract the JSON string
      const jsonMatch = frontmatter.match(/structured_data: '([\s\S]*?)'/);
      if (!jsonMatch) {
        console.log(`  Could not extract JSON from ${path.basename(filePath)}, skipping`);
        return;
      }
      
      // Parse the JSON string
      try {
        const jsonString = jsonMatch[1];
        const jsonData = JSON.parse(jsonString);
        
        // Convert to YAML
        const yamlData = `structured_data:\n${formatObjectAsYaml(jsonData, 2)}`;
        
        // Replace in frontmatter
        const newFrontmatter = frontmatter.replace(/structured_data: '[\s\S]*?'/, yamlData);
        
        // Replace in file content
        const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${newFrontmatter}\n---`);
        
        // Write back to file
        fs.writeFileSync(filePath, newContent);
        fixedCount++;
        console.log(`  Successfully fixed ${path.basename(filePath)}`);
      } catch (jsonError) {
        console.log(`  Error parsing JSON in ${path.basename(filePath)}: ${jsonError.message}`);
      }
    }
  } catch (error) {
    console.log(`Error processing ${path.basename(filePath)}: ${error.message}`);
  }
});

console.log(`Fixed ${fixedCount} files successfully`);

// Function to format an object as YAML with proper indentation
function formatObjectAsYaml(obj, indent) {
  let result = '';
  const spaces = ' '.repeat(indent);
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      result += `${spaces}${key}:\n${formatObjectAsYaml(value, indent + 2)}`;
    } else {
      // Handle strings, numbers, etc.
      const formattedValue = typeof value === 'string' ? `"${value.replace(/"/g, '\\"')}"` : value;
      result += `${spaces}${key}: ${formattedValue}\n`;
    }
  }
  
  return result;
}