import type { LucideIcon } from "lucide-react";
import {
  Activity, AirVent, BarChart3, Boxes, BrainCircuit, Building2, Camera, CircleGauge,
  Car, Database, Droplets, ArrowUpDown, Factory, Fan, Flame, Gauge, HardHat, LayoutDashboard,
  Lightbulb, LockKeyhole, Map, MapPin, MonitorCog, Network, ParkingCircle, Plane, Radar,
  Settings2, ShieldCheck, Snowflake, Sparkles, Users, Wrench, Zap,
} from "lucide-react";

export type AirportModuleId =
  | "OVERVIEW"
  | "AIRPORT_OPS"
  | "PASSENGERS"
  | "ASSETS_FM"
  | "BMS"
  | "INTELLIGENCE"
  | "SAFETY"
  | "SYSTEMS";

export type AirportStatus = "normal" | "optimized" | "warning" | "critical" | "offline";

export interface AirportSectionDefinition {
  id: string;
  label: string;
  description: string;
  icon?: LucideIcon;
}

export interface AirportModuleDefinition {
  id: AirportModuleId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  accent: string;
  defaultSection: string;
  sections: AirportSectionDefinition[];
}

export const AIRPORT_MODULES: AirportModuleDefinition[] = [
  {
    id: "OVERVIEW", label: "Airport Overview", shortLabel: "Overview", icon: LayoutDashboard,
    accent: "cyan", defaultSection: "command-center",
    sections: [
      { id: "command-center", label: "Airport Command Center", description: "Live spatial and operational overview", icon: CircleGauge },
      { id: "spatial-hierarchy", label: "Spatial Hierarchy", description: "Airport, area, zone, system and asset context", icon: Map },
      { id: "operational-readiness", label: "Operational Readiness", description: "Airport-wide readiness and disruption posture", icon: Activity },
    ],
  },
  {
    id: "AIRPORT_OPS", label: "Airport Operations", shortLabel: "Airport Ops", icon: Plane,
    accent: "blue", defaultSection: "operations-center",
    sections: [
      { id: "operations-center", label: "Operations Center", description: "Integrated live airport operations", icon: Radar },
      { id: "flight-operations", label: "Flight Operations", description: "Flight board, risks, gates and timelines", icon: Plane },
      { id: "runway-taxiway", label: "Runway & Taxiway", description: "Movement area condition and capacity", icon: Map },
      { id: "gates-stands", label: "Gates & Stands", description: "Gate plan and stand utilization", icon: Boxes },
      { id: "aircraft-turnaround", label: "Aircraft Turnaround", description: "Critical-path turnaround orchestration", icon: Activity },
      { id: "ground-handling", label: "Ground Handling", description: "Teams, vehicles and equipment allocation", icon: HardHat },
      { id: "baggage-operations", label: "Baggage Operations", description: "BHS flow, screening, sortation and reclaim", icon: Boxes },
      { id: "cargo-logistics", label: "Cargo & Logistics", description: "Warehouse, shipment and cold-chain operations", icon: Factory },
    ],
  },
  {
    id: "PASSENGERS", label: "Passenger Experience", shortLabel: "Passengers", icon: Users,
    accent: "cyan", defaultSection: "passenger-journey",
    sections: [
      { id: "passenger-journey", label: "Passenger Journey", description: "End-to-end passenger flow and bottlenecks", icon: Users },
      { id: "biometric-journey", label: "Biometric Journey", description: "One ID / one touch / one face passenger experience", icon: ShieldCheck },
      { id: "queue-monitoring", label: "Queue Monitoring", description: "Live queues, forecasts and recommended actions", icon: BarChart3 },
      { id: "terminal-occupancy", label: "Terminal Occupancy", description: "Density, comfort and egress load", icon: Building2 },
      { id: "processing-performance", label: "Processing Performance", description: "Throughput and SLA by process", icon: Activity },
      { id: "wayfinding", label: "Wayfinding", description: "Congestion-aware routes and signage", icon: Map },
      { id: "prm-assistance", label: "PRM Assistance", description: "Demonstration assistance workflow without personal data", icon: Users },
      { id: "service-quality", label: "Service Quality", description: "Experience, complaints and recovery", icon: Sparkles },
      { id: "commercial-intelligence", label: "Commercial Intelligence", description: "Retail, media and passenger-value monetization", icon: BarChart3 },
    ],
  },
  {
    id: "ASSETS_FM", label: "FM & Asset Management", shortLabel: "FM & Assets", icon: Wrench,
    accent: "emerald", defaultSection: "fm-overview",
    sections: [
      { id: "fm-overview", label: "FM Overview", description: "Asset health, maintenance and SLA posture", icon: CircleGauge },
      { id: "bim-explorer", label: "BIM Explorer", description: "Model tree, properties and data completeness", icon: Boxes },
      { id: "asset-registry", label: "Asset Registry", description: "Paged airport asset master data", icon: Database },
      { id: "maintenance-plans", label: "Maintenance Plans", description: "Preventive, predictive and regulatory plans", icon: Wrench },
      { id: "work-orders", label: "Work Orders", description: "Work workflow, SLA, cost and root cause", icon: HardHat },
      { id: "inspections", label: "Inspections", description: "Airfield and facility inspection programs", icon: ShieldCheck },
      { id: "spare-parts", label: "Spare Parts", description: "Stock, lead time and reservations", icon: Boxes },
      { id: "documents", label: "Documents", description: "O&M, drawings, certificates and BIM references", icon: Database },
      { id: "warranty-contracts", label: "Warranty & Contracts", description: "Coverage, expiry and supplier performance", icon: ShieldCheck },
      { id: "space-management", label: "Space Management", description: "Area, occupancy and utilization", icon: Building2 },
    ],
  },
  {
    id: "BMS", label: "Facility Operations & EBO", shortLabel: "Facility Ops", icon: MonitorCog,
    accent: "cyan", defaultSection: "facility-ops-overview",
    sections: [
      { id: "facility-ops-overview", label: "Facility Operations Overview", description: "Airport-wide operating posture across all EBO facility systems", icon: CircleGauge },
      { id: "ebo-command", label: "EBO Command Center", description: "Integrated EBO tree, monitoring, commands, alarms and audit trail", icon: MonitorCog },
      { id: "bms-hvac", label: "BMS / HVAC", description: "Chiller, AHU, FCU, VAV, heat exchanger and CRAH operation", icon: Fan },
      { id: "bms-chiller-plant", label: "Chiller Plant", description: "Central cooling plant, schematic, 3D model and controls", icon: Snowflake },
      { id: "bms-floor-plan", label: "HVAC Floor Plan", description: "2D and 3D terminal HVAC context and asset positions", icon: Map },
      { id: "energy-power", label: "Energy & Power", description: "PME-style power monitoring, single-line diagram, UPS and generators", icon: Zap },
      { id: "cctv-vms-ebo", label: "CCTV / VMS", description: "Camera wall, video analytics, events and recording health", icon: Camera },
      { id: "access-control-ebo", label: "Access Control", description: "Doors, readers, credentials and restricted-zone access", icon: LockKeyhole },
      { id: "smart-parking-ebo", label: "Smart Parking", description: "Parking occupancy, guidance, entry-exit and EV charging", icon: ParkingCircle },
      { id: "fire-life-safety-ebo", label: "Fire & Life Safety", description: "Fire panels, detectors, suppression and evacuation readiness", icon: Flame },
      { id: "water-utilities-ebo", label: "Water & Utilities", description: "Water supply, pumps, wastewater and quality monitoring", icon: Droplets },
      { id: "lighting-ebo", label: "Lighting", description: "Terminal, apron and airfield lighting control and schedules", icon: Lightbulb },
      { id: "vertical-transport-ebo", label: "Vertical Transport", description: "Elevators, escalators, traffic and maintenance status", icon: ArrowUpDown },
      { id: "ebo-alarms-events", label: "Alarms & Events", description: "Cross-domain EBO alarm queue, ownership and response", icon: Activity },
      { id: "ebo-trends-reports", label: "Trends & Reports", description: "Historian, performance trends, SLA and automated reporting", icon: BarChart3 },
    ],
  },
  {
    id: "INTELLIGENCE", label: "Intelligence & Autonomy", shortLabel: "Intelligence", icon: BrainCircuit,
    accent: "violet", defaultSection: "intelligence-overview",
    sections: [
      { id: "intelligence-overview", label: "Intelligence Overview", description: "AI insights and operational value", icon: BrainCircuit },
      { id: "predictive-maintenance", label: "Predictive Maintenance", description: "Failure probability, RUL and actions", icon: Wrench },
      { id: "energy-ai", label: "Energy AI", description: "Optimization recommendations and savings", icon: Zap },
      { id: "delay-prediction", label: "Delay Prediction", description: "Flight risk factors and mitigation", icon: Plane },
      { id: "capacity-forecast", label: "Capacity Forecast", description: "Multi-horizon airport capacity forecast", icon: BarChart3 },
      { id: "anomaly-detection", label: "Anomaly Detection", description: "Cross-domain anomaly triage", icon: Activity },
      { id: "what-if-simulation", label: "What-if Simulation", description: "Before and after scenario analysis", icon: Sparkles },
      { id: "autonomous-operations", label: "Autonomous Operations", description: "Human-governed autonomous workflow demonstration", icon: BrainCircuit },
    ],
  },
  {
    id: "SAFETY", label: "Safety & Security", shortLabel: "Safety", icon: ShieldCheck,
    accent: "amber", defaultSection: "security-overview",
    sections: [
      { id: "security-overview", label: "Security Overview", description: "Integrated airport security posture", icon: ShieldCheck },
      { id: "cctv-vms", label: "CCTV / VMS", description: "Camera coverage, analytics and events", icon: Camera },
      { id: "access-control", label: "Access Control", description: "Doors, readers and credentials", icon: ShieldCheck },
      { id: "perimeter-security", label: "Perimeter Security", description: "Fence, radar and intrusion detection", icon: Radar },
      { id: "restricted-zones", label: "Restricted Zones", description: "Airside access and zone violations", icon: Map },
      { id: "fire-life-safety", label: "Fire & Life Safety", description: "Fire systems and evacuation readiness", icon: Activity },
      { id: "airside-safety", label: "Airside Safety", description: "Vehicle, worker and incursion risks", icon: Plane },
      { id: "emergency-command", label: "Emergency Command", description: "SOP, teams, communication and audit trail", icon: ShieldCheck },
      { id: "incident-management", label: "Incident Management", description: "Incident ownership and resolution", icon: Activity },
    ],
  },
  {
    id: "SYSTEMS", label: "Systems & Integration", shortLabel: "Systems", icon: Database,
    accent: "cyan", defaultSection: "systems-overview",
    sections: [
      { id: "systems-overview", label: "Systems Overview", description: "OT, IT and aviation service health", icon: CircleGauge },
      { id: "unified-data-lake", label: "Unified Data Lake", description: "Airport-wide data lakehouse, semantic layer and AI pipeline", icon: Database },
      { id: "facility-ot", label: "Facility OT", description: "BMS, EMS, water, lighting and fire", icon: Factory },
      { id: "bms", label: "BMS", description: "Airport building management context", icon: Building2 },
      { id: "ems", label: "EMS", description: "Energy monitoring and demand", icon: Zap },
      { id: "electrical", label: "Electrical", description: "Grid, generators, UPS and distribution", icon: Zap },
      { id: "water", label: "Water", description: "Supply, quality and consumption", icon: Activity },
      { id: "lighting", label: "Lighting", description: "Terminal and airfield lighting", icon: Sparkles },
      { id: "fire-integration", label: "Fire Integration", description: "Fire panel and life-safety integrations", icon: ShieldCheck },
      { id: "it-systems", label: "IT Systems", description: "Applications, servers and services", icon: Database },
      { id: "network-wifi", label: "Network & Wi-Fi", description: "Coverage, capacity and latency", icon: Radar },
      { id: "data-center", label: "Data Center", description: "Mini DC, edge compute, storage and environmental health", icon: Database },
      { id: "aviation-systems", label: "Aviation Systems", description: "AODB, FIDS, BHS and A-CDM", icon: Plane },
      { id: "integration-hub", label: "Integration Hub", description: "Connections, protocols and data flow", icon: Boxes },
      { id: "cybersecurity", label: "Cybersecurity", description: "Threat, vulnerability and response", icon: ShieldCheck },
      { id: "data-quality", label: "Data Quality", description: "Completeness, freshness, accuracy and lineage", icon: BarChart3 },
      { id: "iot-devices", label: "IoT Devices", description: "Airport sensor and edge fleet", icon: Activity },
    ],
  },
];

