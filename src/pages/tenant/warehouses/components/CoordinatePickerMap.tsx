import "leaflet/dist/leaflet.css";

import L from "leaflet";
// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CoordinatePickerMapProps {
  coordinates: { lat: number; lng: number } | undefined;
  onCoordinatesChange: (coords: { lat: number; lng: number }) => void;
}

function LocationMarker({
  onCoordinatesChange,
}: {
  onCoordinatesChange: (coords: { lat: number; lng: number }) => void;
}) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | undefined>(undefined);

  useMapEvents({
    click(e) {
      const newPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPosition);
      onCoordinatesChange(newPosition);
    },
  });

  return position === undefined ? null : <Marker position={[position.lat, position.lng]} />;
}

export function CoordinatePickerMap({ coordinates, onCoordinatesChange }: CoordinatePickerMapProps) {
  const center: [number, number] = coordinates ? [coordinates.lat, coordinates.lng] : [20.5937, 78.9629]; // India center as default

  return (
    <div className="h-[400px] w-full rounded-md overflow-hidden border relative">
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        key={`${center[0]}-${center[1]}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coordinates && <Marker position={[coordinates.lat, coordinates.lng]} />}
        <LocationMarker onCoordinatesChange={onCoordinatesChange} />
      </MapContainer>
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-md text-xs border z-[1000]">
        Click on the map to set warehouse location
      </div>
    </div>
  );
}
