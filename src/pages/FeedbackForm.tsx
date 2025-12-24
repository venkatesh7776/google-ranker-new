import { useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { MessageSquare, Send, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const FeedbackForm = () => {
  const { locationId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rating = searchParams.get('rating');
  const userId = searchParams.get('userId');

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    feedbackText: '',
    feedbackCategory: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      locationId,
      userId,
      rating: parseInt(rating || '3'),
      ...formData
    };

    console.log('[Feedback Form] Submitting feedback:', payload);
    console.log('[Feedback Form] Backend URL:', BACKEND_URL);

    try {
      const response = await fetch(`${BACKEND_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('[Feedback Form] Response status:', response.status);
      const data = await response.json();
      console.log('[Feedback Form] Response data:', data);

      if (response.ok) {
        console.log('[Feedback Form] ✅ Feedback submitted successfully');
        setIsSubmitted(true);
      } else {
        console.error('[Feedback Form] ❌ Server error:', data);
        throw new Error(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('[Feedback Form] ❌ Error submitting feedback:', error);
      alert(`Failed to submit feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="pt-12 pb-8 px-6 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Thank You!
            </h1>
            <p className="text-gray-600 mb-6">
              We appreciate your feedback and will use it to improve our service.
            </p>
            <Button onClick={() => window.close()} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardContent className="pt-8 pb-8 px-6">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              We're Sorry!
            </h1>
            <p className="text-gray-600">
              Please tell us what went wrong so we can improve
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customerName">Your Name (Optional)</Label>
              <Input
                id="customerName"
                placeholder="Enter your name"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="customerEmail">Email (Optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="your@email.com"
                value={formData.customerEmail}
                onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="customerPhone">Phone (Optional)</Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="Your phone number"
                value={formData.customerPhone}
                onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="feedbackCategory">What was the issue?</Label>
              <Select
                value={formData.feedbackCategory}
                onValueChange={(value) => setFormData({...formData, feedbackCategory: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="quality">Product Quality</SelectItem>
                  <SelectItem value="cleanliness">Cleanliness</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                  <SelectItem value="wait_time">Wait Time</SelectItem>
                  <SelectItem value="staff">Staff Behavior</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="feedbackText">Tell us more *</Label>
              <Textarea
                id="feedbackText"
                placeholder="Please share your experience..."
                rows={5}
                required
                value={formData.feedbackText}
                onChange={(e) => setFormData({...formData, feedbackText: e.target.value})}
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !formData.feedbackText}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-gray-500">
          Powered by Google Ranker
        </p>
      </div>
    </div>
  );
};

export default FeedbackForm;