export const AIRPORT_SECTION_REGISTRY = Object.fromEntries(
  AIRPORT_MODULES.flatMap((module) => module.sections.map((section) => [section.id, { ...section, moduleId: module.id }])),
);

export interface SpatialNode { id: string; label: string; type: string; children?: SpatialNode[] }

const child = (id: string, label: string, type = "Zone"): SpatialNode => ({ id, label, type });

export const AIRPORT_SPATIAL_HIERARCHY: SpatialNode[] = [
  { id: "airside", label: "Airside", type: "Airport Area", children: [
    child("runways", "Runways"), child("taxiways", "Taxiways"), child("aprons", "Aprons"),
    child("stands", "Aircraft Stands"), child("hangars", "Hangars"), child("airfield-utilities", "Airfield Utilities"),
  ] },
  { id: "terminal", label: "Passenger Terminal", type: "Airport Area", children: [
    child("departures", "Departures"), child("arrivals", "Arrivals"), child("check-in", "Check-in"),
    child("security", "Security"), child("immigration", "Immigration"), child("boarding", "Boarding Gates"),
    child("baggage-claim", "Baggage Claim"), child("retail", "Retail"),
  ] },
  { id: "landside", label: "Landside", type: "Airport Area", children: [
    child("roads", "Roads"), child("parking", "Parking"), child("transport-hub", "Transport Hub"), child("public-areas", "Public Areas"),
  ] },
  child("cargo", "Cargo & Logistics", "Airport Area"), child("atc", "Air Traffic Control", "Facility"),
  child("utility-plant", "Utility Plant", "Facility"), child("data-center", "Data Center", "Facility"),
  child("support", "Support Facilities", "Airport Area"),
];

