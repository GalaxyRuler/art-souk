import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  MessageSquare, 
  Users, 
  Share2, 
  Edit2,
  Trash2,
  Send,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Calendar,
  MapPin,
  Link as LinkIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Comment, User, Profile } from "@/types";

// Follow Button Component
interface FollowButtonProps {
  entityType: "artist" | "gallery";
  entityId: number;
  initialFollowing?: boolean;
  className?: string;
}

export function FollowButton({ entityType, entityId, initialFollowing = false, className }: FollowButtonProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: followStatus } = useQuery<{ isFollowing: boolean }>({
    queryKey: [`/api/follows/${entityType}/${entityId}/check`],
    enabled: isAuthenticated,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const isFollowing = followStatus?.isFollowing || initialFollowing;
      if (isFollowing) {
        await apiRequest(`/api/follows/${entityType}/${entityId}`, {
          method: "DELETE",
        });
      } else {
        await apiRequest("/api/follows", {
          method: "POST",
          body: { entityType, entityId },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/follows/${entityType}/${entityId}/check`] });
      queryClient.invalidateQueries({ queryKey: [`/api/follows/${entityType}/${entityId}/counts`] });
      queryClient.invalidateQueries({ queryKey: ["/api/following"] });
      
      const isFollowing = followStatus?.isFollowing || initialFollowing;
      toast({
        title: isFollowing ? t("social.unfollowed") : t("social.followed"),
        description: isFollowing ? t("social.unfollowedDesc") : t("social.followedDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) return null;

  const isFollowing = followStatus?.isFollowing || initialFollowing;

  return (
    <Button
      variant={isFollowing ? "secondary" : "default"}
      size="sm"
      onClick={() => followMutation.mutate()}
      disabled={followMutation.isPending}
      className={cn(
        isFollowing
          ? "bg-white/20 text-white hover:bg-white/30"
          : "bg-brand-purple text-white hover:bg-brand-purple/90",
        className
      )}
    >
      {isFollowing ? <UserMinus className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
      {isFollowing ? t("social.following") : t("social.follow")}
    </Button>
  );
}

// Like Button Component
interface LikeButtonProps {
  entityType: "artwork" | "article" | "comment";
  entityId: number;
  showCount?: boolean;
  className?: string;
}

export function LikeButton({ entityType, entityId, showCount = true, className }: LikeButtonProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: likeStatus } = useQuery<{ isLiked: boolean }>({
    queryKey: [`/api/likes/${entityType}/${entityId}/check`],
    enabled: isAuthenticated,
  });

  const { data: likeCounts } = useQuery<{ likes: number }>({
    queryKey: [`/api/likes/${entityType}/${entityId}/counts`],
    enabled: showCount,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const isLiked = likeStatus?.isLiked;
      if (isLiked) {
        await apiRequest(`/api/likes/${entityType}/${entityId}`, {
          method: "DELETE",
        });
      } else {
        await apiRequest("/api/likes", {
          method: "POST",
          body: { entityType, entityId },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/likes/${entityType}/${entityId}/check`] });
      queryClient.invalidateQueries({ queryKey: [`/api/likes/${entityType}/${entityId}/counts`] });
      
      const isLiked = likeStatus?.isLiked;
      toast({
        title: isLiked ? t("social.unliked") : t("social.liked"),
        description: isLiked ? t("social.unlikedDesc") : t("social.likedDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) return null;

  const isLiked = likeStatus?.isLiked;
  const likeCount = likeCounts?.likes || 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => likeMutation.mutate()}
      disabled={likeMutation.isPending}
      className={cn(
        "transition-all duration-200",
        isLiked ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-red-500",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
      {showCount && likeCount > 0 && (
        <span className="ml-1 text-sm">{likeCount}</span>
      )}
    </Button>
  );
}

// Comments Section Component
interface CommentsSectionProps {
  entityType: "artwork" | "article";
  entityId: number;
  className?: string;
}

export function CommentsSection({ entityType, entityId, className }: CommentsSectionProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: [`/api/comments/${entityType}/${entityId}`],
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("/api/comments", {
        method: "POST",
        body: { entityType, entityId, content },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/comments/${entityType}/${entityId}`] });
      setNewComment("");
      toast({
        title: t("social.commentAdded"),
        description: t("social.commentAddedDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      await apiRequest(`/api/comments/${id}`, {
        method: "PUT",
        body: { content },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/comments/${entityType}/${entityId}`] });
      setEditingId(null);
      setEditContent("");
      toast({
        title: t("social.commentUpdated"),
        description: t("social.commentUpdatedDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/comments/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/comments/${entityType}/${entityId}`] });
      toast({
        title: t("social.commentDeleted"),
        description: t("social.commentDeletedDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment.trim());
    }
  };

  const handleEditComment = (comment: any) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContent.trim() && editingId) {
      updateCommentMutation.mutate({ id: editingId, content: editContent.trim() });
    }
  };

  const handleDeleteComment = (id: number) => {
    if (window.confirm(t("social.confirmDelete"))) {
      deleteCommentMutation.mutate(id);
    }
  };

  return (
    <Card className={cn("mt-6", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="h-5 w-5 text-brand-purple" />
          <h3 className="text-lg font-semibold">
            {t("social.comments")} ({comments.length})
          </h3>
        </div>

        {/* Add Comment Form */}
        {isAuthenticated && (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback>
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t("social.writeComment")}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || createCommentMutation.isPending}
                    className="bg-brand-purple hover:bg-brand-purple/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {t("social.postComment")}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment: Comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user?.profileImageUrl} />
                <AvatarFallback>
                  {comment.user?.firstName?.[0] || comment.user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {comment.user?.firstName || comment.user?.email}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                  {comment.userId === user?.id && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditComment(comment)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {editingId === comment.id ? (
                  <form onSubmit={handleUpdateComment} className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!editContent.trim() || updateCommentMutation.isPending}
                      >
                        {t("common.save")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(null);
                          setEditContent("");
                        }}
                      >
                        {t("common.cancel")}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                )}

                {/* Like Button for Comments */}
                <div className="flex items-center gap-2 mt-2">
                  <LikeButton
                    entityType="comment"
                    entityId={comment.id}
                    showCount={true}
                    className="h-6 text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t("social.noComments")}</p>
            {!isAuthenticated && (
              <p className="text-sm mt-2">
                <Button variant="link" onClick={() => window.location.href = "/auth"}>
                  {t("social.signInToComment")}
                </Button>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// User Profile Component
interface UserProfileProps {
  userId: string;
  className?: string;
}

export function UserProfile({ userId, className }: UserProfileProps) {
  const { t } = useTranslation();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { isRTL } = useLanguage();

  const { data: profile } = useQuery<Profile>({
    queryKey: [`/api/profile/${userId}`],
  });

  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  const { data: following } = useQuery({
    queryKey: [`/api/following`],
    enabled: isAuthenticated,
  });

  const { data: activities } = useQuery({
    queryKey: [`/api/activities`],
    enabled: isAuthenticated && currentUser?.id === userId,
  });

  if (!profile && !user) return null;

  const isOwnProfile = currentUser?.id === userId;

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.profileImageUrl} />
            <AvatarFallback className="text-lg">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email}
              </h3>
              {user?.role && user.role !== 'user' && (
                <Badge variant="secondary">{user.role}</Badge>
              )}
            </div>
            
            {profile?.bio && (
              <p className="text-muted-foreground mb-3">
                {isRTL ? profile.bioAr || profile.bio : profile.bio}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {profile?.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{isRTL ? profile.locationAr || profile.location : profile.location}</span>
                </div>
              )}
              
              {user?.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{t("social.joinedDate", { date: new Date(user.createdAt).toLocaleDateString() })}</span>
                </div>
              )}
            </div>
            
            {/* Social Links */}
            {(profile?.website || profile?.instagram || profile?.twitter) && (
              <div className="flex items-center gap-3 mt-3">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-purple hover:underline text-sm flex items-center gap-1"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {t("social.website")}
                  </a>
                )}
                {profile.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-purple hover:underline text-sm"
                  >
                    @{profile.instagram}
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-purple hover:underline text-sm"
                  >
                    @{profile.twitter}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Activity Feed for own profile */}
        {isOwnProfile && activities && activities.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t("social.recentActivity")}
            </h4>
            <div className="space-y-2">
              {activities.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="text-sm text-muted-foreground">
                  {t(`social.activity.${activity.type}`, { 
                    entity: activity.entityType,
                    time: formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}