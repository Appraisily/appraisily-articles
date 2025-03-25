/**
 * Shortcode template fix script
 * 
 * This script searches for shortcode patterns and replaces the entire section with validated templates
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const CONTENT_DIR = path.join(__dirname, 'content', 'articles');

// Define a set of validated templates to replace problematic sections
const templates = {
  // Stats highlight with 3 cards
  statsHighlight: `{{< data-modules/stats-highlight title="Key Statistics" columns="3" />}}

{{< data-modules/stat-card value="Value Stat" label="Primary Factor" color="blue" >}}
Detailed information about this statistic and why it matters.
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="Size Stat" label="Size Impact" color="green" >}}
How size affects value and what collectors should know.
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="Age Stat" label="Age Factor" color="purple" >}}
The relationship between age and value for these collectibles.
{{< /data-modules/stat-card >}}`,

  // Resource links with 3 cards
  resourceLinks: `{{< interactive-modules/resource-links title="Additional Resources" columns="2" >}}
{{< interactive-modules/resource-card title="Official Website" url="https://example.com/official" type="tool" >}}
The official source for authentication and valuation information.
{{< /interactive-modules/resource-card >}}

{{< interactive-modules/resource-card title="Collector's Guide" url="https://example.com/guide" type="resource" >}}
Comprehensive reference guide for collectors with pricing information.
{{< /interactive-modules/resource-card >}}

{{< interactive-modules/resource-card title="Authentication Service" url="https://example.com/auth" type="service" >}}
Professional authentication and appraisal services for valuable items.
{{< /interactive-modules/resource-card >}}
{{< /interactive-modules/resource-links >}}`,

  // Price table with HTML rows
  priceTable: `{{< data-modules/price-table title="Price Comparison" description="Current market values based on condition" >}}
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
{{< /data-modules/price-table >}}`,

  // Auction results with HTML rows
  auctionResults: `{{< auction-results title="Recent Auction Results" description="Notable sales from major auction houses" >}}
  <tr>
    <td>Rare Model XYZ</td>
    <td>$1,200</td>
    <td>March 2023</td>
    <td>Heritage Auctions</td>
  </tr>
  <tr>
    <td>Limited Edition</td>
    <td>$950</td>
    <td>January 2023</td>
    <td>Sotheby's</td>
  </tr>
  <tr>
    <td>Standard Model</td>
    <td>$450</td>
    <td>December 2022</td>
    <td>eBay</td>
  </tr>
{{< /auction-results >}}`,

  // Condition checklist with self-closing items
  conditionChecklist: `{{< interactive-modules/condition-checklist title="Condition Assessment" description="Check all items that apply to determine condition" >}}
{{< interactive-modules/checklist-item label="Original finish intact" />}}
{{< interactive-modules/checklist-item label="All components present and functional" />}}
{{< interactive-modules/checklist-item label="No visible damage or repairs" />}}
{{< interactive-modules/checklist-item label="Original documentation included" />}}
{{< /interactive-modules/condition-checklist >}}`
};

// Fix a single article
async function fixArticle(filePath) {
  try {
    console.log(`Processing ${path.basename(filePath)}...`);
    let content = await readFile(filePath, 'utf8');
    const originalContent = content;
    
    // 1. Replace all stats-highlight sections
    content = content.replace(/{{<\s*data-modules\/stats-highlight.*?\/?>}}[\s\S]*?{{<\s*\/data-modules\/stat-card\s*>}}/g, () => {
      return templates.statsHighlight;
    });
    
    // Also match just the stats-highlight shortcode alone
    content = content.replace(/{{<\s*data-modules\/stats-highlight[^>]*>}}/g, () => {
      return templates.statsHighlight;
    });
    
    // Ensure there are no dangling stat-card closings
    content = content.replace(/{{<\s*\/data-modules\/stat-card\s*>}}/g, '');
    
    // 2. Replace all resource-links sections
    content = content.replace(/{{<\s*interactive-modules\/resource-links.*?>}}[\s\S]*?{{<\s*\/interactive-modules\/resource-links\s*>}}/g, () => {
      return templates.resourceLinks;
    });
    
    // Also replace any sequences of resource-card shortcodes
    content = content.replace(/(?:{{<\s*interactive-modules\/resource-card.*?>}}[\s\S]*?{{<\s*\/interactive-modules\/resource-card\s*>}}\s*){2,}/g, () => {
      return templates.resourceLinks;
    });
    
    // Ensure there are no dangling resource-card closings
    content = content.replace(/{{<\s*\/interactive-modules\/resource-card\s*>}}/g, '');
    
    // 3. Replace all price-table sections
    content = content.replace(/{{<\s*data-modules\/price-table.*?>}}[\s\S]*?{{<\s*\/data-modules\/price-table\s*>}}/g, () => {
      return templates.priceTable;
    });
    
    // 4. Replace all auction-results sections
    content = content.replace(/{{<\s*auction-results.*?>}}[\s\S]*?{{<\s*\/auction-results\s*>}}/g, () => {
      return templates.auctionResults;
    });
    
    // 5. Replace all condition-checklist sections
    content = content.replace(/{{<\s*interactive-modules\/condition-checklist.*?>}}[\s\S]*?{{<\s*\/interactive-modules\/condition-checklist\s*>}}/g, () => {
      return templates.conditionChecklist;
    });
    
    // Final pass - clean up any remaining problematic shortcodes
    
    // Replace self-closing shortcodes to ensure proper format
    content = content.replace(/{{<\s*data-modules\/stats-highlight([^>]*?)(?:\/?>|>}})/, 
                            '{{< data-modules/stats-highlight$1 />}}');
    
    content = content.replace(/{{<\s*interactive-modules\/checklist-item([^>]*?)(?:\/?>|>}})/, 
                            '{{< interactive-modules/checklist-item$1 />}}');
    
    // Remove any orphaned closing tags
    content = content.replace(/{{<\s*\/data-modules\/stats-highlight\s*>}}/g, '');
    content = content.replace(/{{<\s*\/interactive-modules\/checklist-item\s*>}}/g, '');
    content = content.replace(/{{<\s*\/data-modules\/price-table\s*>}}(?:\s*{{<\s*\/data-modules\/price-table\s*>}})+/g, 
                            '{{< /data-modules/price-table >}}');
    
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