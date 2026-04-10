import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    lat: number;
    lng: number;
}
export type SegmentId = bigint;
export type Timestamp = bigint;
export interface SignalConfigPublic {
    redDurationSecs: bigint;
    greenDurationSecs: bigint;
    junctionId: string;
    yellowDurationSecs: bigint;
}
export type IncidentId = bigint;
export interface RouteResult {
    estimatedTimeMinutes: number;
    segments: Array<Location>;
    congestionWarnings: Array<string>;
}
export interface RouteRequest {
    destLat: number;
    destLng: number;
    priority: RoutePriority;
    originLat: number;
    originLng: number;
    requesterId: Principal;
    vehicleId: bigint;
}
export interface ChatMessage {
    id: ChatMessageId;
    content: string;
    role: ChatRole;
    timestamp: Timestamp;
}
export interface TrafficStats {
    openIncidents: bigint;
    totalVehicles: bigint;
    avgCongestion: number;
    topAnomalies: Array<string>;
}
export type VehicleId = bigint;
export interface VehiclePublic {
    id: VehicleId;
    status: VehicleStatus;
    vehicleType: VehicleType;
    location: Location;
    currentIncidentId?: bigint;
}
export type ChatMessageId = bigint;
export interface EmergencyRequestPublic {
    status: EmergencyStatus;
    vehicleType: VehicleType;
    destination: string;
    requestId: bigint;
    createdAt: Timestamp;
    routePoints: Array<Location>;
    statusText: string;
    destinationLat: number;
    destinationLng: number;
    requesterId: Principal;
    vehicleId: string;
}
export interface IncidentPublic {
    id: IncidentId;
    status: IncidentStatus;
    assignedVehicleIds: Array<bigint>;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    severity: IncidentSeverity;
    location: Location;
    incidentType: string;
}
export interface AnomalyPublic {
    id: AnomalyId;
    anomalyType: string;
    detectedAt: Timestamp;
    description: string;
    severity: string;
    location: Location;
}
export type AnomalyId = bigint;
export interface UserProfilePublic {
    principal: UserId;
    role: UserRole;
    email: string;
    registrationStatus: RegistrationStatus;
}
export interface TrafficSegmentPublic {
    id: SegmentId;
    startLat: number;
    startLng: number;
    vehicleCount: bigint;
    congestionLevel: CongestionLevel;
    averageSpeedKmh: number;
    endLat: number;
    endLng: number;
}
export type UserId = Principal;
export interface ChatContext {
    totalVehicles: bigint;
    recentAnomalies: Array<string>;
    activeIncidentCount: bigint;
    avgCongestion: number;
    dashboardRole: string;
}
export enum ChatRole {
    user = "user",
    assistant = "assistant"
}
export enum CongestionLevel {
    heavy = "heavy",
    free = "free",
    blocked = "blocked",
    moderate = "moderate"
}
export enum EmergencyStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum IncidentSeverity {
    low = "low",
    high = "high",
    critical = "critical",
    medium = "medium"
}
export enum IncidentStatus {
    resolved = "resolved",
    assigned = "assigned",
    open = "open"
}
export enum RoutePriority {
    emergency = "emergency",
    normal = "normal"
}
export enum UserRole {
    EmergencyResponder = "EmergencyResponder",
    TrafficPolice = "TrafficPolice",
    GeneralUser = "GeneralUser",
    ControlPanelAdmin = "ControlPanelAdmin"
}
export enum VehicleStatus {
    dispatched = "dispatched",
    available = "available",
    offline = "offline",
    enRoute = "enRoute"
}
export enum VehicleType {
    VIP = "VIP",
    Ambulance = "Ambulance",
    Police = "Police",
    FireTruck = "FireTruck",
    GeneralVehicle = "GeneralVehicle"
}
export interface backendInterface {
    addVehicle(vehicleType: VehicleType, location: Location): Promise<VehiclePublic>;
    approveEmergencyRequest(requestId: bigint): Promise<boolean>;
    createIncident(location: Location, severity: IncidentSeverity, incidentType: string): Promise<IncidentPublic>;
    detectAnomalies(): Promise<Array<AnomalyPublic>>;
    getAnomalies(): Promise<Array<AnomalyPublic>>;
    getChatHistory(): Promise<Array<ChatMessage>>;
    getEmergencyRequests(): Promise<Array<EmergencyRequestPublic>>;
    getIncidents(): Promise<Array<IncidentPublic>>;
    getSignalConfigs(): Promise<Array<SignalConfigPublic>>;
    getTrafficSegments(): Promise<Array<TrafficSegmentPublic>>;
    getTrafficStats(): Promise<TrafficStats>;
    getUserProfile(): Promise<UserProfilePublic | null>;
    getVehicles(): Promise<Array<VehiclePublic>>;
    registerUser(email: string, role: UserRole): Promise<UserProfilePublic>;
    rejectEmergencyRequest(requestId: bigint): Promise<boolean>;
    requestRoute(request: RouteRequest): Promise<RouteResult>;
    resolveIncident(id: bigint): Promise<boolean>;
    sendChatMessage(content: string, ctx: ChatContext): Promise<ChatMessage>;
    submitEmergencyRequest(vehicleId: string, vehicleType: VehicleType, destination: string, destinationLat: number, destinationLng: number): Promise<bigint>;
    updateIncident(id: bigint, severity: IncidentSeverity | null, status: IncidentStatus | null, assignedVehicleIds: Array<bigint> | null): Promise<boolean>;
    updateSignalConfig(config: SignalConfigPublic): Promise<boolean>;
    updateUserRole(target: Principal, newRole: UserRole): Promise<boolean>;
    updateVehicleStatus(id: bigint, status: VehicleStatus, incidentId: bigint | null): Promise<boolean>;
}
