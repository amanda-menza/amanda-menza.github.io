"use client";

import { useEffect, useState } from "react";
import api from "../../../../../api.js";
import {
  Program,
  AdminProgramDetailsTableData,
  UserRoles,
} from "../../../../../types/models";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"; // Assuming Card components exist
import {
  AlertDialogButton,
  AlertDialogProps,
} from "../../../../../components/AlertDialogButton";
import { AdminIndividualProgramTable } from "@/components/AdminIndividualProgramTable";
import logger from "../../../../../components/Logger";
import { getStoredUserData } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [programDetail, setProgramDetail] = useState<
    AdminProgramDetailsTableData[]
  >([]);
  const user = getStoredUserData();
  const userRoles = user.roles;
  const isAdmin = userRoles.includes(UserRoles.Administrator);
  const requiredRoles = [UserRoles.Administrator, UserRoles.Reviewer];
  const hasProgramDetailAccess =
    requiredRoles.some((role) => userRoles.includes(role)) ||
    (userRoles.includes(UserRoles.Faculty) &&
      program?.faculty_leads.some((lead) => lead.id == user.id));

  const fetchProgram = async () => {
    try {
      const response = await api.get(`/api/programs/${id}/`);
      setProgram(response.data);
    } catch (error) {
      logger.error("Failed to fetch program:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchProgramDetail = async () => {
    try {
      const response = await api.get(`/api/programs/${id}/admin/`);
      setProgramDetail(response.data);
    } catch (error) {
      logger.error("Failed to fetch program:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgram();
  }, [id]);

  useEffect(() => {
    if (program) {
      if (hasProgramDetailAccess) {
        fetchProgramDetail();
      }
    }
  }, [program, hasProgramDetailAccess]);

  const deleteProgram = async () => {
    try {
      const response = await api.delete(`/api/programs/${id}/`);
      logger.info(response.data);
      router.push("/administrator/dashboard/programs");
    } catch (error) {
      logger.error("Failed to fetch program:", error);
    }
  };

  const handleEditProgram = () => {
    router.push(`/administrator/dashboard/programs/${id}/edit/`);
  };

  logger.info(`Length of programDetail: ${programDetail.length}`);

  const alertDeleteBoxProps: AlertDialogProps = {
    triggerElement: (
      <div className="m-4">
        <Button variant="destructive">Delete Program</Button>
      </div>
    ),
    warningDescription: `⚠️ THIS ACTION WILL DELETE THE PROGRAM AND ${programDetail.length} STUDENT APPLICATION(S) FROM RECORD❗❗<br/> THIS CANNOT BE UNDONE❗❗`,
    clickAction: async () => deleteProgram(),
  };

  if (loading) return <LoadingSpinner message={"Loading"} />;

  if (!program) return <p>No Program Info Available</p>;

  return (
    <>
      <Card className="w-3/4 mx-auto" key={program.id}>
        <CardHeader>
          <span className="mb-4 flex justify-end">
            {isAdmin ? (
              <Button 
                onClick={handleEditProgram}
                className="py-3 bg-[var(--theme-color)] text-gray-600 font-semibold rounded-lg hover:bg-[var(--theme-color)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)]"
                style={{ color: 'var(--secondary-color)' }}
                >
                  Edit Program
                </Button>
            ) : null}
          </span>
          <CardTitle className="text-2xl">{program.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Dividing Line */}
          <div className="my-4 border-t border-gray-300"></div>
          {/* Student Information */}
          <div className="space-y-2">
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
          {program.track_payment ? (
            <>
              <p>
                <strong>Provider Partners:</strong>{" "}
                {program.provider_partners
                  ?.map(
                    (partner) => `${partner.display_name} (${partner.username})`
                  )
                  .join(", ")}{" "}
              </p>

              <div className="my-4 border-t border-gray-300"></div>
            </>
          ) : null}

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

          {/* Dividing Line */}
          <div className="my-4 border-t border-gray-300"></div>

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

          {/* Dividing Line */}
          <div className="my-4 border-t border-gray-300"></div>
          
          {/* Prerequisites Section */}
          <div className="mt-4">
            <strong>Prerequisites:</strong>
            {program.prerequisites && program.prerequisites.length > 0 ? (
              <ul className="list-disc list-inside mt-2">
                {program.prerequisites.map((course, index) => (
                  <li key={index}>{course.department} {course.number}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">None</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Students must have completed these courses with at least a D- grade or be currently enrolled (IP).
            </p>
          </div>
          
          {/* Dividing Line */}
          <div className="my-4 border-t border-gray-300"></div>
          
          <CardFooter>
            {isAdmin ? (
              <AlertDialogButton alertDialogProps={alertDeleteBoxProps} />
            ) : null}
          </CardFooter>
        </CardContent>
      </Card>
      {hasProgramDetailAccess ? (
        <AdminIndividualProgramTable
          data={programDetail}
          track_payment={program.track_payment}
          fetchTable={fetchProgramDetail}
        />
      ) : null}
    </>
  );
}
