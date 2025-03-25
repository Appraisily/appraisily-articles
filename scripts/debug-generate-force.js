#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { spawn } = require('child_process');

// Load environment variables from all potential locations
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env')
];

console.log('Debug script for generate:force command');
console.log('---------------------------------');

// Try all possible .env locations
envPaths.forEach(envPath => {
  if (fs.existsSync(envPath)) {
    console.log(`Found .env file: ${envPath}`);
    dotenv.config({ path: envPath });
  } else {
    console.log(`No .env file found at ${envPath}`);
  }
});

// Check API key availability
const apiKey = process.env.ANTHROPIC_API_KEY;
if (apiKey) {
  const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5);
  console.log(`API Key loaded: ${maskedKey}\n`);
} else {
  console.error('ERROR: No ANTHROPIC_API_KEY found in environment!');
  process.exit(1);
}

// Optional test keyword from command line
const testKeyword = process.argv[2] || "";

// Run the article generation with force flag
console.log('Executing article generation with --force flag');
console.log('---------------------------------');

const commandArgs = ['./process-all-articles.js', '--force'];
if (testKeyword) {
  commandArgs.push(testKeyword);
}

const child = spawn('node', commandArgs, {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    ANTHROPIC_API_KEY: apiKey,
    CLAUDE_MODEL: 'claude-3-opus-20240229',
    ANTHROPIC_VERSION: '2023-06-01',
    FORCE_DEBUG: 'true'
  }
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Process exited with code ${code}`);
    process.exit(code);
  }
});