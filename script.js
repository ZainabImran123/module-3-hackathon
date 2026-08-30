// Supabase Credentials Setup
const SUPABASE_URL = "https://xswkxjymswnveppratwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd2t4anltc3dudmVwcHJhdHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTQ5NTYsImV4cCI6MjEwMjM3MDk1Nn0.sOZhMZMfIBXKn9QgcPLUz9rmpwlHfNE52Bu8RBXIki0";

// Initialized as supabaseClient to prevent window global collision
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let isSignUp = false;

// DOM Element Selectors
const form = document.getElementById("auth-form");
const nameWrapper = document.getElementById("name-wrapper");
const nameInput = document.getElementById("full-name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnSubmit = document.getElementById("btn-submit");
const btnText = document.getElementById("btn-text");
const btnSpinner = document.getElementById("btn-spinner");
const toggleAuth = document.getElementById("toggle-auth");
const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");
const toggleText = document.getElementById("toggle-text");

// Helper function for SweetAlert popups
const showAlert = (icon, title, text) => {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        background: '#111827',
        color: '#f8fafc',
        confirmButtonColor: '#22d3ee',
        customClass: {
            popup: 'border border-secondary rounded-4'
        }
    });
};

// Toggle Sign In / Sign Up modes
toggleAuth.addEventListener("click", (e) => {
    e.preventDefault();
    isSignUp = !isSignUp;

    if (isSignUp) {
        formTitle.textContent = "Create Account";
        formSubtitle.textContent = "Register credentials for platform access";
        btnText.textContent = "Sign Up";
        toggleText.textContent = "Already registered?";
        toggleAuth.textContent = "Sign In";
        nameWrapper.classList.add("show");
    } else {
        formTitle.textContent = "Space Access";
        formSubtitle.textContent = "Enter your credentials to continue";
        btnText.textContent = "Sign In";
        toggleText.textContent = "Don't have an account?";
        toggleAuth.textContent = "Sign Up";
        nameWrapper.classList.remove("show");
    }
});

// Submit Handler for Email & Password Auth
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const fullName = nameInput.value.trim();

    if (!email || !password) {
        showAlert("warning", "Missing Fields", "Please fill in all required fields.");
        return;
    }

    if (isSignUp && !fullName) {
        showAlert("warning", "Name Required", "Please enter your full name to sign up.");
        return;
    }

    setLoading(true);

    try {
        if (isSignUp) {
            const { error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName }
                }
            });
            if (error) throw error;
            showAlert("success", "Welcome!", `Account created successfully, ${fullName}!`);
        } else {
            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            showAlert("success", "Welcome Back", "Authenticated successfully!");
        }
    } catch (err) {
        showAlert("error", "Authentication Error", err.message);
    } finally {
        setLoading(false);
    }
});

function setLoading(isLoading) {
    if (isLoading) {
        btnSpinner.classList.remove("d-none");
        btnText.textContent = "Processing...";
        btnSubmit.disabled = true;
    } else {
        btnSpinner.classList.add("d-none");
        btnText.textContent = isSignUp ? "Sign Up" : "Sign In";
        btnSubmit.disabled = false;
    }
}