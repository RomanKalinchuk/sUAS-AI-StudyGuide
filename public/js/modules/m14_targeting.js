export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 14</span>
    <h2>AI Targeting &amp; Kinematics</h2>
    <p>Detecting an object in a single frame is computer vision. Tracking it persistently through 3D space, estimating its velocity and trajectory, geolocating it in world coordinates, and controlling a drone to intercept or follow it — that is autonomous targeting. This module covers the full engineering stack: gimbal control and stabilization, EO/IR payload selection, target geolocation math (GPS + laser rangefinder + gimbal angles), multi-object tracking algorithms, state estimation filters, guidance laws, cascade control, and the legal/policy framework (DoD Directive 3000.09) governing autonomous lethal decisions. Command and control integration via Cursor on Target (CoT) and ATAK is covered in sections 14.10–14.12.</p>

    <div class="bg-amber-950 border border-amber-700 rounded-lg p-4 mb-6 text-sm text-amber-200">
        <strong class="text-amber-400 block mb-1">Classification Note</strong>
        All content in this module is based on publicly available, unclassified sources. Actual system capabilities, engagement rules, and operational parameters for deployed systems are classified. References to specific weapons are for educational context only.
    </div>

    <h3>14.1 Gimbal Systems — Stabilization and Control</h3>
    <p>An airborne targeting gimbal is a motorized, multi-axis mechanical platform that keeps an imaging sensor pointed at a scene of interest regardless of the aircraft's attitude changes, vibration, and wind gusts. Without stabilization, a drone moving at 10 m/s would smear a 1000mm telephoto image completely across the target within a single video frame. A good 3-axis gimbal holds pointing to within ±0.01° RMS — better than 0.02 m lateral drift at 100 m range.</p>

    <h4>14.1.1 Gimbal Axes and Coordinate Frames</h4>
    <p>A 3-axis gimbal provides independent control of azimuth (pan/yaw), elevation (tilt/pitch), and roll (rotation about the camera boresight). Each axis has a brushless DC motor and a magnetic encoder. The inner frame (camera) is isolated from the outer frame (drone body) by the three gimbaled rings. The goal is to maintain the camera frame's orientation constant in the world frame despite rotations of the drone body frame.</p>

    <div class="insight-box">
        <div class="insight-label">GIMBAL AXES AND THE STABILIZATION PROBLEM</div>
        <p class="text-slate-200 text-sm mt-1">A 3-axis gimbal achieves full attitude decoupling: azimuth motor cancels drone yaw, elevation motor cancels drone pitch, roll motor cancels drone roll. The IMU on the gimbal's inner frame measures residual rotation at 1 kHz; the motor controller immediately applies opposing torque to null the error. The result: the camera appears to float independently of the aircraft. Gimbal lock (a singularity where two axes align and a degree of freedom is lost) occurs only at ±90° elevation — near nadir-pointing gimbals must handle this with quaternion-based control rather than Euler angles.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
3-Axis Gimbal Control Loop:

Each axis has an independent PID control loop running at 400–1000 Hz:

  Stabilization mode (rate loop):
    error_rate = gyro_measured_rate - gyro_target_rate
    output = Kp * error_rate + Ki * integral(error_rate) + Kd * d(error_rate)/dt
    Motor PWM = clamp(output, -100%, 100%)
    Goal: drive angular rate of inner frame to zero

  Follow mode (angle loop outer + rate loop inner):
    angle_error = target_angle - current_angle  (from encoder)
    rate_cmd = Kp_angle * angle_error           (P-only outer loop)
    → fed into rate PID inner loop as rate target

  ROI (Region of Interest) / GPS tracking mode:
    Convert target GPS position to gimbal azimuth/elevation angles:
      az  = atan2(E_target - E_drone, N_target - N_drone)   [yaw to target]
      el  = atan2(-(alt_drone - alt_target), range_horiz)   [depression angle]
    These become angle setpoints → angle loop → rate loop → motors

SToRM32-BGC (open-source 3-axis controller):
  MCU: STM32F103 at 72 MHz
  IMU: MPU-6050 (3-axis gyro + 3-axis accel)
  Update rate: 400 Hz control loop
  Communication: MAVLink protocol (ArduPilot integration)
  Encoder: AS5048 magnetic absolute encoder on each axis
  ArduPilot mount library: translates ROI waypoints → gimbal angle commands

BaseCam SimpleBGC 32-bit (commercial):
  Dual-IMU architecture: inner frame IMU + outer frame IMU
  Outer IMU corrects for gimbal frame flexure (metal twist at high speed)
  Stabilization RMS: 0.01–0.05° depending on platform vibration
</div>
</details>

    <h4>14.1.2 Gimbal Stabilization Mathematics</h4>
    <p>The gimbal controller must cancel the drone's angular velocity by commanding equal and opposite rotation rates. The critical computation is transforming the drone body angular velocity from body frame into each gimbal axis frame — because the compensation needed on the azimuth motor when the drone rolls depends on the current elevation angle.</p>

    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Euler Angle Rate Transformation (Gimbal Motor Compensation):

Let:
  omega_body = [p, q, r]^T = drone body angular rates (gyro, rad/s)
  phi_g   = gimbal roll angle  (encoder reading)
  theta_g = gimbal pitch/elevation angle (encoder reading)
  psi_g   = gimbal yaw/azimuth angle (encoder reading)

The body angular rates project onto gimbal axes as follows:
  omega_roll_axis  = p * cos(theta_g) * cos(psi_g) + q * cos(theta_g) * sin(psi_g) - r * sin(theta_g)
  omega_pitch_axis = -p * sin(psi_g) + q * cos(psi_g)
  omega_yaw_axis   = p * sin(theta_g) * cos(psi_g) + q * sin(theta_g) * sin(psi_g) + r * cos(theta_g)

Each motor feedforward = -omega_axis * Kff  (cancel body-induced rotation)
Residual error (from IMU on inner frame) handled by PID feedback loop.

Vibration Filtering:
  Rotors generate vibration at f_vib = N_rotors * RPM / 60
  Example: quad at 5000 RPM, 2-blade props: 5000/60 * 4 = 333 Hz fundamental
  Notch filter at 333 Hz: H(s) = (s^2 + 2*xi_z*omega_n*s + omega_n^2) /
                                  (s^2 + 2*xi_p*omega_n*s + omega_n^2)
  xi_z = 0.01 (sharp notch), xi_p = 0.1 (wider pole bandwidth)
  Applied digitally on IMU data before PID: cuts vibration amplitude by 20–40 dB.

Gimbal Lock Avoidance:
  Euler representation singular at elevation = ±90°.
  Solution: use quaternion-based attitude representation internally.
  q = [w, x, y, z] (unit quaternion)
  Error quaternion: q_err = q_target * q_current^{-1}
  Rate command: omega_cmd = 2 * Kp * vec(q_err) / dt
  No singularity at any orientation.
