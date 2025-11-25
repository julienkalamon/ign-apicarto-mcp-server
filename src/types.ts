// API Carto IGN base URL
export const API_BASE_URL = "https://apicarto.ign.fr/api";

// Character limit for responses
export const CHARACTER_LIMIT = 50000;

// Response format enum
export enum ResponseFormat {
  JSON = "json",
  MARKDOWN = "markdown",
}

// GeoJSON types
export interface GeoJSONGeometry {
  type: "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon";
  coordinates: number[] | number[][] | number[][][] | number[][][][];
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: GeoJSONGeometry;
  properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// Commune response from codes-postaux
export interface CommuneResponse {
  codePostal: string;
  codeCommune: string;
  nomCommune: string;
  libelleAcheminement: string;
}

// Nature layers
export type NatureLayer =
  | "natura2000-oiseaux"
  | "natura2000-habitat"
  | "rnc"
  | "rnn"
  | "rncf"
  | "pn"
  | "pnr"
  | "znieff1"
  | "znieff2"
  | "sic"
  | "zps";

// GPU layers
export type GPULayer =
  | "municipality"
  | "document"
  | "zone-urba"
  | "secteur-cc"
  | "prescription-surf"
  | "prescription-lin"
  | "prescription-pct"
  | "info-surf"
  | "info-lin"
  | "info-pct"
  | "assiette-sup-s"
  | "assiette-sup-l"
  | "assiette-sup-p"
  | "generateur-sup-s"
  | "generateur-sup-l"
  | "generateur-sup-p";

// Cadastre source
export type CadastreSource = "pci" | "bdparcellaire";

// API Error
export class ApiCartoError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: string
  ) {
    super(message);
    this.name = "ApiCartoError";
  }
}
