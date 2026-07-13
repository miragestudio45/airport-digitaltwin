import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, AlertTriangle, Boxes, CheckCircle2, CircleGauge, Clock3, Database,
  GitBranch, MapPin, Plane, Play, ShieldCheck, Sparkles, Users, Wrench, Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { AirportModuleId } from "../config/airportRegistry";
import { getAirportModule } from "../config/airportRegistry";
import {
  INCIDENTS, PASSENGER_STAGES, PREDICTIONS, QUEUE_ROWS, SYSTEM_CONNECTIONS,
  TURNAROUND_TASKS, getAssetPage, getBaggageSeries, getEnergySeries, getFlightPage,
  getFlightTrend, getPassengerSeries, type AssetRow, type FlightRow, type PageSize,
} from "../data/airportMockData";
import {
  AirportDataTable, AirportDetailDrawer, AirportFilterBar, AirportMetricCard,
  AirportPanel, AirportSectionHeader, AirportStatusBadge, AirportTimeline,
  AirportTrendChart, type AirportColumn,
} from "../shared/AirportUI";
import { useAirportLanguage } from "../i18n/AirportLanguage";
import { SafetyModuleContent } from "./SafetyModule";
import { BimModelViewer } from "./BimModelViewer";
import { FacilityOperationsModule } from "./FacilityOperationsModule";

export default function AirportModuleContent({ moduleId, sectionId }: { moduleId: AirportModuleId; sectionId: string }) {
  const { localizeModule, tr, language } = useAirportLanguage();
  const module = localizeModule(getAirportModule(moduleId));
  const section = module.sections.find((item) => item.id === sectionId) ?? module.sections[0];

  if (moduleId === "BMS") {
    return (
      <motion.div
        key={`${moduleId}-${sectionId}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .2 }}
        className="h-full min-h-0"
      >
        <FacilityOperationsModule sectionId={sectionId} />
      </motion.div>
    );
  }

  return (
    <motion.div key={`${moduleId}-${sectionId}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .22 }} className="space-y-4 pb-28">
      <AirportSectionHeader eyebrow={module.label} title={section.label} description={section.description} actions={<><AirportStatusBadge status="normal" label={tr("Live demo")} /><button onClick={() => toast.success(language === "vi" ? "Đã tạo ảnh chụp dashboard" : "Dashboard snapshot created")} className="airport-button">{tr("Create snapshot")}</button></>} />
      {moduleId === "AIRPORT_OPS" && <AirportOperations sectionId={sectionId} />}
      {moduleId === "PASSENGERS" && <PassengerOperations sectionId={sectionId} />}
      {moduleId === "ASSETS_FM" && <FacilityManagement sectionId={sectionId} />}
      {moduleId === "INTELLIGENCE" && <IntelligenceOperations sectionId={sectionId} />}
      {moduleId === "SAFETY" && <SafetyModuleContent sectionId={sectionId} />}
      {moduleId === "SYSTEMS" && <SystemsOperations sectionId={sectionId} />}
    </motion.div>
  );
}

function AirportOperations({ sectionId }: { sectionId: string }) {
  if (sectionId === "flight-operations") return <FlightOperations />;
  if (sectionId === "aircraft-turnaround") return <TurnaroundOperations />;
  if (sectionId === "baggage-operations") return <BaggageOperations />;
  const configs: Record<string, { metrics: Array<[string, string, string]>; title: string; entities: string[] }> = {
    "operations-center": { title: "Integrated airport operating picture", metrics: [["Scheduled flights", "642", "+3.2%"], ["Active flights", "86", "24 airborne"], ["Delayed", "18", "2 high risk"], ["OTP", "87.4%", "+1.6 pt"], ["Runway capacity", "82%", "Balanced"], ["Stand utilization", "67%", "32 / 48"], ["Passengers", "96,840", "+5.8%"], ["Baggage", "4,280/h", "98.6% SLA"], ["Active incidents", "5", "1 critical"], ["Weather impact", "Low", "NE 12 kt"]], entities: ["Runway 01L · Active · 21 movements/h", "Runway 01R · Arrival priority", "Terminal · 68% capacity", "Apron · 84 ground vehicles", "Cargo · 186 tonnes today", "Security · 8.4 min average"] },
    "runway-taxiway": { title: "Movement area control", metrics: [["Active runway", "01L", "Arrival mode"], ["Runway occupancy", "68 sec", "Target <75"], ["Surface", "Dry", "Friction .78"], ["Lighting", "99.8%", "2 lamps due"], ["Taxi congestion", "Low", "7 aircraft"], ["Incursion risk", "0.08", "Nominal"]], entities: ["RWY 01L · Available · Inspection complete 09:31", "RWY 01R · Available · Inspection due 10:05", "TWY Alpha · Moderate occupancy", "TWY Bravo · Normal", "TWY Charlie · Maintenance window 14:00", "Holding Point A3 · Clear"] },
    "gates-stands": { title: "Gate and stand allocation", metrics: [["Gates active", "42 / 56", "75%"], ["Stands occupied", "32 / 48", "67%"], ["Conflicts", "2", "Mitigation ready"], ["PBB health", "96.4%", "1 degraded"], ["GPU available", "39 / 44", "89%"], ["Next peak", "11:20", "46 stands"]], entities: ["G18 · VN214 · A321 · Boarding", "G22 · SQ191 · B787 · Stand reassigned", "G24 · VJ507 · A320 · Delayed", "S32 · GPU warning · Technician assigned", "S41 · Available · Widebody capable", "Remote R08 · Bus allocation ready"] },
    "ground-handling": { title: "Ground handling resources", metrics: [["Vehicles available", "168 / 184", "91%"], ["Teams active", "46", "312 staff"], ["Tasks in progress", "124", "94% on SLA"], ["Equipment conflicts", "3", "Resolving"], ["Avg response", "4.8 min", "-0.6 min"], ["Fuel bowsers", "11 / 12", "Available"]], entities: ["Ramp Team R12 · VN214 · On plan", "Fuel Unit F07 · SQ191 · En route", "Catering C14 · Gate G24 · 6 min late", "Pushback PB09 · Available", "Bus B22 · Remote Stand R08", "GPU-32 · Communication degraded"] },
    "cargo-logistics": { title: "Cargo and logistics control", metrics: [["Cargo today", "186 t", "+4.1%"], ["Warehouse use", "72%", "Healthy"], ["Delayed shipments", "7", "2 priority"], ["Cold chain", "99.6%", "Stable"], ["Dock status", "11 / 14", "Active"], ["Vehicles expected", "28", "Next 2h"]], entities: ["AWB 738-20491822 · Pharma · Customs cleared", "AWB 157-88370142 · Express · Dock D04", "Cold Room CR-02 · 4.2°C · Stable", "Dock D07 · Vehicle ETA 12 min", "ULD Station U03 · 82% capacity", "Cargo Conveyor CC-08 · Normal"] },
  };
  const config = configs[sectionId] ?? configs["operations-center"];
  const trend = useMemo(() => getFlightTrend(sectionId), [sectionId]);
  return <>
    <div className="grid grid-cols-3 gap-2 xl:grid-cols-5">{config.metrics.map(([label, value, trendText], index) => <AirportMetricCard key={label} label={label} value={value} trend={trendText} compact tone={index === 2 || index === 8 ? "amber" : index === 3 ? "emerald" : "blue"} />)}</div>
    <div className="grid gap-4 xl:grid-cols-[1.35fr_.85fr]"><AirportPanel title={config.title} subtitle="Actual, planned and forecast operating profile"><div className="p-3"><AirportTrendChart data={trend} height={260} color="#60a5fa" /></div></AirportPanel><AirportPanel title="Live operational entities" subtitle="Click for context"><div className="space-y-2 p-3">{config.entities.map((entity, index) => <button key={entity} onClick={() => toast.info(entity)} className="flex w-full items-center justify-between rounded-lg border border-white/[.06] bg-white/[.025] p-3 text-left"><span className="text-[10px] text-slate-300">{entity}</span><AirportStatusBadge status={index === 3 ? "warning" : "normal"} /></button>)}</div></AirportPanel></div>
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]"><AirportPanel title="Resource demand and disruption feed"><div className="p-3"><AirportTimeline events={[["09:44", "Resources", "Gate G24 support demand increased", "2 teams", "Warning"], ["09:38", "Weather", "Crosswind forecast remains below threshold", "12 kt", "Normal"], ["09:31", "Airfield", "Runway inspection completed", "01L", "Normal"], ["09:26", "Baggage", "Conveyor BC-14 anomaly detected", "Review", "Warning"]]} /></div></AirportPanel><AirportPanel title="Airport capacity by domain"><div className="grid grid-cols-2 gap-3 p-4">{[["Runway",82],["Stands",67],["Terminal",68],["Security",74],["Baggage",71],["Parking",63]].map(([label, value]) => <CapacityBar key={String(label)} label={String(label)} value={Number(value)} />)}</div></AirportPanel></div>
  </>;
}

function FlightOperations() {
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState<PageSize>(25); const [search, setSearch] = useState(""); const [range, setRange] = useState("24 Hours"); const [selected, setSelected] = useState<FlightRow | null>(null);
  const result = useMemo(() => getFlightPage(page, pageSize, search), [page, pageSize, search]);
  const columns: AirportColumn<FlightRow>[] = [
    { key: "flight", label: "Flight", width: "74px", render: (row) => <span className="font-mono font-semibold text-cyan-300">{row.flight}</span> },
    { key: "route", label: "Route", width: "110px" }, { key: "aircraft", label: "Aircraft" }, { key: "schedule", label: "STD/STA" }, { key: "estimate", label: "Estimated" },
    { key: "runway", label: "Runway" }, { key: "gate", label: "Gate" }, { key: "stand", label: "Stand" }, { key: "passengers", label: "PAX" }, { key: "bags", label: "Bags" },
    { key: "status", label: "Turnaround", render: (row) => <AirportStatusBadge status={row.status === "Delayed" ? "warning" : "normal"} label={row.status} /> },
    { key: "delay", label: "Delay" }, { key: "risk", label: "Risk", render: (row) => <AirportStatusBadge status={row.risk === "High" ? "critical" : row.risk === "Medium" ? "warning" : "normal"} label={row.risk} /> },
  ];
  return <>
    <div className="grid grid-cols-3 gap-2 xl:grid-cols-6">{[["Active flights","86","24 airborne"],["Arrivals","318","4 delayed"],["Departures","324","6 delayed"],["OTP","87.4%","+1.6 pt"],["High-risk flights","3","Action ready"],["Gate conflicts","2","Resolving"]].map(([label,value,trend], index) => <AirportMetricCard key={label} label={label} value={value} trend={trend} compact tone={index > 3 ? "amber" : "blue"} />)}</div>
    <AirportFilterBar search={search} onSearch={(value) => { setSearch(value); setPage(1); }} timeRange={range} onTimeRange={setRange}><select className="airport-select"><option>All airlines</option><option>Vietnam Airlines</option><option>International</option></select><select className="airport-select"><option>All statuses</option><option>Delayed</option><option>Boarding</option></select></AirportFilterBar>
    <AirportDataTable rows={result.rows} columns={columns} total={result.total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} onRowClick={setSelected} selectedId={selected?.id} />
    <AirportDetailDrawer open={Boolean(selected)} title={selected?.flight ?? "Flight"} subtitle={selected?.route} onClose={() => setSelected(null)}>{selected && <FlightDetail flight={selected} />}</AirportDetailDrawer>
  </>;
}

