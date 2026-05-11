export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 15</span>
    <h2>Depth Sensing &amp; 3D Mapping for Drone Navigation</h2>
    <p>A drone that cannot build a 3D model of its environment is blind to obstacles. This module covers the sensor physics, algorithms, and software stacks that turn raw depth measurements into navigable 3D maps.</p>

    <h3>15.1 Stereo Depth Estimation</h3>

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
        <p class="text-slate-300 text-sm mt-2"><strong>Computational cost:</strong> O(W × H × D_max × num_directions). At 1280x720 with D_max=128 and 8 directions, this is ~940M operations per frame. Requires GPU (CUDA SGBM via OpenCV) or FPGA/ASIC (Intel RealSense D400 onboard ASIC) for real-time. On CPU: 5-15 fps. On GPU: 30+ fps. Accuracy vs disparity range tradeoff: larger D_max = slower but handles wider baseline or closer objects.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Intel RealSense D435i</h4>
            <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                <li><strong>Stereo resolution:</strong> Up to 1280x720 @ 30 fps; 640x480 @ 90 fps</li>
                <li><strong>Stereo baseline:</strong> 50mm (not 90mm — the 90mm figure is the full module width)</li>
                <li><strong>Depth range:</strong> 0.2m - 10m (effective usable range 0.3-5m for most targets)</li>
                <li><strong>Onboard compute:</strong> Intel D4 ASIC (dedicated stereo processing chip running SGM at 30fps without host CPU)</li>
                <li><strong>IMU:</strong> Bosch BMI055 6-DoF IMU (accelerometer + gyroscope) synchronized to depth frames</li>
                <li><strong>RGB camera:</strong> 1920x1080 @ 30fps, rolling shutter</li>
                <li><strong>Interface:</strong> USB 3.1 Gen 1 (USB-C connector)</li>
                <li><strong>Weight:</strong> 72g, 90mm x 25mm x 25mm</li>
                <li><strong>Python SDK:</strong> <code>pyrealsense2</code> — pip-installable. Key classes: <code>rs.pipeline</code>, <code>rs.config</code>, <code>rs.align</code> (align depth to color frame), <code>rs.pointcloud</code></li>
            </ul>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Luxonis OAK-D Pro</h4>
            <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                <li><strong>Stereo baseline:</strong> 75mm</li>
                <li><strong>Stereo type:</strong> Active stereo — onboard IR laser dot projector (ASV) improves depth on low-texture surfaces (walls, floors)</li>
                <li><strong>Depth range:</strong> 0.2m - 35m (active stereo) vs 0.3m - 12m (passive)</li>
                <li><strong>Onboard AI:</strong> RVC2 chip — 1.4 TOPS for neural inference. Runs MobileNet/YOLOv5n class models directly on the camera without host CPU</li>
                <li><strong>Depth output:</strong> Disparity / depth map at up to 1280x800 @ 60fps, hardware SGM</li>
                <li><strong>Interface:</strong> USB 3.1 or PoE (OAK-D Pro PoE variant)</li>
                <li><strong>Power:</strong> 7.5W max</li>
                <li><strong>SDK:</strong> DepthAI Python library. Pipeline-based: define nodes (MonoCamera, StereoDepth, NeuralNetwork), link them, device runs the graph</li>
            </ul>
        </div>
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
        # Convert to meters:
        depth_meters = depth_image * depth_scale  # float32 array, meters

        # Get depth at a specific pixel (u, v):
        u, v = 640, 360  # center pixel
        d = depth_frame.get_distance(u, v)  # returns float in meters

finally:
    pipeline.stop()</code></pre>
