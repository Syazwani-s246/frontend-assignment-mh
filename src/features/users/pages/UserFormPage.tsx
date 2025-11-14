import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  userFormSchema,
  type UserFormInput,
} from "../api/users.validators";

import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, getUser, updateUser } from "../api/users.api";
import { usersKeys } from "../api/users.keys";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, UserPlus, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UserFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const nav = useNavigate();
  const qc = useQueryClient();

  // -----------------------------
  // LOAD USER (EDIT MODE)
  // -----------------------------
  const { data, isLoading, isError, error } = useQuery({
    enabled: isEdit,
    queryKey: isEdit ? usersKeys.detail(id!) : usersKeys.detail("new"),
    queryFn: () => getUser(id!),
    // Add retry logic for better UX
    retry: 1,
  });

  // -----------------------------
  // FORM CONFIG
  // -----------------------------
  const form = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      role: "User",
      active: true,
      avatar: "",
      bio: "",
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEdit && data) {
      form.reset({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: (data.role as any) ?? "User",
        active: data.active,
        avatar: data.avatar ?? "",
        bio: data.bio ?? "",
      });
    }
  }, [isEdit, data, form]);

  // -----------------------------
  // MUTATIONS WITH OPTIMISTIC UPDATES
  // -----------------------------
  const createMut = useMutation({
    mutationFn: createUser,
    onMutate: async () => {
      // Show loading toast
      toast.loading("Creating user...", { id: "create-user" });
    },
    onSuccess: (newUser) => {
      // Dismiss loading toast
      toast.dismiss("create-user");
      toast.success("User created successfully!");
      
      // Optimistically add to cache
      qc.setQueryData<any[]>(usersKeys.list(), (old = []) => [...old, newUser]);
      
      // Navigate after short delay for better UX
      setTimeout(() => nav("/users"), 500);
    },
    onError: (err: any) => {
      toast.dismiss("create-user");
      const message = err?.response?.data?.message || "Failed to create user";
      toast.error(message);
    },
    onSettled: () => {
      // Ensure data is fresh
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });

  const updateMut = useMutation({
    mutationFn: (payload: UserFormInput) => updateUser(id!, payload),
    onMutate: async (updatedData) => {
      // Show loading toast
      toast.loading("Updating user...", { id: "update-user" });
      
      // Cancel outgoing queries
      await qc.cancelQueries({ queryKey: usersKeys.detail(id!) });
      
      // Snapshot previous value
      const previous = qc.getQueryData(usersKeys.detail(id!));
      
      // Optimistically update detail view
      qc.setQueryData(usersKeys.detail(id!), (old: any) => ({
        ...old,
        ...updatedData,
      }));
      
      // Optimistically update list view
      qc.setQueryData<any[]>(usersKeys.list(), (old = []) =>
        old.map((user) => (user.id === id ? { ...user, ...updatedData } : user))
      );
      
      return { previous };
    },
    onSuccess: () => {
      toast.dismiss("update-user");
      toast.success("User updated successfully!");
      
      // Navigate after short delay
      setTimeout(() => nav("/users"), 500);
    },
    onError: (err: any, _vars, context) => {
      toast.dismiss("update-user");
      
      // Rollback on error
      if (context?.previous) {
        qc.setQueryData(usersKeys.detail(id!), context.previous);
      }
      
      if (err?.response?.status === 404) {
        toast.error(
          "This user no longer exists. It may have been deleted.",
          { duration: 5000 }
        );
      } else {
        const message = err?.response?.data?.message || "Failed to update user";
        toast.error(message);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });

  const onSubmit = (values: UserFormInput) => {
    isEdit ? updateMut.mutate(values) : createMut.mutate(values);
  };

  const isPending = createMut.isPending || updateMut.isPending;

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (isEdit && isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading user data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -----------------------------
  // ERROR STATE
  // -----------------------------
  if (isEdit && isError) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {(error as Error)?.message || "Failed to load user data"}
              </AlertDescription>
            </Alert>
            <Button
              variant="outline"
              onClick={() => nav("/users")}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -----------------------------
  // FORM UI
  // -----------------------------
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => nav("/users")}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEdit ? (
              <>
                <Save className="h-5 w-5" />
                Edit User
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Create New User
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? "Update user information and settings"
              : "Fill in the details to create a new user account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NAME */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    {...form.register("name")}
                    className={form.formState.errors.name ? "border-red-500" : ""}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...form.register("email")}
                    className={form.formState.errors.email ? "border-red-500" : ""}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* PHONE */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    {...form.register("phoneNumber")}
                  />
                </div>

                {/* ROLE */}
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.watch("role")}
                    onValueChange={(v) => form.setValue("role", v as any)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="User">User</SelectItem>
                      <SelectItem value="Guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Profile Details Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Profile Details
              </h3>

              {/* AVATAR */}
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="avatar"
                    placeholder="https://example.com/avatar.jpg"
                    {...form.register("avatar")}
                    className="flex-1"
                  />
                  {form.watch("avatar") && (
                    <img
                      src={form.watch("avatar")}
                      alt="Avatar preview"
                      className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
              </div>

              {/* BIO */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="w-full border rounded-md p-3 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Tell us about yourself..."
                  {...form.register("bio")}
                />
                <p className="text-xs text-muted-foreground">
                  {form.watch("bio")?.length || 0} characters
                </p>
              </div>
            </div>

            {/* Account Settings Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Account Settings
              </h3>

              {/* ACTIVE STATUS */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Account Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {form.watch("active")
                      ? "This account is currently active"
                      : "This account is currently inactive"}
                  </p>
                </div>
                <Switch
                  checked={form.watch("active")}
                  onCheckedChange={(v) => form.setValue("active", v)}
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEdit ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {isEdit ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create User
                      </>
                    )}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => nav("/users")}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}