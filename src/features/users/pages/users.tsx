import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreVertical,
  PencilLine,
  Trash,
  Edit,
  Loader,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { TableSkeleton } from "@/components/ui/skeletons/purchasereports/tableSkeleton";
import { RegisterDialog } from "../components/registerDialog";
import { useUsers } from "../hooks/useUsers";
import type { User } from "../types";
import { EditUserDialog } from "../components/editUserDialog";
import { toast } from "sonner";

export default function Users() {
  const {
    data,
    loading,
    fetching,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    openModal,
    setOpenModal,
    openEditModal,
    selectedUser,
    setSelectedUser,
    setOpenEditModal,
    handleDelete,
  } = useUsers();

  if (loading) {
    return (
      <div className="p-6 -mt-4">
        <h1 className="text-3xl font-bold mb-6">Users</h1>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="p-6 -mt-4">
      {/* header */}
      <div className="flex flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="flex flex-row gap-2">
          <Button onClick={() => setOpenModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Register New User
          </Button>

          <RegisterDialog open={openModal} onOpenChange={setOpenModal} />

          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
        <Table className="border-separate border-spacing-0 w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] border-b">#</TableHead>
              <TableHead className="w-[160px] border-b">Full Name</TableHead>
              <TableHead className="border-b">Email</TableHead>
              <TableHead className="border-b">Department</TableHead>
              <TableHead className="border-b">Role</TableHead>
              <TableHead className="border-b">Created At</TableHead>
              <TableHead className="w-[100px] border-b">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="cursor-pointer">
            {fetching && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Loading users...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!fetching &&
              data?.items.map((user: User, idx: number) => (
                <TableRow key={user.id}>
                  <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department?.join(", ")}</TableCell>
                  <TableCell>{user.role?.join(", ")}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenEditModal(true);
                          }}
                        >
                          <PencilLine className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            toast.warning(`Delete ${user.name}?`, {
                              description: "This action cannot be undone.",
                              action: {
                                label: "Confirm",
                                onClick: () => handleDelete(user.id),
                              },
                              cancel: {
                                label: "Cancel",
                                onClick: () => {},
                              },
                            });
                          }}
                        >
                          <Trash className="h-4 w-4 mr-2 text-red-500" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {/* pagination footer */}
        <div className="flex items-center justify-end w-full border-t p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && setPage(page - 1)}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: data?.totalPages ?? 0 }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    data && page < data.totalPages && setPage(page + 1)
                  }
                  className={
                    data && page === data.totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          {/* page size selector */}
          <div className="flex items-center gap-2 w-[200px]">
            <span className="text-sm text-muted-foreground w-full">
              Rows per page:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <EditUserDialog
        open={openEditModal}
        onOpenChange={setOpenEditModal}
        user={selectedUser}
      />
    </div>
  );
}
