import { Session } from 'src/modules/movie/domain/models/session.entity';
import { TimeSlot } from 'src/modules/movie/domain/models/time-slot.value-object';
import { v4 as uuidv4 } from 'uuid';

describe('Session', () => {
    let session: Session;
    const mockDate = new Date('2024-02-23');
    const mockTimeSlot = TimeSlot.fromString('10:00-12:00');

    beforeEach(() => {
        session = new Session(
            uuidv4(),
            uuidv4(),
            mockDate,
            mockTimeSlot,
            1,
            100
        );
    });

    describe('booking seats', () => {
        it('should successfully book available seats', () => {
            session.bookSeats(2);
            expect(session.getBookedSeats()).toBe(2);
            expect(session.getRemainingSeats()).toBe(98);
        });

        it('should throw error when booking more seats than available', () => {
            expect(() => session.bookSeats(101)).toThrow('Not enough available seats');
        });
    });

    describe('time and room conflicts', () => {
        it('should detect conflict with same time and room on same day', () => {
            const conflictingSession = new Session(
                uuidv4(),
                uuidv4(),
                mockDate,
                mockTimeSlot,
                1,
                100
            );
            expect(session.hasConflictWith(conflictingSession)).toBe(true);
        });

        it('should not detect conflict with different room', () => {
            const differentRoomSession = new Session(
                uuidv4(),
                uuidv4(),
                mockDate,
                mockTimeSlot,
                2,
                100
            );
            expect(session.hasConflictWith(differentRoomSession)).toBe(false);
        });

        it('should not detect conflict with different time slot', () => {
            const differentTimeSession = new Session(
                uuidv4(),
                uuidv4(),
                mockDate,
                TimeSlot.fromString('12:00-14:00'),
                1,
                100
            );
            expect(session.hasConflictWith(differentTimeSession)).toBe(false);
        });

        it('should not detect conflict with different day', () => {
            const differentDaySession = new Session(
                uuidv4(),
                uuidv4(),
                new Date('2024-02-24'),
                mockTimeSlot,
                1,
                100
            );
            expect(session.hasConflictWith(differentDaySession)).toBe(false);
        });
    });
});