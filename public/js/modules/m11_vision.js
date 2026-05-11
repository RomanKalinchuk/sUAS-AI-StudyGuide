export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 11</span>
    <h2>Perception &amp; Visual SLAM</h2>
    <p>To act autonomously in GPS-denied environments, a drone must simultaneously build a map of its surroundings and locate itself within that map — the Simultaneous Localization and Mapping (SLAM) problem. This module covers the complete mathematical stack: from the physics of how a camera sees the world, through classical feature-based methods and IMU preintegration theory, to the production SLAM systems deployed on modern autonomous platforms. Sensor coverage is maximum-breadth: monocular, stereo, RGB-D, and LiDAR-inertial.</p>

    <h3>11.1 Camera Geometry and Calibration</h3>
    <p>A camera is a mathematical function that maps 3D world points <strong>P</strong> = (X, Y, Z) to 2D image pixels <strong>p</strong> = (u, v). Reversing this projection — recovering 3D structure and motion from 2D images — is the foundational problem of geometric computer vision.</p>

    <h4>The Pinhole Camera Model</h4>
    <p>The ideal pinhole model assumes all light rays pass through a single point (the optical center) and project onto a flat image plane at distance f. This gives the fundamental projection equation used in all SLAM systems:</p>

    <div class="insight-box">
        <div class="insight-label">PINHOLE PROJECTION</div>
        <p class="text-slate-200 text-sm mt-1">Maps a 3D world point to a 2D image pixel using a camera's intrinsic matrix K and its pose in the world. Understanding this transform is essential for recovering geometry from images — every SLAM, SfM, and depth-estimation algorithm builds on it.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
        Pinhole Projection (homogeneous form):<br><br>
        s * p = K * [R | t] * P_world<br><br>
        where:<br>
          p       = [u, v, 1]^T   (homogeneous image coordinates)<br>
          P_world = [X, Y, Z, 1]^T (homogeneous world coordinates)<br>
          s       = depth scale factor (the Z-coordinate in camera frame)<br>
          K       = 3×3 intrinsic matrix (camera-internal parameters)<br>
          [R | t] = 3×4 extrinsic matrix (camera pose in world)<br><br>
        Intrinsic Matrix K — encodes internal camera physics:<br><br>
        K = [ f_x,  0,   c_x ]<br>
            [  0,  f_y,  c_y ]<br>
            [  0,   0,    1  ]<br><br>
        f_x = f * m_x  (focal length in mm × pixels/mm on the sensor)<br>
        f_y = f * m_y  (can differ slightly from f_x due to non-square pixels)<br>
        c_x, c_y = principal point — ideally the image center, rarely exact<br><br>
        Example: 2mm focal length, 1280×720 sensor, 3.0 µm pixel pitch<br>
          m_x = 1/0.003 = 333.3 px/mm<br>
          f_x = 2 × 333.3 = 666.7 pixels<br>
          c_x ≈ 640, c_y ≈ 360 (image center)<br><br>
        Unprojection (pixel to unit ray in camera frame):<br>
          X/Z = (u - c_x) / f_x<br>
          Y/Z = (v - c_y) / f_y<br>
          Ray direction: d = K^(-1) * [u, v, 1]^T  (normalized gives bearing vector)
    </div>
</details>

    <h4>Lens Distortion: Brown-Conrady Model</h4>
    <p>Real lenses deviate from the ideal pinhole. Distortion corrupts geometric measurements — a 5% radial distortion at the image edge causes ~50px position error, making feature triangulation useless without correction.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Brown-Conrady Distortion Model (OpenCV Convention)</h4>
        <div class="insight-box">
            <div class="insight-label">LENS DISTORTION MODEL</div>
            <p class="text-slate-200 text-sm mt-1">Real lenses bend light non-linearly — the Brown-Conrady equations quantify this warping so it can be corrected before any geometric measurement. Without undistortion, feature triangulation errors can reach tens of pixels at the image boundary.</p>
        </div>
        <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Normalized image coordinates (divide out focal length):<br>
x_n = (u - c_x) / f_x,   y_n = (v - c_y) / f_y,   r^2 = x_n^2 + y_n^2<br><br>
Radial distortion (barrel: k1 &lt; 0, pincushion: k1 &gt; 0):<br>
x_r = x_n * (1 + k1*r^2 + k2*r^4 + k3*r^6)<br>
y_r = y_n * (1 + k1*r^2 + k2*r^4 + k3*r^6)<br><br>
Tangential distortion (lens plane not parallel to image plane):<br>
x_t = 2*p1*x_n*y_n + p2*(r^2 + 2*x_n^2)<br>
y_t = p1*(r^2 + 2*y_n^2) + 2*p2*x_n*y_n<br><br>
Final distorted pixel:<br>
u_d = f_x * (x_r + x_t) + c_x<br>
v_d = f_y * (y_r + y_t) + c_y<br><br>
OpenCV distortion coefficient vector: [k1, k2, p1, p2, k3]<br>
  k1, k2, k3 = radial (common range: -0.5 to +0.5 for wide-angle lenses)<br>
  p1, p2     = tangential (typically &lt; 0.01 for quality lenses)<br><br>
Fisheye lenses (FOV &gt; 150°) use Kannala-Brandt equidistant model:<br>
r_d = f * (theta + k1*theta^3 + k2*theta^5 + k3*theta^7 + k4*theta^9)<br>
where theta = atan(sqrt(X^2+Y^2)/Z) = angle from optical axis<br>
OpenCV: cv2.fisheye.calibrate() — separate from standard calibrateCamera()
        </div>
</details>
    </div>

    <h4>Stereo Camera Geometry</h4>
    <p>A stereo camera pair adds one critical measurement: baseline B, the physical distance between the two optical centers. This breaks the scale ambiguity of monocular systems — depth Z can be recovered directly from disparity d.</p>

    <div class="insight-box">
        <div class="insight-label">STEREO DEPTH ACCURACY</div>
        <p class="text-slate-200 text-sm mt-1">Depth from a stereo pair scales inversely with disparity — at close range a 1-pixel error means centimeters of error, but at 10 m it means over a meter. This relationship determines the maximum reliable range for any stereo camera given its baseline and focal length.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
        Stereo Depth from Disparity (after rectification):<br><br>
        Z = f * B / d<br><br>
        f = focal length (pixels), B = baseline (meters), d = disparity (pixels)<br><br>
        Depth error from 1-pixel disparity error (sub-pixel precision d_sub ≈ 0.5px):<br>
        dZ/dd = -(f * B) / d^2<br><br>
        At 1m: d = f*B/1 = 640*0.1 = 64px → dZ = 0.016m per pixel<br>
        At 5m: d = f*B/5 = 640*0.1 = 12.8px → dZ = 0.39m per pixel<br>
        At 10m: d = 6.4px → dZ = 1.56m per pixel (very poor — range limit)<br><br>
        Minimum detectable depth (max disparity D_max set by algorithm):<br>
        Z_min = f * B / D_max<br><br>
        For RealSense D435i: B=50mm, f≈640px, D_max=96px → Z_min = 0.33m (matches spec)<br>
        For ZED 2: B=120mm, f≈700px, D_max=256px → Z_min = 0.33m but better far-range
    </div>
</details>

    <h4>Camera Calibration: Zhang's Method (OpenCV)</h4>
    <p>Calibration recovers K and the distortion coefficients by observing a planar calibration target (checkerboard) from multiple viewpoints. Zhang's method (2000) requires ≥3 views. Reprojection error (RMS) below 0.5 pixels is required for SLAM-quality calibration.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-4">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: Full Camera Calibration Pipeline (OpenCV)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import cv2
import numpy as np
import glob

BOARD = (9, 6)       # inner corners (cols, rows)
SQUARE_M = 0.030     # 30mm square size in meters

obj_template = np.zeros((BOARD[0]*BOARD[1], 3), np.float32)
obj_template[:, :2] = np.mgrid[0:BOARD[0], 0:BOARD[1]].T.reshape(-1, 2) * SQUARE_M

obj_points, img_points = [], []

for fname in sorted(glob.glob("calib/*.jpg")):
    img  = cv2.imread(fname)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    ret, corners = cv2.findChessboardCorners(gray, BOARD, None)
    if ret:
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
        corners = cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
        obj_points.append(obj_template)
        img_points.append(corners)

H, W = gray.shape
rms, K, dist, rvecs, tvecs = cv2.calibrateCamera(
    obj_points, img_points, (W, H), None, None)

print(f"RMS reprojection error: {rms:.4f} px  (target: &lt; 0.5px)")
print(f"K: fx={K[0,0]:.1f} fy={K[1,1]:.1f} cx={K[0,2]:.1f} cy={K[1,2]:.1f}")
print(f"Distortion: k1={dist[0,0]:.5f} k2={dist[0,1]:.5f} p1={dist[0,2]:.5f}")

