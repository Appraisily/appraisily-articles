/**
 * Automatic shortcode fixer for Appraisily articles
 * 
 * This script scans all markdown files in the content/articles directory
 * and fixes common shortcode issues:
 * 
 * 1. Converts non-self-closing shortcodes to self-closing format where required
 * 2. Fixes mismatched opening/closing tags for resource links and stat cards
 * 3. Converts deprecated shortcodes to direct HTML table rows
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);

const CONTENT_DIR = path.join(__dirname, 'content', 'articles');

// Fix stats-highlight and stat-card blocks
function fixStatsSection(content) {
  // First, pattern to find stats-highlight sections
  const statsPattern = /{{<\s*data-modules\/stats-highlight\s+([^>]*?)>}}([\s\S]*?)(?:{{<\s*\/data-modules\/stats-highlight\s*>}})?/g;
  
  content = content.replace(statsPattern, (match, attributes, innerContent) => {
    // Convert to self-closing stats-highlight
    let result = `{{< data-modules/stats-highlight ${attributes} />}}`;
    
    // Extract and fix each stat-card
    const statCardRegex = /{{<\s*data-modules\/stat-card\s+([^>]*?)>}}([\s\S]*?){{<\s*\/data-modules\/stat-card\s*>}}/g;
    let cardMatch;
    
    while ((cardMatch = statCardRegex.exec(innerContent)) !== null) {
      const cardAttrs = cardMatch[1];
      const cardContent = cardMatch[2].trim();
      
      // Add each stat-card as a standalone shortcode
      result += `\n  {{< data-modules/stat-card ${cardAttrs} >}}
    ${cardContent}
  {{< /data-modules/stat-card >}}`;
    }
    
    return result;
  });
  
  return content;
}

// Completely rebuild resource-links sections
function fixResourceLinks(content) {
  // First, remove any existing resource-links wrappers
  content = content.replace(/{{<\s*interactive-modules\/resource-links\s+([^>]*?)>}}([\s\S]*?){{<\s*\/interactive-modules\/resource-links\s*>}}/g, (match, attrs, inner) => inner);
  
  // Find all resource-card blocks
  const resourceCards = [];
  const resourceCardRegex = /{{<\s*interactive-modules\/resource-card\s+([^>]*?)>}}([\s\S]*?){{<\s*\/interactive-modules\/resource-card\s*>}}/g;
  let cardMatch;
  
  while ((cardMatch = resourceCardRegex.exec(content)) !== null) {
    resourceCards.push({
      fullMatch: cardMatch[0],
      attributes: cardMatch[1],
      content: cardMatch[2].trim(),
      index: cardMatch.index
    });
  }
  
  // Group resource cards by proximity
  const groupedCards = [];
  let currentGroup = [];
  
  for (let i = 0; i < resourceCards.length; i++) {
    if (i === 0 || resourceCards[i].index - (resourceCards[i-1].index + resourceCards[i-1].fullMatch.length) < 100) {
      // Part of current group (cards are close together)
      currentGroup.push(resourceCards[i]);
    } else {
      // Start a new group
      if (currentGroup.length > 0) {
        groupedCards.push([...currentGroup]);
      }
      currentGroup = [resourceCards[i]];
    }
  }
  
  // Add the last group
  if (currentGroup.length > 0) {
    groupedCards.push(currentGroup);
  }
  
  // Replace each group with a properly wrapped section
  for (const group of groupedCards) {
    if (group.length > 0) {
      const firstCard = group[0];
      const lastCard = group[group.length - 1];
      
      // Build the replacement with proper wrapper
      let replacement = `{{< interactive-modules/resource-links title="Additional Resources" columns="2" >}}\n`;
      
      // Add each card in the group
      for (const card of group) {
        replacement += `  ${card.fullMatch}\n`;
      }
      
      replacement += `{{< /interactive-modules/resource-links >}}`;
      
      // Replace the whole group in the content
      const startPos = firstCard.index;
      const endPos = lastCard.index + lastCard.fullMatch.length;
      const beforeGroup = content.substring(0, startPos);
      const afterGroup = content.substring(endPos);
      
      content = beforeGroup + replacement + afterGroup;
      
      // Update regex indices for future matches since we modified the content
      resourceCardRegex.lastIndex = startPos + replacement.length;
    }
  }
  
  return content;
}

// Fix checklist-item blocks
function fixChecklistItem(content) {
  // Pattern: Find non-self-closing checklist-item tags
  const checklistPattern = /{{<\s*interactive-modules\/checklist-item\s+([^>]*?)>}}/g;
  content = content.replace(checklistPattern, '{{< interactive-modules/checklist-item $1 />}}');
  
  // Remove any closing checklist-item tags
  content = content.replace(/{{<\s*\/interactive-modules\/checklist-item\s*>}}/g, '');
  
  return content;
}

// Fix price-table with price-row shortcodes
function fixPriceTables(content) {
  // First, find all price-table sections
  const priceTableRegex = /{{<\s*data-modules\/price-table\s+([^>]*?)>}}([\s\S]*?)(?:{{<\s*\/data-modules\/price-table\s*>}})?/g;
  
  content = content.replace(priceTableRegex, (match, attributes, innerContent) => {
    // Start with the opening tag
    let result = `{{< data-modules/price-table ${attributes} >}}`;
    
    // Convert price-rows to HTML table rows if present
    if (innerContent.includes('{{< data-modules/price-row')) {
      innerContent = innerContent.replace(/{{<\s*data-modules\/price-row\s+(?:category|item)="([^"]*?)"\s+(?:range|price)="([^"]*?)"\s+(?:notes|condition)="([^"]*?)"\s*(?:highlight="[^"]*")?\s*>}}/g, 
        (match, item, price, notes) => {
          return `\n  <tr>
    <td>${item}</td>
    <td>${price}</td>
    <td>${notes}</td>
  </tr>`;
        }
      );
    }
    
    // Add the inner content (possibly modified) and closing tag
    result += innerContent + "\n{{< /data-modules/price-table >}}";
    
    return result;
  });
  
  return content;
}

// Fix auction-results with auction-item shortcodes
function fixAuctionResults(content) {
  // Find all auction-results sections
  const auctionRegex = /{{<\s*auction-results\s+([^>]*?)>}}([\s\S]*?)(?:{{<\s*\/auction-results\s*>}})?/g;
  
  content = content.replace(auctionRegex, (match, attributes, innerContent) => {
    // Start with the opening tag
    let result = `{{< auction-results ${attributes} >}}`;
    
    // Convert auction-items to HTML table rows if present
    if (innerContent.includes('{{< auction-item')) {
      innerContent = innerContent.replace(/{{<\s*auction-item\s+(?:item|title)="([^"]*?)"\s+(?:price|sold)="([^"]*?)"\s+date="([^"]*?)"\s+auctionHouse="([^"]*?)"\s*>}}/g, 
        (match, item, price, date, auctionHouse) => {
          return `\n  <tr>
    <td>${item}</td>
    <td>${price}</td>
    <td>${date}</td>
    <td>${auctionHouse}</td>
  </tr>`;
        }
      );
    }
    
    // Add the inner content (possibly modified) and closing tag
    result += innerContent + "\n{{< /auction-results >}}";
    
    return result;
  });
  
  return content;
}

// Fix condition-checklist blocks
function fixConditionChecklist(content) {
  // Find all condition-checklist sections
  const checklistRegex = /{{<\s*interactive-modules\/condition-checklist\s+([^>]*?)>}}([\s\S]*?)(?:{{<\s*\/interactive-modules\/condition-checklist\s*>}})?/g;
  
  content = content.replace(checklistRegex, (match, attributes, innerContent) => {
    // Start with the opening tag
    let result = `{{< interactive-modules/condition-checklist ${attributes} >}}`;
    
    // Add the inner content (items will be fixed separately) and closing tag
    result += innerContent + "\n{{< /interactive-modules/condition-checklist >}}";
    
    return result;
  });
  
  return content;
}

// Main fix function
async function fixArticle(filePath) {
  try {
    console.log(`Processing ${path.basename(filePath)}...`);
    let content = await readFile(filePath, 'utf8');
    const originalContent = content;
    
    // Fix stats-highlight and stat-card blocks
    content = fixStatsSection(content);
    
    // Fix resource-links blocks
    content = fixResourceLinks(content);
    
    // Fix checklist-item blocks
    content = fixChecklistItem(content);
    
    // Fix price-table with price-row shortcodes
    content = fixPriceTables(content);
    
    // Fix auction-results with auction-item shortcodes
    content = fixAuctionResults(content);
    
    // Fix condition-checklist blocks
    content = fixConditionChecklist(content);
    
    // Only write file if changes were made
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