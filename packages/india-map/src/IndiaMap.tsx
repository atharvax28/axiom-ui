"use client";

import React, { useId, useState, useMemo, useCallback, useRef, useEffect } from "react";
import indiaGeo from "./india-paths.json";

/* ────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────── */

export interface StateData {
  id: string;
  name: string;
  value?: number;
  label?: string;
  color?: string;
  customData?: Record<string, unknown>;
}

export interface IndiaMapProps {
  /** Key = state short-id (e.g. "mh","ka","dl"). Value = state data object. */
  data?: Record<string, StateData>;
  onStateClick?: (state: StateData) => void;
  onStateHover?: (state: StateData | null) => void;

  /* ── Choropleth colours ── */
  defaultColor?: string;
  hoverColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  minColor?: string;
  maxColor?: string;

  /* ── Behaviour ── */
  showTooltip?: boolean;
  animated?: boolean;
  className?: string;
  width?: number | string;
  height?: number | string;
}

/* ────────────────────────────────────────────────────────────
 * Colour helpers
 * ──────────────────────────────────────────────────────────── */

/** Parse a CSS hex colour → [r, g, b] */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

/** Lerp between two hex colours */
function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

/* ────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────── */

export const IndiaMap: React.FC<IndiaMapProps> = ({
  data = {},
  onStateClick,
  onStateHover,
  defaultColor = "#e0e7ff",
  hoverColor = "#6366f1",
  strokeColor = "#ffffff",
  strokeWidth = 0.8,
  minColor = "#c7d2fe",
  maxColor = "#3730a3",
  showTooltip = true,
  animated = true,
  className = "",
  width = "100%",
  height = "auto",
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  // useId() can contain ":" (e.g. ":r0:"), which is invalid inside an
  // SVG url(#…) fragment reference. Strip it so the glow filter always resolves.
  const mapId = useId().replace(/:/g, "");

  /* ── Choropleth bounds (memoised) ── */
  const { min, max } = useMemo(() => {
    const values = Object.values(data)
      .map((d) => d.value)
      .filter((v): v is number => v !== undefined);
    if (values.length === 0) return { min: 0, max: 100 };
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [data]);

  /* ── Fill colour per state ── */
  const getStateColor = useCallback(
    (stateId: string) => {
      const itemData = data[stateId];
      if (itemData?.color) return itemData.color;
      if (itemData?.value !== undefined) {
        const ratio = max === min ? 0.5 : (itemData.value - min) / (max - min);
        return lerpColor(minColor, maxColor, Math.max(0, Math.min(1, ratio)));
      }
      return defaultColor;
    },
    [data, min, max, minColor, maxColor, defaultColor],
  );

  /* ── Tooltip state info helper ── */
  const getStateInfo = useCallback(
    (stateObj: { id: string; name: string }): StateData =>
      data[stateObj.id] || { id: stateObj.id, name: stateObj.name },
    [data],
  );

  /* ── Pointer handlers ── */
  const handleMouseEnter = useCallback(
    (stateObj: { id: string; name: string }, e: React.MouseEvent<SVGPathElement>) => {
      setHoveredId(stateObj.id);
      onStateHover?.(getStateInfo(stateObj));
      const x = Math.min(e.clientX + 14, window.innerWidth - 200);
      const y = Math.max(e.clientY - 60, 8);
      setTooltipPos({ x, y });
    },
    [onStateHover, getStateInfo],
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGPathElement>) => {
    const x = Math.min(e.clientX + 14, window.innerWidth - 200);
    const y = Math.max(e.clientY - 60, 8);
    setTooltipPos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    onStateHover?.(null);
  }, [onStateHover]);

  const handleClick = useCallback(
    (stateObj: { id: string; name: string }) => {
      onStateClick?.(getStateInfo(stateObj));
    },
    [onStateClick, getStateInfo],
  );

  const handleKeyDown = useCallback(
    (stateObj: { id: string; name: string }, e: React.KeyboardEvent<SVGPathElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onStateClick?.(getStateInfo(stateObj));
      }
    },
    [onStateClick, getStateInfo],
  );

  /* ── Hovered state data (for tooltip) ── */
  const hoveredState = useMemo(() => {
    if (!hoveredId) return null;
    const geo = (indiaGeo as { states: Array<{ id: string; name: string }> }).states.find(
      (s) => s.id === hoveredId,
    );
    if (!geo) return null;
    return getStateInfo(geo);
  }, [hoveredId, getStateInfo]);

  /* ── Entrance animation ── */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const states = (indiaGeo as { viewBox: string; states: Array<{ id: string; name: string; d: string }> }).states;
  const viewBox = (indiaGeo as { viewBox: string }).viewBox;

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      role="region"
      aria-label="Interactive India Map"
      style={{
        opacity: animated && !mounted ? 0 : 1,
        transform: animated && !mounted ? "scale(0.96)" : "scale(1)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <svg
        viewBox={viewBox}
        width={width}
        height={height}
        className="w-full h-auto select-none"
        style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.15))" }}
      >
        <defs>
          {/* Subtle glow filter for hovered state */}
          <filter id={`${mapId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feFlood floodColor={hoverColor} floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g id={`${mapId}-india-states`}>
          {states.map((stateObj) => {
            const isHovered = hoveredId === stateObj.id;
            const fill = isHovered ? hoverColor : getStateColor(stateObj.id);

            return (
              <path
                key={stateObj.id}
                id={`${mapId}-${stateObj.id}`}
                d={stateObj.d}
                fill={fill}
                stroke={strokeColor}
                strokeWidth={isHovered ? strokeWidth * 1.5 : strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                filter={isHovered ? `url(#${mapId}-glow)` : undefined}
                style={{
                  transition: "fill 0.2s ease, stroke-width 0.2s ease",
                  cursor: "pointer",
                  outline: "none",
                }}
                tabIndex={0}
                role="button"
                aria-label={`${stateObj.name} state`}
                onMouseEnter={(e) => handleMouseEnter(stateObj, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(stateObj)}
                onKeyDown={(e) => handleKeyDown(stateObj, e)}
              />
            );
          })}
        </g>
      </svg>

      {/* Floating Tooltip */}
      {showTooltip && hoveredState && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: "12px",
              padding: "10px 14px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
              minWidth: "120px",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "13px", color: "#fff", letterSpacing: "-0.01em" }}>
              {hoveredState.name}
            </div>
            {hoveredState.label && (
              <div style={{ fontSize: "11px", color: "rgba(203, 213, 225, 0.8)", marginTop: "2px" }}>
                {hoveredState.label}
              </div>
            )}
            {hoveredState.value !== undefined && (
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#818cf8",
                  marginTop: "4px",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {hoveredState.value.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
