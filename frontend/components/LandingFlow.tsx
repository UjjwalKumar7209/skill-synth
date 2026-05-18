import { Button } from './ui/button'
import { Card, CardDescription, CardTitle } from './ui/card'

export default function LandingFlow() {
  return (
    <div className="w-full flex flex-col items-center gap-10 lg:pt-0 pt-10 lg:px-0 px-4">
      <h2 className="lg:text-4xl text-3xl font-bold text-center">
        Everything you need to level up
      </h2>
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <Card className="w-89 h-37.5 flex justify-center">
          <CardTitle className="text-xl">Realistic Simulation</CardTitle>
          <CardDescription>
            Context-aware AI that follows company-specific rubrics and
            difficulty levels.
          </CardDescription>
        </Card>
        <Card className="w-89 h-37.5 flex justify-center">
          <CardTitle className="text-xl">Instant Feedback</CardTitle>
          <CardDescription>
            Detailed analysis of your code efficiency, communication style, and
            logic.
          </CardDescription>
        </Card>
        <Card className="w-89 h-37.5 flex justify-center">
          <CardTitle className="text-xl">Track Progress</CardTitle>
          <CardDescription>
            Advanced analytics dashboard to visualize your growth over multiple
            sessions.
          </CardDescription>
        </Card>
      </div>
      <Card className='lg:w-3/4 flex justify-center items-center py-15'>
        <CardTitle className="text-2xl font-bold text-center">Ready to land your dream job?</CardTitle>
        <Button className='text-md px-8'>Create Your Account</Button>
      </Card>
    </div>
  )
}
