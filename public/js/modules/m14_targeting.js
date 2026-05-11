export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 14</span>
    <h2>AI Targeting &amp; Kinematics</h2>
    <p>Detecting an object in a single frame is computer vision. Tracking it persistently through 3D space, estimating its velocity and trajectory, geolocating it in world coordinates, and controlling a drone to intercept or follow it — that is autonomous targeting. This module covers the full engineering stack: multi-object tracking algorithms, state estimation filters, camera-to-world projection, guidance laws, cascade control, sensor fusion, and the real-world implementation details needed to deploy a complete airborne tracking system.</p>

    <h3>14.1 Multi-Object Tracking (MOT) — Beyond DeepSORT</h3>
    <p>YOLO tells you "there is a car at these pixel coordinates in this frame." Multi-object tracking (MOT) answers the harder question: "Is this the same car as in the previous 47 frames, and where will it be in the next frame?" A tracker wraps a detector, maintaining persistent identity across frames through a combination of motion prediction and data association.</p>

    <h4>14.1.1 The SORT Baseline (Bewley et al., 2016)</h4>
    <p>Simple Online and Realtime Tracking (SORT) is the minimal viable tracker. It uses a Kalman filter to predict bounding box motion and the Hungarian algorithm to associate predictions with new detections. State vector: (u, v, s, r, u_dot, v_dot, s_dot) where u,v = center coordinates, s = scale (area), r = aspect ratio. SORT achieves ~260 FPS on a CPU — fast enough to run on embedded hardware. Its critical weakness: it relies entirely on IoU (Intersection over Union) overlap for association. When two targets cross paths or a target disappears briefly, identity switches (ID Switches / IDSW) accumulate rapidly. DeepSORT (Wojke et al., 2017) added a 128-dimensional appearance descriptor CNN to the cost matrix, dramatically reducing ID switches at the cost of ~8ms per frame for re-ID inference.</p>

    <h4>14.1.2 ByteTrack (Zhang et al., 2022) — The Current Standard</h4>
    <p>ByteTrack was the top-performing tracker on the MOT17 and MOT20 benchmarks when published. Its key insight is that DeepSORT discards low-confidence detections (score &lt; 0.5), but these "byte" detections often contain real objects that are partially occluded or far away. ByteTrack performs two-stage association:</p>

    <div class="insight-box">
        <div class="insight-label">BYTETRACK TWO-STAGE ASSOCIATION</div>
        <p class="text-slate-200 text-sm mt-1">ByteTrack runs Hungarian matching twice per frame: first against high-confidence detections, then against low-confidence "byte" detections for tracks that were unmatched in stage 1. This second pass rescues tracks that briefly drop in confidence due to partial occlusion, dramatically cutting identity switches compared to DeepSORT.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
ByteTrack Two-Stage Association Pipeline:

Input: D = all detections from detector (0.0–1.0 confidence scores)
Tracks: T = all currently active Kalman filter tracks

Stage 1: High-confidence association
  D_high = {d in D : score(d) >= thresh_high}  (thresh_high typically 0.5)
  Cost matrix C1[i,j] = IoU_distance(T[i], D_high[j])
  Run Hungarian algorithm on C1
  → Matched tracks get updated. Unmatched tracks preserved.
  → Unmatched high-conf detections → new track candidates.

Stage 2: Low-confidence association (the "byte" step)
  D_low = {d in D : thresh_low <= score(d) < thresh_high}  (thresh_low ~= 0.1)
  T_unmatched = tracks NOT matched in Stage 1
  Cost matrix C2[i,j] = IoU_distance(T_unmatched[i], D_low[j])
  Run Hungarian algorithm on C2
  → Matched tracks: the track survived an occlusion. Update with low-conf box.
  → Still-unmatched tracks: survive for max_age frames (default 30) via KF prediction only.

Result: ByteTrack recovers objects during partial occlusion that DeepSORT loses.
    </div>
</details>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <table class="w-full text-xs font-mono">
            <thead><tr class="bg-slate-800 text-slate-400">
                <th class="px-3 py-2 text-left">Tracker</th>
                <th class="px-3 py-2 text-right">HOTA</th>
                <th class="px-3 py-2 text-right">MOTA</th>
                <th class="px-3 py-2 text-right">IDF1</th>
                <th class="px-3 py-2 text-right">ID Switches</th>
            </tr></thead>
            <tbody class="text-slate-300">
                <tr class="border-t border-slate-700 bg-emerald-950">
                    <td class="px-3 py-2 text-emerald-400 font-semibold">ByteTrack</td>
                    <td class="px-3 py-2 text-right">63.1</td>
                    <td class="px-3 py-2 text-right">80.3</td>
                    <td class="px-3 py-2 text-right">77.3</td>
                    <td class="px-3 py-2 text-right">2,196</td>
                </tr>
                <tr class="border-t border-slate-700">
                    <td class="px-3 py-2">DeepSORT</td>
                    <td class="px-3 py-2 text-right">55.6</td>
                    <td class="px-3 py-2 text-right">75.2</td>
                    <td class="px-3 py-2 text-right">68.4</td>
                    <td class="px-3 py-2 text-right">6,194</td>
                </tr>
            </tbody>
        </table>
        <p class="text-slate-500 text-xs px-3 py-2">MOT17 test set, private detector. Zhang et al., 2022, arXiv:2110.06864</p>
    </div>

    <p>ByteTrack does not use appearance features by default — it relies entirely on IoU distance. This makes it very fast (can track 30 objects at 200+ FPS on a GPU) but vulnerable to ID switches when similar-looking targets cross paths. The appearance-free design is intentional: for most drone tracking scenarios (vehicles, personnel) where targets are spatially separated, IoU is sufficient.</p>

    <h4>14.1.3 StrongSORT and BoT-SORT</h4>
    <p>StrongSORT (Du et al., 2023, arXiv:2202.13514) is an engineering-focused improvement that retrofits stronger components into the SORT framework:</p>
    <ul class="space-y-2 text-sm text-slate-300">
        <li><strong>EMA appearance model:</strong> Instead of a gallery of last-N features, StrongSORT maintains an exponential moving average (EMA) of the appearance embedding per track: f_track = alpha * f_track + (1 - alpha) * f_new, where alpha = 0.9. This smooths out detection-to-detection appearance variation without requiring a separate gallery database.</li>
        <li><strong>NSA Kalman filter:</strong> "Noise Scale Adaptive" — the measurement noise covariance R is dynamically scaled by the detection confidence score. A low-confidence detection (score = 0.3) inflates R, making the Kalman filter trust the measurement less and rely more on prediction. High-confidence detections reduce R, pulling the track state toward the measurement.</li>
        <li><strong>AFLink:</strong> A post-processing graph neural network that links tracklets across short gaps after the main tracking loop finishes. Achieves sub-second re-identification after 1–3 frame gaps with ~2ms overhead.</li>
    </ul>

    <p>BoT-SORT (Aharon et al., 2022, arXiv:2206.14651) adds two key innovations. First, it applies camera motion compensation (CMC) using global feature-based homography estimation — when the drone's camera pans, BoT-SORT estimates the homography between frames and transforms all track positions accordingly before computing IoU. This prevents false ID switches caused by platform motion rather than target motion. Second, it fuses IoU distance with cosine appearance distance using a weighted combination, with the weight tuned on each benchmark. On MOT17, BoT-SORT achieves HOTA=65.0, MOTA=80.5.</p>

    <h4>14.1.4 OC-SORT (Cao et al., 2023) — Observation-Centric</h4>
    <p>OC-SORT (Observation-Centric SORT, arXiv:2203.14360) identifies a fundamental flaw in all Kalman-based trackers: during occlusions, the filter runs in "prediction only" mode, accumulating error from the motion model. When the target reappears, the Kalman state may have drifted significantly, causing association failure. OC-SORT introduces two mechanisms:</p>

    <div class="insight-box">
        <div class="insight-label">OCCLUSION RECOVERY</div>
        <p class="text-slate-200 text-sm mt-1">OC-SORT corrects the direction a track's momentum was pointing when a target was occluded by retroactively interpolating between the last seen position and the re-detected position. It also mixes velocity consistency into the association cost so that a target reappearing nearby but moving the wrong direction is not matched to the wrong track.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
OC-SORT Mechanisms:

1. Observation-Centric Momentum (OCM):
   When target re-appears after T occlusion frames:
   Standard approach: use current KF prediction (may have drifted)
   OC-SORT: compute "virtual trajectory" by linearly interpolating between
             last observation before occlusion and first observation after
   Use interpolated positions to retroactively correct track momentum

2. Observation-Centric Recovery (OCR):
   Re-associates lost tracks using:
   cost = w_iou * IoU_distance + w_vel * velocity_consistency_distance
   velocity_consistency_distance = ||v_track_predicted - v_obs|| / max_vel
   Weights: w_iou = 0.5, w_vel = 0.5 (tunable)

Particularly effective for trajectories with frequent brief occlusions (urban scenes).
    </div>
</details>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <table class="w-full text-xs font-mono">
            <thead><tr class="bg-slate-800 text-slate-400">
                <th class="px-3 py-2 text-left">Tracker</th>
                <th class="px-3 py-2 text-right">HOTA</th>
                <th class="px-3 py-2 text-right">MOTA</th>
                <th class="px-3 py-2 text-right">ID Switches</th>
                <th class="px-3 py-2 text-left">Notes</th>
            </tr></thead>
            <tbody class="text-slate-300">
                <tr class="border-t border-slate-700 bg-emerald-950">
                    <td class="px-3 py-2 text-emerald-400 font-semibold">OC-SORT</td>
                    <td class="px-3 py-2 text-right">63.9</td>
                    <td class="px-3 py-2 text-right">78.0</td>
                    <td class="px-3 py-2 text-right">1,950</td>
                    <td class="px-3 py-2">42% fewer IDSW vs DeepSORT</td>
                </tr>
                <tr class="border-t border-slate-700">
                    <td class="px-3 py-2">DeepSORT</td>
                    <td class="px-3 py-2 text-right">55.6</td>
                    <td class="px-3 py-2 text-right">75.2</td>
                    <td class="px-3 py-2 text-right">6,194</td>
                    <td class="px-3 py-2">Reference baseline</td>
                </tr>
            </tbody>
        </table>
        <p class="text-slate-500 text-xs px-3 py-2">MOT17 test set. Cao et al., 2023, arXiv:2203.14360</p>
    </div>

    <h4>14.1.5 FairMOT and JDE — Joint Detection and Embedding</h4>
    <p>The prior approaches treat detection and tracking as sequential steps: first run the detector, then run the tracker. FairMOT (Wang et al., 2020, IJCV 2022) and JDE (Joint Detection and Embedding, Wang et al., 2019) embed the re-ID feature extraction directly into the detector backbone, producing bounding boxes, confidence scores, AND 128-d appearance embeddings in a single forward pass.</p>

    <div class="insight-box">
        <div class="insight-label">JOINT DETECTION AND RE-ID</div>
        <p class="text-slate-200 text-sm mt-1">FairMOT collapses two separate network passes (detect, then extract appearance) into one by sharing a single feature backbone for both tasks. The key to making this work is using anchor-free detection: each object gets exactly one representative feature vector rather than the ambiguous multiple-anchor representations that confused earlier joint models.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
FairMOT Architecture:
  Backbone: DLA-34 (Deep Layer Aggregation, 34 layers)
  Output heads (shared feature map, stride 4):
    - Detection head: heatmap + offset + size (CenterNet-style)
    - Re-ID head: 128-d embedding per pixel location

  The "fairness" insight: standard anchor-based detectors assign one
  anchor per object. JDE assigns multiple anchors per object, causing
  feature ambiguity in the re-ID head (multiple anchors compete for
  the same identity features). FairMOT uses anchor-free detection,
  ensuring each object has a single representative feature vector.

  Speed: 30 FPS on a single V100 GPU (detection + tracking together)
  vs. YOLO + DeepSORT: ~15 FPS (two sequential network passes)

  Tradeoff: FairMOT requires a domain-specific re-ID training dataset.
  Performance degrades significantly when appearance distribution differs
  from training (e.g., infrared vs. RGB deployment).
    </div>
