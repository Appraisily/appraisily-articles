/**
 * Fix image URLs in Appraisily articles
 * 
 * This script scans all markdown files in the content/articles directory
 * and fixes image URLs:
 * 
 * 1. Replaces Discord CDN URLs with ImageKit URLs
 * 2. Fixes broken or malformed ImageKit URLs
 * 3. Ensures all image paths are correctly formatted
 * 4. Fixes double closing parentheses in image markdown
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Path to articles directory
const articlesDir = path.join(__dirname, 'content', 'articles');

// Function to get imagekit URLs from images-data.json
async function getImageKitUrls(keyword) {
  try {
    const keywordDir = path.join(__dirname, 'content', keyword);
    if (!fs.existsSync(keywordDir)) {
      console.log(`No directory found for keyword: ${keyword}`);
      return null;
    }
    
    const imagesDataPath = path.join(keywordDir, 'images-data.json');
    if (!fs.existsSync(imagesDataPath)) {
      console.log(`No images-data.json found for keyword: ${keyword}`);
      return null;
    }
    
    const data = await readFile(imagesDataPath, 'utf8');
    const images = JSON.parse(data);
    
    // Create a map of image names to imagekit URLs
    const imageMap = {};
    images.forEach(img => {
      if (img.name && img.imagekitUrl) {
        imageMap[img.name] = img.imagekitUrl;
      }
    });
    
    return imageMap;
  } catch (error) {
    console.error(`Error reading images data for ${keyword}:`, error);
    return null;
  }
}

// Function to fix a single article
async function fixArticle(articleFile) {
  try {
    const fileName = path.basename(articleFile, '.md');
    console.log(`Processing article: ${fileName}`);
    
    // Read the article content
    const content = await readFile(articleFile, 'utf8');
    
    // Get imagekit URLs
    const imageMap = await getImageKitUrls(fileName);
    if (!imageMap) {
      console.log(`Skipping ${fileName} - unable to find image data`);
      return false;
    }
    
    // Replace Discord URLs with imagekit URLs in markdown image tags
    let newContent = content;
    let needsUpdate = false;
    
    // First, check if there are any direct Discord URLs to replace
    const discordUrlRegex = /https:\/\/cdn\.discordapp\.com\/[^\s\)]+/g;
    const discordMatches = content.match(discordUrlRegex);
    
    if (discordMatches && discordMatches.length > 0) {
      console.log(`Found ${discordMatches.length} Discord URLs in ${fileName}`);
      needsUpdate = true;
      
      // Replace Discord URLs with corresponding ImageKit URLs
      Object.entries(imageMap).forEach(([name, imagekitUrl]) => {
        // Extract index from the image name (e.g., "name-1.png" => 1)
        const indexMatch = name.match(/-(\d+)\.png$/);
        if (indexMatch && indexMatch[1]) {
          const index = parseInt(indexMatch[1]);
          if (index > 0 && index <= discordMatches.length) {
            // Replace the corresponding Discord URL with the ImageKit URL
            newContent = newContent.replace(discordMatches[index-1], imagekitUrl);
          }
        }
      });
    }
    
    // Next, check for image references that might be broken or malformed
    const brokenImageRegex = /!\[.*?\]\(https:\/\/ik\.imagekit\.io\/[^\)]+|!\[.*?\]\(https:\/\/ik\.imagekit\.io[^\)]+|!\[.*?\]\(https:\/ik\.imagekit\.io[^\)]+/g;
    const brokenMatches = newContent.match(brokenImageRegex);
    
    if (brokenMatches && brokenMatches.length > 0) {
      console.log(`Found ${brokenMatches.length} broken image URLs in ${fileName}`);
      needsUpdate = true;
      
      brokenMatches.forEach(match => {
        // Extract image number from alt text or try to infer it from context
        const nameMatch = match.match(/image-(\d+)/);
        if (nameMatch && nameMatch[1]) {
          const index = parseInt(nameMatch[1]);
          const imageName = `${fileName}-image-${index}.png`;
          
          if (imageMap[imageName]) {
            // Create a proper markdown image with the correct URL
            const alt = match.match(/!\[(.*?)\]/)[1];
            const correctedImage = `![${alt}](${imageMap[imageName]})`;
            newContent = newContent.replace(match, correctedImage);
          }
        }
      });
    }
    
    // Check for any pngs with double closing parentheses and fix them
    const doubleParensRegex = /\]\((https:\/\/ik\.imagekit\.io\/[^)]+\.png)\)\)/g;
    const doubleParenMatches = newContent.match(doubleParensRegex);
    
    if (doubleParenMatches && doubleParenMatches.length > 0) {
      console.log(`Found ${doubleParenMatches.length} instances of double parentheses in ${fileName}`);
      needsUpdate = true;
      
      // Fix each instance of double closing parentheses
      doubleParenMatches.forEach(match => {
        const correctMatch = match.replace(/\)\)$/, ')');
        newContent = newContent.replace(match, correctMatch);
      });
    }
    
    // If content has changed, write it back to the file
    if (needsUpdate) {
      await writeFile(articleFile, newContent);
      console.log(`✅ Fixed image URLs in ${fileName}`);
      return true;
    } else {
      console.log(`⚠️ No changes needed for ${fileName}`);
      return false;
    }
  } catch (error) {
    console.error(`Error fixing article ${path.basename(articleFile)}:`, error);
    return false;
  }
}

// Main function to process all articles
async function fixAllArticles() {
  try {
    // Get all markdown files in the articles directory
    const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.md'));
    console.log(`Found ${files.length} article files to process`);
    
    let fixedCount = 0;
    
    // Process each file
    for (const file of files) {
      const fixed = await fixArticle(path.join(articlesDir, file));
      if (fixed) fixedCount++;
    }
    
    console.log('\n===== Summary =====');
    console.log(`Total articles: ${files.length}`);
    console.log(`Fixed articles: ${fixedCount}`);
    console.log(`Articles unchanged: ${files.length - fixedCount}`);
  } catch (error) {
    console.error('Error processing articles:', error);
  }
}

// Run the script
fixAllArticles();