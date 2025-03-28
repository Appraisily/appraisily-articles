const fs = require('fs');
const path = require('path');

const files = [
  '/mnt/c/Users/Andres/Documents/Github/appraisily-articles/content/articles/how-to-identify-antique-school-desk.md',
  '/mnt/c/Users/Andres/Documents/Github/appraisily-articles/content/articles/how-to-value-antiques.md',
  '/mnt/c/Users/Andres/Documents/Github/appraisily-articles/content/articles/old-glass-bottles-identification.md',
  '/mnt/c/Users/Andres/Documents/Github/appraisily-articles/content/articles/old-camera-value.md',
  '/mnt/c/Users/Andres/Documents/Github/appraisily-articles/content/articles/j-segura-fiberglass-art-value.md',
  '/mnt/c/Users/Andres/Documents/Github/appraisily-articles/content/articles/identify-my-art.md',
  '/mnt/c/Users/Andres/Documents/Github/appraisily-articles/content/articles/hand-carved-antique-duck-decoy-identification.md'
];

files.forEach(file => {
  console.log(`Processing ${file}...`);
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace hero image shortcodes
  content = content.replace(/{{< visual-modules\/hero-image (.*?) \/>}}/g, '{{< visual-modules/hero-image $1 >}}');
  
  // Fix checklist-item shortcodes
  content = content.replace(/{{< interactive-modules\/checklist-item (.*?)\/\s+\/>}}/g, 
                      '{{< interactive-modules/checklist-item $1/>}}');
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('All files processed successfully!');