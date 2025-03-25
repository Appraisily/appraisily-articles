/**
 * Fix section header issues and unclosed shortcodes
 * 
 * This script addresses the remaining issues with section headers, unclosed shortcodes
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const CONTENT_DIR = path.join(__dirname, 'content', 'articles');

// Fix section headers and other remaining issues
async function fixArticle(filePath) {
  try {
    console.log(`Processing ${path.basename(filePath)}...`);
    let content = await readFile(filePath, 'utf8');
    const originalContent = content;
    
    // 1. Remove all section-header closing tags to prevent mismatches
    content = content.replace(/{{<\s*\/content-modules\/section-header\s*>}}/g, '');
    
    // 2. Remove all unclosed resource-links tags
    content = content.replace(/{{<\s*interactive-modules\/resource-links[^>]*>}}/g, '');
    
    // 3. Remove unclosed condition-checklist tags
    content = content.replace(/{{<\s*interactive-modules\/condition-checklist[^>]*>}}/g, '');
    
    // 4. Replace all section headers with simple markdown headings
    content = content.replace(/{{<\s*content-modules\/section-header\s+title="([^"]*)"[^>]*>}}[\s\S]*?(?={{<|##|\n\n)/g, (match, title) => {
      return `## ${title}\n\n`;
    });
    
    // 5. Replace any remaining price-row shortcodes
    content = content.replace(/{{<\s*data-modules\/price-row[^>]*>}}/g, '');
    
    // 6. Add template sections to ensure each article has properly formatted examples
    
    // Add stats-highlight template if none exists
    if (!content.includes('{{< data-modules/stats-highlight')) {
      const statsTemplate = `\n\n{{< data-modules/stats-highlight title="Key Statistics" columns="3" />}}

{{< data-modules/stat-card value="Value Stat" label="Primary Factor" color="blue" >}}
Detailed information about this statistic and why it matters.
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="Size Stat" label="Size Impact" color="green" >}}
How size affects value and what collectors should know.
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="Age Stat" label="Age Factor" color="purple" >}}
The relationship between age and value for these collectibles.
{{< /data-modules/stat-card >}}`;
      
      // Add after first ## heading
      const firstHeadingMatch = content.match(/^##\s+.+$/m);
      if (firstHeadingMatch) {
        const insertIndex = content.indexOf(firstHeadingMatch[0]) + firstHeadingMatch[0].length;
        content = content.substring(0, insertIndex) + statsTemplate + content.substring(insertIndex);
      } else {
        // Add near the top after front matter
        const frontMatterEnd = content.indexOf('---', 3) + 3;
        content = content.substring(0, frontMatterEnd) + statsTemplate + content.substring(frontMatterEnd);
      }
    }
    
    // Add resource-links template if none exists
    if (!content.includes('{{< interactive-modules/resource-links')) {
      const resourcesTemplate = `\n\n{{< interactive-modules/resource-links title="Additional Resources" columns="2" >}}
{{< interactive-modules/resource-card title="Official Website" url="https://example.com/official" type="tool" >}}
The official source for authentication and valuation information.
{{< /interactive-modules/resource-card >}}

{{< interactive-modules/resource-card title="Collector's Guide" url="https://example.com/guide" type="resource" >}}
Comprehensive reference guide for collectors with pricing information.
{{< /interactive-modules/resource-card >}}

{{< interactive-modules/resource-card title="Authentication Service" url="https://example.com/auth" type="service" >}}
Professional authentication and appraisal services for valuable items.
{{< /interactive-modules/resource-card >}}
{{< /interactive-modules/resource-links >}}`;
      
      // Add near the end of the article
      content += resourcesTemplate;
    }
    
    // Add price-table template if none exists
    if (!content.includes('{{< data-modules/price-table')) {
      const priceTableTemplate = `\n\n{{< data-modules/price-table title="Price Comparison" description="Current market values based on condition" >}}
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
      
      // Add after first stats-highlight section
      const statsHighlightIndex = content.indexOf('{{< data-modules/stats-highlight');
      if (statsHighlightIndex !== -1) {
        // Find the end of the stats-highlight section
        const statsEndIndex = content.indexOf('{{< /data-modules/stat-card >}}', statsHighlightIndex);
        if (statsEndIndex !== -1) {
          const insertIndex = statsEndIndex + '{{< /data-modules/stat-card >}}'.length;
          content = content.substring(0, insertIndex) + priceTableTemplate + content.substring(insertIndex);
        }
      }
    }
    
    // Add condition-checklist template if none exists
    if (!content.includes('{{< interactive-modules/condition-checklist')) {
      const checklistTemplate = `\n\n{{< interactive-modules/condition-checklist title="Condition Assessment" description="Check all items that apply to determine condition" >}}
{{< interactive-modules/checklist-item label="Original finish intact" />}}
{{< interactive-modules/checklist-item label="All components present and functional" />}}
{{< interactive-modules/checklist-item label="No visible damage or repairs" />}}
{{< interactive-modules/checklist-item label="Original documentation included" />}}
{{< /interactive-modules/condition-checklist >}}`;
      
      // Add before resource-links section if it exists
      const resourcesIndex = content.indexOf('{{< interactive-modules/resource-links');
      if (resourcesIndex !== -1) {
        content = content.substring(0, resourcesIndex) + checklistTemplate + '\n\n' + content.substring(resourcesIndex);
      } else {
        // Add near the end of the article
        content += checklistTemplate;
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
      const fixed = await fixArticle(filePath);
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