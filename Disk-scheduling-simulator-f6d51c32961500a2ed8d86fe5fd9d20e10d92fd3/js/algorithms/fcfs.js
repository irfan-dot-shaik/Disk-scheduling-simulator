// ============================================================
//  FCFS (First-Come First-Served) Disk Scheduling Algorithm
// ============================================================
// Serves disk requests in the exact order they arrive.
// Simple but often results in high seek time.
// ============================================================

/**
 * @param {number[]} requests - Array of cylinder numbers to service
 * @param {number} head - Initial head position
 * @returns {{ sequence: number[], total: number, name: string }}
 */
export function fcfs(requests, head) {
  const sequence = [head, ...requests];
  let total = 0;

  for (let i = 1; i < sequence.length; i++) {
    total += Math.abs(sequence[i] - sequence[i - 1]);
  }

  return { sequence, total, name: "FCFS" };
}
