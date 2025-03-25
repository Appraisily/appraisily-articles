#!/bin/bash

# This script helps remove sensitive data like API keys from the git history
# It should be used with caution as it rewrites git history

echo "⚠️ WARNING: This script will rewrite git history to remove sensitive data!"
echo "Make sure all collaborators are aware and prepared to handle the rewritten history."
echo "This is a destructive operation and should be used with extreme caution."
echo ""
echo "This script will look for API keys and other sensitive data in the git history"
echo "and remove them, replacing them with placeholders."
echo ""
read -p "Are you sure you want to continue? (y/n): " confirm

if [[ $confirm != "y" ]]; then
  echo "Operation cancelled."
  exit 0
fi

# Create a backup branch just in case
git checkout -b backup-before-filter-$(date +%Y%m%d%H%M%S)
git checkout main

# First, use git filter-repo to replace the API key pattern with a placeholder
# This requires git-filter-repo to be installed: pip install git-filter-repo
echo "Installing git-filter-repo if needed..."
pip install git-filter-repo

echo "Removing API keys from git history..."
# Look for the Anthropic API key pattern and replace it
git filter-repo --force --replace-text <(cat <<EOF
regex:sk-ant-api[0-9A-Za-z_-]{50,}==>REMOVED_API_KEY
regex:ANTHROPIC_API_KEY\s*=\s*["'](sk-ant-api[0-9A-Za-z_-]{10,})["']==>ANTHROPIC_API_KEY = "REMOVED_API_KEY"
regex:API_KEY\s*=\s*["'](sk-ant-api[0-9A-Za-z_-]{10,})["']==>API_KEY = "REMOVED_API_KEY"
regex:x-api-key['"]: ['"]sk-ant-api[0-9A-Za-z_-]{10,}['"])==>x-api-key": "REMOVED_API_KEY"
EOF
)

echo "Git history has been rewritten."
echo "You now need to force push the changes to remote repositories."
echo "Make sure all collaborators are aware of this change!"
echo ""
echo "To push the changes, use:"
echo "  git push --force-with-lease origin main"
echo ""
echo "Or if you're sure it's safe to force push:"
echo "  git push --force origin main"
echo ""
echo "After everyone has pulled the updated repository, you can delete the backup branch with:"
echo "  git branch -D backup-before-filter-*"