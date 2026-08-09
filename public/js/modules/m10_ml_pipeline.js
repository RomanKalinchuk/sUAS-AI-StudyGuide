export default `
<div class="fade-in">
    <span class="text-sky-500 font-mono tracking-widest text-sm uppercase">Module 10</span>
    <h2>ML Pipeline for Drone Edge-AI: Data &rarr; Train &rarr; Optimize &rarr; Deploy</h2>
    <p>A complete production ML pipeline for autonomous drone perception covers six tightly linked stages: collect and curate domain-specific data, annotate it, train with transfer learning, compress and quantize the model, build a hardware-optimized inference engine, and close the loop with on-device monitoring. Each stage has drone-specific pitfalls. This module covers the full pipeline end-to-end with 2026-era tooling: JetPack 6.x/7, TensorRT 10.x, NVIDIA TAO Toolkit 6.x, DeepStream 7.x, and YOLO26.</p>

    <!-- Pipeline Overview Flowchart -->
    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-4">10.0 The Complete ML Pipeline</h3>
        <div class="overflow-x-auto">
            <div class="flex items-stretch gap-0 min-w-max">
                <div class="bg-sky-900/60 border border-sky-500/50 rounded-l-lg p-4 text-center flex flex-col justify-center w-36">
                    <div class="text-sky-400 font-bold text-sm">1. COLLECT</div>
                    <div class="text-slate-300 text-xs mt-1">Real + Synthetic Data</div>
                </div>
                <div class="flex items-center text-slate-500 text-lg">&rarr;</div>
                <div class="bg-violet-900/60 border border-violet-500/50 p-4 text-center flex flex-col justify-center w-36">
                    <div class="text-violet-400 font-bold text-sm">2. LABEL</div>
                    <div class="text-slate-300 text-xs mt-1">Roboflow / CVAT / Label Studio</div>
                </div>
                <div class="flex items-center text-slate-500 text-lg">&rarr;</div>
                <div class="bg-emerald-900/60 border border-emerald-500/50 p-4 text-center flex flex-col justify-center w-36">
                    <div class="text-emerald-400 font-bold text-sm">3. TRAIN</div>
                    <div class="text-slate-300 text-xs mt-1">PyTorch 2.x + YOLO26 / TAO</div>
                </div>
                <div class="flex items-center text-slate-500 text-lg">&rarr;</div>
                <div class="bg-amber-900/60 border border-amber-500/50 p-4 text-center flex flex-col justify-center w-36">
                    <div class="text-amber-400 font-bold text-sm">4. OPTIMIZE</div>
                    <div class="text-slate-300 text-xs mt-1">Prune &rarr; Distill &rarr; Quantize</div>
                </div>
                <div class="flex items-center text-slate-500 text-lg">&rarr;</div>
                <div class="bg-red-900/60 border border-red-500/50 p-4 text-center flex flex-col justify-center w-36">
                    <div class="text-red-400 font-bold text-sm">5. DEPLOY</div>
                    <div class="text-slate-300 text-xs mt-1">TensorRT 10 .engine on Jetson</div>
                </div>
                <div class="flex items-center text-slate-500 text-lg">&rarr;</div>
                <div class="bg-teal-900/60 border border-teal-500/50 rounded-r-lg p-4 text-center flex flex-col justify-center w-36">
                    <div class="text-teal-400 font-bold text-sm">6. MONITOR</div>
                    <div class="text-slate-300 text-xs mt-1">MLflow / W&amp;B + Active Learning</div>
                </div>
            </div>
        </div>
        <p class="text-slate-400 text-xs mt-2 italic">Each stage feeds the next. Monitoring closes the loop: production failures trigger new labeled data and retraining.</p>
    </div>

    <h3>10.1 Why Aerial Datasets Are Different</h3>
    <p>Standard vision datasets like COCO and ImageNet are overwhelmingly ground-level, eye-level photography. Drone imagery breaks almost every assumption baked into those datasets.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">Nadir vs. Oblique Views</h4>
            <p class="text-slate-300 text-sm">A nadir (straight-down) view at 50m altitude sees a car as a ~30&times;15 pixel rectangle &mdash; no windshield, no grille, pure roof. This is fundamentally different from the side-on car appearances in COCO. At 15-30 degrees off-nadir (oblique), you see partial sides plus foreshortening. Pre-trained backbone features for "car" are tuned to frontal/side appearances and must be re-learned.</p>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">Small Object Detection Challenge</h4>
            <p class="text-slate-300 text-sm">At 70m altitude with a typical 12MP drone camera, a pedestrian occupies roughly 15&times;40 pixels &mdash; well below the COCO "small" threshold of 32&times;32 pixels. Over 60% of VisDrone annotated instances are &lt;32px in the longest dimension, creating severe foreground/background class imbalance in anchor assignment. imgsz=1280 recovers ~9 mAP50 points versus imgsz=640.</p>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">Scale Variation &amp; Altitude Coupling</h4>
            <p class="text-slate-300 text-sm">A single flight mission covering 20m-80m altitude introduces a 4x scale range for every object class. Multi-scale feature pyramids (FPN/PAN) help, but they assume the scale range is fixed during training. Training with multi_scale=True randomizes imgsz at each batch by &plusmn;50%, directly simulating altitude change without requiring multi-altitude flight data.</p>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-amber-400 text-sm">Motion Blur &amp; Class Imbalance</h4>
            <p class="text-slate-300 text-sm">At 15 m/s flight speed with 1/60s shutter, a 50m-altitude camera accumulates ~12px of motion blur on small objects &mdash; rendering them nearly undetectable. COCO/ImageNet have negligible motion blur training signal. Class imbalance is extreme: pedestrian instances outnumber bus instances by 20:1 in VisDrone, requiring weighted loss sampling or focal loss tuning.</p>
        </div>
    </div>

    <h3>10.2 Key Aerial &amp; Drone Datasets</h3>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400">VisDrone2019</h4>
        <p class="text-slate-300 text-sm">The benchmark dataset for drone-based detection. Collected at Tianjin University from 14 Chinese cities using DJI Phantom 3/4 drones at 10-70m altitude.</p>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mt-2">
            <li><strong>Images:</strong> 10,209 static images + 288 video clips (261,908 frames)</li>
            <li><strong>Annotations:</strong> 2.6M+ bounding boxes, 10 classes: pedestrian, people, bicycle, car, van, truck, tricycle, awning-tricycle, bus, motor</li>
            <li><strong>Download:</strong> Hugging Face <code>Voxel51/VisDrone2019-DET</code> (~2.3 GB) or Roboflow Universe <code>VisDrone2019-DET</code></li>
            <li><strong>Key challenge:</strong> Dense crowd scenes, tiny objects, severe occlusion. imgsz=1280 is mandatory for competitive results.</li>
        </ul>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400">DOTA v2.0 &mdash; Oriented Bounding Box Benchmark</h4>
        <p class="text-slate-300 text-sm">Standard benchmark for <strong>oriented bounding box (OBB)</strong> detection in satellite/aerial imagery. Annotations use 8-coordinate OBB format: (x1,y1, x2,y2, x3,y3, x4,y4) clockwise.</p>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mt-2">
            <li><strong>DOTA-v2.0:</strong> 11,268 images, 1,793,658 instances, 18 categories (adds airport, helipad). Best for ship/aircraft/vehicle detection from satellite altitude.</li>
            <li><strong>DOTA-v1.0:</strong> 2,806 images, 188,282 instances, 15 categories &mdash; the widely-cited baseline.</li>
            <li><strong>Access:</strong> <a href="https://captain-whu.github.io/DOTA/dataset.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">captain-whu.github.io/DOTA</a> &mdash; registration required. Ultralytics also supports direct dataset download.</li>
        </ul>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400">AU-AIR &mdash; Multi-modal UAV Dataset</h4>
        <p class="text-slate-300 text-sm">First multi-modal UAV dataset combining RGB video with synchronized flight telemetry. 8 video clips, ~2 hours, 32,823 annotated frames, 8 traffic classes. RGB + GPS + altitude + IMU + velocity per frame. Use case: training and evaluating multi-modal fusion models that combine visual features with flight state.</p>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-4">
        <h4 class="mt-0 border-none text-sky-400">2024-2025 Newer Aerial Datasets</h4>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-2 mt-2">
            <li><strong>M3OT (2025):</strong> Multi-Drone Multi-Modality dataset for Multi-Object Tracking. 21,580 frames, 10,790 paired RGB-IR images, 220,000 bounding boxes. Useful for IR-visible fusion tracking.</li>
            <li><strong>CODrone (2025):</strong> Comprehensive Oriented Object Detection benchmark for UAV. Multi-city, multi-lighting, OBB annotations. GitHub: <code>AHideoKuzeA/CODrone</code>.</li>
            <li><strong>RFUAV (2025):</strong> Radio-frequency UAV identification &mdash; 1.3 TB raw RF data from 37 UAV types using USRP SDR. For RF-domain drone detection, not visual.</li>
            <li><strong>Mid-Air (synthetic):</strong> 54 synthetic trajectories, 420k+ frames with RGB, depth, surface normals, stereo disparity, object semantics. Useful for pre-training before domain adaptation.</li>
        </ul>
    </div>

    <h3>10.3 Synthetic Data Generation</h3>
    <p>Obtaining labeled aerial data at scale for rare scenarios (night, fire, CBRN events, contested airspace) is operationally impractical. Synthetic data from physics-based simulators fills the gap, but introduces a <strong>domain gap</strong> &mdash; the delta between simulated and real-world sensor statistics.</p>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Dimension</th>
                    <th class="p-3">Real Data</th>
                    <th class="p-3">Synthetic Data (Isaac Sim)</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Acquisition cost</td>
                    <td class="p-3 text-slate-400">High &mdash; flight permits, crew, weather</td>
                    <td class="p-3 text-emerald-400">Near-zero marginal cost after setup</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 text-slate-300 font-semibold">Annotation cost</td>
                    <td class="p-3 text-slate-400">$0.05&ndash;$0.15 per bounding box (crowd)</td>
                    <td class="p-3 text-emerald-400">Automatic &mdash; ground truth from renderer</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Rare-event coverage</td>
                    <td class="p-3 text-red-400">Very difficult &mdash; unsafe or illegal to capture</td>
                    <td class="p-3 text-emerald-400">Trivial &mdash; script the scenario</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 text-slate-300 font-semibold">Domain gap</td>
                    <td class="p-3 text-emerald-400">Zero (is the real domain)</td>
                    <td class="p-3 text-red-400">5&ndash;30% mAP gap; reduces with domain randomization</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-semibold">Sensor noise modeling</td>
                    <td class="p-3 text-emerald-400">Ground truth sensor noise</td>
                    <td class="p-3 text-amber-400">Approximate &mdash; camera ISP pipeline not fully simulated</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 text-slate-300 font-semibold">Best use</td>
                    <td class="p-3 text-emerald-400">Fine-tuning, final evaluation</td>
                    <td class="p-3 text-emerald-400">Pre-training backbone, rare scenario augmentation</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-sky-400 text-sm">NVIDIA Isaac Sim + Replicator: Domain Randomization API</h4>
        <p class="text-slate-300 text-sm mb-3">Isaac Sim 4.x (2025) ships with the Replicator extension for synthetic data generation (SDG). Replicator randomizes scene attributes (lighting, materials, camera pose, object placement) and exports annotated frames automatically. The recommended workflow for drone perception:</p>
        <ol class="text-slate-300 text-sm list-decimal pl-5 space-y-1">
            <li>Build an urban/suburban USD scene in Isaac Sim (import from OpenStreetMap or NVIDIA City Sample)</li>
            <li>Place asset library: vehicles, people, infrastructure from NVIDIA Omniverse Exchange</li>
            <li>Attach a Replicator camera rig at drone-representative altitudes (20m, 50m, 70m)</li>
            <li>Use domain randomization: randomize lighting azimuth/elevation, surface textures, vehicle colors, background foliage</li>
            <li>Export frames as KITTI, COCO, or YOLO format &mdash; ground-truth bounding boxes generated automatically</li>
            <li>Mix synthetic pre-training data with ~20% real-world fine-tuning data; measure domain gap on held-out real test set</li>
        </ol>
        <p class="text-slate-300 text-sm mt-3"><strong>Domain gap rule of thumb:</strong> For object classes at 5-10m drone altitude, synthetic-only models show 5-10% mAP gap. At 50m+, the gap widens to 20-30% if ISP noise is not modeled. Adding 10-15% real images to the training mix typically closes the gap to &lt;5%.</p>
    </div>

    <h3>10.4 Annotation Tools (2025)</h3>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
        <div class="hw-card p-4 rounded-xl">
            <h4 class="text-sky-400 mt-0 text-sm font-bold">Roboflow (2025)</h4>
            <p class="text-slate-300 text-xs mt-1">SaaS + open-source inference. AI-assisted labeling with Label Assist, Smart Polygon, Box Prompting, and Auto Label powered by foundation models. Dataset versioning + augmentation pipeline built-in. RF-DETR training directly in platform. Free tier: 10,000 source images.</p>
            <p class="text-slate-300 text-xs mt-2">New in 2025: Synthetic data pipeline using NVIDIA Cosmos + Isaac Sim for defect and rare-class generation.</p>
            <a href="https://roboflow.com" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline text-xs">roboflow.com</a>
        </div>
        <div class="hw-card p-4 rounded-xl">
            <h4 class="text-sky-400 mt-0 text-sm font-bold">Label Studio</h4>
            <p class="text-slate-300 text-xs mt-1">Open-source, self-hostable. Supports YOLO, COCO, Pascal VOC export. Model-in-the-loop pre-annotation via ML backends. Best for teams needing data sovereignty (air-gapped, on-prem).</p>
            <p class="text-slate-300 text-xs mt-2">Integrates with MLflow for tracking annotation-to-training lineage.</p>
            <a href="https://labelstud.io" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline text-xs">labelstud.io</a>
        </div>
        <div class="hw-card p-4 rounded-xl">
            <h4 class="text-sky-400 mt-0 text-sm font-bold">CVAT</h4>
            <p class="text-slate-300 text-xs mt-1">Intel-developed, open-source. Semi-automatic annotation via Segment Anything Model (SAM) integration. Best for <strong>video annotation</strong> with track interpolation across frames &mdash; essential for VisDrone video clips and AU-AIR dataset.</p>
            <a href="https://cvat.ai" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline text-xs">cvat.ai</a>
        </div>
    </div>

    <h3>10.5 Model Selection (2025)</h3>
    <p>The detector lineage matters because each generation changed what deployment looks like, not just the mAP number. YOLOv8 established the C2f backbone and the modern Ultralytics API. YOLO11 (October 2024) introduced C3k2 blocks and C2PSA spatial attention. YOLO12 (February 2025) added area-attention for roughly 1.2% mAP. <strong class="text-white">YOLO26 (January 2026) is the current recommendation</strong>, and it is the first release in years whose headline change is architectural rather than incremental.</p>

    <div class="bg-slate-800/60 border border-emerald-700/60 rounded-xl p-5 mb-6">
        <h4 class="text-emerald-400 font-bold text-base mt-0 mb-3">YOLO26 — Why NMS-Free Matters More Than the mAP Gain</h4>
        <p class="text-slate-300 text-sm mb-3">YOLO26 ships a <strong class="text-white">one-to-one detection head that produces final predictions without non-maximum suppression</strong>. Every prior YOLO generation emitted hundreds of overlapping candidate boxes that a separate NMS pass then filtered. Removing that step changes three things that matter far more on an aircraft than a point of mAP:</p>
        <ul class="text-slate-300 text-sm space-y-2 list-disc list-inside mb-3">
            <li><strong class="text-white">Latency becomes deterministic.</strong> NMS cost scales with how many objects are in frame — an empty sky is cheap, a cluttered urban scene is expensive. That means the old pipeline's worst-case latency arrived exactly when the scene was most demanding. A one-to-one head costs the same every frame, which is what a control loop actually needs.</li>
            <li><strong class="text-white">Export stops being fragile.</strong> NMS was the part of the graph that most often failed to convert cleanly to TensorRT, ONNX, or a vendor NPU compiler, forcing custom plugins or CPU fallback. An end-to-end graph exports as one artifact.</li>
            <li><strong class="text-white">The CPU stops being the bottleneck.</strong> On NPU-based accelerators, NMS frequently ran on the host CPU while the NPU idled. Ultralytics reports up to 43% faster CPU inference for YOLO26 overall.</li>
        </ul>
        <p class="text-slate-400 text-xs">Supporting changes: <strong class="text-slate-200">DFL removal</strong> simplifies the head while keeping an unconstrained regression range; <strong class="text-slate-200">Progressive Loss</strong> shifts training emphasis toward the inference-time architecture; <strong class="text-slate-200">STAL (Small-Target-Aware Label assignment)</strong> improves positive-label coverage for small objects — directly relevant to aerial imagery, where targets are a handful of pixels; and <strong class="text-slate-200">MuSGD</strong>, a hybrid SGD/Muon optimizer borrowed from LLM training practice. YOLO26 is also a single multi-task family covering detection, instance and semantic segmentation, monocular depth, classification, pose, and oriented bounding boxes (OBB) — OBB being the natural fit for overhead imagery where objects have arbitrary heading.</p>
    </div>

    <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">YOLO26 Detection Variants &mdash; COCO</div>
        <div class="p-4 overflow-x-auto">
            <table class="w-full text-xs font-mono text-slate-300">
                <thead class="text-slate-400 border-b border-slate-700">
                    <tr><th class="py-1 pr-6 text-left">Model</th><th class="py-1 pr-6 text-left">Params (M)</th><th class="py-1 pr-6 text-left">mAP<sup>50-95</sup></th><th class="py-1 pr-6 text-left">CPU ONNX (ms)</th><th class="py-1 text-left">T4 TensorRT (ms)</th></tr>
                </thead>
                <tbody>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-6 text-emerald-400">YOLO26n</td><td class="py-1 pr-6">2.4</td><td class="py-1 pr-6">40.9</td><td class="py-1 pr-6">38.9</td><td class="py-1">1.7</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-6 text-emerald-400">YOLO26s</td><td class="py-1 pr-6">9.5</td><td class="py-1 pr-6">48.6</td><td class="py-1 pr-6">87.2</td><td class="py-1">2.5</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-6">YOLO26m</td><td class="py-1 pr-6">20.4</td><td class="py-1 pr-6">53.1</td><td class="py-1 pr-6">220.0</td><td class="py-1">4.7</td></tr>
                    <tr class="border-b border-slate-800"><td class="py-1 pr-6">YOLO26l</td><td class="py-1 pr-6">24.8</td><td class="py-1 pr-6">55.0</td><td class="py-1 pr-6">286.2</td><td class="py-1">6.2</td></tr>
                    <tr><td class="py-1 pr-6">YOLO26x</td><td class="py-1 pr-6">55.7</td><td class="py-1 pr-6">57.5</td><td class="py-1 pr-6">525.8</td><td class="py-1">11.8</td></tr>
                </tbody>
            </table>
        </div>
        <p class="text-slate-400 text-xs px-4 pb-3">Compare against the YOLO11 table below: YOLO26n reaches 40.9 mAP with 2.4M parameters where YOLO11n managed 39.5 with 2.6M — better accuracy from a smaller model, before counting the NMS savings. Note these are T4 datacenter-GPU latencies; a Jetson Orin Nano will be several times slower, so use them for <em>relative</em> comparison between variants, not for sizing your loop rate.</p>
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">Video: Deploying YOLO26 Without NMS</h3>
        <p class="text-slate-400 text-sm mb-3">Ultralytics' own short walkthrough of what removing non-maximum suppression changes at export and deployment time. Vertical format — sized accordingly.</p>
        <div class="mx-auto" style="max-width:320px;">
            <div class="relative w-full" style="padding-bottom:177.78%;">
                <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/mvuy6rYrnEU" title="Deploy Ultralytics YOLO26 Anywhere — No NMS Required" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
        </div>
    </div>

    <div class="bg-slate-900 p-4 rounded border-l-4 border-amber-500 mb-6">
        <strong class="text-amber-400 block mb-1">When to stay on YOLO11</strong>
        <p class="text-slate-400 text-sm">YOLO11 remains a perfectly good production detector and has the deepest ecosystem validation — mature TensorRT, Hailo HEF, and RKNN conversion paths, and years of accumulated deployment knowledge. Stay on it if your vendor NPU compiler does not yet handle the YOLO26 one-to-one head cleanly (verify before committing — this is the single most important thing to test on non-NVIDIA accelerators), if you have a qualified model already flying and no performance complaint, or if your certification evidence is tied to a frozen model version. Migrate when you are starting fresh, when post-processing latency variance is hurting your control loop, or when small-object recall at altitude is your limiting factor.</p>
    </div>

    <p class="text-slate-300 text-sm mb-3">The YOLO11 figures below remain a useful reference point, both for fleets already deployed on it and for understanding what YOLO26 improved on.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">YOLO11 Detection Variants &mdash; COCO val2017</div>
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
        <h4 class="mt-0 border-none text-amber-400 text-sm">Model Selection by TOPS Budget</h4>
        <table class="w-full text-xs text-slate-300 mt-2">
            <thead><tr class="text-sky-400 border-b border-slate-700">
                <th class="text-left py-1 pr-4">Hardware</th>
                <th class="text-left py-1 pr-4">AI TOPS</th>
                <th class="text-left py-1 pr-4">Recommended Model</th>
                <th class="text-left py-1">Notes</th>
            </tr></thead>
            <tbody>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">Hailo-8</td><td class="py-1 pr-4">26 TOPS</td><td class="py-1 pr-4">YOLO11n/s</td><td class="py-1">HEF format. YOLO11s at 640 &gt;30fps at ~2.5W.</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">Hailo-8L</td><td class="py-1 pr-4">13 TOPS</td><td class="py-1 pr-4">YOLO11n</td><td class="py-1">RPi AI HAT+. Nano fits within 13 TOPS at 30fps@640.</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">Jetson Orin NX 8GB</td><td class="py-1 pr-4">70&ndash;100 TOPS*</td><td class="py-1 pr-4">YOLO11m/l</td><td class="py-1">TRT INT8. *Super Mode (JetPack 6.2) adds ~70% TOPS.</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">Jetson AGX Orin</td><td class="py-1 pr-4">275 TOPS</td><td class="py-1 pr-4">YOLO11l/x</td><td class="py-1">Also suitable for RT-DETR-R50 + concurrent SLAM.</td></tr>
                <tr><td class="py-1 pr-4">RK3588 (RK NPU)</td><td class="py-1 pr-4">6 TOPS</td><td class="py-1 pr-4">YOLO11n</td><td class="py-1">RKNN format. 6 TOPS limits to nano at real-time speed.</td></tr>
            </tbody>
        </table>
        <p class="text-slate-400 text-xs mt-2">*JetPack 6.2 (2025) Super Mode increases Orin NX AI TOPS by up to 70% and Orin Nano memory bandwidth by 50%. Requires enabling in nvpmodel.</p>
    </div>

    <h3>10.6 Training Pipeline</h3>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Bash: YOLO11 Training Commands (Ultralytics 8.3+)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Show Training Script</summary>
<pre><code class="language-bash"># Fine-tune YOLO11s on VisDrone -- recommended baseline
# imgsz=1280 critical for small objects; batch=-1 auto-scales to VRAM
# multi_scale=True trains at [0.5, 1.5]x imgsz, simulating altitude variation
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

# Transfer learning: frozen backbone (first 5 epochs)
# freeze=10 freezes backbone layers 0-9; unfreeze for full fine-tune
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
        <h4 class="mt-0 border-none text-white text-sm">Transfer Learning Strategy &amp; Augmentation Rationale</h4>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mt-2">
            <li><strong>Phase 1 &mdash; Frozen backbone (epochs 1-5):</strong> freeze=10, lr0=0.001. Adapts detection head to aerial class distributions without destroying COCO-pretrained backbone features.</li>
            <li><strong>Phase 2 &mdash; Full fine-tune (epochs 6-100):</strong> Remove freeze, lr0=0.01 with cosine LR decay (cos_lr=True). Slow cosine descent suits small object tuning where the model needs sustained moderate LR.</li>
            <li><strong>Mosaic (mosaic=1.0):</strong> Tiles 4 images. Increases object density per image; critical for aerial. Never disable for aerial training.</li>
            <li><strong>multi_scale=True:</strong> Randomly scales imgsz &times; [0.5, 1.5] each batch. Directly simulates altitude variation with zero additional data.</li>
            <li><strong>flipud=0.0:</strong> Disabled. No physical drone scenario produces an upside-down image. Wastes augmentation budget.</li>
            <li><strong>HSV shifts:</strong> hsv_h=0.015 (seasonal/TOD variation), hsv_s=0.7 (overcast vs. sunny), hsv_v=0.4 (shadow/lighting). Most impactful augmentations after mosaic for aerial domain shift.</li>
            <li><strong>VRAM note:</strong> YOLO11s @ imgsz=1280 requires ~14 GB with batch=8. batch=-1 auto-selects safe batch size. On 24 GB RTX 4090, expect batch=4-6 for YOLO11m.</li>
        </ul>
    </div>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">NVIDIA YOLO11 Ecosystem Overview</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/nQBOkGR_lg0" title="YOLO11 TensorRT Object Detection on Jetson Orin &mdash; 100FPS with Ultralytics" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-gray-400 text-sm text-center mt-2">YOLO11 TensorRT INT8 engine achieving 100 FPS on Jetson Orin with Ultralytics 8.3+. Demonstrates the complete export-to-deploy workflow on JetPack 6.</p>
    </div>

    <h3>10.7 Model Optimization: Pruning, Distillation, and Quantization</h3>
    <p>Before building a TensorRT engine, apply model compression to reduce parameter count and memory footprint. The standard 2025 order of operations is: <strong>prune &rarr; distill &rarr; quantize</strong>. Each stage is independent and multiplicative in effect.</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-violet-400 text-sm">Structured Pruning</h4>
            <p class="text-slate-300 text-sm">Removes entire channels or layers with low L1-norm weight magnitude. TAO Toolkit 6.x prune command supports magnitude-based structured pruning. Typical result: 30-50% parameter reduction with &lt;2% mAP drop if retrained post-prune for 10-20 epochs. Required before QAT for best results.</p>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-violet-400 text-sm">Knowledge Distillation</h4>
            <p class="text-slate-300 text-sm">Trains a small student model to match the soft output distribution of a larger teacher. TAO 6.x supports distillation natively. A YOLO11n student trained against a YOLO11l teacher gains ~2-4 mAP50 points with no parameter increase. Effective when the target platform TOPS budget is fixed and the task is classification-heavy.</p>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-violet-400 text-sm">Quantization-Aware Training (QAT)</h4>
            <p class="text-slate-300 text-sm">Inserts fake-quantization nodes during training so the model learns to compensate for INT8 rounding. Recovers most of the accuracy lost in post-training quantization (PTQ). 10-20 extra fine-tuning epochs with QAT leaves &lt;1% mAP drop vs. FP32, compared to 1-5% for PTQ. NVIDIA Model Optimizer 0.25+ supports QAT for YOLO architectures.</p>
        </div>
    </div>

    <h3>10.8 Quantization Deep Dive</h3>

    <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">Format</th>
                    <th class="p-3">Bits</th>
                    <th class="p-3">Memory vs FP32</th>
                    <th class="p-3">Typical mAP50 Drop</th>
                    <th class="p-3">Speedup (Orin)</th>
                    <th class="p-3">Supported by TRT 10</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono font-bold">FP32</td>
                    <td class="p-3 text-slate-400">32</td>
                    <td class="p-3 text-slate-400">1x (baseline)</td>
                    <td class="p-3 text-emerald-400">0% (reference)</td>
                    <td class="p-3 text-slate-400">1x</td>
                    <td class="p-3 text-emerald-400">Yes</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 text-slate-300 font-mono font-bold">BF16</td>
                    <td class="p-3 text-slate-400">16</td>
                    <td class="p-3 text-slate-400">0.5x</td>
                    <td class="p-3 text-emerald-400">&lt;0.1%</td>
                    <td class="p-3 text-amber-400">1.3&ndash;1.8x</td>
                    <td class="p-3 text-emerald-400">Yes (Ampere+)</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono font-bold">FP16</td>
                    <td class="p-3 text-slate-400">16</td>
                    <td class="p-3 text-slate-400">0.5x</td>
                    <td class="p-3 text-emerald-400">&lt;0.5%</td>
                    <td class="p-3 text-emerald-400">1.5&ndash;2x</td>
                    <td class="p-3 text-emerald-400">Yes</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 text-slate-300 font-mono font-bold">FP8</td>
                    <td class="p-3 text-slate-400">8</td>
                    <td class="p-3 text-slate-400">0.25x</td>
                    <td class="p-3 text-emerald-400">&lt;1%</td>
                    <td class="p-3 text-emerald-400">2&ndash;4x</td>
                    <td class="p-3 text-emerald-400">Yes (TRT 10.2+, Hopper/Ada)</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono font-bold">INT8 PTQ</td>
                    <td class="p-3 text-slate-400">8</td>
                    <td class="p-3 text-slate-400">0.25x</td>
                    <td class="p-3 text-amber-400">1&ndash;5%</td>
                    <td class="p-3 text-emerald-400">2&ndash;4x</td>
                    <td class="p-3 text-emerald-400">Yes</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 text-slate-300 font-mono font-bold">INT8 QAT</td>
                    <td class="p-3 text-slate-400">8</td>
                    <td class="p-3 text-slate-400">0.25x</td>
                    <td class="p-3 text-emerald-400">&lt;1%</td>
                    <td class="p-3 text-emerald-400">2&ndash;4x</td>
                    <td class="p-3 text-emerald-400">Yes</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-mono font-bold">INT4 WoQ</td>
                    <td class="p-3 text-slate-400">4 (weights only)</td>
                    <td class="p-3 text-slate-400">0.125x weights</td>
                    <td class="p-3 text-amber-400">2&ndash;5%</td>
                    <td class="p-3 text-emerald-400">3&ndash;6x memory</td>
                    <td class="p-3 text-amber-400">TRT 10.0+ (Hopper only)</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 text-slate-300 font-mono font-bold">NVFP4</td>
                    <td class="p-3 text-slate-400">4 (fp float)</td>
                    <td class="p-3 text-slate-400">0.125x</td>
                    <td class="p-3 text-emerald-400">&lt;1% on LLMs</td>
                    <td class="p-3 text-emerald-400">4&ndash;8x vs FP16</td>
                    <td class="p-3 text-amber-400">TRT 10.x + Blackwell GPU</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="bg-amber-900/20 border border-amber-500/50 p-4 rounded mb-6 text-amber-200 text-sm">
        <strong>Practical thresholds for drone perception:</strong> FP16 is lossless in practice and should always be the first step &mdash; enable with half=True in the Ultralytics export command. INT8 PTQ with 500+ calibration images from the real deployment domain typically lands at 1-3% mAP drop. If PTQ causes &gt;5% mAP50 drop, switch to INT8 QAT using NVIDIA Model Optimizer &mdash; 10-20 fine-tuning epochs recovers most accuracy. INT4 and NVFP4 are 2025-era options primarily targeting LLMs on Hopper/Blackwell; for YOLO-class CNNs on Jetson Orin (Ampere architecture), INT8 remains the standard.
    </div>

    <h3>10.9 TensorRT 10.x Optimization Workflow</h3>
    <p><a href="https://developer.nvidia.com/tensorrt" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">TensorRT 10.x</a> (shipping with JetPack 6.1+ as TRT 10.3) applies layer fusion, kernel auto-tuning, memory layout optimization, and precision reduction to produce a hardware-specific <code>.engine</code> file. Key TRT 10 additions over TRT 8.x: INT4 weight-only quantization, FP8 convolution support, weight-stripped engines (99% engine size reduction via <code>kSTRIP_PLAN</code>), and a new IPluginV3 framework for custom ops.</p>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: Complete TensorRT 10 Workflow &mdash; PyTorch &rarr; ONNX &rarr; TRT Engine</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Show TensorRT Export Code</summary>
<pre><code class="language-python">from ultralytics import YOLO
import tensorrt as trt
import numpy as np

# ── Step 1: Export trained YOLO11 to ONNX (host machine) ──────────────
model = YOLO("runs/aerial/visdrone_yolo11s/weights/best.pt")

model.export(
    format="onnx",
    imgsz=1280,
    opset=17,           # TensorRT 10 supports up to opset 20; opset 17 for max compat
    simplify=True,      # onnx-simplifier removes redundant nodes
    batch=1,
)
# Output: best.onnx

# ── Step 2a: FP16 engine (fastest, minimal accuracy loss) ─────────────
# Run ON THE TARGET JETSON (engine is hardware-specific)
model.export(
    format="engine",
    imgsz=1280,
    half=True,          # FP16 precision
    batch=1,
    device=0,
)
# Output: best.engine  (~2x faster than FP32, <0.5% mAP drop)

# ── Step 2b: INT8 engine with PTQ calibration ─────────────────────────
model.export(
    format="engine",
    imgsz=1280,
    int8=True,          # INT8 PTQ
    data="VisDrone.yaml",   # Calibration dataset -- uses val split, ~500 images
    batch=1,
    device=0,
)
# Output: best.engine  (~3-4x faster than FP32, 1-5% mAP drop)

# ── Step 3: Run inference with TRT engine ─────────────────────────────
trt_model = YOLO("best.engine")
results = trt_model("drone_frame.jpg", imgsz=1280)
results[0].show()

# ── Step 4: trtexec benchmark (from JetPack terminal) ─────────────────
# trtexec --onnx=best.onnx --saveEngine=best.engine \\
#         --fp16 --workspace=4096 --iterations=100 \\
#         --avgRuns=100 --percentile=99
# Reports: mean latency, 99th-percentile latency, throughput (queries/s)</code></pre>
</details>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: NVIDIA TAO Toolkit 6.x &mdash; Prune &rarr; Retrain &rarr; Export</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Show TAO Toolkit Script</summary>
<pre><code class="language-python"># TAO Toolkit 6.x CLI (tao command installed via pip install nvidia-tao)
# TAO manages the full train-prune-retrain-export cycle with a single config

# 1. Train baseline DetectNet_v2 or YOLO model via TAO
# tao model detectnet_v2 train -e spec.yaml -r ./results

# 2. Prune: remove low-magnitude channels (30-50% param reduction)
# tao model detectnet_v2 prune \\
#     -m ./results/weights/resnet18_detector.tlt \\
#     -o ./results/pruned.tlt \\
#     -pth 0.1    # pruning threshold -- higher = more aggressive

# 3. Retrain pruned model (restores accuracy)
# tao model detectnet_v2 train -e spec_retrain.yaml -r ./results_pruned

# 4. Export to ONNX with QDQ quantization nodes (ready for TRT INT8)
# tao model detectnet_v2 export \\
#     -m ./results_pruned/weights/resnet18_detector.tlt \\
#     -o ./model_int8.onnx \\
#     --gen_ds_config \\     # generates DeepStream config
#     --data_type INT8 \\
#     --cal_image_dir ./calib_images/

# Python API alternative (TAO 6.x microservices via REST):
import requests, json

# TAO Fine-Tuning Microservice (FTMS) -- cloud or on-prem NGC container
FTMS_URL = "http://localhost:8000/api/v1"

payload = {
    "model": "yolo11s",
    "dataset": "s3://my-bucket/visdrone/",
    "num_epochs": 100,
    "img_size": 1280,
    "precision": "int8",
}
resp = requests.post(f"{FTMS_URL}/train", json=payload)
job_id = resp.json()["job_id"]
print(f"TAO training job: {job_id}")</code></pre>
</details>
        </div>
    </div>

    <h3>10.10 JetPack 6.x Software Stack</h3>
    <p><a href="https://developer.nvidia.com/embedded/jetpack-sdk-62" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">JetPack 6.2</a> (2025) is the current production release for all Jetson Orin modules. It ships Ubuntu 22.04 LTS, Kernel 5.15, and the following AI stack:</p>

    <div class="overflow-x-auto my-4">
        <table class="w-full text-sm text-left">
            <thead class="bg-slate-700 text-slate-300">
                <tr>
                    <th class="p-3">JetPack</th>
                    <th class="p-3">Release</th>
                    <th class="p-3">CUDA</th>
                    <th class="p-3">TensorRT</th>
                    <th class="p-3">cuDNN</th>
                    <th class="p-3">Notes</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300">6.0</td>
                    <td class="p-3 text-slate-400">May 2024</td>
                    <td class="p-3 text-slate-400">12.2</td>
                    <td class="p-3 text-amber-400">8.6</td>
                    <td class="p-3 text-slate-400">8.9</td>
                    <td class="p-3 text-slate-400">First production JP6; Ubuntu 22.04</td>
                </tr>
                <tr class="bg-slate-800/50">
                    <td class="p-3 text-slate-300">6.1</td>
                    <td class="p-3 text-slate-400">Sep 2024</td>
                    <td class="p-3 text-slate-400">12.6</td>
                    <td class="p-3 text-emerald-400">10.3</td>
                    <td class="p-3 text-slate-400">9.3</td>
                    <td class="p-3 text-slate-400">TRT 10 debut on Jetson; firmware TPM</td>
                </tr>
                <tr class="bg-slate-800">
                    <td class="p-3 text-slate-300 font-bold">6.2</td>
                    <td class="p-3 text-emerald-400 font-bold">2025 (current)</td>
                    <td class="p-3 text-slate-400">12.6</td>
                    <td class="p-3 text-emerald-400">10.3</td>
                    <td class="p-3 text-slate-400">9.3</td>
                    <td class="p-3 text-emerald-400">Super Mode: +70% TOPS on Orin NX/Nano</td>
                </tr>
            </tbody>
        </table>
    </div>

    <p class="text-slate-300 text-sm mb-4"><strong>Super Mode</strong> (JetPack 6.2): Enables above-specification power modes for Orin NX and Orin Nano modules. Orin NX series gains up to 70% AI TOPS; Orin Nano gains 50% memory bandwidth and up to 2x generative AI inference performance. Enable with <code>sudo nvpmodel -m 0</code> and confirm with <code>sudo jetson_clocks</code>.</p>

    <figure class="my-6">
        <img src="images/m10_jetson_software_stack.svg" alt="NVIDIA Jetson Software Stack Diagram showing layers from hardware to application" class="rounded-lg w-full bg-white p-2">
        <figcaption class="text-gray-400 text-sm text-center mt-2">NVIDIA Jetson software stack: from SoC hardware through Jetson Linux, AI libraries (CUDA, TensorRT, cuDNN), Jetson Platform Services, and application frameworks. Source: <a href="https://developer.nvidia.com/embedded/develop/software" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">NVIDIA Developer</a></figcaption>
    </figure>

    <h3>10.11 NVIDIA DeepStream 7.x &mdash; Production Video Analytics Pipeline</h3>
    <p><a href="https://developer.nvidia.com/deepstream-getting-started" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">DeepStream SDK 7.x</a> is NVIDIA's GStreamer-based streaming analytics toolkit. It wraps TensorRT inference inside a GStreamer plugin pipeline, handling multi-camera input, hardware-accelerated decode (NVDEC), inference on DLA and GPU, multi-object tracking (NvDCF, DeepSORT), and output to RTSP or Kafka. For drone payloads streaming to a GCS or edge server, DeepStream is the production-grade alternative to writing raw OpenCV loops.</p>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-sky-400 text-sm">DeepStream 7.x Key Features &amp; Capabilities</h4>
        <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1 mt-2">
            <li><strong>Multi-stream scaling:</strong> Orin AGX handles up to 8 streams per DLA (16 total); Orin NX 16GB: 4 per DLA (8 total); Orin NX 8GB: 4 streams; Orin Nano: 4 streams.</li>
            <li><strong>DLA offload:</strong> Runs detection on DLA (Deep Learning Accelerator) to free the iGPU for computer vision postprocessing. PeopleNet 2.6 + DLA offload demonstrated on Orin AGX.</li>
            <li><strong>LiDAR inference (DS 7.0):</strong> New end-to-end sample for PointPillarNet 3D bounding box inference on point-cloud data &mdash; relevant for drone-mounted LiDAR payloads.</li>
            <li><strong>NvDCF tracker:</strong> Multi-object tracker with optional PVA (Programmable Vision Accelerator) backend on Orin &mdash; reduces GPU load for tracking-heavy missions.</li>
            <li><strong>YOLO11 integration:</strong> Ultralytics publishes a full guide for deploying YOLO11 via DeepStream + TensorRT on Jetson Orin with DeepStream Python bindings.</li>
        </ul>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Bash: DeepStream 7.x Pipeline for YOLO11 on Jetson (JetPack 6)</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Show DeepStream Pipeline Script</summary>
<pre><code class="language-bash"># Install DeepStream 7.x on JetPack 6
# (Pre-installed in NVIDIA L4T ML Docker container; or install via apt)
sudo apt install deepstream-7.0

# DeepStream Python bindings (pyds)
pip install pyds

# Reference app: deepstream-test3 (multi-stream detector + tracker)
# config_infer_primary_yoloV11.txt points to your .engine file and labels

# Key sections of config_infer_primary_yoloV11.txt:
# [property]
# gpu-id=0
# net-scale-factor=0.0039215697906911373
# model-engine-file=best.engine
# labelfile-path=visdrone_labels.txt
# batch-size=1
# network-mode=2          # 0=FP32, 1=INT8, 2=FP16
# num-detected-classes=10
# interval=0              # Infer every frame (set 1 to skip alternate frames)

# Run reference app
python3 deepstream_test3.py \\
    -i file:///drone_footage.mp4 \\
    --cfg-file config_infer_primary_yoloV11.txt

# For live RTSP stream from drone:
# -i rtsp://192.168.1.10:8554/live</code></pre>
</details>
        </div>
    </div>

    <h3>10.12 Full Edge Export Workflow: Jetson, Hailo, RKNN</h3>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: Multi-Target Export Pipeline</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Show Full Export Script</summary>
<pre><code class="language-python">from ultralytics import YOLO

model = YOLO("runs/aerial/visdrone_yolo11s/weights/best.pt")

# ── Path 1: NVIDIA Jetson (JetPack 6, TensorRT 10.3) ──────────────────
# Must run ON the target Jetson GPU -- engine is device-specific
model.export(
    format="engine",
    imgsz=1280,
    half=True,              # FP16 -- recommended starting point
    batch=1,
    device=0,
)
# For INT8: set int8=True, data="VisDrone.yaml" (uses val split for calib)

# ── Path 2: Hailo-8 (hailo_sdk_client v3.28+) ─────────────────────────
# Step A: Export ONNX (run on x86 host)
model.export(format="onnx", imgsz=640, opset=11, simplify=True)

# Step B: Hailo Dataflow Compiler (hailo_sdk_client)
# Run on x86 host machine (NOT on Hailo device)
# hailo parse onnx best.onnx --net-name yolo11s
# hailo optimize yolo11s.har --calib-path /path/to/calib_images/
# hailo compile yolo11s_optimized.har --hw-arch hailo8
# Output: yolo11s.hef  -- deploy via HailoRT Python API

# ── Path 3: Rockchip RK3588 (rknn-toolkit2) ───────────────────────────
model.export(format="rknn", imgsz=640)   # native Ultralytics RKNN export

# Or via rknn-toolkit2 directly:
# from rknn.api import RKNN
# rknn = RKNN()
# rknn.load_onnx(model="best.onnx")
# rknn.build(do_quantization=True, dataset="./calib_list.txt")
# rknn.export_rknn("best.rknn")

# ── Path 4: ONNX Runtime (cross-platform, CPU/ARM) ────────────────────
model.export(format="onnx", imgsz=1280, opset=17)
# Deploy with onnxruntime-gpu or onnxruntime on ARM:
# import onnxruntime as ort
# sess = ort.InferenceSession("best.onnx",
#     providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
# outputs = sess.run(None, {"images": input_tensor})</code></pre>
</details>
        </div>
    </div>

    <h3>10.13 Experiment Tracking: MLflow &amp; Weights &amp; Biases</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">MLflow 3.0 (June 2025)</h4>
            <p class="text-slate-300 text-sm">Major pivot in MLflow 3.0: unified AI engineering platform for agents, LLMs, and CV models. Adds OpenTelemetry-compatible tracing, 50+ built-in evaluation metrics, prompt versioning, and AI Gateway. For drone CV pipelines: use <code>mlflow.pytorch.autolog()</code> during YOLO training to automatically log hyperparameters, mAP curves, loss metrics, and model artifacts. Runs a local UI at <code>mlflow ui</code> for self-hosted, air-gapped DoD environments.</p>
            <a href="https://mlflow.org" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline text-xs">mlflow.org</a>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Weights &amp; Biases (W&amp;B)</h4>
            <p class="text-slate-300 text-sm">Developer-first experiment tracking with best-in-class visualization. Acquired by CoreWeave in March 2025. Ultralytics YOLO11 integrates W&amp;B natively: add <code>wandb</code> to callbacks and W&amp;B auto-logs training runs, confusion matrices, PR curves, and sample predictions with bounding box overlays. TAO 6.x also integrates W&amp;B for managed training jobs.</p>
            <p class="text-slate-300 text-sm mt-2">For classified/controlled projects: use W&amp;B Server (self-hosted) or MLflow to keep telemetry on-prem.</p>
            <a href="https://wandb.ai" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline text-xs">wandb.ai</a>
        </div>
    </div>

    <div class="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div class="bg-[#252526] px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400">Python: W&amp;B + Ultralytics YOLO11 Integration</div>
        <div class="p-4 overflow-x-auto">
<details class="code-expand">
    <summary>Show W&amp;B Tracking Script</summary>
<pre><code class="language-python">import wandb
from ultralytics import YOLO

# Initialize W&B run -- auto-logs config, system metrics, model artifacts
wandb.init(
    project="aerial-drone-detection",
    name="yolo11s-visdrone-1280",
    config={
        "model": "yolo11s",
        "dataset": "VisDrone2019",
        "imgsz": 1280,
        "epochs": 100,
        "quantization": "INT8",
        "target_hardware": "Jetson Orin NX 8GB",
    }
)

model = YOLO("yolo11s.pt")

# W&B integration is automatic in Ultralytics when wandb is installed
results = model.train(
    data="VisDrone.yaml",
    imgsz=1280,
    epochs=100,
    batch=-1,
    project="wandb_aerial",  # W&B syncs this run automatically
)

# Log final TRT benchmark results
wandb.log({
    "trt_fp16_latency_ms": 8.2,
    "trt_int8_latency_ms": 5.1,
    "map50_fp32": 44.2,
    "map50_int8": 42.8,
    "map50_drop_pct": 3.2,
})
wandb.finish()</code></pre>
</details>
        </div>
    </div>

    <h3>10.14 Production Monitoring &amp; Active Learning</h3>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-amber-400 text-sm">Closing the Loop: Active Learning Pipeline</h4>
        <p class="text-slate-300 text-sm mb-3">Deployed models degrade over time due to domain shift (new geography, season change, lighting regime). A production aerial AI system needs an active learning loop:</p>
        <ol class="text-slate-300 text-sm list-decimal pl-5 space-y-2">
            <li><strong>Log inference uncertainty:</strong> TensorRT output scores below a confidence threshold (e.g., conf &lt; 0.4) flag frames as uncertain. Log these to object storage (S3 or on-prem NAS).</li>
            <li><strong>Human-in-the-loop review:</strong> Flagged frames are surfaced in Roboflow or Label Studio for rapid annotation. Annotators label only the uncertain subset, not the full stream.</li>
            <li><strong>Automated retraining trigger:</strong> When new labeled data exceeds a threshold (e.g., 500 new images, or mAP drops &gt;2% on holdout), trigger a retraining job. MLflow tracks the lineage from data version to model version.</li>
            <li><strong>Regression test before deployment:</strong> New engine must pass mAP &ge; baseline &minus; 1% on frozen test set. DeepStream integration tests confirm latency &lt; mission SLA before pushing to fleet.</li>
        </ol>
    </div>

    <div class="interactive-panel bg-[#0d1320] border-slate-700 mb-6">
        <h4 class="mt-0 border-none text-amber-400 text-sm">Quantization Validation Thresholds</h4>
        <table class="w-full text-xs text-slate-300 mt-2">
            <thead><tr class="text-sky-400 border-b border-slate-700">
                <th class="text-left py-1 pr-4">Quantization</th>
                <th class="text-left py-1 pr-4">Typical mAP50 drop</th>
                <th class="text-left py-1 pr-4">Speedup (Orin)</th>
                <th class="text-left py-1">Action if &gt;Threshold</th>
            </tr></thead>
            <tbody>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">FP32 &rarr; FP16</td><td class="py-1 pr-4">&lt;0.5%</td><td class="py-1 pr-4">1.5&ndash;2x</td><td class="py-1">No action; lossless in practice</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">FP32 &rarr; INT8 PTQ</td><td class="py-1 pr-4">1&ndash;5%</td><td class="py-1 pr-4">2&ndash;4x</td><td class="py-1">If &gt;5% drop: switch to INT8 QAT (10-20 epochs)</td></tr>
                <tr class="border-b border-slate-800"><td class="py-1 pr-4">FP32 &rarr; INT8 QAT</td><td class="py-1 pr-4">&lt;1%</td><td class="py-1 pr-4">2&ndash;4x</td><td class="py-1">Use QAT as default when accuracy is critical</td></tr>
                <tr><td class="py-1 pr-4">Hailo HEF INT8</td><td class="py-1 pr-4">2&ndash;7%</td><td class="py-1 pr-4">10&ndash;20x vs CPU</td><td class="py-1">If &gt;5% drop: increase calib set, check sensitive layers</td></tr>
            </tbody>
        </table>
        <p class="text-slate-300 text-sm mt-3"><strong>Hard rule:</strong> Transformer-based models (RT-DETR) are more sensitive to INT8 quantization than CNN-based YOLO due to attention softmax precision requirements. Always validate on your <em>actual deployment domain</em> test set, not on COCO.</p>
    </div>

    <figure class="my-6">
        <img src="images/m10_deepinsight_pipeline.jpg" alt="NVIDIA Jetson edge AI deep learning inference pipeline overview" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">NVIDIA Jetson-based deep learning inference pipeline: camera &rarr; CUDA preprocessing &rarr; TensorRT engine &rarr; postprocessing &rarr; application output. Source: <a href="https://github.com/dusty-nv/jetson-inference" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">NVIDIA jetson-inference (GitHub)</a></figcaption>
    </figure>

    <div class="my-8">
        <h3 class="text-xl font-bold text-white mb-3">YOLO11 + DeepStream + TensorRT: Full Stack Deployment</h3>
        <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/AzMXXQXYO4E" title="Crazy Fast YOLO11 Inference with DeepStream and TensorRT on NVIDIA Jetson Orin" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <p class="text-gray-400 text-sm text-center mt-2">YOLO11 inference with NVIDIA DeepStream 7.x and TensorRT on Jetson Orin &mdash; multi-stream pipeline with hardware-accelerated decode and the NvDCF multi-object tracker.</p>
    </div>

    <h3>10.15 VLMs &amp; Foundation Models at the Edge (2025)</h3>
    <p>YOLO-class CNNs classify pre-defined objects. Vision-Language Models (VLMs) enable <strong>semantic scene understanding</strong>: "navigate to the red truck near the damaged building" &mdash; zero-shot, without retraining. The architectural difference: CNNs extract spatial feature maps and pass them through detection heads; VLMs encode both image and language query into a shared embedding space and output grounded predictions.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
        <div class="hw-card p-5 rounded-xl">
            <h4 class="text-white mt-0 text-base">Edge-Deployable VLMs (2025&ndash;2026)</h4>
            <ul class="space-y-3 text-slate-300 text-xs font-mono">
                <li>
                    <strong class="text-sky-400 block">Grounding DINO + SAM2</strong>
                    Open-vocabulary detection: text prompt &rarr; bounding boxes for any described object, zero-shot. SAM2 adds instance masks. ~8&ndash;15 fps on Orin NX 16GB with TensorRT. Production-ready for semantic target detection.
                </li>
                <li>
                    <strong class="text-sky-400 block">LLaVA-Phi-3 Mini (3.8B)</strong>
                    CLIP ViT + Phi-3 Mini language model. Fits in 8GB LPDDR5 on Jetson Orin Nano at FP16. ~2&ndash;4 inference/sec. Use for mission planning queries and pre-flight area assessment.
                </li>
                <li>
                    <strong class="text-sky-400 block">NVIDIA GR00T N1</strong>
                    Dual-system: diffusion transformer for motor control + VLM for goal interpretation. Requires Jetson Thor or AGX Orin. Maps natural language mission goals to multi-step motor primitives.
                </li>
            </ul>
        </div>
        <div class="hw-card p-5 rounded-xl">
            <h4 class="text-white mt-0 text-base">Two-Tier Production Pattern</h4>
            <p class="text-slate-300 text-xs mb-3">VLMs are too slow for 30 fps closed-loop control. The standard architecture:</p>
            <div class="bg-slate-900 p-3 rounded border border-slate-700 text-xs font-mono text-slate-300 space-y-2">
                <p><strong class="text-sky-400">Tier 1 &mdash; Fast loop (30 fps):</strong> YOLO11 TRT engine tracks target bounding box and feeds pixel coordinates to the MAVLink control loop. Runs continuously on GPU.</p>
                <p><strong class="text-sky-400">Tier 2 &mdash; Slow loop (1&ndash;2 fps):</strong> Grounding DINO or LLaVA processes full scene against mission goal. On match, seeds YOLO tracker with new target ROI.</p>
                <p><strong class="text-emerald-400">Result:</strong> Semantic understanding from VLM + real-time control from CNN. Neither works alone for closed-loop drone guidance.</p>
            </div>
        </div>
    </div>

    <h3>10.16 Key References &amp; Tools</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Documentation</h4>
            <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1">
                <li><a href="https://docs.nvidia.com/deeplearning/tensorrt/latest/index.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">TensorRT 10.x Documentation</a> &mdash; quantization, builder API, plugins</li>
                <li><a href="https://docs.nvidia.com/tao/tao-toolkit/latest/index.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">NVIDIA TAO Toolkit 6.x Docs</a> &mdash; train, prune, distill, export</li>
                <li><a href="https://developer.nvidia.com/deepstream-getting-started" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">DeepStream SDK 7.x</a> &mdash; multi-stream GStreamer pipeline</li>
                <li><a href="https://developer.nvidia.com/embedded/jetpack-sdk-62" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">JetPack 6.2 SDK</a> &mdash; Jetson Orin production software stack</li>
                <li><a href="https://docs.ultralytics.com/guides/deepstream-nvidia-jetson" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Ultralytics YOLO + DeepStream Guide</a></li>
            </ul>
        </div>
        <div class="interactive-panel bg-[#0d1320] border-slate-700">
            <h4 class="mt-0 border-none text-sky-400 text-sm">Tools &amp; Datasets</h4>
            <ul class="text-slate-300 text-sm list-disc pl-5 space-y-1">
                <li><a href="https://roboflow.com" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Roboflow</a> &mdash; annotation, augmentation, dataset versioning</li>
                <li><a href="https://labelstud.io" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Label Studio</a> &mdash; open-source, self-hostable annotation</li>
                <li><a href="https://mlflow.org" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">MLflow 3.0</a> &mdash; experiment tracking, model registry</li>
                <li><a href="https://wandb.ai" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Weights &amp; Biases</a> &mdash; developer-first run tracking</li>
                <li><a href="https://github.com/NVIDIA/Model-Optimizer" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">NVIDIA Model Optimizer</a> &mdash; QAT, pruning, INT4/FP8</li>
                <li><a href="https://developer.nvidia.com/isaac/sim" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">NVIDIA Isaac Sim 4.x</a> &mdash; synthetic data generation with Replicator</li>
                <li><a href="https://captain-whu.github.io/DOTA/dataset.html" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">DOTA v2.0</a> &mdash; oriented bounding box aerial benchmark</li>
            </ul>
        </div>
    </div>

    <figure class="my-6">
        <img src="images/m10_ml_workflow.png" alt="Ultralytics YOLO ecosystem showing training, export, and deployment integrations" class="rounded-lg w-full">
        <figcaption class="text-gray-400 text-sm text-center mt-2">Ultralytics YOLO ecosystem: the platform supports training, validation, export to 20+ formats (ONNX, TensorRT, CoreML, TFLite, RKNN), and deployment integrations with cloud and edge targets. Source: <a href="https://ultralytics.com" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">Ultralytics</a></figcaption>
    </figure>

</div>
`;
