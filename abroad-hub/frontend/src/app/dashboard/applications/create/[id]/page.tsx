"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { AppUser } from "../../../../../types/models";
import {
  ApplicationFormProps,
  ApplicationStatus,
  Program,
} from "../../../../../types/models";
import ApplicationForm from "@/components/ApplicationForm";
import api from "../../../../../api.js";
import { getStoredUserData } from "@/lib/utils";
import logger from "../../../../../components/Logger";

export default function CreateApplication() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const [storedUser, setStoredUser] = useState<AppUser>();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const fetchApplication = async () => {
    const user = getStoredUserData();
    setStoredUser(user);
  };

  useEffect(() => {
    fetchApplication().catch(logger.error);
    fetchProgram();
  }, [id]);

  const applicationDefault: ApplicationFormProps = {
    statusDefault: ApplicationStatus.Applied,
    questionsDefault: program?.questions ?? [],
    answersDefault: [],
    route: `api/applications/create/${id}/`,
    method: "post",
    user: storedUser,
    program: program,
    checkPrerequisites: true, // Will check prerequisites only during form submission, not on initial load
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading application form...</p>
        </div>
      </div>
    );
  }

  return <ApplicationForm applicationProps={applicationDefault} />;
}