# Pre-compute optimal undistortion map (do once, apply each frame at ~1ms)
newK, roi = cv2.getOptimalNewCameraMatrix(K, dist, (W, H), alpha=0)
mapx, mapy = cv2.initUndistortRectifyMap(K, dist, None, newK, (W, H), cv2.CV_32FC1)
undistorted = cv2.remap(frame, mapx, mapy, cv2.INTER_LINEAR)  # in SLAM loop</code></pre>
</details>
        </div>
    </div>

    <h4>Rolling Shutter vs. Global Shutter</h4>
    <p>Most consumer CMOS sensors use a <strong>rolling shutter</strong> — each row is exposed sequentially over ~33ms per frame. A drone moving at 5 m/s travels 16cm during one full exposure, causing different rows to capture the scene at different instants. This creates geometric distortions — called <em>rolling shutter wobble</em> — that break the static-scene assumption of SLAM feature tracking. Production SLAM hardware uses <strong>global shutter cameras</strong> (all pixels exposed simultaneously). Key global shutter options for drones: FLIR Blackfly S (Sony IMX264), OV9281 (96fps, 1MP, used in ORB-SLAM demo setups), and the Prophesee Metavision event camera (no shutter — asynchronous per-pixel events at µs timing resolution, immune to motion blur by design).</p>

    <h3>11.2 Feature Detection and Description</h3>
    <p>SLAM frontends track salient image regions across frames. The two-step process — (1) <em>detection</em>: find repeatable locations, and (2) <em>description</em>: encode a compact invariant signature for matching — determines the entire system's robustness, speed, and accuracy.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Feature Detector/Descriptor Comparison</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-slate-300 mt-2">
                <thead><tr class="text-sky-400 border-b border-slate-700">
                    <th class="text-left py-1 pr-3">Algorithm</th>
                    <th class="text-left py-1 pr-3">Scale-Inv</th>
                    <th class="text-left py-1 pr-3">Rot-Inv</th>
                    <th class="text-left py-1 pr-3">CPU Speed</th>
                    <th class="text-left py-1 pr-3">Descriptor</th>
                    <th class="text-left py-1">Primary SLAM Use</th>
                </tr></thead>
                <tbody>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-amber-400">ORB</td><td class="py-1 pr-3 text-green-400">Yes (pyramid)</td><td class="py-1 pr-3 text-green-400">Yes (centroid)</td><td class="py-1 pr-3 text-green-400">~5ms (VGA)</td><td class="py-1 pr-3">256-bit binary</td><td class="py-1">ORB-SLAM3, standard real-time SLAM — patent-free, Hamming match</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-sky-400">FAST</td><td class="py-1 pr-3 text-red-400">No</td><td class="py-1 pr-3 text-red-400">No</td><td class="py-1 pr-3 text-green-400">&lt;1ms (VGA)</td><td class="py-1 pr-3">None (detector only)</td><td class="py-1">VIO frontend — raw detection speed; paired with LK optical flow</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-sky-400">SIFT</td><td class="py-1 pr-3 text-green-400">Yes (DoG)</td><td class="py-1 pr-3 text-green-400">Yes (gradient hist)</td><td class="py-1 pr-3 text-red-400">~80ms (VGA)</td><td class="py-1 pr-3">128-float vector</td><td class="py-1">Offline mapping, loop closure query. Patent expired 2020 — now free.</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-emerald-400">SuperPoint</td><td class="py-1 pr-3 text-green-400">Yes (learned)</td><td class="py-1 pr-3 text-green-400">Yes (learned)</td><td class="py-1 pr-3 text-amber-400">~12ms (GPU)</td><td class="py-1 pr-3">256-float vector</td><td class="py-1">Learned feature SLAM; excels on textureless/nighttime scenes</td></tr>
                    <tr><td class="py-1 pr-3 font-mono text-slate-400">Harris/Shi-Tomasi</td><td class="py-1 pr-3 text-red-400">No</td><td class="py-1 pr-3 text-amber-400">Partial</td><td class="py-1 pr-3 text-green-400">~3ms (VGA)</td><td class="py-1 pr-3">None (detector only)</td><td class="py-1">Shi-Tomasi used in Lucas-Kanade optical flow frontend (cv2.goodFeaturesToTrack)</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <h4>ORB: Oriented FAST and Rotated BRIEF — Full Algorithm</h4>
    <p>ORB (Rublee et al., ICCV 2011) is the dominant descriptor in real-time drone SLAM. Binary descriptors enable XOR+popcount matching — one CPU instruction per 64 bits. No GPU required. Patent-free. Used in ORB-SLAM3 exclusively.</p>

    <div class="insight-box">
        <div class="insight-label">ORB DESCRIPTOR PIPELINE</div>
        <p class="text-slate-200 text-sm mt-1">ORB detects scale-invariant corners using a Gaussian pyramid, assigns rotation invariance via the intensity centroid, then encodes each keypoint as a 256-bit binary string — enabling XOR-based matching in a single CPU instruction per 64 bits. Its patent-free status and near-GPU speed make it the dominant descriptor in drone SLAM.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Step 1 — Gaussian scale pyramid (L=8 levels, scale factor s=1.2):<br>
  Build 8 downsampled versions of the input image<br>
  Detect features at each level: achieves scale invariance without expensive DoG<br>
  Total features distributed across levels: ~1000 per image, ~125/level<br>
  Features at level l correspond to scale s^l in the original image<br><br>
Step 2 — FAST-9 corner detection at each pyramid level:<br>
  For candidate pixel p, sample 16 pixels on a Bresenham circle of radius r=3<br>
  p is a keypoint if ≥9 CONTIGUOUS circle pixels are ALL brighter than I(p)+t<br>
  OR all darker than I(p)-t, where t=20 (intensity threshold)<br>
  Apply Harris score to rank: score = det(M) - k*trace(M)^2, k=0.04<br>
  M = sum over patch of: [Ix^2, Ix*Iy; Ix*Iy, Iy^2] (structure tensor)<br>
  Non-maximum suppression: keep top-N per image quadrant for uniform coverage<br><br>
Step 3 — Orientation assignment (rotation invariance via intensity centroid):<br>
  For patch centered on keypoint, compute image moments:<br>
  m_10 = sum_{x,y in patch} x * I(x,y)<br>
  m_01 = sum_{x,y in patch} y * I(x,y)<br>
  m_00 = sum_{x,y in patch} I(x,y)<br>
  Centroid: C = (m_10/m_00, m_01/m_00)<br>
  Keypoint orientation: theta = atan2(m_01, m_10)<br><br>
Step 4 — rBRIEF descriptor (256-bit binary string):<br>
  Pre-learned set of 256 pixel pair tests {(p_i, q_i)} — chosen to be<br>
  de-correlated and high-variance via offline greedy search<br>
  Each test bit: b_k = 1 if I(p_i) &lt; I(q_i)  else  0<br>
  Pairs are ROTATED by theta (from Step 3) → steered descriptor<br>
  Result: 256-bit vector. Hamming distance: popcount(d1 XOR d2) in [0, 256]<br><br>
Matching: Lowe ratio test (rejects ambiguous matches):<br>
  For descriptor d, find nearest n1 and second-nearest n2<br>
  Accept match only if: hamming(d, n1) / hamming(d, n2) &lt; 0.75<br>
  This rejects 90% of false matches while keeping 95% of true matches
    </div>
</details>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-4">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: ORB Detection, Matching, and RANSAC Filtering</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import cv2
import numpy as np

orb = cv2.ORB_create(nfeatures=1000, scaleFactor=1.2, nlevels=8,
                      edgeThreshold=31, patchSize=31, fastThreshold=20)

img1 = cv2.imread("frame_001.jpg", cv2.IMREAD_GRAYSCALE)
img2 = cv2.imread("frame_002.jpg", cv2.IMREAD_GRAYSCALE)

kp1, desc1 = orb.detectAndCompute(img1, None)
kp2, desc2 = orb.detectAndCompute(img2, None)

# Brute-force Hamming matching with kNN (k=2 for ratio test)
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
raw = bf.knnMatch(desc1, desc2, k=2)

# Lowe ratio test: keep unambiguous matches
good = [m for m, n in raw if m.distance / n.distance &lt; 0.75]

# Extract matched pixel coordinates (Nx2 float arrays)
pts1 = np.float32([kp1[m.queryIdx].pt for m in good])
pts2 = np.float32([kp2[m.trainIdx].pt for m in good])

# RANSAC geometric verification with 5-point algorithm (Essential matrix)
# K from prior calibration
K = np.array([[640, 0, 640], [0, 640, 360], [0, 0, 1]], dtype=np.float32)
E, mask = cv2.findEssentialMat(pts1, pts2, K, method=cv2.RANSAC, prob=0.999, threshold=1.0)
inliers1 = pts1[mask.ravel() == 1]
inliers2 = pts2[mask.ravel() == 1]
print(f"Matches: {len(good)} raw → {inliers1.shape[0]} RANSAC inliers")</code></pre>
</details>
        </div>
    </div>

    <h3>11.3 Optical Flow</h3>
    <p>Optical flow computes the apparent pixel motion between consecutive frames. Unlike feature matching, it tracks pixels <em>continuously frame-to-frame</em> — faster and more suitable for short-baseline VIO frontends. The Lucas-Kanade algorithm is the workhorse of most VIO systems.</p>

    <h4>Lucas-Kanade Sparse Flow: Full Derivation</h4>

    <div class="insight-box">
        <div class="insight-label">LUCAS-KANADE FLOW</div>
        <p class="text-slate-200 text-sm mt-1">LK solves for 2D pixel motion by assuming all pixels in a small window share the same velocity, turning an underdetermined per-pixel constraint into an overdetermined least-squares system. The invertibility of the resulting structure tensor directly predicts which pixels are trackable — corners yes, flat regions no.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Brightness Constancy Assumption:<br>
  I(x, y, t) = I(x + u*dt, y + v*dt, t + dt)<br>
  "A pixel's intensity doesn't change as it moves — it just translates"<br><br>
