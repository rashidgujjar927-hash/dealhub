/* =========================================================
   DEALHUB - FRONTEND APP.JS
   ========================================================= */


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

/**
 * HTML escape
 * User/admin ke entered data ko safe HTML mein convert karta hai.
 */
function esc(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        function (char) {

            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[char];
        }
    );
}


/**
 * Category by ID
 */
function getCategoryById(id) {

    return DB
        .categories()
        .find(category => category.id === id);
}


/**
 * Store by ID
 */
function getStoreById(id) {

    return DB
        .stores()
        .find(store => store.id === id);
}


/**
 * Store logo
 */
function getStoreLogo(store) {

    if (store.logo) {

        return `
            <img
                src="${esc(store.logo)}"
                alt="${esc(store.name)}"
                loading="lazy"
            >
        `;

    }

    return esc(
        (store.name || "?")
            .trim()
            .charAt(0)
            .toUpperCase()
    );
}


/* =========================================================
   COPY COUPON CODE
   ========================================================= */

function copyCode(code, button) {

    if (!code) {
        return;
    }


    /*
     * Modern browsers
     */
    if (navigator.clipboard) {

        navigator.clipboard
            .writeText(code)
            .then(function () {

                showCopied(button);

            })
            .catch(function () {

                fallbackCopy(code, button);

            });

        return;
    }


    /*
     * Fallback
     */
    fallbackCopy(code, button);
}


function fallbackCopy(code, button) {

    const textarea =
        document.createElement("textarea");

    textarea.value = code;

    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.select();

    try {

        document.execCommand("copy");

        showCopied(button);

    } catch (error) {

        alert("Please copy the coupon code manually: " + code);

    }

    document.body.removeChild(textarea);
}


function showCopied(button) {

    if (!button) {
        return;
    }

    const oldText =
        button.textContent;

    button.textContent = "Copied!";

    setTimeout(function () {

        button.textContent = oldText;

    }, 1200);
}


/* =========================================================
   STORE CARD
   ========================================================= */

function storeCard(store) {

    const coupons =
        DB
            .coupons()
            .filter(function (coupon) {

                return (
                    coupon.storeId === store.id &&
                    coupon.status !== "inactive"
                );

            });


    const category =
        getCategoryById(store.categoryId);


    return `
        <a
            class="store-card"
            href="coupons.html?store=${encodeURIComponent(store.id)}"
        >

            <div class="store-logo">

                ${getStoreLogo(store)}

            </div>


            <h3>
                ${esc(store.name)}
            </h3>


            <div class="muted">

                ${esc(
                    category?.name ||
                    "Uncategorized"
                )}

            </div>


            <div class="count">

                ${coupons.length}
                coupon${coupons.length === 1 ? "" : "s"}

            </div>

        </a>
    `;
}


/* =========================================================
   COUPON CARD
   ========================================================= */

function couponCard(coupon) {

    const store =
        getStoreById(coupon.storeId);


    const storeName =
        store?.name || "Store";


    /*
     * Coupon code button
     */
    let codeHTML = "";


    if (coupon.code) {

        const safeCode =
            esc(coupon.code);


        codeHTML = `
            <div class="coupon-code">

                <strong>
                    ${safeCode}
                </strong>

                <button
                    type="button"
                    class="copy-btn"
                    onclick="
                        event.preventDefault();
                        event.stopPropagation();
                        copyCode('${safeCode}', this);
                    "
                >
                    Copy
                </button>

            </div>
        `;

    }


    return `
        <article class="coupon-card">

            <div class="coupon-top">

                <span class="muted">
                    ${esc(storeName)}
                </span>


                <span class="discount">

                    ${esc(
                        coupon.discount ||
                        "DEAL"
                    )}

                </span>

            </div>


            <h3>

                ${esc(coupon.title)}

            </h3>


            <p class="muted">

                ${esc(
                    coupon.description ||
                    "Special offer available now."
                )}

            </p>


            <small class="muted">

                Expires:
                ${esc(
                    coupon.expiry ||
                    "No expiry"
                )}

            </small>


            ${codeHTML}

        </article>
    `;
}


/* =========================================================
   CATEGORY CARD
   ========================================================= */

function categoryCard(category) {

    const stores =
        DB
            .stores()
            .filter(function (store) {

                return (
                    store.categoryId === category.id &&
                    store.status !== "inactive"
                );

            });


    const coupons =
        DB
            .coupons()
            .filter(function (coupon) {

                const store =
                    getStoreById(coupon.storeId);

                return (
                    store &&
                    store.categoryId === category.id &&
                    coupon.status !== "inactive"
                );

            });


    return `
        <a
            class="category-card"
            href="coupons.html?category=${encodeURIComponent(category.id)}"
        >

            <div class="category-icon">

                ${esc(
                    category.icon ||
                    "🏷️"
                )}

            </div>


            <h3>

                ${esc(category.name)}

            </h3>


            <span class="muted">

                ${stores.length}
                store${stores.length === 1 ? "" : "s"}

                •
                
                ${coupons.length}
                coupon${coupons.length === 1 ? "" : "s"}

            </span>

        </a>
    `;
}


