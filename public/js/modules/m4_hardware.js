export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 4</span>
    <h2>Hardware Stack: Compute, Flight Control &amp; Sensors</h2>
    <p>Selecting the correct compute platform is the most consequential engineering decision in the drone AI lifecycle. This module covers the full stack: AI compute silicon, flight controllers, perception sensors, LiDAR, GPS, and the Blue UAS compliance framework for DoD procurement. We begin with the interactive market map, then drill into every layer.</p>

    <!-- ============================================================
         4.1 AI SILICON LANDSCAPE — CHART (PRESERVED)
    ============================================================ -->
    <h3>4.1 The AI Silicon Landscape Visualization</h3>
    <p>This chart maps the current market. Bubble size represents approximate module cost. Notice how newer NPUs are drastically pulling down the cost-to-performance ratio compared to legacy GPU-based compute. Memory bandwidth (GB/s) is often the real constraint — TOPS figures are plotted but the bandwidth annotation is the engineering-critical number.</p>

    <div class="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 mb-10 shadow-lg">
        <div class="chart-container" style="height: 600px;">
            <canvas id="hwChartMain"></canvas>
        </div>
    </div>

    <!-- ============================================================
         4.2 AI COMPUTE SILICON
    ============================================================ -->
    <h3>4.2 AI Compute Silicon — Exhaustive Profiles</h3>

    <!-- Jetson image -->
    <figure class="my-6">
        <img src="images/m4_jetson_orin_nx.jpg" alt="NVIDIA Jetson Orin NX module on a carrier board, Computex 2025" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">NVIDIA Jetson Orin NX on a carrier board at Computex 2025. Source: <a href="https://commons.wikimedia.org/wiki/File:Nvidia_Jetson_Orin_NX_on_a_motherboard_Computex_2025.jpg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons / 4300streetcar, CC BY 4.0</a></figcaption>
    </figure>

    <div class="space-y-8">
        <!-- NVIDIA Family -->
        <div class="hw-card p-8 rounded-xl relative overflow-hidden">
            <div class="absolute -right-10 -top-10 opacity-5">
                <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor" class="text-white"><path d="M10,10 L90,10 L90,90 L10,90 Z"/></svg>
            </div>
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                NVIDIA Jetson Family <span class="ml-4 text-xs bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded border border-emerald-800">THE HEAVYWEIGHTS</span>
            </h4>
            <p class="text-slate-300 mt-4 mb-6">NVIDIA dominates high-end robotics compute due to CUDA, TensorRT, and the Isaac ROS ecosystem. If you are running multiple deep learning models concurrently (e.g., YOLO for object detection, a Transformer for depth estimation, plus VIO-SLAM), Jetson is often the only platform with the memory bandwidth to avoid bottlenecks. JetPack 6.2 (January 2025) added <em>Super Mode</em> — a software-only uplift that unlocks higher GPU/memory clocks on existing production modules without reflashing hardware.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="bg-slate-900 p-4 rounded border border-emerald-800">
                    <strong class="text-emerald-400 text-lg block mb-2">Jetson Orin Nano (8GB) <span class="text-xs bg-emerald-900/50 px-2 py-0.5 rounded">BASELINE</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 40 TOPS (INT8)</li>
                        <li>> GPU: 1024-core Ampere architecture</li>
                        <li>> RAM: 8GB 128-bit LPDDR5 @ 68 GB/s</li>
                        <li>> Power: 7W efficiency / 15W performance</li>
                        <li>> Price: ~$149 (module, volume)</li>
                        <li>> JetPack: 6.x, Ubuntu 22.04, CUDA 12.6</li>
                        <li>> Reality Check: Adequate for single-stream inference (YOLO26n/s). Memory bandwidth at 68 GB/s bottlenecks concurrent multi-model loads. Upgrade to Nano Super for new designs.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-emerald-700">
                    <strong class="text-emerald-400 text-lg block mb-2">Jetson Orin Nano Super <span class="text-xs bg-emerald-900/50 px-2 py-0.5 rounded">2025 — NEW SWEET SPOT</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 67 TOPS (INT8) — 1.7x base Nano</li>
                        <li>> GPU: 1024-core Ampere architecture</li>
                        <li>> RAM: 8GB 128-bit LPDDR5 @ 102 GB/s (+50%)</li>
                        <li>> Power: 7W / 25W — dynamically switchable</li>
                        <li>> Price: ~$249 (developer kit)</li>
                        <li>> JetPack: 6.2+ required for Super Mode; Ubuntu 22.04, CUDA 12.6, TensorRT 10.x</li>
                        <li>> Form: Same module footprint as base Nano — carrier boards are compatible</li>
                        <li>> Reality Check: <span class="text-emerald-400">Default recommendation for sub-5kg AI drone builds as of 2026.</span> The 102 GB/s bandwidth eliminates the bottleneck that forced model-size trade-offs between YOLO26m and VSLAM. Switch to 7W during cruise, 25W during active inference.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-sky-700">
                    <strong class="text-sky-400 text-lg block mb-2">Jetson Orin NX (16GB) <span class="text-xs bg-sky-900/50 px-2 py-0.5 rounded">SUPER MODE: 157 TOPS</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 100 TOPS (INT8) base; 157 TOPS with JetPack 6.2 Super Mode</li>
                        <li>> GPU: 1024-core Ampere @ up to 1173 MHz (Super Mode)</li>
                        <li>> RAM: 16GB 128-bit LPDDR5 @ 102 GB/s</li>
                        <li>> Power: 10W–25W base; 40W Super Mode (active cooling mandatory)</li>
                        <li>> Reality Check: Super Mode unlocks a 2x inference uplift via software alone — no hardware change needed, just reflash to JetPack 6.2. The 40W Super Mode power draw requires aggressive thermal design; enclosed fuselages without active cooling will throttle within minutes. Best for >5kg VTOL or UGV platforms with power budget. <a href="https://developer.nvidia.com/blog/nvidia-jetpack-6-2-brings-super-mode-to-nvidia-jetson-orin-nano-and-jetson-orin-nx-modules/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">JetPack 6.2 release notes</a></li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-slate-700">
                    <strong class="text-sky-400 text-lg block mb-2">Jetson AGX Orin (32/64GB)</strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 275 TOPS (INT8)</li>
                        <li>> GPU: 2048-core Ampere + 64 Tensor Cores</li>
                        <li>> RAM: 32GB or 64GB LPDDR5 @ 204 GB/s</li>
                        <li>> Power: 15W–60W configurable</li>
                        <li>> Weight: ~700g in dev kit form; ~90g bare module</li>
                        <li>> Reality Check: Too heavy for most sUAS (&lt;5kg). Primarily deployed on large octocopters (&gt;10kg payload), UGVs, and fixed robotic systems. The 204 GB/s bandwidth enables simultaneous inference across 4+ deep learning models without contention.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-purple-800 md:col-span-2">
                    <strong class="text-purple-400 text-lg block mb-2">Jetson AGX Thor (T5000) — Blackwell Architecture <span class="text-xs bg-purple-900/50 px-2 py-0.5 rounded">GA: AUGUST 2025</span></strong>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-slate-300 mt-2">
                        <ul class="space-y-1">
                            <li>> AI Compute: 2,070 TFLOPS FP4-Sparse / 1,035 TFLOPS FP8-Dense</li>
                            <li>> GPU: 2560-core Blackwell + 96 5th-gen Tensor Cores (supports MIG)</li>
                            <li>> CPU: 14-core Arm Neoverse-V3AE @ 2.6 GHz</li>
                            <li>> RAM: 128 GB LPDDR5X @ 273 GB/s</li>
                            <li>> Storage: 1 TB NVMe M.2 on dev kit</li>
                            <li>> Connectivity: 4x 25GbE QSFP28, 16x CSI-2 lanes, PCIe Gen 5, USB 3.2</li>
                        </ul>
                        <ul class="space-y-1">
                            <li>> Power: 40W–130W configurable TDP</li>
                            <li>> Dev Kit Price: $3,499</li>
                            <li>> vs Orin: 7.5x AI compute, 3.5x energy efficiency at similar power</li>
                            <li>> Early adopters: Boston Dynamics, Agility Robotics, Figure, Amazon Robotics</li>
                            <li>> Carrier boards: Auvidea X242 (dual 10GbE, PCIe x16); ConnectTech in development</li>
                            <li>> Reality Check: Designed for humanoid robots and multi-modal foundation model inference (GR00T, LLaVA-class VLMs). 40–130W TDP rules it out for all current sUAS designs. Best path for ground robots and heavy-lift VTOL (&gt;15kg payload). Carrier board ecosystem is nascent — allocate 6–12 months for integration on new platforms. <a href="https://nvidianews.nvidia.com/news/nvidia-blackwell-powered-jetson-thor-now-available-accelerating-the-age-of-general-robotics" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">NVIDIA press release</a></li>
                        </ul>
                    </div>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-sky-800 md:col-span-2">
                    <strong class="text-sky-400 text-lg block mb-2">Jetson Thor T3000 / T2000 — Mainstream Thor <span class="text-xs bg-sky-900/50 px-2 py-0.5 rounded">ANNOUNCED JULY 2026 · SHIPS Q1 2027</span></strong>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-slate-300 mt-2">
                        <ul class="space-y-1">
                            <li>> T3000: 865 TFLOPS FP4 — 1536-core Blackwell GPU</li>
                            <li>> T3000 CPU: 8-core Arm Neoverse</li>
                            <li>> T3000 RAM: 32 GB LPDDR5X @ 273 GB/s</li>
                            <li>> T3000 networking: 25 GbE</li>
                            <li>> T2000: 400 TFLOPS — the volume/cost-down tier</li>
                        </ul>
                        <ul class="space-y-1">
                            <li>> Availability: both modules Q1 2027</li>
                            <li>> Available now: T3000 <strong>emulation mode</strong> under JetPack 7.2.1</li>
                            <li>> Reality Check: This is the announcement that actually matters for aviation. The T5000's 128 GB and 130W ceiling were built for humanoids; the T3000 at 32 GB brings Blackwell and FP4 into a power and memory envelope a large VTOL or heavy multirotor can plausibly carry. <strong class="text-sky-400">Practical advice: start porting now against emulation.</strong> Software written today for a T3000 target runs on Thor silicon when it lands, and the memory-layout assumptions you bake in are the expensive thing to change later.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mt-6 bg-slate-800/50 border border-sky-800/60 rounded-xl p-5 text-sm">
                <strong class="text-sky-400 block mb-3">Low-SWaP Carrier Boards — Stripping Developer Kit Overhead</strong>
                <p class="text-slate-300 mb-3">NVIDIA Jetson developer kits target desktop prototyping — full-size USB hubs, PCIe slots, DisplayPort, and industrial connectors add 400–800g of dead weight on a drone. Third-party carrier boards expose only what a drone needs.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-slate-300">
                    <div class="bg-slate-900 p-3 rounded border border-slate-700">
                        <strong class="text-emerald-400 block mb-2">Neousys FLYC-300 (Orin NX/Nano)</strong>
                        <ul class="space-y-1">
                            <li>> Weight: 297g (vs ~600g for Jetson dev kit)</li>
                            <li>> Power input: 4S–14S LiPo direct (no BEC cascade)</li>
                            <li>> Interfaces: 2x MIPI CSI-2, USB 3.1, GbE, CAN, UART</li>
                            <li>> Form: 100x75mm — mounts on standard 30.5mm drone stack</li>
                            <li>> Thermal: active fan + conduction pad for enclosed fuselages</li>
                        </ul>
                    </div>
                    <div class="bg-slate-900 p-3 rounded border border-slate-700">
                        <strong class="text-amber-400 block mb-2">Other Options</strong>
                        <ul class="space-y-1">
                            <li>> <strong>ConnectTech Quasar (Orin NX):</strong> 95x75mm, MIL-spec connectors, -40 to +85°C. Industrial/defense grade.</li>
                            <li>> <strong>Auvidea JNX42 (Orin NX):</strong> 60x45mm — smallest available. For &lt;1kg micro-drones.</li>
                            <li>> <strong>Seeed reComputer J40 (Orin NX):</strong> Consumer-grade, 2x MIPI CSI, GbE. Budget option for sub-$600 builds.</li>
                            <li>> <strong>Holybro Pixhawk 6X + Jetson Baseboard:</strong> Integrates Pixhawk 6X flight controller with Orin NX/Nano on one PCB — eliminates UART wiring between FC and companion computer.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mt-6 bg-slate-800/50 border border-purple-800/60 rounded-xl p-5 text-sm">
                <strong class="text-purple-400 block mb-3">JetPack 6.x vs JetPack 7 — Which Do You Target?</strong>
                <p class="text-slate-300 mb-3">JetPack 6 (GA June 2024) was a breaking change from JetPack 5 — APT upgrade is not supported, a full reflash is required. JetPack 6.2 (January 2025) added Super Mode. <strong class="text-white">JetPack 7</strong> is the current generation for Thor-class hardware, moving to <strong class="text-white">Ubuntu 24.04 LTS and Linux kernel 6.8</strong>, with 7.2.1 adding T3000 emulation support.</p>
                <div class="bg-slate-900 p-3 rounded border-l-4 border-amber-500 mb-3">
                    <p class="text-slate-300 text-xs"><strong class="text-amber-400">The decision rule:</strong> Orin-class modules (Nano/NX/AGX Orin) run JetPack 6.x on Ubuntu 22.04, which pairs naturally with ROS 2 Humble and — via containers — Jazzy. Thor-class modules run JetPack 7 on Ubuntu 24.04, the native home of ROS 2 Jazzy. This is why ROS 2 Lyrical Luth (May 2026, Ubuntu 26.04) is <em>not</em> yet the practical on-airframe choice despite being the newest LTS: no shipping Jetson runs 26.04 natively. Target Jazzy, containerize aggressively, and let the base OS lag — fighting the vendor BSP to chase a newer Ubuntu is the classic way to lose a month.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs text-slate-300">
                    <div class="bg-slate-900 p-3 rounded border border-slate-700">
                        <strong class="text-purple-400 block mb-1">OS &amp; Kernel</strong>
                        <ul class="space-y-1">
                            <li>> Ubuntu 22.04 LTS (from 20.04)</li>
                            <li>> Linux 5.15 LTS kernel</li>
                            <li>> Measured boot + security hardening</li>
                            <li>> Decoupled CUDA stack updates</li>
                        </ul>
                    </div>
                    <div class="bg-slate-900 p-3 rounded border border-slate-700">
                        <strong class="text-purple-400 block mb-1">AI Stack</strong>
                        <ul class="space-y-1">
                            <li>> CUDA 12.6 (from 11.x in JP5)</li>
                            <li>> TensorRT 10.x (from 8.x)</li>
                            <li>> cuDNN 9.x / VPI 3.x</li>
                            <li>> TensorRT-LLM (8B models viable on AGX Orin)</li>
                            <li>> Super Mode: up to 2x inference uplift (JP 6.2+)</li>
                        </ul>
                    </div>
                    <div class="bg-slate-900 p-3 rounded border border-slate-700">
                        <strong class="text-purple-400 block mb-1">Robotics Stack</strong>
                        <ul class="space-y-1">
                            <li>> Native ROS 2 Humble + Jazzy support</li>
                            <li>> isaac_ros packages on apt</li>
                            <li>> Camera drivers now out-of-tree</li>
                            <li>> GR00T robot foundation model SDK</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dedicated NPUs -->
        <div class="hw-card p-8 rounded-xl relative overflow-hidden">
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                Dedicated NPUs (Hailo, Axelera) <span class="ml-4 text-xs bg-purple-900/50 text-purple-400 px-3 py-1 rounded border border-purple-800">THE EFFICIENCY KINGS</span>
            </h4>
            <p class="text-slate-300 mt-4 mb-6">Neural Processing Units are ASICs — they cannot run general-purpose code or render graphics. They do one thing: multiply matrices extremely fast at very low power. The key metric is TOPS/Watt, not raw TOPS.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="bg-slate-900 p-4 rounded border border-purple-700">
                    <strong class="text-purple-400 text-lg block mb-2">Hailo-8 / Hailo-8L M.2 Modules</strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Hailo-8: 26 TOPS @ ~2.5W — PCIe Gen-3 x4 (M-Key, 2280)</li>
                        <li>> Hailo-8L: 13 TOPS @ ~1.5W — PCIe Gen-3 x2 (A+E Key, 2230) — fits Raspberry Pi 5 M.2 HAT+</li>
                        <li>> Compiler: Hailo Dataflow Compiler (DFC) — offline compile step required; supports ONNX, TFLite, PyTorch export</li>
                        <li>> Model Zoo: 100+ pre-compiled models (YOLOv5/v8, ResNet, EfficientDet)</li>
                        <li>> Reality Check: Hailo-8L at ~$25 is the correct modern replacement for the discontinued Google Coral. Hailo-8 is the go-to co-processor when the main board (RK3588 SBC or Orin Nano) needs a dedicated second inference stream (thermal + EO simultaneously), keeping the GPU free for VSLAM.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-purple-700">
                    <strong class="text-purple-400 text-lg block mb-2">Hailo-15 Family <span class="text-xs bg-purple-900/50 px-2 py-0.5 rounded">CAMERA-EMBEDDED AI</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> 15H = 20 TOPS / 15M = 11 TOPS / 15L = 7 TOPS</li>
                        <li>> Integrated ISP: handles up to 12MP raw at 600 Mpixel/s</li>
                        <li>> Onboard quad-core Cortex-A53 CPU (host tasks on-die)</li>
                        <li>> Video: 4K HDR encode/decode + real-time inference in same chip</li>
                        <li>> Power: sub-2W for 15L/15M (fanless camera-grade)</li>
                        <li>> Reality Check: Architecturally different from Hailo-8 — it is a camera SoC, not an M.2 plug-in. Designed to replace the standalone ISP in a gimballed payload. Sends inference results (bounding boxes, metadata) over MAVLink instead of raw video, which dramatically reduces bandwidth and eliminates a separate compute board. Best for smart payload gimbal designs.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-purple-700">
                    <strong class="text-purple-400 text-lg block mb-2">Hailo-10H M.2 <span class="text-xs bg-purple-900/50 px-2 py-0.5 rounded">GEN-AI AT THE EDGE</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 40 TOPS INT4 — note the INT4, not INT8</li>
                        <li>> Power: under 5W for the full generative workload</li>
                        <li>> Form: M.2, drops into an existing socket alongside a host SBC</li>
                        <li>> Demonstrated: ~10 tokens/s on a 7B-class LLM; ~5 s/image on Stable Diffusion 2.1 — both inside the 5W envelope</li>
                        <li>> Qualification: AEC-Q100 Grade 2 automotive, production start 2026</li>
                        <li>> Reality Check: This is the part that makes an onboard VLM plausible without a Jetson. The trade is precision — INT4 weights cost accuracy relative to INT8, and the Dataflow Compiler still requires an offline compile step per model, so you cannot swap architectures in the field. Best fit: a fixed VLM or captioning model that must run continuously at very low power, alongside a conventional detector on separate silicon.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-amber-700">
                    <strong class="text-amber-400 text-lg block mb-2">Axelera Metis M.2 <span class="text-xs bg-amber-900/50 px-2 py-0.5 rounded">214 TOPS IN M.2 2280</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 214 TOPS (INT8) — highest TOPS/W in M.2 form factor (2026)</li>
                        <li>> Power: 6–8W @ ~27–33 TOPS/W</li>
                        <li>> Memory: 1GB on-module DRAM</li>
                        <li>> Interface: PCIe Gen-3 x4 (M-Key 2280)</li>
                        <li>> Architecture: Quad-core Metis AIPU, Digital In-Memory Computing (D-IMC), RISC-V control core</li>
                        <li>> SDK: Voyager SDK — Python + C++ API, YAML pipeline design, ONNX input (YOLOv5/v7/v8 supported)</li>
                        <li>> Reality Check: D-IMC architecture minimizes DRAM access — critical for power-constrained airframes. Ecosystem still maturing vs Hailo, but ONNX coverage handles most deployed detection models. Evaluate when you need &gt;100 TOPS without a full Jetson carrier board stack.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-red-900/50">
                    <strong class="text-red-400 text-lg block mb-2">Google Coral Edge TPU <span class="text-xs bg-red-900/50 px-2 py-0.5 rounded">DEPRECATED — DO NOT USE</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 4 TOPS</li>
                        <li>> Power: 2W</li>
                        <li>> Interface: USB 3.0 or PCIe M.2</li>
                        <li>> Reality Check: The pioneer of cheap edge AI. Hardware unchanged since 2019; ecosystem stagnated — TFLite only, no PyTorch or ONNX path. 4 TOPS cannot run YOLO26n at real-time speeds. <span class="text-red-400">Not recommended for new designs.</span> The Hailo-8L (13 TOPS, ~$25, M.2 A+E key) is the direct modern replacement at similar cost.</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- SoC Integrations -->
        <div class="hw-card p-8 rounded-xl relative overflow-hidden">
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                Integrated SoCs (Rockchip, Ambarella) <span class="ml-4 text-xs bg-amber-900/50 text-amber-400 px-3 py-1 rounded border border-amber-800">THE ALL-IN-ONES</span>
            </h4>
            <p class="text-slate-300 mt-4 mb-6">These chips combine powerful ARM CPUs, dedicated Image Signal Processors (ISPs), and NPUs onto a single silicon die. They are cost-effective but often require more integration effort than Jetson — RKNN Toolkit operator coverage gaps are real and must be validated against your specific model graph before committing to the platform.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="bg-slate-900 p-4 rounded border border-amber-700">
                    <strong class="text-amber-400 text-lg block mb-2">Rockchip RK3588 (Orange Pi 5, Radxa Rock 5)</strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> CPU: Quad Cortex-A76 @ 2.4GHz + Quad Cortex-A55 @ 1.8GHz</li>
                        <li>> NPU: 6 TOPS (INT4/INT8/INT16/FP16)</li>
                        <li>> RAM: Up to 32GB LPDDR4x/5 @ 51.2 GB/s</li>
                        <li>> Video: 8K H.265 decode / 8K H.264 encode</li>
                        <li>> ISP: 48MP dual-camera, HDR</li>
                        <li>> RKNN Toolkit2: v2.3+ (Apr 2025) — pip-installable, ARM64 native. Supports ONNX, TFLite, PyTorch export paths.</li>
                        <li>> Price: SBC boards ~$80–$150</li>
                        <li>> Reality Check: Best price-to-performance for budget builds. Toolchain maturity lags TensorRT — operator coverage gaps exist for Transformer-based models. Best use: YOLO26n/s at 30+ fps as sole inference workload, or as host CPU while a Hailo-8 M.2 handles vision.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-sky-700">
                    <strong class="text-sky-400 text-lg block mb-2">Ambarella CV5 <span class="text-xs bg-sky-900/50 px-2 py-0.5 rounded">COMMERCIAL DRONE SILICON</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> CPU: Dual Cortex-A76 @ 1.6GHz</li>
                        <li>> AI Engine: CVflow proprietary — CV-optimized, no public TOPS figure</li>
                        <li>> Memory: LPDDR5/5x 64-bit, up to 32GB @ 44.8 GB/s</li>
                        <li>> Video encode: 8K H.265 @ 60fps at &lt;2W — best-in-class efficiency</li>
                        <li>> ISP: 500MP/s pixel throughput, 14-stop HDR, multi-imager support</li>
                        <li>> Power: 2–4W for full encode + AI pipeline</li>
                        <li>> Reality Check: OEM silicon — Ambarella sells to drone manufacturers (DJI, Zenmuse series), not hobbyists. The &lt;2W encode power at 8K is unmatched. Understanding its architecture matters for evaluating commercial payload cameras and for architects designing custom platforms at production volume.</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Qualcomm -->
        <div class="hw-card p-8 rounded-xl relative overflow-hidden">
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                Qualcomm Flight Platform <span class="ml-4 text-xs bg-sky-900/50 text-sky-400 px-3 py-1 rounded border border-sky-800">DRONE-NATIVE SILICON</span>
            </h4>
            <p class="text-slate-300 mt-4 mb-6">Qualcomm's Flight platforms are engineered specifically for autonomous drones — not adapted from phones, cars, or servers. The integrated 5G modem, multi-camera ISP, and flight-relevant Hexagon DSP capabilities differentiate it from generic SBCs. Primary integrator: <a href="https://www.modalai.com/pages/qualcomm-flight-rb5-5g-platform" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">ModalAI</a>.</p>

            <div class="bg-slate-900 p-4 rounded border border-sky-800 text-sm">
                <strong class="text-sky-400 text-lg block mb-2">Qualcomm Flight RB5 5G Platform</strong>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-slate-300">
                    <ul class="space-y-1">
                        <li>> SoC: QRB5165 (Snapdragon 865) — 8-core ARM (1x Cortex-X1 @2.84GHz + 3x A77 + 4x A55)</li>
                        <li>> AI Engine: 15 TOPS (Hexagon 698 DSP + Tensor Accelerator)</li>
                        <li>> RAM: 8GB LPDDR5 @ 2750MHz</li>
                        <li>> Camera: Spectra 480 ISP — 7 concurrent cameras, 2 Gpixel/s, 8K/4K HDR</li>
                        <li>> Connectivity: 5G Sub-6GHz + mmWave, Wi-Fi 6, Bluetooth 5.2</li>
                        <li>> GNSS: Concurrent GPS/GLONASS/BeiDou/Galileo</li>
                        <li>> Security: FIPS 140-2 certified Qualcomm SPU, secure boot, TEE, camera-level encryption</li>
                    </ul>
                    <ul class="space-y-1">
                        <li>> Framework: Qualcomm AI Stack (SNPE/QNN — ONNX, TFLite, PyTorch)</li>
                        <li>> OS: Ubuntu Linux (RB5 reference), Android optional</li>
                        <li>> Weight (ModalAI VOXL 2 form factor): ~16g SoM</li>
                        <li>> Mission use cases: BVLOS with integrated 5G C2 link, 7-camera 360° obstacle avoidance, GPS-denied VIO navigation</li>
                        <li>> Reality Check: The 5G modem is the key differentiator. Drones needing cellular telemetry normally carry a separate LTE module (Sixfab, Quectel) adding 30–80g; the RB5 eliminates this. SNPE ecosystem is narrower than TensorRT but mature for Snapdragon-class models. <a href="https://www.qualcomm.com/internet-of-things/products/flight-rb5-platform" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Qualcomm product page</a></li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Raspberry Pi 5 -->
        <div class="hw-card p-8 rounded-xl relative overflow-hidden">
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                Raspberry Pi 5 + Hailo-8L <span class="ml-4 text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded border border-slate-600">BUDGET CAPABLE</span>
            </h4>
            <p class="text-slate-300 mt-4 mb-6">The Raspberry Pi 5 with the official M.2 HAT+ and a Hailo-8L module is a compelling budget companion computer for drones that do not require Jetson-level multi-model throughput. Total BOM cost is under $150 for compute, and it runs standard Debian 12 (Bookworm) with ROS 2 Humble/Jazzy.</p>
            <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm font-mono">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                    <ul class="space-y-1">
                        <li>> CPU: Broadcom BCM2712 — quad Cortex-A76 @ 2.4GHz</li>
                        <li>> RAM: 8GB LPDDR4X @ 4267 MT/s</li>
                        <li>> PCIe: Gen 3 x1 via M.2 HAT+ (supports Hailo-8L A+E key)</li>
                        <li>> GPU: VideoCore VII — no CUDA; use Hailo-8L for inference</li>
                        <li>> Power: 5V/5A USB-C; draws 5–8W typical under load</li>
                    </ul>
                    <ul class="space-y-1">
                        <li>> MAVLink: Connect to Pixhawk via UART (disable Bluetooth to free /dev/ttyAMA0)</li>
                        <li>> Hailo-8L pairing: 13 TOPS NPU on M.2 2230 A+E key; Hailo Model Zoo covers YOLOv5/v8</li>
                        <li>> Caveats: No dedicated ISP; camera drivers through libcamera only. No built-in secure element — unsuitable for encrypted C2 without additional hardware. UART comms to Pixhawk runs at up to 921600 baud.</li>
                        <li>> Best fit: Sub-$300 build, single-model inference, prototype/academic use</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- ============================================================
         4.3 AI SILICON COMPARISON TABLE
    ============================================================ -->
    <h3>4.3 AI Compute Comparison Table</h3>
    <p>The TOPS (Tera Operations Per Second) figure is the most-cited — and most misleading — benchmark in edge AI marketing. A 100-TOPS chip can be bottlenecked to 20-TOPS effective throughput by an insufficient memory bus. Check GB/s first, TOPS second. FP16 TOPS is typically 50% of INT8 TOPS on the same chip.</p>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-rose-500 mb-6">
        <strong class="text-rose-400 block mb-1">Three ways a TOPS number lies to you</strong>
        <ol class="text-slate-300 text-sm space-y-1 list-decimal list-inside">
            <li><strong class="text-white">Different arithmetic.</strong> Hailo-10H quotes INT4, Hailo-8 quotes INT8, NVIDIA Orin quotes <em>sparse</em> INT8 (roughly 2× the dense figure on suitable models), and Thor quotes FP4 TFLOPS. "40 TOPS" on one datasheet and "40 TOPS" on another can differ by 4× in real work.</li>
            <li><strong class="text-white">Peak vs. sustained.</strong> Peak assumes perfect utilization at large batch size. Drones run batch size 1 on a live video stream, which typically realizes only 30–60% of peak — and less on models with many small layers.</li>
            <li><strong class="text-white">Compute vs. memory bound.</strong> Transformer and VLM workloads are usually bandwidth-bound, not MAC-bound. That is why the Orin Nano Super's jump from 68 to 102 GB/s mattered more in practice than its TOPS headline.</li>
        </ol>
        <p class="text-slate-400 text-xs mt-2">The only number that settles an argument is your own model, exported through your own toolchain, benchmarked on the actual module at the actual power mode, with the thermal solution you intend to fly. Everything before that is a shortlist, not a decision.</p>
    </div>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Platform</th>
                    <th class="p-3 text-right">TOPS INT8</th>
                    <th class="p-3 text-right">Mem BW</th>
                    <th class="p-3 text-right">RAM</th>
                    <th class="p-3 text-right">Power (W)</th>
                    <th class="p-3 text-right">TOPS/W</th>
                    <th class="p-3">Primary Bottleneck</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-emerald-400 font-medium">Jetson Orin Nano Super</td>
                    <td class="p-3 text-right font-mono">67</td>
                    <td class="p-3 text-right font-mono text-emerald-400">102 GB/s</td>
                    <td class="p-3 text-right font-mono">8 GB</td>
                    <td class="p-3 text-right font-mono">25</td>
                    <td class="p-3 text-right font-mono">2.7</td>
                    <td class="p-3 text-slate-300">Power envelope on airframe</td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 text-sky-400 font-medium">Jetson Orin NX 16GB (Super)</td>
                    <td class="p-3 text-right font-mono">157</td>
                    <td class="p-3 text-right font-mono">102 GB/s</td>
                    <td class="p-3 text-right font-mono">16 GB</td>
                    <td class="p-3 text-right font-mono">40</td>
                    <td class="p-3 text-right font-mono">3.9</td>
                    <td class="p-3 text-slate-300">Thermal — active cooling mandatory at 40W</td>
                </tr>
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-sky-400 font-medium">Jetson AGX Orin 64GB</td>
                    <td class="p-3 text-right font-mono">275</td>
                    <td class="p-3 text-right font-mono text-sky-400">204 GB/s</td>
                    <td class="p-3 text-right font-mono">64 GB</td>
                    <td class="p-3 text-right font-mono">60</td>
                    <td class="p-3 text-right font-mono">4.6</td>
                    <td class="p-3 text-slate-300">Weight — ~90g bare module</td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 text-purple-400 font-medium">Jetson AGX Thor T5000</td>
                    <td class="p-3 text-right font-mono text-purple-400">2070 FP4</td>
                    <td class="p-3 text-right font-mono text-purple-400">273 GB/s</td>
                    <td class="p-3 text-right font-mono">128 GB</td>
                    <td class="p-3 text-right font-mono">40–130</td>
                    <td class="p-3 text-right font-mono">—</td>
                    <td class="p-3 text-slate-300">Power — rules out sUAS; carrier board ecosystem nascent</td>
                </tr>
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-amber-400 font-medium">Axelera Metis M.2</td>
                    <td class="p-3 text-right font-mono text-amber-400">214</td>
                    <td class="p-3 text-right font-mono">PCIe 3x4</td>
                    <td class="p-3 text-right font-mono">1 GB</td>
                    <td class="p-3 text-right font-mono">6.5</td>
                    <td class="p-3 text-right font-mono text-amber-400">33</td>
                    <td class="p-3 text-slate-300">Model zoo coverage still maturing</td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 font-medium">Hailo-8 M.2</td>
                    <td class="p-3 text-right font-mono">26</td>
                    <td class="p-3 text-right font-mono">PCIe 3x4</td>
                    <td class="p-3 text-right font-mono">—</td>
                    <td class="p-3 text-right font-mono">2.5</td>
                    <td class="p-3 text-right font-mono text-emerald-400">10.4</td>
                    <td class="p-3 text-slate-300">DFC compile step; no general-purpose CPU</td>
                </tr>
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 font-medium">Hailo-8L M.2</td>
                    <td class="p-3 text-right font-mono">13</td>
                    <td class="p-3 text-right font-mono">PCIe 3x2</td>
                    <td class="p-3 text-right font-mono">—</td>
                    <td class="p-3 text-right font-mono">1.5</td>
                    <td class="p-3 text-right font-mono text-emerald-400">8.7</td>
                    <td class="p-3 text-slate-300">Single inference stream only</td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 font-medium">Qualcomm Flight RB5</td>
                    <td class="p-3 text-right font-mono">15</td>
                    <td class="p-3 text-right font-mono">LPDDR5</td>
                    <td class="p-3 text-right font-mono">8 GB</td>
                    <td class="p-3 text-right font-mono">~8</td>
                    <td class="p-3 text-right font-mono">1.9</td>
                    <td class="p-3 text-slate-300">SNPE ecosystem narrower than TensorRT</td>
                </tr>
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 font-medium">Rockchip RK3588</td>
                    <td class="p-3 text-right font-mono">6</td>
                    <td class="p-3 text-right font-mono">51.2 GB/s</td>
                    <td class="p-3 text-right font-mono">8–32 GB</td>
                    <td class="p-3 text-right font-mono">~8</td>
                    <td class="p-3 text-right font-mono">0.75</td>
                    <td class="p-3 text-slate-300">RKNN operator coverage gaps</td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 font-medium">Ambarella CV5</td>
                    <td class="p-3 text-right font-mono">—</td>
                    <td class="p-3 text-right font-mono text-sky-400">44.8 GB/s</td>
                    <td class="p-3 text-right font-mono">32 GB</td>
                    <td class="p-3 text-right font-mono text-emerald-400">&lt;2</td>
                    <td class="p-3 text-right font-mono">—</td>
                    <td class="p-3 text-slate-300">OEM-only; no public dev kit</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- ============================================================
         4.4 FLIGHT CONTROLLERS
    ============================================================ -->
    <h3>4.4 Flight Controllers</h3>
    <p>The flight controller (FC) is the real-time safety-critical layer. It runs ArduPilot or PX4 on a dedicated STM32 microcontroller, handling IMU fusion, attitude control loops at 400–1000 Hz, and actuator output. It is not where AI inference runs — it is what keeps the vehicle stable while the companion computer thinks.</p>

    <figure class="my-6">
        <img src="images/m4_pixhawk.png" alt="Pixhawk autopilot flight controller board" class="rounded-lg w-full max-w-lg mx-auto">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Pixhawk autopilot — the reference open-hardware flight controller. Source: <a href="https://commons.wikimedia.org/wiki/File:Pixhawk.png" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons / Pixhawk project, CC BY 4.0</a></figcaption>
    </figure>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Controller</th>
                    <th class="p-3">MCU</th>
                    <th class="p-3">IMUs</th>
                    <th class="p-3">Baro</th>
                    <th class="p-3">CAN</th>
                    <th class="p-3">Best For</th>
                    <th class="p-3">Price</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-emerald-400 font-medium">Pixhawk 6C</td>
                    <td class="p-3 font-mono text-xs">STM32H743 @480MHz</td>
                    <td class="p-3 text-xs">2x (ICM-42688-P + BMI088) — vibration isolated</td>
                    <td class="p-3 text-xs">2x MS5611</td>
                    <td class="p-3 text-xs">2x CAN 2.0B</td>
                    <td class="p-3 text-xs">Standard commercial drone, education, research</td>
                    <td class="p-3 font-mono">~$200</td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 text-emerald-400 font-medium">Pixhawk 6X</td>
                    <td class="p-3 font-mono text-xs">STM32H753 @480MHz</td>
                    <td class="p-3 text-xs">3x (ICM-42688-P x2 + ICM-20649) — triple redundancy</td>
                    <td class="p-3 text-xs">3x ICP-20100</td>
                    <td class="p-3 text-xs">2x CAN FD</td>
                    <td class="p-3 text-xs">Research, commercial enterprise, high-redundancy missions</td>
                    <td class="p-3 font-mono">~$350</td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 text-purple-400 font-medium">Pixhawk 6X Pro</td>
                    <td class="p-3 font-mono text-xs">STM32H753 @480MHz</td>
                    <td class="p-3 text-xs">3x, including an <strong class="text-purple-300">ADIS16470 industrial IMU</strong> (&plusmn;40g)</td>
                    <td class="p-3 text-xs">2x (redundant, separate buses)</td>
                    <td class="p-3 text-xs">2x CAN FD + Ethernet</td>
                    <td class="p-3 text-xs">GNSS-denied endurance, heavy vibration, precision survey — the industrial IMU on a standard FMUv6X board</td>
                    <td class="p-3 font-mono">~$500+</td>
                </tr>
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-sky-400 font-medium">Cube Orange+</td>
                    <td class="p-3 font-mono text-xs">STM32H753 @480MHz</td>
                    <td class="p-3 text-xs">3x (ICM-42688-P + ICM-20649 + ICM-20602) — triple with thermal compensation</td>
                    <td class="p-3 text-xs">2x</td>
                    <td class="p-3 text-xs">2x CAN FD</td>
                    <td class="p-3 text-xs">Professional commercial, Blue UAS-compatible ecosystem</td>
                    <td class="p-3 font-mono">~$300</td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 text-sky-400 font-medium">Pixhawk 6X-RT</td>
                    <td class="p-3 font-mono text-xs">NXP i.MX RT1176 @1GHz</td>
                    <td class="p-3 text-xs">3x — same sensor set as 6X</td>
                    <td class="p-3 text-xs">3x</td>
                    <td class="p-3 text-xs">2x CAN FD</td>
                    <td class="p-3 text-xs">Real-time critical applications; first non-STM32 Pixhawk standard</td>
                    <td class="p-3 font-mono">~$400</td>
                </tr>
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-amber-400 font-medium">mRo Pixracer Pro</td>
                    <td class="p-3 font-mono text-xs">STM32H743 @480MHz</td>
                    <td class="p-3 text-xs">3x (ICM-20602 + ICM-20948 + BMI085) — damped</td>
                    <td class="p-3 text-xs">2x</td>
                    <td class="p-3 text-xs">2x CAN</td>
                    <td class="p-3 text-xs">Racing, compact builds, R&amp;D — Dronecode JST-GH standard</td>
                    <td class="p-3 font-mono">~$240</td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 text-purple-400 font-medium">Auterion Skynode S</td>
                    <td class="p-3 font-mono text-xs">FC + mission computer integrated</td>
                    <td class="p-3 text-xs">Dual — onboard</td>
                    <td class="p-3 text-xs">Dual</td>
                    <td class="p-3 text-xs">CAN FD</td>
                    <td class="p-3 text-xs">Commercial sUAS, Blue UAS listed, 49x39mm @38g</td>
                    <td class="p-3 font-mono">Contact</td>
                </tr>
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-purple-400 font-medium">ARK Electronics FC</td>
                    <td class="p-3 font-mono text-xs">STM32H743 @480MHz</td>
                    <td class="p-3 text-xs">Dual ICM-42688-P — isolated</td>
                    <td class="p-3 text-xs">2x</td>
                    <td class="p-3 text-xs">2x CAN FD</td>
                    <td class="p-3 text-xs"><span class="text-purple-400">Blue UAS Framework listed</span> — NDAA-compliant supply chain</td>
                    <td class="p-3 font-mono">~$350</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="bg-[#0f172a] border border-purple-800/60 rounded-xl p-5 text-sm mb-8">
        <strong class="text-purple-400 block mb-3">IMU Comparison — ICM-42688-P vs ADIS16470</strong>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-slate-300">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-2">TDK ICM-42688-P (Consumer/Commercial)</strong>
                <ul class="space-y-1">
                    <li>> Gyro noise: 2.8 mdps/&radic;Hz — class-leading in MEMS</li>
                    <li>> Accel range: &plusmn;16g, Gyro range: &plusmn;2000 dps</li>
                    <li>> Output data rate: up to 8 kHz (matches Betaflight 4.5+ loop rate)</li>
                    <li>> Interface: SPI @24MHz / I2C @1MHz</li>
                    <li>> Package: 2.5x3x0.91mm LGA — smallest available</li>
                    <li>> Cost: ~$5 in volume</li>
                    <li>> Found in: Pixhawk 6C/6X, Cube Orange+, most 2024–2025 flight controllers</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-2">Analog Devices ADIS16470 (Industrial)</strong>
                <ul class="space-y-1">
                    <li>> Gyro noise: 0.0028 dps/&radic;Hz — 100x lower than ICM-42688-P</li>
                    <li>> Accel range: &plusmn;40g — survives hard landing shock</li>
                    <li>> In-run bias stability: 4 deg/hr — critical for long-duration GPS-denied missions</li>
                    <li>> Output data rate: 2 kHz max</li>
                    <li>> Operating range: -40°C to +85°C</li>
                    <li>> Cost: ~$300+ per unit</li>
                    <li>> Found in: Defense-grade autopilots, precision agriculture platforms, surveying UAV</li>
                    <li>> Bottom line: Required for &gt;30-min GPS-denied dead-reckoning. Overkill for GPS-assisted platforms.</li>
                </ul>
            </div>
        </div>
        <div class="mt-4 bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
            <strong class="text-emerald-400 block mb-1 text-sm">You no longer have to choose between them</strong>
            <p class="text-slate-400 text-xs">Until recently, putting an ADIS16470 on an airframe meant a bespoke defense-grade autopilot. The <strong class="text-slate-200">Pixhawk 6X Pro</strong> integrates an ADIS16470 alongside the conventional MEMS units on a standard FMUv6X board, so the redundancy stack now spans two orders of magnitude of sensor quality on one controller. That matters more than the spec sheet suggests: the EKF can cross-check a cheap high-rate MEMS gyro against a low-drift industrial one, which catches a failing sensor far faster than voting among three near-identical parts that tend to fail in similar ways. The 6X Pro also replaced foam IMU isolation with a purpose-formulated silicone core — foam compresses and ages, and stale vibration isolation is a leading cause of "the EKF got worse after 200 flight hours and nobody changed anything."</p>
        </div>
    </div>

    <!-- ============================================================
         4.5 PERCEPTION SENSORS
    ============================================================ -->
    <h3>4.5 Perception Sensors — Cameras</h3>
    <p>Camera choice depends on what the companion computer needs to do: stereo depth for obstacle avoidance, RGB for detection, or both. All modern stereo cameras embed an IMU for visual-inertial odometry (VIO) — check IMU quality before purchasing.</p>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500 mb-6">
        <strong class="text-sky-400 block mb-1">Vendor note: RealSense is no longer Intel</strong>
        <p class="text-slate-400 text-sm">RealSense completed its spin-out from Intel in July 2025 as an independent company backed by a $50M Series A (with Intel Capital and MediaTek among the investors), and now operates at <code>realsenseai.com</code>. This ended several years of genuine uncertainty about whether the D400 line would survive — a risk that led many robotics teams to design RealSense out of their platforms. The line is now actively developed again, and RealSense announced a collaboration with NVIDIA covering Jetson Thor, Isaac Sim, and the Holoscan Sensor Bridge. <strong class="text-slate-200">Practical implication:</strong> older documentation, SDK links, and support channels still point at Intel domains and are progressively going stale — check the current vendor site before you file a driver bug against the wrong organization.</p>
    </div>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Camera</th>
                    <th class="p-3">Depth Tech</th>
                    <th class="p-3">Range</th>
                    <th class="p-3">Resolution</th>
                    <th class="p-3">IMU</th>
                    <th class="p-3">Interface</th>
                    <th class="p-3">Weight</th>
                    <th class="p-3">Notes</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-emerald-400 font-medium">Intel RealSense D435i</td>
                    <td class="p-3 text-xs">Active stereo IR + RGB</td>
                    <td class="p-3 text-xs font-mono">0.3–3m</td>
                    <td class="p-3 text-xs font-mono">1280x720 depth @30fps</td>
                    <td class="p-3 text-xs">BMI055 (6-axis)</td>
                    <td class="p-3 text-xs">USB 3.1</td>
                    <td class="p-3 text-xs font-mono">72g</td>
                    <td class="p-3 text-xs">Global shutter stereo; well-supported in ROS 2, open-source SDK. Good outdoor performance but range limited to 3m.</td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 text-emerald-400 font-medium">Intel RealSense D457</td>
                    <td class="p-3 text-xs">Active stereo IR + RGB</td>
                    <td class="p-3 text-xs font-mono">0.6–6m</td>
                    <td class="p-3 text-xs font-mono">1280x720 depth @30fps</td>
                    <td class="p-3 text-xs">Yes (6-axis)</td>
                    <td class="p-3 text-xs">USB 3.1 / MIPI</td>
                    <td class="p-3 text-xs font-mono">90g</td>
                    <td class="p-3 text-xs">Longer range than D435i; MIPI interface enables direct Jetson integration without USB hub weight penalty. Industrial IP65-rated housing.</td>
                </tr>
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-sky-400 font-medium">Stereolabs ZED 2i</td>
                    <td class="p-3 text-xs">Passive stereo + neural depth</td>
                    <td class="p-3 text-xs font-mono">0.3–20m</td>
                    <td class="p-3 text-xs font-mono">4K RGB per eye @15fps</td>
                    <td class="p-3 text-xs">9-DOF + barometer + magnetometer</td>
                    <td class="p-3 text-xs">USB 3.1</td>
                    <td class="p-3 text-xs font-mono">166g</td>
                    <td class="p-3 text-xs">120mm baseline; IP66 rated; factory 6-axis calibration. 20m range is unmatched for obstacle avoidance. Requires GPU (CUDA) on host — use with Jetson only.</td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 text-sky-400 font-medium">Stereolabs ZED X</td>
                    <td class="p-3 text-xs">Passive stereo + neural depth</td>
                    <td class="p-3 text-xs font-mono">0.3–20m</td>
                    <td class="p-3 text-xs font-mono">4K RGB @60fps</td>
                    <td class="p-3 text-xs">6-DOF</td>
                    <td class="p-3 text-xs">GMSL2 / USB</td>
                    <td class="p-3 text-xs font-mono">85g</td>
                    <td class="p-3 text-xs">Global shutter sensors; GMSL2 interface for long-cable drone integration. Designed for robotics-grade reliability. Requires NVIDIA Jetson.</td>
                </tr>
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-amber-400 font-medium">Luxonis OAK-D Pro</td>
                    <td class="p-3 text-xs">Active stereo + onboard inference</td>
                    <td class="p-3 text-xs font-mono">0.2–35m</td>
                    <td class="p-3 text-xs font-mono">12MP RGB + 800p stereo</td>
                    <td class="p-3 text-xs">6-DOF</td>
                    <td class="p-3 text-xs">USB 3.1 / PoE</td>
                    <td class="p-3 text-xs font-mono">91g</td>
                    <td class="p-3 text-xs">Integrated Intel Myriad X VPU (4 TOPS) runs inference on-camera — outputs bounding boxes, not raw video. Reduces companion computer load. Active IR dot projector improves depth in low-texture scenes.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- ============================================================
         4.6 LIDAR
    ============================================================ -->
    <h3>4.6 LiDAR Sensors for sUAS</h3>
    <p>LiDAR provides accurate 3D point clouds in conditions where stereo cameras struggle: uniform textures, low light, and high-speed motion. The sub-$1,000 solid-state category is mature enough for operational deployment on multi-rotor sUAS in 2025.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Sensor</th>
                    <th class="p-3">Type</th>
                    <th class="p-3">FOV (H×V)</th>
                    <th class="p-3">Range</th>
                    <th class="p-3">Points/s</th>
                    <th class="p-3">Weight</th>
                    <th class="p-3">Price</th>
                    <th class="p-3">Notes</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-emerald-400 font-medium">Livox MID-360</td>
                    <td class="p-3 text-xs">Rotating mirror hybrid solid-state</td>
                    <td class="p-3 text-xs font-mono">360° × 59°</td>
                    <td class="p-3 text-xs font-mono">0.1–40m (10% reflectivity)</td>
                    <td class="p-3 text-xs font-mono">200k/s</td>
                    <td class="p-3 text-xs font-mono">265g</td>
                    <td class="p-3 font-mono text-emerald-400">~$499</td>
                    <td class="p-3 text-xs">Full 360° horizontal + 59° vertical FOV in 65mm package. Non-repetitive scan pattern excels for SLAM. Industry standard for indoor SLAM and low-speed robotics. <a href="https://www.livoxtech.com/mid-360/specs" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Specs</a></td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 text-emerald-400 font-medium">Livox MID-360S</td>
                    <td class="p-3 text-xs">Solid-state (2025 upgrade)</td>
                    <td class="p-3 text-xs font-mono">360° × 75°</td>
                    <td class="p-3 text-xs font-mono">0.1–70m</td>
                    <td class="p-3 text-xs font-mono">240k/s</td>
                    <td class="p-3 text-xs font-mono">~280g</td>
                    <td class="p-3 font-mono">~$699</td>
                    <td class="p-3 text-xs">2025 revision of MID-360. Extended vertical FOV and doubled range. Backward-compatible SDK. Preferred for outdoor UAV SLAM.</td>
                </tr>
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-sky-400 font-medium">Ouster OS0-32</td>
                    <td class="p-3 text-xs">Mechanical spinning</td>
                    <td class="p-3 text-xs font-mono">360° × 90°</td>
                    <td class="p-3 text-xs font-mono">0.3–50m</td>
                    <td class="p-3 text-xs font-mono">655k/s</td>
                    <td class="p-3 text-xs font-mono">447g</td>
                    <td class="p-3 font-mono">~$3,500</td>
                    <td class="p-3 text-xs">Ultra-wide 90° vertical FOV. High point density for accurate obstacle detection. Heavier — suited for large-frame UAV or UGV. Ouster/Hesai merger ecosystem.</td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 text-sky-400 font-medium">Hesai XT32</td>
                    <td class="p-3 text-xs">Mechanical spinning</td>
                    <td class="p-3 text-xs font-mono">360° × 31°</td>
                    <td class="p-3 text-xs font-mono">0.5–120m</td>
                    <td class="p-3 text-xs font-mono">640k/s</td>
                    <td class="p-3 text-xs font-mono">530g</td>
                    <td class="p-3 font-mono">~$4,000</td>
                    <td class="p-3 text-xs">Long-range outdoor performance. 32 channels at 120m range. Used in delivery drone programs requiring accurate ground clearance estimation.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- ============================================================
         4.7 GPS/GNSS
    ============================================================ -->
    <h3>4.7 GPS &amp; GNSS Modules</h3>
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Module</th>
                    <th class="p-3">Accuracy</th>
                    <th class="p-3">Constellations</th>
                    <th class="p-3">Compass</th>
                    <th class="p-3">Update Rate</th>
                    <th class="p-3">Notes</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-emerald-400 font-medium">u-blox ZED-F9P</td>
                    <td class="p-3 text-xs font-mono">&lt;1cm (RTK) / 1.5m (standalone)</td>
                    <td class="p-3 text-xs">GPS L1/L2, GLONASS, Galileo, BeiDou — concurrent</td>
                    <td class="p-3 text-xs">Requires external magnetometer</td>
                    <td class="p-3 text-xs font-mono">Up to 25 Hz</td>
                    <td class="p-3 text-xs">The gold standard for precision RTK positioning. Requires base station or NTRIP correction service for cm-level accuracy. Used in precision agriculture, surveying, and BVLOS platforms. <a href="https://www.u-blox.com/en/product/zed-f9p-module" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Datasheet</a></td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 text-sky-400 font-medium">Holybro HERE3+</td>
                    <td class="p-3 text-xs font-mono">~1.5m (standalone)</td>
                    <td class="p-3 text-xs">GPS L1, GLONASS, Galileo, BeiDou</td>
                    <td class="p-3 text-xs">ICM-20948 (9-DOF) — CAN bus output</td>
                    <td class="p-3 text-xs font-mono">10 Hz</td>
                    <td class="p-3 text-xs">CAN DroneCAN (UAVCAN v1) interface eliminates GPS/compass cable interference issues. IP66. Plug-and-play with Pixhawk 6C/6X. ~$80.</td>
                </tr>
                <tr class="bg-slate-800 hover:bg-slate-700/50">
                    <td class="p-3 text-sky-400 font-medium">Holybro H-RTK NEO-F9P</td>
                    <td class="p-3 text-xs font-mono">&lt;1cm (RTK)</td>
                    <td class="p-3 text-xs">GPS L1/L2, GLONASS, Galileo, BeiDou</td>
                    <td class="p-3 text-xs">RM3100 (industrial compass)</td>
                    <td class="p-3 text-xs font-mono">25 Hz</td>
                    <td class="p-3 text-xs">Consumer-accessible RTK module. RM3100 compass provides far superior magnetic interference rejection compared to HMC5883L-class sensors. ~$200.</td>
                </tr>
                <tr class="bg-slate-900 hover:bg-slate-700/50">
                    <td class="p-3 text-amber-400 font-medium">Locus Lock GNSS</td>
                    <td class="p-3 text-xs font-mono">cm-level</td>
                    <td class="p-3 text-xs">Multi-constellation</td>
                    <td class="p-3 text-xs">Integrated</td>
                    <td class="p-3 text-xs font-mono">—</td>
                    <td class="p-3 text-xs"><span class="text-amber-400">Blue UAS Framework listed (2026)</span> — NDAA-compliant. Purpose-built for DoD procurement without supply chain concerns.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- ============================================================
         4.8 BLUE UAS & DOD COMPLIANCE
    ============================================================ -->
    <h3>4.8 Blue UAS &amp; DoD Hardware Compliance</h3>
    <p>The Blue UAS Cleared List is the DoD's registry of cyber-vetted, NDAA-compliant drone platforms and components — 39+ complete systems and 165+ certified components. Understanding the framework is essential for any drone program involving government contracts, and increasingly for commercial ones too.</p>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-rose-500 mb-6">
        <strong class="text-rose-400 block mb-1">Two things changed since this list was a DoD-only concern</strong>
        <p class="text-slate-400 text-sm mb-2"><strong class="text-slate-200">1. Ownership moved.</strong> The Blue UAS list transitioned from DIU to the <strong class="text-slate-200">Defense Contract Management Agency (DCMA)</strong> on 3 December 2025. The DCMA Blue List portal is now authoritative; the legacy DIU page is not. Skydio X10, R10, and Dock for X10 were added in July 2026.</p>
        <p class="text-slate-400 text-sm"><strong class="text-slate-200">2. It became a commercial gatekeeper.</strong> In December 2025 the FCC added all foreign-produced UAS and UAS critical components to its Covered List, blocking new equipment authorizations. In July 2026 the FCC exempted equipment on the DCMA Blue list, and equipment assembled domestically with ≥65% U.S. component value. Blue UAS listing is therefore no longer just a procurement advantage — for many parts it is now the practical route to lawful U.S. sale.</p>
    </div>

    <div class="bg-[#0f172a] border border-amber-800/60 rounded-xl p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
                <strong class="text-amber-400 block mb-3">Why Blue UAS Matters for Hardware Selection</strong>
                <ul class="space-y-2 font-mono text-xs text-slate-300">
                    <li>> Section 848 FY20 NDAA + American Security Drone Act 2024 prohibit DoD purchase of drones containing components from listed adversary nations (China, Russia, Iran, North Korea)</li>
                    <li>> A system with non-compliant GPS, ESC, or FC is disqualified regardless of US-made airframe</li>
                    <li>> November 2025 DefenseScoop investigation: some Blue UAS platforms contain Chinese-made motors — loophole under review. Validate full supply chain, not just primary components.</li>
                    <li>> Blue UAS list moved to DCMA oversight (Dec 2025) — always verify against the DCMA portal, not cached vendor claims, before procurement</li>
                </ul>
            </div>
            <div>
                <strong class="text-purple-400 block mb-3">Blue UAS Framework Listed Components (2026)</strong>
                <ul class="space-y-1 font-mono text-xs text-slate-300">
                    <li>> <span class="text-purple-400">Compute:</span> Auterion Skynode S (FC + mission computer)</li>
                    <li>> <span class="text-purple-400">Flight Control:</span> ARK Electronics Flight Controller</li>
                    <li>> <span class="text-purple-400">GNSS:</span> Locus Lock GNSS receiver</li>
                    <li>> <span class="text-purple-400">ESC:</span> Vertiq Electronic Speed Control</li>
                    <li>> <span class="text-purple-400">Remote ID:</span> Pierce Aerospace B1 Beacon</li>
                    <li>> <span class="text-purple-400">Comms:</span> Doodle Labs Wi-Fi transceivers; Mobilicom Skyhopper PRO; TILT Autonomy Starlink PoE adapter</li>
                    <li>> <span class="text-purple-400">AI:</span> Athena AI Computer Vision; SensorOps SynDOJO</li>
                    <li>> <span class="text-purple-400">Camera:</span> RPX Technologies EmbIR</li>
                    <li>> <span class="text-purple-400">Approved platforms:</span> Anduril Ghost/Ghost X, Skydio X10D, Teal Golden Eagle, Easy Aerial Osprey</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- ============================================================
         4.9 VIDEO — EDGE AI HARDWARE
    ============================================================ -->
    <h3>4.9 Video Reference</h3>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Which Hardware Do You Actually Need for Physical AI? ($10 Raspberry Pi to $1000 Jetson)</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/YPxWr7KPEHc" title="Raspberry Pi vs NVIDIA Jetson — hardware comparison for physical AI edge computing" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-sm mt-2">A practical breakdown comparing compute platforms from Raspberry Pi to NVIDIA Jetson for physical AI and robotics applications — directly applicable to drone companion computer selection.</p>
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Getting Started with Edge AI on NVIDIA Jetson: LLMs, VLMs, and Foundation Models for Robotics</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/t2Ecuu2FdC8" title="Edge AI on NVIDIA Jetson — LLMs, VLMs, and foundation models for robotics" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-sm mt-2">Covers the JetPack 6.x AI stack, TensorRT-LLM, and running foundation models at the edge — directly relevant to Jetson Thor and AGX Orin deployment workflows.</p>
    </div>

    <!-- ============================================================
         4.10 HARDWARE SELECTION FRAMEWORK
    ============================================================ -->
    <h3>4.10 Hardware Selection Framework</h3>
    <p>Use this decision logic to narrow to a candidate platform before benchmarking. These are not absolute rules — they are starting points based on the dominant constraint at each branch.</p>

    <div class="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 mb-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div class="space-y-3">
                <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                    <strong class="text-emerald-400 block mb-1">Budget &lt;$300 / airframe &lt;300g payload</strong>
                    <p class="text-slate-300 font-mono text-xs">&rarr; Raspberry Pi 5 + Hailo-8L M.2 (13 TOPS @1.5W)<br>&rarr; Single inference stream (YOLO26n/s at &gt;30 fps)<br>&rarr; MAVLink over UART to Pixhawk 6C<br>&rarr; ZED 2i or OAK-D Pro for depth</p>
                </div>
                <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                    <strong class="text-sky-400 block mb-1">Sub-5kg airframe, multiple concurrent models</strong>
                    <p class="text-slate-300 font-mono text-xs">&rarr; Jetson Orin Nano Super (102 GB/s clears multi-model bottleneck)<br>&rarr; JetPack 6.2+, carrier board: Neousys FLYC-300 or Auvidea JNX42<br>&rarr; 7W mode during cruise, 25W during active inference<br>&rarr; Pixhawk 6C or Cube Orange+ flight controller</p>
                </div>
                <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
                    <strong class="text-purple-400 block mb-1">Gimbal / smart camera payload</strong>
                    <p class="text-slate-300 font-mono text-xs">&rarr; Hailo-15H (20 TOPS, integrated 4K ISP, fanless &lt;2W)<br>&rarr; Sends inference metadata over MAVLink — eliminates video downlink for detection tasks<br>&rarr; Commercial OEM path: Ambarella CV5</p>
                </div>
            </div>
            <div class="space-y-3">
                <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                    <strong class="text-amber-400 block mb-1">BVLOS / 5G cellular C2 required</strong>
                    <p class="text-slate-300 font-mono text-xs">&rarr; Qualcomm Flight RB5 5G (integrated 5G modem saves 40–80g vs separate LTE module)<br>&rarr; 7-camera concurrent perception for beyond-visual-range ops<br>&rarr; Supplement with Hailo-8 M.2 if inference throughput insufficient</p>
                </div>
                <div class="bg-slate-900 p-4 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block mb-1">Heavy-lift VTOL (&gt;10kg payload) or UGV</strong>
                    <p class="text-slate-300 font-mono text-xs">&rarr; Jetson AGX Orin (275 TOPS, 64GB, 204 GB/s)<br>&rarr; Jetson AGX Thor T5000 for 2025+ humanoid/multi-modal foundation models<br>&rarr; Axelera Metis M.2 as inference co-processor (214 TOPS @6.5W)<br>&rarr; Power envelope no longer the constraint — maximize capability</p>
                </div>
                <div class="bg-slate-900 p-4 rounded border-l-4 border-orange-500">
                    <strong class="text-orange-400 block mb-1">DoD / Government procurement</strong>
                    <p class="text-slate-300 font-mono text-xs">&rarr; Start with <a href="https://www.diu.mil/blue-uas-cleared-list" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Blue UAS Cleared List</a> for complete platforms<br>&rarr; ARK Electronics FC + Auterion Skynode S + Locus Lock GNSS for component-level compliance<br>&rarr; Validate full supply chain — motors and ESCs included, not just primary compute</p>
                </div>
            </div>
        </div>
    </div>

    <!-- External Resources -->
    <h3>4.11 External Resources</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-10">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">Compute &amp; AI</strong>
            <ul class="space-y-1 text-xs">
                <li><a href="https://developer.nvidia.com/embedded/jetson-modules" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">NVIDIA Jetson Module Lineup</a></li>
                <li><a href="https://developer.nvidia.com/blog/nvidia-jetpack-6-2-brings-super-mode-to-nvidia-jetson-orin-nano-and-jetson-orin-nx-modules/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">JetPack 6.2 Super Mode Blog</a></li>
                <li><a href="https://nvidianews.nvidia.com/news/nvidia-blackwell-powered-jetson-thor-now-available-accelerating-the-age-of-general-robotics" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Jetson Thor GA Announcement</a></li>
                <li><a href="https://hailo.ai/products/hailo-8l-m2-module/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Hailo-8L M.2 Product Page</a></li>
                <li><a href="https://www.qualcomm.com/internet-of-things/products/flight-rb5-platform" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Qualcomm Flight RB5 Platform</a></li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">Flight Controllers &amp; GPS</strong>
            <ul class="space-y-1 text-xs">
                <li><a href="https://docs.holybro.com/autopilot/autopilot-comparison" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Holybro Autopilot Comparison</a></li>
                <li><a href="https://docs.px4.io/main/en/flight_controller/pixhawk_series" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">PX4 Pixhawk Series Docs</a></li>
                <li><a href="https://www.u-blox.com/en/product/zed-f9p-module" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">u-blox ZED-F9P Module</a></li>
                <li><a href="https://mrobotics.io/docs/pixracer-pro/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">mRo Pixracer Pro Docs</a></li>
                <li><a href="https://auterion.com/product/skynode-s/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Auterion Skynode S</a></li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2">Sensors &amp; Compliance</strong>
            <ul class="space-y-1 text-xs">
                <li><a href="https://www.livoxtech.com/mid-360/specs" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Livox MID-360 Specs</a></li>
                <li><a href="https://www.stereolabs.com/zed-2i/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Stereolabs ZED 2i</a></li>
                <li><a href="https://shop.luxonis.com/products/oak-d-pro" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Luxonis OAK-D Pro</a></li>
                <li><a href="https://www.diu.mil/blue-uas-cleared-list" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">DIU Blue UAS Cleared List</a></li>
                <li><a href="https://invensense.tdk.com/products/motion-tracking/6-axis/icm-42688-p" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">TDK ICM-42688-P Datasheet</a></li>
            </ul>
        </div>
    </div>
</div>
`;
