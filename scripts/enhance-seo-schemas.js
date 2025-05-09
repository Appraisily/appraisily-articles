const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const { promisify } = require('util');
const matter = require('gray-matter');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
// Also check parent directory for .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure these parameters
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20240301';

/**
 * Check if an article has the enhanced schema formats
 * @param {Object} frontMatter - The article's front matter
 * @returns {boolean} Whether the article has all enhanced schema formats
 */
function hasEnhancedSchemas(frontMatter) {
  // Check if structured_data exists
  if (!frontMatter.structured_data) {
    return false;
  }

  const structuredData = frontMatter.structured_data;
  
  // Check for ImageObject format
  const hasImageObject = structuredData.image && 
                        typeof structuredData.image === 'object' && 
                        structuredData.image['@type'] === 'ImageObject';
  
  // We don't force FAQPage and HowTo to exist since they're content-dependent
  // But we check if there's any existing schema that needs updating
  const needsEnhancement = !hasImageObject;
  
  return !needsEnhancement;
}

/**
 * Enhance article with the new schema formats
 * @param {string} filePath - Path to the article markdown file
 */
async function enhanceArticleSchemas(filePath) {
  try {
    console.log(`Checking schemas for ${filePath}`);
    
    // Read the article content
    const fileContent = await readFile(filePath, 'utf8');
    const { data: frontMatter, content } = matter(fileContent);
    
    // Check if the article already has enhanced schemas
    if (hasEnhancedSchemas(frontMatter)) {
      console.log(`✅ Article already has enhanced schemas: ${filePath}`);
      return;
    }
    
    console.log(`Enhancing schemas for ${filePath}`);
    
    const keyword = path.basename(filePath, '.md');
    
    // Prepare the schema enhancement prompt
    const prompt = createSchemaPrompt(keyword, frontMatter, content);
    
    // Call Claude API
    console.log('Calling Claude API for schema enhancement...');
    const schemaData = await callClaudeAPI(prompt, keyword);
    
    // Parse the schema data (expected in JSON format)
    const schemaMetadata = JSON.parse(schemaData);
    
    // Merge the original front matter with new schema metadata
    const enhancedFrontMatter = {
      ...frontMatter,
      ...schemaMetadata
    };
    
    // Create new file content with enhanced front matter
    const enhancedFileContent = matter.stringify(content, enhancedFrontMatter);
    
    // Write the enhanced content back to the file
    await writeFile(filePath, enhancedFileContent);
    
    console.log(`✅ Schema enhancement completed for ${filePath}`);
    console.log('Added schemas:', JSON.stringify(schemaMetadata, null, 2));
    
  } catch (error) {
    console.error(`Error enhancing schemas for ${filePath}:`, error);
    // Log the error to a file
    const logPath = path.join(logsDir, 'schema-enhancement-errors.log');
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - Error enhancing schemas for ${filePath}: ${error.message}\n`;
    fs.appendFileSync(logPath, logEntry);
  }
}

/**
 * Create a prompt for Claude to generate enhanced schema metadata
 */
function createSchemaPrompt(keyword, frontMatter, content) {
  return `
You are a specialized SEO expert focusing on schema.org structured data for articles about antiques, art appraisal, and collectibles. 
I'm going to provide you with the content of an article from Appraisily.com. Your task is to enhance the existing structured data
with additional schema types to improve search visibility.

Keyword: ${keyword}

Current front matter:
${JSON.stringify(frontMatter, null, 2)}

Article content (first 3000 characters to help you understand the topic):
${content.substring(0, 3000)}...

Based on this content, please generate enhanced structured data in JSON format. Focus only on the structured_data field
with the following enhancements:

1. structured_data: An enhanced Schema.org structured data object including:

   A. Article Schema:
      - @type: "Article"
      - headline: The article title
      - description: A brief description
      - author information
      - datePublished: Use the date from front matter
      - dateModified: Use the lastmod from front matter
      - image: Enhanced ImageObject format (see below)
      - publisher information

   B. Enhanced Image Format:
      Instead of just a URL string for the image, use full ImageObject format:
      {
        "@type": "ImageObject",
        "url": "[same URL from featured_image in frontmatter]",
        "width": "1200",
        "height": "630",
        "caption": "Descriptive caption based on image_alt and content"
      }

   C. FAQPage Schema (if the article has FAQ sections):
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "[extracted question from content]",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "[extracted answer from content]"
            }
          },
          // Include all FAQ items from the article
        ]
      }

   D. HowTo Schema (if the article contains step-by-step instructions):
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "[title of the how-to section]",
        "step": [
          {
            "@type": "HowToStep",
            "name": "[step title/heading]",
            "text": "[step instructions]",
            "image": "[relevant image URL if available]"
          },
          // Include all steps from the article
        ]
      }

