// ======================================
// MEDICINE DATA
// ======================================

let medicines =
    JSON.parse(localStorage.getItem("medicines")) || [];


// ======================================
// EDIT MODE
// ======================================

let editingMedicineId = null;


// ======================================
// ELEMENTS
// ======================================

const form =
    document.getElementById("medicineForm");

const medicineList =
    document.getElementById("medicineList");

const alertsContainer =
    document.getElementById("alertsContainer");

const searchMedicine =
    document.getElementById("searchMedicine");

const categoryFilter =
    document.getElementById("categoryFilter");

const sortMedicine =
    document.getElementById("sortMedicine");


// ======================================
// ADD / UPDATE MEDICINE
// ======================================

form.addEventListener("submit", function(event) {

    event.preventDefault();


    const name =
        document.getElementById("medicineName").value.trim();

    const batch =
        document.getElementById("batchNumber").value.trim();

    const expiry =
        document.getElementById("expiryDate").value;

    const quantity =
        Number(document.getElementById("quantity").value);

    const category =
        document.getElementById("category").value;


    // UPDATE EXISTING MEDICINE

    if (editingMedicineId !== null) {

        const medicine =
            medicines.find(function(item) {

                return item.id === editingMedicineId;

            });


        if (medicine) {

            medicine.name = name;
            medicine.batch = batch;
            medicine.expiry = expiry;
            medicine.quantity = quantity;
            medicine.category = category;

        }


        editingMedicineId = null;


        document.getElementById("formTitle").textContent =
            "Add Medicine";

        document.getElementById("submitButton").textContent =
            "➕ Add Medicine";

        document.getElementById("cancelEditButton").style.display =
            "none";

    }


    // ADD NEW MEDICINE

    else {

        const medicine = {

            id: Date.now(),

            name: name,

            batch: batch,

            expiry: expiry,

            quantity: quantity,

            category: category

        };


        medicines.push(medicine);

    }


    saveMedicines();

    form.reset();

    refreshApp();

});


// ======================================
// SAVE DATA
// ======================================

function saveMedicines() {

    localStorage.setItem(
        "medicines",
        JSON.stringify(medicines)
    );

}


// ======================================
// DAYS REMAINING
// ======================================

function getDaysRemaining(expiryDate) {

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const expiry = new Date(expiryDate);

    expiry.setHours(0, 0, 0, 0);


    const difference =
        expiry.getTime() - today.getTime();


    return Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );

}


// ======================================
// STATUS
// ======================================

function getStatus(daysRemaining) {

    if (daysRemaining < 0) {

        return "Expired";

    }


    if (daysRemaining <= 30) {

        return "Expiring Soon";

    }


    return "Safe";

}


// ======================================
// DATE FORMAT
// ======================================

function formatDate(dateString) {

    const parts =
        dateString.split("-");


    if (parts.length !== 3) {

        return dateString;

    }


    return `${parts[2]}-${parts[1]}-${parts[0]}`;

}


// ======================================
// DISPLAY MEDICINES
// ======================================

function displayMedicines() {

    const searchText =
        searchMedicine.value.toLowerCase().trim();


    const selectedCategory =
        categoryFilter.value;


    const selectedSort =
        sortMedicine.value;


    let filteredMedicines =
        medicines.filter(function(medicine) {

            const matchesSearch =
                medicine.name
                    .toLowerCase()
                    .includes(searchText);


            const matchesCategory =
                selectedCategory === "All" ||
                medicine.category === selectedCategory;


            return matchesSearch && matchesCategory;

        });


    // SORT BY EXPIRY

    if (selectedSort === "nearest") {

        filteredMedicines.sort(function(a, b) {

            return new Date(a.expiry) -
                   new Date(b.expiry);

        });

    }


    else if (selectedSort === "farthest") {

        filteredMedicines.sort(function(a, b) {

            return new Date(b.expiry) -
                   new Date(a.expiry);

        });

    }


    // SORT BY NAME

    else if (selectedSort === "name") {

        filteredMedicines.sort(function(a, b) {

            return a.name.localeCompare(b.name);

        });

    }


    // NO RESULTS

    if (filteredMedicines.length === 0) {

        medicineList.innerHTML =
            `<p class="empty-message">
                No medicines found.
            </p>`;

        return;

    }


    medicineList.innerHTML = "";


    // CREATE MEDICINE CARDS

    filteredMedicines.forEach(function(medicine) {

        const daysRemaining =
            getDaysRemaining(medicine.expiry);


        const status =
            getStatus(daysRemaining);


        let statusClass = "safe";


        if (status === "Expiring Soon") {

            statusClass = "expiring";

        }


        if (status === "Expired") {

            statusClass = "expired";

        }


        // DAYS MESSAGE

        let daysText = "";

        let daysClass = "days-safe";


        if (daysRemaining < 0) {

            daysText =
                `🔴 Expired ${Math.abs(daysRemaining)} day(s) ago`;

            daysClass = "days-expired";

        }


        else if (daysRemaining === 0) {

            daysText =
                "⚠️ Expires today";

            daysClass = "days-warning";

        }


        else if (daysRemaining <= 30) {

            daysText =
                `⏳ Expires in ${daysRemaining} day(s)`;

            daysClass = "days-warning";

        }


        else {

            daysText =
                `✅ Expires in ${daysRemaining} day(s)`;

            daysClass = "days-safe";

        }


        // CREATE CARD

        const medicineCard =
            document.createElement("div");


        medicineCard.className =
            "medicine-card";


        medicineCard.innerHTML = `

            <div class="medicine-info">

                <h3>
                    💊 ${medicine.name}
                </h3>

                <p>
                    <strong>Batch:</strong>
                    ${medicine.batch}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${medicine.category}
                </p>

                <p>
                    <strong>Quantity:</strong>
                    ${medicine.quantity}
                </p>

                <p>
                    <strong>Expiry Date:</strong>
                    ${formatDate(medicine.expiry)}
                </p>

                <p class="days-remaining ${daysClass}">
                    ${daysText}
                </p>

            </div>


            <div class="medicine-actions">

                <span class="status ${statusClass}">
                    ${status}
                </span>


                <button
                    class="edit-btn"
                    onclick="editMedicine(${medicine.id})"
                >
                    ✏️ Edit
                </button>


                <button
                    class="delete-btn"
                    onclick="deleteMedicine(${medicine.id})"
                >
                    🗑️ Delete
                </button>

            </div>

        `;


        medicineList.appendChild(medicineCard);

    });

}


