export class TimeSlot {
    private static readonly VALID_SLOTS = [
        '10:00-12:00', '12:00-14:00', '14:00-16:00',
        '16:00-18:00', '18:00-20:00', '20:00-22:00',
        '22:00-00:00'
    ];

    private constructor(private readonly value: string) {
        if (!this.isValidTimeSlot(value)) {
            throw new Error(`Invalid time slot: ${value}`);
        }
    }

    private isValidTimeSlot(timeSlot: string): boolean {
        return TimeSlot.VALID_SLOTS.includes(timeSlot);
    }

    public getValue(): string {
        return this.value;
    }

    public equals(timeSlot: TimeSlot): boolean {
        return this.value === timeSlot.value;
    }

    public static fromString(value: string): TimeSlot {
        const timeSlot = new TimeSlot(value.trim());
        return timeSlot;
    }
}