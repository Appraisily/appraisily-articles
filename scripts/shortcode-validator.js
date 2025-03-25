/**
 * Shortcode validator utility for article generation
 * 
 * This module provides helper functions to validate and fix shortcodes
 * in generated articles to ensure they follow the correct syntax.
 */

// List of shortcodes that must be self-closing
const SELF_CLOSING_SHORTCODES = [
  'data-modules/stats-highlight',
  'interactive-modules/checklist-item'
];

// List of shortcodes that must be properly nested
const NESTED_SHORTCODES = [
  'content-modules/section-header',
  'content-modules/faq',
  'content-modules/faq-item',
  'visual-modules/timeline',
  'visual-modules/timeline-item',
  'interactive-modules/condition-checklist',
  'interactive-modules/resource-links',
  'data-modules/price-table',
  'auction-results'
];

// Shortcodes that should use direct HTML instead
const DIRECT_HTML_SHORTCODES = [
  'data-modules/price-row',
  'auction-item'
];

/**
 * Fix self-closing shortcodes that should use the />}} syntax
 * @param {string} content - Article content
 * @returns {string} - Fixed content
 */
function fixSelfClosingShortcodes(content) {
  SELF_CLOSING_SHORTCODES.forEach(shortcode => {
    // Find shortcodes that aren't properly self-closed
    const pattern = new RegExp(`{{<\\s*${shortcode.replace('/', '\\/')}\\s+([^>]*?)>}}`, 'g');
    content = content.replace(pattern, (match, attributes) => {
      return `{{< ${shortcode} ${attributes} />}}`;
    });
    
    // Remove any closing tags for self-closing shortcodes
    const closingPattern = new RegExp(`{{<\\s*\\/${shortcode.replace('/', '\\/')}\\s*>}}`, 'g');
    content = content.replace(closingPattern, '');
  });
  
  return content;
}

/**
 * Ensure nested shortcodes have proper opening and closing tags
 * @param {string} content - Article content
 * @returns {string} - Fixed content
 */
function fixNestedShortcodes(content) {
  NESTED_SHORTCODES.forEach(shortcode => {
    // Find opening tags without matching closing tags
    const openPattern = new RegExp(`{{<\\s*${shortcode.replace('/', '\\/')}\\s+([^>]*?)>}}`, 'g');
    const closePattern = new RegExp(`{{<\\s*\\/${shortcode.replace('/', '\\/')}\\s*>}}`, 'g');
    
    const openMatches = Array.from(content.matchAll(openPattern));
    const closeMatches = Array.from(content.matchAll(closePattern));
    
    if (openMatches.length > closeMatches.length) {
      // We have unmatched opening tags, add closing tags
      for (let i = closeMatches.length; i < openMatches.length; i++) {
        const openMatch = openMatches[i];
        const openIndex = openMatch.index;
        
        // Find a good place to add the closing tag
        // Try to find the next opening tag of any kind
        const nextOpeningIndex = content.indexOf('{{<', openIndex + openMatch[0].length);
        const insertIndex = nextOpeningIndex !== -1 ? nextOpeningIndex : content.length;
        
        // Construct the content with added closing tag
        content = content.substring(0, insertIndex) + 
                 `\n{{< /${shortcode} >}}\n` + 
                 content.substring(insertIndex);
      }
    } else if (openMatches.length < closeMatches.length) {
      // We have extra closing tags, remove them
      const extraClosingsCount = closeMatches.length - openMatches.length;
      for (let i = 0; i < extraClosingsCount; i++) {
        const closeMatch = closeMatches[openMatches.length + i];
        const closeIndex = closeMatch.index;
        const closeTagLength = closeMatch[0].length;
        
        // Remove the extra closing tag
        content = content.substring(0, closeIndex) + 
                 content.substring(closeIndex + closeTagLength);
      }
    }
  });
  
  return content;
}

/**
 * Convert deprecated shortcodes to direct HTML
 * @param {string} content - Article content
 * @returns {string} - Fixed content
 */
