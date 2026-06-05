"use client";
import api from "../api.js";
import {
  ProgramFormProps,
  AppUser,
  FacultyOption,
  Question,
  PartnerOption,
  Course,
} from "../types/models";
import Select, { GroupBase } from "react-select";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import logger from "../components/Logger";
import { Tiptap } from "./Tiptap";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { AlertDialogButton, AlertDialogProps } from "./AlertDialogButton";
import { findAllByDisplayValue } from "@testing-library/dom";

interface ProgramFormData {
  title: string;
  location: string;
  faculty_leads: FacultyOption[];
  year: string;
  semester: string;
  description: string;
  open_date: string;
  deadline: string;
  start_date: string;
  end_date: string;
  essential_doc_deadline: string;
  questions: Question[];
  payment_deadline: string;
  track_payment: boolean;
  provider_partners: PartnerOption[];
  prerequisites: string[];
}

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(80, "Title cannot exceed 80 characters."),
  location: z
    .string()
    .trim()
    .min(1, "Location is required.")
    .max(100, "Location cannot exceed 100 characters."),
  year: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().int().nonnegative()),
  semester: z
    .enum(["Fall", "Spring", "Summer"])
    .refine((val) => ["Fall", "Spring", "Summer"].includes(val), {
      message: "Semester is required.",
    }),
  faculty_leads: z
    .array(
      z.object({
        value: z.number(),
        label: z.string().trim(),
      })
    )
    .min(1, "At least one faculty lead is required."),
  description: z.string().trim().min(1, "Description is required."),
  open_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Open date is required."),
  deadline: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Deadline is required."),
  start_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Start date is required."),
  end_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "End date is required."),
  essential_doc_deadline: z
    .string()
    .refine(
      (date) => !isNaN(Date.parse(date)),
      "Document deadline date is required."
    ),
  questions: z
    .array(
      z.object({
        id: z.number().int().nonnegative(),
        text: z.string().trim().min(1, "Question cannot be empty."),
      })
    )
    .optional(),
  provider_partners: z
    .array(
      z.object({
        value: z.number(),
        label: z.string().trim(),
      })
    )
    .nullable()
    .optional(),
  track_payment: z.boolean(),
  payment_deadline: z.string().nullable().optional(),
  prerequisites: z.array(z.string()).optional(),
});

type FieldArrayName = "faculty_leads" | "questions" | "provider_partners" | "prerequisites";

type FormFieldValues = {
  prerequisites: string[];
  faculty_leads: FacultyOption[];
  questions: Question[];
  provider_partners: PartnerOption[];
};

// Create a custom hook for prerequisites to avoid TypeScript errors
function usePrerequisitesArray(control: any) {
  // We're using any type here to work around TypeScript limitations with useFieldArray
  // This is a compromise to make the code work while maintaining the user experience
  return useFieldArray({
    control,
    name: "prerequisites" as any,
  });
}

// Validate a prerequisite course
const validatePrerequisiteCourse = (course: string): boolean => {
  // Check if it follows the pattern: DEPT 123 (department code followed by a number)
  const regex = /^([A-Z0-9]{1,8})\s+(\d{3})$/;
  return regex.test(course);
};

