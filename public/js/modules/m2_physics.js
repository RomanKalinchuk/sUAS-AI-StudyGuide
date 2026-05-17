export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 2</span>
    <h2>SWaP-C Physics &amp; Mathematical Modeling</h2>
    <p>Size, Weight, Power, and Cost. Engineering an AI drone is an optimization problem where every variable fights against the others. This module breaks down the physics — from momentum theory and Peukert discharge curves through GaN power electronics, next-generation batteries, and 2025 edge AI silicon benchmarks.</p>

    <!-- ═══════════════════════════════════════════════════════════════
         2.1  HOVER POWER, WEIGHT PENALTIES & FIGURE OF MERIT
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.1 Hover Power, Weight Penalties &amp; Figure of Merit</h3>
    <p>From actuator-disk momentum theory, ideal hover power is:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        P_ideal = T<sup>3/2</sup> / sqrt(2 · ρ · A)
    </div>
    <p>Real rotors are less efficient than the ideal actuator disk. The <strong>Figure of Merit (FM)</strong> captures this gap:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        FM = P_ideal / P_shaft &nbsp;→&nbsp; P_actual = P_ideal / FM
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-4">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Figure of Merit by Rotor Class (2024 benchmarks)</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Rotor Type</th>
                <th class="p-3 text-left">FM Range</th>
                <th class="p-3 text-left">Notes</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Full-scale helicopter main rotor</td><td class="p-3 text-emerald-400">0.70 – 0.80</td><td class="p-3">Best-in-class, large Re</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Large multirotor (&gt;12" props)</td><td class="p-3 text-emerald-400">0.65 – 0.75</td><td class="p-3">T-Motor / KDE quality</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Standard multirotor (5"–12")</td><td class="p-3 text-amber-400">0.55 – 0.70</td><td class="p-3">Most commercial platforms</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Micro-rotor (Re ≈ 70,000)</td><td class="p-3 text-rose-400">0.50 – 0.65</td><td class="p-3">Scale effects dominate</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Ducted coaxial UAV</td><td class="p-3 text-amber-400">0.55 – 0.65</td><td class="p-3">Duct improves open coaxial</td></tr>
            </tbody>
        </table>
    </div>

    <p><strong>Disk loading (DL = T/A)</strong> is the single most important design lever for hover efficiency. Lower disk loading means the rotor accelerates a larger mass of air by a smaller velocity increment — far more efficient. Hover power scales as:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        P_hover ∝ sqrt(DL) &nbsp;→&nbsp; halving disk area raises hover power by 41%
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Disk Loading by Platform Type</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Platform</th>
                <th class="p-3 text-left">Prop size</th>
                <th class="p-3 text-left">DL (N/m²)</th>
                <th class="p-3 text-left">Hover efficiency</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Racing FPV</td><td class="p-3">5"</td><td class="p-3 text-rose-400">120 – 180</td><td class="p-3 text-rose-400">Poor</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">AI inspection drone</td><td class="p-3">12"</td><td class="p-3 text-amber-400">40 – 70</td><td class="p-3 text-amber-400">Good</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Heavy-lift survey</td><td class="p-3">18" – 24"</td><td class="p-3 text-emerald-400">20 – 40</td><td class="p-3 text-emerald-400">Best</td></tr>
            </tbody>
        </table>
    </div>

    <p>We previously established that Power required to hover is <code>P_hover = T^1.5 / sqrt(2 · ρ · A)</code>. Let's see what happens when we add an AI payload:</p>

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
        <p class="text-slate-200 text-sm mt-1">Adding just 300 g of AI hardware increases hover power by <strong>31%</strong>. Because hover power scales with thrust raised to the 3/2 power, small weight increases cause disproportionately large power penalties. This is the "SWaP trap" — every gram of AI processor steals multiple grams worth of battery flight time.</p>
    </div>

    <p>But we must also add the electrical power consumed by the AI processor itself. The Jetson Orin Nano has two configurable power modes (set via <code>nvpmodel</code>) that the engineer should exploit dynamically during flight:</p>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Jetson Orin Nano — Power Mode Impact on 100 Wh Battery</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Flight Phase</th>
                <th class="p-3 text-left">Power Mode</th>
                <th class="p-3 text-left">AI Power</th>
                <th class="p-3 text-left">Total (aero + AI)</th>
                <th class="p-3 text-left">Est. Flight Time</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Transit / Loiter</td><td class="p-3 text-emerald-400">7 W Efficiency</td><td class="p-3">7 W</td><td class="p-3">112.4 W</td><td class="p-3 text-emerald-300 font-bold">53.4 min</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Active AI (YOLO + VSLAM)</td><td class="p-3 text-amber-400">15 W Performance</td><td class="p-3">15 W</td><td class="p-3">120.4 W</td><td class="p-3 text-amber-300 font-bold">49.8 min</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Mixed (60% transit / 40% active)</td><td class="p-3 text-sky-400">Dynamic switching</td><td class="p-3">10.2 W avg</td><td class="p-3">115.6 W</td><td class="p-3 text-sky-300 font-bold">51.9 min</td></tr>
            </tbody>
        </table>
    </div>
    <p class="text-sm text-slate-300 mb-6">Switching power mode dynamically via <code>nvpmodel</code> from a ROS 2 node saves ~2 minutes on a mixed mission. Commands: <code>sudo nvpmodel -m 0</code> (15 W performance) and <code>sudo nvpmodel -m 1</code> (7 W efficiency).</p>

    <h4 class="text-sky-300">Translational Lift &amp; Forward-Flight Power</h4>
    <p>Hover is the least efficient flight mode. As forward speed increases, incoming air partially flushes recirculating vortex wake, reducing induced velocity. Total power in forward flight follows the modified Glauert model:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        P(v) = P_hover · [ sqrt( (v⁴ / 4v_h⁴) + 1 ) − v² / (2v_h²) ]<br>
        <span class="text-slate-400 text-xs">where v_h = sqrt(T / (2ρA)) = induced velocity in hover</span>
    </div>
    <p class="text-sm text-slate-300 mb-2">Power dips <strong>10–15% below hover at ~5–8 m/s</strong> (translational lift), then rises steeply above ~12 m/s as parasite drag dominates. For a 2 kg drone with 12" props: v_h ≈ 4.5 m/s; range-optimal cruise ≈ <strong>5.9 m/s (21 km/h)</strong>.</p>
    <div class="insight-box mb-6">
        <div class="insight-label">Design Implication</div>
        <p class="text-slate-200 text-sm mt-1"><strong>Variable-pitch propellers</strong> (T-Motor MF series, 2024) improve hover efficiency by 2.6–7.5% and decouple RPM from thrust — the motor runs at its efficiency peak while pitch handles rapid thrust changes. The mechanism adds ~20–50 g per arm but yields better control bandwidth than RPM modulation alone.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.2  BATTERY DISCHARGE, PEUKERT & BROWNOUTS
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.2 Lithium Battery Discharge, Peukert &amp; Brownouts</h3>
    <p>Drones use Lithium Polymer (LiPo) or Lithium-Ion 21700-cell packs. Voltage is not constant — a 6S LiPo drops from 25.2 V (4.2 V/cell) to ~19.2 V at hard cutoff (3.2 V/cell). But rated capacity is not delivered at all C-rates. The <strong>Peukert equation</strong> models capacity reduction under high discharge:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        C_effective = C_rated × (I_rated / I_actual)<sup>(k−1)</sup>
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-4">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Peukert Exponent k by Chemistry</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Chemistry</th><th class="p-3 text-left">k range</th><th class="p-3 text-left">Drone typical k</th><th class="p-3 text-left">Capacity loss at 6C</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">LiPo (polymer)</td><td class="p-3">1.05 – 1.15</td><td class="p-3 text-emerald-400">1.08</td><td class="p-3 text-amber-400">~18%</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Li-ion 21700 cells</td><td class="p-3">1.10 – 1.30</td><td class="p-3 text-amber-400">1.15</td><td class="p-3 text-rose-400">~28%</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">LiFePO₄</td><td class="p-3">1.02 – 1.10</td><td class="p-3 text-emerald-400">1.05</td><td class="p-3 text-emerald-400">~9%</td></tr>
            </tbody>
        </table>
    </div>
    <p class="text-sm text-slate-300 mb-2">Example: A 5,000 mAh LiPo (k = 1.08) at 6C (30 A) delivers only <strong>4,110 mAh</strong> — an 18% penalty that planners must account for in endurance calculations. The Peukert equation is only valid at constant current; variable-throttle missions require a modified dynamic form.</p>

    <h4 class="text-sky-300">State of Charge (SoC) Estimation</h4>
    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-4">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">SoC Estimation Method Comparison</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Method</th><th class="p-3 text-left">Accuracy</th><th class="p-3 text-left">Notes</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Voltage-based (OCV lookup)</td><td class="p-3 text-rose-400">±5 – 10%</td><td class="p-3">Only valid at rest; flat LiPo OCV curve makes it unreliable mid-flight</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Coulomb counting</td><td class="p-3 text-amber-400">±2 – 5%</td><td class="p-3">Integrates I·dt; cumulative drift requires periodic OCV re-anchor</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Extended Kalman Filter (EKF)</td><td class="p-3 text-emerald-400">±1 – 3%</td><td class="p-3">Fuses voltage + current via ECM model; self-correcting; 2024 standard in smart packs</td></tr>
            </tbody>
        </table>
    </div>

    <h4 class="text-sky-300">Cycle Life vs. Depth of Discharge</h4>
    <p class="text-sm text-slate-300 mb-2">LiPo longevity degrades sharply with deep discharge. Charging to 4.2 V/cell (100% SoC) and flying to 3.2 V/cell (hard cutoff) at every mission can exhaust a pack in 150–200 cycles. Limiting discharge depth dramatically extends service life:</p>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-center text-sm">
        <div class="bg-slate-900 p-3 rounded border border-rose-700/50"><div class="text-rose-400 font-mono font-bold text-lg">100% DoD</div><div class="text-slate-400 text-xs mt-1">150 – 300 cycles</div></div>
        <div class="bg-slate-900 p-3 rounded border border-amber-700/50"><div class="text-amber-400 font-mono font-bold text-lg">80% DoD</div><div class="text-slate-400 text-xs mt-1">300 – 500 cycles</div></div>
        <div class="bg-slate-900 p-3 rounded border border-sky-700/50"><div class="text-sky-400 font-mono font-bold text-lg">60% DoD</div><div class="text-slate-400 text-xs mt-1">500 – 900 cycles</div></div>
        <div class="bg-slate-900 p-3 rounded border border-emerald-700/50"><div class="text-emerald-400 font-mono font-bold text-lg">40% DoD</div><div class="text-slate-400 text-xs mt-1">1,000 – 2,000+ cycles</div></div>
    </div>
    <p class="text-sm text-slate-300 mb-4">Landing at 20% residual SoC (80% DoD) instead of 5% (95% DoD) approximately <strong>doubles pack lifespan</strong> — a direct cost saving in high-utilization operations.</p>

    <h4 class="text-sky-300">Brownouts &amp; Voltage Sag</h4>
    <p>Terminal voltage under load follows the equivalent-circuit model:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        V_terminal = OCV(SoC) − I × R_int(SoC, T)
    </div>
    <p>AI processors require stable 5 V or 12 V rails. An aggressive maneuver can draw 150 A instantaneously. Internal battery resistance causes immediate voltage sag — the "brownout" — that can hard-reset the Linux OS on the companion computer mid-flight.</p>
    <div class="bg-red-900/20 border border-red-500/50 p-4 rounded mb-4 text-red-200">
        <strong>CRITICAL FAILURE MODE:</strong> If the voltage reaching the companion computer sags below its operating threshold for even a millisecond, the OS hard-resets. The drone loses all AI capabilities mid-flight, potentially causing a fly-away or crash.
    </div>
    <p class="text-sm text-slate-300 mb-2">Cold temperature compounds this risk dramatically. At −20°C, internal resistance rises 3–4× and pack capacity drops to 50–65% of rated:</p>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-4">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">R_int vs Temperature (5 Ah LiPo, single cell)</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Temperature</th><th class="p-3 text-left">R_int per cell</th><th class="p-3 text-left">4S pack sag at 30 A</th><th class="p-3 text-left">Relative capacity</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">+25°C (nominal)</td><td class="p-3">3 – 6 mΩ</td><td class="p-3 text-emerald-400">0.36 – 0.72 V</td><td class="p-3 text-emerald-400">100%</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">0°C</td><td class="p-3">10 – 15 mΩ</td><td class="p-3 text-amber-400">1.2 – 1.8 V</td><td class="p-3 text-amber-400">93 – 95%</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">−10°C</td><td class="p-3">15 – 20 mΩ</td><td class="p-3 text-rose-400">1.8 – 2.4 V</td><td class="p-3 text-rose-400">75 – 80%</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">−20°C</td><td class="p-3">25 – 40 mΩ</td><td class="p-3 text-rose-400">3.0 – 4.8 V</td><td class="p-3 text-rose-400">50 – 65%</td></tr>
            </tbody>
        </table>
    </div>
    <p><strong>Engineering Solution:</strong> Buck-boost regulators with low-ESR capacitor banks immediately before the AI board act as a localized power reserve. Capacitor sizing formula:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        C_min = (ΔI × t_rise) / ΔV_max<br>
        <span class="text-slate-400 text-xs">Example — Orin NX at 12 V, ΔI = 1.83 A, t_rise = 1 ms, ΔV = 0.2 V → C_min = 9.15 mF</span>
    </div>
    <p class="text-sm text-slate-300 mb-6">In practice a <strong>10–47 mF low-ESR bulk capacitor bank</strong> (electrolytic + X5R MLCC mix) at the AI board power input is standard. For cold-environment missions, raise the low-battery land threshold from 3.3 V/cell to <strong>3.6 V/cell</strong> to compensate for elevated voltage sag hiding the true SoC.</p>

    <!-- ═══════════════════════════════════════════════════════════════
         2.3  THERMAL DYNAMICS
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.3 Thermal Dynamics &amp; Modern Cooling Technologies</h3>
    <p>In an enclosed drone body, natural convection is insufficient for 15 W+ processors. Engineers must choose from multiple cooling strategies, each with SWaP tradeoffs.</p>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Thermal Interface Material (TIM) Comparison — 2025</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">TIM Type</th><th class="p-3 text-left">Thermal Conductivity</th><th class="p-3 text-left">Notes</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Standard silicone (Dowsil TC-5026)</td><td class="p-3 text-slate-400">3 – 5 W/m·K</td><td class="p-3">Common, inexpensive, baseline</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Phase-change TIM pad</td><td class="p-3 text-sky-400">4 – 8 W/m·K</td><td class="p-3">Better conformity at temperature; self-renewing contact</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Graphene foam TIM (2024)</td><td class="p-3 text-amber-400">17 – 48 W/m·K</td><td class="p-3">Vertically aligned 15.5 wt% graphene; research validated</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">GT-90SPRO graphene (commercial)</td><td class="p-3 text-emerald-400">90 ± 10 W/m·K</td><td class="p-3">300 µm thick; 6.5 K·mm²/W contact resistance; drone-deployable</td></tr>
            </tbody>
        </table>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <div class="text-sky-400 font-bold mb-2">Vapor Chamber</div>
            <p class="text-slate-300 text-xs">Effective conductivity 10,000–100,000 W/m·K. Chambers as thin as 0.4 mm now appear in Jetson Orin carrier boards (ConnectTech, Antmicro). A 100×50×2 mm copper chamber weighs ~12–20 g vs ~45 g for equivalent solid copper spreader — 60% lighter for the same footprint.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <div class="text-emerald-400 font-bold mb-2">Phase Change Material (PCM)</div>
            <p class="text-slate-300 text-xs">Paraffin wax PCM stores latent heat (~200 kJ/kg) during burst inference without any power draw. Draws zero watts from the battery — purely passive. New 2024 PCM-metal-foam composites reach 10 W/m·K effective conductivity while retaining full latent heat capacity.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <div class="text-rose-400 font-bold mb-2">Peltier (TEC) — Not Viable</div>
            <p class="text-slate-300 text-xs">Coefficient of Performance (COP) = 0.3–0.7. Removing 10 W from an AI chip requires ~20 W of Peltier input — 30 W total rejected heat. On a 2 kg drone this represents ~25% of hover power. Reserved for tethered ISR with IR-cooled detectors requiring sub-ambient temperatures.</p>
        </div>
    </div>

    <div class="interactive-panel">
        <h4 class="mt-0 text-sky-400 border-none">Advanced Thermal Estimator</h4>
        <p class="text-sm text-slate-400 mb-4">Adjust the parameters to see how airflow (from props or forward flight) affects the required heatsink size.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
                <label class="text-slate-400 block mb-1">Processor Power (W): <span id="pwr-val2" class="text-white font-bold">20 W</span></label>
                <input type="range" id="pwr-input2" min="5" max="60" value="20" class="w-full accent-sky-500" oninput="runThermalSim()">
            </div>
            <div>
                <label class="text-slate-400 block mb-1">Internal Ambient Temp (°C): <span id="amb-val2" class="text-white font-bold">45 °C</span></label>
                <input type="range" id="amb-input2" min="20" max="75" value="45" class="w-full accent-sky-500" oninput="runThermalSim()">
            </div>
            <div class="md:col-span-2">
                <label class="text-slate-400 block mb-1">Airflow Velocity over Heatsink (m/s): <span id="vel-val" class="text-white font-bold">1 m/s</span></label>
                <input type="range" id="vel-input" min="0" max="15" step="0.5" value="1.0" class="w-full accent-emerald-500" oninput="runThermalSim()">
                <p class="text-xs text-slate-500 mt-1">0 = Enclosed. 2–5 = Active Fan. 5–15 = Exposed to Prop Wash / Forward Flight.</p>
            </div>
        </div>
        <div class="mt-6 p-6 bg-slate-900 rounded border border-slate-700 text-center">
            <p class="text-slate-400 text-xs uppercase tracking-wider mb-2">Estimated Junction Temperature (Tj)</p>
            <div id="tj-result" class="text-4xl font-mono text-emerald-400 font-bold tracking-tight">65 °C</div>
            <div id="tj-status" class="mt-2 text-sm font-bold text-emerald-500">SAFE OPERATING ZONE</div>
            <p class="text-xs text-slate-500 mt-4 max-w-lg mx-auto">Calculated assuming a standard aluminum finned heatsink (Base Rθ ≈ 2.5 °C/W in still air). Convective heat transfer coefficient (h) scales with √Velocity, reducing Rθ.</p>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.4  AIR DENSITY, ALTITUDE & GROUND EFFECT
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.4 Air Density, Altitude &amp; Ground Effect</h3>
    <p>Air density ρ is the hidden performance variable — every increase in altitude, temperature, or humidity reduces it, forcing motors to spin faster for the same thrust and shortening flight time. The ISA (International Standard Atmosphere) barometric formula:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        ρ(h) = 1.225 × (1 − 2.2558×10<sup>−5</sup> × h)<sup>4.2559</sup> &nbsp;[kg/m³, valid 0–11,000 m]<br>
        <span class="text-slate-400 text-xs">Simplified: ρ(h) ≈ 1.225 × exp(−h / 8,500)</span>
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-4">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">ISA Air Density &amp; Hover Power Penalty vs Altitude</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Altitude (m ASL)</th><th class="p-3 text-left">ρ (kg/m³)</th><th class="p-3 text-left">ρ/ρ₀</th><th class="p-3 text-left">ISA Temp</th><th class="p-3 text-left">Hover power penalty</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">0 (sea level)</td><td class="p-3">1.225</td><td class="p-3">1.000</td><td class="p-3">+15°C</td><td class="p-3 text-emerald-400">Baseline</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">1,000</td><td class="p-3">1.112</td><td class="p-3">0.908</td><td class="p-3">+8.5°C</td><td class="p-3 text-emerald-400">+5%</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">2,000</td><td class="p-3">1.007</td><td class="p-3">0.822</td><td class="p-3">+2°C</td><td class="p-3 text-amber-400">+10%</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">3,000</td><td class="p-3">0.909</td><td class="p-3">0.742</td><td class="p-3">−4.5°C</td><td class="p-3 text-amber-400">+16%</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">5,000</td><td class="p-3">0.736</td><td class="p-3">0.601</td><td class="p-3">−17°C</td><td class="p-3 text-rose-400">+29%</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">8,000</td><td class="p-3">0.526</td><td class="p-3">0.429</td><td class="p-3">−37°C</td><td class="p-3 text-rose-400">+53%</td></tr>
            </tbody>
        </table>
    </div>
    <p class="text-sm text-slate-300 mb-2">Power scales as the square root of density ratio:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        P_required(h) = P_SL × sqrt(ρ_SL / ρ(h))<br>
        <span class="text-slate-400 text-xs">At 5,000 m: P = P_SL × sqrt(1.225/0.736) = P_SL × 1.29 — 29% more power for identical hover</span>
    </div>
    <p class="text-sm text-slate-300 mb-2">Motor cooling also degrades. Thinner air means worse convective cooling; thermal resistance rises by approximately the same sqrt factor. <strong>Derate max continuous motor current by 15–20% at 5,000 m</strong> to maintain the same winding temperature as sea level.</p>
    <div class="insight-box mb-4">
        <div class="insight-label">Combined Altitude + Cold Battery Scenario</div>
        <p class="text-slate-200 text-sm mt-1">A drone rated for 20 min hover at sea level, operating at 5,000 m ASL at −17°C ISA: aero power +29%, battery capacity −30% (cold). Effective endurance: (0.70 / 1.29) × 20 min ≈ <strong>10.9 min</strong> — a 45% reduction. High-altitude missions require either larger packs, higher-efficiency props, or active battery heating.</p>
    </div>

    <h4 class="text-sky-300">Ground Effect (IGE) Physics</h4>
    <p>Operating within one rotor diameter of the ground reduces induced velocity as the ground interrupts free-wake contraction. The classical IGE correction:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        P_IGE = P_OGE / (1 + (R / 4z)²)<br>
        <span class="text-slate-400 text-xs">R = rotor radius, z = height above ground. Validated for z/R &gt; 0.5; 2025 meta-learning model extends to z → 0.</span>
    </div>
    <div class="grid grid-cols-3 gap-3 mb-6 text-center text-sm">
        <div class="bg-slate-900 p-3 rounded border border-emerald-700/50"><div class="text-emerald-400 font-mono font-bold">z = 0.5R</div><div class="text-slate-400 text-xs mt-1">~20% power saving</div></div>
        <div class="bg-slate-900 p-3 rounded border border-amber-700/50"><div class="text-amber-400 font-mono font-bold">z = 1.0R</div><div class="text-slate-400 text-xs mt-1">~6% power saving</div></div>
        <div class="bg-slate-900 p-3 rounded border border-slate-700"><div class="text-slate-400 font-mono font-bold">z = 2.0R</div><div class="text-slate-400 text-xs mt-1">~1.5% — out of ground effect</div></div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.5  EDGE AI SILICON: 2025 SWaP-C COMPARISON
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.5 Edge AI Silicon: A 2025 SWaP-C Comparison</h3>
    <p>The "right" AI chip for a drone is never the most powerful — it is the one that delivers sufficient throughput within the power and mass budget. <strong>TOPS/Watt</strong> is the primary SWaP metric. Peak TOPS figures are theoretical maximums; real-world sustained inference at batch size 1 (forced by real-time video) typically achieves 30–60% of peak.</p>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-4">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Edge AI Chip Comparison — 2024 / 2025 Hardware</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Chip / Module</th>
                <th class="p-3 text-left">AI Perf.</th>
                <th class="p-3 text-left">TDP</th>
                <th class="p-3 text-left">TOPS/W</th>
                <th class="p-3 text-left">Mass (module)</th>
                <th class="p-3 text-left">Best for</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Hailo-8 (M.2 2280)</td><td class="p-3">26 TOPS</td><td class="p-3 text-emerald-400">2.5 W</td><td class="p-3 text-emerald-400 font-bold">10.4</td><td class="p-3">~9 g</td><td class="p-3">Vision inference, no DRAM overhead</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Hailo-10H (M.2)</td><td class="p-3">40 TOPS INT4</td><td class="p-3 text-emerald-400">&lt;3.5 W</td><td class="p-3 text-emerald-400 font-bold">~16</td><td class="p-3">~10 g</td><td class="p-3">On-device LLM / gen-AI; July 2025</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Google Coral Edge TPU</td><td class="p-3">4 TOPS</td><td class="p-3">2 W</td><td class="p-3 text-sky-400">2.0</td><td class="p-3">~16 g (USB)</td><td class="p-3">TFLite-only, lowest cost entry</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Qualcomm QCS6490 SoM</td><td class="p-3">12 TOPS (NPU)</td><td class="p-3">3 – 7 W</td><td class="p-3 text-sky-400">~2.5</td><td class="p-3">~25 g</td><td class="p-3">Complete drone-brain SoC + ISP</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Rockchip RK3588 (SBC)</td><td class="p-3">6 TOPS (NPU)</td><td class="p-3">5 – 10 W</td><td class="p-3 text-amber-400">~1.0</td><td class="p-3">~50 g (SBC)</td><td class="p-3">Budget full-Linux; RKNN Toolkit 2</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Jetson Orin Nano 8 GB</td><td class="p-3">40 TOPS</td><td class="p-3 text-amber-400">7 – 15 W</td><td class="p-3 text-amber-400">2.7 – 5.7</td><td class="p-3">~45 g</td><td class="p-3">CUDA ecosystem, full PyTorch</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Jetson Orin NX 16 GB</td><td class="p-3">157 TOPS*</td><td class="p-3 text-rose-400">10 – 40 W</td><td class="p-3 text-sky-400">3.9 – 15.7</td><td class="p-3">~70 g</td><td class="p-3">SLAM + detection + mission planning</td></tr>
            </tbody>
        </table>
        <div class="px-4 py-2 bg-slate-800/50 text-xs text-slate-500">* Orin NX 157 TOPS via JetPack 6.2 Super Mode (2024 firmware update, no hardware change). Real-world batch-1 inference is 30–60% of peak TOPS.</div>
    </div>

    <div class="insight-box mb-4">
        <div class="insight-label">2025 Pareto-Optimal Stack</div>
        <p class="text-slate-200 text-sm mt-1">Many 2024–2025 drone AI builds pair a <strong>Hailo-8</strong> (deterministic vision inference at 10 TOPS/W) with a <strong>Jetson Orin Nano</strong> (flexible SLAM, path planning, full CUDA). Combined ~$220 hardware delivers 66 TOPS with a blended efficiency of 4–6 TOPS/W. The Hailo handles perception; the Jetson handles cognition.</p>
    </div>

    <h4 class="text-sky-300">Quantization: Precision vs. Power</h4>
    <p class="text-sm text-slate-300 mb-2">Reducing floating-point precision dramatically cuts both compute and memory bandwidth, with minimal accuracy loss for well-calibrated models:</p>
    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-4">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">YOLOv8n on Jetson Orin NX — Quantization Impact</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Precision</th><th class="p-3 text-left">Relative power</th><th class="p-3 text-left">Speed vs FP32</th><th class="p-3 text-left">mAP loss</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">FP32</td><td class="p-3">100%</td><td class="p-3">1×</td><td class="p-3 text-emerald-400">Baseline</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">FP16</td><td class="p-3 text-sky-400">~52%</td><td class="p-3">~2× (52 FPS)</td><td class="p-3 text-emerald-400">&lt;0.1%</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">INT8</td><td class="p-3 text-emerald-400">~28%</td><td class="p-3">~4–8× (65 FPS)</td><td class="p-3 text-amber-400">0.5 – 2%</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">INT4 (Hailo-10H)</td><td class="p-3 text-emerald-400">~17%</td><td class="p-3">~8–16×</td><td class="p-3 text-amber-400">2 – 5%</td></tr>
            </tbody>
        </table>
    </div>
    <p class="text-sm text-slate-300 mb-2">INT8 on the Orin NX reduced sustained inference power from ~18 W to ~12 W — a 33% power saving for only ~1.2% mAP degradation on typical aerial detection tasks. For drone AI, INT8 is the default target precision.</p>
    <p class="text-sm text-slate-300 mb-6"><strong>Model compression pipeline:</strong> Pruning + knowledge distillation on YOLOv8 can reduce parameters by 60.7% and FLOPs by 64.6% while retaining 96.7% of original mAP (MDPI Sensors 2025). The compressed model runs at 11.76 FPS on a Jetson Nano vs ~7 FPS uncompressed — and draws proportionally less power.</p>

    <!-- ═══════════════════════════════════════════════════════════════
         2.6  NEXT-GENERATION BATTERY TECHNOLOGIES
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.6 Next-Generation Battery Technologies</h3>
    <p>The drone industry's endurance ceiling is fundamentally set by energy storage chemistry. A wave of new technologies is breaking the 200 Wh/kg LiPo wall with real commercial deployments in 2024–2025.</p>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Ragone Chart Reference — Energy Storage Technologies (2025)</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Technology</th>
                <th class="p-3 text-left">Specific Energy</th>
                <th class="p-3 text-left">Specific Power</th>
                <th class="p-3 text-left">Status</th>
                <th class="p-3 text-left">Drone notes</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">LiPo pack (commercial)</td><td class="p-3 text-slate-400">150 – 200 Wh/kg</td><td class="p-3">400 – 1,500 W/kg</td><td class="p-3 text-emerald-400">Mature</td><td class="p-3">Dominant for &lt;30 min missions</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Li-ion 21700 cells (Samsung 50E)</td><td class="p-3 text-sky-400">250 – 280 Wh/kg</td><td class="p-3">250 – 500 W/kg</td><td class="p-3 text-emerald-400">Mature</td><td class="p-3">Higher energy, lower max C-rate</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Semi-solid state (Grepow 2024)</td><td class="p-3 text-sky-400">300 – 350 Wh/kg</td><td class="p-3">200 – 400 W/kg</td><td class="p-3 text-emerald-400">Commercial now</td><td class="p-3">Better stability, 50–75% endurance gain</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Li-Silicon SiCore (Amprius 2025)</td><td class="p-3 text-amber-400">450 – 500 Wh/kg</td><td class="p-3">300 – 800 W/kg</td><td class="p-3 text-amber-400">Early production</td><td class="p-3">AeroVironment, FLIR, DoD programs</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">All-solid-state (CATL, QuantumScape)</td><td class="p-3 text-rose-400">~500 Wh/kg (cell)</td><td class="p-3">200 – 500 W/kg</td><td class="p-3 text-rose-400">Small batch 2027</td><td class="p-3">CATL targeting drones as first market</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">H₂ PEM fuel cell (system-level)</td><td class="p-3 text-emerald-400">400 – 600 Wh/kg</td><td class="p-3">50 – 200 W/kg</td><td class="p-3 text-emerald-400">Commercial now</td><td class="p-3">Endurance; 7+ hr flight demonstrated</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Supercapacitor (EDLC)</td><td class="p-3 text-slate-500">1 – 10 Wh/kg</td><td class="p-3 text-emerald-400">5,000 – 50,000 W/kg</td><td class="p-3 text-emerald-400">Mature</td><td class="p-3">Transient burst buffer only, not primary</td></tr>
            </tbody>
        </table>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-slate-900 p-4 rounded border border-amber-700/40">
            <div class="text-amber-400 font-bold mb-2 text-sm">Lithium-Silicon (Li-Si) — Amprius SiCore</div>
            <p class="text-xs text-slate-300">Silicon anodes store ~10× more lithium than graphite, boosting cell-level energy density to 450 Wh/kg — roughly 1.8× a graphite LiPo. Amprius launched mass production of SiCore cells in May 2025, shipping to AeroVironment, Teledyne FLIR, and U.S. DoD customers. The critical caveat: pack-level energy density (including BMS, structure, and cooling) is typically 180–300 Wh/kg — still a meaningful improvement.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-sky-700/40">
            <div class="text-sky-400 font-bold mb-2 text-sm">Hydrogen Fuel Cells — Hylium Industries</div>
            <p class="text-xs text-slate-300">Liquid hydrogen carries 33 kWh/kg (39,000 Wh/kg). A PEM fuel cell at 45–55% efficiency yields ~15,000 Wh/kg of hydrogen — but the tank, stack, and balance-of-plant bring system-level specific energy to 400–600 Wh/kg, still 2–3× better than LiPo. Hylium's HyliumX-H achieved a 5 hr 30 min flight record in October 2023. Best suited for long-endurance ISR where the large form factor is acceptable.</p>
        </div>
    </div>

    <div class="insight-box mb-6">
        <div class="insight-label">Pack-Level Reality Check</div>
        <p class="text-slate-200 text-sm mt-1">Marketing specifications cite cell-level energy density. System engineers budget pack-level energy density — always 20–40% lower due to BMS electronics, structural casing, thermal management, and wiring. A 450 Wh/kg cell in a commercial drone pack delivers ~280–320 Wh/kg at the pack level. Verify with the manufacturer's pack-level datasheet, not the cell spec sheet.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.7  POWER ARCHITECTURE & GAN ELECTRONICS
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.7 Power Architecture &amp; GaN Electronics</h3>
    <p>A modern AI drone carries three distinct power domains: (1) high-current motor bus (direct battery, 22–51 V), (2) regulated avionics rail (5 V / 3 A), and (3) AI compute rail (12 V or 5 V, up to 25 W). Poor architecture creates ground loops, EMI coupling from ESCs into AI compute, and brownout cascades.</p>

    <h4 class="text-sky-300">GaN DC-DC Converters</h4>
    <p>Silicon MOSFET converters used in most commercial drones operate at 90–94% peak efficiency at 100–300 kHz. Gallium Nitride (GaN) power transistors switch at 500 kHz–2 MHz, enabling:</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-center">
        <div class="bg-slate-900 p-4 rounded border border-emerald-700/40">
            <div class="text-emerald-400 font-mono font-bold text-xl">98%</div>
            <div class="text-slate-400 text-xs mt-1">Peak conversion efficiency (GaN @ 25 A / 12 V output)</div>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-sky-700/40">
            <div class="text-sky-400 font-mono font-bold text-xl">5×</div>
            <div class="text-slate-400 text-xs mt-1">Smaller footprint vs equivalent Si converter</div>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-amber-700/40">
            <div class="text-amber-400 font-mono font-bold text-xl">4–8×</div>
            <div class="text-slate-400 text-xs mt-1">Smaller passive components (inductor / capacitor)</div>
        </div>
    </div>
    <p class="text-sm text-slate-300 mb-4">Representative GaN devices for drone power stages: EPC eGaN FETs, Infineon (GaN Systems) GS61004B, Texas Instruments LMG3522R030-Q1 (automotive/drone rated). At 6S battery voltage (25.2 V max), GaN converters delivering 12 V for a Jetson Orin NX payload add only ~1–2 W of conversion loss vs 4–7 W for a comparable Si design.</p>

    <h4 class="text-sky-300">Distributed Power Architecture</h4>
    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-4">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Centralized vs Distributed PDU Tradeoffs</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Architecture</th><th class="p-3 text-left">Advantages</th><th class="p-3 text-left">Disadvantages</th>
            </tr></thead>
            <tbody class="text-xs text-slate-300">
                <tr class="border-t border-slate-800 align-top"><td class="p-3 text-white font-mono">Centralized PDU</td><td class="p-3">Simple; low component count; easy BMS integration</td><td class="p-3">Single point of failure; long cable runs; ESC noise couples into AI rails</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50 align-top"><td class="p-3 text-white font-mono">Distributed PoL</td><td class="p-3">Noise isolation per load; per-load power monitoring; survives partial failure</td><td class="p-3">More components; higher design complexity; slight weight increase</td></tr>
            </tbody>
        </table>
    </div>
    <p class="text-sm text-slate-300 mb-4">Best practice for 2024+ AI drones: motors on the direct battery bus; AI compute on a dedicated isolated GaN converter with bulk capacitor bank; flight controller on a separate linear regulator for low-noise 5 V. This isolates high-frequency ESC switching noise from sensitive AI compute and sensor IMUs.</p>

    <h4 class="text-sky-300">Smart Battery Management — Protocol Comparison</h4>
    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">BMS Communication Protocols (2024)</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Protocol</th><th class="p-3 text-left">Speed</th><th class="p-3 text-left">Use case</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">SMBus / I²C (SBS)</td><td class="p-3">100/400 kHz</td><td class="p-3">Legacy consumer packs; reads voltage, current, temp, SoC, cycle count</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">CAN Bus (DroneCAN)</td><td class="p-3">1 Mbps</td><td class="p-3">Industrial multi-battery UAV; noise-immune; integrates into MAVLink telemetry</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">UART (Tattu Plus / Grepow)</td><td class="p-3">115200 – 460800 bps</td><td class="p-3">Smart pack serial stream; real-time per-cell voltage to GCS</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">BLE 5.x</td><td class="p-3">2 Mbps</td><td class="p-3">Ground-station pre-flight check; wireless SoH readout without powering the drone</td></tr>
            </tbody>
        </table>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.8  MISSION ENDURANCE OPTIMIZATION & WEIGHT BUDGET
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.8 Mission Endurance Optimization &amp; Weight Budget</h3>
    <p>The full endurance equation unifies all previous sections into a single engineering decision tool:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        E [hours] = (C_Wh × η_discharge) / (P_aero + P_avionics + P_payload)<br><br>
        <span class="text-slate-400">P_aero = (m·g)<sup>3/2</sup> / (FM · sqrt(2 · ρ · N · π · R²))</span><br>
        <span class="text-slate-400">η_discharge ≈ 0.85 – 0.90 (accounts for Peukert, temperature, min cutoff voltage)</span>
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm mb-4">
        <div class="text-slate-400 text-xs uppercase tracking-wider mb-3">Worked Example — 2 kg AI Inspection Drone</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div>
                <div class="text-sky-400 mb-1">Battery: 4S 10,000 mAh LiPo</div>
                E_battery = 14.8 V × 10 Ah × 0.85 = <span class="text-white font-bold">125.8 Wh</span><br><br>
                <div class="text-sky-400 mt-2 mb-1">P_aero (4× 12" props, FM = 0.70)</div>
                P_aero ≈ <span class="text-white font-bold">147 W</span>
            </div>
            <div>
                <div class="text-sky-400 mb-1">P_avionics (FC + ESCs + GPS)</div>
                ≈ <span class="text-white font-bold">8 W</span><br><br>
                <div class="text-sky-400 mt-2 mb-1">P_payload (Orin Nano 10W + Hailo-8 2.5W + cam 3W)</div>
                ≈ <span class="text-white font-bold">15.5 W</span>
            </div>
        </div>
        <div class="border-t border-slate-700 mt-4 pt-3 text-center text-emerald-400">
            P_total ≈ 170.5 W &nbsp;→&nbsp; Endurance ≈ 44.3 min (theoretical) / <span class="font-bold">32–38 min real-world</span>
        </div>
    </div>

    <h4 class="text-sky-300">Range-Optimal Cruise Speed</h4>
    <p class="text-sm text-slate-300 mb-2">Hover maximizes endurance; a specific forward speed maximizes range. From Bauersfeld &amp; Scaramuzza (ETH Zurich, 2022):</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        v_optimal = v_h × 3<sup>1/4</sup> ≈ 1.32 × v_h<br>
        <span class="text-slate-400 text-xs">For the 2 kg example: v_h = sqrt(50 / 2.45) ≈ 4.5 m/s → v_opt ≈ 5.9 m/s (21 km/h)</span>
    </div>
    <p class="text-sm text-slate-300 mb-4">At range-optimal speed, aero power is approximately 85% of hover power (translational lift benefit), but the drone covers ground 5.9 m every second. Estimated max range on the 2 kg example: <strong>~18 km on a single 4S 10 Ah pack</strong>.</p>

    <h4 class="text-sky-300">Typical 2 kg AI Drone Weight Budget</h4>
    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Mass Budget Breakdown (2,000 g MTOW)</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Subsystem</th><th class="p-3 text-left">Mass (g)</th><th class="p-3 text-left">% MTOW</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Frame (CFRP woven)</td><td class="p-3">180</td><td class="p-3">9.0%</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-amber-400">Battery (4S 10 Ah LiPo)</td><td class="p-3 text-amber-400">580</td><td class="p-3 text-amber-400">29.0% ← largest single item</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">4× Motors + ESCs</td><td class="p-3">260</td><td class="p-3">13.0%</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">4× Propellers (12")</td><td class="p-3">80</td><td class="p-3">4.0%</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">AI compute (Orin Nano module)</td><td class="p-3">45</td><td class="p-3">2.25%</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">AI accelerator (Hailo-8 M.2)</td><td class="p-3">12</td><td class="p-3">0.6%</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Carrier board + GaN PDU</td><td class="p-3">80</td><td class="p-3">4.0%</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Camera payload (gimbal)</td><td class="p-3">180</td><td class="p-3">9.0%</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">GPS + FC + telemetry</td><td class="p-3">105</td><td class="p-3">5.25%</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Wiring harness</td><td class="p-3">60</td><td class="p-3">3.0%</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Thermal management (heatsinks / PCM)</td><td class="p-3">40</td><td class="p-3">2.0%</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Misc + fasteners + vibration mounts</td><td class="p-3">50</td><td class="p-3">2.5%</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-emerald-400 font-bold">Margin / additional payload</td><td class="p-3 text-emerald-400 font-bold">~328</td><td class="p-3 text-emerald-400 font-bold">~16.4%</td></tr>
            </tbody>
        </table>
    </div>

    <div class="insight-box mb-6">
        <div class="insight-label">The Battery Rules Everything</div>
        <p class="text-slate-200 text-sm mt-1">At 29% of MTOW, the battery is the largest single mass item — more than all four motors, ESCs, and props combined. This is why energy density improvements (LiPo → Li-Si → solid-state) have an outsized impact on endurance. Switching from a 200 Wh/kg LiPo pack to a 450 Wh/kg Li-Si pack at the same mass more than doubles flight time, without changing a single line of AI code or a single motor turn.</p>
    </div>

    <h4 class="text-sky-300">Dynamic Power Management — Mission Phase Strategy</h4>
    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Mission Power Profile — Reconnaissance Flight</div>
        <table class="w-full text-sm">
            <thead><tr class="bg-slate-800/50 text-slate-400 text-xs">
                <th class="p-3 text-left">Phase</th><th class="p-3 text-left">Duration</th><th class="p-3 text-left">AI state</th><th class="p-3 text-left">Power vs hover</th>
            </tr></thead>
            <tbody class="font-mono text-xs text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">Takeoff / climb</td><td class="p-3">~1 min</td><td class="p-3 text-slate-400">Standby</td><td class="p-3 text-rose-400">+20% (high throttle)</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Transit to target</td><td class="p-3">5 – 20 min</td><td class="p-3 text-sky-400">7 W efficiency mode</td><td class="p-3 text-emerald-400">−10 – 15% (translational lift)</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">ISR hover / loiter</td><td class="p-3">Variable</td><td class="p-3 text-amber-400">15 W performance mode</td><td class="p-3 text-amber-400">Baseline + AI power</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">Emergency (SoC &lt;20%)</td><td class="p-3">Until land</td><td class="p-3 text-rose-400">AI disabled, FC only</td><td class="p-3 text-emerald-400">−30 W savings</td></tr>
            </tbody>
        </table>
    </div>
    <p class="text-sm text-slate-300">2024 research shows dynamically swapping to a lighter model (YOLOv8n INT8 vs YOLOv8m FP16) when SoC drops below a threshold achieves ~40% power reduction with only 3–5% mAP degradation — effectively recovering 4–8 minutes of flight time per mission. Implement via a ROS 2 node monitoring <code>/fmu/out/battery_status</code> (PX4 Micro XRCE-DDS) or <code>/mavros/battery</code> (MAVROS) and calling <code>sudo nvpmodel -m 1</code> at the threshold.</p>
</div>
`;
