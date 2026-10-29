(() => {
  const buttons = [...document.querySelectorAll("[data-filter]")];
  const projects = [...document.querySelectorAll(".project[data-category]")];

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter;
      buttons.forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      projects.forEach((project) => {
        const categories = project.dataset.category.split(" ");
        project.hidden = selected !== "all" && !categories.includes(selected);
      });
    });
  });
})();
