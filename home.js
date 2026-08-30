const SUPABASE_URL = "https://xswkxjymswnveppratwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd2t4anltc3dudmVwcHJhdHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTQ5NTYsImV4cCI6MjEwMjM3MDk1Nn0.sOZhMZMfIBXKn9QgcPLUz9rmpwlHfNE52Bu8RBXIki0";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userEmailDisplay = document.getElementById("user-email-display");
const btnLogout = document.getElementById("btn-logout");
const statProviders = document.getElementById("stat-providers");

const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

function initGSAPCursor() {
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

    gsap.from(".animate-wrapper", {
        duration: 0.9,
        y: 25,
        opacity: 0,
        ease: "power3.out"
    });

    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error || !session) {
        window.location.href = "index.html";
        return;
    }

    userEmailDisplay.textContent = session.user.email;

    try {
        const { count, error: countError } = await supabaseClient
            .from('providers')
            .select('*', { count: 'exact', head: true });

        if (!countError && count !== null) {
            statProviders.textContent = `${count}+`;
        }
    } catch (err) {
        console.error("Could not fetch provider counts:", err);
    }
});

btnLogout.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "index.html";
});