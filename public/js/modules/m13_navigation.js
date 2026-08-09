export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 13</span>
    <h2>Path Planning &amp; Autonomous Navigation</h2>
    <p>Autonomous navigation is not a single algorithm — it is a layered architecture where each tier has a distinct time horizon and problem scope. Global planners compute optimal paths over known maps. Local planners react to real-time sensor data. Trajectory generators produce physically realizable motion for the quadrotor's dynamics. Getting all three tiers to interoperate correctly is the central engineering challenge. Modern autonomous drones additionally require GPS-denied localization, real-time SLAM, safety-critical control guarantees, and multi-agent coordination — each a deep sub-field with production-quality open-source implementations.</p>

    <h3>13.1 The Navigation Stack Architecture</h3>
    <p>The navigation stack is organized into four concentric loops operating at different frequencies. Understanding the time scales prevents the most common integration bugs.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Navigation Stack Layer Diagram</h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
                <strong class="text-purple-400 uppercase text-xs tracking-widest block mb-2">Mission Layer (0.1–1 Hz)</strong>
                <p class="text-slate-300 text-xs mb-1">High-level task sequencing — waypoint lists, survey grids, loiter patterns. Accepts operator commands or autonomy decisions.</p>
                <p class="text-slate-400 text-xs">Tools: MAVSDK, MAVLink mission items, Behavior Trees. Output: NavigateToPose goals.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase text-xs tracking-widest block mb-2">Global Planner (1–2 Hz)</strong>
                <p class="text-slate-300 text-xs mb-1">Computes the optimal path from current pose A to goal pose B over a known static map.</p>
                <p class="text-slate-400 text-xs">Algorithms: A*, Dijkstra, RRT*, Informed-RRT*, SMAC Hybrid-A*, D* Lite. Input: occupancy grid or voxel map. Output: waypoint list.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase text-xs tracking-widest block mb-2">Local Planner (20–50 Hz)</strong>
                <p class="text-slate-300 text-xs mb-1">Generates velocity commands that follow the global plan while avoiding obstacles detected live by sensors.</p>
                <p class="text-slate-400 text-xs">Algorithms: DWA, TEB, MPPI, EGO-Planner. Input: local costmap (recent LiDAR/depth). Output: cmd_vel or trajectory segment.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase text-xs tracking-widest block mb-2">Flight Controller (400 Hz)</strong>
                <p class="text-slate-300 text-xs mb-1">Executes attitude and rate commands from the companion computer. Runs PID/EKF loops for stability.</p>
                <p class="text-slate-400 text-xs">ArduPilot / PX4. Receives ATTITUDE_TARGET or SET_POSITION_TARGET_LOCAL_NED via MAVLink.</p>
            </div>
        </div>
    </div>

    <h3>13.2 Costmaps: The Spatial Representation of Risk</h3>
    <p>A costmap is a 2D (or 3D) grid where every cell holds a value in [0, 254]. Cost 0 means free space. Cost 254 (lethal) means confirmed obstacle. Values in between are produced by the <strong>inflation radius</strong>: cells near an obstacle receive an exponentially decaying cost. This forces the planner to treat proximity to walls as risky even if they are technically traversable, producing paths that hug the center of corridors.</p>

    <div class="insight-box">
        <div class="insight-label">COSTMAP INFLATION</div>
        <p class="text-slate-200 text-sm mt-1">An exponentially decaying cost field surrounds every obstacle, so the planner naturally steers toward corridor centers without explicit path-smoothing. The scaling factor and inflation radius are the two parameters that most directly control how aggressively the drone avoids walls versus how directly it routes toward a goal.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
        Inflation cost at distance d from obstacle:<br><br>
        cost(d) = 253 * e^( -1 * cost_scaling_factor * (d - inscribed_radius) )<br><br>
        Typical params: inscribed_radius = 0.2m (quadrotor arm span / 2)<br>
        inflation_radius = 0.6m, cost_scaling_factor = 10.0
    </div>
</details>

    <p>Costmaps have two layers: <strong>static layer</strong> (loaded from a pre-built SLAM map, does not change during flight) and <strong>obstacle layer</strong> (populated from live sensor data — depth camera, LiDAR — and decays over time so that moved obstacles eventually clear). For 3D drone navigation, the standard nav2 costmap is extended to a voxel grid; the <code>spatio_temporal_voxel_layer</code> plugin is the current ROS 2 standard, built on OpenVDB.</p>

    <h3>13.3 Global Planning Algorithms</h3>

    <h4>A* (A-Star)</h4>
    <p>A* is a best-first graph search. It maintains an open set of nodes ordered by <code>f(n) = g(n) + h(n)</code>, where <code>g(n)</code> is the exact cost from start to node n, and <code>h(n)</code> is the admissible heuristic estimate to goal. Euclidean distance is the standard heuristic for 3D drone navigation. A* is guaranteed optimal <em>if and only if</em> h(n) never overestimates the true cost (admissibility). On a 3D voxel grid with resolution 0.2m and a 200m flight envelope, A* explores up to 10<sup>6</sup> cells — computationally feasible offline but too slow for real-time replanning.</p>

    <figure class="my-6">
        <img src="images/m13_astar_animation.gif" alt="A* search algorithm animated on a 2D grid showing open set (blue), closed set (red/green), and optimal path" class="rounded-lg mx-auto" style="max-width:300px;">
        <figcaption class="text-gray-400 text-sm text-center mt-2">A* pathfinding: nodes expand in order of f(n)=g+h. Red = higher cost expanded, green = lower cost, final path in blue. Source: <a href="https://commons.wikimedia.org/wiki/File:Astar_progress_animation.gif" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons (CC BY 3.0)</a></figcaption>
    </figure>

    <div class="insight-box">
        <div class="insight-label">A* HEURISTIC SEARCH</div>
        <p class="text-slate-200 text-sm mt-1">A* guarantees the shortest path by expanding nodes in order of their exact-so-far plus estimated-remaining cost — the heuristic h(n) must never overestimate to preserve optimality. Dijkstra's algorithm is simply A* with h = 0, making it useful when no geometric distance measure exists for the cost space.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
        f(n) = g(n) + h(n)<br>
        h(n) = sqrt( (x_goal - x_n)^2 + (y_goal - y_n)^2 + (z_goal - z_n)^2 )<br><br>
        Dijkstra's algorithm = A* with h(n) = 0 for all n.<br>
        Used when no geometric heuristic is available (non-Euclidean cost spaces).
    </div>
</details>

    <h4>RRT, RRT*, and Informed-RRT*</h4>
    <p>RRT is a sampling-based planner. It grows a tree from the start by: (1) sampling a random point in the configuration space, (2) finding the nearest tree node, (3) extending toward the random sample by a fixed step size (typically 0.5–1.0m for drones), (4) checking the segment for collisions. It explores high-dimensional spaces (e.g., 6-DOF SE(3)) where grid-based methods become intractable. Critically: <strong>RRT is NOT optimal</strong>. The path it finds is the first feasible path found, which is typically long and jagged.</p>

    <p><strong>RRT*</strong> adds two operations after each new node is added to the tree. First, <strong>choosing a better parent</strong>: instead of connecting to the nearest node, it searches all nodes within a radius r and picks the parent that minimizes total cost from start. Second, <strong>rewiring</strong>: it checks if any existing node in the radius would have lower cost if re-routed through the new node, and if so changes the parent connection. This rewiring step is what makes RRT* asymptotically optimal — given infinite samples, the path converges to the global optimum.</p>

    <p><strong>Informed-RRT*</strong> (Gammell et al., 2014) accelerates convergence by restricting sampling to an <strong>admissible ellipsoidal heuristic</strong> once an initial solution is found. The ellipsoid is defined by foci at start and goal, with the semi-major axis equal to half the current best path cost. Any sample outside this ellipsoid cannot improve the solution, so excluding it reduces wasted computation by 60–80% in typical drone environments compared to uniform sampling in RRT*.</p>

    <div class="insight-box">
        <div class="insight-label">INFORMED-RRT* ELLIPSOIDAL SAMPLING</div>
        <p class="text-slate-200 text-sm mt-1">Once Informed-RRT* finds a first feasible path of cost c_best, it restricts all future samples to an ellipsoid whose focal points are start and goal and whose transverse diameter equals c_best. This focus shrinks as better solutions are found, concentrating samples where they can actually improve the path — cutting convergence time by 60–80% versus standard RRT* in cluttered 3D spaces.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
        Informed-RRT* sampling ellipsoid:<br>
        c_min = ||x_goal - x_start||   (direct Euclidean distance)<br>
        c_best = current best path cost<br><br>
        Ellipsoid semi-axes:<br>
        a1 = c_best / 2          (semi-major axis along start-goal line)<br>
        ai = sqrt(c_best^2 - c_min^2) / 2   (remaining axes, i >= 2)<br><br>
        Sample x_rand uniformly from this ellipsoid.<br>
        All samples outside it cannot improve the solution (admissibility).<br><br>
        Sampling volume ratio vs RRT*:<br>
        V_ellipsoid / V_full_space = (c_best/c_min)^(d/2) * sqrt((c_best^2-c_min^2)^(d-1)) / c_best^(d-1)<br>
        For c_best near c_min: approaches zero — near-optimal focus.<br>
        Practical speedup: 60-80% fewer samples needed to reach RRT* quality.
    </div>