function FlightDetail({ flight }: { flight: FlightRow }) {
  const milestones = ["Scheduled", "Gate assigned", "Aircraft on block", "Deboarding", "Cleaning", "Fueling", "Boarding", "Predicted off-block"];
  return <div className="space-y-4"><div className="grid grid-cols-2 gap-2"><AirportMetricCard label="Passengers" value={flight.passengers} compact /><AirportMetricCard label="Bags" value={flight.bags} compact /><AirportMetricCard label="Delay" value={`${flight.delay} min`} compact tone={flight.delay > 20 ? "amber" : "emerald"} /><AirportMetricCard label="Off-block prediction" value={flight.estimate} compact tone="violet" /></div><AirportPanel title="Full turnaround timeline"><div className="p-4">{milestones.map((milestone, index) => <div key={milestone} className="relative flex gap-3 pb-4 last:pb-0"><div className={`z-10 mt-1 h-2.5 w-2.5 rounded-full ${index < 4 ? "bg-emerald-400" : index === 4 ? "bg-amber-400" : "bg-slate-700"}`} />{index < milestones.length - 1 && <div className="absolute left-[4px] top-3 h-full w-px bg-white/10" />}<div><p className="text-[11px] font-medium text-white">{milestone}</p><p className="text-[9px] text-slate-500">{flight.schedule} · {index < 4 ? "Complete" : index === 4 ? "At risk" : "Predicted"}</p></div></div>)}</div></AirportPanel><AirportPanel title="Delay causes and mitigations"><div className="space-y-2 p-3">{["Late inbound aircraft · 42% contribution", "Catering service variance · 21%", "Gate conflict exposure · 18%"].map((item) => <div key={item} className="rounded-lg bg-white/[.035] p-3 text-[10px] text-slate-300">{item}</div>)}<button onClick={() => toast.success("Mitigation workflow started in simulation mode")} className="airport-button w-full justify-center">Start mitigation demo</button></div></AirportPanel></div>;
}

