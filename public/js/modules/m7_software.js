export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 7</span>
    <h2>Edge Software Toolchains</h2>
    <p>Writing code for a drone is unlike web or backend development. Memory leaks or garbage-collection pauses don't just crash an app — they crash physical hardware. This module covers the complete 2024–2026 state-of-the-art edge software stack: inference runtimes, middleware, autopilot firmware, real-time OS tuning, and deployment pipelines. Every tool here has been selected because it is used in production autonomous sUAS programs today.</p>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-6">
        <h3 class="text-sky-400 font-bold text-lg mb-3">Module Roadmap</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono text-slate-300">
            <div class="bg-slate-900 p-3 rounded border border-slate-700"><span class="text-sky-400 block mb-1">7.1–7.2</span>TensorRT 10.x &amp; ONNX Runtime</div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700"><span class="text-sky-400 block mb-1">7.3–7.4</span>ROS 2 Jazzy / Humble + QoS</div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700"><span class="text-sky-400 block mb-1">7.5–7.6</span>Isaac ROS GEMs + micro-ROS</div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700"><span class="text-sky-400 block mb-1">7.7–7.8</span>Behavior Trees + Nav2</div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700"><span class="text-sky-400 block mb-1">7.9</span>PX4 v1.15 + uXRCE-DDS</div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700"><span class="text-sky-400 block mb-1">7.10</span>MAVLink + MAVSDK + GCS</div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700"><span class="text-sky-400 block mb-1">7.11</span>Real-Time OS + PREEMPT_RT</div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700"><span class="text-sky-400 block mb-1">7.12–7.13</span>Docker + CI/CD + NPU Landscape</div>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.1 TensorRT 10.x — The Inference Compiler</h3>
    <p>TensorRT is not a library you call at runtime like PyTorch. It is an <strong>ahead-of-time compiler</strong> that takes a trained model, fuses layers, re-orders operations, selects optimal CUDA kernels for the exact GPU silicon present, and produces a binary <em>engine file</em>. On a Jetson Orin Nano, TensorRT INT8 delivers roughly 3–5× the throughput of FP16 PyTorch at one-third the power draw.</p>

    <h4 class="text-sky-400 mt-6 mb-2">API Changes in TensorRT 10.x (Breaking from 8.x)</h4>
    <p>TensorRT 10.0 (released with JetPack 6.0, April 2024) made the largest API cleanup in the library's history. The table below captures what changed and what you must migrate to before TensorRT 11.0 removes the legacy paths entirely.</p>

    <div class="overflow-x-auto mb-8">
        <table class="w-full text-xs font-mono text-slate-300 border-collapse">
            <thead>
                <tr class="bg-slate-800 text-slate-400">
                    <th class="text-left p-3 border border-slate-700">Deprecated / Removed</th>
                    <th class="text-left p-3 border border-slate-700">Replacement (TRT 10.x)</th>
                    <th class="text-left p-3 border border-slate-700">Removal Target</th>
                </tr>
            </thead>
            <tbody>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-red-400">IInt8EntropyCalibrator2 and all IInt8Calibrator variants</td><td class="p-3 border border-slate-700 text-emerald-400">Explicit Q/DQ nodes (QuantizeLinear / DequantizeLinear in ONNX)</td><td class="p-3 border border-slate-700">TRT 11.0 (2025)</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-red-400">Implicit INT8 quantization (setDynamicRange, getDynamicRange*)</td><td class="p-3 border border-slate-700 text-emerald-400">Explicit quantization with IQuantizeLayer / IDequantizeLayer</td><td class="p-3 border border-slate-700">TRT 11.0</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-red-400">IPluginV2 family</td><td class="p-3 border border-slate-700 text-emerald-400">IPluginV3 (full lifecycle ownership, no RAII issues)</td><td class="p-3 border border-slate-700">TRT 11.0</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-red-400">Weakly-typed networks (EXPLICIT_BATCH flag)</td><td class="p-3 border border-slate-700 text-emerald-400">STRONGLY_TYPED flag — tensor dtypes inferred from graph</td><td class="p-3 border border-slate-700">TRT 11.0</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-red-400">build_engine() (Python) / buildEngineWithConfig()</td><td class="p-3 border border-slate-700 text-emerald-400">build_serialized_network() → deserialize_cuda_engine()</td><td class="p-3 border border-slate-700">Removed TRT 10.0</td></tr>
                <tr><td class="p-3 border border-slate-700 text-red-400">libnvinfer_static.a (Linux static libs)</td><td class="p-3 border border-slate-700 text-emerald-400">Shared libraries (.so) only</td><td class="p-3 border border-slate-700">TRT 11.0</td></tr>
            </tbody>
        </table>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">Modern Builder Pattern (TensorRT 10.x)</h4>
    <p>The canonical two-phase pattern for TRT 10.x is: <strong>build once, serialize to disk, load engine at startup</strong>. The engine file is hardware-specific — a .engine built on Orin Nano will not run on Orin NX without rebuilding.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python · TensorRT 10.x — Build Phase (ONNX → Serialized Engine)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand"><summary>Python Code Example</summary>
<pre><code class="language-python">import tensorrt as trt
import os

TRT_LOGGER = trt.Logger(trt.Logger.WARNING)

def build_engine(onnx_path: str, engine_path: str, fp16: bool = True, int8: bool = False):
    """Build a TensorRT engine from ONNX. Run once per hardware target."""
    builder = trt.Builder(TRT_LOGGER)

    # TRT 10.x: STRONGLY_TYPED is recommended. EXPLICIT_BATCH is deprecated.
    network_flags = 1 &lt;&lt; int(trt.NetworkDefinitionCreationFlag.STRONGLY_TYPED)
    network = builder.create_network(network_flags)

    config = builder.create_builder_config()
    config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, 2 &lt;&lt; 30)  # 2 GB

    if fp16 and builder.platform_has_fast_fp16:
        config.set_flag(trt.BuilderFlag.FP16)

    if int8:
        # TRT 10.x: INT8 requires explicit Q/DQ nodes in the ONNX graph.
        # Use TensorRT Model Optimizer (nvidia/TensorRT-Model-Optimizer) to insert them.
        config.set_flag(trt.BuilderFlag.INT8)

    parser = trt.OnnxParser(network, TRT_LOGGER)
    with open(onnx_path, 'rb') as f:
        if not parser.parse(f.read()):
            for i in range(parser.num_errors):
                print(parser.get_error(i))
            raise RuntimeError("ONNX parse failed")

    profile = builder.create_optimization_profile()
    profile.set_shape("images", (1,3,640,640), (4,3,640,640), (8,3,640,640))
    config.add_optimization_profile(profile)

    serialized = builder.build_serialized_network(network, config)
    if serialized is None:
        raise RuntimeError("Engine build failed")

    with open(engine_path, 'wb') as f:
        f.write(serialized)
    print(f"Engine saved: {engine_path} ({os.path.getsize(engine_path) // 1024} KB)")

build_engine("yolo11s.onnx", "yolo11s_int8.engine", fp16=True, int8=True)</code></pre>
</details>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">Quantization Types in TRT 10.x</h4>
    <div class="overflow-x-auto mb-6">
        <table class="w-full text-xs font-mono text-slate-300 border-collapse">
            <thead>
                <tr class="bg-slate-800 text-slate-400">
                    <th class="text-left p-3 border border-slate-700">Type</th>
                    <th class="text-left p-3 border border-slate-700">Format</th>
                    <th class="text-left p-3 border border-slate-700">Drone Use Case</th>
                </tr>
            </thead>
            <tbody>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-emerald-400">INT8</td><td class="p-3 border border-slate-700">8-bit 2s complement</td><td class="p-3 border border-slate-700">YOLO26 / RT-DETR on Orin — best latency/accuracy tradeoff for ConvNets</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-sky-400">FP8 (E4M3)</td><td class="p-3 border border-slate-700">8-bit float</td><td class="p-3 border border-slate-700">Transformer encoder layers. No optimized FP8 kernels for depthwise convolutions — stick to INT8 for backbone</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-amber-400">INT4</td><td class="p-3 border border-slate-700">4-bit, block quantized</td><td class="p-3 border border-slate-700">Weight-only quant for large GEMM layers. Memory-bandwidth-bound ops only</td></tr>
                <tr><td class="p-3 border border-slate-700 text-purple-400">FP4 (NVFP4)</td><td class="p-3 border border-slate-700">4-bit float, block-16</td><td class="p-3 border border-slate-700">Blackwell GPU only (Jetson Thor / GB200). Not available on Orin (Ampere)</td></tr>
            </tbody>
        </table>
    </div>

    <div class="bg-slate-800/50 border border-amber-700/40 rounded-xl p-5 text-sm mb-8">
        <strong class="text-amber-400 block mb-2">Benchmark: YOLO26s on Jetson Orin NX (16GB, JetPack 6.2, TRT 10.3)</strong>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs text-slate-300 mt-3">
            <div class="bg-slate-900 p-3 rounded border border-slate-700"><div class="text-slate-400 mb-1">PyTorch FP32</div><div class="text-2xl text-amber-400">~18 FPS</div><div class="text-slate-500">~14W GPU</div></div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700"><div class="text-slate-400 mb-1">TRT FP16</div><div class="text-2xl text-sky-400">~52 FPS</div><div class="text-slate-500">~10W GPU</div></div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700"><div class="text-slate-400 mb-1">TRT INT8 (QAT)</div><div class="text-2xl text-emerald-400">~65 FPS</div><div class="text-slate-500">~8W GPU</div></div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700"><div class="text-slate-400 mb-1">TRT INT8 mAP loss</div><div class="text-2xl text-emerald-400">&lt;0.5%</div><div class="text-slate-500">vs FP32 baseline</div></div>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.2 ONNX Runtime for Edge Deployment</h3>
    <p>ONNX Runtime (ORT) is the cross-hardware inference layer that lets you run the same model graph on CUDA, TensorRT, CoreML, NNAPI, and OpenVINO by swapping an Execution Provider (EP) string. For Jetson deployments the TensorRT EP is the primary path; the CUDA EP serves as fallback for ops TRT cannot handle.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python · ONNX Runtime 1.19+ — Jetson Orin with TensorRT EP + CUDA EP fallback</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand"><summary>Python Code Example</summary>
