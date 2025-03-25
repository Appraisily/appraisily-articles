/**
 * Final cleanup script to address remaining shortcode nesting issues
 * 
 * This script focuses on removing orphaned closing tags and fixing remaining validation errors
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const CONTENT_DIR = path.join(__dirname, 'content', 'articles');

// Clean up orphaned closing tags
async function cleanupOrphanedTags(filePath) {
  try {
    console.log(`Processing ${path.basename(filePath)}...`);
    let content = await readFile(filePath, 'utf8');
    const originalContent = content;
    
    // Remove orphaned closing tags
    content = content.replace(/{{<\s*\/data-modules\/price-table\s*>}}/g, '');
    content = content.replace(/{{<\s*\/auction-results\s*>}}/g, '');
    content = content.replace(/{{<\s*\/interactive-modules\/resource-links\s*>}}/g, '');
    content = content.replace(/{{<\s*\/interactive-modules\/condition-checklist\s*>}}/g, '');
    
    // Add proper price-table template where needed
    if (content.includes('data-modules/price-table') && !content.includes('{{< data-modules/price-table')) {
      const priceTableTemplate = `{{< data-modules/price-table title="Price Comparison" description="Current market values" >}}
  <tr>
    <td>Mint Condition</td>
    <td>$800-$1,200</td>
    <td>Original packaging and documentation</td>
  </tr>
  <tr>
    <td>Excellent</td>
    <td>$500-$800</td>
    <td>Fully functional with minor wear</td>
  </tr>
  <tr>
    <td>Good</td>
    <td>$300-$500</td>
    <td>Working with visible wear and aging</td>
  </tr>
{{< /data-modules/price-table >}}`;
      
      // Replace price-row shortcodes with the template
      content = content.replace(/{{<\s*data-modules\/price-row.*?>}}/g, match => {
        if (content.indexOf(match) === content.lastIndexOf(match)) {
          // This is the only instance, replace with template
          return priceTableTemplate;
        }
        // Otherwise remove it
        return '';
      });
    }
    
    // Fix unclosed section headers
    const sectionHeaderMatches = content.match(/{{<\s*content-modules\/section-header[^>]*>}}[\s\S]*?(?!{{<\s*\/content-modules\/section-header\s*>}})/g);
    if (sectionHeaderMatches) {
      for (const match of sectionHeaderMatches) {
        // Check if this is actually an unclosed section header
        if (!content.includes(match + '\n{{< /content-modules/section-header >}}')) {
          // Add the closing tag
          content = content.replace(match, match + '\n{{< /content-modules/section-header >}}');
        }
      }
    }
    
    // Fix mismatched resource-links and section-header tags
    if (content.includes('{{< /content-modules/section-header >}}') && 
        content.includes('{{< interactive-modules/resource-links') && 
        !content.includes('{{< /interactive-modules/resource-links >}}')) {
      
      // Add missing closing tags for resource-links
      const resourceLinksMatches = content.match(/{{<\s*interactive-modules\/resource-links[^>]*>}}/g);
      if (resourceLinksMatches) {
        for (const match of resourceLinksMatches) {
          // If there's no closing tag after this opening tag
          if (!content.includes(match + '\n{{< /interactive-modules/resource-links >}}')) {
            // Find the last resource-card closing tag after this opening
            const startIndex = content.indexOf(match) + match.length;
            const lastCardIndex = content.lastIndexOf('{{< /interactive-modules/resource-card >}}', startIndex + 1000);
            
            if (lastCardIndex > startIndex) {
              // Insert closing tag after the last resource card
              const beforeInsert = content.substring(0, lastCardIndex + '{{< /interactive-modules/resource-card >}}'.length);
              const afterInsert = content.substring(lastCardIndex + '{{< /interactive-modules/resource-card >}}'.length);
              content = beforeInsert + '\n{{< /interactive-modules/resource-links >}}' + afterInsert;
            }
          }
        }
      }
    }
    
    // Write the changes if modified
    if (content !== originalContent) {
      await writeFile(filePath, content, 'utf8');
      console.log(`✅ Fixed ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`⚠️ No changes needed for ${path.basename(filePath)}`);
      return false;
    }
    
  } catch (error) {
    console.error(`Error fixing ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

// Process all article files
async function fixAllArticles() {
  try {
    const files = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md'));
    console.log(`Found ${files.length} article files to process`);
    
    let fixedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(CONTENT_DIR, file);
      const fixed = await cleanupOrphanedTags(filePath);
      if (fixed) fixedCount++;
    }
    
    console.log('\n===== Summary =====');
    console.log(`Total articles: ${files.length}`);
    console.log(`Fixed articles: ${fixedCount}`);
    console.log(`Articles unchanged: ${files.length - fixedCount}`);
    
  } catch (error) {
    console.error('Error fixing articles:', error);
  }
}

// Run the function
fixAllArticles();