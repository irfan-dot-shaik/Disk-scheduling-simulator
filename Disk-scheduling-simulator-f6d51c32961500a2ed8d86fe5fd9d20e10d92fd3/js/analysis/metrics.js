// ============================================================
//  Performance Metrics Module
// ============================================================
// Computes Total Seek Time, Average Seek Time, and Throughput
// from a given seek sequence.
// ============================================================

/**
 * Compute performance metrics from a seek sequence.
 * @param {number[]} sequence - The ordered seek sequence (including initial head)
 * @returns {{ total: number, avg: string, throughput: string, distances: number[] }}
 */
export function computeMetrics(sequence) {
  const distances = [];

  for (let i = 1; i < sequence.length; i++) {
    distances.push(Math.abs(sequence[i] - sequence[i - 1]));
  }

  const total = distances.reduce((sum, d) => sum + d, 0);
  const avg = distances.length > 0 ? total / distances.length : 0;
  const throughput = total > 0 ? distances.length / total : 0;

  return {
    total,
    avg: avg.toFixed(2),
    throughput: throughput.toFixed(4),
    distances,
  };
}

/**
 * Compare all algorithms on the same input and return ranked results.
 * @param {object[]} results - Array of { sequence, total, name } from each algorithm
 * @returns {{ metrics: object[], bestIndex: number, bestName: string }}
 */
export function compareAll(results) {
  const metrics = results.map((r) => ({
    name: r.name,
    ...computeMetrics(r.sequence),
  }));

  const bestIndex = metrics.reduce(
    (best, m, i) => (m.total < metrics[best].total ? i : best),
    0
  );

  return {
    metrics,
    bestIndex,
    bestName: metrics[bestIndex].name,
  };
}