<pre><code class="language-python">import onnxruntime as ort
import numpy as np

trt_options = {
    "device_id": 0,
    "trt_fp16_enable": True,
    "trt_int8_enable": True,          # Requires QDQ nodes in ONNX model
    "trt_engine_cache_enable": True,
    "trt_engine_cache_path": "/opt/drone/trt_cache",
    "trt_timing_cache_enable": True,
    "trt_cuda_graph_enable": True,    # Reduces CPU dispatch latency ~15%
    "trt_max_workspace_size": 2147483648,  # 2 GB
}

providers = [
    ("TensorrtExecutionProvider", trt_options),
    ("CUDAExecutionProvider", {"device_id": 0}),
]

sess_options = ort.SessionOptions()
sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

session = ort.InferenceSession("yolo11s_qdq.onnx", sess_options=sess_options, providers=providers)
dummy = np.random.randn(1, 3, 640, 640).astype(np.float32)
outputs = session.run(None, {"images": dummy})
print(f"Output shape: {outputs[0].shape}")</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.3 ROS 2 — Humble vs. Jazzy: Choosing Your LTS</h3>
    <p>ROS 2 has two active Long-Term Support releases targeting production drone programs. The right choice depends on your hardware, JetPack version, and whether you're starting fresh or maintaining existing code.</p>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-5 mb-6">
        <h4 class="text-sky-400 font-bold text-base mt-0 mb-3">The Full Release Picture as of August 2026</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-xs">
                <thead class="text-slate-400 border-b border-slate-700">
                    <tr><th class="p-2 text-left">Distribution</th><th class="p-2 text-left">Released</th><th class="p-2 text-left">Ubuntu</th><th class="p-2 text-left">Support ends</th><th class="p-2 text-left">Verdict for airframe work</th></tr>
                </thead>
                <tbody class="text-slate-300 divide-y divide-slate-800">
                    <tr><td class="p-2 text-emerald-400 font-semibold">Humble Hawksbill</td><td class="p-2">May 2022 (LTS)</td><td class="p-2">22.04</td><td class="p-2">May 2027</td><td class="p-2">Still the safest target for JetPack 6.x Orin hardware, but the clock is now short — under a year of support left. Do not start new programs here.</td></tr>
                    <tr><td class="p-2 text-emerald-400 font-semibold">Jazzy Jalisco</td><td class="p-2">May 2024 (LTS)</td><td class="p-2">24.04</td><td class="p-2">May 2029</td><td class="p-2"><strong class="text-emerald-400">The default choice in 2026.</strong> Matches JetPack 7 / Ubuntu 24.04 natively, and runs in containers on JetPack 6 hosts. Longest practical runway against shipping silicon.</td></tr>
                    <tr><td class="p-2 text-amber-400 font-semibold">Kilted Kaiju</td><td class="p-2">May 2025</td><td class="p-2">24.04</td><td class="p-2">Nov 2026 (non-LTS)</td><td class="p-2">Non-LTS, expiring within months. Useful only to preview features. Never ship an aircraft on it.</td></tr>
                    <tr><td class="p-2 text-sky-400 font-semibold">Lyrical Luth</td><td class="p-2">May 2026 (LTS)</td><td class="p-2">26.04</td><td class="p-2">May 2031</td><td class="p-2">The newest LTS and eventually the right answer — but it needs Ubuntu 26.04, and <strong class="text-white">no shipping Jetson BSP is on 26.04 yet</strong>. Track it; do not port to it on-airframe in 2026.</td></tr>
                </tbody>
            </table>
        </div>
        <p class="text-slate-400 text-xs mt-3"><strong class="text-slate-200">The governing constraint is not ROS, it is the vendor BSP.</strong> Jetson modules ship a specific L4T/Ubuntu combination, and the CUDA, TensorRT, and camera drivers are built against it. Newer ROS distributions become usable on a Jetson only after NVIDIA ships a JetPack on the matching Ubuntu base — which is why Lyrical, despite being the newest LTS with the longest support window, is not yet the pragmatic on-aircraft choice. The standard mitigation is to containerize: run a Jazzy image on whatever host the BSP dictates, and keep your application decoupled from the base OS. Teams that instead try to force a newer Ubuntu onto the module reliably lose weeks to broken GPU drivers.</p>
    </div>

    <figure class="my-6">
        <img src="images/m7_ros2_architecture.png" alt="ROS 2 layered architecture showing client libraries, RCL, RMW, and DDS middleware layers" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">ROS 2 layered architecture: user code calls rclcpp/rclpy → RCL → RMW abstraction → DDS vendor (FastDDS, CycloneDDS, Connext). Source: <a href="https://docs.ros.org/en/rolling/Concepts/Advanced/About-Internal-Interfaces.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">ROS 2 Documentation</a></figcaption>
    </figure>

    <h4 class="text-sky-400 mt-4 mb-2">Humble (2022 LTS) vs. Jazzy (2024 LTS) — Decision Matrix</h4>
    <div class="overflow-x-auto mb-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Feature</th>
                    <th class="p-3">Humble (May 2022, EOL May 2027)</th>
                    <th class="p-3">Jazzy (May 2024, EOL May 2029)</th>
                    <th class="p-3">Drone Impact</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-slate-300 font-mono text-xs">Ubuntu base</td><td class="p-3 text-slate-300 text-xs">Ubuntu 22.04</td><td class="p-3 text-emerald-400 text-xs">Ubuntu 24.04</td><td class="p-3 text-slate-400 text-xs">Jazzy requires L4T r36.4+ / JetPack 7 on Orin; Humble runs on JetPack 6.x</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-slate-300 font-mono text-xs">Isaac ROS support</td><td class="p-3 text-emerald-400 text-xs">Full (Isaac ROS 3.x)</td><td class="p-3 text-emerald-400 text-xs">Full (JetPack 7+ / Isaac ROS 4.x)</td><td class="p-3 text-slate-400 text-xs">As of 2026, Jazzy is the primary target; Humble remains supported until May 2027</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-slate-300 font-mono text-xs">Default DDS</td><td class="p-3 text-slate-300 text-xs">FastDDS (eProsima)</td><td class="p-3 text-slate-300 text-xs">FastDDS (eProsima)</td><td class="p-3 text-slate-400 text-xs">CycloneDDS recommended for drone workloads on both — lower latency, simpler config</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-slate-300 font-mono text-xs">Executor WaitSet</td><td class="p-3 text-amber-400 text-xs">Partial</td><td class="p-3 text-emerald-400 text-xs">Full rclcpp::WaitSet integration — reduces alloc/dealloc churn per spin</td><td class="p-3 text-slate-400 text-xs">Lower jitter on IMU/camera callback threads in Jazzy</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-slate-300 font-mono text-xs">Service recording (rosbag2)</td><td class="p-3 text-red-400 text-xs">Topics only</td><td class="p-3 text-emerald-400 text-xs">Services + topics + metadata self-contained</td><td class="p-3 text-slate-400 text-xs">Record full mission service calls for post-flight replay debugging</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-slate-300 font-mono text-xs">Type Adaptation (REP-2007)</td><td class="p-3 text-emerald-400 text-xs">Supported</td><td class="p-3 text-emerald-400 text-xs">Extended to message_filters TypeAdapters</td><td class="p-3 text-slate-400 text-xs">GPU tensor pipelines skip CPU serialization in both; wider in Jazzy</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-slate-300 font-mono text-xs">Gazebo pairing</td><td class="p-3 text-slate-300 text-xs">Gazebo Garden / Harmonic</td><td class="p-3 text-emerald-400 text-xs">Gazebo Harmonic (recommended)</td><td class="p-3 text-slate-400 text-xs">Gazebo Classic unsupported on Ubuntu 24.04 — must migrate sims</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-slate-300 font-mono text-xs">PX4 v1.15 uXRCE-DDS</td><td class="p-3 text-emerald-400 text-xs">Fully supported</td><td class="p-3 text-emerald-400 text-xs">Fully supported</td><td class="p-3 text-slate-400 text-xs">PX4 bridges to either distro identically via Micro XRCE-DDS Agent</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-slate-300 font-mono text-xs">Timer callback info</td><td class="p-3 text-red-400 text-xs">Not available</td><td class="p-3 text-emerald-400 text-xs">rclcpp::TimerInfo — actual vs. expected call times</td><td class="p-3 text-slate-400 text-xs">Enables missed-deadline detection in real-time control loops</td></tr>
            </tbody>
        </table>
    </div>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-6">
        <h3 class="text-sky-400 font-bold text-lg mb-3">Which LTS Should You Choose? (2025 Guidance)</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div class="bg-slate-900 p-4 rounded border border-emerald-700/50">
                <strong class="text-emerald-400 block mb-2">Choose Humble if:</strong>
                <ul class="space-y-1 text-xs list-disc list-inside text-slate-400">
                    <li>You are deploying on Jetson Orin with JetPack 6.x today</li>
                    <li>You need Isaac ROS 3.x packages (cuVSLAM, nvblox, object detection)</li>
                    <li>You have existing MAVROS or third-party packages only built for Humble</li>
                    <li>You are maintaining an existing fleet already on Humble and cannot requalify before May 2027</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-sky-700/50">
                <strong class="text-sky-400 block mb-2">Choose Jazzy if:</strong>
                <ul class="space-y-1 text-xs list-disc list-inside text-slate-400">
                    <li>You are targeting Jetson Thor or next-gen hardware with JetPack 7</li>
                    <li>Your program ships in 2026 or later — this is the default for new work</li>
                    <li>You need service recording in rosbag2 from day one</li>
                    <li>All your dependencies have Jazzy builds (check before committing)</li>
                </ul>
            </div>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">DDS Middleware Selection for Drones</h4>
    <div class="overflow-x-auto mb-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">DDS Vendor</th>
                    <th class="p-3">RMW Package</th>
                    <th class="p-3">License</th>
                    <th class="p-3">Drone Recommendation</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-sky-400 text-xs font-mono">Eclipse CycloneDDS</td><td class="p-3 text-slate-300 text-xs font-mono">rmw_cyclonedds_cpp</td><td class="p-3 text-slate-300 text-xs">Eclipse (Apache 2.0)</td><td class="p-3 text-emerald-400 text-xs">Recommended for companion computer — lowest latency, simplest multicast-off config, preferred by PX4 team</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-sky-400 text-xs font-mono">eProsima FastDDS</td><td class="p-3 text-slate-300 text-xs font-mono">rmw_fastrtps_cpp</td><td class="p-3 text-slate-300 text-xs">Apache 2.0</td><td class="p-3 text-amber-400 text-xs">Default in ROS 2; good throughput for large messages; XML profiles more complex; used by uXRCE-DDS client</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-sky-400 text-xs font-mono">RTI Connext DDS</td><td class="p-3 text-slate-300 text-xs font-mono">rmw_connextdds</td><td class="p-3 text-slate-300 text-xs">Commercial</td><td class="p-3 text-slate-400 text-xs">DoD/MOSA compliant programs requiring DDS-Security certification; best for multi-vehicle encrypted mesh</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-sky-400 text-xs font-mono">Micro XRCE-DDS</td><td class="p-3 text-slate-300 text-xs font-mono">(MCU agent only)</td><td class="p-3 text-slate-300 text-xs">Apache 2.0</td><td class="p-3 text-sky-400 text-xs">Used exclusively for PX4 flight controller ↔ companion bridge; not a full DDS stack</td></tr>
            </tbody>
        </table>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">QoS Profiles for Drone Sensor Data</h4>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-emerald-800">
            <strong class="text-emerald-400 block mb-2">SensorDataQoS</strong>
            <p class="text-slate-400">Reliability: Best Effort | Durability: Volatile | History: Keep Last (5)</p>
            <p class="text-slate-300 mt-2">Camera, IMU, LiDAR. Drops stale frames. Never blocks waiting for retransmit. Use for any sensor stream where timeliness &gt; completeness.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-sky-800">
            <strong class="text-sky-400 block mb-2">ReliableQoS / SystemDefaultsQoS</strong>
            <p class="text-slate-400">Reliability: Reliable | Durability: Volatile | History: Keep Last (10)</p>
            <p class="text-slate-300 mt-2">Mission commands, waypoints, parameter updates. Every message must arrive. Acceptable for low-frequency control commands (&lt;10 Hz).</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-amber-800">
            <strong class="text-amber-400 block mb-2">TransientLocal (Latched)</strong>
            <p class="text-slate-400">Reliability: Reliable | Durability: Transient Local | History: Keep Last (1)</p>
            <p class="text-slate-300 mt-2">Map frames, static transforms, mission parameters. New subscribers receive the last value immediately on connection — critical for /tf_static.</p>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">Executors in ROS 2 — Choosing for Drone Workloads</h4>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">SingleThreadedExecutor</strong>
            <p class="text-slate-300 mb-2">One thread. Callbacks serialized. Simple, deterministic. No data races.</p>
            <p class="text-amber-400">Use for: mission logic nodes that must not run concurrently. Not for sensor callbacks — a slow callback blocks all others.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">MultiThreadedExecutor</strong>
            <p class="text-slate-300 mb-2">Thread pool (specify num_threads). Callbacks run in parallel. Requires mutexes for shared state.</p>
            <p class="text-amber-400">Use for: multiple independent sensor pipelines (camera + LiDAR + IMU) on separate callback groups.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-purple-400 block mb-2">StaticSingleThreadedExecutor</strong>
            <p class="text-slate-300 mb-2">Pre-computes wait set at construction. Zero dynamic memory allocation per spin cycle.</p>
            <p class="text-amber-400">Use for: PREEMPT_RT paths. Critical for real-time flight control nodes where malloc in the hot path causes latency spikes.</p>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">C++ · ROS 2 Jazzy/Humble — Callback Groups + MultiThreadedExecutor for drone sensor pipeline</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand"><summary>C++ Code Example</summary>