</details>
        </div>
    </div>

    <h3>15.2 Time-of-Flight (ToF) Sensors</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">VL53L5CX (ST Microelectronics)</h4>
            <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                <li><strong>Sensing matrix:</strong> 8x8 zones (64 independent ranging measurements per frame)</li>
                <li><strong>Frame rate:</strong> Up to 60 Hz</li>
                <li><strong>Range:</strong> 2cm - 400cm (4m). Optimal accuracy 2cm-200cm.</li>
                <li><strong>Interface:</strong> I2C (up to 1 MHz), also SPI</li>
                <li><strong>Power:</strong> 65mW active, 4.8mW low-power idle</li>
                <li><strong>Package:</strong> 6.4mm x 3.4mm x 1.5mm LGA</li>
                <li><strong>Use on drones:</strong> Downward-facing proximity detection for precision landing. The 8x8 zone output creates a crude depth map of the ground surface directly below, detectable via I2C from flight controller or companion computer.</li>
                <li><strong>Disadvantage:</strong> Multi-path error on reflective surfaces (water, glass, polished concrete). Limited range compared to LiDAR.</li>
            </ul>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">ToF vs. Stereo Trade-offs</h4>
            <table class="w-full text-xs text-slate-300 mt-1">
                <thead><tr class="text-sky-400 border-b border-slate-700"><th class="text-left py-1 pr-3">Property</th><th class="text-left py-1 pr-3">ToF</th><th class="text-left py-1">Stereo</th></tr></thead>
                <tbody>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3">Low-texture surfaces</td><td class="py-1 pr-3 text-green-400">Works well</td><td class="py-1 text-red-400">Fails (no features to match)</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3">Outdoor sunlight</td><td class="py-1 pr-3 text-amber-400">Reduced range</td><td class="py-1 text-green-400">Works well</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3">Resolution</td><td class="py-1 pr-3 text-red-400">Low (8x8 to 64x48)</td><td class="py-1 text-green-400">Full image resolution</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3">Multi-path error</td><td class="py-1 pr-3 text-red-400">Significant (corners)</td><td class="py-1 text-green-400">Not affected</td></tr>
                    <tr><td class="py-1 pr-3">Power (active)</td><td class="py-1 pr-3 text-green-400">65mW</td><td class="py-1 text-red-400">5-10W (stereo pair + compute)</td></tr>
                </tbody>
            </table>
            <p class="text-slate-400 text-xs mt-2">Other ToF options: PMD Flexx2 (224x172 px, 76m range), Microsoft Azure Kinect (1M pixel ToF, 0.5-5.46m, discontinued but still deployed). For drones, VL53L5CX (proximity/landing) + RealSense D435i (obstacle avoidance) is a common pairing.</p>
        </div>
    </div>

    <h3>15.3 LiDAR for Drones</h3>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-white text-sm">LiDAR Sensor Comparison Matrix</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-slate-300 mt-2">
                <thead><tr class="text-sky-400 border-b border-slate-700">
                    <th class="text-left py-1 pr-4">Sensor</th>
                    <th class="text-left py-1 pr-4">Type</th>
                    <th class="text-left py-1 pr-4">Range</th>
                    <th class="text-left py-1 pr-4">Points/sec</th>
                    <th class="text-left py-1 pr-4">Interface</th>
                    <th class="text-left py-1 pr-4">Weight</th>
                    <th class="text-left py-1 pr-4">Price</th>
                    <th class="text-left py-1">Best For</th>
                </tr></thead>
                <tbody>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-4 font-mono">RPLIDAR S3</td><td class="py-1 pr-4">2D, 360°</td><td class="py-1 pr-4">40m</td><td class="py-1 pr-4">32,000</td><td class="py-1 pr-4">USB</td><td class="py-1 pr-4">230g</td><td class="py-1 pr-4">~$200</td><td class="py-1">Indoor 2D SLAM, corridor following, simple obstacle avoidance</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-4 font-mono">Livox Mid-360</td><td class="py-1 pr-4">3D, non-repetitive</td><td class="py-1 pr-4">40m (100m on white)</td><td class="py-1 pr-4">200,000</td><td class="py-1 pr-4">Ethernet</td><td class="py-1 pr-4">265g</td><td class="py-1 pr-4">~$500</td><td class="py-1">3D outdoor mapping, SLAM, obstacle avoidance. Best entry-level 3D.</td></tr>
                    <tr><td class="py-1 pr-4 font-mono">Ouster OS0-32</td><td class="py-1 pr-4">3D, 32-beam</td><td class="py-1 pr-4">50m (65m @10% refl)</td><td class="py-1 pr-4">655,360</td><td class="py-1 pr-4">Ethernet</td><td class="py-1 pr-4">447g</td><td class="py-1 pr-4">~$4,000</td><td class="py-1">High-density 3D survey, 90° vertical FOV (ultra-wide, good for drones)</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-amber-400 text-sm">Livox Mid-360: Non-Repetitive Scan Pattern</h4>
        <p class="text-slate-300 text-sm">Unlike conventional spinning LiDARs that trace the same circle each revolution (creating periodic blind spots between beams), the Livox Mid-360 uses a non-repetitive Lissajous scan pattern. Each 100ms integration window produces a different point distribution. After 1 second, point cloud density approaches full coverage of the FOV (360° H x 59° V). This means slower temporal resolution is rewarded with higher spatial density — the opposite of spinning LiDAR behavior. The ROS 2 driver publishes <code>sensor_msgs/PointCloud2</code> on <code>/livox/lidar</code> topic.</p>
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

