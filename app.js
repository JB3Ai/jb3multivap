"use strict";

// 01. Single demo catalog. PDF names match the supplied files exactly.
// Vehicle status and expiration dates are mock data, not read from the PDFs.
const masterCatalog = [
  { id: "supreme", name: "Northern Insure - Supreme Drive Plus", file: "Northern Insure - Supreme Drive Plus - Policy Wording.pdf", icon: "shield", description: "Explore the Supreme Drive Plus product and policy details." },
  { id: "service", name: "Northern Insure - Service Plan", file: "Northern Insure - Service Plan - Policy Wording.pdf", icon: "tool", description: "Review the service plan option with your dealership." },
  { id: "prime", name: "Northern Insure - Prime Drive Plus", file: "Northern Insure - Prime Drive Plus - Policy Wording.pdf", icon: "car", description: "Discover the Prime Drive Plus product and policy details." },
  { id: "monthly", name: "Northern Insure - Monthly Warranty", file: "Northern Insure - Monthly Warranty - Policy Wording.pdf", icon: "calendar", description: "Ask your dealer about a monthly vehicle warranty option." },
  { id: "gap", name: "Northern Insure - GAP Warranty", file: "Northern Insure - GAP Warranty - Policy Wording.pdf", icon: "bars", description: "Explore the GAP Warranty product with your dealership." },
  { id: "essential", name: "Northern Insure - Essential Drive Plus", file: "Northern Insure - Essential Drive Plus - Policy Wording.pdf", icon: "document", description: "Explore everyday vehicle protection with your dealership." },
  { id: "elitewplus", name: "Northern Insure - Elite Warranty Plus", file: "Northern Insure - Elite Warranty Plus - Policy Wording.pdf", icon: "shield", description: "Explore the Elite Warranty Plus option for your vehicle." },
  { id: "elitew", name: "Northern Insure - Elite Warranty", file: "Northern Insure - Elite Warranty - Policy Wording.pdf", icon: "shield", description: "Find out more about the Elite vehicle warranty option." },
  { id: "tyre", name: "Northern Insure - Elite Tyre & Rim", file: "Northern Insure - Elite Tyre & Rim - Policy Wording.pdf", icon: "wheel", description: "Discover the tyre and rim protection product." },
  { id: "body", name: "Northern Insure - Body & Interior", file: "Northern Insure - Body & Interior - Policy Wording.pdf", icon: "car", description: "Discover protection options for your vehicle’s exterior and interior." }
];
const demoPersonas = {
  client1: { name: "Alex Morgan", phone: "+27 82 555 0148", dealer: "Toyota Johannesburg", dealerAddress: "124 Main Street, JHB", vehicle: "Toyota Hilux 2.8 GD-6 RB Legend", vin: "AHTK123456789X · JHB 884 GP", odometer: "48,500 km", odoK: "48.5k", year: "2023", gaugeRotation: "75deg", activePolicyId: "supreme", expiry: "2027-11-14", enabledProductIds: ["supreme", "service", "prime", "monthly"], brandColor: "#e63946", uiAccent: "#ff9098" },
  client2: { name: "Sarah Jenkins", phone: "+27 84 912 3001", dealer: "BMW Sandton", dealerAddress: "88 Rivonia Road, Sandton", vehicle: "BMW X5 xDrive30d M Sport", vin: "WBAX500098761Y · SND 102 GP", odometer: "32,100 km", odoK: "32.1k", year: "2024", gaugeRotation: "50deg", activePolicyId: "elitewplus", expiry: "2028-03-20", enabledProductIds: ["elitewplus", "service", "tyre", "gap", "body", "monthly"], brandColor: "#0070f3", uiAccent: "#76c1fc" },
  client3: { name: "Johan van der Merwe", phone: "+27 83 401 8892", dealer: "Mercedes-Benz Cape Town", dealerAddress: "45 Foreshore Boulevard, CPT", vehicle: "Mercedes-Benz C200 AMG Line", vin: "WDD2050012345Z · CPT 551 CA", odometer: "61,000 km", odoK: "61.0k", year: "2022", gaugeRotation: "95deg", activePolicyId: "prime", expiry: "2026-08-10", enabledProductIds: ["prime", "service", "tyre"], brandColor: "#9eacbd", uiAccent: "#ccd6e3" }
};
let currentKey = "client1";
const products = masterCatalog;
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
const pdfPath = product => encodeURIComponent(product.file);
const shortName = product => product.name.replace("Northern Insure - ", "");
const dateLabel = value => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
function coverageIsCurrent(persona) {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = name => parts.find(item => item.type === name).value;
  return persona.expiry >= `${part("year")}-${part("month")}-${part("day")}`;
}
// Keep owned policies visible even if a dealer disables them later.
const clientProducts = persona => masterCatalog.filter(product => persona.enabledProductIds.includes(product.id) || product.id === persona.activePolicyId);

