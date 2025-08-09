// src/components/admin/AdminAccountSettings.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Shield,
  Calendar,
  Clock,
  Save,
  Camera,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Trash2,
  Key,
  EyeOff,
  Eye,
  User,
  Activity,
} from "lucide-react";
import { useAdminAccountStore } from "@/stores/accountStore";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  passwordSchema,
  profileSchema,
  type PasswordFormData,
  type ProfileFormData,
} from "@/schemas/adminSettingsSchema";
// import { IMAGE_URL } from "@/lib/utils";
import usePasswordVisibility from "@/hooks/usePasswordVisibility";

export default function AdminAccountSettings() {
  const {
    currentAdmin,
    loading,
    error,
    isUpdatingProfile,
    isChangingPassword,
    isUploadingAvatar,
    fetchCurrentProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    removeAvatar,
    clearError,
  } = useAdminAccountStore();

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showRemoveAvatarDialog, setShowRemoveAvatarDialog] = useState(false);

  // Store validated form data for dialog confirmation
  const [pendingProfileData, setPendingProfileData] =
    useState<ProfileFormData | null>(null);
  const [pendingPasswordData, setPendingPasswordData] =
    useState<PasswordFormData | null>(null);

  // Password visibility hook
  const {
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    toggleCurrentPassword,
    toggleNewPassword,
    toggleConfirmPassword,
  } = usePasswordVisibility();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Load admin data
  useEffect(() => {
    fetchCurrentProfile();
  }, [fetchCurrentProfile]);

  // Update form when admin data loads
  useEffect(() => {
    if (currentAdmin) {
      profileForm.reset({
        name: currentAdmin.name,
        email: currentAdmin.email,
      });
    }
  }, [currentAdmin, profileForm]);

  // Profile form validation and dialog handler
  const handleProfileUpdate = async (data: ProfileFormData) => {
    setPendingProfileData(data);
    setShowProfileDialog(true);
  };

  // Password form validation and dialog handler
  const handlePasswordChange = async (data: PasswordFormData) => {
    setPendingPasswordData(data);
    setShowPasswordDialog(true);
  };

  // Confirmed profile update
  const onProfileSubmit = async () => {
    if (!pendingProfileData) return;

    try {
      await updateProfile(pendingProfileData);
      toast.success("Profile updated successfully!");
      setShowProfileDialog(false);
      setPendingProfileData(null);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  // Confirmed password change
  const onPasswordSubmit = async () => {
    if (!pendingPasswordData) return;

    try {
      await changePassword({
        currentPassword: pendingPasswordData.currentPassword,
        newPassword: pendingPasswordData.newPassword,
      });
      toast.success("Password changed successfully!");
      passwordForm.reset();
      setShowPasswordDialog(false);
      setPendingPasswordData(null);
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  // Cancel dialog handlers
  const handleProfileDialogCancel = () => {
    setShowProfileDialog(false);
    setPendingProfileData(null);
  };

  const handlePasswordDialogCancel = () => {
    setShowPasswordDialog(false);
    setPendingPasswordData(null);
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      await uploadAvatar(file);
      toast.success("Avatar updated successfully!");
    } catch (error) {
      toast.error("Failed to upload avatar");
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar();
      toast.success("Avatar removed successfully!");
      setShowRemoveAvatarDialog(false);
    } catch (error) {
      toast.error("Failed to remove avatar");
    }
  };

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

  if (loading && !currentAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center h-96 px-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-sm sm:text-base text-muted-foreground">
              Loading account details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center h-96 px-4">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-destructive mx-auto mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Failed to load account details
            </p>
            <Button onClick={fetchCurrentProfile} className="w-full sm:w-auto">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mx-2 sm:mx-0">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-sm">{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 sm:px-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Account Settings
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your admin account details and security settings
            </p>
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="overflow-hidden shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="relative flex-shrink-0">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900">
                  {/* <AvatarImage
                    src={`${IMAGE_URL}${currentAdmin.avatar}` || undefined}
                    alt={currentAdmin.name}
                    crossOrigin="anonymous"
                    className="object-cover"
                  /> */}
                  <AvatarImage
                    src={currentAdmin.avatar || undefined}
                    alt={currentAdmin.name}
                    crossOrigin="anonymous"
                    className="object-cover"
                  />
                  <AvatarFallback className="text-lg sm:text-xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-bold">
                    {currentAdmin.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Avatar Upload */}
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 flex gap-1">
                  <Label htmlFor="avatar-upload">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full cursor-pointer bg-white/90 backdrop-blur-sm shadow-lg border-2"
                      disabled={isUploadingAvatar}
                      asChild
                    >
                      <span>
                        {isUploadingAvatar ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        ) : (
                          <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  />

                  {currentAdmin.avatar && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-destructive hover:text-destructive-foreground bg-white/90 backdrop-blur-sm shadow-lg border-2"
                      onClick={() => setShowRemoveAvatarDialog(true)}
                      disabled={isUploadingAvatar}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                    {currentAdmin.name}
                  </h2>
                  <Badge
                    className={`text-white border-0 shadow-md text-xs sm:text-sm ${getStatusColor(
                      currentAdmin.status
                    )}`}
                  >
                    {currentAdmin.status.charAt(0).toUpperCase() +
                      currentAdmin.status.slice(1)}
                  </Badge>
                </div>

                <p className="text-sm sm:text-base text-muted-foreground mb-3 break-all">
                  {currentAdmin.email}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2 justify-center sm:justify-start">
                  <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md text-xs sm:text-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    {currentAdmin?.role == "admin" ? "Administrator" : "User"}
                  </Badge>
                  <Badge
                    className={`text-xs sm:text-sm border-0 shadow-md ${
                      currentAdmin.isEmailVerified
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                        : "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                    }`}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    {currentAdmin.isEmailVerified
                      ? "Email Verified"
                      : "Email Not Verified"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <TabsTrigger
                value="profile"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Security</span>
                <span className="sm:hidden">Pass</span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Activity</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Settings Tab */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Profile Information
                </CardTitle>
                <CardDescription className="text-sm">
                  Update your basic account information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(handleProfileUpdate)}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Your full name"
                                className="h-11 text-sm sm:text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="your@email.com"
                                className="h-11 text-sm sm:text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="w-full sm:w-auto min-w-[140px] h-11"
                      >
                        {isUpdatingProfile ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Update Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Key className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                  </div>
                  Change Password
                </CardTitle>
                <CardDescription className="text-sm">
                  Update your account password for better security
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem className="lg:col-span-2 xl:col-span-1">
                            <FormLabel className="text-sm font-medium">
                              Current Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={
                                    showCurrentPassword ? "text" : "password"
                                  }
                                  placeholder="Enter current password"
                                  className="h-11 text-sm sm:text-base pr-12"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={toggleCurrentPassword}
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem className="lg:col-span-2 xl:col-span-1">
                            <FormLabel className="text-sm font-medium">
                              New Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Enter new password"
                                  className="h-11 text-sm sm:text-base pr-12"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={toggleNewPassword}
                                >
                                  {showNewPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="lg:col-span-2 xl:col-span-1">
                            <FormLabel className="text-sm font-medium">
                              Confirm New Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  placeholder="Confirm new password"
                                  className="h-11 text-sm sm:text-base pr-12"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={toggleConfirmPassword}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full sm:w-auto min-w-[150px] h-11"
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Changing...
                          </>
                        ) : (
                          <>
                            <Key className="h-4 w-4 mr-2" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Account Activity
                </CardTitle>
                <CardDescription className="text-sm">
                  View your account activity and login history
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Last Login
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm sm:text-base break-words">
                          {currentAdmin.lastLogin ? (
                            format(
                              new Date(currentAdmin.lastLogin),
                              "PPP 'at' p"
                            )
                          ) : (
                            <span className="text-muted-foreground italic">
                              Never logged in
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Account Created
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Calendar className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm sm:text-base break-words">
                          {format(
                            new Date(currentAdmin.createdAt),
                            "PPP 'at' p"
                          )}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Last Updated
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        <span className="text-sm sm:text-base break-words">
                          {format(
                            new Date(currentAdmin.updatedAt),
                            "PPP 'at' p"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Account ID
                      </label>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs sm:text-sm font-mono break-all">
                          {currentAdmin._id}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Account Status
                      </label>
                      <div className="mt-1">
                        <Badge
                          className={`text-white border-0 shadow-md text-sm ${getStatusColor(
                            currentAdmin.status
                          )}`}
                        >
                          {currentAdmin.status.charAt(0).toUpperCase() +
                            currentAdmin.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Email Status
                      </label>
                      <div className="mt-1">
                        <Badge
                          className={`text-sm border-0 shadow-md ${
                            currentAdmin.isEmailVerified
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                              : "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                          }`}
                        >
                          {currentAdmin.isEmailVerified ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {currentAdmin.isEmailVerified
                            ? "Email Verified"
                            : "Email Not Verified"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Profile Update Confirmation Dialog */}
        <AlertDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
        >
          <AlertDialogContent className="w-[95vw] max-w-md sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg">
                Update Profile
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Are you sure you want to update your profile information?
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <div className="text-sm space-y-1">
                    <div className="break-words">
                      <strong>Name:</strong> {pendingProfileData?.name}
                    </div>
                    <div className="break-all">
                      <strong>Email:</strong> {pendingProfileData?.email}
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel
                onClick={handleProfileDialogCancel}
                className="w-full sm:w-auto"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onProfileSubmit}
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Password Change Confirmation Dialog */}
        <AlertDialog
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
        >
          <AlertDialogContent className="w-[95vw] max-w-md sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg">
                Change Password
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Are you sure you want to change your password? You will need to
                log in again after this change.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel
                onClick={handlePasswordDialogCancel}
                className="w-full sm:w-auto"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onPasswordSubmit}
                disabled={isChangingPassword}
                className="w-full sm:w-auto"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Remove Avatar Confirmation Dialog */}
        <AlertDialog
          open={showRemoveAvatarDialog}
          onOpenChange={setShowRemoveAvatarDialog}
        >
          <AlertDialogContent className="w-[95vw] max-w-md sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg">
                Remove Avatar
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Are you sure you want to remove your profile picture? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveAvatar}
                disabled={isUploadingAvatar}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Avatar
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
