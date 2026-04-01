// ============================================================
//  SCAN (Elevator) Disk Scheduling Algorithm
// ============================================================
// Head moves in one direction servicing requests, then reverses
// at the disk boundary and services the remaining direction.
// Also known as the "Elevator Algorithm".
// ============================================================

/**
 * @param {number[]} requests - Array of cylinder numbers to service
 * @param {number} head - Initial head position
 * @param {number} diskSize - Total number of cylinders on the disk
 * @param {string} direction - Initial direction: "left" or "right"
 * @returns {{ sequence: number[], total: number, name: string }}
 */
export function scan(requests, head, diskSize, direction = "right") {
  // Separate requests into those left and right of the head
  const left = requests.filter(r => r < head).sort((a, b) => a - b);
  const right = requests.filter(r => r >= head).sort((a, b) => a - b);

  let run;
  if (direction === "right") {
    // Go right first, hit the end, then go left
    run = [...right, diskSize - 1, ...left.reverse()];
  } else {
    // Go left first, hit 0, then go right
    run = [...left.reverse(), 0, ...right];
  }

  const sequence = [head];
  let total = 0;
  let current = head;

  for (const cylinder of run) {
    total += Math.abs(cylinder - current);
    current = cylinder;
    sequence.push(cylinder);
  }

  return { sequence, total, name: "SCAN" };
}