function TurnaroundOperations() {
  return <><div className="grid grid-cols-3 gap-2 xl:grid-cols-6">{[["Aircraft","VN214","A321"],["Predicted off-block","11:42","+12 min"],["Tasks complete","5 / 14","36%"],["Critical path","Cleaning","At risk"],["Resources","18 / 21","Allocated"],["Confidence","92%","Prediction"]].map(([a,b,c], index) => <AirportMetricCard key={a} label={a} value={b} trend={c} compact tone={index === 3 ? "amber" : index === 5 ? "violet" : "blue"} />)}</div><AirportPanel title="Aircraft turnaround critical path" subtitle="Planned, actual and predicted task completion"><div className="overflow-auto p-4"><div className="min-w-[980px] space-y-2">{TURNAROUND_TASKS.map((task, index) => <div key={task.task} className="grid grid-cols-[150px_1fr_110px_90px] items-center gap-3"><div><p className="text-[10px] font-medium text-white">{task.task}</p><p className="text-[9px] text-slate-500">{task.owner} · {task.planned}</p></div><div className="relative h-6 rounded bg-white/[.035]"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(94, 12 + index * 5)}%` }} className={`absolute bottom-1 top-1 rounded ${task.status === "At risk" ? "bg-amber-400/65" : task.status === "Complete" ? "bg-emerald-400/55" : "bg-blue-400/35"}`} style={{ left: `${index * 1.5}%` }} /></div><AirportStatusBadge status={task.status === "At risk" ? "warning" : task.status === "Complete" ? "normal" : "info"} label={task.status} /><span className="text-[10px] text-slate-400">Risk {task.risk}%</span></div>)}</div></div></AirportPanel><div className="grid gap-4 xl:grid-cols-3">{["Recommended: add one cleaning team to reduce predicted delay by 7 min", "Critical dependency: boarding cannot begin until cabin release", "Ground power unit GPU-18 reserved through off-block"].map((item, index) => <AirportPanel key={item} title={["Recommended action","Critical path","Resource assignment"][index]}><div className="p-4 text-xs text-slate-300">{item}<button onClick={() => toast.success("Action recorded in turnaround activity log")} className="airport-button mt-4 w-full justify-center">Apply demo action</button></div></AirportPanel>)}</div></>;
}

function BaggageOperations() {
  const stages = ["Input", "Screening", "Sortation", "Make-up", "Transfer", "Loading", "Arrival reclaim"];
  const trend = useMemo(() => getBaggageSeries("24 Hours"), []);
  return <><div className="grid grid-cols-3 gap-2 xl:grid-cols-6">{[["Throughput","4,280/h","+4.2%"],["SLA","98.6%","Target 98%"],["Belts active","42 / 44","95%"],["Jam alarms","2","BC-14"],["Missed connection risk","18 bags","3 flights"],["Average bag time","21 min","-1.8 min"]].map(([a,b,c], index) => <AirportMetricCard key={a} label={a} value={b} trend={c} compact tone={index > 2 && index < 5 ? "amber" : "cyan"} />)}</div><AirportPanel title="Animated baggage process schematic" subtitle="Live demonstration flow · no 3D dependency"><div className="overflow-auto p-5"><div className="flex min-w-[940px] items-center">{stages.map((stage, index) => <React.Fragment key={stage}><motion.button animate={{ boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 18px rgba(34,211,238,.18)", "0 0 0 rgba(34,211,238,0)"] }} transition={{ duration: 2.5, repeat: Infinity, delay: index * .2 }} onClick={() => toast.info(`${stage}: ${4200 - index * 84} bags/hour`)} className="w-28 flex-shrink-0 rounded-xl border border-cyan-400/20 bg-cyan-400/[.065] p-3 text-center"><Boxes size={17} className="mx-auto text-cyan-300" /><p className="mt-2 text-[10px] font-semibold text-white">{stage}</p><p className="mt-1 text-[9px] text-emerald-300">{98.9 - index * .2}% healthy</p></motion.button>{index < stages.length - 1 && <div className="relative h-px w-7 flex-shrink-0 bg-cyan-400/30"><motion.span animate={{ x: [0, 26] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} className="absolute -top-0.5 h-1 w-1 rounded-full bg-cyan-200" /></div>}</React.Fragment>)}</div></div></AirportPanel><div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]"><AirportPanel title="Baggage throughput"><div className="p-3"><AirportTrendChart data={trend} height={240} /></div></AirportPanel><AirportPanel title="Conveyor and belt status"><div className="space-y-2 p-3">{["BC-14 · Vibration warning · 78% load", "Sorter S-03 · Normal · 84% load", "Make-up MU-08 · Normal · 72%", "Reclaim R-04 · Normal · 68%", "Transfer T-02 · Jam cleared · 09:27"].map((item, index) => <div key={item} className="flex items-center justify-between rounded-lg bg-white/[.03] p-3 text-[10px] text-slate-300"><span>{item}</span><AirportStatusBadge status={index === 0 ? "warning" : "normal"} /></div>)}</div></AirportPanel></div></>;
}

function PassengerOperations({ sectionId }: { sectionId: string }) {
  const [range, setRange] = useState("24 Hours");
  const trend = useMemo(() => getPassengerSeries(range), [range]);
  const metricSets: Record<string, Array<[string,string,string]>> = {
    "passenger-journey": [["Passengers today","96,840","+5.8%"],["Journey completion","94.2%","Healthy"],["Average processing","31 min","-2.4 min"],["Bottlenecks","2","Security B"],["Satisfaction","88 NPS","+4"],["Predicted peak","11:20","8,420 pax/h"]],
    "biometric-journey": [["Eligible passengers","74%","Opt-in demo"],["Touchpoints digitized","6 / 7","One journey"],["Face-match success","98.6%","Within threshold"],["Average touch reduction","-4 steps","Faster flow"],["Boarding acceleration","-22%","Per flight wave"],["Privacy posture","Tokenized","No raw PII demo"]],
    "queue-monitoring": [["Current queues","684","8 zones"],["Avg wait","8.4 min","Target <10"],["Max wait","14.6 min","Security B"],["Desks open","48 / 62","77%"],["15m forecast","+12%","Open lanes"],["SLA compliance","93.8%","+1.1 pt"]],
    "terminal-occupancy": [["Terminal occupancy","68%","Healthy"],["Peak zone","Security","86%"],["Comfort score","91%","Normal"],["Average CO₂","612 ppm","Good"],["Congestion risk","Medium","2 zones"],["Egress load","72%","Within design"]],
    "processing-performance": [["Check-in","2,840/h","96% SLA"],["Bag drop","1,980/h","94% SLA"],["Security","2,420/h","91% SLA"],["Immigration","1,760/h","93% SLA"],["Boarding","3,180/h","97% SLA"],["Baggage claim","4,120/h","98% SLA"]],
    "wayfinding": [["Active routes","46","Live"],["Gate changes","7","Updated"],["Avg walking time","12.4 min","-1.1 min"],["Signage online","284 / 288","98.6%"],["Congestion reroutes","14","Today"],["Route confidence","94%","High"]],
    "prm-assistance": [["Open requests","28","Demo only"],["Assigned","24","86%"],["Within SLA","92.4%","+2.2 pt"],["Escalations","2","Responding"],["Completed today","164","No PII"],["Avg response","6.8 min","Target <8"]],
    "service-quality": [["NPS demo","68","+4"],["Cleanliness","92%","Good"],["Queue experience","84%","Improving"],["Wayfinding","89%","Good"],["Wi-Fi","94%","Stable"],["Open complaints","18","5 recovering"]],
    "commercial-intelligence": [["Retail conversion","18.4%","+2.1 pt"],["Media fill rate","86%","Healthy"],["High-value audiences","14","Active"],["Estimated daily spend","₫486k / pax","Demo"],["Campaign uplift","+12.8%","AI segmentation"],["Concession alerts","7","Actionable"]],
  };
  const metrics = metricSets[sectionId] ?? metricSets["passenger-journey"];
  return <><div className="grid grid-cols-3 gap-2 xl:grid-cols-6">{metrics.map(([a,b,c], index) => <AirportMetricCard key={a} label={a} value={b} trend={c} compact tone={index === 3 || index === 4 ? "amber" : "cyan"} />)}</div><AirportFilterBar timeRange={range} onTimeRange={setRange}><select className="airport-select"><option>All terminal zones</option><option>Departures</option><option>Arrivals</option><option>Security</option></select></AirportFilterBar>{sectionId === "queue-monitoring" ? <QueueMonitor trend={trend} /> : sectionId === "passenger-journey" ? <JourneyView trend={trend} /> : sectionId === "biometric-journey" ? <BiometricJourney /> : sectionId === "commercial-intelligence" ? <CommercialIntelligence trend={trend} /> : <PassengerGeneric sectionId={sectionId} trend={trend} />}</>;
}

function JourneyView({ trend }: { trend: ReturnType<typeof getPassengerSeries> }) {
  return <><AirportPanel title="Passenger journey funnel" subtitle="Throughput, wait time, experience and predicted bottlenecks"><div className="overflow-auto p-4"><div className="flex min-w-[1040px] items-end gap-2">{PASSENGER_STAGES.map((stage, index) => <button key={stage.stage} onClick={() => toast.info(`${stage.stage}: ${stage.throughput.toLocaleString()} passengers · ${stage.wait} min wait`)} className="flex-1"><div className={`rounded-t-lg border border-b-0 p-2 ${stage.risk === "High" ? "border-amber-400/30 bg-amber-400/10" : "border-cyan-400/20 bg-cyan-400/[.055]"}`} style={{ height: `${88 + (PASSENGER_STAGES.length - index) * 5}px` }}><Users size={14} className="mx-auto text-cyan-300" /><p className="mt-2 text-center text-[9px] font-semibold text-white">{stage.stage}</p><p className="mt-1 text-center text-[9px] text-slate-400">{stage.throughput.toLocaleString()}</p><p className="text-center text-[8px] text-amber-300">{stage.wait} min</p></div></button>)}</div></div></AirportPanel><div className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]"><AirportPanel title="Passenger throughput forecast"><div className="p-3"><AirportTrendChart data={trend} height={240} color="#22d3ee" /></div></AirportPanel><AirportPanel title="Predicted bottlenecks"><div className="space-y-2 p-3">{["Security B · 86% capacity · Peak in 22 min", "Immigration West · 78% · Peak in 46 min", "Gate G18 corridor · 72% · Boarding wave"].map((item, index) => <div key={item} className="rounded-lg border border-amber-400/15 bg-amber-400/[.045] p-3"><div className="flex justify-between"><p className="text-[10px] text-white">{item}</p><AirportStatusBadge status={index === 0 ? "warning" : "info"} /></div><button onClick={() => toast.success("Recommended staffing action added to demo activity log")} className="mt-2 text-[9px] font-semibold text-cyan-300">Review recommended action →</button></div>)}</div></AirportPanel></div></>;
}

function BiometricJourney() {
  const touchpoints = [
    ["Enrollment", "App / kiosk / airline", "Digital token issued", "98.9%"],
    ["Terminal entry", "Smart lane", "Face token validated", "97.8%"],
    ["Bag drop", "Self-service", "Bag + token linked", "98.4%"],
    ["Security", "E-gate", "Queue priority orchestration", "96.8%"],
    ["Immigration", "ABC gate", "Border workflow handoff", "97.2%"],
    ["Boarding", "Biometric gate", "One-touch boarding", "99.1%"],
  ];
  const guardrails = [
    "Consent-based enrollment and revocation controls",
    "Tokenized identity — demo avoids raw personal data storage",
    "Fallback journey available at every step",
    "Audit trail for approval, matching and exception handling",
  ];
  return <><div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]"><AirportPanel title="One ID · One Touch · One Face" subtitle="Passenger flow for the GBIA digital journey"><div className="overflow-auto p-4"><div className="flex min-w-[980px] items-center gap-2">{touchpoints.map(([step, channel, detail, score], index) => <React.Fragment key={step}><button onClick={() => toast.info(`${step} · ${detail}`)} className="min-w-[150px] rounded-xl border border-cyan-400/18 bg-cyan-400/[.05] p-4 text-left"><p className="text-[9px] uppercase tracking-[.16em] text-cyan-300">0{index + 1}</p><p className="mt-2 text-sm font-semibold text-white">{step}</p><p className="mt-1 text-[10px] text-slate-400">{channel}</p><p className="mt-3 text-[10px] text-slate-300">{detail}</p><p className="mt-2 text-[9px] text-emerald-300">Success {score}</p></button>{index < touchpoints.length - 1 && <span className="text-slate-600">→</span>}</React.Fragment>)}</div></div></AirportPanel><AirportPanel title="Journey controls and guardrails"><div className="space-y-2 p-3">{guardrails.map((item, index) => <div key={item} className="rounded-lg border border-white/[.07] bg-white/[.03] p-3"><div className="flex items-start justify-between gap-3"><p className="text-[10px] text-slate-300">{item}</p><AirportStatusBadge status={index === 1 ? "info" : "normal"} /></div></div>)}<button onClick={() => toast.success("Biometric journey storyboard opened")} className="airport-button mt-2 w-full justify-center">Open journey storyboard</button></div></AirportPanel></div><AirportPanel title="Biometric operations detail"><div className="overflow-auto"><table className="w-full min-w-[840px] text-left text-[10px]"><thead className="bg-white/[.025] text-slate-500"><tr>{["Touchpoint","Channel","Data exchange","Success rate"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead><tbody>{touchpoints.map(([step, channel, detail, score]) => <tr key={step} className="border-t border-white/[.05] text-slate-300"><td className="px-3 py-3 font-medium text-white">{step}</td><td>{channel}</td><td>{detail}</td><td><AirportStatusBadge status="normal" label={score} /></td></tr>)}</tbody></table></div></AirportPanel></>;
}

function CommercialIntelligence({ trend }: { trend: ReturnType<typeof getPassengerSeries> }) {
  const opportunities = [
    ["Departures retail", "Coffee & convenience", "+14%", "Morning wave 06:30–08:30"],
    ["Duty free", "Family segment", "+9%", "Gate cluster G12–G18"],
    ["Food court", "Transfer passengers", "+11%", "Target dwell time 24 min"],
    ["Digital media", "Luxury brand campaign", "86% fill", "Boarding corridor / reclaim"],
    ["Parking upsell", "Pre-book premium", "+7%", "Weekend departures"],
    ["VIP lounge", "Corporate route bundle", "+6%", "Top 12 frequent flyers demo"],
  ];
  return <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]"><AirportPanel title="Passenger value and commercial trend"><div className="p-3"><AirportTrendChart data={trend} height={280} color="#22d3ee" /></div></AirportPanel><AirportPanel title="Monetization opportunities"><div className="space-y-2 p-3">{opportunities.map(([zone, product, uplift, note], index) => <div key={zone} className="rounded-lg border border-cyan-400/16 bg-cyan-400/[.05] p-3"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-semibold text-white">{zone}</p><AirportStatusBadge status={index < 3 ? "normal" : "info"} label={uplift} /></div><p className="mt-1 text-[10px] text-slate-300">{product}</p><p className="mt-2 text-[9px] text-slate-500">{note}</p></div>)}</div></AirportPanel><AirportPanel title="Commercial intelligence action board" subtitle="Retail + media + ancillary revenue"><div className="overflow-auto"><table className="w-full min-w-[840px] text-left text-[10px]"><thead className="bg-white/[.025] text-slate-500"><tr>{["Zone","Offer / inventory","Expected uplift","Trigger"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead><tbody>{opportunities.map(([zone, product, uplift, note]) => <tr key={`${zone}-${product}`} className="border-t border-white/[.05] text-slate-300"><td className="px-3 py-3 font-medium text-white">{zone}</td><td>{product}</td><td>{uplift}</td><td>{note}</td></tr>)}</tbody></table></div></AirportPanel></div>;
}

function QueueMonitor({ trend }: { trend: ReturnType<typeof getPassengerSeries> }) {
  return <><div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]"><AirportPanel title="Live queue heatmap" subtitle="Color reflects threshold utilization"><div className="grid grid-cols-2 gap-2 p-4 lg:grid-cols-4">{QUEUE_ROWS.map((row) => <button key={row.zone} onClick={() => toast.info(`${row.zone}: recommended action — ${row.action}`)} className={`rounded-xl border p-3 text-left ${row.wait > 10 ? "border-amber-400/25 bg-amber-400/[.08]" : "border-cyan-400/18 bg-cyan-400/[.045]"}`}><p className="text-[10px] font-semibold text-white">{row.zone}</p><p className="mt-2 text-2xl font-semibold text-white">{row.wait}<span className="ml-1 text-[9px] text-slate-500">min</span></p><div className="mt-2 flex justify-between text-[8px] text-slate-500"><span>{row.queue} people</span><span>{row.desks} desks</span></div></button>)}</div></AirportPanel><AirportPanel title="15 / 30 / 60 minute forecast"><div className="p-3"><AirportTrendChart data={trend} height={230} color="#a78bfa" /></div></AirportPanel></div><AirportPanel title="Queue actions and SLA"><div className="overflow-auto"><table className="w-full min-w-[860px] text-left text-[10px]"><thead className="bg-white/[.025] text-slate-500"><tr>{["Zone","Current queue","Wait","Desks","Rate/min","Forecast 15m","Threshold","Recommended action"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead><tbody>{QUEUE_ROWS.map((row) => <tr key={row.zone} className="border-t border-white/[.05] text-slate-300"><td className="px-3 py-2 font-medium text-white">{row.zone}</td><td>{row.queue}</td><td>{row.wait} min</td><td>{row.desks}</td><td>{row.rate}</td><td>{row.forecast15}</td><td>{row.threshold}</td><td><button onClick={() => toast.success(`${row.action} · simulated`)} className="text-cyan-300">{row.action}</button></td></tr>)}</tbody></table></div></AirportPanel></>;
}

function PassengerGeneric({ sectionId, trend }: { sectionId: string; trend: ReturnType<typeof getPassengerSeries> }) {
  const labels: Record<string, string[]> = {
    "terminal-occupancy": ["Departures · 72% · CO₂ 644 ppm", "Arrivals · 61% · CO₂ 578 ppm", "Security · 86% · Congestion medium", "Retail · 54% · Comfort good", "Boarding Gates · 76% · Egress 69%", "Baggage Claim · 68% · Density normal"],
    "processing-performance": ["Check-in · 2,840 pax/h · 96% SLA", "Bag drop · 1,980 pax/h · 94% SLA", "Security · 2,420 pax/h · 91% SLA", "Immigration · 1,760 pax/h · 93% SLA", "Boarding · 3,180 pax/h · 97% SLA", "Baggage claim · 4,120 pax/h · 98% SLA"],
    "wayfinding": ["Route T1-G18 · 12 min · Clear", "Route Security-G24 · 18 min · Rerouted", "Arrival-Baggage 04 · 7 min · Clear", "Parking-Departures · 14 min · Moderate", "Gate change G16 → G22 · Signage updated", "Digital sign DS-204 · Degraded"],
    "prm-assistance": ["REQ-2048 · Check-in → Gate G18 · Assigned", "REQ-2047 · Arrival → Baggage · In progress", "REQ-2046 · Gate G22 → Transport · Within SLA", "REQ-2045 · Security assistance · Escalated", "REQ-2044 · Boarding support · Complete", "REQ-2043 · Arrival support · Complete"],
    "service-quality": ["Cleanliness · 92% · Good", "Queue experience · 84% · Improving", "Wayfinding · 89% · Good", "Retail · 86% · Stable", "Wi-Fi · 94% · Stable", "Baggage waiting · 82% · Monitor"],
  };
  const rows = labels[sectionId] ?? labels["processing-performance"];
  return <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]"><AirportPanel title="Performance trend"><div className="p-3"><AirportTrendChart data={trend} height={280} /></div></AirportPanel><AirportPanel title="Live operational detail"><div className="grid grid-cols-2 gap-2 p-3">{rows.map((row, index) => <button key={row} onClick={() => toast.info(row)} className="rounded-lg border border-white/[.06] bg-white/[.025] p-3 text-left"><p className="text-[10px] text-slate-300">{row}</p><div className="mt-2"><AirportStatusBadge status={index === 3 || index === 5 ? "warning" : "normal"} /></div></button>)}</div></AirportPanel></div>;
}

function FacilityManagement({ sectionId }: { sectionId: string }) {
  if (sectionId === "asset-registry") return <AssetRegistry />;
  if (sectionId === "bim-explorer") return <BimExplorer />;
  const configs: Record<string, { metrics: Array<[string,string,string]>; rows: string[] }> = {
    "fm-overview": { metrics: [["Total assets","16,420","Mapped"],["Critical assets","1,286","7.8%"],["Assets online","98.1%","Healthy"],["Maintenance due","284","Next 30d"],["Open work orders","642","38 overdue"],["Asset health","87.6%","+1.2 pt"],["Warranty expiring","118","90 days"],["Inventory value","₫286B","Demo"],["SLA compliance","94.2%","+2.1 pt"]], rows: ["Baggage Conveyor BC-14 · Condition alert", "Passenger Bridge PBB-08 · Service due", "Chiller CH-03 · Predictive inspection", "Runway Lighting CCR-04 · Regulatory test", "Elevator EL-17 · Normal", "Generator GEN-02 · Parts reserved"] },
    "maintenance-plans": { metrics: [["Active plans","1,842","96% coverage"],["Preventive","1,204","65%"],["Condition-based","428","23%"],["Predictive","146","8%"],["Regulatory","64","4%"],["Due this week","82","14 critical"]], rows: ["Airfield lighting monthly inspection · 98% coverage", "Passenger bridge quarterly service · Due 18 Jul", "BHS vibration program · 428 assets", "Fire panel statutory test · Complete", "Chiller oil analysis · Scheduled", "Runway friction inspection · 01R due"] },
    "work-orders": { metrics: [["Open work orders","642","Live"],["New","84","13%"],["In progress","218","34%"],["Waiting parts","76","12%"],["Overdue","38","5.9%"],["SLA compliance","94.2%","+2.1 pt"]], rows: ["WO-10482 · BC-14 · In Progress · High", "WO-10481 · PBB-08 · Assigned · Critical", "WO-10480 · UPS DC-B · Waiting Parts", "WO-10479 · CCR-04 · Verified", "WO-10478 · AHU-T1-24 · Completed", "WO-10477 · Camera P-07 · In Progress"] },
    "inspections": { metrics: [["Programs","48","Active"],["Due today","28","6 critical"],["Completed","91%","Today"],["Findings","14","3 high"],["Digital forms","100%","Paperless"],["SLA","96.8%","Healthy"]], rows: ["Airfield inspection · 01L · Complete", "Runway lighting · 01R · Due 10:05", "Fire & life safety · Terminal · 94%", "Passenger bridges · 42 / 44", "Baggage systems · BC-14 finding", "Elevators/escalators · Normal"] },
    "spare-parts": { metrics: [["Parts SKUs","8,420","Managed"],["Inventory value","₫42.8B","Demo"],["Below reorder","118","Action"],["Reserved","624","Open WO"],["Avg lead time","18 days","-2 days"],["Critical stockouts","3","Mitigating"]], rows: ["PBB drive motor · 4 stock · Reorder 3", "BHS bearing kit · 18 stock · 7 reserved", "CCR control board · 2 stock · Critical", "UPS battery module · 12 stock · 4 reserved", "AHU filter F9 · 284 stock", "Runway lamp LED · 1,842 stock"] },
    "documents": { metrics: [["Documents","48,260","Indexed"],["O&M manuals","12,840","96% mapped"],["Drawings","8,420","Current"],["Certificates","6,180","142 expiring"],["BIM references","14,920","94% linked"],["Missing metadata","318","0.7%"]], rows: ["GBI-BHS-O&M-001 · Baggage Handling Manual", "GBI-RWY-DWG-104 · Runway Lighting Layout", "GBI-PBB-CERT-088 · Load Test Certificate", "GBI-HVAC-O&M-218 · Chiller Plant Manual", "GBI-FIRE-SOP-042 · Terminal Evacuation", "GBI-BIM-IFC-T1 · Terminal Federation"] },
    "warranty-contracts": { metrics: [["Active contracts","284","Managed"],["Covered assets","12,640","77%"],["Expiring 90d","118","Review"],["Supplier SLA","94.6%","Healthy"],["Claims open","28","₫1.8B"],["Renewal value","₫42B","Demo"]], rows: ["BHS service contract · 4.2 years remaining", "PBB warranty · 18 assets expiring", "Chiller maintenance · SLA 98.4%", "Elevator full service · 96.8%", "Airfield lighting · Renewal review", "UPS battery warranty · 12 claims"] },
    "space-management": { metrics: [["Managed area","1.82M m²","Airport"],["Terminal NLA","426k m²","Mapped"],["Occupancy","68%","Live"],["Retail use","82%","Healthy"],["Critical rooms","184","Monitored"],["Data completeness","96.2%","+1.4 pt"]], rows: ["Terminal Departures · 142,000 m² · 72%", "Terminal Arrivals · 108,000 m² · 61%", "Cargo Warehouse · 84,000 m² · 72%", "Data Center · 8,400 m² · 86%", "Utility Plant · 26,000 m² · 74%", "Parking Structures · 318,000 m² · 63%"] },
  };
  const config = configs[sectionId] ?? configs["fm-overview"];
  const trend = useMemo(() => getEnergySeries(`fm-${sectionId}`), [sectionId]);
  return <><div className="grid grid-cols-3 gap-2 xl:grid-cols-6">{config.metrics.map(([a,b,c], index) => <AirportMetricCard key={a} label={a} value={b} trend={c} compact tone={index === 4 ? "amber" : "emerald"} />)}</div><div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]"><AirportPanel title="Facility and asset performance trend"><div className="p-3"><AirportTrendChart data={trend} height={270} color="#34d399" /></div></AirportPanel><AirportPanel title="Priority records"><div className="space-y-2 p-3">{config.rows.map((row, index) => <button key={row} onClick={() => toast.info(row)} className="flex w-full items-center justify-between rounded-lg bg-white/[.03] p-3 text-left text-[10px] text-slate-300"><span>{row}</span><AirportStatusBadge status={index < 2 ? "warning" : "normal"} /></button>)}</div></AirportPanel></div><Workflow sectionId={sectionId} /></>;
}

function AssetRegistry() {
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState<PageSize>(25); const [search, setSearch] = useState(""); const [selected, setSelected] = useState<AssetRow | null>(null);
  const result = useMemo(() => getAssetPage(page, pageSize, search), [page, pageSize, search]);
  const compactHeader = "text-[7px] tracking-[0.08em] text-slate-500";
  const compactCell = "text-[9px]";
  const columns: AirportColumn<AssetRow>[] = [
    { key: "id", label: "Asset ID", width: "118px", headerClassName: compactHeader, cellClassName: compactCell, render: (row) => <span className="font-mono text-cyan-300">{row.id}</span> },
    { key: "bimGuid", label: "BIM GUID", width: "132px", headerClassName: compactHeader, cellClassName: compactCell },
    { key: "name", label: "Asset Name", width: "146px", headerClassName: compactHeader, cellClassName: compactCell },
    { key: "system", label: "System", width: "96px", headerClassName: compactHeader, cellClassName: compactCell },
    { key: "area", label: "Airport Area", width: "96px", headerClassName: compactHeader, cellClassName: compactCell },
    { key: "location", label: "Level / Zone / Room", width: "128px", headerClassName: compactHeader, cellClassName: compactCell },
    { key: "manufacturer", label: "Manufacturer", width: "104px", headerClassName: compactHeader, cellClassName: compactCell },
    { key: "condition", label: "Condition", width: "92px", headerClassName: compactHeader, cellClassName: compactCell, render: (row) => <AirportStatusBadge status={row.condition === "Critical" ? "critical" : row.condition === "Attention" ? "warning" : "normal"} label={row.condition} /> },
    { key: "criticality", label: "Criticality", width: "88px", headerClassName: compactHeader, cellClassName: compactCell },
    { key: "health", label: "Health", width: "72px", headerClassName: compactHeader, cellClassName: compactCell },
    { key: "runtime", label: "Runtime h", width: "84px", headerClassName: compactHeader, cellClassName: compactCell },
    { key: "nextService", label: "Next Service", width: "92px", headerClassName: compactHeader, cellClassName: compactCell },
    { key: "predictedFailure", label: "Predicted Failure", width: "108px", headerClassName: compactHeader, cellClassName: compactCell },
    { key: "dataQuality", label: "Data Quality", width: "86px", headerClassName: compactHeader, cellClassName: compactCell },
  ];
  return <><div className="grid grid-cols-3 gap-2 xl:grid-cols-6">{[["Total assets","16,420","Paged generation"],["Critical","1,286","7.8%"],["Online","98.1%","Healthy"],["Mapped to BIM","94.7%","+1.4 pt"],["Sensor points","42,680","Linked"],["Data quality","96.2%","Good"]].map(([a,b,c], index) => <AirportMetricCard key={a} label={a} value={b} trend={c} compact tone={index === 1 ? "amber" : "emerald"} />)}</div><AirportFilterBar search={search} onSearch={(value) => { setSearch(value); setPage(1); }}><select className="airport-select"><option>All asset categories</option><option>Baggage</option><option>Airfield</option><option>HVAC</option></select><select className="airport-select"><option>All conditions</option><option>Attention</option><option>Critical</option></select><button onClick={() => toast.success("Import preview opened with 128 validated rows")} className="airport-button">Import preview</button><button onClick={() => toast.success("Saved view: Critical airport assets")} className="airport-button">Save view</button></AirportFilterBar><AirportDataTable rows={result.rows} columns={columns} total={result.total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} onRowClick={setSelected} selectedId={selected?.id} /><AirportDetailDrawer open={Boolean(selected)} title={selected?.name ?? "Asset"} subtitle={selected?.id} onClose={() => setSelected(null)}>{selected && <AssetDetail asset={selected} />}</AirportDetailDrawer></>;
}

function AssetDetail({ asset }: { asset: AssetRow }) {
  return <div className="space-y-4"><div className="grid grid-cols-2 gap-2"><AirportMetricCard label="Health score" value={`${asset.health}%`} compact tone={asset.health < 65 ? "amber" : "emerald"} /><AirportMetricCard label="Data quality" value={`${asset.dataQuality}%`} compact /><AirportMetricCard label="Runtime" value={`${asset.runtime.toLocaleString()} h`} compact /><AirportMetricCard label="RUL" value={asset.predictedFailure} compact tone="violet" /></div><AirportPanel title="Asset master data"><div className="space-y-2 p-4">{Object.entries(asset).map(([key,value]) => <div key={key} className="flex justify-between gap-4 border-b border-white/[.05] pb-2 text-[10px]"><span className="capitalize text-slate-500">{key.replace(/([A-Z])/g," $1")}</span><b className="text-right text-slate-200">{String(value)}</b></div>)}</div></AirportPanel><AirportPanel title="Maintenance and prediction"><div className="space-y-2 p-4 text-[10px] text-slate-300"><p>Last service: 12 Jun 2026 · Condition-based inspection</p><p>Next service: {asset.nextService}</p><p>Related work orders: WO-10482, WO-10218</p><p>Prediction: {asset.predictedFailure} · Confidence 91%</p><button onClick={() => toast.success("Asset located on 2D airport context")} className="airport-button w-full justify-center">Locate in 2D</button><button onClick={() => toast.info("3D location mapping is ready when modelUrl is configured")} className="airport-button w-full justify-center">Locate in 3D</button></div></AirportPanel></div>;
}

function BimExplorer() {
  const [selected, setSelected] = useState("Passenger Terminal");
  const tree = ["Airport Federation", "Passenger Terminal", "Airside Infrastructure", "Cargo Terminal", "Utility Plant", "Data Center", "Support Facilities"];
  const modelSources: Record<string, string | undefined> = {
    "Passenger Terminal": "https://pub-ad3c98c8c26c4e95ad475279f7257940.r2.dev/Passenger-Terminal.glb",
    "Airside Infrastructure": "https://pub-ad3c98c8c26c4e95ad475279f7257940.r2.dev/Airside-Infrastructure.glb",
  };
  const digitalThread = [
    ["LiDAR / survey", "Airfield, terminal and utilities capture", "Ready"],
    ["BIM federation", "IFC / discipline merge and clash context", "In use"],
    ["Asset mapping", "BIM element ↔ FM asset registry ↔ sensor point", "94.7%"],
    ["Operations linkage", "Work order, inspection, SOP and documents", "Linked"],
    ["Analytics layer", "Prediction, capacity, energy and simulation", "Active"],
  ];
  const selectedHasModel = Boolean(modelSources[selected]);
  const propertyRows = [
    ["Classification", selected === "Airside Infrastructure" ? "IfcSite / IfcCivilElement" : "IfcFacility / IfcBuilding"],
    ["Airport area", selected === "Airside Infrastructure" ? "Airside" : selected === "Cargo Terminal" ? "Cargo" : selected === "Data Center" ? "IT / Critical Facility" : "Terminal"],
    ["Model source", selectedHasModel ? "GLB connected" : "Awaiting source"],
    ["Levels", selected === "Passenger Terminal" ? "4" : "—"],
    ["Zones", selected === "Airside Infrastructure" ? "28" : "148"],
    ["Systems", selectedHasModel ? "38" : "—"],
    ["Missing properties", selectedHasModel ? "84" : "—"],
    ["Work orders linked", selectedHasModel ? "642" : "—"],
    ["Documents linked", selectedHasModel ? "14,920" : "—"],
  ];

  return <div className="grid min-h-[700px] grid-cols-[260px_1fr_320px] overflow-hidden rounded-xl border border-white/[.08] bg-[#06111f]/80">
    <div className="airport-scrollbar overflow-auto border-r border-white/[.07] p-3">
      <div className="mb-3 text-[9px] uppercase tracking-wider text-slate-500">Schematic model tree</div>
      {tree.map((item,index) => <button key={item} onClick={() => setSelected(item)} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] ${selected === item ? "bg-cyan-400/10 text-cyan-200" : "text-slate-400 hover:bg-white/[.035]"}`}>
        <span className="text-slate-600">{index ? "├─" : "◆"}</span>
        <span className="flex-1">{item}</span>
        {modelSources[item] && <span className="rounded border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wider text-emerald-300">3D</span>}
      </button>)}
      <div className="mt-5 space-y-2">
        <p className="text-[9px] uppercase text-slate-600">Classifications</p>
        {["Systems","Levels / zones","Asset mapping","Sensor linkage","Operational documents","Issues & QA","Digital thread"].map((item) => <button key={item} className="block w-full rounded px-2 py-1.5 text-left text-[10px] text-slate-500 hover:bg-white/[.03] hover:text-white">{item}</button>)}
      </div>
    </div>

    <div className="relative min-w-0 overflow-hidden bg-[radial-gradient(circle_at_center,#0d2940_0,#04111f_68%)]">
      <div className="absolute inset-x-0 top-0 z-20 border-b border-white/[.06] bg-[#04111f]/82 p-4 backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-2">{digitalThread.map(([label, detail, state], index) => <button key={label} onClick={() => toast.info(`${label}: ${detail}`)} className="rounded-lg border border-cyan-400/14 bg-cyan-400/[.045] p-3 text-left">
          <p className="text-[9px] uppercase tracking-[.14em] text-cyan-300">0{index + 1}</p>
          <p className="mt-2 text-[10px] font-semibold text-white">{label}</p>
          <p className="mt-1 text-[9px] text-slate-500">{detail}</p>
          <p className="mt-2 text-[9px] text-emerald-300">{state}</p>
        </button>)}</div>
      </div>
      <div className="absolute inset-x-0 bottom-0 top-[148px]">
        <BimModelViewer modelUrl={modelSources[selected]} label={selected} />
      </div>
    </div>

    <div className="airport-scrollbar overflow-auto border-l border-white/[.07] p-4">
      <p className="text-[9px] uppercase tracking-wider text-cyan-300">Property panel</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{selected}</h3>
        <AirportStatusBadge status={selectedHasModel ? "normal" : "offline"} label={selectedHasModel ? "Model connected" : "No model"} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <AirportMetricCard label="Mapped assets" value={selectedHasModel ? "14,982" : "—"} compact />
        <AirportMetricCard label="Completeness" value={selectedHasModel ? "94.7%" : "—"} compact tone={selectedHasModel ? "emerald" : "amber"} />
        <AirportMetricCard label="Sensor links" value={selectedHasModel ? "38,420" : "—"} compact />
        <AirportMetricCard label="Issues" value={selectedHasModel ? "318" : "—"} compact tone="amber" />
      </div>
      <div className="mt-4 space-y-2">{propertyRows.map(([a,b]) => <div key={a} className="flex justify-between gap-4 border-b border-white/[.05] pb-2 text-[10px]">
        <span className="text-slate-500">{a}</span><b className="text-right text-slate-200">{b}</b>
      </div>)}</div>
      {selectedHasModel && <div className="mt-4 rounded-xl border border-cyan-400/14 bg-cyan-400/[.045] p-3">
        <p className="text-[9px] uppercase tracking-[.14em] text-cyan-300">Connected source</p>
        <p className="mt-2 break-all font-mono text-[9px] text-slate-400">{modelSources[selected]}</p>
      </div>}
    </div>
  </div>;
}
function Workflow({ sectionId }: { sectionId: string }) {
  const stages = sectionId === "work-orders" ? ["New","Assigned","In Progress","Waiting Parts","Completed","Verified","Closed"] : ["Detected","Prioritized","Planned","Scheduled","Executed","Verified"];
  return <AirportPanel title={sectionId === "work-orders" ? "Work order workflow" : "Operational workflow"}><div className="flex items-center gap-2 overflow-auto p-4">{stages.map((stage,index) => <React.Fragment key={stage}><button onClick={() => toast.success(`${stage} state selected in demonstration workflow`)} className={`min-w-28 rounded-lg border p-3 text-[10px] ${index < 3 ? "border-emerald-400/20 bg-emerald-400/[.06] text-emerald-200" : "border-white/[.08] bg-white/[.025] text-slate-400"}`}>{stage}</button>{index < stages.length - 1 && <span className="text-slate-700">→</span>}</React.Fragment>)}</div></AirportPanel>;
}

