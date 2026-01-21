import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { userPrivilegesService } from "@/services/userPriviligesService";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserPrivilege } from "@/types/userPriviliges";

interface PurchasingUser {
  id: number;
  name: string;
}

interface Props {
  purchaserName: string;
  setPurchaserName: Dispatch<SetStateAction<string>>;
  setPage: Dispatch<SetStateAction<number>>;
}

export const PurchasingUserDropdown: React.FC<Props> = ({
  purchaserName,
  setPurchaserName,
  setPage,
}) => {
  const [users, setUsers] = useState<PurchasingUser[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await userPrivilegesService.getAll({
        role: "purchasing",
        sort_by: "id",
      });

      const normalized = data
        .filter(
          (
            p
          ): p is UserPrivilege & {
            user: NonNullable<UserPrivilege["user"]>;
          } =>
            !!p.user &&
            Array.isArray(p.user.role) && // safety check
            p.user.role.length === 1 && // 👈 ONLY ONE ROLE
            p.user.role[0] === "purchasing" // 👈 that role is purchasing
        )
        .map((p) => ({
          id: p.user.id,
          name: p.user.name,
        }));

      // Remove duplicates (same user may have multiple privileges)
      const unique = Array.from(
        new Map(normalized.map((u) => [u.id, u])).values()
      );

      setUsers(unique);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (user: PurchasingUser) => {
    setPurchaserName(user.name);
    setPage(1);
    setSearch("");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full sm:w-auto">
          {purchaserName || "Select purchaser..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search purchaser..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No purchaser found.</CommandEmpty>
            <CommandGroup>
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={() => handleSelect(user)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      purchaserName === user.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
