export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 9</span>
    <h2>Sensor Fusion & Extended Kalman Filter Architecture</h2>
    <p>State estimation is the mathematical foundation of autonomous flight. Without knowing position, velocity, and attitude with bounded error, no control law can function correctly. This module covers the EKF architecture used in production ArduPilot systems — the mathematics, the implementation decisions, and the failure modes engineers must understand.</p>

    <h3>9.1 Why EKF: The IMU Integration Problem</h3>
    <p>Inertial Measurement Units (IMUs) measure acceleration and angular rate. To obtain position from acceleration, two integrations are required. Each integration accumulates error. This is not an implementation flaw — it is a consequence of the physics of differentiation and integration applied to noisy signals.</p>

    <div class="math-block">
        Dead Reckoning from IMU (Euler integration):<br><br>
        a(t) = a_true(t) + n_a(t)    [accelerometer noise, white Gaussian]<br><br>
        v(t) = v(0) + integral(a(t) dt, 0, t)<br>
        p(t) = p(0) + integral(v(t) dt, 0, t)<br><br>
        Error propagation for white noise n_a with standard deviation sigma_a:<br><br>
        sigma_v(t) = sigma_a * sqrt(t)          [velocity error grows as sqrt(t)]<br>
        sigma_p(t) = sigma_a * t^(3/2) / sqrt(3) [position error grows as t^(3/2)]<br><br>
        For practical IMUs (sigma_a ~ 0.01 m/s^2):<br>
        After t=10s:  sigma_v ~ 0.032 m/s,  sigma_p ~ 0.11 m<br>
        After t=60s:  sigma_v ~ 0.078 m/s,  sigma_p ~ 1.5 m<br>
        After t=300s: sigma_v ~ 0.17 m/s,   sigma_p ~ 18 m<br><br>
        MEMS IMU bias drift (sigma_bias ~ 0.1 mg) adds a systematic term:<br>
        sigma_p_bias(t) = (1/2) * sigma_bias * t^2  [position error grows as t^2]<br><br>
        After t=10s  with bias: additional ~0.05 m error<br>
        After t=60s  with bias: additional ~1.8 m error<br>
        After t=300s with bias: additional ~44 m error
    </div>

    <p>The t^2 bias drift term is the critical insight: a pure IMU integration is adequate for fractions of a second (that is why IMUs work well for attitude hold on short time scales), but is completely unusable for position navigation beyond ~10 seconds without an external absolute reference. The EKF fuses external absolute measurements (GPS, barometer, magnetometer) to correct and bound this drift.</p>

    <h3>9.2 ArduPilot Filter Evolution: DCM → EKF2 → EKF3</h3>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Filter Architecture Progression</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-rose-500">
                <strong class="text-rose-400 uppercase tracking-widest block mb-2">DCM — Direction Cosine Matrix</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Attitude only — no position estimation</li>
                    <li>Complementary filter in frequency domain: gyro (high-freq) + accel/mag (low-freq)</li>
                    <li>No formal covariance tracking — no uncertainty quantification</li>
                    <li>Cannot fuse GPS position or velocity</li>
                    <li>Cannot detect sensor failures probabilistically</li>
                    <li>Still runs in ArduPlane as DCM fallback when EKF3 loses GPS</li>
                    <li>Computationally cheap — runs on 8-bit AVR MCU</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase tracking-widest block mb-2">EKF2 — 24-State EKF</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Full 24-state extended Kalman filter</li>
                    <li>Position + velocity + attitude + biases</li>
                    <li>Gyro bias AND gyro scale factor estimation</li>
                    <li>Accelerometer Z-axis bias only (not 3-axis)</li>
                    <li>Delayed time horizon fusion for asynchronous sensors</li>
                    <li>Configurable via EK2_* parameters</li>
                    <li>Does NOT support: beacons, wheel encoders, visual odometry</li>
                    <li>Poor performance at extreme pitch angles (±90°)</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase tracking-widest block mb-2">EKF3 — Current Default</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Same 24-state structure as EKF2</li>
                    <li>3-axis accelerometer bias (not just Z) — critical for tailsitters</li>
                    <li>No gyro scale factor (removed vs EKF2)</li>
                    <li>New sensor sources: Beacons, Wheel Encoders, Visual Odometry (VIO)</li>
                    <li>Improved EKF source switching (GPS ↔ optical flow ↔ ExternalNav)</li>
                    <li>Multi-source velocity fusion (EK3_SRC_OPTIONS bit 1)</li>
                    <li>Required for GPS/non-GPS transitions (GUIDED_NOGPS, optical flow)</li>
                    <li>GSF (Gaussian Sum Filter) for compass-less yaw estimation</li>
                </ul>
            </div>
        </div>
    </div>

    <h3>9.3 The EKF3 State Vector: All 24 States Explained</h3>
    <p>The EKF state vector x ∈ R^24 represents the complete navigational state of the vehicle. The 24×24 covariance matrix P tracks uncertainty and cross-correlations between all state pairs.</p>

    <div class="math-block">
        EKF3 State Vector x = [ p_N, p_E, p_D,          ] // States 0-2:  Position NED (North, East, Down) [m]
                               [ v_N, v_E, v_D,          ] // States 3-5:  Velocity NED [m/s]
                               [ q_0, q_1, q_2, q_3,     ] // States 6-9:  Attitude quaternion (unit quaternion)
                               [ b_ax, b_ay, b_az,        ] // States 10-12: Accelerometer bias XYZ [m/s^2]
                               [ b_gx, b_gy, b_gz,        ] // States 13-15: Gyroscope bias XYZ [rad/s]
                               [ M_Nx, M_Ny, M_Nz,        ] // States 16-18: Earth magnetic field (NED frame) [Gauss]
                               [ M_bx, M_by, M_bz,        ] // States 19-21: Body magnetic field (body frame) [Gauss]
                               [ w_N, w_E              ]   // States 22-23: Wind velocity NE [m/s]
                                                           // Total: 24 states

        Covariance matrix P ∈ R^(24×24):
        P[i][j] = E[(x_i - x_hat_i)(x_j - x_hat_j)]  // Symmetric positive semi-definite
        Diagonal elements P[i][i] = variance of state i
        Off-diagonal elements = cross-correlation (e.g. accel bias error correlates with velocity error)
    </div>

    <h4>State Vector Engineering Notes</h4>
    <ul class="text-slate-300 text-sm space-y-2">
        <li><strong>Quaternion attitude (states 6–9):</strong> EKF3 uses a quaternion (4 components, unit norm constraint q_0^2+q_1^2+q_2^2+q_3^2=1) rather than Euler angles to avoid gimbal lock. During the correction step, EKF3 estimates an error rotation vector (3-component) and applies it as a multiplicative correction to the quaternion — avoiding linearization errors for large angle maneuvers.</li>
        <li><strong>Earth magnetic field (states 16–18):</strong> Estimating the Earth field vector in the EKF rather than using a fixed hard-coded value handles local magnetic anomalies (rebar in concrete, geological deposits) without requiring re-calibration at each site.</li>
        <li><strong>Body magnetic field (states 19–21):</strong> Estimates the permanent magnetic field from the drone's own motors and electronics (soft/hard iron effect). This is the field that contaminates the magnetometer reading. The EKF learns this in-flight by observing the heading change as the vehicle rotates.</li>
        <li><strong>Wind velocity (states 22–23):</strong> Critical for fixed-wing aircraft navigation — a 20 m/s headwind dramatically affects groundspeed vs airspeed. For copters, wind estimation enables better disturbance rejection in position hold.</li>
        <li><strong>3-axis vs Z-only accel bias (EKF3 vs EKF2):</strong> EKF2 only estimated the Z-axis accelerometer bias under the assumption that the vehicle spends most time near-horizontal. EKF3 estimating all three axes is required for tailsitters that operate at ±90° pitch continuously.</li>
    </ul>

    <h3>9.4 The EKF Predict-Update Cycle</h3>
    <p>The EKF operates as a two-phase cycle. The prediction step runs continuously at the IMU rate. The update step runs asynchronously, triggered by each sensor at its own rate.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Predict-Update Architecture</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
                <strong class="text-sky-400 block mb-3">Prediction Step (IMU Rate — 400Hz in ArduPilot)</strong>
                <div class="math-block text-xs">
