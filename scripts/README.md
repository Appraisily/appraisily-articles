# Appraisily Article Generation System

This directory contains scripts for generating, enhancing, and building articles for the Appraisily Articles site using Claude AI.

## Overview of Scripts

### build.js

A smart build system that intelligently determines which articles need to be regenerated based on source changes.

```bash
# Run the smart build process
npm run build:smart
```

Features:
- Caches article generation to avoid rebuilding unchanged content
- Automatically regenerates articles if their source data changes
- Runs SEO enhancement on new articles
- Builds the Hugo site after processing all articles

### generate-article.js

Generates a new article from source data using Claude 3.7 Sonnet.

```bash
# Generate a specific article
npm run generate -- "keyword-to-generate"

# Or directly:
node scripts/generate-article.js "keyword-to-generate"
```

How it works:
1. Reads all JSON files from the keyword folder
2. Reads the AI module documentation and style guide
3. Creates a comprehensive prompt for Claude
4. Calls the Claude API to generate the article
5. Saves the resulting markdown file

### process-all-articles.js

Processes all pending articles that have research data but no generated content.

```bash
# Process all pending articles
npm run generate:all
```

This script:
- Scans for keyword folders containing research data
- Checks which keywords don't have articles yet
- Generates articles for all missing content
- Enhances SEO for newly generated articles

### trigger-generation.js

External interface for triggering article generation from other repositories or scripts.

```bash
# Process a specific keyword
npm run trigger -- keyword-name

# Process all pending articles
npm run trigger -- --all

# Direct usage from another repository
node /path/to/appraisily-articles/scripts/trigger-generation.js keyword-name
```

This script:
- Can be called from external processes
- Writes a status file (.generation-status.json) with results
- Returns exit code 0 for success, 1 for error

### generate-seo.js

Enhances articles with SEO metadata using Claude AI.

```bash
# Enhance SEO for a specific article
npm run enhance-seo -- "content/articles/article-name.md"

# Enhance SEO for all articles
npm run enhance-seo
```

This script:
- Analyzes article content to generate appropriate metadata
- Updates front matter with optimized title, description, keywords, etc.
- Adds structured data information for better search visibility

### generate-sitemap.js

Generates an enhanced sitemap for the site.

```bash
# Generate sitemap
npm run sitemap
```

Features:
- Gets last modified dates from Git history
- Sets dynamic priority based on URL depth
- Properly formats XML sitemap file

## Cross-Repository Integration

The `trigger-generation.js` script provides an interface for external processes to trigger article generation. It can be called from other repositories to process new content.

### Usage from External Scripts

From another repository or process, you can trigger article generation using:

```bash
# Navigate to the articles repository
cd /path/to/appraisily-articles

# Process a specific keyword
node scripts/trigger-generation.js keyword-name

# Process all pending articles
node scripts/trigger-generation.js --all
```

Alternatively, you can use npm:

```bash
# From the articles repository
npm run trigger -- keyword-name
npm run trigger -- --all
```

The trigger script will:
1. Generate the requested article(s)
2. Build the Hugo site to update the main page and sitemap
3. Return an exit code indicating success or failure

### Exit Codes

The trigger script returns standard exit codes:
- `0` - Success (article generated and site built)
- `1` - Error (article generation or site build failed)

### Status File

The script also creates a `.generation-status.json` file in the repository root with detailed status information, which can be read by external processes. It includes:

```json
{
  "status": "success",
  "timestamp": "2024-03-24T12:34:56.789Z",
  "keyword": "example-keyword",
  "siteBuilt": true
}
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the scripts directory:
```
# Claude API Keys
ANTHROPIC_API_KEY=your-anthropic-api-key-here
CLAUDE_MODEL=claude-3-7-sonnet-20240301

# Other configuration
IMAGEKIT_URL=https://ik.imagekit.io/appraisily/Articles/
```

## Caching System

The build system uses a caching mechanism to avoid regenerating articles unnecessarily:

1. Creates MD5 hashes of source JSON files for each article
2. Stores hashes in `.cache/article-hashes.json`
3. Only regenerates articles if their source data has changed
4. Tracks last generation timestamp for each article

To force regeneration of all articles, delete the `.cache` directory.

## Required Source Data

For each article keyword (e.g., "old-camera-value"), create a directory with these JSON files:
- `keyword-serper.json`: Search engine results
- `keyword-paa-gemini.json`: "People Also Ask" questions and answers
- `keyword-perplexity.json`: Expert research content
- `keyword-auction-results.json`: Relevant auction data
- `keyword-generated-images.json`: Image descriptions
- `keyword-image-ideas.json`: Visualization concepts

## Requirements

- Node.js 14+
- Claude API key with access to claude-3-7-sonnet
- Hugo installed on the system
- JSON research files in the keyword folders