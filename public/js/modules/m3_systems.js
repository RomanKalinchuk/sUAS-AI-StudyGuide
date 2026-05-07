export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 4</span>
    <h2>Data Links & Topology</h2>
    <p>A high-performance brain is useless if the nervous system is slow. Drone topology dictates how sensor data flows into the AI, and how AI commands flow back to the motors.</p>

    <h3>4.1 Physical Interface Standards</h3>
    <p>Understanding the hardware interfaces is critical to avoid bottlenecks.</p>

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
                <td class="p-3 border border-slate-700 text-white font-bold">MIPI CSI-2</td>
                <td class="p-3 border border-slate-700">Up to 10 Gbps (4-lane, D-PHY v1.2)</td>
                <td class="p-3 border border-slate-700 text-emerald-400">Microseconds</td>
                <td class="p-3 border border-slate-700">Direct camera-to-SoC connection. Bypasses USB overhead. Mandatory for high-speed VSLAM. Max cable length ~15cm.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white font-bold">USB 3.x</td>
                <td class="p-3 border border-slate-700">5 - 10 Gbps</td>
                <td class="p-3 border border-slate-700 text-amber-400">Milliseconds (1-5ms)</td>
                <td class="p-3 border border-slate-700">Connecting smart cameras (OAK-D), SDRs (Software Defined Radios), or external AI accelerators (Hailo-8 USB).</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">UART (Serial)</td>
                <td class="p-3 border border-slate-700">~1 Mbps (e.g. 921600 baud)</td>
                <td class="p-3 border border-slate-700 text-amber-400">Low (Byte-level)</td>
                <td class="p-3 border border-slate-700">Legacy bridge between the Companion Computer and Flight Controller carrying MAVLink. Being supplanted by <strong>Micro XRCE-DDS</strong> on PX4 v1.14+ and ArduPilot 4.5+, which publishes flight state directly to ROS 2 topics via UDP — lower latency and no serialization overhead. UART MAVLink remains common for ArduPilot GUIDED mode integration.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white font-bold">CAN Bus</td>
                <td class="p-3 border border-slate-700">1 Mbps</td>
                <td class="p-3 border border-slate-700 text-emerald-400">Deterministic</td>
                <td class="p-3 border border-slate-700">Connecting high-reliability peripherals to the Flight Controller (RTK GPS, Smart ESCs). Highly resistant to EMI.</td>
            </tr>
        </tbody>
    </table>

    <h3>4.2 The MAVLink Protocol Breakdown</h3>
    <p>MAVLink (Micro Air Vehicle Link) is the lingua franca of drone communication. It is a lightweight, header-only message marshaling library. When your AI Python script wants to move the drone, it must construct a specific MAVLink binary packet.</p>

    <div class="math-block bg-[#0d1117] border-slate-700 mb-8">
        <h4 class="mt-0 text-sky-400 text-sm mb-3">Packet Anatomy: MAVLink v2</h4>
        <div class="flex flex-wrap gap-2 text-xs font-mono">
            <span class="bg-rose-900/40 text-rose-300 p-2 border border-rose-700 rounded">STX (0xFD)</span>
            <span class="bg-slate-800 text-slate-300 p-2 border border-slate-600 rounded">LEN</span>
            <span class="bg-slate-800 text-slate-300 p-2 border border-slate-600 rounded">INC FLAGS</span>
            <span class="bg-slate-800 text-slate-300 p-2 border border-slate-600 rounded">COMP FLAGS</span>
            <span class="bg-slate-800 text-slate-300 p-2 border border-slate-600 rounded">SEQ</span>
            <span class="bg-indigo-900/40 text-indigo-300 p-2 border border-indigo-700 rounded">SYS ID</span>
            <span class="bg-indigo-900/40 text-indigo-300 p-2 border border-indigo-700 rounded">COMP ID</span>
            <span class="bg-amber-900/40 text-amber-300 p-2 border border-amber-700 rounded">MSG ID (3 bytes)</span>
            <span class="bg-emerald-900/40 text-emerald-300 p-2 border border-emerald-700 rounded flex-grow">PAYLOAD (0-255 bytes)</span>
            <span class="bg-purple-900/40 text-purple-300 p-2 border border-purple-700 rounded">CHECKSUM (2 bytes)</span>
        </div>
        <p class="text-slate-400 text-xs mt-4">
            <strong>MSG ID 84: <code>SET_POSITION_TARGET_LOCAL_NED</code></strong><br>
            This is the most critical message for AI integration. Your AI calculates a bounding box, converts it to a 3D vector, and populates this payload with X, Y, Z coordinate targets (North, East, Down). The Flight Controller receives this, feeds it to its internal PID position controllers, and executes the physical movement.
        </p>
    </div>

    <h3>4.3 Network Topology: DDS (Data Distribution Service)</h3>
    <p>Inside the Companion Computer, data does not flow sequentially. A modern AI drone runs ROS 2, which uses DDS. DDS is a decentralized pub/sub middleware. The Camera Node "publishes" images to a topic. The VIO Node and the AI Node both "subscribe" to that topic. They process data in parallel, independently.</p>

    <h3>4.4 Micro XRCE-DDS — Replacing MAVROS for Flight Controller Communication</h3>
    <p>MAVROS was the ROS 1 bridge between a companion computer and a flight controller: it received MAVLink packets over UART and re-published them as ROS topics. It required a serialization and deserialization step for every message. With ROS 2, a better architecture is available: <strong>Micro XRCE-DDS</strong> (eXtremely Resource Constrained Environments DDS).</p>
    <p>Micro XRCE-DDS runs a lightweight client directly on the flight controller MCU (Cortex-M7). The client publishes flight state — attitude, velocity, position, battery — directly to the DDS global data space. The companion computer's ROS 2 nodes subscribe to these topics without any bridge process. The UART or UDP serial link becomes transparent middleware, not a bottleneck.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Bash: PX4 + Micro XRCE-DDS Agent on Jetson Orin (ROS 2 Humble)
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-bash"># Install the Micro XRCE-DDS Agent on the companion computer:
sudo apt install ros-humble-micro-ros-agent

