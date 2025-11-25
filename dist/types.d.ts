export declare const API_BASE_URL = "https://apicarto.ign.fr/api";
export declare const CHARACTER_LIMIT = 50000;
export declare enum ResponseFormat {
    JSON = "json",
    MARKDOWN = "markdown"
}
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
export interface CommuneResponse {
    codePostal: string;
    codeCommune: string;
    nomCommune: string;
    libelleAcheminement: string;
}
export type NatureLayer = "natura2000-oiseaux" | "natura2000-habitat" | "rnc" | "rnn" | "rncf" | "pn" | "pnr" | "znieff1" | "znieff2" | "sic" | "zps";
export type GPULayer = "municipality" | "document" | "zone-urba" | "secteur-cc" | "prescription-surf" | "prescription-lin" | "prescription-pct" | "info-surf" | "info-lin" | "info-pct" | "assiette-sup-s" | "assiette-sup-l" | "assiette-sup-p" | "generateur-sup-s" | "generateur-sup-l" | "generateur-sup-p";
export type CadastreSource = "pci" | "bdparcellaire";
export declare class ApiCartoError extends Error {
    statusCode?: number | undefined;
    details?: string | undefined;
    constructor(message: string, statusCode?: number | undefined, details?: string | undefined);
}
//# sourceMappingURL=types.d.ts.map