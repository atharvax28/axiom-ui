# axiom-ui

A small collection of distinctive, production-grade React components — built to be dropped straight into your app, styled with your own tokens, and owned as source (not hidden behind a package).

## Components

| Component | Status | Description |
| --------- | ------ | ----------- |
| [**India Map**](./packages/india-map) | ✅ Stable | Interactive, accessible SVG choropleth map of India. Zero heavy map libraries — just React and an inline path set. |
| **Serpentine Timeline** | 🚧 In progress | A responsive S-curve timeline (horizontal on desktop, vertical on mobile). Being decoupled from its origin design system before release. |

## Install (copy-paste, shadcn-style)

`india-map` is distributed as **source you own**. Pull it straight into your project with the shadcn CLI:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/atharvax28/axiom-ui/main/registry/india-map.json
```

This drops `IndiaMap.tsx` and `india-paths.json` into your `components/` directory. No runtime dependency on this repo.

Prefer to copy by hand? Grab the two files from [`packages/india-map/src`](./packages/india-map/src) and follow the [component README](./packages/india-map/README.md).

## Why copy-paste instead of an npm package?

These are UI components you'll want to tweak — colours, tooltip markup, animation. Owning the source beats fighting a package's API surface. An npm distribution may follow once the API settles and there's demand.

## Contributing

Issues and PRs welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) and the [Code of Conduct](./CODE_OF_CONDUCT.md). Good first issues are labelled on the tracker.

## License

[MIT](./LICENSE) © Atharva Tayade
