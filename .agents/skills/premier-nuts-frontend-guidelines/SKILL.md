---
name: premier-nuts-frontend-guidelines
description: Bộ quy chuẩn thiết kế kiến trúc Frontend 3 Trụ Cột, quy tắc Svelte 5 Runes, phân quyền theo Permission, cấm hardcode, thiết kế Responsive và chuẩn giao tiếp API Gateway cho hệ thống Premier Nuts ERP.
---

# Premier Nuts ERP - Frontend Architecture & UI/UX Guidelines

Bộ hướng dẫn này áp dụng bắt buộc cho toàn bộ mã nguồn Frontend thuộc hệ thống **Premier Nuts ERP** (`pn-fe-erp`). Mọi kỹ sư và Agent AI tham gia phát triển đều phải tuân thủ nghiêm ngặt các quy tắc dưới đây.

---

## 1. Kiến Trúc 3 Trụ Cột (3-Pillar Modular Frontend Architecture)

Toàn bộ mã nguồn Frontend được tổ chức tách bạch thành 3 khối trụ cột:

```
src/lib/
├── core/         # Trụ cột 1: Hạ tầng dùng chung 100% (Core Infrastructure)
├── premier-ui/   # Trụ cột 2: Thư viện UI thuần túy độc lập nghiệp vụ ($ui)
└── features/     # Trụ cột 3: Các lát cắt phân hệ nghiệp vụ ERP ($features)
```

### 1. Trụ Cột 1: Hạ Tầng Core (`$core/`)
- Độc lập, không chứa logic giao diện màn hình cụ thể.
- Chứa:
  - `core/api/`: `apiClient` (Fetch wrapper tự động đính kèm Bearer token, bắt lỗi HTTP status, xử lý envelope `{ meta, data }`), `endpoints.ts` (Quản lý tập trung mọi URL endpoint gọi qua API Gateway cổng 9000).
  - `core/stores/`: `authStore` (Svelte 5 Runes `$state`, `$derived` quản lý user, token, permission, role).
  - `core/utils/`: `StringHelper` (`trim`, `isBlank`, `isNotBlank`, `toLowerCase`), `DateHelper` (format ngày tháng chuẩn Việt Nam).
  - `core/constants/`: `STORAGE_KEYS` (`access_token`, `refresh_token`, `user_info`).

### 2. Trụ Cột 2: Thư Viện Giao Diện Thuần Túy (`$ui/` - `premier-ui`)
- Thư viện thành phần UI độc lập, không gắn với bất kỳ domain nghiệp vụ ERP nào.
- Có thể đóng gói thành NPM Package dùng lại cho mọi dự án web khác của tập đoàn.
- Chứa các components: `Button`, `Table`, `Card`, `Modal`, `Input`, `Select`, `Badge`, `Sidebar`, `Toast`, `Tabs`, `PageHeader`.
- Đi kèm file `theme.css` định nghĩa toàn bộ Design Tokens thương hiệu Premier Nuts.

### 3. Trụ Cột 3: Lát Cắt Nghiệp Vụ Độc Lập (`$features/`)
- Khớp 1-1 với cấu trúc phân hệ backend:
  - `features/auth/`: Đăng nhập, đổi mật khẩu, xác thực.
  - `features/identity/`: Quản lý người dùng, phân quyền tài khoản.
  - `features/company/`: Thông tin doanh nghiệp, danh sách phòng ban, vai trò.
  - `features/health/`: Giám sát trạng thái hoạt động Gateway & Identity.
  - `features/inventory/`: Quản lý kho, lô hạt, danh mục nông sản.
  - `features/navigation/`: Cấu hình danh mục menu hệ thống (`nav.config.ts`).
- **Cấu trúc nội bộ chuẩn của mỗi Feature:**
  ```
  features/<feature_name>/
  ├── <feature>.types.ts    # Khai báo TypeScript Interfaces/DTOs khớp backend
  ├── <feature>.api.ts      # Các hàm gọi API thông qua apiClient
  ├── components/           # Các component giao diện nghiệp vụ riêng biệt
  └── index.ts              # Barrel file export API & Types
  ```

---

## 2. Quy Tắc Giao Diện Thương Hiệu Premier Nuts (Brand Tokens)

Giao diện hệ thống tuân thủ phong cách **Basic, Sạch sẽ, Chuyên nghiệp (Clean Enterprise Style)**:
- **Nền sáng trang nhã:** Sử dụng `var(--pn-cream, #FFFBF4)` cho toàn bộ trang và thanh điều hướng. Tuyệt đối không dùng nền đen tối hay gradient màu mè neon phát sáng.
- **Card & Form:** Nền trắng tinh `var(--pn-paper, #FFFFFF)` kết hợp viền be kem `var(--pn-line, #EEE3D3)`.
- **Màu chữ:** Sử dụng màu nâu cà phê đậm sang trọng `var(--pn-ink, #2B2116)` cho tiêu đề, chữ thường; màu `var(--pn-ink-soft, #6B5D4F)` cho phụ đề và nhãn.
- **Màu nhấn (Premier Orange):** Sử dụng cam chủ đạo `var(--pn-orange, #F0821E)` cho nút bấm chính (Submit Button), badge nổi bật, viền focus ô nhập liệu và chip active.

---

## 3. Quy Tắc Bố Cục Responsive & Layout Bảng Dữ Liệu

