import { AgeRestriction } from "src/modules/movie/domain/models/age-restriction.value-object";

describe('AgeRestriction', () => {
    describe('constructor', () => {
        it('should create a valid age restriction', () => {
            const ageRestriction = new AgeRestriction(12);
            expect(ageRestriction.getValue()).toBe(12);
        });

        it('should throw error for negative age', () => {
            expect(() => new AgeRestriction(-1)).toThrow('Age restriction can not be negative');
        });
    });

    describe('isAllowedForAge', () => {
        const ageRestriction = new AgeRestriction(12);

        it('should allow access for older age', () => {
            expect(ageRestriction.isAllowedForAge(15)).toBe(true);
        });

        it('should allow access for exact age', () => {
            expect(ageRestriction.isAllowedForAge(12)).toBe(true);
        });

        it('should not allow access for younger age', () => {
            expect(ageRestriction.isAllowedForAge(10)).toBe(false);
        });
    });
});