export default function ProgramForm({
  programProps,
  facultyMembers,
  num_applicants,
  editingProgram,
  partners,
}: {
  programProps: ProgramFormProps;
  facultyMembers: AppUser[];
  num_applicants: number;
  editingProgram: boolean;
  partners: AppUser[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [trackPayment, setTrackPayment] = useState(
    programProps.applicationTrackPaymentDefault ?? false
  );
  const [trackPaymentDefault, setTrackPaymentDefault] = useState(
    programProps.applicationTrackPaymentDefault ?? false
  );

  const [questions, setQuestions] = useState<Question[]>(
    programProps.method === "post"
      ? [
        {
          id: null,
          text: "Why do you want to participate in this study abroad program?",
        },
        {
          id: null,
          text: "How does this program align with your academic or career goals?",
        },
        {
          id: null,
          text: "What challenges do you anticipate during this experience, and how will you address them?",          },
        {
          id: null,
          text: "Describe a time you adapted to a new or unfamiliar environment.",
        },
        {
          id: null,
          text: "What unique perspective or contribution will you bring to the group?",
        },
      ]
      : programProps.questionsDefault ?? []
  );

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ProgramFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: programProps.titleDefault ?? "",
      location: programProps.locationDefault ?? "",
      year: programProps.yearDefault ?? "",
      semester: programProps.semesterDefault ?? "",
      faculty_leads:
        programProps.facultyLeadsDefault?.map((faculty) => ({
          value: faculty.id,
          label: `${faculty.display_name} (${faculty.username})`,
        })) ?? [],
      description: programProps.descriptionDefault ?? "",
      open_date: programProps.applicationOpenDateDefault ?? "",
      deadline: programProps.applicationDeadlineDefault ?? "",
      start_date: programProps.startDateDefault ?? "",
      end_date: programProps.endDateDefault ?? "",
      essential_doc_deadline: programProps.essentialDocDeadlineDefault ?? "",
      track_payment: programProps.applicationTrackPaymentDefault ?? false,
      payment_deadline: programProps.applicationPaymentDeadlineDefault ?? null,
      provider_partners:
        programProps.providerPartnersDefault?.map((partner) => ({
          value: partner.id,
          label: `${partner.display_name} (${partner.username})`,
        })) ?? [],
      questions:
        programProps.questionsDefault?.map((question) => ({
          id: question.id,
          text: question.text,
        })) ?? [],
      prerequisites:
        programProps.prerequisitesDefault?.map(
          (course) => `${course.department} ${course.number}`
        ) ?? [],
    },
  });
  const {
    fields: prerequisiteFields, 
    append: appendPrerequisite, 
    remove: removePrerequisite 
  } = usePrerequisitesArray(control);

  const handleFormSubmit = async (data: ProgramFormData) => {
    setLoading(true);

    // Validate prerequisites
    if (data.prerequisites && data.prerequisites.length > 0) {
      const invalidPrereqs = data.prerequisites
        .filter(course => course.trim() !== "")
        .filter(course => !validatePrerequisiteCourse(course));

      if (invalidPrereqs.length > 0) {
        setLoading(false);
        invalidPrereqs.forEach(course => {
          const index = data.prerequisites.indexOf(course);
          setError(`prerequisites.${index}`, {
            type: "manual",
            message: "Course must be in format 'DEPT 123' (e.g., 'SPAN 101')"
          });
        });
        return;
      }
    }

    const cleanedData = {
      ...data,
      title: data.title.trim(),
      location: data.location.trim(),
      faculty_leads: data.faculty_leads.map((user) => user.value),
      description: data.description.trim(),
      open_date: data.open_date.trim(),
      deadline: data.deadline.trim(),
      start_date: data.start_date.trim(),
      end_date: data.end_date.trim(),
      essential_doc_deadline: data.essential_doc_deadline.trim(),
      questions: questions
        .map((question) => {
          if (!question.id) {
            return { text: question.text.trim() };
          }
          return { id: question.id, text: question.text.trim() };
        })
        .filter((question) => question.text !== ""),
      payment_deadline: data.payment_deadline.trim() || null,
      track_payment: data.track_payment,
      provider_partners: data.provider_partners.map((user) => user.value),
      prerequisites:
        data.prerequisites?.map((courseStr) => {
          const [department, numberStr] = courseStr.split(" ");
          return {
            department: department.toUpperCase(),
            number: parseInt(numberStr, 10),
          };
        }) || [],
    };
    logger.debug("data to submit: " + JSON.stringify(cleanedData));
    if (cleanedData.track_payment && !cleanedData.payment_deadline) {
      setError("payment_deadline", {
        message: "Deadline must be set if tracking payments.",
      });
      setLoading(false);
      return;
    }

    const openDate = new Date(cleanedData.open_date);
    const deadline = new Date(cleanedData.deadline);
    const startDate = new Date(cleanedData.start_date);
    const endDate = new Date(cleanedData.end_date);

    if (deadline < openDate) {
      setError("deadline", {
        message: "Deadline must be after or equal to the open date.",
      });
      setLoading(false);
      return;
    }

    if (startDate < deadline) {
      setError("start_date", {
        message: "Start date must be after or equal to the deadline.",
      });
      setLoading(false);
      return;
    }

    if (endDate < startDate) {
      setError("end_date", {
        message: "End date must be after or equal to the start date.",
      });
      setLoading(false);
      return;
    }

    try {
      let response;
      if (programProps.method === "post") {
        response = await api.post(programProps.route, cleanedData);
      } else {
        response = await api.patch(programProps.route, cleanedData);
      }
      logger.info("Program submitted:", response.data);
      router.replace(`/administrator/dashboard/programs/${response.data.id}/`);
    } catch (error: unknown) {
      logger.error("Error submitting application:", error);
    }
  };

  const facultyMemberOptions: FacultyOption[] = facultyMembers
    .sort((a, b) => a.display_name.localeCompare(b.display_name))
    .map((faculty) => ({
      value: faculty.id,
      label: `${faculty.display_name} (${faculty.username})`,
    }));
  if (loading) {
    return <div>Loading...</div>;
  }

  const partnerOptions: PartnerOption[] = partners
    .sort((a, b) => a.display_name.localeCompare(b.display_name))
    .map((partner) => ({
      value: partner.id,
      label: `${partner.display_name} (${partner.username})`,
    }));
  if (loading) {
    return <div>Loading...</div>;
  }

  const alertEditModeProps: AlertDialogProps = {
    triggerElement: (
      <div className="m-4">
        <button
          type="button"
          className="w-full py-3 bg-[var(--theme-color)] text-gray-600 font-semibold rounded-lg hover:bg-[var(--theme-color)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)]"
          style={{ color: "var(--secondary-color)" }}
        >
          Edit Questionnaire
        </button>
      </div>
    ),
    warningDescription: `This may affect ${num_applicants} applicant${
      num_applicants !== 1 ? "s" : ""
    }. Do you want to proceed?`,
    clickAction: async (e) => {
      if (e) e.preventDefault();
      setEditMode(true);
    },
  };

  const addQuestion = () => {
    setQuestions([...questions, { id: null, text: "" }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = value;
    setQuestions(updatedQuestions);
  };
  const clearPaymentSettings = () => {
    setValue("payment_deadline", "");
    setValue("provider_partners", []);
  };

  const removePaymentTracking = async () => {
    try {
      const apiResponse = await api.patch(
        `${programProps.route}remove-payment-tracking/`
      );
    } catch (error) {
      logger.error("Failed to remove payment tracking:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        Program Form
      </h1>
      <form
        role="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-gray-700 font-semibold mb-2"
          >
            Title:
          </label>
          <input
            type="text"
            id="title"
            {...register("title")}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? "border-red-500" : ""
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-2">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-gray-700 font-semibold mb-2"
          >
            Location:
          </label>
          <input
            type="text"
            id="location"
            {...register("location")}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.location ? "border-red-500" : ""
            }`}
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-2">
              {errors.location.message}
            </p>
          )}
        </div>

        <div>
          <span className="block text-gray-700 font-semibold mb-2">
            Faculty Leads:
          </span>
          <Controller
            name="faculty_leads"
            control={control}
            render={({ field }) => (
              <Select<FacultyOption, true>
                {...field}
                isMulti
                options={facultyMemberOptions}
                className={`${errors.faculty_leads ? "border-red-500" : ""}`}
                classNamePrefix="select"
                placeholder="Select faculty leads..."
                aria-label="Faculty Leads"
              />
            )}
          />
          {errors.faculty_leads && (
            <p className="text-red-500 text-sm mt-2">
              {errors.faculty_leads.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="year"
            className="block text-gray-700 font-semibold mb-2"
          >
            Year:
          </label>
          <select
            id="year"
            {...register("year")}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.year ? "border-red-500" : ""
            }`}
          >
            <option value="">Select Year</option>
            {Array.from({ length: 11 }, (_, i) => {
              const year = new Date().getFullYear() - 5 + i;
              return (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              );
            })}
          </select>
          {errors.year && (
            <p className="text-red-500 text-sm mt-2">{errors.year.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="semester"
            className="block text-gray-700 font-semibold mb-2"
          >
            Semester:
          </label>
          <select
            id="semester"
            {...register("semester")}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.semester ? "border-red-500" : ""
            }`}
          >
            <option value="">Select Semester</option>
            <option value="Fall">Fall</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
          </select>
          {errors.semester && (
            <p className="text-red-500 text-sm mt-2">
              {errors.semester.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-gray-700 font-semibold mb-2"
          >
            Description:
          </label>
          <Controller
            name="description"
            control={control}
            defaultValue={programProps.descriptionDefault ?? ""}
            render={({ field }) => (
              <Tiptap
                editorContent={field.value}
                onChange={field.onChange}
                isEditing={true}
              />
            )}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-2">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Program Questions
          </h2>
          {questions.map((question, index) => (
            <div key={index} className="flex items-center gap-3 mt-3">
              <input
                type="text"
                value={question.text}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    updateQuestion(index, e.target.value);
                  }
                }}
                maxLength={500}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder={`Question ${index + 1}`}
                disabled={!editMode}
              />
              {editMode &&
              (programProps.method === "post" || num_applicants == 0 ? (
                <div className="m-4">
                  <button
                    type="button"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    onClick={() => removeQuestion(index)}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <AlertDialogButton
                  alertDialogProps={{
                    triggerElement: (
                      <div className="m-4">
                        <button
                          type="button"
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                          Remove
                        </button>
                      </div>
                    ),
                    warningDescription: `This will delete applicants' associated answers and may affect ${num_applicants} applicant${
                      num_applicants !== 1 ? "s" : ""
                    }. Do you want to proceed?`,
                    clickAction: async () => removeQuestion(index),
                  }}
                />
              ))}

            </div>
          ))}
          {editMode && (
            <div className="m-4">
              <Button
                variant="default"
                onClick={(e) => {
                  e.preventDefault();
                  addQuestion();
                }}
                className="py-3 bg-[var(--theme-color)] text-gray-600 font-semibold rounded-lg hover:bg-[var(--theme-color)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)]"
                style={{ color: "var(--secondary-color)" }}
              >
                Add Question
              </Button>
            </div>
          )}
          {!editMode &&
            (programProps.method === "post" || num_applicants == 0 ? (
              <div className="m-4">
                <button
                  type="button"
                  className="w-full py-3 bg-[var(--theme-color)] text-gray-600 font-semibold rounded-lg hover:bg-[var(--theme-color)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)]"
                  style={{ color: "var(--secondary-color)" }}
                  onClick={async (e) => {
                    if (e) e.preventDefault();
                    setEditMode(true);
                  }}
                >
                  Edit Questionnaire
                </button>
              </div>
            ) : (
              <AlertDialogButton alertDialogProps={alertEditModeProps} />
            ))}
        </div>

        <div>
          <label
            htmlFor="open_date"
            className="block text-gray-700 font-semibold mb-2"
          >
            Application Open Date:
          </label>
          <input
            type="date"
            id="open_date"
            {...register("open_date")}
            max="2040-12-31"
            className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.open_date ? "border-red-500" : ""
            }`}
          />
          {errors.open_date && (
            <p className="text-red-500 text-sm mt-2">
              {errors.open_date.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="deadline"
            className="block text-gray-700 font-semibold mb-2"
          >
            Application Deadline:
          </label>
          <input
            type="date"
            id="deadline"
            {...register("deadline")}
            max="2040-12-31"
            className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.deadline ? "border-red-500" : ""
            }`}
          />
          {errors.deadline && (
            <p className="text-red-500 text-sm mt-2">
              {errors.deadline.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="essential_doc_deadline"
            className="block text-gray-700 font-semibold mb-2"
          >
            Essential Document Deadline:
          </label>
          <input
            type="date"
            id="essential_doc_deadline"
            {...register("essential_doc_deadline")}
            max="2040-12-31"
            className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.essential_doc_deadline ? "border-red-500" : ""
            }`}
          />
          {errors.essential_doc_deadline && (
            <p className="text-red-500 text-sm mt-2">
              {errors.essential_doc_deadline.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="start_date"
            className="block text-gray-700 font-semibold mb-2"
          >
            Start Date:
          </label>
          <input
            type="date"
            id="start_date"
            {...register("start_date")}
            max="2040-12-31"
            className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.start_date ? "border-red-500" : ""
            }`}
          />
          {errors.start_date && (
            <p className="text-red-500 text-sm mt-2">
              {errors.start_date.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="end_date"
            className="block text-gray-700 font-semibold mb-2"
          >
            End Date:
          </label>
          <input
            type="date"
            id="end_date"
            {...register("end_date")}
            max="2040-12-31"
            className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.end_date ? "border-red-500" : ""
            }`}
          />
          {errors.end_date && (
            <p className="text-red-500 text-sm mt-2">
              {errors.end_date.message}
            </p>
          )}
        </div>
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="flex items-center space-x-2">
            {editingProgram && trackPayment && trackPaymentDefault ? (
              <AlertDialogButton
                alertDialogProps={{
                  triggerElement: (
                    <input
                      type="checkbox"
                      checked={trackPayment}
                      onChange={(e) => e.preventDefault()}
                      className="w-5 h-5 cursor-pointer"
                    />
                  ),
                  warningDescription:
                    "Changing this setting will delete recorded payment information and remove provider partners. Are you sure?",
                  clickAction: (e) => {
                    setTrackPayment(!trackPayment);
                    setValue("track_payment", !trackPayment);
                    clearPaymentSettings();
                    setTrackPaymentDefault(false);
                    removePaymentTracking();
                  },
                }}
              />
            ) : (
              <input
                type="checkbox"
                checked={trackPayment}
                onChange={(e) => {
                  setTrackPayment(e.target.checked);
                  setValue("track_payment", e.target.checked);
                  if (!e.target.checked) {
                    clearPaymentSettings();
                  }
                }}
                className="w-5 h-5"
              />
            )}
            <span className="text-gray-700 font-semibold">Track Payment</span>
          </label>

          <div>
            <label
              htmlFor="payment_deadline"
              className="block text-gray-700 font-semibold mb-2"
            >
              Payment Deadline:
            </label>
            <input
              type="date"
              id="payment_deadline"
              disabled={!trackPayment}
              {...register("payment_deadline")}
              max="2040-12-31"
              className={`w-full p-3 border ${
                !trackPayment
                  ? "bg-gray-200 cursor-not-allowed"
                  : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.payment_deadline ? "border-red-500" : ""
              }`}
            />
            {errors.payment_deadline && (
              <p className="text-red-500 text-sm mt-2">
                {errors.payment_deadline.message}
              </p>
            )}
          </div>
          <div>
            <span className="block text-gray-700 font-semibold mb-2">
              Provider Partners:
            </span>
            <Controller
              name="provider_partners"
              control={control}
              render={({ field }) => (
                <Select<PartnerOption, true>
                  {...field}
                  isMulti
                  isDisabled={!trackPayment}
                  options={partnerOptions}
                  className={`${
                    errors.provider_partners
                      ? "border-red-500"
                      : !trackPayment
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                  }`}
                  classNamePrefix="select"
                  placeholder="Select provider partners..."
                  aria-label="Provider Partners"
                />
              )}
            />
            {errors.provider_partners && (
              <p className="text-red-500 text-sm mt-2">
                {errors.provider_partners.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Prerequisites</h3>
          <p className="text-sm text-gray-500">
            Enter course prerequisites in the format "DEPT 123" (e.g., "SPAN
            101"). Students will need to have completed these courses with at
            least a D- grade or be currently enrolled.
          </p>

          <div className="space-y-2">
            {prerequisiteFields && prerequisiteFields.length > 0 ? prerequisiteFields.map((field, index) => (
              <div key={index} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    {...register(`prerequisites.${index}`)}
                    placeholder="e.g. SPAN 101"
                    className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.prerequisites?.[index] ? "border-red-500" : "border-gray-300"
                    }`}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      
                      if (!value) return;
                      
                      // Try to extract department and number using regex
                      const courseMatch = value.match(/([a-z0-9]{1,8})[^a-z0-9]*(\d{1,3})/i);
                      
                      if (courseMatch) {
                        const [_, dept, num] = courseMatch;
                        const formatted = `${dept.toUpperCase()} ${num}`;
                        setValue(`prerequisites.${index}`, formatted);
                        
                        // Check if the formatted value matches our required pattern
                        if (!validatePrerequisiteCourse(formatted)) {
                          setError(`prerequisites.${index}`, {
                            type: "manual",
                            message: "Course must be in format 'DEPT 123' (e.g., 'SPAN 101')"
                          });
                        } else {
                          // Clear error if it was previously set
                          if (errors.prerequisites?.[index]) {
                            clearErrors(`prerequisites.${index}`);
                          }
                        }
                      } else {
                        // Set an error if the input doesn't match the expected pattern
                        setError(`prerequisites.${index}`, {
                          type: "manual",
                          message: "Course must be in format 'DEPT 123' (e.g., 'SPAN 101')"
                        });
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removePrerequisite(index)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
                {errors.prerequisites?.[index] && (
                  <p className="text-red-500 text-sm ml-1">
                    {errors.prerequisites[index]?.message as string}
                  </p>
                )}
              </div>
            )) : null}
            
            <button
              type="button"
              onClick={() => appendPrerequisite("" as any)}
              className="w-full p-2 bg-blue-100 text-blue-600 font-semibold rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Prerequisite Course
            </button>
          </div>

          {errors.prerequisites && (
            <p className="text-red-500 text-sm mt-1">
              {errors.prerequisites.message}
            </p>
          )}
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="w-full py-3 bg-[var(--theme-color)] text-gray-600 font-semibold rounded-lg hover:bg-[var(--theme-color)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)]"
            style={{ color: "var(--secondary-color)" }}
          >
            Submit Program
          </button>
        </div>
      </form>
    </div>
  );
}
