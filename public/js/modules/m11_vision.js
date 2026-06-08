export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 11</span>
    <h2>Perception, Computer Vision &amp; Visual SLAM</h2>
    <p>Autonomous drone perception operates at two levels: <strong>object-level understanding</strong> — detecting, classifying, and tracking targets in real time — and <strong>geometric self-localization</strong> — recovering the drone's own pose by mapping the environment. This module covers both: from YOLO11/RT-DETR real-time detection and SAM 2 video segmentation, through multi-object tracking, thermal IR processing, and monocular depth estimation, to the full mathematical stack of Visual SLAM — camera geometry, optical flow, Visual-Inertial Odometry, loop closure, and deep learning frontiers. Hardware coverage spans edge deployment on Jetson Orin NX, FLIR thermal cameras, and NVIDIA Isaac ROS cuVSLAM.</p>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 my-6 text-center text-xs">
        <div class="bg-slate-800 border border-slate-700 rounded-lg p-3"><span class="text-sky-400 font-bold block text-lg">YOLO11</span><span class="text-slate-400">Real-time detection</span></div>
        <div class="bg-slate-800 border border-slate-700 rounded-lg p-3"><span class="text-emerald-400 font-bold block text-lg">SAM 2</span><span class="text-slate-400">Video segmentation</span></div>
        <div class="bg-slate-800 border border-slate-700 rounded-lg p-3"><span class="text-amber-400 font-bold block text-lg">ByteTrack</span><span class="text-slate-400">Multi-obj tracking</span></div>
        <div class="bg-slate-800 border border-slate-700 rounded-lg p-3"><span class="text-purple-400 font-bold block text-lg">cuVSLAM</span><span class="text-slate-400">NVIDIA SLAM</span></div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════
         PART A: COMPUTER VISION FOR DRONE PERCEPTION
         ═══════════════════════════════════════════════════════════ -->

    <h3>11.A Real-Time Object Detection for UAVs</h3>
    <p>Drone-borne object detection must run at ≥15 fps on a power-constrained edge processor, handle severe downward viewing angles, detect small objects at altitude (pedestrians at 50 m occupy as few as 8×8 pixels), and tolerate motion blur. The YOLO family — culminating in <strong>YOLO11</strong> (Ultralytics, September 2024) — and the transformer-based <strong>RT-DETR</strong> (Baidu, 2023) are the dominant production architectures.</p>

    <h4>YOLO11: Architecture and Key Innovations</h4>
    <p>YOLO11 retains the three-part backbone–neck–head structure of YOLOv8 but introduces two new blocks: <strong>C3k2</strong> (Cross-Stage Partial with two smaller convolution kernels — fewer parameters than C2f) and <strong>C2PSA</strong> (Convolutional Block with Parallel Spatial Attention — focuses computation on salient regions). SPPF (Spatial Pyramid Pooling Fast) at the backbone tail aggregates multi-scale context. The result: YOLO11m achieves higher COCO mAP than YOLOv8m with 22% fewer parameters. Tasks supported out-of-the-box: detection, instance segmentation, pose estimation, oriented bounding box (OBB) detection, and image classification — all from a single unified codebase.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Model</th>
                    <th class="p-3">Params (M)</th>
                    <th class="p-3">FLOPs (B)</th>
                    <th class="p-3">mAP<sup>val</sup> 50-95</th>
                    <th class="p-3">CPU ONNX (ms)</th>
                    <th class="p-3">T4 TensorRT (ms)</th>
                    <th class="p-3">Notes</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 font-mono text-sky-300">YOLO11n</td><td class="p-3 text-slate-300">2.6</td><td class="p-3 text-slate-300">6.5</td><td class="p-3 text-green-400">39.5</td><td class="p-3 text-slate-300">56</td><td class="p-3 text-slate-300">1.5</td><td class="p-3 text-slate-400">Nano — Jetson Orin Nano, MCU class</td></tr>
                <tr class="bg-slate-900"><td class="p-3 font-mono text-sky-300">YOLO11s</td><td class="p-3 text-slate-300">9.4</td><td class="p-3 text-slate-300">21.5</td><td class="p-3 text-green-400">47.0</td><td class="p-3 text-slate-300">90</td><td class="p-3 text-slate-300">2.5</td><td class="p-3 text-slate-400">Small — real-time on Orin NX</td></tr>
                <tr class="bg-slate-800"><td class="p-3 font-mono text-amber-300">YOLO11m</td><td class="p-3 text-slate-300">20.1</td><td class="p-3 text-slate-300">68.0</td><td class="p-3 text-amber-400">51.5</td><td class="p-3 text-slate-300">183</td><td class="p-3 text-slate-300">4.7</td><td class="p-3 text-slate-400">Medium — best efficiency/accuracy balance</td></tr>
                <tr class="bg-slate-900"><td class="p-3 font-mono text-amber-300">YOLO11l</td><td class="p-3 text-slate-300">25.3</td><td class="p-3 text-slate-300">86.9</td><td class="p-3 text-amber-400">53.4</td><td class="p-3 text-slate-300">239</td><td class="p-3 text-slate-300">6.2</td><td class="p-3 text-slate-400">Large — Jetson AGX Orin</td></tr>
                <tr class="bg-slate-800"><td class="p-3 font-mono text-rose-300">YOLO11x</td><td class="p-3 text-slate-300">56.9</td><td class="p-3 text-slate-300">194.9</td><td class="p-3 text-rose-400">54.7</td><td class="p-3 text-slate-300">463</td><td class="p-3 text-slate-300">11.3</td><td class="p-3 text-slate-400">XLarge — server/GCS inference only</td></tr>
            </tbody>
        </table>
        <p class="text-slate-500 text-xs mt-1">COCO val2017 benchmark. CPU = ONNX on Intel Core Ultra 7 (ms/image). Source: <a href="https://docs.ultralytics.com/models/yolo11" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Ultralytics Docs</a></p>
    </div>

    <h4>YOLO Family + RT-DETR Model Comparison</h4>
    <p>Each YOLO generation since v8 has addressed a specific weakness. YOLO11 is the current recommended starting point for drone deployments. RT-DETR uses a Transformer architecture — no NMS post-processing, globally consistent detections — at the cost of higher GPU memory and compute.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Model</th>
                    <th class="p-3">Year</th>
                    <th class="p-3">Architecture</th>
                    <th class="p-3">Key Innovation</th>
                    <th class="p-3">mAP (COCO, medium)</th>
                    <th class="p-3">NMS-free</th>
                    <th class="p-3">Drone Fit</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 font-mono text-slate-300">YOLOv8m</td><td class="p-3 text-slate-300">2023</td><td class="p-3 text-slate-300">CNN (C2f, SPPF)</td><td class="p-3 text-slate-300">Anchor-free, decoupled head</td><td class="p-3 text-slate-300">50.2</td><td class="p-3 text-red-400">No</td><td class="p-3 text-slate-400">Mature baseline; large ecosystem</td></tr>
                <tr class="bg-slate-900"><td class="p-3 font-mono text-slate-300">YOLOv9c</td><td class="p-3 text-slate-300">2024</td><td class="p-3 text-slate-300">CNN (GELAN)</td><td class="p-3 text-slate-300">PGI — prevents info loss in deep nets</td><td class="p-3 text-slate-300">53.0</td><td class="p-3 text-red-400">No</td><td class="p-3 text-slate-400">Better accuracy, more complex training</td></tr>
                <tr class="bg-slate-800"><td class="p-3 font-mono text-slate-300">YOLOv10m</td><td class="p-3 text-slate-300">2024</td><td class="p-3 text-slate-300">CNN (dual assign)</td><td class="p-3 text-slate-300">NMS-free training (consistent dual assign)</td><td class="p-3 text-slate-300">51.3</td><td class="p-3 text-green-400">Yes</td><td class="p-3 text-slate-400">Lower latency; less mature ecosystem</td></tr>
                <tr class="bg-slate-900"><td class="p-3 font-mono text-amber-300 font-bold">YOLO11m</td><td class="p-3 text-slate-300">2024</td><td class="p-3 text-slate-300">CNN (C3k2, C2PSA)</td><td class="p-3 text-slate-300">Spatial attention; 22% fewer params vs v8m</td><td class="p-3 text-amber-400 font-bold">51.5</td><td class="p-3 text-red-400">No</td><td class="p-3 text-slate-400 font-bold">Recommended default for UAV edge deployment</td></tr>
                <tr class="bg-slate-800"><td class="p-3 font-mono text-purple-300">RT-DETR-L</td><td class="p-3 text-slate-300">2023</td><td class="p-3 text-slate-300">Transformer (hybrid encoder)</td><td class="p-3 text-slate-300">First real-time DETR; AIFI + CCFM encoder</td><td class="p-3 text-purple-400">53.0</td><td class="p-3 text-green-400">Yes</td><td class="p-3 text-slate-400">Better for occlusion; needs GPU (≥4 GB VRAM)</td></tr>
            </tbody>
        </table>
        <p class="text-slate-500 text-xs mt-1">All measured at 640×640 input on COCO val2017. RT-DETR mAP: 114 FPS / 53.0 AP on T4 GPU. Sources: <a href="https://arxiv.org/abs/2304.08069" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">RT-DETR paper</a>, <a href="https://docs.ultralytics.com/models/yolo11" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Ultralytics YOLO11 docs</a></p>
    </div>

    <figure class="my-6">
        <img src="images/m11_object_detection.jpg" alt="YOLO real-time object detection bounding boxes on a scene" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">YOLO real-time object detection with bounding boxes and class labels. On drone hardware, YOLO11n/s variants run at 30+ fps on Jetson Orin NX using TensorRT. Source: <a href="https://commons.wikimedia.org/wiki/File:Detected-with-YOLO--Schreibtisch-mit-Objekten.jpg" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons</a> (CC0)</figcaption>
    </figure>

    <h4>Aerial Detection: VisDrone and Small-Object Challenges</h4>
    <p>The <strong>VisDrone2019</strong> dataset (Tianjin University) is the standard benchmark for UAV-perspective detection: 261,908 frames and 10,209 static images from consumer drones over 14 Chinese cities, 10 classes (pedestrian, car, van, truck, bus, bicycle, motor, tricycle, awning-tricycle, people). Key challenges on aerial imagery:</p>
    <ul class="text-slate-300 text-sm space-y-1 mb-4">
        <li><strong>Small object size</strong> — pedestrians at 50 m altitude: ~8×12 pixels at 1080p. Standard 640×640 YOLO input loses resolution. Mitigation: <strong>SAHI</strong> (Slicing-Aided Hyper Inference) — slice input into overlapping 640×640 tiles, run detection on each tile, merge with NMS. Typically adds 15-30% mAP on VisDrone at ~3× inference cost.</li>
        <li><strong>Density and occlusion</strong> — crowd scenes with 300+ objects per frame. Use OBB (Oriented Bounding Box) mode for overhead vehicles.</li>
        <li><strong>View angle</strong> — top-down vs. oblique. Pre-train on VisDrone or DOTA (aerial remote sensing) before fine-tuning on mission-specific targets.</li>
        <li><strong>Motion blur</strong> — global shutter camera required for fast drone maneuvers (&gt;10 m/s).</li>
    </ul>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: YOLO11 Inference with TensorRT + SAHI for Aerial Small-Object Detection</div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-python">from ultralytics import YOLO
from sahi import AutoDetectionModel
from sahi.predict import get_sliced_prediction

# ── Standard YOLO11 TensorRT inference (Jetson Orin NX) ──────────────────
model = YOLO("yolo11m.pt")
# Export to TensorRT engine once (INT8 calibration for ~2× speedup)
model.export(format="engine", imgsz=640, half=True, device=0)

# Load engine and run on video stream
trt_model = YOLO("yolo11m.engine")
results = trt_model("drone_feed.mp4", stream=True, conf=0.25, iou=0.45)
for r in results:
    boxes = r.boxes.xyxy      # (N,4) float tensor, pixel coords
    scores = r.boxes.conf     # (N,) confidence
    classes = r.boxes.cls     # (N,) class index

# ── SAHI sliced inference for small object detection at altitude ──────────
sahi_model = AutoDetectionModel.from_pretrained(
    model_type="ultralytics",
    model_path="yolo11m.pt",
    confidence_threshold=0.25,
    device="cuda:0",
)
result = get_sliced_prediction(
    "aerial_frame.jpg",
    sahi_model,
    slice_height=640, slice_width=640,
    overlap_height_ratio=0.2, overlap_width_ratio=0.2,
)
# result.object_prediction_list — merged detections across all tiles
print(f"Detected {len(result.object_prediction_list)} objects with SAHI")</code></pre>
        </div>
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">YOLO11 on VisDrone — Aerial Object Detection Tutorial</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/9ymyH4H1fG4" title="How to Train YOLO11 on VisDrone Dataset | Aerial Detection Tutorial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
    </div>

    <h3>11.B SAM 2: Segment Anything Model 2 (Meta, 2024)</h3>
    <p>SAM 2 (Meta AI, August 2024) extends the original Segment Anything Model to <strong>video</strong>. Given a prompt (point, box, or mask) on any frame, SAM 2 propagates that segmentation mask forward and backward through the entire video clip in real time. Architecture: <strong>Hiera</strong> image encoder (hierarchical ViT), a streaming memory bank (caches past mask predictions as context tokens), and a lightweight memory attention module. Training data: 50.9K videos annotated with 35.5M masks via a human-in-the-loop engine.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">SAM 2 Key Capabilities</h4>
            <ul class="text-slate-300 text-xs space-y-1">
                <li><strong>Zero-shot video segmentation</strong> — no fine-tuning needed for new object classes</li>
                <li><strong>Promptable</strong> — click a point, draw a box, or paste a mask on frame 0</li>
                <li><strong>Memory bank</strong> — up to 7 past frames stored as compressed tokens; handles re-appearance after occlusion</li>
                <li><strong>Real-time capable</strong> — SAM 2 Tiny runs at ~44 fps on A100; SAM 2 Large ~6 fps</li>
                <li><strong>License</strong> — Apache 2.0; model weights freely available</li>
            </ul>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">Drone Applications</h4>
            <ul class="text-slate-300 text-xs space-y-1">
                <li><strong>Target isolation</strong> — operator clicks a vehicle in frame 1; SAM 2 tracks the precise pixel mask for the rest of the clip without retraining</li>
                <li><strong>Training data generation</strong> — annotate one frame, SAM 2 auto-propagates masks to all frames, massively reducing labeling cost</li>
                <li><strong>Change detection</strong> — diff segmentation masks between passes to detect new objects in a scene</li>
                <li><strong>Dynamic masking for SLAM</strong> — mask out moving objects (vehicles, people) before feeding frames to ORB-SLAM3 to prevent dynamic-point contamination</li>
            </ul>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: SAM 2 Video Object Segmentation (Meta sam2 library)</div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-python">import torch