</details>

    <h4>Probabilistic Roadmap Method (PRM)</h4>
    <p>PRM operates in two distinct phases. In the <strong>learning (offline) phase</strong>, random collision-free configurations are sampled in the C-space, and nearby valid samples are connected by straight-line edges (verified collision-free). This builds a graph stored as an adjacency list. In the <strong>query (online) phase</strong>, the start and goal are connected to their nearest roadmap nodes, then a standard graph search (A* or Dijkstra) finds a path. PRM excels in static environments where the roadmap can be built once and reused for thousands of queries — a major advantage over RRT* which must rebuild from scratch each call.</p>

    <figure class="my-6">
        <img src="images/m13_prm_roadmap.svg" alt="PRM probabilistic roadmap: random collision-free nodes connected into a graph for motion planning" class="rounded-lg mx-auto bg-white p-2" style="max-width:320px;">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Probabilistic Roadmap: sampled collision-free nodes connected by valid edges. Goal and start connect to nearest roadmap nodes at query time. Source: <a href="https://commons.wikimedia.org/wiki/File:Motion_planning_configuration_space_road_map_path.svg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons (CC BY-SA 3.0)</a></figcaption>
    </figure>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Algorithm</th>
                    <th class="p-3">Optimal?</th>
                    <th class="p-3">Complete?</th>
                    <th class="p-3">Best Use Case</th>
                    <th class="p-3">Compute</th>
                    <th class="p-3">Nav2 Plugin</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">A*</td>
                    <td class="p-3 text-slate-300">Yes (admissible h)</td>
                    <td class="p-3 text-slate-300">Yes</td>
                    <td class="p-3 text-slate-300">Grid maps, known environment</td>
                    <td class="p-3 text-slate-300">Medium</td>
                    <td class="p-3 text-slate-300">NavFn, SmacPlanner2D</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">Dijkstra</td>
                    <td class="p-3 text-slate-300">Yes</td>
                    <td class="p-3 text-slate-300">Yes</td>
                    <td class="p-3 text-slate-300">Non-Euclidean cost spaces</td>
                    <td class="p-3 text-slate-300">High</td>
                    <td class="p-3 text-slate-300">NavFn (mode=Dijkstra)</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">RRT</td>
                    <td class="p-3 text-slate-300">No</td>
                    <td class="p-3 text-slate-300">Prob. Yes</td>
                    <td class="p-3 text-slate-300">High-DOF, first feasible path</td>
                    <td class="p-3 text-slate-300">Low</td>
                    <td class="p-3 text-slate-300">OMPL plugin</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">RRT*</td>
                    <td class="p-3 text-slate-300">Asymptotically</td>
                    <td class="p-3 text-slate-300">Prob. Yes</td>
                    <td class="p-3 text-slate-300">High-DOF, quality paths</td>
                    <td class="p-3 text-slate-300">Medium-High</td>
                    <td class="p-3 text-slate-300">OMPL plugin</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">Informed-RRT*</td>
                    <td class="p-3 text-slate-300">Asymptotically</td>
                    <td class="p-3 text-slate-300">Prob. Yes</td>
                    <td class="p-3 text-slate-300">High-DOF, faster convergence</td>
                    <td class="p-3 text-slate-300">Medium</td>
                    <td class="p-3 text-slate-300">OMPL plugin</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">D* Lite</td>
                    <td class="p-3 text-slate-300">Yes (given map)</td>
                    <td class="p-3 text-slate-300">Yes</td>
                    <td class="p-3 text-slate-300">Dynamic environments, replanning</td>
                    <td class="p-3 text-slate-300">Low (incremental)</td>
                    <td class="p-3 text-slate-300">Custom / SLAM Toolbox</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">Hybrid A*</td>
                    <td class="p-3 text-slate-300">Sub-optimal</td>
                    <td class="p-3 text-slate-300">Yes</td>
                    <td class="p-3 text-slate-300">Kinodynamic constraints</td>
                    <td class="p-3 text-slate-300">Medium</td>
                    <td class="p-3 text-slate-300">SmacPlannerHybrid</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">PRM</td>
                    <td class="p-3 text-slate-300">No (graph dep.)</td>
                    <td class="p-3 text-slate-300">Prob. Yes</td>
                    <td class="p-3 text-slate-300">Static env., many queries</td>
                    <td class="p-3 text-slate-300">High (offline build)</td>
                    <td class="p-3 text-slate-300">OMPL plugin</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h3>13.4 Dynamic Replanning: D* Lite</h3>
    <p>When the environment changes mid-flight — a door closes, a new obstacle appears — replanning with A* from scratch is wasteful. <strong>D* Lite</strong> (Koenig &amp; Likhachev, 2002) is an incremental heuristic search that maintains and repairs a shortest-path tree rather than recomputing it. Only the portion of the tree affected by map changes is re-evaluated, making it orders of magnitude faster than fresh A* in dynamic environments.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">D* Lite Algorithm: Key Concepts</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Two-Key Priority Queue</strong>
                <p class="text-slate-400">Each node n has keys [k1, k2]. k1 = min(g(n), rhs(n)) + h(s_start, n). k2 = min(g(n), rhs(n)). The queue orders by (k1, k2) lexicographically. This ensures locally inconsistent nodes are processed first.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-1">g vs rhs Values</strong>
                <p class="text-slate-400">g(n) = current estimate of path cost from goal to n. rhs(n) = one-step lookahead based on successors: rhs(n) = min over successors s of [c(n,s) + g(s)]. Locally consistent when g(n) == rhs(n). Only inconsistent nodes are in the queue.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-1">Incremental Update</strong>
                <p class="text-slate-400">When edge costs change (obstacle detected), only affected nodes are marked inconsistent and added to queue. D* Lite repairs just those nodes — typically O(k log n) for k affected cells, vs O(n log n) for fresh A*. Critical for real-time replanning at millisecond latency.</p>
            </div>
        </div>
    </div>

    <div class="insight-box">
        <div class="insight-label">D* LITE KEY FUNCTION</div>
        <p class="text-slate-200 text-sm mt-1">D* Lite's two-key priority ensures locally inconsistent nodes are always resolved before the drone reaches them, and the accumulated key modifier lets the algorithm account for the drone moving forward without re-inserting every node into the queue — enabling millisecond replanning even in large 3D grids.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
        Key function: k(n) = [k1, k2]<br>
        k1(n) = min(g(n), rhs(n)) + h(s_start, n) + key_modifier<br>
        k2(n) = min(g(n), rhs(n))<br><br>
        key_modifier accumulates as the robot moves (avoids re-keying entire queue).<br><br>
        When map changes: mark affected edges, update rhs of predecessors, re-insert to priority queue.<br>
        Call ComputeShortestPath() — only inconsistent nodes are processed.
    </div>
</details>

    <h3>13.5 SMAC Planner: Hybrid A* and State Lattice (nav2)</h3>
    <p>The <strong>nav2 SMAC Planner</strong> (Steve Macenski, Open Navigation LLC) provides three kinodynamically-aware A* variants that produce smoother, more physically realistic paths than vanilla A*. Unlike standard A* which ignores robot kinematics, SMAC searches the robot's configuration space including heading.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">SMAC Planner Variants (Nav2)</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">SmacPlanner2D</strong>
                <p class="text-slate-400">Cost-aware A* on 2D grid. Supports circular differential and omni-directional robots. Uses the full costmap gradient (not just lethal/free). Best for holonomic robots in 2D environments. ~10 Hz on typical indoor maps.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-1">SmacPlannerHybrid</strong>
                <p class="text-slate-400">Hybrid A* — searches in (x, y, theta) space. Each expansion uses a set of motion primitives respecting the robot's turning radius. Produces smooth, kinematically feasible paths. Ideal for fixed-wing UAVs with <code>minimum_turning_radius &gt; 0</code>. For quadrotors, set radius to 0.0 (holonomic). ~5 Hz on typical indoor maps.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-1">SmacPlannerLattice</strong>
                <p class="text-slate-400">State lattice search using pre-computed motion primitives for any robot model. Supports fully 3D state spaces. Uses an SBPL-style lattice: regular set of states + pre-computed, dynamically feasible transitions. Best for complex vehicle models, SE(3) planning. Lattice primitives generated offline with <code>nav2_smac_planner</code> CLI tool.</p>
            </div>
        </div>
    </div>

    <h3>13.6 Local Planning: DWA and TEB</h3>

    <h4>DWA — Dynamic Window Approach</h4>
    <p>DWA operates entirely in velocity space. At each 10–20 Hz tick, it samples hundreds of (linear_velocity, angular_velocity) pairs within a "dynamic window" — the subset of velocities physically reachable within one timestep given the drone's acceleration limits. Each sample is forward-simulated for ~1.5 seconds to produce a trajectory arc, scored by a weighted sum of progress-toward-goal, obstacle clearance, and forward speed. DWA is computationally cheap and reactive — ideal for cluttered, dynamic environments. Its weakness: it can get stuck in narrow corridors because no sampled arc scores well on clearance. Recovery behaviors in nav2 handle this case.</p>

    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
        score = w_progress * heading_to_goal<br>
               + w_clearance * min_obstacle_distance<br>
               + w_velocity  * linear_velocity_magnitude<br><br>
        Key nav2 parameters:<br>
        max_vel_x: 0.5 m/s (horizontal cruise), min_vel_x: -0.5 m/s<br>
        acc_lim_x: 1.0 m/s^2,  acc_lim_theta: 1.5 rad/s^2<br>
        sim_time: 1.5s,  vx_samples: 20,  vy_samples: 5
    </div>
