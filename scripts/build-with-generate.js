const { processAllPendingArticles } = require('./process-all-articles');
const { build } = require('./build');
const { validateAllArticles } = require('./validate-shortcodes');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Integrated build process that generates all pending articles first,
 * validates shortcodes, then builds the Hugo site
 */
async function buildWithGenerate(force = false) {
  try {
    console.log('Starting integrated build process...');
    console.log(`Generate mode: ${force ? 'Force regenerate all' : 'Only generate new'}`);
    
    // Step 1: Generate all pending articles
    console.log('\n=== PHASE 1: ARTICLE GENERATION ===\n');
    await processAllPendingArticles(force);
    
    // Step 2: Validate all articles
    console.log('\n=== PHASE 2: VALIDATING ARTICLES ===\n');
    try {
      await validateAllArticles();
      console.log('All articles passed validation!');
    } catch (validationError) {
      console.warn('\n⚠️ There are validation issues with some articles. Running simple Hugo build instead.');
      console.warn('The site will still be built, but some shortcodes may not render correctly.');
      
      // Run a simple Hugo build instead of the full build
      await runSimpleBuild();
      console.log('\n✅ Simple build completed!');
      return;
    }
    
    // Step 3: Build the Hugo site with full process
    console.log('\n=== PHASE 3: FULL HUGO BUILD ===\n');
    await build();
    
    console.log('\n✅ Integrated build process completed successfully!');
  } catch (error) {
    console.error('\n❌ Integrated build process failed:', error);
    process.exit(1);
  }
}

/**
 * Run a simple Hugo build without the validation requirements
 */
async function runSimpleBuild() {
  return new Promise((resolve, reject) => {
    console.log('Running simple Hugo build...');
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

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');
  return { force };
}

// Run if called directly
if (require.main === module) {
  const { force } = parseArgs();
  buildWithGenerate(force);
}

module.exports = { buildWithGenerate };