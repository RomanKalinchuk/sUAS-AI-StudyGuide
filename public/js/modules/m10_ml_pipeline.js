export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 14</span>
    <h2>AI Model Training &amp; Dataset Pipeline for Drone Applications</h2>
    <p>Training a detector on COCO and dropping it onto a drone will get mAP scores 15-20 points below what the same architecture achieves when fine-tuned on aerial data. This module covers why aerial data is different, which datasets to use, and the full pipeline from training to edge deployment.</p>

    <h3>14.1 Why Aerial Datasets Are Different</h3>
    <p>Standard vision datasets like COCO and ImageNet are overwhelmingly ground-level, eye-level photography. Drone imagery breaks almost every assumption baked into those datasets.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">Nadir vs. Oblique Views</h4>
            <p class="text-slate-300 text-sm">A nadir (straight-down) view at 50m altitude sees a car as a ~30x15 pixel rectangle — no windshield, no grille, pure roof. This is fundamentally different from the side-on car appearances in COCO. At 15-30 degrees off-nadir (oblique), you see partial sides plus foreshortening. Pre-trained backbone features for "car" are tuned to frontal/side appearances and must be re-learned.</p>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">Small Object Detection Challenge</h4>
            <p class="text-slate-300 text-sm">At 70m altitude with a typical 12MP drone camera, a pedestrian occupies roughly 15x40 pixels — well below the COCO "small" threshold of 32x32 pixels. COCO small-object AP is already the weakest metric for most models. VisDrone reports that over 60% of its annotated instances are &lt;32px in the longest dimension, creating severe foreground/background class imbalance in anchor assignment.</p>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">Scale Variation &amp; Altitude Coupling</h4>
            <p class="text-slate-300 text-sm">A single flight mission covering 20m-80m altitude introduces a 4x scale range for every object class. Multi-scale feature pyramids (FPN/PAN) help, but they assume the scale range is fixed during training. Training with a fixed imgsz=640 and then inferring at 1280 or using multi-scale augmentation during training are both necessary to handle this.</p>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">Motion Blur &amp; Dataset Bias</h4>
            <p class="text-slate-300 text-sm">At 15 m/s flight speed with 1/250s shutter, a 50m-altitude camera accumulates ~3px of motion blur. At 1/60s, this becomes ~12px on a small object — rendering it nearly undetectable. COCO/ImageNet have negligible motion blur training signal. Class imbalance in aerial surveillance is also extreme: pedestrian instances outnumber bus instances by 20:1 in VisDrone, requiring weighted loss sampling.</p>
        </div>
    </div>

    <h3>14.2 Key Aerial &amp; Drone Datasets</h3>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400">VisDrone2019</h4>
        <p class="text-slate-300 text-sm">The benchmark dataset for drone-based detection. Collected by the AISKYEYE team at Tianjin University from 14 cities across China, using DJI Phantom 3 Standard and Phantom 4 drones at altitudes of 10-70m.</p>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mt-2">
            <li><strong>Images:</strong> 10,209 static images + 288 video clips (261,908 frames)</li>
            <li><strong>Annotations:</strong> 2.6M+ bounding boxes across 10 classes: pedestrian, people, bicycle, car, van, truck, tricycle, awning-tricycle, bus, motor</li>
            <li><strong>Train/Val/Test split:</strong> 6,471 / 548 / 1,610 images for detection</li>
            <li><strong>Download:</strong> Official site requires registration — or use Hugging Face: <code>Voxel51/VisDrone2019-DET</code> (~2.3 GB). Also available on Roboflow Universe as <code>VisDrone2019-DET</code>.</li>
            <li><strong>Key challenge:</strong> Dense crowd scenes, tiny objects, severe occlusion. Using imgsz=1280 instead of 640 recovers ~9 mAP50 points.</li>
        </ul>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400">DOTA — Dataset for Object deTection in Aerial Images</h4>
        <p class="text-slate-300 text-sm">The standard benchmark for <strong>oriented bounding box (OBB)</strong> detection in satellite/aerial imagery. Annotations use 8-coordinate OBB format: (x1,y1, x2,y2, x3,y3, x4,y4) with vertices in clockwise order.</p>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mt-2">
            <li><strong>DOTA-v1.0:</strong> 2,806 images (800px-20,000px), 188,282 instances, 15 categories including plane, ship, storage tank, baseball diamond, bridge, harbor, vehicle, helicopter, roundabout, soccer ball field, swimming pool</li>
            <li><strong>DOTA-v1.5:</strong> Adds "container crane" category, increases small instance count significantly</li>
            <li><strong>DOTA-v2.0:</strong> 11,268 images, 1,793,658 instances, 18 categories (adds airport, helipad). Test-challenge split: 6,053 images with 1.09M instances.</li>
            <li><strong>Access:</strong> <a href="https://captain-whu.github.io/DOTA/dataset.html" class="text-sky-400 hover:underline">captain-whu.github.io/DOTA</a> — registration required. Also available via Ultralytics dataset download.</li>
        </ul>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400">AU-AIR — Multi-modal UAV Dataset</h4>
        <p class="text-slate-300 text-sm">First multi-modal UAV dataset combining RGB video with synchronized flight telemetry. Captured in Aarhus, Denmark at max 30m altitude for traffic surveillance.</p>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mt-2">
            <li><strong>Content:</strong> 8 video clips, ~2 hours, 32,823 extracted frames with bounding box annotations</li>
            <li><strong>Modalities:</strong> RGB video + GPS + altitude (barometer) + IMU (accelerometer, gyroscope) + velocity — all time-synchronized per frame</li>
            <li><strong>Classes:</strong> 8 traffic-related categories (human, car, truck, van, bicycle, motorbike, bus, trailer)</li>
            <li><strong>Use case:</strong> Training and evaluating multi-modal fusion models that combine visual features with flight state.</li>
        </ul>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400">2024-2025 Newer Aerial Datasets</h4>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-2 mt-2">
            <li><strong>M3OT (2025):</strong> Multi-Drone Multi-Modality dataset for Multi-Object Tracking. 21,580 frames, 10,790 paired RGB-IR images, 220,000 bounding boxes across suburban/urban/night scenarios. Useful for IR-visible fusion tracking.</li>
            <li><strong>CODrone (2025):</strong> Comprehensive Oriented Object Detection benchmark for UAV. Multi-city, multi-lighting collection with OBB annotations. GitHub: <code>AHideoKuzeA/CODrone</code>.</li>
            <li><strong>RFUAV (2025):</strong> Radio-frequency-based UAV identification — 1.3 TB raw RF data from 37 UAV types using USRP SDR. For RF-domain drone detection, not visual.</li>
            <li><strong>Mid-Air (synthetic):</strong> 54 synthetic trajectories, 420k+ frames with RGB, depth, surface normals, stereo disparity, object semantics. Useful for pre-training before domain adaptation.</li>
        </ul>
    </div>

    <h3>14.3 Data Collection Strategy</h3>
    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-white">Coverage Matrix for a Production Dataset</h4>
        <table class="w-full text-xs text-slate-300 mt-2">
            <thead><tr class="text-sky-400 border-b border-slate-700">
                <th class="text-left py-1 pr-4">Variable</th>
                <th class="text-left py-1">Values to Cover</th>
            </tr></thead>
            <tbody class="space-y-1">
                <tr class="border-b border-slate-800"><td class="py-1 pr-4 font-mono">Altitude</td><td class="py-1">20m, 30m, 40m, 50m, 60m, 70m (10m increments). Each altitude changes apparent object scale by ~1.17x per 10m step.</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4 font-mono">Lighting</td><td class="py-1">Golden hour (6-8 AM/PM), overcast diffuse, high-noon harsh shadows, twilight, artificial night lighting</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4 font-mono">Season</td><td class="py-1">Summer (full foliage, green ground), winter (snow, leafless trees), autumn (color shifts)</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4 font-mono">Geography</td><td class="py-1">Urban dense, suburban, rural open, coastline/water reflection, industrial. Appearance of concrete vs. grass vs. sand backgrounds changes false positive rates significantly.</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4 font-mono">Camera angle</td><td class="py-1">Nadir (0° tilt), 15°, 30° oblique. Mix ratios depend on mission profile.</td></tr>
                <tr><td class="py-1 pr-4 font-mono">Object density</td><td class="py-1">Sparse (rural), medium (suburban intersection), dense (city center, crowd scenes)</td></tr>
            </tbody>
        </table>
    </div>

    <p class="text-slate-300 text-sm"><strong>Annotation Tools:</strong></p>
    <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mb-6">
        <li><strong>Label Studio</strong> — open-source, self-hostable, supports YOLO/COCO/Pascal VOC export. Good for team workflows with custom pre-annotations via model-in-the-loop.</li>
        <li><strong>CVAT (Computer Vision Annotation Tool)</strong> — developed by Intel, open-source, supports semi-automatic annotation via SAM integration. Best for video annotation with track interpolation.</li>
        <li><strong>Roboflow</strong> — SaaS, includes augmentation pipeline + dataset versioning + auto-train. Fastest path from raw images to YOLO-ready dataset. Free tier: 10,000 source images.</li>
    </ul>

    <h3>14.4 YOLO Model Family Selection (2025)</h3>
    <p>YOLO11 was released by Ultralytics in October 2024. It introduces the C3k2 block (cross-stage partial with two kernels) and C2PSA (Cross-Stage Partial with Spatial Attention) modules, replacing the C2f block from YOLOv8. <span class="text-amber-400 font-bold">Note:</span> YOLO12 (February 2025) is now the Ultralytics-supported successor, introducing an area-attention mechanism accepted at NeurIPS 2025 that yields ~1.2% mAP improvement over YOLO11n at comparable speed. YOLO11 remains the recommended choice for edge deployment — Hailo, RKNN, and TensorRT pipelines have mature YOLO11 support while YOLO12 toolchain support matures.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">YOLO11 Detection Model Variants — COCO val2017</div>
        <div class="p-4 overflow-x-auto">
            <table class="w-full text-xs text-slate-300 font-mono">
                <thead><tr class="text-sky-400 border-b border-slate-700">
                    <th class="text-left py-1 pr-6">Model</th>
                    <th class="text-left py-1 pr-6">Params (M)</th>
                    <th class="text-left py-1 pr-6">FLOPs (B)</th>
                    <th class="text-left py-1 pr-6">mAP50-95 (COCO)</th>
                    <th class="text-left py-1">CPU ONNX (ms)</th>
                </tr></thead>
                <tbody>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-6">YOLO11n</td><td class="py-1 pr-6">2.6</td><td class="py-1 pr-6">6.5</td><td class="py-1 pr-6">39.5</td><td class="py-1">56.1</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-6">YOLO11s</td><td class="py-1 pr-6">9.4</td><td class="py-1 pr-6">21.5</td><td class="py-1 pr-6">47.0</td><td class="py-1">90.0</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-6">YOLO11m</td><td class="py-1 pr-6">20.1</td><td class="py-1 pr-6">68.0</td><td class="py-1 pr-6">51.5</td><td class="py-1">183.2</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-6">YOLO11l</td><td class="py-1 pr-6">25.3</td><td class="py-1 pr-6">86.9</td><td class="py-1 pr-6">53.4</td><td class="py-1">238.6</td></tr>
                    <tr><td class="py-1 pr-6">YOLO11x</td><td class="py-1 pr-6">56.9</td><td class="py-1 pr-6">194.9</td><td class="py-1 pr-6">54.7</td><td class="py-1">462.8</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-amber-400 text-sm">YOLO11 on VisDrone — Practical Benchmarks</h4>
        <p class="text-slate-300 text-sm">Unlike COCO, VisDrone mAP50 numbers are significantly lower for all models due to small object prevalence. Community-reported baselines at imgsz=1280, 100 epochs:</p>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mt-2">
            <li><strong>YOLO11n @ 1280:</strong> ~33-36 mAP50. At imgsz=640 this drops ~9 points to ~24-27 mAP50.</li>
            <li><strong>YOLO11s @ 1280:</strong> ~40-44 mAP50. The recommended entry point for most drone missions.</li>
            <li><strong>YOLO11m @ 1280:</strong> ~46-50 mAP50. Diminishing returns vs YOLO11s on VisDrone's small objects.</li>
            <li>Architecture variants (SRTSOD-YOLO, MFA-YOLO, PPM-YOLO) report 3-8 point mAP50 gains over YOLO11 baselines on VisDrone by adding multi-scale feature fusion heads specifically tuned to small object scales (&lt;16px).</li>
        </ul>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-amber-400 text-sm">RT-DETR: When to Use Transformers Over CNNs</h4>
        <p class="text-slate-300 text-sm">RT-DETR (Real-Time DEtection TRansformer, CVPR 2024, Baidu) uses a ResNet/HGNetV2 backbone with a hybrid encoder that replaces NMS with a set-prediction decoder. RT-DETR-R50 achieves 53.1% AP on COCO at 108 FPS on an A100.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Use RT-DETR when:</strong> scenes have dense overlapping objects where NMS suppression causes missed detections; you need global context (cross-image attention for occluded targets); you have GPU compute budget and accuracy is the priority.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Use YOLO11 when:</strong> deploying to Hailo-8, RK3588, or Jetson Orin NX where transformer attention maps cannot be efficiently scheduled; needing &lt;10ms latency per frame; fine-tuning speed matters (transformers require significantly more CUDA memory and epochs to converge).</p>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-amber-400 text-sm">Model Selection by TOPS Budget</h4>
        <table class="w-full text-xs text-slate-300 mt-2">
            <thead><tr class="text-sky-400 border-b border-slate-700">
                <th class="text-left py-1 pr-4">Hardware</th>
                <th class="text-left py-1 pr-4">AI TOPS</th>
                <th class="text-left py-1 pr-4">Recommended Model</th>
                <th class="text-left py-1">Notes</th>
            </tr></thead>
            <tbody>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">Hailo-8</td><td class="py-1 pr-4">26 TOPS</td><td class="py-1 pr-4">YOLO11n or YOLO11s</td><td class="py-1">HEF format required. YOLO11s at 640 runs comfortably at 30fps+ on Hailo-8 with ~2.5W draw.</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">Hailo-8L</td><td class="py-1 pr-4">13 TOPS</td><td class="py-1 pr-4">YOLO11n</td><td class="py-1">Used in Raspberry Pi AI HAT+. Nano fits within 13 TOPS at 30fps@640.</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">Jetson Orin NX 8GB</td><td class="py-1 pr-4">70 TOPS</td><td class="py-1 pr-4">YOLO11m or YOLO11l</td><td class="py-1">TensorRT INT8 engine. YOLO11m@1280 for aerial small object missions.</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">Jetson AGX Orin</td><td class="py-1 pr-4">275 TOPS</td><td class="py-1 pr-4">YOLO11l / YOLO11x</td><td class="py-1">Also suitable for RT-DETR-R50 with headroom for concurrent SLAM.</td></tr>
                <tr><td class="py-1 pr-4">RK3588 (RK NPU)</td><td class="py-1 pr-4">6 TOPS</td><td class="py-1 pr-4">YOLO11n</td><td class="py-1">RKNN format. 6 TOPS limits to nano at real-time speed.</td></tr>
            </tbody>
        </table>
    </div>

    <h3>14.5 Training Pipeline</h3>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Bash: Ultralytics YOLO11 Training Commands</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Shell Code Example</summary>