function convertDeprecatedShortcodes(content) {
  // Convert price-row to HTML table rows
  content = content.replace(/{{<\s*data-modules\/price-row\s+(?:category|item)="([^"]*?)"\s+(?:range|price)="([^"]*?)"\s+(?:notes|condition)="([^"]*?)"\s*(?:highlight="[^"]*")?\s*>}}/g, 
    (match, item, price, notes) => {
      return `  <tr>
    <td>${item}</td>
    <td>${price}</td>
    <td>${notes}</td>
  </tr>`;
    }
  );
  
  // Convert auction-item to HTML table rows
  content = content.replace(/{{<\s*auction-item\s+(?:item|title)="([^"]*?)"\s+(?:price|sold)="([^"]*?)"\s+date="([^"]*?)"\s+auctionHouse="([^"]*?)"\s*>}}/g, 
    (match, item, price, date, auctionHouse) => {
      return `  <tr>
    <td>${item}</td>
    <td>${price}</td>
    <td>${date}</td>
    <td>${auctionHouse}</td>
  </tr>`;
    }
  );
  
  return content;
}

/**
 * Fix resource-links sections to ensure proper nesting
 * @param {string} content - Article content
 * @returns {string} - Fixed content
 */
function fixResourceLinks(content) {
  // Find resource-card shortcodes
  const resourceCardPattern = /{{<\s*interactive-modules\/resource-card\s+([^>]*?)>}}([\s\S]*?){{<\s*\/interactive-modules\/resource-card\s*>}}/g;
  const resourceCardsMatches = Array.from(content.matchAll(resourceCardPattern));
  
  // Find resource-links shortcodes
  const resourceLinksPattern = /{{<\s*interactive-modules\/resource-links\s+([^>]*?)>}}([\s\S]*?){{<\s*\/interactive-modules\/resource-links\s*>}}/g;
  const resourceLinksMatches = Array.from(content.matchAll(resourceLinksPattern));
  
  if (resourceCardsMatches.length > 0 && resourceLinksMatches.length === 0) {
    // We have resource cards but no resource links wrapper
    // Group cards that are close to each other
    const groupedCards = [];
    let currentGroup = [];
    
    for (let i = 0; i < resourceCardsMatches.length; i++) {
      const card = resourceCardsMatches[i];
      
      if (i === 0 || 
          (card.index - (resourceCardsMatches[i-1].index + resourceCardsMatches[i-1][0].length) < 500)) {
        // Part of the current group
        currentGroup.push(card);
      } else {
        // Start a new group
        if (currentGroup.length > 0) {
          groupedCards.push([...currentGroup]);
        }
        currentGroup = [card];
      }
    }
    
    if (currentGroup.length > 0) {
      groupedCards.push(currentGroup);
    }
    
    // Wrap each group with resource-links
    for (const group of groupedCards) {
      if (group.length > 0) {
        const firstCard = group[0];
        const lastCard = group[group.length - 1];
        
        const firstCardIndex = firstCard.index;
        const lastCardEndIndex = lastCard.index + lastCard[0].length;
        
        // Extract the group of cards
        const groupContent = content.substring(firstCardIndex, lastCardEndIndex);
        
        // Create wrapped content
        const wrappedContent = `{{< interactive-modules/resource-links title="Additional Resources" columns="2" >}}
${groupContent}
{{< /interactive-modules/resource-links >}}`;
        
        // Replace in the original content
        content = content.substring(0, firstCardIndex) + 
                 wrappedContent + 
                 content.substring(lastCardEndIndex);
      }
    }
  }
  
  return content;
}

/**
 * Validate and fix article content to ensure proper shortcode usage
 * @param {string} content - Raw article content
 * @returns {string} - Validated and fixed content
 */
function validateAndFixShortcodes(content) {
  // Apply fixes in sequence
  content = fixSelfClosingShortcodes(content);
  content = fixNestedShortcodes(content);
  content = convertDeprecatedShortcodes(content);
  content = fixResourceLinks(content);
  
  return content;
}

module.exports = {
  validateAndFixShortcodes,
  fixSelfClosingShortcodes,
  fixNestedShortcodes,
  convertDeprecatedShortcodes,
  fixResourceLinks
};