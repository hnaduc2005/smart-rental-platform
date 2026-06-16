export const provinces = [
  { id: 'hcm', label: 'TP. Hồ Chí Minh' },
  { id: 'hn', label: 'Hà Nội' },
  { id: 'dn', label: 'Đà Nẵng' },
  { id: 'ct', label: 'Cần Thơ' },
  { id: 'bd', label: 'Bình Dương' },
];

export const districtsByProvince: Record<string, { id: string; label: string }[]> = {
  hcm: [
    { id: 'q1', label: 'Quận 1' },
    { id: 'q3', label: 'Quận 3' },
    { id: 'q5', label: 'Quận 5' },
    { id: 'q7', label: 'Quận 7' },
    { id: 'q10', label: 'Quận 10' },
    { id: 'binhthanh', label: 'Bình Thạnh' },
    { id: 'phunhuan', label: 'Phú Nhuận' },
    { id: 'govap', label: 'Gò Vấp' },
    { id: 'tanbinh', label: 'Tân Bình' },
  ],
  hn: [
    { id: 'hoankiem', label: 'Hoàn Kiếm' },
    { id: 'dongda', label: 'Đống Đa' },
    { id: 'caugiay', label: 'Cầu Giấy' },
    { id: 'hadong', label: 'Hà Đông' },
    { id: 'thanxuan', label: 'Thanh Xuân' },
  ],
  dn: [
    { id: 'haichau', label: 'Hải Châu' },
    { id: 'thanhkhe', label: 'Thanh Khê' },
    { id: 'sontra', label: 'Sơn Trà' },
    { id: 'nguhanhson', label: 'Ngũ Hành Sơn' },
  ],
  ct: [
    { id: 'ninhkieu', label: 'Ninh Kiều' },
    { id: 'binhthuy', label: 'Bình Thủy' },
  ],
  bd: [
    { id: 'thudaumot', label: 'Thủ Dầu Một' },
    { id: 'dinan', label: 'Dĩ An' },
    { id: 'thuanao', label: 'Thuận An' },
  ],
};

export const roomTypes = [
  { id: 'tro', label: 'Phòng trọ' },
  { id: 'chung-cu-mini', label: 'Chung cư mini' },
  { id: 'ktx', label: 'Ký túc xá' },
  { id: 'studio', label: 'Studio' },
  { id: 'can-ho', label: 'Căn hộ dịch vụ' },
];

export const amenities = [
  { id: 'ac', label: 'Máy lạnh' },
  { id: 'parking', label: 'Chỗ để xe' },
  { id: 'wc', label: 'WC riêng' },
  { id: 'wifi', label: 'Wifi miễn phí' },
  { id: 'fridge', label: 'Tủ lạnh' },
  { id: 'washer', label: 'Máy giặt' },
  { id: 'security', label: 'Bảo vệ 24/7' },
  { id: 'balcony', label: 'Ban công' },
];

export const mockRooms = [
  { id: 1, title: 'Phòng trọ ban công view đẹp, full nội thất cao cấp', price: 2500000, area: 25, address: '123 Nguyễn Trãi, Quận 1, TP.HCM', imageUrl: '', isHot: true, type: 'tro', province: 'hcm', district: 'q1' },
  { id: 2, title: 'Ký túc xá sinh viên sạch sẽ gần ĐH Bách Khoa', price: 800000, area: 12, address: 'Lý Thường Kiệt, Quận 10, TP.HCM', imageUrl: '', isHot: false, type: 'ktx', province: 'hcm', district: 'q10' },
  { id: 3, title: 'Chung cư mini cao cấp có thang máy, bảo vệ 24/7', price: 5000000, area: 40, address: 'Nguyễn Lương Bằng, Quận 7, TP.HCM', imageUrl: '', isHot: true, type: 'chung-cu-mini', province: 'hcm', district: 'q7' },
  { id: 4, title: 'Phòng trọ giá rẻ gần trung tâm, tiện ích đầy đủ', price: 1200000, area: 18, address: 'Đinh Tiên Hoàng, Bình Thạnh, TP.HCM', imageUrl: '', isHot: false, type: 'tro', province: 'hcm', district: 'binhthanh' },
  { id: 5, title: 'Căn hộ dịch vụ cao cấp, đầy đủ nội thất nhập khẩu', price: 8000000, area: 55, address: 'Lê Văn Lương, Quận 7, TP.HCM', imageUrl: '', isHot: true, type: 'can-ho', province: 'hcm', district: 'q7' },
  { id: 6, title: 'Phòng trọ yên tĩnh, an ninh, gần chợ và siêu thị', price: 1800000, area: 20, address: 'Tô Hiến Thành, Quận 3, TP.HCM', imageUrl: '', isHot: false, type: 'tro', province: 'hcm', district: 'q3' },
  { id: 7, title: 'Phòng khép kín WC riêng, có điều hòa và nóng lạnh', price: 3200000, area: 30, address: 'Hoàng Văn Thụ, Phú Nhuận, TP.HCM', imageUrl: '', isHot: false, type: 'tro', province: 'hcm', district: 'phunhuan' },
  { id: 8, title: 'Phòng trọ mới xây, sạch đẹp, gần bệnh viện Chợ Rẫy', price: 2000000, area: 22, address: 'Nguyễn Chí Thanh, Quận 5, TP.HCM', imageUrl: '', isHot: false, type: 'tro', province: 'hcm', district: 'q5' },
  { id: 9, title: 'Studio mini đầy đủ tiện nghi cho người độc thân', price: 4500000, area: 35, address: 'Võ Văn Tần, Quận 3, TP.HCM', imageUrl: '', isHot: true, type: 'studio', province: 'hcm', district: 'q3' },
  { id: 10, title: 'Phòng trọ sinh viên, gần ĐH Kinh Tế, giờ giấc tự do', price: 900000, area: 14, address: 'Nguyễn Đình Chiểu, Quận 3, TP.HCM', imageUrl: '', isHot: false, type: 'tro', province: 'hcm', district: 'q3' },
  { id: 11, title: 'Chung cư mini Hà Nội gần hồ Tây, view đẹp', price: 4000000, area: 38, address: 'Trấn Vũ, Tây Hồ, Hà Nội', imageUrl: '', isHot: true, type: 'chung-cu-mini', province: 'hn', district: 'dongda' },
  { id: 12, title: 'Phòng trọ Đà Nẵng gần biển Mỹ Khê', price: 2200000, area: 22, address: 'Trường Sa, Ngũ Hành Sơn, Đà Nẵng', imageUrl: '', isHot: false, type: 'tro', province: 'dn', district: 'nguhanhson' },
];

