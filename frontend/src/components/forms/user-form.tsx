import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Plus,
  Edit,
  User,
  Shield,
  Phone,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUserStore } from "@/stores/userStore";
import {
  userFormSchema,
  updateUserFormSchema,
  type UserFormValues,
  type UpdateUserFormValues,
} from "@/schemas/userSchema";
import { type UserType } from "@/types/user";

interface UserFormProps {
  mode?: "create" | "edit";
  user?: UserType | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function UserForm({
  mode = "create",
  user = null,
  onCancel,
  onSuccess,
}: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<UserFormValues | UpdateUserFormValues>({
    resolver: zodResolver(
      mode === "create" ? userFormSchema : updateUserFormSchema
    ),
    defaultValues: {
      name: "",
      email: "",
      ...(mode === "create" && { password: "" }),
      role: "user",
      status: "active",
      isEmailVerified: false,
      profile: {
        bio: "",
        phone: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
      },
    },
  });

  const { loading, createUser, updateUser } = useUserStore();

  // Reset form when user changes
  useEffect(() => {
    if (user && mode === "edit") {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        profile: {
          bio: user.profile?.bio || "",
          phone: user.profile?.phone || "",
          address: {
            street: user.profile?.address?.street || "",
            city: user.profile?.address?.city || "",
            state: user.profile?.address?.state || "",
            zipCode: user.profile?.address?.zipCode || "",
            country: user.profile?.address?.country || "",
          },
        },
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        email: "",
        password: "",
        role: "user",
        status: "active",
        isEmailVerified: false,
        profile: {
          bio: "",
          phone: "",
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
        },
      });
    }
  }, [user, mode, form]);

  const handleSubmit = async (data: UserFormValues | UpdateUserFormValues) => {
    try {
      // Clean up empty profile data
      const cleanData = {
        ...data,
        profile: {
          ...data.profile,
          address: Object.values(data.profile?.address || {}).some((v) => v)
            ? data.profile?.address
            : undefined,
        },
      };

      if (mode === "create") {
        await createUser(cleanData as UserFormValues);
        form.reset();
      } else if (mode === "edit" && user) {
        await updateUser(user._id, cleanData as UpdateUserFormValues);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting user:", error);
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  const handleClear = () => {
    form.reset({
      name: "",
      email: "",
      ...(mode === "create" && { password: "" }),
      role: "user",
      status: "active",
      isEmailVerified: false,
      profile: {
        bio: "",
        phone: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 sm:space-y-6"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
              <TabsTrigger
                value="basic"
                className="text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Basic Information</span>
                <span className="sm:hidden">Basic</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Profile Information</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6 pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Full Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., John Doe"
                            className="h-10 sm:h-11 text-sm sm:text-base"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Enter the user's full name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Email Address *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            className="h-10 sm:h-11 text-sm sm:text-base"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Enter a valid email address
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {mode === "create" && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Password *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter secure password"
                              className="h-10 sm:h-11 text-sm sm:text-base pr-10"
                              disabled={loading}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Must contain uppercase, lowercase, number, and special
                          character
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Role
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loading}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 sm:h-11">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                User
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Admin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          User role determines permissions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loading}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 sm:h-11">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">
                              <div className="flex items-center gap-2">
                                <Badge className="w-2 h-2 p-0 rounded-full bg-green-500" />
                                Active
                              </div>
                            </SelectItem>
                            <SelectItem value="inactive">
                              <div className="flex items-center gap-2">
                                <Badge className="w-2 h-2 p-0 rounded-full bg-gray-400" />
                                Inactive
                              </div>
                            </SelectItem>
                            <SelectItem value="suspended">
                              <div className="flex items-center gap-2">
                                <Badge className="w-2 h-2 p-0 rounded-full bg-red-500" />
                                Suspended
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          Account status affects access
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isEmailVerified"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-between">
                        <FormLabel className="text-sm font-medium">
                          Email Verified
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={loading}
                            />
                            <span className="text-sm text-muted-foreground">
                              {field.value ? "Verified" : "Not verified"}
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Email verification status
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Information Tab */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6 pt-0">
                <FormField
                  control={form.control}
                  name="profile.bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself..."
                          className="min-h-[80px] sm:min-h-[100px] resize-none text-sm sm:text-base"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Brief description about the user (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profile.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 123-4567"
                          className="h-10 sm:h-11 text-sm sm:text-base"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Contact phone number (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address Information
                  </h4>

                  <FormField
                    control={form.control}
                    name="profile.address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Street Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Main Street"
                            className="h-10 sm:h-11 text-sm sm:text-base"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="profile.address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            City
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="New York"
                              className="h-10 sm:h-11 text-sm sm:text-base"
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            State
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="NY"
                              className="h-10 sm:h-11 text-sm sm:text-base"
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.address.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Zip Code
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="10001"
                              className="h-10 sm:h-11 text-sm sm:text-base"
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Country
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="United States"
                              className="h-10 sm:h-11 text-sm sm:text-base"
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none h-10 sm:h-11 order-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : (
              <>
                {mode === "create" ? (
                  <Plus className="mr-2 h-4 w-4" />
                ) : (
                  <Edit className="mr-2 h-4 w-4" />
                )}
                {mode === "create" ? "Create User" : "Update User"}
              </>
            )}
          </Button>

          {mode === "create" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={loading}
              className="flex-1 sm:flex-none h-10 sm:h-11 order-3 sm:order-2"
            >
              Clear
            </Button>
          )}

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 sm:flex-none h-10 sm:h-11 order-2 sm:order-3"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
