import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChatBoard } from "./components/ChatBoard";
import { Layout } from "./components/Layout";
import { TrafficMap } from "./components/TrafficMap";
import {
  useGetAnomalies,
  useGetEmergencyRequests,
  useGetIncidents,
  useGetTrafficSegments,
  useGetTrafficStats,
  useGetVehicles,
} from "./hooks/useBackend";
import { useGeolocation } from "./hooks/useGeolocation";
import { ControlPanel } from "./pages/ControlPanel";
import { EmergenciesPanel } from "./pages/EmergenciesPanel";
import { LoginControlPanelPage } from "./pages/LoginControlPanelPage";
import { LoginPage } from "./pages/LoginPage";
import { LoginTrafficPolicePage } from "./pages/LoginTrafficPolicePage";
import { RegisterControlPanelPage } from "./pages/RegisterControlPanelPage";
import { RegisterTrafficPolicePage } from "./pages/RegisterTrafficPolicePage";
import { TrafficPolicePanel } from "./pages/TrafficPolicePanel";
import { UserPanel } from "./pages/UserPanel";
import type { DashboardTab, EdgeCases, EmergencyRequestPublic } from "./types";
import { EmergencyStatus } from "./types";

const DEFAULT_EDGE_CASES: EdgeCases = {
  constructionZones: [],
  specialEvents: [],
  weather: "Clear",
  roadClosures: [],
};

const VALID_TABS: DashboardTab[] = [
  "user",
  "emergencies",
  "control-panel",
  "traffic-police",
];

// ── Root ──────────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: () => <Outlet /> });

// ── Index ─────────────────────────────────────────────────────────────────────
function IndexPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("trafficai_role") as DashboardTab | null;
    if (!isInitializing && identity) {
      navigate({ to: "/dashboard", search: { tab: "user" } });
    } else if (!isInitializing && role && VALID_TABS.includes(role)) {
      navigate({ to: "/dashboard", search: { tab: role } });
    }
  }, [identity, isInitializing, navigate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (identity) return null;
  return <LoginPage />;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexPage,
});

// ── Emergency alert banner ────────────────────────────────────────────────────
interface EmergencyAlertProps {
  request: EmergencyRequestPublic;
  onDismiss: () => void;
}

