import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const StarRating = () => {
  const { locationId: locationIdParam } = useParams<{ locationId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  // Get location ID from URL path param first, then fall back to query params
  const locationId = locationIdParam || searchParams.get('locationId') || searchParams.get('location');
  const userId = searchParams.get('userId') || searchParams.get('user');

  // Handle rating selection
  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);

    // Add a small delay for visual feedback
    setTimeout(() => {
      if (rating >= 4) {
        // High rating (4-5 stars) → Redirect to review suggestions page
        navigate(`/public-reviews/${locationId}?rating=${rating}&userId=${userId}`);
      } else {
        // Low rating (1-3 stars) → Redirect to feedback form
        navigate(`/feedback/${locationId}?rating=${rating}&userId=${userId}`);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardContent className="pt-12 pb-8 px-6">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
              <Star className="h-8 w-8 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              How was your experience?
            </h1>
            <p className="text-gray-600">
              We'd love to hear your feedback
            </p>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((rating) => {
              const isSelected = selectedRating ? rating <= selectedRating : false;
              const isHovered = hoveredRating ? rating <= hoveredRating : false;
              const isActive = isSelected || isHovered;

              return (
                <button
                  key={rating}
                  onClick={() => handleRatingClick(rating)}
                  onMouseEnter={() => setHoveredRating(rating)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className={`
                    transform transition-all duration-200 ease-in-out
                    ${isActive ? 'scale-110' : 'scale-100'}
                    ${selectedRating === rating ? 'animate-pulse' : ''}
                    hover:scale-125 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full
                  `}
                  aria-label={`Rate ${rating} star${rating !== 1 ? 's' : ''}`}
                >
                  <Star
                    className={`
                      h-12 w-12 transition-all duration-200
                      ${isActive
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 fill-gray-100'
                      }
                    `}
                  />
                </button>
              );
            })}
          </div>

          {/* Helper Text */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {hoveredRating === null && selectedRating === null && "Tap a star to rate us"}
              {hoveredRating === 1 && "Poor"}
              {hoveredRating === 2 && "Fair"}
              {hoveredRating === 3 && "Good"}
              {hoveredRating === 4 && "Very Good"}
              {hoveredRating === 5 && "Excellent"}
              {selectedRating !== null && "Thank you! Redirecting..."}
            </p>
          </div>

          {/* Optional: Skip button */}
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={() => window.close()}
              className="text-gray-500 hover:text-gray-700"
            >
              Maybe later
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-gray-500">
          Powered by Google Ranker
        </p>
      </div>
    </div>
  );
};

export default StarRating;