First-order Taylor expansion (assuming small motion u*dt, v*dt &lt;&lt; 1):<br>
  I(x,y,t) ≈ I(x,y,t) + I_x*u*dt + I_y*v*dt + I_t*dt<br>
  → I_x*u + I_y*v + I_t = 0   [Optical Flow Constraint Equation (OFCE)]<br><br>
where I_x = ∂I/∂x, I_y = ∂I/∂y (spatial gradients from Sobel filter)<br>
      I_t = I(t) - I(t-dt) (temporal difference)<br><br>
The OFCE is ONE equation with TWO unknowns (u, v) — the aperture problem.<br>
A single pixel can only determine the component of motion perpendicular to its edge.<br><br>
Lucas-Kanade: assume ALL N pixels in a window W move with the SAME (u, v):<br><br>
A * [u, v]^T = b    (over-determined: N equations, 2 unknowns)<br><br>
A = [I_x(p1), I_y(p1)]  b = [-I_t(p1)]<br>
    [I_x(p2), I_y(p2)]      [-I_t(p2)]<br>
    [   ...  ,   ...  ]      [  ...   ]<br><br>
Least squares solution: (A^T * A) * [u, v]^T = A^T * b<br><br>
M = A^T * A = [ sum(Ix^2),    sum(Ix*Iy) ]  ← "structure tensor" (Harris matrix)<br>
              [ sum(Ix*Iy),   sum(Iy^2)  ]<br><br>
[u, v]^T = M^(-1) * A^T * b<br><br>
TRACKABILITY condition: M must be well-conditioned.<br>
Both eigenvalues λ1, λ2 of M must be large → Harris/Shi-Tomasi corner condition<br>
  λ1 ≈ λ2 &gt;&gt; 0: corner — trackable in all directions<br>
  λ1 &gt;&gt; λ2 ≈ 0: edge — only trackable perpendicular to the edge<br>
  λ1 ≈ λ2 ≈ 0: flat region — not trackable<br><br>
Pyramidal LK: run at 4 resolution levels (OpenCV default: winSize=21, maxLevel=3)<br>
Each coarser level estimates large displacements; finer levels refine.<br>
Handles up to ~1/4 image width displacement per frame before losing track.
    </div>
</details>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-4">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: Continuous Shi-Tomasi + Lucas-Kanade Tracking Loop (VIO Frontend Pattern)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import cv2
import numpy as np

shi_params = dict(maxCorners=300, qualityLevel=0.01, minDistance=10, blockSize=7)
lk_params  = dict(winSize=(21, 21), maxLevel=3,
                  criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))

MIN_FEATURES = 150  # Re-detect when tracked count drops below this

cap = cv2.VideoCapture(0)
ret, frame = cap.read()
prev_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
prev_pts  = cv2.goodFeaturesToTrack(prev_gray, mask=None, **shi_params)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    curr_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Track: move prev_pts from prev_gray into curr_gray
    curr_pts, status, err = cv2.calcOpticalFlowPyrLK(
        prev_gray, curr_gray, prev_pts, None, **lk_params)

    good_prev = prev_pts[status == 1]   # successfully tracked source points
    good_curr = curr_pts[status == 1]   # their new positions

    # Re-detect if too few features remain
    if good_curr.shape[0] &lt; MIN_FEATURES:
        new_pts = cv2.goodFeaturesToTrack(curr_gray, mask=None, **shi_params)
        prev_pts = new_pts
    else:
        # Estimate essential matrix from tracked correspondences
        K = np.array([[640, 0, 640], [0, 640, 360], [0, 0, 1]], dtype=np.float32)
        E, mask = cv2.findEssentialMat(good_prev, good_curr, K,
                                        method=cv2.RANSAC, threshold=1.0)
        _, R, t, _ = cv2.recoverPose(E, good_prev, good_curr, K)
        prev_pts = good_curr.reshape(-1, 1, 2)

    prev_gray = curr_gray.copy()</code></pre>
</details>
        </div>
    </div>

    <h4>RAFT: Learning-Based Dense Optical Flow (2020)</h4>
    <p>RAFT (Recurrent All-Pairs Field Transforms, Teed &amp; Deng, ECCV 2020) applies a convolutional feature encoder to both frames, computes a 4D all-pairs correlation volume (all feature-to-feature dot products at all pixel pairs), and iteratively refines a dense flow field with a ConvGRU recurrent unit. RAFT achieves ~1px EPE on the Sintel benchmark, 2–3× better than Lucas-Kanade. RAFT-Small runs at ~25fps on a Jetson Orin NX and is the foundation of DROID-SLAM (Section 11.9). For standard VIO frontends at 30Hz, pyramidal LK remains the CPU-efficient choice; RAFT is used in higher-compute architectures.</p>

    <h3>11.4 Epipolar Geometry and Stereo Vision</h3>
    <p>When the same scene is observed from two camera positions, the geometry of the two views constrains where corresponding points can appear. This <em>epipolar constraint</em> reduces a 2D matching search to a 1D line — reducing computation 10–100× and the false match rate proportionally.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Essential and Fundamental Matrices: Full Derivation</h4>
        <div class="insight-box">
            <div class="insight-label">EPIPOLAR GEOMETRY</div>
            <p class="text-slate-200 text-sm mt-1">The Essential and Fundamental matrices encode the rigid geometry between two camera views, constraining where a corresponding point must lie to a single epipolar line — collapsing a 2D matching search into a 1D one and enabling robust pose recovery from as few as five point pairs.</p>
        </div>
        <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Camera 1 at pose [I | 0] (world origin), Camera 2 at pose [R | t].<br>
A 3D point P seen at p1 in image 1 and p2 in image 2.<br><br>
In Camera 1 frame: x1 = K1^(-1) * p1  (normalized bearing vector)<br>
In Camera 2 frame: x2 = K2^(-1) * p2<br><br>
The coplanarity constraint (three vectors must be coplanar: x1, t, R*x2):<br>
x1^T * (t × R*x2) = 0<br>
x1^T * [t]_x * R * x2 = 0<br><br>
Essential Matrix E = [t]_x * R   (3×3, rank 2)<br><br>
[t]_x = [  0,  -t_z,  t_y ]   (skew-symmetric matrix of translation t)<br>
        [ t_z,   0,  -t_x ]<br>
        [-t_y,  t_x,   0  ]<br><br>
Epipolar constraint in normalized coords:  x2^T * E * x1 = 0<br>
In pixel coords (substitute x = K^(-1) * p):<br>
p2^T * K2^(-T) * E * K1^(-1) * p1 = 0<br>
p2^T * F * p1 = 0   where F = K2^(-T) * E * K1^(-1)   [Fundamental Matrix F]<br><br>
Key properties:<br>
  E has 5 DOF (R has 3, t has 2 in direction — scale lost)<br>
  F has 7 DOF (8 entries minus scale minus rank-2 constraint)<br>
  Both are singular: det(E) = 0, det(F) = 0<br><br>
Epipolar line in image 2 for a point p1 in image 1:<br>
  l2 = F * p1   (3-vector defining a line: a*u + b*v + c = 0)<br>
  Point p2 must lie ON this line → reduces match search from 2D to 1D<br><br>
Recovering R and t from E (4 solutions → disambiguate with chirality test):<br>
SVD: E = U * diag(1, 1, 0) * V^T<br>
W = [0, -1, 0; 1, 0, 0; 0, 0, 1]<br>
Solution set: (R, t) ∈ {(U*W*V^T, u3), (U*W*V^T, -u3), (U*W^T*V^T, u3), (U*W^T*V^T, -u3)}<br>
Chirality: the correct (R, t) is the one where reconstructed 3D points<br>
are in FRONT of both cameras (positive Z in both camera frames)
        </div>
</details>
    </div>

    <h4>RANSAC: Robust Estimation Under Outliers</h4>
    <p>Feature matches always contain outliers (mismatches). RANSAC (Random Sample Consensus, Fischler &amp; Bolles, 1981) finds the largest inlier subset consistent with a geometric model by repeated random sampling.</p>

    <div class="insight-box">
        <div class="insight-label">RANSAC SAMPLE COUNT</div>
        <p class="text-slate-200 text-sm mt-1">The required number of RANSAC iterations grows exponentially with the outlier fraction — using the 5-point algorithm instead of the 8-point algorithm reduces iterations by roughly 8x at 50% outliers, which is why the Nister solver became standard for real-time SLAM.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
RANSAC iterations for desired success probability p = 0.99:<br><br>
N = log(1 - p) / log(1 - (1 - ε)^s)<br><br>
ε = fraction of outliers, s = minimum sample size for model<br><br>
Concrete examples:<br>
  ε=50%, s=5 (5-point Essential): N = log(0.01)/log(1 - 0.5^5) ≈ 146 iterations<br>
  ε=50%, s=8 (8-point Essential): N = log(0.01)/log(1 - 0.5^8) ≈ 1,132 iterations<br>
  ε=70%, s=5:                     N = log(0.01)/log(1 - 0.3^5) ≈ 1,695 iterations<br><br>
The 5-point algorithm (Nister, 2004) is preferred precisely because s=5 instead of 8<br>
→ 8× fewer iterations at 50% outlier rate → faster and more practical in real-time SLAM<br><br>
Inlier test (symmetric epipolar distance):<br>
  For match (p1, p2) and hypothesis F:<br>
  d(p2, F*p1)^2 + d(p1, F^T*p2)^2 &lt; threshold^2<br>
  where d(p, l) = (l^T * p)^2 / (l1^2 + l2^2)  [point-to-line distance]<br>
  Threshold: typically 1.0 pixel (RANSAC) or 0.45 pixel (Sampson distance, tighter)
    </div>
