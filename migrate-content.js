const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Source and destination paths
const sourcePath = '/mnt/c/Users/Andres/Documents/Github/WP2HUGO/output/markdown';
const destPath = '/mnt/c/Users/Andres/Documents/Github/appraisily-articles/content/articles';

// Ensure destination directory exists
if (!fs.existsSync(destPath)) {
  fs.mkdirSync(destPath, { recursive: true });
}

// Get all markdown files from source
const markdownFiles = fs.readdirSync(sourcePath)
  .filter(file => file.endsWith('.md'));

console.log(`Found ${markdownFiles.length} markdown files to migrate.`);

// Process each file
markdownFiles.forEach(file => {
  const sourceFull = path.join(sourcePath, file);
  const content = fs.readFileSync(sourceFull, 'utf8');
  
  // Parse front matter and content
  const { data, content: markdownContent } = matter(content);
  
  // Update front matter for new Hugo site
  const updatedFrontMatter = {
    title: data.title,
    description: data.description || data.title,
    date: data.date || new Date().toISOString(),
    lastmod: data.lastmod || new Date().toISOString(),
    draft: data.draft || false,
    featured_image: data.featured_image || null,
    tags: data.tags || [],
    seo_score: data.seo_score || 0,
  };
  
  // Create updated markdown content
  const updatedContent = matter.stringify(markdownContent, updatedFrontMatter);
  
  // Write to destination
  const destFull = path.join(destPath, file);
  fs.writeFileSync(destFull, updatedContent);
  
  console.log(`Migrated: ${file}`);
});

console.log('Migration complete!');