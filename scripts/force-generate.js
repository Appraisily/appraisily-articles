#!/usr/bin/env node
const { spawn } = require('child_process');

// Set working model and API version
process.env.CLAUDE_MODEL = 'claude-3-7-sonnet-latest';
process.env.ANTHROPIC_VERSION = '2023-06-01';

console.log('Starting force regeneration with predefined environment:');
console.log('- CLAUDE_MODEL:', process.env.CLAUDE_MODEL);
console.log('- ANTHROPIC_VERSION:', process.env.ANTHROPIC_VERSION);

// Start the process-all-articles script with force flag
const proc = spawn('node', ['process-all-articles.js', '--force'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: process.env
});

proc.on('exit', (code) => {
  process.exit(code);
});