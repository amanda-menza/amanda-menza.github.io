"use client";
import { useEffect, useState } from "react";
import api from "../../../../api.js";
import { Program } from "../../../../types/models";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"; // Assuming Card components exist
import { checkAppIsOpen, checkDeadlinePassed } from "../../../../lib/utils";
import { StatusBadge } from "../../../../components/StatusBadge";
import { ApplicationStatus } from "../../../../types/models.js";
import logger from "../../../../components/Logger";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface ApplicationStatusType {
  id: number;
  has_application: boolean;
  application_status: ApplicationStatus;
}

export default function ProgramDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [program, setProgram] = useState<Program>();
  const [appStatus, setAppStatus] = useState<ApplicationStatusType>();

  const [loading, setLoading] = useState(true);

  async function getProgram() {
    try {
      const res = await api.get(`/api/programs/${id}/`);
      return res.data;
    } catch (error) {
      throw new Error("Failed to fetch data: " + error);
    } finally {
      setLoading(false);
    }
  }

  async function getAppStatus() {
    try {
      const res = await api.get(`/api/check-application/${id}/`);
      return res.data;
    } catch (error) {
      throw new Error("Failed to fetch data: " + error);
    }
  }

  useEffect(() => {
    const fetchProgram = async () => {
      const data: Program = await getProgram();
      setProgram(data);
      const status: ApplicationStatusType = await getAppStatus();
      setAppStatus(status);
    };
    fetchProgram().catch(logger.error);
  }, [id]);

  if (loading) return <LoadingSpinner message={"Loading"} />;

  if (!program || !appStatus) return <p>No Program Info Available</p>;

  return (
    <>
      <Card className="w-3/4 mx-auto" key={program.id}>
        <CardHeader>
          <CardTitle className="text-2xl">{program.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Dividing Line */}
          <div className="my-4 border-t border-gray-300"></div>
          {/* Student Information */}
          <div className="space-y-2">
            <p>
              <strong>Title:</strong> {program.title}
            </p>
            <p>
              <strong>Location:</strong> {program.location}
            </p>
            <p>
              <strong>When:</strong> {program.year} {program.semester}
            </p>
          </div>

          {/* Dividing Line */}
          <div className="my-4 border-t border-gray-300"></div>
          <p>
            <strong>Faculty:</strong>{" "}
            {program.faculty_leads
              .map((lead) => `${lead.display_name} (${lead.username})`)
              .join(", ")}{" "}
          </p>

          <div className="my-4 border-t border-gray-300"></div>

          {/* Program Date Information */}
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2">
              <strong>Application Open Date:</strong>
              <span>{program.open_date}</span>

              <strong>Application Deadline:</strong>
              <span>{program.deadline}</span>

              <strong>Document Deadline:</strong>
              <span>{program.essential_doc_deadline}</span>

              {program.track_payment ? (
                <>
                  <strong>Payment Deadline:</strong>
                  <span>{program.payment_deadline}</span>
                </>
              ) : null}

              <strong>Start Date:</strong>
              <span>{program.start_date}</span>

              <strong>End Date:</strong>
              <span>{program.end_date}</span>
            </div>
          </div>

          {/* Dividing Line */}
          <div className="my-4 border-t border-gray-300"></div>

          <div className="mt-4">
            <div>
              <strong>Description:</strong>{" "}
              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: program.description,
                }}
              />
            </div>
          </div>
          <div className="my-4 border-t border-gray-300"></div>
          {/* Dividing Line */}
          {program.questions.length > 0 ? (
            <div className="mt-4">
              <strong>Program Questions:</strong>
              <ul className="list-disc list-inside mt-2">
                {program.questions.map((question, index) => (
                  <li key={index}>{question.text}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-4">
              <strong>Program Questions:</strong>
              <p className="text-gray-500">None</p>
            </div>
          )}
          <div className="my-4 border-t border-gray-300"></div>
          
          {/* Prerequisites Section */}
          <div className="mt-4">
            <strong>Prerequisites:</strong>
            {program.prerequisites && program.prerequisites.length > 0 ? (
              <>
                <ul className="list-disc list-inside mt-2">
                  {program.prerequisites.map((course, index) => (
                    <li key={index}>{course.department} {course.number}</li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500 mt-2">
                  Students must have completed these courses with at least a D- grade or be currently enrolled (IP).
                  If you need an exception, please contact the faculty lead.
                </p>
              </>
            ) : (
              <p className="text-gray-500">None</p>
            )}
          </div>
          <div className="my-4 border-t border-gray-300"></div>

          <CardFooter className="m-2">
            {" "}
            {appStatus.has_application ? (
              <Link href={`/dashboard/applications/${appStatus.id}`}>
                <StatusBadge
                  status={appStatus.application_status}
                  hoverable={true}
                />
              </Link>
            ) : checkDeadlinePassed(program.deadline) ? (
              <Button variant="secondary" className="text-base py-2 px-4">
                Deadline Passed
              </Button>
            ) : checkAppIsOpen(program.open_date, program.deadline) ? (
              <Button className="text-base py-2 px-4" asChild>
                <Link href={`/dashboard/applications/create/${program.id}`}>
                  Apply
                </Link>
              </Button>
            ) : (
              <Button variant="secondary" className="text-base py-2 px-4">
                Application Not Open Yet
              </Button>
            )}
          </CardFooter>
        </CardContent>
      </Card>
    </>
  );
}
