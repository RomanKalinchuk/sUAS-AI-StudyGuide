export function runThermalSim() {
    const pwr = parseFloat(document.getElementById('pwr-input2').value);
    const amb = parseFloat(document.getElementById('amb-input2').value);
    const vel = parseFloat(document.getElementById('vel-input').value);

    document.getElementById('pwr-val2').innerText = pwr + ' W';
    document.getElementById('amb-val2').innerText = amb + ' °C';
    document.getElementById('vel-val').innerText = vel + ' m/s';

    let R_th = 2.5;
    if (vel > 0) {
        R_th = R_th / (1 + 1.5 * Math.sqrt(vel));
    }

    const tj = amb + (pwr * R_th);
    const tjEl = document.getElementById('tj-result');
    const statEl = document.getElementById('tj-status');

    tjEl.innerText = tj.toFixed(1) + ' °C';

    if (tj > 85) {
        tjEl.className = 'text-4xl font-mono text-rose-500 font-bold tracking-tight';
        statEl.className = 'mt-2 text-sm font-bold text-rose-500 animate-pulse';
        statEl.innerText = 'CRITICAL: THERMAL THROTTLING / SHUTDOWN';
    } else if (tj > 70) {
        tjEl.className = 'text-4xl font-mono text-amber-400 font-bold tracking-tight';
        statEl.className = 'mt-2 text-sm font-bold text-amber-400';
        statEl.innerText = 'WARNING: REDUCED LIFESPAN';
    } else {
        tjEl.className = 'text-4xl font-mono text-emerald-400 font-bold tracking-tight';
        statEl.className = 'mt-2 text-sm font-bold text-emerald-500';
        statEl.innerText = 'SAFE OPERATING ZONE';
    }
}
