export enum UserRoles {
  Student = "Student",
  Administrator = "Administrator",
  Reviewer = "Reviewer",
  Faculty = "Faculty",
  Partner = "Partner",
}

export interface AppUser {
  id: number;
  display_name: string;
  username: string;
  email: string;
  dob: string;
  roles: UserRoles[]; // Choices for user type
  is_sso: boolean;
  use_mfa: boolean;
  profile?: UserProfile;
  ulink_username: string;
}

export interface UserProfile {
  id: number; // Primary key
  major?: string | null; // Major (optional)
  gpa?: number | null; // GPA (optional, between 0.0 and 4.0)
}

export enum SemesterType {
  Fall = "Fall",
  Spring = "Spring",
  Summer = "Summer",
}

export interface Program {
  id: number; // Primary key
  title: string; // Program title
  year: number; // Year (current year or up to 4 years ahead)
  semester: SemesterType; // Choices for semester
  location: string; // Location of the program
  faculty_leads: FacultyLead[]; // Faculty leads
  description: string; // Description of the program
  start_date: string; // Start date (ISO 8601 format)
  end_date: string; // End date (ISO 8601 format)
  open_date: string; // Open date for applications (ISO 8601 format)
  deadline: string; // Deadline for applications (ISO 8601 format)
  essential_doc_deadline: string;
  questions: { id: number; text: string }[];
  track_payment: boolean;
  payment_deadline?: string;
  provider_partners?: ProviderPartner[];
  prerequisites?: Course[];
}

export enum ApplicationStatus {
  Applied = "Applied",
  Eligible = "Eligible",
  Approved = "Approved",
  Enrolled = "Enrolled",
  Completed = "Completed",
  Canceled = "Canceled",
  Withdrawn = "Withdrawn",
  Not_Applied = "Not Applied",
}
export interface Application {
  id: number; // Primary key
  student: AppUser; // Reference to AppUser (student)
  program: Program; // Reference to Program
  status: ApplicationStatus; // Choices for application status
  submission_date: string; // Submission date (ISO 8601 format)
  answers: { question: number; response: string }[];
  payment_status: PaymentStatus;
}

export interface User {
  id: number; // Primary key
  username: string; // Username
  email: string; // Email address
}

export interface ApplicationFormProps {
  statusDefault: string;
  questionsDefault: { id: number; text: string }[]; // Update to include id and text
  answersDefault: { question: number; response: string }[];
  route: string;
  method: string;
  user: AppUser | undefined;
  program: Program | null;
  checkPrerequisites: boolean;
}

export interface ProgramFormProps {
  titleDefault: string;
  yearDefault: string;
  locationDefault: string;
  semesterDefault: SemesterType;
  facultyLeadsDefault: FacultyLead[];
  descriptionDefault: string;
  applicationOpenDateDefault: string;
  applicationDeadlineDefault: string;
  startDateDefault: string;
  endDateDefault: string;
  essentialDocDeadlineDefault: string;
  questionsDefault: { id: number; text: string }[];
  applicationTrackPaymentDefault: boolean;
  applicationPaymentDeadlineDefault: string;
  providerPartnersDefault: ProviderPartner[];
  prerequisitesDefault?: Course[];
  route: string;
  method: string;
}

export type FacultyOption = {
  value: number;
  label: string;
};
export type PartnerOption = {
  value: number;
  label: string;
};

export interface AdminTableData {
  applied_count: number;
  enrolled_count: number;
  withdrawn_count: number;
  canceled_count: number;
  active_count: number;
  completed_count: number;
  eligible_count: number;
  approved_count: number;
  id: number;
  title: string;
  year: number;
  semester: SemesterType;
  location: string;
  faculty_leads: FacultyLead[];
  start_date: string;
  end_date: string;
  open_date: string;
  deadline: string;
  essential_doc_deadline: string;
  payment_deadline: string;
  track_payment: boolean;
}

export interface StudentTableData {
  id: number;
  application_id: number;
  title: string;
  year: number;
  semester: SemesterType;
  location: string;
  faculty_leads: FacultyLead[];
  start_date: string;
  description: string;
  end_date: string;
  open_date: string;
  deadline: string;
  essential_doc_deadline: string;
  status: ApplicationStatus;
  assumption_of_risk_form: string;
  acknowledgement_of_code_of_conduct: string;
  housing_questionnaire: string;
  medical_health_history_and_immunization_records: string;
  payment_deadline?: string;
  payment_status?: PaymentStatus;
  track_payment: boolean;
}

export interface AdminProgramDetailsTableData {
  application_id: number;
  display_name: string;
  username: string;
  email: string;
  dob: string;
  major: string;
  gpa: number;
  status: ApplicationStatus;
  assumption_of_risk_form: string;
  acknowledgement_of_code_of_conduct: string;
  housing_questionnaire: string;
  medical_health_history_and_immunization_records: string;
  confidential_notes: ConfidentialNote[];
  recommendation_letters?: RecommendationLetter[];
  payment_status: PaymentStatus;
}

export interface StudentProgramBrowseType {
  id: number; // Program ID (Primary Key)
  title: string; // Program title
  year: number; // Program year
  semester: SemesterType; // Semester options
  location: string; // Location of the program
  faculty_leads: FacultyLead[]; // Faculty leads (could be comma-separated or plain text)
  description: string; // Description of the program
  start_date: string; // Start date in ISO 8601 format
  end_date: string; // End date in ISO 8601 format
  open_date: string; // Open date for applications in ISO 8601 format
  deadline: string; // Deadline for applications in ISO 8601 format
  essential_doc_deadline: string;
  has_applied: boolean; // Whether the user has applied to this program
  application_status: ApplicationStatus; // Application status for the user
  application_id: number;
  questions: { id: number; text: string }[]; // Add this field
  track_payment: boolean;
  payment_deadline?: string;
  prerequisites?: Course[];
}

export interface FacultyLead {
  id: number;
  display_name: string;
  username: string;
}

export interface UserTableData {
  id: number;
  display_name: string;
  username: string;
  email: string;
  dob: string;
  roles: UserRoles[];
  profile: UserProfile | null;
  is_sso: boolean;
  involved_programs: string[];
}

export interface ConfidentialNote {
  id: number;
  author: FacultyLead | null;
  content: string;
  timestamp: string;
}

export enum RecommendationLetterStatus {
  Pending = "Pending",
  Fulfilled = "Fulfilled",
}

export interface RecommendationLetter {
  id: number;
  application_id: number;
  writer_name: string;
  writer_email: string;
  status: RecommendationLetterStatus;
  requested_date: string;
  submitted_date?: string;
  fulfilled_date?: string;
  letter_file?: string;
  token?: string;
}

export interface Question {
  id: number | null;
  text: string;
}

export interface ProviderPartner {
  id: number;
  display_name: string;
  username: string;
}

export interface Course {
  id: number;
  department: string;
  number: number;
}

export enum PaymentStatus {
  Null = "Null",
  Unpaid = "Unpaid",
  Partially = "Partially Paid",
  Fully = "Fully Paid",
}

export interface PartnerTableData {
  id: number;
  title: string;
  year: number;
  semester: SemesterType;
  location: string;
  faculty_leads: FacultyLead[];
  start_date: string;
  end_date: string;
  open_date: string;
  deadline: string;
  essential_doc_deadline: string;
  payment_deadline: string;
  approved_enrolled_count: number;
  fully_paid_count: number;
}

export interface PartnerProgramDetailsTableData {
  application_id: number;
  display_name: string;
  username: string;
  email: string;
  status: ApplicationStatus;
  payment_status: PaymentStatus;
}
