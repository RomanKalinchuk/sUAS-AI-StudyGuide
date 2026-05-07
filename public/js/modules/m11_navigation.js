export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 13</span>
    <h2>Path Planning & Autonomous Navigation</h2>
    <p>Autonomous navigation is not a single algorithm — it is a layered architecture where each tier has a distinct time horizon and problem scope. Global planners compute optimal paths over known maps. Local planners react to real-time sensor data. Trajectory generators produce physically realizable motion for the quadrotor's dynamics. Getting all three tiers to interoperate correctly is the central engineering challenge.</p>

    <h3>13.1 The Navigation Stack Architecture</h3>
    <p>The navigation stack is organized into three concentric loops operating at different frequencies. Understanding the time scales prevents the most common integration bugs.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Navigation Stack Layer Diagram</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase text-xs tracking-widest block mb-2">Global Planner (1–2 Hz)</strong>
                <p class="text-slate-300 text-xs mb-1">Computes the optimal path from current pose A to goal pose B over a known static map.</p>
                <p class="text-slate-400 text-xs">Algorithms: A*, Dijkstra, RRT, RRT*. Input: occupancy grid or voxel map. Output: list of waypoints.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                <strong class="text-amber-400 uppercase text-xs tracking-widest block mb-2">Local Planner (10–20 Hz)</strong>
                <p class="text-slate-300 text-xs mb-1">Generates velocity commands that follow the global plan while avoiding obstacles detected live by sensors.</p>
                <p class="text-slate-400 text-xs">Algorithms: DWA, TEB. Input: local costmap (recent LiDAR/depth). Output: cmd_vel or trajectory segment.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase text-xs tracking-widest block mb-2">Flight Controller (400 Hz)</strong>
                <p class="text-slate-300 text-xs mb-1">Executes attitude and rate commands from the companion computer. Runs PID loops for stability.</p>
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
    <p>RRT* adds two operations after each new node is added to the tree. First, <strong>choosing a better parent</strong>: instead of connecting to the nearest node, it searches all nodes within a radius r (the near-neighbor radius) and picks the parent that minimizes the total cost from start. Second, <strong>rewiring</strong>: it checks if any existing node in the radius would have a lower cost if re-routed through the new node, and if so, changes the parent connection. This rewiring step is what makes RRT* asymptotically optimal — given infinite samples, the path converges to the global optimum. For 3D drone navigation, RRT* is strongly preferred over RRT because the jagged paths of vanilla RRT produce infeasible motor commands and are unsafe.</p>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">RRT* Key Parameters</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-1">Step Size (delta_q)</strong>
                <p class="text-slate-400">How far to extend toward the random sample. Smaller = smoother paths, more iterations. Typical: 0.5–1.0m for drone navigation. Too large = poor collision avoidance in tight spaces.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-1">Goal Bias (5–10%)</strong>
                <p class="text-slate-400">Instead of always sampling randomly, with probability p_goal the algorithm samples the goal directly. This dramatically reduces convergence time. Above 10%: tree becomes greedy and misses obstacle-free paths.</p>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-emerald-400 block mb-1">Near-Neighbor Radius (r)</strong>
                <p class="text-slate-400">Search radius for the rewiring step. Theoretically r = gamma * (log(n)/n)^(1/d) where d=3 and gamma is a constant. Practically: set to 2–3x the step size. Larger = better optimality, higher compute cost.</p>
            </div>
        </div>
    </div>

    <h3>13.4 Local Planning Algorithms</h3>

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
    <p>TEB represents the path as a sequence of robot poses with explicit timestamps: {(x_1,y_1,theta_1,t_1), ..., (x_n,y_n,theta_n,t_n)}. This is an "elastic band" because it is optimized iteratively. The optimization objective penalizes: deviation from the global plan, obstacle proximity, excessive acceleration, violation of the drone's minimum turning radius, and time. TEB handles <strong>kinodynamic constraints</strong> directly — you can specify max angular acceleration, max lateral velocity, and minimum clearance as hard constraints in the graph. ROS 2 package: <code>teb_local_planner</code>. TEB is computationally heavier than DWA but produces physically smoother trajectories and handles non-holonomic + differential-flat vehicles well.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            YAML: nav2 TEB local planner configuration excerpt
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

    <h3>13.5 nav2 — The ROS 2 Navigation Stack</h3>
    <p>nav2 is the production navigation framework for ROS 2 robots. Its architecture is fundamentally different from ROS 1's move_base: nav2 uses <strong>BehaviorTree.CPP</strong> to define mission logic, lifecycle-managed nodes for clean startup/shutdown sequencing, and an action server interface for external mission commanding.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">nav2 Core Node Architecture</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="space-y-3">
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-sky-400">bt_navigator</strong>
                    <p class="text-slate-400 mt-1">The top-level coordinator. Accepts NavigateToPose or NavigateThroughPoses actions from a mission manager. Executes a Behavior Tree (XML file) that calls planner_server and controller_server. Ships with default BT: ComputePathToPose → FollowPath → RecoveryFallback.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-emerald-400">planner_server</strong>
                    <p class="text-slate-400 mt-1">Hosts the global planner plugin (NavFn/Dijkstra, A*, SMAC Lattice Planner, or custom). Computes a path from current pose to goal. Runs on request from bt_navigator via compute_path_to_pose action.</p>
                </div>
            </div>
            <div class="space-y-3">
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-amber-400">controller_server</strong>
                    <p class="text-slate-400 mt-1">Hosts the local planner plugin (DWA, TEB, MPPI). Called by bt_navigator's follow_path action. Publishes cmd_vel at 20 Hz. Triggers a recovery if goal is not reached within timeout.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-purple-400">behavior_server</strong>
                    <p class="text-slate-400 mt-1">Executes recovery behaviors: Spin, BackUp, Wait, ClearCostmapService. When the controller is stuck, bt_navigator invokes a recovery sequence (spin 360°, then replan). Prevents the drone from deadlocking in local minima.</p>
                </div>
            </div>
        </div>
    </div>

    <h4>Configuring nav2 for a 3D Drone</h4>
    <p>nav2's default configuration assumes a ground robot. For a quadrotor, three critical changes are mandatory:</p>
    <ul class="space-y-3">
        <li><strong>3D costmap:</strong> Replace the 2D occupancy grid with a voxel grid layer. Use <code>spatio_temporal_voxel_layer</code>. Set <code>z_voxels</code> to cover the drone's operating altitude range. The footprint becomes a cylinder, not a 2D polygon.</li>
        <li><strong>Disable ground assumptions:</strong> Set <code>rolling_window: true</code> so the costmap moves with the drone. Remove the inflation layer on the z=0 floor — the drone doesn't interact with the ground plane.</li>
        <li><strong>Holonomic controller:</strong> Quadrotors can move in any direction without rotating first. Set <code>min_turning_radius: 0.0</code> in TEB or configure DWA with <code>holonomic_robot: true</code>.</li>
    </ul>

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

    <h3>13.6 SE(3) Trajectory Generation — Minimum Snap</h3>
    <p>Once waypoints are computed, the drone cannot simply jump between them. It must follow a trajectory that is <strong>dynamically feasible</strong> — respecting its mass, moment of inertia, and maximum rotor thrust. For quadrotors, the key insight from Mellinger & Kumar (2011) is that the rotor force is the 4th derivative of position, called <strong>snap</strong>. Minimizing snap minimizes the required rotor force variation, which means smoother flight with lower vibration and lower battery consumption.</p>

    <div class="math-block">
        Position trajectory on segment k:<br>
        p_k(t) = sum_{i=0}^{7} c_{k,i} * t^i   (7th-order polynomial, 8 coefficients per axis)<br><br>
        Snap = d^4p/dt^4<br><br>
        Objective: minimize integral of ||snap||^2 over all segments<br>
        Subject to: continuity of position, velocity, acceleration at waypoints;<br>
                    start/end boundary conditions; optionally max velocity/accel constraints
    </div>

    <p>The optimization reduces to a Quadratic Program (QP): <strong>min x^T Q x</strong> subject to linear equality constraints. The QP is solved analytically using the block-diagonal structure of Q (Hessian of the squared snap integral). Each polynomial axis (X, Y, Z, Yaw) is solved independently.</p>

    <p>The standard ROS library for this is <strong>ETHZ-ASL mav_trajectory_generation</strong>. It handles multi-segment trajectories with user-specified derivative orders to minimize (snap = 4, jerk = 3, acceleration = 2). Output is <code>trajectory_msgs/MultiDOFJointTrajectory</code> for the flight controller.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-8">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            C++: Minimum snap trajectory with mav_trajectory_generation
        </div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-cpp">#include &lt;mav_trajectory_generation/polynomial_optimization_linear.h&gt;
