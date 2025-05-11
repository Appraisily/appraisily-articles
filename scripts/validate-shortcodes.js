const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

/**
 * Validates that shortcodes in markdown files are properly formatted
 */
async function validateShortcodes(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const errors = [];
    
    // Track opening and closing shortcodes
    const openShortcodes = [];
    const selfClosingPatterns = [
      /{{<\s*(data-modules\/stats-highlight|interactive-modules\/checklist-item)\s+.*?\/>}}/
    ];
    const mustBeSelfClosing = [
      'data-modules/stats-highlight',
      'interactive-modules/checklist-item'
    ];
    const mustBeNested = [
      'content-modules/section-header',
      'content-modules/faq',
      'content-modules/faq-item',
      'visual-modules/timeline',
      'visual-modules/timeline-item',
      'interactive-modules/condition-checklist',
      'interactive-modules/resource-links'
    ];
    
    // These shortcodes can contain HTML table elements directly
    const canContainTables = [
      'data-modules/price-table',
      'auction-results'
    ];
    
    // Special handling for resource-card inside resource-links
    const specialNestedShortcodes = {
      'interactive-modules/resource-links': ['interactive-modules/resource-card']
    };
    
    const lineShortcodeOpened = {};
    
    // This stack helps us track which parent shortcode is currently active
    const contextStack = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Check for opening shortcodes
      const openMatches = line.match(/{{<\s*([a-zA-Z0-9\/-]+).*?>}}/g);
      if (openMatches) {
        for (const match of openMatches) {
          const shortcodeName = match.match(/{{<\s*([a-zA-Z0-9\/-]+)/)[1];
          
          // Self-closing shortcodes (stats-highlight, stat-card, checklist-item, etc.)
          // No explicit '/>}}' is required any longer. We simply treat the opening tag
          // itself as the complete element and do NOT expect or allow a separate
          // closing tag further down.
          if (mustBeSelfClosing.includes(shortcodeName)) {
            // Make sure we do not accidentally consider it "open" for later matching
            // Skip any further nesting bookkeeping for this shortcode
            continue;
          }
          
          // Update context stack for special parent-child relationships
          if (Object.keys(specialNestedShortcodes).includes(shortcodeName)) {
            contextStack.push(shortcodeName);
          }
          
          // For normal nested shortcodes (those that require a separate closing tag),
          // add to the open stack so we can match them later.
          if (mustBeNested.includes(shortcodeName)) {
            openShortcodes.push({ name: shortcodeName, line: lineNum });
            lineShortcodeOpened[shortcodeName] = lineShortcodeOpened[shortcodeName] || [];
            lineShortcodeOpened[shortcodeName].push(lineNum);
          }
          
          // Special handling for tables and known shortcodes with HTML table content
          if (canContainTables.includes(shortcodeName) && !match.includes('/>}}')) {
            // Add these to the stack but mark them as special
            openShortcodes.push({ name: shortcodeName, line: lineNum, tableContent: true });
          }
        }
      }
      
      // Check for closing shortcodes
      const closeMatches = line.match(/{{<\s*\/([a-zA-Z0-9\/-]+)\s*>}}/g);
      if (closeMatches) {
        for (const match of closeMatches) {
          const shortcodeName = match.match(/{{<\s*\/([a-zA-Z0-9\/-]+)/)[1];
          
          // Remove from context stack if it's a special parent
          if (contextStack.length > 0 && contextStack[contextStack.length - 1] === shortcodeName) {
            contextStack.pop();
          }
          
          if (openShortcodes.length === 0) {
            // Ignore the table-related shortcodes for "no matching opening tag" errors
            if (!canContainTables.includes(shortcodeName)) {
              errors.push(`Line ${lineNum}: Closing shortcode '${shortcodeName}' with no matching opening tag.`);
            }
          } else {
            let found = false;
            
            // Handle special case for nested resource cards
            if (shortcodeName === 'interactive-modules/resource-card' && 
                contextStack.includes('interactive-modules/resource-links')) {
              found = true; // Skip validation for these nested elements
            }
            
            if (!found) {
              // Look for matching shortcode, starting from the end
              for (let j = openShortcodes.length - 1; j >= 0; j--) {
                if (openShortcodes[j].name === shortcodeName) {
                  // Remove this and all shortcodes after it (they were improperly nested)
                  openShortcodes.splice(j);
                  found = true;
                  break;
                }
              }
              
              if (!found && !canContainTables.includes(shortcodeName)) {
                // Only report error if it's not one of our table-containing shortcodes
                const lastOpened = openShortcodes[openShortcodes.length - 1];
                errors.push(`Line ${lineNum}: Mismatched shortcode tags. Expected '${lastOpened.name}' but found '${shortcodeName}'.`);
              } else if (found) {
                // Successfully matched and removed
              } else {
                // It's a table-related shortcode we're ignoring for validation
              }
            }
          }
        }
      }
      
      // Check for price-row usage (still discouraged)
      if (line.includes('data-modules/price-row')) {
        errors.push(`Line ${lineNum}: Using 'price-row' shortcode is discouraged. Use direct HTML table rows instead.`);
      }
      
      // Check for auction-item usage (still discouraged)
      if (line.includes('auction-item')) {
        errors.push(`Line ${lineNum}: Using 'auction-item' shortcode is discouraged. Use direct HTML table rows instead.`);
      }
    }
    
    // Check for unclosed shortcodes (except the table-containing ones)
    if (openShortcodes.length > 0) {
      for (const sc of openShortcodes) {
        if (!sc.tableContent && mustBeNested.includes(sc.name)) {
          errors.push(`Line ${sc.line}: Unclosed shortcode '${sc.name}'.`);
        }
      }
    }
    
    return {
      file: path.basename(filePath),
      errors: errors,
      valid: errors.length === 0
    };
  } catch (error) {
    return {
      file: path.basename(filePath),
      errors: [`Error reading file: ${error.message}`],
      valid: false
    };
  }
}

/**
 * Validate all markdown files in the content directory
 */
async function validateAllArticles() {
  try {
    const contentDir = path.join(__dirname, '..', 'content', 'articles');
    const files = (await readdir(contentDir))
      .filter(file => file.endsWith('.md') && !file.startsWith('_'));
    
    let allValid = true;
    const results = [];
    
    console.log(`Validating ${files.length} articles...`);
    
    for (const file of files) {
      const filePath = path.join(contentDir, file);
      const result = await validateShortcodes(filePath);
      results.push(result);
      
      if (!result.valid) {
        allValid = false;
        console.log(`\n❌ File ${file} contains errors:`);
        for (const error of result.errors) {
          console.log(`  - ${error}`);
        }
      } else {
        console.log(`✅ File ${file} is valid`);
      }
    }
    
    if (allValid) {
      console.log('\n✅ All files validated successfully!');
    } else {
      console.log('\n❌ Some files contain errors. Please fix them before building.');
      process.exit(1); // Exit with error code
    }
    
    return results;
  } catch (error) {
    console.error('Error validating articles:', error);
    process.exit(1);
  }
}

// If called directly
if (require.main === module) {
  validateAllArticles();
}

module.exports = { validateShortcodes, validateAllArticles };