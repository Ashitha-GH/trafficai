import Map "mo:core/Map";
import IncidentTypes "../types/incidents";
import IncidentLib "../lib/incidents";

mixin (
  incidents : Map.Map<Nat, IncidentLib.Incident>,
  incidentCounter : { var value : Nat },
) {
  public shared ({ caller }) func createIncident(
    location : IncidentTypes.Location,
    severity : IncidentTypes.IncidentSeverity,
    incidentType : Text,
  ) : async IncidentTypes.IncidentPublic {
    IncidentLib.create(incidents, incidentCounter, location, severity, incidentType);
  };

  public shared ({ caller }) func updateIncident(
    id : Nat,
    severity : ?IncidentTypes.IncidentSeverity,
    status : ?IncidentTypes.IncidentStatus,
    assignedVehicleIds : ?[Nat],
  ) : async Bool {
    IncidentLib.update(incidents, id, severity, status, assignedVehicleIds);
  };

  public shared ({ caller }) func resolveIncident(id : Nat) : async Bool {
    IncidentLib.resolve(incidents, id);
  };

  public query func getIncidents() : async [IncidentTypes.IncidentPublic] {
    IncidentLib.getAll(incidents);
  };
};