function IntelligenceOperations({ sectionId }: { sectionId: string }) {
  if (sectionId === "predictive-maintenance") return <PredictiveMaintenance />;
  if (sectionId === "autonomous-operations") return <AutonomousOperations />;
  if (sectionId === "capacity-forecast") return <CapacityForecastRoadmap />;
  const configs: Record<string, { metrics: Array<[string,string,string]>; insights: string[] }> = {
    "intelligence-overview": { metrics: [["AI models active","28","Monitored"],["High-value insights","14","Today"],["Avoided downtime","184 h","30 days"],["Estimated savings","₫4.8B","Monthly"],["Model confidence","92.4%","Healthy"],["Actions pending","8","Human approval"]], insights: ["BC-14 failure risk increased to 72%", "Security B capacity will exceed 90% in 22 min", "Flight VJ507 off-block predicted +12 min", "Chiller CH-03 load can be shifted for 8.4% saving", "Stand S24 / S26 conflict mitigated by reassignment", "Data center cooling anomaly remains within redundancy"] },
    "energy-ai": { metrics: [["Power demand","12.8 MW","-3.1%"],["AI saving potential","1.08 MW","8.4%"],["Cost saving","₫184M","Monthly"],["CO₂ reduction","128 t","Monthly"],["Recommendations","12","4 approved"],["Confidence","93.2%","High"]], insights: ["Shift chiller CH-03 staging by 18 minutes", "Reduce terminal supply air setpoint during low occupancy", "Dim airfield standby lighting group by 12%", "Move EV charging peak to 13:30", "Optimize data center CRAH fan pressure", "Pre-cool retail zone before passenger wave"] },
    "delay-prediction": { metrics: [["Flights analyzed","642","Today"],["High risk","3","Action"],["Medium risk","18","Monitor"],["Predicted delay","486 min","Aggregate"],["Mitigated","142 min","Today"],["Confidence","91.8%","High"]], insights: ["VJ507 · +24 min · Late inbound + gate conflict", "SQ191 · +18 min · Stand reassignment", "VN814 · +16 min · Weather + turnaround", "QH204 · +12 min · Catering variance", "TG561 · +9 min · Passenger connection", "EK395 · +8 min · Ground handling"] },
    "anomaly-detection": { metrics: [["Active anomalies","18","Cross-domain"],["Critical","1","P-07"],["High","4","Review"],["Avg confidence","89.6%","Healthy"],["Resolved today","42","Auto triage"],["False positive","2.1%","Low"]], insights: ["Perimeter P-07 · Radar + camera correlation · 97%", "BC-14 vibration · 3.2σ above baseline · 94%", "UPS DC-B battery impedance · 2.6σ · 91%", "Security B processing rate · 18% below expected", "Stand S32 GPU telemetry gap · 42 seconds", "Chiller CH-03 COP drift · 6.8%"] },
    "what-if-simulation": { metrics: [["Active scenario","Runway closure","Simulation"],["Flights affected","86","4 hours"],["OTP impact","-12.8 pt","Before action"],["Passenger impact","18,420","Estimated"],["Recovery time","3.2 h","Predicted"],["Mitigated OTP","-4.1 pt","After action"]], insights: ["Runway closure", "Terminal congestion", "Flight wave delay", "Baggage conveyor failure", "Chiller outage", "Data center incident", "Security lane reduction", "Severe weather"] },
  };
  const config = configs[sectionId] ?? configs["intelligence-overview"];
  const trend = useMemo(() => sectionId === "energy-ai" ? getEnergySeries(sectionId) : getFlightTrend(sectionId), [sectionId]);
  return <><div className="grid grid-cols-3 gap-2 xl:grid-cols-6">{config.metrics.map(([a,b,c],index) => <AirportMetricCard key={a} label={a} value={b} trend={c} compact tone={index === 1 || index === 2 ? "violet" : "cyan"} />)}</div><div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]"><AirportPanel title="AI forecast and confidence"><div className="p-3"><AirportTrendChart data={trend} height={280} color="#a78bfa" /></div></AirportPanel><AirportPanel title={sectionId === "what-if-simulation" ? "Scenario library" : "Prioritized intelligence"}><div className="space-y-2 p-3">{config.insights.map((insight,index) => <div key={insight} className="rounded-lg border border-violet-400/12 bg-violet-400/[.045] p-3"><div className="flex items-start justify-between gap-3"><p className="text-[10px] text-slate-200">{insight}</p><AirportStatusBadge status={index === 0 ? "warning" : "info"} /></div><div className="mt-2 flex gap-2"><button onClick={() => toast.success("Simulation completed with before/after KPI")} className="text-[9px] font-semibold text-violet-300">Simulate</button><button onClick={() => toast.success("Recommendation approved in demo activity log")} className="text-[9px] font-semibold text-cyan-300">Approve demo</button></div></div>)}</div></AirportPanel></div><AirportPanel title="Decision governance"><div className="grid grid-cols-4 gap-3 p-4">{[["Recommendation","8 pending","Human review"],["Approved","4 today","Audit logged"],["Applied demo","3","Reversible"],["Rejected","1","Reason captured"]].map(([a,b,c],index) => <button key={a} onClick={() => toast.info(`${a}: ${b}`)} className="rounded-xl border border-white/[.07] bg-white/[.025] p-4 text-left"><Sparkles size={16} className={index === 0 ? "text-violet-300" : "text-cyan-300"} /><p className="mt-3 text-[10px] text-slate-500">{a}</p><p className="text-sm font-semibold text-white">{b}</p><p className="text-[9px] text-slate-600">{c}</p></button>)}</div></AirportPanel></>;
}

