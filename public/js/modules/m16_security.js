export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 16</span>
    <h2>Security &amp; Counter-UAS Systems</h2>
    <p>An autonomous drone is a networked, radio-dependent, GPS-reliant embedded system. Each of those dependencies is an attack surface. This module covers the complete threat landscape: protocol-level attacks, GPS spoofing and jamming, adversarial ML on vision systems, secure boot and firmware integrity, Remote ID compliance, NDAA regulatory compliance, and the Counter-UAS detection and defeat systems used to find and neutralize AI drone threats.</p>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-red-500 mb-6">
        <strong class="text-red-400 block mb-1">Legal Disclaimer — Offensive Techniques</strong>
        <p class="text-slate-400 text-sm">This module describes attack techniques for educational and defensive engineering purposes only. Unauthorized RF jamming, GPS spoofing, and protocol injection are federal felonies in the US (47 U.S.C. § 333; 18 U.S.C. § 1030). Only authorized government/military entities may legally operate electronic warfare or C-UAS defeat systems.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <h3>16.1 MAVLink Protocol Security</h3>
    <p>MAVLink is the dominant protocol for communication between the flight controller and ground control station (GCS) or companion computer. By default, <strong>MAVLink has no authentication</strong>. Any device that can transmit on the UART or UDP channel can send valid MAVLink messages, including <code>COMMAND_LONG</code> messages that arm motors, change flight modes, or trigger RTL.</p>

    <h4>MAVLink v2 Packet Signing (HMAC-SHA256)</h4>
    <p>MAVLink v2 introduced an optional signing mechanism. When enabled, 13 bytes are appended to each packet: a <strong>link ID</strong> (1 byte, identifies the connection), a <strong>timestamp</strong> (6 bytes, 1/10th milliseconds since epoch, strictly monotonically increasing), and a <strong>signature</strong> (6 bytes — the first 6 bytes of an SHA-256 HMAC over key + header + payload + CRC + link_id + timestamp). The signing key is 32 bytes, shared between the GCS and vehicle. Signing provides <em>authentication</em> but not <em>confidentiality</em> — the payload remains in cleartext.</p>

    <div class="insight-box">
        <div class="insight-label">Packet Signing = 13 Bytes of Authentication</div>
        <p class="text-slate-200 text-sm mt-1">Link ID (1B) + monotonic timestamp (6B) + 6-byte SHA-256 HMAC signature = 13 bytes appended per packet. The monotonic timestamp blocks replay attacks: old packets are rejected because their timestamp is before the receiver's last seen value.</p>
    </div>

    <details class="code-expand">
    <summary>Packet Structure ▼</summary>
    <div class="math-block">
        MAVLink v2 signed packet structure:<br><br>
        [magic:1][len:1][incompat_flags|SIGNED=0x01:1][compat_flags:1][seq:1][sysid:1][compid:1][msgid:3][payload:len][crc:2][link_id:1][timestamp:6][sig:6]<br><br>
        Signature = SHA256( secret_key + header + payload + crc + link_id + timestamp )[0:6]<br><br>
        Total signing overhead: 13 bytes per packet. Replay window: receiver rejects any packet with timestamp &le; last accepted timestamp for that link_id.
    </div>
    </details>

    <p>The monotonic timestamp prevents <strong>replay attacks</strong>: recording valid signed packets and re-transmitting them will be rejected because the timestamp in the replayed packet is older than the highest timestamp the receiver has seen. To enable in ArduPilot: set <code>SYSID_MYGCS</code> to match the GCS system ID, upload the 32-byte signing key via <code>mavproxy.py</code> using the <code>signing</code> command. Note: USB connections bypass signing — physical access to the USB port always allows unsigned commands.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Bash: Enabling MAVLink v2 signing via MAVProxy
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-bash"># Generate a 32-byte signing key (hex-encoded)
python3 -c "import os; print(os.urandom(32).hex())" > signing.key

# Connect and upload key to vehicle
mavproxy.py --master /dev/ttyUSB0 --baud 57600
# At MAVProxy prompt:
# signing generate signing.key        # generate key from file
# signing enable                      # enables signing on this link
# param set SYSID_MYGCS 255           # only accept commands from sysid 255

