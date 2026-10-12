document.addEventListener("DOMContentLoaded", () => {
    includeHTML();
  });
  
  function includeHTML() {
    document.querySelectorAll("[data-include]").forEach(async (el) => {
      const file = el.getAttribute("data-include");
      try {
        const resp = await fetch(file);
        if (resp.ok) {
          const text = await resp.text();
          el.innerHTML = text;
          const year = el.querySelector('#currentYear');
          if (year) year.textContent = new Date().getFullYear();
          el.querySelectorAll("script").forEach((oldScript) => {
            const newScript = document.createElement("script");
            newScript.textContent = oldScript.textContent;
            document.body.appendChild(newScript);
          });
        } else {
          el.innerHTML = "<!-- File not found: " + file + " -->";
        }
      } catch (error) {
        el.innerHTML = "<!-- Error loading: " + file + " -->";
      }
    });
  }
