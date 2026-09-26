const $ = (id) => document.getElementById(id);


// ========================================
// Escape HTML
// ========================================

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char];
    });
}


// ========================================
// Load Categories
// ========================================

function fillCategories() {

    const categories = DB.categories();

    const categorySelect = $("category");

    if (!categorySelect) return;

    categorySelect.innerHTML = `
        <option value="">Select Category</option>
        ${categories.map(category => `
            <option value="${esc(category.id)}">
                ${esc(category.name)}
            </option>
        `).join("")}
    `;
}


// ========================================
// Render Stores
// ========================================

function renderTable() {

    const table = $("table");

    if (!table) return;

    const searchInput = $("search");

    const search = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    let stores = DB.stores();

    if (search) {

        stores = stores.filter(store => {

            return `
                ${store.name || ""}
                ${store.description || ""}
                ${store.website || ""}
            `.toLowerCase().includes(search);

        });

    }


    if (!stores.length) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="muted">
                    No stores found.
                </td>
            </tr>
        `;

        return;
    }


    const coupons = DB.coupons();

    table.innerHTML = stores.map(store => {

        const category = DB.categories().find(
            category => category.id === store.categoryId
        );


        const couponCount = coupons.filter(
            coupon => coupon.storeId === store.id
        ).length;


        return `
            <tr>

                <td>
                    <strong>
                        ${esc(store.name)}
                    </strong>
                </td>


                <td>
                    ${esc(category?.name || "Uncategorized")}
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

                        ${esc(store.status || "active")}

                    </span>

                </td>


                <td class="actions">

                    <button
                        type="button"
                        onclick="editStore('${esc(store.id)}')">

                        Edit

                    </button>


                    <button
                        type="button"
                        class="danger"
                        onclick="deleteStore('${esc(store.id)}')">

                        Delete

                    </button>

                </td>

            </tr>
        `;

    }).join("");
}


// ========================================
// Open Add / Edit Modal
// ========================================

function openStoreModal(id = "") {

    fillCategories();

    $("form").reset();

    $("id").value = id;

    $("modalTitle").textContent =
        id ? "Edit Store" : "Add Store";


    // Add Store
    if (!id) {

        $("status").value = "active";

        $("modal").classList.add("show");

        return;
    }


    // Edit Store

    const store = DB.stores().find(
        item => item.id === id
    );


    if (!store) {

        alert("Store not found.");

        return;
    }


    $("name").value =
        store.name || "";

    $("slug").value =
        store.slug || "";

    $("logo").value =
        store.logo || "";

    $("website").value =
        store.website || "";

    $("category").value =
        store.categoryId || "";

    $("description").value =
        store.description || "";

    $("status").value =
        store.status || "active";


    $("modal").classList.add("show");
}


// ========================================
// Close Modal
// ========================================

function closeModal() {

    $("modal").classList.remove("show");

}


// ========================================
// Edit Store
// ========================================

function editStore(id) {

    openStoreModal(id);

}


// ========================================
// Delete Store
// ========================================

function deleteStore(id) {

    const store = DB.stores().find(
        item => item.id === id
    );


    if (!store) return;


    const confirmed = confirm(
        `Delete "${store.name}"?`
    );


    if (!confirmed) return;


    const stores = DB.stores().filter(
        item => item.id !== id
    );


    DB.saveStores(stores);


    renderTable();

}


// ========================================
// Save Store
// ========================================

$("form").addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            $("name").value.trim();


        const categoryId =
            $("category").value;


        // Validate name

        if (!name) {

            alert("Please enter store name.");

            $("name").focus();

            return;
        }


        // Validate category

        if (!categoryId) {

            alert("Please select a category.");

            $("category").focus();

            return;
        }


        // Existing ID or new ID

        const id =
            $("id").value ||
            "store_" + Date.now();


        // Generate slug automatically

        let slug =
            $("slug").value.trim();


        if (!slug) {

            slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

        }


        const store = {

            id: id,

            name: name,

            slug: slug,

            logo:
                $("logo").value.trim(),

            website:
                $("website").value.trim(),

            categoryId:
                categoryId,

            description:
                $("description").value.trim(),

            status:
                $("status").value || "active"

        };


        const stores = DB.stores();


        // Check existing store

        const existingIndex =
            stores.findIndex(
                item => item.id === id
            );


        if (existingIndex !== -1) {

            // Update

            stores[existingIndex] = store;

        } else {

            // Add new

            stores.push(store);

        }


        // Save LocalStorage

        DB.saveStores(stores);


        // Close

        closeModal();


        // Refresh table

        renderTable();

    }
);


// ========================================
// Search
// ========================================

if ($("search")) {

    $("search").addEventListener(
        "input",
        renderTable
    );

}


// ========================================
// Close modal when clicking outside
// ========================================

$("modal").addEventListener(
    "click",
    function (event) {

        if (event.target === $("modal")) {

            closeModal();

        }

    }
);


// ========================================
// Initial Load
// ========================================

fillCategories();

renderTable();
