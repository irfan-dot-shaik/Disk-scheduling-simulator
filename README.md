# 💿 Advanced Disk Scheduling Simulator

<div align="center">

A web-based simulator that visualizes **8 classic disk scheduling algorithms** with real-time animation, interactive charts, performance metrics, and side-by-side comparison.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)

[🚀 Live Demo](#getting-started) · [📖 Documentation](#algorithms) · [🐛 Report Bug](../../issues) · [✨ Request Feature](../../issues)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Algorithms](#algorithms)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Sample Input & Output](#sample-input--output)
- [Module Breakdown](#module-breakdown)
- [Running Tests](#running-tests)
- [Technologies Used](#technologies-used)
- [License](#license)

---

## 🧭 Overview

This simulator is built for **Operating Systems** students and enthusiasts to visually understand how disk scheduling algorithms work. Enter your own disk request queue, pick an algorithm, and watch the disk head move across cylinders in real time — then compare all algorithms side-by-side to see which one performs best for your workload.

---

## ✨ Features

### Core
- ✅ **8 disk scheduling algorithms** — FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK, N-Step SCAN, F-SCAN
- ✅ Custom disk request input (comma-separated cylinder numbers)
- ✅ Configurable head position, disk size, and sweep direction
- ✅ Interactive seek sequence line chart (Chart.js)
- ✅ Performance metrics: Total Seek Time, Average Seek Time, Throughput

### Advanced
- ✅ **Real-time disk head animation** using the Canvas API
- ✅ **Pause / Resume** animation control
- ✅ **Adjustable animation speed** (slow → fast slider)
- ✅ **Compare All Algorithms** side-by-side with a bar chart + ranked table
- ✅ **★ Best badge** highlighting the optimal algorithm for your input
- ✅ **Random request generator** (1–50 requests)
- ✅ **CSV export** with step-by-step breakdown
- ✅ **Input validation** with toast error messages
- ✅ **Responsive design** — desktop, tablet, and mobile
- ✅ **Keyboard shortcuts** — `Enter` to simulate, `Escape` to close modal
- ✅ **Dark mode glassmorphism UI**

---

## 🔧 Algorithms

| # | Algorithm | Full Name | Description | Complexity |
|---|-----------|-----------|-------------|------------|
| 1 | **FCFS** | First-Come First-Served | Serves requests in exact arrival order | O(n) |
| 2 | **SSTF** | Shortest Seek Time First | Greedy — always moves to the nearest pending request | O(n²) |
| 3 | **SCAN** | Elevator Algorithm | Sweeps in one direction to the disk boundary, then reverses | O(n log n) |
| 4 | **C-SCAN** | Circular SCAN | Sweeps in one direction to the boundary, jumps to cylinder 0, repeats | O(n log n) |
| 5 | **LOOK** | LOOK | Like SCAN but only goes as far as the last request — no boundary travel | O(n log n) |
| 6 | **C-LOOK** | Circular LOOK | Like C-SCAN but jumps back to the lowest pending request instead of 0 | O(n log n) |
| 7 | **N-Step SCAN** | N-Step SCAN | Splits queue into sub-queues of size N; services one batch at a time to prevent starvation | O(n log n) |
| 8 | **F-SCAN** | Freeze SCAN | Freezes the queue at sweep start (active queue), defers new arrivals to next sweep — eliminates arm stickiness | O(n log n) |

### Algorithm Selection Guide

```
Minimize total seek time?        → SSTF or LOOK
Fair for all requests?           → SCAN or C-SCAN
Avoid arm stickiness?            → F-SCAN
Prevent starvation (heavy load)? → N-Step SCAN
Simple & predictable?            → FCFS
```

---

## 📁 Project Structure

```
disk-scheduling-simulator/
│
├── index.html                      # Main entry point
├── README.md                       # Project documentation
│
├── css/
│   └── style.css                   # Dark-mode glassmorphism stylesheet
│
├── js/
│   ├── app.js                      # Main app — wires all modules together
│   │
│   ├── algorithms/                 # Module 1: Algorithm Implementations
│   │   ├── index.js                # Barrel export for all algorithms
│   │   ├── fcfs.js                 # First-Come First-Served
│   │   ├── sstf.js                 # Shortest Seek Time First
│   │   ├── scan.js                 # SCAN (Elevator)
│   │   ├── cscan.js                # C-SCAN (Circular SCAN)
│   │   ├── look.js                 # LOOK
│   │   ├── clook.js                # C-LOOK (Circular LOOK)
│   │   ├── nstepscan.js            # N-Step SCAN
│   │   └── fscan.js                # F-SCAN (Freeze SCAN)
│   │
│   ├── gui/                        # Module 2: Visualization
│   │   ├── animation.js            # Canvas-based disk head animation
│   │   ├── charts.js               # Chart.js seek & comparison charts
│   │   └── ui.js                   # Validation, toasts, UI helpers
│   │
│   └── analysis/                   # Module 3: Performance Analysis
│       ├── metrics.js              # Seek time, avg seek, throughput
│       └── export.js               # CSV export functionality
│
├── tests/
│   └── test_algorithms.html        # Browser-based unit tests (30+ tests)
│
└── docs/
    └── project_report.md           # Detailed project report
```

---

## 🚀 Getting Started

### Prerequisites

- Any modern web browser (Chrome, Firefox, Edge, Safari)
- Python 3.x for running a local server (recommended)

### Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/your-username/disk-scheduling-simulator.git
cd disk-scheduling-simulator

# 2. Start a local HTTP server
python -m http.server 8080

# 3. Open in your browser
# http://localhost:8080
```

> **Note:** You can open `index.html` directly in some browsers, but a local server is recommended for correct font and module loading.

---

## 📖 Usage

| Step | Action |
|------|--------|
| 1 | **Enter Disk Requests** — Comma-separated cylinder numbers (e.g. `98, 183, 37, 122, 14, 124, 65, 67`) |
| 2 | **Set Head Position** — Initial disk head position (e.g. `53`) |
| 3 | **Set Disk Size** — Total number of cylinders (e.g. `200`) |
| 4 | **Select Algorithm** — Pick from all 8 algorithms in the dropdown |
| 5 | **Set Direction** — Choose Right or Left (for SCAN, C-SCAN, LOOK, C-LOOK, N-Step SCAN, F-SCAN) |
| 6 | **Set N (for N-Step SCAN)** — Choose the sub-queue batch size (default: 4) |
| 7 | **Click Simulate** — Watch the animation and see seek chart + metrics |
| 8 | **Click Compare All** — View all 8 algorithms ranked side-by-side |
| 9 | **Export CSV** — Download step-by-step results as a spreadsheet |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Run simulation |
| `Escape` | Close modal |

---

## 📊 Sample Input & Output

**Input:**
- Requests: `98, 183, 37, 122, 14, 124, 65, 67`
- Head Position: `53`
- Disk Size: `200`
- Direction: `Right`
- N (for N-Step SCAN): `4`

**Output:**

| Algorithm | Total Seek | Avg Seek | Throughput | Winner? |
|-----------|-----------|----------|------------|---------|
| FCFS      | 640       | 80.00    | 0.0125     |         |
| SSTF      | **236**   | **29.50**| **0.0339** | ★ Best  |
| SCAN      | 331       | 36.78    | 0.0272     |         |
| C-SCAN    | 389       | 38.90    | 0.0257     |         |
| LOOK      | 299       | 33.22    | 0.0300     |         |
| C-LOOK    | 322       | 35.78    | 0.0279     |         |
| N-Step SCAN | 341     | 37.89    | 0.0264     |         |
| F-SCAN    | 315       | 35.00    | 0.0286     |         |

---

## 🧩 Module Breakdown

### Module 1 — Algorithm Implementation (`js/algorithms/`)
Pure functions with no GUI dependency — fully unit-testable in isolation. Each function accepts `(requests, head, diskSize, direction)` and returns `{ sequence, totalSeek }`.

### Module 2 — Visualization GUI (`js/gui/`)
- **`animation.js`** — Real-time Canvas animation with smooth head movement and glow effects
- **`charts.js`** — Chart.js integration for seek sequence (line) and algorithm comparison (bar) charts
- **`ui.js`** — Input validation, toast notifications, random generation, show/hide logic for conditional controls

### Module 3 — Performance Analysis (`js/analysis/`)
- **`metrics.js`** — Computes total seek distance, average seek time, and throughput
- **`export.js`** — Generates and triggers download of a CSV file with step-by-step results

---

## 🧪 Running Tests

The test suite uses a browser-based test runner — no build tools needed.

```bash
# If server is running at http://localhost:8080
# Navigate to:
http://localhost:8080/tests/test_algorithms.html
```

**Coverage includes 30+ automated tests:**
- All 8 algorithms with standard and edge-case inputs
- Performance metrics calculations
- Algorithm comparison and ranking validation
- Boundary conditions — single request, same-position head, empty input, disk edge positions

---

## 🛠 Technologies Used

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic page structure |
| **CSS3** | Dark-mode glassmorphism design, animations, responsive layout |
| **JavaScript (ES6+)** | Algorithm logic, DOM manipulation, Canvas animation, event handling |
| **Chart.js 4.4** | Interactive seek sequence and comparison charts |
| **Canvas API** | Real-time animated disk head movement |
| **Google Fonts** | Inter (UI text) + JetBrains Mono (data/numbers) |

---



---

<div align="center">



</div>