</details>

    <h4>TEB — Timed Elastic Band</h4>
    <p>TEB represents the path as a sequence of robot poses with explicit timestamps: {(x_1,y_1,theta_1,t_1), ..., (x_n,y_n,theta_n,t_n)}. This is an "elastic band" because it is optimized iteratively. The optimization objective penalizes: deviation from the global plan, obstacle proximity, excessive acceleration, violation of the drone's minimum turning radius, and time. TEB handles <strong>kinodynamic constraints</strong> directly — you can specify max angular acceleration, max lateral velocity, and minimum clearance as hard constraints in the graph. For quadrotors, set <code>min_turning_radius: 0.0</code> (holonomic) and <code>footprint_model.type: "circular"</code>.</p>

    <h3>13.7 MPPI Controller — Model Predictive Path Integral</h3>
    <p>MPPI (Model Predictive Path Integral) is the recommended local planner in Nav2 as of 2026 for agile drone navigation. Unlike DWA and TEB, MPPI is a <strong>stochastic sampling-based MPC</strong>: it forward-simulates thousands of randomly perturbed control sequences in parallel, evaluates each with a cost function, and computes the optimal control as an information-theoretically weighted average. Critically, the cost function does not need to be convex or differentiable — enabling complex multi-objective behaviors impossible with optimization-based methods. MPPI runs at 100+ Hz on a modest Intel i5 CPU via SIMD-vectorized rollouts.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">MPPI Algorithm Flow</h4>
        <div class="space-y-2 text-xs text-slate-300 font-mono">
            <div class="flex items-start gap-3">
                <span class="text-sky-400 font-bold shrink-0">1.</span>
                <span><strong class="text-sky-400">Sample:</strong> Draw K=2000 control sequences as noisy perturbations of the previous optimal sequence U* using Gaussian noise (sigma_v=0.2 m/s, sigma_w=0.4 rad/s).</span>
            </div>
            <div class="flex items-start gap-3">
                <span class="text-amber-400 font-bold shrink-0">2.</span>
                <span><strong class="text-amber-400">Simulate:</strong> Forward-propagate each U_k through the robot motion model for T=56 timesteps at dt=0.05s (2.8s horizon). Produces K candidate trajectories in parallel via SIMD.</span>
            </div>
            <div class="flex items-start gap-3">
                <span class="text-emerald-400 font-bold shrink-0">3.</span>
                <span><strong class="text-emerald-400">Score:</strong> Evaluate each trajectory via critic plugin functions. Collision critic: hard penalty for lethal costmap cells. Path-following critic: integral of cross-track error. Goal critic: terminal distance.</span>
            </div>
            <div class="flex items-start gap-3">
                <span class="text-purple-400 font-bold shrink-0">4.</span>
                <span><strong class="text-purple-400">Aggregate:</strong> Softmax weights: w_k = exp(-S_k / lambda). Optimal control: U* = sum_k(w_k * U_k). Lambda (temperature = 0.3) trades off selectiveness.</span>
            </div>
            <div class="flex items-start gap-3">
                <span class="text-rose-400 font-bold shrink-0">5.</span>
                <span><strong class="text-rose-400">Execute:</strong> Apply U*[0] (first control command). Shift sequence U*[1:T] as warm-start for next iteration. Repeat at 50–100 Hz.</span>
            </div>
        </div>
    </div>

    <div class="insight-box">
        <div class="insight-label">MPPI vs DWA vs TEB — WHEN TO USE EACH</div>
        <p class="text-slate-200 text-sm mt-1">Use <strong>MPPI</strong> when you need the highest-quality local planning with non-convex objectives (default Nav2 recommendation for drones). Use <strong>TEB</strong> when hard kinodynamic constraints matter and you prefer a deterministic optimizer. Use <strong>DWA</strong> on resource-constrained hardware where simplicity and low CPU cost are priorities — it degrades gracefully but produces lower-quality paths than MPPI.</p>
    </div>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Feature</th>
                    <th class="p-3">DWA</th>
                    <th class="p-3">TEB</th>
                    <th class="p-3">MPPI</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">Planning method</td>
                    <td class="p-3 text-slate-300">Velocity sampling</td>
                    <td class="p-3 text-slate-300">Gradient optimization</td>
                    <td class="p-3 text-slate-300">Stochastic MPC sampling</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">Kinodynamic constraints</td>
                    <td class="p-3 text-slate-300">Approximate</td>
                    <td class="p-3 text-slate-300">Hard constraints</td>
                    <td class="p-3 text-slate-300">Soft (via critics)</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">Cost function</td>
                    <td class="p-3 text-slate-300">Differentiable required</td>
                    <td class="p-3 text-slate-300">Differentiable required</td>
                    <td class="p-3 text-slate-300">Any (non-convex OK)</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">CPU cost (i5)</td>
                    <td class="p-3 text-slate-300">Low (~5%)</td>
                    <td class="p-3 text-slate-300">Medium (~15%)</td>
                    <td class="p-3 text-slate-300">Medium (~20%)</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">Holonomic support</td>
                    <td class="p-3 text-slate-300">Yes (vy_samples)</td>
                    <td class="p-3 text-slate-300">Yes (radius=0)</td>
                    <td class="p-3 text-slate-300">Yes (Omni model)</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">Nav2 plugin (2025)</td>
                    <td class="p-3 text-slate-300">nav2_dwb_controller</td>
                    <td class="p-3 text-slate-300">teb_local_planner</td>
                    <td class="p-3 text-slate-300">nav2_mppi_controller</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">Recommended for drones</td>
                    <td class="p-3 text-slate-300">Legacy / low-power</td>
                    <td class="p-3 text-slate-300">Fixed-wing, Ackermann</td>
                    <td class="p-3 text-slate-300 text-emerald-400">Primary recommendation</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            YAML: nav2 MPPI controller configuration (quadrotor tuning, 2025)
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>YAML Code Example</summary>
<pre><code class="language-yaml">controller_server:
  ros__parameters:
    controller_plugins: ["FollowPath"]
    FollowPath:
      plugin: "nav2_mppi_controller::MPPIController"
      time_steps: 56              # prediction horizon steps
      model_dt: 0.05              # 50ms per step = 2.8s horizon
      batch_size: 2000            # candidate trajectories (GPU: 10000+)
      vx_std: 0.2                 # control noise std dev (m/s)
      vy_std: 0.2                 # lateral noise (holonomic quadrotor)
      wz_std: 0.4                 # yaw rate noise (rad/s)
      iteration_count: 1          # MPPI inner iterations per control cycle
      temperature: 0.3            # lambda: selectiveness of soft-max
      gamma: 0.015                # smoothness regularizer
      motion_model: "Omni"        # DiffDrive | Omni | Ackermann
      visualize: true             # publish candidate trajectories for Rviz2
      critics: ["ObstaclesCritic", "GoalCritic", "GoalAngleCritic",
                "PathFollowCritic", "PathAngleCritic", "VelocityCritic"]
      ObstaclesCritic:
        enabled: true
        weight: 10.0
        inflation_layer_name: "inflation_layer"
      GoalCritic:
        enabled: true
        weight: 5.0
        threshold_to_consider: 1.4  # switch to goal critic within 1.4m</code></pre>
</details>
        </div>
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Video: Autonomous Drone Navigation with A* in ROS2 &amp; MAVROS</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/pmalu7tcEw4" title="Autonomous Drone Navigation with AI in ROS2 and MAVROS" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
    </div>

    <h3>13.8 MPC vs. PID for Trajectory Tracking</h3>
    <p>The flight controller's inner loop is typically a cascaded PID (rate → attitude → velocity → position). Above it, the companion computer can run a higher-level <strong>Model Predictive Controller (MPC)</strong> that sends attitude setpoints to PX4/ArduPilot. The key architectural difference: PID uses feedback only (responds to error after it occurs), while MPC incorporates a prediction horizon — it optimizes control inputs over the next N timesteps based on a forward model of the drone's dynamics, anticipating future tracking errors before they happen.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Aspect</th>
                    <th class="p-3">Cascaded PID</th>
                    <th class="p-3">Nonlinear MPC (NMPC)</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">Control delay</td>
                    <td class="p-3 text-slate-300">~24 ms (reactive)</td>
                    <td class="p-3 text-slate-300 text-emerald-400">~6 ms (predictive)</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">Trajectory tracking error</td>
                    <td class="p-3 text-slate-300">Higher on sharp maneuvers</td>
                    <td class="p-3 text-slate-300 text-emerald-400">30–60% lower vs PID</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">Constraint handling</td>
                    <td class="p-3 text-slate-300">Manual saturation / anti-windup</td>
                    <td class="p-3 text-slate-300 text-emerald-400">Hard constraints in QP formulation</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">Wind/disturbance rejection</td>
                    <td class="p-3 text-slate-300">Reactive only</td>
                    <td class="p-3 text-slate-300 text-emerald-400">Feed-forward compensation possible</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">Compute requirement</td>
                    <td class="p-3 text-slate-300 text-emerald-400">Minimal (runs on FC MCU)</td>
                    <td class="p-3 text-slate-300">Companion CPU (Jetson/RPi)</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">Tuning complexity</td>
                    <td class="p-3 text-slate-300 text-emerald-400">3–6 gains, intuitive</td>
                    <td class="p-3 text-slate-300">System ID + cost matrix design</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">Production maturity</td>
                    <td class="p-3 text-slate-300 text-emerald-400">Very high (PX4/ArduPilot)</td>
                    <td class="p-3 text-slate-300">Research + some commercial</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300">Best for</td>
                    <td class="p-3 text-slate-300">Standard outdoor ops, simple waypoints</td>
                    <td class="p-3 text-slate-300">Agile maneuvers, racing, wind gusts</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="insight-box">
        <div class="insight-label">MPC PREDICTION HORIZON TRADE-OFF</div>
        <p class="text-slate-200 text-sm mt-1">A longer MPC prediction horizon (more timesteps) improves trajectory anticipation and reduces tracking error — but increases the QP solve time quadratically. A practical drone NMPC uses N=10–20 steps at 50ms intervals (0.5–1.0s horizon), solvable in under 5ms on a Jetson Orin NX using ACADO or CasADi with the Ipopt solver. For aggressive racing flight, dedicated FPGA or GPU acceleration enables N=50 at 100 Hz.</p>
    </div>

    <h3>13.9 SE(3) Trajectory Generation — Minimum Snap</h3>
    <p>Once waypoints are computed, the drone cannot simply jump between them. It must follow a trajectory that is <strong>dynamically feasible</strong> — respecting its mass, moment of inertia, and maximum rotor thrust. For quadrotors, the key insight from Mellinger &amp; Kumar (2011) is that the rotor force is the 4th derivative of position, called <strong>snap</strong>. Minimizing snap minimizes the required rotor force variation, which means smoother flight with lower vibration and lower battery consumption.</p>

    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
        Position trajectory on segment k:<br>
        p_k(t) = sum_{i=0}^{7} c_{k,i} * t^i   (7th-order polynomial, 8 coefficients per axis)<br><br>
        Snap = d^4p/dt^4<br><br>
        Objective: minimize integral of ||snap||^2 over all segments<br>
        Subject to: continuity of position, velocity, acceleration at waypoints;<br>
                    start/end boundary conditions; optionally max velocity/accel constraints<br><br>
        Reduces to Quadratic Program: min x^T Q x  s.t. A_eq x = b_eq<br>
        Each axis (X, Y, Z, Yaw) solved independently. Typical solve time: &lt;1ms.
    </div>
