export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 6</span>
    <h2>Edge Software Toolchains</h2>
    <p>Writing code for a drone is unlike web or backend development. Memory leaks or high garbage collection pauses don't just crash an app; they crash physical hardware. This module explores the enterprise edge software stack.</p>

    <h3>6.1 TensorRT & Model Quantization</h3>
    <p>You cannot deploy a raw PyTorch <code>.pt</code> model to an edge drone and expect real-time performance. Neural networks are essentially massive arrays of 32-bit floating-point (FP32) numbers. Edge processors struggle with FP32 math. The solution is Quantization.</p>
    <p>NVIDIA TensorRT takes a trained model and optimizes it for the exact physical architecture of the GPU it is running on. It performs layer fusion and, critically, quantizes the weights from FP32 down to FP16 or INT8 (8-bit integer).</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Python: TensorRT 10.x INT8 Calibration Pipeline
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-python"># Engineers must provide a "Calibration Dataset" to TensorRT.
# When converting FP32 to INT8, precision is lost. The calibrator runs sample images
# through the network to figure out the optimal dynamic ranges for the INT8 tensors
# to minimize accuracy loss while maximizing speed (often a 300% FPS increase).

import tensorrt as trt
import pycuda.driver as cuda

class EntropyCalibrator(trt.IInt8EntropyCalibrator2):
    def __init__(self, training_data_batches, cache_file="yolo.cache"):
        trt.IInt8EntropyCalibrator2.__init__(self)
        self.batches = training_data_batches
        self.cache_file = cache_file
        # Allocate memory on GPU for calibration data
        self.device_input = cuda.mem_alloc(self.batches.nbytes)

    def get_batch(self, names):
        try:
            # Feed real images to TensorRT during build phase
            batch = next(self.batches)
            cuda.memcpy_htod(self.device_input, batch)
            return [int(self.device_input)]
        except StopIteration:
            return None

# Build engine with INT8 flag — TensorRT 10.x API
# NOTE: build_engine() is fully deprecated in TensorRT 10.x.
# Use build_serialized_network() → deserialize_cuda_engine() instead.
config.set_flag(trt.BuilderFlag.INT8)
config.int8_calibrator = EntropyCalibrator(image_batch_generator)

serialized_engine = builder.build_serialized_network(network, config)
runtime = trt.Runtime(trt.Logger(trt.Logger.WARNING))
engine = runtime.deserialize_cuda_engine(serialized_engine)
context = engine.create_execution_context()</code></pre>
        </div>
    </div>

    <h3>6.2 ROS 2 Quality of Service (QoS)</h3>
    <p>In standard TCP/IP networking, if a packet is lost, it is resent. This guarantees delivery but introduces unpredictable latency. In drone robotics, stale data is dangerous data. If an image frame is delayed by 500ms, the drone should drop it entirely and process the newest frame, rather than waiting.</p>
    <p>ROS 2 solves this via QoS profiles. For sensor data (cameras, IMU), engineers use the <strong>"Sensor Data" QoS profile</strong>: <code>Reliability = Best Effort</code>, <code>Durability = Volatile</code>, <code>Depth = 5</code>. It drops packets to prioritize lowest-latency delivery of the most recent state. (A depth of 5 is the value defined by <code>rmw_qos_profile_sensor_data</code> in the rclcpp source — not 1, which is a common misconception.)</p>

    <h3>6.3 NVIDIA Isaac ROS — Hardware-Accelerated Perception</h3>
    <p>Standard ROS 2 nodes process data on the CPU. On a Jetson Orin, this is a bottleneck: the 6-core ARM CPU is shared with the OS, ROS 2 DDS middleware, and application logic. NVIDIA Isaac ROS is a collection of drop-in ROS 2 packages that offload perception pipelines to dedicated Orin hardware accelerators: the GPU (CUDA), Vision Accelerator (PVA), and Deep Learning Accelerator (DLA). The CPU is freed for mission logic.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Bash: Installing Isaac ROS on Jetson Orin (JetPack 6.x, ROS 2 Humble)
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-bash"># Isaac ROS is distributed via apt on Jetson (not pip/colcon only).
# Requires JetPack 6.0+ (Ubuntu 22.04, CUDA 12.2, ROS 2 Humble)

sudo apt-get install -y ros-humble-isaac-ros-visual-slam
sudo apt-get install -y ros-humble-isaac-ros-apriltag
sudo apt-get install -y ros-humble-isaac-ros-object-detection

