const fs = require(\"fs\");
const path = require(\"path\");

// Function to fix malformed shortcodes
function fixMalformedShortcodes(content) {
  // Fix checklist-item shortcodes with / />
  return content.replace(/{{< interactive-modules\/checklist-item (.*?)\/\s+\/>}}/g, 
                        \"{{< interactive-modules/checklist-item $1/>}}\");
}

// Process all markdown files in the articles directory
const articlesDir = path.join(__dirname, \"content\", \"articles\");
const files = fs.readdirSync(articlesDir);

files.forEach(file => {
  if (file.endsWith(\".md\")) {
    const filePath = path.join(articlesDir, file);
    const content = fs.readFileSync(filePath, \"utf8\");
    const fixedContent = fixMalformedShortcodes(content);
    
    if (content \!== fixedContent) {
      console.log(`Fixing shortcodes in ${file}`);
      fs.writeFileSync(filePath, fixedContent, \"utf8\");
    }
  }
});

console.log(\"Shortcode fixes completed\!\");
