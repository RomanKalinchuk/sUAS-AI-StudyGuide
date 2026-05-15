export const workflowContent = {
    1: `
        <h3 class="mt-0 text-sky-400 border-none mb-2">Phase 1: Requirements &amp; Architecture</h3>
        <p class="text-slate-300 text-sm mb-4">Before writing a single line of code or ordering hardware, define exactly what the drone is supposed to do. Every downstream decision — airframe, compute, sensors, communications — flows from these initial requirements. A decision made badly here costs weeks to undo in Phase 5.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">1.1 Mission Definition</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
            <div class="bg-slate-800 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Mission Envelope</strong>
                <p class="text-slate-400">Define range (km), endurance (min), max altitude (m AGL), and payload mass (kg). Write minimum acceptable values and target values separately — the gap between them drives your hardware selection.</p>
            </div>
            <div class="bg-slate-800 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Autonomy Level</strong>
                <p class="text-slate-400">Level 1 (supervised): human approves every action. Level 3 (conditional): AI acts within pre-approved bounds, human can override. Level 5 (full): no human-in-the-loop. FAA waivers differ substantially by level.</p>
            </div>
            <div class="bg-slate-800 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Operating Environment</strong>
                <p class="text-slate-400">Urban (GPS multipath, dense RF, building proximity), rural (open sky, long range), maritime (salt spray, humidity, wind), indoor (no GPS, wall proximity). Each changes sensor and navigation design significantly.</p>
            </div>
            <div class="bg-slate-800 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Regulatory Class</strong>
                <p class="text-slate-400">Sub-250g: minimal requirements, no Remote ID. 250g–25kg: Part 107, Remote ID required. Over 25kg: requires full FAA airworthiness certification. Designing to stay under 250g eliminates most compliance work.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">1.2 Airframe Selection</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase block mb-1">Multirotor</strong>
                <p class="text-slate-400 mb-1">Best for hover, precision positioning, confined environments, and payload drop. Typical endurance: 15–30 min on a 4S–6S LiPo. Hover consumes 100–200 W/kg AUW.</p>
                <p class="text-slate-500 italic">Select if the task requires stationary observation or confined-space navigation.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase block mb-1">Fixed-Wing</strong>
                <p class="text-slate-400 mb-1">Best for range and endurance (60–120 min). Covers ground efficiently, but requires a runway or hand-launch and cannot hover.</p>
                <p class="text-slate-500 italic">Select if the mission is area coverage at range and stationary observation is not needed.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase block mb-1">VTOL Hybrid</strong>
                <p class="text-slate-400 mb-1">Vertical takeoff, then transitions to efficient forward flight. Best of both. More mechanical complexity; more failure points. Typical endurance 45–90 min.</p>
                <p class="text-slate-500 italic">Select if the mission needs both hover precision at endpoints and efficient range coverage.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">1.3 Compute Stack Selection</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Jetson Orin Nano 8GB</strong>
                <p class="text-slate-400">67 TOPS, 5–15 W, ~$500. The right choice for most AI drone builds. YOLOv8 runs at 30 Hz. Runs ROS 2 and TensorRT natively with JetPack.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Jetson AGX Orin 32GB</strong>
                <p class="text-slate-400">275 TOPS, 15–40 W, ~$1,000. For workloads running depth mapping, detection, and navigation simultaneously. Too power-hungry for light builds under 2 kg.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Raspberry Pi 5</strong>
                <p class="text-slate-400">No GPU. 5 W. Best for non-AI roles: telemetry relay, sensor aggregation. Pair with a Google Coral USB TPU (~4 TOPS) if light inference is needed.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">1.4 Rough Power Budget</h4>
        <p class="text-slate-400 text-sm mb-2">Sum all consumers to determine battery capacity. Wh = Total Power (W) × Endurance (h). Always add a 25% margin.</p>
        <div class="math-block text-xs mb-4">
Motors + ESCs (hover):     4 × 200 W = 800 W  (dominant consumer)
Flight Controller:         2–5 W
Companion (Jetson Orin):   10–20 W (peak GPU load)
Payload (camera, gimbal):  5–30 W
RF / telemetry:            1–3 W
─────────────────────────────────────────
Total hover draw:          ~840 W typical
For 20 min endurance:      840 W × 0.33 h = 278 Wh
At 80% DoD, 22.2 V (6S):  12.5 Ah → select 14 Ah pack (common size)</div>

        <details class="code-expand">
            <summary>⚠ Common Failure Modes — Requirements Phase</summary>
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
            </div>
        </details>
    `,

    2: `
        <h3 class="mt-0 text-amber-400 border-none mb-2">Phase 2: SITL Simulation</h3>
        <p class="text-slate-300 text-sm mb-4">Never fly untested AI code on physical hardware. Software-In-The-Loop testing runs your exact production code against a physics simulator, catching control loop bugs and AI model failures at zero cost. A bug found in SITL takes an hour to fix. The same bug found mid-flight can total the aircraft.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">2.1 Simulator Selection</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 block mb-1">NVIDIA Isaac Sim (Recommended)</strong>
                <p class="text-slate-400">Photorealistic RTX ray tracing via Omniverse. Physics-accurate aerodynamics. Native ROS 2 bridge. Sensor models for lidar, stereo camera, and IMU. Requires an NVIDIA RTX 4080 or better. Best for visual AI training and zero-shot sim-to-real transfer. Note: Microsoft AirSim was deprecated in 2023 — use Isaac Sim or the community fork Colosseum for Unreal Engine workflows.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-slate-600">
                <strong class="text-white block mb-1">Gazebo Harmonic</strong>
                <p class="text-slate-400">Open-source, lightweight. Plugin-based architecture. Less photorealistic but runs on CPU-only systems. Well-documented ArduPilot integration. Good for validating control logic and sensor fusion before moving to Isaac Sim for visual AI training. Active community, production-proven in academic research.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">2.2 System Connection Architecture</h4>
        <div class="math-block text-xs mb-4">
ROS 2 AI Node
  subscribes:  /camera/image_raw (sensor_msgs/Image, 30 Hz)
  publishes:   /ai/detections (vision_msgs/Detection2DArray)
        |
        v
MAVLink Bridge (MAVROS or pymavlink)
  sends: SET_POSITION_TARGET_LOCAL_NED or COMMAND_LONG
        |
        v
ArduPilot SITL  &lt;── TCP port 5760 ──&gt;  Simulator (Isaac Sim / Gazebo)
        |
        v
Ground Control Station (QGroundControl / Mission Planner)</div>
        <p class="text-slate-400 text-sm mb-3">Key ArduPilot SITL parameters: <code>SIM_SPEEDUP=4</code> runs the simulation 4× faster for rapid iteration. <code>SIM_WIND_SPD=5</code> adds a 5 m/s wind disturbance. <code>LOG_DISARMED=1</code> logs data even before arming, capturing your full pre-flight sequence.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">2.3 Domain Randomization</h4>
        <p class="text-slate-400 text-sm mb-3">A model trained on one visual condition fails on another. Domain randomization forces generalization. Minimum requirements before declaring SITL complete:</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-amber-400 font-bold text-xl">50+</div>
                <div class="text-slate-400 mt-1">Unique episodes</div>
            </div>
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-amber-400 font-bold text-xl">4</div>
                <div class="text-slate-400 mt-1">Lighting conditions</div>
            </div>
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-amber-400 font-bold text-xl">±10%</div>
                <div class="text-slate-400 mt-1">Wind disturbance</div>
            </div>
            <div class="bg-slate-800 p-2 rounded text-center">
                <div class="text-amber-400 font-bold text-xl">50+</div>
                <div class="text-slate-400 mt-1">Target texture variants</div>
            </div>
        </div>
        <p class="text-slate-400 text-sm mb-3">Lighting conditions to cover: dawn (orange, low-angle, long shadows), noon (harsh overhead, deep shadows), overcast (flat, diffuse), dusk. Night/IR is a separate category if the mission profile requires it.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">2.4 AI Inference Validation</h4>
        <p class="text-slate-400 text-sm mb-2">Run the actual TensorRT-compiled model — do not mock it. This tests the production inference path. Before declaring SITL complete:</p>
        <ul class="list-disc pl-5 space-y-1 text-sm text-slate-400 mb-4">
            <li>End-to-end latency (camera frame to MAVLink command): target &lt;100 ms</li>
            <li>Inference frequency matches camera FPS (30 Hz typical). Verify with <code>ros2 topic hz /ai/detections</code></li>
            <li>Detection precision/recall &gt;90% averaged across all domain randomization scenarios</li>
            <li>Zero fly-away events (GUIDED mode exits with RTL) across all 50+ episodes</li>
            <li>CPU/GPU utilization under sustained load remains within thermal budget — profile with <code>tegrastats</code> even in simulation</li>
        </ul>

        <details class="code-expand">
            <summary>⚠ Common Failure Modes — SITL Phase</summary>
            <div class="p-4 space-y-3 text-xs">
                <div class="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block">Sim-to-real visual gap</strong>
                    <p class="text-slate-400">Isaac Sim textures are too perfect. Real cameras have sensor noise, lens distortion, bloom, and motion blur. Add Gaussian and salt-and-pepper noise models to the simulated camera output. Without this, models that hit 95% recall in sim may drop to 60% on first real-world flight.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                    <strong class="text-orange-400 block">ROS 2 DDS discovery failure on localhost</strong>
                    <p class="text-slate-400">ROS 2 Jazzy (and Humble) defaults to multicast UDP for node discovery. On some systems, the loopback interface blocks multicast. Fix: set RMW_IMPLEMENTATION=rmw_cyclonedds_cpp and configure Cyclone DDS to explicitly allow the loopback interface. Also ensure ROS_DOMAIN_ID is consistent across all terminals.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                    <strong class="text-yellow-400 block">PID gains from SITL don't transfer to hardware</strong>
                    <p class="text-slate-400">Simulated aerodynamics are idealized. Real airframes have vibration, motor asymmetry, and prop wash effects. Treat SITL PID gains as initial starting points. Expect 20–40% retuning during Phases 6 and 7 after observing actual flight behavior.</p>
                </div>
            </div>
        </details>
    `,

    3: `
        <h3 class="mt-0 text-orange-400 border-none mb-2">Phase 3: Hardware Bench Build</h3>
        <p class="text-slate-300 text-sm mb-4">Moving from simulation to silicon. Build and verify the complete hardware stack on an anti-static workbench before any airframe involvement. A wiring error found at this stage takes an hour to fix. Found mid-flight, it costs the drone. Do not rush past bench verification.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">3.1 Companion Computer Setup</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Flash using NVIDIA SDK Manager on a host Ubuntu PC. Connect the Jetson via USB-C with the FORCE_RECOVERY button held during power-on to enter recovery mode.</li>
            <li>Select <strong>JetPack 6.x</strong> (Ubuntu 22.04 base, CUDA 12.x, TensorRT 10.x) for all new Jetson Orin builds. JetPack 5.x (Ubuntu 20.04) is legacy and no longer receives active feature updates.</li>
            <li>Verify the stack after flash: <code>nvcc --version</code> (CUDA present), <code>dpkg -l | grep tensorrt</code> (TensorRT installed), then <code>python3 -c "import torch; print(torch.cuda.is_available())"</code> should return True.</li>
            <li>Set max-performance mode for bench testing: <code>sudo jetson_clocks</code> pins all clocks at maximum. <code>sudo nvpmodel -m 0</code> sets MAXN mode. Note: this increases power draw and heat — monitor with <code>tegrastats</code>.</li>
            <li>Install <strong>ROS 2 Jazzy Jalisco</strong> (Ubuntu 24.04 LTS base, EOL May 2029) from the NVIDIA-provided ROS packages. Jazzy is the current LTS release and the version covered throughout this guide. Note: Jazzy targets Ubuntu 24.04 — if your JetPack 6.x image ships Ubuntu 22.04, use ROS 2 Humble as an interim until NVIDIA releases a 24.04-based JetPack.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">3.2 Flight Controller Setup</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Download ArduPilot firmware from <strong>firmware.ardupilot.org</strong>. Select your FC hardware variant (e.g., CubeOrange) and vehicle type (ArduCopter for multirotors, ArduPlane for fixed-wing).</li>
            <li>Flash via Mission Planner: connect FC via USB, go to Initial Setup → Install Firmware. For custom builds: use <code>waf</code> from the ArduPilot repository to compile with specific features enabled.</li>
            <li>Run the full initial setup wizard: frame type selection (match your motor count and layout), ESC calibration (all motors spin in correct direction), compass calibration (figure-8 pattern), accelerometer calibration (6-position).</li>
            <li>Critical initial parameters: <code>ARMING_CHECK=1</code> (enforce all preflight checks — never set to 0 in production), <code>LOG_BACKEND_TYPE=3</code> (log to both flash and SD for redundancy), <code>FS_GCS_ENABLE=1</code> (GCS failsafe: enter RTL if telemetry lost &gt;5 seconds).</li>
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
  SYSID_MYGCS      = 255     # Accept commands from system ID 255 (companion)</div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">3.4 Network Configuration and Software Stack</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Install MAVROS on the Jetson: <code>sudo apt install ros-humble-mavros</code>. Run the GeographicLib datasets installer (required by MAVROS, not installed automatically): find the install script in the mavros package and run it with sudo.</li>
            <li>Launch MAVROS: <code>ros2 launch mavros mavros_launch.py fcu_url:=/dev/ttyS0:921600</code>. Substitute the correct serial device path for your Jetson model (ttyS0 on Orin, ttyTHS0 on some models).</li>
            <li>Verify heartbeat: <code>ros2 topic echo /mavros/state</code> — should show <code>connected: true</code> within 5 seconds of launch. If not, check baud rate, serial device path, and UART wiring.</li>
            <li>Verify sensor data: <code>ros2 topic hz /mavros/global_position/global</code> should run at ~5 Hz when GPS has lock. <code>ros2 topic hz /mavros/imu/data</code> should run at 400 Hz if the FC is configured at default rates.</li>
            <li>Launch your AI inference node. Verify: <code>ros2 topic hz /ai/detections</code> matches the configured FPS. Check GPU utilization via <code>tegrastats</code> during sustained inference.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">3.5 Power Architecture</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>The companion computer must have its own dedicated BEC (Battery Eliminator Circuit) providing stable 5 V at 5 A minimum for the Jetson Orin Nano. Do not power it from the FC's servo rail — it cannot source enough current.</li>
            <li>The FC receives power via a dedicated Power Module on the main battery lead. This also provides voltage and current sensing for battery monitoring (<code>BATT_MONITOR=4</code> for voltage + current sensing).</li>
            <li>ESCs and motors draw power directly from the main battery bus. Keep motor power cables as short as possible and away from signal cables.</li>
        </ul>

        <details class="code-expand">
            <summary>⚠ Common Failure Modes — Bench Build Phase</summary>
            <div class="p-4 space-y-3 text-xs">
                <div class="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block">No MAVLink heartbeat after wiring</strong>
                    <p class="text-slate-400">Most common causes: TX and RX swapped (the most frequent mistake), baud rate mismatch between FC and companion, wrong serial device path, or GND not connected. Attach a USB-serial adapter to the UART line and use <code>mavproxy.py</code> to sniff packets directly.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                    <strong class="text-orange-400 block">Companion computer random resets during motor spin-up</strong>
                    <p class="text-slate-400">ESC switching noise couples into the 5 V rail and drops voltage below the Jetson's minimum. Mitigation: add a 470 µF low-ESR electrolytic capacitor across the 5 V and GND rails at the Jetson input. Verify rail stability with a multimeter during motor spin-up on the bench (no props).</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                    <strong class="text-yellow-400 block">JetPack version incompatible with ROS 2 packages</strong>
                    <p class="text-slate-400">Some NVIDIA-specific ROS 2 packages (especially GPU-accelerated perception nodes) are pinned to specific JetPack versions. Check the package's documentation before flashing. Mixing JetPack 5 and JetPack 6 packages causes silent ABI mismatches that only surface at runtime.</p>
                </div>
            </div>
        </details>
    `,

    4: `
        <h3 class="mt-0 text-emerald-400 border-none mb-2">Phase 4: Sensor Calibration</h3>
        <p class="text-slate-300 text-sm mb-4">Garbage data in, garbage AI out. Every sensor — camera, IMU, GPS — has systematic errors that must be mathematically characterized and corrected. Skipping or rushing calibration is the single most common cause of AI tracking performance degrading between bench testing and real flight.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">4.1 Camera Intrinsic Calibration</h4>
        <p class="text-slate-400 text-sm mb-2">Intrinsics characterize the camera's internal geometry: focal length, optical center (principal point), and lens distortion. Required for accurate pixel-to-3D-ray projection used by the AI targeting system.</p>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li><strong>Calibration target:</strong> Print a ChArUco board (preferred over plain checkerboard — works even when partially occluded) on matte photo paper, laminate it, and mount on a rigid flat backing (acrylic or foam board). A 6×8 board with 30 mm square size works for most drone cameras. A warped or non-flat target gives poor calibration regardless of software quality.</li>
            <li><strong>Image collection:</strong> Capture 30–50 images with the target at varied positions — close, far, tilted ±30°, in all four corners of the frame, and centered. Poor angular coverage produces calibration that fails at image edges.</li>
            <li><strong>Tool:</strong> ROS 2 <code>camera_calibration</code> package. Run: <code>ros2 run camera_calibration cameracalibrator --size 6x8 --square 0.030 image:=/camera/image_raw</code></li>
            <li><strong>Output:</strong> Camera matrix K (3×3): focal lengths fx, fy and principal point cx, cy. Distortion coefficients [k1, k2, p1, p2, k3]. Save as <code>camera_info.yaml</code> and publish via <code>camera_info_manager</code>.</li>
            <li><strong>Quality threshold:</strong> Reprojection error &lt;0.5 px is excellent. 0.5–1.0 px is acceptable. Above 1.0 px means re-collect images with better geometric diversity.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">4.2 Camera Extrinsic Calibration (Body-Camera Transform)</h4>
        <p class="text-slate-400 text-sm mb-2">Extrinsics define where the camera is positioned relative to the drone's body frame Center of Mass (CoM). This transform is applied every time the AI converts a pixel detection to world-space coordinates. A 1 cm error here produces a 0.5 m navigation error at 50 m altitude.</p>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Measure physically from CoM to camera optical center using calipers. Record as [x_fwd, y_right, z_down] in meters from the CoM origin. Example: camera is +0.10 m forward, 0 m lateral, -0.05 m (above) the CoM.</li>
            <li>For higher accuracy, use the <strong>Kalibr toolbox</strong> (ETH Zürich): record a ROS bag with synchronized camera images and IMU data while moving through a known calibration target. Kalibr jointly estimates the camera-IMU transform with centimeter-level accuracy.</li>
            <li>Publish the transform via ROS 2's <code>robot_state_publisher</code> using a URDF that defines the <code>camera_optical_frame</code> relative to <code>base_link</code>. This feeds the TF2 transform tree used by all navigation nodes.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">4.3 IMU Calibration</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li><strong>Accelerometer (6-position cal):</strong> Trigger via Mission Planner → Initial Setup → Mandatory Hardware → Accel Calibration. Hold the drone perfectly still on each of 6 faces for 5 seconds each. This calibrates gravity vector alignment in each axis and removes scale factor errors.</li>
            <li><strong>Gyroscope:</strong> Place on a perfectly level, vibration-free surface. Do not touch for 60 seconds during calibration. Removes constant angular rate biases.</li>
            <li><strong>Compass (magnetometer):</strong> The "compass dance" — hold the drone at arm's length and rotate in a figure-8 pattern, covering all orientations and bank angles. Do this outdoors away from ferrous metal (vehicles, buildings, rebar). Indoor calibration is almost always invalid due to structural steel interference.</li>
            <li><strong>Thermal calibration (advanced):</strong> IMU biases shift with temperature. ArduPilot supports thermal calibration via <code>INS_TCAL_ENABLE=1</code> — power the FC from cold (~0°C) and let it warm to operating temperature while logging. The system solves a polynomial model for temperature-dependent bias correction, significantly improving cold-weather navigation accuracy.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">4.4 GPS Configuration and Time Synchronization</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Enable multi-constellation: ArduPilot parameter <code>GPS_GNSS_MODE=0</code> enables all available constellations (GPS, GLONASS, Galileo, BeiDou simultaneously). This improves position accuracy and significantly increases difficulty of GPS spoofing attacks.</li>
            <li>PPS time sync: connect the GPS module's PPS (Pulse Per Second) output pin to a Jetson GPIO. Configure <code>chrony</code> to use it as reference: add <code>refclock PPS /dev/pps0 lock GPS poll 3 dpoll -2 offset 0</code> to <code>/etc/chrony.conf</code>.</li>
            <li>Verify sync quality: <code>chronyc tracking</code> — the "System time" offset should be &lt;1 ms. Offsets &gt;10 ms cause sensor fusion timestamp errors in the EKF, producing velocity innovations that degrade GPS reliability estimates.</li>
            <li>For RTK GPS (centimeter-level accuracy): add a u-blox F9P module and connect to an NTRIP caster or local base station for RTCM correction data. This reduces position error from typical 2–3 m to 1–5 cm, enabling precision landing and tight tracking tasks.</li>
        </ul>

        <details class="code-expand">
            <summary>⚠ Common Failure Modes — Sensor Calibration Phase</summary>
            <div class="p-4 space-y-3 text-xs">
                <div class="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block">High reprojection error (&gt;1.5 px)</strong>
                    <p class="text-slate-400">Almost always caused by a non-flat calibration target (paper warped with humidity) or insufficient angular diversity in collected images. Mount the ChArUco board on rigid acrylic. Verify by re-running calibration with a new image set; if error drops, the images were the issue, not the target.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                    <strong class="text-orange-400 block">Extrinsic calibration drifting after vibration or impact</strong>
                    <p class="text-slate-400">If the camera mount is not rigid relative to the FC mount, any vibration or hard landing shifts the camera-IMU transform, invalidating the extrinsic calibration without any visible external sign. The camera and FC must be hard-mounted to each other as a unified sub-assembly before being soft-mounted to the frame.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                    <strong class="text-yellow-400 block">Compass hard iron distortion from motor wiring</strong>
                    <p class="text-slate-400">High-current motor cables create strong magnetic fields that shift the compass calibration after assembly. Always perform the compass dance in its final physical location on the fully assembled airframe with all wiring in place. Recalibrate after any significant wiring change.</p>
                </div>
            </div>
        </details>
    `,

    5: `
        <h3 class="mt-0 text-purple-400 border-none mb-2">Phase 5: Airframe Integration</h3>
        <p class="text-slate-300 text-sm mb-4">Mounting the calibrated electronic stack onto the carbon fiber frame. This phase is pure mechanical engineering — vibration isolation, EMI shielding, thermal management, and weight distribution. Poor mechanical integration defeats every software optimization from earlier phases.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">5.1 Structural Layout and Weight Distribution</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Place heaviest components (battery, companion computer) as low and central as possible. A lower Center of Mass (CoM) improves pitch and roll stability by reducing the restoring moment arm.</li>
            <li>Balance check after full assembly: rest the assembled drone on a pointed surface at the geometric center of the motor layout. It should hang approximately level. If nose-heavy, shift the battery rearward. Target: CoM within ±5 mm of geometric center in both X and Y.</li>
            <li>Top plate hosts the FC and GPS (high position, away from EMI sources). Bottom plate or belly hosts the companion computer and battery. Camera mounts on the front, angled downward or forward based on mission type.</li>
            <li>Carbon fiber is electrically conductive — never let bare wire contacts touch the frame directly. Use nylon standoffs or plastic spacers between all PCBs and carbon plate surfaces.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">5.2 Vibration Isolation Architecture</h4>
        <p class="text-slate-400 text-sm mb-2">Motor vibration frequencies range from 50–400 Hz at operating RPM. These corrupt IMU data (accelerometer saturation, gyro noise) and cause motion blur in camera images. The correct architecture uses a two-level isolation hierarchy:</p>
        <div class="insight-box mb-4">
            <div class="insight-label">Two-Level Isolation Hierarchy</div>
            <p class="text-slate-200 text-sm mt-1"><strong>Level 1 — Rigid:</strong> Camera and FC must be hard-mounted to each other to preserve the extrinsic calibration relationship established in Phase 4. Any relative movement between them invalidates the transform. <strong>Level 2 — Soft:</strong> That entire camera+FC sub-assembly is then soft-mounted to the frame via silicone grommets (Shore 30–40A hardness) to attenuate motor vibrations. Violating this hierarchy forces you to choose between good calibration and IMU data quality — you cannot have both.</p>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Validate vibration with ArduPilot's onboard FFT: enable <code>INS_LOG_BAT_MASK=3</code>, hover at normal operating throttle for 30 seconds, download .bin log, review VIBE messages. Acceptable: VIBEXY and VIBEZ all &lt;15 m/s². Above 30 m/s² is a red flag that must be resolved before flight.</li>
            <li>If vibration is high, investigate: prop balance (use a dedicated prop balancer, not just visual inspection), motor bearing wear (spin by hand and feel for roughness), loose frame screws, and frame resonance at hover RPM. Simply increasing damper hardness shifts the resonant frequency without eliminating the source.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">5.3 EMI Shielding</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li><strong>MIPI CSI camera cables:</strong> The highest-risk EMI victim. ESC PWM switching generates broadband RF that couples directly into MIPI CSI differential pairs, causing video corruption and sync loss. Wrap the entire cable length in adhesive copper foil tape and ground the tape to the companion computer chassis at one point (avoid grounding both ends — creates a ground loop).</li>
            <li><strong>Motor power cables:</strong> Route perpendicular to signal cables wherever they must cross. Minimize cable length from the main bus to each ESC. Twisted pairs on motor phase wires reduce radiated emissions.</li>
            <li><strong>GPS and compass antenna:</strong> Mount on a dedicated mast at least 10 cm above and 15 cm horizontally from all ESCs, motors, and camera cables. Add a ground plane (aluminum disc) under the GPS antenna to improve gain and reject multipath signals from below the drone.</li>
            <li><strong>Validation test:</strong> Power up all motors at 50% throttle on the bench with no props attached. Monitor the live video feed for artifacts. Check GPS satellite count — should remain stable. If video corrupts, add copper tape coverage and verify all ground connections are solid.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">5.4 Thermal Management</h4>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li>Mount the Jetson heatsink oriented to face into prop wash from the front rotors. In-flight airflow provides natural active cooling without a dedicated fan on most builds, eliminating the weight and vibration penalty of a fan.</li>
            <li>Apply a thin, uniform layer (0.3–0.5 mm) of quality thermal compound (Arctic MX-4 or equivalent) between the Jetson module and heatsink. Excess paste is worse than too little — air gaps in the compound reduce thermal conductivity.</li>
            <li>Monitor during ground runs: <code>tegrastats</code> shows temperature per component in real time. GPU junction temperature &gt;80°C triggers automatic thermal throttling (clock reduction). Temperature &gt;95°C triggers automatic shutdown. Both events cause visible AI latency spikes mid-flight.</li>
            <li>If throttling occurs during bench testing, the problem will be worse in flight (less airflow when hovering stationary). Consider a low-profile 25 mm fan for aggressive thermal profiles, or reduce <code>nvpmodel</code> power mode during sustained hover tasks.</li>
        </ul>

        <details class="code-expand">
            <summary>⚠ Common Failure Modes — Airframe Integration Phase</summary>
            <div class="p-4 space-y-3 text-xs">
                <div class="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block">IMU vibration saturation in flight logs</strong>
                    <p class="text-slate-400">VIBE values above 60 m/s² in ArduPilot logs indicate the accelerometer is clipping. This causes EKF attitude failures and erratic position estimates — potentially unrecoverable in flight. Root cause is almost always motor/prop imbalance or a frame resonance frequency that coincides with hover RPM. Must be resolved before any flight test.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                    <strong class="text-orange-400 block">CoM shift after payload change</strong>
                    <p class="text-slate-400">Swapping a camera gimbal, adding an antenna, or using a different battery shifts the CoM. After any hardware change that alters mass distribution, re-balance the drone and consider re-running PID autotune. Flying with a forward CoM bias increases nose-down attitude error and reduces maximum forward speed.</p>
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
        <p class="text-slate-300 text-sm mb-4">The first real flight, with a physical tether preventing any fly-away. This is where software meets real aerodynamics for the first time. The tether is not just a safety measure — it is a structured test protocol that allows incremental validation of the control loop, AI activation, and log analysis pipeline with minimal risk.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">6.1 Tether and Anchor Specifications</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Tether</strong>
                <p class="text-slate-400">3 mm Dyneema cord, rated &gt;200 kg breaking strength. Maximum 5 m of play from the anchor point. Splice a 1 m bungee (elastic) section between anchor and tether to absorb jerk forces. A fully rigid tether can snap the attachment point when the drone attempts a sudden direction change.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Anchor</strong>
                <p class="text-slate-400">Minimum mass: 3× the drone's All-Up Weight (AUW). A concrete anchor point is preferred. Sandbags work but must be stacked to the correct mass. Never anchor to a vehicle, person, or temporary fixture. The anchor must hold against the drone at full throttle.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Personnel Roles</strong>
                <p class="text-slate-400">Safety pilot: full RC authority at all times, thumb resting on mode switch, eyes on the drone only — never watching the telemetry screen. Observer: monitoring telemetry console and AI output. No bystanders within 10 m radius during any powered flight.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Safety Equipment</strong>
                <p class="text-slate-400">Class D dry powder fire extinguisher (or CO₂) for LiPo fires — never use water on a lithium battery fire. Fireproof LiPo containment bag for damaged batteries. First aid kit. Emergency contact numbers posted visibly at the site.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">6.2 Pre-Flight Checklist</h4>
        <ul class="list-disc pl-5 space-y-1 text-sm text-slate-400 mb-4">
            <li>Battery voltage: &gt;3.8 V/cell at rest. Check voltage under load at 30% throttle — should not drop below 3.6 V/cell.</li>
            <li>GPS lock: minimum 8 satellites, HDOP &lt;1.5 (shown in Mission Planner HUD or MAVProxy console).</li>
            <li>Companion computer: SSH in and verify all ROS 2 nodes running. Check <code>ros2 topic hz /ai/detections</code> — should match configured FPS.</li>
            <li>AI model: verify inference node log shows model loaded to GPU successfully, not falling back to CPU.</li>
            <li>RC failsafe: disable RC signal and verify drone enters RTL within 2 seconds per <code>FS_THR_ENABLE=1</code> configuration.</li>
            <li>Logging: SD card inserted in FC. ROS bag recording started on Jetson: <code>ros2 bag record -a -o /data/flight_$(date +%Y%m%d_%H%M%S)</code></li>
            <li>Props: each nut tightened to spec, props free of chips or cracks, spin freely by hand when disarmed.</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">6.3 Structured Flight Test Protocol</h4>
        <p class="text-slate-400 text-sm mb-2">Complete each step before advancing. Abort on any unexpected behavior.</p>
        <ol class="list-decimal pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li><strong>STABILIZE takeoff:</strong> Arm and take off in STABILIZE mode. Verify all motors respond correctly. No oscillation, no yaw drift at hover throttle.</li>
            <li><strong>LOITER mode:</strong> Switch to LOITER (GPS position hold). Drone should hold position within 30 cm. Watch for EKF warnings in MAVProxy. Hover for 2 minutes to verify thermal stability.</li>
            <li><strong>GUIDED activation:</strong> Switch to GUIDED. Companion computer now controls position. Verify drone does not jerk, oscillate, or accelerate on mode switch. Maintain hover command for 30 seconds.</li>
            <li><strong>AI task:</strong> Have the observer walk in a circle at 5 m distance. The AI should track the target, commanding heading and position adjustments. Monitor pixel tracking error in the AI node output. Target: &lt;50 px from frame center on a 1080p feed.</li>
            <li><strong>Abort drills:</strong> Switch instantly from GUIDED back to LOITER — must be smooth and immediate with no attitude transient. Practice this 5 times with the safety pilot. The mode switch is your abort capability.</li>
            <li><strong>Extended run:</strong> AI active in GUIDED mode for 10 continuous minutes. Monitor Jetson temperature via <code>tegrastats</code> over SSH. Verify CPU and GPU remain within safe ranges.</li>
        </ol>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">6.4 Log Analysis and Go/No-Go Criteria</h4>
        <p class="text-slate-400 text-sm mb-2">Download both the ArduPilot .bin log and the ROS bag before clearing the next phase.</p>
        <ul class="list-disc pl-5 space-y-1 text-sm text-slate-400 mb-4">
            <li>ArduPilot .bin log in Mission Planner → DataFlash Log → Review. Key plots: <code>ATT.DesRoll vs ATT.Roll</code> (attitude tracking error), <code>VIBE</code> (vibration X/Y/Z), <code>NKF1.IVN/IVE</code> (EKF velocity innovations).</li>
            <li>EKF innovations consistently &gt;0.5 m/s indicate GPS or IMU issues. Must be investigated and resolved before Phase 7.</li>
            <li>Tracking error metric: average pixel distance from target centroid to frame center over the full AI tracking session. Target: &lt;50 px at 1080p.</li>
            <li>Jetson temperature during 10-minute run: GPU junction must remain &lt;80°C throughout, not just at start.</li>
        </ul>

        <details class="code-expand">
            <summary>⚠ Common Failure Modes — Tethered Flight Phase</summary>
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
        <p class="text-slate-300 text-sm mb-4">With the tethered test proving the control loop, you now expand to untethered autonomous flight. This phase uses incremental range expansion and structured edge-case testing to build a complete performance profile. Every session produces data; every data point shapes the next session's scope.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">7.1 Prerequisites and Site Selection</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-pink-500">
                <strong class="text-pink-400 block mb-1">Regulatory Prerequisites</strong>
                <p class="text-slate-400">FAA Part 107 Remote Pilot Certificate for the safety pilot. LAANC authorization for the airspace (use FAA DroneZone). Fly only within VLOS unless a BVLOS waiver is in hand. File a NOTAM for the test area as professional courtesy to other pilots.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-pink-500">
                <strong class="text-pink-400 block mb-1">Phase 6 Go/No-Go Criteria Met</strong>
                <p class="text-slate-400">VIBE &lt;15 m/s² in logs. EKF innovations &lt;0.5 m/s consistently. AI tracking error &lt;50 px average. Jetson GPU temp &lt;80°C during 10-minute tethered run. No unresolved hardware warnings in any log.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-pink-500">
                <strong class="text-pink-400 block mb-1">Site and Weather</strong>
                <p class="text-slate-400">Open area with 100 m clearance from people and structures for Session 1. Identified landing zone and alternate abort zone. Weather: wind &lt;10 knots, visibility &gt;3 SM, no precipitation, ceiling &gt;500 ft AGL for initial sessions.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">7.2 Incremental Range Expansion Protocol</h4>
        <div class="math-block text-xs mb-4">
Session 1:   Range 30 m radius,  AGL 15 m,  Duration 10 min
             Goal: Verify AI tracking at close range, confirm GPS accuracy in the open

Session 2:   Range 100 m radius, AGL 30 m,  Duration 15 min
             Goal: Test tracking at real operational distances, measure latency vs range

Session 3:   Range 200 m radius, AGL 50 m,  Duration 20 min
             Goal: Full operational envelope, multiple target scenarios

Session 4+:  Structured edge-case testing (see 7.3)</div>
        <p class="text-slate-400 text-sm mb-3">Never increase the range by more than 3× between sessions. If any session reveals anomalies, hold at that range until root-caused. Log every session with a full ROS bag and .bin log — these are your primary analysis artifacts.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">7.3 Structured Edge Case Tests</h4>
        <p class="text-slate-400 text-sm mb-2">These scenarios will not occur naturally — they must be deliberately planned and executed:</p>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li><strong>Target occlusion:</strong> Have the target walk behind a tree or vehicle mid-track. Verify the AI holds the last-known position estimate, does not hallucinate a new target, and smoothly re-acquires when the target re-emerges. Expected behavior: 2–5 seconds of stable position hold, then controlled re-acquisition.</li>
            <li><strong>Multiple simultaneous targets:</strong> Two people cross in front of the drone at the same time. Verify the priority logic is deterministic (closest target? highest confidence? first-acquired?). The drone must not oscillate between targets — implement a minimum dwell time of 2 seconds before switching.</li>
            <li><strong>Low battery RTL during AI task:</strong> Allow the battery to reach the RTL threshold (<code>BATT_FS_LOW_VOLT</code>) during an active GUIDED mission. The drone must exit GUIDED cleanly and execute RTL — the safety failsafe must override the AI without any resistance from the companion computer.</li>
            <li><strong>GCS communications loss:</strong> Deliberately disable the telemetry radio. Verify the drone continues its AI mission autonomously if configured to do so, or enters RTL per <code>FS_GCS_ENABLE</code> setting. This tests your failsafe configuration, not just normal operation.</li>
            <li><strong>Wind gust test:</strong> If natural conditions permit (&gt;15 knots gusting), fly GUIDED mode and measure positional drift during gusts before the controller corrects. This quantifies disturbance rejection performance of the position controller.</li>
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

        <details class="code-expand">
            <summary>⚠ Common Failure Modes — Free-Flight Validation Phase</summary>
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
            </div>
        </details>
    `,

    8: `
        <h3 class="mt-0 text-teal-400 border-none mb-2">Phase 8: Regulatory Compliance &amp; Operational Deployment</h3>
        <p class="text-slate-300 text-sm mb-4">A technically proven drone is operationally useless if it cannot legally fly or be maintained long-term. This phase covers the compliance framework, operational documentation, maintenance lifecycle, and AI model update pipeline needed to sustain an AI sUAS program beyond the prototype stage.</p>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">8.1 FAA Regulatory Framework</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-teal-500">
                <strong class="text-teal-400 block mb-1">Part 107 Standard Rules</strong>
                <p class="text-slate-400">Visual line of sight, daylight only (civil twilight with anti-collision lights), max 400 ft AGL, no operations over moving vehicles or people without waiver, Remote Pilot Certificate required. Covers the vast majority of commercial and test operations.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-teal-500">
                <strong class="text-teal-400 block mb-1">Waivers for AI Mission Profiles</strong>
                <p class="text-slate-400">BVLOS (Part 107.31): the most critical waiver for autonomous AI missions. Night operations (107.29). Operations over people (107.39). Each waiver requires documenting risk mitigation measures. Processing time: 90–180 days. File during Phase 1.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-teal-500">
                <strong class="text-teal-400 block mb-1">Remote ID (Required since 2023)</strong>
                <p class="text-slate-400">All drones over 250 g must broadcast: drone ID, real-time position, velocity, altitude, and operator location via Wi-Fi or Bluetooth. Implement via a dedicated Remote ID broadcast module or ArduPilot's built-in support: set <code>RID_ENABLE=1</code> and configure <code>RID_BCAST_RATE</code>.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-teal-500">
                <strong class="text-teal-400 block mb-1">Airspace Authorization</strong>
                <p class="text-slate-400">Use LAANC (Low Altitude Authorization and Notification Capability) via FAA DroneZone or approved apps (AirMap, Aloft) for near-instant authorization in Class B/C/D/E controlled airspace. File NOTAMs for sustained test operations in uncontrolled airspace as professional courtesy to manned aviation.</p>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">8.2 Standard Operating Procedures</h4>
        <p class="text-slate-400 text-sm mb-2">Write these before the first operational mission — not after an incident forces you to:</p>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-4">
            <li><strong>Pre-mission brief checklist:</strong> Airspace authorization confirmed and printed. Weather assessed and within limits. Hazards (structures, airspace, personnel) identified on a site map. Crew briefed on emergency procedures. All crew communication radios tested.</li>
            <li><strong>Emergency procedure matrix:</strong> (a) Comms loss: drone enters RTL after configurable timeout. (b) Battery critical: automatic LAND mode activation. (c) Mechanical failure (motor loss, prop strike): safety pilot assumes manual control immediately, prepares for emergency landing. (d) Fire: all personnel upwind, call 911, never use water on LiPo fire — use dry chemical or CO₂.</li>
            <li><strong>Weather minimums:</strong> Document and enforce. Recommended minimums for AI autonomous operations: wind &lt;15 knots sustained, gusts &lt;20 knots, visibility &gt;3 SM, ceiling &gt;500 ft AGL, temperature between the Jetson's operating range of -25°C to 70°C ambient (note: LiPo capacity drops ~30% at 0°C).</li>
        </ul>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">8.3 Maintenance Schedule</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Every Flight</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1 mt-1">
                    <li>Visual inspection: frame cracks, prop integrity, wiring</li>
                    <li>Battery: check cell voltage balance, inspect for swelling</li>
                    <li>Camera lens: clean with air blower (never touch with fingers)</li>
                    <li>Post-flight: discharge to storage voltage (3.75–3.80 V/cell) if not flying within 48 hours</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-white block mb-1">Every 25 Flight Hours</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1 mt-1">
                    <li>Motor bearings: spin by hand, feel for roughness or axial play</li>
                    <li>Motor resistance: measure phase-to-phase with multimeter (all three phases should match ±0.05 Ω)</li>
                    <li>Re-torque all structural screws to manufacturer spec with thread-lock</li>
                    <li>Inspect all connector crimps for cold joints or corrosion</li>
                    <li>Recalibrate compass if operating near new structures</li>
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
                </ul>
            </div>
        </div>

        <h4 class="text-white text-sm font-semibold mt-4 mb-2">8.4 AI Model CI/CD Pipeline</h4>
        <p class="text-slate-400 text-sm mb-2">AI model updates are software releases. Treat them with the same rigor as firmware updates:</p>
        <div class="math-block text-xs mb-4">
AI Model Update Pipeline:

1. Retrain model (new data, architecture change, or hyperparameter update)
2. Automated benchmark on frozen test set:
   → must meet or exceed baseline mAP50 by defined margin (e.g., +1%)
3. Deploy to SITL: run full 50-episode regression suite automatically
   → zero fly-away events, latency &lt;100 ms, tracking error &lt;50 px
4. Human review: sample 10% of SITL episode recordings for qualitative review
5. Tethered flight re-validation (Phase 6 subset: 3 AI tracking sessions)
6. OTA deployment:
   → rsync new model weights to /opt/models/current/ on companion computer
   → restart inference systemd service
   → heightened monitoring for first 5 minutes of next operational mission</div>
        <p class="text-slate-400 text-sm mb-2">Use <strong>active learning</strong> to continuously improve the model: configure the inference node to flag detections with confidence &lt;0.60 for human review and optional labeling. These low-confidence cases are the highest-value additions to the next training dataset — they represent the edge of the model's current capability.</p>

        <details class="code-expand">
            <summary>⚠ Common Failure Modes — Operational Deployment Phase</summary>
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
