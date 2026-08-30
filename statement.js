// Supabase Credentials Setup
const SUPABASE_URL = "https://xswkxjymswnveppratwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd2t4anltc3dudmVwcHJhdHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTQ5NTYsImV4cCI6MjEwMjM3MDk1Nn0.sOZhMZMfIBXKn9QgcPLUz9rmpwlHfNE52Bu8RBXIki0";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userEmailDisplay = document.getElementById("user-email-display");
const btnProceed = document.getElementById("btn-proceed");

// Session Check & Dynamic User Email Load
window.addEventListener("DOMContentLoaded", async () => {
    // GSAP Entry Animation
    gsap.from(".animate-wrapper", {
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: "power3.out"
    });

    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error || !session) {
        Swal.fire({
            icon: 'warning',
            title: 'Access Restricted',
            text: 'Please sign in to access the service platform specification.',
            background: '#111827',
            color: '#f8fafc',
            confirmButtonColor: '#22d3ee'
        }).then(() => {
            window.location.href = "index.html";
        });
        return;
    }

    // Display logged-in user email
    userEmailDisplay.textContent = session.user.email;
});

// Proceed Action Handler
btnProceed.addEventListener("click", () => {
    gsap.to(".animate-wrapper", {
        duration: 0.5,
        opacity: 0,
        y: -20,
        ease: "power2.in",
        onComplete: () => {
            // Next page target link (e.g., your services/dashboard catalog)
            window.location.href = "dashboard.html";
        }
    });
});