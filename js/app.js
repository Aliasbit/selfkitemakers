(function () {
  const STORAGE_KEY = "language";
  const STRINGS = {
    en: {
      "nav.label": "Section navigation",
      "nav.home": "Home",
      "nav.kiteSizes": "Kite sizes",
      "nav.calculator": "Calculator",
      "nav.paper": "Paper Information",
      "nav.thread": "Thread Information",
      "nav.homeShort": "Home",
      "nav.kiteSizesShort": "Sizes",
      "nav.calculatorShort": "Calculator",
      "nav.paperShort": "Paper",
      "nav.threadShort": "Thread",
      "dash.heading": "Pick a section",
      "dash.kiteSizes": "Kaman, gazz, and paper for each size.",
      "dash.calculator": "Bamboo bundle and paper cost.",
      "dash.paper": "Coming soon",
      "dash.thread": "Coming soon",
      "body.paper": "Coming soon",
      "body.thread": "Coming soon",
      "menu.close": "Close",
      "brand.alt": "Lahore Self Kite Makers",
      "title.suffix": "Self Kite Makers",
      "lang.choose": "Choose language",
      "lang.current": "English",
    },
    ur: {
      "nav.label": "حصوں کی فہرست",
      "nav.home": "ہوم",
      "nav.kiteSizes": "پتنگ کے سائز",
      "nav.calculator": "کیلکولیٹر",
      "nav.paper": "کاغذ کی معلومات",
      "nav.thread": "ڈور کی معلومات",
      "nav.homeShort": "ہوم",
      "nav.kiteSizesShort": "سائز",
      "nav.calculatorShort": "کیلکولیٹر",
      "nav.paperShort": "کاغذ",
      "nav.threadShort": "ڈور",
      "dash.heading": "حصہ منتخب کریں",
      "dash.kiteSizes": "ہر سائز کی کمان، گز اور کاغذ۔",
      "dash.calculator": "بانس بنڈل اور کاغذ کی قیمت۔",
      "dash.paper": "جلد آ رہا ہے",
      "dash.thread": "جلد آ رہا ہے",
      "body.paper": "جلد آ رہا ہے",
      "body.thread": "جلد آ رہا ہے",
      "menu.close": "بند کریں",
      "brand.alt": "لاہور سیلف کائٹ میکرز",
      "title.suffix": "سیلف کائٹ میکرز",
      "lang.choose": "زبان منتخب کریں",
      "lang.current": "اردو",
    },
  };

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
    const label = trigger.querySelector("[data-i18n]");
    return (label ? label.textContent : trigger.textContent).trim();
  }

  function syncSectionLinks(id) {
    document.querySelectorAll("#mobile-nav [data-open-section]").forEach((link) => {
      const on = link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", on);
      if (on) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function focusSectionControl(id) {
    const active = document.activeElement;
    const pane = active && active.closest ? active.closest(".tab-pane") : null;
    if (!pane || pane.classList.contains("active")) return;
    const mobileNav = document.getElementById("mobile-nav");
    const mobileLink = document.querySelector('#mobile-nav [href="#' + id + '"]');
    const sidebarLink = document.querySelector('#section-nav [href="#' + id + '"]');
    const mobileVisible = mobileNav && getComputedStyle(mobileNav).display !== "none";
    const target = mobileVisible ? mobileLink : sidebarLink;
    if (target) target.focus();
  }

  function syncChrome(trigger) {
    const id = sectionId(trigger);
    const label = labelFor(trigger);
    pageTitle.textContent = label;
    document.title = label + " · " + t("title.suffix");
    syncSectionLinks(id);
    if (location.hash !== "#" + id) {
      history.replaceState(null, "", "#" + id);
    }
    focusSectionControl(id);
  }

  function showSection(hash) {
    if (hash === "#bamboo-calculator") hash = "#calculator";
    const target = known.has(hash) ? hash : "#home";
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

  document.querySelectorAll(".home-link, [data-open-section]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const hash = link.getAttribute("href");
      if (location.hash !== hash) {
        history.pushState(null, "", hash);
      }
      showSection(hash);
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
    const price = readNumber(panel.querySelector("input.bamboo-paper-unit-price"));
    const pieces = readNumber(panel.querySelector("input.bamboo-paper-pieces"));
    const count = readNumber(panel.querySelector("input.bamboo-paper-count"));
    if (price === null || pieces === null || pieces === 0 || count === null) return null;
    return (price / pieces) * count;
  }

  function writeSummary(selector, amount) {
    const line = document.querySelector(selector);
    if (!line) return;
    const output = line.querySelector("output");
    if (amount === null) {
      if (output) output.textContent = "";
      line.hidden = true;
      return;
    }
    if (output) output.textContent = formatAmount(amount);
    line.hidden = false;
  }

  function sumInputs(panel, selector) {
    let sum = 0;
    let any = false;
    panel.querySelectorAll(selector).forEach((input) => {
      const amount = readNumber(input);
      if (amount === null) return;
      any = true;
      sum += Math.round(amount);
    });
    return any ? sum : null;
  }

  function updateBambooCalcs() {
    const panel = document.querySelector(".bamboo-size-panel:not([hidden])");
    const totalOutput = document.querySelector(".bamboo-total-value");
    if (!panel || !totalOutput) return;
    let total = 0;
    let any = false;
    let bambooSum = 0;
    let bambooAny = false;
    const units = readNumber(panel.querySelector("input.bamboo-yield"));
    const unitsOk = units !== null && units !== 0;
    panel.querySelectorAll("input.bamboo-bundle-price").forEach((input) => {
      const price = readNumber(input);
      if (!unitsOk || price === null) return;
      bambooAny = true;
      bambooSum += Math.round(price / units);
    });
    if (bambooAny) {
      any = true;
      total += bambooSum;
    }
    writeSummary(".bamboo-summary-bamboo", bambooAny ? bambooSum : null);
    const advancedOn = advancedToggle && advancedToggle.checked;
    const paperExact = advancedOn ? readAdvancedPaperCost(panel) : readPaperCost(panel);
    const paper = paperExact === null ? null : Math.round(paperExact);
    if (paper !== null) {
      any = true;
      total += paper;
    }
    writeSummary(".bamboo-summary-paper", paper);
    const labour = sumInputs(panel, "input.bamboo-labour, input.kite-labour");
    const decoration = sumInputs(panel, "input.decoration-cost");
    if (labour !== null) {
      any = true;
      total += labour;
    }
    if (decoration !== null) {
      any = true;
      total += decoration;
    }
    writeSummary(".bamboo-summary-labour", labour);
    writeSummary(".bamboo-summary-decoration", decoration);
    totalOutput.textContent = any ? formatAmount(total) : "";
  }

  const BAMBOO_PRICES_KEY = "bamboo-prices";

  function bambooInputs() {
    return document.querySelectorAll(".bamboo-calc input[type='number']");
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
    const size = selectedBambooSize();
    if (size) prices.size = size;
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
    copyLegacyCost(prices, "input.bamboo-labour", "bamboo-labour");
    copyLegacyCost(prices, "input.kite-labour", "kite-labour");
    copyLegacyCost(prices, "input.decoration-cost", "decoration-cost");
    document.querySelectorAll(".bamboo-paper-advanced").forEach((fields) => {
      const select = fields.querySelector(".bamboo-paper-unit");
      const piecesInput = fields.querySelector(".bamboo-paper-pieces");
      if (!select || !piecesInput || Object.prototype.hasOwnProperty.call(prices, piecesInput.id)) return;
      const option = select.options[select.selectedIndex];
      if (option && option.dataset.pieces) piecesInput.value = option.dataset.pieces;
    });
    const size = typeof prices.size === "string" ? prices.size : "";
    const knownSize = [...bambooSizeChoices()].some((button) => button.dataset.size === size);
    if (knownSize) {
      showBambooSize(size);
      return;
    }
    updateBambooCalcs();
  }

  function copyLegacyCost(prices, selector, legacyKey) {
    const legacy = storedPrice(prices[legacyKey]);
    if (!legacy) return;
    document.querySelectorAll(selector).forEach((input) => {
      if (Object.prototype.hasOwnProperty.call(prices, input.id)) return;
      input.value = legacy;
    });
  }

  function bambooSizeChoices() {
    return document.querySelectorAll(".bamboo-size-choice");
  }

  function selectedBambooSize() {
    const selected = document.querySelector(".bamboo-size-choice.is-selected");
    return selected ? selected.dataset.size : "";
  }

  function showBambooSize(sizeId) {
    bambooSizeChoices().forEach((button) => {
      const on = button.dataset.size === sizeId;
      button.classList.toggle("is-selected", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll(".bamboo-size-panel").forEach((panel) => {
      panel.hidden = panel.dataset.size !== sizeId;
    });
    updateBambooCalcs();
  }

  const bambooForm = document.getElementById("bamboo-calc");
  const advancedToggle = document.getElementById("bamboo-advanced");
  bambooSizeChoices().forEach((button) => {
    button.addEventListener("click", () => {
      showBambooSize(button.dataset.size);
      saveBambooPrices();
    });
  });

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
      const piecesInput = fields ? fields.querySelector(".bamboo-paper-pieces") : null;
      if (option && priceInput && option.dataset.price) priceInput.value = option.dataset.price;
      if (option && piecesInput && option.dataset.pieces) piecesInput.value = option.dataset.pieces;
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
    showSection(location.hash || "#home");
    pinToTop();
    if (savedLanguage === null) {
      openLanguageModal();
    }
  } finally {
    document.documentElement.classList.remove("lang-boot");
  }

})();
