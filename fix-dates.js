const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const CONTENT_DIR = path.join(__dirname, 'content', 'articles');

// Generate realistic dates in the past
const getRealisticDate = () => {
  const now = new Date();
  // Generate a random date in the past 18 months
  const randomMonthsAgo = Math.floor(Math.random() * 18) + 1;
  const pastDate = new Date(now);
  pastDate.setMonth(now.getMonth() - randomMonthsAgo);
  return pastDate.toISOString().split('T')[0]; // YYYY-MM-DD format
};

async function fixDates() {
  try {
    // Get all article files
    const files = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md'));
    console.log(`Found ${files.length} article files to process`);

    for (const file of files) {
      // Skip general-electric-antique-radio-value.md as we already fixed it
      if (file === 'general-electric-antique-radio-value.md') {
        console.log(`Skipping ${file} - already fixed`);
        continue;
      }

      const filePath = path.join(CONTENT_DIR, file);
      console.log(`Processing ${file}...`);

      // Generate a random realistic date for this article
      const articleDate = getRealisticDate();
      const dateTimeStr = `${articleDate}T10:30:00-04:00`;

      let content = await readFile(filePath, 'utf8');

      // Fix front matter date
      content = content.replace(/date: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:-\d{2}:\d{2})?/g, `date: ${dateTimeStr}`);
      content = content.replace(/lastmod: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:-\d{2}:\d{2})?/g, `lastmod: ${dateTimeStr}`);

      // Fix structured data dates if they exist
      content = content.replace(/datePublished: ['"]?\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:-\d{2}:\d{2})?['"]?/g, `datePublished: '${dateTimeStr}'`);
      content = content.replace(/dateModified: ['"]?\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:-\d{2}:\d{2})?['"]?/g, `dateModified: '${dateTimeStr}'`);

      // Write the fixed content back to the file
      await writeFile(filePath, content);
      console.log(`Successfully updated dates in ${file} to ${articleDate}`);
    }

    console.log('All article dates updated successfully');
  } catch (error) {
    console.error('Error fixing article dates:', error);
  }
}

// Run the function
fixDates();