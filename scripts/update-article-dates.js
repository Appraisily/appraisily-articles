const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const matter = require('gray-matter');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * Calculate a realistic publication date within the last two months
 * @returns {Date} A date within the last two months
 */
function getRealisticDate() {
  const now = new Date();
  // Calculate a random date between today and 2 months ago
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(now.getMonth() - 2);
  
  // Random date between two months ago and today
  const randomTimestamp = twoMonthsAgo.getTime() + Math.random() * (now.getTime() - twoMonthsAgo.getTime());
  return new Date(randomTimestamp);
}

/**
 * Check if a date is in the future
 * @param {string} dateString - ISO date string
 * @returns {boolean} - Whether the date is in the future
 */
function isFutureDate(dateString) {
  const dateToCheck = new Date(dateString);
  const now = new Date();
  return dateToCheck > now;
}

/**
 * Update the dates in an article's frontmatter
 * @param {string} filePath - Path to the article file
 */
async function updateArticleDates(filePath) {
  try {
    console.log(`Checking dates for ${filePath}`);
    
    // Read the file content
    const fileContent = await readFile(filePath, 'utf8');
    const { data: frontMatter, content } = matter(fileContent);
    
    let needsUpdate = false;
    
    // Check if dates need to be updated
    if (frontMatter.date && isFutureDate(frontMatter.date)) {
      console.log(`Future publication date detected in ${filePath}: ${frontMatter.date}`);
      needsUpdate = true;
    }
    
    // Also check for dates that are earlier than 2 months ago
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    if (frontMatter.date && new Date(frontMatter.date) < twoMonthsAgo) {
      // Also update dates older than 2 months to make them seem more recent
      console.log(`Publication date older than 2 months detected in ${filePath}: ${frontMatter.date}`);
      needsUpdate = true;
    }
    
    if (!needsUpdate) {
      console.log(`✅ Dates in ${filePath} appear realistic, no update needed`);
      return false;
    }
    
    // Generate a realistic date
    const realisticDate = getRealisticDate();
    const formattedDate = realisticDate.toISOString();
    
    console.log(`Updating dates for ${filePath}`);
    console.log(`  Old date: ${frontMatter.date}`);
    console.log(`  New date: ${formattedDate}`);
    
    // Update the frontmatter
    frontMatter.date = formattedDate;
    frontMatter.lastmod = formattedDate;
    
    // Also update structured_data datePublished and dateModified if they exist
    if (frontMatter.structured_data) {
      if (frontMatter.structured_data.datePublished) {
        frontMatter.structured_data.datePublished = formattedDate;
      }
      
      if (frontMatter.structured_data.dateModified) {
        frontMatter.structured_data.dateModified = formattedDate;
      }
    }
    
    // Create new file content with updated frontmatter
    const updatedFileContent = matter.stringify(content, frontMatter);
    
    // Write the updated content back to the file
    await writeFile(filePath, updatedFileContent);
    
    console.log(`✅ Successfully updated dates for ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error updating dates for ${filePath}:`, error);
    return false;
  }
}

/**
 * Process all articles in the content directory
 */
async function updateAllArticleDates() {
  try {
    // Process all articles in the content directory
    const articlesDir = path.join(__dirname, '..', 'content', 'articles');
    
    // Create log directory if it doesn't exist
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Check if the articles directory exists
    if (!fs.existsSync(articlesDir)) {
      console.error(`Articles directory not found: ${articlesDir}`);
      return;
    }
    
    const files = fs.readdirSync(articlesDir)
      .filter(file => file.endsWith('.md') && !file.startsWith('_'));
      
    console.log(`Found ${files.length} articles to check`);
    
    // Create a log file for the process
    const logPath = path.join(logsDir, 'date-update.log');
    const startTimestamp = new Date().toISOString();
    const startLogEntry = `${startTimestamp} - Starting date update process for ${files.length} articles\n`;
    fs.writeFileSync(logPath, startLogEntry);
    
    // Count for summary
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        const filePath = path.join(articlesDir, file);
        const wasUpdated = await updateArticleDates(filePath);
        
        if (wasUpdated) {
          updatedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        errorCount++;
      }
    }
    
    // Write summary to log
    const endTimestamp = new Date().toISOString();
    const summaryLogEntry = `
${endTimestamp} - Date update process completed
  Total articles: ${files.length}
  Updated: ${updatedCount}
  Skipped (already realistic): ${skippedCount}
  Errors: ${errorCount}
\n`;
    fs.appendFileSync(logPath, summaryLogEntry);
    
    console.log('Date update process completed');
    console.log(`Updated: ${updatedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
  } catch (error) {
    console.error('Error updating article dates:', error);
  }
}

/**
 * Process a single article
 * @param {string} articlePath - Path to the article
 */
async function updateSingleArticleDates(articlePath) {
  try {
    if (!fs.existsSync(articlePath)) {
      console.error(`Article not found: ${articlePath}`);
      return;
    }
    
    await updateArticleDates(articlePath);
    console.log('Article date update completed');
  } catch (error) {
    console.error('Error updating article date:', error);
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
    
    updateSingleArticleDates(articlePath);
  } else {
    updateAllArticleDates();
  }
}

module.exports = { updateArticleDates, updateAllArticleDates, updateSingleArticleDates }; 