/* =========================================================
   HOME PAGE
   ========================================================= */

function renderHome() {

    const categoryContainer =
        document.getElementById(
            "homeCategories"
        );


    const storeContainer =
        document.getElementById(
            "homeStores"
        );


    const couponContainer =
        document.getElementById(
            "homeCoupons"
        );


    /*
     * Agar current page par ye elements nahi hain
     * to function stop kar dega.
     */

    if (
        !categoryContainer &&
        !storeContainer &&
        !couponContainer
    ) {

        return;

    }


    /* =========================
       CATEGORIES
       ========================= */

    if (categoryContainer) {

        const categories =
            DB
                .categories()
                .filter(function (category) {

                    return category.status !== "inactive";

                })
                .slice(0, 8);


        if (categories.length) {

            categoryContainer.innerHTML =
                categories
                    .map(categoryCard)
                    .join("");

        } else {

            categoryContainer.innerHTML = `
                <div class="empty">

                    No categories yet.

                </div>
            `;
        }
    }


    /* =========================
       STORES
       ========================= */

    if (storeContainer) {

        const stores =
            DB
                .stores()
                .filter(function (store) {

                    return store.status !== "inactive";

                })
                .slice(0, 8);


        if (stores.length) {

            storeContainer.innerHTML =
                stores
                    .map(storeCard)
                    .join("");

        } else {

            storeContainer.innerHTML = `
                <div class="empty">

                    No stores yet.
                    Add stores from Admin.

                </div>
            `;
        }
    }


    /* =========================
       COUPONS
       ========================= */

    if (couponContainer) {

        const coupons =
            DB
                .coupons()
                .filter(function (coupon) {

                    return coupon.status !== "inactive";

                })
                .slice(0, 6);


        if (coupons.length) {

            couponContainer.innerHTML =
                coupons
                    .map(couponCard)
                    .join("");

        } else {

            couponContainer.innerHTML = `
                <div class="empty">

                    No coupons yet.

                </div>
            `;
        }
    }
}


/* =========================================================
   STORE FILTERS
   ========================================================= */

function initStoreFilters() {

    const categorySelect =
        document.getElementById(
            "storeCategory"
        );


    if (!categorySelect) {
        return;
    }


    const categories =
        DB.categories();


    categorySelect.innerHTML = `
        <option value="">
            All categories
        </option>
    `;


    categorySelect.innerHTML +=
        categories
            .map(function (category) {

                return `
                    <option
                        value="${esc(category.id)}"
                    >
                        ${esc(category.name)}
                    </option>
                `;

            })
            .join("");
}


/* =========================================================
   STORES PAGE
   ========================================================= */

