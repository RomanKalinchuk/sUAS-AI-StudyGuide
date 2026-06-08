export const workflowContent = {
    1: `
        <h3 class="mt-0 text-sky-400 border-none mb-2">Phase 1: Requirements &amp; Architecture</h3>
        <p class="text-slate-300 text-sm mb-4">Before writing a single line of code or ordering hardware, define exactly what the drone is supposed to do. Every downstream decision — airframe, compute, sensors, communications — flows from these initial requirements. A decision made badly here costs weeks to undo in Phase 5. For DoD programs, this phase must also produce a Concept of Operations (ConOps) document and initiate the System Safety Management Plan (SSMP) required by MIL-STD-882E.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">1.1 Mission Definition &amp; ConOps</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
            <div class="bg-slate-800 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Mission Envelope</strong>
                <p class="text-slate-400">Define range (km), endurance (min), max altitude (m AGL), and payload mass (kg). Write minimum acceptable values and target values separately — the gap between them drives your hardware selection. Include environmental extremes: temperature range, wind, humidity, precipitation.</p>
            </div>
            <div class="bg-slate-800 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Autonomy Level (DoD ALFUS)</strong>
                <p class="text-slate-400">Level 1 (supervised): human approves every action. Level 3 (conditional): AI acts within pre-approved bounds, human can override. Level 5 (full): no human-in-the-loop. FAA waivers and DoD ATO requirements differ substantially by level. Most current DoD sUAS programs operate at Level 2–3.</p>
            </div>
            <div class="bg-slate-800 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Operating Environment</strong>
                <p class="text-slate-400">Urban (GPS multipath, dense RF, building proximity), rural (open sky, long range), maritime (salt spray, humidity, wind), indoor (no GPS, wall proximity). Each changes sensor and navigation design significantly. DoD programs must also address EW-denied and GPS-denied environments.</p>
            </div>
            <div class="bg-slate-800 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Regulatory Class &amp; Authority</strong>
                <p class="text-slate-400">Civil: Sub-250 g minimal, 250 g–25 kg Part 107, over 25 kg full airworthiness cert. Military: any DoD-operated UAS requires an Authority to Operate (ATO) from the TAA under DoDI 5030.61. Blue UAS Framework (DCMA) clearance required for DoD purchases.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">1.2 System Safety Management Plan (SSMP) — MIL-STD-882E</h4>
        <div class="insight-box mb-4">
            <div class="insight-label">DoD Requirement: SSMP must be initiated in Phase 1</div>
            <p class="text-slate-200 text-sm mt-1">MIL-STD-882E Change 1 (2023) requires a System Safety Management Plan to be established before design begins. The SSMP documents: (1) safety objectives and acceptable risk levels, (2) the Mishap Risk Assessment Matrix (probability × severity), (3) roles of the System Safety Working Group (SSWG), and (4) the schedule for Preliminary Hazard List (PHL), Subsystem Hazard Analysis (SSHA), and System Hazard Analysis (SHA). Mishap Risk Category I (Catastrophic/Frequent) requires formal risk acceptance by the Program Executive Officer. Category II (Critical) requires PM-level acceptance with documented mitigation.</p>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">1.3 Airframe Selection</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase block mb-1">Multirotor</strong>
                <p class="text-slate-400 mb-1">Best for hover, precision positioning, confined environments, and payload drop. Typical endurance: 15–30 min on 4S–6S LiPo. Hover consumes 100–200 W/kg AUW. Blue UAS cleared examples: Skydio X10D, Teal 2, BRINC Lemur 2.</p>
                <p class="text-slate-500 italic">Select if the task requires stationary observation or confined-space navigation.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase block mb-1">Fixed-Wing</strong>
                <p class="text-slate-400 mb-1">Best for range and endurance (60–120 min). Covers ground efficiently, but requires a runway or hand-launch and cannot hover. Blue UAS cleared: Zone 5 Paladin, Autel Dragonfish.</p>
                <p class="text-slate-500 italic">Select if the mission is area coverage at range and stationary observation is not needed.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase block mb-1">VTOL Hybrid</strong>
                <p class="text-slate-400 mb-1">Vertical takeoff, then transitions to efficient forward flight. Best of both. More mechanical complexity; more failure points. Typical endurance 45–90 min. Requires transition testing in Phases 6–7.</p>
                <p class="text-slate-500 italic">Select if the mission needs both hover precision at endpoints and efficient range coverage.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">1.4 Compute Stack Selection</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Jetson Orin Nano 8GB</strong>
                <p class="text-slate-400">40 TOPS, 5–15 W, ~$500. The right choice for most AI drone builds. YOLOv8/v11 runs at 30–60 Hz INT8. Runs ROS 2 and TensorRT natively with JetPack 6.x.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Jetson AGX Orin 32GB</strong>
                <p class="text-slate-400">200 TOPS, 15–40 W, ~$1,000. For workloads running depth mapping, detection, and navigation simultaneously. Too power-hungry for light builds under 2 kg AUW.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Raspberry Pi 5 + Coral USB TPU</strong>
                <p class="text-slate-400">Pi 5: no GPU, 5 W. Google Coral M.2 Accelerator: 4 TOPS, 2 W. Best for lightweight non-GPU inference. Pair with a dedicated co-processor for camera pipelines.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">1.5 Rough Power Budget</h4>
        <p class="text-slate-400 text-sm mb-2">Sum all consumers to determine battery capacity. Wh = Total Power (W) × Endurance (h). Always add a 25% margin. Note: battery capacity drops ~30% at 0°C — account for this in cold-weather operations.</p>
        <div class="math-block text-xs mb-4">
Motors + ESCs (hover):     4 × 200 W = 800 W  (dominant consumer)
Flight Controller:         2–5 W
Companion (Jetson Orin):   10–25 W (peak GPU load — use peak, not idle)
Payload (camera, gimbal):  5–30 W
RF / telemetry:            1–3 W
─────────────────────────────────────────
Total hover draw:          ~840 W typical
For 20 min endurance:      840 W × 0.33 h = 278 Wh
At 80% DoD, 22.2 V (6S):  12.5 Ah → select 14 Ah pack (common size)
Cold-weather margin (+30%): 14 Ah × 1.3 = ~18 Ah for sub-10°C operations</div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">Phase 1 Exit Checklist</h4>
        <div class="bg-slate-800 p-3 rounded border border-slate-700 text-xs mb-4">
            <p class="text-slate-400 mb-2">All items must be complete before entering Phase 2:</p>
            <ul class="space-y-1 text-slate-400">
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Mission envelope documented (range, endurance, altitude, payload, environment)</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Airframe type selected with tradeoff analysis documented</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Compute stack selected: SWaP budget closes with 25% margin</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Power budget documented; battery capacity and cell count confirmed</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> SSMP initiated (DoD programs) or FAA compliance path documented (civil)</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> BVLOS waiver application filed if mission requires it (90–180 day lead time)</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> ICD (Interface Control Document) drafted: FC ↔ companion, sensor interfaces</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Risk register initialized; Mishap Risk Category assessed for top 5 hazards</li>
            </ul>
        </div>

        <details class="code-expand">
            <summary>&#9888; Common Failure Modes — Requirements Phase</summary>
            <div class="p-4 space-y-3 text-xs">
                <div class="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block">Underestimating companion power draw</strong>
                    <p class="text-slate-400">A Jetson Orin at full GPU load draws 25 W, not the 10 W shown in idle specs. Plan for peak draw. Result of not doing this: battery depleted 30% faster than expected, RTL triggers mid-mission.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                    <strong class="text-orange-400 block">Wrong battery cell count for motor selection</strong>
                    <p class="text-slate-400">Selecting a 4S (16.8 V) pack for motors rated 6S (25.2 V) causes thermal damage and severe under-performance. Match cell count to ESC maximum voltage rating, not just nominal.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                    <strong class="text-yellow-400 block">Starting a BVLOS program without filing for a waiver</strong>
                    <p class="text-slate-400">FAA Part 107.31 waivers for BVLOS take 90–180 days to process. If you need BVLOS for the mission profile, file during Phase 1 — not after the hardware is ready. Operating BVLOS without a waiver carries fines starting at $1,377 per violation per day.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-rose-500">
                    <strong class="text-rose-400 block">Skipping ConOps and SSMP for DoD programs</strong>
                    <p class="text-slate-400">Programs that skip the SSMP initiation in Phase 1 typically face a stop-work order from the TAA when the ATO is applied for in Phase 8 — because the hazard analysis cannot be retroactively reconstructed from a completed design. The SSMP must exist before design decisions are made so hazards are considered before they are locked in.</p>
                </div>
            </div>
        </details>
    `,

    2: `
        <h3 class="mt-0 text-amber-400 border-none mb-2">Phase 2: SITL Simulation</h3>
        <p class="text-slate-300 text-sm mb-4">Never fly untested AI code on physical hardware. Software-In-The-Loop (SITL) testing runs your exact production code against a physics simulator, catching control loop bugs and AI model failures at zero cost. A bug found in SITL takes an hour to fix. The same bug found mid-flight can total the aircraft. SITL also integrates into your CI/CD pipeline to automatically reject regressions before they reach hardware.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">2.1 Simulator Selection</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 block mb-1">Gazebo Harmonic (Recommended for CI)</strong>
                <p class="text-slate-400 mb-2">Open-source, lightweight, CPU-only capable. Current LTS release. ArduPilot integration via the <a href="https://github.com/ArduPilot/ardupilot_gazebo" target="_blank" rel="noopener noreferrer" class="text-sky-400">ardupilot_gazebo</a> plugin. PX4 native support via <code>make px4_sitl gz_x500</code>. Best for automated CI regression — runs headless on a cloud VM with no GPU required. Less photorealistic but fully functional for control and navigation logic validation.</p>
                <p class="text-slate-500 italic">Primary choice for automated CI pipelines.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-1">NVIDIA Isaac Sim 4.x</strong>
                <p class="text-slate-400 mb-2">Photorealistic RTX ray tracing via Omniverse. Physics-accurate aerodynamics. Native ROS 2 bridge. Sensor models for lidar, stereo camera, and IMU with Gaussian noise. Requires RTX 4080+ GPU. Best for visual AI training synthetic data and zero-shot sim-to-real transfer. Note: Microsoft AirSim deprecated 2023 — use Isaac Sim or community fork Colosseum.</p>
                <p class="text-slate-500 italic">Primary choice for AI model training and visual validation.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">2.2 ArduPilot SITL Quick Start</h4>
        <div class="math-block text-xs mb-4">
# Install ArduPilot dev environment (Ubuntu 22.04)
git clone https://github.com/ArduPilot/ardupilot.git
cd ardupilot &amp;&amp; git submodule update --init --recursive
Tools/environment_install/install-prereqs-ubuntu.sh -y
. ~/.profile

# Launch SITL with Gazebo Harmonic
sim_vehicle.py -v ArduCopter -f gazebo-iris --console --map

# Key SITL parameters
param set SIM_SPEEDUP 4          # 4x faster than real time for rapid testing
param set SIM_WIND_SPD 5         # 5 m/s wind disturbance
param set LOG_DISARMED 1         # Log pre-arm — captures full pre-flight sequence
param set ARMING_CHECK 0         # SITL only — skip hardware checks

# Connect your ROS 2 MAVLink bridge
ros2 launch mavros mavros_launch.py fcu_url:=udp://127.0.0.1:14550@</div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">2.3 System Connection Architecture</h4>
        <div class="math-block text-xs mb-4">
ROS 2 AI Node
  subscribes:  /camera/image_raw (sensor_msgs/Image, 30 Hz)
  publishes:   /ai/detections (vision_msgs/Detection2DArray)
        |
        v
MAVLink Bridge (MAVROS or uXRCE-DDS agent for PX4)
  sends: SET_POSITION_TARGET_LOCAL_NED (velocity commands, not waypoints)
         COMMAND_LONG (mode changes, arm/disarm)
        |
        v
ArduPilot SITL  &lt;-- TCP port 5760 / UDP 14550 --&gt;  Gazebo Harmonic
        |
        v
Ground Control Station (QGroundControl / Mission Planner / MAVProxy)
        |
        v
Automated Test Harness (Python + pymavlink, asserts on telemetry stream)</div>

        <p class="text-slate-400 text-sm mb-3">For PX4 with the uXRCE-DDS bridge (PX4 v1.14+), the companion computer runs a micro XRCE-DDS agent that exposes PX4 uORB topics directly as ROS 2 topics — eliminating the MAVROS layer and reducing round-trip latency from ~10 ms to ~1 ms.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">2.4 CI/CD Integration — Automated SITL Regression</h4>
        <div class="bg-slate-800 p-3 rounded border border-slate-700 text-xs mb-4">
            <strong class="text-amber-400 block mb-2">GitHub Actions workflow (simplified):</strong>
            <pre class="text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
name: SITL Regression
on: [push, pull_request]
jobs:
  sitl-test:
    runs-on: ubuntu-22.04
    container: ardupilot/ardupilot-dev-ros2:humble
    steps:
      - uses: actions/checkout@v4
      - name: Build ROS 2 workspace
        run: colcon build --symlink-install
      - name: Launch SITL + run 50 episodes
        run: |
          sim_vehicle.py -v ArduCopter --no-rebuild &amp;
          sleep 5  # wait for SITL to initialize
          python3 tests/run_sitl_suite.py \
            --episodes 50 --assert-no-flyaways \
            --assert-latency-ms 100 --assert-track-px 50
      - name: Upload test report
        uses: actions/upload-artifact@v4
        with:
          name: sitl-report
          path: tests/results/</pre>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">2.5 Domain Randomization Requirements</h4>
        <p class="text-slate-400 text-sm mb-3">A model trained on one visual condition fails on another. Domain randomization forces generalization. Minimum requirements before declaring SITL complete:</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-amber-400 font-bold text-xl">50+</div>
                <div class="text-slate-400 mt-1">Unique episodes</div>
            </div>
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-amber-400 font-bold text-xl">4+</div>
                <div class="text-slate-400 mt-1">Lighting conditions</div>
            </div>
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-amber-400 font-bold text-xl">±15%</div>
                <div class="text-slate-400 mt-1">Wind disturbance</div>
            </div>
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-amber-400 font-bold text-xl">50+</div>
                <div class="text-slate-400 mt-1">Target texture variants</div>
            </div>
        </div>
        <p class="text-slate-400 text-sm mb-3">Lighting conditions to cover: dawn (orange, low-angle, long shadows), noon (harsh overhead, deep shadows), overcast (flat, diffuse), dusk. Night/IR is a separate training category if the mission profile requires it. For Isaac Sim, use the <code>OmniSensorBridge</code> to inject Gaussian noise, motion blur, and chromatic aberration into the simulated camera output.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">2.6 AI Inference Validation Checklist</h4>
        <div class="bg-slate-800 p-3 rounded border border-slate-700 text-xs mb-4">
            <p class="text-slate-400 mb-2">Run the actual TensorRT-compiled model — do not mock it. Before declaring SITL complete:</p>
            <ul class="space-y-1 text-slate-400">
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> End-to-end latency (camera frame to MAVLink command): measured &lt;100 ms across all 50 episodes</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Inference frequency matches camera FPS (30 Hz). Verified with <code>ros2 topic hz /ai/detections</code></li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Detection mAP50 &gt;90% averaged across all domain randomization scenarios</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Zero fly-away events (GUIDED mode exits with RTL) across all 50+ episodes</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> CPU/GPU utilization profiled with <code>tegrastats</code> during full-load simulation</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Target occlusion recovery tested: AI holds last-known position for 2–5 s then re-acquires</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> All episode logs archived — form the baseline regression suite for Phase 8 CI/CD</li>
            </ul>
        </div>

        <details class="code-expand">
            <summary>&#9888; Common Failure Modes — SITL Phase</summary>
            <div class="p-4 space-y-3 text-xs">
                <div class="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block">Sim-to-real visual gap</strong>
                    <p class="text-slate-400">Isaac Sim textures are too perfect. Real cameras have sensor noise, lens distortion, bloom, and motion blur. Add Gaussian and salt-and-pepper noise models to the simulated camera output. Without this, models that hit 95% recall in sim may drop to 60% on first real-world flight.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                    <strong class="text-orange-400 block">ROS 2 DDS discovery failure on localhost</strong>
                    <p class="text-slate-400">ROS 2 Jazzy/Humble defaults to multicast UDP for node discovery. On some systems, the loopback interface blocks multicast. Fix: set <code>RMW_IMPLEMENTATION=rmw_cyclonedds_cpp</code> and configure Cyclone DDS to explicitly allow the loopback interface. Also ensure <code>ROS_DOMAIN_ID</code> is consistent across all terminals.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                    <strong class="text-yellow-400 block">PID gains from SITL don't transfer to hardware</strong>
                    <p class="text-slate-400">Simulated aerodynamics are idealized. Real airframes have vibration, motor asymmetry, and prop wash effects. Treat SITL PID gains as initial starting points. Expect 20–40% retuning during Phases 6 and 7 after observing actual flight behavior.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-rose-500">
                    <strong class="text-rose-400 block">Testing with mocked AI inference instead of real TensorRT model</strong>
                    <p class="text-slate-400">Substituting a fake detection publisher for the real inference node hides latency spikes that occur under real load. The TensorRT model must run on the actual companion computer hardware during SITL — not on the development workstation where it runs 10× faster.</p>
                </div>
            </div>
        </details>
    `,

    3: `
        <h3 class="mt-0 text-orange-400 border-none mb-2">Phase 3: Hardware Bench Build</h3>
        <p class="text-slate-300 text-sm mb-4">Moving from simulation to silicon. Build and verify the complete hardware stack on an anti-static workbench before any airframe involvement. A wiring error found at this stage takes an hour to fix. Found mid-flight, it costs the drone. This phase concludes with Hardware-in-the-Loop (HITL) validation — the production firmware running on the real FC, receiving simulated sensor data, providing the final gate before physical flight test.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">3.1 Companion Computer Setup</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Flash using NVIDIA SDK Manager on a host Ubuntu PC. Connect the Jetson via USB-C with the FORCE_RECOVERY button held during power-on to enter recovery mode.</li>
            <li>Select <strong>JetPack 6.x</strong> (Ubuntu 22.04 base, CUDA 12.x, TensorRT 10.x) for all new Jetson Orin builds. JetPack 5.x (Ubuntu 20.04) is legacy.</li>
            <li>Verify the stack after flash: <code>nvcc --version</code> (CUDA present), <code>dpkg -l | grep tensorrt</code> (TensorRT installed), then <code>python3 -c "import torch; print(torch.cuda.is_available())"</code> should return True.</li>
            <li>Set max-performance mode for bench testing: <code>sudo jetson_clocks</code> pins all clocks at maximum. <code>sudo nvpmodel -m 0</code> sets MAXN mode. Monitor with <code>tegrastats</code>.</li>
            <li>Install <strong>ROS 2 Humble Hawksbill</strong> from the NVIDIA-provided ROS packages (JetPack 6.x ships Ubuntu 22.04 — use Humble until JetPack ships Ubuntu 24.04 for Jazzy).</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">3.2 Flight Controller Setup</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Download ArduPilot firmware from <strong>firmware.ardupilot.org</strong>. Select your FC hardware variant (e.g., CubeOrange) and vehicle type (ArduCopter for multirotors).</li>
            <li>Flash via Mission Planner: connect FC via USB → Initial Setup → Install Firmware. For custom builds with specific features: use <code>./waf configure --board CubeOrange &amp;&amp; ./waf copter</code></li>
            <li>Critical initial parameters: <code>ARMING_CHECK=1</code> (enforce all preflight checks — never set to 0 in production), <code>LOG_BACKEND_TYPE=3</code> (log to both flash and SD), <code>FS_GCS_ENABLE=1</code> (GCS failsafe: enter RTL if telemetry lost &gt;5 s).</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">3.3 UART Wiring — FC to Companion Computer</h4>
        <div class="insight-box mb-4">
            <div class="insight-label">Critical Wiring Rule: Never Connect VCC Between Devices</div>
            <p class="text-slate-200 text-sm mt-1">Connect TX→RX, RX→TX, GND→GND. <strong>Do not connect the VCC (5 V) pins between Jetson and Pixhawk.</strong> Doing so creates ground loops and power spikes that cause random resets and data corruption. Each device draws power from its own dedicated supply — they share only the signal ground reference.</p>
        </div>
        <div class="math-block text-xs mb-4">
FC Serial Port Parameters (configure via Mission Planner):
  SERIAL2_BAUD     = 921     # 921,600 bps
  SERIAL2_PROTOCOL = 2       # MAVLink 2 (not MAVLink 1)
  SERIAL2_OPTIONS  = 0       # No hardware flow control
  SYSID_MYGCS      = 255     # Accept commands from system ID 255 (companion)

# Verify on companion:
ros2 launch mavros mavros_launch.py fcu_url:=/dev/ttyS0:921600
ros2 topic echo /mavros/state  # should show connected: true within 5 s</div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">3.4 HITL Validation</h4>
        <p class="text-slate-400 text-sm mb-3">After the bench build is wired and the software stack is verified, run HITL before any physical flight. HITL uses the production firmware on the real FC with simulated sensor data from Gazebo, exercising the actual RTOS timing, interrupt handlers, and EKF algorithms on silicon.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                <strong class="text-orange-400 block mb-1">ArduPilot HITL Setup</strong>
                <ol class="list-decimal pl-4 text-slate-400 space-y-1 mt-1">
                    <li>Set <code>SIM_PIN_MASK=0</code> to stop actual servo output</li>
                    <li>Connect FC via USB to SITL host PC</li>
                    <li>Launch <code>sim_vehicle.py --sitl-instance-args="-H 127.0.0.1:9999"</code></li>
                    <li>In Mission Planner: Config → SITL → tick "HITL" checkbox</li>
                    <li>Run same 50-episode regression suite from Phase 2</li>
                </ol>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-1">PX4 HITL Setup</strong>
                <ol class="list-decimal pl-4 text-slate-400 space-y-1 mt-1">
                    <li>In QGroundControl: Airframe → HITL Enabled → select quadcopter type</li>
                    <li>Uncheck all AutoConnect boxes except UDP</li>
                    <li>Connect FC via USB; launch <code>make px4_sitl gz_x500</code></li>
                    <li>PX4 on FC receives virtual sensor data from Gazebo over UDP</li>
                    <li>Verify <code>commander status</code> shows HITL mode active</li>
                </ol>
            </div>
        </div>
        <div class="bg-slate-800 p-3 rounded border border-slate-700 text-xs mb-4">
            <strong class="text-orange-400 block mb-2">HITL Exit Criteria:</strong>
            <ul class="space-y-1 text-slate-400">
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> All 50 SITL regression episodes pass with real FC in the loop</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> MAVLink heartbeat stable (no drops) over 30-minute continuous HITL run</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> FC EKF attitude/position estimates match simulator ground truth within 5%</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> All failsafes (GCS loss, battery, RC loss) trigger correctly</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> No companion computer random resets during HITL run</li>
            </ul>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">3.5 Power Architecture</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>The companion computer must have its own dedicated BEC providing stable 5 V at 5 A minimum for the Jetson Orin Nano. Do not power it from the FC's servo rail.</li>
            <li>The FC receives power via a dedicated Power Module on the main battery lead, providing voltage and current sensing (<code>BATT_MONITOR=4</code>).</li>
            <li>ESCs and motors draw power directly from the main battery bus. Keep motor power cables short and away from signal cables.</li>
        </ul>

        <details class="code-expand">
            <summary>&#9888; Common Failure Modes — Bench Build Phase</summary>
            <div class="p-4 space-y-3 text-xs">
                <div class="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block">No MAVLink heartbeat after wiring</strong>
                    <p class="text-slate-400">Most common causes: TX and RX swapped, baud rate mismatch, wrong serial device path, or GND not connected. Attach a USB-serial adapter to the UART line and use <code>mavproxy.py</code> to sniff packets directly.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                    <strong class="text-orange-400 block">Companion computer random resets during motor spin-up</strong>
                    <p class="text-slate-400">ESC switching noise couples into the 5 V rail and drops voltage below the Jetson's minimum. Add a 470 µF low-ESR electrolytic capacitor across the 5 V and GND rails at the Jetson input. Verify rail stability with a multimeter during motor spin-up on the bench (no props).</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                    <strong class="text-yellow-400 block">HITL episodes pass but real-time performance differs from SITL</strong>
                    <p class="text-slate-400">Real FC RTOS timing differs from the software model in SITL. If HITL shows higher EKF innovation variances or slower failsafe response than SITL predicted, the FC is experiencing interrupt latency — typically caused by USB bandwidth contention when both telemetry and HITL traffic share the same USB connection. Use a USB hub or dedicated USB interfaces for each function.</p>
                </div>
            </div>
        </details>
    `,

    4: `
        <h3 class="mt-0 text-emerald-400 border-none mb-2">Phase 4: Sensor Calibration</h3>
        <p class="text-slate-300 text-sm mb-4">Garbage data in, garbage AI out. Every sensor — camera, IMU, GPS — has systematic errors that must be mathematically characterized and corrected. Skipping or rushing calibration is the single most common cause of AI tracking performance degrading between bench testing and real flight. Calibration data must be stored in version control alongside the software and re-run any time hardware changes.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">4.1 Camera Intrinsic Calibration</h4>
        <p class="text-slate-400 text-sm mb-2">Intrinsics characterize the camera's internal geometry: focal length, optical center, and lens distortion. Required for accurate pixel-to-3D-ray projection used by the AI targeting system.</p>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li><strong>Calibration target:</strong> ChArUco board (preferred over plain checkerboard — works when partially occluded) printed on matte photo paper, laminated, mounted on rigid flat acrylic. A 6×8 board with 30 mm square size works for most drone cameras. A warped target gives poor calibration regardless of software quality.</li>
            <li><strong>Image collection:</strong> Capture 30–50 images with the target at varied positions — close, far, tilted ±30°, in all four corners of the frame, and centered.</li>
            <li><strong>Tool:</strong> <code>ros2 run camera_calibration cameracalibrator --size 6x8 --square 0.030 image:=/camera/image_raw</code></li>
            <li><strong>Output:</strong> Camera matrix K (3×3) with focal lengths fx, fy and principal point cx, cy. Distortion coefficients [k1, k2, p1, p2, k3]. Save as <code>camera_info.yaml</code>.</li>
            <li><strong>Quality threshold:</strong> Reprojection error &lt;0.5 px is excellent. 0.5–1.0 px is acceptable. Above 1.0 px means re-collect images with better geometric diversity.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">4.2 Camera Extrinsic Calibration (Body-Camera Transform)</h4>
        <p class="text-slate-400 text-sm mb-2">Extrinsics define where the camera is positioned relative to the drone's body frame Center of Mass (CoM). A 1 cm error here produces a 0.5 m navigation error at 50 m altitude.</p>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Measure physically from CoM to camera optical center using calipers. Record as [x_fwd, y_right, z_down] in meters.</li>
            <li>For higher accuracy, use the <strong>Kalibr toolbox</strong> (ETH Zürich): record a ROS bag with synchronized camera images and IMU data while moving through a known calibration target. Kalibr jointly estimates the camera-IMU transform with centimeter-level accuracy.</li>
            <li>Publish the transform via ROS 2's <code>robot_state_publisher</code> using a URDF defining <code>camera_optical_frame</code> relative to <code>base_link</code>, feeding the TF2 transform tree used by all navigation nodes.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">4.3 IMU Calibration</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li><strong>Accelerometer (6-position cal):</strong> Trigger via Mission Planner → Mandatory Hardware → Accel Calibration. Hold drone perfectly still on each of 6 faces for 5 seconds each. Calibrates gravity vector alignment and removes scale factor errors.</li>
            <li><strong>Gyroscope:</strong> Place on a perfectly level, vibration-free surface. Do not touch for 60 seconds. Removes constant angular rate biases.</li>
            <li><strong>Compass (magnetometer):</strong> The "compass dance" — rotate in a figure-8 pattern outdoors, covering all orientations and bank angles, away from ferrous metal. Indoor calibration is almost always invalid due to structural steel interference.</li>
            <li><strong>Thermal calibration (advanced):</strong> IMU biases shift with temperature. ArduPilot supports thermal calibration via <code>INS_TCAL_ENABLE=1</code> — power the FC from cold (~0°C) and let it warm to operating temperature while logging. The system solves a polynomial model for temperature-dependent bias correction, significantly improving cold-weather navigation accuracy (critical for DoD winter operations).</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">4.4 GPS Configuration and Time Synchronization</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Enable multi-constellation: <code>GPS_GNSS_MODE=0</code> enables all constellations (GPS, GLONASS, Galileo, BeiDou). Improves position accuracy and increases difficulty of GPS spoofing attacks — important for DoD operations.</li>
            <li>PPS time sync: connect GPS module's PPS output to a Jetson GPIO. Configure <code>chrony</code> with <code>refclock PPS /dev/pps0 lock GPS</code>. Verify: <code>chronyc tracking</code> — system time offset should be &lt;1 ms.</li>
            <li>For RTK GPS: add a u-blox F9P module connected to an NTRIP caster or local base station for RTCM correction data. Reduces position error from 2–3 m to 1–5 cm, enabling precision landing and tight tracking tasks.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">Phase 4 Calibration Version Control</h4>
        <div class="math-block text-xs mb-4">
# Calibration data must live in version control
git add config/camera_info.yaml        # camera intrinsics
git add config/extrinsics.yaml         # camera-IMU transform (Kalibr output)
git add config/thermal_cal_params.parm # ArduPilot INS_TCAL_* parameters
git add config/compass_offsets.parm    # COMPASS_OFS_X/Y/Z
git commit -m "calibration: post-integration sensor cal data $(date +%Y-%m-%d)"

# On every hardware change, re-run affected calibrations:
# - Camera mount change → re-run intrinsics + extrinsics
# - Motor/ESC change → re-run compass (changed magnetic environment)
# - Frame structural change → re-run accelerometer + compass
# - Temperature regime change → re-run thermal calibration</div>

        <details class="code-expand">
            <summary>&#9888; Common Failure Modes — Sensor Calibration Phase</summary>
            <div class="p-4 space-y-3 text-xs">
                <div class="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block">High reprojection error (&gt;1.5 px)</strong>
                    <p class="text-slate-400">Almost always caused by a non-flat calibration target (paper warped with humidity) or insufficient angular diversity in collected images. Mount the ChArUco board on rigid acrylic. Verify by re-running calibration with a new image set; if error drops, the images were the issue.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                    <strong class="text-orange-400 block">Extrinsic calibration drifting after vibration or impact</strong>
                    <p class="text-slate-400">If the camera mount is not rigid relative to the FC mount, any vibration or hard landing shifts the camera-IMU transform. The camera and FC must be hard-mounted to each other as a unified sub-assembly before being soft-mounted to the frame.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                    <strong class="text-yellow-400 block">Compass hard iron distortion from motor wiring</strong>
                    <p class="text-slate-400">High-current motor cables create strong magnetic fields that shift the compass calibration after assembly. Always perform the compass dance in its final physical location on the fully assembled airframe with all wiring in place. Recalibrate after any significant wiring change.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-rose-500">
                    <strong class="text-rose-400 block">Calibration data not version-controlled</strong>
                    <p class="text-slate-400">After a crash, component swap, or parameter reset, re-flashing the FC to defaults loses all calibration data. Calibration data stored only in the FC flash — not in a repository — forces complete recalibration from scratch and introduces a fleet configuration divergence risk where different aircraft carry different untracked calibration states.</p>
                </div>
            </div>
        </details>
    `,

    5: `
        <h3 class="mt-0 text-purple-400 border-none mb-2">Phase 5: Airframe Integration</h3>
        <p class="text-slate-300 text-sm mb-4">Mounting the calibrated electronic stack onto the carbon fiber frame. This phase is pure mechanical engineering — vibration isolation, EMI shielding, thermal management, and weight distribution. Poor mechanical integration defeats every software optimization from earlier phases. All integration decisions must be consistent with the System Safety Hazard Analysis (SHA) initiated in Phase 1.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">5.1 Structural Layout and Weight Distribution</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Place heaviest components (battery, companion computer) as low and central as possible. A lower Center of Mass (CoM) improves pitch and roll stability.</li>
            <li>Balance check after full assembly: rest on a pointed surface at the geometric center of the motor layout. Target: CoM within ±5 mm of geometric center in both X and Y.</li>
            <li>Top plate hosts the FC and GPS (high position, away from EMI sources). Bottom plate or belly hosts the companion computer and battery.</li>
            <li>Carbon fiber is electrically conductive — use nylon standoffs between all PCBs and carbon plate surfaces.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">5.2 Vibration Isolation Architecture</h4>
        <p class="text-slate-400 text-sm mb-2">Motor vibration frequencies range from 50–400 Hz at operating RPM, corrupting IMU data and causing motion blur in camera images. The correct architecture uses a two-level isolation hierarchy:</p>
        <div class="insight-box mb-4">
            <div class="insight-label">Two-Level Isolation Hierarchy</div>
            <p class="text-slate-200 text-sm mt-1"><strong>Level 1 — Rigid:</strong> Camera and FC must be hard-mounted to each other to preserve the extrinsic calibration relationship established in Phase 4. <strong>Level 2 — Soft:</strong> That entire camera+FC sub-assembly is then soft-mounted to the frame via silicone grommets (Shore 30–40A hardness) to attenuate motor vibrations. Violating this hierarchy forces you to choose between good calibration and IMU data quality.</p>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Validate with ArduPilot's onboard FFT: enable <code>INS_LOG_BAT_MASK=3</code>, hover at normal operating throttle for 30 seconds, download .bin log, review VIBE messages. Acceptable: VIBEXY and VIBEZ all &lt;15 m/s². Above 30 m/s² is a red flag.</li>
            <li>If vibration is high: check prop balance (use a dedicated prop balancer), motor bearing wear, loose frame screws, and frame resonance at hover RPM.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">5.3 EMI Shielding</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li><strong>MIPI CSI camera cables:</strong> Wrap the entire cable length in adhesive copper foil tape and ground the tape to the companion computer chassis at one point only (avoid grounding both ends — creates a ground loop).</li>
            <li><strong>Motor power cables:</strong> Route perpendicular to signal cables wherever they must cross. Twisted pairs on motor phase wires reduce radiated emissions.</li>
            <li><strong>GPS and compass antenna:</strong> Mount on a dedicated mast at least 10 cm above and 15 cm horizontally from all ESCs, motors, and camera cables. Add a ground plane under the GPS antenna.</li>
            <li><strong>Validation test:</strong> Power up all motors at 50% throttle on the bench with no props. Monitor the live video feed for artifacts and GPS satellite count stability.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">5.4 Thermal Management</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Mount the Jetson heatsink oriented to face into prop wash from the front rotors for natural active cooling in flight.</li>
            <li>Apply a thin, uniform layer (0.3–0.5 mm) of quality thermal compound (Arctic MX-4 or equivalent) between the Jetson module and heatsink.</li>
            <li>Monitor during ground runs: <code>tegrastats</code> shows temperature per component in real time. GPU junction &gt;80°C triggers automatic thermal throttling. &gt;95°C triggers automatic shutdown — both cause visible AI latency spikes mid-flight.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">5.5 Integration Completion Inspection Checklist</h4>
        <div class="bg-slate-800 p-3 rounded border border-slate-700 text-xs mb-4">
            <p class="text-slate-400 mb-2">Complete before any powered test or tethered flight:</p>
            <ul class="space-y-1 text-slate-400">
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> All structural screws torqued to spec with threadlock applied</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> No bare wire contacts touching carbon fiber frame surfaces</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Props checked for balance and damage; nuts torqued and retaining clips installed</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Motor rotation directions confirmed (all four); prop orientation matches (CW/CCW)</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Center of mass within ±5 mm of geometric center (X and Y)</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Vibration isolation grommets installed; camera/FC hard-mounted to each other</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> EMI shielding on MIPI CSI cable; GPS mast height &gt;10 cm above ESCs</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Video quality clean at 50% motor throttle bench test (no artifacts)</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Jetson GPU temperature &lt;80°C during 10-minute bench inference run</li>
            </ul>
        </div>

        <details class="code-expand">
            <summary>&#9888; Common Failure Modes — Airframe Integration Phase</summary>
            <div class="p-4 space-y-3 text-xs">
                <div class="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block">IMU vibration saturation in flight logs</strong>
                    <p class="text-slate-400">VIBE values above 60 m/s² in ArduPilot logs indicate the accelerometer is clipping. This causes EKF attitude failures and erratic position estimates — potentially unrecoverable in flight. Root cause is almost always motor/prop imbalance or a frame resonance frequency coinciding with hover RPM. Must be resolved before any flight test.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                    <strong class="text-orange-400 block">CoM shift after payload change</strong>
                    <p class="text-slate-400">Swapping a camera gimbal, adding an antenna, or using a different battery shifts the CoM. After any hardware change that alters mass distribution, re-balance the drone and consider re-running PID autotune.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                    <strong class="text-yellow-400 block">Video cable corruption only visible in flight</strong>
                    <p class="text-slate-400">Bench testing may show clean video with motors off. EMI corruption often only appears when all motors are running simultaneously at flight throttle levels. Always test video quality with all four motors spinning at 50% on the bench before declaring integration complete.</p>
                </div>
            </div>
        </details>
    `,

    6: `
        <h3 class="mt-0 text-rose-400 border-none mb-2">Phase 6: Tethered Flight Test</h3>
        <p class="text-slate-300 text-sm mb-4">The first real flight, with a physical tether preventing any fly-away. This is where software meets real aerodynamics for the first time. The tether is not just a safety measure — it is a structured test protocol that allows incremental validation of the control loop, AI activation, and log analysis pipeline with minimal risk. For DoD programs, this phase's test data feeds directly into the Operational &amp; Support Hazard Analysis (O&amp;SHA) required by MIL-STD-882E.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">6.1 Tether and Anchor Specifications</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Tether Specifications</strong>
                <p class="text-slate-400">3 mm Dyneema cord, rated &gt;200 kg breaking strength. Maximum 5 m of play from the anchor point. Splice a 1 m bungee (elastic) section between anchor and tether to absorb jerk forces. A fully rigid tether can snap the attachment point when the drone attempts a sudden direction change.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Anchor Requirements</strong>
                <p class="text-slate-400">Minimum mass: 3× the drone's All-Up Weight (AUW). Concrete anchor point preferred. Sandbags must be stacked to the correct mass. Never anchor to a vehicle, person, or temporary fixture. The anchor must hold against the drone at full throttle.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Personnel Roles</strong>
                <p class="text-slate-400">Safety pilot: full RC authority at all times, thumb resting on mode switch, eyes on the drone only — never watching the telemetry screen. Observer: monitoring telemetry console and AI output. No bystanders within 10 m radius during any powered flight.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Safety Equipment</strong>
                <p class="text-slate-400">Class D dry powder or CO₂ fire extinguisher for LiPo fires — never use water on lithium battery fire. Fireproof LiPo containment bag. First aid kit. Emergency contact numbers posted visibly at the site. For DoD programs: coordinate with range safety officer and file a range safety clearance request.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">6.2 Pre-Flight Checklist</h4>
        <div class="bg-slate-800 p-3 rounded border border-slate-700 text-xs mb-4">
            <ul class="space-y-1 text-slate-400">
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Battery voltage: &gt;3.8 V/cell at rest. Voltage under load at 30% throttle: &gt;3.6 V/cell</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> GPS lock: minimum 8 satellites, HDOP &lt;1.5 (shown in Mission Planner HUD)</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> All ROS 2 nodes running; <code>ros2 topic hz /ai/detections</code> matches configured FPS</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> AI inference node log shows model loaded to GPU (not falling back to CPU)</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> RC failsafe test: disable RC signal, verify drone enters RTL within 2 seconds</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> ROS bag recording started: <code>ros2 bag record -a -o /data/flight_$(date +%Y%m%d_%H%M%S)</code></li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> SD card inserted in FC; DataFlash logging confirmed active</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Props: nuts tightened to spec, no chips or cracks, spin freely when disarmed</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Tether attached to both drone and anchor; elastic bungee section in line</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Safety pilot at RC transmitter; observer at telemetry monitor; area clear within 10 m</li>
            </ul>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">6.3 Structured Flight Test Protocol</h4>
        <p class="text-slate-400 text-sm mb-2">Complete each step before advancing. Abort on any unexpected behavior. All steps documented in the test log with timestamp and observed result.</p>
        <ol class="list-decimal pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li><strong>STABILIZE takeoff:</strong> Arm and take off in STABILIZE mode. Verify all motors respond correctly. No oscillation, no yaw drift at hover throttle.</li>
            <li><strong>LOITER mode:</strong> Switch to LOITER (GPS position hold). Drone should hold position within 30 cm. Watch for EKF warnings in MAVProxy. Hover for 2 minutes to verify thermal stability.</li>
            <li><strong>GUIDED activation:</strong> Switch to GUIDED. Companion computer now controls position. Verify drone does not jerk, oscillate, or accelerate on mode switch. Maintain hover command for 30 seconds.</li>
            <li><strong>AI task:</strong> Observer walks in a circle at 5 m distance. The AI tracks the target, commanding heading and position adjustments. Target: &lt;50 px from frame center on a 1080p feed.</li>
            <li><strong>Abort drills:</strong> Switch instantly from GUIDED back to LOITER — must be smooth and immediate. Practice 5 times. The mode switch is your abort capability.</li>
            <li><strong>Extended run:</strong> AI active in GUIDED mode for 10 continuous minutes. Monitor Jetson temperature via <code>tegrastats</code> over SSH. Verify CPU and GPU remain within safe ranges.</li>
        </ol>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">6.4 Log Analysis and Go/No-Go Criteria</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-rose-400 font-bold text-xl">&lt;15</div>
                <div class="text-slate-400 mt-1">VIBE m/s²</div>
            </div>
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-rose-400 font-bold text-xl">&lt;0.5</div>
                <div class="text-slate-400 mt-1">EKF innov. m/s</div>
            </div>
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-rose-400 font-bold text-xl">&lt;50 px</div>
                <div class="text-slate-400 mt-1">AI tracking error</div>
            </div>
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-rose-400 font-bold text-xl">&lt;80°C</div>
                <div class="text-slate-400 mt-1">Jetson GPU (10 min)</div>
            </div>
        </div>
        <p class="text-slate-400 text-sm mb-2">Key ArduPilot .bin log plots to review in Mission Planner → DataFlash Log: <code>ATT.DesRoll vs ATT.Roll</code> (attitude tracking), <code>VIBE</code> (vibration X/Y/Z), <code>NKF1.IVN/IVE</code> (EKF velocity innovations). EKF innovations consistently &gt;0.5 m/s indicate GPS or IMU issues — must be root-caused before Phase 7.</p>

        <details class="code-expand">
            <summary>&#9888; Common Failure Modes — Tethered Flight Phase</summary>
            <div class="p-4 space-y-3 text-xs">
                <div class="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block">Violent jerk on GUIDED mode activation</strong>
                    <p class="text-slate-400">The companion computer is sending a position setpoint far from the drone's current position (stale GPS fix or coordinate frame mismatch), or the PSC_POSXY_P gain is too high. Verify the AI sends only relative velocity commands (SET_POSITION_TARGET_LOCAL_NED with velocity mask), not absolute waypoints. Reduce PSC_POSXY_P from default 1.0 toward 0.5 and test again.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                    <strong class="text-orange-400 block">AI loses target tracking in direct sunlight</strong>
                    <p class="text-slate-400">Lens flare or overexposure saturates the sensor on the target region. Implement Auto Exposure Region-of-Interest (AE ROI) locked to the target bounding box. If the model completely fails to detect the target, this indicates insufficient domain randomization in the SITL phase — return to Phase 2 and add high-contrast lighting scenarios.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                    <strong class="text-yellow-400 block">LOITER position hold error exceeding 1.5 m</strong>
                    <p class="text-slate-400">Usually GPS multipath from nearby structures or trees. Move the test site to a more open area. If the EKF innovations are high even in the open, recheck compass calibration — a poorly calibrated compass with hard iron distortion causes velocity estimation errors that appear as position drift.</p>
                </div>
            </div>
        </details>
    `,

    7: `
        <h3 class="mt-0 text-pink-400 border-none mb-2">Phase 7: Free-Flight Validation</h3>
        <p class="text-slate-300 text-sm mb-4">With the tethered test proving the control loop, you now expand to untethered autonomous flight. This phase uses incremental range expansion and structured edge-case testing to build a complete performance profile. Every session produces data; every data point shapes the next session's scope. For civil operations, a valid FAA Part 107 remote pilot certificate and LAANC authorization are required before the first free flight.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">7.1 Regulatory Prerequisites</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-pink-500">
                <strong class="text-pink-400 block mb-1">Civil (FAA Part 107)</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1 mt-1">
                    <li>Remote Pilot Certificate for the safety pilot (knowledge test + TRUST)</li>
                    <li>LAANC authorization via FAA DroneZone, AirMap, or Aloft for controlled airspace. Near-instant approval for pre-approved altitudes.</li>
                    <li>Fly only within VLOS (visual line of sight) unless a BVLOS waiver (Part 107.31) is in hand. BVLOS waiver processing: 90–180 days. File during Phase 1.</li>
                    <li>File a NOTAM for the test area as professional courtesy. Required for sustained operations near airports.</li>
                    <li>Night operations: allowed without waiver since 2024 update, with anti-collision light visible at 3 SM and updated Part 107 training.</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-1">Military (DoD)</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1 mt-1">
                    <li>Authority to Operate (ATO) issued by the Technical Airworthiness Authority (TAA) under DoDI 5030.61. Required before any flight test on DoD ranges.</li>
                    <li>Range Safety Plan approved by the range safety officer. Red-range coordination if operating near other aviation.</li>
                    <li>OPREP (Operational Report) plan for mishap notification chain per MIL-STD-882E O&amp;SHA requirements.</li>
                    <li>Personnel certified per DAFMAN 11-501 (Air Force) or equivalent Army / Navy / USMC publications for the specific sUAS platform.</li>
                </ul>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">7.2 Incremental Range Expansion Protocol</h4>
        <div class="math-block text-xs mb-4">
Session 1:   Range 30 m radius,  AGL 15 m,  Duration 10 min
             Goal: Verify AI tracking at close range, confirm GPS accuracy in the open
             Pass criteria: no EKF warnings, AI tracking error &lt;50 px throughout

Session 2:   Range 100 m radius, AGL 30 m,  Duration 15 min
             Goal: Test tracking at real operational distances, measure latency vs range
             Pass criteria: E2E latency still &lt;100 ms at 100 m command distance

Session 3:   Range 200 m radius, AGL 50 m,  Duration 20 min
             Goal: Full operational envelope, multiple target scenarios
             Pass criteria: all Phase 7 performance metrics met across full session

Session 4+:  Structured edge-case testing (see 7.3)</div>
        <p class="text-slate-400 text-sm mb-3">Never increase the range by more than 3× between sessions. If any session reveals anomalies, hold at that range until root-caused. Log every session with a full ROS bag and .bin log — these are your primary analysis artifacts and the evidence base for the DoD Operational Test &amp; Evaluation (OT&amp;E) report.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">7.3 Structured Edge Case Tests</h4>
        <p class="text-slate-400 text-sm mb-2">These scenarios will not occur naturally — they must be deliberately planned and executed. Document expected and actual behavior for each:</p>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li><strong>Target occlusion:</strong> Have the target walk behind a tree or vehicle mid-track. Verify the AI holds the last-known position estimate, does not hallucinate a new target, and smoothly re-acquires when the target re-emerges. Expected: 2–5 seconds of stable position hold, then controlled re-acquisition.</li>
            <li><strong>Multiple simultaneous targets:</strong> Two people cross in front of the drone at the same time. Verify the priority logic is deterministic and the drone does not oscillate between targets. Implement a minimum dwell time of 2 seconds before target switch.</li>
            <li><strong>Low battery RTL during AI task:</strong> Allow the battery to reach the RTL threshold (<code>BATT_FS_LOW_VOLT</code>) during an active GUIDED mission. The drone must exit GUIDED cleanly — the safety failsafe must override the AI without resistance from the companion computer.</li>
            <li><strong>GCS communications loss:</strong> Deliberately disable the telemetry radio. Verify the drone enters RTL per <code>FS_GCS_ENABLE</code> setting. Tests the failsafe configuration, not just normal operation.</li>
            <li><strong>Wind gust test:</strong> If natural conditions permit (&gt;15 knots gusting), fly GUIDED mode and measure positional drift during gusts before the controller corrects. Quantifies disturbance rejection performance.</li>
            <li><strong>GPS-denied operation (advanced):</strong> Simulate GPS loss by setting <code>GPS_TYPE=0</code> while the drone is in LOITER. Verify the drone transitions to optical flow or barometer-based altitude hold without attitude failure. Required for DoD programs that must operate in GPS-degraded environments.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">7.4 Performance Metrics Dashboard</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-pink-400 font-bold text-xl">&lt;100ms</div>
                <div class="text-slate-400 mt-1">E2E latency target</div>
            </div>
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-pink-400 font-bold text-xl">&gt;85%</div>
                <div class="text-slate-400 mt-1">Track retention rate</div>
            </div>
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-pink-400 font-bold text-xl">&lt;2 m</div>
                <div class="text-slate-400 mt-1">Position hold error</div>
            </div>
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-pink-400 font-bold text-xl">&lt;80°C</div>
                <div class="text-slate-400 mt-1">Jetson GPU in flight</div>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">7.5 Test Documentation &amp; Traceability</h4>
        <div class="bg-slate-800 p-3 rounded border border-slate-700 text-xs mb-4">
            <p class="text-slate-400 mb-2">Each test session must produce a Test Report linking results back to requirements from Phase 1:</p>
            <ul class="space-y-1 text-slate-400">
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Session date, location, weather conditions (wind, temp, visibility) documented</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> ROS bag archived with session ID and SHA-256 checksum (prevents accidental modification)</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> ArduPilot .bin log archived alongside ROS bag</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Performance metrics calculated and recorded against pass/fail thresholds</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Any anomalies documented with root cause and corrective action</li>
                <li class="flex gap-2"><span class="text-emerald-400">&#9744;</span> Requirements traceability matrix updated (which requirements are now verified by which test sessions)</li>
            </ul>
        </div>

        <details class="code-expand">
            <summary>&#9888; Common Failure Modes — Free-Flight Validation Phase</summary>
            <div class="p-4 space-y-3 text-xs">
                <div class="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block">GPS multipath in wooded or semi-urban areas</strong>
                    <p class="text-slate-400">Trees and structures reflect GPS signals, creating ghost positions that confuse the EKF. Visible symptom: drone "jumps" 1–2 m in LOITER mode. Monitor NKF1 innovations in real time via telemetry. If innovations consistently exceed 0.8 m/s, move to a more open location. Long-term fix: switch to RTK GPS for centimeter-level filtering.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                    <strong class="text-orange-400 block">Battery drains faster than power budget predicted</strong>
                    <p class="text-slate-400">Continuous 30 Hz inference at full GPU clock significantly exceeds hover-only battery calculations. Implement dynamic inference rate: reduce to 10 Hz when target is within 20 px of frame center, increase to 30 Hz when tracking error is high. This can extend flight time by 15–20%.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                    <strong class="text-yellow-400 block">PID instability at range that wasn't present in tethered test</strong>
                    <p class="text-slate-400">At longer ranges, telemetry packet latency increases. High-frequency position commands sent at 30 Hz may arrive out of order or with variable delay. Implement rate limiting on position setpoints (max 10 Hz for outer-loop commands to ArduPilot) and add a deadband on small tracking errors.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-rose-500">
                    <strong class="text-rose-400 block">Operating BVLOS without a waiver during edge-case testing</strong>
                    <p class="text-slate-400">Edge-case sessions that expand range gradually may inadvertently exceed visual line of sight. Designate a fixed "VLOS boundary marker" (orange cone, surveyor flag) at the maximum VLOS distance before the session begins. The safety pilot must return to LOITER immediately if the drone crosses that marker without an active BVLOS waiver.</p>
                </div>
            </div>
        </details>
    `,

    8: `
        <h3 class="mt-0 text-teal-400 border-none mb-2">Phase 8: Regulatory Compliance &amp; Operational Deployment</h3>
        <p class="text-slate-300 text-sm mb-4">A technically proven drone is operationally useless if it cannot legally fly or be maintained long-term. This phase covers the compliance framework for both civil (FAA) and military (DoD) operations, CMMC 2.0 requirements for programs handling CUI, operational documentation, maintenance lifecycle, and the AI model CI/CD pipeline needed to sustain the system beyond the prototype stage.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">8.1 FAA Civil Regulatory Framework</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-teal-500">
                <strong class="text-teal-400 block mb-1">Part 107 Standard Rules (Civil, sub-55 lbs)</strong>
                <p class="text-slate-400">Visual line of sight, daylight operations (or civil twilight with anti-collision light visible at 3 SM), max 400 ft AGL, no operations over moving vehicles or people without waiver, Remote Pilot Certificate required, Remote ID required for all drones &gt;250 g. Covers the vast majority of commercial and test operations.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-teal-500">
                <strong class="text-teal-400 block mb-1">Key Waivers for AI Mission Profiles</strong>
                <p class="text-slate-400">BVLOS (Part 107.31): most critical waiver for autonomous AI missions. Processing: 90–180 days. File during Phase 1. Operations over people (Categories 1–3): available without waiver for drones meeting specific injury-threshold criteria since 2024 rule update. Night: waiver no longer required as of 2024 update with anti-collision light and updated training.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-teal-500">
                <strong class="text-teal-400 block mb-1">Remote ID (Required since 2023)</strong>
                <p class="text-slate-400">All drones &gt;250 g must broadcast: drone ID, real-time position, velocity, altitude, and operator location via Wi-Fi Beacon (802.11) or Bluetooth 4/5. ArduPilot built-in support: <code>RID_ENABLE=1</code> and configure <code>RID_BCAST_RATE</code>. Alternatively, use a dedicated Open Drone ID broadcast module.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-teal-500">
                <strong class="text-teal-400 block mb-1">Airspace Authorization (LAANC)</strong>
                <p class="text-slate-400">Use LAANC via FAA DroneZone or approved apps (AirMap, Aloft) for near-instant authorization in Class B/C/D/E controlled airspace up to pre-approved altitudes. File NOTAMs for sustained test operations. For Class A airspace or altitudes above 400 ft AGL: full COA (Certificate of Authorization) required.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">8.2 DoD Military Compliance Framework</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-1">Authority to Operate (ATO) — DoDI 5030.61</strong>
                <p class="text-slate-400">All DoD air vehicles require an Airworthiness Determination from the TAA before flight. The ATO package includes: airworthiness determination letter, system safety assessment (MIL-STD-882E), operator qualifications, flight envelope limitations, and the SSMP with completed hazard analyses (PHL, SSHA, SHA, O&amp;SHA). ATO is aircraft-and-configuration-specific — a software update may require an ATO amendment.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-1">Blue UAS Framework (DCMA, 2025)</strong>
                <p class="text-slate-400">All DoD sUAS purchases must use DCMA-cleared platforms from the Blue UAS list (39+ systems, 165+ components as of 2025). Custom builds for R&amp;D programs require a Blue UAS Exception Request through the program's security office. Components from non-cleared Chinese-owned manufacturers (DJI, Autel pre-2024) are prohibited for DoD use on non-excepted programs.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-purple-500">
                <strong class="text-purple-400 block mb-1">CMMC 2.0 Requirements</strong>
                <p class="text-slate-400">Programs handling CUI (Controlled Unclassified Information) — mission data, targeting data, comms keys — require CMMC Level 2 compliance (110 NIST SP 800-171 practices). This includes: access control (AC), audit logging (AU), configuration management (CM), identification and authentication (IA), system and communications protection (SC), and system integrity (SI) for all systems that touch CUI, including the companion computer and ground station.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-purple-500">
                <strong class="text-purple-400 block mb-1">ITAR / Export Control</strong>
                <p class="text-slate-400">Drone systems with significant military capability (cameras, AI targeting, encrypted comms) are typically controlled under ITAR (International Traffic in Arms Regulations), USML Category XV (Spacecraft and Related Articles) or Category XI (Military Electronics). Exporting, transferring, or sharing controlled technical data with foreign nationals — including foreign PhD students working on the program — requires DDTC authorization or a Technology Control Plan.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">8.3 Standard Operating Procedures</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li><strong>Pre-mission brief checklist:</strong> Airspace authorization confirmed and printed. Weather assessed and within minimums. Hazards identified on a site map. Crew briefed on emergency procedures. All crew communication radios tested.</li>
            <li><strong>Emergency procedure matrix:</strong> (a) Comms loss: drone enters RTL after configurable timeout. (b) Battery critical: automatic LAND mode activation. (c) Mechanical failure: safety pilot assumes manual control immediately, prepares for emergency landing. (d) Fire: all personnel upwind, call 911, use dry chemical or CO₂ — never water on LiPo.</li>
            <li><strong>Weather minimums (recommended):</strong> Wind &lt;15 knots sustained, gusts &lt;20 knots, visibility &gt;3 SM, ceiling &gt;500 ft AGL, temperature between Jetson operating range (-25°C to 70°C ambient). LiPo capacity drops ~30% at 0°C — adjust endurance expectations and battery count for cold operations.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">8.4 Maintenance Schedule</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Every Flight</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1 mt-1">
                    <li>Visual inspection: frame cracks, prop integrity, wiring security</li>
                    <li>Battery: check cell voltage balance, inspect for swelling</li>
                    <li>Camera lens: clean with air blower only</li>
                    <li>Post-flight: discharge to storage voltage (3.75–3.80 V/cell) if not flying within 48 hours</li>
                    <li>Log review: scan for new EKF warnings, vibration spikes, or AI latency outliers</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Every 25 Flight Hours</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1 mt-1">
                    <li>Motor bearings: spin by hand, feel for roughness or axial play</li>
                    <li>Motor resistance: measure phase-to-phase with multimeter (±0.05 Ω tolerance)</li>
                    <li>Re-torque all structural screws to manufacturer spec with threadlock</li>
                    <li>Inspect all connector crimps for cold joints or corrosion</li>
                    <li>Recalibrate compass if operating near new structures or after relocation</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Every 100 Flight Hours</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1 mt-1">
                    <li>Full disassembly and internal inspection</li>
                    <li>Replace motor bearings proactively (don't wait for failure)</li>
                    <li>Re-crimp or replace all power connectors</li>
                    <li>Recalibrate all sensors: camera intrinsics, extrinsics, IMU thermal</li>
                    <li>Replace LiPo batteries if cycle count &gt;200 or internal resistance &gt;150 mΩ/cell</li>
                    <li>Security patch review: apply pending OS, ROS 2, and firmware security updates</li>
                </ul>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">8.5 AI Model CI/CD Pipeline</h4>
        <p class="text-slate-400 text-sm mb-2">AI model updates are software releases. Treat them with the same rigor as firmware updates — and for DoD programs, require the same ATO amendment process if the model change affects declared operational performance envelopes.</p>
        <div class="math-block text-xs mb-4">
AI Model Update Pipeline:

1. Retrain model (new data, architecture, or hyperparameter update)
2. Automated benchmark on frozen test set:
   &#8594; must meet or exceed baseline mAP50 by defined margin (e.g., +1%)
3. Deploy to SITL: run full 50-episode regression suite automatically
   &#8594; zero fly-away events, latency &lt;100 ms, tracking error &lt;50 px
4. Human review: sample 10% of SITL episode recordings for qualitative review
   &#8594; look for failure mode categories not captured by automated metrics
5. HITL smoke test: 3 sessions, automated pass/fail on performance metrics
6. Security scan: Syft SBOM generation, Grype CVE scan on all dependencies
7. OTA deployment (see Module 17 OTA section):
   &#8594; signed artifact bundle pushed to fleet via secure update agent
   &#8594; first 5 minutes of next operational mission: heightened monitoring
8. Active learning: flag detections with confidence &lt;0.60 for human review
   &#8594; these low-confidence cases are highest-value additions to next training set</div>

        <details class="code-expand">
            <summary>&#9888; Common Failure Modes — Operational Deployment Phase</summary>
            <div class="p-4 space-y-3 text-xs">
                <div class="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block">Model regression after retraining</strong>
                    <p class="text-slate-400">New training data introduces a distribution shift that hurts performance on previously working scenarios. Mitigation: maintain a frozen, version-controlled regression test suite built from operational mission clips. Any model update must pass this suite before deployment. Treat failures as blocking, not advisory.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                    <strong class="text-orange-400 block">Operating BVLOS without an active waiver</strong>
                    <p class="text-slate-400">The FAA actively enforces BVLOS through Remote ID monitoring and airspace surveillance. Fines start at $1,377 per violation per day, up to $27,500 per serious violation, with potential criminal liability for reckless operation. There is no informal grace period — the waiver must be in hand before the first BVLOS flight.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                    <strong class="text-yellow-400 block">Skipping post-crash inspection</strong>
                    <p class="text-slate-400">After any hard landing, prop strike, or crash — even if the drone appears undamaged and flies normally — fully disassemble and inspect before the next flight. Carbon fiber frames develop internal delamination without visible exterior damage. A cracked arm failure on the next flight is a much worse outcome than spending an hour on inspection.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-rose-500">
                    <strong class="text-rose-400 block">CMMC non-compliance discovered during C3PAO assessment</strong>
                    <p class="text-slate-400">Programs that retrofit security controls after development often fail CMMC Level 2 assessments on AC.1.001 (limit system access), AU.2.041 (audit record events), and SI.1.210 (identify and correct system flaws). These require architectural changes to the companion computer OS configuration and the CI/CD pipeline — far more disruptive than building them in from Phase 1. Build access controls, audit logging, and automated patch pipelines into the initial architecture, not as an afterthought.</p>
                </div>
            </div>
        </details>
    `
};

export function updateWorkflow(el, stepNum) {
    document.querySelectorAll('.workflow-step').forEach(e => e.classList.remove('active'));
    if (el) {
        el.classList.add('active');
    } else {
        const target = document.querySelector(`.workflow-step[data-step="${stepNum}"]`);
        if (target) target.classList.add('active');
    }

    document.querySelectorAll('.gantt-row-item').forEach(e => e.classList.remove('gantt-active'));
    const ganttRow = document.querySelector(`.gantt-row-item[data-step="${stepNum}"]`);
    if (ganttRow) ganttRow.classList.add('gantt-active');

    const contentPanel = document.getElementById('wf-content');
    if (contentPanel) {
        contentPanel.classList.remove('fade-in');
        void contentPanel.offsetWidth;
        contentPanel.innerHTML = workflowContent[stepNum];
        contentPanel.classList.add('fade-in');
    }
}
