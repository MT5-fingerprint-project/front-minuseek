
export type ServiceStatisticsOperator = {
  id: string
  firstName: string
  lastName: string
}

export type ServiceStatisticsOpenCase = {
  id: string
  caseNumber: string
  openedAt: string
  ageInDays: number
  operator: ServiceStatisticsOperator | null
  lastActivityAt: string | null
}

export type ServiceStatisticsMonthlyFlow = {
  month: string
  opened: number
  closed: number
}

export type ServiceStatisticsOperatorRow = {
  operator: ServiceStatisticsOperator | null
  openCases: number
  closedInPeriod: number
  medianClosureDays: number | null
}

export type ServiceStatistics = {
  period: {
    from: string
    to: string
  }
  cases: {
    open: number
    openOver90Days: number
    openedInPeriod: number
    closedInPeriod: number
    medianClosureDays: number | null
    ninthDecileClosureDays: number | null
    monthlyFlow: ServiceStatisticsMonthlyFlow[]
    openCases: ServiceStatisticsOpenCase[]
  }
  traces: {
    collected: number
    exploitable: number
    compared: number
    identified: number
  }
  signals: {
    dormantOver30Days: number
    expertiseDeadlinesUnder15Days: number
    exploitableNeverCompared: number
    openWithoutOperator: number
  }
  byOperator: ServiceStatisticsOperatorRow[]
}
