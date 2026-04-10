import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/chat";

module {
  public type ChatMessage = Types.ChatMessage;
  public type ChatContext = Types.ChatContext;
  public type ChatRole = Types.ChatRole;

  // 10+ distinct response patterns based on role and context
  public func generateResponse(
    content : Text,
    ctx : ChatContext,
  ) : Text {
    let role = ctx.dashboardRole;
    let incidentCount = ctx.activeIncidentCount;
    let vehicleCount = ctx.totalVehicles;
    let congestion = ctx.avgCongestion;
    let recentAnomalies = ctx.recentAnomalies;

    let congPct = (congestion * 100.0).toInt().toText() # "%";
    let anomalyCount = recentAnomalies.size();

    let lowerContent = content.toLower();

    if (role == "EmergencyResponder") {
      if (lowerContent.contains(#text "route") or lowerContent.contains(#text "path")) {
        "Emergency routing analysis: Currently " # incidentCount.toText() # " active incidents detected. " #
        "Recommended path avoids " # anomalyCount.toText() # " anomaly zones. " #
        "Average network congestion is " # congPct # ". " #
        "Priority corridors have been pre-cleared for emergency vehicles. ETA estimates updated in real-time.";
      } else if (lowerContent.contains(#text "incident") or lowerContent.contains(#text "emergency")) {
        "Emergency status update: " # incidentCount.toText() # " active incident(s) in the system. " #
        "Dispatched vehicles: " # vehicleCount.toText() # " total in fleet. " #
        (if (incidentCount > 5) {
          "HIGH ALERT: Multiple simultaneous incidents detected. Requesting mutual aid protocols."
        } else if (incidentCount > 2) {
          "ELEVATED: Multiple incidents active. Prioritizing by severity."
        } else {
          "Normal operations. Monitoring all zones."
        });
      } else if (lowerContent.contains(#text "congestion") or lowerContent.contains(#text "traffic")) {
        "Traffic impact on emergency response: Current congestion at " # congPct # ". " #
        (if (congestion > 0.7) {
          "SEVERE congestion will significantly delay response times. Activating alternate corridors."
        } else if (congestion > 0.4) {
          "Moderate delays expected. Emergency vehicles using priority signal override."
        } else {
          "Traffic conditions favorable for emergency response. Normal ETA estimates apply."
        });
      } else {
        "Emergency Command Center: " # incidentCount.toText() # " incident(s) active, " #
        vehicleCount.toText() # " vehicles in fleet, network congestion " # congPct # ". " #
        "All units standing by. How can I assist with emergency coordination?";
      };

    } else if (role == "ControlPanelAdmin") {
      if (lowerContent.contains(#text "signal") or lowerContent.contains(#text "light")) {
        "Signal optimization analysis: Network has " # anomalyCount.toText() # " anomaly event(s). " #
        "Congestion at " # congPct # " — " #
        (if (congestion > 0.6) {
          "Recommending adaptive signal timing: extend green phases on major arteries by 20-30 seconds."
        } else {
          "Current signal timing within acceptable parameters. No adjustment needed."
        });
      } else if (lowerContent.contains(#text "vehicle") or lowerContent.contains(#text "fleet")) {
        "Fleet overview: " # vehicleCount.toText() # " vehicles tracked in real-time. " #
        "Active incidents requiring response: " # incidentCount.toText() # ". " #
        "Fleet utilization is " # (if (incidentCount > 0) { (incidentCount * 100 / (vehicleCount + 1)).toText() # "%" } else { "0%" }) # ". " #
        "Recommend pre-positioning reserves near high-congestion zones.";
      } else if (lowerContent.contains(#text "anomaly") or lowerContent.contains(#text "alert")) {
        let topAnomaly = if (anomalyCount > 0) { recentAnomalies[0] } else { "N/A" };
        "System anomaly report: " # anomalyCount.toText() # " active anomalies detected. " #
        (if (anomalyCount > 0) { "Top concern: " # topAnomaly # ". " } else { "" }) #
        "All sensors nominal. Predictive model confidence: " #
        (if (congestion < 0.3) { "HIGH" } else if (congestion < 0.6) { "MEDIUM" } else { "LOW" }) # ".";
      } else {
        "Control Panel Dashboard: Managing " # vehicleCount.toText() # " vehicles, " #
        incidentCount.toText() # " open incidents, network congestion " # congPct # ". " #
        "System operating in " # (if (congestion > 0.7) { "CRITICAL" } else if (congestion > 0.4) { "ELEVATED" } else { "NORMAL" }) # " mode.";
      };

    } else if (role == "TrafficPolice") {
      if (lowerContent.contains(#text "patrol") or lowerContent.contains(#text "deploy")) {
        "Patrol deployment recommendation: " # anomalyCount.toText() # " hotspot(s) identified. " #
        "Network congestion at " # congPct # ". " #
        "Recommend deploying officers to high-congestion intersections. " #
        (if (incidentCount > 0) { incidentCount.toText() # " incident(s) require on-ground presence." } else { "No active incidents." });
      } else if (lowerContent.contains(#text "violation") or lowerContent.contains(#text "enforce")) {
        "Enforcement intelligence: High-density corridors showing " # congPct # " congestion. " #
        "Anomaly zones (" # anomalyCount.toText() # " detected) correlate with irregular traffic patterns. " #
        "Priority enforcement zones: areas with speed variance > 40%.";
      } else if (lowerContent.contains(#text "accident") or lowerContent.contains(#text "crash")) {
        "Incident correlation: " # incidentCount.toText() # " active incident(s) in network. " #
        "Congestion level " # congPct # " increases accident probability by " #
        (if (congestion > 0.6) { "35-45%" } else if (congestion > 0.3) { "15-25%" } else { "5-10%" }) # ". " #
        "Officers advised to increase visibility in blocked segments.";
      } else {
        "Traffic Police Dashboard: " # incidentCount.toText() # " active incident(s), " #
        anomalyCount.toText() # " anomaly zones, congestion " # congPct # ". " #
        "Real-time traffic intelligence available. What enforcement data do you need?";
      };

    } else {
      // GeneralUser role
      if (lowerContent.contains(#text "route") or lowerContent.contains(#text "how long") or lowerContent.contains(#text "fastest")) {
        "Route advisor: Current network congestion is " # congPct # ". " #
        (if (congestion > 0.7) {
          "Severe delays expected on major routes. Allow 2-3x normal travel time. Consider delaying trip."
        } else if (congestion > 0.4) {
          "Moderate traffic on main roads. Side streets may save 10-15 minutes."
        } else {
          "Traffic flowing well. Normal travel times expected on most routes."
        }) # " " # incidentCount.toText() # " incident(s) currently affecting road access.";
      } else if (lowerContent.contains(#text "avoid") or lowerContent.contains(#text "closure")) {
        "Road advisory: " # anomalyCount.toText() # " area(s) with disruptions detected. " #
        (if (anomalyCount > 0) {
          "Closures or incidents reported near anomaly zones. Check alternate routes."
        } else {
          "No active road closures reported. Normal routing applies."
        });
      } else if (lowerContent.contains(#text "weather") or lowerContent.contains(#text "condition")) {
        "Road conditions report: Network congestion at " # congPct # ". " #
        anomalyCount.toText() # " unusual pattern(s) detected. " #
        "Drive with caution in " # (if (congestion > 0.5) { "all" } else { "highlighted" }) # " zones.";
      } else {
        "Traffic Assistant: The road network currently has " # congPct # " average congestion. " #
        incidentCount.toText() # " incident(s) and " # anomalyCount.toText() # " anomaly alert(s) active. " #
        "Ask me about routes, delays, or road conditions!";
      };
    };
  };

  public func send(
    messages : Map.Map<Principal, List.List<ChatMessage>>,
    counter : { var value : Nat },
    caller : Principal,
    content : Text,
    ctx : ChatContext,
  ) : ChatMessage {
    let now = Time.now();

    counter.value += 1;
    let userMsg : ChatMessage = {
      id = counter.value;
      role = #user;
      content;
      timestamp = now;
    };

    counter.value += 1;
    let responseText = generateResponse(content, ctx);
    let assistantMsg : ChatMessage = {
      id = counter.value;
      role = #assistant;
      content = responseText;
      timestamp = now;
    };

    let history = switch (messages.get(caller)) {
      case (?existing) { existing };
      case null {
        let newList = List.empty<ChatMessage>();
        messages.add(caller, newList);
        newList;
      };
    };
    history.add(userMsg);
    history.add(assistantMsg);

    assistantMsg;
  };

  public func getHistory(
    messages : Map.Map<Principal, List.List<ChatMessage>>,
    caller : Principal,
  ) : [ChatMessage] {
    switch (messages.get(caller)) {
      case (?history) { history.toArray() };
      case null { [] };
    };
  };
};
