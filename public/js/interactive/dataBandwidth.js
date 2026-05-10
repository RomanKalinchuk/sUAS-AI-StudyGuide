export function calcDataBandwidth() {
    const cameras    = parseInt(document.getElementById('bw-cameras').value);
    const resStr     = document.getElementById('bw-resolution').value;
    const [w, h]     = resStr.split('x').map(Number);
    const fps        = parseInt(document.getElementById('bw-fps').value);
    const bitdepth   = parseInt(document.getElementById('bw-bitdepth').value);
    const compress   = parseInt(document.getElementById('bw-compression').value);
    const imuRate    = parseInt(document.getElementById('bw-imu').value);

    // Raw bandwidth: cameras × width × height × 3 channels × bit-depth × fps (bits/sec)
    const rawBps   = cameras * w * h * 3 * bitdepth * fps;
    // Compressed video after codec
    const videoBps = rawBps / compress;
    // IMU: 6 axes (3 accel + 3 gyro) × 4 bytes × 8 bits × sample rate
    const imuBps   = 6 * 4 * 8 * imuRate;
    // MAVLink telemetry: nominal ~50 kbps
    const telemBps = 50000;
    const totalBps = videoBps + imuBps + telemBps;

    // Update labels
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('bw-cameras-val', cameras);
    set('bw-fps-val',     fps + ' fps');
    set('bw-imu-val',     imuRate.toLocaleString() + ' Hz');
    set('bw-video-label', fmtBw(videoBps));
    set('bw-imu-label',   fmtBw(imuBps));
    set('bw-telem-label', fmtBw(telemBps));
    set('bw-raw-label',   fmtBw(rawBps));
    set('bw-total',       fmtBw(totalBps));

    // Progress bars — raw video is the 100% reference
    const ref = Math.max(rawBps, 1);
    const pct = v => Math.max(1, Math.min(100, Math.round((v / ref) * 100))) + '%';
    const setBar = (id, bps) => {
        const el = document.getElementById(id);
        if (el) el.style.width = pct(bps);
    };
    setBar('bw-video-bar', videoBps);
    setBar('bw-imu-bar',   imuBps);
    setBar('bw-telem-bar', telemBps);
    setBar('bw-raw-bar',   rawBps);

    // Interface recommendation based on raw (uncompressed) camera data —
    // the CSI-2 / USB link must carry sensor-native bitrate before any codec.
    const recEl = document.getElementById('bw-recommendation');
    if (!recEl) return;
    if (rawBps > 20e9) {
        recEl.textContent  = 'PCIe 3.0 ×4 or better required (>20 Gbps raw)';
        recEl.style.color  = '#f87171';
    } else if (rawBps > 10e9) {
        recEl.textContent  = 'MIPI CSI-2 C-PHY 4-lane (40 Gbps) or PCIe';
        recEl.style.color  = '#fb923c';
    } else if (rawBps > 2.5e9) {
        recEl.textContent  = 'MIPI CSI-2 D-PHY 4-lane (10 Gbps)';
        recEl.style.color  = '#fbbf24';
    } else if (rawBps > 480e6) {
        recEl.textContent  = 'USB 3.0 Gen 1 or MIPI CSI-2 2-lane (2.5 Gbps)';
        recEl.style.color  = '#38bdf8';
    } else {
        recEl.textContent  = 'USB 2.0 (480 Mbps) sufficient';
        recEl.style.color  = '#34d399';
    }
}

function fmtBw(bps) {
    if (bps >= 1e9) return (bps / 1e9).toFixed(2) + ' Gbps';
    if (bps >= 1e6) return (bps / 1e6).toFixed(1) + ' Mbps';
    if (bps >= 1e3) return (bps / 1e3).toFixed(1) + ' Kbps';
    return bps + ' bps';
}
