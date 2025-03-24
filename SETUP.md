# Setup Instructions

## Local Development Setup

### Prerequisites

- [Hugo](https://gohugo.io/installation/) v0.121.1 or later
- [Node.js](https://nodejs.org/) (for article generation scripts)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/appraisily-articles.git
   cd appraisily-articles
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the Hugo development server:
   ```bash
   npm run dev
   ```

4. View the site at http://localhost:1313/

## Environment Variables

This project uses environment variables for API keys and configuration settings. These should be stored in a `.env` file in the root directory.

### Required Environment Variables

- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude AI model access
- `CLAUDE_MODEL`: (Optional) The specific Claude model to use (defaults to 'claude-3-7-sonnet-20240301')

### Creating the .env File

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your actual API key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   CLAUDE_MODEL=claude-3-7-sonnet-20240301
   ```

**Important: Never commit your API keys or other secrets to version control.**

## Netlify Deployment

### Environment Variables on Netlify

If deploying to Netlify, you need to set the environment variables in the Netlify dashboard:

1. Go to Site settings > Environment variables
2. Add the `ANTHROPIC_API_KEY` variable with your API key
3. Add the `CLAUDE_MODEL` variable if you want to use a specific model

### Build Options

The project includes multiple build commands:

- `npm run build:simple`: Basic Hugo build (fastest, skips article generation)
- `npm run build:smart`: Complete build with article generation (requires API key)

The default for Netlify is now set to `build:simple` to ensure successful builds even without an API key. If you add your API key and want to enable article generation during builds, change the build command in `netlify.toml` from `build:simple` to `build:smart`.

## Troubleshooting

### Build Failures

If you encounter build failures:

1. Check your API key is valid
2. Verify the article generation script by running it locally:
   ```bash
   npm run generate -- "topic-name"
   ```

3. Look for errors in the Netlify deploy logs

### Local Development Issues

- Make sure Hugo is installed and in your PATH
- Ensure all npm dependencies are installed
- Check that your .env file exists and has the correct format