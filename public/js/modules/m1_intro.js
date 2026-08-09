export default `
<div class="fade-in">
    <div class="mb-10 text-center">
        <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 1</span>
        <h2 class="text-5xl font-extrabold text-white mt-2 mb-6">Fundamentals of Autonomous sUAS</h2>
        <p class="text-xl text-slate-400 max-w-3xl mx-auto">Before writing a single line of code or selecting a carrier board, engineers must master the theoretical framework of unmanned autonomy, the regulatory environment, and the operational constraints that shape every design decision.</p>
    </div>

    <!-- State of the Industry 2026 -->
    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-10">
        <h3 class="mt-0 text-sky-400 border-none text-lg font-bold">State of the Industry — August 2026</h3>
        <p class="text-slate-300 text-sm mb-4">Four major platform transitions have completed. Engineers must operate on the current stack — not legacy tutorials written for discontinued hardware or superseded model architectures.</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 block mb-2">Compute: Orin Super → Thor Family</strong>
                <p class="text-slate-400 text-xs">The NVIDIA Jetson Orin Nano <strong class="text-slate-200">Super</strong> (67 TOPS, 7–25W, $249) is the SWaP-C standard for sub-5 kg AI drones — the December 2024 "Super" firmware upgrade lifted it from 40 to 67 TOPS at half the original price. Orin NX Super reaches 157 TOPS (16 GB) in the smallest Jetson form factor. Above that sits the Thor line: AGX Thor T5000 (2070 FP4 TFLOPS, Blackwell) ships today, and NVIDIA announced the mainstream T3000 (865 FP4 TFLOPS, 32 GB) and T2000 (400 TFLOPS) in July 2026 for Q1 2027 availability. The original Jetson Nano is obsolete; the Google Coral TPU ecosystem has stagnated.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 block mb-2">Middleware: ROS 2 Jazzy / Lyrical + DDS</strong>
                <p class="text-slate-400 text-xs">ROS 1 (Noetic) reached End-of-Life in May 2025. Production work runs on ROS 2 Jazzy Jalisco (Ubuntu 24.04 LTS, supported to May 2029). ROS 2 Lyrical Luth (May 2026, Ubuntu 26.04 LTS, supported to May 2031) is the new long-term target — but the Jetson stack still ships Ubuntu 24.04, so Jazzy remains the pragmatic choice on-airframe through 2027. The FC bridge has transitioned from MAVROS to Micro XRCE-DDS — PX4 and ArduPilot publish flight state directly to ROS 2 topics via Fast DDS with substantially lower latency.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
                <strong class="text-purple-400 block mb-2">Perception: NMS-Free + Foundation Models</strong>
                <p class="text-slate-400 text-xs">Ultralytics YOLO26 (January 2026) removed non-maximum suppression from the detector entirely — a fully end-to-end architecture that cuts post-processing latency and simplifies TensorRT export, with up to 43% faster CPU inference. In parallel, small multimodal models (Gemma 4 E2B/E4B, Qwen3-VL) now run on an Orin Nano, so open-vocabulary detection and scene reasoning no longer require a cloud link. Classical CNN detectors are still the right tool for fixed, known target sets — but they are no longer the only tool.</p>
            </div>
        </div>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-2">Commercial Stack: Part 108 BVLOS at the Threshold</strong>
                <p class="text-slate-400 text-xs">The FAA's Part 108 BVLOS rule — the single largest regulatory unlock in commercial sUAS history — completed its comment cycle (NPRM 7 Aug 2025; reopened for right-of-way and electronic conspicuity 28 Jan–11 Feb 2026) and reached OIRA review on 10 July 2026, the last stop before publication. Publication is most likely late 2026 or early 2027, followed by a 6–12 month transition. Today only Wing, Amazon, UPS, and Zipline hold Part 135 air carrier certificates. Zipline passed 2 million cumulative deliveries in January 2026; Wing exceeds 1,000 deliveries/day in its densest markets. Inspection and maintenance is projected to overtake agriculture as the largest commercial segment, exceeding 25% of revenue by 2030.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-rose-500">
                <strong class="text-rose-400 block mb-2">Defense Stack: Blue UAS (DCMA) / STANAG 4586 / Encrypted MAVLink 2</strong>
                <p class="text-slate-400 text-xs">The DIU Blue UAS Framework transitioned to the Defense Contract Management Agency (DCMA) on 3 December 2025; the DCMA Blue List portal is now the authoritative source. The cleared list covers 39+ certified systems and 165+ components — Skydio X10D, Autel EVO Max 4T, BRINC Lemur 2, Teal 2 (Teledyne FLIR), Neros Archer, Hoverfly Spectre, Zone 5 Paladin — with Skydio X10, R10, and Dock for X10 added in July 2026. In December 2025 the FCC added all foreign-produced UAS and UAS critical components to its Covered List, then in July 2026 exempted equipment on the DCMA Blue list and gear assembled domestically with ≥65% U.S. component value. NATO STANAG 4586 defines the CUCS/VSM interface between a Universal Control Station and multiple UAV types. DoD sUAS mandate MAVLink 2 message signing (a keyed SHA-256 construction truncated to 48 bits — see Module 6) plus link-layer encryption of telemetry and video.</p>
            </div>
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
            <h4 class="text-sky-400 font-bold text-base mt-0 mb-3">FAA Part 107 — Key Requirements (current as of Aug 2026)</h4>
            <ul class="space-y-2 text-sm text-slate-300">
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Remote Pilot Certificate:</strong> Written knowledge test (60 questions). Certificate valid for 24 months (online recurrent training).</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Weight Limit:</strong> &lt;55 lbs (24.9 kg) MGTOW. FAA registration required for drones over 250 g.</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>VLOS Requirement:</strong> Must maintain unaided visual line-of-sight at all times (exceptions via waiver or new Part 108 BVLOS rules).</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Altitude:</strong> Maximum 400 ft AGL (or 400 ft above a structure within 400 ft of the structure).</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Airspace:</strong> Class B/C/D/E requires LAANC authorization or FAA DroneZone waiver. Class G is open.</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Waivers:</strong> BVLOS today still requires a per-operation 107.31 waiver or an exemption. Part 108 will replace that case-by-case regime — see the panel below for its status.</span></li>
            </ul>
        </div>
        <div class="bg-slate-800/60 border border-amber-700/60 rounded-xl p-5">
            <h4 class="text-amber-400 font-bold text-base mt-0 mb-3">Remote ID — Mandatory Since September 2023</h4>
            <p class="text-slate-300 text-sm mb-3">Remote ID functions as a "digital license plate," broadcasting identification and location data in real time. Compliance is required for all Part 107 operations.</p>
            <ul class="space-y-2 text-sm text-slate-300">
                <li class="flex gap-2"><span class="text-amber-400 shrink-0">&#9654;</span><span><strong>Standard Remote ID:</strong> Built into the aircraft. Broadcasts drone ID, operator location, altitude, speed, and emergency status via WiFi/Bluetooth.</span></li>
                <li class="flex gap-2"><span class="text-amber-400 shrink-0">&#9654;</span><span><strong>Broadcast Module:</strong> Attached module for legacy aircraft not equipped with built-in Remote ID.</span></li>
                <li class="flex gap-2"><span class="text-amber-400 shrink-0">&#9654;</span><span><strong>FRIA Exception:</strong> FAA-Recognized Identification Areas allow Remote ID-exempt operations for recreational fliers within designated areas.</span></li>
                <li class="flex gap-2"><span class="text-amber-400 shrink-0">&#9654;</span><span><strong>Electronic Conspicuity:</strong> Part 108 proposes extending the concept beyond Remote ID — BVLOS aircraft would broadcast position for detect-and-avoid deconfliction, not merely for identification. The FAA reopened comments specifically on this provision in early 2026.</span></li>
            </ul>
            <p class="mt-3"><a href="https://www.faa.gov/uas/getting_started/remote_id" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline text-sm">FAA Remote ID Official Page &#8599;</a></p>
        </div>
    </div>

    <!-- Part 108 status tracker -->
    <div class="bg-slate-800/60 border border-emerald-700/60 rounded-xl p-5 mb-6">
        <h4 class="mt-0 text-emerald-400 font-bold text-base border-none mb-2">Part 108 BVLOS — Rulemaking Status Tracker</h4>
        <p class="text-slate-300 text-sm mb-4">Part 108 is the rule that converts BVLOS from a waiver you beg for into an operating authority you qualify for. Its arrival is the gating factor for essentially every scaled commercial autonomy business case — delivery, linear infrastructure inspection, precision agriculture, and public safety. Track it; do not assume it.</p>
        <div class="space-y-2 text-xs font-mono">
            <div class="flex items-center gap-3 bg-slate-900 p-2.5 rounded border-l-4 border-emerald-600"><span class="text-emerald-400 w-28 shrink-0">7 Aug 2025</span><span class="text-slate-300">NPRM published in the Federal Register.</span></div>
            <div class="flex items-center gap-3 bg-slate-900 p-2.5 rounded border-l-4 border-emerald-600"><span class="text-emerald-400 w-28 shrink-0">6 Oct 2025</span><span class="text-slate-300">Initial public comment period closed.</span></div>
            <div class="flex items-center gap-3 bg-slate-900 p-2.5 rounded border-l-4 border-emerald-600"><span class="text-emerald-400 w-28 shrink-0">28 Jan 2026</span><span class="text-slate-300">Comments reopened on right-of-way and electronic conspicuity provisions.</span></div>
            <div class="flex items-center gap-3 bg-slate-900 p-2.5 rounded border-l-4 border-emerald-600"><span class="text-emerald-400 w-28 shrink-0">11 Feb 2026</span><span class="text-slate-300">Reopened comment window closed.</span></div>
            <div class="flex items-center gap-3 bg-slate-900 p-2.5 rounded border-l-4 border-amber-500"><span class="text-amber-400 w-28 shrink-0">10 Jul 2026</span><span class="text-slate-300">Final rule delivered to OIRA for review — the last stop before publication.</span></div>
            <div class="flex items-center gap-3 bg-slate-900 p-2.5 rounded border-l-4 border-sky-500"><span class="text-sky-400 w-28 shrink-0">Now</span><span class="text-slate-300">Under OIRA review. Statutory review can run 90 days, so publication is most likely late 2026 or early 2027.</span></div>
            <div class="flex items-center gap-3 bg-slate-900 p-2.5 rounded border-l-4 border-slate-600"><span class="text-slate-400 w-28 shrink-0">+6–12 mo</span><span class="text-slate-300">Expected compliance transition period after the final rule takes effect.</span></div>
        </div>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-2">What the proposed framework contains</strong>
                <ul class="text-slate-300 space-y-1 list-disc list-inside">
                    <li><strong class="text-white">Two approval tiers:</strong> Permitted Operations (lower burden) and an Operational Certificate (higher capability).</li>
                    <li><strong class="text-white">Five risk categories</strong> scaled by population density beneath the operation.</li>
                    <li><strong class="text-white">Operational-area approvals</strong> replacing today's per-flight waivers — the change that actually enables scale.</li>
                    <li><strong class="text-white">New crew roles:</strong> Operations Supervisor and Flight Coordinator, formalizing one-to-many supervision.</li>
                    <li><strong class="text-white">Scope up to 1,320 lb</strong>, well beyond the 55 lb Part 107 ceiling.</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-2">Technical requirements that drive your design</strong>
                <ul class="text-slate-300 space-y-1 list-disc list-inside">
                    <li><strong class="text-white">Detect-and-avoid (DAA)</strong> — sensors and logic to deconflict from crewed traffic without a human watching the sky.</li>
                    <li><strong class="text-white">Remote ID</strong> plus continuous position tracking throughout the operation.</li>
                    <li><strong class="text-white">UTM integration</strong> — participation in traffic management rather than isolated flight.</li>
                </ul>
                <p class="text-slate-400 mt-2">Each of these is a system your airframe either has or does not. None can be bolted on cheaply after the fact.</p>
            </div>
        </div>
        <p class="text-slate-400 text-xs mt-3"><strong class="text-slate-200">Engineering implication:</strong> design detect-and-avoid, electronic conspicuity, and command-and-control link integrity in <em>now</em>. Retrofitting DAA sensors and a certifiable C2 link into an airframe already in production is the most common and most expensive mistake in commercial UAS programs. Note also that published predictions of this rule's timing have repeatedly slipped — earlier forecasts of a spring 2026 publication did not hold. Track the docket yourself rather than planning against a secondary source's date, including this one.</p>
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
            <p class="text-slate-300 text-sm mt-3">As of December 2025, the Blue UAS list transitioned to the <strong class="text-white">Defense Contract Management Agency (DCMA)</strong> under the new Unmanned Systems-Experimental Command (US-X), headquartered in Palmdale, California, aligning with SecDef Hegseth's directive for "small UAS domain dominance by end of 2027." The DCMA Blue List portal — not the legacy DIU page — is now the authoritative source of truth.</p>
            <p class="text-slate-300 text-sm mt-3">A far broader restriction now applies outside DoD. NDAA FY2025 §1709 directed the FCC to add DJI and Autel equipment to its Covered List by 22 December 2025 absent a national-security clearance; none was issued. The interagency determination that followed went well beyond the statute, and on <strong class="text-white">23 December 2025 the FCC added all foreign-produced UAS and UAS critical components to the Covered List</strong> — a first-of-its-kind category-wide action. Covered List placement blocks new equipment authorizations, and therefore lawful U.S. marketing and import. In <strong class="text-white">July 2026 the FCC granted two exceptions</strong>: equipment on the DCMA Blue UAS Cleared List, and equipment assembled domestically with at least 65% U.S.-produced component value.</p>
            <p class="text-slate-300 text-sm mt-3">For a commercial integrator this is the single most consequential regulatory change of the period. NDAA compliance used to be a federal-procurement concern that private operators could ignore; it is now a question of whether your airframe, radio, or flight controller can be lawfully sold in the United States at all. Treat sourcing as a design constraint from the first schematic — see Module 3 for how this propagates down to batteries and ESCs.</p>
        </div>
        <div class="bg-slate-800/60 border border-emerald-700/60 rounded-xl p-5">
            <h4 class="text-emerald-400 font-bold text-base mt-0 mb-3">Key Blue UAS Cleared Platforms (as of Aug 2026)</h4>
            <div class="space-y-2 text-xs text-slate-300">
                <div class="flex justify-between border-b border-slate-700 pb-1">
                    <span class="text-white font-semibold">Skydio X10D</span>
                    <span class="text-slate-400">AI obstacle avoidance, EO/IR, encrypted C2</span>
                </div>
                <div class="flex justify-between border-b border-slate-700 pb-1">
                    <span class="text-white font-semibold">Skydio X10 / R10 / Dock</span>
                    <span class="text-slate-400">Added July 2026 — dockable autonomous ops</span>
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

    <!-- Section 1.4 Commercial & Industrial -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.4 Commercial and Industrial sUAS — The Other Half of the Field</h3>

    <p class="text-slate-300 mb-5">Defense programs get the headlines, but most sUAS engineering jobs — and most flight hours — are commercial. The technical stack is almost identical: the same Pixhawk, the same Jetson, the same ROS 2 graph, the same EKF. What differs is the <strong class="text-white">objective function</strong>. A defense platform optimizes for survivability in a contested environment. A commercial platform optimizes for cost per inspected asset, and it must satisfy a certification authority rather than a threat model. Understanding both makes you a better engineer in either, because the failure modes are not the same ones.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-5">
            <h4 class="text-sky-400 font-bold text-base mt-0 mb-3">Where the Commercial Market Actually Is (2026)</h4>
            <ul class="space-y-2 text-sm text-slate-300">
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Inspection &amp; maintenance</strong> — power lines, wind turbines, flare stacks, bridges, roofs, cell towers. Projected to exceed 25% of all commercial drone revenue by 2030, overtaking agriculture as the largest single segment. Autonomy value: repeatable flight paths produce comparable imagery across time, which is what actually enables defect trending.</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Delivery</strong> — a ~$1.47 B market in 2026, forecast to roughly $6.7 B by 2031 (≈36% CAGR). Zipline passed 2 million cumulative deliveries in January 2026; Wing exceeds 1,000 deliveries per day in its densest service areas.</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Agriculture</strong> — multispectral survey and increasingly heavy-lift spray. Spray aircraft are the segment where sUAS mass genuinely approaches the 25 kg Part 107 ceiling, which drags in an entirely different set of airworthiness questions.</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Public safety</strong> — Drone as First Responder (DFR) programs, where a docked aircraft launches automatically on a 911 call and arrives before ground units. This is the commercial application closest to defense autonomy in its latency and reliability demands.</span></li>
                <li class="flex gap-2"><span class="text-sky-400 shrink-0">&#9654;</span><span><strong>Survey &amp; construction</strong> — photogrammetry and LiDAR for volumetrics and progress tracking. The one segment where absolute geometric accuracy, not perception, is the hard requirement — RTK/PPK, not AI.</span></li>
            </ul>
        </div>
        <div class="bg-slate-800/60 border border-amber-700/60 rounded-xl p-5">
            <h4 class="text-amber-400 font-bold text-base mt-0 mb-3">How Commercial Constraints Differ from Defense</h4>
            <div class="space-y-3 text-xs text-slate-300">
                <div><strong class="text-white block">Certification replaces survivability.</strong> Nobody is jamming your GPS over a wind farm. Instead you must demonstrate to a regulator that your detect-and-avoid, C2 link, and failsafe logic meet a documented reliability target — and you must be able to show the evidence. Traceability and test artifacts are engineering deliverables, not paperwork.</div>
                <div><strong class="text-white block">Unit economics replace mission success.</strong> A defense platform can be attritable. A commercial platform must survive thousands of sorties, because the business case is cost per flight hour. That pushes hard toward redundancy, condition monitoring, and predictable maintenance intervals.</div>
                <div><strong class="text-white block">Repeatability replaces adaptability.</strong> The most valuable commercial autonomy is boring: fly the identical path, at the identical time of day, to the identical camera settings, so that this month's image differences are real defects rather than lighting artifacts.</div>
                <div><strong class="text-white block">Third-party risk replaces force protection.</strong> Operating over people and infrastructure makes ground risk the dominant safety concern. Parachute recovery systems, flight termination logic, and geofencing carry weight that a defense design might spend on EW hardening.</div>
                <div><strong class="text-white block">Data governance is a first-class requirement.</strong> Imagery of private property, faces, and license plates creates retention, access, and privacy obligations that shape your storage and telemetry architecture from day one.</div>
            </div>
        </div>
    </div>

    <figure class="my-6">
        <img src="images/m1_zipline_launch.jpg" alt="A Zipline delivery drone launching from a catapult at the company's California test facility" class="rounded-lg w-full object-cover" style="height:420px;">
        <figcaption class="text-gray-400 text-sm text-center mt-2">A Zipline delivery aircraft launching from the company's California test facility. Zipline passed 2 million cumulative deliveries in January 2026 — the clearest evidence that BVLOS autonomy is an operating business rather than a demonstration. Note the catapult launch and fixed-wing planform: delivery economics reward cruise efficiency over hover capability, the direct application of the disk-loading and endurance mathematics in Module 2. Source: <a href="https://commons.wikimedia.org/wiki/File:Zipline_Drone_Launch.jpg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons</a> (Roksenhorn, CC BY-SA 4.0)</figcaption>
    </figure>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500 mb-6">
        <strong class="text-emerald-400 block mb-1">The Convergence: Docked Autonomy</strong>
        <p class="text-slate-400 text-sm">The fastest-moving commercial architecture is the <strong class="text-slate-200">drone-in-a-box</strong>: a weatherproof dock that charges, shelters, and launches the aircraft with no one on site. It forces every hard autonomy problem at once — reliable automated takeoff and precision landing, self-diagnosis before launch, BVLOS authority, and remote operations centers supervising many aircraft at once. Skydio's Dock for X10 reaching the Blue UAS Cleared List in July 2026 is a useful signal of where defense and commercial requirements are converging: the same docked-autonomy capability that inspects a substation unattended also performs persistent base security. When you build for one, you are most of the way to the other.</p>
    </div>

    <!-- Section 1.5 NATO STANAG 4586 -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.5 NATO STANAG 4586 — Interoperability Standard</h3>

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
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.6 Levels of Aerial Autonomy (AL0–AL5)</h3>
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
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.7 The Aerial OODA Loop</h3>
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
                <p class="text-slate-400 text-xs">VSLAM: <em>where am I?</em> Object detection (YOLO26): <em>what is around me?</em> Heaviest compute load. TensorRT-optimized INT8 inference on the Orin DLA cores.</p>
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
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.8 The Edge vs. Cloud Paradigm</h3>
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
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.9 Compute Stack: Flight Controller + Companion Computer</h3>

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
                    <td class="p-3 text-slate-300">Jetson Orin Nano Super (sub-3 kg platforms)</td>
                    <td class="p-3 text-slate-400 text-xs">67 TOPS INT8 (sparse), 8 GB LPDDR5 @ 102 GB/s. TensorRT inference (YOLO26, VSLAM, small VLMs). ROS 2 Jazzy node host. Micro XRCE-DDS bridge to FC. 7–25W power envelope. $249 dev kit.</td>
                    <td class="p-3 text-slate-400 text-xs">MIPI CSI-2 (cameras), USB3, PCIe, Ethernet, UART to FC</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-purple-400 font-semibold">Companion (Mid / High)</td>
                    <td class="p-3 text-slate-300">Jetson Orin NX Super 16GB → AGX Orin 64GB</td>
                    <td class="p-3 text-slate-400 text-xs">Orin NX Super: 157 TOPS in the smallest Jetson form factor, 10–40W — the sweet spot for 3–10 kg multirotors. AGX Orin 64GB: 275 TOPS, multi-camera VSLAM plus concurrent foundation-model inference, Secure Boot with PKC e-fuse, 15–60W.</td>
                    <td class="p-3 text-slate-400 text-xs">PCIe Gen4, 6× MIPI CSI-2, 10 GbE, CAN FD</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-amber-400 font-semibold">Compute (Leading Edge)</td>
                    <td class="p-3 text-slate-300">Jetson AGX Thor T5000 — shipping</td>
                    <td class="p-3 text-slate-400 text-xs">2070 FP4 TFLOPS (Blackwell), 128 GB LPDDR5X. ~7.5× Orin AI performance, ~3.5× energy efficiency. Physical AI / foundation model inference at the edge. Runs JetPack 7 (Linux 6.8, Ubuntu 24.04).</td>
                    <td class="p-3 text-slate-400 text-xs">PCIe Gen5, 14× Arm Neoverse V3AE cores, 40–130W</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-semibold">Compute (Announced)</td>
                    <td class="p-3 text-slate-300">Jetson Thor T3000 / T2000 — Q1 2027</td>
                    <td class="p-3 text-slate-400 text-xs">Announced July 2026 to bring Thor to mainstream volume robotics. T3000: 865 FP4 TFLOPS, 1536-core Blackwell GPU, 8-core Neoverse, 32 GB LPDDR5X @ 273 GB/s, 25 GbE. T2000: 400 TFLOPS. T3000 emulation available today under JetPack 7.2.1 — you can port software before silicon arrives.</td>
                    <td class="p-3 text-slate-400 text-xs">25 GbE (T3000), PCIe Gen5, MIPI CSI-2</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Section 1.9 PX4 vs ArduPilot -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.10 Flight Stack: PX4 vs. ArduPilot</h3>

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
                    <td class="p-3 text-slate-400 font-semibold">Current Stable (Aug 2026)</td>
                    <td class="p-3 text-slate-300"><strong class="text-white">v1.16.0</strong> — adds bidirectional DShot ESC telemetry, built-in flight log encryption, a reworked rover architecture, and new board support (CUAV 7-Nano, BlueRobotics Navigator, 3DR Control Zero H7 OEM Rev G).</td>
                    <td class="p-3 text-slate-300"><strong class="text-white">Copter 4.7.0</strong> — released 21 July 2026, alongside Rover 4.7.0 and Sub 4.7.0.</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-400 font-semibold">Choose It When</td>
                    <td class="p-3 text-slate-300">You need a permissive license for a closed-source product, tight native ROS 2 integration, or you are building a research/VTOL/precision platform.</td>
                    <td class="p-3 text-slate-300">You need maximum vehicle-type coverage, the broadest peripheral driver library, mature GNSS-denied flight modes, or you are content with GPL obligations.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Section 1.10 Foundation Models -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.11 Foundation Models and Language-Directed Autonomy</h3>
    <p class="text-slate-300 mb-4">The most significant AI paradigm shift of 2024–2026 is the deployment of Vision-Language Models (VLMs) at the tactical edge. Rather than training narrow, task-specific detectors for every target class (requiring weeks of labeled data and GPU training), engineers now deploy small multimodal foundation models that generalize from natural language prompts — enabling zero-shot ISR tasking without model retraining or cloud connectivity.</p>

    <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 mb-6">
        <h4 class="text-sky-400 font-bold text-base mt-0 mb-3">Edge-Deployable Model Tiers — Jetson Orin Nano Super, 25W (Aug 2026)</h4>
        <p class="text-slate-400 text-xs mb-4">Every model below runs entirely on-airframe with no network uplink. Read the throughput column as an <em>order of magnitude for planning</em>, not a spec sheet — real numbers swing by 2–3× with runtime (TensorRT vs. llama.cpp vs. HuggingFace transformers), quantization, image resolution, and prompt length. Always re-benchmark on your own board before committing to a loop rate.</p>
        <div class="overflow-x-auto">
            <table class="w-full text-xs font-mono">
                <thead>
                    <tr class="text-slate-400 border-b border-slate-700">
                        <th class="p-2 text-left">Model</th>
                        <th class="p-2 text-left">Type</th>
                        <th class="p-2 text-left">Footprint</th>
                        <th class="p-2 text-left">Observed Throughput</th>
                        <th class="p-2 text-left">Capability</th>
                    </tr>
                </thead>
                <tbody class="text-slate-300">
                    <tr class="border-b border-slate-800">
                        <td class="p-2 text-emerald-400">YOLO26-n / -s</td>
                        <td class="p-2">Closed-set detect</td>
                        <td class="p-2">&lt;0.1 GB INT8</td>
                        <td class="p-2 text-emerald-400">Full camera rate (30–60 FPS)</td>
                        <td class="p-2">NMS-free end-to-end detection. The always-on tier — deterministic latency, no post-processing tail</td>
                    </tr>
                    <tr class="border-b border-slate-800 bg-slate-900/30">
                        <td class="p-2 text-sky-400">NanoOWL (OWL-ViT)</td>
                        <td class="p-2">Open-vocab detect</td>
                        <td class="p-2">0.6 GB FP16</td>
                        <td class="p-2 text-emerald-400">~20–25 ms/frame</td>
                        <td class="p-2">Text-prompted detection with no pre-defined class list — retask by editing a string</td>
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="p-2 text-sky-400">OpenCLIP / SigLIP</td>
                        <td class="p-2">Zero-shot classify</td>
                        <td class="p-2">~0.9 GB FP16</td>
                        <td class="p-2 text-emerald-400">~10 ms/crop</td>
                        <td class="p-2">Classify detection crops against arbitrary text labels after detection</td>
                    </tr>
                    <tr class="border-b border-slate-800 bg-slate-900/30">
                        <td class="p-2 text-amber-400">Gemma 3n E2B / Gemma 4 E2B</td>
                        <td class="p-2">Multimodal SLM</td>
                        <td class="p-2">~2 GB INT4</td>
                        <td class="p-2 text-amber-400">~136 tok/s prefill, ~17 tok/s decode</td>
                        <td class="p-2">Scene VQA and captioning. Gemma 4 (Apr 2026) adds E2B/E4B effective-parameter tiers built for exactly this envelope</td>
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="p-2 text-amber-400">Qwen3-VL 2B</td>
                        <td class="p-2">VLM</td>
                        <td class="p-2">~2 GB INT4</td>
                        <td class="p-2 text-amber-400">~0.9 queries/s (transformers), ~0.5 (llama.cpp)</td>
                        <td class="p-2">Grounded VQA, OCR of markings and signage, multi-image reasoning</td>
                    </tr>
                    <tr class="border-b border-slate-800 bg-slate-900/30">
                        <td class="p-2 text-amber-400">Cosmos-Reason2-2B</td>
                        <td class="p-2">Physical-reasoning VLM</td>
                        <td class="p-2">~2 GB INT4</td>
                        <td class="p-2 text-amber-400">~1 query/s</td>
                        <td class="p-2">Qwen3-VL-2B post-trained by NVIDIA for physical/spatial reasoning — better at "can I fit through that gap"</td>
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="p-2 text-purple-400">SmolVLA</td>
                        <td class="p-2">VLA (action)</td>
                        <td class="p-2">&lt;1 GB</td>
                        <td class="p-2 text-amber-400">Consumer GPU / CPU viable</td>
                        <td class="p-2">Language-conditioned action policy explicitly designed for cheap hardware — the practical successor to OpenVLA-7B at this SWaP tier</td>
                    </tr>
                    <tr class="bg-slate-900/30">
                        <td class="p-2 text-purple-400">Qwen3 4B / LFM2.5-1.2B</td>
                        <td class="p-2">LLM planner</td>
                        <td class="p-2">1–2.5 GB INT4</td>
                        <td class="p-2 text-emerald-400">~54 tok/s (1.2B class)</td>
                        <td class="p-2">Parse operator intent into structured waypoint / action sequences</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <p class="text-slate-300 mb-4">The architecture that has settled out across both defense programs (DARPA OFFSET, Army FTUAS, AFRL) and commercial inspection autonomy is a <strong class="text-white">three-tier inference stack</strong>, and the tiers exist because their latency budgets differ by two orders of magnitude:</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs">
        <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
            <strong class="text-emerald-400 block mb-1">Tier 1 — Reflex (10–30 ms)</strong>
            <span class="text-slate-400">YOLO26 or NanoOWL at full frame rate. Feeds obstacle avoidance and tracking. Must never miss a frame, so it gets a guaranteed slice of the GPU and never shares with a model that can stall.</span>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
            <strong class="text-amber-400 block mb-1">Tier 2 — Semantic (0.5–2 s)</strong>
            <span class="text-slate-400">A VLM (Gemma 4 E2B, Qwen3-VL 2B) fires on detection events or operator queries — "what is this structure," "is that corrosion." Event-triggered, never in the control loop.</span>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
            <strong class="text-purple-400 block mb-1">Tier 3 — Deliberative (seconds)</strong>
            <span class="text-slate-400">A small LLM turns mission intent into a waypoint plan. Runs pre-flight or on re-tasking, not continuously. Its output is a plan a human can inspect before execution.</span>
        </div>
    </div>
    <p class="text-slate-300 mb-4">The discipline that makes this work is <strong class="text-white">strict tier isolation</strong>. A Tier 3 model that blocks the GPU for 800 ms while Tier 1 needs a 30 ms obstacle update will crash the aircraft. Pin the reflex tier to its own CUDA stream or DLA core, run heavy models at lower priority, and treat any semantic output that arrives late as simply stale rather than something to wait for.</p>

    <div class="bg-slate-800/60 border border-amber-700/50 rounded-xl p-4 mb-6 text-sm">
        <strong class="text-amber-400 block mb-2">Critical Constraint: VLM Hallucination in Targeting Contexts</strong>
        <p class="text-slate-300 text-xs">VLMs can produce confident but factually wrong outputs — a property called hallucination. This is not a patchable software bug; it is a structural property of autoregressive models. In tactical contexts, all VLM outputs must be classified as <em>soft cues requiring human confirmation</em>, not autonomous targeting designations. Architecturally, confine VLMs to the Observe/Orient phases of the OODA loop. The Decide/Act loop must remain under human authority to satisfy Law of Armed Conflict (LOAC) and <a href="https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodd/300009p.pdf" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">DoD Directive 3000.09</a> (Autonomous Weapons) requirements.</p>
    </div>

    <!-- Section 1.11 EW -->
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.12 Counter-UAS and Electronic Warfare Resilience</h3>

    <p class="text-slate-300 mb-5">The Ukraine conflict (2022–present) has empirically validated what EW engineers predicted for decades: sUAS operating in GPS-contested, RF-jammed environments are defeated if they rely on commercial-grade navigation and unencrypted C2 links. The engineering response is a layered EW-resilient architecture.</p>

    <!-- Image: Black Hornet -->
    <figure class="my-6">
        <img src="images/m1_black_hornet.jpg" alt="South Carolina Army National Guard soldiers training with Black Hornet Nano UAV" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">S.C. Army National Guard soldiers train with the Teledyne FLIR Black Hornet 3 Nano UAV — a 33g pocket-sized ISR drone with 25 min endurance and EO/IR cameras, fielded under the Army Soldier-Borne Sensor program. Source: <a href="https://www.dvidshub.net/image/8583524" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">DVIDS</a> (U.S. Army, public domain)</figcaption>
    </figure>

    <div class="bg-slate-800/60 border border-rose-700/50 rounded-xl p-5 mb-6 text-sm">
        <h4 class="mt-0 text-rose-400 border-none font-bold">Validated EW Threat Picture — Ukraine 2022–2026</h4>
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
        <div class="mt-4 bg-slate-900 p-4 rounded border-l-4 border-amber-500">
            <strong class="text-amber-400 block mb-2">The 2025–2026 Inflection: Fiber-Optic FPV Breaks the Jamming Paradigm</strong>
            <p class="text-slate-400 text-xs mb-3">The most consequential tactical development since 2024 is not an AI advance — it is a spool of glass. Fiber-optic FPV drones trail single-mode optical fiber from an onboard spool, carrying both control and video down the cable instead of over RF. The consequence is categorical rather than incremental: <strong class="text-slate-200">there is no RF signal to jam, and no RF emission to direction-find.</strong> Every countermeasure built on the assumption that a drone must radiate is bypassed at once.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                    <strong class="text-white block mb-1">Measured Performance</strong>
                    <p class="text-slate-400">Typical effective range 10–15 km; Russian fiber drones have been reported at roughly 80% mission success at 20 km — in sectors where RF FPV success collapses under jamming.</p>
                </div>
                <div>
                    <strong class="text-white block mb-1">The Cost Trade</strong>
                    <p class="text-slate-400">$1,500–3,000 per airframe versus $300–700 for RF FPV, and the spool is consumed every mission. Against high-value targets in jammed sectors the cost-per-effect still favors fiber, because effectiveness does not degrade under EW.</p>
                </div>
                <div>
                    <strong class="text-white block mb-1">The Engineering Limits</strong>
                    <p class="text-slate-400">Fiber snags on vegetation and structures, constrains aggressive maneuvering, adds spool mass, and is strictly one-way — the aircraft cannot be recovered and reused. Spent fiber also physically marks the launch bearing.</p>
                </div>
            </div>
            <p class="text-slate-400 text-xs mt-3">The countermeasure response moved to physics that does not care about the control link. In December 2025 Epirus demonstrated its <strong class="text-slate-200">Leonidas</strong> high-power microwave system defeating a fiber-optic FPV drone in live fire (footage released 13 January 2026) — the first public HPM defeat of a fiber-guided target. HPM couples energy directly into the airframe's electronics regardless of how it is commanded. Gen II Leonidas is credited with roughly 2 km effective range, solid-state GaN. <strong class="text-slate-200">The general lesson for the design engineer:</strong> when your adversary's countermeasure targets the link, change the link; when they target the silicon, you need hardening, not protocol design.</p>
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
                <li>&gt; MAVLink 2 signed messages: keyed SHA-256 (48-bit truncated) per-packet authentication</li>
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
    <h3 class="text-2xl font-bold text-white mt-10 mb-4">1.13 Authoritative References and Further Reading</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
            <h4 class="text-sky-400 font-bold text-sm mt-0 mb-3">Regulatory and Policy</h4>
            <ul class="space-y-2 text-sm">
                <li><a href="https://www.faa.gov/uas/commercial_operators" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">FAA Part 107 — Commercial sUAS Operators</a></li>
                <li><a href="https://www.faa.gov/uas/getting_started/remote_id" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">FAA Remote ID Requirements</a></li>
                <li><a href="https://www.diu.mil/blue-uas-cleared-list" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Blue UAS Cleared List (DIU/DCMA)</a></li>
                <li><a href="https://www.congress.gov/crs-product/IF12668" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">CRS: U.S. Army Small Uncrewed Aircraft Systems Programs</a></li>
                <li><a href="https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodd/300009p.pdf" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">DoD Directive 3000.09: Autonomous Weapons Systems</a></li>
                <li><a href="https://www.federalregister.gov/documents/2025/08/07/2025-14340/normalizing-unmanned-aircraft-systems-beyond-visual-line-of-sight-operations" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Part 108 NPRM — Normalizing UAS BVLOS Operations (Federal Register)</a></li>
                <li><a href="https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-107" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">14 CFR Part 107 — Full Regulatory Text (eCFR)</a></li>
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
                <li><a href="https://docs.ultralytics.com/models/yolo26/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Ultralytics YOLO26 — Model Documentation</a></li>
                <li><a href="https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-thor/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">NVIDIA Jetson Thor — Product Page</a></li>
                <li><a href="https://mavlink.io/en/guide/message_signing.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">MAVLink 2 Message Signing Specification</a></li>
            </ul>
        </div>
    </div>

    <!-- Module Synthesis -->
    <div class="bg-slate-800/60 border border-emerald-700/60 rounded-xl p-5 mt-6">
        <h4 class="mt-0 text-emerald-400 font-bold border-none text-lg">Module 1 Synthesis: The Seven Engineering Disciplines of Autonomous sUAS</h4>
        <p class="text-slate-300 text-sm mb-4">Modern autonomous sUAS engineering is a system-of-systems problem spanning seven interlocking disciplines. Each downstream module in this guide addresses one slice in depth. An engineer who masters all seven can build platforms that operate reliably in the most demanding contested environments.</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-emerald-500"><strong class="text-emerald-400">1. Compute Architecture</strong><br/><span class="text-slate-400">Orin Nano/NX SWaP-C tradeoffs, TensorRT optimization, power mode scheduling → Modules 2–4</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500"><strong class="text-sky-400">2. AI / ML Pipeline</strong><br/><span class="text-slate-400">YOLO26, VSLAM, VLM inference, foundation model stacks, synthetic data → Modules 10–12, 14</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-amber-500"><strong class="text-amber-400">3. Middleware &amp; Comms</strong><br/><span class="text-slate-400">ROS 2 Jazzy, Micro XRCE-DDS, MAVLink 2 signing, RF link design → Modules 6–8</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-purple-500"><strong class="text-purple-400">4. Flight Control</strong><br/><span class="text-slate-400">PX4 / ArduPilot architecture, EKF3, sensor fusion, failsafe trees → Modules 5, 9</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-rose-500"><strong class="text-rose-400">5. EW Resilience</strong><br/><span class="text-slate-400">Anti-spoof GNSS, FHSS C2, GNSS-denied nav stack, encrypted comms → This module + 16</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-amber-600"><strong class="text-amber-600">6. Swarm Coordination</strong><br/><span class="text-slate-400">Decentralized flocking, mesh comms, multi-agent task allocation → Module 15</span></div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-slate-500 md:col-span-1"><strong class="text-slate-300">7. Power Electronics</strong><br/><span class="text-slate-400">Battery chemistry, PDB design, ESC architecture, thermal management → Module 3</span></div>
        </div>
    </div>
</div>
`;
