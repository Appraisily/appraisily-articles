# Article Generation Guide

This guide explains how to generate articles for the Appraisily Articles site using the local-first approach.

## Local-First Article Generation

The site uses a **local-first article generation** approach:

1. Articles are generated on your local machine using the Claude API
2. Generated articles are committed to the GitHub repository
3. Netlify only builds the site from existing content (no generation during deployment)

This approach has several important benefits:
- Faster Netlify builds
- Lower Netlify build minutes consumption 
- Better content control and quality assurance
- No API keys needed in Netlify

## Prerequisites

To generate articles locally, you'll need:

1. Node.js installed on your machine
2. A Claude API key from [Anthropic Console](https://console.anthropic.com/settings/keys)
3. Repository cloned to your local machine

## Setting Up Your Environment

1. Clone the repository (if you haven't already):
   ```bash
   git clone https://github.com/yourusername/appraisily-articles.git
   cd appraisily-articles
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your API key:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file to add your Claude API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-api-your-key-here
   CLAUDE_MODEL=claude-3-7-sonnet-latest
   ```

## Preparing Research Data

Before generating an article, you need to prepare the research data:

1. Create a folder for your keyword in the `content/` directory:
   ```bash
   mkdir -p content/your-keyword-here
   ```

2. Add data files to this folder:
   - `your-keyword-perplexity.json`: Research data from Perplexity
   - `your-keyword-serper.json`: Search results data
   - `your-keyword-paa-gemini.json`: People Also Ask data
   - `your-keyword-image-ideas.json`: Image topic ideas
   - `your-keyword-generated-images.json`: Generated image descriptions
   - `your-keyword-auction-results.json`: Auction results if applicable

## Generating an Article

1. Run the generation command for your keyword:
   ```bash
   npm run generate -- "your-keyword-here"
   ```

2. The generated article will be saved to `content/articles/your-keyword-here.md`

3. To generate all articles for which you have research data but no article yet:
   ```bash
   npm run generate:all
   ```

4. To force regenerate existing articles:
   ```bash
   npm run generate:force
   ```

## Validating Articles

After generating articles, you should validate them:

```bash
npm run validate
```

This checks for proper shortcode syntax and other formatting issues.

## Testing Locally

To preview the site with your new articles:

```bash
npm run dev
```

This starts a Hugo development server at http://localhost:1313/

## Deploying Your Changes

1. Commit your changes:
   ```bash
   git add content/
   git commit -m "Add new article for your-keyword-here"
   ```

2. Push to GitHub:
   ```bash
   git push
   ```

3. Netlify will automatically build and deploy the site using the existing articles (no generation during deployment).

## Troubleshooting

### API Key Issues

If you see "API key not found" or "placeholder content" errors:
- Check that your `.env` file exists with the correct key
- Ensure the API key is valid and has sufficient credits
- Try the `npm run test:api` command to verify your API key

### Generation Failures

If article generation fails:
- Check the error message in the console
- Ensure your research data files are valid JSON
- Check for rate limiting or API quota issues

### Articles Not Displaying Correctly

If articles don't display properly:
- Run `npm run validate` to check for shortcode errors
- Fix any reported validation issues
- Verify the front matter is correctly formatted

## Advanced: Customizing the Generation Process

To customize how articles are generated:

1. Modify the article template in `archetypes/article-template.md`
2. Adjust the generation prompt in `scripts/generate-article.js`
3. Update the module documentation in `AI-MODULES.md`

---

For more information, see:
- [README.md](README.md) for general project information
- [SHORTCODES-GUIDE.md](SHORTCODES-GUIDE.md) for shortcode usage
- [STYLE-GUIDE.md](STYLE-GUIDE.md) for content styling guidelines