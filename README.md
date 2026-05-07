# sUAS Edge AI & Autonomous Systems — Engineering Masterclass

An interactive, self-paced study guide for engineers building AI-powered small Unmanned Aircraft Systems (sUAS). The curriculum covers the full stack: from the physics of flight and embedded silicon, through perception and sensor fusion, to swarm coordination and counter-UAS security.

**Live site:** https://romankalinchuk.github.io/sUAS-AI-StudyGuide

---

## What's inside

17 modules, roughly 40 hours of material:

| # | Module | Topics |
|---|--------|--------|
| 1 | Fundamentals & Autonomy | Autonomy levels, OODA loop, edge vs. cloud AI |
| 2 | SWaP-C Physics & Math | Weight penalties, power modeling, hover math |
| 3 | Power Electronics & Circuits | ESCs, LiPo cells, BECs, power distribution |
| 4 | Compute Silicon Matrix | GPUs, NPUs, FPGAs, SoCs (Jetson, Hailo, RK3588) |
| 5 | Flight Controller Architecture | PID loops, MAVLink, ArduPilot/PX4 |
| 6 | RF Communications & Link Mgmt | FHSS, OFDM, link budgets, spectrum hopping |
| 7 | Edge Software Toolchains | ROS 2, Docker, CUDA, model deployment |
| 8 | Data Links & Topology | Mesh networks, ATAK, mesh-radio architectures |
| 9 | Sensor Fusion & EKF | Extended Kalman Filter derivation, IMU/GPS fusion |
| 10 | AI Training & Dataset Pipeline | Dataset curation, transfer learning, quantization |
| 11 | Perception & VSLAM | Visual odometry, ORB-SLAM3, stereo depth |
| 12 | Depth Sensing & 3D Mapping | LiDAR, structured light, point cloud processing |
| 13 | Path Planning & Navigation | A*, RRT*, potential fields, GPS-denied nav |
| 14 | AI Targeting & Kinematics | Object tracking, pursuit kinematics, gimbal control |
| 15 | Swarm Intelligence | Boids algorithm, consensus protocols, mesh coordination |
| 16 | Security & Counter-UAS | MAVLink signing, RF fingerprinting, jamming detection |
| 17 | Implementation Workflow | End-to-end build checklist, integration steps |

### Interactive elements

- **Thermal calculator** — sliders for compute thermal modeling (Module 2)
- **Hardware comparison chart** — bubble chart of SoC performance vs. power draw (Module 4)
- **Live Boids swarm simulation** — tune separation, alignment, and cohesion in real time (Module 15)
- **Implementation workflow stepper** — guided build process with expandable steps (Module 17)

---

## Running locally

The site uses ES modules, so it requires an HTTP server (browsers block `file://` imports). Any static server pointed at the `public/` directory works:

```bash
# Python (no install needed)
cd public && python3 -m http.server 8080

# Node.js npx
npx serve public

# VS Code
# Install the "Live Server" extension, right-click index.html → Open with Live Server
```

Then open `http://localhost:8080` in your browser.

---

## Deployment

Pushing to `main` automatically deploys the `public/` directory to GitHub Pages via `.github/workflows/deploy.yml`.

To enable Pages on a fresh fork:
1. Go to **Settings → Pages**
2. Set Source to **GitHub Actions**
