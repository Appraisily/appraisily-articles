const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml'); // Using js-yaml for robust YAML parsing and stringification

// Function to recursively find all markdown files in a directory
function getAllMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllMarkdownFiles(filePath, fileList);
    } else if (path.extname(file).toLowerCase() === '.md') {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// --- Main script execution ---
const contentDir = path.join(__dirname, 'content');
const markdownFiles = getAllMarkdownFiles(contentDir);

let filesProcessed = 0;
let filesFixed = 0;
const errorFiles = [];

console.log(`Found ${markdownFiles.length} markdown files to process...`);

markdownFiles.forEach(filePath => {
  filesProcessed++;
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const frontmatterRegex = /^(---[\s\S]*?---)/;
    const match = content.match(frontmatterRegex);

    if (match && match[1]) {
      const frontmatterString = match[1].slice(3, -3).trim(); // Remove --- delimiters
      let frontmatter;
      try {
        frontmatter = yaml.load(frontmatterString);
      } catch (e) {
        // If initial parsing fails, it might be due to the problematic structured_data
        // Try to manually correct structured_data if it's a string, then re-parse
        const structuredDataRegex = /structured_data:\s*('[^']*'|"[^"]*")/;
        const sdMatch = frontmatterString.match(structuredDataRegex);

        if (sdMatch && sdMatch[1]) {
          const problematicString = sdMatch[1];
          // Attempt to repair it before parsing the whole frontmatter
          try {
            // Remove outer quotes from the JSON string
            const jsonString = problematicString.slice(1, -1);
            const parsedStructuredData = JSON.parse(jsonString); // This must be valid JSON

            // Create a temporary frontmatter string with corrected structured_data for js-yaml to load
            let tempFrontmatterString = frontmatterString.replace(structuredDataRegex, ''); // Remove old entry
            tempFrontmatterString += `\nstructured_data_temp_placeholder: true`; // Add placeholder for js-yaml

            frontmatter = yaml.load(tempFrontmatterString);
            delete frontmatter.structured_data_temp_placeholder; // Remove placeholder
            frontmatter.structured_data = parsedStructuredData; // Add the correctly parsed object

          } catch (parseError) {
            console.warn(`Could not auto-fix structured_data in ${path.basename(filePath)}. Manual check needed. Error: ${parseError.message}`);
            // Proceed with trying to parse the original frontmatter, which might still fail for other reasons
             frontmatter = yaml.load(frontmatterString); // This will likely re-throw or fail differently
          }
        } else {
          // No specific structured_data string found, re-throw original parsing error
          throw e;
        }
      }


      if (frontmatter && typeof frontmatter.structured_data === 'string') {
        try {
          const jsonData = JSON.parse(frontmatter.structured_data);
          frontmatter.structured_data = jsonData; // Replace string with parsed object
          
          const newFrontmatterString = yaml.dump(frontmatter, { noRefs: true, lineWidth: -1 });
          const newContent = content.replace(frontmatterRegex, `---
${newFrontmatterString.trim()}
---`);

          if (newContent !== content) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Fixed structured_data in: ${path.basename(filePath)}`);
            filesFixed++;
          }
        } catch (jsonError) {
          console.error(`Error parsing structured_data JSON in ${path.basename(filePath)}: ${jsonError.message}. File may need manual correction.`);
          errorFiles.push(path.basename(filePath));
        }
      }
    }
  } catch (e) {
    console.error(`Error processing file ${path.basename(filePath)}: ${e.message}`);
    errorFiles.push(path.basename(filePath));
  }
});

console.log(`\n--- Processing Complete ---`);
console.log(`Total files scanned: ${filesProcessed}`);
console.log(`Files with corrected structured_data: ${filesFixed}`);
if (errorFiles.length > 0) {
  console.warn(`Encountered errors in ${errorFiles.length} files: ${errorFiles.join(', ')}. These may need manual review.`);
} 