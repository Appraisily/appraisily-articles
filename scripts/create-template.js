const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const today = new Date();
const dateString = today.toISOString().split('T')[0];

/**
 * Create a new article template with the proper shortcode structure
 * @param {string} filename - The filename for the article (without .md extension)
 * @param {string} title - The title for the article
 */
async function createTemplate(filename, title) {
  try {
    // Format the filename
    const slug = filename.replace(/\s+/g, '-').toLowerCase();
    
    // Create the content directory if it doesn't exist
    const contentDir = path.join(__dirname, '..', 'content', 'articles');
    if (!fs.existsSync(contentDir)) {
      await mkdir(contentDir, { recursive: true });
    }
    
    // Create the file path
    const filePath = path.join(contentDir, `${slug}.md`);
    
    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      console.error(`Error: File ${slug}.md already exists.`);
      process.exit(1);
    }
    
    // Create the template content
    const content = `---
title: "${title}"
date: ${today.toISOString()}
description: "Comprehensive guide about ${title} with expert analysis and valuation information."
featured_image: "https://ik.imagekit.io/appraisily/Articles/${slug}.jpg"
draft: true
---

{{< visual-modules/hero-image src="https://ik.imagekit.io/appraisily/Articles/${slug}-hero.jpg" alt="Featured image for ${title}" caption="Detailed view of ${title}" />}}

## Introduction

{{< content-modules/section-header title="About ${title}" level="2" >}}
This section provides an introduction to ${title} and why it's important.
{{< /content-modules/section-header >}}

## History and Background

{{< content-modules/section-header title="History of ${title}" level="2" >}}
This section covers the historical context and development.
{{< /content-modules/section-header >}}

{{< visual-modules/timeline >}}
  {{< visual-modules/timeline-item date="1900s" title="Early Examples" >}}
  Description of early examples and their significance.
  {{< /visual-modules/timeline-item >}}
  
  {{< visual-modules/timeline-item date="1950s" title="Mid-Century Developments" >}}
  How things evolved in the mid-20th century.
  {{< /visual-modules/timeline-item >}}
  
  {{< visual-modules/timeline-item date="2000s" title="Modern Era" >}}
  The current state and modern examples.
  {{< /visual-modules/timeline-item >}}
{{< /visual-modules/timeline >}}

## Value and Appraisal

{{< content-modules/section-header title="Value Factors" level="2" >}}
What factors affect the value of ${title}.
{{< /content-modules/section-header >}}

{{< data-modules/stats-highlight stat="Top 5" text="Factors That Determine Value" />}}

1. **Factor One**: Description of the first factor
2. **Factor Two**: Description of the second factor
3. **Factor Three**: Description of the third factor
4. **Factor Four**: Description of the fourth factor
5. **Factor Five**: Description of the fifth factor

{{< data-modules/price-table title="Value Ranges" >}}
<table>
  <tr>
    <td>Category One</td>
    <td>$1,000-$2,000</td>
    <td>Excellent condition</td>
  </tr>
  <tr>
    <td>Category Two</td>
    <td>$500-$1,000</td>
    <td>Good condition</td>
  </tr>
  <tr>
    <td>Category Three</td>
    <td>$200-$500</td>
    <td>Fair condition</td>
  </tr>
</table>
{{< /data-modules/price-table >}}

## Recent Auction Results

{{< auction-results >}}
<table>
  <tr>
    <td>Example Item One</td>
    <td>$1,500</td>
    <td>2023</td>
    <td>Auction House Name</td>
  </tr>
  <tr>
    <td>Example Item Two</td>
    <td>$2,300</td>
    <td>2024</td>
    <td>Another Auction House</td>
  </tr>
</table>
{{< /auction-results >}}

## Authentication and Identification

{{< content-modules/section-header title="How to Identify Authentic Items" level="2" >}}
This section covers how to authenticate and identify genuine examples.
{{< /content-modules/section-header >}}

{{< interactive-modules/condition-checklist title="Authentication Checklist" >}}
  {{< interactive-modules/checklist-item text="Check for specific mark or signature" />}}
  {{< interactive-modules/checklist-item text="Examine materials and craftsmanship" />}}
  {{< interactive-modules/checklist-item text="Verify dimensions and weight" />}}
  {{< interactive-modules/checklist-item text="Look for period-appropriate details" />}}
  {{< interactive-modules/checklist-item text="Consider provenance and documentation" />}}
{{< /interactive-modules/condition-checklist >}}

## Frequently Asked Questions

{{< content-modules/section-header title="Common Questions" level="2" >}}
Answers to frequently asked questions about ${title}.
{{< /content-modules/section-header >}}

{{< content-modules/faq >}}
  {{< content-modules/faq-item question="What is the most valuable type of ${title}?" >}}
  The most valuable examples are typically those that are rare, in excellent condition, and have historical significance or provenance.
  {{< /content-modules/faq-item >}}
  
  {{< content-modules/faq-item question="How can I tell if my ${title} is authentic?" >}}
  Authentication typically involves examining specific characteristics, markings, materials, and craftsmanship. Professional appraisal is recommended for valuable items.
  {{< /content-modules/faq-item >}}
  
  {{< content-modules/faq-item question="Where is the best place to sell my ${title}?" >}}
  Depending on the value and type, options include specialty auctions, dealers, online marketplaces, and direct sales to collectors.
  {{< /content-modules/faq-item >}}
{{< /content-modules/faq >}}

## Additional Resources

{{< content-modules/section-header title="Where to Learn More" level="2" >}}
Resources for further research and assistance.
{{< /content-modules/section-header >}}

{{< interactive-modules/resource-links title="Helpful Resources" >}}
  {{< interactive-modules/resource-card title="Appraisily Online Appraisal" url="https://www.appraisily.com/appraisal" description="Upload photos for professional appraisal" />}}
  {{< interactive-modules/resource-card title="Collector's Guide" url="https://example.com/collectors-guide" description="Comprehensive guide for collectors" />}}
  {{< interactive-modules/resource-card title="Authentication Services" url="https://example.com/authentication" description="Professional authentication services" />}}
{{< /interactive-modules/resource-links >}}

## Conclusion

In summary, ${title} represents an important category with significant historical and collector value. Understanding the key factors that determine authenticity and value can help you make informed decisions whether buying, selling, or appraising these items.
`;
    
    // Write the file
    await writeFile(filePath, content);
    console.log(`✅ Template created successfully: ${filePath}`);
    console.log(`Next steps:
1. Add real content to the template
2. Update the featured_image URL
3. Set draft: false when ready to publish
4. Run 'npm run validate' to check for shortcode errors`);
    
    return filePath;
  } catch (error) {
    console.error('Error creating template:', error);
    process.exit(1);
  }
}

// If called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node create-template.js <filename> [title]');
    console.error('Example: node create-template.js antique-watches "Antique Watches Value Guide"');
    process.exit(1);
  }
  
  const filename = args[0];
  const title = args[1] || filename.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  createTemplate(filename, title);
}

module.exports = { createTemplate };