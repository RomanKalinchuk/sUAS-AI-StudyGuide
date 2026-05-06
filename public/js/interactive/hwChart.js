let hwChartInst = null;

export function initHardwareChart() {
    const ctx = document.getElementById('hwChartMain');
    if (!ctx) return;
    if (hwChartInst) hwChartInst.destroy();

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Fira Code', monospace";

    const data = [
        { x: 600,  y: 100, r: 25, label: 'Jetson Orin NX',       cat: 'GPU',    color: 'rgba(16, 185, 129, 0.7)' },
        { x: 2000, y: 275, r: 40, label: 'Jetson AGX Orin',       cat: 'GPU',    color: 'rgba(16, 185, 129, 0.7)' },
        { x: 150,  y: 26,  r: 15, label: 'Hailo-8',               cat: 'NPU',    color: 'rgba(168, 85, 247, 0.7)' },
        { x: 130,  y: 13,  r: 12, label: 'RPi 5 + Hailo-8L',      cat: 'Hybrid', color: 'rgba(236, 72, 153, 0.7)' },
        { x: 120,  y: 6,   r: 10, label: 'Orange Pi 5 (RK3588)',   cat: 'SoC',    color: 'rgba(245, 158, 11, 0.7)'  },
        { x: 100,  y: 4,   r: 8,  label: 'Coral Edge TPU',         cat: 'NPU',    color: 'rgba(168, 85, 247, 0.7)' },
        { x: 450,  y: 15,  r: 15, label: 'Qualcomm RB5',           cat: 'DSP',    color: 'rgba(14, 165, 233, 0.7)'  },
        { x: 400,  y: 1.4,  r: 7,  label: 'AMD Kria KR260',         cat: 'FPGA',   color: 'rgba(56, 189, 248, 0.7)'  }
    ];

    hwChartInst = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Edge AI Hardware',
                data: data,
                backgroundColor: data.map(d => d.color),
                borderColor: 'rgba(255,255,255,0.2)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'logarithmic',
                    title: { display: true, text: 'Estimated Cost ($) - Log Scale', color: '#f8fafc', font: { size: 14 } },
                    grid: { color: '#1e293b' }
                },
                y: {
                    type: 'logarithmic',
                    title: { display: true, text: 'AI Performance (TOPS) - Log Scale', color: '#f8fafc', font: { size: 14 } },
                    grid: { color: '#1e293b' },
                    min: 1
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleFont: { size: 14, family: 'Inter', weight: 'bold' },
                    bodyFont: { size: 13, family: 'Fira Code' },
                    padding: 12,
                    borderColor: '#38bdf8',
                    borderWidth: 1,
                    callbacks: {
                        label(ctx) {
                            const d = ctx.raw;
                            return [
                                `Hardware: ${d.label}`,
                                `Architecture: ${d.cat}`,
                                `Cost: $${d.x}`,
                                `Performance: ${d.y} TOPS`
                            ];
                        }
                    }
                }
            }
        }
    });
}
