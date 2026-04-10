import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  AlertTriangle,
  BarChart2,
  CheckCircle,
  Cloud,
  Construction,
  MapPin,
  Music,
  ShieldCheck,
  Trash2,
  XOctagon,
} from "lucide-react";
import { useState } from "react";
import { useResolveIncident, useUpdateIncident } from "../hooks/useBackend";
import type {
  AnomalyPublic,
  ConstructionZone,
  EdgeCases,
  EmergencyRequestPublic,
  GeoState,
  IncidentPublic,
  RoadClosure,
  SpecialEvent,
  TrafficSegmentPublic,
  TrafficStats,
  VehiclePublic,
  WeatherCondition,
} from "../types";
import { CongestionLevel, IncidentSeverity, IncidentStatus } from "../types";

interface PanelProps {
  vehicles: VehiclePublic[];
  incidents: IncidentPublic[];
  segments: TrafficSegmentPublic[];
  anomalies: AnomalyPublic[];
  trafficStats: TrafficStats | null;
  geo: GeoState;
  emergencyRequests: EmergencyRequestPublic[];
  approvedRoutes: EmergencyRequestPublic[];
  edgeCases: EdgeCases;
  onEdgeCasesChange: (cases: EdgeCases) => void;
}

const CONGESTION_BADGE: Record<CongestionLevel, string> = {
  [CongestionLevel.free]: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  [CongestionLevel.moderate]: "bg-accent/20 text-accent border-accent/30",
  [CongestionLevel.heavy]:
    "bg-orange-500/20 text-orange-400 border-orange-500/30",
  [CongestionLevel.blocked]:
    "bg-destructive/20 text-destructive border-destructive/30",
};

const WEATHER_OPTIONS: {
  value: WeatherCondition;
  emoji: string;
  label: string;
  effect: string;
}[] = [
  { value: "Clear", emoji: "☀️", label: "Clear", effect: "Normal traffic flow" },
  { value: "Rain", emoji: "🌧️", label: "Rain", effect: "+15% travel time" },
  {
    value: "Fog",
    emoji: "🌫️",
    label: "Fog",
    effect: "+25% travel time, reduced visibility",
  },
  {
    value: "Snow",
    emoji: "❄️",
    label: "Snow",
    effect: "+40% travel time, slippery roads",
  },
  {
    value: "Ice",
    emoji: "🧊",
    label: "Ice",
    effect: "+60% travel time, high accident risk",
  },
];

const SEVERITY_OPTIONS = ["minor", "moderate", "major"] as const;

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Construction Zone Form ────────────────────────────────────────────────────
interface ConstructionFormProps {
  geo: GeoState;
  onAdd: (zone: ConstructionZone) => void;
}