# Verify signing is active:
# "Signing is enabled" in mavproxy output
# Unsigned packets → rejected with MAV_RESULT_DENIED</code></pre>
        </div>
    </div>

    <h4>AES-256-GCM Link Encryption</h4>
    <p>MAVLink signing provides authentication but not confidentiality — the payload is in cleartext on the wire. For mission-sensitive data (waypoints, sensor readings, video links), full encryption at the transport layer is required. Two approaches are used in production systems:</p>
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Approach</th>
                    <th class="p-3">Mechanism</th>
                    <th class="p-3">Overhead</th>
                    <th class="p-3">Use Case</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-emerald-400 font-mono">WireGuard VPN</td>
                    <td class="p-3 text-slate-300">ChaCha20-Poly1305 tunnels all IP traffic (MAVLink-over-UDP, ROS 2 DDS, video)</td>
                    <td class="p-3 text-slate-400">~5 ms latency, &lt;10% throughput penalty</td>
                    <td class="p-3 text-slate-400">LTE/5G GCS ↔ companion computer link</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-emerald-400 font-mono">sMAVLink (AES-256-GCM)</td>
                    <td class="p-3 text-slate-300">Per-packet AES-GCM encryption with monotonically increasing IV; replaces MAVLink CRC</td>
                    <td class="p-3 text-slate-400">+28 bytes/packet (IV 12B + GCM tag 16B)</td>
                    <td class="p-3 text-slate-400">Serial UART links where VPN is infeasible</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-emerald-400 font-mono">SiK Radio AES-128</td>
                    <td class="p-3 text-slate-300">Hardware AES-128 in SiK v3 firmware — symmetric key programmed at bind time</td>
                    <td class="p-3 text-slate-400">Transparent (hardware accelerated)</td>
                    <td class="p-3 text-slate-400">900 MHz/433 MHz telemetry radio links</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">MAVLink Attack Taxonomy</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-red-500">
                <strong class="text-red-400 uppercase block mb-1">Replay Attack</strong>
                <p class="text-slate-400">Record valid MAVLink packets (e.g., a disarm sequence) and retransmit later. Defeated by v2 signing's monotonic timestamp — replayed timestamp is older than vehicle's last-seen-timestamp.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-orange-500">
                <strong class="text-orange-400 uppercase block mb-1">GCS Impersonation</strong>
                <p class="text-slate-400">Attacker connects to the telemetry radio and sends COMMAND_LONG with dangerous commands. Without signing, the vehicle accepts them. Mitigation: v2 signing + AES-128 on SiK radio link + SYSID whitelist.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                <strong class="text-yellow-400 uppercase block mb-1">Companion Computer Compromise</strong>
                <p class="text-slate-400">The companion computer (Jetson, Pi) is implicitly trusted by the FC. If malware runs on the companion, it can send arbitrary MAVLink. Mitigation: network-namespace isolation, MAVLink signing even on local UART links, AppArmor profiles.</p>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <h3>16.2 GPS Spoofing: Attacks and Countermeasures</h3>
    <p>GPS spoofing transmits counterfeit satellite signals at higher power than authentic signals (~−130 dBm at antenna). The receiver locks onto the strongest signal and navigates to the attacker-controlled false position. Incidents of GPS spoofing near conflict zones rose from dozens per day to over <strong>1,100 affected flights per day</strong> by mid-2024 (Eastern Europe, Middle East). Consumer SDR hardware (HackRF One, ~$300) can execute basic spoofing attacks.</p>

    <h4>Detection Methods</h4>
    <ul class="space-y-4">
        <li>
            <strong>Multi-constellation GNSS + correct GPS_GNSS_MODE bitmask:</strong> Enable all available constellations. A spoofer must simultaneously synthesize GPS (US), GLONASS (RU), Galileo (EU), and BeiDou (CN) signals — geometrically consistent with the false position — greatly increasing hardware complexity. ArduPilot's <code>GPS_GNSS_MODE</code> bitmask (bit 0 = GPS=0x01, bit 1 = SBAS=0x02, bit 2 = Galileo=0x04, bit 3 = BeiDou=0x08, bit 6 = GLONASS=0x40). Common production value: GPS+SBAS+Galileo+GLONASS = 0x01+0x02+0x04+0x40 = 71 (decimal). Note: do not enable more than 2–3 constellations on older M8 modules — timing instability may result.
        </li>
        <li>
            <strong>EKF IMU cross-check:</strong> ArduPilot's Extended Kalman Filter fuses GPS velocity with IMU-integrated velocity. If the EKF innovation (difference between GPS-predicted and IMU-predicted position) exceeds a threshold, the EKF flags GPS as potentially spoofed and can switch to dead-reckoning. Parameter: <code>EK3_CHECK_SCALE</code> controls the acceptable innovation ratio threshold.
        </li>
        <li>
            <strong>Signal power anomaly (AGC/C/N0 monitoring):</strong> Authentic GPS arrives at ~−130 dBm (constrained by 20,000 km path loss). Spoofed signals from a ground transmitter arrive at −90 to −110 dBm — 20–40 dB above authentic. AGC saturation and anomalous carrier-to-noise (C/N0) ratios trigger spoofing flags. u-blox modules expose <code>navStatus.flags2</code> with a hardware-derived spoofing detection bit.
        </li>
        <li>
            <strong>Galileo OSNMA (Navigation Message Authentication):</strong> Deployed November 2023. Uses the TESLA protocol to cryptographically sign Galileo navigation messages at the satellite. A spoofer cannot forge valid OSNMA authentication tags without EUSPA's root signing key. Authentication latency: ~30 s (TESLA requires delayed key revelation). Supported receivers: STM Teseo-LIV3R, u-blox NEO-D9S (via firmware update). Enable by including Galileo in <code>GPS_GNSS_MODE</code> with an OSNMA-capable receiver.
        </li>
        <li>
            <strong>Dual-antenna GNSS heading (u-blox ZED-F9P):</strong> Two antennas on a known 30–50 cm rigid baseline derive a heading independent of the magnetometer via "moving baseline" RTK. Spoofing both antennas simultaneously with phase-consistent signals at both positions greatly increases attack complexity. Heading accuracy: ~0.1° RMS. ArduPilot params: <code>GPS_TYPE2=17</code>, <code>GPS_MB1_OFS_X/Y/Z</code> (baseline vector). A GPS-derived heading vs. IMU/mag discrepancy &gt;5° raises a spoof flag.
        </li>
    </ul>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs font-mono">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2 font-sans text-sm">EKF IMU Cross-Check</strong>
            <p class="text-slate-400 font-sans text-xs mb-2">Compares GPS velocity against IMU-integrated velocity prediction:</p>
            <div class="text-slate-300 space-y-1">
                <div>Innovation = GPS_velocity &minus; IMU_predicted</div>
                <div>Test ratio = Innovation&sup2; &divide; variance</div>
                <div class="text-emerald-400 mt-2">If ratio &gt; EK3_CHECK_SCALE &rarr; flag GPS suspect</div>
                <div class="text-slate-400 mt-1">Fallback: IMU dead-reckoning for ~30 s max</div>
            </div>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2 font-sans text-sm">Signal Power Anomaly</strong>
            <p class="text-slate-400 font-sans text-xs mb-2">Real satellites are 20,000 km away. Spoofed signals come from meters away:</p>
            <div class="text-slate-300 space-y-1">
                <div>Authentic GPS L1: <span class="text-emerald-400">&sim;&minus;130 dBm</span></div>
                <div>Spoofed (SDR attack): <span class="text-rose-400">&minus;90 to &minus;110 dBm</span></div>
                <div class="text-amber-400 mt-2">20&ndash;40 dB above authentic &rarr; AGC / C/N0 flag</div>
                <div class="text-slate-400 mt-1">u-blox: navStatus.flags2 spoofDetState bit</div>
            </div>
        </div>
    </div>

    <figure class="my-6">
        <img src="images/m16_crpa_antenna.png" alt="CRPA controlled reception pattern antenna array for GPS anti-jamming and anti-spoofing" class="rounded-lg w-full max-w-sm mx-auto">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Controlled Reception Pattern Antenna (CRPA) — an array of spiral antenna elements that uses adaptive beamforming to steer nulls toward jammers/spoofers while maintaining gain toward authentic satellites. Source: <a href="https://commons.wikimedia.org/wiki/File:CRPA-GPS.png" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons, EPC2016, CC BY-SA 4.0</a></figcaption>
    </figure>

    <h4>Military Anti-Spoofing: SAASM, M-Code, and CRPA</h4>
    <p>Consumer GPS receivers use the unencrypted L1 C/A signal — spoofable by any SDR. Military receivers add cryptographic layers:</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Technology</th>
                    <th class="p-3">Signal</th>
                    <th class="p-3">Anti-Spoof Mechanism</th>
                    <th class="p-3">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-mono">SAASM</td>
                    <td class="p-3 text-slate-300">L1/L2 P(Y)-code</td>
                    <td class="p-3 text-slate-300">Encrypted P-code: receiver must hold a classified key to decode. Cannot be replicated without NSA key material.</td>
                    <td class="p-3 text-amber-400">Legacy — being replaced by M-Code</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-mono">M-Code GPS</td>
                    <td class="p-3 text-slate-300">L1/L2 M-code (BOC(10,5))</td>
                    <td class="p-3 text-slate-300">Higher signal power (+3 dB vs P(Y)), encrypted navigation data, separate military sub-band. Harder to jam AND spoof. Civilian signals separated in frequency/code space.</td>
                    <td class="p-3 text-emerald-400">Fully deployed GPS III; MGUE receivers in fielding</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-mono">CRPA Antenna</td>
                    <td class="p-3 text-slate-300">Any GNSS signal</td>
                    <td class="p-3 text-slate-300">4–7 element phased array performs adaptive null steering toward jammer/spoofer direction of arrival (DoA). Beam gain toward satellite directions maintained. Works at layer below receiver — feeds clean signal to any receiver type.</td>
                    <td class="p-3 text-emerald-400">Deployed on SUAS, manned aircraft, vehicles</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-mono">Galileo OSNMA</td>
                    <td class="p-3 text-slate-300">E1-B I/NAV</td>
                    <td class="p-3 text-slate-300">TESLA-based cryptographic authentication of navigation messages. Spoofer cannot forge tags without EUSPA root key. Civilian-accessible, no classification required.</td>
                    <td class="p-3 text-emerald-400">Full operational service Nov 2023</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <h3>16.3 RF Jamming, Detection, and FHSS</h3>
    <p>RC link jamming transmits high-power broadband noise on the control link frequency (2.4 GHz or 900 MHz), raising the noise floor until the receiver can no longer decode packets. From the drone's perspective, packet loss rises to 100% and the RC failsafe triggers. Jamming events increased dramatically in 2024–2025 in conflict-adjacent airspace.</p>

    <h4>ArduPilot RC Failsafe Response</h4>
    <p>When <code>FS_THR_ENABLE</code> is set (default: enabled), ArduPilot detects RC signal loss by monitoring the throttle channel. If it drops below <code>FS_THR_VALUE</code> (default: 975 µs PWM) for more than <code>FS_THR_DELAY</code> seconds (default: 1.0 s), it activates the failsafe action. Options: <code>FS_THR_ENABLE=1</code> → RTL; <code>=2</code> → continue mission if in Auto; <code>=3</code> → Land immediately. For AI/autonomous missions, value 2 is often correct: a jamming event should not abort an in-progress mission.</p>

    <h4>Jamming Detection via ELRS Link Statistics</h4>
    <p>ExpressLRS (ELRS) exposes link statistics on every telemetry packet: RSSI (dBm), SNR (dB), LQ (Link Quality, 0–100% packet receive rate). A legitimate RSSI drop due to distance is gradual and correlated with GPS distance-from-home increasing. A jamming event produces: RSSI drops 20–40 dB instantaneously, LQ drops to 0%, while GPS distance-from-home is static or slowly increasing. Detecting this pattern in a ROS 2 node monitoring the ELRS stats topic provides a reliable jamming indicator within 200 ms.</p>

    <h4>FHSS — Frequency Hopping Spread Spectrum</h4>
    <p>ELRS uses FHSS with a pseudo-random hopping sequence (derived from a shared bind code), switching to a new sub-channel every packet interval (4 ms in ELRS 250 Hz mode). An attacker must either barrage-jam the entire 2.4 GHz ISM band (83 MHz wide — requires high-power broadband transmitter) or use a follower jammer with &lt;4 ms reaction time (infeasible with consumer SDR).</p>

    <div class="bg-slate-800 p-4 rounded border-l-4 border-sky-500 text-sm text-slate-300 mb-8">
        <strong>Engineering note:</strong> ELRS FHSS provides resistance to <em>uncoordinated</em> jamming. It does not encrypt the link. For military applications, link-layer AES encryption (as in ATAK data links or Harris RF-7800 radios) is mandatory. WireGuard over LTE provides encrypted, non-jammable C2 as a backup link.
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Video: GPS Spoofing — Hijacking a Drone</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/g-f48o2WGqk" title="GPS Spoofing How to Hijack a Drone (or Yacht) — demonstrates HackRF One SDR attack" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-xs mt-2">Practical demonstration of GPS spoofing using a HackRF One SDR (~$300). Shows how counterfeit GPS signals override authentic satellite signals and redirect drone navigation. Understanding attack implementation is essential for designing detection countermeasures.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <h3>16.4 Secure Boot and Firmware Integrity</h3>

    <h4>STM32H7 Read-Out Protection (Pixhawk 6X)</h4>
    <p>The STM32H7 (used in Pixhawk 6X) implements Read-Out Protection (RDP) at three levels:</p>
    <ul class="space-y-2 text-sm text-slate-300">
        <li><strong class="text-emerald-400">Level 0</strong> — No protection. Full debug access via SWD/JTAG, flash readable. Default factory state.</li>
        <li><strong class="text-amber-400">Level 1</strong> — Flash is not readable via SWD but can be erased. Partial debug restriction. Recommended for field deployment.</li>
        <li><strong class="text-red-400">Level 2 (IRREVERSIBLE)</strong> — JTAG/SWD permanently disabled, flash locked, CPU only boots from internal flash. Setting this in the field prevents firmware extraction after capture. There is no regression path — once set, it cannot be undone.</li>
    </ul>

    <h4>ArduPilot Signed Firmware</h4>
    <p>ArduPilot supports signed bootloaders and firmware to prevent unauthorized code execution. The process uses a dual-key system: up to two OEM public-private key pairs plus an ArduPilot emergency rescue key held by senior developers. Once a signed bootloader is flashed, only firmware signed with authorized keys will execute — unsigned or differently-signed firmware is blocked. Key generation, signing, and bootloader flashing procedures are in <code>Tools/scripts/signing/README.md</code> in the ArduPilot repository.</p>

    <h4>DroneCAN Node Firmware Signing</h4>
    <p>The ArduRemoteID module (Remote ID broadcast node connected via DroneCAN/CAN bus) implements firmware signing and parameter locking. Security parameters (UAS serial, operator ID) can be locked — subsequent changes require a DroneCAN <code>SecureCommand</code> with a valid private key signature. The firmware update mechanism rejects images not signed by one of 5 trusted public keys (3 ArduPilot release keys + 2 OEM keys). This prevents a captured node from being reflashed with malicious firmware.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Bash: ArduPilot Signed Firmware Workflow
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-bash"># 1. Generate OEM key pair (Ed25519 recommended)
python3 Tools/scripts/signing/generate_keys.py --oem my_oem_key

