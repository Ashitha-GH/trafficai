// Re-export backend types for use across the frontend
export type {
  Location,
  SegmentId,
  Timestamp,
  SignalConfigPublic,
  IncidentId,
  RouteResult,
  RouteRequest,
  ChatMessage,
  TrafficStats,
  VehicleId,
  VehiclePublic,
  ChatMessageId,
  AnomalyPublic,
  AnomalyId,
  IncidentPublic,
  UserProfilePublic,
  TrafficSegmentPublic,
  UserId,
  ChatContext,
  EmergencyRequestPublic,
} from "../backend";

export {
  ChatRole,
  CongestionLevel,
  EmergencyStatus,
  IncidentSeverity,
  IncidentStatus,
  RoutePriority,
  UserRole,
  VehicleStatus,
  VehicleType,
} from "../backend";

// Dashboard tab type
export type DashboardTab =
  | "emergencies"
  | "control-panel"
  | "traffic-police"
  | "user";

// Geolocation state
export interface GeoState {
  lat: number;
  lng: number;
  error: string | null;
  loading: boolean;
}

// Map display props
export interface MapPoint {
  lat: number;
  lng: number;
}

// ── Edge Case Types ───────────────────────────────────────────────────────────

export type WeatherCondition = "Clear" | "Rain" | "Fog" | "Snow" | "Ice";

export type ConstructionSeverity = "minor" | "moderate" | "major";

export interface ConstructionZone {
  id: string;
  streetName: string;
  startDate: string;
  endDate: string;
  affectedLanes: number;
  severity: ConstructionSeverity;
  lat: number;
  lng: number;
}

export interface SpecialEvent {
  id: string;
  name: string;
  location: string;
  expectedAttendance: number;
  startTime: string;
  endTime: string;
  lat: number;
  lng: number;
}

export interface RoadClosure {
  id: string;
  roadName: string;
  reason: string;
  expectedReopening: string;
  lat: number;
  lng: number;
}

export interface EdgeCases {
  constructionZones: ConstructionZone[];
  specialEvents: SpecialEvent[];
  weather: WeatherCondition;
  roadClosures: RoadClosure[];
}
