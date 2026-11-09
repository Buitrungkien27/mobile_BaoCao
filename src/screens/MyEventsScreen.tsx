import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { EventCard } from "../components/EventCard";
import { Screen } from "../components/Screen";
import { StateView } from "../components/StateView";
import { useEventContext } from "../context/EventContext";
import { seedEvents } from "../data/events";
import { RootStackParamList } from "../types/navigation";
import { Heading, palette } from "../theme/ui";

type Props = NativeStackScreenProps<RootStackParamList, "MyEvents">;
type Collection = NonNullable<RootStackParamList["MyEvents"]>["collection"];

const collections: Array<{ key: Collection; label: string }> = [
  { key: "favorites", label: "Yêu thích" },
  { key: "registered", label: "Đã đăng ký" },
  { key: "waitlisted", label: "Đang chờ" },
  { key: "attended", label: "Đã tham gia" }
];

export function MyEventsScreen({ route, navigation }: Props) {
  const [selected, setSelected] = useState<Collection>(route.params.collection);
  const { favoriteIds, registrations, checkedInIds, toggleFavorite, getRemainingSeats } = useEventContext();

  const items = useMemo(() => {
    const registeredIds = registrations
      .filter((registration) => selected === "waitlisted" ? registration.status === "waitlisted" : registration.status === "confirmed")
      .map((registration) => registration.eventId);
    const ids = selected === "favorites" ? favoriteIds : selected === "attended" ? checkedInIds : registeredIds;
    return seedEvents.filter((event) => ids.includes(event.id))
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  }, [selected, favoriteIds, registrations, checkedInIds]);

  const activeLabel = collections.find((item) => item.key === selected)?.label ?? "Sự kiện của tôi";

  return <Screen scroll>
    <Heading title="Sự kiện của tôi" subtitle={`Danh sách ${activeLabel.toLocaleLowerCase()}.`} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 16 }}>
      {collections.map((item) => {
        const active = item.key === selected;
        return <Pressable key={item.key} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => setSelected(item.key)} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: active ? palette.blue : "#FFFFFF", borderWidth: 1, borderColor: active ? palette.blue : palette.line }}>
          <Text style={{ color: active ? "#FFFFFF" : palette.ink, fontSize: 12, fontWeight: "700" }}>{item.label}</Text>
        </Pressable>;
      })}
    </ScrollView>
    {items.length === 0 ? <StateView title={`Chưa có sự kiện ${activeLabel.toLocaleLowerCase()}`} message="Khi bạn lưu, đăng ký hoặc tham gia sự kiện, danh sách sẽ xuất hiện ở đây." actionLabel="Khám phá sự kiện" onAction={() => navigation.navigate("MainTabs", { screen: "Events" })} /> : <View>
      {items.map((event) => <EventCard
        key={event.id}
        event={event}
        favorite={favoriteIds.includes(event.id)}
        remainingSeats={getRemainingSeats(event.id)}
        onPress={() => navigation.navigate("EventDetail", { eventId: event.id })}
        onFavorite={() => toggleFavorite(event.id)}
      />)}
    </View>}
  </Screen>;
}
