import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
  ChevronDown,
  Info
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  created_at: string;
  status: 'success' | 'failed' | 'pending';
  post_content?: string; // for posts
  post_summary?: string; // for posts
  review_content?: string; // for replies
  reply_content?: string; // for replies
  reviewer_name?: string; // for replies
  review_rating?: number; // for replies
  error_message?: string;
  metadata?: any;
}

interface ActivityLogProps {
  activities: Activity[];
  type: 'post' | 'reply';
  title?: string;
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const ActivityLog = ({
  activities,
  type,
  title,
  className = "",
  onLoadMore,
  hasMore = false,
  loading = false
}: ActivityLogProps) => {

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Toggle expansion of an activity item
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50',
          badge: 'Success'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          badge: 'Failed'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          badge: 'Pending'
        };
      default:
        return {
          icon: Info,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          badge: 'Unknown'
        };
    }
  };

  // Get preview content
  const getPreviewContent = (activity: Activity) => {
    if (type === 'post') {
      return activity.post_summary || activity.post_content?.substring(0, 150) || 'No content';
    } else {
      return activity.reply_content?.substring(0, 150) || 'No reply content';
    }
  };

  // Get full content
  const getFullContent = (activity: Activity) => {
    if (type === 'post') {
      return activity.post_content || activity.post_summary || 'No content available';
    } else {
      return activity.reply_content || 'No reply content available';
    }
  };

  const defaultTitle = type === 'post' ? 'Recent Auto-Posts' : 'Recent Auto-Replies';

  return (
    <Card className={`shadow-card border border-border ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === 'post' ? (
              <FileText className="h-5 w-5 text-primary" />
            ) : (
              <MessageSquare className="h-5 w-5 text-primary" />
            )}
            <CardTitle>{title || defaultTitle}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {activities.length} {activities.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="py-12 text-center">
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${type === 'post' ? 'bg-purple-50' : 'bg-blue-50'}`}>
              {type === 'post' ? (
                <FileText className="h-6 w-6 text-primary" />
              ) : (
                <MessageSquare className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <h3 className="text-lg font-medium mb-2">No activity yet</h3>
            <p className="text-muted-foreground text-sm">
              {type === 'post'
                ? 'Auto-posts will appear here once they are created'
                : 'Auto-replies will appear here once reviews are replied to'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const statusDisplay = getStatusDisplay(activity.status);
              const StatusIcon = statusDisplay.icon;
              const isExpanded = expandedItems.has(activity.id);
              const preview = getPreviewContent(activity);
              const fullContent = getFullContent(activity);
              const shouldShowMore = fullContent.length > 150;

              return (
                <div
                  key={activity.id}
                  className={`p-4 rounded-lg border ${statusDisplay.bg} border-border hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${statusDisplay.color}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant={activity.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                          {statusDisplay.badge}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(activity.created_at)}
                        </span>
                      </div>

                      {/* Review info for replies */}
                      {type === 'reply' && (
                        <div className="mb-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{activity.reviewer_name || 'Anonymous'}</span>
                            {activity.review_rating && (
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={i < activity.review_rating! ? 'text-yellow-500' : 'text-gray-300'}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {activity.review_content && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              "{activity.review_content.substring(0, 100)}{activity.review_content.length > 100 ? '...' : ''}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className="text-sm">
                        <p className={`${isExpanded ? '' : 'line-clamp-2'} text-foreground`}>
                          {isExpanded ? fullContent : preview}
                          {!isExpanded && fullContent.length > 150 && '...'}
                        </p>

                        {shouldShowMore && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(activity.id)}
                            className="mt-2 h-auto p-0 text-primary hover:text-primary/80"
                          >
                            <span className="flex items-center gap-1">
                              {isExpanded ? 'Show less' : 'Show more'}
                              <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </span>
                          </Button>
                        )}
                      </div>

                      {/* Error message */}
                      {activity.status === 'failed' && activity.error_message && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-800">
                          <span className="font-medium">Error:</span> {activity.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Load More Button */}
            {hasMore && onLoadMore && (
              <div className="pt-4 text-center">
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
