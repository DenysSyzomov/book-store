// GSAP "reveal on scroll" for opt-in elements (docs/MASTER-PROJECT-SPEC.md
// §26, docs/AGENT-WORKFLOW.md §18). Called once from Layout.astro so it
// runs on every page automatically, but a page with no `data-reveal`
// element pays nothing for it: the check below returns before GSAP is
// ever imported, so GSAP's code is never even requested from the
// network on such a page — see the comment above the dynamic import.
//
// Any element gets the effect just by adding `data-reveal` in its
// markup (see Hero.astro, SectionHeading.astro) — nothing here knows
// or cares which specific elements those are. That's what "reusable"
// means in practice: one small script, opted into per-element by a
// plain HTML attribute, instead of one bespoke script per component.
export async function initReveal(root: ParentNode = document): Promise<void> {
  const targets = Array.from(
    root.querySelectorAll<HTMLElement>("[data-reveal]"),
  ).filter((el) => el.dataset.revealed !== "true");

  if (targets.length === 0) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Reduced motion means "skip the motion," not "hide the content."
  // These elements start hidden via the `.js [data-reveal]` CSS rule
  // in global.css — if we don't mark them revealed here, someone with
  // this preference set would never see them at all.
  if (prefersReducedMotion) {
    for (const el of targets) el.dataset.revealed = "true";
    return;
  }

  try {
    // A "dynamic import": unlike a normal `import` at the top of a
    // file (resolved before any of this code runs), `await import(...)`
    // is a function call, evaluated only when execution actually
    // reaches it. Vite/Astro give GSAP its own separate output file (a
    // "chunk") specifically so this line can fetch it on demand — the
    // browser only requests that file the first time a page reaches
    // this exact line, which only happens on a page that already found
    // at least one `[data-reveal]` element above.
    const { gsap } = await import("gsap");

    for (const el of targets) el.dataset.revealed = "true";

    // Elements are already visually hidden by the CSS rule (opacity:
    // 0, translateY) the moment the page paints — gsap.set below just
    // tells GSAP to treat that as the animation's starting point,
    // it doesn't change anything the visitor sees.
    gsap.set(targets, { opacity: 0, y: 24 });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          });
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.2 },
    );

    for (const el of targets) observer.observe(el);
  } catch {
    // GSAP failed to load (offline, blocked request, etc). The content
    // must not stay invisible just because an enhancement couldn't
    // load — MASTER-PROJECT-SPEC.md §26: "animation must not block
    // page interaction." Reveal everything immediately instead.
    for (const el of targets) {
      el.dataset.revealed = "true";
      el.style.opacity = "1";
      el.style.transform = "none";
    }
  }
}
