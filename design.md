# NYC Transit App — Design Reference

Design system reference for the NYC & PATH Transit real-time schedule app, built with **Uber Base Web** (`baseui`).

---

## Design System

- **Library**: [Base Web (baseui)](https://baseweb.design/) v16
- **Styling Engine**: Styletron (`styletron-react` + `styletron-engine-monolithic`)
- **Theme**: `LightTheme` from `baseui`
- **Provider Setup**: `app/providers.tsx` — wraps app in `StyletronProvider` + `BaseProvider`

---

## Color Palette

### Brand Colors
| Token       | Value     | Usage                    |
|-------------|-----------|--------------------------|
| Black       | `#000000` | Header bg, active states, fastest badge |
| White       | `#FFFFFF` | Card bg, text on dark    |
| Gray-100    | `#F6F6F6` | Page background          |
| Gray-200    | `#EEEEEE` | Section headers          |
| Gray-300    | `#E2E2E2` | Borders, dividers, timeline line |
| Gray-400    | `#CCCCCC` | Timeline dots (subtle)   |
| Gray-500    | `#666666` | Secondary text, address pin icons |
| Gray-600    | `#545454` | Section header text, input labels |
| Gray-700    | `#999999` | Subtitle text            |
| Red         | `#E11900` | "NOW" arrival, errors    |
| Blue-Light  | `#E8F0FE` | PATH badge background    |
| Blue-Dark   | `#0039A6` | PATH badge text          |

### MTA Subway Route Colors (Official)
| Routes  | Background | Text    |
|---------|-----------|---------|
| 1, 2, 3 | `#EE352E` | `#FFFFFF` |
| 4, 5, 6 | `#00933C` | `#FFFFFF` |
| 7       | `#B933AD` | `#FFFFFF` |
| A, C, E | `#0039A6` | `#FFFFFF` |
| B, D, F, M | `#FF6319` | `#FFFFFF` |
| G       | `#6CBE45` | `#FFFFFF` |
| J, Z    | `#996633` | `#FFFFFF` |
| L       | `#A7A9AC` | `#FFFFFF` |
| N, Q, R, W | `#FCCC0A` | `#000000` |
| S       | `#808183` | `#FFFFFF` |

### PATH Route Colors
| Route     | Background | Text    |
|-----------|-----------|---------|
| NWK–WTC   | `#D93A30` | `#FFFFFF` |
| HOB–WTC   | `#4D92FB` | `#FFFFFF` |
| JSQ–33    | `#FF9900` | `#FFFFFF` |
| HOB–33    | `#65C100` | `#FFFFFF` |

---

## Typography

| Element          | Size   | Weight | Color     |
|------------------|--------|--------|-----------|
| App title        | 20px   | 700    | `#FFFFFF` |
| Subtitle         | 13px   | 400    | `#999999` |
| Tab label        | 14px   | 400/600| `#666666` / `#000000` |
| Section header   | 13px   | 700    | `#545454` |
| Input label      | 12px   | 600    | `#545454` |
| Station name     | 15px   | 600    | `#000000` |
| ETA (normal)     | 18px   | 700    | `#000000` |
| ETA (arriving)   | 16px   | 700    | `#E11900` |
| Route total time | 20px   | 700    | `#000000` |
| Timeline text    | 13px   | 400    | `#000000` / `#666666` |
| Distance info    | 12px   | 400    | `#666666` |
| Status text      | 12px   | 400    | `#E11900` |
| Updated text     | 12px   | 400    | `#666666` |
| Route badge      | 14px   | 700    | varies    |
| Fastest badge    | 11px   | 700    | `#FFFFFF` on `#000000` |

---

## Base Web Components Used

### `Tabs` + `Tab` (from `baseui/tabs-motion`)
- **Location**: `app/page.tsx`
- **Usage**: 3 main tabs (Near Me, Trip, Stations) + nested sub-tabs (NYC Subway, PATH) in Stations tab
- **Props**: `fill={FILL.fixed}`
- **Overrides**:
  - `TabList.style`: white bg, bottom border `#E2E2E2`
  - `TabHighlight.style`: black highlight bar
  - `Tab.style`: dynamic font weight/color based on `$isActive`

### `Select` (from `baseui/select`)
- **Locations**: `StationSearch`, `LocationInput`, `DestinationInput`
- **Props**: `type={TYPE.search}`, `filterOptions={(options) => options}` (disable internal filtering for async results)
- **Custom**: `getOptionLabel` renders inline `RouteTag` badges for station results, pin icons for address results
- **Overrides**:
  - `ControlContainer.style`: white bg, 2px border `#E2E2E2`, 8px border radius, min-height 44px

### `Button` (from `baseui/button`)
- **Location**: `LocationInput` (GPS button)
- **Props**: `kind={KIND.secondary}`, `size={SIZE.compact}`
- **Overrides**: 44px square, 8px border radius, black bg when active, gray when inactive

### `Spinner` (from `baseui/spinner`)
- **Locations**: `TrainList`, `NearbyArrivals`, `TripResults`, `LocationInput`
- **Props**: `$size={40}` (main), `$size={24}` (inline), `$size={16}` (button)

### `Notification` (from `baseui/notification`)
- **Locations**: `TrainList`, `NearbyArrivals`, `TripResults`
- **Variants**:
  - `KIND.negative` — API errors, geocoding failures
  - `KIND.info` — empty states, prompts ("Select a station", "Enter a destination", "No routes found")
  - `KIND.warning` — location denied
- **Props**: `closeable={false}`

### `useStyletron` hook (from `baseui`)
- **Used in**: All components for inline CSS-in-JS styling
- **Pattern**: `const [css] = useStyletron()` then `className={css({...})}`

---

## Custom Components

### `RouteTag` (`components/RouteTag.tsx`)
- Circular badge showing subway/PATH route letter
- Props: `route`, `color?`, `textColor?`, `size?: "small" | "default" | "large"`
- Sizes: small (22px), default (28px), large (36px)

### `ArrivalCard` (`components/ArrivalCard.tsx`)
- Single arrival row: RouteTag | destination | ETA
- Left colored border using route color
- "NOW" displayed in red for trains arriving within 1 minute

### `TrainList` (`components/TrainList.tsx`)
- Groups arrivals by direction (Uptown/Downtown or To NY/To NJ)
- Max 8 arrivals per direction
- Shows loading spinner, error notifications, empty states, "Updated Xs ago"

### `StationSearch` (`components/StationSearch.tsx`)
- Wraps baseui `Select` with station typeahead
- Subway mode: fetches stations from API, renders route badges
- PATH mode: uses static station list

### `SubwayRouteFilter` (`components/SubwayRouteFilter.tsx`)
- Horizontal scrollable row of route circle buttons
- Grouped by color family, "All" pill button
- Selected route: black ring + box-shadow outline

### `LocationInput` (`components/LocationInput.tsx`)
- GPS button (left) + address search Select (right)
- GPS button: 44px square, location crosshair icon, black when location active
- Address search: Nominatim geocoding with async dropdown
- Props: `onLocationSet`, `geoLocation`, `geoLoading`, `geoError`, `onRequestGeo`, `label`, `value`

### `DestinationInput` (`components/DestinationInput.tsx`)
- Combined station + address search
- Instant station matching (client-side filter from stations.json + PATH)
- Debounced geocoding (500ms) for address results
- Station results: name + RouteTag badges
- Address results: pin icon + geocoded name
- Props: `onDestinationSet(coords, nearbyStations, displayName)`

### `NearbyArrivals` (`components/NearbyArrivals.tsx`)
- Shows arrivals from 3 nearest stations (subway + PATH combined)
- Each station section: header (name, route badges, distance, walk time) + arrival cards
- Auto-refresh every 30s
- PATH stations show blue "PATH" badge

### `RouteOptionCard` (`components/RouteOptionCard.tsx`)
- Vertical timeline card for a single route option
- Header: total time + "Fastest" badge (first option) + route badges
- Timeline: walk → board (RouteTag + station name) → ride (stops + time) → exit → transfer → walk
- Visual: 2px left border line, 8px dots (black for stops, gray for walks), 12px border radius
- Fastest card: 4px black left border + subtle box shadow

### `TripResults` (`components/TripResults.tsx`)
- Container for route options list
- Shows count header ("5 routes found"), loading spinner, error/empty notifications

---

## Layout

### Page Structure (3-tab)
```
[Header — sticky, black, z-index:10]
[Tabs — Near Me | Trip | Stations]

Tab "Near Me":
  [LocationInput — GPS button + address]
  [NearbyArrivals — 3 nearest stations with live arrivals]

Tab "Trip":
  [LocationInput — "From" field]
  [DestinationInput — "Where to?" field]
  [TripResults — ranked route options]

Tab "Stations":
  [Sub-tabs — NYC Subway | PATH]
  [Route Filter — horizontal scroll (subway only)]
  [Station Search — baseui Select]
  [Train List — grouped arrival cards]
```

### Responsive
- Max width: `600px` centered on desktop
- Full width on mobile
- Single column layout throughout
- Touch targets: 32px+ for route buttons, 44px+ for inputs and list items
- Sticky header stays visible on scroll

### Spacing
- Header padding: `16px 16px 12px`
- Input areas padding: `0 16px`
- Input labels: `12px` font, `6px` bottom margin, uppercase, `0.5px` letter spacing
- Route filter padding: `12px 16px`
- Arrival card padding: `12px 16px`
- Section header padding: `8px 16px` or `10px 16px`
- Route option card: `16px` padding, `12px` border radius, `8px` bottom margin
- Timeline: `12px` left padding, `-19px` margin-left for dot alignment
- Card left border: `4px solid {routeColor}` (arrivals) or `4px solid #000` (fastest route)

---

## Data Flow

### Near Me Flow
1. User taps GPS button or enters address → `useGeolocation` or `/api/geocode`
2. `useNearbyStations` computes 5 nearest stations via Haversine formula
3. `NearbyArrivals` fetches arrivals from `/api/subway/nearby-arrivals` (batch) and `/api/path/realtime`
4. Displays 3 nearest stations with distance, walk time, and live arrivals
5. Auto-refresh every 30s

### Trip Planning Flow
1. User sets origin (GPS or address) → `findNearbyStations()` finds 3 nearest origin stations
2. User sets destination (station or address) → `findNearbyStations()` finds 3 nearest dest stations
3. `useRoutePlanner` loads `route-graph.json`, runs `findRouteOptions()`
4. Router checks direct routes, one-transfer routes, and cross-system transfers
5. Results ranked by `totalEstimatedMinutes` = walk + ride (stops × 2 min) + transfer (5 min) + walk
6. Top 5 options displayed as `RouteOptionCard` timeline cards

### Station Browser Flow (existing)
1. User selects station via `StationSearch` (baseui Select)
2. `useArrivals` hook fetches from Next.js API route
3. `TrainList` groups by direction and renders `ArrivalCard` rows
4. Auto-refresh: API re-fetch every 30s, countdown update every 15s

---

## API Endpoints

| Endpoint | Source | Format | Cache |
|----------|--------|--------|-------|
| `/api/subway/stations` | Static JSON | JSON | 1 hour |
| `/api/subway/arrivals?station={id}` | MTA GTFS-RT | Protobuf → JSON | 15s |
| `/api/subway/nearby-arrivals?stations={ids}` | MTA GTFS-RT | Protobuf → JSON | 15s |
| `/api/path/stations` | Static constants | JSON | 1 hour |
| `/api/path/realtime?station={slug}` | path.api.razza.dev | JSON | 15s |
| `/api/geocode?q={query}` | Nominatim (OSM) | JSON | 1 hour |

---

## Pre-computed Data

| File | Source | Content |
|------|--------|---------|
| `lib/data/stations.json` | MTA GTFS static | 496 subway stations with stopId, name, routes, lat, lon |
| `lib/data/route-graph.json` | MTA GTFS static | Ordered stop sequences per route per direction (N/S) |
| `lib/constants.ts` | Hardcoded | PATH stations (13) with lat/lon, PATH route graph (4 routes), cross-system transfers (9 pairs) |

---

## Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useArrivals` | `lib/hooks/useArrivals.ts` | Fetch arrivals for a single station, 30s auto-refresh, 15s countdown |
| `useGeolocation` | `lib/hooks/useGeolocation.ts` | Browser Geolocation API wrapper, permission state tracking |
| `useNearbyStations` | `lib/hooks/useNearbyStations.ts` | Compute nearest stations from coordinates via Haversine |
| `useRoutePlanner` | `lib/hooks/useRoutePlanner.ts` | Find and rank route options between origin and destination |
