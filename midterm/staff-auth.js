(function () {
  const sessionKey = "pizzahaus-staff-session-v1";

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

  async function signIn(username, password) {
    let response;
    const normalizedUsername = String(username || "").trim();
    const normalizedPassword = String(password || "").trim();
    try {
      response = await fetch("http://127.0.0.1:8080/api.php?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
        body: new URLSearchParams({
          email: normalizedUsername,
          password: normalizedPassword
        })
      });
    } catch (error) {
      throw new Error("The database server could not be reached.");
    }

    let payload;
    try {
      payload = await response.json();
    } catch (error) {
      throw new Error("The server returned an invalid response.");
    }
    if (!response.ok) return null;

    const session = {
      role: payload.role,
      name: payload.name || (payload.role === "admin" ? "PizzaHaus Administrator" : "PizzaHaus Clerk")
    };
    if (!["admin", "clerk"].includes(session.role)) return null;

    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(session));
    } catch (error) {
      console.error("Unable to save the PizzaHaus staff session.", error);
      throw new Error("Sign-in could not be saved in this browser.");
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
      window.location.replace(`login.html?next=${encodeURIComponent(requiredRole)}`);
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
          window.location.replace("login.html");
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
