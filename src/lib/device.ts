export type DeviceTier = "high" | "low";

let cached: DeviceTier | null = null;

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function getDeviceTier(): DeviceTier {
  if (cached) return cached;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowMemory = nav.deviceMemory !== undefined && nav.deviceMemory < 4;
  const lowCores =
    navigator.hardwareConcurrency !== undefined &&
    navigator.hardwareConcurrency < 4;
  let webgl = false;
  try {
    const canvas = document.createElement("canvas");
    webgl = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webgl = false;
  }
  cached =
    prefersReducedMotion() || lowMemory || lowCores || !webgl ? "low" : "high";
  return cached;
}
