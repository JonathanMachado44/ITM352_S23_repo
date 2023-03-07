/**
 * Validates that a string is a non-negative integer.
 * 
 * @param {string} value - The string to validate.
 * @param {boolean} [returnErrors=false] - Optional boolean parameter. If true, returns an array of errors. Otherwise, returns a boolean indicating whether or not there were any errors.
 * @returns {boolean | Array<string>} - If returnErrors is false (default), returns true if the string is a non-negative integer, false otherwise. If returnErrors is true, returns an array of error messages if the string is not a non-negative integer, otherwise returns an empty array.
 */
 function validateNonNegInt(q, returnErrors=false) {
    errors = []; // assume no errors at first
    if(Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    if(q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if(parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
  
    return returnErrors ? errors : (errors.length == 0);
  }
  
  pieces = ['60', '-3', '2.14', 'five', 'six', '20', '50', '40', 'ten', '2.2'];
  for (i in pieces) 
    console.log(`${pieces[i]} is non-negative integer: ${validateNonNegInt(pieces[i], true)}`);
