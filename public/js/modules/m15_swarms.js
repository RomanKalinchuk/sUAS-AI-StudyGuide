export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 15</span>
    <h2>Swarm Intelligence & Networks</h2>
    <p>Swarms operate without centralized command. They rely on local observations and decentralized communication to achieve emergent global behavior — behavior no single drone could produce alone. This module covers the algorithms, communication protocols, real-world deployments from light shows to battlefields, and the AI/ML frontier driving next-generation swarm autonomy.</p>

    <h3>15.1 The Boids Algorithm (Emergent Flocking)</h3>
    <p>Swarm navigation traces back to the Boids model developed by Craig Reynolds (1987). Each drone continuously recalculates its velocity vector by averaging three rules applied to neighbors within sensor range — the result is realistic flocking with no central coordinator.</p>

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

    <p>The three-rule Boids model produces realistic flocking but cannot pursue global objectives. Modern implementations extend it with two mission-critical rules:</p>
    <ul class="space-y-2 mt-2">
        <li><strong>Obstacle Avoidance (4th rule):</strong> A repulsive potential vector from any non-swarm object within collision radius — treated identically to separation but targeting static terrain and dynamic obstacles rather than flockmates.</li>
        <li><strong>Goal Attraction (5th rule):</strong> A weak attractive force toward the current mission waypoint. Weighted below separation so the swarm never collides while advancing toward the objective.</li>
    </ul>
    <p>With all five rules, the swarm autonomously flows around buildings, maintains safe spacing, and converges on a target — purely from local per-drone computation with no ground station involvement during execution.</p>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">How Flocking Works: Boids & Murmurations (Smarter Every Day)</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/4LWmRuB-uNU" title="How Flocking Birds Make Amazing Murmurations (Boids Algorithm) — Smarter Every Day 234" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-gray-400 text-sm mt-2">Destin Sandlin (Smarter Every Day 234) explains the Boids model with live murmuration footage and live simulation — the same three rules powering every drone swarm simulator.</p>
    </div>

    <h3>15.2 Advanced Swarm Algorithms</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
            <strong class="text-sky-400 uppercase tracking-widest text-xs block mb-2">Particle Swarm Optimization (PSO)</strong>
            <p class="text-sm text-slate-300">Treats each drone as a particle with a position in solution-space and a velocity. Two attractors guide the search: <em>pBest</em> (each particle's personal best known solution) and <em>gBest</em> (the best solution found by any particle in the swarm). In drone path planning, "fitness" evaluates path length, obstacle clearance, and energy cost simultaneously.</p>
            <p class="text-sm text-slate-300 mt-2">PSO excels in high-dimensional 3-D environments where gradient-descent methods trap in local minima. Hybrid APF-PSO (MDPI Drones, 2025) fuses PSO's global search capacity with APF's real-time collision avoidance for regional dynamic formation control. <em>Limitation:</em> computationally expensive for in-flight swarms larger than ~50 drones — typically run on a ground station and uploaded as waypoint sequences.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
            <strong class="text-emerald-400 uppercase tracking-widest text-xs block mb-2">Artificial Potential Fields (APF)</strong>
            <p class="text-sm text-slate-300">Assigns each drone an artificial force field: attractive forces pull toward waypoints, repulsive forces push away from obstacles and neighbors. The drone follows the net force vector. Computation is O(N) per drone — fast enough for real-time onboard execution at 100+ Hz.</p>
            <p class="text-sm text-slate-300 mt-2"><em>Known weakness:</em> local minima (drone gets stuck in a force-balanced dead zone). The Quantum-Enhanced APF (Scientific Reports, 2025) adds quantum-inspired probabilistic exploration to escape local minima, demonstrating <strong>37% faster formation convergence</strong> and <strong>42% better disturbance rejection</strong> compared to standard APF in simulation. <em class="text-amber-400">Note: results are simulation-only — this technique is pre-production research, not a deployable algorithm.</em></p>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
            <strong class="text-amber-400 uppercase tracking-widest text-xs block mb-2">Ant Colony Optimization (ACO)</strong>
            <p class="text-sm text-slate-300">Virtual ants lay "digital pheromone" on good routes; high-pheromone paths attract more ants, reinforcing the solution. In drone swarms, ACO excels at <em>multi-drone area coverage</em> (assigning strips among N drones to minimize overlap and total mission time) and <em>NP-hard inspection routing</em>. A 2025 ScienceDirect paper showed ACO outperforming A* and genetic algorithms for agricultural coverage over irregular field shapes with embedded no-fly zones.</p>
            <p class="text-sm text-slate-300 mt-2">Scales well to 5–30 drones. The pheromone evaporation rate is the key tuning parameter — too fast and the swarm cannot exploit good routes; too slow and it cannot adapt to changed obstacles.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
            <strong class="text-purple-400 uppercase tracking-widest text-xs block mb-2">Consensus Algorithms</strong>
            <p class="text-sm text-slate-300">Allow N drones to agree on shared state (formation centroid, target location, task assignment) without a central authority. Each drone broadcasts its local estimate; neighbors exchange and average values. After O(log N) communication rounds, all drones converge to the same value.</p>
            <p class="text-sm text-slate-300 mt-2"><strong>SwarmRaft</strong> (arXiv, 2025) adapts the Raft distributed consensus algorithm for GPS-degraded environments, tolerating Byzantine (malicious/faulty) nodes without any centralized fusion authority. Hierarchical consensus protocols (2024) maintain formation integrity under <strong>30% packet loss</strong> — critical for jammed or urban-canyon environments. Typical convergence: 1–5 seconds at 10 Hz — acceptable for task allocation, too slow for collision avoidance (handled locally).</p>
        </div>
    </div>

    <h4 class="mt-6">15.2.1 Consensus Algorithm Comparison</h4>
    <p class="text-sm text-slate-300 mb-3">Choosing a consensus protocol involves tradeoffs between Byzantine fault tolerance, message complexity, and latency. The table below compares the primary options used in swarm research (2024–2025):</p>
    <div class="interactive-panel bg-[#0d1320] border-slate-700 mt-2">
        <div class="overflow-x-auto">
            <div class="grid text-xs font-mono min-w-[600px]" style="grid-template-columns: 1fr 1fr 1fr 1fr 1fr;">
                <div class="text-slate-400 border-b border-slate-700 pb-1 font-bold">Protocol</div>
                <div class="text-slate-400 border-b border-slate-700 pb-1 font-bold">Byzantine Tolerance</div>
                <div class="text-slate-400 border-b border-slate-700 pb-1 font-bold">Message Complexity</div>
                <div class="text-slate-400 border-b border-slate-700 pb-1 font-bold">Latency</div>
                <div class="text-slate-400 border-b border-slate-700 pb-1 font-bold">Best Use Case</div>

                <div class="text-sky-400 py-1 border-b border-slate-800">Average Consensus</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">None</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">O(N&middot;k) per round</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">1–5 s</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">Formation centroid agreement, trusted nodes</div>

                <div class="text-emerald-400 py-1 border-b border-slate-800">Raft / SwarmRaft</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">Crash-tolerant (N/2+1)</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">O(N) per round</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">100–500 ms</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">GNSS-degraded task allocation, leader election</div>

                <div class="text-amber-400 py-1 border-b border-slate-800">PBFT</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">Byzantine (N &gt; 3f+1)</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">O(N&sup2;) — impractical &gt;20 nodes</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">High</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">High-value decisions, small swarms only</div>

                <div class="text-purple-400 py-1 border-b border-slate-800">Gossip / Epidemic</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">Partial (weighting)</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">O(log N) rounds</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">Seconds</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">Large swarms, intermittent connectivity</div>

                <div class="text-rose-400 py-1">RCA-SI (2025)</div>
                <div class="text-slate-300 py-1">Partial</div>
                <div class="text-slate-300 py-1">O(N&middot;k)</div>
                <div class="text-slate-300 py-1">&lt;200 ms</div>
                <div class="text-slate-300 py-1">Unstable networks, rapid task realloc</div>
            </div>
        </div>
        <p class="text-[10px] text-slate-500 mt-2">Sources: SwarmRaft (arXiv 2025), RCA-SI (ScienceDirect 2025), ResearchSquare RLR vs Raft benchmark (2025)</p>
    </div>

    <div class="bg-slate-800 p-4 rounded border-l-4 border-rose-500 text-sm text-slate-300 mt-4">
        <strong class="text-rose-400">Stigmergy — Coordination Through the Environment</strong><br><br>
        Stigmergy enables indirect coordination: a drone modifies the shared environment (drops a "digital marker"), and other drones react to that marker without ever communicating directly. In drone swarms, digital pheromones are implemented as shared map tiles on a ground server (drones read/write over radio), broadcast UWB beacons storing virtual pheromone values, or onboard memory updated via gossip protocols. A 2024 <em>Communications Engineering</em> (Nature portfolio) paper demonstrated automatic design of stigmergy-based swarm behaviors matching or exceeding manually tuned approaches for coverage and target search.<br><br>
        In target search: a drone that detects a target broadcasts pheromone at that location; neighboring drones sense elevated pheromone and converge — emergent area prioritization without any explicit "go here" communication. Pheromones decay over time (evaporation parameter), preventing permanent clustering at stale detections.
    </div>

    <h3>15.3 Swarm Communication & Networking</h3>
    <p>For swarm algorithms to function, drones must continuously share state — positions, headings, task assignments, and sensor detections. The communication stack determines latency, range, and resilience under jamming.</p>

    <h4>15.3.1 Mesh Routing Protocols</h4>
    <p><strong>BATMAN-adv</strong> (Better Approach To Mobile Ad-hoc Networking) operates at Layer 2 (Data Link Layer), routing Ethernet frames across the swarm mesh. Each node periodically broadcasts <em>Originator Messages (OGMs)</em> that propagate through the mesh; each node tracks which neighbor relayed the strongest OGMs and uses that as its best next-hop. BATMAN V (the current version) integrates directly into the Linux kernel as a module — widely deployed in Raspberry Pi companion computer meshes. Limitation: OGM flooding overhead scales with node count; at 50+ nodes, BATMAN-adv can consume 10–15% of available bandwidth in beaconing alone.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mt-4">
        <h4 class="mt-0 border-none text-white text-sm">Mesh Protocol Comparison</h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mt-2">
            <div class="bg-slate-900 p-3 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase tracking-widest block mb-1">BATMAN V</strong>
                <p class="text-slate-300">Layer 2 proactive. OGM-based next-hop routing. High PDR in dense mobile swarms. Best for mixed air+ground meshes. 10–15% overhead at 50+ nodes.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase tracking-widest block mb-1">AODV</strong>
                <p class="text-slate-300">Layer 3 reactive. Routes established on-demand (RREQ/RREP exchange). Low overhead in sparse networks. Route discovery adds 50–500 ms latency on first packet. Best for intermittent communication patterns.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase tracking-widest block mb-1">OLSR</strong>
                <p class="text-slate-300">Layer 3 proactive. Multipoint Relays (MPRs) reduce flooding overhead. Low per-packet latency but routing tables become stale at 10+ m/s drone speeds. Best for slow wide-area swarms.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border-l-4 border-purple-500">
                <strong class="text-purple-400 uppercase tracking-widest block mb-1">802.11s</strong>
                <p class="text-slate-300">Wi-Fi mesh with Airtime Link Metric. Built into the Linux kernel. Works with standard Wi-Fi chipsets. Low overhead. Best for short-range dense swarms under 500 m.</p>
            </div>
        </div>
        <div class="bg-slate-900 p-3 rounded border border-slate-700 mt-3 text-xs text-slate-400">
            <strong class="text-slate-300">LoRa Mesh (Meshtastic stack)</strong> — Range: km-scale. Bandwidth: ~250 bps. Latency: 500–2000 ms. Cannot support real-time formation control. Used only for telemetry-only swarm coordination where covertness or extreme range matters more than responsiveness.
        </div>
    </div>

    <h4 class="mt-6">15.3.2 MAVLink v2 for Multi-Vehicle Swarms</h4>
    <p>MAVLink v2 is the dominant telemetry/command protocol for PX4 and ArduPilot drones. Each message carries a 1-byte System ID and 1-byte Component ID, supporting up to 255 distinct drones on the same link. Key swarm-relevant message types:</p>
    <ul class="space-y-1 text-sm mt-2">
        <li><code>HEARTBEAT</code> (1 Hz) — announces presence, base mode, armed state to all nodes</li>
        <li><code>GLOBAL_POSITION_INT</code> (up to 10 Hz) — position broadcast for Boids and formation logic</li>
        <li><code>FOLLOW_TARGET</code> — specifies leader-follower offset and target position</li>
        <li><code>NAMED_VALUE_FLOAT</code> — generic swarm state parameters (pheromone levels, task IDs, bid values)</li>
    </ul>
    <p class="mt-2 text-sm">MAVLink v2 added <strong>packet signing</strong> (SHA-256 HMAC truncated to 48 bits) for authentication, preventing spoofed command injection into the swarm. For swarms larger than ~20 drones, teams run a <strong>MAVLink Router</strong> multiplexer on a companion computer to fan-out messages, and overlay swarm-state via ROS 2 topics or custom UDP multicast. MAVSDK (C++/Python SDK) added multi-vehicle telemetry aggregation in its 2023 releases, simplifying management of small swarms from a single ground station.</p>

    <h4 class="mt-6">15.3.3 Time Synchronization</h4>
    <p>Coordinated maneuvers — simultaneous strikes, synchronized light shows, GPS-denied formation flight — require sub-millisecond time agreement across the entire swarm:</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs">
        <div class="bg-slate-900 p-3 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-1">GPS/GNSS Timing</strong>
            <p class="text-slate-300">10–20 ns accuracy when satellite lock is held. All drones reference the same satellite time pulse, giving globally synchronized clocks at no additional hardware cost. Fails when GPS is jammed or spoofed — which is precisely when tight coordination is needed most.</p>
        </div>
        <div class="bg-slate-900 p-3 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-1">PTP (IEEE 1588)</strong>
            <p class="text-slate-300">Sub-microsecond accuracy over Ethernet/Wi-Fi. A GNSS-disciplined ground clock distributes time to all drones via PTP. Used in commercial drone light shows (Nova Sky Stories) to ensure every drone executes the same animation frame at the same sub-millisecond moment even under RF stress.</p>
        </div>
        <div class="bg-slate-900 p-3 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-1">UWB Timestamps</strong>
            <p class="text-slate-300">UWB chips (e.g. DW3000) achieve 2–10 cm ranging accuracy with nanosecond-level timestamps. A UWB mesh doubles as both a relative positioning system and a time reference — cm-accurate formation control with zero GPS dependency. Immune to GPS spoofing.</p>
        </div>
    </div>

    <div class="bg-slate-800 p-4 rounded border-l-4 border-amber-500 text-sm text-slate-300 mt-4">
        <strong>Latency Budget Reference</strong><br><br>
        <strong>Collision avoidance:</strong> handled entirely onboard — effectively 0 ms network latency.<br>
        <strong>Formation control updates:</strong> &lt;50 ms required. Wi-Fi mesh at 100 m delivers 5–30 ms; at 500 m (2–3 hops) rises to 80–200 ms.<br>
        <strong>Task allocation / replanning:</strong> &lt;500 ms acceptable.<br>
        <strong>LoRa telemetry:</strong> 500–2000 ms — formation control impossible, telemetry only.<br>
        <strong>Hop accumulation:</strong> each additional mesh hop adds 5–20 ms; 5-hop chains are the practical real-time limit.<br>
        <strong>Topology scaling:</strong> sparse k-nearest-neighbor topology limits bandwidth demand to O(N&middot;k) vs. O(N&sup2;) for fully-connected — mandatory for large swarms.
    </div>

    <h3>15.4 Formation Control & Task Allocation</h3>

    <h4>15.4.1 Formation Control Architectures</h4>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
            <strong class="text-sky-400 uppercase tracking-widest text-xs block mb-2">Virtual Structure</strong>
            <p class="text-sm text-slate-300">The swarm acts as a rigid virtual body. Each drone occupies a fixed offset from a virtual centroid that moves along the planned path. Mathematically guarantees relative position maintenance. Formation changes are smooth (morph the virtual body geometry). Requires all drones to know centroid position — not truly decentralized. Poor adaptability to irregular terrain or obstacle fields.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
            <strong class="text-emerald-400 uppercase tracking-widest text-xs block mb-2">Leader-Follower</strong>
            <p class="text-sm text-slate-300">A designated leader executes the planned trajectory; followers maintain fixed offset from their predecessor. Simple and low-computation. Critical vulnerability: leader failure collapses the chain. Mitigated with automatic consensus-based leader re-election. Chain topologies (A&#8594;B&#8594;C&#8594;D) accumulate position error along the chain; direct-to-leader topologies avoid this at the cost of all-to-one communications bandwidth.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
            <strong class="text-purple-400 uppercase tracking-widest text-xs block mb-2">Fully Distributed</strong>
            <p class="text-sm text-slate-300">Every drone is equal. Each runs the same local algorithm using only k-nearest-neighbor information. No single point of failure. Scales to hundreds of drones. Used in Boids-based and pure consensus-based systems. Harder to guarantee exact global formation shape — formation emerges statistically rather than deterministically from local rules.</p>
        </div>
    </div>

    <h4 class="mt-6">15.4.2 CBBA — The Gold Standard for Task Allocation</h4>
    <p><strong>Consensus-Based Bundle Algorithm (CBBA)</strong>, developed at MIT Aerospace Controls Lab, is the most widely studied decentralized multi-agent task allocation algorithm. Each agent greedily builds a task bundle (ordered list of tasks it will execute), then runs consensus rounds to resolve conflicts when two agents win the same task. CBBA is <em>provably bounded</em>: solution quality is within a known factor of optimal.</p>

    <div class="insight-box">
        <div class="insight-label">CBBA In a Nutshell</div>
        <p class="text-slate-200 text-sm mt-1">Each drone independently bids on tasks based on reward minus travel cost. Agents then share bids with neighbors, yielding any task where a neighbor bid higher. This bid + consensus loop repeats until stable — converging in rounds proportional to the network diameter. Expand below to see the algorithm pseudocode.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details &#9660;</summary>
<div class="math-block">
CBBA Phase 1 — Bundle Building (each agent independently):
  For each unassigned task t:
    score(t) = reward(t) - travel_cost(current_pos -> t) - deadline_penalty(t)
    if score(t) > 0: append t to bundle, update current position estimate
  Broadcast (bundle, bid scores, winning_agent_ids) to neighbors

CBBA Phase 2 — Consensus (repeat until stable):
  For each task t in messages from neighbors:
    if neighbor_bid(t) > my_bid(t): accept neighbor winner, release t from my bundle
  Re-run Phase 1 if bundle changed
  Convergence guaranteed in O(network diameter) rounds</div>
</details>

    <p class="mt-3 text-sm">Key 2024–2025 CBBA extensions:</p>
    <ul class="space-y-2 text-sm mt-1">
        <li><strong>TLC-CBBA (Two-Level Clustered CBBA):</strong> Groups UAVs into clusters using graph-theoretic centrality and shortest-path distance. Demonstrated <strong>13.2–36.5% reduction</strong> in overall scheduling cost vs. standard CBBA at scale (PMC, 2025).</li>
        <li><strong>Gossip-CBBA:</strong> Replaces structured communication rounds with gossip dissemination, enabling rapid task reallocation within seconds when a drone fails mid-mission (IEEE, 2025).</li>
        <li><strong>GWO-CBBA:</strong> Integrates Grey Wolf Optimizer for fleet sizing with CBBA for assignment; demonstrated significant mileage cost reduction in multi-UAV surveys (MDPI Drones, 2024).</li>
    </ul>

    <h4 class="mt-6">15.4.3 Coverage Path Planning (CPP)</h4>
    <p>CPP divides a search area among N drones so every point is visited in minimum total time. Common approaches:</p>
    <ul class="space-y-2 text-sm mt-2">
        <li><strong>Boustrophedon decomposition ("lawnmower"):</strong> Divides area into strips; each drone covers its strip back-and-forth. Simple but wastes time at strip boundaries and performs poorly on irregular terrain.</li>
        <li><strong>Voronoi partitioning:</strong> Each drone is assigned the set of points closest to it (its Voronoi cell). Adapts naturally to drone starting positions; cells are then covered individually with lawnmower patterns.</li>
        <li><strong>ACO-CPP (ScienceDirect, 2025):</strong> ACO optimizes full routing for irregular field shapes with no-fly zones, outperforming A* and genetic algorithms. The pheromone trails encode learned good route structures across many simulation runs.</li>
    </ul>
    <p class="text-sm mt-2">Typical performance: <strong>4–8 drones cover 1 km&sup2; in 10–20 minutes</strong> at 10 m/s cruise speed with 80 m sensor swath. In-flight replanning (Journal of Field Robotics, 2024) handles mid-mission drone failure by redistributing uncovered cells to surviving drones within seconds.</p>

    <h3>15.5 Multi-Agent AI & Machine Learning</h3>

    <h4>15.5.1 Multi-Agent Reinforcement Learning (MARL)</h4>
    <p>MARL is the dominant paradigm for learned swarm control. Each drone is an agent that learns a policy (observation &#8594; action) by maximizing cumulative reward in a shared environment. The three most common cooperative MARL algorithms in drone research (2023–2025):</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs">
        <div class="bg-slate-900 p-3 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-1">MAPPO</strong>
            <p class="text-slate-300">Multi-Agent Proximal Policy Optimization. The dominant algorithm for continuous action spaces (drone velocity control). Uses centralized training with decentralized execution (CTDE) — the critic sees global state during training, but the deployed policy uses only local observations. Most-cited algorithm in 2023–2025 drone swarm literature.</p>
        </div>
        <div class="bg-slate-900 p-3 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-1">QMIX</strong>
            <p class="text-slate-300">Factored value function: global Q-value is decomposed into per-agent Q-values via a learned mixing network. Efficient training, naturally yields decentralized policies. Monotonicity constraint on the mixing network guarantees that individual agent actions that improve local Q also improve global Q.</p>
        </div>
        <div class="bg-slate-900 p-3 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-1">MADDPG</strong>
            <p class="text-slate-300">Multi-Agent Deep Deterministic Policy Gradient. Each agent has its own actor-critic pair; critics are centralized during training. Well-suited for mixed cooperative-competitive scenarios. Higher sample complexity than MAPPO — typically requires 2–5x more environment interactions to converge.</p>
        </div>
    </div>
    <p class="text-sm mt-3"><strong>MARLander</strong> (arXiv, 2024) solved the challenging problem of collision-free simultaneous landing of a drone swarm at relocated target positions using decentralized MARL — a critical capability for autonomous redeployment and recovery operations.</p>

    <h4 class="mt-6">15.5.2 Graph Neural Networks (GNN) for Swarm Communication</h4>
    <p>GNNs model the swarm as a dynamic graph: drones are nodes, communication links are edges. Each drone aggregates information from its current neighbors using learned attention weights, then acts. Three properties make GNNs uniquely suited for swarms:</p>
    <ul class="space-y-2 text-sm mt-2">
        <li><strong>Permutation invariance:</strong> Output does not depend on the arbitrary ordering of neighbors — correct behavior regardless of how drones number each other.</li>
        <li><strong>Size generalization:</strong> A policy trained with 10 drones can be deployed with 50 without retraining — impossible with fixed-input MLPs. Critical for scaling from simulation (small) to real deployment (large).</li>
        <li><strong>Dynamic topology:</strong> As drones move in and out of communication range, the graph rewires. Graph Attention Networks (GAT) learn which current neighbors to weight most heavily, adapting in real time.</li>
    </ul>
    <p class="text-sm mt-2">A 2025 ScienceDirect paper introduced a <strong>Graph Diffusion Network</strong> for multi-agent drone swarm exploration — propagating information across the graph with learned diffusion rates, achieving faster collective decision convergence than message-passing GNNs on sparse topologies.</p>

    <h4 class="mt-6">15.5.3 Sim-to-Real Transfer</h4>
    <p>Training drone swarm policies in simulation before deploying on real hardware is the standard workflow. Key platforms:</p>
    <ul class="space-y-2 text-sm mt-2">
        <li><strong>NVIDIA Isaac Sim + Pegasus Simulator:</strong> Photorealistic physics simulation with full PX4/ArduPilot integration. Pegasus Simulator (open-source, 2023) supports parallel simulation of multiple aerial vehicles in a single Isaac environment.</li>
        <li><strong>Aerial Gym (Isaac Gym):</strong> Trains swarm RL policies by simulating hundreds of drones in parallel — dramatically faster than sequential simulation. Standard pipeline: Isaac Gym training &#8594; ONNX model export &#8594; Gazebo SITL validation &#8594; real hardware deployment.</li>
        <li><strong>Webots (Cyberbotics):</strong> Lighter-weight open-source simulator. Widely used in published swarm research for 100–1,000 simulated drones when Isaac compute is unavailable.</li>
        <li><strong>Domain randomization:</strong> Vary mass, motor constants, and wind during training so learned policies are robust to real-world parameter mismatch — the primary cause of sim-to-real failure.</li>
    </ul>

    <h4 class="mt-6">15.5.4 LLM-Based Mission Planning</h4>
    <p><strong>SwarmGPT</strong> (arXiv, 2024) demonstrated LLM-based swarm choreography: a high-level GPT layer generates drone formations and movements from natural language descriptions; a low-level optimization filter ensures collision-free, dynamically feasible execution. Validated in simulation for up to <strong>200 drones</strong> and on real hardware with <strong>20 drones</strong>.</p>
    <p class="mt-2 text-sm">Multimodal formation control using GPT-4V processes images from a leading UAV to plan formation adjustments, achieving an <strong>83.8% planning success rate</strong> for image-based commands. Key architectural constraint: LLM inference latency (500 ms–5 s) precludes real-time control. LLMs operate exclusively at the <em>mission-planning layer</em> (seconds to minutes timescale); classical control or RL handles all low-level flight.</p>

    <h3>15.6 Military Programs & Combat Applications</h3>

    <figure class="my-6">
        <img src="images/m15_drone_swarm_formation.jpg" alt="US Army drone swarm prepared for formation flight during Marne Focus 2024 at Fort Stewart, Georgia" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">A drone swarm operated by the Threat System Management Office prepares to fly in formation during Marne Focus 2024 at Fort Stewart, Georgia, April 7, 2024. Source: <a href="https://www.dvidshub.net/image/8334790/marne-focus-2024-drone-swarm" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">DVIDS / Staff Sgt. Jacob Slaymaker, U.S. Army (Public Domain)</a></figcaption>
    </figure>

    <h4>15.6.1 DARPA OFFSET — Urban Swarm Tactics (Final Results)</h4>
    <p>OFFSET (OFFensive Swarm-Enabled Tactics) ran from 2017 to 2022 as DARPA's flagship urban swarm program, aiming to equip squad-level infantry with swarms of 250+ heterogeneous air and ground robots for close combat in cities. The six field experiments (FX-1 through FX-6) produced concrete, published results:</p>
    <div class="bg-slate-900 p-4 rounded border border-slate-700 mt-3">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-center">
            <div>
                <span class="text-sky-400 font-bold block mb-1">FX-6 Max Platforms</span>
                <span class="text-white text-2xl font-mono block">300+</span>
                <span class="text-slate-400">combined air + ground, two integrators</span>
            </div>
            <div>
                <span class="text-sky-400 font-bold block mb-1">Physical Drones</span>
                <span class="text-white text-2xl font-mono block">130</span>
                <span class="text-slate-400">single operator (Raytheon FX-5, Fort Campbell)</span>
            </div>
            <div>
                <span class="text-sky-400 font-bold block mb-1">Tactics Library</span>
                <span class="text-white text-2xl font-mono block">100+</span>
                <span class="text-slate-400">documented, operationally relevant swarm tactics</span>
            </div>
            <div>
                <span class="text-sky-400 font-bold block mb-1">Program Concluded</span>
                <span class="text-white text-2xl font-mono block">2022</span>
                <span class="text-slate-400">&#8594; classified follow-on transition</span>
            </div>
        </div>
    </div>
    <p class="text-sm mt-3">Key OFFSET findings:</p>
    <ul class="space-y-2 text-sm mt-1">
        <li><strong>Human-swarm interface:</strong> VR headset, AR tablet, sketch tablet, and mobile phone interfaces all demonstrated 90%+ task accuracy for commanding 100+ drones via intent ("clear the block," "establish overwatch at building 4") decomposed automatically into individual assignments. The voice + VR pointing interface proved most operator-friendly.</li>
        <li><strong>Virtual-physical hybrid operations:</strong> FX-6 (Fort Campbell, November 2021) combined 300+ total platforms by running "virtual" simulated swarm agents alongside physical robots in the same mission — allowing a small physical test force to stand in for a full 250-drone squad.</li>
        <li><strong>HiveXL drone carrier (Sentien Robotics):</strong> A ground vehicle autonomously launched, recovered, and recharged up to 80 drones — demonstrating logistics-free sustained swarm operations without human intervention on the recharge/relaunch loop.</li>
        <li><strong>Johns Hopkins APL:</strong> Demonstrated fixed-wing UAVs performing aggressive maneuvers in tight urban corridors with onboard collision avoidance — proving high-speed fixed-wing viability in GPS-degraded urban canyons.</li>
        <li><strong>Transition outcome:</strong> DARPA program manager Timothy Chung stated "these swarm capabilities are rapidly nearing availability for future operations" at FX-6 conclusion. Specific transition recipients were not publicly disclosed.</li>
    </ul>

    <h4 class="mt-4">15.6.2 Perdix — First Combat Swarm from Fighter Aircraft</h4>
    <p>In October 2016, three US Navy F/A-18 Super Hornets released <strong>103 Perdix micro-UAVs</strong> over China Lake, California — the world's largest autonomous swarm demonstration at the time. Each Perdix was 6.5 inches long, weighed 290 g, and had a wingspan under 12 inches, designed for low-cost mass production. Drones survived Mach 0.6 ejection speeds and -10&deg;C temperatures.</p>
    <p class="text-sm mt-2">What distinguished Perdix was its <em>shared autonomy</em> architecture: drones had no pre-programmed behaviors. They negotiated behaviors collectively in real time — demonstrating adaptive formation flight and self-healing (when drones dropped out, the swarm reorganized automatically with no operator input). "Perdix are not pre-programmed synchronized individuals, they are a collective organism, sharing one distributed brain for decision-making." Developed at MIT Lincoln Laboratory; after the public demonstration the program transitioned to classified follow-on development.</p>

    <h4 class="mt-4">15.6.3 US Navy LOCUST — Tube-Launched Swarms</h4>
    <p>The Office of Naval Research (ONR) LOCUST (Low-Cost UAV Swarming Technology) program demonstrated <strong>30 Coyote UAVs tube-launched in rapid succession</strong> from a naval vessel in 2016. The <strong>Coyote</strong> (manufacturer: <strong>Raytheon / RTX</strong>) launches from a sonobuoy-type pneumatic canister — wings unfold immediately after ejection, and the drone autonomously joins the swarm.</p>
    <div class="bg-slate-900 p-4 rounded border border-slate-700 mt-3 text-xs">
        <strong class="text-sky-400 block mb-2">Coyote UAS Family — Key Variants</strong>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="border-l-2 border-sky-500 pl-2">
                <strong class="text-sky-300 block">Block 1 / 1B</strong>
                <p class="text-slate-300">Original; electric motor; ~5.9 kg; 1.5 m wingspan; sonobuoy canister launch; ISR/EW payload; 55 kt cruise, 70 kt dash; ~90 min endurance. LOCUST program demonstrator.</p>
            </div>
            <div class="border-l-2 border-emerald-500 pl-2">
                <strong class="text-emerald-300 block">Block 2C</strong>
                <p class="text-slate-300">Jet-powered upgrade; 555–595 km/h (345–370 mph); kinetic C-UAS interceptor with RF seeker. US Army purchased 600 units ($75M, January 2024); 6,000 more on order for 2025–2029.</p>
            </div>
            <div class="border-l-2 border-purple-500 pl-2">
                <strong class="text-purple-300 block">Block 3NK / Coyote LE SR</strong>
                <p class="text-purple-300 font-semibold">Non-kinetic, recoverable, reusable</p>
                <p class="text-slate-300">Non-kinetic/RF warhead defeats drone swarms without fragmentation. Recoverable and reusable — fundamentally changes cost-per-engagement economics. Renamed "Coyote LE SR" in 2025. Test-fired from M2 Bradley TOW launcher and Modular Effects Launcher rack (March 2025).</p>
            </div>
        </div>
    </div>
    <p class="text-sm mt-3">ONR awarded Raytheon a $29.7M LOCUST development contract in 2018. LOCUST capabilities were absorbed into the broader Navy counter-swarm mission by ~2021. By 2025, Coyote is also integrated aboard Arleigh Burke-class destroyers (USS Bainbridge, USS Winston S. Churchill) for fleet air defense.</p>

    <h4 class="mt-4">15.6.4 Pentagon Replicator &#8594; DAWG (2023–2025)</h4>
    <p>Announced August 2023, Replicator aimed to field <strong>thousands of all-domain attritable autonomous systems (ADA2)</strong> by August 2025. Replicator 1 targeted small air/surface/undersea systems for Pacific deterrence; Replicator 2 (announced September 2024) focused on counter-sUAS.</p>
    <div class="bg-slate-800 p-4 rounded border-l-4 border-rose-500 text-sm text-slate-300 mt-2">
        <strong class="text-rose-400">Outcome, Organizational Change &amp; Scale-Up:</strong><br><br>
        By August 2025, DoD fielded <strong>"hundreds" not thousands</strong> of systems — hardware procurement was tractable but software coordination of heterogeneous platforms at operational tempo remained the hard bottleneck. The Pentagon dissolved Replicator in late 2025, absorbing it into the <strong>Defense Autonomous Warfare Group (DAWG)</strong>. DAWG is now conducting wargames targeting larger, longer-range attack UAS.<br><br>
        In November 2024, DIU contracted seven firms for two parallel software programs: <strong>ORIENT</strong> (mesh networking for heterogeneous swarms) and <strong>ACT</strong> (Autonomous Collaborative Teaming algorithms). These contracts reveal where the real technical difficulty lies: not procurement, but coordination intelligence. In FY2026, the White House requested <strong>$54.6 billion for DAWG</strong> — a ~24,000% single-year increase — signaling the strategic priority of autonomous mass in the Indo-Pacific.
    </div>

    <h4 class="mt-4">15.6.5 Auterion — First Multi-Manufacturer Combat Drone Swarm (2025)</h4>
    <p>In December 2025, Swiss-American company Auterion completed the <strong>world's first live demonstration of a combat drone swarm made up of aircraft from multiple manufacturers</strong>, conducted in Munich for government customers. The hybrid swarm comprised eight short-range FPV munitions and two medium-range fixed-wing platforms from three different manufacturers — executing a full end-to-end kill chain from target detection to strike under Auterion's <strong>Nemyx</strong> autonomous coordination engine.</p>
    <p class="text-sm mt-2">In a follow-on January 2026 demonstration at Camp Blanding, Florida — the <strong>first kinetic drone swarm on American soil</strong> — a single US military operator commanded three types of FPV drones equipped with kinetic payloads to strike multiple targets near-simultaneously using a common communication network. Both demonstrations mark a decisive shift: interoperability across manufacturers is now a solved problem at the software layer, removing the last major procurement barrier to heterogeneous swarm deployment.</p>

    <h4 class="mt-4">15.6.6 China Atlas Drone Swarm System</h4>
    <p>CETC (China Electronics Technology Group Corporation) demonstrated 119 fixed-wing drones in 2017 (then a world record) and 200 drones in 2020. The <strong>Atlas (Swarm-2) system</strong> debuted publicly at Airshow China 2024 (Zhuhai):</p>
    <ul class="space-y-1 text-sm mt-2">
        <li>A single Swarm-2 <strong>ground combat vehicle</strong> carries and launches <strong>48 fixed-wing drones</strong></li>
        <li>A single command vehicle controls up to <strong>96 drones simultaneously</strong> with a <strong>3-second launch speed</strong> for the full complement</li>
        <li>Modular payloads: EO/IR reconnaissance, strike munitions, or comms relay</li>
        <li>January 2026 PLA demonstration: <strong>200-drone swarm controlled by a single soldier</strong></li>
        <li>March 2026 full-process demonstration: system autonomously conducted reconnaissance, identified a command vehicle, opened the launcher, and initiated launch — described as "algorithm-driven combat" requiring no per-target human approval in the engagement loop</li>
    </ul>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">China's Atlas Drone Swarm System — Live Demonstration</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/Tv6KVjyjaY0" title="China Unveils Atlas Drone Swarm System | WION" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-gray-400 text-sm mt-2">WION coverage of China's Atlas/Swarm-2 system debut at Airshow China 2024 (Zhuhai) — showing the ground-vehicle launcher, 48-drone payload, and autonomous coordination software.</p>
    </div>

    <h4 class="mt-4">15.6.7 Ukraine War — Real-World Swarm-Adjacent Lessons</h4>
    <p>The Russia-Ukraine conflict (2022–present) is the most significant real-world proving ground for mass drone operations, providing hard lessons on what swarm-like tactics actually look like under live combat conditions.</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div class="bg-slate-900 p-4 rounded border-l-4 border-rose-500">
            <strong class="text-rose-400 uppercase tracking-widest text-xs block mb-2">FPV Attrition Economics</strong>
            <p class="text-sm text-slate-300">FPV kamikaze drones became the dominant casualty-causing weapon at squad level by 2023 — responsible for ~90% of wounds near the front in areas like Chasiv Yar. FPV drones disabled 800+ Russian main battle tanks worth over $1.5B — at $500–$2,000 per drone vs. $3–5M per tank. This cost asymmetry is strategically transformative: a country can field tens of thousands of attack drones for the price of a single MBT.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
            <strong class="text-amber-400 uppercase tracking-widest text-xs block mb-2">Electronic Warfare &amp; Fiber-Optic Bypass</strong>
            <p class="text-sm text-slate-300">GPS jamming became so pervasive that by 2024 both sides deployed <strong>fiber-optic guided FPV drones</strong> — control signals travel through a physical cable that pays out during flight, making them completely jam-proof at ranges up to ~10 km. Implication for swarm designers: any swarm operating in contested EW environments must assume GPS will be intermittently denied and design visual/inertial fallback navigation as the default, not an edge case.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
            <strong class="text-sky-400 uppercase tracking-widest text-xs block mb-2">Saturation Without Autonomy</strong>
            <p class="text-sm text-slate-300">Russian Shahed-136 attacks launched synchronized salvos of 20–100+ drones with pre-programmed GPS waypoints — not algorithmic swarms, but tactically effective mass coordinated launch. Ukraine's interception rate improved from ~50% (2022) to over 80% (2024) through AI-assisted multi-target tracking and rapid-reload interceptors. Key lesson: <em>quantity overwhelms defenses</em> even without tight algorithmic coordination.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
            <strong class="text-purple-400 uppercase tracking-widest text-xs block mb-2">NATO Hedgehog Exercise (2026)</strong>
            <p class="text-sm text-slate-300">NATO exercise demonstrated that <strong>10 Ukrainian operators with drones</strong> could neutralize two conventional battalions in a single day. This force-ratio inversion — 10 operators defeating thousands of troops — represents the strategic shock that is driving every major military's urgent investment in both swarm offense and counter-swarm defense.</p>
        </div>
    </div>

    <figure class="my-6">
        <img src="images/m15_combined_resolve_swarm.jpg" alt="US soldiers react to a simulated drone swarm attack during Exercise Combined Resolve 24-2, Hohenfels Germany, May 2024" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">U.S. Soldiers (101st Airborne Division) react to a drone swarm attack simulation during Exercise Combined Resolve 24-2 at the Joint Multinational Readiness Center, Hohenfels, Germany, May 29, 2024. Counter-swarm training is now a standard element of NATO brigade-level exercises. Source: <a href="https://www.dvidshub.net/image/8436784/combined-resolve-24-2-drone-swarm-attack" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">DVIDS / Sgt. 1st Class Brandon Nelson, 109th MPAD (Public Domain)</a></figcaption>
    </figure>

    <h3>15.7 Civilian & Commercial Deployments</h3>

    <h4>15.7.1 Drone Light Shows — The World's Largest Deployed Swarms</h4>
    <p>Commercial drone light shows are the largest real-world swarm deployments today, operating under a key architectural principle: <em>centralized planning, decentralized execution</em>. One ground computer plans all paths and assigns all pixel positions; each drone executes its individual trajectory autonomously with no inter-drone coordination during the show.</p>
    <p class="text-sm mt-2">Intel's <strong>Shooting Star</strong> (58 g quadcopter, 30 cm diameter, LED with 4 billion color combinations) set a 500-drone world record in 2016 and appeared at Super Bowl LI with 300 drones. Intel sold the division to <strong>Nova Sky Stories</strong> (Kimbal Musk, Jeffrey Katzenberg) in 2022. Nova Sky Stories as of 2025–2026:</p>
    <ul class="space-y-1 text-sm mt-1">
        <li>Manufacturing 12,000 drones by end of 2025; projected ~30,000 by end of 2026</li>
        <li>3,000+ drones performed over St. Peter's Basilica, Vatican (Grace for the World concert)</li>
        <li>10,000-drone show planned for Abu Dhabi — would exceed the December 2024 Chinese record of ~8,000</li>
    </ul>
    <p class="text-sm mt-2">Time synchronization: GNSS-disciplined ground clock distributed via PTP-style time-tagged cues ensures every drone executes the same animation frame simultaneously, even under RF congestion from thousands of simultaneous transmitters.</p>

    <h4 class="mt-4">15.7.2 Agricultural Drone Swarms</h4>
    <p>Agriculture is the most economically mature real-world multi-drone deployment. By end of 2023, over <strong>300,000 agricultural drones</strong> operated in 100+ countries, treating over <strong>500 million hectares</strong> of farmland by June 2024. DJI Agras T100 (2024) and XAG P100 are the leading platforms.</p>
    <p class="text-sm mt-2">A typical multi-drone operation: one drone autonomously surveys a field and generates a prescription map; 3–8 sprayer drones execute the plan in parallel with the coordination app ensuring no zones overlap and battery swaps are staggered. A 2024 ScienceDirect paper demonstrated fully autonomous AI-based UAV swarm for weed detection and precision treatment in organic orchards — scout drones identify weed locations, worker drones treat only flagged locations — demonstrating true heterogeneous task allocation in a commercial agricultural context.</p>

    <h4 class="mt-4">15.7.3 Search & Rescue and Wildfire Monitoring</h4>
    <ul class="space-y-3 text-sm mt-2">
        <li><strong>NASA FireTech project:</strong> AI-enabled drone swarms for wildfire detection, mapping, and fire behavior modeling. Hierarchical heterogeneous architecture — fast fixed-wing scouts map the fire perimeter; quadrotor relay drones maintain communications in mountainous terrain; persistent monitoring drones track fire spread over multi-hour missions. Active project under NASA Earth Science and Technology Office.</li>
        <li><strong>FAA Reauthorization Act 2024, Section 910:</strong> Directed the FAA to expand UAS integration in wildfire response and develop standardized airspace coordination procedures — formally acknowledging that the regulatory bottleneck, not the technology, is blocking operational swarm deployment over populated areas.</li>
        <li><strong>SAR status (2024):</strong> Drone swarm SAR remains largely in research/prototype stage. Algorithms are proven; regulatory approval for fully autonomous BVLOS swarm operations remains the primary barrier. Typical research systems demonstrate 3–8 heterogeneous drones (scout + relay + searcher roles) covering 1 km&sup2; in 8–15 minutes.</li>
    </ul>

    <h3>15.8 Security & Resilience</h3>

    <h4>15.8.1 Anti-Jamming</h4>
    <p>Swarm communication operates over contested RF spectrum. Primary countermeasures used in field-deployable systems:</p>
    <ul class="space-y-2 text-sm mt-2">
        <li><strong>Frequency Hopping Spread Spectrum (FHSS):</strong> Hops across frequency channels in a shared pseudo-random sequence. A jammer must cover every channel simultaneously — requiring wideband jamming power that also reveals the jammer's location to passive RF detection systems.</li>
        <li><strong>Direct Sequence Spread Spectrum (DSSS):</strong> Spreads signal across wide bandwidth; processing gain makes it appear as noise to narrowband receivers. More spectrally efficient than FHSS but requires wider channel allocation.</li>
        <li><strong>UWB Communication:</strong> Inherently wideband (500 MHz–9 GHz) — narrowband jamming is ineffective. Provides simultaneous ranging and communication in a single jam-resistant physical layer.</li>
        <li><strong>Mesh self-healing:</strong> BATMAN-adv automatically reroutes around jammed nodes within one OGM period (~1 second). A swarm transiting a jammed zone loses the jammed nodes locally but the surviving mesh continues coordinating.</li>
    </ul>

    <h4 class="mt-4">15.8.2 GPS Spoofing Countermeasures</h4>
    <p>GPS spoofing is uniquely dangerous for swarms: false position injected simultaneously into multiple drones causes <em>correlated formation collapse</em> — the entire swarm navigates confidently toward the wrong location, potentially into obstacles or an adversary kill zone.</p>
    <div class="bg-slate-900 p-4 rounded border border-slate-700 mt-3 text-sm">
        <p class="text-slate-300 font-bold mb-2">Multi-Layer Spoofing Defense:</p>
        <ol class="text-slate-300 space-y-2 list-decimal pl-4">
            <li><strong>Multi-constellation GNSS:</strong> Simultaneously receive GPS + GLONASS + Galileo + BeiDou. Spoofing all four simultaneously requires four independent transmitters — dramatically increases attacker cost, equipment complexity, and RF signature detectability.</li>
            <li><strong>UWB relative positioning:</strong> UWB ranging is immune to GPS spoofing. Even if absolute GPS is fully compromised, drones know their position relative to each other with cm-level accuracy — formation integrity is preserved even without valid absolute coordinates.</li>
            <li><strong>Vision-based SLAM:</strong> Onboard cameras and depth sensors provide position independent of GPS. Onboard SLAM position is continuously cross-checked against GPS; position-jump discontinuities trigger a spoofing alert and GPS exclusion.</li>
            <li><strong>Swarm consensus verification (SwarmRaft):</strong> Periodic cross-verification of geolocation data among swarm members using consensus voting. A drone reporting an anomalous position jump inconsistent with all neighbors is flagged as potentially spoofed and isolated from formation control until verified.</li>
        </ol>
    </div>

    <h4 class="mt-4">15.8.3 Byzantine Fault Tolerance</h4>
    <p>A Byzantine fault is a node that sends incorrect or conflicting information — due to hardware failure, software bug, or deliberate adversary compromise. Classic BFT (PBFT) requires N &gt; 3f+1 total nodes when f nodes may be Byzantine, but requires O(N&sup2;) messages — impractical beyond ~20 nodes in a mobile network.</p>
    <p class="text-sm mt-2"><strong>SwarmRaft</strong> (arXiv, 2025) adapts the Raft consensus algorithm for drone swarms: fully decentralized (no central fusion authority), tolerates Byzantine nodes under mild density assumptions, and reduces communication overhead to O(N log N). <strong>BCoD (Blockchain of Drones)</strong> applies a blockchain-style append-only ledger for swarm identity management and command authentication, addressing the low throughput and high latency limitations of classic PBFT in mobile ad-hoc environments.</p>

    <h4 class="mt-4">15.8.4 Counter-Swarm Systems (C-UAS) — Layered Defense</h4>
    <p>Defending against drone swarms requires layered "detect-track-defeat" capability. No single technology addresses all threat types — HPM handles mass targets simultaneously; kinetic handles fast maneuvering drones; RF jamming handles commercially-linked drones. The 2024–2026 generation of systems has matured rapidly under operational pressure from Ukraine and Middle East conflicts:</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
            <strong class="text-sky-400 uppercase tracking-widest text-xs block mb-2">Kinetic Interceptors — Coyote Block 2C</strong>
            <p class="text-sm text-slate-300"><strong>Raytheon Coyote Block 2C:</strong> Jet-powered; 555–595 km/h; kinetic RF-seeker warhead; 15+ km range from ground launcher. US Army purchased 600 units ($75M, January 2024); separately awarded Raytheon a <strong>$5.04 billion</strong> long-term contract (September 2025) covering Coyote Block 2C interceptors and KuRFS radars — the largest C-UAS contract in history. Limitation: one interceptor per target; insufficient throughput against swarms of hundreds.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
            <strong class="text-emerald-400 uppercase tracking-widest text-xs block mb-2">Non-Kinetic Interceptors — Coyote LE SR (Block 3NK)</strong>
            <p class="text-sm text-slate-300"><strong>Raytheon Coyote LE SR</strong> (formerly Block 3NK): Non-kinetic/RF warhead; <em>recoverable and reusable</em>; avoids fragmentation collateral damage in urban environments. Defeated multiple simultaneous drone swarms in February 2026 US Army demonstration. Launches from Bradley TOW launcher and Modular Effects Launcher (demonstrated March 2025). The reusability changes cost-per-engagement economics vs. one-shot kinetic interceptors. DoD plans to procure 700 units through 2029.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
            <strong class="text-amber-400 uppercase tracking-widest text-xs block mb-2">High-Power Microwave (HPM) — Epirus Leonidas</strong>
            <p class="text-sm text-slate-300"><strong>Epirus Leonidas:</strong> Gallium nitride solid-state HPM system with area effect — defeated a <strong>49-drone swarm with a single electromagnetic pulse</strong> (100% success rate, live-fire demonstration 2024). Neutralized 61-of-61 drones across five scenarios in August 2024 testing. Uniquely effective against swarms because one trigger can defeat 5–50 drones simultaneously, bypassing the one-interceptor-per-target throughput limit of all kinetic systems. US Army awarded Epirus $43.5M contract (July 2025) for next-generation systems. ExDECS variant under contract with US Navy for Marine Corps.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
            <strong class="text-purple-400 uppercase tracking-widest text-xs block mb-2">High-Energy Laser (HEL)</strong>
            <p class="text-sm text-slate-300"><strong>Lockheed HELIOS (60 kW), RTX HEL:</strong> ~$1 cost per shot once installed. Effective against slow small drones in clear weather. Limitations: beam divergence in rain or smoke; 1–5 second engagement time per drone limits throughput against large fast-moving swarms. Best used in combination with HPM as layered defeat.</p>
        </div>
    </div>
    <div class="bg-slate-800 p-4 rounded border-l-4 border-rose-500 text-sm text-slate-300 mt-3">
        <strong class="text-rose-400">Critical C-UAS Insight — Fiber-Optic Drones Bypass EW</strong><br><br>
        High-Power Microwave (HPM) is the <strong>only technology effective against fiber-optic guided drones</strong>. These drones, now common in Ukraine (10 km range, zero RF signature), cannot be jammed because there is no wireless link to disrupt. Leonidas HPM overloads drone electronics directly through the electromagnetic field — no reliance on any RF signature. This makes HPM a foundational capability for any C-UAS architecture facing peer-adversary drone swarms.
    </div>

    <h3>15.9 Hardware Platforms & Scale Reference</h3>

    <h4>15.9.1 Research Platforms</h4>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">Bitcraze Crazyflie 2.1</strong>
            <ul class="text-xs text-slate-300 space-y-1">
                <li>Weight: 27 g base; ~40 g with expansion decks</li>
                <li>Flight controller: STM32F405 + nRF51 radio</li>
                <li>AI Deck: GAP8 processor + ESP32 + Himax HM01B0 camera</li>
                <li>Indoor positioning: Lighthouse V2 (mm accuracy, up to 36 simultaneous), UWB Loco for larger areas</li>
                <li>Swarm stack: CrazySwarm2 (ROS 2); up to 255 drones per USB radio dongle via time-division multiplexing</li>
                <li>Typical research scale: 5–50 drones</li>
                <li>June 2025: 49-drone formation demonstrated by Bitcraze</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-emerald-400 block mb-2">UVify IFO-S</strong>
            <ul class="text-xs text-slate-300 space-y-1">
                <li>Compute: NVIDIA Jetson (runs multiple NNs simultaneously)</li>
                <li>Sensors: Intel RealSense (indoor nav + obstacle avoidance)</li>
                <li>Outdoor positioning: GPS + RTK GNSS for cm-level precision</li>
                <li>Protocol stack: Full PX4 + ROS 2</li>
                <li>Recommended commercial platform for PX4 swarm research (2024 Dronecode guidance)</li>
                <li>Light-show variant: quad-constellation GNSS, 25-min flight time, shown at ISE 2024</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2">Skydio X10</strong>
            <ul class="text-xs text-slate-300 space-y-1">
                <li>Launched: September 2023</li>
                <li>NightSense: zero-light autonomous flight (IR + computational photography)</li>
                <li>5G cellular connectivity option (bypasses RF jamming of traditional links)</li>
                <li>IP55 weather resistance; deployable from backpack in 40 seconds</li>
                <li>Dock ecosystem: autonomous launch/return for persistent multi-drone inspection</li>
                <li>Architecture: centralized cloud management + individual autonomy per drone (not peer-to-peer swarm intelligence)</li>
            </ul>
        </div>
    </div>

    <h4 class="mt-6">15.9.2 Algorithm Scalability Reference</h4>
    <div class="interactive-panel bg-[#0d1320] border-slate-700 mt-2">
        <h4 class="mt-0 border-none text-white text-sm">Scalability Limits by Algorithm</h4>
        <div class="overflow-x-auto mt-2">
            <div class="grid text-xs font-mono min-w-[480px]" style="grid-template-columns: 1fr 1fr 2fr;">
                <div class="text-slate-400 border-b border-slate-700 pb-1 font-bold">Algorithm</div>
                <div class="text-slate-400 border-b border-slate-700 pb-1 font-bold">Practical Limit</div>
                <div class="text-slate-400 border-b border-slate-700 pb-1 font-bold">Primary Bottleneck</div>

                <div class="text-sky-400 py-1 border-b border-slate-800">Boids (reactive)</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">Unlimited</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">None — O(k) per drone, fully local computation</div>

                <div class="text-emerald-400 py-1 border-b border-slate-800">APF (local)</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">Unlimited local; ~100 global</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">Global APF requires knowing all drone positions — bandwidth limited</div>

                <div class="text-amber-400 py-1 border-b border-slate-800">PSO (offline planning)</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">10–50</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">O(N&sup2;) compute — run on ground station, not onboard</div>

                <div class="text-purple-400 py-1 border-b border-slate-800">ACO (coverage)</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">5–30</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">Graph construction + slow convergence with many nodes</div>

                <div class="text-sky-400 py-1 border-b border-slate-800">CBBA</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">30–100</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">O(tasks &times; agents) communication rounds for consensus</div>

                <div class="text-emerald-400 py-1 border-b border-slate-800">TLC-CBBA (clustered)</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">100–500</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">Two-level communication overhead; cluster management</div>

                <div class="text-amber-400 py-1 border-b border-slate-800">MARL (trained policy)</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">10–100</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">Training complexity; generalization gap to unseen swarm sizes</div>

                <div class="text-purple-400 py-1 border-b border-slate-800">GNN-MARL (sparse graph)</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">50–500</div>
                <div class="text-slate-300 py-1 border-b border-slate-800">Inference time scales with graph density; size-generalizable</div>

                <div class="text-sky-400 py-1">Gossip consensus</div>
                <div class="text-slate-300 py-1">Effectively unlimited</div>
                <div class="text-slate-300 py-1">Convergence time O(log N) rounds; slow but robust</div>
            </div>
        </div>
    </div>

    <div class="bg-slate-800 p-4 rounded border-l-4 border-sky-500 text-sm text-slate-300 mt-4">
        <strong class="text-sky-400">Swarm Size in Context (2025–2026)</strong><br><br>
        <strong>Academic lab (indoor):</strong> 3–50 drones (Crazyflie, UVify IFO-S) |
        <strong>Outdoor research:</strong> 10–50 drones (GPS-dependent) |
        <strong>Commercial agriculture:</strong> 3–20 per coordinated mission |
        <strong>Commercial light shows:</strong> 100–10,000 (Nova Sky Stories) |
        <strong>Military demonstrations:</strong> 30–200 (OFFSET 130 physical / 300+ hybrid, Perdix 103, China 200) |
        <strong>Military programs (target):</strong> 250–1,000+ (DAWG aims for thousands; Replicator delivered hundreds) |
        <strong>Future projections:</strong> 1,000–10,000+ (US DAWG $54.6B program; China Atlas roadmap)
    </div>
</div>
`;
