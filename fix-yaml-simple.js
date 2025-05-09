const fs = require('fs');
const path = require('path');

// The file with a problem
const filePath = path.join(__dirname, 'content', 'articles', 'antique-candy-dishes-value.md');

console.log(`Processing ${filePath}...`);

// Read the file
const content = fs.readFileSync(filePath, 'utf8');

// Replace the problematic JSON string with YAML pipe format
const newContent = content.replace(
  /structured_data: '({.*?})'/s,
  (match, jsonStr) => {
    try {
      // Parse the JSON
      const data = JSON.parse(jsonStr);
      
      // Format it as YAML with pipe syntax
      let yaml = 'structured_data: |\n';
      const pretty = JSON.stringify(data, null, 2);
      pretty.split('\n').forEach(line => {
        yaml += `  ${line}\n`;
      });
      
      return yaml;
    } catch (e) {
      console.error(`Error parsing JSON: ${e.message}`);
      return match; // Return unchanged if error
    }
  }
);

// Write the file back
fs.writeFileSync(filePath, newContent);
console.log('File updated successfully'); 