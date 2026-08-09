export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 17</span>
    <h2>Implementation Workflow</h2>
    <p>A complete engineering lifecycle for deploying an AI sUAS platform from initial requirements through operational deployment and sustained fielding. Each phase has explicit entry criteria and go/no-go gates before advancing. Skipping a phase does not save time — it relocates the cost of failure to a much more expensive part of the program.</p>

    <!-- ═══════════════════════════════════════════════════════════════
         OVERVIEW: V-MODEL & SYSTEMS ENGINEERING CONTEXT
    ════════════════════════════════════════════════════════════════ -->
    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-8">
        <h3 class="mt-0 text-sky-400 border-none text-lg font-bold">The V-Model: DoD Systems Engineering Foundation</h3>
        <p class="text-slate-300 text-sm mb-4">The DoD Systems Engineering (SE) lifecycle is structured as a <strong class="text-white">V-Model</strong>, where the left side defines requirements and design decomposition and the right side performs integration and verification at ascending levels of assembly. Every phase in this module maps to a node on the V. Skipping a left-side phase means the corresponding right-side verification step has nothing to verify against — creating untraceable risk that surfaces in field operations or accident investigations under <a href="https://www.cto.mil/wp-content/uploads/2025/07/MIL-STD-882E-w_CHANGE-1.pdf" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">MIL-STD-882E</a>.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
                <strong class="text-sky-400 block mb-2">Left Branch — Definition (Phases 1–3)</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1">
                    <li>Mission &amp; system-level requirements (ConOps, CONUSE)</li>
                    <li>Functional architecture and interface control documents (ICDs)</li>
                    <li>Software design: ROS 2 node graph, MAVLink protocol, AI model architecture</li>
                    <li>Component-level: firmware parameters, UART baud, camera intrinsics</li>
                </ul>
            </div>
            <div>
                <strong class="text-emerald-400 block mb-2">Right Branch — Verification (Phases 4–8)</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1">
                    <li>Unit test: SITL episode pass rate, inference latency benchmarks</li>
                    <li>Subsystem integration: HITL, tethered flight, sensor cal validation</li>
                    <li>System verification: full free-flight mission scenarios</li>
                    <li>Operational validation: exercise-level or field acceptance test</li>
                </ul>
            </div>
        </div>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-1">MIL-STD-882E (Change 1, 2023)</strong>
                <p class="text-slate-400">Standard Practice for System Safety. Requires a System Safety Management Plan (SSMP), hazard analysis (PHL, SSHA, SHA, O&amp;SHA), and a risk acceptance authority signature for residual risks above Mishap Risk Category II. Applicable to any DoD-funded or DoD-operated UAS program regardless of size.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 block mb-1">DoDI 5030.61 — Airworthiness Policy</strong>
                <p class="text-slate-400">Every DoD air vehicle requires an Airworthiness Determination from the appropriate Technical Airworthiness Authority (TAA) before flight. For sUAS, the Air Force TAA is AF/A3O; Army uses the Army Aviation Engineering Directorate (AAED). An Authority to Operate (ATO) is the document authorizing actual operations after airworthiness is confirmed.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-purple-500">
                <strong class="text-purple-400 block mb-1">DO-178C / DO-254 (Civil Airworthiness)</strong>
                <p class="text-slate-400">For FAA Type Certificated UAS (over 55 lbs or operating beyond Part 107), software must demonstrate Design Assurance Level (DAL) compliance under DO-178C (software) and DO-254 (hardware). Most sUAS under 55 lbs operate under Part 107 waivers and do not require DO-178C compliance — but DoD acquisitions may contractually require it regardless.</p>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         VIDEO 1 — SITL/HITL Testing for PX4 (Part 1: SITL)
    ════════════════════════════════════════════════════════════════ -->
    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">SITL and HITL Testing for PX4 — Part 1: Software in the Loop</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/j4EZoyoVZD8" title="HITL and SITL Testing for PX4 Part 1: Introduction to Software in the Loop" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-sm mt-2">Part 1 of a two-part series covering SITL and HITL testing pipelines for PX4. This video covers SITL setup, simulation configuration, and validating flight logic before touching hardware — directly mapping to Phases 2 and 3 of this module's workflow. Part 2 (HITL) is embedded further below.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         DEVSECOPS & CMMC CONTEXT PANEL
    ════════════════════════════════════════════════════════════════ -->
    <div class="bg-slate-800/60 border border-purple-700/60 rounded-xl p-6 mb-8">
        <h3 class="mt-0 text-purple-400 border-none text-lg font-bold">DevSecOps, CMMC 2.0, and the Defense Software Factory</h3>
        <p class="text-slate-300 text-sm mb-4">The DoD Software Modernization Implementation Plan FY25–26 formally abandoned waterfall development and mandated DevSecOps across all defense software programs. This means AI drone software — firmware, ROS 2 nodes, model weights — must flow through a continuous integration pipeline with automated security scanning at every commit. For programs touching Controlled Unclassified Information (CUI), the Cybersecurity Maturity Model Certification (CMMC) 2.0 applies.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-purple-500">
                <strong class="text-purple-400 block mb-1">CMMC 2.0 Levels</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1 mt-1">
                    <li><strong class="text-white">Level 1 (Foundational):</strong> 17 practices from NIST SP 800-171. Annual self-assessment. Applies to FCI (Federal Contract Information).</li>
                    <li><strong class="text-white">Level 2 (Advanced):</strong> 110 practices per NIST SP 800-171 Rev 2. Triennial third-party assessment (C3PAO) for critical programs. Most DoD sUAS programs with CUI.</li>
                    <li><strong class="text-white">Level 3 (Expert):</strong> 110+ practices including NIST SP 800-172 subset. Government-led assessment. Required for highest-priority programs.</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-1">Embedded DevSecOps Pipeline for sUAS</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1 mt-1">
                    <li><strong class="text-white">Source:</strong> Git branch protection, signed commits (GPG), secrets scanning (Gitleaks)</li>
                    <li><strong class="text-white">Build:</strong> Cross-compiled firmware, containerized ROS 2 nodes, TensorRT model export</li>
                    <li><strong class="text-white">Test:</strong> SITL regression suite (50+ episodes), SBOM generation, CVE scan on all packages</li>
                    <li><strong class="text-white">Release:</strong> Signed artifact bundles, automated version bumps, STIG compliance check</li>
                    <li><strong class="text-white">Deploy:</strong> OTA push to fleet via signed rsync or MQTT-based update agent</li>
                    <li><strong class="text-white">Monitor:</strong> Telemetry streaming to SIEM, anomaly detection on flight logs</li>
                </ul>
            </div>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-xs">
            <strong class="text-amber-400 block mb-2">CI/CD Pipeline Architecture for AI Drone Software</strong>
            <pre class="text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">Developer Push
  &#9492;&#9472;&#9472; GitHub Actions / GitLab CI
        &#9500;&#9472;&#9472; [SCAN]    Gitleaks (secrets), OWASP Dependency Check, Trivy (CVEs)
        &#9500;&#9472;&#9472; [BUILD]   colcon build (ROS 2 workspace), cross-compile ArduPilot firmware
        &#9500;&#9472;&#9472; [TEST]    SITL regression: 50 episodes, assert zero fly-aways, latency &lt; 100 ms
        &#9500;&#9472;&#9472; [SBOM]    Syft generates CycloneDX SBOM &#8594; Grype CVE scan
        &#9500;&#9472;&#9472; [SIGN]    cosign signs container image and firmware binary (SLSA Level 2+)
        &#9500;&#9472;&#9472; [STAGE]   Deploy to HITL testbed &#8594; automated smoke test (3 hover + AI track runs)
        &#9492;&#9472;&#9472; [RELEASE] Promote to fleet OTA channel on manual approval</pre>
            <p class="text-slate-500 mt-2">Each stage is a gate — a failure at any point blocks promotion. The pipeline produces a complete audit trail satisfying CMMC Level 2 SI.3 (malicious code protection) and CM.2 (configuration management) practices.</p>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         SITL vs HITL COMPARISON
    ════════════════════════════════════════════════════════════════ -->
    <div class="mb-8">
        <h3 class="text-xl font-bold text-white mb-4">SITL vs. HITL: When to Use Each</h3>
        <p class="text-slate-400 text-sm mb-4">Both simulation modes are mandatory for production-grade AI drone development. They are not alternatives — they are sequential gates. SITL validates your software logic; HITL validates your hardware integration. A bug found in SITL costs an hour. Found in HITL, it costs a day. Found in flight, it costs the aircraft.</p>
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
                <thead class="bg-slate-700 text-slate-300">
                    <tr>
                        <th class="p-3">Dimension</th>
                        <th class="p-3 text-amber-400">SITL</th>
                        <th class="p-3 text-emerald-400">HITL</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-700 text-xs">
                    <tr class="bg-slate-800">
                        <td class="p-3 text-white font-semibold">Hardware required</td>
                        <td class="p-3 text-slate-300">None — runs on developer laptop/workstation</td>
                        <td class="p-3 text-slate-300">Real flight controller (Pixhawk/Cube) connected to PC via USB</td>
                    </tr>
                    <tr class="bg-slate-900">
                        <td class="p-3 text-white font-semibold">Firmware</td>
                        <td class="p-3 text-slate-300">Compiled for host OS (x86/ARM), not FC silicon</td>
                        <td class="p-3 text-slate-300">Production firmware flashed on real FC — identical to field unit</td>
                    </tr>
                    <tr class="bg-slate-800">
                        <td class="p-3 text-white font-semibold">Sensor data</td>
                        <td class="p-3 text-slate-300">Fully simulated (Gazebo/Isaac Sim sensor plugins)</td>
                        <td class="p-3 text-slate-300">FC real IMU/baro/mag from hardware; GPS/camera mocked via MAVLink injection</td>
                    </tr>
                    <tr class="bg-slate-900">
                        <td class="p-3 text-white font-semibold">Timing fidelity</td>
                        <td class="p-3 text-slate-300">Can run at 4–10× real time; clock is software-controlled</td>
                        <td class="p-3 text-slate-300">Real time only — FC RTOS runs at 1 kHz, cannot be sped up</td>
                    </tr>
                    <tr class="bg-slate-800">
                        <td class="p-3 text-white font-semibold">What it validates</td>
                        <td class="p-3 text-slate-300">Algorithm correctness, AI model behavior, ROS 2 message flow, mission logic</td>
                        <td class="p-3 text-slate-300">FC firmware behavior, USB/UART latency, ESC timing, actual EKF performance under real sensor noise</td>
                    </tr>
                    <tr class="bg-slate-900">
                        <td class="p-3 text-white font-semibold">CI integration</td>
                        <td class="p-3 text-slate-300">Fully automatable — runs headless on every git push</td>
                        <td class="p-3 text-slate-300">Requires physical testbed; typically nightly or pre-release only</td>
                    </tr>
                    <tr class="bg-slate-800">
                        <td class="p-3 text-white font-semibold">ArduPilot setup</td>
                        <td class="p-3 text-slate-300"><code>sim_vehicle.py -v ArduCopter --console --map</code></td>
                        <td class="p-3 text-slate-300">Set <code>SIM_PIN_MASK</code>, enable HITL in GCS, connect FC via USB with simulation environment</td>
                    </tr>
                    <tr class="bg-slate-900">
                        <td class="p-3 text-white font-semibold">PX4 setup</td>
                        <td class="p-3 text-slate-300"><code>make px4_sitl gz_x500</code> (Gazebo Harmonic)</td>
                        <td class="p-3 text-slate-300">QGroundControl: Airframe → HITL Enabled; uncheck all AutoConnect except UDP</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         V-MODEL IMAGE
    ════════════════════════════════════════════════════════════════ -->
    <figure class="my-6">
        <img src="images/m17_v_model.jpg" alt="Systems Engineering V-Model diagram showing requirements decomposition on the left branch and integration/verification on the right branch" class="rounded-lg w-full max-w-2xl mx-auto block">
        <figcaption class="text-gray-400 text-sm text-center mt-2">The Systems Engineering V-Model as applied to DoD programs. Each phase of the implementation workflow maps to a node. Source: <a href="https://commons.wikimedia.org/wiki/File:V-model.JPG" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons</a> (public domain).</figcaption>
    </figure>

    <!-- ═══════════════════════════════════════════════════════════════
         TECHNOLOGY STACK REQUIREMENTS (CURRENT 2025–2026)
    ════════════════════════════════════════════════════════════════ -->
    <div class="mb-8">
        <h3 class="text-xl font-bold text-white mb-4">Current Technology Stack (2025–2026)</h3>
        <p class="text-slate-400 text-sm mb-4">This module targets the current production-ready toolchain. Legacy versions (ROS 1, JetPack 4.x, Gazebo Classic, AirSim) are not covered — they are deprecated and no longer receive security patches.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-2">Flight Stack</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1">
                    <li><strong class="text-white">ArduPilot 4.5+</strong> — ArduCopter / ArduPlane. UART MAVLink 2 to companion. Signed telemetry via <code>SERIAL_SIGNING_KEY</code>.</li>
                    <li><strong class="text-white">PX4 v1.14+</strong> — uXRCE-DDS bridge replaces MAVROS for direct ROS 2 topic publishing. Sub-millisecond FC→companion latency.</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-2">Companion Compute</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1">
                    <li><strong class="text-white">NVIDIA Jetson Orin Nano 8GB</strong> — 40 TOPS, 5–15 W, JetPack 6.x (Ubuntu 22.04), TensorRT 10.x, CUDA 12.x</li>
                    <li><strong class="text-white">NVIDIA Jetson AGX Orin 64GB</strong> — 275 TOPS, 15–40 W. For sensor-fusion-heavy missions requiring depth estimation + detection simultaneously.</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-2">Middleware &amp; Simulation</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1">
                    <li><strong class="text-white">ROS 2 Jazzy Jalisco</strong> — Ubuntu 24.04 LTS, EOL May 2029. Use Humble on Ubuntu 22.04 with JetPack 6.</li>
                    <li><strong class="text-white">Gazebo Harmonic</strong> — Current LTS simulator. ArduPilot plugin: <a href="https://github.com/ArduPilot/ardupilot_gazebo" target="_blank" rel="noopener noreferrer" class="text-sky-400">ardupilot_gazebo</a></li>
                    <li><strong class="text-white">NVIDIA Isaac Sim 4.x</strong> — Photorealistic AI training. RTX 4080+ required.</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-rose-400 block mb-2">AI / Inference</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1">
                    <li><strong class="text-white">YOLO26</strong> (Ultralytics) → TensorRT INT8 engine. NMS-free, so post-processing latency is constant rather than scene-dependent. 30–120 Hz on Orin Nano Super. YOLO11 remains a valid choice where a vendor NPU compiler has not yet validated the YOLO26 head.</li>
                    <li><strong class="text-white">NVIDIA DeepStream 7.x</strong> — Multi-stream pipeline with GStreamer. Handles camera → decode → inference → encode → stream as a single optimized graph.</li>
                    <li><strong class="text-white">TAO Toolkit</strong> — Transfer learning from NVIDIA pre-trained models with domain-specific fine-tuning.</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-purple-400 block mb-2">Ground Control &amp; Telemetry</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1">
                    <li><strong class="text-white">QGroundControl 4.x</strong> — Primary GCS for PX4 and ArduPilot. Mission planning, parameter editing, log download.</li>
                    <li><strong class="text-white">Mission Planner 1.3.80+</strong> — Windows-native ArduPilot GCS. Best for detailed parameter inspection and DataFlash log analysis.</li>
                    <li><strong class="text-white">MAVProxy</strong> — CLI GCS for SITL and headless operations. Scriptable via Python MAVLink modules.</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-teal-400 block mb-2">Security &amp; Supply Chain</strong>
                <ul class="list-disc pl-4 text-slate-400 space-y-1">
                    <li><strong class="text-white">Blue UAS Cleared List</strong> — moved from DIU to DCMA on 3 Dec 2025; the DCMA portal is authoritative. 39+ cleared platforms, 165+ cleared components. Required for DoD programs, and since the FCC Covered List action of Dec 2025 it is also a route to lawful U.S. sale (see Module 16).</li>
                    <li><strong class="text-white">SBOM (CycloneDX / SPDX)</strong> — Required for DoD software per EO 14028. Generate with Syft, scan CVEs with Grype.</li>
                    <li><strong class="text-white">MAVLink 2 Signed Messages</strong> — HMAC-SHA256 link authentication. Parameter: <code>SERIAL_SIGNING_KEY</code></li>
                </ul>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         OTA UPDATE & FLEET MANAGEMENT
    ════════════════════════════════════════════════════════════════ -->
    <div class="bg-slate-800/60 border border-teal-700/60 rounded-xl p-6 mb-8">
        <h3 class="mt-0 text-teal-400 border-none text-lg font-bold">OTA Updates for Fielded Systems</h3>
        <p class="text-slate-300 text-sm mb-4">Once a drone fleet is deployed, software must continue to evolve — AI model retraining, firmware security patches, ROS 2 node updates. Over-the-Air (OTA) updates require a hardened delivery pipeline that prevents injection of malicious firmware while maintaining rollback capability.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-teal-500">
                <strong class="text-teal-400 block mb-2">ArduPilot Firmware OTA</strong>
                <p class="text-slate-400 mb-2">ArduPilot supports flashing new firmware over MAVLink via the <code>COMMAND_LONG</code> / <code>FILE_TRANSFER_PROTOCOL</code> messages. A Python script using pymavlink can push a new .apj firmware file to a connected FC over the telemetry link at 57,600 or 115,200 baud.</p>
                <ul class="list-disc pl-4 text-slate-400 space-y-1">
                    <li>Verify signature of .apj file before push (SHA-256 checksum)</li>
                    <li>Maintain bootloader integrity — never OTA the bootloader partition</li>
                    <li>Post-update: automated parameter diff to detect unexpected resets to defaults</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-2">Companion Computer &amp; AI Model OTA</strong>
                <p class="text-slate-400 mb-2">The companion computer runs a systemd-managed update agent that polls a secure update server (HTTPS + mTLS). On approval, it downloads a signed tarball containing new ROS 2 packages or model weights, verifies the signature with cosign, and atomically swaps the active deployment.</p>
                <pre class="text-slate-300 bg-slate-800 p-2 rounded mt-2 overflow-x-auto">
