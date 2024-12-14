// Function to display products in the view
function displayProducts(products) {
    const productGridContainer = document.getElementById('product-grid-container');
    let productHTML = '';

    products.forEach(product => {
        productHTML += `
            <div class="product">
                <img src="${product.imageUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">$${product.price}</p> 
                <button class="btn add-to-cart" data-product-id="${product.id}">Add to Cart</button>
            </div>
        `;
    });

    productGridContainer.innerHTML = productHTML;
}

// Event listener for "Add to Cart" button clicks (illustrative example)
$(document).on('click', '.add-to-cart', function() {
    const productId = $(this).data('product-id');
    // Here, you'd typically update the cart model and view
    console.log(`Product with ID ${productId} added to cart`);
});

// Initialize the product display
$(document).ready(function() {
    const productData = getProductData();
    displayProducts(productData);
});
