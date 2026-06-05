"use client";

import { useEffect, useState } from "react";
import api from "../../../../api.js";
import { Application, ApplicationStatus } from "../../../../types/models";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"; // Assuming Card components exist
import {
  AlertDialogButton,
  AlertDialogProps,
} from "../../../../components/AlertDialogButton";
import { StatusBadge } from "../../../../components/StatusBadge";
import logger from "../../../../components/Logger";
import EssentialDocumentSubmission from "../../../../components/EssentialDocumentSubmission";

import { LoadingSpinner } from "@/components/LoadingSpinner";

import RecommendationLetters from "../../../../components/RecommendationLetters";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { AlertCircle } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ApplicationDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [prereqStatus, setPrereqStatus] = useState<{
    completed: string[];
    missing: string[];
    parsing_errors: string[];
    is_valid: boolean;
  }>({ completed: [], missing: [], parsing_errors: [], is_valid: true });
  const [prereqChecked, setPrereqChecked] = useState<boolean>(false);
  const [refreshingPrereqs, setRefreshingPrereqs] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const fetchApplication = async () => {
    try {
      const response = await api.get(`/api/applications/${id}/`);
      setApplication(response.data);
    } catch (error) {
      logger.error("Failed to fetch application:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
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
    if (!application?.student?.ulink_username) {
      return;
    }

    try {
      const response = await api.get(`/api/programs/${programId}/check-prerequisites/`);
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
    // Only check if user has ULINK connection
    if (!application?.student?.ulink_username) {
      return;
    }

    setRefreshingPrereqs(true);
    try {
      // Force a refresh from ULINK
      const response = await api.get(`/api/programs/${programId}/check-prerequisites/?force_refresh=true`);
      if (response.data) {
        setPrereqStatus({
          completed: response.data.completed || [],
          missing: response.data.missing || [],
          parsing_errors: response.data.parsing_errors || [],
          is_valid: response.data.is_valid || true
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

  const changeStatus = async (status: string) => {
    try {
      await api.patch(`/api/applications/${id}/change_status/`, { status });
      fetchApplication(); // Refresh application details
    } catch (error) {
      logger.error("Failed to change status:", error);
    }
  };

  const isBeforeDeadline = (deadline: string) =>
    new Date() < new Date(deadline);

  const isOpen = (open_date: string) => new Date() > new Date(open_date);

  const alertWithdrawBoxProps: AlertDialogProps = {
    triggerElement: (
      <div className="m-2">
        <Button variant="destructive">Withdraw Application</Button>
      </div>
    ),
    warningDescription:
      "This action will remove your application from consideration.",
    clickAction: async () => changeStatus("Withdrawn"),
  };

  const alertReactivateBoxProps: AlertDialogProps = {
    triggerElement: (
      <div className="m-2">
        <Button variant="default">Reactivate Application</Button>
      </div>
    ),
    warningDescription:
      "This action will reactivate your application for consideration.",
    clickAction: async () => changeStatus(ApplicationStatus.Applied),
  };

  const questions = [
    "Why do you want to participate in this study abroad program?",
    "How does this program align with your academic or career goals?",
    "What challenges do you anticipate during this experience, and how will you address them?",
    "Describe a time you adapted to a new or unfamiliar environment.",
    "What unique perspective or contribution will you bring to the group?",
  ];

  const navigateToUlinkConnect = () => {
    router.push("/dashboard/profile/ulink-connect");
  };

  if (loading) return <LoadingSpinner message={"Loading"} />;

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
          <strong>Application Status:</strong>
          <span className="ml-2">
            <StatusBadge status={application.status} />
          </span>
          {application.program.track_payment &&
          (application.status == ApplicationStatus.Approved ||
            application.status == ApplicationStatus.Enrolled) ? (
              <>
                {" "}
                <strong>Payment Status:</strong>
                <span className="ml-2">
                  <PaymentStatusBadge status={application.payment_status} />
                </span>
              </>
            ) : null}
          {/* Dividing Line */}
          <div className="my-4 border-t border-gray-300"></div>
        </div>

        {/* ULink Connection Alert */}
        {application.program.prerequisites && 
         application.program.prerequisites.length > 0 && 
         !application.student.ulink_username && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">ULink Account Required</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>This program has prerequisites. You need to connect your ULink account to verify your eligibility.</p>
                  <div className="mt-4">
                    <Button 
                      variant="default"
                      className="bg-yellow-500 text-white hover:bg-yellow-600"
                      onClick={navigateToUlinkConnect}
                    >
                      Connect ULink Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Student Information */}
        <div className="space-y-2">
          <p>
            <strong>Student:</strong> {application.student.display_name}(
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
              href={`/dashboard/programs/${application.program.id}`}
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
            <strong>Faculty Leads: </strong>
            {application.program.faculty_leads
              .map((lead) => `${lead.display_name} (${lead.username})`)
              .join(", ")}{" "}
          </p>

          <div className="my-4 border-t border-gray-300"></div>
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
                      {/* Show validation errors if any */}
                      {prereqStatus.parsing_errors && prereqStatus.parsing_errors.length > 0 && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm font-medium text-amber-800">Transcript Data Issues:</p>
                          <ul className="mt-1 text-xs text-amber-700 list-disc list-inside">
                            {prereqStatus.parsing_errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                          <p className="text-xs text-amber-700 mt-2">
                            These issues might affect prerequisite verification accuracy. Please contact an administrator to resolve transcript data issues.
                          </p>
                        </div>
                      )}
                      
                      {prereqStatus.is_valid !== false ? (
                        prereqStatus.missing.length > 0 ? (
                          <p className="text-sm text-red-600 mt-2">
                            You are missing {prereqStatus.missing.length} prerequisite(s). Please contact faculty leads if you need an exception.
                          </p>
                        ) : (
                          <p className="text-sm text-green-600 mt-2">
                            All prerequisites have been met based on your transcript data.
                          </p>
                        )
                      ) : (
                        <p className="text-sm text-red-600 mt-2">
                          Your uLink transcript data is corrupted. Please contact an administrator to resolve the issue.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 mt-2">
                      Your ULINK account is connected. Transcript data can be checked for these courses.
                    </p>
                  )
                ) : (
                  <div className="text-sm mt-2">
                    <p className="text-red-600">
                      Note: You don't have a connected ULINK account. Please connect your account to verify prerequisites.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

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

        {/* Essential Documents */}
        {application.status === ApplicationStatus.Approved ||
        application.status === ApplicationStatus.Enrolled ? (
            <CardContent className="w-3/5 mx-auto">
              <EssentialDocumentSubmission
                essentialDocDeadline={application.program.essential_doc_deadline}
                applicationId={application.id}
              />
            </CardContent>
          ) : (
            <div>
              <h3 className="text-lg font-semibold">Essential Documents</h3>
              <p className="text-gray-600">
                The Essential Documents section will be available once your
                application has been approved or you are enrolled. Please contact
                an administrator if you need help.
              </p>
            </div>
          )}

        {/* Recommendation Letters */}
        <CardContent className="w-3/5 mx-auto mt-6">
          <RecommendationLetters applicationId={application.id} />
        </CardContent>

        {/* Actions */}
        <div className="mt-6 flex items-center space-x-4">
          {application.status === ApplicationStatus.Applied &&
          isBeforeDeadline(application.program.deadline) &&
          isOpen(application.program.open_date) ? (
              <Button className="bg-[var(--theme-color)] text-gray-600 py-2 px-4 rounded-md hover:bg-[var(--theme-color)]" style={{ color: "var(--secondary-color)" }}>
                <Link href={`/dashboard/applications/${application.id}/update`}>
                  Edit Application
                </Link>
              </Button>
            ) : null}

          {application.status !== ApplicationStatus.Canceled &&
          application.status !== ApplicationStatus.Not_Applied &&
          application.status !== ApplicationStatus.Withdrawn &&
          application.status !== ApplicationStatus.Completed ? (
              <AlertDialogButton alertDialogProps={alertWithdrawBoxProps} />
            ) : application.status === ApplicationStatus.Withdrawn &&
            isBeforeDeadline(application.program.deadline) &&
            isOpen(application.program.open_date) ? (
                <AlertDialogButton alertDialogProps={alertReactivateBoxProps} />
              ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
