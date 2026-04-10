import Map "mo:core/Map";
import VehicleTypes "../types/vehicles";
import VehicleLib "../lib/vehicles";

mixin (
  vehicles : Map.Map<Nat, VehicleLib.Vehicle>,
  vehicleCounter : { var value : Nat },
) {
  public shared ({ caller }) func addVehicle(
    vehicleType : VehicleTypes.VehicleType,
    location : VehicleTypes.Location,
  ) : async VehicleTypes.VehiclePublic {
    VehicleLib.add(vehicles, vehicleCounter, vehicleType, location);
  };

  public shared ({ caller }) func updateVehicleStatus(
    id : Nat,
    status : VehicleTypes.VehicleStatus,
    incidentId : ?Nat,
  ) : async Bool {
    VehicleLib.updateStatus(vehicles, id, status, incidentId);
  };

  public query func getVehicles() : async [VehicleTypes.VehiclePublic] {
    VehicleLib.getAll(vehicles);
  };
};
