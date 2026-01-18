import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {  FileText, CheckCircle, XCircle, Clock, Sparkles, Building2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LocationSelector from "@/components/Automation/LocationSelector";
import StatsCards from "@/components/Automation/StatsCards";
import ActivityLog from "@/components/Automation/ActivityLog";
import { AutoPostingTab } from "@/components/ProfileDetails/AutoPostingTab";
import { NextPostCountdown } from "@/components/Automation/NextPostCountdown";
import { useGoogleBusinessProfile } from "@/hooks/useGoogleBusinessProfile";
import { useProfileLimitations } from "@/hooks/useProfileLimitations";
import { useAuth } from "@/contexts/AuthContext";
import activityHistoryService from "@/lib/activityHistoryService";
import { automationStorage } from "@/lib/automationStorage";
import { serverAutomationService } from "@/lib/serverAutomationService";

const AutoPosting = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [activityStats, setActivityStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [dbSettings, setDbSettings] = useState<{
    enabled: boolean;
    nextPostDate: string | null;
    autoReplyEnabled: boolean;
  } | null>(null);

  const { currentUser } = useAuth();
  const { accounts, isConnected, isLoading: googleLoading } = useGoogleBusinessProfile();
  const { getAccessibleAccounts } = useProfileLimitations();
  const navigate = useNavigate();

  // Get accessible locations
  const accessibleAccounts = useMemo(() => getAccessibleAccounts(accounts), [accounts, getAccessibleAccounts]);
  const locations = useMemo(() => {
    return accessibleAccounts.flatMap(account =>
      account.locations.map(loc => ({
        ...loc, // Keep all original location properties
        accountName: account.accountName
      }))
    );
  }, [accessibleAccounts]);

  // Load saved location from localStorage
  useEffect(() => {
    const savedLocationId = localStorage.getItem('auto_posting_selected_location');
    if (savedLocationId && locations.find(loc => loc.locationId === savedLocationId)) {
      setSelectedLocationId(savedLocationId);
    } else if (locations.length > 0 && !selectedLocationId) {
      // Auto-select first location if none selected
      setSelectedLocationId(locations[0].locationId);
    }
  }, [locations]);

  // Update selected location object when ID changes
  useEffect(() => {
    if (selectedLocationId) {
      const location = locations.find(loc => loc.locationId === selectedLocationId);
      setSelectedLocation(location || null);
    } else {
      setSelectedLocation(null);
    }
  }, [selectedLocationId, locations]);

  // Fetch activity history when location changes
  useEffect(() => {
    if (selectedLocationId && currentUser) {
      fetchActivityData();
      fetchDbSettings();
    }
  }, [selectedLocationId, currentUser]);

  // Fetch settings from database
  const fetchDbSettings = async () => {
    if (!selectedLocationId || !currentUser?.email) return;

    try {
      const settings = await serverAutomationService.getAutomationSettings(selectedLocationId, currentUser.email);
      if (settings) {
        setDbSettings({
          enabled: settings.enabled,
          nextPostDate: settings.nextPostDate,
          autoReplyEnabled: settings.autoReplyEnabled
        });
        console.log('[AutoPosting] Fetched database settings:', settings);
      }
    } catch (error) {
      console.error('[AutoPosting] Error fetching database settings:', error);
    }
  };

  // Fetch activity data
  const fetchActivityData = async () => {
    if (!selectedLocationId || !currentUser) return;

    setLoading(true);
    try {
      const { history, stats } = await activityHistoryService.fetchAutoPostActivity(
        selectedLocationId,
        currentUser.email,
        20,
        0
      );

      setActivityHistory(history);
      setActivityStats(stats);
      setHasMore(history.length >= 20);
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle location change
  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    localStorage.setItem('auto_posting_selected_location', locationId);
  };

  // Load more activity
  const handleLoadMore = async () => {
    if (!selectedLocationId || !currentUser || loading) return;

    setLoading(true);
    try {
      const { history } = await activityHistoryService.fetchAutoPostActivity(
        selectedLocationId,
        currentUser.email,
        20,
        activityHistory.length
      );

      setActivityHistory(prev => [...prev, ...history]);
      setHasMore(history.length >= 20);
    } catch (error) {
      console.error('Error loading more activity:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get config for selected location
  const locationConfig = selectedLocationId ? automationStorage.getConfiguration(selectedLocationId) : null;

  // Calculate next scheduled time
  const getNextScheduledTime = () => {
    if (!locationConfig || !locationConfig.enabled) return 'Not scheduled';
    if (locationConfig.schedule?.frequency === 'test30s') return 'Test mode (every 30s)';
    return locationConfig.nextPost || locationConfig.schedule?.time || 'Not set';
  };

  // Prepare stats for StatsCards (without Next Run - we show countdown separately)
  const statsData = [
    {
      label: 'Total Posts',
      value: activityStats?.total || 0,
      icon: FileText,
      color: 'text-primary'
    },
    {
      label: 'Successful',
      value: activityStats?.successful || 0,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'Failed',
      value: activityStats?.failed || 0,
      icon: XCircle,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auto Posting</h1>
          <p className="text-muted-foreground mt-1">
            Automate post creation across your business locations
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/posts')}>
          <FileText className="mr-2 h-4 w-4" />
          View All Posts
        </Button>
      </div>

      {/* Connection warning */}
      {!isConnected && !googleLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your Google Business Profile first to manage auto-posting.
            <Button
              variant="link"
              onClick={() => navigate('/dashboard/settings')}
              className="ml-2 p-0 h-auto"
            >
              Go to Settings
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Location Selector */}
      {isConnected && (
        <LocationSelector
          locations={locations}
          selectedLocationId={selectedLocationId}
          onLocationChange={handleLocationChange}
        />
      )}

      {/* Selected Location Info - Enhanced */}
      {selectedLocation && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-l-4 border-purple-500 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl shadow-sm">
              <Building2 className="h-7 w-7 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-800 mb-1" style={{ fontFamily: 'Onest' }}>
                    {selectedLocation.displayName}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium" style={{ fontFamily: 'Onest' }}>
                    {typeof selectedLocation.categories?.[0] === 'string'
                      ? selectedLocation.categories[0]
                      : selectedLocation.categories?.[0]?.name || 'Business'}
                  </p>
                  {selectedLocation.address && (
                    <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Onest' }}>
                      📍 {selectedLocation.address.locality}, {selectedLocation.address.administrativeArea}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {locationConfig?.enabled ? (
                    <span className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold border border-green-200" style={{ fontFamily: 'Onest' }}>
                      <CheckCircle className="h-4 w-4" />
                      Auto-posting enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold border border-gray-200" style={{ fontFamily: 'Onest' }}>
                      <XCircle className="h-4 w-4" />
                      Auto-posting disabled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Scheduled Post Countdown */}
      {selectedLocation && (
        <NextPostCountdown
          nextPostTime={dbSettings?.nextPostDate || locationConfig?.nextPost || null}
          isEnabled={dbSettings?.enabled || locationConfig?.enabled || false}
          frequency={locationConfig?.schedule?.frequency}
        />
      )}

      {/* Stats Cards */}
      {selectedLocation && <StatsCards stats={statsData} columns={3} />}

      {/* Auto-Posting Configuration */}
      {selectedLocation && (
        <AutoPostingTab
          location={{
            id: selectedLocation.locationId,
            name: selectedLocation.displayName,
            categories: selectedLocation.categories?.map?.((c: any) => typeof c === 'string' ? c : c.name) || [],
            websiteUri: selectedLocation.websiteUrl || selectedLocation.websiteUri,
            phoneNumber: selectedLocation.phoneNumber ||
                        selectedLocation.primaryPhone ||
                        selectedLocation.phoneNumbers?.[0]?.number ||
                        selectedLocation._debug_firstPhone,
            address: {
              addressLines: selectedLocation.address?.addressLines || [],
              locality: selectedLocation.address?.locality || '',
              administrativeArea: selectedLocation.address?.administrativeArea || '',
              postalCode: selectedLocation.address?.postalCode || '',
              countryCode: selectedLocation.address?.countryCode || ''
            }
          }}
        />
      )}

      {/* Activity History */}
      {selectedLocation && (
        <ActivityLog
          activities={activityHistory}
          type="post"
          title="Recent Auto-Posts"
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loading={loading}
        />
      )}

      {/* Empty State */}
      {!selectedLocation && isConnected && !googleLoading && (
        <Card className="shadow-card border border-border">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Select a Location</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose a business location from the dropdown above to view and manage auto-posting settings, stats, and activity history.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {googleLoading && (
        <Card className="shadow-card border border-border">
          <CardContent className="py-12 text-center">
            <div className="animate-spin mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">Loading your locations...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoPosting;
