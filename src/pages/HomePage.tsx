import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export default function HomePage() {
  return (
    <div>
      <h1 className="text-red-500">Home</h1>
      <div className="flex gap-3">
        <Button>Click</Button>
        <Link to="/affaires/123">
          <Button>Open affaire 123</Button>
        </Link>
      </div>
    </div>
  )
}
