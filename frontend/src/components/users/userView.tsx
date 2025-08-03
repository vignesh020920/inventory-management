import { format } from "date-fns";
import {
  Calendar,
  User as UserIcon,
  X,
  Clock,
  Mail,
  Phone,
  MapPin,
  Shield,
  Globe,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type User } from "@/types/user";
import { IMAGE_URL } from "@/lib/utils";

interface UserViewProps {
  user: User | null;
  onClose: () => void;
}

export function UserView({ user, onClose }: UserViewProps) {
  if (!user) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="text-center px-4">
          <UserIcon className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-2 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">
            No user data available
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-gradient-to-r from-green-500 to-green-600";
      case "inactive":
        return "bg-gradient-to-r from-gray-400 to-gray-500";
      case "suspended":
        return "bg-gradient-to-r from-red-500 to-red-600";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500";
    }
  };

  // Helper function to check if profile has any data
  const hasProfileData = () => {
    const profile = user.profile;
    if (!profile) return false;

    return (
      profile.bio ||
      profile.phone ||
      (profile.address &&
        (profile.address.street ||
          profile.address.city ||
          profile.address.state ||
          profile.address.zipCode ||
          profile.address.country)) ||
      (profile.socialLinks &&
        (profile.socialLinks.website ||
          profile.socialLinks.twitter ||
          profile.socialLinks.linkedin ||
          profile.socialLinks.github))
    );
  };

  // Helper function to check if address has any data
  const hasAddressData = () => {
    const address = user.profile?.address;
    if (!address) return false;

    return (
      address.street ||
      address.city ||
      address.state ||
      address.zipCode ||
      address.country
    );
  };

  // Helper function to check if social links have any data
  const hasSocialLinksData = () => {
    const socialLinks = user.profile?.socialLinks;
    if (!socialLinks) return false;

    return (
      socialLinks.website ||
      socialLinks.twitter ||
      socialLinks.linkedin ||
      socialLinks.github
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header Section - Enhanced for mobile */}
      <Card className="overflow-hidden">
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                <AvatarImage
                  src={`${IMAGE_URL}${user.avatar}` || undefined}
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-base sm:text-lg font-semibold bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {user.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm sm:text-base break-all sm:break-normal">
                  {user.email}
                </p>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mt-2 sm:mt-3">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Badge
                      className={`text-white border-0 shadow-md text-xs ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </Badge>
                    <Badge
                      className={`text-xs ${
                        user.role === "admin"
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md"
                      }`}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <Badge
                      className={`text-xs ${
                        user.isEmailVerified
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md"
                          : "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md"
                      }`}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      {user.isEmailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="self-center sm:self-start hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <X className="h-4 w-4" />
              <span className="ml-1 sm:hidden">Close</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Details Section - Responsive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Basic Information */}
        <Card className="order-1">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <p className="text-sm sm:text-base font-medium break-words">
                {user.name}
              </p>
            </div>

            <Separator />

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Email Address
              </label>
              <p className="text-sm sm:text-base break-all">{user.email}</p>
            </div>

            <Separator />

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Role
              </label>
              <div className="mt-1">
                <Badge
                  className={`text-xs sm:text-sm ${
                    user.role === "admin"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md"
                  }`}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Account Status
              </label>
              <div className="mt-1">
                <Badge
                  className={`text-xs sm:text-sm text-white border-0 shadow-md ${getStatusColor(
                    user.status
                  )}`}
                >
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Email Verification
              </label>
              <div className="mt-1">
                <Badge
                  className={`text-xs sm:text-sm ${
                    user.isEmailVerified
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md"
                  }`}
                >
                  <Mail className="h-3 w-3 mr-1" />
                  {user.isEmailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="order-2">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              </div>
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
            {!hasProfileData() ? (
              <div className="text-center py-8 sm:py-16">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full inline-block mb-3">
                  <UserIcon className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  No profile information available
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  The user hasn't filled out their profile details yet
                </p>
              </div>
            ) : (
              <>
                {user.profile?.bio && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Bio
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <p className="text-sm sm:text-base break-words leading-relaxed">
                          {user.profile.bio}
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {user.profile?.phone && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm sm:text-base">
                          {user.profile.phone}
                        </span>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {hasAddressData() && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Address
                      </label>
                      <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <MapPin className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm sm:text-base space-y-1">
                          {user.profile?.address?.street && (
                            <div className="break-words">
                              {user.profile.address.street}
                            </div>
                          )}
                          {[
                            user.profile?.address?.city,
                            user.profile?.address?.state,
                            user.profile?.address?.zipCode,
                          ]
                            .filter(Boolean)
                            .join(", ") && (
                            <div className="break-words">
                              {[
                                user.profile?.address?.city,
                                user.profile?.address?.state,
                                user.profile?.address?.zipCode,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          )}
                          {user.profile?.address?.country && (
                            <div className="break-words font-medium">
                              {user.profile.address.country}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {hasSocialLinksData() && (
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Social Links
                    </label>
                    <div className="space-y-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      {user.profile?.socialLinks?.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <a
                            href={user.profile.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm break-all"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      {user.profile?.socialLinks?.twitter && (
                        <div className="flex items-center gap-2">
                          <Twitter className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <a
                            href={user.profile.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm break-all"
                          >
                            Twitter
                          </a>
                        </div>
                      )}
                      {user.profile?.socialLinks?.linkedin && (
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <a
                            href={user.profile.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm break-all"
                          >
                            LinkedIn
                          </a>
                        </div>
                      )}
                      {user.profile?.socialLinks?.github && (
                        <div className="flex items-center gap-2">
                          <Github className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <a
                            href={user.profile.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm break-all"
                          >
                            GitHub
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Activity Information */}
        <Card className="order-3 xl:order-3">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span>Activity Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Last Login
              </label>
              <div className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Clock className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base break-words">
                  {user.lastLogin ? (
                    format(new Date(user.lastLogin), "PPP 'at' p")
                  ) : (
                    <span className="text-muted-foreground italic">
                      Never logged in
                    </span>
                  )}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Account Created
              </label>
              <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base break-words">
                  {format(new Date(user.createdAt), "PPP 'at' p")}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Clock className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base break-words">
                  {format(new Date(user.updatedAt), "PPP 'at' p")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="order-4 xl:order-4">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <span>Metadata</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                User ID
              </label>
              <div className="bg-muted p-2 sm:p-3 rounded-lg">
                <p className="text-xs sm:text-sm font-mono break-all">
                  {user._id}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Version
              </label>
              <div className="bg-muted p-2 sm:p-3 rounded-lg">
                <p className="text-sm sm:text-base font-mono">
                  v{user.__v || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons - Mobile optimized */}
      <Card className="order-5">
        <CardContent className="p-3 sm:pt-6 sm:px-6 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Account created {format(new Date(user.createdAt), "PPP")}
            </div>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
