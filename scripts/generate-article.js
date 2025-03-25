const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables with higher priority for directly set env vars
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env')
];

// Try all possible .env locations
envPaths.forEach(envPath => {
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment variables from ${envPath}`);
    dotenv.config({ path: envPath });
  }
});

const axios = require('axios');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configure these parameters - force override model to use one that works
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
process.env.CLAUDE_MODEL = 'claude-3-7-sonnet-latest'; // Force override to working model
const MODEL = process.env.CLAUDE_MODEL;
const API_VERSION = process.env.ANTHROPIC_VERSION || '2023-06-01';

// Import shortcode validator
const shortcodeValidator = require('./shortcode-validator');

// Debug API key availability (masking most of it for security)
if (API_KEY) {
  const maskedKey = API_KEY.substring(0, 10) + '...' + API_KEY.substring(API_KEY.length - 5);
  console.log(`ANTHROPIC_API_KEY found: ${maskedKey}`);
} else {
  console.warn('WARNING: No ANTHROPIC_API_KEY found in environment variables!');
}

// Global variables
let ARTICLE_TITLE = '';
let ARTICLE_KEYWORD = '';

// Main function to generate an article for a keyword
async function generateArticle(keyword, forceRegenerate = false) {
  ARTICLE_KEYWORD = keyword;
  
  // Standardize keyword path
  const keywordPath = keyword.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Define paths
  const contentDir = path.join(__dirname, '..', 'content');
  const articlesDir = path.join(contentDir, 'articles');
  const keywordDir = path.join(contentDir, keywordPath);
  const articleFile = path.join(articlesDir, `${keywordPath}.md`);
  
  // Check if the article already exists
  if (fs.existsSync(articleFile) && !forceRegenerate) {
    console.log(`Article for "${keyword}" already exists at ${articleFile}`);
    console.log(`Use --force flag to regenerate this article.`);
    return;
  }
  
  // Check if keyword folder exists
  if (!fs.existsSync(keywordDir)) {
    console.log(`No research data found for keyword "${keyword}" in ${keywordDir}`);
    console.log(`Please create the directory and add research data files first.`);
    return;
  }
  
  try {
    console.log(`Using keyword: "${keyword}" for article generation`);
    
    // Create a title for the article
    ARTICLE_TITLE = generateTitleFromKeyword(keyword);
    
    // Read research data
    const researchData = await readResearchData(keywordDir);
    
    // Process image data to extract ImageKit URLs
    const imageData = await extractImageKitUrls(keywordDir);
    
    // Read module documentation
    const moduleDocumentation = await readFile(path.join(__dirname, '..', 'AI-MODULES.md'), 'utf8');
    
    // Create prompt for Claude
    const prompt = createPrompt(ARTICLE_KEYWORD, researchData, moduleDocumentation, imageData);
    
    // Call Claude API
    let articleContent = await callClaudeAPI(prompt);
    
    // Validate and fix shortcodes in the article content
    console.log('Validating and fixing shortcodes...');
    articleContent = shortcodeValidator.validateAndFixShortcodes(articleContent);
    
    // Ensure the articles directory exists
    if (!fs.existsSync(articlesDir)){
      fs.mkdirSync(articlesDir, { recursive: true });
    }
    
    // Write article file
    await writeFile(articleFile, articleContent);
    console.log(`Article for "${keyword}" generated successfully at ${articleFile}`);
    
    // Return the article path
    return articleFile;
  } catch (error) {
    console.error(`Error generating article for ${keyword}:`, error);
    return null;
  }
}

// Read all research data files from a keyword directory
async function readResearchData(keywordDir) {
  const files = await fs.promises.readdir(keywordDir);
  const researchData = {};
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(keywordDir, file);
      
      try {
        const data = await readFile(filePath, 'utf8');
        const dataType = file.split('-').pop().replace('.json', '');
        researchData[dataType] = data;
      } catch (error) {
        console.warn(`Warning: Could not read ${file}: ${error.message}`);
      }
    }
  }
  
  return researchData;
}

// Extract ImageKit URLs from images-data.json
async function extractImageKitUrls(keywordDir) {
  try {
    const imagesDataPath = path.join(keywordDir, 'images-data.json');
    if (!fs.existsSync(imagesDataPath)) {
      console.log(`No images-data.json found for keyword in ${keywordDir}`);
      return [];
    }
    
    const data = await readFile(imagesDataPath, 'utf8');
    const images = JSON.parse(data);
    
    // Extract imagekitUrl values
    const imageUrls = images
      .filter(img => img.imagekitUrl)
      .map((img, index) => ({
        index: index + 1,
        url: img.imagekitUrl,
        alt: `Image ${index + 1} for ${ARTICLE_KEYWORD}`
      }));
    
    console.log(`Found ${imageUrls.length} ImageKit URLs for ${ARTICLE_KEYWORD}`);
    return imageUrls;
  } catch (error) {
    console.error(`Error extracting ImageKit URLs: ${error.message}`);
    return [];
  }
}

// Generate a title from the keyword
function generateTitleFromKeyword(keyword) {
  // Clean the keyword
  let title = keyword
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Add a common suffix that improves the title
  return `${title}: Expert Guide to Value and Identification`;
}

// Create prompt for Claude
function createPrompt(keyword, researchData, moduleDocumentation, imageData) {
  // Format the research data as JSON string
  const formattedData = Object.entries(researchData)
    .map(([key, value]) => `## ${key.toUpperCase()}\n\`\`\`json\n${value}\n\`\`\``)
    .join('\n\n');
  
  // Format the image data
  const formattedImageData = JSON.stringify(imageData, null, 2);

  return `You are an expert in article creation for Appraisily, an antiques and collectibles appraisal website. Your task is to create a comprehensive, high-quality article about "${keyword}" using the provided research data and following the module system.

## Task Instructions

1. Create a comprehensive article about "${keyword}" using the provided research data and modules.
2. The article should help readers understand the valuation and identification of "${keyword}".
3. Include these components in the front matter:
   - title: A compelling title related to "${keyword}"
   - description: A brief, SEO-optimized description of the article
   - slug: A URL-friendly version of the keyword
   - date: Today's date in YYYY-MM-DDT10:30:00-04:00 format
   - lastmod: Same as date
   - draft: false
   - featured_image: Include a URL to the main image from the image data provided
   - image_alt: A descriptive alt text for the featured image
   - category: Relevant category for the article
   - type: "article"
   - author: "Appraisily Team"
   - featured: true
   - Also add meta_title, meta_description, canonical_url, keywords, and structured_data
4. Create a comprehensive, informative article that covers the topic thoroughly.
5. Use a mix of modules to create visual interest and present the data effectively.
6. IMPORTANT: Use the provided ImageKit URLs for all images in the article. Each image URL starts with https://ik.imagekit.io/
7. When adding images, use proper markdown format: ![Alt text](ImageKit URL)
8. IMPORTANT: Do NOT use Discord CDN URLs (cdn.discordapp.com) as they are temporary and will expire.
9. Include numerous external links to authoritative sources. Extract URLs from the search results JSON data to create resource links throughout the article. This is crucial for SEO.
10. Use the resource-links module to create a dedicated "External Resources" section with at least 5-8 high-quality external links.
11. Make sure to link to relevant museum websites, auction houses, educational institutions, and collector resources where appropriate.
12. Ensure the article follows SEO best practices with proper keyword usage and semantic structure.
13. Include a comprehensive FAQ section addressing common questions from the research data.

## CRITICAL SHORTCODE FORMATTING GUIDELINES

Follow these exact formatting rules to ensure all shortcodes work properly:

### Self-Closing Shortcodes (MUST use "/>" at the end)
These shortcodes MUST use self-closing syntax with "/>" at the end:

1. Stats Highlight: 
   \`\`\`
   {{< data-modules/stats-highlight title="Title" columns="3" />}}
   \`\`\`

2. Checklist Item: 
   \`\`\`
   {{< interactive-modules/checklist-item label="Item label text" />}}
   \`\`\`

3. Hero Image: 
   \`\`\`
   {{< visual-modules/hero-image src="https://ik.imagekit.io/example/image.jpg" alt="Alt text" caption="Caption text" />}}
   \`\`\`

### Nested Shortcodes (MUST have matching opening/closing tags)
These shortcodes MUST have proper opening and closing tags:

1. Section Header:
   \`\`\`
   {{< content-modules/section-header title="Section Title" level="2" >}}
     Section description text here.
   {{< /content-modules/section-header >}}
   \`\`\`

2. FAQ Container and Items:
   \`\`\`
   {{< content-modules/faq title="Common Questions" id="faq-section" >}}
     {{< content-modules/faq-item question="First question?" >}}
       Answer to the first question.
     {{< /content-modules/faq-item >}}
     
     {{< content-modules/faq-item question="Second question?" >}}
       Answer to the second question.
     {{< /content-modules/faq-item >}}
   {{< /content-modules/faq >}}
   \`\`\`

3. Resource Links and Cards:
   \`\`\`
   {{< interactive-modules/resource-links title="External Resources" columns="2" >}}
     {{< interactive-modules/resource-card title="Resource Title" url="https://example.com" type="article" >}}
       Description of the resource.
     {{< /interactive-modules/resource-card >}}
     
     {{< interactive-modules/resource-card title="Another Resource" url="https://example2.com" type="tool" >}}
       Description of another resource.
     {{< /interactive-modules/resource-card >}}
   {{< /interactive-modules/resource-links >}}
   \`\`\`

4. Timeline:
   \`\`\`
   {{< visual-modules/timeline title="Historical Timeline" >}}
     {{< visual-modules/timeline-item date="1950" title="First Event" >}}
       Description of the first event.
     {{< /visual-modules/timeline-item >}}
     
     {{< visual-modules/timeline-item date="1970" title="Second Event" >}}
       Description of the second event.
     {{< /visual-modules/timeline-item >}}
   {{< /visual-modules/timeline >}}
   \`\`\`

5. Condition Checklist:
   \`\`\`
   {{< interactive-modules/condition-checklist title="Condition Assessment" description="Check applicable items" >}}
     {{< interactive-modules/checklist-item label="First item to check" />}}
     {{< interactive-modules/checklist-item label="Second item to check" />}}
     {{< interactive-modules/checklist-item label="Third item to check" />}}
   {{< /interactive-modules/condition-checklist >}}
   \`\`\`

### Using Direct HTML Instead of Deprecated Shortcodes

1. For price tables, use direct HTML table rows instead of price-row shortcodes:
   \`\`\`
   {{< data-modules/price-table title="Price Ranges" description="Current market values" >}}
     <tr>
       <td>Item Category</td>
       <td>$100-$500</td>
       <td>Good condition</td>
     </tr>
     <tr>
       <td>Another Category</td>
       <td>$500-$1,000</td>
       <td>Excellent condition</td>
     </tr>
   {{< /data-modules/price-table >}}
   \`\`\`

2. For auction results, use direct HTML table rows instead of auction-item shortcodes:
   \`\`\`
   {{< auction-results title="Recent Auction Sales" description="Notable auction records" >}}
     <tr>
       <td>Item Name</td>
       <td>$5,000</td>
       <td>January 2025</td>
       <td>Sotheby's</td>
     </tr>
     <tr>
       <td>Another Item</td>
       <td>$3,500</td>
       <td>February 2025</td>
       <td>Christie's</td>
     </tr>
   {{< /auction-results >}}
   \`\`\`

Remember:
- ALWAYS add proper spacing around your shortcode content
- ALWAYS ensure nested shortcodes have matching opening/closing tags
- NEVER use markdown headings inside shortcodes
- ALWAYS place shortcodes on their own lines, not inline with text

## Image Data Available for This Article
Use these ImageKit URLs for images in your article:

\`\`\`json
${formattedImageData}
\`\`\`

This article must be highly linkable to improve search engine rankings. Extract useful URLs from the search results data and incorporate them naturally throughout the content.

IMPORTANT: 
1. Do NOT wrap your response in markdown code blocks. Generate only the article markdown content as plain text, with the front matter and all module shortcodes, ready for Hugo to process.
2. You MUST use ALL of the provided ImageKit URLs in the article. Each image should be included with proper markdown syntax and descriptive alt text. Do not use any images that aren't from the imagekitUrl parameters.
3. For EACH image in the ImageKit URLs list, include a standalone markdown image with this format: ![Descriptive alt text](image URL)
4. Include at least one image in each major section of the article for better visual engagement.

You have complete freedom to select which modules to use and how to structure the article. Use your judgment to create the most effective presentation of the information.

## Input Data

${formattedData}

## Module Documentation

${moduleDocumentation}
`;
}

async function callClaudeAPI(prompt) {
  // If no API key is available, return a fallback message
  if (!API_KEY) {
    console.warn('No ANTHROPIC_API_KEY found in environment variables. Skipping API call and using placeholder content.');
    return getPlaceholderContent();
  }
  
  // Check if prompt is too large (over 100,000 chars)
  if (prompt.length > 100000) {
    console.warn(`Prompt is very large (${prompt.length} chars). This may cause API errors.`);
    console.log('Truncating prompt to improve reliability...');
    // Keep the instructions and truncate the data
    const promptParts = prompt.split('## Input Data');
    if (promptParts.length > 1) {
      const instructions = promptParts[0];
      prompt = instructions + '\n## Input Data\n\nSome input data was truncated due to size limitations.\n\n' + 
               'Please create an article based on the keyword and available information.\n\n' +
               '## Module Documentation\n' + prompt.split('## Module Documentation')[1];
      console.log(`Truncated prompt to ${prompt.length} chars`);
    }
  }

  try {
    console.log(`Using API version ${API_VERSION} for Claude API call`);
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: MODEL,
        max_tokens: 64000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json', 
          'x-api-key': API_KEY,
          'anthropic-version': API_VERSION
        }
      }
    );
    
    // Log successful API call
    console.log(`Claude API call successful, received ${response.data.content[0].text.length} characters response`);
    
    return response.data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    
    // More detailed error logging
    if (error.response) {
      // The request was made and the server responded with a status code outside the 2xx range
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from API');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up API request:', error.message);
    }
    
    console.log('Using placeholder content instead due to API error');
    return getPlaceholderContent();
  }
}

