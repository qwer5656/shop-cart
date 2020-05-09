///api server

const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "pt7zaz9aci4c",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "JjfKK_5WWcjfc9Mvwz46Lpdz6PH5-bURDeoBez4RMO0"
});




//variables


const cartBtn = document.querySelector(".cart-btn");
const closeCarBtn = document.querySelector(".close-cart");
const clearCarBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDom = document.querySelector(".products-center");

// cart
let cart = [];
let buttonDom = [];
//getting the products
class Products {
    async getProducts() {
        try {
            let resulat=await client.getEntries({
                content_type: 'tom'
            });
            console.log(resulat);
            let productsmap = resulat.items.map((item) => {
                let { id } = item.sys;
                let { name, price } = item.fields;
                let { url } = item.fields.image.fields.file;
                return { id, name, price, url };
            })
            return productsmap;
        }
        catch (error) {
            console.log(error);
        }

    };

}
//display products
class UI {
    displayproduct(products) {
        let result = "";
        products.forEach(element => {
            result += ` <article class="product">
            <div class="img-container">
                <img src="${element.url}" alt="product" class="product-img">
                <button class="bag-btn" data-id="${element.id}">
                    <i class="fas fas-shopping-cart">
                        add to bag
                    </i>
                </button>
            </div>
            <h3>${element.name}</h3>
            <h4>$${element.price}</h4>
        </article>`;
        });
        productsDom.innerHTML = result;
    };
    getBagBt() {
        let buttons = document.querySelectorAll(".bag-btn");
        buttonDom = Array.from(buttons);
        
        console.log(buttonDom);
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            else {
                button.addEventListener("click", e => {
                    e.target.innerText = "In Cart";
                    e.currentTarget.disabled = true;
                    //get product form products 
                    let cartitem = { ...storage.getProducts(id), amount: 1 };
                    console.log(cartitem);
                    // add product to the cart
                    cart = [...cart, cartitem];
                    storage.saveCart(cart);
                    //set cart value
                    this.setCartValues(cart);
                    //add
                    this.addCartItem(cartitem);
                    this.showCart();
                });
            }
        });
    };
    setCartValues(cart) {
        let tempTotal = 0;
        let itemTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemTotal += item.amount;
        });

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemTotal;
    };
    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `<img src="${item.url}" alt="product">
        <div>
            <h3>${item.name}</h3>
            <h5>${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
        cartContent.appendChild(div);

    };
    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    };
    setupAPP() {
        cart = storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCarBtn.addEventListener("click", this.hideCart);
    };
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    };
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));

    };
    cartLogic() {
        clearCarBtn.addEventListener("click", () => {
            this.clearCart();
        });
        cartContent.addEventListener("click",(e)=>{
            let target=e.target;
            if(target.classList.contains("remove-item"))
            {
                let id=target.dataset.id;
                cartContent.removeChild(e.target.parentElement.parentElement);
                this.removeItem(id);
            }
            else if(target.classList.contains("fa-chevron-up"))
            {
                let id=target.dataset.id;                
                let temp=cart.find((e)=>e.id===id);
                temp.amount=temp.amount+1;
                 storage.saveCart(cart);
                 target.nextElementSibling.innerText=temp.amount;
                 this.setCartValues(cart);
            }
            else if(target.classList.contains("fa-chevron-down"))
            {
                let id=target.dataset.id;                
                let temp=cart.find((e)=>e.id===id);
                if(temp.amount==1)
                {
                    cartContent.removeChild(e.target.parentElement.parentElement);
                    this.removeItem(id);
                }
                else
                {
                temp.amount=temp.amount-1;
                storage.saveCart(cart);
                this.setCartValues(cart);
                target.previousElementSibling.innerText=temp.amount;
                }
            }
        });
    }
    clearCart() {

        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length>0)
        {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();

    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = ` <i class="fas fas-shopping-cart">
        add to bag</i>`;
    }
    getSingleButton(id) {
        return buttonDom.find(button => button.dataset.id === id);

    }

}
// local storage
class storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProducts(id) {
        let data = JSON.parse(localStorage.getItem("products"));
        return data.find(e => e.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem("cart")) : [];
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    ui.setupAPP();
    ui.cartLogic();
    //get all products
    products.getProducts().then(data => {
        ui.displayproduct(data);
        storage.saveProducts(data);
    }).then(() => {
        ui.getBagBt();
    });

});