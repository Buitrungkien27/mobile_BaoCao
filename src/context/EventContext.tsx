import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import * as Notifications from "expo-notifications";
import { CheckInRecord, ClassScheduleItem, Registration, RegistrationStatus } from "../types/event";
import { seedEvents } from "../data/events";

const STORAGE_KEY = "@eventmate/demo-state-v1";

type ReminderOutcome = "scheduled" | "permission-denied" | "too-late" | "unavailable" | "not-selected";
type ReminderScheduleResult = { outcome: ReminderOutcome; notificationId?: string };
export type RegisterOutcome = {
  status: RegistrationStatus;
  reminder: ReminderOutcome;
  deadlineReminder: ReminderOutcome;
};

type EventState = {
  studentId: string;
  favoriteIds: string[];
  registrations: Registration[];
  classSchedule: ClassScheduleItem[];
  checkedInIds: string[];
  checkInHistory: CheckInRecord[];
  hasHydrated: boolean;
};

type PersistedState = Omit<EventState, "hasHydrated">;

type EventAction =
  | { type: "hydrate"; payload: PersistedState }
  | { type: "toggleFavorite"; eventId: string }
  | { type: "register"; registration: Registration }
  | { type: "saveClassScheduleItem"; item: ClassScheduleItem }
  | { type: "removeClassScheduleItem"; itemId: string }
  | { type: "cancelRegistration"; eventId: string }
  | { type: "checkIn"; eventId: string; checkedAt: string };

type EventContextValue = EventState & {
  toggleFavorite: (eventId: string) => void;
  registerEvent: (eventId: string, reminderMinutes: number | null, deadlineReminderMinutes?: number | null) => Promise<RegisterOutcome>;
  cancelRegistration: (eventId: string) => Promise<void>;
  markCheckedIn: (eventId: string) => void;
  isRegistered: (eventId: string) => boolean;
  getRegistration: (eventId: string) => Registration | undefined;
  getRegisteredCount: (eventId: string) => number;
  getRemainingSeats: (eventId: string) => number;
  getScheduleConflicts: (eventId: string) => typeof seedEvents;
  getClassConflicts: (eventId: string) => ClassScheduleItem[];
  saveClassScheduleItem: (item: ClassScheduleItem) => void;
  removeClassScheduleItem: (itemId: string) => void;
};

const initialState: EventState = {
  studentId: "22002985",
  favoriteIds: [],
  registrations: [],
  classSchedule: [],
  checkedInIds: [],
  checkInHistory: [],
  hasHydrated: false
};

const EventContext = createContext<EventContextValue | null>(null);