function PredictiveMaintenance() {
  const [selected, setSelected] = useState(PREDICTIONS[0]);
  return <><div className="grid grid-cols-3 gap-2 xl:grid-cols-7">{[["Monitored assets","8,420","Live"],["High-risk","18","Action"],["Predicted failures","42","90 days"],["Average RUL","184 days","Portfolio"],["Avoided downtime","184 h","30 days"],["Estimated savings","₫2.8B","Monthly"],["Confidence","92.4%","Healthy"]].map(([a,b,c],index) => <AirportMetricCard key={a} label={a} value={b} trend={c} compact tone={index === 1 || index === 2 ? "amber" : index === 6 ? "violet" : "cyan"} />)}</div><div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]"><AirportPanel title="Predictive asset portfolio"><div className="overflow-auto"><table className="w-full min-w-[780px] text-left text-[10px]"><thead className="bg-white/[.025] text-slate-500"><tr>{["Asset","Health","Failure probability","RUL","Confidence","Impact","Recommended action"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead><tbody>{PREDICTIONS.map((row) => <tr key={row.asset} onClick={() => setSelected(row)} className="cursor-pointer border-t border-white/[.05] text-slate-300 hover:bg-cyan-400/[.04]"><td className="px-3 py-3 font-medium text-white">{row.asset}</td><td>{row.health}%</td><td><AirportStatusBadge status={row.failure > 60 ? "critical" : row.failure > 40 ? "warning" : "normal"} label={`${row.failure}%`} /></td><td>{row.rul}</td><td>{row.confidence}</td><td>{row.impact}</td><td className="text-cyan-300">{row.action}</td></tr>)}</tbody></table></div></AirportPanel><AirportPanel title="Asset prediction detail"><div className="p-4"><h3 className="text-sm font-semibold text-white">{selected.asset}</h3><div className="mt-4 grid grid-cols-2 gap-2"><AirportMetricCard label="Health" value={`${selected.health}%`} compact tone="amber" /><AirportMetricCard label="Failure" value={`${selected.failure}%`} compact tone="red" /><AirportMetricCard label="RUL" value={selected.rul} compact tone="violet" /><AirportMetricCard label="Confidence" value={selected.confidence} compact /></div><div className="mt-4 space-y-2 text-[10px] text-slate-400"><p>Root cause: Bearing vibration and temperature drift</p><p>Operational impact: {selected.impact}</p><p>Maintenance window: 13 Jul · 01:30–03:00</p><p>Related work order: WO-10482</p></div><button onClick={() => toast.success("Condition-based work order created in demo workflow")} className="airport-button mt-4 w-full justify-center">Create work order</button></div></AirportPanel></div></>;
}

