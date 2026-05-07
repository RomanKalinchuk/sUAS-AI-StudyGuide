import m0_intro    from './modules/m0_intro.js';
import m1_physics  from './modules/m1_physics.js';
import m2_hardware from './modules/m2_hardware.js';
import m3_systems  from './modules/m3_systems.js';
import m4_vision   from './modules/m4_vision.js';
import m5_software from './modules/m5_software.js';
import m6_targeting from './modules/m6_targeting.js';
import m7_swarms   from './modules/m7_swarms.js';
import m8_workflow from './modules/m8_workflow.js';
import m9_power    from './modules/m9_power.js';
import m10_flightcontrol from './modules/m10_flightcontrol.js';
import m11_navigation from './modules/m11_navigation.js';
import m12_security  from './modules/m12_security.js';
import m13_ml_pipeline   from './modules/m13_ml_pipeline.js';
import m14_depth_mapping from './modules/m14_depth_mapping.js';
import m15_rf_comms  from './modules/m15_rf_comms.js';
import m16_ekf       from './modules/m16_ekf.js';

import { runThermalSim }    from './interactive/thermal.js';
import { initHardwareChart } from './interactive/hwChart.js';
import { initSwarm }        from './interactive/swarm.js';
import { updateWorkflow }   from './interactive/workflow.js';

// Expose to global scope for onclick handlers embedded in module HTML strings
window.runThermalSim  = runThermalSim;
window.initSwarm      = initSwarm;
window.updateWorkflow = updateWorkflow;

const modules = [
    { id: 'm0_intro',          title: '1.  Fundamentals & Autonomy',          short: 'Intro to Autonomy'      },
    { id: 'm1_physics',        title: '2.  SWaP-C Physics & Math',            short: 'Physics & SWaP-C'       },
    { id: 'm9_power',          title: '3.  Power Electronics & Circuits',      short: 'Power Electronics'      },
    { id: 'm2_hardware',       title: '4.  Compute Silicon Matrix',            short: 'Hardware Architecture'  },
    { id: 'm10_flightcontrol', title: '5.  Flight Controller Architecture',    short: 'Flight Controller'      },
    { id: 'm15_rf_comms',      title: '6.  RF Communications & Link Mgmt',    short: 'RF & Link Management'   },
    { id: 'm5_software',       title: '7.  Edge Software Toolchains',          short: 'Software Stack'         },
    { id: 'm3_systems',        title: '8.  Data Links & Topology',             short: 'System Topology'        },
    { id: 'm16_ekf',           title: '9.  Sensor Fusion & EKF Architecture', short: 'EKF & Sensor Fusion'    },
    { id: 'm13_ml_pipeline',   title: '10. AI Training & Dataset Pipeline',    short: 'ML Pipeline'            },
    { id: 'm4_vision',         title: '11. Perception & VSLAM',               short: 'Vision & VSLAM'         },
    { id: 'm14_depth_mapping', title: '12. Depth Sensing & 3D Mapping',        short: 'Depth & 3D Mapping'     },
    { id: 'm11_navigation',    title: '13. Path Planning & Navigation',        short: 'Path Planning'          },
    { id: 'm6_targeting',      title: '14. AI Targeting & Kinematics',        short: 'AI Targeting'           },
    { id: 'm7_swarms',         title: '15. Swarm Intelligence',                short: 'Swarm Networks'         },
    { id: 'm12_security',      title: '16. Security & Counter-UAS',            short: 'Security & C-UAS'       },
    { id: 'm8_workflow',       title: '17. Implementation Workflow',           short: 'Interactive Workflow'   },
];

const contentDB = {
    m0_intro, m1_physics, m2_hardware, m3_systems, m4_vision,
    m5_software, m6_targeting, m7_swarms, m8_workflow,
    m9_power, m10_flightcontrol, m11_navigation, m12_security,
    m13_ml_pipeline, m14_depth_mapping, m15_rf_comms, m16_ekf
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
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeBtn = document.getElementById(`nav-${id}`);
    if (activeBtn) activeBtn.classList.add('active');

    const mobileSelect = document.getElementById('mobile-nav');
    if (mobileSelect.value !== id) mobileSelect.value = id;

    const container = document.getElementById('content-container');
    container.innerHTML = contentDB[id] ?? '<p class="text-white">Content loading error.</p>';

    document.getElementById('main-scroll').scrollTop = 0;

    if (id === 'm1_physics')  runThermalSim();
    if (id === 'm2_hardware') setTimeout(initHardwareChart, 100);
    if (id === 'm7_swarms')   setTimeout(initSwarm, 100);
    if (id === 'm8_workflow') updateWorkflow(null, 1);

    if (window.Prism) setTimeout(() => Prism.highlightAll(), 50);
    updateProgress();
};

window.updateProgress = function () {
    const activeId = document.querySelector('.nav-item.active')?.id.replace('nav-', '');
    const idx = modules.findIndex(m => m.id === activeId);
    document.getElementById('progress-bar').style.width = `${((idx + 1) / modules.length) * 100}%`;
    const label = document.getElementById('module-label');
    if (label && idx >= 0) label.textContent = `Module ${idx + 1} of ${modules.length}`;
};

document.addEventListener('DOMContentLoaded', () => {
    buildNav();
    loadModule('m0_intro');

    window.addEventListener('resize', () => {
        if (document.querySelector('.nav-item.active')?.id === 'nav-m7_swarms') {
            initSwarm();
        }
    });
});
