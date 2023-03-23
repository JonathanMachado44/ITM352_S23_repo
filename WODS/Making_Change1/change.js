// set amount to make change in pennies
let amount = 40
let leftover = amount;

// determine num of quarters
let quarters = Math.floor(amount/25);
leftover = leftover % 25;

// determine num of dimes
let dimes = Math.floor(leftover/10);
leftover=leftover % 10;

//num of nickles
let nickels = Math.floor(leftover/5);
leftover = leftover % 5;

//num of pennies
let pennies = leftover;

console.log(amount+"pennies can be divided into:"+ quarters+"quarters(s),"+dimes+"dimes(s),"+nickels+"nickel(s),"+ pennies+"pennie(s)");