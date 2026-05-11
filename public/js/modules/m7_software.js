export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 7</span>
    <h2>Edge Software Toolchains</h2>
    <p>Writing code for a drone is unlike web or backend development. Memory leaks or garbage-collection pauses don't just crash an app — they crash physical hardware. This module covers the complete 2024–2026 state-of-the-art edge software stack: inference runtimes, middleware, autopilot firmware, real-time OS tuning, and deployment pipelines. Every tool here has been selected because it is used in production autonomous sUAS programs today.</p>

    <!-- ============================================================ -->
    <h3>7.1 TensorRT 10.x — The Inference Compiler</h3>
    <p>TensorRT is not a library you call at runtime like PyTorch. It is a <strong>ahead-of-time compiler</strong> that takes a trained model, fuses layers, re-orders operations, selects optimal CUDA kernels for the exact GPU silicon present, and produces a binary <em>engine file</em>. On a Jetson Orin Nano, TensorRT INT8 delivers roughly 3–5× the throughput of FP16 PyTorch at one-third the power draw.</p>

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
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-red-400">libnvinfer_static.a (Linux static libs)</td><td class="p-3 border border-slate-700 text-emerald-400">Shared libraries (.so) only</td><td class="p-3 border border-slate-700">TRT 11.0</td></tr>
                <tr><td class="p-3 border border-slate-700 text-red-400">addNormalization()</td><td class="p-3 border border-slate-700 text-emerald-400">addNormalizationV2() — accepts [numChannels] scale and bias</td><td class="p-3 border border-slate-700">TRT 11.0</td></tr>
            </tbody>
        </table>
    </div>

    <h4 class="text-sky-400 mt-6 mb-2">Modern Builder Pattern (TensorRT 10.x)</h4>
    <p>The canonical two-phase pattern for TRT 10.x is: <strong>build once, serialize to disk, load engine at startup</strong>. The engine file is hardware-specific — a .engine built on Orin Nano will not run on Orin NX without rebuilding.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Python · TensorRT 10.x — Build Phase (ONNX → Serialized Engine)
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import tensorrt as trt
import os

TRT_LOGGER = trt.Logger(trt.Logger.WARNING)

def build_engine(onnx_path: str, engine_path: str, fp16: bool = True, int8: bool = False):
    """Build a TensorRT engine from ONNX. Run once per hardware target."""
    builder = trt.Builder(TRT_LOGGER)

    # TRT 10.x: STRONGLY_TYPED is recommended. EXPLICIT_BATCH is deprecated.
    network_flags = 1 << int(trt.NetworkDefinitionCreationFlag.STRONGLY_TYPED)
    network = builder.create_network(network_flags)

    config = builder.create_builder_config()
    config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, 2 << 30)  # 2 GB

    # Optimization level 3 (default). Range 0–5. Higher = slower build, potentially faster inference.
    config.builder_optimization_level = 3

    if fp16 and builder.platform_has_fast_fp16:
        config.set_flag(trt.BuilderFlag.FP16)

    if int8:
        # TRT 10.x: INT8 requires explicit Q/DQ nodes in the ONNX graph.
        # Do NOT use IInt8Calibrator — it is deprecated. Use TensorRT Model Optimizer
        # (nvidia/TensorRT-Model-Optimizer) to insert Q/DQ nodes before this step.
        config.set_flag(trt.BuilderFlag.INT8)

    # Parse the ONNX model
    parser = trt.OnnxParser(network, TRT_LOGGER)
    with open(onnx_path, 'rb') as f:
        if not parser.parse(f.read()):
            for i in range(parser.num_errors):
                print(parser.get_error(i))
            raise RuntimeError("ONNX parse failed")

    # Dynamic shapes: define min/opt/max batch profiles
    profile = builder.create_optimization_profile()
    # For YOLO11s with 640×640 input:
    profile.set_shape("images", (1,3,640,640), (4,3,640,640), (8,3,640,640))
    config.add_optimization_profile(profile)

    # Serialize directly — do not call build_engine_with_config() for disk persistence
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

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Python · TensorRT 10.x — Inference Phase (Load Engine, Run Context)
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import tensorrt as trt
import numpy as np
import pycuda.driver as cuda
import pycuda.autoinit

def load_engine(engine_path: str) -> trt.ICudaEngine:
    runtime = trt.Runtime(trt.Logger(trt.Logger.WARNING))
    with open(engine_path, 'rb') as f:
        return runtime.deserialize_cuda_engine(f.read())

engine = load_engine("yolo11s_int8.engine")
context = engine.create_execution_context()

# Allocate I/O buffers (page-locked host memory + device memory)
# For real-time pipelines: pre-allocate once at init, reuse every inference call.
input_shape = (1, 3, 640, 640)
input_nbytes = int(np.prod(input_shape)) * np.dtype(np.float32).itemsize

h_input  = cuda.pagelocked_empty(input_shape, dtype=np.float32)
d_input  = cuda.mem_alloc(input_nbytes)

# Output tensor shape depends on model; query from engine
output_name = engine.get_tensor_name(1)  # TRT 10.x API
output_shape = context.get_tensor_shape(output_name)
h_output = cuda.pagelocked_empty(tuple(output_shape), dtype=np.float32)
d_output = cuda.mem_alloc(h_output.nbytes)

stream = cuda.Stream()

def infer(frame_np: np.ndarray) -> np.ndarray:
    np.copyto(h_input, frame_np.astype(np.float32))
    cuda.memcpy_htod_async(d_input, h_input, stream)

    # TRT 10.x tensor address API (replaces execute_v2 bindings)
    context.set_tensor_address("images", int(d_input))
    context.set_tensor_address(output_name, int(d_output))
    context.execute_async_v3(stream_handle=stream.handle)

    cuda.memcpy_dtoh_async(h_output, d_output, stream)
    stream.synchronize()
    return h_output.copy()</code></pre>
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
                    <th class="text-left p-3 border border-slate-700">Weight Granularity</th>
                    <th class="text-left p-3 border border-slate-700">Activation</th>
                    <th class="text-left p-3 border border-slate-700">Drone Use Case</th>
                </tr>
            </thead>
            <tbody>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-emerald-400">INT8</td><td class="p-3 border border-slate-700">8-bit 2s complement</td><td class="p-3 border border-slate-700">Per-tensor or per-channel</td><td class="p-3 border border-slate-700">Per-tensor</td><td class="p-3 border border-slate-700">YOLO11 / RT-DETR on Orin — best latency/accuracy tradeoff for ConvNets</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-sky-400">FP8 (E4M3)</td><td class="p-3 border border-slate-700">8-bit float</td><td class="p-3 border border-slate-700">Per-tensor or per-channel</td><td class="p-3 border border-slate-700">Per-tensor</td><td class="p-3 border border-slate-700">Transformer models (RT-DETR encoder). NOTE: no optimized FP8 kernels for depthwise/group convolutions — stick to INT8 for backbone</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-amber-400">INT4</td><td class="p-3 border border-slate-700">4-bit 2s complement</td><td class="p-3 border border-slate-700">Block (64 or 128 elements)</td><td class="p-3 border border-slate-700">High-precision (FP16)</td><td class="p-3 border border-slate-700">Weight-only quant for large GEMM layers (LLM-style decoders). Memory BW bound ops only</td></tr>
                <tr><td class="p-3 border border-slate-700 text-purple-400">FP4 (E2M1)</td><td class="p-3 border border-slate-700">4-bit float (NVFP4)</td><td class="p-3 border border-slate-700">Block (16 elements)</td><td class="p-3 border border-slate-700">Dynamic (FP8 scales)</td><td class="p-3 border border-slate-700">Blackwell GPU only (Jetson Thor / GB200). Not available on Orin Ampere</td></tr>
            </tbody>
        </table>
    </div>

    <div class="bg-slate-800/50 border border-amber-700/40 rounded-xl p-5 text-sm mb-8">
        <strong class="text-amber-400 block mb-2">Benchmark: YOLO11s on Jetson Orin NX (16GB, JetPack 6.2, TRT 10.3)</strong>
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

    <h4 class="text-sky-400 mt-4 mb-2">Execution Provider Reference (ORT 1.19–1.22)</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">TensorrtExecutionProvider</strong>
            <p class="text-slate-300 mb-1">Compiles the full ONNX graph through TensorRT 10.9 (ORT 1.22). Caches .plan engine files to disk. Best for NVIDIA hardware. Requires CUDA 12.0+.</p>
            <ul class="space-y-1 text-slate-400">
                <li>> trt_fp16_enable: True</li>
                <li>> trt_int8_enable: True (needs QDQ model)</li>
                <li>> trt_engine_cache_enable: True (skip rebuild on restart)</li>
                <li>> trt_timing_cache_enable: True (reuse kernel tuning)</li>
                <li>> trt_cuda_graph_enable: True (reduce CPU overhead ~15%)</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">CUDAExecutionProvider</strong>
            <p class="text-slate-300 mb-1">Runs ops in CUDA without TRT compilation. Faster startup (no engine build). Lower peak throughput. Used as fallback EP in the provider priority list.</p>
            <ul class="space-y-1 text-slate-400">
                <li>> device_id: 0</li>
                <li>> cudnn_conv_algo_search: EXHAUSTIVE (build-time) or DEFAULT (latency-sensitive)</li>
                <li>> arena_extend_strategy: kNextPowerOfTwo</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2">OpenVINOExecutionProvider</strong>
            <p class="text-slate-300 mb-1">Intel CPU/iGPU/VPU/NPU. Qualcomm Flight RB5 uses OpenVINO via ARM CPU EP. Drone-relevant on Intel RealSense host systems. Supports INT8 via NNCF.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-purple-400 block mb-2">NNAPIExecutionProvider</strong>
            <p class="text-slate-300 mb-1">Android Neural Networks API. Used on Qualcomm Snapdragon-based companion computers (RB5). Routes ops to Adreno GPU, Hexagon DSP, or Kryo CPU depending on model graph.</p>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Python · ONNX Runtime 1.19+ — Jetson Orin with TensorRT EP + CUDA EP fallback
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import onnxruntime as ort
import numpy as np

