export function runThermalSim() {
    const pwr = parseFloat(document.getElementById('pwr-input2').value);
    const amb = parseFloat(document.getElementById('amb-input2').value);
    const vel = parseFloat(document.getElementById('vel-input').value);

    document.getElementById('pwr-val2').innerText = pwr + ' W';
    document.getElementById('amb-val2').innerText = amb + ' °C';
    document.getElementById('vel-val').innerText = vel + ' m/s';

    // Heatsink-to-ambient thermal resistance. Forced convection improves the
    // convective coefficient roughly with sqrt(velocity), so R falls accordingly.
    let R_hs = 2.5;
    if (vel > 0) {
        R_hs = R_hs / (1 + 1.5 * Math.sqrt(vel));
    }

    // Module case temperature is what NVIDIA's thermal design guide limits (80 °C).
    const tc = amb + (pwr * R_hs);

    // Junction sits above the case by the module's junction-to-case resistance.
    const THETA_JC = 0.5;
    const tj = tc + (pwr * THETA_JC);

    const tjEl = document.getElementById('tj-result');
    const statEl = document.getElementById('tj-status');
    const detailEl = document.getElementById('tj-detail');

    tjEl.innerText = tc.toFixed(1) + ' °C';

    if (detailEl) {
        detailEl.innerText =
            'R_heatsink = ' + R_hs.toFixed(2) + ' °C/W  ·  estimated junction Tj ≈ ' +
            tj.toFixed(1) + ' °C';
    }

    // Thresholds track the 80 °C module case limit from the Orin thermal design guide.
    if (tc > 80) {
        tjEl.className = 'text-4xl font-mono text-rose-500 font-bold tracking-tight';
        statEl.className = 'mt-2 text-sm font-bold text-rose-500 animate-pulse';
        statEl.innerText = 'CRITICAL: EXCEEDS 80 °C CASE LIMIT — THROTTLING / SHUTDOWN';
    } else if (tc > 70) {
        tjEl.className = 'text-4xl font-mono text-amber-400 font-bold tracking-tight';
        statEl.className = 'mt-2 text-sm font-bold text-amber-400';
        statEl.innerText = 'WARNING: LITTLE MARGIN TO THE 80 °C LIMIT';
    } else {
        tjEl.className = 'text-4xl font-mono text-emerald-400 font-bold tracking-tight';
        statEl.className = 'mt-2 text-sm font-bold text-emerald-500';
        statEl.innerText = 'SAFE OPERATING ZONE';
    }
}
