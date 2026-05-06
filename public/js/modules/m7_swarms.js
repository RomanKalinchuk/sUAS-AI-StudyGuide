export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 7</span>
    <h2>Swarm Intelligence & Networks</h2>
    <p>Swarms operate without centralized command. They rely on local observations and decentralized communication to achieve emergent global behavior.</p>

    <h3>7.1 The Boids Algorithm (Emergent Flocking)</h3>
    <p>Swarm navigation is fundamentally based on the Boids model developed by Craig Reynolds. Drones constantly calculate their velocity vectors by averaging three rules applied to their immediate neighbors within sensor range.</p>

    <div class="interactive-panel">
        <div class="flex justify-between items-end mb-4">
            <h4 class="mt-0 text-white border-none">Interactive Simulation: Boids Swarm Logic</h4>
            <button onclick="initSwarm()" class="bg-sky-600 hover:bg-sky-500 text-white text-xs px-4 py-2 rounded font-bold transition-colors">RESET SWARM</button>
        </div>

        <canvas id="swarmCanvas"></canvas>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <label class="text-sky-400 font-bold text-xs uppercase block mb-2">Separation (Avoid Collision)</label>
                <input type="range" id="sep-slider" min="0" max="5" step="0.1" value="1.5" class="w-full accent-sky-500">
                <p class="text-[10px] text-slate-400 mt-1">Steer away from crowded local flockmates.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <label class="text-emerald-400 font-bold text-xs uppercase block mb-2">Alignment (Match Heading)</label>
                <input type="range" id="ali-slider" min="0" max="5" step="0.1" value="1.0" class="w-full accent-emerald-500">
                <p class="text-[10px] text-slate-400 mt-1">Steer towards average heading of flockmates.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <label class="text-purple-400 font-bold text-xs uppercase block mb-2">Cohesion (Stay Grouped)</label>
                <input type="range" id="coh-slider" min="0" max="5" step="0.1" value="1.0" class="w-full accent-purple-500">
                <p class="text-[10px] text-slate-400 mt-1">Steer towards average position of flockmates.</p>
            </div>
        </div>
    </div>

    <h3>7.2 Mesh Networking (BATMAN-adv)</h3>
    <p>To calculate the Boids algorithms, drones must share their GPS/VIO coordinates. They utilize B.A.T.M.A.N. (Better Approach To Mobile Ad-hoc Networking), a routing protocol that operates at Layer 2 (Data Link Layer). It dynamically routes packets through the swarm mesh. If Drone A wants to tell Drone Z its position, the packet will automatically hop through Drones B, C, and D based on which links currently have the best signal strength, entirely bypassing the need for a central router.</p>
</div>
`;
