export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 12</span>
    <h2>Depth Sensing &amp; 3D Mapping for Drone Navigation</h2>
    <p>A drone that cannot build a 3D model of its environment is blind to obstacles. This module covers the sensor physics, algorithms, and software stacks that turn raw depth measurements into navigable 3D maps — from millimeter-precision ToF chips to GPU-accelerated Gaussian Splatting reconstructions running on Jetson Orin.</p>

    <!-- Master comparison table -->
    <h3>12.0 Depth Sensing Technology Comparison</h3>
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Modality</th>
                    <th class="p-3">Range</th>
                    <th class="p-3">Resolution</th>
                    <th class="p-3">Outdoor Sun</th>
                    <th class="p-3">Low-Texture</th>
                    <th class="p-3">Weight</th>
                    <th class="p-3">Power</th>
                    <th class="p-3">Cost</th>
                    <th class="p-3">Best Drone Use</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Passive Stereo</td>
                    <td class="p-3 text-slate-300">0.2–20 m</td>
                    <td class="p-3 text-green-400">Full HD</td>
                    <td class="p-3 text-green-400">Excellent</td>
                    <td class="p-3 text-red-400">Poor</td>
                    <td class="p-3 text-slate-300">72–160 g</td>
                    <td class="p-3 text-green-400">3–10 W</td>
                    <td class="p-3 text-slate-300">$200–$2k</td>
                    <td class="p-3 text-slate-300">Outdoor obstacle avoidance, SLAM</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">Active Stereo (IR)</td>
                    <td class="p-3 text-slate-300">0.2–12 m</td>
                    <td class="p-3 text-green-400">Full HD</td>
                    <td class="p-3 text-amber-400">Degraded</td>
                    <td class="p-3 text-green-400">Good</td>
                    <td class="p-3 text-slate-300">72–100 g</td>
                    <td class="p-3 text-amber-400">5–15 W</td>
                    <td class="p-3 text-slate-300">$200–$1k</td>
                    <td class="p-3 text-slate-300">Indoor navigation, textureless surfaces</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">ToF (SPAD array)</td>
                    <td class="p-3 text-slate-300">0.02–4 m</td>
                    <td class="p-3 text-red-400">8×8–64×48</td>
                    <td class="p-3 text-amber-400">Reduced</td>
                    <td class="p-3 text-green-400">Excellent</td>
                    <td class="p-3 text-green-400">&lt;1 g</td>
                    <td class="p-3 text-green-400">65 mW</td>
                    <td class="p-3 text-green-400">&lt;$10</td>
                    <td class="p-3 text-slate-300">Precision landing, proximity alert</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">1D LiDAR Rangefinder</td>
                    <td class="p-3 text-slate-300">0.1–120 m</td>
                    <td class="p-3 text-red-400">Single point</td>
                    <td class="p-3 text-green-400">Excellent</td>
                    <td class="p-3 text-green-400">Excellent</td>
                    <td class="p-3 text-green-400">11–14 g</td>
                    <td class="p-3 text-green-400">&lt;1 W</td>
                    <td class="p-3 text-green-400">$30–$200</td>
                    <td class="p-3 text-slate-300">Terrain following, altitude hold</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">3D Solid-State LiDAR</td>
                    <td class="p-3 text-slate-300">0.1–70 m</td>
                    <td class="p-3 text-amber-400">200k pts/s</td>
                    <td class="p-3 text-green-400">Excellent</td>
                    <td class="p-3 text-green-400">Excellent</td>
                    <td class="p-3 text-amber-400">265 g</td>
                    <td class="p-3 text-amber-400">6.5 W</td>
                    <td class="p-3 text-amber-400">$500–$2k</td>
                    <td class="p-3 text-slate-300">3D SLAM, GPS-denied indoor/outdoor</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">Spinning 3D LiDAR</td>
                    <td class="p-3 text-slate-300">0.1–120 m</td>
                    <td class="p-3 text-green-400">655k–5M pts/s</td>
                    <td class="p-3 text-green-400">Excellent</td>
                    <td class="p-3 text-green-400">Excellent</td>
                    <td class="p-3 text-red-400">447 g+</td>
                    <td class="p-3 text-red-400">10–20 W</td>
                    <td class="p-3 text-red-400">$4k–$15k</td>
                    <td class="p-3 text-slate-300">Survey, high-accuracy mapping</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Monocular Depth (AI)</td>
                    <td class="p-3 text-slate-300">Relative only</td>
                    <td class="p-3 text-green-400">Full HD</td>
                    <td class="p-3 text-green-400">Good</td>
                    <td class="p-3 text-amber-400">Moderate</td>
                    <td class="p-3 text-green-400">&lt;10 g</td>
                    <td class="p-3 text-amber-400">5–15 W GPU</td>
                    <td class="p-3 text-green-400">$30–$100</td>
                    <td class="p-3 text-slate-300">Size/weight constrained platforms</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h3>12.1 Stereo Depth Estimation</h3>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-sky-400">Semi-Global Matching (SGM) Algorithm</h4>
        <p class="text-slate-300 text-sm">SGM (Hirschmüller, 2005, German Aerospace Center) is the dominant classical stereo algorithm for real-time depth estimation. It produces dense disparity maps by combining a pixelwise matching cost with a path-based regularization over multiple scan directions.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Algorithm steps:</strong></p>
        <ol class="text-slate-300 text-sm list-decimal pl-5 space-y-1 mt-1">
            <li><strong>Image rectification:</strong> Stereo pair is warped so epipolar lines are horizontal rows. A pixel at (u, v) in the left image can only match pixels at (u-d, v) in the right image for some disparity d &gt; 0.</li>
            <li><strong>Cost volume computation:</strong> For each pixel (u,v) and each candidate disparity d in [0, D_max], compute a matching cost C(u,v,d) using Census transform or mutual information over a small support window.</li>
            <li><strong>Path-based cost aggregation:</strong> For each of 8 (or 16) directions r, run 1D dynamic programming along each scanline path:
                <br><code class="text-xs text-green-400">L_r(p,d) = C(p,d) + min(L_r(p-r, d), L_r(p-r, d±1)+P1, min_k L_r(p-r,k)+P2)</code>
                <br>P1 penalizes single-disparity changes (small slopes). P2 penalizes larger jumps (depth discontinuities). Aggregated cost: S(p,d) = sum over all directions r of L_r(p,d).</li>
            <li><strong>Disparity selection:</strong> Winner-Take-All: d*(p) = argmin_d S(p,d). Sub-pixel refinement via parabola fit gives disparity to 0.5-pixel precision.</li>
            <li><strong>Post-processing:</strong> Left-right consistency check (mark pixels as invalid where |d_left - d_right| &gt; 1). Median filter. Hole-filling via weighted median of valid neighbors.</li>
        </ol>
        <p class="text-slate-300 text-sm mt-2"><strong>Computational cost:</strong> O(W × H × D_max × num_directions). At 1280x720 with D_max=128 and 8 directions, this is ~940M operations per frame. Requires GPU (CUDA SGBM via OpenCV) or FPGA/ASIC (Intel RealSense D400 onboard ASIC) for real-time. On CPU: 5–15 fps. On GPU: 30+ fps.</p>
    </div>

    <!-- Stereo camera comparison table -->
    <h4 class="text-white font-bold mt-6 mb-3">Stereo Camera Comparison (2026)</h4>
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Camera</th>
                    <th class="p-3">Baseline</th>
                    <th class="p-3">Depth Range</th>
                    <th class="p-3">Resolution / FPS</th>
                    <th class="p-3">Shutter</th>
                    <th class="p-3">Onboard AI</th>
                    <th class="p-3">Interface</th>
                    <th class="p-3">IP Rating</th>
                    <th class="p-3">Weight</th>
                    <th class="p-3">Best For</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono text-xs">Intel RealSense D435i</td>
                    <td class="p-3 text-slate-300">50 mm</td>
                    <td class="p-3 text-slate-300">0.2–10 m (effective ~5 m)</td>
                    <td class="p-3 text-slate-300">1280×720 @30 fps; 640×480 @90 fps</td>
                    <td class="p-3 text-slate-300">Global (stereo) + Rolling (RGB)</td>
                    <td class="p-3 text-slate-300">D4 ASIC (SGM only)</td>
                    <td class="p-3 text-slate-300">USB 3.1</td>
                    <td class="p-3 text-red-400">None</td>
                    <td class="p-3 text-slate-300">72 g</td>
                    <td class="p-3 text-slate-300">Indoor, short-range obstacle avoidance</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-mono text-xs">Intel RealSense D457</td>
                    <td class="p-3 text-slate-300">95 mm</td>
                    <td class="p-3 text-slate-300">0.6–6 m, Z-accuracy ±2% @4 m</td>
                    <td class="p-3 text-slate-300">1280×800 @30 fps</td>
                    <td class="p-3 text-slate-300">Global shutter</td>
                    <td class="p-3 text-slate-300">D4 ASIC</td>
                    <td class="p-3 text-slate-300">USB-C / GMSL</td>
                    <td class="p-3 text-red-400">None</td>
                    <td class="p-3 text-slate-300">75 g</td>
                    <td class="p-3 text-slate-300">Industrial robots, global-shutter motion</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono text-xs">Luxonis OAK-D S2</td>
                    <td class="p-3 text-slate-300">75 mm</td>
                    <td class="p-3 text-slate-300">0.2–35 m (active IR)</td>
                    <td class="p-3 text-slate-300">1280×800 @60 fps; 12 MP RGB</td>
                    <td class="p-3 text-slate-300">Global (stereo)</td>
                    <td class="p-3 text-green-400">RVC2 MyriadX 4 TOPS INT8</td>
                    <td class="p-3 text-slate-300">USB 3.1 / PoE</td>
                    <td class="p-3 text-red-400">None</td>
                    <td class="p-3 text-slate-300">~65 g</td>
                    <td class="p-3 text-slate-300">Edge AI + depth, indoor/outdoor</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-mono text-xs">Stereolabs ZED 2i</td>
                    <td class="p-3 text-slate-300">120 mm</td>
                    <td class="p-3 text-slate-300">0.2–20 m</td>
                    <td class="p-3 text-slate-300">1920×1080 @30 fps per eye</td>
                    <td class="p-3 text-slate-300">Rolling</td>
                    <td class="p-3 text-amber-400">Neural depth on host GPU</td>
                    <td class="p-3 text-slate-300">USB 3.1</td>
                    <td class="p-3 text-green-400">IP66</td>
                    <td class="p-3 text-slate-300">~159 g</td>
                    <td class="p-3 text-slate-300">Outdoor drone, 20 m range, IP66</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono text-xs">Stereolabs ZED X</td>
                    <td class="p-3 text-slate-300">120 mm</td>
                    <td class="p-3 text-slate-300">0.3–20 m (2 mm lens) / 1–35 m (4 mm)</td>
                    <td class="p-3 text-slate-300">1920×1200 @60 fps per eye</td>
                    <td class="p-3 text-green-400">Global shutter</td>
                    <td class="p-3 text-amber-400">Neural depth on host GPU</td>
                    <td class="p-3 text-slate-300">GMSL2 (15 m cable)</td>
                    <td class="p-3 text-green-400">IP67</td>
                    <td class="p-3 text-slate-300">~145 g</td>
                    <td class="p-3 text-slate-300">High-speed flight, long-range, IP67</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Intel RealSense D435i &amp; D457 — Key Differences</h4>
            <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                <li><strong>D435i:</strong> 50 mm baseline, 0.2–10 m, BMI055 6-DoF IMU, rolling-shutter RGB at 1920×1080. The workhorse for indoor/short-range use. <code>pyrealsense2</code> SDK.</li>
                <li><strong>D457:</strong> 95 mm baseline (wider → better accuracy at distance), global-shutter stereo, 0.6–6 m optimal range with ±2% Z-accuracy at 4 m. Designed for industrial/robotic use where motion blur matters.</li>
                <li><strong>D400 ASIC:</strong> Both use the dedicated Intel D4 stereo processor — runs SGM onboard at 30 fps without host CPU cycles. Host receives <code>sensor_msgs/Image</code> Z16 depth frames over USB.</li>
                <li><strong>Limitation:</strong> IR projector saturates outdoors (&gt;70 klux). Use passive stereo (ZED/OAK) for outdoor sun.</li>
                <li><strong>Python SDK:</strong> <code>pyrealsense2</code>. Key classes: <code>rs.pipeline</code>, <code>rs.config</code>, <code>rs.align</code>, <code>rs.pointcloud</code>.</li>
            </ul>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Luxonis OAK-D S2 — Edge AI + Depth</h4>
            <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                <li><strong>Stereo baseline:</strong> 75 mm; active stereo IR dot projector for low-texture surfaces (walls, floors). Depth range 0.2–35 m active / 0.3–12 m passive.</li>
                <li><strong>Onboard VPU:</strong> RVC2 (Intel MyriadX) — 4 TOPS INT8 total (1.4 TOPS dedicated AI). Runs YOLOv5n/MobileNet class models <em>on the camera</em> without host CPU.</li>
                <li><strong>RGB:</strong> 12 MP IMX378 with auto-focus or fixed-focus variant. Stereo cams: OV9782 1280×800 global shutter.</li>
                <li><strong>Pipeline SDK:</strong> DepthAI. Define nodes (MonoCamera → StereoDepth → NeuralNetwork), link them, device executes graph. Fuses depth + AI detection in one pass.</li>
                <li><strong>S2 vs OAK-D Pro:</strong> S2 is ~20% lighter (chip-down RVC2 design), same VPU. OAK-D Pro adds dot projector; S2 PoE adds Power-over-Ethernet.</li>
                <li><strong>ROS 2:</strong> <code>depthai-ros</code> package publishes <code>sensor_msgs/Image</code> depth and <code>sensor_msgs/CameraInfo</code>.</li>
            </ul>
        </div>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400 text-sm">Stereolabs ZED 2i &amp; ZED X — Long-Range Outdoor Stereo</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
                <p class="text-slate-400 text-xs font-semibold mb-1">ZED 2i (USB 3.1, outdoor-ruggedized)</p>
                <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                    <li><strong>Baseline:</strong> 120 mm; depth 0.2–20 m. Passive stereo — no IR projector overwhelmed by sunlight. Works to full range in direct sun.</li>
                    <li><strong>Sensors:</strong> Dual 1920×1080 rolling-shutter at 30 fps per eye; 9-DoF IMU (accel + gyro + baro + magnetometer).</li>
                    <li><strong>IP66</strong> + circular polarizing filter to reduce sky glare. Vibration-hardened enclosure.</li>
                    <li><strong>Neural depth:</strong> ZED SDK runs neural stereo on host Jetson GPU. Outperforms SGM on low-texture outdoor surfaces (tarmac, concrete, water).</li>
                    <li><strong>vs D435i:</strong> 20 m vs ~5 m range; IP66 vs unrated; passive sun-proof; 159 g vs 72 g.</li>
                </ul>
            </div>
            <div>
                <p class="text-slate-400 text-xs font-semibold mb-1">ZED X (GMSL2, global shutter)</p>
                <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                    <li><strong>Sensors:</strong> Dual 1920×1200 global shutter — eliminates rolling-shutter skew during fast flight or vibration.</li>
                    <li><strong>Depth:</strong> 0.3–20 m (2 mm lens) / 1–35 m (4 mm lens). Object detection range: 0.08–12.5 m.</li>
                    <li><strong>Frame rate:</strong> 60 fps; GMSL2 interface runs up to 15 m cable to Jetson Orin (lower latency and EMI resistance vs USB).</li>
                    <li><strong>IP67;</strong> 3.0 µm pixel for low-light and bright conditions. Native multi-camera synchronization.</li>
                    <li><strong>Best for:</strong> High-speed platforms (global shutter prevents motion blur), 35 m long-range avoidance with 4 mm lens, multi-camera setups.</li>
                </ul>
            </div>
        </div>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-amber-400 text-sm">Learning-Based Stereo: RAFT-Stereo &amp; Unimatch</h4>
        <p class="text-slate-300 text-sm">Classical SGM fails on low-texture surfaces (white walls, tarmac, water) and in high-dynamic-range lighting. Neural stereo networks learn from large synthetic datasets and generalize to conditions that defeat SGM.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
                <p class="text-slate-400 text-xs font-semibold mb-1">RAFT-Stereo</p>
                <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                    <li><strong>Architecture:</strong> Multi-level convolutional GRUs iteratively refine a disparity field (adapted from RAFT optical flow backbone).</li>
                    <li><strong>Speed:</strong> 5–26 FPS at KITTI resolution; ~15 FPS on Jetson AGX Orin with FP16 TensorRT export.</li>
                    <li><strong>Accuracy:</strong> 5.91% D1 on KITTI 2015; #1 on Middlebury and ETH3D two-view benchmarks; ~30% lower D1 error vs SGM.</li>
                </ul>
            </div>
            <div>
                <p class="text-slate-400 text-xs font-semibold mb-1">Unimatch (Google Research, 2023)</p>
                <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                    <li><strong>Design:</strong> Single unified model for optical flow, stereo, and monocular depth — shared weights across three tasks.</li>
                    <li><strong>Speed:</strong> 2.3× faster than RAFT-Stereo on A100; state-of-the-art on 10 benchmarks simultaneously.</li>
                    <li><strong>Practical value:</strong> Replaces three separate inference models with one — lower memory footprint for drone companion computers.</li>
                </ul>
            </div>
        </div>
        <p class="text-slate-400 text-xs mt-3"><strong>Hardware requirement:</strong> Neural stereo needs a GPU (Jetson Orin NX 16 GB or better for real-time). Classical SGM runs on CPU. Choose neural stereo when depth quality on difficult surfaces outweighs compute cost.</p>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: RealSense D435i — Capture Aligned Depth + Color Frames</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import pyrealsense2 as rs