<pre><code class="language-bash"># Fine-tune YOLO11s on VisDrone — recommended baseline
# imgsz=1280 is critical for small objects. batch=-1 auto-scales to VRAM.
# multi_scale=True trains at [0.5, 1.5]x imgsz range, simulating altitude variation.
yolo detect train \\
    data=VisDrone.yaml \\
    model=yolo11s.pt \\
    imgsz=1280 \\
    epochs=100 \\
    batch=-1 \\
    lr0=0.01 \\
    lrf=0.01 \\
    warmup_epochs=3 \\
    cos_lr=True \\
    multi_scale=True \\
    hsv_h=0.015 \\
    hsv_s=0.7 \\
    hsv_v=0.4 \\
    flipud=0.0 \\
    fliplr=0.5 \\
    mosaic=1.0 \\
    mixup=0.15 \\
    perspective=0.0003 \\
    device=0 \\
    project=runs/aerial \\
    name=visdrone_yolo11s

# Transfer learning with frozen backbone (first 5 epochs):
# freeze=10 freezes the first 10 layers (backbone); unfreeze for fine-tuning.
yolo detect train \\
    data=VisDrone.yaml \\
    model=yolo11m.pt \\
    freeze=10 \\
    epochs=30 \\
    lr0=0.001 \\
    imgsz=1280 \\
    device=0

