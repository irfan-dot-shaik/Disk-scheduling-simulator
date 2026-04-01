// ============================================================
//  SSTF (Shortest Seek Time First) Disk Scheduling Algorithm
// ============================================================
// Greedy algorithm: always moves to the nearest pending request.
// Minimizes seek time but may cause starvation of far requests.
// ============================================================

/**
 * @param {number[]} requests - Array of cylinder numbers to service
 * @param {number} head - Initial head position
 * @returns {{ sequence: number[], total: number, name: string }}
 */
export function sstf(requests, head) {
  const pending = [...requests];
  const sequence = [head];
  let total = 0;
  let current = head;

  while (pending.length > 0) {
    // Find the nearest request
    let minDistance = Infinity;
    let minIndex = 0;

    for (let i = 0; i < pending.length; i++) {
      const distance = Math.abs(pending[i] - current);
      if (distance < minDistance) {
        minDistance = distance;
        minIndex = i;
      }
    }

    total += minDistance;
    current = pending[minIndex];
    sequence.push(current);
    pending.splice(minIndex, 1);
  }

  return { sequence, total, name: "SSTF" };
}
