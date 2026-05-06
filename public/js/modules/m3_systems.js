export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 3</span>
    <h2>Data Links & Topology</h2>
    <p>A high-performance brain is useless if the nervous system is slow. Drone topology dictates how sensor data flows into the AI, and how AI commands flow back to the motors.</p>

    <h3>3.1 Physical Interface Standards</h3>
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
                <td class="p-3 border border-slate-700">Up to 10 Gbps (4-lane)</td>
                <td class="p-3 border border-slate-700 text-emerald-400">Microseconds</td>
                <td class="p-3 border border-slate-700">Direct camera-to-SoC connection. Bypasses USB overhead. Mandatory for high-speed VSLAM. Max cable length ~15cm.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white font-bold">USB 3.x</td>
                <td class="p-3 border border-slate-700">5 - 10 Gbps</td>
                <td class="p-3 border border-slate-700 text-amber-400">Milliseconds (1-5ms)</td>
                <td class="p-3 border border-slate-700">Connecting smart cameras (OAK-D), SDRs (Software Defined Radios), or external AI accelerators (Coral USB).</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">UART (Serial)</td>
                <td class="p-3 border border-slate-700">~1 Mbps (e.g. 921600 baud)</td>
                <td class="p-3 border border-slate-700 text-amber-400">Low (Byte-level)</td>
                <td class="p-3 border border-slate-700">The lifeline between the Companion Computer (AI) and Flight Controller (RTOS). Carries MAVLink telemetry and commands.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white font-bold">CAN Bus</td>
                <td class="p-3 border border-slate-700">1 Mbps</td>
                <td class="p-3 border border-slate-700 text-emerald-400">Deterministic</td>
                <td class="p-3 border border-slate-700">Connecting high-reliability peripherals to the Flight Controller (RTK GPS, Smart ESCs). Highly resistant to EMI.</td>
            </tr>
        </tbody>
    </table>

    <h3>3.2 The MAVLink Protocol Breakdown</h3>
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

    <h3>3.3 Network Topology: DDS (Data Distribution Service)</h3>
    <p>Inside the Companion Computer, data does not flow sequentially. A modern AI drone runs ROS 2, which uses DDS. DDS is a decentralized pub/sub middleware. The Camera Node "publishes" images to a topic. The VIO Node and the AI Node both "subscribe" to that topic. They process data in parallel, independently.</p>
</div>
`;
