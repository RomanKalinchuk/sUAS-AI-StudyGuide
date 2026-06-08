export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 9</span>
    <h2>Sensor Fusion &amp; Extended Kalman Filter Architecture</h2>
    <p>State estimation is the mathematical foundation of autonomous flight. Without knowing position, velocity, and attitude with bounded error, no control law can function correctly. This module covers the full theory of the Extended Kalman Filter (EKF) — from first-principles derivation through the Unscented and Error-State variants — and then maps that theory directly onto the production implementations in ArduPilot EKF3 and PX4 EKF2.</p>

    <h3>9.1 Why EKF: The IMU Integration Problem</h3>
    <p>Inertial Measurement Units (IMUs) measure acceleration and angular rate. Extracting position from acceleration requires two integrations — and each integration <strong>accumulates error</strong>. This is not an implementation flaw; it is fundamental physics. The EKF exists to correct this drift using external references.</p>

    <div class="insight-box mb-6">
        <div class="insight-label">Core Problem</div>
        <p class="text-slate-200 text-sm mt-1">IMU white noise causes position error that grows as <strong>t<sup>3/2</sup></strong>. IMU bias (systematic offset) causes position error that grows as <strong>t<sup>2</sup></strong>. A MEMS IMU used alone becomes practically useless for position after ~30 seconds. Even tactical-grade IMUs (ring-laser gyro) drift meters per hour in GPS-denied environments.</p>
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">IMU-Only Dead Reckoning Error — Consumer MEMS (e.g. ICM-42688)</div>
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-slate-800/50 text-slate-400 text-xs">
                    <th class="p-3 text-left">Time Elapsed</th>
                    <th class="p-3 text-left">Velocity Error</th>
                    <th class="p-3 text-left">Position Error (noise)</th>
                    <th class="p-3 text-left">Position Error (bias)</th>
                    <th class="p-3 text-left">Verdict</th>
                </tr>
            </thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-white font-bold">1 s</td>
                    <td class="p-3 text-emerald-400">~0.01 m/s</td>
                    <td class="p-3 text-emerald-400">~0.003 m</td>
                    <td class="p-3 text-emerald-400">~0.005 m</td>
                    <td class="p-3 text-emerald-300">Excellent — attitude hold OK</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-white font-bold">10 s</td>
                    <td class="p-3 text-amber-400">~0.032 m/s</td>
                    <td class="p-3 text-amber-400">~0.11 m</td>
                    <td class="p-3 text-amber-400">~0.05 m</td>
                    <td class="p-3 text-amber-300">Marginal — short waypoint hops</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-white font-bold">60 s</td>
                    <td class="p-3 text-rose-400">~0.08 m/s</td>
                    <td class="p-3 text-rose-400">~1.5 m</td>
                    <td class="p-3 text-rose-400">~1.8 m</td>
                    <td class="p-3 text-rose-300">Unusable — &gt;3 m total drift</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-white font-bold">5 min</td>
                    <td class="p-3 text-rose-600">~0.17 m/s</td>
                    <td class="p-3 text-rose-600">~18 m</td>
                    <td class="p-3 text-rose-600">~44 m</td>
                    <td class="p-3 text-rose-400">Catastrophic — 60+ m total drift</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p>The <strong>t² bias drift</strong> is the dominant failure mode in GPS-denied environments. The EKF fuses GPS, barometer, magnetometer, and optical flow to continuously correct and bound this drift, turning the IMU into a reliable short-term predictor between external fixes.</p>

    <!-- ===== 9.2 EKF THEORY ===== -->
    <h3>9.2 Kalman Filter Theory: From Linear to Nonlinear</h3>

    <h4>The Linear Kalman Filter (KF)</h4>
    <p>The classical Kalman Filter (Kalman, 1960) is the optimal minimum-variance estimator for a linear system with Gaussian noise. The system model is:</p>
    <div class="bg-slate-900 border border-sky-800/50 rounded-lg p-4 mb-4 font-mono text-sm text-slate-200">
        <div class="text-slate-400 text-xs uppercase tracking-widest mb-2">Process &amp; Measurement Models</div>
        <p class="mb-1"><strong class="text-sky-400">Process:</strong> $x_k = F_{k-1} x_{k-1} + B_{k-1} u_{k-1} + w_{k-1}$</p>
        <p class="mb-1"><strong class="text-sky-400">Measurement:</strong> $z_k = H_k x_k + v_k$</p>
        <p class="text-slate-400 text-xs mt-2">where $w_{k-1} \sim \mathcal{N}(0, Q_k)$ (process noise) and $v_k \sim \mathcal{N}(0, R_k)$ (measurement noise). $F$ = state transition matrix, $H$ = measurement matrix, $B$ = control input matrix, $u$ = control vector.</p>
    </div>

    <h4>Step-by-Step EKF Derivation</h4>
    <p>Most real systems — including drones — are nonlinear. The attitude quaternion kinematics, the GPS projection from WGS-84 to NED, and the magnetometer model are all nonlinear functions. The EKF handles this by <strong>linearizing around the current estimate using a first-order Taylor expansion (Jacobian)</strong>.</p>

    <p>Given nonlinear process and measurement models:</p>
    <div class="bg-slate-900 border border-amber-800/40 rounded-lg p-4 mb-4 font-mono text-sm text-slate-200">
        <div class="text-slate-400 text-xs uppercase tracking-widest mb-2">Nonlinear System Models</div>
        <p class="mb-1"><strong class="text-amber-400">Process:</strong> $x_k = f(x_{k-1}, u_{k-1}) + w_{k-1}$</p>
        <p class="mb-1"><strong class="text-amber-400">Measurement:</strong> $z_k = h(x_k) + v_k$</p>
        <p class="text-slate-400 text-xs mt-2">$f(\cdot)$ = nonlinear state transition function, $h(\cdot)$ = nonlinear measurement function.</p>
    </div>

    <p>The Jacobians are computed at the current state estimate:</p>
    <div class="bg-slate-900 border border-emerald-800/40 rounded-lg p-4 mb-4 font-mono text-sm text-slate-200">
        <div class="text-slate-400 text-xs uppercase tracking-widest mb-2">Jacobian Linearization</div>
        <p class="mb-1">$F_k = \left.\frac{\partial f}{\partial x}\right|_{\hat{x}_{k-1|k-1}}$ &nbsp; (Jacobian of process model w.r.t. state)</p>
        <p class="mt-2">$H_k = \left.\frac{\partial h}{\partial x}\right|_{\hat{x}_{k|k-1}}$ &nbsp; (Jacobian of measurement model w.r.t. state)</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-slate-900 p-5 rounded border-l-4 border-sky-500">
            <strong class="text-sky-400 block mb-3 text-sm uppercase tracking-wider">Predict Step</strong>
            <div class="font-mono text-xs space-y-3 text-slate-200">
                <div>
                    <div class="text-slate-400 mb-1">1. Propagate state mean:</div>
                    <div>$\hat{x}_{k|k-1} = f(\hat{x}_{k-1|k-1}, u_{k-1})$</div>
                </div>
                <div>
                    <div class="text-slate-400 mb-1">2. Propagate covariance:</div>
                    <div>$P_{k|k-1} = F_k P_{k-1|k-1} F_k^T + Q_k$</div>
                </div>
            </div>
            <div class="mt-3 text-xs text-sky-300 bg-sky-900/20 p-2 rounded">State grows more uncertain; $P$ inflates due to $Q_k$.</div>
        </div>
        <div class="bg-slate-900 p-5 rounded border-l-4 border-emerald-500">
            <strong class="text-emerald-400 block mb-3 text-sm uppercase tracking-wider">Update Step</strong>
            <div class="font-mono text-xs space-y-3 text-slate-200">
                <div>
                    <div class="text-slate-400 mb-1">1. Innovation (measurement residual):</div>
                    <div>$\tilde{y}_k = z_k - h(\hat{x}_{k|k-1})$</div>
                </div>
                <div>
                    <div class="text-slate-400 mb-1">2. Innovation covariance:</div>
                    <div>$S_k = H_k P_{k|k-1} H_k^T + R_k$</div>
                </div>
                <div>
                    <div class="text-slate-400 mb-1">3. Kalman gain:</div>
                    <div>$K_k = P_{k|k-1} H_k^T S_k^{-1}$</div>
                </div>
                <div>
                    <div class="text-slate-400 mb-1">4. Update state:</div>
                    <div>$\hat{x}_{k|k} = \hat{x}_{k|k-1} + K_k \tilde{y}_k$</div>
                </div>
                <div>
                    <div class="text-slate-400 mb-1">5. Update covariance (Joseph form for stability):</div>
                    <div>$P_{k|k} = (I - K_k H_k) P_{k|k-1} (I - K_k H_k)^T + K_k R_k K_k^T$</div>
                </div>
            </div>
            <div class="mt-3 text-xs text-emerald-300 bg-emerald-900/20 p-2 rounded">$P$ shrinks; the Kalman gain $K_k$ optimally blends model vs sensor.</div>
        </div>
    </div>

    <div class="insight-box mb-6">
        <div class="insight-label">Interpreting the Kalman Gain</div>
        <p class="text-slate-200 text-sm mt-1">$K_k = P_{k|k-1} H_k^T (H_k P_{k|k-1} H_k^T + R_k)^{-1}$. When $R_k \to 0$ (sensor is very accurate), $K \to H^{-1}$ — trust the sensor completely. When $P_{k|k-1} \to 0$ (model prediction is very accurate), $K \to 0$ — ignore the sensor. The filter automatically finds the minimum-variance balance.</p>
    </div>

    <figure class="my-6">
        <img src="images/m9_kalman_concept.png" alt="Kalman filter predict-update cycle showing state mean and covariance propagation" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">The Kalman filter predict-update cycle: state mean and covariance alternately propagate (predict) and collapse (update) as measurements arrive. Source: <a href="https://commons.wikimedia.org/wiki/File:Basic_concept_of_Kalman_filtering.svg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons, Petteri Aimonen, CC0</a></figcaption>
    </figure>

    <!-- ===== 9.3 EKF vs UKF vs ESKF ===== -->
    <h3>9.3 EKF vs UKF vs ESKF: Choosing the Right Filter</h3>
    <p>Three Kalman variants dominate production drone navigation. Each makes a different tradeoff between accuracy, computational cost, and numerical robustness.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Property</th>
                    <th class="p-3 text-sky-400">EKF</th>
                    <th class="p-3 text-amber-400">UKF</th>
                    <th class="p-3 text-emerald-400">ESKF</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Nonlinearity handling</td>
                    <td class="p-3 text-slate-300">First-order Taylor (Jacobian)</td>
                    <td class="p-3 text-slate-300">Unscented transform — sigma points</td>
                    <td class="p-3 text-slate-300">Nominal state + error-state linearization</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">Rotation representation</td>
                    <td class="p-3 text-slate-300">Quaternion in state (overparameterized, needs re-normalization)</td>
                    <td class="p-3 text-slate-300">Sigma points on SO(3) manifold (complex)</td>
                    <td class="p-3 text-slate-300">Rotation error in tangent space so(3) — no singularity</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Accuracy</td>
                    <td class="p-3 text-slate-300">Good for mildly nonlinear systems</td>
                    <td class="p-3 text-slate-300">Better for highly nonlinear systems; captures 3rd-order moments</td>
                    <td class="p-3 text-slate-300">Near-EKF accuracy; works closer to true state</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">Jacobian computation</td>
                    <td class="p-3 text-rose-400">Required — error-prone, can diverge</td>
                    <td class="p-3 text-emerald-400">Not required</td>
                    <td class="p-3 text-amber-400">Required for error-state model only (simpler)</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Computational cost</td>
                    <td class="p-3 text-emerald-400">$O(n^2)$ — lowest</td>
                    <td class="p-3 text-amber-400">$O(n^2)$ sigma points, ~2-3× EKF cost</td>
                    <td class="p-3 text-emerald-400">Similar to EKF</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">Numerical stability</td>
                    <td class="p-3 text-amber-400">Covariance can go non-positive-definite under poor Jacobians</td>
                    <td class="p-3 text-emerald-400">Inherently more stable</td>
                    <td class="p-3 text-emerald-400">Excellent — small errors stay linear</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Gimbal lock / singularity</td>
                    <td class="p-3 text-amber-400">Euler-angle variants fail at ±90° pitch; quaternion OK if re-normalized</td>
                    <td class="p-3 text-emerald-400">Handles well</td>
                    <td class="p-3 text-emerald-400">Designed for this — native SO(3) ops</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">Production use</td>
                    <td class="p-3 text-sky-400">ArduPilot EKF3, PX4 EKF2, most autopilots</td>
                    <td class="p-3 text-sky-400">Duckietown UKF, high-end robotics</td>
                    <td class="p-3 text-sky-400">VINS-Mono, LIO-SAM, FAST-LIO, research VIO</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Best for</td>
                    <td class="p-3 text-slate-300">General drone navigation with GPS</td>
                    <td class="p-3 text-slate-300">High-maneuvering or strongly nonlinear dynamics</td>
                    <td class="p-3 text-slate-300">VIO / SLAM, GPS-denied, aggressive flight</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h4>Unscented Kalman Filter (UKF) — The Sigma Point Method</h4>
    <p>Instead of computing a Jacobian, the UKF selects $2n+1$ deterministic <strong>sigma points</strong> around the current estimate, propagates them all through the nonlinear function, and fits a Gaussian to the output cloud. For an $n$-state system, the sigma points are:</p>
    <div class="bg-slate-900 border border-amber-800/40 rounded-lg p-4 mb-4 font-mono text-sm text-slate-200">
        <p class="mb-2">$\mathcal{X}_0 = \hat{x}$, &nbsp; $\mathcal{X}_i = \hat{x} + \left(\sqrt{(n+\lambda)P}\right)_i$, &nbsp; $\mathcal{X}_{i+n} = \hat{x} - \left(\sqrt{(n+\lambda)P}\right)_i$</p>
        <p class="text-slate-400 text-xs">where $\lambda = \alpha^2(n+\kappa) - n$ is a scaling parameter. This achieves 3rd-order accuracy for Gaussian distributions without computing any derivatives.</p>
    </div>

    <h4>Error-State Kalman Filter (ESKF) — Navigating on SO(3)</h4>
    <p>The ESKF splits the state into a <strong>nominal state</strong> (propagated with full nonlinear kinematics, no noise) and an <strong>error state</strong> (small perturbations tracked by a linear Kalman filter). For rotations, the error is represented as a rotation vector $\delta\theta \in \mathbb{R}^3$ in the Lie algebra $\text{so}(3)$, avoiding the overparameterization of quaternions. The nominal rotation integrates as $R_k = R_{k-1} \exp(\omega \Delta t)$; the error covariance stays a well-conditioned $3\times3$ block. VINS-Mono, FAST-LIO2, and SLAM algorithms widely use ESKF for this reason.</p>

    <!-- ===== 9.4 EKF3 State Vector ===== -->
    <h3>9.4 The EKF3 State Vector: All 24 States</h3>
    <p>The ArduPilot EKF3 tracks 24 quantities simultaneously. Each state has an associated uncertainty, and the filter knows how all 24 uncertainties correlate with each other through the $24 \times 24$ covariance matrix $P$. This allows it to say "my position is drifting, therefore my velocity estimate is also suspect."</p>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">EKF3 State Vector — 24 States</div>
        <table class="w-full text-xs">
            <thead>
                <tr class="bg-slate-800/50 text-slate-400">
                    <th class="p-3 text-left">States</th>
                    <th class="p-3 text-left">What They Track</th>
                    <th class="p-3 text-left">Unit</th>
                    <th class="p-3 text-left">Key Notes</th>
                </tr>
            </thead>
            <tbody class="text-slate-300 font-mono">
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-sky-400">0–2</td>
                    <td class="p-3 text-white">Position (North, East, Down)</td>
                    <td class="p-3">m</td>
                    <td class="p-3 text-slate-400">NED frame relative to EKF origin (set at takeoff)</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-sky-400">3–5</td>
                    <td class="p-3 text-white">Velocity (North, East, Down)</td>
                    <td class="p-3">m/s</td>
                    <td class="p-3 text-slate-400">Fused from GPS Doppler + IMU integration</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-emerald-400">6–9</td>
                    <td class="p-3 text-white">Attitude Quaternion (q0, q1, q2, q3)</td>
                    <td class="p-3">—</td>
                    <td class="p-3 text-slate-400">4-component unit quaternion; avoids gimbal lock; renormalized each step</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-amber-400">10–12</td>
                    <td class="p-3 text-white">Accelerometer Bias (X, Y, Z)</td>
                    <td class="p-3">m/s²</td>
                    <td class="p-3 text-slate-400">EKF3 estimates all 3 axes (EKF2 had Z-only)</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-amber-400">13–15</td>
                    <td class="p-3 text-white">Gyroscope Bias (X, Y, Z)</td>
                    <td class="p-3">rad/s</td>
                    <td class="p-3 text-slate-400">Learned in-flight; corrects heading drift over time</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-violet-400">16–18</td>
                    <td class="p-3 text-white">Earth Magnetic Field (NED)</td>
                    <td class="p-3">Gauss</td>
                    <td class="p-3 text-slate-400">Adapts to local anomalies (rebar, geology, iron ore)</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-violet-400">19–21</td>
                    <td class="p-3 text-white">Body Magnetic Field (X, Y, Z)</td>
                    <td class="p-3">Gauss</td>
                    <td class="p-3 text-slate-400">Motor/ESC hard-iron interference learned in-flight</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-rose-400">22–23</td>
                    <td class="p-3 text-white">Wind Velocity (North, East)</td>
                    <td class="p-3">m/s</td>
                    <td class="p-3 text-slate-400">Critical for fixed-wing; helps copter airspeed estimation</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- ===== 9.5 Predict-Update Cycle ===== -->
    <h3>9.5 The EKF Predict-Update Cycle in Practice</h3>
    <p>The EKF alternates between <strong>Predict</strong> (runs at 400 Hz using IMU) and <strong>Update</strong> (runs whenever any sensor delivers a measurement). This is what enables fusing sensors running at completely different rates.</p>

    <h4>Delayed Time Horizon Architecture</h4>
    <p>GPS measurements arrive ~100 ms late. Barometer: ~50 ms. Applying a late measurement to the current state is a timing mismatch that corrupts the estimate. ArduPilot EKF3 and PX4 EKF2 both solve this with a <strong>ring buffer of past states</strong> (~450 ms deep in EKF3). When a delayed GPS measurement arrives, the EKF:</p>
    <ol class="text-slate-300 text-sm space-y-1 list-decimal pl-6 mt-2 mb-4">
        <li>Retrieves the buffered state at the GPS timestamp</li>
        <li>Runs the EKF update against that past state</li>
        <li>Propagates the correction forward to present using buffered IMU data</li>
    </ol>

    <figure class="my-6">
        <img src="images/m9_kalman_model.svg" alt="Kalman filter state-space model showing state vector, transition matrices, and noise covariances" class="rounded-lg w-full bg-white p-2">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Kalman filter state-space model: state vector circles, matrix squares, and Gaussian noise injections. Source: <a href="https://commons.wikimedia.org/wiki/File:Kalman_filter_model.svg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons, GPL</a></figcaption>
    </figure>

    <!-- ===== 9.6 Python Code ===== -->
    <h3>9.6 EKF Implementation: Python Pseudocode</h3>
    <p>Below is a minimal but complete EKF implementation demonstrating altitude estimation by fusing a barometer and accelerometer — the same problem solved by ArduPilot's inner loop.</p>

