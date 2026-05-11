export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function statusLabel(trangThai: string) {
  const map: Record<string, string> = {
    'Con trong': 'Còn trống',
    'Day':       'Đầy',
    'Dang sua':  'Đang sửa',
    'San sang':  'Sẵn sàng',
    'Dang giu':  'Đang giữ',
    'Da dat coc':'Đã đặt cọc',
    'Dang o':    'Đang ở',
    'Bao tri':   'Bảo trì',
  }
  return map[trangThai] ?? trangThai
}

export function statusVariant(
  trangThai: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (trangThai === 'Con trong' || trangThai === 'San sang') return 'default'
  if (trangThai === 'Dang sua'  || trangThai === 'Bao tri')  return 'destructive'
  return 'secondary'
}
