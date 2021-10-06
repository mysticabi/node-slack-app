class UsersContext{

    userMap;

    constructor() {
        
        this.userMap = new Map();
      
    }
  
}

class User{

    user;
    userCart;
    
    constructor(user){
        this.userCart = new Cart();
        this.user = user;

    }

    getCartTotal() {
        var total = 0;
        this.userCart.productList.forEach(element => {
            total += Number(element.price);
        });
        return total;
    }

}

class Cart{

    productList;
    userProductListViewIndex;
    constructor(){

        this.productList = [];
        this.userProductListViewIndex = 1;
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

module.exports = {UsersContext, Product, Cart, User}