#include &lt;mav_trajectory_generation/trajectory.h&gt;

// Build a list of vertices (waypoints) with constraints
mav_trajectory_generation::Vertex::Vector vertices;
const int D = 3;  // 3D space
const int derivative_to_minimize = mav_trajectory_generation::derivative_order::SNAP;

mav_trajectory_generation::Vertex start(D), middle(D), end(D);
start.makeStartOrEnd(Eigen::Vector3d(0, 0, 2), derivative_to_minimize);
middle.addConstraint(
    mav_trajectory_generation::derivative_order::POSITION,
    Eigen::Vector3d(5, 5, 3));   // intermediate waypoint, free velocity
end.makeStartOrEnd(Eigen::Vector3d(10, 0, 2), derivative_to_minimize);

vertices = {start, middle, end};

// Auto-scale segment times based on max velocity
const double v_max = 2.0, a_max = 2.0;
std::vector&lt;double&gt; segment_times =
    mav_trajectory_generation::estimateSegmentTimes(vertices, v_max, a_max);

// Solve the QP
mav_trajectory_generation::PolynomialOptimization&lt;8&gt; opt(D);
opt.setupFromVertices(vertices, segment_times, derivative_to_minimize);
opt.solveLinear();

mav_trajectory_generation::Trajectory trajectory;
opt.getTrajectory(&amp;trajectory);</code></pre>
        </div>
    </div>

    <h3>13.7 Potential Field Method & Local Minima</h3>
    <p>The potential field method computes a scalar field over the workspace: <strong>U(q) = U_att(q) + U_rep(q)</strong>. The attractive potential pulls the drone toward the goal (typically parabolic: 0.5 * k_att * ||q - q_goal||^2). The repulsive potential pushes it away from obstacles (inversely proportional to distance, active only within a threshold radius). The drone follows the negative gradient of this field.</p>

    <div class="math-block">
        F_att(q) = -grad U_att = -k_att * (q - q_goal)<br>
        F_rep(q) = k_rep * (1/d(q) - 1/d_0) * (1/d(q)^2) * grad d(q)   if d(q) &lt; d_0<br>
        F_rep(q) = 0                                                       if d(q) >= d_0<br><br>
        d(q) = distance from drone pose q to nearest obstacle<br>
        d_0  = influence radius of obstacle repulsion (e.g., 2.0m)
    </div>

    <p>The critical failure mode is <strong>local minima</strong>: configurations where F_att and F_rep cancel exactly, leaving the drone stuck at a non-goal position. This typically occurs in narrow U-shaped passages or saddle points between multiple obstacles. Standard mitigation strategies:</p>
    <ul class="space-y-2">
        <li><strong>Random walk injection:</strong> When the drone velocity drops below a threshold for N seconds, inject a random perturbation velocity to escape the saddle.</li>
        <li><strong>Backtracking:</strong> Detect oscillation (position variance below threshold), reverse along the incoming trajectory, and attempt a detour.</li>
        <li><strong>Navigation function:</strong> A theoretically correct potential field with no local minima (Rimon & Koditschek, 1992) — computationally expensive to construct in 3D.</li>
    </ul>

    <h3>13.8 Practical Considerations for 3D Drone Path Planning</h3>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">Production Engineering Checklist</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="space-y-3">
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-sky-400 text-xs uppercase block mb-1">Voxel Grid vs. Octree</strong>
                    <p class="text-slate-400 text-xs">Voxel grids (fixed resolution, dense array) offer O(1) lookup — critical for real-time collision checking. Octrees (OctoMap) are memory-efficient for large sparse environments but have O(log n) query time. Use OctoMap for map storage and building; convert to a local dense voxel grid for the planner's collision checker at runtime.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-amber-400 text-xs uppercase block mb-1">Moving Obstacle Handling</strong>
                    <p class="text-slate-400 text-xs">The obstacle layer in nav2 has a <code>decay_time</code> parameter: cells are marked at max cost when an obstacle is observed and linearly decay to free over decay_time seconds (typically 5–10s). Fast-moving obstacles (pedestrians, other drones) require a shorter decay. Combine with a separate dynamic obstacle tracker publishing to a /people or /obstacles topic, which feeds a dedicated obstacle layer plugin.</p>
                </div>
            </div>
            <div class="space-y-3">
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-emerald-400 text-xs uppercase block mb-1">Replanning Frequency</strong>
                    <p class="text-slate-400 text-xs">Global replanning at 1–2 Hz. Triggered by: (a) new obstacle detected that intersects current global path, (b) localization uncertainty exceeds threshold, (c) goal changed. Do NOT replan every tick — RRT* is computationally expensive. Cache the last valid path and only invalidate it via a path-collision-check running at 5 Hz.</p>
                </div>
                <div class="bg-slate-900 p-3 rounded border border-slate-700">
                    <strong class="text-purple-400 text-xs uppercase block mb-1">3D vs. 2.5D Maps</strong>
                    <p class="text-slate-400 text-xs">Full 3D voxel maps are required for indoor drones flying at varying altitudes. Outdoor drones flying at a fixed altitude above terrain can use a 2.5D elevation map (faster to build, lower memory), projecting 3D obstacles onto a heightmap. The elevation map approach fails for bridges, tunnels, and multi-floor interiors.</p>
                </div>
            </div>
        </div>
    </div>
</div>
`;
