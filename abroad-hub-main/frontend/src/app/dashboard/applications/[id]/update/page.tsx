"use client";
import { useEffect, useState } from "react";
import api from "../../../../../api.js";
import {
  Application,
  ApplicationFormProps,
  AppUser,
} from "../../../../../types/models";
import { useParams } from "next/navigation";
import ApplicationForm from "../../../../../components/ApplicationForm";
import { getStoredUserData } from "../../../../../lib/utils";
import logger from "../../../../../components/Logger";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function UpdateApplication() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [application, setApplication] = useState<Application>();
  const [storedUser, setStoredUser] = useState<AppUser>();

  const [loading, setLoading] = useState(true);

  async function getApplication() {
    try {
      const res = await api.get(`/api/applications/${id}/`);
      return res.data;
    } catch (error) {
      throw new Error("Failed to fetch data: " + error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchApplication = async () => {
      const data: Application = await getApplication();
      setApplication(data);
      const user = getStoredUserData();
      setStoredUser(user);
    };
    fetchApplication().catch(logger.error);
  }, [id]);
  const applicationDefault: ApplicationFormProps = {
    statusDefault: application?.status ?? "",
    questionsDefault: application?.program.questions ?? [],
    answersDefault: application?.answers ?? [],
    route: `api/applications/${id}/`,
    method: "patch",
    user: storedUser,
    program: application?.program ?? null,
    checkPrerequisites: true,
  };

  if (loading) return <LoadingSpinner message={"Loading"} />;
  return <ApplicationForm applicationProps={applicationDefault} />;
}
