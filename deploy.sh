#!/bin/bash
# =============================================================================
# Deploy to S3 + CloudFront  (app.michaeleight.com/<S3_PATH>/)
# =============================================================================
# Shared-infra static deploy: ONE bucket + CloudFront distribution serve every
# app.michaeleight.com/<path>/ app; only AWS_S3_PATH differs per project.
#
# Strict, single-use production deploy. Self-contained: auto-generates
# deploy.env (gitignored) on first run, then exits so you can fill it in.
#
# HARD GATES (deploy ABORTS if any fail):
#   1. AWS CLI + credentials valid
#   2. Git working tree clean
#   3. HEAD tagged v<package.json version>   (exact match)
#   4. Lint passes                           (LINT_CMD)
#   5. Tests pass                            (TEST_CMD; warns loudly if unset)
#   6. Build succeeds -> $BUILD_DIR
#        BASE_INJECT=vite -> appends `-- --base=/$S3_PATH/` (Vite)
#        BASE_INJECT=none -> no flag (CRA/other: set base via homepage/PUBLIC_URL)
#   7. SINGLE-USE PRODUCTION CONFIRMATION    (typed every run)
#   8. aws s3 sync ... --delete
#   9. CloudFront invalidation /$S3_PATH/*
#
# SINGLE-USE RULE: every invocation needs a fresh typed confirmation right
# before the upload (or the explicit --i-understand-this-is-production flag,
# itself typed per run). No standing/automated approval can bypass it.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
step()    { echo -e "\n${CYAN}${BOLD}=== STEP $1: $2 ===${NC}"; }

ENV_FILE="$SCRIPT_DIR/deploy.env"

ASSUME_YES=0
for arg in "$@"; do
    [ "$arg" = "--i-understand-this-is-production" ] && ASSUME_YES=1
done

if [ ! -f "$ENV_FILE" ]; then
    cat > "$ENV_FILE" <<'ENVEOF'
# ---- AWS deploy config (gitignored — never commit) ----
# Shared app.michaeleight.com bucket + distribution; set a UNIQUE AWS_S3_PATH.
PROJECT_NAME=
AWS_S3_BUCKET=app-michaeleight-com
AWS_S3_PATH=                                   # subfolder -> app.michaeleight.com/<path>/
AWS_CLOUDFRONT_DISTRIBUTION_ID=ETNGXS0UE4PAB
AWS_REGION=us-east-1

# ---- Build pipeline gates (leave a cmd empty to skip that gate) ----
LINT_CMD="npm run typecheck"
TEST_CMD=""
BUILD_CMD="npm run build"
BUILD_DIR=dist
BASE_INJECT=vite                                 # vite | none (CRA/other use homepage)
ENVEOF
    warn "deploy.env not found — created a template at $ENV_FILE"
    info "Fill in your values (unique AWS_S3_PATH), then re-run."
    exit 1
fi

set -a; source "$ENV_FILE"; set +a

PROJECT_NAME="${PROJECT_NAME:-}"
S3_BUCKET="${AWS_S3_BUCKET:-}"
S3_PATH="${AWS_S3_PATH:-}"
CLOUDFRONT_DISTRIBUTION_ID="${AWS_CLOUDFRONT_DISTRIBUTION_ID:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"
LINT_CMD="${LINT_CMD:-}"
TEST_CMD="${TEST_CMD:-}"
BUILD_CMD="${BUILD_CMD:-npm run build}"
BUILD_DIR="${BUILD_DIR:-dist}"
BASE_INJECT="${BASE_INJECT:-vite}"

S3_PATH="${S3_PATH#/}"; S3_PATH="${S3_PATH%/}"
if [ -n "$S3_PATH" ]; then
    S3_DEST="s3://$S3_BUCKET/$S3_PATH/"
    CF_PATHS="/$S3_PATH/*"
    BASE_PATH="/$S3_PATH/"
else
    S3_DEST="s3://$S3_BUCKET/"
    CF_PATHS="/*"
    BASE_PATH="/"
fi
PROJECT_NAME="${PROJECT_NAME:-${S3_PATH:-app}}"

[ -z "$S3_BUCKET" ] && error "AWS_S3_BUCKET not set in deploy.env"

echo -e "${BOLD}"
echo "╔════════════════════════════════════════╗"
printf "║  %-36s ║\n" "$PROJECT_NAME — Deploy"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
info "Working directory: $SCRIPT_DIR"
info "Target: $S3_DEST   (base path $BASE_PATH, inject=$BASE_INJECT)"
[ -n "$CLOUDFRONT_DISTRIBUTION_ID" ] \
    && info "CloudFront: $CLOUDFRONT_DISTRIBUTION_ID" \
    || warn "No CloudFront distribution set — invalidation will be skipped"

step "1" "Checking AWS CLI and credentials"
command -v aws &>/dev/null || error "AWS CLI not installed."
info "AWS CLI: $(which aws)"
if ! AWS_IDENTITY=$(aws sts get-caller-identity 2>&1); then
    error "AWS credentials not configured. Run 'aws configure'.\nDetails: $AWS_IDENTITY"
