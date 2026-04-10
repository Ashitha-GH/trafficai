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
  AlertTriangle,
  Car,
  CheckCircle,
  Clock,
  Flame,
  MapPin,
  Navigation,
  Phone,
  Route,
  Siren,
  Star,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  useResolveIncident,
  useSubmitEmergencyRequest,
} from "../hooks/useBackend";
import type {
  AnomalyPublic,
  EmergencyRequestPublic,
  GeoState,
  IncidentPublic,
  TrafficSegmentPublic,
  TrafficStats,
  VehiclePublic,
} from "../types";
import { EmergencyStatus, IncidentSeverity, VehicleType } from "../types";

interface PanelProps {
  vehicles: VehiclePublic[];
  incidents: IncidentPublic[];
  segments: TrafficSegmentPublic[];
  anomalies: AnomalyPublic[];
  trafficStats: TrafficStats | null;
  geo: GeoState;
  emergencyRequests: EmergencyRequestPublic[];
  approvedRoutes: EmergencyRequestPublic[];
}

const SEVERITY_COLOR: Record<IncidentSeverity, string> = {
  [IncidentSeverity.critical]: "text-destructive",
  [IncidentSeverity.high]: "text-orange-400",
  [IncidentSeverity.medium]: "text-accent",
  [IncidentSeverity.low]: "text-chart-3",
};

const SEVERITY_BADGE: Record<IncidentSeverity, string> = {
  [IncidentSeverity.critical]:
    "bg-destructive/20 text-destructive border-destructive/40",
  [IncidentSeverity.high]:
    "bg-orange-500/20 text-orange-400 border-orange-500/40",
  [IncidentSeverity.medium]: "bg-accent/20 text-accent border-accent/40",
  [IncidentSeverity.low]: "bg-chart-3/20 text-chart-3 border-chart-3/40",
};

const VEHICLE_OPTIONS: {
  value: VehicleType;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: VehicleType.Ambulance,
    label: "Ambulance",
    icon: <Car className="w-4 h-4 text-destructive" />,
    description: "Medical emergency response",
  },
  {
    value: VehicleType.FireTruck,
    label: "Fire Truck",
    icon: <Flame className="w-4 h-4 text-orange-400" />,
    description: "Fire & rescue operations",
  },
  {
    value: VehicleType.VIP,
    label: "VIP",
    icon: <Star className="w-4 h-4 text-accent" />,
    description: "VIP / dignitary convoy",
  },
];

const STATUS_CONFIG: Record<
  EmergencyStatus,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  [EmergencyStatus.pending]: {
    label: "Pending",
    cls: "bg-accent/20 text-accent border-accent/40",
    icon: <Clock className="w-3 h-3" />,
  },
  [EmergencyStatus.approved]: {
    label: "Approved",
    cls: "bg-chart-3/20 text-chart-3 border-chart-3/40",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  [EmergencyStatus.rejected]: {
    label: "Rejected",
    cls: "bg-destructive/20 text-destructive border-destructive/40",
    icon: <XCircle className="w-3 h-3" />,
  },
};