import numpy as np
from sam2.build_sam import build_sam2_video_predictor

# Load SAM 2 (requires: pip install sam2)
device = "cuda" if torch.cuda.is_available() else "cpu"
predictor = build_sam2_video_predictor(
    "sam2_hiera_large.yaml",
    "/path/to/sam2_hiera_large.pt",
    device=device,
)

# Initialize on a directory of JPEG frames (e.g., extracted from drone video)
with torch.inference_mode():
    state = predictor.init_state(video_path="/tmp/drone_frames/")

    # Prompt: click a point on the target vehicle in frame 0
    # ann_frame_idx=0, ann_obj_id=1 (arbitrary ID for this object)
    frame_idx, obj_ids, mask_logits = predictor.add_new_points_or_box(
        inference_state=state,
        frame_idx=0,
        obj_id=1,
        points=np.array([[640, 380]], dtype=np.float32),  # (u, v) pixel click
        labels=np.array([1], np.int32),                   # 1 = foreground
    )

    # Propagate forward through all frames
    for frame_idx, obj_ids, mask_logits in predictor.propagate_in_video(state):
        masks = (mask_logits > 0.0).cpu().numpy()  # (N_obj, H, W) binary masks
        # masks[0] = binary mask for our target vehicle at frame frame_idx</code></pre>
        </div>
    </div>

    <p>SAM 2 repository: <a href="https://github.com/facebookresearch/sam2" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">github.com/facebookresearch/sam2</a> &nbsp;|&nbsp; Paper: <a href="https://arxiv.org/abs/2408.00714" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">arXiv 2408.00714</a></p>

    <h3>11.C Multi-Object Tracking (MOT) for Drone Surveillance</h3>
    <p>Detection gives you boxes per frame. Tracking assigns persistent IDs across frames — essential for behavior analysis, headcount, and target handoff between drone and ground sensor. The dominant paradigm is <strong>tracking-by-detection</strong>: run a detector, then associate detections across frames using motion models and appearance features.</p>

    <h4>Tracking Algorithm Comparison</h4>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Algorithm</th>
                    <th class="p-3">Year</th>
                    <th class="p-3">Motion Model</th>
                    <th class="p-3">Low-Score Dets</th>
                    <th class="p-3">Camera Motion Comp.</th>
                    <th class="p-3">ReID</th>
                    <th class="p-3">HOTA (MOT17)</th>
                    <th class="p-3">Notes</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 font-mono text-slate-300">SORT</td><td class="p-3 text-slate-300">2016</td><td class="p-3 text-slate-300">Kalman + IoU</td><td class="p-3 text-red-400">No</td><td class="p-3 text-red-400">No</td><td class="p-3 text-red-400">No</td><td class="p-3 text-slate-300">—</td><td class="p-3 text-slate-400">Baseline; very fast but high ID-switch rate</td></tr>
                <tr class="bg-slate-900"><td class="p-3 font-mono text-sky-300">ByteTrack</td><td class="p-3 text-slate-300">2022</td><td class="p-3 text-slate-300">Kalman + IoU</td><td class="p-3 text-green-400">Yes (2-stage)</td><td class="p-3 text-red-400">No</td><td class="p-3 text-red-400">No</td><td class="p-3 text-green-400">63.1</td><td class="p-3 text-slate-400">Associates low-confidence dets in 2nd pass; recovers occluded targets</td></tr>
                <tr class="bg-slate-800"><td class="p-3 font-mono text-emerald-300">OC-SORT</td><td class="p-3 text-slate-300">2023</td><td class="p-3 text-slate-300">Kalman (obs-centric)</td><td class="p-3 text-green-400">Yes</td><td class="p-3 text-amber-400">Partial</td><td class="p-3 text-red-400">No</td><td class="p-3 text-emerald-400">63.9</td><td class="p-3 text-slate-400">Re-updates Kalman state from observations; better for nonlinear motion</td></tr>
                <tr class="bg-slate-900"><td class="p-3 font-mono text-amber-300">BoT-SORT</td><td class="p-3 text-slate-300">2022</td><td class="p-3 text-slate-300">Kalman + IoU</td><td class="p-3 text-green-400">Yes</td><td class="p-3 text-green-400">Yes (homography)</td><td class="p-3 text-green-400">Optional</td><td class="p-3 text-amber-400">65.0</td><td class="p-3 text-slate-400">Camera motion compensation via homography; recommended for moving-camera drones</td></tr>
                <tr class="bg-slate-800"><td class="p-3 font-mono text-purple-300">StrongSORT</td><td class="p-3 text-slate-300">2023</td><td class="p-3 text-slate-300">ECC + Kalman</td><td class="p-3 text-green-400">Yes</td><td class="p-3 text-green-400">Yes (ECC)</td><td class="p-3 text-green-400">OSNet ReID</td><td class="p-3 text-purple-400">64.4</td><td class="p-3 text-slate-400">Best ReID integration; slower but fewer ID switches on long occlusions</td></tr>
            </tbody>
        </table>
        <p class="text-slate-500 text-xs mt-1">HOTA = Higher Order Tracking Accuracy on MOT17 test set. For drone (moving camera) scenarios, BoT-SORT's homography-based camera motion compensation is critical. Sources: <a href="https://arxiv.org/abs/2110.06864" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">ByteTrack</a>, <a href="https://arxiv.org/abs/2206.14651" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">BoT-SORT</a>, <a href="https://arxiv.org/abs/2203.14360" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">OC-SORT</a></p>
    </div>

    <div class="insight-box">
        <div class="insight-label">DRONE TRACKING: MOVING CAMERA PROBLEM</div>
        <p class="text-slate-200 text-sm mt-1">Standard trackers assume a static camera — IoU between consecutive frames fails when the drone pans or translates because every bounding box shifts even for stationary targets. BoT-SORT compensates by estimating a frame-to-frame homography (via ECC or feature matching) and warping all predicted Kalman states before association. On a drone panning at 30°/s, this reduces ID-switch rate by ~40% vs. vanilla ByteTrack.</p>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: YOLO11 + BoT-SORT Multi-Object Tracking (Ultralytics native)</div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-python">from ultralytics import YOLO
import cv2

model = YOLO("yolo11m.pt")
cap = cv2.VideoCapture("drone_feed.mp4")

# Ultralytics has ByteTrack and BoT-SORT built-in
# tracker="botsort.yaml" includes camera motion compensation
track_history = {}  # track_id → list of (cx, cy) centroids

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Run tracking — returns Results with .boxes.id for persistent track IDs
    results = model.track(frame, persist=True, tracker="botsort.yaml",
                          conf=0.25, iou=0.45, verbose=False)

    if results[0].boxes.id is not None:
        boxes = results[0].boxes.xyxy.cpu().numpy()   # (N,4)
        track_ids = results[0].boxes.id.int().cpu().tolist()  # (N,)
        classes = results[0].boxes.cls.int().cpu().tolist()   # (N,)

        for box, tid, cls in zip(boxes, track_ids, classes):
            cx, cy = int((box[0]+box[2])/2), int((box[1]+box[3])/2)
            track_history.setdefault(tid, []).append((cx, cy))
            # Draw track tail (last 30 positions)
            tail = track_history[tid][-30:]
            for i in range(1, len(tail)):
                cv2.line(frame, tail[i-1], tail[i], (0, 255, 255), 2)

cap.release()</code></pre>
        </div>
    </div>

    <h3>11.D Thermal / IR Vision Processing</h3>
    <p>Thermal cameras (LWIR: 8–14 µm) detect emitted heat rather than reflected visible light, providing all-weather, day/night detection capability. FLIR Boson 640 and Lepton 3.5 are the standard small-UAV thermal modules. Processing thermal imagery requires different techniques than visible-band images.</p>

    <figure class="my-6">
        <img src="images/m11_thermal_detection.png" alt="Thermal infrared image showing heat signatures" class="rounded-lg w-full max-w-2xl mx-auto">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Thermal IR image showing heat signatures (bright = warm). Thermal cameras enable detection regardless of lighting conditions — critical for night ISR and search-and-rescue. Source: <a href="https://commons.wikimedia.org/wiki/File:Thermal_image_of_a_Tawny_Owl.png" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Wikimedia Commons</a> (CC BY-SA)</figcaption>
    </figure>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">Thermal Pre-Processing Pipeline</h4>
            <ol class="text-slate-300 text-xs space-y-2 list-decimal pl-4">
                <li><strong>Non-Uniformity Correction (NUC)</strong> — factory-calibrated per-pixel gain/offset correction. Most cameras apply this internally; some require a manual flat-field shutter drop.</li>
                <li><strong>Bad Pixel Replacement</strong> — dead or stuck pixels (common in uncooled microbolometers) replaced by neighborhood median.</li>
                <li><strong>Histogram Equalization / CLAHE</strong> — thermal scenes often have very low contrast (all objects near 300K). CLAHE with clipLimit=2.0 dramatically improves feature visibility without crushing hot spots.</li>
                <li><strong>Pseudo-color mapping</strong> — map 14-bit thermal values to 8-bit colormap (INFERNO, JET, RAINBOW) for visualization and training data.</li>
                <li><strong>Temporal averaging</strong> — for slow scenes, average 4-8 frames to reduce microbolometer noise (NETD ~50 mK uncooled).</li>
            </ol>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Thermal Detection Strategy</h4>
            <ul class="text-slate-300 text-xs space-y-2">
                <li><strong>Fine-tune YOLO11 on thermal data</strong> — thermal appearance differs radically from RGB (inverted edges, no color, glow around warm targets). Always fine-tune; do not use RGB-trained weights zero-shot.</li>
                <li><strong>FLIR ADAS dataset</strong> — 14,452 annotated thermal images (pedestrian, car, bicycle). Good starting point for UAV thermal detection fine-tuning.</li>
                <li><strong>Multi-spectral fusion</strong> — fuse RGB + LWIR in feature space (mid-level fusion after backbone) for all-condition detection. Active research: CFT (Cross-modal Feature Transformer), PIAFusion.</li>
                <li><strong>Human detection signature</strong> — human body (~310 K) appears bright against ~285 K background at night; contrast reverses mid-day in direct sun. Account for this in confidence thresholds.</li>
                <li><strong>FLIR Boson 640 interface</strong> — USB-C (UVC) or MIPI CSI-2. On Jetson Orin: CSI-2 at 60 Hz via Argus API; CUDA CLAHE pre-processing takes ~0.3 ms.</li>
            </ul>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: Thermal Image Pre-Processing with OpenCV (CLAHE + Pseudo-color)</div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-python">import cv2
import numpy as np

def preprocess_thermal(raw_frame_14bit: np.ndarray) -> np.ndarray:
    """
    raw_frame_14bit: (H, W) uint16 array from FLIR Boson (14-bit values 0-16383)
    Returns: (H, W, 3) uint8 BGR image suitable for YOLO11 inference
    """
    # 1. Normalize to 8-bit (preserves relative temperature ordering)
    norm = cv2.normalize(raw_frame_14bit, None, 0, 255, cv2.NORM_MINMAX, cv2.CV_8U)

    # 2. CLAHE for contrast enhancement (tile size 8x8, clip limit 2.0)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(norm)

    # 3. Apply pseudo-color (INFERNO colormap: black=cold, bright yellow=hot)
    colorized = cv2.applyColorMap(enhanced, cv2.COLORMAP_INFERNO)

    return colorized  # (H, W, 3) BGR uint8 — feed directly to YOLO11

# Multi-spectral fusion: stack RGB + thermal as 4-channel input
# (Requires YOLO model fine-tuned on 4-channel input)
def fuse_rgb_thermal(rgb: np.ndarray, thermal_8bit: np.ndarray) -> np.ndarray:
    """Concatenate RGB and 1-channel thermal as 4-channel image."""
    return np.concatenate([rgb, thermal_8bit[..., np.newaxis]], axis=2)</code></pre>
        </div>
    </div>

    <h3>11.E Monocular Depth Estimation: Depth Anything v2 (2024)</h3>
    <p><strong>Depth Anything v2</strong> (Yang et al., NeurIPS 2024) is the current state-of-the-art for single-image monocular depth. It uses a <strong>DINOv2 ViT-Large</strong> encoder (pretrained on 142M images) fine-tuned via a teacher-student self-training strategy: a large teacher generates pseudo-depth labels on 62M unlabeled real images; student models of varying sizes are trained on the combined synthetic + pseudo-labeled data. Key result: dramatically sharper detail on fine structures (wires, fences, thin poles) compared to previous methods.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Variant</th>
                    <th class="p-3">Encoder</th>
                    <th class="p-3">Params (M)</th>
                    <th class="p-3">Output</th>
                    <th class="p-3">Drone Use Case</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800"><td class="p-3 font-mono text-slate-300">DA-v2-Small</td><td class="p-3 text-slate-300">ViT-Small</td><td class="p-3 text-slate-300">25</td><td class="p-3 text-slate-300">Relative depth</td><td class="p-3 text-slate-400">Real-time obstacle awareness on Orin NX; ~15 fps at 518×518</td></tr>
                <tr class="bg-slate-900"><td class="p-3 font-mono text-slate-300">DA-v2-Base</td><td class="p-3 text-slate-300">ViT-Base</td><td class="p-3 text-slate-300">97</td><td class="p-3 text-slate-300">Relative depth</td><td class="p-3 text-slate-400">Better scene detail; ~8 fps on Orin NX</td></tr>
                <tr class="bg-slate-800"><td class="p-3 font-mono text-amber-300">DA-v2-Large</td><td class="p-3 text-slate-300">ViT-Large</td><td class="p-3 text-slate-300">335</td><td class="p-3 text-slate-300">Relative depth</td><td class="p-3 text-slate-400">Highest quality; GCS post-processing of recorded video</td></tr>
                <tr class="bg-slate-900"><td class="p-3 font-mono text-green-300">DA-v2-Small-Metric</td><td class="p-3 text-slate-300">ViT-Small</td><td class="p-3 text-slate-300">25</td><td class="p-3 text-slate-300">Metric depth (m)</td><td class="p-3 text-slate-400">Absolute depth — obstacle ranging &lt;15 m without stereo camera</td></tr>
            </tbody>
        </table>
        <p class="text-slate-500 text-xs mt-1">Metric variants fine-tuned on KITTI (outdoor) or NYU-Depth v2 (indoor). Source: <a href="https://github.com/DepthAnything/Depth-Anything-V2" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">github.com/DepthAnything/Depth-Anything-V2</a>, <a href="https://arxiv.org/abs/2406.09414" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">arXiv 2406.09414</a></p>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: Depth Anything v2 Metric Depth Inference</div>
        <div class="p-4 overflow-x-auto">