</div>
</details>

    <h4>14.1.3 Key Gimbal Payloads — 2024/2025 Systems</h4>
    <p>The choice of gimbal payload determines the surveillance range, target identification capability, and overall system weight. Military and defense systems span from sub-100g micro-gimbals to 15+ kg multi-sensor turrets.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">System</th>
                    <th class="p-3">Weight</th>
                    <th class="p-3">Sensors</th>
                    <th class="p-3">Stabilization</th>
                    <th class="p-3">ID Range</th>
                    <th class="p-3">Platform</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-semibold">L3Harris WESCAM MX-10</td>
                    <td class="p-3 text-slate-300">4.5 kg</td>
                    <td class="p-3 text-slate-300">HD EO + MWIR + SWIR + LRF</td>
                    <td class="p-3 text-slate-300">4-axis, &lt;0.01° RMS</td>
                    <td class="p-3 text-slate-300">3–5 km (vehicle)</td>
                    <td class="p-3 text-slate-300">Medium UAS, helo</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-sky-400 font-semibold">L3Harris WESCAM MX-15D</td>
                    <td class="p-3 text-slate-300">54 kg</td>
                    <td class="p-3 text-slate-300">HD EO + MWIR + LWIR + SWIR + laser designator/rangefinder</td>
                    <td class="p-3 text-slate-300">4-axis, &lt;0.005° RMS</td>
                    <td class="p-3 text-slate-300">15+ km (vehicle)</td>
                    <td class="p-3 text-slate-300">MQ-9, MALE UAS</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-semibold">Teledyne FLIR Hadron 640R</td>
                    <td class="p-3 text-slate-300">&lt;50 g (module)</td>
                    <td class="p-3 text-slate-300">LWIR 640×512 + 12MP RGB</td>
                    <td class="p-3 text-slate-300">Electronic (no mechanical)</td>
                    <td class="p-3 text-slate-300">~300 m (person)</td>
                    <td class="p-3 text-slate-300">sUAS, micro-drone</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-sky-400 font-semibold">DJI Zenmuse H30T</td>
                    <td class="p-3 text-slate-300">930 g</td>
                    <td class="p-3 text-slate-300">48MP EO + 640×512 IR + 200× zoom + LRF</td>
                    <td class="p-3 text-slate-300">3-axis, &lt;0.01° RMS</td>
                    <td class="p-3 text-slate-300">~1 km (vehicle)</td>
                    <td class="p-3 text-slate-300">DJI Matrice 350/400</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-semibold">NextVision Colibri2</td>
                    <td class="p-3 text-slate-300">120 g</td>
                    <td class="p-3 text-slate-300">LWIR 320×256 + HD EO, 3-axis stabilized</td>
                    <td class="p-3 text-slate-300">3-axis, &lt;0.05° RMS</td>
                    <td class="p-3 text-slate-300">~500 m (person)</td>
                    <td class="p-3 text-slate-300">sUAS (&lt;2 kg)</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-sky-400 font-semibold">Ukrspecsystems USG-405</td>
                    <td class="p-3 text-slate-300">750 g</td>
                    <td class="p-3 text-slate-300">40× EO + LWIR 640×512 + LRF (5 km)</td>
                    <td class="p-3 text-slate-300">3-axis, &lt;0.02° RMS</td>
                    <td class="p-3 text-slate-300">~2 km (vehicle)</td>
                    <td class="p-3 text-slate-300">Medium UAS (5–25 kg)</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p class="text-slate-400 text-xs mt-1 mb-4">LRF = Laser Rangefinder. MWIR = Mid-Wave IR (3–5 µm). LWIR = Long-Wave IR (8–12 µm). SWIR = Short-Wave IR (1–2.5 µm). ID Range = target identification range for a standard NATO 2.3×2.3 m vehicle target.</p>

    <h3>14.2 Electro-Optical / Infrared (EO/IR) Sensor Physics</h3>

    <h4>14.2.1 Waveband Selection</h4>
    <p>The choice of IR waveband significantly affects what the sensor detects and how it performs in different environments. Understanding the atmospheric transmission windows is essential for sensor selection.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">IR Waveband Comparison for Targeting</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase tracking-widest block mb-2">EO (Visible/NIR, 0.4–1.0 µm)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Best resolution per pixel — daylight only</li>
                    <li>High-contrast imagery for identification</li>
                    <li>Fails: night, smoke, heavy haze, precipitation</li>
                    <li>Color discrimination for target classification</li>
                    <li>NIR (0.7–1.0 µm): illuminators allow covert night ops</li>
                    <li>Low cost: consumer CMOS sensors usable</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase tracking-widest block mb-2">MWIR (Mid-Wave IR, 3–5 µm)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Best for hot targets (jet exhaust, gunfire, 300–1200 K)</li>
                    <li>Detects aircraft engines at 20+ km</li>
                    <li>Low background clutter from warm ground</li>
                    <li>Better range than LWIR in humid conditions</li>
                    <li>Requires detector cooling (InSb, MCT) → heavy, expensive</li>
                    <li>Sensitive to reflections from sunlit metal surfaces</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-rose-500">
                <strong class="text-rose-400 uppercase tracking-widest block mb-2">LWIR (Long-Wave IR, 8–12 µm)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Best for room-temperature targets (humans, vehicles, 280–350 K)</li>
                    <li>All-weather: penetrates smoke, haze, and fog</li>
                    <li>Uncooled detectors available (microbolometer) → low SWaP</li>
                    <li>Human detection to 1 km on sUAS; vehicle to 3 km on medium UAS</li>
                    <li>Thermal equalization at dawn/dusk reduces contrast temporarily</li>
                    <li>Used in 90% of sUAS thermal payloads (DJI, FLIR, Seek)</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase tracking-widest block mb-2">SWIR (Short-Wave IR, 1–2.5 µm)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Works at night under starlight/moonlight (no illuminator needed)</li>
                    <li>Penetrates haze better than visible</li>
                    <li>Detects laser designator spots (1.06 µm Nd:YAG)</li>
                    <li>Friend/foe marker recognition (IR strobes)</li>
                    <li>InGaAs detector: expensive ($10k–50k per module)</li>
                    <li>Used in MX-15D, Skyball, Argus-IS for designator detection</li>
                </ul>
            </div>
        </div>
    </div>

    <h4>14.2.2 Minimum Resolvable Temperature Difference (MRTD) and Johnson Criteria</h4>
    <p>The range at which a thermal sensor can detect, recognize, and identify a target is governed by two standards: the MRTD characterizes sensor sensitivity (minimum temperature difference that can be resolved), and the Johnson Criteria specify how many pixels across a target are needed for each discrimination level.</p>

    <div class="insight-box">
        <div class="insight-label">JOHNSON CRITERIA: PIXELS ON TARGET DETERMINES WHAT YOU CAN DO</div>
        <p class="text-slate-200 text-sm mt-1">The Johnson Criteria (1958, updated by NVThermIP) define the minimum number of line pairs across the minimum target dimension for each task: detection needs 1 line pair (2 pixels), orientation (is it moving left or right?) needs 1.5, recognition (is it a T-72 or BMP?) needs 4, and identification (which variant?) needs 6–8. For a 2.3 m wide target at 1 km range with a 640-pixel LWIR sensor and 25 mm focal length, you get approximately 2.3 × 25/(1000 × 0.017mm_pitch) ≈ 3.4 pixels — adequate for recognition but not identification at that range.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Johnson Criteria (Target Discrimination Tasks):

Task           Line Pairs Across Min Dim   Pixel Count (at 2 pixels/LP)
-----------    --------------------------  ----------------------------
Detection      1.0                         2 pixels
Orientation    1.5                         3 pixels
Recognition    4.0                         8 pixels
Identification 6.0–8.0                    12–16 pixels

Angular size of target (radians):
  alpha = target_size / range               (e.g., 2.3m / 1000m = 2.3 mrad)

Pixels on target:
  N_pixels = alpha * (focal_length / pixel_pitch)
           = (target_size / range) * (f / p)
  where f = focal length [mm], p = pixel pitch [mm]

Example: FLIR Boson+ 640 (640×512, 12 µm pitch, 35 mm lens):
  Pixel IFOV = p/f = 0.012/35 = 0.343 mrad
  NATO vehicle (2.3 m min dim) at 1000 m: N = 2.3/1.0 * (35/0.012) = 6.7 pixels → recognition
  Same at 2000 m: N = 3.3 pixels → orientation only

MRTD (Minimum Resolvable Temperature Difference):
  Thermal sensitivity: NETD (Noise-Equivalent Temperature Difference)
  Commercial microbolometer: NETD = 30–100 mK
  Cooled MCT (MWIR): NETD = 5–20 mK
  System MRTD &lt; 0.05°C allows detection of humans at 500m even when
  body temperature differs from background by only 0.5°C.
</div>
</details>

    <h3>14.3 Target Geolocation — From Pixels to GPS Coordinates</h3>
    <p>The tracker produces bounding box pixel coordinates. The mission system needs GPS coordinates (WGS84 latitude, longitude, altitude) or NED coordinates in meters. Two complementary methods exist: (1) ray-casting against a terrain plane using drone attitude + gimbal angles, and (2) laser rangefinder (LRF) providing direct slant range. The LRF method is more accurate; ray-casting is used when no LRF is fitted.</p>

    <h4>14.3.1 Method A: Laser Rangefinder (LRF) Geolocation</h4>
    <p>A laser rangefinder fires a 1.5 µm or 1.06 µm eye-safe pulse and measures time-of-flight to the target. Combined with the drone's GPS position and the gimbal's absolute pointing angles, this directly provides the target's 3D world position. This is the standard method on all military-grade gimbal payloads (MX-15D, USG-405, DJI H30T).</p>

    <div class="insight-box">
        <div class="insight-label">LRF GEOLOCATION: SLANT RANGE + GIMBAL ANGLES = TARGET GPS</div>
        <p class="text-slate-200 text-sm mt-1">The laser rangefinder provides the slant range R (distance along the line-of-sight from sensor to target). The gimbal encoders give the azimuth (az) and elevation (el) angles in body frame. After rotating to the world (NED) frame using the drone's attitude, the slant range and angles give the target's exact position vector. Accuracy is dominated by GPS error of the drone (±1.5 m standard GPS, ±0.05 m RTK) and encoder accuracy (±0.05°). Target CEP of 1–3 m is achievable with RTK GPS.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
LRF-Based Target Geolocation (Full Derivation):

Inputs:
  R         = slant range from LRF (meters)
  az_g      = gimbal azimuth angle (encoder, body-relative, rad)
  el_g      = gimbal elevation angle (encoder, body-relative, rad)
  phi, theta, psi = drone roll, pitch, yaw (from EKF/INS, rad)
  (lat_0, lon_0, alt_0) = drone GPS position (WGS84)

Step 1: LOS unit vector in gimbal frame
  d_gimbal = [cos(el_g)*cos(az_g),
              cos(el_g)*sin(az_g),
              -sin(el_g)]   (in gimbal frame, X=fwd, Y=right, Z=down)

Step 2: Rotate gimbal frame → body frame
  R_gimbal_to_body: rotation from gimbal mounting orientation
  d_body = R_gimbal_to_body * d_gimbal