function restorePersistedState(raw: string | null): PersistedState {
  if (!raw) {
    return {
      studentId: initialState.studentId,
      favoriteIds: [],
      registrations: [],
      classSchedule: [],
      checkedInIds: [],
      checkInHistory: []
    };
  }

  try {
    const saved = JSON.parse(raw) as Omit<Partial<PersistedState>, "registrations"> & {
      registrations?: Array<Partial<Registration> & { reminderEnabled?: boolean }>;
    };
    const registrations = Array.isArray(saved.registrations)
      ? saved.registrations
          .filter((item): item is Partial<Registration> & { eventId: string; reminderEnabled?: boolean } => typeof item.eventId === "string")
          .map((item) => ({
            eventId: item.eventId,
            studentId: typeof item.studentId === "string" ? item.studentId : initialState.studentId,
            createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
            reminderMinutes: typeof item.reminderMinutes === "number" ? item.reminderMinutes : item.reminderEnabled ? 60 : null,
            deadlineReminderMinutes: typeof item.deadlineReminderMinutes === "number" ? item.deadlineReminderMinutes : null,
            status: item.status === "waitlisted" ? "waitlisted" as const : "confirmed" as const,
            notificationId: typeof item.notificationId === "string" ? item.notificationId : undefined,
            deadlineNotificationId: typeof item.deadlineNotificationId === "string" ? item.deadlineNotificationId : undefined
          }))
      : [];
    const checkedInIds = Array.isArray(saved.checkedInIds)
      ? saved.checkedInIds.filter((id): id is string => typeof id === "string")
      : [];
    const classSchedule = Array.isArray(saved.classSchedule)
      ? saved.classSchedule.filter((item): item is ClassScheduleItem => Boolean(
          item && typeof item.id === "string" && typeof item.subject === "string"
          && Number.isInteger(item.weekday) && item.weekday! >= 0 && item.weekday! <= 6
          && typeof item.startsAt === "string" && typeof item.endsAt === "string"
          && typeof item.location === "string"
          && (item.repeat !== "one-time" || typeof item.date === "string")
        ))
      : [];
    const checkInHistory = Array.isArray(saved.checkInHistory)
      ? saved.checkInHistory.filter((item): item is CheckInRecord =>
          Boolean(item && typeof item.eventId === "string" && typeof item.checkedAt === "string")
        )
      : checkedInIds.map((eventId) => ({ eventId, checkedAt: new Date().toISOString() }));

    return {
      studentId: typeof saved.studentId === "string" ? saved.studentId : initialState.studentId,
      favoriteIds: Array.isArray(saved.favoriteIds) ? saved.favoriteIds.filter((id): id is string => typeof id === "string") : [],
      registrations,
      classSchedule,
      checkedInIds,
      checkInHistory
    };
  } catch {
    return {
      studentId: initialState.studentId,
      favoriteIds: [],
      registrations: [],
      classSchedule: [],
      checkedInIds: [],
      checkInHistory: []
    };
  }
}

function reducer(state: EventState, action: EventAction): EventState {
  switch (action.type) {
    case "hydrate":
      return { ...action.payload, hasHydrated: true };
    case "toggleFavorite":
      return {
        ...state,
        favoriteIds: state.favoriteIds.includes(action.eventId)
          ? state.favoriteIds.filter((id) => id !== action.eventId)
          : [...state.favoriteIds, action.eventId]
      };
    case "register":
      if (state.registrations.some((item) => item.eventId === action.registration.eventId)) {
        return state;
      }
      return { ...state, registrations: [...state.registrations, action.registration] };
    case "saveClassScheduleItem":
      return {
        ...state,
        classSchedule: state.classSchedule.some((item) => item.id === action.item.id)
          ? state.classSchedule.map((item) => item.id === action.item.id ? action.item : item)
          : [...state.classSchedule, action.item]
      };
    case "removeClassScheduleItem":
      return { ...state, classSchedule: state.classSchedule.filter((item) => item.id !== action.itemId) };
    case "cancelRegistration":
      return { ...state, registrations: state.registrations.filter((item) => item.eventId !== action.eventId) };
    case "checkIn":
      if (state.checkedInIds.includes(action.eventId)) {
        return state;
      }
      return {
        ...state,
        checkedInIds: [...state.checkedInIds, action.eventId],
        checkInHistory: [...state.checkInHistory, { eventId: action.eventId, checkedAt: action.checkedAt }]
      };
    default:
      return state;
  }
}