<pre><code class="language-python">import cv2, torch, numpy as np
from depth_anything_v2.dpt import DepthAnythingV2

# Metric depth model fine-tuned on outdoor (KITTI) data
model_cfg = {"encoder": "vits", "features": 64, "out_channels": [48,96,192,384]}
model = DepthAnythingV2(**model_cfg)
model.load_state_dict(torch.load("depth_anything_v2_metric_outdoor_vits.pth",
                                  map_location="cpu"))
model = model.to("cuda").eval()

frame = cv2.imread("drone_frame.jpg")
# Returns metric depth map in meters (H, W) float32
depth_m = model.infer_image(frame)   # values: ~0.1 m to ~80 m for outdoor
print(f"Nearest obstacle: {depth_m.min():.2f} m")

# Obstable avoidance: flag any region closer than 5 m
danger_mask = depth_m &lt; 5.0
if danger_mask.any():
    danger_fraction = danger_mask.mean()
    print(f"WARNING: {danger_fraction*100:.1f}% of frame within 5 m")</code></pre>
        </div>
    </div>

    <h3>11.F Open-Vocabulary Detection: GroundingDINO</h3>
    <p><strong>GroundingDINO</strong> (Liu et al., ECCV 2024) merges DINO (transformer object detector) with a BERT text encoder to enable <strong>zero-shot, text-prompted object detection</strong>. Instead of a fixed class list, you pass any natural language description: "military vehicle near fence" or "person carrying backpack." The model outputs bounding boxes with confidence scores for the described targets.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Architecture</h4>
            <ul class="text-slate-300 text-xs space-y-1">
                <li><strong>Image backbone</strong>: Swin Transformer (feature maps at 4 scales)</li>
                <li><strong>Text encoder</strong>: BERT-base (tokenizes the text prompt)</li>
                <li><strong>Feature Enhancer</strong>: stacked self-attention + cross-attention between image and text features</li>
                <li><strong>Language-Guided Query Selection</strong>: text tokens select which image queries to focus on</li>
                <li><strong>Cross-Modality Decoder</strong>: refines boxes with image↔text attention at each decoder layer</li>
            </ul>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">DoD/ISR Relevance</h4>
            <ul class="text-slate-300 text-xs space-y-1">
                <li><strong>No retraining for new target classes</strong> — describe the target in English; useful for emergent threat categories not in training data</li>
                <li><strong>Combine with SAM 2</strong> — use GroundingDINO box as SAM 2 prompt → pixel-precise mask on first mention of a new target type</li>
                <li><strong>Oriented aerial detection</strong> — Oriented GroundingDINO variant handles rotated objects in top-down imagery</li>
                <li><strong>Limitation</strong>: ~300ms inference on T4 GPU — not suitable for real-time &gt;30 fps; use for trigger/cue applications</li>
                <li>Paper: <a href="https://arxiv.org/abs/2303.05499" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">arXiv 2303.05499</a> | <a href="https://github.com/IDEA-Research/GroundingDINO" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">GitHub</a></li>
            </ul>
        </div>
    </div>

    <h3>11.G NVIDIA Isaac ROS cuVSLAM (2025)</h3>
    <p>NVIDIA's <strong>cuVSLAM</strong> (CUDA-accelerated Visual SLAM) is the production SLAM library shipped with <strong>Isaac ROS</strong> — NVIDIA's GPU-accelerated ROS 2 package collection. cuVSLAM is a stereo-visual-inertial odometry system optimized to run entirely on NVIDIA GPU/DLA, leaving the CPU free for mission logic. It is the recommended SLAM solution for Jetson-based drone platforms as of 2025.</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Key Specs (Isaac ROS 3.x)</h4>
            <ul class="text-slate-300 text-xs space-y-1">
                <li><strong>Sensors</strong>: stereo camera pair + optional IMU; supports 1–4 camera rigs</li>
                <li><strong>Frequency</strong>: 60 Hz visual odometry on Orin NX 16GB</li>
                <li><strong>Loop closure</strong>: tested on trajectories &gt;1 km</li>
                <li><strong>ROS 2</strong>: Jazzy / Humble compatible; publishes <code>nav_msgs/Odometry</code></li>
                <li><strong>License</strong>: NVIDIA proprietary (free binary distribution)</li>
            </ul>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">vs. ORB-SLAM3</h4>
            <ul class="text-slate-300 text-xs space-y-1">
                <li>cuVSLAM: GPU-accelerated, real-time on Orin at 60 Hz; closed-source but binary available</li>
                <li>ORB-SLAM3: fully open-source (GPLv3), better published benchmarks, CPU-only in standard build</li>
                <li>cuVSLAM better suited for production integration; ORB-SLAM3 better for research and custom modifications</li>
                <li>Both publish to ROS 2 <code>tf</code> tree and support ArduPilot VIO via VISION_POSITION_ESTIMATE</li>
            </ul>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-emerald-400 text-sm">Integration Steps</h4>
            <ol class="text-slate-300 text-xs space-y-1 list-decimal pl-4">
                <li>Install Isaac ROS on Jetson via <code>apt</code> or NVIDIA container</li>
                <li>Configure stereo camera (ZED 2, OAK-D Pro, or FLIR Blackfly stereo pair)</li>
                <li>Set camera intrinsics/extrinsics in YAML config</li>
                <li>Launch <code>isaac_ros_visual_slam</code> node — outputs <code>/visual_slam/tracking/odometry</code></li>
                <li>Bridge to ArduPilot via MAVROS <code>vision_pose</code> plugin or direct pymavlink</li>
            </ol>
        </div>
    </div>

    <p>Isaac ROS Visual SLAM docs: <a href="https://nvidia-isaac-ros.github.io/repositories_and_packages/isaac_ros_visual_slam/index.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">nvidia-isaac-ros.github.io</a> &nbsp;|&nbsp; cuVSLAM paper: <a href="https://arxiv.org/abs/2506.04359" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">arXiv 2506.04359</a></p>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">SAHI + YOLO11 for Small Object Detection in Drone Footage</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/ILqMBah5ZvI" title="How to Use SAHI with Ultralytics YOLO11 for Object Detection in Drone Footage" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════
         PART B: GEOMETRIC VISION AND VISUAL SLAM
         ═══════════════════════════════════════════════════════════ -->

    <h3>11.1 Camera Geometry and Calibration</h3>
    <p>A camera is a mathematical function that maps 3D world points <strong>P</strong> = (X, Y, Z) to 2D image pixels <strong>p</strong> = (u, v). Reversing this projection — recovering 3D structure and motion from 2D images — is the foundational problem of geometric computer vision.</p>

    <h4>The Pinhole Camera Model</h4>
    <p>The ideal pinhole model assumes all light rays pass through a single point (the optical center) and project onto a flat image plane at distance f. This gives the fundamental projection equation used in all SLAM systems:</p>

    <div class="insight-box">
        <div class="insight-label">PINHOLE PROJECTION</div>
        <p class="text-slate-200 text-sm mt-1">Maps a 3D world point to a 2D image pixel using a camera's intrinsic matrix K and its pose in the world. Understanding this transform is essential for recovering geometry from images — every SLAM, SfM, and depth-estimation algorithm builds on it.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
        Pinhole Projection (homogeneous form):<br><br>
        s * p = K * [R | t] * P_world<br><br>
        where:<br>
          p       = [u, v, 1]^T   (homogeneous image coordinates)<br>
          P_world = [X, Y, Z, 1]^T (homogeneous world coordinates)<br>
          s       = depth scale factor (the Z-coordinate in camera frame)<br>
          K       = 3×3 intrinsic matrix (camera-internal parameters)<br>
          [R | t] = 3×4 extrinsic matrix (camera pose in world)<br><br>
        Intrinsic Matrix K — encodes internal camera physics:<br><br>
        K = [ f_x,  0,   c_x ]<br>
            [  0,  f_y,  c_y ]<br>
            [  0,   0,    1  ]<br><br>
        f_x = f * m_x  (focal length in mm × pixels/mm on the sensor)<br>
        f_y = f * m_y  (can differ slightly from f_x due to non-square pixels)<br>
        c_x, c_y = principal point — ideally the image center, rarely exact<br><br>
        Example: 2mm focal length, 1280×720 sensor, 3.0 µm pixel pitch<br>
          m_x = 1/0.003 = 333.3 px/mm<br>
          f_x = 2 × 333.3 = 666.7 pixels<br>
          c_x ≈ 640, c_y ≈ 360 (image center)<br><br>
        Unprojection (pixel to unit ray in camera frame):<br>
          X/Z = (u - c_x) / f_x<br>
          Y/Z = (v - c_y) / f_y<br>
          Ray direction: d = K^(-1) * [u, v, 1]^T  (normalized gives bearing vector)
    </div>
</details>

    <h4>Lens Distortion: Brown-Conrady Model</h4>
    <p>Real lenses deviate from the ideal pinhole. Distortion corrupts geometric measurements — a 5% radial distortion at the image edge causes ~50px position error, making feature triangulation useless without correction.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Brown-Conrady Distortion Model (OpenCV Convention)</h4>
        <div class="insight-box">
            <div class="insight-label">LENS DISTORTION MODEL</div>
            <p class="text-slate-200 text-sm mt-1">Real lenses bend light non-linearly — the Brown-Conrady equations quantify this warping so it can be corrected before any geometric measurement. Without undistortion, feature triangulation errors can reach tens of pixels at the image boundary.</p>
        </div>
        <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Normalized image coordinates (divide out focal length):<br>
x_n = (u - c_x) / f_x,   y_n = (v - c_y) / f_y,   r^2 = x_n^2 + y_n^2<br><br>
Radial distortion (barrel: k1 &lt; 0, pincushion: k1 &gt; 0):<br>
x_r = x_n * (1 + k1*r^2 + k2*r^4 + k3*r^6)<br>
y_r = y_n * (1 + k1*r^2 + k2*r^4 + k3*r^6)<br><br>
Tangential distortion (lens plane not parallel to image plane):<br>
x_t = 2*p1*x_n*y_n + p2*(r^2 + 2*x_n^2)<br>
y_t = p1*(r^2 + 2*y_n^2) + 2*p2*x_n*y_n<br><br>
Final distorted pixel:<br>
u_d = f_x * (x_r + x_t) + c_x<br>
v_d = f_y * (y_r + y_t) + c_y<br><br>
OpenCV distortion coefficient vector: [k1, k2, p1, p2, k3]<br>
  k1, k2, k3 = radial (common range: -0.5 to +0.5 for wide-angle lenses)<br>
  p1, p2     = tangential (typically &lt; 0.01 for quality lenses)<br><br>
Fisheye lenses (FOV &gt; 150°) use Kannala-Brandt equidistant model:<br>
r_d = f * (theta + k1*theta^3 + k2*theta^5 + k3*theta^7 + k4*theta^9)<br>
where theta = atan(sqrt(X^2+Y^2)/Z) = angle from optical axis<br>
OpenCV: cv2.fisheye.calibrate() — separate from standard calibrateCamera()
        </div>
</details>
    </div>

    <h4>Stereo Camera Geometry</h4>
    <p>A stereo camera pair adds one critical measurement: baseline B, the physical distance between the two optical centers. This breaks the scale ambiguity of monocular systems — depth Z can be recovered directly from disparity d.</p>

    <div class="insight-box">
        <div class="insight-label">STEREO DEPTH ACCURACY</div>
        <p class="text-slate-200 text-sm mt-1">Depth from a stereo pair scales inversely with disparity — at close range a 1-pixel error means centimeters of error, but at 10 m it means over a meter. This relationship determines the maximum reliable range for any stereo camera given its baseline and focal length.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block">
        Stereo Depth from Disparity (after rectification):<br><br>
        Z = f * B / d<br><br>
        f = focal length (pixels), B = baseline (meters), d = disparity (pixels)<br><br>
        Depth error from 1-pixel disparity error (sub-pixel precision d_sub ≈ 0.5px):<br>
        dZ/dd = -(f * B) / d^2<br><br>
        At 1m: d = f*B/1 = 640*0.1 = 64px → dZ = 0.016m per pixel<br>
        At 5m: d = f*B/5 = 640*0.1 = 12.8px → dZ = 0.39m per pixel<br>
        At 10m: d = 6.4px → dZ = 1.56m per pixel (very poor — range limit)<br><br>
        Minimum detectable depth (max disparity D_max set by algorithm):<br>
        Z_min = f * B / D_max<br><br>
        For RealSense D435i: B=50mm, f≈640px, D_max=96px → Z_min = 0.33m (matches spec)<br>
        For ZED 2: B=120mm, f≈700px, D_max=256px → Z_min = 0.33m but better far-range
    </div>
