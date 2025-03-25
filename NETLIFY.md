# Netlify Deployment - Important Notes

This document contains important information about deploying the Appraisily Articles site to Netlify.

## Local-First Article Generation Strategy

The site uses a **local-first article generation** approach:

- Articles are generated on local developer machines
- Generated articles are committed to the GitHub repository
- Netlify only builds the static site from existing content
- No article generation happens during Netlify deployment

## Build Commands

The `netlify.toml` file specifies `npm run build:simple` for all deployment contexts, which:
- Uses Hugo to build from existing content
- Generates a sitemap
- Does NOT attempt to generate any articles
- Does NOT require any API keys to be set in Netlify

This approach has several important benefits:
1. **Faster builds**: No API calls during build process
2. **Lower costs**: Reduces Netlify build minutes consumption
3. **Higher reliability**: No dependence on external API availability during builds
4. **Better content control**: Articles can be reviewed before deployment
5. **Simplified setup**: No need to set API keys in Netlify

## Content Update Workflow

To add new articles to the site:

1. **Generate locally**: Use `npm run generate` or `npm run generate:all` on your local machine
2. **Validate**: Run `npm run validate` to check for any shortcode errors
3. **Commit**: Add generated articles to git and commit
4. **Push**: Push to GitHub
5. **Deploy**: Netlify will automatically build and deploy the new content

## Netlify Configuration

Key settings in the `netlify.toml` file:

```toml
[build]
  command = "npm run build:simple"  # Just build, don't generate articles
  publish = "public"

[context.production]
  command = "npm run build:simple"
  # No API keys needed
  
[context.deploy-preview]
  command = "npm run build:simple"
  # Same simple build for previews
```

## Plugins

The site uses these Netlify plugins:
- Lighthouse (performance testing)
- Sitemap generator

## Security Notes

- Since no article generation happens during deployment, API keys should NOT be stored in the Netlify environment
- This significantly reduces security risks associated with API key exposure

## Future Considerations

If you later decide to have Netlify generate articles during deployment:

1. Change the build command in `netlify.toml` to `npm run build:all`
2. Set the `ANTHROPIC_API_KEY` environment variable in Netlify
3. Be aware this will significantly increase build time and costs
4. Consider setting up a scheduled build hook for periodic updates instead

## Scheduled Article Updates (Optional Future Setup)

For automatic article regeneration on a schedule (rather than on every deployment):

1. Create a dedicated build hook in Netlify for article generation
2. Set up a GitHub Action or external service (e.g., Zapier) to trigger the hook on a schedule
3. Use the build hook specifically for maintenance/update tasks

---

For step-by-step deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)