export interface AirportHotspotDefinition {
  id: string; label: string; type: string; x: number; y: number; status: AirportStatus;
  severity: "info" | "low" | "medium" | "high" | "critical"; module: AirportModuleId;
  kpis: Array<{ label: string; value: string }>;
}

export const AIRPORT_HOTSPOTS: AirportHotspotDefinition[] = [
  { id: "terminal", label: "Passenger Terminal", type: "Terminal", x: 48, y: 57, status: "normal", severity: "info", module: "PASSENGERS", kpis: [{ label: "Occupancy", value: "68%" }, { label: "Security wait", value: "8.4 min" }] },
  { id: "runway-01", label: "Runway 01", type: "Runway", x: 79, y: 31, status: "normal", severity: "low", module: "AIRPORT_OPS", kpis: [{ label: "Capacity", value: "82%" }, { label: "Surface", value: "Dry" }] },
  { id: "runway-02", label: "Runway 02", type: "Runway", x: 86, y: 44, status: "warning", severity: "medium", module: "AIRPORT_OPS", kpis: [{ label: "Capacity", value: "74%" }, { label: "Inspection", value: "Due 18m" }] },
  { id: "taxiway", label: "Taxiway Network", type: "Movement Area", x: 69, y: 39, status: "normal", severity: "low", module: "AIRPORT_OPS", kpis: [{ label: "Congestion", value: "Low" }, { label: "Movements", value: "21/h" }] },
  { id: "apron", label: "Apron", type: "Apron", x: 58, y: 43, status: "optimized", severity: "info", module: "AIRPORT_OPS", kpis: [{ label: "Utilization", value: "71%" }, { label: "Vehicles", value: "84" }] },
  { id: "stands", label: "Aircraft Stands", type: "Stand Group", x: 62, y: 55, status: "warning", severity: "medium", module: "AIRPORT_OPS", kpis: [{ label: "Occupied", value: "32/48" }, { label: "Conflicts", value: "2" }] },
  { id: "atc", label: "ATC Tower", type: "Critical Facility", x: 55, y: 68, status: "normal", severity: "low", module: "SYSTEMS", kpis: [{ label: "Systems", value: "18/18" }, { label: "Latency", value: "12 ms" }] },
  { id: "cargo", label: "Cargo Terminal", type: "Logistics", x: 33, y: 39, status: "normal", severity: "low", module: "AIRPORT_OPS", kpis: [{ label: "Throughput", value: "186 t" }, { label: "Cold chain", value: "Stable" }] },
  { id: "hangar", label: "Hangar & MRO", type: "Maintenance", x: 22, y: 47, status: "warning", severity: "medium", module: "ASSETS_FM", kpis: [{ label: "Work orders", value: "17" }, { label: "Bay use", value: "75%" }] },
  { id: "utility", label: "Utility Plant", type: "OT Facility", x: 17, y: 65, status: "normal", severity: "low", module: "SYSTEMS", kpis: [{ label: "Power", value: "12.8 MW" }, { label: "Cooling", value: "84%" }] },
  { id: "datacenter", label: "Data Center", type: "IT Facility", x: 32, y: 69, status: "warning", severity: "high", module: "SYSTEMS", kpis: [{ label: "Availability", value: "99.94%" }, { label: "Alerts", value: "3" }] },
  { id: "parking", label: "Parking & Ground Transport", type: "Landside", x: 44, y: 80, status: "optimized", severity: "info", module: "PASSENGERS", kpis: [{ label: "Spaces", value: "1,842" }, { label: "Wait", value: "3 min" }] },
  { id: "perimeter", label: "Security Perimeter", type: "Security Zone", x: 91, y: 63, status: "critical", severity: "critical", module: "SAFETY", kpis: [{ label: "Zone", value: "P-07" }, { label: "Incident", value: "Investigating" }] },
];

export const AIRPORT_LAYERS = ["Aviation", "Passenger flow", "Baggage flow", "Ground vehicles", "Facilities", "Utilities", "Security", "Incidents", "Energy", "Weather"];

export function getAirportModule(id: AirportModuleId) {
  return AIRPORT_MODULES.find((module) => module.id === id) ?? AIRPORT_MODULES[0];
}
