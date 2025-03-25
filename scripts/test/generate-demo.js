const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configure these parameters
const KEYWORD = 'old-camera-value';
const ARTICLE_TITLE = 'Old Camera Value: Expert Guide to Appraisal and Collection';
const OUTPUT_FILE = path.join(__dirname, '../../content/articles/', `${KEYWORD}-demo.md`);

async function generateArticleDemo() {
  try {
    console.log(`Starting demo article generation for keyword: ${KEYWORD}`);
    
    // Read the example article we created earlier
    const exampleArticle = await readFile(path.join(__dirname, '../../content/articles/old-camera-value-example.md'), 'utf8');
    
    // Save the example as our demo output
    await writeFile(OUTPUT_FILE, exampleArticle);
    console.log(`Demo article successfully saved to ${OUTPUT_FILE}`);
    
    // Also create an HTML preview using our example
    const htmlPreview = createHtmlPreview(exampleArticle);
    await writeFile(path.join(__dirname, './preview.html'), htmlPreview);
    console.log(`HTML preview saved to test/preview.html`);
    
  } catch (error) {
    console.error('Error generating demo article:', error);
  }
}

function createHtmlPreview(markdownContent) {
  // Extract front matter
  const frontMatterMatch = markdownContent.match(/---\n([\s\S]*?)\n---/);
  const frontMatter = frontMatterMatch ? frontMatterMatch[1] : '';
  
  // Parse front matter
  const title = (frontMatter.match(/title: "(.*)"/m) || [])[1] || 'Article Title';
  const description = (frontMatter.match(/description: "(.*)"/m) || [])[1] || 'Article Description';
  const featuredImage = (frontMatter.match(/featured_image: "(.*)"/m) || [])[1] || '';
  
  // Replace shortcodes with HTML approximations
  let htmlContent = markdownContent
    // Remove front matter
    .replace(/---\n[\s\S]*?\n---/, '')
    
    // Table of contents
    .replace(/{{< tableofcontents >}}/g, '<div class="table-of-contents"><h2>Table of Contents</h2><ul><li><a href="#introduction">Introduction</a></li><li><a href="#key-factors">Key Factors</a></li><li><a href="#valuation">Valuation</a></li></ul></div>')
    
    // Hero image
    .replace(/{{< visual-modules\/hero-image src="(.*?)" alt="(.*?)" caption="(.*?)".*?>}}/g, 
      '<figure class="hero-image"><img src="$1" alt="$2"><figcaption>$3</figcaption></figure>')
    
    // Section headers
    .replace(/{{< content-modules\/section-header title="(.*?)".*?>}}([\s\S]*?){{< \/content-modules\/section-header >}}/g,
      '<div class="section-header"><h2>$1</h2><div class="section-description">$2</div></div>')
    
    // Stats highlight
    .replace(/{{< data-modules\/stats-highlight title="(.*?)".*?>}}([\s\S]*?){{< \/data-modules\/stats-highlight >}}/g,
      '<div class="stats-highlight"><h3>$1</h3><div class="stats-grid">$2</div></div>')
    
    // Stat cards
    .replace(/{{< data-modules\/stat-card value="(.*?)" label="(.*?)".*?>}}([\s\S]*?){{< \/data-modules\/stat-card >}}/g,
      '<div class="stat-card"><div class="stat-value">$1</div><div class="stat-label">$2</div><div class="stat-desc">$3</div></div>')
    
    // Price tables
    .replace(/{{< data-modules\/price-table title="(.*?)".*?>}}([\s\S]*?){{< \/data-modules\/price-table >}}/g,
      '<div class="price-table"><h3>$1</h3><table><thead><tr><th>Category</th><th>Price Range</th><th>Notes</th></tr></thead><tbody>$2</tbody></table></div>')
    
    // Price rows
    .replace(/{{< data-modules\/price-row category="(.*?)" range="(.*?)" notes="(.*?)".*?>}}/g,
      '<tr><td>$1</td><td>$2</td><td>$3</td></tr>')
    
    // Timeline
    .replace(/{{< visual-modules\/timeline title="(.*?)".*?>}}([\s\S]*?){{< \/visual-modules\/timeline >}}/g,
      '<div class="timeline"><h3>$1</h3><div class="timeline-items">$2</div></div>')
    
    // Timeline items
    .replace(/{{< visual-modules\/timeline-item date="(.*?)" title="(.*?)".*?>}}([\s\S]*?){{< \/visual-modules\/timeline-item >}}/g,
      '<div class="timeline-item"><div class="timeline-date">$1</div><h4 class="timeline-title">$2</h4><div class="timeline-content">$3</div></div>')
    
    // FAQ
    .replace(/{{< content-modules\/faq title="(.*?)".*?>}}([\s\S]*?){{< \/content-modules\/faq >}}/g,
      '<div class="faq-module"><h3>$1</h3><div class="faq-items">$2</div></div>')
    
    // FAQ items
    .replace(/{{< content-modules\/faq-item question="(.*?)".*?>}}([\s\S]*?){{< \/content-modules\/faq-item >}}/g,
      '<div class="faq-item"><h4 class="faq-question">$1</h4><div class="faq-answer">$2</div></div>')
    
    // Resource links
    .replace(/{{< interactive-modules\/resource-links title="(.*?)".*?>}}([\s\S]*?){{< \/interactive-modules\/resource-links >}}/g,
      '<div class="resource-links"><h3>$1</h3><div class="resource-grid">$2</div></div>')
    
    // Resource cards
    .replace(/{{< interactive-modules\/resource-card title="(.*?)" url="(.*?)" type="(.*?)".*?>}}([\s\S]*?){{< \/interactive-modules\/resource-card >}}/g,
      '<a href="$2" class="resource-card"><h4>$1</h4><div class="resource-type">$3</div><div class="resource-desc">$4</div></a>')
    
    // Auction results
    .replace(/{{< auction-results title="(.*?)".*?>}}([\s\S]*?){{< \/auction-results >}}/g,
      '<div class="auction-results"><h3>$1</h3><table><thead><tr><th>Item</th><th>Price</th><th>Date</th><th>Auction House</th></tr></thead><tbody>$2</tbody></table></div>')
    
    // Auction items
    .replace(/{{< auction-item item="(.*?)" price="(.*?)" date="(.*?)" auctionHouse="(.*?)".*?>}}/g,
      '<tr><td>$1</td><td>$2</td><td>$3</td><td>$4</td></tr>')
    
    // Condition checklist
    .replace(/{{< interactive-modules\/condition-checklist title="(.*?)".*?>}}([\s\S]*?){{< \/interactive-modules\/condition-checklist >}}/g,
      '<div class="condition-checklist"><h3>$1</h3><div class="checklist-items">$2</div></div>')
    
    // Checklist items
    .replace(/{{< interactive-modules\/checklist-item label="(.*?)".*?>}}([\s\S]*?){{< \/interactive-modules\/checklist-item >}}/g,
      '<div class="checklist-item"><label><input type="checkbox"> $1</label><div class="checklist-desc">$2</div></div>')
    
    // Convert markdown headings
    .replace(/# (.*)/g, '<h1>$1</h1>')
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/### (.*)/g, '<h3>$1</h3>')
    
    // Convert markdown paragraphs
    .replace(/(?:^|\n)([^#<\n].*?)(?:$|\n\n)/g, '<p>$1</p>')
    
    // Convert markdown lists
    .replace(/(?:^|\n)(- .*?)(?:$|\n\n)/g, '<ul><li>$1</li></ul>');
  
  // Create the HTML document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      --primary-color: #1a365d;
      --secondary-color: #2a4365;
      --accent-color: #3182ce;
      --light-blue: #ebf8ff;
      --text-color: #1a202c;
      --text-muted: #4a5568;
      --bg-color: #ffffff;
      --bg-secondary: #f7fafc;
      --border-color: #e2e8f0;
      --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: var(--text-color);
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background-color: var(--bg-color);
    }
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    
    h1, h2, h3, h4 {
      color: var(--primary-color);
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    
    h1 { font-size: 2.5rem; }
    h2 { font-size: 2rem; }
    h3 { font-size: 1.5rem; }
    
    p {
      margin-bottom: 1.5rem;
      font-size: 1.125rem;
    }
    
    .hero-image {
      margin: 2rem 0;
      box-shadow: var(--box-shadow);
    }
    
    .hero-image figcaption {
      padding: 1rem;
      background-color: var(--bg-secondary);
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    
    .section-header {
      margin: 3rem 0 1.5rem;
    }
    
    .section-description {
      color: var(--text-muted);
    }
    
    .stats-highlight {
      margin: 2rem 0;
      padding: 1.5rem;
      background-color: var(--bg-secondary);
      border-radius: 8px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    
    .stat-card {
      background-color: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: var(--box-shadow);
      text-align: center;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent-color);
    }
    
    .stat-label {
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
    
    .price-table {
      margin: 2rem 0;
      padding: 1.5rem;
      background-color: var(--bg-secondary);
      border-radius: 8px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }
    
    th {
      background-color: var(--light-blue);
      color: var(--secondary-color);
      padding: 0.75rem;
      text-align: left;
    }
    
    td {
      padding: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }
    
    tr:nth-child(even) {
      background-color: rgba(255, 255, 255, 0.5);
    }
    
    .timeline {
      margin: 2rem 0;
      position: relative;
      padding-left: 2rem;
    }
    
    .timeline::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 4px;
      background-color: var(--accent-color);
    }
    
    .timeline-item {
      margin-bottom: 2rem;
      position: relative;
    }
    
    .timeline-date {
      display: inline-block;
      background-color: var(--light-blue);
      color: var(--accent-color);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .timeline-title {
      margin-top: 0;
      margin-bottom: 0.5rem;
    }
    
    .faq-module {
      margin: 2rem 0;
      padding: 1.5rem;
      background-color: var(--bg-secondary);
      border-radius: 8px;
    }
    
    .faq-item {
      margin-bottom: 1.5rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: white;
      padding: 1.5rem;
    }
    
    .faq-question {
      margin-top: 0;
      margin-bottom: 1rem;
      color: var(--primary-color);
    }
    
    .resource-links {
      margin: 2rem 0;
      padding: 1.5rem;
      background-color: var(--bg-secondary);
      border-radius: 8px;
    }
    
    .resource-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    
    .resource-card {
      display: block;
      text-decoration: none;
      color: inherit;
      background-color: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: var(--box-shadow);
      transition: transform 0.3s ease;
    }
    
    .resource-card:hover {
      transform: translateY(-5px);
    }
    
    .resource-type {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      background-color: var(--light-blue);
      color: var(--accent-color);
      border-radius: 9999px;
      font-size: 0.75rem;
      margin-bottom: 0.5rem;
    }
    
    .condition-checklist {
      margin: 2rem 0;
      padding: 1.5rem;
      background-color: var(--bg-secondary);
      border-radius: 8px;
    }
    
    .checklist-item {
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: white;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }
    
    .checklist-item label {
      display: flex;
      align-items: center;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .checklist-desc {
      margin-left: 1.75rem;
      color: var(--text-muted);
    }
    
    .table-of-contents {
      margin: 2rem 0;
      padding: 1.5rem;
      background-color: var(--bg-secondary);
      border-radius: 8px;
    }
    
    .table-of-contents ul {
      list-style-type: none;
      padding-left: 1rem;
    }
    
    .table-of-contents li {
      margin-bottom: 0.5rem;
    }
    
    .table-of-contents a {
      color: var(--accent-color);
      text-decoration: none;
    }
    
    @media (max-width: 768px) {
      .stats-grid, .resource-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>${title}</h1>
    <p>${description}</p>
    ${featuredImage ? `<img src="${featuredImage}" alt="${title}" class="featured-image">` : ''}
  </header>
  
  <main>
    ${htmlContent}
  </main>
  
  <footer>
    <p>© 2025 Appraisily Articles. All rights reserved.</p>
  </footer>
</body>
</html>`;
}

// Execute the function
generateArticleDemo();