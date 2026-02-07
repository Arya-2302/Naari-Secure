import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Loader2 } from 'lucide-react';

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

interface LocationPickerProps {
    onSelect: (location: { lat: number, lng: number, name: string }) => void;
    onClose: () => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onSelect, onClose }) => {
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number } | null>(null);

    // Get User Location for initial map center
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                const { latitude, longitude } = pos.coords;
                setMapCenter({ lat: latitude, lng: longitude });
                setPosition({ lat: latitude, lng: longitude });
            });
        } else {
            // Default to India Center if no loc
            setMapCenter({ lat: 20.5937, lng: 78.9629 });
        }
    }, []);

    const handleSearch = async () => {
        if (!query) return;
        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                setPosition({ lat, lng });
                setMapCenter({ lat, lng }); // Will trigger map flyTo via component below
                onSelect({ lat, lng, name: data[0].display_name });
            } else {
                alert("Location not found");
            }
        } catch (e) {
            console.error(e);
            alert("Search failed");
        } finally {
            setSearching(false);
        }
    };

    // Component to handle Map Clicks
    const MapEvents = () => {
        useMapEvents({
            click(e) {
                setPosition(e.latlng);
                // Reverse Geocode to get name? For now just coords
                // Ideally we reverse geocode here to get name.
                // Let's do a quick fetch
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
                    .then(res => res.json())
                    .then(data => {
                        onSelect({ lat: e.latlng.lat, lng: e.latlng.lng, name: data.display_name || "Selected Location" });
                    });
            },
        });
        return null;
    };

    // Component to update view when center changes
    const MapUpdater = ({ center }: { center: { lat: number, lng: number } }) => {
        const map = useMapEvents({});
        useEffect(() => {
            map.flyTo(center, 15);
        }, [center, map]);
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
            {/* Header / Search Bar */}
            <div className="p-4 bg-white flex gap-2 items-center">
                <div className="flex-1 relative">
                    <input
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl"
                        placeholder="Search for a place..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Search className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl"
                >
                    {searching ? <Loader2 className="animate-spin" /> : "Search"}
                </button>
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-200 font-bold rounded-xl"
                >
                    Close
                </button>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                {mapCenter && (
                    // @ts-ignore
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            // @ts-ignore
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapEvents />
                        {position && <Marker position={position} />}
                        <MapUpdater center={position || mapCenter} />
                    </MapContainer>
                )}

                {/* Instruction Overlay */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium z-[1000]">
                    Tap anywhere on the map to select
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