Step 3: Rotate body frame → NED frame (drone attitude)
  R_body_to_NED = Rz(psi) * Ry(theta) * Rx(phi)   [ZYX Euler, NED convention]
  d_NED = R_body_to_NED * d_body                    [North, East, Down]

Step 4: Target position vector in NED from drone
  P_target_NED = R * d_NED                          [meters, NED offset]

Step 5: Convert NED offset → WGS84 (flat-Earth approximation, valid &lt;50 km)
  R_earth = 6,378,137.0 m
  lat_target = lat_0 + (P_target_NED[0] / R_earth) * (180/pi)
  lon_target = lon_0 + (P_target_NED[1] / (R_earth * cos(lat_0 * pi/180))) * (180/pi)
  alt_target = alt_0 - P_target_NED[2]              (NED Down is negative altitude)

Step 6: Convert to MGRS (for tactical reporting)
  Use PROJ library or pyproj:
  mgrs_coord = mgrs.toMGRS(lat_target, lon_target, MGRSPrecision.TEN_METER)
  → e.g., "37T CJ 12345 67890"  (10-meter precision MGRS)

Laser Types:
  Nd:YAG 1064 nm: max range 20+ km (classified), detectable by SWIR sensors
  Er:glass 1550 nm: eye-safe (Class 1M), max range 5–15 km
  Diode-pumped 905 nm: cheap, short-range (1–3 km), used in DJI H30T
</div>
</details>

    <h4>14.3.2 Method B: Camera Ray-Casting (No LRF)</h4>
    <p>Without a laser rangefinder, target depth must be inferred from the terrain altitude. A ray from the camera through the target pixel is intersected with the terrain plane at the known AGL altitude. This is the standard method for sUAS without LRF.</p>

    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Ray-Terrain Intersection:

Given: pixel (u, v), camera AGL height h from barometer+DEM, full extrinsic chain

Step 1: Compute unit ray in camera frame
  d_cam = K^{-1} * [u, v, 1]^T           (normalized ray direction, K = intrinsic matrix)
  d_cam = d_cam / ||d_cam||               (unit vector)

Step 2: Rotate ray to NED world frame
  d_NED = R_body_to_NED * R_gimbal_to_body * R_cam_to_gimbal * d_cam

Step 3: Intersect ray with terrain plane (altitude = alt_drone - h_AGL)
  Ray: P(t) = P_drone_NED + t * d_NED
  Terrain plane (NED, Down component):  P_Down = h_AGL  (positive Down = below drone)
  Solve: t = h_AGL / d_NED[Down]         (valid only when d_NED[Down] &gt; 0)

Step 4: Target NED position
  P_target = P_drone_NED + t * d_NED

Accuracy drivers (error budget at 100 m AGL, 45° depression):
  GPS drone position error (standard GPS ±1.5 m CEP):   ±1.5 m
  GPS drone position error (RTK ±0.05 m CEP):           ±0.05 m
  Gimbal azimuth/elevation encoder (±0.05°):             ±0.09 m at 100 m
  Drone attitude error (INS ±0.2° pitch/roll):           ±0.35 m at 100 m
  Pixel centroid error (±3 px, 2000 px focal length):    ±0.06 m
  Terrain altitude DEM error (DTED-2 ±3 m vertical):    ±3.0 m horizontal at 45°
  Total CEP (RSS): ~2.5–3.5 m (std GPS), ~0.5–1.0 m (RTK GPS)
</div>
</details>

    <h4>14.3.3 Worked Geolocation Example</h4>
    <div class="bg-slate-900 border border-slate-600 rounded-lg p-5 my-6 text-sm">
        <h5 class="text-sky-400 font-bold mb-3">Scenario: Switchblade 600 operator acquiring a moving vehicle target</h5>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div>
                <p class="text-slate-400 font-semibold mb-1">Given:</p>
                <ul class="space-y-1">
                    <li>Drone position: 36.5000°N, -116.5000°E, AGL = 150 m</li>
                    <li>Drone attitude: roll=0°, pitch=-2°, yaw=045° (NE)</li>
                    <li>Gimbal azimuth: 20° (right of drone nose)</li>
                    <li>Gimbal elevation: -35° (depression angle)</li>
                    <li>LRF range: R = 262 m</li>
                </ul>
            </div>
            <div>
                <p class="text-slate-400 font-semibold mb-1">Calculation:</p>
                <ul class="space-y-1">
                    <li>Gimbal az total = 045° + 20° = 065° (true bearing)</li>
                    <li>LOS direction: az=065°, el=-35°</li>
                    <li>Horiz component: R×cos(35°) = 262×0.819 = 215 m</li>
                    <li>N offset: 215×cos(65°) = 90.9 m North</li>
                    <li>E offset: 215×sin(65°) = 194.9 m East</li>
                    <li>Alt offset: 262×sin(35°) = 150.3 m → target near ground ✓</li>
                </ul>
            </div>
        </div>
        <div class="mt-3 text-xs">
            <p class="text-slate-400 font-semibold mb-1">Result:</p>
            <p class="text-slate-300">Target lat: 36.5000 + (90.9/6378137)×(180/π) = <strong class="text-emerald-400">36.5008°N</strong></p>
            <p class="text-slate-300">Target lon: -116.5000 + (194.9/(6378137×cos(36.5°×π/180)))×(180/π) = <strong class="text-emerald-400">-116.4976°E</strong></p>
            <p class="text-slate-400 mt-1">CEP with standard GPS: ~2.5 m. With RTK: ~0.5 m. The target position is transmitted as CoT event to ATAK-equipped ground forces.</p>
        </div>
    </div>

    <h4>14.3.4 Circular Error Probable (CEP) and Accuracy Standards</h4>
    <p>CEP is the radius of a circle centered on the mean aim point within which 50% of weapons or position estimates fall. It is a 50th-percentile, not worst-case, metric. CEP assumes radially symmetric (Rayleigh) distribution of errors. For a system with independent Gaussian errors in north (σ_N) and east (σ_E) directions: CEP ≈ 0.59 × (σ_N + σ_E) when σ_N ≈ σ_E.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">CEP Reference Values — Military Targeting Systems</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-xs font-mono">
                <thead><tr class="bg-slate-800 text-slate-400">
                    <th class="p-2 text-left">System / Method</th>
                    <th class="p-2 text-right">CEP</th>
                    <th class="p-2 text-left">Notes</th>
                </tr></thead>
                <tbody class="text-slate-300">
                    <tr class="border-t border-slate-700"><td class="p-2">Unguided bomb (WWII)</td><td class="p-2 text-right">~1,000 m</td><td class="p-2">Manual aiming</td></tr>
                    <tr class="border-t border-slate-700 bg-slate-800"><td class="p-2">Standard GPS (C/A code)</td><td class="p-2 text-right">1.5–3 m</td><td class="p-2">Horizontal, open sky</td></tr>
                    <tr class="border-t border-slate-700"><td class="p-2">RTK GPS</td><td class="p-2 text-right">0.02–0.05 m</td><td class="p-2">Requires base station &lt;50 km</td></tr>
                    <tr class="border-t border-slate-700 bg-slate-800"><td class="p-2">JDAM (GPS-guided bomb)</td><td class="p-2 text-right">~5 m</td><td class="p-2">GPS + INS, all weather</td></tr>
                    <tr class="border-t border-slate-700"><td class="p-2">Laser-guided bomb (PGM)</td><td class="p-2 text-right">~1–3 m</td><td class="p-2">Semi-active laser homing</td></tr>
                    <tr class="border-t border-slate-700 bg-slate-800"><td class="p-2">sUAS ray-casting geoloc (std GPS)</td><td class="p-2 text-right">2.5–5 m</td><td class="p-2">100 m AGL, DEM error dominant</td></tr>
                    <tr class="border-t border-slate-700"><td class="p-2">sUAS LRF geolocation (std GPS)</td><td class="p-2 text-right">1.5–3 m</td><td class="p-2">GPS error dominant</td></tr>
                    <tr class="border-t border-slate-700 bg-slate-800"><td class="p-2">sUAS LRF geolocation (RTK GPS)</td><td class="p-2 text-right">0.3–0.8 m</td><td class="p-2">Encoder + attitude error dominant</td></tr>
                    <tr class="border-t border-slate-700"><td class="p-2">Switchblade 600 (EO/IR + GPS)</td><td class="p-2 text-right">~1–2 m</td><td class="p-2">Publically stated precision strike</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <h4>14.3.5 Coordinate Reference Systems: WGS84, UTM, and MGRS</h4>
    <p>Military targeting uses three coordinate systems, each optimized for different purposes. An AI targeting system must be fluent in all three and perform rapid conversions without rounding errors.</p>

    <div class="bg-slate-800 p-4 rounded border-l-4 border-amber-500 text-sm text-slate-300 my-4">
        <strong class="text-amber-400 block mb-2">Three Coordinate Systems for Targeting:</strong>
        <ul class="space-y-2">
            <li><strong class="text-sky-300">WGS84 (lat/lon/alt):</strong> Used by GPS receivers and all geospatial software. The global reference standard. Latitude in degrees north (+) or south (-) of equator; longitude in degrees east (+) or west (-) of Greenwich meridian. Altitude is height above WGS84 ellipsoid (not sea level — differs from MSL by up to ±100 m globally).</li>
            <li><strong class="text-emerald-300">UTM (Universal Transverse Mercator):</strong> Divides the Earth into 60 zones (6° wide each). Provides Easting/Northing in meters within each zone. Minimal distortion (&lt;0.1%) within a zone. Used for tactical map computation where metric distances matter. Zone 37T covers parts of eastern Europe and the Middle East.</li>
            <li><strong class="text-purple-300">MGRS (Military Grid Reference System):</strong> Extends UTM with a letter-coded grid square system. Format: [Zone][Band][100km Square ID][Easting][Northing], e.g., "37T CJ 12345 67890" = 10 m precision grid reference. Used for voice reporting of target locations in NATO operations. ATAK displays and transmits MGRS. CoT messages internally use WGS84 lat/lon and convert to MGRS for display.</li>
        </ul>
    </div>

    <h3>14.4 Multi-Object Tracking (MOT) — Beyond DeepSORT</h3>
    <p>YOLO tells you "there is a car at these pixel coordinates in this frame." Multi-object tracking (MOT) answers the harder question: "Is this the same car as in the previous 47 frames, and where will it be in the next frame?" A tracker wraps a detector, maintaining persistent identity across frames through a combination of motion prediction and data association.</p>

    <h4>14.4.1 The SORT Baseline (Bewley et al., 2016)</h4>
    <p>Simple Online and Realtime Tracking (SORT) uses a Kalman filter to predict bounding box motion and the Hungarian algorithm to associate predictions with new detections. State vector: (u, v, s, r, u_dot, v_dot, s_dot) where u,v = center coordinates, s = scale (area), r = aspect ratio. SORT achieves ~260 FPS on a CPU — fast enough for embedded hardware. Its weakness: it relies entirely on IoU overlap for association. When targets cross paths or briefly disappear, identity switches accumulate.</p>

    <h4>14.4.2 ByteTrack — The Current Standard (Zhang et al., 2022)</h4>
    <p>ByteTrack was top-performing on MOT17 and MOT20 benchmarks when published. Its key insight: DeepSORT discards low-confidence detections (score &lt; 0.5), but these often contain real partially-occluded objects. ByteTrack performs two-stage association:</p>

    <div class="insight-box">
        <div class="insight-label">BYTETRACK TWO-STAGE ASSOCIATION</div>
        <p class="text-slate-200 text-sm mt-1">ByteTrack runs Hungarian matching twice per frame: first against high-confidence detections, then against low-confidence "byte" detections for tracks unmatched in stage 1. This second pass rescues tracks that briefly drop in confidence due to partial occlusion, dramatically cutting identity switches compared to DeepSORT.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