# Provider priority list: TRT first, CUDA fallback for unsupported ops
trt_options = {
    "device_id": 0,
    "trt_fp16_enable": True,
    "trt_int8_enable": True,          # Requires QDQ nodes in ONNX model
    "trt_engine_cache_enable": True,
    "trt_engine_cache_path": "/opt/drone/trt_cache",
    "trt_timing_cache_enable": True,  # ORT 1.16+ — reuses kernel timing across sessions
    "trt_timing_cache_path": "/opt/drone/trt_cache/timing.cache",
    "trt_cuda_graph_enable": True,    # Captures CUDA graph — reduces CPU dispatch latency
    "trt_max_workspace_size": 2147483648,  # 2 GB workspace
    "trt_builder_optimization_level": 3,
}

cuda_options = {
    "device_id": 0,
    "cudnn_conv_algo_search": "DEFAULT",
    "arena_extend_strategy": "kSameAsRequested",
}

providers = [
    ("TensorrtExecutionProvider", trt_options),
    ("CUDAExecutionProvider", cuda_options),
]

sess_options = ort.SessionOptions()
sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
sess_options.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL  # lower latency than parallel

session = ort.InferenceSession(
    "yolo11s_qdq.onnx",
    sess_options=sess_options,
    providers=providers,
)

# First call triggers TRT engine compilation — subsequent calls load from cache
dummy = np.random.randn(1, 3, 640, 640).astype(np.float32)
outputs = session.run(None, {"images": dummy})
print(f"Output shape: {outputs[0].shape}")  # e.g. (1, 84, 8400) for YOLO11s</code></pre>
</details>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">QDQ Static Quantization with ONNX Runtime</h4>
    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Python · ONNX Runtime Quantization API — Static INT8 with QDQ format
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">from onnxruntime.quantization import (
    quantize_static, QuantType, QuantFormat, CalibrationDataReader
)
import numpy as np

class DroneCalibReader(CalibrationDataReader):
    """Feed 100–500 representative frames from the drone's actual operating environment."""
    def __init__(self, images):
        self.images = iter(images)

    def get_next(self) -> dict:
        try:
            img = next(self.images)
            # Normalize to [0,1] float32, shape (1,3,640,640)
            return {"images": img[None].astype(np.float32) / 255.0}
        except StopIteration:
            return None

calibration_frames = load_drone_footage_frames(n=300)  # your data loader
reader = DroneCalibReader(calibration_frames)

quantize_static(
    model_input="yolo11s.onnx",
    model_output="yolo11s_qdq.onnx",
    calibration_data_reader=reader,
    quant_format=QuantFormat.QDQ,       # Inserts QuantizeLinear/DequantizeLinear
    per_channel=True,                    # Per-channel for weights (better accuracy)
    weight_type=QuantType.QInt8,         # S8 weights
    activation_type=QuantType.QInt8,     # S8 activations — S8S8 QDQ is TRT's preferred
    calibrate_method="MinMax",           # or "Entropy", "Percentile"
    extra_options={
        "ActivationSymmetric": True,     # Symmetric quant for activations
        "WeightSymmetric": True,
    }
)</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.3 ROS 2 Jazzy Jalisco (May 2024 LTS)</h3>
    <p>ROS 2 Jazzy is the 2024 Long-Term Support release (EOL May 2029). For new autonomous drone programs starting in 2024–2026, Jazzy is the right choice over Humble (2022 LTS). Key reasons: improved executor architecture, type adaptation for zero-copy GPU pipelines, and first-class lifecycle node tooling.</p>

    <h4 class="text-sky-400 mt-4 mb-2">Jazzy vs. Humble — Decision Matrix</h4>
    <div class="overflow-x-auto mb-6">
        <table class="w-full text-xs font-mono text-slate-300 border-collapse">
            <thead>
                <tr class="bg-slate-800 text-slate-400">
                    <th class="text-left p-3 border border-slate-700">Feature</th>
                    <th class="text-left p-3 border border-slate-700">Humble (2022)</th>
                    <th class="text-left p-3 border border-slate-700">Jazzy (2024)</th>
                    <th class="text-left p-3 border border-slate-700">Drone Impact</th>
                </tr>
            </thead>
            <tbody>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700">Isaac ROS support</td><td class="p-3 border border-slate-700 text-emerald-400">Full (primary)</td><td class="p-3 border border-slate-700 text-emerald-400">Full (JetPack 7+)</td><td class="p-3 border border-slate-700">Jazzy + JetPack 7 is the new target for Jetson Thor</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700">Executor rclcpp::WaitSet</td><td class="p-3 border border-slate-700 text-amber-400">Partial</td><td class="p-3 border border-slate-700 text-emerald-400">Full integration — reduces wait_set alloc/dealloc churn</td><td class="p-3 border border-slate-700">Lower jitter on IMU/camera callback threads</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700">Type Adaptation (REP-2007)</td><td class="p-3 border border-slate-700 text-emerald-400">Supported</td><td class="p-3 border border-slate-700 text-emerald-400">Extended to message_filters</td><td class="p-3 border border-slate-700">GPU tensor pipelines skip CPU serialization</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700">Service recording (ros2bag)</td><td class="p-3 border border-slate-700 text-red-400">Topics only</td><td class="p-3 border border-slate-700 text-emerald-400">Services + topics</td><td class="p-3 border border-slate-700">Record full mission service calls for replay debugging</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700">Bag Player/Recorder as components</td><td class="p-3 border border-slate-700 text-red-400">Standalone processes</td><td class="p-3 border border-slate-700 text-emerald-400">rclcpp components (intra-process zero-copy)</td><td class="p-3 border border-slate-700">Record camera data without extra IPC copies</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700">Lifecycle state API</td><td class="p-3 border border-slate-700 text-amber-400">get_state() / set_state()</td><td class="p-3 border border-slate-700 text-emerald-400">get_lifecycle_state() / set_lifecycle_state()</td><td class="p-3 border border-slate-700">Clearer API; old names generate deprecation warnings</td></tr>
                <tr><td class="p-3 border border-slate-700">Ubuntu base</td><td class="p-3 border border-slate-700">Ubuntu 22.04</td><td class="p-3 border border-slate-700">Ubuntu 24.04</td><td class="p-3 border border-slate-700">Jazzy containers require L4T r36.4+ / JetPack 7 on Orin</td></tr>
            </tbody>
        </table>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">Executors in ROS 2 — Choosing for Drone Workloads</h4>
    <p>The executor is the scheduling core that pulls callbacks off the wait set and dispatches them. Wrong executor selection is the #1 source of latency spikes in drone ROS 2 stacks.</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">SingleThreadedExecutor</strong>
            <p class="text-slate-300 mb-2">One thread. Callbacks are serialized. Simple, deterministic. No data races.</p>
            <p class="text-amber-400">Use when: mission logic nodes that must not run concurrently. Not for sensor callbacks — a slow callback blocks all others.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">MultiThreadedExecutor</strong>
            <p class="text-slate-300 mb-2">Thread pool (specify num_threads). Callbacks run in parallel. Requires mutexes for shared state.</p>
            <p class="text-amber-400">Use when: multiple independent sensor pipelines (camera + LiDAR + IMU) on separate callback groups. Set num_threads = num_sensor_streams.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-purple-400 block mb-2">StaticSingleThreadedExecutor</strong>
            <p class="text-slate-300 mb-2">Pre-computes the wait set at construction time. Zero dynamic memory allocation per spin cycle.</p>
            <p class="text-amber-400">Use when: PREEMPT_RT paths. Critical for real-time flight control nodes where malloc in the hot path causes latency spikes.</p>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            C++ · ROS 2 Jazzy — Callback Groups + Multithreaded Executor for drone sensor pipeline
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>C++ Code Example</summary>
<pre><code class="language-cpp">#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/image.hpp"
#include "sensor_msgs/msg/imu.hpp"
#include "px4_msgs/msg/vehicle_odometry.hpp"

