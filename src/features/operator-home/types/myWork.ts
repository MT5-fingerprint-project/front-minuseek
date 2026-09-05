export type MyWorkProduction = {
  collected: number
  exploitable: number
  compared: number
  identified: number
}

export type MyWorkAgeBrackets = {
  overSixMonths: number
  threeToSixMonths: number
  underThreeMonths: number
}

export type MyWorkCase = {
  id: string
  caseNumber: string
  openedAt: string
  ageInDays: number
}

export type MyWorkDiscordance = {
  caseId: string
  caseNumber: string
  completedAt: string | null
}

export type MyWorkPendingTraces = {
  caseId: string
  caseNumber: string
  exploitableNeverCompared: number
  receivedNotQualified: number
}

export type MyWork = {
  period: { from: string; to: string }
  production: MyWorkProduction
  cases: {
    open: number
    ageBrackets: MyWorkAgeBrackets
    oldest: MyWorkCase[]
  }
  discordances: MyWorkDiscordance[]
  pendingTraces: MyWorkPendingTraces[]
}
