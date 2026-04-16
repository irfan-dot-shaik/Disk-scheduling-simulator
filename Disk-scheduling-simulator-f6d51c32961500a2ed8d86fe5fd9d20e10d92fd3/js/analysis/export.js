// ============================================================
//  Export Module — CSV and Report Generation
// ============================================================
// Handles exporting simulation results as downloadable CSV files.
// ============================================================

/**
 * Export simulation results as a CSV file download.
 * @param {object} result - { sequence: number[], total: number, name: string }
 * @param {object} metrics - { total, avg, throughput }
 */
export function exportCSV(result, metrics) {
  const rows = [
    ["Disk Scheduling Simulator — Export Report"],
    [""],
    ["Algorithm", result.name],
    ["Seek Sequence", result.sequence.join(" → ")],
    ["Total Seek Time", metrics.total],
    ["Average Seek Time", metrics.avg],
    ["Throughput", metrics.throughput],
    [""],
    ["Step-by-Step Breakdown"],
    ["Step", "Cylinder", "Seek Distance"],
  ];

  result.sequence.forEach((cylinder, i) => {
    const distance =
      i === 0 ? 0 : Math.abs(cylinder - result.sequence[i - 1]);
    rows.push([i, cylinder, distance]);
  });

  const csvContent = rows.map((row) => row.join(",")).join("\n");
  downloadFile(csvContent, `disk_scheduling_${result.name.toLowerCase()}.csv`, "text/csv");
}

/**
 * Export comparison table as CSV.
 * @param {object[]} metrics - Array of { name, total, avg, throughput }
 * @param {string} bestName - Name of the best algorithm
 */
export function exportComparisonCSV(metrics, bestName) {
  const rows = [
    ["Disk Scheduling Simulator — Algorithm Comparison"],
    [""],
    ["Algorithm", "Total Seek Time", "Avg Seek Time", "Throughput", "Best?"],
  ];

  metrics.forEach((m) => {
    rows.push([m.name, m.total, m.avg, m.throughput, m.name === bestName ? "★ YES" : ""]);
  });

  const csvContent = rows.map((row) => row.join(",")).join("\n");
  downloadFile(csvContent, "disk_scheduling_comparison.csv", "text/csv");
}

/**
 * Trigger a file download in the browser.
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
