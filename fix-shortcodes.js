const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Use a direct approach to get all markdown files
function getAllMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      getAllMarkdownFiles(filePath, fileList);
    } else if (path.extname(file) === '.md') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Get all markdown files in the content directory
const contentDir = path.join(__dirname, 'content');
const allMarkdownFiles = getAllMarkdownFiles(contentDir);

console.log(`Found ${allMarkdownFiles.length} markdown files to process`);

// Shortcodes that should be self-closing (i.e., should end with '/>' and not have a separate closing tag)
const selfClosingShortcodes = [
  'data-modules/stats-highlight',
  'data-modules/stat-card',
  'interactive-modules/checklist-item',
  'data-modules/chart'
];

let fixedFiles = 0;
let errorFiles = [];

// Process each file
allMarkdownFiles.forEach(filePath => {
  try {
    // Read file
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let fileHasChanges = false;

    // Fix common shortcode issues
    selfClosingShortcodes.forEach(shortcode => {
      // 1. Replace closing tags for self-closing shortcodes
      const closingTagPattern = new RegExp(`{{<\\s*/${shortcode}\\s*>}}`, 'g');
      if (closingTagPattern.test(updatedContent)) {
        fileHasChanges = true;
        updatedContent = updatedContent.replace(closingTagPattern, '');
      }

      // 2. Convert open tags without self-closing syntax to be self-closing
      const openTagPattern = new RegExp(`{{<\\s*${shortcode}([^>]*)>}}`, 'g');
      if (openTagPattern.test(updatedContent)) {
        fileHasChanges = true;
        updatedContent = updatedContent.replace(openTagPattern, (match, p1) => {
          return `{{< ${shortcode}${p1} />}}`;
        });
      }
    });

    // If changes were made, save the file
    if (fileHasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      fixedFiles++;
      console.log(`Fixed shortcodes in: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${path.basename(filePath)}: ${error.message}`);
    errorFiles.push(path.basename(filePath));
  }
});

console.log(`\nCompleted shortcode fixes in ${fixedFiles} files`);
if (errorFiles.length > 0) {
  console.log(`Encountered errors in ${errorFiles.length} files: ${errorFiles.join(', ')}`);
}
