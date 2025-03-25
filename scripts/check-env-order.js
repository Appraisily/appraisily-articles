#!/usr/bin/env node

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

console.log('Initial environment:');
console.log('CLAUDE_MODEL:', process.env.CLAUDE_MODEL);

// Try loading from parent .env first
const parentEnvPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(parentEnvPath)) {
  console.log(`Loading parent .env: ${parentEnvPath}`);
  const parentResult = dotenv.config({ path: parentEnvPath });
  console.log('  Result:', parentResult.error ? 'Error' : 'Success');
  console.log('  CLAUDE_MODEL after parent:', process.env.CLAUDE_MODEL);
}

// Then try loading from scripts .env
const scriptsEnvPath = path.join(__dirname, '.env');
if (fs.existsSync(scriptsEnvPath)) {
  console.log(`Loading scripts .env: ${scriptsEnvPath}`);
  const scriptsResult = dotenv.config({ path: scriptsEnvPath });
  console.log('  Result:', scriptsResult.error ? 'Error' : 'Success');
  console.log('  CLAUDE_MODEL after scripts:', process.env.CLAUDE_MODEL);
}

console.log('\nFinal environment:');
console.log('CLAUDE_MODEL:', process.env.CLAUDE_MODEL);

// Hard-set the model
process.env.CLAUDE_MODEL = 'claude-3-opus-20240229';
console.log('\nAfter hard setting:');
console.log('CLAUDE_MODEL:', process.env.CLAUDE_MODEL);