ByteTrack Two-Stage Association:

Stage 1: D_high = {d : score(d) >= 0.5}
  Cost C1[i,j] = IoU_distance(T[i], D_high[j])
  Hungarian on C1 → matched tracks updated, unmatched tracks preserved

Stage 2: D_low = {d : 0.1 <= score(d) < 0.5}
  T_unmatched from Stage 1
  Cost C2[i,j] = IoU_distance(T_unmatched[i], D_low[j])
  Hungarian on C2 → rescued occluded tracks

Still-unmatched tracks: survive for max_age=30 frames via KF prediction only.
Result: ByteTrack HOTA=63.1 on MOT17 vs DeepSORT HOTA=55.6 (14% improvement)
</div>
</details>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Tracker</th>
                    <th class="p-3 text-right">HOTA</th>
                    <th class="p-3 text-right">MOTA</th>
                    <th class="p-3 text-right">IDF1</th>
                    <th class="p-3 text-right">ID Switches</th>
                    <th class="p-3">Notes</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-emerald-950">
                    <td class="p-3 text-emerald-400 font-semibold">ByteTrack</td>
                    <td class="p-3 text-right text-slate-300">63.1</td>
                    <td class="p-3 text-right text-slate-300">80.3</td>
                    <td class="p-3 text-right text-slate-300">77.3</td>
                    <td class="p-3 text-right text-slate-300">2,196</td>
                    <td class="p-3 text-slate-300">No re-ID needed; drone-preferred</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">BoT-SORT</td>
                    <td class="p-3 text-right text-slate-300">65.0</td>
                    <td class="p-3 text-right text-slate-300">80.5</td>
                    <td class="p-3 text-right text-slate-300">79.5</td>
                    <td class="p-3 text-right text-slate-300">1,852</td>
                    <td class="p-3 text-slate-300">Adds camera motion compensation</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">OC-SORT</td>
                    <td class="p-3 text-right text-slate-300">63.9</td>
                    <td class="p-3 text-right text-slate-300">78.0</td>
                    <td class="p-3 text-right text-slate-300">76.4</td>
                    <td class="p-3 text-right text-slate-300">1,950</td>
                    <td class="p-3 text-slate-300">Best occlusion recovery</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">DeepSORT</td>
                    <td class="p-3 text-right text-slate-300">55.6</td>
                    <td class="p-3 text-right text-slate-300">75.2</td>
                    <td class="p-3 text-right text-slate-300">68.4</td>
                    <td class="p-3 text-right text-slate-300">6,194</td>
                    <td class="p-3 text-slate-300">Baseline; 128-d appearance CNN</td>
                </tr>
            </tbody>
        </table>
        <p class="text-slate-500 text-xs mt-1">MOT17 test set, private detector. HOTA: Luiten et al. 2021. ByteTrack: Zhang et al. 2022, arXiv:2110.06864.</p>
    </div>

    <h4>14.4.3 BoT-SORT — Camera Motion Compensation</h4>
    <p>BoT-SORT (Aharon et al., 2022, arXiv:2206.14651) adds two key innovations crucial for airborne tracking. First, camera motion compensation (CMC) estimates the homography between consecutive frames using FAST features, transforming all track predictions to account for drone-induced camera motion before computing IoU — preventing false ID switches from platform motion. Second, it fuses IoU distance with cosine appearance distance. On MOT17, BoT-SORT achieves HOTA=65.0, MOTA=80.5, making it the recommended choice when compute allows appearance features.</p>

    <h4>14.4.4 MOT Metrics — MOTA, HOTA, IDF1</h4>
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Metric</th>
                    <th class="p-3">Formula</th>
                    <th class="p-3">What It Measures</th>
                    <th class="p-3">Use When</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-semibold">MOTA</td>
                    <td class="p-3 text-slate-300 font-mono text-xs">1 − (FN+FP+IDSW) / GT</td>
                    <td class="p-3 text-slate-300">Detection coverage; ID switches barely penalized</td>
                    <td class="p-3 text-slate-300">Crowd counting, detection coverage</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-emerald-400 font-semibold">IDF1</td>
                    <td class="p-3 text-slate-300 font-mono text-xs">2·IDTP / (2·IDTP+IDFP+IDFN)</td>
                    <td class="p-3 text-slate-300">Identity persistence; heavily penalizes swaps</td>
                    <td class="p-3 text-slate-300">Surveillance, multi-camera re-ID</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-amber-400 font-semibold">HOTA</td>
                    <td class="p-3 text-slate-300 font-mono text-xs">√(DetA × AssA)</td>
                    <td class="p-3 text-slate-300">Balanced detection + association; primary since 2022</td>
                    <td class="p-3 text-slate-300">General tracker comparison</td>
                </tr>
            </tbody>
        </table>
        <p class="text-slate-500 text-xs mt-1">MOTA: Bernardin &amp; Stiefelhagen, 2008. IDF1: Ristani et al., 2016. HOTA: Luiten et al., 2021 (IJCV).</p>
    </div>

    <h3>14.5 State Estimation &amp; Filtering for Aerial Tracking</h3>
    <p>A tracker cannot run the neural network detector at 500 Hz. State estimation filters predict where the target will be between detections, enable smooth control outputs, and handle missed detections gracefully.</p>

    <h4>14.5.1 Kalman Filter — Linear Target Tracking</h4>
    <p>The Kalman filter (Kalman, 1960) is the optimal linear unbiased estimator for linear Gaussian systems. For constant-velocity tracking, the state vector is x = [px, py, pz, vx, vy, vz]^T. The predict step propagates state forward using the motion model; the update step corrects the prediction using the detector's measured position.</p>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
KF Prediction:  x_{k|k-1} = F * x_{k-1},  P_{k|k-1} = F*P*F^T + Q
KF Update:      K = P_{k|k-1} * H^T * (H*P_{k|k-1}*H^T + R)^{-1}
                x_{k|k} = x_{k|k-1} + K*(z_k - H*x_{k|k-1})
                P_{k|k} = (I - K*H) * P_{k|k-1}

