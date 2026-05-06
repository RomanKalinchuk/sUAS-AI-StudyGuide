export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 8</span>
    <h2>Implementation Workflow</h2>
    <p>A step-by-step interactive checklist for engineering a new AI sUAS platform from scratch. Click through the phases to understand the deployment pipeline.</p>

    <div class="flex flex-col md:flex-row gap-8 mt-8">
        <div class="w-full md:w-1/3 space-y-3">
            <div class="workflow-step active p-4 rounded border border-slate-700 text-slate-300" onclick="updateWorkflow(this, 1)">
                <strong class="text-white block mb-1">Phase 1: SITL Simulation</strong>
                <span class="text-xs">Software-In-The-Loop testing.</span>
            </div>
            <div class="workflow-step p-4 rounded border border-slate-700 text-slate-400" onclick="updateWorkflow(this, 2)">
                <strong class="text-white block mb-1">Phase 2: Hardware Bench Build</strong>
                <span class="text-xs">Carrier boards, flashing, and networking.</span>
            </div>
            <div class="workflow-step p-4 rounded border border-slate-700 text-slate-400" onclick="updateWorkflow(this, 3)">
                <strong class="text-white block mb-1">Phase 3: Sensor Calibration</strong>
                <span class="text-xs">Intrinsics, Extrinsics, and Time Sync.</span>
            </div>
            <div class="workflow-step p-4 rounded border border-slate-700 text-slate-400" onclick="updateWorkflow(this, 4)">
                <strong class="text-white block mb-1">Phase 4: Airframe Integration</strong>
                <span class="text-xs">EMI shielding, power delivery, thermal.</span>
            </div>
            <div class="workflow-step p-4 rounded border border-slate-700 text-slate-400" onclick="updateWorkflow(this, 5)">
                <strong class="text-white block mb-1">Phase 5: Tethered Flight Test</strong>
                <span class="text-xs">Validating the MAVLink control loop safely.</span>
            </div>
        </div>

        <div class="w-full md:w-2/3">
            <div id="wf-content" class="bg-slate-900 border border-slate-700 rounded-xl p-8 h-full min-h-[400px]"></div>
        </div>
    </div>
</div>
`;
