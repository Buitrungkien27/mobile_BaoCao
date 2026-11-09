import { useMemo, useState } from "react";
import { Alert, FlatList, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Plus, Trash2, UserRoundX } from "@tamagui/lucide-icons";
import { Screen } from "../components/Screen";
import { StateView } from "../components/StateView";
import { seedEvents } from "../data/events";
import { ClassScheduleItem, EventItem, Registration } from "../types/event";
import { useEventContext } from "../context/EventContext";
import { dateLabel, eventImage, Heading, palette, timeLabel, ui } from "../theme/ui";

type ScheduleScope = "upcoming" | "past";
type ScheduleTab = "events" | "classes";

const weekdays = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateKey(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function ScheduleScreen({ navigation }: any) {
  const [tab, setTab] = useState<ScheduleTab>("events");
  const [scope, setScope] = useState<ScheduleScope>("upcoming");
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassScheduleItem | null>(null);
  const [subject, setSubject] = useState("");
  const [weekday, setWeekday] = useState(1);
  const [repeat, setRepeat] = useState<"weekly" | "one-time">("weekly");
  const [classDate, setClassDate] = useState(() => dateKey(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [startsAt, setStartsAt] = useState("07:00");
  const [endsAt, setEndsAt] = useState("09:30");
  const [location, setLocation] = useState("");
  const {
    registrations,
    checkedInIds,
    cancelRegistration,
    classSchedule,
    saveClassScheduleItem,
    removeClassScheduleItem
  } = useEventContext();

  const schedule = useMemo(() => registrations
    .map((registration) => ({
      registration,
      event: seedEvent(registration.eventId)
    }))
    .filter((item): item is { registration: Registration; event: EventItem } => Boolean(item.event))
    .filter(({ event }) => scope === "upcoming" ? Date.parse(event.endsAt) >= Date.now() : Date.parse(event.endsAt) < Date.now())
    .sort((a, b) => scope === "upcoming"
      ? Date.parse(a.event.startsAt) - Date.parse(b.event.startsAt)
      : Date.parse(b.event.startsAt) - Date.parse(a.event.startsAt)),
  [registrations, scope]);

  const sortedClasses = useMemo(() => [...classSchedule].sort((a, b) =>
    a.weekday - b.weekday || timeToMinutes(a.startsAt) - timeToMinutes(b.startsAt)
  ), [classSchedule]);

  function openClassForm(item?: ClassScheduleItem) {
    setEditingItem(item ?? null);
    setSubject(item?.subject ?? "");
    setWeekday(item?.weekday ?? 1);
    const nextDate = item?.date ?? dateKey(new Date());
    setRepeat(item?.repeat ?? "weekly");
    setClassDate(nextDate);
    setCalendarMonth(() => {
      const selectedDate = parseDateKey(nextDate);
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    });
    setStartsAt(item?.startsAt ?? "07:00");
    setEndsAt(item?.endsAt ?? "09:30");
    setLocation(item?.location ?? "");
    setFormVisible(true);
  }

  function saveClass() {
    const normalizedStart = startsAt.trim();
    const normalizedEnd = endsAt.trim();
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!subject.trim()) {
      Alert.alert("Thiếu tên môn học", "Nhập tên môn học trước khi lưu.");
      return;
    }
    if (!timePattern.test(normalizedStart) || !timePattern.test(normalizedEnd)) {
      Alert.alert("Giờ chưa đúng", "Nhập giờ theo định dạng 07:00 hoặc 09:30.");
      return;
    }
    if (timeToMinutes(normalizedStart) >= timeToMinutes(normalizedEnd)) {
      Alert.alert("Khoảng giờ chưa đúng", "Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    saveClassScheduleItem({
      id: editingItem?.id ?? `class-${Date.now()}`,
      subject: subject.trim(),
      repeat,
      date: repeat === "one-time" ? classDate : undefined,
      weekday: repeat === "one-time" ? parseDateKey(classDate).getDay() : weekday,
      startsAt: normalizedStart,
      endsAt: normalizedEnd,
      location: location.trim()
    });
    setFormVisible(false);
  }

  function confirmDelete(item: ClassScheduleItem) {
    Alert.alert("Xóa giờ học?", `Xóa ${item.subject} khỏi thời khóa biểu?`, [
      { text: "Giữ lại", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => removeClassScheduleItem(item.id) }
    ]);
  }

  const tabButton = (value: ScheduleTab, label: string) => {
    const active = tab === value;
    return <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => setTab(value)} style={{ flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: active ? palette.blue : "#FFFFFF", borderWidth: 1, borderColor: active ? palette.blue : palette.line }}>
      <Text style={{ color: active ? "#FFFFFF" : palette.ink, fontSize: 13, fontWeight: "700" }}>{label}</Text>
    </Pressable>;
  };

  const scopeButton = (value: ScheduleScope, label: string) => (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: scope === value }} onPress={() => setScope(value)} style={{ flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 8, backgroundColor: scope === value ? palette.blue : "#FFFFFF", borderWidth: 1, borderColor: scope === value ? palette.blue : palette.line }}>
      <Text style={{ color: scope === value ? "#FFFFFF" : palette.ink, fontSize: 13, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );

  const calendarCells: Array<number | null> = [
    ...Array.from({ length: calendarMonth.getDay() }, () => null),
    ...Array.from({ length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate() }, (_, index) => index + 1)
  ];

  return <Screen>
    <Heading title="Lịch của tôi" subtitle={tab === "events" ? `${registrations.length} sự kiện đã đăng ký hoặc chờ` : "Quản lý giờ học để tránh trùng lịch sự kiện."} action={<CalendarDays size={23} color={palette.blue} />} />
    <View style={[ui.row, { marginBottom: 16 }]}>
      {tabButton("events", "Sự kiện đã đăng ký")}
      {tabButton("classes", "Thời khóa biểu")}
    </View>

    {tab === "events" ? <>
      <View style={[ui.row, { marginBottom: 16 }]}>{scopeButton("upcoming", "Sắp tới")}{scopeButton("past", "Đã qua")}</View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={schedule}
        keyExtractor={({ event }) => event.id}
        ListEmptyComponent={<StateView title={scope === "upcoming" ? "Chưa có sự kiện sắp tới" : "Chưa có lịch sử tham dự"} message={scope === "upcoming" ? "Đăng ký một sự kiện hoặc tham gia danh sách chờ để xem lịch ở đây." : "Sự kiện đã qua sẽ được lưu tại đây."} actionLabel={scope === "upcoming" ? "Khám phá sự kiện" : undefined} onAction={scope === "upcoming" ? () => navigation.navigate("Events") : undefined} />}
        renderItem={({ item }) => {
          const waiting = item.registration.status === "waitlisted";
          const checkedIn = checkedInIds.includes(item.event.id);
          const reminderLabel = item.registration.reminderMinutes === null ? "Không nhắc lịch"
            : item.registration.reminderMinutes === 1440 ? "Nhắc trước 1 ngày"
            : item.registration.reminderMinutes === 60 ? "Nhắc trước 1 giờ"
            : "Nhắc trước 15 phút";
          const deadlineReminderLabel = item.registration.deadlineReminderMinutes === 15 ? "Nhắc hạn trước 15 phút"
            : item.registration.deadlineReminderMinutes === 1440 ? "Nhắc hạn trước 1 ngày"
            : item.registration.deadlineReminderMinutes === 120 ? "Nhắc hạn trước 2 giờ"
            : null;
          return <View style={{ backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1, borderColor: palette.line, marginBottom: 14, padding: 14, gap: 12 }}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Xem ${item.event.title}`} onPress={() => navigation.navigate("EventDetail", { eventId: item.event.id })} style={[ui.row, { alignItems: "flex-start", gap: 14 }]}>
              <Image source={eventImage(item.event)} style={{ width: 76, height: 82, borderRadius: 6 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, lineHeight: 22, fontWeight: "700", color: palette.ink }}>{item.event.title}</Text>
                <Text style={[ui.muted, { marginTop: 6 }]}>{dateLabel(item.event.startsAt)} · {timeLabel(item.event.startsAt)}</Text>
                <Text style={ui.muted}>{item.event.location}</Text>
              </View>
            </Pressable>
            <View style={[ui.row, { flexWrap: "wrap", justifyContent: "space-between" }]}>
              <View style={ui.row}>
                {waiting ? <Clock3 size={15} color="#B4780A" /> : <CheckCircle2 size={15} color={checkedIn ? palette.green : palette.blue} />}
                <Text style={{ fontSize: 12, color: waiting ? "#B4780A" : checkedIn ? palette.green : palette.blue }}>{waiting ? "Đang trong danh sách chờ" : checkedIn ? "Đã check-in" : "Đã đăng ký · Chờ check-in"}</Text>
              </View>
              {!waiting ? <Text style={ui.muted}>{reminderLabel}</Text> : null}
            </View>
            {deadlineReminderLabel ? <Text style={[ui.muted, { color: palette.green }]}>{deadlineReminderLabel}</Text> : null}
            {!checkedIn && (scope === "upcoming" || waiting) ? <Pressable accessibilityRole="button" accessibilityLabel={waiting ? "Rời danh sách chờ" : "Hủy đăng ký"} onPress={() => confirmCancel(item, cancelRegistration)} style={[ui.row, { justifyContent: "center", paddingVertical: 9, borderRadius: 7, backgroundColor: "#FFF1F3" }]}>
              <UserRoundX size={16} color={palette.pink} />
              <Text style={{ color: palette.pink, fontWeight: "700", fontSize: 12 }}>{waiting ? "Rời danh sách chờ" : "Hủy đăng ký"}</Text>
            </Pressable> : null}
          </View>;
        }}
      />
    </> : <View style={{ flex: 1 }}>
      <View style={[ui.row, { justifyContent: "space-between", marginBottom: 12 }]}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={ui.sectionTitle}>Thời khóa biểu</Text>
          <Text style={[ui.muted, { marginTop: 2 }]}>Thêm giờ học lặp hằng tuần hoặc chọn một ngày cụ thể.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => openClassForm()} style={[ui.row, { backgroundColor: palette.blue, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 8 }]}>
          <Plus size={17} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>Thêm giờ học</Text>
        </Pressable>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={sortedClasses}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<StateView title="Chưa có giờ học" message="Thêm giờ học trong tuần hoặc một ngày cụ thể. Khi mở sự kiện, app sẽ báo nếu bị trùng lịch." actionLabel="Thêm giờ học" onAction={() => openClassForm()} />}
        renderItem={({ item }) => <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: palette.line, borderRadius: 9, marginBottom: 11, padding: 14, gap: 12 }}>
          <View style={{ width: 50, minHeight: 52, borderRadius: 8, backgroundColor: "#EBF2FF", justifyContent: "center", alignItems: "center", paddingHorizontal: 4 }}>
            <Text style={{ color: palette.blue, fontSize: 12, fontWeight: "800", textAlign: "center" }}>{weekdays[item.weekday]}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Sửa ${item.subject}`} onPress={() => openClassForm(item)} style={{ flex: 1 }}>
            <Text style={{ color: palette.ink, fontSize: 15, fontWeight: "700" }}>{item.subject}</Text>
            <Text style={[ui.muted, { marginTop: 4 }]}>{item.repeat === "one-time" && item.date ? `${formatDateKey(item.date)} · ` : ""}{item.startsAt}–{item.endsAt}{item.location ? ` · ${item.location}` : ""}</Text>
            <Text style={{ color: palette.blue, fontSize: 11, fontWeight: "600", marginTop: 4 }}>Chạm để sửa</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Xóa ${item.subject}`} onPress={() => confirmDelete(item)} hitSlop={8} style={{ padding: 8 }}>
            <Trash2 size={18} color={palette.pink} />
          </Pressable>
        </View>}
      />
    </View>}

    <Modal transparent visible={formVisible} animationType="slide" onRequestClose={() => setFormVisible(false)}>
      <View style={{ flex: 1, backgroundColor: "rgba(20,24,32,0.45)", justifyContent: "center", padding: 20 }}>
        <View style={{ maxHeight: "92%", backgroundColor: "#FFFFFF", borderRadius: 14, overflow: "hidden" }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18, gap: 12 }}>
          <Text style={ui.sectionTitle}>{editingItem ? "Sửa giờ học" : "Thêm giờ học"}</Text>
          <TextInput accessibilityLabel="Tên môn học" value={subject} onChangeText={setSubject} placeholder="Tên môn học, ví dụ: Lập trình di động" placeholderTextColor={palette.muted} style={ui.input} />
          <Text style={[ui.body, { fontWeight: "700" }]}>Lịch học diễn ra</Text>
          <View style={[ui.row, { flexWrap: "wrap" }]}>
            {([{ key: "weekly", label: "Lặp hằng tuần" }, { key: "one-time", label: "Chọn ngày cụ thể" }] as const).map((option) => {
              const selected = repeat === option.key;
              return <Pressable key={option.key} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => setRepeat(option.key)} style={{ flex: 1, alignItems: "center", paddingHorizontal: 8, paddingVertical: 10, borderRadius: 8, backgroundColor: selected ? palette.blue : "#FFFFFF", borderWidth: 1, borderColor: selected ? palette.blue : palette.line }}>
                <Text style={{ color: selected ? "#FFFFFF" : palette.ink, fontSize: 12, fontWeight: "700" }}>{option.label}</Text>
              </Pressable>;
            })}
          </View>
          {repeat === "weekly" ? <>
            <Text style={[ui.body, { fontWeight: "700" }]}>Chọn thứ trong tuần</Text>
            <View style={[ui.row, { flexWrap: "wrap" }]}>
              {weekdays.map((label, index) => {
                const selected = weekday === index;
                return <Pressable key={label} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => setWeekday(index)} style={{ minWidth: 68, alignItems: "center", paddingHorizontal: 9, paddingVertical: 9, borderRadius: 8, backgroundColor: selected ? palette.blue : "#FFFFFF", borderWidth: 1, borderColor: selected ? palette.blue : palette.line }}>
                  <Text style={{ color: selected ? "#FFFFFF" : palette.ink, fontSize: 12, fontWeight: "700" }}>{label}</Text>
                </Pressable>;
              })}
            </View>
          </> : <View style={{ padding: 12, borderRadius: 9, borderWidth: 1, borderColor: palette.line, gap: 10 }}>
            <View style={[ui.row, { justifyContent: "space-between" }]}>
              <Pressable accessibilityRole="button" accessibilityLabel="Tháng trước" onPress={() => setCalendarMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))} hitSlop={8} style={{ padding: 6 }}><ChevronLeft size={20} color={palette.blue} /></Pressable>
              <Text style={[ui.body, { fontWeight: "700", textTransform: "capitalize" }]}>{calendarMonth.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Tháng tiếp theo" onPress={() => setCalendarMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))} hitSlop={8} style={{ padding: 6 }}><ChevronRight size={20} color={palette.blue} /></Pressable>
            </View>
            <View style={[ui.row, { justifyContent: "space-around" }]}>{["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((label) => <Text key={label} style={{ width: "13%", textAlign: "center", color: palette.muted, fontSize: 11, fontWeight: "700" }}>{label}</Text>)}</View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {calendarCells.map((day, index) => {
                if (day === null) return <View key={`empty-${index}`} style={{ width: "14.28%", height: 38 }} />;
                const value = dateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
                const selected = value === classDate;
                return <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setClassDate(value)} style={{ width: "14.28%", height: 38, alignItems: "center", justifyContent: "center" }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: selected ? palette.blue : "transparent" }}><Text style={{ color: selected ? "#FFFFFF" : palette.ink, fontSize: 13, fontWeight: selected ? "800" : "500" }}>{day}</Text></View>
                </Pressable>;
              })}
            </View>
            <Text style={[ui.muted, { textAlign: "center" }]}>Ngày đã chọn: {formatDateKey(classDate)}</Text>
          </View>}
          <View style={[ui.row, { gap: 10 }]}>
            <View style={{ flex: 1, gap: 5 }}><Text style={ui.muted}>Giờ bắt đầu</Text><TextInput accessibilityLabel="Giờ bắt đầu" value={startsAt} onChangeText={setStartsAt} placeholder="07:00" keyboardType="numbers-and-punctuation" maxLength={5} style={ui.input} /></View>
            <View style={{ flex: 1, gap: 5 }}><Text style={ui.muted}>Giờ kết thúc</Text><TextInput accessibilityLabel="Giờ kết thúc" value={endsAt} onChangeText={setEndsAt} placeholder="09:30" keyboardType="numbers-and-punctuation" maxLength={5} style={ui.input} /></View>
          </View>
          <TextInput accessibilityLabel="Phòng học" value={location} onChangeText={setLocation} placeholder="Phòng học (không bắt buộc)" placeholderTextColor={palette.muted} style={ui.input} />
          <Text style={ui.muted}>{repeat === "weekly" ? "Ngày học được lặp lại mỗi tuần." : "Giờ học chỉ áp dụng cho ngày đã chọn."} Lịch chỉ lưu trên thiết bị này.</Text>
          <Pressable accessibilityRole="button" onPress={saveClass} style={{ minHeight: 48, alignItems: "center", justifyContent: "center", backgroundColor: palette.blue, borderRadius: 8 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>{editingItem ? "Lưu thay đổi" : "Thêm vào thời khóa biểu"}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setFormVisible(false)} style={{ minHeight: 40, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: palette.muted, fontSize: 13, fontWeight: "600" }}>Đóng</Text>
          </Pressable>
        </ScrollView>
      </View>
      </View>
    </Modal>
  </Screen>;
}

function seedEvent(eventId: string) {
  return seedEvents.find((item) => item.id === eventId);
}

function confirmCancel(item: { event: EventItem; registration: Registration }, cancelRegistration: (eventId: string) => Promise<void>) {
  const waiting = item.registration.status === "waitlisted";
  Alert.alert(
    waiting ? "Rời danh sách chờ?" : "Hủy đăng ký?",
    waiting ? `Bạn sẽ rời danh sách chờ của ${item.event.title}.` : `Bạn sẽ hủy đăng ký ${item.event.title}.`,
    [
      { text: "Giữ lại", style: "cancel" },
      { text: waiting ? "Rời danh sách" : "Hủy đăng ký", style: "destructive", onPress: () => { void cancelRegistration(item.event.id); } }
    ]
  );
}
