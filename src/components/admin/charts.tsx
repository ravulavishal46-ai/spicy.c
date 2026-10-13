"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/*
 * Lightweight SVG charts (no chart library).
 * Single-series by design: one chili hue for marks, text in ink tokens,
 * hairline gridlines, hover tooltips, and a table view for every chart.
 */

const MARK = "#E63920";
const GRID = "#ece5dc";
const INK_MUTED = "#6b6460";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(600);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.floor(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function niceMax(v: number) {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / mag;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * mag;
}

export function compact(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(n >= 1000000 ? 0 : 1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(Math.round(n));
}

function TableView({ caption, head, rows }: { caption: string; head: [string, string]; rows: [string, string][] }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-xs font-semibold text-ash hover:text-charcoal">View as table</summary>
      <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-cream-300">
        <table className="w-full text-left">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 bg-cream text-xs text-ash">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">{head[0]}</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">{head[1]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([a, b]) => (
              <tr key={a} className="border-t border-cream-200">
                <td className="px-3 py-1.5">{a}</td>
                <td className="px-3 py-1.5 text-right font-mono">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function Tooltip({ x, y, width, title, value }: { x: number; y: number; width: number; title: string; value: string }) {
  const left = Math.min(Math.max(x, 70), width - 70);
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-charcoal px-3 py-2 text-center text-cream shadow-lg"
      style={{ left, top: y - 10 }}
    >
      <p className="whitespace-nowrap text-[0.7rem] text-cream/65">{title}</p>
      <p className="whitespace-nowrap font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}

export function LineChart({
  data,
  format,
  label,
  height = 240,
}: {
  data: { x: string; y: number }[];
  format: (n: number) => string;
  label: string;
  height?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 44, r: 16, t: 16, b: 28 };
  const max = niceMax(Math.max(...data.map((d) => d.y)) * 1.05);
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (data.length === 1 ? w / 2 : (i / (data.length - 1)) * w);
  const y = (v: number) => pad.t + h - (v / max) * h;
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(d.y).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)} ${pad.t + h} L${x(0)} ${pad.t + h} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const labelEvery = Math.ceil(data.length / Math.max(2, Math.floor(w / 70)));
  const last = data.length - 1;

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    setHover(Math.round(rel * (data.length - 1)));
  }

  return (
    <div>
      <div ref={ref} className="relative">
        <svg width={width} height={height} role="img" aria-label={`${label}. Latest value ${format(data[last].y)}.`} className="block max-w-full">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
              <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={INK_MUTED}>
                {compact(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            (i % labelEvery === 0 && last - i >= labelEvery * 0.75) || i === last ? (
              <text key={i} x={x(i)} y={height - 8} textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"} fontSize={11} fill={INK_MUTED}>
                {d.x}
              </text>
            ) : null,
          )}
          <path d={area} fill={MARK} opacity={0.1} />
          <path d={line} fill="none" stroke={MARK} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {/* end marker + direct label */}
          <circle cx={x(last)} cy={y(data[last].y)} r={4.5} fill={MARK} stroke="white" strokeWidth={2} />
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + h} stroke="#141414" strokeOpacity={0.25} strokeWidth={1} />
              <circle cx={x(hover)} cy={y(data[hover].y)} r={5} fill={MARK} stroke="white" strokeWidth={2} />
            </g>
          )}
          <rect
            x={pad.l}
            y={pad.t}
            width={w}
            height={h}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
            style={{ touchAction: "pan-y" }}
          />
        </svg>
        {hover !== null && <Tooltip x={x(hover)} y={y(data[hover].y)} width={width} title={data[hover].x} value={format(data[hover].y)} />}
      </div>
      <TableView caption={label} head={["Date", "Value"]} rows={data.map((d) => [d.x, format(d.y)])} />
    </div>
  );
}

export function ColumnChart({
  data,
  format,
  label,
  height = 220,
  highlightMax = true,
}: {
  data: { x: string; y: number }[];
  format: (n: number) => string;
  label: string;
  height?: number;
  highlightMax?: boolean;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 36, r: 8, t: 22, b: 26 };
  const maxVal = Math.max(...data.map((d) => d.y));
  const max = niceMax(maxVal * 1.05);
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const band = w / data.length;
  const barW = Math.min(24, band - 2);
  const y = (v: number) => pad.t + h - (v / max) * h;
  const peak = data.findIndex((d) => d.y === maxVal);
  const labelEvery = Math.ceil(data.length / Math.max(2, Math.floor(w / 36)));

  return (
    <div>
      <div ref={ref} className="relative">
        <svg width={width} height={height} role="img" aria-label={`${label}. Peak ${format(maxVal)} at ${data[peak].x}.`} className="block max-w-full">
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t * max)} y2={y(t * max)} stroke={GRID} strokeWidth={1} />
              <text x={pad.l - 6} y={y(t * max) + 4} textAnchor="end" fontSize={11} fill={INK_MUTED}>
                {compact(t * max)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = pad.l + band * i + band / 2;
            const top = y(d.y);
            const bh = pad.t + h - top;
            const r = Math.min(4, bh);
            const x0 = cx - barW / 2;
            const path = `M${x0} ${pad.t + h} V${top + r} Q${x0} ${top} ${x0 + r} ${top} H${x0 + barW - r} Q${x0 + barW} ${top} ${x0 + barW} ${top + r} V${pad.t + h} Z`;
            return (
              <g key={d.x}>
                <path d={path} fill={MARK} opacity={hover === null || hover === i ? 1 : 0.45} style={{ transition: "opacity 150ms" }} />
                {highlightMax && i === peak && (
                  <text x={cx} y={top - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="#141414">
                    {format(d.y)}
                  </text>
                )}
                {((i % labelEvery === 0 && data.length - 1 - i >= labelEvery * 0.75) || i === data.length - 1) && (
                  <text x={cx} y={height - 8} textAnchor="middle" fontSize={11} fill={INK_MUTED}>
                    {d.x}
                  </text>
                )}
                <rect
                  x={pad.l + band * i}
                  y={pad.t}
                  width={band}
                  height={h}
                  fill="transparent"
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                />
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <Tooltip x={pad.l + band * hover + band / 2} y={y(data[hover].y)} width={width} title={data[hover].x} value={format(data[hover].y)} />
        )}
      </div>
      <TableView caption={label} head={["Period", "Value"]} rows={data.map((d) => [d.x, format(d.y)])} />
    </div>
  );
}

/** Ranked horizontal bars with the value at each tip. */
export function BarList({
  data,
  format,
  label,
}: {
  data: { label: string; value: number; href?: string }[];
  format: (n: number) => string;
  label: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <ul className="space-y-3" aria-label={label}>
        {data.map((d) => (
          <li key={d.label} className="group" title={`${d.label}: ${format(d.value)}`}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium">{d.label}</span>
              <span className="shrink-0 font-mono text-xs text-ash">{format(d.value)}</span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-r-[4px] bg-cream-200/60">
              <div
                className={cn("h-full rounded-r-[4px] transition-[width,opacity] duration-700 group-hover:opacity-80")}
                style={{ width: `${(d.value / max) * 100}%`, background: MARK }}
              />
            </div>
          </li>
        ))}
      </ul>
      <TableView caption={label} head={["Item", "Value"]} rows={data.map((d) => [d.label, format(d.value)])} />
    </div>
  );
}