<pre><code class="language-cpp">#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/image.hpp"
#include "sensor_msgs/msg/imu.hpp"

class DronePerceptionNode : public rclcpp::Node {
public:
    DronePerceptionNode() : Node("drone_perception") {
        // Mutually exclusive: camera callbacks do not preempt each other
        camera_cbg_ = this->create_callback_group(
            rclcpp::CallbackGroupType::MutuallyExclusive);
        // Reentrant: IMU callbacks can overlap (stateless processing)
        imu_cbg_ = this->create_callback_group(
            rclcpp::CallbackGroupType::Reentrant);

        rclcpp::SubscriptionOptions cam_opts, imu_opts;
        cam_opts.callback_group = camera_cbg_;
        imu_opts.callback_group = imu_cbg_;

        // SensorDataQoS: Best Effort, Volatile, depth=5
        // Matches PX4 uXRCE-DDS publisher QoS profile
        auto sensor_qos = rclcpp::SensorDataQoS();

        cam_sub_ = this->create_subscription&lt;sensor_msgs::msg::Image&gt;(
            "/camera/image_raw", sensor_qos,
            std::bind(&DronePerceptionNode::onCamera, this, std::placeholders::_1),
            cam_opts);

        imu_sub_ = this->create_subscription&lt;sensor_msgs::msg::Imu&gt;(
            "/fmu/out/sensor_combined_converted", sensor_qos,
            std::bind(&DronePerceptionNode::onIMU, this, std::placeholders::_1),
            imu_opts);
    }
private:
    void onCamera(const sensor_msgs::msg::Image::SharedPtr msg) { /* TRT inference */ }
    void onIMU(const sensor_msgs::msg::Imu::SharedPtr msg)      { /* EKF update    */ }

    rclcpp::CallbackGroup::SharedPtr camera_cbg_, imu_cbg_;
    rclcpp::Subscription&lt;sensor_msgs::msg::Image&gt;::SharedPtr cam_sub_;
    rclcpp::Subscription&lt;sensor_msgs::msg::Imu&gt;::SharedPtr imu_sub_;
};

int main(int argc, char** argv) {
    rclcpp::init(argc, argv);
    auto node = std::make_shared&lt;DronePerceptionNode&gt;();
    rclcpp::executors::MultiThreadedExecutor executor(rclcpp::ExecutorOptions(), 4);
    executor.add_node(node);
    executor.spin();
    rclcpp::shutdown();
}</code></pre>
</details>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">SROS2 — Securing the ROS 2 Graph (DoD/MOSA)</h4>
    <p>SROS2 applies the DDS-Security specification to ROS 2, providing authentication, access control, and AES-GCM encryption at the DDS layer. This is relevant for any classified or sensitive autonomous UAS program — unauthorized nodes on the DDS domain cannot inject commands or eavesdrop on sensor data.</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">Authentication</strong>
            <p class="text-slate-300">PKI-based mutual TLS. Each node holds a signed certificate. Nodes without a valid cert are refused by the DDS discovery protocol before any topic data is exchanged.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">Access Control</strong>
            <p class="text-slate-300">XML governance + permissions files. Specify which nodes may publish/subscribe to which topics. A compromised perception node cannot publish to /fmu/in/vehicle_command.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2">Encryption</strong>
            <p class="text-slate-300">AES-256-GCM payload encryption. Prevents RF sniffer attacks on shared network segments. Performance overhead: ~5–12% latency on 1080p camera topics — acceptable for GCS links.</p>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.4 NVIDIA Isaac ROS 3.x — GEMs for Aerial Robotics (2024–2025)</h3>
    <p>Isaac ROS 3.x is NVIDIA's collection of GPU-accelerated ROS 2 packages (called GEMs — GPU-accelerated Efficient Modules). The 3.x series targets JetPack 6.x (Orin, Ubuntu 22.04, ROS 2 Humble). The central innovation is <strong>NITROS</strong> — a zero-copy GPU memory transport layer that eliminates the CPU-bound DDS serialization bottleneck for camera and tensor data.</p>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-6">
        <h3 class="text-sky-400 font-bold text-lg mb-3">NITROS — Isaac Transport for ROS</h3>
        <p class="text-slate-300 text-sm mb-3">Standard ROS 2 message passing serializes data to a byte buffer, copies it through DDS, and deserializes on the subscriber side. For a 1080p camera frame (6.2 MB) this means 12.4 MB of memory traffic plus CPU time on every frame. NITROS eliminates this via ROS 2 Type Adaptation (REP-2007) and Type Negotiation (REP-2009):</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div class="bg-slate-900 p-4 rounded border border-emerald-800/60">
                <strong class="text-emerald-400 block mb-2">NITROS Zero-Copy Path</strong>
                <ol class="space-y-1 text-slate-300">
                    <li><span class="text-sky-400">1.</span> Camera node publishes NitrosImage (GPU pointer + metadata)</li>
                    <li><span class="text-sky-400">2.</span> Type negotiation confirms both nodes share CUDA context</li>
                    <li><span class="text-sky-400">3.</span> Subscriber receives GPU pointer directly — zero copy, zero serialize</li>
                    <li><span class="text-sky-400">4.</span> TRT inference node reads from same CUDA device buffer</li>
                </ol>
                <p class="text-emerald-400 mt-2">Result: 1080p frame passes camera → inference in &lt;0.1ms vs ~8ms standard ROS 2</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-2">NITROS Type Mapping</strong>
                <table class="w-full text-xs text-slate-300">
                    <thead><tr class="text-slate-400"><th class="text-left pb-1">NITROS Type</th><th class="text-left pb-1">ROS 2 Equivalent</th></tr></thead>
                    <tbody>
                        <tr><td>NitrosImage</td><td class="text-slate-400">sensor_msgs/Image</td></tr>
                        <tr><td>NitrosTensorList</td><td class="text-slate-400">isaac_ros_tensor_list_interfaces/TensorList</td></tr>
                        <tr><td>NitrosPointCloud</td><td class="text-slate-400">sensor_msgs/PointCloud2</td></tr>
                        <tr><td>NitrosDetection2DArray</td><td class="text-slate-400">vision_msgs/Detection2DArray</td></tr>
                        <tr><td>NitrosOdometry</td><td class="text-slate-400">nav_msgs/Odometry</td></tr>
                        <tr><td>NitrosCameraInfo</td><td class="text-slate-400">sensor_msgs/CameraInfo</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">Isaac ROS GEMs Catalog (2024–2025)</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-1">isaac_ros_visual_slam (cuVSLAM 11)</strong>
            <p class="text-slate-300">GPU-accelerated stereo VIO + loop closure. Supports up to 32 cameras (16 stereo pairs). Track call time: 0.4ms desktop / 1.8ms Jetson AGX Orin at 640×480 60 FPS. Only 5.5% CPU, 1.7% GPU utilization. Lowest translation error on KITTI among real-time systems. Supports RGBD and multi-cam SLAM localization.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-1">isaac_ros_object_detection</strong>
            <p class="text-slate-300">TensorRT-backed inference node. Drop in YOLO26 .engine file via model_file_path parameter. Node handles NitrosImage → pre-process → TRT infer → Detection2DArray publish. Supports YOLOv8, RT-DETR, DetectNet, and Grounding DINO (language-guided detection).</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-1">isaac_ros_nvblox</strong>
            <p class="text-slate-300">GPU 3D scene reconstruction using TSDF + semantic fusion. Builds real-time voxel maps from depth + color streams. Feeds directly into Nav2 global costmap for obstacle avoidance. Supports dynamic object removal and human segmentation for safety.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-1">isaac_ros_ess (Efficient Stereo Stereo)</strong>
            <p class="text-slate-300">DNN-based stereo depth estimation optimized for Jetson. Produces dense depth maps at 60+ FPS. Outperforms classical SGM on textureless surfaces — critical for indoor GPS-denied navigation and obstacle detection.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-purple-400 block mb-1">isaac_ros_cumotion + MoveIt 2</strong>
            <p class="text-slate-300">GPU-parallelized motion planning. cuMotion solves trajectory planning on GPU, bypassing MoveIt's CPU-bound sampling. Primarily for manipulation but extensible to gimbal/arm drones. &lt;50ms planning for 6-DOF arms vs ~500ms CPU.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-1">PyNITROS (added 3.2)</strong>
            <p class="text-slate-300">Python API for CUDA with NITROS support. Wraps PyTorch tensors. Allows Python ROS 2 nodes to participate in zero-copy GPU pipelines without writing C++ NitrosNode subclasses. Critical for rapid prototyping of ML-based perception nodes.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-red-400 block mb-1">isaac_ros_freespace_segmentation</strong>
            <p class="text-slate-300">Hardware-accelerated vision-AI based occupancy grid generation. Produces bird's-eye-view freespace maps directly from camera images. Used with nvblox for combined 2D+3D obstacle awareness in Nav2.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-1">Mission Dispatch + Client (3.2)</strong>
            <p class="text-slate-300">Open-source fleet management task assignment and monitoring. REST API for uploading missions. Drone clients poll for tasks, execute, and report status back. Pairs with VDA 5050 robot interface standard.</p>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Bash · Isaac ROS 3.x — Launch on Jetson Orin (JetPack 6.2, ROS 2 Humble)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand"><summary>Shell Code Example</summary>
