export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 2</span>
    <h2>Compute Silicon Matrix</h2>
    <p>The landscape of Edge AI processors is vast. Selecting the correct System on Module (SoM) is the most consequential decision in the engineering lifecycle. We must look beyond raw TOPS and analyze memory bandwidth, framework support, and physical footprint.</p>

    <h3>2.1 The AI Silicon Landscape Visualization</h3>
    <p>This chart maps the current market. Cost is plotted logarithmically. Notice how newer NPUs (Neural Processing Units) are drastically pulling down the cost-to-performance ratio compared to traditional GPUs.</p>

    <div class="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 mb-10 shadow-lg">
        <div class="chart-container" style="height: 600px;">
            <canvas id="hwChartMain"></canvas>
        </div>
    </div>

    <h3>2.2 Exhaustive Hardware Profiles</h3>

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
                <div class="bg-slate-900 p-4 rounded border border-slate-700">
                    <strong class="text-sky-400 text-lg block mb-2">Jetson Orin NX (16GB)</strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 100 TOPS (INT8)</li>
                        <li>> GPU: 1024-core Ampere architecture</li>
                        <li>> RAM: 16GB 128-bit LPDDR5</li>
                        <li>> Bandwidth: 102 GB/s</li>
                        <li>> Power: 10W - 25W</li>
                        <li>> Reality Check: Unmatched ecosystem. Requires expensive 3rd party carrier boards (+$200-400) for drone integration.</li>
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
                        <li>> Reality Check: Too heavy for most sUAS (&lt;5kg). Primarily used on large octocopters or ground robots (UGVs).</li>
                    </ul>
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
                <div class="bg-slate-900 p-4 rounded border border-slate-700">
                    <strong class="text-purple-400 text-lg block mb-2">Google Coral Edge TPU</strong>
                    <ul class="space-y-1 font-mono text-slate-300">
                        <li>> Compute: 4 TOPS</li>
                        <li>> Power: 2W</li>
                        <li>> Interface: USB, PCIe, M.2</li>
                        <li>> Reality Check: The pioneer of cheap Edge AI, but aging rapidly. Limited to TensorFlow Lite. 4 TOPS cannot run modern models like YOLO11 at any useful framerate.</li>
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
                    <li>> Reality Check: Unbeatable price. However, the software toolchain (RKNN) is notoriously difficult to use, poorly documented, and lacks the smooth PyTorch-to-Edge pipeline found in NVIDIA/Hailo ecosystems.</li>
                </ul>
            </div>
        </div>
    </div>
</div>
`;