# Validate trained model
yolo detect val \\
    model=runs/aerial/visdrone_yolo11s/weights/best.pt \\
    data=VisDrone.yaml \\
    imgsz=1280 \\
    split=test</code></pre>
</details>
        </div>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-white text-sm">Augmentation Rationale for Aerial Data</h4>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mt-2">
            <li><strong>Mosaic (mosaic=1.0):</strong> Tiles 4 images into one. Highly effective for aerial because it increases object-per-image density and exposes the model to varied backgrounds simultaneously. Do not disable for aerial training.</li>
            <li><strong>MixUp (mixup=0.15):</strong> Alpha-blends two images. Use at low weight (0.1-0.2). Too high makes small object gradients noisy.</li>
            <li><strong>Random scale via multi_scale:</strong> Trains at randomized imgsz * [0.5, 1.5] each batch — directly simulates altitude change (higher altitude = smaller objects).</li>
            <li><strong>Horizontal flip (fliplr=0.5):</strong> Safe for aerial. Roads, vehicles, buildings are horizontally symmetric when viewed from above.</li>
            <li><strong>Vertical flip (flipud=0.0):</strong> Disabled. There is no physical scenario where a drone image is upside-down, and it wastes augmentation budget on impossible views.</li>
            <li><strong>Perspective (perspective=0.0003):</strong> Simulates oblique view angle variation. Keep small to avoid geometric distortion making small boxes undetectable.</li>
            <li><strong>HSV shifts:</strong> hsv_h=0.015 (hue for seasonal/time-of-day variation), hsv_s=0.7 (saturation for overcast vs sunny), hsv_v=0.4 (brightness for shadow/lighting). These are the most important augmentations after mosaic for aerial domain shift.</li>
        </ul>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-white text-sm">Transfer Learning Strategy</h4>
        <p class="text-slate-300 text-sm"><strong>Phase 1 — Frozen backbone (epochs 1-5):</strong> Set <code>freeze=10</code> (freezes backbone layers 0-9). Use lr0=0.001. Lets the new detection head adapt to aerial class distributions without destroying pretrained backbone features. Warmup_epochs=3 gradually ramps LR from lr0/10 to lr0.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Phase 2 — Full fine-tune (epochs 6-100):</strong> Remove freeze, use lr0=0.01 with cosine LR decay (cos_lr=True) to lrf=0.01. The cosine schedule decays slowly then rapidly, which works better than step decay for small object tuning where the model needs long stable periods at moderate LR.</p>
        <p class="text-slate-300 text-sm mt-2"><strong>Batch size / VRAM:</strong> At imgsz=1280, YOLO11s requires ~14 GB VRAM with batch=8. Use batch=-1 to have Ultralytics auto-select the maximum safe batch. On a 24GB GPU (RTX 3090/4090), batch=4-6 at imgsz=1280 with YOLO11m.</p>
    </div>

    <h3>14.6 Export Pipeline to Edge</h3>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python/Bash: Complete Edge Export Workflows</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">from ultralytics import YOLO

