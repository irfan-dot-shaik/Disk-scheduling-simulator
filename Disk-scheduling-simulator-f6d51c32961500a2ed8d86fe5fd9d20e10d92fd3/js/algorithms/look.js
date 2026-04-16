// ============================================================
//  LOOK Disk Scheduling Algorithm
// ============================================================
// Head moves in one direction servicing requests, then reverses
// upon reaching the last request in that direction (without
// going to the edge of the disk).
// ============================================================

/**
 * @param {number[]} requests - Array of cylinder numbers to service
 * @param {number} head - Initial head position
 * @param {string} direction - Initial direction: "left" or "right"
 * @returns {{ sequence: number[], total: number, name: string }}
 */
export function look(requests, head, direction = "right") {
  // Separate requests into those left and right of the head
  const left = requests.filter(r => r < head).sort((a, b) => a - b);
  const right = requests.filter(r => r >= head).sort((a, b) => a - b);

  let run;
  if (direction === "right") {
    // Go right to the max request, then go left
    run = [...right, ...left.reverse()];
  } else {
    // Go left to the min request, then go right
    run = [...left.reverse(), ...right];
  }

  const sequence = [head];
  let total = 0;
  let current = head;

  for (const cylinder of run) {
    total += Math.abs(cylinder - current);
    current = cylinder;
    sequence.push(cylinder);
  }

  return { sequence, total, name: "LOOK" };
}
