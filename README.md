# Appraisily Articles

This repository contains the Hugo site for Appraisily's article subdomain (articles.appraisily.com), featuring a modular approach to content generation that allows AI to create well-structured, visually appealing articles from research data.

## Overview

The Appraisily Articles site provides expert guides and resources on antique identification, art valuation, and collecting. This Hugo-based site is designed to match the aesthetics of the main Appraisily website while focusing on delivering high-quality, informative content.

## Recent Updates

The site has been updated with:
- **Enhanced SEO**: Improved schema.org structured data and AI-powered SEO metadata generation
- **Improved Header and Footer**: Matching the design of the main Appraisily site
- **New Article**: Added comprehensive guide on Chris DeRubeis art value
- **Enhanced CSS**: Added utility classes for better component styling
- **Updated Config**: Added social media and contact information
- **Netlify Deployment**: Enhanced security headers and performance optimization

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

For full article generation functionality during builds, you need to set these environment variables in the Netlify dashboard:

1. Go to your site settings in Netlify
2. Navigate to Build & deploy > Environment
3. Add the following variables:
   - `ANTHROPIC_API_KEY`: Your Anthropic Claude API key
   - `CLAUDE_MODEL`: claude-3-7-sonnet-20240301 (or your preferred model)

If you don't set the API key, the build will still complete but will use placeholder content for articles that need generation.

### Simple vs. Smart Build

The repository includes two build methods:

- `npm run build:simple`: Uses Hugo only, skips article generation (fastest, good for deployment)
- `npm run build:smart`: Includes article generation with Claude API (requires API key)
- `npm run generate:all`: Generates articles for any keyword folders that don't have articles yet
- `npm run generate:force`: Force regenerates articles for all keyword folders, even if they already have articles

## Content Migration

To migrate content from the WP2HUGO project:

```bash
node migrate-content.js
```

## License

Copyright © 2025 Appraisily. All rights reserved.