</details>

    <p>The standard ROS library for this is <strong>ETHZ-ASL mav_trajectory_generation</strong>. It handles multi-segment trajectories with user-specified derivative orders to minimize (snap = 4, jerk = 3, acceleration = 2). Output is <code>trajectory_msgs/MultiDOFJointTrajectory</code> for the flight controller.</p>

    <h3>13.10 Gradient-Based Trajectory Optimization: EGO-Planner</h3>
    <p>Traditional gradient-based trajectory optimization requires a precomputed <strong>Euclidean Signed Distance Field (ESDF)</strong> — a 3D grid storing the distance and gradient to the nearest obstacle at every cell. Building and updating this field is expensive: for a 100m x 100m x 20m volume at 0.1m resolution, it requires ~200M cells. <strong>EGO-Planner</strong> (HKUST, 2021) eliminates this requirement entirely by using a per-trajectory collision gradient computed from a "guiding path" comparison rather than a global distance field.</p>

    <p>The trajectory is represented as a <strong>uniform B-spline</strong>, which provides: (1) automatic C2 smoothness by construction, (2) local control (moving one control point affects only neighboring segments), (3) efficient derivative computation. EGO-Planner v2 (EGO-Swarm) extends the framework to swarm coordination by adding inter-drone repulsion terms, achieving obstacle avoidance at 5+ m/s in cluttered forests.</p>

    <h3>13.11 GPS-Denied Navigation: Sensor Fallback Hierarchy</h3>
    <p>GPS/GNSS denial — whether from urban canyons, indoor environments, tunnel operations, or deliberate jamming/spoofing in contested environments — is the primary localization challenge for operational drones. A robust navigation architecture implements a <strong>sensor fallback hierarchy</strong> so that the drone gracefully degrades rather than crashes when each successive positioning source fails.</p>

    <figure class="my-6">
        <img src="images/m13_gps_satellite.jpg" alt="NASA artist rendering of GPS Block II-F satellite in Earth orbit" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">GPS Block II-F satellite. GPS denial — via jamming, spoofing, or obstructed sky view — requires fallback to onboard sensor-based navigation. Source: <a href="https://commons.wikimedia.org/wiki/File:GPS_Satellite_NASA_art-iif.jpg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">NASA / Wikimedia Commons (public domain)</a></figcaption>
    </figure>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">GPS-Denied Navigation Fallback Hierarchy</h4>
        <div class="space-y-2 text-xs">
            <div class="flex items-start gap-3 bg-slate-900 p-3 rounded border-l-4 border-emerald-500">
                <span class="text-emerald-400 font-bold shrink-0 text-sm">1</span>
                <div>
                    <strong class="text-emerald-400">RTK-GPS (u-blox ZED-F9P)</strong> — Best case: 1–2 cm horizontal accuracy. Requires base station or NTRIP correction stream. Loses fix indoors, under canopy, in urban canyons. Convergence: 30–60s for PPP-RTK cold start.
                </div>
            </div>
            <div class="flex items-start gap-3 bg-slate-900 p-3 rounded border-l-4 border-sky-500">
                <span class="text-sky-400 font-bold shrink-0 text-sm">2</span>
                <div>
                    <strong class="text-sky-400">Standard GNSS + EKF2</strong> — 2–5m CEP (circular error probable). Multi-constellation (GPS+GLONASS+Galileo+BeiDou). No base station required. PX4 EKF2 fuses GNSS with barometer + magnetometer + IMU. Reliable outdoors.
                </div>
            </div>
            <div class="flex items-start gap-3 bg-slate-900 p-3 rounded border-l-4 border-amber-500">
                <span class="text-amber-400 font-bold shrink-0 text-sm">3</span>
                <div>
                    <strong class="text-amber-400">LiDAR-Inertial Odometry (FAST-LIO2 / KISS-ICP)</strong> — 0.1–0.3% drift per distance. Requires LiDAR (Ouster, Livox, Velodyne). Works indoors and outdoors. Accumulates drift without loop closure; combine with SLAM for bounded error. 100 Hz on Jetson Orin NX.
                </div>
            </div>
            <div class="flex items-start gap-3 bg-slate-900 p-3 rounded border-l-4 border-purple-500">
                <span class="text-purple-400 font-bold shrink-0 text-sm">4</span>
                <div>
                    <strong class="text-purple-400">Visual-Inertial Odometry (VINS-Fusion / OpenVINS / Basalt)</strong> — 1–2% drift per distance. Low cost (stereo camera + IMU). Degrades in dark, textureless, or featureless environments. Fuse with LiDAR for resilience (LVIO: LiDAR-Visual-Inertial Odometry). 20–100 Hz.
                </div>
            </div>
            <div class="flex items-start gap-3 bg-slate-900 p-3 rounded border-l-4 border-rose-500">
                <span class="text-rose-400 font-bold shrink-0 text-sm">5</span>
                <div>
                    <strong class="text-rose-400">UWB Ranging (Decawave DWM3001 anchors)</strong> — 5–15 cm accuracy in pre-deployed infrastructure. Requires minimum 3 anchors (4 for full 3D). Works in darkness, smoke, non-line-of-sight. Typical for warehouse/indoor operations. Fused with IMU via EKF for smooth 100 Hz output.
                </div>
            </div>
            <div class="flex items-start gap-3 bg-slate-900 p-3 rounded border-l-4 border-slate-500">
                <span class="text-slate-400 font-bold shrink-0 text-sm">6</span>
                <div>
                    <strong class="text-slate-400">Barometer + IMU Dead Reckoning</strong> — Last resort. Barometer gives altitude to ~0.5m. IMU-only position drifts at ~2m/s (consumer grade). Sufficient only for immediate controlled descent and landing in place. PX4 GPS_FAIL behavior: hover then descend.
                </div>
            </div>
        </div>
    </div>

    <div class="insight-box">
        <div class="insight-label">DoD CONTEXT: GPS JAMMING RESILIENCE</div>
        <p class="text-slate-200 text-sm mt-1">In contested environments, GNSS jamming and spoofing are active threats. The DoD's PNT (Positioning, Navigation, and Timing) resilience strategy mandates multi-source navigation: anti-jam GPS receivers (SAASM/M-Code), VIO, and LIDAR odometry must all be fused with detection of spoofing anomalies (sudden position jumps, implausible velocity). AFSOC and SOF drone programs require autonomous operation for at least 30 minutes with no GPS, using LiDAR-inertial SLAM as primary fallback.</p>
    </div>

    <h3>13.12 Visual-Inertial Odometry (VIO): Algorithms Compared</h3>
    <p>VIO fuses camera images and IMU measurements to produce 6-DOF pose estimates at 50–200 Hz. The IMU provides high-frequency angular rate and acceleration; the camera provides scale reference and prevents IMU drift. Together they are complementary: IMU handles fast motion (prevents blur), camera handles slow drift. There are two dominant estimation architectures: <strong>filter-based</strong> (MSCKF — fast, fixed state size) and <strong>optimization-based</strong> (sliding-window factor graph — more accurate, higher latency).</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">System</th>
                    <th class="p-3">Method</th>
                    <th class="p-3">EuRoC ATE (stereo)</th>
                    <th class="p-3">CPU (Jetson Orin NX)</th>
                    <th class="p-3">Loop Closure</th>
                    <th class="p-3">ROS 2</th>
                    <th class="p-3">Best For</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">Basalt</td>
                    <td class="p-3 text-slate-300">Optimization (factor graph)</td>
                    <td class="p-3 text-emerald-400">~0.012 m</td>
                    <td class="p-3 text-slate-300">~35% (Numba/CuPy)</td>
                    <td class="p-3 text-slate-300">Optional</td>
                    <td class="p-3 text-slate-300">Wrapper</td>
                    <td class="p-3 text-slate-300">Highest accuracy, GPU available</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">VINS-Fusion</td>
                    <td class="p-3 text-slate-300">Optimization (Ceres)</td>
                    <td class="p-3 text-slate-300">~0.041 m</td>
                    <td class="p-3 text-slate-300">~40% (20 Hz)</td>
                    <td class="p-3 text-emerald-400">Yes (DBoW2)</td>
                    <td class="p-3 text-slate-300">Wrapper</td>
                    <td class="p-3 text-slate-300">Outdoor, large-scale, loop closure</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">OpenVINS</td>
                    <td class="p-3 text-slate-300">Filter (MSCKF)</td>
                    <td class="p-3 text-slate-300">~0.050 m</td>
                    <td class="p-3 text-emerald-400">~20% (100 Hz)</td>
                    <td class="p-3 text-slate-300">SLAM features</td>
                    <td class="p-3 text-emerald-400">Native</td>
                    <td class="p-3 text-slate-300">Research, custom hardware, ROS 2</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">ORB-SLAM3</td>
                    <td class="p-3 text-slate-300">Optimization (ORB features)</td>
                    <td class="p-3 text-slate-300">~0.030 m</td>
                    <td class="p-3 text-slate-300">~50% (30 Hz)</td>
                    <td class="p-3 text-emerald-400">Yes (DBoW3)</td>
                    <td class="p-3 text-slate-300">Wrapper</td>
                    <td class="p-3 text-slate-300">Indoor structured, revisitation</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">FAST-LIO2</td>
                    <td class="p-3 text-slate-300">Filter (IEKF, LiDAR)</td>
                    <td class="p-3 text-slate-300">N/A (LiDAR)</td>
                    <td class="p-3 text-emerald-400">~25% (100 Hz)</td>
                    <td class="p-3 text-slate-300">No (odometry only)</td>
                    <td class="p-3 text-slate-300">Wrapper</td>
                    <td class="p-3 text-slate-300">GPS-denied, dark, textureless envs</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">KISS-ICP</td>
                    <td class="p-3 text-slate-300">Point-to-point ICP</td>
                    <td class="p-3 text-slate-300">N/A (LiDAR)</td>
                    <td class="p-3 text-emerald-400">~15% (10 Hz scan)</td>
                    <td class="p-3 text-slate-300">No</td>
                    <td class="p-3 text-emerald-400">Native</td>
                    <td class="p-3 text-slate-300">Simple LiDAR odometry, no IMU needed</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h4>KISS-ICP: LiDAR Odometry That Just Works</h4>
    <p><strong>KISS-ICP</strong> (Keep It Small and Simple ICP, University of Bonn, 2023) is the most practical LiDAR odometry system for rapid deployment. Unlike FAST-LIO2 which requires a tightly-coupled IMU, KISS-ICP achieves competitive accuracy using only the LiDAR point cloud — no IMU, no feature extraction, no ESDF. It combines four elements: (1) motion prediction via constant velocity model, (2) scan de-skewing to compensate for LiDAR rotation during scan, (3) adaptive threshold for ICP correspondence search based on recent motion velocity, (4) robust point-to-point ICP with a Huber kernel to reject dynamic objects. It runs at 10–100 Hz depending on LiDAR type and has a ROS 2 package installable via <code>apt install ros-humble-kiss-icp</code>.</p>

    <div class="insight-box">
        <div class="insight-label">KISS-ICP ADAPTIVE THRESHOLD</div>
        <p class="text-slate-200 text-sm mt-1">KISS-ICP's adaptive threshold is its key innovation: rather than a fixed ICP correspondence radius, it tracks recent motion velocity and sets the threshold proportionally, automatically adjusting for slow indoor hover versus fast outdoor flight. This single mechanism eliminates the manual per-environment parameter tuning that defeats other ICP-based odometry systems in practice. The same parameter file works on a Velodyne VLP-16, an Ouster OS0-32, and a Livox Mid-360 without modification.</p>
    </div>

    <h3>13.13 Indoor Navigation: UWB Beacons</h3>
    <p>Ultra-Wideband (UWB) ranging is the highest-accuracy indoor positioning technology available at reasonable cost. UWB transceivers transmit nanosecond pulses across a 500 MHz+ bandwidth, enabling time-of-flight measurements accurate to ~10 cm — versus Wi-Fi RSSI (~3m) or BLE (~1m). For indoor drone operations (warehouses, hangars, underground facilities), a network of 4+ UWB anchor beacons provides 3D positioning even in total darkness and through light obstructions.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">UWB Indoor Positioning: System Architecture</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-2">Hardware</strong>
                <p class="text-slate-400 mb-1"><strong class="text-slate-300">Anchors:</strong> Decawave DWM3001 (successor to DW1000) modules at fixed known positions. Minimum 3 for 2D, 4+ for 3D positioning. Typical spacing: 5–15m for warehouse coverage.</p>
                <p class="text-slate-400 mb-1"><strong class="text-slate-300">Tag:</strong> DWM3001 or DWM1001C on the drone. Broadcasts TWR (Two-Way Ranging) or TDOA (Time Difference of Arrival) messages.</p>
                <p class="text-slate-400"><strong class="text-slate-300">Accuracy:</strong> TWR: 5–10 cm. TDOA: 10–15 cm. Both degrade to 20–30 cm in NLOS (non-line-of-sight through walls).</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 block mb-2">ROS 2 Integration</strong>
                <p class="text-slate-400 mb-1">Publish UWB ranges as <code>sensor_msgs/Range</code> or custom <code>uwb_msgs/RangingResult</code>. Use a multilateration node (e.g., <code>ros2-uwb-positioning</code>) to compute 3D position.</p>
                <p class="text-slate-400 mb-1">Fuse with IMU via EKF (<code>robot_localization</code> package): UWB provides global position corrections at 10–100 Hz, IMU fills between at 200 Hz. Achieves smooth 100 Hz output at ~5 cm accuracy.</p>
                <p class="text-slate-400">ArduPilot: use <code>Lua scripting</code> + VISION_POSITION_ESTIMATE MAVLink to inject UWB-derived position into EKF. PX4: use <code>px4_msgs/SensorGps</code> injection via uXRCE-DDS.</p>
            </div>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Python (ROS 2): UWB multilateration + EKF fusion for indoor positioning
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import numpy as np
from scipy.optimize import minimize

