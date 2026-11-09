export type EventCategory = "academic" | "career" | "club" | "volunteer";

export type EventItem = {
  id: string;
  title: string;
  category: EventCategory;
  location: string;
  startsAt: string;
  endsAt: string;
  registrationDeadline: string;
  capacity: number;
  registered: number;
  description: string;
  agenda: string[];
  speakers: string[];
  tags: string[];
  qrCode: string;
};

export type RegistrationStatus = "confirmed" | "waitlisted";

export type Registration = {
  eventId: string;
  studentId: string;
  createdAt: string;
  reminderMinutes: number | null;
  deadlineReminderMinutes?: number | null;
  status: RegistrationStatus;
  notificationId?: string;
  deadlineNotificationId?: string;
};

export type CheckInRecord = {
  eventId: string;
  checkedAt: string;
};

export type ClassScheduleItem = {
  id: string;
  subject: string;
  repeat?: "weekly" | "one-time";
  date?: string;
  weekday: number;
  startsAt: string;
  endsAt: string;
  location: string;
};

export type CheckInResult = {
  eventId: string;
  status: "accepted" | "duplicate" | "invalid" | "not-registered";
  message: string;
};