import numpy as np

pipeline = rs.pipeline()
config = rs.config()

# Enable color (1280x720) and depth (1280x720) streams
config.enable_stream(rs.stream.color, 1280, 720, rs.format.bgr8, 30)
config.enable_stream(rs.stream.depth, 1280, 720, rs.format.z16, 30)

profile = pipeline.start(config)

# Get depth scale: converts raw uint16 values to meters
depth_sensor = profile.get_device().first_depth_sensor()
depth_scale = depth_sensor.get_depth_scale()  # typically 0.001 (1mm per unit)

# Align depth to color frame
align = rs.align(rs.stream.color)

try:
    while True:
        frames = pipeline.wait_for_frames(timeout_ms=5000)
        aligned = align.process(frames)

        color_frame = aligned.get_color_frame()
        depth_frame = aligned.get_depth_frame()

        color_image = np.asanyarray(color_frame.get_data())
        depth_image = np.asanyarray(depth_frame.get_data())

        # depth_image is uint16 in depth_scale units (usually mm)
        depth_meters = depth_image * depth_scale  # float32 array, meters

        # Get depth at a specific pixel (u, v):
        u, v = 640, 360  # center pixel
        d = depth_frame.get_distance(u, v)  # returns float in meters

finally:
    pipeline.stop()</code></pre>