Process noise Q: sigma_a^2 per axis; drone target: sigma_a = 5.0 m/s^2
Measurement noise R: sigma_pos = sigma_px * (range/f_pixels)
  Example: ±3 px at 100m, f=2000 px: sigma_pos = 0.15 m
</div>
</details>

    <h4>14.5.2 IMM — Interacting Multiple Model Estimator</h4>
    <p>The Interacting Multiple Model (IMM) estimator runs N filters in parallel (CV, CA, CTRV), each with a different motion model, and maintains probability weights for each model. During straight flight, the CV model dominates. When the target turns, the CTRV model weight rises automatically — yielding 30–50% lower RMSE than any single model during evasive maneuvering.</p>

    <h4>14.5.3 UKF — Unscented Kalman Filter for Nonlinear Geolocation</h4>
    <p>When the observation model is nonlinear (3D world position projecting to 2D pixels via perspective division), the UKF propagates 2n+1 sigma points through the exact nonlinear function, capturing second-order effects that the EKF linearization misses. The UKF is the recommended filter for combined camera + LRF tracking where bearing measurements are used directly.</p>

    <h3>14.6 Guidance Laws for Interception</h3>

    <h4>14.6.1 Proportional Navigation (PN)</h4>
    <p>PN is the dominant guidance law for real-world interception. It nulls the line-of-sight (LOS) rotation rate — if the LOS angle does not change, a collision course is guaranteed regardless of target speed.</p>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
PN Command:  a_cmd = N * V_c * lambda_dot
  N = navigation gain (3–5, typically N=4)
  V_c = closing velocity: -d/dt(||r||)
  lambda_dot = LOS angular rate: (r × v_rel) / ||r||^2

N=4 guarantees zero miss distance for non-maneuvering targets.
Augmented PN (APN): a_cmd = N*V_c*lambda_dot + (N/2)*a_target_perp
  a_target_perp from IMM CA filter state estimate
  Reduces miss distance from ~5 m to ~0.3 m vs step-maneuver target (Zarchan 2012).
