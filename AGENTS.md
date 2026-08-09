# Project Notes

## Repos & remotes
- `origin`  → https://github.com/Team-Deepiri/deepiri-web-frontend.git (team repo)
- `personal` → https://github.com/Quamena123-prog/deepiri-web-frontend.git (user's personal copy, public)

## Dual-push workflow (DO THIS FOR EVERY UPDATE)
When the user makes changes, they must appear in BOTH the team repo (PR #122) and the
personal GitHub copy. Steps:

1. Default working branch is `personal-copy` (live dev, has the `?preview=1` no-login
   bypass committed). Make changes here, commit, push:
   `git push personal personal-copy:main`
2. Rebase/port the same changes onto the PR branch
   `yves_kwawu/feature/codebase-intelligence` (which pushes to Team-Deepiri PR #122),
   EXCLUDING the dev-only `?preview=1` bypass in `src/app/AuthGuard.tsx`, then
   `git push origin yves_kwawu/feature/codebase-intelligence` (force-with-lease).
3. Verify CI is green on the PR head before telling the user it's done.

## Preview bypass (dev only, never on PR branch)
- `?preview=1` (or `#preview`) in `src/app/AuthGuard.tsx` skips the login wall when
  `import.meta.env.DEV`. It is committed ONLY on `personal-copy` / personal main.
- Do not commit this change to the Team-Deepiri PR branch.

## Dev server (Windows, WSL unavailable)
- `npm run dev` → http://localhost:5173/ ; use `?preview=1` to navigate without login.
- Standalone graph: http://localhost:5173/graph/index.html

## Checks
- `npm run lint`, `npm run type-check`, `npm run test -- --run`
- Known pre-existing failure on main: `src/app/App.test.tsx` (routes unauth user to
  Login) fails regardless of feature changes — don't chase it.
- Known intentional lint warning: `react-hooks/exhaustive-deps` in
  `src/pages/CodebaseGraph/CodebaseGraph.tsx` (`render` dep) — do not "fix".

## Scratch files
- Untracked dev helpers at repo root (`fix_*.py`, `check_*.py`, `screenshot*.js`,
  `ss2.cjs`, `*_to_wsl.sh`) are NOT to be committed or pushed anywhere.