</details>
        </div>
    </div>

    <h3>12.2 Time-of-Flight (ToF) Sensors</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">ST VL53L5CX — 8×8 Multi-Zone ToF</h4>
            <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                <li><strong>Sensing matrix:</strong> 8×8 zones = 64 independent ranging measurements per frame. Each zone subtends ~6.6° (45° diagonal FoV total).</li>
                <li><strong>Frame rate:</strong> Up to 60 Hz (at 4×4 resolution); 15 Hz at full 8×8.</li>
                <li><strong>Range:</strong> 2 cm – 400 cm (4 m). Optimal accuracy 2 cm – 200 cm; ±15 mm below 200 cm.</li>
                <li><strong>Technology:</strong> SPAD (Single-Photon Avalanche Diode) array with direct ToF (dToF) — measures individual photon arrival times, not phase shift.</li>
                <li><strong>Interface:</strong> I2C (up to 1 MHz); also SPI. Address configurable.</li>
                <li><strong>Power:</strong> 65 mW active; 4.8 mW LP idle. Package: 6.4×3.4×1.5 mm LGA — fits on flight controller breakout boards.</li>
                <li><strong>Drone use:</strong> Downward-facing precision landing (8×8 maps the ground terrain), forward-facing close proximity, ceiling detection for indoor altitude hold.</li>
                <li><strong>Multi-path error:</strong> Corners and reflective surfaces (water, glass, polished concrete) cause phantom returns. Mitigate with <code>XTalk</code> calibration in ST's driver.</li>
                <li><strong>ArduPilot:</strong> <code>RNGFND1_TYPE = 25</code> (VL53L5X over I2C); <code>RNGFND1_ORIENT = 25</code> (downward).</li>
            </ul>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Benewake TFmini Plus &amp; Garmin LIDAR-Lite v4</h4>
            <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                <li><strong>TFmini Plus:</strong> Single-point ToF LiDAR, 0.1–12 m indoor (7 m outdoor). Range resolution 5 mm. FOV 3.6°. Frame rate up to 1000 Hz. IP65 dust/water resistant. 11 g, 35×18.5×21 mm. UART + I2C. 5 V, 0.6 W. ArduPilot: <code>RNGFND_TYPE = 20</code>.</li>
                <li><strong>Garmin LIDAR-Lite v4 LED:</strong> 5 cm – 10 m, 1 cm resolution, 14.6 g, I2C + ANT wireless. 85 mA draw. Ultra-compact for nano/micro drones. ArduPilot: <code>RNGFND_TYPE = 15</code>.</li>
                <li><strong>Sensor fusion rule:</strong> VL53L5CX (close-range 0–4 m, 8×8 map) + TFmini Plus (single-point up to 12 m, 1000 Hz) is a common dual-altitude-sensor pairing: VL53L5CX for precision landing flare, TFmini for terrain-following above 4 m.</li>
            </ul>
            <div class="overflow-x-auto mt-3">
                <table class="w-full text-xs text-slate-300">
                    <thead><tr class="text-sky-400 border-b border-slate-700">
                        <th class="text-left py-1 pr-3">Property</th>
                        <th class="text-left py-1 pr-3">ToF (VL53L5CX)</th>
                        <th class="text-left py-1">Passive Stereo</th>
                    </tr></thead>
                    <tbody>
                        <tr class="border-b border-slate-800"><td class="py-1 pr-3">Low-texture surfaces</td><td class="py-1 pr-3 text-green-400">Works well</td><td class="py-1 text-red-400">Fails</td></tr>
                        <tr class="border-b border-slate-800"><td class="py-1 pr-3">Outdoor sunlight</td><td class="py-1 pr-3 text-amber-400">Reduced range</td><td class="py-1 text-green-400">Works well</td></tr>
                        <tr class="border-b border-slate-800"><td class="py-1 pr-3">Spatial resolution</td><td class="py-1 pr-3 text-red-400">8×8 zones</td><td class="py-1 text-green-400">Full image</td></tr>
                        <tr class="border-b border-slate-800"><td class="py-1 pr-3">Multi-path error</td><td class="py-1 pr-3 text-red-400">Significant</td><td class="py-1 text-green-400">None</td></tr>
                        <tr><td class="py-1 pr-3">Active power</td><td class="py-1 pr-3 text-green-400">65 mW</td><td class="py-1 text-red-400">5–10 W</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <h3>12.3 LiDAR for Drones</h3>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-white text-sm">LiDAR Sensor Comparison Matrix (2026)</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-slate-300 mt-2">
                <thead>
                    <tr class="bg-slate-700 text-slate-300">
                        <th class="p-3">Sensor</th>
                        <th class="p-3">Type</th>
                        <th class="p-3">Range</th>
                        <th class="p-3">Points/s</th>
                        <th class="p-3">FOV (V×H)</th>
                        <th class="p-3">Interface</th>
                        <th class="p-3">Weight</th>
                        <th class="p-3">Power</th>
                        <th class="p-3">IP</th>
                        <th class="p-3">Best For</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-700">
                    <tr class="bg-slate-800">
                        <td class="p-3 font-mono">Benewake TFmini Plus</td>
                        <td class="p-3">1D single-point</td>
                        <td class="p-3">0.1–12 m</td>
                        <td class="p-3">1 pt @1000 Hz</td>
                        <td class="p-3">3.6° circle</td>
                        <td class="p-3">UART/I2C</td>
                        <td class="p-3">11 g</td>
                        <td class="p-3">0.6 W</td>
                        <td class="p-3">IP65</td>
                        <td class="p-3">Terrain follow, altitude hold, landing</td>
                    </tr>
                    <tr class="bg-slate-900">
                        <td class="p-3 font-mono">Garmin LIDAR-Lite v4</td>
                        <td class="p-3">1D single-point</td>
                        <td class="p-3">0.05–10 m</td>
                        <td class="p-3">1 pt @500 Hz</td>
                        <td class="p-3">~1° circle</td>
                        <td class="p-3">I2C + ANT</td>
                        <td class="p-3">14.6 g</td>
                        <td class="p-3">0.4 W</td>
                        <td class="p-3">None</td>
                        <td class="p-3">Nano/micro drones, precision alt</td>
                    </tr>
                    <tr class="bg-slate-800">
                        <td class="p-3 font-mono">Livox Mid-360</td>
                        <td class="p-3">3D solid-state (non-repetitive)</td>
                        <td class="p-3">40 m @10% / 70 m @80%</td>
                        <td class="p-3">200,000</td>
                        <td class="p-3">59°×360°</td>
                        <td class="p-3">100BASE-T Ethernet</td>
                        <td class="p-3">265 g</td>
                        <td class="p-3">6.5 W avg</td>
                        <td class="p-3">IP67</td>
                        <td class="p-3">3D SLAM (FAST-LIO2), best entry 3D</td>
                    </tr>
                    <tr class="bg-slate-900">
                        <td class="p-3 font-mono">Hesai XT-16</td>
                        <td class="p-3">3D mechanical, 16-beam</td>
                        <td class="p-3">120 m @10%</td>
                        <td class="p-3">320,000</td>
                        <td class="p-3">30°×360°</td>
                        <td class="p-3">Ethernet</td>
                        <td class="p-3">~530 g</td>
                        <td class="p-3">~10 W</td>
                        <td class="p-3">IP67</td>
                        <td class="p-3">Long-range survey, outdoor mapping</td>
                    </tr>
                    <tr class="bg-slate-800">
                        <td class="p-3 font-mono">Ouster OS0-32</td>
                        <td class="p-3">3D mechanical, 32-beam</td>
                        <td class="p-3">50 m @10% / 65 m @80%</td>
                        <td class="p-3">655,360</td>
                        <td class="p-3">90°×360°</td>
                        <td class="p-3">Ethernet</td>
                        <td class="p-3">447 g</td>
                        <td class="p-3">~14 W</td>
                        <td class="p-3">IP67</td>
                        <td class="p-3">Dense 3D survey; ultra-wide 90° V-FOV ideal for drones</td>
                    </tr>
                    <tr class="bg-slate-900">
                        <td class="p-3 font-mono">Ouster OS0-64</td>
                        <td class="p-3">3D mechanical, 64-beam</td>
                        <td class="p-3">35 m @10% / 50 m @80%</td>
                        <td class="p-3">1,310,720</td>
                        <td class="p-3">90°×360°</td>
                        <td class="p-3">Ethernet</td>
                        <td class="p-3">447 g</td>
                        <td class="p-3">~14 W</td>
                        <td class="p-3">IP67</td>
                        <td class="p-3">High-density inspection, wire detection</td>
                    </tr>
                    <tr class="bg-slate-800">
                        <td class="p-3 font-mono">DJI Zenmuse L2</td>
                        <td class="p-3">3D mechanical, 5-return</td>
                        <td class="p-3">450 m @50%</td>
                        <td class="p-3">1,200,000</td>
                        <td class="p-3">75°×360°</td>
                        <td class="p-3">DJI payload bus</td>
                        <td class="p-3">905 g</td>
                        <td class="p-3">~30 W</td>
                        <td class="p-3">IP54</td>
                        <td class="p-3">Enterprise survey, ±4 cm @150 m</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-amber-400 text-sm">Livox Mid-360: Non-Repetitive Scan Pattern &amp; Mid-360S (2024)</h4>
        <p class="text-slate-300 text-sm">Unlike conventional spinning LiDARs that trace the same circle each revolution (creating periodic blind spots between beams), the Livox Mid-360 uses a non-repetitive Lissajous scan pattern. Each 100 ms integration window produces a different point distribution. After 1 second, point cloud density approaches full coverage of the 360°×59° FOV — the opposite of spinning LiDAR behavior, rewarding dwell time with density rather than speed.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Mid-360S (2024 successor):</strong> Updated hardware with improved range precision (≤2 cm at 10 m) and enhanced reliability. Same mechanical dimensions (65×65×60 mm) and IP67 rating. Drop-in replacement in existing drone frames. The ROS 2 driver publishes <code>sensor_msgs/PointCloud2</code> on <code>/livox/lidar</code>; time-stamped per-point data allows motion de-skewing in FAST-LIO2.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Why it dominates drone SLAM:</strong> 265 g weight, 6.5 W average power, 360° horizontal coverage, and native support in FAST-LIO2 for non-repetitive scan patterns make it the de facto standard for sub-2 kg autonomous drone LiDAR SLAM builds through 2026.</p>
    </div>

    <!-- YouTube: FAST-LIO2 on UAV -->
    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Video: FAST-LIO2 on a UAV in Gazebo Simulation</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/emiSJMcA8yM" title="FAST-LIO2 on the UAV in Gazebo simulation, narrow tunnels" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-gray-400 text-sm text-center mt-2">FAST-LIO2 LiDAR-inertial SLAM running on a drone through narrow tunnels in Gazebo simulation — demonstrating the ikd-Tree map updates and real-time pose estimation.</p>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">ROS 2: sensor_msgs/PointCloud2 Message Structure</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python"># PointCloud2 wire format:
# header:
#   stamp: builtin_interfaces/Time
#   frame_id: string (e.g. "lidar_link", "camera_depth_optical_frame")
# height: 1                    # Unorganized cloud (height=1, width=N)
# width: N                     # Total number of points
# fields: [PointField...]       # Describes each per-point channel:
#   - name: "x", offset: 0,  datatype: FLOAT32 (7), count: 1
#   - name: "y", offset: 4,  datatype: FLOAT32 (7), count: 1
#   - name: "z", offset: 8,  datatype: FLOAT32 (7), count: 1
#   - name: "intensity", offset: 12, datatype: FLOAT32 (7), count: 1
# is_bigendian: False
# point_step: 16               # Bytes per point (4 fields * 4 bytes each)
# row_step: N * 16             # Bytes per row
# data: bytes                  # Raw binary blob
# is_dense: False              # False if NaN/Inf points may be present

import numpy as np
import sensor_msgs_py.point_cloud2 as pc2

def cloud_callback(msg):
    points = list(pc2.read_points(msg, field_names=("x","y","z"), skip_nans=True))
    arr = np.array(points, dtype=np.float32)  # Shape: (N, 3)</code></pre>
</details>
        </div>
    </div>

    <h3>12.4 SLAM Algorithms for Drone Navigation</h3>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400">LiDAR-Inertial SLAM: FAST-LIO2, LIO-SAM &amp; KISS-ICP</h4>
        <p class="text-slate-300 text-sm">When GPS is denied or unreliable (indoor, urban canyon, jamming), LiDAR-inertial SLAM provides drift-resistant odometry by tightly fusing raw LiDAR scans with IMU preintegration. Three dominant systems for drone use as of 2026:</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 mb-4">
            <div>
                <p class="text-slate-400 text-xs font-semibold mb-1">FAST-LIO2 (HKU MARS Lab)</p>
                <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                    <li><strong>Algorithm:</strong> Iterated Extended Kalman Filter (iEKF) fusing raw LiDAR points + IMU. No feature extraction step — reduces compute and latency.</li>
                    <li><strong>Key data structure:</strong> ikd-Tree (incremental k-d tree) — O(log N) map updates at sensor rate, enabling 100+ Hz throughput.</li>
                    <li><strong>Processing rate:</strong> 100+ Hz on Intel i7-8550U; validated on Jetson TX2, Orin NX, Pi 4B 8 GB.</li>
                    <li><strong>LiDAR support:</strong> Spinning (Velodyne, Ouster) + solid-state (Livox Avia, Mid-70, Mid-360) — non-repetitive scans handled natively.</li>
                    <li><strong>Drift:</strong> &lt;1% on 1–2 km sequences (ULHK, NCLT).</li>
                    <li><strong>Loop closure:</strong> None. Combine with Scan Context for loop closure.</li>
                    <li><strong>ROS 2:</strong> <code>hku-mars/FAST_LIO</code> ros2 branch.</li>
                </ul>
            </div>
            <div>
                <p class="text-slate-400 text-xs font-semibold mb-1">LIO-SAM (MIT SPARK Lab)</p>
                <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                    <li><strong>Algorithm:</strong> Factor graph (GTSAM) with IMU preintegration + LiDAR odometry + optional GPS + loop closure factors.</li>
                    <li><strong>Loop closure:</strong> Scan Context place recognition — corrects drift when revisiting areas. GPS factor fuses GNSS when available.</li>
                    <li><strong>LiDAR:</strong> Mechanical spinning with per-point timestamps for motion de-skewing (Ouster, Velodyne, Hesai). Not natively solid-state.</li>
                    <li><strong>IMU:</strong> Requires 9-axis (magnetometer for yaw init).</li>
                    <li><strong>Best for:</strong> Long survey missions that revisit areas; GPS-denied building interiors with return paths.</li>
                    <li><strong>ROS 2:</strong> <code>TixiaoShan/LIO-SAM</code> ros2 branch.</li>
                </ul>
            </div>
            <div>
                <p class="text-slate-400 text-xs font-semibold mb-1">KISS-ICP (Stachniss Lab, 2022–2024)</p>
                <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                    <li><strong>Philosophy:</strong> "Keep It Small and Simple" — point-to-point ICP with adaptive thresholding, robust kernels, and motion compensation. Single parameter set across all environments and sensor types.</li>
                    <li><strong>Speed:</strong> Faster than sensor frame rate on CPU alone. No GPU required.</li>
                    <li><strong>Accuracy:</strong> Competitive with FAST-LIO2 on many datasets with zero tuning — evaluated on KITTI, MulRan, Hilti, Apollo.</li>
                    <li><strong>KISS-SLAM (2025 successor):</strong> Adds loop closure, local mapping, and pose graph optimization while maintaining simplicity.</li>
                    <li><strong>ROS 2:</strong> <code>PRBonn/kiss-icp</code> — pip installable, ROS 2 node included.</li>
                </ul>
            </div>
        </div>
    </div>

    <figure class="my-6">
        <img src="images/m12_fastlio2_system.png" alt="FAST-LIO2 system overview diagram showing iEKF + ikd-Tree architecture" class="rounded-lg w-full bg-white p-3 object-contain">
        <figcaption class="text-gray-400 text-sm text-center mt-2">FAST-LIO2 system overview: iterated Extended Kalman Filter fusing LiDAR and IMU measurements with the incremental ikd-Tree map structure. Source: <a href="https://arxiv.org/abs/2107.06829" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">arXiv:2107.06829</a></figcaption>
    </figure>

    <!-- SLAM comparison table -->
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Property</th>
                    <th class="p-3">FAST-LIO2</th>
                    <th class="p-3">LIO-SAM</th>
                    <th class="p-3">KISS-ICP</th>
                    <th class="p-3">ORB-SLAM3</th>
                    <th class="p-3">RTAB-Map</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">Sensor</td>
                    <td class="p-3 text-slate-300">LiDAR + IMU</td>
                    <td class="p-3 text-slate-300">LiDAR + IMU + GPS</td>
                    <td class="p-3 text-slate-300">LiDAR only</td>
                    <td class="p-3 text-slate-300">Mono/Stereo/RGB-D + IMU</td>
                    <td class="p-3 text-slate-300">Stereo/RGB-D/LiDAR</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">Loop closure</td>
                    <td class="p-3 text-red-400">None (odometry only)</td>
                    <td class="p-3 text-green-400">Yes (Scan Context)</td>
                    <td class="p-3 text-red-400">None (KISS-ICP); Yes (KISS-SLAM)</td>
                    <td class="p-3 text-green-400">Yes (BoW)</td>
                    <td class="p-3 text-green-400">Yes (BoW)</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">Solid-state LiDAR</td>
                    <td class="p-3 text-green-400">Yes (Livox native)</td>
                    <td class="p-3 text-red-400">No</td>
                    <td class="p-3 text-green-400">Yes</td>
                    <td class="p-3 text-slate-400">N/A</td>
                    <td class="p-3 text-green-400">Yes</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">CPU load</td>
                    <td class="p-3 text-green-400">Low (100 Hz on i7)</td>
                    <td class="p-3 text-amber-400">Moderate</td>
                    <td class="p-3 text-green-400">Very low (no GPU)</td>
                    <td class="p-3 text-amber-400">Moderate</td>
                    <td class="p-3 text-red-400">High (visual loop)</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">GPS-denied accuracy</td>
                    <td class="p-3 text-green-400">&lt;1% drift/km</td>
                    <td class="p-3 text-green-400">&lt;1% + GPS fusion</td>
                    <td class="p-3 text-green-400">Competitive, no tuning</td>
                    <td class="p-3 text-amber-400">3.5 cm RMS (EuRoC)</td>
                    <td class="p-3 text-amber-400">Good indoors</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">Ideal use case</td>
                    <td class="p-3 text-slate-300">Real-time flight, Livox solid-state</td>
                    <td class="p-3 text-slate-300">Long survey + GPS + revisit</td>
                    <td class="p-3 text-slate-300">Quick deploy, any LiDAR, no tuning</td>
                    <td class="p-3 text-slate-300">Camera-only platforms</td>
                    <td class="p-3 text-slate-300">Indoor RGB-D + visual features</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-amber-400 text-sm">ORB-SLAM3 — Visual and Visual-Inertial SLAM</h4>
        <p class="text-slate-300 text-sm">ORB-SLAM3 (University of Zaragoza, 2020, IEEE TRO 2021) is the first system supporting visual, visual-inertial, and multi-map SLAM with monocular, stereo, and RGB-D cameras using pin-hole and fisheye models. It introduced <strong>Atlas</strong> — a multi-map representation that survives long periods of poor visual information (dark tunnels, featureless corridors) by activating new sub-maps and merging them on revisit.</p>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mt-2">
            <li><strong>Stereo-inertial accuracy:</strong> 3.5 cm average on EuRoC drone dataset; 9 mm on TUM-VI fast hand-held motions.</li>
            <li><strong>2× to 10× more accurate</strong> than previous visual-inertial approaches on EuRoC/TUM-VI benchmarks.</li>
            <li><strong>Drone use:</strong> Camera-only platforms where LiDAR weight is prohibitive. A single global-shutter stereo pair + IMU delivers sub-5 cm accuracy indoors.</li>
            <li><strong>2024 activity:</strong> Actively extended with monocular deep-depth fusion (replacing feature-based depth with learned depth on a Tello drone), indoor navigation with INS, and integration with 3DGS backends.</li>
            <li><strong>Limitation:</strong> Fails in textureless/dark scenes. Requires feature-rich environment. No built-in loop closure for purely dark or featureless corridors (Atlas mitigates but does not eliminate).</li>
            <li><strong>ROS 2:</strong> Community ports available; official ROS-agnostic C++ library with ROS 2 wrappers.</li>
        </ul>
    </div>

    <!-- LIO-SAM YouTube video -->
    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Video: LIO-SAM — Tightly-coupled LiDAR Inertial Odometry</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/A0H8CoORZJU" title="LIO-SAM: Tightly-coupled Lidar Inertial Odometry via Smoothing and Mapping" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-gray-400 text-sm text-center mt-2">Official LIO-SAM demo: factor graph-based LiDAR-inertial SLAM with Scan Context loop closure and optional GPS fusion — demonstrating real-world outdoor mapping accuracy.</p>
    </div>

    <h3>12.5 3D Mapping Frameworks</h3>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400">OctoMap — Probabilistic 3D Occupancy Grid</h4>
        <p class="text-slate-300 text-sm">OctoMap represents 3D space as an octree where each leaf node (voxel) stores a log-odds occupancy probability. The octree data structure is memory-efficient: large regions of uniform occupancy (free space or solid objects) are merged into single nodes rather than storing individual voxels.</p>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mt-2">
            <li><strong>Occupied:</strong> log-odds &gt; threshold (default 0.65). A LiDAR hit updates with +0.85 log-odds increment.</li>
            <li><strong>Free:</strong> log-odds &lt; 0.12. Every voxel along the ray before the hit receives −0.41 log-odds (miss_prob=0.4).</li>
            <li><strong>Unknown:</strong> log-odds near 0 — never observed. Used for frontier-based exploration.</li>
        </ul>
        <p class="text-slate-300 text-sm mt-2"><strong>Resolution:</strong> 0.05 m (5 cm) typical for indoor; 0.1–0.5 m for outdoor drone mapping. At 5 cm in a 50×50×20 m volume, worst-case ~640 MB but OctoMap compression reduces to 10–50 MB for typical scenes.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>ROS 2:</strong> <code>octomap_server2</code> subscribes to <code>sensor_msgs/PointCloud2</code>, publishes <code>octomap_msgs/Octomap</code> and <code>visualization_msgs/MarkerArray</code> for RViz.</p>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400">RTAB-Map — Real-Time Appearance-Based Mapping</h4>
        <p class="text-slate-300 text-sm">RTAB-Map is a graph-based SLAM library supporting RGB-D cameras, stereo cameras, and 3D LiDAR. Unlike OctoMap (pure mapping requiring external poses), RTAB-Map performs full SLAM: visual odometry + loop closure detection via Bag-of-Words (BoW) + pose graph optimization (g2o or GTSAM).</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Modalities:</strong> RGB-D (RealSense, OAK-D); Stereo (ZED 2i, custom); 3D LiDAR (Ouster, Livox) with optional camera for visual loop closure. The multi-modal approach enables outdoor GPS-denied long-range mapping with centimeter-level accuracy on revisit.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>ROS 2:</strong> <code>rtabmap_ros</code>. Publishes <code>/rtabmap/map</code> (OctoMap), <code>/rtabmap/cloud_map</code> (PointCloud2), <code>/rtabmap/odom</code>.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>OctoMap vs RTAB-Map:</strong> Use OctoMap when you have accurate external pose (VIO + GPS fusion) and need only a 3D occupancy structure for path planning. Use RTAB-Map when you need self-contained SLAM with loop closure — indoors, GPS-denied, or long sessions where drift accumulates.</p>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-sky-400">Open3D — Python Point Cloud Processing (v0.19+)</h4>
        <p class="text-slate-300 text-sm">Open3D is the standard Python library for point cloud manipulation, registration, and volumetric reconstruction. Key workflows for drone mapping:</p>
        <div class="bg-[#1e1e1e] rounded-xl overflow-hidden border border-slate-700 mt-3">
            <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: Open3D ICP Registration + TSDF Reconstruction</div>
            <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import open3d as o3d
