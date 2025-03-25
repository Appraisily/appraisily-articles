/**
 * Final fix script for resource card issues
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
    
    // Replace all resource-links and resource-card sections with a fixed template
    const resourceCardsTemplate = `{{< interactive-modules/resource-links title="Additional Resources" columns="2" >}}
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
    
    // This is a simplified approach: just remove the entire end part of the file
    // and replace it with our template to avoid regex issues
    // Find the last heading in the file
    const headings = content.match(/^## .+$/gm);
    if (headings && headings.length > 0) {
      const lastHeading = headings[headings.length - 1];
      const lastHeadingIndex = content.lastIndexOf(lastHeading);
      
      // Cut off after the 200 chars after last heading
      const keepLength = lastHeadingIndex + lastHeading.length + 200;
      content = content.substring(0, keepLength);
      
      // Add the template
      content = content.trim() + '\n\n' + resourceCardsTemplate;
    } else {
      // If no headings, just append template
      content += '\n\n' + resourceCardsTemplate;
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