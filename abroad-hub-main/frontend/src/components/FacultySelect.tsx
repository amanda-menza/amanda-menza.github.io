"use client";
import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Program,
  AdminTableData,
  FacultyLead,
  PartnerTableData,
} from "../types/models";
import logger from "./Logger";
interface FacultySelectProps {
  programs: Program[] | AdminTableData[] | PartnerTableData[];
  onFacultySelect: (facultyId: string) => void;
  disable?: boolean;
}

const FacultySelect: React.FC<FacultySelectProps> = ({
  programs,
  onFacultySelect,
  disable = false,
}) => {
  const [facultyLeads, setFacultyLeads] = useState<FacultyLead[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Extract unique faculty leads from programs and remove duplicates
    const uniqueFacultyLeads = programs
      .flatMap((program) => program.faculty_leads)
      .filter(
        (value, index, self) =>
          self.findIndex((f) => f.id === value.id) === index
      )
      .sort((a, b) => a.display_name.localeCompare(b.display_name));

    setFacultyLeads(uniqueFacultyLeads);
  }, [programs]);

  const handleFacultySelect = (facultyId: string) => {
    setSelectedFacultyId(facultyId);
    onFacultySelect(facultyId); // Pass the selected ID to parent
    setOpen(false); // Close the dropdown
  };

  // Get selected faculty display name
  const selectedFaculty = facultyLeads.find(
    (faculty) => String(faculty.id) === selectedFacultyId
  );

  const filteredFacultyLeads = facultyLeads
    .filter((faculty) => {
      const facultyNameLower = faculty.display_name.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      // logger.debug("Faculty Name (lowercase):", facultyNameLower);
      // logger.debug("Search Term (lowercase):", searchLower);
      // logger.debug(
      //   "name includes search: " + facultyNameLower.includes(searchLower)
      // );
      return facultyNameLower.includes(searchLower);
    })
    .sort((a, b) => a.display_name.localeCompare(b.display_name));

  return (
    <Popover open={open} onOpenChange={setOpen} aria-label="Filter by faculty">
      {disable ? (
        <Button
          variant="outline"
          className="justify-between cursor-not-allowed opacity-50"
        >
          Select Faculty
          <ChevronsUpDown className="ml-2 opacity-50" />
        </Button>
      ) : (
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
            aria-label="Filter by faculty"
          >
            {selectedFaculty
              ? `${selectedFaculty.display_name} (${selectedFaculty.username})`
              : "Select Faculty"}
            <ChevronsUpDown className="ml-2 opacity-50" />
          </Button>
        </PopoverTrigger>
      )}

      <PopoverContent className="w-full p-0" aria-label="Filter by faculty">
        <Command>
          <CommandInput
            aria-label="Filter by faculty"
            placeholder="Search faculty..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No faculty found.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => handleFacultySelect("")} value="all">
                All Faculty
                <Check
                  className={cn(
                    "ml-auto",
                    selectedFacultyId === "" ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
              {filteredFacultyLeads.map((faculty) => (
                <CommandItem
                  key={faculty.id}
                  value={`${faculty.display_name} (${faculty.username})`}
                  onSelect={() => handleFacultySelect(String(faculty.id))}
                >
                  {faculty.display_name}({faculty.username})
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedFacultyId === String(faculty.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default FacultySelect;