# Reading in Python with numpy:
import numpy as np
import sensor_msgs_py.point_cloud2 as pc2

def cloud_callback(msg):
    # Generator of (x, y, z) tuples
    points = list(pc2.read_points(msg, field_names=("x","y","z"), skip_nans=True))
    arr = np.array(points, dtype=np.float32)  # Shape: (N, 3)</code></pre>
</details>
        </div>
    </div>

    <h3>15.4 3D Mapping Frameworks</h3>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400">OctoMap — Probabilistic 3D Occupancy Grid</h4>
        <p class="text-slate-300 text-sm">OctoMap represents 3D space as an octree where each leaf node (voxel) stores a log-odds occupancy probability. The octree data structure is memory-efficient: large regions of uniform occupancy (free space or solid objects) are merged into single nodes rather than storing individual voxels.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Node states:</strong></p>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1">
            <li><strong>Occupied:</strong> log-odds &gt; threshold (default occupancy_thres=0.65). A LiDAR return hit updates this node with a positive log-odds increment (hit_prob=0.7 → logodds +0.85).</li>
            <li><strong>Free:</strong> log-odds &lt; free threshold (default 0.12). Every voxel along the sensor ray before the hit point receives a negative log-odds update (miss_prob=0.4 → logodds -0.41).</li>
            <li><strong>Unknown:</strong> log-odds near 0 (never observed). New nodes start here. Unknown voxels are the basis for frontier-based exploration.</li>
        </ul>
        <p class="text-slate-300 text-sm mt-2"><strong>Resolution:</strong> 0.05m (5cm) is typical for indoor, 0.1-0.5m for outdoor drone mapping. At 5cm resolution, a 50m x 50m x 20m volume requires ~640MB worst-case, but OctoMap compression reduces this to 10-50MB for typical scenes with large free regions.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>ROS 2 package:</strong> <code>octomap_server2</code> (port of <code>octomap_server</code> to ROS 2). Subscribes to <code>sensor_msgs/PointCloud2</code>, publishes <code>octomap_msgs/Octomap</code> (binary) and <code>visualization_msgs/MarkerArray</code> for RViz. Launch with: <code>ros2 launch octomap_server2 octomap_server_launch.py</code></p>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400">RTAB-Map — Real-Time Appearance-Based Mapping</h4>
        <p class="text-slate-300 text-sm">RTAB-Map is a graph-based SLAM library supporting RGB-D cameras, stereo cameras, and 3D LiDAR. Unlike OctoMap (which is a pure mapping system requiring externally-provided poses), RTAB-Map performs full SLAM: it estimates its own pose via visual odometry and detects loop closures to correct accumulated drift.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Loop closure detection:</strong> Uses Bag-of-Words (SURF or ORB features hashed into a visual vocabulary). When a location is revisited, the similarity score exceeds a threshold, triggering a loop closure constraint in the pose graph. The pose graph is then optimized (g2o or GTSAM) to globally minimize trajectory error.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Input modalities:</strong></p>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1">
            <li>RGB-D (RealSense, OAK-D): color + aligned depth → 3D dense map + loop closure via RGB</li>
            <li>Stereo (ZED 2, custom): left + right → disparity → 3D. Good for drone outdoor flight.</li>
            <li>3D LiDAR (Ouster, Livox): uses ICP-based point cloud odometry + visual loop closure from optional camera. Best accuracy for large-scale outdoor mapping.</li>
        </ul>
        <p class="text-slate-300 text-sm mt-2"><strong>ROS 2 node:</strong> <code>rtabmap_ros</code> package. Key launch files: <code>rtabmap.launch.py</code> (RGB-D), <code>stereo.launch.py</code>, <code>lidar.launch.py</code>. Publishes: <code>/rtabmap/map</code> (OctoMap), <code>/rtabmap/cloud_map</code> (PointCloud2), <code>/rtabmap/odom</code>.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>RTAB-Map vs OctoMap — when to use which:</strong> Use OctoMap when you already have accurate pose from an external source (e.g., Jetson running VIO + GPS fusion) and need only a 3D occupancy structure for path planning. Use RTAB-Map when you need self-contained SLAM with loop closure correction — indoors, GPS-denied environments, long mapping sessions where drift accumulates.</p>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-sky-400">Open3D — Python Point Cloud Processing</h4>
        <p class="text-slate-300 text-sm">Open3D (v0.19+) is the standard Python library for point cloud manipulation, registration, and volumetric reconstruction. Key workflows for drone mapping:</p>

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

