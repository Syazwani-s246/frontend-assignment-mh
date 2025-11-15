import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersKeys } from "../api/users.keys";
import { getUsers, deleteUser } from "../api/users.api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { 
  UserPlus, 
  Search, 
  X, 
  LayoutGrid, 
  List,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Calendar,
  Mail,
  Phone,
  User,
  Loader2,
  Trash2
} from "lucide-react";

type ViewMode = "table" | "cards";
type SortField = "name" | "email" | "createdAt";
type SortOrder = "asc" | "desc";

export default function UsersListPage() {
  const qc = useQueryClient();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  
  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  
  // Date filter options
  const dateFilterOptions = [
    { value: "all", label: "All dates" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
  ];
  
  // Sort state
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Expanded bio state
  const [expandedBios, setExpandedBios] = useState<Set<string>>(new Set());

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  // Fetch users
  const { data, isLoading, isError, error } = useQuery({
    queryKey: usersKeys.list(),
    queryFn: () => getUsers(),
  });

  // Delete mutation
  const del = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: usersKeys.list() });
      const prev = qc.getQueryData<any[]>(usersKeys.list());
      qc.setQueryData<any[]>(usersKeys.list(), (old = []) => 
        old.filter(u => u.id !== id)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(usersKeys.list(), ctx.prev);
      }
      toast.error("Failed to delete user");
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: usersKeys.list() });
    }
  });

  // Handle delete click
  const handleDeleteClick = (user: { id: string; name: string }) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (userToDelete) {
      del.mutate(userToDelete.id);
    }
  };

  // Filter, search, and sort logic
  const filteredAndSortedUsers = useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(u => u.role.toLowerCase() === roleFilter.toLowerCase());
    }

    // Date filter
    if (dateFilter !== "all") {
      const daysAgo = parseInt(dateFilter);
      const filterTimestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(u => {
        const userTimestamp = new Date(u.createdAt).getTime();
        return userTimestamp >= filterTimestamp;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let compareA: any = a[sortField];
      let compareB: any = b[sortField];

      if (sortField === "createdAt") {
        compareA = new Date(compareA).getTime();
        compareB = new Date(compareB).getTime();
      } else {
        compareA = String(compareA).toLowerCase();
        compareB = String(compareB).toLowerCase();
      }

      if (sortOrder === "asc") {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

    return filtered;
  }, [data, searchQuery, roleFilter, dateFilter, sortField, sortOrder]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setDateFilter("all");
  };

  const hasActiveFilters = searchQuery || roleFilter !== "all" || dateFilter !== "all";

  // Toggle bio expansion
  const toggleBio = (userId: string) => {
    const newExpanded = new Set(expandedBios);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedBios(newExpanded);
  };

  // Toggle sort
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return sortOrder === "asc" ? 
      <ChevronUp className="h-3 w-3" /> : 
      <ChevronDown className="h-3 w-3" />;
  };

  // Bio component
  const BioDisplay = ({ bio, userId }: { bio?: string; userId: string }) => {
    if (!bio) return <span className="text-gray-400 text-sm italic">No bio</span>;
    
    const isExpanded = expandedBios.has(userId);
    const shouldTruncate = bio.length > 60;

    if (!shouldTruncate) return <span className="text-sm">{bio}</span>;

    return (
      <div className="space-y-1">
        <p className="text-sm">
          {isExpanded ? bio : `${bio.slice(0, 60)}...`}
        </p>
        <button
          onClick={() => toggleBio(userId)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded-lg bg-red-50">
        Error: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredAndSortedUsers.length} {filteredAndSortedUsers.length === 1 ? 'user' : 'users'}
            {hasActiveFilters && ` (filtered from ${data?.length || 0})`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cards
          </Button>
          <Button asChild>
            <a href="/users/new" className="flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              New User
            </a>
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All dates" />
              </SelectTrigger>
              <SelectContent>
                {dateFilterOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-7"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content - Table or Cards */}
      {viewMode === "table" ? (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-1 hover:text-gray-900 font-medium"
                  >
                    Name
                    <SortIcon field="name" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort("email")}
                    className="flex items-center gap-1 hover:text-gray-900 font-medium"
                  >
                    Email
                    <SortIcon field="email" />
                  </button>
                </TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort("createdAt")}
                    className="flex items-center gap-1 hover:text-gray-900 font-medium"
                  >
                    Created
                    <SortIcon field="createdAt" />
                  </button>
                </TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <img 
                      src={u.avatar} 
                      alt={u.name} 
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phoneNumber || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.active ? "default" : "secondary"}>
                      {u.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <BioDisplay bio={u.bio} userId={u.id} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <a 
                        className="text-sm text-blue-600 hover:underline" 
                        href={`/users/${u.id}`}
                      >
                        Edit
                      </a>
                      <button 
                        onClick={() => handleDeleteClick({ id: u.id, name: u.name })}
                        disabled={del.isPending}
                        className="text-sm text-red-600 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedUsers.map((u) => (
            <Card key={u.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <img 
                    src={u.avatar} 
                    alt={u.name} 
                    className="h-16 w-16 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg truncate">{u.name}</h3>
                      <Badge variant={u.active ? "default" : "secondary"}>
                        {u.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      
                      {u.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{u.phoneNumber}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        <Badge variant="outline" className="text-xs">
                          {u.role}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {u.bio && (
                      <div className="mt-3 pt-3 border-t">
                        <BioDisplay bio={u.bio} userId={u.id} />
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <a href={`/users/${u.id}`}>Edit</a>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick({ id: u.id, name: u.name })}
                        disabled={del.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredAndSortedUsers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No users found matching your filters.</p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-semibold text-gray-900">{userToDelete?.name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={del.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={del.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {del.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}