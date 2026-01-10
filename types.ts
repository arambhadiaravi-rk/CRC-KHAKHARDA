
export type TabType = 'schools' | 'school-mgmt' | 'enrollment' | 'student-stats' | 'cwsn' | 'fln' | 'reports' | 'circulars' | 'competitions' | 'suggestions' | 'achievements';
export type UserRole = 'crc_admin' | 'crc_viewer' | 'brc_admin' | 'dpc_admin' | 'principal' | null;

export interface Teacher {
  id: string;
  name: string;
  gender: 'પુરુષ' | 'સ્ત્રી' | '';
  designation: string;
  dob: string;
  mobile: string;
  aadhaar: string;
  joiningServiceDate: string;
  joiningSchoolDate: string;
  section: 'પ્રાથમિક' | 'ઉચ્ચ પ્રાથમિક' | '';
  subject?: 'ભાષા' | 'ગણિત-વિજ્ઞાન' | 'સામાજિક વિજ્ઞાન' | '';
}

export interface Achievement {
  id: string;
  schoolId: string;
  schoolName: string;
  category: 'સ્પર્ધા' | 'પરીક્ષા' | 'અન્ય';
  achievementName: string;
  achieverName: string;
  achieverType: 'શિક્ષક' | 'વિદ્યાર્થી';
  designation?: string;
  standard?: string;
  result: string;
  date: string;
  timestamp: number;
  photo?: string;
}

export interface ClassEnrollment {
  boys: number;
  girls: number;
}

export interface PhysicalFacilities {
  roomsCount: number | '';
  boysUrinals: number | '';
  girlsUrinals: number | '';
  boysToilets: number | '';
  girlsToilets: number | '';
  hasCWSNToilet: 'હા' | 'ના' | '';
  hasComputerLab: 'હા' | 'ના' | '';
  computerCount: number | '';
  hasInternet?: 'હા' | 'ના' | '';
  hasLBDLab: 'હા' | 'ના' | '';
  hasOtherLab: 'હા' | 'ના' | '';
  otherLabDetails: string;
  hasDrinkingWater: 'હા' | 'ના' | '';
  drinkingWaterSource: string; 
  hasRO: 'હા' | 'ના' | '';
  hasVendingMachine: 'હા' | 'ના' | '';
  hasIncinerator: 'હા' | 'ના' | '';
}

export interface CWSNStudent {
  name: string;
  standard: string;
}

export interface CWSNData {
  studentCount: number | '';
  certificateCount: number | '';
  hasCertificate: 'હા' | 'ના' | '';
  receivedAssistance: 'હા' | 'ના' | '';
  assistanceDetails: string;
  students: CWSNStudent[];
}

export interface FLNRecord {
  standard: string;
  totalStudents: number | '';
  weakStudents: number | '';
}

export interface MonthlyFLN {
  month: string;
  records: FLNRecord[];
}

export interface StudentStats {
  totalRegistered: number | '';
  mbuCount: number | '';
  aadhaarCount: number | '';
  apaarCount: number | '';
  scholarshipCount?: number | '';
}

export interface SMCMeeting {
  id: string;
  date: string;
  membersCount: number | '';
}

export interface LibraryMonthlyRecord {
  month: string;
  teacherBooks: number | '';
  studentBooks: number | '';
}

export interface LibraryData {
  totalBooks: number | '';
  monthlyRecords: LibraryMonthlyRecord[];
}

export interface School {
  id: string;
  name: string;
  diseCode: string;
  principal: string;
  contact: string;
  password?: string;
  standards?: '1-5' | '1-8' | '9-10' | '';
  schoolType?: 'SOE' | 'NON SOE' | 'PM SHREE GOG' | 'PM SHREE GOI' | '';
  address?: string;
  teachers?: Teacher[];
  enrollment?: { [key: string]: ClassEnrollment };
  gallery?: string[]; 
  facilities?: PhysicalFacilities;
  cwsnData?: CWSNData;
  flnData?: MonthlyFLN[];
  studentStats?: { [std: string]: StudentStats };
  smcMeetings?: SMCMeeting[];
  libraryData?: LibraryData;
}

export interface DataRecord {
  id: string;
  schoolId: string;
  schoolName: string;
  date: string;
  attendance: string;
  notes: string;
  timestamp: number;
}

export interface Circular {
  id: string;
  title: string;
  description: string;
  date: string;
  pdfData: string; 
  fileName: string;
  uploadedBy?: string;
}

export interface Suggestion {
  id: string;
  text: string;
  date: string;
  timestamp: number;
  senderRole: UserRole;
  senderName: string;
}

// Added Winner interface for Competitions component
export interface Winner {
  rank: string;
  studentName: string;
  schoolName: string;
}

export interface Competition {
  id: string;
  title: string;
  date: string;
  description: string;
  winners: Winner[];
  photos: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp?: number;
}

// Added GeneratedImage interface for ImageSection component
export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}