<pre><code class="language-python">import numpy as np

# ---------------------------------------------------------------
# Minimal EKF: fuses barometer (z) and accelerometer (a_z)
# State: x = [altitude, vertical_velocity, accel_bias]  (3 x 1)
# ---------------------------------------------------------------

dt = 0.01          # 100 Hz IMU loop

# State transition matrix F (linear, so Jacobian = F itself)
F = np.array([[1, dt, -0.5*dt**2],
              [0,  1,        -dt],
              [0,  0,          1]])

# Control input matrix B (maps acceleration input to state)
B = np.array([[0.5*dt**2],
              [dt],
              [0]])

# Measurement matrix H: barometer observes altitude only
H = np.array([[1, 0, 0]])

# Process noise covariance Q  --- TUNE THIS
# Higher Q_accel -> filter trusts sensor over model prediction
Q = np.diag([0.01**2, 0.1**2, 0.001**2])

# Measurement noise covariance R  --- TUNE THIS
# Higher R -> filter trusts model over sensor
R = np.array([[0.5**2]])   # barometer std ~0.5 m

# Initial state and covariance
x = np.zeros((3, 1))       # [alt, vel, accel_bias]
P = np.eye(3) * 10.0       # high initial uncertainty


def ekf_predict(x, P, a_measured):
    """Predict step: propagate state with IMU input."""
    u = np.array([[a_measured]])
    x_pred = F @ x + B @ u                  # state extrapolation
    P_pred = F @ P @ F.T + Q                # covariance extrapolation
    return x_pred, P_pred


