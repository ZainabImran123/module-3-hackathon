const SUPABASE_URL = "https://xswkxjymswnveppratwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd2t4anltc3dudmVwcHJhdHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTQ5NTYsImV4cCI6MjEwMjM3MDk1Nn0.sOZhMZMfIBXKn9QgcPLUz9rmpwlHfNE52Bu8RBXIki0";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userEmailDisplay = document.getElementById("user-email-display");
const dashboardGrid = document.getElementById("dashboard-grid");
const btnTabCustomer = document.getElementById("btn-tab-customer");
const btnTabProvider = document.getElementById("btn-tab-provider");
const btnLogout = document.getElementById("btn-logout");

const reviewModalEl = document.getElementById("reviewModal");
const reviewModal = new bootstrap.Modal(reviewModalEl);
const reviewForm = document.getElementById("review-form");
const reviewBookingIdInput = document.getElementById("review-booking-id");

const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

let currentUser = null;
let currentRole = 'customer'; // 'customer' or 'provider'

function initGSAPCursor() {
    if (!cursorDot || !cursorOutline) return;
    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        gsap.to(cursorDot, {
            x: posX,
            y: posY,
            duration: 0.1,
            overwrite: "auto"
        });

        gsap.to(cursorOutline, {
            x: posX,
            y: posY,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto"
        });
    });
}

window.addEventListener("DOMContentLoaded", async () => {
    initGSAPCursor();

    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error || !session) {
        window.location.href = "index.html";
        return;
    }

    currentUser = session.user;
    userEmailDisplay.textContent = currentUser.email;

    loadDashboardView();

    btnTabCustomer.addEventListener("click", () => {
        currentRole = 'customer';
        btnTabCustomer.className = "btn btn-cyber-primary text-black fw-bold px-4 py-2 rounded-start-pill";
        btnTabProvider.className = "btn btn-outline-info fw-bold px-4 py-2 rounded-end-pill";
        loadDashboardView();
    });

    btnTabProvider.addEventListener("click", () => {
        currentRole = 'provider';
        btnTabProvider.className = "btn btn-cyber-primary text-black fw-bold px-4 py-2 rounded-end-pill";
        btnTabCustomer.className = "btn btn-outline-info fw-bold px-4 py-2 rounded-start-pill";
        loadDashboardView();
    });

    btnLogout.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        window.location.href = "index.html";
    });
});

async function loadDashboardView() {
    dashboardGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-info" role="status"></div>
            <p class="text-muted-custom mt-2 small">Loading ${currentRole} bookings...</p>
        </div>
    `;

    try {
        if (currentRole === 'customer') {
            const { data, error } = await supabaseClient
                .from('bookings')
                .select('*')
                .eq('customer_email', currentUser.email)
                .order('created_at', { ascending: false });

            if (error) throw error;
            renderCustomerBookings(data || []);
        } else {
            const { data, error } = await supabaseClient
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            renderProviderBookings(data || []);
        }
    } catch (err) {
        console.error("Error loading dashboard data:", err);
        dashboardGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger small">Failed to load dashboard records from Supabase: ${err.message}</p>
            </div>
        `;
    }
}

