let hwChartInst = null;

export function initHardwareChart() {
    const ctx = document.getElementById('hwChartMain');
    if (!ctx) return;
    if (hwChartInst) hwChartInst.destroy();

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Fira Code', monospace";

    // TOPS figures are vendor peak numbers at INT8 unless noted. They are NOT
    // directly comparable across architectures — see the caveat in Module 4.
    // Jetson Orin figures are JetPack 6.2+ "Super" values.
    const data = [
        { x: 249,  y: 67,  r: 20, label: 'Jetson Orin Nano Super 8GB', cat: 'GPU',    watts: '7-25W',  color: 'rgba(16, 185, 129, 0.7)' },
        { x: 700,  y: 157, r: 28, label: 'Jetson Orin NX Super 16GB',  cat: 'GPU',    watts: '10-40W', color: 'rgba(16, 185, 129, 0.7)' },
        { x: 2000, y: 275, r: 36, label: 'Jetson AGX Orin 64GB',       cat: 'GPU',    watts: '15-60W', color: 'rgba(16, 185, 129, 0.7)' },
        { x: 3500, y: 2070, r: 46, label: 'Jetson AGX Thor T5000 (FP4)', cat: 'GPU',  watts: '40-130W', color: 'rgba(52, 211, 153, 0.7)' },
        { x: 150,  y: 26,  r: 15, label: 'Hailo-8',                    cat: 'NPU',    watts: '2.5W',   color: 'rgba(168, 85, 247, 0.7)' },
        { x: 250,  y: 40,  r: 17, label: 'Hailo-10H (INT4)',           cat: 'NPU',    watts: '<5W',    color: 'rgba(168, 85, 247, 0.7)' },
        { x: 130,  y: 13,  r: 12, label: 'RPi 5 + Hailo-8L',           cat: 'Hybrid', watts: '~10W',   color: 'rgba(236, 72, 153, 0.7)' },
        { x: 120,  y: 6,   r: 10, label: 'Orange Pi 5 (RK3588)',       cat: 'SoC',    watts: '5-10W',  color: 'rgba(245, 158, 11, 0.7)'  },
        { x: 100,  y: 4,   r: 8,  label: 'Coral Edge TPU',             cat: 'NPU',    watts: '2W',     color: 'rgba(168, 85, 247, 0.7)' },
        { x: 450,  y: 12,  r: 14, label: 'Qualcomm QCS6490',           cat: 'DSP',    watts: '3-7W',   color: 'rgba(14, 165, 233, 0.7)'  },
        { x: 349,  y: 1.4, r: 7,  label: 'AMD Kria KR260',             cat: 'FPGA',   watts: '~15W',   color: 'rgba(56, 189, 248, 0.7)'  }
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
                                `Cost: ~$${d.x}`,
                                `Performance: ${d.y} TOPS`,
                                `Power: ${d.watts}`
                            ];
                        }
                    }
                }
            }
        }
    });
}