# 2. Build a signed bootloader (Pixhawk6X target)
./waf configure --board Pixhawk6X --signing-key my_oem_key.pem
./waf bootloader
# Output: build/Pixhawk6X/bin/arducopter-bootloader-signed.bin

# 3. Build signed firmware
./waf copter --signing-key my_oem_key.pem
# Output: build/Pixhawk6X/bin/arducopter-signed.apj

# 4. Flash via MAVProxy
mavproxy.py --master /dev/ttyUSB0
# load secure bootloader first, then firmware
# After boot: only images signed by my_oem_key.pem will execute</code></pre>
        </div>
    </div>

    <h4>NVIDIA Jetson Orin Secure Boot (PKC + OTP Fuses)</h4>
    <p>Jetson Orin implements a hardware root of trust via one-time programmable (OTP) fuses. The on-die BootROM authenticates the boot chain using Public Key Cryptography (PKC) keys whose SHA-512 hash is burned into write-once fuse fields (<code>FUSE_PUBLIC_KEY</code>). The boot chain: BootROM &rarr; BCT (Boot Configuration Table) &rarr; Bootloader (UEFI) &rarr; Kernel. Each stage is verified before the next executes.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">PKC Algorithm</th>
                    <th class="p-3">Key Size</th>
                    <th class="p-3">Notes</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-mono">RSA-3072</td>
                    <td class="p-3 text-slate-300">3072-bit</td>
                    <td class="p-3 text-slate-400">Legacy PKCS#1 v1.5 padding. Supported but not preferred for new designs.</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-mono">ECDSA P-256</td>
                    <td class="p-3 text-slate-300">256-bit</td>
                    <td class="p-3 text-slate-400">NIST P-256 curve. Recommended for most deployments — compact signature, fast verification.</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-mono">ECDSA P-521</td>
                    <td class="p-3 text-slate-300">521-bit</td>
                    <td class="p-3 text-slate-400">Highest security level. Use for classified/NSS workloads.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <p>Fuse burning is irreversible (bits can only go 0&rarr;1, never 1&rarr;0). Once <code>SecurityMode</code> fuse is set to 0x1, all additional fuse write requests are blocked and the device will only boot images verified by the fused PKC key hash. The SHA-512 hash of the public key (not the key itself) is stored in fuses, saving fuse bits and preventing key extraction.</p>

    <h4>TPM 2.0 on Jetson (fTPM via OP-TEE)</h4>
    <p>Jetson Orin supports a Firmware TPM (fTPM) implemented as a Trusted Application running in OP-TEE Trusted Execution Environment (TEE). The fTPM exposes the full TPM 2.0 command set: sealed key storage, PCR-based attestation, NVRAM for secure parameter storage, and random number generation via the hardware TRNG. In a production drone build, the fTPM can seal the MAVLink signing key and WireGuard private key to PCR values representing the boot state — the keys are only accessible when the system boots from unmodified, expected firmware.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Bash: Jetson Orin PKC Fuse Burning (Jetson Linux BSP)
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-bash"># 1. Generate ECDSA P-256 key pair
openssl ecparam -genkey -name prime256v1 -noout -out oem_pkc.pem
openssl ec -in oem_pkc.pem -pubout -out oem_pkc_pub.pem