# Launch visual SLAM (replaces cpu-based ORB-SLAM3 or RTAB-Map):
# isaac_ros_visual_slam uses the Orin PVA + GPU for feature extraction.
# Publishes /visual_slam/tracking/odometry at up to 60 Hz.
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam.launch.py \\
    enable_image_denoising:=false \\
    rectified_images:=true</code></pre>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
        <div class="hw-card p-5 rounded-xl">
            <h4 class="text-white mt-0 text-base">Key Isaac ROS Packages</h4>
            <ul class="space-y-2 font-mono text-xs text-slate-300">
                <li>> <strong class="text-sky-400">isaac_ros_visual_slam:</strong> GPU-accelerated stereo VIO. Replaces CPU-based RTAB-Map. Achieves &lt;3ms latency per frame on Orin Nano vs ~40ms on CPU.</li>
                <li>> <strong class="text-sky-400">isaac_ros_apriltag:</strong> PVA-accelerated tag detection for precision landing. Processes 4K frames at 30 fps with &lt;1ms detection latency.</li>
                <li>> <strong class="text-sky-400">isaac_ros_dnn_stereo_depth:</strong> DLA-accelerated stereo depth estimation using ESS (Efficient Semi-global Stereo). Outputs dense depth maps at 30 fps.</li>
                <li>> <strong class="text-sky-400">isaac_ros_object_detection:</strong> TensorRT-backed inference node. Plug in your YOLO11 .engine file; the node handles pre/post-processing and publishes Detection2DArray.</li>
            </ul>
        </div>
        <div class="hw-card p-5 rounded-xl">
            <h4 class="text-white mt-0 text-base">Isaac Sim & Isaac Lab — Sim-to-Real Training</h4>
            <p class="text-slate-300 text-xs mb-3">NVIDIA Isaac Sim (built on Omniverse) provides photorealistic, physically accurate simulation for synthetic data generation and policy training. Isaac Lab is the reinforcement learning framework layered on top for robot skill training.</p>
            <ul class="space-y-2 font-mono text-xs text-slate-300">
                <li>> <strong class="text-amber-400">Domain Randomization:</strong> Randomize lighting (HDRIs), surface textures, object poses, and sensor noise across thousands of parallel simulation instances. Produces zero-shot sim-to-real transfer without real-world fine-tuning.</li>
                <li>> <strong class="text-amber-400">RTX Rendering:</strong> Ray-traced imagery indistinguishable from real camera feeds — critical for training visual navigation policies that generalize to real environments.</li>
                <li>> <strong class="text-amber-400">ROS 2 Bridge:</strong> Isaac Sim publishes to ROS 2 topics natively. Your drone's ROS 2 stack runs against the simulator unchanged before first hardware flight.</li>
            </ul>
        </div>
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded-xl p-5 text-sm mb-6">
        <strong class="text-sky-400 block mb-2">Isaac ROS vs. Standard ROS 2 — Latency Comparison (Jetson Orin NX 16GB)</strong>
        <table class="w-full text-xs font-mono text-slate-300">
            <thead><tr class="text-slate-400 border-b border-slate-700">
                <th class="text-left pb-2 pr-6">Task</th>
                <th class="text-left pb-2 pr-6">Standard ROS 2 (CPU)</th>
                <th class="text-left pb-2 pr-6">Isaac ROS (HW Accel.)</th>
                <th class="text-left pb-2">Accelerator</th>
            </tr></thead>
            <tbody>
                <tr class="border-b border-slate-800"><td class="py-1 pr-6">Stereo VIO (1080p @ 30fps)</td><td class="py-1 pr-6 text-amber-400">~40ms/frame</td><td class="py-1 pr-6 text-emerald-400">&lt;3ms/frame</td><td class="py-1">PVA + GPU</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-6">AprilTag detection (4K)</td><td class="py-1 pr-6 text-amber-400">~33ms/frame</td><td class="py-1 pr-6 text-emerald-400">&lt;1ms/frame</td><td class="py-1">PVA</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-6">Stereo depth (1080p)</td><td class="py-1 pr-6 text-amber-400">~120ms/frame</td><td class="py-1 pr-6 text-emerald-400">~33ms/frame</td><td class="py-1">DLA</td></tr>
                <tr><td class="py-1 pr-6">YOLO11s inference (640px)</td><td class="py-1 pr-6 text-amber-400">~55ms/frame</td><td class="py-1 pr-6 text-emerald-400">~8ms/frame</td><td class="py-1">GPU (TensorRT)</td></tr>
            </tbody>
        </table>
    </div>
</div>
`;
