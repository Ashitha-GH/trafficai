import Map "mo:core/Map";
import List "mo:core/List";

import UserLib "lib/users";
import VehicleLib "lib/vehicles";
import IncidentLib "lib/incidents";
import TrafficLib "lib/traffic";
import ChatLib "lib/chat";
import EmergencyLib "lib/emergency";

import UsersApi "mixins/users-api";
import VehiclesApi "mixins/vehicles-api";
import IncidentsApi "mixins/incidents-api";
import TrafficApi "mixins/traffic-api";
import ChatApi "mixins/chat-api";
import EmergencyApi "mixins/emergency-api";

actor {
  // --- Users ---
  let users = Map.empty<Principal, UserLib.UserProfile>();

  // --- Vehicles ---
  let vehicles = Map.empty<Nat, VehicleLib.Vehicle>();
  let vehicleCounter = { var value : Nat = 0 };

  // --- Incidents ---
  let incidents = Map.empty<Nat, IncidentLib.Incident>();
  let incidentCounter = { var value : Nat = 0 };

  // --- Traffic ---
  let segments = Map.empty<Nat, TrafficLib.TrafficSegment>();
  let segmentCounter = { var value : Nat = 0 };
  let anomalies = Map.empty<Nat, TrafficLib.Anomaly>();
  let anomalyCounter = { var value : Nat = 0 };
  let signals = Map.empty<Text, TrafficLib.SignalConfig>();

  // --- Chat ---
  let chatMessages = Map.empty<Principal, List.List<ChatLib.ChatMessage>>();
  let chatCounter = { var value : Nat = 0 };

  // --- Emergency ---
  let emergencyRequests = Map.empty<Nat, EmergencyLib.EmergencyRequest>();
  let emergencyCounter = { var value : Nat = 0 };

  // Seed initial data
  do {
    VehicleLib.seedVehicles(vehicles, vehicleCounter);
    TrafficLib.seedSegments(segments, segmentCounter);
  };

  include UsersApi(users);
  include VehiclesApi(vehicles, vehicleCounter);
  include IncidentsApi(incidents, incidentCounter);
  include TrafficApi(segments, segmentCounter, anomalies, anomalyCounter, signals, incidents, vehicles);
  include ChatApi(chatMessages, chatCounter, incidents, vehicles, segments, anomalies);
  include EmergencyApi(emergencyRequests, emergencyCounter);
};
