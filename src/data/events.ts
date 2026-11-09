import { EventItem } from "../types/event";

const initialEvents: EventItem[] = [
  {
    id: "ev-ai-career-2026",
    title: "AI Career Day 2026",
    category: "career",
    location: "Hội trường A2",
    startsAt: "2026-11-12T08:00:00+07:00",
    endsAt: "2026-11-12T11:30:00+07:00",
    registrationDeadline: "2026-11-11T23:59:00+07:00",
    capacity: 220,
    registered: 168,
    description: "Ngày hội nghề nghiệp về AI, dữ liệu và sản phẩm số dành cho sinh viên kỹ thuật phần mềm.",
    agenda: ["Keynote xu huong AI", "Panel voi cuu sinh vien", "CV clinic", "Phong van thu"],
    speakers: ["Nguyen Minh Anh - Product Lead", "Tran Hoang Nam - ML Engineer"],
    tags: ["AI", "viec lam", "networking"],
    qrCode: "EVENTMATE:ev-ai-career-2026"
  },
  {
    id: "ev-mobile-workshop",
    title: "Workshop Expo và React Native",
    category: "academic",
    location: "Phòng Lab C4.02",
    startsAt: "2026-11-14T13:30:00+07:00",
    endsAt: "2026-11-14T16:00:00+07:00",
    registrationDeadline: "2026-11-13T17:00:00+07:00",
    capacity: 80,
    registered: 61,
    description: "Cùng xây dựng ứng dụng di động với Expo, điều hướng, camera và thông báo trong buổi thực hành chuyên sâu.",
    agenda: ["Khởi tạo dự án Expo", "Xây dựng điều hướng", "Xử lý quyền camera", "Build APK demo"],
    speakers: ["Bùi Trung Kiên", "Nguyễn Trọng Hiếu"],
    tags: ["mobile", "expo", "react-native"],
    qrCode: "EVENTMATE:ev-mobile-workshop"
  },
  {
    id: "ev-club-fair",
    title: "Ngày hội câu lạc bộ sinh viên",
    category: "club",
    location: "Sân trường trung tâm",
    startsAt: "2026-11-17T07:30:00+07:00",
    endsAt: "2026-11-17T17:00:00+07:00",
    registrationDeadline: "2026-11-16T17:00:00+07:00",
    capacity: 600,
    registered: 423,
    description: "Gặp gỡ các câu lạc bộ học thuật, nghệ thuật, thể thao và tình nguyện. Tìm cộng đồng dành cho bạn.",
    agenda: ["Check-in gian hang", "Mini game", "Dang ky CLB", "Boc tham qua tang"],
    speakers: ["Doan Thanh nien", "Hoi Sinh vien"],
    tags: ["clb", "tan sinh vien", "giao luu"],
    qrCode: "EVENTMATE:ev-club-fair"
  },
  {
    id: "ev-green-campus",
    title: "Green Campus Challenge",
    category: "volunteer",
    location: "Công viên trong khuôn viên",
    startsAt: "2026-11-19T06:45:00+07:00",
    endsAt: "2026-11-19T10:00:00+07:00",
    registrationDeadline: "2026-11-18T20:00:00+07:00",
    capacity: 150,
    registered: 139,
    description: "Hoat dong don dep, phan loai rac va truyen thong song xanh trong khuon vien.",
    agenda: ["Tap trung nhom", "Phan tuyen", "Thu gom rac", "Tong ket va check-out"],
    speakers: ["CLB Moi Truong Xanh"],
    tags: ["tinh nguyen", "song xanh", "diem ren luyen"],
    qrCode: "EVENTMATE:ev-green-campus"
  },
  {
    id: "ev-security-talk",
    title: "Cyber Safety for Students",
    category: "academic",
    location: "Phòng B1.05",
    startsAt: "2026-11-03T09:00:00+07:00",
    endsAt: "2026-11-03T11:00:00+07:00",
    registrationDeadline: "2026-11-02T23:59:00+07:00",
    capacity: 120,
    registered: 73,
    description: "Chuyen de bao mat tai khoan, phishing, mat khau va cach bao ve du lieu ca nhan.",
    agenda: ["Tinh huong phishing", "Quan ly mat khau", "Bao mat 2 lop", "Hoi dap"],
    speakers: ["Le Quoc Bao - Security Analyst"],
    tags: ["security", "ky nang so"],
    qrCode: "EVENTMATE:ev-security-talk"
  },
  {
    id: "ev-startup-demo",
    title: "Student Startup Demo Night",
    category: "career",
    location: "Innovation Hub",
    startsAt: "2026-11-24T18:00:00+07:00",
    endsAt: "2026-11-24T21:00:00+07:00",
    registrationDeadline: "2026-11-23T18:00:00+07:00",
    capacity: 126,
    registered: 126,
    description: "Dem trinh dien san pham cua cac nhom sinh vien va ket noi mentor.",
    agenda: ["Pitch 5 phut", "Demo booth", "Nhan xet mentor", "Ket noi doi nhom"],
    speakers: ["Startup Center", "Mentor cong nghe"],
    tags: ["startup", "pitch", "mentor"],
    qrCode: "EVENTMATE:ev-startup-demo"
  }
];

