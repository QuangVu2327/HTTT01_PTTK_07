import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import KhachHangCuTru from '@/components/check_customer/customer'

export default function CustomerPage() {
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

            <KhachHangCuTru />
        </>
    )
}