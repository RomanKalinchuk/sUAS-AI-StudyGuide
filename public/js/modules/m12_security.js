export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 16</span>
    <h2>Security & Counter-UAS Systems</h2>
    <p>An autonomous drone is a networked, radio-dependent, GPS-reliant embedded system. Each of those dependencies is an attack surface. This module covers the attack vectors engineers must design against, and the detection technologies used by adversaries to find and defeat AI drone systems.</p>

    <h3>16.1 MAVLink Protocol Security</h3>
    <p>MAVLink is the dominant protocol for communication between the flight controller and ground control station (GCS) or companion computer. By default, <strong>MAVLink has no authentication</strong>. Any device that can transmit on the UART or UDP channel can send valid MAVLink messages, including <code>COMMAND_LONG</code> messages that arm motors, change flight modes, or trigger RTL.</p>

    <h4>MAVLink v2 Packet Signing</h4>
    <p>MAVLink v2 introduced an optional signing mechanism. When enabled, 13 bytes are appended to each packet: a <strong>link ID</strong> (1 byte, identifies the connection), a <strong>timestamp</strong> (6 bytes, 1/10th milliseconds since epoch, strictly monotonically increasing), and a <strong>signature</strong> (6 bytes, first 6 bytes of SHA-256 HMAC over key + header + payload + link_id + timestamp). The signing key is 32 bytes, shared between the GCS and vehicle.</p>

    <div class="math-block">
        MAVLink v2 signed packet structure:<br><br>
        [magic][len][incompat_flags|SIGNED=0x01][compat_flags][seq][sysid][compid][msgid:3][payload:len][crc:2][link_id:1][timestamp:6][sig:6]<br><br>
        Signature = SHA256( secret_key + header + payload + crc + link_id + timestamp )[0:6]<br><br>
        Total signing overhead: 13 bytes per packet.
    </div>

    <p>The monotonic timestamp prevents <strong>replay attacks</strong>: recording valid signed packets and re-transmitting them will be rejected because the timestamp in the replayed packet is older than the highest timestamp the receiver has seen. To enable in ArduPilot: set <code>SYSID_MYGCS</code> to match the GCS system ID, upload the 32-byte signing key via <code>mavproxy.py</code> using the <code>signing</code> command, and set <code>MAV_FLTMODE_6</code> to reject unsigned packets.</p>

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
# signing generate signing.key          # generate key from file
# signing enable                        # enables signing on this link
# param set SYSID_MYGCS 255             # only accept commands from sysid 255
# (requires restart to take effect on vehicle side)</code></pre>
        </div>
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
                <p class="text-slate-400">Attacker connects to the telemetry radio (SiK radio, UDP relay) and sends COMMAND_LONG with dangerous commands. Without signing, the vehicle accepts them. Mitigation: v2 signing + physical radio encryption (AES-128 on SiK v3).</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-yellow-500">
                <strong class="text-yellow-400 uppercase block mb-1">Companion Computer Compromise</strong>
                <p class="text-slate-400">The companion computer (Jetson, Pi) is implicitly trusted by the FC. If malware runs on the companion, it can send arbitrary MAVLink. Mitigation: network-namespace isolation, MAVLink signing even on local UART links.</p>
            </div>
        </div>
    </div>

    <h3>16.2 GPS Spoofing</h3>
    <p>GPS spoofing is the transmission of counterfeit GPS signals at higher power than authentic satellite signals. The receiver, which locks onto the strongest signal, synchronizes to the fake signal. The attacker controls the fake signal's parameters and can therefore control what position the drone's GPS module reports — gradually steering the drone to any desired location without triggering an alert.</p>

    <h4>Detection Methods</h4>
    <ul class="space-y-4">
        <li>
            <strong>Multi-constellation GNSS:</strong> Real satellites transmit on L1/L2 from GPS (US), GLONASS (RU), Galileo (EU), BeiDou (CN) simultaneously. A real-world receiver sees these as geometrically consistent with its true position. A spoofer must simultaneously synthesize signals for every visible satellite on every constellation — a hardware-intensive attack. Enable via ArduPilot's <code>GPS_GNSS_MODE</code> parameter (set to 0 = all constellations, or explicitly OR the bitmask: GPS=1, GLONASS=2, Galileo=4, BeiDou=8).
        </li>
        <li>
            <strong>IMU cross-check (AHRS / EKF consistency monitor):</strong> ArduPilot's Extended Kalman Filter fuses GPS velocity with IMU-integrated velocity. If the EKF innovation (difference between GPS-predicted position and IMU-predicted position) exceeds a threshold, the EKF flags GPS as potentially spoofed and can switch to dead-reckoning. Parameter: <code>EK3_GPS_VACC_MAX</code> controls the acceptable velocity accuracy variance.
        </li>
        <li>
            <strong>Signal power anomaly:</strong> Authentic GPS signals arrive at approximately -130 dBm at the antenna (constrained by satellite transmit power and 20,000 km path loss). Spoofed signals from a ground transmitter typically arrive at much higher power. An AGC (Automatic Gain Control) monitor in the GPS receiver can flag anomalous carrier-to-noise (C/N0) ratios. u-blox modules expose <code>navStatus.flags2</code> with a spoofing detection flag derived from this.
        </li>
    </ul>

    <div class="math-block">
        EKF Innovation check (velocity domain):<br><br>
        innovation_v = v_GPS - v_IMU_predicted<br>
        test_ratio   = innovation_v^2 / innovation_variance<br><br>
        if test_ratio > EK3_CHECK_SCALE: flag GPS as faulty<br><br>
        Authentic L1 signal power at receiver: ~ -130 dBm<br>
        Spoofed signal (typical SDR attacker): -90 to -110 dBm (20–40 dB above authentic)
    </div>

    <h3>16.3 RF Jamming, Detection, and FHSS</h3>
    <p>RC link jamming involves transmitting high-power broadband noise on the control link frequency (2.4 GHz or 900 MHz), raising the noise floor until the receiver can no longer decode packets. From the drone's perspective, packet loss rises to 100% and the RC failsafe triggers.</p>

    <h4>ArduPilot RC Failsafe Response</h4>
    <p>When <code>FS_THR_ENABLE</code> is set (default: enabled), ArduPilot detects RC signal loss by monitoring the throttle channel. If it drops below <code>FS_THR_VALUE</code> (default: 975 µs PWM) for more than <code>FS_THR_DELAY</code> seconds (default: 1.0s), it activates the failsafe action: RTL (Return to Launch), Land, or continue current mission depending on <code>FS_THR_ENABLE</code> value (1=RTL, 2=continue if in auto, 3=Land).</p>

    <h4>Jamming Detection via ELRS Link Statistics</h4>
    <p>ExpressLRS (ELRS) exposes link statistics on every telemetry packet: RSSI (dBm), SNR (dB), LQ (Link Quality, 0–100% packet receive rate). A legitimate RSSI drop due to distance is gradual and correlated with GPS distance-from-home increasing. A jamming event produces: RSSI drops 20–40 dB instantaneously, LQ drops to 0%, while GPS distance-from-home is static or slowly increasing. Detecting this pattern in a ROS 2 node monitoring the ELRS stats topic provides a reliable jamming indicator within 200ms.</p>

    <h4>FHSS — Frequency Hopping Spread Spectrum</h4>
    <p>ELRS (and legacy FASST/DSMX systems) use FHSS. The transmitter and receiver share a pseudo-random hopping sequence (derived from a shared bind code) and simultaneously switch to a new sub-channel every packet interval (4ms in ELRS 250Hz mode). An attacker attempting to jam FHSS must either:</p>
    <ul class="space-y-2">
        <li><strong>Barrage jam:</strong> Transmit noise across the entire 2.4 GHz ISM band simultaneously (83 MHz bandwidth). Requires high-power broadband transmitter. Easily detectable by spectrum analyzers.</li>
        <li><strong>Follower jammer:</strong> Sense the current frequency, follow the hop. At 250Hz hop rate, the follower has only 4ms to detect and respond — generally infeasible with consumer SDR hardware.</li>
    </ul>

    <div class="bg-slate-800 p-4 rounded border-l-4 border-sky-500 text-sm text-slate-300 mb-8">
        <strong>Engineering note:</strong> ELRS's FHSS does not encrypt the link. It provides resistance to <em>uncoordinated</em> jamming and accidental interference, not against a sophisticated adversary who has reverse-engineered the hopping sequence. For military applications, link-layer AES encryption (as in ATAK data links or Harris RF-7800 radios) is mandatory.
    </div>

    <h3>16.4 Firmware & Companion Computer Security</h3>

    <h4>STM32H7 Secure Boot (Pixhawk 6X)</h4>
    <p>The STM32H7 (used in Pixhawk 6X) implements Read-Out Protection (RDP) at three levels. <strong>Level 0</strong>: no protection, full debug access via SWD, flash readable. <strong>Level 1</strong>: flash is not readable via SWD but can be erased; debug is partially restricted. <strong>Level 2</strong>: JTAG/SWD is permanently disabled, flash is locked, and the CPU only boots from internal flash. Critically, Level 2 is <strong>irreversible</strong> — there is no regression path. Setting Level 2 in the field prevents firmware extraction by an adversary who captures the hardware.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Bash: Ubuntu companion computer hardening (Jetson Orin)
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-bash"># 1. Disable SSH password authentication (keys only)
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/'  /etc/ssh/sshd_config
sudo systemctl restart sshd

