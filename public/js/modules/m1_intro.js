export default `
<div class="fade-in">
    <div class="mb-10 text-center">
        <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 1</span>
        <h2 class="text-5xl font-extrabold text-white mt-2 mb-6">Fundamentals of Autonomous sUAS</h2>
        <p class="text-xl text-slate-400 max-w-3xl mx-auto">Before writing a single line of code or soldering a carrier board, engineers must understand the theoretical framework of unmanned autonomy and the strict constraints of the environment.</p>
    </div>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-10">
        <h3 class="mt-0 text-sky-400 border-none text-lg">State of the Industry — 2026</h3>
        <p class="text-slate-300 text-sm mb-4">This guide targets the current engineering standard. Three platform transitions are complete and engineers must operate on the new stack — not legacy tutorials.</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 block mb-2">Compute: Orin Architecture</strong>
                <p class="text-slate-400 text-xs">The NVIDIA Jetson Orin Nano (40 TOPS, 5W–15W) is the current SWaP-C standard for sub-5kg AI drones. The original Jetson Nano is obsolete for generative edge AI. The Google Coral TPU ecosystem has stagnated. High-end systems now target the Jetson Thor (Blackwell, 1200+ FP4 TFLOPS) for multi-modal foundation model inference.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 block mb-2">Middleware: ROS 2 + DDS</strong>
                <p class="text-slate-400 text-xs">ROS 1 (Noetic) reached End-of-Life in May 2025. All new development uses ROS 2 Humble (Ubuntu 22.04) or Jazzy (Ubuntu 24.04). The flight controller communication bridge has transitioned from MAVROS (ROS 1 serial bridge) to Micro XRCE-DDS — PX4 and ArduPilot now publish flight state directly to ROS 2 topics via DDS with substantially lower latency.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
                <strong class="text-purple-400 block mb-2">Simulation: Isaac Sim / Isaac Lab</strong>
                <p class="text-slate-400 text-xs">Microsoft AirSim was deprecated in 2023 (community fork: Colosseum). NVIDIA Isaac Sim (Omniverse) is the current standard for photorealistic synthetic data generation and sim-to-real reinforcement learning. Domain randomization in Isaac Sim enables zero-shot policy transfer — models trained entirely in simulation deploy directly to real hardware without fine-tuning.</p>
            </div>
        </div>
        <div class="mt-4 bg-slate-900 p-4 rounded border-l-4 border-rose-500">
            <strong class="text-rose-400 block mb-2">Defense Stack: Blue UAS / STANAG 4586 / Encrypted MAVLink 2</strong>
            <p class="text-slate-400 text-xs">The DoD Defense Innovation Unit (DIU) Blue UAS Framework certifies commercial sUAS for DoD use — the 2024 cleared list includes Skydio X10D, Autel EVO Max 4T, BRINC Lemur 2, and Joby Uber Air (ISR variant). NATO STANAG 4586 defines the standard interface between a UCS (Universal Control Station) and multiple UAV types via CUCS/VSM software. All new DoD sUAS programs mandate MAVLink 2 with signed messages (HMAC-SHA256 per-packet authentication) and AES-256-GCM encrypted payloads. NVIDIA Jetson Orin supports hardware-fused Secure Boot (PKC key burned into OTP e-fuses), satisfying DoD firmware integrity requirements without external HSM hardware.</p>
        </div>
    </div>

    <h3>1.1 The Evolution of sUAS Autonomy</h3>
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

    <h3>1.2 The Aerial OODA Loop</h3>
    <p>The OODA loop (Observe, Orient, Decide, Act), originally developed by military strategist John Boyd, is the perfect architectural model for an AI drone software stack. Every millisecond, the drone's processors must execute this loop.</p>
    <ul class="space-y-4">
        <li><strong>Observe:</strong> High-bandwidth data ingestion. Stereo cameras capture 60 FPS uncompressed video. LiDAR spins at 10Hz. The IMU samples at 400Hz. This requires immense data bus bandwidth (MIPI CSI, PCIe).</li>
        <li><strong>Orient:</strong> The heaviest computational load. The drone runs VSLAM (Visual Simultaneous Localization and Mapping) to figure out <em>where</em> it is. It runs Object Detection (e.g., YOLO) to figure out <em>what</em> is around it.</li>
        <li><strong>Decide:</strong> Path planning algorithms (like A* or RRT*) and behavioral state machines evaluate the oriented data against the mission parameters to generate a safe trajectory vector.</li>
        <li><strong>Act:</strong> The high-level PC translates the trajectory into a MAVLink command, sends it to the real-time Flight Controller, which calculates the complex motor mixing matrix and sends PWM signals to the ESCs.</li>
    </ul>

    <h3>1.3 The Edge vs. Cloud Paradigm</h3>
    <p>Why put a heavy, hot, power-hungry GPU on a flying battery? Why not stream the video to the cloud, process it on an AWS server, and send commands back? The answer is <strong>Latency and Reliability</strong>.</p>

    <div class="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 text-xs text-center font-mono">
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
            <div class="text-slate-400 text-[10px] uppercase mb-1">Inference</div>
            <div class="text-emerald-400 font-bold text-base">10ms</div>
            <div class="text-slate-500">A100 GPU</div>
        </div>
        <div class="bg-slate-900 p-3 rounded border border-slate-700">
            <div class="text-slate-400 text-[10px] uppercase mb-1">Downlink</div>
            <div class="text-amber-400 font-bold text-base">30ms</div>
            <div class="text-slate-500">Command</div>
        </div>
        <div class="bg-rose-900/30 p-3 rounded border border-rose-700/50">
            <div class="text-rose-400 text-[10px] uppercase mb-1">Total</div>
            <div class="text-rose-300 font-bold text-base">~100ms</div>
            <div class="text-slate-500">Too slow</div>
        </div>
    </div>
    <p>At 15 m/s (33 mph), a drone travels 1.5 meters in 100ms. If an obstacle appears, by the time the cloud tells the drone to brake, it has already crashed. Furthermore, RF links are easily jammed or blocked by buildings. <strong>Edge AI ensures the OODA loop remains closed and deterministic, operating purely on silicon physics rather than network luck.</strong></p>

    <p>A second strategic advantage of edge processing is its <strong>zero RF emission footprint during inference</strong>. A cloud-dependent drone must continuously uplink video — a broadband emission that passive RF sensors can detect and localize at multi-km ranges. An edge AI drone can run entirely in receive-only mode during the approach phase, emitting no RF whatsoever while executing full OODA-loop autonomy on-silicon. This is not a marginal advantage; it is the difference between a detectable and an undetectable platform in a contested environment.</p>

    <h3>1.4 Foundation Models and Language-Directed Autonomy</h3>
    <p>The most significant AI paradigm shift in 2024–2026 is the deployment of Vision-Language Models (VLMs) at the tactical edge. Rather than training narrow task-specific detectors for every target class (requiring weeks of labeled data collection and GPU training time), engineers now deploy small multimodal foundation models that generalize from natural language prompts — enabling zero-shot ISR tasking without model retraining or cloud connectivity.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 border-none">Edge-Deployable Foundation Models — Defense-Relevant (2025–2026)</h4>
        <p class="text-sm mb-4">All models below run inference entirely on Jetson Orin Nano/NX at mission-viable latency with no network uplink required.</p>
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
                        <td class="p-2">6.9 GB INT4</td>
                        <td class="p-2 text-amber-400">~120 ms/query</td>
                        <td class="p-2">Scene VQA, grounded segmentation, activity classification</td>
                    </tr>
                    <tr class="border-b border-slate-800 bg-slate-900/30">
                        <td class="p-2 text-amber-400">Phi-3.5 Vision (4B)</td>
                        <td class="p-2">VLM</td>
                        <td class="p-2">8.5 GB INT4</td>
                        <td class="p-2 text-amber-400">~180 ms/query</td>
                        <td class="p-2">Multi-image temporal reasoning, OCR of markings/signage</td>
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="p-2 text-purple-400">OpenVLA-7B</td>
                        <td class="p-2">VLA (action)</td>
                        <td class="p-2">14 GB INT4</td>
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

    <p>The operational pattern emerging from DARPA OFFSET, Army FTUAS, and AFRL programs is a <strong>three-tier inference stack</strong>: an always-on fast detector (NanoOWL at 22 ms/frame) runs at full camera rate; a semantic VLM (PaliGemma 2) is triggered on detection events or operator queries; and a small language model (Phi-3 Mini) translates operator mission intent into structured waypoint and action sequences. This satisfies both real-time tracking latency and higher-level cognitive complexity — without a cloud connection.</p>

    <div class="bg-slate-800/60 border border-purple-700/50 rounded-xl p-5 mb-6 text-sm">
        <strong class="text-purple-400 block mb-3">ISR Scenario: Language-Directed Target Cueing (Zero Cloud Dependency)</strong>
        <div class="font-mono text-xs space-y-2 text-slate-300">
            <div class="flex items-start gap-3"><span class="text-slate-500 w-28 shrink-0">Operator (ATAK):</span><span class="text-white bg-slate-900 px-3 py-1 rounded">"Find any military-pattern vehicles staged near the treeline north of grid 4412"</span></div>
            <div class="flex items-start gap-3"><span class="text-slate-500 w-28 shrink-0">Phi-3 Mini:</span><span class="text-sky-300">→ parse_location("north treeline grid 4412") → plan: [nav_to_area, search_pattern(lawnmower), detect("military vehicle, truck, armored vehicle"), confirm_class(VLM), report_cot()]</span></div>
            <div class="flex items-start gap-3"><span class="text-slate-500 w-28 shrink-0">NanoOWL:</span><span class="text-emerald-300">→ text_query="truck, military vehicle" → 3 bounding-box detections @ 22 ms/frame → crops forwarded to VLM</span></div>
            <div class="flex items-start gap-3"><span class="text-slate-500 w-28 shrink-0">PaliGemma 2:</span><span class="text-amber-300">→ Q: "Describe camouflage pattern and vehicle type." → A: "Flatbed truck, woodland pattern, possible tow bar at rear" → confidence flag</span></div>
            <div class="flex items-start gap-3"><span class="text-slate-500 w-28 shrink-0">Action:</span><span class="text-rose-300">→ auto-loiter above contact, lock EO gimbal to target, transmit geo-tagged ATAK CoT message via encrypted datalink</span></div>
        </div>
        <p class="text-slate-500 text-xs mt-3">This entire loop executes on Jetson Orin NX with zero uplink. The operator receives a geo-tagged contact report — not a raw video stream — which reduces tactical datalink bandwidth by 95%.</p>
    </div>

    <div class="bg-slate-800/60 border border-amber-700/50 rounded-xl p-4 mb-6 text-sm">
        <strong class="text-amber-400 block mb-2">Critical Constraint: VLM Hallucination in Targeting Contexts</strong>
        <p class="text-slate-300 text-xs">VLMs can produce confident but factually wrong outputs — a property known as hallucination. This is not a software defect that patches will eliminate; it is a structural property of autoregressive models. In tactical contexts, all VLM outputs must be classified as <em>soft cues requiring human confirmation</em>, not autonomous targeting designations. Architecturally, confine VLMs to the Observe/Orient phases of the OODA loop. The Decide/Act loop must remain under human authority to satisfy Law of Armed Conflict (LOAC) and DoD Directive 3000.09 (Autonomous Weapons) requirements. Any architecture that routes VLM output directly to weapon system actuators is non-compliant by design.</p>
    </div>

    <h3>1.5 Counter-UAS Threat Environment and Electronic Warfare Resilience</h3>
    <p>The Ukraine conflict (2022–present) has empirically validated what EW engineers predicted for decades: sUAS operating in GPS-contested, RF-jammed environments are defeated if they rely on commercial-grade navigation and unencrypted C2 links. The engineering response is a layered EW-resilient architecture — not a single countermeasure, but a full defensive stack built into the platform from first principles.</p>

    <div class="bg-slate-800/60 border border-rose-700/50 rounded-xl p-5 mb-6 text-sm">
        <h4 class="mt-0 text-rose-400 border-none">Validated EW Threat Picture — Ukraine 2022–2025</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div>
                <strong class="text-white block mb-1">GNSS Jamming is Theater-Wide</strong>
                <p class="text-slate-400">Russian Krasukha-4, Zhitel, and R-330Zh systems jam GPS/GLONASS across multi-km radii near front lines. DJI Mavic-class platforms operating GPS-dependent routes are effectively defeated within minutes. VIO-primary navigation is now a baseline requirement, not a premium feature, for any platform intended for contested environments.</p>
            </div>
            <div>
                <strong class="text-white block mb-1">C2 Link Interdiction is Routine</strong>
                <p class="text-slate-400">Ukrainian FPV operators report 2.4GHz / 5.8GHz C2 links severed within seconds of entering jammed sectors. Frequency-hopping spread-spectrum (FHSS) on 433/868/915MHz provides partial resilience. The next-generation response is fully pre-programmed autonomous missions where the C2 link is optional, not required, for mission completion.</p>
            </div>
            <div>
                <strong class="text-white block mb-1">AI-Powered C-UAS is Operational</strong>
                <p class="text-slate-400">Both sides field ML-based RF fingerprinting and acoustic detection to locate and classify drones. Ukraine's DELTA C-UAS system fuses radar, RF, and optical data via AI. Russia's Gyurza-M and Penicillin systems detect drones acoustically. Engineers must treat their platform's acoustic, thermal, and RF signature as an active targeting input for the adversary's AI systems.</p>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
        <div class="bg-slate-900 border border-rose-800/50 rounded-xl p-4">
            <strong class="text-rose-400 block mb-2">GPS / GNSS Spoofing</strong>
            <p class="text-slate-400 text-xs mb-2">Adversary transmits false GNSS signals at power levels that override authentic satellite signals, causing the aircraft to navigate to an adversary-specified position.</p>
            <strong class="text-emerald-400 text-xs block mb-1">Engineering Mitigations:</strong>
            <ul class="text-xs text-slate-300 space-y-1">
                <li>> Multi-constellation GNSS (GPS+GLONASS+Galileo+BeiDou) — Septentrio mosaic-X5 with AIM+ anti-spoof</li>
                <li>> VIO consistency monitor: GPS vs. VIO disagreement &gt;3σ triggers GNSS exclusion and spoof alert</li>
                <li>> Inertial coasting bridge: IMU dead-reckoning during GNSS exclusion window (15–30 sec)</li>
                <li>> SNR anomaly detection: spoofed signals typically arrive at anomalously high signal strength</li>
                <li>> Cryptographic GNSS authentication: Galileo OSNMA (Open Service Navigation Message Authentication) active since 2023</li>
            </ul>
        </div>
        <div class="bg-slate-900 border border-amber-800/50 rounded-xl p-4">
            <strong class="text-amber-400 block mb-2">RF C2 Link Jamming</strong>
            <p class="text-slate-400 text-xs mb-2">Broadband noise or spot-frequency jamming severs the operator-to-drone C2 link, forcing the drone into a failsafe state (RTH or land) — allowing recovery or kinetic intercept of the airframe.</p>
            <strong class="text-emerald-400 text-xs block mb-1">Engineering Mitigations:</strong>
            <ul class="text-xs text-slate-300 space-y-1">
                <li>> FHSS C2 links: ExpressLRS (2.4GHz, 500 hops/sec), TBS Crossfire (868/915MHz)</li>
                <li>> Dual-band C2: primary RF + cellular LTE/5G on independent frequency domain</li>
                <li>> Pre-loaded autonomous contingency: full mission executable with zero uplink at any point</li>
                <li>> Satellite fallback: Iridium Certus or Starlink laser terminal for large-frame UAS</li>
                <li>> Minimize RF emission signature: operate in receive-only mode during approach; transmit only on event triggers</li>
            </ul>
        </div>
        <div class="bg-slate-900 border border-purple-800/50 rounded-xl p-4">
            <strong class="text-purple-400 block mb-2">Secure Platform Architecture</strong>
            <p class="text-slate-400 text-xs mb-2">Defense platforms must assume zero trust for all communications and resist both passive interception and active firmware injection by an adversary who captures the airframe.</p>
            <strong class="text-emerald-400 text-xs block mb-1">Engineering Mitigations:</strong>
            <ul class="text-xs text-slate-300 space-y-1">
                <li>> MAVLink 2 signed messages: HMAC-SHA256 per-packet integrity on every FC ↔ GCS message</li>
                <li>> AES-256-GCM encrypted payload: all telemetry and video streams encrypted in flight</li>
                <li>> Secure Boot: Jetson Orin PKC key fused into OTP e-fuses — only signed firmware loads</li>
                <li>> Disk encryption: LUKS2 on Jetson eMMC/NVMe for mission data at rest</li>
                <li>> Anti-tamper: cryptographic zeroize of mission data and keys on unauthorized physical access</li>
            </ul>
        </div>
    </div>

    <div class="interactive-panel">
        <h4 class="mt-0 border-none">GNSS-Denied Navigation Stack — Defense Degraded-Mode Priority Hierarchy</h4>
        <p class="text-sm mb-4">When GPS is jammed or spoofed, the EKF must degrade gracefully through a sensor priority hierarchy. Each layer compensates for the failure above it. The aircraft must remain controllable at every level.</p>
        <div class="space-y-2 text-xs font-mono">
            <div class="flex items-center gap-3 bg-slate-800 p-3 rounded border-l-4 border-emerald-500">
                <span class="text-emerald-400 w-6 font-bold shrink-0">L1</span>
                <span class="text-white font-bold w-36 shrink-0">Multi-const GNSS</span>
                <span class="text-slate-300">Primary. GPS + GLONASS + Galileo + BeiDou. OSNMA cryptographic authentication. Anti-spoof firmware active. Confidence: high.</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-800 p-3 rounded border-l-4 border-sky-500">
                <span class="text-sky-400 w-6 font-bold shrink-0">L2</span>
                <span class="text-white font-bold w-36 shrink-0">VIO (VSLAM)</span>
                <span class="text-slate-300">Visual-inertial odometry runs always. GNSS is fused as a correction when trusted, ignored when flagged. Drift: ~0.5% of distance. Primary nav source in GNSS-denied scenarios.</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-800 p-3 rounded border-l-4 border-amber-500">
                <span class="text-amber-400 w-6 font-bold shrink-0">L3</span>
                <span class="text-white font-bold w-36 shrink-0">Barometric Alt.</span>
                <span class="text-slate-300">Dual barometer sensors with sensor voting. Altitude hold when GPS barometric cross-check fails. Pixhawk 6X carries two independent MEMS baro sensors.</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-800 p-3 rounded border-l-4 border-amber-700">
                <span class="text-amber-600 w-6 font-bold shrink-0">L4</span>
                <span class="text-white font-bold w-36 shrink-0">IMU Dead Reck.</span>
                <span class="text-slate-300">Pure inertial integration. Drift accumulates at 1–5 m/min. 15–30 second bridge window only — sufficient to transition to VIO re-lock or execute contingency RTH.</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-800 p-3 rounded border-l-4 border-purple-500">
                <span class="text-purple-400 w-6 font-bold shrink-0">L5</span>
                <span class="text-white font-bold w-36 shrink-0">Terrain Relative Nav</span>
                <span class="text-slate-300">LiDAR or camera scan matched against pre-loaded terrain elevation map (DEM). Provides absolute position fix without any GNSS or comms. Requires onboard terrain database.</span>
            </div>
            <div class="flex items-center gap-3 bg-rose-900/30 p-3 rounded border-l-4 border-rose-600">
                <span class="text-rose-400 w-6 font-bold shrink-0">L6</span>
                <span class="text-white font-bold w-36 shrink-0">Contingency Execute</span>
                <span class="text-slate-300">If all nav layers fail: execute pre-programmed contingency behavior — hover in place, land immediately, or fly fixed heading/altitude to pre-set recovery zone. Never uncontrolled crash.</span>
            </div>
        </div>
    </div>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-5 mt-6 text-sm">
        <h4 class="mt-0 text-sky-400 border-none">C-UAS Sensor Fusion Threat Matrix</h4>
        <p class="text-slate-300 text-sm mb-4">Modern C-UAS systems fuse multiple detection modalities to minimize false negatives. An engineer's platform must be designed assuming all of these are active simultaneously in a peer-near adversary environment.</p>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div class="bg-slate-900 p-3 rounded">
                <strong class="text-rose-400 block mb-1">RF Detection</strong>
                <p class="text-slate-400 mb-2">Passive RF scanners (Dedrone RF-100, DroneShield DroneSentinel) fingerprint C2 link and video downlink spectra at km ranges. Any transmitting drone is detectable within seconds. Even low-power bursts are catalogued.</p>
                <p class="text-emerald-400 text-xs">Defense: minimize transmit windows; use directional antennas; operate receive-only during approach.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded">
                <strong class="text-amber-400 block mb-1">Acoustic Detection</strong>
                <p class="text-slate-400 mb-2">Microphone arrays classify rotor acoustic signatures at 200–400 m range. AI classifiers distinguish UAS from birds with &gt;95% accuracy. Hovering quads are highly detectable; high-speed fixed-wing is not.</p>
                <p class="text-emerald-400 text-xs">Defense: fixed-wing platforms, higher airspeeds, nap-of-earth flight significantly reduce acoustic detectability.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded">
                <strong class="text-sky-400 block mb-1">EO / IR Optical</strong>
                <p class="text-slate-400 mb-2">MWIR/LWIR cameras detect motor heat signatures against sky background at 1–3 km. Pan-tilt optical arrays with AI cueing cover wide sectors. Effective day and night. Small RCS platforms remain visually detectable.</p>
                <p class="text-emerald-400 text-xs">Defense: terrain masking, low-altitude nap-of-earth, thermal-dissipating airframe materials.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded">
                <strong class="text-purple-400 block mb-1">AESA Radar</strong>
                <p class="text-slate-400 mb-2">AESA radars (Fortem TrueView R20, Echodyne MESA-DAA) detect micro-UAS RCS as small as 0.001 m² at 3–5 km. High false-positive rate from birds and insects requires AI classifier fusion with RF and EO data for confirmation.</p>
                <p class="text-emerald-400 text-xs">Defense: low-observable airframe shaping, terrain masking, non-linear approach routes to complicate track correlation.</p>
            </div>
        </div>
    </div>

    <div class="bg-slate-800/60 border border-emerald-700/60 rounded-xl p-5 mt-6 text-sm">
        <h4 class="mt-0 text-emerald-400 border-none">Module 1 Synthesis: The Seven Engineering Disciplines of Autonomous sUAS</h4>
        <p class="text-slate-300 text-sm">Modern autonomous sUAS engineering is a system-of-systems problem spanning seven interlocking disciplines. Each downstream module in this guide addresses one slice in depth. An engineer who masters all seven can build platforms that operate reliably in the most demanding contested environments.</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs font-mono">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-emerald-500"><strong class="text-emerald-400">1. Compute Architecture</strong><br/><span class="text-slate-400">Orin Nano/NX SWaP-C tradeoffs, TensorRT optimization, power mode scheduling → Modules 2–4</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500"><strong class="text-sky-400">2. AI / ML Pipeline</strong><br/><span class="text-slate-400">YOLO11, VSLAM, VLM inference, foundation model stacks, synthetic data → Modules 10–12, 14</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-amber-500"><strong class="text-amber-400">3. Middleware & Comms</strong><br/><span class="text-slate-400">ROS 2 Jazzy, Micro XRCE-DDS, MAVLink 2 signing, RF link design → Modules 5–7</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-purple-500"><strong class="text-purple-400">4. Flight Control</strong><br/><span class="text-slate-400">PX4 / ArduPilot architecture, EKF3, sensor fusion, failsafe trees → Modules 8–9</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-rose-500"><strong class="text-rose-400">5. EW Resilience</strong><br/><span class="text-slate-400">Anti-spoof GNSS, FHSS C2, GNSS-denied nav stack, encrypted comms → This module + 16</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-amber-600"><strong class="text-amber-600">6. Swarm Coordination</strong><br/><span class="text-slate-400">Decentralized flocking, mesh comms, multi-agent task allocation → Module 15</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-slate-500 md:col-span-1"><strong class="text-slate-300">7. Power Electronics</strong><br/><span class="text-slate-400">Battery chemistry, PDB design, ESC architecture, thermal management → Module 8</span></div>
        </div>
    </div>
</div>
`;
