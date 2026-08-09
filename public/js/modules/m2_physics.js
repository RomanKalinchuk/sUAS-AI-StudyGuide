export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 2</span>
    <h2>Flight Physics, Propulsion &amp; SWaP-C Engineering</h2>
    <p>Engineering an AI drone is a multi-physics optimization problem where aerodynamics, power, thermal, and compute all fight for the same gram budget. This module covers the complete chain — from momentum theory and blade element analysis through battery discharge, thermal management, and edge AI silicon benchmarks — providing the mathematical tools to reason about every design tradeoff.</p>

    <!-- ═══════════════════════════════════════════════════════════════
         VIDEO 1 — Aerodynamics of Multirotor Drones
    ════════════════════════════════════════════════════════════════ -->
    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Aerodynamics of Multirotor Drones — Video Overview</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/KbiEmhpKVlo" title="Aerodynamics of Multirotor Drones" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-sm mt-2">Covers the key aerodynamic principles governing multirotor flight, including thrust generation, rotor wake interactions, and translational lift.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.1  ACTUATOR DISK & MOMENTUM THEORY
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.1 Actuator Disk Theory &amp; Hover Power</h3>
    <p>The simplest useful model of a rotor treats the spinning disk as an <strong>actuator disk</strong> — an infinitely thin surface that accelerates air axially. Momentum theory derives the ideal (minimum possible) power required to generate a given thrust by conserving mass, momentum, and energy through the rotor disk.</p>

    <figure class="my-6">
        <img src="images/m2_actuator_disk.svg" alt="Actuator disk theory diagram showing pressure and velocity distribution through a rotor" class="rounded-lg w-full max-w-lg mx-auto block bg-white p-2">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Actuator disk model: pressure jumps across the disk, air accelerates from upstream to far-wake. Source: <a href="https://commons.wikimedia.org/wiki/File:Actuator_disk.svg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons</a> (CC BY-SA 3.0)</figcaption>
    </figure>

    <p>The three governing equations through the actuator disk:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4 space-y-1">
        <div>T = ṁ · Δv = 2ρ·A·v_i · (v_i + V∞)  <span class="text-slate-400 text-xs ml-2">← thrust (momentum)</span></div>
        <div>v_far-wake = 2v_i + V∞                <span class="text-slate-400 text-xs ml-2">← far-wake velocity</span></div>
        <div>P_ideal = T · v_i                      <span class="text-slate-400 text-xs ml-2">← induced power</span></div>
    </div>
    <p>In pure hover (V∞ = 0), the induced velocity simplifies to:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        v_h = sqrt(T / (2·ρ·A)) &nbsp;→&nbsp; P_ideal = T<sup>3/2</sup> / sqrt(2·ρ·A)
    </div>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-6">
        <h3 class="text-sky-400 font-bold text-lg mb-3">Why This Matters for AI Drone Design</h3>
        <p class="text-slate-300 text-sm">Every gram of AI hardware increases thrust T, which raises P_ideal as T<sup>3/2</sup> — a superlinear penalty. Adding 300 g of Jetson Orin Nano to a 1.5 kg drone increases hover power by <strong>31%</strong>, not 20%. This "SWaP trap" is the central engineering tension of this entire study guide.</p>
    </div>

    <h4 class="text-sky-300">Weight Penalty Worked Example</h4>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-center text-sm">
            <div class="text-slate-400 text-xs uppercase tracking-wider mb-2">Base Drone (no AI)</div>
            <div class="text-2xl font-bold text-white font-mono">1.5 kg</div>
            <div class="text-emerald-400 font-mono mt-2 text-lg">95.4 W</div>
            <div class="text-slate-500 text-xs mt-1">to hover (4× 12" props, FM 0.70)</div>
        </div>
        <div class="bg-sky-900/30 p-4 rounded border border-sky-600 text-center text-sm">
            <div class="text-sky-400 text-xs uppercase tracking-wider mb-2">AI Payload Added</div>
            <div class="text-2xl font-bold text-white font-mono">+300 g</div>
            <div class="text-sky-300 font-mono mt-2 text-lg">+30.0 W</div>
            <div class="text-slate-400 text-xs mt-1">extra hover power required</div>
        </div>
        <div class="bg-rose-900/20 p-4 rounded border border-rose-700/50 text-center text-sm">
            <div class="text-rose-400 text-xs uppercase tracking-wider mb-2">With AI (1.8 kg total)</div>
            <div class="text-2xl font-bold text-white font-mono">1.8 kg</div>
            <div class="text-rose-400 font-mono mt-2 text-lg">125.4 W</div>
            <div class="text-slate-400 text-xs mt-1">to hover (+31.5% more power)</div>
        </div>
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded p-4 text-sm mb-6">
        <div class="text-slate-400 text-xs uppercase tracking-wider mb-2">Work the numbers yourself — this is the calculation you will repeat on every design</div>
        <div class="font-mono text-xs text-slate-300 space-y-1">
            <div>Rotor radius R = 6" = 0.1524 m &nbsp;→&nbsp; A_total = 4 · π · 0.1524² = <span class="text-sky-300">0.2919 m²</span></div>
            <div>sqrt(2 · ρ · A) = sqrt(2 · 1.225 · 0.2919) = <span class="text-sky-300">0.8456</span></div>
            <div class="pt-1">At 1.5 kg: T = 14.72 N &nbsp;→&nbsp; T<sup>3/2</sup> = 56.45 &nbsp;→&nbsp; P_ideal = 56.45 / 0.8456 = 66.8 W &nbsp;→&nbsp; ÷ FM 0.70 = <span class="text-emerald-400">95.4 W</span></div>
            <div>At 1.8 kg: T = 17.66 N &nbsp;→&nbsp; T<sup>3/2</sup> = 74.21 &nbsp;→&nbsp; P_ideal = 74.21 / 0.8456 = 87.8 W &nbsp;→&nbsp; ÷ FM 0.70 = <span class="text-rose-400">125.4 W</span></div>
        </div>
        <p class="text-slate-400 text-xs mt-3">Notice that the <em>percentage</em> penalty — (1.8/1.5)<sup>3/2</sup> = 1.315, i.e. +31.5% — is completely independent of FM, air density, and rotor size. Those terms all cancel in the ratio. That is why the 3/2 exponent is the one piece of aerodynamics worth memorizing: mass fraction alone tells you the power penalty, before you have chosen a single component.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.2  FIGURE OF MERIT & DISK LOADING
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.2 Figure of Merit &amp; Disk Loading</h3>
    <p>Real rotors are less efficient than the ideal actuator disk. Profile drag, swirl losses, tip losses, and non-uniform inflow all extract additional power beyond P_ideal. The <strong>Figure of Merit (FM)</strong> captures the gap between ideal and real performance:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        FM = P_ideal / P_shaft &nbsp;→&nbsp; P_actual = T<sup>3/2</sup> / (FM · sqrt(2·ρ·A))
    </div>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Rotor Type</th>
                    <th class="p-3">FM Range</th>
                    <th class="p-3">Notes</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-white">Full-scale helicopter main rotor</td><td class="p-3 text-emerald-400">0.70 – 0.80</td><td class="p-3 text-slate-300">Best-in-class; large Re, optimized airfoils</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Large multirotor (&gt;12" props)</td><td class="p-3 text-emerald-400">0.65 – 0.75</td><td class="p-3 text-slate-300">T-Motor / KDE quality; turbulent Re regime</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">Standard multirotor (5"–12")</td><td class="p-3 text-amber-400">0.55 – 0.70</td><td class="p-3 text-slate-300">Most commercial platforms</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Micro-rotor (Re ≈ 70,000)</td><td class="p-3 text-rose-400">0.50 – 0.65</td><td class="p-3 text-slate-300">Scale effects dominate; laminar separation</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">Toroidal propeller (MIT Lincoln Lab)</td><td class="p-3 text-emerald-400">~equiv + −10 dB</td><td class="p-3 text-slate-300">Same thrust at same power; much quieter</td></tr>
            </tbody>
        </table>
    </div>

    <p><strong>Disk loading (DL = T/A)</strong> is the single most important design lever for hover efficiency. Lower disk loading means the rotor accelerates a larger mass of air by a smaller velocity increment — far more efficient. Hover power scales as:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        P_hover ∝ sqrt(DL) &nbsp;→&nbsp; halving disk area raises hover power by ~41%
    </div>

    <figure class="my-6">
        <img src="images/m2_disk_loading_chart.svg" alt="VTOL disk loading vs lift efficiency chart showing helicopters, multirotors, and fixed-wing aircraft" class="rounded-lg w-full bg-white p-2">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Disk loading vs. hover lift efficiency for VTOL aircraft types. Lower disk loading = higher hover efficiency. Source: <a href="https://commons.wikimedia.org/wiki/File:VTOL_DiscLoad-LiftEfficiency.svg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">NASA / Wikimedia Commons</a> (Public Domain)</figcaption>
    </figure>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Platform</th>
                    <th class="p-3">Prop Size</th>
                    <th class="p-3">DL (N/m²)</th>
                    <th class="p-3">Hover Efficiency</th>
                    <th class="p-3">Typical Mission</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-white">Racing FPV (5")</td><td class="p-3 text-slate-300">5"</td><td class="p-3 text-rose-400">120 – 180</td><td class="p-3 text-rose-400">Poor</td><td class="p-3 text-slate-300">Agility over endurance</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">AI inspection drone</td><td class="p-3 text-slate-300">12"</td><td class="p-3 text-amber-400">40 – 70</td><td class="p-3 text-amber-400">Good</td><td class="p-3 text-slate-300">30–45 min loiter</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">Heavy-lift survey/ISR</td><td class="p-3 text-slate-300">18"–24"</td><td class="p-3 text-emerald-400">20 – 40</td><td class="p-3 text-emerald-400">Best</td><td class="p-3 text-slate-300">60+ min endurance</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Full-scale helicopter</td><td class="p-3 text-slate-300">~7 m</td><td class="p-3 text-emerald-400">20 – 80</td><td class="p-3 text-emerald-400">Excellent</td><td class="p-3 text-slate-300">High Re, optimized blade</td></tr>
            </tbody>
        </table>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.3  BLADE ELEMENT THEORY
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.3 Blade Element Theory (BET)</h3>
    <p>Actuator disk theory gives you the efficiency floor but tells you nothing about blade geometry. <strong>Blade Element Theory</strong> divides the propeller blade into radial strips, treats each as a 2D airfoil moving at the local velocity, and integrates lift and drag along the span to get total thrust and torque.</p>

    <p>For a blade element at radius <em>r</em>, chord <em>c(r)</em>, and local inflow angle φ:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4 space-y-1">
        <div>V_rel(r) = sqrt( (Ω·r)² + v_i² )   <span class="text-slate-400 text-xs ml-2">← local resultant velocity</span></div>
        <div>dT = ½ρ·V_rel²·c(r)·(Cl·cosφ − Cd·sinφ)·dr  <span class="text-slate-400 text-xs ml-2">← thrust element</span></div>
        <div>dQ = ½ρ·V_rel²·c(r)·(Cl·sinφ + Cd·cosφ)·r·dr <span class="text-slate-400 text-xs ml-2">← torque element</span></div>
        <div>T = N_blades · ∫ dT   Q = N_blades · ∫ dQ   <span class="text-slate-400 text-xs ml-2">← integrate 0→R</span></div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
        <div class="bg-slate-800/60 border border-amber-700/60 rounded-xl p-5">
            <h4 class="text-amber-400 font-bold mb-2">BET Design Levers</h4>
            <ul class="text-slate-300 text-xs space-y-1 list-disc list-inside">
                <li><strong>Blade twist:</strong> Higher pitch near root, lower at tip — equalizes angle of attack spanwise for uniform loading</li>
                <li><strong>Taper ratio:</strong> Elliptical chord distribution minimizes induced drag (Prandtl); practical props approximate this with linear taper</li>
                <li><strong>Blade count:</strong> More blades = smoother torque, lower noise at same RPM, but higher profile drag</li>
                <li><strong>Airfoil section:</strong> Thin cambered sections (6–9% t/c) at Re 50,000–300,000 outperform NACA 0012</li>
            </ul>
        </div>
        <div class="bg-slate-800/60 border border-rose-700/60 rounded-xl p-5">
            <h4 class="text-rose-400 font-bold mb-2">Reynolds Number Effects on Small Props</h4>
            <p class="text-slate-300 text-xs">Small drone propellers operate at chord Reynolds numbers of 30,000–300,000 — a critical regime where laminar separation bubbles form on the suction surface. This causes:</p>
            <ul class="text-slate-300 text-xs mt-2 space-y-1 list-disc list-inside">
                <li>Cd 3–5× higher than fully turbulent predictions</li>
                <li>Cl/Cd peaks at unusually high angles of attack (~8–12°)</li>
                <li>Efficiency of 5" props can be 15–25% lower than BET predicts without Re-correction</li>
                <li>Turbulators (trip strips) improve FM by 3–8% on lab-scale props</li>
            </ul>
        </div>
    </div>

    <h4 class="text-sky-300">Motor KV Selection &amp; Propeller Matching</h4>
    <p class="text-sm text-slate-300 mb-2">Motor KV (RPM/Volt, no-load) must be matched to propeller size to keep current within motor and ESC ratings. The "law of dynamic balance" states that motor KV and propeller load must work in tandem to reach the motor's power peak near maximum efficiency:</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Application</th>
                    <th class="p-3">Prop Size</th>
                    <th class="p-3">Motor KV</th>
                    <th class="p-3">Battery S</th>
                    <th class="p-3">Rationale</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-white">Racing FPV</td><td class="p-3 text-slate-300">5"</td><td class="p-3 text-rose-400">2,200 – 2,700</td><td class="p-3 text-slate-300">4S – 6S</td><td class="p-3 text-slate-300">Max RPM, agility over efficiency</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Cinematic / AI payload</td><td class="p-3 text-slate-300">7"–10"</td><td class="p-3 text-amber-400">1,200 – 1,700</td><td class="p-3 text-slate-300">4S – 6S</td><td class="p-3 text-slate-300">Balance thrust and hover time</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">Inspection / ISR drone</td><td class="p-3 text-slate-300">12"–15"</td><td class="p-3 text-emerald-400">800 – 1,200</td><td class="p-3 text-slate-300">4S – 6S</td><td class="p-3 text-slate-300">Low disk loading, max endurance</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Heavy-lift / survey</td><td class="p-3 text-slate-300">18"–24"</td><td class="p-3 text-emerald-400">300 – 700</td><td class="p-3 text-slate-300">6S – 12S</td><td class="p-3 text-slate-300">High torque, large blade chord</td></tr>
            </tbody>
        </table>
    </div>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-6">
        <h3 class="text-sky-400 font-bold text-lg mb-3">Toroidal Propellers — Acoustic Signature Reduction</h3>
        <p class="text-slate-300 text-sm">MIT Lincoln Laboratory's <a href="https://www.ll.mit.edu/partner-us/available-technologies/toroidal-propeller-0" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">toroidal propeller design</a> loops blade tips back to form a closed ring, eliminating discrete tip vortices — the primary noise source on conventional props. Testing through 2025–2026 shows: <strong>acoustic signature reduced by ~10 dB SPL</strong> at half the operating distance, with thrust levels identical to conventional designs at the same power input. The closed-loop structure also increases blade stiffness, reducing flutter. DoD counter-UAS implications are significant: quieter drones are harder to detect acoustically.</p>
    </div>

    <h4 class="text-sky-300">Translational Lift &amp; Forward-Flight Power</h4>
    <p>Hover is the least efficient flight mode. As forward speed increases, incoming free-stream air partially replaces the recirculated vortex wake, reducing required induced velocity. Total power follows the modified Glauert model:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        P(v) = P_hover · [ sqrt( (v⁴ / 4v_h⁴) + 1 ) − v² / (2v_h²) ]<br>
        <span class="text-slate-400 text-xs">where v_h = sqrt(T / (2ρA)) = induced velocity in hover</span>
    </div>
    <p class="text-sm text-slate-300 mb-2">Power dips <strong>10–15% below hover at ~5–8 m/s</strong> (translational lift), then rises steeply above ~12 m/s as parasite drag dominates. For the 2 kg / 12"-prop drone used throughout this module: v_h ≈ 5.2 m/s, and range-optimal cruise ≈ <strong>6.9 m/s (25 km/h)</strong> — derived in §2.10.</p>
    <div class="insight-box mb-6">
        <div class="insight-label">Design Implication</div>
        <p class="text-slate-200 text-sm mt-1"><strong>Variable-pitch propellers</strong> (T-Motor MF series) decouple RPM from thrust — the motor runs at its efficiency peak while pitch handles rapid thrust changes. The mechanism adds ~20–50 g per arm but delivers better control bandwidth than RPM modulation alone and improves hover efficiency by 2.6–7.5%.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.4  BATTERY DISCHARGE, PEUKERT & BROWNOUTS
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.4 Lithium Battery Discharge, Peukert &amp; Brownouts</h3>
    <p>Drones use Lithium Polymer (LiPo) or Lithium-Ion 21700-cell packs. Voltage is not constant — a 6S LiPo drops from 25.2 V (4.2 V/cell) to ~19.2 V at hard cutoff (3.2 V/cell). Rated capacity is not delivered at all C-rates. The <strong>Peukert equation</strong> models capacity reduction under high discharge:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        C_effective = C_rated × (I_rated / I_actual)<sup>(k−1)</sup>
    </div>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr><th class="p-3">Chemistry</th><th class="p-3">k range</th><th class="p-3">Typical k</th><th class="p-3">Capacity loss at 6C</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-white">LiPo (polymer)</td><td class="p-3 text-slate-300">1.05 – 1.15</td><td class="p-3 text-emerald-400">1.08</td><td class="p-3 text-amber-400">~13%</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Li-ion 21700 cells</td><td class="p-3 text-slate-300">1.10 – 1.30</td><td class="p-3 text-amber-400">1.15</td><td class="p-3 text-rose-400">~24%</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">LiFePO₄</td><td class="p-3 text-slate-300">1.02 – 1.10</td><td class="p-3 text-emerald-400">1.05</td><td class="p-3 text-emerald-400">~9%</td></tr>
            </tbody>
        </table>
    </div>
    <p class="text-sm text-slate-300 mb-2">Capacity loss above is computed against a 1C reference draw. Worked example — a 5,000 mAh LiPo (k = 1.08, I_rated = 1C = 5 A) discharged at 6C (30 A):</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-xs text-slate-300 mb-4 space-y-1">
        <div>C_eff = 5,000 · (5 / 30)<sup>0.08</sup> = 5,000 · (0.1667)<sup>0.08</sup></div>
        <div>(0.1667)<sup>0.08</sup> = exp(0.08 · ln 0.1667) = exp(0.08 · −1.7918) = exp(−0.1433) = 0.8665</div>
        <div>C_eff = <span class="text-amber-400">4,332 mAh</span> &nbsp;→&nbsp; a <span class="text-amber-400">13.3% penalty</span> the mission planner must budget for</div>
    </div>
    <p class="text-sm text-slate-300 mb-4">Two cautions. First, the Peukert exponent is only defined relative to a stated reference current — quoting "k = 1.08" without saying what I_rated is makes the number meaningless. Second, the equation assumes <em>constant</em> current. A real mission is a throttle-varying load, so production packs estimate remaining energy with a dynamic equivalent-circuit model in an EKF (see Module 9) rather than by applying Peukert directly.</p>

    <h4 class="text-sky-300">State of Charge (SoC) Estimation</h4>
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr><th class="p-3">Method</th><th class="p-3">Accuracy</th><th class="p-3">Notes</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-white">Voltage-based (OCV lookup)</td><td class="p-3 text-rose-400">±5 – 10%</td><td class="p-3 text-slate-300">Only valid at rest; flat LiPo OCV curve makes it unreliable mid-flight</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Coulomb counting</td><td class="p-3 text-amber-400">±2 – 5%</td><td class="p-3 text-slate-300">Integrates I·dt; cumulative drift requires periodic OCV re-anchor</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">Extended Kalman Filter (EKF)</td><td class="p-3 text-emerald-400">±1 – 3%</td><td class="p-3 text-slate-300">Fuses voltage + current via ECM model; self-correcting; the standard approach in modern smart packs</td></tr>
            </tbody>
        </table>
    </div>

    <h4 class="text-sky-300">Cycle Life vs. Depth of Discharge</h4>
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
    <p>An aggressive maneuver can draw 150 A instantaneously. Internal resistance causes immediate voltage sag — the "brownout" — that can hard-reset the Linux OS on the companion computer mid-flight.</p>
    <div class="bg-red-900/20 border border-red-500/50 p-4 rounded mb-4 text-red-200">
        <strong>CRITICAL FAILURE MODE:</strong> If the voltage reaching the companion computer sags below its operating threshold for even a millisecond, the OS hard-resets. The drone loses all AI capabilities mid-flight, potentially causing a fly-away or crash.
    </div>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr><th class="p-3">Temperature</th><th class="p-3">R_int per cell</th><th class="p-3">4S sag at 30 A</th><th class="p-3">Relative capacity</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-white">+25°C (nominal)</td><td class="p-3 text-slate-300">3 – 6 mΩ</td><td class="p-3 text-emerald-400">0.36 – 0.72 V</td><td class="p-3 text-emerald-400">100%</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">0°C</td><td class="p-3 text-slate-300">10 – 15 mΩ</td><td class="p-3 text-amber-400">1.2 – 1.8 V</td><td class="p-3 text-amber-400">93 – 95%</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">−10°C</td><td class="p-3 text-slate-300">15 – 20 mΩ</td><td class="p-3 text-rose-400">1.8 – 2.4 V</td><td class="p-3 text-rose-400">75 – 80%</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">−20°C</td><td class="p-3 text-slate-300">25 – 40 mΩ</td><td class="p-3 text-rose-400">3.0 – 4.8 V</td><td class="p-3 text-rose-400">50 – 65%</td></tr>
            </tbody>
        </table>
    </div>

    <p><strong>Engineering Solution:</strong> Buck-boost regulators with low-ESR capacitor banks immediately before the AI board. Sizing formula:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        C_min = (ΔI × t_rise) / ΔV_max<br>
        <span class="text-slate-400 text-xs">Orin NX at 12 V: ΔI = 1.83 A, t_rise = 1 ms, ΔV = 0.2 V → C_min = 9.15 mF</span>
    </div>
    <p class="text-sm text-slate-300 mb-2">In practice a <strong>10–47 mF low-ESR bulk capacitor bank</strong> (electrolytic + X5R MLCC mix) at the AI board power input is standard. For cold-environment missions, raise the low-battery land threshold from 3.3 V/cell to <strong>3.6 V/cell</strong> to compensate for elevated voltage sag masking true SoC.</p>
    <p class="text-sm text-slate-300 mb-2">Dynamic power-mode management via <code>nvpmodel</code> from a ROS 2 node lets the aircraft trade inference throughput for endurance as the battery drains. On a JetPack 6.2+ Orin Nano Super the available modes are <strong>7 W</strong>, <strong>15 W</strong>, <strong>25 W</strong>, and <strong>MAXN_SUPER</strong> (uncapped — highest CPU/GPU/DLA/PVA clocks). Query the actual numbering on your own board rather than assuming it, because the index-to-mode mapping differs between module variants and JetPack releases:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-xs text-sky-300 mb-3 space-y-1">
        <div>sudo nvpmodel -q --verbose &nbsp;<span class="text-slate-400"># list modes and current selection</span></div>
        <div>sudo nvpmodel -m &lt;id&gt; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-slate-400"># switch mode (id from the query above)</span></div>
        <div>sudo jetson_clocks &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-slate-400"># pin clocks to the max of the selected mode</span></div>
    </div>
    <p class="text-sm text-slate-300 mb-6">Switching dynamically on <code>/fmu/out/battery_status</code> recovers roughly 2 minutes on a mixed ISR mission. One caution: a mode change is not instantaneous and briefly perturbs clocks, so trigger it during transit rather than mid-approach, and never inside a control loop that assumes fixed inference latency.</p>

    <!-- ═══════════════════════════════════════════════════════════════
         2.5  THERMAL DYNAMICS
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.5 Thermal Dynamics &amp; Cooling Technologies</h3>
    <p>In an enclosed drone body, natural convection is insufficient for 15 W+ processors. The Jetson Orin NX has a thermal design guide specifying a max module case temperature of <strong>80°C</strong> — beyond that, throttling begins. With a typical junction-to-case resistance of ~1.5°C/W and 40 W maximum power, maintaining safe junction temperatures requires careful heatsink and airflow design even in benign ambient conditions.</p>

    <figure class="my-6">
        <img src="images/m2_quadrotor_hover.png" alt="Quadrotor hover diagram showing rotor wash and air circulation patterns" class="rounded-lg w-full max-w-md mx-auto block">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Quadrotor in hover showing rotor wash directions. Prop wash is a significant passive cooling resource for the electronics bay when the body is designed to channel it. Source: <a href="https://commons.wikimedia.org/wiki/File:Quadrotorhover.svg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons / Purpy Pupple</a> (CC BY-SA 3.0)</figcaption>
    </figure>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr><th class="p-3">TIM Type</th><th class="p-3">Thermal Conductivity</th><th class="p-3">Notes</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-white">Standard silicone (Dowsil TC-5026)</td><td class="p-3 text-slate-400">3 – 5 W/m·K</td><td class="p-3 text-slate-300">Common, inexpensive, baseline</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Phase-change TIM pad</td><td class="p-3 text-sky-400">4 – 8 W/m·K</td><td class="p-3 text-slate-300">Better conformity at temp; self-renewing contact</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">Graphene foam TIM (2024)</td><td class="p-3 text-amber-400">17 – 48 W/m·K</td><td class="p-3 text-slate-300">Vertically aligned graphene; research validated</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">GT-90SPRO graphene (commercial)</td><td class="p-3 text-emerald-400">90 ± 10 W/m·K</td><td class="p-3 text-slate-300">300 µm thick; drone-deployable; 6.5 K·mm²/W Rc</td></tr>
            </tbody>
        </table>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <div class="text-sky-400 font-bold mb-2">Vapor Chamber</div>
            <p class="text-slate-300 text-xs">Effective conductivity 10,000–100,000 W/m·K. Chambers as thin as 0.4 mm appear in Jetson Orin carrier boards (ConnectTech, Antmicro). A 100×50×2 mm copper chamber weighs ~12–20 g vs ~45 g for equivalent solid copper — 60% lighter.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <div class="text-emerald-400 font-bold mb-2">Phase Change Material (PCM)</div>
            <p class="text-slate-300 text-xs">Paraffin wax PCM stores latent heat (~200 kJ/kg) during burst inference without any power draw. New 2024 PCM-metal-foam composites reach 10 W/m·K effective conductivity while retaining full latent heat capacity — ideal for intermittent high-load workloads.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <div class="text-rose-400 font-bold mb-2">Peltier (TEC) — Not Viable</div>
            <p class="text-slate-300 text-xs">COP = 0.3–0.7. Removing 10 W from an AI chip requires ~20 W of Peltier input — 30 W total. On a 2 kg drone this is ~25% of hover power. Reserved for tethered ISR with IR-cooled detectors requiring sub-ambient temperatures.</p>
        </div>
    </div>

    <div class="bg-slate-800/60 border border-amber-700/60 rounded-xl p-6 mb-6">
        <h3 class="text-amber-400 font-bold text-lg mb-3">Jetson Orin NX Thermal Envelope — Design Limits</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
            <div class="bg-slate-900 p-3 rounded"><div class="text-white font-mono font-bold">80°C</div><div class="text-slate-400 text-xs mt-1">Module case temp limit</div></div>
            <div class="bg-slate-900 p-3 rounded"><div class="text-amber-400 font-mono font-bold">40 W</div><div class="text-slate-400 text-xs mt-1">Max MAXN Supermode TDP</div></div>
            <div class="bg-slate-900 p-3 rounded"><div class="text-emerald-400 font-mono font-bold">7–15 W</div><div class="text-slate-400 text-xs mt-1">nvpmodel modes 0/1</div></div>
            <div class="bg-slate-900 p-3 rounded"><div class="text-sky-400 font-mono font-bold">1.5°C/W</div><div class="text-slate-400 text-xs mt-1">Typical θjc (junction-to-case)</div></div>
        </div>
        <p class="text-slate-300 text-xs mt-3">Reference: <a href="https://developer.nvidia.com/downloads/jetson-orin-nx-orin-nano-series-thermal-design-guide" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">NVIDIA Jetson Orin NX/Nano Thermal Design Guide (TDG-11127-001, May 2025)</a></p>
    </div>

    <div class="interactive-panel">
        <h4 class="mt-0 text-sky-400 border-none">Advanced Thermal Estimator</h4>
        <p class="text-sm text-slate-400 mb-4">Adjust the parameters to see how airflow (from props or forward flight) affects the required heatsink size.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
                <label class="text-slate-400 block mb-1">Processor Power (W): <span id="pwr-val2" class="text-white font-bold">20 W</span></label>
                <input type="range" id="pwr-input2" min="5" max="60" value="20" class="w-full accent-sky-500" oninput="window.runThermalSim()">
            </div>
            <div>
                <label class="text-slate-400 block mb-1">Internal Ambient Temp (°C): <span id="amb-val2" class="text-white font-bold">45 °C</span></label>
                <input type="range" id="amb-input2" min="20" max="75" value="45" class="w-full accent-sky-500" oninput="window.runThermalSim()">
            </div>
            <div class="md:col-span-2">
                <label class="text-slate-400 block mb-1">Airflow Velocity over Heatsink (m/s): <span id="vel-val" class="text-white font-bold">1 m/s</span></label>
                <input type="range" id="vel-input" min="0" max="15" step="0.5" value="1.0" class="w-full accent-emerald-500" oninput="window.runThermalSim()">
                <p class="text-xs text-slate-500 mt-1">0 = Enclosed. 2–5 = Active Fan. 5–15 = Exposed to Prop Wash / Forward Flight.</p>
            </div>
        </div>
        <div class="mt-6 p-6 bg-slate-900 rounded border border-slate-700 text-center">
            <p class="text-slate-400 text-xs uppercase tracking-wider mb-2">Estimated Module Case Temperature (T<sub>case</sub>)</p>
            <div id="tj-result" class="text-4xl font-mono text-emerald-400 font-bold tracking-tight">65.0 °C</div>
            <div id="tj-status" class="mt-2 text-sm font-bold text-emerald-500">SAFE OPERATING ZONE</div>
            <div id="tj-detail" class="mt-3 text-xs font-mono text-slate-400">R_heatsink = 1.00 °C/W  ·  estimated junction Tj ≈ 75.0 °C</div>
            <p class="text-xs text-slate-500 mt-4 max-w-lg mx-auto">Model: T_case = T_ambient + P · R_heatsink, with a standard aluminium finned heatsink (R ≈ 2.5 °C/W in still air) and the convective coefficient scaling as √velocity. Junction is then estimated as T_case + P · θ_jc. Thresholds track the <strong>80 °C module case limit</strong> from NVIDIA's Orin thermal design guide — the same limit cited above.</p>
        </div>
        <div class="mt-4 bg-slate-900 p-4 rounded border-l-4 border-amber-500">
            <strong class="text-amber-400 block mb-1 text-sm">Read the airflow slider carefully</strong>
            <p class="text-slate-400 text-xs">Drag velocity to 0 and watch what happens: a 20 W module in a sealed 45 °C bay reaches 95 °C case — well past throttling — before it has flown anywhere. This is the single most common thermal mistake in drone integration. Engineers validate the compute stack on a bench with the enclosure open, then seal it into a carbon-fibre body for flight and cannot explain why inference frame rate collapses two minutes into every mission. <strong class="text-slate-200">Prop wash is a design resource:</strong> ducting even 3–5 m/s of rotor downwash across the heatsink roughly halves its thermal resistance and costs nothing in mass or power. Design the airflow path before you design the enclosure.</p>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.6  AIR DENSITY, ALTITUDE & GROUND EFFECT
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.6 Air Density, Altitude &amp; Ground Effect</h3>
    <p>Air density ρ is the hidden performance variable — every increase in altitude, temperature, or humidity reduces it, forcing motors to spin faster for the same thrust and shortening flight time. The ISA (International Standard Atmosphere) barometric formula:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        ρ(h) = 1.225 × (1 − 2.2558×10<sup>−5</sup> × h)<sup>4.2559</sup> &nbsp;[kg/m³, valid 0–11,000 m]<br>
        <span class="text-slate-400 text-xs">Simplified: ρ(h) ≈ 1.225 × exp(−h / 8,500)</span>
    </div>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr><th class="p-3">Altitude (m ASL)</th><th class="p-3">ρ (kg/m³)</th><th class="p-3">ρ/ρ₀</th><th class="p-3">ISA Temp</th><th class="p-3">Hover power penalty</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-white">0 (sea level)</td><td class="p-3 text-slate-300">1.225</td><td class="p-3 text-slate-300">1.000</td><td class="p-3 text-slate-300">+15°C</td><td class="p-3 text-emerald-400">Baseline</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">1,000</td><td class="p-3 text-slate-300">1.112</td><td class="p-3 text-slate-300">0.908</td><td class="p-3 text-slate-300">+8.5°C</td><td class="p-3 text-emerald-400">+5%</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">2,000</td><td class="p-3 text-slate-300">1.007</td><td class="p-3 text-slate-300">0.822</td><td class="p-3 text-slate-300">+2°C</td><td class="p-3 text-amber-400">+10%</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">3,000</td><td class="p-3 text-slate-300">0.909</td><td class="p-3 text-slate-300">0.742</td><td class="p-3 text-slate-300">−4.5°C</td><td class="p-3 text-amber-400">+16%</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">5,000</td><td class="p-3 text-slate-300">0.736</td><td class="p-3 text-slate-300">0.601</td><td class="p-3 text-slate-300">−17°C</td><td class="p-3 text-rose-400">+29%</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">8,000</td><td class="p-3 text-slate-300">0.526</td><td class="p-3 text-slate-300">0.429</td><td class="p-3 text-slate-300">−37°C</td><td class="p-3 text-rose-400">+53%</td></tr>
            </tbody>
        </table>
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        P_required(h) = P_SL × sqrt(ρ_SL / ρ(h))<br>
        <span class="text-slate-400 text-xs">At 5,000 m: P = P_SL × sqrt(1.225/0.736) = P_SL × 1.29 — 29% more power for identical hover</span>
    </div>
    <p class="text-sm text-slate-300 mb-2">Motor cooling also degrades at altitude. Thinner air means worse convective cooling; thermal resistance rises by approximately the same sqrt factor. <strong>Derate max continuous motor current by 15–20% at 5,000 m</strong> to maintain the same winding temperature as sea level.</p>

    <div class="insight-box mb-4">
        <div class="insight-label">Combined Altitude + Cold Battery Scenario</div>
        <p class="text-slate-200 text-sm mt-1">A drone rated for 20 min hover at sea level, operating at 5,000 m ASL at −17°C ISA: aero power +29%, battery capacity −30% (cold). Effective endurance: (0.70 / 1.29) × 20 min ≈ <strong>10.9 min</strong> — a 45% reduction. High-altitude missions require either larger packs, higher-efficiency props, or active battery heating.</p>
    </div>

    <h4 class="text-sky-300">Ground Effect (IGE) Physics</h4>
    <p>Operating within one rotor diameter of the ground reduces induced velocity as the ground interrupts free-wake contraction. The classical Cheeseman-Bennet IGE correction:</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        P_IGE = P_OGE / (1 + (R / 4z)²)<br>
        <span class="text-slate-400 text-xs">R = rotor radius, z = height above ground. Validated for z/R &gt; 0.5; 2025 meta-learning models extend to z → 0.</span>
    </div>
    <div class="grid grid-cols-3 gap-3 mb-6 text-center text-sm">
        <div class="bg-slate-900 p-3 rounded border border-emerald-700/50"><div class="text-emerald-400 font-mono font-bold">z = 0.5R</div><div class="text-slate-400 text-xs mt-1">~20% power saving</div></div>
        <div class="bg-slate-900 p-3 rounded border border-amber-700/50"><div class="text-amber-400 font-mono font-bold">z = 1.0R</div><div class="text-slate-400 text-xs mt-1">~6% power saving</div></div>
        <div class="bg-slate-900 p-3 rounded border border-slate-700"><div class="text-slate-400 font-mono font-bold">z = 2.0R</div><div class="text-slate-400 text-xs mt-1">~1.5% — out of effect</div></div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         VIDEO 2 — How Do Drones Really Fly?
    ════════════════════════════════════════════════════════════════ -->
    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">How Do Drones Really Fly? — Physics Deep Dive</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/fB5o6JaVlAk" title="How Do Drones Really Fly?" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-sm mt-2">A 2025 deep-dive into quadcopter flight physics: propeller thrust generation, Newton's third law, yaw/pitch/roll control via differential thrust, and why multirotors are inherently unstable without a flight controller.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.7  EDGE AI SILICON: 2025 SWaP-C COMPARISON
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.7 Edge AI Silicon: A 2026 SWaP-C Comparison</h3>
    <p>The "right" AI chip for a drone is never the most powerful — it is the one that delivers sufficient throughput within the power and mass budget. <strong>TOPS/Watt</strong> is the primary SWaP metric. Peak TOPS figures are theoretical maximums; real-world sustained inference at batch size 1 (forced by real-time video) typically achieves 30–60% of peak.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Chip / Module</th>
                    <th class="p-3">AI Perf.</th>
                    <th class="p-3">TDP</th>
                    <th class="p-3">TOPS/W</th>
                    <th class="p-3">Mass (module)</th>
                    <th class="p-3">Best for</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-white">Hailo-8 (M.2 2280)</td><td class="p-3 text-slate-300">26 TOPS</td><td class="p-3 text-emerald-400">2.5 W</td><td class="p-3 text-emerald-400 font-bold">10.4</td><td class="p-3 text-slate-300">~9 g</td><td class="p-3 text-slate-300">Vision inference, no DRAM overhead</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Hailo-10H (M.2)</td><td class="p-3 text-slate-300">40 TOPS INT4</td><td class="p-3 text-emerald-400">&lt;3.5 W</td><td class="p-3 text-emerald-400 font-bold">~16</td><td class="p-3 text-slate-300">~10 g</td><td class="p-3 text-slate-300">On-device LLM / gen-AI; 2025</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">Google Coral Edge TPU</td><td class="p-3 text-slate-300">4 TOPS</td><td class="p-3 text-emerald-400">2 W</td><td class="p-3 text-sky-400">2.0</td><td class="p-3 text-slate-300">~16 g (USB)</td><td class="p-3 text-slate-300">TFLite-only, lowest cost entry</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Qualcomm QCS6490 SoM</td><td class="p-3 text-slate-300">12 TOPS (NPU)</td><td class="p-3 text-slate-300">3 – 7 W</td><td class="p-3 text-sky-400">~2.5</td><td class="p-3 text-slate-300">~25 g</td><td class="p-3 text-slate-300">Complete drone-brain SoC + ISP</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">Rockchip RK3588 (SBC)</td><td class="p-3 text-slate-300">6 TOPS (NPU)</td><td class="p-3 text-slate-300">5 – 10 W</td><td class="p-3 text-amber-400">~1.0</td><td class="p-3 text-slate-300">~50 g (SBC)</td><td class="p-3 text-slate-300">Budget full-Linux; RKNN Toolkit 2</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Jetson Orin Nano Super 8 GB</td><td class="p-3 text-slate-300">67 TOPS*</td><td class="p-3 text-amber-400">7 – 25 W</td><td class="p-3 text-amber-400">2.7 – 9.6</td><td class="p-3 text-slate-300">~45 g</td><td class="p-3 text-slate-300">CUDA ecosystem, full PyTorch</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">Jetson Orin NX Super 16 GB</td><td class="p-3 text-slate-300">157 TOPS*</td><td class="p-3 text-rose-400">10 – 40 W</td><td class="p-3 text-sky-400">3.9 – 15.7</td><td class="p-3 text-slate-300">~70 g</td><td class="p-3 text-slate-300">SLAM + detection + mission planning</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Jetson AGX Thor T5000</td><td class="p-3 text-slate-300">2,070 FP4 TFLOPS</td><td class="p-3 text-rose-400">40 – 130 W</td><td class="p-3 text-slate-500">n/a (different metric)</td><td class="p-3 text-slate-300">~350 g w/ heatsink</td><td class="p-3 text-slate-300">Foundation models; &gt;15 kg airframes only</td></tr>
            </tbody>
        </table>
    </div>
    <p class="text-xs text-slate-500 mb-4">* Orin Nano 67 TOPS and Orin NX 157 TOPS are both Super Mode figures, unlocked by the JetPack 6.2 firmware update with no hardware change — the same physical module that shipped as "40 TOPS" in 2024 is the "67 TOPS" module today. Older tutorials and datasheets still quote the pre-Super numbers, so always check which figure a benchmark used. Real-world batch-1 inference is 30–60% of peak TOPS. Note also that TOPS across vendors is not directly comparable: Hailo quotes INT4 for the 10H and INT8 for the 8, NVIDIA quotes sparse INT8, and Thor quotes FP4 TFLOPS — these are different units measuring different arithmetic.</p>

    <div class="insight-box mb-4">
        <div class="insight-label">The 2026 Pareto-Optimal Stack</div>
        <p class="text-slate-200 text-sm mt-1">The classic split-brain build pairs a <strong>Hailo-8</strong> (deterministic vision inference at ~10 TOPS/W, no DRAM of its own) with a <strong>Jetson Orin Nano Super</strong> (flexible SLAM, planning, full CUDA). The Hailo handles perception at fixed latency; the Jetson handles cognition. What changed in 2026 is that the Orin Nano Super's jump to 67 TOPS closed much of the gap — for many sub-3 kg builds a single Orin Nano now carries the whole load, and the second accelerator buys you <em>latency determinism</em> rather than raw throughput. Add the Hailo when you need a perception path that cannot be stalled by whatever else the GPU is doing; skip it when you are throughput-bound and want one toolchain instead of two. The <strong>Hailo-10H</strong> (40 TOPS INT4, under 5 W, AEC-Q100 Grade 2 qualified with automotive production starting 2026) extends the same idea to generative workloads — roughly 10 tokens/s on a 7B LLM inside a 5 W budget.</p>
    </div>

    <h4 class="text-sky-300">Quantization: Precision vs. Power</h4>
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr><th class="p-3">Precision</th><th class="p-3">Relative power</th><th class="p-3">Speed vs FP32</th><th class="p-3">mAP loss</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-white">FP32</td><td class="p-3 text-slate-300">100%</td><td class="p-3 text-slate-300">1×</td><td class="p-3 text-emerald-400">Baseline</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">FP16</td><td class="p-3 text-sky-400">~52%</td><td class="p-3 text-slate-300">~2× (52 FPS)</td><td class="p-3 text-emerald-400">&lt;0.1%</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">INT8</td><td class="p-3 text-emerald-400">~28%</td><td class="p-3 text-slate-300">~4–8× (65 FPS)</td><td class="p-3 text-amber-400">0.5 – 2%</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">INT4 (Hailo-10H)</td><td class="p-3 text-emerald-400">~17%</td><td class="p-3 text-slate-300">~8–16×</td><td class="p-3 text-amber-400">2 – 5%</td></tr>
            </tbody>
        </table>
    </div>
    <p class="text-sm text-slate-300 mb-3">INT8 on the Orin NX reduces sustained inference power from ~18 W to ~12 W — a 33% saving for only ~1.2% mAP degradation on typical aerial detection. Structured pruning plus knowledge distillation compounds this: published YOLO-family results cut parameters by ~61% and FLOPs by ~65% while retaining ~97% of baseline mAP, roughly a 1.7× throughput gain on constrained hardware, with power falling proportionally.</p>
    <div class="insight-box mb-6">
        <div class="insight-label">Quantization Is a Power Decision, Not Just a Speed Decision</div>
        <p class="text-slate-200 text-sm mt-1">Engineers usually reach for INT8 to hit a frame rate. On an aircraft the more valuable effect is the <em>watts you did not spend</em>. Six watts saved on a 2 kg platform drawing ~170 W total is roughly 3.5% of the power budget — about 1.5 minutes of additional flight time on a 44-minute mission, for a fraction of a percent of accuracy. That trade is almost always correct. The exception is small-object detection at altitude, where the targets occupy few pixels and INT8 activation clipping costs disproportionately more mAP than the aggregate number suggests — validate on <em>your</em> altitude band, not on COCO.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.8  NEXT-GENERATION BATTERY TECHNOLOGIES
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.8 Next-Generation Battery Technologies</h3>
    <p>The drone industry's endurance ceiling is fundamentally set by energy storage chemistry. A wave of new technologies has broken through the 200 Wh/kg LiPo wall, and as of 2026 these are shipping products rather than lab curiosities — semi-solid-state packs are in industrial UAV service and silicon-anode cells are in production for delivery and defense platforms.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Technology</th>
                    <th class="p-3">Specific Energy</th>
                    <th class="p-3">Specific Power</th>
                    <th class="p-3">Status (Aug 2026)</th>
                    <th class="p-3">Drone Notes</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-white">LiPo pack (commercial)</td><td class="p-3 text-slate-400">150 – 200 Wh/kg</td><td class="p-3 text-slate-300">400 – 1,500 W/kg</td><td class="p-3 text-emerald-400">Mature</td><td class="p-3 text-slate-300">Dominant for &lt;30 min missions</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Li-ion 21700 cells (Samsung 50E)</td><td class="p-3 text-sky-400">250 – 280 Wh/kg</td><td class="p-3 text-slate-300">250 – 500 W/kg</td><td class="p-3 text-emerald-400">Mature</td><td class="p-3 text-slate-300">Higher energy, lower max C-rate</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">Semi-solid state (Si-C anode)</td><td class="p-3 text-sky-400">350 – 400 Wh/kg cell<br><span class="text-xs text-slate-400">280 – 320 Wh/kg pack</span></td><td class="p-3 text-slate-300">200 – 400 W/kg</td><td class="p-3 text-emerald-400">Mainstream for industrial UAV</td><td class="p-3 text-slate-300">800–1,000 cycles; −20 to +60 °C; the default 2026 upgrade path</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Li-Silicon SiCore (Amprius)</td><td class="p-3 text-amber-400">450 Wh/kg typ.<br><span class="text-xs text-slate-400">500 Wh/kg validated</span></td><td class="p-3 text-slate-300">300 – 800 W/kg</td><td class="p-3 text-amber-400">In production</td><td class="p-3 text-slate-300">1,150–1,300 Wh/L. Shipping to drone customers; Airbus AALTO, Matternet (2026). NDAA-compliant supply chain</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">All-solid-state (CATL, QuantumScape)</td><td class="p-3 text-rose-400">~500 Wh/kg (cell)</td><td class="p-3 text-slate-300">200 – 500 W/kg</td><td class="p-3 text-rose-400">Still pre-volume; ~2027</td><td class="p-3 text-slate-300">Drones remain a named first market — low volume, high value tolerates early cost</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">H₂ PEM fuel cell (system-level)</td><td class="p-3 text-emerald-400">400 – 600 Wh/kg</td><td class="p-3 text-slate-300">50 – 200 W/kg</td><td class="p-3 text-emerald-400">Commercial now</td><td class="p-3 text-slate-300">Endurance; 7+ hr flight demonstrated</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">Supercapacitor (EDLC)</td><td class="p-3 text-slate-500">1 – 10 Wh/kg</td><td class="p-3 text-emerald-400">5,000 – 50,000 W/kg</td><td class="p-3 text-emerald-400">Mature</td><td class="p-3 text-slate-300">Transient burst buffer only, not primary</td></tr>
            </tbody>
        </table>
    </div>

    <div class="insight-box mb-6">
        <div class="insight-label">Pack-Level Reality Check</div>
        <p class="text-slate-200 text-sm mt-1">Marketing specifications cite cell-level energy density. System engineers budget pack-level energy density — always 20–40% lower due to BMS electronics, structural casing, thermal management, and wiring. A 450 Wh/kg cell in a commercial drone pack delivers ~280–320 Wh/kg at the pack level. Verify with the manufacturer's pack-level datasheet, not the cell spec sheet.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.9  POWER ARCHITECTURE & GAN ELECTRONICS
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.9 Power Architecture &amp; GaN Electronics</h3>
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
    <p class="text-sm text-slate-300 mb-6">Representative GaN devices: EPC eGaN FETs, Infineon GS61004B, TI LMG3522R030-Q1 (automotive/drone rated). Best practice for 2025 AI drones: motors on the direct battery bus; AI compute on a dedicated isolated GaN converter with bulk capacitor bank; flight controller on a separate linear regulator for low-noise 5 V.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr><th class="p-3">Architecture</th><th class="p-3">Advantages</th><th class="p-3">Disadvantages</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800 align-top"><td class="p-3 text-white font-mono">Centralized PDU</td><td class="p-3 text-slate-300">Simple; low component count; easy BMS integration</td><td class="p-3 text-slate-300">Single point of failure; ESC noise couples into AI rails</td></tr>
                <tr class="bg-slate-800/50 align-top"><td class="p-3 text-white font-mono">Distributed PoL</td><td class="p-3 text-slate-300">Noise isolation per load; per-load monitoring; partial failure survival</td><td class="p-3 text-slate-300">More components; higher design complexity; slight weight increase</td></tr>
            </tbody>
        </table>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         2.10  MISSION ENDURANCE OPTIMIZATION
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.10 Mission Endurance Optimization &amp; Weight Budget</h3>
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
    <p class="text-sm text-slate-300 mb-2">From Bauersfeld &amp; Scaramuzza (ETH Zurich, 2022):</p>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-sky-300 mb-4">
        v_optimal = v_h × 3<sup>1/4</sup> ≈ 1.32 × v_h<br>
        <span class="text-slate-400 text-xs">v_h = sqrt(DL / 2ρ), where DL = T/A is disk loading — not sqrt(T / 2ρ). Forgetting the area term is the most common slip here.</span>
    </div>
    <div class="bg-slate-900 border border-slate-700 rounded p-4 font-mono text-xs text-slate-300 mb-4 space-y-1">
        <div>DL = T / A = 19.62 N / 0.2919 m² = <span class="text-sky-300">67.2 N/m²</span></div>
        <div>v_h = sqrt(67.2 / (2 · 1.225)) = sqrt(27.4) = <span class="text-sky-300">5.24 m/s</span></div>
        <div>v_opt = 1.316 · 5.24 = <span class="text-emerald-400">6.9 m/s (24.8 km/h)</span></div>
    </div>
    <p class="text-sm text-slate-300 mb-4">At range-optimal speed, aero power is approximately 85% of hover power (the translational-lift benefit). Total draw becomes 0.85 · 147 + 8 + 15.5 ≈ 148 W, giving 125.8 Wh / 148 W ≈ 51 min aloft. Estimated max still-air range: <strong>6.9 m/s × 3,050 s ≈ 21 km on a single 4S 10 Ah pack</strong>. Subtract reserve and headwind before you plan a real sortie against that number — a 4 m/s headwind on the outbound leg cuts usable radius by roughly a third.</p>

    <h4 class="text-sky-300">Typical 2 kg AI Drone Weight Budget</h4>
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr><th class="p-3">Subsystem</th><th class="p-3">Mass (g)</th><th class="p-3">% MTOW</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-white">Frame (CFRP woven)</td><td class="p-3 text-slate-300">180</td><td class="p-3 text-slate-300">9.0%</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-amber-400 font-semibold">Battery (4S 10 Ah LiPo)</td><td class="p-3 text-amber-400 font-semibold">580</td><td class="p-3 text-amber-400 font-semibold">29.0% ← largest single item</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">4× Motors + ESCs</td><td class="p-3 text-slate-300">260</td><td class="p-3 text-slate-300">13.0%</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">4× Propellers (12")</td><td class="p-3 text-slate-300">80</td><td class="p-3 text-slate-300">4.0%</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">AI compute (Orin Nano module)</td><td class="p-3 text-slate-300">45</td><td class="p-3 text-slate-300">2.25%</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">AI accelerator (Hailo-8 M.2)</td><td class="p-3 text-slate-300">12</td><td class="p-3 text-slate-300">0.6%</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">Carrier board + GaN PDU</td><td class="p-3 text-slate-300">80</td><td class="p-3 text-slate-300">4.0%</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Camera payload (gimbal)</td><td class="p-3 text-slate-300">180</td><td class="p-3 text-slate-300">9.0%</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">GPS + FC + telemetry</td><td class="p-3 text-slate-300">105</td><td class="p-3 text-slate-300">5.25%</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Wiring harness</td><td class="p-3 text-slate-300">60</td><td class="p-3 text-slate-300">3.0%</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">Thermal management (heatsinks / PCM)</td><td class="p-3 text-slate-300">40</td><td class="p-3 text-slate-300">2.0%</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Misc + fasteners + vibration mounts</td><td class="p-3 text-slate-300">50</td><td class="p-3 text-slate-300">2.5%</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-emerald-400 font-bold">Margin / additional payload</td><td class="p-3 text-emerald-400 font-bold">~328</td><td class="p-3 text-emerald-400 font-bold">~16.4%</td></tr>
            </tbody>
        </table>
    </div>

    <div class="insight-box mb-6">
        <div class="insight-label">The Battery Rules Everything</div>
        <p class="text-slate-200 text-sm mt-1">At 29% of MTOW, the battery is the largest single mass item — more than all four motors, ESCs, and props combined. Moving from a 200 Wh/kg LiPo pack to a 450 Wh/kg silicon-anode pack of identical mass more than doubles stored energy without changing a single line of AI code or a single motor turn. Two caveats keep this honest: compare <em>pack</em>-level figures on both sides (a 450 Wh/kg cell typically lands near 300–320 Wh/kg once BMS, casing, and wiring are counted), and check the C-rate — high-energy silicon cells deliver less peak current per gram than a race-spec LiPo, so an aggressive airframe may become sag-limited before it becomes energy-limited. The chemistry that wins an endurance mission is not automatically the chemistry that survives a hard evasive maneuver.</p>
    </div>

    <h4 class="text-sky-300">Dynamic Power Management — Mission Phase Strategy</h4>
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr><th class="p-3">Phase</th><th class="p-3">Duration</th><th class="p-3">AI State</th><th class="p-3">Power vs Hover</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 text-white">Takeoff / climb</td><td class="p-3 text-slate-300">~1 min</td><td class="p-3 text-slate-400">Standby</td><td class="p-3 text-rose-400">+20% (high throttle)</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Transit to target</td><td class="p-3 text-slate-300">5 – 20 min</td><td class="p-3 text-sky-400">7 W efficiency mode</td><td class="p-3 text-emerald-400">−10–15% (translational lift)</td></tr>
                <tr class="bg-slate-800"><td class="p-3 text-white">ISR hover / loiter</td><td class="p-3 text-slate-300">Variable</td><td class="p-3 text-amber-400">15 W performance mode</td><td class="p-3 text-amber-400">Baseline + AI power</td></tr>
                <tr class="bg-slate-800/50"><td class="p-3 text-white">Emergency (SoC &lt;20%)</td><td class="p-3 text-slate-300">Until land</td><td class="p-3 text-rose-400">AI disabled, FC only</td><td class="p-3 text-emerald-400">−30 W savings</td></tr>
            </tbody>
        </table>
    </div>
    <p class="text-sm text-slate-300 mb-4">Model-tier switching is the software counterpart to <code>nvpmodel</code>: dynamically dropping to a lighter detector (a nano-scale INT8 model in place of a medium FP16 one) once SoC crosses a threshold cuts inference power by roughly 40% for 3–5% mAP degradation, recovering 4–8 minutes of flight per mission. Keep both engines resident in memory and swap the pointer — rebuilding a TensorRT engine in flight takes seconds you do not have.</p>

    <!-- ═══════════════════════════════════════════════════════════════
         2.11  EXTERNAL REFERENCES
    ════════════════════════════════════════════════════════════════ -->
    <h3>2.11 Further Reading &amp; References</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
            <h4 class="text-sky-400 font-bold mb-3">Aerodynamics &amp; Propulsion</h4>
            <ul class="space-y-2 text-xs">
                <li><a href="https://arxiv.org/pdf/2501.03102" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Enhancing Multirotor Efficiency: Minimum Energy Consumption (arXiv 2025)</a></li>
                <li><a href="https://www.ll.mit.edu/partner-us/available-technologies/toroidal-propeller-0" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">MIT Lincoln Laboratory: Toroidal Propeller</a></li>
                <li><a href="https://shop.tmotor.com/blog/drone-motor-propeller-matching-guide" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">T-Motor: Motor &amp; Propeller Matching Guide</a></li>
                <li><a href="https://en.wikipedia.org/wiki/Disk_loading" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Wikipedia: Disk Loading (NASA source data)</a></li>
            </ul>
        </div>
        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
            <h4 class="text-sky-400 font-bold mb-3">Thermal &amp; Power</h4>
            <ul class="space-y-2 text-xs">
                <li><a href="https://developer.nvidia.com/downloads/jetson-orin-nx-orin-nano-series-thermal-design-guide" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">NVIDIA: Jetson Orin NX Thermal Design Guide (May 2025)</a></li>
                <li><a href="https://www.micron.com/about/blog/applications/industrial/edge-ai-in-the-sky-memory-and-storage-demands-of-intelligent-drones" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Micron: Edge AI Memory Demands for Drones</a></li>
                <li><a href="https://en.wikipedia.org/wiki/Blade_element_momentum_theory" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Wikipedia: Blade Element Momentum Theory</a></li>
                <li><a href="https://arxiv.org/pdf/2106.08015" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">NeuroBEM: Hybrid Aerodynamic Quadrotor Model (arXiv)</a></li>
            </ul>
        </div>
    </div>
</div>
`;
