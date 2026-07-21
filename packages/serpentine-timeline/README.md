# Serpentine Timeline — React Component

A responsive timeline that renders as a horizontal snaking **S-curve** on desktop and gracefully falls back to a clean vertical timeline on mobile and tablet.

<p align="center">
  <img src="../../assets/serpentine-timeline-preview.png" alt="Serpentine Timeline — desktop layout" width="820" />
</p>

## Features

- **Responsive serpentine geometry** — an SVG dashed thread drawn with `preserveAspectRatio="none"` maps exactly to CSS percentages, so the curve stays aligned with the nodes at every width.
- **Auto-switching layout** — horizontal S-curve on `lg` screens, vertical timeline below, via Tailwind breakpoints.
- **Fully themeable** — thread, node, and text colours are props (with sensible defaults). No private design tokens.
- **Flexible icons** — pass a [Material Symbols](https://fonts.google.com/icons) ligature name *or* any React node (emoji, inline SVG, your own icon component).
- **Zero runtime dependencies** — just React (Tailwind for layout).

## Requirements

- **React 18+**
- **Tailwind CSS** — the layout (breakpoints, positioning, sizing) uses core Tailwind utility classes.
- **Material Symbols font** *(optional)* — only needed if you pass string icon names. Load it once in your app:
  ```html
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
  ```
  Or skip it entirely and pass your own React nodes as icons.

## Install

### Option A — shadcn CLI (recommended)

```bash
npx shadcn@latest add https://raw.githubusercontent.com/atharvax28/axiom-ui/main/registry/serpentine-timeline.json
```

### Option B — copy by hand

Copy [`src/SerpentineTimeline.tsx`](./src/SerpentineTimeline.tsx) into your project.

## Basic usage

```tsx
import { SerpentineTimeline } from "./serpentine-timeline/SerpentineTimeline";

export default function Roadmap() {
  const items = [
    { icon: "architecture",   title: "Phase 1 · Architecture", body: "System design & RFCs." },
    { icon: "code",           title: "Phase 2 · Core Build",   body: "React & TypeScript components." },
    { icon: "verified",       title: "Phase 3 · Hardening",    body: "Tests, a11y, edge cases." },
    { icon: "palette",        title: "Phase 4 · Theming",      body: "Prop-driven colours." },
    { icon: "rocket_launch",  title: "Phase 5 · Release",      body: "Publish to the registry." },
    { icon: "groups",         title: "Phase 6 · Community",    body: "Docs and good-first-issues." },
  ];

  return (
    <div className="bg-slate-950 p-8">
      <SerpentineTimeline items={items} accentColor="#d1603d" />
    </div>
  );
}
```

Using your own icon instead of the font:

```tsx
{ icon: <MyRocketIcon className="h-7 w-7" />, title: "Launch", body: "…" }
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `items` | `TimelineItem[]` | Required | Timeline nodes to render. |
| `className` | `string` | `undefined` | Classes on the outer container. |
| `accentColor` | `string` | `"#d1603d"` | Colour of the thread and (string) icons. |
| `nodeColor` | `string` | `"#1c1917"` | Background of the circular node. |
| `titleColor` | `string` | `"#ffffff"` | Title text colour. |
| `bodyColor` | `string` | `"#9ca3af"` | Body text colour. |

## Data structure

```typescript
export interface TimelineItem {
  icon: React.ReactNode; // Material Symbols ligature name, or any React node
  title: string;
  body: string;
}
```

## Layout note

The desktop serpentine is tuned for **exactly 6 nodes** (3 top, 3 bottom). Fewer nodes render fine (the tail of the thread just extends past them); more than 6 are dropped from the desktop view. The **mobile vertical layout handles any number of items**. To trace a longer curve, adjust the `COLS`, `ROW1_Y`, `ROW2_Y`, and `STAGE_H` constants at the top of the file.

## License

[MIT](../../LICENSE) © Atharva Tayade
