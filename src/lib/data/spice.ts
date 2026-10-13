import type { SpiceLevel } from "../types";

export interface SpiceInfo {
  level: SpiceLevel;
  name: string;
  line: string;
  scoville: string;
}

export const spiceLevels: SpiceInfo[] = [
  { level: 1, name: "Mild", line: "A gentle warmth. All flavour, no sweat.", scoville: "0–1k SHU" },
  { level: 2, name: "Medium", line: "A friendly glow that builds as you eat.", scoville: "1k–10k SHU" },
  { level: 3, name: "Hot", line: "A proper kick. Keep a cooler nearby.", scoville: "10k–50k SHU" },
  { level: 4, name: "Fiery", line: "Sweat-on-the-brow territory. You've been warned.", scoville: "50k–300k SHU" },
  { level: 5, name: "Inferno", line: "Our hottest. For seasoned chili-heads only.", scoville: "300k+ SHU" },
];

export function spiceInfo(level: SpiceLevel) {
  return spiceLevels[level - 1];
}
