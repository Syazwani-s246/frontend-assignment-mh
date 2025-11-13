import UsersTable from "../components/UsersTable";
import { Button } from "../../../components/ui/button";

export default function UsersListPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <Button asChild><a href="/users/new">New User</a></Button>
      </div>
      {/* Filters/Search/Sort will go here next */}
      <UsersTable />
    </div>
  );
}
