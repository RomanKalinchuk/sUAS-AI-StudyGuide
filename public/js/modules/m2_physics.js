export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 2</span>
    <h2>SWaP-C Physics & Mathematical Modeling</h2>
    <p>Size, Weight, Power, and Cost. Engineering an AI drone is an optimization problem where every variable fights against the others. This module breaks down the physics.</p>

    <h3>2.1 Advanced Weight Penalties & Momentum Theory</h3>
    <p>We previously established that Power required to hover is P_hover = (T^1.5) / sqrt(2 * rho * A). Let's expand this to understand actual flight time reduction when adding an AI payload.</p>
    <p>A battery holds a finite amount of Energy (E), usually measured in Watt-hours (Wh). Flight time (t) is simply E / P_average.</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-center text-sm">
            <div class="text-slate-400 text-xs uppercase tracking-wider mb-2">Base Drone (no AI)</div>
            <div class="text-2xl font-bold text-white font-mono">1.5 kg</div>
            <div class="text-emerald-400 font-mono mt-2 text-lg">80.5 W</div>
            <div class="text-slate-500 text-xs mt-1">to hover</div>
        </div>
        <div class="bg-sky-900/30 p-4 rounded border border-sky-600 text-center text-sm">
            <div class="text-sky-400 text-xs uppercase tracking-wider mb-2">AI Payload Added</div>
            <div class="text-2xl font-bold text-white font-mono">+300 g</div>
            <div class="text-sky-300 font-mono mt-2 text-lg">+24.9 W</div>
            <div class="text-slate-400 text-xs mt-1">extra hover power</div>
        </div>
        <div class="bg-rose-900/20 p-4 rounded border border-rose-700/50 text-center text-sm">
            <div class="text-rose-400 text-xs uppercase tracking-wider mb-2">With AI (1.8 kg total)</div>
            <div class="text-2xl font-bold text-white font-mono">1.8 kg</div>
            <div class="text-rose-400 font-mono mt-2 text-lg">105.4 W</div>
            <div class="text-slate-400 text-xs mt-1">to hover (+31% more)</div>
        </div>
    </div>
    <div class="insight-box mb-6">
        <div class="insight-label">Key Takeaway</div>
        <p class="text-slate-200 text-sm mt-1">Adding just 300g of AI hardware increases hover power draw by <strong>31%</strong>. Because hover power scales with thrust raised to the 3/2 power, small weight increases cause disproportionately large power penalties. This is the "SWaP trap" — every gram of AI processor steals multiple grams worth of battery flight time.</p>
    </div>

    <p>But we must also add the electrical power consumed by the AI processor itself. <strong>This is the brutal reality of SWaP.</strong> The Jetson Orin Nano has two configurable power modes (set via <code>nvpmodel</code>) that the engineer should exploit dynamically during flight:</p>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Jetson Orin Nano — Power Mode Impact on 100Wh Battery</div>
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-slate-800/50 text-slate-400 text-xs">
                    <th class="p-3 text-left">Flight Phase</th>
                    <th class="p-3 text-left">Power Mode</th>
                    <th class="p-3 text-left">AI Power</th>
                    <th class="p-3 text-left">Total (aero + AI)</th>
                    <th class="p-3 text-left">Est. Flight Time</th>
                </tr>
            </thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-white">Transit / Loiter</td>
                    <td class="p-3 text-emerald-400">7W Efficiency</td>
                    <td class="p-3">7 W</td>
                    <td class="p-3">112.4 W</td>
                    <td class="p-3 text-emerald-300 font-bold">53.4 min</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-white">Active AI (YOLO + VSLAM)</td>
                    <td class="p-3 text-amber-400">15W Performance</td>
                    <td class="p-3">15 W</td>
                    <td class="p-3">120.4 W</td>
                    <td class="p-3 text-amber-300 font-bold">49.8 min</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-white">Mixed (60% transit / 40% active)</td>
                    <td class="p-3 text-sky-400">Dynamic switching</td>
                    <td class="p-3">10.2 W avg</td>
                    <td class="p-3">115.6 W</td>
                    <td class="p-3 text-sky-300 font-bold">51.9 min</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p class="text-sm text-slate-300">Switching power mode dynamically via <code>nvpmodel</code> from a ROS 2 node saves ~2 minutes of flight time on a mixed mission — meaningful across a full operation day. The commands: <code>sudo nvpmodel -m 0</code> (15W performance) and <code>sudo nvpmodel -m 1</code> (7W efficiency).</p>

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
