const $ = (id) => document.getElementById(id);

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}


// ==============================
// Load Categories
// ==============================

function fillCategories() {

    const categories = DB.categories();

    $("category").innerHTML = `
        <option value="">Select Category</option>
        ${categories.map(category => `
            <option value="${esc(category.id)}">
                ${esc(category.name)}
            </option>
        `).join("")}
    `;
}


// ==============================
// Render Stores Table
// ==============================

function renderTable() {

    const search = ($("search")?.value || "").toLowerCase().trim();

    let stores = DB.stores();

    if (search) {
        stores = stores.filter(store => {
            return `
                ${store.name}
                ${store.description}
                ${store.website}
            `.toLowerCase().includes(search);
        });
    }

    $("table").innerHTML = stores.length
        ? stores.map(store => {

            const category = DB.categories()
                .find(cat => cat.id === store.categoryId);

            return `
                <tr>

                    <td>
                        <strong>${esc(store.name)}</strong>
                    </td>

                    <td>
                        ${esc(category?.name || "Uncategorized")}
                    </td>

                    <td>
                        ${store.website
                            ? `<a href="${esc(store.website)}"
                                  target="_blank"
                                  rel="noopener">
                                  Visit
                               </a>`
                            : "—"
                        }
                    </td>

                    <td>
                        <span class="badge ${
                            store.status === "active"
                                ? "active-badge"
                                : "inactive-badge"
                        }">
                            ${esc(store.status)}
                        </span>
                    </td>

                    <td class="actions">

                        <button
                            type="button"
                            onclick="editStore('${esc(store.id)}')"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="danger"
                            onclick="deleteStore('${esc(store.id)}')"
                        >
                            Delete
                        </button>

                    </td>

                </tr>
            `;

        }).join("")
        : `
            <tr>
                <td colspan="5" class="muted">
                    No stores found.
                </td>
            </tr>
        `;
}


// ==============================
// Open Add/Edit Modal
// ==============================

function openStoreModal(id = "") {

    fillCategories();

    $("form").reset();

    $("id").value = id;

    $("modalTitle").textContent =
        id ? "Edit Store" : "Add Store";

    if (id) {

        const store = DB.stores()
            .find(item => item.id === id);

        if (!store) {
            alert("Store not found.");
            return;
        }

        $("name").value = store.name || "";
        $("slug").value = store.slug || "";
        $("logo").value = store.logo || "";
        $("description").value = store.description || "";
        $("category").value = store.categoryId || "";
        $("website").value = store.website || "";
        $("status").value = store.status || "active";
    }

    $("modal").classList.add("show");
}


// ==============================
// Close Modal
// ==============================

function closeModal() {
    $("modal").classList.remove("show");
}


// ==============================
// Edit Store
// ==============================

function editStore(id) {
    openStoreModal(id);
}


// ==============================
// Delete Store
// ==============================

function deleteStore(id) {

    const store = DB.stores()
        .find(item => item.id === id);

    if (!store) return;

    const confirmed = confirm(
        `Delete "${store.name}"?`
    );

    if (!confirmed) return;

    const stores = DB.stores()
        .filter(item => item.id !== id);

    DB.saveStores(stores);

    renderTable();
}


// ==============================
// Save Store
// ==============================

$("form").addEventListener("submit", function(event) {

    event.preventDefault();

    const stores = DB.stores();

    const id =
        $("id").value ||
        "store_" + Date.now();

    const name =
        $("name").value.trim();

    const slugInput =
        $("slug").value.trim();

    const slug =
        slugInput ||
        name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const store = {

        id: id,

        name: name,

        slug: slug,

        logo: $("logo").value.trim(),

        description:
            $("description").value.trim(),

        categoryId:
            $("category").value,

        website:
            $("website").value.trim(),

        status:
            $("status").value

    };


    // Basic validation

    if (!store.name) {
        alert("Please enter store name.");
        $("name").focus();
        return;
    }

    if (!store.categoryId) {
        alert("Please select a category.");
        $("category").focus();
        return;
    }


    // Update existing store

    const existingIndex =
        stores.findIndex(item => item.id === id);

    if (existingIndex !== -1) {

        stores[existingIndex] = store;

    } else {

        stores.push(store);

    }


    // Save to LocalStorage

    DB.saveStores(stores);


    // Close modal

    closeModal();


    // Refresh table

    renderTable();

});


// ==============================
// Search
// ==============================

if ($("search")) {

    $("search").addEventListener(
        "input",
        renderTable
    );

}


// ==============================
// Initial Load
// ==============================

fillCategories();

renderTable();
