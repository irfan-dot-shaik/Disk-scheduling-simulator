// ============================================================
//  F-SCAN Disk Scheduling Algorithm
// ============================================================
//  Special case of N-Step SCAN where N splits the queue into
//  exactly two sub-queues: one active (frozen at the start)
//  and one deferred (new arrivals). For static requests,
//  it places all requests in the active queue, functioning
//  like a single SCAN sweep that ignores stickiness.
// ============================================================

/**
 * @param {number[]} requests - Array of cylinder numbers to service
 * @param {number} head - Initial head position
 * @param {number} diskSize - Total number of cylinders on the disk
 * @param {string} direction - Initial direction: "left" or "right"
 * @returns {{ sequence: number[], total: number, name: string }}
 */
export function fscan(requests, head, diskSize, direction = "right") {
  // In a static simulator without arrival times, the "active queue"
  // just contains all current requests, and the "deferred queue" 
  // receives nothing. The active queue is serviced using SCAN order.
  
  const left = requests.filter(r => r < head).sort((a, b) => a - b);
  const right = requests.filter(r => r >= head).sort((a, b) => a - b);

  let run;
  if (direction === "right") {
    run = [...right, diskSize - 1, ...left.reverse()];
  } else {
    run = [...left.reverse(), 0, ...right];
  }

  const sequence = [head];
  let total = 0;
  let current = head;

  for (const cylinder of run) {
    if (cylinder !== current) {
      total += Math.abs(cylinder - current);
      current = cylinder;
      sequence.push(cylinder);
    }
  }

  return { sequence, total, name: "F-SCAN" };
}