</details>

    <h4>Camera Calibration: Zhang's Method (OpenCV)</h4>
    <p>Calibration recovers K and the distortion coefficients by observing a planar calibration target (checkerboard) from multiple viewpoints. Zhang's method (2000) requires ≥3 views. Reprojection error (RMS) below 0.5 pixels is required for SLAM-quality calibration.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-4">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: Full Camera Calibration Pipeline (OpenCV)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import cv2
import numpy as np
import glob

BOARD = (9, 6)       # inner corners (cols, rows)
SQUARE_M = 0.030     # 30mm square size in meters

obj_template = np.zeros((BOARD[0]*BOARD[1], 3), np.float32)
obj_template[:, :2] = np.mgrid[0:BOARD[0], 0:BOARD[1]].T.reshape(-1, 2) * SQUARE_M

obj_points, img_points = [], []

for fname in sorted(glob.glob("calib/*.jpg")):
    img  = cv2.imread(fname)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    ret, corners = cv2.findChessboardCorners(gray, BOARD, None)
    if ret:
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
        corners = cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
        obj_points.append(obj_template)
        img_points.append(corners)

H, W = gray.shape
rms, K, dist, rvecs, tvecs = cv2.calibrateCamera(
    obj_points, img_points, (W, H), None, None)

print(f"RMS reprojection error: {rms:.4f} px  (target: &lt; 0.5px)")
print(f"K: fx={K[0,0]:.1f} fy={K[1,1]:.1f} cx={K[0,2]:.1f} cy={K[1,2]:.1f}")
print(f"Distortion: k1={dist[0,0]:.5f} k2={dist[0,1]:.5f} p1={dist[0,2]:.5f}")

# Pre-compute optimal undistortion map (do once, apply each frame at ~1ms)
newK, roi = cv2.getOptimalNewCameraMatrix(K, dist, (W, H), alpha=0)
mapx, mapy = cv2.initUndistortRectifyMap(K, dist, None, newK, (W, H), cv2.CV_32FC1)
undistorted = cv2.remap(frame, mapx, mapy, cv2.INTER_LINEAR)  # in SLAM loop</code></pre>
</details>
        </div>
    </div>

    <h4>Rolling Shutter vs. Global Shutter</h4>
    <p>Most consumer CMOS sensors use a <strong>rolling shutter</strong> — each row is exposed sequentially over ~33ms per frame. A drone moving at 5 m/s travels 16cm during one full exposure, causing different rows to capture the scene at different instants. This creates geometric distortions — called <em>rolling shutter wobble</em> — that break the static-scene assumption of SLAM feature tracking. Production SLAM hardware uses <strong>global shutter cameras</strong> (all pixels exposed simultaneously). Key global shutter options for drones: FLIR Blackfly S (Sony IMX264), OV9281 (96fps, 1MP, used in ORB-SLAM demo setups), and the Prophesee Metavision event camera (no shutter — asynchronous per-pixel events at µs timing resolution, immune to motion blur by design).</p>

    <h3>11.2 Feature Detection and Description</h3>
    <p>SLAM frontends track salient image regions across frames. The two-step process — (1) <em>detection</em>: find repeatable locations, and (2) <em>description</em>: encode a compact invariant signature for matching — determines the entire system's robustness, speed, and accuracy.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Feature Detector/Descriptor Comparison</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-slate-300 mt-2">
                <thead><tr class="text-sky-400 border-b border-slate-700">
                    <th class="text-left py-1 pr-3">Algorithm</th>
                    <th class="text-left py-1 pr-3">Scale-Inv</th>
                    <th class="text-left py-1 pr-3">Rot-Inv</th>
                    <th class="text-left py-1 pr-3">CPU Speed</th>
                    <th class="text-left py-1 pr-3">Descriptor</th>
                    <th class="text-left py-1">Primary SLAM Use</th>
                </tr></thead>
                <tbody>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-amber-400">ORB</td><td class="py-1 pr-3 text-green-400">Yes (pyramid)</td><td class="py-1 pr-3 text-green-400">Yes (centroid)</td><td class="py-1 pr-3 text-green-400">~5ms (VGA)</td><td class="py-1 pr-3">256-bit binary</td><td class="py-1">ORB-SLAM3, standard real-time SLAM — patent-free, Hamming match</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-sky-400">FAST</td><td class="py-1 pr-3 text-red-400">No</td><td class="py-1 pr-3 text-red-400">No</td><td class="py-1 pr-3 text-green-400">&lt;1ms (VGA)</td><td class="py-1 pr-3">None (detector only)</td><td class="py-1">VIO frontend — raw detection speed; paired with LK optical flow</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-sky-400">SIFT</td><td class="py-1 pr-3 text-green-400">Yes (DoG)</td><td class="py-1 pr-3 text-green-400">Yes (gradient hist)</td><td class="py-1 pr-3 text-red-400">~80ms (VGA)</td><td class="py-1 pr-3">128-float vector</td><td class="py-1">Offline mapping, loop closure query. Patent expired 2020 — now free.</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-emerald-400">SuperPoint</td><td class="py-1 pr-3 text-green-400">Yes (learned)</td><td class="py-1 pr-3 text-green-400">Yes (learned)</td><td class="py-1 pr-3 text-amber-400">~12ms (GPU)</td><td class="py-1 pr-3">256-float vector</td><td class="py-1">Learned feature SLAM; excels on textureless/nighttime scenes</td></tr>
                    <tr><td class="py-1 pr-3 font-mono text-slate-400">Harris/Shi-Tomasi</td><td class="py-1 pr-3 text-red-400">No</td><td class="py-1 pr-3 text-amber-400">Partial</td><td class="py-1 pr-3 text-green-400">~3ms (VGA)</td><td class="py-1 pr-3">None (detector only)</td><td class="py-1">Shi-Tomasi used in Lucas-Kanade optical flow frontend (cv2.goodFeaturesToTrack)</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <h4>ORB: Oriented FAST and Rotated BRIEF — Full Algorithm</h4>
    <p>ORB (Rublee et al., ICCV 2011) is the dominant descriptor in real-time drone SLAM. Binary descriptors enable XOR+popcount matching — one CPU instruction per 64 bits. No GPU required. Patent-free. Used in ORB-SLAM3 exclusively.</p>

    <div class="insight-box">
        <div class="insight-label">ORB DESCRIPTOR PIPELINE</div>
        <p class="text-slate-200 text-sm mt-1">ORB detects scale-invariant corners using a Gaussian pyramid, assigns rotation invariance via the intensity centroid, then encodes each keypoint as a 256-bit binary string — enabling XOR-based matching in a single CPU instruction per 64 bits. Its patent-free status and near-GPU speed make it the dominant descriptor in drone SLAM.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Step 1 — Gaussian scale pyramid (L=8 levels, scale factor s=1.2):<br>
  Build 8 downsampled versions of the input image<br>
  Detect features at each level: achieves scale invariance without expensive DoG<br>
  Total features distributed across levels: ~1000 per image, ~125/level<br>
  Features at level l correspond to scale s^l in the original image<br><br>
Step 2 — FAST-9 corner detection at each pyramid level:<br>
  For candidate pixel p, sample 16 pixels on a Bresenham circle of radius r=3<br>
  p is a keypoint if ≥9 CONTIGUOUS circle pixels are ALL brighter than I(p)+t<br>
  OR all darker than I(p)-t, where t=20 (intensity threshold)<br>
  Apply Harris score to rank: score = det(M) - k*trace(M)^2, k=0.04<br>
  M = sum over patch of: [Ix^2, Ix*Iy; Ix*Iy, Iy^2] (structure tensor)<br>
  Non-maximum suppression: keep top-N per image quadrant for uniform coverage<br><br>
Step 3 — Orientation assignment (rotation invariance via intensity centroid):<br>
  For patch centered on keypoint, compute image moments:<br>
  m_10 = sum_{x,y in patch} x * I(x,y)<br>
  m_01 = sum_{x,y in patch} y * I(x,y)<br>
  m_00 = sum_{x,y in patch} I(x,y)<br>
  Centroid: C = (m_10/m_00, m_01/m_00)<br>
  Keypoint orientation: theta = atan2(m_01, m_10)<br><br>
Step 4 — rBRIEF descriptor (256-bit binary string):<br>
  Pre-learned set of 256 pixel pair tests {(p_i, q_i)} — chosen to be<br>
  de-correlated and high-variance via offline greedy search<br>
  Each test bit: b_k = 1 if I(p_i) &lt; I(q_i)  else  0<br>
  Pairs are ROTATED by theta (from Step 3) → steered descriptor<br>
  Result: 256-bit vector. Hamming distance: popcount(d1 XOR d2) in [0, 256]<br><br>
Matching: Lowe ratio test (rejects ambiguous matches):<br>
  For descriptor d, find nearest n1 and second-nearest n2<br>
  Accept match only if: hamming(d, n1) / hamming(d, n2) &lt; 0.75<br>
  This rejects 90% of false matches while keeping 95% of true matches
    </div>
</details>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-4">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: ORB Detection, Matching, and RANSAC Filtering</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import cv2
import numpy as np

orb = cv2.ORB_create(nfeatures=1000, scaleFactor=1.2, nlevels=8,
                      edgeThreshold=31, patchSize=31, fastThreshold=20)

img1 = cv2.imread("frame_001.jpg", cv2.IMREAD_GRAYSCALE)
img2 = cv2.imread("frame_002.jpg", cv2.IMREAD_GRAYSCALE)

kp1, desc1 = orb.detectAndCompute(img1, None)
kp2, desc2 = orb.detectAndCompute(img2, None)

# Brute-force Hamming matching with kNN (k=2 for ratio test)
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
raw = bf.knnMatch(desc1, desc2, k=2)

# Lowe ratio test: keep unambiguous matches
good = [m for m, n in raw if m.distance / n.distance &lt; 0.75]

# Extract matched pixel coordinates (Nx2 float arrays)
pts1 = np.float32([kp1[m.queryIdx].pt for m in good])
pts2 = np.float32([kp2[m.trainIdx].pt for m in good])

# RANSAC geometric verification with 5-point algorithm (Essential matrix)
# K from prior calibration
K = np.array([[640, 0, 640], [0, 640, 360], [0, 0, 1]], dtype=np.float32)
E, mask = cv2.findEssentialMat(pts1, pts2, K, method=cv2.RANSAC, prob=0.999, threshold=1.0)
inliers1 = pts1[mask.ravel() == 1]
inliers2 = pts2[mask.ravel() == 1]
print(f"Matches: {len(good)} raw → {inliers1.shape[0]} RANSAC inliers")</code></pre>
</details>
        </div>
    </div>

    <h3>11.3 Optical Flow</h3>
    <p>Optical flow computes the apparent pixel motion between consecutive frames. Unlike feature matching, it tracks pixels <em>continuously frame-to-frame</em> — faster and more suitable for short-baseline VIO frontends. The Lucas-Kanade algorithm is the workhorse of most VIO systems.</p>

    <h4>Lucas-Kanade Sparse Flow: Full Derivation</h4>

    <div class="insight-box">
        <div class="insight-label">LUCAS-KANADE FLOW</div>
        <p class="text-slate-200 text-sm mt-1">LK solves for 2D pixel motion by assuming all pixels in a small window share the same velocity, turning an underdetermined per-pixel constraint into an overdetermined least-squares system. The invertibility of the resulting structure tensor directly predicts which pixels are trackable — corners yes, flat regions no.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Brightness Constancy Assumption:<br>
  I(x, y, t) = I(x + u*dt, y + v*dt, t + dt)<br>
  "A pixel's intensity doesn't change as it moves — it just translates"<br><br>
First-order Taylor expansion (assuming small motion u*dt, v*dt &lt;&lt; 1):<br>
  I(x,y,t) ≈ I(x,y,t) + I_x*u*dt + I_y*v*dt + I_t*dt<br>
  → I_x*u + I_y*v + I_t = 0   [Optical Flow Constraint Equation (OFCE)]<br><br>
where I_x = ∂I/∂x, I_y = ∂I/∂y (spatial gradients from Sobel filter)<br>
      I_t = I(t) - I(t-dt) (temporal difference)<br><br>
The OFCE is ONE equation with TWO unknowns (u, v) — the aperture problem.<br>
A single pixel can only determine the component of motion perpendicular to its edge.<br><br>
Lucas-Kanade: assume ALL N pixels in a window W move with the SAME (u, v):<br><br>
A * [u, v]^T = b    (over-determined: N equations, 2 unknowns)<br><br>
A = [I_x(p1), I_y(p1)]  b = [-I_t(p1)]<br>
    [I_x(p2), I_y(p2)]      [-I_t(p2)]<br>
    [   ...  ,   ...  ]      [  ...   ]<br><br>
Least squares solution: (A^T * A) * [u, v]^T = A^T * b<br><br>
M = A^T * A = [ sum(Ix^2),    sum(Ix*Iy) ]  ← "structure tensor" (Harris matrix)<br>
              [ sum(Ix*Iy),   sum(Iy^2)  ]<br><br>
[u, v]^T = M^(-1) * A^T * b<br><br>
TRACKABILITY condition: M must be well-conditioned.<br>
Both eigenvalues λ1, λ2 of M must be large → Harris/Shi-Tomasi corner condition<br>
  λ1 ≈ λ2 &gt;&gt; 0: corner — trackable in all directions<br>
  λ1 &gt;&gt; λ2 ≈ 0: edge — only trackable perpendicular to the edge<br>
  λ1 ≈ λ2 ≈ 0: flat region — not trackable<br><br>
Pyramidal LK: run at 4 resolution levels (OpenCV default: winSize=21, maxLevel=3)<br>
Each coarser level estimates large displacements; finer levels refine.<br>
Handles up to ~1/4 image width displacement per frame before losing track.
    </div>
</details>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-4">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: Continuous Shi-Tomasi + Lucas-Kanade Tracking Loop (VIO Frontend Pattern)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import cv2
import numpy as np

