const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const root = document.documentElement;
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");

if (navToggle && header) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const navLinks = document.querySelectorAll(".site-nav a");
const currentPath = window.location.pathname.split("/").pop() || "index.html";
const hashLinks = Array.from(navLinks).filter((link) => {
  const href = link.getAttribute("href") || "";
  const [path, hash] = href.split("#");
  return hash && (path === "" || path === "index.html");
});

navLinks.forEach((link) => {
  const href = link.getAttribute("href") || "";
  const [path, hash] = href.split("#");
  const isIndexHash = Boolean(hash) && (path === "" || path === "index.html");
  const isCurrent = (currentPath === "index.html" && isIndexHash) || (path !== "" && path === currentPath);

  if (isCurrent) {
    link.classList.add("is-active");
  }

  link.addEventListener("click", () => {
    if (header?.classList.contains("is-open")) {
      header.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });
});

if (currentPath === "index.html" && hashLinks.length > 0 && "IntersectionObserver" in window) {
  const sections = hashLinks
    .map((link) => {
      const id = (link.getAttribute("href") || "").slice(1);
      const section = document.getElementById(id);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (sections.length > 0) {
    const setActive = (id) => {
      hashLinks.forEach((link) => {
        const [, hash] = (link.getAttribute("href") || "").split("#");
        link.classList.toggle("is-active", hash === id);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      {
        rootMargin: "-18% 0px -55% 0px",
        threshold: [0.2, 0.4, 0.6],
      }
    );

    sections.forEach(({ section }) => observer.observe(section));
  }
}

const revealNodes = document.querySelectorAll("[data-reveal]");

if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealNodes.forEach((node) => revealObserver.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

document.querySelectorAll("[data-carousel-prev], [data-carousel-next]").forEach((button) => {
  const id = button.getAttribute(button.hasAttribute("data-carousel-prev") ? "data-carousel-prev" : "data-carousel-next");
  const track = id ? document.getElementById(id) : null;
  if (!track) return;

  button.addEventListener("click", () => {
    const direction = button.hasAttribute("data-carousel-next") ? 1 : -1;
    const amount = Math.min(track.clientWidth * 0.88, 420) * direction;
    track.scrollBy({ left: amount, behavior: "smooth" });
  });
});

const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const filterItems = Array.from(document.querySelectorAll("[data-filter-item]"));
const filterStatus = document.querySelector("[data-filter-status]");

if (filterButtons.length > 0 && filterItems.length > 0) {
  const setFilter = (filter) => {
    const label = filter === "all" ? "all publications" : `${filter.toUpperCase()} publications`;

    filterButtons.forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.filter === filter);
    });

    let visibleCount = 0;

    filterItems.forEach((item) => {
      const tags = (item.dataset.tags || "").toLowerCase().split(/\s+/).filter(Boolean);
      const isVisible = filter === "all" || tags.includes(filter);
      item.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (filterStatus) {
      filterStatus.textContent =
        filter === "all"
          ? `Showing all publications (${visibleCount}).`
          : `Showing ${label} (${visibleCount}).`;
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filter || "all");
    });
  });

  const initialFilter = filterButtons.find((button) => button.classList.contains("is-selected"))?.dataset.filter || "all";
  setFilter(initialFilter);
}

if (!reducedMotion.matches) {
  window.addEventListener(
    "pointermove",
    (event) => {
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      root.style.setProperty("--mx", `${x}%`);
      root.style.setProperty("--my", `${y}%`);
    },
    { passive: true }
  );

  document.querySelectorAll(".interactive-panel, .holo-panel, .content-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * 4;
      const ry = (px - 0.5) * 6;
      card.style.transform = `translateY(-4px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}