# Anchor positions (measured during installation, in local NED frame)
ANCHORS = np.array([
    [0.0,  0.0,  2.5],   # anchor 0: northwest corner
    [10.0, 0.0,  2.5],   # anchor 1: northeast corner
    [10.0, 10.0, 2.5],   # anchor 2: southeast corner
    [0.0,  10.0, 0.0],   # anchor 3: floor-level, southwest
])

def multilaterate_3d(ranges, anchors):
    """Least-squares 3D position from UWB ranges to known anchors."""
    def residuals(pos):
        dists = np.linalg.norm(anchors - pos, axis=1)
        return np.sum((dists - ranges)**2)

    # Initial guess: centroid of anchors
    x0 = anchors.mean(axis=0)
    result = minimize(residuals, x0, method='Nelder-Mead',
                      options={'xatol': 0.01, 'fatol': 0.0001})
    return result.x  # [north, east, down] in meters

# ROS 2 callback: receive ranges from 4 UWB anchors
def uwb_callback(msg):
    ranges = np.array([msg.range_0, msg.range_1,
                       msg.range_2, msg.range_3])
    pos_ned = multilaterate_3d(ranges, ANCHORS)
    # Inject into EKF via robot_localization or MAVROS
    publish_vision_position(pos_ned)</code></pre>
