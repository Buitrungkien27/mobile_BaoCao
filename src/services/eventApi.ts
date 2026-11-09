import { seedEvents } from "../data/events";
import { CheckInResult, EventCategory, EventItem } from "../types/event";

const PAGE_SIZE = 3;

export type EventTimeScope = "upcoming" | "past";
export type EventSortBy = "date" | "availability";

type EventQueryOptions = {
  timeScope?: EventTimeScope;
  sortBy?: EventSortBy;
  favoritesOnly?: boolean;
  favoriteIds?: string[];
  registeredEventIds?: string[];
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maybeFail() {
  if (Math.random() < 0.08) {
    throw new Error("Mang khong on dinh. Vui long thu lai.");
  }
}

export async function fetchEvents(
  page: number,
  category?: EventCategory | "all",
  query = "",
  options: EventQueryOptions = {}
) {
  await delay(650);
  maybeFail();
  const normalize = (value: string) => value.toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
  const now = Date.now();
  const filtered = seedEvents
    .filter((item) => {
      const matchesCategory = !category || category === "all" || item.category === category;
      const matchesQuery = normalize(`${item.title} ${item.location} ${item.description} ${item.tags.join(" ")}`).includes(normalize(query.trim()));
      const isUpcoming = Date.parse(item.endsAt) >= now;
      const matchesTime = !options.timeScope || (options.timeScope === "upcoming" ? isUpcoming : !isUpcoming);
      const matchesFavorites = !options.favoritesOnly || options.favoriteIds?.includes(item.id);
      return matchesCategory && matchesQuery && matchesTime && matchesFavorites;
    })
    .sort((a, b) => {
      if (options.sortBy === "availability") {
        const seatsLeft = (event: EventItem) => Math.max(0, event.capacity - event.registered - (options.registeredEventIds?.includes(event.id) ? 1 : 0));
        return seatsLeft(b) - seatsLeft(a);
      }
      return options.timeScope === "past"
        ? Date.parse(b.startsAt) - Date.parse(a.startsAt)
        : Date.parse(a.startsAt) - Date.parse(b.startsAt);
    });
  const start = (page - 1) * PAGE_SIZE;
  const items = filtered.slice(start, start + PAGE_SIZE);
  return {
    items,
    nextPage: start + PAGE_SIZE < filtered.length ? page + 1 : null
  };
}

export async function fetchEventById(eventId: string): Promise<EventItem> {
  await delay(360);
  const event = seedEvents.find((item) => item.id === eventId);
  if (!event) {
    throw new Error("Khong tim thay su kien.");
  }
  return event;
}

export async function submitCheckIn(
  rawCode: string,
  options: { registeredEventIds: string[]; checkedInIds: string[] }
): Promise<CheckInResult> {
  await delay(480);
  const event = seedEvents.find((item) => item.qrCode === rawCode.trim());
  if (!event) {
    return { eventId: "", status: "invalid", message: "Ma QR khong thuoc su kien hop le." };
  }
  if (options.checkedInIds.includes(event.id)) {
    return { eventId: event.id, status: "duplicate", message: `Ban da check-in su kien ${event.title} roi.` };
  }
  if (!options.registeredEventIds.includes(event.id)) {
    return { eventId: event.id, status: "not-registered", message: "Ban can dang ky tham du truoc khi check-in su kien nay." };
  }
  return { eventId: event.id, status: "accepted", message: `Da check-in thanh cong: ${event.title}` };
}