# 2. Enable UFW firewall — allow only SSH (port 22) and ROS 2 DDS (UDP 7400)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 7400/udp     # ROS 2 DDS discovery
sudo ufw enable

# 3. Disable unused network services
sudo systemctl disable avahi-daemon  # mDNS — not needed on drone
sudo systemctl disable cups          # printing daemon
sudo systemctl mask bluetooth        # Bluetooth attack surface

# 4. Jetson Orin: Enable NVIDIA secure boot (PKC key fusing)
# Flash the fused PKC key via UEFI/SecureBoot in Jetson Linux BSP
# odmfuse.sh -i <chip_id> --PKC <public_key.pem> --target-board <board>
# After fusing, only signed images will boot on this specific Jetson.</code></pre>
        </div>
    </div>

    <h3>16.5 Counter-UAS Detection Technologies</h3>
    <p>Counter-UAS (C-UAS) systems use one or more detection modalities. Each has distinct range, accuracy, and environmental dependency characteristics. Production C-UAS installations layer multiple modalities for sensor fusion.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">C-UAS Detection Modality Comparison</h4>
        <div class="grid grid-cols-1 gap-4 text-sm">
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <div class="flex justify-between items-start mb-2">
                    <strong class="text-sky-400">RF Detection (Passive)</strong>
                    <span class="text-xs text-slate-500 font-mono">Range: 1–5 km</span>
                </div>
                <p class="text-slate-400 text-xs mb-2">Passive monitoring for drone RC/video transmission frequencies. <strong>DJI AeroScope</strong> works by decoding DJI's own OcuSync/O3 OEM protocol broadcasts — DJI drones periodically broadcast an ID frame containing serial number, home location, and operator location on the RC uplink frequency. Generic detectors use SDR (software-defined radio) to fingerprint frequency patterns: DJI OcuSync occupies specific 5.8 GHz sub-bands with characteristic modulation (OFDM with DJI-specific pilot patterns); Parrot uses Wi-Fi 802.11ac. ML classifiers trained on IQ samples can identify drone type with >95% accuracy at 500m in uncontested RF environments.</p>
                <p class="text-slate-400 text-xs"><strong>Limitation:</strong> Fails for analog video links (no detectable digital signature), and does not detect autonomous drones operating without an active RC link.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <div class="flex justify-between items-start mb-2">
                    <strong class="text-emerald-400">Acoustic Detection</strong>
                    <span class="text-xs text-slate-500 font-mono">Range: &lt;400 m</span>
                </div>
                <p class="text-slate-400 text-xs mb-2">Multi-element microphone arrays (typically 4–8 microphones) apply beamforming (Delay-and-Sum or MVDR/Capon) to spatially filter drone motor harmonics. Quadrotor rotors produce blade-passage frequency tones: BPF = (RPM / 60) * N_blades. A 2-blade 5040 prop at 8000 RPM generates 267 Hz. The 2nd and 3rd harmonics (534, 801 Hz) are also strong. A CNN classifier trained on drone acoustic spectrograms achieves ~92% detection rate in quiet environments.</p>
                <p class="text-slate-400 text-xs"><strong>Limitation:</strong> SNR collapses in urban noise environments (wind, traffic). Maximum practical range &lt;400m (line of bearing, not detection). Fails for fixed-wing UAS with lower acoustic signature.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <div class="flex justify-between items-start mb-2">
                    <strong class="text-amber-400">FMCW Radar (Micro-Doppler)</strong>
                    <span class="text-xs text-slate-500 font-mono">Range: 1–5 km</span>
                </div>
                <p class="text-slate-400 text-xs mb-2">Frequency Modulated Continuous Wave radar illuminates the target and analyzes the Doppler spectrum. A drone produces a characteristic micro-Doppler signature: the main body has one Doppler shift (translational velocity), while the spinning rotors produce a symmetric spread of Doppler sidebands at ±BPF around the body Doppler. This wideband sideband pattern is unique to rotating-blade aircraft and distinguishes drones from birds, humans, and cars. Systems: <strong>Echodyne EchoFlight</strong> (electronically-scanned phased array), <strong>D-Fend Solutions RfPatrol</strong>, <strong>Robin Radar Systems</strong>. A phased array radar can track 50+ objects simultaneously while scanning.</p>
                <p class="text-slate-400 text-xs"><strong>Limitation:</strong> Requires clear line of sight. Small drones at low altitude are masked by ground clutter below the radar's minimum elevation angle. Cost: $50k–$500k per unit.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border border-slate-700">
                <div class="flex justify-between items-start mb-2">
                    <strong class="text-purple-400">Optical / Thermal</strong>
                    <span class="text-xs text-slate-500 font-mono">Range: 200 m – 2 km</span>
                </div>
                <p class="text-slate-400 text-xs mb-2">Camera-based detection using AI classifiers (typically YOLOv8 or RT-DETR fine-tuned on drone datasets). The core challenge: a DJI Mavic 3 at 500m subtends approximately 0.06° of arc — only ~16 pixels wide in a typical 4K camera with 70° FoV. Detection requires high-resolution sensors and careful preprocessing (contrast enhancement, motion-based ROI extraction). FLIR thermal cameras (MWIR 3–5 µm) are effective at night: drone motors and electronics create a 20–40°C differential from background sky. Systems: Dedrone DroneTracker, Fortem Technologies TrueView.</p>
                <p class="text-slate-400 text-xs"><strong>Drone-on-drone detection:</strong> An AI drone can itself serve as a detection platform. A forward-looking camera running a multi-class YOLO model (including a "drone" class trained on DJI/Autel/custom-airframe examples) can detect incoming threats at 100–300m range during approach, enabling autonomous evasive maneuvering.</p>
            </div>
        </div>
    </div>

    <h3>16.6 Counter-UAS Defeat Systems</h3>
    <p>Detection identifies the threat. Defeat is the kinetic or non-kinetic neutralization of it. The legal and technical constraints on defeat systems are significant, particularly for non-government operators.</p>

    <div class="bg-slate-800 p-4 rounded border-l-4 border-red-500 text-sm text-slate-300 mb-6">
        <strong class="text-red-400">Legal Context:</strong> In the United States and most NATO jurisdictions, transmitting RF jamming signals (even targeted at a specific drone) is illegal for non-government actors under the Communications Act (47 U.S.C. § 333). Only specifically authorized federal agencies (FAA, DOD, DHS, DOJ) may operate RF defeat systems. GPS jamming is similarly restricted. Operating unauthorized C-UAS defeat equipment is a federal felony. The technologies below are described for educational purposes and in the context of authorized government or military operations.
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm">
            <strong class="text-red-400 uppercase text-xs block mb-2">RF Jamming</strong>
            <p class="text-slate-400 text-xs">Broadband noise emission on control link (2.4 GHz) and video link (5.8 GHz) frequencies. Breaks the RC uplink, triggering the drone's failsafe (RTL or Land). Does not work against autonomous drones with no active RC link. Causes collateral interference to Wi-Fi, other aircraft. Systems: DRONEKILLER (Dedrone), Dronebuster (Flex Force). Range: 500m–2km depending on ERP.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm">
            <strong class="text-red-400 uppercase text-xs block mb-2">GPS Denial</strong>
            <p class="text-slate-400 text-xs">Broadband L1/L2 band (1575/1227 MHz) jamming. Causes all GNSS receivers in the affected area (not just the target drone) to lose fix. If the drone has no backup navigation (IMU-only dead reckoning fails in ~30 seconds), it triggers GPS failsafe: hover, then Land. Significant collateral: disables friendly drone GPS, automotive navigation, timing systems.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm">
            <strong class="text-orange-400 uppercase text-xs block mb-2">Directed Energy (DEW)</strong>
            <p class="text-slate-400 text-xs">High-power microwave (HPM): focuses microwave energy to damage drone electronics. Effective at 100–500m. Laser DEW: thermally destructs composite airframe or burns camera/sensor. Requires precise pointing. U.S. Army SHORAD DEW programs. Experimental as of 2025 — not deployed at scale.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm">
            <strong class="text-emerald-400 uppercase text-xs block mb-2">Protocol Spoofing</strong>
            <p class="text-slate-400 text-xs">For DJI drones specifically: DJI's OcuSync/O3 protocol is partially reverse-engineered. Sending a crafted "return-to-home" command on the correct frequency with the correct DJI header causes the drone to execute RTL without the operator's intent. This works because DJI drones do not authenticate RTH commands by origin. Only effective against DJI consumer drones; military-grade or custom drones are immune.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm">
            <strong class="text-sky-400 uppercase text-xs block mb-2">Net Capture</strong>
            <p class="text-slate-400 text-xs">Physical net-firing interceptors (Fortem Technologies DroneHunter — an AI drone that autonomously intercepts and nets rogue drones at 60 mph). Non-destructive — preserves forensic evidence. Effective against hovering or slow-moving targets. Limited to shorter ranges (~500m pursuit). Does not work against fast fixed-wing UAS.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700 text-sm">
            <strong class="text-slate-400 uppercase text-xs block mb-2">Kinetic Defeat</strong>
            <p class="text-slate-400 text-xs">Trained aerial gunners, counter-UAS missiles (Coyote Block 3, MSHORAD Stinger), or AI-directed autocannon (Rafael Drone Dome). High cost-per-kill ratio for small sUAS targets. Effective for military zone defense. Collateral fragmentation risk in populated areas limits civilian application.</p>
        </div>
    </div>

    <h3>16.7 Security Architecture for a Production AI Drone</h3>
    <p>A defense-in-depth architecture applies security controls at every layer. No single control is sufficient — the stack must assume each layer can be compromised and provide compensating controls at the next layer.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Defense-in-Depth Security Stack</h4>
        <div class="space-y-2 text-xs font-mono">
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-sky-400 w-32 flex-shrink-0">RF Layer</span>
                <span class="text-slate-300">FHSS RC link (ELRS) + RSSI/LQ anomaly monitor → automatic RTL on link anomaly</span>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-sky-400 w-32 flex-shrink-0">GNSS Layer</span>
                <span class="text-slate-300">Multi-constellation GPS (GPS+GLONASS+Galileo) + EKF GPS innovation monitor + u-blox NAVIC anti-spoof flag</span>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-sky-400 w-32 flex-shrink-0">FC Protocol</span>
                <span class="text-slate-300">MAVLink v2 signing (SHA-256 HMAC, 32-byte key) + SYSID_MYGCS whitelist + reject unsigned packets</span>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-sky-400 w-32 flex-shrink-0">Companion OS</span>
                <span class="text-slate-300">SSH key-only auth + UFW firewall + systemd service isolation + AppArmor profiles for ROS 2 nodes</span>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-sky-400 w-32 flex-shrink-0">Hardware Boot</span>
                <span class="text-slate-300">STM32H7 RDP Level 1 (field) / Level 2 (operational lock) + Jetson Orin PKC secure boot key fusing</span>
            </div>
            <div class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700">
                <span class="text-sky-400 w-32 flex-shrink-0">Comms Transport</span>
                <span class="text-slate-300">Encrypted data link (AES-256 on RF transport layer where feasible) + WireGuard VPN for IP traffic to GCS</span>
            </div>
        </div>
    </div>
</div>
`;