# Pre-processing: voxel downsample to 5cm resolution, estimate normals
source_ds = source.voxel_down_sample(voxel_size=0.05)
target_ds = target.voxel_down_sample(voxel_size=0.05)
source_ds.estimate_normals(o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30))
target_ds.estimate_normals(o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30))

# Point-to-Plane ICP (better than Point-to-Point for smooth surfaces)
threshold = 0.05  # 5cm max correspondence distance
init_T = np.eye(4)  # Initial transform guess (identity or from odometry)
result = o3d.pipelines.registration.registration_icp(
    source_ds, target_ds, threshold, init_T,
    o3d.pipelines.registration.TransformationEstimationPointToPlane(),
    o3d.pipelines.registration.ICPConvergenceCriteria(max_iteration=50)
)
T = result.transformation  # 4x4 homogeneous transform
print(f"ICP fitness: {result.fitness:.4f}, RMSE: {result.inlier_rmse:.4f}")

# ── TSDF Volumetric Reconstruction ─────────────────────────────────
# Integrates RGB-D frames into a 3D volume given camera poses.
volume = o3d.pipelines.integration.ScalableTSDFVolume(
    voxel_length=0.04,       # 4cm voxel size
    sdf_trunc=0.08,          # Truncation distance = 2x voxel_length
    color_type=o3d.pipelines.integration.TSDFVolumeColorType.RGB8
)

# For each RGB-D frame + camera intrinsics + pose:
intrinsic = o3d.camera.PinholeCameraIntrinsic(1280, 720, fx=640, fy=640, cx=640, cy=360)
for depth_img, color_img, T_camera_world in frames:
    rgbd = o3d.geometry.RGBDImage.create_from_color_and_depth(
        o3d.geometry.Image(color_img),
        o3d.geometry.Image(depth_img),
        depth_scale=1000.0,   # millimeters to meters
        depth_trunc=5.0       # ignore depth beyond 5m
    )
    volume.integrate(rgbd, intrinsic, np.linalg.inv(T_camera_world))

