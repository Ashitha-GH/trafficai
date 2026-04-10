import Map "mo:core/Map";
import TrafficTypes "../types/traffic";
import IncidentTypes "../types/incidents";
import VehicleTypes "../types/vehicles";
import TrafficLib "../lib/traffic";

mixin (
  segments : Map.Map<Nat, TrafficLib.TrafficSegment>,
  segmentCounter : { var value : Nat },
  anomalies : Map.Map<Nat, TrafficLib.Anomaly>,
  anomalyCounter : { var value : Nat },
  signals : Map.Map<Text, TrafficLib.SignalConfig>,
  incidents : Map.Map<Nat, IncidentTypes.Incident>,
  vehicles : Map.Map<Nat, VehicleTypes.Vehicle>,
) {
  public query func getTrafficSegments() : async [TrafficTypes.TrafficSegmentPublic] {
    TrafficLib.getSegments(segments);
  };

  public shared ({ caller }) func requestRoute(
    request : TrafficTypes.RouteRequest,
  ) : async TrafficTypes.RouteResult {
    TrafficLib.computeRoute(segments, request);
  };

  public query func getAnomalies() : async [TrafficTypes.AnomalyPublic] {
    TrafficLib.getAnomalies(anomalies);
  };

  public shared ({ caller }) func detectAnomalies() : async [TrafficTypes.AnomalyPublic] {
    TrafficLib.detectAnomalies(segments, anomalies, anomalyCounter);
  };

  public shared ({ caller }) func updateSignalConfig(
    config : TrafficTypes.SignalConfigPublic,
  ) : async Bool {
    TrafficLib.updateSignalConfig(signals, config);
  };

  public query func getSignalConfigs() : async [TrafficTypes.SignalConfigPublic] {
    TrafficLib.getSignalConfigs(signals);
  };

  public query func getTrafficStats() : async TrafficTypes.TrafficStats {
    TrafficLib.computeStats(segments, incidents, vehicles, anomalies);
  };
};