<pre><code class="language-bash"># Isaac ROS 3.x requires JetPack 6.0+ (L4T 36.x, CUDA 12.2+)
# Recommended: use the Isaac ROS Docker container

docker pull nvcr.io/nvidia/isaac/ros:aarch64-ros2_humble_3.2.0

docker run --rm -it \
    --runtime nvidia \
    --network host \
    -v /dev:/dev \
    nvcr.io/nvidia/isaac/ros:aarch64-ros2_humble_3.2.0 bash

# Inside container: launch cuVSLAM with stereo camera + IMU fusion
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam.launch.py \
    enable_image_denoising:=false \
    rectified_images:=true \
    enable_imu_fusion:=true \
    imu_frame:=imu_link \
    gyro_noise_density:=0.000244 \
    accel_noise_density:=0.001862

# Launch YOLO26 object detection with NITROS zero-copy pipeline
ros2 launch isaac_ros_yolov8 isaac_ros_yolov8_visualize.launch.py \
    model_file_path:=/workspaces/yolo11s_int8.engine \
    input_binding_names:=['images'] \
    output_binding_names:=['output0'] \
    network_image_width:=640 network_image_height:=640</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.5 micro-ROS — ROS 2 on Flight Controller MCUs</h3>
    <p>micro-ROS brings the ROS 2 API directly to microcontrollers — enabling the flight controller MCU itself to be a first-class ROS 2 node rather than a translated endpoint. It bridges the gap between resource-constrained embedded systems and the ROS 2 graph via Micro XRCE-DDS.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">Supported RTOSes</strong>
            <ul class="space-y-1 text-slate-300">
                <li><span class="text-sky-400">FreeRTOS</span> — most common; used on STM32-based boards</li>
                <li><span class="text-sky-400">NuttX</span> — used by PX4 on Pixhawk hardware</li>
                <li><span class="text-sky-400">Zephyr</span> — Nordic Semiconductor, low-power MCUs</li>
                <li><span class="text-sky-400">Linux</span> — bare Linux also supported (RPi Pico W, etc.)</li>
            </ul>
            <strong class="text-emerald-400 block mt-3 mb-1">Key Hardware (2024–2025)</strong>
            <ul class="space-y-1 text-slate-300">
                <li>STM32H7 series (Pixhawk 6C hardware)</li>
                <li>Raspberry Pi Pico / Pico W (RP2040)</li>
                <li>ESP32 family (FreeRTOS)</li>
                <li>Nordic nRF52840 (Zephyr)</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">Architecture: Client + Agent</strong>
            <p class="text-slate-300 mb-2">micro-ROS runs a lightweight XRCE-DDS <strong>client</strong> on the MCU and a full <strong>agent</strong> on the companion computer. The agent acts as a DDS proxy, converting XRCE-DDS serial frames into standard DDS participants visible to the rest of the ROS 2 graph.</p>
            <div class="bg-slate-800 p-3 rounded text-slate-400 text-[11px]">
                MCU (FreeRTOS/NuttX)<br/>
                └─ micro-ROS client<br/>
                &nbsp;&nbsp;&nbsp;└─ XRCE-DDS (serial/UDP)<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ micro-ROS Agent<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ CycloneDDS/FastDDS<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ ROS 2 Graph
            </div>
            <p class="text-amber-400 mt-2 text-[11px]">Contrast with PX4 uXRCE-DDS: PX4 uses the same Micro XRCE-DDS transport but implements its own client atop NuttX — not the micro-ROS client library. They share protocol but not code.</p>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">C · micro-ROS on FreeRTOS — publish IMU data as ROS 2 topic</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand"><summary>C Code Example</summary>
<pre><code class="language-c">#include &lt;micro_ros_arduino.h&gt;
#include &lt;rcl/rcl.h&gt;
#include &lt;rclc/rclc.h&gt;
#include &lt;rclc/executor.h&gt;
#include &lt;sensor_msgs/msg/imu.h&gt;

rcl_publisher_t imu_publisher;
sensor_msgs__msg__Imu imu_msg;
rclc_executor_t executor;
rclc_support_t support;
rcl_allocator_t allocator;
rcl_node_t node;
rcl_timer_t timer;

void timer_callback(rcl_timer_t * timer, int64_t last_call_time) {
    // Read IMU (MPU6050, ICM-42688, etc.)
    read_imu(&imu_msg.linear_acceleration.x,
             &imu_msg.linear_acceleration.y,
             &imu_msg.linear_acceleration.z);
    imu_msg.header.stamp.sec = millis() / 1000;
    rcl_publish(&imu_publisher, &imu_msg, NULL);
}

void setup() {
    // Connect to micro-ROS Agent on companion computer via serial
    set_microros_serial_transports(Serial);

    allocator = rcl_get_default_allocator();
    rclc_support_init(&support, 0, NULL, &allocator);
    rclc_node_init_default(&node, "imu_node", "drone", &support);

    rclc_publisher_init_best_effort(
        &imu_publisher, &node,
        ROSIDL_GET_MSG_TYPE_SUPPORT(sensor_msgs, msg, Imu),
        "/imu/data_raw");

    rclc_timer_init_default(&timer, &support, RCL_MS_TO_NS(4), timer_callback); // 250 Hz
    rclc_executor_init(&executor, &support.context, 1, &allocator);
    rclc_executor_add_timer(&executor, &timer);
}

void loop() {
    rclc_executor_spin_some(&executor, RCL_MS_TO_NS(1));
}</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.6 Behavior Trees vs. State Machines — Mission Logic Architecture</h3>
    <p>Autonomous drone missions require decision-making logic that handles normal operations, failures, edge cases, and dynamic re-planning. Two dominant paradigms exist: Finite State Machines (FSMs) and Behavior Trees (BTs). Choosing incorrectly results in unmaintainable spaghetti logic or unexpected behavioral emergences at runtime.</p>

    <div class="overflow-x-auto mb-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Property</th>
                    <th class="p-3">Finite State Machine (FSM)</th>
                    <th class="p-3">Behavior Tree (BT.cpp 4.x)</th>
                    <th class="p-3">Hybrid (recommended)</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-slate-300 text-xs">Mental model</td><td class="p-3 text-slate-400 text-xs">States + transitions. Entire mission is one graph</td><td class="p-3 text-slate-400 text-xs">Hierarchical tree of conditions and actions ticked at ~30 Hz</td><td class="p-3 text-sky-400 text-xs">FSM for top-level modes (Preflight/Mission/RTL), BT for sub-mission logic</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-slate-300 text-xs">Reusability</td><td class="p-3 text-red-400 text-xs">Low — states embed transitions, hard to extract</td><td class="p-3 text-emerald-400 text-xs">High — sub-trees are composable, re-used across missions</td><td class="p-3 text-slate-400 text-xs">Sub-trees reused across mission modes</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-slate-300 text-xs">Concurrency</td><td class="p-3 text-amber-400 text-xs">Awkward — parallel states require AND-states or explicit flags</td><td class="p-3 text-emerald-400 text-xs">Native — Parallel node ticks multiple children simultaneously</td><td class="p-3 text-slate-400 text-xs">BT handles concurrent sensor monitoring + action execution</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-slate-300 text-xs">Failure recovery</td><td class="p-3 text-amber-400 text-xs">Explicit error transitions per state — O(n²) transitions</td><td class="p-3 text-emerald-400 text-xs">Fallback node automatically tries alternatives on FAILURE return</td><td class="p-3 text-slate-400 text-xs">BT Fallback handles sensor failures, replanning, RTL</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-slate-300 text-xs">Runtime editing</td><td class="p-3 text-red-400 text-xs">Requires recompile for structural changes</td><td class="p-3 text-emerald-400 text-xs">XML tree loaded at runtime — swap missions without recompile</td><td class="p-3 text-slate-400 text-xs">Ground station can push new BT XML during pre-flight</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-slate-300 text-xs">Tooling (2025)</td><td class="p-3 text-slate-400 text-xs">SMACH (Python), SMACC2 (C++ async)</td><td class="p-3 text-emerald-400 text-xs">BT.cpp 4.9, Groot2 visualizer, Nav2 BT server</td><td class="p-3 text-slate-400 text-xs">Nav2 uses BT.cpp 4.x internally</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-slate-300 text-xs">DoD adoption</td><td class="p-3 text-slate-400 text-xs">Legacy programs, simple go/no-go logic</td><td class="p-3 text-emerald-400 text-xs">Growing — DARPA RACER, ROS 2 Nav2, Aerostack2</td><td class="p-3 text-slate-400 text-xs">Most production-grade sUAS programs (2024–2025)</td></tr>
            </tbody>
        </table>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">XML · BehaviorTree.CPP 4.x — Search-and-inspect mission tree with failure fallback</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand"><summary>XML / C++ Code Example</summary>
