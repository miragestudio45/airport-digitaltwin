import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, BarChart3, Box, ChevronLeft, ChevronRight, Gauge, Layers3,
  LocateFixed, MapPinned, Maximize2, Minimize2, Plane, Route, ShieldAlert,
  SlidersHorizontal, Wind, X,
} from "lucide-react";
import { toast } from "sonner";
import overviewImage from "@/assets/airport/Overview.webp";
import type { AirportModuleId, AirportStatus, SpatialNode } from "../config/airportRegistry";
import {
  AIRPORT_HOTSPOTS, AIRPORT_LAYERS, AIRPORT_SPATIAL_HIERARCHY,
  type AirportHotspotDefinition,
} from "../config/airportRegistry";
import { AIRPORT_OVERVIEW_KPIS, INCIDENTS, OPERATION_EVENTS, getFlightTrend } from "../data/airportMockData";
import { AirportPanel, AirportStatusBadge, AirportTimeline, AirportTrendChart } from "../shared/AirportUI";
import { useAirportLanguage } from "../i18n/AirportLanguage";
import { AirportOverview3D } from "./AirportOverview3D";

type InfoMode = "none" | "summary" | "insights" | "hierarchy" | "readiness";

type SpatialSelection = {
  parent: SpatialNode;
  node: SpatialNode;
};

const SECTION_INFO_MODE: Record<string, InfoMode> = {
  "command-center": "summary",
  "spatial-hierarchy": "hierarchy",
  "operational-readiness": "readiness",
};

const SPATIAL_MODULE_MAP: Record<string, AirportModuleId> = {
  airside: "AIRPORT_OPS",
  runways: "AIRPORT_OPS",
  taxiways: "AIRPORT_OPS",
  aprons: "AIRPORT_OPS",
  stands: "AIRPORT_OPS",
  hangars: "ASSETS_FM",
  "airfield-utilities": "SYSTEMS",
  terminal: "PASSENGERS",
  departures: "PASSENGERS",
  arrivals: "PASSENGERS",
  "check-in": "PASSENGERS",
  security: "SAFETY",
  immigration: "SAFETY",
  boarding: "PASSENGERS",
  "baggage-claim": "AIRPORT_OPS",
  retail: "PASSENGERS",
  landside: "PASSENGERS",
  roads: "PASSENGERS",
  parking: "PASSENGERS",
  "transport-hub": "PASSENGERS",
  "public-areas": "PASSENGERS",
  cargo: "AIRPORT_OPS",
  atc: "SYSTEMS",
  "utility-plant": "SYSTEMS",
  "data-center": "SYSTEMS",
  support: "ASSETS_FM",
};

const HOTSPOT_ALIASES: Record<string, string> = {
  runways: "runway-01",
  taxiways: "taxiway",
  aprons: "apron",
  stands: "stands",
  hangars: "hangar",
  "airfield-utilities": "utility",
  terminal: "terminal",
  departures: "terminal",
  arrivals: "terminal",
  "check-in": "terminal",
  security: "terminal",
  immigration: "terminal",
  boarding: "terminal",
  "baggage-claim": "terminal",
  retail: "terminal",
  landside: "parking",
  roads: "parking",
  parking: "parking",
  "transport-hub": "parking",
  "public-areas": "parking",
  cargo: "cargo",
  atc: "atc",
  "utility-plant": "utility",
  "data-center": "datacenter",
  support: "hangar",
};

const READINESS_DOMAINS: Array<[string, string, string, AirportStatus]> = [
  ["Aviation operations", "96.8%", "2 constraints · no service interruption", "normal"],
  ["Passenger processing", "94.2%", "Security zone B forecast above target", "warning"],
  ["Facility & OT", "97.8%", "4 alerts · critical services available", "normal"],
  ["IT & digital services", "99.4%", "3 degraded integrations · failover ready", "normal"],
  ["Safety & security", "92.6%", "Perimeter incident P-07 under response", "critical"],
  ["Ground resources", "95.1%", "3 equipment allocation conflicts", "warning"],
];

