import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Bot, CheckCircle, XCircle, TrendingUp, Clock, Building2, AlertCircle, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LocationSelector from "@/components/Automation/LocationSelector";
import StatsCards from "@/components/Automation/StatsCards";
import ActivityLog from "@/components/Automation/ActivityLog";
import AutoReplyTab from "@/components/ProfileDetails/AutoReplyTab";
import { useGoogleBusinessProfile } from "@/hooks/useGoogleBusinessProfile";
import { useProfileLimitations } from "@/hooks/useProfileLimitations";
import { useAuth } from "@/contexts/AuthContext";
import activityHistoryService from "@/lib/activityHistoryService";
import { googleBusinessProfileService } from "@/lib/googleBusinessProfile";

const AutoReply = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [activityStats, setActivityStats] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [replyFilter, setReplyFilter] = useState<'all' | 'replied' | 'pending'>('all');

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

  // Filter reviews
  const filteredReviews = useMemo(() => {
    if (replyFilter === 'all') return reviews;
    if (replyFilter === 'replied') {
      return reviews.filter(r => r.reviewReply || r.reply);
    }
    return reviews.filter(r => !r.reviewReply && !r.reply);
  }, [reviews, replyFilter]);

  // Load saved location from localStorage
  useEffect(() => {
    const savedLocationId = localStorage.getItem('auto_reply_selected_location');
    if (savedLocationId && locations.find(loc => loc.locationId === savedLocationId)) {
      setSelectedLocationId(savedLocationId);
    } else if (locations.length > 0 && !selectedLocationId) {
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

  // Fetch data when location changes
  useEffect(() => {
    if (selectedLocationId && selectedLocation && currentUser) {
      fetchActivityData();
      fetchReviews();
    }
  }, [selectedLocationId, selectedLocation, currentUser]);

  // Fetch activity data
  const fetchActivityData = async () => {
    if (!selectedLocationId || !currentUser) return;

    setLoading(true);
    try {
      const { history, stats } = await activityHistoryService.fetchAutoReplyActivity(
        selectedLocationId,
        currentUser.uid,
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

  // Fetch reviews
  const fetchReviews = async () => {
    if (!selectedLocation) return;

    setLoadingReviews(true);
    try {
      const locationReviews = await googleBusinessProfileService.getLocationReviews(
        selectedLocation.name
      );
      setReviews(locationReviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Handle location change
  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    localStorage.setItem('auto_reply_selected_location', locationId);
  };

  // Load more activity
  const handleLoadMore = async () => {
    if (!selectedLocationId || !currentUser || loading) return;

    setLoading(true);
    try {
      const { history } = await activityHistoryService.fetchAutoReplyActivity(
        selectedLocationId,
        currentUser.uid,
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

  // Calculate stats from reviews
  const reviewStats = useMemo(() => {
    const total = reviews.length;
    const replied = reviews.filter(r => r.reviewReply || r.reply).length;
    const pending = total - replied;
    const ratings = reviews.map(r => {
      const ratingMap: any = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
      let rating = r.starRating?.value || r.starRating || 0;
      if (typeof rating === 'string') {
        rating = ratingMap[rating.toUpperCase()] || 0;
      }
      return rating;
    }).filter(r => r > 0);
    const avgRating = ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : 0;

    return { total, replied, pending, avgRating };
  }, [reviews]);

  // Prepare stats for StatsCards
  const statsData = [
    {
      label: 'Total Reviews',
      value: reviewStats.total,
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      label: 'Auto-Replied',
      value: activityStats?.successful || 0,
      icon: Bot,
      color: 'text-green-600'
    },
    {
      label: 'Pending Reply',
      value: reviewStats.pending,
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      label: 'Success Rate',
      value: `${activityStats?.successRate || 0}%`,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      label: 'Avg Rating',
      value: reviewStats.avgRating,
      icon: Star,
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auto Reply</h1>
          <p className="text-muted-foreground mt-1">
            Automatically respond to customer reviews with AI
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/reviews')}>
          <Star className="mr-2 h-4 w-4" />
          View All Reviews
        </Button>
      </div>

      {/* Connection warning */}
      {!isConnected && !googleLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your Google Business Profile first to manage auto-reply.
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
                  <span className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold border border-blue-200" style={{ fontFamily: 'Onest' }}>
                    <Bot className="h-4 w-4" />
                    Auto-Reply Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {selectedLocation && <StatsCards stats={statsData} columns={5} />}

      {/* Auto-Reply Configuration */}
      {selectedLocation && <AutoReplyTab profileId={selectedLocation.locationId} />}

      {/* Reviews List */}
      {selectedLocation && (
        <Card className="shadow-card border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Reviews
              </CardTitle>
              <Select value={replyFilter} onValueChange={(value: any) => setReplyFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="replied">Auto-Replied</SelectItem>
                  <SelectItem value="pending">Pending Reply</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loadingReviews ? (
              <div className="py-12 text-center">
                <div className="animate-pulse text-muted-foreground">Loading reviews...</div>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No reviews found</h3>
                <p className="text-muted-foreground text-sm">
                  {replyFilter === 'all'
                    ? 'This location has no reviews yet'
                    : `No ${replyFilter} reviews found`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => {
                  const hasReply = !!(review.reviewReply || review.reply);
                  const ratingMap: any = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
                  let rating = review.starRating?.value || review.starRating || 5;
                  if (typeof rating === 'string') {
                    rating = ratingMap[rating.toUpperCase()] || 5;
                  }

                  return (
                    <div key={review.reviewId || review.name} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">
                              {review.reviewer?.displayName || 'Anonymous'}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {review.comment}
                            </p>
                          )}
                          {hasReply && (
                            <div className="pl-4 border-l-2 border-green-500 bg-green-50 p-3 rounded-r-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-xs font-medium text-green-700">Auto-Reply</span>
                              </div>
                              <p className="text-sm text-green-900">
                                {review.reviewReply?.comment || review.reply?.comment || 'Reply sent'}
                              </p>
                            </div>
                          )}
                        </div>
                        <div>
                          {hasReply ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Replied
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity History */}
      {selectedLocation && (
        <ActivityLog
          activities={activityHistory}
          type="reply"
          title="Recent Auto-Replies"
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loading={loading}
        />
      )}

      {/* Empty State */}
      {!selectedLocation && isConnected && !googleLoading && (
        <Card className="shadow-card border border-border">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Select a Location</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose a business location from the dropdown above to view and manage auto-reply settings, reviews, and activity history.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {googleLoading && (
        <Card className="shadow-card border border-border">
          <CardContent className="py-12 text-center">
            <div className="animate-spin mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-muted-foreground">Loading your locations...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoReply;
