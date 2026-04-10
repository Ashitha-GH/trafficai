module {
  public type Timestamp = Int;
  public type UserId = Principal;
  public type VehicleId = Nat;
  public type IncidentId = Nat;
  public type SegmentId = Nat;
  public type AnomalyId = Nat;
  public type ChatMessageId = Nat;

  public type Location = {
    lat : Float;
    lng : Float;
  };
};
