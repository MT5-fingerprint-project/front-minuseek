import { Link } from 'react-router-dom'

export type WorkQueueDestination = {
  context: string
  verb: string
  to: string
  isAlerting?: boolean
}

type WorkQueueRowProps = {
  title: string
  count: number
  destinations: WorkQueueDestination[]
}

export default function WorkQueueRow({ title, count, destinations }: WorkQueueRowProps) {
  return (
    <div className="flex items-center gap-6 border-t border-grey-light-2 px-6 py-4 first:border-t-0">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold tracking-[-0.005em] text-blue-dark-1">{title}</p>
        {destinations.map((destination) => (
          <Link
            key={destination.to + destination.context}
            to={destination.to}
            className="group mt-1 flex items-baseline gap-4 transition-colors"
          >
            <span
              className={`flex-1 text-[13px] ${
                destination.isAlerting ? 'font-medium text-red-medium' : 'text-grey-medium-2'
              }`}
            >
              {destination.context}
            </span>
            <span className="whitespace-nowrap text-[11.5px] font-bold tracking-[0.08em] text-blue-medium-1 group-hover:text-blue-dark-1">
              {destination.verb}
              <span className="ml-1.5 font-normal">›</span>
            </span>
          </Link>
        ))}
      </div>
      <span className="w-18 text-right text-2xl font-semibold text-blue-dark-1 tabular-nums">
        {count}
      </span>
    </div>
  )
}
