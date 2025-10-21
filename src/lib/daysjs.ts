// lib/dayjs.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

// Set default timezone to Algeria
dayjs.tz.setDefault("Africa/Algiers");

// Export a helper function instead of a constant
export const now = dayjs.tz(); // 👈 This gives you the current real time
// export const now = dayjs.tz("2025-10-22T7:30:00", "Africa/Algiers");
