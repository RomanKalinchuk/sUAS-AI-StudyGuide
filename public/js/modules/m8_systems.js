export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 8</span>
    <div class="inline-flex items-center gap-2 bg-sky-900/30 border border-sky-700/50 rounded px-3 py-1 mb-3 text-xs font-mono text-sky-400">Topology diagram shows PX4 stack · NuttX RTOS — ArduPilot uses ChibiOS (see Module 5)</div>
    <h2>Data Links & Topology</h2>
    <p>A high-performance AI brain is useless if the nervous system is slow. Drone topology dictates how sensor data flows into the AI pipeline, how processed commands flow back to actuators, and how the aircraft communicates with the outside world. This module covers every layer of the drone data stack: physical interfaces, internal buses, protocol bridges, video pipelines, timing architecture, and bandwidth budgeting — with production-accurate 2025–2026 values throughout.</p>

    <h3>8.1 Physical Interface Standards</h3>
    <p>Internal drone communication spans several physical layers, each optimised for a different tradeoff: bandwidth, determinism, cable reach, power draw, and EMI tolerance. Choosing the wrong interface for a sensor creates hard-to-diagnose bottlenecks that only surface at full flight rate.</p>

    <table class="w-full text-left border-collapse mt-6 mb-8 text-sm">
        <thead>
            <tr class="bg-slate-800 text-sky-400">
                <th class="p-3 border border-slate-700">Protocol</th>
                <th class="p-3 border border-slate-700">Bandwidth</th>
                <th class="p-3 border border-slate-700">Latency</th>
                <th class="p-3 border border-slate-700">Primary Drone Use Case</th>
            </tr>
        </thead>
        <tbody class="text-slate-300 font-mono">
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">MIPI CSI-2<br><span class="text-slate-500 text-xs font-normal">D-PHY v1.2</span></td>
                <td class="p-3 border border-slate-700">Up to 10 Gbps<br><span class="text-slate-400 text-xs">(4-lane D-PHY)</span></td>
                <td class="p-3 border border-slate-700 text-emerald-400">Microseconds</td>
                <td class="p-3 border border-slate-700">Direct camera-to-SoC connection. Bypasses USB overhead entirely. Mandatory for high-speed VSLAM. Max cable length ~15 cm. Jetson Orin AGX supports 16 CSI-2 lanes (8 virtual channels) feeding the dedicated ISP in hardware.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white font-bold">MIPI CSI-2<br><span class="text-slate-500 text-xs font-normal">C-PHY v2.0</span></td>
                <td class="p-3 border border-slate-700">Up to 40 Gbps<br><span class="text-slate-400 text-xs">(4-lane C-PHY)</span></td>
                <td class="p-3 border border-slate-700 text-emerald-400">Microseconds</td>
                <td class="p-3 border border-slate-700">Next-gen: 4K 120fps multi-camera arrays. C-PHY uses 3-phase signalling on 2 wires per lane — higher bit density than D-PHY. Required for 8-camera AI perception suites on large autonomous platforms.</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">MIPI A-PHY<br><span class="text-slate-500 text-xs font-normal">v1.1 (2022)</span></td>
                <td class="p-3 border border-slate-700">Up to 16 Gbps<br><span class="text-slate-400 text-xs">(per lane, 32 Gbps dual)</span></td>
                <td class="p-3 border border-slate-700 text-emerald-400">Microseconds</td>
                <td class="p-3 border border-slate-700">Long-reach camera links up to 15 m over shielded cable. Automotive-grade EMI immunity. Used in VTOL fixed-wings where the nose camera is physically distant from the avionics bay. Carries CSI-2 + I2C control + power over one cable.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white font-bold">USB 3.2<br><span class="text-slate-500 text-xs font-normal">Gen 2×2</span></td>
                <td class="p-3 border border-slate-700">20 Gbps</td>
                <td class="p-3 border border-slate-700 text-amber-400">1–5 ms</td>
                <td class="p-3 border border-slate-700">Smart depth cameras (OAK-D Lite, RealSense D435i), USB SDRs, Hailo-8 USB AI accelerator. USB protocol overhead (~5% CPU, non-zero latency jitter) prevents use for raw high-speed streams but is fine for compressed or post-processed output.</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">PCIe 3.0<br><span class="text-slate-500 text-xs font-normal">×4 / ×8</span></td>
                <td class="p-3 border border-slate-700">32 Gbps (×4)<br>64 Gbps (×8)</td>
                <td class="p-3 border border-slate-700 text-emerald-400">&lt;1 µs (DMA)</td>
                <td class="p-3 border border-slate-700">M.2 NVMe logging drives (Sony PSLX → &gt;1 GB/s sustained write), M.2 AI accelerators (Hailo-8L M.2, Coral M.2). Jetson Orin AGX exposes PCIe 4.0 ×8; Orin NX exposes PCIe 3.0 ×4. Critical for full-fidelity multi-camera data recording.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white font-bold">100BASE-T1<br><span class="text-slate-500 text-xs font-normal">IEEE 802.3bw</span></td>
                <td class="p-3 border border-slate-700">100 Mbps FD</td>
                <td class="p-3 border border-slate-700 text-emerald-400">Deterministic</td>
                <td class="p-3 border border-slate-700">Single unshielded twisted pair (UTP), up to 15 m. Automotive-grade companion↔FC link on Pixhawk 6X (Holybro Ethernet adapter). Enables MAVLink over UDP at full bandwidth with no UART baud-rate ceiling. Also used for smart payload interfaces.</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">1000BASE-T1<br><span class="text-slate-500 text-xs font-normal">IEEE 802.3bp</span></td>
                <td class="p-3 border border-slate-700">1 Gbps FD</td>
                <td class="p-3 border border-slate-700 text-emerald-400">Deterministic</td>
                <td class="p-3 border border-slate-700">Gigabit over single pair, up to 40 m. Preferred for high-bandwidth companion↔FC links on larger platforms. Enables Micro XRCE-DDS over UDP with zero-copy DMA between SoC NIC and DDS middleware. Pixhawk 6X supports this natively.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white font-bold">SPI<br><span class="text-slate-500 text-xs font-normal">up to 50 MHz</span></td>
                <td class="p-3 border border-slate-700">~200 Mbps</td>
                <td class="p-3 border border-slate-700 text-emerald-400">&lt;1 µs</td>
                <td class="p-3 border border-slate-700">High-speed IMU (ICM-42688-P at 8 kHz ODR uses SPI at 24 MHz), barometers (BMP388), SPI NOR flash for blackbox logging. Used inside FC between STM32 and IMU silicon. Full-duplex synchronous. Max useful cable length ~30 cm without level shifters.</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">I2C<br><span class="text-slate-500 text-xs font-normal">Fast-Mode+ 3.4 MHz</span></td>
                <td class="p-3 border border-slate-700">~3.4 Mbps</td>
                <td class="p-3 border border-slate-700 text-amber-400">Low</td>
                <td class="p-3 border border-slate-700">Magnetometers (IST8310, QMC5883L), external barometers (MS5611), battery fuel gauges (BQ40Z80). Up to 127 devices on one shared bus. Too slow for latency-critical sensor data — never put IMU on I2C in a production AI drone. Max useful cable length ~1 m.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white font-bold">UART<br><span class="text-slate-500 text-xs font-normal">921600 baud</span></td>
                <td class="p-3 border border-slate-700">~1 Mbps</td>
                <td class="p-3 border border-slate-700 text-amber-400">Byte-level (~1 ms)</td>
                <td class="p-3 border border-slate-700">Legacy MAVLink bridge between FC and companion computer. Being supplanted by Micro XRCE-DDS on PX4 v1.14+ and ArduPilot 4.5+. Still required for ArduPilot GUIDED mode, serial-only GPS (NMEA), SiK radio modules, and some telemetry radios (RFD900x).</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">DroneCAN<br><span class="text-slate-500 text-xs font-normal">CAN 2.0B / CAN FD</span></td>
                <td class="p-3 border border-slate-700">1 Mbps (2.0B)<br>8 Mbps (FD)</td>
                <td class="p-3 border border-slate-700 text-emerald-400">Deterministic (&lt;1 ms)</td>
                <td class="p-3 border border-slate-700">Smart ESCs (Zubax Myxa, Kotleta20), RTK GPS (Zubax GNSS 2.0), airspeed sensors, rangefinders. Highly EMI resistant — mandatory on large aircraft where motor wiring and power bus create interference. Up to 64 nodes. CAN FD extends payload to 64 bytes and up to 8 Mbps.</td>
            </tr>
        </tbody>
    </table>

    <h3>8.2 Complete System Topology</h3>
    <p>The following diagram maps the canonical data flow architecture for a modern AI autonomous drone. Physical interfaces are labelled on each link. Sensor data flows upward through AI processing to external communication; actuation commands flow downward from the flight controller to motors and servos.</p>

    <div class="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8 overflow-x-auto">
        <!-- SENSOR LAYER -->
        <div class="text-center text-xs font-mono text-slate-500 mb-3" style="letter-spacing:0.1em;">─── SENSOR LAYER ───</div>
        <div class="flex flex-wrap gap-3 mb-2" style="justify-content:center;">
            <div class="bg-indigo-900/40 border border-indigo-700 rounded px-3 py-2 text-xs text-center font-mono" style="min-width:90px;">
                <div class="text-indigo-300 font-bold">Camera ×4</div>
                <div class="text-slate-400 text-xs">IMX219 / OV9782</div>
            </div>
            <div class="bg-indigo-900/40 border border-indigo-700 rounded px-3 py-2 text-xs text-center font-mono" style="min-width:90px;">
                <div class="text-indigo-300 font-bold">Depth Cam</div>
                <div class="text-slate-400 text-xs">OAK-D / D435i</div>
            </div>
            <div class="bg-indigo-900/40 border border-indigo-700 rounded px-3 py-2 text-xs text-center font-mono" style="min-width:90px;">
                <div class="text-indigo-300 font-bold">LiDAR</div>
                <div class="text-slate-400 text-xs">Livox Mid-360</div>
            </div>
            <div class="bg-purple-900/40 border border-purple-700 rounded px-3 py-2 text-xs text-center font-mono" style="min-width:90px;">
                <div class="text-purple-300 font-bold">IMU ×2</div>
                <div class="text-slate-400 text-xs">ICM-42688-P</div>
            </div>
            <div class="bg-purple-900/40 border border-purple-700 rounded px-3 py-2 text-xs text-center font-mono" style="min-width:90px;">
                <div class="text-purple-300 font-bold">RTK GPS</div>
                <div class="text-slate-400 text-xs">u-blox F9P</div>
            </div>
            <div class="bg-purple-900/40 border border-purple-700 rounded px-3 py-2 text-xs text-center font-mono" style="min-width:90px;">
                <div class="text-purple-300 font-bold">Barometer</div>
                <div class="text-slate-400 text-xs">MS5611 / BMP388</div>
            </div>
        </div>
        <!-- Bus label row -->
        <div class="text-xs font-mono mb-1" style="display:flex; justify-content:center; gap:2rem;">
            <span class="text-sky-400">CSI-2 (cameras)</span>
            <span class="text-sky-400">USB 3.x (depth)</span>
            <span class="text-amber-400">SPI 8 kHz (IMU)</span>
            <span class="text-amber-400">CAN/I2C (periph)</span>
        </div>
        <div class="text-slate-500 text-center mb-2" style="font-size:1.4rem;">↓ ↓ ↓ ↓ ↓ ↓</div>

        <!-- COMPANION COMPUTER -->
        <div class="border border-sky-500 rounded-xl p-4 mb-2" style="margin-left:1rem; margin-right:1rem; background:rgba(14,165,233,0.06);">
            <div class="text-sky-300 font-bold text-center mb-1">COMPANION COMPUTER (SoC)</div>
            <div class="text-xs text-slate-400 text-center mb-3">Jetson Orin AGX 64 GB — RK3588 — Intel Core Ultra 7</div>
            <div class="flex flex-wrap gap-2" style="justify-content:center;">
                <span class="bg-sky-900/50 border border-sky-700 rounded px-2 py-1 text-sky-300 text-xs font-mono">ROS 2 Humble</span>
                <span class="bg-sky-900/50 border border-sky-700 rounded px-2 py-1 text-sky-300 text-xs font-mono">CycloneDDS / FastDDS</span>
                <span class="bg-sky-900/50 border border-sky-700 rounded px-2 py-1 text-sky-300 text-xs font-mono">TensorRT / ONNX RT</span>
                <span class="bg-sky-900/50 border border-sky-700 rounded px-2 py-1 text-sky-300 text-xs font-mono">SLAM Pipeline</span>
                <span class="bg-sky-900/50 border border-sky-700 rounded px-2 py-1 text-sky-300 text-xs font-mono">Path Planner</span>
                <span class="bg-sky-900/50 border border-sky-700 rounded px-2 py-1 text-sky-300 text-xs font-mono">XRCE-DDS Agent</span>
            </div>
        </div>

        <!-- XRCE-DDS link -->
        <div class="text-center text-xs font-mono text-amber-400 mb-0">▲ Micro XRCE-DDS over UDP (Ethernet) or UART Serial ▼</div>
        <div class="text-slate-500 text-center mb-2" style="font-size:1.4rem;">↕</div>

        <!-- FLIGHT CONTROLLER -->
        <div class="border border-emerald-700 rounded-xl p-4 mb-2" style="margin-left:2.5rem; margin-right:2.5rem; background:rgba(52,211,153,0.05);">
            <div class="text-emerald-300 font-bold text-center mb-1">FLIGHT CONTROLLER MCU</div>
            <div class="text-xs text-slate-400 text-center mb-3">Pixhawk 6C · STM32H7 @ 480 MHz · NuttX RTOS</div>
            <div class="flex flex-wrap gap-2" style="justify-content:center;">
                <span class="bg-emerald-900/40 border border-emerald-700 rounded px-2 py-1 text-emerald-300 text-xs font-mono">uORB pub/sub</span>
                <span class="bg-emerald-900/40 border border-emerald-700 rounded px-2 py-1 text-emerald-300 text-xs font-mono">EKF2 @ 250 Hz</span>
                <span class="bg-emerald-900/40 border border-emerald-700 rounded px-2 py-1 text-emerald-300 text-xs font-mono">PID loops @ 1 kHz</span>
                <span class="bg-emerald-900/40 border border-emerald-700 rounded px-2 py-1 text-emerald-300 text-xs font-mono">Failsafe logic</span>
                <span class="bg-emerald-900/40 border border-emerald-700 rounded px-2 py-1 text-emerald-300 text-xs font-mono">Mixer / DShot600</span>
                <span class="bg-emerald-900/40 border border-emerald-700 rounded px-2 py-1 text-emerald-300 text-xs font-mono">XRCE-DDS client</span>
            </div>
        </div>

        <!-- DroneCAN link -->
        <div class="text-center text-xs font-mono text-rose-400 mb-0">▼ DroneCAN — 1 Mbps CAN 2.0B / 8 Mbps CAN FD ▼</div>
        <div class="text-slate-500 text-center mb-2" style="font-size:1.4rem;">↓</div>

        <!-- ACTUATOR LAYER -->
        <div class="text-center text-xs font-mono text-slate-500 mb-3" style="letter-spacing:0.1em;">─── ACTUATOR LAYER ───</div>
        <div class="flex flex-wrap gap-3 mb-4" style="justify-content:center;">
            <div class="bg-rose-900/40 border border-rose-700 rounded px-3 py-2 text-xs text-center font-mono" style="min-width:90px;">
                <div class="text-rose-300 font-bold">Smart ESC ×4</div>
                <div class="text-slate-400 text-xs">Zubax Myxa / Kotleta20</div>
            </div>
            <div class="bg-rose-900/40 border border-rose-700 rounded px-3 py-2 text-xs text-center font-mono" style="min-width:90px;">
                <div class="text-rose-300 font-bold">Gimbal Ctrl</div>
                <div class="text-slate-400 text-xs">Servo / SBus / CAN</div>
            </div>
            <div class="bg-rose-900/40 border border-rose-700 rounded px-3 py-2 text-xs text-center font-mono" style="min-width:90px;">
                <div class="text-rose-300 font-bold">Payload Bus</div>
                <div class="text-slate-400 text-xs">PWM / DShot / CAN</div>
            </div>
        </div>

        <!-- EXTERNAL C2 -->
        <div class="border-t border-slate-700" style="padding-top:1rem;">
            <div class="text-xs text-center text-slate-500 font-mono mb-3">─── EXTERNAL C2 & DOWNLINKS ───</div>
            <div class="flex flex-wrap gap-3" style="justify-content:center;">
                <div class="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-xs text-center font-mono">
                    <div class="text-amber-300 font-bold">GCS / Pilot</div>
                    <div class="text-slate-400">MAVLink UDP</div>
                </div>
                <div class="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-xs text-center font-mono">
                    <div class="text-amber-300 font-bold">Video GCS</div>
                    <div class="text-slate-400">RTSP H.265</div>
                </div>
                <div class="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-xs text-center font-mono">
                    <div class="text-amber-300 font-bold">LTE / 5G</div>
                    <div class="text-slate-400">BVLOS C2</div>
                </div>
                <div class="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-xs text-center font-mono">
                    <div class="text-amber-300 font-bold">ELRS 900 MHz</div>
                    <div class="text-slate-400">RC / backup C2</div>
                </div>
                <div class="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-xs text-center font-mono">
                    <div class="text-amber-300 font-bold">OpenDroneID</div>
                    <div class="text-slate-400">WiFi NaN + BT 5.0</div>
                </div>
            </div>
        </div>
    </div>

    <h3>8.3 MAVLink Protocol Deep Dive</h3>
    <p>MAVLink (Micro Air Vehicle Link) is the lingua franca of open-source drone communication — a lightweight, header-only message marshalling library first released in 2009 by Lorenz Meier. MAVLink v2 (2017) added 24-bit message IDs (from 8-bit v1), optional 13-byte packet signing for authentication, and per-field zero-trimming to reduce payload size. When an AI Python script or ROS 2 node needs to command a flight controller, it constructs a specific MAVLink binary packet and sends it over UDP, UART, or USB.</p>

    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block bg-[#0d1117] border-slate-700 mb-8">
        <h4 class="mt-0 text-sky-400 text-sm mb-3">Packet Anatomy: MAVLink v2 Frame</h4>
        <div class="flex flex-wrap gap-2 text-xs font-mono mb-4">
            <span class="bg-rose-900/40 text-rose-300 p-2 border border-rose-700 rounded">STX<br>0xFD<br>1 B</span>
            <span class="bg-slate-800 text-slate-300 p-2 border border-slate-600 rounded">LEN<br>payload<br>1 B</span>
            <span class="bg-slate-800 text-slate-300 p-2 border border-slate-600 rounded">INC<br>FLAGS<br>1 B</span>
            <span class="bg-slate-800 text-slate-300 p-2 border border-slate-600 rounded">COMP<br>FLAGS<br>1 B</span>
            <span class="bg-slate-800 text-slate-300 p-2 border border-slate-600 rounded">SEQ<br>0–255<br>1 B</span>
            <span class="bg-indigo-900/40 text-indigo-300 p-2 border border-indigo-700 rounded">SYS<br>ID<br>1 B</span>
            <span class="bg-indigo-900/40 text-indigo-300 p-2 border border-indigo-700 rounded">COMP<br>ID<br>1 B</span>
            <span class="bg-amber-900/40 text-amber-300 p-2 border border-amber-700 rounded">MSG ID<br>(3 bytes)<br>24-bit</span>
            <span class="bg-emerald-900/40 text-emerald-300 p-2 border border-emerald-700 rounded flex-grow">PAYLOAD<br>0 – 255 bytes<br>(trimmed)</span>
            <span class="bg-purple-900/40 text-purple-300 p-2 border border-purple-700 rounded">CKSUM<br>CRC-16<br>2 B</span>
            <span class="bg-rose-900/40 text-rose-300 p-2 border border-rose-700 rounded">SIG<br>optional<br>13 B</span>
        </div>
        <p class="text-slate-400 text-xs mt-2">
            Header overhead: 12 bytes minimum (10 header + 2 CRC). Payload up to 255 bytes; zero-trimming removes trailing zero bytes automatically.
            SEQ wraps at 255 per-channel; gaps in SEQ detect dropped packets.
            Signature adds 13 bytes (link ID + timestamp + HMAC-SHA256 truncated) when COMP_FLAGS bit 0 is set.
        </p>
    </div>
</details>

    <h4>Key MAVLink Message IDs for AI Integration</h4>
    <table class="w-full text-left border-collapse mt-4 mb-8 text-sm">
        <thead>
            <tr class="bg-slate-800 text-sky-400">
                <th class="p-3 border border-slate-700">MSG ID</th>
                <th class="p-3 border border-slate-700">Name</th>
                <th class="p-3 border border-slate-700">Direction</th>
                <th class="p-3 border border-slate-700">AI Pipeline Role</th>
            </tr>
        </thead>
        <tbody class="text-slate-300 font-mono text-xs">
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white">0</td>
                <td class="p-3 border border-slate-700">HEARTBEAT</td>
                <td class="p-3 border border-slate-700 text-sky-400">Bidirectional</td>
                <td class="p-3 border border-slate-700">Must be sent at 1 Hz to maintain link presence. Contains autopilot type, base mode (armed flag), custom mode. AI companion node must also send HEARTBEAT using COMP_ID=191 (ONBOARD_COMPUTER) to be recognised on the MAVLink network.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white">30</td>
                <td class="p-3 border border-slate-700">ATTITUDE</td>
                <td class="p-3 border border-slate-700 text-sky-400">FC → CC</td>
                <td class="p-3 border border-slate-700">Roll, pitch, yaw Euler angles + body rates (rad/s). Used as ground truth label source for manoeuvre classifiers and as EKF2 attitude feedback for companion-computer-based state estimators.</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white">32</td>
                <td class="p-3 border border-slate-700">LOCAL_POSITION_NED</td>
                <td class="p-3 border border-slate-700 text-sky-400">FC → CC</td>
                <td class="p-3 border border-slate-700">NED position (m) + velocity (m/s) in local frame. Primary input for trajectory planning nodes. Prefer this over GLOBAL_POSITION_INT for control — it avoids WGS-84 ↔ NED conversion overhead.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white">33</td>
                <td class="p-3 border border-slate-700">GLOBAL_POSITION_INT</td>
                <td class="p-3 border border-slate-700 text-sky-400">FC → CC</td>
                <td class="p-3 border border-slate-700">WGS-84 lat/lon (1e-7 deg units) + altitude (mm) + relative alt. Used for geofence enforcement, mission coordinate transforms, and Remote ID broadcast compliance checks.</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white">76</td>
                <td class="p-3 border border-slate-700">COMMAND_LONG</td>
                <td class="p-3 border border-slate-700 text-rose-400">CC → FC</td>
                <td class="p-3 border border-slate-700">Send any MAV_CMD (arm, takeoff, set mode, loiter, RTL). Requires acknowledgement via COMMAND_ACK (ID 77). Implement timeout + exponential retry in AI node — FC may drop commands during high CPU load.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white">84</td>
                <td class="p-3 border border-slate-700">SET_POSITION_TARGET_LOCAL_NED</td>
                <td class="p-3 border border-slate-700 text-rose-400">CC → FC</td>
                <td class="p-3 border border-slate-700">The primary AI command message. 16-bit type_mask selects active fields (position, velocity, acceleration, yaw, yaw_rate). AI calculates target position/velocity and populates NED frame fields. Send at 20–50 Hz. FC ignores fields with type_mask bit set.</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white">87</td>
                <td class="p-3 border border-slate-700">SET_ATTITUDE_TARGET</td>
                <td class="p-3 border border-slate-700 text-rose-400">CC → FC</td>
                <td class="p-3 border border-slate-700">Direct quaternion + thrust attitude command. Used when AI computes attitude directly — RL-based agile manoeuvre controllers, aerobatic policy networks, or emergency attitude recovery. Bypasses FC position controller.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white">105</td>
                <td class="p-3 border border-slate-700">HIGHRES_IMU</td>
                <td class="p-3 border border-slate-700 text-sky-400">FC → CC</td>
                <td class="p-3 border border-slate-700">Full IMU data: 3-axis accel, 3-axis gyro, 3-axis mag, temperature, baro. Publishable at up to 1 kHz over DDS; ~200 Hz typical over 921600-baud UART. Input to companion-side EKF or VIO pre-integration.</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white">147</td>
                <td class="p-3 border border-slate-700">BATTERY_STATUS</td>
                <td class="p-3 border border-slate-700 text-sky-400">FC → CC</td>
                <td class="p-3 border border-slate-700">Per-cell voltage array (mV), total current (mA), consumed charge (mAh), battery temperature. AI mission planner monitors this to trigger failsafe RTL when estimated remaining flight time drops below a configurable threshold.</td>
            </tr>
        </tbody>
    </table>

    <h4>MAVLink Routing & the mavlink-router Daemon</h4>
    <p>MAVLink has no topology discovery. Routing is address-based: every message carries (SYS_ID, COMP_ID) for source and destination. Broadcast destination is SYS_ID=0, COMP_ID=0. The flight controller uses SYS_ID=1 by default. GCS uses SYS_ID=255. An AI companion node should identify as SYS_ID=1, COMP_ID=191 (MAV_COMP_ID_ONBOARD_COMPUTER). The <code>mavlink-router</code> daemon on the companion computer routes MAVLink packets between all endpoints simultaneously — no exclusive-access UART ownership.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">mavlink-router: dual-path C2 (UART FC + LTE GCS + local AI stack)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># /etc/mavlink-router/main.conf
[General]
TcpServerPort = 5760

[UartEndpoint FC]
Device = /dev/ttyACM0       # Pixhawk USB-serial
Baud   = 921600

[UdpEndpoint GCS_LTE]       # Primary path: LTE → cloud VPN → GCS
Mode    = normal
Address = 10.0.0.1          # VPN tunnel endpoint
Port    = 14550

[UdpEndpoint AI_Stack]      # AI ROS 2 / Python stack on localhost
Mode    = normal
Address = 127.0.0.1
Port    = 14552

# mavlink-router forwards every packet to ALL endpoints simultaneously.
# PX4 failsafe triggers if HEARTBEAT absent for COM_DL_LOSS_T seconds.
# Set COM_DL_LOSS_T = 10 for BVLOS; 3 for VLOS testing.</code></pre>
</details>
        </div>
    </div>

    <h3>8.4 DroneCAN / OpenCyphal (UAVCAN v1)</h3>
    <p>DroneCAN (formerly UAVCAN v0) is the standard peripheral bus for open-source drone platforms — a full application layer over CAN that provides typed messages, node health monitoring, and firmware update over the bus. OpenCyphal (UAVCAN v1, ratified 2022) extends this with CAN FD support, UDP transport, and a redesigned port/subject model. PX4 has supported DroneCAN since v1.9; ArduPilot since v3.x.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
        <div class="bg-slate-900 p-5 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2">DroneCAN (UAVCAN v0) — Production Standard 2025</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>• Transport: CAN 2.0B (29-bit extended IDs, 8-byte frames)</li>
                <li>• Node IDs: 1–127 (dynamic allocation or manual)</li>
                <li>• Key types: uavcan.equipment.esc.*, uavcan.equipment.gnss.*</li>
                <li>• Max bus speed: 1 Mbps; max 64 nodes per segment</li>
                <li>• Hardware: Zubax Myxa ESC, Zubax GNSS 2.0, mRo GPS, Avionics Anonymous</li>
                <li>• PX4: UAVCAN_ENABLE = 2 (sensors + outputs)</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-5 rounded border border-emerald-800">
            <strong class="text-emerald-400 block mb-2">OpenCyphal (UAVCAN v1) — Next Generation</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>• Transport: CAN FD (64-byte frames, up to 8 Mbps) or Ethernet UDP</li>
                <li>• Port IDs replace node IDs: services + subjects model</li>
                <li>• Namespace: uavcan.node.*, reg.udral.physics.*, reg.udral.service.*</li>
                <li>• DSDL compiler: Nunavut (C / C++ / Python code generation)</li>
                <li>• PX4 v1.15+: experimental CAN FD + OpenCyphal support</li>
                <li>• Standard firmware update (bootloader spec built in)</li>
            </ul>
        </div>
    </div>

    <h4>DroneCAN Bus Engineering Rules</h4>
    <ul class="text-slate-300 text-sm space-y-2">
        <li><strong>Termination:</strong> Both physical ends of the CAN segment require 120 Ω termination resistors. Pixhawk 6C has solder-jumper selectable termination. External nodes (ESCs, GPS) need external 120 Ω if they are the last node. Missing termination causes reliable 25% packet loss at 1 Mbps.</li>
        <li><strong>Cable type:</strong> Use twisted-pair for CAN H/CAN L. Flat ribbon cable or untwisted wire next to power wiring causes common-mode noise. Recommended: ≥22 AWG twisted-pair, shielded on &gt;30 cm runs.</li>
        <li><strong>Bus length vs speed:</strong> 1 Mbps → max ~40 m; 500 kbps → max ~100 m; 125 kbps → max ~500 m. Propagation delay must be &lt;5% of bit time.</li>
        <li><strong>Dynamic node ID allocation:</strong> PX4 auto-allocates DroneCAN node IDs using the UAVCAN DNIA protocol. IDs are saved to <code>uavcan_node_ids.db</code> on SD card. Prefer manual assignment for production deployments — prevents ID churn after SD card replacement.</li>
        <li><strong>ESC telemetry feedback:</strong> DroneCAN smart ESCs return per-motor RPM, phase current, bus voltage, MCU temperature, and error flags at 100–500 Hz. This enables per-motor fault detection, propeller-loss detection, and motor health monitoring in the AI mission manager.</li>
    </ul>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">PX4 DroneCAN setup and ESC telemetry via ROS 2 DDS</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># PX4 parameter setup (QGC Parameters tab or MAVLink shell):
# UAVCAN_ENABLE    = 2   (enable sensors + ESC outputs)
# UAVCAN_ESC_IDLT  = 1   (ESC idle output on arming)
# UAVCAN_BITRATE   = 1000000  (1 Mbps)
# UAVCAN_NODE_ID   = 1   (FC node ID)

# PX4 DDS bridge republishes DroneCAN ESC status as ROS 2 topic:
ros2 topic echo /fmu/out/esc_status
# Fields per ESC: rpm, current (A), voltage (V), temperature (K), error_count

# Monitor DroneCAN bus live — install yakut (OpenCyphal Python tool):
pip install yakut
yakut monitor   # shows all node health + transfer counts in terminal

# Check node ID allocation table:
ros2 param get /fmu/out/uavcan_node_ids uavcan_node_ids</code></pre>
</details>
        </div>
    </div>

    <h3>8.5 DDS Middleware & ROS 2 QoS Profiles</h3>
    <p>Inside the companion computer, data does not flow sequentially through a queue. ROS 2 uses DDS (Data Distribution Service), an OMG-standard decentralised pub/sub middleware. Any node publishes to a topic; any node subscribes to any topic; no central broker exists. The two dominant DDS implementations on drone platforms are <strong>FastDDS</strong> (eProsima, the ROS 2 default) and <strong>CycloneDDS</strong> (Eclipse/ZettaScale, preferred for real-time).</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
        <div class="bg-slate-900 p-5 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">FastDDS (eProsima) — ROS 2 Default RMW</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>• Default in ROS 2 Humble, Iron, Jazzy</li>
                <li>• Full DDS spec compliance including DDS-Security</li>
                <li>• XML profile config: FASTDDS_DEFAULT_PROFILES_FILE</li>
                <li>• Good for &lt;50 topics; overhead grows with topic count</li>
                <li>• Use with: Micro XRCE-DDS agent (same vendor, lower overhead)</li>
                <li>• Shared memory transport available but less mature than CycloneDDS</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-5 rounded border border-emerald-800">
            <strong class="text-emerald-400 block mb-2">CycloneDDS (Eclipse) — Real-Time Preferred</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>• Lower latency and jitter than FastDDS under load</li>
                <li>• IOCS (iceoryx) shared-memory: zero-copy within same host</li>
                <li>• Config: CYCLONEDDS_URI pointing to XML config file</li>
                <li>• Used by Nav2, Autoware.Universe, Isaac ROS 3.x</li>
                <li>• export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp</li>
                <li>• Recommended with RT kernel on Jetson Orin for SLAM</li>
            </ul>
        </div>
    </div>

    <h4>ROS 2 QoS Profiles for Drone Topics</h4>
    <p>QoS (Quality of Service) policies are critical. Wrong QoS settings cause silent data loss or unbounded memory growth. PX4 <code>/fmu/out/</code> topics use specific profiles — a subscriber QoS mismatch silently receives zero messages with no error log. Always match publisher QoS exactly when subscribing to PX4 topics.</p>

    <table class="w-full text-left border-collapse mt-4 mb-8 text-sm">
        <thead>
            <tr class="bg-slate-800 text-sky-400">
                <th class="p-3 border border-slate-700">QoS Policy</th>
                <th class="p-3 border border-slate-700">Setting</th>
                <th class="p-3 border border-slate-700">When to Use on Drones</th>
            </tr>
        </thead>
        <tbody class="text-slate-300 font-mono text-xs">
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white">Reliability</td>
                <td class="p-3 border border-slate-700 text-sky-400">BEST_EFFORT</td>
                <td class="p-3 border border-slate-700">IMU, sensor data, position estimates, video frames. Drop stale messages rather than queue them. Matches PX4 /fmu/out/* default. Missing one IMU sample at 250 Hz is safe; stale queued data 200ms old is dangerous.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white">Reliability</td>
                <td class="p-3 border border-slate-700 text-amber-400">RELIABLE</td>
                <td class="p-3 border border-slate-700">Mission waypoints, arming commands, parameter updates. Every message must arrive. Retransmission cost is acceptable because these messages are infrequent (&lt;1 Hz). Use for /fmu/in/ setpoint topics.</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white">Durability</td>
                <td class="p-3 border border-slate-700 text-sky-400">VOLATILE</td>
                <td class="p-3 border border-slate-700">All real-time sensor topics. Never cache for late-joining subscribers — a new node subscribing to /fmu/out/vehicle_attitude should receive live data, not a stale reading from 500 ms ago.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white">Durability</td>
                <td class="p-3 border border-slate-700 text-amber-400">TRANSIENT_LOCAL</td>
                <td class="p-3 border border-slate-700">Map data, mission plans, configuration topics. New subscribers receive the last published value immediately on connect — essential for map servers and costmap publishers in Nav2 integration.</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white">History</td>
                <td class="p-3 border border-slate-700 text-emerald-400">KEEP_LAST(1)</td>
                <td class="p-3 border border-slate-700">All sensor topics on embedded hardware. Queue depth 1 means only the latest message is held per subscriber — prevents unbounded memory growth. Never use KEEP_ALL on a drone sensor topic; it will exhaust RAM under brief CPU spike.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white">Deadline</td>
                <td class="p-3 border border-slate-700 text-rose-400">Set per topic Hz</td>
                <td class="p-3 border border-slate-700">For safety monitors: deadline = 1/Hz × 1.5. E.g., for a 50 Hz position estimate, set deadline = 30 ms. Triggers on_requested_deadline_missed callback — use as watchdog to trigger failsafe if state estimate goes stale mid-flight.</td>
            </tr>
        </tbody>
    </table>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">ROS 2 C++: correct QoS for PX4 /fmu/out/ subscription</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>C++ Code Example</summary>
<pre><code class="language-cpp">#include "rclcpp/rclcpp.hpp"
#include "px4_msgs/msg/vehicle_local_position.hpp"

// PX4 /fmu/out/* uses: Reliability=BEST_EFFORT, Durability=VOLATILE,
// History=KEEP_LAST(1). Subscriber must match exactly.
auto qos = rclcpp::QoS(rclcpp::KeepLast(1))
               .best_effort()
               .durability_volatile();

auto sub = node-&gt;create_subscription&lt;px4_msgs::msg::VehicleLocalPosition&gt;(
    "/fmu/out/vehicle_local_position", qos,
    [](px4_msgs::msg::VehicleLocalPosition::UniquePtr msg) {
        // msg-&gt;x, msg-&gt;y, msg-&gt;z  — NED frame, metres
        // msg-&gt;vx, msg-&gt;vy, msg-&gt;vz — velocity m/s
        // msg-&gt;timestamp — microseconds (CLOCK_MONOTONIC on FC)
    });</code></pre>
</details>
        </div>
    </div>

    <h3>8.6 Micro XRCE-DDS — Replacing MAVROS</h3>
    <p>MAVROS was the ROS 1 bridge between companion computer and flight controller: MAVLink packets arrived over UART and were deserialised then republished as ROS topics — a translation layer with a separate serialisation/deserialisation step per message. Micro XRCE-DDS eliminates this bridge: a lightweight XRCE-DDS client runs directly on the flight controller MCU (Cortex-M7, NuttX), publishing flight state natively into the DDS global data space. The UART or UDP serial link becomes transparent middleware, not a bottleneck.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
        <div class="bg-slate-900 p-5 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2">MAVROS (Legacy Architecture)</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>• FC → UART MAVLink → MAVROS bridge process → ROS 1/2 topics</li>
                <li>• Latency: 5–15 ms per message (baud rate + serialisation overhead)</li>
                <li>• ROS 1 native; MAVROS2 community-maintained port for ROS 2</li>
                <li>• Still required for ArduPilot GUIDED mode on most builds (2026)</li>
                <li>• Translation gaps: not all MAVLink IDs have MAVROS topic mappings</li>
                <li>• Bridge process adds a CPU + memory cost on every message</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-5 rounded border border-emerald-800">
            <strong class="text-emerald-400 block mb-2">Micro XRCE-DDS (2025 Production Standard)</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>• FC XRCE client → UDP/UART → XRCE agent → native ROS 2 topics</li>
                <li>• Latency: &lt;2 ms over UDP loopback on 100BASE-T1 Ethernet</li>
                <li>• PX4 v1.14+ and ArduPilot 4.5+ supported out of the box</li>
                <li>• No bridge process — flight state is a first-class DDS citizen</li>
                <li>• dds_topics.yaml controls exactly which uORB topics are exposed</li>
                <li>• Bidirectional: ROS 2 nodes publish to /fmu/in/ to command the FC</li>
            </ul>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">PX4 + Micro XRCE-DDS Agent on Jetson Orin (ROS 2 Humble)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># Install Micro XRCE-DDS Agent on companion computer:
sudo apt install ros-humble-micro-ros-agent

# Start agent (bridges PX4 XRCE client → ROS 2 via UDP)
MicroXRCEAgent udp4 -p 8888 &

# PX4 v1.14+ starts the XRCE DDS client automatically at boot.
# Topics available immediately after agent connects:
ros2 topic list
# /fmu/out/vehicle_attitude       (250 Hz, BEST_EFFORT)
# /fmu/out/vehicle_local_position (50 Hz)
# /fmu/out/vehicle_status         (1 Hz)
# /fmu/out/battery_status         (1 Hz)
# /fmu/out/esc_status             (100 Hz — if DroneCAN ESCs)
# /fmu/out/sensor_combined        (250 Hz — raw IMU)

# Send setpoints to FC (replaces SET_POSITION_TARGET_LOCAL_NED):
# Publish px4_msgs/msg/TrajectorySetpoint to /fmu/in/trajectory_setpoint

# Expand exposed topics by editing dds_topics.yaml in PX4 source:
# src/modules/uxrce_dds_client/dds_topics.yaml
# Add any uORB topic — it appears as /fmu/out/&lt;name&gt; automatically</code></pre>
</details>
        </div>
    </div>

    <h3>8.7 Video Encoding for Drone Downlinks</h3>
    <p>Drone video pipelines have fundamentally different constraints from broadcast streaming: encoding latency must stay under 100 ms for real-time GCS situational awareness, RF bandwidth limits downlinks to 2–20 Mbps for BVLOS operations, and the encoder must run on battery-constrained hardware at &lt;5 W. Software encoders (libx264, libx265) are disqualified on power alone — hardware encode is mandatory.</p>

    <table class="w-full text-left border-collapse mt-4 mb-6 text-sm">
        <thead>
            <tr class="bg-slate-800 text-sky-400">
                <th class="p-3 border border-slate-700">Codec</th>
                <th class="p-3 border border-slate-700">Compression vs H.264</th>
                <th class="p-3 border border-slate-700">HW Encode Latency</th>
                <th class="p-3 border border-slate-700">2025 Platform Support</th>
            </tr>
        </thead>
        <tbody class="text-slate-300 font-mono text-xs">
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">H.264 / AVC</td>
                <td class="p-3 border border-slate-700">1× baseline</td>
                <td class="p-3 border border-slate-700 text-emerald-400">16–33 ms (1 frame @ 30–60 fps)</td>
                <td class="p-3 border border-slate-700">Universal: Jetson (nvenc h264), RK3588 (rkmpp h264), RPi 5 (V4L2 M2M). Supported by every GCS (QGroundControl, Mission Planner, DJI Pilot). Use for compatibility-first deployments and legacy integration.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white font-bold">H.265 / HEVC</td>
                <td class="p-3 border border-slate-700 text-emerald-400">~40% better quality at same bitrate</td>
                <td class="p-3 border border-slate-700 text-emerald-400">16–33 ms (hardware)</td>
                <td class="p-3 border border-slate-700">Jetson Orin (nvenc hevc, up to 8K), RK3588 (rkmpp hevc), Qualcomm QCS8550. Required for high-quality 4K ISR within 10–20 Mbps budget. QGroundControl 4.3+ supports H.265 RTSP. Default codec choice for new BVLOS systems.</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">AV1</td>
                <td class="p-3 border border-slate-700 text-sky-400">~50% better than H.264</td>
                <td class="p-3 border border-slate-700 text-rose-400">100–500 ms SW (real-time HW: 2025+)</td>
                <td class="p-3 border border-slate-700">Intel ARC A-series (2023+), Qualcomm Snapdragon (2024+). Not yet viable for real-time drone links — decode latency too high. Best for post-mission ISR footage compression, SATCOM uplinks where bandwidth cost dominates.</td>
            </tr>
        </tbody>
    </table>

    <h4>GStreamer Pipeline: H.265 Encode on Jetson Orin (NVENC)</h4>
    <p>Jetson Orin includes hardware NVENC supporting H.264 and H.265 up to 4K@120fps. The zero-copy path uses NVMM memory (shared between the ISP and the encoder), avoiding a CPU-side buffer copy that would add ~5 ms and 30% CPU load:</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">GStreamer: H.265 zero-copy encode → RTP UDP (Jetson Orin)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># SENDER on Jetson Orin — 1080p@30fps H.265, ~4 Mbps, ~30 ms latency
gst-launch-1.0 \
  nvarguscamerasrc sensor-id=0 ! \
  "video/x-raw(memory:NVMM),width=1920,height=1080,framerate=30/1" ! \
  nvv4l2h265enc bitrate=4000000 iframeinterval=30 preset-level=1 \
    control-rate=1 vbv-size=33 ! \
  rtph265pay config-interval=1 ! \
  udpsink host=192.168.1.100 port=5600

# RECEIVER on GCS laptop
gst-launch-1.0 \
  udpsrc port=5600 ! \
  "application/x-rtp,payload=96" ! \
  rtph265depay ! avdec_h265 ! autovideosink sync=false

# MediaMTX (formerly rtsp-simple-server) for multi-client RTSP:
# docker run -d --network host bluenviron/mediamtx:latest
# Clients pull rtsp://drone-ip:8554/live</code></pre>
</details>
        </div>
    </div>

    <h4>RK3588 Pipeline (Rockchip MPP)</h4>
    <p>The RK3588 (Orange Pi 5 Plus, Rock 5B) includes a VPU separate from the NPU, capable of 8K H.265 encode. Use the <code>mpp</code> (Media Process Platform) GStreamer plugin — not the software <code>x265enc</code>:</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">GStreamer: H.265 hardware encode on RK3588 (Rockchip MPP)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># RK3588 hardware H.265 via V4L2 M2M interface (Rockchip MPP)
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  "video/x-raw,width=1920,height=1080,framerate=30/1" ! \
  v4l2h265enc bitrate=5000000 ! \
  rtph265pay ! udpsink host=192.168.1.100 port=5600

# Check available RK3588 VPU encode devices:
v4l2-ctl --list-devices | grep -A2 rkvenc
# /dev/video-enc0   (H.264)
# /dev/video-enc1   (H.265)</code></pre>
</details>
        </div>
    </div>

    <h3>8.8 End-to-End Latency Budget Analysis</h3>
    <p>The most important latency metric for an AI-controlled drone is the <em>perception-to-actuation latency</em>: the time from a photon hitting the camera sensor to a corrective motor command being executed by the ESC. For stable autonomous flight at moderate speeds, this must stay below 150 ms. For aggressive manoeuvring or obstacle avoidance at high speed, below 50 ms is required. Understanding where latency comes from allows systematic optimisation.</p>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Perception-to-Actuation Latency Budget — Jetson Orin / PX4 v1.15</div>
        <table class="w-full text-xs font-mono">
            <thead>
                <tr class="bg-slate-800/50 text-slate-400">
                    <th class="p-3 text-left">Pipeline Stage</th>
                    <th class="p-3 text-left">Component</th>
                    <th class="p-3 text-center text-amber-400">Typical</th>
                    <th class="p-3 text-center text-emerald-400">Optimised</th>
                </tr>
            </thead>
            <tbody class="text-slate-300">
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-white">Sensor</td>
                    <td class="p-3 text-slate-400">30fps rolling shutter → 60fps global shutter</td>
                    <td class="p-3 text-center text-amber-400">35 ms</td>
                    <td class="p-3 text-center text-emerald-400">18 ms</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-white">Interface</td>
                    <td class="p-3 text-slate-400">CSI-2 DMA + ROS 2 zero-copy (both configs)</td>
                    <td class="p-3 text-center text-amber-400">0.7 ms</td>
                    <td class="p-3 text-center text-emerald-400">0.7 ms</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-white">AI Inference</td>
                    <td class="p-3 text-slate-400">FP16 YOLO-v8m → INT8 YOLO-NAS-S</td>
                    <td class="p-3 text-center text-amber-400">8 ms</td>
                    <td class="p-3 text-center text-emerald-400">3 ms</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-white">Comms to FC</td>
                    <td class="p-3 text-slate-400">UART 921600 → UDP 100BASE-T1</td>
                    <td class="p-3 text-center text-amber-400">5 ms</td>
                    <td class="p-3 text-center text-emerald-400">1 ms</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-white">Flight Controller</td>
                    <td class="p-3 text-slate-400">400Hz loop → 1kHz high-rate</td>
                    <td class="p-3 text-center text-amber-400">2.5 ms</td>
                    <td class="p-3 text-center text-emerald-400">1 ms</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-white">Motor</td>
                    <td class="p-3 text-slate-400">DShot300 + rise → DShot600 + rise</td>
                    <td class="p-3 text-center text-amber-400">8 ms</td>
                    <td class="p-3 text-center text-emerald-400">6 ms</td>
                </tr>
                <tr class="border-t border-slate-700 bg-slate-800">
                    <td class="p-3 text-white font-bold" colspan="2">Total Latency</td>
                    <td class="p-3 text-center text-amber-300 font-bold text-sm">~59 ms</td>
                    <td class="p-3 text-center text-emerald-300 font-bold text-sm">~30 ms</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
        <div class="bg-slate-900 p-5 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2">Traditional RC Drone (Human Pilot)</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>• Stick input → RC TX: ~0.5 ms</li>
                <li>• RF link (ELRS 500 Hz): 2 ms</li>
                <li>• FC processing loop (400 Hz): 2.5 ms</li>
                <li>• ESC DShot + motor: 8 ms</li>
                <li>• Total control latency: ~13 ms</li>
                <li class="text-slate-500">• Human reaction adds 100–250 ms on top</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-5 rounded border border-sky-800">
            <strong class="text-sky-400 block mb-2">AI Drone (Onboard Inference)</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>• Camera capture: 16–35 ms (frame-rate dependent)</li>
                <li>• Interface + inference: 4–10 ms (INT8 vs FP16)</li>
                <li>• DDS + FC + ESC: 10–15 ms</li>
                <li>• Total: 30–60 ms depending on configuration</li>
                <li class="text-amber-300">• No human reaction delay — AI reacts 3–8× faster than pilot</li>
                <li class="text-amber-300">• At 10 m/s, 60 ms latency = 60 cm dead zone ahead</li>
            </ul>
        </div>
    </div>

    <h3>8.9 Bandwidth Budget Calculator</h3>
    <p>Use this calculator to determine the required internal data bandwidth for a given sensor configuration. Results indicate which physical interface is required between the sensor layer and the companion computer. <em>Note: raw bandwidth is the CSI-2/USB load; compressed bandwidth is what flows over an RF downlink.</em></p>

    <div class="interactive-panel">
        <h4 class="mt-0 border-none text-white mb-6">Drone Sensor Bandwidth Calculator</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Controls -->
            <div class="space-y-4">
                <div>
                    <label class="text-sky-400 text-xs font-mono uppercase tracking-widest block mb-1">
                        Cameras: <span id="bw-cameras-val" class="text-white">2</span>
                    </label>
                    <input type="range" id="bw-cameras" min="1" max="8" value="2"
                           class="w-full accent-sky-500" oninput="calcDataBandwidth()">
                    <div class="flex justify-between text-xs text-slate-500 font-mono mt-1"><span>1</span><span>8</span></div>
                </div>

                <div>
                    <label class="text-sky-400 text-xs font-mono uppercase tracking-widest block mb-1">Resolution per Camera</label>
                    <select id="bw-resolution" class="w-full bg-slate-800 text-white border border-slate-600 rounded p-2 text-sm font-mono" onchange="calcDataBandwidth()">
                        <option value="640x480">640×480  VGA  (0.3 MP)</option>
                        <option value="1280x720">1280×720  HD  (1 MP)</option>
                        <option value="1920x1080" selected>1920×1080  FHD  (2 MP)</option>
                        <option value="2560x1440">2560×1440  QHD  (3.7 MP)</option>
                        <option value="3840x2160">3840×2160  4K UHD  (8 MP)</option>
                    </select>
                </div>

                <div>
                    <label class="text-sky-400 text-xs font-mono uppercase tracking-widest block mb-1">
                        Frame Rate: <span id="bw-fps-val" class="text-white">30 fps</span>
                    </label>
                    <input type="range" id="bw-fps" min="10" max="120" step="10" value="30"
                           class="w-full accent-sky-500" oninput="calcDataBandwidth()">
                    <div class="flex justify-between text-xs text-slate-500 font-mono mt-1"><span>10 fps</span><span>120 fps</span></div>
                </div>

                <div>
                    <label class="text-sky-400 text-xs font-mono uppercase tracking-widest block mb-1">Bit Depth</label>
                    <select id="bw-bitdepth" class="w-full bg-slate-800 text-white border border-slate-600 rounded p-2 text-sm font-mono" onchange="calcDataBandwidth()">
                        <option value="8" selected>8-bit  RGB888 / standard</option>
                        <option value="10">10-bit  RAW10 / HDR capture</option>
                        <option value="12">12-bit  RAW12 / high dynamic range</option>
                    </select>
                </div>

                <div>
                    <label class="text-sky-400 text-xs font-mono uppercase tracking-widest block mb-1">RF Downlink Compression</label>
                    <select id="bw-compression" class="w-full bg-slate-800 text-white border border-slate-600 rounded p-2 text-sm font-mono" onchange="calcDataBandwidth()">
                        <option value="1">None — raw / NVMM (internal only)</option>
                        <option value="20">H.264  (~20:1 typical)</option>
                        <option value="40" selected>H.265  (~40:1 typical)</option>
                        <option value="80">H.265 aggressive  (~80:1 low quality)</option>
                    </select>
                </div>

                <div>
                    <label class="text-emerald-400 text-xs font-mono uppercase tracking-widest block mb-1">
                        IMU Output Data Rate: <span id="bw-imu-val" class="text-white">1,000 Hz</span>
                    </label>
                    <input type="range" id="bw-imu" min="100" max="8000" step="100" value="1000"
                           class="w-full accent-emerald-500" oninput="calcDataBandwidth()">
                    <div class="flex justify-between text-xs text-slate-500 font-mono mt-1"><span>100 Hz</span><span>8 kHz</span></div>
                </div>
            </div>

            <!-- Results -->
            <div class="space-y-4">
                <div class="bg-slate-950 border border-slate-700 rounded-xl p-4">
                    <div class="text-xs text-slate-500 font-mono uppercase tracking-widest mb-4">Bandwidth Breakdown</div>

                    <div class="mb-3">
                        <div class="flex justify-between text-xs font-mono mb-1">
                            <span class="text-sky-400">Video (compressed for RF)</span>
                            <span id="bw-video-label" class="text-white">—</span>
                        </div>
                        <div class="bg-slate-800 rounded" style="height:10px;">
                            <div id="bw-video-bar" class="bg-sky-500 rounded" style="height:10px;width:0%;transition:width 0.3s;"></div>
                        </div>
                    </div>

                    <div class="mb-3">
                        <div class="flex justify-between text-xs font-mono mb-1">
                            <span class="text-emerald-400">IMU Data Stream</span>
                            <span id="bw-imu-label" class="text-white">—</span>
                        </div>
                        <div class="bg-slate-800 rounded" style="height:10px;">
                            <div id="bw-imu-bar" class="bg-emerald-500 rounded" style="height:10px;width:3%;transition:width 0.3s;"></div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="flex justify-between text-xs font-mono mb-1">
                            <span class="text-amber-400">MAVLink Telemetry</span>
                            <span id="bw-telem-label" class="text-white">~50 Kbps</span>
                        </div>
                        <div class="bg-slate-800 rounded" style="height:10px;">
                            <div id="bw-telem-bar" class="bg-amber-500 rounded" style="height:10px;width:1%;transition:width 0.3s;"></div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="flex justify-between text-xs font-mono mb-1">
                            <span class="text-slate-400">Raw uncompressed reference</span>
                            <span id="bw-raw-label" class="text-white">—</span>
                        </div>
                        <div class="bg-slate-800 rounded" style="height:10px;">
                            <div id="bw-raw-bar" class="bg-slate-600 rounded" style="height:10px;width:50%;transition:width 0.3s;"></div>
                        </div>
                    </div>

                    <div class="border-t border-slate-700" style="padding-top:0.75rem; margin-top:0.25rem;">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-white font-bold text-sm">Total (compressed)</span>
                            <span id="bw-total" class="text-2xl font-mono font-bold text-white">—</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-slate-400 font-mono">Required Interface (raw)</span>
                            <span id="bw-recommendation" class="text-xs font-bold">—</span>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono">
                    <div class="text-slate-400 uppercase tracking-widest mb-2">Interface Reference</div>
                    <div class="space-y-1 text-slate-300">
                        <div class="flex justify-between"><span>USB 2.0</span><span class="text-slate-500">480 Mbps</span></div>
                        <div class="flex justify-between"><span>USB 3.0 Gen 1</span><span class="text-amber-400">5 Gbps</span></div>
                        <div class="flex justify-between"><span>MIPI CSI-2 D-PHY 2-lane</span><span class="text-sky-400">2.5 Gbps</span></div>
                        <div class="flex justify-between"><span>MIPI CSI-2 D-PHY 4-lane</span><span class="text-sky-400">10 Gbps</span></div>
                        <div class="flex justify-between"><span>USB 3.2 Gen 2×2</span><span class="text-emerald-400">20 Gbps</span></div>
                        <div class="flex justify-between"><span>PCIe 3.0 ×4</span><span class="text-emerald-400">32 Gbps</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <h3>8.10 Precision Time Protocol & Clock Synchronisation</h3>
    <p>Sensor fusion requires that every measurement carries an accurate timestamp. Fusing a camera frame timestamped at T_cam with an IMU reading at T_imu when the two clocks have drifted by 5 ms introduces artificial position noise. At 10 m/s drone speed, a 5 ms timing error causes 5 cm of spurious position excursion per IMU update — enough to destabilise a VIO estimator at close range to obstacles.</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2 text-xs uppercase tracking-widest">Software NTP (chrony)</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>• Accuracy: 1–10 ms on local LAN</li>
                <li>• No hardware required</li>
                <li>• Insufficient for VIO/SLAM at &gt;5 m/s</li>
                <li>• Use chrony (not ntpd) — faster convergence</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-amber-700">
            <strong class="text-amber-400 block mb-2 text-xs uppercase tracking-widest">PTP IEEE 1588-2019</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>• Software: 100 ns – 1 µs accuracy</li>
                <li>• Hardware timestamps: &lt;100 ns</li>
                <li>• Requires PTP-capable Ethernet NIC</li>
                <li>• Orin: hardware PTP on enet0 (ptp4l + phc2sys)</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-emerald-700">
            <strong class="text-emerald-400 block mb-2 text-xs uppercase tracking-widest">GNSS-Disciplined PPS</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>• Accuracy: &lt;50 ns (hardware PPS)</li>
                <li>• u-blox F9P 1PPS output: ±10 ns RMS</li>
                <li>• Feed to SoC GPIO + chrony refclock PPS</li>
                <li>• Gold standard for outdoor autonomous missions</li>
            </ul>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">linuxptp: hardware PTP synchronisation on Jetson Orin</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># Verify Orin NIC supports hardware PTP timestamps:
ethtool -T eth0 | grep -i "hardware transmit\|hardware receive"

# Start ptp4l in slave mode (sync to PTP grandmaster — often the GCS router):
sudo ptp4l -i eth0 -s -m 2&gt;&amp;1 | grep offset &amp;
# offset +42 ns  rms 18 ns  freq  +23456 ppm  delay  892 ns

# Sync CLOCK_REALTIME from PHC (PTP Hardware Clock) every 250 ms:
sudo phc2sys -s eth0 -c CLOCK_REALTIME -w -O 0 -m 2&gt;&amp;1 | grep offset &amp;

# GNSS PPS fallback via chrony (/etc/chrony.conf):
# refclock PPS /dev/pps0 lock GPS refid PPS precision 1e-7 poll 3 dpoll -2
# chronyc tracking  -- shows offset vs PPS reference

# ROS 2 clock: use rclcpp::Clock(RCL_SYSTEM_TIME) with /use_sim_time false
# All sensor drivers must call std::chrono::system_clock::now() for timestamps
# — not ROS time — to stay in sync with hardware clocks.</code></pre>
</details>
        </div>
    </div>

    <h4>Hardware Trigger Synchronisation for Stereo / Camera-IMU</h4>
    <p>For stereo SLAM and camera-IMU tight coupling, software timestamping introduces ±half-frame uncertainty (~8 ms at 60 fps). Hardware trigger eliminates this: the IMU fires a GPIO trigger at a fixed rate (typically 200 Hz), the camera sensor captures on the rising edge, and the timestamp is taken at trigger issuance — reducing timing uncertainty to &lt;50 µs (IMU jitter). PX4 can output a camera trigger via CAM_TRIG_MODE parameter on any unused GPIO. OAK-D cameras expose a hardware sync connector natively.</p>

    <h3>8.11 C2 Link Design Patterns</h3>
    <p>The Command and Control (C2) link carries MAVLink telemetry between the ground station and the aircraft. For BVLOS operations the link must be resilient: FAA Part 108 and EASA regulations require Detect and Avoid capability and a documented C2 link specification. Even for VLOS autonomous missions, an undetected C2 link loss must trigger failsafe RTL automatically, not a hover-and-wait that drains the battery.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
        <div class="bg-slate-900 p-5 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">VLOS C2 — Dedicated Radio</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>• Hardware: RFD900x (915 MHz, up to 1 W, 30 km LOS)</li>
                <li>• Protocol: MAVLink 2 over SiK transparent UART bridge</li>
                <li>• Baud: 57600 bps default; 115200 with SiK 2.0+</li>
                <li>• Telemetry rate: 10–20 Hz (all sensors, all topics)</li>
                <li>• Video: separate analog FPV or DJI O3 Air Unit</li>
                <li>• Failsafe: ELRS 900 MHz RC link runs independently</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-5 rounded border border-emerald-800">
            <strong class="text-emerald-400 block mb-2">BVLOS C2 — LTE/5G Primary + Radio Backup</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>• Primary: LTE (Holybro LTE, Waveshare SIM7600, Sixfab HAT)</li>
                <li>• MAVLink over mavlink-router → UDP → WireGuard VPN → GCS</li>
                <li>• Round-trip latency: 50–200 ms (LTE), 20–50 ms (5G)</li>
                <li>• Backup: RFD900x SiK radio — automatic fail-back in mavlink-router</li>
                <li>• Remote ID: OpenDroneID via WiFi NaN + BT 5.0 simultaneously</li>
                <li>• Regulation (USA): FAA Part 108 DAA required above 400 ft AGL</li>
            </ul>
        </div>
    </div>

    <h4>OpenDroneID & Remote Identification (2024–2025 Status)</h4>
    <p>As of September 2023, the FAA requires all drones over 250 g flying in US airspace to broadcast Remote ID. OpenDroneID is the open implementation, supported natively by PX4 (v1.13+) and ArduPilot (4.3+). The drone broadcasts GPS position, altitude, velocity, and operator ID simultaneously via WiFi Neighbor Awareness Networking (NaN) and Bluetooth 5.0 Long Range at 1 Hz. These are two independent RF paths to ensure interoperability with the full range of receivers.</p>

    <ul class="text-slate-300 text-sm space-y-2">
        <li><strong>PX4 setup:</strong> Set <code>RID_ENABLE=1</code>, configure <code>UAS_ID</code> (FAA registration number format CUA-XXXXX). PX4 v1.14+ supports broadcast via attached OpenDroneID module (ESP32-S3 running PX4 RID firmware) over UART or natively via companion computer WiFi.</li>
        <li><strong>Hardware (2025):</strong> BlueMark DB200 (15 g, dual WiFi+BT, USB-C), Cube ID Module (integrates with Cube autopilot), ESP32-S3 DIY with open firmware (github.com/opendroneid/opendroneid-core-c).</li>
        <li><strong>ArduPilot:</strong> <code>DID_ENABLE=1</code>, MAVLink OpenDroneID messages (MSG 12900–12905) as of 4.3+. Compatible with all RID receivers certified under ASTM F3586-22.</li>
        <li><strong>EASA equivalent:</strong> EU 2019/945 Category C1/C2 requires Direct Remote ID broadcast compliant with EUROCAE ED-280. OpenDroneID implements both FAA and EASA message sets simultaneously.</li>
    </ul>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">PX4 Remote ID + dual C2 configuration summary</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># PX4 parameters for BVLOS + Remote ID compliance:
# RID_ENABLE   = 1       (enable OpenDroneID broadcast)
# UAS_ID_TYPE  = 1       (Serial Number)
# COM_DL_LOSS_T = 10     (C2 loss failsafe in seconds)
# NAV_RCL_ACT  = 3       (RC loss → RTL)
# NAV_DLL_ACT  = 3       (datalink loss → RTL)
# COM_RC_IN_MODE = 1     (allow command from companion without RC)

# Verify Remote ID broadcast (requires WiFi-capable device nearby):
# Use DroneScanner app (iOS/Android) to confirm reception
# Check both WiFi NaN beacon and BLE 5 Long Range advertisement</code></pre>
</details>
        </div>
    </div>
</div>
`;
