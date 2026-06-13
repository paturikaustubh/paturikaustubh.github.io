export type DeviceTier = "high" | "low";

let cachedHardware: DeviceTier | null = null;

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function getDeviceTier(): DeviceTier {
  if (prefersReducedMotion()) return "low";
  if (cachedHardware) return cachedHardware;
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
  cachedHardware = lowMemory || lowCores || !webgl ? "low" : "high";
  return cachedHardware;
}