function formatTime(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Amber request-sent notification ──────────────────────────────────────────
interface RequestSentBannerProps {
  vehicleType: string;
  vehicleId: string;
  destination: string;
  onDismiss: () => void;
}

function RequestSentBanner({
  vehicleType,
  vehicleId,
  destination,
  onDismiss,
}: RequestSentBannerProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 8000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="rounded-xl border-2 border-accent/60 bg-accent/10 backdrop-blur-sm overflow-hidden animate-in slide-in-from-top-2 duration-300"
      data-ocid="request-sent-banner"
    >
      <div className="flex items-center gap-3 px-4 py-2.5 bg-accent/15 border-b border-accent/30">
        <div className="relative shrink-0">
          <div className="w-3 h-3 rounded-full bg-accent animate-ping absolute" />
          <div className="w-3 h-3 rounded-full bg-accent" />
        </div>
        <p className="font-mono text-xs font-bold text-accent uppercase tracking-widest flex-1">
          🚨 Emergency Route Requested!
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-accent/70 hover:text-accent transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-4 py-3 space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {vehicleType}{" "}
          <span className="font-mono text-xs text-muted-foreground">
            ({vehicleId})
          </span>{" "}
          → <span className="text-accent">{destination}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Waiting for Control Panel approval... You'll be notified when the
          route is activated.
        </p>
        <div className="pt-1 h-1 bg-accent/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full"
            style={{ animation: "shrink-width 8s linear forwards" }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Green approval modal for emergency vehicle ────────────────────────────────
interface ApprovalModalProps {
  request: EmergencyRequestPublic;
  onDismiss: () => void;
}

function ApprovalModal({ request, onDismiss }: ApprovalModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      data-ocid="route-approved-modal-overlay"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onDismiss}
        onKeyDown={(e) => e.key === "Escape" && onDismiss()}
        role="button"
        tabIndex={-1}
        aria-label="Close"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl border-2 border-chart-3/70 bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        style={{
          boxShadow:
            "0 0 60px rgba(34,197,94,0.25), 0 8px 32px rgba(0,0,0,0.6)",
        }}
        data-ocid="route-approved-modal"
      >
        {/* Green header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-chart-3/15 border-b border-chart-3/30">
          <div className="w-10 h-10 rounded-full bg-chart-3/20 border border-chart-3/40 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-chart-3" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-chart-3 text-base">
              Route Approved!
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Control Panel has cleared your path
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Route details */}
        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-background border border-border p-3">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                Vehicle
              </p>
              <p className="text-sm font-semibold text-foreground">
                {request.vehicleType}
              </p>
              <p className="text-xs font-mono text-chart-3">
                {request.vehicleId}
              </p>
            </div>
            <div className="rounded-lg bg-background border border-border p-3">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                Destination
              </p>
              <p className="text-sm font-medium text-foreground truncate">
                {request.destination}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                {request.destinationLat.toFixed(3)},{" "}
                {request.destinationLng.toFixed(3)}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-chart-3/30 bg-chart-3/5 px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-chart-3 shrink-0" />
              <p className="text-sm font-medium text-foreground">
                Emergency corridor is now active
              </p>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Your route is highlighted on the map in orange-red. All traffic
              dashboards have been notified. Proceed to your destination with
              priority clearance.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/5 border border-accent/20 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>
              Stay on the highlighted route. Drivers on your path have been
              alerted.
            </span>
          </div>
        </div>

        <div className="px-5 pb-4">
          <Button
            className="w-full bg-chart-3 hover:bg-chart-3/90 text-background font-semibold gap-2"
            onClick={onDismiss}
            data-ocid="route-approved-dismiss-btn"
          >
            <CheckCircle className="w-4 h-4" />
            Acknowledged — Begin Route
          </Button>
        </div>

        {/* Animated top glow bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-chart-3 to-transparent animate-pulse" />
      </div>
    </div>
  );
}

export function EmergenciesPanel({
  vehicles,
  incidents,
  trafficStats,
  geo,
  emergencyRequests,
}: PanelProps) {
  const [vehicleType, setVehicleType] = useState<VehicleType>(
    VehicleType.Ambulance,
  );
  const [vehicleId, setVehicleId] = useState("");
  const [destination, setDestination] = useState("");
  const [destLat, setDestLat] = useState("");
  const [destLng, setDestLng] = useState("");

  // Submitted request info for the amber banner
  const [sentRequest, setSentRequest] = useState<{
    vehicleType: string;
    vehicleId: string;
    destination: string;
  } | null>(null);

  // Track newly approved requests for the green modal
  const prevRequestsRef = useRef<Map<string, string>>(new Map());
  const [approvalQueue, setApprovalQueue] = useState<EmergencyRequestPublic[]>(
    [],
  );

  const { mutate: submitRequest, isPending } = useSubmitEmergencyRequest();
  const { mutate: resolveIncident } = useResolveIncident();

  // Detect new approvals
  useEffect(() => {
    const prev = prevRequestsRef.current;
    const newApprovals: EmergencyRequestPublic[] = [];

    for (const req of emergencyRequests) {
      const key = req.requestId.toString();
      if (
        req.status === EmergencyStatus.approved &&
        prev.get(key) !== EmergencyStatus.approved
      ) {
        newApprovals.push(req);
      }
    }

    const nextMap = new Map<string, string>();
    for (const req of emergencyRequests) {
      nextMap.set(req.requestId.toString(), req.status);
    }
    prevRequestsRef.current = nextMap;

    if (newApprovals.length > 0) {
      setApprovalQueue((q) => [...q, ...newApprovals]);
    }
  }, [emergencyRequests]);

  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const ambulances = vehicles.filter(
    (v) => v.vehicleType === VehicleType.Ambulance,
  );
  const selectedVehicle = VEHICLE_OPTIONS.find((v) => v.value === vehicleType);

  function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    const lat = Number.parseFloat(destLat) || geo.lat;
    const lng = Number.parseFloat(destLng) || geo.lng;
    const submittedVehicleId = vehicleId.trim() || "VEH-001";
    const submittedDest = destination.trim() || "City Hospital";
    submitRequest(
      {
        vehicleId: submittedVehicleId,
        vehicleType,
        destination: submittedDest,
        destinationLat: lat,
        destinationLng: lng,
      },
      {
        onSuccess: () => {
          setSentRequest({
            vehicleType,
            vehicleId: submittedVehicleId,
            destination: submittedDest,
          });
          setVehicleId("");
          setDestination("");
          setDestLat("");
          setDestLng("");
        },
      },
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Approval modal for this vehicle's route */}
      {approvalQueue.length > 0 && (
        <ApprovalModal
          request={approvalQueue[0]}
          onDismiss={() => setApprovalQueue((q) => q.slice(1))}
        />
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Open Incidents",
            value: trafficStats?.openIncidents?.toString() ?? "0",
            icon: <AlertTriangle className="w-4 h-4 text-destructive" />,
            cls: "status-red",
          },
          {
            label: "Ambulances",
            value: ambulances.length.toString(),
            icon: <Car className="w-4 h-4 text-destructive" />,
            cls: "status-red",
          },
          {
            label: "Avg Congestion",
            value: `${((trafficStats?.avgCongestion ?? 0) * 100).toFixed(0)}%`,
            icon: <Siren className="w-4 h-4 text-accent" />,
            cls: "status-amber",
          },
        ].map((stat) => (
          <div key={stat.label} className="data-panel rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <p className={`text-2xl font-display font-bold ${stat.cls}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Amber request-sent notification */}
      {sentRequest && (
        <RequestSentBanner
          vehicleType={sentRequest.vehicleType}
          vehicleId={sentRequest.vehicleId}
          destination={sentRequest.destination}
          onDismiss={() => setSentRequest(null)}
        />
      )}

      {/* Emergency request form */}
      <div className="data-panel rounded-lg p-4">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Phone className="w-4 h-4 text-destructive" /> Request Emergency Route
        </h3>

        <form onSubmit={handleRequest} className="space-y-3">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-3">
            <p className="text-xs font-mono text-destructive/80 uppercase tracking-wider flex items-center gap-1.5">
              <Siren className="w-3 h-3" /> Dispatch Details
            </p>

            {/* Vehicle Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Vehicle Type</Label>
              <Select
                value={vehicleType}
                onValueChange={(v) => setVehicleType(v as VehicleType)}
              >
                <SelectTrigger
                  className="bg-background h-9 text-sm"
                  data-ocid="emergency-vehicle-type"
                >
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      {selectedVehicle?.icon}
                      {selectedVehicle?.label}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        {opt.icon}
                        <span>
                          <span className="font-medium">{opt.label}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            — {opt.description}
                          </span>
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle ID — below Vehicle Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Car className="w-3 h-3" /> Vehicle ID
              </Label>
              <Input
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                placeholder="e.g. AMB-001, FT-007, VIP-03"
                className="bg-background text-sm h-9"
                data-ocid="emergency-vehicle-id"
              />
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Navigation className="w-3 h-3" /> Destination
              </Label>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter address or landmark (e.g. City Hospital)"
                className="bg-background text-sm h-9"
                data-ocid="emergency-destination"
              />
            </div>
          </div>

          {/* Destination coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Destination Lat</Label>
              <Input
                value={destLat}
                onChange={(e) => setDestLat(e.target.value)}
                className="bg-background text-sm h-8"
                placeholder={geo.lat.toFixed(4)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Destination Lng</Label>
              <Input
                value={destLng}
                onChange={(e) => setDestLng(e.target.value)}
                className="bg-background text-sm h-8"
                placeholder={geo.lng.toFixed(4)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !destination.trim()}
            variant="destructive"
            data-ocid="emergency-request-btn"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Send Request to Control Panel
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* My emergency requests */}
      {emergencyRequests.length > 0 && (
        <div className="data-panel rounded-lg p-4">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Siren className="w-4 h-4 text-accent" /> My Emergency Requests
            <Badge variant="outline" className="ml-auto text-xs">
              {emergencyRequests.length}
            </Badge>
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {emergencyRequests.map((req) => {
              const statusCfg = STATUS_CONFIG[req.status];
              return (
                <div
                  key={req.requestId.toString()}
                  className="flex items-start justify-between gap-3 p-3 rounded bg-background border border-border"
                  data-ocid="emergency-request-row"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">
                        {req.vehicleId}
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {req.vehicleType}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{req.destination}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {formatTime(req.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 flex items-center gap-1 ${statusCfg.cls}`}
                  >
                    {statusCfg.icon}
                    {statusCfg.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active incidents */}
      <div className="data-panel rounded-lg p-4">
        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" /> Active
          Incidents
          <Badge variant="outline" className="ml-auto text-xs">
            {activeIncidents.length}
          </Badge>
        </h3>
        {activeIncidents.length === 0 ? (
          <div className="py-6 text-center" data-ocid="incidents-empty">
            <CheckCircle className="w-8 h-8 text-chart-3 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active incidents</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activeIncidents.map((inc) => (
              <div
                key={inc.id.toString()}
                className="flex items-start justify-between gap-3 p-3 rounded bg-background border border-border"
                data-ocid="incident-row"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <MapPin
                    className={`w-4 h-4 shrink-0 mt-0.5 ${SEVERITY_COLOR[inc.severity]}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {inc.incidentType}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {inc.location.lat.toFixed(4)},{" "}
                      {inc.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${SEVERITY_BADGE[inc.severity]}`}
                  >
                    {inc.severity}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs px-2"
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
    </div>
  );
}
