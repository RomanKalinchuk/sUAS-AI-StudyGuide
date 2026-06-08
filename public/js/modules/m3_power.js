export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 3</span>
    <h2>Power Systems for AI-Enabled Drones</h2>
    <p>Power architecture is the unglamorous foundation that everything else depends on. Battery chemistry determines mission endurance. A poorly designed power tree causes brownouts that corrupt flight controller state, reboot the companion computer mid-flight, or silently introduce noise into IMU readings. This module covers every layer: battery selection and chemistry, flight time math, power distribution, ESC firmware, current sensing, and alternative energy sources from fuel cells to solar.</p>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-8">
        <h3 class="text-sky-400 font-bold text-lg mb-3">Module Objectives</h3>
        <ul class="text-slate-300 text-sm space-y-1 list-disc list-inside">
            <li>Select the right battery chemistry for a given mission profile (endurance vs burst power vs cycle life)</li>
            <li>Calculate flight time, hover power, and build a power budget from scratch</li>
            <li>Understand ESC firmware trade-offs (BLHeli_32 vs AM32 vs KISS) and digital protocols</li>
            <li>Design a safe power distribution board with correct trace sizing, connectors, and bus capacitors</li>
            <li>Evaluate emerging alternatives: hydrogen fuel cells, hybrid systems, solar UAVs</li>
        </ul>
    </div>

    <!-- ============================================================ -->
    <h3>3.1 Battery Chemistry: The Foundation of Endurance</h3>
    <p>Every UAV mission begins with a fixed energy reservoir. Understanding the electrochemistry of each battery type is not academic — it directly determines whether your ISR drone loiters for 18 minutes or 45 minutes, whether the battery survives 50 cycles or 300, and whether a crash results in a fire.</p>

    <figure class="my-6">
        <img src="images/m3_liion_cell_schema.svg" alt="NMC Lithium-Ion Cell Schematic showing anode, cathode, and electrolyte layers" class="rounded-lg w-full bg-white p-4">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Structural cross-section of an NMC (Nickel Manganese Cobalt) lithium-ion cell during discharge — the dominant cathode chemistry in high-performance UAV batteries. Source: <a href="https://commons.wikimedia.org/wiki/File:Li-Ion-Zelle_(NMC-Carbon,_Schema).svg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons (CC BY-SA 2.0 DE)</a></figcaption>
    </figure>

    <h4 class="text-white font-semibold text-lg mb-3 mt-6">Cell Voltage Reference</h4>
    <div class="overflow-x-auto my-4">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Chemistry</th>
                    <th class="p-3">Nominal V/cell</th>
                    <th class="p-3">Full charge</th>
                    <th class="p-3">Min (cutoff)</th>
                    <th class="p-3">Storage</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">LiPo</td>
                    <td class="p-3 text-slate-300">3.7 V</td>
                    <td class="p-3 text-emerald-400">4.20 V</td>
                    <td class="p-3 text-rose-400">3.50 V</td>
                    <td class="p-3 text-slate-300">3.80 V</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">LiHV</td>
                    <td class="p-3 text-slate-300">3.8 V</td>
                    <td class="p-3 text-emerald-400">4.35 V</td>
                    <td class="p-3 text-rose-400">3.50 V</td>
                    <td class="p-3 text-slate-300">3.85 V</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Li-Ion (18650/21700)</td>
                    <td class="p-3 text-slate-300">3.6 V</td>
                    <td class="p-3 text-emerald-400">4.20 V</td>
                    <td class="p-3 text-rose-400">3.00 V</td>
                    <td class="p-3 text-slate-300">3.60 V</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-semibold">Semi-Solid State Li-Ion</td>
                    <td class="p-3 text-slate-300">3.7 V</td>
                    <td class="p-3 text-emerald-400">4.20 V</td>
                    <td class="p-3 text-rose-400">3.00 V</td>
                    <td class="p-3 text-slate-300">3.70 V</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h4 class="text-white font-semibold text-lg mb-3 mt-6">Comprehensive Battery Comparison</h4>
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Property</th>
                    <th class="p-3">LiPo</th>
                    <th class="p-3">LiHV</th>
                    <th class="p-3">Li-Ion (18650/21700)</th>
                    <th class="p-3">Semi-Solid State</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700 text-xs font-mono">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-400">Energy density (pack)</td>
                    <td class="p-3 text-slate-300">150–200 Wh/kg</td>
                    <td class="p-3 text-emerald-400">160–210 Wh/kg</td>
                    <td class="p-3 text-emerald-300">180–270 Wh/kg</td>
                    <td class="p-3 text-sky-400">240–300 Wh/kg</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-400">Max cont. C-rate</td>
                    <td class="p-3 text-emerald-400">25C–100C</td>
                    <td class="p-3 text-emerald-400">25C–75C</td>
                    <td class="p-3 text-amber-400">3C–10C</td>
                    <td class="p-3 text-amber-400">5C–20C</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-400">Cycle life (80% cap)</td>
                    <td class="p-3 text-slate-300">150–300</td>
                    <td class="p-3 text-amber-400">100–200</td>
                    <td class="p-3 text-emerald-400">400–800</td>
                    <td class="p-3 text-emerald-400">500–1000+</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-400">Weight</td>
                    <td class="p-3 text-emerald-400">Lightest (soft pouch)</td>
                    <td class="p-3 text-emerald-400">Similar to LiPo</td>
                    <td class="p-3 text-amber-400">Heavier (steel can)</td>
                    <td class="p-3 text-amber-400">Moderate (pouch)</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-400">Charge voltage limit</td>
                    <td class="p-3 text-slate-300">4.20 V/cell</td>
                    <td class="p-3 text-amber-400">4.35 V/cell (LiHV charger only)</td>
                    <td class="p-3 text-slate-300">4.20 V/cell</td>
                    <td class="p-3 text-slate-300">4.20 V/cell</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-400">Thermal runaway risk</td>
                    <td class="p-3 text-amber-400">Medium (flammable)</td>
                    <td class="p-3 text-amber-400">Medium-High</td>
                    <td class="p-3 text-amber-400">Medium</td>
                    <td class="p-3 text-emerald-400">Lower (ceramic electrolyte)</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-400">Best application</td>
                    <td class="p-3 text-slate-300">Racing, combat, ISR quads</td>
                    <td class="p-3 text-slate-300">Freestyle, short-endurance ISR</td>
                    <td class="p-3 text-slate-300">Fixed-wing, long-range cruise</td>
                    <td class="p-3 text-slate-300">Emerging ISR &amp; logistics</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-400">Real example</td>
                    <td class="p-3 text-slate-300">Tattu 22000mAh 6S 25C (2,650g)</td>
                    <td class="p-3 text-slate-300">Tattu HV 22000mAh 6S 25C (22.8V nom)</td>
                    <td class="p-3 text-slate-300">iNsight 6S 10000mAh 10C (700g)</td>
                    <td class="p-3 text-slate-300">iNsight Semi-Solid 251.7 Wh/kg</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500 mb-4">
        <strong class="text-amber-400 block mb-1">LiHV Charger Discipline</strong>
        <p class="text-slate-400 text-sm">LiHV (High Voltage) cells charge to 4.35 V/cell — using a standard LiPo charger set to 4.20 V undercharges the pack by ~4% capacity. Conversely, using a LiHV charger on standard LiPo cells will overcharge and trigger thermal runaway. Always label packs and charger presets clearly. LiHV cycle life degrades faster under high stress: expect ~5.4% capacity loss per 100 cycles vs ~3.8% for standard LiPo.</p>
    </div>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500 mb-6">
        <strong class="text-sky-400 block mb-1">2025 Development: Semi-Solid-State UAV Batteries</strong>
        <p class="text-slate-400 text-sm">Semi-solid-state Li-ion cells (ceramic electrolyte layer replacing liquid) are now commercially available for UAV use. A 6S 22000mAh semi-solid pack achieves ~251.7 Wh/kg at 1,963g — roughly 30% better than premium LiPo at similar weight — while offering improved thermal safety and 500–1000+ cycle life. Not yet at parity with LiPo on peak discharge current, but suitable for cruise-dominated missions. <a href="https://insightfpv.com/products/solid-state-li-ion-battery" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">iNsightFPV semi-solid-state line</a>.</p>
    </div>

    <!-- ============================================================ -->
    <h3>3.2 C-Rating and Internal Resistance</h3>
    <p>The C-rating is the maximum continuous discharge current expressed as a multiple of the battery's capacity in Ah. A 10,000 mAh (10 Ah) battery rated at 25C can deliver a sustained 250A. But manufacturer C-ratings are marketing, not engineering specs — internal resistance (IR) is the honest number.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6">
            <h3 class="text-sky-400 font-bold text-lg mb-3">C-Rating Math</h3>
            <div class="font-mono text-sm text-slate-300 space-y-2">
                <p><span class="text-white">I_max = C × Capacity(Ah)</span></p>
                <p>Example — Tattu 22000mAh 25C:<br>
                I_max = 25 × 22 = <span class="text-emerald-400 font-bold">550 A continuous</span></p>
                <p class="text-slate-400 text-xs mt-2">Peak (burst) rating is typically 2× continuous: 50C = 1,100A for &lt;10s. Never sustained — IR heating limits this hard.</p>
            </div>
        </div>
        <div class="bg-slate-800/60 border border-amber-700/60 rounded-xl p-6">
            <h3 class="text-amber-400 font-bold text-lg mb-3">Internal Resistance (IR)</h3>
            <div class="font-mono text-sm text-slate-300 space-y-2">
                <p>Healthy new LiPo cell: <span class="text-emerald-400">1–5 mΩ/cell</span></p>
                <p>Degraded cell warning: <span class="text-amber-400">&gt;10 mΩ/cell</span></p>
                <p>Retire at: <span class="text-rose-400">&gt;20 mΩ/cell</span></p>
                <p class="text-slate-400 text-xs mt-2">Higher IR → more voltage sag under load → less usable capacity → more heat. Measure with a dedicated LiPo tester (iCharger, ISDT, Junsi) — not your charger's IR readout.</p>
            </div>
        </div>
    </div>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-rose-500 mb-6">
        <strong class="text-rose-400 block mb-1">Voltage Sag Under Load</strong>
        <p class="text-slate-400 text-sm">At peak motor current (e.g., 80A on a 6S quad), a pack with 5mΩ total IR sags: V_sag = I × R = 80 × 0.005 = 0.4V. That is acceptable. A degraded pack at 25mΩ sags 2V — enough to reset 5V BECs and reboot flight controllers mid-hover. Measure IR before every mission for critical operations; retire any cell above 15–20 mΩ.</p>
    </div>

    <!-- ============================================================ -->
    <h3>3.3 Power Budget and Flight Time Calculation</h3>
    <p>Before selecting a battery, build a power budget. This is the single most important tool for mission planning. The method below works for any multirotor from a 250g micro to a 25kg industrial hex.</p>

    <figure class="my-6">
        <img src="images/m3_li_battery_discharge.svg" alt="Li-ion battery discharge process diagram showing ion movement between anode and cathode" class="rounded-lg w-full bg-white p-4">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Schematic of a discharging Li-ion battery — lithium ions migrate from anode (graphite) to cathode (LiCoO₂) through the electrolyte while electrons flow through the external circuit powering the motors. Source: <a href="https://commons.wikimedia.org/wiki/File:General_discharging_Li_battery_diagram.svg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons (CC BY-SA 4.0)</a></figcaption>
    </figure>

    <h4 class="text-white font-semibold text-lg mb-3 mt-6">Step 1 — Hover Power Estimate</h4>
    <div class="bg-slate-900 p-6 rounded border border-slate-700 mb-6 text-sm font-mono">
        <p class="text-slate-400 font-sans mb-3">Rule of thumb: <strong class="text-white">120–170 W/kg AUW</strong> at hover (efficiency varies with prop size and motor design).</p>
        <div class="text-slate-300 space-y-2">
            <p><span class="text-sky-400">Large props (15"+), low KV:</span> ~120 W/kg (efficient, heavy-lift)</p>
            <p><span class="text-sky-400">Mid props (10"–14"), medium KV:</span> ~150 W/kg (typical AI payload quad)</p>
            <p><span class="text-sky-400">Small props (5"–8"), high KV:</span> ~200–250 W/kg (racing/compact)</p>
            <div class="mt-4 border-t border-slate-700 pt-4">
                <p class="text-white font-bold mb-2">Example: 4.5 kg AI surveillance quad (4S/6S, 13" props)</p>
                <p>P_hover = 4.5 kg × 150 W/kg = <span class="text-emerald-400 font-bold">675 W</span></p>
                <p>I_hover = 675 W / 22.2 V (6S nom) = <span class="text-emerald-400 font-bold">30.4 A</span></p>
                <p class="text-slate-400 text-xs mt-1">Add 20% margin for gusts and attitude changes → I_avg = ~36 A</p>
            </div>
        </div>
    </div>

    <h4 class="text-white font-semibold text-lg mb-3 mt-6">Step 2 — Power Budget Table</h4>
    <div class="overflow-x-auto my-4">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Subsystem</th>
                    <th class="p-3">Typical Power</th>
                    <th class="p-3">Notes</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700 text-xs font-mono">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">4× Motors (hover)</td>
                    <td class="p-3 text-white font-bold">675 W</td>
                    <td class="p-3 text-slate-400">4.5 kg AUW × 150 W/kg</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">Jetson Orin NX (AI compute)</td>
                    <td class="p-3 text-amber-400">15–25 W</td>
                    <td class="p-3 text-slate-400">Configurable power mode — 10W to 25W</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">Flight controller (FC)</td>
                    <td class="p-3 text-slate-300">2–3 W</td>
                    <td class="p-3 text-slate-400">Pixhawk/ArduPilot at full load</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">4K Gimbal camera</td>
                    <td class="p-3 text-slate-300">8–12 W</td>
                    <td class="p-3 text-slate-400">Stabilized sensor payload</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">FPV / telemetry / RC link</td>
                    <td class="p-3 text-slate-300">3–6 W</td>
                    <td class="p-3 text-slate-400">Caddx, TBS Crossfire, RFD900</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">GPS + compass + baro</td>
                    <td class="p-3 text-slate-300">0.5–1 W</td>
                    <td class="p-3 text-slate-400">Here4, M9N, etc.</td>
                </tr>
                <tr class="bg-slate-800 font-bold">
                    <td class="p-3 text-white">TOTAL</td>
                    <td class="p-3 text-emerald-400">~720 W</td>
                    <td class="p-3 text-slate-400">Average hover + all avionics</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h4 class="text-white font-semibold text-lg mb-3 mt-6">Step 3 — Flight Time Formula</h4>
    <div class="bg-slate-900 p-6 rounded border border-slate-700 mb-6 font-mono text-sm">
        <div class="text-slate-300 space-y-3">
            <p class="text-sky-400 font-bold font-sans">Basic formula (80% usable discharge to protect cells):</p>
            <p class="text-white text-base">T_flight = (C_Ah × V_avg × 0.80) / P_total × 60 &nbsp;[minutes]</p>
            <div class="border-t border-slate-700 pt-3 mt-3 text-xs space-y-2 text-slate-300">
                <p>Where: C_Ah = battery capacity in Ah, V_avg = average pack voltage during discharge, P_total = total average power draw in Watts</p>
                <div class="bg-slate-800 rounded p-3 mt-3">
                    <p class="text-white font-bold mb-2">Example A: Tattu 22000mAh 6S 25C (2,650g)</p>
                    <p>T = (22 × 22.2 × 0.80) / 720 × 60 = (390.7) / 720 × 60 = <span class="text-emerald-400 font-bold">32.6 minutes</span></p>
                    <p class="text-slate-400 mt-1">Net AUW with battery: 4.5 kg. Total system mass +2.65 kg → 7.15 kg total.</p>
                    <p class="text-amber-400">Note: Adding 2.65 kg battery increases motor power required. Iterate the AUW calculation.</p>
                </div>
                <div class="bg-slate-800 rounded p-3 mt-2">
                    <p class="text-white font-bold mb-2">Example B: Li-Ion 6S 10000mAh 10C (700g)</p>
                    <p>T = (10 × 22.2 × 0.80) / 720 × 60 = 177.6 / 720 × 60 = <span class="text-amber-400 font-bold">14.8 minutes</span></p>
                    <p class="text-slate-400 mt-1">Lighter battery reduces AUW → lower hover power. True endurance will be somewhat better after iteration.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500 mb-6">
        <strong class="text-sky-400 block mb-1">Always Iterate AUW</strong>
        <p class="text-slate-400 text-sm">The battery IS part of the AUW, which determines hover power, which determines discharge rate, which determines flight time. A heavier battery stores more energy but costs more power to lift. The optimal battery mass for maximum endurance is typically 25–40% of total AUW for multirotor platforms — use online optimization tools like <a href="https://www.omnicalculator.com/other/drone-flight-time" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">OmniCalculator Drone Flight Time</a> for quick iteration.</p>
    </div>

    <h4 class="text-white font-semibold text-lg mb-3 mt-6">Step 4 — Battery Failsafe Configuration (ArduPilot)</h4>
    <div class="bg-slate-900 p-4 rounded border border-slate-700 mb-6 text-xs font-mono">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <div>
                <p class="text-sky-400 font-sans font-semibold mb-2">Voltage-based failsafe</p>
                <p>BATT_LOW_VOLT = 21.0 V (6S, ~3.50 V/cell) → RTL</p>
                <p>BATT_CRT_VOLT = 19.8 V (6S, ~3.30 V/cell) → Land</p>
                <p class="text-slate-400 mt-1 font-sans text-xs">Never let a LiPo fall below 3.0 V/cell in flight — permanent capacity loss occurs.</p>
            </div>
            <div>
                <p class="text-sky-400 font-sans font-semibold mb-2">Capacity-based failsafe (preferred)</p>
                <p>BATT_LOW_MAH = 20% of capacity</p>
                <p>BATT_CRT_MAH = 10% of capacity</p>
                <p class="text-slate-400 mt-1 font-sans text-xs">Requires calibrated current sensor (INA226). More reliable than voltage under load conditions where sag masks true state-of-charge.</p>
            </div>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>3.4 Power Distribution Architecture</h3>
    <p>The Power Distribution Board (PDB) is the high-current switching matrix. On a 6S (22.2V nominal) quad carrying a 25W AI payload, peak current can exceed 200A during aggressive pitch maneuvers. This is not a place for off-the-shelf PCBs with 2oz copper pours.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm font-mono">
            <strong class="text-sky-400 text-base block mb-3 font-sans">PDB Trace Sizing (IPC-2221A)</strong>
            <ul class="space-y-1 text-slate-300">
                <li>&gt; Copper weight: 4oz (140 µm) for &gt;100A rails</li>
                <li>&gt; Trace width at 4oz for 200A: ~25mm</li>
                <li>&gt; Temperature rise target: &lt;10°C above ambient</li>
                <li>&gt; Practical solution: solid copper bus bars (3mm thick)</li>
                <li>&gt; ESC pad islands soldered to 4oz internal planes</li>
                <li>&gt; Star-ground topology: all ESC GNDs to one star node</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm font-mono">
            <strong class="text-sky-400 text-base block mb-3 font-sans">Connectors &amp; Bus Capacitors</strong>
            <ul class="space-y-1 text-slate-300">
                <li>&gt; Battery: XT90 (90A cont., 120A burst) or AS150 for &gt;22S</li>
                <li>&gt; ESC feeds: XT60 (60A cont.) or MR60 for 6S systems</li>
                <li>&gt; XT30: only for BEC outputs (&lt;30A)</li>
                <li>&gt; Bus caps: 4× 470µF 35V electrolytic at main bus</li>
                <li>&gt; Bulk: 2× 1000µF 35V Panasonic FR / Rubycon ZLH</li>
                <li>&gt; Total: 2000–4700µF on main +V rail</li>
                <li>&gt; Placement: within 5cm of ESC power inputs</li>
            </ul>
        </div>
    </div>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-6">
        <h3 class="text-sky-400 font-bold text-lg mb-3">Why 2000–4700µF?</h3>
        <p class="text-slate-300 text-sm">When all 4 motors snap from 50% to 100% throttle in a crash-avoidance maneuver, current spikes ~80A in 500µs. Without bus capacitors, this causes voltage droop that knocks downstream BECs out of regulation. The battery's own source impedance handles low-frequency bulk — PDB capacitors only need to cover the <strong>1–50kHz transient range: 470µF × 4 = 1,880µF practical minimum</strong>. Rated at 35V for a 6S system (max 25.2V at full charge + 20% derating headroom).</p>
    </div>

    <!-- ============================================================ -->
    <h3>3.5 BEC (Battery Elimination Circuit) Design</h3>
    <p>A BEC converts the high-voltage LiPo bus down to regulated 5V and 12V rails for flight controllers, GPS, telemetry, RC receivers, and AI payloads. On a 6S system (up to 25.2V in), a linear regulator is strictly forbidden for any load above a few milliamps — dropping 25.2V → 5V at 1A dissipates (25.2 − 5) × 1 = 20.2W as heat, which is physically impossible to manage on a UAV airframe.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">IC</th>
                    <th class="p-3">Vin Max</th>
                    <th class="p-3">Iout</th>
                    <th class="p-3">Freq</th>
                    <th class="p-3">Efficiency</th>
                    <th class="p-3">Use case</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700 text-xs font-mono">
                <tr class="bg-slate-800">
                    <td class="p-3 text-white font-bold">LM2596</td>
                    <td class="p-3 text-slate-300">40V</td>
                    <td class="p-3 text-slate-300">3A</td>
                    <td class="p-3 text-slate-300">150 kHz</td>
                    <td class="p-3 text-amber-400">73–80%</td>
                    <td class="p-3 text-slate-400">RC rx 5V, camera 12V</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-white font-bold">MP2359</td>
                    <td class="p-3 text-slate-300">24V</td>
                    <td class="p-3 text-slate-300">1.2A</td>
                    <td class="p-3 text-slate-300">1.4 MHz</td>
                    <td class="p-3 text-emerald-400">90–94%</td>
                    <td class="p-3 text-slate-400">Telemetry 5V, GPS 3.3V</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-emerald-300 font-bold">TPS54560 ★</td>
                    <td class="p-3 text-slate-300">60V</td>
                    <td class="p-3 text-slate-300">5A</td>
                    <td class="p-3 text-slate-300">570 kHz</td>
                    <td class="p-3 text-emerald-400">92–95%</td>
                    <td class="p-3 text-slate-400">FC + peripherals 5V/5A</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-white font-bold">LTC3780</td>
                    <td class="p-3 text-slate-300">36V</td>
                    <td class="p-3 text-slate-300">20A (ext FETs)</td>
                    <td class="p-3 text-slate-300">200–400 kHz</td>
                    <td class="p-3 text-emerald-400">94–97%</td>
                    <td class="p-3 text-slate-400">12V Jetson from 3S–4S battery</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500 mb-6">
        <strong class="text-amber-400 block mb-1">6S System BEC Rule</strong>
        <p class="text-slate-400 text-sm">On a 6S LiPo (22.2V nominal, 25.2V fully charged), always use a synchronous buck converter with integrated MOSFETs (TPS54560 class or better). Verify absolute maximum Vin rating — most quality ICs are 60V, but budget ICs rated 28V will be destroyed by a freshly charged 6S pack plus any transient spike.</p>
    </div>

    <!-- ============================================================ -->
    <h3>3.6 Companion Computer Power Delivery (Jetson Orin NX)</h3>
    <p>The Jetson Orin NX at 25W peak requires a dedicated, high-quality power rail — it must never share a BEC with ESCs, servos, or motors. Motor PWM switching creates enormous current transients that couple as voltage spikes onto shared rails. Even a 50mV glitch can cause LPDDR5 memory errors or trigger the Jetson's UVLO (undervoltage lockout), causing an instantaneous power-off.</p>

    <div class="bg-slate-900 p-4 rounded border border-slate-700 mb-6 text-xs font-mono">
        <strong class="text-sky-400 block mb-3 text-sm font-sans">Jetson Orin NX Power Rail Summary</strong>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div class="bg-slate-800 p-3 rounded">
                <div class="text-slate-400 text-[10px] uppercase mb-1">Input Voltage</div>
                <div class="text-white font-bold">5V – 20V</div>
                <div class="text-slate-500 text-[10px]">typically 12V</div>
            </div>
            <div class="bg-slate-800 p-3 rounded">
                <div class="text-slate-400 text-[10px] uppercase mb-1">Continuous</div>
                <div class="text-amber-400 font-bold">2.4A</div>
                <div class="text-slate-500 text-[10px]">25W ÷ 12V + 15% margin</div>
            </div>
            <div class="bg-slate-800 p-3 rounded">
                <div class="text-slate-400 text-[10px] uppercase mb-1">GPU Burst</div>
                <div class="text-rose-400 font-bold">3.5A</div>
                <div class="text-slate-500 text-[10px]">for &lt;50ms</div>
            </div>
            <div class="bg-emerald-900/30 border border-emerald-700/50 p-3 rounded">
                <div class="text-emerald-400 text-[10px] uppercase mb-1">Recommended</div>
                <div class="text-white font-bold">TPS54560</div>
                <div class="text-slate-400 text-[10px]">12V/5A sync buck</div>
            </div>
        </div>
        <p class="text-slate-400 mt-3 text-xs font-sans">Use a synchronous buck (not diode-rectified): 94–96% vs ~82% efficiency. At 5A, that 12% difference equals 0.72W of extra heat inside the airframe.</p>
    </div>

    <!-- ============================================================ -->
    <h3>3.7 ESC Architecture and Firmware Selection</h3>
    <p>Electronic Speed Controllers (ESCs) convert the high-voltage bus into variable 3-phase AC for brushless motors. The firmware defines protocol support, telemetry capabilities, and tuning behavior. As of 2024–2025, the landscape has consolidated: BLHeli_32 development officially stopped in 2023; AM32 is now the actively developed open-source standard.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm">
            <strong class="text-sky-400 text-base block mb-3">BLHeli_32 vs AM32 vs KISS</strong>
            <div class="overflow-x-auto">
                <table class="w-full text-xs font-mono">
                    <thead><tr class="text-slate-400"><th class="text-left pb-2 pr-2">Feature</th><th class="text-left pb-2 pr-2">BLHeli_32</th><th class="text-left pb-2 pr-2">AM32</th><th class="text-left pb-2">KISS</th></tr></thead>
                    <tbody class="text-slate-300">
                        <tr><td class="py-1 pr-2">License</td><td class="pr-2">Closed</td><td class="pr-2 text-emerald-400">Open (MIT)</td><td>Proprietary</td></tr>
                        <tr><td class="py-1 pr-2">Development</td><td class="text-rose-400 pr-2">Stopped 2023</td><td class="text-emerald-400 pr-2">Active</td><td>Active</td></tr>
                        <tr><td class="py-1 pr-2">MCU</td><td class="pr-2">ARM M3 only</td><td class="pr-2">M0/M3/M4/STM32/AT32</td><td>Proprietary ARM</td></tr>
                        <tr><td class="py-1 pr-2">DSHOT</td><td class="pr-2">150/300/600/1200</td><td class="pr-2">150/300/600</td><td>150/300/600</td></tr>
                        <tr><td class="py-1 pr-2">Bidir DSHOT</td><td class="pr-2">Yes (v32.7+)</td><td class="pr-2 text-emerald-400">Yes</td><td>Yes</td></tr>
                        <tr><td class="py-1 pr-2">Telemetry</td><td class="pr-2">RPM/I/T/V</td><td class="pr-2">RPM/I/T/V</td><td>RPM/I/T/V</td></tr>
                        <tr><td class="py-1 pr-2">Configurator</td><td class="pr-2">BLHeliSuite32</td><td class="pr-2 text-emerald-400">AM32 Configurator</td><td>KISS GUI</td></tr>
                        <tr><td class="py-1 pr-2">ArduPilot support</td><td class="pr-2">Excellent</td><td class="pr-2">Good</td><td>Good</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm">
            <strong class="text-sky-400 text-base block mb-3">ESC Selection Guide by Mission</strong>
            <div class="space-y-3 text-xs text-slate-300">
                <div class="border-l-2 border-sky-500 pl-3">
                    <p class="text-white font-bold">5" FPV / Combat Scout</p>
                    <p>35–45A rated, 4-in-1 preferred (Mamba/Diatone/Aikon), AM32, 6S, DSHOT600</p>
                </div>
                <div class="border-l-2 border-emerald-500 pl-3">
                    <p class="text-white font-bold">AI Payload Quad (10"–15" props)</p>
                    <p>55–80A individual ESCs, AM32 or BLHeli_32, 6S, DSHOT600. T-Motor AM55A, Hobbywing XRotor 40A Pro recommended.</p>
                </div>
                <div class="border-l-2 border-amber-500 pl-3">
                    <p class="text-white font-bold">Heavy-Lift Hex/Octo (18"–30" props)</p>
                    <p>100–160A heavy-duty, VESC/custom FOC controllers, CAN bus telemetry. Flame Wheel F550/F450 class.</p>
                </div>
                <div class="border-l-2 border-rose-500 pl-3">
                    <p class="text-white font-bold">DoD / Military SUAS</p>
                    <p>NDAA-compliant supply chain mandatory. Verify ESC manufacturer is not on UFLPA entity list. Castle Creations, Hobbywing (verify), T-Motor.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">DSHOT Protocol Comparison</div>
        <table class="w-full text-xs font-mono">
            <thead>
                <tr class="bg-slate-800/50 text-slate-400">
                    <th class="p-3 text-left">Protocol</th>
                    <th class="p-3 text-left">Bit Rate</th>
                    <th class="p-3 text-left">Frame Time</th>
                    <th class="p-3 text-left">% of 8kHz Loop</th>
                    <th class="p-3 text-left">Notes</th>
                </tr>
            </thead>
            <tbody class="text-slate-300">
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-white">DSHOT150</td>
                    <td class="p-3">150 kbit/s</td>
                    <td class="p-3">106 µs</td>
                    <td class="p-3 text-amber-400">84.8%</td>
                    <td class="p-3 text-slate-400">Too slow for 8kHz loops — legacy only</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-white">DSHOT300</td>
                    <td class="p-3">300 kbit/s</td>
                    <td class="p-3">53 µs</td>
                    <td class="p-3 text-amber-400">42.4%</td>
                    <td class="p-3 text-slate-400">Safe for 4kHz, marginal at 8kHz</td>
                </tr>
                <tr class="border-t border-slate-800">
                    <td class="p-3 text-emerald-300 font-bold">DSHOT600 ★</td>
                    <td class="p-3">600 kbit/s</td>
                    <td class="p-3">26.7 µs</td>
                    <td class="p-3 text-emerald-400">21.4%</td>
                    <td class="p-3 text-emerald-400">Standard for high-performance builds</td>
                </tr>
                <tr class="border-t border-slate-800 bg-slate-900/50">
                    <td class="p-3 text-white">DSHOT1200</td>
                    <td class="p-3">1200 kbit/s</td>
                    <td class="p-3">13.3 µs</td>
                    <td class="p-3 text-emerald-400">10.6%</td>
                    <td class="p-3 text-amber-400">Requires shielded wire &lt;30cm; sensitive to noise</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-6">
        <h3 class="text-sky-400 font-bold text-lg mb-3">Bidirectional DSHOT: RPM Filtering</h3>
        <p class="text-slate-300 text-sm">After each throttle command frame, the ESC responds on the same wire (half-duplex) with an eRPM telemetry packet. The flight controller uses this real-time RPM data to dynamically set notch filter frequencies in the gyro processing pipeline — eliminating propeller-harmonic noise without manual filter tuning. Critical for clean attitude hold with a stabilized ISR sensor payload. Enable in ArduPilot: <span class="font-mono text-sky-400">MOT_THST_HOVER</span> + RPM-notch filter params.</p>
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">ESC Selection and Drone Power Systems — Beginner to Advanced</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/4e-HFCC1rZA" title="Intro to ESCs — Electronic Speed Controllers — Drone Doc" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>3.8 Current Sensing: INA219, INA226, INA3221</h3>
    <p>Accurate current sensing enables ArduPilot's battery failsafe and gives the operator real-time mAh consumed. All three Texas Instruments devices use an external shunt resistor and an I2C interface.</p>

    <div class="space-y-4 mb-8">
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm font-mono">
            <strong class="text-purple-400 block mb-2">INA219 — 12-bit, 26V max bus</strong>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 text-xs">
                <div>Bus voltage: 0–26V<br>Shunt voltage: ±320mV max<br>Resolution: 12-bit ADC</div>
                <div>Max current (100mΩ shunt): ±3.2A<br>Max current (10mΩ shunt): ±32A<br>I2C addresses: 0x40–0x4F</div>
                <div class="text-rose-400">Limitation: ADC saturates at 26V. Cannot be used directly on 6S (25.2V+ bus) — voltage divider required or use only on the 5V side.</div>
            </div>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm font-mono">
            <strong class="text-emerald-400 block mb-2">INA226 — 16-bit, 36V max bus ← Recommended for 6S</strong>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 text-xs">
                <div>Bus voltage: 0–36V (safe for 6S)<br>Shunt voltage: ±81.92mV max<br>Resolution: 16-bit ADC</div>
                <div>Shunt for 80A range: 1mΩ (Vishay WSL2010)<br>Shunt for 16A range: 5mΩ<br>I2C: 0x40–0x4F (4 address pins)</div>
                <div>Alert pin: programmable over-current<br>Power register: computed in hardware<br>Integration time: 140µs – 8.244ms</div>
            </div>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm font-mono">
            <strong class="text-amber-400 block mb-2">INA3221 — Triple-channel, 26V max, multi-rail monitoring</strong>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 text-xs">
                <div>3 independent channels<br>Each: bus V + shunt V<br>Bus range: 0–26V</div>
                <div>Use case: Monitor 5V FC rail + 12V Jetson rail + main battery current simultaneously from one I2C device</div>
                <div>Alert outputs: per-channel + sum critical<br>I2C addresses: 0x40–0x43 (A0 pin)</div>
            </div>
        </div>
    </div>

    <div class="bg-slate-900 p-6 rounded border border-slate-700 text-sm mb-8">
        <strong class="text-sky-400 block mb-3">Shunt Resistor Sizing (INA226 example)</strong>
        <div class="font-mono text-slate-300 text-xs space-y-2">
            <p>Goal: maximize resolution without saturating the ±81.92mV shunt input.</p>
            <p>For 80A max current: R_shunt = 81.92mV / 80A = <strong>1.024mΩ</strong> → use 1mΩ (Vishay WSL2010 1mΩ 1%, 3W)</p>
            <p>Power at 80A: P = I² × R = 80² × 0.001 = <strong>6.4W</strong> → requires multi-watt resistor or 2× 2mΩ in parallel on copper pour.</p>
        </div>
        <div class="font-mono text-slate-300 text-xs space-y-2 mt-4">
            <strong class="text-sky-400 font-sans">ArduPilot Integration:</strong>
            <p>Set BATT_MONITOR = 21 (INA2XX auto-detect). ArduPilot reads INA226 over I2C, scales with BATT_AMP_PERVLT and BATT_AMP_OFFSET. Set BATT_I2C_BUS and BATT_I2C_ADDR to match hardware.</p>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>3.9 Motor KV Rating and Propeller Selection</h3>
    <p>KV (RPM/V) is the motor's velocity constant: no-load RPM increase per additional volt applied to the terminals. Larger props need lower KV to avoid overloading the motor at operating voltage.</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-rose-900/20 border border-rose-700/50 p-4 rounded text-sm">
            <strong class="text-rose-400 block mb-2">High KV — Racing / Scout</strong>
            <div class="font-mono text-xs text-slate-300 space-y-1">
                <div>KV: <span class="text-white">1800–2700</span></div>
                <div>Props: <span class="text-white">3"–5"</span></div>
                <div>Voltage: <span class="text-white">4S–6S</span></div>
                <div>Use: <span class="text-white">FPV racing, Type-1 SUAS</span></div>
                <div class="text-rose-400 mt-1">Fast ↑ — Efficient ↓</div>
            </div>
        </div>
        <div class="bg-emerald-900/20 border border-emerald-700/50 p-4 rounded text-sm">
            <strong class="text-emerald-400 block mb-2">Mid KV — AI Payload ★</strong>
            <div class="font-mono text-xs text-slate-300 space-y-1">
                <div>KV: <span class="text-white">500–1000</span></div>
                <div>Props: <span class="text-white">10"–15"</span></div>
                <div>Voltage: <span class="text-white">6S</span></div>
                <div>Use: <span class="text-white">ISR, cargo, AI payload</span></div>
                <div class="text-emerald-400 mt-1">Typical: <strong>920KV, 6S, 13"</strong></div>
            </div>
        </div>
        <div class="bg-sky-900/20 border border-sky-700/50 p-4 rounded text-sm">
            <strong class="text-sky-400 block mb-2">Low KV — Heavy Lift</strong>
            <div class="font-mono text-xs text-slate-300 space-y-1">
                <div>KV: <span class="text-white">200–400</span></div>
                <div>Props: <span class="text-white">18"–30"</span></div>
                <div>Voltage: <span class="text-white">6S–12S</span></div>
                <div>Use: <span class="text-white">Hex/octo heavy-lift logistics</span></div>
                <div class="text-sky-400 mt-1">Efficient ↑ — Torque ↑↑</div>
            </div>
        </div>
    </div>
    <p class="text-sm text-slate-300 mb-6">Prop notation: "1345" = 13-inch diameter, 4.5-inch pitch. Larger diameter = larger disk area = more efficient thrust at the same RPM. Higher pitch = more thrust per revolution but requires more torque (higher current draw). Never exceed the motor manufacturer's max prop size rating.</p>

    <!-- ============================================================ -->
    <h3>3.10 Battery Management Systems (BMS)</h3>
    <p>A BMS is the electronic guardian of a multi-cell pack. It monitors per-cell voltage, balances cells during charging, and enforces hardware cutoffs for overcurrent, over-temperature, and overdischarge. On consumer LiPo packs used in FPV racing, the BMS is often minimal or absent — the operator handles balancing via the charger. On industrial and military UAV packs (Tattu Plus "Smart" series, Maxell, EnerTek), the BMS is embedded with CAN or UART telemetry output.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6">
            <h3 class="text-sky-400 font-bold text-lg mb-3">BMS Core Functions</h3>
            <ul class="text-slate-300 text-sm space-y-2">
                <li><span class="text-white font-semibold">Cell balancing:</span> Passive (dissipate excess as heat) or active (charge-transfer between cells). Active balancing is superior but adds cost and weight.</li>
                <li><span class="text-white font-semibold">State of Charge (SoC):</span> Coulomb counting (integrates current) + OCV correction. Accuracy ±3–5% over life.</li>
                <li><span class="text-white font-semibold">State of Health (SoH):</span> Tracks capacity fade over cycles. Trigger maintenance when SoH &lt; 80%.</li>
                <li><span class="text-white font-semibold">Fault protection:</span> Hardware cutoff FETs for over-voltage, under-voltage, over-current, short circuit, over-temperature.</li>
            </ul>
        </div>
        <div class="bg-slate-800/60 border border-amber-700/60 rounded-xl p-6">
            <h3 class="text-amber-400 font-bold text-lg mb-3">Smart Battery Protocols</h3>
            <ul class="text-slate-300 text-sm space-y-2">
                <li><span class="text-white font-semibold">SMBus:</span> Legacy standard, used by Tattu Plus with dedicated charger. Provides SoC%, cycle count, temperature, current.</li>
                <li><span class="text-white font-semibold">DJI Smart Battery:</span> Proprietary protocol via 5-pin connector. Deep integration with DJI ground station — not available to open-source FC.</li>
                <li><span class="text-white font-semibold">UAVCAN / DroneCAN:</span> Emerging standard. Battery nodes broadcast capacity, health, and faults on the CAN bus alongside ESCs and GPS.</li>
                <li><span class="text-white font-semibold">MAVLink BATTERY_STATUS (#147):</span> ArduPilot reports battery data from any connected sensor via this message to GCS.</li>
            </ul>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>3.11 Brownout Protection: Capacitor Bank Design</h3>
    <p>A brownout occurs when battery voltage sags below the BEC's minimum input voltage during peak current draw. The energy stored in a capacitor bank bridges this transient. The Rubycon ZLH and Panasonic FR series are the industry standard because they combine very low ESR with high ripple current rating and long life at elevated temperatures.</p>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-4">
        <h3 class="text-sky-400 font-bold text-lg mb-3">Why ~23,000µF?</h3>
        <p class="text-slate-300 text-sm">Under a full-throttle motor spike, battery voltage can sag from 22V to 18V for ~20ms. The capacitor bank must supply 3.5A to the Jetson's BEC during that 20ms window while voltage only drops a further 3V. Working backwards: <strong>C = I × t / ΔV = 3.5A × 0.020s / 3V ≈ 23,300µF</strong>. Use low-ESR caps — standard electrolytics waste 1.05V across their internal resistance at this current; Rubycon ZLH wastes only ~0.05V.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-emerald-700/50">
            <strong class="text-emerald-400 block mb-2 font-sans">Option A: Rubycon ZLH</strong>
            <div class="text-slate-300 space-y-1">
                <div>4× 6800µF 35V = <span class="text-white font-bold">27,200µF total</span></div>
                <div>ESR: 12–18 mΩ per cap</div>
                <div>Ripple: 3.78A rms @ 105°C</div>
                <div class="text-emerald-400 mt-1">Best choice for 6S builds</div>
            </div>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-sky-700/50">
            <strong class="text-sky-400 block mb-2 font-sans">Option B: Panasonic FR</strong>
            <div class="text-slate-300 space-y-1">
                <div>6× 3900µF 35V = <span class="text-white font-bold">23,400µF total</span></div>
                <div>ESR: 15–22 mΩ per cap</div>
                <div>Ripple: 2.6A rms @ 105°C</div>
                <div class="text-sky-400 mt-1">More widely stocked</div>
            </div>
        </div>
    </div>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-rose-500 mb-6">
        <strong class="text-rose-400 block mb-1">Placement is Critical</strong>
        <p class="text-slate-400 text-sm">The capacitor bank must be within 10cm of the BEC's input terminals, connected with low-inductance wide copper traces. A long thin wire between the capacitor and BEC input creates series inductance (L); effective impedance at 10kHz = 2πfL, which can negate even low-ESR caps. Target trace inductance &lt;10nH between cap and BEC input.</p>
    </div>

    <!-- ============================================================ -->
    <h3>3.12 Alternative Power Sources</h3>
    <p>Battery-electric propulsion hits a hard endurance ceiling around 45–60 minutes for practical multirotor configurations. Military ISR requirements often demand 4–24+ hours of continuous loiter. Three alternative architectures address this gap.</p>

    <div class="space-y-6 mb-8">
        <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6">
            <h3 class="text-sky-400 font-bold text-lg mb-3">Hydrogen Fuel Cells (PEM)</h3>
            <p class="text-slate-300 text-sm mb-3">Proton Exchange Membrane (PEM) fuel cells combine hydrogen gas with atmospheric oxygen to produce electricity, with water as the only byproduct. The global hydrogen fuel-cell drone market was valued at $41M in 2024 and is projected to reach $2.1B by 2031 (76% CAGR).</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                <div>
                    <p class="text-white font-bold font-sans mb-1">Architecture</p>
                    <p>PEM stack (cruise power) + small LiPo buffer (peak/transient power). The fuel cell cannot respond fast enough to throttle transients alone — the battery handles the first 100–500ms of any thrust change.</p>
                </div>
                <div>
                    <p class="text-white font-bold font-sans mb-1">Performance (2024–2025)</p>
                    <p>AVIC / Tsinghua fixed-wing: 30-hour continuous flight (April 2025). K1000ULE multirotor: 75-hour endurance. US Army $20M contract for K1000, Oct 2024. Intelligent Energy PEM cells commercially available.</p>
                </div>
            </div>
            <p class="text-slate-400 text-xs mt-3">References: <a href="https://www.intelligent-energy.com/our-industries/uav/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Intelligent Energy UAV fuel cells</a> · <a href="https://www.defensenews.com/land/2024/10/30/us-army-buys-long-flying-solar-drones-to-watch-over-pacific-units/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Defense News: Army K1000 contract</a></p>
        </div>

        <div class="bg-slate-800/60 border border-emerald-700/60 rounded-xl p-6">
            <h3 class="text-emerald-400 font-bold text-lg mb-3">Solar-Powered UAVs</h3>
            <p class="text-slate-300 text-sm mb-3">Solar cells bonded to wing surfaces harvest energy during daylight, charging an onboard battery buffer. Net energy positive in optimal conditions allows theoretically indefinite flight.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                <div>
                    <p class="text-white font-bold font-sans mb-1">Technical Constraints</p>
                    <p>Practical solar irradiance: ~1000 W/m² at sea level. Monocrystalline Si cells: 22–26% efficiency. At 0.5m² wing area: ~130W peak harvest — adequate for cruise, not hover. Limited to fixed-wing or high-altitude platforms.</p>
                </div>
                <div>
                    <p class="text-white font-bold font-sans mb-1">Military Adoption (2024–2025)</p>
                    <p>K1000 / K1000ULE: ISR drone with solar wings, 76+ hour endurance record. Army 1st MDTF and JSOC contracts. Kea Atmos (NZ): 17,160m altitude, 8-hour flight at 40kg AUW. Micro solar: 4-gram solar MAV (China, July 2024).</p>
                </div>
            </div>
        </div>

        <div class="bg-slate-800/60 border border-amber-700/60 rounded-xl p-6">
            <h3 class="text-amber-400 font-bold text-lg mb-3">Hybrid Power Systems (Battery + Generator)</h3>
            <p class="text-slate-300 text-sm mb-3">Small internal combustion generators (typically 50–250cc) charge a large LiPo buffer in flight. The electric motors provide smooth, quiet flight while the engine provides range-extending energy generation.</p>
            <div class="text-xs font-mono text-slate-300 space-y-2">
                <p><span class="text-white">Architecture:</span> Engine → generator → MPPT charge controller → LiPo buffer → BECs → avionics + motors</p>
                <p><span class="text-white">Military use case:</span> 4–8 hour SUAS endurance at &lt;5kg AUW. Suitable for persistent ISR where satellite comms links are established and battery swap is impractical.</p>
                <p><span class="text-white">MIL-STD compliance:</span> Hybrid systems must meet MIL-STD-810H (environmental), MIL-STD-461F (EMI), and MIL-STD-704F (power quality) for deployed use.</p>
                <p class="text-slate-400">Hybrid integration adds &gt;60% endurance vs battery-only. DARPA OFFSET, DIU, and AFRL programs have funded hybrid SUAS since 2022.</p>
            </div>
        </div>
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">LiPo Batteries for Drones — Complete Beginner's Guide</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/FjrlHPlfSDs" title="Beginners Guide to LiPo Batteries for Drones" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
    </div>

    <!-- ============================================================ -->
    <h3>3.13 Military and DoD Power Considerations</h3>
    <p>Deploying battery-powered UAVs in military contexts introduces requirements that commercial off-the-shelf (COTS) components do not always satisfy.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6">
            <h3 class="text-sky-400 font-bold text-lg mb-3">MIL-SPEC Power Standards</h3>
            <ul class="text-slate-300 text-sm space-y-2">
                <li><span class="text-white font-semibold">MIL-STD-810H:</span> Environmental — thermal, shock, vibration, altitude (important for high-altitude ISR). Batteries tested at −40°C to +70°C operating range.</li>
                <li><span class="text-white font-semibold">MIL-STD-461F:</span> EMI/EMC — motor switching noise must not interfere with comms equipment on the same platform.</li>
                <li><span class="text-white font-semibold">MIL-STD-704F:</span> Aircraft electrical power characteristics — relevant for hybrid power supplies connected to MIL-standard avionics.</li>
                <li><span class="text-white font-semibold">NDAA Section 848:</span> Prohibits DoD procurement of UAS or batteries from five named Chinese manufacturers (DJI, Autel, JOUAV, etc.) without a waiver.</li>
            </ul>
        </div>
        <div class="bg-slate-800/60 border border-rose-700/60 rounded-xl p-6">
            <h3 class="text-rose-400 font-bold text-lg mb-3">Battery Safety and Transport</h3>
            <ul class="text-slate-300 text-sm space-y-2">
                <li><span class="text-white font-semibold">UN 38.3:</span> Required certification for LiPo transport by air — tests nail penetration, short circuit, overcharge, and crush without explosion. Verify before field shipping.</li>
                <li><span class="text-white font-semibold">Field charging:</span> LiPo batteries must not be charged unattended in theater. Use LiPo-safe charging bags or purpose-built charging containers (e.g., BattSafe, commercial ammo cans with fire suppression). Charge at 1C max in field conditions.</li>
                <li><span class="text-white font-semibold">Storage voltage:</span> Long-term storage at 3.80 V/cell (LiPo) prevents capacity degradation. Set charger to "storage charge" mode. Below 3.0 V/cell permanently damages cells.</li>
                <li><span class="text-white font-semibold">Thermal signature:</span> Lithium batteries emit a modest IR signature during charging. Consider in emissions-control (EMCON) environments.</li>
            </ul>
        </div>
    </div>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500 mb-6">
        <strong class="text-sky-400 block mb-1">Supply Chain Compliance</strong>
        <p class="text-slate-400 text-sm">For DoD programs, verify battery and ESC supply chain against the UFLPA (Uyghur Forced Labor Prevention Act) entity list and NDAA Section 848 prohibited manufacturers list. Approved vendors (as of 2025) include Tattu/Gens Ace (verify current status), Maxell, EnerTek, Bren-Tronics, and Ultralife for military-grade UAV batteries. Document chain-of-custody for all battery lots used in operational systems.</p>
    </div>

    <!-- ============================================================ -->
    <h3>Further Reading</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
        <div class="space-y-2">
            <p class="text-slate-400 font-semibold uppercase text-xs tracking-widest mb-2">Battery Technology</p>
            <p><a href="https://oscarliang.com/lipo-battery-guide/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Oscar Liang — LiPo Battery Guide for FPV Drones</a></p>
            <p><a href="https://www.tytorobotics.com/blogs/articles/a-guide-to-lithium-polymer-batteries-for-drones" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Tyto Robotics — Guide to LiPo Batteries for Drones</a></p>
            <p><a href="https://genstattu.com/tattu-22-2v-30c-6s-22000mah-lipo-battery-with-xt90-s-plug-for-uav.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Tattu 6S 22000mAh 30C G-Tech Specs (Gens Ace)</a></p>
            <p><a href="https://insightfpv.com/products/solid-state-li-ion-battery" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">iNsightFPV — Semi Solid State Li-Ion UAV Battery</a></p>
            <p><a href="https://www.grepow.com/blog/high-discharge-rate-c-rate-lipo-drone-battery-grepow-tattu.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Grepow — High Discharge Rate C-Rate LiPo Guide</a></p>
        </div>
        <div class="space-y-2">
            <p class="text-slate-400 font-semibold uppercase text-xs tracking-widest mb-2">Power Systems &amp; ESCs</p>
            <p><a href="https://oscarliang.com/esc/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Oscar Liang — Understanding ESCs for FPV Drones</a></p>
            <p><a href="https://zexfpv.com/blogs/fpv-guides/am32-vs-blheli_32-fpv-esc-firmware-comparison-guide-2026" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">ZEXFPV — AM32 vs BLHeli_32 Firmware Comparison 2026</a></p>
            <p><a href="https://www.omnicalculator.com/other/drone-flight-time" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">OmniCalculator — Drone Flight Time Calculator</a></p>
            <p><a href="https://www.intelligent-energy.com/our-industries/uav/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Intelligent Energy — PEM Fuel Cells for UAVs</a></p>
            <p><a href="https://militaryembedded.com/unmanned/rugged-computing/integrating-rugged-hybrid-energy-and-power-supplies-in-military-uavs" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Military Embedded — Hybrid Energy Supplies in Military UAVs</a></p>
        </div>
    </div>
</div>
`;