</div>
</details>

    <h4>14.6.2 MPPI — Model Predictive Path Integral Control</h4>
    <p>MPPI (Williams et al., 2017, ICRA) samples thousands of control sequences on a GPU each control cycle, simulates each trajectory, and computes an information-weighted blend of low-cost trajectories. For drone target-following (not interception), MPPI handles obstacle avoidance, speed limits, and non-convex constraints that defeat PN or classical MPC.</p>

    <h3>14.7 Cascade PID and Gimbal Control</h3>
    <p>ArduCopter and PX4 implement cascade PID control: position loop (10–50 Hz) → velocity loop (50–100 Hz) → attitude loop (400 Hz) → rate loop (400–1000 Hz). For gimbal tracking, an additional outer loop converts target pixel offset to gimbal rate commands, with feed-forward from the Kalman filter velocity estimate to lead the target.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Cascade PID Loop Architecture</h4>
        <div class="flex flex-wrap items-center gap-2 text-xs">
            <div class="bg-sky-900 border border-sky-500 p-3 rounded text-center flex-1 min-w-24">
                <strong class="text-sky-400 block">Position</strong>
                <span class="text-slate-300">10–50 Hz</span><br>
                <span class="text-slate-400 text-xs">P_cmd → V_cmd</span>
            </div>
            <span class="text-slate-400 text-lg">→</span>
            <div class="bg-emerald-900 border border-emerald-500 p-3 rounded text-center flex-1 min-w-24">
                <strong class="text-emerald-400 block">Velocity</strong>
                <span class="text-slate-300">50–100 Hz</span><br>
                <span class="text-slate-400 text-xs">V_cmd → Tilt Angle</span>
            </div>
            <span class="text-slate-400 text-lg">→</span>
            <div class="bg-amber-900 border border-amber-500 p-3 rounded text-center flex-1 min-w-24">
                <strong class="text-amber-400 block">Attitude</strong>
                <span class="text-slate-300">400 Hz</span><br>
                <span class="text-slate-400 text-xs">Attitude → Rate_cmd</span>
            </div>
            <span class="text-slate-400 text-lg">→</span>
            <div class="bg-rose-900 border border-rose-500 p-3 rounded text-center flex-1 min-w-24">
                <strong class="text-rose-400 block">Rate</strong>
                <span class="text-slate-300">400–1000 Hz</span><br>
                <span class="text-slate-400 text-xs">Rate_cmd → Motor PWM</span>
            </div>
        </div>
        <p class="text-slate-400 text-xs mt-3">Gimbal pixel-tracking loop runs above the position loop at 30 Hz, converting target pixel offset to gimbal rate commands with Kalman-derived feed-forward angular rate.</p>
    </div>

    <h3>14.8 Loitering Munitions — Current Systems (2025)</h3>
    <p>Loitering munitions (LMs) — also called "kamikaze drones" or "suicide drones" — combine ISR (Intelligence, Surveillance, Reconnaissance) and precision strike in a single platform. They loiter over the target area using an EO/IR sensor to find and track targets, and then dive to engage. The operator retains abort capability right up to impact in MITL systems.</p>

    <figure class="my-6">
        <img src="images/m14_switchblade300.jpg" alt="AeroVironment Switchblade 300 in flight during U.S. Marine Corps exercise" class="rounded-lg w-full object-cover" style="max-height:420px;">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Switchblade 300 in flight during 1st ANGLICO USMC exercise, 2020. 3.7 lb munition with EO/IR sensor, 20+ min endurance, 30 km range. Source: <a href="https://commons.wikimedia.org/wiki/File:Switchblade_300_in_flight_(200902-M-EU630-1102).jpg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">U.S. Marine Corps / Wikimedia Commons (Public Domain)</a></figcaption>
    </figure>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">System</th>
                    <th class="p-3">Weight</th>
                    <th class="p-3">Endurance</th>
                    <th class="p-3">Range</th>
                    <th class="p-3">Guidance</th>
                    <th class="p-3">Target</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-semibold">AV Switchblade 300 Block 20</td>
                    <td class="p-3 text-slate-300">3.7 lb (1.7 kg)</td>
                    <td class="p-3 text-slate-300">20+ min</td>
                    <td class="p-3 text-slate-300">30 km</td>
                    <td class="p-3 text-slate-300">EO/IR + GPS/CoT, MITL</td>
                    <td class="p-3 text-slate-300">Personnel, light vehicles; EFP option for armor</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-sky-400 font-semibold">AV Switchblade 600 Block 2</td>
                    <td class="p-3 text-slate-300">~23 kg</td>
                    <td class="p-3 text-slate-300">40+ min</td>
                    <td class="p-3 text-slate-300">100+ km</td>
                    <td class="p-3 text-slate-300">EO/IR + M-code GPS, ATR, MITL</td>
                    <td class="p-3 text-slate-300">Armored vehicles, air defense systems</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-semibold">IAI Harop</td>
                    <td class="p-3 text-slate-300">135 kg</td>
                    <td class="p-3 text-slate-300">9 hr</td>
                    <td class="p-3 text-slate-300">1,000 km</td>
                    <td class="p-3 text-slate-300">Passive RF homing + EO/IR, MITL/autonomous</td>
                    <td class="p-3 text-slate-300">Radar emitters, air defense batteries</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-sky-400 font-semibold">Anduril Altius-600M</td>
                    <td class="p-3 text-slate-300">~13 kg</td>
                    <td class="p-3 text-slate-300">4+ hr</td>
                    <td class="p-3 text-slate-300">400+ km</td>
                    <td class="p-3 text-slate-300">EO/IR, AI ATR, GPS/INS, MITL</td>
                    <td class="p-3 text-slate-300">Multi-role; modular warhead</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-semibold">Teledyne FLIR MAST</td>
                    <td class="p-3 text-slate-300">&lt;5 kg</td>
                    <td class="p-3 text-slate-300">30 min</td>
                    <td class="p-3 text-slate-300">15 km</td>
                    <td class="p-3 text-slate-300">EO/IR + AI tracking</td>
                    <td class="p-3 text-slate-300">Light vehicles, personnel</td>
                </tr>
            </tbody>
        </table>
        <p class="text-slate-500 text-xs mt-1">ATR = Automatic Target Recognition. MITL = Man-In-The-Loop (operator approves each engagement). Sources: AeroVironment, IAI, Anduril public releases 2024–2025.</p>
    </div>

    <figure class="my-6">
        <img src="images/m14_switchblade600.jpg" alt="Switchblade 600 LASSO system with U.S. Army soldiers" class="rounded-lg w-full object-cover" style="max-height:480px;">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Switchblade 600 (LASSO — Low Altitude Stalking and Strike Ordnance) with U.S. Army soldiers. The Block 2 adds M-code GPS, improved comms, secondary payload bay, and automated target recognition over the original. Source: <a href="https://commons.wikimedia.org/wiki/File:Low_Altitude_Stalking_and_Strike_Ordnance_(LASSO)_(Switchblade_600).jpg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Kevin Sterling Payne / U.S. Army (Public Domain)</a></figcaption>
    </figure>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">AeroVironment Switchblade 300 Block 20 — Official Introduction</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/66DwSwHH71k" title="AeroVironment Switchblade 300 Block 20 Loitering Munition System" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-xs mt-2">Official AeroVironment introduction of the Switchblade 300 Block 20, featuring the modular EFP payload option for increased anti-armor capability. Demonstrates EO/IR targeting, CoT GPS data-link, and operator interface. (AeroVironment, April 2023)</p>
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">L3Harris WESCAM MX-15 EO/IR Targeting System</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/MOUuxITR4eA" title="L3Harris WESCAM MX-15 EO/IR Gimbal Targeting System" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-xs mt-2">L3Harris WESCAM MX-15 "Best Of" — demonstrates the EO/IR/SWIR multi-sensor 4-axis stabilized gimbal used on medium-altitude UAS including the MQ-9 Reaper. Shows target tracking, long-range identification, and laser designator capabilities. (L3Harris Technologies)</p>
    </div>

    <h3>14.9 DoD Directive 3000.09 — Autonomous Weapons Policy</h3>
    <p>DoD Directive 3000.09 "Autonomy in Weapon Systems" is the primary U.S. policy governing lethal autonomous weapon systems (LAWS). Originally issued in 2012, it was significantly updated in January 2023. Every AI engineer working on defense targeting systems must understand its requirements.</p>

    <h4>14.9.1 Weapon System Classification</h4>
    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">DoDD 3000.09: Three Human Control Tiers</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase tracking-widest block mb-2">SALWS — Semi-Autonomous</strong>
                <p class="text-slate-300 mb-2">"Human In The Loop" (MITL). The system can acquire and track targets autonomously, but a human must positively select and approve each individual engagement before the weapon fires or departs.</p>
                <p class="text-slate-400">Examples: Switchblade 300/600 (operator presses engage), Javelin (fire-and-forget after operator aims and fires), laser-guided bombs (human designates target).</p>
                <p class="text-amber-400 mt-2">Most current fielded systems. DoDD 3000.09 minimum standard.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase tracking-widest block mb-2">Human-Supervised LAWS</strong>
                <p class="text-slate-300 mb-2">"Human On The Loop" (HOTL). The system autonomously selects and engages targets, but a human operator monitors and can override or abort. The human does not approve each shot, but watches and intervenes if needed.</p>
                <p class="text-slate-400">Examples: Patriot PAC-3 in autonomous mode, Iron Dome, Samsung SGR-A1 sentry (South Korea, in supervised mode). Used in time-critical engagements (incoming missiles).</p>
                <p class="text-amber-400 mt-2">Requires USD(P) senior-level review under 2023 update.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-rose-500">
                <strong class="text-rose-400 uppercase tracking-widest block mb-2">Full LAWS</strong>
                <p class="text-slate-300 mb-2">"Human Out Of The Loop" (HOOTL). Once activated, the system independently selects, tracks, and engages targets without any human intervention for each engagement. No override capability.</p>
                <p class="text-slate-400">DoDD 3000.09 prohibits development or fielding of such systems without explicit senior DoD leadership approval. No known publicly-acknowledged U.S. systems.</p>
                <p class="text-rose-400 mt-2">Prohibited without explicit senior-level waiver. International debate ongoing.</p>
            </div>
        </div>
    </div>

    <h4>14.9.2 The 2023 Update — Key Changes</h4>
    <p>The January 2023 revision of DoDD 3000.09 significantly strengthened AI safety requirements beyond the 2012 original:</p>

    <div class="bg-slate-800 p-5 rounded border-l-4 border-sky-500 my-6 text-sm text-slate-300">
        <strong class="text-sky-400 text-base block mb-3">DoDD 3000.09 (2023) Key Requirements:</strong>
        <ul class="space-y-2">
            <li><strong class="text-white">1. Predictability &amp; Reliability:</strong> Systems must be "sufficiently robust to minimize the probability and consequences of failures that could lead to unintended engagements." Requires testing against adaptive adversaries in realistic conditions, not just benign test environments.</li>
            <li><strong class="text-white">2. Unintended Consequence Detection:</strong> AI capabilities must be "designed and engineered to fulfill their intended functions while possessing the ability to detect and avoid unintended consequences" — meaning AI must flag when it is operating outside its training distribution.</li>
            <li><strong class="text-white">3. Emergency Deactivation:</strong> Deployed systems must have "the ability to disengage or deactivate deployed systems that demonstrate unintended behavior." A human must always be able to halt the system.</li>
            <li><strong class="text-white">4. Senior Review Board:</strong> A new DoD working group of USD(P), USD(R&amp;E), and service chiefs must conduct senior-level reviews before autonomous weapon systems are formally developed or fielded. The 2023 update created this oversight body.</li>
            <li><strong class="text-white">5. Appropriate Human Judgment:</strong> "Commanders and operators must exercise appropriate levels of human judgment over the use of force." Critically, "appropriate" is context-dependent — a human-on-the-loop missile defense system engaging an incoming anti-ship missile in 4 seconds may satisfy this requirement; a loitering munition with a 20-minute dwell time must apply a higher standard.</li>
        </ul>
        <p class="text-slate-400 text-xs mt-3">Source: DoD Directive 3000.09, "Autonomy in Weapon Systems," effective January 25, 2023. <a href="https://www.esd.whs.mil/portals/54/documents/dd/issuances/dodd/300009p.pdf" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Official DoD PDF</a></p>
    </div>

    <h4>14.9.3 Engineering Implications — What DoDD 3000.09 Means for AI Developers</h4>
    <div class="insight-box">
        <div class="insight-label">POLICY → ENGINEERING REQUIREMENTS</div>
        <p class="text-slate-200 text-sm mt-1">DoDD 3000.09 is not just a policy document — it has direct engineering consequences. "Ability to detect unintended consequences" means every AI targeting module needs out-of-distribution (OOD) detection: if the neural network encounters a scene unlike its training data (a new vehicle type, unusual weather, adversarial input), it must flag uncertainty rather than silently misclassify. "Ability to disengage" means every autonomous mode must have a hardware-level kill switch that cannot be overridden by software. "Appropriate human judgment" means the latency and interface design of the human control interface (HCI) must be validated under realistic cognitive load conditions.</p>
    </div>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">DoDD 3000.09 Requirement</th>
                    <th class="p-3">Engineering Implementation</th>
                    <th class="p-3">Tools / Standards</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">Detect unintended consequences</td>
                    <td class="p-3 text-slate-300">OOD detection on detector output (confidence threshold + uncertainty estimation)</td>
                    <td class="p-3 text-slate-300">MC Dropout, Bayesian NN, DeepEnsemble</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">Emergency deactivation</td>
                    <td class="p-3 text-slate-300">Hardware RC failsafe (SBUS loss → motor cutoff), MAVLINK COMMAND_LONG/MAV_CMD_COMPONENT_ARM_DISARM</td>
                    <td class="p-3 text-slate-300">ArduPilot FS_THR_ENABLE, PX4 COM_RC_LOSS_T</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">Appropriate human judgment</td>
                    <td class="p-3 text-slate-300">MITL confirmation dialog with target image, confidence, CEP, ID. Min display time before enable. Abort capability up to X meters from target</td>
                    <td class="p-3 text-slate-300">ATAK targeting plugin, CoT FIRE/ABORT messages</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">Reliability testing</td>
                    <td class="p-3 text-slate-300">mAP on adversarial test sets (DOTA, VisDrone), false positive rate for civilian vehicles, FMEA for sensor failures</td>
                    <td class="p-3 text-slate-300">MIL-STD-882E (system safety), DO-178C (avionics SW)</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h3>14.10 Cursor on Target (CoT) Protocol</h3>
    <p>Cursor on Target (CoT) is a DoD-standard XML message format for sharing time-sensitive "what, when, where" (WWW) tactical information across military systems. Originally developed by MITRE in 2002 for the Air Force ESC, it was first demonstrated in 2003 coordinating a Predator UAS with crewed aircraft. It is now the de facto interoperability standard for U.S. and coalition C2 (Command and Control) systems.</p>

    <h4>14.10.1 CoT Message Structure</h4>
    <div class="insight-box">
        <div class="insight-label">COT: XML ENVELOPE FOR TACTICAL POSITION EVENTS</div>
        <p class="text-slate-200 text-sm mt-1">Every CoT message is an XML "event" encoding WHO (UID + type code), WHEN (three timestamps: generated, valid-start, stale), and WHERE (WGS84 lat/lon/hae + error ellipse). A targeting event from a drone's EO/IR tracker arrives as a CoT XML message on port 4242 (UDP) or via TAK Server — ground troops' ATAK apps immediately display the target with an icon at the reported coordinates. The "stale" timestamp (typically 30 seconds for a moving target) causes the icon to disappear automatically if no update arrives, preventing stale fire-control data from lingering on operator displays.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
CoT XML Event Structure (base schema):

