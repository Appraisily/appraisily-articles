#!/usr/bin/env node

/**
 * Enhanced sitemap generator for Appraisily Articles
 * This script creates an improved sitemap.xml with proper lastmod and priority attributes
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const execPromise = promisify(exec);

// Configuration
const BASE_URL = 'https://articles.appraisily.com';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SITEMAP_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');
const CONTENT_DIR = path.join(__dirname, '..', 'content');

/**
 * Get file modification date from git history or file system
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - ISO date string for lastmod
 */
async function getLastModified(filePath) {
  try {
    // Try to get last modified date from git
    const { stdout } = await execPromise(`git log -1 --format="%aI" -- "${filePath}"`);
    const gitDate = stdout.trim();
    
    if (gitDate) {
      return gitDate;
    }
    
    // Fallback to file system
    const stats = fs.statSync(filePath);
    return new Date(stats.mtime).toISOString();
  } catch (error) {
    // If all else fails, use current date
    return new Date().toISOString();
  }
}

/**
 * Get relative path from content directory
 * @param {string} filePath - Full path to the file
 * @returns {string} - Path relative to content directory
 */
function getRelativePath(filePath) {
  return filePath.replace(CONTENT_DIR, '').replace(/\.md$/, '');
}

/**
 * Calculate URL priority based on path depth
 * @param {string} urlPath - URL path
 * @returns {number} - Priority between 0.1 and 1.0
 */
function calculatePriority(urlPath) {
  // Count segments, ignoring empty ones
  const segments = urlPath.split('/').filter(Boolean).length;
  
  if (segments === 0) {
    return 1.0; // Homepage
  } else if (segments === 1) {
    return 0.8; // First level
  } else {
    return Math.max(0.5, 0.9 - (segments * 0.1)); // Deeper levels
  }
}

/**
 * Get URL path for sitemap
 * @param {string} relativePath - Path relative to content directory
 * @returns {string} - URL path for sitemap
 */
function getUrlPath(relativePath) {
  let urlPath = relativePath;
  
  // Handle index files
  if (urlPath.endsWith('/_index')) {
    urlPath = urlPath.replace('/_index', '/');
  } else if (urlPath === '/_index') {
    urlPath = '/';
  }
  
  // Ensure forward slashes for URLs (replace backslashes if any)
  urlPath = urlPath.replace(/\\/g, '/');
  
  return urlPath;
}

/**
 * Recursively find all Markdown files in a directory
 * @param {string} dir - Directory to search
 * @returns {string[]} - Array of file paths
 */
function findMarkdownFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      results = results.concat(findMarkdownFiles(itemPath));
    } else if (item.endsWith('.md')) {
      results.push(itemPath);
    }
  }
  
  return results;
}

/**
 * Create sitemap XML file
 */
async function generateSitemap() {
  try {
    // Check if Hugo has generated the public directory
    if (!fs.existsSync(PUBLIC_DIR)) {
      console.error('Error: Public directory does not exist. Run Hugo build first.');
      process.exit(1);
    }
    
    console.log('Generating enhanced sitemap.xml...');
    
    // Find all markdown files using cross-platform method
    const mdFiles = findMarkdownFiles(CONTENT_DIR);
    console.log(`Found ${mdFiles.length} markdown files`);
    
    // Start building sitemap XML
    let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';
    
    // Process each file
    for (const file of mdFiles) {
      const relativePath = getRelativePath(file);
      const urlPath = getUrlPath(relativePath);
      const lastmod = await getLastModified(file);
      const priority = calculatePriority(urlPath);
      
      // Add URL entry
      sitemapXml += '  <url>\n';
      sitemapXml += `    <loc>${BASE_URL}${urlPath}</loc>\n`;
      sitemapXml += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemapXml += `    <changefreq>weekly</changefreq>\n`;
      sitemapXml += `    <priority>${priority.toFixed(1)}</priority>\n`;
      sitemapXml += '  </url>\n';
    }
    
    // Close sitemap XML
    sitemapXml += '</urlset>';
    
    // Write sitemap file
    await writeFile(SITEMAP_FILE, sitemapXml);
    console.log(`Sitemap generated successfully at ${SITEMAP_FILE}`);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the main function if called directly
if (require.main === module) {
  generateSitemap();
}

module.exports = { generateSitemap };