function EmergencyAlert({ request, onDismiss }: EmergencyAlertProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pointer-events-none"
      data-ocid="emergency-alert-overlay"
    >
      <div
        className="pointer-events-auto w-full max-w-lg rounded-xl border-2 border-destructive/60 bg-destructive/10 backdrop-blur-sm shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300"
        style={{
          boxShadow: "0 0 40px rgba(239,68,68,0.3), 0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        {/* Alert header */}
        <div className="flex items-center gap-3 px-5 py-3 bg-destructive/20 border-b border-destructive/30">
          <div className="w-3 h-3 rounded-full bg-destructive animate-ping absolute" />
          <div className="w-3 h-3 rounded-full bg-destructive shrink-0" />
          <p className="font-mono text-xs font-bold text-destructive uppercase tracking-widest flex-1">
            🚨 Emergency Vehicle Alert
          </p>
          <button
            type="button"
            onClick={onDismiss}
            className="text-destructive/70 hover:text-destructive transition-colors text-lg leading-none"
            aria-label="Dismiss alert"
          >
            ×
          </button>
        </div>

        {/* Alert body */}
        <div className="px-5 py-4 space-y-2">
          <p className="font-display text-lg font-bold text-foreground">
            {request.vehicleType} en route to{" "}
            <span className="text-destructive">{request.destination}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Vehicle{" "}
            <span className="font-mono text-foreground">
              {request.vehicleId}
            </span>{" "}
            has been approved and is now en route. Please yield the route and
            move to the side.
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground font-mono">
              Auto-dismisses in 10 seconds
            </span>
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs text-destructive underline hover:no-underline"
            >
              Dismiss now
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-destructive/20">
          <div
            className="h-full bg-destructive"
            style={{
              animation: "shrink-width 10s linear forwards",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) ?? "user",
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const { tab } = dashboardRoute.useSearch();
  const activeTab: DashboardTab = VALID_TABS.includes(tab as DashboardTab)
    ? (tab as DashboardTab)
    : "user";

  function setActiveTab(next: DashboardTab) {
    navigate({ to: "/dashboard", search: (prev) => ({ ...prev, tab: next }) });
  }

  const { data: vehicles = [] } = useGetVehicles();
  const { data: incidents = [] } = useGetIncidents();
  const { data: segments = [] } = useGetTrafficSegments();
  const { data: anomalies = [] } = useGetAnomalies();
  const { data: trafficStats } = useGetTrafficStats();
  const { data: emergencyRequests = [] } = useGetEmergencyRequests();
  const geo = useGeolocation();

  // Edge cases state — managed here so TrafficMap + TrafficPolicePanel share it
  const [edgeCases, setEdgeCases] = useState<EdgeCases>(DEFAULT_EDGE_CASES);

  // Track newly approved requests for general user popup
  const prevRequestsRef = useRef<Map<string, string>>(new Map());
  const [alertQueue, setAlertQueue] = useState<EmergencyRequestPublic[]>([]);

  useEffect(() => {
    const prev = prevRequestsRef.current;
    const newAlerts: EmergencyRequestPublic[] = [];

    for (const req of emergencyRequests) {
      const key = req.requestId.toString();
      const prevStatus = prev.get(key);
      if (
        req.status === EmergencyStatus.approved &&
        prevStatus !== EmergencyStatus.approved
      ) {
        newAlerts.push(req);
      }
    }

    const nextMap = new Map<string, string>();
    for (const req of emergencyRequests) {
      nextMap.set(req.requestId.toString(), req.status);
    }
    prevRequestsRef.current = nextMap;

    if (newAlerts.length > 0) {
      setAlertQueue((q) => [...q, ...newAlerts]);
    }
  }, [emergencyRequests]);

  function dismissAlert() {
    setAlertQueue((q) => q.slice(1));
  }

  const approvedRoutes = emergencyRequests.filter(
    (r) => r.status === EmergencyStatus.approved,
  );

  const roleLogin = localStorage.getItem("trafficai_role");
  const isAuthorized = identity || roleLogin;

  useEffect(() => {
    if (!isInitializing && !isAuthorized) {
      navigate({ to: "/" });
    }
  }, [isAuthorized, isInitializing, navigate]);

  if (isInitializing || !isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  const sharedProps = {
    vehicles,
    incidents,
    segments,
    anomalies,
    trafficStats: trafficStats ?? null,
    geo,
    emergencyRequests,
    approvedRoutes,
  };

  function renderPanel() {
    if (activeTab === "emergencies")
      return <EmergenciesPanel {...sharedProps} />;
    if (activeTab === "control-panel") return <ControlPanel {...sharedProps} />;
    if (activeTab === "traffic-police")
      return (
        <TrafficPolicePanel
          {...sharedProps}
          edgeCases={edgeCases}
          onEdgeCasesChange={setEdgeCases}
        />
      );
    return <UserPanel {...sharedProps} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* General user emergency alert popup */}
      {alertQueue.length > 0 && activeTab === "user" && (
        <EmergencyAlert request={alertQueue[0]} onDismiss={dismissAlert} />
      )}

      <div className="flex flex-col lg:flex-row h-[calc(100vh-8.5rem)] overflow-hidden">
        <div className="flex-1 overflow-y-auto min-w-0">{renderPanel()}</div>
        <div className="w-full lg:w-[340px] xl:w-[380px] flex flex-col border-t lg:border-t-0 lg:border-l border-border shrink-0 overflow-hidden">
          <div className="border-b border-border p-3 bg-card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Live Traffic Map
              </p>
              <div className="flex items-center gap-2">
                {geo.error && (
                  <span className="text-[10px] text-accent truncate max-w-[120px]">
                    ⚠ Simulated
                  </span>
                )}
                {edgeCases.weather !== "Clear" && (
                  <span className="text-[10px] text-primary font-mono">
                    ⛅ {edgeCases.weather}
                  </span>
                )}
                {approvedRoutes.length > 0 && (
                  <span className="text-[10px] text-destructive font-mono font-semibold animate-pulse">
                    🚨 {approvedRoutes.length} active
                  </span>
                )}
              </div>
            </div>
            <TrafficMap
              segments={segments}
              vehicles={vehicles}
              incidents={incidents}
              anomalies={anomalies}
              userLat={geo.lat}
              userLng={geo.lng}
              emergencyRoutes={approvedRoutes}
              edgeCases={edgeCases}
            />
          </div>
          <div
            className="flex-1 overflow-hidden p-3 bg-background"
            style={{ minHeight: "280px" }}
          >
            <ChatBoard
              dashboardRole={activeTab}
              trafficStats={trafficStats ?? null}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ── Role login pages ──────────────────────────────────────────────────────────
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => <Outlet />,
});

const loginControlPanelRoute = createRoute({
  getParentRoute: () => loginRoute,
  path: "/control-panel",
  component: LoginControlPanelPage,
});

const loginTrafficPoliceRoute = createRoute({
  getParentRoute: () => loginRoute,
  path: "/traffic-police",
  component: LoginTrafficPolicePage,
});

// ── Register parent ───────────────────────────────────────────────────────────
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: () => <Outlet />,
});

const registerTrafficPoliceRoute = createRoute({
  getParentRoute: () => registerRoute,
  path: "/traffic-police",
  component: RegisterTrafficPolicePage,
});

const registerControlPanelRoute = createRoute({
  getParentRoute: () => registerRoute,
  path: "/control-panel",
  component: RegisterControlPanelPage,
});

// ── Router ────────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  loginRoute.addChildren([loginControlPanelRoute, loginTrafficPoliceRoute]),
  registerRoute.addChildren([
    registerTrafficPoliceRoute,
    registerControlPanelRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
