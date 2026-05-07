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
                <p class="text-slate-400 text-xs">Algorithms: A*, Dijkstra, RRT*, SMAC Hybrid-A*, D* Lite. Input: occupancy grid or voxel map. Output: list of waypoints.</p>
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

    <div class="math-block">
        Inflation cost at distance d from obstacle:<br><br>
        cost(d) = 253 * e^( -1 * cost_scaling_factor * (d - inscribed_radius) )<br><br>
        Typical params: inscribed_radius = 0.2m (quadrotor arm span / 2)<br>
        inflation_radius = 0.6m, cost_scaling_factor = 10.0
    </div>

    <p>Costmaps have two layers: <strong>static layer</strong> (loaded from a pre-built SLAM map, does not change during flight) and <strong>obstacle layer</strong> (populated from live sensor data — depth camera, LiDAR — and decays over time so that moved obstacles eventually clear). For 3D drone navigation, the standard nav2 costmap is extended to a voxel grid; the <code>spatio_temporal_voxel_layer</code> plugin is the current ROS 2 standard, built on OpenVDB.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Costmap Layer Stack (nav2, 3D Drone)</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Static Layer</strong>
                <p class="text-slate-400">Loaded from a pre-built SLAM map (OctoMap .bt or PCD file). Does not change during flight. Represents walls, permanent structures, known no-fly zones.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-1">Obstacle / Voxel Layer</strong>
                <p class="text-slate-400">Populated from live depth/LiDAR data. <code>decay_time</code> (5–10s) lets moved obstacles clear. <code>spatio_temporal_voxel_layer</code> uses OpenVDB for efficient 3D storage.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-1">Inflation Layer</strong>
                <p class="text-slate-400">Expands lethal obstacle cells outward using exponential decay. Produces smooth cost gradients that guide the planner away from walls. Radius typically 2–3x drone body radius.</p>
            </div>
        </div>
    </div>

    <h3>13.3 Global Planning Algorithms</h3>

    <h4>A* (A-Star)</h4>
    <p>A* is a best-first graph search. It maintains an open set of nodes ordered by <code>f(n) = g(n) + h(n)</code>, where <code>g(n)</code> is the exact cost from start to node n, and <code>h(n)</code> is the admissible heuristic estimate to goal. Euclidean distance is the standard heuristic for 3D drone navigation. A* is guaranteed optimal <em>if and only if</em> h(n) never overestimates the true cost (admissibility). On a 3D voxel grid with resolution 0.2m and a 200m flight envelope, A* explores up to 10<sup>6</sup> cells — computationally feasible offline but too slow for real-time replanning.</p>

    <div class="math-block">
        f(n) = g(n) + h(n)<br>
        h(n) = sqrt( (x_goal - x_n)^2 + (y_goal - y_n)^2 + (z_goal - z_n)^2 )<br><br>
        Dijkstra's algorithm = A* with h(n) = 0 for all n.<br>
        Used when no geometric heuristic is available (non-Euclidean cost spaces).
    </div>

    <h4>RRT (Rapidly-exploring Random Tree)</h4>
    <p>RRT is a sampling-based planner. It grows a tree from the start by: (1) sampling a random point in the configuration space, (2) finding the nearest tree node, (3) extending toward the random sample by a fixed step size (typically 0.5–1.0m for drones), (4) checking the segment for collisions. It explores high-dimensional spaces (e.g., 6-DOF SE(3)) where grid-based methods become intractable. Critically: <strong>RRT is NOT optimal</strong>. The path it finds is the first feasible path found, which is typically long and jagged.</p>

    <h4>RRT* (Asymptotically Optimal RRT)</h4>
    <p>RRT* adds two operations after each new node is added to the tree. First, <strong>choosing a better parent</strong>: instead of connecting to the nearest node, it searches all nodes within a radius r (the near-neighbor radius) and picks the parent that minimizes the total cost from start. Second, <strong>rewiring</strong>: it checks if any existing node in the radius would have a lower cost if re-routed through the new node, and if so, changes the parent connection. This rewiring step is what makes RRT* asymptotically optimal — given infinite samples, the path converges to the global optimum.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">Planning Algorithm Comparison</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-slate-300 border-collapse">
                <thead>
                    <tr class="border-b border-slate-600">
                        <th class="text-left p-2 text-sky-400">Algorithm</th>
                        <th class="text-left p-2 text-sky-400">Optimal?</th>
                        <th class="text-left p-2 text-sky-400">Complete?</th>
                        <th class="text-left p-2 text-sky-400">Best Use Case</th>
                        <th class="text-left p-2 text-sky-400">Compute</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 font-mono text-amber-400">A*</td>
                        <td class="p-2">Yes (w/ admissible h)</td>
                        <td class="p-2">Yes</td>
                        <td class="p-2">Grid maps, known environment</td>
                        <td class="p-2">Medium</td>
                    </tr>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 font-mono text-amber-400">Dijkstra</td>
                        <td class="p-2">Yes</td>
                        <td class="p-2">Yes</td>
                        <td class="p-2">Non-Euclidean cost spaces</td>
                        <td class="p-2">High</td>
                    </tr>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 font-mono text-amber-400">RRT</td>
                        <td class="p-2">No</td>
                        <td class="p-2">Prob. Yes</td>
                        <td class="p-2">High-DOF, first feasible path</td>
                        <td class="p-2">Low</td>
                    </tr>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 font-mono text-amber-400">RRT*</td>
                        <td class="p-2">Asymptotically</td>
                        <td class="p-2">Prob. Yes</td>
                        <td class="p-2">High-DOF, quality paths</td>
                        <td class="p-2">Medium</td>
                    </tr>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 font-mono text-amber-400">PRM</td>
                        <td class="p-2">No (graph dep.)</td>
                        <td class="p-2">Prob. Yes</td>
                        <td class="p-2">Static env., many queries</td>
                        <td class="p-2">High (offline)</td>
                    </tr>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 font-mono text-amber-400">D* Lite</td>
                        <td class="p-2">Yes (given map)</td>
                        <td class="p-2">Yes</td>
                        <td class="p-2">Dynamic environments</td>
                        <td class="p-2">Low (incremental)</td>
                    </tr>
                    <tr class="hover:bg-slate-800/30">
                        <td class="p-2 font-mono text-amber-400">Hybrid A*</td>
                        <td class="p-2">Sub-optimal</td>
                        <td class="p-2">Yes</td>
                        <td class="p-2">Kinodynamic constraints</td>
                        <td class="p-2">Medium</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <h4>Probabilistic Roadmap Method (PRM)</h4>
    <p>PRM operates in two distinct phases. In the <strong>learning (offline) phase</strong>, random collision-free configurations are sampled in the C-space, and nearby valid samples are connected by straight-line edges (verified collision-free). This builds a graph stored as an adjacency list. In the <strong>query (online) phase</strong>, the start and goal are connected to their nearest roadmap nodes, then a standard graph search (A* or Dijkstra) finds a path. PRM excels in static environments where the roadmap can be built once and reused for thousands of queries — a major advantage over RRT* which must rebuild from scratch each call.</p>

    <p>For drones, PRM works well in structured environments (warehouses, known building interiors). The key challenge is the <strong>narrow passage problem</strong>: random sampling rarely generates configurations inside tight corridors, leaving them disconnected in the roadmap. Advanced sampling strategies like Bridge Test or Gaussian sampling bias samples toward obstacle boundaries where narrow passages occur.</p>

    <div class="math-block">
        PRM connection criterion:<br>
        connect(q_i, q_j) if  dist(q_i, q_j) &lt; r_connect  AND  path(q_i, q_j) is collision-free<br><br>
        r_connect = gamma_PRM * (log(n) / n)^(1/d)   [asymptotically optimal radius]<br>
        n = number of samples, d = C-space dimension (3 for SE(2), 6 for SE(3))<br><br>
        For a 3D drone indoor warehouse: d=3, n=5000 samples typically sufficient<br>
        Expected build time: 2–10s (once). Query time: &lt;50ms (A* on graph)
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
                <p class="text-slate-400">When edge costs change (obstacle detected), only affected nodes are marked inconsistent and added to queue. D* Lite repairs just those nodes — typically O(k log n) for k affected cells, vs O(n log n) for fresh A*. Critical for real-time replanning.</p>
            </div>
        </div>
    </div>

    <p>D* Lite plans <em>backwards from goal to start</em>. As the drone moves, it updates its position and the start-node key offsets shift. When obstacles are detected, only the affected edges and their downstream nodes are re-expanded. In practice, D* Lite enables replanning in milliseconds even in 3D grids of 10<sup>5</sup>–10<sup>6</sup> cells.</p>

    <div class="math-block">
        Key function: k(n) = [k1, k2]<br>
        k1(n) = min(g(n), rhs(n)) + h(s_start, n) + key_modifier<br>
        k2(n) = min(g(n), rhs(n))<br><br>
        key_modifier accumulates as the robot moves (avoids re-keying entire queue).<br><br>
        When map changes: mark affected edges, update rhs of predecessors, re-insert to priority queue.<br>
        Call ComputeShortestPath() — only inconsistent nodes are processed.
    </div>

    <h3>13.5 SMAC Planner: Hybrid A* and State Lattice</h3>
    <p>The <strong>nav2 SMAC Planner</strong> (Steve Macenski, Open Navigation) provides three kinodynamically-aware A* variants that produce smoother, more physically realistic paths than vanilla A*. Unlike standard A* which ignores robot kinematics, SMAC searches the robot's configuration space including heading.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">SMAC Planner Variants</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">SmacPlanner2D</strong>
                <p class="text-slate-400">Cost-aware A* on 2D grid. Supports circular differential and omni-directional robots. Uses the full costmap gradient (not just lethal/free). Best for holonomic robots in 2D environments.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-1">SmacPlannerHybrid</strong>
                <p class="text-slate-400">Hybrid A* — searches in (x, y, theta) space. Each expansion uses a set of motion primitives respecting the robot's turning radius. Produces smooth, kinematically feasible paths. Ideal for fixed-wing UAVs, Ackermann ground vehicles.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-1">SmacPlannerLattice</strong>
                <p class="text-slate-400">State lattice search using pre-computed motion primitives for any robot model. Supports fully 3D state spaces. Uses an SBPL-style lattice: regular set of states + pre-computed, dynamically feasible transitions. Best for complex vehicle models.</p>
            </div>
        </div>
    </div>

    <p>For quadrotors, <strong>SmacPlannerHybrid</strong> is most commonly adapted: setting <code>minimum_turning_radius: 0.0</code> makes it holonomic (the drone can translate in any direction), while the (x, y, theta) search still produces heading-aware paths useful for camera-pointed inspection missions. The planner runs at ~5 Hz for typical indoor maps.</p>

    <h3>13.6 Local Planning: DWA and TEB</h3>

    <h4>DWA — Dynamic Window Approach</h4>
    <p>DWA operates entirely in velocity space. At each 10 Hz tick, it samples hundreds of (linear_velocity, angular_velocity) pairs within a "dynamic window" — the subset of velocities physically reachable within one timestep given the drone's acceleration limits. Each sample is forward-simulated for ~1.5 seconds to produce a trajectory arc. Each arc is scored by a weighted sum:</p>

    <div class="math-block">
        score = w_progress * heading_to_goal<br>
               + w_clearance * min_obstacle_distance<br>
               + w_velocity  * linear_velocity_magnitude<br><br>
        Key nav2 parameters:<br>
        max_vel_x: 0.5 m/s (horizontal cruise), min_vel_x: -0.5 m/s<br>
        acc_lim_x: 1.0 m/s^2,  acc_lim_theta: 1.5 rad/s^2<br>
        sim_time: 1.5s,  vx_samples: 20,  vy_samples: 5
    </div>

    <p>DWA is computationally cheap and reactive — ideal for cluttered, dynamic environments. Its weakness: it can get stuck in narrow corridors because no sampled arc scores well (too close to walls on both sides). Recovery behaviors in nav2 handle this case.</p>

    <h4>TEB — Timed Elastic Band</h4>
    <p>TEB represents the path as a sequence of robot poses with explicit timestamps: {(x_1,y_1,theta_1,t_1), ..., (x_n,y_n,theta_n,t_n)}. This is an "elastic band" because it is optimized iteratively. The optimization objective penalizes: deviation from the global plan, obstacle proximity, excessive acceleration, violation of the drone's minimum turning radius, and time. TEB handles <strong>kinodynamic constraints</strong> directly — you can specify max angular acceleration, max lateral velocity, and minimum clearance as hard constraints in the graph.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            YAML: nav2 TEB local planner configuration for quadrotor
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-bash">controller_server:
  ros__parameters:
    controller_plugins: ["FollowPath"]
    FollowPath:
      plugin: "teb_local_planner::TebLocalPlannerROS"
      max_vel_x: 1.0
      max_vel_x_backwards: 0.3
      max_vel_theta: 1.0
      acc_lim_x: 0.5
      acc_lim_theta: 0.8
      min_turning_radius: 0.0        # 0.0 = holonomic (quadrotor can rotate in place)
      footprint_model:
        type: "circular"
        radius: 0.35                  # quadrotor arm-to-arm radius
      obstacle_proximity_ratio: 0.6
      weight_obstacle: 50.0
      weight_kinematics_forward_drive: 1.0
      dt_ref: 0.3                     # target time resolution of poses
      dt_hysteresis: 0.1</code></pre>
        </div>
    </div>

    <h3>13.7 MPPI Controller — Model Predictive Path Integral</h3>
    <p>MPPI (Model Predictive Path Integral) is the state-of-the-art local planner in nav2 as of 2024. Unlike DWA and TEB, MPPI is a <strong>stochastic sampling-based MPC</strong>: it forward-simulates thousands of randomly perturbed control sequences in parallel, evaluates each with a cost function, and computes the optimal control as an information-theoretically weighted average. Critically, the cost function does not need to be convex or differentiable — enabling complex multi-objective behaviors impossible with optimization-based methods.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">MPPI Algorithm Flow</h4>
        <div class="space-y-2 text-xs text-slate-300 font-mono">
            <div class="flex items-start gap-3">
                <span class="text-sky-400 font-bold shrink-0">1.</span>
                <span><strong class="text-sky-400">Sample:</strong> Draw K=1000 control sequences {U_k} as noisy perturbations of the previous optimal sequence U* using Gaussian noise (sigma_v=0.2 m/s, sigma_w=0.2 rad/s).</span>
            </div>
            <div class="flex items-start gap-3">
                <span class="text-amber-400 font-bold shrink-0">2.</span>
                <span><strong class="text-amber-400">Simulate:</strong> Forward-propagate each U_k through the robot motion model for T=56 timesteps at dt=0.05s (2.8s horizon). Produces K candidate trajectories.</span>
            </div>
            <div class="flex items-start gap-3">
                <span class="text-emerald-400 font-bold shrink-0">3.</span>
                <span><strong class="text-emerald-400">Score:</strong> Evaluate each trajectory via plugin critic functions. Collision critic: cost = infinity for lethal cells. Path-following critic: integral of cross-track error. Goal critic: distance to goal at final step.</span>
            </div>
            <div class="flex items-start gap-3">
                <span class="text-purple-400 font-bold shrink-0">4.</span>
                <span><strong class="text-purple-400">Aggregate:</strong> Compute softmax weights: w_k = exp(-S_k / lambda). Optimal control: U* = sum_k(w_k * U_k). Lambda (temperature) trades off selectiveness.</span>
            </div>
            <div class="flex items-start gap-3">
                <span class="text-rose-400 font-bold shrink-0">5.</span>
                <span><strong class="text-rose-400">Execute:</strong> Apply U*[0] (first control command). Shift sequence: U*[1:T] becomes warm-start for next iteration. Repeat at 50 Hz.</span>
            </div>
        </div>
    </div>

    <div class="math-block">
        MPPI Information-Theoretic Optimality:<br><br>
        J(U) = phi(x_T) + sum_{t=0}^{T-1} [ L(x_t, u_t) + (lambda/2) * u_t^T * Sigma^-1 * u_t ]<br><br>
        Optimal control update:<br>
        U* = E_P[U * exp(-J(U)/lambda)] / E_P[exp(-J(U)/lambda)]<br><br>
        Softmax weight:  w_k = exp( -S_k / lambda )<br>
        where S_k = sum of all critic costs along trajectory k<br>
        lambda (temperature) = 0.3: lower = more selective (winner-take-all)<br><br>
        Runs at 50-100 Hz on a modern i5 CPU using SIMD-vectorized trajectory rollouts.
    </div>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">MPPI Critic Functions (nav2)</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">ObstaclesCritic</strong>
                <p class="text-slate-400">Penalizes trajectories that approach or enter obstacle cells. Applies exponentially increasing cost near costmap inflation zone. Weight: 10.0. Critical weight: infinity (hard constraint for lethal cells).</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-1">PathFollowCritic</strong>
                <p class="text-slate-400">Penalizes lateral deviation from the global path. Weight: 5.0. Threshold: 0.5m. Beyond threshold: full penalty applied. Keeps the drone tracking the planned route.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-1">GoalCritic</strong>
                <p class="text-slate-400">Rewards trajectories that bring the robot closer to the goal. Weight: 5.0. Applied as terminal cost at final timestep. Ensures the robot doesn't loop or stagnate near goal.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-purple-400 block mb-1">PathAngleCritic</strong>
                <p class="text-slate-400">Penalizes large angular deviations from the path tangent direction. Weight: 2.0. Prevents the robot from driving backward along the path or making excessive heading changes.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-rose-400 block mb-1">VelocityCritic</strong>
                <p class="text-slate-400">Rewards higher forward velocity (progress). Weight: 1.0. Prevents the robot from slowing excessively when not near obstacles. Balances speed vs. safety via relative weights.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-teal-400 block mb-1">TwirlingCritic</strong>
                <p class="text-slate-400">Penalizes excessive angular velocity (spinning in place). Weight: 10.0. Critical for holonomic robots that can drift into spinning behaviors. Keeps yaw changes smooth and purposeful.</p>
            </div>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            YAML: nav2 MPPI controller configuration (quadrotor tuning)
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-bash">controller_server:
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
        </div>
    </div>

    <h3>13.8 SE(3) Trajectory Generation — Minimum Snap</h3>
    <p>Once waypoints are computed, the drone cannot simply jump between them. It must follow a trajectory that is <strong>dynamically feasible</strong> — respecting its mass, moment of inertia, and maximum rotor thrust. For quadrotors, the key insight from Mellinger &amp; Kumar (2011) is that the rotor force is the 4th derivative of position, called <strong>snap</strong>. Minimizing snap minimizes the required rotor force variation, which means smoother flight with lower vibration and lower battery consumption.</p>

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

    <p>The standard ROS library for this is <strong>ETHZ-ASL mav_trajectory_generation</strong>. It handles multi-segment trajectories with user-specified derivative orders to minimize (snap = 4, jerk = 3, acceleration = 2). Output is <code>trajectory_msgs/MultiDOFJointTrajectory</code> for the flight controller.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            C++: Minimum snap trajectory with mav_trajectory_generation
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-cpp">#include &lt;mav_trajectory_generation/polynomial_optimization_linear.h&gt;
#include &lt;mav_trajectory_generation/trajectory.h&gt;

