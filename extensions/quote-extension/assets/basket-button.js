


let basketIcon_Id = document.getElementById("basketIcon_Id");
basketIcon_Id.addEventListener("click", basketButtonHandle);

function basketIconShow() {
    console.log("basketIconShow")
    let cartIcon = document.getElementById("cart-icon-bubble");
    const div = document.createElement('div');
    div.innerHTML = `<div class="basket-icon"><span></span></div>`;
    div.addEventListener('click', basketButtonHandle);
    cartIcon.after(div);

}
basketIconShow();

async function basketButtonHandle() {
    console.log("basketButtonHandle ")
    let gg = localStorage.getItem("productData");
    console.log("check data gg", gg)
    window.location = "/pages/basket-qoute";
}

let quantityInput = document.querySelector('input[name="quantity"]');
var quantityValue = quantityInput.value;
// var formattedPrice = (FetchData.price / 100).toFixed(2)
// var totalAmount = formattedPrice * quantityValue;

function decreaseQuantity(id,index) {
    let decrease_Value;
    let product_Price;
    let productData = JSON.parse(localStorage.getItem("productData")) || [];
    productData.forEach(product => {
        if (product.product_id === id ) {
            product.product_quantity = Math.max(0, parseInt(product.product_quantity, 10) - 1);
            decrease_Value =product.product_quantity;
            product_Price = product.product_price;
        }
    });
    document.querySelectorAll('#quantityValue')[`${index}`].innerText = decrease_Value;
    document.querySelectorAll('#total_amout_value')[`${index}`].innerText= `Rs. ${decrease_Value*product_Price}`;
    localStorage.setItem("productData", JSON.stringify(productData));
    console.log("decrease:", productData,product_Price);
}

function increaseQuantity(id,index) {
    let increase_Value;
    let product_Price;
    let productData = JSON.parse(localStorage.getItem("productData")) || [];
    productData.forEach(product => {
        if (product.product_id === id) {
            product.product_quantity = Math.max(0, parseInt(product.product_quantity, 10) + 1);
            increase_Value =product.product_quantity ;
            product_Price = product.product_price;
        }
    });
    document.querySelectorAll('#quantityValue')[`${index}`].innerText = increase_Value;
    document.querySelectorAll('#total_amout_value')[`${index}`].innerText=  `Rs. ${increase_Value*product_Price}`;
    localStorage.setItem("productData", JSON.stringify(productData));
    console.log("increase:", productData,product_Price);

};
function deleteProduct(product_id) {
    let productData = JSON.parse(localStorage.getItem("productData")) || [];
    productData = productData.filter(product => product.product_id !== product_id);
    localStorage.setItem("productData", JSON.stringify(productData));

    console.log("deleteProduct:", product_id);
}









async function basketDivFunction() {

    console.log("basketDivFunction")
    let arrayList = JSON.parse(localStorage.getItem("productData"));
    document.querySelector('.shared-page-heading').innerHTML = "Basket Quotes";
    let wishlistBody = `<div>
                                <table style="width:100%">
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                    </tr>`;
    arrayList.map((data, index) => {
        let variants = data.product_variant;
        let variant_title = "";
        let entries = Object.entries(variants);
        var formattedPrice = data.product_price 


        entries.map(([key, val] = entry) => {
            return variant_title += `<span ><b>${key}</b> : ${val} </span> `
        });

        let quantityValue = data.product_quantity;
        var totalAmount = formattedPrice * quantityValue;
        let product_id = data.product_id;
        wishlistBody += `<tr>
        <td style="display:flex; justify-content:space-around"> 
            <div style="height:100px; width:120px;">
                <img src="${data.product_image}" alt="not a text"  height="auto" width="100%" />
            </div>
            <div style="height:100px; width:200px;">  
            <span><b>${data.product_name} <b></span><br/>
            <span>Rs.${formattedPrice}</span><br/>            
            <span>${variant_title}</span>
            </div>
        </td>
        <td>
        <div style="display:flex;justify-content:center;">
            <div class="buttonRoot">
                <button onclick="decreaseQuantity(${product_id},${index})">
                    <span style="color: black;">-</span>
                </button>
                <span id="quantityValue">${data.product_quantity}</span>
                <button onclick="increaseQuantity(${product_id},${index})" id="increaseButton">
                    <span>+</span>
                </button>
            </div>
            <div style="margin-top:28px; margin-left:20px;">
                <span class="deleteIcon" onclick="deleteProduct(${data.product_id})">
                    <i class="fa fa-trash-o" style="font-size:20px;color:red"></i>
                </span>
            </div>
        </div>
            
        </td>
        <td>
            <span id="total_amout_value" >Rs. ${totalAmount}</span>
        </td>
        </tr>`;
    });

    wishlistBody += `</table></div>`;
    document.querySelector('.show-shared-wishlist').innerHTML = wishlistBody;
};
