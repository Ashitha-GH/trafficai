import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  ChatContext,
  IncidentSeverity,
  IncidentStatus,
  Location,
  RouteRequest,
  SignalConfigPublic,
  UserRole,
  VehicleStatus,
  VehicleType,
} from "../types";

const POLL_INTERVAL = 3000;

function useBackendActor() {
  return useActor(createActor);
}

export function useGetVehicles() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVehicles();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: POLL_INTERVAL,
  });
}

export function useGetIncidents() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getIncidents();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: POLL_INTERVAL,
  });
}

export function useGetTrafficSegments() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["trafficSegments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrafficSegments();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: POLL_INTERVAL,
  });
}

export function useGetAnomalies() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["anomalies"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAnomalies();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: POLL_INTERVAL,
  });
}

export function useGetTrafficStats() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["trafficStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTrafficStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: POLL_INTERVAL,
  });
}

export function useGetSignalConfigs() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["signalConfigs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSignalConfigs();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: POLL_INTERVAL,
  });
}

export function useGetChatHistory() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatHistory();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: POLL_INTERVAL,
  });
}

export function useGetUserProfile() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEmergencyRequests() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["emergencyRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEmergencyRequests();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: POLL_INTERVAL,
  });
}

export function useSubmitEmergencyRequest() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      vehicleId,
      vehicleType,
      destination,
      destinationLat,
      destinationLng,
    }: {
      vehicleId: string;
      vehicleType: VehicleType;
      destination: string;
      destinationLat: number;
      destinationLng: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitEmergencyRequest(
        vehicleId,
        vehicleType,
        destination,
        destinationLat,
        destinationLng,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyRequests"] });
    },
  });
}

export function useApproveEmergencyRequest() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.approveEmergencyRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyRequests"] });
    },
  });
}

export function useRejectEmergencyRequest() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.rejectEmergencyRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyRequests"] });
    },
  });
}

export function useCreateIncident() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      location,
      severity,
      incidentType,
    }: {
      location: Location;
      severity: IncidentSeverity;
      incidentType: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createIncident(location, severity, incidentType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["trafficStats"] });
    },
  });
}

export function useResolveIncident() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.resolveIncident(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["trafficStats"] });
    },
  });
}

export function useSendChatMessage() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      content,
      ctx,
    }: {
      content: string;
      ctx: ChatContext;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendChatMessage(content, ctx);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}

export function useRequestRoute() {
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (request: RouteRequest) => {
      if (!actor) throw new Error("Actor not available");
      return actor.requestRoute(request);
    },
  });
}

export function useUpdateSignalConfig() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: SignalConfigPublic) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateSignalConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signalConfigs"] });
    },
  });
}

export function useRegisterUser() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      role,
    }: {
      email: string;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.registerUser(email, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useAddVehicle() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      vehicleType,
      location,
    }: {
      vehicleType: VehicleType;
      location: Location;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addVehicle(vehicleType, location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateVehicleStatus() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      incidentId,
    }: {
      id: bigint;
      status: VehicleStatus;
      incidentId: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateVehicleStatus(id, status, incidentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useDetectAnomalies() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.detectAnomalies();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["trafficStats"] });
    },
  });
}

export function useUpdateIncident() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      severity,
      status,
      assignedVehicleIds,
    }: {
      id: bigint;
      severity: IncidentSeverity | null;
      status: IncidentStatus | null;
      assignedVehicleIds: Array<bigint> | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateIncident(id, severity, status, assignedVehicleIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}
