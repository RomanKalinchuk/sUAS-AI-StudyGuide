export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 5</span>
    <h2>Flight Controller Architecture & Flight Modes</h2>
    <p>The flight controller is the drone's brainstem — a dedicated hard-real-time embedded computer that runs PID control loops at 400Hz and must never, under any circumstances, miss a scheduling deadline. This module dissects the autopilot hardware, the full PID cascade from position to motor, every ArduPilot flight mode, and the failsafe architecture that determines whether a drone returns home or falls out of the sky.</p>

    <h3>5.1 Autopilot Hardware</h3>
    <p>Modern open-source autopilots are built around the STM32H7 series microcontroller — a Cortex-M7 core running at 480MHz with a double-precision FPU, enabling the floating-point PID math required for 400Hz attitude control without compromising loop timing.</p>

    <div class="space-y-6 mb-8">
        <div class="hw-card p-8 rounded-xl">
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                Pixhawk 6X <span class="ml-4 text-xs bg-sky-900/50 text-sky-400 px-3 py-1 rounded border border-sky-800">FLAGSHIP OPEN HARDWARE</span>
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mt-4">
                <div class="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-slate-300">
                    <strong class="text-sky-400 block mb-2">Processor</strong>
                    <ul class="space-y-1">
                        <li>> FMU: STM32H753IIK6, 480MHz, Cortex-M7 + FPU</li>
                        <li>> I/O Coprocessor: STM32F103 (handles PWM outputs independently; if FMU crashes, IO continues outputting last safe command)</li>
                        <li>> RAM: 1MB SRAM (FMU), 192KB CCM</li>
                        <li>> Flash: 2MB (FMU)</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-slate-300">
                    <strong class="text-sky-400 block mb-2">IMU Redundancy — Triple IMU</strong>
                    <ul class="space-y-1">
                        <li>> IMU1: ICM-42688-P (6-axis, 32kHz gyro ODR)</li>
                        <li>> IMU2: ICM-20649 (6-axis, high-g ±70g accelerometer)</li>
                        <li>> IMU3: ICM-42670-P (6-axis, low-noise)</li>
                        <li>> Mag: RM3100 (industrial I²C magnetometer)</li>
                        <li>> Baro: ICP20100 (primary) + MS5611 (secondary)</li>
                        <li>> Triple IMU voting: ArduPilot compares all 3; if one diverges by &gt;5% for &gt;1s, it is excluded</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="hw-card p-8 rounded-xl">
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                Cube Orange+ <span class="ml-4 text-xs bg-amber-900/50 text-amber-400 px-3 py-1 rounded border border-amber-800">AEROSPACE VIBRATION ISOLATION</span>
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mt-4">
                <div class="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-slate-300">
                    <ul class="space-y-1">
                        <li>> FMU: STM32H753, 480MHz Cortex-M7</li>
                        <li>> IMU1: ICM-42688-P (internally isolated on dampened PCB)</li>
                        <li>> IMU2: ICM-20649</li>
                        <li>> IMU3: ICM-42688-P (on the outer "standard" carrier — exposed to vibration for comparison)</li>
                        <li>> Vibration isolation: 3-axis silicone isolators, resonance ~100Hz</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-slate-300">
                    <strong class="text-amber-400 block mb-2">Why Isolation Matters</strong>
                    <ul class="space-y-1">
                        <li>> Motor vibration: 50–500Hz depending on RPM</li>
                        <li>> Gyro aliasing: if vibration frequency = control loop rate / 2, aliasing creates DC offset in gyro reading</li>
                        <li>> Symptom: drone oscillates uncontrollably despite good PID tuning</li>
                        <li>> Cube Orange+ isolates IMU1 from this; ArduPilot preferentially uses isolated IMU1 for attitude control</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="hw-card p-8 rounded-xl">
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                Holybro Durandal <span class="ml-4 text-xs bg-purple-900/50 text-purple-400 px-3 py-1 rounded border border-purple-800">HIGH-I/O COUNT</span>
            </h4>
            <div class="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-slate-300 text-sm">
                <ul class="space-y-1">
                    <li>> FMU: STM32H743, 480MHz Cortex-M7</li>
                    <li>> IMUs: ICM-20689, BMI088 (2 IMU — not triple)</li>
                    <li>> 13 PWM servo outputs (vs 8 on Pixhawk 6X standard) — useful for large VTOL with many actuators</li>
                    <li>> Integrated 8-channel IMU vibration logging to SD card at 4kHz — critical for tuning notch filters</li>
                    <li>> Limitation: only 2 IMUs means less voting redundancy</li>
                </ul>
            </div>
        </div>
    </div>

    <div class="bg-slate-900 p-6 rounded border border-slate-700 mb-8">
        <strong class="text-sky-400 text-base block mb-3">ChibiOS RTOS — Why Not Linux?</strong>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
                <p class="text-slate-400 mb-2">ArduPilot fully migrated from NuttX to <strong class="text-white">ChibiOS</strong> in late 2018/early 2019. NuttX is no longer supported in any current ArduPilot build. ArduPilot maintains its own fork at <code>github.com/ArduPilot/ChibiOS</code>, tracked by commit rather than release tag. (PX4 continues to use NuttX.)</p>
                <ul class="space-y-1 font-mono text-xs">
                    <li>> Priority-based preemptive scheduler (up to 256 priority levels)</li>
                    <li>> Deterministic context switch time: &lt;1µs on Cortex-M7</li>
                    <li>> Worst-case interrupt latency: &lt;5µs (deterministic)</li>
                    <li>> Smaller flash footprint and lower CPU overhead vs NuttX — ArduPilot devs reported "huge drop in CPU usage and big reduction in flash size" after the switch</li>
                    <li>> No dynamic memory allocation in flight-critical paths — avoids heap fragmentation and non-deterministic alloc time</li>
                </ul>
            </div>
            <div>
                <p class="text-slate-400 mb-2">Linux (on Raspberry Pi, Jetson) is explicitly NOT used as the flight controller OS:</p>
                <ul class="space-y-1 font-mono text-xs">
                    <li>> Linux scheduler: "soft" real-time with SCHED_FIFO. Worst-case latency: 500µs–10ms due to kernel page faults, interrupt coalescing, and power management</li>
                    <li>> A 10ms jitter at 400Hz control rate = a missed control cycle = attitude instability</li>
                    <li>> Linux kernel can preempt any user task for I/O interrupts, cache misses, TLB flushes</li>
                    <li>> ChibiOS: task scheduling guaranteed within single-digit microseconds, every cycle, deterministically</li>
                </ul>
            </div>
        </div>
    </div>

    <h3>5.2 The Full Cascaded PID Control Loop</h3>
    <p>The flight control stack is a cascade of nested PID loops. Each outer loop's output becomes the setpoint (reference) for the next inner loop. This architecture is why a drone can hold GPS position while simultaneously maintaining attitude stability in wind — different loops handle different physical variables at different frequencies.</p>

    <div class="math-block">
        <strong>Full PID Cascade — Position to Motor Output</strong><br><br>

        LAYER 1: Position Controller (50Hz)
        ─────────────────────────────────────────────────────────────────
        Input:   GPS position error (meters North/East/Down in NED frame)
        Process: P controller only (I and D destabilize at this level)
        Output:  Velocity setpoint (m/s) → fed to Velocity Controller
        Param:   PSC_POSXY_P (default ~1.0), PSC_POSZ_P<br><br>

        LAYER 2: Velocity Controller (50Hz)
        ─────────────────────────────────────────────────────────────────
        Input:   Velocity error = velocity_setpoint − current_velocity (from EKF)
        Process: PID — I term accumulates steady-state wind drift error
        Output:  Acceleration setpoint (m/s²) → converted to lean angle (attitude) setpoint
        Math:    lean_angle = atan2(acc_setpoint, GRAVITY). Capped at ATC_ANGLE_MAX (default 30°)
        Param:   PSC_VELXY_P, PSC_VELXY_I, PSC_VELXY_D<br><br>

        LAYER 3: Attitude Controller (400Hz)
        ─────────────────────────────────────────────────────────────────
        Input:   Attitude error = desired_quaternion × inverse(current_quaternion)
        Process: P controller on attitude quaternion error (Slerp-based)
        Output:  Angular rate setpoint (deg/s) → fed to Rate Controller
        Note:    Uses quaternion math to avoid gimbal lock issues with Euler angles
        Param:   ATC_ANG_RLL_P, ATC_ANG_PIT_P, ATC_ANG_YAW_P (defaults ~4.5)<br><br>

        LAYER 4: Rate Controller (400Hz) ← The innermost, most critical loop
        ─────────────────────────────────────────────────────────────────
        Input:   Rate error = desired_rate − gyro_rate (direct IMU reading)
        Process: Full PID + D-term low-pass filter (to suppress gyro noise)
        Output:  Motor mixing matrix inputs (roll, pitch, yaw torque + throttle)
        Param:   ATC_RAT_RLL_P, ATC_RAT_RLL_I, ATC_RAT_RLL_D (most tuning effort here)
        D-filter: ATC_RAT_RLL_FLTD (default 20Hz cutoff on D term)<br><br>

        LAYER 5: Motor Mixer → ESC Output
        ─────────────────────────────────────────────────────────────────
        Input:   [Roll, Pitch, Yaw, Throttle] torque/thrust commands
        Process: Motor mixing matrix (geometry-dependent, e.g., X-frame quad)
          Motor1(FL) = Throttle + Roll - Pitch + Yaw
          Motor2(FR) = Throttle - Roll - Pitch - Yaw
          Motor3(BL) = Throttle + Roll + Pitch - Yaw
          Motor4(BR) = Throttle - Roll + Pitch + Yaw
        Output:  Per-motor PWM duty cycle or DSHOT value (0–2047)
        Scaling: Linear mapping, clamped to [MOT_SPIN_MIN, MOT_SPIN_MAX]
    </div>

    <div class="bg-slate-900 p-6 rounded border border-slate-700 mb-8 text-sm">
        <strong class="text-sky-400 block mb-3">Loop Frequency Architecture — Why Different Rates?</strong>
        <table class="w-full font-mono text-xs">
            <thead><tr class="text-slate-400"><th class="text-left pb-2 pr-4">Loop</th><th class="text-left pb-2 pr-4">Rate</th><th class="text-left pb-2">Reason for Rate</th></tr></thead>
            <tbody class="text-slate-300">
                <tr><td class="py-1 pr-4">Position</td><td class="py-1 pr-4 text-amber-400">50Hz</td><td class="py-1">GPS updates at 5–10Hz; EKF fuses at 50Hz. Running faster wastes CPU on stale data.</td></tr>
                <tr><td class="py-1 pr-4">Velocity</td><td class="py-1 pr-4 text-amber-400">50Hz</td><td class="py-1">EKF velocity output rate. Velocity dynamics are slower than attitude (seconds vs milliseconds).</td></tr>
                <tr><td class="py-1 pr-4">Attitude</td><td class="py-1 pr-4 text-emerald-400">400Hz</td><td class="py-1">Attitude dynamics have bandwidth ~10–20Hz. Nyquist requires &gt;40Hz sampling. 400Hz provides 20× margin for stability.</td></tr>
                <tr><td class="py-1 pr-4">Rate (Gyro)</td><td class="py-1 pr-4 text-emerald-400">400Hz</td><td class="py-1">Gyro bandwidth ~200Hz. Control bandwidth target: 30–60Hz. 400Hz loop = 6.7× Nyquist of control bandwidth.</td></tr>
                <tr><td class="py-1 pr-4">ESC (DSHOT)</td><td class="py-1 pr-4 text-emerald-400">400Hz</td><td class="py-1">One DSHOT frame per control cycle. Motor electrical time constant ~5–15ms is well within this.</td></tr>
            </tbody>
        </table>
    </div>

    <h3>5.3 ArduPilot Flight Modes (Copter)</h3>
    <p>ArduPilot Copter (AC) implements a hierarchy of flight modes. Each mode activates different layers of the PID cascade. Understanding exactly what each mode controls — and what the pilot controls — is essential for AI integration design.</p>

    <div class="space-y-4 mb-8">
        <div class="bg-slate-900 p-5 rounded border border-slate-700 text-sm">
            <div class="flex items-start justify-between">
                <strong class="text-white text-base">STABILIZE</strong>
                <span class="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">FLTMODE1=0</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-slate-300 font-mono text-xs">
                <div><strong class="text-sky-400">Pilot controls:</strong> Roll angle, Pitch angle, Yaw rate, Throttle (direct)<br>FC controls: Rate loop only — gyroscope stabilization</div>
                <div><strong class="text-sky-400">Active loops:</strong> Rate controller only (Layer 4). No position, velocity, or attitude setpoint — pilot provides the attitude target directly via stick position.<br><span class="text-amber-400">No altitude hold. Release throttle stick → drone descends.</span></div>
            </div>
        </div>

        <div class="bg-slate-900 p-5 rounded border border-slate-700 text-sm">
            <div class="flex items-start justify-between">
                <strong class="text-white text-base">ALT_HOLD</strong>
                <span class="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">FLTMODE1=2</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-slate-300 font-mono text-xs">
                <div><strong class="text-sky-400">Pilot controls:</strong> Roll angle, Pitch angle, Yaw rate, Climb/descent rate (not absolute throttle)<br>FC controls: Altitude (barometer + accel fusion), attitude, rate</div>
                <div><strong class="text-sky-400">Active loops:</strong> Attitude + Rate + Altitude (vertical velocity PID).<br>Horizontal position: <span class="text-red-400">NOT controlled</span> — drone drifts with wind. Requires pilot correction.<br>Param: PILOT_SPEED_UP (max climb rate m/s)</div>
            </div>
        </div>

        <div class="bg-slate-900 p-5 rounded border border-slate-700 text-sm">
            <div class="flex items-start justify-between">
                <strong class="text-white text-base">LOITER</strong>
                <span class="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">FLTMODE1=5</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-slate-300 font-mono text-xs">
                <div><strong class="text-sky-400">Pilot controls:</strong> Velocity (stick = velocity setpoint, not angle). Centered stick = hold position.<br>FC controls: GPS position hold, altitude hold, attitude, rate</div>
                <div><strong class="text-sky-400">Active loops:</strong> All layers active (full cascade).<br>Requires: GPS lock (EKF position valid). Drift: &lt;1m in calm wind.<br>Param: LOIT_SPEED (max horizontal speed when stick deflected, cm/s)</div>
            </div>
        </div>

        <div class="bg-slate-900 p-5 rounded border border-slate-700 text-sm">
            <div class="flex items-start justify-between">
                <strong class="text-white text-base">POSHOLD</strong>
                <span class="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">FLTMODE1=16</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-slate-300 font-mono text-xs">
                <div><strong class="text-sky-400">Pilot controls:</strong> At low stick: lean angle (like STABILIZE). At high stick: velocity (like LOITER). Blends between the two based on stick position.</div>
                <div><strong class="text-sky-400">Why it exists:</strong> LOITER feels "mushy" at high speeds because velocity targets limit responsiveness. POSHOLD gives direct control feel at speed while automatically holding position at hover. Preferred by advanced FPV pilots needing GPS fallback.</div>
            </div>
        </div>

        <div class="bg-slate-900 p-5 rounded border border-slate-700 text-sm">
            <div class="flex items-start justify-between">
                <strong class="text-white text-base">AUTO</strong>
                <span class="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">FLTMODE1=3</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-slate-300 font-mono text-xs">
                <div><strong class="text-sky-400">Pilot controls:</strong> Nothing (mode switch, emergency override only).<br>FC controls: Executes pre-uploaded mission (waypoints, DO_ commands, survey grids).</div>
                <div><strong class="text-sky-400">Active loops:</strong> All layers. Mission waypoints are fed as position targets into the position controller. DO_CHANGE_SPEED commands modify WPNAV_SPEED parameter in flight. Supports: LOITER_TURNS, LAND, RTL, SET_ROI commands.</div>
            </div>
        </div>

        <div class="bg-sky-900/30 p-5 rounded border border-sky-700/60 text-sm">
            <div class="flex items-start justify-between">
                <strong class="text-sky-300 text-base">GUIDED ← Critical for AI Companion Computer Integration</strong>
                <span class="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">FLTMODE1=4</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-slate-300 font-mono text-xs">
                <div><strong class="text-sky-400">Pilot controls:</strong> Mode switch only.<br>FC controls: Executes real-time position, velocity, or acceleration targets received via MAVLink from the Companion Computer (CC).</div>
                <div>
                    <strong class="text-sky-400">MAVLink messages the CC can send:</strong>
                    <ul class="space-y-1 mt-1">
                        <li>SET_POSITION_TARGET_LOCAL_NED (MSG #84): position + velocity + acceleration targets in NED frame. Type mask selects which fields are active.</li>
                        <li>SET_POSITION_TARGET_GLOBAL_INT (MSG #86): lat/lon/alt targets in WGS-84.</li>
                        <li>SET_ATTITUDE_TARGET (MSG #82): direct attitude quaternion + thrust override (bypasses position/velocity loops).</li>
                    </ul>
                </div>
            </div>
            <div class="mt-3 p-3 bg-sky-900/20 rounded text-xs font-mono text-slate-300">
                <strong class="text-sky-400">Example: AI sends position + velocity feedforward target to GUIDED mode</strong><br>
                The type_mask field is a 16-bit bitmask. Setting a bit to 1 IGNORES that field.<br>
                type_mask = 0b0000111111000111 = ignore yaw, yaw_rate, acceleration. Use position + velocity.<br>
                The velocity feedforward (vx, vy, vz) reduces the lag of the position controller by ~80% in dynamic tracking scenarios.
            </div>
        </div>
    </div>

    <div class="bg-slate-900 p-6 rounded border border-slate-700 mb-8 text-sm">
        <strong class="text-sky-400 text-base block mb-3">Flight Mode Configuration Parameters</strong>
        <div class="font-mono text-xs text-slate-300 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p>FLTMODE1 through FLTMODE6: map 6-position RC switch positions to flight mode numbers.<br>
                FLTMODE_CH: which RC channel carries the mode switch (default CH5).</p>
                <p>Example config for AI drone:<br>
                FLTMODE1 = 0  (STABILIZE — manual emergency override)<br>
                FLTMODE2 = 2  (ALT_HOLD — manual flight with altitude)<br>
                FLTMODE3 = 5  (LOITER — GPS hold)<br>
                FLTMODE4 = 4  (GUIDED — AI control)<br>
                FLTMODE5 = 3  (AUTO — pre-planned mission)<br>
                FLTMODE6 = 6  (RTL — return to launch)</p>
            </div>
            <div>
                <p>Serial port configuration for Companion Computer MAVLink:</p>
                <p>SERIAL2_PROTOCOL = 2  (MAVLink2)<br>
                SERIAL2_BAUD = 921600  (max standard UART baud)<br>
                SR2_POSITION = 10  (stream position at 10Hz to CC)<br>
                SR2_EXTRA1 = 50  (stream attitude at 50Hz)<br>
                SR2_RAW_SENS = 0  (don't stream raw IMU — wastes bandwidth)<br>
                SYSID_MYGCS = 1  (system ID of the CC acting as GCS)</p>
            </div>
        </div>
    </div>

    <h3>5.4 Failsafe Configuration</h3>
    <p>ArduPilot has a layered failsafe architecture. Each layer triggers independently and the system always escalates to the most conservative safe action given the current state. Understanding the exact trigger conditions and responses is mandatory for airworthiness.</p>

    <div class="space-y-4 mb-8">
        <div class="bg-slate-900 p-5 rounded border-l-4 border-red-500 text-sm">
            <strong class="text-red-400 block mb-2">RC Failsafe (Loss of RC Signal)</strong>
            <div class="font-mono text-xs text-slate-300 space-y-1">
                <p>Trigger: RC input signal lost for &gt; FS_THR_TIMEOUT seconds (default 1.0s). ArduPilot detects this when the RC receiver outputs a SBUS/PPM signal below FS_THR_VALUE (usually 975µs, set during RC calibration) or signal is completely absent.</p>
                <p>FS_THR_ENABLE options:</p>
                <ul class="pl-4 space-y-1">
                    <li>1 = Always RTL (safest — drone comes home regardless of mission state)</li>
                    <li>2 = Continue mission if in AUTO mode, else RTL</li>
                    <li>3 = Land (descend vertically at current position — used when RTL requires flying over obstacles)</li>
                    <li>4 = Brake then Land</li>
                    <li>5 = Terminate flight (cut motors — only for fixed-wing, NEVER for copter)</li>
                </ul>
                <p class="text-amber-400 mt-2">If armed but not yet flying: FS triggers Land immediately (no RTL — no home position established).</p>
            </div>
        </div>

        <div class="bg-slate-900 p-5 rounded border-l-4 border-amber-500 text-sm">
            <strong class="text-amber-400 block mb-2">Battery Failsafe</strong>
            <div class="font-mono text-xs text-slate-300 space-y-1">
                <p>BATT_LOW_VOLT: First threshold (e.g., 21.0V for 6S = 3.5V/cell). Action: warn (beeper + GCS alert). Continue flight.</p>
                <p>BATT_CRT_VOLT: Critical threshold (e.g., 19.8V for 6S = 3.3V/cell). Action: FS_BATT_ENABLE.</p>
                <p>FS_BATT_ENABLE options: 1=Land immediately, 2=RTL, 3=SmartRTL (replays GPS bread-crumb trail), 4=Brake+Land.</p>
                <p>BATT_LOW_MAH / BATT_CRT_MAH: Capacity-based thresholds (mAh consumed). More reliable than voltage because voltage sag depends on load and temperature. Set CRT_MAH to leave 20% capacity for RTL flight.</p>
            </div>
        </div>

        <div class="bg-slate-900 p-5 rounded border-l-4 border-purple-500 text-sm">
            <strong class="text-purple-400 block mb-2">GCS (Ground Control Station) Failsafe</strong>
            <div class="font-mono text-xs text-slate-300 space-y-1">
                <p>Trigger: No MAVLink HEARTBEAT received from GCS for FS_GCS_TIMEOUT seconds (default 5s).</p>
                <p>FS_GCS_ENABLE: 0=Disabled, 1=Always RTL, 2=RTL only when not in AUTO, 3=Enabled only in GUIDED mode.</p>
                <p>For AI companion computer builds: set FS_GCS_ENABLE = 3. This ensures that if the Jetson crashes mid-GUIDED-flight, the FC will RTL, but it won't interfere with a GCS-disconnected AUTO mission.</p>
                <p class="text-amber-400">The Companion Computer must send a HEARTBEAT message at ≥1Hz on its MAVLink connection to keep this failsafe from triggering.</p>
            </div>
        </div>

        <div class="bg-slate-900 p-5 rounded border-l-4 border-sky-500 text-sm">
            <strong class="text-sky-400 block mb-2">EKF (Extended Kalman Filter) Failsafe</strong>
            <div class="font-mono text-xs text-slate-300 space-y-1">
                <p>The EKF3 (EK3_ENABLE = 1) is the sensor fusion engine that computes the best estimate of position, velocity, and attitude. It tracks its own uncertainty (variance). When that variance exceeds EK3_CHECK_SCALE (default 0.8), an EKF error is flagged.</p>
                <p>Common EKF failure triggers:</p>
                <ul class="pl-4 space-y-1">
                    <li>GPS position jumps &gt;5m in &lt;1s (multipath reflections near buildings)</li>
                    <li>Compass interference from motors (yaw channel divergence &gt; EK3_MAG_MASK threshold)</li>
                    <li>IMU temperature drift (cold start — allow 3 minutes warm-up in sub-zero temperatures)</li>
                    <li>Barometer blocked by airframe (static pressure error — mount baro with foam cover)</li>
                </ul>
                <p class="text-amber-400 mt-1">When EKF failsafe triggers in LOITER/GUIDED: mode changes to ALT_HOLD (no GPS required) or STABILIZE, preventing a position-hold loop from running with bad position data and sending the drone full-throttle in a random direction.</p>
            </div>
        </div>
    </div>

    <h3>5.5 Pre-Arm Checks</h3>
    <p>ArduPilot will refuse to arm the motors until all pre-arm checks pass. These are not arbitrary gates — each check prevents a specific class of inflight failure. The ARMING_CHECK bitmask parameter controls which checks are active (default: all enabled = 1).</p>

    <div class="math-block">
        <strong>ARMING_CHECK Bitmask — Full Breakdown</strong><br><br>
        Bit 0  (value 1):    Board voltage check — internal 5V supply within ±0.3V of nominal
        Bit 1  (value 2):    Parameter EEPROM integrity — CRC check on all stored params
        Bit 2  (value 4):    RC calibration — all RC channels within their calibrated range
        Bit 3  (value 8):    GPS lock — must have 3D fix with HDOP &lt; GPS_HDOP_GOOD (default 140 = 1.40)
        Bit 4  (value 16):   MAG (compass) — calibration CRC valid, no large variance between compass readings
        Bit 5  (value 32):   INS (IMU) — all IMUs agree on static state, no high vibration pre-arm
        Bit 6  (value 64):   RC failsafe — verify FS_THR_VALUE actually triggers failsafe
        Bit 7  (value 128):  Fence — verify GeoFence polygon is valid and loaded
        Bit 8  (value 256):  Flight plan — verify mission is loaded if AUTO mode is selected
        Bit 9  (value 512):  Logging — SD card present and writable (refuse to fly without logging for safety review post-crash)
        Bit 10 (value 1024): Battery — BATT_ARMING_MIN voltage check (refuse if voltage too low to complete mission)
        Bit 15 (value 32768): all checks<br><br>

        <strong>EKF-specific arming gate:</strong>
        EK3_CHECK_SCALE controls the EKF variance threshold. Before arming, the EKF must have converged:
        all state variances below the threshold for at least 10 seconds. This ensures the filter has enough
        data to have a valid position estimate before handing control to position-hold modes.
    </div>

    <div class="bg-slate-900 p-6 rounded border border-slate-700 mb-8 text-sm">
        <strong class="text-sky-400 block mb-3">Why Each Check Matters for Safety</strong>
        <div class="space-y-2 font-mono text-xs text-slate-300">
            <div class="p-2 bg-slate-800 rounded"><span class="text-red-400">GPS HDOP:</span> If HDOP &gt; 2.5 (250), position error can exceed 10m. In LOITER, the FC will try to "correct" a perceived 10m drift and fly 10m in a random direction. Many fly-aways are caused by arming with poor GPS fix.</div>
            <div class="p-2 bg-slate-800 rounded"><span class="text-red-400">Compass calibration:</span> Yaw error &gt;5° causes the velocity controller to decompose velocity commands into wrong body-frame axes. At 5m/s, a 10° yaw error creates a 0.87m/s lateral drift — the drone will circle instead of fly straight.</div>
            <div class="p-2 bg-slate-800 rounded"><span class="text-red-400">RC failsafe test:</span> Verifies that when the transmitter is powered off, the RC receiver actually outputs the failsafe throttle value (below FS_THR_VALUE). Without this, RC loss won't trigger the failsafe — the receiver may hold last valid signal instead.</div>
            <div class="p-2 bg-slate-800 rounded"><span class="text-red-400">SD card logging:</span> Flight logs are the only post-crash forensic evidence. Without logs, diagnosing whether a crash was hardware failure, EKF divergence, or software bug is impossible.</div>
        </div>
    </div>

    <h3>5.6 GUIDED_NOGPS Mode — Flying Without GPS</h3>
    <p>Standard GUIDED mode requires a valid GPS position (EKF position source = GPS). GUIDED_NOGPS mode allows the same MAVLink-commanded flight using alternative position estimates from optical flow or Visual-Inertial Odometry (VIO).</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm">
            <strong class="text-sky-400 block mb-3">Option 1: Optical Flow (RangeFinder + Flow Sensor)</strong>
            <ul class="space-y-2 font-mono text-xs text-slate-300">
                <li>> Hardware: PX4Flow sensor (USB) or Ark Flow (CAN) + LiDAR altimeter (e.g., TFmini)</li>
                <li>> FLOW_ENABLE = 1 (enable optical flow)</li>
                <li>> EK3_SRC1_VELXY = 5 (optical flow as XY velocity source)</li>
                <li>> EK3_SRC1_POSZ = 6 (rangefinder as altitude source)</li>
                <li>> Limitation: requires textured surface below drone, altitude &lt;8m for accuracy, fails over water/grass</li>
                <li>> Velocity accuracy: ±0.1 m/s typical in good lighting over textured floor</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm">
            <strong class="text-sky-400 block mb-3">Option 2: VIO via External Pose (VSLAM/T265)</strong>
            <ul class="space-y-2 font-mono text-xs text-slate-300">
                <li>> Hardware: Intel RealSense T265 or custom VSLAM on Companion Computer</li>
                <li>> Companion computer sends VISION_POSITION_ESTIMATE (MSG #102) or ODOMETRY (MSG #331) over MAVLink</li>
                <li>> EK3_SRC1_POSXY = 6 (ExternalNav as XY position source)</li>
                <li>> EK3_SRC1_VELXY = 6 (ExternalNav as velocity source)</li>
                <li>> VISO_TYPE = 1 (enable VIO fusion in EKF)</li>
                <li>> SERIAL2_PROTOCOL = 2 (MAVLink on the port connected to Companion Computer)</li>
                <li>> Position accuracy: ±0.05m in well-lit, feature-rich environment. Degrades in low-light or textureless spaces (white corridors).</li>
            </ul>
        </div>
    </div>

    <div class="math-block">
        <strong>GUIDED_NOGPS — Enabling and Using</strong><br><br>
        To enter GUIDED_NOGPS mode, the Companion Computer sends a MAVLink COMMAND_LONG (MSG #76):
        command = MAV_CMD_NAV_GUIDED_ENABLE (92)
        param1 = 1 (enable)

        Or set via RC: add GUIDED_NOGPS to FLTMODE slots.
        Note: GUIDED_NOGPS is the flight mode number 20 in ArduPilot Copter (not 4).
        Verified against ArduCopter/mode.h: COPTER_MODE enum { GUIDED_NOGPS = 20 }.<br><br>

        Once in GUIDED_NOGPS, the CC sends SET_ATTITUDE_TARGET (MSG #82) directly:
        — 4-component quaternion (q[0..3]) sets desired attitude
        — body_roll_rate, body_pitch_rate, body_yaw_rate: rate feedforward (rad/s)
        — thrust: collective thrust 0.0–1.0 (maps to MOT_SPIN_MIN to MOT_THST_HOVER to max)<br><br>

        This bypasses position and velocity loops entirely — the CC is responsible for all position control.
        The FC provides only attitude control (Layers 3 and 4) and motor mixing (Layer 5).
        This is the architecture used by custom VIO-based navigation systems where the CC runs its own position PID loop.
    </div>

    <div class="bg-emerald-900/20 border border-emerald-500/50 p-4 rounded text-emerald-200 text-sm">
        <strong>Integration Pattern for AI Drone:</strong> The production AI drone architecture runs GUIDED mode (with GPS) for outdoor operations and automatically transitions to GUIDED_NOGPS (with VIO) when entering GPS-denied environments (buildings, tunnels). The Companion Computer detects GPS quality via MAVLINK GPS_RAW_INT.fix_type and autonomously switches the EKF source and flight mode. The transition requires ~2–3 seconds for EKF to converge on the new position source before the CC resumes position control commands.
    </div>
</div>
`;
