import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import SearchPage from './components/search-page'
import { getCustomers, getRooms } from './lib/queries'

export default async function SalesDashboardPage() {
    const customers = await getCustomers()
    const rooms = await getRooms()

    return (
        <>
            <div className="border-b border-gray-200 bg-white px-6 py-4">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Quay về Dashboard
                </Link>
            </div>

            <div className="p-6">
                <SearchPage customers={customers} rooms={rooms} />
            </div>
        </>
    )
}