<pre><code class="language-xml">&lt;!-- mission.xml: loaded at runtime, swappable without recompile --&gt;
&lt;root BTCPP_format="4"&gt;
  &lt;BehaviorTree ID="SearchInspect"&gt;
    &lt;Sequence name="main_mission"&gt;
      &lt;!-- Pre-flight: all must succeed --&gt;
      &lt;Action ID="CheckBattery"    min_voltage="14.8"/&gt;
      &lt;Action ID="WaitForGPSLock"  min_sats="8"/&gt;
      &lt;Action ID="ArmAndTakeoff"   alt_m="20"/&gt;

      &lt;!-- Search phase: try visual first, fallback to grid search --&gt;
      &lt;Fallback name="find_target"&gt;
        &lt;Sequence&gt;
          &lt;Condition ID="TargetVisible"  confidence="0.85"/&gt;
          &lt;Action    ID="FlyToTarget"/&gt;
        &lt;/Sequence&gt;
        &lt;Action ID="GridSearch" rows="4" cols="4" spacing_m="20"/&gt;
      &lt;/Fallback&gt;

      &lt;!-- Inspect: run camera capture concurrent with hover --&gt;
      &lt;Parallel success_count="2" failure_count="1"&gt;
        &lt;Action ID="HoverAtAlt"    alt_m="10"/&gt;
        &lt;Action ID="CapturePhotos" count="12" interval_s="2"/&gt;
      &lt;/Parallel&gt;

      &lt;!-- RTL always happens, even if inspect sub-tree failed --&gt;
      &lt;Action ID="ReturnToLaunch"/&gt;
    &lt;/Sequence&gt;
  &lt;/BehaviorTree&gt;
&lt;/root&gt;</code></pre>

<pre><code class="language-cpp">// C++ registration of custom action nodes (BT.cpp 4.x)
#include "behaviortree_cpp/bt_factory.h"
#include "rclcpp/rclcpp.hpp"
#include "mavsdk/mavsdk.h"

class ArmAndTakeoff : public BT::StatefulActionNode {
public:
    ArmAndTakeoff(const std::string& name, const BT::NodeConfig& config)
        : BT::StatefulActionNode(name, config) {}

    static BT::PortsList providedPorts() {
        return { BT::InputPort&lt;float&gt;("alt_m") };
    }

    BT::NodeStatus onStart() override {
        float alt = getInput&lt;float&gt;("alt_m").value();
        // Trigger async arm + takeoff via MAVSDK
        auto result = drone_->action().arm();
        drone_->action().takeoff();
        return BT::NodeStatus::RUNNING;
    }

    BT::NodeStatus onRunning() override {
        // Check altitude reached asynchronously
        if (altitude_reached()) return BT::NodeStatus::SUCCESS;
        if (timeout_exceeded()) return BT::NodeStatus::FAILURE;
        return BT::NodeStatus::RUNNING;
    }
    void onHalted() override { drone_->action().land(); }
private:
    std::shared_ptr&lt;mavsdk::System&gt; drone_;
    bool altitude_reached() { /* poll telemetry */ return false; }
    bool timeout_exceeded() { return false; }
};

int main() {
    BT::BehaviorTreeFactory factory;
    factory.registerNodeType&lt;ArmAndTakeoff&gt;("ArmAndTakeoff");
    // ... register other nodes
    auto tree = factory.createTreeFromFile("mission.xml");
    tree.tickWhileRunning();
}</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.7 Nav2 — ROS 2 Navigation Stack (2025)</h3>
    <p>Nav2 is the industry-standard autonomous navigation framework for ground robots and increasingly for low-altitude drones operating in semi-structured environments. Nav2 is modular — each component is a ROS 2 lifecycle node with a pluggable algorithm backend. It is used by 100+ companies in production and forms the navigation backbone of Isaac ROS nvblox-based systems.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">Core Nav2 Components</strong>
            <ul class="space-y-2 text-slate-300">
                <li><span class="text-sky-400">BT Navigator</span> — Behavior Tree executor driving the navigation state machine (BT.cpp 4.x)</li>
                <li><span class="text-sky-400">Controller Server</span> — Local trajectory following. Plugins: DWB, RPP (Regulated Pure Pursuit), MPPI (Model Predictive Path Integral)</li>
                <li><span class="text-sky-400">Planner Server</span> — Global path planning. Plugins: NavFn (Dijkstra/A*), Smac Planner (hybrid-A*, SE2)</li>
                <li><span class="text-sky-400">Costmap 2D</span> — Multi-layer 2D obstacle map. nvblox feeds its occupancy grid directly into this layer</li>
                <li><span class="text-sky-400">AMCL</span> — Adaptive Monte Carlo Localization (2D LIDAR); replaceable with cuVSLAM output</li>
                <li><span class="text-sky-400">Waypoint Follower</span> — Multi-waypoint mission execution with pluggable task executors at each waypoint</li>
                <li><span class="text-sky-400">Collision Monitor</span> — Safety layer that overrides velocity commands when obstacles enter proximity zones</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">MPPI Controller — Why It Matters for Drones</strong>
            <p class="text-slate-300 mb-2">Model Predictive Path Integral (MPPI) was added to Nav2 in 2023 and is now the recommended controller for dynamic environments. It samples thousands of trajectory rollouts on CPU/GPU, weights them by cost, and selects an optimal control. For drones operating near obstacles:</p>
            <ul class="space-y-1 text-slate-300">
                <li>+ Naturally handles non-holonomic and dynamic constraints</li>
                <li>+ Considers full trajectory cost (not just next step)</li>
                <li>+ GPU-parallelizable (1000+ rollouts in &lt;10ms on Jetson)</li>
                <li>+ Better narrow-corridor performance than DWB</li>
            </ul>
            <p class="text-amber-400 mt-2">DWB remains the default for backwards compatibility — switch to MPPI for new programs in complex environments.</p>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">YAML · Nav2 configuration snippet — MPPI controller + nvblox costmap layer</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand"><summary>YAML Code Example</summary>
<pre><code class="language-yaml">controller_server:
  ros__parameters:
    controller_frequency: 20.0
    controller_plugins: ["FollowPath"]
    FollowPath:
      plugin: "nav2_mppi_controller::MPPIController"
      time_steps: 56           # Prediction horizon steps
      model_dt: 0.05           # 50ms per step = 2.8s horizon
      batch_size: 2000         # Trajectory rollout samples
      vx_max: 3.0              # Max forward velocity (m/s) — reduce for indoor
      vx_min: -0.5
      vy_max: 2.0              # Lateral velocity for holonomic platforms
      wz_max: 1.9
      temperature: 0.3         # Sampling temperature: lower = more deterministic
      gamma: 0.015
      motion_model: "Ackermann"  # or "Omni" for multirotor

local_costmap:
  local_costmap:
    ros__parameters:
      plugins: ["nvblox_layer", "inflation_layer"]
      nvblox_layer:
        plugin: "nvblox::nav2::NvbloxCostmapLayer"  # Isaac ROS nvblox integration
        enabled: True
        max_obstacle_height: 2.0
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        inflation_radius: 0.55  # Drone body radius + safety margin</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.8 Video: ROS 2 Software Architecture for Robotics</h3>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Stop Writing Random ROS 2 Nodes | Real Software Architecture</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/EZpypEAM9ew" title="Stop Writing Random ROS 2 Nodes | Real Software Architecture" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-sm mt-3">How real ROS 2 software architecture is structured in production robotics systems — component design, node organization, and avoiding common mistakes. Directly applicable to drone software stacks.</p>
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">ROS2 Industrial Deployment: Hardware &amp; Software Architecture with Jetson</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/N-pbc8WWJqQ" title="ROS2 Industrial Deployment: Hardware and Software Architecture with RealSense, Jetson, Robot and PLC" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-sm mt-3">End-to-end hardware and software architecture of a real ROS 2 vision-guided robotic application using Intel RealSense and NVIDIA Jetson — the same component combination used in many autonomous drone companion computer stacks.</p>
    </div>

    <!-- ============================================================ -->
    <h3>7.9 PX4 Autopilot v1.15 Software Stack</h3>
    <p>PX4 v1.15 (released late 2024) is the current stable release for production drone programs. It runs on NuttX RTOS on the flight controller MCU and communicates with the companion computer via uXRCE-DDS. Understanding this stack is prerequisite knowledge for any autonomous drone program.</p>

    <figure class="my-6">
        <img src="images/m7_px4_uxrce_dds.svg" alt="PX4 uXRCE-DDS architecture: XRCE-DDS client on flight controller communicates to agent on companion computer, bridging to ROS 2 graph via DDS" class="rounded-lg w-full bg-white p-2">
        <figcaption class="text-gray-400 text-sm text-center mt-2">PX4 v1.15 uXRCE-DDS bridge: the XRCE-DDS client on the Pixhawk MCU connects to the micro-XRCE-DDS Agent on the companion computer, making uORB topics natively visible as ROS 2 topics. Source: <a href="https://docs.px4.io/main/en/middleware/uxrce_dds" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">PX4 Documentation</a></figcaption>
    </figure>

    <h4 class="text-sky-400 mt-4 mb-2">uORB — The Internal Message Bus</h4>
    <p>uORB (Micro Object Request Broker) is PX4's publish-subscribe IPC system running inside NuttX. Every sensor reading, estimator output, setpoint, and actuator command is a uORB message. There is no network; it is shared memory with a priority-based scheduler. Over 300 message types exist in the PX4 source tree, each defined in a <code>.msg</code> file under <code>msg/</code>.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">C++ · PX4 NuttX module — uORB publish/subscribe pattern</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand"><summary>C++ Code Example</summary>