function renderStoresPage() {

    const container =
        document.getElementById(
            "storesList"
        );


    if (!container) {
        return;
    }


    const searchInput =
        document.getElementById(
            "storeSearch"
        );


    const categorySelect =
        document.getElementById(
            "storeCategory"
        );


    const query =
        (
            searchInput?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const categoryId =
        categorySelect?.value ||
        "";


    let stores =
        DB
            .stores()
            .filter(function (store) {

                return store.status !== "inactive";

            });


    /*
     * Search
     */

    if (query) {

        stores =
            stores.filter(function (store) {

                const text = `
                    ${store.name}
                    ${store.description}
                    ${store.slug}
                `.toLowerCase();


                return text.includes(query);

            });
    }


    /*
     * Category filter
     */

    if (categoryId) {

        stores =
            stores.filter(function (store) {

                return store.categoryId === categoryId;

            });
    }


    /*
     * Render
     */

    if (!stores.length) {

        container.innerHTML = `
            <div class="empty">

                No stores found.

            </div>
        `;

        return;
    }


    container.innerHTML =
        stores
            .map(storeCard)
            .join("");
}


/* =========================================================
   COUPON FILTERS
   ========================================================= */

function initCouponFilters() {

    const storeSelect =
        document.getElementById(
            "couponStore"
        );


    const categorySelect =
        document.getElementById(
            "couponCategory"
        );


    /*
     * Store dropdown
     */

    if (storeSelect) {

        storeSelect.innerHTML = `
            <option value="">
                All stores
            </option>
        `;


        storeSelect.innerHTML +=
            DB
                .stores()
                .filter(function (store) {

                    return store.status !== "inactive";

                })
                .map(function (store) {

                    return `
                        <option
                            value="${esc(store.id)}"
                        >
                            ${esc(store.name)}
                        </option>
                    `;

                })
                .join("");
    }


    /*
     * Category dropdown
     */

    if (categorySelect) {

        categorySelect.innerHTML = `
            <option value="">
                All categories
            </option>
        `;


        categorySelect.innerHTML +=
            DB
                .categories()
                .filter(function (category) {

                    return category.status !== "inactive";

                })
                .map(function (category) {

                    return `
                        <option
                            value="${esc(category.id)}"
                        >
                            ${esc(category.name)}
                        </option>
                    `;

                })
                .join("");
    }


    /*
     * URL parameters
     *
     * Example:
     * coupons.html?store=store_nike
     * coupons.html?category=cat_fashion
     * coupons.html?search=nike
     */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const search =
        params.get("search");


    const store =
        params.get("store");


    const category =
        params.get("category");


    const searchInput =
        document.getElementById(
            "couponSearch"
        );


    if (
        searchInput &&
        search
    ) {

        searchInput.value = search;

    }


    if (
        storeSelect &&
        store
    ) {

        storeSelect.value = store;

    }


    if (
        categorySelect &&
        category
    ) {

        categorySelect.value = category;

    }
}


/* =========================================================
   COUPONS PAGE
   ========================================================= */

function renderCouponsPage() {

    const container =
        document.getElementById(
            "couponsList"
        );


    if (!container) {
        return;
    }


    const searchInput =
        document.getElementById(
            "couponSearch"
        );


    const storeSelect =
        document.getElementById(
            "couponStore"
        );


    const categorySelect =
        document.getElementById(
            "couponCategory"
        );


    const query =
        (
            searchInput?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const storeId =
        storeSelect?.value ||
        "";


    const categoryId =
        categorySelect?.value ||
        "";


    let coupons =
        DB
            .coupons()
            .filter(function (coupon) {

                return coupon.status !== "inactive";

            });


    /*
     * Search
     */

    if (query) {

        coupons =
            coupons.filter(function (coupon) {

                const store =
                    getStoreById(
                        coupon.storeId
                    );


                const text = `
                    ${coupon.title}
                    ${coupon.description}
                    ${coupon.code}
                    ${coupon.discount}
                    ${store?.name || ""}
                `.toLowerCase();


                return text.includes(query);

            });
    }


    /*
     * Store filter
     */

    if (storeId) {

        coupons =
            coupons.filter(function (coupon) {

                return coupon.storeId === storeId;

            });
    }


    /*
     * Category filter
     */

    if (categoryId) {

        coupons =
            coupons.filter(function (coupon) {

                const store =
                    getStoreById(
                        coupon.storeId
                    );


                return (
                    store &&
                    store.categoryId === categoryId
                );

            });
    }


    /*
     * Render
     */

    if (!coupons.length) {

        container.innerHTML = `
            <div class="empty">

                No coupons found.

            </div>
        `;

        return;
    }


    container.innerHTML =
        coupons
            .map(couponCard)
            .join("");
}


/* =========================================================
   CATEGORIES PAGE
   ========================================================= */

function renderCategoriesPage() {

    const container =
        document.getElementById(
            "categoriesList"
        );


    if (!container) {
        return;
    }


    const categories =
        DB
            .categories()
            .filter(function (category) {

                return category.status !== "inactive";

            });


    if (!categories.length) {

        container.innerHTML = `
            <div class="empty">

                No categories found.

            </div>
        `;

        return;
    }


    container.innerHTML =
        categories
            .map(categoryCard)
            .join("");
}


/* =========================================================
   HOME SEARCH
   ========================================================= */

function searchHome() {

    const input =
        document.getElementById(
            "homeSearch"
        );


    if (!input) {
        return;
    }


    const query =
        input.value.trim();


    if (!query) {

        window.location.href =
            "coupons.html";

        return;
    }


    window.location.href =
        "coupons.html?search=" +
        encodeURIComponent(query);
}


/* =========================================================
   ENTER KEY SEARCH
   ========================================================= */

function initHomeSearch() {

    const input =
        document.getElementById(
            "homeSearch"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                searchHome();

            }

        }
    );
}


/* =========================================================
   AUTO INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Home
         */
        renderHome();


        /*
         * Stores
         */
        initStoreFilters();
        renderStoresPage();


        /*
         * Coupons
         */
        initCouponFilters();
        renderCouponsPage();


        /*
         * Categories
         */
        renderCategoriesPage();


        /*
         * Home search
         */
        initHomeSearch();

    }
);