model = YOLO("runs/aerial/visdrone_yolo11s/weights/best.pt")

# ── Path 1: NVIDIA Jetson ──────────────────────────────────────────
# PyTorch .pt → ONNX → TensorRT .engine (INT8)
model.export(
    format="engine",          # Direct TensorRT engine export
    imgsz=1280,
    half=False,               # FP16; set int8=True + data= for INT8 calibration
    int8=True,
    data="VisDrone.yaml",     # Calibration dataset for INT8 PTQ
    batch=1,
    device=0                  # Must be run on the target Jetson GPU
)
# Output: best.engine — deploy with model("best.engine")

# ── Path 2: Hailo-8 ───────────────────────────────────────────────
# Step A: Export ONNX (opset 11 or 12; Hailo DFC requires specific opset)
model.export(format="onnx", imgsz=640, opset=11, simplify=True)
# Output: best.onnx

# Step B: Run Hailo Dataflow Compiler (hailo_sdk_client v3.27+)
# This must run on x86 host machine, not the Hailo device itself.
# hailo_sdk_client parses the ONNX, applies model optimization,
# generates .har (Hailo Archive), then compiles to .hef

# hailo parse onnx best.onnx --net-name yolo11s
# hailo optimize yolo11s.har --calib-path /path/to/calib_images/
# hailo compile yolo11s_optimized.har --hw-arch hailo8
# Output: yolo11s.hef — deploy via HailoRT Python API

