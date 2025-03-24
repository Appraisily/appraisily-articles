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
    
    const lineShortcodeOpened = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Check for opening shortcodes
      const openMatches = line.match(/{{<\s*([a-zA-Z0-9\/-]+).*?>}}/g);
      if (openMatches) {
        for (const match of openMatches) {
          const shortcodeName = match.match(/{{<\s*([a-zA-Z0-9\/-]+)/)[1];
          
          // Check if this should be self-closing
          if (mustBeSelfClosing.includes(shortcodeName) && !match.includes('/>}}')) {
            errors.push(`Line ${lineNum}: Shortcode '${shortcodeName}' must be self-closing (use />}}).`);
          }
          
          // If not self-closing, add to stack
          if (!match.includes('/>}}') && mustBeNested.includes(shortcodeName)) {
            openShortcodes.push({ name: shortcodeName, line: lineNum });
            lineShortcodeOpened[shortcodeName] = lineShortcodeOpened[shortcodeName] || [];
            lineShortcodeOpened[shortcodeName].push(lineNum);
          }
        }
      }
      
      // Check for closing shortcodes
      const closeMatches = line.match(/{{<\s*\/([a-zA-Z0-9\/-]+)\s*>}}/g);
      if (closeMatches) {
        for (const match of closeMatches) {
          const shortcodeName = match.match(/{{<\s*\/([a-zA-Z0-9\/-]+)/)[1];
          
          if (openShortcodes.length === 0) {
            errors.push(`Line ${lineNum}: Closing shortcode '${shortcodeName}' with no matching opening tag.`);
          } else {
            const lastOpened = openShortcodes.pop();
            if (lastOpened.name !== shortcodeName) {
              errors.push(`Line ${lineNum}: Mismatched shortcode tags. Expected '${lastOpened.name}' but found '${shortcodeName}'.`);
              openShortcodes.push(lastOpened); // Push it back since it wasn't properly closed
            }
          }
        }
      }
      
      // Check for price-table and price-row usage
      if (line.includes('data-modules/price-table') && !line.includes('/>}}')) {
        // Look ahead for price-row shortcodes (which are problematic)
        let j = i + 1;
        while (j < lines.length && !lines[j].includes('{{< /data-modules/price-table >}}')) {
          if (lines[j].includes('data-modules/price-row')) {
            errors.push(`Line ${j+1}: Using 'price-row' shortcode is discouraged. Use direct HTML table rows instead.`);
          }
          j++;
        }
      }
      
      // Check for auction-results and auction-item usage
      if (line.includes('auction-results') && !line.includes('/>}}')) {
        // Look ahead for auction-item shortcodes
        let j = i + 1;
        while (j < lines.length && !lines[j].includes('{{< /auction-results >}}')) {
          if (lines[j].includes('auction-item')) {
            errors.push(`Line ${j+1}: Using 'auction-item' shortcode is discouraged. Use direct HTML table rows instead.`);
          }
          j++;
        }
      }
    }
    
    // Check for unclosed shortcodes
    if (openShortcodes.length > 0) {
      for (const sc of openShortcodes) {
        errors.push(`Line ${sc.line}: Unclosed shortcode '${sc.name}'.`);
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