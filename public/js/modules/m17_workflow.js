export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 17</span>
    <h2>Implementation Workflow</h2>
    <p>A complete engineering lifecycle for deploying an AI sUAS platform from initial requirements through operational deployment. Each of the eight phases has explicit entry criteria and go/no-go gates before advancing. Skipping a phase does not save time — it relocates the cost of failure to a much more expensive part of the program.</p>

    <!-- Gantt Timeline -->
    <div class="mt-8 mb-6">
        <h3 class="text-base font-semibold text-white mb-1">Typical 12-Week Build Timeline</h3>
        <p class="text-xs text-slate-400 mb-3">Phases 2 and 3 run in parallel (SITL and bench build overlap). Click any phase row to jump to its detail view.</p>
        <div class="gantt-container">
            <div class="gantt-header-row">
                <div class="gantt-label-col" style="font-size:0.65rem;">PHASE</div>
                <div class="gantt-weeks">
                    <span>Wk1</span><span>Wk2</span><span>Wk3</span><span>Wk4</span><span>Wk5</span>
                    <span>Wk6</span><span>Wk7</span><span>Wk8</span><span>Wk9</span><span>Wk10</span>
                    <span>Wk11</span><span>Wk12</span>
                </div>
            </div>
            <div class="gantt-row-item gantt-active" data-step="1" onclick="updateWorkflow(null, 1)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#0ea5e9;">P1</span>Requirements
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:0%;width:16.67%;background:#0ea5e9;">Wk&nbsp;1–2</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="2" onclick="updateWorkflow(null, 2)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#f59e0b;">P2</span>SITL Sim
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:8.33%;width:33.33%;background:#f59e0b;">Wk&nbsp;2–5</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="3" onclick="updateWorkflow(null, 3)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#f97316;">P3</span>Bench Build
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:16.67%;width:25%;background:#f97316;">Wk&nbsp;3–5</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="4" onclick="updateWorkflow(null, 4)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#10b981;">P4</span>Calibration
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:33.33%;width:16.67%;background:#10b981;">Wk&nbsp;5–6</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="5" onclick="updateWorkflow(null, 5)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#a855f7;">P5</span>Integration
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:41.67%;width:16.67%;background:#a855f7;">Wk&nbsp;6–7</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="6" onclick="updateWorkflow(null, 6)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#ef4444;">P6</span>Tethered
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:50%;width:16.67%;background:#ef4444;">Wk&nbsp;7–8</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="7" onclick="updateWorkflow(null, 7)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#ec4899;">P7</span>Free-Flight
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:58.33%;width:25%;background:#ec4899;">Wk&nbsp;8–10</div>
                </div>
            </div>
            <div class="gantt-row-item" data-step="8" onclick="updateWorkflow(null, 8)">
                <div class="gantt-label-col">
                    <span class="gantt-phase-badge" style="background:#14b8a6;">P8</span>Deployment
                </div>
                <div class="gantt-track">
                    <div class="gantt-bar" style="left:75%;width:25%;background:#14b8a6;">Wk&nbsp;10–12</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Phase navigation + content panel -->
    <div class="flex flex-col md:flex-row gap-6 mt-6">

        <!-- Sidebar -->
        <div class="w-full md:w-1/3 space-y-2">
            <div class="workflow-step active p-3 rounded border border-slate-700" data-step="1" onclick="updateWorkflow(this, 1)">
                <strong class="text-sky-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 1</strong>
                <strong class="text-white block text-sm mb-1">Requirements &amp; Architecture</strong>
                <span class="text-xs text-slate-400">Mission definition, airframe and compute selection, power budget.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="2" onclick="updateWorkflow(this, 2)">
                <strong class="text-amber-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 2</strong>
                <strong class="text-white block text-sm mb-1">SITL Simulation</strong>
                <span class="text-xs text-slate-400">Software-in-the-loop, domain randomization, AI validation in sim.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="3" onclick="updateWorkflow(this, 3)">
                <strong class="text-orange-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 3</strong>
                <strong class="text-white block text-sm mb-1">Hardware Bench Build</strong>
                <span class="text-xs text-slate-400">Flash firmware, wire UART, configure software stack, verify comms.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="4" onclick="updateWorkflow(this, 4)">
                <strong class="text-emerald-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 4</strong>
                <strong class="text-white block text-sm mb-1">Sensor Calibration</strong>
                <span class="text-xs text-slate-400">Camera intrinsics/extrinsics, IMU, GPS, and time synchronization.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="5" onclick="updateWorkflow(this, 5)">
                <strong class="text-purple-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 5</strong>
                <strong class="text-white block text-sm mb-1">Airframe Integration</strong>
                <span class="text-xs text-slate-400">Vibration isolation, EMI shielding, thermal management, wiring harness.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="6" onclick="updateWorkflow(this, 6)">
                <strong class="text-rose-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 6</strong>
                <strong class="text-white block text-sm mb-1">Tethered Flight Test</strong>
                <span class="text-xs text-slate-400">Safe first flight — validate control loop, AI activation, and logs.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="7" onclick="updateWorkflow(this, 7)">
                <strong class="text-pink-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 7</strong>
                <strong class="text-white block text-sm mb-1">Free-Flight Validation</strong>
                <span class="text-xs text-slate-400">Incremental range expansion, edge-case testing, performance profiling.</span>
            </div>
            <div class="workflow-step p-3 rounded border border-slate-700" data-step="8" onclick="updateWorkflow(this, 8)">
                <strong class="text-teal-400 block text-xs mb-0.5 tracking-widest uppercase">Phase 8</strong>
                <strong class="text-white block text-sm mb-1">Regulatory &amp; Deployment</strong>
                <span class="text-xs text-slate-400">FAA compliance, SOPs, maintenance schedule, AI model CI/CD.</span>
            </div>
        </div>

        <!-- Content panel -->
        <div class="w-full md:w-2/3">
            <div id="wf-content" class="bg-slate-900 border border-slate-700 rounded-xl p-6 min-h-[640px]"></div>
        </div>
    </div>
</div>
`;
