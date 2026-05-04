document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const header = document.querySelector('header');
    const cartTrigger = document.querySelector('.cart-trigger');
    const closeCart = document.querySelector('.close-cart');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    // --- Cart State ---
    let cart = JSON.parse(localStorage.getItem('crave_filler_cart')) || [];

    // --- Initialize ---
    updateCartUI();

    // --- Header Scroll Effect ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Cart Drawer Logic ---
    const openCartDrawer = () => {
        cartDrawer.style.right = '0';
        cartOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    const closeCartDrawer = () => {
        cartDrawer.style.right = '-100%';
        cartOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    cartTrigger.addEventListener('click', openCartDrawer);
    closeCart.addEventListener('click', closeCartDrawer);
    cartOverlay.addEventListener('click', closeCartDrawer);

    // --- Cart Functionality ---
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const id = button.getAttribute('data-id');
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            
            addItemToCart(id, name, price);
            openCartDrawer();
        });
    });

    function addItemToCart(id, name, price) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        
        saveCart();
        updateCartUI();
    }

    function removeItemFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartUI();
    }

    function updateQuantity(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeItemFromCart(id);
            } else {
                saveCart();
                updateCartUI();
            }
        }
    }

    function saveCart() {
        localStorage.setItem('crave_filler_cart', JSON.stringify(cart));
    }

    function updateCartUI() {
        // Update Count
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalCount;

        // Update Items list
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 50px;">Your cart is currently empty.</p>';
            cartTotalElement.textContent = '$0.00';
            return;
        }

        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            const itemElement = document.createElement('div');
            itemElement.style.display = 'flex';
            itemElement.style.justifyContent = 'space-between';
            itemElement.style.alignItems = 'center';
            itemElement.style.marginBottom = '25px';
            itemElement.style.paddingBottom = '15px';
            itemElement.style.borderBottom = '1px solid #f0f0f0';
            
            itemElement.innerHTML = `
                <div style="flex: 1;">
                    <h4 style="margin-bottom: 5px;">${item.name}</h4>
                    <p style="color: var(--caramel);">$${item.price.toFixed(2)}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="display: flex; align-items: center; border: 1px solid #eee; padding: 5px 10px;">
                        <span style="cursor: pointer;" onclick="window.updateQuantity('${item.id}', -1)">-</span>
                        <span style="margin: 0 15px;">${item.quantity}</span>
                        <span style="cursor: pointer;" onclick="window.updateQuantity('${item.id}', 1)">+</span>
                    </div>
                    <i class="fa-solid fa-trash-can" style="color: #ccc; cursor: pointer;" onclick="window.removeItemFromCart('${item.id}')"></i>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Expose functions to global scope for onclick handlers
    window.removeItemFromCart = removeItemFromCart;
    window.updateQuantity = updateQuantity;

    // --- Intersection Observer for Animations ---
    const observerOptions = {
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-card, .section-title, .about-content').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'var(--transition-smooth)';
        revealObserver.observe(el);
    });

    // --- Category Filtering ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                // Update active state
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter products
                productCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // --- Product Modal Logic ---
    const productModal = document.getElementById('product-modal');
    const closeModal = document.querySelector('.close-modal');
    
    const productData = {
        '1': {
            name: 'Dark Midnight Bar',
            category: 'Dark Chocolate',
            price: 12.99,
            desc: 'A deep, intense 85% cocoa bar with notes of roasted coffee and red fruits. Perfectly balanced for the true dark chocolate connoisseur.',
            image: 'bars.jpg'
        },
        '2': {
            name: 'Artisan Truffle Box',
            category: 'Gift Boxes',
            price: 24.99,
            desc: 'A curated selection of our finest hand-rolled truffles, including sea salt caramel, hazelnut praline, and champagne ganache.',
            image: 'truffles.jpg'
        },
        '3': {
            name: 'Velvet Heart Collection',
            category: 'Luxury Hearts',
            price: 32.00,
            desc: 'Exquisite geometric heart-shaped chocolates filled with silk-smooth raspberry and dark chocolate ganache. A masterpiece of taste and design.',
            image: 'hearts.jpg'
        },
        '4': {
            name: 'Caramel Swirl Delight',
            category: 'Milk Chocolate',
            price: 15.50,
            desc: 'Creamy milk chocolate infused with liquid golden caramel and a touch of Maldon sea salt. Pure indulgence in every bite.',
            image: 'collage.jpg'
        },
        '5': {
            name: 'Sea Salt Dark',
            category: 'Dark Chocolate',
            price: 13.99,
            desc: 'Our signature 70% dark chocolate bar sprinkled with hand-harvested sea salt flakes for the perfect sweet and savory balance.',
            image: 'bars.jpg'
        },
        '6': {
            name: 'Golden Berry Truffles',
            category: 'Truffles',
            price: 28.00,
            desc: 'Limited edition white and milk chocolate truffles with a fresh forest berry center, dusted in edible 24k gold leaf.',
            image: 'truffles.jpg'
        }
    };

    document.querySelectorAll('.product-image-container').forEach(container => {
        container.addEventListener('click', (e) => {
            if (e.target.closest('.overlay-icon')) return; // Don't open modal if clicking icons
            
            const card = container.closest('.product-card');
            const id = card.querySelector('.add-to-cart').getAttribute('data-id');
            const data = productData[id];

            if (data) {
                document.getElementById('modal-image').style.backgroundImage = `url(${data.image})`;
                document.getElementById('modal-name').textContent = data.name;
                document.getElementById('modal-category').textContent = data.category;
                document.getElementById('modal-price').textContent = `$${data.price.toFixed(2)}`;
                document.getElementById('modal-desc').textContent = data.desc;
                
                const addBtn = document.getElementById('modal-add-btn');
                // Recreate button to clear old event listeners
                const newAddBtn = addBtn.cloneNode(true);
                addBtn.parentNode.replaceChild(newAddBtn, addBtn);
                
                newAddBtn.addEventListener('click', () => {
                    addItemToCart(id, data.name, data.price);
                    closeProductModal();
                    openCartDrawer();
                });

                openProductModal();
            }
        });
    });

    function openProductModal() {
        productModal.style.display = 'block';
        cartOverlay.style.display = 'block';
        setTimeout(() => {
            productModal.style.opacity = '1';
            productModal.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 50);
        document.body.style.overflow = 'hidden';
    }

    function closeProductModal() {
        productModal.style.opacity = '0';
        productModal.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => {
            productModal.style.display = 'none';
            if (cartDrawer.style.right !== '0') {
                cartOverlay.style.display = 'none';
            }
        }, 300);
        document.body.style.overflow = 'auto';
    }

    closeModal.addEventListener('click', closeProductModal);
    cartOverlay.addEventListener('click', closeProductModal);

    // --- Newsletter Form Submission ---
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input').value;
            alert(`Thank you for subscribing, ${email}! You'll receive sweet updates soon.`);
            newsletterForm.reset();
        });
    }

    // --- Wishlist Interaction ---
    document.querySelectorAll('.add-to-wishlist').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.querySelector('i').classList.toggle('fa-regular');
            btn.querySelector('i').classList.toggle('fa-solid');
            btn.querySelector('i').style.color = btn.querySelector('i').classList.contains('fa-solid') ? 'var(--caramel)' : '';
        });
    });
});
