import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Award, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    nameAr: string;
    avatar: string;
    bio: string;
    bioAr: string;
    location: string;
    joinDate: string;
    isVerified: boolean;
    followerCount: number;
    followingCount: number;
    achievementCount: number;
  };
  userType: "artist" | "gallery" | "collector";
  isOwnProfile: boolean;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onEditProfile: () => void;
  isFollowLoading: boolean;
}

export function ProfileHeader({
  user,
  userType,
  isOwnProfile,
  isFollowing,
  onToggleFollow,
  onEditProfile,
  isFollowLoading,
}: ProfileHeaderProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "artist": return "bg-purple-100 text-purple-800";
      case "gallery": return "bg-blue-100 text-blue-800";
      case "collector": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-lg">
                {getInitials(isArabic ? user.nameAr : user.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold truncate">
                    {isArabic ? user.nameAr : user.name}
                  </h1>
                  <Badge className={getUserTypeColor(userType)}>
                    {t(`profile.userType.${userType}`)}
                  </Badge>
                  {user.isVerified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Award className="h-3 w-3 mr-1" />
                      {t("profile.verified")}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {t("profile.joinedDate", { date: new Date(user.joinDate).toLocaleDateString() })}
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">
                  {isArabic ? user.bioAr : user.bio}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{user.followerCount}</span>
                    <span className="text-muted-foreground">{t("profile.followers")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{user.followingCount}</span>
                    <span className="text-muted-foreground">{t("profile.following")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">{user.achievementCount}</span>
                    <span className="text-muted-foreground">{t("profile.achievements")}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button onClick={onEditProfile} variant="outline">
                    {t("profile.editProfile")}
                  </Button>
                ) : (
                  <Button
                    onClick={onToggleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    disabled={isFollowLoading}
                  >
                    {isFollowing ? t("profile.unfollow") : t("profile.follow")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}