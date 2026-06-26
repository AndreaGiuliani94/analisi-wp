export interface VideoInterval {
  start: string;
  end: string;
  category: string;
  title: string
  errors: {
    start: string;
    end: string;
    title: string;
  };
}

export interface VideoIntervalNew {
  id?: string
  category: string
  anchorTime: number
  title: string
  type: string
  offsetStart: number
  offsetEnd: number
  teamId?: string | null
  playerNumber?: number | null
  status: IntervalsStatus
  jobId?: string
  mp4_s3_path?: string
}

export interface ExportJob {
  id?: string;
  status: JobStatus;
  zip_s3_path?: string;
  clipCount: number;
  createdAt?: number;
}

export enum JobStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DRAFT = 'DRAFT',
}

export enum IntervalsStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  DRAFT = 'DRAFT',
}

export enum ExportJobStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}