IMPORTANT INSTRUCTIONS:
1. Extract real FAQs from the content - look for FAQ sections, h2/h3 headings that are questions, or content in question-answer format
2. For HowTo schema, only include if the article genuinely contains step-by-step instructions or a process
3. Use actual content from the article whenever possible instead of generating new content
4. If the article doesn't have FAQs or step-by-step instructions, omit those schema types entirely
5. For image dimensions, use 1200x630 as default unless actual dimensions are specified in the content
6. Return ONLY the structured_data field in your JSON, as I'll be merging it with the existing front matter

Return ONLY valid JSON that can be directly parsed and used as front matter, without explanations or surrounding text.
`;
}

/**
 * Call Claude API to generate schema data with retry logic
 */
async function callClaudeAPI(prompt, keyword) {
  // If no API key is available, return null
  if (!API_KEY) {
    console.warn('No ANTHROPIC_API_KEY found in environment variables. Skipping API call.');
    return null;
  }

  const maxRetries = 3;
  let retryCount = 0;
  let backoffTime = 1000; // Start with 1 second

  while (retryCount <= maxRetries) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: MODEL,
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          system: 'You are a specialized SEO expert for schema.org structured data. Analyze the provided content to generate comprehensive structured data including Article schema with ImageObject format, FAQPage schema for any FAQ sections, and HowTo schema for instructional content. Extract real questions, answers, and steps from the content. Return only valid JSON containing just the structured_data field, without any explanations or markdown formatting.',
          temperature: 0.3
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
      retryCount++;
      console.warn(`API call failed (attempt ${retryCount}/${maxRetries}): ${error.message}`);
      
      if (retryCount <= maxRetries) {
        console.log(`Retrying in ${backoffTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        backoffTime *= 2; // Exponential backoff
      } else {
        console.error('All retry attempts failed.');
        throw error;
      }
    }
  }
}

/**
 * Process all articles in the content directory
 */
async function processAllArticles() {
  try {
    // Process all articles in the content directory
    const articlesDir = path.join(__dirname, '..', 'content', 'articles');
    const files = fs.readdirSync(articlesDir)
      .filter(file => file.endsWith('.md') && !file.startsWith('_'));
      
    console.log(`Found ${files.length} articles to check`);
    
    // Create a log file for the process
    const logPath = path.join(logsDir, 'schema-enhancement.log');
    const startTimestamp = new Date().toISOString();
    const startLogEntry = `${startTimestamp} - Starting schema enhancement process for ${files.length} articles\n`;
    fs.writeFileSync(logPath, startLogEntry);
    
    // Count for summary
    let enhancedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        const filePath = path.join(articlesDir, file);
        
        // Read the file content
        const fileContent = await readFile(filePath, 'utf8');
        const { data: frontMatter } = matter(fileContent);
        
        // Check if the article already has enhanced schemas
        if (hasEnhancedSchemas(frontMatter)) {
          console.log(`✅ Article already has enhanced schemas: ${file}`);
          skippedCount++;
          continue;
        }
        
        // Enhance the article schemas
        await enhanceArticleSchemas(filePath);
        enhancedCount++;
        
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        errorCount++;
      }
    }
    
    // Write summary to log
    const endTimestamp = new Date().toISOString();
    const summaryLogEntry = `
${endTimestamp} - Schema enhancement process completed
  Total articles: ${files.length}
  Enhanced: ${enhancedCount}
  Skipped (already enhanced): ${skippedCount}
  Errors: ${errorCount}
\n`;
    fs.appendFileSync(logPath, summaryLogEntry);
    
    console.log('Schema enhancement process completed');
    console.log(`Enhanced: ${enhancedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
  } catch (error) {
    console.error('Error processing articles:', error);
  }
}

/**
 * Process a single article
 * @param {string} articlePath - Path to the article
 */
async function processSingleArticle(articlePath) {
  try {
    if (!fs.existsSync(articlePath)) {
      console.error(`Article not found: ${articlePath}`);
      return;
    }
    
    await enhanceArticleSchemas(articlePath);
    console.log('Article schema enhancement completed');
  } catch (error) {
    console.error('Error processing article:', error);
  }
}

// If run directly
if (require.main === module) {
  const targetArticle = process.argv[2];
  
  if (targetArticle) {
    // Check if it's a relative path or just a filename
    const articlePath = targetArticle.endsWith('.md')
      ? path.resolve(targetArticle)
      : path.join(__dirname, '..', 'content', 'articles', `${targetArticle}.md`);
    
    processSingleArticle(articlePath);
  } else {
    processAllArticles();
  }
}

module.exports = { enhanceArticleSchemas, processAllArticles, processSingleArticle }; 