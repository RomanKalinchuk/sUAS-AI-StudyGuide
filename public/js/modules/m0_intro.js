export default `
<div class="fade-in">
    <div class="mb-10 text-center">
        <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 0</span>
        <h2 class="text-5xl font-extrabold text-white mt-2 mb-6">Fundamentals of Autonomous sUAS</h2>
        <p class="text-xl text-slate-400 max-w-3xl mx-auto">Before writing a single line of code or soldering a carrier board, engineers must understand the theoretical framework of unmanned autonomy and the strict constraints of the environment.</p>
    </div>

    <h3>0.1 The Evolution of sUAS Autonomy</h3>
    <p>Historically, Unmanned Aircraft Systems (UAS) were purely remote-controlled vehicles. The operator provided all cognitive input—stabilization, navigation, and targeting. The introduction of MEMS (Micro-Electro-Mechanical Systems) IMUs allowed for auto-leveling. The integration of GPS allowed for waypoint navigation.</p>
    <p>However, modern mission requirements—such as navigating inside collapsed buildings, flying under dense forest canopies, or operating in electronic warfare environments where GPS is actively jammed—render traditional navigation useless. <strong>Edge AI is not a luxury feature; it is an operational mandate for survivability and mission success in GPS-denied environments.</strong></p>

    <div class="interactive-panel">
        <h4 class="mt-0 border-none">Levels of Aerial Autonomy (AL0 to AL5)</h4>
        <p class="text-sm mb-6">Similar to self-driving cars, drone autonomy is categorized into levels. Edge AI primarily enables AL3 through AL5.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-slate-800 p-4 rounded border-l-4 border-slate-600">
                <strong class="text-white">AL0 - AL1: Manual & Assisted</strong><br>
                <span class="text-xs text-slate-400">Direct RC control. Basic attitude stabilization (PID loops). Operator does everything.</span>
            </div>
            <div class="bg-slate-800 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-white">AL2: Partial Autonomy</strong><br>
                <span class="text-xs text-slate-400">GPS waypoint following. Pre-programmed routes. Fails if GPS is lost.</span>
            </div>
            <div class="bg-slate-800 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-white">AL3: Conditional Autonomy (Current State of Art)</strong><br>
                <span class="text-xs text-slate-400">Drone navigates visually (VIO). Detects and avoids obstacles using AI. Requires human oversight.</span>
            </div>
            <div class="bg-slate-800 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-white">AL4 - AL5: High & Full Autonomy</strong><br>
                <span class="text-xs text-slate-400">Semantic understanding. Drone is given a high-level goal ("Find the red truck in sector 4"). It plans its own route, searches, adapts to weather, and executes without any comms link.</span>
            </div>
        </div>
    </div>

    <h3>0.2 The Aerial OODA Loop</h3>
    <p>The OODA loop (Observe, Orient, Decide, Act), originally developed by military strategist John Boyd, is the perfect architectural model for an AI drone software stack. Every millisecond, the drone's processors must execute this loop.</p>
    <ul class="space-y-4">
        <li><strong>Observe:</strong> High-bandwidth data ingestion. Stereo cameras capture 60 FPS uncompressed video. LiDAR spins at 10Hz. The IMU samples at 400Hz. This requires immense data bus bandwidth (MIPI CSI, PCIe).</li>
        <li><strong>Orient:</strong> The heaviest computational load. The drone runs VSLAM (Visual Simultaneous Localization and Mapping) to figure out <em>where</em> it is. It runs Object Detection (e.g., YOLO) to figure out <em>what</em> is around it.</li>
        <li><strong>Decide:</strong> Path planning algorithms (like A* or RRT*) and behavioral state machines evaluate the oriented data against the mission parameters to generate a safe trajectory vector.</li>
        <li><strong>Act:</strong> The high-level PC translates the trajectory into a MAVLink command, sends it to the real-time Flight Controller, which calculates the complex motor mixing matrix and sends PWM signals to the ESCs.</li>
    </ul>

    <h3>0.3 The Edge vs. Cloud Paradigm</h3>
    <p>Why put a heavy, hot, power-hungry GPU on a flying battery? Why not stream the video to the cloud, process it on an AWS server, and send commands back? The answer is <strong>Latency and Reliability</strong>.</p>
    <div class="math-block">
        Total Cloud Loop Latency = t_encode + t_tx + t_network + t_inference + t_rx + t_decode<br><br>
        Example:<br>
        Video Encode (H.265): 20ms<br>
        4G/5G Uplink: 40ms<br>
        Cloud Inference (A100 GPU): 10ms<br>
        Command Downlink: 30ms<br>
        Total Latency: ~100ms
    </div>
    <p>At 15 m/s (33 mph), a drone travels 1.5 meters in 100ms. If an obstacle appears, by the time the cloud tells the drone to brake, it has already crashed. Furthermore, RF links are easily jammed or blocked by buildings. <strong>Edge AI ensures the OODA loop remains closed and deterministic, operating purely on silicon physics rather than network luck.</strong></p>
</div>
`;