# ── Path 3: Rockchip RK3588 ───────────────────────────────────────
# PyTorch .pt → ONNX → RKNN Toolkit 2 → .rknn
model.export(format="rknn", imgsz=640)
# Ultralytics natively supports RKNN export as of 2024
# Alternatively via rknn-toolkit2:
#   rknn = RKNNLite()
#   rknn.load_onnx(model='best.onnx')
#   rknn.build(do_quantization=True, dataset='./dataset.txt')
#   rknn.export_rknn('best.rknn')
</code></pre>
</details>
        </div>
    </div>

    <h3>14.7 Vision-Language Models (VLMs) at the Edge</h3>
    <p>YOLO-class CNNs draw bounding boxes around pre-defined object classes — they answer "Is there a car here?" Traditional navigation is then: "fly to bounding box." VLMs break this constraint by enabling <strong>semantic scene understanding</strong>: "navigate to the red truck near the damaged building." The drone can reason about novel objects and spatial relationships without retraining.</p>

    <div class="bg-amber-900/20 border border-amber-500/50 p-4 rounded mb-6 text-amber-200 text-sm">
        <strong>Architectural difference:</strong> A CNN extracts spatial feature maps and passes them through detection heads. A VLM encodes both an image and a natural-language query into a shared embedding space and outputs grounded predictions. The language component acts as a zero-shot class specification — any concept the language model understands becomes a detectable category.
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
        <div class="hw-card p-5 rounded-xl">
            <h4 class="text-white mt-0 text-base">Edge-Deployable VLM Architectures (2025–2026)</h4>
            <ul class="space-y-3 text-slate-300 text-xs font-mono">
                <li>
                    <strong class="text-sky-400 block">LLaVA-1.6 / LLaVA-Phi-3 Mini (3B)</strong>
                    CLIP ViT vision encoder + small language model (Phi-3 Mini 3.8B). Fits in 8GB LPDDR5 on Jetson Orin Nano at FP16. ~2–4 inference/sec at 336px input. Use for semantic scene description when real-time rate is not required (e.g., mission planning queries, pre-flight area assessment).
                </li>
                <li>
                    <strong class="text-sky-400 block">NVIDIA GR00T N1 (foundation model)</strong>
                    NVIDIA's robotics foundation model. Uses a dual-system architecture: a diffusion transformer for low-level motor control + a VLM for high-level goal interpretation. Requires Jetson Thor or AGX Orin for real-time inference. Primary use: mapping natural language mission goals to multi-step motor primitives.
                </li>
                <li>
                    <strong class="text-sky-400 block">Grounding DINO + SAM2 (open vocabulary detection)</strong>
                    Grounding DINO takes a text prompt ("red truck") and outputs bounding boxes for any object matching the description — zero-shot. SAM2 then produces instance masks. Combined pipeline: ~8–15 fps on Orin NX 16GB with TensorRT optimization. The practical solution for semantic target detection on current hardware.
                </li>
            </ul>
        </div>
        <div class="hw-card p-5 rounded-xl">
            <h4 class="text-white mt-0 text-base">Practical Integration Pattern</h4>
            <p class="text-slate-300 text-xs mb-3">VLMs are too slow for 30 fps closed-loop control. The production architecture is a two-tier pipeline:</p>
            <div class="bg-slate-900 p-3 rounded border border-slate-700 text-xs font-mono text-slate-300 space-y-2">
                <p><strong class="text-sky-400">Tier 1 — Fast loop (30 fps):</strong> YOLO11 tracks the target bounding box and feeds pixel coordinates to the MAVLink control loop. Runs continuously.</p>
                <p><strong class="text-sky-400">Tier 2 — Slow loop (1–2 fps):</strong> Grounding DINO or LLaVA processes the full scene against the mission goal ("find the red truck"). When it detects a match, it seeds the YOLO tracker with a new target ROI. The fast loop then takes over tracking.</p>
                <p><strong class="text-emerald-400">Result:</strong> Semantic understanding from the VLM + real-time control from the CNN detector. Neither runs alone.</p>
            </div>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">
            Python: Grounding DINO open-vocabulary detection on Jetson Orin
        </div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Python Code Example</summary>