</details>
        </div>
    </div>

    <h3>13.14 RTK GPS: Centimeter-Level Outdoor Positioning</h3>
    <p>For outdoor operations requiring sub-10cm positioning (precision landing, structure inspection, precision agriculture), <strong>RTK (Real-Time Kinematic) GPS</strong> augments standard GNSS with a correction stream from a fixed base station. The u-blox <strong>ZED-F9P</strong> is the standard module for drone RTK, supporting concurrent GPS, GLONASS, Galileo, BeiDou, and NavIC on L1+L2 bands. It achieves 1–2 cm horizontal accuracy (CEP) in RTK fix mode with a moving baseline age under 5s.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">u-blox ZED-F9P RTK GPS — Key Specs</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Accuracy</strong>
                <p class="text-slate-400">RTK fix: 1 cm + 1 ppm horizontal, 2 cm + 1 ppm vertical. Standard GNSS (no corrections): 1.5m CEP. SBAS: 0.6m. PPP-RTK (PointPerfect): &lt;10 cm anywhere with internet, converges in 60s cold start.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-1">Update Rate &amp; Interface</strong>
                <p class="text-slate-400">Navigation output: up to 25 Hz (RTK), 10 Hz typical for drone use. Raw measurements: 20 Hz. Interfaces: UART (3.3V), SPI, I2C. UBX binary protocol for full configuration. Power: 68 mW typical.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-1">Integration Notes</strong>
                <p class="text-slate-400">PX4: configure as GPS_1, set <code>GPS_1_GNSS</code> bitmask. RTCM3 correction stream via telemetry radio or LTE modem. ArduPilot: <code>GPS_TYPE = 17</code> (UBX). Moving baseline (rover+base on same drone) enables cm-level heading without magnetometer.</p>
            </div>
        </div>
    </div>

    <h3>13.15 Precision Landing: AprilTag Visual Guidance</h3>
    <p>Autonomous precision landing requires accuracy of ±10 cm or better to land on a charging pad, moving platform, or confined rooftop. <strong>AprilTag</strong> fiducial markers are the standard approach: a downward-facing camera detects a printed pattern on the landing pad, computes the relative pose via PnP (Perspective-n-Point) algorithm, and feeds it to the flight controller as a landing target correction. Modern systems (2024) achieve precision landing from over 100m horizontal distance and altitude using zoom + wide-angle camera switching.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">AprilTag Precision Landing Pipeline</h4>
        <div class="space-y-2 text-xs">
            <div class="flex items-start gap-3 bg-slate-900 p-3 rounded">
                <span class="text-sky-400 font-bold shrink-0">1.</span>
                <span class="text-slate-300"><strong class="text-sky-400">Tag Detection:</strong> <code>apriltag_ros</code> node detects tag in 640×480 downward camera at 30 Hz. Tag family: Tag36h11 (default, most robust to perspective distortion). Detection up to ~5m altitude with a 0.5m × 0.5m printed tag.</span>
            </div>
            <div class="flex items-start gap-3 bg-slate-900 p-3 rounded">
                <span class="text-amber-400 font-bold shrink-0">2.</span>
                <span class="text-slate-300"><strong class="text-amber-400">Pose Estimation:</strong> PnP algorithm computes 6-DOF relative pose (dx, dy, dz, roll, pitch, yaw) between camera and tag. Accuracy: ±1 cm at 2m altitude, ±5 cm at 5m altitude for a 0.3m tag.</span>
            </div>
            <div class="flex items-start gap-3 bg-slate-900 p-3 rounded">
                <span class="text-emerald-400 font-bold shrink-0">3.</span>
                <span class="text-slate-300"><strong class="text-emerald-400">Flight Controller Injection:</strong> ArduPilot: <code>PLND_ENABLED=1</code>, <code>PLND_TYPE=1</code> (companion computer). Send LANDING_TARGET MAVLink message with angle offsets and distance. PX4: use <code>PRECISION_LAND</code> mode with the <code>precland</code> ROS 2 bridge.</span>
            </div>
            <div class="flex items-start gap-3 bg-slate-900 p-3 rounded">
                <span class="text-purple-400 font-bold shrink-0">4.</span>
                <span class="text-slate-300"><strong class="text-purple-400">Approach Strategy:</strong> Switch from GPS-guided to AprilTag-guided when tag is first detected (typically at 5–10m altitude). Reduce descent rate proportionally to horizontal error — prevents oscillation during final approach.</span>
            </div>
        </div>
    </div>

    <h3>13.16 Geofencing and Return-to-Home</h3>
    <p>Geofencing and RTH (Return-to-Home) are the primary safety mechanisms for operational drone deployments. They define the boundaries of permitted flight and the automated response when those boundaries are violated or when the mission can no longer continue safely (low battery, comms lost).</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">ArduPilot vs. PX4 Geofencing and RTH (2025)</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
                <thead class="bg-slate-700 text-slate-300">
                    <tr>
                        <th class="p-3">Feature</th>
                        <th class="p-3">ArduPilot (Copter 4.5)</th>
                        <th class="p-3">PX4 (v1.15)</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-700">
                    <tr class="bg-slate-800">
                        <td class="p-3 text-slate-300">Fence types</td>
                        <td class="p-3 text-slate-300">Cylinder, polygon, altitude, inclusion/exclusion zones</td>
                        <td class="p-3 text-slate-300">Cylinder (radius+height), max altitude</td>
                    </tr>
                    <tr class="bg-slate-900">
                        <td class="p-3 text-slate-300">Fence breach action</td>
                        <td class="p-3 text-slate-300">RTL, SmartRTL, Land, Brake, Report only</td>
                        <td class="p-3 text-slate-300">Hold, RTL, Land, Terminate</td>
                    </tr>
                    <tr class="bg-slate-800">
                        <td class="p-3 text-slate-300">GPS-denied fence</td>
                        <td class="p-3 text-slate-300">Disables fence, triggers LAND mode</td>
                        <td class="p-3 text-slate-300">Disables fence, triggers failsafe</td>
                    </tr>
                    <tr class="bg-slate-900">
                        <td class="p-3 text-slate-300">SmartRTL</td>
                        <td class="p-3 text-slate-300 text-emerald-400">Yes — retraces exact outbound path to avoid obstacles</td>
                        <td class="p-3 text-slate-300">No (direct RTL only)</td>
                    </tr>
                    <tr class="bg-slate-800">
                        <td class="p-3 text-slate-300">Terrain-following RTH</td>
                        <td class="p-3 text-slate-300 text-emerald-400">Yes — SRTM terrain data from SD card</td>
                        <td class="p-3 text-slate-300">Manual terrain clearance altitude only</td>
                    </tr>
                    <tr class="bg-slate-900">
                        <td class="p-3 text-slate-300">Rally points</td>
                        <td class="p-3 text-slate-300 text-emerald-400">Yes — multiple alternate landing points</td>
                        <td class="p-3 text-slate-300">Single home position</td>
                    </tr>
                    <tr class="bg-slate-800">
                        <td class="p-3 text-slate-300">Battery failsafe</td>
                        <td class="p-3 text-slate-300">RTL or land at configurable SoC thresholds</td>
                        <td class="p-3 text-slate-300">RTL at configurable battery % or voltage</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="insight-box">
        <div class="insight-label">SmartRTL vs. DIRECT RTL</div>
        <p class="text-slate-200 text-sm mt-1">ArduPilot's SmartRTL records a breadcrumb trail of the drone's outbound path in memory (up to 300 waypoints, 150m spacing). On RTL trigger, it retraces those breadcrumbs in reverse — guaranteeing the return path is obstacle-free because the drone already flew it successfully. This is critical in forested or urban operations where the direct home vector passes through structures. Direct RTL is faster but can fly into obstacles if the operating environment has vertical or horizontal obstructions between the current position and home.</p>
    </div>

    <h3>13.17 Terrain Following</h3>
    <p>Terrain following maintains a constant altitude <em>above ground level (AGL)</em> rather than above sea level (MSL). This is essential for: low-altitude survey (photogrammetry, crop inspection), nap-of-the-earth (NOE) flight for tactical concealment, and obstacle clearance in hilly terrain. Both ArduPilot and PX4 support terrain following, but with different implementations.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Terrain Following: Implementation Details</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-2">ArduPilot: SRTM Terrain Data</strong>
                <p class="text-slate-400 mb-1">Ground Control Station (Mission Planner/QGC) downloads SRTM 3-arcsecond (90m resolution) terrain data and stores on flight controller SD card. During flight, terrain altitude is interpolated for the current location at 10 Hz.</p>
                <p class="text-slate-400 mb-1">Parameter: <code>TERRAIN_ENABLE=1</code>. In AUTO/GUIDED modes, altitude setpoints are relative to terrain. Works offline — no telemetry required during flight.</p>
                <p class="text-slate-400">Limitation: 90m SRTM resolution misses localized terrain features. 1-arcsecond (30m) data available for CONUS via <code>TERRAIN_ACCU_RAD</code> upgrade.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 block mb-2">PX4: Rangefinder + EKF Fusion</strong>
                <p class="text-slate-400 mb-1">PX4 uses a downward-facing rangefinder (lidar altimeter, e.g., TF-Luna, Benewake TFmini) fused into EKF2 as ground distance measurement. The EKF maintains a terrain altitude estimate that updates at rangefinder rate (20–100 Hz).</p>
                <p class="text-slate-400 mb-1">Parameter: <code>EKF2_RNG_CTRL=1</code> (use rangefinder for height). Altitude hold mode with <code>EKF2_TERR_NOISE</code> and <code>EKF2_TERR_GRAD</code> tuning.</p>
                <p class="text-slate-400">Advantage: real-time terrain tracking regardless of map accuracy. Limitation: rangefinder range typically 10–40m, fails on steep slopes (&gt;30° tilt).</p>
            </div>
        </div>
    </div>

    <h3>13.18 nav2 Core Architecture and Behavior Trees</h3>
    <p>nav2 is the production navigation framework for ROS 2 robots. Its architecture uses <strong>BehaviorTree.CPP</strong> to define mission logic, lifecycle-managed nodes for clean startup/shutdown sequencing, and an action server interface for external mission commanding.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">nav2 Core Node Architecture</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="space-y-3">
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-sky-400">bt_navigator</strong>
                    <p class="text-slate-400 mt-1">Top-level coordinator. Accepts NavigateToPose or NavigateThroughPoses actions. Executes an XML Behavior Tree file that calls planner_server and controller_server. Default BT: ComputePathToPose → FollowPath → RecoveryFallback.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-emerald-400">planner_server</strong>
                    <p class="text-slate-400 mt-1">Hosts the global planner plugin. Choices: NavFn (A*/Dijkstra), SMAC Hybrid-A*, SMAC Lattice, or custom. Computes path on request via compute_path_to_pose action. Runs once per goal or on replan trigger at 1–2 Hz.</p>
                </div>
            </div>
            <div class="space-y-3">
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-amber-400">controller_server</strong>
                    <p class="text-slate-400 mt-1">Hosts the local planner plugin. Choices: DWA (DWB), TEB, MPPI, RPP (Regulated Pure Pursuit). Called by bt_navigator's follow_path action. Publishes cmd_vel at 20–100 Hz. Triggers recovery on timeout.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-purple-400">behavior_server</strong>
                    <p class="text-slate-400 mt-1">Executes recovery behaviors: Spin, BackUp, Wait, ClearCostmapService. When controller is stuck, bt_navigator invokes a recovery sequence. Prevents deadlocking in local minima or narrow corridors.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            XML: nav2 default NavigateToPose Behavior Tree (with recovery sequence)
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>XML Code Example</summary>
<pre><code class="language-xml">&lt;root main_tree_to_execute="MainTree"&gt;
  &lt;BehaviorTree ID="MainTree"&gt;
    &lt;RecoveryNode number_of_retries="6" name="NavigateRecovery"&gt;
      &lt;PipelineSequence name="NavigateWithReplanning"&gt;
        &lt;RateController hz="1.0"&gt;         &lt;!-- replan at 1 Hz --&gt;
          &lt;RecoveryNode number_of_retries="1"&gt;
            &lt;ComputePathToPose goal="{goal}" path="{path}"/&gt;
            &lt;ClearEntireCostmap server_name="global_costmap"/&gt;
          &lt;/RecoveryNode&gt;
        &lt;/RateController&gt;
        &lt;RecoveryNode number_of_retries="1"&gt;
          &lt;FollowPath path="{path}" controller_id="FollowPath"/&gt;
          &lt;ClearEntireCostmap server_name="local_costmap"/&gt;
        &lt;/RecoveryNode&gt;
      &lt;/PipelineSequence&gt;
      &lt;Sequence name="RecoveryActions"&gt;
        &lt;Spin spin_dist="1.57"/&gt;   &lt;!-- 90 deg spin to escape --&gt;
        &lt;Wait wait_duration="5"/&gt;
        &lt;BackUp backup_dist="0.3" backup_speed="0.1"/&gt;
      &lt;/Sequence&gt;
    &lt;/RecoveryNode&gt;
  &lt;/BehaviorTree&gt;
