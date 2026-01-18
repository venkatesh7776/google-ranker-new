import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Play, Pause, Calendar, Timer, RefreshCw } from 'lucide-react';

interface NextPostCountdownProps {
  nextPostTime: string | null;
  isEnabled: boolean;
  frequency?: string;
  className?: string;
  compact?: boolean;
  onRefreshNeeded?: () => void; // Callback to refresh next post date from server
}

export function NextPostCountdown({
  nextPostTime,
  isEnabled,
  frequency,
  className = '',
  compact = false,
  onRefreshNeeded
}: NextPostCountdownProps) {
  const [hasRequestedRefresh, setHasRequestedRefresh] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (!nextPostTime || !isEnabled) {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = new Date(nextPostTime).getTime();
      const diff = target - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, total: diff };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [nextPostTime, isEnabled]);

  // Format the next post date/time
  const formatNextPostDate = () => {
    if (!nextPostTime) return 'Not scheduled';

    const date = new Date(nextPostTime);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    if (isToday) {
      return `Today at ${timeStr}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${timeStr}`;
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  // If disabled, show disabled state
  if (!isEnabled) {
    if (compact) {
      return (
        <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
          <Pause className="h-4 w-4" />
          <span className="text-sm">Auto-posting disabled</span>
        </div>
      );
    }

    return (
      <Card className={`border-gray-200 bg-gray-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Pause className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Auto-posting Disabled</p>
              <p className="text-xs text-gray-400">Enable auto-posting to schedule posts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Test mode (30 second interval)
  if (frequency === 'test30s') {
    if (compact) {
      return (
        <div className={`flex items-center gap-2 text-yellow-600 ${className}`}>
          <Timer className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-medium">Test Mode - Every 30s</span>
        </div>
      );
    }

    return (
      <Card className={`border-yellow-200 bg-yellow-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Timer className="h-5 w-5 text-yellow-600 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-700">Test Mode Active</p>
              <p className="text-xs text-yellow-600">Posts every 30 seconds</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // When time reaches 0, request a refresh to get the new next post date
  useEffect(() => {
    if (timeRemaining && timeRemaining.total <= 0 && !hasRequestedRefresh && onRefreshNeeded) {
      setHasRequestedRefresh(true);
      // Wait a few seconds for the post to be created, then refresh
      const refreshTimer = setTimeout(() => {
        onRefreshNeeded();
        setHasRequestedRefresh(false);
      }, 5000); // Wait 5 seconds before refreshing
      return () => clearTimeout(refreshTimer);
    }
  }, [timeRemaining, hasRequestedRefresh, onRefreshNeeded]);

  // Reset refresh flag when nextPostTime changes
  useEffect(() => {
    setHasRequestedRefresh(false);
  }, [nextPostTime]);

  // No next post time or time has passed
  if (!timeRemaining || timeRemaining.total <= 0) {
    if (compact) {
      return (
        <div className={`flex items-center gap-2 text-green-600 ${className}`}>
          <Play className="h-4 w-4" />
          <span className="text-sm font-medium">Ready to post</span>
        </div>
      );
    }

    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Ready to Post</p>
                <p className="text-xs text-green-600">Post is being created... Timer will refresh shortly</p>
              </div>
            </div>
            <div className="animate-spin">
              <RefreshCw className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact version for inline display
  if (compact) {
    const parts = [];
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}d`);
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours}h`);
    if (timeRemaining.minutes > 0) parts.push(`${timeRemaining.minutes}m`);
    if (timeRemaining.days === 0 && timeRemaining.hours === 0) {
      parts.push(`${timeRemaining.seconds}s`);
    }

    return (
      <div className={`flex items-center gap-2 text-blue-600 ${className}`}>
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">{parts.join(' ')}</span>
      </div>
    );
  }

  // Full countdown display
  return (
    <Card className={`border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 overflow-hidden ${className}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Icon and Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-sm">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Next Scheduled Post</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatNextPostDate()}
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex-1 flex justify-center sm:justify-end">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Days */}
              {timeRemaining.days > 0 && (
                <>
                  <div className="flex flex-col items-center bg-white rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm border border-blue-100 min-w-[40px] sm:min-w-[50px]">
                    <span className="text-lg sm:text-2xl font-bold text-blue-600 tabular-nums">
                      {String(timeRemaining.days).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider">Days</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-blue-300">:</span>
                </>
              )}

              {/* Hours */}
              <div className="flex flex-col items-center bg-white rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm border border-blue-100 min-w-[40px] sm:min-w-[50px]">
                <span className="text-lg sm:text-2xl font-bold text-blue-600 tabular-nums">
                  {String(timeRemaining.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider">Hrs</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-blue-300">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center bg-white rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm border border-blue-100 min-w-[40px] sm:min-w-[50px]">
                <span className="text-lg sm:text-2xl font-bold text-purple-600 tabular-nums">
                  {String(timeRemaining.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider">Min</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-blue-300">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center bg-white rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm border border-purple-100 min-w-[40px] sm:min-w-[50px]">
                <span className="text-lg sm:text-2xl font-bold text-purple-600 tabular-nums animate-pulse">
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider">Sec</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NextPostCountdown;
