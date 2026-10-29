(() => {
  const cards = [...document.querySelectorAll(".project-card")];
  const filters = [...document.querySelectorAll("[data-filter]")];
  for (const filter of filters) {
    filter.addEventListener("click", () => {
      const category = filter.dataset.filter;
      filters.forEach((button) => {
        const selected = button === filter;
        button.setAttribute("aria-pressed", String(selected));
      });
      cards.forEach((card) => {
        card.hidden = category !== "all" && card.dataset.category !== category;
      });
    });
  }
})();