function AutonomousOperations() {
  const workflows = ["Passenger congestion", "Baggage equipment failure", "Flight delay / gate conflict", "Energy optimization", "Airside safety alert", "IT service degradation"];
  const stages = ["Trigger","Context","Decision","Action Plan","Approval","Execution","Verification","Audit"];
  const [mode,setMode] = useState("Human Approval"); const [active,setActive] = useState(workflows[0]);
  return <><div className="rounded-xl border border-violet-400/25 bg-violet-400/[.06] p-4"><div className="flex items-center justify-between"><div><div className="flex items-center gap-2"><BrainCircuitIcon /><h3 className="text-sm font-semibold text-white">Simulation Environment</h3></div><p className="mt-1 text-[10px] text-slate-400">This demonstration does not control real airport systems.</p></div><div className="flex gap-1 rounded-lg bg-black/20 p-1">{["Monitor Only","Recommendation","Human Approval","Autonomous Demo"].map((item) => <button key={item} onClick={() => { setMode(item); toast.info(`Operating mode: ${item}`); }} className={`rounded px-3 py-2 text-[9px] ${mode === item ? "bg-violet-400/20 text-violet-200" : "text-slate-500"}`}>{item}</button>)}</div></div></div><div className="grid gap-4 xl:grid-cols-[.65fr_1.35fr]"><AirportPanel title="Workflow scenarios"><div className="space-y-2 p-3">{workflows.map((workflow) => <button key={workflow} onClick={() => setActive(workflow)} className={`w-full rounded-lg border p-3 text-left text-[10px] ${active === workflow ? "border-violet-400/25 bg-violet-400/[.08] text-violet-200" : "border-white/[.06] bg-white/[.025] text-slate-400"}`}>{workflow}</button>)}</div></AirportPanel><AirportPanel title={active} subtitle={`${mode} · governed workflow`}><div className="grid grid-cols-4 gap-3 p-4">{stages.map((stage,index) => <motion.button key={stage} whileHover={{ y: -2 }} onClick={() => toast.success(`${stage} reviewed and added to audit log`)} className={`relative rounded-xl border p-4 text-left ${index < 5 ? "border-violet-400/20 bg-violet-400/[.06]" : "border-white/[.07] bg-white/[.025]"}`}><span className="text-[9px] text-slate-600">0{index + 1}</span><p className="mt-2 text-[11px] font-semibold text-white">{stage}</p><p className="mt-1 text-[9px] text-slate-500">{index < 5 ? "Prepared" : "Pending approval"}</p>{index < stages.length - 1 && <span className="absolute -right-3 top-1/2 z-10 text-slate-600">→</span>}</motion.button>)}</div><div className="border-t border-white/[.07] p-4"><button onClick={() => toast.success("Workflow executed as reversible simulation")} className="airport-button">Run reversible demo</button></div></AirportPanel></div></>;
}

