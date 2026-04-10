import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Types "../types/emergency";

module {
  public type EmergencyRequest = Types.EmergencyRequest;
  public type EmergencyRequestPublic = Types.EmergencyRequestPublic;
  public type EmergencyStatus = Types.EmergencyStatus;
  public type VehicleType = Types.VehicleType;
  public type Location = Types.Location;

  public func submit(
    requests : Map.Map<Nat, EmergencyRequest>,
    counter : { var value : Nat },
    vehicleId : Text,
    vehicleType : VehicleType,
    destination : Text,
    destinationLat : Float,
    destinationLng : Float,
    requester : Principal,
  ) : Nat {
    counter.value += 1;
    let id = counter.value;
    let req : EmergencyRequest = {
      requestId = id;
      vehicleId;
      var vehicleType;
      destination;
      destinationLat;
      destinationLng;
      requesterId = requester;
      var status = #pending;
      var routePoints = [];
      createdAt = Time.now();
    };
    requests.add(id, req);
    id;
  };

  // Generate 4 linearly interpolated route points between (0,0) and destination
  func generateRoutePoints(destLat : Float, destLng : Float) : [Location] {
    let steps : Nat = 4;
    // Produce 4 points at t = 1/5, 2/5, 3/5, 4/5 along the line from (0,0) to destination
    let divisor : Float = (steps + 1).toFloat();
    Array.tabulate<Location>(steps, func(i) {
      let t = (i + 1).toFloat() / divisor;
      { lat = destLat * t; lng = destLng * t };
    });
  };

  public func approve(
    requests : Map.Map<Nat, EmergencyRequest>,
    requestId : Nat,
  ) : Bool {
    switch (requests.get(requestId)) {
      case (?req) {
        req.status := #approved;
        req.routePoints := generateRoutePoints(req.destinationLat, req.destinationLng);
        true;
      };
      case null { false };
    };
  };

  public func reject(
    requests : Map.Map<Nat, EmergencyRequest>,
    requestId : Nat,
  ) : Bool {
    switch (requests.get(requestId)) {
      case (?req) {
        req.status := #rejected;
        true;
      };
      case null { false };
    };
  };

  public func getAll(
    requests : Map.Map<Nat, EmergencyRequest>,
  ) : [EmergencyRequestPublic] {
    requests.values().map<EmergencyRequest, EmergencyRequestPublic>(func(r) { toPublic(r) }).toArray();
  };

  public func statusText(s : EmergencyStatus) : Text {
    switch (s) {
      case (#pending)  { "pending" };
      case (#approved) { "approved" };
      case (#rejected) { "rejected" };
    };
  };

  public func toPublic(self : EmergencyRequest) : EmergencyRequestPublic {
    {
      requestId   = self.requestId;
      vehicleId   = self.vehicleId;
      vehicleType = self.vehicleType;
      destination = self.destination;
      destinationLat = self.destinationLat;
      destinationLng = self.destinationLng;
      requesterId = self.requesterId;
      status      = self.status;
      statusText  = statusText(self.status);
      routePoints = self.routePoints;
      createdAt   = self.createdAt;
    };
  };
};