# Extract mesh
mesh = volume.extract_triangle_mesh()
mesh.compute_vertex_normals()
o3d.io.write_triangle_mesh("reconstruction.ply", mesh)</code></pre>
</details>
            </div>
        </div>
    </div>

    <h3>15.5 Terrain Following</h3>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-amber-400 text-sm">ArduPilot Terrain Following — TERRAIN_ENABLE</h4>
        <p class="text-slate-300 text-sm">ArduPilot supports two complementary terrain-following mechanisms that can work together:</p>
        <p class="text-slate-300 text-sm mt-2"><strong>1. Terrain database (SRTM data):</strong> Set <code>TERRAIN_ENABLE = 1</code>. The GCS (Mission Planner, QGroundControl) downloads SRTM 90m-resolution elevation data from the internet for the current mission area and uploads it to the autopilot's SD card (<code>/APM/TERRAIN/</code>). Waypoints specified in "Terrain" altitude frame are then executed as constant AGL altitude, not constant AMSL altitude. The drone rises and falls to follow the terrain shape below.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>2. Rangefinder surface tracking:</strong> Set <code>RNGFND1_TYPE</code> to your sensor type (e.g., 11 = VL53L1X, 25 = TeraRanger, etc.). Set <code>RNGFND1_ORIENT = 25</code> (downward). In Surface Tracking mode (Loiter or AltHold), the altitude controller fuses rangefinder data directly into the altitude hold target. The aircraft maintains constant distance above whatever surface is directly below — regardless of terrain type or SRTM accuracy. Maximum useful range depends on sensor: VL53L5CX = 4m, SF11/C LiDAR = 120m.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Fusion mode:</strong> With both enabled, ArduPilot can use rangefinder data (accurate, short-range) near the ground and SRTM data (longer range, less accurate) for mission planning. Parameter <code>WP_RFND_USE = 1</code> enables rangefinder override during RTL. Do NOT set <code>EK3_SRC1_POSZ = Rangefinder</code> — this parameter must remain at its default (barometer) to avoid state estimation instability.</p>
        <div class="bg-[#1e1e1e] rounded-xl overflow-hidden border border-slate-700 mt-3">
            <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">ArduPilot Terrain Following Parameter Block</div>
            <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># Enable terrain database
TERRAIN_ENABLE = 1
TERRAIN_SPACING = 100    # SRTM grid spacing in meters (default)

# Rangefinder configuration (example: VL53L5CX via I2C on first sensor slot)
RNGFND1_TYPE     = 25    # Sensor type — check ArduPilot docs for your sensor
RNGFND1_ORIENT   = 25    # Downward facing
RNGFND1_MIN_CM   = 5     # Minimum valid reading: 5cm
RNGFND1_MAX_CM   = 400   # Maximum valid reading: 4m (VL53L5CX limit)
RNGFND1_GNDCLR   = 10   # Ground clearance offset: 10cm (mount height)

# Surface tracking enabled in: Loiter, AltHold, Auto (with WP_RFND_USE)
WP_RFND_USE      = 1     # Use rangefinder instead of terrain DB during RTL

# DO NOT CHANGE:
# EK3_SRC1_POSZ = 1 (barometer, default) — rangefinder is secondary source</code></pre>
</details>
            </div>
        </div>
    </div>

    <h3>15.6 Depth Image to Point Cloud: The Math</h3>
    <p class="text-slate-300 text-sm">Converting a 2D depth image to a 3D point cloud requires inverting the pinhole camera projection. For each pixel <strong>(u, v)</strong> with depth value <strong>D</strong> (meters along optical axis), we unproject it into 3D world coordinates using the camera's focal lengths <strong>(fx, fy)</strong> and principal point <strong>(cx, cy)</strong> — numbers found in the camera calibration file. RealSense and OAK-D both output Z-depth (along axis), not radial distance from lens center.</p>

    <details class="code-expand">
    <summary>Projection Formula ▼</summary>
