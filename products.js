var fs = require('fs');

class Products{

    
    constructor(){

        fs.readFile('./data/products.json',
        // callback function that is called when reading file is done
        function(err, data) {       
            // json data
            console.log(data);
            var jsonData = data;
    
            // parse json
            var products = JSON.parse(jsonData);
    
            // access elements
            console.log(products.products[0].name + "'s sku number is " + products.products[0].sku);
        
        });

    }

}

module.exports = Products;