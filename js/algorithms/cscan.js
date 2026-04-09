// ============================================================
//  C-SCAN (Circular SCAN) Disk Scheduling Algorithm
// ============================================================
// Head moves in one direction servicing requests, jumps back
// to the start of the disk (without servicing), and continues  
// in the same direction. Provides more uniform wait time.
// ============================================================

/**
 * @param {number[]} requests - Array of cylinder numbers to service
 * @param {number} head - Initial head position
 * @param {number} diskSize - Total number of cylinders on the disk
 * @returns {{ sequence: number[], total: number, name: string }}
 */
export function cscan(requests, head, diskSize) {
  // Separate requests into those left and right of the head
  const left = requests.filter(r => r < head).sort((a, b) => a - b);
  const right = requests.filter(r => r >= head).sort((a, b) => a - b);

  // Go right, hit the end, jump to 0, then service left-side requests
  const run = [...right, diskSize - 1, 0, ...left];

  const sequence = [head];
  let total = 0;
  let current = head;

  for (const cylinder of run) {
    total += Math.abs(cylinder - current);
    current = cylinder;
    sequence.push(cylinder);
  }

  return { sequence, total, name: "C-SCAN" };
}
