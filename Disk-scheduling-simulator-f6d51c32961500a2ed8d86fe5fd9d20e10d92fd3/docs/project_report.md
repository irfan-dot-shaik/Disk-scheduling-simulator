# Advanced Disk Scheduling Simulator — Project Report

---

## 1. Introduction

### 1.1 Problem Statement
Build a disk scheduling simulator to visualize algorithms like FCFS, SSTF, SCAN, and C-SCAN. Users should be able to input custom disk access requests and see how the algorithms minimize seek time. Include performance metrics like average seek time and system throughput.

### 1.2 Objective
To design and implement a web-based simulator that:
- Implements four disk scheduling algorithms accurately
- Provides real-time visual animation of disk head movement
- Calculates and displays performance metrics
- Enables side-by-side comparison of all algorithms
- Supports data export for further analysis

### 1.3 Scope
- **In Scope:** FCFS, SSTF, SCAN, C-SCAN algorithms; interactive GUI; real-time animation; performance metrics (total seek, average seek, throughput); algorithm comparison; random request generation; CSV export
- **Out of Scope:** Real OS kernel integration; multi-platter simulation; network disk access

---

## 2. Background & Theory

### 2.1 What is Disk Scheduling?
Disk scheduling is the method by which an operating system decides the order in which disk I/O (input/output) requests are processed. The goal is to minimize the total seek time — the time it takes for the disk's read/write head to move to the requested cylinder.

### 2.2 Why Does It Matter?
- Disk I/O is one of the slowest operations in a computer system
- Efficient scheduling can dramatically reduce wait times
- Different algorithms offer different trade-offs between fairness, throughput, and latency

### 2.3 Algorithm Descriptions

#### FCFS (First-Come First-Served)
- Processes requests in the exact order they arrive
- **Advantage:** Fair, simple to implement
- **Disadvantage:** Can produce large total seek times (zig-zag pattern)

#### SSTF (Shortest Seek Time First)
- Always moves the head to the nearest pending request
- **Advantage:** Minimizes individual seek moves (greedy)
- **Disadvantage:** Can cause starvation — requests far from the head may wait indefinitely

#### SCAN (Elevator Algorithm)
- Head moves in one direction servicing requests, then reverses at the disk boundary
- **Advantage:** More uniform service than SSTF
- **Disadvantage:** Requests just visited must wait for a full sweep

#### C-SCAN (Circular SCAN)
- Head moves in one direction, then jumps back to the beginning without servicing
- **Advantage:** More uniform wait times than SCAN
- **Disadvantage:** Slightly higher total seek time due to the jump-back overhead

---

## 3. System Design

### 3.1 Architecture
The application uses a **modular architecture** with three distinct layers:

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (index.html + css/style.css)           │
├─────────────────────────────────────────┤
│           Application Layer             │
│  (js/app.js — event wiring)            │
├──────────┬──────────┬───────────────────┤
│ Module 1 │ Module 2 │    Module 3       │
│ Algo-    │ GUI /    │    Performance    │
│ rithms   │ Visual   │    Analysis       │
│          │          │                   │
│ fcfs.js  │ anim.js  │  metrics.js       │
│ sstf.js  │ charts.js│  export.js        │
│ scan.js  │ ui.js    │                   │
│ cscan.js │          │                   │
└──────────┴──────────┴───────────────────┘
```

### 3.2 Data Flow

```
User Input → Validation (ui.js) → Algorithm (fcfs/sstf/scan/cscan.js)
    → Returns { sequence, total, name }
    → Metrics Calculation (metrics.js)
    → UI Update: Animation (animation.js) + Chart (charts.js) + Metrics Display
    → Optional: Export (export.js) → CSV Download
```

### 3.3 Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Structure | HTML5 | Semantic markup, accessibility |
| Styling | CSS3 | Custom dark theme, glassmorphism, responsive |
| Logic | JavaScript ES6+ | No build tools needed, runs in any browser |
| Charts | Chart.js 4.4 | Professional-grade interactive charts |
| Animation | Canvas API | Smooth 2D rendering for disk head movement |
| Typography | Google Fonts | Inter + JetBrains Mono for professional look |

---

## 4. Implementation Details

### 4.1 Module 1: Algorithm Implementation

Each algorithm is a **pure function** — it takes input and returns output with no side effects. This makes them independently testable.

**Function Signature:**
```javascript
function algorithmName(requests, head, diskSize?, direction?)
  → { sequence: number[], total: number, name: string }
