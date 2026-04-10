import CommonTypes "common";

module {
  public type IncidentId = CommonTypes.IncidentId;
  public type Timestamp = CommonTypes.Timestamp;
  public type Location = CommonTypes.Location;

  public type IncidentSeverity = {
    #low;
    #medium;
    #high;
    #critical;
  };

  public type IncidentStatus = {
    #open;
    #assigned;
    #resolved;
  };

  public type Incident = {
    id : IncidentId;
    location : Location;
    var severity : IncidentSeverity;
    incidentType : Text;
    var status : IncidentStatus;
    var assignedVehicleIds : [Nat];
    createdAt : Timestamp;
    var updatedAt : Timestamp;
  };

  public type IncidentPublic = {
    id : IncidentId;
    location : Location;
    severity : IncidentSeverity;
    incidentType : Text;
    status : IncidentStatus;
    assignedVehicleIds : [Nat];
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };
};
