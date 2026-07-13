# Gia Binh Smart Airport – Feedback V4 fixes applied

## Done
1. **Overview toolbar no longer overlaps KPI cards**
   - Repositioned the 3 action buttons (`Show data layers`, `Operational overview`, `Operational insights`) into a vertical control stack on the left.
   - Adjusted the data layers panel position accordingly.

2. **3D scene base / floor updated**
   - Removed the extra display platform / plan block under the airport model.
   - Kept a cleaner grid floor with improved glow treatment.

3. **3D background / HDRI improved**
   - Enhanced the procedural sky dome.
   - Added a moon and richer sky glow / star ambience.

4. **Default 3D camera view updated**
   - Changed the default framing so the model opens closer and fills the screen more like the provided reference.

5. **Walk mode adjusted toward FPS-style navigation**
   - Walk mode now behaves closer to first-person movement on a fixed ground height.
   - Slower base speed.
   - Sprint only when holding Shift.
   - Removed fly-style vertical movement for easier control.

## Main edited files
- `src/app/airport/overview/AirportOverview2D.tsx`
- `src/app/airport/overview/AirportOverview3D.tsx`
- `src/app/airport/overview/useAirport3DInteraction.ts`
