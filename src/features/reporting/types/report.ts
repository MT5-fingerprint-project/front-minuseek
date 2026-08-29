export type ReportType = 'TECHNICAL' | 'TRACEABILITY'

export type JournalDetail = 'SUMMARY' | 'FULL'

export type GenerateReportInput = {
  type: ReportType
  journalDetail: JournalDetail
}

export type CaseReport = {
  id: string
  type: ReportType
  number: string
  sha256: string
  createdAt: string
  generatedByDisplayName: string
  signerDisplayName: string | null
  journalDetail: JournalDetail
}


export type GeneratedReport = {
  id: string
  sha256: string
}

export type ReportDownload = {
  url: string
  sha256: string
}
