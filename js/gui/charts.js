// ============================================================
//  Charts Module — Chart.js Visualizations
// ============================================================
// Handles creation & updating of seek sequence line chart
// and algorithm comparison bar chart.
// ============================================================

/**
 * Draw the seek sequence line chart.
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {Chart|null} existingChart - Previous chart to destroy
 * @param {number[]} sequence - Seek sequence
 * @param {number} diskSize - Total cylinders
 * @param {string} algoName - Algorithm name for the legend
 * @returns {Chart} - The new chart instance
 */
export function drawSeekChart(ctx, existingChart, sequence, diskSize, algoName) {
  if (existingChart) existingChart.destroy();

  const labels = sequence.map((_, i) => `Step ${i}`);

  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${algoName} Seek Sequence`,
        data: sequence,
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        pointBackgroundColor: sequence.map((_, i) => i === 0 ? "#f59e0b" : "#8b5cf6"),
        pointBorderColor: sequence.map((_, i) => i === 0 ? "#f59e0b" : "#6366f1"),
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0,
        fill: true,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#9ca3af", font: { family: "'Inter'" } } },
        tooltip: {
          backgroundColor: "rgba(17,17,40,0.9)",
          titleColor: "#e8e8f0",
          bodyColor: "#9ca3af",
          borderColor: "rgba(139,92,246,0.3)",
          borderWidth: 1,
          callbacks: { label: (tip) => `Cylinder ${tip.raw}` },
        },
      },
      scales: {
        x: {
          ticks: { color: "#6b7280", font: { size: 10 } },
          grid: { color: "rgba(139,92,246,0.06)" },
        },
        y: {
          min: 0,
          max: diskSize - 1,
          ticks: { color: "#6b7280", font: { size: 10 } },
          grid: { color: "rgba(139,92,246,0.06)" },
          title: { display: true, text: "Cylinder", color: "#6b7280" },
        },
      },
    },
  });
}

/**
 * Draw the algorithm comparison bar chart.
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {Chart|null} existingChart - Previous chart to destroy
 * @param {object[]} metrics - Array of { name, total, avg, throughput }
 * @returns {Chart}
 */
export function drawComparisonChart(ctx, existingChart, metrics) {
  if (existingChart) existingChart.destroy();

  const names = metrics.map(m => m.name);
  const colors = ["#f43f5e", "#10b981", "#3b82f6", "#f59e0b"];

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: names,
      datasets: [
        {
          label: "Total Seek Time",
          data: metrics.map(m => m.total),
          backgroundColor: colors.map(c => c + "44"),
          borderColor: colors,
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: "Avg Seek Time",
          data: metrics.map(m => parseFloat(m.avg)),
          backgroundColor: colors.map(c => c + "22"),
          borderColor: colors.map(c => c + "99"),
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#9ca3af", font: { family: "'Inter'" } } },
        tooltip: {
          backgroundColor: "rgba(17,17,40,0.9)",
          titleColor: "#e8e8f0",
          bodyColor: "#9ca3af",
          borderColor: "rgba(139,92,246,0.3)",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: { color: "#9ca3af", font: { size: 11 } },
          grid: { display: false },
        },
        y: {
          ticks: { color: "#6b7280" },
          grid: { color: "rgba(139,92,246,0.06)" },
          title: { display: true, text: "Seek Distance", color: "#6b7280" },
        },
      },
    },
  });
}

/**
 * Generate HTML for the comparison table.
 * @param {object[]} metrics - Array of { name, total, avg, throughput }
 * @param {number} bestIndex - Index of the best algorithm
 * @returns {string} HTML string
 */
export function buildComparisonTable(metrics, bestIndex) {
  const names = metrics.map(m => m.name);
  let html = `<table class="compare-table">
    <thead><tr>
      <th>Algorithm</th><th>Total Seek</th><th>Avg Seek</th><th>Throughput</th><th></th>
    </tr></thead><tbody>`;

  metrics.forEach((m, i) => {
    const isBest = i === bestIndex;
    html += `<tr class="${isBest ? "best-row" : ""}">
      <td class="algo-name">${names[i]}</td>
      <td>${m.total}</td>
      <td>${m.avg}</td>
      <td>${m.throughput}</td>
      <td>${isBest ? '<span class="badge badge-best">★ Best</span>' : ""}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  return html;
}
