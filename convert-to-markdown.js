/**
 * Convert shortcodes to regular markdown
 * 
 * This script converts all complex shortcodes to simple markdown
 * for compatibility with the build process
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
    
    // Replace resource-links section with markdown
    content = content.replace(/{{<\s*interactive-modules\/resource-links[^>]*>}}[\s\S]*?{{<\s*\/interactive-modules\/resource-links\s*>}}/g, 
      match => {
        // Extract title if available
        const titleMatch = match.match(/title="([^"]+)"/);
        const title = titleMatch ? titleMatch[1] : "Additional Resources";
        
        // Extract resource cards
        const resourceCards = [];
        const resourceCardRegex = /{{<\s*interactive-modules\/resource-card\s+title="([^"]+)"\s+url="([^"]+)"[^>]*>}}([\s\S]*?){{<\s*\/interactive-modules\/resource-card\s*>}}/g;
        
        let cardMatch;
        while ((cardMatch = resourceCardRegex.exec(match)) !== null) {
          resourceCards.push({
            title: cardMatch[1],
            url: cardMatch[2],
            description: cardMatch[3].trim()
          });
        }
        
        // Create markdown list
        let markdown = `## ${title}\n\n`;
        
        for (const card of resourceCards) {
          markdown += `- [${card.title}](${card.url}) - ${card.description}\n`;
        }
        
        return markdown;
      }
    );
    
    // Replace stats-highlight with markdown
    content = content.replace(/{{<\s*data-modules\/stats-highlight[^>]*>}}[\s\S]*?{{<\s*\/data-modules\/stat-card\s*>}}/g, 
      match => {
        // Extract title if available
        const titleMatch = match.match(/title="([^"]+)"/);
        const title = titleMatch ? titleMatch[1] : "Key Statistics";
        
        // Extract stat cards
        const statCards = [];
        const statCardRegex = /{{<\s*data-modules\/stat-card\s+value="([^"]+)"\s+label="([^"]+)"[^>]*>}}([\s\S]*?){{<\s*\/data-modules\/stat-card\s*>}}/g;
        
        let cardMatch;
        while ((cardMatch = statCardRegex.exec(match)) !== null) {
          statCards.push({
            value: cardMatch[1],
            label: cardMatch[2],
            description: cardMatch[3].trim()
          });
        }
        
        // Create markdown list
        let markdown = `## ${title}\n\n`;
        
        for (const card of statCards) {
          markdown += `**${card.value} - ${card.label}**: ${card.description}\n\n`;
        }
        
        return markdown;
      }
    );
    
    // Replace price-table with markdown
    content = content.replace(/{{<\s*data-modules\/price-table[^>]*>}}[\s\S]*?{{<\s*\/data-modules\/price-table\s*>}}/g, 
      match => {
        // Extract title if available
        const titleMatch = match.match(/title="([^"]+)"/);
        const title = titleMatch ? titleMatch[1] : "Price Comparison";
        
        // Extract description if available
        const descMatch = match.match(/description="([^"]+)"/);
        const description = descMatch ? descMatch[1] : "";
        
        // Extract table rows
        const rows = [];
        const rowRegex = /<tr>[\s\S]*?<\/tr>/g;
        
        let rowMatch;
        while ((rowMatch = rowRegex.exec(match)) !== null) {
          // Extract cells
          const cells = [];
          const cellRegex = /<td>([\s\S]*?)<\/td>/g;
          
          let cellMatch;
          while ((cellMatch = cellRegex.exec(rowMatch[0])) !== null) {
            cells.push(cellMatch[1]);
          }
          
          if (cells.length > 0) {
            rows.push(cells);
          }
        }
        
        // If no HTML table rows found, try to find price-row shortcodes
        if (rows.length === 0) {
          const priceRowRegex = /{{<\s*data-modules\/price-row\s+(?:category|item)="([^"]+)"\s+(?:range|price)="([^"]+)"\s+(?:notes|condition)="([^"]+)"[^>]*>}}/g;
          
          let rowMatch;
          while ((rowMatch = priceRowRegex.exec(match)) !== null) {
            rows.push([rowMatch[1], rowMatch[2], rowMatch[3]]);
          }
        }
        
        // Create markdown table
        let markdown = `## ${title}\n\n`;
        
        if (description) {
          markdown += `${description}\n\n`;
        }
        
        if (rows.length > 0) {
          // Add header
          markdown += `| Category | Price | Notes |\n|----------|-------|-------|\n`;
          
          // Add rows
          for (const row of rows) {
            markdown += `| ${row[0]} | ${row[1]} | ${row[2]} |\n`;
          }
        } else {
          markdown += "_No price data available_\n\n";
        }
        
        return markdown;
      }
    );
    
    // Replace auction-results with markdown
    content = content.replace(/{{<\s*auction-results[^>]*>}}[\s\S]*?{{<\s*\/auction-results\s*>}}/g, 
      match => {
        // Extract title if available
        const titleMatch = match.match(/title="([^"]+)"/);
        const title = titleMatch ? titleMatch[1] : "Auction Results";
        
        // Extract description if available
        const descMatch = match.match(/description="([^"]+)"/);
        const description = descMatch ? descMatch[1] : "";
        
        // Extract table rows
        const rows = [];
        const rowRegex = /<tr>[\s\S]*?<\/tr>/g;
        
        let rowMatch;
        while ((rowMatch = rowRegex.exec(match)) !== null) {
          // Extract cells
          const cells = [];
          const cellRegex = /<td>([\s\S]*?)<\/td>/g;
          
          let cellMatch;
          while ((cellMatch = cellRegex.exec(rowMatch[0])) !== null) {
            cells.push(cellMatch[1]);
          }
          
          if (cells.length > 0) {
            rows.push(cells);
          }
        }
        
        // If no HTML table rows found, try to find auction-item shortcodes
        if (rows.length === 0) {
          const auctionItemRegex = /{{<\s*auction-item\s+(?:item|title)="([^"]+)"\s+(?:price|sold)="([^"]+)"\s+date="([^"]+)"\s+auctionHouse="([^"]+)"[^>]*>}}/g;
          
          let itemMatch;
          while ((itemMatch = auctionItemRegex.exec(match)) !== null) {
            rows.push([itemMatch[1], itemMatch[2], itemMatch[3], itemMatch[4]]);
          }
        }
        
        // Create markdown table
        let markdown = `## ${title}\n\n`;
        
        if (description) {
          markdown += `${description}\n\n`;
        }
        
        if (rows.length > 0) {
          // Add header
          markdown += `| Item | Price | Date | Auction House |\n|------|-------|------|---------------|\n`;
          
          // Add rows
          for (const row of rows) {
            markdown += `| ${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} |\n`;
          }
        } else {
          markdown += "_No auction data available_\n\n";
        }
        
        return markdown;
      }
    );
    
    // Replace condition-checklist with markdown
    content = content.replace(/{{<\s*interactive-modules\/condition-checklist[^>]*>}}[\s\S]*?{{<\s*\/interactive-modules\/condition-checklist\s*>}}/g, 
      match => {
        // Extract title if available
        const titleMatch = match.match(/title="([^"]+)"/);
        const title = titleMatch ? titleMatch[1] : "Condition Assessment";
        
        // Extract description if available
        const descMatch = match.match(/description="([^"]+)"/);
        const description = descMatch ? descMatch[1] : "";
        
        // Extract checklist items
        const items = [];
        const itemRegex = /{{<\s*interactive-modules\/checklist-item\s+label="([^"]+)"[^>]*\/?>}}/g;
        
        let itemMatch;
        while ((itemMatch = itemRegex.exec(match)) !== null) {
          items.push(itemMatch[1]);
        }
        
        // Create markdown list
        let markdown = `## ${title}\n\n`;
        
        if (description) {
          markdown += `${description}\n\n`;
        }
        
        if (items.length > 0) {
          for (const item of items) {
            markdown += `- [ ] ${item}\n`;
          }
        } else {
          markdown += "_No checklist items available_\n\n";
        }
        
        return markdown;
      }
    );
    
    // Replace hero-image with markdown
    content = content.replace(/{{<\s*visual-modules\/hero-image\s+src="([^"]+)"\s+alt="([^"]+)"(?:\s+caption="([^"]*)")?\s+[^>]*>}}/g, 
      (match, src, alt, caption) => {
        let markdown = `![${alt}](${src})`;
        
        if (caption) {
          markdown += `\n\n*${caption}*`;
        }
        
        return markdown;
      }
    );
    
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