const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
// Also check parent directory for .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const axios = require('axios');
const { promisify } = require('util');
const matter = require('gray-matter');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure these parameters
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20240301';

/**
 * Enhance article with SEO metadata
 * @param {string} filePath - Path to the article markdown file
 */
async function enhanceArticleWithSEO(filePath) {
  try {
    console.log(`Enhancing SEO for ${filePath}`);
    
    // Read the article content
    const fileContent = await readFile(filePath, 'utf8');
    const { data: frontMatter, content } = matter(fileContent);
    
    const keyword = path.basename(filePath, '.md');
    
    // Prepare the SEO enhancement prompt
    const prompt = createSEOPrompt(keyword, frontMatter, content);
    
    // Call Claude API
    console.log('Calling Claude API for SEO enhancement...');
    const seoData = await callClaudeAPI(prompt, keyword);
    
    // Parse the SEO data (expected in JSON format)
    const seoMetadata = JSON.parse(seoData);
    
    // Merge the original front matter with new SEO metadata
    const enhancedFrontMatter = {
      ...frontMatter,
      ...seoMetadata
    };
    
    // Create new file content with enhanced front matter
    const enhancedFileContent = matter.stringify(content, enhancedFrontMatter);
    
    // Write the enhanced content back to the file
    await writeFile(filePath, enhancedFileContent);
    
    console.log(`✅ SEO enhancement completed for ${filePath}`);
    console.log('Added metadata:', JSON.stringify(seoMetadata, null, 2));
    
  } catch (error) {
    console.error('Error enhancing SEO:', error);
  }
}

/**
 * Create a prompt for Claude to generate SEO metadata
 */
function createSEOPrompt(keyword, frontMatter, content) {
  return `
You are a specialized SEO expert focusing on articles about antiques, art appraisal, and collectibles. 
I'm going to provide you with the content of an article from Appraisily.com. Your task is to analyze 
the content and create a comprehensive set of SEO metadata for this article.

Keyword: ${keyword}

Current front matter:
${JSON.stringify(frontMatter, null, 2)}

Article content (first 1000 characters):
${content.substring(0, 1000)}...

Based on this content, please generate the following SEO metadata in JSON format:

1. meta_title: An optimized title tag between 50-60 characters that includes the primary keyword
2. meta_description: A compelling meta description between 150-160 characters that summarizes the article
3. canonical_url: A canonical URL in the format "https://articles.appraisily.com/articles/[keyword]"
4. image_alt: Improved alt text for the featured image
5. keywords: An array of 5-7 highly relevant keywords and phrases
6. structured_data: Schema.org structured data including:
   - @type: "Article"
   - headline
   - description
   - author
   - datePublished
   - dateModified
   - image
   - publisher information

Return ONLY valid JSON that can be directly parsed and used as front matter, without explanations.
`;
}

/**
 * Log articles using fallback SEO data
 */
function logFallbackUsage(keyword) {
  const logPath = path.join(__dirname, '..', 'logs', 'fallback-seo.log');
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - Fallback SEO data used for: ${keyword}\n`;
  
  // Append to log file
  fs.appendFileSync(logPath, logEntry);
}

/**
 * Call Claude API to generate SEO data with retry logic
 */
async function callClaudeAPI(prompt, keyword) {
  // If no API key is available, return a basic SEO JSON
  if (!API_KEY) {
    console.warn('No ANTHROPIC_API_KEY found in environment variables. Skipping API call and using basic SEO data.');
    const basicSeoJson = JSON.stringify({
      meta_title: "Appraisily - Expert Guide for Art & Antique Valuation",
      meta_description: "Get expert insights on valuing, appraising, and selling your collectibles with our comprehensive guide.",
      keywords: ["appraisal", "value", "collectible", "antique", "worth", "price guide", "how much"],
      image_alt: "Detailed photograph showing item evaluation process"
    }, null, 2);
    logFallbackUsage(keyword || 'unknown-no-api-key');
    return basicSeoJson;
  }

  const maxRetries = 5;
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
          system: 'You are a specialized SEO expert for art and antiques content. Return only valid JSON without any explanations or markdown formatting.',
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
        logFallbackUsage(keyword || 'unknown-after-retries');
        throw error; // No fallback, as requested by user
      }
    }
  }
}

/**
 * Process a single article or all articles in the content directory
 */
async function processSEO(articlePath = null) {
  try {
    if (articlePath) {
      // Process a specific article
      await enhanceArticleWithSEO(articlePath);
    } else {
      // Process all articles in the content directory
      const articlesDir = path.join(__dirname, '..', 'content', 'articles');
      const files = fs.readdirSync(articlesDir)
        .filter(file => file.endsWith('.md') && !file.startsWith('_'));
        
      console.log(`Found ${files.length} articles to process`);
      
      for (const file of files) {
        const filePath = path.join(articlesDir, file);
        await enhanceArticleWithSEO(filePath);
      }
    }
    
    console.log('SEO enhancement process completed');
  } catch (error) {
    console.error('Error processing SEO:', error);
  }
}

/**
 * List all articles that used fallback SEO data
 */
function listArticlesUsingFallbackData() {
  const logPath = path.join(__dirname, '..', 'logs', 'fallback-seo.log');
  
  if (!fs.existsSync(logPath)) {
    console.log('No fallback SEO data log found.');
    return [];
  }
  
  const logContent = fs.readFileSync(logPath, 'utf8');
  const entries = logContent.split('\n').filter(line => line.trim());
  
  console.log('Articles using fallback SEO data:');
  entries.forEach(entry => console.log(entry));
  
  // Extract just the keywords from the log entries
  const keywords = entries.map(entry => {
    const match = entry.match(/Fallback SEO data used for: (.+)$/);
    return match ? match[1] : null;
  }).filter(Boolean);
  
  return keywords;
}

// If run directly
if (require.main === module) {
  const targetArticle = process.argv[2];
  
  if (targetArticle === '--list-fallback') {
    // List all articles that used fallback SEO data
    listArticlesUsingFallbackData();
  } else if (targetArticle === '--regen-fallback') {
    // Regenerate SEO for all articles that used fallback data
    const fallbackArticles = listArticlesUsingFallbackData();
    console.log(`Found ${fallbackArticles.length} articles to regenerate`);
    
    // Process each article that used fallback data
    (async () => {
      for (const keyword of fallbackArticles) {
        const articlePath = path.join(__dirname, '..', 'content', 'articles', `${keyword}.md`);
        if (fs.existsSync(articlePath)) {
          console.log(`Regenerating SEO for ${keyword}`);
          await enhanceArticleWithSEO(articlePath);
        } else {
          console.warn(`Article not found: ${keyword}`);
        }
      }
    })();
  } else if (targetArticle) {
    // Check if it's a relative path or just a filename
    const articlePath = targetArticle.endsWith('.md')
      ? path.resolve(targetArticle)
      : path.join(__dirname, '..', 'content', 'articles', `${targetArticle}.md`);
    
    processSEO(articlePath);
  } else {
    processSEO();
  }
}

module.exports = { enhanceArticleWithSEO, processSEO, listArticlesUsingFallbackData };