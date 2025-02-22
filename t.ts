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