import numpy as np

# ── ICP Point Cloud Registration ────────────────────────────────────
source = o3d.io.read_point_cloud("frame_001.pcd")
target = o3d.io.read_point_cloud("frame_002.pcd")

source_ds = source.voxel_down_sample(voxel_size=0.05)
target_ds = target.voxel_down_sample(voxel_size=0.05)
source_ds.estimate_normals(o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30))
target_ds.estimate_normals(o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30))

# Point-to-Plane ICP (better than Point-to-Point for smooth surfaces)
result = o3d.pipelines.registration.registration_icp(
    source_ds, target_ds, 0.05, np.eye(4),
    o3d.pipelines.registration.TransformationEstimationPointToPlane(),
    o3d.pipelines.registration.ICPConvergenceCriteria(max_iteration=50)
)
T = result.transformation  # 4x4 homogeneous transform

# ── TSDF Volumetric Reconstruction ─────────────────────────────────
volume = o3d.pipelines.integration.ScalableTSDFVolume(
    voxel_length=0.04, sdf_trunc=0.08,
    color_type=o3d.pipelines.integration.TSDFVolumeColorType.RGB8
)
intrinsic = o3d.camera.PinholeCameraIntrinsic(1280, 720, 640, 640, 640, 360)
for depth_img, color_img, T_camera_world in frames:
    rgbd = o3d.geometry.RGBDImage.create_from_color_and_depth(
        o3d.geometry.Image(color_img), o3d.geometry.Image(depth_img),
        depth_scale=1000.0, depth_trunc=5.0
    )
    volume.integrate(rgbd, intrinsic, np.linalg.inv(T_camera_world))