function ConstructionForm({ geo, onAdd }: ConstructionFormProps) {
  const [streetName, setStreetName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [affectedLanes, setAffectedLanes] = useState("1");
  const [severity, setSeverity] =
    useState<ConstructionZone["severity"]>("moderate");
  const [lat, setLat] = useState(geo.lat.toFixed(4));
  const [lng, setLng] = useState(geo.lng.toFixed(4));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!streetName.trim()) return;
    onAdd({
      id: genId(),
      streetName: streetName.trim(),
      startDate,
      endDate,
      affectedLanes: Number.parseInt(affectedLanes) || 1,
      severity,
      lat: Number.parseFloat(lat) || geo.lat,
      lng: Number.parseFloat(lng) || geo.lng,
    });
    setStreetName("");
    setStartDate("");
    setEndDate("");
    setAffectedLanes("1");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Street Name *</Label>
          <Input
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            placeholder="e.g. Broadway Ave, 5th St"
            className="bg-background h-8 text-xs"
            data-ocid="construction-street-name"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">End Date</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Affected Lanes</Label>
          <Input
            type="number"
            min="1"
            max="4"
            value={affectedLanes}
            onChange={(e) => setAffectedLanes(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Severity</Label>
          <Select
            value={severity}
            onValueChange={(v) =>
              setSeverity(v as ConstructionZone["severity"])
            }
          >
            <SelectTrigger
              className="bg-background h-8 text-xs"
              data-ocid="construction-severity"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Lat</Label>
          <Input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Lng</Label>
          <Input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
      </div>
      <Button
        type="submit"
        size="sm"
        className="w-full gap-2"
        disabled={!streetName.trim()}
        data-ocid="add-construction-btn"
      >
        <Construction className="w-3.5 h-3.5" />
        Add Construction Zone
      </Button>
    </form>
  );
}

// ── Special Event Form ────────────────────────────────────────────────────────
interface EventFormProps {
  geo: GeoState;
  onAdd: (evt: SpecialEvent) => void;
}

function EventForm({ geo, onAdd }: EventFormProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [attendance, setAttendance] = useState("5000");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [lat, setLat] = useState(geo.lat.toFixed(4));
  const [lng, setLng] = useState(geo.lng.toFixed(4));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: genId(),
      name: name.trim(),
      location: location.trim() || "City Center",
      expectedAttendance: Number.parseInt(attendance) || 5000,
      startTime,
      endTime,
      lat: Number.parseFloat(lat) || geo.lat,
      lng: Number.parseFloat(lng) || geo.lng,
    });
    setName("");
    setLocation("");
    setAttendance("5000");
    setStartTime("");
    setEndTime("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Event Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. NY Marathon, Rock Concert, NFL Game"
            className="bg-background h-8 text-xs"
            data-ocid="event-name-input"
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Event Location</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Madison Square Garden, Central Park..."
            className="bg-background h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Expected Attendance</Label>
          <Input
            type="number"
            value={attendance}
            onChange={(e) => setAttendance(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
        <div className="space-y-1" />
        <div className="space-y-1">
          <Label className="text-xs">Start Time</Label>
          <Input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">End Time</Label>
          <Input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Lat</Label>
          <Input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Lng</Label>
          <Input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
      </div>
      <Button
        type="submit"
        size="sm"
        className="w-full gap-2"
        disabled={!name.trim()}
        data-ocid="add-event-btn"
      >
        <Music className="w-3.5 h-3.5" />
        Add Special Event
      </Button>
    </form>
  );
}

// ── Road Closure Form ─────────────────────────────────────────────────────────
interface ClosureFormProps {
  geo: GeoState;
  onAdd: (closure: RoadClosure) => void;
}

function ClosureForm({ geo, onAdd }: ClosureFormProps) {
  const [roadName, setRoadName] = useState("");
  const [reason, setReason] = useState("");
  const [reopening, setReopening] = useState("");
  const [lat, setLat] = useState(geo.lat.toFixed(4));
  const [lng, setLng] = useState(geo.lng.toFixed(4));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roadName.trim()) return;
    onAdd({
      id: genId(),
      roadName: roadName.trim(),
      reason: reason.trim() || "Under investigation",
      expectedReopening: reopening,
      lat: Number.parseFloat(lat) || geo.lat,
      lng: Number.parseFloat(lng) || geo.lng,
    });
    setRoadName("");
    setReason("");
    setReopening("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Road Name *</Label>
          <Input
            value={roadName}
            onChange={(e) => setRoadName(e.target.value)}
            placeholder="e.g. Main St, Highway 101"
            className="bg-background h-8 text-xs"
            data-ocid="closure-road-name"
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Reason for Closure</Label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Accident, flooding, maintenance..."
            className="bg-background h-8 text-xs"
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Expected Reopening</Label>
          <Input
            type="datetime-local"
            value={reopening}
            onChange={(e) => setReopening(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Lat</Label>
          <Input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Lng</Label>
          <Input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="bg-background h-8 text-xs"
          />
        </div>
      </div>
      <Button
        type="submit"
        size="sm"
        variant="destructive"
        className="w-full gap-2"
        disabled={!roadName.trim()}
        data-ocid="add-closure-btn"
      >
        <XOctagon className="w-3.5 h-3.5" />
        Mark Road as Closed
      </Button>
    </form>
  );
}

const SEVERITY_BADGE_MAP: Record<ConstructionZone["severity"], string> = {
  minor: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  moderate: "bg-accent/20 text-accent border-accent/30",
  major: "bg-destructive/20 text-destructive border-destructive/30",
};

export function TrafficPolicePanel({
  incidents,
  segments,
  anomalies,
  approvedRoutes,
  geo,
  edgeCases,
  onEdgeCasesChange,
}: PanelProps) {
  const { mutate: resolveIncident } = useResolveIncident();
  const { mutate: updateIncident } = useUpdateIncident();

  const openIncidents = incidents.filter(
    (i) => i.status === IncidentStatus.open,
  );
  const assignedIncidents = incidents.filter(
    (i) => i.status === IncidentStatus.assigned,
  );
  const heavySegments = segments.filter(
    (s) =>
      s.congestionLevel === CongestionLevel.heavy ||
      s.congestionLevel === CongestionLevel.blocked,
  );

  const currentWeather =
    WEATHER_OPTIONS.find((w) => w.value === edgeCases.weather) ??
    WEATHER_OPTIONS[0];

  function removeConstruction(id: string) {
    onEdgeCasesChange({
      ...edgeCases,
      constructionZones: edgeCases.constructionZones.filter((z) => z.id !== id),
    });
  }
  function removeEvent(id: string) {
    onEdgeCasesChange({
      ...edgeCases,
      specialEvents: edgeCases.specialEvents.filter((e) => e.id !== id),
    });
  }
  function removeClosure(id: string) {
    onEdgeCasesChange({
      ...edgeCases,
      roadClosures: edgeCases.roadClosures.filter((c) => c.id !== id),
    });
  }

  return (
    <div className="p-4 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Open", value: openIncidents.length, cls: "status-red" },
          {
            label: "Assigned",
            value: assignedIncidents.length,
            cls: "status-amber",
          },
          {
            label: "Heavy Segments",
            value: heavySegments.length,
            cls: "status-amber",
          },
          {
            label: "Emerg. Routes",
            value: approvedRoutes.length,
            cls: approvedRoutes.length > 0 ? "status-red" : "status-amber",
          },
        ].map((s) => (
          <div key={s.label} className="data-panel rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-display font-bold ${s.cls}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Incident management */}
      <div className="grid grid-cols-2 gap-4">
        <div className="data-panel rounded-lg p-4">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" /> Open
            Incidents
            <Badge variant="outline" className="ml-auto text-xs">
              {openIncidents.length}
            </Badge>
          </h3>
          {openIncidents.length === 0 ? (
            <div className="py-6 text-center" data-ocid="open-incidents-empty">
              <CheckCircle className="w-7 h-7 text-chart-3 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">All clear</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {openIncidents.map((inc) => (
                <div
                  key={inc.id.toString()}
                  className="p-2.5 rounded bg-background border border-border space-y-2"
                  data-ocid="open-incident-row"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-destructive shrink-0" />
                    <span className="text-xs font-medium text-foreground flex-1 truncate">
                      {inc.incidentType}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {inc.severity}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-6 text-xs"
                      onClick={() =>
                        updateIncident({
                          id: inc.id,
                          severity: null,
                          status: IncidentStatus.assigned,
                          assignedVehicleIds: null,
                        })
                      }
                      data-ocid="assign-incident-btn"
                    >
                      Assign
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-6 text-xs text-chart-3 border-chart-3/30"
                      onClick={() => resolveIncident(inc.id)}
                      data-ocid="resolve-incident-btn"
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="data-panel rounded-lg p-4">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Road Segments
            <Badge variant="outline" className="ml-auto text-xs">
              {segments.length}
            </Badge>
          </h3>
          {segments.length === 0 ? (
            <p
              className="text-xs text-muted-foreground text-center py-6"
              data-ocid="segments-empty"
            >
              No segment data
            </p>
          ) : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {segments.map((seg) => (
                <div
                  key={seg.id.toString()}
                  className="flex items-center gap-2 px-2 py-1.5 rounded bg-background border border-border"
                  data-ocid="segment-row"
                >
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${CONGESTION_BADGE[seg.congestionLevel]}`}
                  >
                    {seg.congestionLevel}
                  </Badge>
                  <p className="text-xs font-mono text-muted-foreground truncate flex-1">
                    {seg.startLat.toFixed(3)}→{seg.endLat.toFixed(3)}
                  </p>
                  <span className="text-xs text-foreground font-mono shrink-0">
                    {seg.averageSpeedKmh.toFixed(0)} km/h
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Anomalies */}
      <div className="data-panel rounded-lg p-4">
        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-accent" /> Detected Anomalies
          <Badge variant="outline" className="ml-auto text-xs">
            {anomalies.length}
          </Badge>
        </h3>
        {anomalies.length === 0 ? (
          <div className="py-4 text-center" data-ocid="anomalies-empty">
            <ShieldCheck className="w-8 h-8 text-chart-3 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No anomalies detected
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {anomalies.map((a) => (
              <div
                key={a.id.toString()}
                className="flex items-start gap-3 p-2.5 rounded bg-background border border-border"
                data-ocid="anomaly-row"
              >
                <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    {a.anomalyType}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {a.description}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {a.severity}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════
          EDGE CASES & SPECIAL CONDITIONS
          ════════════════════════════════════════════════ */}
      <div className="data-panel rounded-lg p-4 border-l-4 border-accent">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-accent" />
          Edge Cases &amp; Special Conditions
          <Badge className="ml-auto text-[10px] bg-accent/20 text-accent border-accent/40 border">
            {edgeCases.constructionZones.length +
              edgeCases.specialEvents.length +
              edgeCases.roadClosures.length}{" "}
            active
          </Badge>
        </h3>

        <div className="space-y-5">
          {/* Weather Condition */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <Cloud className="w-3.5 h-3.5 text-primary" /> Weather Condition
            </h4>
            <div className="flex flex-wrap gap-2">
              {WEATHER_OPTIONS.map((w) => (
                <button
                  key={w.value}
                  type="button"
                  onClick={() =>
                    onEdgeCasesChange({ ...edgeCases, weather: w.value })
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-smooth ${
                    edgeCases.weather === w.value
                      ? "bg-primary/20 border-primary/60 text-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                  data-ocid={`weather-${w.value.toLowerCase()}`}
                >
                  <span>{w.emoji}</span>
                  {w.label}
                </button>
              ))}
            </div>
            {edgeCases.weather !== "Clear" && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                <span className="text-primary">⚡</span>
                {currentWeather.effect} — Traffic predictions have been adjusted
              </div>
            )}
          </div>

          {/* Road Construction Zones */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <Construction className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-orange-400">Road Construction Zones</span>
              <Badge
                variant="outline"
                className="ml-auto text-[10px] bg-orange-500/10 text-orange-400 border-orange-500/30"
              >
                {edgeCases.constructionZones.length}
              </Badge>
            </h4>
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
              <ConstructionForm
                geo={geo}
                onAdd={(zone) =>
                  onEdgeCasesChange({
                    ...edgeCases,
                    constructionZones: [...edgeCases.constructionZones, zone],
                  })
                }
              />
            </div>
            {edgeCases.constructionZones.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {edgeCases.constructionZones.map((zone) => (
                  <div
                    key={zone.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-orange-500/20"
                    data-ocid="construction-zone-row"
                  >
                    <span className="text-base leading-none">🔶</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {zone.streetName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {zone.affectedLanes} lane
                        {zone.affectedLanes !== 1 ? "s" : ""} ·{" "}
                        {zone.startDate || "—"} → {zone.endDate || "—"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize shrink-0 ${SEVERITY_BADGE_MAP[zone.severity]}`}
                    >
                      {zone.severity}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => removeConstruction(zone.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove construction zone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Special Events */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-400">Special Events</span>
              <Badge
                variant="outline"
                className="ml-auto text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30"
              >
                {edgeCases.specialEvents.length}
              </Badge>
            </h4>
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
              <EventForm
                geo={geo}
                onAdd={(evt) =>
                  onEdgeCasesChange({
                    ...edgeCases,
                    specialEvents: [...edgeCases.specialEvents, evt],
                  })
                }
              />
            </div>
            {edgeCases.specialEvents.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {edgeCases.specialEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-purple-500/20"
                    data-ocid="event-row"
                  >
                    <span className="text-base leading-none">★</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {evt.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {evt.location} ·{" "}
                        {evt.expectedAttendance.toLocaleString()} expected
                      </p>
                    </div>
                    <span className="text-[10px] text-purple-400 font-mono shrink-0">
                      {evt.startTime
                        ? new Date(evt.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEvent(evt.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Road Closures */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <XOctagon className="w-3.5 h-3.5 text-destructive" />
              <span className="text-destructive">Road Closures</span>
              <Badge
                variant="outline"
                className="ml-auto text-[10px] bg-destructive/10 text-destructive border-destructive/30"
              >
                {edgeCases.roadClosures.length}
              </Badge>
            </h4>
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <ClosureForm
                geo={geo}
                onAdd={(closure) =>
                  onEdgeCasesChange({
                    ...edgeCases,
                    roadClosures: [...edgeCases.roadClosures, closure],
                  })
                }
              />
            </div>
            {edgeCases.roadClosures.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {edgeCases.roadClosures.map((closure) => (
                  <div
                    key={closure.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-destructive/20"
                    data-ocid="closure-row"
                  >
                    <span className="text-base leading-none">✕</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {closure.roadName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {closure.reason}
                      </p>
                    </div>
                    {closure.expectedReopening && (
                      <span className="text-[10px] text-destructive font-mono shrink-0">
                        Reopens:{" "}
                        {new Date(
                          closure.expectedReopening,
                        ).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeClosure(closure.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove closure"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
