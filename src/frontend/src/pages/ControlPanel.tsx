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
  Car,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  RefreshCw,
  Route,
  Settings,
  Siren,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  useAddVehicle,
  useApproveEmergencyRequest,
  useDetectAnomalies,
  useGetSignalConfigs,
  useRejectEmergencyRequest,
  useUpdateSignalConfig,
  useUpdateVehicleStatus,
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
import { EmergencyStatus, VehicleStatus, VehicleType } from "../types";

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

const VEHICLE_TYPE_COLORS: Record<VehicleType, string> = {
  [VehicleType.Ambulance]: "text-destructive",
  [VehicleType.FireTruck]: "text-orange-400",
  [VehicleType.Police]: "text-primary",
  [VehicleType.VIP]: "text-purple-400",
  [VehicleType.GeneralVehicle]: "text-muted-foreground",
};

const STATUS_BADGE: Record<VehicleStatus, string> = {
  [VehicleStatus.available]: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  [VehicleStatus.dispatched]:
    "bg-destructive/20 text-destructive border-destructive/30",
  [VehicleStatus.enRoute]: "bg-accent/20 text-accent border-accent/30",
  [VehicleStatus.offline]: "bg-muted text-muted-foreground border-border",
};

function formatTime(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ControlPanel({
  vehicles,
  trafficStats,
  emergencyRequests,
}: PanelProps) {
  const [addVehicleType, setAddVehicleType] = useState<VehicleType>(
    VehicleType.Ambulance,
  );
  const [junctionId, setJunctionId] = useState("");
  const [greenDur, setGreenDur] = useState("45");
  const [redDur, setRedDur] = useState("30");
  const [yellowDur, setYellowDur] = useState("5");

  const { mutate: addVehicle, isPending: addingVehicle } = useAddVehicle();
  const { mutate: updateStatus } = useUpdateVehicleStatus();
  const { mutate: updateSignal, isPending: updatingSignal } =
    useUpdateSignalConfig();
  const { mutate: detectAnomalies, isPending: detecting } =
    useDetectAnomalies();
  const { data: signalConfigs = [] } = useGetSignalConfigs();
  const { mutate: approveRequest, isPending: approving } =
    useApproveEmergencyRequest();
  const { mutate: rejectRequest, isPending: rejecting } =
    useRejectEmergencyRequest();

  const pendingRequests = emergencyRequests.filter(
    (r) => r.status === EmergencyStatus.pending,
  );
  const approvedRequests = emergencyRequests.filter(
    (r) => r.status === EmergencyStatus.approved,
  );

  function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault();
    addVehicle({
      vehicleType: addVehicleType,
      location: { lat: 40.7128, lng: -74.006 },
    });
  }

  function handleSignalUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!junctionId) return;
    updateSignal({
      junctionId,
      greenDurationSecs: BigInt(Number.parseInt(greenDur) || 45),
      redDurationSecs: BigInt(Number.parseInt(redDur) || 30),
      yellowDurationSecs: BigInt(Number.parseInt(yellowDur) || 5),
    });
  }

  const vehicleTypeCount = Object.values(VehicleType).map((t) => ({
    type: t,
    count: vehicles.filter((v) => v.vehicleType === t).length,
    available: vehicles.filter(
      (v) => v.vehicleType === t && v.status === VehicleStatus.available,
    ).length,
  }));

  return (
    <div className="p-4 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Total Vehicles",
            value: trafficStats?.totalVehicles?.toString() ?? "0",
          },
          {
            label: "Open Incidents",
            value: trafficStats?.openIncidents?.toString() ?? "0",
          },
          {
            label: "Avg Congestion",
            value: `${((trafficStats?.avgCongestion ?? 0) * 100).toFixed(0)}%`,
          },
          {
            label: "Pending Routes",
            value: pendingRequests.length.toString(),
          },
        ].map((s) => (
          <div key={s.label} className="data-panel rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="text-xl font-display font-bold text-foreground">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Pending Emergency Requests ── */}
      <div className="data-panel rounded-lg p-4">
        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Siren className="w-4 h-4 text-destructive" /> Pending Emergency
          Requests
          {pendingRequests.length > 0 && (
            <Badge className="ml-auto text-xs bg-destructive/20 text-destructive border-destructive/40 border">
              {pendingRequests.length} awaiting
            </Badge>
          )}
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="py-5 text-center" data-ocid="pending-requests-empty">
            <Clock className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No pending emergency requests
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pendingRequests.map((req) => (
              <div
                key={req.requestId.toString()}
                className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-2"
                data-ocid="pending-request-row"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-accent/10 text-accent border-accent/30 font-mono"
                    >
                      {req.vehicleId}
                    </Badge>
                    <span className="text-sm font-semibold text-foreground">
                      {req.vehicleType}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatTime(req.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2.5 border-chart-3/40 text-chart-3 hover:bg-chart-3/10"
                      onClick={() => approveRequest(req.requestId)}
                      disabled={approving || rejecting}
                      data-ocid="approve-request-btn"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                      onClick={() => rejectRequest(req.requestId)}
                      disabled={approving || rejecting}
                      data-ocid="reject-request-btn"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 shrink-0 text-destructive" />
                  <span className="truncate">{req.destination}</span>
                  <span className="font-mono text-[10px] ml-auto shrink-0">
                    {req.destinationLat.toFixed(3)},{" "}
                    {req.destinationLng.toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Approved Routes ── */}
      {approvedRequests.length > 0 && (
        <div className="data-panel rounded-lg p-4">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Route className="w-4 h-4 text-chart-3" /> Approved Routes
            <Badge variant="outline" className="ml-auto text-xs">
              {approvedRequests.length}
            </Badge>
          </h3>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {approvedRequests.map((req) => (
              <div
                key={req.requestId.toString()}
                className="flex items-center gap-3 px-3 py-2 rounded bg-background border border-chart-3/20"
                data-ocid="approved-route-row"
              >
                <CheckCircle className="w-3.5 h-3.5 text-chart-3 shrink-0" />
                <span className="text-xs font-mono text-muted-foreground">
                  {req.vehicleId}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {req.vehicleType}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  → {req.destination}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground ml-auto shrink-0">
                  {formatTime(req.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle fleet */}
      <div className="grid grid-cols-2 gap-4">
        <div className="data-panel rounded-lg p-4">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Car className="w-4 h-4 text-primary" /> Fleet Overview
          </h3>
          <div className="space-y-2">
            {vehicleTypeCount.map(({ type, count, available }) => (
              <div
                key={type}
                className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
              >
                <span
                  className={`text-sm font-medium ${VEHICLE_TYPE_COLORS[type]}`}
                >
                  {type}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-chart-3 font-mono">
                    {available}/{count}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {count}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add vehicle */}
        <div className="data-panel rounded-lg p-4">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Add Vehicle
          </h3>
          <form onSubmit={handleAddVehicle} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Vehicle Type</Label>
              <Select
                value={addVehicleType}
                onValueChange={(v) => setAddVehicleType(v as VehicleType)}
              >
                <SelectTrigger
                  className="bg-background h-8 text-sm"
                  data-ocid="add-vehicle-type"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(VehicleType).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full"
              size="sm"
              disabled={addingVehicle}
              data-ocid="add-vehicle-btn"
            >
              {addingVehicle ? "Adding..." : "Deploy Vehicle"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => detectAnomalies()}
              disabled={detecting}
              data-ocid="detect-anomalies-btn"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${detecting ? "animate-spin" : ""}`}
              />
              {detecting ? "Scanning..." : "Run Anomaly Detection"}
            </Button>
          </div>
        </div>
      </div>

      {/* Vehicle list */}
      <div className="data-panel rounded-lg p-4">
        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Active Fleet
          <Badge variant="outline" className="ml-auto text-xs">
            {vehicles.length}
          </Badge>
        </h3>
        {vehicles.length === 0 ? (
          <p
            className="text-sm text-muted-foreground text-center py-4"
            data-ocid="vehicles-empty"
          >
            No vehicles deployed
          </p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {vehicles.map((v) => (
              <div
                key={v.id.toString()}
                className="flex items-center gap-3 px-3 py-2 rounded bg-background border border-border"
                data-ocid="vehicle-row"
              >
                <span
                  className={`text-xs font-medium w-28 truncate ${VEHICLE_TYPE_COLORS[v.vehicleType]}`}
                >
                  {v.vehicleType}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${STATUS_BADGE[v.status]}`}
                >
                  {v.status}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono ml-auto">
                  {v.location.lat.toFixed(3)}, {v.location.lng.toFixed(3)}
                </span>
                <Select
                  value={v.status}
                  onValueChange={(val) =>
                    updateStatus({
                      id: v.id,
                      status: val as VehicleStatus,
                      incidentId: null,
                    })
                  }
                >
                  <SelectTrigger
                    className="h-6 text-xs w-28 bg-background"
                    data-ocid="vehicle-status-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(VehicleStatus).map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signal config */}
      <div className="data-panel rounded-lg p-4">
        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-accent" /> Traffic Signal
          Configuration
        </h3>
        <form onSubmit={handleSignalUpdate} className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Junction ID</Label>
            <Input
              value={junctionId}
              onChange={(e) => setJunctionId(e.target.value)}
              placeholder="JCT-BROADWAY-42"
              className="bg-background h-8 text-sm"
              data-ocid="signal-junction-id"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Green (sec)</Label>
            <Input
              value={greenDur}
              onChange={(e) => setGreenDur(e.target.value)}
              type="number"
              min="5"
              max="120"
              className="bg-background h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Red (sec)</Label>
            <Input
              value={redDur}
              onChange={(e) => setRedDur(e.target.value)}
              type="number"
              min="5"
              max="120"
              className="bg-background h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Yellow (sec)</Label>
            <Input
              value={yellowDur}
              onChange={(e) => setYellowDur(e.target.value)}
              type="number"
              min="2"
              max="15"
              className="bg-background h-8 text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              size="sm"
              className="w-full"
              disabled={updatingSignal || !junctionId}
              data-ocid="update-signal-btn"
            >
              {updatingSignal ? "Updating..." : "Update Signal"}
            </Button>
          </div>
        </form>

        {signalConfigs.length > 0 && (
          <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto">
            {signalConfigs.map((cfg) => (
              <div
                key={cfg.junctionId}
                className="flex items-center gap-3 text-xs px-2 py-1.5 rounded bg-background border border-border"
                data-ocid="signal-config-row"
              >
                <Zap className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="font-mono text-foreground">
                  {cfg.junctionId}
                </span>
                <span className="ml-auto text-muted-foreground font-mono">
                  G:{cfg.greenDurationSecs.toString()}s R:
                  {cfg.redDurationSecs.toString()}s
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
