const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
// Also check parent directory for .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const axios = require('axios');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configure these parameters
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20240301';

// Process command line arguments
const KEYWORD = process.argv[2] || 'old-camera-value';
// Derive a default title from the keyword (can be overridden later)
const ARTICLE_TITLE = KEYWORD.split('-').map(word => 
  word.charAt(0).toUpperCase() + word.slice(1)
).join(' ') + ': Expert Guide to Appraisal and Value';
const OUTPUT_FILE = `content/articles/${KEYWORD}.md`;

async function generateArticle(keyword = KEYWORD, articleTitle = ARTICLE_TITLE) {
  try {
    console.log(`Starting article generation for keyword: ${keyword}`);
    
    // 1. Read all JSON files from the keyword's folder
    // Try both in the root folder and content folder
    let keywordFolder = path.join(__dirname, '..', keyword);
    if (!fs.existsSync(keywordFolder)) {
      // Try in the content folder
      keywordFolder = path.join(__dirname, '..', 'content', keyword);
      if (!fs.existsSync(keywordFolder)) {
        throw new Error(`Data folder for keyword "${keyword}" does not exist at ${keywordFolder}`);
      }
    }
    
    const jsonFiles = fs.readdirSync(keywordFolder)
      .filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      throw new Error(`No JSON files found in ${keywordFolder}`);
    }
    
    const jsonData = {};
    for (const file of jsonFiles) {
      const content = await readFile(path.join(keywordFolder, file), 'utf8');
      jsonData[file] = JSON.parse(content);
    }
    
    // 2. Read the AI modules documentation
    const aiModulesDocs = await readFile(path.join(__dirname, '..', 'AI-MODULES.md'), 'utf8');
    
    // 3. Read the style guide
    const styleGuide = await readFile(path.join(__dirname, '..', 'STYLE-GUIDE.md'), 'utf8');
    
    // 4. Prepare the prompt
    const prompt = createPrompt(keyword, articleTitle, jsonData, aiModulesDocs, styleGuide);
    
    // 5. Call Claude API
    console.log('Calling Claude API...');
    const result = await callClaudeAPI(prompt);
    
    // 6. Save the result
    const outputFile = `content/articles/${keyword}.md`;
    await writeFile(path.join(__dirname, '..', outputFile), result);
    console.log(`Article successfully generated and saved to ${outputFile}`);
    
  } catch (error) {
    console.error('Error generating article:', error);
  }
}

function createPrompt(keyword, title, jsonData, aiModulesDocs, styleGuide) {
  // Function to safely get JSON data if it exists
  const getJsonData = (pattern) => {
    const keys = Object.keys(jsonData);
    const matchingKey = keys.find(key => key.includes(pattern));
    if (matchingKey) {
      return JSON.stringify(jsonData[matchingKey], null, 2);
    }
    return '{}'; // Empty object if not found
  };

  return `
# Article Generation Task

## Overview
You are tasked with creating a comprehensive article about "${title}" for the Appraisily website. 
You will use the research data provided in JSON format and the custom Hugo modules to create a well-structured, visually appealing article with strong SEO value.

## Input Data
The following JSON data contains research information about ${keyword}:

### Search Results
\`\`\`json
${getJsonData('serper')}
\`\`\`

### People Also Ask Data
\`\`\`json
${getJsonData('paa')}
\`\`\`

### Expert Research Content
\`\`\`json
${getJsonData('perplexity')}
\`\`\`

### Generated Image Descriptions
\`\`\`json
${getJsonData('images')}
\`\`\`

### Auction Results Data
\`\`\`json
${getJsonData('auction')}
\`\`\`

## Module Documentation
Use the following custom modules to structure your article:

${aiModulesDocs}

## Style Guidelines
Follow these style guidelines for the article:

${styleGuide.substring(0, 500)}... (style guide abbreviated for prompt length)

## Your Task

1. Create a full article about "${title}" using the provided research data.
2. Structure the article using the custom modules documented above.
3. Include YAML front matter with appropriate metadata (title, description, date, etc.).
4. Create a comprehensive, informative article that covers the topic thoroughly.
5. Use a mix of modules to create visual interest and present the data effectively.
6. IMPORTANT: Include numerous external links to authoritative sources. Extract URLs from the search results JSON data to create resource links throughout the article. This is crucial for SEO.
7. Use the resource-links module to create a dedicated "External Resources" section with at least 5-8 high-quality external links.
8. Make sure to link to relevant museum websites, auction houses, educational institutions, and collector resources where appropriate.
9. Ensure the article follows SEO best practices with proper keyword usage and semantic structure.
10. Include a comprehensive FAQ section addressing common questions from the research data.

This article must be highly linkable to improve search engine rankings. Extract useful URLs from the search results data and incorporate them naturally throughout the content.

You have complete freedom to select which modules to use and how to structure the article. Use your judgment to create the most effective presentation of the information.

Generate only the article markdown content, including the front matter and all module shortcodes, ready for Hugo to process.
`;
}

async function callClaudeAPI(prompt) {
  // If no API key is available, return a fallback message
  if (!API_KEY) {
    console.warn('No ANTHROPIC_API_KEY found in environment variables. Skipping API call and using placeholder content.');
    return `---
title: "${ARTICLE_TITLE}"
date: ${new Date().toISOString().split('T')[0]}
description: "Comprehensive guide on ${KEYWORD}."
draft: false
---

# This is a placeholder article

This article content would normally be generated by Claude AI. To generate actual content:

1. Set the ANTHROPIC_API_KEY environment variable
2. Run the article generation script again

## About this Article

This placeholder was created because no API key was found during the build process.`;
  }

  try {
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
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    return response.data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    console.log('Using placeholder content instead due to API error');
    return `---
title: "${ARTICLE_TITLE}"
date: ${new Date().toISOString().split('T')[0]}
description: "Comprehensive guide on ${KEYWORD}."
draft: false
---

# This is a placeholder article

This article content would normally be generated by Claude AI. To generate actual content:

1. Set the ANTHROPIC_API_KEY environment variable
2. Run the article generation script again

## About this Article

This placeholder was created because no API key was found during the build process.`;
  }
}

// Execute the function if called directly
if (require.main === module) {
  generateArticle();
}

module.exports = { generateArticle };