# 2. Generate SHA-512 hash of public key for fuse burning
python3 tegrasign_v3.py --pubkeyhash oem_pkc.pem oem_pkc_hash.txt

# 3. Create fuse configuration XML
cat > fuse_config.xml &lt;&lt;'EOF'
&lt;genericfuse MagicId="0x45535543"&gt;
  &lt;fuse name="PublicKeyHash" size="64" value="$(cat oem_pkc_hash.txt)"/&gt;
  &lt;fuse name="SecurityMode" size="1" value="0x1"/&gt;
&lt;/genericfuse&gt;
EOF

# 4. Burn fuses (IRREVERSIBLE — device must be in recovery mode)
# sudo odmfuse.sh -i &lt;chip_id&gt; --cfg fuse_config.xml --target-board jetson-orin-nx
# WARNING: SecurityMode=0x1 permanently disables unauthenticated boot</code></pre>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <h3>16.5 ROS 2 Security (SROS2 and DDS Security)</h3>
    <p>ROS 2 rides on DDS (Data Distribution Service) for inter-node communication. By default, DDS traffic is unencrypted and unauthenticated — any node on the same network segment can publish to any topic. SROS2 (Secure ROS2) adds three security capabilities to each DDS participant using the OMG DDS-Security standard:</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
        <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
            <strong class="text-sky-400 uppercase text-xs block mb-2">Authentication</strong>
            <p class="text-slate-400 text-xs">PKI-based X.509 certificates per node. Each ROS 2 node holds a cert signed by a shared CA. DDS participants mutually authenticate before exchanging any data — prevents rogue node injection.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
            <strong class="text-emerald-400 uppercase text-xs block mb-2">Access Control</strong>
            <p class="text-slate-400 text-xs">Per-node permissions XML signed by the governance CA. Each node declares exactly which topics it may publish/subscribe. A compromised sensor node cannot publish to <code>/cmd_vel</code> or <code>/arm</code> topics it wasn't authorized for.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
            <strong class="text-purple-400 uppercase text-xs block mb-2">Encryption (AES-GCM)</strong>
            <p class="text-slate-400 text-xs">RTPS traffic encrypted with AES-256-GCM symmetric keys negotiated during authenticated handshake. Each topic can be individually encrypted or left in plaintext (for high-bandwidth sensor data where latency matters).</p>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Bash: Setting up SROS2 security context (ROS 2 Humble)
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-bash"># 1. Create security keystore
ros2 security create_keystore /etc/ros2/security/keystore

