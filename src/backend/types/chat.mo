import CommonTypes "common";

module {
  public type ChatMessageId = CommonTypes.ChatMessageId;
  public type Timestamp = CommonTypes.Timestamp;

  public type ChatRole = {
    #user;
    #assistant;
  };

  public type ChatMessage = {
    id : ChatMessageId;
    role : ChatRole;
    content : Text;
    timestamp : Timestamp;
  };

  public type ChatContext = {
    dashboardRole : Text;
    activeIncidentCount : Nat;
    totalVehicles : Nat;
    avgCongestion : Float;
    recentAnomalies : [Text];
  };
};
