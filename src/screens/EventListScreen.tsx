import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Search } from "@tamagui/lucide-icons";
import { Screen } from "../components/Screen";
import { ActionButton, categories, Heading, palette, ui } from "../theme/ui";
import { EventCard } from "../components/EventCard";
import { StateView } from "../components/StateView";
import { EventSortBy, EventTimeScope, fetchEvents } from "../services/eventApi";
import { EventCategory, EventItem } from "../types/event";
import { useEventContext } from "../context/EventContext";

const filters: Array<EventCategory | "all"> = ["all", "academic", "career", "club", "volunteer"];

export function EventListScreen({ navigation }: any) {
  const [items, setItems] = useState<EventItem[]>([]);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState<number | null>(1);
  const [filter, setFilter] = useState<EventCategory | "all">("all");
  const [timeScope, setTimeScope] = useState<EventTimeScope>("upcoming");
  const [sortBy, setSortBy] = useState<EventSortBy>("date");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const requestVersion = useRef(0);
  const { favoriteIds, registrations, toggleFavorite, getRemainingSeats } = useEventContext();
  const registeredEventIds = useMemo(
    () => registrations.filter((item) => item.status === "confirmed").map((item) => item.eventId),
    [registrations]
  );

  const load = useCallback(
    async (pageToLoad: number, reset = false) => {
      const version = ++requestVersion.current;
      setLoading(true);
      setError(null);
      try {
        const response = await fetchEvents(pageToLoad, filter, query, {
          timeScope,
          sortBy,
          favoritesOnly,
          favoriteIds,
          registeredEventIds
        });
        if (version !== requestVersion.current) return;
        setItems((current) => (reset ? response.items : [...current, ...response.items]));
        setPage(pageToLoad);
        setNextPage(response.nextPage);
      } catch (err) {
        if (version !== requestVersion.current) return;
        setError(err instanceof Error ? err.message : "Có lỗi không xác định.");
      } finally {
        if (version === requestVersion.current) setLoading(false);
      }
    },
    [filter, query, timeScope, sortBy, favoritesOnly, favoriteIds, registeredEventIds]
  );

  useEffect(() => {
    setItems([]);
    load(1, true);
    return () => { requestVersion.current += 1; };
  }, [load]);

  const chipStyle = (selected: boolean) => ({
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: selected ? palette.blue : "#FFFFFF",
    borderWidth: 1,
    borderColor: selected ? palette.blue : palette.line
  });

  return (
    <Screen>
      <Heading title="Khám phá sự kiện" subtitle="Tìm sự kiện phù hợp với lịch của bạn." />
      <View style={[ui.row, { backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1, borderColor: palette.line, paddingHorizontal: 14, height: 46, marginBottom: 14 }]}>
        <Search size={18} color={palette.muted} />
        <TextInput accessibilityLabel="Tìm sự kiện" placeholder="Tên, địa điểm hoặc chủ đề..." placeholderTextColor={palette.muted} value={query} onChangeText={setQuery} style={{ flex: 1, fontSize: 14, color: palette.ink, height: 44 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: 50, maxHeight: 50, flexGrow: 0, flexShrink: 0, marginBottom: 2 }}
        contentContainerStyle={{ gap: 8, height: 42, alignItems: "center", paddingBottom: 2 }}
      >
        {(["upcoming", "past"] as EventTimeScope[]).map((scope) => (
          <Pressable key={scope} accessibilityRole="tab" accessibilityState={{ selected: timeScope === scope }} onPress={() => setTimeScope(scope)} style={chipStyle(timeScope === scope)}>
            <Text style={{ color: timeScope === scope ? "#FFFFFF" : palette.ink, fontSize: 12, fontWeight: "700" }}>{scope === "upcoming" ? "Sắp tới" : "Đã diễn ra"}</Text>
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" accessibilityState={{ selected: favoritesOnly }} onPress={() => setFavoritesOnly((value) => !value)} style={chipStyle(favoritesOnly)}>
          <Text style={{ color: favoritesOnly ? "#FFFFFF" : palette.ink, fontSize: 12, fontWeight: "700" }}>{favoritesOnly ? "Đang xem yêu thích" : "Chỉ yêu thích"}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Đổi cách sắp xếp" onPress={() => setSortBy((value) => value === "date" ? "availability" : "date")} style={chipStyle(sortBy === "availability")}>
          <Text style={{ color: sortBy === "availability" ? "#FFFFFF" : palette.ink, fontSize: 12, fontWeight: "700" }}>{sortBy === "date" ? "Ngày gần nhất" : "Còn nhiều chỗ"}</Text>
        </Pressable>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 42, maxHeight: 42, flexGrow: 0, flexShrink: 0 }} contentContainerStyle={{ gap: 18, height: 42, alignItems: "center" }}>
        {filters.map((item) => <Pressable accessibilityRole="tab" accessibilityState={{ selected: filter === item }} key={item} onPress={() => setFilter(item)} style={{ justifyContent: "center", borderBottomWidth: 2, borderBottomColor: filter === item ? palette.blue : "transparent", paddingBottom: 8 }}><Text style={{ fontSize: 13, fontWeight: filter === item ? "700" : "500", color: filter === item ? palette.blue : palette.muted }}>{item === "all" ? "Tất cả" : categories[item].label}</Text></Pressable>)}
      </ScrollView>

      <View style={[ui.row, { justifyContent: "space-between", marginBottom: 12, marginTop: 8 }]}>
        <Text style={ui.sectionTitle}>{timeScope === "upcoming" ? "Sắp diễn ra" : "Sự kiện đã qua"}</Text>
        <Text style={{ color: palette.green, fontSize: 11, fontWeight: "600" }}>{items.length} sự kiện</Text>
      </View>
      <FlatList
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            favorite={favoriteIds.includes(item.id)}
            remainingSeats={getRemainingSeats(item.id)}
            onPress={() => navigation.navigate("EventDetail", { eventId: item.id })}
            onFavorite={() => toggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={<StateView loading={loading} title={loading ? "Đang tải sự kiện" : error ? "Chưa tải được sự kiện" : favoritesOnly ? "Chưa có sự kiện yêu thích" : "Không tìm thấy sự kiện"} message={error ?? (loading ? undefined : "Đổi bộ lọc hoặc từ khóa để thử lại.")} actionLabel={error ? "Thử lại" : undefined} onAction={() => load(1, true)} />}
        ListFooterComponent={
          <View style={{ paddingVertical: 10, gap: 12 }}>
            {error && items.length > 0 ? <Text style={{ color: palette.pink }}>{error}</Text> : null}
            {nextPage ? (
              <ActionButton secondary disabled={loading} onPress={() => load(nextPage)} label={loading ? "Đang tải..." : `Xem thêm · Trang ${page + 1}`} />
            ) : items.length > 0 ? (
              <Text style={[ui.muted, { textAlign: "center" }]}>Bạn đã xem tất cả sự kiện</Text>
            ) : null}
          </View>
        }
      />
    </Screen>
  );
}