export const roomCategories = [
  { id: 'all', label: 'Tất cả' },
  { id: 'tro', label: 'Phòng trọ' },
  { id: 'chung-cu-mini', label: 'Chung cư mini' },
  { id: 'ktx', label: 'Ký túc xá' },
  { id: 'studio', label: 'Studio' },
  { id: 'can-ho', label: 'Căn hộ dịch vụ' },
];

export const mockRoomDetails = {
  id: 1,
  title: 'Phòng trọ ban công view đẹp, full nội thất cao cấp',
  price: 2500000,
  area: 25,
  address: '123 Nguyễn Trãi, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',
  images: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1de2d9200b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
  ],
  isHot: true,
  type: 'Phòng trọ',
  status: 'Còn phòng',
  description: `Phòng trọ mới xây, sạch sẽ, thoáng mát, khu an ninh yên tĩnh.
- Có ban công phơi đồ riêng, view đẹp.
- Giờ giấc tự do, không chung chủ.
- Camera an ninh 24/7, khóa vân tay.
- Gần chợ, siêu thị tiện lợi, bến xe buýt.
- Điện: 3.5k/kWh, Nước: 100k/người, Rác+Wifi: 100k/phòng.`,
  amenities: ['ac', 'parking', 'wc', 'wifi', 'fridge', 'washer', 'security', 'balcony'],
  landlord: {
    id: 'll1',
    name: 'Nguyễn Văn A',
    avatar: '',
    phone: '0901234567',
    joinedDate: 'Tháng 5, 2023',
    totalRooms: 15,
  },
  mapCoordinates: { lat: 10.762622, lng: 106.660172 }, // Approximate HCMC
};

export const mockReviews = [
  {
    id: 1,
    author: 'Trần Thị B',
    avatar: '',
    rating: 5,
    date: '10/06/2026',
    content: 'Phòng sạch sẽ, y như hình. Chú chủ nhà rất nhiệt tình hỗ trợ khi có đồ hỏng.',
  },
  {
    id: 2,
    author: 'Lê Văn C',
    avatar: '',
    rating: 4,
    date: '15/05/2026',
    content: 'An ninh tốt, giờ giấc tự do nên đi làm về trễ cũng tiện. Tuy nhiên chỗ để xe hơi chật.',
  }
];

export const mockMyRoomData = {
  id: 1,
  title: 'Phòng trọ ban công view đẹp, full nội thất cao cấp',
  address: '123 Nguyễn Trãi, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',
  price: 2500000,
  area: 25,
  images: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  ],
  contract: {
    contractId: 'HD-2026-00123',
    startDate: '01/01/2026',
    endDate: '31/12/2026',
    deposit: 5000000,
    status: 'Đang hiệu lực',
  },
  roommates: [
    { id: 'rm1', name: 'Nguyễn Văn A', phone: '0901234567', role: 'Đại diện thuê' },
    { id: 'rm2', name: 'Trần Thị B', phone: '0912345678', role: 'Thành viên' },
  ],
  rules: [
    'Không tụ tập ồn ào sau 10h tối.',
    'Không nuôi thú cưng (chó, mèo).',
    'Giữ gìn vệ sinh chung khu vực hành lang và nhà xe.',
    'Khóa cổng cẩn thận khi ra vào sau 11h đêm.',
    'Chỉ để tối đa 2 xe máy tại khu vực nhà xe chung.'
  ],
  landlord: {
    name: 'Nguyễn Văn Chủ',
    phone: '0987654321'
  }
};