async function scheduleReminder(eventId: string, title: string, triggerDate: string, reminderMinutes: number | null, kind: "event" | "deadline"): Promise<ReminderScheduleResult> {
  if (reminderMinutes === null) {
    return { outcome: "not-selected" as const };
  }
  const triggerAt = Date.parse(triggerDate) - reminderMinutes * 60_000;
  if (triggerAt <= Date.now()) {
    return { outcome: "too-late" as const };
  }
  if (Platform.OS === "web") {
    return { outcome: "unavailable" as const };
  }

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("event-reminders", {
        name: "Nhắc lịch và hạn đăng ký",
        importance: Notifications.AndroidImportance.DEFAULT
      });
    }
    let permission = await Notifications.getPermissionsAsync();
    if (permission.status !== "granted") {
      permission = await Notifications.requestPermissionsAsync();
    }
    if (permission.status !== "granted") {
      return { outcome: "permission-denied" as const };
    }
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: kind === "deadline" ? "Sắp hết hạn đăng ký" : "Sắp đến giờ sự kiện",
        body: kind === "deadline" ? `Hạn đăng ký sự kiện ${title} sắp đóng.` : `EventMate nhắc bạn: ${title}`,
        data: { eventId, kind }
      },
      trigger: { date: new Date(triggerAt), channelId: "event-reminders" }
    });
    return { outcome: "scheduled" as const, notificationId };
  } catch {
    return { outcome: "unavailable" as const };
  }
}

