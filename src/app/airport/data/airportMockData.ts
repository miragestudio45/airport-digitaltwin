import { between, createSeededRandom, deterministicSeries, pick } from "./seededRandom";

export type PageSize = 25 | 50 | 100;
export interface PageResult<T> { rows: T[]; total: number; page: number; pageSize: number }

export const HISTORICAL_PRESETS = ["Live", "24 Hours", "7 Days", "30 Days", "90 Days", "1 Year", "3 Years", "5 Years", "Custom"] as const;

export const AIRPORT_OVERVIEW_KPIS = [
  ["Flights today", "642", "+3.2%"], ["Arrivals", "318", "On plan"], ["Departures", "324", "6 delayed"],
  ["Passengers today", "96,840", "+5.8%"], ["On-time performance", "87.4%", "+1.6 pt"], ["Active stands", "32 / 48", "67%"],
  ["Baggage throughput", "4,280/h", "98.6% SLA"], ["Security wait", "8.4 min", "Target <10"], ["Critical incidents", "1", "P-07"],
  ["Capacity utilization", "78%", "Healthy"], ["Power demand", "12.8 MW", "-3.1%"], ["Carbon intensity", "314 g/kWh", "Optimized"],
  ["OT health", "97.8%", "4 alerts"], ["IT health", "99.4%", "3 alerts"], ["Aviation systems", "99.7%", "Nominal"],
] as const;

const airlines = ["VN", "VJ", "QH", "SQ", "TG", "CX", "KE", "JL", "EK", "QR"] as const;
const airports = ["HAN", "SGN", "DAD", "SIN", "BKK", "HKG", "ICN", "NRT", "DXB", "DOH"] as const;
const aircraft = ["A320neo", "A321", "A350-900", "B787-9", "B737-8", "B777-300ER"] as const;
const statuses = ["Boarding", "On stand", "Approach", "Departed", "Delayed", "Scheduled"] as const;

export interface FlightRow {
  id: string; flight: string; route: string; aircraft: string; schedule: string; estimate: string;
  runway: string; gate: string; stand: string; passengers: number; bags: number; status: string; delay: number; risk: string;
}