# Launch the agent — bridges PX4 flight controller DDS client to ROS 2
# The flight controller connects over UDP (preferred) or serial
MicroXRCEAgent udp4 -p 8888 &

# PX4 v1.14+ automatically starts the DDS client on boot.
# Flight state is now available as native ROS 2 topics:
ros2 topic list
# /fmu/out/vehicle_attitude
# /fmu/out/vehicle_local_position
# /fmu/out/vehicle_status
# /fmu/out/battery_status

# Subscribe to attitude directly — no MAVROS, no bridge process:
ros2 topic echo /fmu/out/vehicle_attitude

# Send position setpoints to PX4 via DDS (replaces SET_POSITION_TARGET_LOCAL_NED):
# Publish to /fmu/in/trajectory_setpoint with TrajectorySetpoint message type</code></pre>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
        <div class="bg-slate-900 p-5 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2">MAVROS (Legacy)</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>> Flight controller → UART MAVLink → MAVROS bridge → ROS 1/2 topics</li>
                <li>> Latency: ~5–15ms per message (UART baud + serialization)</li>
                <li>> ROS 1 native; ROS 2 port (mavros2) exists but is maintained by community</li>
                <li>> Still required for ArduPilot GUIDED mode on most builds as of 2026</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-5 rounded border border-emerald-800">
            <strong class="text-emerald-400 block mb-2">Micro XRCE-DDS (Current Standard)</strong>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>> Flight controller → UDP/serial → XRCE-DDS agent → ROS 2 topics natively</li>
                <li>> Latency: &lt;2ms per message over UDP loopback</li>
                <li>> Supported by PX4 v1.14+ and ArduPilot 4.5+ out of the box</li>
                <li>> No bridge process — flight state is first-class ROS 2 citizen</li>
            </ul>
        </div>
    </div>
</div>
`;
