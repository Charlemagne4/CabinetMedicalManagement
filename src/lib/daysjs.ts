// lib/dayjs.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

dayjs.tz.setDefault("Africa/Algiers");

// ✅ Export a function that gives the current time
// fake date: "2025-10-22T7:30:00", "Africa/Algiers"
export const now = () => dayjs.tz();