function renderCustomerBookings(bookings) {
    if (bookings.length === 0) {
        dashboardGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted-custom small">You haven't made any booking requests yet. Visit the directory to book a provider.</p>
            </div>
        `;
        return;
    }

    dashboardGrid.innerHTML = bookings.map(b => {
        let badgeClass = 'bg-secondary text-white';
        if (b.status === 'Accepted') badgeClass = 'bg-warning text-dark';
        if (b.status === 'Completed') badgeClass = 'bg-success text-white';
        if (b.status === 'Rejected') badgeClass = 'bg-danger text-white';

        const providerName = 'Service Professional';

        return `
            <div class="col-md-6 col-lg-4">
                <div class="cyber-card p-4 rounded-4 d-flex flex-column justify-content-between h-100 border border-secondary">
                    <div>
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <span class="badge font-monospace small px-2.5 py-1 rounded-pill bg-dark text-info border border-secondary">${b.booking_id}</span>
                            <span class="badge ${badgeClass} px-2.5 py-1 rounded-pill fw-bold">${b.status || 'Pending'}</span>
                        </div>
                        <h5 class="text-white fw-bold mb-1">${b.service}</h5>
                        <p class="text-primary-accent small mb-3"><i class="bi bi-person-badge me-1"></i>Provider: ${providerName}</p>
                        
                        <div class="d-flex flex-column gap-1 text-muted-custom small mb-3">
                            <div><i class="bi bi-calendar-event me-1 text-info"></i> Date: ${b.date} at ${b.time}</div>
                            <div><i class="bi bi-geo-alt me-1 text-info"></i> Location: ${b.location}</div>
                            <div><i class="bi bi-card-text me-1 text-info"></i> Note: ${b.description}</div>
                        </div>
                    </div>

                    <div class="mt-3 pt-3 border-top border-secondary">
                        ${b.status === 'Completed' ? `
                            <button class="btn btn-outline-warning w-100 py-2 rounded-3 fw-bold btn-review-trigger" data-id="${b.id}">
                                <i class="bi bi-star-fill me-1"></i> Review Completed Service
                            </button>
                        ` : `
                            <div class="text-center text-muted-custom small font-monospace">Status: ${b.status}</div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join("");

    document.querySelectorAll(".btn-review-trigger").forEach(btn => {
        btn.addEventListener("click", (e) => {
            reviewBookingIdInput.value = e.target.getAttribute("data-id");
            reviewModal.show();
        });
    });
}

function renderProviderBookings(bookings) {
    if (bookings.length === 0) {
        dashboardGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted-custom small">No service requests found in the system pool.</p>
            </div>
        `;
        return;
    }

    dashboardGrid.innerHTML = bookings.map(b => {
        let badgeClass = 'bg-secondary text-white';
        if (b.status === 'Accepted') badgeClass = 'bg-warning text-dark';
        if (b.status === 'Completed') badgeClass = 'bg-success text-white';
        if (b.status === 'Rejected') badgeClass = 'bg-danger text-white';

        return `
            <div class="col-md-6 col-lg-4">
                <div class="cyber-card p-4 rounded-4 d-flex flex-column justify-content-between h-100 border border-secondary">
                    <div>
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <span class="badge font-monospace small px-2.5 py-1 rounded-pill bg-dark text-info border border-secondary">${b.booking_id}</span>
                            <span class="badge ${badgeClass} px-2.5 py-1 rounded-pill fw-bold">${b.status || 'Pending'}</span>
                        </div>
                        <h5 class="text-white fw-bold mb-1">${b.service}</h5>
                        <p class="text-primary-accent small mb-3"><i class="bi bi-person me-1"></i>Client: ${b.customer_email}</p>
                        
                        <div class="d-flex flex-column gap-1 text-muted-custom small mb-3">
                            <div><i class="bi bi-calendar-event me-1 text-info"></i> Date: ${b.date} at ${b.time}</div>
                            <div><i class="bi bi-geo-alt me-1 text-info"></i> Location: ${b.location}</div>
                            <div><i class="bi bi-card-text me-1 text-info"></i> Note: ${b.description}</div>
                        </div>
                    </div>

                    <div class="mt-3 pt-3 border-top border-secondary d-flex gap-2">
                        ${b.status === 'Pending' ? `
                            <button class="btn btn-outline-success flex-fill py-2 rounded-3 fw-bold btn-action" data-id="${b.id}" data-status="Accepted">Accept</button>
                            <button class="btn btn-outline-danger flex-fill py-2 rounded-3 fw-bold btn-action" data-id="${b.id}" data-status="Rejected">Reject</button>
                        ` : b.status === 'Accepted' ? `
                            <button class="btn btn-outline-info w-100 py-2 rounded-3 fw-bold btn-action" data-id="${b.id}" data-status="Completed">Mark as Completed</button>
                        ` : `
                            <button class="btn btn-dark w-100 py-2 rounded-3 fw-bold text-success border border-success" disabled>Finished</button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join("");

    document.querySelectorAll(".btn-action").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.getAttribute("data-id");
            const newStatus = e.target.getAttribute("data-status");
            await updateBookingStatus(id, newStatus);
        });
    });
}

async function updateBookingStatus(id, status) {
    try {
        const { error } = await supabaseClient
            .from('bookings')
            .update({ status: status })
            .eq('id', id);

        if (error) throw error;

        Swal.fire({
            icon: 'success',
            title: `Request ${status}`,
            text: `Booking status updated successfully.`,
            background: '#111827',
            color: '#f8fafc',
            confirmButtonColor: '#22d3ee'
        });

        loadDashboardView();
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Action Failed', text: err.message, background: '#111827', color: '#f8fafc', confirmButtonColor: '#22d3ee' });
    }
}

reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rating = document.getElementById("review-rating").value;
    const comment = document.getElementById("review-comment").value.trim();
    const bookingId = reviewBookingIdInput.value;

    try {
        const { error } = await supabaseClient
            .from('bookings')
            .update({ rating: parseInt(rating), feedback: comment })
            .eq('id', bookingId);

        if (error) throw error;

        reviewModal.hide();

        Swal.fire({
            icon: 'success',
            title: 'Review Submitted!',
            text: 'Thank you for rating your service provider experience.',
            background: '#111827',
            color: '#f8fafc',
            confirmButtonColor: '#22d3ee'
        });
        reviewForm.reset();
        loadDashboardView();
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Submission Failed', text: err.message, background: '#111827', color: '#f8fafc', confirmButtonColor: '#22d3ee' });
    }
});