<pre><code class="language-cpp">#include &lt;uORB/uORB.h&gt;
#include &lt;uORB/topics/sensor_accel.h&gt;
#include &lt;uORB/topics/vehicle_acceleration.h&gt;
#include &lt;px4_platform_common/px4_work_queue/ScheduledWorkItem.hpp&gt;

class AccelFusionTask : public px4::ScheduledWorkItem {
public:
    AccelFusionTask() : ScheduledWorkItem(MODULE_NAME, px4::wq_configurations::nav_and_controllers) {}

    bool init() {
        _sensor_sub.registerCallback();
        return true;
    }

private:
    void Run() override {
        sensor_accel_s accel;
        if (_sensor_sub.update(&accel)) {
            vehicle_acceleration_s out{};
            out.timestamp = accel.timestamp;
            out.xyz[0] = accel.x;
            out.xyz[1] = accel.y;
            out.xyz[2] = accel.z;
            _accel_pub.publish(out);
        }
    }

    uORB::SubscriptionCallbackWorkItem _sensor_sub{this, ORB_ID(sensor_accel)};
    uORB::Publication&lt;vehicle_acceleration_s&gt; _accel_pub{ORB_ID(vehicle_acceleration)};
};</code></pre>
</details>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">uXRCE-DDS — Bridging PX4 to ROS 2 (v1.15)</h4>
    <p>uXRCE-DDS replaces the older FastRTPS bridge and MAVROS for modern PX4 systems. A lightweight XRCE-DDS client runs on the flight controller MCU; a full DDS agent runs on the companion computer. Selected uORB topics appear as native ROS 2 topics in the <code>/fmu/out/</code> namespace — no translation, no MAVROS translator node required.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">Topic Namespace Convention</strong>
            <ul class="space-y-1 text-slate-300">
                <li><span class="text-sky-400">/fmu/out/vehicle_odometry</span> — PX4 EKF2 pose estimate</li>
                <li><span class="text-sky-400">/fmu/out/vehicle_status</span> — arm state, flight mode</li>
                <li><span class="text-sky-400">/fmu/out/sensor_combined</span> — IMU at 250 Hz</li>
                <li><span class="text-sky-400">/fmu/in/trajectory_setpoint</span> — NED position/velocity target</li>
                <li><span class="text-sky-400">/fmu/in/offboard_control_mode</span> — declare offboard intent</li>
                <li><span class="text-sky-400">/fmu/in/vehicle_command</span> — MAV_CMD_* arbiter</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2">v1.15 Change: subscription_multi</strong>
            <p class="text-slate-300">New in v1.15: ROS 2 nodes can write to a separate uORB topic instance via <code>subscription_multi</code> in <code>dds_topics.yaml</code>. PX4 differentiates companion computer commands from internal publishers — preventing overwrite conflicts in multi-source estimator setups (e.g., external VIO feeding EKF2 alongside internal IMU).</p>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Bash · PX4 v1.15 — Start uXRCE-DDS agent + SITL with Gazebo Harmonic</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand"><summary>Shell Code Example</summary>
<pre><code class="language-bash"># Install Micro-XRCE-DDS Agent
pip install --user -U micro-xrce-dds-agent

# UDP connection (SITL or companion + Ethernet to FMU):
MicroXRCEAgent udp4 -p 8888

# Serial connection (UART from companion to Pixhawk):
MicroXRCEAgent serial --dev /dev/ttyUSB0 -b 921600

# On flight controller console (PX4 NuttX shell):
uxrce_dds_client start -t udp -p 8888 -h 192.168.0.10 -n drone1

# Verify topics in ROS 2:
ros2 topic list | grep /fmu
ros2 topic hz /fmu/out/sensor_combined  # expect ~250 Hz

# PX4 v1.15: Gazebo Harmonic is the default simulator (jMAVSim retired)
# Requires Ubuntu 22.04, Gazebo Harmonic
git clone https://github.com/PX4/PX4-Autopilot.git --recursive
cd PX4-Autopilot
bash ./Tools/setup/ubuntu.sh

# SITL with x500 quadcopter + ROS 2 bridge
make px4_sitl gz_x500 ros2

# Headless for CI/CD pipelines
HEADLESS=1 make px4_sitl gz_x500</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.10 MAVLink 2.0, MAVSDK, and Ground Control Stations</h3>
    <p>MAVLink 2.0 is the wire protocol between flight controllers, ground stations, and companion computers. MAVSDK is the modern high-level SDK that replaces direct pymavlink usage for most autonomous mission scenarios. DroneKit (Python) is deprecated as of 2024 and should not be used in new programs.</p>

    <h4 class="text-sky-400 mt-4 mb-2">MAVLink 2.0 Packet Format</h4>
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-5 mb-6 text-xs font-mono">
        <div class="flex flex-wrap gap-2 items-center text-center">
            <div class="bg-red-900/50 border border-red-700 rounded px-3 py-2 text-red-300"><div class="text-[10px] text-slate-400 mb-1">Byte 0</div>STX<br/>0xFD</div>
            <div class="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-300"><div class="text-[10px] text-slate-400 mb-1">Byte 1</div>LEN<br/>(0–253)</div>
            <div class="bg-amber-900/50 border border-amber-700 rounded px-3 py-2 text-amber-300"><div class="text-[10px] text-slate-400 mb-1">Byte 2</div>INCOMPAT<br/>FLAGS</div>
            <div class="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-300"><div class="text-[10px] text-slate-400 mb-1">Byte 3</div>COMPAT<br/>FLAGS</div>
            <div class="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-300"><div class="text-[10px] text-slate-400 mb-1">Byte 4</div>SEQ<br/>(0–255)</div>
            <div class="bg-sky-900/50 border border-sky-700 rounded px-3 py-2 text-sky-300"><div class="text-[10px] text-slate-400 mb-1">Byte 5</div>SYS_ID</div>
            <div class="bg-sky-900/50 border border-sky-700 rounded px-3 py-2 text-sky-300"><div class="text-[10px] text-slate-400 mb-1">Byte 6</div>COMP_ID</div>
            <div class="bg-purple-900/50 border border-purple-700 rounded px-3 py-2 text-purple-300"><div class="text-[10px] text-slate-400 mb-1">Bytes 7–9</div>MSG_ID<br/>(24-bit)</div>
            <div class="bg-emerald-900/50 border border-emerald-700 rounded px-3 py-2 text-emerald-300"><div class="text-[10px] text-slate-400 mb-1">Bytes 10–(9+n)</div>PAYLOAD<br/>(0–253 B)</div>
            <div class="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-300"><div class="text-[10px] text-slate-400 mb-1">2 Bytes</div>CRC</div>
            <div class="bg-amber-900/50 border border-amber-700 rounded px-3 py-2 text-amber-300 text-[11px]"><div class="text-[10px] text-slate-400 mb-1">13 Bytes (optional)</div>SIGNATURE</div>
        </div>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
            <div><strong class="text-amber-400">INCOMPAT FLAGS:</strong> 0x01 = packet is signed. Receivers that do not understand a set incompat flag MUST discard the packet.</div>
            <div><strong class="text-purple-400">24-bit MSG_ID:</strong> 16 million unique message IDs vs MAVLink 1's 256. Message extensions append after base payload — old receivers ignore them.</div>
            <div><strong class="text-emerald-400">Signing:</strong> link_id (8b) + timestamp_48b + first 48 bits of SHA-256(secret_key + header + payload + CRC). Prevents spoofing but not replay attacks.</div>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">MAVSDK vs DroneKit vs pymavlink</h4>
    <div class="overflow-x-auto mb-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Dimension</th>
                    <th class="p-3">MAVSDK (Python 3.x / C++ 2.x)</th>
                    <th class="p-3">pymavlink (direct)</th>
                    <th class="p-3">DroneKit-Python</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-slate-300 text-xs">Status (2025)</td><td class="p-3 text-emerald-400 text-xs">Active, semver, recommended</td><td class="p-3 text-amber-400 text-xs">Active, low-level, verbose</td><td class="p-3 text-red-400 text-xs">Deprecated — unmaintained since 2019, use MAVSDK instead</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-slate-300 text-xs">Async model</td><td class="p-3 text-emerald-400 text-xs">asyncio native (Python), async C++ futures</td><td class="p-3 text-amber-400 text-xs">Synchronous; manual recv loop</td><td class="p-3 text-red-400 text-xs">Blocking calls — bad for real-time</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-slate-300 text-xs">PX4 support</td><td class="p-3 text-emerald-400 text-xs">Primary target</td><td class="p-3 text-emerald-400 text-xs">Full (both PX4 and ArduPilot)</td><td class="p-3 text-amber-400 text-xs">ArduPilot primary, PX4 limited</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-slate-300 text-xs">Use case</td><td class="p-3 text-slate-300 text-xs">Mission automation, offboard control</td><td class="p-3 text-slate-300 text-xs">Custom MAVLink dialects, protocol testing</td><td class="p-3 text-slate-400 text-xs">Legacy ArduPilot code only</td></tr>
            </tbody>
        </table>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python · MAVSDK 3.x — Waypoint mission with health checks</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand"><summary>Python Code Example</summary>
<pre><code class="language-python">import asyncio
from mavsdk import System
from mavsdk.mission import MissionItem, MissionPlan

async def run_mission():
    drone = System()
    await drone.connect(system_address="udpin://0.0.0.0:14540")

    async for state in drone.core.connection_state():
        if state.is_connected:
            break

    async for health in drone.telemetry.health():
        if health.is_global_position_ok and health.is_home_position_ok:
            break

    mission_items = [
        MissionItem(
            latitude_deg=47.398039,  longitude_deg=8.545572,
            relative_altitude_m=25,  speed_m_s=10,
            is_fly_through=True,
            gimbal_pitch_deg=float('nan'), gimbal_yaw_deg=float('nan'),
            camera_action=MissionItem.CameraAction.NONE,
            loiter_time_s=float('nan'), camera_photo_interval_s=float('nan'),
            acceptance_radius_m=2.0,  yaw_deg=float('nan'),
            camera_photo_distance_m=float('nan'),
        ),
    ]

    await drone.mission.set_return_to_launch_after_mission(True)
    await drone.mission.upload_mission(MissionPlan(mission_items))
    await drone.action.arm()
    await drone.mission.start_mission()

    async for progress in drone.mission.mission_progress():
        print(f"Waypoint {progress.current}/{progress.total}")
        if progress.current == progress.total:
            break