class DronePerceptionNode : public rclcpp::Node {
public:
    DronePerceptionNode() : Node("drone_perception") {
        // Mutually exclusive group: camera callbacks do not preempt each other
        camera_cbg_ = this->create_callback_group(
            rclcpp::CallbackGroupType::MutuallyExclusive);
        // Reentrant group: IMU callbacks can overlap (stateless processing)
        imu_cbg_ = this->create_callback_group(
            rclcpp::CallbackGroupType::Reentrant);

        rclcpp::SubscriptionOptions cam_opts;
        cam_opts.callback_group = camera_cbg_;

        rclcpp::SubscriptionOptions imu_opts;
        imu_opts.callback_group = imu_cbg_;

        // Sensor QoS: Best Effort, Volatile, depth=5 — matches PX4 uXRCE-DDS publishers
        auto sensor_qos = rclcpp::SensorDataQoS();

        cam_sub_ = this->create_subscription&lt;sensor_msgs::msg::Image&gt;(
            "/camera/image_raw", sensor_qos,
            std::bind(&DronePerceptionNode::onCamera, this, std::placeholders::_1),
            cam_opts);

        imu_sub_ = this->create_subscription&lt;sensor_msgs::msg::Imu&gt;(
            "/imu/data", sensor_qos,
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
    // 4 threads: 1 per callback group + headroom
    rclcpp::executors::MultiThreadedExecutor executor(rclcpp::ExecutorOptions(), 4);
    executor.add_node(node);
    executor.spin();
    rclcpp::shutdown();
}</code></pre>
</details>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">QoS Profiles for Drone Sensor Data</h4>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-xs font-mono">
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
            <p class="text-slate-300 mt-2">Map frames, static transforms, mission parameters. New subscribers receive the last published value immediately on connection — critical for /tf_static.</p>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.4 NVIDIA Isaac ROS 3.x (2024–2025)</h3>
    <p>Isaac ROS 3.x is the NVIDIA-maintained collection of GPU-accelerated ROS 2 packages. The 3.x series (released May–December 2024) targets JetPack 6.x (Orin, Ubuntu 22.04, ROS 2 Humble) and begins JetPack 7.x (Jetson Thor, Ubuntu 24.04, ROS 2 Jazzy) support. The central innovation is NITROS — a zero-copy GPU memory transport layer that eliminates the CPU-bound DDS serialization bottleneck.</p>

    <h4 class="text-sky-400 mt-4 mb-2">NITROS — Isaac Transport for ROS</h4>
    <p>Standard ROS 2 message passing serializes data to a byte buffer, copies it through the DDS middleware, and deserializes it on the subscriber side. For a 1080p camera frame (6.2 MB), this means 12.4 MB of memory traffic plus CPU time on every frame. NITROS eliminates this by implementing ROS 2 Type Adaptation (REP-2007) and Type Negotiation (REP-2009):</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">NITROS Zero-Copy Path</strong>
            <ol class="space-y-2 text-slate-300 list-none">
                <li><span class="text-sky-400">1.</span> Camera node publishes NitrosImage (GPU pointer + metadata)</li>
                <li><span class="text-sky-400">2.</span> NITROS type negotiation: both nodes in same process, compatible types agreed</li>
                <li><span class="text-sky-400">3.</span> Subscriber receives GPU pointer directly — zero copy, zero serialize</li>
                <li><span class="text-sky-400">4.</span> TRT inference node reads directly from same CUDA device buffer</li>
            </ol>
            <p class="text-emerald-400 mt-3">Result: 1080p frame passes camera → inference in &lt;0.1ms vs ~8ms standard ROS 2</p>
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

    <h4 class="text-sky-400 mt-4 mb-2">Key Isaac ROS 3.x Packages</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-1">isaac_ros_visual_slam (cuVSLAM 11)</strong>
            <p class="text-slate-300">GPU-accelerated stereo VIO + loop closure. cuVSLAM 11 (2024): supports up to 32 cameras (16 stereo pairs). Track call time: 0.4ms desktop / 1.8ms Jetson AGX Orin at 640×480 60 FPS. Only 5.5% CPU, 1.7% GPU utilization. Lowest translation and rotational error on KITTI benchmark among real-time systems. Supports RGBD cameras and multi-cam SLAM localization.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-1">isaac_ros_object_detection</strong>
            <p class="text-slate-300">TensorRT-backed inference node. Drop in your YOLO11 .engine file via the model_file_path parameter. Node handles NitrosImage → pre-process → TRT infer → Detection2DArray publish. No custom inference code needed.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-1">isaac_ros_nvblox</strong>
            <p class="text-slate-300">GPU 3D scene reconstruction using TSDF + semantic fusion. Builds real-time voxel maps from depth + color streams. Feeds directly into Nav2 global costmap for obstacle avoidance.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-purple-400 block mb-1">isaac_ros_cumotion + MoveIt 2</strong>
            <p class="text-slate-300">GPU-parallelized motion planning. cuMotion solves trajectory planning on GPU, bypassing MoveIt's CPU-bound sampling. Primarily for manipulation but extensible to gimbal/arm drones.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-1">PyNITROS (added 3.2)</strong>
            <p class="text-slate-300">Python API for CUDA with NITROS support. Wraps PyTorch tensors. Allows Python ROS 2 nodes to participate in zero-copy GPU pipelines without writing C++ NitrosNode subclasses.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-1">Nova Event Data Recorder (3.2)</strong>
            <p class="text-slate-300">Records synchronized sensor data from all Nova Orin sensors during live operation. Enables offline validation of SLAM, detection, and depth pipelines without re-flying.</p>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Bash · Isaac ROS 3.x — Install and launch on Jetson Orin (JetPack 6.2, ROS 2 Humble)
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># Isaac ROS 3.x requires JetPack 6.0+ (L4T 36.x, CUDA 12.2+)
# Recommended: use the Isaac ROS Docker container rather than apt-get

# Pull the Isaac ROS dev container (includes all deps pre-built)
docker pull nvcr.io/nvidia/isaac/ros:aarch64-ros2_humble_3.2.0

docker run --rm -it \\
    --runtime nvidia \\
    --network host \\
    -v /dev:/dev \\
    nvcr.io/nvidia/isaac/ros:aarch64-ros2_humble_3.2.0 bash

# Inside container: launch cuVSLAM with stereo camera
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam.launch.py \\
    enable_image_denoising:=false \\
    rectified_images:=true \\
    enable_imu_fusion:=true \\
    imu_frame:=imu_link \\
    gyro_noise_density:=0.000244 \\
    accel_noise_density:=0.001862

# Launch YOLO11 object detection with NITROS zero-copy pipeline
ros2 launch isaac_ros_yolov8 isaac_ros_yolov8_visualize.launch.py \\
    model_file_path:=/workspaces/yolo11s_int8.engine \\
    input_binding_names:=['images'] \\
    output_binding_names:=['output0'] \\
    network_image_width:=640 network_image_height:=640</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.5 PX4 Autopilot v1.15 Software Stack</h3>
    <p>PX4 v1.15 (released late 2024) is the current stable release for production drone programs. It runs on NuttX RTOS on the flight controller MCU and communicates with the companion computer via uXRCE-DDS. Understanding this stack is prerequisite knowledge for any autonomous drone program.</p>

    <h4 class="text-sky-400 mt-4 mb-2">uORB — The Internal Message Bus</h4>
    <p>uORB (Micro Object Request Broker) is PX4's publish-subscribe IPC system running inside NuttX. Every sensor reading, estimator output, setpoint, and actuator command is a uORB message. There is no network; it is shared memory with a priority-based scheduler. Over 300 message types exist in the PX4 source tree, each defined in a <code>.msg</code> file under <code>msg/</code>.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            C++ · PX4 NuttX module — uORB publish/subscribe pattern
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>C++ Code Example</summary>
<pre><code class="language-cpp">// PX4 NuttX module: read IMU, publish to vehicle_acceleration
#include &lt;uORB/uORB.h&gt;
#include &lt;uORB/topics/sensor_accel.h&gt;
#include &lt;uORB/topics/vehicle_acceleration.h&gt;
#include &lt;px4_platform_common/px4_work_queue/ScheduledWorkItem.hpp&gt;

class AccelFusionTask : public px4::ScheduledWorkItem {
public:
    AccelFusionTask() : ScheduledWorkItem(MODULE_NAME, px4::wq_configurations::nav_and_controllers) {}

    bool init() {
        _sensor_sub.registerCallback();  // Subscribe to sensor_accel uORB topic
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
            _accel_pub.publish(out);   // Publish to vehicle_acceleration
        }
    }

    uORB::SubscriptionCallbackWorkItem _sensor_sub{this, ORB_ID(sensor_accel)};
    uORB::Publication&lt;vehicle_acceleration_s&gt; _accel_pub{ORB_ID(vehicle_acceleration)};
};</code></pre>
</details>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">uXRCE-DDS — Bridging PX4 to ROS 2 (v1.15)</h4>
    <p>uXRCE-DDS replaces the older FastRTPS bridge and MAVROS for modern systems. A lightweight XRCE-DDS client runs on the flight controller MCU; a full DDS agent runs on the companion computer. Selected uORB topics appear as native ROS 2 topics in the <code>/fmu/out/</code> namespace — no translation, no MAVROS translator node.</p>

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
            <p class="text-slate-300">New in v1.15: ROS 2 nodes can now write to a separate uORB topic instance via <code>subscription_multi</code> in <code>dds_topics.yaml</code>. PX4 can then differentiate companion computer commands from its own internal publishers — preventing overwrite conflicts in multi-source estimator setups.</p>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Bash · PX4 v1.15 — Start uXRCE-DDS agent + verify ROS 2 topics
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># On companion computer: install Micro-XRCE-DDS Agent (v2.4.2 recommended)
pip install --user -U micro-xrce-dds-agent

# UDP connection (SITL or companion + Ethernet to FMU):
MicroXRCEAgent udp4 -p 8888

# Serial connection (UART from companion to Pixhawk serial port):
MicroXRCEAgent serial --dev /dev/ttyUSB0 -b 921600

# On flight controller console (PX4 NuttX shell):
# Start client, connect to agent at 192.168.0.10:8888, namespace "drone1"
uxrce_dds_client start -t udp -p 8888 -h 192.168.0.10 -n drone1

# Verify topics appear in ROS 2:
ros2 topic list | grep /fmu
# Expected: /fmu/out/vehicle_odometry, /fmu/out/vehicle_status, etc.

ros2 topic hz /fmu/out/sensor_combined
# Expected: ~250 Hz (IMU rate)</code></pre>
</details>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Bash · PX4 v1.15 SITL with Gazebo (replaces jMAVSim in v1.15)
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># PX4 v1.15: Gazebo is the default simulator (jMAVSim retired)
# Requires Ubuntu 22.04, Gazebo Harmonic (or Garden)

# Clone PX4 and install dependencies
git clone https://github.com/PX4/PX4-Autopilot.git --recursive
cd PX4-Autopilot
bash ./Tools/setup/ubuntu.sh

# SITL with Gazebo x500 quadcopter (standard test airframe)
make px4_sitl gz_x500

# Headless (no GUI) — for CI/CD pipelines and remote servers
HEADLESS=1 make px4_sitl gz_x500

# 2x realtime speed for faster testing
PX4_SIM_SPEED_FACTOR=2 make px4_sitl gz_x500

# With ROS 2 bridge — starts uXRCE-DDS agent automatically in SITL
make px4_sitl gz_x500 ros2

# Multi-vehicle: spawn 3 drones with unique namespaces
PX4_SIM_MODEL=gz_x500 Tools/simulation/gazebo-classic/sitl_multiple_run.sh 3</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.6 MAVLink 2.0 and MAVSDK</h3>
    <p>MAVLink 2.0 is the wire protocol between flight controllers, ground stations, and companion computers. MAVSDK is the modern high-level SDK built on top of MAVLink that replaces direct pymavlink usage for most autonomous mission scenarios.</p>

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
            <div class="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-300"><div class="text-[10px] text-slate-400 mb-1">2 Bytes</div>CRC<br/>+CRC_EXTRA</div>
            <div class="bg-amber-900/50 border border-amber-700 rounded px-3 py-2 text-amber-300 text-[11px]"><div class="text-[10px] text-slate-400 mb-1">13 Bytes (optional)</div>SIGNATURE<br/>(signing only)</div>
        </div>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
            <div><strong class="text-amber-400">INCOMPAT FLAGS:</strong> 0x01 = packet is signed. A receiver that does not understand a set incompat flag MUST discard the packet.</div>
            <div><strong class="text-purple-400">24-bit MSG_ID:</strong> 16 million unique message IDs vs MAVLink 1's 256. Message extensions (new fields) append after the base payload — old receivers ignore them.</div>
            <div><strong class="text-emerald-400">Signing:</strong> 13-byte signature = link_id (8b) + timestamp_48b + first 48 bits of SHA-256(secret_key + header + payload + CRC). Prevents spoofing but not replay.</div>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">MAVSDK Python — Autonomous Mission Example</h4>
    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Python · MAVSDK 3.x — Upload and execute a waypoint mission
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import asyncio
from mavsdk import System
from mavsdk.mission import MissionItem, MissionPlan

async def run_mission():
    drone = System()
    await drone.connect(system_address="udpin://0.0.0.0:14540")

