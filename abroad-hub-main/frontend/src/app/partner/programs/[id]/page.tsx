"use client";

import { useEffect, useState } from "react";
import api from "../../../../api.js";
import {
  Program,
  PartnerProgramDetailsTableData,
  UserRoles,
} from "../../../../types/models";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"; // Assuming Card components exist

import logger from "../../../../components/Logger";
import { getStoredUserData } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PartnerIndividualProgramTable } from "@/components/PartnerIndividualProgramTable";

export default function PartnerProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [programDetail, setProgramDetail] = useState<
    PartnerProgramDetailsTableData[]
  >([]);
  const user = getStoredUserData();
  const userRoles = user.roles;

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
      const response = await api.get(`/api/programs/${id}/partner/`);
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
    fetchProgramDetail();
  }, [program]);

  if (loading) return <LoadingSpinner message={"Loading"} />;

  if (!program) return <p>No Program Info Available</p>;

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

          <p>
            <strong>Provider Partners:</strong>{" "}
            {program.provider_partners
              ?.map(
                (partner) => `${partner.display_name} (${partner.username})`
              )
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

              <strong>Payment Deadline:</strong>
              <span>{program.payment_deadline}</span>

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
          {/* <div className="my-4 border-t border-gray-300"></div>

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
          )} */}

          {/* Dividing Line */}
          <div className="my-4 border-t border-gray-300"></div>
          <CardFooter></CardFooter>
        </CardContent>
      </Card>
      <PartnerIndividualProgramTable
        data={programDetail}
        fetchTable={fetchProgramDetail}
      />
    </>
  );
}
