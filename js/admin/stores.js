// ==========================================
// DEALHUB - ADMIN STORES
// ==========================================

function getEl(id) {
    return document.getElementById(id);
}


// ==========================================
// Open Add Store Modal
// ==========================================

function openStoreModal() {

    console.log("openStoreModal() called");

    const modal = getEl("modal");
    const form = getEl("form");

    if (!modal) {
        alert("Error: #modal not found in stores.html");
        return;
    }

    if (form) {
        form.reset();
    }

    getEl("id").value = "";

    getEl("modalTitle").textContent = "Add Store";

    getEl("status").value = "active";

    loadCategories();

    modal.classList.add("show");
}


// ==========================================
// Close Modal
// ==========================================

function closeModal() {

    const modal = getEl("modal");

    if (modal) {
        modal.classList.remove("show");
    }
}


// ==========================================
// Load Categories
// ==========================================

function loadCategories() {

    const categorySelect = getEl("category");

    if (!categorySelect) return;


    let categories = [];

    try {
        categories = DB.categories();
    } catch (error) {

        console.error("Category error:", error);

        alert("storage.js mein problem hai.");

        return;
    }


    categorySelect.innerHTML =
        '<option value="">Select Category</option>';


    categories.forEach(function(category) {

        const option =
            document.createElement("option");

        option.value = category.id;

        option.textContent = category.name;

        categorySelect.appendChild(option);

    });
}


// ==========================================
// Render Stores
// ==========================================

function renderTable() {

    const table = getEl("table");

    if (!table) return;


    let stores = [];

    try {
        stores = DB.stores();
    } catch (error) {

        console.error("Stores error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Error loading stores.
                </td>
            </tr>
        `;

        return;
    }


    const search =
        (getEl("search")?.value || "")
        .toLowerCase()
        .trim();


    if (search) {

        stores = stores.filter(function(store) {

            return (
                (store.name || "")
                    .toLowerCase()
                    .includes(search)
                ||
                (store.description || "")
                    .toLowerCase()
                    .includes(search)
            );

        });

    }


    if (stores.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    No stores found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = "";


    stores.forEach(function(store) {

        const category =
            DB.categories().find(function(cat) {
                return cat.id === store.categoryId;
            });


        const couponCount =
            DB.coupons().filter(function(coupon) {
                return coupon.storeId === store.id;
            }).length;


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${store.name || ""}
                </strong>
            </td>

            <td>
                ${category ? category.name : "Uncategorized"}
            </td>

            <td>
                ${couponCount}
            </td>

            <td>
                <span class="badge ${
                    store.status === "active"
                        ? "active-badge"
                        : "inactive-badge"
                }">
                    ${store.status || "active"}
                </span>
            </td>

            <td class="actions">

                <button
                    type="button"
                    onclick="editStore('${store.id}')">
                    Edit
                </button>

                <button
                    type="button"
                    class="danger"
                    onclick="deleteStore('${store.id}')">
                    Delete
                </button>

            </td>

        `;


        table.appendChild(row);

    });
}


// ==========================================
// Edit Store
// ==========================================

function editStore(id) {

    const stores = DB.stores();

    const store =
        stores.find(function(item) {
            return item.id === id;
        });


    if (!store) {

        alert("Store not found.");

        return;
    }


    loadCategories();


    getEl("id").value = store.id;

    getEl("name").value =
        store.name || "";

    getEl("slug").value =
        store.slug || "";

    getEl("logo").value =
        store.logo || "";

    getEl("website").value =
        store.website || "";

    getEl("category").value =
        store.categoryId || "";

    getEl("description").value =
        store.description || "";

    getEl("status").value =
        store.status || "active";


    getEl("modalTitle").textContent =
        "Edit Store";


    getEl("modal").classList.add("show");
}


// ==========================================
// Delete Store
// ==========================================

function deleteStore(id) {

    const stores = DB.stores();

    const store =
        stores.find(function(item) {
            return item.id === id;
        });


    if (!store) return;


    if (!confirm(
        'Delete "' + store.name + '"?'
    )) {
        return;
    }


    const updatedStores =
        stores.filter(function(item) {
            return item.id !== id;
        });


    DB.saveStores(updatedStores);


    renderTable();
}


// ==========================================
// Save Store
// ==========================================

function saveStore(event) {

    event.preventDefault();


    const name =
        getEl("name").value.trim();


    const category =
        getEl("category").value;


    if (!name) {

        alert("Please enter Store Name.");

        return;
    }


    if (!category) {

        alert("Please select a Category.");

        return;
    }


    const stores = DB.stores();


    let id =
        getEl("id").value;


    if (!id) {

        id =
            "store_" + Date.now();

    }


    let slug =
        getEl("slug").value.trim();


    if (!slug) {

        slug =
            name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

    }


    const store = {

        id: id,

        name: name,

        slug: slug,

        logo:
            getEl("logo").value.trim(),

        website:
            getEl("website").value.trim(),

        categoryId:
            category,

        description:
            getEl("description").value.trim(),

        status:
            getEl("status").value

    };


    const index =
        stores.findIndex(function(item) {
            return item.id === id;
        });


    if (index >= 0) {

        stores[index] = store;

    } else {

        stores.push(store);

    }


    DB.saveStores(stores);


    closeModal();

    renderTable();

}


// ==========================================
// Search
// ==========================================

function setupSearch() {

    const search =
        getEl("search");


    if (!search) return;


    search.addEventListener(
        "input",
        renderTable
    );

}


// ==========================================
// Initialize
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log("Stores JS loaded");

        loadCategories();

        renderTable();

        setupSearch();


        const form =
            getEl("form");


        if (form) {

            form.addEventListener(
                "submit",
                saveStore
            );

        }

    }
);
