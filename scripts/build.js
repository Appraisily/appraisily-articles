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
const { promisify } = require('util');
const { spawn } = require('child_process');
const crypto = require('crypto');
const { enhanceArticleWithSEO } = require('./generate-seo');
const { validateAllArticles } = require('./validate-shortcodes');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

// Constants
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'articles');
const DATA_DIR = path.join(__dirname, '..');
const CACHE_DIR = path.join(__dirname, '..', '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'article-hashes.json');

/**
 * Create MD5 hash from file content
 * @param {string} content - File content to hash
 * @returns {string} - MD5 hash
 */
function createHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Loads the cache of article hashes
 * @returns {Object} - Article cache with hashes
 */
async function loadCache() {
  try {
    // Ensure cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      await mkdir(CACHE_DIR, { recursive: true });
    }
    
    // Load cache if it exists
    if (fs.existsSync(CACHE_FILE)) {
      const cacheContent = await readFile(CACHE_FILE, 'utf8');
      return JSON.parse(cacheContent);
    }
    
    return {};
  } catch (error) {
    console.error('Error loading cache:', error);
    return {};
  }
}

/**
 * Save the current cache to disk
 * @param {Object} cache - Article cache with hashes
 */
async function saveCache(cache) {
  try {
    await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log('Cache saved successfully');
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

/**
 * Checks if a new article needs to be generated based on changes in source files
 * @param {string} keyword - Article keyword
 * @param {Object} cache - Cache of article hashes
 * @returns {boolean} - True if article needs to be regenerated
 */
async function needsRegeneration(keyword, cache) {
  try {
    // Check if article already exists
    const articlePath = path.join(CONTENT_DIR, `${keyword}.md`);
    if (!fs.existsSync(articlePath)) {
      console.log(`Article for ${keyword} doesn't exist yet, needs generation`);
      return true;
    }
    
    // Check if source directory exists
    const sourceDir = path.join(DATA_DIR, keyword);
    if (!fs.existsSync(sourceDir)) {
      console.log(`Source directory for ${keyword} not found, using existing article`);
      return false;
    }
    
    // Check the hash of all source files
    const sourceFiles = (await readdir(sourceDir)).filter(file => file.endsWith('.json'));
    let currentSourceHash = '';
    
    for (const file of sourceFiles) {
      const content = await readFile(path.join(sourceDir, file), 'utf8');
      currentSourceHash += createHash(content);
    }
    
    // Final combined hash
    const finalHash = createHash(currentSourceHash);
    
    // If no previous hash exists or hash is different, regenerate
    if (!cache[keyword] || cache[keyword].sourceHash !== finalHash) {
      console.log(`Source files for ${keyword} have changed, needs regeneration`);
      return true;
    }
    
    console.log(`No changes detected for ${keyword}, using cached article`);
    return false;
  } catch (error) {
    console.error(`Error checking regeneration for ${keyword}:`, error);
    // If error occurs, regenerate to be safe
    return true;
  }
}

/**
 * Generate article if needed and update cache
 * @param {string} keyword - Article keyword
 * @param {Object} cache - Cache of article hashes
 */
async function processArticle(keyword, cache) {
  try {
    // Check if we need to regenerate
    if (await needsRegeneration(keyword, cache)) {
      console.log(`Generating article for ${keyword}...`);
      
      try {
        // Execute article generation with environment variables passed through
        await new Promise((resolve, reject) => {
          const env = { ...process.env };
          // Ensure API key is passed to child process
          if (process.env.ANTHROPIC_API_KEY) {
            console.log(`Passing ANTHROPIC_API_KEY to article generation for ${keyword}`);
          }
          
          const generateProcess = spawn('node', ['generate-article.js', keyword], {
            cwd: __dirname,
            stdio: 'inherit',
            env: env
          });
          
          generateProcess.on('close', code => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`Article generation failed with code ${code}`));
            }
          });
        });
        
        // Calculate new hash for source files
        const sourceDir = path.join(DATA_DIR, keyword);
        const sourceFiles = (await readdir(sourceDir)).filter(file => file.endsWith('.json'));
        let sourceHash = '';
        
        for (const file of sourceFiles) {
          const content = await readFile(path.join(sourceDir, file), 'utf8');
          sourceHash += createHash(content);
        }
        
        // Update cache
        cache[keyword] = {
          sourceHash: createHash(sourceHash),
          lastGenerated: new Date().toISOString()
        };
        
        // SEO enhancement
        const articlePath = path.join(CONTENT_DIR, `${keyword}.md`);
        await enhanceArticleWithSEO(articlePath);
      } catch (genError) {
        console.error(`Article generation for ${keyword} failed, but continuing build:`, genError);
        // Check if the article file exists already - if so, we can still proceed with the build
        const articlePath = path.join(CONTENT_DIR, `${keyword}.md`);
        if (!fs.existsSync(articlePath)) {
          console.warn(`No existing article found for ${keyword}, creating a placeholder`);
          // Create a simple placeholder article
          const placeholder = `---
title: "${keyword.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}"
date: ${new Date().toISOString().split('T')[0]}
description: "Information about ${keyword}"
draft: false
---

# ${keyword.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}

This is a placeholder article. Content generation was skipped during the build process.
`;
          await writeFile(articlePath, placeholder);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing article ${keyword}:`, error);
  }
}

/**
 * Validates all articles for proper shortcode syntax
 */
async function validateArticles() {
  console.log('Validating article shortcodes...');
  try {
    await validateAllArticles();
    return true;
  } catch (error) {
    console.error('Article validation failed:', error);
    return false;
  }
}

/**
 * Builds the Hugo site
 */
async function buildHugoSite() {
  console.log('Building Hugo site...');
  
  // Validate articles first
  const validationPassed = await validateArticles();
  if (!validationPassed) {
    throw new Error('Article validation failed. Fix shortcode errors before building.');
  }
  
  return new Promise((resolve, reject) => {
    const hugoProcess = spawn('hugo', ['--gc', '--minify'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    hugoProcess.on('close', code => {
      if (code === 0) {
        console.log('Hugo site built successfully');
        resolve();
      } else {
        reject(new Error(`Hugo build failed with code ${code}`));
      }
    });
  });
}

/**
 * Generate enhanced sitemap after Hugo build
 */
async function generateSitemap() {
  console.log('Generating enhanced sitemap...');
  
  return new Promise((resolve, reject) => {
    const sitemapProcess = spawn('node', ['generate-sitemap.js'], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    sitemapProcess.on('close', code => {
      if (code === 0) {
        console.log('Sitemap generated successfully');
        resolve();
      } else {
        console.warn(`Sitemap generation failed with code ${code}, but continuing build`);
        resolve(); // Continue build even if sitemap fails
      }
    });
  });
}

/**
 * Main build function
 */
async function build() {
  try {
    console.log('Starting build process...');
    
    // Load cache
    const cache = await loadCache();
    
    // Get all article folders (excluding node_modules, .git, etc.)
    const allDirs = fs.readdirSync(DATA_DIR, { withFileTypes: true })
      .filter(dirent => 
        dirent.isDirectory() && 
        !dirent.name.startsWith('.') && 
        !['node_modules', 'scripts', 'content', 'layouts', 'static', 'archetypes', 'resources', 'public'].includes(dirent.name)
      )
      .map(dirent => dirent.name);
    
    console.log(`Found ${allDirs.length} potential article sources`);
    
    // Process each article sequentially
    for (const keyword of allDirs) {
      await processArticle(keyword, cache);
    }
    
    // Save updated cache
    await saveCache(cache);
    
    // Build the Hugo site
    await buildHugoSite();
    
    // Generate enhanced sitemap
    await generateSitemap();
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build process failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  build();
}

module.exports = { build };