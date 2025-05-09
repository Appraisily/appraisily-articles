const fs = require('fs');
const path = require('path');

// List of files to fix
const filesToFix = [
  'antique-candy-dishes-value.md',
  // Add more files as needed
];

// Process each file
filesToFix.forEach(filename => {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  console.log(`Processing ${filename}...`);
  const content = fs.readFileSync(filePath, 'utf8');

  // Find the YAML frontmatter
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontMatterMatch) {
    console.error(`No frontmatter found in ${filename}`);
    return;
  }

  const frontMatter = frontMatterMatch[1];

  // Replace JSON strings in structured_data with proper YAML
  // This regex looks for structured_data: followed by a string in single quotes
  const newFrontMatter = frontMatter.replace(
    /(structured_data: )'({.*?})'/s,
    (_, prefix, jsonString) => {
      try {
        // Parse the JSON string
        const jsonData = JSON.parse(jsonString);
        
        // Convert to YAML format
        let yamlString = `${prefix}|\n`;
        const jsonPretty = JSON.stringify(jsonData, null, 2);
        jsonPretty.split('\n').forEach(line => {
          yamlString += `  ${line}\n`;
        });
        
        return yamlString;
      } catch (e) {
        console.error(`Error parsing JSON in ${filename}: ${e.message}`);
        return `${prefix}${jsonString}'`; // Return unchanged if there's an error
      }
    }
  );

  // Replace the frontmatter in the file
  const newContent = content.replace(
    /^---\n[\s\S]*?\n---/,
    `---\n${newFrontMatter}\n---`
  );

  // Write the file
  fs.writeFileSync(filePath, newContent);
  console.log(`Successfully updated ${filename}`);
}); 