export function getFlightPage(page = 1, pageSize: PageSize = 25, search = ""): PageResult<FlightRow> {
  const total = 180_000;
  const offset = (page - 1) * pageSize;
  const rows = Array.from({ length: pageSize }, (_, localIndex) => {
    const index = offset + localIndex;
    const random = createSeededRandom(`flight-${index}`);
    const airline = pick(random, airlines);
    const origin = pick(random, airports);
    let destination = pick(random, airports);
    if (destination === origin) destination = "GBI";
    const hour = 5 + (index * 7) % 19;
    const minute = (index * 13) % 60;
    const delay = Math.round(between(random, 0, 42));
    return {
      id: `FLT-${String(index + 1).padStart(6, "0")}`, flight: `${airline}${String(100 + (index % 890))}`,
      route: `${origin} → ${destination}`, aircraft: pick(random, aircraft), schedule: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      estimate: `${String((hour + Math.floor((minute + delay) / 60)) % 24).padStart(2, "0")}:${String((minute + delay) % 60).padStart(2, "0")}`,
      runway: index % 2 ? "01L" : "01R", gate: `G${1 + (index % 56)}`, stand: `S${1 + (index % 48)}`,
      passengers: Math.round(between(random, 86, 318)), bags: Math.round(between(random, 110, 480)),
      status: delay > 25 ? "Delayed" : pick(random, statuses), delay, risk: delay > 25 ? "High" : delay > 12 ? "Medium" : "Low",
    };
  }).filter((row) => !search || JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  return { rows, total, page, pageSize };
}

const assetNames = ["Passenger Boarding Bridge", "Baggage Conveyor", "AHU", "Chiller", "Runway Edge Light", "UPS", "Generator", "Escalator", "Elevator", "CCTV Camera", "Access Controller", "Ground Power Unit"] as const;
const areas = ["Terminal", "Airside", "Cargo", "Utility Plant", "Data Center", "Landside"] as const;
const conditions = ["Good", "Good", "Good", "Fair", "Attention", "Critical"] as const;

export interface AssetRow {
  id: string; bimGuid: string; name: string; system: string; area: string; location: string; manufacturer: string;
  condition: string; criticality: string; health: number; runtime: number; nextService: string; predictedFailure: string; dataQuality: number;
}

export function getAssetPage(page = 1, pageSize: PageSize = 25, search = ""): PageResult<AssetRow> {
  const total = 16_420;
  const offset = (page - 1) * pageSize;
  const rows = Array.from({ length: pageSize }, (_, localIndex) => {
    const index = offset + localIndex;
    const random = createSeededRandom(`asset-${index}`);
    const name = pick(random, assetNames);
    const health = Math.round(between(random, 42, 100));
    return {
      id: `GBI-${name.split(" ").map((part) => part[0]).join("")}-${String(index + 1).padStart(5, "0")}`,
      bimGuid: `3f${index.toString(16).padStart(6, "0")}-bim-${(index * 71).toString(16)}`,
      name, system: name.includes("Baggage") ? "BHS" : name.includes("Light") ? "Airfield Lighting" : name.includes("Camera") ? "CCTV" : "Facility OT",
      area: pick(random, areas), location: `L${1 + (index % 4)} · Z${1 + (index % 18)} · R${100 + (index % 140)}`,
      manufacturer: pick(random, ["Siemens", "Schneider", "Honeywell", "Daifuku", "Vanderlande", "ABB", "Carrier"]),
      condition: health < 55 ? "Critical" : health < 70 ? "Attention" : pick(random, conditions),
      criticality: index % 7 === 0 ? "Critical" : index % 3 === 0 ? "High" : "Medium", health,
      runtime: Math.round(between(random, 450, 48_000)), nextService: `${1 + (index % 28)} Aug 2026`,
      predictedFailure: health < 65 ? `${10 + (index % 120)} days` : "No near-term risk", dataQuality: Math.round(between(random, 82, 100)),
    };
  }).filter((row) => !search || JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  return { rows, total, page, pageSize };
}

export const PASSENGER_STAGES = ["Drop-off", "Check-in", "Bag drop", "Security", "Immigration", "Retail / dwell", "Boarding gate", "Boarding", "Arrival", "Baggage claim", "Exit"].map((stage, index) => ({
  stage, throughput: 8_900 - index * 370, wait: Number((2.8 + (index % 4) * 2.2).toFixed(1)), satisfaction: 94 - (index % 5) * 3, risk: index === 3 ? "High" : index === 4 ? "Medium" : "Low",
}));

export const QUEUE_ROWS = ["Security A", "Security B", "Immigration East", "Immigration West", "Check-in Island 1", "Check-in Island 2", "Bag Drop", "Taxi Queue"].map((zone, index) => ({
  zone, queue: 28 + index * 17, wait: Number((4.2 + index * 1.15).toFixed(1)), desks: `${4 + (index % 5)}/${7 + (index % 5)}`,
  rate: 42 + index * 4, forecast15: 36 + index * 18, threshold: 120, action: index > 4 ? "Open two processing desks" : "Monitor",
}));

export const INCIDENTS = [
  ["INC-2407", "Security perimeter P-07", "Critical", "Safety", "Response in progress", "2 min"],
  ["INC-2406", "Stand S32 GPU communication", "Warning", "Airside", "Technician assigned", "8 min"],
  ["INC-2405", "Baggage conveyor BC-14 vibration", "Warning", "BHS", "Predictive review", "14 min"],
  ["INC-2404", "Data center UPS-B battery string", "Warning", "IT", "Redundancy confirmed", "21 min"],
  ["INC-2403", "Security queue forecast above target", "Info", "Passenger", "Lanes rescheduled", "27 min"],
] as const;

export const TURNAROUND_TASKS = ["On-block", "Chocks", "Passenger bridge", "Deboarding", "Baggage unloading", "Cleaning", "Catering", "Fueling", "Water / lavatory", "Maintenance check", "Boarding", "Baggage loading", "Pushback", "Off-block"].map((task, index) => ({
  task, planned: `${10 + Math.floor(index / 3)}:${String((index * 11) % 60).padStart(2, "0")}`,
  owner: pick(createSeededRandom(`task-${index}`), ["Ramp", "Airline", "BHS", "Catering", "Fuel", "Engineering"]),
  status: index < 5 ? "Complete" : index === 5 ? "At risk" : "Planned", risk: index === 5 ? 82 : 8 + index * 3,
}));

export const PREDICTIONS = ["Baggage Conveyor BC-14", "Passenger Bridge PBB-08", "Chiller CH-03", "AHU-T1-24", "Escalator ESC-17", "Generator GEN-02", "UPS DC-B", "Runway Light CCR-04", "Ground Power Unit GPU-32"].map((asset, index) => ({
  asset, health: 48 + index * 5, failure: 72 - index * 6, rul: `${12 + index * 17} days`, confidence: `${91 - index}%`, impact: index < 2 ? "Flight operations" : "Facility service", action: index < 3 ? "Create condition-based work order" : "Increase monitoring",
}));

export const SYSTEM_CONNECTIONS = [
  ["AODB", "Aviation", "AMQP / API", "99.99%", "4 sec", "24 ms", "99.8%"], ["FIDS", "Aviation", "REST / WebSocket", "99.97%", "7 sec", "31 ms", "99.6%"],
  ["BHS", "Aviation", "OPC UA", "99.94%", "2 sec", "18 ms", "98.9%"], ["A-CDM", "Aviation", "AIDX", "99.92%", "12 sec", "42 ms", "99.1%"],
  ["BMS", "OT", "BACnet/IP", "99.83%", "3 sec", "36 ms", "97.4%"], ["EMS", "OT", "Modbus TCP", "99.91%", "8 sec", "28 ms", "98.6%"],
  ["CCTV / VMS", "OT", "ONVIF", "99.72%", "1 sec", "48 ms", "96.8%"], ["Access Control", "OT", "OSDP / API", "99.88%", "4 sec", "23 ms", "98.2%"],
  ["Wi-Fi Analytics", "IT", "Streaming API", "99.96%", "10 sec", "51 ms", "97.9%"], ["BIM / GIS", "Spatial", "IFC / OGC API", "99.61%", "4 min", "112 ms", "94.7%"],
] as const;

export const OPERATION_EVENTS = [
  ["09:42", "VN214", "Boarding started", "G18", "Normal"], ["09:38", "SQ191", "Stand reassigned", "S24 → S26", "Warning"],
  ["09:31", "Runway 01L", "Inspection complete", "Available", "Normal"], ["09:26", "BC-14", "Vibration anomaly", "Maintenance notified", "Warning"],
  ["09:18", "VJ507", "Predicted off-block +12 min", "Mitigation active", "Warning"], ["09:11", "Weather", "Crosswind increasing", "18 kt", "Info"],
] as const;

export const getFlightTrend = (range = "24 Hours") => deterministicSeries(`flights-${range}`, range === "5 Years" ? 300 : 48, 82, 20);
export const getPassengerSeries = (range = "24 Hours") => deterministicSeries(`passengers-${range}`, range === "5 Years" ? 400 : 72, 6200, 900);
export const getBaggageSeries = (range = "24 Hours") => deterministicSeries(`baggage-${range}`, 72, 4100, 620);
export const getEnergySeries = (range = "24 Hours") => deterministicSeries(`energy-${range}`, range === "5 Years" ? 360 : 96, 12.4, 2.6);
export const getPredictiveAssetPage = (page = 1, pageSize: PageSize = 25) => ({ rows: PREDICTIONS.slice((page - 1) * pageSize, page * pageSize), total: PREDICTIONS.length, page, pageSize });
export const getWorkOrderPage = getAssetPage;
export const getAlarmPage = getFlightPage;