</details>

    <h3>11.5 Visual Odometry Architecture</h3>
    <p>Visual Odometry (VO) estimates the camera trajectory by tracking features between consecutive frames — no persistent global map. Drift accumulates; loop closure (Section 11.8) corrects it. The standard pipeline has two phases with different geometric solvers.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">VO Pipeline Phases</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-2">Phase 1: Map Initialization (2D–2D)</strong>
                <p class="text-slate-300">On startup, no 3D map exists. Solve for relative pose from pixel correspondences only. Use the Essential matrix (calibrated) or Fundamental matrix (uncalibrated) with 5-point RANSAC. Decompose E → (R, t) via SVD. Disambiguate using chirality test. Triangulate 3D landmarks from inlier correspondences: p = (A^T A)^(-1) A^T b using DLT or optimal triangulation. Scale is ARBITRARY for monocular — normalized to ||t||=1. For stereo: scale is metric immediately.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 block mb-2">Phase 2: Tracking (2D–3D PnP)</strong>
                <p class="text-slate-300">Once a 3D map is initialized, each new frame is localized against map points using Perspective-n-Point (PnP). Given N correspondences {P_i (3D), p_i (2D pixel)}, find pose [R|t] minimizing sum of reprojection errors. EPnP (Lepetit 2009) solves in O(N) using 4 control points. RANSAC+EPnP handles 40–60% outliers. Refine with Gauss-Newton Bundle Adjustment over the 5 most recent frames (windowed BA). Typical: ~5ms per frame on Cortex-A78.</p>
            </div>
        </div>
    </div>

    <h4>The Scale Ambiguity Problem (Monocular VO)</h4>
    <p>A monocular camera fundamentally cannot recover absolute metric scale — a scene doubled in size and filmed from twice as far produces identical images. All trajectory estimates are in an arbitrary unit. Solutions used in production drones:</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">IMU Fusion (Best)</h4>
            <p class="text-slate-300 text-xs">IMU provides metric acceleration. VIO initialization (Section 11.6) jointly solves for scale s, gravity direction g, velocity v_0, and biases. After ~10s of dynamic motion: scale converges to &lt;2% error. This is why drone VIO requires an intentional maneuver (figure-8 or similar) at startup.</p>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Known Marker / Object</h4>
            <p class="text-slate-300 text-xs">AprilTag or ArUco marker with known physical size provides a scale reference via PnP. Scale is valid only while the marker is visible. Used for precision landing approaches — marker seen at 2m altitude gives metric scale for the final descent phase.</p>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-slate-400 text-sm">Baro / Rangefinder</h4>
            <p class="text-slate-300 text-xs">Barometer or downward rangefinder provides Z-axis metric scale. Horizontal scale still drifts. Used in ArduPilot optical flow mode — gives bounded altitude in GPS-denied flight at the cost of unbounded horizontal position error over time.</p>
        </div>
    </div>

    <h4>The PnP Problem: Localizing Against a 3D Map</h4>

    <div class="insight-box">
        <div class="insight-label">PNP POSE RECOVERY</div>
        <p class="text-slate-200 text-sm mt-1">PnP localizes a camera against a known 3D map by minimizing reprojection error — how far each predicted landmark pixel deviates from where it is actually observed. EPnP solves this in linear time using virtual control points, then Gauss-Newton refinement converges to sub-pixel RMSE in 3–5 iterations.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
PnP Cost Function (minimize reprojection error):<br><br>
F(R, t) = sum_{i=1}^{N} || p_i - pi(K * (R * P_i + t)) ||^2<br><br>
where pi([x,y,z]) = [x/z, y/z]  (perspective division)<br>
      p_i = observed 2D pixel position<br>
      P_i = known 3D map point position<br><br>
EPnP (Lepetit 2009): O(N) solver using 4 virtual control points c_j<br>
  Express world points as weighted combination: P_i = sum_j alpha_ij * c_j<br>
  Weights alpha_ij computed once (barycentric coordinates, independent of pose)<br>
  Solve for c_j positions in camera frame via null-space of a 12×12 matrix<br>
  Direct, no iteration needed for initial estimate<br><br>
Gauss-Newton refinement (run after EPnP for better accuracy):<br>
  Linearize around current estimate (R_k, t_k):<br>
  delta = -(J^T * J)^(-1) * J^T * e    (normal equations)<br>
  J = Jacobian of reprojection error w.r.t. [rotation, translation] (2N × 6)<br>
  Update pose: R_{k+1}, t_{k+1} from delta via Lie algebra exponential map<br>
  Converges in 3–5 iterations, typical final RMSE: 0.5–2.0 pixels
    </div>
</details>

    <h3>11.6 Visual-Inertial Odometry (VIO)</h3>
    <p>VIO fuses camera and IMU measurements to recover metric-scale motion with bounded drift — more accurate than camera-only VO, more robust than IMU-only dead reckoning. It is the dominant GPS-denied localization method for modern autonomous drones.</p>

    <h4>IMU Noise Model</h4>

    <div class="insight-box">
        <div class="insight-label">IMU NOISE MODEL</div>
        <p class="text-slate-200 text-sm mt-1">MEMS IMU errors come from two sources: additive white noise (washed out by averaging) and a slowly drifting bias (grows as t^2 and eventually dominates). Characterizing both with Allan variance parameters is a prerequisite for VIO initialization and determines how long the drone can dead-reckon before position error becomes unacceptable.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
IMU Measurement Model (stochastic differential equations):<br><br>
Accelerometer:  a_meas(t) = R^T * (a_world(t) - g) + b_a(t) + n_a(t)<br>
Gyroscope:      ω_meas(t) = ω_body(t) + b_g(t) + n_g(t)<br><br>
Where:<br>
  R      = rotation body→world (current attitude)<br>
  g      = [0, 0, -9.81] m/s^2 (gravity in world frame, NED: [0,0,9.81])<br>
  b_a    = accelerometer bias (random walk): db_a/dt = n_ba, n_ba ~ N(0, σ_ba^2 * I)<br>
  b_g    = gyroscope bias (random walk):    db_g/dt = n_bg, n_bg ~ N(0, σ_bg^2 * I)<br>
  n_a    = additive white noise: n_a ~ N(0, σ_a^2 * I)<br>
  n_g    = additive white noise: n_g ~ N(0, σ_g^2 * I)<br><br>
Typical MEMS IMU parameters (e.g., BMI088, used in RealSense T265):<br>
  σ_a  = 0.01  m/s^2 / √Hz    (accelerometer noise density)<br>
  σ_ba = 0.001 m/s^2 / √Hz    (accelerometer random walk — bias drift rate)<br>
  σ_g  = 0.001 rad/s / √Hz    (gyroscope noise density)<br>
  σ_bg = 1e-5  rad/s / √Hz    (gyroscope random walk — lower for MEMS)<br><br>
Position error from pure IMU integration (see Module 9 Section 17.1):<br>
  σ_p(t) ≈ σ_a * t^(3/2) / √3     (white noise contribution)<br>
  σ_p_bias(t) ≈ (1/2) * σ_ba * t^2  (bias drift — grows as t^2, dominant after ~30s)
    </div>
</details>

    <h4>IMU Preintegration on Manifold (Forster et al., 2015/2017)</h4>
    <p>Naive IMU integration must be repeated every time the linearization point (bias estimate) changes during optimization. Preintegration avoids this by defining relative motion quantities that are INDEPENDENT of the absolute state at time i.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Preintegration Theory</h4>
        <div class="insight-box">
            <div class="insight-label">IMU PREINTEGRATION</div>
            <p class="text-slate-200 text-sm mt-1">Preintegration accumulates IMU readings into relative rotation, velocity, and position deltas that are computed once and reused across optimization iterations regardless of the current bias estimate — avoiding expensive re-integration and making real-time VIO viable on embedded processors.</p>
        </div>
        <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Between camera frames i and j (K IMU readings at times t_k, k=i..j-1, dt = 1/400 s):<br><br>
Naive integration in world frame (must be redone when bias changes):<br>
  R_j = R_i * product_k Exp((ω_k - b_g) * dt)<br>
  v_j = v_i + g*(t_j-t_i) + sum_k R_k * (a_k - b_a) * dt<br>
  p_j = p_i + sum_k [v_k*dt + 0.5*R_k*(a_k-b_a)*dt^2] + 0.5*g*(t_j-t_i)^2<br><br>
Preintegration: define Delta quantities in FRAME i coordinates<br>
(these depend ONLY on IMU readings, not on the world-frame state at i):<br><br>
ΔR_ij = product_k Exp((ω_k - b_g) * dt)                        [rotation delta]<br>
Δv_ij = sum_k ΔR_ik * (a_k - b_a) * dt                         [velocity delta]<br>
Δp_ij = sum_k [Δv_ik*dt + 0.5*ΔR_ik*(a_k-b_a)*dt^2]           [position delta]<br><br>
These relate to the absolute states by:<br>
  R_j = R_i * ΔR_ij<br>
  v_j = v_i + g*(t_j-t_i) + R_i * Δv_ij<br>
  p_j = p_i + v_i*(t_j-t_i) + 0.5*g*(t_j-t_i)^2 + R_i * Δp_ij<br><br>