x_hat(k|k-1) = f(x_hat(k-1|k-1), u_k)<br><br>
Where f() is the nonlinear state transition function:<br>
  - Integrate quaternion with gyro measurement (corrected by bias estimate)<br>
  - Rotate accelerometer measurement from body to NED frame using quaternion<br>
  - Subtract gravity vector (0, 0, 9.81) m/s^2<br>
  - Integrate corrected acceleration to update velocity<br>
  - Integrate velocity to update position<br><br>
Covariance prediction:<br>
P(k|k-1) = F * P(k-1|k-1) * F^T + Q<br><br>
F = Jacobian of f() w.r.t. state vector (24×24 matrix)<br>
Q = Process noise covariance (diagonal, tuned empirically)<br>
dt = 1/400 = 2.5ms per prediction step
                </div>
            </div>
            <div>
                <strong class="text-emerald-400 block mb-3">Update Step (Asynchronous — per sensor rate)</strong>
                <div class="math-block text-xs">
When sensor measurement z arrives:<br><br>
Innovation:  y = z - h(x_hat(k|k-1))<br>
h() = nonlinear observation model for that sensor<br><br>
Innovation covariance:<br>
S = H * P(k|k-1) * H^T + R<br>
H = Jacobian of h() w.r.t. state vector<br>
R = Measurement noise covariance<br><br>
Kalman gain:<br>
K = P(k|k-1) * H^T * S^(-1)<br><br>
State update:<br>
x_hat(k|k) = x_hat(k|k-1) + K * y<br><br>
Covariance update (Joseph form for numerical stability):<br>
P(k|k) = (I - K*H) * P(k|k-1) * (I - K*H)^T + K*R*K^T
                </div>
            </div>
        </div>
    </div>

    <h4>Delayed Time Horizon Architecture</h4>
    <p>GPS measurements arrive with a latency of ~100ms (GPS processing delay). Barometer measurements arrive with ~50ms latency. If the EKF applied these measurements to the current state, it would be fusing stale data with current predictions — causing incorrect innovations.</p>
    <p>ArduPilot EKF3 maintains a <strong>ring buffer of past states</strong> spanning the maximum measurement delay (~450ms). When a GPS measurement arrives, the EKF:</p>
    <ol class="text-slate-300 text-sm space-y-1 list-decimal pl-6">
        <li>Retrieves the state and covariance from the ring buffer at the timestamp when the GPS measurement was taken</li>
        <li>Performs the EKF update using that past state</li>
        <li>Propagates the correction forward to present time using the buffered IMU data (this is the "complementary filter" step in the delayed horizon architecture)</li>
        <li>The output is a present-time corrected state estimate</li>
    </ol>
    <p>This is why the EKF can correctly fuse sensors with wildly different latencies (GPS at 100ms, barometer at 50ms, optical flow at 20ms, IMU at 2.5ms) without introducing timing artifacts.</p>

    <h3>9.5 Measurement Updates: Sensor Fusion Details</h3>

    <h4>GPS Position and Velocity Update</h4>
    <p>GPS provides 3D position (lat/lon/alt converted to NED meters from the EKF origin) and 3D velocity. Both are fused in separate update steps. The observation model is linear for position (direct measurement of states 0–2) and velocity (states 3–5). The key non-trivial element is <strong>innovation gating</strong>:</p>

    <div class="math-block">
        Mahalanobis Distance test for GPS outlier rejection:<br><br>
        chi2_test = y^T * S^(-1) * y<br><br>
        y = GPS_position - predicted_position  (innovation vector, 3×1)<br>
        S = innovation covariance (3×3)<br><br>
        The test compares chi2_test against a chi-squared threshold:<br>
        chi2_threshold = chi2_cdf_inverse(gate_probability, dof=3)<br><br>
        For EK3_POS_I_GATE (default ~5.0 standard deviations):<br>
        Gate = 5.0 sigma → chi2_threshold = 5^2 = 25 (single axis)<br><br>
        If chi2_test > chi2_threshold: GPS measurement is REJECTED (classified as outlier)<br>
        If chi2_test <= chi2_threshold: GPS measurement is ACCEPTED and fused<br><br>
        This rejects: multipath reflections, GPS spoofing (shifts position suddenly),<br>
        momentary satellite geometry degradation (PDOP spike), ionospheric errors.
    </div>

    <h4>Barometer Altitude Update</h4>
    <p>Barometer measures atmospheric pressure. The EKF converts pressure to altitude using the barometric formula (ISA standard atmosphere). Observation model: h(x) = -p_D (negative because NED Down is positive downward). The barometer is the primary altitude source in GPS modes — GPS altitude is noisy (typically 3× worse vertical than horizontal accuracy). The barometer noise parameter EK3_ALT_M_NSE (default 1.0m) controls how much the EKF trusts baro vs IMU prediction.</p>

    <h4>Magnetometer Yaw Update</h4>
    <p>The magnetometer measures the local magnetic field vector in the body frame. The observation model predicts what the magnetometer should read given the current quaternion attitude and the estimated Earth field vector (states 16–18) plus body magnetic field (states 19–21). The innovation is the difference between measured and predicted field. This update primarily corrects yaw (heading), but also updates the magnetic field state estimates. The 3-axis fusion avoids the singularities of a scalar heading update near ±90° pitch.</p>

    <h4>Optical Flow Update (GPS-Denied Navigation)</h4>
    <p>Optical flow sensors measure angular pixel displacement between frames, which the EKF converts to translational velocity using the relationship: v_body = omega × r + v_platform, where omega is the gyro measurement and r is the range to the surface (from a downward rangefinder). The flow measurement is gated using EK3_OF_GATE. In GUIDED_NOGPS mode (ArduCopter), optical flow is the sole horizontal position reference — GPS states are not used, and the EKF relies entirely on flow + rangefinder for horizontal velocity bounding.</p>

    <h4>Visual Inertial Odometry (VIO) Integration via MAVLink</h4>
    <p>Companion computers running VIO (e.g., Intel RealSense T265, ORB-SLAM3, VINS-Mono) feed position estimates to ArduPilot via MAVLink. The integration protocol:</p>
    <ol class="text-slate-300 text-sm space-y-1 list-decimal pl-6 mt-2">
        <li>Send <code>SET_GPS_GLOBAL_ORIGIN</code> (MSG #48) once at startup — defines the NED origin for VIO coordinates</li>
        <li>Continuously send <code>VISION_POSITION_ESTIMATE</code> (MSG #102) at 15–30Hz — contains x, y, z in NED meters and roll, pitch, yaw from VIO</li>
        <li>Set <code>EK3_SRC1_POSXY=6</code> (ExternalNav) and <code>EK3_SRC1_VELXY=6</code> to use VIO as horizontal position/velocity source</li>
        <li>EKF3 fuses the VIO position estimate using the same innovation gating as GPS — if VIO jumps (tracking failure), it gets rejected</li>
    </ol>

    <h3>9.6 EKF Health Monitoring and Failsafe</h3>
    <p>ArduPilot continuously evaluates EKF health and can trigger failsafe actions when confidence in the state estimate falls below acceptable thresholds.</p>

    <h4>EKF_STATUS_REPORT MAVLink Message (MSG #193)</h4>
    <p>This message is published at 2Hz and contains the current EKF variance summary. Each variance field is a normalized scalar from 0.0 (perfect confidence) to 1.0+ (low confidence / possible failure):</p>

    <div class="math-block">
        EKF_STATUS_REPORT fields:<br><br>
        velocity_variance   — normalized velocity estimation uncertainty<br>
                              Sources: GPS velocity innovation, IMU bias drift rate<br><br>
        pos_horiz_variance  — normalized horizontal position uncertainty<br>
                              Sources: GPS position innovation, dead-reckoning accumulated error<br><br>
        pos_vert_variance   — normalized vertical position uncertainty<br>
                              Sources: barometer innovation, GPS altitude innovation<br><br>
        compass_variance    — normalized magnetometer innovation ratio<br>
                              High value indicates: magnetic interference, compass miscalibration,<br>
                              hard/soft iron disturbance from motors at high throttle<br><br>
        terrain_alt_variance — normalized terrain altitude estimate uncertainty (optical flow / rangefinder)<br><br>
        flags               — bitmask: attitude_ok | horiz_vel_ok | vert_vel_ok |<br>
                              horiz_pos_rel_ok | horiz_pos_abs_ok | vert_pos_ok |<br>
                              terrain_alt_ok | const_pos_mode | pred_horiz_pos_ok
    </div>

    <h4>Failsafe Trigger Logic</h4>
    <p>The ArduCopter EKF failsafe is evaluated at 10Hz. The threshold is controlled by <code>FS_EKF_THRESH</code> (default 0.8). The failsafe triggers if the bad-variance counter reaches <code>EKF_CHECK_ITERATIONS_MAX = 10</code> (1 second of sustained bad variance), given:</p>

    <div class="math-block">
        Failsafe condition (true if any of):<br><br>
        Case 1: velocity_variance >= FS_EKF_THRESH<br>
                AND (compass_variance >= FS_EKF_THRESH<br>
                     OR pos_horiz_variance >= FS_EKF_THRESH)<br><br>
        Case 2: velocity_variance >= 2.0 * FS_EKF_THRESH<br>
                (velocity alone, twice the normal threshold — catch rapid IMU failure)<br><br>
        FS_EKF_THRESH parameter values:<br>
          0.0 = disabled<br>
          0.6 = sensitive (may false-trigger during aggressive flight)<br>
          0.8 = default (recommended)<br>
          1.0 = permissive (reduces false triggers, allows more drift)<br><br>
        FS_EKF_ACTION when triggered:<br>
          1 = Land (default)<br>
          2 = AltHold (hover, maintain altitude only)<br>
          3 = Land even from Stabilize mode
    </div>

    <p>Log analysis: dataflash log fields <code>NKF4.SP</code> (position innovation test ratio), <code>NKF4.SV</code> (velocity innovation test ratio), <code>NKF4.SM</code> (magnetic innovation test ratio). Any of these sustained above 1.0 indicates the EKF is rejecting that sensor — the cause must be identified before autonomous flight.</p>

    <h3>9.7 Multi-EKF Architecture: Redundancy and Fault Tolerance</h3>
    <p>ArduPilot can run multiple simultaneous EKF instances, one per IMU. With a triple-redundant IMU platform (e.g., Cube Orange+), three EKF3 instances run simultaneously, each using a different physical IMU but sharing the same GPS, barometer, and magnetometer data.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Multi-EKF Instance Architecture</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border border-sky-700">
                <strong class="text-sky-400 block mb-2">EKF3 Instance 0 (IMU0)</strong>
                <p class="text-slate-400">Primary instance. Uses ICM-20689 (primary IMU). If no IMU fault, this is the active output. Reports velocity_variance, pos_horiz_variance continuously.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-600">
                <strong class="text-slate-400 block mb-2">EKF3 Instance 1 (IMU1)</strong>
                <p class="text-slate-400">Shadow instance. Uses ICM-20602 (secondary IMU). Running concurrently but output is discarded unless Instance 0 degrades. Health checked at 10Hz.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-600">
                <strong class="text-slate-400 block mb-2">EKF3 Instance 2 (IMU2)</strong>
                <p class="text-slate-400">Tertiary instance. Uses ICM-42688-P. Second fallback. Activated if both Instance 0 and 1 have degraded health metrics.</p>
            </div>
        </div>
        <p class="text-slate-400 text-xs mt-4">Instance switching is determined by a health scoring function that sums the normalized variances across velocity, position, and magnetic fields. The instance with the lowest total variance score becomes active. Switching is hysteresis-filtered to prevent oscillation between instances. DCM runs in the background as a final fallback for attitude-only estimation if all EKF instances fail.</p>
    </div>

    <h4>EKF Source Switching (GPS ↔ Optical Flow ↔ VIO)</h4>
    <p>EKF3 supports three independent source parameter sets (SRC1, SRC2, SRC3). A hardware RC switch (AUX function 90: EKF Source Set) or MAVLink command <code>MAV_CMD_SET_EKF_SOURCE_SET</code> selects the active set. This enables in-flight transitions between GPS navigation (outdoors) and optical flow / VIO (indoors) without rebooting. The transition maintains EKF continuity — the position state does not jump — because the EKF momentarily fuses both sources simultaneously during the handover period (<code>EK3_SRC_OPTIONS</code> bit 1).</p>

    <h3>9.8 Complementary Filter vs EKF: Frequency Domain Argument</h3>
    <p>The complementary filter is the predecessor to EKF-based attitude estimation. Understanding its limitations precisely explains why EKF is necessary for GPS-denied navigation.</p>

    <h4>Complementary Filter Architecture (DCM)</h4>
    <p>The complementary filter exploits the frequency-domain complementarity of gyroscope and accelerometer measurements:</p>
    <ul class="text-slate-300 text-sm space-y-2">
        <li><strong>Gyroscope:</strong> Excellent at high-frequency angular rate measurement. Very accurate over short time scales (milliseconds to seconds). But has DC bias drift — over minutes, the integrated angle diverges by degrees. Transfer function: H_gyro(s) = s/(s+ω_c) — high-pass filter.</li>
        <li><strong>Accelerometer:</strong> Excellent at measuring gravity vector (DC component = attitude reference). But noisy at high frequency (vibration, acceleration from motion contaminates the measurement). Cannot distinguish gravity from linear acceleration. Transfer function: H_accel(s) = ω_c/(s+ω_c) — low-pass filter.</li>
    </ul>
    <p>The complementary filter combines: attitude = H_gyro(gyro_integral) + H_accel(gravity_reference). The crossover frequency ω_c (typically 0.05–0.1 rad/s, or ~8–16 second time constant) determines the blend point. This works well for attitude estimation on stable platforms.</p>

    <h4>Why Complementary Filter Fails for GPS-Denied Navigation</h4>
    <p>The complementary filter cannot solve position estimation for three fundamental reasons:</p>

    <div class="math-block">
        Limitation 1 — No Position Reference:<br>
        The complementary filter for attitude uses the gravity vector as the DC reference.<br>
        For position, the equivalent DC reference would be GPS or a beacon.<br>
        In GPS-denied environments, there is NO absolute position reference.<br>
        The complementary filter has no way to correct position drift — it cannot be extended.<br><br>
        Limitation 2 — No Uncertainty Quantification:<br>
        The complementary filter has no covariance matrix.<br>
        It cannot quantify: "I am confident in yaw to ±2°, position to ±0.3m"<br>
        Without uncertainty, it cannot:<br>
          - Perform innovation gating to reject bad GPS<br>
          - Weight sensors by their reliability<br>
          - Trigger failsafe based on confidence degradation<br><br>
        Limitation 3 — Cannot Fuse Asynchronous Heterogeneous Sensors:<br>
        Complementary filters are designed for two complementary sources.<br>
        Fusing GPS (3D, 5Hz), barometer (1D, 10Hz), optical flow (2D, 30Hz),<br>
        magnetometer (3D, 10Hz), VIO (6D, 30Hz) simultaneously requires<br>
        the formal state-space treatment that only a Kalman filter provides.<br>
        Each sensor needs an observation model, noise covariance, and<br>
        proper weighting — the EKF provides all of this in a single framework.
    </div>

    <h4>When Complementary Filters Are Still Appropriate</h4>
    <p>Within EKF3 itself, complementary filters are used for one specific task: propagating the state correction from the delayed time horizon forward to present time. Once the EKF computes the correction at the delayed timestamp, a simple complementary filter integrates the buffered IMU measurements to bring the estimate current. This is computationally inexpensive and numerically stable for the short (100–450ms) prediction window involved. The EKF does the heavy statistical lifting; the complementary filter does the cheap forward propagation.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">EKF3 Quick Reference: Key Parameters</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-2">Noise Tuning Parameters</strong>
                <ul class="text-slate-400 space-y-1 font-mono">
                    <li>EK3_GYRO_P_NSE — gyro process noise (rad/s, default 0.015)</li>
                    <li>EK3_ACC_P_NSE  — accel process noise (m/s^2, default 0.35)</li>
                    <li>EK3_GBIAS_P_NSE — gyro bias noise (rad/s, default 0.001)</li>
                    <li>EK3_ABIAS_P_NSE — accel bias noise (m/s^2, default 0.005)</li>
                    <li>EK3_ALT_M_NSE  — baro noise (m, default 1.0)</li>
                    <li>EK3_GPS_V_NSE  — GPS velocity noise (m/s, default 0.3)</li>
                    <li>EK3_GPS_P_NSE  — GPS position noise (m, default 0.3)</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-2">Innovation Gating Parameters</strong>
                <ul class="text-slate-400 space-y-1 font-mono">
                    <li>EK3_VEL_I_GATE  — velocity innovation gate (sigma, default 500)</li>
                    <li>EK3_POS_I_GATE  — position innovation gate (sigma, default 500)</li>
                    <li>EK3_HGT_I_GATE  — height innovation gate (sigma, default 500)</li>
                    <li>EK3_MAG_I_GATE  — mag innovation gate (sigma, default 300)</li>
                    <li>EK3_OF_I_GATE   — optical flow gate (sigma, default 300)</li>
                    <li>FS_EKF_THRESH   — failsafe variance threshold (default 0.8)</li>
                    <li>EK3_IMU_MASK    — bitmask selecting active IMUs (default 3)</li>
                </ul>
            </div>
        </div>
    </div>
</div>
`;