    print("Waiting for drone to connect...")
    async for state in drone.core.connection_state():
        if state.is_connected:
            print("Connected.")
            break

    # Wait for global position estimate
    async for health in drone.telemetry.health():
        if health.is_global_position_ok and health.is_home_position_ok:
            break

    # Build waypoint mission (lat/lon/alt in meters AGL)
    mission_items = [
        MissionItem(
            latitude_deg=47.398039859999997,
            longitude_deg=8.5455725400000002,
            relative_altitude_m=25,
            speed_m_s=10,
            is_fly_through=True,           # Do not loiter at waypoint
            gimbal_pitch_deg=float('nan'),
            gimbal_yaw_deg=float('nan'),
            camera_action=MissionItem.CameraAction.NONE,
            loiter_time_s=float('nan'),
            camera_photo_interval_s=float('nan'),
            acceptance_radius_m=2.0,
            yaw_deg=float('nan'),
            camera_photo_distance_m=float('nan'),
        ),
        MissionItem(47.398036222, 8.545980775, 25, 10, True,
                    float('nan'), float('nan'), MissionItem.CameraAction.NONE,
                    float('nan'), float('nan'), 2.0, float('nan'), float('nan')),
    ]

    mission_plan = MissionPlan(mission_items)

    await drone.mission.set_return_to_launch_after_mission(True)

    print("Uploading mission...")
    await drone.mission.upload_mission(mission_plan)

    print("Arming...")
    await drone.action.arm()

    print("Starting mission...")
    await drone.mission.start_mission()

    # Monitor progress
    async for progress in drone.mission.mission_progress():
        print(f"Waypoint {progress.current}/{progress.total}")
        if progress.current == progress.total:
            break