When bias changes by δb_g during optimization, apply FIRST-ORDER correction<br>
instead of re-integrating all K IMU steps (major computational saving):<br>
  ΔR_ij(b_g + δb_g) ≈ ΔR_ij(b_g) * Exp(J^ΔR_bg * δb_g)<br>
  Δv_ij(b + δb) ≈ Δv_ij(b) + J^Δv_ba*δb_a + J^Δv_bg*δb_g<br>
  Δp_ij(b + δb) ≈ Δp_ij(b) + J^Δp_ba*δb_a + J^Δp_bg*δb_g<br><br>
Jacobians J are computed analytically during the forward integration pass.<br>
Noise covariance Σ_ij (9×9 matrix) is propagated via:<br>
  Σ_{k+1} = A_k * Σ_k * A_k^T + B_k * Q * B_k^T<br>
  (Q = block-diag(σ_a^2*I, σ_g^2*I, σ_ba^2*I, σ_bg^2*I) IMU noise covariance)
        </div>
</details>
    </div>

    <h4>VIO Optimization: The Sliding Window Estimator</h4>
    <p>The sliding window optimizer maintains the last K keyframes, their 3D landmarks, and IMU preintegration factors. At each new keyframe it minimizes the total negative log-likelihood (Maximum A Posteriori estimation):</p>

    <div class="insight-box">
        <div class="insight-label">VIO SLIDING WINDOW</div>
        <p class="text-slate-200 text-sm mt-1">The VIO cost function jointly minimizes visual reprojection errors, IMU preintegration residuals, and a marginalization prior — the last term preserves information from removed keyframes without re-processing old data. Schur complement elimination of landmarks makes the remaining sparse pose system solvable in 10–20 ms per keyframe.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Full VIO Cost Function:<br><br>
F(x) = sum over visual factors     || r_vision_ij ||^2_{Σ_ij}<br>
      + sum over IMU factors        || r_imu_ij   ||^2_{Σ_imu_ij}<br>
      + || r_prior ||^2_{Σ_prior}   (Schur-complement prior from marginalization)<br><br>
Visual residual (reprojection error per 3D landmark l, camera j):<br>
r_vision_lj = p_lj_obs - pi(K * (R_j^T * (P_l - t_j)))<br>
  p_lj_obs = observed pixel position of landmark l in frame j<br><br>
IMU residual between frames i and j:<br>
r_imu_ij = [log(ΔR_ij^T * R_i^T * R_j)           ]  (rotation residual, 3D)<br>
           [R_i^T*(v_j - v_i - g*dt_ij) - Δv_ij   ]  (velocity residual, 3D)<br>
           [R_i^T*(p_j-p_i-v_i*dt_ij-0.5*g*dt_ij^2)-Δp_ij] (position, 3D)<br>
           [b_a_j - b_a_i], [b_g_j - b_g_i]           (bias continuity, 3+3D)<br><br>
Solver: Gauss-Newton or Levenberg-Marquardt with Schur complement<br>
  Schur complement eliminates landmarks analytically (they are dense columns)<br>
  Reduces solve to camera-pose-only system (sparse, efficient)<br>
  Solved with CHOLMOD sparse Cholesky or custom band-Cholesky<br>
  Typical: 10–20ms per keyframe on Jetson Orin NX 16GB
    </div>
</details>

    <h4>Filter-Based Alternative: MSCKF</h4>
    <p>The Multi-State Constraint Kalman Filter (Mourikis &amp; Roumeliotis, ICRA 2007) maintains camera poses in the EKF state vector and analytically marginalizes features, creating <em>measurement constraints between poses</em> without estimating feature positions explicitly. MSCKF runs at 100Hz on ARM Cortex-A55, making it suitable for microcontroller-class compute budgets. OpenVINS is the leading open-source MSCKF implementation for drones.</p>

    <h3>11.7 Production Visual SLAM Systems</h3>
    <p>Several mature open-source SLAM systems are available. The right choice depends on sensors, compute, accuracy requirements, and whether a persistent map is needed.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-white">Production Visual SLAM System Comparison (2024)</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-slate-300 mt-2">
                <thead><tr class="text-sky-400 border-b border-slate-700">
                    <th class="text-left py-1 pr-3">System</th>
                    <th class="text-left py-1 pr-3">Method</th>
                    <th class="text-left py-1 pr-3">Sensors</th>
                    <th class="text-left py-1 pr-3">Loop Closure</th>
                    <th class="text-left py-1 pr-3">Map</th>
                    <th class="text-left py-1 pr-3">License</th>
                    <th class="text-left py-1">Best For</th>
                </tr></thead>
                <tbody>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-amber-400">ORB-SLAM3</td><td class="py-1 pr-3">Opt window</td><td class="py-1 pr-3">Mono/Stereo/RGBD+IMU</td><td class="py-1 pr-3 text-green-400">DBoW2</td><td class="py-1 pr-3">Sparse 3D</td><td class="py-1 pr-3">GPLv3</td><td class="py-1">Best accuracy + multi-session. Gold standard for benchmarks.</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-sky-400">OpenVINS</td><td class="py-1 pr-3">MSCKF filter</td><td class="py-1 pr-3">Mono/Stereo+IMU</td><td class="py-1 pr-3 text-red-400">No</td><td class="py-1 pr-3">None</td><td class="py-1 pr-3">GPLv3</td><td class="py-1">Best CPU efficiency, ROS2-native. Ideal for constrained drones.</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-emerald-400">VINS-Fusion</td><td class="py-1 pr-3">Opt window</td><td class="py-1 pr-3">Multi-cam+IMU+GPS/UWB</td><td class="py-1 pr-3 text-green-400">DBoW2</td><td class="py-1 pr-3">Sparse 3D</td><td class="py-1 pr-3">GPLv3</td><td class="py-1">Multi-camera + absolute sensor fusion. GPS/UWB integration built-in.</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-rose-400">Kimera</td><td class="py-1 pr-3">MSCKF+graph</td><td class="py-1 pr-3">Stereo+IMU</td><td class="py-1 pr-3 text-green-400">LCD descriptor</td><td class="py-1 pr-3">3D mesh+semantic</td><td class="py-1 pr-3">BSD</td><td class="py-1">Semantic 3D mesh — labels objects in map. MIT spinout, active dev.</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-purple-400">RTAB-Map</td><td class="py-1 pr-3">Graph SLAM</td><td class="py-1 pr-3">RGBD/Stereo/LiDAR</td><td class="py-1 pr-3 text-green-400">BoW (SURF/ORB)</td><td class="py-1 pr-3">OctoMap/mesh</td><td class="py-1 pr-3">BSD</td><td class="py-1">Dense 3D maps + memory management for large areas. Multi-sensor.</td></tr>
                    <tr><td class="py-1 pr-3 font-mono text-cyan-400">LIO-SAM</td><td class="py-1 pr-3">Factor graph</td><td class="py-1 pr-3">LiDAR+IMU+GPS</td><td class="py-1 pr-3 text-green-400">ICP keyframes</td><td class="py-1 pr-3">Point cloud</td><td class="py-1 pr-3">BSD</td><td class="py-1">Outdoor LiDAR-inertial SLAM. Best for large-area drone mapping.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <h4>ORB-SLAM3: Three-Thread Architecture</h4>
    <p>ORB-SLAM3 (Campos et al., IEEE T-RO 2021) is the current benchmark standard for feature-based SLAM. Three parallel threads divide the work across tracking frequency, map refinement, and global consistency.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">ORB-SLAM3 Thread Pipeline</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase tracking-widest block mb-2">Thread 1: Tracking (30Hz)</strong>
                <p class="text-slate-300 mb-2">Every input frame: detect ORB features → match to current local map via EPnP+RANSAC → compute pose. Keyframe decision: create keyframe if &gt;20% of tracked points are new or tracking quality drops. Triggers relocalization (DBoW2 query) if tracking fails. Must complete in &lt;33ms.</p>
                <p class="text-slate-400">Output: camera pose for every frame. Input to Thread 2 when new keyframe selected.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase tracking-widest block mb-2">Thread 2: Local Mapping (async)</strong>
                <p class="text-slate-300 mb-2">Per new keyframe: triangulate new 3D landmarks from multi-view correspondences. Local Bundle Adjustment over last 10 keyframes + their visible landmarks — jointly minimizes reprojection error. Culls redundant keyframes (&gt;90% point visibility overlap) and landmarks (low parallax, high reprojection error).</p>
                <p class="text-slate-400">Compute: ~80ms per KF on Jetson Orin NX. Runs at KF rate, not frame rate.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
                <strong class="text-purple-400 uppercase tracking-widest block mb-2">Thread 3: Loop + Map Merge</strong>
                <p class="text-slate-300 mb-2">For each new KF: query DBoW2 place recognition database. If candidate found: geometric verification (guided feature matching + Sim3 RANSAC). On success: correct drift via Essential Graph optimization (lightweight pose graph). Trigger full Global Bundle Adjustment asynchronously. Multi-session: merge maps from separate flights.</p>
                <p class="text-slate-400">Runs opportunistically; does not block tracking thread.</p>
            </div>
        </div>
    </div>

    <h4>ORB-SLAM3 Inertial Initialization</h4>
    <p>Monocular-inertial mode must solve a joint initialization problem to recover metric scale. The drone must move dynamically — static initialization is unobservable (all IMU terms cancel).</p>
    <ol class="text-slate-300 text-sm space-y-2 list-decimal pl-6">
        <li><strong>Collect ~2s of data</strong> with sufficient motion (translation + rotation). Drone should perform a brief figure-eight or slight tilt to excite all axes.</li>
        <li><strong>Solve for unknowns</strong>: metric scale s, gravity direction g (in camera frame), initial velocity v_0, and IMU biases b_a, b_g — jointly as a Maximum Likelihood problem using preintegration factors + visual triangulation constraints.</li>
        <li><strong>Re-scale the map</strong>: multiply all 3D point positions and keyframe translations by the recovered scale s.</li>
        <li><strong>Switch to tight coupling</strong>: enable full IMU residuals in the sliding window optimizer. Scale is now metric and stabilized.</li>
        <li><strong>Re-initialization</strong> triggers automatically if tracking fails for &gt;2 seconds (e.g., after a fast rotation causing motion blur).</li>
    </ol>

    <h4>LIO-SAM: LiDAR-Inertial SLAM for Outdoor Drones</h4>
    <p>LIO-SAM (Shan et al., IROS 2020) uses a factor graph (GTSAM) to jointly optimize LiDAR odometry, IMU preintegration, loop closure, and GPS constraints. LiDAR scans are matched using scan-to-map ICP. It handles large-scale outdoor environments (1km+ trajectories) where visual SLAM degrades (sky, sun, textureless ground). The Livox Mid-360 + LIO-SAM pipeline is a standard approach for large-area drone mapping missions.</p>

    <h3>11.8 Loop Closure and Place Recognition</h3>
    <p>Without loop closure, trajectory drift accumulates proportionally to path length. A 1% drift rate produces 10m of error after 1km of flight. Loop closure detects when the drone revisits a known location and uses this constraint to globally redistribute accumulated error across the entire trajectory.</p>

    <h4>DBoW2: Bag of Words Place Recognition</h4>
    <p>DBoW2 (Galvez-López &amp; Tardós, IEEE T-RO 2012) represents each image as a sparse histogram over a pre-trained visual vocabulary. Place recognition becomes a vector similarity query — fast enough to check every new keyframe against the entire session history.</p>

    <div class="insight-box">
        <div class="insight-label">BAG-OF-WORDS RETRIEVAL</div>
        <p class="text-slate-200 text-sm mt-1">DBoW2 represents each camera frame as a sparse TF-IDF histogram over a million-word visual vocabulary, turning loop-closure detection into a vector similarity query that takes ~10 ms regardless of session length. A relative similarity threshold adapts automatically to repetitive scenes like corridors, cutting false positives that fool fixed thresholds.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Vocabulary Construction (offline — runs once, reused across deployments):<br><br>
