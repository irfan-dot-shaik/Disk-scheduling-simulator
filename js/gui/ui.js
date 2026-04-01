// ============================================================
//  UI Utilities Module
// ============================================================
// Toast notifications, input validation, random generation,
// and metric display helpers.
// ============================================================

/**
 * Show a toast notification.
 * @param {string} message - Message to display
 * @param {"success"|"error"} type - Toast type
 */
export function showToast(message, type = "success") {
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

/**
 * Validate and parse user inputs.
 * @returns {object|null} - Parsed inputs or null if invalid
 */
export function getInputs() {
  const raw = document.getElementById("input-requests").value.trim();
  if (!raw) { showToast("Please enter disk requests.", "error"); return null; }

  const requests = raw.split(/[,\s]+/).map(Number).filter(n => !isNaN(n) && n >= 0);
  if (!requests.length) { showToast("No valid requests found.", "error"); return null; }

  const head = parseInt(document.getElementById("input-head").value, 10);
  const diskSize = parseInt(document.getElementById("input-disk-size").value, 10);

  if (isNaN(head) || head < 0) { showToast("Invalid head position.", "error"); return null; }
  if (isNaN(diskSize) || diskSize < 1) { showToast("Invalid disk size.", "error"); return null; }

  const tooLarge = requests.filter(r => r >= diskSize);
  if (tooLarge.length) { showToast(`Requests ${tooLarge.join(", ")} exceed disk size (${diskSize}).`, "error"); return null; }
  if (head >= diskSize) { showToast("Head position must be less than disk size.", "error"); return null; }

  const direction = document.querySelector('input[name="direction"]:checked').value;
  const algo = document.getElementById("select-algorithm").value;

  return { requests, head, diskSize, direction, algo };
}

/**
 * Generate random disk requests.
 * @param {number} diskSize - Total cylinders
 * @param {number} count - How many requests to generate
 * @param {number} headPosition - Head position to exclude from random set
 * @returns {number[]}
 */
export function generateRandomRequests(diskSize, count, headPosition) {
  const set = new Set();
  const maxCount = Math.min(Math.max(count, 1), 50);

  while (set.size < maxCount) {
    const r = Math.floor(Math.random() * diskSize);
    if (r !== headPosition) set.add(r);
  }

  return [...set];
}

/**
 * Update a metric card with animation.
 * @param {string} valueId - ID of the value element
 * @param {string|number} value - Value to display
 * @param {string} cardId - ID of the card element (for pulse)
 */
export function setMetric(valueId, value, cardId) {
  const el = document.getElementById(valueId);
  el.textContent = value;
  const card = document.getElementById(cardId);
  card.classList.remove("pulse");
  void card.offsetWidth; // trigger reflow
  card.classList.add("pulse");
}
