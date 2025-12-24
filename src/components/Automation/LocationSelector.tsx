import { Building2, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Location {
  locationId: string;
  name: string;
  displayName?: string;
  categories?: any[];
  address?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
    countryCode?: string;
    regionCode?: string;
  };
}

interface LocationSelectorProps {
  locations: Location[];
  selectedLocationId: string;
  onLocationChange: (locationId: string) => void;
  placeholder?: string;
  className?: string;
}

const LocationSelector = ({
  locations,
  selectedLocationId,
  onLocationChange,
  placeholder = "Select a business location",
  className = ""
}: LocationSelectorProps) => {

  // Helper function to format address
  const formatAddress = (address?: Location['address']) => {
    if (!address) return '';
    const parts = [
      address.locality,
      address.administrativeArea
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Helper function to get category name
  const getCategoryName = (category: any) => {
    if (!category) return '';
    return typeof category === 'string' ? category : category.name || '';
  };

  // Get selected location details
  const selectedLocation = locations.find(loc => loc.locationId === selectedLocationId);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Business Location</span>
      </div>

      <Select value={selectedLocationId} onValueChange={onLocationChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}>
            {selectedLocation && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{selectedLocation.displayName || selectedLocation.name}</span>
                  {selectedLocation.categories && selectedLocation.categories.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {getCategoryName(selectedLocation.categories[0])} • {formatAddress(selectedLocation.address)}
                    </span>
                  )}
                  {(!selectedLocation.categories || selectedLocation.categories.length === 0) && selectedLocation.address && (
                    <span className="text-xs text-muted-foreground">
                      {formatAddress(selectedLocation.address)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {locations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No locations found. Please connect your Google Business Profile first.
            </div>
          ) : (
            locations.map((location) => (
              <SelectItem key={location.locationId} value={location.locationId}>
                <div className="flex items-start gap-3 py-1">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {location.displayName || location.name}
                    </span>
                    {location.categories && location.categories.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {getCategoryName(location.categories[0])}
                      </span>
                    )}
                    {location.address && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatAddress(location.address)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Help text */}
      {locations.length > 0 && !selectedLocationId && (
        <p className="text-xs text-muted-foreground">
          Select a location to view and manage automation settings
        </p>
      )}
    </div>
  );
};

export default LocationSelector;