mav_trajectory_generation::Vertex::Vector vertices;
const int D = 3;
const int derivative_to_minimize = mav_trajectory_generation::derivative_order::SNAP;

mav_trajectory_generation::Vertex start(D), middle(D), end(D);
start.makeStartOrEnd(Eigen::Vector3d(0, 0, 2), derivative_to_minimize);
middle.addConstraint(
    mav_trajectory_generation::derivative_order::POSITION,
    Eigen::Vector3d(5, 5, 3));
end.makeStartOrEnd(Eigen::Vector3d(10, 0, 2), derivative_to_minimize);

vertices = {start, middle, end};

const double v_max = 2.0, a_max = 2.0;
std::vector&lt;double&gt; segment_times =
    mav_trajectory_generation::estimateSegmentTimes(vertices, v_max, a_max);

mav_trajectory_generation::PolynomialOptimization&lt;8&gt; opt(D);
opt.setupFromVertices(vertices, segment_times, derivative_to_minimize);
opt.solveLinear();

mav_trajectory_generation::Trajectory trajectory;
opt.getTrajectory(&amp;trajectory);</code></pre>
        </div>
    </div>

    <h3>13.9 Gradient-Based Trajectory Optimization: EGO-Planner</h3>
    <p>Traditional gradient-based trajectory optimization requires a precomputed <strong>Euclidean Signed Distance Field (ESDF)</strong> — a 3D grid storing the distance and gradient to the nearest obstacle at every cell. Building and updating this field is expensive: for a 100m x 100m x 20m volume at 0.1m resolution, it requires maintaining ~200M cells. <strong>EGO-Planner</strong> (HKUST, 2021) eliminates this requirement entirely.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">EGO-Planner: ESDF-Free Collision Penalty</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-2">Traditional ESDF Approach</strong>
                <p class="text-slate-400 mb-2">1. Maintain 3D distance field over full workspace.</p>
                <p class="text-slate-400 mb-2">2. Query ESDF for distance + gradient at every trajectory point.</p>
                <p class="text-slate-400 mb-2">3. Update ESDF continuously as new sensor data arrives.</p>
                <p class="text-rose-400">Cost: 10–100ms ESDF update per LiDAR scan. Memory: O(N^3).</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 block mb-2">EGO-Planner (ESDF-Free)</strong>
                <p class="text-slate-400 mb-2">1. Track only the trajectory itself — no global distance field.</p>
                <p class="text-slate-400 mb-2">2. When a trajectory segment enters an obstacle, compare it to a collision-free "guiding path" and compute gradient from that comparison.</p>
                <p class="text-slate-400 mb-2">3. Store only locally-relevant obstacle info (voxels intersecting current trajectory).</p>
                <p class="text-emerald-400">Cost: ~10x faster than ESDF-based. Enables 50+ Hz replanning.</p>
            </div>
        </div>
    </div>

    <p>The trajectory is represented as a <strong>uniform B-spline</strong>, which provides: (1) automatic smoothness (C2 continuity by construction), (2) local control (moving one control point affects only neighboring segments), (3) efficient derivative computation (velocity, acceleration, jerk as lower-order B-splines). The optimization penalty includes: collision avoidance, dynamic feasibility (velocity/acceleration limits), and temporal regularity (prevents time bunching).</p>

    <div class="math-block">
        EGO-Planner B-spline trajectory:  p(t) = sum_i N_{i,k}(t) * q_i<br>
        q_i = control points (decision variables)<br>
        N_{i,k}(t) = uniform B-spline basis functions of degree k (typically k=3)<br><br>
        Total cost:  J = J_collision + lambda_f * J_feasibility + lambda_t * J_time<br><br>
        J_collision: penalty when trajectory intersects obstacles<br>
                     gradient computed by comparing to nearest collision-free guiding path<br>
        J_feasibility: || max(||v||/v_max, 0) ||^2 + || max(||a||/a_max, 0) ||^2<br>
        J_time: penalty for uneven time allocation (prevents slow segments)<br><br>
        Solved via gradient descent (L-BFGS), typically 5-15 iterations to converge.
    </div>

    <p>EGO-Planner v2 (EGO-Swarm) extends the framework to swarm coordination by adding inter-drone repulsion terms. The planner is the core of several open-source aggressive flight systems at HKUST and Zhejiang University, achieving obstacle avoidance at 5+ m/s in cluttered forests.</p>

    <h3>13.10 Potential Field Method &amp; Local Minima</h3>
    <p>The potential field method computes a scalar field over the workspace: <strong>U(q) = U_att(q) + U_rep(q)</strong>. The attractive potential pulls the drone toward the goal (typically parabolic: 0.5 * k_att * ||q - q_goal||^2). The repulsive potential pushes it away from obstacles. The drone follows the negative gradient of this field.</p>

    <div class="math-block">
        F_att(q) = -grad U_att = -k_att * (q - q_goal)<br>
        F_rep(q) = k_rep * (1/d(q) - 1/d_0) * (1/d(q)^2) * grad d(q)   if d(q) &lt; d_0<br>
        F_rep(q) = 0                                                       if d(q) >= d_0<br><br>
        d(q) = distance from drone pose q to nearest obstacle<br>
        d_0  = influence radius of obstacle repulsion (e.g., 2.0m)
    </div>

    <p>The critical failure mode is <strong>local minima</strong>: configurations where F_att and F_rep cancel exactly. Standard mitigation strategies: random walk injection (perturb velocity when stuck for N seconds), backtracking (detect oscillation, reverse and attempt detour), and navigation functions (theoretically correct fields with provably no local minima — Rimon &amp; Koditschek, 1992).</p>

    <h3>13.11 nav2 Core Architecture</h3>
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
                    <p class="text-slate-400 mt-1">Hosts the global planner plugin. Choices: NavFn (A*/Dijkstra), SMAC Hybrid-A*, SMAC Lattice, or custom. Computes path on request via compute_path_to_pose action. Runs once per goal or on replan trigger.</p>
                </div>
            </div>
            <div class="space-y-3">
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-amber-400">controller_server</strong>
                    <p class="text-slate-400 mt-1">Hosts the local planner plugin. Choices: DWA, TEB, MPPI, RPP (Regulated Pure Pursuit). Called by bt_navigator's follow_path action. Publishes cmd_vel at 20–50 Hz. Triggers recovery on timeout.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-purple-400">behavior_server</strong>
                    <p class="text-slate-400 mt-1">Executes recovery behaviors: Spin, BackUp, Wait, ClearCostmapService. When controller is stuck, bt_navigator invokes a recovery sequence. Prevents deadlocking in local minima.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Python: Sending a NavigateToPose goal to nav2 bt_navigator
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-python">import rclpy
from rclpy.action import ActionClient
from nav2_msgs.action import NavigateToPose
from geometry_msgs.msg import PoseStamped

