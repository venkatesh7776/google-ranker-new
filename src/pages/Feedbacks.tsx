import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, CheckCircle, Clock, XCircle, Star, AlertCircle, Loader2, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LocationSelector from "@/components/Automation/LocationSelector";
import StatsCards from "@/components/Automation/StatsCards";
import { useGoogleBusinessProfile } from "@/hooks/useGoogleBusinessProfile";
import { useProfileLimitations } from "@/hooks/useProfileLimitations";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Feedbacks = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'resolved' | 'pending'>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const { currentUser } = useAuth();
  const { accounts, isConnected, isLoading: googleLoading } = useGoogleBusinessProfile();
  const { getAccessibleAccounts } = useProfileLimitations();
  const navigate = useNavigate();

  // Get accessible locations
  const accessibleAccounts = useMemo(() => getAccessibleAccounts(accounts), [accounts, getAccessibleAccounts]);
  const locations = useMemo(() => {
    return accessibleAccounts.flatMap(account =>
      account.locations.map(loc => ({
        ...loc,
        accountName: account.accountName
      }))
    );
  }, [accessibleAccounts]);

  // Filter feedbacks
  const filteredFeedbacks = useMemo(() => {
    if (filter === 'all') return feedbacks;
    if (filter === 'resolved') return feedbacks.filter(f => f.is_resolved);
    return feedbacks.filter(f => !f.is_resolved);
  }, [feedbacks, filter]);

  // Load saved location
  useEffect(() => {
    const savedLocationId = localStorage.getItem('feedbacks_selected_location');
    if (savedLocationId && locations.find(loc => loc.locationId === savedLocationId)) {
      setSelectedLocationId(savedLocationId);
    } else if (locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].locationId);
    }
  }, [locations]);

  // Update selected location object
  useEffect(() => {
    if (selectedLocationId) {
      const location = locations.find(loc => loc.locationId === selectedLocationId);
      setSelectedLocation(location || null);
    } else {
      setSelectedLocation(null);
    }
  }, [selectedLocationId, locations]);

  // Fetch feedbacks when location changes
  useEffect(() => {
    if (selectedLocationId && currentUser) {
      fetchFeedbacks();
    }
  }, [selectedLocationId, currentUser]);

  // Also fetch when component mounts or becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedLocationId && currentUser) {
        console.log('[Feedbacks] 🔄 Page became visible, refreshing feedback...');
        fetchFeedbacks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [selectedLocationId, currentUser]);

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    if (!selectedLocationId || !currentUser) return;

    console.log('[Feedbacks] 🔍 Fetching feedback...');
    console.log('[Feedbacks] Location ID:', selectedLocationId);
    console.log('[Feedbacks] User ID:', currentUser.uid);
    console.log('[Feedbacks] URL:', `${BACKEND_URL}/api/feedback/location/${selectedLocationId}?userId=${currentUser.uid}`);

    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/feedback/location/${selectedLocationId}?userId=${currentUser.uid}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log('[Feedbacks] ✅ Response received:', data);
        console.log('[Feedbacks] Feedback count:', data.feedback?.length || 0);
        setFeedbacks(data.feedback || []);
        setStats(data.stats || null);
      } else {
        console.error('[Feedbacks] ❌ Response not OK:', response.status);
        const errorData = await response.json();
        console.error('[Feedbacks] Error data:', errorData);
      }
    } catch (error) {
      console.error('[Feedbacks] ❌ Error fetching feedbacks:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle location change
  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    localStorage.setItem('feedbacks_selected_location', locationId);
  };

  // Handle resolve feedback
  const handleResolveFeedback = async () => {
    if (!selectedFeedback || !currentUser) return;

    setIsResolving(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/feedback/${selectedFeedback.id}/resolve`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.uid,
            resolutionNotes
          })
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Feedback marked as resolved"
        });
        setSelectedFeedback(null);
        setResolutionNotes('');
        fetchFeedbacks();
      }
    } catch (error) {
      console.error('Error resolving feedback:', error);
      toast({
        title: "Error",
        description: "Failed to resolve feedback",
        variant: "destructive"
      });
    } finally {
      setIsResolving(false);
    }
  };

  // Stats data
  const statsData = stats ? [
    {
      label: 'Total Feedback',
      value: stats.total || 0,
      icon: MessageSquare,
      color: 'text-primary'
    },
    {
      label: 'Resolved',
      value: stats.resolved || 0,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'Pending',
      value: stats.pending || 0,
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      label: 'Avg Rating',
      value: stats.avgRating || 0,
      icon: Star,
      color: 'text-yellow-600'
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Feedback</h1>
          <p className="text-muted-foreground mt-1">
            View and manage feedback from customers who rated 1-3 stars
          </p>
        </div>
        {selectedLocationId && (
          <Button
            onClick={fetchFeedbacks}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        )}
      </div>

      {/* Connection warning */}
      {!isConnected && !googleLoading && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-orange-900">
                  Please connect your Google Business Profile to view feedback.
                </p>
                <Button
                  variant="link"
                  onClick={() => navigate('/dashboard/settings')}
                  className="h-auto p-0 text-orange-700"
                >
                  Go to Settings →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  <span className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-bold border border-orange-200" style={{ fontFamily: 'Onest' }}>
                    <MessageSquare className="h-4 w-4" />
                    Feedback Tracking
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {selectedLocation && stats && <StatsCards stats={statsData} columns={4} />}

      {/* Feedbacks List */}
      {selectedLocation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Feedback ({filteredFeedbacks.length})
              </CardTitle>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Feedback</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-pulse text-muted-foreground">Loading feedback...</div>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No feedback yet</h3>
                <p className="text-muted-foreground text-sm">
                  {filter === 'all'
                    ? 'Customer feedback will appear here'
                    : `No ${filter} feedback found`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className={`p-4 border rounded-lg ${
                      feedback.is_resolved ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {feedback.customer_name || 'Anonymous'}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < feedback.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {feedback.feedback_category}
                          </Badge>
                        </div>

                        {feedback.customer_email && (
                          <p className="text-xs text-muted-foreground mb-1">
                            📧 {feedback.customer_email}
                          </p>
                        )}

                        {feedback.customer_phone && (
                          <p className="text-xs text-muted-foreground mb-2">
                            📞 {feedback.customer_phone}
                          </p>
                        )}

                        <p className="text-sm text-gray-700 mb-2">
                          {feedback.feedback_text}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                        </p>

                        {feedback.is_resolved && feedback.resolution_notes && (
                          <div className="mt-3 pl-3 border-l-2 border-green-500">
                            <p className="text-xs font-medium text-green-700 mb-1">Resolution Notes:</p>
                            <p className="text-xs text-green-600">{feedback.resolution_notes}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        {feedback.is_resolved ? (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedFeedback(feedback)}
                            className="border-orange-600 text-orange-600 hover:bg-orange-50"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resolve Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Add notes about how this feedback was addressed (optional):
              </p>
              <Textarea
                placeholder="E.g., Contacted customer directly, issued refund, improved service..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
              Cancel
            </Button>
            <Button onClick={handleResolveFeedback} disabled={isResolving}>
              {isResolving ? 'Resolving...' : 'Mark as Resolved'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feedbacks;
