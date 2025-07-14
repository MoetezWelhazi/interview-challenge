import { calculateRemainingDays } from '../src/assignment/assignment.util';

describe('Assignment Remaining Days Calculation', () => {
  it('returns correct remaining days for treatment in progress', () => {
    const start = new Date('2024-01-01');
    const today = new Date('2024-01-05');
    expect(calculateRemainingDays(start, 10, today)).toBe(6);
  });

  it('returns 0 if treatment is finished', () => {
    const start = new Date('2024-01-01');
    const today = new Date('2024-01-12');
    expect(calculateRemainingDays(start, 10, today)).toBe(0);
  });

  it('returns total days if today is start date', () => {
    const start = new Date('2024-01-01');
    const today = new Date('2024-01-01');
    expect(calculateRemainingDays(start, 10, today)).toBe(10);
  });

  it('handles negative totalDays as 0 remaining', () => {
    const start = new Date('2024-01-01');
    const today = new Date('2024-01-01');
    expect(calculateRemainingDays(start, -5, today)).toBe(0);
  });
}); 