1. **Tuyệt đối không xếp 2 bảng dữ liệu hẹp cạnh nhau:**
   - Việc chia cột `1fr 1fr` cho 2 bảng dữ liệu nhiều cột (Mã, Tên, Mô tả, Trạng thái...) sẽ làm chữ bị bóp nghẹt, méo mó và cắt cụt văn bản (`Mô T...`, `Ph...`).
   - Các bảng dữ liệu nghiệp vụ phải được **trải ngang toàn màn hình (Full Width)** theo dạng danh sách thẻ xếp chồng (`tables-stack`) hoặc tổ chức dạng `Tabs`.
2. **Container cuộn ngang Responsive:**
   - Mọi bảng đều phải được bọc trong wrapper có:
     ```css
     .table-responsive {
       width: 100%;
       overflow-x: auto;
       -webkit-overflow-scrolling: touch;
     }
     ```
   - Đặt `min-width` hợp lý cho bảng (thường từ `650px` đến `800px`) và các cột để nội dung không bao giờ bị vỡ trên màn hình hẹp/mobile.
3. **Form Grid Responsive:**
   - Các ô nhập liệu trên Modal hoặc Card form: Sử dụng 1 cột trên điện thoại (`< 640px`) và 2 cột trên máy tính (`grid-template-columns: 1fr 1fr`).

---

## 4. Quy Tắc Cấm Hardcode (Zero Hardcoding Rule)

1. **Không hardcode ID phòng ban, danh mục, vai trò:**
   - Tuyệt đối không gán cứng `companyId: 1`, `departmentId: 1`, `roleIds: [1]`.
   - Danh sách phòng ban và vai trò trong các ô chọn (`Select`) phải được nạp động từ API backend (`getDepartments()`, `getRoles()`).
2. **Không hardcode danh sách người dùng hoặc dữ liệu mock khi đã có API:**
   - Toàn bộ bảng danh sách nhân sự phải load trực tiếp từ API backend qua Gateway `http://localhost:9000/api/v1/users`.
3. **Quản lý URL tập trung:**
   - Toàn bộ đường dẫn gọi API phải xuất phát từ `ENDPOINTS` trong `$core/api/endpoints.ts`. Không viết chuỗi URL phân tán rải rác trong component.

---

## 5. Quy Tắc Phân Quyền Theo Quyền Hạn (Permission-Based RBAC)

1. **ĐIỀU RĂN TỐI CAO: CHỈ ADMIN MỚI ĐƯỢC THÊM HOẶC PHÂN QUYỀN ADMIN:**
   - Người dùng bình thường (Thủ kho, Kế toán, Sản xuất, QC...) khi mở form tạo hoặc sửa nhân sự **tuyệt đối không được nhìn thấy tùy chọn vai trò `ROLE_ADMIN` / `SUPER_ADMIN`**.
   - Hàm `getAllowedRoles()` trên giao diện lọc bỏ vai trò Admin nếu `!authStore.isAdmin`.
   - Tại backend, hàm `validateAdminRoleAssignment` chặn và trả về lỗi `40300002` nếu người gọi không có quyền Admin mà cố tình gán quyền Admin.
2. **Ẩn hiện nút chức năng & Menu theo quyền:**
   - Nút `+ Cấp tài khoản mới` chỉ hiển thị khi `authStore.isAdmin` hoặc có quyền `USER_MANAGE`.
   - Menu điều hướng Sidebar (`+layout.svelte`) tự động lọc các mục `/identity` và `/health` dựa trên quyền thực tế của phiên đăng nhập (`allowedNavSections`).

---

## 6. Quy Chuẩn Xử Lý Form Validation UX

1. **Tô đỏ Input & Dòng thông báo lỗi bên dưới:**
   - Khi bấm submit form: Nếu trường bắt buộc bị trống hoặc không hợp lệ, lập tức thêm class `has-error`:
     ```css
     .custom-input.has-error {
       border-color: #dc2626 !important;
       background-color: #fffaf9 !important;
     }
     ```
   - Hiển thị dòng thông báo lỗi màu đỏ ngay dưới ô input (`<span class="field-error">Vui lòng nhập...</span>`).
2. **Tự động xóa lỗi khi nhập liệu:**
   - Bắt sự kiện `oninput` trên ô input để xóa ngay lỗi và khôi phục viền chuẩn ngay khi người dùng gõ phím.

---

## 7. Quy Chuẩn Cổng Mạng & Giao Tiếp Hệ Thống

- **API Gateway (Port 9000):** Cổng duy nhất Frontend được phép gửi request (`http://localhost:9000`). Toàn bộ CORS tập trung tại Gateway.
- **Identity Service (Port 9001):** Nằm sau Gateway, không gọi trực tiếp từ trình duyệt.
- **Frontend ERP (Port 5173):** Chạy Vite dev server trên cổng 5173.

---

## 8. Definition of Done (DoD) Checklist cho Frontend

Mỗi tính năng Frontend hoàn thành chỉ được coi là ĐẠT (PASS) khi:
- [x] Lệnh `npm run check` trả về **0 errors, 0 warnings**.
- [x] Lệnh `npm run build` biên dịch thành công 100%.
- [x] Kiểm tra hiển thị responsive không bị vỡ giao diện hay cắt cụt văn bản trên cả mobile và desktop.
- [x] Không còn giá trị hardcode ID, dữ liệu dropdown được load động từ API.
- [x] Đã áp dụng kiểm tra quyền (`isAdmin`, `hasPermission`), kiểm tra chặt chẽ việc gán quyền Admin.
- [x] Validate form có tô viền đỏ input và dòng thông báo đỏ bên dưới.
- [x] Kiểm thử trực quan trên trình duyệt xác nhận kết nối thông suốt qua Gateway :9000.