1. Extract ORB descriptors from 1 million diverse training images<br>
2. Build hierarchical k-means tree: k=10 branches, L=6 levels<br>
   → k^L = 10^6 visual "words" (leaf nodes = cluster centers)<br>
3. Each descriptor quantized to its nearest visual word<br>
4. Word weights: w_i = IDF * TF (inverse document frequency × term frequency)<br>
   IDF_i = log(N / n_i)   [N=total training images, n_i=images containing word i]<br>
   TF = count of word i in current image / total words in current image<br><br>
Online image descriptor:<br>
v = sparse vector of (word_id, weight) pairs — typically 50-300 non-zero entries<br><br>
Similarity score (L1-norm, range [0,1]):<br>
s(v1, v2) = 1 - (1/2) * || v1/|v1|_1 - v2/|v2|_1 ||_1<br><br>
Loop detection threshold (relative to recent keyframe similarity):<br>
s_threshold = 0.75 * s(current_KF, last_consecutive_KF)<br>
Using relative threshold prevents false positives in visually repetitive<br>
environments (corridors, warehouses) — adapts to local scene appearance<br><br>
Geometric verification (after DBoW2 candidate detected):<br>
1. Guided feature matching between candidate and current KF using DBoW2 word grouping<br>
2. Compute Sim3 transform (similarity + rotation + translation, 7 DOF for mono)<br>
   or SE3 transform (6 DOF for stereo/inertial where scale is metric)<br>
3. RANSAC inlier test: accept if inliers &gt; 50 (prevents perceptual aliasing)<br><br>
Query time: ~10ms per keyframe for a 10,000-KF map (k-d tree traversal in vocab)
    </div>
</details>

    <h4>Deep Place Recognition: NetVLAD and HF-Net</h4>
    <p>Classical BoW struggles with large viewpoint changes (&gt;30° rotation) and lighting changes. Deep descriptors are more robust:</p>
    <ul class="text-slate-300 text-sm space-y-2">
        <li><strong>NetVLAD</strong> (Arandjelovic et al., CVPR 2016): CNN-based image descriptor producing a 4096-D global descriptor via differentiable VLAD pooling. Trained with a GPS-tagged street-view dataset using a triplet ranking loss. Outperforms DBoW2 by 20–40% on illumination-changed sequences (day vs. night). Cost: requires GPU inference, ~30ms per image on Jetson.</li>
        <li><strong>HF-Net</strong> (Sarlin et al., CVPR 2019): Hierarchical Localization using a single CNN that simultaneously predicts NetVLAD global descriptors (for place retrieval) + local SuperPoint features (for pose estimation). Enables coarse-to-fine localization: place retrieval retrieves top-K candidate database images, then feature matching refines to 6-DoF pose. State-of-the-art for large-scale visual localization (used in the Niantic localization system).</li>
    </ul>

    <h4>Pose Graph Optimization</h4>
    <p>After loop closure detection, the accumulated trajectory is modeled as a pose graph — keyframes as nodes, odometry and loop closure constraints as edges. Optimization finds the Maximum A Posteriori trajectory.</p>

    <div class="insight-box">
        <div class="insight-label">POSE GRAPH OPTIMIZATION</div>
        <p class="text-slate-200 text-sm mt-1">After loop closure is detected, accumulated trajectory drift is redistributed by solving for the MAP trajectory on SE(3) — a sparse least-squares problem because each keyframe only connects to a handful of neighbors. GTSAM's iSAM2 solver handles 50,000 keyframes in ~200 ms using incremental sparse Cholesky factorization.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Pose graph: nodes x = {T_1, T_2, ..., T_N}  (each T_i ∈ SE(3))<br>
Edges: (i, j, z_ij, Ω_ij) where z_ij = measured relative pose, Ω_ij = information matrix<br><br>
MAP cost function (minimize total squared Mahalanobis distance):<br><br>
F*(x) = (1/2) * sum_{(i,j) ∈ Edges} e_ij(x)^T * Ω_ij * e_ij(x)<br><br>
Residual in Lie algebra (6-vector, using the logarithm map on SE(3)):<br>
e_ij(x) = log(z_ij^(-1) * T_i^(-1) * T_j)   [SE(3) residual]<br><br>
Solved with:<br>
  g2o (Kümmerle et al., ICRA 2011) — general least-squares on manifolds<br>
  GTSAM (Dellaert, 2012) — factor graphs, iSAM2 incremental solver<br>
  Both use sparse Cholesky factorization — exploits sparsity (each KF<br>
  connected to ~10 neighbors, not all N → band-sparse linear system)<br><br>
Complexity: O(N * k^3) where k = average degree — roughly O(N) for sparse graphs<br>
Wall time: ~5ms for 1,000 KFs, ~200ms for 50,000 KFs (GTSAM on 4-core CPU)<br><br>
After pose graph optimization: recompute 3D landmark positions from<br>
optimized poses via triangulation or Bundle Adjustment (more expensive).<br>
ORB-SLAM3 runs full Global BA asynchronously after Essential Graph optimization.
    </div>
</details>

    <h3>11.9 Deep Learning Frontiers in Perception</h3>
    <p>Classical geometric SLAM excels in textured, static, well-lit environments. Deep learning extends capability to low-texture surfaces, dynamic scenes, night imagery, and produces richer maps with semantic understanding.</p>

    <h4>SuperPoint + LightGlue: Learned Feature Matching (2023 State-of-the-Art)</h4>
    <p>SuperPoint (DeTone et al., CVPR Workshops 2018) trains a Homographic Adaptation self-supervised pipeline: generate synthetic corner images → warp with random homographies → train the network to produce consistent detections and 256-D descriptors across the warps. LightGlue (Lindenberger et al., ICCV 2023) replaces the brute-force ratio test + RANSAC with an attention-based Graph Neural Network that learns to predict match confidence. On standard benchmarks (Hpatches, Megadepth), SuperPoint+LightGlue outperforms ORB+RANSAC by 15–35% in AUC@5° pose error — with especially large gains on textureless indoor scenes that defeat ORB entirely.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-4">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: SuperPoint + LightGlue Feature Matching (kornia / lightglue library)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import torch
from lightglue import LightGlue, SuperPoint
from lightglue.utils import load_image, rbd

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load models (download weights on first run)
extractor = SuperPoint(max_num_keypoints=1024).eval().to(device)
matcher   = LightGlue(features="superpoint").eval().to(device)

img0 = load_image("frame_001.jpg").to(device)  # (1, 3, H, W), float [0,1]
img1 = load_image("frame_002.jpg").to(device)

# Extract features from each image independently
feats0 = extractor.extract(img0)  # dict: keypoints (1,N,2), descriptors (1,N,256), scores
feats1 = extractor.extract(img1)

