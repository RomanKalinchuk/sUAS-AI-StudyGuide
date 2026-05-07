export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 6</span>
    <h2>RF Communications & Link Management for AI Drones</h2>
    <p>Every autonomous drone mission is constrained by its communications architecture. The RF stack determines command latency, telemetry fidelity, video quality, and jamming resilience. This module dissects every layer — from the silicon transceiver to swarm-level spectrum coordination.</p>

    <h3>6.1 RC Link Architecture: ExpressLRS (ELRS)</h3>
    <p>ExpressLRS is the dominant open-source RC link for performance applications, built on Semtech LoRa transceivers. The critical design decision is the transceiver chip per band. <span class="text-amber-400 font-bold">Current firmware: ELRS v4.0.0</span> (February 2025) — a major release that drops STM32-based hardware (ESP32/ESP8285 only) and introduces doubled telemetry bandwidth in Gemini mode. ELRS v4.0.0 is incompatible with all v3.x hardware/firmware; upgrade both TX and RX together.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">ELRS Transceiver Hardware Matrix</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase text-xs tracking-widest block mb-2">900MHz Band — SX127x (SX1276/SX1278)</strong>
                <ul class="text-slate-300 text-xs space-y-1">
                    <li>Chip: Semtech SX1276 or SX1278 (depending on exact frequency)</li>
                    <li>Modulation: LoRa only (no FLRC support on SX127x)</li>
                    <li>Max packet rate: 200Hz at 900MHz (legacy SX127x hardware)</li>
                    <li>Receiver sensitivity: down to -123 dBm at 25Hz LoRa mode</li>
                    <li>Sensitivity at 100Hz: -117 dBm; at 250Hz: -111 dBm</li>
                    <li>Typical power: up to 1W (30 dBm) — varies by jurisdiction</li>
                    <li>Range (50Hz, 1W, dipole): 30+ km demonstrated</li>
                    <li class="text-amber-300">Next-gen: Semtech LR1121-based hardware (e.g., RadioMaster Nomad) achieves 1000Hz at 900MHz, matching 2.4GHz rates</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase text-xs tracking-widest block mb-2">2.4GHz Band — SX1280/SX1281/SX1282</strong>
                <ul class="text-slate-300 text-xs space-y-1">
                    <li>Chip: Semtech SX1280 — operates in 2.400–2.500 GHz ISM band</li>
                    <li>Modulation: LoRa AND FLRC (Fast Long Range Communication)</li>
                    <li>FLRC uses GFSK (Gaussian FSK) internally — not the same as standard FSK</li>
                    <li>Max packet rate: 500Hz (LoRa) or 1000Hz (FLRC)</li>
                    <li>Sensitivity at 500Hz LoRa: -105 dBm; at 50Hz LoRa: -115 dBm</li>
                    <li>Range (250Hz, 100mW, dipole): ~10 km demonstrated</li>
                </ul>
            </div>
        </div>
    </div>

    <h4>Modulation Deep Dive: LoRa vs FLRC</h4>
    <p>The choice between LoRa and FLRC within ELRS 2.4GHz is a latency-vs-range tradeoff at the modulation level:</p>
    <ul class="text-slate-300 text-sm space-y-2">
        <li><strong>LoRa (Chirp Spread Spectrum):</strong> Encodes data by sweeping frequency across a bandwidth (Chirp). Spreading factor SF6–SF12 controls range/rate tradeoff. Superior interference rejection — can decode signals 20 dB below the noise floor. Used for maximum range, up to 500Hz.</li>
        <li><strong>FLRC (Fast Long Range Communication):</strong> Semtech's proprietary mode using GFSK with forward error correction. Lower receiver sensitivity than LoRa but significantly lower air-time per packet. Enables 1000Hz packet rates with lower latency. The SX1280 FLRC mode is unique to the 2.4GHz chip — not available in SX127x.</li>
        <li><strong>DVDA (Dual VD Audio) modes:</strong> Hybrid variants with reduced jitter at cost of slightly higher latency than standard FLRC.</li>
    </ul>

    <h4>ELRS Packet Rates & Link Latency</h4>
    <p>Packet rate directly defines link latency. At 500Hz, the packet interval is 1/500 = 2ms. This is the fundamental link update period — not round-trip latency to the flight controller, but the interval between successive RC command packets reaching the receiver.</p>

    <div class="math-block">
        Packet interval = 1 / packet_rate<br><br>
        At 500 Hz:  interval = 1/500 = 2.0 ms<br>
        At 250 Hz:  interval = 1/250 = 4.0 ms<br>
        At 150 Hz:  interval = 1/150 = 6.7 ms  (Crossfire max in Shot mode)<br>
        At 100 Hz:  interval = 1/100 = 10.0 ms<br>
        At  50 Hz:  interval = 1/50  = 20.0 ms<br>
        At  25 Hz:  interval = 1/25  = 40.0 ms  (maximum range mode)
    </div>

    <p>Total system latency from stick input to motor response includes: stick ADC sampling (~1ms) + transmitter processing (~0.5ms) + air packet interval (2ms at 500Hz) + receiver UART output (~0.5ms) + flight controller loop (~2.5ms at 400Hz) = ~6.5ms total at 500Hz. Crossfire at 150Hz contributes ~6.7ms for the RF interval alone.</p>

    <h4>Telemetry Ratio</h4>
    <p>ELRS multiplexes downlink telemetry (RSSI, LQ, voltage, GPS position) into the same RF channel as uplink RC commands. The telemetry ratio controls how often a telemetry packet is substituted for a command packet. A ratio of 1:128 means 1 telemetry packet per 128 command packets. At 500Hz with 1:64 ratio, telemetry arrives at ~7.8Hz. Higher telemetry frequency degrades command link headroom and increases latency jitter. For racing, set ratio to Off or 1:256. For autonomous missions requiring telemetry, 1:16 or 1:32 is typical.</p>

    <h4>ELRS vs Crossfire (CRSF) vs FrSky R9: Technical Comparison</h4>
    <table class="w-full text-left border-collapse mt-4 mb-6 text-sm">
        <thead>
            <tr class="bg-slate-800 text-sky-400">
                <th class="p-3 border border-slate-700">Parameter</th>
                <th class="p-3 border border-slate-700">ELRS 2.4GHz</th>
                <th class="p-3 border border-slate-700">ELRS 900MHz</th>
                <th class="p-3 border border-slate-700">TBS Crossfire</th>
                <th class="p-3 border border-slate-700">FrSky R9</th>
            </tr>
        </thead>
        <tbody class="text-slate-300 font-mono text-xs">
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white">Transceiver</td>
                <td class="p-3 border border-slate-700">SX1280</td>
                <td class="p-3 border border-slate-700">SX1276/78</td>
                <td class="p-3 border border-slate-700">SX1272 (LoRa), proprietary</td>
                <td class="p-3 border border-slate-700">SX1276</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white">Max Packet Rate</td>
                <td class="p-3 border border-slate-700 text-emerald-400">1000 Hz (FLRC)</td>
                <td class="p-3 border border-slate-700 text-emerald-400">200 Hz</td>
                <td class="p-3 border border-slate-700 text-amber-400">150 Hz (CRSF Shot)</td>
                <td class="p-3 border border-slate-700 text-amber-400">50 Hz</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white">Link Interval @max</td>
                <td class="p-3 border border-slate-700 text-emerald-400">1ms (1000Hz)</td>
                <td class="p-3 border border-slate-700 text-emerald-400">5ms (200Hz)</td>
                <td class="p-3 border border-slate-700 text-amber-400">6.7ms</td>
                <td class="p-3 border border-slate-700 text-rose-400">20ms</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white">Max TX Power</td>
                <td class="p-3 border border-slate-700">250mW typical</td>
                <td class="p-3 border border-slate-700">1W (varies by region)</td>
                <td class="p-3 border border-slate-700 text-emerald-400">2W (2000mW)</td>
                <td class="p-3 border border-slate-700">1W</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white">Encryption</td>
                <td class="p-3 border border-slate-700 text-rose-400">None</td>
                <td class="p-3 border border-slate-700 text-rose-400">None</td>
                <td class="p-3 border border-slate-700 text-emerald-400">AES-128</td>
                <td class="p-3 border border-slate-700 text-rose-400">None</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white">Open Source</td>
                <td class="p-3 border border-slate-700 text-emerald-400">Yes</td>
                <td class="p-3 border border-slate-700 text-emerald-400">Yes</td>
                <td class="p-3 border border-slate-700 text-rose-400">No (proprietary)</td>
                <td class="p-3 border border-slate-700 text-rose-400">No</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white">Protocol to FC</td>
                <td class="p-3 border border-slate-700">CRSF (UART 400k baud)</td>
                <td class="p-3 border border-slate-700">CRSF</td>
                <td class="p-3 border border-slate-700">CRSF</td>
                <td class="p-3 border border-slate-700">SBUS / F.Port</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white">Channels</td>
                <td class="p-3 border border-slate-700">12 ch (Hybrid/Wide)</td>
                <td class="p-3 border border-slate-700">12 ch</td>
                <td class="p-3 border border-slate-700">16 ch</td>
                <td class="p-3 border border-slate-700">16 ch</td>
            </tr>
        </tbody>
    </table>

    <h3>6.2 Frequency Bands and Engineering Tradeoffs</h3>
    <p>The choice of RF band is not a preference — it is an engineering decision with direct consequences for link budget, antenna size, propagation physics, and regulatory compliance.</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
            <strong class="text-amber-400 uppercase text-xs tracking-widest block mb-3">900 MHz (ELRS 900)</strong>
            <ul class="text-slate-300 text-xs space-y-2">
                <li><strong class="text-slate-100">Wavelength:</strong> ~33 cm — antenna dipole ~16.5 cm</li>
                <li><strong class="text-slate-100">Free-space path loss (1km):</strong> ~91 dB</li>
                <li><strong class="text-slate-100">Obstacle penetration:</strong> Superior — lower frequency diffracts around terrain, trees, buildings. Fresnel zone is larger.</li>
                <li><strong class="text-slate-100">Max legal power (US/FCC Part 97):</strong> 1W ERP in unlicensed bands; up to 100W with ham license (916 MHz)</li>
                <li><strong class="text-slate-100">Congestion:</strong> Lower than 2.4GHz (fewer consumer devices)</li>
                <li><strong class="text-slate-100">Limitation:</strong> Max 200Hz packet rate with ELRS. Larger antennas on compact racing quads.</li>
                <li><strong class="text-slate-100">Best use:</strong> Long-range fixed-wing, survey UAV, FPV wings beyond visual line of sight</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
            <strong class="text-sky-400 uppercase text-xs tracking-widest block mb-3">2.4 GHz (ELRS 2.4)</strong>
            <ul class="text-slate-300 text-xs space-y-2">
                <li><strong class="text-slate-100">Wavelength:</strong> ~12.5 cm — antenna dipole ~6.25 cm</li>
                <li><strong class="text-slate-100">Free-space path loss (1km):</strong> ~100 dB (9 dB worse than 900MHz)</li>
                <li><strong class="text-slate-100">Obstacle penetration:</strong> Weaker — more absorption by leaves, walls, human bodies</li>
                <li><strong class="text-slate-100">Max legal power (US/FCC Part 15.247):</strong> 1W EIRP (30 dBm)</li>
                <li><strong class="text-slate-100">Congestion:</strong> High — shared with WiFi 802.11 b/g/n, Bluetooth, microwave ovens, ZigBee</li>
                <li><strong class="text-slate-100">Advantage:</strong> 1000Hz packet rate (FLRC), smallest antennas, ideal for racing</li>
                <li><strong class="text-slate-100">Best use:</strong> FPV racing (sub-1km), freestyle, indoor, applications requiring minimum latency</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-rose-500">
            <strong class="text-rose-400 uppercase text-xs tracking-widest block mb-3">5.8 GHz (Video Only)</strong>
            <ul class="text-slate-300 text-xs space-y-2">
                <li><strong class="text-slate-100">Wavelength:</strong> ~5.2 cm — patch/cloverleaf antenna ~2–3 cm</li>
                <li><strong class="text-slate-100">Free-space path loss (1km):</strong> ~113 dB (22 dB worse than 900MHz)</li>
                <li><strong class="text-slate-100">Obstacle penetration:</strong> Very poor — absorbed by vegetation and concrete</li>
                <li><strong class="text-slate-100">Max legal power (US):</strong> 25 mW typical VTX; up to 1W with Part 97 ham license</li>
                <li><strong class="text-slate-100">Primary use:</strong> FPV video downlink only — NOT used for RC control</li>
                <li><strong class="text-slate-100">Range:</strong> Typically 300m–2km depending on terrain and power</li>
                <li><strong class="text-slate-100">Channels:</strong> 40 standard channels (25 MHz spacing) — channel selection critical to avoid WiFi overlap</li>
            </ul>
        </div>
    </div>

    <div class="math-block">
        Friis Transmission Equation (link budget):<br><br>
        P_r = P_t + G_t + G_r - L_fs - L_misc<br><br>
        Free-space path loss: L_fs (dB) = 20*log10(d) + 20*log10(f) + 20*log10(4*pi/c)<br><br>
        At d=1000m, f=900MHz:  L_fs = 91.5 dB<br>
        At d=1000m, f=2.4GHz:  L_fs = 100.0 dB<br>
        At d=1000m, f=5.8GHz:  L_fs = 107.7 dB<br><br>
        ELRS 900MHz example: P_t = 30dBm, G_t = 2dBi, G_r = 2dBi, L_fs = 91.5dB<br>
        P_r = 30 + 2 + 2 - 91.5 = -57.5 dBm >> sensitivity floor of -123dBm (25Hz)<br>
        Link margin = 65.5 dB — extraordinary for a 900MHz system at 1km
    </div>

    <h3>6.3 FPV Video Links: Analog vs Digital</h3>
    <p>The FPV video link is entirely separate from the RC control link. It operates in the opposite direction (drone to pilot) and uses completely different modulation and encoding. The latency characteristics fundamentally determine which applications each system suits.</p>

    <h4>Analog FPV (NTSC/PAL Composite Video)</h4>
    <p>Analog video transmission sends raw composite video (interlaced 480i/576i) from the camera VTX (Video Transmitter) directly to the goggles without any digital encoding. There is no frame buffer, no compression codec, and no processing delay. The signal propagates at the speed of light through the RF chain. Glass-to-glass latency is dominated by the camera sensor exposure time and the phosphor/LCD response of the goggle display — typically <strong>3–5ms total</strong>, with the RF propagation contributing ~1ms or less at typical FPV ranges.</p>
    <ul class="text-slate-300 text-sm space-y-1 mt-2">
        <li><strong>Video standard:</strong> NTSC (29.97 fps) or PAL (25 fps) composite, 480i or 576i</li>
        <li><strong>VTX power:</strong> 25mW to 1000mW at 5.8GHz (1W requires ham license)</li>
        <li><strong>Latency:</strong> ~3–5ms glass-to-glass</li>
        <li><strong>Image quality:</strong> Low — susceptible to multipath interference manifesting as color noise, horizontal bars</li>
        <li><strong>Why still used for racing:</strong> Zero codec latency jitter (latency is always constant), extremely low cost, universal goggle compatibility, signal degrades gracefully (snow) vs digital cliff effect</li>
    </ul>

    <h4>Digital FPV Systems: Architecture and Latency</h4>
    <table class="w-full text-left border-collapse mt-4 mb-6 text-sm">
        <thead>
            <tr class="bg-slate-800 text-sky-400">
                <th class="p-3 border border-slate-700">System</th>
                <th class="p-3 border border-slate-700">Resolution</th>
                <th class="p-3 border border-slate-700">Latency (glass-to-glass)</th>
                <th class="p-3 border border-slate-700">Architecture</th>
                <th class="p-3 border border-slate-700">Primary Use</th>
            </tr>
        </thead>
        <tbody class="text-slate-300 text-xs">
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">DJI O3</td>
                <td class="p-3 border border-slate-700">1080p / 60fps</td>
                <td class="p-3 border border-slate-700 text-amber-400">~22ms standard; Race Mode not available on O3</td>
                <td class="p-3 border border-slate-700">Proprietary SDR waveform. DJI P1/S1 chipset with ARM cores (Linux), CEVA DSP for RF baseband. H.264/H.265 encoding.</td>
                <td class="p-3 border border-slate-700">Freestyle, cinematic, inspection</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white font-bold">DJI O4 Air Unit <span class="text-xs text-emerald-400 block font-normal">Jan 2025</span></td>
                <td class="p-3 border border-slate-700">1080p / 60fps; 4K/120fps recording; 1/1.3" sensor integrated</td>
                <td class="p-3 border border-slate-700 text-emerald-400">~15ms (O4 Pro Race Mode); ~20ms (standard); 40–60ms (4K recording)</td>
                <td class="p-3 border border-slate-700">Latest DJI system (released January 9, 2025). Integrated 4K camera vs O3's separate camera approach. Supports 8 aircraft simultaneously in Race Mode. 15km max range.</td>
                <td class="p-3 border border-slate-700">Racing (Race Mode), cinematic</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">HDZero</td>
                <td class="p-3 border border-slate-700">1080p / 60fps; 720p / 60fps</td>
                <td class="p-3 border border-slate-700 text-emerald-400">~16ms glass-to-glass; effectively analog-comparable</td>
                <td class="p-3 border border-slate-700">Joint source-channel coding — encodes video and FEC in one pass, eliminating separate codec buffer. One-way (no bidirectional link negotiation). 5.8GHz.</td>
                <td class="p-3 border border-slate-700">Racing (consistent latency), freestyle</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white font-bold">Walksnail Avatar</td>
                <td class="p-3 border border-slate-700">1080p / 60fps</td>
                <td class="p-3 border border-slate-700 text-amber-400">~22–30ms standard mode</td>
                <td class="p-3 border border-slate-700">Based on Caddx technology. H.264 encoding. Bidirectional link for OSD injection. 5.8GHz.</td>
                <td class="p-3 border border-slate-700">Freestyle, general HD</td>
            </tr>
        </tbody>
    </table>

    <p><strong>Engineering rationale for analog in racing:</strong> Competitive FPV racing requires deterministic, jitter-free latency. DJI O3/O4 standard mode latency can vary frame-to-frame by ±5ms due to codec pipeline variations and channel adaptation. HDZero and analog maintain near-constant latency. For inspection, infrastructure survey, or BVLOS operations, digital systems are mandatory: they provide sufficient resolution to identify structural defects (cracks, corrosion), GPS coordinates embedded in the OSD, and superior link reliability before the signal cliff.</p>

    <h3>6.4 Ground Data Links and Telemetry Modems</h3>
    <p>Separate from the RC control link, long-range MAVLink telemetry uses dedicated radio modems operating on 900MHz or 433MHz for ground station (GCS) connectivity over kilometers.</p>

    <h4>RFDesign RFD900x</h4>
    <p>The RFD900x is the de-facto standard long-range telemetry modem for professional ArduPilot deployments. Key specifications:</p>
    <ul class="text-slate-300 text-sm space-y-1">
        <li><strong>Band:</strong> 902–928 MHz (US) — FCC approved</li>
        <li><strong>Output power:</strong> Up to 1W (30 dBm)</li>
        <li><strong>Receiver sensitivity:</strong> -121 dBm</li>
        <li><strong>Demonstrated range:</strong> 40+ km with directional antennas</li>
        <li><strong>Air data rates:</strong> Selectable: 4, 8, 16, 19, 24, 32, 48, 64, 96, 128, 192, 250 kbps</li>
        <li><strong>UART baud rates:</strong> 9600 to 921600 baud (57600 default)</li>
        <li><strong>Firmware:</strong> SiK (open-source) — custom fork with enhanced features; 32-bit ARM processor on board</li>
        <li><strong>Network topologies:</strong> Point-to-point, multipoint asynchronous mesh</li>
        <li><strong>Spread spectrum:</strong> FHSS (Frequency Hopping Spread Spectrum) — configurable hop channels</li>
        <li><strong>MAVLink framing:</strong> Native — the modem understands MAVLink packet boundaries, avoids mid-packet fragmentation</li>
    </ul>

    <h4>SiK Firmware and Holybro/mRo SiK Radios</h4>
    <p>SiK (Silicon Labs radio firmware) is the open-source firmware powering the 3DR, Holybro, and mRo telemetry radios. The Holybro SiK V3 and mRo SiK are lower-cost alternatives to RFD900x, using the HM-TRP module (SiLabs Si1000 chip):</p>
    <ul class="text-slate-300 text-sm space-y-1">
        <li><strong>Power:</strong> 20 dBm (100mW maximum)</li>
        <li><strong>Sensitivity:</strong> -121 dBm</li>
        <li><strong>Air data rate:</strong> Up to 250 kbps</li>
        <li><strong>Range:</strong> ~300m to 2km typical with dipole antennas; several km with directional patch</li>
        <li><strong>FHSS:</strong> Synchronous adaptive TDM with frequency hopping — the two radios synchronize hop patterns at startup</li>
        <li><strong>Bands:</strong> 915 MHz (US) or 433 MHz (EU/Asia)</li>
        <li><strong>Configuration:</strong> Via AT commands over serial — same AT command set as Hayes modem standard</li>
    </ul>

    <h4>MAVLink Telemetry Bandwidth Requirements</h4>
    <p>Sizing the telemetry link requires understanding the MAVLink message stream. A standard ArduPilot telemetry stream contains:</p>

    <div class="math-block">
        MAVLink Bandwidth Budget (typical GCS stream):<br><br>
        HEARTBEAT          (MSG #0)   — 1 Hz    — 9 bytes/msg   — 9 B/s<br>
        SYS_STATUS         (MSG #1)   — 1 Hz    — 31 bytes/msg  — 31 B/s<br>
        GLOBAL_POSITION_INT(MSG #33)  — 10 Hz   — 28 bytes/msg  — 280 B/s<br>
        ATTITUDE           (MSG #30)  — 10 Hz   — 28 bytes/msg  — 280 B/s (50Hz for full telemetry)<br>
        GPS_RAW_INT        (MSG #24)  — 5 Hz    — 30 bytes/msg  — 150 B/s<br>
        VFR_HUD            (MSG #74)  — 4 Hz    — 20 bytes/msg  — 80 B/s<br>
        RC_CHANNELS        (MSG #65)  — 2 Hz    — 42 bytes/msg  — 84 B/s<br><br>
        Minimum viable stream (1Hz position/attitude): ~2400 baud (300 B/s)<br>
        Standard GCS stream (10Hz position, 10Hz attitude): ~9600 baud minimum<br>
        Full logging stream (50Hz attitude): ~57600 baud recommended<br><br>
        SiK default: 57600 baud — sufficient for full GCS stream with margin<br>
        RFD900x at 64kbps air rate: ~8000 B/s — handles all streams simultaneously
    </div>

    <h3>6.5 Encrypted and Secure RF Links</h3>
    <p>Standard consumer RC links (ELRS, FrSky) transmit in plaintext. An adversary with a spectrum analyzer can decode control packets. For professional and defense applications, purpose-built encrypted links are required.</p>

    <h4>Why Standard RC Links Are Not Encrypted</h4>
    <p>AES-128 encryption adds computational overhead and complicates key management. For hobby RC use, the threat model does not include adversarial interception. Crossfire (TBS) is an exception — it implements AES-128, but this is a proprietary implementation. ELRS explicitly documents that it provides no encryption and is not jam-resistant.</p>

    <h4>Military and Professional Encrypted Links</h4>
    <ul class="text-slate-300 text-sm space-y-2">
        <li><strong>Silvus Technologies StreamCaster (SC4400E, SC4200EP):</strong> MANET (Mobile Ad-hoc Network) radios for UAV swarms. AES-256 + FIPS 140-3 Level 2 certified encryption. Proprietary MN-MIMO waveform. Up to 10W TX power. Spectrum Dominance 2.0 suite: LPI/LPD (Low Probability of Intercept/Detection), anti-jamming, advanced threat protection. DoD certified for US military drone operations. Supports hundreds of nodes simultaneously. Used in intelligence, surveillance, and reconnaissance (ISR) platforms.</li>
        <li><strong>DragonLink:</strong> Long-range RC link with AES-128 encryption, 433MHz, 1.3GHz or 900MHz operation, marketed for professional BVLOS.</li>
        <li><strong>DJI Lightbridge / OcuSync:</strong> Proprietary SDR-based link with encryption, used in commercial DJI platforms. Not openly documented.</li>
    </ul>

    <h4>FHSS for Jam Resistance</h4>
    <p>Frequency Hopping Spread Spectrum (FHSS) pseudo-randomly hops the carrier frequency across a pre-agreed channel list on each packet. A narrowband jammer on a single frequency can only block the fraction of time spent on that frequency. A broadband noise jammer must spread power across the entire hop bandwidth, dramatically reducing effective jamming power spectral density (PSD).</p>

    <div class="math-block">
        FHSS Jam Resistance (Processing Gain):<br><br>
        Processing Gain (PG) = 10 * log10(Hop Bandwidth / Channel Bandwidth)<br><br>
        Example: SiK radio hopping across 50 channels of 125kHz bandwidth<br>
        Total hop bandwidth = 50 * 125kHz = 6.25 MHz<br>
        PG = 10 * log10(6.25MHz / 125kHz) = 10 * log10(50) = 17 dB<br><br>
        A jammer must be 17 dB stronger than its equivalent narrowband power to<br>
        achieve the same disruption. FHSS does NOT prevent detection or decoding<br>
        by a sophisticated adversary with a wideband receiver.
    </div>

    <h3>6.6 Software Defined Radio (SDR) for RF Awareness</h3>
    <p>A drone equipped with an SDR can monitor its own RF environment — detecting interference sources, identifying occupied channels, and even sniffing RF emissions from nearby threats. SDR moves RF signal processing from dedicated hardware into software running on a general-purpose CPU or GPU.</p>

    <h4>SDR Hardware Platforms</h4>
    <table class="w-full text-left border-collapse mt-4 mb-6 text-sm">
        <thead>
            <tr class="bg-slate-800 text-sky-400">
                <th class="p-3 border border-slate-700">Platform</th>
                <th class="p-3 border border-slate-700">Frequency Range</th>
                <th class="p-3 border border-slate-700">Sample Rate</th>
                <th class="p-3 border border-slate-700">TX Capable</th>
                <th class="p-3 border border-slate-700">Cost</th>
                <th class="p-3 border border-slate-700">Key Notes</th>
            </tr>
        </thead>
        <tbody class="text-slate-300 text-xs">
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">RTL-SDR</td>
                <td class="p-3 border border-slate-700">24 MHz – 1.766 GHz</td>
                <td class="p-3 border border-slate-700">2.56 Msps</td>
                <td class="p-3 border border-slate-700 text-rose-400">No (RX only)</td>
                <td class="p-3 border border-slate-700 text-emerald-400">~$30</td>
                <td class="p-3 border border-slate-700">RTL2832U + R820T2 tuner. Originally DVB-T USB dongle. Ideal for spectrum monitoring, ADS-B, ACARS. Cannot cover 5.8GHz.</td>
            </tr>
            <tr>
                <td class="p-3 border border-slate-700 text-white font-bold">HackRF One</td>
                <td class="p-3 border border-slate-700">1 MHz – 6 GHz</td>
                <td class="p-3 border border-slate-700">20 Msps</td>
                <td class="p-3 border border-slate-700 text-emerald-400">Yes (half-duplex)</td>
                <td class="p-3 border border-slate-700 text-amber-400">~$300</td>
                <td class="p-3 border border-slate-700">Open hardware. Covers entire 5.8GHz FPV band. Half-duplex (cannot TX and RX simultaneously). Max TX: 10–15 dBm.</td>
            </tr>
            <tr class="bg-slate-900/50">
                <td class="p-3 border border-slate-700 text-white font-bold">ADALM-PLUTO</td>
                <td class="p-3 border border-slate-700">325 MHz – 3.8 GHz (hack: ~70 MHz–6 GHz)</td>
                <td class="p-3 border border-slate-700">61.44 Msps</td>
                <td class="p-3 border border-slate-700 text-emerald-400">Yes (full-duplex)</td>
                <td class="p-3 border border-slate-700 text-amber-400">~$250</td>
                <td class="p-3 border border-slate-700">Analog Devices AD9361 transceiver. Full-duplex simultaneous TX+RX. Excellent for 900MHz and 2.4GHz drone bands. MATLAB/Python SDK. Best for on-drone RF sensing.</td>
            </tr>
        </tbody>
    </table>

    <h4>Software Stacks for RF Monitoring</h4>
    <ul class="text-slate-300 text-sm space-y-2">
        <li><strong>GNU Radio:</strong> The standard open-source signal processing framework. Python + C++ flowgraph model. Block-based processing pipeline. Can run on embedded Linux (Raspberry Pi, Jetson) at reduced sample rates. Use case: custom signal detectors for specific drone RC protocols.</li>
        <li><strong>SDRAngel:</strong> Full-featured open-source TX/RX SDR application. Supports RTL-SDR, HackRF, ADALM-PLUTO, LimeSDR. Built-in demodulators for AM, FM, SSB, LoRa, ADS-B, AIS. Key for on-drone spectrum awareness: can detect ELRS, Crossfire, 5.8GHz FPV channels in real-time, flag occupied channels.</li>
        <li><strong>Deployment on drone:</strong> ADALM-PLUTO via USB 2.0 to Jetson Orin NX. GNU Radio flowgraph monitors 2.4GHz and 5.8GHz simultaneously using spectrum sensing. Detected interference triggers automatic channel migration in the ground station link.</li>
    </ul>

    <h3>6.7 Multi-Drone RF Spectrum Management</h3>
    <p>Operating swarms of drones in the same airspace creates a self-interference problem: multiple drones sharing the same RF band must coordinate to avoid packet collisions and mutual jamming.</p>

    <h4>TDMA (Time Division Multiple Access) in UAV Swarms</h4>
    <p>TDMA divides time into fixed slots and assigns each drone exclusive use of the channel during its slot. A Ground Control Station (GCS) or elected master node allocates slots via a centralized schedule. Dynamic TDMA adapts slot allocation in real-time based on data demand and Quality of Service (QoS) requirements. Critical requirement: clock synchronization — all nodes must share a common time reference (typically GPS PPS signal, ±100ns accuracy) to respect slot boundaries. Doppler frequency shift in fast-moving UAVs can cause slot boundary drift, requiring guard intervals between slots.</p>

    <h4>FDMA (Frequency Division Multiple Access)</h4>
    <p>FDMA assigns each drone a separate sub-channel within the available spectrum. Simpler than TDMA (no synchronization required), but each node gets a narrower bandwidth slice, reducing throughput per node. Typical approach: divide the 2.4GHz ISM band into non-overlapping FHSS channel groups, with each drone or sub-swarm assigned a disjoint group. Interference between groups is bounded by adjacent-channel rejection of the transceiver front-end.</p>

    <h4>Cognitive Radio and Dynamic Spectrum Access</h4>
    <p>The state-of-the-art for large swarms uses Cognitive Radio Network (CRN) principles: each drone monitors spectrum occupancy in real-time (using onboard SDR or spectrum scanner), and the system opportunistically uses clear channels. A centralized spectrum coordinator (GCS or elected cluster head) collects occupancy data from all nodes and runs a spectrum allocation algorithm — essentially a constraint satisfaction problem minimizing inter-node interference while satisfying per-link throughput requirements. Silvus StreamCaster radios implement this via their MN-MIMO waveform with spatial multiplexing: multiple MIMO streams can coexist spatially because directional antenna beams provide spatial isolation.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">Swarm RF Architecture Decision Matrix</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-2">TDMA — Best For</strong>
                <ul class="text-slate-400 space-y-1">
                    <li>Deterministic latency requirements</li>
                    <li>GPS-synchronized nodes</li>
                    <li>Known, fixed swarm size</li>
                    <li>Low-mobility ground nodes</li>
                    <li>Military command/control links</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-2">FDMA — Best For</strong>
                <ul class="text-slate-400 space-y-1">
                    <li>Simple implementation</li>
                    <li>No synchronization infrastructure</li>
                    <li>Small swarms (&lt;10 drones)</li>
                    <li>Heterogeneous hardware</li>
                    <li>Consumer-grade FPV swarms</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-2">CDMA/Cognitive — Best For</strong>
                <ul class="text-slate-400 space-y-1">
                    <li>Large swarms (100+ nodes)</li>
                    <li>Dynamic entry/exit of nodes</li>
                    <li>Contested RF environments</li>
                    <li>Maximum spectrum efficiency</li>
                    <li>ISR and defense applications</li>
                </ul>
            </div>
        </div>
    </div>
</div>
`;
