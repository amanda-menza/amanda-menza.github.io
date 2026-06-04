"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import logger from "../components/Logger";
import Link from "next/link";
import api from "../api.js";
import { ApplicationFormProps, ApplicationStatus } from "../types/models";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";


export default function ApplicationForm({
  applicationProps,
}: {
  applicationProps: ApplicationFormProps;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingPrereqs, setIsCheckingPrereqs] = useState(false);
  const [showUlinkModal, setShowUlinkModal] = useState(false);
  const [showPrereqWarningModal, setShowPrereqWarningModal] = useState(false);
  const [missingPrereqs, setMissingPrereqs] = useState<string[]>([]);
  const [userTookAction, setUserTookAction] = useState(false);
  const [blockFormAccess, setBlockFormAccess] = useState(false);
  const [answers, setAnswers] = useState<
    { question: number; response: string }[]
  >(() => {
    return (
      applicationProps.questionsDefault?.map((question) => {
        // Find an existing answer for this question
        const existingAnswer = applicationProps.answersDefault?.find(
          (answer) => answer.question === question.id
        );

        // Use the existing answer if found, otherwise create a new one
        return existingAnswer
          ? existingAnswer
          : { question: question.id, response: "" };
      }) ?? []
    );
  });

  const user = applicationProps.user;
  const program = applicationProps.program;
  const dob = user?.dob ?? "";
  const major = user?.profile?.major ?? "";
  const gpa = user?.profile?.gpa ?? "";

  // Use react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm({
    defaultValues: {
      answers:
        applicationProps.questionsDefault?.map((question) => ({
          question: question.id,
          response: "",
        })) ?? [],
    },
  });

  // Function to update an answer
  const updateAnswer = (id: number, value: string) => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((answer) =>
        answer.question === id ? { ...answer, response: value } : answer
      )
    );
  };

  // Check prerequisites function
  const checkPrereqs = async (): Promise<boolean> => {
    if (!applicationProps.checkPrerequisites) {
      return true; // Skip check if not required
    }

    logger.info("Checking prerequisites before submission");
    setIsCheckingPrereqs(true);

    try {
      // No prerequisites case
      if (
        !program ||
        !program.prerequisites ||
        program.prerequisites.length === 0
      ) {
        logger.info("No prerequisites found, proceeding with application");
        return true;
      }

      // No ULINK account case
      if (!user || !user.ulink_username) {
        logger.info("No ULINK account connected, showing modal");
        setShowUlinkModal(true);
        return false;
      }

      // Make API call to check prerequisites
      try {
        logger.info(
          `Calling API: /api/programs/${program.id}/check-prerequisites/`
        );
        const response = await api.get(
          `/api/programs/${program.id}/check-prerequisites/`
        );
        logger.info("API Response:", response.data);

        // Process response
        if (response.data && typeof response.data === "object") {
          if ("satisfied" in response.data) {
            const { satisfied, missing } = response.data;

            if (
              satisfied === false &&
              Array.isArray(missing) &&
              missing.length > 0
            ) {
              logger.info(`Found ${missing.length} missing prerequisites`);
              setMissingPrereqs(missing);
              setShowPrereqWarningModal(true);
              return false;
            } else {
              logger.info("All prerequisites satisfied or none missing");
              return true;
            }
          } else {
            logger.error(
              "API response missing 'satisfied' field:",
              response.data
            );
            return true; // Default to allowing submission
          }
        } else {
          logger.error("Invalid API response:", response.data);
          return true; // Default to allowing submission
        }
      } catch (apiError) {
        logger.error("API call failed:", apiError);
        return true; // Default to allowing submission
      }
    } catch (error) {
      logger.error("Unexpected error in checkPrereqs function:", error);
      return true; // Default to allowing submission
    } finally {
      setIsCheckingPrereqs(false);
    }
  };

  const handleUlinkChoice = async (choice: "yes" | "no") => {
    setUserTookAction(true);
    setShowUlinkModal(false);
    if (choice === "yes") {
      logger.info("User redirecting to ULINK connect page");
      router.replace("/dashboard/profile/ulink-connect");
    } else {
      logger.info("User canceling application due to ULINK requirement");
      // Stay on the page, just close the modal
    }
  };

  const handlePrereqWarningChoice = async (choice: "continue" | "cancel") => {
    setUserTookAction(true);
    setShowPrereqWarningModal(false);
    if (choice === "continue") {
      // Continue with submission despite missing prerequisites
      logger.info(
        "User proceeding with application despite missing prerequisites"
      );
      await submitApplication();
    } else {
      // Just close the modal, stay on the form
      logger.info("User decided not to proceed due to missing prerequisites");
    }
  };

  // Handle modal close via escape key or clicking outside
  const handlePrereqModalOpenChange = (open: boolean) => {
    setShowPrereqWarningModal(open);
    // Reset action tracking when modal opens
    if (open) {
      setUserTookAction(false);
    }
  };

  // Handle modal close via escape key or clicking outside
  const handleUlinkModalOpenChange = (open: boolean) => {
    setShowUlinkModal(open);
    // Reset action tracking when modal opens
    if (open) {
      setUserTookAction(false);
    }
  };

  // Function to submit the application
  const submitApplication = async () => {
    try {
      let response;
      if (applicationProps.method === "post") {
        response = await api.post(applicationProps.route, { answers: answers });
      } else {
        response = await api.patch(applicationProps.route, {
          answers: answers,
        });
      }

      if (response.status === 409) {
        alert("You have already applied for this program.");
        setIsSubmitting(false);
        return;
      }

      logger.info("Application submitted:", response.data);
      router.replace(`/dashboard/applications/${response.data.id}/`);
    } catch (error: unknown) {
      logger.error("Error submitting application:", error);
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async () => {
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);

    // Check if DOB, major, and GPA are populated
    if (!dob || !major || !gpa) {
      alert(
        "Please make sure your date of birth, major, and GPA are set in your profile."
      );
      setIsSubmitting(false);
      return;
    }

    const allAnswered = answers.every(
      (answer) => answer.response.trim() !== ""
    );
    if (!allAnswered) {
      alert("Please answer all questions before submitting.");
      setIsSubmitting(false);
      return;
    }

    // Check prerequisites before submitting
    if (applicationProps.checkPrerequisites) {
      const prereqsSatisfied = await checkPrereqs();
      if (!prereqsSatisfied) {
        setIsSubmitting(false);
        return; // Stop submission process, let modals handle the flow
      }
    }

    // If prerequisites check passes or is not required, submit the application
    await submitApplication();
  };

  useEffect(() => {
    if (applicationProps.questionsDefault) {
      setAnswers(
        applicationProps.questionsDefault.map((question) => {
          // Find an existing answer for this question
          const existingAnswer = applicationProps.answersDefault?.find(
            (answer) => answer.question === question.id
          );

          // Use the existing answer if found, otherwise create a new one
          return existingAnswer
            ? existingAnswer
            : { question: question.id, response: "" };
        })
      );
    }
  }, [applicationProps.questionsDefault, applicationProps.answersDefault]);

  // Add upfront check for ULink connection
  useEffect(() => {
    // Check if the program has prerequisites and user doesn't have ULink
    if (
      program?.prerequisites && 
      program.prerequisites.length > 0 &&
      applicationProps.checkPrerequisites &&
      (!user || !user.ulink_username)
    ) {
      setBlockFormAccess(true);
      setShowUlinkModal(true);
    }
  }, [program, user, applicationProps.checkPrerequisites]);

  return loading ? (
    <div>Loading...</div>
  ) : (
    <>
      <div className="max-w-3xl mx-auto p-6 space-y-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Application Form
        </h1>
        
        {blockFormAccess ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-xl font-semibold text-red-700 mb-3">ULink Connection Required</h2>
            <p className="mb-4">
              This program has prerequisites that require a ULink connection to verify your eligibility.
              Please connect your ULink account before applying.
            </p>
            <button
              onClick={() => router.replace("/dashboard/profile/ulink-connect")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Connect ULink Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <strong>
                *Update your{" "}
                <Link
                  className="text-blue-600 underline hover:text-blue-800"
                  href="/dashboard/profile"
                >
                  USER PROFILE
                </Link>{" "}
                to change DOB, GPA, or Major*
              </strong>
            </div>

            {/* DOB Section */}
            <div>
              <label
                htmlFor="dob"
                className="block text-gray-700 font-semibold mb-2"
              >
                Date of Birth
              </label>
              <input
                id="dob"
                value={dob}
                max="2040-12-31"
                type="date"
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg cursor-not-allowed outline-none"
              />
            </div>

            {/* GPA Section */}
            <div>
              <label
                htmlFor="gpa"
                className="block text-gray-700 font-semibold mb-2"
              >
                GPA
              </label>
              <input
                id="gpa"
                type="number"
                readOnly
                value={gpa}
                min="0"
                max="4.0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg cursor-not-allowed outline-none"
              />
            </div>

            {/* Major Section */}
            <div>
              <label
                htmlFor="major"
                className="block text-gray-700 font-semibold mb-2"
              >
                Major
              </label>
              <input
                id="major"
                type="text"
                value={major}
                maxLength={100}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg cursor-not-allowed outline-none"
              />
            </div>

            {applicationProps.questionsDefault?.map((question) => {
              // Find the existing answer for this question
              const existingAnswer = answers.find(
                (ans) => ans.question === question.id
              );

              return (
                <div key={question.id}>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {question.text}
                  </label>
                  <textarea
                    value={existingAnswer?.response || ""} // Show existing answer or empty if none
                    onChange={(e) => updateAnswer(question.id, e.target.value)}
                    className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              );
            })}

            {/* Submit Button */}
            <div className="mt-4">
              <button
                type="submit"
                disabled={isSubmitting || isCheckingPrereqs}
                className={`w-full ${
                  isSubmitting || isCheckingPrereqs
                    ? "bg-gray-300"
                    : "bg-[var(--theme-color)]"
                } text-gray-600 py-2 px-4 rounded-md hover:bg-[var(--theme-color)]`}
                style={{ color: "var(--secondary-color)" }}
              >
                {isCheckingPrereqs
                  ? "Checking prerequisites..."
                  : isSubmitting
                    ? "Submitting..."
                    : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ULINK Connection Modal */}
      <AlertDialog
        open={showUlinkModal}
        onOpenChange={(open) => {
          // Only allow closing modal if not in blockFormAccess mode
          if (!blockFormAccess) {
            handleUlinkModalOpenChange(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Link your ULINK account</AlertDialogTitle>
            <AlertDialogDescription>
              <p>
                This program has prerequisite course requirements. You must connect
                your ULINK account to verify your eligibility before applying.
              </p>
              <p className="mt-2 font-semibold text-red-600">
                You cannot apply to this program until you connect your ULINK account.
              </p>
              <p className="mt-2">
                Your ULINK account provides access to your academic records to verify
                that you've completed the required prerequisites for this program.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {blockFormAccess ? (
              // Single action when form is blocked
              <AlertDialogAction onClick={() => handleUlinkChoice("yes")}>
                Connect ULINK
              </AlertDialogAction>
            ) : (
              // Two options when shown during form submission
              <>
                <AlertDialogCancel onClick={() => handleUlinkChoice("no")}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => handleUlinkChoice("yes")}>
                  Connect ULINK
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Missing Prerequisites Warning Modal */}
      <AlertDialog
        open={showPrereqWarningModal}
        onOpenChange={handlePrereqModalOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Missing Prerequisites</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                You are missing one or more prerequisite courses required for
                this program:
              </p>
              <ul className="list-disc pl-5 mb-4">
                {missingPrereqs.map((course, index) => (
                  <li key={index} className="text-red-600 font-semibold">
                    {course}
                  </li>
                ))}
              </ul>
              <p>
                If you wish to apply despite not meeting all prerequisites, you
                should contact the faculty leads to request an exception.
              </p>
              <p className="font-semibold">
                Faculty leads:{" "}
                {program?.faculty_leads
                  ?.map((lead) => `${lead.display_name} (${lead.username})`)
                  .join(", ")}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handlePrereqWarningChoice("cancel")}
            >
              Cancel submission
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handlePrereqWarningChoice("continue")}
            >
              Continue anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