shi_params = dict(maxCorners=300, qualityLevel=0.01, minDistance=10, blockSize=7)
lk_params  = dict(winSize=(21, 21), maxLevel=3,
                  criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))

MIN_FEATURES = 150  # Re-detect when tracked count drops below this

cap = cv2.VideoCapture(0)
ret, frame = cap.read()
prev_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
prev_pts  = cv2.goodFeaturesToTrack(prev_gray, mask=None, **shi_params)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    curr_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Track: move prev_pts from prev_gray into curr_gray
    curr_pts, status, err = cv2.calcOpticalFlowPyrLK(
        prev_gray, curr_gray, prev_pts, None, **lk_params)

    good_prev = prev_pts[status == 1]   # successfully tracked source points
    good_curr = curr_pts[status == 1]   # their new positions

    # Re-detect if too few features remain
    if good_curr.shape[0] &lt; MIN_FEATURES:
        new_pts = cv2.goodFeaturesToTrack(curr_gray, mask=None, **shi_params)
        prev_pts = new_pts
    else:
        # Estimate essential matrix from tracked correspondences
        K = np.array([[640, 0, 640], [0, 640, 360], [0, 0, 1]], dtype=np.float32)
        E, mask = cv2.findEssentialMat(good_prev, good_curr, K,
                                        method=cv2.RANSAC, threshold=1.0)
        _, R, t, _ = cv2.recoverPose(E, good_prev, good_curr, K)
        prev_pts = good_curr.reshape(-1, 1, 2)

    prev_gray = curr_gray.copy()</code></pre>
</details>
        </div>
    </div>

    <h4>RAFT: Learning-Based Dense Optical Flow (2020)</h4>
    <p>RAFT (Recurrent All-Pairs Field Transforms, Teed &amp; Deng, ECCV 2020) applies a convolutional feature encoder to both frames, computes a 4D all-pairs correlation volume (all feature-to-feature dot products at all pixel pairs), and iteratively refines a dense flow field with a ConvGRU recurrent unit. RAFT achieves ~1px EPE on the Sintel benchmark, 2–3× better than Lucas-Kanade. RAFT-Small runs at ~25fps on a Jetson Orin NX and is the foundation of DROID-SLAM (Section 11.9). For standard VIO frontends at 30Hz, pyramidal LK remains the CPU-efficient choice; RAFT is used in higher-compute architectures.</p>

    <h3>11.4 Epipolar Geometry and Stereo Vision</h3>
    <p>When the same scene is observed from two camera positions, the geometry of the two views constrains where corresponding points can appear. This <em>epipolar constraint</em> reduces a 2D matching search to a 1D line — reducing computation 10–100× and the false match rate proportionally.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Essential and Fundamental Matrices: Full Derivation</h4>
        <div class="insight-box">
            <div class="insight-label">EPIPOLAR GEOMETRY</div>
            <p class="text-slate-200 text-sm mt-1">The Essential and Fundamental matrices encode the rigid geometry between two camera views, constraining where a corresponding point must lie to a single epipolar line — collapsing a 2D matching search into a 1D one and enabling robust pose recovery from as few as five point pairs.</p>
        </div>
        <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Camera 1 at pose [I | 0] (world origin), Camera 2 at pose [R | t].<br>
A 3D point P seen at p1 in image 1 and p2 in image 2.<br><br>
In Camera 1 frame: x1 = K1^(-1) * p1  (normalized bearing vector)<br>
In Camera 2 frame: x2 = K2^(-1) * p2<br><br>
The coplanarity constraint (three vectors must be coplanar: x1, t, R*x2):<br>
x1^T * (t × R*x2) = 0<br>
x1^T * [t]_x * R * x2 = 0<br><br>
Essential Matrix E = [t]_x * R   (3×3, rank 2)<br><br>
[t]_x = [  0,  -t_z,  t_y ]   (skew-symmetric matrix of translation t)<br>
        [ t_z,   0,  -t_x ]<br>
        [-t_y,  t_x,   0  ]<br><br>
Epipolar constraint in normalized coords:  x2^T * E * x1 = 0<br>
In pixel coords (substitute x = K^(-1) * p):<br>
p2^T * K2^(-T) * E * K1^(-1) * p1 = 0<br>
p2^T * F * p1 = 0   where F = K2^(-T) * E * K1^(-1)   [Fundamental Matrix F]<br><br>
Key properties:<br>
  E has 5 DOF (R has 3, t has 2 in direction — scale lost)<br>
  F has 7 DOF (8 entries minus scale minus rank-2 constraint)<br>
  Both are singular: det(E) = 0, det(F) = 0<br><br>
Epipolar line in image 2 for a point p1 in image 1:<br>
  l2 = F * p1   (3-vector defining a line: a*u + b*v + c = 0)<br>
  Point p2 must lie ON this line → reduces match search from 2D to 1D<br><br>
Recovering R and t from E (4 solutions → disambiguate with chirality test):<br>
SVD: E = U * diag(1, 1, 0) * V^T<br>
W = [0, -1, 0; 1, 0, 0; 0, 0, 1]<br>
Solution set: (R, t) ∈ {(U*W*V^T, u3), (U*W*V^T, -u3), (U*W^T*V^T, u3), (U*W^T*V^T, -u3)}<br>
Chirality: the correct (R, t) is the one where reconstructed 3D points<br>
are in FRONT of both cameras (positive Z in both camera frames)
        </div>
</details>
    </div>

    <h4>RANSAC: Robust Estimation Under Outliers</h4>
    <p>Feature matches always contain outliers (mismatches). RANSAC (Random Sample Consensus, Fischler &amp; Bolles, 1981) finds the largest inlier subset consistent with a geometric model by repeated random sampling.</p>

    <div class="insight-box">
        <div class="insight-label">RANSAC SAMPLE COUNT</div>
        <p class="text-slate-200 text-sm mt-1">The required number of RANSAC iterations grows exponentially with the outlier fraction — using the 5-point algorithm instead of the 8-point algorithm reduces iterations by roughly 8x at 50% outliers, which is why the Nister solver became standard for real-time SLAM.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
RANSAC iterations for desired success probability p = 0.99:<br><br>
N = log(1 - p) / log(1 - (1 - ε)^s)<br><br>
ε = fraction of outliers, s = minimum sample size for model<br><br>
Concrete examples:<br>
  ε=50%, s=5 (5-point Essential): N = log(0.01)/log(1 - 0.5^5) ≈ 146 iterations<br>
  ε=50%, s=8 (8-point Essential): N = log(0.01)/log(1 - 0.5^8) ≈ 1,176 iterations<br>
  ε=70%, s=5:                     N = log(0.01)/log(1 - 0.3^5) ≈ 1,892 iterations<br><br>
The 5-point algorithm (Nister, 2004) is preferred precisely because s=5 instead of 8<br>
→ 8× fewer iterations at 50% outlier rate → faster and more practical in real-time SLAM<br><br>
Inlier test (symmetric epipolar distance):<br>
  For match (p1, p2) and hypothesis F:<br>
  d(p2, F*p1)^2 + d(p1, F^T*p2)^2 &lt; threshold^2<br>
  where d(p, l) = (l^T * p)^2 / (l1^2 + l2^2)  [point-to-line distance]<br>
  Threshold: typically 1.0 pixel (RANSAC) or 0.45 pixel (Sampson distance, tighter)
    </div>
</details>

    <h3>11.5 Visual Odometry Architecture</h3>
    <p>Visual Odometry (VO) estimates the camera trajectory by tracking features between consecutive frames — no persistent global map. Drift accumulates; loop closure (Section 11.8) corrects it. The standard pipeline has two phases with different geometric solvers.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">VO Pipeline Phases</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 block mb-2">Phase 1: Map Initialization (2D–2D)</strong>
                <p class="text-slate-300">On startup, no 3D map exists. Solve for relative pose from pixel correspondences only. Use the Essential matrix (calibrated) or Fundamental matrix (uncalibrated) with 5-point RANSAC. Decompose E → (R, t) via SVD. Disambiguate using chirality test. Triangulate 3D landmarks from inlier correspondences: p = (A^T A)^(-1) A^T b using DLT or optimal triangulation. Scale is ARBITRARY for monocular — normalized to ||t||=1. For stereo: scale is metric immediately.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 block mb-2">Phase 2: Tracking (2D–3D PnP)</strong>
                <p class="text-slate-300">Once a 3D map is initialized, each new frame is localized against map points using Perspective-n-Point (PnP). Given N correspondences {P_i (3D), p_i (2D pixel)}, find pose [R|t] minimizing sum of reprojection errors. EPnP (Lepetit 2009) solves in O(N) using 4 control points. RANSAC+EPnP handles 40–60% outliers. Refine with Gauss-Newton Bundle Adjustment over the 5 most recent frames (windowed BA). Typical: ~5ms per frame on Cortex-A78.</p>
            </div>
        </div>
    </div>

    <h4>The Scale Ambiguity Problem (Monocular VO)</h4>
    <p>A monocular camera fundamentally cannot recover absolute metric scale — a scene doubled in size and filmed from twice as far produces identical images. All trajectory estimates are in an arbitrary unit. Solutions used in production drones:</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">IMU Fusion (Best)</h4>
            <p class="text-slate-300 text-xs">IMU provides metric acceleration. VIO initialization (Section 11.6) jointly solves for scale s, gravity direction g, velocity v_0, and biases. After ~10s of dynamic motion: scale converges to &lt;2% error. This is why drone VIO requires an intentional maneuver (figure-8 or similar) at startup.</p>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Known Marker / Object</h4>
            <p class="text-slate-300 text-xs">AprilTag or ArUco marker with known physical size provides a scale reference via PnP. Scale is valid only while the marker is visible. Used for precision landing approaches — marker seen at 2m altitude gives metric scale for the final descent phase.</p>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-slate-400 text-sm">Baro / Rangefinder</h4>
            <p class="text-slate-300 text-xs">Barometer or downward rangefinder provides Z-axis metric scale. Horizontal scale still drifts. Used in ArduPilot optical flow mode — gives bounded altitude in GPS-denied flight at the cost of unbounded horizontal position error over time.</p>
        </div>
    </div>

    <h4>The PnP Problem: Localizing Against a 3D Map</h4>

    <div class="insight-box">
        <div class="insight-label">PNP POSE RECOVERY</div>
        <p class="text-slate-200 text-sm mt-1">PnP localizes a camera against a known 3D map by minimizing reprojection error — how far each predicted landmark pixel deviates from where it is actually observed. EPnP solves this in linear time using virtual control points, then Gauss-Newton refinement converges to sub-pixel RMSE in 3–5 iterations.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
PnP Cost Function (minimize reprojection error):<br><br>
F(R, t) = sum_{i=1}^{N} || p_i - pi(K * (R * P_i + t)) ||^2<br><br>
where pi([x,y,z]) = [x/z, y/z]  (perspective division)<br>
      p_i = observed 2D pixel position<br>
      P_i = known 3D map point position<br><br>
EPnP (Lepetit 2009): O(N) solver using 4 virtual control points c_j<br>
  Express world points as weighted combination: P_i = sum_j alpha_ij * c_j<br>
  Weights alpha_ij computed once (barycentric coordinates, independent of pose)<br>
  Solve for c_j positions in camera frame via null-space of a 12×12 matrix<br>
  Direct, no iteration needed for initial estimate<br><br>
Gauss-Newton refinement (run after EPnP for better accuracy):<br>
  Linearize around current estimate (R_k, t_k):<br>
  delta = -(J^T * J)^(-1) * J^T * e    (normal equations)<br>
  J = Jacobian of reprojection error w.r.t. [rotation, translation] (2N × 6)<br>
  Update pose: R_{k+1}, t_{k+1} from delta via Lie algebra exponential map<br>
  Converges in 3–5 iterations, typical final RMSE: 0.5–2.0 pixels
    </div>
</details>

    <h3>11.6 Visual-Inertial Odometry (VIO)</h3>
    <p>VIO fuses camera and IMU measurements to recover metric-scale motion with bounded drift — more accurate than camera-only VO, more robust than IMU-only dead reckoning. It is the dominant GPS-denied localization method for modern autonomous drones.</p>

    <h4>IMU Noise Model</h4>

    <div class="insight-box">
        <div class="insight-label">IMU NOISE MODEL</div>
        <p class="text-slate-200 text-sm mt-1">MEMS IMU errors come from two sources: additive white noise (washed out by averaging) and a slowly drifting bias (grows as t^2 and eventually dominates). Characterizing both with Allan variance parameters is a prerequisite for VIO initialization and determines how long the drone can dead-reckon before position error becomes unacceptable.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
IMU Measurement Model (stochastic differential equations):<br><br>
Accelerometer:  a_meas(t) = R^T * (a_world(t) - g) + b_a(t) + n_a(t)<br>
Gyroscope:      ω_meas(t) = ω_body(t) + b_g(t) + n_g(t)<br><br>
Where:<br>
  R      = rotation body→world (current attitude)<br>
  g      = [0, 0, -9.81] m/s^2 (gravity in world frame, NED: [0,0,9.81])<br>
  b_a    = accelerometer bias (random walk): db_a/dt = n_ba, n_ba ~ N(0, σ_ba^2 * I)<br>
  b_g    = gyroscope bias (random walk):    db_g/dt = n_bg, n_bg ~ N(0, σ_bg^2 * I)<br>
  n_a    = additive white noise: n_a ~ N(0, σ_a^2 * I)<br>
  n_g    = additive white noise: n_g ~ N(0, σ_g^2 * I)<br><br>
Typical MEMS IMU parameters (e.g., BMI088 in Pixhawk 6C, ICM-42688-P in ArduPilot FCs):<br>
  σ_a  = 0.01  m/s^2 / √Hz    (accelerometer noise density)<br>
  σ_ba = 0.001 m/s^2 / √Hz    (accelerometer random walk — bias drift rate)<br>
  σ_g  = 0.001 rad/s / √Hz    (gyroscope noise density)<br>
  σ_bg = 1e-5  rad/s / √Hz    (gyroscope random walk — lower for MEMS)<br><br>
