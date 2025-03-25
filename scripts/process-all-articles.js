#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { promisify } = require('util');
const { generateArticle } = require('./generate-article');
const { enhanceArticleWithSEO } = require('./generate-seo');

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

// Debug API key availability
const API_KEY = process.env.ANTHROPIC_API_KEY;
if (API_KEY) {
  const maskedKey = API_KEY.substring(0, 10) + '...' + API_KEY.substring(API_KEY.length - 5);
  console.log(`ANTHROPIC_API_KEY found: ${maskedKey}`);
} else {
  console.warn('WARNING: No ANTHROPIC_API_KEY found in environment variables!');
}

// Set working model and API version
process.env.CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-latest';
process.env.ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION || '2023-06-01';

const readdir = promisify(fs.readdir);
const exists = promisify(fs.exists);

// Constants
const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'content');
const CONTENT_DIR = path.join(ROOT_DIR, 'content', 'articles');

/**
 * Find all data folders that could contain keyword data
 * @returns {Promise<string[]>} - Array of keyword folder names
 */
async function findKeywordFolders() {
  try {
    // Get all directories in the content folder
    const allDirs = fs.readdirSync(DATA_DIR, { withFileTypes: true })
      .filter(dirent => 
        dirent.isDirectory() && 
        !dirent.name.startsWith('.') && 
        !['articles', '_index.md', 'node_modules'].includes(dirent.name)
      )
      .map(dirent => dirent.name);
    
    // Further filter to only include directories that have JSON files
    const keywordFolders = [];
    for (const dir of allDirs) {
      const dirPath = path.join(DATA_DIR, dir);
      const files = await readdir(dirPath);
      
      // Check if directory has JSON files with expected naming pattern
      const hasJsonData = files.some(file => 
        file.endsWith('.json') && 
        (file.includes('serper') || file.includes('perplexity') || 
         file.includes('auction') || file.includes('paa') || 
         file.includes('images') || file === 'serper-data.json' ||
         file === 'perplexity-data.json' || file === 'paa-data.json' ||
         file === 'images-data.json')
      );
      
      if (hasJsonData) {
        keywordFolders.push(dir);
      }
    }
    
    return keywordFolders;
  } catch (error) {
    console.error('Error finding keyword folders:', error);
    return [];
  }
}

/**
 * Check if a keyword already has a generated article
 * @param {string} keyword - The keyword to check
 * @returns {Promise<boolean>} - True if article exists
 */
async function articleExists(keyword) {
  // First check if there's an index.md file in the keyword's folder
  const indexPath = path.join(DATA_DIR, keyword, 'index.md');
  const indexExists = await exists(indexPath);
  
  if (indexExists) {
    return true;
  }
  
  // Then check if there's a keyword.md file in the articles directory
  const articlePath = path.join(CONTENT_DIR, `${keyword}.md`);
  return await exists(articlePath);
}

/**
 * Process a single keyword to generate an article
 * @param {string} keyword - The keyword to process
 * @param {boolean} force - Force regeneration even if article exists
 */
async function processKeyword(keyword, force = false) {
  try {
    // Check if article already exists
    const hasArticle = await articleExists(keyword);
    
    if (hasArticle && !force) {
      console.log(`✓ Article for "${keyword}" already exists`);
      return;
    }
    
    if (hasArticle && force) {
      console.log(`🔄 Force regenerating article for "${keyword}"...`);
    } else {
      console.log(`🔄 Generating article for "${keyword}"...`);
    }
    
    await generateArticle(keyword, force);
    
    // Enhance with SEO metadata
    const articlePath = path.join(CONTENT_DIR, `${keyword}.md`);
    await enhanceArticleWithSEO(articlePath);
    
    console.log(`✅ Article for "${keyword}" generated successfully!`);
  } catch (error) {
    console.error(`❌ Error processing "${keyword}":`, error);
  }
}

/**
 * Get an analysis of the repository state
 * @returns {Object} - Analysis object with available research folders and articles
 */
