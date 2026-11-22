const loginForm = document.querySelector("#staff-login-form");
const loginError = document.querySelector("#staff-login-error");

function openStaffHome(session) {
  window.location.replace(session.role === "admin" ? "admin.html" : "clerk.html");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.hidden = true;
  const formData = new FormData(loginForm);
  const submitButton = loginForm.querySelector("button[type=\"submit\"]");
  submitButton.disabled = true;
  try {
    window.PizzaHausStaff.signOut();
    const session = await window.PizzaHausStaff.signIn(formData.get("username"), formData.get("password"));
    if (!session) {
      loginError.textContent = "Invalid email or password.";
      loginError.hidden = false;
      window.alert("Invalid email or password.");
      submitButton.disabled = false;
      return;
    }
    openStaffHome(session);
  } catch (error) {
    loginError.textContent = error.message;
    loginError.hidden = false;
    window.alert("Invalid email or password.");
    submitButton.disabled = false;
  }
});
