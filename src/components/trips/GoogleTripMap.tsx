'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Navigation, ExternalLink, Map as MapIcon, Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { ITripMapLocation } from '@/types';

interface GoogleTripMapProps {
  tripTitle?: string;
  destinationName: string;
  latitude?: number;
  longitude?: number;
  locations?: ITripMapLocation[];
  googlePlaceId?: string;
}

// Declare global google object for TypeScript
declare const google: any;

// Global script loader helper to prevent duplicate script tags
let googleMapsPromise: Promise<void> | null = null;
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window is undefined'));
  if ((window as any).google?.maps) return Promise.resolve();

  if (!googleMapsPromise) {
    googleMapsPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById('google-maps-script') as HTMLScriptElement;
      if (existingScript) {
        if ((window as any).google?.maps) {
          resolve();
        } else {
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', (e: any) => reject(e));
        }
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (err: any) => {
        googleMapsPromise = null;
        reject(err);
      };
      document.head.appendChild(script);
    });
  }

  return googleMapsPromise;
}

function isValidCoordinate(lat?: unknown, lng?: unknown): lat is number {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    isFinite(lat) &&
    isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export default function GoogleTripMap({
  tripTitle,
  destinationName,
  latitude,
  longitude,
  locations = [],
  googlePlaceId,
}: GoogleTripMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [geocodedCoord, setGeocodedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);

  // Clean and sanitize destination name
  const cleanDestName = (destinationName || '').trim();

  // PRIORITY 1: Itinerary locations containing valid latitude & longitude
  const validItineraryLocations = useMemo(() => {
    return locations.filter((loc) => isValidCoordinate(loc.latitude, loc.longitude));
  }, [locations]);

  // PRIORITY 2: Trip's main location coordinate
  const hasValidMainCoords = isValidCoordinate(latitude, longitude);

  // Resolved list of points for display
  const resolvedLocations = useMemo((): ITripMapLocation[] => {
    if (validItineraryLocations.length > 0) {
      return validItineraryLocations;
    }
    if (hasValidMainCoords) {
      return [
        {
          name: cleanDestName || 'Trip Destination',
          latitude: latitude!,
          longitude: longitude!,
          dayNumber: 1,
        },
      ];
    }
    if (geocodedCoord) {
      return [
        {
          name: cleanDestName || 'Trip Destination',
          latitude: geocodedCoord.lat,
          longitude: geocodedCoord.lng,
          dayNumber: 1,
        },
      ];
    }
    return [];
  }, [validItineraryLocations, hasValidMainCoords, latitude, longitude, cleanDestName, geocodedCoord]);

  // Try to load Google Maps JS API if API key is present
  useEffect(() => {
    if (!apiKey) return;
    let isMounted = true;

    // Listen for Google Maps auth or referrer failure to immediately trigger fallback
    if (typeof window !== 'undefined') {
      (window as any).gm_authFailure = () => {
        console.warn('[GoogleTripMap] Google Maps authentication/referrer failure detected, activating fallback embed.');
        if (isMounted) {
          setScriptError(true);
        }
      };
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (isMounted) {
          setScriptLoaded(true);
          setScriptError(false);
        }
      })
      .catch((err: any) => {
        console.warn('[GoogleTripMap] Google Maps JavaScript API failed to load, falling back:', err);
        if (isMounted) {
          setScriptError(true);
          setScriptLoaded(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  // PRIORITY 3: Geocoding Fallback if no coordinates exist and Google API is loaded
  useEffect(() => {
    if (resolvedLocations.length > 0) return; // Already have coordinates
    if (!cleanDestName || cleanDestName.toLowerCase() === 'bangladesh') return;
    if (!scriptLoaded || typeof window === 'undefined' || !(window as any).google?.maps) return;

    let isMounted = true;
    setIsGeocoding(true);

    const geocoder = new google.maps.Geocoder();
    const query = cleanDestName.toLowerCase().includes('bangladesh')
      ? cleanDestName
      : `${cleanDestName}, Bangladesh`;

    geocoder.geocode({ address: query }, (results: any, status: any) => {
      if (!isMounted) return;
      setIsGeocoding(false);
      if (status === google.maps.GeocoderStatus.OK && results && results[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        setGeocodedCoord({ lat: loc.lat(), lng: loc.lng() });
      } else {
        console.warn(`[GoogleTripMap] Geocoding fallback could not resolve "${query}": status ${status}`);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [cleanDestName, scriptLoaded, resolvedLocations.length]);

  // Initialize and update Google Map canvas when script is loaded and coordinates are resolved
  useEffect(() => {
    if (!scriptLoaded || !mapContainerRef.current || resolvedLocations.length === 0 || !(window as any).google?.maps) {
      return;
    }

    // Clear existing markers and lines from previous trip to prevent stale state on navigation
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // Create InfoWindow singleton
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }

    // Initialize Map if not already initialized
    if (!mapInstanceRef.current) {
      const initialCenter = {
        lat: resolvedLocations[0].latitude,
        lng: resolvedLocations[0].longitude,
      };

      mapInstanceRef.current = new google.maps.Map(mapContainerRef.current, {
        center: initialCenter,
        zoom: resolvedLocations.length === 1 ? 13 : 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        gestureHandling: 'cooperative',
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#cbd5e1' }],
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#38bdf8' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#14342b' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#34d399' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#334155' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#1e293b' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#059669' }],
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#1e293b' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#0f172a' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#64748b' }],
          },
        ],
      });
    }

    const map = mapInstanceRef.current;
    const bounds = new google.maps.LatLngBounds();
    const pathCoordinates: Array<{ lat: number; lng: number }> = [];

    // STEP 9 & 10: Create markers for ALL valid locations
    resolvedLocations.forEach((loc, index) => {
      const position = { lat: loc.latitude, lng: loc.longitude };
      bounds.extend(position);
      pathCoordinates.push(position);

      const dayLabel = loc.dayNumber ? `Day ${loc.dayNumber}` : `#${index + 1}`;
      const marker = new google.maps.Marker({
        position,
        map,
        title: `${dayLabel}: ${loc.name}`,
        label: {
          text: String(loc.dayNumber || index + 1),
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '12px',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#059669',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      marker.addListener('click', () => {
        setActiveStopIndex(index);
        const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`;
        const contentString = `
          <div style="color: #0f172a; padding: 6px; font-family: sans-serif; min-width: 170px;">
            <div style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase; margin-bottom: 2px;">
              ${dayLabel}
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
              ${loc.name}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
              ${loc.latitude.toFixed(4)}° N, ${loc.longitude.toFixed(4)}° E
            </div>
            <a href="${directionsLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 4px 10px; background: #059669; color: white; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none;">
              Get Directions ↗
            </a>
          </div>
        `;
        infoWindowRef.current?.setContent(contentString);
        infoWindowRef.current?.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    // STEP 11: Route Line between itinerary points
    if (pathCoordinates.length > 1) {
      polylineRef.current = new google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: '#10B981',
        strokeOpacity: 0.85,
        strokeWeight: 3.5,
        map,
      });
    }

    // STEP 10: Map Center and Bounds
    if (resolvedLocations.length === 1) {
      map.setCenter(pathCoordinates[0]);
      map.setZoom(13);
    } else if (resolvedLocations.length > 1) {
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      // Safeguard zoom level if points are too close
      const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
        if (map.getZoom() && map.getZoom()! > 15) {
          map.setZoom(15);
        }
      });
      return () => google.maps.event.removeListener(listener);
    }
  }, [scriptLoaded, resolvedLocations]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((m: any) => m.setMap(null));
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // Primary display location coordinates for URLs and headers
  const primaryLocation = resolvedLocations[0] || null;
  const primaryLat = primaryLocation?.latitude;
  const primaryLng = primaryLocation?.longitude;

  // External Links with exact coordinates or destination query
  const queryParam =
    primaryLat !== undefined && primaryLng !== undefined
      ? `${primaryLat},${primaryLng}`
      : encodeURIComponent(cleanDestName ? `${cleanDestName}, Bangladesh` : 'Bangladesh');

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${queryParam}${
    googlePlaceId ? `&query_place_id=${googlePlaceId}` : ''
  }`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${queryParam}`;

  // Embed URL for fallback when API key is missing or script fails
  const embedUrl = useMemo(() => {
    if (primaryLat !== undefined && primaryLng !== undefined) {
      return `https://maps.google.com/maps?q=${primaryLat},${primaryLng}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    }
    if (cleanDestName) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(
        cleanDestName.toLowerCase().includes('bangladesh') ? cleanDestName : `${cleanDestName}, Bangladesh`
      )}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
    }
    return '';
  }, [primaryLat, primaryLng, cleanDestName]);

  // Handle clicking stop pills to pan map
  const handleSelectStop = (idx: number) => {
    setActiveStopIndex(idx);
    const loc = resolvedLocations[idx];
    if (loc && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: loc.latitude, lng: loc.longitude });
      mapInstanceRef.current.setZoom(14);
      const marker = markersRef.current[idx];
      if (marker) {
        google.maps.event.trigger(marker, 'click');
      }
    }
  };

  // STEP 13: NO LOCATION STATE
  // If a Trip has no usable map location and no destination name
  if (!cleanDestName && resolvedLocations.length === 0) {
    return (
      <div className="w-full bg-slate-900 border border-white/10 rounded-2xl sm:rounded-3xl p-6 shadow-2xl my-6 sm:my-8 text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Compass className="w-6 h-6" />
        </div>
        <h3 className="font-display text-lg font-bold text-white uppercase mb-1">
          Map Location Not Available
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Map location is not available for this trip yet. The explorer has not attached geographic coordinates.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 my-6 sm:my-8 transition-all">
      {/* Map Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider mb-1">
            <MapIcon className="w-3 h-3" />
            <span>
              {resolvedLocations.length > 1
                ? `${resolvedLocations.length} Itinerary Stops Mapped`
                : 'Interactive Trip Location'}
            </span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-bold text-white uppercase flex items-center space-x-2">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-brand-400 shrink-0" />
            <span>
              {cleanDestName && cleanDestName.toLowerCase() !== 'bangladesh'
                ? cleanDestName
                : (resolvedLocations[0]?.name || cleanDestName || 'Trip Map')}
            </span>
          </h3>

          {primaryLat !== undefined && primaryLng !== undefined ? (
            <p className="text-slate-400 text-xs mt-0.5 font-mono">
              {resolvedLocations.length === 1
                ? `Coordinates: ${primaryLat.toFixed(4)}° N, ${primaryLng.toFixed(4)}° E`
                : `Primary Location: ${primaryLat.toFixed(4)}° N, ${primaryLng.toFixed(4)}° E (${resolvedLocations.length} stops)`}
            </p>
          ) : isGeocoding ? (
            <p className="text-brand-400 text-xs mt-0.5 flex items-center space-x-1.5">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Resolving map coordinates via Google Geocoder...</span>
            </p>
          ) : (
            <p className="text-slate-400 text-xs mt-0.5">
              Location: {cleanDestName}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions</span>
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 rounded-xl transition-all active:scale-95"
          >
            <span>Open in Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Multi-Stop Itinerary Chips */}
      {resolvedLocations.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">Stops:</span>
          {resolvedLocations.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectStop(idx)}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                activeStopIndex === idx
                  ? 'bg-brand-500 text-white border-brand-400 font-bold shadow'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] font-extrabold flex items-center justify-center">
                {loc.dayNumber || idx + 1}
              </span>
              <span>{loc.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Map Container */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
        {/* Case A: JavaScript Interactive API when key is available and loaded */}
        {apiKey && !scriptError ? (
          <>
            {!scriptLoaded && (
              <div className="absolute inset-0 bg-slate-900 animate-pulse flex flex-col items-center justify-center space-y-3 z-10">
                <MapPin className="w-8 h-8 text-brand-400 animate-bounce" />
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Loading Interactive Google Map...
                </p>
              </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full" />
          </>
        ) : (
          /* Case B: Fallback Iframe Embed when API key is omitted or script blocked */
          <>
            {!iframeLoaded && (
              <div className="absolute inset-0 bg-slate-900 animate-pulse flex flex-col items-center justify-center space-y-3 z-10">
                <MapPin className="w-8 h-8 text-brand-400 animate-bounce" />
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Loading Map Preview...
                </p>
              </div>
            )}

            {embedUrl ? (
              <iframe
                title={`Google Map for ${cleanDestName || tripTitle || 'Trip'}`}
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                onLoad={() => setIframeLoaded(true)}
                className="w-full h-full filter contrast-[1.05] brightness-[0.95]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-400" />
                <p className="text-xs">Map location is not available for this trip yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