mesh = volume.extract_triangle_mesh()
mesh.compute_vertex_normals()
o3d.io.write_triangle_mesh("reconstruction.ply", mesh)</code></pre>
</details>
            </div>
        </div>
    </div>

    <h3>12.6 NVIDIA Isaac ROS Nvblox (2024–2025)</h3>

    <figure class="my-6">
        <img src="images/m12_nvblox_nodegraph.png" alt="NVIDIA Isaac ROS Nvblox ROS 2 node graph showing depth input to TSDF reconstruction and Nav2 costmap output" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Isaac ROS Nvblox node graph: depth images and pose feed into the TSDF voxel reconstructor, which outputs a mesh and a 2D costmap for Nav2 path planning. Source: <a href="https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_nvblox" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">NVIDIA Isaac ROS GitHub</a></figcaption>
    </figure>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-green-400 text-sm">Nvblox: GPU-Accelerated TSDF + ESDF Mapping</h4>
        <p class="text-slate-300 text-sm">Nvblox (NVIDIA, 2023–2025) is a CUDA-accelerated 3D scene reconstruction library that builds a <strong>TSDF (Truncated Signed Distance Function)</strong> map from depth images and robot poses, then derives an <strong>ESDF (Euclidean Signed Distance Function)</strong> for path planning and collision avoidance — all at GPU speeds on a Jetson Orin.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Layer architecture:</strong> Nvblox maintains independent but co-located voxel grid layers: TSDF layer (distance + weight per voxel), color layer (RGB per voxel), mesh layer (zero-crossings extracted via marching cubes), and ESDF layer (full distance field for Nav2 costmap).</p>
        <div class="overflow-x-auto my-3">
            <table class="w-full text-xs text-slate-300">
                <thead class="bg-slate-700 text-slate-300">
                    <tr>
                        <th class="p-2">Operation</th>
                        <th class="p-2">Jetson AGX Orin</th>
                        <th class="p-2">x86 + RTX 3080</th>
                        <th class="p-2">Notes</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-700">
                    <tr class="bg-slate-800"><td class="p-2">TSDF update</td><td class="p-2">0.5–2.1 ms</td><td class="p-2">0.09–0.4 ms</td><td class="p-2">Per depth frame integration</td></tr>
                    <tr class="bg-slate-900"><td class="p-2">Color update</td><td class="p-2">1.2–3.6 ms</td><td class="p-2">0.3–0.8 ms</td><td class="p-2">Optional RGB layer</td></tr>
                    <tr class="bg-slate-800"><td class="p-2">Mesh extraction</td><td class="p-2">2–13 ms</td><td class="p-2">0.2–2 ms</td><td class="p-2">Marching cubes on changed voxels</td></tr>
                    <tr class="bg-slate-900"><td class="p-2">ESDF update</td><td class="p-2">1–6.2 ms</td><td class="p-2">0.3–1.2 ms</td><td class="p-2">2D slice for Nav2 costmap</td></tr>
                </tbody>
            </table>
        </div>
        <p class="text-slate-300 text-sm mt-2"><strong>Dynamic object handling:</strong> Nvblox implements a "freespace monitoring" approach. When depth returns appear in previously mapped free-space voxels, those voxels are flagged dynamic and integrated into a separate dynamic occupancy layer. All voxel probabilities decay toward 0.5 over time (occupancy decay) — stale detections fade without active clearing. This works without any object classification model, making it lightweight.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>ROS 2 integration:</strong> <code>isaac_ros_nvblox</code> package. Compatible with ROS 2 Humble on Jetson Orin or x86_64 + NVIDIA GPU. Includes a RealSense splitter node that toggles the IR emitter to allow both high-quality depth (emitter on) and undistorted visual odometry images (emitter off) at alternating frames. Outputs: <code>/nvblox/mesh</code> (RViz visualization), <code>/nvblox/map_slice</code> (2D costmap → Nav2).</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Drone application:</strong> Nvblox + <a href="https://nvidia-isaac-ros.github.io/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Isaac ROS</a> Visual SLAM provides a complete stack: stereo/depth camera → pose estimation → TSDF map → ESDF → Nav2 costmap → obstacle-free trajectory. NVIDIA reports up to 177× speed-up over CPU-only TSDF implementations.</p>
    </div>

    <h3>12.7 3D Gaussian Splatting &amp; Neural Radiance Fields for Mapping</h3>

    <figure class="my-6">
        <img src="images/m12_3dgs_teaser.png" alt="3D Gaussian Splatting reconstruction teaser showing photorealistic scene rendering from discrete Gaussian primitives" class="rounded-lg w-full object-contain bg-black">
        <figcaption class="text-gray-400 text-sm text-center mt-2">3D Gaussian Splatting (3DGS) represents a scene as millions of semi-transparent 3D Gaussians, enabling real-time photorealistic rendering without neural network inference at render time. Source: <a href="https://github.com/graphdeco-inria/gaussian-splatting" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">graphdeco-inria/gaussian-splatting (INRIA / SIGGRAPH 2023)</a></figcaption>
    </figure>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-amber-400 text-sm">3D Gaussian Splatting (3DGS) — SIGGRAPH 2023 to Drone SLAM 2026</h4>
        <p class="text-slate-300 text-sm"><strong>3DGS</strong> (Kerbl et al., INRIA, SIGGRAPH 2023) represents a scene as an explicit collection of millions of 3D Gaussian primitives. Each Gaussian has position (mean), covariance (orientation + size), opacity, and spherical-harmonic color. Rendering is done via fast differentiable rasterization — no neural network ray-marching at inference time.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
                <p class="text-slate-400 text-xs font-semibold mb-1">Advantages Over NeRF for Mapping</p>
                <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                    <li><strong>Real-time rendering:</strong> 100+ FPS at 1080p on RTX 3080 — vs NeRF at 1–10 FPS. No volumetric ray casting needed.</li>
                    <li><strong>Explicit representation:</strong> Gaussians can be directly extracted as point clouds or meshes (SuGaR method, CVPR 2024 aligns Gaussians to mesh surfaces).</li>
                    <li><strong>Incremental training:</strong> New images can incrementally add or update Gaussians — critical for real-time drone mapping.</li>
                    <li><strong>Memory:</strong> Scales better than dense voxel grids for large outdoor scenes.</li>
                </ul>
            </div>
            <div>
                <p class="text-slate-400 text-xs font-semibold mb-1">2024 Drone + SLAM Applications</p>
                <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                    <li><strong>Gaussian-LIC (2024):</strong> LiDAR-Inertial-Camera fusion with 3DGS backend — real-time photo-realistic SLAM using Livox LiDAR + IMU + camera.</li>
                    <li><strong>DroneSplat (2024):</strong> Robust 3DGS reconstruction specifically addressing drone imagery challenges (rolling shutter, motion blur, altitude changes).</li>
                    <li><strong>SAFER-Splat (2024):</strong> Control Barrier Functions for safe navigation using online 3DGS maps — real-time obstacle avoidance within a Gaussian Splatting representation.</li>
                    <li><strong>GS-LIVO / GS-LIVM (ICCV 2025):</strong> Real-time LiDAR-inertial-visual odometry with a Gaussian mapping backend — the line of work that made 3DGS a live SLAM map rather than an offline reconstruction.</li>
                    <li><strong>Splat-LOAM / LIVE-GS / PINGS (2025–2026):</strong> Gaussian LiDAR odometry and mapping, globally consistent online LIV state estimation, and hybrid point-based implicit maps that unify Gaussian splats with signed-distance fields — the last being significant because a distance field is what a planner actually wants.</li>
                    <li><strong>LiDAR-enhanced 3DGS (2025):</strong> Fuses LiDAR point cloud depth priors into 3DGS optimization — reduces training time and improves geometric accuracy for UAV survey.</li>
                </ul>
            </div>
        </div>
        <div class="mt-3">
            <p class="text-slate-400 text-xs font-semibold mb-1">3DGS vs NeRF vs OctoMap — When to Use Which</p>
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-slate-300">
                    <thead class="bg-slate-700 text-slate-300">
                        <tr>
                            <th class="p-2">Criterion</th>
                            <th class="p-2">NeRF</th>
                            <th class="p-2">3D Gaussian Splatting</th>
                            <th class="p-2">OctoMap / Nvblox</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700">
                        <tr class="bg-slate-800"><td class="p-2">Render quality</td><td class="p-2 text-green-400">Photorealistic</td><td class="p-2 text-green-400">Photorealistic</td><td class="p-2 text-red-400">Geometric only</td></tr>
                        <tr class="bg-slate-900"><td class="p-2">Render speed</td><td class="p-2 text-red-400">1–10 FPS</td><td class="p-2 text-green-400">100+ FPS</td><td class="p-2 text-green-400">Real-time</td></tr>
                        <tr class="bg-slate-800"><td class="p-2">Training time</td><td class="p-2 text-red-400">Minutes–hours</td><td class="p-2 text-amber-400">Minutes (30k iters)</td><td class="p-2 text-green-400">Online/streaming</td></tr>
                        <tr class="bg-slate-900"><td class="p-2">Path planning</td><td class="p-2 text-red-400">Difficult</td><td class="p-2 text-amber-400">Possible (SuGaR mesh)</td><td class="p-2 text-green-400">Native (ESDF)</td></tr>
                        <tr class="bg-slate-800"><td class="p-2">Drone use case</td><td class="p-2">Post-mission ISR</td><td class="p-2">Real-time inspection, digital twin</td><td class="p-2">Real-time navigation, avoidance</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        <p class="text-slate-400 text-xs mt-3">3DGS requires a GPU for training and rendering. On a Jetson AGX Orin, 3DGS training at reduced resolution is feasible for small-area inspection missions. For fleet-scale or post-mission reconstruction, offload to a ground station with a desktop GPU.</p>
    </div>

    <h3>12.8 Terrain Following &amp; Obstacle Avoidance</h3>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-amber-400 text-sm">ArduPilot Terrain Following — TERRAIN_ENABLE</h4>
        <p class="text-slate-300 text-sm">ArduPilot supports two complementary terrain-following mechanisms:</p>
        <p class="text-slate-300 text-sm mt-2"><strong>1. Terrain database (SRTM):</strong> <code>TERRAIN_ENABLE = 1</code>. GCS downloads SRTM 90 m elevation data for the mission area and uploads it to the autopilot SD card (<code>/APM/TERRAIN/</code>). Waypoints in "Terrain" altitude frame execute at constant AGL, rising and falling with terrain shape.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>2. Rangefinder surface tracking:</strong> Set <code>RNGFND1_TYPE</code> for your sensor. In Loiter/AltHold, the altitude controller fuses rangefinder data directly into the altitude hold target — constant distance above whatever surface is below, regardless of SRTM accuracy. Max range: VL53L5CX = 4 m; TFmini Plus = 12 m; SF11/C LiDAR = 120 m.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Obstacle avoidance integration:</strong> For 3D obstacle avoidance in ArduPilot, the <code>OA_TYPE</code> parameter selects the path planner (BendyRuler or Dijkstra). Depth cameras (RealSense, OAK-D) feed the <code>OBSTACLE_DISTANCE</code> MAVLink message to ArduPilot's proximity library via a companion computer ROS 2 node or MAVROS bridge.</p>
        <div class="bg-[#1e1e1e] rounded-xl overflow-hidden border border-slate-700 mt-3">
            <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">ArduPilot Terrain Following Parameter Block</div>
            <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># Enable terrain database
