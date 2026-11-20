(function () {
  const sessionKey = "pizzahaus-staff-session-v1";
  const demoUsers = [
    { username: "admin@pizzahaus.demo", password: "AdminDemo123!", role: "admin", name: "PizzaHaus Administrator" },
    { username: "clerk@pizzahaus.demo", password: "ClerkDemo123!", role: "clerk", name: "PizzaHaus Clerk" }
  ];

  function getSession() {
    try {
      const session = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
      return session && ["admin", "clerk"].includes(session.role) ? session : null;
    } catch (error) {
      console.error("Unable to read the PizzaHaus demo staff session.", error);
      try {
        sessionStorage.removeItem(sessionKey);
      } catch (removeError) {
        console.error("Unable to clear the invalid PizzaHaus demo staff session.", removeError);
      }
      return null;
    }
  }

  function signIn(username, password) {
    const user = demoUsers.find((candidate) =>
      candidate.username === String(username).trim().toLowerCase() && candidate.password === password
    );
    if (!user) return null;

    const session = { role: user.role, name: user.name };
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(session));
    } catch (error) {
      console.error("Unable to save the PizzaHaus demo staff session.", error);
      throw new Error("Sign-in could not be saved in this browser. Check session storage and try again.");
    }
    return session;
  }

  function signOut() {
    try {
      sessionStorage.removeItem(sessionKey);
    } catch (error) {
      console.error("Unable to end the PizzaHaus demo staff session.", error);
      throw new Error("Sign-out could not be completed in this browser.");
    }
  }

  function protectPage() {
    const requiredRole = document.body.dataset.staffRole;
    if (!requiredRole) return;

    const session = getSession();
    const allowed = session && (session.role === requiredRole || session.role === "admin");
    if (!allowed) {
      window.location.replace(`staff-login.html?next=${encodeURIComponent(requiredRole)}`);
      return;
    }

    const name = document.querySelector("[data-staff-name]");
    if (name) name.textContent = session.name;
    document.querySelectorAll("[data-admin-only]").forEach((element) => {
      element.hidden = session.role !== "admin";
    });
    document.querySelectorAll("[data-staff-signout]").forEach((button) => {
      button.addEventListener("click", () => {
        try {
          signOut();
          window.location.replace("staff-login.html");
        } catch (error) {
          const notice = document.querySelector("#staff-notice, #notice");
          if (notice) {
            notice.textContent = error.message;
            notice.hidden = false;
          } else {
            console.error(error);
          }
        }
      });
    });

    const protectedScripts = { admin: "admin.js", clerk: "clerk.js" };
    const scriptName = protectedScripts[requiredRole];
    if (!scriptName || document.body.dataset.staffScript !== scriptName) {
      throw new Error("The requested staff page is not configured correctly.");
    }
    const script = document.createElement("script");
    script.src = scriptName;
    script.onerror = () => {
      const notice = document.querySelector("#staff-notice, #notice");
      if (notice) {
        notice.textContent = "The staff page could not be loaded. Reload and try again.";
        notice.hidden = false;
      }
    };
    document.body.append(script);
  }

  window.PizzaHausStaff = { getSession, signIn, signOut };
  document.addEventListener("DOMContentLoaded", protectPage);
})();
