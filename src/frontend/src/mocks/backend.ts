import type { EmergencyRequestPublic, backendInterface } from "../backend";
import {
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

// ── Shared in-memory store for emergency requests ─────────────────────────────
// This array is module-level so it persists across calls within the same session.
const mockEmergencyRequests: EmergencyRequestPublic[] = [
  {
    requestId: BigInt(2),
    vehicleId: "FT-007",
    vehicleType: VehicleType.FireTruck,
    destination: "Industrial Zone, Block 5",
    destinationLat: 37.765,
    destinationLng: -122.432,
    status: EmergencyStatus.pending,
    statusText: "pending",
    routePoints: [],
    createdAt: BigInt(Date.now() - 30000),
    requesterId: { _isPrincipal: true, toText: () => "bbbbb-bb" } as any,
  },
];

export const mockBackend: backendInterface = {
  addVehicle: async (_vehicleType, _location) => ({
    id: BigInt(10),
    status: VehicleStatus.available,
    vehicleType: _vehicleType,
    location: _location,
  }),

  createIncident: async (location, severity, incidentType) => ({
    id: BigInt(5),
    status: IncidentStatus.open,
    assignedVehicleIds: [],
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
    severity,
    location,
    incidentType,
  }),

  detectAnomalies: async () => [
    {
      id: BigInt(1),
      anomalyType: "Unusual Congestion",
      detectedAt: BigInt(Date.now()),
      description: "Traffic speed dropped 70% below average on Highway 5",
      severity: "high",
      location: { lat: 37.775, lng: -122.418 },
    },
    {
      id: BigInt(2),
      anomalyType: "Signal Timing Irregularity",
      detectedAt: BigInt(Date.now() - 120000),
      description: "Green phase lasting 3x normal duration at Junction 12",
      severity: "medium",
      location: { lat: 37.782, lng: -122.412 },
    },
  ],

  getAnomalies: async () => [
    {
      id: BigInt(1),
      anomalyType: "Unusual Congestion",
      detectedAt: BigInt(Date.now()),
      description: "Traffic speed dropped 70% below average on Highway 5",
      severity: "high",
      location: { lat: 37.775, lng: -122.418 },
    },
    {
      id: BigInt(2),
      anomalyType: "Signal Timing Irregularity",
      detectedAt: BigInt(Date.now() - 120000),
      description: "Green phase lasting 3x normal duration at Junction 12",
      severity: "medium",
      location: { lat: 37.782, lng: -122.412 },
    },
  ],

  getChatHistory: async () => [
    {
      id: BigInt(1),
      content: "What is the current traffic status on the main corridors?",
      role: ChatRole.user,
      timestamp: BigInt(Date.now() - 60000),
    },
    {
      id: BigInt(2),
      content:
        "Current traffic analysis: Highway 5 shows heavy congestion (avg speed 18 km/h). I-280 is flowing freely at 95 km/h. There are 3 active incidents requiring attention. Recommend rerouting emergency vehicles via Alternate Route B.",
      role: ChatRole.assistant,
      timestamp: BigInt(Date.now() - 50000),
    },
    {
      id: BigInt(3),
      content: "Are there any anomalies detected?",
      role: ChatRole.user,
      timestamp: BigInt(Date.now() - 30000),
    },
    {
      id: BigInt(4),
      content:
        "2 anomalies detected: (1) Unusual congestion on Highway 5 — speed drop of 70%. (2) Signal timing irregularity at Junction 12. Both flagged for review.",
      role: ChatRole.assistant,
      timestamp: BigInt(Date.now() - 20000),
    },
  ],

  getIncidents: async () => [
    {
      id: BigInt(1),
      status: IncidentStatus.open,
      assignedVehicleIds: [BigInt(1)],
      createdAt: BigInt(Date.now() - 300000),
      updatedAt: BigInt(Date.now() - 60000),
      severity: IncidentSeverity.critical,
      location: { lat: 37.774, lng: -122.42 },
      incidentType: "Multi-vehicle accident",
    },
    {
      id: BigInt(2),
      status: IncidentStatus.assigned,
      assignedVehicleIds: [BigInt(2), BigInt(3)],
      createdAt: BigInt(Date.now() - 600000),
      updatedAt: BigInt(Date.now() - 120000),
      severity: IncidentSeverity.high,
      location: { lat: 37.787, lng: -122.407 },
      incidentType: "Structure fire",
    },
    {
      id: BigInt(3),
      status: IncidentStatus.open,
      assignedVehicleIds: [],
      createdAt: BigInt(Date.now() - 180000),
      updatedAt: BigInt(Date.now() - 180000),
      severity: IncidentSeverity.medium,
      location: { lat: 37.769, lng: -122.43 },
      incidentType: "Road obstruction",
    },
  ],

  getSignalConfigs: async () => [
    {
      junctionId: "JCT-001",
      redDurationSecs: BigInt(45),
      greenDurationSecs: BigInt(60),
      yellowDurationSecs: BigInt(5),
    },
    {
      junctionId: "JCT-002",
      redDurationSecs: BigInt(30),
      greenDurationSecs: BigInt(45),
      yellowDurationSecs: BigInt(5),
    },
    {
      junctionId: "JCT-003",
      redDurationSecs: BigInt(60),
      greenDurationSecs: BigInt(90),
      yellowDurationSecs: BigInt(5),
    },
  ],

  getTrafficSegments: async () => [
    {
      id: BigInt(1),
      startLat: 37.77,
      startLng: -122.42,
      endLat: 37.775,
      endLng: -122.415,
      vehicleCount: BigInt(87),
      congestionLevel: CongestionLevel.heavy,
      averageSpeedKmh: 18,
    },
    {
      id: BigInt(2),
      startLat: 37.775,
      startLng: -122.415,
      endLat: 37.78,
      endLng: -122.41,
      vehicleCount: BigInt(32),
      congestionLevel: CongestionLevel.moderate,
      averageSpeedKmh: 45,
    },
    {
      id: BigInt(3),
      startLat: 37.78,
      startLng: -122.41,
      endLat: 37.785,
      endLng: -122.405,
      vehicleCount: BigInt(12),
      congestionLevel: CongestionLevel.free,
      averageSpeedKmh: 95,
    },
    {
      id: BigInt(4),
      startLat: 37.765,
      startLng: -122.43,
      endLat: 37.77,
      endLng: -122.425,
      vehicleCount: BigInt(0),
      congestionLevel: CongestionLevel.blocked,
      averageSpeedKmh: 0,
    },
  ],

  getTrafficStats: async () => ({
    openIncidents: BigInt(3),
    totalVehicles: BigInt(24),
    avgCongestion: 0.62,
    topAnomalies: [
      "Highway 5: speed 70% below average",
      "Junction 12: signal timing irregularity",
    ],
  }),

  getUserProfile: async () => ({
    principal: { _isPrincipal: true, toText: () => "aaaaa-aa" } as any,
    role: UserRole.ControlPanelAdmin,
    email: "admin@trafficops.io",
    registrationStatus: "approved" as any,
  }),

  getVehicles: async () => [
    {
      id: BigInt(1),
      status: VehicleStatus.enRoute,
      vehicleType: VehicleType.Ambulance,
      location: { lat: 37.773, lng: -122.419 },
      currentIncidentId: BigInt(1),
    },
    {
      id: BigInt(2),
      status: VehicleStatus.dispatched,
      vehicleType: VehicleType.FireTruck,
      location: { lat: 37.786, lng: -122.408 },
      currentIncidentId: BigInt(2),
    },
    {
      id: BigInt(3),
      status: VehicleStatus.dispatched,
      vehicleType: VehicleType.Police,
      location: { lat: 37.788, lng: -122.406 },
      currentIncidentId: BigInt(2),
    },
    {
      id: BigInt(4),
      status: VehicleStatus.available,
      vehicleType: VehicleType.VIP,
      location: { lat: 37.79, lng: -122.4 },
    },
    {
      id: BigInt(5),
      status: VehicleStatus.available,
      vehicleType: VehicleType.Police,
      location: { lat: 37.768, lng: -122.432 },
    },
  ],

  registerUser: async (email, role) => ({
    principal: { _isPrincipal: true, toText: () => "user-principal" } as any,
    role,
    email,
    registrationStatus: "pending" as any,
  }),

  requestRoute: async (_request) => ({
    estimatedTimeMinutes: 12,
    segments: [
      { lat: 37.77, lng: -122.42 },
      { lat: 37.775, lng: -122.415 },
      { lat: 37.78, lng: -122.41 },
    ],
    congestionWarnings: ["Moderate congestion on segment 2"],
  }),

  resolveIncident: async (_id) => true,

  sendChatMessage: async (content, _ctx) => ({
    id: BigInt(Date.now()),
    content: `AI Analysis: Based on current system data with ${_ctx.activeIncidentCount} active incidents and ${(_ctx.avgCongestion * 100).toFixed(0)}% average congestion — ${content.toLowerCase().includes("route") ? "recommended rerouting via I-280 corridor to avoid congestion hotspots." : "system is operating within expected parameters. Monitor Highway 5 segment for further deterioration."}`,
    role: ChatRole.assistant,
    timestamp: BigInt(Date.now()),
  }),

  submitEmergencyRequest: async (vehicleId, vehicleType, destination, destinationLat, destinationLng) => {
    const requestId = BigInt(Date.now());
    const newRequest: EmergencyRequestPublic = {
      requestId,
      vehicleId,
      vehicleType,
      destination,
      destinationLat,
      destinationLng,
      status: EmergencyStatus.pending,
      statusText: "pending",
      routePoints: [],
      createdAt: BigInt(Date.now()),
      requesterId: { _isPrincipal: true, toText: () => "requester-aa" } as any,
    };
    mockEmergencyRequests.push(newRequest);
    return requestId;
  },

  approveEmergencyRequest: async (requestId) => {
    const req = mockEmergencyRequests.find((r) => r.requestId === requestId);
    if (req) {
      req.status = EmergencyStatus.approved;
      req.statusText = "approved";
      req.routePoints = [
        { lat: req.destinationLat - 0.007, lng: req.destinationLng + 0.003 },
        { lat: req.destinationLat - 0.004, lng: req.destinationLng + 0.001 },
        { lat: req.destinationLat, lng: req.destinationLng },
      ];
    }
    return true;
  },

  rejectEmergencyRequest: async (requestId) => {
    const req = mockEmergencyRequests.find((r) => r.requestId === requestId);
    if (req) {
      req.status = EmergencyStatus.rejected;
      req.statusText = "rejected";
    }
    return true;
  },

  getEmergencyRequests: async () => [...mockEmergencyRequests],

  updateIncident: async (_id, _severity, _status, _assignedVehicleIds) => true,

  updateSignalConfig: async (_config) => true,

  updateUserRole: async (_target, _newRole) => true,

  updateVehicleStatus: async (_id, _status, _incidentId) => true,
};