    # Wait for landing
    async for in_air in drone.telemetry.in_air():
        if not in_air:
            print("Landed.")
            break

asyncio.run(run_mission())</code></pre>
</details>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">MAVSDK vs DroneKit — Comparison</h4>
    <div class="overflow-x-auto mb-8">
        <table class="w-full text-xs font-mono text-slate-300 border-collapse">
            <thead>
                <tr class="bg-slate-800 text-slate-400">
                    <th class="text-left p-3 border border-slate-700">Dimension</th>
                    <th class="text-left p-3 border border-slate-700">MAVSDK (Python 3.x / C++ 2.x)</th>
                    <th class="text-left p-3 border border-slate-700">DroneKit-Python (2.9.x)</th>
                </tr>
            </thead>
            <tbody>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700">Autopilot target</td><td class="p-3 border border-slate-700 text-emerald-400">PX4 (primary), ArduPilot (community)</td><td class="p-3 border border-slate-700 text-amber-400">ArduPilot (primary), PX4 (limited)</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700">Language bindings</td><td class="p-3 border border-slate-700 text-emerald-400">Python, C++, Swift (v1.2, 2024), Kotlin, Rust (community)</td><td class="p-3 border border-slate-700 text-amber-400">Python only (Android via separate fork)</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700">Architecture</td><td class="p-3 border border-slate-700">C++ gRPC server (mavsdk_server) + language-specific client</td><td class="p-3 border border-slate-700">Direct pymavlink wrapping — Python drives MAVLink loop</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700">Async model</td><td class="p-3 border border-slate-700 text-emerald-400">asyncio native (Python), async C++ futures</td><td class="p-3 border border-slate-700 text-red-400">Synchronous blocking calls — poor for real-time</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700">Versioning / stability</td><td class="p-3 border border-slate-700 text-emerald-400">Semver, static binaries, breaking changes are explicit</td><td class="p-3 border border-slate-700 text-red-400">Rides pymavlink HEAD — breakage without notice common</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700">MAVProxy integration</td><td class="p-3 border border-slate-700 text-amber-400">Not native — connects to SITL UDP port directly</td><td class="p-3 border border-slate-700 text-emerald-400">Native — MAVProxy is the recommended multiplexer</td></tr>
                <tr><td class="p-3 border border-slate-700">Recommendation 2024+</td><td class="p-3 border border-slate-700 text-emerald-400">New programs on PX4 or multi-language teams</td><td class="p-3 border border-slate-700">Legacy ArduPilot programs; not recommended for new code</td></tr>
            </tbody>
        </table>
    </div>

    <!-- ============================================================ -->
    <h3>7.7 Real-Time OS Considerations</h3>
    <p>A drone's companion computer runs a standard Linux kernel by default. The Linux scheduler uses CFS (Completely Fair Scheduler), which can preempt any thread at any time for a kernel softirq. On a 200 Hz control loop, a 5ms scheduler jitter causes a missed deadline. There are three strategies to address this, ordered by invasiveness.</p>

    <h4 class="text-sky-400 mt-4 mb-2">Strategy 1 — PREEMPT_RT Linux on Jetson Orin</h4>
    <p>NVIDIA provides a PREEMPT_RT kernel build for JetPack. With PREEMPT_RT, all kernel interrupt handlers run in preemptable thread context, and the worst-case latency drops from ~5ms (stock) to ~50–100µs measured by cyclictest on Jetson Orin AGX (kernel 5.15.148-rt-tegra, October 2024).</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Bash · PREEMPT_RT on Jetson Orin — install, verify, configure
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># Check if RT kernel is available for your JetPack version
apt-cache search linux-image-rt

# Install PREEMPT_RT kernel (JetPack 6.x / L4T 36.x)
sudo apt-get install -y linux-image-rt-$(uname -r | cut -d'-' -f1)

# After reboot, verify:
uname -a  # should contain "PREEMPT_RT"
cat /sys/kernel/realtime  # returns "1" on RT kernel

# Test worst-case latency with cyclictest (rt-tests package)
sudo apt-get install -y rt-tests
sudo cyclictest -m -p 99 -i 200 -l 100000 --smp
# Target: Max latency < 200µs on Orin AGX; < 500µs on Orin Nano

# CPU isolation: dedicate CPU cores 2-3 to RT drone control threads
# Add to /etc/default/grub:
# GRUB_CMDLINE_LINUX="isolcpus=2,3 nohz_full=2,3 rcu_nocbs=2,3"
# Then: sudo update-grub && reboot

# Pin a ROS 2 node to isolated CPU with RT priority
taskset -c 2 chrt -f 80 ros2 run my_pkg control_node</code></pre>
</details>
        </div>
    </div>

    <h4 class="text-sky-400 mt-4 mb-2">Strategy 2 — NuttX on the Flight Controller (PX4)</h4>
    <p>PX4 runs NuttX RTOS on the Pixhawk MCU (STM32H7 typically). NuttX is a POSIX-compliant, strictly preemptive RTOS: higher-priority tasks always preempt lower-priority tasks with no kernel sections that are non-preemptable. PX4 assigns fixed priorities: sensors (95), estimators (90), controllers (85), actuators (80), logger (60). A priority inversion here causes oscillations in the control output — never raise peripheral driver priorities above the sensor priority.</p>

    <h4 class="text-sky-400 mt-4 mb-2">Strategy 3 — DDS Real-Time Configuration</h4>
    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            XML · CycloneDDS real-time profile for drone companion computer
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>XML Code Example</summary>
<pre><code class="language-xml">&lt;!-- /opt/drone/cyclonedds_rt.xml --&gt;
&lt;CycloneDDS&gt;
    &lt;Domain&gt;
        &lt;General&gt;
            &lt;!-- Disable multicast: drone is a point-to-point system, no LAN discovery --&gt;
            &lt;AllowMulticast&gt;false&lt;/AllowMulticast&gt;
            &lt;MaxMessageSize&gt;65500B&lt;/MaxMessageSize&gt;
        &lt;/General&gt;
        &lt;Internal&gt;
            &lt;!-- Pre-allocate receive buffers: no malloc in hot path --&gt;
            &lt;MinimumSocketReceiveBufferSize&gt;10MB&lt;/MinimumSocketReceiveBufferSize&gt;
            &lt;Watermarks&gt;
                &lt;WhcHigh&gt;500kB&lt;/WhcHigh&gt;  &lt;!-- Writer history cache cap --&gt;
            &lt;/Watermarks&gt;
        &lt;/Internal&gt;
        &lt;Threads&gt;
            &lt;!-- Assign RT priority to DDS receive thread --&gt;
            &lt;Thread name="recv"&gt;
                &lt;ScheduleClass&gt;Realtime&lt;/ScheduleClass&gt;
                &lt;Priority&gt;60&lt;/Priority&gt;  &lt;!-- Below control (80) but above best-effort --&gt;
            &lt;/Thread&gt;
            &lt;Thread name="dq.builtin"&gt;
                &lt;ScheduleClass&gt;Realtime&lt;/ScheduleClass&gt;
                &lt;Priority&gt;50&lt;/Priority&gt;
            &lt;/Thread&gt;
        &lt;/Threads&gt;
    &lt;/Domain&gt;
&lt;/CycloneDDS&gt;

&lt;!-- Set before launching ROS 2 nodes: --&gt;
&lt;!-- export CYCLONEDDS_URI=file:///opt/drone/cyclonedds_rt.xml --&gt;</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.8 Containerization on Edge — Docker on Jetson Orin</h3>
    <p>Docker is the standard deployment unit for production drone software. NVIDIA's Container Toolkit (nvidia-container-toolkit, v1.14+ for JetPack 6) provides GPU passthrough to containers via cgroups v2 device access. On Jetson, the GPU and CPU share physical DRAM — the container runtime grants the container access to CUDA device files without emulation or virtualization overhead.</p>

