import { useState, useEffect } from 'react';
import { MapPin, Phone, Navigation, Shield, Building2, HeartPulse, Loader2 } from 'lucide-react';
import RiskMap from '../components/RiskMap';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import { cn } from '@/lib/utils';

// Helper to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d.toFixed(1);
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

interface Place {
  id: number;
  name: string;
  distance: string;
  phone?: string;
  coords: { lat: number; lng: number };
}

const SafeZones = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'police' | 'hospitals' | 'helpCenters'>('police');
  const [zones, setZones] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'police' as const, icon: Shield, label: t('nearbyPolice') },
    { id: 'hospitals' as const, icon: HeartPulse, label: t('nearbyHospitals') },
    { id: 'helpCenters' as const, icon: Building2, label: t('womenHelpCenters') },
  ];

  // Get User Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Error getting location:", err);
          setError(t('locationAccessDenied'));
        }
      );
    } else {
      setError(t('geolocationNotSupported'));
    }
  }, []);

  // API Endpoints for redundancy
  const OVERPASS_INSTANCES = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  const fetchPlaces = async () => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);
    setZones([]);

    const radius = 5000; // 5km radius
    const { lat, lng } = userLocation;
    let query = '';

    // Overpass API Query Construction
    if (activeTab === 'police') {
      query = `
        [out:json][timeout:25];
        (
          node["amenity"="police"](around:${radius},${lat},${lng});
          way["amenity"="police"](around:${radius},${lat},${lng});
        );
        out center;
      `;
    } else if (activeTab === 'hospitals') {
      query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lng});
          way["amenity"="hospital"](around:${radius},${lat},${lng});
          node["amenity"="clinic"](around:${radius},${lat},${lng});
        );
        out center;
      `;
    } else if (activeTab === 'helpCenters') {
      query = `
        [out:json][timeout:25];
        (
          node["social_facility"](around:${radius},${lat},${lng});
          way["social_facility"](around:${radius},${lat},${lng});
          node["building"="dormitory"](around:${radius},${lat},${lng});
        );
        out center;
      `;
    }

    let success = false;
    for (const instance of OVERPASS_INSTANCES) {
      if (success) break;
      try {
        console.log(`Fetching from ${instance}...`);
        const response = await fetch(`${instance}?data=${encodeURIComponent(query)}`);

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Rate limited");
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Process Data
        const places: Place[] = data.elements.map((element: any) => {
          const placeLat = element.lat || element.center?.lat;
          const placeLon = element.lon || element.center?.lon;

          // Try to find a name, or fallback to a description
          const name = element.tags.name || element.tags.description || element.tags.operator || `${activeTab === 'police' ? 'Police Station' : activeTab === 'hospitals' ? 'Hospital' : 'Help Center'}`;

          return {
            id: element.id,
            name: name,
            distance: `${calculateDistance(lat, lng, placeLat, placeLon)} km`,
            phone: element.tags.phone || element.tags['contact:phone'] || null,
            coords: { lat: placeLat, lng: placeLon }
          };
        });

        // Sort by distance
        places.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

        setZones(places);
        success = true;

      } catch (err) {
        console.warn(`Failed to fetch from ${instance}:`, err);
        // If it was the last instance, set error
        if (instance === OVERPASS_INSTANCES[OVERPASS_INSTANCES.length - 1]) {
          setError(t('failedToFetchPlaces'));
        }
      }
    }
    setLoading(false);
  };

  // Fetch Places when activeTab or userLocation changes
  useEffect(() => {
    fetchPlaces();
  }, [activeTab, userLocation]);

  const handleNavigate = (coords: { lat: number; lng: number }) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
    window.open(url, '_blank');
  };

  return (
    <Layout>
      <div className="container px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">{t('safeZones')}</h1>
          <p className="text-sm text-muted-foreground">{t('findHelpNearby')}</p>
        </div>

        {/* Risk Map Component */}
        <div className="elevated-card overflow-hidden mb-6">
          <RiskMap />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Zone List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-3">{error}</p>
              <button
                onClick={fetchPlaces}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                {t('retry')}
              </button>
              {!userLocation && <p className="text-xs mt-2">{t('enableLocationServices')}</p>}
            </div>
          ) : zones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('noPlacesFound')}
            </div>
          ) : (
            zones.map((zone) => (
              <div key={zone.id} className="elevated-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{zone.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{zone.distance}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {zone.phone && (
                      <a
                        href={`tel:${zone.phone}`}
                        className="p-3 rounded-xl bg-safe/10 text-safe hover:bg-safe/20 transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                    )}
                    {!zone.phone && (
                      <button className="p-3 rounded-xl bg-muted text-muted-foreground cursor-not-allowed opacity-50" title="No phone number available">
                        <Phone className="w-5 h-5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigate(zone.coords)}
                      className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Navigation className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SafeZones;
