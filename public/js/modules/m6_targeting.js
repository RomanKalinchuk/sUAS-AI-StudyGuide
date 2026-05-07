export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 14</span>
    <h2>AI Targeting & Kinematics</h2>
    <p>Detecting an object in a frame is merely computer vision. Tracking it through 3D space, predicting its movement, and controlling a drone to intercept it is autonomous robotics.</p>

    <h3>14.1 Multi-Object Tracking (DeepSORT)</h3>
    <p>YOLO only tells you "There is a car here in this specific frame." It does not know if it's the same car from the previous frame. DeepSORT (Simple Online and Realtime Tracking with a Deep Association Metric) assigns persistent IDs to objects.</p>

    <ul class="space-y-4">
        <li><strong>State Estimation (Kalman Filter):</strong> DeepSORT maintains a mathematical state for every tracked object: (u, v, gamma, h, dx, dy, dgamma, dh) representing bounding box center, aspect ratio, height, and their velocities. The Kalman filter predicts where the box will be in the next frame.</li>
        <li><strong>Data Association (Hungarian Algorithm):</strong> When the next frame arrives with new YOLO detections, the algorithm must match the new detections to the predicted Kalman tracks. It computes a cost matrix based on:
            <ul class="list-disc pl-5 mt-2 text-sm text-slate-400">
                <li><em>Mahalanobis Distance:</em> Geometric distance between predicted box and new detection.</li>
                <li><em>Cosine Distance:</em> Visual appearance difference (using a secondary CNN to extract visual features, ensuring we don't swap IDs if two identical cars pass each other).</li>
            </ul>
        </li>
    </ul>

    <h3>14.2 Gimbal & Airframe Kinematic Control (PID)</h3>
    <p>Once the target pixel coordinates are known and stabilized by DeepSORT, the drone must physically move to keep the target in the center of the frame (Pixel coordinate u_center, v_center). This is achieved via a PID (Proportional-Integral-Derivative) controller.</p>

    <div class="math-block">
        Error(t) = Target_Pixel_X - Image_Center_X<br><br>
        Command_Output = (K_p * Error) + (K_i * Integral(Error dt)) + (K_d * dError/dt)
    </div>

    <p>The <code>Command_Output</code> is translated into a Yaw Rate command sent via MAVLink.</p>
    <div class="bg-slate-800 p-4 rounded border-l-4 border-amber-500 text-sm text-slate-300">
        <strong>Engineering Tuning:</strong>
        <br>If K_p (Proportional) is too high, the drone will violently oscillate left and right trying to center the target.
        <br>If K_d (Derivative) is tuned correctly, it acts as a dampener, slowing the drone's rotation exactly as the target reaches the center of the frame, resulting in smooth cinematic tracking.
    </div>
</div>
`;
