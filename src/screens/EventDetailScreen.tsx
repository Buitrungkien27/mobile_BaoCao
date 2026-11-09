import { useEffect, useState } from "react";
import { Image, Pressable, Switch, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CalendarDays, MapPin, Sparkles } from "@tamagui/lucide-icons";
import { Screen } from "../components/Screen";
import { StateView } from "../components/StateView";
import { fetchEventById } from "../services/eventApi";
import { EventItem } from "../types/event";
import { RootStackParamList } from "../types/navigation";
import { useEventContext } from "../context/EventContext";
import { ActionButton, CategoryTag, dateLabel, eventImage, palette, registrationDeadlineLabel, registrationDeadlineState, timeLabel, ui } from "../theme/ui";

type Props = NativeStackScreenProps<RootStackParamList, "EventDetail">;
const reminderChoices = [
  { minutes: null, label: "Tắt" },
  { minutes: 15, label: "15 phút" },
  { minutes: 60, label: "1 giờ" },
  { minutes: 1440, label: "1 ngày" }
];
const deadlineReminderChoices = [
  { minutes: null, label: "Tắt" },
  { minutes: 15, label: "Trước 15 phút" },
  { minutes: 1440, label: "Trước 1 ngày" },
  { minutes: 120, label: "Trước 2 giờ" }
];

