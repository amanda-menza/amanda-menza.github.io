"use client";

import React from "react";
import { useEffect, useState } from "react";
import api from "../../../../../api.js";
import {
  Application,
  ApplicationStatus,
  RecommendationLetter,
} from "../../../../../types/models";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge"; // Assuming Badge component exists
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"; // Assuming Card components exist
import { StatusChangeForm } from "../../../../../components/StatusChangeForm";
import { ConfidentialNotes } from "../../../../../components/ConfidentialNotes";
import { StatusBadge } from "../../../../../components/StatusBadge";
import { PaymentStatusBadge } from "../../../../../components/PaymentStatusBadge";
import { Button } from "@/components/ui/button";
import AdminEssentialDocuments from "../../../../../components/AdminEssentialDocuments";
import ChangeStatusDropdown from "@/components/ChangeStatusDropdown";
import { getStoredUserData } from "@/lib/utils";
import logger from "@/components/Logger";
import { IdCard, AlertCircle } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AdminRecommendationLetters } from "@/components/AdminRecommendationLetters";
import ChangePaymentStatusDropdown from "@/components/PaymentStatusDropdown";

const ApplicationPage = (): React.ReactElement => {
  const params = useParams<{ id: string }>();
  const id = params?.id || ""; // Safely handle potential null with optional chaining
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const userRoles = getStoredUserData().roles;
  const [recLetters, setRecLetters] = useState<RecommendationLetter[]>([]);
  const [prereqStatus, setPrereqStatus] = useState<{
    completed: string[];
    missing: string[];
    parsing_errors: string[];
    is_valid: boolean;
  }>({ completed: [], missing: [], parsing_errors: [], is_valid: true });
  const [prereqChecked, setPrereqChecked] = useState<boolean>(false);
  const [refreshingPrereqs, setRefreshingPrereqs] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const fetchApplication = async (id: string): Promise<void> => {
    try {
      const response = await api.get(`/api/applications/${id}/`);
      setApplication(response.data);
    } catch (error) {
      setApplication(null);
    }
  };

  useEffect(() => {
    fetchApplication(id);
  }, [id]);

  // Add back the automatic prerequisites check on component load, but don't force refresh
  useEffect(() => {
    if (application?.program?.id && application?.student?.ulink_username) {
      // Use cached data on initial load (no force_refresh)
      checkPrerequisitesFromCache(application.program.id);
    }
  }, [application]);
  
  // Function to check prerequisites using cached data
  const checkPrerequisitesFromCache = async (programId: number) => {
    // Only check if student has ULINK connection
    if (!application?.student?.ulink_username) {
      return;
    }

    try {
      const response = await api.get(`/api/applications/${id}/admin-check-prerequisites/`);
      if (response.data) {
        setPrereqStatus({
          completed: response.data.completed || [],
          missing: response.data.missing || [],
          parsing_errors: response.data.parsing_errors || [],
          is_valid: response.data.is_valid !== undefined ? response.data.is_valid : true
        });
        setPrereqChecked(true);
        
        if (response.data.last_refreshed) {
          const refreshDate = new Date(response.data.last_refreshed);
          setLastRefreshed(refreshDate.toLocaleString());
        }
      }
    } catch (error) {
      logger.error("Failed to check prerequisites:", error);
    }
  };
  
  // Function to force refresh prerequisites data from ULINK
  const checkPrerequisites = async (programId: number) => {
    // Only check if student has ULINK connection
    if (!application?.student?.ulink_username) {
      return;
    }

    setRefreshingPrereqs(true);
    try {
      // Use the admin-specific endpoint with force_refresh to get fresh data
      const response = await api.get(`/api/applications/${id}/admin-check-prerequisites/?force_refresh=true`);
      if (response.data) {
        setPrereqStatus({
          completed: response.data.completed || [],
          missing: response.data.missing || [],
          parsing_errors: response.data.parsing_errors || [],
          is_valid: response.data.is_valid !== undefined ? response.data.is_valid : true
        });
        setPrereqChecked(true);
        
        // Use the server-provided timestamp
        if (response.data.last_refreshed) {
          const refreshDate = new Date(response.data.last_refreshed);
          setLastRefreshed(refreshDate.toLocaleString());
        } else {
          setLastRefreshed(new Date().toLocaleString());
        }
      }
    } catch (error) {
      logger.error("Failed to refresh prerequisites:", error);
    } finally {
      setRefreshingPrereqs(false);
    }
  };

  // Fetch recommendation letters
  useEffect(() => {
    const fetchRecLetters = async () => {
      try {
        const response = await api.get(
          `/api/applications/${id}/recommendation-letters/`
        );
        setRecLetters(response.data);
      } catch (error) {
        logger.error("Failed to fetch recommendation letters:", error);
      }
    };

    if (application) {
      fetchRecLetters();
    }
  }, [application, id]);

  const handleChangeStatus = async (newStatus: string) => {
    try {
      await api.patch(`/api/applications/${id}/change_status/`, {
        status: newStatus,
      });
      // Update the status locally
    } catch (error) {
      logger.error("Failed to change status:", error);
    }
  };
  const handleChangePaymentStatus = async (newStatus: string) => {
    try {
      await api.patch(`/api/applications/${id}/change_payment_status/`, {
        payment_status: newStatus,
      });
      // Update the status locally
    } catch (error) {
      logger.error("Failed to change status:", error);
    }
  };

  if (!application) return <p>No Application Info Available</p>;

  return (
    <Card className="w-3/4 mx-auto" key={application.id}>
      <CardHeader>
        <CardTitle>Application Details</CardTitle>
        <CardDescription>
          Submitted on {application.submission_date.split("T")[0]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Status */}
        <div className="mt-4">
          <strong>Application Status:</strong>{" "}
          <StatusBadge status={application.status} />
          {application.status !== "Withdrawn" ? (
            <ChangeStatusDropdown
              buttonText="Change Application Status"
              application={application}
              userRoles={userRoles}
              handleChangeStatus={handleChangeStatus}
            />
          ) : null}
        </div>
        {application.program.track_payment ? (
          <div className="mt-4">
            <strong>Payment Status:</strong>{" "}
            <PaymentStatusBadge status={application.payment_status} />
            <ChangePaymentStatusDropdown
              buttonText="Change Payment Status"
              application={application}
              handleChangeStatus={handleChangePaymentStatus}
            />
            {/* Dividing Line */}
            <div className="my-4 border-t border-gray-300"></div>
          </div>
        ) : null}
        {/* Student Information */}
        <div className="space-y-2">
          <p>
            <strong>Student:</strong> {application.student.display_name} (
            {application.student.username})
          </p>
          <p>
            <strong>DOB:</strong> {application.student.dob}
          </p>
          <p>
            <strong>GPA:</strong> {application.student.profile?.gpa}
          </p>
          <p>
            <strong>Major:</strong> {application.student.profile?.major}
          </p>
        </div>
        {/* Dividing Line */}
        <div className="my-4 border-t border-gray-300"></div>

        {/* Program Information */}
        <div className="mt-4 space-y-2">
          <p>
            <strong>Program:</strong>{" "}
            <Link
              href={`/administrator/dashboard/programs/${application.program.id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {application.program.title}
            </Link>
          </p>
          <p>
            <strong>Location:</strong> {application.program.location}
          </p>
          <p>
            <strong>When:</strong> {application.program.year}{" "}
            {application.program.semester}{" "}
          </p>
          {/* Dividing Line */}
          <div className="my-4 border-t border-gray-300"></div>
          <p>
            <strong>Faculty:</strong>{" "}
            {application.program.faculty_leads
              .map((lead) => `${lead.display_name} (${lead.username})`)
              .join(", ")}{" "}
          </p>

          <div className="my-4 border-t border-gray-300"></div>
          {application.program.track_payment ? (
            <>
              <p>
                <strong>Provider Partners:</strong>{" "}
                {application.program.provider_partners
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
              <span>{application.program.open_date}</span>

              <strong>Application Deadline:</strong>
              <span>{application.program.deadline}</span>

              <strong>Document Deadline:</strong>
              <span>{application.program.essential_doc_deadline}</span>

              {application.program.track_payment ? (
                <>
                  <strong>Payment Deadline:</strong>
                  <span>{application.program.payment_deadline}</span>
                </>
              ) : null}

              <strong>Start Date:</strong>
              <span>{application.program.start_date}</span>

              <strong>End Date:</strong>
              <span>{application.program.end_date}</span>
            </div>
          </div>
          {/* Dividing Line */}
          <div className="my-4 border-t border-gray-300"></div>
          <div>
            <strong>Description:</strong>{" "}
            <div
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: application.program.description,
              }}
            />
          </div>
          
          {/* Prerequisites Section */}
          {application.program.prerequisites && application.program.prerequisites.length > 0 && (
            <>
              <div className="my-4 border-t border-gray-300"></div>
              <div>
                <div className="flex items-center justify-between">
                  <strong>Prerequisites:</strong>
                  <div className="flex items-center gap-2">
                    {lastRefreshed && (
                      <span className="text-xs text-gray-500">
                        Last updated: {lastRefreshed}
                      </span>
                    )}
                    {application.student.ulink_username && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => checkPrerequisites(application.program.id)}
                        disabled={refreshingPrereqs}
                        className="relative"
                      >
                        {refreshingPrereqs ? "Refreshing..." : "Refresh Transcript Data"}
                        {prereqChecked && prereqStatus.parsing_errors && 
                         prereqStatus.parsing_errors.length > 0 && (
                          <span className="absolute -top-2 -right-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle 
                                    className="h-4 w-4 text-amber-500 bg-white rounded-full" 
                                    aria-label="Transcript data contains warnings"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Transcript contains formatting errors or suspicious data that may affect prerequisite verification.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </span>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {application.program.prerequisites.map((course, index) => {
                      const courseStr = `${course.department} ${course.number}`;
                      const isMet = prereqChecked && prereqStatus.completed.includes(courseStr);
                      const isMissing = prereqChecked && prereqStatus.missing.includes(courseStr);
                      const bgColor = isMet 
                        ? "bg-green-100 text-green-800" 
                        : isMissing 
                          ? "bg-red-100 text-red-800" 
                          : "bg-red-100 text-red-800";
                      
                      return (
                        <span 
                          key={index} 
                          className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${bgColor}`}
                        >
                          {course.department} {course.number}
                        </span>
                      );
                    })}
                  </div>
                  {application.student.ulink_username ? (
                    prereqChecked ? (
                      <div>
                        {/* Display validation status alert if data is invalid
                        {prereqStatus.is_valid === false && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm font-bold text-red-800">⚠️ uLink Transcript Data Corruption Detected</p>
                            <p className="text-xs text-red-700 mt-1">
                              The student's uLink transcript data appears to be corrupted. Please verify with the student and help them resolve this issue.
                            </p>
                          </div>
                        )} */}
                        
                        {/* Show prerequisite status if data is valid */}
                        {prereqStatus.is_valid !== false ? (
                          prereqStatus.missing.length > 0 ? (
                            <p className="text-sm text-red-600 mt-2">
                              Student is missing {prereqStatus.missing.length} prerequisite(s).
                            </p>
                          ) : (
                            <p className="text-sm text-green-600 mt-2">
                              All prerequisites have been met based on student's transcript data.
                            </p>
                          )
                        ) : (
                          <p className="text-sm text-red-600 mt-2">
                            Using cached transcript data. Unable to refresh data due to transcript validation issues.
                          </p>
                        )}
                        
                        {/* Display parsing errors if any */}
                        {prereqStatus.parsing_errors && prereqStatus.parsing_errors.length > 0 && (
                          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm font-medium text-amber-800">Transcript Data Issues:</p>
                            <ul className="mt-1 text-xs text-amber-700 list-disc list-inside">
                              {prereqStatus.parsing_errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                            <p className="text-xs text-amber-700 mt-2">
                              These issues might affect prerequisite verification accuracy. Consider manually verifying the transcript.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mt-2">
                        Student has a connected ULINK account. Transcript data can be checked for these courses.
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-red-600 mt-2">
                      Note: Student does not have a connected ULINK account. Cannot verify prerequisites.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Answers */}
        {application?.program?.questions?.length > 0 &&
          application?.answers && (
          <div className="mt-4">
            {/* Dividing Line */}
            <div className="my-4 border-t border-gray-300"></div>

            <strong>Questionnaire:</strong>

            {application.program.questions.map((question, index) => {
              // Find the answer that corresponds to the current question ID
              const answer = application.answers.find(
                (ans) => ans.question === question.id
              );

              return (
                <div key={question.id}>
                  <strong>{question.text}</strong>{" "}
                  <div className="whitespace-pre-line">
                    {answer?.response || "No answer provided"}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dividing Line */}
        <div className="my-4 border-t border-gray-300"></div>

        {/* Recommendation Letters */}
        <CardContent className="w-3/5 mx-auto">
          <AdminRecommendationLetters letters={recLetters} />
        </CardContent>

        {/* Dividing Line */}
        <div className="my-4 border-t border-gray-300"></div>
      </CardContent>
      <CardContent className="w-3/5 mx-auto">
        <AdminEssentialDocuments
          essentialDocDeadline={application.program.essential_doc_deadline}
          applicationId={id}
          userRoles={userRoles}
        />
      </CardContent>
      {/* Dividing Line */}
      <div className="mb-4 border-t border-gray-300"></div>
      <CardContent className="w-3/5 mx-auto">
        <ConfidentialNotes applicationId={id} />
      </CardContent>
    </Card>
  );
};

export default ApplicationPage;
