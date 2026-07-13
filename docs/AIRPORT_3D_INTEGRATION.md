# Airport 3D Integration Guide

## Configuration file

Edit:

```text
src/app/airport/overview/airport3DConfig.ts
```

Required activation fields:

```ts
enabled: true,
modelUrl: "https://cdn.example.com/gia-binh-airport.glb",
```

`modelUrl` must be empty while no official model is available. The viewer explicitly checks both `enabled` and the trimmed URL before creating a network request.

## Model preparation

- Use GLB/glTF 2.0.
- Use meters and a consistent Y-up coordinate system.
- Apply transforms before export.
- Keep semantically meaningful object/group names.
- Split logical interaction targets into separate nodes.
- Prefer KTX2 textures and Meshopt geometry compression for delivery.
- Keep individual texture dimensions appropriate for the target GPU.
- Provide lower-detail meshes for distant airfield objects where practical.

## DRACO and Meshopt

Meshopt decoding is enabled by default through Three.js `MeshoptDecoder`.

For DRACO models, set `dracoPath` to a decoder directory containing the DRACO decoder assets. The application creates and disposes `DRACOLoader` only when the path is non-empty.

## Camera presets

`AIRPORT_3D_CONFIG.defaultCamera` controls:

- `position`: initial overview camera position.
- `target`: initial `OrbitControls` target.
- `fov`: perspective field of view.
- `near` and `far`: camera clipping planes.

After load, the viewer calculates a model bounding box, centers it on the origin floor and fits the camera using the largest dimension. Recalibrate the default values only if the unloaded technical shell or reset view needs a different composition.

## Hover and focus targets

Target mappings live in:

```text
src/app/airport/overview/airport3DTargets.ts
```

Each target contains:

- Stable application `id`.
- User-facing `label`.
- `objectPatterns` matched against mesh and parent names.
- Related module.
- Optional camera offset for a future focus preset.

Recommended naming convention:

```text
GBI_<AREA>_<OBJECT>_<NUMBER>
```

Examples:

```text
GBI_AIRSIDE_RUNWAY_01
GBI_TERMINAL_MAIN
GBI_ATC_TOWER
GBI_CARGO_WAREHOUSE_01
GBI_UTILITY_PLANT
```

Use a browser console warning or a temporary development diagnostic to identify unmatched target names. Do not ship a model that depends on generated exporter names.

## Interaction lifecycle

`useAirport3DInteraction.ts` owns:

1. Scene, renderer and camera creation.
2. Ambient, directional and rim lighting.
3. Orbit controls and damping.
4. Technical grid, placeholder outline and particles.
5. GLTF loading with progress and error state.
6. Mesh traversal and semantic target registration.
7. Raycasting for hover/click candidates.
8. Model centering and camera fit.
9. ResizeObserver-based renderer resizing.
10. Animation frame lifecycle.
11. Geometry, material, texture, controls and renderer disposal.

Keep all future Three.js resources inside this lifecycle or provide an explicit cleanup callback.

## Animation handling

The initial airport shell does not assume animation clip names. When a production model supplies clips:

1. Create one `THREE.AnimationMixer` for the loaded root.
2. Register clips by stable semantic name.
3. Start only required ambient animations.
4. Keep operational state animation separate from navigation focus animation.
5. Update mixers from the existing render clock.
6. Stop actions and uncache the mixer during cleanup.

Avoid starting every clip automatically on a large airport model.

## CORS and hosting

The model host must allow the application origin through `Access-Control-Allow-Origin`. The same applies to external `.bin`, textures and DRACO assets referenced by glTF.

Recommended production delivery:

- HTTPS CDN or object storage.
- Immutable versioned model URLs.
- Correct `model/gltf-binary` MIME type for GLB.
- Compression enabled at the CDN where useful.
- Health monitoring and a rollback version.

The UI preserves the technical shell and displays a non-blocking error if model loading fails.

## Acceptance checklist

- Empty `modelUrl` creates no request and does not crash.
- GLB loads with visible progress.
- Meshopt model decodes.
- DRACO model decodes when `dracoPath` is set.
- Model is centered and camera-fitted.
- Orbit controls stay bounded.
- Target meshes are clickable.
- Reset returns to the airport overview.
- Resizing does not stretch the canvas.
- Repeated 2D/3D switching does not leak WebGL contexts.
- Network/CORS failure leaves the rest of the platform usable.