function getPlaceholderContent() {
  return `---
title: "${ARTICLE_TITLE}"
description: "Comprehensive guide to understanding and valuing ${ARTICLE_KEYWORD}. Learn about identification, pricing factors, and where to sell."
slug: "${ARTICLE_KEYWORD.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}"
date: ${new Date().toISOString().split('T')[0]}T10:30:00-04:00
lastmod: ${new Date().toISOString().split('T')[0]}T10:30:00-04:00
draft: false
featured_image: "https://ik.imagekit.io/appraisily/SEO/placeholder-image.jpg"
image_alt: "Placeholder image for ${ARTICLE_KEYWORD} article"
category: "Antiques"
type: "article"
author: "Appraisily Team"
featured: true
meta_title: "${ARTICLE_TITLE} | Expert Guide"
meta_description: "Discover everything you need to know about ${ARTICLE_KEYWORD} in this comprehensive guide. Expert tips on identification, valuation, and where to sell."
canonical_url: "https://articles.appraisily.com/articles/${ARTICLE_KEYWORD.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}"
keywords:
  - "${ARTICLE_KEYWORD.toLowerCase()}"
  - "${ARTICLE_KEYWORD.toLowerCase()} value"
  - "${ARTICLE_KEYWORD.toLowerCase()} identification"
  - "${ARTICLE_KEYWORD.toLowerCase()} price guide"
---

## Introduction to ${ARTICLE_KEYWORD}

This is a placeholder article for ${ARTICLE_KEYWORD}. To generate real content, please set up your Anthropic API key following the instructions in the CLAUDE.md file.

## Placeholder Content

This placeholder article was created because:

1. The necessary API key was not found
2. There was an error contacting the API
3. The content generation process encountered an issue

To generate the actual article, make sure you have:

- Set up a valid Anthropic API key in the .env file
- Checked your internet connection
- Verified that the Anthropic API is available

## What to Expect in the Full Article

The complete article would include comprehensive information about:

- The history and background of ${ARTICLE_KEYWORD}
- How to identify authentic ${ARTICLE_KEYWORD}
- Factors that affect the value of ${ARTICLE_KEYWORD}
- Current market prices for different types and conditions
- Where to buy and sell ${ARTICLE_KEYWORD}
- Expert tips for collectors and investors

## Next Steps

Follow the instructions in the SETUP.md file to properly configure your environment variables and API keys, then run the generate command again.
`;
}

// Process command line arguments
function processArguments() {
  // Check for command line arguments
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Please provide a keyword for article generation.');
    console.log('Usage: node generate-article.js "keyword" [--force]');
    process.exit(1);
  }
  
  // Extract keyword and check for force flag
  const keyword = args[0];
  const forceRegenerate = args.includes('--force');
  
  return { keyword, forceRegenerate };
}

// If this script is run directly, not imported
if (require.main === module) {
  const { keyword, forceRegenerate } = processArguments();
  generateArticle(keyword, forceRegenerate);
}

// Export functions for use in other scripts
module.exports = { generateArticle };