class DroneNavClient:
    def __init__(self, node):
        self._client = ActionClient(node, NavigateToPose, 'navigate_to_pose')

    def send_goal(self, x, y, z):
        goal = NavigateToPose.Goal()
        goal.pose = PoseStamped()
        goal.pose.header.frame_id = 'map'
        goal.pose.pose.position.x = x
        goal.pose.pose.position.y = y
        goal.pose.pose.position.z = z         # 3D target altitude
        goal.pose.pose.orientation.w = 1.0   # no yaw preference

        self._client.wait_for_server()
        future = self._client.send_goal_async(
            goal,
            feedback_callback=self._feedback_cb
        )
        return future

    def _feedback_cb(self, feedback_msg):
        dist = feedback_msg.feedback.distance_remaining
        print(f"Distance to goal: {dist:.2f}m")</code></pre>
        </div>
    </div>

    <h3>13.12 Behavior Trees for Navigation</h3>
    <p><strong>BehaviorTree.CPP</strong> is the library that underpins nav2's mission logic. A Behavior Tree is a hierarchical structure of nodes that tick from root to leaves at a fixed rate (e.g., 10 Hz). Each node returns <code>SUCCESS</code>, <code>FAILURE</code>, or <code>RUNNING</code>. Control flow nodes determine how results propagate: a <strong>Sequence</strong> runs children left-to-right and fails immediately on any child failure. A <strong>Fallback</strong> (Selector) tries children in order, returning success on the first success. A <strong>Parallel</strong> node ticks all children simultaneously.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Common BT Node Types in nav2</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="space-y-2">
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-sky-400">Sequence (→)</strong>
                    <p class="text-slate-400 mt-1">Execute children in order. If any child returns FAILURE, the sequence fails immediately. Used for: "Compute path, THEN follow path, THEN report success."</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-amber-400">Fallback (?)</strong>
                    <p class="text-slate-400 mt-1">Try children in order; return first SUCCESS. Used for recovery: "Try FollowPath → if FAIL, Spin → if FAIL, ClearCostmap → if FAIL, WaitAndReplan."</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-emerald-400">ReactiveFallback</strong>
                    <p class="text-slate-400 mt-1">Like Fallback but re-ticks from first child every tick. Used to continuously monitor a condition (e.g., "isGoalUpdated?") and restart planning when it fires.</p>
                </div>
            </div>
            <div class="space-y-2">
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-purple-400">Action Nodes</strong>
                    <p class="text-slate-400 mt-1">Leaf nodes wrapping ROS 2 action clients: ComputePathToPose, FollowPath, Spin, BackUp, Wait, ClearCostmapAroundRobot. Return RUNNING while action is in progress.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-rose-400">Condition Nodes</strong>
                    <p class="text-slate-400 mt-1">Instant checks: GoalReached, IsStuck, GoalUpdated, isBatteryLow. Return SUCCESS or FAILURE immediately. Used as guards in Sequences and Fallbacks.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-teal-400">Decorator Nodes</strong>
                    <p class="text-slate-400 mt-1">Modify child behavior: RateController (tick child at fixed Hz), Repeat (retry N times), Inverter (flip result), DistanceController (tick child only when robot has moved &gt; D meters).</p>
                </div>
            </div>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            XML: nav2 default NavigateToPose Behavior Tree
        </div>
        <div class="p-4 overflow-x-auto">
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
        </div>
    </div>

    <h3>13.13 GPS-Denied Navigation: Visual-Inertial Odometry</h3>
    <p>When GPS is unavailable — indoors, underground, under dense canopy, or in GPS-jammed environments — the drone must estimate its position from onboard sensors alone. <strong>Visual-Inertial Odometry (VIO)</strong> fuses camera images and IMU measurements to produce 6-DOF pose estimates at 50–200 Hz. The IMU provides high-frequency angular rate and acceleration; the camera provides absolute scale-reference and prevents IMU drift. Together they are complementary: IMU handles fast motion, camera handles slow drift.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">VIO State Estimation Pipeline</h4>
        <div class="space-y-3 text-xs">
            <div class="flex items-center gap-3">
                <div class="bg-sky-900 border border-sky-500 rounded px-3 py-2 text-sky-300 text-center min-w-[140px]">
                    <strong>Stereo Camera</strong><br>
                    <span class="text-slate-400">640x480 @ 30 Hz</span>
                </div>
                <span class="text-slate-500">→</span>
                <div class="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-slate-300 min-w-[140px]">
                    <strong>Feature Tracking</strong><br>
                    <span class="text-slate-400">KLT / ORB / FAST+BRIEF</span>
                </div>
                <span class="text-slate-500">→</span>
                <div class="bg-amber-900 border border-amber-500 rounded px-3 py-2 text-amber-300 text-center min-w-[140px]">
                    <strong>Stereo Depth</strong><br>
                    <span class="text-slate-400">Up to 10m range</span>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <div class="bg-purple-900 border border-purple-500 rounded px-3 py-2 text-purple-300 text-center min-w-[140px]">
                    <strong>IMU</strong><br>
                    <span class="text-slate-400">200–400 Hz</span>
                </div>
                <span class="text-slate-500">→</span>
                <div class="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-slate-300 min-w-[140px]">
                    <strong>IMU Pre-integration</strong><br>
                    <span class="text-slate-400">Between keyframes</span>
                </div>
                <span class="text-slate-500">→</span>
                <div class="bg-emerald-900 border border-emerald-500 rounded px-3 py-2 text-emerald-300 text-center min-w-[140px]">
                    <strong>Factor Graph / EKF</strong><br>
                    <span class="text-slate-400">Nonlinear optimization</span>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <div class="text-slate-500 min-w-[140px]"></div>
                <div class="text-slate-500 min-w-[60px]"></div>
                <div class="text-slate-500 min-w-[140px]"></div>
                <span class="text-slate-500">→</span>
                <div class="bg-rose-900 border border-rose-500 rounded px-3 py-2 text-rose-300 text-center min-w-[140px]">
                    <strong>Pose Output</strong><br>
                    <span class="text-slate-400">50–200 Hz, &lt;2% drift</span>
                </div>
            </div>
        </div>
    </div>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">VIO Algorithm Comparison (2025 State-of-the-Art)</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">VINS-Mono / VINS-Fusion</strong>
                <p class="text-slate-400 mb-2">HKUST. Monocular or stereo + IMU. Sliding window nonlinear optimization via Ceres Solver. IMU pre-integration factor. Loop closure via DBoW2. Drift: ~1% of distance traveled. Runs on Jetson Nano at 20 Hz.</p>
                <p class="text-slate-500">Best for: outdoor GPS-denied, large-scale mapping.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-1">ORB-SLAM3</strong>
                <p class="text-slate-400 mb-2">Multi-map SLAM with monocular, stereo, RGB-D, and IMU modes. Strong loop closure via DBoW3. Initializes visual-inertial covariance carefully — sensitive to IMU calibration. Achieves cm-level precision on revisited maps. ROS 2 wrapper available.</p>
                <p class="text-slate-500">Best for: indoor structured environments with revisitation.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-1">OpenVINS</strong>
                <p class="text-slate-400 mb-2">UoDelaware. Multi-state constraint Kalman filter (MSCKF). Open-source, well-documented, ROS 2 native. Uses SLAM features for long-term landmarks. Highly tunable. Excellent for research. Accuracy comparable to VINS-Mono.</p>
                <p class="text-slate-500">Best for: research, custom hardware, ROS 2 integration.</p>
            </div>
        </div>
    </div>

    <div class="math-block">
        MSCKF (Multi-State Constraint Kalman Filter) - Core VIO Algorithm:<br><br>
        State vector: X = [IMU_state | camera_pose_1 | ... | camera_pose_N]<br>
        IMU_state = [position, velocity, orientation, gyro_bias, accel_bias]<br><br>
        IMU propagation (between camera frames):<br>
        p_{k+1} = p_k + v_k*dt + 0.5*(R_k*a_k - g)*dt^2<br>
        v_{k+1} = v_k + (R_k*a_k - g)*dt<br>
        R_{k+1} = R_k * Exp(omega_k * dt)<br><br>
        Camera measurement update:<br>
        When a feature is tracked across N camera poses:<br>
        Triangulate 3D position, compute reprojection residual over all poses.<br>
        EKF update: X += K * (z_meas - h(X))   [MSCKF "null space" trick eliminates feature position]<br><br>
        Typical performance: 1-2% drift rate / distance traveled.
        Loop closure reduces drift to &lt;0.1% on revisited maps.
    </div>

    <p>For PX4-based drones, VIO pose is published on <code>/mavros/odometry/out</code> and fused by PX4's EKF2. ArduPilot uses <code>SET_GPS_GLOBAL_ORIGIN</code> + <code>VISION_POSITION_ESTIMATE</code> MAVLink messages. The critical parameter is ensuring VIO and flight controller use the same coordinate frame — PX4 uses NED, ROS uses ENU (East-North-Up). The <code>mavros</code> package handles the transformation automatically.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Python (MAVSDK): Inject VIO pose into PX4 EKF for GPS-denied flight
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-python">import asyncio
from mavsdk import System
from mavsdk.mocap import PositionBody, Quaternion, VisionPositionEstimate

