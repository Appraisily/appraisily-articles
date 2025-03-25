#!/usr/bin/env node

/**
 * Article Generation Trigger
 * 
 * This script provides an interface for external processes to trigger article generation.
 * It can be called from other repositories or scripts to process new content.
 * 
 * Usage:
 *   node trigger-generation.js [keyword] [--all]
 * 
 * Arguments:
 *   keyword - Optional specific keyword to process
 *   --all   - Process all pending articles
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { generateArticle } = require('./generate-article');
const { processAllPendingArticles } = require('./process-all-articles');

// Get the arguments
const args = process.argv.slice(2);
const processAll = args.includes('--all');
const keyword = args.find(arg => !arg.startsWith('--'));

// Log the trigger
console.log('Article generation triggered at', new Date().toISOString());
console.log('Working directory:', process.cwd());

/**
 * Build the Hugo site and update sitemap
 */
async function buildSite() {
  return new Promise((resolve, reject) => {
    console.log('Building Hugo site...');
    
    // Use the simple build which includes sitemap generation
    const buildProcess = spawn('npm', ['run', 'build:simple'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    buildProcess.on('close', code => {
      if (code === 0) {
        console.log('Hugo site built successfully');
        resolve();
      } else {
        console.error(`Hugo build failed with code ${code}`);
        reject(new Error(`Hugo build failed with code ${code}`));
      }
    });
  });
}

async function triggerGeneration() {
  try {
    if (processAll) {
      console.log('Processing all pending articles...');
      await processAllPendingArticles();
    } else if (keyword) {
      console.log(`Processing specific keyword: ${keyword}`);
      await generateArticle(keyword);
      console.log(`Article for "${keyword}" generated successfully`);
    } else {
      console.error('No action specified. Use --all or provide a specific keyword.');
      process.exit(1);
    }
    
    // Build the site to update main page and sitemap
    await buildSite();
    
    // Success status
    console.log('Article generation and site build completed successfully!');
    
    // Write status file for external processes to check
    const statusFile = path.join(__dirname, '..', '.generation-status.json');
    fs.writeFileSync(statusFile, JSON.stringify({
      status: 'success',
      timestamp: new Date().toISOString(),
      keyword: keyword || 'all',
      siteBuilt: true
    }, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error during article generation or site build:', error);
    
    // Write error status
    const statusFile = path.join(__dirname, '..', '.generation-status.json');
    fs.writeFileSync(statusFile, JSON.stringify({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      keyword: keyword || 'all',
      siteBuilt: false
    }, null, 2));
    
    process.exit(1);
  }
}

// Run the main function
triggerGeneration();