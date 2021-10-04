class Carts{


    constructor() {
        

      
    }
  
}

class Product{

    sku;
    name;
    description;
    brand;
    image;
    price;

    constructor(sku, name, description, brand, image, price){
        this.brand = brand;
        this.description = description;
        this.image = image;
        this.name = name;
        this.sku = sku;
        this.price = price;
    }


}

module.exports = {Carts, Product}