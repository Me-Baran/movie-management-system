export class AgeRestriction {
    private readonly value: number;

    constructor(value: number) {
        if (value < 0) {
            throw new Error('Age restriction can not be negative')
        }
        this.value = value;
    }

    public getValue(): number {
        return this.value;
    }

    // Domain methods
    public isAllowedForAge(age: number): boolean {
        return age >= this.value;
    }
}