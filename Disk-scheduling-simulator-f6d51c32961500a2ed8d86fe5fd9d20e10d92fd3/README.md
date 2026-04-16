# Advanced Disk Scheduling Simulator

A web-based simulator that visualizes classic disk scheduling algorithms — **FCFS**, **SSTF**, **SCAN**, and **C-SCAN** — with real-time animation, interactive charts, performance metrics, and algorithm comparison.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chart.js&logoColor=white)

---

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Algorithms](#algorithms)
- [Sample Input & Output](#sample-input--output)
- [Module Breakdown](#module-breakdown)
- [Running Tests](#running-tests)
- [Technologies Used](#technologies-used)
- [Screenshots](#screenshots)

---

## ✨ Features

### Core
- ✅ Four disk scheduling algorithms: FCFS, SSTF, SCAN, C-SCAN
- ✅ Custom disk request input (comma-separated)
- ✅ Configurable head position, disk size, and direction
- ✅ Interactive seek sequence line chart
- ✅ Performance metrics: Total Seek Time, Average Seek Time, Throughput

### Advanced
- ✅ **Real-time disk head animation** with Canvas API
- ✅ **Pause/Resume** animation control
- ✅ **Adjustable animation speed** (slow → fast slider)
- ✅ **Compare All Algorithms** side-by-side with bar chart
- ✅ **Comparison table** with "★ Best" badge
- ✅ **Random request generator** (1–50 requests)
- ✅ **CSV export** with step-by-step breakdown
- ✅ **Input validation** with toast error messages
- ✅ **Responsive design** (desktop, tablet, mobile)
- ✅ **Keyboard shortcuts** (Enter = simulate, Escape = close modal)
- ✅ **Dark mode glassmorphism UI**

---

## 📁 Project Structure

```
disk-scheduling-simulator/
│
├── index.html                    # Main entry point (GUI)
├── README.md                     # Project documentation
│
├── css/
│   └── style.css                 # Complete stylesheet (dark theme)
│
├── js/
│   ├── app.js                    # Main application (wires all modules)
│   │
│   ├── algorithms/               # Module 1: Algorithm Implementation
│   │   ├── index.js              # Barrel export for all algorithms
│   │   ├── fcfs.js               # First-Come First-Served
│   │   ├── sstf.js               # Shortest Seek Time First
│   │   ├── scan.js               # SCAN (Elevator)
│   │   └── cscan.js              # C-SCAN (Circular SCAN)
│   │
│   ├── gui/                      # Module 2: Visualization (GUI)
│   │   ├── animation.js          # Canvas-based disk head animation
│   │   ├── charts.js             # Chart.js seek & comparison charts
│   │   └── ui.js                 # Input validation, toasts, helpers
│   │
│   └── analysis/                 # Module 3: Performance Analysis
│       ├── metrics.js            # Seek time, avg seek, throughput
│       └── export.js             # CSV export functionality
│
├── tests/
│   └── test_algorithms.html      # Browser-based unit tests (30+ tests)
│
└── docs/
    └── project_report.md         # Detailed project report
```

---

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- Python 3.x (for local server) — OR any other HTTP server

### Installation & Run

```bash
# 1. Clone or download the project
cd disk-scheduling-simulator

# 2. Start a local HTTP server
python -m http.server 8080

# 3. Open in browser
# Navigate to: http://localhost:8080
```

> **Note:** You can also open `index.html` directly in some browsers, but using a local server is recommended for correct font and script loading.

---

## 📖 Usage

1. **Enter Disk Requests** — Type comma-separated cylinder numbers (e.g., `98, 183, 37, 122, 14, 124, 65, 67`)
2. **Set Head Position** — Initial position of the disk head (e.g., `53`)
3. **Set Disk Size** — Total number of cylinders (e.g., `200`)
4. **Select Algorithm** — Choose from FCFS, SSTF, SCAN, or C-SCAN
5. **Click Simulate** — Watch the real-time animation and view the seek chart
6. **Click Compare All** — See all four algorithms compared side-by-side
7. **Generate Random** — Auto-generate random disk requests
8. **Export CSV** — Save results with step-by-step breakdown

---

## 🔧 Algorithms

| Algorithm | Description | Time Complexity |
|-----------|-------------|----------------|
| **FCFS** | Serves requests in arrival order | O(n) |
| **SSTF** | Always moves to the nearest pending request (greedy) | O(n²) |
| **SCAN** | Moves in one direction, reverses at boundary (elevator) | O(n log n) |
| **C-SCAN** | Moves in one direction, jumps back to start (circular) | O(n log n) |

---

## 📊 Sample Input & Output

**Input:**
- Requests: `98, 183, 37, 122, 14, 124, 65, 67`
- Head Position: `53`
- Disk Size: `200`
- Direction: `Right`

**Output:**

| Algorithm | Total Seek | Avg Seek | Throughput | Sequence |
|-----------|-----------|----------|------------|----------|
| FCFS      | 640       | 80.00    | 0.0125     | 53→98→183→37→122→14→124→65→67 |
| SSTF      | **236**   | **29.50**| **0.0339** | 53→65→67→37→14→98→122→124→183 |
| SCAN      | 331       | 36.78    | 0.0272     | 53→65→67→98→122→124→183→199→37→14 |
| C-SCAN    | 389       | 38.90    | 0.0257     | 53→65→67→98→122→124→183→199→0→14→37 |

**Best Algorithm:** SSTF (lowest total seek time)

---

## 🧩 Module Breakdown

### Module 1: Algorithm Implementation (`js/algorithms/`)
Contains pure functions for each scheduling algorithm. No GUI code — fully testable independently.

### Module 2: Visualization GUI (`js/gui/`)
- **animation.js** — Canvas-based real-time disk head animation with glow effects
- **charts.js** — Chart.js integration for seek sequence and comparison charts
- **ui.js** — Input validation, toast notifications, random generation

### Module 3: Performance Analysis (`js/analysis/`)
- **metrics.js** — Computes total seek, average seek, and throughput
- **export.js** — CSV file generation and download

---

## 🧪 Running Tests

Open the test file in your browser:

```bash
# If server is running at http://localhost:8080
# Navigate to: http://localhost:8080/tests/test_algorithms.html
```

The test suite includes **30+ automated tests** covering:
- All 4 algorithms with standard and edge-case inputs
- Performance metrics calculations
- Algorithm comparison validation
- Boundary conditions (single request, same position, empty input)

---

## 🛠 Technologies Used

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Page structure and semantic markup |
| **CSS3** | Dark-mode glassmorphism design, animations, responsive layout |
| **JavaScript (ES6+)** | Algorithm logic, DOM manipulation, event handling |
| **Chart.js 4.4** | Interactive seek sequence and comparison charts |
| **Canvas API** | Real-time disk head animation |
| **Google Fonts** | Inter (UI) + JetBrains Mono (data) typography |

---

## 📸 Screenshots

> Run the application and see the UI in action! Key views include:
> - Configuration panel with algorithm selection
> - Real-time disk head animation canvas
> - Seek sequence interactive line chart
> - Algorithm comparison bar chart with ranked table

---

## 📄 License

This project is built for educational purposes. Feel free to use and modify.
