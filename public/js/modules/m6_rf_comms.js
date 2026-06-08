export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 6</span>
    <h2>RF Communications &amp; Link Management for AI Drones</h2>
    <p>Every autonomous drone mission is constrained by its communications architecture. The RF stack determines command latency, telemetry fidelity, video quality, and jamming resilience. This module dissects every layer — from transceiver silicon to swarm-level spectrum coordination — covering both the hobbyist FPV domain and defense/BVLOS operational requirements.</p>

    <!-- ================================================================
         6.1 FREQUENCY BAND COMPARISON
    ================================================================ -->
    <h3>6.1 Frequency Band Engineering Tradeoffs</h3>
    <p>RF band selection is not a preference — it is an engineering decision with direct consequences for link budget, antenna size, propagation physics, regulatory compliance, and anti-jam posture. The three bands used in drone operations each occupy a distinct point on the range-vs-data-rate tradeoff curve.</p>

    <div class="overflow-x-auto my-6">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-700 text-slate-300">
          <tr>
            <th class="p-3">Parameter</th>
            <th class="p-3">900 MHz (ISM 868/915)</th>
            <th class="p-3">2.4 GHz (ISM)</th>
            <th class="p-3">5.8 GHz (ISM)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700 text-xs font-mono">
          <tr class="bg-slate-800">
            <td class="p-3 text-slate-300 font-bold">Wavelength</td>
            <td class="p-3 text-slate-300">~33 cm (dipole ~16.5 cm)</td>
            <td class="p-3 text-slate-300">~12.5 cm (dipole ~6.25 cm)</td>
            <td class="p-3 text-slate-300">~5.2 cm (patch ~2–3 cm)</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-slate-300 font-bold">FSPL @ 1 km</td>
            <td class="p-3 text-emerald-400">91.5 dB</td>
            <td class="p-3 text-amber-400">100.0 dB (+8.5 dB vs 900)</td>
            <td class="p-3 text-rose-400">107.7 dB (+16.2 dB vs 900)</td>
          </tr>
          <tr class="bg-slate-800">
            <td class="p-3 text-slate-300 font-bold">Obstacle penetration</td>
            <td class="p-3 text-emerald-400">Superior — diffracts around terrain, trees, buildings</td>
            <td class="p-3 text-amber-400">Moderate — absorbed by foliage and walls</td>
            <td class="p-3 text-rose-400">Poor — absorbed by vegetation and concrete</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-slate-300 font-bold">Max legal TX power (US)</td>
            <td class="p-3 text-slate-300">30 dBm / 1 W (FCC Part 15.247); 50 W+ with ham license</td>
            <td class="p-3 text-slate-300">30 dBm / 1 W EIRP (FCC Part 15.247)</td>
            <td class="p-3 text-slate-300">25 mW typical VTX; 1 W with Part 97 ham</td>
          </tr>
          <tr class="bg-slate-800">
            <td class="p-3 text-slate-300 font-bold">ISM congestion</td>
            <td class="p-3 text-emerald-400">Low (primarily telemetry, ISM devices)</td>
            <td class="p-3 text-rose-400">Very high — WiFi 802.11 b/g/n/ax, BT, ZigBee, microwave ovens</td>
            <td class="p-3 text-amber-400">Moderate — WiFi 802.11 a/n/ac/ax channels overlap</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-slate-300 font-bold">Primary drone use</td>
            <td class="p-3 text-slate-300">Long-range RC (ELRS 900, Crossfire), MAVLink telemetry modems</td>
            <td class="p-3 text-slate-300">RC control (ELRS 2.4, Crossfire Tracer), mesh data links</td>
            <td class="p-3 text-slate-300">FPV video downlink (analog &amp; digital) — not RC control</td>
          </tr>
          <tr class="bg-slate-800">
            <td class="p-3 text-slate-300 font-bold">Best for</td>
            <td class="p-3 text-emerald-400">Long-range fixed-wing, BVLOS, military C2</td>
            <td class="p-3 text-amber-400">Racing, freestyle, mesh swarms, 1000Hz FLRC</td>
            <td class="p-3 text-rose-400">FPV goggles video only; avoid for control</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ================================================================
         6.2 LINK BUDGET — WORKED EXAMPLE
    ================================================================ -->
    <h3>6.2 Link Budget: Worked Example</h3>
    <p>A link budget accounts for every gain and loss in a radio path. The goal is to verify that the received signal power exceeds the receiver's sensitivity floor by a sufficient margin — the <strong>link margin</strong>. Positive margin means the link closes; negative margin means no comms.</p>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-6">
      <h3 class="text-sky-400 font-bold text-lg mb-3">Link Budget Formula</h3>
      <p class="text-slate-300 text-sm mb-4">The fundamental equation (all values in dB or dBm):</p>
      <div class="bg-slate-900 rounded-lg p-4 font-mono text-sm text-center mb-4">
        <span class="text-emerald-400">P_rx</span>
        <span class="text-slate-300"> = </span>
        <span class="text-sky-400">P_tx</span>
        <span class="text-slate-400"> + </span>
        <span class="text-amber-400">G_tx</span>
        <span class="text-slate-400"> + </span>
        <span class="text-amber-400">G_rx</span>
        <span class="text-slate-400"> − </span>
        <span class="text-rose-400">FSPL</span>
        <span class="text-slate-400"> − </span>
        <span class="text-rose-400">L_cable</span>
        <span class="text-slate-400"> − </span>
        <span class="text-rose-400">L_misc</span>
      </div>
      <div class="font-mono text-xs text-slate-400 mb-2">
        Free-Space Path Loss: FSPL (dB) = 20·log<sub>10</sub>(d_km) + 20·log<sub>10</sub>(f_MHz) + 32.45
      </div>
      <div class="font-mono text-xs text-slate-400">
        Link Margin = P_rx − Sensitivity_floor &nbsp;&nbsp;(must be &gt; 0 dB for reliable comms; &gt;10 dB recommended)
      </div>
    </div>

    <div class="bg-slate-800/60 border border-amber-700/60 rounded-xl p-6 mb-6">
      <h3 class="text-amber-400 font-bold text-lg mb-4">Worked Example — ELRS 900 MHz at 5 km</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm font-mono">
          <thead class="text-slate-400 border-b border-slate-700">
            <tr><th class="p-2 text-left">Parameter</th><th class="p-2 text-right">Value</th><th class="p-2 text-left pl-4">Notes</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-700/50 text-slate-300">
            <tr><td class="p-2 text-sky-400">TX Power (P_tx)</td><td class="p-2 text-right text-emerald-400">+30 dBm</td><td class="p-2 pl-4 text-slate-400">1 W — typical ELRS 900 max</td></tr>
            <tr><td class="p-2 text-sky-400">TX Antenna Gain (G_tx)</td><td class="p-2 text-right text-emerald-400">+2 dBi</td><td class="p-2 pl-4 text-slate-400">Standard dipole on transmitter</td></tr>
            <tr><td class="p-2 text-sky-400">RX Antenna Gain (G_rx)</td><td class="p-2 text-right text-emerald-400">+2 dBi</td><td class="p-2 pl-4 text-slate-400">Dipole on receiver/UAV</td></tr>
            <tr><td class="p-2 text-rose-400">FSPL @ 5 km, 915 MHz</td><td class="p-2 text-right text-rose-400">−105.6 dB</td><td class="p-2 pl-4 text-slate-400">20·log(5)+20·log(915)+32.45</td></tr>
            <tr><td class="p-2 text-rose-400">Cable &amp; connector losses</td><td class="p-2 text-right text-rose-400">−1 dB</td><td class="p-2 pl-4 text-slate-400">Typical short coax run</td></tr>
            <tr class="border-t-2 border-slate-600 font-bold"><td class="p-2 text-white">Received Power (P_rx)</td><td class="p-2 text-right text-amber-400">−72.6 dBm</td><td class="p-2 pl-4 text-slate-400">30+2+2−105.6−1</td></tr>
            <tr><td class="p-2 text-slate-300">RX Sensitivity (50 Hz LoRa)</td><td class="p-2 text-right text-slate-400">−123 dBm</td><td class="p-2 pl-4 text-slate-400">ELRS SX1276 at 50 Hz rate</td></tr>
            <tr class="border-t-2 border-slate-600 font-bold"><td class="p-2 text-emerald-400">Link Margin</td><td class="p-2 text-right text-emerald-400 text-lg">+50.4 dB</td><td class="p-2 pl-4 text-amber-400">Robust — 50 dB headroom for obstacles</td></tr>
          </tbody>
        </table>
      </div>
      <p class="text-slate-400 text-xs mt-3">Key insight: every 6 dB of link margin doubles (or halves) the maximum range. With 50 dB of margin at 5 km, range extendable to theoretical ~16 km before reaching sensitivity floor — consistent with 30+ km ELRS 900 demonstrations using directional antennas.</p>
    </div>

    <!-- ================================================================
         6.3 RC LINK ARCHITECTURE: ELRS AND CROSSFIRE
    ================================================================ -->
    <h3>6.3 RC Link Architecture: ExpressLRS (ELRS) and CRSF</h3>
    <p>ExpressLRS is the dominant open-source RC link for performance and long-range applications, built on Semtech LoRa transceivers. The critical design decision is the transceiver chip per band.</p>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-6">
      <h3 class="text-sky-400 font-bold text-lg mb-3">ELRS Firmware Milestones (2024–2025)</h3>
      <ul class="text-slate-300 text-sm space-y-2">
        <li><strong class="text-amber-400">ELRS 3.5.x (2024, Final STM32 release):</strong> Native MAVLink support — direct two-way MAVLink tunneling over the RC link, enabling Mission Planner telemetry, waypoint upload, and parameter changes in flight. FSK &#96;K&#96; modes added — SubGHz band jumps from 200 Hz to <strong>1000 Hz</strong> maximum packet rate. Last release to support STM32-based hardware (Happymodel PP, early NamimnoRC, FrSky ELRS).</li>
        <li><strong class="text-amber-400">ELRS 4.0.x (February 2025):</strong> ESP32/ESP8285-only. Drops all STM32 hardware. Introduces doubled telemetry bandwidth in Gemini mode. Incompatible with v3.x hardware — upgrade both TX and RX together.</li>
      </ul>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">ELRS Transceiver Hardware Matrix</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase text-xs tracking-widest block mb-2">900 MHz Band — SX127x (SX1276/SX1278)</strong>
                <ul class="text-slate-300 text-xs space-y-1">
                    <li>Chip: Semtech SX1276 or SX1278 depending on exact frequency</li>
                    <li>Modulation: LoRa CSS only (no FLRC support on SX127x)</li>
                    <li>Max packet rate: 200 Hz (SX127x) or <strong>1000 Hz with ELRS 3.5+ FSK K-modes</strong></li>
                    <li>Receiver sensitivity: down to −123 dBm at 25 Hz LoRa mode</li>
                    <li>Sensitivity at 100 Hz: −117 dBm; at 250 Hz: −111 dBm</li>
                    <li>Typical power: up to 1 W (30 dBm) — varies by jurisdiction</li>
                    <li>Range (50 Hz, 1 W, dipole): 30+ km demonstrated; 100+ km with directional antenna</li>
                    <li class="text-amber-300">LR1121 hardware (e.g. RadioMaster Nomad): multi-band 868/915/2.4 GHz in one module</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase text-xs tracking-widest block mb-2">2.4 GHz Band — SX1280/SX1281/SX1282</strong>
                <ul class="text-slate-300 text-xs space-y-1">
                    <li>Chip: Semtech SX1280 — 2.400–2.500 GHz ISM band</li>
                    <li>Modulation: LoRa CSS AND FLRC (Fast Long Range)</li>
                    <li>FLRC uses GFSK internally — not standard FSK; unique to SX1280</li>
                    <li>Max packet rate: 500 Hz (LoRa) or 1000 Hz (FLRC)</li>
                    <li>Sensitivity at 500 Hz LoRa: −105 dBm; at 50 Hz LoRa: −115 dBm</li>
                    <li>Range (250 Hz, 100 mW, dipole): ~10 km demonstrated</li>
                </ul>
            </div>
        </div>
    </div>

    <h4>Modulation Deep Dive: LoRa vs FLRC vs FSK K-modes</h4>
    <ul class="text-slate-300 text-sm space-y-2">
        <li><strong>LoRa (Chirp Spread Spectrum):</strong> Encodes data by sweeping frequency across a bandwidth. Spreading factor SF6–SF12 controls range/rate tradeoff. Can decode signals 20 dB below the noise floor. Used for maximum range, up to 500 Hz on 2.4 GHz.</li>
        <li><strong>FLRC (Fast Long Range Communication):</strong> Semtech's SX1280 proprietary mode using GFSK with forward error correction. Lower receiver sensitivity than LoRa but significantly lower air-time per packet. Enables 1000 Hz packet rates. Not available on SX127x.</li>
        <li><strong>FSK K-modes (ELRS 3.5+):</strong> Added to SubGHz band, enabling 1000 Hz packet rates on 900 MHz hardware — previously limited to 200 Hz. Trades some sensitivity for higher update rates.</li>
        <li><strong>Diversity modes (D500/D250):</strong> Same RC packet transmitted 2× (D500) or 4× (D250) across multiple frequencies, reducing packet loss in interference-heavy environments at cost of effective throughput.</li>
    </ul>

    <h4>ELRS Packet Rates &amp; Link Latency</h4>
    <p>Packet rate directly defines link latency. At 500 Hz, the packet interval is 1/500 = 2 ms. Total system latency from stick to motor response: stick ADC (~1 ms) + TX processing (~0.5 ms) + air packet interval + RX UART output (~0.5 ms) + FC loop (~2.5 ms at 400 Hz) = ~6.5 ms total at 500 Hz.</p>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Packet Rate vs Link Latency</div>
        <div class="flex text-xs font-mono flex-wrap">
            <div class="flex-1 p-3 text-center border-r border-slate-800 min-w-[70px]">
                <div class="text-emerald-400 font-bold text-base">1000 Hz</div><div class="text-slate-400">1.0 ms</div>
            </div>
            <div class="flex-1 p-3 text-center border-r border-slate-800 min-w-[70px]">
                <div class="text-emerald-400 font-bold text-base">500 Hz</div><div class="text-slate-400">2.0 ms</div>
            </div>
            <div class="flex-1 p-3 text-center border-r border-slate-800 min-w-[70px]">
                <div class="text-emerald-300 font-bold text-base">250 Hz</div><div class="text-slate-400">4.0 ms</div>
            </div>
            <div class="flex-1 p-3 text-center border-r border-slate-800 min-w-[70px]">
                <div class="text-amber-400 font-bold text-base">150 Hz</div><div class="text-slate-400">6.7 ms</div>
            </div>
            <div class="flex-1 p-3 text-center border-r border-slate-800 min-w-[70px]">
                <div class="text-amber-300 font-bold text-base">100 Hz</div><div class="text-slate-400">10 ms</div>
            </div>
            <div class="flex-1 p-3 text-center border-r border-slate-800 min-w-[70px]">
                <div class="text-rose-400 font-bold text-base">50 Hz</div><div class="text-slate-400">20 ms</div>
            </div>
            <div class="flex-1 p-3 text-center min-w-[70px]">
                <div class="text-rose-500 font-bold text-base">25 Hz</div><div class="text-slate-400">40 ms</div>
            </div>
        </div>
    </div>

    <h4>RC Link Comparison: ELRS vs Crossfire vs FrSky R9</h4>
    <div class="overflow-x-auto my-4">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-700 text-slate-300">
          <tr>
            <th class="p-3">Parameter</th>
            <th class="p-3">ELRS 2.4 GHz</th>
            <th class="p-3">ELRS 900 MHz</th>
            <th class="p-3">TBS Crossfire</th>
            <th class="p-3">FrSky R9</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700 text-xs font-mono">
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">Transceiver</td>
            <td class="p-3 text-slate-300">Semtech SX1280</td>
            <td class="p-3 text-slate-300">Semtech SX1276/78</td>
            <td class="p-3 text-slate-300">SX1272 (LoRa), proprietary</td>
            <td class="p-3 text-slate-300">SX1276</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-white font-bold">Max Packet Rate</td>
            <td class="p-3 text-emerald-400">1000 Hz (FLRC)</td>
            <td class="p-3 text-emerald-400">1000 Hz (FSK, ELRS 3.5+); 200 Hz (LoRa)</td>
            <td class="p-3 text-amber-400">150 Hz (CRSF Shot)</td>
            <td class="p-3 text-amber-400">50 Hz</td>
          </tr>
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">Link Interval @ max</td>
            <td class="p-3 text-emerald-400">1 ms</td>
            <td class="p-3 text-emerald-400">1 ms / 5 ms (FSK/LoRa)</td>
            <td class="p-3 text-amber-400">6.7 ms</td>
            <td class="p-3 text-rose-400">20 ms</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-white font-bold">Max TX Power</td>
            <td class="p-3 text-slate-300">250 mW typical</td>
            <td class="p-3 text-slate-300">1 W (region-dependent)</td>
            <td class="p-3 text-emerald-400">2 W (2000 mW)</td>
            <td class="p-3 text-slate-300">1 W</td>
          </tr>
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">Encryption</td>
            <td class="p-3 text-rose-400">None (plaintext)</td>
            <td class="p-3 text-rose-400">None (plaintext)</td>
            <td class="p-3 text-emerald-400">AES-128</td>
            <td class="p-3 text-rose-400">None</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-white font-bold">MAVLink support</td>
            <td class="p-3 text-emerald-400">Native (ELRS 3.5+)</td>
            <td class="p-3 text-emerald-400">Native (ELRS 3.5+)</td>
            <td class="p-3 text-amber-400">Via CRSF passthrough</td>
            <td class="p-3 text-rose-400">No</td>
          </tr>
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">Open Source</td>
            <td class="p-3 text-emerald-400">Yes (GPL)</td>
            <td class="p-3 text-emerald-400">Yes (GPL)</td>
            <td class="p-3 text-rose-400">No (proprietary)</td>
            <td class="p-3 text-rose-400">No</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-white font-bold">Protocol to FC</td>
            <td class="p-3 text-slate-300">CRSF (400 kbaud UART)</td>
            <td class="p-3 text-slate-300">CRSF (400 kbaud UART)</td>
            <td class="p-3 text-slate-300">CRSF (400 kbaud UART)</td>
            <td class="p-3 text-slate-300">SBUS / F.Port</td>
          </tr>
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">Channels</td>
            <td class="p-3 text-slate-300">12 ch (Hybrid/Wide)</td>
            <td class="p-3 text-slate-300">12 ch</td>
            <td class="p-3 text-slate-300">16 ch</td>
            <td class="p-3 text-slate-300">16 ch</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-slate-400 text-sm mt-2">
      External references:
      <a href="https://www.expresslrs.org/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">ExpressLRS documentation</a> |
      <a href="https://github.com/tbs-fpv/tbs-crsf-spec" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">TBS CRSF Protocol Spec (GitHub)</a>
    </p>

    <!-- FHSS Diagram -->
    <figure class="my-6">
      <img src="images/m6_fhss_diagram.jpg" alt="Frequency Hopping Spread Spectrum (FHSS) diagram showing carrier frequency jumping across time slots" class="rounded-lg w-full max-w-2xl mx-auto">
      <figcaption class="text-gray-400 text-sm text-center mt-2">FHSS: carrier frequency hops pseudo-randomly across time, making the signal resistant to narrowband jamming. Source: <a href="https://commons.wikimedia.org/wiki/File:Frequency_Hopping_Spread_Spectrum.JPG" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons</a> (public domain)</figcaption>
    </figure>

    <!-- ================================================================
         6.4 SPREAD SPECTRUM: FHSS, DSSS, LPI/LPD
    ================================================================ -->
    <h3>6.4 Spread Spectrum: FHSS, DSSS, and Anti-Jam Techniques</h3>

    <h4>FHSS (Frequency Hopping Spread Spectrum)</h4>
    <p>FHSS pseudo-randomly hops the carrier frequency across a pre-agreed channel list on each packet. Both TX and RX must share the same pseudo-random number seed (the "hop sequence") and stay synchronized. A narrowband jammer fixed on one frequency disrupts only the fraction of packets landing on that channel. A broadband noise jammer must spread power across the entire hop bandwidth, dramatically reducing effective jamming power spectral density (PSD).</p>
    <div class="bg-slate-800/60 border border-amber-700/40 rounded-xl p-5 mb-4">
      <p class="text-slate-300 text-sm"><strong class="text-amber-400">FHSS Jam Resistance Example:</strong> A SiK 900 MHz radio hopping across 50 × 125 kHz channels spreads its signal over 6.25 MHz. A narrowband jammer fixed to one channel disrupts only 2% of packets (1/50). A broadband jammer must spread its power across all 6.25 MHz, reducing its effective power spectral density by 17 dB compared to targeting a fixed-frequency link. <strong>Caveat:</strong> FHSS reduces but does not eliminate jamming vulnerability. A wideband receiver can still capture and decode the hop sequence.</p>
    </div>

    <h4>DSSS (Direct Sequence Spread Spectrum)</h4>
    <p>DSSS multiplies the data signal with a high-rate pseudo-random noise (PN) code, spreading the signal across a wide bandwidth. The receiver correlates the incoming signal with the same PN code to extract data, rejecting interference signals that are not correlated. DSSS provides better resistance to wideband noise than FHSS and is used in GPS, CDMA cellular, and IEEE 802.11b WiFi. In the RC world, systems marketed as "FHSS" (Futaba FASST, Spektrum DSM2/DSMX) are technically a hybrid agile-DSSS — they hop channels but also use DSSS-style PN spreading within each channel.</p>

    <div class="overflow-x-auto my-4">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-700 text-slate-300">
          <tr>
            <th class="p-3">Property</th>
            <th class="p-3">FHSS</th>
            <th class="p-3">DSSS</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700 text-xs">
          <tr class="bg-slate-800"><td class="p-3 text-white font-bold">Mechanism</td><td class="p-3 text-slate-300">Carrier hops across N channels over time</td><td class="p-3 text-slate-300">Data XORed with PN code, spreads bandwidth</td></tr>
          <tr class="bg-slate-900"><td class="p-3 text-white font-bold">Best against</td><td class="p-3 text-emerald-400">Narrowband jamming, selective fading</td><td class="p-3 text-emerald-400">Wideband noise, multipath interference</td></tr>
          <tr class="bg-slate-800"><td class="p-3 text-white font-bold">Weakness</td><td class="p-3 text-rose-400">Wideband jammer, if hop sequence known</td><td class="p-3 text-rose-400">Narrowband strong interferer can saturate front-end</td></tr>
          <tr class="bg-slate-900"><td class="p-3 text-white font-bold">Sync requirement</td><td class="p-3 text-slate-300">Hop sequence + timing synchronization</td><td class="p-3 text-slate-300">PN code + chip timing synchronization</td></tr>
          <tr class="bg-slate-800"><td class="p-3 text-white font-bold">Drone examples</td><td class="p-3 text-slate-300">ELRS, SiK telemetry, RFD900x</td><td class="p-3 text-slate-300">GPS L1/L2, legacy Spektrum DSM2</td></tr>
        </tbody>
      </table>
    </div>

    <h4>LPI/LPD and Anti-Jam Techniques for Military Operations</h4>
    <p>Defense-grade links go beyond commercial FHSS to prevent detection and interception:</p>
    <ul class="text-slate-300 text-sm space-y-2">
        <li><strong>LPI (Low Probability of Intercept):</strong> Transmit at very low power, spread over wide bandwidth, use directional antennas. Power spectral density falls below the thermal noise floor over any narrow measurement band. An intercept receiver cannot distinguish the signal from noise without knowing the PN sequence.</li>
        <li><strong>LPD (Low Probability of Detection):</strong> Similar to LPI but focused on energy detection — no signal feature that an energy detector can latch onto. Requires waveform design that minimizes spectral peaks.</li>
        <li><strong>MIMO Spatial Multiplexing:</strong> Multiple antennas transmit independent data streams simultaneously in the same band, exploiting spatial diversity to increase throughput without increasing bandwidth or power. 2×2 MIMO doubles effective throughput; 4×4 MIMO quadruples it.</li>
        <li><strong>Adaptive Beamforming:</strong> Phased array antennas steer the transmitted beam toward the intended receiver while placing nulls in the direction of jammers. Requires real-time direction-of-arrival estimation (MUSIC, ESPRIT algorithms). Silvus StreamCaster, Rajant BreadCrumb, and Doodle Labs Mesh Rider radios all implement variants of this.</li>
        <li><strong>Frequency Agility / Cognitive Radio:</strong> Onboard spectrum sensing (SDR) detects occupied channels; the radio dynamically moves to clear spectrum. Requires &lt;50 ms channel assessment and switching time for practical BVLOS operations.</li>
    </ul>

    <!-- ================================================================
         6.5 MAVLink 2 SECURITY
    ================================================================ -->
    <h3>6.5 MAVLink 2 Security: Signed Messages and HMAC-SHA256</h3>
    <p>MAVLink is the de-facto telemetry protocol for ArduPilot and PX4 autopilots. MAVLink 1 transmits in plaintext with no authentication. <strong>MAVLink 2</strong> (2017+) adds an optional 13-byte signature field providing message authentication.</p>

    <div class="bg-slate-800/60 border border-sky-700/60 rounded-xl p-6 mb-6">
      <h3 class="text-sky-400 font-bold text-lg mb-3">MAVLink 2 Signature Architecture</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-slate-300 mb-2"><strong class="text-amber-400">Algorithm:</strong> SHA-256 truncated to 48 bits (6 bytes). Not a full HMAC-SHA256 — it is a keyed hash using the first 48 bits of the SHA-256 output.</p>
          <p class="text-slate-300 mb-2"><strong class="text-amber-400">Signature input:</strong></p>
          <div class="bg-slate-900 rounded p-3 font-mono text-xs text-slate-400 mb-2">
            sig = sha256_48(<br>
            &nbsp;&nbsp;secret_key (32 bytes)<br>
            &nbsp;&nbsp;+ MAVLink header<br>
            &nbsp;&nbsp;+ payload<br>
            &nbsp;&nbsp;+ CRC<br>
            &nbsp;&nbsp;+ link_id (1 byte)<br>
            &nbsp;&nbsp;+ timestamp (6 bytes, 10µs units since 2015-01-01)
            )
          </div>
        </div>
        <div>
          <p class="text-slate-300 mb-2"><strong class="text-amber-400">Key management:</strong> 32-byte binary secret key. Distribute via SETUP_SIGNING message over a physically secure link (USB or wired Ethernet only — never over the air link).</p>
          <p class="text-slate-300 mb-2"><strong class="text-amber-400">Rejection rules — a packet is dropped if:</strong></p>
          <ul class="text-slate-400 text-xs space-y-1">
            <li>Timestamp older than previous packet from same stream (replay protection)</li>
            <li>Computed 48-bit signature does not match packet signature</li>
            <li>Timestamp more than 1 minute behind local system clock</li>
            <li>Signing key not configured on receiving end</li>
          </ul>
          <p class="text-rose-400 text-xs mt-2"><strong>Important:</strong> MAVLink 2 signing provides authentication and replay protection — it does <em>not</em> provide confidentiality (encryption). The payload is still plaintext.</p>
        </div>
      </div>
    </div>

    <p class="text-slate-400 text-sm">
      Reference:
      <a href="https://mavlink.io/en/guide/message_signing.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">MAVLink Message Signing specification</a> |
      <a href="https://mavlink.io/en/guide/mavlink_2.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">MAVLink 2 protocol guide</a>
    </p>

    <!-- ================================================================
         6.6 VIDEO LINKS
    ================================================================ -->
    <h3>6.6 FPV Video Links: Analog vs Digital</h3>
    <p>The FPV video link operates entirely separately from the RC control link. It runs drone-to-pilot (downlink) and uses completely different modulation. Latency characteristics determine which applications each system suits.</p>

    <h4>Analog FPV</h4>
    <p>Analog sends raw composite video (NTSC 480i / PAL 576i) from the VTX directly to goggles without digital encoding. No frame buffer, no codec, no processing delay. Glass-to-glass latency: <strong>3–5 ms</strong>. Still preferred for competitive racing because latency is deterministic (zero codec jitter) and signal degrades gracefully (noise/snow) rather than a digital cliff-effect dropout.</p>

    <h4>Digital FPV Systems</h4>
    <div class="overflow-x-auto my-4">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-700 text-slate-300">
          <tr>
            <th class="p-3">System</th>
            <th class="p-3">Resolution</th>
            <th class="p-3">Latency (glass-to-glass)</th>
            <th class="p-3">Max Range</th>
            <th class="p-3">Primary Use</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700 text-xs">
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">DJI O3 Air Unit</td>
            <td class="p-3 text-slate-300">1080p/100fps; 4K/60fps recording</td>
            <td class="p-3 text-amber-400">~28 ms standard</td>
            <td class="p-3 text-slate-300">10 km</td>
            <td class="p-3 text-slate-300">Freestyle, cinematic, inspection</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-white font-bold">DJI O4 Air Unit Pro <span class="text-emerald-400">(Jan 2025)</span></td>
            <td class="p-3 text-slate-300">1080p/120fps FPV; 4K/60fps recording; 1/1.3" CMOS integrated</td>
            <td class="p-3 text-emerald-400">~15 ms (Race Mode); ~25 ms standard</td>
            <td class="p-3 text-slate-300">15 km</td>
            <td class="p-3 text-slate-300">Racing (Race Mode), cinematic; 40 Mbps video bitrate</td>
          </tr>
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">HDZero</td>
            <td class="p-3 text-slate-300">1080p/60fps; 720p/60fps</td>
            <td class="p-3 text-emerald-400">~16 ms — analog-comparable</td>
            <td class="p-3 text-slate-300">~2 km (5.8 GHz)</td>
            <td class="p-3 text-slate-300">Racing — consistent latency, open ecosystem</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-white font-bold">Walksnail Avatar</td>
            <td class="p-3 text-slate-300">1080p/60fps</td>
            <td class="p-3 text-amber-400">~22–30 ms standard</td>
            <td class="p-3 text-slate-300">~4 km</td>
            <td class="p-3 text-slate-300">Freestyle, general HD FPV</td>
          </tr>
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">Connex ProSight HX</td>
            <td class="p-3 text-slate-300">720p/60fps uncompressed</td>
            <td class="p-3 text-emerald-400">&lt;1 ms (uncompressed WHDI)</td>
            <td class="p-3 text-slate-300">300–1000 m LOS</td>
            <td class="p-3 text-slate-300">Uncompressed latency-free — legacy racing</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-white font-bold">COFDM (military/pro)</td>
            <td class="p-3 text-slate-300">HD/4K depending on system</td>
            <td class="p-3 text-amber-400">200–500 ms (H.264 codec pipeline)</td>
            <td class="p-3 text-slate-300">10–50 km (directional antenna)</td>
            <td class="p-3 text-slate-300">ISR, law enforcement, NLOS penetration</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ================================================================
         6.7 GROUND DATA LINKS, TELEMETRY, BLOS
    ================================================================ -->
    <h3>6.7 Ground Data Links: Telemetry, BLOS, and C2</h3>

    <h4>RFDesign RFD900x — Long-Range Telemetry Modem</h4>
    <p>The RFD900x is the de-facto standard long-range MAVLink telemetry modem for professional ArduPilot deployments. Key specs: 902–928 MHz (US FCC approved), 1 W output, −121 dBm sensitivity, 40+ km with directional antennas, selectable 4–250 kbps air data rate, SiK firmware (open-source), FHSS across configurable hop channels, native MAVLink framing (no mid-packet fragmentation), multipoint mesh topology support.</p>

    <h4>MAVLink Telemetry Bandwidth Budget</h4>
    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">Typical ArduPilot GCS Stream</div>
        <table class="w-full text-xs font-mono">
            <thead><tr class="bg-slate-800/50 text-slate-400"><th class="p-3 text-left">Message</th><th class="p-3 text-left">Rate</th><th class="p-3 text-left">Size</th><th class="p-3 text-left">Bandwidth</th></tr></thead>
            <tbody class="text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-white">HEARTBEAT (#0)</td><td class="p-3">1 Hz</td><td class="p-3">9 B</td><td class="p-3">9 B/s</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">SYS_STATUS (#1)</td><td class="p-3">1 Hz</td><td class="p-3">31 B</td><td class="p-3">31 B/s</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">GLOBAL_POSITION_INT (#33)</td><td class="p-3">10 Hz</td><td class="p-3">28 B</td><td class="p-3 text-amber-400">280 B/s</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">ATTITUDE (#30)</td><td class="p-3">10 Hz</td><td class="p-3">28 B</td><td class="p-3 text-amber-400">280 B/s</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">GPS_RAW_INT (#24)</td><td class="p-3">5 Hz</td><td class="p-3">30 B</td><td class="p-3">150 B/s</td></tr>
                <tr class="border-t border-slate-800 bg-slate-900/50"><td class="p-3 text-white">VFR_HUD (#74)</td><td class="p-3">4 Hz</td><td class="p-3">20 B</td><td class="p-3">80 B/s</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-white">RC_CHANNELS (#65)</td><td class="p-3">2 Hz</td><td class="p-3">42 B</td><td class="p-3">84 B/s</td></tr>
            </tbody>
        </table>
        <div class="p-3 bg-slate-800/30 text-xs font-mono text-slate-400 border-t border-slate-700 grid grid-cols-3 gap-3">
            <div><span class="text-white">Minimum viable:</span> ~2400 baud</div>
            <div><span class="text-white">Standard GCS:</span> ~9600 baud</div>
            <div><span class="text-emerald-400">Recommended:</span> 57600 baud</div>
        </div>
    </div>

    <h4>4G LTE / 5G Cellular BLOS C2 Links</h4>
    <p>Cellular networks provide beyond-line-of-sight (BLOS) C2 without dedicated RF infrastructure. The FAA approved 203 BVLOS waivers in 2024 (25% of all Part 107 waivers). Key characteristics:</p>
    <ul class="text-slate-300 text-sm space-y-1">
        <li><strong>LTE latency:</strong> 30–100 ms one-way — acceptable for autonomous waypoint following but marginal for manual control</li>
        <li><strong>5G Sub-6 GHz latency:</strong> 10–30 ms one-way; 5G mmWave: &lt;10 ms but requires line-of-sight to base station</li>
        <li><strong>Coverage limitation:</strong> Cellular coverage exists at ground level, not necessarily at altitude. At 120 m AGL, drone may connect to multiple cell towers simultaneously — can cause handoff issues</li>
        <li><strong>Reliability requirement:</strong> FAA C2 link design requires &lt;500 ms command latency for most BVLOS operations. LTE meets this; network congestion can violate it</li>
        <li><strong>Best practice:</strong> Use LTE as primary BLOS link with 900 MHz FHSS radio as redundant backup. Dual-modem approach (LTE + RC) is standard for professional BVLOS platforms</li>
    </ul>

    <h4>Satellite Links: Iridium 9603 and Starlink</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
        <strong class="text-sky-400 uppercase text-xs tracking-widest block mb-2">Iridium 9603 SBD</strong>
        <ul class="text-slate-300 text-xs space-y-1">
          <li><strong>Constellation:</strong> 66 LEO satellites — true polar global coverage</li>
          <li><strong>Protocol:</strong> Short Burst Data (SBD) — packet-based, not streaming</li>
          <li><strong>Message size:</strong> MO: 340 bytes max; MT: 270 bytes max</li>
          <li><strong>Latency:</strong> 20–60 seconds per message; 30 s minimum interval between transmissions</li>
          <li><strong>Power:</strong> 1.5–1.8 W peak TX; ~34 mA standby</li>
          <li><strong>Module dimensions:</strong> 42.8 × 29.0 × 7.0 mm — world's smallest satellite module</li>
          <li><strong>Use on drones:</strong> RockBLOCK integration with ArduPilot for telemetry-over-satellite in oceanic/polar BLOS operations; heartbeat and position reports only — not suitable for realtime control</li>
        </ul>
      </div>
      <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
        <strong class="text-emerald-400 uppercase text-xs tracking-widest block mb-2">Starlink (LEO Broadband)</strong>
        <ul class="text-slate-300 text-xs space-y-1">
          <li><strong>Constellation:</strong> 6,000+ LEO satellites at ~550 km orbit</li>
          <li><strong>Latency:</strong> 20–50 ms typical; engineering target 20 ms (2025+)</li>
          <li><strong>Throughput:</strong> 50–250 Mbps down; 10–40 Mbps up typical</li>
          <li><strong>Aviation:</strong> Demonstrated 64 Mbps down, 24 Mbps up in-flight; suitable for real-time HD video downlink from UAV</li>
          <li><strong>Terminal weight:</strong> Starlink Maritime/Aviation — too heavy for small UAV (3.5 kg terminal). Mini terminal announced for mobile platforms</li>
          <li><strong>Use on UAV:</strong> Large MALE/HALE UAVs (Predator-class), persistent ISR platforms; not yet viable for sub-25 kg UAVs</li>
        </ul>
      </div>
    </div>

    <!-- ================================================================
         6.8 MESH NETWORKING
    ================================================================ -->
    <h3>6.8 Mesh Networking for UAV Swarms</h3>
    <p>A mesh network allows every node to relay traffic for other nodes, creating a self-healing topology where no single link failure can isolate a node. This is critical for drone swarms operating beyond the range of a single GCS radio.</p>

    <figure class="my-6">
      <img src="images/m6_mesh_topology.svg" alt="Mesh network topology showing nodes connected to multiple peers with redundant paths" class="rounded-lg w-full max-w-xl mx-auto bg-white p-4">
      <figcaption class="text-gray-400 text-sm text-center mt-2">Full mesh topology: every node maintains direct links to all peers, providing maximum redundancy. In UAV swarms, partial mesh (each node links to 2–4 neighbors) is more practical. Source: <a href="https://commons.wikimedia.org/wiki/File:NetworkTopology-Mesh.svg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons</a> (public domain, Foobaz/Rehua)</figcaption>
    </figure>

    <h4>Doodle Labs Mesh Rider Radio (RM-2450)</h4>
    <p>The Doodle Labs RM-2450 is the most widely deployed commercial drone mesh radio as of 2025, used in defense, infrastructure inspection, and public safety UAV platforms.</p>
    <ul class="text-slate-300 text-sm space-y-1">
        <li><strong>Band:</strong> 2.4–2.482 GHz (WiFi band); also available in 900 MHz (RM-915) and 4.9/5.8 GHz variants</li>
        <li><strong>MIMO:</strong> 2×2 MIMO — two independent spatial streams</li>
        <li><strong>Throughput:</strong> 100 Mbps (40 MHz channel), 80 Mbps (20 MHz), 40 Mbps (10 MHz)</li>
        <li><strong>Latency:</strong> 3–30 ms for command &amp; control channel (URLLC mode)</li>
        <li><strong>Range:</strong> Field-proven &gt;100 km (LOS, directional antennas)</li>
        <li><strong>Topology modes:</strong> Mesh, AP, Client, Bridge, Internet Gateway — reconfigurable in flight</li>
        <li><strong>Security:</strong> AES encryption, MIL-spec rugged construction, IP66</li>
        <li><strong>SWaP:</strong> Low size-weight-power-cost (SWaP-C) — optimized for drone integration</li>
        <li><strong>Protocol:</strong> Doodle Labs proprietary Mesh Rider protocol — not standard 802.11 mesh (802.11s)</li>
    </ul>
    <p class="text-slate-400 text-sm mt-2">Reference: <a href="https://doodlelabs.com" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Doodle Labs product catalog</a></p>

    <h4>Rajant Kinetic Mesh (BreadCrumb Radios)</h4>
    <p>Rajant's BreadCrumb radios use InstaMesh protocol — a patented multi-radio, multi-hop MANET architecture used extensively in US military and mining operations. Key attributes:</p>
    <ul class="text-slate-300 text-sm space-y-1">
        <li><strong>Finch module (DX5):</strong> 47 g without heatsinks — designed for UAV swarm integration</li>
        <li><strong>DX Series:</strong> Up to 1.7 Gbps aggregate throughput with 2×2 MIMO; 2.2 GHz high-power radio delivers 6 W TX</li>
        <li><strong>Frequency agility:</strong> Simultaneously operates on multiple frequency bands (900 MHz, 2.4 GHz, 5.8 GHz) using separate radios per node</li>
        <li><strong>Security:</strong> AES-256, FIPS 140-2, SNMPv3, TLS</li>
        <li><strong>Self-healing:</strong> InstaMesh autonomously re-routes within milliseconds of link failure — no GCS coordination required</li>
        <li><strong>Military use:</strong> US Army, USMC, NATO partners; used in ISR drone swarms and autonomous ground vehicle comms</li>
    </ul>

    <h4>RF Link Comparison: ELRS vs Crossfire vs Doodle Labs vs 4G LTE</h4>
    <div class="overflow-x-auto my-4">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-700 text-slate-300">
          <tr>
            <th class="p-3">Parameter</th>
            <th class="p-3">ELRS 900 MHz</th>
            <th class="p-3">TBS Crossfire</th>
            <th class="p-3">Doodle Labs RM-2450</th>
            <th class="p-3">4G LTE Cellular</th>
            <th class="p-3">Rajant Finch</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700 text-xs">
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">Primary use</td>
            <td class="p-3 text-slate-300">RC control</td>
            <td class="p-3 text-slate-300">RC control</td>
            <td class="p-3 text-slate-300">Data / mesh / video</td>
            <td class="p-3 text-slate-300">BLOS C2 + data</td>
            <td class="p-3 text-slate-300">Military mesh</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-white font-bold">Typical range</td>
            <td class="p-3 text-emerald-400">30+ km</td>
            <td class="p-3 text-emerald-400">40+ km</td>
            <td class="p-3 text-emerald-400">100+ km (LOS)</td>
            <td class="p-3 text-amber-400">Coverage-dependent</td>
            <td class="p-3 text-emerald-400">Multi-hop unlimited</td>
          </tr>
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">Throughput</td>
            <td class="p-3 text-slate-300">~1 kbps telemetry</td>
            <td class="p-3 text-slate-300">~1 kbps telemetry</td>
            <td class="p-3 text-emerald-400">100 Mbps</td>
            <td class="p-3 text-emerald-400">10–150 Mbps</td>
            <td class="p-3 text-emerald-400">1.7 Gbps aggregate</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-white font-bold">Latency</td>
            <td class="p-3 text-emerald-400">1–40 ms</td>
            <td class="p-3 text-emerald-400">6.7 ms (150 Hz)</td>
            <td class="p-3 text-emerald-400">3–30 ms</td>
            <td class="p-3 text-amber-400">30–100 ms</td>
            <td class="p-3 text-emerald-400">&lt;10 ms</td>
          </tr>
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">Encryption</td>
            <td class="p-3 text-rose-400">None</td>
            <td class="p-3 text-amber-400">AES-128</td>
            <td class="p-3 text-emerald-400">AES</td>
            <td class="p-3 text-emerald-400">LTE/5G built-in</td>
            <td class="p-3 text-emerald-400">AES-256 FIPS 140-2</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-white font-bold">Infrastructure needed</td>
            <td class="p-3 text-emerald-400">None (P2P)</td>
            <td class="p-3 text-emerald-400">None (P2P)</td>
            <td class="p-3 text-emerald-400">Self-forming mesh</td>
            <td class="p-3 text-rose-400">Carrier towers</td>
            <td class="p-3 text-emerald-400">Self-forming mesh</td>
          </tr>
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">Cost</td>
            <td class="p-3 text-emerald-400">~$20–100</td>
            <td class="p-3 text-amber-400">~$200–400</td>
            <td class="p-3 text-rose-400">~$1,500–3,000</td>
            <td class="p-3 text-amber-400">~$50–200 + SIM</td>
            <td class="p-3 text-rose-400">$5,000–15,000+</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ================================================================
         6.9 SPECTRUM MANAGEMENT IN SWARMS
    ================================================================ -->
    <h3>6.9 Multi-Drone RF Spectrum Management</h3>
    <p>Operating drone swarms in the same airspace creates a self-interference problem. Multiple drones sharing the same RF band must coordinate to avoid packet collisions and mutual jamming.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">Swarm RF Access Strategy Matrix</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-2">TDMA (Time Division)</strong>
                <p class="text-slate-400 mb-2">Fixed time slots per node. Requires GPS PPS ±100 ns sync. Deterministic latency — ideal for military C2.</p>
                <ul class="text-slate-400 space-y-1">
                    <li>Best: known fixed swarm size, low-mobility ground nodes</li>
                    <li>Weakness: slot waste when idle, clock drift in fast UAVs</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-2">FDMA (Frequency Division)</strong>
                <p class="text-slate-400 mb-2">Disjoint FHSS channel groups per sub-swarm. No sync required. Bandwidth per node decreases as swarm grows.</p>
                <ul class="text-slate-400 space-y-1">
                    <li>Best: small swarms (&lt;10), heterogeneous hardware</li>
                    <li>Weakness: fixed allocation, spectrum inefficient at scale</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-2">Cognitive / CDMA</strong>
                <p class="text-slate-400 mb-2">Onboard SDR monitors occupancy. Centralized spectrum coordinator allocates channels dynamically. MIMO spatial multiplexing for co-channel isolation.</p>
                <ul class="text-slate-400 space-y-1">
                    <li>Best: 100+ nodes, contested RF environments, ISR/defense</li>
                    <li>Weakness: computational overhead, requires coordination infrastructure</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- ================================================================
         6.10 SHORT-RANGE: BLUETOOTH 5 AND UWB
    ================================================================ -->
    <h3>6.10 Short-Range RF: Bluetooth 5 Coded PHY and UWB Precision Landing</h3>

    <h4>Bluetooth 5 LE Coded PHY (Long Range)</h4>
    <p>Bluetooth 5.0 introduced the LE Coded PHY mode specifically for long-range, low-bandwidth applications. The physical layer uses 1 Mchip/s but encodes data at lower rates using forward error correction:</p>
    <ul class="text-slate-300 text-sm space-y-1">
        <li><strong>LE Coded S=2 (500 kbps):</strong> Each data bit encoded as 2 chips. ~2× range vs BLE 1M PHY. Sensitivity improvement ~4 dB.</li>
        <li><strong>LE Coded S=8 (125 kbps):</strong> Each data bit encoded as 8 chips. ~4× range vs BLE 1M PHY. Sensitivity improvement ~6 dB. Range of 1 km+ demonstrated in open field.</li>
        <li><strong>Drone telemetry use:</strong> 125 kbps is sufficient for slow telemetry (position, battery, status) from a nearby base station. Not suitable for video or high-rate MAVLink streams. Used in precision landing beacons, companion computer-to-phone configuration interfaces, and sUAS asset tracking.</li>
    </ul>
    <div class="bg-slate-800/60 border border-rose-700/40 rounded-xl p-4 mb-4">
      <p class="text-rose-400 text-sm font-bold mb-1">Common Error to Avoid</p>
      <p class="text-slate-300 text-sm">BT5 Coded PHY data rates are <strong>125 kbps or 500 kbps</strong> — not higher. The underlying chip rate is 1 Mchip/s but this is not the data rate. Any source citing BT5 Coded PHY rates above 500 kbps is incorrect. Standard BLE 1M and 2M PHY modes (1 Mbps and 2 Mbps) are different modes without the extended range FEC coding.</p>
    </div>

    <h4>UWB (Ultra-Wideband) for Precision Landing</h4>
    <p>UWB uses nanosecond pulses spread across &gt;500 MHz bandwidth (IEEE 802.15.4a/4z standard, 3.1–10.6 GHz). The wide bandwidth enables time-of-flight ranging with centimeter-level precision — unachievable with narrowband RF.</p>
    <ul class="text-slate-300 text-sm space-y-1">
        <li><strong>Ranging precision:</strong> ±10 cm (Decawave/Qorvo DW1000, DWM1000 modules)</li>
        <li><strong>Range:</strong> 10–100 m typical for drone landing applications</li>
        <li><strong>Typical architecture:</strong> 3–4 UWB anchors placed around the landing pad; 1 UWB tag on the drone. Two-way ranging (TWR) or Time Difference of Arrival (TDoA) computes 3D position.</li>
        <li><strong>GNSS-denied operation:</strong> UWB works indoors, in GPS-denied urban canyons, and under signal jamming — key for military precision landing on ship decks or inside hangars</li>
        <li><strong>ArduPilot integration:</strong> UWB position estimates fed into EKF as beacon-based position source via MAVLink LANDING_TARGET messages</li>
        <li><strong>Modules:</strong> Qorvo DW1000/DW3000 (formerly Decawave), NXP SR040, Apple/Google U1 chip (consumer variant)</li>
    </ul>

    <!-- ================================================================
         VIDEO EMBEDS
    ================================================================ -->
    <h3>6.11 Video Resources</h3>

    <div class="my-8">
      <h3 class="text-xl font-bold text-white mb-3">The Ultimate ExpressLRS Range Test — 100 km</h3>
      <p class="text-slate-400 text-sm mb-3">A field demonstration pushing ELRS 900 MHz to extreme range, illustrating the link budget principles covered in this module — receiver sensitivity, FSPL, and antenna gain all visible in practice.</p>
      <div class="relative w-full" style="padding-bottom: 56.25%;">
        <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/CYJ2UOrlXgM" title="The Ultimate ExpressLRS Range Test - 100KM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>
    </div>

    <div class="my-8">
      <h3 class="text-xl font-bold text-white mb-3">Link Budget Explained — Formula and Calculation</h3>
      <p class="text-slate-400 text-sm mb-3">Fundamental RF link budget methodology — FSPL formula, received power calculation, and link margin — directly applicable to drone RF system design covered in Section 6.2.</p>
      <div class="relative w-full" style="padding-bottom: 56.25%;">
        <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/M4uwV8HUDOI" title="Link Budget Explained | Formula and Calculation | Wireless Communication" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>
    </div>

    <!-- ================================================================
         6.12 SDR FOR RF AWARENESS
    ================================================================ -->
    <h3>6.12 Software Defined Radio (SDR) for RF Awareness</h3>
    <p>A drone equipped with an SDR can monitor its own RF environment — detecting interference sources, identifying occupied channels, and sniffing RF emissions from threats. SDR moves RF signal processing from dedicated hardware into software on a general-purpose CPU or GPU.</p>

    <div class="overflow-x-auto my-4">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-700 text-slate-300">
          <tr>
            <th class="p-3">Platform</th>
            <th class="p-3">Frequency Range</th>
            <th class="p-3">Sample Rate</th>
            <th class="p-3">TX Capable</th>
            <th class="p-3">Cost</th>
            <th class="p-3">Key Notes</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700 text-xs">
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">RTL-SDR v3</td>
            <td class="p-3 text-slate-300">500 kHz–1.766 GHz</td>
            <td class="p-3 text-slate-300">2.56 Msps</td>
            <td class="p-3 text-rose-400">No (RX only)</td>
            <td class="p-3 text-emerald-400">~$30</td>
            <td class="p-3 text-slate-300">RTL2832U + R820T2. ADS-B, ACARS, ELRS monitoring. Cannot cover 5.8 GHz.</td>
          </tr>
          <tr class="bg-slate-900">
            <td class="p-3 text-white font-bold">HackRF One</td>
            <td class="p-3 text-slate-300">1 MHz–6 GHz</td>
            <td class="p-3 text-slate-300">20 Msps</td>
            <td class="p-3 text-emerald-400">Yes (half-duplex)</td>
            <td class="p-3 text-amber-400">~$300</td>
            <td class="p-3 text-slate-300">Open hardware. Covers 5.8 GHz FPV band. Max TX 10–15 dBm.</td>
          </tr>
          <tr class="bg-slate-800">
            <td class="p-3 text-white font-bold">ADALM-PLUTO</td>
            <td class="p-3 text-slate-300">325 MHz–3.8 GHz (hacked: ~70 MHz–6 GHz)</td>
            <td class="p-3 text-slate-300">61.44 Msps</td>
            <td class="p-3 text-emerald-400">Yes (full-duplex)</td>
            <td class="p-3 text-amber-400">~$250</td>
            <td class="p-3 text-slate-300">AD9361 transceiver. Simultaneous TX+RX. Best for on-drone RF sensing at 900 MHz and 2.4 GHz.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-slate-400 text-sm">
      Deployment pattern: ADALM-PLUTO via USB 2.0 to Jetson Orin NX. GNU Radio flowgraph monitors 2.4 GHz and 5.8 GHz simultaneously. Detected interference triggers automatic channel migration in the ground station link. References:
      <a href="https://www.rtl-sdr.com" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">RTL-SDR project</a> |
      <a href="https://greatscottgadgets.com/hackrf/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">HackRF One (Great Scott Gadgets)</a>
    </p>

</div>
`;