&lt;event version="2.0"
       uid="drone-14-track-0042"
       type="a-h-G-E-V-C"     &lt;!-- type tree: affiliation-battleDimension-... --&gt;
       how="m-g"               &lt;!-- machine-generated --&gt;
       time="2025-03-15T14:22:31Z"
       start="2025-03-15T14:22:31Z"
       stale="2025-03-15T14:23:01Z"&gt;

    &lt;point lat="36.500827"
           lon="-116.497634"
           hae="0.0"          &lt;!-- height above WGS84 ellipsoid, meters --&gt;
           ce="3.0"           &lt;!-- circular error (CEP), meters --&gt;
           le="5.0"/&gt;         &lt;!-- linear (vertical) error, meters --&gt;

    &lt;detail&gt;
        &lt;contact callsign="TGT-042"/&gt;
        &lt;track speed="8.3" course="245"/&gt;   &lt;!-- m/s, degrees true --&gt;
        &lt;sensor fov="8.5" vfov="6.4"
                azimuth="245" range="262"
                elevation="-35"/&gt;            &lt;!-- gimbal state --&gt;
        &lt;remarks&gt;Vehicle, moving SW, confidence HIGH&lt;/remarks&gt;
    &lt;/detail&gt;
&lt;/event&gt;

Type Classification (MIL-STD-2525B derived):
  a = atoms (real-world entity)
  h = hostile   f = friendly   n = neutral   u = unknown
  A = Air   G = Ground   S = Surface (sea)   U = Subsurface
  E = Equipment   V = Vehicle   C = Civilian vehicle... etc.

Common target types:
  a-h-G-E-V-C    Hostile Ground Equipment Vehicle Civilian
  a-h-G-E-V-A    Hostile Ground Equipment Vehicle Armored
  a-h-G-I        Hostile Ground Infantry
  a-u-G          Unknown Ground (generic)
  a-f-G-U-C      Friendly Ground Unit Combat (own forces)

Transport: UDP multicast (239.2.3.1:6969 default), TCP to TAK Server,
           WebSocket (WinTAK/ATAK), or XMPP (federated TAK network)
</div>
</details>

    <h4>14.10.2 CoT in the Targeting Loop</h4>
    <p>A complete CoT targeting chain works as follows: (1) The drone's AI tracker geolocates the target using LRF or ray-casting; (2) A CoT event is published via UDP to the local TAK Server; (3) The TAK Server distributes the event to all subscribed users (ATAK on Android, WinTAK on Windows, WebTAK in browser); (4) A ground force commander with ATAK sees the target icon appear on their map with callsign, speed, heading, and CEP circle; (5) The commander can "lase" the target (designate via ATAK) and transmit a fire control CoT message back to the drone for engagement confirmation.</p>

    <div class="bg-slate-800 p-4 rounded border-l-4 border-purple-500 text-sm text-slate-300 my-4">
        <strong class="text-purple-400 block mb-2">CoT Fire Mission Flow (9-Line equivalent via ATAK):</strong>
        <ol class="space-y-1 list-decimal list-inside">
            <li>Drone detects target → CoT event (type "a-u-G-E-V") published to TAK Server</li>
            <li>JTAC (Joint Terminal Attack Controller) sees target on ATAK, confirms hostile via visual/pattern-of-life analysis</li>
            <li>JTAC updates CoT type to "a-h-G-E-V-A" (hostile) and adds 9-line target description in &lt;remarks&gt;</li>
            <li>Fire control authority approves engagement — MITL confirmation in ATAK targeting plugin</li>
            <li>Loitering munition receives engage CoT (or operator confirms via thumbstick) — weapon guides to lat/lon</li>
            <li>Post-engagement BDA (Battle Damage Assessment) CoT event published with target confirmation</li>
        </ol>
    </div>

    <h3>14.11 NATO STANAG 4586 — UAV Interoperability Standard</h3>
    <p>STANAG 4586 "Standard Interfaces of UAV Control System (UCS) for NATO UAV Interoperability" defines the architecture, interfaces, and message formats that allow any NATO UAV to be controlled by any NATO-compatible Ground Control Station (GCS). It is the foundational interoperability standard for coalition UAV operations.</p>

    <h4>14.11.1 Architecture Overview</h4>
    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">STANAG 4586 Interface Architecture</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase tracking-widest block mb-2">Core UCS Components</strong>
                <ul class="text-slate-300 space-y-1">
                    <li><strong>DLI (Data Link Interface):</strong> standardizes uplink/downlink between GCS and UAV. DLI-1: NATO C2 IP (MIL-STD-3011), DLI-2: legacy narrowband</li>
                    <li><strong>HCI (Human Control Interface):</strong> standardizes operator displays, controls, and alerts. Enables any qualified operator to use any NATO GCS</li>
                    <li><strong>BLOS (Beyond Line of Sight) Interface:</strong> satellite and relay routing standardization</li>
                    <li><strong>External C2 Interface (CI-1/CI-2):</strong> connects UCS to higher-level C2 systems; CI-1 uses CoT protocol natively for target/track sharing</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase tracking-widest block mb-2">Levels of Interoperability (LOI)</strong>
                <ul class="text-slate-300 space-y-1">
                    <li><strong>LOI 1:</strong> Receive and display UAV sensor data only (no C2)</li>
                    <li><strong>LOI 2:</strong> Receive/display and control the payload (gimbal, sensor)</li>
                    <li><strong>LOI 3:</strong> Control the flight path (waypoints, loiter commands)</li>
                    <li><strong>LOI 4:</strong> Take-off and landing control</li>
                    <li><strong>LOI 5:</strong> Full autonomous and emergency control</li>
                    <li class="text-slate-400 mt-1">Most coalition sharing is LOI 1–2 (watch and cueing); LOI 3–5 requires bilateral agreements</li>
                </ul>
            </div>
        </div>
        <p class="text-slate-400 text-xs mt-3">STANAG 4586 is implemented on: General Atomics MQ-9 Reaper, Northrop Grumman RQ-4 Global Hawk, IAI Heron, Textron Systems Shadow. Source: <a href="https://www.sto.nato.int/document/stanag-4586-standard-interfaces-of-uav-control-system-ucs-for-nato-uav-interoperability/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">NATO STO STANAG 4586 documentation</a></p>
    </div>

    <h3>14.12 ATAK — Android Team Awareness Kit</h3>
    <p>ATAK (Android Team Awareness Kit) is the U.S. military's primary tactical situational awareness application for Android. Developed by the Air Force Research Laboratory in 2010, open-sourced in 2020 via the Defense Digital Service GitHub, ATAK runs on commercial Android smartphones and tablets — transforming a $500 device into a military-grade C2 terminal. As of 2022, ATAK had 250,000+ users across DoD, interagency, and partner nations.</p>

    <h4>14.12.1 ATAK Targeting Integration</h4>
    <div class="insight-box">
        <div class="insight-label">ATAK: THE COMMON OPERATING PICTURE ON A SMARTPHONE</div>
        <p class="text-slate-200 text-sm mt-1">ATAK displays all tactical information on a zoomable map: friendly positions (from GPS), enemy targets (from CoT events), drone video feeds, sensor footprints, and fire missions. A UAS operator plugin allows ATAK to display the drone's current position and gimbal field-of-view as a wedge overlay on the map. When the drone's AI tracker geolocates a target, the target's CoT event appears instantly on every ATAK user's map in the network — enabling a ground force commander to see the drone's targeting picture in real time without radio voice calls.</p>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">ATAK Drone Integration Capabilities (2024–2025)</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-2">UAS Plugin Capabilities</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>Live drone position on map (CoT "a-f-A-M-F-R" type)</li>
                    <li>Gimbal Field-of-View wedge overlay</li>
                    <li>Live video feed embedded in ATAK sidebar (RTSP stream)</li>
                    <li>Click-to-waypoint: tap the ATAK map → drone flies to that point</li>
                    <li>Target CoT generation from drone EO/IR tracker</li>
                    <li>Grid fire mission request (9-Line format in CoT remarks)</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 block mb-2">CoT Flow in ATAK</strong>
                <ul class="text-slate-300 space-y-1">
                    <li>TAK Server (ATAK-TS): central CoT router and persistence store</li>
                    <li>FreeTAKServer (open-source): Python-based, runs on Raspberry Pi</li>
                    <li>MANET radios: Persistent Systems MPU5, L3Harris WAVESAT — distribute CoT over mesh without internet</li>
                    <li>CIV-TAK: civilian version for SAR and disaster response</li>
                    <li>WinTAK: Windows GCS version for drone operators</li>
                    <li>AI integration (2025): ML-based target classification results annotated in CoT &lt;detail&gt; blocks</li>
                </ul>
            </div>
        </div>
    </div>

    <h4>14.12.2 ATAK + Drone + CoT: End-to-End Architecture</h4>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
Complete ATAK Targeting Architecture (sUAS + CoT + ATAK):

Drone (Jetson Orin NX):
  Camera → YOLOv8 detector → ByteTrack tracker
  → Geolocation (LRF + gimbal angles) → WGS84 target position
  → CoT XML event generation (Python cot library)
  → UDP multicast to 239.2.3.1:6969 (local mesh network)
  OR → TCP to TAK Server (via LTE/satcom)

