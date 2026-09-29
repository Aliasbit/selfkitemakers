(function () {
  const STORAGE_KEY = "language";
  const STRINGS = {
    en: {
      "nav.label": "Section navigation",
      "nav.kiteSizes": "Kite sizes",
      "nav.calculator": "Calculator",
      "nav.paper": "Paper Information",
      "nav.thread": "Thread Information",
      "body.paper": "Coming soon",
      "body.thread": "Coming soon",
      "menu.open": "Open menu",
      "menu.close": "Close",
      "brand.alt": "Lahore Self Kite Makers",
      "title.suffix": "Self Kite Makers",
      "lang.choose": "Choose language",
      "lang.current": "English",
    },
    ur: {
      "nav.label": "حصوں کی فہرست",
      "nav.kiteSizes": "پتنگ کے سائز",
      "nav.calculator": "کیلکولیٹر",
      "nav.paper": "کاغذ کی معلومات",
      "nav.thread": "ڈور کی معلومات",
      "body.paper": "جلد آ رہا ہے",
      "body.thread": "جلد آ رہا ہے",
      "menu.open": "مینیو کھولیں",
      "menu.close": "بند کریں",
      "brand.alt": "لاہور سیلف کائٹ میکرز",
      "title.suffix": "سیلف کائٹ میکرز",
      "lang.choose": "زبان منتخب کریں",
      "lang.current": "اردو",
    },
  };

  const sidebar = document.getElementById("sidebar");
  const pageTitle = document.getElementById("page-title");
  const languageModal = document.getElementById("language-modal");
  const languageClose = document.getElementById("language-modal-close");
  const languageToggle = document.getElementById("language-toggle");
  const languageLabel = document.getElementById("language-toggle-label");
  const triggers = Array.from(document.querySelectorAll("#section-nav [data-bs-toggle='pill']"));
  const known = new Set(triggers.map((trigger) => trigger.getAttribute("href")));

  let savedLanguage = readLanguage();
  let currentLanguage = savedLanguage || "en";

  function readLanguage() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "en" || value === "ur" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function writeLanguage(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      // Keep the in-memory choice when storage is blocked.
    }
  }

  function t(key) {
    return STRINGS[currentLanguage][key];
  }

  function markLanguageChoices() {
    document.querySelectorAll(".language-choice").forEach((button) => {
      const selected = savedLanguage !== null && button.getAttribute("data-lang") === savedLanguage;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function applyLanguage(lang) {
    currentLanguage = lang;
    const strings = STRINGS[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = strings[el.getAttribute("data-i18n")];
      if (value == null) return;
      const attr = el.getAttribute("data-i18n-attr");
      if (attr) {
        el.setAttribute(attr, value);
      } else {
        el.textContent = value;
      }
    });
    languageLabel.textContent = strings["lang.current"];
    languageToggle.setAttribute("aria-label", strings["lang.choose"] + ": " + strings["lang.current"]);
    markLanguageChoices();
    const active = document.querySelector("#section-nav .nav-link.active");
    if (active) {
      pageTitle.textContent = active.textContent.trim();
      document.title = pageTitle.textContent + " · " + strings["title.suffix"];
    }
    updateBambooSizeLabels();
  }

  function updateBambooSizeLabels() {
    const key = currentLanguage === "ur" ? "data-ur" : "data-en";
    document.querySelectorAll("#bamboo-size option, .bamboo-paper-unit option").forEach((option) => {
      const label = option.getAttribute(key);
      if (label) option.textContent = label;
    });
  }

  const languageModalInstance = new bootstrap.Modal(languageModal, {
    backdrop: true,
    keyboard: true,
  });

  function closeLanguageModal() {
    if (!languageModal.classList.contains("show")) {
      return;
    }
    languageModalInstance.hide();
    if (languageModal.classList.contains("show")) {
      languageModal.addEventListener("shown.bs.modal", () => {
        languageModalInstance.hide();
      }, { once: true });
    }
  }

  function openLanguageModal() {
    if (languageModal.classList.contains("show")) {
      return;
    }
    languageClose.classList.toggle("d-none", savedLanguage === null);
    markLanguageChoices();
    const stillHiding = languageModal.style.display === "block";
    if (stillHiding) {
      languageModal.addEventListener("hidden.bs.modal", () => {
        languageModalInstance.show();
      }, { once: true });
      return;
    }
    languageModalInstance.show();
  }

  function sectionId(trigger) {
    return trigger.getAttribute("href").slice(1);
  }

  function labelFor(trigger) {
    return trigger.textContent.trim();
  }

  function closeSidebar() {
    const instance = bootstrap.Offcanvas.getInstance(sidebar);
    if (instance) {
      instance.hide();
    }
  }

  function syncChrome(trigger) {
    const id = sectionId(trigger);
    const label = labelFor(trigger);
    pageTitle.textContent = label;
    document.title = label + " · " + t("title.suffix");
    if (location.hash !== "#" + id) {
      history.replaceState(null, "", "#" + id);
    }
  }

  function showSection(hash) {
    if (hash === "#bamboo-calculator") hash = "#calculator";
    const target = known.has(hash) ? hash : "#kite-sizes";
    const trigger = triggers.find((item) => item.getAttribute("href") === target);
    if (trigger.classList.contains("active")) {
      syncChrome(trigger);
      return;
    }
    bootstrap.Tab.getOrCreateInstance(trigger).show();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("shown.bs.tab", (event) => {
      syncChrome(event.target);
      closeSidebar();
    });
  });

  function pinToTop() {
    const snap = () => {
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
      const focused = document.activeElement;
      if (focused && focused.classList.contains("tab-pane")) {
        focused.blur();
      }
    };
    snap();
    requestAnimationFrame(() => {
      snap();
      requestAnimationFrame(snap);
    });
  }

  window.addEventListener("hashchange", () => {
    showSection(location.hash);
    pinToTop();
  });

  window.addEventListener("load", pinToTop);

  document.querySelectorAll(".home-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const hash = link.getAttribute("href");
      if (location.hash !== hash) {
        history.pushState(null, "", hash);
      }
      showSection(hash);
      closeSidebar();
      pinToTop();
    });
  });

  languageToggle.addEventListener("click", () => {
    openLanguageModal();
  });

  languageModal.addEventListener("hide.bs.modal", (event) => {
    if (savedLanguage === null) {
      event.preventDefault();
    }
  });

  languageModal.addEventListener("hidden.bs.modal", () => {
    if (savedLanguage !== null) {
      languageToggle.focus();
    }
  });

  document.querySelectorAll(".language-choice").forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.getAttribute("data-lang");
      savedLanguage = next;
      writeLanguage(next);
      applyLanguage(next);
      closeLanguageModal();
    });
  });

  function formatAmount(value) {
    return String(Math.round(value));
  }

  function readNumber(input) {
    if (!input) return null;
    const raw = input.value.trim();
    const price = Number(raw);
    if (raw === "" || !Number.isFinite(price) || price < 0) return null;
    return price;
  }

  function readPaperCost(panel) {
    return readNumber(panel.querySelector("input.bamboo-paper-value"));
  }

  function readAdvancedPaperCost(panel) {
    const unit = panel.querySelector(".bamboo-paper-unit");
    const price = readNumber(panel.querySelector("input.bamboo-paper-unit-price"));
    const count = readNumber(panel.querySelector("input.bamboo-paper-count"));
    const option = unit && unit.options[unit.selectedIndex];
    const pieces = option ? Number(option.dataset.pieces) : NaN;
    if (price === null || count === null || !Number.isFinite(pieces) || pieces === 0) return null;
    return (price / pieces) * count;
  }

  function updateBambooCalcs() {
    const panel = document.querySelector(".bamboo-size-panel:not([hidden])");
    const totalOutput = document.querySelector(".bamboo-total-value");
    if (!panel || !totalOutput) return;
    let total = 0;
    let any = false;
    panel.querySelectorAll("input[data-divisor]").forEach((input) => {
      const output = panel.querySelector(`[data-output-for="${input.id}"]`);
      const raw = input.value.trim();
      const price = Number(raw);
      const divisor = Number(input.dataset.divisor);
      const valid = raw !== "" && Number.isFinite(price) && price >= 0 && Number.isFinite(divisor) && divisor !== 0;
      if (!valid) {
        if (output) output.textContent = "";
        return;
      }
      const result = Math.round(price / divisor);
      any = true;
      total += result;
      if (output) output.textContent = formatAmount(result);
    });
    const advancedOn = advancedToggle && advancedToggle.checked;
    const paperExact = advancedOn ? readAdvancedPaperCost(panel) : readPaperCost(panel);
    const paper = paperExact === null ? null : Math.round(paperExact);
    const resultOutput = panel.querySelector(".bamboo-paper-result");
    if (resultOutput) resultOutput.textContent = advancedOn && paper !== null ? formatAmount(paper) : "";
    if (paper !== null) total += paper;
    totalOutput.textContent = any || paper !== null ? formatAmount(total) : "";
  }

  const BAMBOO_PRICES_KEY = "bamboo-prices";

  function bambooInputs() {
    return document.querySelectorAll(
      ".bamboo-calc input[data-divisor], .bamboo-calc input.bamboo-paper-value, .bamboo-calc input.bamboo-paper-unit-price, .bamboo-calc input.bamboo-paper-count"
    );
  }

  function storedPrice(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (trimmed === "") return "";
    const price = Number(trimmed);
    if (!Number.isFinite(price) || price < 0) return null;
    return trimmed;
  }

  function saveBambooPrices() {
    const prices = {};
    bambooInputs().forEach((input) => {
      prices[input.id] = input.value;
    });
    document.querySelectorAll(".bamboo-paper-unit").forEach((select) => {
      prices[select.id] = select.value;
    });
    if (bambooSize) prices.size = bambooSize.value;
    if (advancedToggle) prices.advanced = advancedToggle.checked;
    try {
      localStorage.setItem(BAMBOO_PRICES_KEY, JSON.stringify(prices));
    } catch (error) {
      // Keep the prices on the page when storage is blocked.
    }
  }

  function loadBambooPrices() {
    let prices = null;
    try {
      prices = JSON.parse(localStorage.getItem(BAMBOO_PRICES_KEY) || "null");
    } catch (error) {
      prices = null;
    }
    if (!prices || typeof prices !== "object") return;
    if (advancedToggle && bambooForm) {
      advancedToggle.checked = prices.advanced === true;
      bambooForm.classList.toggle("bamboo-calc--advanced", advancedToggle.checked);
    }
    bambooInputs().forEach((input) => {
      const value = storedPrice(prices[input.id]);
      if (value) input.value = value;
    });
    document.querySelectorAll(".bamboo-paper-unit").forEach((select) => {
      const value = prices[select.id];
      const knownUnit = typeof value === "string" && [...select.options].some((option) => option.value === value);
      if (knownUnit) select.value = value;
    });
    const size = typeof prices.size === "string" ? prices.size : "";
    const knownSize = bambooSize && [...bambooSize.options].some((option) => option.value === size);
    if (knownSize) {
      bambooSize.value = size;
      showBambooSize(size);
      return;
    }
    updateBambooCalcs();
  }

  function showBambooSize(sizeId) {
    document.querySelectorAll(".bamboo-size-panel").forEach((panel) => {
      panel.hidden = panel.dataset.size !== sizeId;
    });
    updateBambooCalcs();
  }

  const bambooSize = document.getElementById("bamboo-size");
  const bambooForm = document.getElementById("bamboo-calc");
  const advancedToggle = document.getElementById("bamboo-advanced");
  if (bambooSize) {
    bambooSize.addEventListener("change", () => {
      showBambooSize(bambooSize.value);
      saveBambooPrices();
    });
  }

  if (bambooForm) {
    bambooForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  }

  if (advancedToggle && bambooForm) {
    advancedToggle.addEventListener("change", () => {
      bambooForm.classList.toggle("bamboo-calc--advanced", advancedToggle.checked);
      updateBambooCalcs();
      saveBambooPrices();
    });
  }

  document.querySelectorAll(".bamboo-paper-unit").forEach((select) => {
    select.addEventListener("change", () => {
      const option = select.options[select.selectedIndex];
      const fields = select.closest(".bamboo-paper-advanced");
      const priceInput = fields ? fields.querySelector(".bamboo-paper-unit-price") : null;
      if (option && priceInput && option.dataset.price) priceInput.value = option.dataset.price;
      updateBambooCalcs();
      saveBambooPrices();
    });
  });

  bambooInputs().forEach((input) => {
    input.addEventListener("input", () => {
      updateBambooCalcs();
      saveBambooPrices();
    });
  });

  loadBambooPrices();
  updateBambooCalcs();

  try {
    applyLanguage(savedLanguage || "en");
    showSection(location.hash || "#kite-sizes");
    pinToTop();
    if (savedLanguage === null) {
      openLanguageModal();
    }
  } finally {
    document.documentElement.classList.remove("lang-boot");
  }

})();