    <h4 class="text-sky-400 mt-4 mb-2">L4T Base Image Hierarchy</h4>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">nvcr.io/nvidia/l4t-base:r36.x.x</strong>
            <p class="text-slate-300">Bare Ubuntu 22.04 + Jetson BSP libs. Use as base when you need minimal footprint. CUDA runtime not pre-installed — add manually.</p>
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
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Dockerfile · Multi-stage build — ROS 2 Humble + TensorRT 10 + ONNX Runtime on Jetson Orin (L4T r36)
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash">### Stage 1: Build TRT engine (heavy — not in final image)
FROM nvcr.io/nvidia/l4t-tensorrt:10.3.0-runtime AS trt-builder
WORKDIR /build
COPY yolo11s.onnx .
# Build INT8 engine during Docker build (hardware-specific — build ON target Jetson)
RUN python3 -c "
import tensorrt as trt
# ... build_engine('yolo11s.onnx', 'yolo11s.engine', fp16=True, int8=False)
"

### Stage 2: ROS 2 base
FROM nvcr.io/nvidia/l4t-cuda:12.6-runtime AS ros-base
ARG ROS_DISTRO=humble
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gnupg lsb-release \
    && curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \
       -o /usr/share/keyrings/ros-archive-keyring.gpg \
    && echo "deb [arch=arm64 signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] \
       http://packages.ros.org/ros2/ubuntu $(lsb_release -cs) main" \
       > /etc/apt/sources.list.d/ros2.list \
    && apt-get update && apt-get install -y --no-install-recommends \
       ros-\${ROS_DISTRO}-ros-base \
       ros-\${ROS_DISTRO}-rmw-cyclonedds-cpp \
    && rm -rf /var/lib/apt/lists/*

### Stage 3: Final runtime image
FROM ros-base AS drone-runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-onnxruntime \
    && rm -rf /var/lib/apt/lists/*

# Copy pre-built engine from Stage 1
COPY --from=trt-builder /build/yolo11s.engine /models/

# Copy ROS 2 workspace
COPY ros2_ws /ros2_ws
RUN cd /ros2_ws && . /opt/ros/humble/setup.sh && colcon build --merge-install

ENV RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
ENV CYCLONEDDS_URI=file:///config/cyclonedds_rt.xml
ENTRYPOINT ["/ros2_ws/install/setup.sh", "ros2", "launch", "drone_perception", "perception.launch.py"]</code></pre>
</details>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Bash · Running containers on Jetson with GPU + hardware device access
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># Verify NVIDIA Container Toolkit is installed (JetPack 6 ships it pre-installed)
nvidia-ctk --version    # nvidia-ctk 1.14.x

# Run with GPU access (--runtime nvidia equivalent on JetPack 6)
docker run --rm -it \
    --runtime nvidia \
    --network host \
    --privileged \           # Required for /dev/video* camera access
    -v /dev/video0:/dev/video0 \
    -v /dev/bus/usb:/dev/bus/usb \
    -v /tmp/trt_cache:/opt/drone/trt_cache \  # Persist TRT engine cache
    --memory 6g --memory-swap 6g \            # Limit RAM on 8GB Orin Nano
    --cpuset-cpus "0,1,3" \                   # Leave CPU 2 for RT control thread
    my-drone-image:latest

# Alternatively using jetson-containers autotag for dependency resolution:
jetson-containers run \
    --name perception \
    $(autotag ros:humble-ros-base-l4t-r36.2.0)</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.9 Edge Deployment Pipeline — MLflow, OTA, CI/CD</h3>
    <p>Shipping model updates to a drone in the field without physical access requires a disciplined pipeline: train → validate → package → OTA-push → canary-monitor → full rollout (or automatic rollback).</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">MLflow Model Registry</strong>
            <p class="text-slate-300 mb-2">MLflow tracks experiments, logs ONNX artifacts, and manages model lifecycle stages (Staging → Production). Each registered model version includes: ONNX file, quantization config, mAP@50 on validation set, FPS benchmark on target hardware, and git SHA.</p>
            <details class="code-expand">
    <summary>Code Example</summary>
<pre class="bg-slate-800 p-2 rounded text-[10px] text-slate-300 overflow-x-auto"><code>import mlflow
import mlflow.onnx

with mlflow.start_run():
    mlflow.log_param("quantization", "INT8-QDQ")
    mlflow.log_metric("mAP50", 0.521)
    mlflow.log_metric("fps_orin_nano", 65.2)
    mlflow.onnx.log_model(
        onnx_model, "yolo11s_int8",
        registered_model_name="drone-detector"
    )
    mlflow.register_model(
        "runs:/{run_id}/yolo11s_int8",
        "drone-detector"
    )</code></pre>
</details>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">Mender OTA — A/B Partition Updates</strong>
            <p class="text-slate-300 mb-2">Mender provides dual A/B root filesystem OTA for embedded Linux. If the new deployment fails its health check (e.g., FPS drops below threshold), Mender automatically reverts to the previous partition. The mender-artifact tool packages the model container update:</p>
            <details class="code-expand">
    <summary>Code Example</summary>
<pre class="bg-slate-800 p-2 rounded text-[10px] text-slate-300 overflow-x-auto"><code># Create a Mender artifact for model update
mender-artifact write rootfs-image \
  --type rootfs-image \
  --artifact-name drone-detector-v2.1 \
  --device-type jetson-orin-nano \
  --file drone-perception.img

# Upload to Mender server and deploy to "staging" group
mender-cli artifacts upload drone-detector-v2.1.mender
# Then promote from staging to 10% canary, monitor, then 100%</code></pre>
</details>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            YAML · GitHub Actions CI/CD — Train → Quantize → Validate → Push to Jetson
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash">## .github/workflows/deploy_model.yml  (simplified)
# name: Deploy Model to Drone Fleet
# on: push to main with changes in models/

# jobs:
#   train-and-quantize:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - name: Train YOLO11s
#         run: python train.py --epochs 100 --data drone_dataset.yaml
#       - name: Export ONNX
#         run: yolo export model=yolo11s.pt format=onnx opset=17
#       - name: Static INT8 quantization (ORT)
#         run: python quantize.py --input yolo11s.onnx --output yolo11s_qdq.onnx
#       - name: Validate mAP on test set (must be >= 0.50)
#         run: python validate.py --model yolo11s_qdq.onnx --threshold 0.50
#       - name: Register in MLflow
#         run: python register_mlflow.py --model yolo11s_qdq.onnx
#
#   build-container:
#     needs: train-and-quantize
#     runs-on: [self-hosted, jetson-orin]   # Cross-compile or build on Jetson runner
#     steps:
#       - name: Build TRT engine on target hardware
#         run: python build_trt_engine.py --onnx yolo11s_qdq.onnx --engine yolo11s.engine
#       - name: Build and push Docker image
#         run: |
#           docker build -t registry.example.com/drone-perception:$GITHUB_SHA .
#           docker push registry.example.com/drone-perception:$GITHUB_SHA
#
#   deploy-canary:
#     needs: build-container
#     steps:
#       - name: Deploy to 10% of fleet via Mender
#         run: mender-cli deploy --artifact drone-v$GITHUB_SHA --group canary
#       - name: Wait 30min and check telemetry (FPS, accuracy metrics from drone logs)
#       - name: Promote to 100% or rollback</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.10 Memory Management for Real-Time Drone Software</h3>
    <p>On Jetson Orin, the CPU and GPU share physical DRAM (unified memory architecture, or UMA). This is fundamentally different from a desktop with a discrete GPU connected over PCIe. Understanding the memory hierarchy is critical for both performance and real-time determinism.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-emerald-800">
            <strong class="text-emerald-400 block mb-2">Jetson Orin — Unified Memory Architecture</strong>
            <ul class="space-y-2 text-slate-300">
                <li><span class="text-sky-400">cudaMalloc()</span> — Allocates in GPU-accessible DRAM. CPU must use cudaMemcpy to read/write. On Jetson this is the SAME physical chip but separate virtual address spaces.</li>
                <li><span class="text-sky-400">cudaMallocManaged()</span> — Unified Memory. CPU and GPU share one pointer. CUDA 13.0 on Jetson Thor adds full UVM coherence — page faults auto-migrate data. On Orin (Ampere), migration is explicit.</li>
                <li><span class="text-sky-400">cudaHostAlloc(cudaHostAllocMapped)</span> — Page-locked CPU memory mapped to GPU. GPU accesses over NVLink-equivalent AXI bus. Zero-copy on Jetson — no PCIe transfer. <strong class="text-emerald-400">Preferred for small, frequently-read tensors on Jetson.</strong></li>
                <li><span class="text-sky-400">DMA-BUF (CUDA 13.0+)</span> — Convert CUDA buffers to dmabuf FDs. Enables zero-copy sharing with V4L2 camera drivers and display subsystem.</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-sky-800">
            <strong class="text-sky-400 block mb-2">Real-Time Memory Rules</strong>
            <ol class="space-y-2 text-slate-300 list-none">
                <li><span class="text-amber-400">Rule 1:</span> Pre-allocate all buffers at node startup. No malloc/new in the control loop hot path. Dynamic allocation causes unpredictable latency from the system allocator.</li>
                <li><span class="text-amber-400">Rule 2:</span> Use mlockall(MCL_CURRENT | MCL_FUTURE) to pin process memory. Prevents the OS from swapping pages during flight.</li>
                <li><span class="text-amber-400">Rule 3:</span> For ROS 2 intra-process: publish with std::make_unique&lt;T&gt; and subscribe with const std::unique_ptr&lt;T&gt;&amp;. ROS 2 transfers ownership without copying when both nodes are in the same process.</li>
                <li><span class="text-amber-400">Rule 4:</span> Avoid std::string construction in hot paths. Use fixed-size arrays or pre-allocated string pools.</li>
            </ol>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            C++ · ROS 2 intra-process zero-copy + mlockall for real-time drone node
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>C++ Code Example</summary>
<pre><code class="language-cpp">#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/image.hpp"
#include &lt;sys/mman.h&gt;   // mlockall
#include &lt;sched.h&gt;      // sched_setscheduler

// Call at process start — before any allocations
void configure_realtime() {
    // Lock all current and future pages to prevent swap
    if (mlockall(MCL_CURRENT | MCL_FUTURE) != 0) {
        perror("mlockall failed");
    }
    // Set SCHED_FIFO priority 80 (below sensors=95, above best-effort)
    struct sched_param sp;
    sp.sched_priority = 80;
    if (sched_setscheduler(0, SCHED_FIFO, &sp) != 0) {
        perror("sched_setscheduler failed — need CAP_SYS_NICE or root");
    }
}

class ZeroCopyCameraNode : public rclcpp::Node {
public:
    ZeroCopyCameraNode() : Node("zero_copy_camera",
        rclcpp::NodeOptions().use_intra_process_comms(true))  // Enable zero-copy IPC
    {
        // Publisher with ownership transfer semantics
        pub_ = this->create_publisher&lt;sensor_msgs::msg::Image&gt;("/camera/raw", 5);

        timer_ = this->create_wall_timer(
            std::chrono::milliseconds(33),  // 30 Hz
            [this]() {
                // Pre-allocated image buffer — reuse across frames
                auto msg = std::make_unique&lt;sensor_msgs::msg::Image&gt;();
                msg->header.stamp = this->now();
                msg->width = 640; msg->height = 480;
                msg->encoding = "rgb8";
                msg->data.resize(640 * 480 * 3);
                capture_frame(msg->data.data());  // DMA from V4L2 into pre-sized buffer

                // Move semantics: ROS 2 transfers ownership, no copy if subscriber
                // is in same process and uses const unique_ptr& callback signature
                pub_->publish(std::move(msg));
            });
    }
private:
    rclcpp::Publisher&lt;sensor_msgs::msg::Image&gt;::SharedPtr pub_;
    rclcpp::TimerBase::SharedPtr timer_;
    void capture_frame(uint8_t* buf) { /* V4L2 or MIPI camera capture */ }
};

