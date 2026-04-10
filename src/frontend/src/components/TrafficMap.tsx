import { useEffect, useRef } from "react";
import type {
  AnomalyPublic,
  EdgeCases,
  EmergencyRequestPublic,
  IncidentPublic,
  Location,
  TrafficSegmentPublic,
  VehiclePublic,
} from "../types";
import { CongestionLevel, VehicleType } from "../types";

interface TrafficMapProps {
  segments: TrafficSegmentPublic[];
  vehicles: VehiclePublic[];
  incidents: IncidentPublic[];
  anomalies?: AnomalyPublic[];
  userLat: number;
  userLng: number;
  highlightRoute?: Location[];
  emergencyRoutes?: EmergencyRequestPublic[];
  edgeCases?: EdgeCases;
  className?: string;
}

const CONGESTION_COLOR: Record<CongestionLevel, string> = {
  [CongestionLevel.free]: "#22c55e",
  [CongestionLevel.moderate]: "#f59e0b",
  [CongestionLevel.heavy]: "#f97316",
  [CongestionLevel.blocked]: "#ef4444",
};

const VEHICLE_COLOR: Record<VehicleType, string> = {
  [VehicleType.Ambulance]: "#ef4444",
  [VehicleType.FireTruck]: "#f97316",
  [VehicleType.Police]: "#3b82f6",
  [VehicleType.VIP]: "#a855f7",
  [VehicleType.GeneralVehicle]: "#6b7280",
};

const EMERGENCY_ROUTE_COLOR = "#ff4500";
const EMERGENCY_ROUTE_GLOW = "rgba(255, 69, 0, 0.4)";

// Default NYC grid shown while backend data is loading
const DEFAULT_SEGMENTS: Array<{
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  congestion: string;
}> = [
  {
    startLat: 40.705,
    startLng: -74.025,
    endLat: 40.705,
    endLng: -73.96,
    congestion: "#22c55e",
  },
  {
    startLat: 40.715,
    startLng: -74.025,
    endLat: 40.715,
    endLng: -73.96,
    congestion: "#f59e0b",
  },
  {
    startLat: 40.725,
    startLng: -74.025,
    endLat: 40.725,
    endLng: -73.96,
    congestion: "#22c55e",
  },
  {
    startLat: 40.735,
    startLng: -74.025,
    endLat: 40.735,
    endLng: -73.96,
    congestion: "#f97316",
  },
  {
    startLat: 40.745,
    startLng: -74.025,
    endLat: 40.745,
    endLng: -73.96,
    congestion: "#22c55e",
  },
  {
    startLat: 40.7,
    startLng: -74.02,
    endLat: 40.75,
    endLng: -74.02,
    congestion: "#22c55e",
  },
  {
    startLat: 40.7,
    startLng: -74.005,
    endLat: 40.75,
    endLng: -74.005,
    congestion: "#f59e0b",
  },
  {
    startLat: 40.7,
    startLng: -73.99,
    endLat: 40.75,
    endLng: -73.99,
    congestion: "#ef4444",
  },
  {
    startLat: 40.7,
    startLng: -73.975,
    endLat: 40.75,
    endLng: -73.975,
    congestion: "#22c55e",
  },
  {
    startLat: 40.7,
    startLng: -73.962,
    endLat: 40.75,
    endLng: -73.962,
    congestion: "#f97316",
  },
];