<div class="math-block text-sm">
        <span class="text-slate-400">Camera Intrinsic Matrix K:</span><br><br>
        K = [ f_x,  0,   c_x ]<br>
            [  0,  f_y,  c_y ]<br>
            [  0,   0,    1  ]<br><br>
        <span class="text-slate-400">Where: f_x, f_y = focal lengths (pixels). c_x, c_y = principal point (image center).</span><br><br>
        <span class="text-slate-400">For pixel (u, v) with measured depth D (meters), the 3D point (X, Y, Z) is:</span><br><br>
        Z = D<br>
        X = (u - c_x) * D / f_x<br>
        Y = (v - c_y) * D / f_y<br><br>
        <span class="text-slate-400">Matrix form using inverse of K:</span><br>
        [X, Y, Z]^T = D * K^(-1) * [u, v, 1]^T<br><br>
        <span class="text-slate-400 text-xs">Note: this assumes the depth D is measured along the optical axis (Z), not as Euclidean distance from the camera center. RealSense and OAK-D both output Z-depth, not radial depth. For radial depth (some ToF sensors), use D_radial = sqrt(X^2 + Y^2 + Z^2) and invert accordingly.</span>
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
        depth_scale: multiply depth values to get meters (e.g. 0.001 for mm input)

    Returns:
        points: Nx3 array of (X, Y, Z) in meters. Invalid/zero-depth pixels excluded.
    """
    H, W = depth_image.shape
    depth_m = depth_image.astype(np.float32) * depth_scale

    # Build pixel coordinate grids
    u = np.arange(W, dtype=np.float32)   # shape: (W,)
    v = np.arange(H, dtype=np.float32)   # shape: (H,)
    uu, vv = np.meshgrid(u, v)            # both shape: (H, W)

    # Project to 3D
    Z = depth_m                            # (H, W) in meters
    X = (uu - cx) * Z / fx                # (H, W)
    Y = (vv - cy) * Z / fy                # (H, W)

    # Stack and filter out invalid (zero-depth) pixels
    points = np.stack([X, Y, Z], axis=-1)  # (H, W, 3)
    valid = depth_m > 0.01                  # mask: exclude pixels closer than 1cm
    return points[valid]                    # (N, 3)

# Example: RealSense D435i at 1280x720, typical intrinsics
fx, fy = 640.0, 640.0   # approx focal lengths
cx, cy = 640.0, 360.0   # principal point (image center)

# depth_image: uint16 array in millimeters from pyrealsense2
cloud_xyz = depth_to_pointcloud(depth_image, fx, fy, cx, cy, depth_scale=0.001)</code></pre>
</details>
        </div>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-amber-400 text-sm">ROS 2 depth_image_proc Package</h4>
        <p class="text-slate-300 text-sm">The <code>depth_image_proc</code> package provides the same math as above as composable ROS 2 nodes, handling camera_info intrinsics automatically. Key nodes/components:</p>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mt-2">
            <li><code>depth_image_proc/ConvertMetricNode</code> — converts raw depth image to float32 meters</li>
            <li><code>depth_image_proc/PointCloudXyzNode</code> — depth + camera_info → PointCloud2 (XYZ only)</li>
            <li><code>depth_image_proc/PointCloudXyziNode</code> — depth + intensity image + camera_info → XYZI cloud</li>
            <li><code>depth_image_proc/PointCloudXyzrgbNode</code> — aligned depth + color + camera_info → XYZRGB cloud</li>
        </ul>
        <p class="text-slate-300 text-sm mt-2">Load as composable nodes in a container for zero-copy intraprocess communication (critical for 30fps 1280x720 depth at ~7MB/frame):</p>
        <pre class="text-xs text-green-400 font-mono mt-2 bg-[#1e1e1e] p-2 rounded">ros2 launch depth_image_proc point_cloud_xyz.launch.py \\
    camera_info:=/realsense/color/camera_info \\
    image_rect:=/realsense/depth/image_rect_raw</pre>
        <p class="text-slate-300 text-sm mt-2">The node reads <code>fx</code>, <code>fy</code>, <code>cx</code>, <code>cy</code> directly from the incoming <code>sensor_msgs/CameraInfo</code> message, so no manual intrinsic specification is needed when using a properly calibrated camera driver.</p>
    </div>
</div>
`;
