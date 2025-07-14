import { differenceInCalendarDays } from 'date-fns';

/**
 * Calculates remaining days of treatment.
 * @param startDate ISO string or Date
 * @param totalDays number of days assigned
 * @param today Date (default: new Date())
 * @returns number of days remaining (0 if finished)
 */
export function calculateRemainingDays(startDate: string | Date, totalDays: number, today: Date = new Date()): number {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + totalDays);
  const remaining = differenceInCalendarDays(end, today);
  return remaining > 0 ? remaining : 0;
} 