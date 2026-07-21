import * as React from "react";

/* Tiny classnames joiner — no external dependency. */
function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export interface TimelineItem {
  /**
   * The node icon. Either a Google Material Symbols ligature name (e.g. "rocket_launch")
   * — the component renders it via the `material-symbols-outlined` font, which you must
   * load yourself — or any React node (an emoji, an SVG, your own icon component).
   */
  icon: React.ReactNode;
  title: string;
  body: string;
}

export interface SerpentineTimelineProps {
  items: TimelineItem[];
  className?: string;
  /** Colour of the connecting thread and (for string icons) the icon glyph. */
  accentColor?: string;
  /** Background colour of the circular node. */
  nodeColor?: string;
  /** Title text colour. */
  titleColor?: string;
  /** Body text colour. */
  bodyColor?: string;
}

/* ── shared pieces ─────────────────────────────────────────────────────── */

function Node({
  icon,
  nodeColor,
  accentColor,
  className,
}: {
  icon: React.ReactNode;
  nodeColor: string;
  accentColor: string;
  className?: string;
}) {
  return (
    <div
      className={cn("grid size-16 place-items-center rounded-full shadow-lg", className)}
      style={{
        backgroundColor: nodeColor,
        boxShadow: `0 10px 15px -3px ${cssAlpha(nodeColor, 0.25)}`,
      }}
    >
      {typeof icon === "string" ? (
        <span
          className="material-symbols-outlined text-[30px]"
          style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      ) : (
        <span style={{ color: accentColor, display: "grid", placeItems: "center" }}>{icon}</span>
      )}
    </div>
  );
}

function Title({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h3
      className="text-[0.92rem] font-semibold uppercase tracking-[0.06em]"
      style={{ color }}
    >
      {children}
    </h3>
  );
}

function Body({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p className="mt-2 text-sm leading-relaxed" style={{ color }}>
      {children}
    </p>
  );
}

/** Wrap any CSS colour in a translucent version using color-mix (widely supported). */
function cssAlpha(color: string, alpha: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

/* ── serpentine geometry (desktop) ─────────────────────────────────────────
 * The SVG stretches to the container (preserveAspectRatio="none"), so an x in
 * the 1120-wide viewBox maps to that fraction of the width. Nodes are placed at
 * the same fractions, and the stage height equals the viewBox height, so a y in
 * viewBox units equals a pixel — that keeps the dashed thread and the nodes
 * aligned at every width. Optimised for exactly 6 nodes (3 top, 3 bottom). */
const COLS = [200, 560, 920];
const ROW1_Y = 100;
const ROW2_Y = 400;
const STAGE_H = 620;
const pct = (x: number) => `${(x / 1120) * 100}%`;

export function SerpentineTimeline({
  items,
  className,
  accentColor = "#d1603d",
  nodeColor = "#1c1917",
  titleColor = "#ffffff",
  bodyColor = "#9ca3af",
}: SerpentineTimelineProps) {
  // Row 1 reads left→right; row 2 reads right→left so the thread snakes.
  const nodes = [
    { x: COLS[0], y: ROW1_Y, item: items[0] },
    { x: COLS[1], y: ROW1_Y, item: items[1] },
    { x: COLS[2], y: ROW1_Y, item: items[2] },
    { x: COLS[2], y: ROW2_Y, item: items[3] },
    { x: COLS[1], y: ROW2_Y, item: items[4] },
    { x: COLS[0], y: ROW2_Y, item: items[5] },
  ].filter((n): n is { x: number; y: number; item: TimelineItem } => Boolean(n.item));

  return (
    <div className={className}>
      {/* Desktop: horizontal serpentine */}
      <div className="relative hidden lg:block" style={{ height: STAGE_H }}>
        <svg
          viewBox={`0 0 1120 ${STAGE_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <path
            d={`M ${COLS[0]} ${ROW1_Y} H ${COLS[2]} C 1035 ${ROW1_Y}, 1070 145, 1070 250 C 1070 ${ROW2_Y}, 1035 ${ROW2_Y}, ${COLS[2]} ${ROW2_Y} H ${COLS[0]}`}
            fill="none"
            stroke={accentColor}
            strokeWidth={2}
            strokeDasharray="2 7"
            strokeLinecap="round"
            opacity={0.55}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {nodes.map((n, i) => (
          <React.Fragment key={i}>
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: pct(n.x), top: n.y }}
            >
              <Node icon={n.item.icon} nodeColor={nodeColor} accentColor={accentColor} />
            </div>
            <div
              className="absolute w-[280px] -translate-x-1/2"
              style={{ left: pct(n.x), top: n.y + 48 }}
            >
              <Title color={titleColor}>{n.item.title}</Title>
              <Body color={bodyColor}>{n.item.body}</Body>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Mobile / tablet: vertical timeline */}
      <ol className="relative flex flex-col gap-9 lg:hidden">
        <span
          aria-hidden="true"
          className="absolute bottom-8 left-8 top-8 border-l-2 border-dashed"
          style={{ borderColor: cssAlpha(accentColor, 0.45) }}
        />
        {items.map((item, i) => (
          <li key={i} className="relative flex gap-5">
            <Node
              icon={item.icon}
              nodeColor={nodeColor}
              accentColor={accentColor}
              className="z-10 shrink-0"
            />
            <div className="pt-1.5">
              <Title color={titleColor}>{item.title}</Title>
              <Body color={bodyColor}>{item.body}</Body>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
