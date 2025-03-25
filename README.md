# Appraisily Articles

This repository contains the Hugo site for Appraisily's article subdomain (articles.appraisily.com), featuring a modular approach to content generation that allows AI to create well-structured, visually appealing articles from research data.

## ⚠️ API Key Security

**IMPORTANT**: This repository uses API keys for article generation. Please follow these security guidelines:

- **NEVER commit API keys to the repository**
- Copy `.env.example` to `.env` for local development
- Set environment variables in Netlify for production builds
- All files with potential API keys are ignored in `.gitignore`
- Use `npm run test:api` to verify your API key works without exposing it
- Install the pre-commit hook: `cp pre-commit-hook .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit`
- Run `npm run security:check` to scan for sensitive information
- If sensitive data is accidentally committed, use `npm run security:clean-history`

### Security Tools

The repository includes several tools to prevent API key exposure:

1. **Pre-commit Hook**: Automatically scans staged changes for sensitive information
2. **Security Check Script**: `npm run security:check` scans the entire codebase
3. **Git History Cleaning**: `npm run security:clean-history` removes sensitive data from git history
4. **GitHub Push Protection**: Blocks pushes containing detected secrets

## Overview

The Appraisily Articles site provides expert guides and resources on antique identification, art valuation, and collecting. This Hugo-based site is designed to match the aesthetics of the main Appraisily website while focusing on delivering high-quality, informative content.

## Recent Updates

The site has been updated with:
- **Local-First Article Generation**: Articles are generated locally and committed to the repository rather than generated during Netlify deployment
- **Simplified Deployment**: Netlify builds use `npm run build:simple` to avoid API calls during deployment
- **Improved Documentation**: DEPLOYMENT.md and NETLIFY.md updated with local-first approach
- **Automatic Security Checking**: Pre-commit hooks and security scripts to prevent API key exposure
- **Git History Cleaner**: Tools to remove sensitive data if accidentally committed
- **Shortcode Validation**: Improved validator and template for preventing syntax errors
- **Article Template System**: Added comprehensive template with proper shortcode examples
- **Enhanced Documentation**: Detailed guides for Claude 3.7 and other AI assistants
- **Enhanced Security**: Improved .gitignore to protect API keys and sensitive information
- **API Key Management**: Added guidelines to prevent accidental exposure of credentials 
- **Enhanced SEO**: Improved schema.org structured data and AI-powered SEO metadata generation
- **Improved Header and Footer**: Matching the design of the main Appraisily site
- **Enhanced CSS**: Added utility classes for better component styling

## Updated Repository

This repository has been cleaned and updated to use environment variables for API keys instead of hardcoded values.

## Getting Started

### Prerequisites

- Hugo v0.121.1 or later
- Node.js (for content migration and generation scripts)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/appraisily-articles.git
   cd appraisily-articles
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run local development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `content/`: Markdown content files
- `layouts/`: HTML templates and shortcodes
  - `shortcodes/`: Reusable content modules for AI generation
- `static/`: Static assets (CSS, images, etc.)
- `config.toml`: Hugo configuration
- `AI-MODULES.md`: Documentation for AI content generation modules

## AI Article Generation

This repository includes a comprehensive system for AI-powered article generation:

1. **Module System**: Located in `layouts/shortcodes/` - provides components for content structure, visual elements, data presentation, and interactive elements

2. **Research Data**: Stored in topic-specific folders (e.g., `old-camera-value/`) containing JSON files with search results, expert content, images, and more

3. **Generation Script**: The `scripts/generate-article.js` script sends research data and module documentation to Claude, which generates complete articles

4. **SEO Enhancement**: The `scripts/generate-seo.js` script uses AI to optimize article metadata for search engines

### Generate an Article

First, set up your API key for Claude:

1. Get an API key from [Anthropic](https://console.anthropic.com/settings/keys)
2. Copy the `.env.example` file to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
3. Edit the `.env` file and replace `your-anthropic-api-key-here` with your actual API key

Then run one of these commands:

```bash
# Generate a single article
npm run generate -- "topic-or-keyword"

# Generate all pending articles (that don't exist yet)
npm run generate:all

# Force regenerate all articles (even if they already exist)
npm run generate:force

# You can also use the force option with generate:all
npm run generate:all -- --force
```

> Note: If you don't set up an API key, the scripts will still run but will generate placeholder content instead of AI-generated articles.

### Enhance Article SEO

```bash
npm run enhance-seo -- "content/articles/article-name.md"
```

### Preview HTML Output

To create an HTML preview of how the modules will render:

```bash
cd scripts/htmlpreview
node generate-demo.js
```

This creates a standalone HTML file (`preview.html`) showing what an article would look like with all the modules applied.

## Documentation

### Module Documentation

Complete documentation for the module system is available in `AI-MODULES.md`. This file explains:

- How to use each module with example code
- Required and optional parameters
- Best practices for module combinations
- Guidelines for using research data effectively

### Article Guide

Comprehensive documentation on article creation and SEO is available in `ARTICLE-GUIDE.md`. This guide covers:

- Article structure and front matter requirements
- Using shortcodes to create rich content
- SEO optimization with AI-generated metadata
- Local development and deployment workflow

### Shortcodes Guide

Important guidelines to prevent build errors are in `SHORTCODES-GUIDE.md`. This guide explains:

- How to properly use shortcodes in articles
- Which shortcodes need closing tags vs. self-closing tags
- Shortcodes to avoid and recommended alternatives
- Using the validation script to check for errors

## Content Management

Content can be managed in multiple ways:

1. **AI Generation**: Use the scripts to generate articles from research data
2. **Netlify CMS**: Available at https://articles.appraisily.com/admin/
3. **Direct editing**: Edit markdown files in the `content/` directory

## Deployment

This site is deployed on Netlify with continuous deployment from the main branch.

### Deployment Configuration

Netlify settings are configured in `netlify.toml`, including:

- Build commands
- Environment variables
- Redirect rules
- Header configurations
- Performance optimizations

### Netlify Environment Variables

With the local-first article generation approach, **no API keys are needed in Netlify**. 

This is because:
1. Articles are generated on your local machine
2. Generated articles are committed to the GitHub repository
3. Netlify only builds the static site from existing content
4. No article generation happens during deployment

This approach provides:
- Faster builds
- Lower Netlify build minutes consumption
- Better content control (articles can be reviewed before deployment)
- Enhanced security (no API keys in Netlify environment)

### Build Process Options

#### Netlify Deployment (Recommended Approach)
For Netlify deployment, the repository is configured to use:
- `npm run build:simple`: Uses Hugo only, skips article generation completely (fastest, no API usage)

#### Local Article Generation
For generating articles on your local machine:
- `npm run generate`: Generate a single article by keyword
- `npm run generate:all`: Generate articles only for folders without existing articles
- `npm run generate:force`: Force regenerate all articles regardless of existing content

#### Other Build Methods (Not Used for Netlify)
The repository also includes these methods for local testing:
- `npm run build:smart`: Smart build with article caching
- `npm run build:all`: Complete process that generates new articles and builds the site
- `npm run build:all:force`: Force regenerates all articles and builds the site

## Content Migration

To migrate content from the WP2HUGO project:

```bash
node migrate-content.js
```

## License

Copyright © 2025 Appraisily. All rights reserved.