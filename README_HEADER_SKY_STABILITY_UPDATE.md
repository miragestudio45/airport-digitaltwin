# Airport Digital Twin Platform — Header & 3D Stability Update

## Updated
- Header title standardized to **Airport Digital Twin Platform**.
- Removed the secondary Gia Binh / conceptual visualization line from the visible header.
- Increased star brightness while retaining small star points.
- Removed procedural star-field rotation to avoid sub-pixel twinkling/flicker.
- Centered sky layers on the active camera and expanded the stable far clipping range.
- Stabilized runway/asphalt/ground overlay rendering with render order and polygon offset.
- Frozen the static shadow map after model loading to reduce shadow shimmer.
- Kept all existing modules, BIM models, FM workflows and airport GLB assets.

## Verification
- `npm install`: successful
- `npm run build`: successful
