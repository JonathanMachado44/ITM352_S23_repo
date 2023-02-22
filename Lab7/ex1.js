require("./products_data.js");
num_product = 5;
item_number = 1;
while(item_number != num_product + 1)
{
    console.log(`${item_number} ${eval('name' + item_number)}`);
   if(item_number>num_product/2){
    break;
   }
   
    item_number++;
}
console.log("That's what we have!!");