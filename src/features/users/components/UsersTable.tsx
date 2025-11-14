import { useQuery } from "@tanstack/react-query";
import { usersKeys } from "../api/users.keys";
import { getUsers } from "../api/users.api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function UsersTable() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: usersKeys.list(),
    queryFn: () => getUsers(),
  });

  if (isLoading) return <div className="animate-pulse">Loading users…</div>;
  if (isError) return <div className="text-red-600">Error: {(error as Error).message}</div>;

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Bio</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-full object-cover"/>
              </TableCell>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.phoneNumber}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center text-xs px-2 py-1 rounded ${u.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                  {u.active ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                {u.bio?.length > 40 ? (
                  <span title={u.bio}>{u.bio.slice(0, 40)}…</span>
                ) : u.bio}
              </TableCell>
              <TableCell>
                <a className="text-sm underline mr-2" href={`/users/${u.id}`}>Edit</a>
                <button className="text-sm text-red-600 underline">Delete</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
