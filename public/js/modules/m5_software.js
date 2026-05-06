export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 5</span>
    <h2>Edge Software Toolchains</h2>
    <p>Writing code for a drone is unlike web or backend development. Memory leaks or high garbage collection pauses don't just crash an app; they crash physical hardware. This module explores the enterprise edge software stack.</p>

    <h3>5.1 TensorRT & Model Quantization</h3>
    <p>You cannot deploy a raw PyTorch <code>.pt</code> model to an edge drone and expect real-time performance. Neural networks are essentially massive arrays of 32-bit floating-point (FP32) numbers. Edge processors struggle with FP32 math. The solution is Quantization.</p>
    <p>NVIDIA TensorRT takes a trained model and optimizes it for the exact physical architecture of the GPU it is running on. It performs layer fusion and, critically, quantizes the weights from FP32 down to FP16 or INT8 (8-bit integer).</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Python: TensorRT INT8 Calibration Pipeline
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

# Build engine with INT8 flag
config.set_flag(trt.BuilderFlag.INT8)
config.int8_calibrator = EntropyCalibrator(image_batch_generator)
engine = builder.build_engine(network, config)</code></pre>
        </div>
    </div>

    <h3>5.2 ROS 2 Quality of Service (QoS)</h3>
    <p>In standard TCP/IP networking, if a packet is lost, it is resent. This guarantees delivery but introduces unpredictable latency. In drone robotics, stale data is dangerous data. If an image frame is delayed by 500ms, the drone should drop it entirely and process the newest frame, rather than waiting.</p>
    <p>ROS 2 solves this via QoS profiles. For sensor data (cameras, IMU), engineers use the <strong>"Sensor Data" QoS profile</strong>: <code>Reliability = Best Effort</code>, <code>Durability = Volatile</code>, <code>Depth = 1</code>. It drops packets to prioritize lowest-latency delivery of the most recent state.</p>
</div>
`;