&lt;/root&gt;</code></pre>
</details>
        </div>
    </div>

    <h3>13.19 SLAM for Drone Navigation</h3>
    <p>Simultaneous Localization And Mapping (SLAM) solves a chicken-and-egg problem: to build a map you need to know where you are, but to know where you are you need a map. For drones, the two dominant modalities are <strong>LiDAR-Inertial SLAM</strong> (accurate metric maps, works in dark/textureless environments) and <strong>Visual SLAM</strong> (low cost, rich semantic information).</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">System</th>
                    <th class="p-3">Modality</th>
                    <th class="p-3">Map Type</th>
                    <th class="p-3">Frequency</th>
                    <th class="p-3">Key Strength</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">FAST-LIO2</td>
                    <td class="p-3 text-slate-300">LiDAR + IMU</td>
                    <td class="p-3 text-slate-300">Point cloud (ikd-Tree)</td>
                    <td class="p-3 text-slate-300">100 Hz</td>
                    <td class="p-3 text-slate-300">No feature extraction, 1000 deg/s rotation</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">KISS-ICP</td>
                    <td class="p-3 text-slate-300">LiDAR only</td>
                    <td class="p-3 text-slate-300">Point cloud (kd-tree)</td>
                    <td class="p-3 text-slate-300">10–100 Hz</td>
                    <td class="p-3 text-slate-300">No IMU needed, any LiDAR type, easy setup</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">LIO-SAM</td>
                    <td class="p-3 text-slate-300">LiDAR + IMU + GPS</td>
                    <td class="p-3 text-slate-300">OctoMap / PCD</td>
                    <td class="p-3 text-slate-300">10 Hz (scan)</td>
                    <td class="p-3 text-slate-300">Loop closure, large-scale outdoor mapping</td>
                </tr>
                <tr class="bg-slate-900">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">ORB-SLAM3</td>
                    <td class="p-3 text-slate-300">Camera (+ IMU opt.)</td>
                    <td class="p-3 text-slate-300">Sparse landmarks</td>
                    <td class="p-3 text-slate-300">30 Hz (cam)</td>
                    <td class="p-3 text-slate-300">Multi-map, strong DBoW3 loop closure</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono text-amber-400">RTAB-Map</td>
                    <td class="p-3 text-slate-300">RGB-D / Stereo / LiDAR</td>
                    <td class="p-3 text-slate-300">Dense 3D, OctoMap</td>
                    <td class="p-3 text-slate-300">5–10 Hz</td>
                    <td class="p-3 text-slate-300">Dense mapping, ROS 2 native, nav2 compatible</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h4>FAST-LIO2: Direct LiDAR-Inertial Odometry</h4>
    <p>FAST-LIO2 (HKU-MARS, 2022) uses a tightly-coupled iterated Extended Kalman Filter (IEKF) that directly registers raw LiDAR points to the map — no feature extraction step. The map is maintained in an <strong>ikd-Tree</strong> (incremental k-d Tree) that supports dynamic insertions, deletions, and re-balancing without rebuild, enabling 100 Hz operation rate. FAST-LIVO2 (2024) extends this with visual observations for pixel-level mapping precision in colored point clouds.</p>

    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
        FAST-LIO2 IEKF State:  X = [R, p, v, b_g, b_a]  (rotation, position, velocity, biases)<br><br>
        Prediction (IMU propagation, 200 Hz):<br>
        R_{k+1} = R_k * Exp( (omega_m - b_g) * dt )<br>
        p_{k+1} = p_k + v_k*dt + 0.5*(R_k*(a_m - b_a) - g)*dt^2<br><br>
        LiDAR update (point-to-plane ICP, iterated):<br>
        For each point p_i, find nearest plane in ikd-Tree.<br>
        Residual: r_i = n_j^T * (R*p_i + t - q_j)   [n_j = plane normal, q_j = centroid]<br>
        IEKF iterates until convergence (typically 3-5 iters per scan at 10 Hz).<br><br>
        Result: 0.1-0.3% drift rate, robust to 1000 deg/s rotation.
    </div>
</details>

    <h3>13.20 Safety-Critical Control: Control Barrier Functions</h3>
    <p>Classical navigation stacks provide probabilistic safety (unlikely to hit obstacles) but no hard guarantees. <strong>Control Barrier Functions (CBFs)</strong> provide mathematically provable safety constraints that are enforced in real-time by augmenting any existing controller with a minimal correction via Quadratic Program (QP). The key insight: CBFs modify the control input u to guarantee the system state never leaves a defined safe set S — regardless of what the upstream planner requests.</p>

    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
        Safe set definition:  S = {x : h(x) >= 0}   (e.g., h(x) = ||p_drone - p_obs|| - r_safe)<br><br>
        CBF condition (forward invariance of S):<br>
        dh/dt >= -alpha(h(x))   where alpha is a class-K function (e.g., alpha(h) = gamma*h)<br><br>
        Safety filter QP (solved at control rate, e.g., 100 Hz):<br>
        min_{u}  ||u - u_nom||^2          [minimal deviation from nominal controller]<br>
        s.t.     (dh/dx)*g(x)*u >= -gamma*h(x) - (dh/dx)*f(x)   [CBF constraint]<br>
                 u_min &lt;= u &lt;= u_max       [actuator limits]<br><br>
        Result: u* satisfies safety constraint with provable set-invariance guarantee.<br>
        Solve time: &lt;0.1ms (small QP). Compatible with any existing planner.
    </div>
</details>

    <h3>13.21 Multi-Agent Path Finding (MAPF)</h3>
    <p>When multiple drones must navigate simultaneously in shared airspace, individual path planners create collisions and deadlocks. MAPF computes collision-free paths for all agents simultaneously. The two dominant paradigms are <strong>centralized planning</strong> (optimal but computationally expensive) and <strong>distributed reactive avoidance</strong> (scalable but suboptimal).</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">MAPF Algorithm Selection Guide</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">CBS / SL-CBS</strong>
                <p class="text-slate-400">Centralized, optimal. Use when: &lt;50 drones, centralized planner available, optimal paths required (package delivery, precision agriculture). Re-plan offline when new drones enter the airspace.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-1">ORCA / RVO2</strong>
                <p class="text-slate-400">Distributed, reactive. Use when: 50–1000 drones, no centralized planner, open spaces. Standard in commercial drone light shows. Fails in narrow corridors — supplement with CBS for bottlenecks.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-1">EGO-Swarm</strong>
                <p class="text-slate-400">Distributed gradient-based planning. Use when: fast, aggressive multi-drone flight in cluttered environments. Inter-agent repulsion terms in B-spline optimizer. Validated at 5+ m/s in forests.</p>
            </div>
        </div>
    </div>

    <h3>13.22 Mission Planning with MAVSDK</h3>
    <p><strong>MAVSDK</strong> is the modern, actively maintained SDK for commanding PX4-based drones via MAVLink. It replaces DroneKit (last released 2017, ArduPilot-focused) with a clean async API supporting C++, Python, Swift, and Kotlin. MAVSDK v3.x adds gRPC streaming for low-latency telemetry and is the recommended approach for PX4 companion computer applications.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Python (MAVSDK): Autonomous waypoint mission with takeoff, survey, return
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import asyncio
from mavsdk import System
from mavsdk.mission import MissionItem, MissionPlan

async def run_survey_mission():
    drone = System()
    await drone.connect(system_address="udp://:14540")

    async for state in drone.core.connection_state():
        if state.is_connected:
            break

    mission_items = [
        MissionItem(
            latitude_deg=47.3977508,
            longitude_deg=8.5456073,
            relative_altitude_m=30,
            speed_m_s=8.0,
            is_fly_through=True,
            gimbal_pitch_deg=-90,       # Nadir camera for survey
            gimbal_yaw_deg=float('nan'),
            camera_action=MissionItem.CameraAction.TAKE_PHOTO,
            loiter_time_s=float('nan'),
            camera_photo_interval_s=2.0
        ),
        # ... additional survey waypoints
    ]

    mission_plan = MissionPlan(mission_items)
    await drone.mission.upload_mission(mission_plan)
    await drone.action.arm()
    await drone.action.takeoff()
    await asyncio.sleep(5)
    await drone.mission.start_mission()

    async for progress in drone.mission.mission_progress():
        print(f"Mission item {progress.current}/{progress.total}")
        if progress.current == progress.total:
            await drone.action.return_to_launch()
            break</code></pre>