Position error from pure IMU integration (see Module 9, Section 9.1):<br>
  σ_p(t) ≈ σ_a * t^(3/2) / √3     (white noise contribution)<br>
  σ_p_bias(t) ≈ (1/2) * σ_ba * t^2  (bias drift — grows as t^2, dominant after ~30s)
    </div>
</details>

    <h4>IMU Preintegration on Manifold (Forster et al., 2015/2017)</h4>
    <p>Naive IMU integration must be repeated every time the linearization point (bias estimate) changes during optimization. Preintegration avoids this by defining relative motion quantities that are INDEPENDENT of the absolute state at time i.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">Preintegration Theory</h4>
        <div class="insight-box">
            <div class="insight-label">IMU PREINTEGRATION</div>
            <p class="text-slate-200 text-sm mt-1">Preintegration accumulates IMU readings into relative rotation, velocity, and position deltas that are computed once and reused across optimization iterations regardless of the current bias estimate — avoiding expensive re-integration and making real-time VIO viable on embedded processors.</p>
        </div>
        <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Between camera frames i and j (K IMU readings at times t_k, k=i..j-1, dt = 1/400 s):<br><br>
Naive integration in world frame (must be redone when bias changes):<br>
  R_j = R_i * product_k Exp((ω_k - b_g) * dt)<br>
  v_j = v_i + g*(t_j-t_i) + sum_k R_k * (a_k - b_a) * dt<br>
  p_j = p_i + sum_k [v_k*dt + 0.5*R_k*(a_k-b_a)*dt^2] + 0.5*g*(t_j-t_i)^2<br><br>
Preintegration: define Delta quantities in FRAME i coordinates<br>
(these depend ONLY on IMU readings, not on the world-frame state at i):<br><br>
ΔR_ij = product_k Exp((ω_k - b_g) * dt)                        [rotation delta]<br>
Δv_ij = sum_k ΔR_ik * (a_k - b_a) * dt                         [velocity delta]<br>
Δp_ij = sum_k [Δv_ik*dt + 0.5*ΔR_ik*(a_k-b_a)*dt^2]           [position delta]<br><br>
These relate to the absolute states by:<br>
  R_j = R_i * ΔR_ij<br>
  v_j = v_i + g*(t_j-t_i) + R_i * Δv_ij<br>
  p_j = p_i + v_i*(t_j-t_i) + 0.5*g*(t_j-t_i)^2 + R_i * Δp_ij<br><br>
When bias changes by δb_g during optimization, apply FIRST-ORDER correction<br>
instead of re-integrating all K IMU steps (major computational saving):<br>
  ΔR_ij(b_g + δb_g) ≈ ΔR_ij(b_g) * Exp(J^ΔR_bg * δb_g)<br>
  Δv_ij(b + δb) ≈ Δv_ij(b) + J^Δv_ba*δb_a + J^Δv_bg*δb_g<br>
  Δp_ij(b + δb) ≈ Δp_ij(b) + J^Δp_ba*δb_a + J^Δp_bg*δb_g<br><br>
Jacobians J are computed analytically during the forward integration pass.<br>
Noise covariance Σ_ij (9×9 matrix) is propagated via:<br>
  Σ_{k+1} = A_k * Σ_k * A_k^T + B_k * Q * B_k^T<br>
  (Q = block-diag(σ_a^2*I, σ_g^2*I, σ_ba^2*I, σ_bg^2*I) IMU noise covariance)
        </div>
</details>
    </div>

    <h4>VIO Optimization: The Sliding Window Estimator</h4>
    <p>The sliding window optimizer maintains the last K keyframes, their 3D landmarks, and IMU preintegration factors. At each new keyframe it minimizes the total negative log-likelihood (Maximum A Posteriori estimation):</p>

    <div class="insight-box">
        <div class="insight-label">VIO SLIDING WINDOW</div>
        <p class="text-slate-200 text-sm mt-1">The VIO cost function jointly minimizes visual reprojection errors, IMU preintegration residuals, and a marginalization prior — the last term preserves information from removed keyframes without re-processing old data. Schur complement elimination of landmarks makes the remaining sparse pose system solvable in 10–20 ms per keyframe.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Full VIO Cost Function:<br><br>
F(x) = sum over visual factors     || r_vision_ij ||^2_{Σ_ij}<br>
      + sum over IMU factors        || r_imu_ij   ||^2_{Σ_imu_ij}<br>
      + || r_prior ||^2_{Σ_prior}   (Schur-complement prior from marginalization)<br><br>
Visual residual (reprojection error per 3D landmark l, camera j):<br>
r_vision_lj = p_lj_obs - pi(K * (R_j^T * (P_l - t_j)))<br>
  p_lj_obs = observed pixel position of landmark l in frame j<br><br>
IMU residual between frames i and j:<br>
r_imu_ij = [log(ΔR_ij^T * R_i^T * R_j)           ]  (rotation residual, 3D)<br>
           [R_i^T*(v_j - v_i - g*dt_ij) - Δv_ij   ]  (velocity residual, 3D)<br>
           [R_i^T*(p_j-p_i-v_i*dt_ij-0.5*g*dt_ij^2)-Δp_ij] (position, 3D)<br>
           [b_a_j - b_a_i], [b_g_j - b_g_i]           (bias continuity, 3+3D)<br><br>
Solver: Gauss-Newton or Levenberg-Marquardt with Schur complement<br>
  Schur complement eliminates landmarks analytically (they are dense columns)<br>
  Reduces solve to camera-pose-only system (sparse, efficient)<br>
  Solved with CHOLMOD sparse Cholesky or custom band-Cholesky<br>
  Typical: 10–20ms per keyframe on Jetson Orin NX 16GB
    </div>
</details>

    <h4>Filter-Based Alternative: MSCKF</h4>
    <p>The Multi-State Constraint Kalman Filter (Mourikis &amp; Roumeliotis, ICRA 2007) maintains camera poses in the EKF state vector and analytically marginalizes features, creating <em>measurement constraints between poses</em> without estimating feature positions explicitly. MSCKF runs at 100Hz on ARM Cortex-A55, making it suitable for microcontroller-class compute budgets. OpenVINS is the leading open-source MSCKF implementation for drones.</p>

    <h3>11.7 Production Visual SLAM Systems</h3>
    <p>Several mature open-source SLAM systems are available. The right choice depends on sensors, compute, accuracy requirements, and whether a persistent map is needed.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-white">Production Visual SLAM System Comparison (2025)</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-slate-300 mt-2">
                <thead><tr class="text-sky-400 border-b border-slate-700">
                    <th class="text-left py-1 pr-3">System</th>
                    <th class="text-left py-1 pr-3">Method</th>
                    <th class="text-left py-1 pr-3">Sensors</th>
                    <th class="text-left py-1 pr-3">Loop Closure</th>
                    <th class="text-left py-1 pr-3">Map</th>
                    <th class="text-left py-1 pr-3">License</th>
                    <th class="text-left py-1">Best For</th>
                </tr></thead>
                <tbody>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-amber-400">ORB-SLAM3</td><td class="py-1 pr-3">Opt window</td><td class="py-1 pr-3">Mono/Stereo/RGBD+IMU</td><td class="py-1 pr-3 text-green-400">DBoW2</td><td class="py-1 pr-3">Sparse 3D</td><td class="py-1 pr-3">GPLv3</td><td class="py-1">Best published accuracy + multi-session. Research gold standard.</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-sky-400">OpenVINS</td><td class="py-1 pr-3">MSCKF filter</td><td class="py-1 pr-3">Mono/Stereo+IMU</td><td class="py-1 pr-3 text-red-400">No</td><td class="py-1 pr-3">None</td><td class="py-1 pr-3">GPLv3</td><td class="py-1">Best CPU efficiency, ROS2-native. Ideal for power-constrained drones.</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-emerald-400">VINS-Fusion</td><td class="py-1 pr-3">Opt window</td><td class="py-1 pr-3">Multi-cam+IMU+GPS/UWB</td><td class="py-1 pr-3 text-green-400">DBoW2</td><td class="py-1 pr-3">Sparse 3D</td><td class="py-1 pr-3">GPLv3</td><td class="py-1">Multi-camera + absolute sensor fusion. GPS/UWB integration built-in.</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-rose-400">Kimera</td><td class="py-1 pr-3">MSCKF+graph</td><td class="py-1 pr-3">Stereo+IMU</td><td class="py-1 pr-3 text-green-400">LCD descriptor</td><td class="py-1 pr-3">3D mesh+semantic</td><td class="py-1 pr-3">BSD</td><td class="py-1">Semantic 3D mesh — labels objects in map. MIT spinout, active dev.</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-purple-400">RTAB-Map</td><td class="py-1 pr-3">Graph SLAM</td><td class="py-1 pr-3">RGBD/Stereo/LiDAR</td><td class="py-1 pr-3 text-green-400">BoW (SURF/ORB)</td><td class="py-1 pr-3">OctoMap/mesh</td><td class="py-1 pr-3">BSD</td><td class="py-1">Dense 3D maps + memory management for large areas. Multi-sensor.</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-cyan-400">LIO-SAM</td><td class="py-1 pr-3">Factor graph</td><td class="py-1 pr-3">LiDAR+IMU+GPS</td><td class="py-1 pr-3 text-green-400">ICP keyframes</td><td class="py-1 pr-3">Point cloud</td><td class="py-1 pr-3">BSD</td><td class="py-1">Outdoor LiDAR-inertial SLAM. Best for large-area drone mapping.</td></tr>
                    <tr><td class="py-1 pr-3 font-mono text-yellow-400">cuVSLAM</td><td class="py-1 pr-3">GPU opt (VIO)</td><td class="py-1 pr-3">Stereo+IMU (1–4 cams)</td><td class="py-1 pr-3 text-green-400">Yes (&gt;1 km)</td><td class="py-1 pr-3">Sparse 3D</td><td class="py-1 pr-3">NVIDIA (free binary)</td><td class="py-1">Production Jetson deployment. 60 Hz on Orin NX. Isaac ROS native.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <h4>ORB-SLAM3: Three-Thread Architecture</h4>
    <p>ORB-SLAM3 (Campos et al., IEEE T-RO 2021) is the current benchmark standard for feature-based SLAM. Three parallel threads divide the work across tracking frequency, map refinement, and global consistency.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-white">ORB-SLAM3 Thread Pipeline</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900 p-4 rounded border-l-4 border-sky-500">
                <strong class="text-sky-400 uppercase tracking-widest block mb-2">Thread 1: Tracking (30Hz)</strong>
                <p class="text-slate-300 mb-2">Every input frame: detect ORB features → match to current local map via EPnP+RANSAC → compute pose. Keyframe decision: create keyframe if &gt;20% of tracked points are new or tracking quality drops. Triggers relocalization (DBoW2 query) if tracking fails. Must complete in &lt;33ms.</p>
                <p class="text-slate-400">Output: camera pose for every frame. Input to Thread 2 when new keyframe selected.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                <strong class="text-emerald-400 uppercase tracking-widest block mb-2">Thread 2: Local Mapping (async)</strong>
                <p class="text-slate-300 mb-2">Per new keyframe: triangulate new 3D landmarks from multi-view correspondences. Local Bundle Adjustment over last 10 keyframes + their visible landmarks — jointly minimizes reprojection error. Culls redundant keyframes (&gt;90% point visibility overlap) and landmarks (low parallax, high reprojection error).</p>
                <p class="text-slate-400">Compute: ~80ms per KF on Jetson Orin NX. Runs at KF rate, not frame rate.</p>
            </div>
            <div class="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
                <strong class="text-purple-400 uppercase tracking-widest block mb-2">Thread 3: Loop + Map Merge</strong>
                <p class="text-slate-300 mb-2">For each new KF: query DBoW2 place recognition database. If candidate found: geometric verification (guided feature matching + Sim3 RANSAC). On success: correct drift via Essential Graph optimization (lightweight pose graph). Trigger full Global Bundle Adjustment asynchronously. Multi-session: merge maps from separate flights.</p>
                <p class="text-slate-400">Runs opportunistically; does not block tracking thread.</p>
            </div>
        </div>
    </div>

    <h4>ORB-SLAM3 Inertial Initialization</h4>
    <p>Monocular-inertial mode must solve a joint initialization problem to recover metric scale. The drone must move dynamically — static initialization is unobservable (all IMU terms cancel).</p>
    <ol class="text-slate-300 text-sm space-y-2 list-decimal pl-6">
        <li><strong>Collect ~2s of data</strong> with sufficient motion (translation + rotation). Drone should perform a brief figure-eight or slight tilt to excite all axes.</li>
        <li><strong>Solve for unknowns</strong>: metric scale s, gravity direction g (in camera frame), initial velocity v_0, and IMU biases b_a, b_g — jointly as a Maximum Likelihood problem using preintegration factors + visual triangulation constraints.</li>
        <li><strong>Re-scale the map</strong>: multiply all 3D point positions and keyframe translations by the recovered scale s.</li>
        <li><strong>Switch to tight coupling</strong>: enable full IMU residuals in the sliding window optimizer. Scale is now metric and stabilized.</li>
        <li><strong>Re-initialization</strong> triggers automatically if tracking fails for &gt;2 seconds (e.g., after a fast rotation causing motion blur).</li>
    </ol>

    <h4>LIO-SAM: LiDAR-Inertial SLAM for Outdoor Drones</h4>
    <p>LIO-SAM (Shan et al., IROS 2020) uses a factor graph (GTSAM) to jointly optimize LiDAR odometry, IMU preintegration, loop closure, and GPS constraints. LiDAR scans are matched using scan-to-map ICP. It handles large-scale outdoor environments (1km+ trajectories) where visual SLAM degrades (sky, sun, textureless ground). The Livox Mid-360 + LIO-SAM pipeline is a standard approach for large-area drone mapping missions.</p>

    <h3>11.8 Loop Closure and Place Recognition</h3>
    <p>Without loop closure, trajectory drift accumulates proportionally to path length. A 1% drift rate produces 10m of error after 1km of flight. Loop closure detects when the drone revisits a known location and uses this constraint to globally redistribute accumulated error across the entire trajectory.</p>

    <h4>DBoW2: Bag of Words Place Recognition</h4>
    <p>DBoW2 (Galvez-López &amp; Tardós, IEEE T-RO 2012) represents each image as a sparse histogram over a pre-trained visual vocabulary. Place recognition becomes a vector similarity query — fast enough to check every new keyframe against the entire session history.</p>

    <div class="insight-box">
        <div class="insight-label">BAG-OF-WORDS RETRIEVAL</div>
        <p class="text-slate-200 text-sm mt-1">DBoW2 represents each camera frame as a sparse TF-IDF histogram over a million-word visual vocabulary, turning loop-closure detection into a vector similarity query that takes ~10 ms regardless of session length. A relative similarity threshold adapts automatically to repetitive scenes like corridors, cutting false positives that fool fixed thresholds.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Vocabulary Construction (offline — runs once, reused across deployments):<br><br>
