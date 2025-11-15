#!/bin/bash
#
# Git Hooks Installation Script
# Run this script to install git hooks that enforce branch policies
#
# Usage: ./scripts/install-hooks.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"
SOURCE_HOOKS="$REPO_ROOT/.githooks"

echo "Installing git hooks..."
echo "Repository: $REPO_ROOT"
echo "Source: $SOURCE_HOOKS"
echo "Target: $HOOKS_DIR"
echo ""

# Check if .git directory exists
if [ ! -d "$REPO_ROOT/.git" ]; then
    echo "❌ Error: .git directory not found. Are you in a git repository?"
    exit 1
fi

# Check if source hooks directory exists
if [ ! -d "$SOURCE_HOOKS" ]; then
    echo "❌ Error: .githooks directory not found"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Install pre-push hook
if [ -f "$SOURCE_HOOKS/pre-push" ]; then
    if [ -f "$HOOKS_DIR/pre-push" ]; then
        echo "⚠️  pre-push hook already exists"
        read -p "Do you want to overwrite it? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipping pre-push hook installation"
        else
            cp "$HOOKS_DIR/pre-push" "$HOOKS_DIR/pre-push.backup"
            echo "✓ Backed up existing pre-push hook to pre-push.backup"
            cp "$SOURCE_HOOKS/pre-push" "$HOOKS_DIR/pre-push"
            chmod +x "$HOOKS_DIR/pre-push"
            echo "✓ Installed pre-push hook"
        fi
    else
        cp "$SOURCE_HOOKS/pre-push" "$HOOKS_DIR/pre-push"
        chmod +x "$HOOKS_DIR/pre-push"
        echo "✓ Installed pre-push hook"
    fi
else
    echo "⚠️  pre-push hook not found in $SOURCE_HOOKS"
fi

echo ""
echo "✅ Git hooks installation complete!"
echo ""
echo "The following policies are now enforced:"
echo "  • Direct pushes to 'main' are blocked"
echo "  • Branch naming convention is validated"
echo "  • Development must happen on 'dev' branch"
echo ""
echo "See CONTRIBUTING.md for the complete workflow guide"
echo ""
echo "📖 Quick reference:"
echo "  git checkout dev"
echo "  git checkout -b feat/your-feature"
echo "  git commit -m \"feat: Short description\""
echo "  git push -u origin feat/your-feature"
