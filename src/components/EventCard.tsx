import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Heart, MapPin, Clock3, ArrowUpRight } from "@tamagui/lucide-icons";
import { CategoryTag, dateLabel, eventImage, palette, registrationDeadlineLabel, registrationDeadlineState, timeLabel, ui } from "../theme/ui";
import { EventItem } from "../types/event";

type Props = {
  event: EventItem;
  favorite: boolean;
  remainingSeats?: number;
  onPress: () => void;
  onFavorite: () => void;
};

export function EventCard({ event, favorite, remainingSeats, onPress, onFavorite }: Props) {
  const pressed = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressed.value }] }));
  const seats = remainingSeats ?? Math.max(0, event.capacity - event.registered);
  const deadlineState = registrationDeadlineState(event.registrationDeadline);
  const deadlineColor = deadlineState === "closed" ? palette.pink : deadlineState === "closing" ? "#B4780A" : palette.muted;

  return <Animated.View style={[styles.card, animatedStyle]}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Xem ${event.title}`} onPress={onPress} onPressIn={() => { pressed.value = withSpring(0.985); }} onPressOut={() => { pressed.value = withSpring(1); }}>
      <Image source={eventImage(event)} style={styles.image} resizeMode="cover" />
      <View style={styles.date}><Text style={styles.dateDay}>{new Date(event.startsAt).getDate()}</Text><Text style={styles.dateMonth}>THÁNG {new Date(event.startsAt).getMonth() + 1}</Text></View>
      <View style={styles.content}>
        <CategoryTag category={event.category} /><Text style={styles.title}>{event.title}</Text>
        <View style={[ui.row, { marginTop: 2, alignItems: "flex-start" }]}><MapPin size={16} color={palette.green} /><Text style={styles.location}>{event.location}</Text></View>
        <View style={[ui.row, { marginTop: 4 }]}><Clock3 size={14} color={palette.muted} /><Text style={ui.muted}>{timeLabel(event.startsAt)} · {dateLabel(event.startsAt)}</Text></View>
        <Text style={{ marginTop: 5, fontSize: 12, lineHeight: 18, color: deadlineColor, fontWeight: deadlineState === "closing" || deadlineState === "closed" ? "700" : "500" }}>{registrationDeadlineLabel(event.registrationDeadline)}</Text>
        <View style={styles.bottom}><Text style={{ fontSize: 12, color: seats > 0 ? palette.green : palette.pink, fontWeight: "600" }}>{seats > 0 ? `Còn ${seats} chỗ` : "Hết chỗ · Có danh sách chờ"}</Text><View style={ui.row}><Text style={{ color: palette.blue, fontWeight: "700", fontSize: 12 }}>Chi tiết</Text><ArrowUpRight size={15} color={palette.blue} /></View></View>
      </View>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel={favorite ? "Bỏ yêu thích" : "Yêu thích sự kiện"} onPress={onFavorite} style={styles.favorite} hitSlop={6}><Heart size={18} color={favorite ? palette.pink : palette.ink} fill={favorite ? palette.pink : "transparent"} /></Pressable>
  </Animated.View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1, borderColor: palette.line, overflow: "hidden", marginBottom: 18 },
  image: { width: "100%", height: 152, backgroundColor: "#E5E9EF" },
  date: { position: "absolute", left: 14, top: 14, width: 52, height: 58, backgroundColor: "#FFFFFF", borderRadius: 6, justifyContent: "center", alignItems: "center" },
  dateDay: { color: palette.ink, fontSize: 23, fontWeight: "800" },
  dateMonth: { color: palette.muted, fontSize: 8, fontWeight: "700", marginTop: 1 },
  favorite: { position: "absolute", right: 14, top: 14, width: 36, height: 36, borderRadius: 18, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
  content: { padding: 16 },
  title: { fontSize: 18, lineHeight: 25, color: palette.ink, fontWeight: "700", marginTop: 9, marginBottom: 6 },
  location: { flex: 1, fontSize: 14, lineHeight: 20, color: "#454B56", fontWeight: "500" },
  bottom: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: palette.line, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }
});