# Match: GNN infers correspondence confidence between all N×M pairs
matches01 = matcher({"image0": feats0, "image1": feats1})
feats0, feats1, matches01 = [rbd(x) for x in [feats0, feats1, matches01]]

# Extract matched keypoints (no RANSAC needed — LightGlue filters internally)
kpts0 = feats0["keypoints"][matches01["matches"][:, 0]]  # (M, 2) matched kps in img0
kpts1 = feats1["keypoints"][matches01["matches"][:, 1]]  # (M, 2) matched kps in img1
scores = matches01["scores"]  # (M,) match confidence in [0, 1]

print(f"Matched {kpts0.shape[0]} pairs (RANSAC still recommended for pose estimation)")</code></pre>
</details>
        </div>
    </div>

    <h4>Monocular Depth Estimation: Depth Anything v2 (2024)</h4>
    <p>Depth Anything v2 (Yang et al., NeurIPS 2024) uses a DINOv2 ViT-Large encoder pretrained on 142M images, fine-tuned on 595K labeled depth images + 62M synthetic images using a teacher-student self-training strategy. It produces relative depth maps (not metric) from a single RGB frame — the best publicly available monocular depth model as of 2025. Metric versions (fine-tuned on KITTI outdoor or NYU-Depth indoor with real scale) produce absolute depth estimates suitable for drone obstacle awareness at modest range (&lt;10m) without a stereo camera.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-amber-400 text-sm">Self-Supervised Depth Training: MonoDepth2 Loss (Godard et al., ICCV 2019)</h4>
        <div class="insight-box">
            <div class="insight-label">SELF-SUPERVISED DEPTH</div>
            <p class="text-slate-200 text-sm mt-1">MonoDepth2 trains depth and pose networks jointly on unlabeled video by checking that the depth prediction correctly warps neighboring frames onto the current frame — if the photometric reconstruction is sharp, the depth must be right. Auto-masking and an edge-aware smoothness term handle occlusions and object boundaries without any ground-truth depth labels.</p>
        </div>
        <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Training setup: video triplet (I_{t-1}, I_t, I_{t+1}) — no depth labels needed<br><br>
