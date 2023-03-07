const person = {
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
    
    // Define a setter method for 'age'
    set personAge(newAge) {
      if (newAge > 0 && newAge < 120) {
        this.age = newAge;
      }
    }
  };
  
  // Set the person's age using the 'personAge' setter method
  person.personAge = 35;
  console.log(person.age); // Output: 35
  
  // Try to set an invalid age (out of range)
  person.personAge = -5;
  console.log(person.age); // Output: 35 (age wasn't set to an invalid value)