export function EventProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (active) dispatch({ type: "hydrate", payload: restorePersistedState(raw) });
      })
      .catch(() => {
        if (active) dispatch({ type: "hydrate", payload: restorePersistedState(null) });
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!state.hasHydrated) return;
    const payload: PersistedState = {
      studentId: state.studentId,
      favoriteIds: state.favoriteIds,
      registrations: state.registrations,
      classSchedule: state.classSchedule,
      checkedInIds: state.checkedInIds,
      checkInHistory: state.checkInHistory
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => undefined);
  }, [state]);

  const toggleFavorite = useCallback((eventId: string) => {
    dispatch({ type: "toggleFavorite", eventId });
  }, []);

  const registerEvent = useCallback(async (eventId: string, reminderMinutes: number | null, deadlineReminderMinutes: number | null = null): Promise<RegisterOutcome> => {
    const event = seedEvents.find((item) => item.id === eventId);
    if (!event) throw new Error("Không tìm thấy sự kiện.");

    if (Date.parse(event.registrationDeadline) <= Date.now() || Date.parse(event.endsAt) < Date.now()) {
      throw new Error("Đã đóng đăng ký sự kiện này.");
    }

    const existing = state.registrations.find((item) => item.eventId === eventId);
    if (existing) return {
      status: existing.status,
      reminder: existing.notificationId ? "scheduled" : "not-selected",
      deadlineReminder: existing.deadlineNotificationId ? "scheduled" : "not-selected"
    };

    const confirmedByThisStudent = state.registrations.filter((item) => item.eventId === eventId && item.status === "confirmed").length;
    const status: RegistrationStatus = event.registered + confirmedByThisStudent >= event.capacity ? "waitlisted" : "confirmed";
    const reminder = status === "confirmed"
      ? await scheduleReminder(eventId, event.title, event.startsAt, reminderMinutes, "event")
      : { outcome: "not-selected" as const };
    const deadlineReminder = await scheduleReminder(eventId, event.title, event.registrationDeadline, deadlineReminderMinutes, "deadline");

    dispatch({
      type: "register",
      registration: {
        eventId,
        studentId: state.studentId,
        createdAt: new Date().toISOString(),
        reminderMinutes: status === "confirmed" && reminder.outcome === "scheduled" ? reminderMinutes : null,
        deadlineReminderMinutes: deadlineReminder.outcome === "scheduled" ? deadlineReminderMinutes : null,
        status,
        notificationId: reminder.notificationId,
        deadlineNotificationId: deadlineReminder.notificationId
      }
    });
    return { status, reminder: reminder.outcome, deadlineReminder: deadlineReminder.outcome };
  }, [state.registrations, state.studentId]);

  const cancelRegistration = useCallback(async (eventId: string) => {
    const registration = state.registrations.find((item) => item.eventId === eventId);
    for (const notificationId of [registration?.notificationId, registration?.deadlineNotificationId]) {
      if (!notificationId) continue;
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch {
        // The registration should still be cancellable if a local notification is unavailable.
      }
    }
    dispatch({ type: "cancelRegistration", eventId });
  }, [state.registrations]);

  const markCheckedIn = useCallback((eventId: string) => {
    dispatch({ type: "checkIn", eventId, checkedAt: new Date().toISOString() });
  }, []);

  const getRegistration = useCallback(
    (eventId: string) => state.registrations.find((item) => item.eventId === eventId),
    [state.registrations]
  );

  const isRegistered = useCallback(
    (eventId: string) => state.registrations.some((item) => item.eventId === eventId && item.status === "confirmed"),
    [state.registrations]
  );

  const getRegisteredCount = useCallback(
    (eventId: string) => state.registrations.filter((item) => item.eventId === eventId && item.status === "confirmed").length,
    [state.registrations]
  );

  const getRemainingSeats = useCallback((eventId: string) => {
    const event = seedEvents.find((item) => item.id === eventId);
    if (!event) return 0;
    const localConfirmed = state.registrations.filter((item) => item.eventId === eventId && item.status === "confirmed").length;
    return Math.max(0, event.capacity - event.registered - localConfirmed);
  }, [state.registrations]);

  const getScheduleConflicts = useCallback((eventId: string) => {
    const candidate = seedEvents.find((event) => event.id === eventId);
    if (!candidate) return [];

    const confirmedIds = new Set(
      state.registrations
        .filter((registration) => registration.status === "confirmed" && registration.eventId !== eventId)
        .map((registration) => registration.eventId)
    );
    return seedEvents.filter((registeredEvent) => {
      if (!confirmedIds.has(registeredEvent.id)) return false;
      return Date.parse(candidate.startsAt) < Date.parse(registeredEvent.endsAt)
        && Date.parse(registeredEvent.startsAt) < Date.parse(candidate.endsAt);
    });
  }, [state.registrations]);

  const getClassConflicts = useCallback((eventId: string) => {
    const event = seedEvents.find((item) => item.id === eventId);
    if (!event) return [];
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date(event.startsAt));
    const endParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date(event.endsAt));
    const part = (values: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) => values.find((value) => value.type === type)?.value ?? "0";
    const weekday = ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as Record<string, number>)[part(parts, "weekday")];
    const eventDate = `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}`;
    const eventStart = Number(part(parts, "hour")) * 60 + Number(part(parts, "minute"));
    const eventEnd = Number(part(endParts, "hour")) * 60 + Number(part(endParts, "minute"));
    const toMinutes = (value: string) => {
      const [hour, minute] = value.split(":").map(Number);
      return hour * 60 + minute;
    };

    return state.classSchedule.filter((item) => (item.repeat === "one-time" ? item.date === eventDate : item.weekday === weekday)
      && eventStart < toMinutes(item.endsAt)
      && toMinutes(item.startsAt) < eventEnd);
  }, [state.classSchedule]);

  const saveClassScheduleItem = useCallback((item: ClassScheduleItem) => {
    dispatch({ type: "saveClassScheduleItem", item });
  }, []);

  const removeClassScheduleItem = useCallback((itemId: string) => {
    dispatch({ type: "removeClassScheduleItem", itemId });
  }, []);

  const value = useMemo(
    () => ({ ...state, toggleFavorite, registerEvent, cancelRegistration, markCheckedIn, isRegistered, getRegistration, getRegisteredCount, getRemainingSeats, getScheduleConflicts, getClassConflicts, saveClassScheduleItem, removeClassScheduleItem }),
    [state, toggleFavorite, registerEvent, cancelRegistration, markCheckedIn, isRegistered, getRegistration, getRegisteredCount, getRemainingSeats, getScheduleConflicts, getClassConflicts, saveClassScheduleItem, removeClassScheduleItem]
  );

  if (!state.hasHydrated) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F6F8" }}><ActivityIndicator size="large" color="#246BFD" /></View>;
  }

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEventContext() {
  const value = useContext(EventContext);
  if (!value) {
    throw new Error("useEventContext must be used inside EventProvider");
  }
  return value;
}
