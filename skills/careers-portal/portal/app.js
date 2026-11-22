/* Careers portal. Plain JavaScript, no build step.
   Demo mode uses demo-data.js. Live mode reads and writes a Supabase
   (Lovable Cloud) project set up with supabase/schema.sql. */
(function () {
  "use strict";

  const cfg = window.PORTAL_CONFIG || {};
  const LIVE = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
  const MAX_BYTES = 5 * 1024 * 1024;
  const OK_EXT = ["pdf", "doc", "docx"];
  const CONSENT_TEXT = s => `I agree that ${s.company_name} may keep my application and CV for ${Math.round((s.retention_days || 180) / 30)} months to consider me for this role and similar roles, as described in the privacy note.`;

  const LABEL = {
    work_mode: { onsite: "On-site", hybrid: "Hybrid", remote: "Remote" },
    employment_type: { full_time: "Full-time", part_time: "Part-time", contract: "Contract", internship: "Internship" }
  };

  const state = { settings: null, jobs: [], filter: { q: "", dept: "", loc: "" }, sb: null };
  const $ = sel => document.querySelector(sel);
  const main = $("#main");

  // ---------- helpers ----------
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const today = () => new Date().toISOString().slice(0, 10);
  const daysLeft = d => d ? Math.round((new Date(d + "T23:59:59") - new Date()) / 864e5) : null;
  const fmtDate = d => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const numberWord = n => ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"][n] || String(n);
  const isOpen = j => j.status === "open" && (!j.closes_on || j.closes_on >= today());
  const announce = t => { $("#announce").textContent = t; };
  const icon = {
    arrow: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    tick: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };

  // Very small Markdown: "## heading", "- bullet", paragraphs.
  function md(text) {
    if (!text) return "";
    const out = []; let list = null;
    String(text).split(/\n/).forEach(raw => {
      const line = raw.trim();
      if (/^-\s+/.test(line)) { if (!list) { list = []; } list.push(`<li>${esc(line.replace(/^-\s+/, ""))}</li>`); return; }
      if (list) { out.push(`<ul>${list.join("")}</ul>`); list = null; }
      if (!line) return;
      if (/^##\s+/.test(line)) out.push(`<h2>${esc(line.replace(/^##\s+/, ""))}</h2>`);
      else out.push(`<p>${esc(line)}</p>`);
    });
    if (list) out.push(`<ul>${list.join("")}</ul>`);
    return out.join("");
  }

  // ---------- brand ----------
  function luminance(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || ""); if (!m) return 0;
    const c = [0, 2, 4].map(i => parseInt(m[1].substr(i, 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4));
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  }
  function applyBrand(s) {
    const root = document.documentElement.style;
    if (/^#[0-9a-f]{6}$/i.test(s.brand_primary || "")) {
      root.setProperty("--brand", s.brand_primary);
      // white text needs 4.5:1 against the brand colour; otherwise use ink
      const L = luminance(s.brand_primary);
      root.setProperty("--brand-ink", (1.05 / (L + .05)) >= 4.5 ? "#ffffff" : "#16211D");
    }
    const words = (s.company_name || "?").replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(w => w && !/^(inc|ltd|llc|llp|pte|plc|co|corp|gmbh|sdn|bhd|pvt|limited)$/i.test(w));
    const initials = (words.length ? words : ["?"]).slice(0, 2).map(w => w[0]).join("").toUpperCase();
    $("#brandMark").innerHTML = s.logo_url ? `<img src="${esc(s.logo_url)}" alt="">` : esc(initials);
    $("#brandName").textContent = s.company_name;
    $("#footerName").textContent = `© ${new Date().getFullYear()} ${s.company_name}`;
    document.title = `Careers at ${s.company_name}`;
  }

  // ---------- data ----------
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }
  async function loadData() {
    if (!LIVE) {
      $("#demoStrip").hidden = false;
      state.settings = window.DEMO_DATA.settings;
      state.jobs = window.DEMO_DATA.jobs;
      return;
    }
    await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
    state.sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    const [s, j] = await Promise.all([
      state.sb.from("settings").select("company_name,tagline,about,careers_email,privacy_contact,retention_days,show_pay,brand_primary,logo_url,website_url,highlights").limit(1).maybeSingle(),
      state.sb.from("jobs").select("id,slug,title,department,location,work_mode,employment_type,summary,description,requirements,pay_text,closes_on,status").eq("status", "open").order("created_at", { ascending: false })
    ]);
    if (s.error) throw s.error;
    if (j.error) throw j.error;
    state.settings = s.data || { company_name: "Our company", retention_days: 180 };
    state.jobs = j.data || [];
  }

  // ---------- views ----------
  function home(scrollTo) {
    const s = state.settings;
    const open = state.jobs.filter(isOpen);
    const depts = [...new Set(open.map(j => j.department).filter(Boolean))].sort();
    const locs = [...new Set(open.map(j => j.location).filter(Boolean))].sort();
    const n = open.length;
    const headline = n === 0 ? "No open roles right now" : `${numberWord(n)} open role${n === 1 ? "" : "s"} at ${s.company_name}`;

    main.innerHTML = `
      <section class="hero" aria-labelledby="h-roles">
        <div class="wrap">
          <h1 class="display" id="h-roles">${esc(headline)}</h1>
          ${s.about ? `<p class="about">${esc(s.about)}</p>` : ""}
          ${n ? `
          <div class="finder" role="search">
            <label class="search"><span class="sr-only">Search roles</span>${icon.search}
              <input id="q" type="search" placeholder="Search by job title or keyword" value="${esc(state.filter.q)}" autocomplete="off"></label>
            <label><span class="sr-only">Location</span>
              <select id="loc"><option value="">All locations</option>${locs.map(l => `<option${l === state.filter.loc ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
          </div>
          ${depts.length > 1 ? `<div class="chips" role="group" aria-label="Filter by team">
            <button class="chip" data-dept="" aria-pressed="${!state.filter.dept}">All teams</button>
            ${depts.map(d => `<button class="chip" data-dept="${esc(d)}" aria-pressed="${state.filter.dept === d}">${esc(d)}</button>`).join("")}
          </div>` : ""}` : ""}
          <div id="roles" tabindex="-1"></div>
        </div>
      </section>
      ${s.highlights && s.highlights.length ? `
      <section class="section section-alt" id="working-here" tabindex="-1" aria-labelledby="h-work">
        <div class="wrap">
          <h2 class="display" id="h-work">Working at ${esc(s.company_name)}</h2>
          <div class="facts">${s.highlights.map(h => `<div><h3>${esc(h.title)}</h3><p>${esc(h.text)}</p></div>`).join("")}</div>
        </div>
      </section>` : ""}
      <section class="section" id="how-we-hire" tabindex="-1" aria-labelledby="h-hire">
        <div class="wrap">
          <h2 class="display" id="h-hire">How we hire</h2>
          <p class="intro">No account or cover letter needed. Here's what happens after you apply.</p>
          <ol class="steps">
            <li><h3>You apply</h3><p>Send your CV and contact details. It takes about two minutes.</p></li>
            <li><h3>We read every application</h3><p>A real person on the hiring team reviews what you sent.</p></li>
            <li><h3>We talk</h3><p>If it looks like a fit, we'll contact you to arrange an interview.</p></li>
            <li><h3>We decide together</h3><p>You'll hear from us either way, and get a written offer if it's a match.</p></li>
          </ol>
        </div>
      </section>`;

    renderRoles();
    if (n) {
      $("#q").addEventListener("input", e => { state.filter.q = e.target.value; renderRoles(); });
      $("#loc").addEventListener("change", e => { state.filter.loc = e.target.value; renderRoles(); });
      main.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
        state.filter.dept = b.dataset.dept;
        main.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", String(c === b)));
        renderRoles();
      }));
    }
    if (scrollTo) { const t = document.getElementById(scrollTo); if (t) { t.scrollIntoView(); t.focus({ preventScroll: true }); } }
    else window.scrollTo(0, 0);
  }

  function renderRoles() {
    const box = $("#roles");
    const open = state.jobs.filter(isOpen);
    if (!open.length) {
      box.innerHTML = `<div class="empty"><h2>Check back soon</h2><p>We post new roles here first. You're also welcome to send your CV to <a href="mailto:${esc(state.settings.careers_email)}">${esc(state.settings.careers_email || "our team")}</a>.</p></div>`;
      return;
    }
    const q = state.filter.q.trim().toLowerCase();
    const list = open.filter(j =>
      (!q || [j.title, j.summary, j.department, j.description].join(" ").toLowerCase().includes(q)) &&
      (!state.filter.dept || j.department === state.filter.dept) &&
      (!state.filter.loc || j.location === state.filter.loc));
    announce(`${list.length} role${list.length === 1 ? "" : "s"} shown`);
    if (!list.length) {
      box.innerHTML = `<div class="empty"><h2>No roles match your search</h2><p>Try another keyword, or <button class="chip" id="clear">clear the filters</button></p></div>`;
      $("#clear").onclick = () => { state.filter = { q: "", dept: "", loc: "" }; home(); };
      return;
    }
    box.innerHTML = `
      <div class="roles-head" aria-hidden="true"><span>Role</span><span>Team</span><span>Location</span><span>Type</span><span>Closes</span><span></span></div>
      <ul class="roles">${list.map(j => {
        const left = daysLeft(j.closes_on);
        const closes = !j.closes_on ? "Open until filled" : left <= 7 ? `<span class="closing-soon">${left <= 0 ? "Closes today" : `${left} day${left === 1 ? "" : "s"} left`}</span>` : fmtDate(j.closes_on);
        return `<li class="role"><a href="#role-${esc(j.slug)}">
          <span class="role-title">${esc(j.title)}${j.summary ? `<span class="role-summary">${esc(j.summary)}</span>` : ""}</span>
          <span class="role-cell"><span class="lbl">Team</span>${esc(j.department || "")}</span>
          <span class="role-cell"><span class="lbl">Location</span>${esc(j.location)}${j.work_mode && j.work_mode !== "onsite" && !j.location.toLowerCase().includes(j.work_mode) ? `, ${LABEL.work_mode[j.work_mode].toLowerCase()}` : ""}</span>
          <span class="role-cell"><span class="lbl">Type</span>${esc(LABEL.employment_type[j.employment_type] || "")}</span>
          <span class="role-cell"><span class="lbl">Closes</span>${closes}</span>
          <span class="role-go">${icon.arrow}</span></a></li>`;
      }).join("")}</ul>`;
  }

  function notFound() {
    main.innerHTML = `<div class="wrap empty" style="padding:80px var(--gutter)"><h2>This role is no longer open</h2><p>It may have been filled or closed. <a href="#roles">See current openings</a></p></div>`;
  }

  function jobPage(slug) {
    const j = state.jobs.find(x => x.slug === slug && isOpen(x));
    if (!j) return notFound();
    const s = state.settings;
    const pay = s.show_pay && j.pay_text ? j.pay_text : "";
    main.innerHTML = `
      <div class="wrap">
        <p class="crumb"><a href="#roles">${icon.back} All open roles</a></p>
        <article class="job">
          <div>
            <header class="job-head">
              ${j.department ? `<p class="job-dept">${esc(j.department)}</p>` : ""}
              <h1 class="display">${esc(j.title)}</h1>
              ${j.summary ? `<p class="job-summary">${esc(j.summary)}</p>` : ""}
            </header>
            <div class="prose">${md(j.description)}${md(j.requirements)}</div>
          </div>
          <aside class="panel" aria-label="Role details">
            <dl>
              <dt>Location</dt><dd>${esc(j.location)}</dd>
              <dt>Work mode</dt><dd>${esc(LABEL.work_mode[j.work_mode] || "")}</dd>
              <dt>Type</dt><dd>${esc(LABEL.employment_type[j.employment_type] || "")}</dd>
              ${pay ? `<dt>Pay</dt><dd>${esc(pay)}</dd>` : ""}
              <dt>Closes</dt><dd>${j.closes_on ? fmtDate(j.closes_on) : "Open until filled"}</dd>
            </dl>
            <a class="btn btn-block" href="#apply-${esc(j.slug)}">Apply for this role</a>
            <p class="small">Takes about two minutes. You'll need your CV as a PDF or Word file.</p>
            <button class="btn btn-quiet btn-block share" id="copyLink" type="button">Copy link to this role</button>
          </aside>
        </article>
      </div>
      <div class="mobile-apply"><a class="btn btn-block" href="#apply-${esc(j.slug)}">Apply for this role</a></div>`;
    $("#copyLink").onclick = async e => {
      try { await navigator.clipboard.writeText(location.href.split("#")[0] + "#role-" + j.slug); e.target.textContent = "Link copied"; }
      catch { e.target.textContent = "Copy the address from your browser"; }
    };
    window.scrollTo(0, 0); main.focus({ preventScroll: true });
  }

  function applyPage(slug) {
    const j = state.jobs.find(x => x.slug === slug && isOpen(x));
    if (!j) return notFound();
    const s = state.settings;
    main.innerHTML = `
      <div class="wrap">
        <p class="crumb"><a href="#role-${esc(j.slug)}">${icon.back} Back to the role</a></p>
        <section class="apply" aria-labelledby="h-apply">
          <h1 class="display" id="h-apply">Apply</h1>
          <p class="for">${esc(j.title)}, ${esc(j.location)}</p>
          <form class="form" id="form" novalidate>
            <div class="form-error" id="formError" role="alert" hidden></div>
            <div class="row">
              <div class="field"><label for="f-name">Full name</label><input id="f-name" name="full_name" autocomplete="name" required><div class="err" id="e-name"></div></div>
              <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required><div class="err" id="e-email"></div></div>
            </div>
            <div class="field"><label for="f-phone">Phone <span class="hint">(optional)</span></label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div>
            <div class="field">
              <span id="cv-label" style="display:block;font-weight:600;font-size:15.5px;margin-bottom:6px">CV</span>
              <div id="cvBox"></div>
              <div class="err" id="e-cv"></div>
            </div>
            <div class="field"><label for="f-note">Anything you'd like us to know <span class="hint">(optional)</span></label><textarea id="f-note" name="cover_note" maxlength="2000"></textarea></div>
            <div class="hp" aria-hidden="true"><label for="f-web">Leave this empty</label><input id="f-web" name="website" tabindex="-1" autocomplete="off"></div>
            <div>
              <label class="consent"><input type="checkbox" id="f-consent"><span>${esc(CONSENT_TEXT(s))} <a href="#privacy" target="_blank" rel="noopener">Read the privacy note</a></span></label>
              <div class="err" id="e-consent"></div>
            </div>
            <div><button class="btn" type="submit" id="submit">Send application</button></div>
          </form>
        </section>
      </div>`;

    let file = null;
    const cvBox = $("#cvBox");
    const drawDrop = () => {
      cvBox.innerHTML = `<label class="drop" id="drop" aria-labelledby="cv-label"><input type="file" id="f-cv" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"><strong>Choose a file or drop it here</strong><span>PDF or Word, up to 5 MB</span></label>`;
      const drop = $("#drop"), input = $("#f-cv");
      input.addEventListener("change", () => pick(input.files[0]));
      ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
      ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
      drop.addEventListener("drop", e => pick(e.dataTransfer.files[0]));
    };
    const pick = f => {
      $("#e-cv").textContent = "";
      if (!f) return;
      const ext = (f.name.split(".").pop() || "").toLowerCase();
      if (!OK_EXT.includes(ext)) { $("#e-cv").textContent = "That file type isn't accepted. Upload a PDF or Word file."; return; }
      if (f.size > MAX_BYTES) { $("#e-cv").textContent = "That file is over 5 MB. Save a smaller version and try again."; return; }
      file = f;
      cvBox.innerHTML = `<div class="file-chosen"><div><div class="name">${esc(f.name)}</div><div class="size">${Math.max(1, Math.round(f.size / 1024))} KB</div></div><button type="button" class="btn btn-quiet" id="cvChange">Change file</button></div>`;
      $("#cvChange").onclick = () => { file = null; drawDrop(); };
    };
    drawDrop();

    $("#form").addEventListener("submit", async e => {
      e.preventDefault();
      const name = $("#f-name").value.trim(), email = $("#f-email").value.trim();
      const errors = {
        name: name ? "" : "Enter your full name.",
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter an email address like name@example.com.",
        cv: file ? "" : "Add your CV as a PDF or Word file.",
        consent: $("#f-consent").checked ? "" : "Tick the box so we can keep your application."
      };
      Object.entries(errors).forEach(([k, v]) => {
        $("#e-" + k).textContent = v;
        const inp = { name: "#f-name", email: "#f-email", consent: "#f-consent" }[k];
        if (inp) $(inp).setAttribute("aria-invalid", v ? "true" : "false");
      });
      const first = Object.keys(errors).find(k => errors[k]);
      if (first) { ({ name: $("#f-name"), email: $("#f-email"), cv: $("#f-cv") || $("#cvChange"), consent: $("#f-consent") })[first]?.focus(); return; }
      if ($("#f-web").value) return; // spam trap

      const btn = $("#submit"); btn.disabled = true; btn.textContent = "Sending…";
      $("#formError").hidden = true;
      try {
        await submit(j, { full_name: name, email, phone: $("#f-phone").value.trim(), cover_note: $("#f-note").value.trim() }, file);
        location.hash = "applied-" + j.slug;
      } catch (err) {
        console.error(err);
        $("#formError").textContent = "Your application wasn't sent. Check your connection and try again. If it keeps failing, email your CV to " + (s.careers_email || "our hiring team") + ".";
        $("#formError").hidden = false; $("#formError").scrollIntoView({ block: "center" });
        btn.disabled = false; btn.textContent = "Send application";
      }
    });
    window.scrollTo(0, 0); $("#f-name").focus({ preventScroll: true });
  }

  async function submit(job, fields, file) {
    if (!LIVE) { await new Promise(r => setTimeout(r, 900)); return; }
    const id = crypto.randomUUID();
    const ext = file.name.split(".").pop().toLowerCase();
    const path = `${job.id}/${id}/cv.${ext}`;
    const up = await state.sb.storage.from("cvs").upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (up.error) throw up.error;
    const ins = await state.sb.from("applications").insert({
      id, job_id: job.id, ...fields,
      cv_path: path, cv_original_name: file.name,
      consent: true, consent_text: CONSENT_TEXT(state.settings)
    });
    if (ins.error) throw ins.error;
  }

  function donePage(slug) {
    const j = state.jobs.find(x => x.slug === slug);
    main.innerHTML = `
      <div class="wrap"><section class="done" aria-labelledby="h-done">
        <div class="tick">${icon.tick}</div>
        <h1 class="display" id="h-done" tabindex="-1">Application sent</h1>
        <p>Thanks for applying${j ? ` for ${esc(j.title)}` : ""}. Here's what happens next:</p>
        <ol>
          <li>Our hiring team reads your application.</li>
          <li>If it looks like a fit, we'll email or call you to arrange an interview.</li>
          <li>Either way, we'll let you know the outcome.</li>
        </ol>
        ${!LIVE ? `<p><strong>Demo mode:</strong> nothing was sent or saved.</p>` : ""}
        <p><a class="btn btn-quiet" href="#roles">See other open roles</a></p>
      </section></div>`;
    window.scrollTo(0, 0); $("#h-done").focus();
  }

  function privacyPage() {
    const s = state.settings;
    const months = Math.round((s.retention_days || 180) / 30);
    main.innerHTML = `
      <div class="wrap"><section class="privacy" aria-labelledby="h-priv">
        <p class="crumb" style="padding-top:0"><a href="#roles">${icon.back} All open roles</a></p>
        <h1 class="display" id="h-priv">How we handle your application</h1>
        <div class="prose" style="margin-top:0">
          <h2>What we collect</h2><p>Your name, email, phone number if you give it, your CV and anything you write in the form.</p>
          <h2>Why</h2><p>Only to consider you for the role you applied for and similar roles at ${esc(s.company_name)}.</p>
          <h2>Who sees it</h2><p>The people at ${esc(s.company_name)} involved in hiring for the role. Your CV is stored privately and is never shown on this website.</p>
          <h2>How long we keep it</h2><p>${months} months after you apply. After that, your application and CV are deleted.</p>
          <h2>Your choices</h2><p>To see, correct or delete your application at any time, email ${s.privacy_contact ? `<a href="mailto:${esc(s.privacy_contact)}">${esc(s.privacy_contact)}</a>` : "us"}.</p>
        </div>
      </section></div>`;
    window.scrollTo(0, 0);
  }

  // ---------- routing (plain #names, works on any static host) ----------
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith("role-")) return jobPage(h.slice(5));
    if (h.startsWith("apply-")) return applyPage(h.slice(6));
    if (h.startsWith("applied-")) return donePage(h.slice(8));
    if (h === "privacy") return privacyPage();
    if (main.querySelector(".hero") && ["roles", "working-here", "how-we-hire"].includes(h)) {
      const t = document.getElementById(h); if (t) { t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); t.focus({ preventScroll: true }); }
      return;
    }
    home(["roles", "working-here", "how-we-hire"].includes(h) ? h : null);
  }

  (async function start() {
    try {
      await loadData();
    } catch (err) {
      console.error(err);
      main.innerHTML = `<div class="wrap empty" style="padding:80px var(--gutter)"><h2>Open roles couldn't be loaded</h2><p>Refresh the page to try again.</p></div>`;
      return;
    }
    applyBrand(state.settings);
    window.addEventListener("hashchange", route);
    route();
  })();
})();
