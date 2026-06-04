"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "../api.js";
import { StudentProgramBrowseType } from "../types/models";
import { StatusBadge } from "../components/StatusBadge";
import { isStudent, checkAppIsOpen, checkDeadlinePassed } from "../lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import logger from "../components/Logger";
import FacultySelect from "../components/FacultySelect";
import { ExpandableDescription } from "./ExpandableDescription";
export default function StudentBrowsePrograms() {
  const [programs, setPrograms] = useState<StudentProgramBrowseType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPastDeadlines, setShowPastDeadlines] = useState(false); // New state for toggle
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [is_student, setStudent] = useState<boolean>(true);

  /**
   * faculty select prop
   * @param facultyId
   */
  const handleFacultySelect = (facultyId: string) => {
    setSelectedFaculty(facultyId);
  };
  /**
   * Fetches program data from the server.
   */
  async function getProgramList() {
    try {
      const res = await api.get("/api/programs-student-list/");
      return res.data;
    } catch (error) {
      throw new Error("Failed to fetch data: " + error);
    }
  }

  /**
   * Fetch on program mount
   */
  useEffect(() => {
    const fetchData = async () => {
      const data: StudentProgramBrowseType[] = await getProgramList();
      setPrograms(data);
    };
    fetchData().catch(logger.error);
    const student_status = isStudent();
    setStudent(student_status);
  }, []);

  let filteredPrograms: StudentProgramBrowseType[];
  logger.info("Programs state:", programs);

  if (programs) {
    // Filter prog}rams based on the search query and showPastDeadlines state
    filteredPrograms = programs.filter((program) => {
      const titleMatch = program.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const isDeadlinePassed = checkDeadlinePassed(program.deadline);

      return (
        titleMatch &&
        (showPastDeadlines || !isDeadlinePassed) &&
        (!selectedFaculty ||
          program.faculty_leads.some(
            (faculty) => faculty.id.toString() === selectedFaculty
          )) // Filter by selected faculty
      );
    });
  } else {
    filteredPrograms = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Explore Study Abroad Programs</h1>
      <div className="w-3/4 mx-auto">
        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search programs by title..."
            className="p-2 border border-gray-300 rounded-lg w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Faculty Select */}
        <FacultySelect
          programs={programs}
          onFacultySelect={handleFacultySelect}
        />

        {/* Toggle Button */}
        <div className="flex items-center space-x-2 my-2">
          <Switch
            id="airplane-mode"
            checked={showPastDeadlines}
            onCheckedChange={() => setShowPastDeadlines(!showPastDeadlines)}
          />
          <Label htmlFor="airplane-mode">Show Passed Deadlines</Label>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {filteredPrograms.length > 0 ? (
            filteredPrograms.map((program) => (
              <Card key={program.id}>
                <CardHeader>
                  <CardTitle>{program.title}</CardTitle>
                  <CardDescription>{program.location}</CardDescription>
                </CardHeader>

                <CardContent>
                  <p>
                    <strong>When: </strong>
                    {program.year} {program.semester}
                  </p>

                  <div className="my-4 border-t border-gray-300"></div>

                  <p>
                    <strong>Faculty Leads: </strong>
                    {program.faculty_leads
                      .map((lead) => `${lead.display_name} (${lead.username})`)
                      .join(", ")}
                  </p>

                  <div className="my-4 border-t border-gray-300"></div>

                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2">
                      <strong>Application Open Date:</strong>
                      <span>{program.open_date}</span>

                      <strong>Application Deadline:</strong>
                      <span>{program.deadline}</span>

                      <strong>Document Deadline:</strong>
                      <span>{program.essential_doc_deadline}</span>

                      {program.track_payment && (
                        <>
                          <strong>Payment Deadline:</strong>
                          <span>{program.payment_deadline}</span>
                        </>
                      )}

                      <strong>Start Date:</strong>
                      <span>{program.start_date}</span>

                      <strong>End Date:</strong>
                      <span>{program.end_date}</span>
                    </div>
                  </div>

                  <div className="my-4 border-t border-gray-300"></div>

                  <ExpandableDescription description={program.description} />

                  <div className="my-1 border-t border-gray-300"></div>

                  {/* Prerequisites Section */}
                  {program.prerequisites &&
                    program.prerequisites.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Prerequisites:</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {program.prerequisites.map((course, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {course.department} {course.number}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Students must have completed these courses with at
                          least a D- grade or be currently enrolled.
                        </p>
                      </div>
                    )}

                  {is_student ? (
                    <Button
                      className="m-2 text-base py-2 px-4 text-gray-600 bg-[var(--theme-color)] hover:bg-[var(--theme-color)]"
                      style={{ color: "var(--secondary-color)" }}
                      asChild
                    >
                      <Link href={`/dashboard/programs/${program.id}`}>
                        View Details
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className="m-2 cursor-not-allowed text-base py-2 px-4 text-gray-600 bg-[var(--theme-color)] hover:bg-[var(--theme-color)]"
                      style={{ color: "var(--secondary-color)" }}
                    >
                      View Details
                    </Button>
                  )}
                </CardContent>

                <CardFooter className="m-2">
                  {is_student && program.has_applied ? (
                    <Link
                      href={`/dashboard/applications/${program.application_id}`}
                    >
                      <p>
                        <strong>Application Status: </strong>
                      </p>
                      <StatusBadge
                        status={program.application_status}
                        hoverable={true}
                      />
                    </Link>
                  ) : checkDeadlinePassed(program.deadline) ? (
                    <Button variant="secondary" className="text-base py-2 px-4">
                      Deadline Passed
                    </Button>
                  ) : checkAppIsOpen(program.open_date, program.deadline) &&
                    is_student ? (
                    <Button className="text-base py-2 px-4" asChild>
                      <Link
                        href={`/dashboard/applications/create/${program.id}`}
                      >
                        Apply
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="secondary" className="text-base py-2 px-4">
                      Application Not Open Yet
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <p>No Available Programs</p>
          )}
        </div>
      </div>
    </div>
  );
}
