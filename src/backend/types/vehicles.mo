import CommonTypes "common";

module {
  public type VehicleId = CommonTypes.VehicleId;
  public type Location = CommonTypes.Location;

  public type VehicleType = {
    #Ambulance;
    #FireTruck;
    #VIP;
    #Police;
    #GeneralVehicle;
  };

  public type VehicleStatus = {
    #available;
    #dispatched;
    #enRoute;
    #offline;
  };

  public type Vehicle = {
    id : VehicleId;
    var vehicleType : VehicleType;
    var status : VehicleStatus;
    var location : Location;
    var currentIncidentId : ?Nat;
  };

  public type VehiclePublic = {
    id : VehicleId;
    vehicleType : VehicleType;
    status : VehicleStatus;
    location : Location;
    currentIncidentId : ?Nat;
  };
};