asyncio.run(run_mission())</code></pre>
</details>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">Ground Control Station Comparison (2025)</h4>
    <div class="overflow-x-auto mb-8">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">GCS</th>
                    <th class="p-3">Platform</th>
                    <th class="p-3">Autopilot Support</th>
                    <th class="p-3">Best For</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-sky-400 text-xs font-bold">QGroundControl 4.x</td><td class="p-3 text-slate-300 text-xs">Win / Mac / Linux / Android / iOS</td><td class="p-3 text-emerald-400 text-xs">PX4 (primary), ArduPilot</td><td class="p-3 text-slate-300 text-xs">Cross-platform deployments, PX4 fleets. Modern UI, drag-drop mission planning. 60% of enterprise PX4 programs use QGC. Remote ID support built-in.</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-sky-400 text-xs font-bold">Mission Planner 1.3.x</td><td class="p-3 text-slate-300 text-xs">Windows only</td><td class="p-3 text-emerald-400 text-xs">ArduPilot (primary)</td><td class="p-3 text-slate-300 text-xs">Deep ArduPilot tuning, ADS-B overlay, battery-sag compensation. Dominates &gt;70% of ArduPilot fixed-wing programs. Advanced scripting via Lua.</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-sky-400 text-xs font-bold">UGCS (UgCS)</td><td class="p-3 text-slate-300 text-xs">Win / Mac / Linux</td><td class="p-3 text-slate-300 text-xs">PX4, ArduPilot, DJI</td><td class="p-3 text-slate-300 text-xs">Commercial survey/inspection. Terrain-following, corridor mapping, fleet management. Subscription model.</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-sky-400 text-xs font-bold">MAVProxy</td><td class="p-3 text-slate-300 text-xs">Linux / Mac</td><td class="p-3 text-slate-300 text-xs">ArduPilot, PX4</td><td class="p-3 text-slate-300 text-xs">MAVLink multiplexer + CLI GCS. Used as a proxy to split one MAVLink stream to multiple consumers (GCS + logger + companion). Essential for SITL testing.</td></tr>
            </tbody>
        </table>
    </div>

    <!-- ============================================================ -->
    <h3>7.11 Real-Time OS — Strategies for Deterministic Drone Control</h3>
    <p>A drone's companion computer runs a standard Linux kernel by default. The Linux CFS scheduler can preempt any thread at any time for a kernel softirq. On a 200 Hz control loop, a 5ms scheduler jitter causes a missed deadline. There are four strategies, ordered by latency guarantee and deployment complexity.</p>

    <div class="overflow-x-auto mb-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Approach</th>
                    <th class="p-3">Worst-Case Latency</th>
                    <th class="p-3">Complexity</th>
                    <th class="p-3">Drone Use Case</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-emerald-400 text-xs font-bold">NuttX RTOS (PX4 FMU)</td><td class="p-3 text-emerald-400 text-xs">&lt;10 µs</td><td class="p-3 text-slate-300 text-xs">Low (built into PX4)</td><td class="p-3 text-slate-300 text-xs">All flight control loops run here. POSIX-compliant. Priority-based preemption. Used by every PX4 program.</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-sky-400 text-xs font-bold">PREEMPT_RT Linux (Jetson)</td><td class="p-3 text-sky-400 text-xs">50–200 µs</td><td class="p-3 text-slate-300 text-xs">Medium (kernel swap)</td><td class="p-3 text-slate-300 text-xs">Companion computer real-time threads. NVIDIA provides PREEMPT_RT kernel for JetPack 6.x. Most production sUAS companion stacks use this.</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-amber-400 text-xs font-bold">Standard Linux + SCHED_FIFO</td><td class="p-3 text-amber-400 text-xs">500 µs – 5 ms</td><td class="p-3 text-slate-300 text-xs">Low (no kernel change)</td><td class="p-3 text-slate-300 text-xs">Set SCHED_FIFO priority 80+ on critical threads. Adequate for 50–100 Hz loops but not for 250+ Hz IMU callbacks.</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-purple-400 text-xs font-bold">Xenomai 3.x (dual-kernel)</td><td class="p-3 text-purple-400 text-xs">10–50 µs</td><td class="p-3 text-slate-300 text-xs">High (separate RT kernel)</td><td class="p-3 text-slate-300 text-xs">Hard-real-time Linux co-kernel. Lower latency than PREEMPT_RT but complex deployment. Rarely used in modern drone programs — PREEMPT_RT sufficient for most cases.</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-red-400 text-xs font-bold">FreeRTOS / Zephyr (MCU)</td><td class="p-3 text-red-400 text-xs">&lt;1 µs</td><td class="p-3 text-slate-300 text-xs">Low-Medium</td><td class="p-3 text-slate-300 text-xs">micro-ROS companion nodes, ESC telemetry, sensor bridges on STM32/nRF. Not for Linux companion computers.</td></tr>
            </tbody>
        </table>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Bash · PREEMPT_RT on Jetson Orin — install, verify, configure CPU isolation</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand"><summary>Shell Code Example</summary>
<pre><code class="language-bash"># Check RT kernel availability for your JetPack version
apt-cache search linux-image-rt

# Install PREEMPT_RT kernel (JetPack 6.x / L4T 36.x)
sudo apt-get install -y linux-image-rt-$(uname -r | cut -d'-' -f1)

# After reboot, verify:
uname -a                   # should contain "PREEMPT_RT"
cat /sys/kernel/realtime   # returns "1" on RT kernel

# Benchmark worst-case latency with cyclictest
sudo apt-get install -y rt-tests
sudo cyclictest -m -p 99 -i 200 -l 100000 --smp
# Target: Max &lt; 200µs on Orin AGX; &lt; 500µs on Orin Nano

# CPU isolation: dedicate cores 2-3 to RT drone control threads
# Add to /etc/default/grub:
# GRUB_CMDLINE_LINUX="isolcpus=2,3 nohz_full=2,3 rcu_nocbs=2,3"
sudo update-grub && sudo reboot

# Pin a ROS 2 node to isolated CPU with RT priority
taskset -c 2 chrt -f 80 ros2 run my_pkg control_node

# CycloneDDS RT configuration (export before launching nodes)
# export CYCLONEDDS_URI=file:///opt/drone/cyclonedds_rt.xml</code></pre>
</details>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">C++ · ROS 2 intra-process zero-copy + mlockall for real-time drone node</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand"><summary>C++ Code Example</summary>
<pre><code class="language-cpp">#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/image.hpp"
#include &lt;sys/mman.h&gt;   // mlockall
#include &lt;sched.h&gt;      // sched_setscheduler

void configure_realtime() {
    // Lock all current and future pages — prevents swap during flight
    if (mlockall(MCL_CURRENT | MCL_FUTURE) != 0) {
        perror("mlockall failed");
    }
    struct sched_param sp;
    sp.sched_priority = 80;
    if (sched_setscheduler(0, SCHED_FIFO, &sp) != 0) {
        perror("sched_setscheduler failed — need CAP_SYS_NICE or root");
    }
}

class ZeroCopyCameraNode : public rclcpp::Node {
public:
    ZeroCopyCameraNode() : Node("zero_copy_camera",
        rclcpp::NodeOptions().use_intra_process_comms(true))
    {
        pub_ = this->create_publisher&lt;sensor_msgs::msg::Image&gt;("/camera/raw", 5);
        timer_ = this->create_wall_timer(
            std::chrono::milliseconds(33),
            [this]() {
                auto msg = std::make_unique&lt;sensor_msgs::msg::Image&gt;();
                msg->header.stamp = this->now();
                msg->width = 640; msg->height = 480;
                msg->encoding = "rgb8";
                msg->data.resize(640 * 480 * 3);
                capture_frame(msg->data.data());
                // Move semantics: no copy if subscriber is in same process
                pub_->publish(std::move(msg));
            });
    }
private:
    rclcpp::Publisher&lt;sensor_msgs::msg::Image&gt;::SharedPtr pub_;
    rclcpp::TimerBase::SharedPtr timer_;
    void capture_frame(uint8_t* buf) { /* V4L2 / MIPI capture */ }
};

int main(int argc, char** argv) {
    configure_realtime();
    rclcpp::init(argc, argv);
    // StaticSingleThreadedExecutor: zero dynamic alloc per spin
    rclcpp::executors::StaticSingleThreadedExecutor executor;
    executor.add_node(std::make_shared&lt;ZeroCopyCameraNode&gt;());
    executor.spin();
    rclcpp::shutdown();
}</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.12 Containerization — Docker on Jetson Orin</h3>
    <p>Docker is the standard deployment unit for production drone software. NVIDIA's Container Toolkit (v1.14+ for JetPack 6) provides GPU passthrough via cgroups v2 device access. On Jetson, the GPU and CPU share physical DRAM — the container runtime grants the container access to CUDA device files without emulation overhead.</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">nvcr.io/nvidia/l4t-base:r36.x.x</strong>
            <p class="text-slate-300">Bare Ubuntu 22.04 + Jetson BSP libs. CUDA runtime not pre-installed. Use for minimal footprint images.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">nvcr.io/nvidia/l4t-cuda:12.6-runtime</strong>
            <p class="text-slate-300">L4T base + CUDA 12.6 runtime. Starting point for custom inference containers. ~1.2 GB compressed.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2">nvcr.io/nvidia/l4t-tensorrt:10.3.x</strong>
            <p class="text-slate-300">L4T + CUDA 12.6 + TensorRT 10.3 + cuDNN 9.3. Ready for TRT engine building and inference. ~3.8 GB compressed.</p>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Dockerfile · Multi-stage — ROS 2 Humble + TensorRT 10 on Jetson Orin (L4T r36)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand"><summary>Dockerfile Code Example</summary>
