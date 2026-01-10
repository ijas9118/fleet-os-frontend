import "leaflet/dist/leaflet.css";

import L from "leaflet";
// Fix for default marker icon not showing
// See: https://github.com/PaulLeCam/react-leaflet/issues/453
import iconIs from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

const DefaultIcon = L.icon({
  iconUrl: iconIs,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface WarehouseMapProps {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

// Component to update map center when coordinates change
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

export function WarehouseMap({ lat, lng, name, address }: WarehouseMapProps) {
  return (
    <div className="h-[300px] w-full rounded-md overflow-hidden border z-0 relative">
      <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <div className="text-sm">
              <strong className="block mb-1">{name}</strong>
              <span className="text-muted-foreground">{address}</span>
            </div>
          </Popup>
        </Marker>
        <MapUpdater lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}
