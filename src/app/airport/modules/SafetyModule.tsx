import React, { useMemo, useState } from "react";
import {
  Activity, AlarmSmoke, Camera, CheckCircle2, DoorOpen, Flame, MapPinned,
  Radar, ShieldAlert, ShieldCheck, Siren, Truck, UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { getFlightTrend, type PageSize } from "../data/airportMockData";
import {
  AirportColumn, AirportDataTable, AirportDetailDrawer, AirportMetricCard,
  AirportPanel, AirportStatusBadge, AirportTimeline, AirportTrendChart,
} from "../shared/AirportUI";
import { useAirportLanguage } from "../i18n/AirportLanguage";
import type { AirportStatus } from "../config/airportRegistry";

type SafetyRecord = {
  id: string;
  asset: string;
  type: string;
  location: string;
  state: string;
  metric: string;
  lastUpdate: string;
  severity: string;
  owner: string;
};

type Metric = [string, string, string, "cyan" | "blue" | "emerald" | "amber" | "red" | "violet"];

type SectionConfig = {
  title: string;
  subtitle: string;
  metrics: Metric[];
  records: SafetyRecord[];
  events: Array<[string, string, string, string, string]>;
};

const safetyConfigs: Record<string, SectionConfig> = {
  "security-overview": {
    title: "Integrated airport safety and security posture",
    subtitle: "Unified CCTV, access, perimeter, fire and airside risk picture",
    metrics: [
      ["Security posture", "Elevated", "P-07 active", "red"],
      ["Critical incidents", "1", "Response in progress", "red"],
      ["Cameras online", "99.1%", "12 degraded", "cyan"],
      ["Access points", "99.3%", "6 offline", "blue"],
      ["Fire readiness", "98.7%", "8,424 devices", "emerald"],
      ["Airside risk", "Low", "0.08 risk index", "emerald"],
    ],
    records: makeRecords("SEC", ["Perimeter P-07", "Terminal security B", "Apron north", "Cargo gate 04", "Data center zone", "Runway service road"], ["Incident", "Queue", "Safety", "Access", "Critical facility", "Vehicle route"]),
    events: [["16:08", "Perimeter", "Radar-camera correlation confirmed", "P-07", "Critical"], ["16:05", "Access", "Restricted-zone access denied", "Gate A-17", "Warning"], ["16:02", "Fire", "Detector self-test completed", "Terminal T1", "Normal"], ["15:58", "Airside", "Vehicle route deviation resolved", "Apron East", "Normal"]],
  },
  "cctv-vms": {
    title: "CCTV / VMS coverage and video analytics",
    subtitle: "Camera health, analytics workloads and prioritized visual events",
    metrics: [["Cameras online", "1,272 / 1,284", "99.1%", "cyan"], ["Analytics channels", "486", "42 rules active", "violet"], ["Degraded cameras", "12", "6 maintenance due", "amber"], ["Unattended baggage", "2", "1 verified", "red"], ["Crowd alerts", "4", "3 resolved", "amber"], ["Storage retention", "30 days", "82% utilized", "blue"]],
    records: makeRecords("CAM", ["T1 Check-in CAM-041", "Security B CAM-118", "Gate G22 CAM-204", "Baggage Hall CAM-318", "Apron East CAM-616", "Perimeter P-07 CAM-904", "Cargo Dock CAM-1002", "Parking P2 CAM-1128"], ["Fixed dome", "PTZ", "Fixed bullet", "Thermal", "Multi-sensor"]),
    events: [["16:09", "Video analytics", "Unattended baggage candidate", "T1 Retail 03", "Warning"], ["16:04", "Crowd", "Density threshold exceeded", "Security B", "Warning"], ["15:59", "Camera health", "Video restored after network failover", "CAM-616", "Normal"], ["15:52", "Airside", "PPE compliance verified", "Apron East", "Normal"]],
  },
  "access-control": {
    title: "Airport access control operating picture",
    subtitle: "Doors, readers, credentials, anti-passback and restricted-area access",
    metrics: [["Access points online", "846 / 852", "99.3%", "cyan"], ["Active credentials", "12,486", "98 expiring", "blue"], ["People airside", "2,814", "Within capacity", "emerald"], ["Denied access today", "184", "12 high priority", "amber"], ["Forced doors", "1", "Investigating", "red"], ["Held-open doors", "3", "Response assigned", "amber"]],
    records: makeRecords("ACS", ["Door A-17", "Turnstile T1-04", "Cargo Gate C-08", "Airside Door E-22", "ATC Lift Reader", "Data Center Mantrap", "Staff Gate S-03", "Vehicle Barrier V-02"], ["Door", "Turnstile", "Barrier", "Elevator reader", "Mantrap"]),
    events: [["16:11", "Access denied", "Credential outside assigned zone", "Door A-17", "Warning"], ["16:06", "Door held open", "Open duration exceeded 45 sec", "Cargo Gate C-08", "Warning"], ["16:01", "Access granted", "Airside staff credential", "Staff Gate S-03", "Normal"], ["15:56", "Controller", "Failover controller synchronized", "CTRL-22", "Normal"]],
  },
  "perimeter-security": {
    title: "Perimeter security and intrusion detection",
    subtitle: "Fence segments, radar tracks, thermal analytics and response coordination",
    metrics: [["Perimeter coverage", "99.8%", "24.6 km", "cyan"], ["Radar tracks", "18", "4 classified", "blue"], ["Active intrusion", "1", "P-07", "red"], ["Fence sensors", "1,426", "99.5% online", "emerald"], ["Response ETA", "2:48", "Alpha 2", "amber"], ["False alarm rate", "0.7%", "30 days", "emerald"]],
    records: makeRecords("PER", ["Segment P-01", "Segment P-03", "Segment P-07", "Segment P-12", "North radar R-02", "East thermal T-04", "Drainage sensor D-08", "Service gate V-06"], ["Fence", "Radar", "Thermal", "Buried cable", "Gate"]),
    events: [["16:12", "Intrusion", "Person-sized track confirmed", "P-07", "Critical"], ["16:10", "Response", "Alpha 2 arrived at approach point", "P-07", "Warning"], ["16:07", "Correlation", "Thermal and radar tracks merged", "P-07", "Warning"], ["15:48", "Fence", "Maintenance bypass cleared", "P-03", "Normal"]],
  },
  "restricted-zones": {
    title: "Restricted zones and access governance",
    subtitle: "Airside, sterile, critical infrastructure and customs-zone authorization",
    metrics: [["Restricted zones", "64", "12 critical", "cyan"], ["Active occupants", "3,286", "Verified", "blue"], ["Zone violations", "3", "2 resolved", "amber"], ["Temporary permits", "184", "16 expire today", "violet"], ["Anti-passback", "99.8%", "7 exceptions", "emerald"], ["Escort compliance", "97.4%", "4 open cases", "amber"]],
    records: makeRecords("ZON", ["Airside A-01", "Sterile S-04", "Baggage B-09", "ATC Critical C-01", "Data Center DC-02", "Customs CZ-03", "Fuel Farm FF-01", "Runway Access RA-02"], ["Airside", "Sterile", "Critical", "Customs", "Infrastructure"]),
    events: [["16:14", "Zone violation", "Contractor entered unassigned sub-zone", "Airside A-01", "Warning"], ["16:09", "Permit", "Temporary permit approved", "Fuel Farm FF-01", "Normal"], ["16:03", "Anti-passback", "Sequence corrected by operator", "Sterile S-04", "Normal"], ["15:58", "Escort", "Escort SLA warning", "Customs CZ-03", "Warning"]],
  },
  "fire-life-safety": {
    title: "Fire and life-safety readiness",
    subtitle: "Fire panels, detectors, suppression, voice evacuation and egress readiness",
    metrics: [["Fire panels online", "24 / 24", "100%", "emerald"], ["Devices online", "8,424", "99.99%", "cyan"], ["Active fire alarms", "0", "Normal", "emerald"], ["Supervisory events", "3", "Assigned", "amber"], ["Disabled points", "7", "Maintenance permits", "amber"], ["Evacuation readiness", "98.7%", "2 zones due test", "blue"]],
    records: makeRecords("FLS", ["Fire Panel FP-01", "Smoke Zone T1-L2", "Sprinkler Valve SV-08", "Fire Pump P-02", "Voice Evac VA-04", "Exit Door EX-22", "Foam System FS-01", "Muster Point MP-03"], ["Panel", "Detection zone", "Suppression", "Pump", "Voice evacuation", "Egress"]),
    events: [["16:06", "Supervisory", "Sprinkler valve maintenance permit", "SV-08", "Warning"], ["16:02", "Self-test", "Voice evacuation circuit passed", "VA-04", "Normal"], ["15:57", "Fire pump", "Weekly churn test completed", "P-02", "Normal"], ["15:49", "Detector", "Contamination warning acknowledged", "T1-L2", "Warning"]],
  },
  "airside-safety": {
    title: "Airside safety and movement-area risk",
    subtitle: "Vehicle routes, worker safety, FOD, stand safety and incursion prevention",
    metrics: [["Airside risk index", "0.08", "Low", "emerald"], ["Vehicles active", "184", "98% compliant", "cyan"], ["Route deviations", "2", "Both resolved", "amber"], ["FOD observations", "3", "Teams dispatched", "amber"], ["PPE compliance", "96.8%", "+1.2 pt", "blue"], ["Incursion risk", "Low", "No active conflict", "emerald"]],
    records: makeRecords("AIR", ["Apron East Zone", "Taxiway Alpha", "Stand S32", "Runway Service Road", "Fuel Route F-02", "Pushback Lane P-04", "FOD Sector 7", "Remote Stand R08"], ["Stand", "Taxiway", "Vehicle route", "FOD zone", "Pushback lane"]),
    events: [["16:13", "Vehicle", "Route deviation auto-resolved", "Fuel Route F-02", "Warning"], ["16:08", "FOD", "Inspection team dispatched", "Sector 7", "Warning"], ["16:03", "Stand safety", "Pushback clearance verified", "S32", "Normal"], ["15:54", "PPE", "Compliance event closed", "Apron East", "Normal"]],
  },
  "emergency-command": {
    title: "Airport emergency command",
    subtitle: "Incident command, SOP execution, communication and immutable audit trail",
    metrics: [["Active emergencies", "1", "INC-2407", "red"], ["Response teams", "6 / 6", "Available", "emerald"], ["Mean acknowledge", "38 sec", "Target <60", "cyan"], ["Command channels", "8", "All online", "blue"], ["SOP compliance", "97.8%", "30 days", "emerald"], ["Open actions", "7", "2 priority", "amber"]],
    records: makeRecords("CMD", ["INC-2407 Perimeter", "MED-118 Medical", "FIRE-041 Drill", "OPS-208 Runway", "IT-094 Data Center", "BAG-318 Baggage", "WX-071 Weather", "SEC-221 Access"], ["Security", "Medical", "Fire", "Operations", "IT", "Baggage"]),
    events: [["16:12", "Detection", "Radar-camera correlation confirmed", "P-07", "Critical"], ["16:12", "Command", "Incident commander assigned", "INC-2407", "Warning"], ["16:13", "Response", "Alpha 2 entered containment zone", "P-07", "Warning"], ["16:14", "Communication", "ATC and Airport Ops synchronized", "Complete", "Normal"]],
  },
  "incident-management": {
    title: "Safety incident management",
    subtitle: "Ownership, evidence, SLA, root cause and closure workflow",
    metrics: [["Open incidents", "18", "1 critical", "red"], ["In progress", "7", "4 high", "amber"], ["Mean acknowledge", "38 sec", "Target <60", "cyan"], ["Mean resolve", "18.4 min", "-2.1 min", "blue"], ["SLA compliance", "96.8%", "+0.7 pt", "emerald"], ["Closed today", "42", "100% audited", "emerald"]],
    records: makeRecords("INC", ["Perimeter intrusion P-07", "Door forced A-17", "Crowd density Security B", "FOD Sector 7", "Camera degraded CAM-616", "Sprinkler supervisory SV-08", "Vehicle route F-02", "Credential violation CZ-03"], ["Security", "Access", "Crowd", "Airside", "CCTV", "Fire"]),
    events: [["16:14", "Assignment", "Security supervisor accepted ownership", "INC-2407", "Warning"], ["16:11", "Evidence", "Camera clip attached", "INC-2398", "Normal"], ["16:07", "Resolution", "Vehicle route case closed", "INC-2384", "Normal"], ["16:01", "SLA", "Escalation issued to duty manager", "INC-2379", "Warning"]],
  },
};

function makeRecords(prefix: string, assets: string[], types: string[]): SafetyRecord[] {
  return Array.from({ length: 18 }, (_, index) => {
    const asset = assets[index % assets.length];
    const severity = index === 0 ? "Critical" : index % 6 === 0 ? "High" : index % 4 === 0 ? "Warning" : "Normal";
    return {
      id: `${prefix}-${String(index + 1).padStart(3, "0")}`,
      asset,
      type: types[index % types.length],
      location: ["Terminal T1", "Airside East", "Cargo", "ATC", "Landside", "Utility Zone"][index % 6],
      state: index === 0 ? "Active" : index % 5 === 0 ? "Investigating" : index % 3 === 0 ? "Acknowledged" : "Normal",
      metric: index % 2 === 0 ? `${94 + (index % 6)}.${index % 10}%` : `${index + 2} events`,
      lastUpdate: `${(index % 9) + 1} min ago`,
      severity,
      owner: ["Airport Security", "Safety Operations", "Fire Team", "Airside Control", "IT Security"][index % 5],
    };
  });
}

export function SafetyModuleContent({ sectionId }: { sectionId: string }) {
  const { tr } = useAirportLanguage();
  const config = safetyConfigs[sectionId] ?? safetyConfigs["security-overview"];
  const [selected, setSelected] = useState<SafetyRecord | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const chart = useMemo(() => getFlightTrend(`safety-${sectionId}`), [sectionId]);
  const columns: AirportColumn<SafetyRecord>[] = [
    { key: "id", label: "ID", width: "90px", render: (row) => <span className="font-mono text-cyan-300">{row.id}</span> },
    { key: "asset", label: "Asset / Zone", width: "190px", render: (row) => <span className="font-semibold text-white">{row.asset}</span> },
    { key: "type", label: "Type" },
    { key: "location", label: "Location" },
    { key: "state", label: "State", render: (row) => <AirportStatusBadge status={toStatus(row.severity)} label={row.state} /> },
    { key: "metric", label: "Operational metric" },
    { key: "lastUpdate", label: "Last update" },
    { key: "owner", label: "Owner" },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-2 xl:grid-cols-6">
        {config.metrics.map(([label, value, trend, tone]) => <AirportMetricCard key={label} label={label} value={value} trend={trend} compact tone={tone} />)}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <AirportPanel title={config.title} subtitle={config.subtitle}>
          <SectionVisual sectionId={sectionId} records={config.records} />
        </AirportPanel>
        <AirportPanel title="Live safety event timeline" subtitle="Click an event to open its operational context">
          <div className="p-3"><AirportTimeline events={config.events} /></div>
        </AirportPanel>
      </div>

      <AirportPanel title="Operational records" subtitle={`${config.records.length} active and monitored safety entities`}>
        <div className="p-3">
          <AirportDataTable
            rows={config.records.slice((page - 1) * pageSize, page * pageSize)}
            columns={columns}
            total={config.records.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            onRowClick={setSelected}
            selectedId={selected?.id}
          />
        </div>
      </AirportPanel>

      <AirportDetailDrawer open={!!selected} title={selected?.asset ?? "Safety detail"} subtitle={selected ? `${selected.id} · ${selected.type}` : undefined} onClose={() => setSelected(null)}>
        {selected && <SafetyDetail record={selected} />}
      </AirportDetailDrawer>
    </>
  );
}

function SectionVisual({ sectionId, records }: { sectionId: string; records: SafetyRecord[] }) {
  const { tr } = useAirportLanguage();
  const chart = useMemo(() => getFlightTrend(`safety-visual-${sectionId}`), [sectionId]);

  if (sectionId === "cctv-vms") {
    return <div className="grid grid-cols-2 gap-2 p-3 xl:grid-cols-4">{records.slice(0, 8).map((record, index) => <button key={record.id} onClick={() => toast.info(`${record.asset} · ${record.state}`)} className="relative aspect-video overflow-hidden rounded-lg border border-white/[.07] bg-[radial-gradient(circle_at_65%_28%,rgba(34,211,238,.16),transparent_32%),linear-gradient(145deg,#10243a,#06111f)] p-3 text-left"><Camera className="absolute right-3 top-3 text-cyan-300/60" size={18} /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3"><p className="text-[9px] font-semibold text-white">{record.asset}</p><p className="mt-0.5 text-[8px] text-slate-500">{record.location} · {index % 3 === 0 ? tr("Video analytics active") : tr("Live stream nominal")}</p></div></button>)}</div>;
  }

  if (sectionId === "access-control") {
    return <div className="grid grid-cols-2 gap-2 p-3 xl:grid-cols-4">{records.slice(0, 8).map((record, index) => <button key={record.id} onClick={() => toast.info(record.asset)} className="rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-left"><div className="flex items-center justify-between"><DoorOpen size={18} className={index === 0 ? "text-red-300" : "text-cyan-300"} /><AirportStatusBadge status={index === 0 ? "critical" : index % 4 === 0 ? "warning" : "normal"} label={record.state} /></div><p className="mt-3 text-[10px] font-semibold text-white">{record.asset}</p><p className="mt-1 text-[9px] text-slate-500">{record.location} · {record.metric}</p></button>)}</div>;
  }

  if (sectionId === "perimeter-security") {
    return <div className="space-y-2 p-4">{records.slice(0, 8).map((record, index) => <button key={record.id} onClick={() => toast.info(record.asset)} className="w-full rounded-lg border border-white/[.06] bg-white/[.025] p-3 text-left"><div className="flex items-center gap-3"><Radar size={16} className={index === 2 ? "text-red-300" : "text-cyan-300"} /><div className="flex-1"><div className="flex justify-between"><span className="text-[10px] font-semibold text-white">{record.asset}</span><span className="text-[9px] text-slate-500">{record.metric}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded bg-white/[.06]"><div className={`h-full rounded ${index === 2 ? "bg-red-400" : "bg-cyan-400"}`} style={{ width: `${92 + (index % 7)}%` }} /></div></div><AirportStatusBadge status={index === 2 ? "critical" : "normal"} label={record.state} /></div></button>)}</div>;
  }

  if (sectionId === "restricted-zones") {
    return <div className="grid grid-cols-2 gap-2 p-3 xl:grid-cols-4">{records.slice(0, 8).map((record, index) => <button key={record.id} onClick={() => toast.info(record.asset)} className={`rounded-xl border p-3 text-left ${index === 0 ? "border-amber-400/25 bg-amber-400/[.06]" : "border-white/[.07] bg-white/[.025]"}`}><MapPinned size={16} className="text-cyan-300" /><p className="mt-3 text-[10px] font-semibold text-white">{record.asset}</p><p className="mt-1 text-[9px] text-slate-500">{record.type} · {record.location}</p><div className="mt-3 flex justify-between text-[9px]"><span className="text-slate-500">{tr("Occupants")}</span><b className="text-white">{18 + index * 7}</b></div></button>)}</div>;
  }

  if (sectionId === "fire-life-safety") {
    return <div className="grid gap-3 p-4 xl:grid-cols-[.8fr_1.2fr]"><div className="grid grid-cols-2 gap-2">{records.slice(0, 6).map((record, index) => <button key={record.id} onClick={() => toast.info(record.asset)} className="rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-left"><Flame size={17} className={index === 2 ? "text-amber-300" : "text-emerald-300"} /><p className="mt-2 text-[10px] font-semibold text-white">{record.asset}</p><p className="mt-1 text-[9px] text-slate-500">{record.state}</p></button>)}</div><div><AirportTrendChart data={chart} height={230} color="#34d399" /></div></div>;
  }

  if (sectionId === "airside-safety") {
    return <div className="grid gap-3 p-4 xl:grid-cols-[1fr_.8fr]"><div className="grid grid-cols-2 gap-2">{records.slice(0, 8).map((record, index) => <button key={record.id} onClick={() => toast.info(record.asset)} className="rounded-lg border border-white/[.06] bg-white/[.025] p-3 text-left"><div className="flex justify-between"><Truck size={16} className="text-cyan-300" /><AirportStatusBadge status={index === 1 ? "warning" : "normal"} /></div><p className="mt-2 text-[10px] font-semibold text-white">{record.asset}</p><p className="mt-1 text-[9px] text-slate-500">{record.metric}</p></button>)}</div><AirportTrendChart data={chart} height={250} color="#60a5fa" /></div>;
  }

  if (sectionId === "emergency-command") {
    return <div className="grid gap-4 p-4 xl:grid-cols-[1fr_.75fr]"><AirportTimeline events={safetyConfigs[sectionId].events} /><div className="space-y-2">{[["Incident commander","Nguyen Minh · Airport Security"],["Response team","Alpha 2 · 4 officers"],["SOP","SEC-PERIM-04"],["Communication","ATC · Security · Airport Ops"],["Command status","Containment active"]].map(([label,value]) => <div key={label} className="flex justify-between rounded-lg bg-white/[.03] p-3 text-[10px]"><span className="text-slate-500">{tr(label)}</span><b className="text-right text-white">{tr(value)}</b></div>)}<button onClick={() => toast.success(tr("Command update recorded in the audit trail"))} className="airport-button w-full justify-center"><Siren size={14} />{tr("Record command update")}</button></div></div>;
  }

  if (sectionId === "incident-management") {
    return <div className="grid grid-cols-2 gap-3 p-4 xl:grid-cols-4">{[["New",4,"red"],["Acknowledged",5,"amber"],["In progress",7,"blue"],["Closed today",42,"emerald"]].map(([label,count,tone]) => <button key={String(label)} onClick={() => toast.info(`${label}: ${count}`)} className="rounded-xl border border-white/[.07] bg-white/[.025] p-4 text-left"><Activity size={17} className={tone === "red" ? "text-red-300" : tone === "amber" ? "text-amber-300" : tone === "emerald" ? "text-emerald-300" : "text-blue-300"} /><p className="mt-3 text-[10px] text-slate-500">{tr(String(label))}</p><p className="text-2xl font-semibold text-white">{count}</p></button>)}</div>;
  }

  return <div className="grid gap-3 p-4 xl:grid-cols-[1.1fr_.9fr]"><AirportTrendChart data={chart} height={260} color="#22d3ee" /><div className="grid grid-cols-2 gap-2">{records.slice(0, 6).map((record, index) => <button key={record.id} onClick={() => toast.info(record.asset)} className="rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-left"><div className="flex justify-between"><ShieldCheck size={17} className={index === 0 ? "text-red-300" : "text-cyan-300"} /><AirportStatusBadge status={index === 0 ? "critical" : "normal"} /></div><p className="mt-3 text-[10px] font-semibold text-white">{record.asset}</p><p className="mt-1 text-[9px] text-slate-500">{record.type} · {record.metric}</p></button>)}</div></div>;
}

function SafetyDetail({ record }: { record: SafetyRecord }) {
  const { tr } = useAirportLanguage();
  return <div className="space-y-4"><div className="flex items-center justify-between"><AirportStatusBadge status={toStatus(record.severity)} label={record.state} /><span className="font-mono text-[10px] text-cyan-300">{record.id}</span></div><div className="grid grid-cols-2 gap-2">{[["Type",record.type],["Location",record.location],["Operational metric",record.metric],["Last update",record.lastUpdate],["Severity",record.severity],["Owner",record.owner]].map(([label,value]) => <div key={label} className="rounded-lg border border-white/[.07] bg-white/[.025] p-3"><p className="text-[9px] text-slate-500">{tr(label)}</p><p className="mt-1 text-[11px] font-semibold text-white">{tr(value)}</p></div>)}</div><AirportPanel title="Response workflow"><div className="space-y-2 p-3">{[[CheckCircle2,"Acknowledge and validate"],[UserCheck,"Assign responsible team"],[ShieldAlert,"Apply airport safety SOP"],[Activity,"Verify and close"]].map(([Icon,label],index) => <button key={label as string} onClick={() => toast.success(tr(label as string))} className="flex w-full items-center gap-3 rounded-lg border border-white/[.06] bg-white/[.025] p-3 text-left"><Icon size={16} className={index < 2 ? "text-emerald-300" : "text-cyan-300"} /><span className="text-[10px] text-slate-300">{tr(label as string)}</span></button>)}</div></AirportPanel><button onClick={() => toast.success(tr("Operational action saved to the demo audit trail"))} className="airport-button w-full justify-center">{tr("Save operational update")}</button></div>;
}

function toStatus(severity: string): AirportStatus {
  if (severity === "Critical") return "critical";
  if (severity === "High" || severity === "Warning") return "warning";
  return "normal";
}
