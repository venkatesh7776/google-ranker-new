import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings2, Star } from "lucide-react";
import { reviewAutomationService } from "@/lib/reviewAutomationService";
import { serverAutomationService } from "@/lib/serverAutomationService";
import { automationStorage } from "@/lib/automationStorage";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AutoReplyTabProps {
  profileId: string;
}

const AutoReplyTab = ({ profileId }: AutoReplyTabProps) => {
  const { currentUser } = useAuth();
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  
  const [reviewConfig, setReviewConfig] = useState({
    enabled: true,
    autoReplyEnabled: true,
    replyTemplate: '',
    minRating: undefined as number | undefined,
    maxRating: undefined as number | undefined,
  });

  useEffect(() => {
    loadReviewConfiguration();
  }, [profileId]);

  const loadReviewConfiguration = async () => {
    const existingReviewConfig = reviewAutomationService.getConfiguration(profileId);
    if (existingReviewConfig) {
      setReviewConfig({
        enabled: existingReviewConfig.enabled,
        autoReplyEnabled: existingReviewConfig.autoReplyEnabled,
        replyTemplate: existingReviewConfig.replyTemplate || '',
        minRating: existingReviewConfig.minRating,
        maxRating: existingReviewConfig.maxRating,
      });
    } else {
      if (currentUser?.id) {
        console.log('New user detected - syncing default review automation settings to server');

        const accountId = localStorage.getItem('google_business_account_id');
        const businessName = localStorage.getItem('google_business_name') || 'Current Location';

        const automationConfig = automationStorage.getConfiguration(profileId);
        const keywords = automationConfig?.keywords
          ? (Array.isArray(automationConfig.keywords)
              ? automationConfig.keywords.join(', ')
              : automationConfig.keywords)
          : '';
        const category = automationConfig?.categories?.[0] || '';

        reviewAutomationService.saveConfiguration({
          locationId: profileId,
          businessName: businessName,
          enabled: true,
          autoReplyEnabled: true,
          replyTemplate: '',
          minRating: undefined,
          maxRating: undefined,
        });

        serverAutomationService.enableAutoReply(
          profileId,
          businessName,
          true,
          currentUser.id,
          accountId || undefined,
          keywords,
          category
        ).then(() => {
          console.log('✅ Default review automation settings synced to server');
        }).catch(err => {
          console.error('Failed to sync default review automation to server:', err);
        });
      }
    }
  };

  const saveReviewConfiguration = async (updates: Partial<typeof reviewConfig>) => {
    const updatedReviewConfig = { ...reviewConfig, ...updates };
    setReviewConfig(updatedReviewConfig);
    
    reviewAutomationService.saveConfiguration({
      locationId: profileId,
      businessName: 'Current Location',
      enabled: updatedReviewConfig.enabled,
      autoReplyEnabled: updatedReviewConfig.autoReplyEnabled,
      replyTemplate: updatedReviewConfig.replyTemplate,
      minRating: updatedReviewConfig.minRating,
      maxRating: updatedReviewConfig.maxRating,
    });

    if (updatedReviewConfig.enabled && updatedReviewConfig.autoReplyEnabled) {
      setIsSavingToServer(true);
      try {
        const accountId = localStorage.getItem('google_business_account_id');
        const businessName = localStorage.getItem('google_business_name') || 'Current Location';

        const automationConfig = automationStorage.getConfiguration(profileId);
        const keywords = automationConfig?.keywords
          ? (Array.isArray(automationConfig.keywords)
              ? automationConfig.keywords.join(', ')
              : automationConfig.keywords)
          : '';
        const category = automationConfig?.categories?.[0] || '';

        await serverAutomationService.enableAutoReply(
          profileId,
          businessName,
          true,
          currentUser?.id,
          accountId || undefined,
          keywords,
          category
        );

        toast({
          title: "Review Settings Saved",
          description: "Auto-reply will continue running even when you're offline.",
          duration: 4000,
        });
      } catch (error) {
        console.error('Failed to save to server:', error);
        toast({
          title: "Server sync failed",
          description: "Settings saved locally but server sync failed. Auto-reply may not work when offline.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsSavingToServer(false);
      }
    } else if (!updatedReviewConfig.enabled || !updatedReviewConfig.autoReplyEnabled) {
      try {
        await serverAutomationService.disableAutoReply(profileId);
        toast({
          title: "Review Settings Saved",
          description: updatedReviewConfig.enabled
            ? "Auto-reply has been disabled."
            : "Review automation has been disabled.",
        });
      } catch (error) {
        console.error('Failed to disable on server:', error);
        toast({
          title: "Review Settings Saved",
          description: "Your review automation settings have been updated.",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Settings2 className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-base sm:text-lg">Review Auto-Reply Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Enable Review Automation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 flex-1">
            <Label className="text-sm sm:text-base">Enable Review Automation</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Monitor and automatically reply to customer reviews
            </p>
          </div>
          <Switch
            checked={reviewConfig.enabled}
            onCheckedChange={(checked) => 
              saveReviewConfiguration({ enabled: checked })
            }
            disabled={isSavingToServer}
          />
        </div>

        {reviewConfig.enabled && (
          <>
            <Separator />
            
            {/* Auto-Reply Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Reply to Reviews</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate and post replies using AI
                </p>
              </div>
              <Switch
                checked={reviewConfig.autoReplyEnabled}
                onCheckedChange={(checked) => 
                  saveReviewConfiguration({ autoReplyEnabled: checked })
                }
                disabled={isSavingToServer}
              />
            </div>

            {reviewConfig.autoReplyEnabled && (
              <>
                {/* Rating Filter */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reply to reviews with rating from:</Label>
                    <Select
                      value={reviewConfig.minRating?.toString() || 'any'}
                      onValueChange={(value) => 
                        saveReviewConfiguration({ 
                          minRating: value === 'any' ? undefined : parseInt(value) 
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any rating</SelectItem>
                        <SelectItem value="1">1 star and above</SelectItem>
                        <SelectItem value="2">2 stars and above</SelectItem>
                        <SelectItem value="3">3 stars and above</SelectItem>
                        <SelectItem value="4">4 stars and above</SelectItem>
                        <SelectItem value="5">5 stars only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>To:</Label>
                    <Select
                      value={reviewConfig.maxRating?.toString() || 'any'}
                      onValueChange={(value) => 
                        saveReviewConfiguration({ 
                          maxRating: value === 'any' ? undefined : parseInt(value) 
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any rating</SelectItem>
                        <SelectItem value="1">1 star only</SelectItem>
                        <SelectItem value="2">2 stars and below</SelectItem>
                        <SelectItem value="3">3 stars and below</SelectItem>
                        <SelectItem value="4">4 stars and below</SelectItem>
                        <SelectItem value="5">5 stars and below</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Reply Template */}
                <div className="space-y-2">
                  <Label>Custom Reply Template (Optional)</Label>
                  <Textarea
                    placeholder="Leave blank to use AI-generated replies. Use {businessName}, {reviewerName}, {rating}, {comment} as placeholders."
                    value={reviewConfig.replyTemplate}
                    onChange={(e) => 
                      setReviewConfig(prev => ({ ...prev, replyTemplate: e.target.value }))
                    }
                    onBlur={() => saveReviewConfiguration({ replyTemplate: reviewConfig.replyTemplate })}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    If empty, AI will generate personalized replies. Use placeholders like {"{businessName}"}, {"{reviewerName}"}, {"{rating}"}, {"{comment}"}.
                  </p>
                </div>

                {/* Preview Section */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    How it works:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Reviews are checked every minute for new reviews</li>
                    <li>• Only reviews matching your criteria will get replies</li>
                    <li>• AI generates personalized, professional responses</li>
                    <li>• Reviews that already have replies are skipped</li>
                  </ul>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoReplyTab;

