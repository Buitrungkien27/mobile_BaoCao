# EventMate - Đồng hành sự kiện sinh viên

Đồ án môn Lập trình cho thiết bị di động, Đề tài 4, Nhóm 19. Ứng dụng Expo chạy bằng dữ liệu mô phỏng ở phía điện thoại, không yêu cầu backend.

## Thành viên trong báo cáo

- Bùi Trung Kiên - MSSV 22002435
- Nguyễn Trọng Hiếu - MSSV 22002985

## Chức năng

- **Khám phá:** tìm theo tên, địa điểm và chủ đề; lọc danh mục; xem sự kiện sắp tới hoặc đã qua; chỉ xem sự kiện yêu thích; sắp xếp theo ngày hoặc số chỗ còn lại; tải danh sách theo trang.
- **Chi tiết và đăng ký:** xem thông tin, lịch trình, diễn giả, chỗ trống và hạn cuối; đăng ký hoặc vào danh sách chờ khi đã đủ chỗ; cảnh báo nếu lịch bị trùng; tự khóa đăng ký khi quá hạn.
- **Nhắc lịch:** chọn nhắc trước giờ sự kiện và trước hạn đăng ký. Nếu người dùng từ chối quyền thông báo, đăng ký vẫn được giữ.
- **Lịch cá nhân:** xem sự kiện sắp tới/đã qua, trạng thái đăng ký, chờ và check-in; hủy đăng ký từ lịch.
- **Thời khóa biểu:** thêm, sửa, xóa giờ học lặp theo thứ hằng tuần hoặc theo một ngày cụ thể; khi đăng ký sự kiện, app cảnh báo nếu trùng giờ học hoặc sự kiện đã đăng ký.
- **Check-in:** quét QR bằng camera hoặc nhập mã; chỉ chấp nhận sự kiện đã đăng ký; báo mã sai và check-in trùng.
- **Hồ sơ:** thống kê hoạt động, điểm và huy hiệu; mở riêng danh sách yêu thích, đã đăng ký, đang chờ và đã tham gia; lưu lịch sử check-in.
- **Tóm tắt AI:** bản demo local tạo gợi ý từ sự kiện và mục tiêu, có consent và giới hạn nội dung nhập.
- **Lưu cục bộ:** yêu thích, đăng ký, danh sách chờ và lịch sử check-in được giữ trên thiết bị sau khi đóng/mở lại app.

## Màn hình

- Home
- Events
- EventDetail
- CheckIn
- Schedule
- Schedule / Thời khóa biểu
- AiSummary
- Profile
- MyEvents (các danh sách sự kiện trong hồ sơ)

## Công nghệ

- Expo SDK 58, React Native 0.88, TypeScript.
- React Navigation: bottom tabs, native stack và deep link `eventmate19://event/ev-mobile-workshop`.
- Context API + `useReducer` quản lý trạng thái dùng chung.
- AsyncStorage lưu trạng thái demo trên thiết bị.
- Expo Camera và Expo Notifications cho quét QR và nhắc lịch.
- Reanimated, Worklets và Gesture Handler cho animation/thao tác kéo.
- Tamagui cho token màu, theme và component dùng lại.

## Mở bằng VS Code và chạy với Expo Go

Cài Node.js 22.13 trở lên, mở thư mục dự án trong VS Code, rồi chạy trong terminal:

```bash
npm install
npx expo start
```

Mở Expo Go SDK 58 trên điện thoại và quét QR. Điện thoại và máy tính nên dùng cùng mạng Wi-Fi.

Các script khác:

```bash
npm run android
npm run web
npm run typecheck
```

`npm run android` cần Android Studio/emulator. Khi cài package mới, dùng `npx expo install <tên-package>` để chọn phiên bản tương thích với SDK hiện tại.

## Dữ liệu demo và giới hạn

