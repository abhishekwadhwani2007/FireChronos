# Branch Strategy — FIRECHRONOS

## Overview

```
main
 ├── model/feature-a       ← Model Team
 ├── model/feature-b
 ├── frontend/feature-x    ← Frontend Team
 └── frontend/feature-y
```

## Flow

```
1. Pull latest main
   git checkout main && git pull origin main

2. Create your team branch
   git checkout -b model/sensor-tuning       # model team
   git checkout -b frontend/forecast-panel   # frontend team

3. Work on your branch, commit often
   git add . && git commit -m "feat(model): improve HAI weighting"

4. Push & open PR → main
   git push origin model/sensor-tuning

5. PR Review:
   - Model PRs: reviewed by another model team member
   - Frontend PRs: reviewed by another frontend team member
   - Shared-file changes: reviewed by both teams

6. Merge order (when both teams have PRs ready):
   a. Merge MODEL branch first (data artifacts update)
   b. Pull latest main into FRONTEND branch, resolve any conflicts
   c. Merge FRONTEND branch

7. After merge: delete the branch
   git branch -d model/sensor-tuning
```

## Conflict Avoidance Rules

| File/Dir | Only touched by |
|----------|----------------|
| `scripts/*.py` | Model Team |
| `models/artifacts/*.joblib` | Model Team (generated, gitignored) |
| `data/processed/*.json` | Model Team (generated, gitignored) |
| `frontend/src/components/` | Frontend Team |
| `frontend/src/pages/` | Frontend Team |
| `backend/main.py` | PR + discussion required |
| `frontend/src/api.ts` | Frontend Team arbitrates |
| `frontend/src/types.ts` | Frontend Team arbitrates |

## Emergency Hotfix

```bash
git checkout main
git checkout -b hotfix/critical-bug
# fix
git push origin hotfix/critical-bug
# PR → main (skip normal checklist if production is down, document the skip)
```
