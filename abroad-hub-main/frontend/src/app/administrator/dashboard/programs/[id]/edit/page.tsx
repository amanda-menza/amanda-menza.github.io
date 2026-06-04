"use client";
import { useEffect, useState } from "react";
import api from "../../../../../../api.js";
import {
  AdminProgramDetailsTableData,
  Program,
  ProgramFormProps,
  SemesterType,
  UserRoles,
} from "../../../../../../types/models";
import { useParams } from "next/navigation";
import ProgramForm from "@/components/ProgramForm";
import logger from "../../../../../../components/Logger";
import { AppUser, FacultyOption } from "../../../../../../types/models";
import ProtectedRole from "@/components/ProtectedRole";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function EditProgram() {
  const params = useParams<{ id: string }>();
  const { id } = params ?? {};
  const [program, setProgram] = useState<Program>();
  const [facultyUsers, setFacultyUsers] = useState<AppUser[]>([]);
  const [partnerUsers, setPartnerUsers] = useState<AppUser[]>([]);
  const [programDetail, setProgramDetail] = useState<
    AdminProgramDetailsTableData[]
  >([]);

  const [loading, setLoading] = useState(true);

  async function getProgram() {
    try {
      const res = await api.get(`/api/programs/${id}/`);
      setProgram(res.data);
    } catch (error) {
      logger.error("Failed to fetch program data.", error);
    } finally {
      setLoading(false);
    }
  }

  const fetchProgramDetail = async () => {
    try {
      const response = await api.get(`/api/programs/${id}/admin/`);
      setProgramDetail(response.data);
    } catch (error) {
      logger.error("Failed to fetch program detail.", error);
    } finally {
      setLoading(false);
    }
  };

  async function fetchFacultyUsers() {
    try {
      const response = await api.get("api/faculty-user-query/");
      const data: AppUser[] = response.data;
      setFacultyUsers(data);
    } catch (error) {
      logger.error("Error fetching admin users.", error);
    } finally {
      setLoading(false);
    }
  }
  async function fetchPartnerUsers() {
    try {
      const response = await api.get("api/partner-user-query/");
      const data: AppUser[] = response.data;
      setPartnerUsers(data);
    } catch (error) {
      logger.error("Error fetching admin users.", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProgram();
    fetchProgramDetail();
    fetchFacultyUsers();
    fetchPartnerUsers();
  }, [id]);

  const programDefault: ProgramFormProps = {
    titleDefault: program?.title ?? "",
    locationDefault: program?.location ?? "",
    yearDefault:
      program?.year.toString() ?? new Date().getFullYear().toString(),
    semesterDefault: program?.semester ?? SemesterType.Fall,
    facultyLeadsDefault: program?.faculty_leads ?? [],
    descriptionDefault: program?.description ?? "",
    applicationOpenDateDefault: program?.open_date ?? "",
    applicationDeadlineDefault: program?.deadline ?? "",
    startDateDefault: program?.start_date ?? "",
    endDateDefault: program?.end_date ?? "",
    essentialDocDeadlineDefault: program?.essential_doc_deadline ?? "",
    questionsDefault: program?.questions ?? [],
    applicationTrackPaymentDefault: program?.track_payment ?? false,
    applicationPaymentDeadlineDefault: program?.payment_deadline ?? "",
    providerPartnersDefault: program?.provider_partners ?? [],
    prerequisitesDefault: program?.prerequisites ?? [],
    route: `api/programs/${id}/`,
    method: "put",
  };

  if (loading || !program) return <LoadingSpinner message={"Loading..."} />;
  return (
    <ProtectedRole requiredRoles={[UserRoles.Administrator]}>
      <ProgramForm
        programProps={programDefault}
        facultyMembers={facultyUsers}
        num_applicants={programDetail.length}
        partners={partnerUsers}
        editingProgram={true}
      />
    </ProtectedRole>
  );
}
