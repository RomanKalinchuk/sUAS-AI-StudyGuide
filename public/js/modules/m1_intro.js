export default `
<div class="fade-in">
    <div class="mb-10 text-center">
        <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 1</span>
        <h2 class="text-5xl font-extrabold text-white mt-2 mb-6">Fundamentals of Autonomous sUAS</h2>
        <p class="text-xl text-slate-400 max-w-3xl mx-auto">Before writing a single line of code or selecting a carrier board, engineers must master the theoretical framework of unmanned autonomy, the regulatory environment, and the operational constraints that shape every design decision.</p>
    </div>

    <!-- State of the Industry 2026 -->
    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-10">
        <h3 class="mt-0 text-sky-400 border-none text-lg font-bold">State of the Industry — 2026</h3>
        <p class="text-slate-300 text-sm mb-4">Three major platform transitions have completed. Engineers must operate on the current stack — not legacy tutorials written for discontinued hardware.</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 block mb-2">Compute: Orin → Thor Architecture</strong>
                <p class="text-slate-400 text-xs">The NVIDIA Jetson Orin Nano (40 TOPS, 5–15W) remains the SWaP-C standard for sub-5 kg AI drones. The Jetson AGX Thor (Blackwell, 2070 FP4 TFLOPS, 40–130W) targets larger platforms requiring multi-modal foundation model inference. The original Jetson Nano is obsolete; Google Coral TPU ecosystem has stagnated.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 block mb-2">Middleware: ROS 2 Jazzy + DDS</strong>
                <p class="text-slate-400 text-xs">ROS 1 (Noetic) reached End-of-Life in May 2025. All new development uses ROS 2 Humble (Ubuntu 22.04 LTS) or ROS 2 Jazzy Jalisco (Ubuntu 24.04 LTS, supported until May 2029). The FC bridge has transitioned from MAVROS to Micro XRCE-DDS — PX4 and ArduPilot now publish flight state directly to ROS 2 topics via Fast DDS with substantially lower latency.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
                <strong class="text-purple-400 block mb-2">Simulation: Isaac Sim / Isaac Lab</strong>
                <p class="text-slate-400 text-xs">Microsoft AirSim was deprecated in 2023 (community fork: Colosseum). NVIDIA Isaac Sim (Omniverse) is the current standard for photorealistic synthetic data generation and sim-to-real reinforcement learning. Domain randomization in Isaac Sim enables zero-shot policy transfer — models trained entirely in simulation deploy directly to real hardware.</p>
            </div>
        </div>
        <div class="mt-4 bg-slate-900 p-4 rounded border-l-4 border-rose-500">
            <strong class="text-rose-400 block mb-2">Defense Stack: Blue UAS (DCMA) / STANAG 4586 / Encrypted MAVLink 2</strong>
            <p class="text-slate-400 text-xs">The DoD Defense Innovation Unit (DIU) Blue UAS Framework transitioned to the Defense Contract Management Agency (DCMA) on December 3, 2025, as directed by Secretary of Defense Hegseth's goal of "small UAS domain dominance by 2027." The cleared list now encompasses 39+ certified systems and 165 components, including Skydio X10D, Autel EVO Max 4T, BRINC Lemur 2, Teal 2 (Teledyne FLIR), Neros Archer, Hoverfly Spectre, and Zone 5 Paladin. NATO STANAG 4586 defines the standard CUCS/VSM interface between a Universal Control Station and multiple UAV types. All DoD sUAS mandate MAVLink 2 signed messages (HMAC-SHA256) and AES-256-GCM encrypted payloads.</p>
        </div>
    </div>

    <!-- Section 1.1 -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.1 What Is a Small Unmanned Aircraft System (sUAS)?</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
            <p class="text-slate-300">The FAA defines a small UAS (sUAS) as an unmanned aircraft weighing <strong class="text-white">less than 55 lbs (25 kg)</strong> at takeoff, including payload. The Department of Defense uses a five-group classification system spanning from hand-launched micro-drones to high-altitude long-endurance (HALE) systems. Groups 1–3 are collectively called sUAS.</p>
            <p class="text-slate-300 mt-3">Modern autonomous sUAS integrate five core subsystems: (1) an airframe and power plant, (2) a flight controller running real-time RTOS firmware, (3) a companion computer running AI inference and mission logic, (4) a sensor suite (cameras, IMU, GNSS, LiDAR), and (5) a communications stack (C2 link, data downlink, relay mesh).</p>
            <p class="text-slate-300 mt-3">The threshold for "autonomous" is commonly defined as the ability to execute a mission objective — not just a flight path — without real-time human input at the control loop level.</p>
        </div>
        <div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-slate-700 text-slate-300">
                        <tr>
                            <th class="p-3">DoD Group</th>
                            <th class="p-3">Max Weight</th>
                            <th class="p-3">Max Alt.</th>
                            <th class="p-3">Example Platforms</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700">
                        <tr class="bg-slate-800">
                            <td class="p-3 text-emerald-400 font-bold">Group 1</td>
                            <td class="p-3 text-slate-300">0–20 lbs</td>
                            <td class="p-3 text-slate-300">&lt;1,200 ft AGL</td>
                            <td class="p-3 text-slate-400 text-xs">RQ-11 Raven, WASP III, Skydio X2, Black Hornet PRS</td>
                        </tr>
                        <tr class="bg-slate-900">
                            <td class="p-3 text-sky-400 font-bold">Group 2</td>
                            <td class="p-3 text-slate-300">21–55 lbs</td>
                            <td class="p-3 text-slate-300">&lt;3,500 ft AGL</td>
                            <td class="p-3 text-slate-400 text-xs">ScanEagle 3, Altius-600M, Arcturus JUMP 20</td>
                        </tr>
                        <tr class="bg-slate-800">
                            <td class="p-3 text-amber-400 font-bold">Group 3</td>
                            <td class="p-3 text-slate-300">&lt;1,320 lbs</td>
                            <td class="p-3 text-slate-300">&lt;FL 180</td>
                            <td class="p-3 text-slate-400 text-xs">RQ-7B Shadow, RQ-21A Blackjack, V-BAT VTOL</td>
                        </tr>
                        <tr class="bg-slate-900">
                            <td class="p-3 text-rose-400 font-bold">Group 4</td>
                            <td class="p-3 text-slate-300">&gt;1,320 lbs</td>
                            <td class="p-3 text-slate-300">Any</td>
                            <td class="p-3 text-slate-400 text-xs">MQ-8B Fire Scout, MQ-1C Gray Eagle</td>
                        </tr>
                        <tr class="bg-slate-800">
                            <td class="p-3 text-purple-400 font-bold">Group 5</td>
                            <td class="p-3 text-slate-300">&gt;1,320 lbs</td>
                            <td class="p-3 text-slate-300">&gt;FL 180</td>
                            <td class="p-3 text-slate-400 text-xs">MQ-9 Reaper, RQ-4 Global Hawk, MQ-4C Triton</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="text-slate-500 text-xs mt-2">Source: DoD Joint UAS Center of Excellence, JP 3-30. FAA sUAS = &lt;55 lbs MGTOW under 14 CFR Part 107.</p>
        </div>
    </div>

    <!-- Image: RQ-11 Raven -->
    <figure class="my-6">
        <img src="images/m1_raven_uav.jpg" alt="U.S. Army Corporal assembling an RQ-11 Raven UAV in Iraq" class="rounded-lg w-full object-cover" style="height:400px;">
        <figcaption class="text-gray-400 text-sm text-center mt-2">A U.S. Army soldier assembles an AeroVironment RQ-11 Raven — the Army's standard Group 1 hand-launched ISR sUAS, weighing 4.2 lbs and providing 60–90 min endurance. Source: <a href="https://commons.wikimedia.org/wiki/File:Raven_UAV.jpg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons</a> (U.S. Air Force, public domain)</figcaption>
    </figure>

    <!-- Section 1.2 FAA Regulations -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.2 Regulatory Framework: FAA Part 107 and Remote ID</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-5">
            <h4 class="text-sky-400 font-bold text-base mt-0 mb-3">FAA Part 107 — Key Requirements (2025)</h4>
            <ul class="space-y-2 text-sm text-slate-300">
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Remote Pilot Certificate:</strong> Written knowledge test (60 questions). Certificate valid for 24 months (online recurrent training).</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Weight Limit:</strong> &lt;55 lbs (24.9 kg) MGTOW. FAA registration required for drones over 250 g.</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>VLOS Requirement:</strong> Must maintain unaided visual line-of-sight at all times (exceptions via waiver or new Part 108 BVLOS rules).</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Altitude:</strong> Maximum 400 ft AGL (or 400 ft above a structure within 400 ft of the structure).</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Airspace:</strong> Class B/C/D/E requires LAANC authorization or FAA DroneZone waiver. Class G is open.</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Waivers:</strong> 203 BVLOS waivers approved in 2024; new Part 108 NPRM (August 2025) proposes standardized BVLOS framework replacing individual waivers.</span></li>
            </ul>
        </div>
        <div class="bg-slate-800/60 border border-amber-700/60 rounded-xl p-5">
            <h4 class="text-amber-400 font-bold text-base mt-0 mb-3">Remote ID — Mandatory Since September 2023</h4>
            <p class="text-slate-300 text-sm mb-3">Remote ID functions as a "digital license plate," broadcasting identification and location data in real time. Compliance is required for all Part 107 operations.</p>
            <ul class="space-y-2 text-sm text-slate-300">
                <li class="flex gap-2"><span class="text-amber-400 shrink-0">&#9654;</span><span><strong>Standard Remote ID:</strong> Built into the aircraft. Broadcasts drone ID, operator location, altitude, speed, and emergency status via WiFi/Bluetooth.</span></li>
                <li class="flex gap-2"><span class="text-amber-400 shrink-0">&#9654;</span><span><strong>Broadcast Module:</strong> Attached module for legacy aircraft not equipped with built-in Remote ID.</span></li>
                <li class="flex gap-2"><span class="text-amber-400 shrink-0">&#9654;</span><span><strong>FRIA Exception:</strong> FAA-Recognized Identification Areas allow Remote ID-exempt operations for recreational fliers within designated areas.</span></li>
                <li class="flex gap-2"><span class="text-amber-400 shrink-0">&#9654;</span><span><strong>BVLOS Evolution:</strong> FAA Part 108 NPRM (2025) proposes removing per-operation waiver requirements for BVLOS — enabling scalable commercial autonomous delivery.</span></li>
            </ul>
            <p class="mt-3"><a href="https://www.faa.gov/uas/getting_started/remote_id" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline text-sm">FAA Remote ID Official Page &#8599;</a></p>
        </div>
    </div>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500 mb-6">
        <strong class="text-amber-400 block mb-1">DoD Operations: Part 107 Exemptions</strong>
        <p class="text-slate-400 text-sm">U.S. military and DoD operations on military installations or in restricted/prohibited airspace operate under separate authority — not Part 107. Public Aircraft Operations (PAO) and military-specific authorizations apply. However, DoD operators increasingly encounter civilian airspace during training and contingency operations, making Part 107 knowledge operationally relevant even for military engineers.</p>
    </div>

    <!-- Section 1.3 Blue UAS & Defense Framework -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.3 Blue UAS Framework and DoD Procurement</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
            <p class="text-slate-300 text-sm">The National Defense Authorization Act (NDAA) Section 848 prohibits DoD from procuring UAS manufactured by entities associated with China — specifically DJI, Autel (prior to vetting), and other Chinese-origin manufacturers. The <strong class="text-white">Blue UAS Framework</strong> was created by the Defense Innovation Unit (DIU) in 2020 to identify NDAA-compliant alternatives that have passed cybersecurity and supply chain vetting.</p>
            <p class="text-slate-300 text-sm mt-3">As of December 2025, the Blue UAS list transitioned to the <strong class="text-white">Defense Contract Management Agency (DCMA)</strong> under the new Unmanned Systems-Experimental Command (US-X), headquartered in Palmdale, California, aligning with SecDef Hegseth's directive for "small UAS domain dominance by end of 2027."</p>
        </div>
        <div class="bg-slate-800/60 border border-emerald-700/60 rounded-xl p-5">
            <h4 class="text-emerald-400 font-bold text-base mt-0 mb-3">Key Blue UAS Cleared Platforms (2025–2026)</h4>
            <div class="space-y-2 text-xs text-slate-300">
                <div class="flex justify-between border-b border-slate-700 pb-1">
                    <span class="text-white font-semibold">Skydio X10D</span>
                    <span class="text-slate-400">AI obstacle avoidance, EO/IR, encrypted C2</span>
                </div>
                <div class="flex justify-between border-b border-slate-700 pb-1">
                    <span class="text-white font-semibold">Teal 2 (Teledyne FLIR)</span>
                    <span class="text-slate-400">Group 1, thermal + RGB, ROS 2 compatible</span>
                </div>
                <div class="flex justify-between border-b border-slate-700 pb-1">
                    <span class="text-white font-semibold">Autel EVO Max 4T</span>
                    <span class="text-slate-400">Multi-sensor, post-NDAA vetting, all-weather</span>
                </div>
                <div class="flex justify-between border-b border-slate-700 pb-1">
                    <span class="text-white font-semibold">BRINC Lemur 2</span>
                    <span class="text-slate-400">Indoor BVLOS, first responder / CQB ISR</span>
                </div>
                <div class="flex justify-between border-b border-slate-700 pb-1">
                    <span class="text-white font-semibold">Neros Archer</span>
                    <span class="text-slate-400">ATO Feb 2025, 29 Palms challenge winner</span>
                </div>
                <div class="flex justify-between border-b border-slate-700 pb-1">
                    <span class="text-white font-semibold">Hoverfly Spectre</span>
                    <span class="text-slate-400">Tethered persistent ISR, ATO Feb 2025</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-white font-semibold">Heven Z1 (Hydrogen)</span>
                    <span class="text-slate-400">Hydrogen-powered, added Nov 2025, 3+ hr endurance</span>
                </div>
            </div>
            <p class="mt-3"><a href="https://www.diu.mil/blue-uas-cleared-list" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline text-xs">Full Blue UAS Cleared List (DIU/DCMA) &#8599;</a></p>
        </div>
    </div>

    <!-- Image: RQ-28A -->
    <figure class="my-6">
        <img src="images/m1_rq28a_drone.jpg" alt="U.S. Army RQ-28A quadcopter drone during testing at Fort Benning" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">The Army RQ-28A (Skydio X2D militarized) — the Army's first program-of-record quadcopter for Short Range Reconnaissance (SRR). 22,000+ units fielded by 2024. Source: <a href="https://www.dvidshub.net/image/7660923/rq-28a" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">DVIDS</a> (U.S. Army, public domain)</figcaption>
    </figure>

    <!-- Section 1.4 NATO STANAG 4586 -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.4 NATO STANAG 4586 — Interoperability Standard</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-slate-800/60 border border-purple-700/60 rounded-xl p-5">
            <h4 class="text-purple-400 font-bold text-base mt-0 mb-3">What STANAG 4586 Defines</h4>
            <p class="text-slate-300 text-sm mb-3">NATO Standardization Agreement 4586 establishes the <strong class="text-white">standard interfaces between a Universal Control Station (UCS)</strong> and multiple UAV types, enabling one GCS to control heterogeneous UAVs from different manufacturers. It defines:</p>
            <ul class="space-y-1 text-xs text-slate-300">
                <li class="flex gap-2"><span class="text-purple-400">&#9654;</span> Data link interface (DLI) between the UCS and the data link subsystem</li>
                <li class="flex gap-2"><span class="text-purple-400">&#9654;</span> Vehicle-Specific Module (VSM) API for per-platform adaptation</li>
                <li class="flex gap-2"><span class="text-purple-400">&#9654;</span> C4I interface to connect the UCS into Command, Control, Comms, and Intel systems</li>
                <li class="flex gap-2"><span class="text-purple-400">&#9654;</span> Human-Machine Interface (HMI) guidelines for operator workload reduction</li>
                <li class="flex gap-2"><span class="text-purple-400">&#9654;</span> Message formats and data element definitions for full LOI-5 interoperability</li>
            </ul>
        </div>
        <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-5">
            <h4 class="text-sky-400 font-bold text-base mt-0 mb-3">Five Levels of Interoperability (LOI)</h4>
            <div class="space-y-2 text-xs">
                <div class="flex gap-3 items-start">
                    <span class="bg-slate-700 text-white px-2 py-0.5 rounded font-mono shrink-0">LOI 1</span>
                    <span class="text-slate-300">Indirect receipt of UAV imagery and data via other systems. No direct control.</span>
                </div>
                <div class="flex gap-3 items-start">
                    <span class="bg-slate-700 text-white px-2 py-0.5 rounded font-mono shrink-0">LOI 2</span>
                    <span class="text-slate-300">Direct receipt of UAV payload data. Still no vehicle control.</span>
                </div>
                <div class="flex gap-3 items-start">
                    <span class="bg-sky-900/50 text-sky-300 px-2 py-0.5 rounded font-mono shrink-0">LOI 3</span>
                    <span class="text-slate-300">Control and monitoring of UAV payload. Sensor steering, mode changes.</span>
                </div>
                <div class="flex gap-3 items-start">
                    <span class="bg-sky-900/50 text-sky-300 px-2 py-0.5 rounded font-mono shrink-0">LOI 4</span>
                    <span class="text-slate-300">Control and monitoring of the air vehicle itself. Waypoint navigation, mission execution.</span>
                </div>
                <div class="flex gap-3 items-start">
                    <span class="bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded font-mono shrink-0">LOI 5</span>
                    <span class="text-slate-300">Full air vehicle and payload control including launch and recovery. Maximum interoperability.</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Section 1.5 Levels of Autonomy -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.5 Levels of Aerial Autonomy (AL0–AL5)</h3>
    <p class="text-slate-300 mb-5">Similar to automotive autonomy (SAE Levels 0–5), drone autonomy is categorized into levels. Edge AI primarily enables AL3 through AL5. The leap from AL2 to AL3 requires onboard perception — the drone must sense its own environment rather than rely on pre-mapped waypoints.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div class="bg-slate-800 p-4 rounded border-l-4 border-slate-600">
            <strong class="text-white text-sm">AL0 — Manual</strong><br>
            <span class="text-xs text-slate-400 block mt-1">Direct RC control. No automated stabilization. Operator provides all inputs including attitude correction. High pilot workload.</span>
        </div>
        <div class="bg-slate-800 p-4 rounded border-l-4 border-slate-500">
            <strong class="text-white text-sm">AL1 — Assisted Stabilization</strong><br>
            <span class="text-xs text-slate-400 block mt-1">PID attitude stabilization (MEMS IMU). Operator still controls velocity and position. Auto-leveling prevents unintentional attitude divergence.</span>
        </div>
        <div class="bg-slate-800 p-4 rounded border-l-4 border-amber-500">
            <strong class="text-white text-sm">AL2 — Partial Autonomy</strong><br>
            <span class="text-xs text-slate-400 block mt-1">GPS waypoint following. Pre-programmed route execution. Return-to-Home on link loss. Completely fails if GPS is jammed or denied.</span>
        </div>
        <div class="bg-slate-800 p-4 rounded border-l-4 border-sky-500">
            <strong class="text-white text-sm">AL3 — Conditional Autonomy <span class="text-xs text-sky-400">(Current Edge AI Standard)</span></strong><br>
            <span class="text-xs text-slate-400 block mt-1">VIO-based GPS-denied navigation. Real-time obstacle detection and avoidance (AI). Requires human supervisor monitoring; operator is manager not pilot.</span>
        </div>
        <div class="bg-slate-800 p-4 rounded border-l-4 border-emerald-500">
            <strong class="text-white text-sm">AL4 — High Autonomy</strong><br>
            <span class="text-xs text-slate-400 block mt-1">Semantic scene understanding. Given a task ("secure building perimeter"), plans its own route, searches, adapts to obstacles. Human retains abort authority.</span>
        </div>
        <div class="bg-slate-800 p-4 rounded border-l-4 border-purple-500">
            <strong class="text-white text-sm">AL5 — Full Autonomy</strong><br>
            <span class="text-xs text-slate-400 block mt-1">Complete mission execution with zero human input. Language-directed tasking (VLA models). No C2 link required. Raises significant LOAC / DoD Directive 3000.09 compliance requirements.</span>
        </div>
    </div>

    <!-- Section 1.6 The Aerial OODA Loop -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.6 The Aerial OODA Loop</h3>
    <p class="text-slate-300 mb-4">The OODA loop (Observe, Orient, Decide, Act), developed by USAF Colonel John Boyd, is the foundational architectural model for an AI drone software stack. Every millisecond, the companion computer must execute this loop to remain mission-capable.</p>

    <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-sky-900/30 rounded-lg border border-sky-700/40">
                <div class="text-3xl font-black text-sky-400 mb-2">O</div>
                <div class="text-white font-bold text-sm mb-2">Observe</div>
                <p class="text-slate-400 text-xs">Stereo cameras @ 60 FPS. LiDAR @ 10 Hz. IMU @ 400 Hz. MIPI CSI-2 and PCIe data buses. Massive bandwidth ingestion from heterogeneous sensors simultaneously.</p>
            </div>
            <div class="text-center p-4 bg-amber-900/30 rounded-lg border border-amber-700/40">
                <div class="text-3xl font-black text-amber-400 mb-2">O</div>
                <div class="text-white font-bold text-sm mb-2">Orient</div>
                <p class="text-slate-400 text-xs">VSLAM: <em>where am I?</em> Object detection (YOLO11): <em>what is around me?</em> Heaviest compute load. TensorRT-optimized INT8 inference on the Orin DLA cores.</p>
            </div>
            <div class="text-center p-4 bg-emerald-900/30 rounded-lg border border-emerald-700/40">
                <div class="text-3xl font-black text-emerald-400 mb-2">D</div>
                <div class="text-white font-bold text-sm mb-2">Decide</div>
                <p class="text-slate-400 text-xs">Path planning (A*, RRT*, behavior trees) evaluates oriented data against mission parameters. Generates a safe trajectory vector respecting airspace, obstacle, and mission constraints.</p>
            </div>
            <div class="text-center p-4 bg-rose-900/30 rounded-lg border border-rose-700/40">
                <div class="text-3xl font-black text-rose-400 mb-2">A</div>
                <div class="text-white font-bold text-sm mb-2">Act</div>
                <p class="text-slate-400 text-xs">Companion PC sends MAVLink SET_POSITION_TARGET or trajectory setpoints to the flight controller (PX4/ArduPilot). FC runs PID loops → ESC PWM/DSHOT → motor thrust.</p>
            </div>
        </div>
    </div>

    <!-- Section 1.7 Edge vs Cloud -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.7 The Edge vs. Cloud Paradigm</h3>
    <p class="text-slate-300 mb-4">Why put a hot, heavy GPU on a flying battery? Why not stream video to an AWS server and send commands back? Two answers: <strong class="text-white">latency</strong> and <strong class="text-white">reliability</strong>.</p>

    <div class="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5 text-xs text-center font-mono">
        <div class="bg-slate-900 p-3 rounded border border-slate-700">
            <div class="text-slate-400 text-[10px] uppercase mb-1">Encode</div>
            <div class="text-amber-400 font-bold text-base">20ms</div>
            <div class="text-slate-500">H.265</div>
        </div>
        <div class="bg-slate-900 p-3 rounded border border-slate-700">
            <div class="text-slate-400 text-[10px] uppercase mb-1">Uplink</div>
            <div class="text-amber-400 font-bold text-base">40ms</div>
            <div class="text-slate-500">4G/5G</div>
        </div>
        <div class="bg-slate-900 p-3 rounded border border-slate-700">
            <div class="text-slate-400 text-[10px] uppercase mb-1">Cloud Infer</div>
            <div class="text-emerald-400 font-bold text-base">10ms</div>
            <div class="text-slate-500">A100 GPU</div>
        </div>
        <div class="bg-slate-900 p-3 rounded border border-slate-700">
            <div class="text-slate-400 text-[10px] uppercase mb-1">Downlink</div>
            <div class="text-amber-400 font-bold text-base">30ms</div>
            <div class="text-slate-500">Command</div>
        </div>
        <div class="bg-rose-900/30 p-3 rounded border border-rose-700/50">
            <div class="text-rose-400 text-[10px] uppercase mb-1">Total RTT</div>
            <div class="text-rose-300 font-bold text-base">~100ms</div>
            <div class="text-slate-500">Too slow</div>
        </div>
    </div>

    <p class="text-slate-300 mb-4">At 15 m/s (33 mph), a drone travels <strong class="text-white">1.5 meters in 100 ms</strong>. If an obstacle appears, by the time the cloud tells the drone to brake, it has already impacted. Furthermore, RF links are easily jammed or blocked by terrain. Edge AI keeps the OODA loop closed and deterministic — operating on silicon physics rather than network availability.</p>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500 mb-6">
        <strong class="text-sky-400 block mb-1">Strategic Advantage: Zero RF Emission During Inference</strong>
        <p class="text-slate-400 text-sm">A cloud-dependent drone must continuously uplink video — a broadband emission that passive RF sensors can detect and geo-locate at multi-km ranges. An edge AI drone can operate entirely in receive-only mode during the approach phase, emitting no RF while executing full OODA-loop autonomy on-silicon. In a contested environment, this is the difference between a detectable and an undetectable platform.</p>
    </div>

    <!-- Section 1.8 Compute Stack -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.8 Compute Stack: Flight Controller + Companion Computer</h3>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Component</th>
                    <th class="p-3">Current Standard</th>
                    <th class="p-3">Key Capability</th>
                    <th class="p-3">Interfaces</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-semibold">Flight Controller (FC)</td>
                    <td class="p-3 text-slate-300">Pixhawk 6X / Cube Orange+</td>
                    <td class="p-3 text-slate-400 text-xs">Hard real-time RTOS (NuttX). PID attitude/rate control at 1 kHz. EKF3 sensor fusion. Dual redundant IMU/baro. MAVLink 2 with HMAC signing.</td>
                    <td class="p-3 text-slate-400 text-xs">UART, CAN, I2C, SPI, PWM/DSHOT to ESCs</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-emerald-400 font-semibold">Companion Computer (CC)</td>
                    <td class="p-3 text-slate-300">Jetson Orin Nano (sub-3 kg platforms)</td>
                    <td class="p-3 text-slate-400 text-xs">40 TOPS INT8. TensorRT inference (YOLO11, VSLAM, VLMs). ROS 2 Jazzy node host. Micro XRCE-DDS bridge to FC. 5–15W power envelope.</td>
                    <td class="p-3 text-slate-400 text-xs">MIPI CSI-2 (cameras), USB3, PCIe, Ethernet, UART to FC</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-purple-400 font-semibold">Companion (High-End)</td>
                    <td class="p-3 text-slate-300">Jetson AGX Orin 64GB</td>
                    <td class="p-3 text-slate-400 text-xs">275 TOPS. Multi-camera VSLAM. Simultaneous foundation model inference + object detection. Secure Boot with PKC e-fuse. 15–60W.</td>
                    <td class="p-3 text-slate-400 text-xs">PCIe Gen4 x8, 6× MIPI CSI-2, 10 GbE, CAN FD</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-amber-400 font-semibold">Compute (Future)</td>
                    <td class="p-3 text-slate-300">Jetson AGX Thor</td>
                    <td class="p-3 text-slate-400 text-xs">2070 FP4 TFLOPS (Blackwell), 128 GB LPDDR5X. 7.5× Orin AI performance, 3.5× energy efficiency. Physical AI / foundation model inference at the edge.</td>
                    <td class="p-3 text-slate-400 text-xs">PCIe Gen5, 14× Arm Neoverse V3AE cores, 40–130W</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Section 1.9 PX4 vs ArduPilot -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.9 Flight Stack: PX4 vs. ArduPilot</h3>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Attribute</th>
                    <th class="p-3">PX4 Autopilot</th>
                    <th class="p-3">ArduPilot</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-400 font-semibold">License</td>
                    <td class="p-3 text-slate-300">BSD-3 Clause — proprietary derivatives allowed</td>
                    <td class="p-3 text-slate-300">GPL v3 — all derivatives must be open-sourced</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-400 font-semibold">Architecture</td>
                    <td class="p-3 text-slate-300">Microservices + uORB pub/sub. Highly modular. Each component (estimator, controller, driver) is an independent module.</td>
                    <td class="p-3 text-slate-300">Monolithic core with plugin libraries. Gentler learning curve. Larger vehicle type coverage including submarines and blimps.</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-400 font-semibold">ROS 2 Integration</td>
                    <td class="p-3 text-emerald-400">Native Micro XRCE-DDS. PX4 publishes uORB topics directly as ROS 2 topics. px4_msgs package.</td>
                    <td class="p-3 text-slate-300">MAVROS2 bridge + experimental DDS support via AP_DDS (MAVLink 2 serial or UDP)</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-400 font-semibold">Estimator</td>
                    <td class="p-3 text-slate-300">ECL EKF2. GPS+VIO+optical flow fusion. Multi-sensor redundancy.</td>
                    <td class="p-3 text-slate-300">EKF3. GPS+VIO+optical flow+rangefinder fusion. Robust GNSS-denied operation.</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-400 font-semibold">Defense Use</td>
                    <td class="p-3 text-emerald-400">Preferred for research / DARPA / precision commercial applications. Default on Autel/Teal Blue UAS platforms.</td>
                    <td class="p-3 text-slate-300">Strong US military heritage (RQ-7B Shadow, ScanEagle). ArduCopter widely used in training programs.</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-400 font-semibold">GitHub Stars (2025)</td>
                    <td class="p-3 text-slate-300">~9,500 stars / 14k forks</td>
                    <td class="p-3 text-slate-300">~12,100 stars / 18.7k forks / 1,500+ contributors</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Section 1.10 Foundation Models -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.10 Foundation Models and Language-Directed Autonomy</h3>
    <p class="text-slate-300 mb-4">The most significant AI paradigm shift of 2024–2026 is the deployment of Vision-Language Models (VLMs) at the tactical edge. Rather than training narrow, task-specific detectors for every target class (requiring weeks of labeled data and GPU training), engineers now deploy small multimodal foundation models that generalize from natural language prompts — enabling zero-shot ISR tasking without model retraining or cloud connectivity.</p>

    <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 mb-6">
        <h4 class="text-sky-400 font-bold text-base mt-0 mb-3">Edge-Deployable Foundation Models — Defense-Relevant (2025–2026)</h4>
        <p class="text-slate-400 text-xs mb-4">All models below run inference entirely on Jetson Orin Nano/NX at mission-viable latency with no network uplink required.</p>
        <div class="overflow-x-auto">
            <table class="w-full text-xs font-mono">
                <thead>
                    <tr class="text-slate-400 border-b border-slate-700">
                        <th class="p-2 text-left">Model</th>
                        <th class="p-2 text-left">Type</th>
                        <th class="p-2 text-left">Quantized Size</th>
                        <th class="p-2 text-left">Orin Nano (15W)</th>
                        <th class="p-2 text-left">Tactical Capability</th>
                    </tr>
                </thead>
                <tbody class="text-slate-300">
                    <tr class="border-b border-slate-800">
                        <td class="p-2 text-sky-400">NanoOWL (OWL-ViT)</td>
                        <td class="p-2">Open-vocab detect</td>
                        <td class="p-2">0.6 GB FP16</td>
                        <td class="p-2 text-emerald-400">~22 ms/frame</td>
                        <td class="p-2">Real-time text-prompted detection — no pre-defined class list</td>
                    </tr>
                    <tr class="border-b border-slate-800 bg-slate-900/30">
                        <td class="p-2 text-sky-400">OpenCLIP (ViT-L/14)</td>
                        <td class="p-2">Zero-shot classify</td>
                        <td class="p-2">0.9 GB FP16</td>
                        <td class="p-2 text-emerald-400">~8 ms/query</td>
                        <td class="p-2">Classify detection crops against arbitrary text labels post-detection</td>
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="p-2 text-amber-400">PaliGemma 2 (3B)</td>
                        <td class="p-2">VLM</td>
                        <td class="p-2">~2.0 GB INT4</td>
                        <td class="p-2 text-amber-400">~120 ms/query</td>
                        <td class="p-2">Scene VQA, grounded segmentation, activity classification</td>
                    </tr>
                    <tr class="border-b border-slate-800 bg-slate-900/30">
                        <td class="p-2 text-amber-400">Phi-3.5 Vision (4B)</td>
                        <td class="p-2">VLM</td>
                        <td class="p-2">~2.5 GB INT4</td>
                        <td class="p-2 text-amber-400">~180 ms/query</td>
                        <td class="p-2">Multi-image temporal reasoning, OCR of markings/signage</td>
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="p-2 text-purple-400">OpenVLA-7B</td>
                        <td class="p-2">VLA (action)</td>
                        <td class="p-2">~4.0 GB INT4</td>
                        <td class="p-2 text-rose-400">~450 ms (Orin NX req.)</td>
                        <td class="p-2">Language-conditioned action policy — instruction directly to motor command</td>
                    </tr>
                    <tr class="border-b border-slate-800 bg-slate-900/30">
                        <td class="p-2 text-purple-400">Phi-3 Mini (3.8B)</td>
                        <td class="p-2">LLM planner</td>
                        <td class="p-2">2.2 GB INT4</td>
                        <td class="p-2 text-emerald-400">~35 ms/token</td>
                        <td class="p-2">Decompose natural language mission intent into waypoint / action sequences</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <p class="text-slate-300 mb-4">The pattern emerging from DARPA OFFSET, Army FTUAS, and AFRL programs is a <strong class="text-white">three-tier inference stack</strong>: an always-on fast detector (NanoOWL at 22 ms/frame) runs at full camera rate; a semantic VLM (PaliGemma 2) triggers on detection events or operator queries; and a small LLM (Phi-3 Mini) translates operator mission intent into structured waypoint and action sequences. This satisfies both real-time tracking latency and higher-level cognitive complexity without a cloud connection.</p>

    <div class="bg-slate-800/60 border border-amber-700/50 rounded-xl p-4 mb-6 text-sm">
        <strong class="text-amber-400 block mb-2">Critical Constraint: VLM Hallucination in Targeting Contexts</strong>
        <p class="text-slate-300 text-xs">VLMs can produce confident but factually wrong outputs — a property called hallucination. This is not a patchable software bug; it is a structural property of autoregressive models. In tactical contexts, all VLM outputs must be classified as <em>soft cues requiring human confirmation</em>, not autonomous targeting designations. Architecturally, confine VLMs to the Observe/Orient phases of the OODA loop. The Decide/Act loop must remain under human authority to satisfy Law of Armed Conflict (LOAC) and <a href="https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodd/300009p.pdf" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">DoD Directive 3000.09</a> (Autonomous Weapons) requirements.</p>
    </div>

    <!-- Section 1.11 EW -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.11 Counter-UAS and Electronic Warfare Resilience</h3>

    <p class="text-slate-300 mb-5">The Ukraine conflict (2022–present) has empirically validated what EW engineers predicted for decades: sUAS operating in GPS-contested, RF-jammed environments are defeated if they rely on commercial-grade navigation and unencrypted C2 links. The engineering response is a layered EW-resilient architecture.</p>

    <!-- Image: Black Hornet -->
    <figure class="my-6">
        <img src="images/m1_black_hornet.jpg" alt="South Carolina Army National Guard soldiers training with Black Hornet Nano UAV" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">S.C. Army National Guard soldiers train with the Teledyne FLIR Black Hornet 3 Nano UAV — a 33g pocket-sized ISR drone with 25 min endurance and EO/IR cameras, fielded under the Army Soldier-Borne Sensor program. Source: <a href="https://www.dvidshub.net/image/8583524" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">DVIDS</a> (U.S. Army, public domain)</figcaption>
    </figure>

    <div class="bg-slate-800/60 border border-rose-700/50 rounded-xl p-5 mb-6 text-sm">
        <h4 class="mt-0 text-rose-400 border-none font-bold">Validated EW Threat Picture — Ukraine 2022–2025</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div>
                <strong class="text-white block mb-1">GNSS Jamming is Theater-Wide</strong>
                <p class="text-slate-400">Russian Krasukha-4, Zhitel, and R-330Zh systems jam GPS/GLONASS across multi-km radii near front lines. DJI Mavic-class platforms operating GPS-dependent routes are effectively defeated within minutes. VIO-primary navigation is now a baseline requirement for any contested-environment platform.</p>
            </div>
            <div>
                <strong class="text-white block mb-1">C2 Link Interdiction is Routine</strong>
                <p class="text-slate-400">Ukrainian FPV operators report 2.4 GHz / 5.8 GHz C2 links severed within seconds of entering jammed sectors. Frequency-hopping spread-spectrum (FHSS) on 433/868/915 MHz provides partial resilience. The next-generation response is fully pre-programmed autonomous missions where the C2 link is optional — not required — for mission completion.</p>
            </div>
            <div>
                <strong class="text-white block mb-1">AI-Powered C-UAS is Operational</strong>
                <p class="text-slate-400">Both sides field ML-based RF fingerprinting and acoustic detection. Ukraine's DELTA battlefield management system integrates radar, RF, and optical data to coordinate drone defense. Russia's Gyurza EW system actively jams drone C2 links using AI-driven frequency prediction. Engineers must treat their platform's acoustic, thermal, and RF signatures as active targeting inputs for the adversary's AI systems.</p>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-slate-900 border border-rose-800/50 rounded-xl p-4">
            <strong class="text-rose-400 block mb-2 text-sm">GPS / GNSS Spoofing</strong>
            <p class="text-slate-400 text-xs mb-2">Adversary transmits false GNSS signals at power levels that override authentic satellite signals, causing the aircraft to navigate to an adversary-specified position.</p>
            <strong class="text-emerald-400 text-xs block mb-1">Mitigations:</strong>
            <ul class="text-xs text-slate-300 space-y-1">
                <li>&gt; Multi-constellation GNSS (GPS+GLONASS+Galileo+BeiDou) — Septentrio mosaic-X5 with AIM+ anti-spoof</li>
                <li>&gt; VIO consistency monitor: GPS vs. VIO disagreement &gt;3σ triggers GNSS exclusion</li>
                <li>&gt; Galileo OSNMA cryptographic authentication (active since 2023)</li>
                <li>&gt; SNR anomaly detection: spoofed signals arrive at anomalously high power</li>
            </ul>
        </div>
        <div class="bg-slate-900 border border-amber-800/50 rounded-xl p-4">
            <strong class="text-amber-400 block mb-2 text-sm">RF C2 Link Jamming</strong>
            <p class="text-slate-400 text-xs mb-2">Broadband noise or spot-frequency jamming severs the operator-to-drone C2 link, forcing the drone into failsafe (RTH or land) — allowing recovery or kinetic intercept of the airframe.</p>
            <strong class="text-emerald-400 text-xs block mb-1">Mitigations:</strong>
            <ul class="text-xs text-slate-300 space-y-1">
                <li>&gt; FHSS C2 links: ExpressLRS (2.4 GHz, 500 hops/sec), TBS Crossfire (915 MHz)</li>
                <li>&gt; Dual-band C2: primary RF + cellular LTE/5G on independent frequency domain</li>
                <li>&gt; Pre-loaded autonomous contingency: mission executable with zero uplink</li>
                <li>&gt; Satellite fallback: Iridium Certus for large-frame UAS</li>
            </ul>
        </div>
        <div class="bg-slate-900 border border-purple-800/50 rounded-xl p-4">
            <strong class="text-purple-400 block mb-2 text-sm">Secure Platform Architecture</strong>
            <p class="text-slate-400 text-xs mb-2">Defense platforms must assume zero trust for all communications and resist passive interception and firmware injection by an adversary who captures the airframe.</p>
            <strong class="text-emerald-400 text-xs block mb-1">Mitigations:</strong>
            <ul class="text-xs text-slate-300 space-y-1">
                <li>&gt; MAVLink 2 signed messages: HMAC-SHA256 per-packet integrity</li>
                <li>&gt; AES-256-GCM: all telemetry and video streams encrypted</li>
                <li>&gt; Secure Boot: Jetson Orin PKC key fused into OTP e-fuses</li>
                <li>&gt; LUKS2 disk encryption on eMMC/NVMe for mission data at rest</li>
            </ul>
        </div>
    </div>

    <!-- GNSS-Denied Nav Stack -->
    <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 mb-8">
        <h4 class="mt-0 text-sky-400 font-bold border-none">GNSS-Denied Navigation — Defense Degraded-Mode Priority Hierarchy</h4>
        <p class="text-slate-400 text-sm mb-4">When GPS is jammed or spoofed, the EKF must degrade gracefully through a sensor priority hierarchy. The aircraft must remain controllable at every level.</p>
        <div class="space-y-2 text-xs font-mono">
            <div class="flex items-center gap-3 bg-slate-800 p-3 rounded border-l-4 border-emerald-500">
                <span class="text-emerald-400 w-6 font-bold shrink-0">L1</span>
                <span class="text-white font-bold w-36 shrink-0">Multi-const GNSS</span>
                <span class="text-slate-300">Primary. GPS+GLONASS+Galileo+BeiDou. OSNMA cryptographic authentication. Anti-spoof firmware active.</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-800 p-3 rounded border-l-4 border-sky-500">
                <span class="text-sky-400 w-6 font-bold shrink-0">L2</span>
                <span class="text-white font-bold w-36 shrink-0">VIO (VSLAM)</span>
                <span class="text-slate-300">Visual-inertial odometry runs always. GNSS fused as correction when trusted; ignored when flagged. Drift: ~0.5% of distance.</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-800 p-3 rounded border-l-4 border-amber-500">
                <span class="text-amber-400 w-6 font-bold shrink-0">L3</span>
                <span class="text-white font-bold w-36 shrink-0">Barometric Alt.</span>
                <span class="text-slate-300">Dual barometer sensors with sensor voting. Pixhawk 6X carries two independent MEMS baro sensors for altitude hold.</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-800 p-3 rounded border-l-4 border-amber-700">
                <span class="text-amber-600 w-6 font-bold shrink-0">L4</span>
                <span class="text-white font-bold w-36 shrink-0">IMU Dead Reck.</span>
                <span class="text-slate-300">Pure inertial integration. Drift accumulates at 1–5 m/min. 15–30 second bridge window — sufficient to transition to VIO re-lock.</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-800 p-3 rounded border-l-4 border-purple-500">
                <span class="text-purple-400 w-6 font-bold shrink-0">L5</span>
                <span class="text-white font-bold w-36 shrink-0">Terrain Rel. Nav</span>
                <span class="text-slate-300">LiDAR / camera scan matched against pre-loaded digital elevation map (DEM). Provides absolute position fix without GNSS or comms.</span>
            </div>
            <div class="flex items-center gap-3 bg-rose-900/30 p-3 rounded border-l-4 border-rose-600">
                <span class="text-rose-400 w-6 font-bold shrink-0">L6</span>
                <span class="text-white font-bold w-36 shrink-0">Contingency Exec.</span>
                <span class="text-slate-300">All nav layers failed: execute pre-programmed contingency — hover, immediate land, or fly fixed heading/altitude to recovery zone.</span>
            </div>
        </div>
    </div>

    <!-- Image: sUAS Training -->
    <figure class="my-6">
        <img src="images/m1_suas_training.jpg" alt="Air Force Tech Sgt piloting a small UAS during training" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Tech. Sgt. Sean Carnes, Air Force Public Affairs Agency sUAS program manager, flying a small unmanned aircraft system during currency training at Joint Base San Antonio, October 2024. Source: <a href="https://www.dvidshub.net/image/8718527" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">DVIDS</a> (U.S. Air Force, public domain)</figcaption>
    </figure>

    <!-- Video 1 -->
    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Video: FREE Online Course — Unmanned Aerial Systems Fundamentals</h3>
        <p class="text-slate-400 text-sm mb-3">Comprehensive UAS fundamentals covering terminology, platform types, flight physics, and system selection — foundational knowledge for all engineers entering the field.</p>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/hpM153xf7Rg" title="FREE Online Course: Unmanned Aerial Systems Fundamentals" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
    </div>

    <!-- Video 2 -->
    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Video: The Future of Autonomous Drones and National Security</h3>
        <p class="text-slate-400 text-sm mb-3">MIT Professor Sertac Karaman's AI Expo presentation on autonomous drone technology, current capabilities, and the national security implications of widespread autonomous aerial systems. (2024)</p>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/RZZTV-NQXj0" title="The Future of Autonomous Drones and Their Impact on National Security" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
    </div>

    <!-- Section 1.12 External Resources -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.12 Authoritative References and Further Reading</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
            <h4 class="text-sky-400 font-bold text-sm mt-0 mb-3">Regulatory and Policy</h4>
            <ul class="space-y-2 text-sm">
                <li><a href="https://www.faa.gov/uas/commercial_operators" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">FAA Part 107 — Commercial sUAS Operators</a></li>
                <li><a href="https://www.faa.gov/uas/getting_started/remote_id" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">FAA Remote ID Requirements</a></li>
                <li><a href="https://www.diu.mil/blue-uas-cleared-list" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Blue UAS Cleared List (DIU/DCMA)</a></li>
                <li><a href="https://www.congress.gov/crs-product/IF12668" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">CRS: U.S. Army Small Uncrewed Aircraft Systems Programs</a></li>
                <li><a href="https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodd/300009p.pdf" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">DoD Directive 3000.09: Autonomous Weapons Systems</a></li>
            </ul>
        </div>
        <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
            <h4 class="text-emerald-400 font-bold text-sm mt-0 mb-3">Technical Standards and Platforms</h4>
            <ul class="space-y-2 text-sm">
                <li><a href="https://px4.io/software/software-overview/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">PX4 Autopilot — Software Overview</a></li>
                <li><a href="https://ardupilot.org/ardupilot/index.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">ArduPilot Project Documentation</a></li>
                <li><a href="https://docs.ros.org/en/jazzy/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">ROS 2 Jazzy Jalisco Documentation</a></li>
                <li><a href="https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">NVIDIA Jetson AGX Orin — Product Page</a></li>
                <li><a href="https://www.uavnavigation.com/company/blog/stanag-4586-interoperability-levels" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">STANAG 4586 Interoperability Levels Explained</a></li>
            </ul>
        </div>
    </div>

    <!-- Module Synthesis -->
    <div class="bg-slate-800/60 border border-emerald-700/60 rounded-xl p-5 mt-6">
        <h4 class="mt-0 text-emerald-400 font-bold border-none text-lg">Module 1 Synthesis: The Seven Engineering Disciplines of Autonomous sUAS</h4>
        <p class="text-slate-300 text-sm mb-4">Modern autonomous sUAS engineering is a system-of-systems problem spanning seven interlocking disciplines. Each downstream module in this guide addresses one slice in depth. An engineer who masters all seven can build platforms that operate reliably in the most demanding contested environments.</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-emerald-500"><strong class="text-emerald-400">1. Compute Architecture</strong><br/><span class="text-slate-400">Orin Nano/NX SWaP-C tradeoffs, TensorRT optimization, power mode scheduling → Modules 2–4</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500"><strong class="text-sky-400">2. AI / ML Pipeline</strong><br/><span class="text-slate-400">YOLO11, VSLAM, VLM inference, foundation model stacks, synthetic data → Modules 10–12, 14</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-amber-500"><strong class="text-amber-400">3. Middleware &amp; Comms</strong><br/><span class="text-slate-400">ROS 2 Jazzy, Micro XRCE-DDS, MAVLink 2 signing, RF link design → Modules 6–8</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-purple-500"><strong class="text-purple-400">4. Flight Control</strong><br/><span class="text-slate-400">PX4 / ArduPilot architecture, EKF3, sensor fusion, failsafe trees → Modules 5, 9</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-rose-500"><strong class="text-rose-400">5. EW Resilience</strong><br/><span class="text-slate-400">Anti-spoof GNSS, FHSS C2, GNSS-denied nav stack, encrypted comms → This module + 16</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-amber-600"><strong class="text-amber-600">6. Swarm Coordination</strong><br/><span class="text-slate-400">Decentralized flocking, mesh comms, multi-agent task allocation → Module 15</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-slate-500 md:col-span-1"><strong class="text-slate-300">7. Power Electronics</strong><br/><span class="text-slate-400">Battery chemistry, PDB design, ESC architecture, thermal management → Module 3</span></div>
        </div>
    </div>
</div>
`;
