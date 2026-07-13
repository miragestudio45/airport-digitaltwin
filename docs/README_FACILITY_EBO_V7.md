# Airport Digital Twin Platform — Facility Operations & EBO V7

## Update scope

This package is based directly on V6 and only updates the Facility Operations & EBO experience requested in the latest feedback.

### 1. Responsive BMS workspace
- Facility Operations content now uses the available viewport between the global header and bottom navigation.
- The BMS equipment library and active equipment workspace stretch to the full usable height.
- Equipment cards scroll internally when the screen is shorter, instead of leaving a large empty area below the viewer.
- The equipment 3D viewer grows and shrinks with the available workspace.

### 2. Asset Location popup
- Asset Location begins below the global header.
- It no longer covers or clips into the header.
- A persistent close button is included in the popup header.
- ESC and backdrop click also close the popup.
- The information panel is responsive and moves below the model on smaller screens.

### 3. Complete operating flows for Facility systems
The following systems now open detailed operational views rather than only displaying toast messages:
- Energy & Power / PME integration
- CCTV / VMS live-view simulation, playback controls, snapshot, PTZ and event workflow
- Access Control / Security Expert integration, access history and audited door commands
- Smart Parking occupancy map, lane operations, EV charging and guidance controls
- Fire & Life Safety zone/device detail and response workflow
- Water & Utilities pump, pressure, quality and leak-detail workflow
- Lighting schedules, level control, occupancy logic and trends
- Vertical Transport operating status, trips, safety circuit and maintenance workflow

Every operational popup has:
- A visible close button
- ESC and backdrop close behavior
- Header-safe positioning
- Operational context panel
- Role/permission and audit-trail reminder
- Demo-only commands that do not claim to control real systems

### 4. EBO alignment
The EBO layer is presented as an integrated operations platform with:
- Enterprise Server and Automation Server hierarchy
- WorkStation / WebStation access
- BACnet/IP and Modbus connectivity
- Alarms, schedules, trend logs and historian context
- Role-based commands and audit trail
- External source-system boundaries for VMS, Security Expert, PME, fire alarm and parking systems

This avoids presenting EBO as a replacement for certified/source systems while still showing their integrated operating context.

## Validation
- Production build completed successfully with `npm run build`.
- Existing Overview, Airport Ops, Passengers, FM & Assets, Intelligence, Safety and Systems modules were not redesigned.
