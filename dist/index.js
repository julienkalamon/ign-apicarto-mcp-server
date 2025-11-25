import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";
import { ResponseFormat, CHARACTER_LIMIT, } from "./types.js";
import { apiRequest, getCommunesByPostalCode, formatGeoJSONToMarkdown, formatCommunesToMarkdown, truncateResponse, } from "./api-client.js";
// Initialize MCP server
const server = new McpServer({
    name: "ign-apicarto-mcp-server",
    version: "1.0.0",
});
// ============================================================================
// SCHEMAS
// ============================================================================
const ResponseFormatSchema = z
    .nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable");
const GeometrySchema = z
    .string()
    .describe('GeoJSON geometry string, e.g. {"type":"Point","coordinates":[2.35,48.85]}');
const PaginationSchema = {
    _limit: z
        .number()
        .int()
        .min(1)
        .max(1000)
        .optional()
        .describe("Maximum number of results (1-1000)"),
    _start: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe("Starting position for pagination"),
};
// ============================================================================
// TOOL: Codes Postaux
// ============================================================================
server.registerTool("ign_get_communes_by_postal_code", {
    title: "Get communes by postal code",
    description: `Retrieve French communes (municipalities) associated with a postal code.

This tool queries the IGN API Carto codes-postaux module to find all communes that share a given postal code. In France, a postal code can cover multiple communes, and this tool returns all of them.

Args:
  - code_postal (string): French postal code (5 digits, e.g. "75001", "69000")
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  For JSON format:
  [
    {
      "codePostal": "75001",
      "codeCommune": "75101",
      "nomCommune": "Paris 1er Arrondissement",
      "libelleAcheminement": "PARIS"
    }
  ]

Examples:
  - "What communes are in postal code 75001?" -> code_postal="75001"
  - "Find cities for zip 69000" -> code_postal="69000"`,
    inputSchema: z.object({
        code_postal: z
            .string()
            .regex(/^\d{5}$/, "Postal code must be 5 digits")
            .describe("French postal code (5 digits)"),
        response_format: ResponseFormatSchema,
    }).strict(),
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
    },
}, async ({ code_postal, response_format }) => {
    const communes = await getCommunesByPostalCode(code_postal);
    if (response_format === ResponseFormat.JSON) {
        return {
            content: [{ type: "text", text: JSON.stringify(communes, null, 2) }],
        };
    }
    const markdown = formatCommunesToMarkdown(communes, code_postal);
    return {
        content: [{ type: "text", text: truncateResponse(markdown, CHARACTER_LIMIT) }],
    };
});
// ============================================================================
// TOOL: Cadastre - Parcelles
// ============================================================================
server.registerTool("ign_get_cadastre_parcelles", {
    title: "Get cadastral parcels",
    description: `Search for cadastral parcels (land plots) in France.

This tool queries the IGN API Carto cadastre module to find parcels by geometry intersection or administrative codes. Useful for property identification, urban planning, and administrative procedures.

Args:
  - geom (string, optional): GeoJSON geometry to intersect
  - code_insee (string, optional): INSEE commune code (5 digits)
  - code_dep (string, optional): Department code (2-3 digits)
  - code_com (string, optional): Commune code within department (3 digits)
  - section (string, optional): Cadastral section (2 characters)
  - numero (string, optional): Parcel number
  - source (string): Data source - 'pci' (PCI Express, recommended) or 'bdparcellaire'
  - _limit (number): Max results (1-1000)
  - _start (number): Pagination offset

Returns:
  GeoJSON FeatureCollection with parcel geometries and properties including:
  - numero: Parcel number
  - feuille: Sheet number
  - section: Cadastral section
  - code_dep, code_com, com_abs, code_arr
  - geometry: MultiPolygon

Examples:
  - "Find parcels in commune 75101" -> code_insee="75101"
  - "Get parcel AB-0001 in section AB" -> section="AB", numero="0001"`,
    inputSchema: z.object({
        geom: GeometrySchema.optional(),
        code_insee: z.string().optional().describe("INSEE commune code (5 digits)"),
        code_dep: z.string().optional().describe("Department code"),
        code_com: z.string().optional().describe("Commune code within department"),
        section: z.string().optional().describe("Cadastral section (2 chars)"),
        numero: z.string().optional().describe("Parcel number"),
        source: z
            .enum(["pci", "bdparcellaire"])
            .default("pci")
            .describe("Data source: 'pci' (recommended) or 'bdparcellaire'"),
        ...PaginationSchema,
        response_format: ResponseFormatSchema,
    }).strict(),
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
    },
}, async (params) => {
    const { source, response_format, ...queryParams } = params;
    const endpoint = source === "pci" ? "/cadastre/parcelle" : "/cadastre/parcelle";
    const data = await apiRequest(endpoint, { params: queryParams });
    if (response_format === ResponseFormat.JSON) {
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
    const markdown = formatGeoJSONToMarkdown(data, "Parcelles cadastrales");
    return {
        content: [{ type: "text", text: truncateResponse(markdown, CHARACTER_LIMIT) }],
    };
});
// ============================================================================
// TOOL: Cadastre - Communes
// ============================================================================
server.registerTool("ign_get_cadastre_communes", {
    title: "Get cadastral commune boundaries",
    description: `Get commune (municipality) boundaries from the cadastral database.

Args:
  - geom (string, optional): GeoJSON geometry to intersect
  - code_insee (string, optional): INSEE commune code
  - code_dep (string, optional): Department code
  - _limit (number): Max results (default 500)
  - _start (number): Pagination offset

Returns:
  GeoJSON FeatureCollection with commune boundaries.`,
    inputSchema: z.object({
        geom: GeometrySchema.optional(),
        code_insee: z.string().optional(),
        code_dep: z.string().optional(),
        ...PaginationSchema,
        response_format: ResponseFormatSchema,
    }).strict(),
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
    },
}, async (params) => {
    const { response_format, ...queryParams } = params;
    const data = await apiRequest("/cadastre/commune", { params: queryParams });
    if (response_format === ResponseFormat.JSON) {
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
    const markdown = formatGeoJSONToMarkdown(data, "Communes cadastrales");
    return {
        content: [{ type: "text", text: truncateResponse(markdown, CHARACTER_LIMIT) }],
    };
});
// ============================================================================
// TOOL: RPG (Registre Parcellaire Graphique)
// ============================================================================
server.registerTool("ign_get_rpg", {
    title: "Get agricultural parcels (RPG)",
    description: `Query the Registre Parcellaire Graphique (RPG) for agricultural parcel information.

The RPG contains agricultural land use data declared by farmers for CAP (Common Agricultural Policy) subsidies.

Two versions exist:
- V1 (2010-2014): Anonymous farm blocks (îlots)
- V2 (2015+): Graphic parcels with crop information

Args:
  - annee (number): Year of data (2010-2024)
  - geom (string): GeoJSON geometry (required)
  - code_cultu (string, optional): Crop culture code filter
  - _limit (number): Max results
  - _start (number): Pagination offset

Returns:
  GeoJSON FeatureCollection with:
  - V1: num_ilot, commune, surf_decla, code_cultu, nom_cultu
  - V2: id_parcel, surf_parc, code_cultu, code_group, culture_d1, culture_d2

Examples:
  - "Find crops at this location in 2023" -> annee=2023, geom={"type":"Point",...}`,
    inputSchema: z.object({
        annee: z
            .number()
            .int()
            .min(2010)
            .max(2024)
            .describe("Year (2010-2024)"),
        geom: GeometrySchema.describe("GeoJSON geometry (required)"),
        code_cultu: z.string().optional().describe("Crop culture code"),
        ...PaginationSchema,
        response_format: ResponseFormatSchema,
    }).strict(),
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
    },
}, async (params) => {
    const { annee, response_format, ...queryParams } = params;
    const version = annee <= 2014 ? "v1" : "v2";
    const endpoint = `/rpg/${version}`;
    const data = await apiRequest(endpoint, {
        params: { annee, ...queryParams },
    });
    if (response_format === ResponseFormat.JSON) {
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
    const markdown = formatGeoJSONToMarkdown(data, `Parcelles agricoles RPG ${annee}`);
    return {
        content: [{ type: "text", text: truncateResponse(markdown, CHARACTER_LIMIT) }],
    };
});
// ============================================================================
// TOOL: Nature (Protected areas)
// ============================================================================
const NatureLayerSchema = z.enum([
    "natura2000-oiseaux",
    "natura2000-habitat",
    "rnc",
    "rnn",
    "rncf",
    "pn",
    "pnr",
    "znieff1",
    "znieff2",
    "sic",
    "zps",
]);
server.registerTool("ign_get_nature_areas", {
    title: "Get protected natural areas",
    description: `Query protected natural areas in France (Natura 2000, ZNIEFF, national parks, etc.).

Available layers:
- natura2000-oiseaux: Natura 2000 bird directive sites
- natura2000-habitat: Natura 2000 habitat directive sites
- rnc: Corsican natural reserves
- rnn: National natural reserves
- rncf: Hunting and wildlife natural reserves
- pn: National parks
- pnr: Regional natural parks
- znieff1: ZNIEFF type 1 (remarkable ecological areas)
- znieff2: ZNIEFF type 2 (large natural ensembles)
- sic: Sites of Community Importance
- zps: Special Protection Areas

Args:
  - layer (string): Nature layer to query
  - geom (string, optional): GeoJSON geometry to intersect
  - id_mnhn (string, optional): MNHN identifier
  - _limit (number): Max results
  - _start (number): Pagination offset

Returns:
  GeoJSON FeatureCollection with protected area boundaries and attributes.

Examples:
  - "Find Natura 2000 sites at this location" -> layer="natura2000-habitat", geom=...
  - "Get ZNIEFF zones near Paris" -> layer="znieff1", geom=...`,
    inputSchema: z.object({
        layer: NatureLayerSchema.describe("Nature layer to query"),
        geom: GeometrySchema.optional(),
        id_mnhn: z.string().optional().describe("MNHN (Natural History Museum) identifier"),
        ...PaginationSchema,
        response_format: ResponseFormatSchema,
    }).strict(),
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
    },
}, async (params) => {
    const { layer, response_format, ...queryParams } = params;
    const endpoint = `/nature/${layer}`;
    const data = await apiRequest(endpoint, {
        params: queryParams,
    });
    if (response_format === ResponseFormat.JSON) {
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
    const markdown = formatGeoJSONToMarkdown(data, `Espaces naturels - ${layer}`);
    return {
        content: [{ type: "text", text: truncateResponse(markdown, CHARACTER_LIMIT) }],
    };
});
// ============================================================================
// TOOL: GPU (Géoportail de l'Urbanisme)
// ============================================================================
const GPULayerSchema = z.enum([
    "municipality",
    "document",
    "zone-urba",
    "secteur-cc",
    "prescription-surf",
    "prescription-lin",
    "prescription-pct",
    "info-surf",
    "info-lin",
    "info-pct",
    "assiette-sup-s",
    "assiette-sup-l",
    "assiette-sup-p",
    "generateur-sup-s",
    "generateur-sup-l",
    "generateur-sup-p",
]);
server.registerTool("ign_get_gpu_urbanisme", {
    title: "Get urban planning data (GPU)",
    description: `Query the Géoportail de l'Urbanisme (GPU) for urban planning documents and zones.

This tool accesses French urban planning data including local urban plans (PLU), zoning, and public utility easements.

Available layers:
- municipality: Check if commune is under RNU (national regulation)
- document: Urban planning documents (PLU, PLUi, CC)
- zone-urba: Urban zones (U, AU, A, N)
- secteur-cc: Community map sectors
- prescription-surf/lin/pct: Surface/linear/point prescriptions
- info-surf/lin/pct: Informative zones
- assiette-sup-s/l/p: Public utility easement footprints
- generateur-sup-s/l/p: Public utility easement generators

Args:
  - layer (string): GPU layer to query
  - geom (string, optional): GeoJSON geometry to intersect
  - partition (string, optional): Document partition ID
  - categorie (string, optional): SUP category filter
  - _limit (number): Max results
  - _start (number): Pagination offset

Returns:
  GeoJSON FeatureCollection with urban planning data.

Examples:
  - "Is this commune under RNU?" -> layer="municipality", geom=...
  - "What's the zoning at this address?" -> layer="zone-urba", geom=...
  - "Find building prescriptions here" -> layer="prescription-surf", geom=...`,
    inputSchema: z.object({
        layer: GPULayerSchema.describe("GPU layer to query"),
        geom: GeometrySchema.optional(),
        partition: z.string().optional().describe("Document partition ID"),
        categorie: z.string().optional().describe("SUP category filter"),
        ...PaginationSchema,
        response_format: ResponseFormatSchema,
    }).strict(),
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
    },
}, async (params) => {
    const { layer, response_format, ...queryParams } = params;
    const endpoint = `/gpu/${layer}`;
    const data = await apiRequest(endpoint, {
        params: queryParams,
    });
    if (response_format === ResponseFormat.JSON) {
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
    const markdown = formatGeoJSONToMarkdown(data, `Urbanisme GPU - ${layer}`);
    return {
        content: [{ type: "text", text: truncateResponse(markdown, CHARACTER_LIMIT) }],
    };
});
// ============================================================================
// TOOL: AOC (Appellations viticoles)
// ============================================================================
server.registerTool("ign_get_aoc_viticoles", {
    title: "Get wine appellations (AOC/IGP)",
    description: `Query wine appellation zones (AOC, IGP, VSIG) in France.

This tool accesses wine appellation data maintained by FranceAgriMer based on INAO data.

Args:
  - geom (string): GeoJSON geometry to intersect (required)
  - _limit (number): Max results
  - _start (number): Pagination offset

Returns:
  GeoJSON FeatureCollection with appellation zones including:
  - appellation: Appellation name
  - idapp: Appellation ID
  - type: AOC/IGP/VSIG

Examples:
  - "What wine appellations cover this vineyard?" -> geom={"type":"Point",...}
  - "Find AOC zones in Bordeaux region" -> geom={"type":"Polygon",...}`,
    inputSchema: z.object({
        geom: GeometrySchema.describe("GeoJSON geometry (required)"),
        ...PaginationSchema,
        response_format: ResponseFormatSchema,
    }).strict(),
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
    },
}, async (params) => {
    const { response_format, ...queryParams } = params;
    const data = await apiRequest("/aoc/appellation-viticole", {
        params: queryParams,
    });
    if (response_format === ResponseFormat.JSON) {
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
    const markdown = formatGeoJSONToMarkdown(data, "Appellations viticoles");
    return {
        content: [{ type: "text", text: truncateResponse(markdown, CHARACTER_LIMIT) }],
    };
});
// ============================================================================
// TOOL: WFS Geoportail (Generic)
// ============================================================================
server.registerTool("ign_wfs_geoportail", {
    title: "Query WFS Geoportail layers",
    description: `Generic query interface for Geoportail WFS layers.

This tool provides access to various WFS layers from the IGN Geoportail. It's a beta feature that allows querying any WFS layer by intersection with a geometry.

Args:
  - layer (string): WFS layer name (e.g., "BDTOPO_V3:commune", "LIMITES_ADMINISTRATIVES_EXPRESS.LATEST:commune")
  - geom (string): GeoJSON geometry to intersect (required)
  - _limit (number): Max results
  - _start (number): Pagination offset

Returns:
  GeoJSON FeatureCollection with features from the requested layer.

Note: This is a beta feature. Only WGS84 (EPSG:4326) layers are supported.

Examples:
  - "Get BDTOPO communes at this point" -> layer="BDTOPO_V3:commune", geom=...`,
    inputSchema: z.object({
        layer: z.string().describe("WFS layer name"),
        geom: GeometrySchema.describe("GeoJSON geometry (required)"),
        ...PaginationSchema,
        response_format: ResponseFormatSchema,
    }).strict(),
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
    },
}, async (params) => {
    const { layer, response_format, ...queryParams } = params;
    const data = await apiRequest("/wfs-geoportail/search", {
        params: {
            typeName: layer,
            ...queryParams
        },
    });
    if (response_format === ResponseFormat.JSON) {
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
    const markdown = formatGeoJSONToMarkdown(data, `WFS Geoportail - ${layer}`);
    return {
        content: [{ type: "text", text: truncateResponse(markdown, CHARACTER_LIMIT) }],
    };
});
// ============================================================================
// TOOL: Administrative limits
// ============================================================================
server.registerTool("ign_get_administrative_limits", {
    title: "Get administrative boundaries",
    description: `Query French administrative boundaries (communes, departments, regions).

This tool accesses administrative limit data from the IGN.

Args:
  - type (string): Boundary type - 'commune', 'departement', or 'region'
  - geom (string, optional): GeoJSON geometry to intersect
  - code (string, optional): Administrative code (INSEE code for communes, department number, region code)
  - _limit (number): Max results
  - _start (number): Pagination offset

Returns:
  GeoJSON FeatureCollection with administrative boundaries.

Examples:
  - "Get Paris commune boundary" -> type="commune", code="75056"
  - "What department is at this point?" -> type="departement", geom=...
  - "Get all regions" -> type="region"`,
    inputSchema: z.object({
        type: z
            .enum(["commune", "departement", "region"])
            .describe("Administrative boundary type"),
        geom: GeometrySchema.optional(),
        code: z.string().optional().describe("Administrative code"),
        ...PaginationSchema,
        response_format: ResponseFormatSchema,
    }).strict(),
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
    },
}, async (params) => {
    const { type, response_format, ...queryParams } = params;
    const endpoint = `/cog/${type}`;
    const data = await apiRequest(endpoint, {
        params: queryParams,
    });
    if (response_format === ResponseFormat.JSON) {
        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
    }
    const markdown = formatGeoJSONToMarkdown(data, `Limites administratives - ${type}`);
    return {
        content: [{ type: "text", text: truncateResponse(markdown, CHARACTER_LIMIT) }],
    };
});
// ============================================================================
// SERVER STARTUP
// ============================================================================
async function runStdio() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("IGN API Carto MCP server running on stdio");
}
async function runHTTP() {
    const app = express();
    app.use(express.json());
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", server: "ign-apicarto-mcp-server" });
    });
    app.post("/mcp", async (req, res) => {
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true,
        });
        res.on("close", () => transport.close());
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    });
    const port = parseInt(process.env.PORT || "3000");
    app.listen(port, () => {
        console.error(`IGN API Carto MCP server running on http://localhost:${port}/mcp`);
    });
}
// Choose transport based on environment
const transport = process.env.TRANSPORT || "stdio";
if (transport === "http") {
    runHTTP().catch((error) => {
        console.error("Server error:", error);
        process.exit(1);
    });
}
else {
    runStdio().catch((error) => {
        console.error("Server error:", error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map