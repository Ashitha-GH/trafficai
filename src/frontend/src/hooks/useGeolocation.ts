import { useEffect, useState } from "react";
import type { GeoState } from "../types";

// Default fallback: New York City
const DEFAULT_LAT = 40.7128;
const DEFAULT_LNG = -74.006;

export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        lat: DEFAULT_LAT,
        lng: DEFAULT_LNG,
        error: "Geolocation not supported. Using default location (NYC).",
        loading: false,
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (err) => {
        setState({
          lat: DEFAULT_LAT,
          lng: DEFAULT_LNG,
          error: `Location access denied (${err.message}). Using default location (NYC).`,
          loading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
}
