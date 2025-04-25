const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// List of files with shortcode errors from the validation output
const filesWithErrors = [
  'content/articles/antique-cast-iron-trivets-value.md',
  'content/articles/antique-furniture-appraiser-near-me.md',
  'content/articles/antique-irons-value.md',
  'content/articles/antique-vanity-with-round-mirror-value.md',
  'content/articles/artwork-value-estimate.md',
  'content/articles/identification-rare-vintage-corningware-patterns.md',
  'content/articles/indian-fire-starter-rock-value.md',
  'content/articles/old-glass-bottle-identification.md',
  'content/articles/old-milk-bottle-identification.md',
  'content/articles/old-pulsar-watches-value.md',
  'content/articles/old-wooden-rocking-horse-value.md',
  'content/articles/pre-columbian-art-value.md',
  'content/articles/value-of-antique-trunks.md'
];

// Function to fix shortcodes in a file
function fixShortcodes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Fix stats-highlight shortcode - change closing tag pattern and add missing closing tag
    let updatedContent = content.replace(
      /{{< data-modules\/stats-highlight ([^>]*)\/? >}}/g, 
      '{{< data-modules/stats-highlight $1>}}'
    );
    
    // Add missing closing tag if needed
    if (!updatedContent.includes('{{< /data-modules/stats-highlight >}}')) {
      updatedContent = updatedContent.replace(
        /{{< data-modules\/stats-highlight [^>]*>}}([\s\S]*?){{< data-modules\/stat-card [^>]*>}}[\s\S]*?{{< \/data-modules\/stat-card >}}[\s\S]*?{{< data-modules\/stat-card [^>]*>}}[\s\S]*?{{< \/data-modules\/stat-card >}}[\s\S]*?{{< data-modules\/stat-card [^>]*>}}[\s\S]*?{{< \/data-modules\/stat-card >}}(\s*?)(\n\s*?\n)/,
        '{{< data-modules/stats-highlight $1>}}$2{{< data-modules/stat-card $3>}}$4{{< /data-modules/stat-card >}}$5{{< data-modules/stat-card $6>}}$7{{< /data-modules/stat-card >}}$8{{< data-modules/stat-card $9>}}$10{{< /data-modules/stat-card >}}$11{{< /data-modules/stats-highlight >}}$12$13'
      );
    }
    
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Fixed shortcodes in ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error fixing shortcodes in ${filePath}:`, error.message);
    return false;
  }
}

// Main function to process all files
function main() {
  let successCount = 0;
  
  for (const file of filesWithErrors) {
    // Skip if file doesn't exist
    if (!fs.existsSync(file)) {
      console.log(`Skipping ${file} - file not found`);
      continue;
    }
    
    if (fixShortcodes(file)) {
      successCount++;
    }
  }
  
  console.log(`Fixed shortcodes in ${successCount} out of ${filesWithErrors.length} files`);
}

// Run the main function
main();