async def send_vio_pose(drone, x, y, z, qx, qy, qz, qw):
    """Inject VIO-estimated pose into PX4 EKF2 via VISION_POSITION_ESTIMATE."""
    vision_estimate = VisionPositionEstimate(
        time_usec=0,              # 0 = use system time
        position_body=PositionBody(x, y, z),
        angle_body=Quaternion(qw, qx, qy, qz),
        pose_covariance_matrix=[  # 6x6 upper diagonal, row-major
            0.01, 0, 0, 0, 0, 0,   # sigma_x^2
                  0.01, 0, 0, 0, 0, # sigma_y^2
                        0.01, 0, 0, 0,
                              0.001, 0, 0,  # sigma_roll^2
                                    0.001, 0,
                                          0.001
        ],
        reset_counter=0
    )
    await drone.mocap.set_vision_position_estimate(vision_estimate)

async def main():
    drone = System()
    await drone.connect(system_address="udp://:14540")
    # Feed VIO estimates at 30+ Hz in production
    while True:
        x, y, z, qx, qy, qz, qw = get_vio_estimate()   # from VINS/ORB-SLAM3
        await send_vio_pose(drone, x, y, z, qx, qy, qz, qw)
        await asyncio.sleep(0.033)  # 30 Hz</code></pre>
        </div>
    </div>

    <h3>13.14 SLAM for Drone Navigation</h3>
    <p>Simultaneous Localization And Mapping (SLAM) solves a chicken-and-egg problem: to build a map you need to know where you are, but to know where you are you need a map. Modern SLAM systems solve this jointly via probabilistic state estimation. For drones, the two dominant modalities are <strong>LiDAR-Inertial SLAM</strong> (accurate metric maps, works in dark/textureless environments) and <strong>Visual SLAM</strong> (low cost, rich semantic information).</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">SLAM System Comparison for Drones (2025)</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-slate-300 border-collapse">
                <thead>
                    <tr class="border-b border-slate-600">
                        <th class="text-left p-2 text-sky-400">System</th>
                        <th class="text-left p-2 text-sky-400">Modality</th>
                        <th class="text-left p-2 text-sky-400">Map Type</th>
                        <th class="text-left p-2 text-sky-400">Frequency</th>
                        <th class="text-left p-2 text-sky-400">Key Strength</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 font-mono text-amber-400">FAST-LIO2</td>
                        <td class="p-2">LiDAR + IMU</td>
                        <td class="p-2">Point cloud (ikd-Tree)</td>
                        <td class="p-2">100 Hz</td>
                        <td class="p-2">Real-time, no features, 1000°/s rotation</td>
                    </tr>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 font-mono text-amber-400">FAST-LIVO2</td>
                        <td class="p-2">LiDAR + IMU + Camera</td>
                        <td class="p-2">Colored point cloud</td>
                        <td class="p-2">100 Hz</td>
                        <td class="p-2">Pixel-level precision, structure-less envs</td>
                    </tr>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 font-mono text-amber-400">LIO-SAM</td>
                        <td class="p-2">LiDAR + IMU + GPS</td>
                        <td class="p-2">OctoMap / PCD</td>
                        <td class="p-2">10 Hz (scan)</td>
                        <td class="p-2">Loop closure, large-scale outdoor</td>
                    </tr>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 font-mono text-amber-400">ORB-SLAM3</td>
                        <td class="p-2">Camera (+ IMU opt.)</td>
                        <td class="p-2">Sparse landmarks</td>
                        <td class="p-2">30 Hz (cam)</td>
                        <td class="p-2">Multi-map, strong loop closure</td>
                    </tr>
                    <tr class="hover:bg-slate-800/30">
                        <td class="p-2 font-mono text-amber-400">RTAB-Map</td>
                        <td class="p-2">RGB-D / Stereo / LiDAR</td>
                        <td class="p-2">Dense 3D, OctoMap</td>
                        <td class="p-2">5–10 Hz</td>
                        <td class="p-2">Dense mapping, ROS 2 native, nav2 compatible</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <h4>FAST-LIO2: Direct LiDAR-Inertial Odometry</h4>
    <p>FAST-LIO2 (HKU-MARS, 2022) is the state-of-the-art for real-time LiDAR-inertial SLAM on drones. It uses a tightly-coupled iterated Extended Kalman Filter (IEKF) that directly registers raw LiDAR points to the map — no feature extraction step. This eliminates the accuracy loss from feature selection and makes it robust to structureless environments (open fields, tunnels). The map is maintained in an <strong>ikd-Tree</strong> (incremental k-d Tree) that supports dynamic insertions, deletions, and re-balancing without rebuild, enabling the 100 Hz operation rate. FAST-LIVO2 (2024) extends this with visual observations for pixel-level mapping precision.</p>

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

    <h4>OctoMap: The Standard 3D Map Format</h4>
    <p>OctoMap represents 3D occupancy as an octree — a recursive spatial subdivision where each node represents a 3D volume and is either free, occupied, or unknown. Each cell stores the log-odds probability of occupancy: <code>L(n) = L(n_prev) + L_meas</code>, where L_meas = log(p_occ / (1-p_occ)). Cells are clamped to [L_min, L_max] to remain responsive to changes. Typical resolution: 0.1m voxels. OctoMap files (.bt) are the standard exchange format for nav2 map server and most drone planners. For very large maps (km scale), newer formats like OpenVDB provide better compression and query performance.</p>

    <h3>13.15 Safety-Critical Control: Control Barrier Functions</h3>
    <p>Classical navigation stacks provide probabilistic safety (unlikely to hit obstacles) but no hard guarantees. <strong>Control Barrier Functions (CBFs)</strong> provide mathematically provable safety constraints that are enforced in real-time by augmenting any existing controller with a minimal correction via Quadratic Program (QP). The key insight: rather than planning around obstacles, CBFs modify the control input u to guarantee the system state never leaves a defined safe set S.</p>

    <div class="math-block">
        Safe set definition:  S = {x : h(x) >= 0}   (e.g., h(x) = ||p_drone - p_obs|| - r_safe)<br><br>
        CBF condition (forward invariance of S):<br>
        dh/dt >= -alpha(h(x))   where alpha is a class-K function (e.g., alpha(h) = gamma*h)<br><br>
        Expanding:  (dh/dx)*f(x) + (dh/dx)*g(x)*u >= -gamma * h(x)<br><br>
        Safety filter QP (solved at control rate, e.g., 100 Hz):<br>
        min_{u}  ||u - u_nom||^2          [minimal deviation from nominal controller]<br>
        s.t.     (dh/dx)*g(x)*u >= -gamma*h(x) - (dh/dx)*f(x)   [CBF constraint]<br>
                 u_min &lt;= u &lt;= u_max       [actuator limits]<br><br>
        Result: u* satisfies safety constraint with ZERO probability of set-invariance violation<br>
        Solve time: &lt;0.1ms (small QP). Compatible with any existing planner.
    </div>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">CBF Applications in Drone Systems</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Static Obstacle Avoidance</strong>
                <p class="text-slate-400">h(x) = ||p - p_obs|| - r_safe. Gradient dh/dx = (p - p_obs)/||p - p_obs||. Provides provable collision-free guarantee even if the global planner computes a bad path. CBF acts as a last-resort safety layer.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-1">Dynamic Obstacles (Collision Cone CBF)</strong>
                <p class="text-slate-400">h(x, x_obs) defined using relative velocity cone geometry. Avoids the cone of velocities that would lead to collision within time horizon T. Validated on Crazyflie 2.1 hardware against moving obstacles.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-1">Multi-Agent Drone Swarms</strong>
                <p class="text-slate-400">Each drone maintains CBF constraints for all neighbors within communication range. Distributed QP formulation: each agent solves its own QP locally. Proven to work in swarms of 10+ drones without centralized coordination.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-purple-400 block mb-1">Geofencing / Keep-Out Zones</strong>
                <p class="text-slate-400">h(x) = boundary function (e.g., polygon edge distance). CBF enforces that the drone never crosses a regulatory or operational boundary, even under wind disturbance. Composable: multiple CBF constraints can be combined in a single QP via AND logic.</p>
            </div>
        </div>
    </div>

    <h3>13.16 Multi-Agent Path Finding (MAPF)</h3>
    <p>When multiple drones must navigate simultaneously in shared airspace, individual path planners create collisions and deadlocks. Multi-Agent Path Finding (MAPF) computes collision-free paths for all agents simultaneously. The two dominant paradigms are <strong>centralized planning</strong> (optimal but computationally expensive) and <strong>distributed reactive avoidance</strong> (scalable but suboptimal).</p>

    <h4>Conflict-Based Search (CBS)</h4>
    <p>CBS is a two-level algorithm that produces <em>optimal</em> multi-agent paths. The <strong>high level</strong> searches a constraint tree (CT): the root has no constraints; when a conflict is detected (two agents at the same cell at the same time), the CT branches into two nodes — one constraining agent A, one constraining agent B. The <strong>low level</strong> re-plans a single agent's path subject to its current constraints (using A* with time-expanded grid). CBS is optimal and complete but exponential in the number of agents in worst case. In practice, it scales to ~50 agents for typical warehouse environments.</p>

    <div class="math-block">
        CBS High Level:<br>
        OPEN = {root node (no constraints, each agent on shortest path)}<br>
        while OPEN not empty:<br>
            N = lowest cost node in OPEN<br>
            Validate all agent paths for conflicts C = (a_i, a_j, v, t)  [agents i,j at vertex v at time t]<br>
            if no conflicts: return N.solution  (OPTIMAL)<br>
            Branch: N1 adds constraint (a_i, v, t),  N2 adds constraint (a_j, v, t)<br>
            Replan paths for constrained agents, update cost, add to OPEN<br><br>
        CBS Low Level: Standard A* on time-expanded graph with forbidden (vertex, time) pairs.<br><br>
        SL-CBS (2024 extension for UAV swarms): Integrates state lattice for continuous dynamics,<br>
        adds kinodynamic constraints (acceleration limits) directly into the low-level planner.
    </div>

    <h4>ORCA — Optimal Reciprocal Collision Avoidance</h4>
    <p>ORCA is a fully distributed, reactive collision avoidance algorithm that runs on each drone independently with no communication required (beyond position broadcasts). Each agent models neighbors as discs moving at their current velocities. For each neighbor, ORCA computes a <strong>velocity obstacle</strong> — the set of velocities that would lead to collision within time horizon tau. The agent then selects the nearest velocity to its preferred velocity (toward goal) that lies outside all velocity obstacles. ORCA is O(n) per agent per tick and scales to hundreds of drones, but is not globally optimal — agents may take longer paths and can deadlock in symmetrical configurations.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">MAPF Algorithm Selection Guide</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">CBS / SL-CBS</strong>
                <p class="text-slate-400">Use when: centralized planner available, &lt;50 drones, optimal paths required (package delivery, precision agriculture). Re-plan offline when new drones enter the airspace.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-1">ORCA / RVO2</strong>
                <p class="text-slate-400">Use when: 50–1000 drones, no centralized planner, simple collision avoidance in open spaces. Standard in commercial drone light shows (VeraTech, Skybrush). Fails in narrow corridors — supplement with CBS for bottlenecks.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-1">EGO-Swarm</strong>
                <p class="text-slate-400">Use when: fast, aggressive multi-drone flight in cluttered environments. Fully distributed gradient-based planning with inter-agent repulsion. Validated at 5+ m/s in forests. Best for research swarms.</p>
            </div>
        </div>
    </div>

    <h3>13.17 Learning-Based Navigation</h3>
    <p>Classical planners require accurate maps and explicit obstacle representations. Learning-based methods — particularly Deep Reinforcement Learning (DRL) — learn navigation policies end-to-end from sensor inputs, without explicit map building. The agent receives raw sensor observations (depth image, IMU, goal vector) and outputs control commands, learning through trial-and-error in simulation.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">RL Algorithms for Drone Navigation (2025)</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">PPO (Proximal Policy Optimization)</strong>
                <p class="text-slate-400 mb-2">On-policy actor-critic. Stable training via clipped objective: L = min(r*A, clip(r, 1-eps, 1+eps)*A). Preferred for discrete action spaces and structured environments. 92% collision-free success rate in standard benchmarks. Converges in ~200 episodes with good reward shaping.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-1">SAC (Soft Actor-Critic)</strong>
                <p class="text-slate-400 mb-2">Off-policy, maximum entropy RL. Adds entropy regularization: J(pi) = sum E[r + alpha*H(pi)]. Superior in continuous action spaces (velocity commands). Converges in ~32 episodes on hovering tasks. Better uncertainty handling for dynamic obstacles.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-1">TD3 (Twin Delayed DDPG)</strong>
                <p class="text-slate-400 mb-2">Off-policy, addresses overestimation bias via two Q-networks. Delayed actor updates (every 2 critic updates). Best performance in environments with many moving obstacles where continuous control precision matters.</p>
            </div>
        </div>
    </div>

    <h4>Sim-to-Real Transfer</h4>
    <p>The central challenge in learning-based drone navigation is the <strong>reality gap</strong>: policies trained in simulation fail in the real world due to differences in aerodynamics, sensor noise, timing jitter, and visual appearance. Key mitigation strategies:</p>
    <ul class="space-y-2 text-sm">
        <li><strong>Domain Randomization:</strong> Randomly vary simulation parameters (mass, drag, motor response time, sensor noise, texture maps) during training. Forces the policy to learn robust behaviors that work across a distribution of conditions.</li>
        <li><strong>Privileged Learning:</strong> Train a "teacher" policy with full state access (perfect positions of all obstacles), then distill into a "student" policy that uses only real sensor observations. Reduces the sample complexity of learning from raw sensors.</li>
        <li><strong>Real-to-Sim Adaptation:</strong> Fine-tune the simulator's dynamics model using real flight data (system identification). Reduces gap by making the simulation more accurate rather than making the policy more robust.</li>
        <li><strong>AgilePilot (2025):</strong> Recent work combines DRL with real-time object detection (YOLO) for target tracking in dynamic environments. The DRL policy handles trajectory generation while CV handles obstacle identification — a hybrid approach showing 85%+ sim-to-real transfer.</li>
    </ul>

    <h4>Limitations vs. Classical Methods</h4>
    <p>RL policies are black boxes — they provide no guarantees of safety or optimality. They can fail catastrophically in out-of-distribution scenarios. For safety-critical drone operations, RL is best used as a <strong>motion primitive library</strong> or a <strong>heuristic planner</strong> that is supervised by a CBF safety filter, rather than as a standalone controller. Pure RL for full autonomous flight remains a research-stage approach as of 2025.</p>

    <h3>13.18 Energy-Aware Path Planning</h3>
    <p>Quadrotor power consumption is dominated by hover thrust, which scales with rotor thrust squared divided by rotor disk area. A drone's endurance is typically 20–40 minutes; energy-aware planning can extend mission range by 15–30% by optimizing altitude, speed, and path shape. Energy planning is especially critical for delivery drones and long-range inspection missions.</p>

    <div class="math-block">
        Quadrotor power model (simplified):<br>
        P(v) = T * v_tip + P_profile + P_induced + P_parasite<br><br>
        Hover power:    P_hover = (mg)^(3/2) / sqrt(2 * rho * A_disk)<br>
        m=1.5 kg, A_disk=0.1 m^2 (4 rotors), rho=1.225 kg/m^3: P_hover ≈ 150W<br><br>
        Forward flight power (simplified):<br>
        P(v) = P_hover + 0.5*rho*C_D*A_front*v^3 - T*v*sin(theta_pitch)<br><br>
        Energy-optimal cruise speed: v_opt = argmin P(v)/v<br>
        Typically 8-12 m/s for most 1-3 kg quadrotors.<br><br>
        Wind effect:  P_headwind(v) = P(v + v_wind)   [significant: 5 m/s headwind = +40% power]
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Energy-Aware Planning Strategies</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Wind-Aware Routing</strong>
                <p class="text-slate-400">Incorporate wind forecasts (from weather APIs or onboard anemometers) as a position-dependent energy cost modifier. A* or D* Lite with energy as the edge weight naturally finds minimum-energy paths that exploit tailwinds. A 5 m/s tailwind reduces energy by ~25% vs. same speed headwind.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-1">Altitude Optimization</strong>
                <p class="text-slate-400">Air density decreases with altitude: rho(h) = rho_0 * exp(-h/H_scale). Higher altitude = lower density = higher required thrust for same lift. Fly as low as safely possible in headwind conditions. Fly high in tailwind (faster winds typically at altitude).</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-1">Speed-Range Trade-off</strong>
                <p class="text-slate-400">Flight time = Battery_Wh / P(v). Range = v * Flight_time = v * Battery_Wh / P(v). Maximize range by flying at v_opt (energy-per-meter minimum), not maximum speed. For delivery missions: MINLP formulation with payload, stop count, and wind as constraints.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-purple-400 block mb-1">Coverage Path Planning</strong>
                <p class="text-slate-400">For survey missions (area coverage), lawnmower pattern energy is minimized by aligning rows with prevailing wind direction. Multi-UAV coverage uses Travelling Salesman Problem (TSP) formulation to minimize total energy while ensuring full coverage. Battery swap stations extend mission range indefinitely.</p>
            </div>
        </div>
    </div>

    <h3>13.19 Mission Planning with MAVSDK</h3>
    <p><strong>MAVSDK</strong> is the modern, actively maintained SDK for commanding PX4-based drones via MAVLink. It replaces DroneKit (last released 2017, ArduPilot-focused) with a clean async API supporting C++, Python, Swift, and Kotlin. MAVSDK v3.5 (2025) adds gRPC streaming for low-latency telemetry and is the recommended approach for PX4 companion computer applications.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Python (MAVSDK): Autonomous waypoint mission with takeoff, survey, return
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-python">import asyncio
from mavsdk import System
from mavsdk.mission import MissionItem, MissionPlan

