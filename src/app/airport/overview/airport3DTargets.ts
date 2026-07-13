export interface Airport3DTarget {
  id: string;
  label: string;
  objectPatterns: string[];
  materialPatterns?: string[];
  module: string;
  cameraPadding?: number;
}

export const AIRPORT_3D_TARGETS: Airport3DTarget[] = [
  {
    id: "aircraft-fleet",
    label: "Aircraft Stands",
    objectPatterns: ["boeing_"],
    module: "AIRPORT_OPS",
    cameraPadding: 1.7,
  },
  {
    id: "runway-system",
    label: "Runway & Taxiway",
    objectPatterns: ["runway", "oh_runway"],
    materialPatterns: ["road 2", "material #30"],
    module: "AIRPORT_OPS",
    cameraPadding: 1.45,
  },
  {
    id: "airfield-surface",
    label: "Airfield Infrastructure",
    objectPatterns: ["grass", "asphalt"],
    materialPatterns: ["grass", "road"],
    module: "SYSTEMS",
    cameraPadding: 1.35,
  },
];