// 02. Dealer PDF branding. Replace demo identity with authorized dealer data.
// logoUrl may point to a same-origin PNG/JPEG; null uses the portal monogram.
const brandingFor = persona => ({ name: persona.dealer, address: persona.dealerAddress, phone: persona.phone, agent: persona.agent || "Demo dealership team", brandColor: persona.brandColor, logoUrl: persona.logoUrl || null });
let dealerInfo = brandingFor(demoPersonas.client1);

async function generateCustomDealerPdf(basePdfUrl, dealer) {
  if (location.protocol === "file:") {
    throw new Error("Open this portal through a local HTTP server to generate custom PDFs. See README.md for the preview command.");
  }
  if (!window.PDFLib) throw new Error("The PDF library could not load. Refresh the portal and try again.");
  const response = await fetch(basePdfUrl);
  if (!response.ok) throw new Error(`The policy PDF could not be loaded (HTTP ${response.status}). Please try again.`);
  const sourceBytes = await response.arrayBuffer();
  const { PDFDocument, StandardFonts, ParseSpeeds, rgb } = window.PDFLib;
  let pdfDoc;
  try {
    // These small policy files can parse in one pass. Background tabs throttle
    // timer-based work after a preview tab opens, so avoid per-tick pauses.
    pdfDoc = await PDFDocument.load(sourceBytes, { updateMetadata: false, parseSpeed: ParseSpeeds.Fastest });
  } catch {
    throw new Error("The policy document could not be read. Please check the base PDF and try again.");
  }
  const firstPage = pdfDoc.getPages()[0];
  if (!firstPage) throw new Error("The policy document has no pages.");
  if (firstPage.getRotation().angle !== 0) throw new Error("This policy's rotated first page needs a different header layout.");

  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const box = firstPage.getMediaBox();
  const bandHeight = 80;
  const bandBottom = box.y + box.height;
  const oldCrop = firstPage.getCropBox();
  const sameBox = other => ["x", "y", "width", "height"].every(key => Math.abs(other[key] - box[key]) < 0.01);
  if (!sameBox(oldCrop)) throw new Error("This policy's cropped first page needs a different header layout.");
  // Capture print boxes before changing MediaBox (defaults inherit its size).
  const printBoxes = [
    [firstPage.getTrimBox(), "setTrimBox"],
    [firstPage.getBleedBox(), "setBleedBox"],
    [firstPage.getArtBox(), "setArtBox"]
  ];
  // Extend upwards; all original content and annotation coordinates stay put.
  firstPage.setMediaBox(box.x, box.y, box.width, box.height + bandHeight);
  firstPage.setCropBox(box.x, box.y, box.width, box.height + bandHeight);
  printBoxes.forEach(([original, setter]) => {
    if (sameBox(original)) firstPage[setter](box.x, box.y, box.width, box.height + bandHeight);
  });

  const color = /^#[0-9a-f]{6}$/i.test(dealer.brandColor) ? dealer.brandColor : "#e63946";
  const accent = rgb(...[1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16) / 255));
  firstPage.drawRectangle({ x: box.x, y: bandBottom, width: box.width, height: bandHeight, color: rgb(0.043, 0.055, 0.067) });
  firstPage.drawRectangle({ x: box.x, y: bandBottom, width: box.width, height: 3, color: accent });

  if (dealer.logoUrl) {
    const logoResponse = await fetch(dealer.logoUrl);
    if (!logoResponse.ok) throw new Error("The dealership logo could not be loaded.");
    const logoBytes = await logoResponse.arrayBuffer();
    const logo = new Uint8Array(logoBytes)[0] === 0x89 ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes);
    const factor = Math.min(42 / logo.width, 42 / logo.height);
    firstPage.drawImage(logo, { x: box.x + 20, y: bandBottom + 20, width: logo.width * factor, height: logo.height * factor });
  } else {
    firstPage.drawText("M", { x: box.x + 20, y: bandBottom + 26, size: 32, font: bold, color: rgb(0.84, 0.88, 0.93) });
  }

  // Helvetica uses WinAnsi: normalize unsupported characters and fit long data.
  function drawBrandLine(value, y, size, font, textColor) {
    const supported = new Set(font.getCharacterSet());
    let text = Array.from(String(value).replace(/[\r\n\t]+/g, " ")).map(char => supported.has(char.codePointAt(0)) ? char : "?").join("");
    const availableWidth = box.width - 104;
    while (font.widthOfTextAtSize(text, size) > availableWidth && size > 7) size -= 0.5;
    if (font.widthOfTextAtSize(text, size) > availableWidth) {
      while (text && font.widthOfTextAtSize(text + "...", size) > availableWidth) text = text.slice(0, -1);
      text += "...";
    }
    firstPage.drawText(text, { x: box.x + 80, y, size, font, color: textColor });
  }
  drawBrandLine(dealer.name.toUpperCase(), bandBottom + 56, 13, bold, rgb(0.94, 0.95, 0.96));
  drawBrandLine(`${dealer.address} | Support: ${dealer.phone}`, bandBottom + 39, 9, regular, rgb(0.7, 0.76, 0.83));
  drawBrandLine(`Agent: ${dealer.agent} | MULTIVAPS - DEMO PREVIEW`, bandBottom + 22, 8, regular, accent);
  return pdfDoc.save({ objectsPerTick: Infinity });
}

