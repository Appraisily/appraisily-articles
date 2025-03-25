/**
 * Manual fix script that completely rewrites problematic sections
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const templates = require('./model-templates');

const CONTENT_DIR = path.join(__dirname, 'content', 'articles');

// Fix stats-highlight section with a known-good template
function fixStatsHighlightSection(content) {
  // Find stats-highlight sections
  const regex = /{{<\s*data-modules\/stats-highlight.*?\/?>}}[\s\S]*?{{<\s*\/data-modules\/stat-card\s*>}}/g;
  
  return content.replace(regex, match => {
    // Extract title if available
    const titleMatch = match.match(/title="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : "Key Statistics";
    
    // Extract stat cards if possible
    const statCards = [];
    const statCardRegex = /{{<\s*data-modules\/stat-card\s+value="([^"]+)"\s+label="([^"]+)"\s+color="([^"]+)"\s*>}}([\s\S]*?){{<\s*\/data-modules\/stat-card\s*>}}/g;
    
    let cardMatch;
    while ((cardMatch = statCardRegex.exec(match)) !== null) {
      statCards.push({
        value: cardMatch[1],
        label: cardMatch[2],
        color: cardMatch[3],
        content: cardMatch[4].trim()
      });
    }
    
    // If we found stat cards, create a proper template
    if (statCards.length > 0) {
      let template = templates.statsHighlightTemplate;
      template = template.replace('KEY_TITLE', title);
      
      // Replace stat placeholders with actual values
      for (let i = 0; i < Math.min(statCards.length, 3); i++) {
        const card = statCards[i];
        template = template.replace(`STAT_${i+1}_VALUE`, card.value);
        template = template.replace(`STAT_${i+1}_LABEL`, card.label);
        template = template.replace(`STAT_${i+1}_CONTENT`, card.content);
      }
      
      return template;
    }
    
    // Fallback to a simple self-closing stats-highlight
    return `{{< data-modules/stats-highlight title="${title}" columns="3" />}}`;
  });
}

// Fix resource links with a known-good template
function fixResourceLinks(content) {
  // First, remove all resource-links wrappers but keep the cards
  content = content.replace(/{{<\s*interactive-modules\/resource-links.*?>}}([\s\S]*?){{<\s*\/interactive-modules\/resource-links\s*>}}/g, '$1');
  
  // Now find all resource card groups and replace them with properly wrapped versions
  const resourceCardPattern = /{{<\s*interactive-modules\/resource-card\s+title="([^"]+)"\s+url="([^"]+)"[^>]*>}}([\s\S]*?){{<\s*\/interactive-modules\/resource-card\s*>}}/g;
  
  // Collect all resource cards
  const resourceCards = [];
  let match;
  while ((match = resourceCardPattern.exec(content)) !== null) {
    resourceCards.push({
      title: match[1],
      url: match[2],
      content: match[3].trim(),
      fullMatch: match[0],
      index: match.index
    });
  }
  
  // Group cards by proximity (within 500 chars)
  const groups = [];
  let currentGroup = [];
  
  for (let i = 0; i < resourceCards.length; i++) {
    if (i === 0 || (resourceCards[i].index - (resourceCards[i-1].index + resourceCards[i-1].fullMatch.length) < 500)) {
      currentGroup.push(resourceCards[i]);
    } else {
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
      }
      currentGroup = [resourceCards[i]];
    }
  }
  
  // Add the last group if not empty
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  
  // Process each group
  for (const group of groups) {
    if (group.length > 0) {
      // Create a proper resource-links section
      let replacementSection = '{{< interactive-modules/resource-links title="Additional Resources" columns="2" >}}\n';
      
      for (const card of group) {
        replacementSection += `{{< interactive-modules/resource-card title="${card.title}" url="${card.url}" type="resource" >}}
  ${card.content}
{{< /interactive-modules/resource-card >}}\n`;
      }
      
      replacementSection += '{{< /interactive-modules/resource-links >}}';
      
      // Replace the first card with the entire section
      const firstCard = group[0];
      content = content.replace(firstCard.fullMatch, replacementSection);
      
      // Remove the other cards in this group (since they're now in the section)
      for (let i = 1; i < group.length; i++) {
        content = content.replace(group[i].fullMatch, '');
      }
    }
  }
  
  return content;
}

// Fix price tables and auction results
function fixTables(content) {
  // Fix price tables with price-row shortcodes
  content = content.replace(/{{<\s*data-modules\/price-table[^>]*>}}[\s\S]*?{{<\s*\/data-modules\/price-table\s*>}}/g, match => {
    // Extract title if available
    const titleMatch = match.match(/title="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : "Price Ranges";
    
    // Extract description if available
    const descMatch = match.match(/description="([^"]+)"/);
    const description = descMatch ? descMatch[1] : "Average market values";
    
    // Extract rows if possible
    let rows = '';
    
    // Check for existing HTML table rows
    const tableRowRegex = /<tr>[\s\S]*?<\/tr>/g;
    let rowMatches = match.match(tableRowRegex);
    
    if (rowMatches) {
      rows = rowMatches.join('\n  ');
    } else {
      // Look for price-row shortcodes
      const priceRowRegex = /{{<\s*data-modules\/price-row\s+(?:category|item)="([^"]+)"\s+(?:range|price)="([^"]+)"\s+(?:notes|condition)="([^"]+)"[^>]*>}}/g;
      
      let rowMatch;
      while ((rowMatch = priceRowRegex.exec(match)) !== null) {
        rows += `  <tr>
    <td>${rowMatch[1]}</td>
    <td>${rowMatch[2]}</td>
    <td>${rowMatch[3]}</td>
  </tr>\n`;
      }
    }
    
    // If we found rows, create a proper price table
    if (rows) {
      return `{{< data-modules/price-table title="${title}" description="${description}" >}}
${rows}{{< /data-modules/price-table >}}`;
    }
    
    // Fallback to an empty price table
    return `{{< data-modules/price-table title="${title}" description="${description}" >}}
  <tr>
    <td>Example Item</td>
    <td>$100-$200</td>
    <td>Sample condition note</td>
  </tr>
{{< /data-modules/price-table >}}`;
  });
  
  // Fix auction results with auction-item shortcodes
  content = content.replace(/{{<\s*auction-results[^>]*>}}[\s\S]*?{{<\s*\/auction-results\s*>}}/g, match => {
    // Extract title if available
    const titleMatch = match.match(/title="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : "Recent Auction Results";
    
    // Extract description if available
    const descMatch = match.match(/description="([^"]+)"/);
    const description = descMatch ? descMatch[1] : "Notable auction sales";
    
    // Extract rows if possible
    let rows = '';
    
    // Check for existing HTML table rows
    const tableRowRegex = /<tr>[\s\S]*?<\/tr>/g;
    let rowMatches = match.match(tableRowRegex);
    
    if (rowMatches) {
      rows = rowMatches.join('\n  ');
    } else {
      // Look for auction-item shortcodes
      const auctionItemRegex = /{{<\s*auction-item\s+(?:item|title)="([^"]+)"\s+(?:price|sold)="([^"]+)"\s+date="([^"]+)"\s+auctionHouse="([^"]+)"[^>]*>}}/g;
      
      let rowMatch;
      while ((rowMatch = auctionItemRegex.exec(match)) !== null) {
        rows += `  <tr>
    <td>${rowMatch[1]}</td>
    <td>${rowMatch[2]}</td>
    <td>${rowMatch[3]}</td>
    <td>${rowMatch[4]}</td>
  </tr>\n`;
      }
    }
    
    // If we found rows, create a proper auction results table
    if (rows) {
      return `{{< auction-results title="${title}" description="${description}" >}}
${rows}{{< /auction-results >}}`;
    }
    
    // Fallback to an empty auction results table
    return `{{< auction-results title="${title}" description="${description}" >}}
  <tr>
    <td>Example Item</td>
    <td>$1,000</td>
    <td>January 2024</td>
    <td>Sample Auction House</td>
  </tr>
{{< /auction-results >}}`;
  });
  
  return content;
}

// Fix condition checklists
function fixConditionChecklists(content) {
  // Fix condition-checklist with checklist-item shortcodes
  content = content.replace(/{{<\s*interactive-modules\/condition-checklist[^>]*>}}[\s\S]*?{{<\s*\/interactive-modules\/condition-checklist\s*>}}/g, match => {
    // Extract title if available
    const titleMatch = match.match(/title="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : "Condition Assessment Checklist";
    
    // Extract description if available
    const descMatch = match.match(/description="([^"]+)"/);
    const description = descMatch ? descMatch[1] : "Check all items that apply";
    
    // Extract items if possible
    let items = '';
    
    // Look for checklist-item shortcodes
    const itemRegex = /{{<\s*interactive-modules\/checklist-item\s+label="([^"]+)"[^>]*\/?>}}/g;
    
    let itemMatch;
    while ((itemMatch = itemRegex.exec(match)) !== null) {
      items += `{{< interactive-modules/checklist-item label="${itemMatch[1]}" />}}\n`;
    }
    
    // If we found items, create a proper checklist
    if (items) {
      return `{{< interactive-modules/condition-checklist title="${title}" description="${description}" >}}
${items}{{< /interactive-modules/condition-checklist >}}`;
    }
    
    // Fallback to a basic checklist with sample items
    return `{{< interactive-modules/condition-checklist title="${title}" description="${description}" >}}
{{< interactive-modules/checklist-item label="Item 1" />}}
{{< interactive-modules/checklist-item label="Item 2" />}}
{{< interactive-modules/checklist-item label="Item 3" />}}
{{< /interactive-modules/condition-checklist >}}`;
  });
  
  return content;
}

// Fix an article
async function fixArticle(filePath) {
  try {
    console.log(`Processing ${path.basename(filePath)}...`);
    let content = await readFile(filePath, 'utf8');
    const originalContent = content;
    
    // Fix stats highlight sections
    content = fixStatsHighlightSection(content);
    
    // Fix resource links
    content = fixResourceLinks(content);
    
    // Fix price tables and auction results
    content = fixTables(content);
    
    // Fix condition checklists
    content = fixConditionChecklists(content);
    
    // Fix problematic self-closing tags
    content = content.replace(/{{<([^>]*)\/\/([^>]*)>}}/g, '{{<$1/$2>}}');
    
    // Fix any remaining checklist-item tags that should be self-closing
    content = content.replace(/{{<\s*interactive-modules\/checklist-item\s+([^>]*)>}}/g, '{{< interactive-modules/checklist-item $1 />}}');
    content = content.replace(/{{<\s*\/interactive-modules\/checklist-item\s*>}}/g, '');
    
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