// ============================================================
//  N-Step SCAN Disk Scheduling Algorithm
// ============================================================
//  Works like SCAN but divides the incoming request queue
//  into fixed-size sub-queues of length N. Services one
//  sub-queue at a time using SCAN order.
// ============================================================

/**
 * @param {number[]} requests - Array of cylinder numbers to service
 * @param {number} head - Initial head position
 * @param {number} diskSize - Total number of cylinders on the disk
 * @param {string} direction - Initial direction: "left" or "right"
 * @param {number} n - The step size (number of requests per sub-queue)
 * @returns {{ sequence: number[], total: number, name: string }}
 */
export function nstepscan(requests, head, diskSize, direction = "right", n = 4) {
  const sequence = [head];
  let total = 0;
  let current = head;
  let currentDir = direction;

  // Clone requests so we can mutate the pending array
  const pending = [...requests];

  while (pending.length > 0) {
    // Take a queue of up to n requests
    const chunk = pending.splice(0, n);

    const left = chunk.filter(r => r < current).sort((a, b) => a - b);
    const right = chunk.filter(r => r >= current).sort((a, b) => a - b);

    let run = [];
    if (currentDir === "right") {
      run = [...right];
      if (left.length > 0) {
        // Must bounce off the far end to service the left requests
        run.push(diskSize - 1);
        run.push(...left.reverse());
        currentDir = "left";
      } else if (right.length > 0) {
        // Standard SCAN reaches the boundary anyway
        run.push(diskSize - 1);
        currentDir = "left";
      }
    } else {
      run = [...left.reverse()];
      if (right.length > 0) {
        // Must bounce off 0 to service the right requests
        run.push(0);
        run.push(...right);
        currentDir = "right";
      } else if (left.length > 0) {
        // Standard SCAN reaches the boundary anyway
        run.push(0);
        currentDir = "right";
      }
    }

    // Process the run
    for (const cylinder of run) {
      if (cylinder !== current) { // Avoid duplicate steps
        total += Math.abs(cylinder - current);
        current = cylinder;
        sequence.push(cylinder);
      }
    }
  }

  return { sequence, total, name: "N-Step SCAN" };
}
