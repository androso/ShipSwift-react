export interface SWLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

type Listener = () => void;

/**
 * Geolocation manager matching SWLocationManager.swift (web Geolocation API).
 */
export class SWLocationManager {
  currentLocation: SWLocation | null = null;
  isAuthorized = false;
  isAuthorizationDetermined = false;
  userLocation: GeolocationPosition | null = null;

  private listeners = new Set<Listener>();

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit() {
    for (const l of this.listeners) l();
  }

  startLocationServices(): void {
    this.userLocation = null;
    this.currentLocation = null;
    this.emit();
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        this.isAuthorized = true;
        this.isAuthorizationDetermined = true;
        this.userLocation = pos;
        const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        this.currentLocation = {
          id: crypto.randomUUID(),
          name,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        this.emit();
      },
      () => {
        this.isAuthorizationDetermined = true;
        this.isAuthorized = false;
        this.emit();
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  openSettings(): void {
    // Browsers do not expose a settings deep-link; no-op with a console hint.
    console.info("Allow location access in the browser site settings.");
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return "";
    const data = (await res.json()) as { address?: { city?: string; town?: string; village?: string } };
    return data.address?.city ?? data.address?.town ?? data.address?.village ?? "";
  } catch {
    return "";
  }
}