1. Extract ORB descriptors from 1 million diverse training images<br>
2. Build hierarchical k-means tree: k=10 branches, L=6 levels<br>
   → k^L = 10^6 visual "words" (leaf nodes = cluster centers)<br>
3. Each descriptor quantized to its nearest visual word<br>
4. Word weights: w_i = IDF * TF (inverse document frequency × term frequency)<br>
   IDF_i = log(N / n_i)   [N=total training images, n_i=images containing word i]<br>
   TF = count of word i in current image / total words in current image<br><br>
Online image descriptor:<br>
v = sparse vector of (word_id, weight) pairs — typically 50-300 non-zero entries<br><br>
Similarity score (L1-norm, range [0,1]):<br>
s(v1, v2) = 1 - (1/2) * || v1/|v1|_1 - v2/|v2|_1 ||_1<br><br>
Loop detection threshold (relative to recent keyframe similarity):<br>
s_threshold = 0.75 * s(current_KF, last_consecutive_KF)<br>
Using relative threshold prevents false positives in visually repetitive<br>
environments (corridors, warehouses) — adapts to local scene appearance<br><br>
Geometric verification (after DBoW2 candidate detected):<br>
1. Guided feature matching between candidate and current KF using DBoW2 word grouping<br>
2. Compute Sim3 transform (similarity + rotation + translation, 7 DOF for mono)<br>
   or SE3 transform (6 DOF for stereo/inertial where scale is metric)<br>
3. RANSAC inlier test: accept if inliers &gt; 50 (prevents perceptual aliasing)<br><br>
Query time: ~10ms per keyframe for a 10,000-KF map (k-d tree traversal in vocab)
    </div>
</details>

    <h4>Deep Place Recognition: NetVLAD and HF-Net</h4>
    <p>Classical BoW struggles with large viewpoint changes (&gt;30° rotation) and lighting changes. Deep descriptors are more robust:</p>
    <ul class="text-slate-300 text-sm space-y-2">
        <li><strong>NetVLAD</strong> (Arandjelovic et al., CVPR 2016): CNN-based image descriptor producing a 4096-D global descriptor via differentiable VLAD pooling. Trained with a GPS-tagged street-view dataset using a triplet ranking loss. Outperforms DBoW2 by 20–40% on illumination-changed sequences (day vs. night). Cost: requires GPU inference, ~30ms per image on Jetson.</li>
        <li><strong>HF-Net</strong> (Sarlin et al., CVPR 2019): Hierarchical Localization using a single CNN that simultaneously predicts NetVLAD global descriptors (for place retrieval) + local SuperPoint features (for pose estimation). Enables coarse-to-fine localization: place retrieval retrieves top-K candidate database images, then feature matching refines to 6-DoF pose. State-of-the-art for large-scale visual localization (used in the Niantic localization system).</li>
    </ul>

    <h4>Pose Graph Optimization</h4>
    <p>After loop closure detection, the accumulated trajectory is modeled as a pose graph — keyframes as nodes, odometry and loop closure constraints as edges. Optimization finds the Maximum A Posteriori trajectory.</p>

    <div class="insight-box">
        <div class="insight-label">POSE GRAPH OPTIMIZATION</div>
        <p class="text-slate-200 text-sm mt-1">After loop closure is detected, accumulated trajectory drift is redistributed by solving for the MAP trajectory on SE(3) — a sparse least-squares problem because each keyframe only connects to a handful of neighbors. GTSAM's iSAM2 solver handles 50,000 keyframes in ~200 ms using incremental sparse Cholesky factorization.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Pose graph: nodes x = {T_1, T_2, ..., T_N}  (each T_i ∈ SE(3))<br>
Edges: (i, j, z_ij, Ω_ij) where z_ij = measured relative pose, Ω_ij = information matrix<br><br>
MAP cost function (minimize total squared Mahalanobis distance):<br><br>
F*(x) = (1/2) * sum_{(i,j) ∈ Edges} e_ij(x)^T * Ω_ij * e_ij(x)<br><br>
Residual in Lie algebra (6-vector, using the logarithm map on SE(3)):<br>
e_ij(x) = log(z_ij^(-1) * T_i^(-1) * T_j)   [SE(3) residual]<br><br>
Solved with:<br>
  g2o (Kümmerle et al., ICRA 2011) — general least-squares on manifolds<br>
  GTSAM (Dellaert, 2012) — factor graphs, iSAM2 incremental solver<br>
  Both use sparse Cholesky factorization — exploits sparsity (each KF<br>
  connected to ~10 neighbors, not all N → band-sparse linear system)<br><br>
Complexity: O(N * k^3) where k = average degree — roughly O(N) for sparse graphs<br>
Wall time: ~5ms for 1,000 KFs, ~200ms for 50,000 KFs (GTSAM on 4-core CPU)<br><br>
After pose graph optimization: recompute 3D landmark positions from<br>
optimized poses via triangulation or Bundle Adjustment (more expensive).<br>
ORB-SLAM3 runs full Global BA asynchronously after Essential Graph optimization.
    </div>
</details>

    <h3>11.9 Deep Learning Frontiers in Perception</h3>
    <p>Classical geometric SLAM excels in textured, static, well-lit environments. Deep learning extends capability to low-texture surfaces, dynamic scenes, night imagery, and produces richer maps with semantic understanding.</p>

    <h4>SuperPoint + LightGlue: Learned Feature Matching (2023 State-of-the-Art)</h4>
    <p>SuperPoint (DeTone et al., CVPR Workshops 2018) trains a Homographic Adaptation self-supervised pipeline: generate synthetic corner images → warp with random homographies → train the network to produce consistent detections and 256-D descriptors across the warps. LightGlue (Lindenberger et al., ICCV 2023) replaces the brute-force ratio test + RANSAC with an attention-based Graph Neural Network that learns to predict match confidence. On standard benchmarks (Hpatches, Megadepth), SuperPoint+LightGlue outperforms ORB+RANSAC by 15–35% in AUC@5° pose error — with especially large gains on textureless indoor scenes that defeat ORB entirely.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-4">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: SuperPoint + LightGlue Feature Matching (kornia / lightglue library)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">import torch
from lightglue import LightGlue, SuperPoint
from lightglue.utils import load_image, rbd

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load models (download weights on first run)
extractor = SuperPoint(max_num_keypoints=1024).eval().to(device)
matcher   = LightGlue(features="superpoint").eval().to(device)

img0 = load_image("frame_001.jpg").to(device)  # (1, 3, H, W), float [0,1]
img1 = load_image("frame_002.jpg").to(device)

# Extract features from each image independently
feats0 = extractor.extract(img0)  # dict: keypoints (1,N,2), descriptors (1,N,256), scores
feats1 = extractor.extract(img1)

# Match: GNN infers correspondence confidence between all N×M pairs
matches01 = matcher({"image0": feats0, "image1": feats1})
feats0, feats1, matches01 = [rbd(x) for x in [feats0, feats1, matches01]]

# Extract matched keypoints (no RANSAC needed — LightGlue filters internally)
kpts0 = feats0["keypoints"][matches01["matches"][:, 0]]  # (M, 2) matched kps in img0
kpts1 = feats1["keypoints"][matches01["matches"][:, 1]]  # (M, 2) matched kps in img1
scores = matches01["scores"]  # (M,) match confidence in [0, 1]

print(f"Matched {kpts0.shape[0]} pairs (RANSAC still recommended for pose estimation)")</code></pre>
</details>
        </div>
    </div>

    <h4>Monocular Depth Estimation: Depth Anything v2 (2024)</h4>
    <p>Depth Anything v2 (Yang et al., NeurIPS 2024) uses a DINOv2 ViT-Large encoder pretrained on 142M images, fine-tuned on 595K labeled depth images + 62M synthetic images using a teacher-student self-training strategy. It produces relative depth maps (not metric) from a single RGB frame — the best publicly available monocular depth model as of 2025. Metric versions (fine-tuned on KITTI outdoor or NYU-Depth indoor with real scale) produce absolute depth estimates suitable for drone obstacle awareness at modest range (&lt;15m) without a stereo camera. See Section 11.E for model variants, performance table, and inference code.</p>

    <figure class="my-6">
        <img src="images/m11_aerial_detection.jpg" alt="Aerial view from drone showing urban scene" class="rounded-lg w-full max-w-2xl mx-auto">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Top-down aerial view — typical drone perception perspective. At this altitude, pedestrians occupy ~8–20 pixels; SAHI tile-based inference and Depth Anything v2 metric depth are required for reliable detection and ranging. Source: <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Pexels</a> (CC0)</figcaption>
    </figure>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-amber-400 text-sm">Self-Supervised Depth Training: MonoDepth2 Loss (Godard et al., ICCV 2019)</h4>
        <div class="insight-box">
            <div class="insight-label">SELF-SUPERVISED DEPTH</div>
            <p class="text-slate-200 text-sm mt-1">MonoDepth2 trains depth and pose networks jointly on unlabeled video by checking that the depth prediction correctly warps neighboring frames onto the current frame — if the photometric reconstruction is sharp, the depth must be right. Auto-masking and an edge-aware smoothness term handle occlusions and object boundaries without any ground-truth depth labels.</p>
        </div>
        <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
