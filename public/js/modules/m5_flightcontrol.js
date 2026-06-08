export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 5</span>
    <div class="inline-flex items-center gap-2 bg-amber-900/30 border border-amber-700/50 rounded px-3 py-1 mb-3 text-xs font-mono text-amber-400">ArduPilot 4.5/4.6 · PX4 v1.14/v1.15 · ChibiOS / NuttX RTOS</div>
    <h2>Flight Controller Architecture, PID Control &amp; Flight Modes</h2>
    <p>The flight controller is the drone's brainstem — a dedicated hard-real-time embedded computer that runs nested PID control loops at 400–1000 Hz and must never miss a scheduling deadline. This module dissects the two dominant open-source autopilot stacks (ArduPilot and PX4), the full PID cascade from GPS position to motor PWM, every major flight mode, the failsafe architecture, MAVLink 2 / DDS communication, and the simulation environments used for development and validation.</p>

    <!-- ============================================================ -->
    <h3>5.1 The Two Dominant Open-Source Autopilot Stacks</h3>
    <p>Two projects dominate open-source autopilot development. Understanding their architectural differences is essential when choosing a stack for a defense or research program — they are <strong>not interchangeable</strong>.</p>

    <!-- PX4 vs ArduPilot comparison table -->
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Attribute</th>
                    <th class="p-3 text-sky-400">PX4 v1.15 (Aug 2025)</th>
                    <th class="p-3 text-amber-400">ArduPilot 4.5/4.6 (2024–2025)</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700 text-slate-300">
                <tr class="bg-slate-800">
                    <td class="p-3 font-semibold text-white">License</td>
                    <td class="p-3">BSD 3-Clause — closed-source forks permitted; preferred by defense primes</td>
                    <td class="p-3">GPL v3 — modifications to the codebase must be open-sourced if distributed</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 font-semibold text-white">RTOS</td>
                    <td class="p-3">NuttX (POSIX-like, thread-safe); Linux companion via ROS 2</td>
                    <td class="p-3">ChibiOS (migrated from NuttX 2018–2019); Linux builds for Pi/Jetson</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 font-semibold text-white">Rate Controller Loop</td>
                    <td class="p-3 font-mono text-xs">1000 Hz (rate) / 250 Hz (attitude) / 50 Hz (position)</td>
                    <td class="p-3 font-mono text-xs">400 Hz (rate + attitude) / 50 Hz (position + velocity)</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 font-semibold text-white">ROS 2 Integration</td>
                    <td class="p-3">First-class via uXRCE-DDS (built into firmware). uORB topics bridge directly to ROS 2 topics at 1000 Hz.</td>
                    <td class="p-3">Via MAVLink 2 (MAVROS) or DDS proxy; tighter latency with MAVLink serial, but no native DDS</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 font-semibold text-white">State Estimator</td>
                    <td class="p-3">EKF2 (primary) — position/velocity/attitude Kalman; EKF3-equivalent Error-State KF added in v1.15</td>
                    <td class="p-3">EKF3 (default since AC 4.1) — full 24-state EKF with multi-lane switching, GPS/optical flow/ExternalNav fusion</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 font-semibold text-white">Vehicle Types</td>
                    <td class="p-3">Multirotor, fixed-wing, VTOL, rover, boat. Dynamic control allocation since v1.14 (no mixer files needed).</td>
                    <td class="p-3">Multirotor, fixed-wing, VTOL, rover, boat, submarine, blimp, helicopter. Largest vehicle-type coverage.</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 font-semibold text-white">Simulation</td>
                    <td class="p-3">Gazebo (Gz Sim) default since v1.15; jMAVSim deprecated. HITL supported via NuttX.</td>
                    <td class="p-3">SITL (built-in JSBSim/Morse/Gazebo backends); ardupilot_gazebo plugin; HITL via param SIM_ON_HW.</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 font-semibold text-white">Peripheral Bus</td>
                    <td class="p-3">UAVCAN/DroneCAN, PWM/DSHOT, UART, SPI, I2C</td>
                    <td class="p-3">DroneCAN (formerly UAVCAN), DSHOT, UAVCAN v1 (experimental), PWM, I2C, SPI</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 font-semibold text-white">Autotune</td>
                    <td class="p-3">MC Autotune (FW + MC separate) — runs in flight, completes in ~40 s per axis</td>
                    <td class="p-3">AUTOTUNE mode — runs in AltHold/Loiter, twitches each axis, saves to EEPROM. ArduPilot MethodicConfigurator adds guided tuning workflow.</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 font-semibold text-white">GCS</td>
                    <td class="p-3">QGroundControl (primary). Mission Planner partially supported.</td>
                    <td class="p-3">Mission Planner (Windows), QGroundControl, MAVProxy (CLI). Best Mission Planner ecosystem.</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 font-semibold text-white">Defense / DoD Use</td>
                    <td class="p-3">Preferred for closed-source derivatives (BSD); Zipline PX4-based certificate cited in FAA waivers 2024–2025</td>
                    <td class="p-3">17 ag-spray operators cited ArduPilot logs for FAA ground-risk mitigations 2024–2025; common in academia</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 font-semibold text-white">New in 2024–2025</td>
                    <td class="p-3">v1.14: Dynamic control allocation default, new preflight failure reporting. v1.15: Error-State KF, PX4 ROS 2 Interface Library, Zenoh pico, Throw Mode, Gazebo default.</td>
                    <td class="p-3">4.5 LTS: EKF3 dual-lane switching, long-distance double-precision EKF. 4.6: Blue UAS native mode, ADS-B ID broadcast, improved VTOL transitions.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-6">
        <h3 class="text-sky-400 font-bold text-lg mb-3">ChibiOS vs NuttX — Why the RTOS Choice Matters</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
                <p class="text-slate-400 mb-2"><strong class="text-white">ArduPilot/ChibiOS:</strong> Migrated from NuttX to ChibiOS in late 2018/early 2019. Priority-based preemptive scheduler (256 priority levels), deterministic context switch &lt;1 µs on Cortex-M7, worst-case interrupt latency &lt;5 µs. No dynamic heap allocation in flight-critical paths. Smaller flash footprint vs NuttX — ArduPilot devs reported "huge drop in CPU usage and big reduction in flash size" after the switch.</p>
                <p class="text-slate-400">Linux (Raspberry Pi, Jetson) is explicitly <em>not</em> used as the flight controller OS: Linux SCHED_FIFO worst-case latency is 500 µs–10 ms due to page faults, interrupt coalescing, and TLB flushes. A 10 ms jitter at 400 Hz = a missed control cycle = attitude instability.</p>
            </div>
            <div>
                <p class="text-slate-400 mb-2"><strong class="text-white">PX4/NuttX:</strong> NuttX provides a POSIX-compatible API (&#96;pthread&#96;, &#96;open()&#96;, &#96;read()&#96;) which eases porting of POSIX code and supports the uORB publish/subscribe middleware natively. Context switch time is slightly higher than ChibiOS but still &lt;10 µs. Supports the full PX4 module system where each controller is an independent NuttX task with its own stack and priority.</p>
                <p class="text-slate-400">Both RTOSes are hard-real-time — the fundamental distinction from Linux. The RTOS guarantees that the rate controller task fires within microseconds of its scheduled interval, every cycle, regardless of other system activity.</p>
            </div>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>5.2 Autopilot Hardware — Pixhawk Standard</h3>

    <div class="space-y-6 mb-8">
        <div class="hw-card p-8 rounded-xl">
            <h4 class="text-2xl font-bold text-white mt-0 flex items-center">
                Pixhawk 6X <span class="ml-4 text-xs bg-sky-900/50 text-sky-400 px-3 py-1 rounded border border-sky-800">FLAGSHIP OPEN HARDWARE</span>
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mt-4">
                <div class="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-slate-300">
                    <strong class="text-sky-400 block mb-2">Processor</strong>
                    <ul class="space-y-1">
                        <li>> FMU: STM32H753IIK6, 480 MHz Cortex-M7 + FPU</li>
                        <li>> I/O Coprocessor: STM32F103 (handles PWM outputs independently; if FMU crashes, IO continues outputting last safe command)</li>
                        <li>> RAM: 1 MB SRAM (FMU) + 192 KB CCM</li>
                        <li>> Flash: 2 MB (FMU)</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-slate-300">
                    <strong class="text-sky-400 block mb-2">IMU Redundancy — Triple IMU</strong>
                    <ul class="space-y-1">
                        <li>> IMU1: ICM-42688-P (6-axis, 32 kHz gyro ODR)</li>
                        <li>> IMU2: ICM-20649 (6-axis, high-g ±70 g accelerometer)</li>
                        <li>> IMU3: ICM-42670-P (6-axis, low-noise)</li>
                        <li>> Mag: RM3100 (industrial I²C magnetometer)</li>
                        <li>> Baro: ICP20100 (primary) + MS5611 (secondary)</li>
                        <li>> Triple-IMU voting: divergence &gt;5% for &gt;1 s → sensor excluded from EKF</li>
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
                        <li>> FMU: STM32H753, 480 MHz Cortex-M7</li>
                        <li>> IMU1: ICM-42688-P (internally isolated on dampened PCB)</li>
                        <li>> IMU2: ICM-20649 (high-g)</li>
                        <li>> IMU3: ICM-42688-P (on outer "standard" carrier — exposed to vibration for comparison)</li>
                        <li>> Vibration isolation: 3-axis silicone isolators, resonance ~100 Hz</li>
                    </ul>
                </div>
                <div class="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-slate-300">
                    <strong class="text-amber-400 block mb-2">Why Isolation Matters</strong>
                    <ul class="space-y-1">
                        <li>> Motor vibration: 50–500 Hz depending on RPM</li>
                        <li>> Gyro aliasing: if vibration freq = control loop rate / 2, DC offset appears in gyro reading</li>
                        <li>> Symptom: oscillation despite good PID tuning</li>
                        <li>> Cube Orange+ isolates IMU1 from this; ArduPilot preferentially uses isolated IMU1 for attitude control</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>5.3 The PID Controller — Mathematics and Intuition</h3>
    <p>Every layer of the flight control stack uses a PID (Proportional-Integral-Derivative) controller. Understanding the math is essential for tuning and for understanding why a drone oscillates, drifts, or responds sluggishly.</p>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-6">
        <h3 class="text-sky-400 font-bold text-lg mb-3">PID Control Law</h3>
        <p class="text-slate-300 text-sm mb-4">Given an error signal $e(t) = r(t) - y(t)$ where $r$ is the setpoint (reference) and $y$ is the measured output, the PID controller computes a corrective output $u(t)$:</p>
        <div class="bg-slate-900 rounded-lg p-4 font-mono text-center text-white text-base mb-4">
            $u(t) = K_p \, e(t) \;+\; K_i \int_0^t e(\tau)\,d\tau \;+\; K_d \,\dfrac{de(t)}{dt}$
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-2">Proportional — $K_p \cdot e(t)$</strong>
                <p class="text-slate-300">Output proportional to current error. Higher $K_p$ = faster response but more overshoot. <span class="text-amber-400">Too high: oscillation.</span> Too low: sluggish, won't hold attitude in wind.</p>
                <p class="text-slate-400 text-xs mt-2">In rate loop: $K_p$ controls how aggressively the FC reacts to a rate error vs the gyro setpoint.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 block mb-2">Integral — $K_i \int e \, dt$</strong>
                <p class="text-slate-300">Accumulates past errors to eliminate steady-state offset. Essential for compensating for wind drift, motor imbalance, and CG offsets. <span class="text-amber-400">Too high: I-term windup → slow oscillation after disturbance.</span></p>
                <p class="text-slate-400 text-xs mt-2">ArduPilot and PX4 both implement anti-windup clamping: the integrator is limited to ±IMAX to prevent saturation during aggressive maneuvers.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-violet-500">
                <strong class="text-violet-400 block mb-2">Derivative — $K_d \frac{de}{dt}$</strong>
                <p class="text-slate-300">Reacts to rate of change of error — damps overshoots. Acts as a "predictor." <span class="text-amber-400">Too high: amplifies sensor noise → high-frequency oscillation + motor heat.</span></p>
                <p class="text-slate-400 text-xs mt-2">Always applied through a low-pass filter (ArduPilot: ATC_RAT_RLL_FLTD ~20 Hz; PX4: IMU_DGYRO_CUTOFF). The filter trades noise rejection for derivative phase lag.</p>
            </div>
        </div>
    </div>

    <figure class="my-6">
        <img src="images/m5_pid_loop.png" alt="PID closed-loop control system block diagram showing setpoint, error, PID controller, plant, and feedback path" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Standard PID closed-loop block diagram. The controller computes P+I+D terms from the error between setpoint and measured output, applies the correction to the plant (motor/airframe), and feeds back the new measured state. Source: <a href="https://commons.wikimedia.org/wiki/File:PID_loop.svg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons (CC BY-SA 3.0)</a></figcaption>
    </figure>

    <div class="bg-slate-800/60 border border-amber-700/60 rounded-xl p-6 mb-6">
        <h3 class="text-amber-400 font-bold text-lg mb-3">Discrete-Time PID — What Actually Runs on the Microcontroller</h3>
        <p class="text-slate-300 text-sm mb-3">The continuous-time PID is discretized using the Tustin (bilinear) method for the derivative term and backward Euler for the integrator, at sample period $T_s = 1/400\,\text{Hz} = 2.5\,\text{ms}$:</p>
        <div class="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 space-y-2">
            <div><span class="text-sky-400">// Proportional:</span>   P = Kp * e[n]</div>
            <div><span class="text-sky-400">// Integral (backward Euler, clamped):</span></div>
            <div class="pl-4">I_accum += Ki * e[n] * Ts;  I_accum = clamp(I_accum, -IMAX, IMAX);</div>
            <div><span class="text-sky-400">// Derivative (LPF on D-term — NOT on error):</span></div>
            <div class="pl-4">D_raw = Kd * (e[n] - e[n-1]) / Ts;</div>
            <div class="pl-4">D_filt = alpha * D_raw + (1 - alpha) * D_filt_prev;  <span class="text-slate-500">// alpha = 2*pi*fc*Ts / (1 + 2*pi*fc*Ts)</span></div>
            <div><span class="text-sky-400">// Output:</span>   u[n] = P + I_accum + D_filt;</div>
        </div>
        <p class="text-slate-400 text-xs mt-3">ArduPilot applies the derivative filter only on the D-term (not on the error signal itself) to avoid derivative kick on step setpoint changes. The LPF cutoff frequency (ATC_RAT_RLL_FLTD, default 20 Hz) must be tuned along with $K_d$.</p>
    </div>

    <!-- ============================================================ -->
    <h3>5.4 The Full Cascaded PID Control Loop</h3>
    <p>Both ArduPilot and PX4 implement a <strong>nested cascade</strong> of PID controllers. Each outer loop's output becomes the setpoint for the next inner loop. The cascade architecture allows different physical quantities (position, velocity, attitude, angular rate) to be controlled at different bandwidths appropriate for their dynamics.</p>

    <div class="space-y-2 mb-6">
        <!-- Layer 1: Position -->
        <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500 text-sm">
            <div class="flex items-center justify-between mb-2">
                <strong class="text-sky-400">Layer 1 — Position Controller</strong>
                <div class="flex gap-2">
                    <span class="text-xs font-mono text-sky-300 bg-slate-800 px-2 py-1 rounded">ArduPilot: 50 Hz</span>
                    <span class="text-xs font-mono text-violet-300 bg-slate-800 px-2 py-1 rounded">PX4: 50 Hz</span>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-3 text-xs font-mono text-slate-300">
                <div><span class="text-slate-500">In:</span> GPS/EKF position error (m, NED frame)</div>
                <div><span class="text-slate-500">Logic:</span> P-only controller — no I/D needed (velocity loop handles steady-state)</div>
                <div><span class="text-slate-500">Out:</span> Velocity setpoint (m/s, capped at max speed)</div>
            </div>
            <div class="text-xs text-slate-500 mt-1">ArduPilot: PSC_POSXY_P, PSC_POSZ_P &nbsp;|&nbsp; PX4: MPC_XY_P, MPC_Z_P</div>
            <div class="text-xs text-slate-400 mt-1">Runs at 50 Hz because GPS updates at 5–10 Hz and EKF position output is valid at 50 Hz. Running faster gains nothing from stale GPS data.</div>
        </div>
        <div class="flex justify-center text-slate-600 text-lg">↓</div>

        <!-- Layer 2: Velocity -->
        <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-400 text-sm">
            <div class="flex items-center justify-between mb-2">
                <strong class="text-sky-300">Layer 2 — Velocity Controller</strong>
                <div class="flex gap-2">
                    <span class="text-xs font-mono text-sky-300 bg-slate-800 px-2 py-1 rounded">ArduPilot: 50 Hz</span>
                    <span class="text-xs font-mono text-violet-300 bg-slate-800 px-2 py-1 rounded">PX4: 50 Hz</span>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-3 text-xs font-mono text-slate-300">
                <div><span class="text-slate-500">In:</span> Velocity error (m/s) — EKF velocity estimate vs setpoint</div>
                <div><span class="text-slate-500">Logic:</span> Full PID — I term essential to absorb steady wind drift</div>
                <div><span class="text-slate-500">Out:</span> Lean angle setpoint (deg, max ~30°) or acceleration command (m/s²)</div>
            </div>
            <div class="text-xs text-slate-500 mt-1">ArduPilot: PSC_VELXY_P/I/D &nbsp;|&nbsp; PX4: MPC_XY_VEL_P_ACC / I_ACC / D_ACC</div>
        </div>
        <div class="flex justify-center text-slate-600 text-lg">↓</div>

        <!-- Layer 3: Attitude -->
        <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500 text-sm">
            <div class="flex items-center justify-between mb-2">
                <strong class="text-emerald-400">Layer 3 — Attitude Controller</strong>
                <div class="flex gap-2">
                    <span class="text-xs font-mono text-sky-300 bg-slate-800 px-2 py-1 rounded">ArduPilot: 400 Hz</span>
                    <span class="text-xs font-mono text-violet-300 bg-slate-800 px-2 py-1 rounded">PX4: 250 Hz</span>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-3 text-xs font-mono text-slate-300">
                <div><span class="text-slate-500">In:</span> Attitude quaternion error $q_{err} = q_{target}^{-1} \otimes q_{est}$</div>
                <div><span class="text-slate-500">Logic:</span> P-only on quaternion error (avoids gimbal lock inherent in Euler angles). No I/D — rate loop handles dynamics.</div>
                <div><span class="text-slate-500">Out:</span> Angular rate setpoint $\boldsymbol{\omega}_{sp}$ (rad/s)</div>
            </div>
            <div class="text-xs text-slate-500 mt-1">ArduPilot: ATC_ANG_RLL/PIT/YAW_P (~4.5) &nbsp;|&nbsp; PX4: MC_ROLL_P, MC_PITCH_P, MC_YAW_P</div>
            <div class="text-xs text-slate-400 mt-1">Runs at 400 Hz (ArduPilot) / 250 Hz (PX4) because attitude dynamics have bandwidth ~10–20 Hz. Nyquist requires &gt;40 Hz; 250–400 Hz gives 12–20× margin for stability.</div>
        </div>
        <div class="flex justify-center text-slate-600 text-lg">↓</div>

        <!-- Layer 4: Rate -->
        <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500 text-sm">
            <div class="flex items-center justify-between mb-2">
                <strong class="text-amber-400">Layer 4 — Rate Controller ← Most tuning effort here</strong>
                <div class="flex gap-2">
                    <span class="text-xs font-mono text-sky-300 bg-slate-800 px-2 py-1 rounded">ArduPilot: 400 Hz</span>
                    <span class="text-xs font-mono text-violet-300 bg-slate-800 px-2 py-1 rounded">PX4: 1000 Hz</span>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-3 text-xs font-mono text-slate-300">
                <div><span class="text-slate-500">In:</span> Rate error = gyro rate - rate setpoint (rad/s per axis)</div>
                <div><span class="text-slate-500">Logic:</span> Full PID + D-term LPF. Anti-windup on integrator. Feed-forward on rate setpoint derivative.</div>
                <div><span class="text-slate-500">Out:</span> Roll/Pitch/Yaw torque commands (normalized 0–1) + Throttle</div>
            </div>
            <div class="text-xs text-slate-500 mt-1">ArduPilot: ATC_RAT_RLL/PIT/YAW_P/I/D &nbsp;|&nbsp; PX4: MC_ROLLRATE_P/I/D, MC_PITCHRATE_P/I/D, MC_YAWRATE_P/I/D</div>
            <div class="text-xs text-amber-300 mt-1">PX4 runs rate control at 1000 Hz on Pixhawk 6X hardware; ArduPilot caps at 400 Hz to accommodate the full sensor fusion pipeline on the same core.</div>
        </div>
        <div class="flex justify-center text-slate-600 text-lg">↓</div>

        <!-- Layer 5: Motor Mixer -->
        <div class="bg-slate-900 p-4 rounded border-l-4 border-violet-500 text-sm">
            <div class="flex items-center justify-between mb-2">
                <strong class="text-violet-400">Layer 5 — Motor Mixer (Control Allocation) → ESC</strong>
                <span class="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">Same rate as rate controller</span>
            </div>
            <div class="text-xs font-mono text-slate-300 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-1">
                <div class="text-slate-400 col-span-2 mb-1">X-frame quadrotor motor mixing matrix (motors: FL=1 CCW, FR=2 CW, BL=3 CW, BR=4 CCW):</div>
                <div>Motor 1 (FL) = T + Roll − Pitch + Yaw</div>
                <div>Motor 2 (FR) = T − Roll − Pitch − Yaw</div>
                <div>Motor 3 (BL) = T + Roll + Pitch − Yaw</div>
                <div>Motor 4 (BR) = T − Roll + Pitch + Yaw</div>
            </div>
            <div class="text-xs text-slate-500 mt-2 space-y-1">
                <div>Yaw torque is produced by differential drag between CW and CCW motors — no dedicated yaw actuator needed.</div>
                <div>PX4 v1.14+: Dynamic control allocation replaces static mixer files. Configuration at runtime via QGC vehicle setup dashboard.</div>
                <div>Output: DSHOT value 0–2047 per motor, clamped to MOT_SPIN_MIN / MOT_SPIN_MAX (ArduPilot) or PWM_MAIN_MIN / PWM_MAIN_MAX (PX4)</div>
            </div>
        </div>
    </div>

    <figure class="my-6">
        <img src="images/m5_quadrotor_pitch.png" alt="Quadrotor pitch maneuver showing differential thrust between front and rear motor pairs" class="rounded-lg w-full max-w-2xl mx-auto">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Pitch maneuver: rear motors increase thrust, front motors decrease by equal amount. The rate controller commands this differential; the mixer translates torque commands into per-motor values. Source: <a href="https://commons.wikimedia.org/wiki/File:Quadrotorpitch.svg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Purpy Pupple / Wikimedia Commons (CC BY-SA 3.0)</a></figcaption>
    </figure>

    <!-- Loop frequency table -->
    <div class="bg-slate-900 p-6 rounded border border-slate-700 mb-8 text-sm">
        <strong class="text-sky-400 text-base block mb-3">Loop Frequency Architecture — Why Different Rates?</strong>
        <div class="overflow-x-auto">
            <table class="w-full font-mono text-xs">
                <thead><tr class="text-slate-400"><th class="text-left pb-2 pr-4">Loop</th><th class="text-left pb-2 pr-4">ArduPilot</th><th class="text-left pb-2 pr-4">PX4</th><th class="text-left pb-2">Reason for Rate</th></tr></thead>
                <tbody class="text-slate-300">
                    <tr><td class="py-1 pr-4">Position</td><td class="py-1 pr-4 text-amber-400">50 Hz</td><td class="py-1 pr-4 text-violet-400">50 Hz</td><td class="py-1">GPS updates at 5–10 Hz; EKF fuses and outputs at 50 Hz. Position dynamics are slow (seconds).</td></tr>
                    <tr><td class="py-1 pr-4">Velocity</td><td class="py-1 pr-4 text-amber-400">50 Hz</td><td class="py-1 pr-4 text-violet-400">50 Hz</td><td class="py-1">EKF velocity output rate. Velocity dynamics: time constant ~0.5–2 s, well captured at 50 Hz.</td></tr>
                    <tr><td class="py-1 pr-4">Attitude</td><td class="py-1 pr-4 text-emerald-400">400 Hz</td><td class="py-1 pr-4 text-emerald-400">250 Hz</td><td class="py-1">Attitude dynamics bandwidth ~10–20 Hz. Nyquist demands &gt;40 Hz; both provide ample margin.</td></tr>
                    <tr><td class="py-1 pr-4">Rate (Gyro)</td><td class="py-1 pr-4 text-emerald-400">400 Hz</td><td class="py-1 pr-4 text-sky-400">1000 Hz</td><td class="py-1">PX4 uses separate NuttX task for rate; higher rate reduces phase lag in the inner loop. ArduPilot fuses IMU on same core, limiting rate to 400 Hz.</td></tr>
                    <tr><td class="py-1 pr-4">ESC / DSHOT</td><td class="py-1 pr-4 text-emerald-400">400 Hz</td><td class="py-1 pr-4 text-sky-400">1000 Hz</td><td class="py-1">One DSHOT frame per control cycle. Motor electrical time constant ~5–15 ms; even 400 Hz is well above motor bandwidth.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>5.5 The Extended Kalman Filter (EKF3) — Sensor Fusion Engine</h3>
    <p>The flight controller does not fly on raw sensor data. The EKF (Extended Kalman Filter) fuses GPS, IMU, barometer, compass, optical flow, and external navigation into a single optimal state estimate used by all control loops.</p>

    <div class="bg-slate-800/60 border border-emerald-700/60 rounded-xl p-6 mb-6">
        <h3 class="text-emerald-400 font-bold text-lg mb-3">ArduPilot EKF3 Architecture (AC 4.5+)</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div class="space-y-3 text-slate-300">
                <p><strong class="text-white">24-State Vector</strong> — EKF3 tracks: position (3), velocity (3), attitude quaternion (3 error states), gyro bias (3), accel bias (3), wind velocity (2), magnetic field (6) = 24 states total. Each state has an associated covariance (uncertainty).</p>
                <p><strong class="text-white">Multi-Lane Switching</strong> (AC 4.5) — EKF3 can run multiple independent cores simultaneously, each using different sensor sources (e.g., Core 0: GPS, Core 1: optical flow). EK3_SRC_OPTIONS bitmask controls switching behavior. If the active core's covariance exceeds EK3_CHECK_SCALE, the system automatically switches to the best-performing core.</p>
                <p><strong class="text-white">Long-Distance Flight</strong> (AC 4.5) — Double-precision EKF with moving origin support: position is stored relative to a floating origin that moves as the drone travels. Eliminates floating-point precision loss at long range (previously limited to ~50 km).</p>
            </div>
            <div class="space-y-3 text-slate-300">
                <p><strong class="text-white">Common EKF Failure Modes and Mitigations:</strong></p>
                <ul class="space-y-2 font-mono text-xs">
                    <li class="p-2 bg-slate-900 rounded"><span class="text-red-400">GPS multipath:</span> Position jump &gt;5 m in &lt;1 s near buildings → EKF flags position error, increases position variance, may trigger failsafe. Mitigation: GPS antenna placement, dual-antenna heading.</li>
                    <li class="p-2 bg-slate-900 rounded"><span class="text-red-400">Compass interference:</span> Motor/ESC current induces magnetic field → yaw drift. Mitigation: compass calibration + ATC deviation ≤5°, use GPS-heading (dual-antenna) on vehicles with metal frames.</li>
                    <li class="p-2 bg-slate-900 rounded"><span class="text-red-400">IMU temperature drift:</span> Cold start (&lt;0°C) — allow 3 min warm-up. Gyro bias drifts 0.01–0.1°/s/°C until thermal equilibrium.</li>
                    <li class="p-2 bg-slate-900 rounded"><span class="text-red-400">Baro blocked:</span> Static pressure error from prop wash if baro is unprotected → altitude oscillation. Mount baro with foam cover or use separate port.</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>5.6 Flight Mode Comparison</h3>
    <p>ArduPilot and PX4 use different naming conventions for equivalent modes. The table below maps modes by function, active control loops, and use case — critical context for AI integration design.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">ArduPilot Mode</th>
                    <th class="p-3">PX4 Equivalent</th>
                    <th class="p-3">Active PID Layers</th>
                    <th class="p-3">Pilot Controls</th>
                    <th class="p-3">GPS Required</th>
                    <th class="p-3">Use Case</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700 text-slate-300 text-xs">
                <tr class="bg-slate-800">
                    <td class="p-3 font-mono text-white">STABILIZE (0)</td>
                    <td class="p-3 font-mono">Manual / Stabilized</td>
                    <td class="p-3">Rate only (Layer 4)</td>
                    <td class="p-3">Roll/pitch angle, yaw rate, throttle (direct)</td>
                    <td class="p-3 text-red-400">No</td>
                    <td class="p-3">Emergency fallback, indoor GPS-denied, experienced pilots</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 font-mono text-white">ACRO (1)</td>
                    <td class="p-3 font-mono">Acro</td>
                    <td class="p-3">Rate only — no attitude stabilization</td>
                    <td class="p-3">Body angular rates directly (stick = rate setpoint)</td>
                    <td class="p-3 text-red-400">No</td>
                    <td class="p-3">FPV racing, aerobatics. No self-leveling.</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 font-mono text-white">ALT_HOLD (2)</td>
                    <td class="p-3 font-mono">Altitude</td>
                    <td class="p-3">Attitude + Rate + Altitude (vertical vel PID)</td>
                    <td class="p-3">Roll/pitch angle, yaw rate, climb rate (not abs throttle)</td>
                    <td class="p-3 text-red-400">No</td>
                    <td class="p-3">Altitude hold without GPS. Horizontal drift with wind.</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 font-mono text-white">LOITER (5)</td>
                    <td class="p-3 font-mono">Position</td>
                    <td class="p-3">All layers — full cascade</td>
                    <td class="p-3">Velocity (stick = velocity setpoint; center = hold)</td>
                    <td class="p-3 text-emerald-400">Yes</td>
                    <td class="p-3">Hover + drift-free GPS hold. Standard operator mode.</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 font-mono text-white">POSHOLD (16)</td>
                    <td class="p-3 font-mono">Position (with POSCTL_ACC_EN)</td>
                    <td class="p-3">All layers; blends STABILIZE at high stick with LOITER at low stick</td>
                    <td class="p-3">Lean angle at high stick; position hold at low stick</td>
                    <td class="p-3 text-emerald-400">Yes</td>
                    <td class="p-3">Advanced FPV with GPS safety net. More responsive than LOITER.</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 font-mono text-white">AUTO (3)</td>
                    <td class="p-3 font-mono">Mission</td>
                    <td class="p-3">All layers; mission waypoints fed as position targets</td>
                    <td class="p-3">Mode switch + emergency override only</td>
                    <td class="p-3 text-emerald-400">Yes</td>
                    <td class="p-3">Pre-uploaded waypoint mission execution (surveys, logistics)</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 font-mono text-sky-300 font-bold">GUIDED (4)</td>
                    <td class="p-3 font-mono text-sky-300 font-bold">Offboard</td>
                    <td class="p-3">All layers; setpoints from companion computer in real-time</td>
                    <td class="p-3">Mode switch only; CC sends MAVLink / uXRCE-DDS commands</td>
                    <td class="p-3 text-emerald-400">Yes (standard)</td>
                    <td class="p-3 text-sky-300">AI/ML inference on companion computer → real-time autonomous flight</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 font-mono text-amber-300">GUIDED_NOGPS (20)</td>
                    <td class="p-3 font-mono text-amber-300">Offboard (optical flow / VIO)</td>
                    <td class="p-3">Attitude + Rate only; CC runs own position loop with VIO/flow</td>
                    <td class="p-3">Mode switch; CC sends SET_ATTITUDE_TARGET</td>
                    <td class="p-3 text-amber-400">No (VIO/flow)</td>
                    <td class="p-3 text-amber-300">Indoor, GPS-denied, tunnel, urban canyon operations</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 font-mono text-white">RTL (6)</td>
                    <td class="p-3 font-mono">Return</td>
                    <td class="p-3">All layers; navigates to home at RTL_ALT then descends</td>
                    <td class="p-3">Triggered by failsafe or mode switch</td>
                    <td class="p-3 text-emerald-400">Yes</td>
                    <td class="p-3">RC loss / GCS loss failsafe recovery</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 font-mono text-white">SMARTRTL (21)</td>
                    <td class="p-3 font-mono">—</td>
                    <td class="p-3">All layers; replays GPS breadcrumb trail in reverse</td>
                    <td class="p-3">Triggered by failsafe</td>
                    <td class="p-3 text-emerald-400">Yes</td>
                    <td class="p-3">Avoids obstacles on return path (replays actual flown path)</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 font-mono text-white">LAND (9)</td>
                    <td class="p-3 font-mono">Land</td>
                    <td class="p-3">Vertical velocity + attitude + rate</td>
                    <td class="p-3">Triggered by failsafe or mode switch</td>
                    <td class="p-3 text-amber-400">Optional</td>
                    <td class="p-3">Descend vertically at current position. Used when RTL would overfly obstacles.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <figure class="my-6">
        <img src="images/m5_quadrotor_hover.png" alt="Quadrotor hover diagram showing equal thrust on all four motors" class="rounded-lg w-full max-w-2xl mx-auto">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Hover condition: all four motors produce equal thrust, net torques cancel (CW vs CCW motor pairs). The altitude controller holds vertical velocity at zero by adjusting total thrust. Source: <a href="https://commons.wikimedia.org/wiki/File:Quadrotorhover.svg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Purpy Pupple / Wikimedia Commons (CC BY-SA 3.0)</a></figcaption>
    </figure>

    <!-- ============================================================ -->
    <h3>5.7 MAVLink 2, DroneCAN, and uXRCE-DDS Communication Architecture</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6">
            <h3 class="text-sky-400 font-bold text-lg mb-3">MAVLink 2 Protocol</h3>
            <p class="text-slate-300 text-sm mb-3">MAVLink 2 (2017+) is the dominant telemetry and command protocol for both ArduPilot and PX4. Key improvements over v1:</p>
            <ul class="space-y-2 text-xs font-mono text-slate-300">
                <li class="p-2 bg-slate-900 rounded"><strong class="text-white">Message Signing:</strong> Optional HMAC-SHA256 authentication. 13-byte signature appended to signed packets (incompatibility flag bit 0x01 set). Secret key is 32 bytes; protects against replay and spoofing attacks. Critical for DoD operations.</li>
                <li class="p-2 bg-slate-900 rounded"><strong class="text-white">Extended Message IDs:</strong> 24-bit message ID (vs 8-bit in v1) = 16 million possible message types (vs 256). Enables vendor-specific messages without collision.</li>
                <li class="p-2 bg-slate-900 rounded"><strong class="text-white">Zero-padded payload trimming:</strong> Empty bytes at end of payload removed before transmission → smaller frames, ~10–30% bandwidth reduction.</li>
                <li class="p-2 bg-slate-900 rounded"><strong class="text-white">Max packet size:</strong> 280 bytes (signed) / 263 bytes (unsigned). Transport-agnostic: UART, UDP, TCP, USB.</li>
                <li class="p-2 bg-slate-900 rounded"><strong class="text-white">Backward compatible:</strong> MAVLink 2 parsers read MAVLink 1 frames; system auto-negotiates version on first connection.</li>
            </ul>
            <p class="text-slate-400 text-xs mt-3">ArduPilot config: SERIAL2_PROTOCOL = 2 (MAVLink2), SERIAL2_BAUD = 921600. CC must send HEARTBEAT at ≥1 Hz to prevent GCS failsafe (FS_GCS_ENABLE = 3 for GUIDED-mode-only protection).</p>
        </div>

        <div class="bg-slate-800/60 border border-violet-700/60 rounded-xl p-6">
            <h3 class="text-violet-400 font-bold text-lg mb-3">PX4 uXRCE-DDS (Micro XRCE-DDS Bridge)</h3>
            <p class="text-slate-300 text-sm mb-3">PX4's primary ROS 2 integration since v1.13 — replaces the deprecated Fast-RTPS bridge. Provides first-class, low-latency access to PX4 internals from ROS 2 nodes.</p>
            <div class="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-300 mb-3">
                <div class="text-slate-500 mb-1">// Architecture:</div>
                <div>[PX4 Firmware]</div>
                <div class="pl-4">uxrce_dds_client (built-in) ← publishes/subscribes uORB</div>
                <div class="pl-8">↕ Serial (921600 baud) or UDP (port 8888)</div>
                <div>[Companion Computer]</div>
                <div class="pl-4">micro-xrce-dds-agent ← eProsima agent</div>
                <div class="pl-8">↕ DDS (Cyclone DDS or Fast DDS)</div>
                <div class="pl-4">ROS 2 nodes ← /fmu/out/*, /fmu/in/*</div>
            </div>
            <ul class="space-y-1 text-xs font-mono text-slate-300">
                <li>> Topics published by PX4: /fmu/out/vehicle_odometry, /fmu/out/vehicle_status, /fmu/out/sensor_combined</li>
                <li>> Topics subscribed by PX4: /fmu/in/trajectory_setpoint, /fmu/in/offboard_control_mode, /fmu/in/vehicle_command</li>
                <li>> Key params: UXRCE_DDS_CFG (port), UXRCE_DDS_AG_IP (agent IP), UXRCE_DDS_DOM_ID (DDS domain)</li>
                <li>> PX4 v1.15: PX4 ROS 2 Interface Library (C++) allows custom flight modes as ROS 2 peers</li>
                <li>> PX4 v1.15 experimental: Zenoh pico transport for edge-cloud bridging</li>
            </ul>
        </div>
    </div>

    <div class="bg-slate-800/60 border border-amber-700/60 rounded-xl p-6 mb-8">
        <h3 class="text-amber-400 font-bold text-lg mb-3">DroneCAN (formerly UAVCAN v0) — Smart Peripheral Bus</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="text-slate-300 space-y-2">
                <p>DroneCAN is a lightweight CAN-bus protocol (250 kbps–1 Mbps) for reliable communication with autopilot peripherals. It provides plug-and-play node discovery, redundant bus topologies, and distributed time synchronization.</p>
                <p><strong class="text-white">Why CAN over I2C/SPI for peripherals?</strong> CAN supports up to 127 nodes on a single twisted-pair, runs up to 40 m cable length, has built-in error detection (CRC + bit stuffing), and is immune to the multi-master arbitration issues that plague I2C over long cables.</p>
                <p>ArduPilot DroneCAN config: CAN_P1_DRIVER = 1, CAN_D1_PROTOCOL = 1 (DroneCAN). Devices auto-register via node ID broadcast.</p>
            </div>
            <div>
                <p class="text-slate-400 text-xs mb-2">Supported DroneCAN device classes (auto-discovered):</p>
                <ul class="space-y-1 text-xs font-mono text-slate-300">
                    <li class="p-2 bg-slate-900 rounded">GPS receivers — uBlox F9P, Septentrio, ARK GPS (RTK over DroneCAN)</li>
                    <li class="p-2 bg-slate-900 rounded">ESCs — Zubax Myxa, Holybro Kotleta20, T-Motor Flame (bidirectional RPM telemetry)</li>
                    <li class="p-2 bg-slate-900 rounded">Airspeed sensors — Matek ASPD-DLVR, MS4525 via adapter node</li>
                    <li class="p-2 bg-slate-900 rounded">Compass — RM3100 on CAN adapter node (up to 1 m from autopilot for motor noise isolation)</li>
                    <li class="p-2 bg-slate-900 rounded">LED / Buzzer / Safety switch — DroneCAN adapter nodes for distributed I/O</li>
                    <li class="p-2 bg-slate-900 rounded">Power modules — Matek AP_PERIPH CAN power monitor (voltage + current over DroneCAN)</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>5.8 AUTOTUNE — Automated PID Gain Optimization</h3>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-6">
        <h3 class="text-sky-400 font-bold text-lg mb-3">ArduPilot AUTOTUNE Process</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="space-y-3 text-slate-300">
                <p>AUTOTUNE (flight mode 17) performs a series of controlled <em>twitches</em> in each axis (roll, pitch, yaw independently) while holding altitude in AltHold or Loiter. It measures the step response and uses a Ziegler-Nichols-inspired iterative algorithm to find optimal $K_p$, $K_i$, $K_d$ values.</p>
                <div class="bg-slate-900 rounded p-3 font-mono text-xs">
                    <div class="text-slate-400 mb-1">Procedure:</div>
                    <div>1. Arm + take off in AltHold at ~5 m</div>
                    <div>2. Switch to AUTOTUNE mode</div>
                    <div>3. FC performs rapid roll twitches (~40° amplitude)</div>
                    <div>4. Measures: overshoot, rise time, settling time</div>
                    <div>5. Adjusts Kp/Kd iteratively until target response</div>
                    <div>6. Repeats for pitch, then yaw</div>
                    <div>7. Land + disarm to save (land without switching modes)</div>
                    <div class="text-amber-400 mt-1">Duration: ~8–15 min per axis in calm conditions</div>
                </div>
            </div>
            <div class="space-y-2 text-slate-300 text-sm">
                <p><strong class="text-white">Key AUTOTUNE parameters:</strong></p>
                <ul class="space-y-1 font-mono text-xs">
                    <li class="p-2 bg-slate-900 rounded">AUTOTUNE_AGGR (0.1): Aggressiveness (0.05–0.1). Higher = faster response, more oscillation risk. Start at 0.075 for large craft.</li>
                    <li class="p-2 bg-slate-900 rounded">AUTOTUNE_AXES (7): Bitmask — bit0=roll, bit1=pitch, bit2=yaw. Set to 3 (roll+pitch only) for first run.</li>
                    <li class="p-2 bg-slate-900 rounded">AUTOTUNE_MIN_D (0.001): Minimum D gain; prevents near-zero D on very stiff airframes.</li>
                </ul>
                <p class="text-amber-400 text-xs mt-2">Important: AUTOTUNE produces a good initial tune but does NOT set notch filters. Manual log analysis is required to configure INS_HNTCH_FREQ (harmonic notch) for motor noise peaks. Use AUTOTUNE first, then add filters.</p>
                <p class="text-slate-400 text-xs">PX4 equivalent: MC_AT_START parameter triggers in-flight autotune. Completes in ~40 s per axis. Results saved to parameter file.</p>
            </div>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>5.9 SITL and HITL Simulation</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm">
            <strong class="text-sky-400 block mb-3 text-base">SITL — Software In The Loop</strong>
            <p class="text-slate-300 mb-3">The complete autopilot firmware binary runs on a host PC. A physics model (JSBSim, Morse, or Gazebo) simulates aerodynamics, motor physics, and sensor responses. <em>No physical hardware required.</em></p>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>> ArduPilot SITL: built into all firmware builds. Run with: <code class="text-white">sim_vehicle.py -v ArduCopter --console --map</code></li>
                <li>> PX4 SITL: Gazebo Sim (Gz) is default since v1.15. Launch: <code class="text-white">make px4_sitl gz_x500</code></li>
                <li>> Gazebo Classic (11.x) vs Gz Sim (Harmonic/Ionic): PX4 migrated to Gz Sim for v1.15; ArduPilot supports both via ardupilot_gazebo plugin</li>
                <li>> Multiple simultaneous vehicles: SITL supports spawning N instances for swarm testing</li>
                <li>> Use case: algorithm development, regression testing CI/CD, training data collection for ML models</li>
            </ul>
        </div>

        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm">
            <strong class="text-amber-400 block mb-3 text-base">HITL — Hardware In The Loop</strong>
            <p class="text-slate-300 mb-3">Physical autopilot hardware (Pixhawk) runs its actual firmware, but sensor inputs are replaced with simulated data from the host PC. Motor outputs are intercepted (not sent to real motors). <em>Tests the actual firmware on real silicon.</em></p>
            <ul class="space-y-1 font-mono text-xs text-slate-300">
                <li>> ArduPilot HITL: enabled via SIM_ON_HW = 1. Connects Pixhawk USB to PC; Gazebo or JSBSim provides physics.</li>
                <li>> PX4 HITL: set SYS_HITL = 1. Connects via QGroundControl; Gazebo generates sensor data, sends over MAVLink to real Pixhawk.</li>
                <li>> Advantage over SITL: catches hardware-specific bugs — interrupt timing, SPI bus contention, sensor driver edge cases, FMU/IO coprocessor interaction</li>
                <li>> Limitation: cannot test IMU vibration response or ESC communication timing</li>
                <li>> Use case: final firmware validation before first flight, AFCS certification evidence for DoD</li>
            </ul>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>5.10 Failsafe Configuration</h3>
    <p>Both ArduPilot and PX4 implement layered failsafe architectures. Each layer triggers independently and the system escalates to the most conservative safe action given current state.</p>

    <div class="space-y-4 mb-8">
        <div class="bg-slate-900 p-5 rounded border-l-4 border-red-500 text-sm">
            <strong class="text-red-400 block mb-2">RC Failsafe (Loss of RC Signal)</strong>
            <div class="font-mono text-xs text-slate-300 space-y-1">
                <p><strong class="text-white">ArduPilot:</strong> Trigger: RC signal absent or below FS_THR_VALUE for &gt;FS_THR_TIMEOUT seconds (default 1.0 s). FS_THR_ENABLE options: 1=Always RTL, 2=Continue AUTO else RTL, 3=Land, 4=SmartRTL or RTL, 5=SmartRTL or Land.</p>
                <p><strong class="text-white">PX4:</strong> COM_RC_LOSS_T (default 0.5 s) timeout → COM_RC_IN_MODE action: 0=Stabilized, 1=Attitude, 2=Position, 3=Land, 4=Auto-Loiter, 5=RTL.</p>
                <p class="text-amber-400">If armed but not yet flying: FS triggers Land immediately — no RTL (home position not yet set).</p>
            </div>
        </div>

        <div class="bg-slate-900 p-5 rounded border-l-4 border-amber-500 text-sm">
            <strong class="text-amber-400 block mb-2">Battery Failsafe</strong>
            <div class="font-mono text-xs text-slate-300 space-y-1">
                <p><strong class="text-white">ArduPilot:</strong> BATT_LOW_VOLT (3.5 V/cell on 6S = 21.0 V) → warn. BATT_CRT_VOLT (3.3 V/cell = 19.8 V) → FS_BATT_ENABLE action (Land/RTL/SmartRTL). BATT_CRT_MAH (mAh consumed) is more reliable than voltage — voltage sags under load, mAh-based threshold does not.</p>
                <p><strong class="text-white">PX4:</strong> BAT_CRIT_THR (default 0.07 = 7% remaining) → RTL. BAT_EMERGEN_THR (0.05 = 5%) → Land immediately.</p>
            </div>
        </div>

        <div class="bg-slate-900 p-5 rounded border-l-4 border-purple-500 text-sm">
            <strong class="text-purple-400 block mb-2">GCS / Companion Computer Failsafe</strong>
            <div class="font-mono text-xs text-slate-300 space-y-1">
                <p><strong class="text-white">ArduPilot:</strong> Trigger: no MAVLink HEARTBEAT from GCS for FS_GCS_TIMEOUT (default 5 s). FS_GCS_ENABLE = 3: protect only in GUIDED mode (CC crash mid-GUIDED triggers RTL, but AUTO mission continues without GCS).</p>
                <p><strong class="text-white">PX4:</strong> COM_DL_LOSS_T (default 10 s) → COM_OBL_ACT action. Companion computer must publish HEARTBEAT via MAVLink or uXRCE-DDS HEARTBEAT topic at ≥1 Hz.</p>
                <p class="text-amber-400">For AI drones: CC must send HEARTBEAT at ≥1 Hz. Loss of CC during GUIDED → FC reverts to RTL autonomously.</p>
            </div>
        </div>

        <div class="bg-slate-900 p-5 rounded border-l-4 border-sky-500 text-sm">
            <strong class="text-sky-400 block mb-2">EKF Failsafe</strong>
            <div class="font-mono text-xs text-slate-300 space-y-1">
                <p>Triggers when EKF covariance exceeds EK3_CHECK_SCALE (default 0.8). In LOITER/GUIDED: mode changes to ALT_HOLD to prevent position-hold loop from running on bad position data and issuing full-throttle random corrections.</p>
                <p class="text-amber-400">EKF arming gate: all 24 state variances must remain below EK3_CHECK_SCALE for ≥10 s before arm. Prevents arming with unconverged state estimates.</p>
            </div>
        </div>

        <div class="bg-slate-900 p-5 rounded border-l-4 border-emerald-500 text-sm">
            <strong class="text-emerald-400 block mb-2">Geofencing</strong>
            <div class="font-mono text-xs text-slate-300 space-y-1">
                <p><strong class="text-white">ArduPilot:</strong> FENCE_ENABLE = 1. Types: FENCE_TYPE = 1 (circle), 2 (altitude), 4 (polygon). FENCE_ACTION: 0=Report only, 1=RTL/Land, 2=Always Land. FENCE_RADIUS (cylinder radius from home, meters), FENCE_ALT_MAX (ceiling, meters AGL).</p>
                <p><strong class="text-white">PX4 v1.15:</strong> Enhanced geofence with "robust boundary enforcement." Supports inclusion/exclusion zones. GF_ACTION: 0=None, 1=Warning, 2=Hold mode, 3=RTL, 4=Terminate. Upload geofence via QGC Plan or MAVLink MAV_CMD_DO_FENCE_ENABLE.</p>
                <p>Geofence violation during GUIDED/Offboard: immediate failsafe action overrides all companion computer commands. The FC autonomously enforces the boundary regardless of CC instruction.</p>
            </div>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>5.11 Pre-Arm Checks</h3>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">ARMING_CHECK Bitmask (ArduPilot — set to 1 to enable all)</div>
        <div class="overflow-x-auto">
            <table class="w-full text-xs">
                <thead>
                    <tr class="bg-slate-800/50 text-slate-400">
                        <th class="p-2 text-left">Value</th>
                        <th class="p-2 text-left">Check</th>
                        <th class="p-2 text-left">Failure Consequence If Bypassed</th>
                    </tr>
                </thead>
                <tbody class="text-slate-300 font-mono">
                    <tr class="border-t border-slate-800"><td class="p-2 text-slate-500">2</td><td class="p-2 text-white">Barometer</td><td class="p-2 text-red-300">Invalid baro → altitude hold oscillates or descends unexpectedly</td></tr>
                    <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-2 text-slate-500">4</td><td class="p-2 text-rose-300">Compass</td><td class="p-2 text-red-300">Uncalibrated compass → yaw error → velocity decomposition wrong → fly-away</td></tr>
                    <tr class="border-t border-slate-800"><td class="p-2 text-slate-500">8</td><td class="p-2 text-rose-300">GPS lock (HDOP)</td><td class="p-2 text-red-300">HDOP &gt;2.5 → 10 m position error → LOITER "corrects" by flying 10 m in random direction</td></tr>
                    <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-2 text-slate-500">16</td><td class="p-2 text-rose-300">IMU (INS)</td><td class="p-2 text-red-300">High vibration pre-arm → D-term amplifies noise → oscillation on takeoff</td></tr>
                    <tr class="border-t border-slate-800"><td class="p-2 text-slate-500">32</td><td class="p-2 text-white">Parameters / EKF</td><td class="p-2 text-red-300">Unconverged EKF → position estimate invalid → GUIDED/LOITER runs on wrong position</td></tr>
                    <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-2 text-slate-500">64</td><td class="p-2 text-rose-300">RC channels</td><td class="p-2 text-red-300">RC failsafe not properly configured → RC loss not detected → no failsafe action on signal loss</td></tr>
                    <tr class="border-t border-slate-800"><td class="p-2 text-slate-500">256</td><td class="p-2 text-amber-300">Battery</td><td class="p-2 text-amber-300">Low battery at arm → mission starts with insufficient charge for RTL</td></tr>
                    <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-2 text-slate-500">1024</td><td class="p-2 text-amber-300">Logging (SD card)</td><td class="p-2 text-amber-300">No flight log → no post-crash forensics. Cannot diagnose EKF divergence or hardware failure.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>5.12 GUIDED and GUIDED_NOGPS — AI Companion Computer Integration</h3>

    <div class="bg-sky-900/30 p-6 rounded border border-sky-700/60 mb-6 text-sm">
        <strong class="text-sky-300 text-base block mb-3">GUIDED Mode — Real-Time Companion Computer Control (ArduPilot)</strong>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 font-mono text-xs">
            <div>
                <strong class="text-sky-400">MAVLink messages the CC sends:</strong>
                <ul class="space-y-1 mt-1">
                    <li>SET_POSITION_TARGET_LOCAL_NED (#84): pos + vel + accel targets in NED. type_mask bitmask selects active fields.</li>
                    <li>SET_POSITION_TARGET_GLOBAL_INT (#86): lat/lon/alt targets in WGS-84.</li>
                    <li>SET_ATTITUDE_TARGET (#82): quaternion attitude + body rate feedforward + thrust 0–1. Bypasses position/velocity loops.</li>
                    <li>COMMAND_LONG (#76): MAV_CMD_DO_CHANGE_SPEED to modify cruise speed in flight.</li>
                </ul>
            </div>
            <div>
                <div class="p-3 bg-sky-900/20 rounded">
                    <strong class="text-sky-400">type_mask field for SET_POSITION_TARGET_LOCAL_NED:</strong><br>
                    Bit set to 1 = IGNORE that field. Example:<br>
                    type_mask = 0b0000111111000111<br>
                    = ignore accel + yaw + yaw_rate<br>
                    = use position (x,y,z) + velocity (vx,vy,vz) feedforward<br>
                    Velocity feedforward reduces position controller lag by ~80% in dynamic tracking.
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm">
            <strong class="text-sky-400 block mb-3">GPS-Denied: Optical Flow</strong>
            <ul class="space-y-2 font-mono text-xs text-slate-300">
                <li>> Hardware: Ark Flow (CAN) or PX4Flow (USB) + LiDAR rangefinder (TFmini, Benewake CE30)</li>
                <li>> ArduPilot: FLOW_ENABLE = 1, EK3_SRC1_VELXY = 5 (optical flow), EK3_SRC1_POSZ = 6 (rangefinder)</li>
                <li>> PX4: SENS_FLOW_MAXR, EKF2_AID_MASK bit 1 (optical flow), EKF2_HGT_REF = 2 (range sensor)</li>
                <li>> Limitation: requires textured surface, altitude &lt;8 m, fails over water/uniform floors</li>
                <li>> Velocity accuracy: ±0.1 m/s in good lighting over textured floor</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm">
            <strong class="text-sky-400 block mb-3">GPS-Denied: VIO / External Pose (VSLAM)</strong>
            <ul class="space-y-2 font-mono text-xs text-slate-300">
                <li>> Hardware: Luxonis OAK-D, custom stereo, RealSense D435i (T265 discontinued Aug 2022)</li>
                <li>> CC sends VISION_POSITION_ESTIMATE (#102) or ODOMETRY (#331) via MAVLink</li>
                <li>> ArduPilot: EK3_SRC1_POSXY = 6 (ExternalNav), VISO_TYPE = 1</li>
                <li>> PX4: EKF2_EV_CTRL bitmask, EKF2_HGT_REF = 3 (vision)</li>
                <li>> Transition GPS → VIO: ~2–3 s for EKF to converge on new source. CC must detect GPS quality via GPS_RAW_INT.fix_type and coordinate the switch.</li>
                <li>> Accuracy: ±0.05 m in well-lit feature-rich environment</li>
            </ul>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>5.13 PID Tuning Videos</h3>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">ArduCopter Tuning — AUTOTUNE, PIDs &amp; Filters</h3>
        <p class="text-slate-400 text-sm mb-3">Comprehensive walkthrough of ArduCopter tuning: using AUTOTUNE mode, then manually refining PIDs with log analysis, configuring harmonic notch filters for motor noise, and verifying results with Blackbox Explorer. Covers both theory and practical parameter settings.</p>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/AF6aA2z6rhw" title="Arducopter Tuning (AUTOTUNE, PIDs &amp; FILTERS, FLIGHT TESTS!)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">How Does a PID Controller Work? — Quadcopter Explained</h3>
        <p class="text-slate-400 text-sm mb-3">Clear animated explanation of P, I, and D terms in the context of quadcopter flight control — covering the math intuition, what each term does to flight behavior, and why all three are needed. Ideal foundation before diving into parameter tuning.</p>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/dMRDzicSvXk" title="How does PID controller work? Simple Explanation on Quadcopter" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>5.14 External References</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">PX4 Documentation</strong>
            <ul class="space-y-1 text-sm">
                <li><a href="https://docs.px4.io/v1.15/en/releases/1.15" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">PX4 v1.15 Release Notes</a></li>
                <li><a href="https://docs.px4.io/main/en/flight_stack/controller_diagrams" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">PX4 Controller Diagrams</a></li>
                <li><a href="https://docs.px4.io/main/en/middleware/uxrce_dds" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">uXRCE-DDS (PX4-ROS 2 Bridge)</a></li>
                <li><a href="https://docs.px4.io/main/en/config_mc/pid_tuning_guide_multicopter" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">PX4 Multicopter PID Tuning Guide</a></li>
                <li><a href="https://docs.px4.io/main/en/flight_modes/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">PX4 Flight Modes Reference</a></li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2">ArduPilot Documentation</strong>
            <ul class="space-y-1 text-sm">
                <li><a href="https://ardupilot.org/copter/docs/common-choosing-a-flight-controller.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Choosing a Flight Controller</a></li>
                <li><a href="https://ardupilot.org/copter/docs/tuning.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Advanced Tuning Guide (ArduCopter)</a></li>
                <li><a href="https://ardupilot.org/copter/docs/autotune.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">AUTOTUNE — ArduCopter</a></li>
                <li><a href="https://ardupilot.org/dev/docs/ekf3-in-ardupilot.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">EKF3 in ArduPilot</a></li>
                <li><a href="https://ardupilot.org/copter/docs/common-uavcan-setup-advanced.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">DroneCAN Setup</a></li>
                <li><a href="https://ardupilot.org/dev/docs/sitl-with-gazebo.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">SITL with Gazebo</a></li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">Protocols and Standards</strong>
            <ul class="space-y-1 text-sm">
                <li><a href="https://mavlink.io/en/guide/mavlink_2.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">MAVLink 2 Protocol Guide</a></li>
                <li><a href="https://mavlink.io/en/guide/message_signing.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">MAVLink Message Signing</a></li>
                <li><a href="https://dronecan.github.io/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">DroneCAN Protocol Specification</a></li>
                <li><a href="https://www.eprosima.com/index.php/products-all/eprosima-micro-xrce-dds" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">eProsima Micro XRCE-DDS</a></li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-violet-400 block mb-2">Betaflight (FPV / Racing)</strong>
            <ul class="space-y-1 text-sm">
                <li><a href="https://betaflight.com/docs/wiki/release/Betaflight-4-5-Release-Notes" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Betaflight 4.5 Release Notes</a></li>
                <li><a href="https://oscarliang.com/betaflight-4-5/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Betaflight 4.5 Feature Guide (Oscar Liang)</a></li>
            </ul>
            <p class="text-slate-400 text-xs mt-2">Betaflight 4.5 key additions: Dimmable RPM harmonic filters (weight 0–100 per harmonic independently), RPM + pre-filter gyro in Blackbox by default, improved feedforward. Targets FPV racing — no GPS, no position hold. Rate-only control loop.</p>
        </div>
    </div>

    <div class="bg-emerald-900/20 border border-emerald-500/50 p-4 rounded text-emerald-200 text-sm">
        <strong>Integration Pattern for AI Drone (Production Architecture):</strong> Use GUIDED mode (with GPS, ArduPilot) or Offboard mode (PX4 via uXRCE-DDS) for outdoor operations. Automatically transition to GUIDED_NOGPS/Offboard with VIO when entering GPS-denied environments. The companion computer monitors GPS quality via GPS_RAW_INT.fix_type (ArduPilot) or vehicle_gps_position (PX4 DDS topic), coordinates EKF source switching (EK3_SRC1_POSXY transition), waits 2–3 s for EKF convergence, then resumes position commands. The flight controller enforces geofence and battery failsafes independently of CC state — a crashed CC cannot override these hardware protections.
    </div>
</div>
`;
