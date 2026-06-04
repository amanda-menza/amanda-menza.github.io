"use client";
import {
  ProgramFormProps,
  SemesterType,
  FacultyOption,
  UserRoles,
} from "../../../../../types/models";
import ProgramForm from "@/components/ProgramForm";
import api from "../../../../../api";
import { useEffect, useState } from "react";
import logger from "../../../../../components/Logger";
import { AppUser } from "../../../../../types/models";
import ProtectedRole from "@/components/ProtectedRole";

async function fetchFacultyUsers() {
  try {
    const response = await api.get("api/faculty-user-query/");
    const data: AppUser[] = response.data;

    logger.debug("Response data:", response.data);
    return data;
  } catch (error) {
    logger.error("Error fetching faculty users:", error);
    return [];
  }
}

async function fetchPartnerUsers() {
  try {
    const response = await api.get("api/partner-user-query/");
    const data: AppUser[] = response.data;

    logger.debug("Response data:", response.data);
    return data;
  } catch (error) {
    logger.error("Error fetching faculty users:", error);
    return [];
  }
}

export default function CreateProgram() {
  const [facultyUsers, setFacultyUsers] = useState<AppUser[]>([]);
  const [partnerUsers, setPartnerUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    const loadAdminUsers = async () => {
      const faculty = await fetchFacultyUsers();
      logger.debug("Faculty users: " + JSON.stringify(faculty));
      setFacultyUsers(faculty);
      const partners = await fetchPartnerUsers();
      logger.debug("Partner users: " + JSON.stringify(partners));
      setPartnerUsers(partners);
    };

    loadAdminUsers();
  }, []); // Only run once on component mount

  const programDefault: ProgramFormProps = {
    titleDefault: "",
    yearDefault: new Date().getFullYear().toString(),
    locationDefault: "",
    semesterDefault: SemesterType.Fall,
    facultyLeadsDefault: [], // Updated to use the fetched admin users
    descriptionDefault: "",
    applicationOpenDateDefault: "",
    applicationDeadlineDefault: "",
    startDateDefault: "",
    endDateDefault: "",
    essentialDocDeadlineDefault: "",
    questionsDefault: [],
    applicationTrackPaymentDefault: false,
    applicationPaymentDeadlineDefault: "",
    providerPartnersDefault: [],
    prerequisitesDefault: [], // Added for course prerequisites
    route: "api/programs/create/",
    method: "post",
  };

  return (
    <ProtectedRole requiredRoles={[UserRoles.Administrator]}>
      <ProgramForm
        programProps={programDefault}
        facultyMembers={facultyUsers}
        num_applicants={0}
        editingProgram={false}
        partners={partnerUsers}
      />
    </ProtectedRole>
  );
}
