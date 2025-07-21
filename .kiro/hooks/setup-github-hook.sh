#!/bin/bash

echo "🔧 Setting up GitHub Issue Auto-Creator Hook..."

# Check if GitHub token exists
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN environment variable is not set"
    echo "📝 Please create a GitHub Personal Access Token with 'repo' permissions:"
    echo "   1. Go to https://github.com/settings/tokens"
    echo "   2. Click 'Generate new token (classic)'"
    echo "   3. Select 'repo' scope"
    echo "   4. Copy the token"
    echo "   5. Add to your shell profile:"
    echo "      export GITHUB_TOKEN='your_token_here'"
    echo ""
    echo "🔄 Then run this script again"
    exit 1
fi

# Test GitHub API connection
echo "🧪 Testing GitHub API connection..."
curl -s -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/repos/mauroociappinaph/lazyhttp-libreria > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ GitHub API connection successful"
else
    echo "❌ GitHub API connection failed"
    echo "🔍 Please check your GITHUB_TOKEN and repository access"
    exit 1
fi

# Check if hook file exists
if [ -f ".kiro/hooks/github-issue-creator.kiro.hook" ]; then
    echo "✅ GitHub Issue Auto-Creator hook found"
else
    echo "❌ Hook file not found: .kiro/hooks/github-issue-creator.kiro.hook"
    exit 1
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Usage:"
echo "   git checkout -b feature/new-awesome-feature"
echo "   # → Kiro automatically creates GitHub issue"
echo ""
echo "🔧 Configuration:"
echo "   The hook is configured in .kiro/hooks/github-issue-creator.kiro.hook"
echo "   Kiro IDE will handle execution automatically"
echo ""
echo "🌍 Environment variables:"
echo "   GITHUB_TOKEN - Required for GitHub API access"
