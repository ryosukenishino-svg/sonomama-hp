// モバイルナビ開閉
const navToggle = document.querySelector(".nav-toggle");
const globalNav = document.querySelector(".global-nav");
if (navToggle && globalNav) {
  navToggle.addEventListener("click", () => {
    const open = globalNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
}

// ヘッダー: スクロールで影を付ける
const header = document.querySelector(".site-header");
const onHeaderScroll = () => header?.classList.toggle("scrolled", window.scrollY > 10);
window.addEventListener("scroll", onHeaderScroll, { passive: true });
onHeaderScroll();

// スクロールプログレスバー
const progress = document.createElement("div");
progress.className = "scroll-progress";
document.body.appendChild(progress);
const onProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = max > 0 ? (window.scrollY / max) * 100 + "%" : "0";
};
window.addEventListener("scroll", onProgress, { passive: true });
window.addEventListener("resize", onProgress, { passive: true });
onProgress();

// FAQアコーディオン
document.querySelectorAll(".faq-item").forEach((item) => {
  const q = item.querySelector(".faq-q");
  const a = item.querySelector(".faq-a");
  if (!q || !a) return;
  q.addEventListener("click", () => {
    const open = item.classList.toggle("open");
    a.style.maxHeight = open ? a.scrollHeight + "px" : "0";
  });
});
// 画面リサイズ時に開いている回答の高さを再計算
window.addEventListener("resize", () => {
  document.querySelectorAll(".faq-item.open .faq-a").forEach((a) => {
    a.style.maxHeight = a.scrollHeight + "px";
  });
}, { passive: true });

// ニュースカルーセル(横スライド)
document.querySelectorAll(".news-slider-wrap").forEach((wrap) => {
  const slider = wrap.querySelector(".news-slider");
  const prev = wrap.querySelector(".news-nav.prev");
  const next = wrap.querySelector(".news-nav.next");
  if (!slider) return;
  const step = () => {
    const item = slider.querySelector("li");
    return item ? item.offsetWidth + 20 : 320;
  };
  const update = () => {
    if (prev) prev.disabled = slider.scrollLeft <= 4;
    if (next) next.disabled = slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 4;
  };
  prev?.addEventListener("click", () => slider.scrollBy({ left: -step(), behavior: "smooth" }));
  next?.addEventListener("click", () => slider.scrollBy({ left: step(), behavior: "smooth" }));
  slider.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
});

// 数字カウントアップ([data-count] とヒーローの数字)
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const counters = new Set(document.querySelectorAll("[data-count], .stat-value strong"));
const runCounter = (el) => {
  const target = parseInt(el.dataset.count || el.textContent.replace(/[^0-9]/g, ""), 10);
  if (!isFinite(target) || target <= 0) return;
  const suffix = el.dataset.suffix || "";
  const steps = 28;
  let i = 0;
  const timer = setInterval(() => {
    i++;
    const eased = 1 - Math.pow(1 - i / steps, 3);
    el.textContent = Math.round(target * eased).toLocaleString() + suffix;
    if (i >= steps) clearInterval(timer);
  }, 36);
};
const startCounters = () => {
  counters.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      counters.delete(el);
      if (reduceMotion) return; // そのまま静的表示
      runCounter(el);
    }
  });
};
window.addEventListener("scroll", startCounters, { passive: true });
window.addEventListener("load", startCounters);
startCounters();

// スクロール出現アニメーション
const revealTargets = document.querySelectorAll(
  [
    ".section-head",
    ".feature-card",
    ".course-card",
    ".news-card",
    ".news-feature",
    ".worry-list li",
    ".worry-answer",
    ".case-grid img",
    ".voice-grid figure",
    ".ceo-card",
    ".company-table",
    ".compare-table",
    ".faq-item",
    ".cta-section .container > *",
    ".story-step",
    ".chip-cloud li",
    ".value-card",
    ".exec-card",
    ".number-card",
    ".message-quote",
    ".btn-ghost",
  ].join(",")
);

if (!reduceMotion) {
  const pending = new Set();
  const show = (el) => {
    el.classList.add("is-visible");
    pending.delete(el);
  };
  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              show(entry.target);
              io.unobserve(entry.target);
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        )
      : null;

  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    // 同じ親の中では順番に遅らせて表示(スタッガー)
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    const idx = siblings.indexOf(el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx * 90, 450) + "ms";
    pending.add(el);
    io?.observe(el);
  });

  // フォールバック: IntersectionObserverが発火しない環境でもスクロールで表示
  const revealCheck = () => {
    pending.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight - 30 && r.bottom > 0) {
        io?.unobserve(el);
        show(el);
      }
    });
  };
  window.addEventListener("scroll", revealCheck, { passive: true });
  window.addEventListener("resize", revealCheck, { passive: true });
  revealCheck();
} else {
  document.body.classList.add("no-reveal");
}