</details>
        </div>
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Video: ROS 2D Drone Navigation — Mapping and Path Planning</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/dND4oCMqmRs" title="ROS Q&A 181 - 2D Drone Navigation Part 1 Mapping" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
    </div>

    <h3>13.23 Practical Considerations for 3D Drone Path Planning</h3>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">Production Engineering Checklist</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="space-y-3">
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-sky-400 text-xs uppercase block mb-1">Voxel Grid vs. Octree</strong>
                    <p class="text-slate-400 text-xs">Voxel grids (fixed resolution, dense array) offer O(1) lookup — critical for real-time collision checking. Octrees (OctoMap) are memory-efficient for large sparse environments but have O(log n) query time. Use OctoMap for map storage; convert to a local dense voxel grid for the planner's collision checker at runtime.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-amber-400 text-xs uppercase block mb-1">Moving Obstacle Handling</strong>
                    <p class="text-slate-400 text-xs">The obstacle layer in nav2 has a <code>decay_time</code> parameter (typically 5–10s). Fast-moving obstacles (pedestrians, other drones) require shorter decay. Combine with a separate dynamic obstacle tracker publishing to a /people or /obstacles topic feeding a dedicated obstacle layer plugin.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-emerald-400 text-xs uppercase block mb-1">Replanning Frequency</strong>
                    <p class="text-slate-400 text-xs">Global replanning at 1–2 Hz. Triggered by: new obstacle intersecting current global path, localization uncertainty exceeding threshold, goal changed. Cache the last valid path and only invalidate via path-collision-check at 5 Hz. Use D* Lite instead of A* for dynamic environments — 10–100x faster incremental updates.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-purple-400 text-xs uppercase block mb-1">Coordinate Frames</strong>
                    <p class="text-slate-400 text-xs">ROS uses ENU (East-North-Up). PX4 uses NED (North-East-Down). MAVROS converts automatically, but raw MAVLink users must apply: x_NED = y_ENU, y_NED = x_ENU, z_NED = -z_ENU. Geoid vs. ellipsoid altitude: GPS altitude is ellipsoidal (WGS84); barometric altitude is geoid (MSL). Difference up to 100m depending on location.</p>
                </div>
            </div>
            <div class="space-y-3">
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-rose-400 text-xs uppercase block mb-1">3D vs. 2.5D Maps</strong>
                    <p class="text-slate-400 text-xs">Full 3D voxel maps are required for indoor drones flying at varying altitudes. Outdoor drones at fixed altitude above terrain can use a 2.5D elevation map (faster, lower memory), projecting 3D obstacles onto a heightmap. Elevation map fails for bridges, tunnels, and multi-floor interiors.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-teal-400 text-xs uppercase block mb-1">Localization Failure Handling</strong>
                    <p class="text-slate-400 text-xs">Monitor AMCL or EKF covariance. If position uncertainty (1-sigma) exceeds 0.5m, suspend navigation and hover in place. Re-initialize localization by spinning slowly to accumulate sensor observations. Never navigate with high uncertainty — the costmap will be incorrectly aligned and collision avoidance will fail.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-sky-400 text-xs uppercase block mb-1">nav2 for 3D Drone</strong>
                    <p class="text-slate-400 text-xs">Three mandatory changes from default: (1) Replace 2D costmap with voxel grid layer using <code>spatio_temporal_voxel_layer</code>; (2) Set <code>rolling_window: true</code>, remove floor inflation layer; (3) Set <code>min_turning_radius: 0.0</code> for holonomic quadrotor in TEB or use <code>Omni</code> model in MPPI.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-amber-400 text-xs uppercase block mb-1">Time-Optimal vs. Energy-Optimal</strong>
                    <p class="text-slate-400 text-xs">Time-optimal trajectory: fly at max velocity, minimize snap for motor feasibility. Energy-optimal: fly at ~8–12 m/s (power per meter minimum), align with wind, minimize altitude changes. The two objectives diverge by 20–40% in battery life on typical survey missions. For SAR/time-critical: time-optimal. For long-endurance inspection: energy-optimal.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mt-6">
        <h4 class="mt-0 border-none text-white">Navigation Stack Selection Matrix</h4>
        <p class="text-slate-400 text-xs mb-4">Use this matrix to select the appropriate algorithm combination for your operational scenario.</p>
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
                <thead class="bg-slate-700 text-slate-300">
                    <tr>
                        <th class="p-3">Scenario</th>
                        <th class="p-3">Global Planner</th>
                        <th class="p-3">Local Planner</th>
                        <th class="p-3">Localization</th>
                        <th class="p-3">Safety</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-700">
                    <tr class="bg-slate-800">
                        <td class="p-3 text-amber-400">Indoor GPS-denied</td>
                        <td class="p-3 text-slate-300">A* on OctoMap</td>
                        <td class="p-3 text-slate-300">MPPI / TEB</td>
                        <td class="p-3 text-slate-300">FAST-LIO2 + UWB</td>
                        <td class="p-3 text-slate-300">CBF filter</td>
                    </tr>
                    <tr class="bg-slate-900">
                        <td class="p-3 text-amber-400">Outdoor RTK GPS</td>
                        <td class="p-3 text-slate-300">A* / SMAC Hybrid</td>
                        <td class="p-3 text-slate-300">DWA / MPPI</td>
                        <td class="p-3 text-slate-300">ZED-F9P RTK + EKF2</td>
                        <td class="p-3 text-slate-300">Geofence + CBF</td>
                    </tr>
                    <tr class="bg-slate-800">
                        <td class="p-3 text-amber-400">Dynamic obstacle-rich</td>
                        <td class="p-3 text-slate-300">D* Lite</td>
                        <td class="p-3 text-slate-300">MPPI / EGO-Planner</td>
                        <td class="p-3 text-slate-300">VIO + LiDAR SLAM</td>
                        <td class="p-3 text-slate-300">ORCA + CBF</td>
                    </tr>
                    <tr class="bg-slate-900">
                        <td class="p-3 text-amber-400">Aggressive flight (&gt;5 m/s)</td>
                        <td class="p-3 text-slate-300">Informed-RRT* / EGO</td>
                        <td class="p-3 text-slate-300">EGO-Planner + NMPC</td>
                        <td class="p-3 text-slate-300">FAST-LIVO2</td>
                        <td class="p-3 text-slate-300">Min-snap limits + CBF</td>
                    </tr>
                    <tr class="bg-slate-800">
                        <td class="p-3 text-amber-400">Multi-drone (&lt;50 agents)</td>
                        <td class="p-3 text-slate-300">CBS / SL-CBS</td>
                        <td class="p-3 text-slate-300">ORCA local</td>
                        <td class="p-3 text-slate-300">RTK-GPS per agent</td>
                        <td class="p-3 text-slate-300">Swarm CBF</td>
                    </tr>
                    <tr class="bg-slate-900">
                        <td class="p-3 text-amber-400">Precision landing</td>
                        <td class="p-3 text-slate-300">MAVSDK mission</td>
                        <td class="p-3 text-slate-300">AprilTag PnP</td>
                        <td class="p-3 text-slate-300">GPS → visual handoff</td>
                        <td class="p-3 text-slate-300">Descent rate limiting</td>
                    </tr>
                    <tr class="bg-slate-800">
                        <td class="p-3 text-amber-400">Energy-constrained survey</td>
                        <td class="p-3 text-slate-300">Energy-weighted A*</td>
                        <td class="p-3 text-slate-300">DWA (conservative)</td>
                        <td class="p-3 text-slate-300">GPS + barometer</td>
                        <td class="p-3 text-slate-300">Battery RTL trigger</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <h3>External Resources</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-4">
        <div class="bg-slate-900 p-3 rounded border border-slate-700">
            <strong class="text-sky-400 block mb-2">Papers &amp; Documentation</strong>
            <ul class="space-y-1 text-slate-400">
                <li><a href="https://arxiv.org/abs/2109.07001" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">FAST-LIO2 (HKU-MARS, 2022)</a> — LiDAR-inertial odometry with ikd-Tree</li>
                <li><a href="https://github.com/PRBonn/kiss-icp" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">KISS-ICP GitHub (PRBonn)</a> — Simple LiDAR odometry, ROS 2 native</li>
                <li><a href="https://docs.nav2.org/configuration/packages/configuring-mppic.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">nav2 MPPI Controller Docs</a> — Official configuration reference</li>
                <li><a href="https://arxiv.org/abs/1404.2334" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Informed-RRT* (Gammell et al., 2014)</a> — Ellipsoidal heuristic sampling</li>
                <li><a href="https://www.u-blox.com/en/product/zed-f9p-module" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">u-blox ZED-F9P Datasheet</a> — RTK GPS module for drones</li>
                <li><a href="https://ardupilot.org/copter/docs/terrain-following.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">ArduPilot Terrain Following Docs</a></li>
                <li><a href="https://arxiv.org/abs/2403.03806" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Precision Landing with Fiducials (2024)</a> — AprilTag + IR, 168m range</li>
            </ul>
        </div>
        <div class="bg-slate-900 p-3 rounded border border-slate-700">
            <strong class="text-amber-400 block mb-2">Open-Source Projects</strong>
            <ul class="space-y-1 text-slate-400">
                <li><a href="https://github.com/ros-navigation/navigation2" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">nav2 (ros-navigation/navigation2)</a> — ROS 2 navigation stack</li>
                <li><a href="https://github.com/hku-mars/FAST_LIO" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">FAST-LIO2 GitHub (HKU-MARS)</a></li>
                <li><a href="https://github.com/HKUST-Aerial-Robotics/VINS-Fusion" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">VINS-Fusion (HKUST)</a> — Multi-sensor VIO</li>
                <li><a href="https://docs.openvins.com" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">OpenVINS Docs (UoDelaware)</a> — MSCKF VIO, ROS 2 native</li>
                <li><a href="https://github.com/HKUST-Aerial-Robotics/EGO-Planner-v2" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">EGO-Swarm GitHub (HKUST)</a></li>
                <li><a href="https://ethz-asl.github.io/mav_trajectory_generation/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">mav_trajectory_generation (ETHZ-ASL)</a> — Minimum snap</li>
                <li><a href="https://mavsdk.mavlink.io/main/en/python/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">MAVSDK Python Docs</a> — Mission control SDK</li>
            </ul>
        </div>
    </div>
</div>
`;
