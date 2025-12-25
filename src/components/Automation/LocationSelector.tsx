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
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-bold text-gray-700" style={{ fontFamily: 'Onest' }}>
        <Building2 className="h-5 w-5 text-purple-600" />
        <span>Business Location</span>
      </div>

      <Select value={selectedLocationId} onValueChange={onLocationChange}>
        <SelectTrigger className="w-full h-auto min-h-[60px] border-gray-200 rounded-xl hover:border-purple-300 transition-colors" style={{ fontFamily: 'Onest' }}>
          <SelectValue placeholder={placeholder}>
            {selectedLocation && (
              <div className="flex items-center gap-3 py-1">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-gray-800">{selectedLocation.displayName || selectedLocation.name}</span>
                  {selectedLocation.categories && selectedLocation.categories.length > 0 && (
                    <span className="text-xs text-gray-600">
                      {getCategoryName(selectedLocation.categories[0])} • {formatAddress(selectedLocation.address)}
                    </span>
                  )}
                  {(!selectedLocation.categories || selectedLocation.categories.length === 0) && selectedLocation.address && (
                    <span className="text-xs text-gray-600">
                      {formatAddress(selectedLocation.address)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-w-md">
          {locations.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-600" style={{ fontFamily: 'Onest' }}>
              No locations found. Please connect your Google Business Profile first.
            </div>
          ) : (
            locations.map((location) => {
              const isSelected = location.locationId === selectedLocationId;
              return (
                <SelectItem 
                  key={location.locationId} 
                  value={location.locationId}
                  className={isSelected ? "bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500" : ""}
                >
                  <div className="flex items-start gap-3 py-2">
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? 'bg-gradient-to-br from-purple-100 to-blue-100' 
                        : 'bg-gray-100'
                    }`}>
                      <Building2 className={`h-5 w-5 ${
                        isSelected ? 'text-purple-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className={`font-bold ${
                        isSelected ? 'text-purple-700' : 'text-gray-800'
                      }`} style={{ fontFamily: 'Onest' }}>
                        {location.displayName || location.name}
                      </span>
                      {location.categories && location.categories.length > 0 && (
                        <span className="text-xs text-gray-600 mt-0.5" style={{ fontFamily: 'Onest' }}>
                          {getCategoryName(location.categories[0])}
                        </span>
                      )}
                      {location.address && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600" style={{ fontFamily: 'Onest' }}>
                            {formatAddress(location.address)}
                          </span>
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>

      {/* Help text */}
      {locations.length > 0 && !selectedLocationId && (
        <p className="text-xs text-gray-600" style={{ fontFamily: 'Onest' }}>
          Select a location to view and manage automation settings
        </p>
      )}
    </div>
  );
};

export default LocationSelector;
