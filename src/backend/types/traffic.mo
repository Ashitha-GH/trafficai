import CommonTypes "common";

module {
  public type SegmentId = CommonTypes.SegmentId;
  public type AnomalyId = CommonTypes.AnomalyId;
  public type Timestamp = CommonTypes.Timestamp;
  public type Location = CommonTypes.Location;

  public type CongestionLevel = {
    #free;
    #moderate;
    #heavy;
    #blocked;
  };

  public type TrafficSegment = {
    id : SegmentId;
    var startLat : Float;
    var startLng : Float;
    var endLat : Float;
    var endLng : Float;
    var congestionLevel : CongestionLevel;
    var averageSpeedKmh : Float;
    var vehicleCount : Nat;
  };

  public type TrafficSegmentPublic = {
    id : SegmentId;
    startLat : Float;
    startLng : Float;
    endLat : Float;
    endLng : Float;
    congestionLevel : CongestionLevel;
    averageSpeedKmh : Float;
    vehicleCount : Nat;
  };

  public type RoutePriority = {
    #normal;
    #emergency;
  };

  public type RouteRequest = {
    requesterId : Principal;
    vehicleId : Nat;
    originLat : Float;
    originLng : Float;
    destLat : Float;
    destLng : Float;
    priority : RoutePriority;
  };

  public type RouteResult = {
    segments : [Location];
    estimatedTimeMinutes : Float;
    congestionWarnings : [Text];
  };

  public type Anomaly = {
    id : AnomalyId;
    anomalyType : Text;
    location : Location;
    var severity : Text;
    detectedAt : Timestamp;
    description : Text;
  };

  public type AnomalyPublic = {
    id : AnomalyId;
    anomalyType : Text;
    location : Location;
    severity : Text;
    detectedAt : Timestamp;
    description : Text;
  };

  public type SignalConfig = {
    junctionId : Text;
    var greenDurationSecs : Nat;
    var yellowDurationSecs : Nat;
    var redDurationSecs : Nat;
  };

  public type SignalConfigPublic = {
    junctionId : Text;
    greenDurationSecs : Nat;
    yellowDurationSecs : Nat;
    redDurationSecs : Nat;
  };

  public type TrafficStats = {
    totalVehicles : Nat;
    openIncidents : Nat;
    avgCongestion : Float;
    topAnomalies : [Text];
  };
};
