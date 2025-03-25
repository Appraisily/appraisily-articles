#!/bin/bash

# This script allows committing changes while skipping the validation step
# Usage: ./scripts/skip-validation-commit.sh "Your commit message"

if [ $# -eq 0 ]; then
    echo "Error: No commit message provided"
    echo "Usage: ./scripts/skip-validation-commit.sh \"Your commit message\""
    exit 1
fi

# Set environment variable to skip validation
SKIP_VALIDATION=true git commit -m "$1"

# Check if commit was successful
if [ $? -eq 0 ]; then
    echo "✅ Commit successful (validation skipped)"
else
    echo "❌ Commit failed"
fi