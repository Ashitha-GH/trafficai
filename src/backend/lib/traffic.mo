import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Types "../types/traffic";
import IncidentTypes "../types/incidents";
import VehicleTypes "../types/vehicles";

module {
  public type TrafficSegment = Types.TrafficSegment;
  public type TrafficSegmentPublic = Types.TrafficSegmentPublic;
  public type RouteRequest = Types.RouteRequest;
  public type RouteResult = Types.RouteResult;
  public type Anomaly = Types.Anomaly;
  public type AnomalyPublic = Types.AnomalyPublic;
  public type SignalConfig = Types.SignalConfig;
  public type SignalConfigPublic = Types.SignalConfigPublic;
  public type TrafficStats = Types.TrafficStats;
  public type CongestionLevel = Types.CongestionLevel;

  func congestionToFloat(c : CongestionLevel) : Float {
    switch (c) {
      case (#free) { 0.0 };
      case (#moderate) { 0.33 };
      case (#heavy) { 0.66 };
      case (#blocked) { 1.0 };
    };
  };

  // Euclidean distance approximation for lat/lng
  func dist(lat1 : Float, lng1 : Float, lat2 : Float, lng2 : Float) : Float {
    let dlat = lat1 - lat2;
    let dlng = lng1 - lng2;
    Float.sqrt(dlat * dlat + dlng * dlng);
  };

  public func getSegments(
    segments : Map.Map<Nat, TrafficSegment>,
  ) : [TrafficSegmentPublic] {
    segments.values().map<TrafficSegment, TrafficSegmentPublic>(func(s) { segmentToPublic(s) }).toArray();
  };

  public func computeRoute(
    segments : Map.Map<Nat, TrafficSegment>,
    request : RouteRequest,
  ) : RouteResult {
    let isEmergency = request.priority == #emergency;
    var warnings : [Text] = [];

    // Build a simple weighted path: collect all segment midpoints, pick ones
    // that are "between" origin and destination, sort by combined proximity.
    let originLat = request.originLat;
    let originLng = request.originLng;
    let destLat = request.destLat;
    let destLng = request.destLng;

    // Collect segment waypoints sorted by position along the route
    type WP = { lat : Float; lng : Float; cost : Float; warn : ?Text };
    var waypoints : [WP] = [];

    for ((_, seg) in segments.entries()) {
      let midLat = (seg.startLat + seg.endLat) / 2.0;
      let midLng = (seg.startLng + seg.endLng) / 2.0;

      // Only include segments that are roughly on the way
      let dFromOrigin = dist(originLat, originLng, midLat, midLng);
      let dToDestination = dist(midLat, midLng, destLat, destLng);
      let directDist = dist(originLat, originLng, destLat, destLng);

      // Triangle inequality filter: segment must be within 50% detour
      if (dFromOrigin + dToDestination <= directDist * 1.5 + 0.01) {

        let warn : ?Text = switch (seg.congestionLevel) {
          case (#blocked) { ?("Segment " # seg.id.toText() # " is blocked") };
          case (#heavy) { ?("Heavy congestion on segment " # seg.id.toText()) };
          case _ { null };
        };

        waypoints := waypoints.concat([{ lat = midLat; lng = midLng; cost = dFromOrigin; warn }]);
        switch (warn) {
          case (?w) { warnings := warnings.concat([w]) };
          case null {};
        };
      };
    };

    // Sort waypoints by distance from origin (greedy path)
    let sorted = waypoints.sort(func(a : WP, b : WP) : Order.Order {
      if (a.cost < b.cost) { #less }
      else if (a.cost > b.cost) { #greater }
      else { #equal };
    });

    // Build location path: origin → waypoints → destination
    var locs : [{ lat : Float; lng : Float }] = [{ lat = originLat; lng = originLng }];
    for (wp in sorted.vals()) {
      locs := locs.concat([{ lat = wp.lat; lng = wp.lng }]);
    };
    locs := locs.concat([{ lat = destLat; lng = destLng }]);

    // Estimate total time
    var totalDist : Float = 0.0;
    var i = 0;
    while (i + 1 < locs.size()) {
      let a = locs[i];
      let b = locs[i + 1];
      totalDist += dist(a.lat, a.lng, b.lat, b.lng) * 111.0;
      i += 1;
    };
    let avgSpeed : Float = if (isEmergency) { 65.0 } else { 45.0 };
    let estimatedTime = if (avgSpeed > 0.0) { totalDist / avgSpeed * 60.0 } else { 0.0 };

    {
      segments = locs;
      estimatedTimeMinutes = estimatedTime;
      congestionWarnings = warnings;
    };
  };

  public func getAnomalies(
    anomalies : Map.Map<Nat, Anomaly>,
  ) : [AnomalyPublic] {
    anomalies.values().map<Anomaly, AnomalyPublic>(func(a) { anomalyToPublic(a) }).toArray();
  };

  public func detectAnomalies(
    segments : Map.Map<Nat, TrafficSegment>,
    anomalies : Map.Map<Nat, Anomaly>,
    counter : { var value : Nat },
  ) : [AnomalyPublic] {
    let now = Time.now();

    for ((_, seg) in segments.entries()) {
      // Detect sudden congestion spike: blocked segments
      if (seg.congestionLevel == #blocked) {
        let alreadyExists = anomalies.any(func(_ : Nat, a : Anomaly) : Bool {
          a.anomalyType == "road_closure" and
          a.location.lat == (seg.startLat + seg.endLat) / 2.0
        });
        if (not alreadyExists) {
          counter.value += 1;
          let anomaly : Anomaly = {
            id = counter.value;
            anomalyType = "road_closure";
            location = {
              lat = (seg.startLat + seg.endLat) / 2.0;
              lng = (seg.startLng + seg.endLng) / 2.0;
            };
            var severity = "high";
            detectedAt = now;
            description = "Segment " # seg.id.toText() # " is fully blocked";
          };
          anomalies.add(counter.value, anomaly);
        };
      } else if (seg.congestionLevel == #heavy and seg.vehicleCount > 30) {
        // High vehicle count congestion spike
        let alreadyExists = anomalies.any(func(_ : Nat, a : Anomaly) : Bool {
          a.anomalyType == "congestion_spike" and
          a.location.lat == (seg.startLat + seg.endLat) / 2.0
        });
        if (not alreadyExists) {
          counter.value += 1;
          let anomaly : Anomaly = {
            id = counter.value;
            anomalyType = "congestion_spike";
            location = {
              lat = (seg.startLat + seg.endLat) / 2.0;
              lng = (seg.startLng + seg.endLng) / 2.0;
            };
            var severity = "medium";
            detectedAt = now;
            description = "Unusual vehicle density on segment " # seg.id.toText();
          };
          anomalies.add(counter.value, anomaly);
        };
      };
    };

    getAnomalies(anomalies);
  };

  public func updateSignalConfig(
    signals : Map.Map<Text, SignalConfig>,
    config : SignalConfigPublic,
  ) : Bool {
    switch (signals.get(config.junctionId)) {
      case (?existing) {
        existing.greenDurationSecs := config.greenDurationSecs;
        existing.yellowDurationSecs := config.yellowDurationSecs;
        existing.redDurationSecs := config.redDurationSecs;
        true;
      };
      case null {
        let newConfig : SignalConfig = {
          junctionId = config.junctionId;
          var greenDurationSecs = config.greenDurationSecs;
          var yellowDurationSecs = config.yellowDurationSecs;
          var redDurationSecs = config.redDurationSecs;
        };
        signals.add(config.junctionId, newConfig);
        true;
      };
    };
  };

  public func getSignalConfigs(
    signals : Map.Map<Text, SignalConfig>,
  ) : [SignalConfigPublic] {
    signals.values().map<SignalConfig, SignalConfigPublic>(func(s) { signalToPublic(s) }).toArray();
  };

  public func computeStats(
    segments : Map.Map<Nat, TrafficSegment>,
    incidents : Map.Map<Nat, IncidentTypes.Incident>,
    vehicles : Map.Map<Nat, VehicleTypes.Vehicle>,
    anomalies : Map.Map<Nat, Anomaly>,
  ) : TrafficStats {
    let totalVehicles = vehicles.size();

    let openIncidents = incidents.foldLeft(0, func(acc : Nat, _ : Nat, inc : IncidentTypes.Incident) : Nat {
      if (inc.status == #open or inc.status == #assigned) { acc + 1 } else { acc };
    });

    let segCount = segments.size();
    let totalCongestion = segments.foldLeft(0.0, func(acc : Float, _ : Nat, seg : TrafficSegment) : Float {
      acc + congestionToFloat(seg.congestionLevel);
    });
    let avgCongestion = if (segCount > 0) {
      totalCongestion / segCount.toFloat();
    } else { 0.0 };

    // Top anomaly descriptions (up to 5)
    var anomalyTexts : [Text] = [];
    var count = 0;
    for ((_, a) in anomalies.entries()) {
      if (count < 5) {
        anomalyTexts := anomalyTexts.concat([a.description]);
        count += 1;
      };
    };

    {
      totalVehicles;
      openIncidents;
      avgCongestion;
      topAnomalies = anomalyTexts;
    };
  };

  public func segmentToPublic(self : TrafficSegment) : TrafficSegmentPublic {
    {
      id = self.id;
      startLat = self.startLat;
      startLng = self.startLng;
      endLat = self.endLat;
      endLng = self.endLng;
      congestionLevel = self.congestionLevel;
      averageSpeedKmh = self.averageSpeedKmh;
      vehicleCount = self.vehicleCount;
    };
  };

  public func anomalyToPublic(self : Anomaly) : AnomalyPublic {
    {
      id = self.id;
      anomalyType = self.anomalyType;
      location = self.location;
      severity = self.severity;
      detectedAt = self.detectedAt;
      description = self.description;
    };
  };

  public func signalToPublic(self : SignalConfig) : SignalConfigPublic {
    {
      junctionId = self.junctionId;
      greenDurationSecs = self.greenDurationSecs;
      yellowDurationSecs = self.yellowDurationSecs;
      redDurationSecs = self.redDurationSecs;
    };
  };

  // 20+ realistic NYC-area traffic segments
  public func seedSegments(
    segments : Map.Map<Nat, TrafficSegment>,
    counter : { var value : Nat },
  ) {
    type SegSeed = (Float, Float, Float, Float, CongestionLevel, Float, Nat);
    let seeds : [SegSeed] = [
      // Manhattan grid: midtown/downtown
      (40.7580, -73.9855, 40.7484, -73.9967, #moderate, 35.0, 18),
      (40.7484, -73.9967, 40.7282, -74.0060, #heavy,    18.0, 42),
      (40.7282, -74.0060, 40.7128, -74.0059, #free,     58.0,  8),
      (40.7614, -73.9776, 40.7580, -73.9855, #moderate, 32.0, 22),
      (40.7128, -74.0059, 40.6892, -74.0445, #heavy,    20.0, 38),
      // Brooklyn
      (40.6892, -74.0445, 40.6782, -73.9442, #free,     55.0, 12),
      (40.6782, -73.9442, 40.6501, -73.9496, #moderate, 38.0, 19),
      (40.6501, -73.9496, 40.6296, -74.1502, #free,     62.0,  5),
      // Queens
      (40.7282, -73.7949, 40.7489, -73.8001, #moderate, 30.0, 25),
      (40.7489, -73.8001, 40.7614, -73.8330, #heavy,    15.0, 45),
      (40.7614, -73.8330, 40.7306, -73.9352, #free,     60.0, 10),
      // Bronx
      (40.8448, -73.8648, 40.8176, -73.9282, #moderate, 28.0, 30),
      (40.8176, -73.9282, 40.7831, -73.9712, #heavy,    12.0, 52),
      // Cross-borough connectors
      (40.7527, -73.9772, 40.7306, -73.9352, #blocked,   2.0, 60),
      (40.7306, -73.9352, 40.7489, -73.8001, #moderate, 40.0, 15),
      // Staten Island
      (40.5795, -74.1502, 40.6296, -74.1502, #free,     65.0,  4),
      (40.6296, -74.1502, 40.6892, -74.0445, #moderate, 42.0, 14),
      // Highways
      (40.7128, -74.0059, 40.7527, -73.9772, #heavy,    22.0, 55),
      (40.7527, -73.9772, 40.8448, -73.8648, #free,     70.0,  6),
      (40.8448, -73.8648, 40.9176, -73.8451, #moderate, 50.0, 20),
      // Additional local roads
      (40.7580, -73.9855, 40.7614, -73.8330, #heavy,    18.0, 40),
      (40.6892, -74.0445, 40.5795, -74.1502, #free,     58.0,  9),
    ];
    for ((sLat, sLng, eLat, eLng, cong, speed, vcount) in seeds.vals()) {
      counter.value += 1;
      let seg : TrafficSegment = {
        id = counter.value;
        var startLat = sLat;
        var startLng = sLng;
        var endLat = eLat;
        var endLng = eLng;
        var congestionLevel = cong;
        var averageSpeedKmh = speed;
        var vehicleCount = vcount;
      };
      segments.add(counter.value, seg);
    };

    // Seed default signal configs as a bonus
    // (signals are handled separately via updateSignalConfig)
  };
};