function CapacityForecastRoadmap() {
  const trend = getFlightTrend("capacity-forecast");
  const peaks = [["Runway","86%","11:20"],["Stands","94%","11:35"],["Security","91%","10:48"],["Immigration","82%","12:10"],["Baggage","78%","11:42"],["Terminal","84%","12:05"]] as const;
  const roadmap = [
    ["Phase 1","Core Digital Twin foundation","2D / GIS overview, spatial hierarchy, overview cockpit and key system connectivity"],
    ["Phase 2","Operational integration","Airport ops, passengers, FM, safety and system workflows in one operating shell"],
    ["Phase 3","Predictive intelligence","Capacity, delay, energy and maintenance models with governed recommendations"],
    ["Phase 4","Autonomous operations","Simulation-first execution, approval workflow and reversible automation demo"],
  ] as const;
  const actions = [["Security","91%","10:48","Open 2 extra lanes before the wave"],["Stands","94%","11:35","Prepare remote stand contingency"],["Runway","86%","11:20","Monitor sequencing buffers"],["Terminal","84%","12:05","Deploy passenger-flow marshals"],["Baggage","78%","11:42","Activate reclaim 04 surge plan"],["Immigration","82%","12:10","Adjust e-gate staffing mix"]] as const;
  return <><div className="grid grid-cols-3 gap-2 xl:grid-cols-6">{peaks.map(([a,b,c], index) => <AirportMetricCard key={a} label={`${a} peak`} value={b} trend={c} compact tone={index < 3 ? "amber" : "cyan"} />)}</div><div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]"><AirportPanel title="Capacity forecast and peak waves"><div className="p-3"><AirportTrendChart data={trend} height={280} color="#a78bfa" /></div></AirportPanel><AirportPanel title="Roadmap to autonomous airport"><div className="space-y-2 p-3">{roadmap.map(([phase, title, detail], index) => <div key={phase} className="rounded-lg border border-violet-400/14 bg-violet-400/[.045] p-3"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-semibold text-white">{phase} · {title}</p><AirportStatusBadge status={index < 2 ? "normal" : "info"} /></div><p className="mt-2 text-[10px] text-slate-300">{detail}</p></div>)}</div></AirportPanel></div><AirportPanel title="Peak management actions"><div className="overflow-auto"><table className="w-full min-w-[820px] text-left text-[10px]"><thead className="bg-white/[.025] text-slate-500"><tr>{["Domain","Peak load","Time","Suggested action"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead><tbody>{actions.map(([domain, load, time, action]) => <tr key={domain} className="border-t border-white/[.05] text-slate-300"><td className="px-3 py-3 font-medium text-white">{domain}</td><td>{load}</td><td>{time}</td><td>{action}</td></tr>)}</tbody></table></div></AirportPanel></>;
}

function SafetyOperations({ sectionId }: { sectionId: string }) {
  const configs: Record<string, string[]> = {
    "security-overview": ["Perimeter intrusion P-07 · Critical", "Forced door T1-S04 · Cleared", "Unattended baggage T1-D18 · Investigating", "Crowd congestion Security B · Warning", "Vehicle route violation Airside V-28 · Closed", "Restricted-zone access Cargo Z4 · Denied"],
    "cctv-vms": ["Cameras online · 1,284 / 1,296", "AI analytics streams · 428", "Coverage confidence · 98.4%", "Storage retention · 30 days demo", "Camera CAM-P07-04 · Tracking incident", "Video wall profiles · 18"],
    "access-control": ["Access points · 842 / 848 online", "Doors held open · 3", "Forced door · 1 cleared", "Airside credentials · 12,480 demo", "Controller AC-T1-08 · Warning", "Denied events today · 42"],
    "perimeter-security": ["Perimeter sectors · 24", "Radar coverage · 99.2%", "Fence sensors · 428 / 432", "Active incident · P-07", "Patrol ETA · 3 min", "Camera correlation · 97% confidence"],
    "restricted-zones": ["Airside zones · 18", "Cargo zones · 8", "ATC zones · 4", "Data center zones · 6", "Violations today · 3", "Permit compliance · 99.1%"],
    "fire-life-safety": ["Fire panels · 18 / 18 normal", "Devices online · 8,420 / 8,424", "Supervisory signals · 2", "Evacuation zones ready · 42 / 42", "Smoke detector SD-T1-284 · Review", "SOP readiness · 98.7%"],
    "airside-safety": ["Incursion risk · 0.08 nominal", "Vehicle violations · 2", "Worker safety alerts · 1", "FOD inspections · Complete", "Runway crossings · 18 today", "Airside permits · 99.4% valid"],
    "emergency-command": ["Active command · INC-2407", "Response team · Alpha 2", "SOP · Perimeter intrusion", "Communication · All channels", "Evacuation zone · Not required", "Audit events · 18"],
    "incident-management": ["Open incidents · 18", "Critical · 1", "High · 4", "Mean acknowledge · 38 sec", "Mean resolve · 18.4 min", "SLA compliance · 96.8%"],
  };
  const rows = configs[sectionId] ?? configs["security-overview"];
  return <><div className="grid grid-cols-3 gap-2 xl:grid-cols-6">{[["Security posture","Elevated","P-07"],["Critical incidents","1","Responding"],["Cameras online","99.1%","12 degraded"],["Access points","99.3%","6 offline"],["Fire readiness","98.7%","Healthy"],["Airside risk","Low","0.08 index"]].map(([a,b,c],index) => <AirportMetricCard key={a} label={a} value={b} trend={c} compact tone={index < 2 ? "red" : index > 3 ? "emerald" : "amber"} />)}</div><div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]"><AirportPanel title="Safety and security operating picture"><div className="grid grid-cols-2 gap-2 p-3">{rows.map((row,index) => <button key={row} onClick={() => toast.info(row)} className="rounded-lg border border-white/[.06] bg-white/[.025] p-3 text-left"><div className="flex items-start justify-between gap-2"><p className="text-[10px] text-slate-300">{row}</p><AirportStatusBadge status={index === 0 && sectionId !== "fire-life-safety" ? "critical" : index === 4 ? "warning" : "normal"} /></div></button>)}</div></AirportPanel><AirportPanel title="Live incident feed"><div className="space-y-2 p-3">{INCIDENTS.map((incident,index) => <button key={incident[0]} onClick={() => toast.success(`Incident command opened: ${incident[0]}`)} className="w-full rounded-lg border border-white/[.06] bg-white/[.025] p-3 text-left"><div className="flex justify-between"><span className="font-mono text-[9px] text-cyan-300">{incident[0]}</span><AirportStatusBadge status={index === 0 ? "critical" : "warning"} label={incident[2]} /></div><p className="mt-1 text-[10px] font-medium text-white">{incident[1]}</p><p className="mt-1 text-[9px] text-slate-500">{incident[4]} · {incident[5]}</p></button>)}</div></AirportPanel></div>{sectionId === "emergency-command" && <EmergencyCommand />}</>;
}

function EmergencyCommand() {
  const timeline = [["09:40","Detection","Radar + camera correlation","P-07","Critical"],["09:40","Command","Incident declared","INC-2407","Warning"],["09:41","Response","Alpha 2 dispatched","ETA 3 min","Normal"],["09:42","Comms","ATC and security notified","Complete","Normal"],["09:43","Containment","Zone P-07 isolated","Active","Warning"]];
  return <AirportPanel title="Emergency command · INC-2407" subtitle="Perimeter intrusion response"><div className="grid gap-4 p-4 xl:grid-cols-[1fr_.8fr]"><AirportTimeline events={timeline} /><div className="space-y-2">{[["Response team","Alpha 2 · 4 officers"],["SOP","SEC-PERIM-04"],["Communication","ATC · Security · Airport Ops"],["Evacuation","Not required"],["Command status","Containment active"]].map(([a,b]) => <div key={a} className="flex justify-between rounded-lg bg-white/[.03] p-3 text-[10px]"><span className="text-slate-500">{a}</span><b className="text-white">{b}</b></div>)}<button onClick={() => toast.success("Command update added to immutable demo audit trail")} className="airport-button w-full justify-center">Record command update</button></div></div></AirportPanel>;
}

function SystemsOperations({ sectionId }: { sectionId: string }) {
  if (sectionId === "unified-data-lake") return <UnifiedDataLakeArchitecture />;
  if (sectionId === "integration-hub") return <IntegrationHub />;
  if (sectionId === "data-center") return <MiniDataCenterView />;
  const domain = ["bms","ems","electrical","water","lighting","fire-integration","facility-ot"].includes(sectionId) ? "OT" : ["aviation-systems"].includes(sectionId) ? "Aviation" : "IT";
  const trend = useMemo(() => getEnergySeries(`systems-${sectionId}`), [sectionId]);
  const rows = domain === "OT" ? ["BMS · 12,840 points · 99.83%", "EMS · 4,280 points · 99.91%", "Electrical · 2,840 points · 99.97%", "Water · 1,280 points · 99.82%", "Lighting · 8,420 points · 99.94%", "Fire · 8,424 devices · 99.99%"] : domain === "Aviation" ? ["AODB · 99.99% · 24 ms", "FIDS · 99.97% · 31 ms", "BHS · 99.94% · 18 ms", "A-CDM · 99.92% · 42 ms", "Gate / stand · 99.86% · 28 ms", "Weather · 99.99% · 17 ms"] : ["Core network · 99.99%", "Passenger Wi-Fi · 99.94%", "Data center · 99.98%", "API gateway · 99.97%", "Databases · 99.99%", "Cybersecurity · Elevated monitoring"];
  return <><div className="grid grid-cols-3 gap-2 xl:grid-cols-6">{[["Systems online","97 / 99","98.0%"],["Availability","99.91%","30 days"],["Data freshness","6 sec","Median"],["Active alerts","18","1 critical"],["Median latency","31 ms","Healthy"],["Data quality","97.8%","+0.8 pt"]].map(([a,b,c],index) => <AirportMetricCard key={a} label={a} value={b} trend={c} compact tone={index === 3 ? "amber" : "cyan"} />)}</div>{sectionId === "systems-overview" && <div className="grid gap-4 xl:grid-cols-3">{[["OT","28 / 29 systems","99.86%","4 alerts"],["IT","34 / 35 systems","99.94%","7 alerts"],["Aviation","35 / 35 systems","99.97%","7 alerts"]].map(([name,online,availability,alerts],index) => <AirportPanel key={name} title={`${name} service pillar`}><div className="grid grid-cols-2 gap-2 p-4"><AirportMetricCard label="Online" value={online} compact tone={index === 0 ? "emerald" : "blue"} /><AirportMetricCard label="Availability" value={availability} compact /><AirportMetricCard label="Alerts" value={alerts} compact tone="amber" /><AirportMetricCard label="Critical services" value={index === 2 ? "18 / 18" : "12 / 12"} compact tone="emerald" /></div></AirportPanel>)}</div>}<div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]"><AirportPanel title={`${domain} service health and demand`}><div className="p-3"><AirportTrendChart data={trend} height={270} color={domain === "OT" ? "#34d399" : domain === "Aviation" ? "#60a5fa" : "#22d3ee"} /></div></AirportPanel><AirportPanel title={`${domain} critical services`}><div className="space-y-2 p-3">{rows.map((row,index) => <button key={row} onClick={() => toast.info(row)} className="flex w-full items-center justify-between rounded-lg bg-white/[.03] p-3 text-left text-[10px] text-slate-300"><span>{row}</span><AirportStatusBadge status={index === rows.length - 1 && sectionId === "cybersecurity" ? "warning" : "normal"} /></button>)}</div></AirportPanel></div>{sectionId === "data-quality" && <DataQuality />}</>;
}

