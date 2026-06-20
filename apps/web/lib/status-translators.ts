export const ROOM_STATUS_MAP: Record<string, string> = {
  AVAILABLE: "Còn trống",
  DEPOSITED: "Đã cọc",
  RENTED: "Đã cho thuê",
  MAINTENANCE: "Đang bảo trì",
  HIDDEN: "Đã ẩn",
};

export const PROPERTY_STATUS_MAP: Record<string, string> = {
  ACTIVE: "Hoạt động",
  HIDDEN: "Đã ẩn",
  MAINTENANCE: "Đang bảo trì",
  DELETED: "Đã xóa",
};

export const CONTRACT_STATUS_MAP: Record<string, string> = {
  DRAFT: "Bản nháp",
  ACTIVE: "Đang hiệu lực",
  ENDED: "Đã kết thúc",
  TERMINATED: "Chấm dứt sớm",
  EXPIRED: "Đã hết hạn",
};

export const INVOICE_STATUS_MAP: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PENDING_CONFIRMATION: "Chờ xác nhận",
  PAID: "Đã thanh toán",
  OVERDUE: "Quá hạn",
  REJECTED: "Bị từ chối",
};

export const PAYMENT_STATUS_MAP: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã hủy",
};

export const ISSUE_STATUS_MAP: Record<string, string> = {
  OPEN: "Mới tạo",
  IN_PROGRESS: "Đang xử lý",
  RESOLVED: "Đã giải quyết",
  CLOSED: "Đã đóng",
  REJECTED: "Bị từ chối",
};

export const RENTAL_REQUEST_STATUS_MAP: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

export const APPOINTMENT_STATUS_MAP: Record<string, string> = {
  REQUESTED: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  COMPLETED: "Đã hoàn thành",
  NO_SHOW: "Khách không đến",
};

export const AUTH_STATUS_MAP: Record<string, string> = {
  PENDING: "Chờ duyệt",
  ACTIVE: "Hoạt động",
  LOCKED: "Đã khóa",
  SUSPENDED: "Tạm đình chỉ",
  DELETED: "Đã xóa",
};

export const DEPOSIT_STATUS_MAP: Record<string, string> = {
  NONE: "Không có",
  PENDING_CONFIRMATION: "Chờ xác nhận",
  PAID: "Đã đóng",
  REFUNDED: "Đã hoàn trả",
  FORFEITED: "Bị tịch thu",
  REJECTED: "Từ chối",
};

/**
 * Trả về chuỗi tiếng Việt của trạng thái, nếu không tìm thấy thì trả về gốc
 */
export function translateStatus(status: string | undefined | null, map: Record<string, string>): string {
  if (!status) return "";
  return map[status.toUpperCase()] || status;
}
