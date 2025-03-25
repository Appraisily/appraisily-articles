/**
 * Targeted shortcode fixer for Appraisily articles
 * 
 * This script takes a more direct approach to fixing specific shortcode issues
 * by using pre-defined patterns for problematic constructs.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const CONTENT_DIR = path.join(__dirname, 'content', 'articles');

async function fixArticle(filePath) {
  try {
    console.log(`Processing ${path.basename(filePath)}...`);
    let content = await readFile(filePath, 'utf8');
    const originalContent = content;
    
    // 1. Fix stats-highlight (it should be self-closing with no content)
    // Before: {{< data-modules/stats-highlight title="..." >}}...
    // After: {{< data-modules/stats-highlight title="..." />}}
    content = content.replace(/{{<\s*data-modules\/stats-highlight([^>]*?)>}}/g, '{{< data-modules/stats-highlight$1 />}}');
    
    // 2. Remove any closing tags for stats-highlight
    content = content.replace(/{{<\s*\/data-modules\/stats-highlight\s*>}}/g, '');
    
    // 3. Fix checklist-item to be self-closing
    content = content.replace(/{{<\s*interactive-modules\/checklist-item([^>]*?)>}}/g, '{{< interactive-modules/checklist-item$1 />}}');
    
    // 4. Remove any closing tags for checklist-item
    content = content.replace(/{{<\s*\/interactive-modules\/checklist-item\s*>}}/g, '');
    
    // 5. Create proper resource-links sections by identifying groups of resource-card shortcodes
    const matches = [...content.matchAll(/{{<\s*interactive-modules\/resource-card[^>]*?>}}[\s\S]*?{{<\s*\/interactive-modules\/resource-card\s*>}}/g)];
    
    // Start from the end to avoid index shifting issues
    for (let i = matches.length - 1; i >= 0; i--) {
      let match = matches[i];
      const currentIndex = match.index;
      
      // Look for nearby matches - those that would be in the same group
      const groupMatches = [];
      groupMatches.push(match);
      
      // Look back to see if there are cards just before this one (within 500 chars)
      for (let j = i - 1; j >= 0; j--) {
        const prevMatch = matches[j];
        const prevMatchEnd = prevMatch.index + prevMatch[0].length;
        
        // If previous match is close to this one, they're in the same group
        if (currentIndex - prevMatchEnd < 500) {
          groupMatches.unshift(prevMatch); // Add to beginning of group
          i--; // Skip this match in the outer loop
        } else {
          break; // Too far away, different group
        }
      }
      
      // Look ahead to see if there are cards just after this one
      let nextIndex = i + 1;
      while (nextIndex < matches.length) {
        const nextMatch = matches[nextIndex];
        
        // If this match is close to the last one in our group
        const lastInGroup = groupMatches[groupMatches.length - 1];
        const lastMatchEnd = lastInGroup.index + lastInGroup[0].length;
        
        if (nextMatch.index - lastMatchEnd < 500) {
          groupMatches.push(nextMatch); // Add to end of group
          matches.splice(nextIndex, 1); // Remove from main matches array
          // Don't increment nextIndex since we removed an item
        } else {
          break; // Too far away, different group
        }
      }
      
      if (groupMatches.length > 0) {
        // We have a group, replace it with proper resource-links section
        const firstMatch = groupMatches[0];
        const lastMatch = groupMatches[groupMatches.length - 1];
        
        const startPos = firstMatch.index;
        const endPos = lastMatch.index + lastMatch[0].length;
        
        // Create the properly formatted replacement
        let replacement = '{{< interactive-modules/resource-links title="Additional Resources" columns="2" >}}\n';
        
        for (const m of groupMatches) {
          replacement += m[0] + '\n';
        }
        
        replacement += '{{< /interactive-modules/resource-links >}}';
        
        // Replace in content
        content = content.substring(0, startPos) + replacement + content.substring(endPos);
      }
    }
    
    // 6. Find any price-table with price-row inside and fix format
    content = content.replace(/{{<\s*data-modules\/price-table([^>]*?)>}}([\s\S]*?)(?:{{<\s*\/data-modules\/price-table\s*>}})?/g,
      (match, attrs, inner) => {
        // If it contains price-row shortcodes, convert them to HTML
        if (inner.includes('{{< data-modules/price-row')) {
          inner = inner.replace(/{{<\s*data-modules\/price-row\s+(?:category|item)="([^"]*?)"\s+(?:range|price)="([^"]*?)"\s+(?:notes|condition)="([^"]*?)"\s*(?:highlight="[^"]*")?\s*>}}/g,
            (rowMatch, item, price, notes) => {
              return `\n  <tr>
    <td>${item}</td>
    <td>${price}</td>
    <td>${notes}</td>
  </tr>`;
            });
        }
        
        // Ensure it has proper closing tag
        return `{{< data-modules/price-table${attrs} >}}${inner}\n{{< /data-modules/price-table >}}`;
      });
    
    // 7. Find any auction-results with auction-item inside and fix format
    content = content.replace(/{{<\s*auction-results([^>]*?)>}}([\s\S]*?)(?:{{<\s*\/auction-results\s*>}})?/g,
      (match, attrs, inner) => {
        // If it contains auction-item shortcodes, convert them to HTML
        if (inner.includes('{{< auction-item')) {
          inner = inner.replace(/{{<\s*auction-item\s+(?:item|title)="([^"]*?)"\s+(?:price|sold)="([^"]*?)"\s+date="([^"]*?)"\s+auctionHouse="([^"]*?)"\s*>}}/g,
            (itemMatch, item, price, date, auctionHouse) => {
              return `\n  <tr>
    <td>${item}</td>
    <td>${price}</td>
    <td>${date}</td>
    <td>${auctionHouse}</td>
  </tr>`;
            });
        }
        
        // Ensure it has proper closing tag
        return `{{< auction-results${attrs} >}}${inner}\n{{< /auction-results >}}`;
      });
    
    // 8. Make sure condition-checklist shortcodes are properly paired
    content = content.replace(/{{<\s*interactive-modules\/condition-checklist([^>]*?)>}}([\s\S]*?)(?:{{<\s*\/interactive-modules\/condition-checklist\s*>}})?/g,
      (match, attrs, inner) => {
        // Ensure it has proper closing tag
        return `{{< interactive-modules/condition-checklist${attrs} >}}${inner}\n{{< /interactive-modules/condition-checklist >}}`;
      });
    
    // 9. Fix malformed self-closing tags (stats-highlight with double slashes)
    content = content.replace(/{{<\s*data-modules\/stats-highlight([^>]*?)\s*\/\s*\/\s*>}}/g, '{{< data-modules/stats-highlight$1 />}}');
    
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