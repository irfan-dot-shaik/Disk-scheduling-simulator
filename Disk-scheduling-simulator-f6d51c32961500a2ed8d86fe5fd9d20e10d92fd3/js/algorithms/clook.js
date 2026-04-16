// ============================================================
//  C-LOOK (Circular LOOK) Disk Scheduling Algorithm
// ============================================================
// Head moves right servicing requests, jumps back to the lowest
// pending request (without servicing), and continues right.
// Does not go to the disk boundaries.
// ============================================================

/**
 * @param {number[]} requests - Array of cylinder numbers to service
 * @param {number} head - Initial head position
 * @returns {{ sequence: number[], total: number, name: string }}
 */
export function clook(requests, head) {
  // Separate requests into those left and right of the head
  const left = requests.filter(r => r < head).sort((a, b) => a - b);
  const right = requests.filter(r => r >= head).sort((a, b) => a - b);

  // Go right, jump to the lowest pending request, then go right again
  const run = [...right, ...left];

  const sequence = [head];
  let total = 0;
  let current = head;

  for (const cylinder of run) {
    total += Math.abs(cylinder - current);
    current = cylinder;
    sequence.push(cylinder);
  }

  return { sequence, total, name: "C-LOOK" };
}
