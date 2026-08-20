export type ReportType = 'TECHNICAL' | 'TRACEABILITY'

export type CaseReport = {
  id: string
  type: ReportType
  sha256: string
  createdAt: string
  generatedByDisplayName: string
}

export type GeneratedReport = {
  id: string
  sha256: string
}

export type ReportDownload = {
  url: string
  sha256: string
}
