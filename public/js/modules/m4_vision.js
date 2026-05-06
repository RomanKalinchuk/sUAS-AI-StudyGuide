export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 4</span>
    <h2>Perception & Visual SLAM</h2>
    <p>To act autonomously, the drone must generate a mathematical representation of its environment in real-time. This module covers the core computer vision mathematics.</p>

    <h3>4.1 Camera Geometry and Calibration</h3>
    <p>A camera is a mathematical transformation device that maps 3D world points (X,Y,Z) into 2D image pixels (u,v). For AI to interact with the physical world, we must mathematically reverse this process. This requires the Intrinsic Matrix (K).</p>

    <div class="math-block text-lg">
        <span class="text-slate-400">The Pinhole Projection Equation:</span><br><br>
        s * [u, v, 1]^T = K * [R|t] * [X, Y, Z, 1]^T<br><br>
        <span class="text-slate-400 text-sm">
            Where <strong>K (Intrinsic Matrix)</strong> represents the internal camera physics:<br>
            [ f_x,  0,  c_x ]<br>
            [  0, f_y,  c_y ]<br>
            [  0,   0,   1  ]<br><br>
            (f_x, f_y = focal lengths in pixels. c_x, c_y = optical center). Engineers must run OpenCV calibration scripts (checkerboard calibration) to find K before any AI targeting can work accurately.
        </span>
    </div>

    <h3>4.2 Visual Inertial Odometry (VIO) Architecture</h3>
    <p>VIO is the process of fusing Camera translation with IMU acceleration to determine the drone's position in 3D space. It solves the problem of IMU drift. (An IMU alone accumulates error so fast that after 10 seconds, it might think it has moved 50 meters).</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">The VIO Graph Optimization Pipeline</h4>
        <ol class="list-decimal pl-6 space-y-4 text-slate-300 text-sm">
            <li><strong>Frontend (Tracking):</strong> Raw image comes in. FAST or ORB feature detector finds ~200 distinct corners. Using Lucas-Kanade optical flow, the algorithm tracks where those same 200 corners moved in the next frame.</li>
            <li><strong>Pre-integration:</strong> Between camera frames (which happen at ~30Hz), the IMU has fired ~10 times (at 300Hz). We integrate those 10 IMU readings into a single "motion guess".</li>
            <li><strong>Backend (Optimization):</strong> This is the heavy math. The system creates a "Factor Graph". It looks at the visual guess (how the corners moved) and the IMU guess. Using non-linear optimization (like Gauss-Newton or Levenberg-Marquardt), it minimizes the error between the two to find the single most mathematically probable position of the drone.</li>
        </ol>
    </div>
</div>
`;
