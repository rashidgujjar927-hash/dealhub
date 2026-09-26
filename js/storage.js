```javascript
/*
|--------------------------------------------------------------------------
| DealHub - LocalStorage Database
|--------------------------------------------------------------------------
| Ye file website ke tamam data ko browser LocalStorage mein manage karti hai.
|
| Data:
|   - Stores
|   - Coupons
|   - Categories
|
| Admin panel aur frontend dono isi DB object ko use karenge.
|--------------------------------------------------------------------------
*/


const DB = {

    /*
    |--------------------------------------------------------------------------
    | LocalStorage Keys
    |--------------------------------------------------------------------------
    */

    key: {

        stores: "dealhub_stores",

        coupons: "dealhub_coupons",

        categories: "dealhub_categories"

    },


    /*
    |--------------------------------------------------------------------------
    | Generic GET
    |--------------------------------------------------------------------------
    */

    get(key) {

        try {

            const data = localStorage.getItem(key);

            if (!data) {
                return [];
            }

            return JSON.parse(data);

        } catch (error) {

            console.error(
                "LocalStorage read error:",
                error
            );

            return [];

        }

    },


    /*
    |--------------------------------------------------------------------------
    | Generic SAVE
    |--------------------------------------------------------------------------
    */

    save(key, data) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(data)
            );

            return true;

        } catch (error) {

            console.error(
                "LocalStorage save error:",
                error
            );

            return false;

        }

    },


    /*
    |--------------------------------------------------------------------------
    | STORES
    |--------------------------------------------------------------------------
    */


    getStores() {

        return this.get(
            this.key.stores
        );

    },


    saveStores(stores) {

        return this.save(
            this.key.stores,
            stores
        );

    },


    /*
    |--------------------------------------------------------------------------
    | COUPONS
    |--------------------------------------------------------------------------
    */


    getCoupons() {

        return this.get(
            this.key.coupons
        );

    },


    saveCoupons(coupons) {

        return this.save(
            this.key.coupons,
            coupons
        );

    },


    /*
    |--------------------------------------------------------------------------
    | CATEGORIES
    |--------------------------------------------------------------------------
    */


    getCategories() {

        return this.get(
            this.key.categories
        );

    },


    saveCategories(categories) {

        return this.save(
            this.key.categories,
            categories
        );

    },


    /*
    |--------------------------------------------------------------------------
    | FIND STORE
    |--------------------------------------------------------------------------
    */

    getStoreById(id) {

        const stores = this.getStores();

        return stores.find(
            store => store.id === id
        ) || null;

    },


    /*
    |--------------------------------------------------------------------------
    | FIND COUPON
    |--------------------------------------------------------------------------
    */

    getCouponById(id) {

        const coupons = this.getCoupons();

        return coupons.find(
            coupon => coupon.id === id
        ) || null;

    },


    /*
    |--------------------------------------------------------------------------
    | FIND CATEGORY
    |--------------------------------------------------------------------------
    */

    getCategoryById(id) {

        const categories =
            this.getCategories();

        return categories.find(
            category => category.id === id
        ) || null;

    },


    /*
    |--------------------------------------------------------------------------
    | GENERATE ID
    |--------------------------------------------------------------------------
    */

    generateId(prefix = "item") {

        return (
            prefix +
            "_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );

    },


    /*
    |--------------------------------------------------------------------------
    | ADD STORE
    |--------------------------------------------------------------------------
    */

    addStore(store) {

        const stores =
            this.getStores();

        const newStore = {

            id:
                store.id ||
                this.generateId("store"),

            name:
                store.name || "",

            slug:
                store.slug || "",

            logo:
                store.logo || "",

            description:
                store.description || "",

            categoryId:
                store.categoryId || "",

            website:
                store.website || "",

            status:
                store.status || "active",

            createdAt:
                store.createdAt ||
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        stores.push(newStore);

        this.saveStores(stores);

        return newStore;

    },


    /*
    |--------------------------------------------------------------------------
    | UPDATE STORE
    |--------------------------------------------------------------------------
    */

    updateStore(id, updatedData) {

        const stores =
            this.getStores();

        const index =
            stores.findIndex(
                store => store.id === id
            );


        if (index === -1) {

            return null;

        }


        stores[index] = {

            ...stores[index],

            ...updatedData,

            id: stores[index].id,

            updatedAt:
                new Date().toISOString()

        };


        this.saveStores(stores);

        return stores[index];

    },


    /*
    |--------------------------------------------------------------------------
    | DELETE STORE
    |--------------------------------------------------------------------------
    |
    | Store delete karne ke saath uske related
    | coupons bhi delete ho jayenge.
    |--------------------------------------------------------------------------
    */

    deleteStore(id) {

        const stores =
            this.getStores();

        const updatedStores =
            stores.filter(
                store => store.id !== id
            );


        this.saveStores(
            updatedStores
        );


        /*
        | Related coupons remove
        */

        const coupons =
            this.getCoupons();

        const updatedCoupons =
            coupons.filter(
                coupon => coupon.storeId !== id
            );


        this.saveCoupons(
            updatedCoupons
        );


        return true;

    },


    /*
    |--------------------------------------------------------------------------
    | ADD COUPON
    |--------------------------------------------------------------------------
    */

    addCoupon(coupon) {

        const coupons =
            this.getCoupons();

        const newCoupon = {

            id:
                coupon.id ||
                this.generateId("coupon"),

            storeId:
                coupon.storeId || "",

            title:
                coupon.title || "",

            code:
                coupon.code || "",

            discount:
                coupon.discount || "",

            description:
                coupon.description || "",

            expiry:
                coupon.expiry || "",

            type:
                coupon.type || "code",

            status:
                coupon.status || "active",

            createdAt:
                coupon.createdAt ||
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        coupons.push(newCoupon);

        this.saveCoupons(coupons);

        return newCoupon;

    },


    /*
    |--------------------------------------------------------------------------
    | UPDATE COUPON
    |--------------------------------------------------------------------------
    */

    updateCoupon(id, updatedData) {

        const coupons =
            this.getCoupons();

        const index =
            coupons.findIndex(
                coupon => coupon.id === id
            );


        if (index === -1) {

            return null;

        }


        coupons[index] = {

            ...coupons[index],

            ...updatedData,

            id: coupons[index].id,

            updatedAt:
                new Date().toISOString()

        };


        this.saveCoupons(coupons);

        return coupons[index];

    },


    /*
    |--------------------------------------------------------------------------
    | DELETE COUPON
    |--------------------------------------------------------------------------
    */

    deleteCoupon(id) {

        const coupons =
            this.getCoupons();

        const updatedCoupons =
            coupons.filter(
                coupon => coupon.id !== id
            );


        this.saveCoupons(
            updatedCoupons
        );


        return true;

    },


    /*
    |--------------------------------------------------------------------------
    | ADD CATEGORY
    |--------------------------------------------------------------------------
    */

    addCategory(category) {

        const categories =
            this.getCategories();

        const newCategory = {

            id:
                category.id ||
                this.generateId("category"),

            name:
                category.name || "",

            slug:
                category.slug || "",

            icon:
                category.icon || "🏷️",

            status:
                category.status || "active",

            createdAt:
                category.createdAt ||
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        categories.push(
            newCategory
        );


        this.saveCategories(
            categories
        );


        return newCategory;

    },


    /*
    |--------------------------------------------------------------------------
    | UPDATE CATEGORY
    |--------------------------------------------------------------------------
    */

    updateCategory(id, updatedData) {

        const categories =
            this.getCategories();

        const index =
            categories.findIndex(
                category =>
                    category.id === id
            );


        if (index === -1) {

            return null;

        }


        categories[index] = {

            ...categories[index],

            ...updatedData,

            id:
                categories[index].id,

            updatedAt:
                new Date().toISOString()

        };


        this.saveCategories(
            categories
        );


        return categories[index];

    },


    /*
    |--------------------------------------------------------------------------
    | DELETE CATEGORY
    |--------------------------------------------------------------------------
    |
    | Agar category kisi store mein use ho rahi hai
    | to delete nahi hogi.
    |--------------------------------------------------------------------------
    */

    deleteCategory(id) {

        const stores =
            this.getStores();


        const categoryUsed =
            stores.some(
                store =>
                    store.categoryId === id
            );


        if (categoryUsed) {

            return {

                success: false,

                message:
                    "This category is being used by one or more stores."

            };

        }


        const categories =
            this.getCategories();


        const updatedCategories =
            categories.filter(
                category =>
                    category.id !== id
            );


        this.saveCategories(
            updatedCategories
        );


        return {

            success: true

        };

    },


    /*
    |--------------------------------------------------------------------------
    | STATISTICS
    |--------------------------------------------------------------------------
    */

    getStats() {

        return {

            stores:
                this.getStores().length,

            coupons:
                this.getCoupons().length,

            categories:
                this.getCategories().length

        };

    },


    /*
    |--------------------------------------------------------------------------
    | RESET DATABASE
    |--------------------------------------------------------------------------
    */

    clearAll() {

        localStorage.removeItem(
            this.key.stores
        );

        localStorage.removeItem(
            this.key.coupons
        );

        localStorage.removeItem(
            this.key.categories
        );

    },


    /*
    |--------------------------------------------------------------------------
    | DEMO DATA
    |--------------------------------------------------------------------------
    |
    | First time website open hone par demo data create hoga.
    |--------------------------------------------------------------------------
    */

    seed() {

        /*
        | Agar categories already exist hain
        | to dobara create nahi hongi.
        */

        if (
            !localStorage.getItem(
                this.key.categories
            )
        ) {

            this.saveCategories([

                {
                    id: "cat_fashion",

                    name: "Fashion",

                    slug: "fashion",

                    icon: "👕",

                    status: "active",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()
                },


                {
                    id: "cat_electronics",

                    name: "Electronics",

                    slug: "electronics",

                    icon: "💻",

                    status: "active",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()
                },


                {
                    id: "cat_home",

                    name: "Home & Garden",

                    slug: "home-garden",

                    icon: "🏠",

                    status: "active",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()
                },


                {
                    id: "cat_travel",

                    name: "Travel",

                    slug: "travel",

                    icon: "✈️",

                    status: "active",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()
                }

            ]);

        }


        /*
        |--------------------------------------------------------------------------
        | Demo Stores
        |--------------------------------------------------------------------------
        */

        if (
            !localStorage.getItem(
                this.key.stores
            )
        ) {

            this.saveStores([

                {
                    id: "store_nike",

                    name: "Nike",

                    slug: "nike",

                    logo: "",

                    description:
                        "Sportswear, shoes and apparel.",

                    categoryId:
                        "cat_fashion",

                    website:
                        "https://nike.com",

                    status: "active",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()
                },


                {
                    id: "store_samsung",

                    name: "Samsung",

                    slug: "samsung",

                    logo: "",

                    description:
                        "Phones, TVs and electronics.",

                    categoryId:
                        "cat_electronics",

                    website:
                        "https://samsung.com",

                    status: "active",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()
                },


                {
                    id: "store_ikea",

                    name: "IKEA",

                    slug: "ikea",

                    logo: "",

                    description:
                        "Furniture and home essentials.",

                    categoryId:
                        "cat_home",

                    website:
                        "https://ikea.com",

                    status: "active",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()
                },


                {
                    id: "store_booking",

                    name: "Booking.com",

                    slug: "booking-com",

                    logo: "",

                    description:
                        "Hotels and travel stays.",

                    categoryId:
                        "cat_travel",

                    website:
                        "https://booking.com",

                    status: "active",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()
                }

            ]);

        }


        /*
        |--------------------------------------------------------------------------
        | Demo Coupons
        |--------------------------------------------------------------------------
        */

        if (
            !localStorage.getItem(
                this.key.coupons
            )
        ) {

            this.saveCoupons([

                {
                    id: "coupon_1",

                    storeId:
                        "store_nike",

                    title:
                        "20% Off Selected Items",

                    code:
                        "SAVE20",

                    discount:
                        "20%",

                    description:
                        "Save 20% on selected Nike products.",

                    expiry:
                        "2026-12-31",

                    type:
                        "code",

                    status:
                        "active",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()
                },


                {
                    id: "coupon_2",

                    storeId:
                        "store_samsung",

                    title:
                        "15% Off Electronics",

                    code:
                        "TECH15",

                    discount:
                        "15%",

                    description:
                        "Get discount on selected Samsung electronics.",

                    expiry:
                        "2026-11-30",

                    type:
                        "code",

                    status:
                        "active",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()
                },


                {
                    id: "coupon_3",

                    storeId:
                        "store_ikea",

                    title:
                        "10% Off Home Essentials",

                    code:
                        "HOME10",

                    discount:
                        "10%",

                    description:
                        "Save on selected IKEA home products.",

                    expiry:
                        "2026-10-31",

                    type:
                        "code",

                    status:
                        "active",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()
                }

            ]);

        }

    }

};


/*
|--------------------------------------------------------------------------
| Initialize Database
|--------------------------------------------------------------------------
|
| Website load hote hi agar data nahi hai
| to demo data automatically create hoga.
|--------------------------------------------------------------------------
*/

DB.seed();
```
