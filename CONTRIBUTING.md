# Contributing to axiom-ui

Thanks for taking the time to contribute! This guide covers how to get set up and submit changes.

## Repository layout

```
axiom-ui/
├── packages/
│   ├── india-map/              # Component source + its own README
│   │   └── src/
│   │       ├── IndiaMap.tsx
│   │       └── india-paths.json
│   └── serpentine-timeline/
│       └── src/
│           └── SerpentineTimeline.tsx
├── registry/                   # shadcn-style registry items (copy-paste install)
├── assets/                     # preview images
└── .github/                    # Issue & PR templates
```

This is a monorepo. New components live under `packages/<component-name>/`.

## Getting started

1. **Fork** the repo and clone your fork.
2. Create a branch: `git checkout -b feat/my-change` (or `fix/...`, `docs/...`).
3. Make your change. Keep components self-contained — a consumer should be able to copy the files in `src/` and have them work without pulling in this repo's internals.
4. Verify the component renders in a scratch React/Next.js app before opening a PR.

## Guidelines

- **No hard-coded design-system tokens.** Colours, fonts, and sizes should be props (with sensible defaults) or documented CSS variables — never private class names a stranger can't reproduce.
- **Accessibility is not optional.** Keep keyboard navigation, ARIA roles, and focus states intact.
- **TypeScript.** Components are typed; export the prop interfaces.
- **Keep dependencies minimal.** Prefer inline helpers over adding runtime dependencies.

## Submitting a PR

1. Push your branch and open a pull request against `main`.
2. Fill in the PR template describing what changed and why.
3. Link any related issue.

## Reporting bugs & requesting features

Use the [issue templates](./.github/ISSUE_TEMPLATE). Include a minimal reproduction for bugs.