int main(int argc, char** argv) {
    configure_realtime();
    rclcpp::init(argc, argv);
    // Use StaticSingleThreadedExecutor: zero dynamic alloc per spin
    rclcpp::executors::StaticSingleThreadedExecutor executor;
    executor.add_node(std::make_shared&lt;ZeroCopyCameraNode&gt;());
    executor.spin();
    rclcpp::shutdown();
}</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.11 Hardware-Specific Toolchains — The NPU Landscape</h3>
    <p>Not every drone runs Jetson. The NPU ecosystem has fragmented significantly in 2024–2025, with four major alternative platforms each requiring a dedicated compilation toolchain. The right choice depends on SWaP budget, required model types, and framework support.</p>

    <h4 class="text-sky-400 mt-4 mb-2">NPU Toolchain Comparison Matrix</h4>
    <div class="overflow-x-auto mb-6">
        <table class="w-full text-xs font-mono text-slate-300 border-collapse">
            <thead>
                <tr class="bg-slate-800 text-slate-400">
                    <th class="text-left p-3 border border-slate-700">Platform</th>
                    <th class="text-left p-3 border border-slate-700">Peak TOPS</th>
                    <th class="text-left p-3 border border-slate-700">Power</th>
                    <th class="text-left p-3 border border-slate-700">Compiler / SDK</th>
                    <th class="text-left p-3 border border-slate-700">Model Format</th>
                    <th class="text-left p-3 border border-slate-700">Drone Sweet Spot</th>
                </tr>
            </thead>
            <tbody>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-emerald-400">Jetson Orin Nano</td><td class="p-3 border border-slate-700">40 TOPS</td><td class="p-3 border border-slate-700">7–15W</td><td class="p-3 border border-slate-700">TensorRT 10.x + CUDA 12.x</td><td class="p-3 border border-slate-700">.engine (hardware-specific)</td><td class="p-3 border border-slate-700">Multi-model stacks, VSLAM + YOLO concurrently</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-sky-400">Qualcomm RB5 (QRB5165)</td><td class="p-3 border border-slate-700">15 TOPS</td><td class="p-3 border border-slate-700">~5W</td><td class="p-3 border border-slate-700">SNPE/QNN SDK + FastCV</td><td class="p-3 border border-slate-700">.dlc (Deep Learning Container)</td><td class="p-3 border border-slate-700">5G-connected drones, BVLOS with cellular</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-amber-400">Hailo-8 (M.2/mPCIe)</td><td class="p-3 border border-slate-700">26 TOPS</td><td class="p-3 border border-slate-700">2.5W</td><td class="p-3 border border-slate-700">Hailo Dataflow Compiler 3.30 + HailoRT</td><td class="p-3 border border-slate-700">.hef (Hailo Exec. Format)</td><td class="p-3 border border-slate-700">RPi5 or ARM SBC co-processor; ultra-low-power</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-amber-400">Hailo-8L (RPi AI Kit)</td><td class="p-3 border border-slate-700">13 TOPS</td><td class="p-3 border border-slate-700">1W</td><td class="p-3 border border-slate-700">Same DFC 3.30 toolchain</td><td class="p-3 border border-slate-700">.hef</td><td class="p-3 border border-slate-700">Micro drones (&lt;250g), RPi CM4-based flight computers</td></tr>
                <tr class="border-b border-slate-800"><td class="p-3 border border-slate-700 text-red-400">Google Coral (Edge TPU)</td><td class="p-3 border border-slate-700">4 TOPS INT8</td><td class="p-3 border border-slate-700">0.5W/TOPS</td><td class="p-3 border border-slate-700">edgetpu_compiler + PyCoral</td><td class="p-3 border border-slate-700">_edgetpu.tflite (INT8 only)</td><td class="p-3 border border-slate-700">Nano/pico drones; severely model-size limited (&lt;8MB params fit in SRAM)</td></tr>
                <tr><td class="p-3 border border-slate-700 text-purple-400">Ambarella CV5/CV3</td><td class="p-3 border border-slate-700">8–20 TOPS</td><td class="p-3 border border-slate-700">3–7W</td><td class="p-3 border border-slate-700">CVflow SDK + DeepEdge.ai</td><td class="p-3 border border-slate-700">CVflow binary</td><td class="p-3 border border-slate-700">Consumer drones with integrated ISP (DJI-class SoC design)</td></tr>
            </tbody>
        </table>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-slate-900 border border-slate-700 rounded-xl p-5 text-xs font-mono">
            <strong class="text-amber-400 block mb-3">Hailo-8 Toolchain: ONNX → HEF</strong>
            <p class="text-slate-300 mb-3">The Hailo Dataflow Compiler (DFC 3.30, 2024) takes ONNX or TF models and compiles to HEF binaries. The compiler inserts quantization and maps dataflow operations to Hailo's on-chip scratchpad memory. Unlike TensorRT, HEF files are portable across all Hailo-8 devices (architecture-level, not chip-specific).</p>
            <details class="code-expand">
    <summary>Code Example</summary>
<pre class="bg-slate-800 p-3 rounded text-[10px] text-slate-300 overflow-x-auto"><code># Install Hailo SDK (requires registration at hailo.ai)
pip install hailo-sdk-client hailo-sdk-common

# Parse ONNX model
from hailo_sdk_client import ClientRunner
runner = ClientRunner(hw_arch="hailo8")
hn, npz = runner.translate_onnx_model(
    "yolo11s.onnx",
    "yolo11s",
    start_node_names=["images"],
    end_node_names=["output0"],
    net_input_shapes={"images": [1, 3, 640, 640]}
)

# Optimize + quantize with calibration data
runner.optimize(calib_dataset)   # numpy array of 1024 calibration frames

# Compile to HEF
hef = runner.compile()
with open("yolo11s.hef", "wb") as f:
    f.write(hef)

# Runtime inference (HailoRT)
from hailo_platform import HEF, VDevice, HailoStreamInterface
hef_obj = HEF("yolo11s.hef")
with VDevice() as target:
    infer_model = target.create_infer_model(hef_obj)
    with infer_model.configure() as configured:
        bindings = configured.create_bindings()
        bindings.input().set_buffer(input_frame)
        configured.run(bindings)
        output = bindings.output().get_buffer()</code></pre>