<pre><code class="language-bash">### Stage 1: Build TRT engine (heavy — not in final image)
FROM nvcr.io/nvidia/l4t-tensorrt:10.3.0-runtime AS trt-builder
WORKDIR /build
COPY yolo11s.onnx .
RUN python3 build_trt_engine.py --onnx yolo11s.onnx --engine yolo11s.engine

### Stage 2: ROS 2 base
FROM nvcr.io/nvidia/l4t-cuda:12.6-runtime AS ros-base
ARG ROS_DISTRO=humble
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gnupg lsb-release \
    && curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \
       -o /usr/share/keyrings/ros-archive-keyring.gpg \
    && echo "deb [arch=arm64 signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] \
       http://packages.ros.org/ros2/ubuntu jammy main" \
       &gt; /etc/apt/sources.list.d/ros2.list \
    && apt-get update && apt-get install -y --no-install-recommends \
       ros-humble-ros-base \
       ros-humble-rmw-cyclonedds-cpp \
    && rm -rf /var/lib/apt/lists/*

### Stage 3: Final runtime image
FROM ros-base AS drone-runtime
COPY --from=trt-builder /build/yolo11s.engine /models/
COPY ros2_ws /ros2_ws
RUN cd /ros2_ws && . /opt/ros/humble/setup.sh && colcon build --merge-install

ENV RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
ENV CYCLONEDDS_URI=file:///config/cyclonedds_rt.xml
ENTRYPOINT ["/ros2_ws/install/local_setup.sh"]
CMD ["ros2", "launch", "drone_perception", "perception.launch.py"]</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.13 NPU Landscape and Toolchain Selection (2025)</h3>
    <p>Not every drone runs Jetson. The NPU ecosystem has fragmented significantly in 2024–2025, with four major alternative platforms each requiring a dedicated compilation toolchain. The right choice depends on SWaP budget, required model types, and framework support.</p>

    <div class="overflow-x-auto mb-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Platform</th>
                    <th class="p-3">Peak TOPS</th>
                    <th class="p-3">Power</th>
                    <th class="p-3">Compiler / SDK</th>
                    <th class="p-3">Drone Sweet Spot</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-emerald-400 text-xs font-bold">Jetson Orin Nano (8GB)</td><td class="p-3 text-slate-300 text-xs">40 TOPS</td><td class="p-3 text-slate-300 text-xs">7–15W</td><td class="p-3 text-slate-300 text-xs">TensorRT 10.x + CUDA 12.x</td><td class="p-3 text-slate-300 text-xs">Multi-model stacks, VSLAM + YOLO concurrently</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-sky-400 text-xs font-bold">Qualcomm RB5 (QRB5165)</td><td class="p-3 text-slate-300 text-xs">15 TOPS</td><td class="p-3 text-slate-300 text-xs">~5W</td><td class="p-3 text-slate-300 text-xs">QNN SDK (replaces SNPE)</td><td class="p-3 text-slate-300 text-xs">5G-connected BVLOS drones, 150g compute weight</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-amber-400 text-xs font-bold">Hailo-8 (M.2/mPCIe)</td><td class="p-3 text-slate-300 text-xs">26 TOPS</td><td class="p-3 text-slate-300 text-xs">2.5W</td><td class="p-3 text-slate-300 text-xs">Hailo DFC 3.30 + HailoRT</td><td class="p-3 text-slate-300 text-xs">RPi5 co-processor; 218 FPS YOLOv8s at 2.5W</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-amber-400 text-xs font-bold">Hailo-8L (RPi AI Kit)</td><td class="p-3 text-slate-300 text-xs">13 TOPS</td><td class="p-3 text-slate-300 text-xs">1W</td><td class="p-3 text-slate-300 text-xs">Hailo DFC 3.30</td><td class="p-3 text-slate-300 text-xs">Micro drones &lt;250g, RPi CM4-based flight computers</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-red-400 text-xs font-bold">Google Coral Edge TPU</td><td class="p-3 text-slate-300 text-xs">4 TOPS INT8</td><td class="p-3 text-slate-300 text-xs">~2W</td><td class="p-3 text-slate-300 text-xs">edgetpu_compiler + PyCoral</td><td class="p-3 text-slate-300 text-xs">Nano/pico drones; 8MB SRAM model-size limit</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-purple-400 text-xs font-bold">Ambarella CV5/CV3</td><td class="p-3 text-slate-300 text-xs">8–20 TOPS</td><td class="p-3 text-slate-300 text-xs">3–7W</td><td class="p-3 text-slate-300 text-xs">CVflow SDK</td><td class="p-3 text-slate-300 text-xs">Consumer drones with integrated ISP (DJI-class SoC)</td></tr>
            </tbody>
        </table>
    </div>

    <div class="bg-slate-800/40 border border-sky-800/40 rounded-xl p-6 text-sm mb-8">
        <h4 class="text-sky-400 mt-0 mb-4">Practical Decision Criteria for 2024–2026 Programs</h4>
        <div class="space-y-4 text-xs font-mono text-slate-300">
            <div class="flex items-start gap-4 p-3 bg-slate-900 rounded border border-emerald-800/50">
                <span class="text-emerald-400 font-bold text-sm shrink-0">IF</span>
                <div><strong class="text-emerald-400">You need concurrent VSLAM + detection + depth estimation on a sub-5kg drone</strong>
                    <p class="text-slate-400 mt-1">→ Jetson Orin Nano (8GB) in 15W mode with Isaac ROS 3.x. Only platform with sufficient memory bandwidth to run 3 deep learning workloads simultaneously. TensorRT INT8 + NITROS zero-copy pipeline.</p></div>
            </div>
            <div class="flex items-start gap-4 p-3 bg-slate-900 rounded border border-sky-800/50">
                <span class="text-sky-400 font-bold text-sm shrink-0">IF</span>
                <div><strong class="text-sky-400">You need 5G BVLOS with onboard AI at under 150g compute weight</strong>
                    <p class="text-slate-400 mt-1">→ Qualcomm Flight RB5. Integrated 5G modem, 15 TOPS, proven BVLOS MAVLink stack. Use QNN SDK for INT8 inference on Hexagon DSP.</p></div>
            </div>
            <div class="flex items-start gap-4 p-3 bg-slate-900 rounded border border-amber-800/50">
                <span class="text-amber-400 font-bold text-sm shrink-0">IF</span>
                <div><strong class="text-amber-400">You need maximum inference FPS/W for a single-model detector</strong>
                    <p class="text-slate-400 mt-1">→ Hailo-8 as co-processor on Raspberry Pi 5 or ARM SBC. 218 FPS at 2.5W for YOLOv8s. Compile with Hailo DFC 3.30. Single-model deployment only — no concurrent workloads.</p></div>
            </div>
            <div class="flex items-start gap-4 p-3 bg-slate-900 rounded border border-red-800/50">
                <span class="text-red-400 font-bold text-sm shrink-0">IF</span>
                <div><strong class="text-red-400">You are building a &lt;250g micro-drone with severe SWaP constraints</strong>
                    <p class="text-slate-400 mt-1">→ Google Coral USB Accelerator or M.2 module. 4 TOPS at ~2W. Hard constraints: INT8 only, 8MB SRAM model size limit, TFLite INT8 required. MobileNet-SSD or nano-YOLO models only.</p></div>
            </div>
        </div>
    </div>

    <div class="bg-slate-800/40 border border-slate-700 rounded-xl p-5 text-xs font-mono text-slate-400 mb-4">
        <strong class="text-slate-300 block mb-2">Version Reference (2024–2025 Stable Releases) — <a href="https://docs.ros.org/en/jazzy/Releases.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">ROS 2 Releases</a> | <a href="https://developer.nvidia.com/isaac/ros" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Isaac ROS</a> | <a href="https://docs.px4.io/main/en/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">PX4 Docs</a></strong>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><div class="text-sky-400">TensorRT</div>10.15.1 (latest), 10.3.0 (JetPack 6.2)</div>
            <div><div class="text-sky-400">ONNX Runtime</div>1.22.0 (latest), 1.19.x (Jetson Zoo)</div>
            <div><div class="text-sky-400">ROS 2 Humble</div>May 2022, EOL May 2027, Ubuntu 22.04</div>
            <div><div class="text-sky-400">ROS 2 Jazzy</div>May 2024, EOL May 2029, Ubuntu 24.04</div>
            <div><div class="text-sky-400">Isaac ROS</div>3.2 (Dec 2024), JetPack 6.x target</div>
            <div><div class="text-sky-400">PX4</div>v1.15.x (stable), v1.16 (dev)</div>
            <div><div class="text-sky-400">MAVSDK Python</div>3.10.x, MAVSDK C++ 2.x</div>
            <div><div class="text-sky-400">JetPack</div>6.2 (L4T r36.4.3, CUDA 12.6)</div>
            <div><div class="text-sky-400">BT.cpp</div>4.9 (latest), Groot2 visualizer</div>
            <div><div class="text-sky-400">Nav2</div>Jazzy / Humble, MPPI controller</div>
            <div><div class="text-sky-400">Gazebo Harmonic</div>Paired with Jazzy; also Humble</div>
            <div><div class="text-sky-400">micro-ROS</div>Jazzy/Humble; FreeRTOS/NuttX/Zephyr</div>
        </div>
    </div>

    <div class="bg-slate-800/60 border border-slate-600/60 rounded-xl p-5 text-xs text-slate-400 mt-4">
        <strong class="text-slate-300 block mb-2">External Documentation</strong>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <a href="https://docs.ros.org/en/jazzy/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">ROS 2 Jazzy Documentation</a>
            <a href="https://docs.ros.org/en/humble/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">ROS 2 Humble Documentation</a>
            <a href="https://nvidia-isaac-ros.github.io/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">NVIDIA Isaac ROS GEMs</a>
            <a href="https://docs.px4.io/main/en/ros2/user_guide" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">PX4 ROS 2 User Guide</a>
            <a href="https://docs.nav2.org/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Nav2 Documentation</a>
            <a href="https://github.com/BehaviorTree/BehaviorTree.CPP" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">BehaviorTree.CPP 4.x</a>
            <a href="https://micro.vulcanexus.org/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">micro-ROS (Vulcanexus)</a>
            <a href="https://qgroundcontrol.com/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">QGroundControl</a>
            <a href="https://mavsdk.mavlink.io/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">MAVSDK Documentation</a>
        </div>
    </div>
</div>
`;