TERRAIN_ENABLE   = 1
TERRAIN_SPACING  = 100   # SRTM grid spacing in meters

# Rangefinder (TFmini Plus via UART on Serial4)
RNGFND1_TYPE     = 20    # Benewake TFmini
RNGFND1_ORIENT   = 25    # Downward facing
RNGFND1_MIN_CM   = 10    # Minimum valid reading: 10 cm
RNGFND1_MAX_CM   = 1200  # Maximum: 12 m (TFmini Plus limit)
RNGFND1_GNDCLR   = 10    # Mount height offset: 10 cm
SERIAL4_PROTOCOL = 9     # Rangefinder on Serial4
SERIAL4_BAUD     = 115   # TFmini Plus default baud

# Optional second rangefinder: VL53L5CX on I2C for precision landing
RNGFND2_TYPE     = 25    # VL53L5X
RNGFND2_ORIENT   = 25    # Downward
RNGFND2_MAX_CM   = 400   # 4 m

# Obstacle avoidance (BendyRuler for 3D)
OA_TYPE          = 2     # BendyRuler
OA_MARGIN_MAX    = 3     # 3 m safety margin

# Surface tracking: active in Loiter/AltHold
WP_RFND_USE      = 1     # Use rangefinder during RTL</code></pre>
</details>
            </div>
        </div>
    </div>

    <h3>12.9 Depth Image to Point Cloud: The Math</h3>
    <p class="text-slate-300 text-sm">Converting a 2D depth image to a 3D point cloud requires inverting the pinhole camera projection. For each pixel <strong>(u, v)</strong> with depth value <strong>D</strong> (meters along optical axis), we unproject into 3D using focal lengths <strong>(fx, fy)</strong> and principal point <strong>(cx, cy)</strong> from the camera calibration file.</p>

    <details class="code-expand">
    <summary>Projection Formula ▼</summary>