const READINESS_CHECKS: Array<[string, string, AirportStatus]> = [
  ["Runway and taxiway inspection", "Completed 09:31", "normal"],
  ["Emergency response teams", "6/6 teams available", "normal"],
  ["Peak passenger wave staffing", "92% assigned", "warning"],
  ["Baggage contingency route", "Validated and ready", "normal"],
  ["Data center failover", "Last test 2 days ago", "normal"],
  ["Perimeter incident containment", "Response in progress", "critical"],
];

function stableMetric(id: string, min: number, max: number) {
  const hash = [...id].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 17);
  return min + (hash % Math.max(1, max - min + 1));
}

export function AirportOverview({ viewMode, onViewModeChange, onOpenModule, activeSection, sectionRequest }: {
  viewMode: "2d" | "3d";
  onViewModeChange: (mode: "2d" | "3d") => void;
  onOpenModule: (module: AirportModuleId) => void;
  activeSection: string;
  sectionRequest: number;
}) {
  const { language, tr } = useAirportLanguage();
  const [selected, setSelected] = useState<AirportHotspotDefinition | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const [infoMode, setInfoMode] = useState<InfoMode>("none");
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [spatialSelection, setSpatialSelection] = useState<SpatialSelection | null>(null);
  const [activeLayers, setActiveLayers] = useState(() => new Set(["Aviation", "Facilities", "Security", "Incidents", "Weather"]));
  const flightTrend = useMemo(() => getFlightTrend("24 Hours"), []);
  const headlineKpis = [0, 3, 4, 8, 9].map((index) => AIRPORT_OVERVIEW_KPIS[index]);
  const overlayWidthClass = "w-[clamp(116px,9vw,150px)] max-w-[150px]";
  const overviewActionToolbarClass = viewMode === "3d"
    ? `absolute left-3 top-[182px] z-40 flex ${overlayWidthClass} flex-col gap-2`
    : `absolute left-3 top-[78px] z-40 flex ${overlayWidthClass} flex-col gap-2`;
  const layersPanelClass = viewMode === "3d"
    ? `absolute left-3 top-[338px] z-40 ${overlayWidthClass} rounded-xl border border-white/10 bg-[#06111f]/91 p-3 shadow-2xl backdrop-blur-xl`
    : `absolute left-3 top-[234px] z-40 ${overlayWidthClass} rounded-xl border border-white/10 bg-[#06111f]/91 p-3 shadow-2xl backdrop-blur-xl`;

  useEffect(() => {
    if (sectionRequest <= 0) return;
    const nextMode = SECTION_INFO_MODE[activeSection];
    if (nextMode) {
      setSelected(null);
      setInfoExpanded(false);
      setInfoMode(nextMode);
    }
  }, [activeSection, sectionRequest]);

  const visibleHotspots = useMemo(() => AIRPORT_HOTSPOTS.filter((hotspot) => {
    if (hotspot.module === "AIRPORT_OPS") return activeLayers.has("Aviation");
    if (hotspot.module === "SAFETY") return activeLayers.has("Security") || activeLayers.has("Incidents");
    if (hotspot.module === "PASSENGERS") return activeLayers.has("Passenger flow") || activeLayers.has("Facilities");
    return activeLayers.has("Facilities") || activeLayers.has("Utilities");
  }), [activeLayers]);

  const openInfo = (mode: Exclude<InfoMode, "none">) => {
    setSelected(null);
    setInfoMode((current) => current === mode ? "none" : mode);
    setInfoExpanded(false);
  };

  const locateSpatialNode = (selection: SpatialSelection) => {
    const hotspotId = HOTSPOT_ALIASES[selection.node.id] ?? HOTSPOT_ALIASES[selection.parent.id];
    const hotspot = AIRPORT_HOTSPOTS.find((item) => item.id === hotspotId);
    if (hotspot) {
      setSelected(hotspot);
      setInfoMode("none");
      setInfoExpanded(false);
      toast.success(`${tr("Spatial context")}: ${tr(selection.parent.label)} / ${tr(selection.node.label)}`);
    }
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-[#04111f]">
      {viewMode === "3d" ? (
        <AirportOverview3D onBack2D={() => onViewModeChange("2d")} />
      ) : (
        <>
          <img src={overviewImage} alt="Gia Binh Smart Airport overview" className="absolute inset-0 h-full w-full select-none object-cover object-center" draggable={false} />
          <div className="pointer-events-none absolute inset-0 bg-[#03101d]/5" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_52%,rgba(1,8,18,.58)_100%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.13]" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.15) 1px,transparent 1px)", backgroundSize: "42px 42px" }} />
        </>
      )}

      <div className={overviewActionToolbarClass}>
        <button onClick={() => setLayersOpen((open) => !open)} className={`airport-button w-full justify-start bg-[#06111f]/84 px-3 text-[10px] backdrop-blur-xl ${layersOpen ? "!border-cyan-400/30 !bg-cyan-400/10 !text-cyan-200" : ""}`}>
          <Layers3 size={14} />{layersOpen ? tr("Hide data layers") : tr("Show data layers")}
        </button>
        <button onClick={() => openInfo("summary")} className={`airport-button w-full justify-start bg-[#06111f]/84 px-3 text-[10px] backdrop-blur-xl ${infoMode === "summary" ? "!border-cyan-400/30 !bg-cyan-400/10 !text-cyan-200" : ""}`}>
          <Gauge size={14} />{tr("Operational overview")}
        </button>
        <button onClick={() => openInfo("insights")} className={`airport-button w-full justify-start bg-[#06111f]/84 px-3 text-[10px] backdrop-blur-xl ${infoMode === "insights" ? "!border-violet-400/30 !bg-violet-400/10 !text-violet-200" : ""}`}>
          <BarChart3 size={14} />{tr("Operational insights")}
        </button>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 hidden -translate-x-1/2 items-stretch gap-1.5 2xl:flex">
        {headlineKpis.map(([label, value, trend], index) => (
          <div key={label} className={`min-w-[142px] rounded-xl border bg-[#06111f]/78 px-3 py-2 shadow-xl backdrop-blur-xl ${index === 3 ? "border-red-400/25" : "border-cyan-400/15"}`}>
            <p className="text-[8px] font-semibold uppercase tracking-[.12em] text-slate-500">{tr(label)}</p>
            <div className="mt-1 flex items-end justify-between gap-2"><strong className="text-base text-white">{value}</strong><span className={`text-[8px] ${index === 3 ? "text-red-300" : "text-cyan-200"}`}>{tr(trend)}</span></div>
          </div>
        ))}
      </div>

      <div className="absolute right-3 top-3 z-35 flex gap-2">
        <span className="rounded-lg border border-white/10 bg-[#06111f]/76 px-3 py-2 text-[9px] text-slate-300 backdrop-blur-lg"><Wind size={13} className="mr-1 inline text-blue-300" />NE 12 kt · {tr("Visibility 10 km")}</span>
        <button onClick={() => toast.success(language === "vi" ? "Đã căn giữa bản đồ sân bay" : "Spatial view centered on airport reference point")} className="airport-button bg-[#06111f]/76"><LocateFixed size={14} />{tr("Recenter")}</button>
      </div>

      <AnimatePresence>
        {layersOpen && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={layersPanelClass}>
            <div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-semibold text-white"><Layers3 size={14} className="text-cyan-300" />{tr("Data layers")}</div><span className="text-[9px] text-slate-500">{activeLayers.size} {tr("active")}</span></div>
            <div className="grid grid-cols-2 gap-1">{AIRPORT_LAYERS.map((layer) => <button key={layer} onClick={() => setActiveLayers((current) => { const next = new Set(current); next.has(layer) ? next.delete(layer) : next.add(layer); return next; })} className={`rounded-md border px-2 py-1.5 text-left text-[9px] transition ${activeLayers.has(layer) ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-200" : "border-transparent bg-white/[.025] text-slate-500 hover:text-slate-300"}`}>{tr(layer)}</button>)}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === "2d" && visibleHotspots.map((hotspot) => {
        const selectedHotspot = selected?.id === hotspot.id;
        const statusColor = hotspot.status === "critical" ? "#f87171" : hotspot.status === "warning" ? "#fbbf24" : hotspot.status === "optimized" ? "#34d399" : "#67e8f9";
        return (
          <motion.button
            key={hotspot.id}
            onMouseEnter={() => setHovered(hotspot.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => { setSelected(hotspot); setInfoMode("none"); setInfoExpanded(false); toast.info(`${tr("Spatial context")}: ${tr(hotspot.label)}`); }}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
          >
            <span className="absolute inset-[-9px] rounded-full border opacity-50" style={{ borderColor: statusColor, animation: "airport-pulse-ring 2.4s ease-in-out infinite" }} />
            <span className={`relative grid h-8 w-8 place-items-center rounded-full border-2 bg-[#06111f]/88 shadow-[0_0_18px_currentColor] transition-transform ${selectedHotspot ? "scale-125" : "hover:scale-110"}`} style={{ color: statusColor, borderColor: statusColor }}>
              {hotspot.type.includes("Runway") || hotspot.type.includes("Apron") ? <Plane size={13} /> : hotspot.module === "SAFETY" ? <ShieldAlert size={13} /> : <Box size={13} />}
            </span>
            <AnimatePresence>{hovered === hotspot.id && <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="pointer-events-none absolute bottom-11 left-1/2 w-48 -translate-x-1/2 rounded-lg border border-white/10 bg-[#06111f]/94 p-2 text-left shadow-xl backdrop-blur-xl"><span className="block text-[10px] font-semibold text-white">{tr(hotspot.label)}</span><span className="mt-1 flex justify-between text-[9px] text-slate-400"><span>{tr(hotspot.kpis[0].label)}</span><b className="text-cyan-200">{hotspot.kpis[0].value}</b></span></motion.span>}</AnimatePresence>
          </motion.button>
        );
      })}

      <AnimatePresence>
        {selected && (
          <motion.aside initial={{ x: 350, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 350, opacity: 0 }} className="airport-scrollbar absolute bottom-20 right-3 top-14 z-50 w-80 overflow-y-auto rounded-xl border border-white/10 bg-[#06111f]/93 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-start justify-between border-b border-white/[.08] p-4"><div><p className="text-[9px] uppercase tracking-[.16em] text-cyan-300">{tr("Spatial context")} · {tr(selected.type)}</p><h3 className="mt-1 text-sm font-semibold text-white">{tr(selected.label)}</h3></div><button onClick={() => setSelected(null)} className="airport-icon-button !h-7 !w-7"><X size={14} /></button></div>
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between"><AirportStatusBadge status={selected.status} /><span className="text-[9px] uppercase text-slate-500">{tr("Severity")} {tr(selected.severity)}</span></div>
              <div className="grid grid-cols-2 gap-2">{selected.kpis.map((kpi) => <div key={kpi.label} className="rounded-lg border border-white/[.07] bg-white/[.035] p-3"><p className="text-[9px] text-slate-500">{tr(kpi.label)}</p><p className="mt-1 text-lg font-semibold text-white">{kpi.value}</p></div>)}</div>
              <div className="space-y-2 text-[10px] text-slate-400"><div className="flex justify-between"><span>{tr("Last data update")}</span><b className="text-emerald-300">{tr("6 seconds ago")}</b></div><div className="flex justify-between"><span>{tr("Linked systems")}</span><b className="text-white">7</b></div><div className="flex justify-between"><span>{tr("Mapped assets")}</span><b className="text-white">1,284</b></div><div className="flex justify-between"><span>{tr("Open work orders")}</span><b className="text-amber-300">4</b></div></div>
              <button onClick={() => onOpenModule(selected.module)} className="flex w-full items-center justify-between rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/15">{tr("Open related module")} <ChevronRight size={14} /></button>
              <button onClick={() => onViewModeChange("3d")} className="airport-button w-full justify-center">{tr("Focus in 3D shell")}</button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {infoMode !== "none" && !infoExpanded && (
          <motion.aside
            initial={{ x: 460, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 460, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 270 }}
            className="airport-scrollbar absolute bottom-20 right-3 top-14 z-[52] w-[420px] overflow-y-auto rounded-2xl border border-white/10 bg-[#06111f]/94 shadow-[-24px_0_80px_rgba(0,0,0,.42)] backdrop-blur-2xl"
          >
            <InfoPanelHeader mode={infoMode} expanded={false} onExpand={() => setInfoExpanded(true)} onClose={() => setInfoMode("none")} />
            <div className="p-4">
              <OverviewInfoContent
                mode={infoMode}
                expanded={false}
                flightTrend={flightTrend}
                spatialSelection={spatialSelection}
                onSpatialSelection={setSpatialSelection}
                onLocateSpatial={locateSpatialNode}
                onOpenModule={onOpenModule}
                onViewModeChange={onViewModeChange}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {infoMode !== "none" && infoExpanded && (
          <>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInfoExpanded(false)} className="absolute inset-0 z-[88] bg-black/55 backdrop-blur-sm" aria-label={tr("Close expanded panel")} />
            <motion.section initial={{ opacity: 0, scale: .96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96, y: 20 }} className="airport-scrollbar absolute inset-x-[6vw] bottom-24 top-12 z-[89] overflow-y-auto rounded-2xl border border-white/10 bg-[#06111f]/98 shadow-2xl backdrop-blur-2xl">
              <InfoPanelHeader mode={infoMode} expanded onExpand={() => setInfoExpanded(false)} onClose={() => { setInfoExpanded(false); setInfoMode("none"); }} />
              <div className="p-5">
                <OverviewInfoContent
                  mode={infoMode}
                  expanded
                  flightTrend={flightTrend}
                  spatialSelection={spatialSelection}
                  onSpatialSelection={setSpatialSelection}
                  onLocateSpatial={locateSpatialNode}
                  onOpenModule={onOpenModule}
                  onViewModeChange={onViewModeChange}
                />
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute bottom-4 left-4 z-20 rounded-lg border border-white/10 bg-[#06111f]/70 px-3 py-2 text-[8px] text-slate-500 backdrop-blur-lg">SMART AIRPORT DIGITAL TWIN · 2D / 3D SPATIAL COMMAND VIEW</div>
    </div>
  );
}

function InfoPanelHeader({ mode, expanded, onExpand, onClose }: {
  mode: Exclude<InfoMode, "none">;
  expanded: boolean;
  onExpand: () => void;
  onClose: () => void;
}) {
  const { tr } = useAirportLanguage();
  const title = mode === "summary" ? "Operational overview"
    : mode === "insights" ? "Operational insights"
      : mode === "hierarchy" ? "Airport spatial hierarchy"
        : "Operational readiness";
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[.08] bg-[#06111f]/96 px-4 py-3 backdrop-blur-2xl">
      <div><p className="text-[9px] uppercase tracking-[.18em] text-cyan-300">Smart Airport Digital Twin</p><h2 className="mt-1 text-sm font-semibold text-white">{tr(title)}</h2></div>
      <div className="flex gap-1"><button onClick={onExpand} className="airport-icon-button !h-8 !w-8" title={tr(expanded ? "Restore compact panel" : "Expand panel")}>{expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button><button onClick={onClose} className="airport-icon-button !h-8 !w-8"><X size={15} /></button></div>
    </div>
  );
}

function OverviewInfoContent({ mode, expanded, flightTrend, spatialSelection, onSpatialSelection, onLocateSpatial, onOpenModule, onViewModeChange }: {
  mode: Exclude<InfoMode, "none">;
  expanded: boolean;
  flightTrend: ReturnType<typeof getFlightTrend>;
  spatialSelection: SpatialSelection | null;
  onSpatialSelection: (selection: SpatialSelection | null) => void;
  onLocateSpatial: (selection: SpatialSelection) => void;
  onOpenModule: (module: AirportModuleId) => void;
  onViewModeChange: (mode: "2d" | "3d") => void;
}) {
  const { tr } = useAirportLanguage();

  if (mode === "summary") {
    return <div className={`grid gap-2 ${expanded ? "grid-cols-3 xl:grid-cols-5" : "grid-cols-2"}`}>{AIRPORT_OVERVIEW_KPIS.map(([label, value, trend], index) => <div key={label} className={`rounded-xl border bg-gradient-to-br p-3 ${index === 8 ? "border-red-400/25 from-red-400/10" : index > 11 ? "border-blue-400/20 from-blue-400/10" : "border-cyan-400/20 from-cyan-400/10"} to-transparent`}><p className="text-[9px] uppercase tracking-[.12em] text-slate-500">{tr(label)}</p><div className="mt-2 flex items-end justify-between gap-2"><strong className="text-xl text-white">{value}</strong><span className="text-[9px] text-cyan-200">{tr(trend)}</span></div></div>)}</div>;
  }

  if (mode === "insights") {
    return <div className={`grid gap-4 ${expanded ? "xl:grid-cols-[1.25fr_.85fr_.85fr]" : "grid-cols-1"}`}><AirportPanel title="Flight flow & capacity" subtitle="Actual and forecast movements · 24 hours"><div className="p-3"><AirportTrendChart data={flightTrend} height={expanded ? 300 : 190} color="#38bdf8" /></div></AirportPanel><AirportPanel title="Live operations timeline" subtitle="Cross-domain airport events"><div className={`${expanded ? "max-h-[340px]" : "max-h-[230px]"} airport-scrollbar overflow-auto p-3`}><AirportTimeline events={OPERATION_EVENTS} /></div></AirportPanel><AirportPanel title="Incident and readiness feed" subtitle="Prioritized response posture"><div className="space-y-2 p-3">{INCIDENTS.slice(0, expanded ? 8 : 4).map((incident, index) => <div key={incident[0]} className="rounded-lg border border-white/[.06] bg-white/[.025] p-2.5"><div className="flex items-center justify-between"><span className="font-mono text-[9px] text-cyan-300">{incident[0]}</span><AirportStatusBadge status={index === 0 ? "critical" : "warning"} label={incident[2]} /></div><p className="mt-1 text-[10px] font-medium text-white">{tr(incident[1])}</p><p className="mt-1 text-[9px] text-slate-500">{tr(incident[3])} · {incident[4]} · {tr(incident[5])}</p></div>)}</div></AirportPanel></div>;
  }

  if (mode === "readiness") {
    return <div className={`grid gap-4 ${expanded ? "xl:grid-cols-[1.2fr_.8fr]" : "grid-cols-1"}`}><AirportPanel title="Airport-wide readiness by operating domain" subtitle="Live posture, constraints and contingency readiness"><div className="space-y-2 p-3">{READINESS_DOMAINS.map(([domain, score, detail, status]) => <button key={domain} onClick={() => toast.info(`${tr(domain)} · ${score}`)} className="w-full rounded-lg border border-white/[.06] bg-white/[.025] p-3 text-left"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold text-white">{tr(domain)}</p><p className="mt-1 text-[9px] text-slate-500">{tr(detail)}</p></div><div className="text-right"><b className="text-sm text-cyan-200">{score}</b><div className="mt-1"><AirportStatusBadge status={status} /></div></div></div></button>)}</div></AirportPanel><div className="space-y-4"><AirportPanel title="Readiness checklist" subtitle="Critical pre-operation checks"><div className="space-y-2 p-3">{READINESS_CHECKS.map(([label, result, status]) => <div key={label} className="flex items-center justify-between gap-3 rounded-lg bg-white/[.025] p-3"><div><p className="text-[10px] text-slate-200">{tr(label)}</p><p className="mt-1 text-[9px] text-slate-500">{tr(result)}</p></div><AirportStatusBadge status={status} /></div>)}</div></AirportPanel><AirportPanel title="Next operational decision"><div className="p-4"><div className="rounded-xl border border-amber-400/20 bg-amber-400/[.06] p-4"><p className="text-[10px] font-semibold text-amber-200">{tr("Security zone B passenger surge forecast")}</p><p className="mt-2 text-[9px] leading-relaxed text-slate-400">{tr("Open two additional screening lanes before 10:20 and deploy one mobile support team.")}</p><div className="mt-3 flex gap-2"><button onClick={() => toast.success(tr("Readiness action acknowledged"))} className="airport-button !border-emerald-400/20 !bg-emerald-400/10 !text-emerald-200">{tr("Acknowledge")}</button><button onClick={() => onOpenModule("PASSENGERS")} className="airport-button">{tr("Open passenger operations")}</button></div></div></div></AirportPanel></div></div>;
  }

  const selectedModule = spatialSelection ? (SPATIAL_MODULE_MAP[spatialSelection.node.id] ?? SPATIAL_MODULE_MAP[spatialSelection.parent.id] ?? "OVERVIEW") : "OVERVIEW";
  const assets = spatialSelection ? stableMetric(spatialSelection.node.id, 180, 2480) : 0;
  const systems = spatialSelection ? stableMetric(`${spatialSelection.node.id}-systems`, 4, 21) : 0;
  const alerts = spatialSelection ? stableMetric(`${spatialSelection.node.id}-alerts`, 0, 8) : 0;
  const readiness = spatialSelection ? stableMetric(`${spatialSelection.node.id}-ready`, 89, 100) : 0;

  return <div className={`grid gap-4 ${expanded ? "xl:grid-cols-[1.2fr_.8fr]" : "grid-cols-1"}`}><div className={`grid gap-3 ${expanded ? "grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>{AIRPORT_SPATIAL_HIERARCHY.map((parent) => <section key={parent.id} className={`rounded-xl border p-3 transition ${spatialSelection?.parent.id === parent.id ? "border-cyan-400/25 bg-cyan-400/[.06]" : "border-white/[.07] bg-white/[.025]"}`}><button onClick={() => onSpatialSelection({ parent, node: parent })} className="flex w-full items-center justify-between text-left"><div><h3 className="text-xs font-semibold text-white">{tr(parent.label)}</h3><p className="mt-0.5 text-[8px] uppercase tracking-wider text-cyan-300">{tr(parent.type)}</p></div><MapPinned size={14} className="text-slate-500" /></button><div className="mt-2 space-y-1">{parent.children?.map((child) => <button key={child.id} onClick={() => onSpatialSelection({ parent, node: child })} className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-[10px] transition ${spatialSelection?.node.id === child.id ? "bg-cyan-400/10 text-cyan-200" : "text-slate-400 hover:bg-cyan-400/[.07] hover:text-cyan-200"}`}><span>{tr(child.label)}</span><ChevronRight size={11} /></button>) ?? <button onClick={() => onSpatialSelection({ parent, node: parent })} className="flex w-full items-center justify-between rounded px-2 py-1.5 text-[10px] text-slate-500 hover:bg-cyan-400/[.07] hover:text-cyan-200"><span>{tr("Open facility context")}</span><ChevronRight size={11} /></button>}</div></section>)}</div><AirportPanel title={spatialSelection ? spatialSelection.node.label : "Spatial context detail"} subtitle={spatialSelection ? `${spatialSelection.parent.label} · ${spatialSelection.node.type}` : "Select any airport area or zone to open its operational context"}><div className="p-4">{spatialSelection ? <div className="space-y-4"><div className="flex items-center justify-between"><AirportStatusBadge status={alerts > 5 ? "warning" : "normal"} /><span className="text-[9px] text-slate-500">{tr("Data refreshed 6 seconds ago")}</span></div><div className="grid grid-cols-2 gap-2">{[["Mapped assets", assets.toLocaleString()], ["Linked systems", systems], ["Open alerts", alerts], ["Operational readiness", `${readiness}%`]].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-white/[.06] bg-white/[.025] p-3"><p className="text-[9px] text-slate-500">{tr(String(label))}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p></div>)}</div><div className="space-y-2 rounded-xl border border-white/[.06] bg-white/[.02] p-3 text-[10px]"><div className="flex justify-between"><span className="text-slate-500">{tr("Spatial path")}</span><b className="text-right text-cyan-200">{tr(spatialSelection.parent.label)} / {tr(spatialSelection.node.label)}</b></div><div className="flex justify-between"><span className="text-slate-500">{tr("Primary module")}</span><b className="text-white">{tr(selectedModule)}</b></div><div className="flex justify-between"><span className="text-slate-500">{tr("Data quality")}</span><b className="text-emerald-300">98.4%</b></div></div><div className="grid gap-2"><button onClick={() => onLocateSpatial(spatialSelection)} className="airport-button w-full justify-center"><LocateFixed size={14} />{tr("Locate on airport overview")}</button>{selectedModule !== "OVERVIEW" && <button onClick={() => onOpenModule(selectedModule)} className="airport-button w-full justify-center"><Route size={14} />{tr("Open related module")}</button>}<button onClick={() => onViewModeChange("3d")} className="airport-button w-full justify-center"><Box size={14} />{tr("Open in 3D")}</button></div></div> : <div className="grid min-h-64 place-items-center text-center"><div><MapPinned className="mx-auto text-cyan-300" /><p className="mt-3 text-xs font-semibold text-white">{tr("Select an airport area")}</p><p className="mt-1 text-[10px] leading-relaxed text-slate-500">{tr("The selected area will reveal its assets, systems, alerts, readiness and linked operational module.")}</p></div></div>}</div></AirportPanel></div>;
}
