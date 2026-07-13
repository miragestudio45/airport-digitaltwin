# Gia Bình Smart Airport - Feedback Fixes

## Implemented

1. Fixed overlap between the Airport Overview navigation button and the Data Layers toolbar.
2. Operational Overview, Operational Insights, Spatial Hierarchy and Operational Readiness now open as compact right-side drawers.
3. Every overview sidebar item now opens a complete information flow.
4. Added expand-to-center and restore-to-compact controls for overview drawers.
5. Spatial Hierarchy nodes are now interactive and expose assets, systems, alerts, readiness, related module navigation, 2D locate and 3D open actions.
6. Non-overview modules now use a docked responsive sidebar by default. Collapsing the sidebar expands the content area; reopening it shrinks the content area.
7. Rebuilt the Safety module with distinct flows for CCTV/VMS, access control, perimeter, restricted zones, fire/life safety, airside safety, emergency command and incident management.
8. Integrated `public/models/Airport.glb` into Overview 3D.
9. Improved Three.js rendering with ACES tone mapping, multi-directional lighting, PMREM environment, soft shadows, technical grid and animated night star fields.
10. Improved Vietnamese technical terminology across overview, 3D, spatial hierarchy and Safety.

## Start locally

Double-click `OPEN_GIA_BINH.cmd`, or run:

```bat
npm.cmd run dev
```

Open:

```text
http://localhost:5173/site/gia-binh
```

## 3D model

Source file:

```text
public/models/Airport.glb
```

Configuration:

```text
src/app/airport/overview/airport3DConfig.ts
```

Target mapping:

```text
src/app/airport/overview/airport3DTargets.ts
```

## Build verification

The project was successfully built with Vite 6.4.3 after the changes.
