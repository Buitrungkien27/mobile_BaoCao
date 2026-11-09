import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Award, Heart, CheckCircle2, CalendarDays, Star } from "@tamagui/lucide-icons";
import { Screen } from "../components/Screen";
import { useEventContext } from "../context/EventContext";
import { seedEvents } from "../data/events";
import { dateLabel, Heading, palette, ui } from "../theme/ui";

export function ProfileScreen({ navigation }: any) {
  const { studentId, favoriteIds, registrations, checkedInIds, checkInHistory } = useEventContext();
  const translateX = useSharedValue(0);
  const points = useMemo(
    () => registrations.filter((item) => item.status === "confirmed").length * 5 + checkedInIds.length * 15 + favoriteIds.length * 2,
    [registrations, checkedInIds.length, favoriteIds.length]
  );
  const nextBadgePoints = points < 25 ? 25 : points < 60 ? 60 : 100;
  const progress = Math.min(100, Math.round((points / nextBadgePoints) * 100));
  const badge = points >= 60 ? "Ngôi sao sự kiện" : points >= 25 ? "Thành viên tích cực" : "Người mới";
  const recentCheckIns = useMemo(() => [...checkInHistory]
    .sort((a, b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt))
    .slice(0, 3)
    .map((record) => ({ ...record, event: seedEvents.find((event) => event.id === record.eventId) }))
    .filter((record) => Boolean(record.event)), [checkInHistory]);
  const gesture = Gesture.Pan().onUpdate((event) => { translateX.value = Math.max(-70, Math.min(event.translationX, 70)); }).onEnd(() => { translateX.value = withSpring(0); });
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  return <Screen scroll>
    <Heading title="Hồ sơ của tôi" subtitle="Hành trình trải nghiệm của bạn." />
    <View style={[ui.row, { gap: 16, paddingVertical: 8 }]}><View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#E7F5EF", justifyContent: "center", alignItems: "center" }}><Text style={{ fontSize: 24, fontWeight: "800", color: palette.green }}>SV</Text></View><View><Text style={ui.sectionTitle}>Sinh viên IUH</Text><Text style={ui.muted}>MSSV {studentId}</Text></View></View>
    <View style={ui.divider} />
    <View style={{ padding: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: palette.line, borderRadius: 8, marginBottom: 10 }}>
      <View style={[ui.row, { justifyContent: "space-between" }]}><View style={ui.row}><Star size={19} color="#B4780A" /><Text style={[ui.body, { fontWeight: "700" }]}>Điểm hoạt động</Text></View><Text style={{ fontSize: 23, fontWeight: "800", color: "#B4780A" }}>{points}</Text></View>
      <Text style={[ui.muted, { marginTop: 6 }]}>Đăng ký +5 · Check-in +15 · Yêu thích +2</Text>
    </View>
    {[{ key: "favorites", label: "Sự kiện yêu thích", count: favoriteIds.length, icon: <Heart size={20} color={palette.pink} /> }, { key: "registered", label: "Sự kiện đã đăng ký", count: registrations.filter((item) => item.status === "confirmed").length, icon: <CalendarDays size={20} color={palette.blue} /> }, { key: "waitlisted", label: "Đang trong danh sách chờ", count: registrations.filter((item) => item.status === "waitlisted").length, icon: <CalendarDays size={20} color="#B4780A" /> }, { key: "attended", label: "Sự kiện đã tham gia", count: checkedInIds.length, icon: <CheckCircle2 size={20} color={palette.green} /> }].map((item) => <Pressable key={item.label} accessibilityRole="button" onPress={() => navigation.navigate("MyEvents", { collection: item.key })} style={[ui.row, { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: palette.line }]}>{item.icon}<Text style={[ui.body, { flex: 1, marginLeft: 6 }]}>{item.label}</Text><Text style={{ fontSize: 19, color: palette.ink, fontWeight: "700" }}>{item.count}</Text><Text style={{ color: palette.muted, fontSize: 20, marginLeft: 8 }}>›</Text></Pressable>)}
    <Text style={[ui.sectionTitle, { marginTop: 28 }]}>Huy hiệu của bạn</Text>
    <View style={{ alignItems: "center", paddingVertical: 24 }}><GestureDetector gesture={gesture}><Animated.View accessibilityLabel={`Huy hiệu ${badge}, ${points} điểm`} style={[{ width: 136, height: 136, borderRadius: 68, backgroundColor: "#FFF4DB", justifyContent: "center", alignItems: "center", gap: 8 }, animatedStyle]}><Award size={40} color="#B4780A" /><Text style={{ fontSize: 20, color: palette.ink, fontWeight: "800", textAlign: "center" }}>{badge}</Text></Animated.View></GestureDetector><Text style={[ui.body, { fontWeight: "700", marginTop: 14 }]}>{points}/{nextBadgePoints} điểm đến huy hiệu tiếp theo</Text><View style={{ width: "100%", height: 6, backgroundColor: palette.line, borderRadius: 3, marginTop: 16 }}><View style={{ width: `${progress}%`, height: 6, backgroundColor: palette.green, borderRadius: 3 }} /></View></View>
    <Text style={[ui.sectionTitle, { marginTop: 8, marginBottom: 12 }]}>Lịch sử check-in</Text>
    {recentCheckIns.length === 0 ? <Text style={[ui.muted, { marginBottom: 18 }]}>Check-in sự kiện đã tham gia để tạo lịch sử tại đây.</Text> : recentCheckIns.map((item) => <View key={item.eventId} style={[ui.row, { justifyContent: "space-between", paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: palette.line }]}><Text style={[ui.body, { flex: 1 }]}>{item.event?.title}</Text><Text style={ui.muted}>{dateLabel(item.checkedAt)}</Text></View>)}
    <Text style={[ui.muted, { textAlign: "center", marginTop: 18 }]}>EventMate · Nhóm 19</Text>
  </Screen>;
}