export const mockInvoicesData = [
  {
    id: 'INV-2026-06',
    month: 'Tháng 6, 2026',
    status: 'unpaid',
    dueDate: '10/07/2026',
    roomRent: 2500000,
    electricity: {
      oldIndex: 1250,
      newIndex: 1350,
      usage: 100,
      price: 3500,
      total: 350000,
      image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&auto=format&fit=crop&q=60'
    },
    water: {
      oldIndex: 20,
      newIndex: 25,
      usage: 5,
      price: 20000,
      total: 100000,
      image: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=500&auto=format&fit=crop&q=60'
    },
    services: [
      { name: 'Rác sinh hoạt', total: 50000 },
      { name: 'Wifi cáp quang', total: 100000 },
    ],
    totalAmount: 3100000
  },
  {
    id: 'INV-2026-05',
    month: 'Tháng 5, 2026',
    status: 'paid',
    dueDate: '10/06/2026',
    roomRent: 2500000,
    electricity: {
      oldIndex: 1160,
      newIndex: 1250,
      usage: 90,
      price: 3500,
      total: 315000,
      image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&auto=format&fit=crop&q=60'
    },
    water: {
      oldIndex: 15,
      newIndex: 20,
      usage: 5,
      price: 20000,
      total: 100000,
      image: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=500&auto=format&fit=crop&q=60'
    },
    services: [
      { name: 'Rác sinh hoạt', total: 50000 },
      { name: 'Wifi cáp quang', total: 100000 },
    ],
    totalAmount: 3065000
  }
];

export const mockPaymentsData = [
  {
    id: 'PAY-2026-06',
    invoiceId: 'INV-2026-06',
    amount: 3100000,
    date: '10/07/2026 09:30',
    method: 'Chuyển khoản (Vietcombank)',
    status: 'pending',
    proofImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&auto=format&fit=crop&q=60',
    note: 'Đang chờ chủ trọ xác nhận tiền vào tài khoản'
  },
  {
    id: 'PAY-2026-05',
    invoiceId: 'INV-2026-05',
    amount: 3065000,
    date: '08/06/2026 14:15',
    method: 'Chuyển khoản (Techcombank)',
    status: 'approved',
    proofImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&auto=format&fit=crop&q=60',
    note: 'Đã nhận đủ tiền'
  },
  {
    id: 'PAY-2026-04',
    invoiceId: 'INV-2026-04',
    amount: 2950000,
    date: '10/05/2026 18:20',
    method: 'Tiền mặt',
    status: 'approved',
    proofImage: '',
    note: 'Đóng trực tiếp cho quản lý'
  }
];

export const mockIssuesData = [
  {
    id: 'ISS-2026-002',
    title: 'Hỏng bóng đèn phòng khách',
    category: 'Điện',
    description: 'Bóng đèn chớp nháy liên tục từ tối qua, nhờ chú chủ trọ qua thay bóng mới giúp cháu.',
    status: 'pending',
    date: '12/07/2026 08:30',
    image: ''
  },
  {
    id: 'ISS-2026-001',
    title: 'Vòi nước bồn rửa chén bị rỉ',
    category: 'Nước',
    description: 'Vòi nước bị rỉ từng giọt cả đêm, cháu đã khóa van nước tạm thời ở gầm tủ bếp.',
    status: 'resolved',
    date: '01/06/2026 15:30',
    image: ''
  }
];

export const mockReviewsData = [
  {
    id: 'REV-2026-001',
    roomName: 'Phòng 101 - Số 12 Nguyễn Văn Cừ, Q.5',
    roomImage: '',
    rating: 4,
    content: 'Phòng sạch sẽ, chủ trọ thân thiện và nhiệt tình. Khu vực an ninh tốt, gần chợ tiện mua sắm. Chỉ có điều giờ giấc hơi nghiêm, nhưng cũng là điều tốt.',
    createdAt: '15/03/2026',
    canEdit: true
  },
  {
    id: 'REV-2025-003',
    roomName: 'Phòng 205 - Số 88 Lê Văn Sỹ, Q.3',
    roomImage: '',
    rating: 3,
    content: 'Phòng rộng rãi, có ban công thoáng mát. Tuy nhiên tiện ích xung quanh chưa nhiều, đặc biệt thiếu chỗ gửi xe máy vào buổi tối.',
    createdAt: '20/11/2025',
    canEdit: false
  }
];
