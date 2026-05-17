export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 9</span>
    <h2>Sensor Fusion & Extended Kalman Filter Architecture</h2>
    <p>State estimation is the mathematical foundation of autonomous flight. Without knowing position, velocity, and attitude with bounded error, no control law can function correctly. This module covers the EKF architecture used in production ArduPilot systems — the concepts, the implementation decisions, and the failure modes engineers must understand.</p>

    <h3>9.1 Why EKF: The IMU Integration Problem</h3>
    <p>Inertial Measurement Units (IMUs) measure acceleration and angular rate. To get position from acceleration requires two integrations — and each integration <strong>accumulates error</strong>. This is not an implementation flaw; it is fundamental physics. The EKF exists to correct this drift using external references.</p>

    <div class="insight-box mb-6">
        <div class="insight-label">Core Problem</div>
        <p class="text-slate-200 text-sm mt-1">IMU noise (random) causes position error that grows as <strong>t^(3/2)</strong>. IMU bias (systematic) causes position error that grows as <strong>t²</strong>. A MEMS IMU used alone becomes useless for position after just 10 seconds.</p>
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">IMU-Only Dead Reckoning Error — How Fast It Gets Bad</div>
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-slate-800/50 text-slate-400 text-xs">
                    <th class="p-3 text-left">Time Elapsed</th>
                    <th class="p-3 text-left">Velocity Error (noise)</th>
                    <th class="p-3 text-left">Position Error (noise)</th>
                    <th class="p-3 text-left">Extra Error from Bias</th>
                    <th class="p-3 text-left">Verdict</th>
                </tr>
            </thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-white font-bold">1 second</td>
                    <td class="p-3 text-emerald-400">0.01 m/s</td>
                    <td class="p-3 text-emerald-400">~0.003 m</td>
                    <td class="p-3 text-emerald-400">~0.005 m</td>
                    <td class="p-3 text-emerald-300">Excellent — used for attitude hold</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-white font-bold">10 seconds</td>
                    <td class="p-3 text-amber-400">0.032 m/s</td>
                    <td class="p-3 text-amber-400">~0.11 m</td>
                    <td class="p-3 text-amber-400">~0.05 m</td>
                    <td class="p-3 text-amber-300">Marginal — maybe acceptable</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-white font-bold">60 seconds</td>
                    <td class="p-3 text-rose-400">0.078 m/s</td>
                    <td class="p-3 text-rose-400">~1.5 m</td>
                    <td class="p-3 text-rose-400">~1.8 m</td>
                    <td class="p-3 text-rose-300">Unusable — over 3m total drift</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-white font-bold">5 minutes</td>
                    <td class="p-3 text-rose-600">0.17 m/s</td>
                    <td class="p-3 text-rose-600">~18 m</td>
                    <td class="p-3 text-rose-600">~44 m</td>
                    <td class="p-3 text-rose-400">Catastrophic — 60+ m error</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p>The <strong>t² bias drift</strong> is the critical failure mode. An EKF fuses GPS, barometer, and magnetometer measurements to continuously correct and bound this drift, turning the IMU into a useful short-term predictor between external fixes.</p>

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

    <h3>9.3 The EKF3 State Vector: All 24 States</h3>
    <p>The EKF tracks 24 quantities simultaneously. Each state has an associated uncertainty, and the filter knows how all 24 uncertainties correlate with each other. This is what allows it to say "my position is drifting, therefore my velocity estimate is also suspect."</p>

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
                    <td class="p-3">meters</td>
                    <td class="p-3 text-slate-400">NED frame relative to EKF origin (set at takeoff)</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-sky-400">3–5</td>
                    <td class="p-3 text-white">Velocity (North, East, Down)</td>
                    <td class="p-3">m/s</td>
                    <td class="p-3 text-slate-400">Fused from GPS velocity + IMU integration</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-emerald-400">6–9</td>
                    <td class="p-3 text-white">Attitude Quaternion (q0, q1, q2, q3)</td>
                    <td class="p-3">unitless</td>
                    <td class="p-3 text-slate-400">4-component; avoids gimbal lock vs Euler angles</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-amber-400">10–12</td>
                    <td class="p-3 text-white">Accelerometer Bias (X, Y, Z)</td>
                    <td class="p-3">m/s²</td>
                    <td class="p-3 text-slate-400">EKF3 adds all 3 axes (EKF2 only had Z)</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-amber-400">13–15</td>
                    <td class="p-3 text-white">Gyroscope Bias (X, Y, Z)</td>
                    <td class="p-3">rad/s</td>
                    <td class="p-3 text-slate-400">Learned in-flight; corrects heading drift</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-violet-400">16–18</td>
                    <td class="p-3 text-white">Earth Magnetic Field (NED)</td>
                    <td class="p-3">Gauss</td>
                    <td class="p-3 text-slate-400">Adapts to local anomalies (rebar, geology)</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-violet-400">19–21</td>
                    <td class="p-3 text-white">Body Magnetic Field (X, Y, Z)</td>
                    <td class="p-3">Gauss</td>
                    <td class="p-3 text-slate-400">Motor/ESC interference learned in-flight</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-rose-400">22–23</td>
                    <td class="p-3 text-white">Wind Velocity (North, East)</td>
                    <td class="p-3">m/s</td>
                    <td class="p-3 text-slate-400">Critical for fixed-wing; helps copter in turbulence</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h3>9.4 The EKF Predict-Update Cycle</h3>
    <p>The EKF alternates between two phases: <strong>Predict</strong> (runs at 400Hz using the IMU) and <strong>Update</strong> (runs whenever a sensor measurement arrives). This is what lets it fuse sensors running at completely different rates.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-slate-900 p-5 rounded border-l-4 border-sky-500">
            <strong class="text-sky-400 block mb-3 text-sm uppercase tracking-wider">Predict Step — 400 Hz</strong>
            <p class="text-slate-300 text-sm mb-3">Runs every 2.5ms using the IMU as input:</p>
            <ol class="text-slate-400 text-xs space-y-2 list-decimal pl-4">
                <li>Use gyro reading (minus estimated bias) to rotate the attitude quaternion forward</li>
                <li>Rotate accelerometer reading from body frame to NED world frame using the quaternion</li>
                <li>Subtract gravity (9.81 m/s²) to get true linear acceleration</li>
                <li>Integrate acceleration → update velocity</li>
                <li>Integrate velocity → update position</li>
                <li>Grow the uncertainty estimate (things get less certain over time)</li>
            </ol>
            <div class="mt-3 text-xs text-sky-300 bg-sky-900/20 p-2 rounded">Result: best-guess state for "right now" — but uncertainty is growing</div>
        </div>
        <div class="bg-slate-900 p-5 rounded border-l-4 border-emerald-500">
            <strong class="text-emerald-400 block mb-3 text-sm uppercase tracking-wider">Update Step — Per Sensor Rate</strong>
            <p class="text-slate-300 text-sm mb-3">Runs when any external sensor delivers a measurement:</p>
            <ol class="text-slate-400 text-xs space-y-2 list-decimal pl-4">
                <li>Compute the <em>innovation</em>: difference between what was measured and what was predicted</li>
                <li>Run the innovation through an outlier gate — if it's too large, reject the measurement</li>
                <li>Compute the Kalman Gain: how much to trust the sensor vs the prediction</li>
                <li>Blend sensor data into the state estimate weighted by the gain</li>
                <li>Shrink the uncertainty estimate (external data made us more confident)</li>
            </ol>
            <div class="mt-3 text-xs text-emerald-300 bg-emerald-900/20 p-2 rounded">Result: corrected state with bounded, reduced uncertainty</div>
        </div>
    </div>

    <h4>Delayed Time Horizon Architecture</h4>
    <p>GPS measurements arrive ~100ms late. Barometer: ~50ms late. If the EKF applied a late measurement to the current state, it would be fusing stale data with fresh predictions — a timing mismatch that corrupts the estimate.</p>
    <p>ArduPilot EKF3 solves this with a <strong>ring buffer of past states</strong> (~450ms deep). When a delayed GPS measurement arrives, the EKF:</p>
    <ol class="text-slate-300 text-sm space-y-1 list-decimal pl-6">
        <li>Retrieves the state from the ring buffer at the GPS timestamp (i.e., the state that existed when the GPS measurement was taken)</li>
        <li>Performs the EKF update against that past state</li>
        <li>Propagates the correction forward to present time using buffered IMU data</li>
    </ol>
    <p class="mt-3">This is why the EKF correctly fuses GPS (100ms late, 5Hz), barometer (50ms late, 10Hz), optical flow (20ms late, 30Hz), and IMU (2.5ms) simultaneously without timing artifacts.</p>

    <h3>9.5 Measurement Updates: Sensor Fusion Details</h3>

    <h4>GPS Outlier Rejection (Innovation Gating)</h4>
    <p>Not every GPS reading is valid — multipath reflections off buildings, momentary satellite geometry problems, and spoofing attacks can all inject bad position fixes. The EKF uses <strong>innovation gating</strong> to automatically reject outliers.</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm text-center">
            <div class="text-3xl mb-2">📍</div>
            <strong class="text-white block mb-1">Compute Innovation</strong>
            <p class="text-slate-400 text-xs">Measured GPS position minus predicted position — how far off is the GPS reading?</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm text-center">
            <div class="text-3xl mb-2">⚖️</div>
            <strong class="text-white block mb-1">Scale by Uncertainty</strong>
            <p class="text-slate-400 text-xs">Divide by the expected spread (covariance). A 5m error in a high-uncertainty state is OK; in a low-uncertainty state it's an outlier.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm text-center">
            <div class="text-3xl mb-2">🚦</div>
            <strong class="text-white block mb-1">Gate Decision</strong>
            <p class="text-slate-400 text-xs">If scaled innovation &gt; EK3_POS_I_GATE (default 5σ): <span class="text-rose-400">REJECT</span>. Otherwise: <span class="text-emerald-400">ACCEPT</span> and fuse.</p>
        </div>
    </div>
    <p class="text-sm text-slate-300">This rejects: multipath reflections, GPS spoofing (sudden position jump), PDOP spikes, and ionospheric errors. Accepted measurements shrink the position uncertainty; rejected ones leave it unchanged.</p>

    <h4>Barometer Altitude Update</h4>
    <p>Barometer measures atmospheric pressure and converts it to altitude. It is the primary altitude source in GPS modes because GPS vertical accuracy is typically 3× worse than horizontal. The <code>EK3_ALT_M_NSE</code> parameter (default 1.0m) controls how much the EKF trusts barometer vs its own IMU prediction.</p>

    <h4>Magnetometer Yaw Update</h4>
    <p>The magnetometer measures the local magnetic field vector. The EKF compares that to its own prediction (derived from the current attitude quaternion plus estimated Earth field + body-magnetic-field states). The difference primarily corrects <strong>yaw (heading)</strong> and updates the magnetic field state estimates. EKF3's 3-axis fusion avoids singularities at ±90° pitch that plagued earlier single-axis heading updates.</p>

    <h4>Optical Flow Update (GPS-Denied Navigation)</h4>
    <p>Optical flow sensors measure pixel displacement between frames. The EKF converts this to translational velocity using the gyro reading and a rangefinder distance to the ground. In GUIDED_NOGPS mode (ArduCopter), optical flow is the <strong>sole horizontal position reference</strong> — GPS states are disabled and the EKF relies entirely on flow + rangefinder for horizontal velocity bounding.</p>

    <h4>Visual Inertial Odometry (VIO) Integration via MAVLink</h4>
    <p>Companion computers running VIO (e.g., Luxonis OAK-D, ORB-SLAM3, VINS-Mono) feed position estimates to ArduPilot via MAVLink. The integration protocol:</p>
    <ol class="text-slate-300 text-sm space-y-1 list-decimal pl-6 mt-2">
        <li>Send <code>SET_GPS_GLOBAL_ORIGIN</code> (MSG #48) once at startup — defines the NED origin for VIO coordinates</li>
        <li>Continuously send <code>VISION_POSITION_ESTIMATE</code> (MSG #102) at 15–30Hz — contains x, y, z in NED meters and roll, pitch, yaw from VIO</li>
        <li>Set <code>EK3_SRC1_POSXY=6</code> (ExternalNav) and <code>EK3_SRC1_VELXY=6</code> to use VIO as horizontal position/velocity source</li>
        <li>EKF3 fuses the VIO position using the same innovation gating as GPS — if VIO jumps (tracking failure), it gets rejected</li>
    </ol>

    <h3>9.6 EKF Health Monitoring and Failsafe</h3>
    <p>ArduPilot continuously evaluates EKF health and can trigger failsafe actions when confidence in the state estimate falls below thresholds.</p>

    <h4>EKF Health Variances (EKF_STATUS_REPORT, 2Hz)</h4>
    <p>Each field is a normalized scalar from <strong>0.0</strong> (perfect confidence) to <strong>1.0+</strong> (low confidence / possible failure):</p>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <table class="w-full text-xs">
            <thead>
                <tr class="bg-slate-800 text-slate-400">
                    <th class="p-3 text-left">Field</th>
                    <th class="p-3 text-left">What It Measures</th>
                    <th class="p-3 text-left">High Value Means</th>
                </tr>
            </thead>
            <tbody class="text-slate-300 font-mono">
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-sky-300">velocity_variance</td>
                    <td class="p-3">Velocity estimation uncertainty</td>
                    <td class="p-3 text-amber-400">GPS velocity noisy or IMU biasing fast</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-sky-300">pos_horiz_variance</td>
                    <td class="p-3">Horizontal position uncertainty</td>
                    <td class="p-3 text-amber-400">GPS position jumpy or dead-reckoning accumulated error</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-sky-300">pos_vert_variance</td>
                    <td class="p-3">Vertical position uncertainty</td>
                    <td class="p-3 text-amber-400">Barometer or GPS altitude unreliable</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-sky-300">compass_variance</td>
                    <td class="p-3">Magnetometer innovation ratio</td>
                    <td class="p-3 text-rose-400">Magnetic interference (motors at high throttle) or miscalibration</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-sky-300">terrain_alt_variance</td>
                    <td class="p-3">Terrain altitude uncertainty</td>
                    <td class="p-3 text-amber-400">Optical flow or rangefinder data unreliable</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h4>EKF Failsafe Logic</h4>
    <p>Evaluated at 10Hz. Triggers after 1 full second of sustained bad variance (10 consecutive bad checks). Threshold controlled by <code>FS_EKF_THRESH</code> (default 0.8).</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-rose-900/20 border border-rose-700/50 p-4 rounded">
            <strong class="text-rose-400 block mb-2 text-sm">Failsafe Triggers When:</strong>
            <ul class="text-slate-300 text-xs space-y-2">
                <li><strong class="text-white">Condition A:</strong> velocity_variance ≥ threshold AND (compass_variance ≥ threshold OR position_variance ≥ threshold)</li>
                <li><strong class="text-white">Condition B:</strong> velocity_variance ≥ 2× threshold (rapid IMU failure — no other condition needed)</li>
            </ul>
        </div>
        <div class="bg-slate-900 border border-slate-700 p-4 rounded text-xs font-mono">
            <strong class="text-amber-400 block mb-2">FS_EKF_THRESH Values:</strong>
            <div class="space-y-1 text-slate-300">
                <div><span class="text-slate-500">0.0</span> = Failsafe disabled</div>
                <div><span class="text-amber-400">0.6</span> = Sensitive (may false-trigger in aggressive flight)</div>
                <div><span class="text-emerald-400">0.8</span> = Default (recommended)</div>
                <div><span class="text-slate-400">1.0</span> = Permissive (tolerates more drift)</div>
            </div>
            <strong class="text-amber-400 block mt-3 mb-1">FS_EKF_ACTION:</strong>
            <div class="space-y-1 text-slate-300">
                <div><span class="text-sky-400">1</span> = Land (default)</div>
                <div><span class="text-sky-400">2</span> = AltHold (hover only)</div>
                <div><span class="text-sky-400">3</span> = Land from any mode</div>
            </div>
        </div>
    </div>

    <p class="text-sm text-slate-300">Log analysis: Dataflash log fields <code>NKF4.SP</code> (position), <code>NKF4.SV</code> (velocity), <code>NKF4.SM</code> (magnetic). Any field sustained above 1.0 means the EKF is rejecting that sensor — investigate before autonomous flight.</p>

    <h3>9.7 Multi-EKF Architecture: Redundancy and Fault Tolerance</h3>
    <p>ArduPilot can run multiple simultaneous EKF instances — one per IMU. With a triple-redundant platform (Cube Orange+), three EKF3 instances run in parallel. If one IMU degrades, the autopilot automatically switches to the healthiest instance.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Multi-EKF Instance Architecture</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border border-sky-700">
                <strong class="text-sky-400 block mb-2">EKF3 Instance 0 (IMU0) — Active</strong>
                <p class="text-slate-400">Primary instance. Uses ICM-20689. Output drives the aircraft unless variance metrics degrade below the threshold.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-600">
                <strong class="text-slate-400 block mb-2">EKF3 Instance 1 (IMU1) — Shadow</strong>
                <p class="text-slate-400">Uses ICM-20602. Runs concurrently but output is discarded unless Instance 0 degrades. Health checked at 10Hz.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-600">
                <strong class="text-slate-400 block mb-2">EKF3 Instance 2 (IMU2) — Fallback</strong>
                <p class="text-slate-400">Uses ICM-42688-P. Activated only if both Instance 0 and 1 have degraded health metrics. DCM is the final backstop.</p>
            </div>
        </div>
        <p class="text-slate-400 text-xs mt-4">Instance switching uses a health score (sum of normalized variances). The lowest-score instance becomes active. Hysteresis prevents rapid switching between instances. DCM runs in the background as a final fallback for attitude-only estimation if all EKF instances fail.</p>
    </div>

    <h4>EKF Source Switching (GPS ↔ Optical Flow ↔ VIO)</h4>
    <p>EKF3 supports three independent source sets (SRC1, SRC2, SRC3). A hardware RC switch or MAVLink command selects the active set. This enables in-flight transitions between GPS (outdoors) and optical flow / VIO (indoors) without rebooting. The transition is seamless — EKF3 momentarily fuses both sources simultaneously during handover, so the position state never jumps.</p>

    <h3>9.8 Complementary Filter vs EKF</h3>
    <p>The complementary filter is the predecessor to the EKF. It blends gyroscope (good at high-frequency, drifts long-term) with accelerometer/magnetometer (good DC reference, noisy short-term). It works well for attitude on stable platforms. The EKF replaced it because the complementary filter has three fundamental limitations for position navigation:</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-slate-900 p-4 rounded border border-rose-800/50">
            <strong class="text-rose-400 block mb-2 text-sm">No Position Reference</strong>
            <p class="text-slate-400 text-xs">Attitude estimation uses gravity as a DC anchor. For position, that anchor would be GPS or a beacon. In GPS-denied environments, no such anchor exists — the complementary filter has no way to correct position drift and cannot be extended to solve it.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-amber-800/50">
            <strong class="text-amber-400 block mb-2 text-sm">No Uncertainty Tracking</strong>
            <p class="text-slate-400 text-xs">The complementary filter has no covariance matrix. It cannot say "I am confident in yaw to ±2°." Without uncertainty, it cannot weight sensors by reliability, gate outlier GPS readings, or trigger failsafe based on confidence degradation.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-600">
            <strong class="text-slate-400 block mb-2 text-sm">Two-Source Limit</strong>
            <p class="text-slate-400 text-xs">Complementary filters are designed for two complementary sources. Fusing GPS (5Hz), barometer (10Hz), optical flow (30Hz), magnetometer (10Hz), and VIO (30Hz) simultaneously requires the formal state-space framework only a Kalman filter provides.</p>
        </div>
    </div>

    <p class="text-sm text-slate-300">Note: Within EKF3 itself, a complementary filter is still used for one task — propagating the delayed-time-horizon correction forward to present time. The EKF handles the statistics; the complementary filter just does the cheap 100–450ms forward integration.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">EKF3 Quick Reference: Key Parameters</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-2">Noise Tuning Parameters</strong>
                <ul class="text-slate-400 space-y-1 font-mono">
                    <li>EK3_GYRO_P_NSE — gyro process noise (rad/s, default 0.015)</li>
                    <li>EK3_ACC_P_NSE  — accel process noise (m/s², default 0.35)</li>
                    <li>EK3_GBIAS_P_NSE — gyro bias noise (rad/s, default 0.001)</li>
                    <li>EK3_ABIAS_P_NSE — accel bias noise (m/s², default 0.005)</li>
                    <li>EK3_ALT_M_NSE  — baro noise (m, default 1.0)</li>
                    <li>EK3_GPS_V_NSE  — GPS velocity noise (m/s, default 0.3)</li>
                    <li>EK3_GPS_P_NSE  — GPS position noise (m, default 0.3)</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-2">Innovation Gating Parameters</strong>
                <ul class="text-slate-400 space-y-1 font-mono">
                    <li>EK3_VEL_I_GATE  — velocity innovation gate (σ, default 500)</li>
                    <li>EK3_POS_I_GATE  — position innovation gate (σ, default 500)</li>
                    <li>EK3_HGT_I_GATE  — height innovation gate (σ, default 500)</li>
                    <li>EK3_MAG_I_GATE  — mag innovation gate (σ, default 300)</li>
                    <li>EK3_OF_I_GATE   — optical flow gate (σ, default 300)</li>
                    <li>FS_EKF_THRESH   — failsafe variance threshold (default 0.8)</li>
                    <li>EK3_IMU_MASK    — bitmask selecting active IMUs (default 3)</li>
                </ul>
            </div>
        </div>
    </div>
</div>
`;