def ekf_update(x_pred, P_pred, z_baro):
    """Update step: correct with barometer measurement."""
    # Innovation (measurement residual)
    y = z_baro - H @ x_pred                 # scalar for 1-D measurement

    # Innovation covariance
    S = H @ P_pred @ H.T + R               # S is 1x1 here

    # Kalman gain
    K = P_pred @ H.T @ np.linalg.inv(S)   # 3x1

    # State update
    x_upd = x_pred + K @ y

    # Covariance update -- Joseph form for numerical stability
    I_KH = np.eye(3) - K @ H
    P_upd = I_KH @ P_pred @ I_KH.T + K @ R @ K.T

    return x_upd, P_upd


# ----------- Main loop -----------------------------------------
# altitude_est, velocity_est = [], []
# for a_imu, baro_alt in zip(imu_data, baro_data):
#     x, P = ekf_predict(x, P, a_imu)
#     x, P = ekf_update(x, P, baro_alt)
#     altitude_est.append(x[0, 0])
#     velocity_est.append(x[1, 0])</code></pre>

    <div class="insight-box my-6">
        <div class="insight-label">Tuning Q and R — The Core Skill</div>
        <p class="text-slate-200 text-sm mt-1"><strong>Process noise Q</strong> describes how much your model is wrong each step (IMU errors, unmodeled dynamics). If the drone response is sluggish or the filter lags, increase Q. <strong>Measurement noise R</strong> describes sensor noise (read from datasheet, or characterize empirically by logging sensor data in a static hover). If the filter output is jumpy/noisy, increase R. The ratio R/Q is what matters — not the absolute values.</p>
    </div>

    <!-- ===== 9.7 ArduPilot vs PX4 ===== -->
    <h3>9.7 ArduPilot EKF3 vs PX4 EKF2: Architecture Comparison</h3>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Feature</th>
                    <th class="p-3 text-sky-400">ArduPilot EKF3</th>
                    <th class="p-3 text-amber-400">PX4 EKF2</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Filter variant</td>
                    <td class="p-3 text-slate-300">EKF with quaternion attitude, 24-state</td>
                    <td class="p-3 text-slate-300">Error-state EKF with rotation in tangent space, 24-state</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">Multi-instance / redundancy</td>
                    <td class="p-3 text-slate-300">One EKF instance per IMU (up to 3); health-based switching with hysteresis</td>
                    <td class="p-3 text-slate-300">Multi-instance via EKF2_MULTI_IMU / EKF2_MULTI_MAG; per-sensor affinity</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Delayed measurement fusion</td>
                    <td class="p-3 text-slate-300">Ring buffer ~450 ms; retrieves past state, applies update, re-propagates</td>
                    <td class="p-3 text-slate-300">Same approach — EKF2_*_DELAY params per sensor; FIFO buffers</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">3-axis accel bias</td>
                    <td class="p-3 text-emerald-400">Yes (states 10-12) — critical for tailsitters</td>
                    <td class="p-3 text-emerald-400">Yes</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Gyro scale factor</td>
                    <td class="p-3 text-rose-400">Removed in EKF3 (was in EKF2)</td>
                    <td class="p-3 text-amber-400">Not estimated (uses factory calibration)</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">Optical flow fusion</td>
                    <td class="p-3 text-emerald-400">EK3_SRC1_VELXY=5 (OF only), source switching via RC or MAVLink</td>
                    <td class="p-3 text-emerald-400">EKF2_OF_CTRL; native support in px4flow</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">External vision / VIO</td>
                    <td class="p-3 text-emerald-400">ExternalNav source (EK3_SRC1_POSXY=6); accepts VISION_POSITION_ESTIMATE</td>
                    <td class="p-3 text-emerald-400">EKF2_EV_CTRL; accepts ODOMETRY MAVLink msg with full covariance</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">Compass-free yaw</td>
                    <td class="p-3 text-emerald-400">Gaussian Sum Filter (GSF) — GPS velocity-based yaw when moving</td>
                    <td class="p-3 text-emerald-400">EKF2_GPS_CTRL bit 3 — dual-antenna GPS yaw; also mag-less via GNSS heading</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Wheel encoder support</td>
                    <td class="p-3 text-emerald-400">Yes (EKF3)</td>
                    <td class="p-3 text-rose-400">Not supported natively</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">Covariance update form</td>
                    <td class="p-3 text-slate-300">Standard $(I - KH)P$</td>
                    <td class="p-3 text-slate-300">Joseph stabilized form for better numerical conditioning</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Parameter namespace</td>
                    <td class="p-3 text-slate-300">EK3_* (100+ parameters)</td>
                    <td class="p-3 text-slate-300">EKF2_* (80+ parameters)</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- ===== 9.8 Filter Progression ===== -->
    <h3>9.8 ArduPilot Filter Evolution: DCM → EKF2 → EKF3</h3>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Filter Architecture Progression</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-rose-500">
                <strong class="text-rose-400 uppercase tracking-widest block mb-2">DCM — Direction Cosine Matrix</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Attitude only — no position estimation</li>
                    <li>Complementary filter: gyro (high-freq) + accel/mag (low-freq)</li>
                    <li>No covariance tracking — cannot quantify uncertainty</li>
                    <li>Cannot fuse GPS position or velocity</li>
                    <li>Cannot detect sensor failures probabilistically</li>
                    <li>Still runs as fallback in ArduPlane when EKF3 loses GPS</li>
                    <li>Computationally cheap — ran on 8-bit AVR MCU</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase tracking-widest block mb-2">EKF2 — 24-State EKF</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Full 24-state extended Kalman filter</li>
                    <li>Position + velocity + attitude + IMU biases</li>
                    <li>Gyro bias AND gyro scale factor estimation</li>
                    <li>Accelerometer Z-axis bias only (not 3-axis)</li>
                    <li>Delayed time horizon fusion for async sensors</li>
                    <li>Does NOT support: beacons, wheel encoders, VIO</li>
                    <li>Poor performance at extreme pitch (±90°)</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase tracking-widest block mb-2">EKF3 — Current Default</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Same 24-state structure as EKF2</li>
                    <li>3-axis accelerometer bias — critical for tailsitters</li>
                    <li>Gyro scale factor removed (relies on factory cal)</li>
                    <li>New sources: beacons, wheel encoders, VIO (ExternalNav)</li>
                    <li>Improved source switching: GPS ↔ OF ↔ ExternalNav</li>
                    <li>Multi-velocity fusion (EK3_SRC_OPTIONS bit 1)</li>
                    <li>GSF compass-less yaw estimation</li>
                    <li>Required for GPS/non-GPS in-flight transitions</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- ===== 9.9 Sensor Fusion Details ===== -->
    <h3>9.9 Measurement Updates: Sensor Fusion Details</h3>

    <h4>GPS Outlier Rejection (Innovation Gating)</h4>
    <p>The EKF tests each GPS reading before fusing it. The test statistic is the <strong>normalized innovation squared (NIS)</strong>:</p>
    <div class="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-4 font-mono text-sm text-slate-200">
        <p>$\text{NIS} = \tilde{y}_k^T S_k^{-1} \tilde{y}_k$</p>
        <p class="text-slate-400 text-xs mt-2">This is chi-squared distributed with $m$ degrees of freedom ($m$ = measurement dimension). Gate threshold: $\text{NIS} &lt; \chi^2_{m, 0.997}$. ArduPilot expresses this as a sigma multiplier: EK3_POS_I_GATE default = 500 (nominally ~22σ in the linearized sense — very permissive to avoid spurious rejection).</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm text-center">
            <div class="text-2xl mb-2 text-sky-400 font-mono font-bold">1</div>
            <strong class="text-white block mb-1">Compute Innovation</strong>
            <p class="text-slate-400 text-xs">$\tilde{y} = z_\text{GPS} - h(\hat{x}_{k|k-1})$ — how far does GPS deviate from the filter's prediction?</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm text-center">
            <div class="text-2xl mb-2 text-sky-400 font-mono font-bold">2</div>
            <strong class="text-white block mb-1">Scale by Innovation Covariance</strong>
            <p class="text-slate-400 text-xs">$S_k = H P_{k|k-1} H^T + R$. A 5 m error is OK when position uncertainty is large; it is an outlier when uncertainty is small.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm text-center">
            <div class="text-2xl mb-2 text-sky-400 font-mono font-bold">3</div>
            <strong class="text-white block mb-1">Gate Decision</strong>
            <p class="text-slate-400 text-xs">NIS exceeds threshold? <span class="text-rose-400 font-bold">REJECT</span> — the measurement is likely multipath, spoof, or ionospheric. Otherwise: <span class="text-emerald-400 font-bold">FUSE</span>.</p>
        </div>
    </div>

    <h4>Barometer Altitude Update</h4>
    <p>Barometer is the primary altitude source because GPS vertical accuracy is typically 3× worse than horizontal. <code>EK3_ALT_M_NSE</code> (default 1.0 m) is the assumed barometer noise standard deviation. Increase it if your baro is noisy (e.g., helicopter downwash) or if a cover/foam is not installed.</p>

    <h4>Magnetometer Yaw Update</h4>
    <p>The EKF predicts the expected magnetometer reading from the current attitude quaternion plus the estimated Earth + body magnetic field states. The innovation $\tilde{y} = m_\text{measured} - m_\text{predicted}$ primarily corrects yaw. EKF3's 3-axis fusion avoids the pitch-angle singularity that afflicted single-axis heading updates in earlier filters.</p>

    <h4>Optical Flow Update (GPS-Denied Horizontal Velocity)</h4>
    <p>Optical flow sensors measure pixel displacement. The EKF converts this to body-frame translational velocity using the gyro reading and rangefinder altitude:</p>
    <div class="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-4 font-mono text-sm text-slate-200">
        <p>$v_\text{body} = \text{flow\_rate\_rad/s} \times h_\text{agl}$ &nbsp; (minus gyro rotational component)</p>
        <p class="text-slate-400 text-xs mt-2">Set <code>EK3_SRC1_VELXY=5</code> for optical flow as sole horizontal velocity source in GPS-denied operation. Requires a downward-pointing rangefinder for AGL height. Flow quality below EK3_FLOW_QUAL_MIN is discarded.</p>
    </div>

    <!-- ===== 9.10 GPS-Denied ===== -->
    <h3>9.10 GPS-Denied Navigation with EKF</h3>
    <p>GPS-denied operation is the defining challenge for military/DoD drones operating in contested environments, indoors, or under active GPS jamming. The EKF can maintain bounded position estimation through alternative sensors, but the approach depends on the threat scenario.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">GPS-Denied Sensor Stack Options</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase tracking-widest block mb-2">Optical Flow + Rangefinder</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Works indoors over flat terrain</li>
                    <li>Horizontal velocity bounded; no global position</li>
                    <li>Fails over featureless surfaces (water, snow)</li>
                    <li>Altitude from rangefinder (lidar preferred)</li>
                    <li>ArduCopter: GUIDED_NOGPS mode</li>
                    <li>EK3_SRC1_VELXY=5, EK3_SRC1_POSZ=2</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase tracking-widest block mb-2">Visual Inertial Odometry (VIO)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Stereo camera + IMU tight coupling</li>
                    <li>6-DoF position + attitude estimation</li>
                    <li>Algorithms: VINS-Mono, ORB-SLAM3, MSCKF, Kimera</li>
                    <li>Feed via VISION_POSITION_ESTIMATE (MAVLink #102)</li>
                    <li>EK3_SRC1_POSXY=6, VELXY=6 (ExternalNav)</li>
                    <li>Drift accumulates without loop closures (~0.1% traveled)</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase tracking-widest block mb-2">LiDAR SLAM (Outdoors)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>3D lidar + IMU tight-coupled SLAM</li>
                    <li>Algorithms: LOAM, LIO-SAM, FAST-LIO2</li>
                    <li>Works in degraded visual conditions (night, smoke)</li>
                    <li>Position bounded by map; drift ~1–3 cm/m traveled</li>
                    <li>Feed pose estimate to EKF via ExternalNav</li>
                    <li>Compute-intensive: requires Jetson or equivalent</li>
                </ul>
            </div>
        </div>
    </div>

    <h4>VIO Integration Protocol (ArduPilot)</h4>
    <ol class="text-slate-300 text-sm space-y-1 list-decimal pl-6 mt-2 mb-4">
        <li>Send <code>SET_GPS_GLOBAL_ORIGIN</code> (MSG #48) once at startup — defines the NED origin for VIO coordinates</li>
        <li>Continuously stream <code>VISION_POSITION_ESTIMATE</code> (MSG #102) at 15–30 Hz — contains x, y, z in NED meters and roll, pitch, yaw</li>
        <li>Set <code>EK3_SRC1_POSXY=6</code>, <code>EK3_SRC1_VELXY=6</code>, <code>EK3_SRC1_POSZ=6</code> (ExternalNav for all)</li>
        <li>EKF3 fuses VIO position with the same innovation gating as GPS — if VIO tracking fails (e.g., motion blur), the jump gets rejected</li>
        <li>Set <code>VISO_TYPE=1</code> (Intel T265) or <code>VISO_TYPE=2</code> (other VIO) to enable the companion-computer interface bridge</li>
    </ol>

    <p class="text-sm text-slate-300">For PX4, set <code>EKF2_EV_CTRL</code> bitmask (bit 0: horizontal position, bit 1: vertical, bit 2: velocity, bit 3: yaw) and send pose via <code>ODOMETRY</code> (MSG #331) which includes a full $6\times6$ covariance matrix — allowing the EKF to weight the VIO measurement by the VIO algorithm's own confidence.</p>

    <!-- ===== 9.11 Health / Failsafe ===== -->
    <h3>9.11 EKF Health Monitoring and Failsafe</h3>

    <h4>EKF Health Variances (EKF_STATUS_REPORT, 2 Hz)</h4>
    <p>Each field is a normalized scalar: <strong>0.0</strong> = perfect confidence, <strong>1.0+</strong> = degraded. These are the normalized innovation squared values divided by the gate threshold — a number above 1.0 means the sensor is being consistently rejected.</p>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <table class="w-full text-xs">
            <thead>
                <tr class="bg-slate-800 text-slate-400">
                    <th class="p-3 text-left">Field</th>
                    <th class="p-3 text-left">What It Measures</th>
                    <th class="p-3 text-left">High Value Diagnosis</th>
                </tr>
            </thead>
            <tbody class="text-slate-300 font-mono">
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-sky-300">velocity_variance</td>
                    <td class="p-3">Velocity estimation uncertainty</td>
                    <td class="p-3 text-amber-400">GPS velocity noisy; IMU biasing rapidly; check vibration</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-sky-300">pos_horiz_variance</td>
                    <td class="p-3">Horizontal position uncertainty</td>
                    <td class="p-3 text-amber-400">GPS multipath; position jumps; large HDOP</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-sky-300">pos_vert_variance</td>
                    <td class="p-3">Vertical position uncertainty</td>
                    <td class="p-3 text-amber-400">Barometer vent blocked; GPS altitude unreliable</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-sky-300">compass_variance</td>
                    <td class="p-3">Magnetometer innovation ratio</td>
                    <td class="p-3 text-rose-400">Motor/ESC interference; compass not calibrated; ferromagnetic payload</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-sky-300">terrain_alt_variance</td>
                    <td class="p-3">Terrain altitude uncertainty</td>
                    <td class="p-3 text-amber-400">Optical flow or rangefinder unreliable; tilted sensor</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-rose-900/20 border border-rose-700/50 p-4 rounded">
            <strong class="text-rose-400 block mb-2 text-sm">EKF Failsafe Triggers When:</strong>
            <ul class="text-slate-300 text-xs space-y-2">
                <li><strong class="text-white">Condition A:</strong> velocity_variance ≥ threshold AND (compass_variance ≥ threshold OR position_variance ≥ threshold)</li>
                <li><strong class="text-white">Condition B:</strong> velocity_variance ≥ 2× threshold (rapid IMU failure — immediate trigger)</li>
                <li>Evaluated at 10 Hz; requires 1 full second of sustained bad variance (10 consecutive failures)</li>
            </ul>
        </div>
        <div class="bg-slate-900 border border-slate-700 p-4 rounded text-xs font-mono">
            <strong class="text-amber-400 block mb-2">Key Failsafe Parameters</strong>
            <div class="space-y-1 text-slate-300">
                <div><span class="text-slate-400">FS_EKF_THRESH:</span> 0.8 default (0.0=disabled, 1.0=permissive)</div>
                <div><span class="text-slate-400">FS_EKF_ACTION:</span> 1=Land, 2=AltHold, 3=Land from any mode</div>
            </div>
            <strong class="text-sky-400 block mt-3 mb-1">Dataflash Log Fields for Post-Flight Analysis:</strong>
            <div class="space-y-1 text-slate-300">
                <div><span class="text-emerald-400">NKF4.SP</span> = position variance</div>
                <div><span class="text-emerald-400">NKF4.SV</span> = velocity variance</div>
                <div><span class="text-emerald-400">NKF4.SM</span> = magnetic field variance</div>
                <div class="text-slate-400 mt-1">Any field &gt;1.0 = that sensor being rejected</div>
            </div>
        </div>
    </div>

    <!-- ===== 9.12 Multi-EKF ===== -->
    <h3>9.12 Multi-EKF Architecture: Redundancy and Fault Tolerance</h3>
    <p>ArduPilot runs one EKF instance per IMU. With a triple-redundant platform (Cube Orange+), three EKF3 instances run in parallel. Instance switching uses a health score (sum of normalized variances). Hysteresis prevents rapid oscillation between instances. DCM runs in the background as a final fallback for attitude-only estimation if all EKF instances fail.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Multi-EKF Instance Architecture (Cube Orange+)</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border border-sky-700">
                <strong class="text-sky-400 block mb-2">EKF3 Instance 0 (ICM-20689) — Active</strong>
                <p class="text-slate-400">Primary instance. Output drives the aircraft. Health checked at 10 Hz. Switches away if variance exceeds FS_EKF_THRESH on sustained basis.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-600">
                <strong class="text-slate-400 block mb-2">EKF3 Instance 1 (ICM-20602) — Shadow</strong>
                <p class="text-slate-400">Runs concurrently but output is discarded unless Instance 0 degrades. GPS data shared across all instances; each has independent IMU data.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-600">
                <strong class="text-slate-400 block mb-2">EKF3 Instance 2 (ICM-42688-P) — Fallback</strong>
                <p class="text-slate-400">Activated only if both Instance 0 and 1 have degraded health. DCM is the final backstop for attitude-only if all EKF instances fail.</p>
            </div>
        </div>
    </div>

    <h4>EKF Source Switching (GPS ↔ Optical Flow ↔ VIO)</h4>
    <p>EKF3 supports three independent source sets (SRC1, SRC2, SRC3) configured via <code>EK3_SRC1_*</code> through <code>EK3_SRC3_*</code> parameters. A hardware RC switch (<code>RCx_OPTION=90</code>) or MAVLink command (<code>EK3_SRC_OPTIONS</code>) selects the active set. The transition is seamless — EKF3 momentarily fuses both sources simultaneously during handover so the position state never jumps during an indoor-to-outdoor transition.</p>

    <!-- ===== 9.13 Parameter Tuning ===== -->
    <h3>9.13 Practical Parameter Tuning Guide</h3>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">EKF3 / EKF2 Quick Reference: Key Parameters</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-2">Process Noise (Q) Parameters</strong>
                <p class="text-slate-400 text-xs mb-2">Increase if the filter is slow to respond to real motion. Decrease if estimates are noisy during hover.</p>
                <ul class="text-slate-400 space-y-1 font-mono">
                    <li><span class="text-white">EK3_GYRO_P_NSE</span>  0.015 rad/s — gyro angle random walk</li>
                    <li><span class="text-white">EK3_ACC_P_NSE</span>   0.35 m/s² — accel velocity random walk</li>
                    <li><span class="text-white">EK3_GBIAS_P_NSE</span> 0.001 rad/s — gyro bias instability</li>
                    <li><span class="text-white">EK3_ABIAS_P_NSE</span> 0.005 m/s² — accel bias instability</li>
                    <li><span class="text-white">EK3_WIND_P_NSE</span>  0.1 m/s — wind variance (increase in gusty conditions)</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-2">Measurement Noise (R) Parameters</strong>
                <p class="text-slate-400 text-xs mb-2">Set from sensor datasheets or static-hover log characterization. Match real noise — don't just inflate to "be safe."</p>
                <ul class="text-slate-400 space-y-1 font-mono">
                    <li><span class="text-white">EK3_ALT_M_NSE</span>  1.0 m — barometer noise std dev</li>
                    <li><span class="text-white">EK3_GPS_V_NSE</span>  0.3 m/s — GPS velocity noise</li>
                    <li><span class="text-white">EK3_GPS_P_NSE</span>  0.3 m — GPS position noise</li>
                    <li><span class="text-white">EK3_MAG_M_NSE</span>  0.05 Gauss — magnetometer noise</li>
                    <li><span class="text-white">EK3_YAW_M_NSE</span>  0.5 rad — yaw measurement noise</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-2">Innovation Gating Parameters</strong>
                <p class="text-slate-400 text-xs mb-2">Default values are deliberately large (permissive). Tighten them only if you have confirmed good GPS quality and want to reject spoofing jumps sooner.</p>
                <ul class="text-slate-400 space-y-1 font-mono">
                    <li><span class="text-white">EK3_VEL_I_GATE</span>  500 σ — velocity innovation gate</li>
                    <li><span class="text-white">EK3_POS_I_GATE</span>  500 σ — position innovation gate</li>
                    <li><span class="text-white">EK3_HGT_I_GATE</span>  500 σ — height innovation gate</li>
                    <li><span class="text-white">EK3_MAG_I_GATE</span>  300 σ — magnetometer gate</li>
                    <li><span class="text-white">EK3_OF_I_GATE</span>   300 σ — optical flow gate</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-violet-400 block mb-2">Tuning Workflow</strong>
                <ol class="text-slate-400 space-y-1 list-decimal pl-4">
                    <li>Static hover log: measure raw sensor noise → set R params to match 1σ</li>
                    <li>Fly aggressive maneuvers: check NKF4 log fields — all should stay below 0.5</li>
                    <li>If attitude is slow to respond to fast maneuvers: increase GYRO_P_NSE / ACC_P_NSE</li>
                    <li>If hover is noisy: decrease GPS_P_NSE or increase ALT_M_NSE</li>
                    <li>If compass_variance is consistently high: increase MAG_M_NSE or investigate interference</li>
                    <li>Check IMU vibration: FFT of IMUDT log; peaks above 80 Hz corrupt IMU-based predictions</li>
                </ol>
            </div>
        </div>
    </div>

    <!-- ===== 9.14 ML Approaches ===== -->
    <h3>9.14 Machine Learning Approaches to State Estimation (2024–2025)</h3>
    <p>Pure EKF approaches are being challenged by hybrid neural-Kalman architectures that adapt to non-Gaussian noise and unmodeled dynamics. The dominant approaches in 2024–2025 research:</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-slate-900 p-4 rounded border border-sky-800/50">
            <strong class="text-sky-400 block mb-2 text-sm">KalmanNet</strong>
            <p class="text-slate-400 text-xs">Replaces the closed-form Kalman gain computation with a Gated Recurrent Unit (GRU). Retains the KF predict-update structure but learns the optimal gain from data, handling non-Gaussian noise and model mismatch. Demonstrated 5–20 dB RMSE improvement over EKF in non-Gaussian scenarios.</p>
            <p class="text-slate-400 text-xs mt-2">Limitation: requires labeled training data; not yet in flight software.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-amber-800/50">
            <strong class="text-amber-400 block mb-2 text-sm">Deep Kalman Filter (DKF)</strong>
            <p class="text-slate-400 text-xs">Learns the process model $f(\cdot)$ and measurement model $h(\cdot)$ from data using neural network function approximators, while keeping the KF Bayesian update structure. Effective when the physics model is partially unknown (e.g., aerodynamic drag coefficients).</p>
            <p class="text-slate-400 text-xs mt-2">2025 PeerJ paper on advanced ESKF shows hybrid outperforms classical by 40% on RMSE for aggressive maneuvers.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-emerald-800/50">
            <strong class="text-emerald-400 block mb-2 text-sm">IMU Dead-Reckoning with Neural Odometry</strong>
            <p class="text-slate-400 text-xs">TLIO, RONIN, and IDOL replace the IMU kinematic integration entirely with an RNN that learns the pedestrian/drone motion model from raw IMU data. Achieves 0.5–2% distance drift without GPS on human locomotion patterns.</p>
            <p class="text-slate-400 text-xs mt-2">Key insight: neural models capture non-white IMU error distributions that Kalman models cannot.</p>
        </div>
    </div>

    <p class="text-sm text-slate-300 mb-6">For military/DoD applications in 2025–2026, the dominant pattern is <strong>hybrid EKF + ML</strong> rather than full replacement. The EKF provides interpretability, formal uncertainty bounds, and certifiability that pure neural networks cannot currently provide. ML is used to adaptively tune Q and R online, or to flag sensor degradation before the innovation gate would catch it.</p>

    <!-- ===== VIDEOS ===== -->
    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Video: Extended Kalman Filter — Theory, Derivation &amp; Sensor Fusion (Phil's Lab)</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/hQUkiC5o0JI" title="Extended Kalman Filter — Sensor Fusion Theory and Derivation, Phil's Lab" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-sm mt-2">Phil's Lab: EKF derivation from first principles with worked magnetometer/IMU sensor fusion example. Part of the Sensor Fusion series — highly recommended for embedded / flight-controller engineers.</p>
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Video: How Drones Estimate Altitude — EKF Explained From Scratch</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/uyiR3Qpt9-Y" title="How Drones Estimate Altitude — Extended Kalman Filter Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-sm mt-2">Builds an EKF from scratch to fuse barometer and accelerometer for altitude estimation — exactly the problem solved by ArduPilot's inner loop. Includes Python implementation and real sensor data.</p>
    </div>

    <!-- ===== 9.15 External Resources ===== -->
    <h3>9.15 External References and Further Reading</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2 text-sm">Official Documentation</strong>
            <ul class="space-y-2 text-xs text-slate-300">
                <li><a href="https://ardupilot.org/copter/docs/common-apm-navigation-extended-kalman-filter-overview.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">ArduPilot EKF Overview — official parameter docs</a></li>
                <li><a href="https://docs.px4.io/main/en/advanced_config/tuning_the_ecl_ekf" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">PX4 ECL EKF2 — Tuning Guide (main branch)</a></li>
                <li><a href="https://github.com/PX4/PX4-Autopilot/blob/main/docs/en/advanced_config/tuning_the_ecl_ekf.md" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">PX4 EKF2 Source Docs (GitHub)</a></li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2 text-sm">Foundational Papers</strong>
            <ul class="space-y-2 text-xs text-slate-300">
                <li><a href="https://www.cs.unc.edu/~welch/media/pdf/kalman_intro.pdf" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Welch &amp; Bishop (1995) — An Introduction to the Kalman Filter (UNC TR 95-041)</a></li>
                <li><a href="https://peerj.com/articles/cs-3118.pdf" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">PeerJ 2024 — An Advanced Error-State Kalman Filter (ESKF)</a></li>
                <li><a href="https://arxiv.org/abs/2509.13243" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">arXiv 2025 — EKF vs UKF vs PF for Quadrotor in Hurricane Wind Disturbances</a></li>
                <li><a href="https://arxiv.org/abs/2102.03804" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">arXiv 2021 — Kalman Filters on Differentiable Manifolds (ESKF theory)</a></li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2 text-sm">Implementations &amp; Tutorials</strong>
            <ul class="space-y-2 text-xs text-slate-300">
                <li><a href="https://automaticaddison.com/extended-kalman-filter-ekf-with-python-code-example/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Automatic Addison — EKF with Python Code Example</a></li>
                <li><a href="https://mohitd.github.io/ekf.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">mohitd — Extended Kalman Filtering for Robotic State Estimation</a></li>
                <li><a href="https://github.com/koledickarlo/ESKF-ESP32" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">GitHub: ESKF-ESP32 — Error-State KF on Arduino / ESP32</a></li>
                <li><a href="https://kalmanfilter.net/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">kalmanfilter.net — Kalman Filter Explained Through Examples</a></li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-violet-400 block mb-2 text-sm">ML / Hybrid State Estimation (2024–2025)</strong>
            <ul class="space-y-2 text-xs text-slate-300">
                <li><a href="https://arxiv.org/abs/2506.11639" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">arXiv 2025 — Recursive KalmanNet: DL-Augmented Kalman Filtering</a></li>
                <li><a href="https://www.nature.com/articles/s41598-025-26339-9" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Nature Sci. Reports 2025 — GAN + Nonlinear Kalman Filter for State Estimation</a></li>
                <li><a href="https://www.sciencedirect.com/science/article/pii/S1367578823000731" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">ScienceDirect — State of the Art: Kalman Filter Driven by Machine Learning</a></li>
            </ul>
        </div>
    </div>

</div>
`;