async function analyzeRepositoryState() {
  // Find all keyword folders with research data
  const researchFolders = await findKeywordFolders();
  
  // Get all markdown files in the articles directory
  const articleFiles = fs.existsSync(CONTENT_DIR) 
    ? fs.readdirSync(CONTENT_DIR)
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace('.md', ''))
    : [];
  
  // Find folders with research data but no articles
  const pendingArticles = [];
  for (const folder of researchFolders) {
    const hasArticle = await articleExists(folder);
    if (!hasArticle) {
      pendingArticles.push(folder);
    }
  }
  
  // Find research folders that have articles
  const completedArticles = researchFolders.filter(async folder => {
    const hasArticle = await articleExists(folder);
    return hasArticle;
  });
  
  return {
    researchFolders,
    articleFiles,
    pendingArticles,
    completedArticles
  };
}

/**
 * Main function to process all pending articles
 * @param {boolean} force - Force regeneration of all articles
 */
async function processAllPendingArticles(force = false) {
  try {
    // Show debug info 
    console.log(`Environment info:
- Claude model: ${process.env.CLAUDE_MODEL}
- API version: ${process.env.ANTHROPIC_VERSION}
- Force mode: ${force ? 'Enabled' : 'Disabled'}
`);
    
    // Get repository state analysis
    const analysis = await analyzeRepositoryState();
    
    // Find all keyword folders
    const keywordFolders = analysis.researchFolders;
    console.log(`Found ${keywordFolders.length} potential keyword folders`);
    
    if (force) {
      console.log('Force rebuild mode: Will regenerate all existing articles');
      
      // Process each keyword folder
      for (const keyword of keywordFolders) {
        if (keyword === '--force' || keyword === '-f') {
          console.log(`Skipping keyword "${keyword}" as it appears to be a flag`);
          continue;
        }
        await processKeyword(keyword, true);
      }
      
      console.log('All articles have been regenerated!');
      return;
    }
    
    // Use the pendingArticles from our analysis
    const pendingArticles = analysis.pendingArticles;
    
    if (pendingArticles.length === 0) {
      console.log('No pending articles to generate. All articles are up to date.');
      console.log('To force rebuild all articles, use: npm run generate:all -- --force');
      
      // Print repository state summary
      const completedCount = keywordFolders.length - pendingArticles.length;
      console.log(`\nRepository Summary:`);
      console.log(`- Total keyword folders: ${keywordFolders.length}`);
      console.log(`- Completed articles: ${completedCount}`);
      console.log(`- Pending articles: ${pendingArticles.length}`);
      return;
    }
    
    console.log(`Found ${pendingArticles.length} pending articles to generate:`);
    pendingArticles.forEach(keyword => console.log(`- ${keyword}`));
    console.log('');
    
    // Process each pending article
    for (const keyword of pendingArticles) {
      await processKeyword(keyword);
    }
    
    console.log('All pending articles have been processed!');
    
    // Print final stats
    const updatedAnalysis = await analyzeRepositoryState();
    const remainingPending = updatedAnalysis.pendingArticles.length;
    
    console.log(`\nFinal Repository State:`);
    console.log(`- Total keyword folders: ${updatedAnalysis.researchFolders.length}`);
    console.log(`- Completed articles: ${updatedAnalysis.researchFolders.length - remainingPending}`);
    console.log(`- Remaining pending: ${remainingPending}`);
    
    if (remainingPending > 0) {
      console.log('\nThere are still some pending articles. Run the command again to process them.');
    }
  } catch (error) {
    console.error('Error processing pending articles:', error);
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');
  
  // Debug info
  console.log('Command line arguments:', args);
  console.log('Force mode:', force ? 'Enabled' : 'Disabled');
  
  return { force };
}

// Run the main function if called directly
if (require.main === module) {
  const { force } = parseArgs();
  processAllPendingArticles(force);
}

module.exports = { processAllPendingArticles };