Training setup: video triplet (I_{t-1}, I_t, I_{t+1}) — no depth labels needed<br><br>
Train two networks jointly:<br>
  DepthNet(I_t) → D_t  (dense depth map)<br>
  PoseNet(I_t, I_{t'}) → T_{t→t'}  (6-DoF relative camera pose)<br><br>
Synthesize I_t from frame t' using predicted depth and pose:<br>
  I_hat_{t'→t}(p) = I_{t'}(π(K * T_{t'→t} * D_t(p) * K^(-1) * p_h))<br>
  where π() = perspective projection, p_h = homogeneous pixel coords<br>
  Differentiable bilinear sampling enables gradients through the warp<br><br>
Photometric reconstruction loss (SSIM + L1 blend):<br>
  pe(I_a, I_b) = α*(1-SSIM(I_a, I_b))/2 + (1-α)*|I_a - I_b|  (α=0.85)<br><br>
Final loss per pixel (minimum over t-1 and t+1 warpings — handles occlusion):<br>
  L_photo = min_{t' ∈ {t-1, t+1}} pe(I_t, I_hat_{t'→t})<br><br>
Auto-masking (ignore stationary pixels — camera moved but pixel didn't):<br>
  μ_p = [min_{t'} pe(I_t, I_hat_{t'→t})] &lt; [min_{t'} pe(I_t, I_{t'})]<br>
  Only backprop through pixels where warped frame is sharper than raw frame<br><br>
Edge-aware smoothness regularization:<br>
  L_smooth = |∂^2_x D| * e^(-|∂_x I|) + |∂^2_y D| * e^(-|∂_y I|)<br>
  Penalizes depth discontinuities EXCEPT at image edges (where depth should change)
        </div>
</details>
    </div>

    <h4>DROID-SLAM: Recurrent Deep SLAM (Teed &amp; Deng, NeurIPS 2021)</h4>
    <p>DROID-SLAM replaces the geometric feature tracking frontend with a learned RAFT-based optical flow network. A 4D correlation volume (all feature-to-feature dot products) is computed once; a ConvGRU iteratively refines dense flow predictions between ALL active frame pairs simultaneously. A differentiable Dense Bundle Adjustment (DBA) layer acts as the backend — it solves for camera poses and depth maps that are consistent with the flow predictions. On EuRoC MAV, DROID-SLAM achieves 30–50% lower ATE than ORB-SLAM3 in monocular mode, approaching stereo-inertial performance. Limitation: requires CUDA GPU (RTX 3060 minimum for real-time). The GPU requirement currently limits drone deployment to larger platforms (Jetson AGX Orin class).</p>

    <h4>3D Gaussian Splatting for Dense Mapping (2023–2025)</h4>
    <p>3D Gaussian Splatting (3DGS, Kerbl et al., SIGGRAPH 2023) represents a scene as millions of 3D Gaussian primitives — each with position µ, covariance Σ (encoding orientation and scale), opacity α, and view-dependent color (spherical harmonics coefficients). Novel views are rendered via alpha compositing: Gaussians are sorted by depth, then splatted onto the image plane using the EWA splatting formula:</p>

    <div class="insight-box">
        <div class="insight-label">3D GAUSSIAN SPLATTING</div>
        <p class="text-slate-200 text-sm mt-1">Each 3D Gaussian is projected to a 2D ellipse via the EWA formula, then composited front-to-back with learned opacity — rendering a 1080p novel view at 30–100 fps, orders of magnitude faster than NeRF. Initialized from a sparse SfM point cloud, Gaussians are adaptively split and pruned during training based on gradient magnitude.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
EWA Splatting — project 3D Gaussian to 2D image space:<br><br>
3D covariance Σ = R * S * S^T * R^T   (R=rotation, S=diagonal scale matrix)<br>
2D covariance Σ_2D = J * W * Σ * W^T * J^T<br>
  W = view transform (world→camera), J = Jacobian of perspective projection<br><br>
Per-pixel color rendering (front-to-back alpha blending):<br>
C(p) = sum_{i ordered front-to-back} c_i * α_i * prod_{j &lt; i}(1 - α_j)<br><br>
α_i = o_i * exp(-0.5 * (p - µ_i)^T * Σ_2D_i^(-1) * (p - µ_i))<br>
  o_i = learned opacity, µ_i = 2D projection of 3D Gaussian center<br><br>
Training: initialized from SfM point cloud, optimized via photometric loss<br>
  with adaptive density control (split/clone/remove Gaussians based on gradient)<br>
Rendering speed: 30–100 fps at 1080p on RTX 3090 — orders of magnitude<br>
faster than NeRF for rendering (but similar training time)<br><br>
SLAM applications (2024):<br>
  SplaTAM (Keetha et al.): uses Gaussians as map, optimizes camera poses frame-by-frame<br>
  MonoGS (Matsuki et al.): joint Gaussian map + pose optimization, monocular<br>
  Current limitation: real-time map building not yet achievable on drone hardware<br>
  Active research: reducing Gaussian count while maintaining accuracy for navigation
    </div>
</details>

    <h3>11.10 Real-Time Deployment on Drone Hardware</h3>
    <p>SLAM algorithms must fit within the power and weight budget of a drone. This section covers the hardware options, integration patterns, and evaluation methodology for real deployments.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-white">Compute Platforms for Drone SLAM (2024)</h4>
        <div class="overflow-x-auto">
            <table class="w-full text-xs text-slate-300 mt-2">
                <thead><tr class="text-sky-400 border-b border-slate-700">
                    <th class="text-left py-1 pr-3">Platform</th>
                    <th class="text-left py-1 pr-3">CPU</th>
                    <th class="text-left py-1 pr-3">GPU / NPU</th>
                    <th class="text-left py-1 pr-3">RAM</th>
                    <th class="text-left py-1 pr-3">SLAM Perf</th>
                    <th class="text-left py-1 pr-3">TDP</th>
                    <th class="text-left py-1">Recommendation</th>
                </tr></thead>
                <tbody>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-amber-400">Jetson Orin NX 16GB</td><td class="py-1 pr-3">8×A78AE@2.0GHz</td><td class="py-1 pr-3">1024-core Ampere + 32 TOPS</td><td class="py-1 pr-3">16GB LPDDR5</td><td class="py-1 pr-3">ORB-SLAM3 + LightGlue real-time</td><td class="py-1 pr-3">10–25W</td><td class="py-1">Best drone SLAM platform. Module on carrier board: ~60g.</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-sky-400">Jetson Orin Nano 8GB</td><td class="py-1 pr-3">6×A78AE@1.5GHz</td><td class="py-1 pr-3">1024-core + 20 TOPS</td><td class="py-1 pr-3">8GB LPDDR5</td><td class="py-1 pr-3">OpenVINS + RTAB-Map</td><td class="py-1 pr-3">7–15W</td><td class="py-1">Best efficiency for mid-size drones (250–500g payload class).</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-3 font-mono text-emerald-400">Qualcomm RB5 (QRB5165)</td><td class="py-1 pr-3">Snapdragon 865, 8-core</td><td class="py-1 pr-3">Adreno 650 + 15 TOPS HTA</td><td class="py-1 pr-3">8GB LPDDR5</td><td class="py-1 pr-3">VINS-Fusion + OpenVINS</td><td class="py-1 pr-3">5–10W</td><td class="py-1">Commercial-drone silicon (DJI-class internals). Qualcomm AI SDK support.</td></tr>
                    <tr><td class="py-1 pr-3 font-mono text-slate-400">OAK-D Pro (onboard VPU)</td><td class="py-1 pr-3">RVC2 (MyriadX)</td><td class="py-1 pr-3">4 TOPS neural compute</td><td class="py-1 pr-3">4GB (host req)</td><td class="py-1 pr-3">Stereo depth + MobileNet at 30fps</td><td class="py-1 pr-3">7.5W</td><td class="py-1">Standalone depth + detection. Offloads stereo from companion CPU.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <h4>ArduPilot VIO Integration via MAVLink ExternalNav</h4>
    <p>Companion computers running VIO (OpenVINS, ORB-SLAM3, etc.) feed position estimates to ArduPilot EKF3 via MAVLink. This section shows the complete integration protocol.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700">
        <h4 class="mt-0 border-none text-amber-400 text-sm">MAVLink ExternalNav Protocol — Step by Step</h4>
        <ol class="text-slate-300 text-sm list-decimal pl-6 mt-2 space-y-2">
            <li><strong>EKF3 source configuration:</strong> Set <code>EK3_SRC1_POSXY=6</code> (ExternalNav), <code>EK3_SRC1_VELXY=6</code>, <code>EK3_SRC1_POSZ=6</code>, <code>EK3_SRC1_YAW=6</code> for full GPS-denied VIO mode. Keep <code>EK3_SRC1_POSZ=1</code> (barometer) if you want altitude fallback.</li>
            <li><strong>Define NED origin:</strong> Send <code>SET_GPS_GLOBAL_ORIGIN</code> (MSG #48) once at startup — sets the lat/lon/alt that corresponds to VIO position (0, 0, 0). Use the drone's takeoff GPS fix or a pre-surveyed benchmark.</li>
            <li><strong>Continuous pose stream:</strong> Send <code>VISION_POSITION_ESTIMATE</code> (MSG #102) at 15–30Hz. Fields: timestamp (µs), x/y/z in NED meters, roll/pitch/yaw in radians, covariance (21-element upper triangle of 6×6 matrix — set to zero to use EKF3 default noise params).</li>
            <li><strong>Reset counter:</strong> When VIO tracking fails and reinitializes, increment the <code>reset_counter</code> field. EKF3 discards the prior VIO state and re-anchors from the new estimate — prevents state corruption after VIO jumps.</li>
            <li><strong>Velocity-only fallback:</strong> If VIO loses loop closure but still tracks velocity reliably, send <code>VISION_SPEED_ESTIMATE</code> (MSG #103) — EKF3 can bound velocity drift even without absolute position. Useful during fast-motion periods that cause ORB-SLAM3 tracking loss.</li>
        </ol>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-4">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: VIO→ArduPilot MAVLink Bridge (pymavlink)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">from pymavlink import mavutil
import time, threading

mav = mavutil.mavlink_connection("/dev/ttyUSB0", baud=921600)
mav.wait_heartbeat()

# Set NED origin (once at startup — use drone's GPS fix or pre-surveyed point)
mav.mav.set_gps_global_origin_send(
    mav.target_system,
    int(37.7749  * 1e7),   # latitude  × 1e7 (degrees)
    int(-122.4194 * 1e7),  # longitude × 1e7 (degrees)
    int(10.0     * 1e3)    # altitude  × 1e3 (mm)
)

reset_counter = 0   # increment whenever VIO reinitializes after tracking failure

def send_vio_estimate(x, y, z, roll, pitch, yaw, pos_std=0.05, att_std=0.01):
    """Send VISION_POSITION_ESTIMATE to ArduPilot EKF3."""
    # Upper triangle of 6×6 pose covariance (position xyz, attitude rpy)
    var_p, var_a = pos_std**2, att_std**2
    cov = [var_p,0,0,0,0,0,  var_p,0,0,0,0,  var_p,0,0,0,  var_a,0,0,  var_a,0,  var_a]
    mav.mav.vision_position_estimate_send(
        int(time.time() * 1e6),  # µs timestamp
        x, y, z,                  # NED position in meters
        roll, pitch, yaw,         # attitude in radians
        cov, reset_counter
    )

def vio_callback(pose):
    """Called by your VIO system at 30Hz with the latest pose estimate."""
    send_vio_estimate(pose.x, pose.y, pose.z,
                       pose.roll, pose.pitch, pose.yaw)

# Example: OpenVINS ROS2 bridge calls vio_callback on /ov_msckf/odomimu topic</code></pre>
</details>
        </div>
    </div>

    <h4>EuRoC MAV Benchmark: Standard SLAM Evaluation</h4>
    <p>The EuRoC MAV dataset (Burri et al., IJRR 2016, ETH Zurich) is the standard benchmark for drone SLAM. It contains 11 sequences from an Asctec Firefly hexacopter flying in two indoor environments (Machine Hall MH, Vicon Room V1/V2), with millimeter-accurate ground truth from a Vicon motion capture system. The <strong>Absolute Trajectory Error (ATE RMSE)</strong> metric measures the alignment between the estimated and ground-truth trajectories after optimal rigid-body alignment:</p>

    <div class="insight-box">
        <div class="insight-label">ATE TRAJECTORY ERROR</div>
        <p class="text-slate-200 text-sm mt-1">Absolute Trajectory Error (ATE RMSE) measures how far the estimated path deviates from Vicon ground truth after optimal rigid-body alignment — the standard metric for drone SLAM evaluation on the EuRoC MAV dataset. Lower is better; values below 0.05 m are considered high precision for autonomous drone applications.</p>
    </div>
    <details class="code-expand">
    <summary>Technical Details ▼</summary>
<div class="math-block text-sm">
ATE RMSE computation:<br><br>
1. Align estimated trajectory T_est with ground truth T_gt using Horn's method<br>
   (optimal rotation + translation, optionally scale — use Sim3 for monocular)<br>
2. For each frame i: e_i = || p_gt_i - (s*R*p_est_i + t) ||<br>
   (Euclidean distance between aligned position estimates)<br>
3. ATE RMSE = sqrt(mean(e_i^2))   [meters]
    </div>
</details>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="px-4 py-3 bg-slate-800 text-xs font-mono text-slate-400 uppercase tracking-widest">EuRoC MAV Benchmark — ATE RMSE (lower = better)</div>
        <table class="w-full text-xs font-mono">
            <thead><tr class="bg-slate-800/50 text-slate-400">
                <th class="p-3 text-left">System</th>
                <th class="p-3 text-left">Mode</th>
                <th class="p-3 text-left">MH_01 Easy</th>
                <th class="p-3 text-left">MH_04 Hard</th>
                <th class="p-3 text-left">V1_02 Med</th>
                <th class="p-3 text-left">V2_02 Med</th>
            </tr></thead>
            <tbody class="text-slate-300">
                <tr class="border-t border-slate-800"><td class="p-3 text-amber-400">ORB-SLAM3</td><td class="p-3">Stereo+IMU</td><td class="p-3 text-green-400">0.016 m</td><td class="p-3 text-green-400">0.038 m</td><td class="p-3 text-green-400">0.018 m</td><td class="p-3 text-green-400">0.021 m</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-sky-400">OpenVINS</td><td class="p-3">Stereo+IMU</td><td class="p-3">0.041 m</td><td class="p-3">0.089 m</td><td class="p-3">0.038 m</td><td class="p-3">0.052 m</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-emerald-400">VINS-Mono</td><td class="p-3">Mono+IMU</td><td class="p-3">0.081 m</td><td class="p-3">0.135 m</td><td class="p-3">0.072 m</td><td class="p-3">0.098 m</td></tr>
                <tr class="border-t border-slate-800"><td class="p-3 text-purple-400">DROID-SLAM</td><td class="p-3">Monocular</td><td class="p-3">0.018 m</td><td class="p-3">0.042 m</td><td class="p-3">0.022 m</td><td class="p-3">0.027 m</td></tr>
            </tbody>
        </table>
        <p class="text-slate-500 text-xs px-4 py-2">Note: ORB-SLAM3 Stereo+IMU vs DROID-SLAM monocular is not apples-to-apples — DROID-SLAM's GPU requirement limits practical drone deployment to larger platforms.</p>
    </div>

    <div class="interactive-panel">
        <h4 class="mt-0 text-white border-none">Perception + SLAM Quick-Reference Card</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-sky-400 block mb-2">ROS 2 Packages (Humble / Jazzy)</strong>
                <ul class="text-slate-400 space-y-1 font-mono">
                    <li>YOLO11:        pip install ultralytics</li>
                    <li>SAM 2:         pip install sam2  (Apache 2.0)</li>
                    <li>GroundingDINO: pip install groundingdino-py</li>
                    <li>cuVSLAM:       isaac_ros_visual_slam (NVIDIA apt)</li>
                    <li>ORB-SLAM3:     ros2-orb-slam3 (community)</li>
                    <li>OpenVINS:      ov_ros2 (official, well-maintained)</li>
                    <li>Depth-Anything-v2: pip install depth-anything-v2</li>
                    <li>LightGlue:     pip install lightglue</li>
                    <li>RTAB-Map:      rtabmap_ros (official ROS2)</li>
                    <li>LIO-SAM:       LIO-SAM (ROS2 branch maintained)</li>
                </ul>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-700">
                <strong class="text-amber-400 block mb-2">Common Failure Modes and Mitigations</strong>
                <ul class="text-slate-400 space-y-1">
                    <li><span class="text-rose-400">Small objects missed</span> — altitude &gt;30m: use SAHI tile inference or increase input resolution to 1280</li>
                    <li><span class="text-rose-400">ID switches in tracker</span> — moving drone camera: use BoT-SORT (camera motion compensation)</li>
                    <li><span class="text-rose-400">Thermal false positives</span> — sun-heated surfaces: use temporal averaging + background subtraction</li>
                    <li><span class="text-rose-400">Textureless scene (SLAM)</span> — white walls, sky: add IR dot projector or switch to LiDAR</li>
                    <li><span class="text-rose-400">Motion blur</span> — fast yaw &gt;5 rad/s: global shutter camera required</li>
                    <li><span class="text-rose-400">Scale divergence (mono VIO)</span> — ensure dynamic init motion (3+ axes), check IMU ±16g range</li>
                    <li><span class="text-rose-400">Dynamic objects in SLAM</span> — use SAM 2 or semantic masking to exclude moving classes from feature tracking</li>
                    <li><span class="text-rose-400">Depth failure at range</span> — DA-v2 metric depth unreliable &gt;15m; use stereo or LiDAR for far-field</li>
                </ul>
            </div>
        </div>
    </div>
</div>
`;