# 2. Create per-node key material (CA-signed X.509 cert + key)
ros2 security create_key /etc/ros2/security/keystore /mavros_node
ros2 security create_key /etc/ros2/security/keystore /camera_node
ros2 security create_key /etc/ros2/security/keystore /planner_node

# 3. Create governance file (defines which topics to encrypt/sign)
# governance.xml specifies: encrypt /cmd_vel, /arm, /waypoints
# leave /camera/image_raw unencrypted (too high bandwidth)

# 4. Launch ROS node with security enabled
export ROS_SECURITY_KEYSTORE=/etc/ros2/security/keystore
export ROS_SECURITY_ENABLE=true
export ROS_SECURITY_STRATEGY=Enforce  # Reject nodes without valid certs
ros2 run mavros mavros_node --ros-args --enclave /mavros_node</code></pre>
        </div>
    </div>

    <p>The Technology Innovation Institute's SSRC project added PKCS#11 support to Fast DDS (the default RMW for ROS 2), enabling ROS 2 nodes to store their private keys in hardware security modules (HSMs) or the Jetson's fTPM rather than as plaintext files on disk. This prevents private key exfiltration even if the OS is compromised.</p>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <h3>16.6 Adversarial Machine Learning on Drone Vision</h3>
    <p>AI-equipped drones rely on deep neural network (DNN) vision models for obstacle avoidance, target detection, and landing zone identification. These models are vulnerable to <strong>adversarial examples</strong> — carefully crafted inputs that cause confidently wrong predictions while being imperceptible or seemingly innocuous to human observers.</p>

    <h4>Attack Taxonomy (2024)</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-red-400 block mb-2">Physical Adversarial Patches</strong>
            <p class="text-slate-400 text-xs mb-2">A printed or projected pattern placed in the drone's field of view causes the object detector to miss targets or misclassify them. Unlike digital perturbations, physical patches must be robust across viewing angles, lighting, and distances. Demonstrated in 2024 research: patches printed on paper caused YOLOv8 to fail to detect ground vehicles at 50–100 m altitude, with &gt;90% attack success rate.</p>
            <p class="text-slate-400 text-xs">Threat model: adversary places patch on rooftop, vehicle, or person to evade drone surveillance.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-red-400 block mb-2">Ensemble Black-Box Attacks</strong>
            <p class="text-slate-400 text-xs mb-2">Without model access, attacker queries the drone's perception system (e.g., via its tracking behavior in video feeds) to estimate gradients across multiple surrogate models. Frequency-decomposition perturbation generators decouple high-frequency and low-frequency components, reducing query count by 60% vs. naive black-box methods. Effective even when the target model architecture is unknown.</p>
            <p class="text-slate-400 text-xs">Threat model: adversary observes drone behavior to reverse-engineer and evade its detection model.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-orange-400 block mb-2">Sensor Spoofing via Optical Injection</strong>
            <p class="text-slate-400 text-xs mb-2">High-power pulsed laser or infrared LED strobes inject false returns into LiDAR point clouds or saturate camera sensors. A directed IR strobe can cause a camera to report a bright obstacle that doesn't exist, triggering avoidance maneuvers. LiDAR spoofing (false point injection) can be used to steer a drone away from valid landing zones.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-orange-400 block mb-2">Model Poisoning / Backdoor Injection</strong>
            <p class="text-slate-400 text-xs mb-2">If training data is sourced from untrusted datasets or the model supply chain is compromised, a backdoor trigger (specific visual pattern) can be embedded during training. When the trigger is shown to the deployed drone, the model executes a preset misclassification regardless of the actual scene. Supply chain attacks on pre-trained weights (e.g., via malicious Hugging Face model uploads) emerged as a key threat vector in 2024–2025.</p>
        </div>
    </div>

    <h4>Model Hardening Countermeasures</h4>
    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Technique</th>
                    <th class="p-3">Mechanism</th>
                    <th class="p-3">Cost</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400">Adversarial Training</td>
                    <td class="p-3 text-slate-300">Include adversarial examples (FGSM, PGD) in training data. Model learns to be robust to small perturbations by design. Standard PGD-AT improves robustness by 40–60%.</td>
                    <td class="p-3 text-slate-400">3–10x training time increase</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400">Input Preprocessing (Randomized Smoothing)</td>
                    <td class="p-3 text-slate-300">Add Gaussian noise to input before inference; run multiple forward passes and take majority vote. Certifiably robust within a defined &#8467;&sup2; perturbation radius.</td>
                    <td class="p-3 text-slate-400">N&times; inference latency (N = smoothing samples)</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400">Feature Squeezing</td>
                    <td class="p-3 text-slate-300">Apply spatial smoothing and bit-depth reduction to input. Compare original and squeezed predictions — large discrepancy indicates adversarial input.</td>
                    <td class="p-3 text-slate-400">Minimal: 1 extra forward pass</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400">Multi-Modal Cross-Check</td>
                    <td class="p-3 text-slate-300">Require consistency between camera, LiDAR, and IMU. An adversarial patch that fools the camera will not affect LiDAR returns. Discrepancy between modalities flags potential attack.</td>
                    <td class="p-3 text-slate-400">Requires multi-sensor hardware</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400">Model Integrity Verification</td>
                    <td class="p-3 text-slate-300">Cryptographic hash of deployed model weights stored in TPM NV-RAM at manufacturing time. Hash is re-checked at boot — detects weight tampering or unauthorized model swaps.</td>
                    <td class="p-3 text-slate-400">Negligible (hash check at boot only)</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Video: USENIX Security — GPS Spoofing and Takeover Attacks on UAVs</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/s1swSFObjhA" title="USENIX Security 2022 - An Experimental Study of GPS Spoofing and Takeover Attacks on UAVs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-slate-400 text-xs mt-2">USENIX Security 2022 academic presentation: systematic experimental study of GPS spoofing and control takeover attacks on commercial UAVs, covering attack implementation, detection gaps, and proposed mitigations. Peer-reviewed research directly applicable to defense engineering.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <h3>16.7 Counter-UAS Detection Technologies</h3>
    <p>Counter-UAS (C-UAS) systems use one or more detection modalities. Each has distinct range, accuracy, and environmental dependency characteristics. Production C-UAS installations layer multiple modalities for sensor fusion.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">C-UAS Detection Modality Comparison</h4>
        <div class="grid grid-cols-1 gap-4 text-sm">
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <div class="flex justify-between items-start mb-2">
                    <strong class="text-sky-400">RF Detection (Passive)</strong>
                    <span class="text-xs text-slate-500 font-mono">Range: 1–5 km</span>
                </div>
                <p class="text-slate-400 text-xs mb-2">Passive monitoring for drone RC/video transmission frequencies. <strong>Dedrone DedroneDefender 2</strong> (AI-powered smart jammer launched 2024) and the DroneTracker platform use SDR to fingerprint drone RF emissions: DJI OcuSync/O3 occupies specific 5.8 GHz sub-bands with characteristic OFDM pilot patterns; Parrot uses Wi-Fi 802.11ac. ML classifiers trained on IQ samples can identify drone type with &gt;95% accuracy at 500 m in uncontested RF environments.</p>
                <p class="text-slate-400 text-xs"><strong>Limitation:</strong> Fails for analog video links and does not detect autonomous drones operating without an active RC link (increasingly common in FPV combat drones).</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <div class="flex justify-between items-start mb-2">
                    <strong class="text-emerald-400">Acoustic Detection</strong>
                    <span class="text-xs text-slate-500 font-mono">Range: &lt;400 m</span>
                </div>
                <p class="text-slate-400 text-xs mb-2">Multi-element microphone arrays (4–8 microphones) apply beamforming (Delay-and-Sum or MVDR/Capon) to spatially filter drone motor harmonics. Blade-passage frequency: BPF = (RPM / 60) &times; N_blades. A 2-blade 5040 prop at 8000 RPM generates 267 Hz. CNN classifiers trained on drone acoustic spectrograms achieve ~92% detection in quiet environments. Used by D-Fend Solutions in layered configurations.</p>
                <p class="text-slate-400 text-xs"><strong>Limitation:</strong> SNR collapses in urban noise. Maximum practical range &lt;400 m. Fails for fixed-wing UAS with lower acoustic signature.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <div class="flex justify-between items-start mb-2">
                    <strong class="text-amber-400">FMCW Radar (Micro-Doppler)</strong>
                    <span class="text-xs text-slate-500 font-mono">Range: 1–5 km</span>
                </div>
                <p class="text-slate-400 text-xs mb-2">FMCW radar analyzes Doppler spectrum: drone body produces one translational Doppler shift; spinning rotors produce symmetric sideband spread at &plusmn;BPF — unique to rotating-blade aircraft, distinguishing drones from birds, vehicles, and humans. Systems: <strong>Echodyne EchoFlight</strong> (electronically-scanned phased array), <strong>Robin Radar Systems</strong>. A phased-array radar can track 50+ objects simultaneously. DoD DIU selected 10 C-sUAS participants for the Falcon Peak 25.2 exercise (Sep 2025) including radar-based solutions.</p>
                <p class="text-slate-400 text-xs"><strong>Limitation:</strong> Small drones at low altitude masked by ground clutter below minimum elevation angle. Cost: $50k–$500k per unit.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <div class="flex justify-between items-start mb-2">
                    <strong class="text-purple-400">Optical / Thermal EO/IR</strong>
                    <span class="text-xs text-slate-500 font-mono">Range: 200 m – 2 km</span>
                </div>
                <p class="text-slate-400 text-xs mb-2">Camera-based detection using AI classifiers (YOLOv8 or RT-DETR fine-tuned on drone datasets). A DJI Mavic 3 at 500 m subtends ~0.06° of arc — only ~16 pixels wide in a 4K camera with 70° FoV. FLIR MWIR thermal cameras (3–5 µm) are effective at night: drone motors and electronics create a 20–40°C differential from sky background. Systems: <strong>Dedrone DroneTracker</strong>, <strong>Fortem Technologies TrueView</strong>. D-Fend EnforceAir2 fuses RF-cyber detection with optional EO/IR for 360° coverage to 4.5 km detection range.</p>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <h3>16.8 Counter-UAS Defeat Systems (2024–2025)</h3>
    <p>Detection identifies the threat. Defeat is the kinetic or non-kinetic neutralization of it. The threat landscape in 2024–2025 is dominated by low-cost FPV combat drones (sub-$500 one-way attack platforms) requiring cost-effective defeat solutions — traditional $100k+ interceptor missiles are economically unsustainable against $500 targets.</p>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-red-500 mb-6">
        <strong class="text-red-400 block mb-1">Legal Context</strong>
        <p class="text-slate-400 text-sm">In the US and most NATO jurisdictions, RF jamming and GPS jamming are illegal for non-government actors (47 U.S.C. &sect; 333). Only specifically authorized federal agencies (FAA, DoD, DHS, DOJ) may operate RF defeat systems. Operating unauthorized C-UAS defeat equipment is a federal felony. Technologies below are described for authorized government/military operations.</p>
    </div>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">System</th>
                    <th class="p-3">Mechanism</th>
                    <th class="p-3">Range</th>
                    <th class="p-3">Collateral</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-red-400 font-semibold">RF Jamming<br><span class="text-xs text-slate-400 font-normal">Dedrone DedroneDefender 2, Dronebuster</span></td>
                    <td class="p-3 text-slate-300 text-xs">Broadband noise on 2.4/5.8 GHz RC/video links. Breaks uplink, triggers drone failsafe (RTL or Land). Ineffective against autonomous drones with no active RC link.</td>
                    <td class="p-3 text-slate-400 text-xs">500 m – 2 km</td>
                    <td class="p-3 text-rose-400 text-xs">Wi-Fi, other drones, some 5G bands</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-red-400 font-semibold">GPS Denial</td>
                    <td class="p-3 text-slate-300 text-xs">Broadband L1/L2 (1575/1227 MHz) jamming. Causes all GNSS in the affected area to lose fix. Drone triggers GPS failsafe: hover then Land. High collateral — disables friendly navigation, timing systems.</td>
                    <td class="p-3 text-slate-400 text-xs">100 m – 5 km</td>
                    <td class="p-3 text-rose-400 text-xs">All GNSS in area — aviation, vehicles, critical infrastructure timing</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-orange-400 font-semibold">RF Cyber Takeover<br><span class="text-xs text-slate-400 font-normal">D-Fend EnforceAir2</span></td>
                    <td class="p-3 text-slate-300 text-xs">Reverse-engineers the target drone's protocol (OcuSync, ELRS, Wi-Fi), injects spoofed control frames to seize control. Commands drone to a pre-defined safe landing zone. Non-destructive — preserves forensic evidence. EnforceAir2: 4.5 km detection, 1.2–4 km takeover range, 360° coverage.</td>
                    <td class="p-3 text-slate-400 text-xs">1.2 – 4 km</td>
                    <td class="p-3 text-emerald-400 text-xs">Minimal — targeted only</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-semibold">Net Capture<br><span class="text-xs text-slate-400 font-normal">Fortem DroneHunter, SkyWall (OpenWorks)</span></td>
                    <td class="p-3 text-slate-300 text-xs">AI interceptor drone (DroneHunter) autonomously chases and fires a net tether. SkyWall is a shoulder-fired net launcher. Non-destructive — preserves drone for forensics. Effective against hovering/slow targets (&lt;60 mph). SkyWall 100: single-shot net, parachute recovery.</td>
                    <td class="p-3 text-slate-400 text-xs">100 – 500 m</td>
                    <td class="p-3 text-emerald-400 text-xs">Zero RF collateral; physical debris risk</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-amber-400 font-semibold">Directed Energy (DEW)</td>
                    <td class="p-3 text-slate-300 text-xs">HPM (High Power Microwave) damages electronics; laser DEW thermally destructs airframe. SHORAD DEW programs experimental as of 2025. High cost, requires precise pointing. Laser DEW effective in clear air; highly attenuated by rain/fog.</td>
                    <td class="p-3 text-slate-400 text-xs">100 m – 2 km</td>
                    <td class="p-3 text-amber-400 text-xs">Fragmentation (HPM); laser eye hazard</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-400 font-semibold">Kinetic Defeat<br><span class="text-xs text-slate-400 font-normal">Coyote Block 3, MSHORAD Stinger</span></td>
                    <td class="p-3 text-slate-300 text-xs">Interceptor missiles, autocannon (Rafael Drone Dome), or trained gunners. High cost-per-kill ($50k–$200k interceptor vs. $500 FPV drone). Effective for military zone defense. Collateral fragmentation limits civilian application.</td>
                    <td class="p-3 text-slate-400 text-xs">500 m – 10 km</td>
                    <td class="p-3 text-rose-400 text-xs">High — fragmentation over populated areas</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <h3>16.9 Remote ID: Compliance, Security, and Enforcement</h3>
    <p>FAA Remote ID became mandatory for all registered UAS in the United States as of <strong>16 September 2023</strong> (rule-making) with <strong>hard enforcement beginning 16 March 2024</strong> (end of discretionary period). EU equivalent: EU Regulation 2019/945 (January 2024). Operators not in compliance after March 2024 face fines and certificate suspension. The FAA Reauthorization Act of 2024 directed the FAA to review whether alternative means of compliance (including Network Remote ID via cellular) can satisfy the intent of the rule.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Broadcast Mechanism — ASTM F3411-22a</h4>
            <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                <li><strong>Transport options:</strong> Bluetooth 5 Long Range (BT5 LE Coded PHY, 125 kbps for S8 coded, 500 kbps for S2 coded) or IEEE 802.11 Wi-Fi Beacon frame. DJI O3 hardware broadcasts on both simultaneously.</li>
                <li><strong>Broadcast interval:</strong> &ge; 1 Hz (one packet per second minimum)</li>
                <li><strong>Range:</strong> BT5 LR &asymp; 300 m; Wi-Fi Beacon &asymp; 1–3 km line-of-sight</li>
                <li><strong>Data fields:</strong> UA serial number or session ID, operator ID, operator GPS lat/lon, UA lat/lon (WGS-84), geodetic altitude (m), barometric altitude (m), horizontal velocity (m/s), vertical velocity (m/s), Unix timestamp, emergency status byte</li>
                <li><strong>Authentication:</strong> None in ASTM F3411-22a. Cryptographic authentication on roadmap for future revision. Network Remote ID (via FAA-authorized USS over LTE/5G) provides server-side audit trail.</li>
                <li><strong>OpenDroneID:</strong> Open-source implementation (ESP32 + BT5 hardware) supporting both Broadcast and Network Remote ID. ArduPilot native support via DroneCAN-connected RemoteID module.</li>
            </ul>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">Security Vulnerabilities &amp; C-UAS Use</h4>
            <ul class="text-slate-300 text-xs list-disc pl-4 space-y-1">
                <li><strong>Identity spoofing:</strong> Any ESP32 or BT5 microcontroller running OpenDroneID firmware can broadcast arbitrary UA IDs and fake GPS coordinates. Demonstrated at DEF CON 2023. Source tools on GitHub.</li>
                <li><strong>Phantom swarm attack:</strong> A single transmitter cycling through hundreds of UA IDs floods C-UAS displays with false tracks, masking a real threat in manufactured clutter.</li>
                <li><strong>Operator location exposure:</strong> Broadcast includes operator's GPS coordinates in plaintext — receivable by any BT5 scanner within 300 m. Force-protection risk in contested environments: adversary can geolocate the remote pilot.</li>
                <li><strong>Passive C-UAS detection:</strong> BT5/Wi-Fi scanners enumerate all compliant UAS within 1–3 km and extract operator location — instant geolocation without alerting the pilot.</li>
                <li><strong>Mitigation:</strong> Network Remote ID over LTE/5G provides cryptographically logged server-side audit trail resistant to local spoofing, at the cost of cellular connectivity requirement.</li>
            </ul>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <h3>16.10 NDAA Compliance and the Chinese UAS Ban</h3>
    <p>US policy has progressively restricted Chinese-manufactured UAS from federal procurement and use. Understanding the legislative history is critical for defense engineers specifying UAS platforms for US government or DoD programs.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Legislation</th>
                    <th class="p-3">Key Provision</th>
                    <th class="p-3">Status (as of June 2026)</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-mono">NDAA FY2020<br>Section 848</td>
                    <td class="p-3 text-slate-300 text-xs">Banned the Pentagon from procuring Chinese-manufactured UAS or components (DJI, Autel explicitly named). No federal funds may be used to purchase equipment from covered entities.</td>
                    <td class="p-3 text-emerald-400 text-xs">In force. Pentagon cannot procure DJI/Autel hardware.</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-mono">NDAA FY2025<br>Section 1709</td>
                    <td class="p-3 text-slate-300 text-xs">Required a national security agency to determine by December 23, 2025 whether DJI, Autel, and affiliates pose "unacceptable risk" to US national security. If no determination by deadline, FCC must automatically add them to the Covered List.</td>
                    <td class="p-3 text-emerald-400 text-xs">Deadline passed. FCC action triggered.</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-sky-400 font-mono">FCC Covered List<br>December 2025</td>
                    <td class="p-3 text-slate-300 text-xs">FCC added Chinese-manufactured UAS and critical UAS components to its Covered List. New DJI/Autel models cannot receive FCC equipment authorization — ineligible for US market sale or federal purchase. Existing certified models remain legal to operate; software updates and hardware add-ons for existing agency fleet are restricted.</td>
                    <td class="p-3 text-rose-400 text-xs">Active. New DJI/Autel models blocked from US market.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500 mb-6">
        <strong class="text-amber-400 block mb-1">Engineering Implication: Blue UAS Program</strong>
        <p class="text-slate-400 text-sm">For DoD and federal agency programs, the <strong>Blue UAS Cleared List</strong> (Defense Innovation Unit) is the authoritative list of approved, supply-chain-vetted UAS platforms. As of 2025, approved platforms include Skydio X10D, Parrot ANAFI USA, senseFly eBee X (AgEagle), and Altavian Nova F6480. Engineers specifying platforms for DoD/federal work must verify Blue UAS clearance status before procurement. Contact: <a href="https://www.diu.mil/blue-uas" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">diu.mil/blue-uas</a>.</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <h3>16.11 Security Architecture for a Production AI Drone</h3>
    <p>A defense-in-depth architecture applies security controls at every layer. No single control is sufficient — the stack must assume each layer can be compromised and provide compensating controls at the next layer.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Defense-in-Depth Security Stack</h4>
        <div class="space-y-2 text-xs font-mono">
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-red-400 w-36 flex-shrink-0">Hardware Root</span>
                <span class="text-slate-300">STM32H7 RDP Level 2 (irreversible, operational) + Jetson Orin ECDSA P-256 PKC OTP fuse burn + TPM 2.0 fTPM key sealing to boot PCRs</span>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-orange-400 w-36 flex-shrink-0">Firmware</span>
                <span class="text-slate-300">ArduPilot signed firmware (dual-key: OEM + ArduPilot rescue) + DroneCAN node SecureCommand parameter locking + model weight hash stored in TPM NV-RAM</span>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-amber-400 w-36 flex-shrink-0">GNSS Layer</span>
                <span class="text-slate-300">GPS_GNSS_MODE=71 (GPS+SBAS+Galileo+GLONASS) + EKF3 GPS innovation monitor + u-blox AGC/C/N0 spoofing flag + Galileo OSNMA-capable receiver + ZED-F9P dual-antenna heading</span>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-yellow-400 w-36 flex-shrink-0">RF / RC Layer</span>
                <span class="text-slate-300">ELRS FHSS RC link + RSSI/LQ/SNR anomaly monitor → auto RTL on jam event + WireGuard-over-LTE encrypted backup C2 link</span>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-sky-400 w-36 flex-shrink-0">FC Protocol</span>
                <span class="text-slate-300">MAVLink v2 signing (32-byte HMAC-SHA256 key, monotonic timestamp) + SYSID_MYGCS whitelist + SiK AES-128 radio + WireGuard for IP-over-LTE GCS link</span>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-emerald-400 w-36 flex-shrink-0">ROS 2 / DDS</span>
                <span class="text-slate-300">SROS2 DDS-Security (X.509 per-node auth + AES-256-GCM encryption on /cmd_vel, /arm, /waypoints) + AppArmor profiles + PKCS#11 private key in fTPM</span>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-purple-400 w-36 flex-shrink-0">AI/ML Models</span>
                <span class="text-slate-300">Adversarial-trained weights (PGD-AT) + feature squeezing detector + multi-modal LiDAR/camera cross-check + model integrity hash in TPM NV-RAM</span>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-slate-400 w-36 flex-shrink-0">Compliance</span>
                <span class="text-slate-300">Remote ID (ASTM F3411-22a broadcast + Network RID over LTE for classified ops) + Blue UAS Cleared List hardware + NDAA Section 848 / FCC Covered List exclusion verification</span>
            </div>
        </div>
    </div>

    <h3>External References</h3>
    <ul class="text-sm space-y-2 text-slate-300">
        <li><a href="https://mavlink.io/en/guide/message_signing.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">MAVLink v2 Message Signing Specification — mavlink.io</a></li>
        <li><a href="https://docs.nvidia.com/jetson/archives/r36.5/DeveloperGuide/SD/Security/SecureBoot.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">NVIDIA Jetson Orin Secure Boot Developer Guide (JetPack 6.x)</a></li>
        <li><a href="https://docs.ros.org/en/humble/Tutorials/Advanced/Security/Introducing-ros2-security.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">SROS2 Security Tutorial — ROS 2 Humble Documentation</a></li>
        <li><a href="https://ardupilot.org/dev/docs/secure-firmware.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">ArduPilot Tamperproof / Signed Firmware — Developer Docs</a></li>
        <li><a href="https://www.faa.gov/uas/getting_started/remote_id" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">FAA Remote ID for Drones — Official Rule and Compliance Resources</a></li>
        <li><a href="https://store.astm.org/f3411-22a.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">ASTM F3411-22a — Standard Specification for Remote ID and Tracking</a></li>
        <li><a href="https://www.diu.mil/blue-uas" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">DIU Blue UAS Cleared List — Defense Innovation Unit</a></li>
        <li><a href="https://www.gpsworld.com/combating-jamming-and-spoofing/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">GPS World: Combating Jamming and Spoofing (2024)</a></li>
        <li><a href="https://d-fendsolutions.com/enforceair/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">D-Fend Solutions EnforceAir2 — RF Cyber C-UAS System</a></li>
        <li><a href="https://www.dedrone.com/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Dedrone — Counter-Drone Defense Solutions</a></li>
    </ul>
</div>
`;