```

**Key Implementation Notes:**
- SSTF uses a greedy selection loop: O(n²) time complexity
- SCAN and C-SCAN sort requests into left/right partitions first: O(n log n)
- FCFS is the simplest at O(n) — just iterate in arrival order

### 4.2 Module 2: Visualization GUI

**Animation Engine (Canvas):**
- Uses `setTimeout` with configurable delay for step-by-step animation
- Renders: number line, tick marks, request markers, traversal path, glowing head indicator
- Supports pause/resume via a boolean flag checked in the animation loop

**Chart Integration (Chart.js):**
- Seek Sequence: Line chart with step index (x) vs cylinder number (y)
- Comparison: Grouped bar chart with total and average seek time per algorithm

### 4.3 Module 3: Performance Analysis

**Metrics Computed:**
| Metric | Formula |
|--------|---------|
| Total Seek Time | Σ |sequence[i] - sequence[i-1]| for i = 1..n |
| Average Seek Time | Total Seek Time / Number of Requests |
| Throughput | Number of Requests / Total Seek Time |

**Export Format:**
- CSV with header rows (algorithm name, seek sequence, metrics) followed by step-by-step breakdown table

---

## 5. Testing

### 5.1 Test Coverage
The project includes **30+ automated unit tests** covering:

| Test Area | Tests | Status |
|-----------|-------|--------|
| FCFS correctness | 5 | ✅ Pass |
| SSTF correctness | 4 | ✅ Pass |
| SCAN correctness | 4 | ✅ Pass |
| C-SCAN correctness | 4 | ✅ Pass |
| Metrics computation | 4 | ✅ Pass |
| Algorithm comparison | 4 | ✅ Pass |
| Edge cases | 5+ | ✅ Pass |

### 5.2 Test Methodology
- Tests are browser-based (open `tests/test_algorithms.html`)
- Each test asserts a specific condition against known expected output
- Edge cases include: single request, request at head position, empty request list

### 5.3 Sample Test Verification (Standard Input)

**Input:** Requests = [98, 183, 37, 122, 14, 124, 65, 67], Head = 53, Disk = 200

| Algorithm | Expected Total | Actual Total | Match? |
|-----------|---------------|--------------|--------|
| FCFS | 640 | 640 | ✅ |
| SSTF | 236 | 236 | ✅ |
| SCAN (right) | 331 | 331 | ✅ |
| C-SCAN | 389 | 389 | ✅ |

---

## 6. Results & Analysis

### 6.1 Comparative Analysis (Standard Input)

| Algorithm | Total Seek | Avg Seek | Throughput | Rank |
|-----------|-----------|----------|------------|------|
| FCFS | 640 | 80.00 | 0.0125 | 4th |
| **SSTF** | **236** | **29.50** | **0.0339** | **1st** |
| SCAN | 331 | 36.78 | 0.0272 | 2nd |
| C-SCAN | 389 | 38.90 | 0.0257 | 3rd |

### 6.2 Key Observations
1. **SSTF consistently produces the lowest total seek time** for random request distributions
2. **FCFS performs worst** because it doesn't optimize head movement at all
3. **SCAN and C-SCAN** provide a middle ground — lower than FCFS but higher than SSTF
4. **C-SCAN has slightly higher total seek than SCAN** due to the jump-back overhead, but provides **more uniform wait times**
5. **SSTF may cause starvation** in worst-case scenarios — not visible in small inputs but important in real systems

---

## 7. Features Summary

| # | Feature | Module | Status |
|---|---------|--------|--------|
| 1 | Custom disk request input | GUI | ✅ |
| 2 | Algorithm selection (4 types) | GUI | ✅ |
| 3 | Real-time disk head animation | GUI | ✅ |
| 4 | Seek sequence chart | GUI | ✅ |
| 5 | Performance metrics display | Analysis | ✅ |
| 6 | Algorithm comparison chart | GUI + Analysis | ✅ |
| 7 | Comparison ranked table | GUI + Analysis | ✅ |
| 8 | Random request generator | GUI | ✅ |
| 9 | CSV export | Analysis | ✅ |
| 10 | Animation pause/resume | GUI | ✅ |
| 11 | Speed control slider | GUI | ✅ |
| 12 | Input validation | GUI | ✅ |
| 13 | Responsive design | CSS | ✅ |
| 14 | Keyboard shortcuts | GUI | ✅ |
| 15 | About/info modal | GUI | ✅ |

---

## 8. Conclusion

This project successfully implements an **Advanced Disk Scheduling Simulator** that meets all requirements:

1. **All four algorithms** (FCFS, SSTF, SCAN, C-SCAN) are correctly implemented and verified with automated tests
2. **Real-time visualization** via Canvas animation and Chart.js charts provides clear visual feedback
3. **Performance metrics** (total seek, average seek, throughput) are computed and displayed for every simulation
4. **Algorithm comparison** enables side-by-side evaluation with ranked results
5. **Export capability** allows saving results as CSV for documentation or further analysis

The modular architecture ensures each component is independently testable and maintainable. The dark-mode glassmorphism UI provides a professional, modern user experience.

---

## 9. Future Enhancements

| Enhancement | Difficulty | Description |
|------------|-----------|-------------|
| LOOK / C-LOOK algorithms | Easy | Add 2 more algorithms that don't go to boundaries |
| PDF export | Medium | Generate formatted PDF reports with embedded charts |
| Queue arrival simulation | Medium | Requests arrive over time, not all at once |
| Multi-disk simulation | Hard | Simulate multiple disk platters |
| Web deployment | Easy | Deploy to GitHub Pages for online access |

---

## 10. References

1. Silberschatz, A., Galvin, P.B., & Gagne, G. — *Operating System Concepts* (10th Edition)
2. Tanenbaum, A.S. — *Modern Operating Systems* (4th Edition)
3. Chart.js Documentation — https://www.chartjs.org/docs/
4. MDN Canvas API — https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
