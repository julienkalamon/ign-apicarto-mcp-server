import { GeoJSONFeatureCollection, CommuneResponse } from "./types.js";
interface RequestOptions {
    method?: "GET" | "POST";
    params?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    timeout?: number;
}
/**
 * Make a request to the API Carto
 */
export declare function apiRequest<T>(endpoint: string, options?: RequestOptions): Promise<T>;
/**
 * Get communes by postal code
 */
export declare function getCommunesByPostalCode(codePostal: string): Promise<CommuneResponse[]>;
/**
 * Generic function for geometry-based queries
 */
export declare function queryByGeometry(endpoint: string, geom: string, additionalParams?: Record<string, string | number | boolean | undefined>): Promise<GeoJSONFeatureCollection>;
/**
 * Format GeoJSON to Markdown
 */
export declare function formatGeoJSONToMarkdown(data: GeoJSONFeatureCollection, title: string): string;
/**
 * Format communes to Markdown
 */
export declare function formatCommunesToMarkdown(communes: CommuneResponse[], codePostal: string): string;
/**
 * Truncate response if too long
 */
export declare function truncateResponse(text: string, limit: number): string;
export {};
//# sourceMappingURL=api-client.d.ts.map