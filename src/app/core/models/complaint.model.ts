export interface Complaint {
  id: number;
  userId: number;
  userName: string;
  crimeType: CrimeType;
  description: string;
  status: ComplaintStatus;
  dateFiled: string;
  dateLastUpdated: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  priorityScore?: number;
  evidences?: Evidence[];
  caseFile?: CaseFile;
}

export interface ComplaintRequest {
  crimeType: CrimeType;
  description: string;
  latitude?: number;
  longitude?: number;
  location?: string;
}

export enum CrimeType {
  THEFT = 'THEFT',
  ASSAULT = 'ASSAULT',
  BURGLARY = 'BURGLARY',
  FRAUD = 'FRAUD',
  VANDALISM = 'VANDALISM',
  HARASSMENT = 'HARASSMENT',
  DRUG_RELATED = 'DRUG_RELATED',
  HOMICIDE = 'HOMICIDE',
  KIDNAPPING = 'KIDNAPPING',
  ROBBERY = 'ROBBERY',
  CYBER_CRIME = 'CYBER_CRIME',
  DOMESTIC_VIOLENCE = 'DOMESTIC_VIOLENCE',
  SEXUAL_ASSAULT = 'SEXUAL_ASSAULT',
  ARSON = 'ARSON',
  OTHER = 'OTHER'
}

export enum ComplaintStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ASSIGNED = 'ASSIGNED',
  INVESTIGATING = 'INVESTIGATING',
  PENDING_EVIDENCE = 'PENDING_EVIDENCE',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
  RESOLVED = 'RESOLVED'
}

export interface Evidence {
  id: number;
  complaintId: number;
  type: EvidenceType;
  fileName: string;
  fileUrl: string;
  fileContentType: string;
  fileSize: number;
  description?: string;
  metadata?: string;
  uploadedAt: string;
  uploadedById: number;
  uploadedByName: string;
}

export enum EvidenceType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER'
}

export interface CaseFile {
  id: number;
  complaintId: number;
  assignedOfficerId?: number;
  assignedOfficerName?: string;
  badgeNumber?: string;
  department?: string;
  status: CaseStatus;
  reportSummary?: string;
  createdAt: string;
  lastUpdated: string;
  closedAt?: string;
  closingReport?: string;
  caseNotes?: CaseNote[];
  witnessStatements?: WitnessStatement[];
}

export enum CaseStatus {
  OPEN = 'OPEN',
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED'
}

export interface CaseNote {
  id: number;
  caseFileId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
  isPrivate: boolean;
}

export interface WitnessStatement {
  id: number;
  caseFileId: number;
  witnessName: string;
  witnessContact?: string;
  statement: string;
  submittedAt: string;
  isAnonymous: boolean;
  userId?: number;
  userFullName?: string;
} 