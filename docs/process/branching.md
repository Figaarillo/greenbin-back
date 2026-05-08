# Branching & Release Process

## Branch Model

```
feature/{name}   →   develop   →   release/v{x.y}   →   master
     ↑                                              ↓
     └─────────────────────────────────────────  (hotfix)
```

## Branch Types

| Branch | Naming | Purpose | Lifetime |
|--------|--------|---------|----------|
| Feature | `feature/{name}` | New functionality | Short-lived |
| Develop | `develop` | Integration branch | Permanent |
| Release | `release/v{x.y}` | Stabilize for production | Temporary |
| Master | `master` | Production-ready code | Permanent |
| Hotfix | `hotfix/{name}` | Urgent production fixes | Short-lived |

## Development Workflow

### 1. Starting a Feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/mi-nueva-feature
```

### 2. During Development

- Commit frequently with conventional commits
- Push regularly to remote
- Open a Draft PR against `develop` for early CI feedback

### 3. Merging a Feature

```bash
# Push your branch
git push origin feature/mi-nueva-feature
```

1. Create Pull Request → target: `develop`
2. CI must pass (lint → typecheck → test)
3. Get at least **1 approval**
4. Merge the PR
5. Delete the feature branch

## Release Workflow

When `develop` has enough features for a release:

### 1. Create a Release Branch

```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.2
```

### 2. Stabilize the Release Branch

- Polish and test
- No new features — only fixes and docs
- Run CI manually if needed

### 3. Merge to Master

```bash
# Push release branch
git push origin release/v1.2
```

1. Create Pull Request → target: `master`
2. CI must pass (lint → typecheck → test)
3. Get at least **1 approval**
4. **Release pipeline triggers automatically** → Docker image built and pushed to GHCR
5. Merge the PR
6. Delete the release branch

### 4. Sync develop Back

```bash
git checkout develop
git merge master
git push origin develop
```

This keeps `develop` up to date with `master`.

## Hotfix Process

For urgent fixes on production:

```bash
git checkout master
git pull origin master
git checkout -b hotfix/urgente-fix
# ... make the fix ...
git push origin hotfix/urgente-fix
```

1. Create PR → target: `master`
2. CI must pass
3. Get at least **1 approval**
4. Merge to master → release pipeline runs
5. Merge to `develop` (or cherry-pick)

## PR Requirements Summary

| Target Branch | CI Required | Approvals | Release Pipeline |
|---------------|-----------|----------|------------------|
| `develop` | ✅ | 1 | ❌ |
| `master` | ✅ | 1 | ✅ |

## Syncing Master with develop (The Old Divergence Problem)

**Problem**: `master` is far behind `develop`.

**Solution**: Do NOT merge `develop` → `master` in one big PR. Instead:

1. Create `release/v{x.y}` from `develop` with a focused scope
2. Merge that release branch to `master`
3. Repeat with next release branch
4. Each small release is verifiable and safe

This is why `develop` shouldn't accumulate 13 months of work before syncing.

## Rollback Procedures

### Revert a Merged PR on develop
```bash
# In GitHub UI or CLI
gh pr revert {pr-number}
```

### Rollback Docker Image (if deployed)
```bash
# Find the previous SHA
gh run list --workflow=release.yml --limit=10

# Pull and redeploy a specific SHA
docker pull ghcr.io/{org}/greenbin-back:{sha}
```

## GitHub Actions Status

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `CI` | PR to `develop` + push to `develop` | lint → typecheck → test |
| `Release` | Push to `master` | Build + push Docker image to GHCR |