function getBounds(
  segments: TrafficSegmentPublic[],
  vehicles: VehiclePublic[],
  incidents: IncidentPublic[],
  userLat: number,
  userLng: number,
  emergencyRoutes: EmergencyRequestPublic[],
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const lats: number[] = [userLat];
  const lngs: number[] = [userLng];

  for (const s of segments) {
    lats.push(s.startLat, s.endLat);
    lngs.push(s.startLng, s.endLng);
  }
  for (const v of vehicles) {
    lats.push(v.location.lat);
    lngs.push(v.location.lng);
  }
  for (const i of incidents) {
    lats.push(i.location.lat);
    lngs.push(i.location.lng);
  }
  for (const r of emergencyRoutes) {
    for (const pt of r.routePoints) {
      lats.push(pt.lat);
      lngs.push(pt.lng);
    }
    lats.push(r.destinationLat, r.destinationLng);
  }

  if (segments.length === 0) {
    return { minLat: 40.695, maxLat: 40.755, minLng: -74.03, maxLng: -73.955 };
  }

  const pad = 0.005;
  return {
    minLat: Math.min(...lats) - pad,
    maxLat: Math.max(...lats) + pad,
    minLng: Math.min(...lngs) - pad,
    maxLng: Math.max(...lngs) + pad,
  };
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 10;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - size * Math.cos(angle - Math.PI / 6),
    y2 - size * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    x2 - size * Math.cos(angle + Math.PI / 6),
    y2 - size * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fill();
}

