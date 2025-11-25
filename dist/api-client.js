import { API_BASE_URL, ApiCartoError } from "./types.js";
/**
 * Make a request to the API Carto
 */
export async function apiRequest(endpoint, options = {}) {
    const { method = "GET", params = {}, body, timeout = 30000 } = options;
    // Build URL with query parameters
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            url.searchParams.append(key, String(value));
        }
    });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url.toString(), {
            method,
            headers: {
                "Accept": "application/json",
                ...(body ? { "Content-Type": "application/json" } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            const errorText = await response.text().catch(() => "Unknown error");
            let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
            // Add helpful context based on status code
            if (response.status === 404) {
                errorMessage += "\n\nThis endpoint may not exist or the requested resource was not found.";
            }
            else if (response.status === 400) {
                errorMessage += "\n\nThe request parameters may be invalid. Check the geometry format and required parameters.";
            }
            else if (response.status === 403) {
                errorMessage += "\n\nAccess denied. This endpoint may require an API key.";
            }
            else if (response.status === 500) {
                errorMessage += "\n\nThe IGN server encountered an internal error. Try again later or simplify your request.";
            }
            throw new ApiCartoError(errorMessage, response.status, errorText);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof ApiCartoError) {
            throw error;
        }
        if (error instanceof Error) {
            if (error.name === "AbortError") {
                throw new ApiCartoError("Request timeout", 408, "The request took too long to complete");
            }
            throw new ApiCartoError(`Request failed: ${error.message}`);
        }
        throw new ApiCartoError("An unknown error occurred");
    }
}
/**
 * Get communes by postal code
 */
export async function getCommunesByPostalCode(codePostal) {
    return apiRequest(`/codes-postaux/communes/${codePostal}`);
}
/**
 * Generic function for geometry-based queries
 */
export async function queryByGeometry(endpoint, geom, additionalParams = {}) {
    return apiRequest(endpoint, {
        params: {
            geom,
            ...additionalParams,
        },
    });
}
/**
 * Format GeoJSON to Markdown
 */
export function formatGeoJSONToMarkdown(data, title) {
    if (!data.features || data.features.length === 0) {
        return `## ${title}\n\nAucun résultat trouvé.`;
    }
    let result = `## ${title}\n\n`;
    result += `**Nombre de résultats:** ${data.features.length}\n\n`;
    data.features.slice(0, 20).forEach((feature, index) => {
        result += `### Résultat ${index + 1}\n\n`;
        const props = feature.properties;
        Object.entries(props).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
                result += `- **${key}:** ${value}\n`;
            }
        });
        result += "\n";
    });
    if (data.features.length > 20) {
        result += `\n*... et ${data.features.length - 20} autres résultats*\n`;
    }
    return result;
}
/**
 * Format communes to Markdown
 */
export function formatCommunesToMarkdown(communes, codePostal) {
    if (communes.length === 0) {
        return `## Communes pour le code postal ${codePostal}\n\nAucune commune trouvée.`;
    }
    let result = `## Communes pour le code postal ${codePostal}\n\n`;
    result += `**Nombre de communes:** ${communes.length}\n\n`;
    communes.forEach((commune) => {
        result += `- **${commune.nomCommune}** (INSEE: ${commune.codeCommune})\n`;
        result += `  - Libellé d'acheminement: ${commune.libelleAcheminement}\n`;
    });
    return result;
}
/**
 * Truncate response if too long
 */
export function truncateResponse(text, limit) {
    if (text.length <= limit) {
        return text;
    }
    return text.substring(0, limit) + "\n\n*... Réponse tronquée. Utilisez des filtres pour réduire les résultats.*";
}
//# sourceMappingURL=api-client.js.map