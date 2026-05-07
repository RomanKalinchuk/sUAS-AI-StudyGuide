export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 10</span>
    <h2>Power Electronics & Circuit Design for AI Drones</h2>
    <p>Power architecture is the unglamorous foundation that everything else depends on. A poorly designed power tree will cause brownouts that corrupt flight controller state, reboot the companion computer mid-flight, or silently introduce noise into IMU readings. This module covers every layer from the main battery bus down to the load capacitors at the Jetson's VDD rail.</p>

    <h3>10.1 Power Distribution Architecture</h3>
    <p>The main Power Distribution Board (PDB) is the high-current switching matrix of the drone. On a 6S (22.2V nominal) quad carrying a 25W AI payload, peak current can exceed 200A during an aggressive pitch maneuver. This is not a place for off-the-shelf PCBs with 2oz copper pours.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm font-mono">
            <strong class="text-sky-400 text-base block mb-3">PDB Trace Sizing</strong>
            <p class="text-slate-400 font-sans text-xs mb-3">IPC-2221A standard governs current capacity. For a 6S 200A continuous rail:</p>
            <ul class="space-y-1 text-slate-300">
                <li>> Copper weight: 4oz (140 µm)</li>
                <li>> Trace width required: ~25mm for 200A</li>
                <li>> Temperature rise target: &lt;10°C above ambient</li>
                <li>> Practical solution: solid copper bus bars (3mm thick), not PCB traces</li>
                <li>> ESC pad islands soldered directly to 4oz internal planes</li>
                <li>> Star-ground topology: every ESC GND to a single star node</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm font-mono">
            <strong class="text-sky-400 text-base block mb-3">Connectors & Bus Capacitors</strong>
            <ul class="space-y-1 text-slate-300">
                <li>> Battery: XT90 (90A continuous, 120A burst)</li>
                <li>> ESC feeds: XT60 (60A cont.) or MR60 for 6S systems</li>
                <li>> XT30: only for BEC outputs (&lt;30A)</li>
                <li>> Bus capacitors: 4x 470µF 35V MLCC in parallel at main bus</li>
                <li>> Bulk: 2x 1000µF 35V Panasonic FR or Rubycon ZLH near battery input</li>
                <li>> Total recommended: 2000–4700µF on the main +V rail</li>
                <li>> Placement: within 5cm of ESC power inputs</li>
            </ul>
        </div>
    </div>

    <div class="math-block">
        <strong>Why 2000–4700µF? — Transient Current Demand Calculation</strong><br><br>
        When all 4 motors simultaneously step from 50% to 100% throttle (e.g., a full-pitch crash avoidance maneuver),
        peak current draw spikes by ~ΔI = 80A in ~ΔT = 500µs (the DSHOT command response time + motor electrical time constant).<br><br>

        Voltage droop (ΔV) = (ΔI × ΔT) / C<br>
        Target ΔV ≤ 0.5V (to keep downstream BECs in regulation)<br><br>

        C ≥ (80A × 500×10⁻⁶ s) / 0.5V<br>
        C ≥ 0.04 / 0.5 = <strong>80,000µF</strong> for an ideal capacitor<br><br>

        In practice, the battery's own internal capacitance + wiring inductance limits the frequency of concern to ~1–10kHz.
        At 1kHz, the ESC's internal gate capacitance and switching node caps handle the high-frequency noise.
        The PDB bus capacitors target the 1–50kHz range: <strong>470µF × 4 = 1880µF is the practical engineering value</strong>,
        supplemented by the battery's own low-impedance source at lower frequencies.
    </div>

    <h3>10.2 BEC (Battery Elimination Circuit) Design</h3>
    <p>A BEC converts the high-voltage LiPo bus down to regulated 5V and 12V rails for flight controller, GPS modules, telemetry radios, RC receivers, and servos. On a 6S system (up to 25.2V in), a <strong>linear regulator is strictly forbidden</strong> for anything above a few milliamps: a linear regulator dropping 25.2V → 5V at 1A dissipates (25.2 - 5) × 1 = 20.2W as heat. That is physically impossible to manage on a drone airframe.</p>

    <div class="space-y-6 mb-8">
        <div class="hw-card p-6 rounded-xl">
            <h4 class="text-white mt-0">LM2596 — The Workhorse (150kHz Boost)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono text-slate-300">
                <ul class="space-y-1">
                    <li>> Vin: 4.5V – 40V</li>
                    <li>> Vout: Adjustable 1.23V – 37V (via R divider)</li>
                    <li>> Iout: 3A continuous</li>
                    <li>> Switching freq: 150kHz fixed</li>
                </ul>
                <ul class="space-y-1">
                    <li>> Efficiency: 73–80% (lower frequency = larger inductor required)</li>
                    <li>> Typical inductor: 100µH, Isat ≥ 4A</li>
                    <li>> Output cap: 220µF electrolytic + 10µF MLCC</li>
                    <li>> Use case: RC receiver rail (5V/1A), camera 12V rail</li>
                </ul>
            </div>
        </div>

        <div class="hw-card p-6 rounded-xl">
            <h4 class="text-white mt-0">MP2359 — High Frequency, Tiny Footprint (1.4MHz)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono text-slate-300">
                <ul class="space-y-1">
                    <li>> Vin: 4.5V – 24V</li>
                    <li>> Vout: 0.81V – 15V adjustable</li>
                    <li>> Iout: 1.2A continuous</li>
                    <li>> Switching freq: 1.4MHz</li>
                </ul>
                <ul class="space-y-1">
                    <li>> Efficiency: 90–94% at mid-load</li>
                    <li>> SOT-23-6 package — tiny footprint</li>
                    <li>> Inductor: 2.2µH (small, due to high frequency)</li>
                    <li>> Use case: Telemetry radio power (5V), GPS module (3.3V)</li>
                </ul>
            </div>
        </div>

        <div class="hw-card p-6 rounded-xl">
            <h4 class="text-white mt-0">TPS54560 — High-Current 5A Rail (570kHz)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono text-slate-300">
                <ul class="space-y-1">
                    <li>> Vin: 4.5V – 60V</li>
                    <li>> Vout: 0.8V – 60V adjustable</li>
                    <li>> Iout: 5A continuous</li>
                    <li>> Switching freq: 570kHz</li>
                </ul>
                <ul class="space-y-1">
                    <li>> Efficiency: 92–95% at 3A load</li>
                    <li>> Integrated MOSFET (low Rds_on = 55mΩ upper, 40mΩ lower)</li>
                    <li>> Inductor: 10µH, Isat ≥ 6A</li>
                    <li>> Use case: Flight controller + Peripherals dedicated 5V/5A bus</li>
                </ul>
            </div>
        </div>

        <div class="hw-card p-6 rounded-xl">
            <h4 class="text-white mt-0">LTC3780 — The Buck-Boost Beast (for regulated output regardless of input)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono text-slate-300">
                <ul class="space-y-1">
                    <li>> Vin: 4V – 36V</li>
                    <li>> Vout: 0.8V – 30V (can be above or below Vin)</li>
                    <li>> Iout: Up to 20A with external FETs</li>
                    <li>> Switching freq: 200kHz – 400kHz (adjustable)</li>
                </ul>
                <ul class="space-y-1">
                    <li>> 4-switch buck-boost topology (seamless Vin=Vout transition)</li>
                    <li>> Efficiency: 94–97% peak</li>
                    <li>> Use case: Supplying 12V to Jetson Orin NX from a 3S–4S battery that may sag below 12V. Critical when battery can cross the output voltage.</li>
                    <li>> Requires: 4 external MOSFETs, complex layout</li>
                </ul>
            </div>
        </div>
    </div>

    <div class="bg-amber-900/20 border border-amber-500/50 p-4 rounded mb-6 text-amber-200 text-sm">
        <strong>6S System BEC Rule:</strong> On a 6S LiPo (22.2V nominal), always use a <strong>synchronous buck converter with integrated MOSFETs</strong> (TPS54560 class or better). The input voltage exceeds the absolute maximum rating of many cheap linear regulators. Verify the converter's absolute maximum Vin rating — most are 60V, but some budget ICs are 28V and will be destroyed by a freshly charged 6S (25.2V) if any voltage spike occurs.
    </div>

    <h3>10.3 Companion Computer Power Delivery (Jetson Orin NX)</h3>
    <p>The Jetson Orin NX at 25W peak requires a <strong>dedicated, high-quality power rail</strong> — it must never share a BEC with any ESC, servo, or motor. The reason: motor PWM switching creates enormous current transients that couple as voltage spikes onto shared rails. Even a 50mV glitch can cause LPDDR5 memory errors or trigger the Jetson's hardware undervoltage protection (UVLO), causing an instantaneous power-off.</p>

    <div class="math-block">
        <strong>Jetson Orin NX Power Requirements</strong><br><br>
        Nominal input: 5V–20V (carrier board dependent; most use 12V or 19V input)<br>
        Peak current (25W @ 12V input): 25W / 12V = 2.08A + ~15% margin = <strong>2.4A minimum regulator rating</strong><br>
        Surge current (GPU inference burst): up to 3.5A for &lt;50ms<br><br>

        Recommended regulator: Synchronous buck (e.g., TPS54560 configured for 12V/5A output)<br>
        — Synchronous (not diode rectified): efficiency ~94–96% vs ~82% for non-sync at this current level<br>
        — This matters: at 5A, a 12% efficiency difference = 0.72W extra heat inside the airframe
    </div>

    <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm mb-8">
        <strong class="text-sky-400 block mb-3">Output Capacitor Specification (at the Jetson power input pins)</strong>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-slate-300">
            <div>
                <p class="text-slate-400 font-sans mb-2">MLCC (Ceramic) — handles high-frequency transients:</p>
                <ul class="space-y-1">
                    <li>> Value: 4× 100µF X5R/X7R, 16V+ rating</li>
                    <li>> ESR: &lt;3mΩ typical (ceramic's key advantage)</li>
                    <li>> Placement: within 5mm of Jetson VIN pins</li>
                    <li>> Caution: X5R capacitance drops ~30% at 12V bias; derate accordingly (use 25V-rated caps for 12V rail)</li>
                </ul>
            </div>
            <div>
                <p class="text-slate-400 font-sans mb-2">Bulk Electrolytic — handles medium-frequency energy storage:</p>
                <ul class="space-y-1">
                    <li>> Value: 2× 470µF 16V electrolytic (or 1× 1000µF)</li>
                    <li>> ESR: &lt;50mΩ (low-ESR series: Panasonic FR, Rubycon ZLH)</li>
                    <li>> Do NOT use standard electrolytic (ESR 200–500mΩ) — they cannot source the required di/dt</li>
                    <li>> Parallel MLCC + electrolytic: resonance peak in impedance at ~100kHz requires a small series resistor (10–22mΩ) or ferrite bead in series with the bulk cap</li>
                </ul>
            </div>
        </div>
    </div>

    <h3>10.4 ESC Architecture and Digital Protocols</h3>
    <p>Electronic Speed Controllers (ESCs) convert the power bus voltage into variable 3-phase AC for brushless motors. The firmware defines the feature set and protocol capabilities.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm">
            <strong class="text-sky-400 text-base block mb-3">BLHeli32 vs AM32</strong>
            <table class="w-full text-xs font-mono">
                <thead><tr class="text-slate-400"><th class="text-left pb-2">Feature</th><th class="text-left pb-2">BLHeli32</th><th class="text-left pb-2">AM32</th></tr></thead>
                <tbody class="text-slate-300 space-y-1">
                    <tr><td class="py-1">License</td><td>Closed source</td><td>Open source (MIT)</td></tr>
                    <tr><td class="py-1">MCU</td><td>ARM Cortex-M3 only</td><td>ARM Cortex-M0/M3/M4</td></tr>
                    <tr><td class="py-1">DSHOT</td><td>150/300/600/1200</td><td>150/300/600</td></tr>
                    <tr><td class="py-1">Bidirectional DSHOT</td><td>Yes (v32.7+)</td><td>Yes</td></tr>
                    <tr><td class="py-1">Telemetry</td><td>RPM, Curr, Temp, Volt</td><td>RPM, Curr, Temp, Volt</td></tr>
                    <tr><td class="py-1">Configurator</td><td>BLHeliSuite32</td><td>AM32 Configurator</td></tr>
                    <tr><td class="py-1">Active dev</td><td>Stalled (~2023)</td><td>Active</td></tr>
                </tbody>
            </table>
        </div>
        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm">
            <strong class="text-sky-400 text-base block mb-3">Why DSHOT is Superior to PWM</strong>
            <ul class="space-y-2 text-slate-300 font-mono text-xs">
                <li>> <span class="text-white">PWM:</span> 1000–2000µs pulse width, analog timing, requires per-ESC calibration (min/max throttle endpoints). Noise-sensitive. Resolution: ~1000 steps.</li>
                <li>> <span class="text-white">DSHOT (Digital Shot):</span> Synchronous serial protocol. 11-bit throttle command + 1 telemetry request bit + 4-bit CRC. No calibration. No noise sensitivity.</li>
                <li>> <span class="text-white">Resolution:</span> 2048 steps (0–2047, with 0–47 reserved for commands). Finer resolution = smoother attitude control.</li>
                <li>> <span class="text-white">CRC:</span> 4-bit checksum prevents corrupted frames from being acted on — an ESC silently discards bad packets.</li>
                <li>> <span class="text-white">OneShot125:</span> Legacy protocol — analog PWM compressed to 125–250µs. Do not use on new builds.</li>
            </ul>
        </div>
    </div>

    <div class="math-block">
        <strong>DSHOT Speed Variants — Bit Rate and Frame Timing</strong><br><br>
        DSHOT150:   150 kbit/s  — bit period 6.67µs  — full frame (16 bits) = 106µs
        DSHOT300:   300 kbit/s  — bit period 3.33µs  — full frame = 53µs
        DSHOT600:   600 kbit/s  — bit period 1.67µs  — full frame = 26.7µs   ← Standard for high-performance quads
        DSHOT1200: 1200 kbit/s  — bit period 0.83µs  — full frame = 13.3µs   ← Requires short, shielded wiring (&lt;30cm)<br><br>

        At 400Hz control loop rate, the flight controller sends a new DSHOT frame every 2500µs.
        DSHOT600 frame completes in 26.7µs — only 1.07% of the loop period, leaving 98.9% for computation.
        DSHOT150 at 400Hz works but consumes 4.24% of the frame time — adequate but wasteful on a fast CPU.<br><br>

        <strong>Bidirectional DSHOT (DSHOT Bidir / RPM Telemetry):</strong>
        After each throttle frame, the ESC responds on the same wire (half-duplex) with an eRPM packet.
        The flight controller uses this for RPM-based notch filter frequencies in the gyro pipeline,
        dramatically improving noise rejection without manual filter tuning.
    </div>

    <h3>10.5 Current Sensing: INA219, INA226, INA3221</h3>
    <p>Accurate current sensing enables ArduPilot's battery failsafe and gives the operator real-time mAh consumed. All three Texas Instruments devices use an external shunt resistor and an I2C interface.</p>

    <div class="space-y-4 mb-8">
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm font-mono">
            <strong class="text-purple-400 block mb-2">INA219 — 12-bit, 26V max bus</strong>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 text-xs">
                <div>Bus voltage: 0–26V<br>Shunt voltage: ±320mV max<br>Resolution: 12-bit ADC</div>
                <div>Max current (100mΩ shunt): ±3.2A<br>Max current (10mΩ shunt): ±32A<br>I2C addresses: 0x40–0x4F (4 variants)</div>
                <div>Limitation: Internal ADC saturates at 26V. <span class="text-red-400">Cannot be used on 6S (25.2V+ bus) directly</span> — requires a voltage divider or use on the 5V side only.</div>
            </div>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm font-mono">
            <strong class="text-emerald-400 block mb-2">INA226 — 16-bit, 36V max bus ← Recommended for 6S builds</strong>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 text-xs">
                <div>Bus voltage: 0–36V (safe for 6S)<br>Shunt voltage: ±81.92mV max<br>Resolution: 16-bit ADC</div>
                <div>Shunt resistor: 1mΩ for 80A range<br>Shunt resistor: 5mΩ for 16A range<br>I2C: 0x40–0x4F (4 address pins)</div>
                <div>Alert pin: programmable over-current interrupt<br>Power register: bus V × shunt current computed in hardware<br>Integration time: configurable 140µs–8.244ms per sample</div>
            </div>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm font-mono">
            <strong class="text-amber-400 block mb-2">INA3221 — Triple-channel, 26V max, for multi-rail monitoring</strong>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 text-xs">
                <div>3 independent channels<br>Each: bus V + shunt V<br>Bus range: 0–26V</div>
                <div>Use case: Monitor 5V FC rail + 12V Jetson rail + main battery current simultaneously from one I2C device</div>
                <div>Alert outputs: per-channel and sum-of-channels critical alert<br>I2C address: 0x40 (1 fixed address with 4 pin variants)</div>
            </div>
        </div>
    </div>

    <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm mb-8">
        <strong class="text-sky-400 block mb-3">Shunt Resistor Sizing</strong>
        <div class="font-mono text-slate-300 text-xs space-y-2">
            <p>Goal: maximize resolution without saturating the ADC shunt input.</p>
            <p>INA226 shunt input range: ±81.92mV. For 80A max current:<br>
            R_shunt = 81.92mV / 80A = <strong>1.024mΩ</strong> → use standard 1mΩ value (e.g., Vishay WSL2010 1mΩ 1%, 3W)</p>
            <p>Power dissipated in shunt at 80A: P = I² × R = 80² × 0.001 = <strong>6.4W</strong> — this requires a multi-watt resistor or parallel combination.</p>
            <p>Parallel two 2mΩ resistors (e.g., 2× Bourns CSS2H-2512 2mΩ 3W) = 1mΩ equivalent, 6W total dissipation. Place on copper pour for heat spreading.</p>
        </div>
        <div class="font-mono text-slate-300 text-xs space-y-2 mt-4">
            <strong class="text-sky-400">ArduPilot Integration:</strong>
            <p>Set BATT_MONITOR = 21 (INA2XX auto-detect) or explicitly 17 (INA226).<br>
            ArduPilot reads the INA226 over I2C and scales it using BATT_AMP_PERVLT (Amps per Volt of ADC output) and BATT_AMP_OFFSET.<br>
            For direct I2C sensor: set BATT_I2C_BUS and BATT_I2C_ADDR to match the hardware address. The sensor auto-calibrates scale based on internal shunt register values.</p>
        </div>
    </div>

    <h3>10.6 Motor KV Rating and Propeller Selection</h3>
    <p>KV (not kilovolts — the unit is RPM/V) is the motor's velocity constant: the no-load RPM increase per additional Volt applied to the terminals.</p>

    <div class="math-block">
        <strong>KV, Voltage, and RPM Relationship</strong><br><br>
        RPM_no_load = KV × V_applied<br><br>
        Example: 920KV motor on 6S (22.2V nominal):<br>
        RPM_no_load = 920 × 22.2 = <strong>20,424 RPM</strong><br><br>
        Under load (prop drag), actual RPM drops ~10–20%. Loaded RPM ≈ 16,000–18,000 RPM.<br><br>

        <strong>Propeller Thrust and Efficiency:</strong><br>
        Thrust ∝ ρ × A × v² (momentum theory)  where A = disk area = π × (d/2)²<br><br>
        Larger diameter (d) = larger A = more thrust at same RPM = more efficiency (lower disk loading).<br>
        Higher pitch = more thrust per revolution, but requires more torque (higher current draw).<br><br>

        Prop notation — "1345" means: 13 inch diameter, 4.5 inch pitch<br>
        Prop notation — "5140" means: 5.1 inch diameter, 4.0 inch pitch<br><br>

        <strong>KV Selection Rule of Thumb:</strong><br>
        High KV (1800–2700) + small props (3"–5") → Racing/freestyle (fast, inefficient)<br>
        Mid KV (500–1000) + large props (10"–15") → Cargo/AI payload quads (efficient, more torque)<br>
        Low KV (200–400) + very large props (18"–30") → Heavy-lift hexacopters/octocopters<br><br>

        AI payload drones typically: <strong>920KV motors, 6S, 13" props</strong> — balancing flight time and payload capacity.
    </div>

    <h3>10.7 Brownout Protection: Capacitor Bank Design</h3>
    <p>A brownout occurs when the battery voltage sags below the BEC's minimum operating input voltage during peak current draw. The energy stored in a capacitor bank bridges this transient. The Rubycon ZLH and Panasonic FR series are the industry standard for this application because they combine very low ESR with high ripple current rating and long life at elevated temperatures.</p>

    <div class="math-block">
        <strong>Capacitor Bank Sizing for Brownout Protection</strong><br><br>
        Load: Jetson Orin NX at 25W, 12V input = 2.08A nominal, 3.5A surge<br>
        BEC input minimum: 15V (for a 12V synchronous buck with 3V headroom)<br>
        Battery nominal: 22.2V (6S). Under 150A load spike, worst-case voltage sag: down to 18V for 20ms.<br><br>

        Energy needed from capacitor bank:<br>
        Voltage drops from 18V to 15V over 20ms while sourcing 3.5A to the BEC.<br>
        ΔV = 3V, I = 3.5A, t = 20ms<br>
        C = I × t / ΔV = 3.5 × 0.020 / 3.0 = <strong>23.3mF = 23,300µF</strong><br><br>

        Practical implementation: 4× Rubycon ZLH 6800µF 35V (total: 27,200µF)<br>
        Or: 6× Panasonic FR 3900µF 35V (total: 23,400µF)<br><br>

        <strong>Why Low-ESR Matters Here:</strong><br>
        During the 3.5A discharge, voltage across ESR = I × ESR<br>
        Standard electrolytic ESR at 100Hz: ~300mΩ → voltage drop = 3.5A × 0.3Ω = <strong>1.05V</strong> wasted in ESR alone.<br>
        Rubycon ZLH ESR at 100kHz: ~15mΩ → voltage drop = 3.5A × 0.015Ω = <strong>0.05V</strong> — essentially zero.<br><br>

        Rubycon ZLH 6800µF 35V: ESR = 12–18mΩ, ripple current = 3.78A rms at 105°C<br>
        Panasonic FR 3900µF 35V: ESR = 15–22mΩ, ripple current = 2.6A rms at 105°C
    </div>

    <div class="bg-red-900/20 border border-red-500/50 p-4 rounded text-red-200 text-sm">
        <strong>Capacitor Placement is Critical:</strong> The capacitor bank must be within 10cm of the BEC's input terminals, connected with low-inductance wide copper traces (or busbars). A long thin wire between the capacitor and the BEC input creates series inductance (L), and the effective impedance at 10kHz = 2πfL, which can negate the benefit of even low-ESR capacitors. Target trace inductance &lt;10nH between cap and BEC input.
    </div>
</div>
`;