- Dữ liệu mẫu nằm trong `src/data/events.ts`; API giả lập độ trễ và một tỷ lệ lỗi mạng nhỏ.
- Có 20 sự kiện mẫu để cuộn và phân trang, gồm hạn đăng ký còn mở, sắp đóng và đã đóng; một sự kiện đủ chỗ để thử danh sách chờ; một sự kiện đã qua; và hai sự kiện trùng giờ.
- Dữ liệu hạn mẫu để demo ngày 09/11/2026: CV Clinic đóng đăng ký lúc 16:30; Workshop Tư duy thiết kế đã đóng đăng ký nhưng sự kiện vẫn sắp diễn ra; Student Startup Demo Night đã đủ chỗ nhưng vẫn nhận danh sách chờ đến hạn.
- Đăng ký/check-in chỉ mô phỏng một sinh viên trên thiết bị. Danh sách chờ không đồng bộ giữa nhiều tài khoản và không tự chuyển trạng thái khi chỗ trống thay đổi.
- Thời khóa biểu do sinh viên tự nhập và chỉ lưu trên thiết bị; chưa đồng bộ với hệ thống đào tạo của trường. Ngày hiển thị theo dạng ngày/tháng/năm.
- Mã QR tĩnh để demo, chưa có chữ ký hoặc mã hết hạn.
- AI Summary chạy local theo mẫu, không gọi dịch vụ AI.
- Không có đăng nhập, backend, thanh toán hay dashboard ban tổ chức.
- Ảnh trong `assets/events` là ảnh minh họa, không phải ảnh sự kiện IUH thực tế.

## Kịch bản demo gợi ý

1. Tìm và lọc sự kiện theo danh mục/chủ đề.
2. Chuyển giữa “Sắp tới” và “Đã diễn ra”, rồi bật “Chỉ yêu thích”.
3. Đăng ký AI Career Day 2026, sau đó thử đăng ký Hội thảo định hướng nghiên cứu để xem cảnh báo trùng giờ.
4. Mở Student Startup Demo Night để vào danh sách chờ vì sự kiện đã đủ chỗ.
5. Trong tab Lịch của tôi, mở Thời khóa biểu, chọn “Ngày cụ thể”, chọn ngày 12/11/2026 và nhập giờ học trùng AI Career Day.
6. Mở sự kiện đó, thử đăng ký để xem cảnh báo giờ học; chọn quay lại hoặc tiếp tục đăng ký.
7. Mở CV Clinic trước 16:30 để xem hạn sắp đóng; chọn nhắc trước 15 phút. Nếu đăng ký lúc 16:00, thông báo sẽ đến lúc 16:15. Mở Workshop Tư duy thiết kế để thấy nút đăng ký đã khóa vì quá hạn.
8. Đăng ký một sự kiện còn chỗ, chọn nhắc giờ sự kiện và nhắc hạn đăng ký; kiểm tra cả hai nhắc trong Lịch của tôi.
9. Mở Student Startup Demo Night để vào danh sách chờ khi sự kiện đã đủ chỗ nhưng hạn đăng ký vẫn mở.
10. Hủy đăng ký để xác nhận các thông báo liên quan cũng được hủy; thử rời danh sách chờ.
11. Thử check-in khi chưa đăng ký, sau đó đăng ký Workshop Expo và React Native rồi quét mã `EVENTMATE:ev-mobile-workshop`.
12. Quét lại mã để xem trạng thái check-in trùng.
13. Mở hồ sơ, chạm các mục thống kê để xem từng danh sách sự kiện.
14. Đóng và mở lại app để xem dữ liệu local còn được giữ.
15. Mở AI Summary, nhập mục tiêu và thử cả trường hợp chưa bật consent.

## Phân công giao diện gợi ý cho 3 người

- **Người 1:** Home/Events, tìm kiếm, bộ lọc, sắp xếp và thẻ sự kiện.
- **Người 2:** chi tiết sự kiện, đăng ký, nhắc lịch và lịch cá nhân.
- **Người 3:** check-in, AI Summary, hồ sơ, điểm và lịch sử.

Các file `src/context/EventContext.tsx`, `src/types` và `App.tsx` là phần dùng chung; nên thống nhất người tích hợp trước khi cả nhóm sửa.
