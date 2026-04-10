import CommonTypes "common";
import VehicleTypes "vehicles";

module {
  public type Timestamp = CommonTypes.Timestamp;
  public type Location = CommonTypes.Location;
  public type VehicleType = VehicleTypes.VehicleType;

  public type EmergencyStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type EmergencyRequest = {
    requestId : Nat;
    vehicleId : Text;
    var vehicleType : VehicleType;
    destination : Text;
    destinationLat : Float;
    destinationLng : Float;
    requesterId : Principal;
    var status : EmergencyStatus;
    var routePoints : [Location];
    createdAt : Timestamp;
  };

  public type EmergencyRequestPublic = {
    requestId : Nat;
    vehicleId : Text;
    vehicleType : VehicleType;
    destination : Text;
    destinationLat : Float;
    destinationLng : Float;
    requesterId : Principal;
    status : EmergencyStatus;
    statusText : Text;
    routePoints : [Location];
    createdAt : Timestamp;
  };
};
