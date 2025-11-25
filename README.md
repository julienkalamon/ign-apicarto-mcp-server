# IGN API Carto MCP Server

Un serveur MCP (Model Context Protocol) pour l'API Carto de l'IGN (Institut national de l'information géographique et forestière).

## Fonctionnalités

Ce serveur MCP fournit un accès aux données géographiques françaises via l'API Carto de l'IGN :

### Modules disponibles

| Outil | Description |
|-------|-------------|
| `ign_get_communes_by_postal_code` | Récupérer les communes associées à un code postal |
| `ign_get_cadastre_parcelles` | Rechercher des parcelles cadastrales |
| `ign_get_cadastre_communes` | Obtenir les limites communales cadastrales |
| `ign_get_rpg` | Interroger le Registre Parcellaire Graphique (données agricoles) |
| `ign_get_nature_areas` | Espaces naturels protégés (Natura 2000, ZNIEFF, parcs nationaux...) |
| `ign_get_gpu_urbanisme` | Données d'urbanisme du Géoportail de l'Urbanisme |
| `ign_get_aoc_viticoles` | Zones d'appellations viticoles (AOC, IGP, VSIG) |
| `ign_wfs_geoportail` | Accès générique aux flux WFS du Géoportail |
| `ign_get_administrative_limits` | Limites administratives (communes, départements, régions) |

## Installation

```bash
npm install
npm run build
```

## Utilisation

### Mode stdio (local)

```bash
npm start
```

### Mode HTTP (remote)

```bash
TRANSPORT=http PORT=3000 npm start
```

## Configuration Claude Desktop

Ajoutez à votre `claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "ign-apicarto": {
      "command": "node",
      "args": ["/path/to/ign-apicarto-mcp-server/dist/index.js"]
    }
  }
}
```

## Exemples d'utilisation

### Trouver les communes d'un code postal

```
Quelles communes sont associées au code postal 75001 ?
```

### Rechercher des parcelles cadastrales

```
Trouve les parcelles cadastrales de la commune avec le code INSEE 75101
```

### Vérifier le zonage d'urbanisme

```
Quel est le zonage PLU à ces coordonnées : {"type":"Point","coordinates":[2.35,48.85]}
```

### Trouver les zones Natura 2000

```
Y a-t-il des zones Natura 2000 à proximité de ce point : {"type":"Point","coordinates":[-1.69,48.10]}
```

### Consulter les parcelles agricoles

```
Quelles cultures sont déclarées sur cette zone en 2023 ?
```

## Format des géométries

Les géométries doivent être au format GeoJSON en WGS84 (EPSG:4326) :

```json
// Point
{"type":"Point","coordinates":[longitude, latitude]}

// Polygon
{"type":"Polygon","coordinates":[[[lon1,lat1],[lon2,lat2],[lon3,lat3],[lon1,lat1]]]}

// MultiPolygon
{"type":"MultiPolygon","coordinates":[[[[lon1,lat1],[lon2,lat2],...]],[...]]}
```

## Limites

- Maximum 1000 résultats par requête (500 pour les communes cadastrales)
- Pagination disponible via `_start` et `_limit`
- Projection WGS84 uniquement pour le module WFS-Geoportail (beta)

## Sources de données

- **Cadastre** : PCI Express / BD Parcellaire
- **RPG** : Registre Parcellaire Graphique (2010-2024)
- **Nature** : Données du MNHN (Muséum National d'Histoire Naturelle)
- **GPU** : Géoportail de l'Urbanisme
- **AOC** : FranceAgriMer / INAO
- **Codes postaux** : Base Adresse Nationale

## Licence

MIT

## Documentation

- [Documentation API Carto](https://apicarto.ign.fr/api/doc/)
- [Géoservices IGN](https://geoservices.ign.fr/api-carto)
