export type FileStatus = "gerado" | "agendado" | "a_gerar" | "dados_insuficientes" | "erro";
export type Frequency = "mensal" | "semestral" | "anual";
export type FileType = "pdf" | "csv" | "docx" | "xlsx";

export interface DriveFile {
  id: string;
  name: string;
  fileType: FileType;
  frequency?: Frequency;
  status: FileStatus;
  size: string;
  generatedAt?: string;
  isDocument?: boolean;
  uploadedBy?: string;
  version?: number;
}

export interface DriveNode {
  id: string;
  name: string;
  icon?: string;
  children?: DriveNode[];
  files?: DriveFile[];
  isDocumentFolder?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  reportName: string;
  createdAt: string;
  read: boolean;
}

export interface RecentItem {
  file: DriveFile;
  pathLabel: string;
  openedAt: string;
}

export interface PinnedItem {
  file: DriveFile;
  pathLabel: string;
}

export interface Breadcrumb {
  label: string;
  pathIds: string[];
}