function drawConstructionZone(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pulse: number,
) {
  ctx.save();
  ctx.shadowColor = "#f97316";
  ctx.shadowBlur = 6 + Math.sin(pulse) * 2;
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 10);
  ctx.lineTo(cx + 7, cy + 6);
  ctx.lineTo(cx - 7, cy + 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(cx - 5, cy - 1, 10, 2.5);
  ctx.fillStyle = "#f97316";
  ctx.fillRect(cx - 7, cy + 5, 14, 3);
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawEventMarker(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pulse: number,
) {
  ctx.save();
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 8 + Math.sin(pulse) * 3;
  ctx.fillStyle = "#a855f7";
  const spikes = 5;
  const outerR = 9;
  const innerR = 4;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawRoadClosure(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pulse: number,
) {
  ctx.save();
  ctx.globalAlpha = 0.7 + Math.sin(pulse) * 0.3;
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#ef4444";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 6);
  ctx.lineTo(cx + 6, cy + 6);
  ctx.moveTo(cx + 6, cy - 6);
  ctx.lineTo(cx - 6, cy + 6);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function TrafficMap({
  segments,
  vehicles,
  incidents,
  anomalies = [],
  userLat,
  userLng,
  highlightRoute,
  emergencyRoutes = [],
  edgeCases,
  className = "",
}: TrafficMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resizeCanvas() {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const W = Math.max(rect.width, 300);
      const H = Math.max(rect.height, 420);
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
    }

    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(container);
    resizeCanvas();

    const bounds = getBounds(
      segments,
      vehicles,
      incidents,
      userLat,
      userLng,
      emergencyRoutes,
    );

    function toX(lng: number) {
      if (!canvas) return 0;
      return (
        ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) *
          (canvas.width - 40) +
        20
      );
    }
    function toY(lat: number) {
      if (!canvas) return 0;
      return (
        canvas.height -
        ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) *
          (canvas.height - 40) -
        20
      );
    }

    let pulse = 0;

    function draw() {
      if (!ctx || !canvas) return;
      const W = canvas.width;
      const H = canvas.height;
      pulse = (pulse + 0.05) % (Math.PI * 2);
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const gx = (W / 10) * i;
        const gy = (H / 10) * i;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      // Default city grid while loading
      if (segments.length === 0) {
        for (const seg of DEFAULT_SEGMENTS) {
          const sx1 = toX(seg.startLng);
          const sy1 = toY(seg.startLat);
          const sx2 = toX(seg.endLng);
          const sy2 = toY(seg.endLat);
          ctx.strokeStyle = "rgba(255,255,255,0.08)";
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(sx1, sy1);
          ctx.lineTo(sx2, sy2);
          ctx.stroke();
          ctx.strokeStyle = seg.congestion;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.moveTo(sx1, sy1);
          ctx.lineTo(sx2, sy2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.font = "11px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.textAlign = "center";
        ctx.fillText(
          "Simulated city grid — live data loading...",
          W / 2,
          H - 8,
        );
      }

      // Backend road segments
      for (const seg of segments) {
        const rx1 = toX(seg.startLng);
        const ry1 = toY(seg.startLat);
        const rx2 = toX(seg.endLng);
        const ry2 = toY(seg.endLat);
        const color = CONGESTION_COLOR[seg.congestionLevel] ?? "#6b7280";
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(rx1, ry1);
        ctx.lineTo(rx2, ry2);
        ctx.stroke();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(rx1, ry1);
        ctx.lineTo(rx2, ry2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Highlighted route (cyan dashed)
      if (highlightRoute && highlightRoute.length > 1) {
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let i = 0; i < highlightRoute.length; i++) {
          const hrx = toX(highlightRoute[i].lng);
          const hry = toY(highlightRoute[i].lat);
          if (i === 0) ctx.moveTo(hrx, hry);
          else ctx.lineTo(hrx, hry);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      }

      // Approved emergency routes
      for (const route of emergencyRoutes) {
        const pts = route.routePoints;
        const drawPts: { lat: number; lng: number }[] =
          pts.length >= 2
            ? pts
            : [
                { lat: userLat, lng: userLng },
                { lat: route.destinationLat, lng: route.destinationLng },
              ];
        if (drawPts.length < 2) continue;

        ctx.strokeStyle = EMERGENCY_ROUTE_GLOW;
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = EMERGENCY_ROUTE_COLOR;
        ctx.shadowBlur = 12 + Math.sin(pulse) * 4;
        ctx.beginPath();
        for (let i = 0; i < drawPts.length; i++) {
          const epx = toX(drawPts[i].lng);
          const epy = toY(drawPts[i].lat);
          if (i === 0) ctx.moveTo(epx, epy);
          else ctx.lineTo(epx, epy);
        }
        ctx.stroke();

        ctx.strokeStyle = EMERGENCY_ROUTE_COLOR;
        ctx.lineWidth = 5;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        for (let i = 0; i < drawPts.length; i++) {
          const ecx = toX(drawPts[i].lng);
          const ecy = toY(drawPts[i].lat);
          if (i === 0) ctx.moveTo(ecx, ecy);
          else ctx.lineTo(ecx, ecy);
        }
        ctx.stroke();

        for (let i = 1; i < drawPts.length; i += 3) {
          drawArrow(
            ctx,
            toX(drawPts[i - 1].lng),
            toY(drawPts[i - 1].lat),
            toX(drawPts[i].lng),
            toY(drawPts[i].lat),
            EMERGENCY_ROUTE_COLOR,
          );
        }

        const edx = toX(route.destinationLng);
        const edy = toY(route.destinationLat);
        const epr = 10 + Math.sin(pulse) * 4;
        ctx.fillStyle = "rgba(255, 69, 0, 0.2)";
        ctx.beginPath();
        ctx.arc(edx, edy, epr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = EMERGENCY_ROUTE_COLOR;
        ctx.beginPath();
        ctx.arc(edx, edy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.fillText(route.vehicleType, edx, edy - 14);
        ctx.fillStyle = EMERGENCY_ROUTE_COLOR;
        ctx.fillText(route.vehicleId, edx, edy - 24);
      }

      ctx.shadowBlur = 0;
      ctx.setLineDash([]);

      // Edge cases
      if (edgeCases) {
        for (const closure of edgeCases.roadClosures) {
          const clx = toX(closure.lng);
          const cly = toY(closure.lat);
          drawRoadClosure(ctx, clx, cly, pulse);
          ctx.font = "9px monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = "#ef4444";
          ctx.fillText("CLOSED", clx, cly + 22);
        }

        for (const zone of edgeCases.constructionZones) {
          const czx = toX(zone.lng);
          const czy = toY(zone.lat);
          drawConstructionZone(ctx, czx, czy, pulse);
          ctx.font = "9px monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = "#f97316";
          ctx.fillText(zone.streetName.slice(0, 10), czx, czy + 22);
        }

        for (const evt of edgeCases.specialEvents) {
          const evx = toX(evt.lng);
          const evy = toY(evt.lat);
          drawEventMarker(ctx, evx, evy, pulse);
          ctx.font = "9px monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = "#a855f7";
          ctx.fillText(evt.name.slice(0, 12), evx, evy + 22);
        }

        if (edgeCases.weather !== "Clear") {
          const weatherColors: Record<string, string> = {
            Rain: "rgba(59,130,246,0.06)",
            Fog: "rgba(200,200,200,0.08)",
            Snow: "rgba(186,230,253,0.07)",
            Ice: "rgba(147,197,253,0.06)",
          };
          const tint = weatherColors[edgeCases.weather];
          if (tint) {
            ctx.fillStyle = tint;
            ctx.fillRect(0, 0, W, H);
          }
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "right";
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fillText(`⛅ ${edgeCases.weather}`, W - 10, 16);
        }
      }

      // Vehicles
      for (const v of vehicles) {
        const vvx = toX(v.location.lng);
        const vvy = toY(v.location.lat);
        const vcolor = VEHICLE_COLOR[v.vehicleType] ?? "#6b7280";
        ctx.fillStyle = vcolor;
        ctx.beginPath();
        ctx.arc(vvx, vvy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Incidents
      for (const inc of incidents) {
        const iix = toX(inc.location.lng);
        const iiy = toY(inc.location.lat);
        const ir = 7;
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(iix - ir, iiy - ir);
        ctx.lineTo(iix + ir, iiy + ir);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(iix + ir, iiy - ir);
        ctx.lineTo(iix - ir, iiy + ir);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Anomalies
      for (const anom of anomalies) {
        const aanx = toX(anom.location.lng);
        const aany = toY(anom.location.lat);
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.moveTo(aanx, aany - 8);
        ctx.lineTo(aanx + 7, aany + 5);
        ctx.lineTo(aanx - 7, aany + 5);
        ctx.closePath();
        ctx.fill();
      }

      // User location (pulsing blue dot)
      const ulx = toX(userLng);
      const uly = toY(userLat);
      const pulseRadius = 12 + Math.sin(pulse) * 4;
      ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
      ctx.beginPath();
      ctx.arc(ulx, uly, pulseRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(ulx, uly, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#93c5fd";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Legend
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      const legendItems = [
        { color: "#22c55e", label: "Free" },
        { color: "#f59e0b", label: "Moderate" },
        { color: "#f97316", label: "Heavy" },
        { color: "#ef4444", label: "Blocked" },
        ...(emergencyRoutes.length > 0
          ? [{ color: EMERGENCY_ROUTE_COLOR, label: "Emerg. Route" }]
          : []),
        ...(edgeCases?.constructionZones.length
          ? [{ color: "#f97316", label: "🔶 Construction" }]
          : []),
        ...(edgeCases?.specialEvents.length
          ? [{ color: "#a855f7", label: "★ Event" }]
          : []),
        ...(edgeCases?.roadClosures.length
          ? [{ color: "#ef4444", label: "✕ Road Closed" }]
          : []),
      ];
      legendItems.forEach((item, i) => {
        const lx = 10;
        const ly = H - 12 - i * 15;
        ctx.fillStyle = item.color;
        ctx.fillRect(lx, ly - 7, 9, 9);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fillText(item.label, lx + 13, ly);
      });

      frameRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, [
    segments,
    vehicles,
    incidents,
    anomalies,
    userLat,
    userLng,
    highlightRoute,
    emergencyRoutes,
    edgeCases,
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-md overflow-hidden ${className}`}
      style={{ minHeight: "420px", height: "420px" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        aria-label="Traffic map canvas"
      />
    </div>
  );
}