# Simplified OTA agent logic (companion computer)
curl -fsSL --cert client.pem --key client.key \
  https://fleet.example.mil/updates/latest.tar.gz.sig \
  | cosign verify-blob --key cosign.pub -
# Verify passes &#8594; extract and swap
tar -xzf latest.tar.gz -C /opt/drone/staging/
systemctl stop inference.service
rsync -a /opt/drone/staging/ /opt/drone/current/
systemctl start inference.service
# Smoke test: 60s health check
sleep 60 &amp;&amp; ros2 topic hz /ai/detections --timeout 5</pre>
            </div>
        </div>
        <div class="mt-4 bg-slate-900 p-3 rounded border border-slate-700 text-xs">
            <strong class="text-rose-400 block mb-2">Fleet Monitoring and Rollback Protocol</strong>
            <p class="text-slate-400">Every fielded unit streams condensed telemetry (battery, CPU/GPU temp, inference FPS, EKF innovation norms) to a central fleet dashboard via an encrypted MQTT or gRPC channel. An anomaly-detection threshold triggers an automatic rollback if: (a) inference FPS drops below 50% of baseline after an update, (b) crash rate exceeds the 30-day rolling average by 3σ, or (c) a C-SIRT alert flags a CVE in the deployed package manifest. The previous signed artifact bundle is kept in <code>/opt/drone/rollback/</code> and can be activated in under 30 seconds.</p>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         VIDEO 2 — HITL Testing for PX4 (Part 2)
    ════════════════════════════════════════════════════════════════ -->
    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">SITL and HITL Testing for PX4 — Part 2: Hardware in the Loop</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/hgSc6fOrHt8" title="HITL and SITL Testing for PX4 Part 2: Introduction to Hardware in the Loop" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-sm mt-2">Part 2 covers Hardware-in-the-Loop (HITL) testing — running production PX4 firmware on the real flight controller while the simulator provides virtual sensor data. This is the critical gate between SITL validation (Phase 2) and physical bench build (Phase 3). Both videos are from the RIIS Engineering channel, published in late 2024.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         Gantt Timeline
    ════════════════════════════════════════════════════════════════ -->
    <div class="mt-8 mb-6">
        <h3 class="text-base font-semibold text-white mb-1">Typical 12-Week Build Timeline</h3>
        <p class="text-xs text-slate-400 mb-3">Phases 2 and 3 run in parallel (SITL and bench build overlap). Click any phase row to jump to its detail view.</p>
        <div class="gantt-container">
            <div class="gantt-header-row">
                <div class="gantt-label-col" style="font-size:0.65rem;">PHASE</div>
                <div class="gantt-weeks">
                    <span>Wk1</span><span>Wk2</span><span>Wk3</span><span>Wk4</span><span>Wk5</span>
                    <span>Wk6</span><span>Wk7</span><span>Wk8</span><span>Wk9</span><span>Wk10</span>
                    <span>Wk11</span><span>Wk12</span>
                </div>
            </div>
            <div class="gantt-row-item gantt-active" data-step="1" onclick="updateWorkflow(null, 1)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#0ea5e9;">P1</span>Requirements
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:0%;width:16.67%;background:#0ea5e9;">Wk&nbsp;1–2</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="2" onclick="updateWorkflow(null, 2)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#f59e0b;">P2</span>SITL Sim
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:8.33%;width:33.33%;background:#f59e0b;">Wk&nbsp;2–5</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="3" onclick="updateWorkflow(null, 3)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#f97316;">P3</span>Bench Build
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:16.67%;width:25%;background:#f97316;">Wk&nbsp;3–5</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="4" onclick="updateWorkflow(null, 4)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#10b981;">P4</span>Calibration
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:33.33%;width:16.67%;background:#10b981;">Wk&nbsp;5–6</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="5" onclick="updateWorkflow(null, 5)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#a855f7;">P5</span>Integration
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:41.67%;width:16.67%;background:#a855f7;">Wk&nbsp;6–7</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="6" onclick="updateWorkflow(null, 6)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#ef4444;">P6</span>Tethered
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:50%;width:16.67%;background:#ef4444;">Wk&nbsp;7–8</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="7" onclick="updateWorkflow(null, 7)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#ec4899;">P7</span>Free-Flight
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:58.33%;width:25%;background:#ec4899;">Wk&nbsp;8–10</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="8" onclick="updateWorkflow(null, 8)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#14b8a6;">P8</span>Deployment
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:75%;width:25%;background:#14b8a6;">Wk&nbsp;10–12</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Phase navigation + content panel -->
    <div class="flex flex-col md:flex-row gap-6 mt-6">

        <!-- Sidebar -->
        <div class="w-full md:w-1/3 space-y-2">
            <div class="workflow-step active p-3 rounded border border-slate-700" data-step="1" onclick="updateWorkflow(this, 1)">
                <strong class="text-sky-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 1</strong>
                <strong class="text-white block text-sm mb-1">Requirements &amp; Architecture</strong>
                <span class="text-xs text-slate-400">Mission definition, airframe and compute selection, power budget, ConOps, MIL-STD-882E SSMP.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="2" onclick="updateWorkflow(this, 2)">
                <strong class="text-amber-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 2</strong>
                <strong class="text-white block text-sm mb-1">SITL Simulation</strong>
                <span class="text-xs text-slate-400">Software-in-the-loop with Gazebo Harmonic or Isaac Sim, domain randomization, AI validation, CI integration.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="3" onclick="updateWorkflow(this, 3)">
                <strong class="text-orange-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 3</strong>
                <strong class="text-white block text-sm mb-1">Hardware Bench Build</strong>
                <span class="text-xs text-slate-400">Flash firmware, wire UART, configure software stack, verify comms, HITL validation.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="4" onclick="updateWorkflow(this, 4)">
                <strong class="text-emerald-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 4</strong>
                <strong class="text-white block text-sm mb-1">Sensor Calibration</strong>
                <span class="text-xs text-slate-400">Camera intrinsics/extrinsics, IMU thermal cal, GPS multi-constellation, time sync.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="5" onclick="updateWorkflow(this, 5)">
                <strong class="text-purple-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 5</strong>
                <strong class="text-white block text-sm mb-1">Airframe Integration</strong>
                <span class="text-xs text-slate-400">Vibration isolation, EMI shielding, thermal management, weight distribution, wiring harness.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="6" onclick="updateWorkflow(this, 6)">
                <strong class="text-rose-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 6</strong>
                <strong class="text-white block text-sm mb-1">Tethered Flight Test</strong>
                <span class="text-xs text-slate-400">Safe first flight — validate control loop, AI activation, log analysis, go/no-go criteria.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="7" onclick="updateWorkflow(this, 7)">
                <strong class="text-pink-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 7</strong>
                <strong class="text-white block text-sm mb-1">Free-Flight Validation</strong>
                <span class="text-xs text-slate-400">Incremental range expansion, FAA Part 107, edge-case testing, performance profiling.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="8" onclick="updateWorkflow(this, 8)">
                <strong class="text-teal-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 8</strong>
                <strong class="text-white block text-sm mb-1">Regulatory &amp; Deployment</strong>
                <span class="text-xs text-slate-400">FAA/DoD compliance, CMMC, SOPs, maintenance schedule, AI model CI/CD, OTA updates.</span>
            </div>
        </div>

        <!-- Content panel -->
        <div class="w-full md:w-2/3">
            <div id="wf-content" class="bg-slate-900 border border-slate-700 rounded-xl p-6 min-h-[640px]"></div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         ADDITIONAL RESOURCES
    ════════════════════════════════════════════════════════════════ -->
    <div class="mt-10 mb-4">
        <h3 class="text-xl font-bold text-white mb-4">Key References &amp; Standards</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-2">Regulatory &amp; Compliance</strong>
                <ul class="space-y-1 text-slate-400">
                    <li><a href="https://www.faa.gov/uas/commercial_operators/part_107_waivers" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">FAA Part 107 Waivers (BVLOS, Night, Over People)</a></li>
                    <li><a href="https://www.faa.gov/uas/resources/policy_library/Drone-Integration-Concept-of-Operations-May-2025.pdf" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">FAA Drone Integration ConOps (May 2025)</a></li>
                    <li><a href="https://www.cto.mil/wp-content/uploads/2025/07/MIL-STD-882E-w_CHANGE-1.pdf" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">MIL-STD-882E w/Change 1 (Sep 2023) — System Safety</a></li>
                    <li><a href="https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodi/503061p.PDF" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">DoDI 5030.61 — DoD Airworthiness Policy</a></li>
                    <li><a href="https://dodcio.defense.gov/Portals/0/Documents/Library/DoD%20Enterprise%20DevSecOps%20Fundamentals%20v2.5.pdf" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">DoD Enterprise DevSecOps Fundamentals v2.5</a></li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-2">Technical Documentation</strong>
                <ul class="space-y-1 text-slate-400">
                    <li><a href="https://ardupilot.org/dev/docs/sitl-with-gazebo.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">ArduPilot SITL with Gazebo — Official Docs</a></li>
                    <li><a href="https://docs.px4.io/main/en/simulation/hitl" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">PX4 HITL Simulation Guide</a></li>
                    <li><a href="https://docs.px4.io/main/en/sim_gazebo_gz/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">PX4 Gazebo Harmonic Simulation</a></li>
                    <li><a href="https://github.com/ArduPilot/ardupilot_gazebo" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">ArduPilot Gazebo Plugin (GitHub)</a></li>
                    <li><a href="https://arxiv.org/abs/2506.11400" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Step-by-Step Guide to Robust Autonomous Drone Testing (arXiv, 2025)</a></li>
                </ul>
            </div>
        </div>
    </div>
</div>
`;
