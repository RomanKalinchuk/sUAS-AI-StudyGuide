export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 3</span>
    <h2>Compute Silicon Matrix</h2>
    <p>The landscape of Edge AI processors is vast. Selecting the correct System on Module (SoM) is the most consequential decision in the engineering lifecycle. We must look beyond raw TOPS and analyze memory bandwidth, framework support, and physical footprint.</p>

    <h3>3.1 The AI Silicon Landscape Visualization</h3>
    <p>This chart maps the current market. Cost is plotted logarithmically. Notice how newer NPUs (Neural Processing Units) are drastically pulling down the cost-to-performance ratio compared to traditional GPUs.</p>

    <div class="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 mb-10 shadow-lg">
        <div class="chart-container" style="height: 600px;">
            <canvas id="hwChartMain"></canvas>
        </div>
    </div>

    <h3>3.2 Exhaustive Hardware Profiles</h3>

    <div class="space-y-8">
        <!-- NVIDIA Family -->
        <div class="hw-card p-8 rounded-xl relative overflow-hidden">
            <div class="absolute -right-10 -top-10 opacity-5">
                <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor" class="text-white"><path d="M10,10 L90,10 L90,90 L10,90 Z"/></svg>
            </div>
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                NVIDIA Jetson Family <span class="ml-4 text-xs bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded border border-emerald-800">THE HEAVYWEIGHTS</span>
            </h4>
            <p class="text-slate-300 mt-4 mb-6">NVIDIA dominates high-end robotics due to CUDA and TensorRT. If you are running multiple deep learning models concurrently (e.g., YOLO for object detection, plus a Transformer model for depth estimation, plus VSLAM), Jetson is the only platform with the memory bandwidth to prevent bottlenecks.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="bg-slate-900 p-4 rounded border border-emerald-800">
                    <strong class="text-emerald-400 text-lg block mb-2">Jetson Orin Nano <span class="text-xs bg-emerald-900/50 px-2 py-0.5 rounded">sUAS SWEET SPOT</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 40 TOPS (INT8) — 80x over original Jetson Nano</li>
                        <li>> GPU: 1024-core Ampere architecture</li>
                        <li>> RAM: 8GB 128-bit LPDDR5</li>
                        <li>> Bandwidth: 68 GB/s</li>
                        <li>> Power: 7W (efficiency) / 15W (performance) — dynamically switchable</li>
                        <li>> Reality Check: The current SWaP-C standard for sub-5kg AI drones. Switch to 7W mode during cruise (loiter, transit) and 15W mode during active inference windows. Runs YOLO11m + isaac_ros_visual_slam concurrently in 15W mode.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-emerald-700">
                    <strong class="text-emerald-400 text-lg block mb-2">Jetson Orin Nano Super <span class="text-xs bg-emerald-900/50 px-2 py-0.5 rounded">2025 UPDATE — NEW SWEET SPOT</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 67 TOPS (INT8) — 1.7× the base Orin Nano</li>
                        <li>> GPU: 1024-core Ampere architecture</li>
                        <li>> RAM: 8GB 128-bit LPDDR5</li>
                        <li>> Bandwidth: 102 GB/s (50% increase over base Nano, now matching Orin NX)</li>
                        <li>> Power: 7W (efficiency) / 25W (performance)</li>
                        <li>> JetPack: Requires JetPack 6.2+ (Ubuntu 22.04, CUDA 12.2, TensorRT 10.x)</li>
                        <li>> Reality Check: Announced January 2025. Same 8GB LPDDR5 module form factor as the base Orin Nano — existing carrier boards are compatible. The extra memory bandwidth (102 GB/s) is the critical upgrade; it eliminates the bottleneck that previously forced model size trade-offs between YOLO11m and VSLAM. <span class="text-emerald-400">Now the default recommendation for sub-5kg AI drone builds.</span></li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-slate-700">
                    <strong class="text-sky-400 text-lg block mb-2">Jetson Orin NX (16GB)</strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 100 TOPS (INT8)</li>
                        <li>> GPU: 1024-core Ampere architecture</li>
                        <li>> RAM: 16GB 128-bit LPDDR5</li>
                        <li>> Bandwidth: 102 GB/s</li>
                        <li>> Power: 10W - 25W</li>
                        <li>> Reality Check: Preferred when concurrent models require more than 8GB unified memory (e.g., YOLO + VSLAM + depth fusion + semantic segmentation simultaneously). Requires 3rd-party carrier boards for drone integration — see Low-SWaP Carrier Boards below.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-slate-700">
                    <strong class="text-sky-400 text-lg block mb-2">Jetson AGX Orin</strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 275 TOPS</li>
                        <li>> GPU: 2048-core Ampere</li>
                        <li>> RAM: Up to 64GB LPDDR5</li>
                        <li>> Bandwidth: 204 GB/s</li>
                        <li>> Power: 15W - 60W</li>
                        <li>> Reality Check: Too heavy for most sUAS (&lt;5kg). Primarily used on large octocopters or UGVs.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-purple-800">
                    <strong class="text-purple-400 text-lg block mb-2">Jetson Thor (T4000/T5000) <span class="text-xs bg-purple-900/50 px-2 py-0.5 rounded">2025–2026</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 1200–2070 FP4 TFLOPS (Blackwell architecture)</li>
                        <li>> GPU: Blackwell GPU + 2nd-gen Transformer Engine</li>
                        <li>> RAM: Up to 64GB unified memory</li>
                        <li>> Power: ~60W–100W TDP</li>
                        <li>> Reality Check: Designed for sophisticated robotics and autonomous vehicles, not current commodity sUAS. The power envelope makes it viable only on large-frame VTOL (>10kg payload capacity) or ground robots. Carrier board ecosystem is nascent as of 2026. Primary use: multi-modal foundation model inference (LLaVA, GR00T) at the edge.</li>
                    </ul>
                </div>
            </div>

            <div class="mt-6 bg-slate-800/50 border border-sky-800/60 rounded-xl p-5 text-sm">
                <strong class="text-sky-400 block mb-3">Low-SWaP Carrier Boards — Stripping Developer Kit Overhead</strong>
                <p class="text-slate-300 mb-3">NVIDIA Jetson developer kits are designed for desktop prototyping — they include full-size USB hubs, PCIe slots, DisplayPort, and industrial connectors that add 400–800g of dead weight on a drone. 3rd-party carrier boards eliminate this by exposing only what a drone needs.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-slate-300">
                    <div class="bg-slate-900 p-3 rounded border border-slate-700">
                        <strong class="text-emerald-400 block mb-2">Neousys FLYC-300 (Orin NX/Nano)</strong>
                        <ul class="space-y-1">
                            <li>> Weight: 297g (vs ~600g for Jetson devkit)</li>
                            <li>> Power input: 4S–14S LiPo direct (no BEC cascade)</li>
                            <li>> Interfaces: 2× MIPI CSI-2, USB 3.1, GbE, CAN, UART</li>
                            <li>> Form: 100×75mm — mounts on standard 30.5mm drone stack</li>
                            <li>> Thermal: active fan + conduction pad for enclosed fuselages</li>
                        </ul>
                    </div>
                    <div class="bg-slate-900 p-3 rounded border border-slate-700">
                        <strong class="text-amber-400 block mb-2">Other Options</strong>
                        <ul class="space-y-1">
                            <li>> <strong>ConnectTech Quasar (Orin NX):</strong> 95mm × 75mm, MIL-spec connectors, -40 to +85°C. Industrial/defense grade.</li>
                            <li>> <strong>Seeed reComputer J40 (Orin NX):</strong> Consumer-grade, 2× MIPI CSI, GbE. Budget option for sub-$600 builds.</li>
                            <li>> <strong>Auvidea JNX42 (Orin NX):</strong> 60mm × 45mm — smallest available. For &lt;1kg micro-drones.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mt-6 bg-slate-800/50 border border-purple-800/60 rounded-xl p-5 text-sm">
                <strong class="text-purple-400 block mb-3">JetPack 6.x — What Changed and Why It Matters</strong>
                <p class="text-slate-300 mb-3">JetPack 6 (GA: June 2024) is a breaking change from JetPack 5. APT upgrade is not supported — a full reflash is required. The payoff is a modernized, stable foundation for long-lifecycle drone programs.</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs text-slate-300">
                    <div class="bg-slate-900 p-3 rounded border border-slate-700">
                        <strong class="text-purple-400 block mb-1">OS &amp; Kernel</strong>
                        <ul class="space-y-1">
                            <li>> Ubuntu 22.04 LTS (from 20.04)</li>
                            <li>> Linux 5.15 LTS kernel</li>
                            <li>> Measured boot + security hardening</li>
                        </ul>
                    </div>
                    <div class="bg-slate-900 p-3 rounded border border-slate-700">
                        <strong class="text-purple-400 block mb-1">AI Stack</strong>
                        <ul class="space-y-1">
                            <li>> CUDA 12.2 (from 11.x)</li>
                            <li>> TensorRT 10.x (from 8.x)</li>
                            <li>> cuDNN 8.9 / VPI 3.1</li>
                            <li>> TensorRT-LLM (8B models viable)</li>
                        </ul>
                    </div>
                    <div class="bg-slate-900 p-3 rounded border border-slate-700">
                        <strong class="text-purple-400 block mb-1">Robotics Stack</strong>
                        <ul class="space-y-1">
                            <li>> Native ROS 2 Humble support</li>
                            <li>> Decoupled CUDA stack updates</li>
                            <li>> isaac_ros packages on apt</li>
                            <li>> Camera drivers now out-of-tree</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Hailo & Edge TPU -->
        <div class="hw-card p-8 rounded-xl relative overflow-hidden">
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                Dedicated NPUs (Hailo, Coral) <span class="ml-4 text-xs bg-purple-900/50 text-purple-400 px-3 py-1 rounded border border-purple-800">THE EFFICIENCY KINGS</span>
            </h4>
            <p class="text-slate-300 mt-4 mb-6">Neural Processing Units are ASICs (Application-Specific Integrated Circuits). They cannot run general-purpose code (like a CPU) or render graphics (like a GPU). They do one thing: multiply matrices extremely fast at very low power.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="bg-slate-900 p-4 rounded border border-purple-700">
                    <strong class="text-purple-400 text-lg block mb-2">Hailo-15 Family <span class="text-xs bg-purple-900/50 px-2 py-0.5 rounded">2024 — CAMERA-EMBEDDED AI</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 15H = 20 TOPS / 15M = 11 TOPS / 15L = 7 TOPS</li>
                        <li>> Camera ISP: Integrated — handles up to 12MP raw at 600 Mpixel/s</li>
                        <li>> Video: 4K HDR encode/decode + real-time inference in same chip</li>
                        <li>> CPU: Quad-core Cortex-A53 (host tasks on-die)</li>
                        <li>> Power: Fanless, camera-grade — sub-2W for 15L/15M</li>
                        <li>> Frameworks: Hailo Model Zoo (ONNX, TFLite, PyTorch via DFC)</li>
                        <li>> Reality Check: The Hailo-15 is architecturally different from the Hailo-8 — it is a camera SoC, not an M.2 plug-in. Designed to replace the standalone ISP in a gimballed camera payload. Run YOLOv5-M at 4K resolution without an external processor. Best fit: smart payload that sends inference results (bounding boxes, metadata) over MAVLink rather than raw video. Eliminates a separate compute board in gimbal designs.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-slate-700">
                    <strong class="text-purple-400 text-lg block mb-2">Hailo-8 / Hailo-8L M.2 Modules</strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Hailo-8: 26 TOPS @ ~2.5W — PCIe Gen-3 x4</li>
                        <li>> Hailo-8L: 13 TOPS @ ~1.5W — M.2 2230 (A+E key)</li>
                        <li>> Interface: PCIe Gen-3 (no USB variant for Hailo-8)</li>
                        <li>> Compiler: Hailo Dataflow Compiler (required — offline step)</li>
                        <li>> Reality Check: The Hailo-8L at ~$25 is the correct replacement for the discontinued Google Coral. It pairs cleanly with Raspberry Pi 5 (M.2 HAT+). Hailo-8 is the go-to co-processor when the main board is an x86 SBC or Orin Nano and you want to offload a second inference stream (thermal + EO) to dedicated silicon, keeping the GPU free for VSLAM.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-amber-700">
                    <strong class="text-amber-400 text-lg block mb-2">Axelera Metis M.2 <span class="text-xs bg-amber-900/50 px-2 py-0.5 rounded">214 TOPS IN M.2 2280</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 214 TOPS (INT8)</li>
                        <li>> Power: 4–8W @ 15 TOPS/W efficiency</li>
                        <li>> Memory: 1GB on-module DRAM</li>
                        <li>> Interface: PCIe Gen-3 x4 (M-Key)</li>
                        <li>> Architecture: Quad-core Metis AIPU, Digital In-Memory Computing (D-IMC), RISC-V control core</li>
                        <li>> SDK: Voyager SDK — Python + C++ API, YAML pipeline design, ONNX input</li>
                        <li>> Reality Check: 214 TOPS at 8W is the highest TOPS/W ratio in the M.2 form factor (as of 2025). D-IMC architecture minimizes DRAM access — critical for power-constrained airframes. Ecosystem is still maturing (smaller model zoo than Hailo), but ONNX support covers YOLOv5/v7/v8. Worth evaluating when you need &gt;100 TOPS without committing to a Jetson and its carrier board overhead.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-red-900/50">
                    <strong class="text-red-400 text-lg block mb-2">Google Coral Edge TPU <span class="text-xs bg-red-900/50 px-2 py-0.5 rounded">ECOSYSTEM STAGNANT</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 4 TOPS</li>
                        <li>> Power: 2W</li>
                        <li>> Interface: USB, PCIe, M.2</li>
                        <li>> Reality Check: The pioneer of cheap Edge AI. Hardware has not been updated since 2019 and the software ecosystem has stagnated — TensorFlow Lite only, no PyTorch or ONNX path. 4 TOPS cannot run YOLO11n at real-time speed. <span class="text-red-400">Not recommended for new designs.</span> Hailo-8L (13 TOPS, ~$25) is the correct modern replacement at similar cost.</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- SoC Integrations -->
        <div class="hw-card p-8 rounded-xl relative overflow-hidden">
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                Integrated SoCs (Rockchip, Ambarella) <span class="ml-4 text-xs bg-amber-900/50 text-amber-400 px-3 py-1 rounded border border-amber-800">THE ALL-IN-ONES</span>
            </h4>
            <p class="text-slate-300 mt-4 mb-6">These chips combine powerful ARM CPUs, dedicated Image Signal Processors (ISPs) for handling raw camera data, and NPUs onto a single silicon die. They are incredibly cost-effective.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="bg-slate-900 p-4 rounded border border-amber-700">
                    <strong class="text-amber-400 text-lg block mb-2">Rockchip RK3588 (e.g., Orange Pi 5, Radxa Rock 5)</strong>
                    <p class="mb-3 text-slate-300">The current darling of the DIY drone community. For under $150, you get performance that rivals early Jetsons.</p>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> CPU: Quad Cortex-A76 @ 2.4GHz + Quad Cortex-A55 @ 1.8GHz</li>
                        <li>> NPU: 6 TOPS (INT4/INT8/INT16/FP16)</li>
                        <li>> RAM: Up to 32GB LPDDR4x/5 @ 51.2 GB/s</li>
                        <li>> Video: 8K H.265 decode / 8K H.264 encode</li>
                        <li>> ISP: 48MP dual-camera, HDR</li>
                        <li>> RKNN Toolkit2: v2.3.2 (Apr 2025) — pip-installable, ARM64 native execution on-device. Supports ONNX, TFLite, PyTorch export paths.</li>
                        <li>> Reality Check: Unbeatable price-to-performance for budget builds. Toolchain maturity still lags TensorRT — operator coverage gaps exist for newer Transformer-based models. Allocate extra integration time. Best use: YOLO11n/s at 30+ fps as sole inference workload, or as host CPU running navigation while a Hailo M.2 handles vision.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-slate-700">
                    <strong class="text-amber-400 text-lg block mb-2">Rockchip RK3576 <span class="text-xs bg-amber-900/50 px-2 py-0.5 rounded">2024 — MID-RANGE</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> CPU: Quad Cortex-A72 @ 2.2GHz + Quad Cortex-A53 @ 2.0GHz</li>
                        <li>> NPU: 6 TOPS (same tier as RK3588 NPU)</li>
                        <li>> GPU: Mali-G52 MC3 (OpenGL ES 3.2, Vulkan 1.2)</li>
                        <li>> Video: 4K H.265 @ 120fps, H.264 @ 60fps</li>
                        <li>> Operating range: -40°C to +105°C industrial spec</li>
                        <li>> Reality Check: Lower CPU performance than RK3588 (A72 vs A76 cores) but same NPU capability and stronger industrial temperature rating. Relevant for sealed/enclosed fuselages that experience extreme thermal swings on cold-weather missions. Not yet widely available as a dev board (mid-2025).</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-sky-700 md:col-span-2">
                    <strong class="text-sky-400 text-lg block mb-2">Ambarella CV5 <span class="text-xs bg-sky-900/50 px-2 py-0.5 rounded">COMMERCIAL DRONE SILICON</span></strong>
                    <p class="mb-3 text-slate-300">Ambarella powers the image pipelines in most professional and commercial drone cameras (DJI Zenmuse series, next-gen action cameras). The CV5 is the convergence of an ultra-low-power 8K encoder with a serious CVflow AI engine.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-slate-300">
                        <ul class="space-y-1">
                            <li>> CPU: Dual Cortex-A76 @ 1.6GHz</li>
                            <li>> AI Engine: CVflow (proprietary — no public TOPS figure; optimized for CV workloads)</li>
                            <li>> Memory: LPDDR5/5x 64-bit, up to 32GB, 44.8 GB/s bandwidth</li>
                            <li>> Video encode: 8K H.265 @ 60fps at &lt;2W — best-in-class efficiency</li>
                            <li>> ISP: 500MP/s pixel throughput, 14-stop HDR, multi-imager support</li>
                        </ul>
                        <ul class="space-y-1">
                            <li>> SLAM: On-chip support for optical flow + VIO</li>
                            <li>> Obstacle detection: Stereo depth processing in-silicon</li>
                            <li>> Power: 2–4W total for full encode + AI pipeline</li>
                            <li>> Reality Check: You will not buy a CV5 dev kit on Amazon. This is OEM silicon — Ambarella sells to drone manufacturers, not hobbyists. Understanding its architecture matters for evaluating commercial payload cameras and for system architects designing custom drone platforms at production volume. The &lt;2W encode power at 8K is unmatched — no Jetson or Rockchip comes close.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Qualcomm Flight -->
        <div class="hw-card p-8 rounded-xl relative overflow-hidden">
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                Qualcomm Flight Platform <span class="ml-4 text-xs bg-sky-900/50 text-sky-400 px-3 py-1 rounded border border-sky-800">DRONE-NATIVE SILICON</span>
            </h4>
            <p class="text-slate-300 mt-4 mb-6">Qualcomm's Flight platforms are the only major compute platforms engineered specifically for autonomous drones — not adapted from phones, cars, or servers. They integrate cellular, multi-camera ISP, and flight-relevant DSP capabilities onto a single SoC.</p>

            <div class="bg-slate-900 p-4 rounded border border-sky-800 text-sm">
                <strong class="text-sky-400 text-lg block mb-2">Qualcomm Flight RB5 5G Platform</strong>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-slate-300">
                    <ul class="space-y-1">
                        <li>> SoC: Snapdragon 865 — 8-core (up to 2.84GHz)</li>
                        <li>> AI Engine: 15 TOPS + Hexagon DSP 8 TOPS = 23 TOPS combined</li>
                        <li>> RAM: 8–16GB LPDDR5 @ 2750MHz</li>
                        <li>> Camera: Spectra 480 ISP — 7 concurrent cameras, 2 Gpixel/s, 8K / 4K HDR / 200MP photo</li>
                        <li>> Connectivity: 5G Sub-6GHz + mmWave, Wi-Fi 6, Bluetooth 5.2</li>
                        <li>> GNSS: Concurrent GPS/GLONASS/BeiDou/Galileo</li>
                    </ul>
                    <ul class="space-y-1">
                        <li>> Framework: Qualcomm AI Stack (SNPE — supports ONNX, TFLite, Caffe2)</li>
                        <li>> OS: Ubuntu Linux (RB5 reference platform), Android (optional)</li>
                        <li>> Mission use cases: BVLOS with integrated 5G C2 link, 7-camera 360° perception, GPS-denied VIO</li>
                        <li>> Reality Check: The 5G modem is the differentiator. Drones needing cellular telemetry normally carry a separate LTE module (Sixfab, Quectel) adding 30–80g. The RB5 integrates this. SNPE toolchain is more mature for Snapdragon targets than RKNN but narrower than TensorRT. Primarily deployed in commercial delivery and inspection platforms, not hobbyist builds.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <h3>3.3 The TOPS Trap — Why Raw Numbers Lie</h3>
    <p>TOPS (Tera Operations Per Second) is the most-cited benchmark in edge AI marketing. It is also one of the most misleading. A 100-TOPS chip can be bottlenecked to 20-TOPS effective throughput by an insufficient memory bus. Understanding the actual constraints will save you from picking the wrong silicon.</p>

    <div class="space-y-4 mb-10">
        <div class="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div class="bg-slate-900 p-4 rounded border border-red-900/50">
                    <strong class="text-red-400 block mb-2">The Memory Wall</strong>
                    <p class="text-slate-300 font-mono text-xs">Inference is memory-bound, not compute-bound, for most models. Each layer of a neural network must stream weights from DRAM into the compute array. If bandwidth is insufficient, the NPU/GPU stalls waiting for data — TOPS rating becomes irrelevant. Rule: <span class="text-red-400">check GB/s first, TOPS second.</span></p>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-amber-900/50">
                    <strong class="text-amber-400 block mb-2">Precision Tax</strong>
                    <p class="text-slate-300 font-mono text-xs">TOPS figures are always quoted at INT8 (or INT4 for marketing). Real models in production often run FP16 (half-precision floating point) because INT8 quantization degrades accuracy on detection heads. FP16 TOPS is typically 50% of INT8 TOPS on the same chip. Always ask: "TOPS at what precision?"</p>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-sky-900/50">
                    <strong class="text-sky-400 block mb-2">Sustained vs. Peak</strong>
                    <p class="text-slate-300 font-mono text-xs">Thermal throttling under sustained inference load can drop effective throughput 20–40% below rated spec on fanless designs inside enclosed fuselages. Thermal budget is as important as silicon spec — always cross-reference steady-state junction temperature ratings, not just peak TDP.</p>
                </div>
            </div>

            <div class="mt-6 overflow-x-auto">
                <table class="w-full text-xs font-mono text-slate-300 border-collapse">
                    <thead>
                        <tr class="border-b border-slate-700">
                            <th class="text-left py-2 pr-4 text-slate-400">Platform</th>
                            <th class="text-right py-2 px-4 text-slate-400">TOPS (INT8)</th>
                            <th class="text-right py-2 px-4 text-slate-400">Mem BW (GB/s)</th>
                            <th class="text-right py-2 px-4 text-slate-400">Power (W)</th>
                            <th class="text-right py-2 px-4 text-slate-400">TOPS/W</th>
                            <th class="text-left py-2 pl-4 text-slate-400">Bottleneck</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                            <td class="py-2 pr-4 text-emerald-400">Jetson Orin Nano Super</td>
                            <td class="text-right px-4">67</td>
                            <td class="text-right px-4 text-emerald-400">102</td>
                            <td class="text-right px-4">25</td>
                            <td class="text-right px-4">2.7</td>
                            <td class="pl-4 text-slate-400">Power envelope on airframe</td>
                        </tr>
                        <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                            <td class="py-2 pr-4">Jetson Orin NX (16GB)</td>
                            <td class="text-right px-4">100</td>
                            <td class="text-right px-4">102</td>
                            <td class="text-right px-4">25</td>
                            <td class="text-right px-4">4.0</td>
                            <td class="pl-4 text-slate-400">Memory bandwidth shared GPU+NPU</td>
                        </tr>
                        <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                            <td class="py-2 pr-4">Axelera Metis M.2</td>
                            <td class="text-right px-4 text-amber-400">214</td>
                            <td class="text-right px-4">PCIe 3×4</td>
                            <td class="text-right px-4">6.5</td>
                            <td class="text-right px-4 text-amber-400">33</td>
                            <td class="pl-4 text-slate-400">Model zoo coverage (maturing)</td>
                        </tr>
                        <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                            <td class="py-2 pr-4">Hailo-8 M.2</td>
                            <td class="text-right px-4">26</td>
                            <td class="text-right px-4">PCIe 3×4</td>
                            <td class="text-right px-4">2.5</td>
                            <td class="text-right px-4 text-emerald-400">10.4</td>
                            <td class="pl-4 text-slate-400">DFC compile step; no general CPU</td>
                        </tr>
                        <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                            <td class="py-2 pr-4">Qualcomm Flight RB5</td>
                            <td class="text-right px-4">23</td>
                            <td class="text-right px-4">LPDDR5</td>
                            <td class="text-right px-4">~8</td>
                            <td class="text-right px-4">2.9</td>
                            <td class="pl-4 text-slate-400">SNPE ecosystem narrower than TRT</td>
                        </tr>
                        <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                            <td class="py-2 pr-4">Rockchip RK3588</td>
                            <td class="text-right px-4">6</td>
                            <td class="text-right px-4">51.2</td>
                            <td class="text-right px-4">~8</td>
                            <td class="text-right px-4">0.75</td>
                            <td class="pl-4 text-slate-400">RKNN operator coverage gaps</td>
                        </tr>
                        <tr class="hover:bg-slate-800/30">
                            <td class="py-2 pr-4">Ambarella CV5</td>
                            <td class="text-right px-4">—</td>
                            <td class="text-right px-4 text-sky-400">44.8</td>
                            <td class="text-right px-4 text-emerald-400">&lt;2</td>
                            <td class="text-right px-4">—</td>
                            <td class="pl-4 text-slate-400">OEM-only; no public dev kit</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <h3>3.4 Hardware Selection Framework</h3>
    <p>Use this decision logic to narrow to a candidate platform before benchmarking. These are not absolute rules — they are starting points based on the dominant constraint at each branch.</p>

    <div class="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 mb-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div class="space-y-3">
                <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                    <strong class="text-emerald-400 block mb-1">Budget &lt;$300 / platform weight &lt;300g</strong>
                    <p class="text-slate-300 font-mono text-xs">→ Rockchip RK3588 SBC + Hailo-8L M.2<br>→ Single inference stream (YOLO11n/s)<br>→ JetPack alternative: Orin Nano (legacy) or Orin Nano Super if budget allows</p>
                </div>
                <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                    <strong class="text-sky-400 block mb-1">Sub-5kg airframe, multiple concurrent models</strong>
                    <p class="text-slate-300 font-mono text-xs">→ Jetson Orin Nano Super (102 GB/s bandwidth clears multi-model bottleneck)<br>→ JetPack 6.2+, carrier board: Neousys FLYC-300 or Auvidea JNX42<br>→ Target 15W mode during inference windows, 7W during transit</p>
                </div>
                <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
                    <strong class="text-purple-400 block mb-1">Gimbal / smart camera payload</strong>
                    <p class="text-slate-300 font-mono text-xs">→ Hailo-15H (20 TOPS, integrated 4K ISP, fanless)<br>→ Sends inference metadata over MAVLink — eliminates video downlink for detection tasks<br>→ Commercial: Ambarella CV5-based OEM designs</p>
                </div>
            </div>
            <div class="space-y-3">
                <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                    <strong class="text-amber-400 block mb-1">BVLOS / cellular C2 required</strong>
                    <p class="text-slate-300 font-mono text-xs">→ Qualcomm Flight RB5 5G (integrated 5G modem saves 40–80g vs separate LTE module)<br>→ 7-camera concurrent perception for beyond-visual-range operations<br>→ Supplement with dedicated Hailo-8 M.2 if inference throughput is insufficient</p>
                </div>
                <div class="bg-slate-900 p-4 rounded border-l-4 border-red-500">
                    <strong class="text-red-400 block mb-1">Heavy-lift VTOL (&gt;10kg payload) or UGV</strong>
                    <p class="text-slate-300 font-mono text-xs">→ Jetson AGX Orin (275 TOPS, 64GB, 204 GB/s) or Jetson Thor (2025+)<br>→ Axelera Metis M.2 as co-processor for dense inference (214 TOPS at 6.5W)<br>→ Power envelope no longer the constraint — maximize capability</p>
                </div>
                <div class="bg-slate-900 p-4 rounded border-l-4 border-slate-500">
                    <strong class="text-slate-400 block mb-1">M.2 co-processor (add TOPS to existing host)</strong>
                    <p class="text-slate-300 font-mono text-xs">→ 13–26 TOPS: Hailo-8L / Hailo-8 (mature ecosystem, sub-3W)<br>→ 26–100 TOPS: Hailo-8 or Axelera Metis (evaluate model zoo coverage for your specific models)<br>→ Check host board PCIe lane availability before ordering</p>
                </div>
            </div>
        </div>
    </div>
</div>
`;
