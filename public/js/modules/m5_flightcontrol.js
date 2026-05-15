export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 5</span>
    <div class="inline-flex items-center gap-2 bg-amber-900/30 border border-amber-700/50 rounded px-3 py-1 mb-3 text-xs font-mono text-amber-400">ArduPilot stack · ChibiOS RTOS</div>
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

    <div class="space-y-2 mb-6">
        <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500 text-sm">
            <div class="flex items-center justify-between mb-2">
                <strong class="text-sky-400">Layer 1 — Position Controller</strong>
                <span class="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">50 Hz</span>
            </div>
            <div class="grid grid-cols-3 gap-3 text-xs font-mono text-slate-300">
                <div><span class="text-slate-500">In:</span> GPS position error (m)</div>
                <div><span class="text-slate-500">Logic:</span> P-only controller</div>
                <div><span class="text-slate-500">Out:</span> Velocity setpoint (m/s)</div>
            </div>
            <div class="text-xs text-slate-500 mt-1">Params: PSC_POSXY_P, PSC_POSZ_P</div>
        </div>
        <div class="flex justify-center text-slate-600 text-lg">↓</div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-400 text-sm">
            <div class="flex items-center justify-between mb-2">
                <strong class="text-sky-300">Layer 2 — Velocity Controller</strong>
                <span class="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">50 Hz</span>
            </div>
            <div class="grid grid-cols-3 gap-3 text-xs font-mono text-slate-300">
                <div><span class="text-slate-500">In:</span> Velocity error (m/s)</div>
                <div><span class="text-slate-500">Logic:</span> Full PID — I term absorbs wind drift</div>
                <div><span class="text-slate-500">Out:</span> Lean angle setpoint (°, max 30°)</div>
            </div>
            <div class="text-xs text-slate-500 mt-1">Params: PSC_VELXY_P/I/D</div>
        </div>
        <div class="flex justify-center text-slate-600 text-lg">↓</div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500 text-sm">
            <div class="flex items-center justify-between mb-2">
                <strong class="text-emerald-400">Layer 3 — Attitude Controller</strong>
                <span class="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">400 Hz</span>
            </div>
            <div class="grid grid-cols-3 gap-3 text-xs font-mono text-slate-300">
                <div><span class="text-slate-500">In:</span> Attitude quaternion error</div>
                <div><span class="text-slate-500">Logic:</span> P-only on quaternion (no gimbal lock)</div>
                <div><span class="text-slate-500">Out:</span> Angular rate setpoint (°/s)</div>
            </div>
            <div class="text-xs text-slate-500 mt-1">Params: ATC_ANG_RLL/PIT/YAW_P (~4.5)</div>
        </div>
        <div class="flex justify-center text-slate-600 text-lg">↓</div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500 text-sm">
            <div class="flex items-center justify-between mb-2">
                <strong class="text-amber-400">Layer 4 — Rate Controller ← Most tuning effort here</strong>
                <span class="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">400 Hz</span>
            </div>
            <div class="grid grid-cols-3 gap-3 text-xs font-mono text-slate-300">
                <div><span class="text-slate-500">In:</span> Rate error (gyro vs setpoint)</div>
                <div><span class="text-slate-500">Logic:</span> Full PID + D-term LPF (20Hz cutoff)</div>
                <div><span class="text-slate-500">Out:</span> Roll/Pitch/Yaw torque + Throttle</div>
            </div>
            <div class="text-xs text-slate-500 mt-1">Params: ATC_RAT_RLL/PIT/YAW_P/I/D</div>
        </div>
        <div class="flex justify-center text-slate-600 text-lg">↓</div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-violet-500 text-sm">
            <div class="flex items-center justify-between mb-2">
                <strong class="text-violet-400">Layer 5 — Motor Mixer → ESC</strong>
                <span class="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">400 Hz</span>
            </div>
            <div class="text-xs font-mono text-slate-300 grid grid-cols-2 gap-x-6 gap-y-1 mt-1">
                <div>Motor FL = Throttle + Roll − Pitch + Yaw</div>
                <div>Motor FR = Throttle − Roll − Pitch − Yaw</div>
                <div>Motor BL = Throttle + Roll + Pitch − Yaw</div>
                <div>Motor BR = Throttle − Roll + Pitch + Yaw</div>
            </div>
            <div class="text-xs text-slate-500 mt-2">Output: DSHOT value 0–2047 per motor, clamped to MOT_SPIN_MIN / MOT_SPIN_MAX</div>
        </div>
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

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">ARMING_CHECK Bitmask</div>
        <table class="w-full text-xs">
            <thead>
                <tr class="bg-slate-800/50 text-slate-400">
                    <th class="p-2 text-left">Bit</th>
                    <th class="p-2 text-left">Check</th>
                    <th class="p-2 text-left">What It Verifies</th>
                </tr>
            </thead>
            <tbody class="text-slate-300 font-mono">
                <tr class="border-t border-slate-800"><td class="p-2 text-slate-500">0 (1)</td><td class="p-2 text-white">Board voltage</td><td class="p-2">Internal 5V within ±0.3V of nominal</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-2 text-slate-500">1 (2)</td><td class="p-2 text-white">EEPROM CRC</td><td class="p-2">Parameter storage not corrupted</td></tr>
                <tr class="border-t border-slate-800"><td class="p-2 text-slate-500">2 (4)</td><td class="p-2 text-white">RC calibration</td><td class="p-2">All channels within calibrated range</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-2 text-slate-500">3 (8)</td><td class="p-2 text-rose-300">GPS lock</td><td class="p-2">3D fix, HDOP &lt; GPS_HDOP_GOOD (default 1.40)</td></tr>
                <tr class="border-t border-slate-800"><td class="p-2 text-slate-500">4 (16)</td><td class="p-2 text-rose-300">Compass</td><td class="p-2">Calibration CRC valid, low variance between readings</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-2 text-slate-500">5 (32)</td><td class="p-2 text-rose-300">IMU (INS)</td><td class="p-2">All IMUs agree, no high vibration pre-arm</td></tr>
                <tr class="border-t border-slate-800"><td class="p-2 text-slate-500">6 (64)</td><td class="p-2 text-rose-300">RC failsafe</td><td class="p-2">Verifies FS_THR_VALUE actually triggers failsafe</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-2 text-slate-500">7 (128)</td><td class="p-2 text-white">Fence</td><td class="p-2">GeoFence polygon valid and loaded</td></tr>
                <tr class="border-t border-slate-800"><td class="p-2 text-slate-500">8 (256)</td><td class="p-2 text-white">Flight plan</td><td class="p-2">Mission loaded if AUTO mode selected</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-2 text-slate-500">9 (512)</td><td class="p-2 text-amber-300">Logging</td><td class="p-2">SD card present and writable</td></tr>
                <tr class="border-t border-slate-800"><td class="p-2 text-slate-500">10 (1024)</td><td class="p-2 text-amber-300">Battery</td><td class="p-2">BATT_ARMING_MIN voltage — enough charge to complete mission</td></tr>
            </tbody>
        </table>
    </div>
    <div class="insight-box mb-6">
        <div class="insight-label">EKF Arming Gate</div>
        <p class="text-slate-200 text-sm mt-1"><code>EK3_CHECK_SCALE</code> controls the EKF variance threshold. Before arming, all 24 state variances must remain below this threshold for at least 10 seconds — ensuring the filter has converged on a valid position estimate before handing control to position-hold modes.</p>
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

    <div class="bg-slate-900 p-5 rounded border border-slate-700 mb-6 text-sm">
        <strong class="text-sky-400 block mb-3">GUIDED_NOGPS Command Flow</strong>
        <div class="space-y-3 font-mono text-xs text-slate-300">
            <div class="flex gap-3 items-start">
                <span class="text-sky-400 shrink-0">Step 1</span>
                <div>Send <code class="text-white">COMMAND_LONG (MSG #76)</code> with <code class="text-white">MAV_CMD_NAV_GUIDED_ENABLE (92), param1=1</code> — or assign flight mode 20 to an RC slot</div>
            </div>
            <div class="flex gap-3 items-start">
                <span class="text-sky-400 shrink-0">Step 2</span>
                <div>Companion Computer continuously sends <code class="text-white">SET_ATTITUDE_TARGET (MSG #82)</code>: 4-component quaternion (desired attitude) + body rate feedforward + thrust 0.0–1.0</div>
            </div>
            <div class="flex gap-3 items-start">
                <span class="text-sky-400 shrink-0">Result</span>
                <div class="text-emerald-300">Position and velocity loops are bypassed entirely — FC handles only attitude (Layers 3–4) and motor mixing. The CC runs its own position PID loop using VIO as feedback.</div>
            </div>
        </div>
    </div>

    <div class="bg-emerald-900/20 border border-emerald-500/50 p-4 rounded text-emerald-200 text-sm">
        <strong>Integration Pattern for AI Drone:</strong> The production AI drone architecture runs GUIDED mode (with GPS) for outdoor operations and automatically transitions to GUIDED_NOGPS (with VIO) when entering GPS-denied environments (buildings, tunnels). The Companion Computer detects GPS quality via MAVLINK GPS_RAW_INT.fix_type and autonomously switches the EKF source and flight mode. The transition requires ~2–3 seconds for EKF to converge on the new position source before the CC resumes position control commands.
    </div>
</div>
`;
