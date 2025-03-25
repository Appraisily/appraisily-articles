/**
 * Validate and fix shortcodes in an existing article
 * This script can be used to check and repair shortcode issues in an article
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Import shortcode validator
const shortcodeValidator = require('./shortcode-validator');

// Check arguments
if (process.argv.length < 3) {
  console.error('Please provide an article slug or file path.');
  console.log('Usage: node validate-article.js "article-slug"');
  console.log('   or: node validate-article.js "/path/to/article.md"');
  process.exit(1);
}

async function main() {
  const input = process.argv[2];
  let articlePath;
  
  // Determine if input is a full path or a slug
  if (input.endsWith('.md') && (input.startsWith('/') || input.includes(':\\'))) {
    // Input is a full file path
    articlePath = input;
  } else {
    // Input is a slug, construct the path
    const slug = input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    articlePath = path.join(__dirname, '..', 'content', 'articles', `${slug}.md`);
  }
  
  // Check if the article exists
  if (!fs.existsSync(articlePath)) {
    console.error(`Article not found at ${articlePath}`);
    process.exit(1);
  }
  
  try {
    console.log(`Validating article at ${articlePath}`);
    
    // Read the article content
    const content = await readFile(articlePath, 'utf8');
    
    // Count shortcodes before validation
    const shortcodesBefore = countShortcodes(content);
    console.log('Before validation:');
    console.log('- Total shortcodes:', shortcodesBefore.total);
    console.log('- Self-closing shortcodes:', shortcodesBefore.selfClosing);
    console.log('- Opening shortcode tags:', shortcodesBefore.opening);
    console.log('- Closing shortcode tags:', shortcodesBefore.closing);
    
    // Check if opening and closing tags match
    if (shortcodesBefore.opening !== shortcodesBefore.closing) {
      console.warn(`⚠️ Warning: Mismatch between opening (${shortcodesBefore.opening}) and closing (${shortcodesBefore.closing}) tags`);
    }
    
    // Validate and fix shortcodes
    const fixedContent = shortcodeValidator.validateAndFixShortcodes(content);
    
    // Count shortcodes after validation
    const shortcodesAfter = countShortcodes(fixedContent);
    console.log('\nAfter validation:');
    console.log('- Total shortcodes:', shortcodesAfter.total);
    console.log('- Self-closing shortcodes:', shortcodesAfter.selfClosing);
    console.log('- Opening shortcode tags:', shortcodesAfter.opening);
    console.log('- Closing shortcode tags:', shortcodesAfter.closing);
    
    // Check if there were changes
    if (content !== fixedContent) {
      console.log('\n🔧 Shortcode issues found and fixed!');
      
      // Write the fixed content back to the file
      if (process.argv.includes('--fix')) {
        await writeFile(articlePath, fixedContent);
        console.log(`✅ Fixed content written to ${articlePath}`);
      } else {
        console.log('Run with --fix flag to apply these changes.');
        console.log('Example: node validate-article.js "article-slug" --fix');
      }
    } else {
      console.log('\n✅ No shortcode issues found. Article formatting is correct!');
    }
    
  } catch (error) {
    console.error('Error validating article:', error);
    process.exit(1);
  }
}

// Helper function to count shortcodes in content
function countShortcodes(content) {
  // Regular expressions to match different types of shortcodes
  const selfClosingRegex = /{{<\s*[^>]*?\s*\/>}}/g;
  const openingRegex = /{{<\s*[^\/][^>]*?>}}/g;
  const closingRegex = /{{<\s*\/[^>]*?>}}/g;
  
  const selfClosing = (content.match(selfClosingRegex) || []).length;
  const opening = (content.match(openingRegex) || []).length;
  const closing = (content.match(closingRegex) || []).length;
  
  return {
    selfClosing,
    opening,
    closing,
    total: selfClosing + opening + closing
  };
}

// Run the main function
main();