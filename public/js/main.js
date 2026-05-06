import m0_intro    from './modules/m0_intro.js';
import m1_physics  from './modules/m1_physics.js';
import m2_hardware from './modules/m2_hardware.js';
import m3_systems  from './modules/m3_systems.js';
import m4_vision   from './modules/m4_vision.js';
import m5_software from './modules/m5_software.js';
import m6_targeting from './modules/m6_targeting.js';
import m7_swarms   from './modules/m7_swarms.js';
import m8_workflow from './modules/m8_workflow.js';

import { runThermalSim }    from './interactive/thermal.js';
import { initHardwareChart } from './interactive/hwChart.js';
import { initSwarm }        from './interactive/swarm.js';
import { updateWorkflow }   from './interactive/workflow.js';

// Expose to global scope for onclick handlers embedded in module HTML strings
window.runThermalSim  = runThermalSim;
window.initSwarm      = initSwarm;
window.updateWorkflow = updateWorkflow;

const modules = [
    { id: 'm0_intro',     title: '0. Fundamentals & Autonomy',    short: 'Intro to Autonomy'   },
    { id: 'm1_physics',   title: '1. SWaP-C Physics & Math',      short: 'Physics & SWaP-C'    },
    { id: 'm2_hardware',  title: '2. Compute Silicon Matrix',      short: 'Hardware Architecture' },
    { id: 'm3_systems',   title: '3. Data Links & Topology',       short: 'System Topology'     },
    { id: 'm4_vision',    title: '4. Perception & VSLAM',          short: 'Vision & VSLAM'      },
    { id: 'm5_software',  title: '5. Edge Software Toolchains',    short: 'Software Stack'      },
    { id: 'm6_targeting', title: '6. AI Targeting & Kinematics',   short: 'AI Targeting'        },
    { id: 'm7_swarms',    title: '7. Swarm Intelligence',          short: 'Swarm Networks'      },
    { id: 'm8_workflow',  title: '8. Implementation Workflow',     short: 'Interactive Workflow' }
];

const contentDB = {
    m0_intro, m1_physics, m2_hardware, m3_systems, m4_vision,
    m5_software, m6_targeting, m7_swarms, m8_workflow
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
