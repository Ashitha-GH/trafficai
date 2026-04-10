import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Types "../types/incidents";

module {
  public type Incident = Types.Incident;
  public type IncidentPublic = Types.IncidentPublic;
  public type IncidentSeverity = Types.IncidentSeverity;
  public type IncidentStatus = Types.IncidentStatus;
  public type Location = Types.Location;

  public func create(
    incidents : Map.Map<Nat, Incident>,
    counter : { var value : Nat },
    location : Location,
    severity : IncidentSeverity,
    incidentType : Text,
  ) : IncidentPublic {
    counter.value += 1;
    let id = counter.value;
    let now = Time.now();
    let incident : Incident = {
      id;
      location;
      var severity;
      incidentType;
      var status = #open;
      var assignedVehicleIds = [];
      createdAt = now;
      var updatedAt = now;
    };
    incidents.add(id, incident);
    toPublic(incident);
  };

  public func update(
    incidents : Map.Map<Nat, Incident>,
    id : Nat,
    severity : ?IncidentSeverity,
    status : ?IncidentStatus,
    assignedVehicleIds : ?[Nat],
  ) : Bool {
    switch (incidents.get(id)) {
      case (?inc) {
        switch (severity) {
          case (?s) { inc.severity := s };
          case null {};
        };
        switch (status) {
          case (?st) { inc.status := st };
          case null {};
        };
        switch (assignedVehicleIds) {
          case (?ids) { inc.assignedVehicleIds := ids };
          case null {};
        };
        inc.updatedAt := Time.now();
        true;
      };
      case null { false };
    };
  };

  public func resolve(
    incidents : Map.Map<Nat, Incident>,
    id : Nat,
  ) : Bool {
    switch (incidents.get(id)) {
      case (?inc) {
        inc.status := #resolved;
        inc.updatedAt := Time.now();
        true;
      };
      case null { false };
    };
  };

  public func getAll(
    incidents : Map.Map<Nat, Incident>,
  ) : [IncidentPublic] {
    incidents.values().map<Incident, IncidentPublic>(func(i) { toPublic(i) }).toArray();
  };

  public func toPublic(self : Incident) : IncidentPublic {
    {
      id = self.id;
      location = self.location;
      severity = self.severity;
      incidentType = self.incidentType;
      status = self.status;
      assignedVehicleIds = self.assignedVehicleIds;
      createdAt = self.createdAt;
      updatedAt = self.updatedAt;
    };
  };
};
