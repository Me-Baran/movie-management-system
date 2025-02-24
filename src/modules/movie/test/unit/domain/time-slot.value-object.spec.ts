import { TimeSlot } from "src/modules/movie/domain/models/time-slot.value-object";

describe('TimeSlot', () => {
    describe('fromString', () => {
        it('should create a valid time slot', () => {
            const timeSlot = TimeSlot.fromString('10:00-12:00');
            expect(timeSlot.getValue()).toBe('10:00-12:00');
        });

        it('should throw error for invalid time slot', () => {
            expect(() => TimeSlot.fromString('09:00-11:00')).toThrow('Invalid time slot');
        });

        it('should handle whitespace in time slot string', () => {
            const timeSlot = TimeSlot.fromString('  10:00-12:00  ');
            expect(timeSlot.getValue()).toBe('10:00-12:00');
        });
    });

    describe('equals', () => {
        it('should return true for same time slots', () => {
            const slot1 = TimeSlot.fromString('10:00-12:00');
            const slot2 = TimeSlot.fromString('10:00-12:00');
            expect(slot1.equals(slot2)).toBe(true);
        });

        it('should return false for different time slots', () => {
            const slot1 = TimeSlot.fromString('10:00-12:00');
            const slot2 = TimeSlot.fromString('12:00-14:00');
            expect(slot1.equals(slot2)).toBe(false);
        });
    });
});