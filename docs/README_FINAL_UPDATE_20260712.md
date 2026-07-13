# GBIA Smart Airport – final update package (2026-07-12)

This package keeps the existing Gia Binh Airport shell and adds the missing strategic content requested from the PDF direction, while avoiding major changes to the Overview 2D/3D structure.

## Updated in this package

### 1) PASSENGERS
- Added **Biometric Journey** section
  - One ID / One Touch / One Face concept flow
  - Enrollment → Terminal Entry → Bag Drop → Security → Immigration → Boarding
  - Guardrails / consent / fallback / audit trail
- Added **Commercial Intelligence** section
  - Retail, media and ancillary revenue opportunities
  - Passenger value and monetization logic

### 2) FM & ASSETS
- Upgraded **BIM Explorer** to represent a more complete **digital thread**:
  - LiDAR / survey
  - BIM federation
  - Asset mapping
  - Operations linkage
  - Analytics layer
- Expanded property panel and linkage context

### 3) INTELLIGENCE
- Upgraded **Capacity Forecast** into a roadmap-oriented section:
  - Peak forecast
  - Suggested peak actions
  - Phase 1 → Phase 4 roadmap toward autonomous airport operations

### 4) SYSTEMS
- Added **Unified Data Lake** section
  - Ingestion → Bronze → Silver → Gold → AI / Apps
  - OT / IT / Aviation / BIM-GIS / IoT / documents concept
- Upgraded **Data Center** section toward **Mini Data Center / Edge DC** positioning
- Expanded **Integration Hub** governance context

### 5) OVERVIEW 3D (limited only)
- Replaced the GLB model with the newly provided file
- Fixed **Compass** arrow alignment so the needle is centered correctly

## Not intentionally changed
- No major restructuring of the Overview 2D / 3D module
- No Media / video work

## Build
- `npm install`
- `npm run build`
- You can continue using the existing startup CMD files in this package.
