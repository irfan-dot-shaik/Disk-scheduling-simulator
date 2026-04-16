// ============================================================
//  Disk Head Animation Module (Canvas-based)
// ============================================================
// Renders a real-time animation of the disk head moving
// across a cylinder number line, highlighting serviced requests.
// ============================================================

/**
 * Create and manage disk head animation.
 */
export class DiskHeadAnimator {
  constructor(canvas, speedInput) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.speedInput = speedInput;
    this.animFrameId = null;
    this.paused = false;
    this.stepIndex = 0;
    this.sequence = [];
    this.diskSize = 200;
    this.servicedSet = new Set();
    this.onStep = null;       // callback(stepIndex, totalSteps)
    this.onComplete = null;   // callback()
  }

  /**
   * Start a new animation with the given seek sequence.
   * @param {number[]} sequence - Seek sequence to animate
   * @param {number} diskSize - Total cylinders
   */
  start(sequence, diskSize) {
    this.stop();
    this.sequence = sequence;
    this.diskSize = diskSize;
    this.stepIndex = 0;
    this.servicedSet = new Set();
    this.paused = false;

    this._resizeCanvas();
    this._step();
  }

  /** Stop the current animation. */
  stop() {
    if (this.animFrameId) {
      clearTimeout(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /** Toggle pause/resume. Returns new paused state. */
  togglePause() {
    this.paused = !this.paused;
    return this.paused;
  }

  /** Redraw the current frame (e.g. on resize). */
  redraw() {
    if (this.sequence.length > 0) {
      this._resizeCanvas();
      this._drawFrame();
    }
  }

  /** Clear the canvas. */
  clear() {
    this.stop();
    this.sequence = [];
    this.stepIndex = 0;
    this.servicedSet = new Set();
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // ── Private ──────────────────────────────────────────────

  _resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = 180 * dpr;
    this.canvas.style.height = "180px";
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.W = rect.width;
    this.H = 180;
  }

  _getDelay() {
    const speedVal = parseInt(this.speedInput.value, 10);
    return Math.max(80, 800 - speedVal * 70);
  }

  _cyl2x(cylinder) {
    const padLeft = 50, padRight = 30;
    const trackW = (this.W - padLeft - padRight);
    return padLeft + (cylinder / (this.diskSize - 1)) * trackW;
  }

  _step() {
    if (this.paused) {
      this.animFrameId = setTimeout(() => this._step(), 100);
      return;
    }

    const totalSteps = this.sequence.length;

    if (this.stepIndex < totalSteps) {
      if (this.stepIndex > 0) this.servicedSet.add(this.sequence[this.stepIndex]);
      this._drawFrame();
      if (this.onStep) this.onStep(this.stepIndex, totalSteps);
      this.stepIndex++;
      this.animFrameId = setTimeout(() => this._step(), this._getDelay());
    } else {
      this._drawFrame();
      if (this.onComplete) this.onComplete();
    }
  }

  _drawFrame() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    const padLeft = 50, padRight = 30;
    const trackY = H / 2;
    const trackLeft = padLeft;
    const trackRight = W - padRight;

    ctx.clearRect(0, 0, W, H);

    // ── Track line ──
    ctx.strokeStyle = "rgba(139,92,246,0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trackLeft, trackY);
    ctx.lineTo(trackRight, trackY);
    ctx.stroke();

    // ── Tick marks ──
    const tickCount = Math.min(this.diskSize, 20);
    const tickStep = Math.max(1, Math.floor((this.diskSize - 1) / tickCount));
    ctx.fillStyle = "#6b7280";
    ctx.font = "10px 'JetBrains Mono'";
    ctx.textAlign = "center";

    for (let c = 0; c < this.diskSize; c += tickStep) {
      const x = this._cyl2x(c);
      ctx.beginPath();
      ctx.moveTo(x, trackY - 5);
      ctx.lineTo(x, trackY + 5);
      ctx.strokeStyle = "rgba(139,92,246,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillText(c, x, trackY + 18);
    }
    // Last tick
    const xLast = this._cyl2x(this.diskSize - 1);
    ctx.beginPath();
    ctx.moveTo(xLast, trackY - 5);
    ctx.lineTo(xLast, trackY + 5);
    ctx.stroke();
    ctx.fillText(this.diskSize - 1, xLast, trackY + 18);

    // ── Request markers ──
    const requestsInSeq = this.sequence.slice(1);
    for (const r of requestsInSeq) {
      const x = this._cyl2x(r);
      const serviced = this.servicedSet.has(r);
      ctx.beginPath();
      ctx.arc(x, trackY, 4, 0, Math.PI * 2);
      ctx.fillStyle = serviced ? "#10b981" : "rgba(139,92,246,0.4)";
      ctx.fill();
      if (serviced) {
        ctx.strokeStyle = "rgba(16,185,129,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // ── Path trace ──
    const curStep = Math.min(this.stepIndex, this.sequence.length - 1);
    if (this.stepIndex > 0) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(139,92,246,0.5)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= curStep; i++) {
        const x = this._cyl2x(this.sequence[i]);
        if (i === 0) ctx.moveTo(x, trackY);
        else ctx.lineTo(x, trackY - (i % 2 === 0 ? -8 : 8));
      }
      ctx.stroke();
    }

    // ── Head indicator ──
    const headX = this._cyl2x(this.sequence[curStep]);

    // Glow effect
    const glow = ctx.createRadialGradient(headX, trackY - 14, 0, headX, trackY - 14, 20);
    glow.addColorStop(0, "rgba(139,92,246,0.4)");
    glow.addColorStop(1, "rgba(139,92,246,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(headX, trackY - 14, 20, 0, Math.PI * 2);
    ctx.fill();

    // Triangle
    ctx.beginPath();
    ctx.moveTo(headX, trackY - 6);
    ctx.lineTo(headX - 7, trackY - 22);
    ctx.lineTo(headX + 7, trackY - 22);
    ctx.closePath();
    ctx.fillStyle = "#8b5cf6";
    ctx.fill();
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label
    ctx.fillStyle = "#e8e8f0";
    ctx.font = "bold 11px 'JetBrains Mono'";
    ctx.textAlign = "center";
    ctx.fillText(this.sequence[curStep], headX, trackY - 26);
  }
}
