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

export default function UserFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const nav = useNavigate();
  const qc = useQueryClient();

  // -----------------------------
  // LOAD USER (EDIT MODE)
  // -----------------------------
  const { data, isLoading } = useQuery({
    enabled: isEdit,
    queryKey: isEdit ? usersKeys.detail(id!) : usersKeys.detail("new"),
    queryFn: () => getUser(id!),
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
  // MUTATIONS
  // -----------------------------
  const createMut = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("User created");
      qc.invalidateQueries({ queryKey: usersKeys.all });
      nav("/users");
    },
    onError: () => toast.error("Failed to create user"),
  });

  const updateMut = useMutation({
    mutationFn: (payload: UserFormInput) => updateUser(id!, payload),
    onSuccess: () => {
      toast.success("User updated");
      qc.invalidateQueries({ queryKey: usersKeys.all });
      nav("/users");
    },
    onError: (err: any) => {
      if (err?.response?.status === 404) {
        toast.error(
          "This user no longer exists (deleted elsewhere). You can create as new."
        );
      } else {
        toast.error("Failed to update user");
      }
    },
  });


  const onSubmit = (values: UserFormInput) => {
    isEdit ? updateMut.mutate(values) : createMut.mutate(values)
  }

  // -----------------------------
  // LOADING UI
  // -----------------------------
  if (isEdit && isLoading) {
    return <div>Loading…</div>;
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">
        {isEdit ? "Edit User" : "New User"}
      </h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NAME */}
          <div>
            <Label>Name</Label>
            <Input {...form.register("name")} />
            <p className="text-xs text-red-600">
              {form.formState.errors.name?.message}
            </p>
          </div>

          {/* EMAIL */}
          <div>
            <Label>Email</Label>
            <Input type="email" {...form.register("email")} />
            <p className="text-xs text-red-600">
              {form.formState.errors.email?.message}
            </p>
          </div>

          {/* PHONE */}
          <div>
            <Label>Phone</Label>
            <Input {...form.register("phoneNumber")} />
          </div>

          {/* ROLE */}
          <div>
            <Label>Role</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(v) => form.setValue("role", v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AVATAR */}
          <div className="md:col-span-2">
            <Label>Avatar URL</Label>
            <Input {...form.register("avatar")} />
          </div>

          {/* BIO */}
          <div className="md:col-span-2">
            <Label>Bio</Label>
            <textarea
              className="w-full border rounded p-2"
              rows={4}
              {...form.register("bio")}
            />
          </div>

          {/* ACTIVE STATUS */}
          <div className="flex items-center gap-2">
            <Switch
              checked={form.watch("active")}
              onCheckedChange={(v) => form.setValue("active", v)}
            />
            <span>Status: {form.watch("active") ? "Active" : "Inactive"}</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2">
          <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
            {isEdit ? "Save Changes" : "Create User"}
          </Button>

          <Button type="button" variant="outline" onClick={() => history.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
