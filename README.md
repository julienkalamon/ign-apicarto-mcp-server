# IGN API Carto MCP Server

> Serveur MCP (Model Context Protocol) pour interroger les données géographiques françaises via l'API Carto de l'IGN

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table des matières

- [À propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Projets réalisés](#projets-réalisés)
- [Exemples détaillés](#exemples-détaillés)
- [Format des géométries](#format-des-géométries)
- [Limitations](#limitations)
- [Sources de données](#sources-de-données)
- [Développement](#développement)
- [Dépannage](#dépannage)
- [Ressources](#ressources)
- [Licence](#licence)

## À propos

Ce serveur MCP permet d'accéder aux riches données géographiques de l'**IGN (Institut national de l'information géographique et forestière)** directement depuis Claude Desktop ou tout autre client compatible MCP.

Il expose les principales API de l'écosystème IGN API Carto, permettant d'interroger des données cadastrales, agricoles, environnementales, d'urbanisme et administratives françaises en langage naturel.

### Cas d'usage

- 🏘️ Analyser des données cadastrales et parcellaires
- 🌾 Consulter les déclarations agricoles (RPG)
- 🌳 Identifier les zones naturelles protégées
- 🏗️ Vérifier les règlements d'urbanisme (PLU, GPU)
- 🍷 Localiser les appellations viticoles
- 🗺️ Obtenir des données administratives géolocalisées

## Fonctionnalités

### Outils disponibles

| Outil | Description | Cas d'usage |
|-------|-------------|-------------|
| `ign_get_communes_by_postal_code` | Récupérer les communes associées à un code postal | Résolution d'adresses, statistiques postales |
| `ign_get_cadastre_parcelles` | Rechercher des parcelles cadastrales | Études foncières, analyse immobilière |
| `ign_get_cadastre_communes` | Obtenir les limites communales cadastrales | Délimitation territoriale, cartographie |
| `ign_get_rpg` | Interroger le Registre Parcellaire Graphique | Analyse agricole, environnement |
| `ign_get_nature_areas` | Espaces naturels protégés (Natura 2000, ZNIEFF, parcs) | Études environnementales, biodiversité |
| `ign_get_gpu_urbanisme` | Données d'urbanisme du Géoportail de l'Urbanisme | Vérification PLU, constructibilité |
| `ign_get_aoc_viticoles` | Zones d'appellations viticoles (AOC, IGP, VSIG) | Viticulture, géomarketing |
| `ign_wfs_geoportail` | Accès générique aux flux WFS du Géoportail | Données géographiques diverses |
| `ign_get_administrative_limits` | Limites administratives (communes, départements, régions) | Découpage territorial, statistiques |

## Prérequis

- **Node.js** 16+ et npm
- **Claude Desktop** ou un client MCP compatible
- Connexion internet pour accéder aux API IGN

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-utilisateur/ign-apicarto-mcp-server.git
cd ign-apicarto-mcp-server
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Compiler le projet

```bash
npm run build
```

Le serveur compilé sera disponible dans le dossier `dist/`.

## Configuration

### Configuration Claude Desktop

Pour utiliser ce serveur avec Claude Desktop, ajoutez la configuration suivante à votre fichier `claude_desktop_config.json` :

**Emplacement du fichier :**
- macOS : `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows : `%APPDATA%\Claude\claude_desktop_config.json`
- Linux : `~/.config/Claude/claude_desktop_config.json`

**Configuration :**

```json
{
  "mcpServers": {
    "ign-apicarto": {
      "command": "node",
      "args": ["/chemin/absolu/vers/ign-apicarto-mcp-server/dist/index.js"]
    }
  }
}
```

⚠️ **Important** : Remplacez `/chemin/absolu/vers/` par le chemin complet vers votre installation.

### Modes de transport

Le serveur supporte deux modes de communication :

#### Mode stdio (par défaut)

Mode standard pour une utilisation locale avec Claude Desktop :

```bash
npm start
```

#### Mode HTTP (optionnel)

Pour une utilisation en réseau ou depuis un client distant :

```bash
TRANSPORT=http PORT=3000 npm start
```

Variables d'environnement disponibles :
- `TRANSPORT` : `stdio` (défaut) ou `http`
- `PORT` : Port HTTP (défaut : `3000`)

## Utilisation

Une fois configuré dans Claude Desktop, vous pouvez interroger les données IGN en langage naturel. Le serveur traduira automatiquement vos requêtes en appels API appropriés.

### Redémarrage après configuration

Après avoir modifié `claude_desktop_config.json`, redémarrez Claude Desktop pour que les changements soient pris en compte.

## Projets réalisés

### 🍷 Analyse Territoriale de Margaux-Cantenac

Application interactive d'analyse territoriale pour la commune viticole de Margaux-Cantenac (Gironde), développée avec Claude et ce serveur MCP.

**🔗 [Voir la démo interactive](https://claude.site/public/artifacts/cc7b4fc6-ba5e-4580-ba46-994654b8b941/embed)**

#### Fonctionnalités

L'application offre une analyse complète du territoire en 4 volets :

| Module | Contenu | APIs utilisées |
|--------|---------|----------------|
| **📍 Vue générale** | Code INSEE, coordonnées WGS84, contexte viticole | `ign_get_communes_by_postal_code`, `ign_get_administrative_limits` |
| **🏗️ Urbanisme** | Plan Local d'Urbanisme avec 52 zones (A, U, N, AU) | `ign_get_gpu_urbanisme` |
| **🌳 Environnement** | Parc Naturel Régional du Médoc, zones ZNIEFF | `ign_get_nature_areas` |
| **📐 Cadastre** | Sections cadastrales, identifiants de parcelles | `ign_get_cadastre_parcelles`, `ign_get_cadastre_communes` |

#### Technologies

- Interface React avec navigation par onglets
- Intégration de données IGN et INPN (Muséum National d'Histoire Naturelle)
- Visualisation géographique (bounding box, coordonnées précises)
- Codes couleur pour différencier les types de zones territoriales

#### Comment le reproduire ?

```
Créé une application React interactive pour analyser le territoire de la commune
de Margaux-Cantenac. Utilise les données IGN pour afficher :
- Les informations administratives
- Le zonage PLU complet
- Les zones naturelles protégées
- Les sections cadastrales

L'interface doit être organisée en onglets avec une navigation fluide.
```

---

**💡 Vous avez créé un projet avec ce serveur MCP ?** Partagez-le en ouvrant une [issue GitHub](https://github.com/votre-utilisateur/ign-apicarto-mcp-server/issues) !

## Exemples détaillés

### 1. Recherche par code postal

**Question :**
```
Quelles communes sont associées au code postal 75001 ?
```

**Réponse attendue :**
- Liste des communes avec code INSEE
- Coordonnées géographiques
- Limites administratives

**Outil utilisé :** `ign_get_communes_by_postal_code`

---

### 2. Recherche de parcelles cadastrales

**Question :**
```
Trouve les parcelles cadastrales de la commune avec le code INSEE 75101
```

**Paramètres possibles :**
- Code INSEE de la commune
- Section cadastrale
- Numéro de parcelle

**Outil utilisé :** `ign_get_cadastre_parcelles`

---

### 3. Vérification du zonage d'urbanisme

**Question :**
```
Quel est le zonage PLU à ces coordonnées : {"type":"Point","coordinates":[2.35,48.85]} ?
```

**Informations retournées :**
- Type de zone (U, AU, A, N)
- Règlement d'urbanisme applicable
- Restrictions de constructibilité
- Date de mise à jour du PLU

**Outil utilisé :** `ign_get_gpu_urbanisme`

---

### 4. Zones naturelles protégées

**Question :**
```
Y a-t-il des zones Natura 2000 à proximité de ce point : {"type":"Point","coordinates":[-1.69,48.10]} ?
```

**Types de zones retournées :**
- Sites Natura 2000 (ZSC, ZPS)
- ZNIEFF (type I et II)
- Parcs Nationaux et Régionaux
- Réserves naturelles

**Outil utilisé :** `ign_get_nature_areas`

---

### 5. Registre Parcellaire Graphique (agriculture)

**Question :**
```
Quelles cultures sont déclarées sur cette parcelle agricole en 2023 ?
Géométrie : {"type":"Point","coordinates":[2.35,45.85]}
```

**Données disponibles :**
- Type de culture
- Surface déclarée
- Code culture PAC
- Année de déclaration (2010-2024)

**Outil utilisé :** `ign_get_rpg`

---

### 6. Appellations viticoles

**Question :**
```
Cette parcelle est-elle située dans une AOC viticole ?
Coordonnées : {"type":"Point","coordinates":[4.84,45.76]}
```

**Informations retournées :**
- Type d'appellation (AOC, IGP, VSIG)
- Nom de l'appellation
- Couleur de vin (rouge, blanc, rosé)
- Organisme certificateur

**Outil utilisé :** `ign_get_aoc_viticoles`

---

### 7. Limites administratives

**Question :**
```
Dans quel département et quelle région se trouve la commune de Lyon ?
```

**Données disponibles :**
- Limites communales
- Contours départementaux
- Contours régionaux
- Codes officiels géographiques

**Outil utilisé :** `ign_get_administrative_limits`

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

## Limitations

### Limites des API IGN

| Type | Limite |
|------|--------|
| Résultats max par requête | 1000 (500 pour communes cadastrales) |
| Pagination | Disponible via `_start` et `_limit` |
| Projection géographique | WGS84 (EPSG:4326) uniquement |
| Timeout requête | 30 secondes |
| Format de sortie | GeoJSON |

### Limitations fonctionnelles

- ⚠️ Le module WFS-Geoportail est en version **beta**
- Certaines données peuvent avoir un délai de mise à jour
- Les géométries complexes peuvent nécessiter une simplification
- Les données RPG sont disponibles de 2010 à 2024

## Sources de données

| Source | Données | Organisme | Mise à jour |
|--------|---------|-----------|-------------|
| **PCI Express** | Cadastre parcellaire | DGFiP | Annuelle |
| **BD Parcellaire** | Limites cadastrales | IGN | Trimestrielle |
| **RPG** | Registre Parcellaire Graphique | ASP | Annuelle |
| **MNHN** | Espaces naturels protégés | Muséum National d'Histoire Naturelle | Variable |
| **GPU** | Plans locaux d'urbanisme | Géoportail de l'Urbanisme | Continue |
| **FranceAgriMer** | Appellations viticoles | INAO | Annuelle |
| **BAN** | Base Adresse Nationale | IGN / La Poste | Hebdomadaire |

## Développement

### Structure du projet

```
ign-apicarto-mcp-server/
├── src/
│   ├── index.ts          # Point d'entrée du serveur MCP
│   ├── tools/            # Définition des outils MCP
│   └── types/            # Types TypeScript
├── dist/                 # Fichiers compilés
├── package.json
└── tsconfig.json
```

### Scripts disponibles

```bash
# Démarrer le serveur en mode développement
npm run dev

# Compiler le projet
npm run build

# Démarrer le serveur en production
npm start

# Lancer les tests (si disponibles)
npm test

# Vérifier le code
npm run lint
```

### Contribuer

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Ajouter un nouvel outil

Pour ajouter un nouvel outil MCP :

1. Créez un nouveau fichier dans `src/tools/`
2. Définissez le schéma de l'outil avec ses paramètres
3. Implémentez la logique d'appel à l'API IGN
4. Enregistrez l'outil dans `src/index.ts`
5. Documentez l'outil dans ce README

## Dépannage

### Le serveur ne démarre pas

**Vérifications :**
- Node.js version 16+ est installé : `node --version`
- Les dépendances sont installées : `npm install`
- Le projet est compilé : `npm run build`
- Le fichier `dist/index.js` existe

### Claude Desktop ne détecte pas le serveur

**Solutions :**
1. Vérifiez que le chemin dans `claude_desktop_config.json` est absolu et correct
2. Redémarrez complètement Claude Desktop
3. Vérifiez les logs de Claude Desktop :
   - macOS : `~/Library/Logs/Claude/`
   - Windows : `%APPDATA%\Claude\logs\`
   - Linux : `~/.config/Claude/logs/`

### Erreurs d'API

**Problèmes courants :**

| Erreur | Cause | Solution |
|--------|-------|----------|
| Timeout | Requête trop complexe | Simplifier la géométrie ou réduire la zone |
| 400 Bad Request | Paramètres invalides | Vérifier le format GeoJSON |
| 404 Not Found | Données non disponibles | Vérifier les codes INSEE/postaux |
| 500 Server Error | Problème côté IGN | Réessayer plus tard |
| Too many results | Plus de 1000 résultats | Ajouter des filtres ou paginer |

### Problèmes de géométrie

Les géométries doivent être en **WGS84 (EPSG:4326)** avec longitude avant latitude :

```json
✅ Correct : {"type":"Point","coordinates":[2.35, 48.85]}
❌ Incorrect : {"type":"Point","coordinates":[48.85, 2.35]}
```

### Performances lentes

**Optimisations :**
- Utilisez des géométries simplifiées pour les grandes zones
- Limitez le nombre de résultats avec le paramètre `_limit`
- Utilisez des filtres spécifiques plutôt que des requêtes larges
- Vérifiez votre connexion internet

## Ressources

### Documentation officielle

- [Documentation API Carto](https://apicarto.ign.fr/api/doc/) - Documentation complète des API
- [Géoservices IGN](https://geoservices.ign.fr/api-carto) - Portail des géoservices
- [Model Context Protocol](https://modelcontextprotocol.io/) - Spécification MCP
- [Claude Desktop](https://claude.ai/download) - Application Claude Desktop

### Outils utiles

- [GeoJSON.io](http://geojson.io/) - Créer et visualiser des géométries GeoJSON
- [Projections EPSG](https://epsg.io/) - Informations sur les systèmes de projection
- [Géoportail](https://www.geoportail.gouv.fr/) - Visualiser les données IGN

### Communauté

- [Issues GitHub](https://github.com/votre-utilisateur/ign-apicarto-mcp-server/issues) - Reporter un bug ou suggérer une fonctionnalité
- [Discussions](https://github.com/votre-utilisateur/ign-apicarto-mcp-server/discussions) - Poser des questions

## Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

### Données IGN

Les données IGN sont soumises à la [Licence Ouverte v2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/).

---

**Développé avec ❤️ pour la communauté géospatiale française**