export function EventDetailScreen({ route, navigation }: Props) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(60);
  const [deadlineReminderMinutes, setDeadlineReminderMinutes] = useState<number | null>(120);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [showConflictPrompt, setShowConflictPrompt] = useState(false);
  const { registerEvent, getRegistration, getRemainingSeats, getScheduleConflicts, getClassConflicts } = useEventContext();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchEventById(route.params.eventId)
      .then((value) => { if (active) setEvent(value); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Chưa tải được sự kiện."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [route.params.eventId]);

  async function register(force = false) {
    if (!event || busy) return;
    const conflicts = getScheduleConflicts(event.id);
    const classTimeConflicts = getClassConflicts(event.id);
    if (!force && (conflicts.length > 0 || classTimeConflicts.length > 0)) {
      setShowConflictPrompt(true);
      return;
    }
    setShowConflictPrompt(false);
    setBusy(true);
    setNotice("");
    try {
      const result = await registerEvent(event.id, reminderMinutes, deadlineReminderMinutes);
      let message: string;
      if (result.status === "waitlisted") {
        message = "Sự kiện đã đủ chỗ. Bạn đã được thêm vào danh sách chờ.";
      } else if (result.reminder === "permission-denied") {
        message = "Đã đăng ký. Bạn chưa cấp quyền thông báo nên chưa đặt được nhắc giờ sự kiện.";
      } else if (result.reminder === "too-late") {
        message = "Đã đăng ký. Thời điểm nhắc giờ sự kiện đã qua.";
      } else if (result.reminder === "unavailable") {
        message = "Đã đăng ký. Thiết bị hiện không hỗ trợ thông báo cục bộ.";
      } else {
        message = result.reminder === "scheduled" ? "Đã đăng ký và đặt nhắc giờ sự kiện." : "Đã thêm sự kiện vào lịch của bạn.";
      }
      if (result.deadlineReminder === "scheduled") message += " Đã đặt nhắc trước hạn đăng ký.";
      else if (result.deadlineReminder === "permission-denied") message += " Chưa có quyền thông báo để nhắc hạn đăng ký.";
      else if (result.deadlineReminder === "too-late") message += " Thời điểm nhắc hạn đã qua.";
      else if (result.deadlineReminder === "unavailable") message += " Thiết bị không hỗ trợ nhắc hạn đăng ký.";
      setNotice(message);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Chưa thể đăng ký.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <StateView loading title="Đang tải sự kiện" />;
  if (error || !event) return <StateView title="Chưa mở được sự kiện" message={error ?? "Không có dữ liệu."} />;

  const registration = getRegistration(event.id);
  const scheduleConflicts = getScheduleConflicts(event.id);
  const classConflicts = getClassConflicts(event.id);
  const hasScheduleConflict = scheduleConflicts.length > 0 || classConflicts.length > 0;
  const showConflictWarning = hasScheduleConflict && (showConflictPrompt || Boolean(registration));
  const remainingSeats = getRemainingSeats(event.id);
  const registeredCount = event.capacity - remainingSeats;
  const isPast = Date.parse(event.endsAt) < Date.now();
  const isRegistrationOpen = Date.parse(event.registrationDeadline) > Date.now() && !isPast;
  const deadlineState = registrationDeadlineState(event.registrationDeadline);
  const deadlineColor = deadlineState === "closed" ? palette.pink : deadlineState === "closing" ? "#B4780A" : palette.green;
  const isWaitlisted = registration?.status === "waitlisted";
  const isConfirmed = registration?.status === "confirmed";
  const buttonLabel = isConfirmed ? "Đã đăng ký thành công"
    : isWaitlisted ? "Đang trong danh sách chờ"
    : isPast ? "Sự kiện đã diễn ra"
    : !isRegistrationOpen ? "Đã đóng đăng ký"
    : busy ? "Đang đăng ký..."
    : remainingSeats === 0 ? "Vào danh sách chờ" : "Đăng ký tham dự";

  return <Screen scroll>
    <Image source={eventImage(event)} style={{ width: "100%", aspectRatio: 1.7, borderRadius: 8, marginBottom: 20 }} />
    <CategoryTag category={event.category} />
    <Text style={[ui.title, { marginVertical: 12 }]}>{event.title}</Text>
    <View style={[ui.row, { marginBottom: 10 }]}><CalendarDays size={18} color={palette.blue} /><Text style={ui.body}>{dateLabel(event.startsAt)} · {timeLabel(event.startsAt)} - {timeLabel(event.endsAt)}</Text></View>
    <View style={ui.row}><MapPin size={18} color={palette.green} /><Text style={[ui.body, { flex: 1 }]}>{event.location}</Text></View>
    <View style={{ padding: 13, marginTop: 14, backgroundColor: deadlineState === "closed" ? "#FFF1F3" : deadlineState === "closing" ? "#FFF5DD" : "#E7F5EF", borderRadius: 8 }}>
      <Text style={[ui.body, { fontWeight: "700", color: deadlineColor }]}>Hạn cuối đăng ký: {dateLabel(event.registrationDeadline)} · {timeLabel(event.registrationDeadline)}</Text>
      <Text style={{ marginTop: 3, fontSize: 13, lineHeight: 20, color: deadlineColor, fontWeight: "600" }}>{registrationDeadlineLabel(event.registrationDeadline)}</Text>
    </View>
    <View style={ui.divider} />
    <Text style={ui.sectionTitle}>Về sự kiện</Text><Text style={[ui.body, { marginTop: 10 }]}>{event.description}</Text>
    <View style={ui.divider} />
    <Text style={[ui.sectionTitle, { marginBottom: 14 }]}>Lịch trình</Text>
    {event.agenda.map((item, index) => <View key={item} style={[ui.row, { alignItems: "flex-start", marginBottom: 14 }]}><View style={{ width: 27, height: 27, borderRadius: 14, backgroundColor: "#EAF1FF", alignItems: "center", justifyContent: "center" }}><Text style={{ color: palette.blue, fontSize: 12, fontWeight: "700" }}>{index + 1}</Text></View><Text style={[ui.body, { flex: 1 }]}>{item}</Text></View>)}
    <Text style={[ui.sectionTitle, { marginTop: 8, marginBottom: 10 }]}>Diễn giả</Text>
    {event.speakers.map((speaker) => <Text key={speaker} style={[ui.body, { marginBottom: 6 }]}>{speaker}</Text>)}
    <View style={ui.divider} />

    {!registration && isRegistrationOpen && remainingSeats > 0 ? <>
      <Text style={[ui.body, { fontWeight: "700", marginBottom: 8 }]}>Nhắc lịch trước sự kiện</Text>
      <View style={[ui.row, { flexWrap: "wrap", marginBottom: 8 }]}>
        {reminderChoices.map((choice) => {
          const selected = reminderMinutes === choice.minutes;
          return <Pressable key={choice.label} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => setReminderMinutes(choice.minutes)} style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, backgroundColor: selected ? palette.blue : "#FFFFFF", borderWidth: 1, borderColor: selected ? palette.blue : palette.line }}>
            <Text style={{ color: selected ? "#FFFFFF" : palette.ink, fontSize: 12, fontWeight: "700" }}>{choice.label}</Text>
          </Pressable>;
        })}
      </View>
      <Text style={[ui.muted, { marginBottom: 12 }]}>Nhắc lịch được lên theo giờ bắt đầu của sự kiện.</Text>
    </> : null}
    {!registration && isRegistrationOpen ? <>
      <Text style={[ui.body, { fontWeight: "700", marginBottom: 8 }]}>Nhắc trước hạn đăng ký</Text>
      <View style={[ui.row, { flexWrap: "wrap", marginBottom: 8 }]}>
        {deadlineReminderChoices.map((choice) => {
          const selected = deadlineReminderMinutes === choice.minutes;
          return <Pressable key={choice.label} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => setDeadlineReminderMinutes(choice.minutes)} style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, backgroundColor: selected ? palette.blue : "#FFFFFF", borderWidth: 1, borderColor: selected ? palette.blue : palette.line }}>
            <Text style={{ color: selected ? "#FFFFFF" : palette.ink, fontSize: 12, fontWeight: "700" }}>{choice.label}</Text>
          </Pressable>;
        })}
      </View>
      <Text style={[ui.muted, { marginBottom: 12 }]}>Thông báo sẽ nhắc trước khi hạn đăng ký đóng.</Text>
    </> : null}
    <Text style={[ui.muted, { marginBottom: 14 }]}>
      {registeredCount}/{event.capacity} sinh viên đã đăng ký · {remainingSeats > 0 ? `Còn ${remainingSeats} chỗ` : "Đã hết chỗ · Có danh sách chờ"}
    </Text>
    <View style={{ gap: 12 }}>
      <ActionButton label={buttonLabel} onPress={() => { void register(); }} disabled={Boolean(registration) || isPast || !isRegistrationOpen || busy} />
      {showConflictWarning ? <View style={{ padding: 14, backgroundColor: "#FFF5DD", borderRadius: 8, borderWidth: 1, borderColor: "#F0D89A", gap: 8 }}>
        {classConflicts.length > 0 ? <>
          <Text style={[ui.body, { fontWeight: "700", color: "#8B6100" }]}>{registration ? "Sự kiện này trùng với giờ học đã lưu:" : "Sự kiện bị trùng với giờ học của bạn:"}</Text>
          {classConflicts.map((item) => <Text key={item.id} style={[ui.body, { fontSize: 13 }]}>
            • {item.subject} · {item.repeat === "one-time" && item.date ? item.date.split("-").reverse().join("/") : item.weekday === 0 ? "Chủ nhật" : `Thứ ${item.weekday + 1}`} {item.startsAt}–{item.endsAt}{item.location ? ` · ${item.location}` : ""}
          </Text>)}
        </> : null}
        {scheduleConflicts.length > 0 ? <>
          <Text style={[ui.body, { fontWeight: "700", color: "#8B6100" }]}>{registration ? "Lịch cũng trùng với sự kiện khác bạn đã đăng ký:" : "Lịch này bị trùng với sự kiện bạn đã đăng ký:"}</Text>
          {scheduleConflicts.map((conflict) => <Text key={conflict.id} style={[ui.body, { fontSize: 13 }]}>
            • {conflict.title} · {dateLabel(conflict.startsAt)}, {timeLabel(conflict.startsAt)}–{timeLabel(conflict.endsAt)}
          </Text>)}
        </> : null}
        {registration ? <Text style={ui.muted}>Bạn đã đăng ký trước đó. Vào “Lịch của tôi” nếu muốn hủy đăng ký hoặc giữ lịch này.</Text> : <>
          <Text style={ui.muted}>Bạn vẫn có thể tiếp tục đăng ký nếu muốn.</Text>
          <View style={[ui.row, { flexWrap: "wrap" }]}>
            <ActionButton secondary label="Để xem lại" onPress={() => setShowConflictPrompt(false)} />
            <ActionButton label="Đăng ký vẫn tiếp tục" onPress={() => { void register(true); }} />
          </View>
        </>}
      </View> : null}
      {isWaitlisted ? <Text style={ui.muted}>Danh sách chờ được lưu cục bộ trong bản demo. Bạn có thể rời danh sách ở màn Lịch của tôi.</Text> : null}
      <ActionButton secondary label="Tóm tắt cùng AI" icon={<Sparkles size={18} color={palette.blue} />} onPress={() => navigation.navigate("AiSummary", { eventId: event.id })} />
      {notice ? <Text accessibilityLiveRegion="polite" style={[ui.muted, { color: notice.startsWith("Đã") || notice.startsWith("Sự kiện đã đủ") ? palette.green : palette.pink }]}>{notice}</Text> : null}
    </View>
  </Screen>;
}
