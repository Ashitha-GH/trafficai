import Map "mo:core/Map";
import List "mo:core/List";
import ChatTypes "../types/chat";
import ChatLib "../lib/chat";
import IncidentTypes "../types/incidents";
import VehicleTypes "../types/vehicles";
import TrafficTypes "../types/traffic";

mixin (
  chatMessages : Map.Map<Principal, List.List<ChatLib.ChatMessage>>,
  chatCounter : { var value : Nat },
  incidents : Map.Map<Nat, IncidentTypes.Incident>,
  vehicles : Map.Map<Nat, VehicleTypes.Vehicle>,
  segments : Map.Map<Nat, TrafficTypes.TrafficSegment>,
  anomalies : Map.Map<Nat, TrafficTypes.Anomaly>,
) {
  public shared ({ caller }) func sendChatMessage(
    content : Text,
    ctx : ChatTypes.ChatContext,
  ) : async ChatTypes.ChatMessage {
    ChatLib.send(chatMessages, chatCounter, caller, content, ctx);
  };

  public shared query ({ caller }) func getChatHistory() : async [ChatTypes.ChatMessage] {
    ChatLib.getHistory(chatMessages, caller);
  };
};
