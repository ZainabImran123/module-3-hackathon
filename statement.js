const SUPABASE_URL = "https://xswkxjymswnveppratwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd2t4anltc3dudmVwcHJhdHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTQ5NTYsImV4cCI6MjEwMjM3MDk1Nn0.sOZhMZMfIBXKn9QgcPLUz9rmpwlHfNE52Bu8RBXIki0";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userEmailDisplay = document.getElementById("user-email-display");
const btnLogout = document.getElementById("btn-logout");
const providersGrid = document.getElementById("providers-grid");
const providerCountBadge = document.getElementById("provider-count-badge");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");

const bookingModalEl = document.getElementById("bookingModal");
const bookingModal = new bootstrap.Modal(bookingModalEl);
const bookingForm = document.getElementById("booking-form");
const modalProviderId = document.getElementById("modal-provider-id");
const modalProviderName = document.getElementById("modal-provider-name");
const modalProviderService = document.getElementById("modal-provider-service");
const modalServiceDisplay = document.getElementById("modal-service-display");
const btnSubmitBooking = document.getElementById("btn-submit-booking");
const bookingBtnText = document.getElementById("booking-btn-text");
const bookingSpinner = document.getElementById("booking-spinner");

let allProviders = [];
let userBookings = [];
let currentUser = null;

const cursorDot = document.createElement("div");
const cursorOutline = document.createElement("div");

function initCustomCursor() {
    cursorDot.className = "cursor-dot";
    cursorOutline.className = "cursor-outline";
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);

    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
    });
}

window.addEventListener("DOMContentLoaded", async () => {
    initCustomCursor();

    gsap.from(".animate-wrapper", {
        duration: 0.8,
        y: 20,
        opacity: 0,
        ease: "power3.out"
    });

    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error || !session) {
        window.location.href = "index.html";
        return;
    }

    currentUser = session.user;
    userEmailDisplay.textContent = currentUser.email;

    await fetchUserBookings();
    await fetchProviders();
});

async function fetchUserBookings() {
    try {
        const { data, error } = await supabaseClient
            .from('bookings')
            .select('*')
            .eq('customer_email', currentUser.email);
        if (error) throw error;
        userBookings = data || [];
    } catch (err) {
        console.error("Error fetching user bookings:", err);
        userBookings = [];
    }
}