function demoEvent(
  id: string,
  title: string,
  category: EventItem["category"],
  location: string,
  startsAt: string,
  endsAt: string,
  capacity: number,
  registered: number,
  description: string,
  agenda: string[],
  speakers: string[],
  tags: string[],
  registrationDeadline = new Date(Date.parse(startsAt) - 24 * 60 * 60 * 1000).toISOString()
): EventItem {
  return { id, title, category, location, startsAt, endsAt, registrationDeadline, capacity, registered, description, agenda, speakers, tags, qrCode: `EVENTMATE:${id}` };
}

export const seedEvents: EventItem[] = [
  ...initialEvents,
  demoEvent("ev-research-path", "Hội thảo định hướng nghiên cứu", "academic", "Phòng hội thảo A1.06", "2026-11-12T09:00:00+07:00", "2026-11-12T12:00:00+07:00", 100, 42, "Gặp giảng viên và sinh viên nghiên cứu để tìm hiểu cách chọn đề tài, đọc tài liệu và bắt đầu một dự án nghiên cứu.", ["Chọn vấn đề nghiên cứu", "Tìm và đọc tài liệu", "Chia sẻ dự án sinh viên", "Hỏi đáp với giảng viên"], ["ThS. Phạm Ngọc Hà", "Nhóm nghiên cứu IUH"], ["nghiên cứu", "học thuật"]),
  demoEvent("ev-design-thinking", "Workshop Tư duy thiết kế sản phẩm", "academic", "Phòng thực hành B2.08", "2026-11-21T08:30:00+07:00", "2026-11-21T11:30:00+07:00", 70, 39, "Thực hành tìm hiểu nhu cầu người dùng và phác thảo giải pháp qua một thử thách sản phẩm dành cho sinh viên.", ["Tìm hiểu người dùng", "Xác định vấn đề", "Phác thảo giải pháp", "Trình bày ý tưởng"], ["CLB Thiết kế IUH", "Cựu sinh viên ngành UX"], ["thiết kế", "sản phẩm"], "2026-11-08T23:59:00+07:00"),
  demoEvent("ev-career-cv", "CV Clinic: Sửa CV cùng nhà tuyển dụng", "career", "Trung tâm thư viện IUH", "2026-11-22T13:30:00+07:00", "2026-11-22T16:00:00+07:00", 60, 48, "Nhận góp ý trực tiếp để CV rõ ràng, đúng trọng tâm và phù hợp với vị trí thực tập hoặc việc làm đầu tiên.", ["Những lỗi CV phổ biến", "Góp ý CV theo nhóm", "Tối ưu hồ sơ trực tuyến", "Hỏi đáp tuyển dụng"], ["Chuyên viên nhân sự đối tác", "Trung tâm Hỗ trợ sinh viên"], ["CV", "việc làm", "thực tập"], "2026-11-09T16:30:00+07:00"),
  demoEvent("ev-volunteer-books", "Ngày hội đổi sách và sẻ chia", "volunteer", "Sảnh nhà E", "2026-11-26T08:00:00+07:00", "2026-11-26T15:00:00+07:00", 200, 87, "Mang sách còn tốt đến trao đổi, quyên góp sách cho tủ sách cộng đồng và tham gia các hoạt động gây quỹ sinh viên.", ["Tiếp nhận sách", "Đổi sách theo chủ đề", "Góc đọc cộng đồng", "Tổng kết quyên góp"], ["Đội Công tác xã hội IUH"], ["sách", "cộng đồng", "tình nguyện"]),
  demoEvent("ev-english-speaking", "English Speaking Meetup", "club", "Khu sinh hoạt sinh viên", "2026-11-28T09:00:00+07:00", "2026-11-28T11:00:00+07:00", 80, 51, "Buổi giao lưu tiếng Anh thân thiện với trò chơi nhóm và chủ đề nói chuyện dành cho mọi trình độ.", ["Làm quen theo cặp", "Trò chơi từ vựng", "Thảo luận chủ đề du lịch", "Kết nối nhóm luyện tập"], ["CLB Tiếng Anh IUH"], ["tiếng Anh", "giao lưu", "câu lạc bộ"]),
  demoEvent("ev-data-career", "Data & Analytics Career Talk", "career", "Hội trường V", "2026-12-02T13:30:00+07:00", "2026-12-02T16:30:00+07:00", 180, 112, "Tìm hiểu các vị trí phân tích dữ liệu, kỹ năng cần có và lộ trình nghề nghiệp từ chuyên gia đang làm trong ngành.", ["Một ngày làm việc với dữ liệu", "Kỹ năng nhà tuyển dụng cần", "Lộ trình học tập", "Hỏi đáp nghề nghiệp"], ["Data Analyst từ doanh nghiệp đối tác", "Cựu sinh viên IUH"], ["dữ liệu", "nghề nghiệp", "phân tích"]),
  demoEvent("ev-blood-donation", "Hiến máu tình nguyện IUH", "volunteer", "Sảnh nhà A", "2026-12-05T07:00:00+07:00", "2026-12-05T11:30:00+07:00", 240, 156, "Đăng ký tham gia ngày hội hiến máu do nhà trường phối hợp tổ chức. Sinh viên sẽ được hướng dẫn quy trình và chăm sóc sau hiến máu.", ["Đón tiếp và đăng ký", "Khám sàng lọc", "Hiến máu", "Nghỉ ngơi và nhận giấy chứng nhận"], ["Đoàn trường IUH", "Đơn vị y tế phối hợp"], ["hiến máu", "sức khỏe", "tình nguyện"]),
  demoEvent("ev-uiux-workshop", "Workshop UI/UX cho ứng dụng di động", "academic", "Phòng Lab C5.03", "2026-12-09T08:00:00+07:00", "2026-12-09T11:30:00+07:00", 55, 34, "Từ luồng thao tác đến bản mẫu giao diện: sinh viên cùng thiết kế một trải nghiệm ứng dụng dễ dùng.", ["Vẽ chân dung người dùng", "Lập luồng màn hình", "Dựng bản mẫu", "Nhận góp ý sản phẩm"], ["UI/UX Designer khách mời", "CLB Công nghệ IUH"], ["UI/UX", "di động", "thiết kế"]),
  demoEvent("ev-winter-music", "Đêm nhạc sinh viên: Giai điệu mùa đông", "club", "Sân khấu ngoài trời", "2026-12-12T18:00:00+07:00", "2026-12-12T21:00:00+07:00", 500, 321, "Đêm nhạc cuối học kỳ với các tiết mục do sinh viên biểu diễn, khu giao lưu câu lạc bộ và gian hàng gây quỹ.", ["Mở màn acoustic", "Tiết mục câu lạc bộ", "Giao lưu khán giả", "Đêm nhạc gây quỹ"], ["CLB Văn nghệ IUH", "Các ban nhạc sinh viên"], ["âm nhạc", "sinh viên", "giao lưu"]),
  demoEvent("ev-startup-idea", "Cuộc thi Ý tưởng khởi nghiệp sinh viên", "career", "Innovation Hub", "2026-12-16T08:00:00+07:00", "2026-12-16T16:00:00+07:00", 150, 93, "Các đội trình bày ý tưởng sản phẩm, nhận phản hồi từ ban giám khảo và kết nối với cố vấn khởi nghiệp.", ["Khai mạc cuộc thi", "Trình bày ý tưởng", "Góp ý từ ban giám khảo", "Công bố kết quả"], ["Trung tâm Đổi mới sáng tạo", "Cố vấn khởi nghiệp"], ["khởi nghiệp", "ý tưởng", "cuộc thi"]),
  demoEvent("ev-exam-wellness", "Ngày hội chăm sóc sức khỏe mùa thi", "volunteer", "Nhà văn hóa sinh viên", "2026-12-20T08:30:00+07:00", "2026-12-20T12:00:00+07:00", 120, 64, "Hoạt động chia sẻ cách quản lý căng thẳng, sắp xếp thời gian ôn tập và chăm sóc sức khỏe trong mùa thi.", ["Nhận diện căng thẳng", "Kỹ thuật thư giãn nhanh", "Lập kế hoạch ôn thi", "Tư vấn cùng chuyên viên"], ["Phòng Công tác sinh viên", "Chuyên viên tham vấn"], ["sức khỏe", "mùa thi", "kỹ năng"]),
  demoEvent("ev-newyear-club", "Hội chợ câu lạc bộ chào năm mới", "club", "Sân trường trung tâm", "2027-01-08T08:00:00+07:00", "2027-01-08T16:00:00+07:00", 450, 177, "Khám phá hoạt động đầu năm của các câu lạc bộ, tham gia trò chơi và đăng ký nhóm phù hợp với sở thích.", ["Mở gian hàng câu lạc bộ", "Trò chơi tập thể", "Biểu diễn ngoài trời", "Kết nối thành viên mới"], ["Hội Sinh viên IUH", "Các câu lạc bộ sinh viên"], ["câu lạc bộ", "năm mới", "giao lưu"]),
  demoEvent("ev-mobile-hackathon", "Mini Hackathon: Ứng dụng vì cộng đồng", "academic", "Phòng Lab C4.01", "2027-01-12T08:00:00+07:00", "2027-01-12T17:00:00+07:00", 90, 58, "Lập nhóm và xây dựng ý tưởng ứng dụng di động giải quyết một nhu cầu trong cộng đồng sinh viên.", ["Chọn vấn đề", "Lên ý tưởng và chia nhóm", "Phát triển bản mẫu", "Trình bày sản phẩm"], ["Giảng viên khoa Công nghệ thông tin", "Mentor sản phẩm"], ["hackathon", "mobile", "cộng đồng"]),
  demoEvent("ev-internship-fair", "Ngày hội thực tập và việc làm 2027", "career", "Nhà thi đấu IUH", "2027-01-15T08:00:00+07:00", "2027-01-15T15:00:00+07:00", 700, 402, "Gặp gỡ doanh nghiệp tuyển thực tập sinh, tìm hiểu vị trí phù hợp và nộp hồ sơ trực tiếp tại các gian hàng.", ["Khai mạc ngày hội", "Tham quan gian hàng tuyển dụng", "Phỏng vấn nhanh", "Tư vấn hồ sơ nghề nghiệp"], ["Doanh nghiệp đối tác IUH", "Trung tâm Hỗ trợ sinh viên"], ["thực tập", "việc làm", "tuyển dụng"])
];
