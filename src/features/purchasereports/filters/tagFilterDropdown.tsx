// src/filters/tagFilterDropdown.tsx
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { tagsService } from "@/features/tags/tagsService";
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

interface Tag {
  id: number;
  description?: string | null;
}

interface Props {
  tagDescription: string;
  setTagDescription: Dispatch<SetStateAction<string>>;
  setPage: Dispatch<SetStateAction<number>>;
}

export const TagFilterDropdown: React.FC<Props> = ({
  tagDescription,
  setTagDescription,
  setPage,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTags = async () => {
      const data = await tagsService.getAll({
        sort_by: "description",
        sort_order: "asc",
      });
      const normalized = data.map((tag) => ({
        id: tag.id,
        description: tag.description ?? "",
      }));
      setTags(normalized);
    };
    fetchTags();
  }, []);

  const filteredTags = tags.filter((tag) =>
    tag.description!.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string, description: string) => {
    setTagDescription(description);
    setPage(1);
    setSearch("");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full sm:w-auto">
          {tagDescription || "Select tag..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search tag..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No tag found.</CommandEmpty>
            <CommandGroup>
              {filteredTags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  value={tag.description ?? ""}
                  onSelect={() =>
                    handleSelect(String(tag.id), tag.description ?? "")
                  }
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      tagDescription === tag.description
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {tag.description ?? "No description"}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
