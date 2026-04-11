// ============================================================
//  app.js — Main Application Entry Point
// ============================================================
//  Wires together all modules:
//    - algorithms/ (FCFS, SSTF, SCAN, C-SCAN)
//    - analysis/   (metrics, export)
//    - gui/        (animation, charts, ui)
//
//  Note: Because this app runs via a simple HTTP server (no
//  bundler), we inline all module code here to avoid CORS
//  issues with ES module imports on file:// or basic servers.
//  The individual module files serve as the documented,
//  separated source-of-truth for each component.
// ============================================================

(() => {
  "use strict";

  // ──────────────────────────────────────────────────────────
  //  DOM References
  // ──────────────────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const inputRequests   = $("#input-requests");
  const inputHead       = $("#input-head");
  const inputDiskSize   = $("#input-disk-size");
  const selectAlgorithm = $("#select-algorithm");
  const inputSpeed      = $("#input-speed");
  const inputRandomCnt  = $("#input-random-count");
  const dirGroup        = $("#direction-group");
  const btnSimulate     = $("#btn-simulate");
  const btnCompare      = $("#btn-compare");
  const btnRandom       = $("#btn-random");
  const btnExportCSV    = $("#btn-export-csv");
  const btnReset        = $("#btn-reset");
  const btnPause        = $("#btn-pause");
  const btnAbout        = $("#btn-about");
  const modalOverlay    = $("#modal-overlay");
  const modalClose      = $("#modal-close");
  const animStepLabel   = $("#anim-step");
  const iconPause       = $("#icon-pause");
  const iconPlay        = $("#icon-play");
  const sequenceText    = $("#sequence-text");
  const animCanvas      = $("#canvas-animation");
  const chartContainer  = $("#chart-container");
  const compContainer   = $("#comparison-container");

  // ──────────────────────────────────────────────────────────
  //  State
  // ──────────────────────────────────────────────────────────
  let seekChart = null;
  let compareChart = null;
  let animFrameId = null;
  let animPaused = false;
  let currentResult = null;

  // ══════════════════════════════════════════════════════════
  //  MODULE 1: ALGORITHM IMPLEMENTATIONS
  // ══════════════════════════════════════════════════════════
  //  (Source: js/algorithms/fcfs.js, sstf.js, scan.js, cscan.js)

  function fcfs(requests, head) {
    const seq = [head, ...requests];
    let total = 0;
    for (let i = 1; i < seq.length; i++) total += Math.abs(seq[i] - seq[i - 1]);
    return { sequence: seq, total, name: "FCFS" };
  }

  function sstf(requests, head) {
    const pending = [...requests];
    const seq = [head];
    let total = 0, cur = head;
    while (pending.length) {
      let minDist = Infinity, minIdx = 0;
      for (let i = 0; i < pending.length; i++) {
        const d = Math.abs(pending[i] - cur);
        if (d < minDist) { minDist = d; minIdx = i; }
      }
      total += minDist;
      cur = pending[minIdx];
      seq.push(cur);
      pending.splice(minIdx, 1);
    }
    return { sequence: seq, total, name: "SSTF" };
  }

  function scan(requests, head, diskSize, direction) {
    const left  = requests.filter(r => r < head).sort((a, b) => a - b);
    const right = requests.filter(r => r >= head).sort((a, b) => a - b);
    let run;
    if (direction === "right") {
      run = [...right, diskSize - 1, ...left.reverse()];
    } else {
      run = [...left.reverse(), 0, ...right];
    }
    const seq = [head];
    let total = 0, cur = head;
    for (const c of run) { total += Math.abs(c - cur); cur = c; seq.push(c); }
    return { sequence: seq, total, name: "SCAN" };
  }

  function cscan(requests, head, diskSize) {
    const left  = requests.filter(r => r < head).sort((a, b) => a - b);
    const right = requests.filter(r => r >= head).sort((a, b) => a - b);
    const run = [...right, diskSize - 1, 0, ...left];
    const seq = [head];
    let total = 0, cur = head;
    for (const c of run) { total += Math.abs(c - cur); cur = c; seq.push(c); }
    return { sequence: seq, total, name: "C-SCAN" };
  }

  function look(requests, head, direction) {
    const left = requests.filter(r => r < head).sort((a, b) => a - b);
    const right = requests.filter(r => r >= head).sort((a, b) => a - b);
    let run;
    if (direction === "right") { run = [...right, ...left.reverse()]; }
    else { run = [...left.reverse(), ...right]; }
    const seq = [head];
    let total = 0, cur = head;
    for (const c of run) { total += Math.abs(c - cur); cur = c; seq.push(c); }
    return { sequence: seq, total, name: "LOOK" };
  }

  function clook(requests, head) {
    const left = requests.filter(r => r < head).sort((a, b) => a - b);
    const right = requests.filter(r => r >= head).sort((a, b) => a - b);
    const run = [...right, ...left];
    const seq = [head];
    let total = 0, cur = head;
    for (const c of run) { total += Math.abs(c - cur); cur = c; seq.push(c); }
    return { sequence: seq, total, name: "C-LOOK" };
  }

  function runAlgorithm(algo, requests, head, diskSize, direction) {
    switch (algo) {
      case "fcfs":  return fcfs(requests, head);
      case "sstf":  return sstf(requests, head);
      case "scan":  return scan(requests, head, diskSize, direction);
      case "cscan": return cscan(requests, head, diskSize);
      case "look":  return look(requests, head, direction);
      case "clook": return clook(requests, head);
      default:      return fcfs(requests, head);
    }
  }

  // ══════════════════════════════════════════════════════════
  //  MODULE 3: PERFORMANCE ANALYSIS
  // ══════════════════════════════════════════════════════════
  //  (Source: js/analysis/metrics.js)

  function computeMetrics(seq) {
    const dists = [];
    for (let i = 1; i < seq.length; i++) dists.push(Math.abs(seq[i] - seq[i - 1]));
    const total = dists.reduce((a, b) => a + b, 0);
    const avg = dists.length ? total / dists.length : 0;
    const throughput = total ? dists.length / total : 0;
    return { total, avg: avg.toFixed(2), throughput: throughput.toFixed(4) };
  }

  function displayMetrics(metrics, algoName) {
    setMetric("val-total", metrics.total, "metric-total");
    setMetric("val-avg", metrics.avg, "metric-avg");
    setMetric("val-throughput", metrics.throughput, "metric-throughput");
    setMetric("val-algo", algoName, "metric-algo");
    btnExportCSV.disabled = false;
  }

  function setMetric(id, value, cardId) {
    const el = $(`#${id}`);
    el.textContent = value;
    const card = $(`#${cardId}`);
    card.classList.remove("pulse");
    void card.offsetWidth;
    card.classList.add("pulse");
  }

  // ══════════════════════════════════════════════════════════
  //  MODULE 2: GUI — Input Validation
  // ══════════════════════════════════════════════════════════
  //  (Source: js/gui/ui.js)

  function getInputs() {
    const raw = inputRequests.value.trim();
    if (!raw) return showToast("Please enter disk requests.", "error"), null;
    const requests = raw.split(/[,\s]+/).map(Number).filter(n => !isNaN(n) && n >= 0);
    if (!requests.length) return showToast("No valid requests found.", "error"), null;
    const head = parseInt(inputHead.value, 10);
    const diskSize = parseInt(inputDiskSize.value, 10);
    if (isNaN(head) || head < 0) return showToast("Invalid head position.", "error"), null;
    if (isNaN(diskSize) || diskSize < 1) return showToast("Invalid disk size.", "error"), null;
    const tooLarge = requests.filter(r => r >= diskSize);
    if (tooLarge.length) return showToast(`Requests ${tooLarge.join(", ")} exceed disk size (${diskSize}).`, "error"), null;
    if (head >= diskSize) return showToast("Head position must be less than disk size.", "error"), null;
    const direction = document.querySelector('input[name="direction"]:checked').value;
    const algo = selectAlgorithm.value;
    return { requests, head, diskSize, direction, algo };
  }

  // ══════════════════════════════════════════════════════════
  //  MODULE 2: GUI — Seek Sequence Chart
  // ══════════════════════════════════════════════════════════
  //  (Source: js/gui/charts.js)

  function drawSeekChart(sequence, diskSize, algoName) {
    chartContainer.classList.remove("hidden");
    const labels = sequence.map((_, i) => `Step ${i}`);
    const ctx = $("#chart-seek").getContext("2d");
    if (seekChart) seekChart.destroy();

    seekChart = new Chart(ctx, {
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
          pointRadius: 5, pointHoverRadius: 7, tension: 0, fill: true, borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "#9ca3af", font: { family: "'Inter'" } } },
          tooltip: {
            backgroundColor: "rgba(17,17,40,0.9)", titleColor: "#e8e8f0",
            bodyColor: "#9ca3af", borderColor: "rgba(139,92,246,0.3)", borderWidth: 1,
            callbacks: { label: (tip) => `Cylinder ${tip.raw}` },
          },
        },
        scales: {
          x: { ticks: { color: "#6b7280", font: { size: 10 } }, grid: { color: "rgba(139,92,246,0.06)" } },
          y: {
            min: 0, max: diskSize - 1,
            ticks: { color: "#6b7280", font: { size: 10 } },
            grid: { color: "rgba(139,92,246,0.06)" },
            title: { display: true, text: "Cylinder", color: "#6b7280" },
          },
        },
      },
    });

    sequenceText.textContent = sequence.join(" → ");
  }

  // ══════════════════════════════════════════════════════════
  //  MODULE 2: GUI — Disk Head Animation
  // ══════════════════════════════════════════════════════════
  //  (Source: js/gui/animation.js)

  function animateDiskHead(sequence, diskSize) {
    const canvas = animCanvas;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 180 * dpr;
    canvas.style.height = "180px";
    ctx.scale(dpr, dpr);
    const W = rect.width, H = 180;
    const pad = { left: 50, right: 30 };
    const trackY = H / 2;
    const trackLeft = pad.left;
    const trackRight = W - pad.right;
    const cyl2x = (c) => trackLeft + (c / (diskSize - 1)) * (trackRight - trackLeft);

    let stepIndex = 0;
    const totalSteps = sequence.length;
    const servicedSet = new Set();
    animPaused = false;
    iconPause.style.display = "";
    iconPlay.style.display = "none";
    btnPause.disabled = false;

    const speedVal = parseInt(inputSpeed.value, 10);
    const delay = Math.max(80, 800 - speedVal * 70);

    function drawFrame() {
      ctx.clearRect(0, 0, W, H);

      // Track
      ctx.strokeStyle = "rgba(139,92,246,0.15)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(trackLeft, trackY); ctx.lineTo(trackRight, trackY); ctx.stroke();

      // Ticks
      const tickStep = Math.max(1, Math.floor((diskSize - 1) / Math.min(diskSize, 20)));
      ctx.fillStyle = "#6b7280"; ctx.font = "10px 'JetBrains Mono'"; ctx.textAlign = "center";
      for (let c = 0; c < diskSize; c += tickStep) {
        const x = cyl2x(c);
        ctx.beginPath(); ctx.moveTo(x, trackY - 5); ctx.lineTo(x, trackY + 5);
        ctx.strokeStyle = "rgba(139,92,246,0.2)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillText(c, x, trackY + 18);
      }
      const xL = cyl2x(diskSize - 1);
      ctx.beginPath(); ctx.moveTo(xL, trackY - 5); ctx.lineTo(xL, trackY + 5); ctx.stroke();
      ctx.fillText(diskSize - 1, xL, trackY + 18);

      // Request markers
      for (const r of sequence.slice(1)) {
        const x = cyl2x(r);
        const s = servicedSet.has(r);
        ctx.beginPath(); ctx.arc(x, trackY, 4, 0, Math.PI * 2);
        ctx.fillStyle = s ? "#10b981" : "rgba(139,92,246,0.4)"; ctx.fill();
        if (s) { ctx.strokeStyle = "rgba(16,185,129,0.5)"; ctx.lineWidth = 1; ctx.stroke(); }
      }

      // Path
      const curStep = Math.min(stepIndex, totalSteps - 1);
      if (stepIndex > 0) {
        ctx.beginPath(); ctx.strokeStyle = "rgba(139,92,246,0.5)"; ctx.lineWidth = 1.5;
        for (let i = 0; i <= curStep; i++) {
          const x = cyl2x(sequence[i]);
          if (i === 0) ctx.moveTo(x, trackY);
          else ctx.lineTo(x, trackY - (i % 2 === 0 ? -8 : 8));
        }
        ctx.stroke();
      }

      // Head
      const headX = cyl2x(sequence[curStep]);
      const glow = ctx.createRadialGradient(headX, trackY - 14, 0, headX, trackY - 14, 20);
      glow.addColorStop(0, "rgba(139,92,246,0.4)"); glow.addColorStop(1, "rgba(139,92,246,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(headX, trackY - 14, 20, 0, Math.PI * 2); ctx.fill();

      ctx.beginPath();
      ctx.moveTo(headX, trackY - 6); ctx.lineTo(headX - 7, trackY - 22); ctx.lineTo(headX + 7, trackY - 22);
      ctx.closePath(); ctx.fillStyle = "#8b5cf6"; ctx.fill();
      ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 1; ctx.stroke();

      ctx.fillStyle = "#e8e8f0"; ctx.font = "bold 11px 'JetBrains Mono'"; ctx.textAlign = "center";
      ctx.fillText(sequence[curStep], headX, trackY - 26);
      animStepLabel.textContent = `Step ${curStep} / ${totalSteps - 1}`;
    }

    function step() {
      if (animPaused) { animFrameId = setTimeout(step, 100); return; }
      if (stepIndex < totalSteps) {
        if (stepIndex > 0) servicedSet.add(sequence[stepIndex]);
        drawFrame(); stepIndex++;
        animFrameId = setTimeout(step, delay);
      } else {
        drawFrame(); btnPause.disabled = true;
      }
    }

    if (animFrameId) clearTimeout(animFrameId);
    step();
  }

  // ══════════════════════════════════════════════════════════
  //  MODULE 2: GUI — Algorithm Comparison
  // ══════════════════════════════════════════════════════════
  //  (Source: js/gui/charts.js)

  function drawComparison(requests, head, diskSize, direction) {
    const algos = ["fcfs", "sstf", "scan", "cscan", "look", "clook"];
    const names = ["FCFS", "SSTF", "SCAN", "C-SCAN", "LOOK", "C-LOOK"];
    const colors = ["#f43f5e", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];
    const results = algos.map(a => runAlgorithm(a, requests, head, diskSize, direction));
    const metrics = results.map(r => computeMetrics(r.sequence));

    compContainer.classList.remove("hidden");
    const ctx = $("#chart-compare").getContext("2d");
    if (compareChart) compareChart.destroy();

    compareChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: names,
        datasets: [
          {
            label: "Total Seek Time",
            data: metrics.map(m => m.total),
            backgroundColor: colors.map(c => c + "44"),
            borderColor: colors, borderWidth: 2, borderRadius: 6,
          },
          {
            label: "Avg Seek Time",
            data: metrics.map(m => parseFloat(m.avg)),
            backgroundColor: colors.map(c => c + "22"),
            borderColor: colors.map(c => c + "99"), borderWidth: 1.5, borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "#9ca3af", font: { family: "'Inter'" } } },
          tooltip: {
            backgroundColor: "rgba(17,17,40,0.9)", titleColor: "#e8e8f0",
            bodyColor: "#9ca3af", borderColor: "rgba(139,92,246,0.3)", borderWidth: 1,
          },
        },
        scales: {
          x: { ticks: { color: "#9ca3af", font: { size: 11 } }, grid: { display: false } },
          y: {
            ticks: { color: "#6b7280" }, grid: { color: "rgba(139,92,246,0.06)" },
            title: { display: true, text: "Seek Distance", color: "#6b7280" },
          },
        },
      },
    });

    // Table
    const bestIdx = metrics.reduce((best, m, i) => m.total < metrics[best].total ? i : best, 0);
    let html = `<table class="compare-table">
      <thead><tr><th>Algorithm</th><th>Total Seek</th><th>Avg Seek</th><th>Throughput</th><th></th></tr></thead><tbody>`;
    metrics.forEach((m, i) => {
      const isBest = i === bestIdx;
      html += `<tr class="${isBest ? "best-row" : ""}">
        <td class="algo-name">${names[i]}</td><td>${m.total}</td><td>${m.avg}</td><td>${m.throughput}</td>
        <td>${isBest ? '<span class="badge badge-best">★ Best</span>' : ""}</td></tr>`;
    });
    html += `</tbody></table>`;
    $("#comparison-table-wrap").innerHTML = html;
  }

  // ══════════════════════════════════════════════════════════
  //  MODULE 3: ANALYSIS — CSV Export
  // ══════════════════════════════════════════════════════════
  //  (Source: js/analysis/export.js)

  function exportCSV() {
    if (!currentResult) return;
    const m = computeMetrics(currentResult.sequence);
    const rows = [
      ["Disk Scheduling Simulator — Export Report"],
      [""],
      ["Algorithm", currentResult.name],
      ["Seek Sequence", currentResult.sequence.join(" → ")],
      ["Total Seek Time", m.total],
      ["Average Seek Time", m.avg],
      ["Throughput", m.throughput],
      [],
      ["Step-by-Step Breakdown"],
      ["Step", "Cylinder", "Seek Distance"],
    ];
    currentResult.sequence.forEach((c, i) => {
      const dist = i === 0 ? 0 : Math.abs(c - currentResult.sequence[i - 1]);
      rows.push([i, c, dist]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `disk_scheduling_${currentResult.name.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported successfully!", "success");
  }

  // ══════════════════════════════════════════════════════════
  //  GUI — Toast Notification
  // ══════════════════════════════════════════════════════════

  function showToast(message, type = "success") {
    document.querySelectorAll(".toast").forEach(t => t.remove());
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${type === "success" ? "#10b981" : "#f43f5e"}" stroke-width="2">
        ${type === "success"
          ? '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
          : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
      </svg>
      ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ══════════════════════════════════════════════════════════
  //  EVENT HANDLERS
  // ══════════════════════════════════════════════════════════

  selectAlgorithm.addEventListener("change", () => {
    dirGroup.classList.toggle("collapsed", !["scan", "look"].includes(selectAlgorithm.value));
  });
  dirGroup.classList.toggle("collapsed", !["scan", "look"].includes(selectAlgorithm.value));

  btnSimulate.addEventListener("click", () => {
    const inp = getInputs();
    if (!inp) return;
    const result = runAlgorithm(inp.algo, inp.requests, inp.head, inp.diskSize, inp.direction);
    currentResult = result;
    const metrics = computeMetrics(result.sequence);
    displayMetrics(metrics, result.name);
    drawSeekChart(result.sequence, inp.diskSize, result.name);
    animateDiskHead(result.sequence, inp.diskSize);
    compContainer.classList.add("hidden");
  });

  btnCompare.addEventListener("click", () => {
    const inp = getInputs();
    if (!inp) return;
    const result = runAlgorithm(inp.algo, inp.requests, inp.head, inp.diskSize, inp.direction);
    currentResult = result;
    const metrics = computeMetrics(result.sequence);
    displayMetrics(metrics, result.name);
    drawSeekChart(result.sequence, inp.diskSize, result.name);
    animateDiskHead(result.sequence, inp.diskSize);
    drawComparison(inp.requests, inp.head, inp.diskSize, inp.direction);
  });

  btnRandom.addEventListener("click", () => {
    const diskSize = parseInt(inputDiskSize.value, 10) || 200;
    const count = Math.min(Math.max(parseInt(inputRandomCnt.value, 10) || 8, 1), 50);
    const set = new Set();
    const head = parseInt(inputHead.value, 10) || 53;
    while (set.size < count) {
      const r = Math.floor(Math.random() * diskSize);
      if (r !== head) set.add(r);
    }
    inputRequests.value = [...set].join(", ");
    showToast(`Generated ${count} random requests.`, "success");
  });

  btnExportCSV.addEventListener("click", exportCSV);

  btnReset.addEventListener("click", () => {
    inputRequests.value = "";
    inputHead.value = 53;
    inputDiskSize.value = 200;
    selectAlgorithm.value = "fcfs";
    inputSpeed.value = 5;
    inputRandomCnt.value = 8;
    document.querySelector('input[name="direction"][value="right"]').checked = true;
    dirGroup.classList.add("collapsed");
    ["val-total", "val-avg", "val-throughput", "val-algo"].forEach(id => { $(`#${id}`).textContent = "—"; });
    if (seekChart) { seekChart.destroy(); seekChart = null; }
    if (compareChart) { compareChart.destroy(); compareChart = null; }
    if (animFrameId) clearTimeout(animFrameId);
    sequenceText.textContent = "";
    animStepLabel.textContent = "Step 0 / 0";
    animCanvas.getContext("2d").clearRect(0, 0, animCanvas.width, animCanvas.height);
    compContainer.classList.add("hidden");
    btnExportCSV.disabled = true;
    currentResult = null;
    showToast("Simulator reset.", "success");
  });

  btnPause.addEventListener("click", () => {
    animPaused = !animPaused;
    iconPause.style.display = animPaused ? "none" : "";
    iconPlay.style.display = animPaused ? "" : "none";
  });

  btnAbout.addEventListener("click", () => modalOverlay.classList.remove("hidden"));
  modalClose.addEventListener("click", () => modalOverlay.classList.add("hidden"));
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.add("hidden");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.activeElement.tagName !== "BUTTON") btnSimulate.click();
    if (e.key === "Escape") modalOverlay.classList.add("hidden");
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (currentResult) {
        animateDiskHead(currentResult.sequence, parseInt(inputDiskSize.value, 10) || 200);
      }
    }, 200);
  });

  // ── Preload sample data ──
  inputRequests.value = "98, 183, 37, 122, 14, 124, 65, 67";

})();
