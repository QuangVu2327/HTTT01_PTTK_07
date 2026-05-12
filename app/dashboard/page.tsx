import Link from 'next/link'
import { Building2, Users, ClipboardList, UserCheck, Mail, BedDouble } from 'lucide-react'

const LINKS = [
    { label: 'Customer Information', href: '/customer/provide_information', icon: Users, desc: 'Customer info' },
    //{ label: 'Rooms (Customer)', href: '/dashboard/customer/rooms', icon: BedDouble, desc: 'Browse available rooms' },
    //{ label: 'Manager Check Costumer', href: '/manager/check_customer', icon: Building2, desc: 'Manager home' },
    { label: 'Sales', href: '/sales', icon: ClipboardList, desc: 'Control Sales' },
    { label: 'Check Customer', href: '/manager/check_customer', icon: UserCheck, desc: 'Verify resident info' },
    { label: 'Send Email', href: '/dashboard/manager/pick', icon: Mail, desc: 'Email customers' },
    //{ label: 'Buildings', href: '/dashboard/manager/buildings', icon: Building2, desc: 'Manage buildings & rooms' },
]

export default function DashboardIndexPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-10">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Dev Navigator</h1>
                <p className="text-gray-500 mb-8">Jump to any page for testing — no auth required.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {LINKS.map(({ label, href, icon: Icon, desc }) => (
                        <Link key={href} href={href}
                            className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-400 hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-black transition-colors">
                                    <Icon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                                </div>
                                <p className="font-semibold text-gray-900">{label}</p>
                            </div>
                            <p className="text-sm text-gray-500 ml-12">{desc}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}