import SearchPage from './components/search-page'
import { getCustomers, getRooms } from './lib/queries'

export default async function SalesDashboardPage() {
  const customers = await getCustomers()
  const rooms     = await getRooms()

  return (
    <div className="p-6">
      <SearchPage
        customers={customers}
        rooms={rooms}
      />
    </div>
  )
}