Train two networks jointly:<br>
  DepthNet(I_t) → D_t  (dense depth map)<br>
  PoseNet(I_t, I_{t'}) → T_{t→t'}  (6-DoF relative camera pose)<br><br>
Synthesize I_t from frame t' using predicted depth and pose:<br>
  I_hat_{t'→t}(p) = I_{t'}(π(K * T_{t'→t} * D_t(p) * K^(-1) * p_h))<br>
  where π() = perspective projection, p_h = homogeneous pixel coords<br>
  Differentiable bilinear sampling enables gradients through the warp<br><br>
Photometric reconstruction loss (SSIM + L1 blend):<br>
  pe(I_a, I_b) = α*(1-SSIM(I_a, I_b))/2 + (1-α)*|I_a - I_b|  (α=0.85)<br><br>
Final loss per pixel (minimum over t-1 and t+1 warpings — handles occlusion):<br>
  L_photo = min_{t' ∈ {t-1, t+1}} pe(I_t, I_hat_{t'→t})<br><br>
Auto-masking (ignore stationary pixels — camera moved but pixel didn't):<br>
  μ_p = [min_{t'} pe(I_t, I_hat_{t'→t})] &lt; [min_{t'} pe(I_t, I_{t'})]<br>
  Only backprop through pixels where warped frame is sharper than raw frame<br><br>
Edge-aware smoothness regularization:<br>
  L_smooth = |∂^2_x D| * e^(-|∂_x I|) + |∂^2_y D| * e^(-|∂_y I|)<br>
  Penalizes depth discontinuities EXCEPT at image edges (where depth should change)
        </div>
</details>
    </div>

    <h4>DROID-SLAM: Recurrent Deep SLAM (Teed &amp; Deng, NeurIPS 2021)</h4>
    <p>DROID-SLAM replaces the geometric feature tracking frontend with a learned RAFT-based optical flow network. A 4D correlation volume (all feature-to-feature dot products) is computed once; a ConvGRU iteratively refines dense flow predictions between ALL active frame pairs simultaneously. A differentiable Dense Bundle Adjustment (DBA) layer acts as the backend — it solves for camera poses and depth maps that are consistent with the flow predictions. On EuRoC MAV, DROID-SLAM achieves 30–50% lower ATE than ORB-SLAM3 in monocular mode, approaching stereo-inertial performance. Limitation: requires CUDA GPU (RTX 3060 minimum for real-time). The GPU requirement currently limits drone deployment to larger platforms (Jetson AGX Orin class).</p>

    <h4>3D Gaussian Splatting for Dense Mapping (2023–2025)</h4>
    <p>3D Gaussian Splatting (3DGS, Kerbl et al., SIGGRAPH 2023) represents a scene as millions of 3D Gaussian primitives — each with position µ, covariance Σ (encoding orientation and scale), opacity α, and view-dependent color (spherical harmonics coefficients). Novel views are rendered via alpha compositing: Gaussians are sorted by depth, then splatted onto the image plane using the EWA splatting formula:</p>

    <div class="insight-box">
        <div class="insight-label">3D GAUSSIAN SPLATTING</div>
        <p class="text-slate-200 text-sm mt-1">Each 3D Gaussian is projected to a 2D ellipse via the EWA formula, then composited front-to-back with learned opacity — rendering a 1080p novel view at 30–100 fps, orders of magnitude faster than NeRF. Initialized from a sparse SfM point cloud, Gaussians are adaptively split and pruned during training based on gradient magnitude.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
EWA Splatting — project 3D Gaussian to 2D image space:<br><br>
3D covariance Σ = R * S * S^T * R^T   (R=rotation, S=diagonal scale matrix)<br>
2D covariance Σ_2D = J * W * Σ * W^T * J^T<br>
  W = view transform (world→camera), J = Jacobian of perspective projection<br><br>
Per-pixel color rendering (front-to-back alpha blending):<br>
C(p) = sum_{i ordered front-to-back} c_i * α_i * prod_{j &lt; i}(1 - α_j)<br><br>
α_i = o_i * exp(-0.5 * (p - µ_i)^T * Σ_2D_i^(-1) * (p - µ_i))<br>
  o_i = learned opacity, µ_i = 2D projection of 3D Gaussian center<br><br>
Training: initialized from SfM point cloud, optimized via photometric loss<br>
  with adaptive density control (split/clone/remove Gaussians based on gradient)<br>
Rendering speed: 30–100 fps at 1080p on RTX 3090 — orders of magnitude<br>
faster than NeRF for rendering (but similar training time)<br><br>
SLAM applications (2024):<br>
  SplaTAM (Keetha et al.): uses Gaussians as map, optimizes camera poses frame-by-frame<br>
  MonoGS (Matsuki et al.): joint Gaussian map + pose optimization, monocular<br>
  Current limitation: real-time map building not yet achievable on drone hardware<br>
  Active research: reducing Gaussian count while maintaining accuracy for navigation
    </div>
</details>

    <h3>11.10 Real-Time Deployment on Drone Hardware</h3>
    <p>SLAM algorithms must fit within the power and weight budget of a drone. This section covers the hardware options, integration patterns, and evaluation methodology for real deployments.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-white">Compute Platforms for Drone SLAM (2024)</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-slate-300 mt-2">
                <thead><tr class="text-sky-400 border-b border-slate-700">
                    <th class="text-left py-1 pr-3">Platform</th>
                    <th class="text-left py-1 pr-3">CPU</th>
                    <th class="text-left py-1 pr-3">GPU / NPU</th>
                    <th class="text-left py-1 pr-3">RAM</th>
                    <th class="text-left py-1 pr-3">SLAM Perf</th>
                    <th class="text-left py-1 pr-3">TDP</th>
                    <th class="text-left py-1">Recommendation</th>
                </tr></thead>
                <tbody>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-amber-400">Jetson Orin NX 16GB</td><td class="py-1 pr-3">8×A78AE@2.0GHz</td><td class="py-1 pr-3">1024-core Ampere + 32 TOPS</td><td class="py-1 pr-3">16GB LPDDR5</td><td class="py-1 pr-3">ORB-SLAM3 + LightGlue real-time</td><td class="py-1 pr-3">10–25W</td><td class="py-1">Best drone SLAM platform. Module on carrier board: ~60g.</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-sky-400">Jetson Orin Nano 8GB</td><td class="py-1 pr-3">6×A78AE@1.5GHz</td><td class="py-1 pr-3">1024-core + 20 TOPS</td><td class="py-1 pr-3">8GB LPDDR5</td><td class="py-1 pr-3">OpenVINS + RTAB-Map</td><td class="py-1 pr-3">7–15W</td><td class="py-1">Best efficiency for mid-size drones (250–500g payload class).</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-emerald-400">Qualcomm RB5 (QRB5165)</td><td class="py-1 pr-3">Snapdragon 865, 8-core</td><td class="py-1 pr-3">Adreno 650 + 15 TOPS HTA</td><td class="py-1 pr-3">8GB LPDDR5</td><td class="py-1 pr-3">VINS-Fusion + OpenVINS</td><td class="py-1 pr-3">5–10W</td><td class="py-1">Commercial-drone silicon (DJI-class internals). Qualcomm AI SDK support.</td></tr>
                    <tr><td class="py-1 pr-3 font-mono text-slate-400">OAK-D Pro (onboard VPU)</td><td class="py-1 pr-3">RVC2 (MyriadX)</td><td class="py-1 pr-3">4 TOPS neural compute</td><td class="py-1 pr-3">4GB (host req)</td><td class="py-1 pr-3">Stereo depth + MobileNet at 30fps</td><td class="py-1 pr-3">7.5W</td><td class="py-1">Standalone depth + detection. Offloads stereo from companion CPU.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <h4>ArduPilot VIO Integration via MAVLink ExternalNav</h4>
    <p>Companion computers running VIO (OpenVINS, ORB-SLAM3, etc.) feed position estimates to ArduPilot EKF3 via MAVLink. This section shows the complete integration protocol.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-amber-400 text-sm">MAVLink ExternalNav Protocol — Step by Step</h4>
        <ol class="text-slate-300 text-sm list-decimal pl-6 mt-2 space-y-2">
            <li><strong>EKF3 source configuration:</strong> Set <code>EK3_SRC1_POSXY=6</code> (ExternalNav), <code>EK3_SRC1_VELXY=6</code>, <code>EK3_SRC1_POSZ=6</code>, <code>EK3_SRC1_YAW=6</code> for full GPS-denied VIO mode. Keep <code>EK3_SRC1_POSZ=1</code> (barometer) if you want altitude fallback.</li>
            <li><strong>Define NED origin:</strong> Send <code>SET_GPS_GLOBAL_ORIGIN</code> (MSG #48) once at startup — sets the lat/lon/alt that corresponds to VIO position (0, 0, 0). Use the drone's takeoff GPS fix or a pre-surveyed benchmark.</li>
            <li><strong>Continuous pose stream:</strong> Send <code>VISION_POSITION_ESTIMATE</code> (MSG #102) at 15–30Hz. Fields: timestamp (µs), x/y/z in NED meters, roll/pitch/yaw in radians, covariance (21-element upper triangle of 6×6 matrix — set to zero to use EKF3 default noise params).</li>
            <li><strong>Reset counter:</strong> When VIO tracking fails and reinitializes, increment the <code>reset_counter</code> field. EKF3 discards the prior VIO state and re-anchors from the new estimate — prevents state corruption after VIO jumps.</li>
            <li><strong>Velocity-only fallback:</strong> If VIO loses loop closure but still tracks velocity reliably, send <code>VISION_SPEED_ESTIMATE</code> (MSG #103) — EKF3 can bound velocity drift even without absolute position. Useful during fast-motion periods that cause ORB-SLAM3 tracking loss.</li>
        </ol>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-4">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: VIO→ArduPilot MAVLink Bridge (pymavlink)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">from pymavlink import mavutil
import time, threading

mav = mavutil.mavlink_connection("/dev/ttyUSB0", baud=921600)
mav.wait_heartbeat()

# Set NED origin (once at startup — use drone's GPS fix or pre-surveyed point)
mav.mav.set_gps_global_origin_send(
    mav.target_system,
    int(37.7749  * 1e7),   # latitude  × 1e7 (degrees)
    int(-122.4194 * 1e7),  # longitude × 1e7 (degrees)
    int(10.0     * 1e3)    # altitude  × 1e3 (mm)
)

reset_counter = 0   # increment whenever VIO reinitializes after tracking failure

def send_vio_estimate(x, y, z, roll, pitch, yaw, pos_std=0.05, att_std=0.01):
    """Send VISION_POSITION_ESTIMATE to ArduPilot EKF3."""
    # Upper triangle of 6×6 pose covariance (position xyz, attitude rpy)
    var_p, var_a = pos_std**2, att_std**2
    cov = [var_p,0,0,0,0,0,  var_p,0,0,0,0,  var_p,0,0,0,  var_a,0,0,  var_a,0,  var_a]
    mav.mav.vision_position_estimate_send(
        int(time.time() * 1e6),  # µs timestamp
        x, y, z,                  # NED position in meters
        roll, pitch, yaw,         # attitude in radians
        cov, reset_counter
    )

def vio_callback(pose):
    """Called by your VIO system at 30Hz with the latest pose estimate."""
    send_vio_estimate(pose.x, pose.y, pose.z,
                       pose.roll, pose.pitch, pose.yaw)

# Example: OpenVINS ROS2 bridge calls vio_callback on /ov_msckf/odomimu topic</code></pre>
</details>
        </div>
    </div>

    <h4>EuRoC MAV Benchmark: Standard SLAM Evaluation</h4>
    <p>The EuRoC MAV dataset (Burri et al., IJRR 2016, ETH Zurich) is the standard benchmark for drone SLAM. It contains 11 sequences from an Asctec Firefly hexacopter flying in two indoor environments (Machine Hall MH, Vicon Room V1/V2), with millimeter-accurate ground truth from a Vicon motion capture system. The <strong>Absolute Trajectory Error (ATE RMSE)</strong> metric measures the alignment between the estimated and ground-truth trajectories after optimal rigid-body alignment:</p>

    <div class="insight-box">
        <div class="insight-label">ATE TRAJECTORY ERROR</div>
        <p class="text-slate-200 text-sm mt-1">Absolute Trajectory Error (ATE RMSE) measures how far the estimated path deviates from Vicon ground truth after optimal rigid-body alignment — the standard metric for drone SLAM evaluation on the EuRoC MAV dataset. Lower is better; values below 0.05 m are considered high precision for autonomous drone applications.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
ATE RMSE computation:<br><br>
1. Align estimated trajectory T_est with ground truth T_gt using Horn's method<br>
   (optimal rotation + translation, optionally scale — use Sim3 for monocular)<br>
2. For each frame i: e_i = || p_gt_i - (s*R*p_est_i + t) ||<br>
   (Euclidean distance between aligned position estimates)<br>
3. ATE RMSE = sqrt(mean(e_i^2))   [meters]
    </div>
</details>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">EuRoC MAV Benchmark — ATE RMSE (lower = better)</div>
        <table class="w-full text-xs font-mono">
            <thead><tr class="bg-slate-800/50 text-slate-400">
                <th class="p-3 text-left">System</th>
                <th class="p-3 text-left">Mode</th>
                <th class="p-3 text-left">MH_01 Easy</th>
                <th class="p-3 text-left">MH_04 Hard</th>
                <th class="p-3 text-left">V1_02 Med</th>
                <th class="p-3 text-left">V2_02 Med</th>
            </tr></thead>
            <tbody class="text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-amber-400">ORB-SLAM3</td><td class="p-3">Stereo+IMU</td><td class="p-3 text-green-400">0.016 m</td><td class="p-3 text-green-400">0.038 m</td><td class="p-3 text-green-400">0.018 m</td><td class="p-3 text-green-400">0.021 m</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-sky-400">OpenVINS</td><td class="p-3">Stereo+IMU</td><td class="p-3">0.041 m</td><td class="p-3">0.089 m</td><td class="p-3">0.038 m</td><td class="p-3">0.052 m</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-emerald-400">VINS-Mono</td><td class="p-3">Mono+IMU</td><td class="p-3">0.081 m</td><td class="p-3">0.135 m</td><td class="p-3">0.072 m</td><td class="p-3">0.098 m</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-purple-400">DROID-SLAM</td><td class="p-3">Monocular</td><td class="p-3">0.018 m</td><td class="p-3">0.042 m</td><td class="p-3">0.022 m</td><td class="p-3">0.027 m</td></tr>
            </tbody>
        </table>
        <p class="text-slate-500 text-xs px-4 py-2">Note: ORB-SLAM3 Stereo+IMU vs DROID-SLAM monocular is not apples-to-apples — DROID-SLAM's GPU requirement limits practical drone deployment to larger platforms.</p>
    </div>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">SLAM System Quick-Reference Card</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-2">ROS 2 Packages (Humble / Iron / Jazzy)</strong>
                <ul class="text-slate-400 space-y-1 font-mono">
                    <li>ORB-SLAM3:    ros2-orb-slam3 (community maintained)</li>
                    <li>OpenVINS:     ov_ros2 (official, well-maintained)</li>
                    <li>VINS-Fusion:  VINS-Fusion-ROS2 (third-party port)</li>
                    <li>Kimera:       kimera_vio_ros (MIT, ROS2 native)</li>
                    <li>RTAB-Map:     rtabmap_ros (official ROS2 support)</li>
                    <li>LIO-SAM:      LIO-SAM (ROS2 branch maintained)</li>
                    <li>LightGlue:    pip install lightglue (standalone)</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-2">Common SLAM Failure Modes and Mitigations</strong>
                <ul class="text-slate-400 space-y-1">
                    <li><span class="text-rose-400">Textureless scene</span> — white walls, sky: add IR dot projector (OAK-D Pro active stereo) or switch to LiDAR</li>
                    <li><span class="text-rose-400">Motion blur</span> — fast yaw rate &gt;5 rad/s: global shutter camera required; reduce camera exposure</li>
                    <li><span class="text-rose-400">Scale divergence</span> — monocular VIO: ensure dynamic init motion (3+ axes), check IMU saturation range (±16g)</li>
                    <li><span class="text-rose-400">Relocalization failure</span> — insufficient visual overlap: lower DBoW2 threshold; increase keyframe rate</li>
                    <li><span class="text-rose-400">Dynamic objects</span> — moving people/vehicles: use semantic masking to exclude dynamic classes from feature tracking</li>
                    <li><span class="text-rose-400">Lighting change</span> — sunbeams, shadows: histogram equalization or CLAHE preprocessing; learned features (SuperPoint)</li>
                </ul>
            </div>
        </div>
    </div>
</div>
`;
