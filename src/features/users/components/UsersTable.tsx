import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersKeys } from "../api/users.keys";
import { getUsers, deleteUser } from "../api/users.api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function UsersTable() {
  // Initialize query client to manage cache
  const qc = useQueryClient();

  // Fetch users data with React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: usersKeys.list(),
    queryFn: () => getUsers(),
  });

  // Delete mutation with optimistic updates
  const del = useMutation({
    // The actual delete API call
    mutationFn: (id: string) => deleteUser(id),
    
    // Optimistic update: runs immediately when mutate is called
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await qc.cancelQueries({ queryKey: usersKeys.list() });
      
      // Snapshot the previous value for potential rollback
      const prev = qc.getQueryData<any[]>(usersKeys.list());
      
      // Optimistically update cache by removing the deleted user
      qc.setQueryData<any[]>(usersKeys.list(), (old = []) => 
        old.filter(u => u.id !== id)
      );
      
      // Return context with previous data for rollback
      return { prev };
    },
    
    // Rollback on error: restore previous data
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(usersKeys.list(), ctx.prev);
      }
      toast.error("Failed to delete user");
    },
    
    // Show success message when delete succeeds
    onSuccess: () => {
      toast.success("User deleted");
    },
    
    // Always refetch to ensure data consistency after mutation completes
    onSettled: () => {
      qc.invalidateQueries({ queryKey: usersKeys.list() });
    }
  });

  // Loading state
  if (isLoading) return <div className="animate-pulse">Loading users…</div>;
  
  // Error state
  if (isError) return <div className="text-red-600">Error: {(error as Error).message}</div>;

  return (
    <div className="w-full max-w-[1600px] mx-auto rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Avatar</TableHead>
            <TableHead className="w-[160px]">Name</TableHead>
            <TableHead className="w-[240px]">Email</TableHead>
            <TableHead className="w-[140px]">Phone</TableHead>
            <TableHead className="w-[100px]">Role</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[120px]">Created</TableHead>
            <TableHead>Bio</TableHead>
            <TableHead className="w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((u) => (
            <TableRow key={u.id}>
              {/* User avatar */}
              <TableCell className="w-[80px]">
                <img 
                  src={u.avatar} 
                  alt={u.name} 
                  className="h-9 w-9 rounded-full object-cover"
                />
              </TableCell>
              
              {/* User name */}
              <TableCell className="font-medium w-[160px]">{u.name}</TableCell>
              
              {/* Contact information */}
              <TableCell className="w-[240px]">{u.email}</TableCell>
              <TableCell className="w-[140px] whitespace-nowrap">{u.phoneNumber}</TableCell>
              
              {/* User role */}
              <TableCell className="w-[100px]">{u.role}</TableCell>
              
              {/* Active status badge */}
              <TableCell className="w-[100px]">
                <span 
                  className={`inline-flex items-center text-xs px-2 py-1 rounded ${
                    u.active 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {u.active ? "Active" : "Inactive"}
                </span>
              </TableCell>
              
              {/* Account creation date */}
              <TableCell className="w-[120px]">
                {new Date(u.createdAt).toLocaleDateString()}
              </TableCell>
              
              {/* Bio with truncation for long text */}
              <TableCell>
                {u.bio?.length > 40 ? (
                  <span title={u.bio}>{u.bio.slice(0, 40)}…</span>
                ) : u.bio}
              </TableCell>
              
              {/* Action buttons */}
              <TableCell className="w-[140px]">
                <a 
                  className="text-sm underline mr-2" 
                  href={`/users/${u.id}`}
                >
                  Edit
                </a>
                
                {/* Delete button with optimistic update */}
                <button 
                  onClick={() => del.mutate(u.id)}
                  disabled={del.isPending}
                  className="text-sm text-red-600 underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {del.isPending ? "Deleting..." : "Delete"}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}