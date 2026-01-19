import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Play, Pause, RefreshCw, Bot } from 'lucide-react';

interface NextReviewCheckCountdownProps {
  isEnabled: boolean;
  checkIntervalMinutes?: number; // Default 2 minutes
  className?: string;
  compact?: boolean;
}

const LAST_CHECK_STORAGE_KEY = 'auto_reply_last_check_time';

export function NextReviewCheckCountdown({
  isEnabled,
  checkIntervalMinutes = 2,
  className = '',
  compact = false
}: NextReviewCheckCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);

  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(() => {
    // Initialize from localStorage to persist across page refreshes
    const stored = localStorage.getItem(LAST_CHECK_STORAGE_KEY);
    if (stored) {
      const storedTime = new Date(stored);
      // Only use stored time if it's from within the last interval period
      const timeSinceStored = Date.now() - storedTime.getTime();
      if (timeSinceStored < checkIntervalMinutes * 60 * 1000) {
        return storedTime;
      }
    }
    return null;
  });

  // Save lastCheckTime to localStorage whenever it changes
  useEffect(() => {
    if (lastCheckTime) {
      localStorage.setItem(LAST_CHECK_STORAGE_KEY, lastCheckTime.toISOString());
    }
  }, [lastCheckTime]);

  useEffect(() => {
    if (!isEnabled) {
      setTimeRemaining(null);
      return;
    }

    // Initialize last check time if not set
    if (!lastCheckTime) {
      const newCheckTime = new Date();
      setLastCheckTime(newCheckTime);
      localStorage.setItem(LAST_CHECK_STORAGE_KEY, newCheckTime.toISOString());
    }

    const calculateTimeRemaining = () => {
      if (!lastCheckTime) return null;

      const now = new Date().getTime();
      const nextCheck = lastCheckTime.getTime() + (checkIntervalMinutes * 60 * 1000);
      const diff = nextCheck - now;

      if (diff <= 0) {
        // Time to check - reset the timer
        setLastCheckTime(new Date());
        return { minutes: checkIntervalMinutes, seconds: 0, total: checkIntervalMinutes * 60 * 1000 };
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { minutes, seconds, total: diff };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [isEnabled, lastCheckTime, checkIntervalMinutes]);

  // If disabled, show disabled state
  if (!isEnabled) {
    if (compact) {
      return (
        <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
          <Pause className="h-4 w-4" />
          <span className="text-sm">Auto-reply disabled</span>
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
              <p className="text-sm font-medium text-gray-600">Auto-Reply Disabled</p>
              <p className="text-xs text-gray-400">Enable auto-reply to monitor reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact version for inline display
  if (compact) {
    if (!timeRemaining) {
      return (
        <div className={`flex items-center gap-2 text-green-600 ${className}`}>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Checking...</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 text-blue-600 ${className}`}>
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">
          {timeRemaining.minutes}m {String(timeRemaining.seconds).padStart(2, '0')}s
        </span>
      </div>
    );
  }

  // Full countdown display
  return (
    <Card className={`border-blue-200 bg-gradient-to-r from-blue-50 to-green-50 overflow-hidden ${className}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Icon and Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl shadow-sm">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Next Review Check</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Checking every {checkIntervalMinutes} minutes
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex-1 flex justify-center sm:justify-end">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Minutes */}
              <div className="flex flex-col items-center bg-white rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm border border-blue-100 min-w-[50px] sm:min-w-[60px]">
                <span className="text-xl sm:text-2xl font-bold text-blue-600 tabular-nums">
                  {String(timeRemaining?.minutes || 0).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider">Min</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-blue-300">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center bg-white rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm border border-green-100 min-w-[50px] sm:min-w-[60px]">
                <span className="text-xl sm:text-2xl font-bold text-green-600 tabular-nums animate-pulse">
                  {String(timeRemaining?.seconds || 0).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider">Sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Auto-reply is actively monitoring for new reviews
          </span>
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Active
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default NextReviewCheckCountdown;