<div class="math-block text-sm">
        <span class="text-slate-400">Camera Intrinsic Matrix K:</span><br><br>
        K = [ f_x,  0,   c_x ]<br>
            [  0,  f_y,  c_y ]<br>
            [  0,   0,    1  ]<br><br>
        <span class="text-slate-400">For pixel (u, v) with measured depth D (meters), the 3D point (X, Y, Z) is:</span><br><br>
        Z = D<br>
        X = (u - c_x) * D / f_x<br>
        Y = (v - c_y) * D / f_y<br><br>
        <span class="text-slate-400">Matrix form:</span><br>
        [X, Y, Z]^T = D * K^(-1) * [u, v, 1]^T<br><br>
        <span class="text-slate-400 text-xs">Note: D is Z-depth (along optical axis), not Euclidean distance from camera center. RealSense, OAK-D, and ZED all output Z-depth. Some ToF sensors output radial depth — convert via D_z = D_radial / sqrt(1 + ((u-cx)/fx)^2 + ((v-cy)/fy)^2).</span>
    </div>
</details>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mt-4 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: Vectorized Depth Image to Point Cloud (NumPy)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import numpy as np

def depth_to_pointcloud(depth_image, fx, fy, cx, cy, depth_scale=1.0):
    """
    Convert a depth image to a 3D point cloud.

    Args:
        depth_image: HxW array of uint16 or float32 depth values
        fx, fy: focal lengths in pixels
        cx, cy: principal point in pixels
        depth_scale: multiply depth values to get meters (e.g. 0.001 for mm)

    Returns:
        points: Nx3 array of (X, Y, Z) in meters.
    """
    H, W = depth_image.shape
    depth_m = depth_image.astype(np.float32) * depth_scale

    u = np.arange(W, dtype=np.float32)
    v = np.arange(H, dtype=np.float32)
    uu, vv = np.meshgrid(u, v)

    Z = depth_m
    X = (uu - cx) * Z / fx
    Y = (vv - cy) * Z / fy

    points = np.stack([X, Y, Z], axis=-1)   # (H, W, 3)
    valid = depth_m > 0.01                   # exclude zero/invalid pixels
    return points[valid]                     # (N, 3)

# RealSense D435i at 1280x720, typical intrinsics
fx, fy = 640.0, 640.0
cx, cy = 640.0, 360.0
# depth_image: uint16 in mm from pyrealsense2
cloud_xyz = depth_to_pointcloud(depth_image, fx, fy, cx, cy, depth_scale=0.001)</code></pre>
</details>
        </div>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-amber-400 text-sm">ROS 2 depth_image_proc Package</h4>
        <p class="text-slate-300 text-sm">The <code>depth_image_proc</code> package provides the above math as composable ROS 2 nodes, reading camera_info intrinsics automatically. Key components:</p>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mt-2">
            <li><code>depth_image_proc/ConvertMetricNode</code> — converts raw depth image to float32 meters</li>
            <li><code>depth_image_proc/PointCloudXyzNode</code> — depth + camera_info → PointCloud2 (XYZ)</li>
            <li><code>depth_image_proc/PointCloudXyziNode</code> — depth + intensity + camera_info → XYZI cloud</li>
            <li><code>depth_image_proc/PointCloudXyzrgbNode</code> — aligned depth + color + camera_info → XYZRGB cloud</li>
        </ul>
        <p class="text-slate-300 text-sm mt-2">Load as composable nodes for zero-copy intraprocess communication (critical for 30 fps 1280×720 depth at ~7 MB/frame):</p>
        <pre class="text-xs text-green-400 font-mono mt-2 bg-[#1e1e1e] p-2 rounded">ros2 launch depth_image_proc point_cloud_xyz.launch.py \\
    camera_info:=/realsense/color/camera_info \\
    image_rect:=/realsense/depth/image_rect_raw</pre>
    </div>

    <!-- External links -->
    <div class="interactive-panel bg-[#0d1320] border-slate-700 mt-6 mb-4">
        <h4 class="mt-0 border-none text-sky-400 text-sm">Key References &amp; Further Reading</h4>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1">
            <li><a href="https://nvidia-isaac-ros.github.io/concepts/scene_reconstruction/nvblox/index.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">NVIDIA Isaac ROS Nvblox — Official Documentation</a></li>
            <li><a href="https://arxiv.org/abs/2107.06829" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">FAST-LIO2: Fast Direct LiDAR-inertial Odometry (arXiv 2021)</a></li>
            <li><a href="https://arxiv.org/abs/2206.02655" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">KISS-ICP: In Defense of Point-to-Point ICP (arXiv 2022)</a></li>
            <li><a href="https://arxiv.org/abs/2007.11898" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">ORB-SLAM3: Visual, Visual-Inertial and Multi-Map SLAM (arXiv 2020)</a></li>
            <li><a href="https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">3D Gaussian Splatting for Real-Time Radiance Field Rendering (INRIA SIGGRAPH 2023)</a></li>
            <li><a href="https://www.livoxtech.com/mid-360/specs" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Livox Mid-360 Specifications</a></li>
            <li><a href="https://ouster.com/products/hardware/os0-lidar-sensor" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Ouster OS0 LiDAR Sensor</a></li>
            <li><a href="https://www.stereolabs.com/store/products/zed-x-stereo-camera" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Stereolabs ZED X — Global Shutter Stereo Camera</a></li>
            <li><a href="https://docs.luxonis.com/hardware/products/OAK-D%20S2" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Luxonis OAK-D S2 Hardware Documentation</a></li>
            <li><a href="https://ardupilot.org/copter/docs/common-rangefinder-landingpage.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">ArduPilot Rangefinder Configuration</a></li>
        </ul>
    </div>
</div>
`;
