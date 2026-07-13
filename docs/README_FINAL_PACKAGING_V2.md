# Gia Binh Smart Airport — Product Packaging Update V2

## Added BIM models
FM & Asset Management → BIM Explorer now loads:
- `Passenger Terminal` → `/public/models/bim/Passenger-Terminal.glb`
- `Airside Infrastructure` → `/public/models/bim/Airside-Infrastructure.glb`

The BIM viewer includes model switching from the model tree, loading progress, orbit/pan/zoom, reset camera, wireframe mode, fit-to-model, adaptive grid and model connection status.

## Overview 3D refinements
- Initial Orbit fit is closer/larger.
- Star particles are much smaller and denser.
- Star opacity no longer pulses, reducing visible flicker.
- Grid/ring planes are offset below the airport model to reduce z-fighting.
- Shadow bias/normal bias were tuned to reduce shadow shimmer.
- Walk speed reduced.
- Walk eye height raised slightly.

## Tables
- Operational table column headers are now globally reduced to 8px with tighter tracking and line-height.

## Detail popups
- All `AirportDetailDrawer` popups now have a sticky, always-visible close button.
- ESC closes the drawer.
- Clicking the background closes the drawer.

## Validation
- `npm install`: successful, 0 vulnerabilities.
- `npm run build`: successful.
- Main GLB checksum matches the provided `Airport 3.glb`.
- Both BIM GLB files are included in source and production `dist` output.
