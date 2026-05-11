import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    Building2, ClipboardList, UserCheck, Mail, BedDouble, LogOut
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

const DEMO_FUNCTIONS = [
    {
        title: 'Quản lý tòa nhà',
        description: 'Xem và quản lý danh sách tòa nhà, phòng, giường',
        href: '/dashboard/manager/buildings',
        icon: Building2,
        color: 'bg-blue-50 text-blue-600',
    },
    {
        title: 'Yêu cầu thuê phòng',
        description: 'Xử lý các yêu cầu đăng ký thuê phòng từ khách hàng',
        href: '/dashboard/manager/requests',
        icon: ClipboardList,
        color: 'bg-orange-50 text-orange-600',
    },
    {
        title: 'Kiểm tra khách hàng',
        description: 'Xét duyệt thông tin cư trú khi khách nhận phòng',
        href: '/dashboard/manager/check_customer',
        icon: UserCheck,
        color: 'bg-green-50 text-green-600',
    },
    {
        title: 'Gửi email khách hàng',
        description: 'Soạn và gửi email thông báo đến khách hàng',
        href: '/dashboard/manager/email',
        icon: Mail,
        color: 'bg-purple-50 text-purple-600',
    },
    {
        title: 'Quản lý phòng & giường',
        description: 'Xem trạng thái phòng, giường và vật dụng bàn giao',
        href: '/dashboard/manager/buildings',
        icon: BedDouble,
        color: 'bg-pink-50 text-pink-600',
    },
]

export default async function ManagerDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: nhanVien } = await supabase
        .from('NhanVien')
        .select('ten')
        .eq('auth_id', user.id)
        .single()

    const firstName = nhanVien?.ten?.split(' ').pop() ?? 'bạn'

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">DormHub</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{nhanVien?.ten ?? user.email}</p>
                        <p className="text-xs text-gray-500">Nhân viên phụ trách</p>
                    </div>
                    <form action={signOut}>
                        <button type="submit"
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100">
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Xin chào, {firstName} 👋</h1>
                    <p className="mt-2 text-gray-500">Chọn một chức năng để bắt đầu thao tác.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DEMO_FUNCTIONS.map((fn) => (
                        <Link key={fn.title} href={fn.href}
                            className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-400 hover:shadow-md transition-all">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${fn.color}`}>
                                <fn.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900">{fn.title}</p>
                                    <p className="mt-1 text-sm text-gray-500 leading-snug">{fn.description}</p>
                                </div>
                                <span className="text-gray-300 group-hover:text-gray-600 transition-colors mt-1 ml-2">→</span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <span className="inline-flex items-center gap-2 text-xs text-gray-400 bg-gray-100 px-4 py-2 rounded-full">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Chế độ demo — Hệ thống quản lý ký túc xá
                    </span>
                </div>
            </div>
        </div>
    )
}