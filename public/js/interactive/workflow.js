export const workflowContent = {
    1: `
        <h3 class="mt-0 text-sky-400 border-none mb-2">Phase 1: SITL Simulation</h3>
        <p class="text-slate-300 text-sm mb-4">Never fly untested AI code on physical hardware. The first step is to build the software stack in simulation.</p>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-6">
            <li>Launch <strong>NVIDIA Isaac Sim</strong> (recommended) or Gazebo Harmonic. Isaac Sim provides photorealistic RTX rendering and physics-accurate aerodynamics via the Omniverse platform — critical for training visual navigation policies that transfer zero-shot to real hardware. <em>Note: Microsoft AirSim was deprecated in 2023; use Isaac Sim or the community fork Colosseum for Unreal Engine workflows.</em></li>
            <li>Launch <strong>ArduPilot SITL</strong>. This runs the exact Flight Controller C++ code on your desktop, acting as the drone's brain. Connect via the MAVLink TCP bridge exposed by the SITL process.</li>
            <li>Write your ROS 2 AI Python/C++ node. Have it subscribe to the virtual camera feed (published via Isaac Sim's ROS 2 bridge), run inference, and send MAVLink commands back to the SITL instance.</li>
            <li><strong>Domain Randomization:</strong> Before declaring SITL complete, run at least 50 simulation episodes with randomized lighting (dawn, overcast, harsh noon), randomized target textures, and ±10% wind disturbances. This is what produces sim-to-real transfer — a model trained on one lighting condition will fail in the field.</li>
            <li><em>Goal:</em> Verify the mathematical control loop works perfectly and that the AI model generalizes before risking thousands of dollars of hardware.</li>
        </ul>
    `,
    2: `
        <h3 class="mt-0 text-amber-400 border-none mb-2">Phase 2: Hardware Bench Build</h3>
        <p class="text-slate-300 text-sm mb-4">Moving from simulation to silicon. This is done on an anti-static workbench, not on the drone.</p>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-6">
            <li>Flash the Companion Computer (e.g., Jetson) using NVIDIA SDK Manager. Install Ubuntu, JetPack, CUDA, and TensorRT.</li>
            <li>Flash the Flight Controller (e.g., Pixhawk Cube) with ArduPilot via Mission Planner.</li>
            <li>Wire the physical UART connection (TX to RX, RX to TX, GND to GND) between the Jetson and Pixhawk. <strong>Do not connect VCC (5V) between them to prevent ground loops and power spikes.</strong></li>
            <li>Configure the Flight Controller parameter <code>SERIAL2_BAUD</code> to 921 and <code>SERIAL2_PROTOCOL</code> to 2 (MAVLink 2). Verify heartbeat reception on the Jetson.</li>
        </ul>
    `,
    3: `
        <h3 class="mt-0 text-emerald-400 border-none mb-2">Phase 3: Sensor Calibration</h3>
        <p class="text-slate-300 text-sm mb-4">Garbage data in, garbage AI out. Sensors must be mathematically tuned.</p>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-6">
            <li><strong>Camera Intrinsics:</strong> Print a rigid checkerboard. Move it in front of the stereo cameras in various orientations. Run the ROS 2 <code>camera_calibration</code> node to calculate the K matrix and distortion coefficients.</li>
            <li><strong>Camera Extrinsics:</strong> Mathematically define exactly where the camera is located relative to the drone's Center of Mass (e.g., Camera is +10cm Forward, -5cm Down). This is critical for coordinate transformations.</li>
            <li><strong>Time Sync:</strong> Setup the hardware PPS pin from the GPS/Flight Controller to the Jetson GPIO. Configure <code>chrony</code>. Verify offset is under 1 millisecond.</li>
        </ul>
    `,
    4: `
        <h3 class="mt-0 text-purple-400 border-none mb-2">Phase 4: Airframe Integration</h3>
        <p class="text-slate-300 text-sm mb-4">Mounting the electronics onto the carbon fiber frame.</p>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-6">
            <li><strong>Vibration Isolation:</strong> The camera and flight controller must be hard-mounted to each other to maintain Extrinsic calibration, but that entire sub-assembly must be soft-mounted (via silicone dampeners) to the frame to prevent high-frequency motor vibrations from destroying the IMU data.</li>
            <li><strong>EMI Shielding:</strong> Wrap the MIPI CSI camera cables in copper foil tape and ground the tape. ESC PWM noise will absolutely corrupt MIPI video signals if unshielded.</li>
            <li><strong>Thermal:</strong> Mount the Jetson heatsink such that it protrudes into the downward prop-wash of the front rotors for active in-flight cooling.</li>
        </ul>
    `,
    5: `
        <h3 class="mt-0 text-rose-500 border-none mb-2">Phase 5: Tethered Flight Test</h3>
        <p class="text-slate-300 text-sm mb-4">The final validation step before untethered autonomous flight.</p>
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400 mb-6">
            <li>Attach the drone to a heavy ground anchor using a 3-meter slack tether line.</li>
            <li>Pilot takes off in manual mode and establishes a stable hover.</li>
            <li>Pilot flips the RC switch to activate <strong>GUIDED</strong> mode (ArduPilot), relinquishing position control to the AI Companion Computer.</li>
            <li>The AI attempts to track a target (e.g., a person walking). If the PID tuning is violently wrong, the drone will jerk, but the physical tether prevents a fly-away. The pilot can instantly switch back to manual mode to recover.</li>
            <li>Analyze log files (rosbags and .bin logs) to measure CPU load, thermal levels, and target tracking latency during the physical flight.</li>
        </ul>
    `
};

export function updateWorkflow(el, stepNum) {
    if (el) {
        document.querySelectorAll('.workflow-step').forEach(e => e.classList.remove('active'));
        el.classList.add('active');
    }
    const contentPanel = document.getElementById('wf-content');
    if (contentPanel) {
        contentPanel.classList.remove('fade-in');
        void contentPanel.offsetWidth;
        contentPanel.innerHTML = workflowContent[stepNum];
        contentPanel.classList.add('fade-in');
    }
}