// ======================================
// DASHBOARD
// ======================================

function updateDashboard() {

    let safe = 0;

    let expiring = 0;

    let expired = 0;


    medicines.forEach(function(medicine) {

        const daysRemaining =
            getDaysRemaining(medicine.expiry);


        if (daysRemaining < 0) {

            expired++;

        }

        else if (daysRemaining <= 30) {

            expiring++;

        }

        else {

            safe++;

        }

    });


    document.getElementById("totalMedicines").textContent =
        medicines.length;


    document.getElementById("safeMedicines").textContent =
        safe;


    document.getElementById("expiringMedicines").textContent =
        expiring;


    document.getElementById("expiredMedicines").textContent =
        expired;

}


// ======================================
// ALERTS
// ======================================

function displayAlerts() {

    alertsContainer.innerHTML = "";


    if (medicines.length === 0) {

        alertsContainer.innerHTML =
            `<p class="empty-message">
                No alerts at the moment.
            </p>`;

        return;

    }


    let alertCount = 0;


    medicines.forEach(function(medicine) {

        const daysRemaining =
            getDaysRemaining(medicine.expiry);


        // EXPIRED

        if (daysRemaining < 0) {

            const alert =
                document.createElement("div");


            alert.className =
                "alert-card expired-alert";


            alert.innerHTML = `

                <strong>
                    🔴 ${medicine.name}
                </strong>

                <p>
                    This medicine has expired.
                </p>

                <small>
                    Expired ${Math.abs(daysRemaining)} day(s) ago
                    • Expiry Date: ${formatDate(medicine.expiry)}
                </small>

            `;


            alertsContainer.appendChild(alert);

            alertCount++;

        }


        // EXPIRING SOON

        else if (daysRemaining <= 30) {

            const alert =
                document.createElement("div");


            alert.className =
                "alert-card";


            alert.innerHTML = `

                <strong>
                    🟠 ${medicine.name}
                </strong>

                <p>
                    This medicine is expiring soon.
                </p>

                <small>
                    ⏳ ${daysRemaining} day(s) remaining
                    • Expiry Date: ${formatDate(medicine.expiry)}
                </small>

            `;


            alertsContainer.appendChild(alert);

            alertCount++;

        }


        // LOW STOCK

        if (medicine.quantity <= 10) {

            const alert =
                document.createElement("div");


            alert.className =
                "alert-card low-stock-alert";


            alert.innerHTML = `

                <strong>
                    📦 Low Stock: ${medicine.name}
                </strong>

                <p>
                    Stock is running low.
                </p>

                <small>
                    Only ${medicine.quantity} unit(s) remaining
                </small>

            `;


            alertsContainer.appendChild(alert);

            alertCount++;

        }

    });


    if (alertCount === 0) {

        alertsContainer.innerHTML =
            `<p class="empty-message">
                ✅ No alerts at the moment.
            </p>`;

    }

}


// ======================================
// EDIT MEDICINE
// ======================================

function editMedicine(id) {

    const medicine =
        medicines.find(function(item) {

            return item.id === id;

        });


    if (!medicine) {

        return;

    }


    editingMedicineId = id;


    document.getElementById("medicineName").value =
        medicine.name;


    document.getElementById("batchNumber").value =
        medicine.batch;


    document.getElementById("expiryDate").value =
        medicine.expiry;


    document.getElementById("quantity").value =
        medicine.quantity;


    document.getElementById("category").value =
        medicine.category;


    document.getElementById("formTitle").textContent =
        "Edit Medicine";


    document.getElementById("submitButton").textContent =
        "💾 Update Medicine";


    document.getElementById("cancelEditButton").style.display =
        "block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ======================================
// CANCEL EDIT
// ======================================

function cancelEdit() {

    editingMedicineId = null;


    form.reset();


    document.getElementById("formTitle").textContent =
        "Add Medicine";


    document.getElementById("submitButton").textContent =
        "➕ Add Medicine";


    document.getElementById("cancelEditButton").style.display =
        "none";

}


// ======================================
// DELETE MEDICINE
// ======================================

function deleteMedicine(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this medicine?"
        );


    if (!confirmDelete) {

        return;

    }


    medicines =
        medicines.filter(function(medicine) {

            return medicine.id !== id;

        });


    saveMedicines();


    refreshApp();

}


// ======================================
// SEARCH
// ======================================

searchMedicine.addEventListener(
    "input",
    displayMedicines
);


// ======================================
// CATEGORY FILTER
// ======================================

categoryFilter.addEventListener(
    "change",
    displayMedicines
);


// ======================================
// SORT
// ======================================

sortMedicine.addEventListener(
    "change",
    displayMedicines
);


// ======================================
// REFRESH EVERYTHING
// ======================================

function refreshApp() {

    displayMedicines();

    updateDashboard();

    displayAlerts();

}


// ======================================
// INITIAL LOAD
// ======================================

refreshApp();