
// target is Calculator.prototype which will later become the __proto__ of instances
/**
 * 
 * target is the prototype object of the class (the object that contains all non-static methods). It is not the methods themselves, 
 * but rather the object that holds those methods.
To be specific:

target is exactly Calculator.prototype
It contains all non-static methods defined in the class
It also contains the constructor property (pointing back to the class)
It will become the __proto__ of all instances of the class
 */


function AddHelperMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log(Object.getOwnPropertyDescriptors(target))
    // Add a helper method to the class prototype
    target.helper = function () {
        console.log('Helper method added by decorator');
    };
}

class Calculator {
    @AddHelperMethod
    add(a: number, b: number) {
        return a + b;
    }
}

const calc = new Calculator();
(calc as any).helper(); // Works because decorator added it to prototype
console.log(calc.add(2, 5))


function Animal() {}

console.log(Animal.prototype)

Animal.prototype.breathe = () => console.log('Breathing');

function Dog() {}
Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.bark = function() {
    console.log('dfd')
}

const dog = new Dog()
dog.breathe()
dog.bark()
console.log(dog instanceof Dog)