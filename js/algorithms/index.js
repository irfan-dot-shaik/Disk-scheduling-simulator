// ============================================================
//  Algorithm Index — Exports all scheduling algorithms
// ============================================================

export { fcfs } from './fcfs.js';
export { sstf } from './sstf.js';
export { scan } from './scan.js';
export { cscan } from './cscan.js';

/**
 * Run a specific algorithm by name.
 * @param {string} algo - Algorithm key: "fcfs", "sstf", "scan", "cscan"
 * @param {number[]} requests - Cylinder numbers
 * @param {number} head - Initial head position
 * @param {number} diskSize - Total cylinders
 * @param {string} direction - "left" or "right" (only used by SCAN)
 */
export function runAlgorithm(algo, requests, head, diskSize, direction) {
  // Lazy import to avoid circular deps
  switch (algo) {
    case "fcfs": {
      const { fcfs: fn } = await_import('./fcfs.js');
      return fn(requests, head);
    }
    case "sstf": {
      const { sstf: fn } = await_import('./sstf.js');
      return fn(requests, head);
    }
    case "scan": {
      const { scan: fn } = await_import('./scan.js');
      return fn(requests, head, diskSize, direction);
    }
    case "cscan": {
      const { cscan: fn } = await_import('./cscan.js');
      return fn(requests, head, diskSize);
    }
    default:
      throw new Error(`Unknown algorithm: ${algo}`);
  }
}

// Synchronous helper used by the main app (avoids dynamic import overhead)
function await_import(path) {
  // This is a placeholder — in the main app.js we import directly
  // This file serves as the barrel export for documentation
  return {};
}
