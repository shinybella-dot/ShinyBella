'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Salon } from '@/lib/types';
import { Navigation, Star } from 'lucide-react';

const DEFAULT_CENTER: [number, number] = [13.9931, -89.5547];
const DEFAULT_ZOOM = 13;

const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const SelectedIcon = L.icon({
  iconRetinaUrl,
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x-red.png',
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Función para escapar HTML y prevenir XSS
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const createPopupContent = (salon: Salon): HTMLElement => {
    const container = document.createElement('div');
    container.className = 'p-1 min-w-[200px]';
    
    const h3 = document.createElement('h3');
    h3.className = 'font-semibold text-concrete text-base mb-1';
    h3.textContent = salon.nombre;
    container.appendChild(h3);
    
    const p = document.createElement('p');
    p.className = 'text-warm-steel/70 text-sm mb-2';
    p.textContent = salon.direccion;
    container.appendChild(p);
    
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 text-sm';
    
    const span1 = document.createElement('span');
    span1.className = 'flex items-center gap-1 text-amber-600';
    const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    star.setAttribute('class', 'w-3 h-3 fill-current');
    star.setAttribute('aria-hidden', 'true');
    star.setAttribute('viewBox', '0 0 24 24');
    star.innerHTML = '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>';
    span1.appendChild(star);
    span1.appendChild(document.createTextNode(` ${salon.rating.toFixed(1)}`));
    div.appendChild(span1);
    
    const span2 = document.createElement('span');
    span2.className = 'text-warm-steel/60';
    span2.textContent = `· ${salon.telefono}`;
    div.appendChild(span2);
    
    container.appendChild(div);
    return container;
  };

interface MapaSalonesProps {
  salones: Salon[];
  selectedSalon: Salon | null;
  onSelectSalon: (salon: Salon) => void;
  userLocation: [number, number] | null;
  className?: string;
}

export default function MapaSalones({
  salones,
  selectedSalon,
  onSelectSalon,
  userLocation,
  className,
}: MapaSalonesProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  const initMap = useCallback(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: userLocation || DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    setMapReady(true);
  }, [userLocation]);

  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, [initMap]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;

    salones.forEach((salon) => {
      let marker = markersRef.current.get(salon.id);

      const isSelected = selectedSalon?.id === salon.id;

      if (!marker) {
        marker = L.marker([salon.lat, salon.lng], {
          icon: isSelected ? SelectedIcon : DefaultIcon,
          riseOnHover: true,
        });

        marker.bindPopup(createPopupContent(salon));

        marker.on('click', () => onSelectSalon(salon));
        marker.addTo(map);
        markersRef.current.set(salon.id, marker);
      } else {
        marker.setIcon(isSelected ? SelectedIcon : DefaultIcon);
      }
    });

    markersRef.current.forEach((marker, id) => {
      if (!salones.some((s) => s.id === id)) {
        map.removeLayer(marker);
        markersRef.current.delete(id);
      }
    });

    if (selectedSalon) {
      const marker = markersRef.current.get(selectedSalon.id);
      if (marker) {
        map.setView([selectedSalon.lat, selectedSalon.lng], 15, { animate: true });
        marker.openPopup();
      }
    }
  }, [salones, selectedSalon, mapReady, onSelectSalon]);

  const locateUser = () => {
    if (!mapRef.current) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          mapRef.current?.setView(coords, 15, { animate: true });

          const userMarker = L.marker(coords, { icon: DefaultIcon });
          const popupContent = document.createElement('div');
          popupContent.textContent = 'Tu ubicación actual';
          userMarker.bindPopup(popupContent);
          userMarker.addTo(mapRef.current!).openPopup();
        },
        (error) => {
          let message = 'No se pudo obtener tu ubicación.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Permiso de ubicación denegado. Actívalo en la configuración del navegador.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Ubicación no disponible.';
          } else if (error.code === error.TIMEOUT) {
            message = 'Tiempo de espera agotado al obtener ubicación.';
          }
          console.warn('Geolocation error:', message);
          // TODO: Reemplazar con toast notification
          alert(message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full rounded-xl overflow-hidden border border-warm-steel/20 ${className || ''}`}
      role="application"
      aria-label="Mapa interactivo de salones de belleza"
    >
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-light z-10">
          <div className="flex flex-col items-center gap-3 text-concrete/60">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            <span className="text-sm">Cargando mapa...</span>
          </div>
        </div>
      )}

      <button
        onClick={locateUser}
        className="absolute bottom-4 left-4 z-20 px-3 py-2 bg-white shadow-lg rounded-lg flex items-center gap-2 text-sm font-medium text-concrete hover:bg-surface transition-colors border border-warm-steel/20"
        aria-label="Centrar mapa en mi ubicación"
        type="button"
      >
        <Navigation className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">Mi ubicación</span>
      </button>
    </div>
  );
}