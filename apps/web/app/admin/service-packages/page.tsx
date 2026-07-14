export default function AdminServicePackagesPage() {
  return (
    <div className="admin-placeholder">
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">Quản lý gói dịch vụ</h1>
        <p className="admin-page-header__desc">
          Tạo và quản lý các gói đăng ký dịch vụ dành cho chủ trọ.
        </p>
      </div>

      <div className="admin-placeholder__table">
        <div className="admin-placeholder__table-header">
          <h2 className="admin-placeholder__table-title">Danh sách gói dịch vụ</h2>
        </div>
        <div className="admin-placeholder__coming-soon">
          <div className="admin-placeholder__cs-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h3 className="admin-placeholder__cs-title">Đang phát triển</h3>
          <p className="admin-placeholder__cs-desc">
            Tính năng quản lý gói dịch vụ sẽ cho phép tạo, sửa, ẩn/hiện gói, 
            xem danh sách chủ trọ đã đăng ký và thống kê doanh thu.
          </p>
        </div>
      </div>
    </div>
  );
}