</details>
            <p class="text-emerald-400 mt-2">YOLOv8s on Hailo-8: ~218 FPS at 2.5W (vs ~52 FPS at 10W for TRT FP16 on Orin NX). Hailo-8 wins on FPS/W; Orin wins on flexibility and concurrent workloads.</p>
        </div>

        <div class="bg-slate-900 border border-slate-700 rounded-xl p-5 text-xs font-mono">
            <strong class="text-red-400 block mb-3">Google Coral Edge TPU: TFLite INT8 → .tflite</strong>
            <p class="text-slate-300 mb-3">The Edge TPU has a 4 TOPS INT8 engine and 8 MB on-chip SRAM parameter cache. Models must be INT8 (full quantization — not just weights). The compiler maps as many ops to the Edge TPU as possible; unsupported ops fall back to CPU. Any op that runs on CPU breaks the execution pipeline — minimize CPU fallback ops.</p>
            <details class="code-expand">
    <summary>Code Example</summary>
<pre class="bg-slate-800 p-3 rounded text-[10px] text-slate-300 overflow-x-auto"><code># Step 1: Full INT8 quantization (TFLite converter)
import tensorflow as tf
converter = tf.lite.TFLiteConverter.from_saved_model("yolo_saved_model")
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.representative_dataset = representative_data_gen
converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
converter.inference_input_type  = tf.int8
converter.inference_output_type = tf.int8
tflite_model = converter.convert()
with open("yolo_int8.tflite", "wb") as f:
    f.write(tflite_model)

# Step 2: Compile for Edge TPU
# edgetpu_compiler requires x86-64 Linux
edgetpu_compiler yolo_int8.tflite -o ./compiled/
# Output: yolo_int8_edgetpu.tflite + compilation log

# Step 3: Deploy with PyCoral
from pycoral.utils import edgetpu
from pycoral.adapters import common, detect
import numpy as np

interpreter = edgetpu.make_interpreter("yolo_int8_edgetpu.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
common.set_input(interpreter, frame_rgb)
interpreter.invoke()
# 4 TOPS INT8: ~60 FPS for MobileNet-SSD, ~12 FPS for YOLOv5n at 416px</code></pre>
</details>
            <p class="text-amber-400 mt-2">Toolchain caveat (2024): edgetpu_compiler ARM64 support dropped after v2.1. Must compile on x86-64 Linux. Cross-compilation in CI via Docker is standard practice.</p>
        </div>
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded-xl p-5 text-sm mb-8">
        <strong class="text-sky-400 block mb-3">Qualcomm Flight RB5 — SNPE/QNN SDK</strong>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
            <div>
                <p class="mb-2">The QRB5165 processor (Snapdragon 865) powers the Flight RB5 platform. The AI inference stack has two layers:</p>
                <ul class="space-y-1">
                    <li><span class="text-emerald-400">SNPE (Snapdragon Neural Processing Engine):</span> Legacy SDK. Converts ONNX/TF/TFLite to .dlc format. Routes inference to Hexagon DSP (8 TOPS), Adreno 650 GPU, or Kryo CPU.</li>
                    <li><span class="text-sky-400">QNN (Qualcomm Neural Networks) SDK:</span> Modern replacement for SNPE. Per-layer backend selection. Supports INT8, FP16, INT16. Use QNN for new programs.</li>
                    <li><span class="text-amber-400">FastCV:</span> Computer vision primitives (Harris corners, optical flow, warp) optimized for Hexagon DSP. Pairs with VIO algorithms for GPS-denied navigation.</li>
                </ul>
            </div>
            <details class="code-expand">
    <summary>Code Example</summary>
<pre class="bg-slate-800 p-3 rounded text-[10px] text-slate-300 overflow-x-auto"><code># Convert ONNX to QNN context binary
# Requires Qualcomm AI Hub or on-device compilation

# Using snpe-onnx-to-dlc (SNPE SDK)
snpe-onnx-to-dlc \
  --input_network yolo11s.onnx \
  --output_path yolo11s.dlc \
  --input_dim images 1,3,640,640

# Quantize DLC to INT8
snpe-dlc-quantize \
  --input_dlc yolo11s.dlc \
  --output_dlc yolo11s_int8.dlc \
  --input_list calibration_list.txt \
  --axis_quant

# Run inference on device
snpe-net-run \
  --container yolo11s_int8.dlc \
  --input_list input_list.txt \
  --use_dsp       # Route to Hexagon DSP NPU</code></pre>
</details>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>7.12 Toolchain Selection — Decision Framework</h3>

    <div class="bg-slate-800/40 border border-sky-800/40 rounded-xl p-6 text-sm mb-8">
        <h4 class="text-sky-400 mt-0 mb-4">Practical Decision Criteria for 2024–2026 Programs</h4>
        <div class="space-y-4 text-xs font-mono text-slate-300">
            <div class="flex items-start gap-4 p-3 bg-slate-900 rounded border border-emerald-800/50">
                <span class="text-emerald-400 font-bold text-sm shrink-0">IF</span>
                <div>
                    <strong class="text-emerald-400">You need concurrent VSLAM + detection + depth estimation on a sub-5kg drone</strong>
                    <p class="text-slate-400 mt-1">→ Jetson Orin Nano (8GB) in 15W mode with Isaac ROS 3.x. Only platform with sufficient memory bandwidth to run 3 deep learning workloads simultaneously. TensorRT INT8 + NITROS zero-copy pipeline.</p>
                </div>
            </div>
            <div class="flex items-start gap-4 p-3 bg-slate-900 rounded border border-sky-800/50">
                <span class="text-sky-400 font-bold text-sm shrink-0">IF</span>
                <div>
                    <strong class="text-sky-400">You need 5G BVLOS with onboard AI at under 150g compute weight</strong>
                    <p class="text-slate-400 mt-1">→ Qualcomm Flight RB5. Integrated 5G modem, 15 TOPS, proven BVLOS MAVLink stack. Use QNN SDK for INT8 inference on Hexagon DSP.</p>
                </div>
            </div>
            <div class="flex items-start gap-4 p-3 bg-slate-900 rounded border border-amber-800/50">
                <span class="text-amber-400 font-bold text-sm shrink-0">IF</span>
                <div>
                    <strong class="text-amber-400">You need maximum inference FPS per watt for a single-model detector</strong>
                    <p class="text-slate-400 mt-1">→ Hailo-8 as co-processor on a Raspberry Pi 5 or ARM SBC. 218 FPS at 2.5W for YOLOv8s vs ~8W for equivalent Jetson. Compile with Hailo DFC 3.30. Single-model deployment only — no concurrent workloads.</p>
                </div>
            </div>
            <div class="flex items-start gap-4 p-3 bg-slate-900 rounded border border-red-800/50">
                <span class="text-red-400 font-bold text-sm shrink-0">IF</span>
                <div>
                    <strong class="text-red-400">You are building a &lt;250g micro-drone with severe SWaP constraints</strong>
                    <p class="text-slate-400 mt-1">→ Google Coral USB Accelerator or M.2 module. 4 TOPS at 0.5W/TOPS. Hard constraints: INT8 only, 8MB SRAM model size limit, must use TFLite INT8. For real-world detection: MobileNet-SSD or nano-YOLO models only.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="bg-slate-800/40 border border-slate-700 rounded-xl p-5 text-xs font-mono text-slate-400 mb-4">
        <strong class="text-slate-300 block mb-2">Version Reference (2024–2025 Stable Releases)</strong>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><div class="text-sky-400">TensorRT</div>10.15.1 (latest), 10.3.0 (JetPack 6.2)</div>
            <div><div class="text-sky-400">ONNX Runtime</div>1.22.0 (latest), 1.19.x (Jetson Zoo)</div>
            <div><div class="text-sky-400">ROS 2 Jazzy</div>May 2024, EOL May 2029</div>
            <div><div class="text-sky-400">Isaac ROS</div>3.2 (Dec 2024), 3.2 Upd.13 (2025)</div>
            <div><div class="text-sky-400">PX4</div>v1.15.x (stable), v1.16 (dev)</div>
            <div><div class="text-sky-400">MAVSDK Python</div>3.10.x (Python), 2.x (C++)</div>
            <div><div class="text-sky-400">Hailo DFC</div>3.30.0 (2024)</div>
            <div><div class="text-sky-400">JetPack</div>6.2 (L4T r36.4.3, CUDA 12.6)</div>
        </div>
    </div>
</div>
`;