TAK Server (cloud or forward-deployed):
  → Receives CoT event
  → Forwards to all subscribers (ATAK Android, WinTAK GCS, WebTAK)
  → Persists target history for BDA
  → Geo-fence alerts: if target enters/exits defined zone

ATAK on Ground Operator Android (Samsung Galaxy S24 + MANET radio):
  → Target icon appears on map at CoT lat/lon
  → Icon shape encodes type (vehicle, person, aircraft)
  → Color encodes affiliation (red=hostile, blue=friendly, yellow=unknown)
  → CEP circle shows geolocation accuracy
  → Tap icon → 9-Line fire mission panel
  → Confirm engagement → CoT "fire" message to drone

Python CoT generation (pymavlink + cot-python):
  import cot
  event = cot.Event(
      uid="drone14-tgt-0042",
      event_type="a-h-G-E-V-A",
      lat=36.500827, lon=-116.497634, hae=0.0,
      ce=3.0, le=5.0,
      stale_delta=30  # seconds before icon disappears
  )
  event.detail.track = cot.Track(speed=8.3, course=245)
  event.detail.remarks = "Hostile vehicle, moving SW, HIGH confidence"
  udp_socket.sendto(event.to_xml().encode(), ("239.2.3.1", 6969))
</div>
</details>

    <h3>14.13 Sensor Fusion for Robust Targeting</h3>

    <h4>14.13.1 EO + IR Fusion</h4>
    <p>EO cameras fail at night, in smoke, and in glare. Thermal IR detects heat through haze and darkness but lacks texture for re-identification. Fusing both provides all-weather robustness. Decision-level fusion (run separate detectors, merge bounding box lists) is simplest. Feature-level (deep) fusion — concatenating CNN feature maps from both modalities before the detection head — improves mAP by 8–12% on FLIR ADAS benchmarks. Attention-based cross-modal fusion (CFT, Qingyun et al., 2021) achieves SOTA on KAIST multi-spectral pedestrian dataset.</p>

    <h4>14.13.2 Radar + Vision Fusion</h4>
    <p>Radar provides accurate range (±10 cm) and Doppler velocity through weather, but poor angular resolution (±0.5°). Camera provides accurate angles (±0.05°) but no range. A Kalman filter in polar coordinates fuses both: radar updates range/range-rate rows; camera updates azimuth/elevation rows. The result: a full 3D track with centimeter-level range and millidegree-level angular accuracy.</p>

    <h4>14.13.3 Covariance Intersection — Multi-UAV Track Fusion</h4>
    <p>When multiple UAVs each maintain their own tracker, CI (Covariance Intersection, Julier &amp; Uhlmann, 1997) safely fuses their track estimates without assuming they are independent — the combined covariance is guaranteed to be conservative regardless of unknown inter-sensor correlations that could cause filter divergence if naively averaged.</p>

    <h3>14.14 Real-World Implementation Stack</h3>

    <h4>14.14.1 End-to-End Latency Budget</h4>
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Pipeline Stage</th>
                    <th class="p-3 text-right">Typical Latency</th>
                    <th class="p-3">Notes</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-slate-300">Camera exposure + readout</td><td class="p-3 text-right text-slate-300">35–38 ms</td><td class="p-3 text-slate-400">1/30 s frame + rolling shutter</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-slate-300">ISP + CSI-2 / USB transfer</td><td class="p-3 text-right text-slate-300">1–15 ms</td><td class="p-3 text-slate-400">MIPI CSI-2: 1 ms; USB3: 15 ms</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-slate-300">YOLOv8m GPU inference (TensorRT FP16)</td><td class="p-3 text-right text-slate-300">10–30 ms</td><td class="p-3 text-slate-400">Jetson Orin NX: 16 ms; Hailo-8: 12 ms</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-slate-300">ByteTrack + Kalman filter update</td><td class="p-3 text-right text-slate-300">0.5–1 ms</td><td class="p-3 text-slate-400">CPU-bound, negligible</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-slate-300">LRF geolocation + CoT generation</td><td class="p-3 text-right text-slate-300">0.5–2 ms</td><td class="p-3 text-slate-400">Matrix multiply + XML encode</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-slate-300">MAVLink serial (921600 baud)</td><td class="p-3 text-right text-slate-300">1–5 ms</td><td class="p-3 text-slate-400">26-byte message</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-slate-300">FC command processing + ESC PWM</td><td class="p-3 text-right text-slate-300">4–8 ms</td><td class="p-3 text-slate-400">1 kHz FC loop + 400 Hz ESC</td></tr>
                <tr class="bg-slate-900"><td class="p-3 text-slate-300">Rotor mechanical response</td><td class="p-3 text-right text-slate-300">50–150 ms</td><td class="p-3 text-slate-400">Motor time constant; dominates</td></tr>
                <tr class="bg-amber-950 border border-amber-800"><td class="p-3 text-amber-300 font-semibold">TOTAL (photons to rotors)</td><td class="p-3 text-right text-amber-300 font-semibold">110–350 ms</td><td class="p-3 text-amber-400">At 5 m/s: 0.55–1.75 m position lag</td></tr>
            </tbody>
        </table>
    </div>

    <h4>14.14.2 ROS 2 Integration Architecture</h4>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
ROS 2 Targeting Node Graph:

/camera_node          → /detector_node (YOLOv8 inference)
/detector_node        → /tracker_node (ByteTrack + LRF geolocation + CoT)
/tracker_node         → /guidance_node (PN or MPPI) + CoT UDP publisher
/guidance_node        → /mavros/setpoint_raw/local (velocity setpoints @ 30 Hz)
/cot_publisher_node   → UDP multicast 239.2.3.1:6969 (ATAK ground feed)
/mavros_node          → MAVLink UART TELEM2 921600 baud → Flight Controller

Key: tracker_node subscribes to both /detections AND /mavros/local_position/pose
     (drone GPS + attitude) to perform geolocation and CoT generation in one step.

Gimbal control via MAVLink (COMMAND_LONG / MAV_CMD_DO_MOUNT_CONTROL):
  param1 = target_pitch (degrees, -90 to 0 for depression)
  param2 = target_roll  (degrees, typically 0)
  param7 = target_yaw   (degrees, absolute NED or relative to drone nose)
  coordinate_system = MAV_MOUNT_MODE_GPS_POINT for ROI tracking
</div>
</details>

    <div class="bg-slate-800 p-5 rounded border-l-4 border-sky-500 mt-8 text-sm text-slate-300">
        <strong class="text-sky-400 text-base block mb-3">Module Summary: The Full Targeting Stack</strong>
        <p class="mb-2">A complete airborne AI targeting system integrates:</p>
        <ol class="space-y-1 list-decimal list-inside text-slate-300">
            <li><strong class="text-white">Gimbal:</strong> 3-axis stabilized EO/IR platform (SToRM32 / BaseCam BGC) with brushless motors + magnetic encoders, IMU rate feedback at 400–1000 Hz, ROI/GPS tracking mode</li>
            <li><strong class="text-white">Payload:</strong> LWIR microbolometer (uncooled, low-SWaP) + HD EO camera + optional LRF for direct geolocation</li>
            <li><strong class="text-white">Detection:</strong> YOLOv8 or similar at 20–60 FPS on Jetson Orin NX (TensorRT FP16)</li>
            <li><strong class="text-white">Tracking:</strong> ByteTrack or BoT-SORT maintaining persistent target identity across frames with Kalman filter state estimation</li>
            <li><strong class="text-white">Geolocation:</strong> LRF slant range + gimbal encoders + drone GPS/attitude → WGS84 target coordinates → MGRS → CoT event; CEP 0.5–3 m depending on GPS accuracy</li>
            <li><strong class="text-white">Guidance:</strong> Proportional Navigation (interception) or MPPI (constrained following) → MAVLink velocity setpoints</li>
            <li><strong class="text-white">C2 Integration:</strong> CoT XML events → TAK Server → ATAK operator displays; STANAG 4586 for NATO coalition interoperability</li>
            <li><strong class="text-white">Policy compliance:</strong> DoDD 3000.09 MITL design (human approves each engagement), OOD detection, hardware kill switch, senior review board for LAWS/supervised-LAWS systems</li>
        </ol>
        <p class="text-slate-400 text-xs mt-3">
            External references:
            <a href="https://www.esd.whs.mil/portals/54/documents/dd/issuances/dodd/300009p.pdf" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 mr-3">DoDD 3000.09 (PDF)</a>
            <a href="https://www.avinc.com/solution/switchblade-300-block-20/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 mr-3">Switchblade 300 Block 20</a>
            <a href="https://www.l3harris.com/all-capabilities/wescam-mx-series" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 mr-3">L3Harris WESCAM MX-Series</a>
            <a href="https://www.civtak.org/atak-about/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 mr-3">ATAK Overview</a>
            <a href="https://en.wikipedia.org/wiki/Department_of_Defense_Directive_3000.09" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">DoDD 3000.09 Wikipedia</a>
        </p>
    </div>
</div>
`;
