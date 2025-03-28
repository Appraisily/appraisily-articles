const fs = require('fs');
const path = require('path');

// Function to fix structured data in YAML front matter
function fixStructuredData(content) {
  // Check if the file has structured_data field
  if (content.includes('structured_data:')) {
    // Split content into lines
    const lines = content.split('\n');
    let inFrontMatter = false;
    let frontMatterStart = -1;
    let frontMatterEnd = -1;
    let structuredDataLineStart = -1;
    let structuredDataLineEnd = -1;
    
    // Find the front matter boundaries and structured_data field
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '---' && frontMatterStart === -1) {
        frontMatterStart = i;
        inFrontMatter = true;
        continue;
      }
      
      if (line === '---' && inFrontMatter) {
        frontMatterEnd = i;
        inFrontMatter = false;
        break;
      }
      
      if (inFrontMatter && line.startsWith('structured_data:')) {
        structuredDataLineStart = i;
        
        // Find the end of the structured_data field
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim() === '---' || lines[j].trim().indexOf(':') === lines[j].trim().length - 1) {
            structuredDataLineEnd = j - 1;
            break;
          }
        }
        
        // If we didn't find the end, assume it's a single line
        if (structuredDataLineEnd === -1) {
          structuredDataLineEnd = i;
        }
      }
    }
    
    // If we found all necessary positions
    if (frontMatterStart !== -1 && frontMatterEnd !== -1 && structuredDataLineStart !== -1) {
      // Extract the JSON data from the structured_data field
      let jsonString = '';
      if (structuredDataLineStart === structuredDataLineEnd) {
        // Single line structured_data
        const match = lines[structuredDataLineStart].match(/structured_data: ['"](.+)['"]/);
        if (match && match[1]) {
          jsonString = match[1];
        }
      } else {
        // Multi-line structured_data
        for (let i = structuredDataLineStart + 1; i <= structuredDataLineEnd; i++) {
          jsonString += lines[i];
        }
      }
      
      // If we got a JSON string, format it properly
      if (jsonString) {
        let jsonObj;
        try {
          jsonObj = JSON.parse(jsonString);
          const formattedJson = JSON.stringify(jsonObj, null, 2);
          
          // Create a new structured_data field using the pipe format
          const newStructuredData = ['structured_data: |'];
          formattedJson.split('\n').forEach(line => {
            newStructuredData.push('  ' + line);
          });
          
          // Replace the old structured_data field with the new one
          lines.splice(structuredDataLineStart, structuredDataLineEnd - structuredDataLineStart + 1, ...newStructuredData);
          
          return lines.join('\n');
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
    }
  }
  
  return content;
}

// Process all markdown files in the articles directory
const articlesDir = path.join(__dirname, 'content', 'articles');
const files = fs.readdirSync(articlesDir);

files.forEach(file => {
  if (file.endsWith('.md')) {
    const filePath = path.join(articlesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixStructuredData(content);
    
    if (content !== fixedContent) {
      console.log(`Fixing structured data in ${file}`);
      fs.writeFileSync(filePath, fixedContent, 'utf8');
    }
  }
});

console.log('Structured data fixes completed!');