// 03. PDF actions: reserve preview tab synchronously to avoid popup blockers.
const pdfUrls = new Set();
let pdfOperation = 0;
function showPdfStatus(text, error = false) {
  ["pdf-status", "modal-pdf-status"].forEach(id => {
    const status = document.getElementById(id);
    status.textContent = text;
    status.hidden = !text;
    status.classList.toggle("is-error", error);
  });
}
function downloadPdf(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  // If a browser chooses to preview PDFs, keep it from replacing the portal.
  link.target = "_blank";
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}
async function handleCustomPdf(product, button, preview = false) {
  if (button.disabled) return;
  const branding = { ...dealerInfo };
  const operation = ++pdfOperation;
  const updateStatus = (text, error) => { if (operation === pdfOperation) showPdfStatus(text, error); };
  // Browser user activation expires during fetch: open the tab before awaiting.
  const previewTab = preview ? window.open("about:blank", "_blank") : null;
  if (previewTab) {
    previewTab.opener = null;
    previewTab.document.title = "Preparing dealership PDF";
    previewTab.document.body.textContent = "Preparing your dealership-branded PDF…";
  }
  const originalContent = button.innerHTML;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.textContent = "Preparing PDF…";
  updateStatus(`Preparing ${shortName(product)} with ${branding.name} branding…`);
  try {
    const bytes = await generateCustomDealerPdf(pdfPath(product), branding);
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    pdfUrls.add(url);
    const filename = `${product.name} - ${branding.name} - Demo.pdf`;
    if (previewTab && !previewTab.closed) {
      previewTab.location.replace(url);
      updateStatus("Your dealership-branded PDF is ready in a new tab.");
    } else {
      downloadPdf(url, filename);
      updateStatus(preview ? "The preview tab was unavailable. Your branded PDF has been downloaded instead." : "Your dealership-branded PDF download is ready.");
    }
    // Allow the viewer/download time to read the Blob before releasing memory.
    window.setTimeout(() => { URL.revokeObjectURL(url); pdfUrls.delete(url); }, 5 * 60 * 1000);
  } catch (error) {
    if (previewTab && !previewTab.closed) previewTab.close();
    updateStatus(error.message || "The custom PDF could not be generated. Please try again.", true);
  } finally {
    button.innerHTML = originalContent;
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
}
window.addEventListener("pagehide", () => { pdfUrls.forEach(url => URL.revokeObjectURL(url)); pdfUrls.clear(); });

// 04. Render each client's vehicle, status, and dealer product matrix.
function loadPersona(key) {
  const persona = demoPersonas[key];
  if (!persona) return;
  currentKey = key;
  dealerInfo = brandingFor(persona);
  const current = coverageIsCurrent(persona);
  document.documentElement.style.setProperty("--dealer-accent", persona.uiAccent);
  document.documentElement.style.setProperty("--accent-blue", persona.brandColor);
  document.querySelector(".dealer-title").textContent = persona.dealer;
  document.querySelector(".dealer-address").textContent = persona.dealerAddress;
  document.getElementById("login-label").textContent = `${persona.name} · Demo login`;
  document.getElementById("login-phone").textContent = persona.phone;
  document.getElementById("client-name").textContent = `${persona.name} · ${persona.dealer}`;
  const details = document.querySelectorAll(".vehicle-summary dd");
  [persona.vehicle, persona.odometer, persona.year, persona.vin].forEach((value, index) => { details[index].textContent = value; });
  document.querySelector(".gauge-readout strong").textContent = persona.odoK;
  document.querySelector(".odometer-gauge").setAttribute("aria-label", `Current odometer: ${persona.odometer}`);
  document.getElementById("gaugeNeedle").style.transform = `rotate(${persona.gaugeRotation})`;
  document.getElementById("health-value").innerHTML = `${current ? "100" : "0"}<span>%</span>`;
  document.getElementById("health-gauge").style.setProperty("--progress", current ? "100" : "0");
  document.getElementById("coverage-value").textContent = current ? "Active" : "Expired";
  document.getElementById("coverage-gauge").style.setProperty("--gauge-color", current ? "var(--mint)" : "#ff9098");
  document.getElementById("coverage-gauge").style.setProperty("--progress", current ? "100" : "0");
  document.getElementById("active-title").textContent = current ? "Active Policies" : "Registered Policies";
  document.getElementById("registered-description").textContent = current ? "Your current vehicle protection products." : "Your policy has expired. Review the wording or inquire with your dealer.";
  document.getElementById("active-policies").replaceChildren();
  document.getElementById("available-policies").replaceChildren();
  document.title = `Multivap Portal | ${persona.dealer} Demo`;
  clientProducts(persona).forEach((policy) => {
  const index = products.indexOf(policy);
  const owned = policy.id === persona.activePolicyId;
  const title = shortName(policy);
  const card = document.createElement("article");
  card.className = `policy-card ${owned ? (current ? "active" : "active expired") : "available"}`;
  card.dataset.productId = policy.id;
  card.innerHTML = `<div class="card-top"><span class="product-icon">${icon(policy.icon)}</span><div class="card-title"><div class="title-row"><h3>${title}</h3><span class="badge ${owned ? (current ? "" : "expired-badge") : "available-badge"}">${owned ? (current ? "ACTIVE COVER" : "EXPIRED COVER") : "AVAILABLE OPTION"}</span></div><p>${policy.description}</p></div></div>`;
  if (owned) {
    card.innerHTML += `<div class="card-bottom"><div class="expiry">${icon("calendar")}<div><small>Expiry date</small><time datetime="${persona.expiry}">${dateLabel(persona.expiry)}</time></div></div><button class="button" type="button" data-policy="${index}" aria-haspopup="dialog">View policy details</button><button class="button download" type="button" data-pdf-policy="${index}" aria-label="View Custom PDF for ${title}">${icon("document")}View Custom PDF</button></div>`;
  } else {
    card.innerHTML += `<button class="button inquiry-button" type="button" data-policy="${index}" aria-label="Inquire About Product: ${title}" aria-haspopup="dialog">Inquire About Product${icon("arrow")}</button>`;
  }
  document.getElementById(owned ? "active-policies" : "available-policies").append(card);
  });
  document.getElementById("active-count").textContent = current ? "1 active policy" : "1 expired policy";
  document.getElementById("available-count").textContent = `${clientProducts(persona).length - 1} available products`;
}

// 05. Derived admin stats and accessible client navigation, no inline handlers.
function renderAdminConsole() {
  const personas = Object.values(demoPersonas);
  const currentPolicies = personas.filter(coverageIsCurrent).length;
  document.getElementById("stat-clients").textContent = personas.length;
  document.getElementById("stat-dealers").textContent = new Set(personas.map(p => p.dealer)).size;
  document.getElementById("stat-catalog").textContent = masterCatalog.length;
  document.getElementById("stat-listed").textContent = personas.reduce((total, persona) => total + clientProducts(persona).length, 0);
  const expiredPolicies = personas.length - currentPolicies;
  document.getElementById("admin-coverage-summary").textContent = `${currentPolicies} current ${currentPolicies === 1 ? "policy" : "policies"} · ${expiredPolicies} expired ${expiredPolicies === 1 ? "policy" : "policies"} · Live demo data`;
  const body = document.getElementById("admin-table-body");
  body.replaceChildren();
  Object.entries(demoPersonas).forEach(([key, persona]) => {
    const product = masterCatalog.find(item => item.id === persona.activePolicyId);
    const current = coverageIsCurrent(persona);
    const row = document.createElement("tr");
    row.innerHTML = `<td><strong>${persona.name}</strong><small>${persona.phone}</small></td><td>${persona.vehicle}</td><td><strong>${persona.dealer}</strong><small>${persona.dealerAddress}</small></td><td><strong>${shortName(product)}</strong><small>${dateLabel(persona.expiry)}</small><span class="badge ${current ? "" : "expired-badge"}">${current ? "ACTIVE" : "EXPIRED"}</span></td><td><details><summary><strong>${persona.enabledProductIds.length}</strong> of ${masterCatalog.length} products</summary><ul>${masterCatalog.filter(item => persona.enabledProductIds.includes(item.id)).map(item => `<li>${shortName(item)}</li>`).join("")}</ul></details></td><td><button class="button small-btn" type="button" data-client="${key}">View Client Dashboard</button></td>`;
    body.append(row);
  });
}
function switchPersona(key) {
  if (key !== "admin" && !demoPersonas[key]) return;
  if (inquiryDialog.open) inquiryDialog.close();
  inquiryPolicy = null;
  inquiryTrigger = null;
  ++pdfOperation; // Old PDF jobs keep their snapshot but cannot overwrite new UI.
  showPdfStatus("");
  document.querySelectorAll(".switcher-btn").forEach(button => {
    const selected = button.dataset.persona === key;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  const admin = key === "admin";
  document.getElementById("main").hidden = admin;
  document.getElementById("admin-view").hidden = !admin;
  document.querySelector(".skip-link").href = admin ? "#admin-view" : "#main";
  document.querySelector(".brand").href = admin ? "#admin-view" : "#main";
  if (admin) {
    document.documentElement.style.setProperty("--accent-blue", "#0070f3");
    document.documentElement.style.setProperty("--dealer-accent", "#76c1fc");
    document.querySelector(".dealer-title").textContent = "Network admin";
    document.querySelector(".dealer-address").textContent = "3 dealership demo network";
    document.getElementById("login-label").textContent = "Demo admin console";
    document.getElementById("login-phone").textContent = "Network overview";
    document.title = "Multivap Portal | Dealer Network Admin Demo";
    renderAdminConsole();
  } else loadPersona(key);
}
document.querySelector(".demo-switcher-bar").addEventListener("click", event => {
  const button = event.target.closest("[data-persona]");
  if (button) switchPersona(button.dataset.persona);
});
document.getElementById("admin-table-body").addEventListener("click", event => {
  const button = event.target.closest("[data-client]");
  if (button) {
    switchPersona(button.dataset.client);
    document.getElementById("dashboard-title").focus({ preventScroll: true });
  }
});

// 06. Native dialogs provide keyboard focus containment and Escape dismissal.
const demoDialog = document.getElementById("demo-dialog");
const inquiryDialog = document.getElementById("inquiryModal");
let inquiryPolicy;
let inquiryTrigger;
document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => button.closest("dialog").close());
});
document.querySelectorAll("dialog").forEach(dialog => {
  dialog.addEventListener("click", event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
});
// Storage may be unavailable for file:// or in private browsing. Fail gracefully.
let noticeDismissed = false;
try { noticeDismissed = sessionStorage.getItem("multivaps-demo-notice") === "dismissed"; } catch {}
demoDialog.addEventListener("close", () => {
  noticeDismissed = true;
  try { sessionStorage.setItem("multivaps-demo-notice", "dismissed"); } catch {}
});

// 07. Inquiry flow. No transmission or persistence of personal information.
document.getElementById("policyGrid").addEventListener("click", event => {
  const pdfButton = event.target.closest("[data-pdf-policy]");
  if (pdfButton) {
    handleCustomPdf(products[Number(pdfButton.dataset.pdfPolicy)], pdfButton);
    return;
  }
  const button = event.target.closest("[data-policy]");
  if (!button) return;
  inquiryTrigger = button;
  inquiryPolicy = products[Number(button.dataset.policy)];
  document.getElementById("modalTitle").textContent = shortName(inquiryPolicy);
  const persona = demoPersonas[currentKey];
  const owned = inquiryPolicy.id === persona.activePolicyId;
  document.getElementById("inquiry-product").textContent = `Northern Insure · ${persona.dealer}`;
  document.getElementById("modalDesc").textContent = owned ? `Your mock registered cover ${coverageIsCurrent(persona) ? "expires" : "expired"} on ${dateLabel(persona.expiry)}. Review the supplied policy wording for terms, limits and exclusions.` : `${inquiryPolicy.description} Review the supplied policy wording or preview a callback request with ${persona.dealer}.`;
  showPdfStatus("");
  document.getElementById("inquiry-form").reset();
  document.getElementById("inquiry-form").hidden = true;
  document.getElementById("product-actions").hidden = false;
  document.getElementById("inquiry-success").hidden = true;
  inquiryDialog.showModal();
  document.getElementById("pdfLink").focus();
});
document.getElementById("pdfLink").addEventListener("click", event => {
  if (inquiryPolicy) handleCustomPdf(inquiryPolicy, event.currentTarget, true);
});
document.getElementById("confirmInquireBtn").addEventListener("click", () => {
  document.getElementById("product-actions").hidden = true;
  document.getElementById("inquiry-form").hidden = false;
  document.getElementById("customer-name").focus();
});
document.getElementById("inquiry-form").addEventListener("submit", event => {
  event.preventDefault();
  document.getElementById("success-copy").textContent = `Your interest in ${shortName(inquiryPolicy)} is ready to connect to ${demoPersonas[currentKey].dealer}.`;
  document.getElementById("inquiry-form").hidden = true;
  document.getElementById("inquiry-success").hidden = false;
  document.querySelector("#inquiry-success button").focus();
});
// 08. Initial profile and expiry refresh; CSS honors reduced motion.
loadPersona("client1");
window.addEventListener("focus", () => {
  if (!document.getElementById("admin-view").hidden) renderAdminConsole();
});

// 09. First-visit landing animation from the supplied Qwen HTML reference.
// The dashboard is already initialized behind a native, focus-contained dialog.
const introDialog = document.getElementById("portal-intro");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let introTimer;
let introExitTimer;
let introFinishing = false;
function afterIntro() {
  window.clearTimeout(introTimer);
  window.clearTimeout(introExitTimer);
  introFinishing = false;
  try { sessionStorage.setItem("multivaps-intro-seen", "yes"); } catch {}
  if (!noticeDismissed && !demoDialog.open) demoDialog.showModal();
  else {
    const destination = document.getElementById(document.getElementById("main").hidden ? "admin-title" : "dashboard-title");
    destination.tabIndex = -1;
    destination.focus({ preventScroll: true });
  }
}
function finishIntro() {
  if (!introDialog.open || introFinishing) return;
  introFinishing = true;
  window.clearTimeout(introTimer);
  if (reducedMotion.matches) introDialog.close();
  else {
    introDialog.classList.add("is-exiting");
    introExitTimer = window.setTimeout(() => introDialog.close(), 350);
  }
}
function startIntro() {
  if (introDialog.open) return;
  if (demoDialog.open) demoDialog.close();
  if (inquiryDialog.open) inquiryDialog.close();
  introFinishing = false;
  introDialog.classList.remove("is-exiting");
  if (reducedMotion.matches) {
    afterIntro();
    return;
  }
  introDialog.showModal();
  document.getElementById("enter-portal").focus({ preventScroll: true });
  // Subheading animation finishes at 4.5 seconds; leave a brief final hold.
  introTimer = window.setTimeout(finishIntro, 4800);
}
introDialog.addEventListener("close", afterIntro);
introDialog.addEventListener("cancel", event => { event.preventDefault(); finishIntro(); });
document.getElementById("enter-portal").addEventListener("click", finishIntro);
document.getElementById("replay-intro").addEventListener("click", startIntro);
reducedMotion.addEventListener("change", event => { if (event.matches) finishIntro(); });
let introSeen = false;
try { introSeen = sessionStorage.getItem("multivaps-intro-seen") === "yes"; } catch {}
if (introSeen) {
  if (!noticeDismissed) demoDialog.showModal();
} else startIntro();
inquiryDialog.addEventListener("close", () => {
  document.getElementById("inquiry-form").reset();
  if (inquiryTrigger) inquiryTrigger.focus();
});