<pre><code class="language-python">from groundingdino.util.inference import load_model, load_image, predict, annotate
import torch

model = load_model(
    "groundingdino/config/GroundingDINO_SwinT_OGC.py",
    "weights/groundingdino_swint_ogc.pth"
)

# Query from mission planner — natural language target specification
TEXT_PROMPT = "red truck . damaged building . person on rooftop"
BOX_THRESHOLD = 0.35
TEXT_THRESHOLD = 0.25

image_source, image = load_image("frame.jpg")

boxes, logits, phrases = predict(
    model=model,
    image=image,
    caption=TEXT_PROMPT,
    box_threshold=BOX_THRESHOLD,
    text_threshold=TEXT_THRESHOLD,
    device="cuda"  # TensorRT-optimized on Orin NX at ~8 fps
)

# boxes are cx,cy,w,h normalized — convert to pixel coords for MAVLink targeting
# phrases: list of matched text tokens per box (e.g., ["red truck", "person"])
print(f"Detected: {phrases} at boxes {boxes}")</code></pre>
</details>
        </div>
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded-xl p-5 text-sm mb-8">
        <strong class="text-sky-400 block mb-2">VLM Hardware Requirements — Current State (2026)</strong>
        <table class="w-full text-xs font-mono text-slate-300">
            <thead><tr class="text-slate-400 border-b border-slate-700">
                <th class="text-left pb-2 pr-4">Model</th>
                <th class="text-left pb-2 pr-4">Min. Hardware</th>
                <th class="text-left pb-2 pr-4">Inference Rate</th>
                <th class="text-left pb-2">Use Case</th>
            </tr></thead>
            <tbody>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">Grounding DINO (SwinT)</td><td class="py-1 pr-4">Orin NX 8GB</td><td class="py-1 pr-4 text-emerald-400">8–15 fps</td><td class="py-1">Open-vocab target detection (production-ready)</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">LLaVA-Phi-3 Mini (3.8B)</td><td class="py-1 pr-4">Orin Nano (15W)</td><td class="py-1 pr-4 text-amber-400">2–4 fps</td><td class="py-1">Scene description, mission planning queries</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">LLaVA-1.6 (7B)</td><td class="py-1 pr-4">AGX Orin 32GB</td><td class="py-1 pr-4 text-amber-400">1–2 fps</td><td class="py-1">Complex reasoning, multi-object semantic analysis</td></tr>
                <tr><td class="py-1 pr-4">GR00T N1</td><td class="py-1 pr-4">Jetson Thor</td><td class="py-1 pr-4 text-amber-400">~10 Hz control</td><td class="py-1">End-to-end language→motor policy (2026+ hardware)</td></tr>
            </tbody>
        </table>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-amber-400 text-sm">Quantization Validation — Acceptable mAP Drop Thresholds</h4>
        <p class="text-slate-300 text-sm">Always measure mAP before and after quantization on the test split at native resolution. Community and research-validated thresholds:</p>
        <table class="w-full text-xs text-slate-300 mt-2">
            <thead><tr class="text-sky-400 border-b border-slate-700">
                <th class="text-left py-1 pr-4">Quantization</th>
                <th class="text-left py-1 pr-4">Typical mAP50 drop</th>
                <th class="text-left py-1 pr-4">Speedup</th>
                <th class="text-left py-1">Mitigation</th>
            </tr></thead>
            <tbody>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">FP32 → FP16</td><td class="py-1 pr-4">&lt;0.5%</td><td class="py-1 pr-4">1.5-2x</td><td class="py-1">None needed; lossless in practice</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">FP32 → INT8 PTQ</td><td class="py-1 pr-4">1-5% mAP50-95</td><td class="py-1 pr-4">2-4x</td><td class="py-1">Use 500+ calibration images from training set. Accept up to 3% drop.</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">FP32 → INT8 QAT</td><td class="py-1 pr-4">&lt;1%</td><td class="py-1 pr-4">2-4x</td><td class="py-1">Quantization-aware training recovers most accuracy; 10-20 extra epochs</td></tr>
                <tr><td class="py-1 pr-4">Hailo HEF INT8</td><td class="py-1 pr-4">2-7% mAP50</td><td class="py-1 pr-4">10-20x vs CPU</td><td class="py-1">Hailo optimizer auto-selects sensitive layers. If &gt;5% drop, increase calib set.</td></tr>
            </tbody>
        </table>
        <p class="text-slate-300 text-sm mt-3"><strong>Hard rule:</strong> If INT8 PTQ drops mAP50 by more than 5% relative (e.g., from 40 to below 38 mAP50), switch to INT8 QAT or FP16 only. Transformer-based models (RT-DETR) are more sensitive to INT8 quantization than CNN-based YOLO due to attention softmax precision requirements.</p>
    </div>
</div>
`;