async function fetchProviders() {
    try {
        const { data, error } = await supabaseClient.from('providers').select('*');
        if (error) throw error;
        allProviders = data || [];
        providerCountBadge.textContent = `${allProviders.length} Active`;
        renderProviders(allProviders);
    } catch (err) {
        console.error("Error fetching providers:", err);
        providersGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger small"><i class="bi bi-exclamation-circle me-1"></i> Failed to load providers from Supabase.</p>
            </div>
        `;
        providerCountBadge.textContent = "0 Active";
    }
}

function renderProviders(providers) {
    if (providers.length === 0) {
        providersGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted-custom small">No service providers found matching your criteria.</p>
            </div>
        `;
        return;
    }

    providersGrid.innerHTML = providers.map(p => {
        // Check if user already has an active booking request for this provider
        const existingBooking = userBookings.find(b => b.provider_id === p.id);
        const bookingStatus = existingBooking ? existingBooking.status : null;

        let actionButtonHTML = '';
        if (bookingStatus) {
            const badgeClass = bookingStatus === 'Accepted' ? 'bg-success text-white' : 'bg-warning text-dark';
            actionButtonHTML = `
                <button class="btn btn-dark w-100 py-2 rounded-3 fw-bold ${badgeClass} border border-secondary" disabled>
                    <i class="bi bi-clock-history me-1"></i> Request Status: ${bookingStatus}
                </button>
            `;
        } else {
            actionButtonHTML = `
                <button class="btn btn-cyber-primary w-100 py-2 rounded-3 fw-bold text-black border-0 btn-book-trigger"
                    data-id="${p.id}" 
                    data-name="${p.name}" 
                    data-service="${p.service_offered || p.category}">
                    Book Request
                </button>
            `;
        }

        return `
            <div class="col-md-6 col-lg-4">
                <div class="cyber-card p-4 rounded-4 d-flex flex-column justify-content-between h-100 border border-secondary position-relative">
                    <div>
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <span class="badge bg-dark text-info border border-secondary px-2.5 py-1 rounded-pill small">${p.category || 'Service'}</span>
                            <span class="text-warning small fw-bold"><i class="bi bi-star-fill me-1"></i>${p.rating || '4.8'}</span>
                        </div>
                        <h5 class="text-white fw-bold mb-1">${p.name}</h5>
                        <p class="text-primary-accent small mb-3"><i class="bi bi-tools me-1"></i>${p.service_offered || p.category}</p>
                        
                        <div class="d-flex flex-column gap-1 text-muted-custom small mb-3">
                            <div><i class="bi bi-geo-alt me-1 text-info"></i> ${p.location || 'Local Area'}</div>
                            <div><i class="bi bi-briefcase me-1 text-info"></i> ${p.experience || '3+'} Years Experience</div>
                            <div><i class="bi bi-tag me-1 text-info"></i> $${p.price_per_hour || '50'}/hr rate</div>
                        </div>
                    </div>

                    <div class="mt-3">
                        ${actionButtonHTML}
                    </div>
                </div>
            </div>
        `;
    }).join("");

    document.querySelectorAll(".btn-book-trigger").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            const name = e.target.getAttribute("data-name");
            const service = e.target.getAttribute("data-service");

            modalProviderId.value = id;
            modalProviderName.textContent = `Book ${name}`;
            modalServiceDisplay.value = service;
            modalProviderService.value = service;

            bookingModal.show();
        });
    });
}

function filterProviders() {
    const query = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filtered = allProviders.filter(p => {
        const matchesQuery = (p.name && p.name.toLowerCase().includes(query)) ||
            (p.service_offered && p.service_offered.toLowerCase().includes(query)) ||
            (p.location && p.location.toLowerCase().includes(query));
        const matchesCategory = selectedCategory === "" || p.category === selectedCategory;
        return matchesQuery && matchesCategory;
    });

    renderProviders(filtered);
}

searchInput.addEventListener("input", filterProviders);
categoryFilter.addEventListener("change", filterProviders);

bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const providerId = modalProviderId.value;
    const service = modalProviderService.value;
    const date = document.getElementById("booking-date").value;
    const time = document.getElementById("booking-time").value;
    const location = document.getElementById("booking-location").value.trim();
    const description = document.getElementById("booking-description").value.trim();

    const uniqueBookingId = 'BK-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    bookingSpinner.classList.remove("d-none");
    bookingBtnText.textContent = "Submitting...";
    btnSubmitBooking.disabled = true;

    try {
        const { error } = await supabaseClient.from('bookings').insert([
            {
                booking_id: uniqueBookingId,
                customer_email: currentUser.email,
                provider_id: providerId,
                service: service,
                date: date,
                time: time,
                location: location,
                description: description,
                status: 'Pending'
            }
        ]);

        if (error) throw error;

        bookingModal.hide();
        bookingForm.reset();

        await Swal.fire({
            icon: 'success',
            title: 'Request Sent!',
            text: `Your booking request has been sent successfully.`,
            background: '#111827',
            color: '#f8fafc',
            confirmButtonColor: '#22d3ee'
        });

        // Refresh bookings and update UI state directly on the page without redirecting
        await fetchUserBookings();
        filterProviders();

    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Booking Failed', text: err.message, background: '#111827', color: '#f8fafc', confirmButtonColor: '#22d3ee' });
    } finally {
        bookingSpinner.classList.add("d-none");
        bookingBtnText.textContent = "Confirm & Submit Request";
        btnSubmitBooking.disabled = false;
    }
});

btnLogout.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "index.html";
});