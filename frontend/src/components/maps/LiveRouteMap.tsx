import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation } from 'lucide-react';

// Fix Leaflet Marker Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom pulsing icon for user
const userIcon = L.divIcon({
    className: 'bg-transparent',
    html: `<div class="relative flex h-4 w-4">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg"></span>
          </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

interface LiveRouteMapProps {
    currentPos: { lat: number, lng: number };
    destinationPos?: { lat: number, lng: number } | null;
}

// Component to handle map view updates
const MapUpdater = ({ center }: { center: { lat: number, lng: number } }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 15, { duration: 2 });
    }, [center, map]);
    return null;
};

const LiveRouteMap: React.FC<LiveRouteMapProps> = ({ currentPos, destinationPos }) => {
    return (
        <div className="w-full h-full relative z-0">
            {/* @ts-ignore */}
            <MapContainer
                center={currentPos}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                dragging={true}
            >
                <TileLayer
                    // @ts-ignore
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                {/* User Marker */}
                <Marker position={currentPos} icon={userIcon} />

                {/* Destination Marker */}
                {destinationPos && (
                    <Marker position={destinationPos} />
                )}

                {/* Route Line */}
                {destinationPos && (
                    <Polyline
                        positions={[currentPos, destinationPos]}
                        pathOptions={{ color: 'blue', weight: 4, opacity: 0.6, dashArray: '10, 10' }}
                    />
                )}

                <MapUpdater center={currentPos} />
            </MapContainer>

            <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-gray-500 z-[400] backdrop-blur-sm border">
                LIVE TRACKING
            </div>
        </div>
    );
};

export default LiveRouteMap;
