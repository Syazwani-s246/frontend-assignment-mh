import UsersTable from "../components/UsersTable";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react"; // icon untuk button

export default function UsersListPage() {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button asChild>
          <a href="/users/new" className="flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            New User
          </a>
        </Button>
      </div>

      {/* Table section */}
      <UsersTable />
    </div>
  );
}
