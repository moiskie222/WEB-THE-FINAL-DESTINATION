const loginForm = document.querySelector("#staff-login-form");
const loginError = document.querySelector("#staff-login-error");

function openStaffHome(session) {
  window.location.replace(session.role === "admin" ? "admin.html" : "clerk.html");
}

const existingSession = window.PizzaHausStaff.getSession();
if (existingSession) openStaffHome(existingSession);

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginError.hidden = true;
  const formData = new FormData(loginForm);
  try {
    const session = window.PizzaHausStaff.signIn(formData.get("username"), formData.get("password"));
    if (!session) {
      loginError.textContent = "The email or password did not match a demo staff account.";
      loginError.hidden = false;
      return;
    }
    openStaffHome(session);
  } catch (error) {
    loginError.textContent = error.message;
    loginError.hidden = false;
  }
});
