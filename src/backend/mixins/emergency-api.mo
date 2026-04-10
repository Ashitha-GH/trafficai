import Map "mo:core/Map";
import EmergencyTypes "../types/emergency";
import EmergencyLib "../lib/emergency";

mixin (
  emergencyRequests : Map.Map<Nat, EmergencyLib.EmergencyRequest>,
  emergencyCounter  : { var value : Nat },
) {
  public shared ({ caller }) func submitEmergencyRequest(
    vehicleId      : Text,
    vehicleType    : EmergencyTypes.VehicleType,
    destination    : Text,
    destinationLat : Float,
    destinationLng : Float,
  ) : async Nat {
    EmergencyLib.submit(
      emergencyRequests,
      emergencyCounter,
      vehicleId,
      vehicleType,
      destination,
      destinationLat,
      destinationLng,
      caller,
    );
  };

  public shared ({ caller }) func approveEmergencyRequest(requestId : Nat) : async Bool {
    EmergencyLib.approve(emergencyRequests, requestId);
  };

  public shared ({ caller }) func rejectEmergencyRequest(requestId : Nat) : async Bool {
    EmergencyLib.reject(emergencyRequests, requestId);
  };

  public query func getEmergencyRequests() : async [EmergencyTypes.EmergencyRequestPublic] {
    EmergencyLib.getAll(emergencyRequests);
  };
};
