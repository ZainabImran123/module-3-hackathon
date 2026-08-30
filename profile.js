const SUPABASE_URL = "https://xswkxjymswnveppratwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd2t4anltc3dudmVwcHJhdHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTQ5NTYsImV4cCI6MjEwMjM3MDk1Nn0.sOZhMZMfIBXKn9QgcPLUz9rmpwlHfNE52Bu8RBXIki0";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userEmailDisplay = document.getElementById("user-email-display");
const profilesGrid = document.getElementById("profiles-grid");

const detailModalEl = document.getElementById("providerDetailModal");
const detailModal = new bootstrap.Modal(detailModalEl);

const modalName = document.getElementById("modal-provider-name");
const modalSpec = document.getElementById("modal-provider-spec");
const modalExp = document.getElementById("modal-provider-exp");
const modalRate = document.getElementById("modal-provider-rate");
const modalEmail = document.getElementById("modal-provider-email");
const modalBio = document.getElementById("modal-provider-bio");

const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

function initGSAPCursor() {
    if (!cursorDot || !cursorOutline) return;
    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        gsap.to(cursorDot, { x: posX, y: posY, duration: 0.1, overwrite: "auto" });
        gsap.to(cursorOutline, { x: posX, y: posY, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    });
}

window.addEventListener("DOMContentLoaded", async () => {
    initGSAPCursor();

    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error || !session) {
        window.location.href = "index.html";
        return;
    }

    userEmailDisplay.textContent = session.user.email;
    loadProvidersProfileGrid();
});

async function loadProvidersProfileGrid() {
    try {
        const { data, error } = await supabaseClient
            .from('providers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderProfiles(data || []);
    } catch (err) {
        console.error("Error loading providers:", err);
        profilesGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger small">Failed to load profiles from database: ${err.message}</p>
            </div>
        `;
    }
}

function renderProfiles(providers) {
    if (providers.length === 0) {
        profilesGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted-custom small">No provider profiles available right now.</p>
            </div>
        `;
        return;
    }

    profilesGrid.innerHTML = providers.map(p => `
        <div class="col-md-6 col-lg-4">
            <div class="cyber-card p-4 rounded-4 d-flex flex-column justify-content-between h-100 border border-secondary provider-card-clickable" 
                 style="cursor: pointer;"
                 data-name="${p.name || 'Professional Expert'}"
                 data-specialization="${p.specialization || p.service || 'General Services'}"
                 data-experience="${p.experience || '3+ Years'}"
                 data-rate="${p.rate || '$50/hr'}"
                 data-email="${p.email || 'contact@cyberservices.com'}"
                 data-bio="${p.bio || p.description || 'Verified specialist ready to assist with high-grade requirements and infrastructure support.'}">
                <div>
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <span class="badge font-monospace small px-2.5 py-1 rounded-pill bg-dark text-info border border-secondary">Verified Expert</span>
                        <span class="text-primary-accent fw-bold">${p.rate || '$50/hr'}</span>
                    </div>
                    <h5 class="text-white fw-bold mb-1">${p.name || 'Service Provider'}</h5>
                    <p class="text-primary-accent small mb-3"><i class="bi bi-tools me-1"></i>${p.specialization || p.service || 'Infrastructure Support'}</p>
                    
                    <div class="d-flex flex-column gap-1 text-muted-custom small mb-3">
                        <div><i class="bi bi-briefcase me-1 text-info"></i> Experience: ${p.experience || '3+ Years'}</div>
                        <div><i class="bi bi-envelope me-1 text-info"></i> ${p.email || 'Verified Account'}</div>
                    </div>
                </div>

                <div class="mt-3 pt-3 border-top border-secondary text-center">
                    <span class="text-info small fw-bold"><i class="bi bi-info-circle me-1"></i> Click card for details</span>
                </div>
            </div>
        </div>
    `).join("");

    // Add click listeners to open modal with respective provider info
    document.querySelectorAll(".provider-card-clickable").forEach(card => {
        card.addEventListener("click", () => {
            modalName.textContent = card.getAttribute("data-name");
            modalSpec.textContent = card.getAttribute("data-specialization");
            modalExp.textContent = card.getAttribute("data-experience");
            modalRate.textContent = card.getAttribute("data-rate");
            modalEmail.textContent = card.getAttribute("data-email");
            modalBio.textContent = card.getAttribute("data-bio");

            detailModal.show();
        });
    });
}