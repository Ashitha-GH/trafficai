import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertTriangle,
  BarChart2,
  CheckCircle,
  Clock,
  MapPin,
  Navigation,
  User,
} from "lucide-react";
import { useState } from "react";
import { useGetUserProfile, useRequestRoute } from "../hooks/useBackend";
import type {
  AnomalyPublic,
  EmergencyRequestPublic,
  GeoState,
  IncidentPublic,
  TrafficSegmentPublic,
  TrafficStats,
  VehiclePublic,
} from "../types";
import { RoutePriority } from "../types";
import type { RouteResult } from "../types";

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

export function UserPanel({
  incidents,
  segments,
  trafficStats,
  geo,
  approvedRoutes,
}: PanelProps) {
  const [destLat, setDestLat] = useState("");
  const [destLng, setDestLng] = useState("");
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);

  const { identity } = useInternetIdentity();
  const { data: profile } = useGetUserProfile();
  const { mutate: requestRoute, isPending } = useRequestRoute();

  function handleRoute(e: React.FormEvent) {
    e.preventDefault();
    if (!identity) return;
    const dLat = Number.parseFloat(destLat) || geo.lat + 0.02;
    const dLng = Number.parseFloat(destLng) || geo.lng + 0.02;
    requestRoute(
      {
        originLat: geo.lat,
        originLng: geo.lng,
        destLat: dLat,
        destLng: dLng,
        priority: RoutePriority.normal,
        requesterId: identity.getPrincipal(),
        vehicleId: BigInt(0),
      },
      { onSuccess: (result) => setRouteResult(result) },
    );
  }

  const nearbyIncidents = incidents.filter((i) => {
    const dlat = Math.abs(i.location.lat - geo.lat);
    const dlng = Math.abs(i.location.lng - geo.lng);
    return dlat < 0.1 && dlng < 0.1;
  });

  return (
    <div className="p-4 space-y-4">
      {/* Active emergency routes banner */}
      {approvedRoutes.length > 0 && (
        <div
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 flex items-start gap-3"
          data-ocid="active-emergency-banner"
        >
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5 animate-pulse" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-destructive">
              {approvedRoutes.length} Active Emergency Route
              {approvedRoutes.length > 1 ? "s" : ""}
            </p>
            {approvedRoutes.map((r) => (
              <p
                key={r.requestId.toString()}
                className="text-xs text-muted-foreground truncate"
              >
                🚨 {r.vehicleType} ({r.vehicleId}) → {r.destination}
              </p>
            ))}
            <p className="text-xs text-muted-foreground mt-1">
              Please yield to emergency vehicles and pull to the side.
            </p>
          </div>
        </div>
      )}
      {/* User profile */}
      <div className="data-panel rounded-lg p-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">Your Account</p>
            {profile && (
              <Badge variant="outline" className="text-[10px] font-mono">
                {profile.role}
              </Badge>
            )}
            {profile && (
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  profile.registrationStatus === "approved"
                    ? "border-chart-3/40 text-chart-3"
                    : "border-accent/40 text-accent"
                }`}
              >
                {profile.registrationStatus}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {identity?.getPrincipal().toText().slice(0, 20)}...
          </p>
          {profile?.email && (
            <p className="text-xs text-muted-foreground">{profile.email}</p>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="data-panel rounded-lg p-4">
        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" /> Your Location
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background rounded border border-border px-3 py-2">
            <p className="text-xs text-muted-foreground">Latitude</p>
            <p className="text-sm font-mono text-foreground">
              {geo.lat.toFixed(6)}
            </p>
          </div>
          <div className="bg-background rounded border border-border px-3 py-2">
            <p className="text-xs text-muted-foreground">Longitude</p>
            <p className="text-sm font-mono text-foreground">
              {geo.lng.toFixed(6)}
            </p>
          </div>
        </div>
        {geo.error && (
          <p className="text-xs text-accent mt-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {geo.error}
          </p>
        )}
      </div>

      {/* Route planner */}
      <div className="data-panel rounded-lg p-4">
        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" /> Route Planner
        </h3>
        <form onSubmit={handleRoute} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Destination Lat</Label>
              <Input
                value={destLat}
                onChange={(e) => setDestLat(e.target.value)}
                placeholder={`${(geo.lat + 0.02).toFixed(4)}`}
                className="bg-background h-8 text-sm"
                data-ocid="route-dest-lat"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Destination Lng</Label>
              <Input
                value={destLng}
                onChange={(e) => setDestLng(e.target.value)}
                placeholder={`${(geo.lng + 0.02).toFixed(4)}`}
                className="bg-background h-8 text-sm"
                data-ocid="route-dest-lng"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
            data-ocid="request-route-btn"
          >
            {isPending ? "Calculating route..." : "Get Optimal Route"}
          </Button>
        </form>

        {routeResult && (
          <div
            className="mt-4 p-3 rounded bg-background border border-primary/30 space-y-2"
            data-ocid="route-result"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-chart-3" />
              <span className="text-sm font-medium text-foreground">
                Route Found
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />{" "}
                {routeResult.estimatedTimeMinutes.toFixed(0)} min
              </span>
              <span>{routeResult.segments.length} waypoints</span>
            </div>
            {routeResult.congestionWarnings.length > 0 && (
              <div className="space-y-1">
                {routeResult.congestionWarnings.map((w) => (
                  <p
                    key={w}
                    className="text-xs text-accent flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {w}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* System stats */}
      <div className="data-panel rounded-lg p-4">
        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" /> City Traffic Overview
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Total Vehicles",
              value: trafficStats?.totalVehicles?.toString() ?? "—",
            },
            {
              label: "Active Incidents",
              value: trafficStats?.openIncidents?.toString() ?? "—",
            },
            {
              label: "Avg Congestion",
              value: `${((trafficStats?.avgCongestion ?? 0) * 100).toFixed(0)}%`,
            },
            { label: "Road Segments", value: segments.length.toString() },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-background rounded border border-border p-2.5"
            >
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-display font-bold text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {trafficStats?.topAnomalies && trafficStats.topAnomalies.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">
              Top Anomalies
            </p>
            {trafficStats.topAnomalies.map((a) => (
              <div
                key={a}
                className="flex items-center gap-2 text-xs text-accent"
              >
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span className="truncate">{a}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nearby incidents */}
      {nearbyIncidents.length > 0 && (
        <div className="data-panel rounded-lg p-4">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" /> Incidents
            Near You
            <Badge
              variant="outline"
              className="ml-auto text-xs border-destructive/40 text-destructive"
            >
              {nearbyIncidents.length}
            </Badge>
          </h3>
          <div className="space-y-2">
            {nearbyIncidents.slice(0, 3).map((inc) => (
              <div
                key={inc.id.toString()}
                className="flex items-center gap-3 px-3 py-2 rounded bg-background border border-destructive/20"
                data-ocid="nearby-incident-row"
              >
                <MapPin className="w-4 h-4 text-destructive shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    {inc.incidentType}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {inc.location.lat.toFixed(4)}, {inc.location.lng.toFixed(4)}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {inc.severity}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
