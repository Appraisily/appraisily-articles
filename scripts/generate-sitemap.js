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
  
  return urlPath;
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
    
    // Recursively find all markdown files
    const { stdout } = await execPromise(`find ${CONTENT_DIR} -name "*.md"`);
    const mdFiles = stdout.trim().split('\n').filter(Boolean);
    
    // Start building sitemap XML
    let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Process each file
    for (const file of mdFiles) {
      const relativePath = getRelativePath(file);
      const urlPath = getUrlPath(relativePath);
      const lastmod = await getLastModified(file);
      const priority = calculatePriority(urlPath);
      
      // Skip drafts and excluded files
      const content = await readFile(file, 'utf8');
      if (content.includes('draft: true')) {
        continue;
      }
      
      // Add URL entry
      sitemapXml += '  <url>\n';
      sitemapXml += `    <loc>${BASE_URL}${urlPath}</loc>\n`;
      sitemapXml += `    <lastmod>${lastmod}</lastmod>\n`;
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