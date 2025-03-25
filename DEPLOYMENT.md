# Deployment Guide for Netlify

This document provides step-by-step instructions for deploying the Appraisily Articles site to Netlify.

## Deployment Strategy

The Appraisily Articles site uses a **local-first article generation** approach:

1. Articles are generated locally using the Claude API
2. Generated articles are committed to the GitHub repository
3. Netlify only builds the static site from the existing content (no article generation during deployment)

This approach has several advantages:
- Significantly reduces Netlify build minutes
- Keeps build times short
- Ensures articles are safely stored in the repository
- Allows for better quality control before deployment
- No need for API keys in the Netlify environment

## Prerequisites

1. A Netlify account
2. GitHub repository connected to Netlify

## Deployment Steps

### 1. Connect Your Repository

1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Choose "GitHub" as your Git provider
4. Select the "appraisily-articles" repository
5. Select the branch you want to deploy (usually `main`)

### 2. Configure Build Settings

The `netlify.toml` file already includes the configuration for simple builds:

- **Build command**: `npm run build:simple`
- **Publish directory**: `public`
- **Deploy contexts**: Production, Deploy previews, Branch deploys

> **Important**: The build command is set to `npm run build:simple` which only builds existing content without attempting to generate new articles.

### 3. Environment Variables

No API keys are needed for deployment since articles are generated locally and committed to the repository before deployment.

Optional environment variables (not required):
- `HUGO_VERSION`: Specify Hugo version if needed (defaults to version in netlify.toml)
- `IMAGEKIT_URL`: URL for ImageKit integration

### 4. Domain Setup

1. Go to "Domain settings" in your Netlify dashboard
2. Click "Add custom domain"
3. Enter `articles.appraisily.com`
4. Follow the prompts to configure DNS settings:
   - If domain is registered with Netlify: Follow the automated setup
   - If domain is registered elsewhere: Add the provided CNAME record to your DNS settings

### 5. Enable HTTPS

1. In "Domain settings", click "HTTPS"
2. Click "Verify DNS configuration" 
3. Select "Let's Encrypt certificate"

### 6. Verify Plugins

The following Netlify plugins are already configured in the `netlify.toml` file:
- Sitemap Generator
- Lighthouse (performance testing)

Verify they're enabled in the Netlify UI under "Plugins".

## Article Generation Workflow

For generating new articles:

1. Set up your local environment with API keys:
   ```bash
   cp .env.example .env
   # Edit .env to add your ANTHROPIC_API_KEY
   ```

2. Generate articles locally:
   ```bash
   # Generate a single article
   npm run generate -- "topic-keyword"
   
   # Generate all pending articles
   npm run generate:all
   ```

3. Validate the generated articles:
   ```bash
   npm run validate
   ```

4. Commit the new articles to the repository
5. Push to GitHub
6. Netlify will automatically deploy the new content

## Troubleshooting

### Build Failures

If builds fail:
1. Check Netlify logs for specific error messages
2. Test the build locally with `npm run build:simple`
3. Verify the appropriate versions of Hugo and Node.js are being used

## Monitoring and Maintenance

- Check Netlify Analytics for site performance
- Periodically update Hugo and dependencies
- Keep articles up to date by generating new content locally and pushing to the repository

---

For more detailed information about site functionality, refer to [README.md](README.md) and [NETLIFY.md](NETLIFY.md)