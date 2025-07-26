# GitHub Issue Auto-Creator Hook

Automatically creates GitHub issues when you start working on new features using Kiro's native hook system.

## 🚀 What it does

When you create a new feature branch like:

```bash
git checkout -b feature/retry-logic
git checkout -b feat/cache-optimization
git checkout -b enhancement/error-handling
```

Kiro automatically detects the branch change and creates a GitHub issue with:

- ✅ Descriptive title based on branch name
- ✅ Implementation checklist
- ✅ Acceptance criteria
- ✅ Suggested files to modify
- ✅ Proper labels and assignment

## 📦 Setup

1. **Set up GitHub token:**

```bash
# Create token at: https://github.com/settings/tokens
# Needs 'repo' permissions
export GITHUB_TOKEN='your_token_here'

# Add to your ~/.zshrc or ~/.bashrc:
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.zshrc
```

2. **Run setup script (optional):**

```bash
npm run setup:github-hook
```

The hook is already configured in `.kiro/hooks/github-issue-creator.kiro.hook` and Kiro will handle it automatically.

## 🎯 Usage

Just create feature branches as usual:

```bash
# This will auto-create an issue titled "Implement Retry Logic"
git checkout -b feature/retry-logic

# This will auto-create an issue titled "Implement Cache Optimization"
git checkout -b feat/cache-optimization

# This will auto-create an issue titled "Implement Error Handling"
git checkout -b enhancement/error-handling
```

## ⚙️ Configuration

The hook is configured in `.kiro/hooks/github-issue-creator.kiro.hook`:

- **Repository**: `mauroociappinaph/lazyhttp-libreria`
- **Triggers**: `feature/*`, `feat/*`, `enhancement/*` branches
- **Auto-run**: Enabled
- **Assignee**: `mauroociappinaph`

## 📋 Example Generated Issue

**Title:** Implement Retry Logic

**Body:**

```markdown
## 🚀 Feature: Retry Logic

### Description

Implementation of retry logic functionality for httplazy library.

### 📋 Implementation Checklist

- [ ] Design and plan implementation approach
- [ ] Implement core functionality
- [ ] Add TypeScript type definitions
- [ ] Write comprehensive tests
- [ ] Update documentation
- [ ] Add usage examples
- [ ] Performance testing
- [ ] Error handling implementation

### 🎯 Acceptance Criteria

- [ ] Feature works as expected in both Node.js and browser environments
- [ ] All tests pass with good coverage
- [ ] Documentation is updated with examples
- [ ] No breaking changes to existing API
- [ ] Performance impact is minimal
```

## 🐛 Troubleshooting

**Issue: Hook not triggering**

- Ensure you have the GITHUB_TOKEN environment variable set
- Check that Kiro IDE recognizes the hook file
- Verify the branch name matches the patterns (feature/, feat/, enhancement/)

**Issue: "GitHub API connection failed"**

- Check your token has 'repo' permissions
- Verify the repository name is correct
- Test connection with: `npm run setup:github-hook`

## 🔧 Technical Details

- **Hook Type**: Native Kiro `.kiro.hook` format
- **Trigger**: `gitBranchChanged` event
- **Action**: `askAgent` with GitHub API integration
- **Requirements**: GITHUB_TOKEN environment variable

## 🎨 Customization

To modify the hook behavior, edit `.kiro/hooks/github-issue-creator.kiro.hook`:

- Change branch patterns in `when.patterns`
- Modify the prompt in `then.prompt`
- Adjust settings in `settings`
