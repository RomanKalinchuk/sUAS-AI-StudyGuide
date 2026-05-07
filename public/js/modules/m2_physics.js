export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 2</span>
    <h2>SWaP-C Physics & Mathematical Modeling</h2>
    <p>Size, Weight, Power, and Cost. Engineering an AI drone is an optimization problem where every variable fights against the others. This module breaks down the physics.</p>

    <h3>2.1 Advanced Weight Penalties & Momentum Theory</h3>
    <p>We previously established that Power required to hover is P_hover = (T^1.5) / sqrt(2 * rho * A). Let's expand this to understand actual flight time reduction when adding an AI payload.</p>
    <p>A battery holds a finite amount of Energy (E), usually measured in Watt-hours (Wh). Flight time (t) is simply E / P_average.</p>

    <div class="math-block">
        <strong>Calculating the AI Payload Penalty:</strong><br><br>
        Drone Base Mass (m_base) = 1.5 kg<br>
        AI Payload Mass (m_ai) = 0.3 kg (Jetson Orin + Carrier + Cam)<br>
        Total Mass (m_total) = 1.8 kg<br><br>

        Thrust required (T) = m * g (9.81)<br>
        T_base = 14.7 N<br>
        T_total = 17.6 N<br><br>

        Assuming standard props (Area A = 0.2 m²) and sea level air (ρ = 1.225 kg/m³):<br>
        Denominator = √(2 * 1.225 * 0.2) = 0.70<br><br>

        P_hover_base = (14.7 ^ 1.5) / 0.70 = 56.4 / 0.70 = 80.5 Watts<br>
        P_hover_total = (17.6 ^ 1.5) / 0.70 = 73.8 / 0.70 = 105.4 Watts<br><br>

        <strong>Result:</strong> Adding 300g increased hover power by ~31%.
    </div>

    <p>But we must also add the electrical power consumed by the AI processor itself. <strong>This is the brutal reality of SWaP.</strong> The Jetson Orin Nano has two configurable power modes (set via <code>nvpmodel</code>) that the engineer should exploit dynamically during flight:</p>

    <div class="math-block">
        <strong>Jetson Orin Nano — Dynamic Power Mode SWaP Impact</strong><br><br>
        Mode A: 7W (efficiency) — CPU runs at 729MHz, GPU at 306MHz, DLA active<br>
        Mode B: 15W (performance) — CPU at 1510MHz, GPU at 624MHz<br><br>

        Flight Phase: Transit/Loiter (no active AI inference required)<br>
        → Use Mode A: P_ai = 7W<br>
        → Total hover power = 105.4W (aero) + 7W (AI) = 112.4W<br>
        → Flight time (100 Wh battery) = 100 / 112.4 = <strong>53.4 min</strong><br><br>

        Flight Phase: Active Search/Targeting (YOLO + VSLAM running concurrently)<br>
        → Switch to Mode B: P_ai = 15W<br>
        → Total hover power = 105.4W + 15W = 120.4W<br>
        → Flight time at this phase rate = 100 / 120.4 = <strong>49.8 min equivalent</strong><br><br>

        Mixed mission (60% transit at 7W, 40% active at 15W):<br>
        P_avg_ai = 0.6 × 7W + 0.4 × 15W = 4.2 + 6.0 = 10.2W<br>
        Total avg power = 105.4W + 10.2W = 115.6W<br>
        Flight time = 100 / 115.6 = <strong>51.9 min</strong> vs. 49.8 min at constant 15W<br><br>

        <strong>Switching command (run on Jetson via companion computer ROS 2 node):</strong><br>
        sudo nvpmodel -m 0    # Mode 0 = 15W (MAXN performance)<br>
        sudo nvpmodel -m 1    # Mode 1 = 7W (efficiency)<br>
        sudo nvpmodel -q      # Query current mode
    </div>

    <h3>2.2 Lithium Battery Discharge & Brownouts</h3>
    <p>Drones utilize Lithium Polymer (LiPo) or Lithium-Ion (Li-ion, e.g., 21700 cells) batteries. Their voltage is not constant. A 6-cell (6S) LiPo drops from 25.2V fully charged (4.2V/cell) to ~19.2V at its hard discharge cutoff (3.2V/cell). A resting voltage of ~19.8V (3.3V/cell) is often used as a practical low-battery warning threshold, while 21V (3.5V/cell) is a conservative in-flight limit that preserves cell longevity.</p>
    <p>AI processors require highly stable 5V or 12V rails. If the drone performs an aggressive maneuver (e.g., full throttle punch-out), the motors can draw 150 Amps instantly. Due to internal battery resistance (V_drop = I * R_internal), the battery voltage can briefly sag by several volts. This is called a "Brownout".</p>
    <div class="bg-red-900/20 border border-red-500/50 p-4 rounded mb-6 text-red-200">
        <strong>CRITICAL FAILURE MODE:</strong> If the voltage reaching the Companion Computer sags below its operating threshold for even a millisecond, the Linux OS will hard-reset. The drone will lose all AI capabilities mid-flight, potentially leading to a fly-away or crash.
    </div>
    <p><strong>Engineering Solution:</strong> Engineers implement Buck-Boost regulators with massive Low-ESR (Equivalent Series Resistance) capacitor banks (e.g., 2200µF, 35V Rubycon ZLH series) placed immediately before the AI processor to act as a localized power reserve during transient load spikes.</p>

    <h3>2.3 Thermal Dynamics: Forced vs Natural Convection</h3>
    <p>We established the base Thermal Resistance equation. In an enclosed drone, natural convection (air rising as it heats) is insufficient for 15W+ processors. Engineers must utilize forced convection, but adding a fan introduces a moving part that can fail.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-sky-400 border-none">Advanced Thermal Estimator</h4>
        <p class="text-sm text-slate-400 mb-4">Adjust the parameters to see how airflow (from props or forward flight) affects the required heatsink size.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
                <label class="text-slate-400 block mb-1">Processor Power (W): <span id="pwr-val2" class="text-white font-bold">20W</span></label>
                <input type="range" id="pwr-input2" min="5" max="60" value="20" class="w-full accent-sky-500" oninput="runThermalSim()">
            </div>
            <div>
                <label class="text-slate-400 block mb-1">Internal Ambient Temp (°C): <span id="amb-val2" class="text-white font-bold">45°C</span></label>
                <input type="range" id="amb-input2" min="20" max="75" value="45" class="w-full accent-sky-500" oninput="runThermalSim()">
            </div>
            <div class="md:col-span-2">
                <label class="text-slate-400 block mb-1">Airflow Velocity over Heatsink (m/s): <span id="vel-val" class="text-white font-bold">1.0 m/s</span></label>
                <input type="range" id="vel-input" min="0" max="15" step="0.5" value="1.0" class="w-full accent-emerald-500" oninput="runThermalSim()">
                <p class="text-xs text-slate-500 mt-1">0 = Enclosed. 2-5 = Active Fan. 5-15 = Exposed to Prop Wash / Forward Flight.</p>
            </div>
        </div>

        <div class="mt-6 p-6 bg-slate-900 rounded border border-slate-700 text-center">
            <p class="text-slate-400 text-xs uppercase tracking-wider mb-2">Estimated Junction Temperature (Tj)</p>
            <div id="tj-result" class="text-4xl font-mono text-emerald-400 font-bold tracking-tight">65 °C</div>
            <div id="tj-status" class="mt-2 text-sm font-bold text-emerald-500">SAFE OPERATING ZONE</div>
            <p class="text-xs text-slate-500 mt-4 max-w-lg mx-auto">Calculated assuming a standard aluminum finned heatsink (Base Rθ ≈ 2.5 °C/W in still air). Convective heat transfer coefficient (h) scales with √Velocity, reducing Rθ.</p>
        </div>
    </div>
</div>
`;
