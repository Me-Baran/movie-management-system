function LogMethod(target, propertyKey: string, descriptor: PropertyDescriptor) {
    // At this point, no instances exist yet!
    // target is Calculator.prototype, which will later become __proto__ of instances
    console.log('Decorator running, target is:', target);
}

class Calculator {
    @LogMethod
    add(a, b) {
        return a + b;
    }
}

const calc = new Calculator();

// NOW, after instantiation:
console.log('calc.__proto__ is:', calc.__proto__);  // Same object as target was