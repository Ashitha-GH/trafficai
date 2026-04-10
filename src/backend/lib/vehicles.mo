import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Types "../types/vehicles";

module {
  public type Vehicle = Types.Vehicle;
  public type VehiclePublic = Types.VehiclePublic;
  public type VehicleType = Types.VehicleType;
  public type VehicleStatus = Types.VehicleStatus;
  public type Location = Types.Location;

  public func add(
    vehicles : Map.Map<Nat, Vehicle>,
    counter : { var value : Nat },
    vehicleType : VehicleType,
    location : Location,
  ) : VehiclePublic {
    counter.value += 1;
    let id = counter.value;
    let vehicle : Vehicle = {
      id;
      var vehicleType;
      var status = #available;
      var location;
      var currentIncidentId = null;
    };
    vehicles.add(id, vehicle);
    toPublic(vehicle);
  };

  public func updateStatus(
    vehicles : Map.Map<Nat, Vehicle>,
    id : Nat,
    status : VehicleStatus,
    incidentId : ?Nat,
  ) : Bool {
    switch (vehicles.get(id)) {
      case (?v) {
        v.status := status;
        v.currentIncidentId := incidentId;
        true;
      };
      case null { false };
    };
  };

  public func getAll(
    vehicles : Map.Map<Nat, Vehicle>,
  ) : [VehiclePublic] {
    vehicles.values().map<Vehicle, VehiclePublic>(func(v) { toPublic(v) }).toArray();
  };

  public func toPublic(self : Vehicle) : VehiclePublic {
    {
      id = self.id;
      vehicleType = self.vehicleType;
      status = self.status;
      location = self.location;
      currentIncidentId = self.currentIncidentId;
    };
  };

  public func seedVehicles(
    vehicles : Map.Map<Nat, Vehicle>,
    counter : { var value : Nat },
  ) {
    let seeds : [(VehicleType, Float, Float)] = [
      (#Ambulance,   40.7128, -74.0060),
      (#Ambulance,   40.7580, -73.9855),
      (#FireTruck,   40.6892, -74.0445),
      (#FireTruck,   40.7282, -73.7949),
      (#Police,      40.7484, -73.9967),
      (#Police,      40.7614, -73.9776),
      (#VIP,         40.7527, -73.9772),
      (#GeneralVehicle, 40.7306, -73.9352),
    ];
    for ((vtype, lat, lng) in seeds.vals()) {
      ignore add(vehicles, counter, vtype, { lat; lng });
    };
  };
};
