"use strict";

// 01. Single demo catalog. PDF names match the supplied files exactly.
// Vehicle status and expiration dates are mock data, not read from the PDFs.
const products = [
  { name: "Northern Insure - Supreme Drive Plus", file: "Northern Insure - Supreme Drive Plus - Policy Wording.pdf", activeForDealer: true, userHasActive: true, expiry: "2027-11-14", icon: "shield", description: "Your Supreme Drive Plus policy documents, together in one place." },
  { name: "Northern Insure - Service Plan", file: "Northern Insure - Service Plan - Policy Wording.pdf", activeForDealer: true, userHasActive: false, icon: "tool", description: "Review the service plan option with your dealership." },
  { name: "Northern Insure - Prime Drive Plus", file: "Northern Insure - Prime Drive Plus - Policy Wording.pdf", activeForDealer: true, userHasActive: false, icon: "car", description: "Discover the Prime Drive Plus product and policy details." },
  { name: "Northern Insure - Monthly Warranty", file: "Northern Insure - Monthly Warranty - Policy Wording.pdf", activeForDealer: true, userHasActive: false, icon: "calendar", description: "Ask your dealer about a monthly vehicle warranty option." },
  { name: "Northern Insure - GAP Warranty", file: "Northern Insure - GAP Warranty - Policy Wording.pdf", activeForDealer: false, userHasActive: false, icon: "bars", description: "Explore the GAP Warranty product with your dealership." },
  { name: "Northern Insure - Essential Drive Plus", file: "Northern Insure - Essential Drive Plus - Policy Wording.pdf", activeForDealer: false, userHasActive: false, icon: "document", description: "Explore everyday vehicle protection with your dealership." },
  { name: "Northern Insure - Elite Warranty Plus", file: "Northern Insure - Elite Warranty Plus - Policy Wording.pdf", activeForDealer: false, userHasActive: false, icon: "shield", description: "Explore the Elite Warranty Plus option for your vehicle." },
  { name: "Northern Insure - Elite Warranty", file: "Northern Insure - Elite Warranty - Policy Wording.pdf", activeForDealer: false, userHasActive: false, icon: "shield", description: "Find out more about the Elite vehicle warranty option." },
  { name: "Northern Insure - Elite Tyre & Rim", file: "Northern Insure - Elite Tyre & Rim - Policy Wording.pdf", activeForDealer: false, userHasActive: false, icon: "wheel", description: "Discover the tyre and rim protection product." },
  { name: "Northern Insure - Body & Interior", file: "Northern Insure - Body & Interior - Policy Wording.pdf", activeForDealer: false, userHasActive: false, icon: "car", description: "Discover protection options for your vehicle’s exterior and interior." }
];
const dealershipProducts = products.filter(product => product.activeForDealer || product.userHasActive)
  .sort((a, b) => Number(b.userHasActive) - Number(a.userHasActive));
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
const pdfPath = product => encodeURIComponent(product.file);
const shortName = product => product.name.replace("Northern Insure - ", "");
const dateLabel = value => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));

// 02. Render policy cards. Catalog values are developer-owned constants.
dealershipProducts.forEach((policy) => {
  const index = products.indexOf(policy);
  const title = shortName(policy);
  const card = document.createElement("article");
  card.className = `policy-card ${policy.userHasActive ? "active" : "available"}`;
  card.innerHTML = `<div class="card-top"><span class="product-icon">${icon(policy.icon)}</span><div class="card-title"><div class="title-row"><h3>${title}</h3><span class="badge ${policy.userHasActive ? "" : "available-badge"}">${policy.userHasActive ? "ACTIVE COVER" : "AVAILABLE OPTION"}</span></div><p>${policy.description}</p></div></div>`;
  if (policy.userHasActive) {
    card.innerHTML += `<div class="card-bottom"><div class="expiry">${icon("calendar")}<div><small>Expiry date</small><time datetime="${policy.expiry}">${dateLabel(policy.expiry)}</time></div></div><button class="button" type="button" data-policy="${index}" aria-haspopup="dialog">View policy details</button><a class="button download" href="${pdfPath(policy)}" download aria-label="View Custom PDF for ${title}">${icon("document")}View Custom PDF</a></div>`;
  } else {
    card.innerHTML += `<button class="button inquiry-button" type="button" data-policy="${index}" aria-label="Inquire About Product: ${title}" aria-haspopup="dialog">Inquire About Product${icon("arrow")}</button>`;
  }
  document.getElementById(policy.userHasActive ? "active-policies" : "available-policies").append(card);
});
const activeCount = dealershipProducts.filter(product => product.userHasActive).length;
document.getElementById("active-count").textContent = `${activeCount} active ${activeCount === 1 ? "policy" : "policies"}`;
document.getElementById("available-count").textContent = `${dealershipProducts.length - activeCount} available products`;

// 03. Native dialogs provide keyboard focus containment and Escape dismissal.
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
if (!noticeDismissed) demoDialog.showModal();
demoDialog.addEventListener("close", () => {
  try { sessionStorage.setItem("multivaps-demo-notice", "dismissed"); } catch {}
});

// 04. Inquiry flow. No network requests or persistence of personal information.
document.getElementById("policyGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-policy]");
  if (!button) return;
  inquiryTrigger = button;
  inquiryPolicy = products[Number(button.dataset.policy)];
  document.getElementById("modalTitle").textContent = shortName(inquiryPolicy);
  document.getElementById("inquiry-product").textContent = "Northern Insure · Toyota Johannesburg";
  document.getElementById("modalDesc").textContent = inquiryPolicy.userHasActive ? `Your mock active cover expires on ${dateLabel(inquiryPolicy.expiry)}. Review the supplied policy wording for terms, limits and exclusions.` : `${inquiryPolicy.description} Review the supplied policy wording or preview a callback request.`;
  document.getElementById("pdfLink").href = pdfPath(inquiryPolicy);
  document.getElementById("inquiry-form").reset();
  document.getElementById("inquiry-form").hidden = true;
  document.getElementById("product-actions").hidden = false;
  document.getElementById("inquiry-success").hidden = true;
  inquiryDialog.showModal();
  document.getElementById("pdfLink").focus();
});
document.getElementById("confirmInquireBtn").addEventListener("click", () => {
  document.getElementById("product-actions").hidden = true;
  document.getElementById("inquiry-form").hidden = false;
  document.getElementById("customer-name").focus();
});
document.getElementById("inquiry-form").addEventListener("submit", event => {
  event.preventDefault();
  document.getElementById("success-copy").textContent = `Your interest in ${shortName(inquiryPolicy)} is ready to connect to a dealership inquiry service.`;
  document.getElementById("inquiry-form").hidden = true;
  document.getElementById("inquiry-success").hidden = false;
  document.querySelector("#inquiry-success button").focus();
});
// 05. Decorative instrument animation; honor reduced-motion preferences.
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.setTimeout(() => { document.getElementById("gaugeNeedle").style.transform = "rotate(75deg)"; }, 300);
} else {
  document.getElementById("gaugeNeedle").style.transform = "rotate(75deg)";
}
inquiryDialog.addEventListener("close", () => {
  document.getElementById("inquiry-form").reset();
  if (inquiryTrigger) inquiryTrigger.focus();
});
