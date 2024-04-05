import Header from '@/components/foundation/Header'
import Dashboard from '@/components/home/Dashboard'

export const runtime = 'edge'
export default function Home() {
    return (
        <div className="flex flex-col  h-full w-full">
            <Header />
            <div className="flex-grow flex items-center justify-center">
                <Dashboard />
            </div>
        </div>
    )
}
