# Airport Digital Twin Platform — V6 Facility Operations & EBO

This package extends the existing V5 product without changing the Overview, Airport Ops, Passenger, FM & Assets, Intelligence, Safety or Systems workflows.

## Requested update

The previous bottom-navigation module named **BMS** is now presented as:

- **Facility Operations & EBO**
- Vietnamese: **Vận hành Facility & EBO**

It is designed as an airport-scale EBO operating domain instead of a standalone HVAC/BMS page.

## Included EBO operating systems

1. Facility Operations Overview
2. EBO Command Center / integrated facility IOC
3. BMS / HVAC equipment library
   - AHU
   - FCU
   - VAV
   - Chiller
   - Plate Heat Exchanger
   - CRAH Unit
4. Central Chiller Plant
5. HVAC 2D / 3D Floor Plan
6. Energy & Power / PME-style monitoring
7. CCTV / VMS
8. Access Control / ACS
9. Smart Parking / PMS and EV charging context
10. Fire & Life Safety
11. Water & Utilities
12. Lighting
13. Vertical Transport
14. Cross-domain EBO Alarms & Events
15. Historian, Trends & Automated Reports

## BMS asset feedback completed

- The BMS equipment workspace now expands vertically to use the available screen height.
- Every device card has an **Asset Location** button.
- Equipment workspaces also have:
  - Asset Location
  - Asset Information
  - Sync
- Asset Information opens as a closable side panel with:
  - asset code
  - building
  - level
  - area
  - system
  - current operating values
- Asset Location opens a closable full-screen model viewer with asset metadata.

## Product continuity

- Existing dark airport UI and visual system retained.
- Existing airport modules are unchanged.
- Existing BMS equipment models and Three.js viewers are retained.
- The words Concept / Bản ý tưởng remain removed.

## Verification

- `npm install`: successful
- `npm run build`: successful
- `/site/gia-binh`: Vite route returns successfully
