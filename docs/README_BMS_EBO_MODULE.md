# BMS & EBO Operations Module

Added to the Airport Digital Twin Platform without changing the existing Overview or other airport modules.

## Module location

Bottom navigation: **BMS**

Sections:
- BMS Overview
- EBO Command Center
- HVAC Equipment
- Chiller Plant
- Air Handling
- Terminal Zones
- HVAC Floor Plan
- System Schematics
- Asset Location
- Alarms & Events
- Trends & Analytics

## EBO workflow included

- Live monitoring and deterministic demo points
- 2D process / equipment views
- 3D GLB equipment viewer
- Engineering schematic views
- Simulated controls, setpoints, modes, interlocks and audit history
- Alarm priority, acknowledgement and ownership
- Historian / trend analytics
- Airport-specific locations and asset codes

## Models inherited from the previous Viettel Da Nang BMS source

- AHU
- FCU
- VAV
- Chiller
- Plate Heat Exchanger
- CRAH Unit
- HVAC floor-plan model
- Asset-location model

The package preserves the same model URLs and Three.js/Meshopt loading mechanism used by the previous working source.

## Header update

The visible `Concept` / `Bản ý tưởng` badge has been removed completely.

## Validation

- `npm install` completed
- `npm run build` completed successfully
