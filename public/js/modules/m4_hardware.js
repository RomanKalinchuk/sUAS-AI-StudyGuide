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
                <div class="bg-slate-900 p-4 rounded border border-slate-700">
                    <strong class="text-sky-400 text-lg block mb-2">Jetson Orin NX (16GB)</strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 100 TOPS (INT8)</li>
                        <li>> GPU: 1024-core Ampere architecture</li>
                        <li>> RAM: 16GB 128-bit LPDDR5</li>
                        <li>> Bandwidth: 102 GB/s</li>
                        <li>> Power: 10W - 25W</li>
                        <li>> Reality Check: Preferred when concurrent models are required (YOLO + VSLAM + depth fusion). Requires 3rd-party carrier boards for drone integration — see Low-SWaP Carrier Boards below.</li>
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
        </div>

        <!-- Hailo & Edge TPU -->
        <div class="hw-card p-8 rounded-xl relative overflow-hidden">
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                Dedicated NPUs (Hailo, Coral) <span class="ml-4 text-xs bg-purple-900/50 text-purple-400 px-3 py-1 rounded border border-purple-800">THE EFFICIENCY KINGS</span>
            </h4>
            <p class="text-slate-300 mt-4 mb-6">Neural Processing Units are ASICs (Application-Specific Integrated Circuits). They cannot run general-purpose code (like a CPU) or render graphics (like a GPU). They do one thing: multiply matrices extremely fast at very low power.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="bg-slate-900 p-4 rounded border border-slate-700">
                    <strong class="text-purple-400 text-lg block mb-2">Hailo-8 M.2 Module</strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 26 TOPS</li>
                        <li>> Power: ~2.5W (Typical)</li>
                        <li>> Interface: PCIe Gen-3 x4</li>
                        <li>> Reality Check: Exceptional performance-per-watt. Often paired with an x86 SBC or Raspberry Pi 5. Requires converting models using Hailo Dataflow Compiler.</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-red-900/50">
                    <strong class="text-red-400 text-lg block mb-2">Google Coral Edge TPU <span class="text-xs bg-red-900/50 px-2 py-0.5 rounded">ECOSYSTEM STAGNANT</span></strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 4 TOPS</li>
                        <li>> Power: 2W</li>
                        <li>> Interface: USB, PCIe, M.2</li>
                        <li>> Reality Check: The pioneer of cheap Edge AI. Hardware has not been updated since 2019 and the software ecosystem has stagnated — TensorFlow Lite only, no PyTorch or ONNX path. 4 TOPS cannot run YOLO11n at real-time speed. <span class="text-red-400">Not recommended for new designs.</span> Hailo-8L (13 TOPS, $25 module) is the correct modern replacement at similar cost.</li>
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

            <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm">
                <strong class="text-amber-400 text-lg block mb-2">Rockchip RK3588 (e.g., Orange Pi 5)</strong>
                <p class="mb-3 text-slate-300">The current darling of the DIY drone community. For under $150, you get performance that rivals early Jetsons.</p>
                <ul class="space-y-1 font-mono text-slate-300">
                    <li>> CPU: Quad Cortex-A76 + Quad Cortex-A55</li>
                    <li>> NPU: 6 TOPS</li>
                    <li>> Reality Check: Unbeatable price. The RKNN Toolkit2 toolchain has improved significantly — v2.3.2 (April 2025) is pip-installable and supports ARM64 native execution on the RK3588 itself. However, operator coverage and documentation still lag behind NVIDIA/Hailo ecosystems. Expect additional debugging effort compared to TensorRT or the Hailo Dataflow Compiler.</li>
                </ul>
            </div>
        </div>
    </div>
</div>
`;