</details>

    <h4>14.1.6 Transformer-Based Trackers</h4>
    <p>DETR-family trackers reformulate tracking as a set prediction problem, removing the need for hand-crafted IoU matching entirely.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Transformer Tracker Comparison</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase tracking-widest block mb-2">TrackFormer (Meinhardt et al., 2022)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Adds "track queries" to DETR's object queries</li>
                    <li>Each track query attends to encoder features at t and t-1</li>
                    <li>Tracks "propagated" as autoregressive queries across frames</li>
                    <li>No explicit Hungarian matching — handled implicitly by attention</li>
                    <li>MOTA: 74.1 on MOT17 (competitive with ByteTrack)</li>
                    <li>Weakness: slow training convergence (needs 50 epochs vs SORT's zero)</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase tracking-widest block mb-2">MOTR (Zeng et al., 2022)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Fully end-to-end: no NMS, no Hungarian, no IoU</li>
                    <li>Continuous token approach: track tokens persist across frames</li>
                    <li>New track tokens added/removed via learned thresholds</li>
                    <li>MOTA: 73.4 on MOT17 — slightly below SORT-based methods</li>
                    <li>Advantage: handles non-rigid objects better than IoU-based</li>
                    <li>Training: requires full video sequences, not just frame pairs</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase tracking-widest block mb-2">TransTrack (Sun et al., 2021)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Two-stream Transformer: current frame + previous track features</li>
                    <li>Feature interaction via cross-attention between streams</li>
                    <li>Generates new detection proposals + propagates old tracks</li>
                    <li>MOTA: 74.5 on MOT17</li>
                    <li>Inference: ~7 FPS on V100 — too slow for real-time drone use</li>
                    <li>Current gap: transformer trackers trail SORT variants on speed</li>
                </ul>
            </div>
        </div>
        <p class="text-slate-400 text-xs mt-4">Practical verdict (2024): ByteTrack or BoT-SORT remain the dominant choice for drone deployments. Transformer trackers show promise for complex occlusion scenarios but carry 10-50x compute overhead versus IoU-based methods. Watch for RT-DETR-based trackers as Transformer inference cost decreases.</p>
    </div>

    <h4>14.1.7 MOT Metrics — MOTA, HOTA, IDF1</h4>
    <p>The MOT community uses three main metrics that measure fundamentally different things. A system can score well on one while performing poorly on another, so understanding all three is critical for evaluating a tracker for a specific mission.</p>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <table class="w-full text-xs font-mono">
            <thead><tr class="bg-slate-800 text-slate-400">
                <th class="px-3 py-2 text-left">Metric</th>
                <th class="px-3 py-2 text-left">Formula</th>
                <th class="px-3 py-2 text-left">What it measures</th>
                <th class="px-3 py-2 text-left">Range</th>
                <th class="px-3 py-2 text-left">Use when</th>
            </tr></thead>
            <tbody class="text-slate-300">
                <tr class="border-t border-slate-700">
                    <td class="px-3 py-2 text-sky-400 font-semibold">MOTA</td>
                    <td class="px-3 py-2">1 − (FN+FP+IDSW) / GT</td>
                    <td class="px-3 py-2">Detection coverage; ID switches barely penalized</td>
                    <td class="px-3 py-2">(−∞, 1]</td>
                    <td class="px-3 py-2">Crowd counting, detection coverage</td>
                </tr>
                <tr class="border-t border-slate-700">
                    <td class="px-3 py-2 text-emerald-400 font-semibold">IDF1</td>
                    <td class="px-3 py-2">2·IDTP / (2·IDTP+IDFP+IDFN)</td>
                    <td class="px-3 py-2">Identity persistence; heavily penalizes swaps</td>
                    <td class="px-3 py-2">[0, 1]</td>
                    <td class="px-3 py-2">Surveillance, multi-camera re-ID</td>
                </tr>
                <tr class="border-t border-slate-700">
                    <td class="px-3 py-2 text-amber-400 font-semibold">HOTA</td>
                    <td class="px-3 py-2">√(DetA × AssA)</td>
                    <td class="px-3 py-2">Balanced detection + association; primary since 2022</td>
                    <td class="px-3 py-2">[0, 1]</td>
                    <td class="px-3 py-2">General tracker comparison</td>
                </tr>
            </tbody>
        </table>
        <p class="text-slate-500 text-xs px-3 py-2">MOTA: Bernardin &amp; Stiefelhagen, 2008 · IDF1: Ristani et al., 2016 · HOTA: Luiten et al., 2021 (IJCV). ByteTrack reference: HOTA=63.1 on MOT17.</p>
    </div>

    <h3>14.2 State Estimation &amp; Filtering for Aerial Tracking</h3>
    <p>A tracker cannot run the neural network detector at 500 Hz — inference is too expensive. Instead, state estimation filters predict where the target will be between detections, enable smooth control outputs, and handle missed detections gracefully. The choice of filter and motion model critically determines tracking quality on maneuvering targets.</p>

    <h4>14.2.1 Kalman Filter — Linear Target Tracking</h4>
    <p>The Kalman filter (Kalman, 1960) is the optimal linear unbiased estimator for linear Gaussian systems. For tracking a target moving with approximately constant velocity:</p>

    <div class="insight-box">
        <div class="insight-label">KALMAN FILTER INTUITION</div>
        <p class="text-slate-200 text-sm mt-1">The Kalman filter alternates between two steps: predict where the target will be using a physics motion model (state transition matrix F), then correct that prediction using the latest noisy detector measurement. The Kalman gain K automatically weights these two sources based on which is currently more reliable — if the detector is noisy (large R), the filter trusts the motion model more; if the model is uncertain (large Q), it trusts the detector more.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Constant Velocity (CV) State Vector:
  x = [px, py, pz, vx, vy, vz]^T   (position + velocity in NED frame)

State Transition (prediction at timestep dt):
  x_k = F * x_{k-1} + w_k          (w_k ~ N(0, Q))

  F = [1  0  0  dt  0   0 ]
      [0  1  0   0  dt  0 ]
      [0  0  1   0   0  dt]
      [0  0  0   1   0   0]
      [0  0  0   0   1   0]
      [0  0  0   0   0   1]

Observation (pixel centroid from detector → world position):
  z_k = H * x_k + v_k              (v_k ~ N(0, R))
  H = [1 0 0 0 0 0]                 (observing only position)
      [0 1 0 0 0 0]
      [0 0 1 0 0 0]

Predict step:
  x_hat_{k|k-1} = F * x_hat_{k-1|k-1}
  P_{k|k-1}     = F * P_{k-1|k-1} * F^T + Q

Update step (when detection available):
  y   = z_k - H * x_hat_{k|k-1}          (innovation)
  S   = H * P_{k|k-1} * H^T + R          (innovation covariance)
  K   = P_{k|k-1} * H^T * S^{-1}         (Kalman gain)
  x_hat_{k|k} = x_hat_{k|k-1} + K * y
  P_{k|k}     = (I - K*H) * P_{k|k-1}    (covariance update)

Process noise Q encodes: "how much can velocity change between frames?"
For a vehicle at 30 m/s with moderate maneuverability:
  Q = diag([0, 0, 0, sigma_a^2*dt^2, sigma_a^2*dt^2, sigma_a^2*dt^2])
  sigma_a = 2.0 m/s^2  (assumed max acceleration)

Measurement noise R encodes: "how accurate is the detector's position output?"
  R = diag([sigma_px^2, sigma_py^2, sigma_pz^2])
  sigma_px = sigma_py = 0.5m  (depends on range and camera resolution)
    </div>
</details>

    <h4>14.2.2 Extended Kalman Filter (EKF) — Nonlinear Targets</h4>
    <p>When the observation model is nonlinear (e.g., the camera projects 3D positions to 2D pixels via perspective division — a nonlinear operation), or when the motion model uses polar/angular coordinates, the standard KF's linearity assumption breaks down. The EKF linearizes the nonlinear functions at the current state estimate using first-order Taylor expansion (the Jacobian).</p>

    <div class="insight-box">
        <div class="insight-label">EKF: LINEARIZE AT CURRENT ESTIMATE</div>
        <p class="text-slate-200 text-sm mt-1">The EKF handles nonlinear systems by approximating the nonlinear function as a straight line (first-order Taylor expansion) right at the current best-guess state. This Jacobian matrix replaces the fixed F and H matrices of the standard Kalman filter. The approximation works well when the nonlinearity is mild, but diverges for highly curved functions like bearing-angle measurements at wide angles.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
EKF: Nonlinear system model
  x_k = f(x_{k-1}, u_k) + w_k       (nonlinear state transition)
  z_k = h(x_k) + v_k                 (nonlinear observation model)

Example: bearing-only tracking from camera angles (alpha, beta):
  h(x) = [atan2(py, px),             (azimuth angle)
           atan2(pz, sqrt(px^2+py^2))] (elevation angle)

EKF Jacobian linearization:
  F_k = d/dx f(x)  |_{x = x_hat_{k-1}}  (24×24 for full nav state)
  H_k = d/dx h(x)  |_{x = x_hat_{k|k-1}}

Prediction:
  x_hat_{k|k-1} = f(x_hat_{k-1|k-1}, u_k)    (nonlinear predict)
  P_{k|k-1}     = F_k * P_{k-1|k-1} * F_k^T + Q

Update:
  y = z_k - h(x_hat_{k|k-1})         (nonlinear innovation)
  S = H_k * P_{k|k-1} * H_k^T + R
  K = P_{k|k-1} * H_k^T * S^{-1}
  x_hat_{k|k} = x_hat_{k|k-1} + K * y
  P_{k|k}     = (I - K*H_k) * P_{k|k-1}

EKF limitations:
  - Linearization error grows with nonlinearity and uncertainty
  - Can diverge (P goes negative definite) for highly nonlinear h()
  - Jacobian computation is analytically complex and error-prone
    </div>
</details>

    <h4>14.2.3 Unscented Kalman Filter (UKF) — Sigma Points</h4>
    <p>The UKF (Julier &amp; Uhlmann, 1997) avoids computing Jacobians entirely. Instead, it represents the probability distribution using a carefully chosen set of deterministic sigma points, propagates them through the exact nonlinear function, and reconstructs the mean and covariance from the transformed points. This captures second-order nonlinear effects that the EKF misses.</p>

    <div class="insight-box">
        <div class="insight-label">UKF: SAMPLE THE DISTRIBUTION, NOT THE GRADIENT</div>
        <p class="text-slate-200 text-sm mt-1">Instead of approximating the nonlinear function, the UKF approximates the probability distribution with 2n+1 carefully placed sigma points (where n is the state dimension). Each sigma point is run through the exact nonlinear function, and the outputs are recombined to reconstruct a new mean and covariance. No Jacobian required, and the result is accurate to third order in Taylor expansion versus first order for the EKF.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
UKF Sigma Point Selection (Merwe Scaled Sigma Points):
  State dimension: n (e.g., n=6 for CV model)
  Number of sigma points: 2n + 1 = 13

  Parameters:
    alpha = 1e-3     (spread of sigma points around mean, 0 &lt; alpha &lt;= 1)
    kappa = 0        (secondary scaling, usually 0 or 3-n)
    beta  = 2        (optimal for Gaussian distributions)
    lambda = alpha^2 * (n + kappa) - n

  Sigma points:
    X_0     = x_hat                              (mean)
    X_i     = x_hat + sqrt((n + lambda) * P)_i   for i = 1..n
    X_{n+i} = x_hat - sqrt((n + lambda) * P)_i   for i = 1..n
    (sqrt() = Cholesky decomposition, _i = i-th column)

  Weights:
    W_m_0 = lambda / (n + lambda)                 (mean weight for X_0)
    W_c_0 = W_m_0 + (1 - alpha^2 + beta)          (covariance weight for X_0)
    W_m_i = W_c_i = 1 / (2*(n + lambda))          for i = 1..2n

  Propagate sigma points: X_i* = f(X_i)
  Reconstruct:
    x_hat_pred = sum(W_m_i * X_i*)
    P_pred = sum(W_c_i * (X_i* - x_hat_pred)(X_i* - x_hat_pred)^T) + Q

UKF advantages over EKF:
  - Accurate to 3rd order in Taylor expansion (EKF: 1st order)
  - No Jacobian computation needed
  - Better handles highly curved observation models (fisheye cameras)
  - Slightly more computationally expensive: O(n^2) vs O(n^2) for EKF
    (similar asymptotic cost, but UKF has higher constant factor ~3x)
    </div>
</details>

    <h4>14.2.4 Particle Filter — Monte Carlo Tracking</h4>
    <p>When the target's state distribution is multimodal (it could be in one of several locations), or the motion/observation models are highly non-Gaussian (e.g., tracking through heavy foliage with intermittent, non-symmetric detections), neither KF nor UKF can represent the true distribution. The particle filter represents the distribution with N weighted samples (particles).</p>

    <div class="insight-box">
        <div class="insight-label">PARTICLE FILTER: MULTIPLE HYPOTHESES IN PARALLEL</div>
        <p class="text-slate-200 text-sm mt-1">A particle filter maintains hundreds or thousands of candidate target states simultaneously. Each "particle" is a hypothesis about where the target might be; its weight reflects how well that hypothesis matches the latest sensor measurement. After resampling, low-weight particles die and high-weight particles multiply, naturally concentrating the population around the true target state — even when that state has multiple plausible locations (a target hidden behind a building that could emerge left or right).</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Particle Filter Algorithm (Sequential Importance Resampling, SIR):

1. Initialization:
   Draw N particles from prior: {x_i^0, w_i^0} for i = 1..N
   Uniform weights: w_i^0 = 1/N

2. Prediction (propagate each particle through motion model):
   x_i^k = f(x_i^{k-1}) + sample_from(Q)   (add process noise)

3. Update (weight by likelihood of observation):
   w_i^k = w_i^{k-1} * p(z_k | x_i^k)
   (likelihood = e.g., Gaussian: exp(-0.5 * (z-h(x_i))^T R^{-1} (z-h(x_i))))

4. Normalize: w_i^k = w_i^k / sum(w_j^k)

5. Resample (combat particle degeneracy):
   Effective sample size: N_eff = 1 / sum(w_i^2)
   If N_eff &lt; N/2: resample N particles with replacement, proportional to weights
   Systematic resampling (low variance): preferred over multinomial resampling.

6. Estimate: x_hat^k = sum(w_i^k * x_i^k)  (weighted mean)

Practical parameters:
  N = 500–2000 particles for a 6D state (more for higher dimensions)
  N = 100–500 is viable on embedded GPU (Hailo-8: ~1000 particles at 100Hz)
  Typical resampling threshold: N_eff &lt; 0.5 * N

Strength: handles multimodal distributions naturally.
  Example: target behind a building — posterior has two modes
  (left or right side of building). Particle filter maintains both
  hypotheses; KF must commit to one mean.

Weakness: computational cost scales as O(N * state_dim). For N=1000,
  6D state, running at 30Hz: ~30M operations/sec — manageable on GPU.
    </div>
</details>

    <h4>14.2.5 Motion Models — CV, CA, CTRV, and Singer</h4>
    <p>The filter's process model encodes assumptions about how the target moves. Mismatch between assumed and actual motion dynamics is the primary source of tracking error.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Motion Model Comparison</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase tracking-widest block mb-2">Constant Velocity (CV)</strong>
                <p class="text-slate-300">State: [px, py, pz, vx, vy, vz]. Assumes velocity constant between steps; acceleration enters as process noise. Optimal for straight-line maneuvering: aircraft in cruise, vehicles on highway. Fails for turning targets — the model has no turn-rate state, so turns appear as large process noise violations.</p>
                <p class="text-slate-400 mt-2">Q matrix: block diagonal with sigma_a^2 * dt in velocity positions. Typical sigma_a: 0.5 m/s^2 for vehicles, 2.0 m/s^2 for pedestrians, 5.0 m/s^2 for aerobatic drones.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase tracking-widest block mb-2">Constant Acceleration (CA)</strong>
                <p class="text-slate-300">State: [px, py, pz, vx, vy, vz, ax, ay, az]. Adds acceleration states; jerk is process noise. Handles ballistic trajectories well (projectiles, dropped objects). Suffers from lag during rapid acceleration changes — adding state dimensions helps only if the target actually exhibits persistent acceleration.</p>
                <p class="text-slate-400 mt-2">Increased state vector → larger covariance matrix → more computation. CA requires 3× the Kalman gain computation vs CV. Often worse than CV in practice for randomly maneuvering targets because the acceleration states overfits transient motion.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase tracking-widest block mb-2">Constant Turn Rate &amp; Velocity (CTRV)</strong>
                <p class="text-slate-300">State: [px, py, v, psi, omega] where psi = heading angle, omega = turn rate (yaw rate). Explicitly models turning — the nonlinear state transition integrates a circular arc rather than a straight line. The state transition is nonlinear (sin/cos appear), requiring EKF or UKF.</p>
                <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-xs mt-2">
f(x) = [px + (v/omega)*(sin(psi+omega*dt) - sin(psi)),
        py + (v/omega)*(cos(psi) - cos(psi+omega*dt)),
        v,
        psi + omega*dt,
        omega]

Special case omega → 0: reduces to CV via L'Hopital's rule.
                </div>
</details>
                <p class="text-slate-400 mt-2">CTRV is the standard model for ground vehicle tracking and fixed-wing aircraft. Superior to CV for coordinated turns by a large margin.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
                <strong class="text-purple-400 uppercase tracking-widest block mb-2">Singer Acceleration Model (Singer, 1970)</strong>
                <p class="text-slate-300">Models target acceleration as an Ornstein-Uhlenbeck (mean-reverting) process rather than white noise. Acceleration decays back to zero with time constant tau (the "maneuver time constant"):</p>
                <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-xs mt-2">
da/dt = -a/tau + w_a      (w_a = white noise)
tau = 1–5 seconds for aircraft, 20s for ships
sigma_a: max acceleration standard deviation

Singer Q matrix has non-trivial off-diagonal terms coupling
position, velocity, and acceleration noise.
Advantage: optimal for periodic maneuvering (defensive breaks,
evasive turns that last ~tau seconds then end).
                </div>
</details>
            </div>
        </div>
    </div>

    <h4>14.2.6 IMM — Interacting Multiple Model Estimator</h4>
    <p>No single motion model is optimal across all phases of a target's trajectory. The Interacting Multiple Model (IMM) estimator (Blom &amp; Bar-Shalom, 1988) runs N filters in parallel, each with a different motion model, and maintains a probability weight for each model. The output is a weighted mixture of all filter estimates.</p>

    <div class="insight-box">
        <div class="insight-label">IMM: LET THE DATA CHOOSE THE MOTION MODEL</div>
        <p class="text-slate-200 text-sm mt-1">The IMM runs a CV filter, a CA filter, and a CTRV filter simultaneously. Each frame, the filter whose prediction best matches the actual observation gets up-weighted. During straight cruise the CV model dominates; the moment the target banks into a turn, the CTRV model's weight rises automatically. The final track output is the probability-weighted blend of all three estimates, yielding 30–50% lower position error during evasive maneuvers than any single model alone.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
IMM Algorithm (per timestep):

Models: M_1 = CV,  M_2 = CA,  M_3 = CTRV
Model probabilities: mu = [mu_1, mu_2, mu_3]  (sum = 1)
Transition matrix: Pi[i][j] = probability of switching from M_i to M_j

1. Interaction (mixing):
   Mixed initial state for filter j:
     mu_ij = Pi[i][j] * mu_i / c_j    (c_j = normalization)
     x_0j  = sum_i(mu_ij * x_i)       (mixed mean)
     P_0j  = sum_i(mu_ij * (P_i + (x_i - x_0j)(x_i - x_0j)^T))

2. Mode-conditioned filtering:
   Run each filter (KF/EKF/UKF) j with its motion model:
     x_j*, P_j*, likelihood Lambda_j = Filter_j.update(x_0j, P_0j, z_k)

3. Model probability update:
   c = sum_j(Lambda_j * mu_j)   (normalization constant)
   mu_j^new = Lambda_j * mu_j / c

4. Output fusion:
   x_hat = sum_j(mu_j^new * x_j*)
   P_hat = sum_j(mu_j^new * (P_j* + (x_j* - x_hat)(x_j* - x_hat)^T))

Example behavior:
  Target traveling straight: mu_CV → 0.85, mu_CA → 0.10, mu_CTRV → 0.05
  Target initiating turn:    mu_CV → 0.15, mu_CA → 0.30, mu_CTRV → 0.55
  The IMM automatically adapts — no explicit maneuver detection required.

Performance improvement over single-model:
  IMM(CV+CA+CTRV) vs CV alone: 30–50% reduction in RMSE position error
  during evasive maneuvering (Bar-Shalom et al., "Estimation with
  Applications to Tracking and Navigation," 2001, Table 11.4).
    </div>
</details>

    <h4>14.2.7 Process Noise (Q) and Measurement Noise (R) Tuning</h4>
    <p>Q and R are the two critical tuning knobs. Getting them wrong produces two failure modes: if Q is too small (you trust the model too much), the filter lags behind maneuvering targets and never catches up. If Q is too large (you trust the model too little), the filter is jumpy and sensitive to detection noise.</p>

    <div class="bg-slate-800 p-4 rounded border-l-4 border-amber-500 text-sm text-slate-300">
        <strong class="text-amber-400">Q and R Tuning Heuristics:</strong><br><br>
        <strong>Q (Process Noise — how much does the target deviate from the model?):</strong><br>
        Q = sigma_a^2 * G * G^T where G = [dt^2/2, dt^2/2, dt^2/2, dt, dt, dt]^T (CV model)<br>
        sigma_a = expected max acceleration / 3 (3-sigma rule)<br>
        — Pedestrian: sigma_a = 0.5 m/s^2, Vehicle: 1.5 m/s^2, Drone: 5.0 m/s^2<br><br>
        <strong>R (Measurement Noise — how accurate is your position estimate from the detector?):</strong><br>
        R = diag([sigma_x^2, sigma_y^2, sigma_z^2]) in meters<br>
        sigma_x, sigma_y depend on: range to target, focal length, pixel resolution<br>
        Rule: sigma_px ≈ 2–5 pixels → sigma_world = sigma_px * (range / focal_length_px)<br>
        At 100m range, f=500px, sigma_px=3px: sigma_world = 3 * 100/500 = 0.6m<br><br>
        <strong>Innovation Consistency Test (NIS — Normalized Innovation Squared):</strong><br>
        NIS = y^T * S^{-1} * y should be chi-squared distributed with dof = measurement_dim<br>
        If NIS consistently &gt; chi2_threshold: Q is too small (increase process noise)<br>
        If NIS consistently &lt; chi2_threshold: Q is too large (tracking too aggressively)
    </div>

    <h3>14.3 Target Geolocation — Pixel to World Coordinates</h3>
    <p>The tracker produces bounding box pixel coordinates. The mission system needs GPS coordinates (latitude, longitude, altitude) or NED (North-East-Down) coordinates in meters from the drone's reference point. This section covers the complete projection chain from camera pixel to global reference frame.</p>

    <h4>14.3.1 Camera Intrinsic Matrix and Distortion</h4>
    <p>The intrinsic matrix K encodes how the camera maps 3D camera-frame coordinates to 2D pixel coordinates. See Module 11 (Perception &amp; Visual SLAM) for the detailed Brown-Conrady distortion model. For targeting, the key requirement is that all pixel coordinates must be <em>undistorted</em> before geolocation — using raw distorted pixels introduces systematic position errors proportional to distance from the image center.</p>

    <div class="insight-box">
        <div class="insight-label">INTRINSIC MATRIX: PIXEL SPACE TO ANGLE</div>
        <p class="text-slate-200 text-sm mt-1">The 3×3 intrinsic matrix K converts a 3D point in camera coordinates into pixel coordinates using the focal length (pixels per radian of angle) and principal point (the image center). For geolocation, we invert K to go the other direction: turning a detector's (u, v) pixel coordinate into a unit direction ray in camera space. Always undistort raw pixel detections with the lens distortion coefficients first — skipping this step introduces position errors of 5–20 m at 300 m range for typical wide-angle lenses.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Intrinsic Matrix K:
  K = [f_x,  0,   c_x]     f_x = focal length in pixels (horizontal)
      [ 0,   f_y,  c_y]     f_y = focal length in pixels (vertical)
      [ 0,    0,    1 ]     c_x, c_y = principal point (image center)

Example: Sony IMX335 (5MP), 4mm lens, 2.0 µm pixel:
  Pixel pitch = 2.0 µm → pixels/mm = 500
  f_x = f_y = 4mm * 500 px/mm = 2000 pixels
  c_x = 2592/2 = 1296,  c_y = 1944/2 = 972

Undistort before geolocation (OpenCV):
  cv2.undistortPoints(pixel_coords, K, dist_coeffs)
  Returns normalized image coordinates: x_n = (u - c_x)/f_x, y_n = (v - c_y)/f_y
    </div>
</details>

    <h4>14.3.2 Camera Extrinsic Matrix — Body Frame to World Frame</h4>
    <p>The extrinsic matrix [R | t] transforms world-frame 3D points into camera-frame 3D points. For an airborne targeting system, building this matrix requires knowing the drone's pose (from EKF / GPS / INS) and the gimbal angles.</p>

    <div class="insight-box">
        <div class="insight-label">EXTRINSIC CHAIN: GPS + ATTITUDE + GIMBAL → CAMERA ORIENTATION</div>
        <p class="text-slate-200 text-sm mt-1">Three rotation matrices must be chained together to know exactly where the camera is pointing in world coordinates: the drone's roll/pitch/yaw (from the EKF/INS), the gimbal encoder angles (relative to the body), and a fixed boresight calibration (camera mounting offset). Any error in any of these — a 0.2° attitude error is typical — propagates directly into geolocation error at the ground (0.35 m per degree at 100 m range).</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Full Transform Chain (World → Camera):

  P_cam = R_cam_to_body^T * R_body_to_NED^T * (P_world - t_drone_NED)

Or equivalently, in homogeneous form:
  P_cam = T_world_to_cam * P_world

Where:
  T_world_to_cam = [R | t]  is the 3×4 extrinsic matrix
  R = R_body_to_NED^T * R_gimbal_to_body  (combined rotation)
  t = R * (-P_drone_NED)                  (translation)

Component rotations:
  R_body_to_NED: from EKF quaternion (drone roll, pitch, yaw)
    Euler → DCM:
    R = Rz(psi) * Ry(theta) * Rx(phi)   [ZYX convention / NED]

  R_gimbal_to_body: from gimbal encoders
    R_gimbal = Rz(gimbal_yaw) * Ry(gimbal_pitch) * Rx(gimbal_roll)

  P_drone_NED: [North, East, Down] from GPS/EKF in meters

Combined:
  R_total = R_body_to_NED * R_gimbal_to_body
  This gives rotation from gimbal/camera frame to NED world frame.
    </div>
</details>

    <h4>14.3.3 Ray Casting — Pixel to 3D World Point</h4>
    <p>Given a target's pixel coordinates and the full camera model, the geolocation problem is to find the 3D world point that projects to those pixels. The solution depends on what depth information is available.</p>

    <div class="insight-box">
        <div class="insight-label">RAY CASTING: SHOOTING A LINE FROM CAMERA TO GROUND</div>
        <p class="text-slate-200 text-sm mt-1">A pixel in the camera image defines a direction ray from the camera center out into the world. Geolocation intersects this ray with a known surface — usually the terrain plane at a known altitude. The intersection point is the target's estimated ground position. Without a depth source (LiDAR or stereo), the altitude of the terrain relative to the drone is the single biggest uncertainty: a 5 m terrain height error at 45° depression angle produces a 5 m horizontal geolocation error.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Method 1: Ray-Terrain Intersection (Flat Earth Approximation)

Given: pixel (u, v), camera height h_AGL above terrain (from barometer + terrain DEM)

Step 1: Compute unit ray in camera frame
  d_cam = K^{-1} * [u, v, 1]^T           (normalized ray direction)
  d_cam = d_cam / ||d_cam||               (unit vector)

Step 2: Rotate ray to NED world frame
  d_NED = R_total * d_cam                 (R_total from extrinsic chain above)

Step 3: Find intersection with terrain plane (z = -h_AGL in NED)
  Ray: P(t) = P_drone + t * d_NED
  Terrain: P_z = -h_AGL  (Down component, negative = above ground in NED)

  Intersection parameter:
  t = (P_drone_D + h_AGL) / (-d_NED_D)   (solve for Down component = 0)
  Note: d_NED_D must be positive (ray pointing downward) — else target
  is above the drone (aircraft target) and different method needed.

Step 4: Target position in NED
  P_target_NED = P_drone_NED + t * d_NED   [North, East, Down] in meters

Method 2: With Depth Measurement (LiDAR or stereo)
  If depth Z_cam is known:
  P_cam = Z_cam * K^{-1} * [u, v, 1]^T   (3D point in camera frame)
  P_NED = R_total * P_cam + P_drone_NED    (transform to world)

Method 3: Monocular Depth Estimation (GPS-denied)
  Run MiDaS (Ranftl et al., 2021) or DepthAnything (Yang et al., 2024)
  to produce per-pixel relative depth. Requires scale factor from:
    - Known target size (vehicle width 1.8m → distance = 1.8*f_x / bbox_w)
    - Altimeter reading for ground plane absolute scaling
  Scale ambiguity is the fundamental limitation of monocular depth.
    </div>
</details>

    <h4>14.3.4 Georeferencing — NED to WGS84</h4>
    <p>Mission systems report target locations in GPS coordinates (WGS84 latitude, longitude, altitude). The conversion from NED meters (relative to the drone's GPS fix) to absolute WGS84 uses the Earth radius approximation for short distances (&lt;100 km):</p>

    <div class="insight-box">
        <div class="insight-label">NED TO GPS: METERS INTO DEGREES</div>
        <p class="text-slate-200 text-sm mt-1">The drone's tracker produces target positions in North-East-Down meters relative to a reference point. Converting these to GPS latitude/longitude divides by the Earth's radius (≈ 6,378 km) and accounts for longitude compression at non-equatorial latitudes (cos(lat) factor). The flat-Earth approximation is accurate to about 1 m at 50 km range — more than adequate for sUAS missions. For precision beyond 1 m, use the WGS84 ellipsoid model and correct altitude against a terrain DEM.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
NED to WGS84 (flat Earth approximation, valid to ~1m error at 50km range):

Given:
  (N, E, D) = target position in NED meters from drone reference
  (lat_0, lon_0, alt_0) = drone GPS position (WGS84)

Earth radius: R_earth = 6,378,137.0 m (WGS84 semi-major axis)
Meridian radius of curvature: R_N = R_earth (approx for small regions)

  lat_target = lat_0 + (N / R_earth) * (180 / pi)         [degrees]
  lon_target = lon_0 + (E / (R_earth * cos(lat_0 * pi/180))) * (180/pi)
  alt_target = alt_0 - D                                   [meters MSL]

For high-precision geolocation (&lt;1m error):
  Use WGS84 ellipsoid model with Bowring's method for lat/lon conversion.
  Account for terrain DEM (Digital Elevation Model) for altitude correction.
  DTED Level 1: 90m post spacing, ~15m vertical accuracy.
  DTED Level 2: 30m post spacing, ~3m vertical accuracy.

IMU compensation for gimbal motion:
  High-frequency vibration in gimbal jitter ± 0.1° at 200 Hz.
  At 100m range: 0.1° → 0.17m position error.
  Compensation: apply inverse gimbal rotation using high-rate IMU data
  sampled at the same timestamp as the image frame (hardware trigger).
  Electronic rolling shutter sensors: apply per-row IMU correction
  (row timing = row_index / (fps * n_rows)).
    </div>
</details>

    <h4>14.3.5 Geolocation Accuracy Budget</h4>
    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">CEP (Circular Error Probable) Budget at 100m AGL</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-2">Error Sources</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>GPS position of drone: ±1.5m CEP (standard GPS)</li>
                    <li>GPS position of drone: ±0.05m CEP (RTK GPS)</li>
                    <li>Gimbal angle encoder: ±0.05° → ±0.09m at 100m</li>
                    <li>Roll/pitch attitude error (±0.2°): ±0.35m at 100m</li>
                    <li>Pixel detection centroid: ±3px → ±0.06m at 100m (2000px focal)</li>
                    <li>Terrain altitude error (DTED-2): ±3m → ±1.5m horizontal</li>
                    <li>Time latency mismatch (10ms at 5m/s drone speed): ±0.05m</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-2">Resulting CEP (RSS combination)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Standard GPS setup: ~2.5–3.5m CEP at 100m AGL</li>
                    <li>RTK GPS setup: ~0.5–1.0m CEP at 100m AGL</li>
                    <li>Primary error sources: GPS drone position + terrain model</li>
                    <li>Gimbal + attitude errors contribute ~0.4m (manageable)</li>
                    <li>Beyond 300m AGL: GPS and terrain errors dominate completely</li>
                    <li>RTK breaks if baseline &gt;50km or line-of-sight blocked to base</li>
                </ul>
            </div>
        </div>
    </div>

    <h3>14.4 Guidance Laws for Interception and Following</h3>
    <p>Once the target is geolocated and tracked in 3D, the drone must navigate to intercept or follow it. Guidance laws define how to compute the required velocity vector or heading command from the current relative geometry. The choice of guidance law determines fuel efficiency, interception time, and robustness to target maneuvering.</p>

    <h4>14.4.1 Pure Pursuit</h4>
    <p>Pure Pursuit (PP) simply commands the drone to point directly at the current target position at every timestep. It is the simplest possible guidance law and the easiest to implement.</p>

    <div class="insight-box">
        <div class="insight-label">PURE PURSUIT: ALWAYS POINT AT THE TARGET</div>
        <p class="text-slate-200 text-sm mt-1">Pure Pursuit is the guidance equivalent of a dog chasing a car: always nose-on toward the target's current position. This works when the drone is significantly faster than the target. Its fatal weakness is the "tail-chase" spiral — when the drone is only slightly faster, it curves into the target's wake and never closes the gap. It is suitable for slow-moving or hovering targets but unsuitable for fast or lateral intercepts.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Pure Pursuit Geometry:
  Vector to target: r = P_target - P_drone
  Command heading:  psi_cmd = atan2(r_E, r_N)    [NED heading to target]
  Command velocity: v_cmd = v_max * (r / ||r||)   [fly at full speed toward target]

Limitations:
  1. Tail-chase problem: if the target moves at speed V_t and the drone
     chases at V_d, and V_t ≈ V_d, the drone follows a curved path of
     ever-increasing curvature, spiraling into the target's wake.
     Required speed ratio: V_d / V_t &gt; 1.5 for convergent geometry.

  2. Final approach curvature: as range decreases, heading rate demand
     increases without bound — requires infinite lateral acceleration
     at zero range for a moving target.

  3. Heading error: PP does not lead the target — it always lags
     by the response latency of the vehicle's control system.
    </div>
</details>

    <h4>14.4.2 Proportional Navigation (PN)</h4>
    <p>Proportional Navigation (PN) is the dominant guidance law for real-world interception systems (missiles, interceptor drones). Instead of pointing at the target, PN nulls the line-of-sight (LOS) rotation rate — because if the LOS angle does not change, a collision course is guaranteed regardless of target speed.</p>

    <div class="insight-box">
        <div class="insight-label">PROPORTIONAL NAVIGATION: NULL THE LOS ROTATION</div>
        <p class="text-slate-200 text-sm mt-1">The geometric insight behind PN is that two objects are on a collision course if and only if the line connecting them (the Line of Sight) does not rotate. PN continuously measures how fast the LOS angle is drifting and commands a lateral acceleration proportional to that drift rate, times the closing speed. Navigation gain N=4 is the most common choice — it guarantees intercept against non-maneuvering targets and limits miss distance against moderately maneuvering targets.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Proportional Navigation Formulation:

Line of Sight (LOS) angle: lambda = atan2(r_E, r_N)

LOS rate (the key quantity to null):
  lambda_dot = (r_dot_cross_r) / ||r||^2
             = (r_N * v_rel_E - r_E * v_rel_N) / r^2   [2D case]

  where v_rel = v_target - v_drone

PN Command (lateral acceleration):
  a_cmd = N * V_c * lambda_dot

  N   = navigation gain (dimensionless, typical: N = 3–5)
  V_c = closing velocity (approach rate): V_c = -d/dt(||r||) = -r_hat · v_rel
  lambda_dot = LOS rate in rad/s

  N = 3: minimum energy, but requires V_drone &gt; V_target
  N = 4: balanced (most common choice)
  N = 5: faster response, higher acceleration demand

For 3D engagement:
  Compute LOS unit vector: r_hat = r / ||r||
  LOS angular velocity vector: omega_LOS = (r × r_dot) / ||r||^2
  PN command acceleration: a_cmd = N * V_c * (omega_LOS × r_hat)

Effectiveness:
  PN guarantees zero miss distance for non-maneuvering targets with
  constant N (mathematically proven for straight-line targets).
  Against constant-acceleration targets, miss distance is bounded.
    </div>
</details>

    <h4>14.4.3 Augmented Proportional Navigation (APN)</h4>
    <p>When the target actively maneuvers (evasive action), pure PN accumulates miss distance because it only reacts to LOS rate. APN adds a feed-forward term from estimated target acceleration, reducing miss distance by a factor of 2–5× against highly maneuvering targets.</p>

    <div class="insight-box">
        <div class="insight-label">AUGMENTED PN: ANTICIPATE TARGET ACCELERATION</div>
        <p class="text-slate-200 text-sm mt-1">Pure PN is reactive — it only responds after the target's maneuver has already rotated the LOS. APN adds a feed-forward term using the estimated target acceleration (from an IMM CA filter) perpendicular to the LOS. This pre-compensates for the target's maneuver before it distorts the LOS angle, reducing miss distance from ~5 m to ~0.3 m in simulation against a step-maneuver target (a 16× improvement per Zarchan 2012).</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Augmented PN (APN):
  a_cmd = N * V_c * lambda_dot + (N/2) * a_target_perp

  a_target_perp = component of estimated target acceleration
                  perpendicular to the LOS direction

  Derivation: The optimal guidance gain for a target with constant
  acceleration a_t is N = N_PN + (a_t / a_drone) to null the
  acceleration-induced LOS rate before it grows.

Estimating a_target_perp:
  Method 1: Differentiate Kalman filter velocity estimate twice (noisy)
  Method 2: IMM CA filter acceleration state estimate (preferred)
  Method 3: Observer-based acceleration estimator
    a_est = (v_target_meas[k] - v_target_meas[k-1]) / dt

Practical APN performance (simulation, Zarchan "Tactical and
Strategic Missile Guidance", 6th ed, 2012):
  PN (N=4) vs step-maneuver target:   miss distance ~5m
  APN (N=4) vs step-maneuver target:  miss distance ~0.3m
  (factor ~16x improvement in miss distance)
    </div>
</details>

    <h4>14.4.4 Deviated Pure Pursuit (DPP) and Velocity Pursuit</h4>
    <p>Deviated Pure Pursuit steers at a fixed angle ahead of the target position rather than directly at it. By choosing a lead angle based on expected target speed and direction, DPP avoids the tail-chase geometry while requiring less closing-speed margin than pure PN.</p>

    <div class="insight-box">
        <div class="insight-label">DEVIATED PURSUIT: LEAD THE TARGET</div>
        <p class="text-slate-200 text-sm mt-1">DPP steers toward a point ahead of the target rather than at the target itself, similar to a hunter leading a moving bird. The lead distance scales with current range, so the intercept geometry stays consistent across approach. Velocity Pursuit is the follow-mode variant: the drone matches the target's heading rather than pointing at it, making it natural for escort or shadow missions where maintaining offset is the goal rather than closing range.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Deviated Pure Pursuit:
  eta = lead angle (typically 10–30 degrees ahead of target velocity)
  Steer toward: P_lead = P_target + D_lead * v_target_hat

  D_lead = r * tan(eta)  (lead distance scales with current range)

  Tuning: eta too small → approaches pure pursuit, tail-chase risk
          eta too large → flies past predicted intercept point

Velocity Pursuit:
  Command drone velocity parallel to target velocity (match heading, not point at)
  Used for: escort/follow tasks, NOT interception
  a_cmd proportional to: (v_target_direction - v_drone_direction)

Collision Course (Zero Effort Miss):
  Maintain constant bearing (lambda = const) while closing
  Equivalent to PN with N → infinity at constant closing velocity
  Computationally simple for fixed-speed platforms
    </div>
</details>

    <h4>14.4.5 MPPI — Model Predictive Path Integral Control</h4>
    <p>MPPI (Williams et al., 2017, ICRA) is a sampling-based stochastic optimal control method that replaces classical guidance laws with trajectory optimization. It samples thousands of control sequences, evaluates them under a cost function, and computes an optimal control as the information-weighted average of low-cost trajectories.</p>

    <div class="insight-box">
        <div class="insight-label">MPPI: GPU-PARALLEL TRAJECTORY LOTTERY</div>
        <p class="text-slate-200 text-sm mt-1">MPPI runs 1,000–10,000 random control sequence "rollouts" in parallel on a GPU each control cycle, simulates where each one would take the drone over the next 1–5 seconds, scores each trajectory against a cost function (distance to target, obstacle clearance, speed limits), then blends the good trajectories together — weighting better trajectories exponentially higher. The result automatically handles non-convex constraints and nonlinear dynamics that would defeat PN or classical MPC formulations.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
MPPI Algorithm:
  State: x ∈ R^n,  Control: u ∈ R^m
  Temperature parameter: lambda (controls risk tolerance)
  Number of samples: K (typically 1000–10000)
  Horizon: T steps (typically 20–100 at dt=0.05s → 1–5 sec lookahead)

1. Sample K control perturbation sequences:
   epsilon_k ~ N(0, Sigma)  for k = 1..K   (Gaussian noise on control)
   U_k = U_nominal + epsilon_k             (perturbed control sequence)

2. Rollout each trajectory under system dynamics:
   x_{t+1}^k = f(x_t^k, U_k[t])

3. Compute trajectory costs:
   S(U_k) = sum_{t=0}^{T} [q(x_t^k) + lambda^{-1} * U_nominal[t]^T Sigma^{-1} epsilon_k[t]]
   q(x) = running cost (distance to target, obstacle penalty, etc.)

4. Compute information-theoretic weights:
   beta = min_k(S(U_k))    (shift for numerical stability)
   w_k = exp(-(S(U_k) - beta) / lambda)
   w_k = w_k / sum(w_j)    (normalize)

5. Update nominal control:
   U_nominal = U_nominal + sum_k(w_k * epsilon_k)

6. Apply first control action, shift horizon (receding horizon)

Advantages over PN for drone following:
  - Handles arbitrary cost functions (obstacle avoidance + speed limits + target following)
  - GPU-parallelizable: 10,000 rollouts at 30Hz on RTX 3080 (Williams et al., 2018)
  - Naturally handles nonlinear dynamics and constraints
  - Robustness: bad samples have low weight, not discarded (graceful degradation)

Real implementations:
  AutoRally (2017): autonomous offroad vehicle at 35 mph using MPPI on embedded GPU
  MIT Racecar: MPPI for aggressive autonomous racing
  For drone target following: MPPI with 1000 rollouts at 30Hz requires ~GPU (Jetson AGX: feasible)
    </div>
</details>

    <h4>14.4.6 MAVLink Implementation — Sending Guidance Commands to PX4/ArduPilot</h4>
    <div class="insight-box">
        <div class="insight-label">MAVLINK COMMAND INTERFACE</div>
        <p class="text-slate-200 text-sm mt-1">The companion computer running the guidance law sends velocity or position setpoints to the flight controller via MAVLink messages at 30–50 Hz. The critical choice is between position-only, velocity-only, or combined pos+vel targets — velocity-only commands respond faster and avoid the FC's position integrator lag. Use a UART connection at 921600 baud (≈1 ms latency) rather than a telemetry radio (50–100 ms) to keep the control loop tight.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Key MAVLink message types for target following:

SET_POSITION_TARGET_LOCAL_NED (MSG #84):
  Coordinate frame: MAV_FRAME_LOCAL_NED (NED from home position)
  type_mask bitmask: selects which fields are used
    Position only:  type_mask = 0b0000111111111000 = 0x0FF8
    Velocity only:  type_mask = 0b0000111111000111 = 0x0FC7
    Pos + Vel:      type_mask = 0b0000111111000000 = 0x0FC0
    Accel + Vel:    type_mask = 0b0000111000111000 = 0x0E38
  Fields: x, y, z (position in NED m), vx, vy, vz (m/s), afx, afy, afz (m/s^2)
  Recommended: send at 30–50 Hz for smooth tracking

SET_ATTITUDE_TARGET (MSG #82):
  q[4]: quaternion attitude command
  body_roll_rate, body_pitch_rate, body_yaw_rate: rad/s
  thrust: 0.0–1.0
  Used for: direct gimbal pointing or aggressive body-rate tracking

COMMAND_LONG / MAV_CMD_DO_SET_ROI (MSG #76):
  Set Region of Interest — gimbal auto-tracks a GPS coordinate
  param5 = latitude, param6 = longitude, param7 = altitude
  Used for: simple loiter-and-watch missions without custom tracking code

Latency note:
  MAVLink UDP: 5–10ms latency on local Ethernet/WiFi
  Telemetry radio (SiK 915MHz): 50–100ms latency — too slow for fast tracking
  Recommendation: run tracking loop on companion computer (Jetson/RPi)
                  connected via UART (TELEM2) at 921600 baud: ~1ms latency
    </div>
</details>

    <h3>14.5 Cascade PID and Advanced Gimbal/Airframe Control</h3>
    <p>The guidance law outputs a desired position, velocity, or acceleration command. Translating that into rotor thrust commands requires a control hierarchy: outer loops set position/velocity targets, inner loops execute attitude commands, and the innermost loop controls angular rate. This section covers each layer and its tuning.</p>

    <h4>14.5.1 Cascade PID Architecture</h4>
    <p>ArduCopter and PX4 both implement cascade PID control with three nested loops. Each loop runs at a different rate: position loop at 10–50 Hz, velocity loop at 50–100 Hz, attitude loop at 400 Hz, rate loop at 400–1000 Hz.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Cascade PID Loop Architecture</h4>
        <div class="space-y-3 text-xs">
            <div class="flex items-center gap-3">
                <div class="bg-sky-900 border border-sky-500 p-3 rounded flex-1 text-center">
                    <strong class="text-sky-400 block">Position Loop</strong>
                    <span class="text-slate-300">10–50 Hz</span><br>
                    <span class="text-slate-400">P_cmd → V_cmd</span><br>
                    <span class="text-slate-400">Kp_pos × pos_error</span>
                </div>
                <span class="text-slate-400 text-lg">→</span>
                <div class="bg-emerald-900 border border-emerald-500 p-3 rounded flex-1 text-center">
                    <strong class="text-emerald-400 block">Velocity Loop</strong>
                    <span class="text-slate-300">50–100 Hz</span><br>
                    <span class="text-slate-400">V_cmd → A_cmd (Tilt angle)</span><br>
                    <span class="text-slate-400">PID on velocity error</span>
                </div>
                <span class="text-slate-400 text-lg">→</span>
                <div class="bg-amber-900 border border-amber-500 p-3 rounded flex-1 text-center">
                    <strong class="text-amber-400 block">Attitude Loop</strong>
                    <span class="text-slate-300">400 Hz</span><br>
                    <span class="text-slate-400">Attitude_cmd → Rate_cmd</span><br>
                    <span class="text-slate-400">P only (no I needed)</span>
                </div>
                <span class="text-slate-400 text-lg">→</span>
                <div class="bg-rose-900 border border-rose-500 p-3 rounded flex-1 text-center">
                    <strong class="text-rose-400 block">Rate Loop</strong>
                    <span class="text-slate-300">400–1000 Hz</span><br>
                    <span class="text-slate-400">Rate_cmd → Motor PWM</span><br>
                    <span class="text-slate-400">PID on gyro rate</span>
                </div>
            </div>
        </div>
    </div>

    <div class="insight-box">
        <div class="insight-label">CASCADE PID: NESTED LOOPS AT DIFFERENT SPEEDS</div>
        <p class="text-slate-200 text-sm mt-1">Each outer loop outputs a setpoint for the loop inside it. The position loop runs slowest (50 Hz) and outputs a desired velocity; the velocity loop outputs a desired tilt angle; the attitude loop outputs desired rotation rates; the rate loop at 1 kHz closes directly on the gyroscope and outputs motor PWM. The faster inner loops must be tuned first, then the outer loops, because each outer loop assumes the inner loop is infinitely fast relative to it.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Velocity PID (ArduCopter notation):
  vel_error = v_target - v_measured    [m/s]

  P term: P_out = Kp * vel_error
  I term: I_out = Ki * integral(vel_error * dt)   [anti-windup: clamp I_out]
  D term: D_out = Kd * (vel_error - vel_error_prev) / dt

  Output = P_out + I_out + D_out   [desired tilt angle, rad]
  Clamp output: max lean angle = 45 degrees

Rate PID (inner loop, most critical for stability):
  rate_error = rate_target - gyro_measured   [rad/s]

  P term: Kp * rate_error              → direct proportional response
  I term: Ki * integral                → removes steady-state heading drift
  D term: Kd * d(gyro)/dt              → NOTE: differentiate measurement,
                                          not error (avoids derivative kick on step input)
  Feed-forward: Kff * rate_target      → improves response to commanded rates
    </div>
</details>

    <h4>14.5.2 Anti-Windup for the Integral Term</h4>
    <p>When the vehicle is at a control saturation limit (e.g., maximum tilt angle reached), the integrator continues accumulating error — "winding up." When the saturation ends, the oversized integral causes large overshoot or oscillation. Anti-windup techniques prevent this.</p>

    <div class="insight-box">
        <div class="insight-label">ANTI-WINDUP: STOP INTEGRATING WHEN SATURATED</div>
        <p class="text-slate-200 text-sm mt-1">Integral windup happens when the drone is already at maximum tilt but the error keeps growing — the integrator accumulates a huge value that then drives overshoot after saturation ends. The simplest fix (ArduPilot's approach) is to simply freeze the integrator whenever the output is saturated. The more elegant back-calculation method feeds the saturation "excess" back into the integrator as a negative term, smoothly bleeding off the excess without a discrete freeze/unfreeze transition.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Anti-Windup Techniques:

1. Clamping (simplest, used in ArduPilot):
   If (output &gt; max_output):
     stop integrating (freeze I term)
   If (output &lt; min_output):
     stop integrating
   Implementation: only integrate if NOT saturated

2. Back-calculation (more elegant):
   I_dot = Ki * error - Kb * (output_actual - output_unlimited)
   Kb = 1/tau_aw (anti-windup time constant)
   When saturated, the back-calculation term drives I toward
   the value that would produce the saturated output exactly.

3. PX4 Tracking Anti-windup:
   When rate integrator is accumulating:
   Check if motor outputs are saturated in the same direction as integrator
   If yes: reduce integrator magnitude by saturation factor
   if (I_out * motor_saturation_flag > 0):
     I -= I_out * 0.1 * dt    (bleed off slowly)

ArduPilot parameter: ATC_RATE_R_IMAX, ATC_RATE_P_IMAX, ATC_RATE_Y_IMAX
  Limit maximum contribution of integral term to ±50% of output range.
    </div>
</details>

    <h4>14.5.3 Feed-Forward Compensation</h4>
    <p>PID controllers are reactive — they only respond after an error has developed. Feed-forward adds a proactive term that compensates for known disturbances or reference model dynamics before the error occurs. For drone tracking, feed-forward significantly improves following performance during accelerations.</p>

    <div class="insight-box">
        <div class="insight-label">FEED-FORWARD: ACT BEFORE THE ERROR APPEARS</div>
        <p class="text-slate-200 text-sm mt-1">Feed-forward injects the derivative of the setpoint (acceleration command) directly into the output, bypassing the PID error loop. For gimbal tracking, this means commanding the gimbal to rotate at the target's estimated angular rate before the pixel offset has even grown — so the target stays near the image center rather than drifting to the edge and waiting for the P term to pull it back. Result: 50–70% reduction in RMS pixel tracking error during smooth target motion.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Feed-Forward in Velocity Control:
  output = PID(vel_error) + Kff * vel_target_dot

  vel_target_dot = derivative of velocity setpoint (acceleration target)
  Kff tuned so feed-forward alone produces the correct response
  PID then only needs to handle residual tracking error

Feed-Forward for Gimbal Tracking:
  gimbal_rate_cmd = Kff * target_angular_rate_estimate
                  + Kp * (target_pixel_x - image_center_x)
  target_angular_rate ≈ (x_target[k] - x_target[k-1]) / dt (from Kalman filter)

  Result: gimbal leads the target rather than chasing it.
  Improvement: 50–70% reduction in RMS tracking error during smooth motion.
    </div>
</details>

    <h4>14.5.4 LQR — Linear Quadratic Regulator</h4>
    <p>LQR is a full-state feedback controller that finds the optimal gain matrix K that minimizes a quadratic cost function. Unlike PID, LQR simultaneously optimizes all state variables together, accounting for their cross-coupling effects.</p>

    <div class="insight-box">
        <div class="insight-label">LQR: OPTIMAL GAIN FROM MATH, NOT TRIAL AND ERROR</div>
        <p class="text-slate-200 text-sm mt-1">LQR replaces manual PID tuning with solving an algebraic Riccati equation: you specify Q (how much you care about each state error) and R (how much you care about control effort), and the solver returns the optimal gain matrix K. The key advantage over PID is that K is a full matrix — it can, for example, command a roll correction in response to a lateral velocity error, properly accounting for the coupling between roll angle and horizontal acceleration in a multirotor.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
LQR Problem Formulation:
  System: x_dot = A*x + B*u   (linear time-invariant)
  Cost:   J = integral_0^inf (x^T Q x + u^T R u) dt

  Q = state cost matrix (penalizes deviation from zero state)
  R = control cost matrix (penalizes control effort)

  Optimal gain: u = -K * x
  K = R^{-1} * B^T * P   (from Riccati equation)
  A^T P + P A - P B R^{-1} B^T P + Q = 0   (algebraic Riccati equation, DARE)

Example: Quadcopter altitude control
  x = [z, z_dot, phi, p, theta, q]  (6-state)
  u = [thrust, roll_rate, pitch_rate, yaw_rate]
  Q = diag([100, 10, 1, 0.1, 1, 0.1])  (penalize position error more than rate)
  R = diag([1, 0.1, 0.1, 0.1])         (penalize thrust less than rate commands)
  → Solve DARE → K (4×6 matrix) → u = -K * x

Advantages over PID:
  - Accounts for coupling (e.g., roll affects lateral position simultaneously)
  - Systematic tuning via Q, R matrices (not 3-per-axis PID tuning)
  - Handles MIMO systems naturally

Disadvantages:
  - Requires accurate linear model (plant must be well-identified)
  - LQR is a state feedback law — requires full state measurement (or observer)
  - LQR + integral: must augment state with integral of error (LQI)
    </div>
</details>

    <h4>14.5.5 MPC — Model Predictive Control</h4>
    <p>MPC solves an online optimization problem at each timestep, finding the control sequence that minimizes a cost function over a finite horizon while respecting constraints on actuator limits, velocity, and state. MPC inherently handles constraints, which PID and LQR cannot do natively.</p>

    <div class="insight-box">
        <div class="insight-label">MPC: PLAN AHEAD WITH HARD CONSTRAINTS</div>
        <p class="text-slate-200 text-sm mt-1">MPC solves a miniature trajectory optimization every control cycle, looking N steps into the future and finding the control sequence that stays within actuator limits while minimizing tracking cost. Only the first action is applied, then the optimization repeats. The critical advantage over LQR is that tilt angle limits, maximum velocity, and obstacle avoidance can all be stated as hard constraints — LQR and PID can only approximate these as soft penalties. Modern QP solvers like OSQP solve the N=20 horizon problem in under 1 ms.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
MPC Formulation (Receding Horizon):
  Minimize: sum_{k=0}^{N-1} [x_k^T Q x_k + u_k^T R u_k] + x_N^T P_f x_N
  Subject to:
    x_{k+1} = A x_k + B u_k          (linear dynamics)
    u_min &lt;= u_k &lt;= u_max              (actuator limits, e.g., ±45° tilt)
    x_min &lt;= x_k &lt;= x_max              (state constraints, e.g., max velocity 15 m/s)

  Solve as Quadratic Program (QP): ~1ms for N=20 horizon on Jetson Xavier
  Apply only u_0, discard rest (receding horizon principle)

Advantages for drone target following:
  - Hard constraints: never exceeds tilt angle limits or velocity limits
  - Predictive: plans N steps ahead using current target trajectory estimate
  - Natural integration of obstacle avoidance as inequality constraints

Tools:
  OSQP (Stellato et al., 2020): open-source QP solver, 50µs/solve for small systems
  acados (Verschueren et al., 2022): high-speed MPC, generates C code for embedded
  CasADi: symbolic differentiation for nonlinear MPC (NMPC)
    </div>
</details>

    <h3>14.6 3D Velocity and Trajectory Estimation</h3>

    <h4>14.6.1 Estimating Target Velocity from Bounding Box Motion</h4>
    <p>When only 2D detections are available (no depth), target velocity can still be estimated from the bounding box motion history, combined with known camera geometry and platform motion compensation.</p>

    <div class="insight-box">
        <div class="insight-label">VELOCITY FROM PIXEL SHIFT</div>
        <p class="text-slate-200 text-sm mt-1">The pixel displacement of a target's bounding box centroid between frames can be converted to ground-plane speed using the known camera focal length and estimated range (height ÷ cos(elevation)). The drone's own velocity must be subtracted to isolate true target motion from platform ego-motion. A Kalman filter then smooths the noisy per-frame velocity estimates into a stable signal usable by the guidance law.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Target Velocity from Pixel Motion + Known Geometry:

Given: two consecutive frames t and t+1
  bbox center at t:   (u_1, v_1)
  bbox center at t+1: (u_2, v_2)
  Camera height AGL:  h (meters)
  Focal length:       f_x, f_y (pixels)
  Time between frames: dt (seconds)

Pixel-to-ground scaling (at range r, assuming flat terrain):
  pixels_per_meter_x = f_x / r    (r = h / cos(elevation_angle))
  pixels_per_meter_y = f_y / r

Target velocity in NED (approximately, if drone is nearly stationary):
  delta_N = (v_2 - v_1) / pixels_per_meter_y  [meters]
  delta_E = (u_2 - u_1) / pixels_per_meter_x  [meters]
  v_target_N = delta_N / dt
  v_target_E = delta_E / dt

Correction for drone motion:
  v_target = v_estimated - v_drone  (subtract drone velocity in image plane)
  v_drone_projected_N = v_drone_N * f_y / r  [pixels/s drone motion]

Kalman filter smoothing:
  Feed (v_target_N, v_target_E) measurements into CV Kalman filter
  KF smooths noisy per-frame estimates → stable velocity for guidance law
    </div>
</details>

    <h4>14.6.2 Optical Flow for Ego-Motion Compensation</h4>
    <p>When the camera is moving (airborne platform), all pixels appear to move — even a stationary ground point moves in the image. Optical flow separates target motion from background (ego-motion) flow to isolate true target movement.</p>

    <div class="insight-box">
        <div class="insight-label">OPTICAL FLOW: BACKGROUND SUBTRACTION VIA HOMOGRAPHY</div>
        <p class="text-slate-200 text-sm mt-1">Because the entire background image shifts together when the drone moves, a homography (planar warp) can predict where each background pixel should have moved due to drone motion alone. After warping the previous frame to align with the current frame, any pixel that does not match the warp is moving relative to the ground — i.e., it is a target. This moving-target indicator (MTI) technique is how the military detects moving ground vehicles from airborne sensors without a deep learning detector.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Optical Flow Approaches:

Lucas-Kanade (sparse, feature-based):
  Track FAST/Shi-Tomasi corner features between frames
  Assumes locally constant flow in a patch around each feature
  Solve: [I_x, I_y]^T * [u, v] = -I_t  (brightness constancy)
  For a 7×7 patch: compute [A^T A]^{-1} A^T b  (2×2 system per feature)
  Speed: 100+ FPS for 500 features, runs on RPi 4 CPU

Farneback (dense, all pixels):
  Polynomial approximation of local intensity structure
  Produces full flow field (u(x,y), v(x,y)) for every pixel
  Speed: ~15 FPS at 640×480 on CPU; use for segmentation-free target extraction

Ego-motion subtraction:
  1. Estimate homography H from background optical flow (static points only)
     H = cv2.findHomography(bg_points_t, bg_points_{t+1}, RANSAC)
  2. Predict where each tracked target pixel would appear due to drone motion
     p_predicted = H * p_old
  3. Residual flow = actual_position - predicted_position
     → Only true target motion remains in residual

  If ||residual|| > threshold AND inside bounding box → target is moving
  This detects moving vehicles against a static background at 30 Hz.
    </div>
</details>

    <h4>14.6.3 Dead Reckoning During Occlusion</h4>
    <p>When the detector returns no detection for 1–N frames (due to occlusion, adverse lighting, or temporary confidence drop), the tracker must predict forward using only the motion model. The Kalman filter prediction step handles this automatically — but prediction quality degrades with occlusion duration.</p>

    <div class="insight-box">
        <div class="insight-label">OCCLUSION TIERS: SHORT, MEDIUM, LONG</div>
        <p class="text-slate-200 text-sm mt-1">A well-engineered tracker handles occlusions in tiers. For short gaps (1–5 frames), Kalman prediction alone keeps the track alive with acceptable uncertainty growth. For medium gaps (5–30 frames), the process noise Q is inflated to widen the search gate so the target can be re-associated even if it reappears outside the original prediction box. For long gaps (30+ frames), appearance re-ID embeddings stored from the last good frame are compared against new detections anywhere in the frame to re-link a broken track.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Occlusion Handling Strategy:

1. Frames 1–5 (short occlusion): pure KF prediction
   Position uncertainty grows: P grows by Q per frame
   CV model: sigma_pos grows as sigma_a * dt * sqrt(N_frames)
   At 30Hz, sigma_a=2 m/s^2: after 5 frames → sigma_pos += 0.15m (acceptable)

2. Frames 5–30 (medium occlusion): increase Q, widen search gate
   Inflate process noise: Q_inflated = k * Q  (k = 3–10)
   Association gate: Mahalanobis distance threshold → chi2^{-1}(0.99, 2)
   Wider gate ensures that when target reappears outside predicted box, it re-associates

3. Frames 30+ (long occlusion): use appearance re-identification
   Maintain appearance embedding (re-ID vector) from last good frame
   When new detection appears anywhere: compare appearance embedding
   Cosine distance &lt; 0.25 → likely same target, re-initialize track

4. Context-based prediction (for known environments):
   Road network prior: project track onto nearest road using map
   → Force prediction to follow drivable surface
   Basketball court, runway → constrain to 2D plane motion

ByteTrack approach: track preserved for max_age=30 frames even with no detection
  Reappears within 30 frames + IoU match → track ID maintained, never broken
    </div>
</details>

    <h4>14.6.4 Trajectory Prediction with LSTMs</h4>
    <p>For targets exhibiting complex social or intentional behavior (pedestrians in crowds, evasive aircraft), Kalman filters model kinematics but not intent. LSTM-based trajectory predictors learn motion patterns from data and can predict 2–5 seconds into the future with better accuracy than KF for human targets.</p>

    <div class="insight-box">
        <div class="insight-label">LEARNED TRAJECTORY PREDICTION: INTENT, NOT JUST PHYSICS</div>
        <p class="text-slate-200 text-sm mt-1">Kalman filters know that a pedestrian was moving north at 1.2 m/s, so they predict continued northward motion. Social LSTM also knows that another pedestrian is approaching from the left, so it predicts the first pedestrian will veer right to avoid collision — even before any turning motion is observed. This social intent modeling cuts 4.8-second prediction error roughly in half versus constant-velocity extrapolation on the ETH/UCY benchmark dataset.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Social LSTM (Alahi et al., 2016, CVPR):
  Input: position history (x_t, y_t) for t = -T_obs..0
  Architecture:
    Per-agent LSTM: processes each target's own trajectory
    Social pooling: shares hidden states between nearby agents
    (agents that were close in the past influence each other's predictions)
  Output: future trajectory distribution (Gaussian mixture) for T_pred steps

Benchmark (ETH/UCY pedestrian dataset):
  Social LSTM: ADE=0.73m, FDE=1.47m over 4.8 sec prediction
  Constant Velocity:  ADE=1.33m, FDE=2.94m
  (ADE = Average Displacement Error, FDE = Final Displacement Error)

Social Force Models (Helbing &amp; Molnar, 1995):
  Each agent: acceleration = f_goal + sum_j(f_repulsion_j)
  f_goal = (v_desired * e_goal - v_current) / tau   [relaxation toward desired velocity]
  f_repulsion = A * exp((r_ij - d_ij) / B) * e_ij  [repulsion from nearby agents]
  Parameters: A=2000N, B=0.08m, tau=0.5s (calibrated from real crowd data)
  Used in: crowds, pedestrian simulation, drone deconfliction in urban environments

Transformer-based prediction (Giuliari et al., 2021):
  Trajectron++ achieves ADE=0.43m at 6 sec — state-of-art
  Computationally feasible at inference: ~5ms per forward pass on GPU
  Requires training data with diverse motion patterns
    </div>
</details>

    <h3>14.7 Sensor Fusion for Robust Tracking</h3>

    <h4>14.7.1 EO + IR/Thermal Fusion</h4>
    <p>Electro-optical (EO) cameras fail in smoke, dust, glare, and night conditions. Thermal infrared (IR) cameras detect heat signatures through haze and in complete darkness but lack texture for re-identification and struggle with target-background temperature equalization. Fusing both modalities provides all-weather tracking robustness.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">EO + IR Fusion Strategies</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase tracking-widest block mb-2">Decision-Level Fusion</strong>
                <p class="text-slate-300">Run separate detectors on EO and IR. Fuse the bounding box lists using weighted association. If EO confidence &gt; 0.7: use EO box. If EO drops (night) and IR &gt; 0.5: fall back to IR. Simple, but cannot exploit complementary features within a frame.</p>
                <p class="text-slate-400 mt-2">Used in: hand-off trackers, legacy systems. Latency: negligible. Best for: platforms where both cameras are low-cost and pre-tuned independently.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase tracking-widest block mb-2">Feature-Level (Deep) Fusion</strong>
                <p class="text-slate-300">Two parallel CNN feature extractors (one per modality). Feature maps concatenated or element-wise averaged before the detection head. The network learns which modality contributes more in each scene region automatically.</p>
                <p class="text-slate-400 mt-2">FLIR ADAS dataset: mAP improves 8–12% over single-modality. Requires EO+IR frames to be spatially registered (homography alignment via calibration). KAIST dataset: best fusion approach 66.3% MR (Miss Rate) vs 71.4% EO-only (Liu et al., 2022).</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase tracking-widest block mb-2">Attention-Based Fusion</strong>
                <p class="text-slate-300">Cross-modal attention: query from one modality, key/value from the other. Network selectively attends to relevant features from each modality per spatial region. At night: IR features weighted high; midday with glare: EO features re-weighted.</p>
                <p class="text-slate-400 mt-2">CFT (Cross-modal Fusion Transformer, Qingyun et al., 2021): achieves SOTA on KAIST with per-pixel adaptive fusion weights. Adds ~15ms inference vs baseline — significant for embedded deployment.</p>
            </div>
        </div>
    </div>

    <h4>14.7.2 Radar + Vision Fusion</h4>
    <p>Radar detects range and radial velocity (Doppler) reliably through rain, fog, and at long range (1–10 km for 77 GHz automotive radar). Vision provides precise angle and appearance. Fusing both combines radar's long-range detection with vision's angular precision.</p>

    <div class="insight-box">
        <div class="insight-label">RADAR + CAMERA: COMPLEMENTARY STRENGTHS</div>
        <p class="text-slate-200 text-sm mt-1">Radar is accurate in range (±10 cm) but coarse in angle (±0.5°), while a camera is accurate in angle (±0.05°) but blind to range. A Kalman filter in polar coordinates fuses both measurement types into a single state: radar updates the range and radial velocity rows, and the camera updates only the azimuth and elevation rows. The result is a full 3D track with the best accuracy from each sensor in the dimensions it measures well.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Radar + Vision Track Association:

Radar measurement: (range r, azimuth az, elevation el, range_rate r_dot)
Vision measurement: (pixel_u, pixel_v, bbox_width, bbox_height)
  → convert to bearing (az_cam, el_cam) via K^{-1}

Fusion in polar coordinates:
  State: x = [r, az, el, r_dot, az_dot, el_dot]
  KF measurement model for radar: H_r = [1,0,0,0,0,0; 0,1,0,0,0,0; 0,0,1,0,0,0; 0,0,0,1,0,0]
  KF measurement model for camera: H_c = [0,1,0,0,0,0; 0,0,1,0,0,0] (bearing only)

Radar noise: sigma_r=0.1m, sigma_az=0.5deg, sigma_el=0.5deg (77GHz mmWave)
Camera noise: sigma_az=0.05deg, sigma_el=0.05deg (much better angle than radar)
Camera: no range info → H_c has no range row

Practical radar types for small drones:
  77 GHz mmWave (TI AWR1843): 150g, 20W, 300m range, ±50° FOV, $150
  X-band pulsed (size of shoebox): 2–5 km range, heavy/power-hungry
  FMCW radar: provides range + Doppler in a single chirp, no moving parts
    </div>
</details>

    <h4>14.7.3 LiDAR Point Cloud + Visual Tracker Fusion</h4>
    <p>LiDAR provides precise 3D geometry (range accuracy ~2cm at 100m) but produces sparse point clouds that may not contain sufficient points on small or distant targets. Visual trackers provide dense 2D information. Fusion addresses both shortcomings.</p>

    <div class="insight-box">
        <div class="insight-label">LIDAR + CAMERA: DEPTH FOR FREE FROM THE CAMERA BOX</div>
        <p class="text-slate-200 text-sm mt-1">LiDAR points are projected onto the camera image plane using the calibrated extrinsic transform. For each detection bounding box, the LiDAR points that fall inside it are collected and their median range is used as the target's depth — converting the camera's 2D bearing into a full 3D position at centimeter-level range accuracy. This avoids the need for stereo cameras or monocular depth estimation while being more robust than relying on LiDAR clustering alone for small or partially-obscured targets.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
LiDAR-Vision Fusion Pipeline:

1. Project LiDAR points onto camera image plane:
   p_img = K * T_cam_to_lidar * P_lidar   (3D lidar point → pixel)

2. For each vision detection bounding box:
   Extract lidar points that project inside the bbox
   Estimate target range as median range of these points
   (median is robust to background clutter within bbox)

3. Full 3D position:
   (u, v) from bbox center + r from LiDAR cluster centroid
   P_target = r * K^{-1} * [u, v, 1]^T  (scale the camera ray by lidar range)

4. Associate LiDAR clusters across frames (3D multi-object tracking):
   Project Kalman-predicted 3D position into LiDAR frame
   Search for nearest LiDAR cluster within 0.5m radius

Sensors:
  Livox Mid-360: 40m range, 200k pts/sec, 360° FOV, 360g, 8.5W — suitable for sUAS
  Velodyne VLP-16: 100m range, 300k pts/sec, 360° FOV, 830g, 8W — larger platform
  Ouster OS0-32: 50m range, 655k pts/sec, 360°×90° FOV, 445g — good for targeting
    </div>
</details>

    <h4>14.7.4 Covariance Intersection — Multi-UAV Track Fusion</h4>
    <p>When multiple UAVs each maintain their own target tracker, fusing their independent track estimates requires care. If the tracks have correlated errors (e.g., both used the same GPS satellite constellation), naively averaging them underestimates the true uncertainty. Covariance Intersection (CI) is a conservative fusion method that does not require knowledge of the cross-correlation.</p>

    <div class="insight-box">
        <div class="insight-label">COVARIANCE INTERSECTION: SAFE FUSION WITHOUT KNOWING CORRELATIONS</div>
        <p class="text-slate-200 text-sm mt-1">When two UAVs each report a target track, their errors may be correlated (both using the same GPS constellation, same weather, same terrain DEM). Naively averaging the two estimates as if they were independent produces an overconfident covariance that can cause filter divergence. Covariance Intersection finds the weighted combination of the two estimates' information matrices that is guaranteed to be conservative — never claiming more certainty than warranted — regardless of the unknown correlation between them.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Covariance Intersection (Julier &amp; Uhlmann, 1997):

Inputs:  (x_1, P_1) from UAV-1,  (x_2, P_2) from UAV-2
Fusion:
  P_fused^{-1} = omega * P_1^{-1} + (1-omega) * P_2^{-1}
  x_fused = P_fused * (omega * P_1^{-1} * x_1 + (1-omega) * P_2^{-1} * x_2)

  omega: chosen to minimize det(P_fused) or tr(P_fused)
  Optimal omega: closed-form via Newton's method (3–5 iterations typical)

Property: P_fused is consistent (not overconfident) regardless of correlation.
  Worst case (perfect correlation): CI reduces to the larger of P_1, P_2
  Best case (zero correlation): CI approaches optimal Bayesian fusion

Trade-off: CI is conservative — when tracks ARE independent, it gives
  a larger P_fused than optimal fusion. But it never causes filter divergence
  from unmodeled correlations.

Track-to-Track Fusion protocol (multi-UAV scenario):
  1. Each UAV reports: track_id, x_state, P_covariance, timestamp, sensor_quality
  2. Ground node performs CI fusion across all UAV reports for the same track_id
  3. Broadcast fused track back to all UAVs for consistent common operating picture
  4. Track ID association across UAVs: use Re-ID appearance embedding + CI distance gate
    </div>
</details>

    <h3>14.8 Anti-Drone and Counter-UAS AI Systems</h3>
    <p>The same technologies used for drone targeting are also deployed defensively to detect, track, classify, and defeat hostile unmanned systems. Understanding the C-UAS (Counter-Unmanned Aircraft Systems) pipeline is essential context for sUAS operators and AI developers working in security-relevant applications.</p>

    <h4>14.8.1 Detection Layer — Multi-Sensor Architecture</h4>
    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">C-UAS Sensor Modalities</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-2">RF Detection</strong>
                <p class="text-slate-300">Most commercial drones transmit on 2.4 GHz and 5.8 GHz (DJI Lightbridge, OcuSync, WiFi). RF sensors passively receive and analyze these signals. RF fingerprinting extracts hardware-specific features from the signal (frequency error, phase noise, modulation artifacts) unique to each transmitter IC — similar to RF fingerprinting of smartphones. Detection range: 1–5 km depending on transmit power and site clutter.</p>
                <p class="text-slate-400 mt-2">DJI Aeroscope: specific protocol analysis extracting drone serial number, GPS position of drone AND operator, altitude, speed from DJI's downlink. Commercial systems: DeDrone RF360, Dedrone SkyTracker. Limitation: encrypted DJI protocols post-2020 reduce operator location extraction.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 block mb-2">Radar Detection</strong>
                <p class="text-slate-300">Micro-Doppler signature: drone rotors produce distinctive sidebands in radar returns. Main body Doppler: v_drone (straight path). Rotor blade Doppler: ±v_tip = ±omega_rotor * R_blade. For a DJI Phantom (2 RPM ≈ 200 rad/s, 12cm radius): tip speed = 24 m/s → ±87 km/h Doppler sidebands. This "flash" pattern is distinctive even when the drone body is below radar noise floor.</p>
                <p class="text-slate-400 mt-2">Systems: Thales GroundMaster 20, Leonardo Falcon Shield. Limitation: birds produce similar micro-Doppler — classification AI must distinguish flapping from rotating motion. Small drones (sub-250g) may have RCS &lt; 0.01 m^2 — below minimum detectable signal at 2 km.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 block mb-2">Acoustic Detection</strong>
                <p class="text-slate-300">Microphone arrays (4–16 element) perform beamforming to estimate drone bearing from rotor acoustic signature. Rotor fundamental frequency: f = RPM / 60 × N_blades. DJI Phantom 4: ~105 Hz fundamental + harmonics. Detection range: 150–400m in moderate wind (&lt;5 m/s wind noise). Performance degrades rapidly with wind speed and urban noise floor.</p>
                <p class="text-slate-400 mt-2">Used for: short-range cueing of optical/IR sensors rather than standalone tracking. Time Difference of Arrival (TDOA) using 4+ microphones provides 3D bearing. Systems: Squarehead Technology GroundAware, Dedrone DroneDefender acoustic module.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
                <strong class="text-purple-400 block mb-2">Optical/EO-IR Detection</strong>
                <p class="text-slate-300">360° EO cameras + thermal IR for visual detection and tracking. AI classifier trained on small UAS (DJI, Autel, custom builds, fixed-wing) vs birds vs aircraft. Challenges: DJI Nano at 500m subtends &lt;2 pixels — object size at detection limit. Sky background provides high contrast; urban clutter is problematic.</p>
                <p class="text-slate-400 mt-2">Detection AI pipeline: background subtraction → small object detection (search in 3D around radar cue) → classification CNN → track initialization. End-to-end latency target: &lt;500ms from first detection to track declaration.</p>
            </div>
        </div>
    </div>

    <h4>14.8.2 Friend/Foe/Neutral Classification AI Pipeline</h4>
    <div class="insight-box">
        <div class="insight-label">C-UAS CLASSIFICATION: FUSE RF, KINEMATICS, AND VISUAL CUES</div>
        <p class="text-slate-200 text-sm mt-1">A C-UAS classifier fuses three independent evidence streams: RF features (protocol type, frequency, transmission fingerprint) identify the drone's make/model without line of sight; kinematic features (speed, altitude profile, trajectory shape) indicate intent; and visual features (frame shape, rotor count, payload presence) confirm classification when the target is close enough. A Random Forest or gradient-boosted tree combining all three achieves ~95% classification accuracy distinguishing commercial drones from birds, aircraft, and weather balloons.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
C-UAS Classification Pipeline:

Stage 1: Detection (any sensor triggers)
  Fused sensor confidence score > threshold → declare "Unclassified UAS"
  Initialize track in C-UAS track manager

Stage 2: Classification features (per track):
  RF features:
    - Frequency band (2.4/5.8/900 MHz/custom)
    - Protocol type (DJI OcuSync/Lightbridge/WiFi/custom datalink)
    - RF fingerprint embedding (CNN on IQ samples, 128-d vector)
    - Transmission schedule (burst pattern vs continuous)
  Kinematic features:
    - Speed (hobby drones: 0–15 m/s; racing: 0–30 m/s; military: 0–50 m/s+)
    - Altitude profile (low-altitude loiter = surveillance pattern)
    - Trajectory shape (straight approach vs loiter vs erratic)
    - Hover capability (multirotor) vs fixed-wing glide (asymmetric speed distribution)
  Visual features (if in range):
    - Frame shape (X-frame, H-frame, fixed-wing, hybrid)
    - Rotor count from visual
    - Payload presence (suspended object)

Stage 3: Classification model
  Random Forest or GBT on extracted features: ~95% accuracy distinguishing
  commercial consumer drone vs bird vs aircraft vs weather balloon (AFRL datasets)
  CNN classifier on EO/IR crop: ResNet-50 fine-tuned on DroneVehicle dataset
  Time-series classifier on trajectory: LSTM on kinematic sequence

Stage 4: Intent assessment
  Proximity to protected area: distance + trajectory convergence time
  Operator position (if RF) relative to protected perimeter
  Loiter pattern detection: if drone circles a fixed point for &gt;30s → surveillance flag
  Output: threat score 0.0–1.0 + category (FRIENDLY / UNKNOWN / HOSTILE / NEUTRAL)
    </div>
</details>

    <h4>14.8.3 Defeat Mechanisms</h4>
    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">C-UAS Defeat Methods</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-2">Non-Kinetic (Electronic)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li><strong>RF Jamming:</strong> Broadband jammer overwhelms drone control link (2.4+5.8 GHz). Drone falls back to RTH (Return to Home) or hovers. Range: 500m–2km depending on power. Collateral interference: jams all 2.4/5.8 GHz in area (WiFi, Bluetooth).</li>
                    <li><strong>GNSS Spoofing:</strong> Transmit false GPS signals overriding drone's navigation. Drone believes it is elsewhere and flies to false "home" position. Precision spoofing requires phase-coherent multi-channel signal generation. Legal restriction: illegal in most jurisdictions for civilian use.</li>
                    <li><strong>GPS Denial (wide area):</strong> Deny drone GPS over a protected area. Drone falls into altitude-hold or lands if GPS required for mode. Countermeasure: drones with optical flow/VIO navigation are immune.</li>
                    <li><strong>Protocol-specific takeover:</strong> Reverse-engineered DJI commands can land/RTH specific models. Requires exact model identification from RF fingerprint. Less reliable as encryption increases.</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-rose-400 block mb-2">Kinetic (Physical Defeat)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li><strong>Net capture:</strong> Interceptor drone launches net from 10–30m. DroneHunter (Fortem Technologies): autonomous radar+visual tracking, launches projectile net. Zero collateral, intact capture for forensics. Range: 30–150m. Success rate: ~85% against hovering targets, lower vs fast-movers.</li>
                    <li><strong>High-power microwave (HPM):</strong> Directed energy (THOR/PHASER systems, US Air Force). Disrupts electronics via induced currents. Range: 500m+. Effect: permanent damage or temporary brownout depending on power. Fast: speed-of-light engagement time.</li>
                    <li><strong>Laser defeat:</strong> 10kW+ fiber laser tracks and burns through airframe or motor. Effective vs slow targets. Challenge: atmospheric turbulence causes beam wander at long range. Systems: Raytheon HEL MD, Israel's Iron Beam.</li>
                    <li><strong>Projectile intercept:</strong> Traditional: 20mm cannon or modified SAM. Modern: autonomous sky-guard systems (Rafael Drone Dome, MBDA DragonFire). Requires careful engagement geometry to avoid fragmentation hazard on the ground.</li>
                </ul>
            </div>
        </div>
    </div>

    <h3>14.9 Real-World Implementation Stack</h3>
    <p>Deploying an AI tracking system on a real drone requires integrating detection, tracking, state estimation, guidance, and flight control into a low-latency pipeline that runs within the power and weight budget of a small platform. This section covers the practical engineering decisions.</p>

    <h4>14.9.1 Latency Budget Analysis</h4>
    <p>End-to-end latency — from photons hitting the sensor to motor response — determines the maximum target speed and maneuver rate that can be tracked. Every millisecond matters.</p>

    <div class="insight-box">
        <div class="insight-label">END-TO-END LATENCY: 110–350 MS FROM PHOTONS TO ROTORS</div>
        <p class="text-slate-200 text-sm mt-1">The largest single contributor to tracking latency is usually the GPU inference step (10–30 ms for YOLOv8), but the rotor mechanical response time (50–150 ms rise constant) means that even a perfect zero-latency computer cannot close the loop faster than the motors allow. At a typical 200 ms total latency and 5 m/s target speed, the drone is reacting to where the target was 1 meter ago — requiring the Kalman filter to predict the target's position forward by the measured latency before issuing guidance commands.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Typical Latency Budget (30 Hz pipeline):

Source                          Typical Latency   Notes
-------------------------------------------------------------------
Camera sensor exposure           33ms             1/30 sec frame period
Camera readout (rolling shutter) 2–5ms            per row ~30µs, 480 rows total
ISP + USB/CSI transfer           5–15ms           USB3: 5ms; MIPI CSI-2: 1ms
GPU inference (YOLO detection)   10–30ms          YOLOv8n: 10ms Jetson Orin; v8m: 25ms
Kalman filter update             0.1–0.5ms        pure CPU, negligible
Geolocation calculation          0.5–1ms          matrix multiply, CPU-bound
Guidance law computation         0.5–1ms          negligible
MAVLink serial transmission      1–5ms            921600 baud, 26-byte message
ArduPilot command processing     2–5ms            1kHz main loop
Attitude controller + ESC PWM   2.5ms            400Hz = 2.5ms period
Rotor mechanical response        50–150ms         motor rise time constant ~50ms

TOTAL end-to-end:
  Best case (MIPI CSI, Orin, direct UART):  ~110ms
  Typical case (USB, mid-tier GPU, radio): ~200–350ms

Implication:
  Target moving at 5 m/s: 200ms → 1.0m position error from latency alone.
  Must be compensated by predictive tracking (Kalman filter extrapolates forward by latency).

Latency compensation:
  Predict target position forward by t_latency:
  x_compensated = x_hat + v_hat * t_latency + 0.5 * a_hat * t_latency^2
  Use t_latency measured empirically (hardware timestamp at capture + timestamp at command send).
    </div>
</details>

    <h4>14.9.2 Edge Inference Hardware</h4>
    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Onboard Compute Options for sUAS Tracking</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase tracking-widest block mb-2">Hailo-8 (M.2/mPCIe)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>26 TOPS INT8</li>
                    <li>2.5W at full load</li>
                    <li>Weight: 10g (M.2 form factor)</li>
                    <li>YOLOv8s: 50–80 FPS</li>
                    <li>Requires HailoRT SDK + model compilation</li>
                    <li>Best for: micro-drones where Jetson is too heavy</li>
                    <li>No CUDA — custom compiler pipeline required</li>
                    <li>Works with RPi 5 via M.2 HAT</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase tracking-widest block mb-2">NVIDIA Jetson Orin NX (16GB)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>100 TOPS (INT8)</li>
                    <li>10–25W (configurable power modes)</li>
                    <li>Weight: 45g (module only)</li>
                    <li>YOLOv8m: 60 FPS (TensorRT FP16)</li>
                    <li>Full CUDA/TensorRT/DeepStream ecosystem</li>
                    <li>Run ByteTrack + geolocation simultaneously</li>
                    <li>Best for: systems where &lt;500g payload allowed</li>
                    <li>ROS2 + MAVROS on same board feasible</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase tracking-widest block mb-2">Qualcomm Flight RB5 5G</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Hexagon DSP: 15 TOPS AI</li>
                    <li>Snapdragon 888 CPU + Adreno 660 GPU</li>
                    <li>8–12W power envelope</li>
                    <li>Integrated 5G + WiFi + BT</li>
                    <li>QNN (Qualcomm Neural Network) SDK</li>
                    <li>PX4 reference platform (native integration)</li>
                    <li>Best for: long-endurance missions needing 5G uplink</li>
                    <li>YOLOv8s: ~45 FPS via TFLite/SNPE</li>
                </ul>
            </div>
        </div>
    </div>

    <h4>14.9.3 TensorRT and ONNX Optimization</h4>
    <div class="insight-box">
        <div class="insight-label">TENSORRT: 2–4× SPEEDUP FROM QUANTIZATION AND FUSION</div>
        <p class="text-slate-200 text-sm mt-1">TensorRT converts a trained PyTorch model into a GPU-optimized engine by fusing adjacent layers (e.g., Conv + BN + ReLU become one kernel call), rewriting computation graphs to maximize hardware utilization, and optionally quantizing weights from FP32 to FP16 (2× speedup, &lt;0.5% mAP loss) or INT8 (4× speedup, 1–2% mAP loss with a calibration dataset). For Hailo-8 deployment the equivalent is the Hailo Model Zoo compiler which targets the fixed-function dataflow architecture and requires an ONNX intermediate. The ONNX Runtime path (for RPi 5 CPU targets) requires no compilation but delivers the lowest throughput.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Deployment Optimization Pipeline:

1. Training framework (PyTorch / Ultralytics):
   model = YOLO("yolov8m.pt")
   model.export(format="onnx", opset=17, dynamic=False, imgsz=640)
   → yolov8m.onnx  (intermediate format, framework-independent)

2. TensorRT conversion (NVIDIA targets):
   trtexec --onnx=yolov8m.onnx --saveEngine=yolov8m.trt
           --fp16 --workspace=4096 --batch=1
   FP32 → FP16: ~2x speedup, &lt;0.5% mAP loss on COCO
   FP32 → INT8: ~4x speedup, requires calibration dataset (500 images)
                ~1–2% mAP loss vs FP32 baseline

3. Hailo compilation:
   hailo optimize --model yolov8m.onnx --calib-set-path ./calibration/
   hailo compile --model optimized.har --hw-arch hailo8
   → yolov8m.hef  (Hailo Executable File)

4. ONNX Runtime (CPU/ARM targets, RPi 5):
   session = ort.InferenceSession("yolov8m.onnx",
             providers=["CPUExecutionProvider"])
   session.run(output_names, {input_name: img_tensor})
   YOLOv8n on RPi 5 ARM Cortex-A76: ~8 FPS (adequate for slow-target hover)

Latency benchmarks (YOLOv8m, 640×640 input, batch=1):
  RTX 3090 FP16 TensorRT:        3ms  (330 FPS)
  Jetson Orin NX 16G FP16 TRT:  16ms  (60 FPS)
  Jetson Nano FP16 TRT:          55ms  (18 FPS — marginal for real-time)
  Hailo-8 INT8:                  12ms  (80 FPS)
  RPi 5 ARM64 ONNX FP32:        120ms  (8 FPS — slow targets only)
    </div>
</details>

    <h4>14.9.4 ROS 2 Integration Architecture</h4>
    <div class="insight-box">
        <div class="insight-label">ROS 2 NODE GRAPH: DETECTOR → TRACKER → GUIDANCE → MAVROS</div>
        <p class="text-slate-200 text-sm mt-1">A complete ROS 2 tracking pipeline chains four nodes: the camera node publishes raw images; the detector node subscribes, runs YOLOv8, and publishes DetectionArray messages; the tracker node subscribes to detections plus the drone's MAVROS pose, runs ByteTrack and geolocation, and publishes 3D world-frame tracks; the guidance node converts the primary track into MAVLink velocity setpoints via MAVROS. Each node publishes at 30 Hz. If the guidance node crashes, PX4's OFFBOARD mode timeout (1–3 sec) automatically returns the drone to HOLD mode as a safety net.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
ROS 2 Node Graph (typical airborne tracking system):

/camera_node (sensor_msgs/Image @ 30Hz)
  → /detector_node
      Subscribes: /camera/image_raw
      Runs: YOLOv8 inference
      Publishes: /detections (custom DetectionArray.msg) @ 30Hz

/tracker_node (custom)
      Subscribes: /detections, /mavros/local_position/pose
      Runs: ByteTrack + Kalman filter + geolocation
      Publishes: /tracks (TrackArray.msg with 3D world positions) @ 30Hz
                 /target/primary (geometry_msgs/PoseStamped — primary target) @ 30Hz

/guidance_node (custom)
      Subscribes: /tracks/target/primary, /mavros/local_position/velocity
      Runs: PN guidance law or MPPI
      Publishes: /mavros/setpoint_raw/local (mavros_msgs/PositionTarget) @ 30Hz

/mavros_node (mavros package)
      Subscribes: /mavros/setpoint_raw/local
      Translates to: MAVLink SET_POSITION_TARGET_LOCAL_NED
      Sends to flight controller via UART/USB

Key MAVROS parameters for tracking:
  setpoint_raw/local: publishes PositionTarget
    coordinate_frame: FRAME_LOCAL_NED (1)
    type_mask: 0b0000111111000111 = velocity only (0x0FC7)
      or:      0b0000111111000000 = pos + vel (0x0FC0)
    velocity: vx, vy, vz in m/s

OFFBOARD mode arming sequence:
  1. Set mode to OFFBOARD via MAVROS (rosservice call /mavros/set_mode)
  2. Arm via MAVROS (rosservice call /mavros/cmd/arming)
  3. Publish setpoints at &gt;2Hz or OFFBOARD drops out
  Safety: if ROS node crashes, FC returns to HOLD mode after 1–3 sec timeout
    </div>
</details>

    <h4>14.9.5 Complete System Power Budget</h4>
    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">DJI F450 Class (1.5 kg payload) AI Tracking System — Power Budget</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-2">Compute &amp; Sensors</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Jetson Orin NX 8G (15W mode): 15W</li>
                    <li>Sony IMX335 camera (USB3): 2.5W</li>
                    <li>Gimbal servos (2-axis): 3W average</li>
                    <li>GNSS module (u-blox F9P RTK): 0.5W</li>
                    <li>LTE modem (optional): 2W</li>
                    <li>Total compute payload: ~23W</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-2">Flight System</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>4× motors + ESCs (hover, 1.5kg total): 200W</li>
                    <li>Flight controller (Cube Orange): 1W</li>
                    <li>RC receiver: 0.3W</li>
                    <li>Total flight system: ~201W</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700 md:col-span-2">
                <strong class="text-amber-400 block mb-2">Battery &amp; Endurance</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Battery: 4S 10Ah LiPo = 4 × 3.7V × 10Ah = 148 Wh</li>
                    <li>Total power draw (hover + compute): 224W</li>
                    <li>Estimated flight time: 148Wh / 224W × 0.8 (efficiency) = ~32 min</li>
                    <li>vs same airframe without AI payload (180W): ~40 min</li>
                    <li>AI payload endurance penalty: ~20% — acceptable for most missions</li>
                    <li>Swap compute for Hailo-8 (2.5W): payload drops to 10.5W → endurance 38 min</li>
                </ul>
            </div>
        </div>
    </div>

    <div class="bg-slate-800 p-5 rounded border-l-4 border-sky-500 mt-6 text-sm text-slate-300">
        <strong class="text-sky-400 text-base block mb-3">Module Summary: The Full Targeting Stack</strong>
        A complete airborne AI targeting system chains the following stages: (1) detection via YOLOv8 or similar at 20–60 FPS, (2) multi-object tracking via ByteTrack or BoT-SORT maintaining persistent identity across frames, (3) state estimation via Kalman/EKF/IMM filtering the raw detections into smooth 3D tracks with velocity and uncertainty, (4) geolocation transforming pixel coordinates through the camera intrinsic → extrinsic → world coordinate chain to NED/WGS84 positions, (5) a guidance law (PN for interception, MPPI for constrained following) converting 3D track data to velocity commands, (6) cascade PID or MPC flight control translating velocity commands to rotor thrust, and (7) sensor fusion combining EO, IR, radar, or LiDAR to ensure robustness across all environmental conditions. The end-to-end latency budget from photons to rotor response is typically 100–350ms — requiring predictive tracking to compensate for this lag at speeds above 1 m/s.
    </div>
</div>
`;
