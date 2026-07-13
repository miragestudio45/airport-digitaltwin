import React, { useMemo, useRef } from "react";
import { Box, RotateCcw, Undo2 } from "lucide-react";
import { AIRPORT_3D_CONFIG } from "./airport3DConfig";
import { useAirport3DInteraction } from "./useAirport3DInteraction";
import { useAirportLanguage } from "../i18n/AirportLanguage";

export function AirportOverview3D({ onBack2D }: { onBack2D: () => void }) {
  const { tr } = useAirportLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    loading,
    progress,
    error,
    selectedTarget,
    resetCamera,
    controlMode,
    setControlMode,
    walkLocked,
    heading,
  } = useAirport3DInteraction(containerRef);
  const targetLabel = AIRPORT_3D_CONFIG.targets.find((item) => item.id === selectedTarget)?.label ?? selectedTarget;
  const compassDirection = useMemo(() => {
    const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return labels[Math.round(((heading % 360) / 45)) % labels.length];
  }, [heading]);


  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-[#020a14]">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(1,5,12,.54)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#020a14]/50 to-transparent" />

      <div className="absolute left-3 top-14 z-40 flex flex-col gap-2">
        <button onClick={onBack2D} className="airport-button bg-[#06111f]/82 backdrop-blur-xl"><Undo2 size={14} /> {tr("Back to 2D")}</button>
        <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#06111f]/82 p-1 shadow-xl backdrop-blur-xl">
          <button
            onClick={() => setControlMode("orbit")}
            className={`rounded-lg px-3 py-2 text-[11px] font-medium transition ${controlMode === "orbit" ? "bg-cyan-400/18 text-cyan-200" : "text-slate-300 hover:bg-white/5"}`}
          >
            Orbit
          </button>
          <button
            onClick={() => setControlMode("walk")}
            className={`rounded-lg px-3 py-2 text-[11px] font-medium transition ${controlMode === "walk" ? "bg-cyan-400/18 text-cyan-200" : "text-slate-300 hover:bg-white/5"}`}
          >
            Walk
          </button>
        </div>
        <button onClick={resetCamera} className="airport-button bg-[#06111f]/82 backdrop-blur-xl"><RotateCcw size={14} /> {tr("Reset camera")}</button>
      </div>

      {!AIRPORT_3D_CONFIG.modelUrl && (
        <div className="pointer-events-none absolute left-1/2 top-[16%] w-[520px] -translate-x-1/2 rounded-2xl border border-cyan-400/15 bg-[#071426]/72 p-5 text-center backdrop-blur-xl">
          <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"><Box size={20} /></div>
          <h3 className="mt-3 text-sm font-semibold text-white">{tr("Airport 3D model source is ready for integration")}</h3>
          <p className="mt-1 text-[11px] text-slate-400">{tr("Technical spatial shell, camera controls, grid and model lifecycle are active. Add a GLB URL in airport3DConfig.ts when the airport model is available.")}</p>
        </div>
      )}

      <div className="absolute right-4 top-[78px] z-40 rounded-2xl border border-cyan-400/18 bg-[#071426]/88 p-3 text-white shadow-2xl backdrop-blur-xl">
        <p className="text-[9px] uppercase tracking-[.18em] text-cyan-300">Compass</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="relative grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-[#05101c]">
            <div className="pointer-events-none absolute inset-2 rounded-full border border-white/5" />
            <span className="absolute top-1 text-[8px] font-semibold text-cyan-200">N</span>
            <span className="absolute bottom-1 text-[8px] text-slate-500">S</span>
            <span className="absolute left-1 text-[8px] text-slate-500">W</span>
            <span className="absolute right-1 text-[8px] text-slate-500">E</span>
            <div className="absolute left-1/2 top-1/2 h-10 w-[2px] origin-bottom rounded-full bg-gradient-to-t from-cyan-400/20 via-cyan-300 to-cyan-100" style={{ transform: `translate(-50%, -100%) rotate(${heading}deg)` }}>
              <div className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] border border-cyan-100/70 bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,.55)]" />
            </div>
            <div className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,.7)]" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none text-white">{compassDirection}</p>
            <p className="mt-1 text-[10px] text-slate-400">Heading {Math.round(heading)}°</p>
            <p className="mt-1 text-[9px] text-slate-500">3D only · dùng để định hướng model</p>
          </div>
        </div>
      </div>

      {controlMode === "walk" && (
        <div className="absolute bottom-24 left-5 z-40 w-[340px] rounded-xl border border-cyan-400/20 bg-[#071426]/86 p-4 text-xs text-white shadow-2xl backdrop-blur-xl">
          <p className="text-[9px] uppercase tracking-[.16em] text-cyan-300">Walk mode</p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
            {walkLocked
              ? "Walk FPS: W/A/S/D để di chuyển trên mặt sàn · giữ Shift để đi nhanh hơn · ESC để thoát chế độ nhìn chuột."
              : "Nhấn vào không gian 3D để bắt đầu Walk mode kiểu first-person. Camera sẽ bám mặt sàn, đi chậm và dễ điều khiển hơn."}
          </p>
        </div>
      )}

      {loading && <div className="absolute bottom-24 left-1/2 w-72 -translate-x-1/2 rounded-xl border border-white/10 bg-[#071426]/92 p-3 shadow-2xl backdrop-blur-xl"><div className="flex justify-between text-[10px] text-slate-300"><span>{tr("Loading airport model")}</span><b>{progress}%</b></div><div className="mt-2 h-1 overflow-hidden rounded bg-white/10"><div className="h-full bg-cyan-300 transition-[width]" style={{ width: `${progress}%` }} /></div></div>}
      {error && <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-xs text-red-200">{tr("3D model error")}: {error}</div>}
      {selectedTarget && <div className="absolute bottom-24 right-5 rounded-xl border border-cyan-400/20 bg-[#071426]/92 p-4 text-xs text-white shadow-2xl backdrop-blur-xl"><p className="text-[9px] uppercase tracking-wider text-cyan-300">{tr("Selected 3D context")}</p><b className="mt-1 block text-sm text-white">{tr(targetLabel ?? "")}</b><p className="mt-1 text-[9px] text-slate-500">{tr("Click Reset camera to return to the airport overview.")}</p></div>}
      <div className="absolute bottom-4 left-4 text-[9px] uppercase tracking-[.16em] text-slate-500">{tr("Three.js night spatial scene · demonstration mode")}</div>
    </div>
  );
}
