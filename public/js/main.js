import m1_intro        from './modules/m1_intro.js';
import m2_physics      from './modules/m2_physics.js';
import m3_power        from './modules/m3_power.js';
import m4_hardware     from './modules/m4_hardware.js';
import m5_flightcontrol from './modules/m5_flightcontrol.js';
import m6_rf_comms     from './modules/m6_rf_comms.js';
import m7_software     from './modules/m7_software.js';
import m8_systems      from './modules/m8_systems.js';
import m9_ekf          from './modules/m9_ekf.js';
import m10_ml_pipeline from './modules/m10_ml_pipeline.js';
import m11_vision      from './modules/m11_vision.js';
import m12_depth_mapping from './modules/m12_depth_mapping.js';
import m13_navigation  from './modules/m13_navigation.js';
import m14_targeting   from './modules/m14_targeting.js';
import m15_swarms      from './modules/m15_swarms.js';
import m16_security    from './modules/m16_security.js';
import m17_workflow    from './modules/m17_workflow.js';

import { runThermalSim }    from './interactive/thermal.js';
import { initHardwareChart } from './interactive/hwChart.js';
import { initSwarm, stopSwarm } from './interactive/swarm.js';
import { updateWorkflow }     from './interactive/workflow.js';
import { calcDataBandwidth }  from './interactive/dataBandwidth.js';

// Expose to global scope for onclick handlers embedded in module HTML strings
window.runThermalSim     = runThermalSim;
window.initSwarm         = initSwarm;
window.updateWorkflow    = updateWorkflow;
window.calcDataBandwidth = calcDataBandwidth;

const modules = [
    { id: 'm1_intro',          title: '1.  Fundamentals & Autonomy',          short: 'Intro to Autonomy'      },
    { id: 'm2_physics',        title: '2.  SWaP-C Physics & Math',            short: 'Physics & SWaP-C'       },
    { id: 'm3_power',          title: '3.  Power Electronics & Circuits',      short: 'Power Electronics'      },
    { id: 'm4_hardware',       title: '4.  Compute Silicon Matrix',            short: 'Hardware Architecture'  },
    { id: 'm5_flightcontrol',  title: '5.  Flight Controller Architecture',    short: 'Flight Controller'      },
    { id: 'm6_rf_comms',       title: '6.  RF Communications & Link Mgmt',    short: 'RF & Link Management'   },
    { id: 'm7_software',       title: '7.  Edge Software Toolchains',          short: 'Software Stack'         },
    { id: 'm8_systems',        title: '8.  Data Links & Topology',             short: 'System Topology'        },
    { id: 'm9_ekf',            title: '9.  Sensor Fusion & EKF Architecture', short: 'EKF & Sensor Fusion'    },
    { id: 'm10_ml_pipeline',   title: '10. AI Training & Dataset Pipeline',    short: 'ML Pipeline'            },
    { id: 'm11_vision',        title: '11. Perception & VSLAM',               short: 'Vision & VSLAM'         },
    { id: 'm12_depth_mapping', title: '12. Depth Sensing & 3D Mapping',        short: 'Depth & 3D Mapping'     },
    { id: 'm13_navigation',    title: '13. Path Planning & Navigation',        short: 'Path Planning'          },
    { id: 'm14_targeting',     title: '14. AI Targeting & Kinematics',        short: 'AI Targeting'           },
    { id: 'm15_swarms',        title: '15. Swarm Intelligence',                short: 'Swarm Networks'         },
    { id: 'm16_security',      title: '16. Security & Counter-UAS',            short: 'Security & C-UAS'       },
    { id: 'm17_workflow',      title: '17. Implementation Workflow',           short: 'Interactive Workflow'   },
];

const contentDB = {
    m1_intro, m2_physics, m3_power, m4_hardware, m5_flightcontrol,
    m6_rf_comms, m7_software, m8_systems, m9_ekf, m10_ml_pipeline,
    m11_vision, m12_depth_mapping, m13_navigation, m14_targeting,
    m15_swarms, m16_security, m17_workflow
};

function buildNav() {
    const list   = document.getElementById('nav-list');
    const mobile = document.getElementById('mobile-nav');

    modules.forEach(m => {
        const li = document.createElement('li');
        li.innerHTML = `<button onclick="loadModule('${m.id}')" id="nav-${m.id}" class="nav-item w-full text-left px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-[#0f172a] rounded font-medium transition-colors">${m.title}</button>`;
        list.appendChild(li);

        const opt = document.createElement('option');
        opt.value = m.id;
        opt.text  = m.short;
        mobile.appendChild(opt);
    });
}

window.loadModule = function (id) {
    stopSwarm();

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeBtn = document.getElementById(`nav-${id}`);
    if (activeBtn) activeBtn.classList.add('active');

    const mobileSelect = document.getElementById('mobile-nav');
    if (mobileSelect.value !== id) mobileSelect.value = id;

    const container = document.getElementById('content-container');
    container.innerHTML = contentDB[id] ?? '<p class="text-white">Content loading error.</p>';

    document.getElementById('main-scroll').scrollTop = 0;

    if (id === 'm2_physics')  runThermalSim();
    if (id === 'm4_hardware') setTimeout(initHardwareChart, 100);
    if (id === 'm8_systems')  calcDataBandwidth();
    if (id === 'm15_swarms')  setTimeout(initSwarm, 100);
    if (id === 'm17_workflow') updateWorkflow(null, 1);

    if (window.Prism) setTimeout(() => Prism.highlightAll(), 50);
    renderMath(container);
    updateProgress();
};

// KaTeX loads with `defer`, so it may not be ready for the first module render.
// Retry briefly rather than silently leaving raw TeX on screen.
function renderMath(container, attempt = 0) {
    if (typeof window.renderMathInElement !== 'function') {
        if (attempt < 20) setTimeout(() => renderMath(container, attempt + 1), 100);
        return;
    }
    window.renderMathInElement(container, {
        // Only \( \) and \[ \] — never bare $, which would eat dollar amounts
        // like "$249 ... $3,499" that appear throughout the hardware modules.
        delimiters: [
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
        ],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        throwOnError: false
    });
}

window.updateProgress = function () {
    const activeId = document.querySelector('.nav-item.active')?.id.replace('nav-', '');
    const idx = modules.findIndex(m => m.id === activeId);
    document.getElementById('progress-bar').style.width = `${((idx + 1) / modules.length) * 100}%`;
    const label = document.getElementById('module-label');
    if (label && idx >= 0) label.textContent = `Module ${idx + 1} of ${modules.length}`;
};

document.addEventListener('DOMContentLoaded', () => {
    buildNav();
    loadModule('m1_intro');

    window.addEventListener('resize', () => {
        if (document.querySelector('.nav-item.active')?.id === 'nav-m15_swarms') {
            initSwarm();
        }
    });
});