function UnifiedDataLakeArchitecture() {
  const layers = [
    ["Ingestion", "OT, IT, Aviation, BIM/GIS, documents, IoT edge", "MQTT · BACnet · Modbus · API · ETL"],
    ["Bronze", "Raw immutable event store", "Time-series, logs, telemetry, files"],
    ["Silver", "Cleansed / normalized domain data", "Airport semantics and master data"],
    ["Gold", "Decision-ready marts", "Ops, passengers, FM, safety and intelligence"],
    ["AI / Apps", "Forecasting, digital twin, simulation, dashboards", "Copilot and governed actions"],
  ] as const;
  return <><div className="grid grid-cols-3 gap-2 xl:grid-cols-6">{[["Data domains","5","OT / IT / Aviation / Spatial / Docs"],["Streaming feeds","97","Live"],["Median freshness","6 sec","Healthy"],["Canonical models","28","Airport semantics"],["Data products","42","Decision-ready"],["Lineage coverage","92.4%","Improving"]].map(([a,b,c],index) => <AirportMetricCard key={a} label={a} value={b} trend={c} compact tone={index === 5 ? "amber" : "cyan"} />)}</div><div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]"><AirportPanel title="Unified data lakehouse architecture"><div className="p-4"><div className="space-y-3">{layers.map(([name, detail, tech], index) => <div key={name} className="rounded-xl border border-cyan-400/15 bg-cyan-400/[.045] p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.16em] text-cyan-300">Layer 0{index + 1}</p><h3 className="mt-1 text-sm font-semibold text-white">{name}</h3><p className="mt-1 text-[10px] text-slate-300">{detail}</p></div><p className="max-w-[220px] text-right text-[9px] text-slate-500">{tech}</p></div></div>)}</div></div></AirportPanel><AirportPanel title="What this unlocks"><div className="space-y-2 p-3">{["Single source of truth across OT, IT and aviation", "Mini DC + edge nodes can continue local operations", "Semantic layer for assets, flights, passengers and work orders", "Reusable data products for AI, KPI and media storytelling", "Governed lineage, quality and approval workflow"].map((item, index) => <div key={item} className="rounded-lg border border-white/[.07] bg-white/[.03] p-3"><div className="flex items-start justify-between gap-3"><p className="text-[10px] text-slate-300">{item}</p><AirportStatusBadge status={index < 3 ? "normal" : "info"} /></div></div>)}<button onClick={() => toast.success("Architecture blueprint opened")} className="airport-button mt-2 w-full justify-center">Open architecture blueprint</button></div></AirportPanel></div></>;
}

function MiniDataCenterView() {
  const rows = [["Compute racks","12 / 12 online","Redundant"],["Storage pools","4 / 4 healthy","Replication on"],["Network fabric","2 core + 8 leaf","Healthy"],["UPS","2N","92 min runtime"],["Cooling","N+1 CRAH","Stable"],["Edge nodes","18 remote","Synced"]] as const;
  return <><div className="grid grid-cols-3 gap-2 xl:grid-cols-6">{[["Rack utilization","68%","Healthy"],["Power load","182 kW","+4%"],["Cooling load","76%","Stable"],["PUE demo","1.42","Efficient"],["Replication lag","18 sec","Target <30"],["Critical alarms","0","Nominal"]].map(([a,b,c], index) => <AirportMetricCard key={a} label={a} value={b} trend={c} compact tone={index === 5 ? "emerald" : "cyan"} />)}</div><div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]"><AirportPanel title="Mini DC operational profile"><div className="grid grid-cols-2 gap-2 p-4">{rows.map(([name,value,note]) => <div key={name} className="rounded-lg border border-white/[.07] bg-white/[.03] p-3"><p className="text-[10px] text-slate-500">{name}</p><p className="mt-1 text-sm font-semibold text-white">{value}</p><p className="mt-1 text-[9px] text-slate-600">{note}</p></div>)}</div></AirportPanel><AirportPanel title="Why a mini data center matters"><div className="space-y-2 p-3">{["Local airport resilience for OT, video and critical services", "Edge analytics for CCTV, passenger flow and airside events", "Sovereign storage for operational data and BIM references", "Fast recovery and sync with central enterprise platforms"].map((item) => <div key={item} className="rounded-lg border border-cyan-400/14 bg-cyan-400/[.05] p-3 text-[10px] text-slate-300">{item}</div>)}</div></AirportPanel></div></>;
}

function IntegrationHub() {
  const rows = SYSTEM_CONNECTIONS.map((row,index) => ({ id: `INT-${index + 1}`, system: row[0], domain: row[1], protocol: row[2], availability: row[3], lastMessage: row[4], latency: row[5], quality: row[6], owner: ["Airport Ops","IT Operations","Facility OT","Data Platform"][index % 4] }));
  type ConnectionRow = (typeof rows)[number];
  const columns: AirportColumn<ConnectionRow>[] = [{key:"system",label:"System",render:(row)=><span className="font-semibold text-cyan-300">{row.system}</span>},{key:"domain",label:"Domain"},{key:"protocol",label:"Connection / Protocol"},{key:"availability",label:"Availability"},{key:"lastMessage",label:"Last message"},{key:"latency",label:"Latency"},{key:"quality",label:"Data quality"},{key:"owner",label:"Owner"}];
  return <><div className="grid grid-cols-3 gap-2 xl:grid-cols-6">{[["Connected systems","97 / 99","98.0%"],["Messages / sec","42,680","Peak 68k"],["API availability","99.97%","Healthy"],["Median latency","31 ms","Target <80"],["Data quality","97.8%","+0.8 pt"],["Integration errors","18","1 critical"]].map(([a,b,c],index) => <AirportMetricCard key={a} label={a} value={b} trend={c} compact tone={index === 5 ? "amber" : "cyan"} />)}</div><div className="grid gap-4 xl:grid-cols-4">{[["Aviation",7,"AODB · FIDS · BHS · A-CDM"],["IT",8,"Network · Wi-Fi · API · DB"],["OT",9,"BMS · EMS · CCTV · ACS"],["Spatial",4,"BIM · GIS · CAD · Indoor"]].map(([name,count,copy]) => <AirportPanel key={String(name)} title={String(name)}><div className="p-4"><p className="text-2xl font-semibold text-white">{count}</p><p className="mt-1 text-[10px] text-slate-500">{copy}</p></div></AirportPanel>)}</div><AirportPanel title="Integration governance"><div className="grid grid-cols-4 gap-2 p-4">{[["Protocols","BACnet · Modbus · MQTT · API"],["Master data","Flights · Assets · Locations"],["Event bus","Streaming + batch"],["Audit","Immutable demo trail"]].map(([a,b]) => <div key={String(a)} className="rounded-lg border border-white/[.07] bg-white/[.03] p-3"><p className="text-[9px] text-slate-500">{a}</p><p className="mt-1 text-[10px] text-white">{b}</p></div>)}</div></AirportPanel><AirportDataTable rows={rows} columns={columns} total={rows.length} page={1} pageSize={25} onPageChange={() => undefined} onPageSizeChange={() => undefined} onRowClick={(row) => toast.info(`${row.system} connection detail opened`)} /></>;
}

function DataQuality() {
  return <AirportPanel title="Enterprise data quality dimensions"><div className="grid grid-cols-4 gap-3 p-4">{[["Completeness",97.8,"1,842 missing values"],["Freshness",98.6,"18 stale feeds"],["Accuracy",96.9,"42 validation flags"],["Duplicate data",99.4,"284 duplicate records"],["BIM mappings",94.7,"318 unmapped assets"],["Valid units",99.1,"62 unit conflicts"],["Sensor coverage",96.8,"1,284 offline"],["Lineage",92.4,"84 undocumented paths"]].map(([label,value,detail]) => <div key={String(label)} className="rounded-xl border border-white/[.07] bg-white/[.025] p-4"><div className="flex justify-between"><span className="text-[10px] text-slate-400">{label}</span><b className="text-sm text-white">{value}%</b></div><div className="mt-3 h-1.5 overflow-hidden rounded bg-white/[.06]"><div className="h-full rounded bg-cyan-300" style={{ width: `${value}%` }} /></div><p className="mt-2 text-[9px] text-slate-600">{detail}</p></div>)}</div></AirportPanel>;
}

function CapacityBar({ label, value }: { label: string; value: number }) {
  return <div><div className="mb-1 flex justify-between text-[10px]"><span className="text-slate-400">{label}</span><b className="text-white">{value}%</b></div><div className="h-2 overflow-hidden rounded-full bg-white/[.06]"><motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className={`h-full rounded-full ${value > 85 ? "bg-amber-400" : "bg-cyan-400"}`} /></div></div>;
}

function BrainCircuitIcon() { return <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-400/10 text-violet-300"><Sparkles size={16} /></span>; }