async def run_survey_mission():
    drone = System()
    await drone.connect(system_address="udp://:14540")

    print("Waiting for drone to connect...")
    async for state in drone.core.connection_state():
        if state.is_connected:
            break

    # Define survey waypoints
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
            camera_photo_interval_s=2.0  # 1 photo per 2s
        ),
        # ... more waypoints
    ]

    mission_plan = MissionPlan(mission_items)

    print("Uploading mission...")
    await drone.mission.upload_mission(mission_plan)

    print("Arming and taking off...")
    await drone.action.arm()
    await drone.action.takeoff()
    await asyncio.sleep(5)

    print("Starting mission...")
    await drone.mission.start_mission()

    # Monitor progress
    async for mission_progress in drone.mission.mission_progress():
        print(f"Mission item {mission_progress.current}/{mission_progress.total}")
        if mission_progress.current == mission_progress.total:
            print("Mission complete — returning to launch")
            await drone.action.return_to_launch()
            break</code></pre>
        </div>
    </div>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">MAVSDK vs. DroneKit vs. pymavlink (2025)</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-slate-300 border-collapse">
                <thead>
                    <tr class="border-b border-slate-600">
                        <th class="text-left p-2 text-sky-400">Feature</th>
                        <th class="text-left p-2 text-sky-400">MAVSDK</th>
                        <th class="text-left p-2 text-sky-400">DroneKit</th>
                        <th class="text-left p-2 text-sky-400">pymavlink</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-slate-800">
                        <td class="p-2">Primary FC</td>
                        <td class="p-2 text-emerald-400">PX4 (ArduPilot partial)</td>
                        <td class="p-2 text-amber-400">ArduPilot</td>
                        <td class="p-2">Both</td>
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="p-2">Maintenance</td>
                        <td class="p-2 text-emerald-400">Active (v3.5, 2025)</td>
                        <td class="p-2 text-rose-400">Unmaintained (2017)</td>
                        <td class="p-2 text-emerald-400">Active</td>
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="p-2">API Style</td>
                        <td class="p-2">Async/await, gRPC</td>
                        <td class="p-2">Sync + callbacks</td>
                        <td class="p-2">Low-level MAVLink</td>
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="p-2">Languages</td>
                        <td class="p-2">C++, Python, Swift, Kotlin</td>
                        <td class="p-2">Python only</td>
                        <td class="p-2">Python, C</td>
                    </tr>
                    <tr class="border-b border-slate-800">
                        <td class="p-2">Ease of Use</td>
                        <td class="p-2 text-emerald-400">High</td>
                        <td class="p-2">Medium</td>
                        <td class="p-2 text-amber-400">Low (verbose)</td>
                    </tr>
                    <tr>
                        <td class="p-2">Use When</td>
                        <td class="p-2">PX4, new projects</td>
                        <td class="p-2">Legacy ArduPilot</td>
                        <td class="p-2">Custom MAVLink, both FCs</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <h3>13.20 Practical Considerations for 3D Drone Path Planning</h3>

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
                    <p class="text-slate-400 text-xs">The obstacle layer in nav2 has a <code>decay_time</code> parameter (typically 5–10s). Fast-moving obstacles (pedestrians, other drones) require shorter decay. Combine with a separate dynamic obstacle tracker publishing to a /people or /obstacles topic, which feeds a dedicated obstacle layer plugin.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-emerald-400 text-xs uppercase block mb-1">Replanning Frequency</strong>
                    <p class="text-slate-400 text-xs">Global replanning at 1–2 Hz. Triggered by: (a) new obstacle intersecting current global path, (b) localization uncertainty exceeding threshold, (c) goal changed. Cache the last valid path and only invalidate via a path-collision-check at 5 Hz. Use D* Lite instead of A* for dynamic environments — 10–100x faster incremental updates.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-purple-400 text-xs uppercase block mb-1">Coordinate Frames</strong>
                    <p class="text-slate-400 text-xs">ROS uses ENU (East-North-Up, x=East, y=North, z=Up). PX4 uses NED (North-East-Down, x=North, y=East, z=Down). MAVROS converts automatically, but raw MAVLink users must apply: x_NED = y_ENU, y_NED = x_ENU, z_NED = -z_ENU. Geoid vs. ellipsoid altitude: GPS altitude is ellipsoidal (WGS84); barometric altitude is geoid (MSL). Difference is up to 100m depending on location.</p>
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
                    <p class="text-slate-400 text-xs">Three mandatory changes from default: (1) Replace 2D costmap with voxel grid layer using spatio_temporal_voxel_layer; (2) Set rolling_window: true, remove floor inflation layer; (3) Set min_turning_radius: 0.0 for holonomic quadrotor in TEB or use Omni model in MPPI.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-amber-400 text-xs uppercase block mb-1">Time-Optimal vs. Energy-Optimal</strong>
                    <p class="text-slate-400 text-xs">Time-optimal trajectory = fly at max velocity, minimize snap for motor feasibility. Energy-optimal = fly at ~8–12 m/s (power per meter minimum), align with wind, minimize altitude changes. For time-critical ops (SAR, package delivery SLAs): time-optimal. For long-endurance survey/inspection: energy-optimal. The two objectives diverge by 20–40% in battery life on typical missions.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mt-6">
        <h4 class="mt-0 border-none text-white">Navigation Stack Selection Matrix</h4>
        <p class="text-slate-400 text-xs mb-4">Use this matrix to select the appropriate algorithm combination for your operational scenario.</p>
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-slate-300 border-collapse">
                <thead>
                    <tr class="border-b border-slate-600">
                        <th class="text-left p-2 text-sky-400">Scenario</th>
                        <th class="text-left p-2 text-sky-400">Global Planner</th>
                        <th class="text-left p-2 text-sky-400">Local Planner</th>
                        <th class="text-left p-2 text-sky-400">Localization</th>
                        <th class="text-left p-2 text-sky-400">Safety</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 text-amber-400">Indoor GPS-denied</td>
                        <td class="p-2">A* on OctoMap</td>
                        <td class="p-2">MPPI / TEB</td>
                        <td class="p-2">FAST-LIO2 + VINS</td>
                        <td class="p-2">CBF filter</td>
                    </tr>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 text-amber-400">Outdoor GPS + static map</td>
                        <td class="p-2">A* / SMAC Hybrid</td>
                        <td class="p-2">DWA / MPPI</td>
                        <td class="p-2">GPS + EKF2</td>
                        <td class="p-2">Geofence + CBF</td>
                    </tr>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 text-amber-400">Dynamic obstacle-rich</td>
                        <td class="p-2">D* Lite</td>
                        <td class="p-2">MPPI / EGO-Planner</td>
                        <td class="p-2">VIO + SLAM</td>
                        <td class="p-2">ORCA + CBF</td>
                    </tr>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 text-amber-400">Aggressive flight (&gt;5 m/s)</td>
                        <td class="p-2">RRT* / Fast-Planner</td>
                        <td class="p-2">EGO-Planner</td>
                        <td class="p-2">FAST-LIVO2</td>
                        <td class="p-2">Min-snap limits</td>
                    </tr>
                    <tr class="border-b border-slate-800 hover:bg-slate-800/30">
                        <td class="p-2 text-amber-400">Multi-drone (&lt;50 agents)</td>
                        <td class="p-2">CBS / SL-CBS</td>
                        <td class="p-2">ORCA local</td>
                        <td class="p-2">RTK-GPS per agent</td>
                        <td class="p-2">Swarm CBF</td>
                    </tr>
                    <tr class="hover:bg-slate-800/30">
                        <td class="p-2 text-amber-400">Energy-constrained survey</td>
                        <td class="p-2">Energy-weighted A*</td>
                        <td class="p-2">DWA (conservative)</td>
                        <td class="p-2">GPS + barometer</td>
                        <td class="p-2">Battery RTL trigger</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
`;