fi
AWS_ACCOUNT=$(echo "$AWS_IDENTITY" | grep -o '"Account": "[^"]*"' | cut -d'"' -f4)
info "AWS Account: $AWS_ACCOUNT"
success "AWS credentials valid"

step "2" "Checking Git working tree (must be clean)"
command -v git &>/dev/null && [ -d ".git" ] || error "Not a git repo — refusing to deploy."
if [ -n "$(git status --porcelain)" ]; then
    echo; git status --short; echo
    error "Working tree is dirty. Commit (and tag) before deploying."
fi
COMMIT=$(git rev-parse --short HEAD)
success "Working tree clean (commit $COMMIT)"

step "3" "Verifying version tag matches package.json"
PKG_VERSION=$(grep -m1 '"version"' package.json | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')
[ -n "$PKG_VERSION" ] || error "Could not read version from package.json"
EXPECTED_TAG="v$PKG_VERSION"
info "package.json version: $PKG_VERSION  ->  required tag: $EXPECTED_TAG"
if git tag --points-at HEAD | grep -qx "$EXPECTED_TAG"; then
    success "HEAD is tagged $EXPECTED_TAG"
else
    error "HEAD is NOT tagged $EXPECTED_TAG. Tag this commit first:\n    git tag $EXPECTED_TAG -m \"$EXPECTED_TAG\""
fi

step "4" "Running linter"
if [ -n "$LINT_CMD" ]; then
    info "Executing: $LINT_CMD"
    eval "$LINT_CMD" && success "Lint passed" || error "Lint failed."
else
    error "LINT_CMD empty — linter is a required gate. Set LINT_CMD in deploy.env."
fi

step "5" "Running tests"
if [ -n "$TEST_CMD" ]; then
    info "Executing: $TEST_CMD"
    eval "$TEST_CMD" && success "Tests passed" || error "Tests failed."
else
    warn "TEST_CMD empty — no test runner configured for this gate."
fi

step "6" "Building application"
FULL_BUILD_CMD="$BUILD_CMD"
if [ "$BASE_PATH" != "/" ] && [ "$BASE_INJECT" = "vite" ]; then
    FULL_BUILD_CMD="$BUILD_CMD -- --base=$BASE_PATH"
fi
info "Executing: $FULL_BUILD_CMD"
eval "$FULL_BUILD_CMD" || error "Build failed."
[ -d "$BUILD_DIR" ] || error "BUILD_DIR '$BUILD_DIR' not found after build."
info "Build output: $(find "$BUILD_DIR" -type f | wc -l | tr -d ' ') files, $(du -sh "$BUILD_DIR" | cut -f1) total"
success "Build completed"

step "7" "PRODUCTION CONFIRMATION (single-use)"
echo -e "${YELLOW}${BOLD}"
echo "About to OVERWRITE production:"
echo "  $S3_DEST   (--delete: removes stale remote files)"
echo "  version $PKG_VERSION ($EXPECTED_TAG), commit $COMMIT"
echo -e "${NC}"
if [ "$ASSUME_YES" -eq 1 ]; then
    warn "--i-understand-this-is-production supplied; skipping interactive prompt for THIS run only."
else
    [ -t 0 ] || error "Not a TTY and no --i-understand-this-is-production flag. Refusing to deploy."
    read -r -p "$(echo -e "${YELLOW}Type the target subpath to confirm (\"${S3_PATH:-ROOT}\"): ${NC}")" CONFIRM_PATH
    [ "$CONFIRM_PATH" = "${S3_PATH:-ROOT}" ] || error "Confirmation mismatch — aborted. Nothing was uploaded."
fi
success "Confirmed — proceeding with this single deploy"

step "8" "Uploading to S3"
info "Executing: aws s3 sync $BUILD_DIR/ $S3_DEST --delete --region $AWS_REGION"
aws s3 sync "$BUILD_DIR/" "$S3_DEST" --delete --region "$AWS_REGION" \
    && success "Upload completed" || error "S3 upload failed. Check permissions/bucket."

step "9" "Invalidating CloudFront cache"
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    info "Creating invalidation for $CF_PATHS"
    if INVALIDATION_OUTPUT=$(aws cloudfront create-invalidation \
            --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
            --paths "$CF_PATHS" 2>&1); then
        info "Invalidation ID: $(echo "$INVALIDATION_OUTPUT" | grep -o '"Id": "[^"]*"' | head -1 | cut -d'"' -f4)"
        success "CloudFront invalidation created"
    else
        warn "CloudFront invalidation may have failed: $INVALIDATION_OUTPUT"
    fi
else
    warn "No CloudFront distribution id — skipped"
fi

echo -e "\n${GREEN}${BOLD}"
echo "╔════════════════════════════════════════╗"
echo "║         DEPLOYMENT SUCCESSFUL!          ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
info "URL: https://app.michaeleight.com/$S3_PATH/"
info "Version: $PKG_VERSION ($EXPECTED_TAG)"
[ -n "$CLOUDFRONT_DISTRIBUTION_ID" ] && info "CloudFront propagation: ~5-10 min"
echo ""
