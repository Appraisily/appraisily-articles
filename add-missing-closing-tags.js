/**
 * Add missing closing tags
 * 
 * This script adds missing closing tags to resource-links sections
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
    
    // Check for resource-links sections without closing tags
    if (content.match(/{{<\s*interactive-modules\/resource-links[^>]*>}}/) && 
        !content.match(/{{<\s*\/interactive-modules\/resource-links\s*>}}/)) {
      
      // Find the last resource-card
      const resourceCardCloseIndex = content.lastIndexOf('{{< /interactive-modules/resource-card >}}');
      
      if (resourceCardCloseIndex !== -1) {
        // Insert the closing tag after the last resource-card close tag
        content = content.substring(0, resourceCardCloseIndex + '{{< /interactive-modules/resource-card >}}'.length) + 
                  '\n{{< /interactive-modules/resource-links >}}' + 
                  content.substring(resourceCardCloseIndex + '{{< /interactive-modules/resource-card >}}'.length);
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