#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { promisify } = require('util');
const { generateArticle } = require('../generate-article');
const { enhanceArticleWithSEO } = require('../generate-seo');

// Load environment variables with higher priority for directly set env vars
const envPaths = [
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', '..', '.env')
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
process.env.CLAUDE_MODEL = 'claude-3-7-sonnet-latest';
process.env.ANTHROPIC_VERSION = '2023-06-01';

console.log('Starting limited force regeneration with:');
console.log('- CLAUDE_MODEL:', process.env.CLAUDE_MODEL);
console.log('- ANTHROPIC_VERSION:', process.env.ANTHROPIC_VERSION);

const readdir = promisify(fs.readdir);
const exists = promisify(fs.exists);

// Constants
const ROOT_DIR = path.join(__dirname, '..', '..');
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
    
    await generateArticle(keyword, true); // Force regenerate
    
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
  
  // Find articles without corresponding research folders
  const orphanedArticles = articleFiles.filter(article => 
    !researchFolders.includes(article)
  );
  
  // Find research folders that have articles
  const completedArticles = researchFolders.filter(folder => 
    articleFiles.includes(folder)
  );
  
  return {
    researchFolders,
    articleFiles,
    pendingArticles,
    completedArticles,
    orphanedArticles
  };
}

/**
 * Main function to process a limited number of articles
 * @param {number} limit - Maximum number of articles to process
 */
async function processLimitedArticles(limit = 5) {
  try {
    console.log(`Limited force regeneration: Will regenerate up to ${limit} articles\n`);
    
    // Get repository state analysis
    const analysis = await analyzeRepositoryState();
    console.log('Repository State Analysis:');
    console.log(`- Total research folders: ${analysis.researchFolders.length}`);
    console.log(`- Total articles: ${analysis.articleFiles.length}`);
    console.log(`- Pending articles: ${analysis.pendingArticles.length}`);
    console.log(`- Completed articles: ${analysis.completedArticles.length}`);
    console.log(`- Orphaned articles: ${analysis.orphanedArticles.length}\n`);
    
    // Randomly select a limited number of article folders to regenerate
    let foldersToProcess = [...analysis.completedArticles];
    
    // Shuffle the array to select random folders
    foldersToProcess = foldersToProcess.sort(() => Math.random() - 0.5);
    
    // Take the first 'limit' folders
    foldersToProcess = foldersToProcess.slice(0, limit);
    
    console.log(`Selected ${foldersToProcess.length} folders to process:`);
    foldersToProcess.forEach(folder => console.log(`- ${folder}`));
    console.log('');
    
    // Process each selected folder
    for (const keyword of foldersToProcess) {
      await processKeyword(keyword, true);
    }
    
    // Print a relationship table between research data and articles
    console.log('\nRelationship between research data and articles:');
    
    const tableData = [...analysis.researchFolders].map(folder => {
      const hasArticle = analysis.articleFiles.includes(folder);
      const status = foldersToProcess.includes(folder) 
        ? '🔄 Regenerated' 
        : (hasArticle ? '✅ Has Article' : '❌ Pending');
      
      return {
        keyword: folder,
        status
      };
    });
    
    // Log as table
    console.table(tableData);
    
    console.log('\nAll selected articles have been regenerated!');
  } catch (error) {
    console.error('Error processing articles:', error);
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const limit = args.length > 0 && !isNaN(parseInt(args[0])) 
    ? parseInt(args[0]) 
    : 5;
  
  return { limit };
}

// Run the main function if called directly
if (require.main === module) {
  const { limit } = parseArgs();
  processLimitedArticles(limit);
}

module.exports = { processLimitedArticles };