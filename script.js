/**
 * MANI PHYSIOTHERAPY AND REHABILITATION CENTRE
 * Comprehensive Platform Logic: PDF Generator, WhatsApp Automation & 5-Star Google Review Engine
 */

// Clinic Contact Configuration
const CLINIC_PHONE = "917305809477";
const GOOGLE_MAPS_REVIEW_URL = "https://maps.app.goo.gl/bxTsAGo42B9ArvuMA?g_st=aw";

// DOM Elements
const bookingForm = document.getElementById("bookingForm");
const serviceSelect = document.getElementById("service");
const confirmationModal = document.getElementById("confirmationModal");
const closeConfirmModal = document.getElementById("closeConfirmModal");
const confirmSummary = document.getElementById("confirmSummary");
const slipAppointmentId = document.getElementById("slipAppointmentId");
const downloadSlipPdfBtn = document.getElementById("downloadSlipPdfBtn");
const shareWaBtn = document.getElementById("shareWaBtn");
const promptReviewFromModalBtn = document.getElementById("promptReviewFromModalBtn");

// Review Modal Elements
const reviewModal = document.getElementById("reviewModal");
const closeReviewModal = document.getElementById("closeReviewModal");
const openReviewPromptBtn = document.getElementById("openReviewPromptBtn");
const interactiveStars = document.getElementById("interactiveStars");
const starFeedbackText = document.getElementById("starFeedbackText");
const googleRedirectBox = document.getElementById("googleRedirectBox");
const saveOnsiteReviewBtn = document.getElementById("saveOnsiteReviewBtn");
const reviewsContainer = document.getElementById("reviewsContainer");

// Current Booking State
let currentBooking = null;
let currentRating = 5;

// ================= 1. SERVICE CATEGORY FILTERING =================
const filterButtons = document.querySelectorAll(".filter-btn");
const serviceCards = document.querySelectorAll(".service-card");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.getAttribute("data-filter");
    serviceCards.forEach(card => {
      if (category === "all" || card.getAttribute("data-category") === category) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  });
});

// Quick select helper from service cards
window.selectServiceForBooking = function (serviceName) {
  if (serviceSelect) {
    for (let i = 0; i < serviceSelect.options.length; i++) {
      if (serviceSelect.options[i].text.includes(serviceName) || serviceSelect.options[i].value === serviceName) {
        serviceSelect.selectedIndex = i;
        break;
      }
    }
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  }
};

// ================= 2. BOOKING FORM SUBMISSION =================
if (bookingForm) {
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value.trim();
    const gender = document.getElementById("gender").value;
    const phone = document.getElementById("phone").value.trim();
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      document.getElementById("phone").focus();
      return;
    }

    const service = serviceSelect.value || "Orthopaedic Physiotherapy & Spine Care";
    const date = document.getElementById("date").value;
    const timeSlot = document.getElementById("timeSlot").value;
    const notes = document.getElementById("notes").value.trim();

    const appointmentId = `MPT-${Math.floor(1000 + Math.random() * 9000)}`;

    currentBooking = {
      id: Date.now(),
      appointmentId: appointmentId,
      name: name,
      age: age,
      gender: gender,
      phone: phone,
      service: service,
      date: date,
      timeSlot: timeSlot,
      notes: notes,
      status: "Booked",
      submittedAt: new Date().toISOString()
    };

    // Save to shared localStorage for Admin Panel (dual keys for modern + legacy compatibility)
    const existingBookings = JSON.parse(localStorage.getItem("maniPhysioBookings") || localStorage.getItem("womenWelfareBookings") || "[]");
    existingBookings.push(currentBooking);
    localStorage.setItem("maniPhysioBookings", JSON.stringify(existingBookings));
    localStorage.setItem("womenWelfareBookings", JSON.stringify(existingBookings));

    // Update Confirmation Modal UI
    confirmSummary.innerHTML = `
      Dear <strong>${name}</strong>, your clinical intake appointment for <strong>${service}</strong> has been logged for <strong>${date}</strong> (${timeSlot}).
    `;
    slipAppointmentId.textContent = appointmentId;

    // Compose WhatsApp Direct Link (includes Google Maps Review Link)
    const waText = encodeURIComponent(
      `Hello Dr. Jayachitra Manikandan,\n\nI have booked an appointment on MANI PHYSIOTHERAPY CLINIC care portal.\n\n` +
      `📋 Appointment ID: ${appointmentId}\n` +
      `👤 Patient: ${name} (${age}y / ${gender})\n` +
      `📞 Mobile: ${phone}\n` +
      `🏥 Clinical Department: ${service}\n` +
      `📅 Scheduled Slot: ${date} (${timeSlot})\n` +
      (notes ? `📝 Primary Complaint: ${notes}\n\n` : `\n`) +
      `Please confirm my slot. Thank you!\n\n` +
      `⭐ Clinic Google Review Link: ${GOOGLE_MAPS_REVIEW_URL}`
    );
    shareWaBtn.href = `https://wa.me/${CLINIC_PHONE}?text=${waText}`;

    // Reset UPI display state if previously opened
    const upiCard = document.getElementById("upiPaymentCard");
    if (upiCard) upiCard.style.display = "none";

    // Open Confirmation Modal
    confirmationModal.classList.add("show");
    confirmationModal.setAttribute("aria-hidden", "false");

    // Automatically trigger instant official prescription PDF download
    setTimeout(() => {
      generatePatientSlipPdf(currentBooking);
    }, 400);
  });
}

// Close Modals
if (closeConfirmModal) {
  closeConfirmModal.addEventListener("click", () => {
    confirmationModal.classList.remove("show");
    confirmationModal.setAttribute("aria-hidden", "true");
  });
}

if (confirmationModal) {
  confirmationModal.addEventListener("click", (e) => {
    if (e.target === confirmationModal) {
      confirmationModal.classList.remove("show");
    }
  });
}

// Download Button in Modal
if (downloadSlipPdfBtn) {
  downloadSlipPdfBtn.addEventListener("click", () => {
    if (currentBooking) {
      generatePatientSlipPdf(currentBooking);
    }
  });
}

// UPI Payment Handlers
const toggleUpiBtn = document.getElementById("toggleUpiBtn");
const upiPaymentCard = document.getElementById("upiPaymentCard");
const copyUpiBtn = document.getElementById("copyUpiBtn");

if (toggleUpiBtn && upiPaymentCard) {
  toggleUpiBtn.addEventListener("click", () => {
    const isHidden = upiPaymentCard.style.display === "none" || !upiPaymentCard.style.display;
    upiPaymentCard.style.display = isHidden ? "block" : "none";
    if (isHidden) {
      upiPaymentCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
}

if (copyUpiBtn) {
  copyUpiBtn.addEventListener("click", () => {
    navigator.clipboard.writeText("slsujith8220-1@okicici").then(() => {
      copyUpiBtn.textContent = "Copied! ✓";
      setTimeout(() => { copyUpiBtn.textContent = "Copy"; }, 2000);
    });
  });
}

// ================= 3. HELPER: LOAD IMAGE AS DATA URL =================
function loadImageAsDataURL(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      try {
        const mime = src.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
        resolve(canvas.toDataURL(mime, 0.95));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = src;
  });
}

// Focused Clinical Service Protocols (Streamlined for selected treatment)
const clinicalServiceProtocols = {
  "Orthopaedic Physiotherapy & Spine Care": [
    "• Spinal Decompression & McKenzie Postural Protocol",
    "• Core & Paraspinal Isometric Stabilization Exercises",
    "• Targeted Joint Mobilization & Active Range of Motion",
    "• Lumbar Support & Ergonomic Postural Guidance"
  ],
  "Neurological & Stroke Rehabilitation": [
    "• Neuro-Developmental Facilitation & Reciprocal Muscle Re-education",
    "• Functional Mobility & Safe Transfer Retraining (Sit-to-Stand)",
    "• Static & Dynamic Balance Retraining on Balance Board",
    "• Supervised Gait Synchronization & Fall Safety Protocol"
  ],
  "Women's Wellness & Physiotherapy (Antenatal, Postnatal & Postural Care)": [
    "• Pelvic Floor Muscle Conditioning & Safe Core Co-contraction",
    "• Diastasis Recti Assessment & Gentle Abdominal Recovery",
    "• Maternal Ergonomics for Safe Baby Feeding & Carrying",
    "• Diaphragmatic Breathing for Pelvic & Spine Decompression"
  ],
  "Fitness & Wellness Transition": [
    "• Functional Movement Screen & Kinetic Chain Alignment",
    "• Graded Progressive Resistance & Functional Strength Plan",
    "• Core Stability & Postural Endurance Conditioning",
    "• Dynamic Warm-Up & Targeted Lower Limb Flexibility Routine"
  ],
  "Workplace Ergonomics & Corporate Health": [
    "• Workstation Ergonomic Setup (90-90-90 Neutral Alignment)",
    "• 2-Minute Micro-Break Decompression Stretches (every 45 mins)",
    "• Tech-Neck & Thoracic Spine Extension Exercises",
    "• Neutral Wrist Alignment for RSI & Carpal Tunnel Prevention"
  ],
  "Home Physiotherapy & Rehabilitation": [
    "• In-Home Functional Bed Mobility & Positioning Safety",
    "• Active-Assisted Joint Range of Motion & Circulation Exercises",
    "• Supervised Living Space Ambulation with Assistive Device",
    "• Caregiver Guidance for Safe Patient Transfers & Fall Hazard Reduction"
  ],
  "Patient Education & Counseling": [
    "• Spine & Joint Biomechanical Education (Root-Cause Explanation)",
    "• Joint Protection & Safe Body Mechanics in Daily Tasks",
    "• Activity Pacing & Gradual Reconditioning Strategy",
    "• Home Self-Care Blueprint & Scheduled Preventive Review"
  ]
};

// ================= 3. MODERN APPOINTMENT-SLIP PDF GENERATOR (NEW DESIGN) =================
async function generatePatientSlipPdf(booking) {
  if (!window.jspdf) {
    alert("PDF library loading. Please try again in a moment.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();   // 595
  const H = doc.internal.pageSize.getHeight();  // 842
  const M = 36;

  const NAVY = [9, 58, 91];
  const TEAL = [8, 119, 131];
  const GREEN = [46, 160, 110];
  const DARK = [30, 45, 52];
  const GRAY = [105, 125, 132];
  const SOFT = [240, 248, 249];
  const LINE = [214, 230, 233];

  const formatName = str => (str || "").trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

  const fmtDate = d => {
    const p = (d || "").split("-");
    return p.length === 3 ? `${p[2]} / ${p[1]} / ${p[0]}` : (d || "-");
  };

  // ---------- Header ----------
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 8, "F");
  doc.setFillColor(...TEAL);
  doc.rect(0, 8, W * 0.62, 4, "F");
  doc.setFillColor(...GREEN);
  doc.rect(W * 0.62, 8, W * 0.38, 4, "F");

  // Logo icon (bigger) + wordmark
  let textX = M;
  try {
    const logoData = await loadImageAsDataURL("clinic-logo.jpg");
    const props = doc.getImageProperties(logoData);
    const lh = 86;
    const lw = lh * (props.width / props.height);
    doc.addImage(logoData, "JPEG", M - 6, 16, lw, lh);
    textX = M - 6 + lw + 4;
  } catch (e) {
    console.warn("Logo failed:", e);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.setTextColor(...GREEN);
  doc.text("MANI", textX, 62);
  doc.setFontSize(12.5);
  doc.setTextColor(...NAVY);
  doc.text("PHYSIOTHERAPY CLINIC", textX, 79);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...GREEN);
  doc.text("Move Better  •  Feel Better  •  Live Better", textX, 93);

  // Doctor block (right aligned)
  const rx = W - M;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  doc.text("DR. C. JAYACHITRA MANIKANDAN, P.T.", rx, 38, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("MAP, MPT (Ortho), PhD, MBA (HR), MBA (HSM), IOSH MS", rx, 51, { align: "right" });
  doc.text("Senior Consultant Physiotherapist", rx, 62, { align: "right" });
  doc.text("Rehab Specialist & Certified Workplace Ergonomist", rx, 73, { align: "right" });
  doc.setTextColor(...TEAL);
  doc.setFont("helvetica", "bold");
  doc.text("+91 73058 09477   |   jayachitra750@gmail.com   |   www.drjamprfit.com", rx, 90, { align: "right" });

  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.line(M, 106, W - M, 106);

  // ---------- Title ribbon ----------
  doc.setFillColor(...NAVY);
  doc.roundedRect(M, 120, W - 2 * M, 30, 6, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("APPOINTMENT CONFIRMATION & CLINICAL SLIP", M + 16, 139);
  doc.setFontSize(9);
  doc.setTextColor(170, 235, 225);
  doc.text(`Token #${booking.appointmentId || "MPT-ID"}`, W - M - 16, 139, { align: "right" });

  // ---------- Patient details card ----------
  const cardY = 166;
  const cardH = 118;
  doc.setFillColor(...SOFT);
  doc.setDrawColor(...LINE);
  doc.roundedRect(M, cardY, W - 2 * M, cardH, 8, 8, "FD");
  doc.setFillColor(...TEAL);
  doc.rect(M, cardY + 12, 4, cardH - 24, "F");

  const ageStr = booking.age ? `${booking.age} Yrs` : "";
  const ageGender = [ageStr, booking.gender || ""].filter(Boolean).join(" / ") || "-";
  const colL = M + 22;
  const colR = M + (W - 2 * M) / 2 + 10;
  const field = (label, value, x, y) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEAL);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text(String(value || "-"), x, y + 14);
  };
  field("Patient Name", formatName(booking.name), colL, cardY + 26);
  field("Date", fmtDate(booking.date), colR, cardY + 26);
  field("Age / Gender", ageGender, colL, cardY + 62);
  field("Phone No.", (booking.phone || "").trim(), colR, cardY + 62);
  doc.setDrawColor(...LINE);
  doc.line(colL, cardY + 50, W - M - 14, cardY + 50);
  doc.line(colL, cardY + 88, W - M - 14, cardY + 88);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(`Consultation Slot: ${booking.timeSlot || "Clinic Hours"}`, colL, cardY + 105);

  // ---------- Treatment ----------
  const selectedService = booking.service || "Orthopaedic Physiotherapy & Spine Care";
  let y = cardY + cardH + 30;

  // Rx mark
  doc.setFont("times", "bolditalic");
  doc.setFontSize(34);
  doc.setTextColor(...NAVY);
  doc.text("Rx", M, y + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...TEAL);
  doc.text("CLINICAL CARE / DEPARTMENT", M + 52, y - 8);
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text(selectedService, M + 52, y + 8);
  y += 22;

  const complaint = (booking.notes || "").trim();
  if (complaint) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text("Chief Complaint:", M, y + 8);
    doc.setFont("helvetica", "normal");
    const cl = doc.splitTextToSize(complaint, W - 2 * M - 95);
    doc.text(cl, M + 90, y + 8);
    y += cl.length * 12 + 10;
  }
  y += 8;

  const sectionTitle = (title, color) => {
    doc.setFillColor(...color);
    doc.rect(M, y - 9, 3, 13, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...color);
    doc.text(title, M + 10, y + 1);
    y += 16;
  };

  // ---------- Protocol ----------
  sectionTitle("RECOMMENDED CLINICAL PROTOCOL & REHABILITATION GUIDELINES", NAVY);
  const protocols = clinicalServiceProtocols[selectedService] || clinicalServiceProtocols["Orthopaedic Physiotherapy & Spine Care"];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  protocols.forEach((item, i) => {
    const text = item.replace(/^•\s*/, "");
    const lines = doc.splitTextToSize(text, W - 2 * M - 40);
    const h = lines.length * 12 + 10;
    doc.setFillColor(...(i % 2 === 0 ? SOFT : [255, 255, 255]));
    doc.rect(M, y - 10, W - 2 * M, h, "F");
    doc.setFillColor(...TEAL);
    doc.circle(M + 14, y - 1.5, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), M + 14, y + 1, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...DARK);
    doc.text(lines, M + 30, y);
    y += h;
  });
  y += 14;

  // ---------- Instructions ----------
  sectionTitle("INSTRUCTIONS FOR YOUR CLINIC CONSULTATION", GREEN);
  const instructions = [
    "Please bring previous X-rays, MRI scans, or physician discharge summaries if available.",
    "Wear comfortable, flexible clothing suitable for physical examination and joint movement.",
    "Please arrive 10 minutes prior to your allocated time slot for vital signs check.",
    "For any urgent queries or schedule adjustments, contact our desk at +91 73058 09477."
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  instructions.forEach(inst => {
    const lines = doc.splitTextToSize(inst, W - 2 * M - 22);
    doc.setFillColor(...GREEN);
    doc.circle(M + 6, y - 2.5, 2, "F");
    doc.text(lines, M + 16, y);
    y += lines.length * 11.5 + 5;
  });

  // ---------- Signature Area ----------
  const sigBase = H - 88;
  const sigW = 120;
  const sigH = sigW * (597 / 698);
  const sigX = W - M - sigW - 10;
  try {
    const sigData = window.DOCTOR_SIGNATURE_B64 || await loadImageAsDataURL("doctor-signature.png");
    doc.addImage(sigData, "PNG", sigX, sigBase - sigH + 4, sigW, sigH);
  } catch (e) {
    console.warn("Signature failed:", e);
  }
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.8);
  doc.line(W - M - 160, sigBase + 4, W - M, sigBase + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text("Dr. C. Jayachitra Manikandan, P.T.", W - M, sigBase + 17, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Authorized Signatory", W - M, sigBase + 28, { align: "right" });

  // ---------- Footer ----------
  doc.setFillColor(...NAVY);
  doc.rect(0, H - 34, W, 34, "F");
  doc.setFillColor(...GREEN);
  doc.rect(0, H - 37, W, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("Move Better  •  Feel Better  •  Live Better", W / 2, H - 15, { align: "center" });

  const safeName = (booking.name || "Patient").replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Appointment_Slip_${safeName}_${booking.appointmentId}.pdf`);
}

// ================= 3b. LEGACY PRESCRIPTION-PAD PDF GENERATOR (TEMPLATE-BASED, UNUSED) =================
async function generatePatientSlipPdfLegacy(booking) {
  if (!window.jspdf) {
    alert("PDF library loading. Please try again in a moment.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Load official prescription template image (embedded base64 or fallback)
  let hasTemplate = false;
  if (window.PRESCRIPTION_TEMPLATE_B64) {
    try {
      doc.addImage(window.PRESCRIPTION_TEMPLATE_B64, "JPEG", 0, 0, pageWidth, pageHeight);
      hasTemplate = true;
    } catch (e) {
      console.warn("Could not draw embedded template:", e);
    }
  }

  if (!hasTemplate) {
    try {
      const templateData = await loadImageAsDataURL("prescription-template.jpg");
      doc.addImage(templateData, "JPEG", 0, 0, pageWidth, pageHeight);
      hasTemplate = true;
    } catch (err) {
      console.error("Prescription template failed to load; using fallback styling", err);
    }
  }

  // Exact scale factors from 1080x1526 template to A4 page
  const sX = pageWidth / 1080;
  const sY = pageHeight / 1526;

  const NAVY = [9, 58, 91];
  const TEAL = [8, 119, 131];
  const DARK = [20, 53, 61];
  const GRAY = [83, 112, 120];

  const formatName = str => str.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

  // 1. Patient Name: placed cleanly on line y=348 (baseline at 343)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  if (booking.name) {
    doc.text(formatName(booking.name), 225 * sX, 343 * sY);
  }

  // 2. Date: placed centered into the slots "Date : ___ / ___ / ______" (baseline at 343)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  if (booking.date) {
    const parts = booking.date.split("-");
    if (parts.length === 3) {
      const [yy, mm, dd] = parts;
      doc.text(dd, 827 * sX, 343 * sY, { align: "center" });
      doc.text(mm, 897 * sX, 343 * sY, { align: "center" });
      doc.text(yy, 987 * sX, 343 * sY, { align: "center" });
    } else {
      doc.text(booking.date, 827 * sX, 343 * sY);
    }
  }

  // 3. Age / Gender: placed cleanly on line y=404 (baseline at 400)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  const ageStr = booking.age ? `${booking.age} Yrs` : "";
  const genStr = booking.gender || "";
  const ageGender = [ageStr, genStr].filter(Boolean).join(" / ");
  if (ageGender) {
    doc.text(ageGender, 225 * sX, 400 * sY);
  }

  // 4. Phone No.: placed cleanly on line y=404 right after "Phone No. :" (baseline at 400)
  if (booking.phone) {
    doc.text(booking.phone.trim(), 852 * sX, 400 * sY);
  }

  // 5. Prescription Body: Clean, streamlined for selected treatment (starts safely at 595 to clear Rx tail at 539)
  let yCur = 595 * sY;
  const xLeft = 42 * sX;
  const maxWidth = 996 * sX;

  const selectedService = booking.service || "Orthopaedic Physiotherapy & Spine Care";

  // Selected Treatment
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...TEAL);
  doc.text("CLINICAL CARE / DEPARTMENT:", xLeft, yCur);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(selectedService, xLeft + 195 * sX, yCur);
  yCur += 22 * sY;

  // Primary Complaint (if provided)
  const complaint = (booking.notes || "").trim();
  if (complaint) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...DARK);
    doc.text("Chief Complaint:", xLeft, yCur);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const compLines = doc.splitTextToSize(complaint, maxWidth - 120 * sX);
    doc.text(compLines, xLeft + 115 * sX, yCur);
    yCur += Math.max(18, compLines.length * 13 + 6) * sY;
  }

  // Appointment slot token
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text(
    `Consultation Slot: ${booking.date || "Scheduled"} (${booking.timeSlot || "Clinic Hours"})   |   Token #${booking.appointmentId || "MPT-ID"}`,
    xLeft,
    yCur
  );
  yCur += 14 * sY;

  // Clean divider
  doc.setDrawColor(215, 235, 238);
  doc.setLineWidth(0.8);
  doc.line(xLeft, yCur, xLeft + maxWidth, yCur);
  yCur += 22 * sY;

  // Prescribed Protocol for Selected Treatment
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  doc.text("RECOMMENDED CLINICAL PROTOCOL & REHABILITATION GUIDELINES:", xLeft, yCur);
  yCur += 18 * sY;

  const protocols = clinicalServiceProtocols[selectedService] || clinicalServiceProtocols["Orthopaedic Physiotherapy & Spine Care"];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  protocols.forEach(item => {
    const lines = doc.splitTextToSize(item, maxWidth - 15 * sX);
    doc.text(lines, xLeft + 6 * sX, yCur);
    yCur += (lines.length * 13 + 7) * sY;
  });

  // Clinical Instructions for Visit
  yCur += 14 * sY;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...TEAL);
  doc.text("INSTRUCTIONS FOR YOUR CLINIC CONSULTATION:", xLeft, yCur);
  yCur += 16 * sY;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  const instructions = [
    "• Please bring previous X-rays, MRI scans, or physician discharge summaries if available.",
    "• Wear comfortable, flexible clothing suitable for physical examination and joint movement.",
    "• Please arrive 10 minutes prior to your allocated time slot for vital signs check.",
    "• For any urgent queries or schedule adjustments, contact our desk at +91 73058 09477."
  ];
  instructions.forEach(inst => {
    const lines = doc.splitTextToSize(inst, maxWidth - 15 * sX);
    doc.text(lines, xLeft + 6 * sX, yCur);
    yCur += (lines.length * 11.5 + 5) * sY;
  });

  // Doctor Signature: sits naturally touching line y=1324, centered over signature line (center=884)
  const sigW = 175 * sX;
  const sigH = (sigW * (597 / 698));
  const sigX = (884 * sX) - (sigW / 2);
  const sigY = (1324 * sY) - (sigH * 0.965);

  if (window.DOCTOR_SIGNATURE_B64) {
    try {
      doc.addImage(window.DOCTOR_SIGNATURE_B64, "PNG", sigX, sigY, sigW, sigH);
    } catch (e) {
      console.warn("Could not draw embedded signature:", e);
    }
  } else {
    try {
      const sigData = await loadImageAsDataURL("doctor-signature.png");
      doc.addImage(sigData, "PNG", sigX, sigY, sigW, sigH);
    } catch (e) {
      console.warn("Fallback signature failed:", e);
    }
  }

  // Save PDF
  const safeName = (booking.name || "Patient").replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Prescription_Slip_${safeName}_${booking.appointmentId}.pdf`);
}

// ================= 4. 5-STAR GOOGLE REVIEW ENGINE =================
function setupReviewEngine() {
  const stars = document.querySelectorAll(".star-interactive");

  stars.forEach(star => {
    // Hover effect
    star.addEventListener("mouseenter", () => {
      const val = parseInt(star.getAttribute("data-star"), 10);
      highlightStars(val);
    });

    // Click effect
    star.addEventListener("click", () => {
      currentRating = parseInt(star.getAttribute("data-star"), 10);
      highlightStars(currentRating);
      updateRatingFeedback(currentRating);

      if (currentRating === 5) {
        // High-intent 5-star rating -> Trigger Google Maps Review redirection!
        if (googleRedirectBox) {
          googleRedirectBox.style.display = "block";
          googleRedirectBox.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        if (googleRedirectBox) googleRedirectBox.style.display = "none";
      }
    });
  });

  if (interactiveStars) {
    interactiveStars.addEventListener("mouseleave", () => {
      highlightStars(currentRating);
    });
  }

  // Pre-select 5 stars
  highlightStars(5);
  updateRatingFeedback(5);
}

function highlightStars(count) {
  const stars = document.querySelectorAll(".star-interactive");
  stars.forEach(s => {
    const val = parseInt(s.getAttribute("data-star"), 10);
    if (val <= count) {
      s.classList.add("active");
    } else {
      s.classList.remove("active");
    }
  });
}

function updateRatingFeedback(rating) {
  if (!starFeedbackText) return;
  const feedbackMap = {
    1: "Needs improvement",
    2: "Fair experience",
    3: "Good care & treatment",
    4: "Very Good rehabilitation",
    5: "⭐⭐⭐⭐⭐ Outstanding & Life-Changing Relief!"
  };
  starFeedbackText.textContent = feedbackMap[rating] || "5-Star Rating";
}

// Open Review Modal triggers
if (openReviewPromptBtn) {
  openReviewPromptBtn.addEventListener("click", () => {
    openReviewModalDialog();
  });
}

if (promptReviewFromModalBtn) {
  promptReviewFromModalBtn.addEventListener("click", () => {
    if (confirmationModal) confirmationModal.classList.remove("show");
    openReviewModalDialog();
  });
}

function openReviewModalDialog() {
  if (reviewModal) {
    reviewModal.classList.add("show");
    reviewModal.setAttribute("aria-hidden", "false");
    highlightStars(5);
    updateRatingFeedback(5);
    if (googleRedirectBox) googleRedirectBox.style.display = "block";
  }
}

if (closeReviewModal) {
  closeReviewModal.addEventListener("click", () => {
    reviewModal.classList.remove("show");
    reviewModal.setAttribute("aria-hidden", "true");
  });
}

if (reviewModal) {
  reviewModal.addEventListener("click", (e) => {
    if (e.target === reviewModal) {
      reviewModal.classList.remove("show");
    }
  });
}

// Submit On-site review
if (saveOnsiteReviewBtn) {
  saveOnsiteReviewBtn.addEventListener("click", () => {
    const reviewerName = document.getElementById("reviewerName").value.trim() || "Verified Patient";
    const reviewerTreatment = document.getElementById("reviewerTreatment").value.trim() || "Physiotherapy Care";
    const reviewerComments = document.getElementById("reviewerComments").value.trim();

    if (!reviewerComments) {
      alert("Please write a short review before submitting.");
      return;
    }

    const newReview = {
      name: reviewerName,
      treatment: reviewerTreatment,
      rating: currentRating,
      comment: reviewerComments,
      date: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    };

    // Save locally
    const reviews = JSON.parse(localStorage.getItem("clinicPatientReviews") || "[]");
    reviews.unshift(newReview);
    localStorage.setItem("clinicPatientReviews", JSON.stringify(reviews));

    // Append to live container
    if (reviewsContainer) {
      const card = document.createElement("div");
      card.className = "review-card";
      card.innerHTML = `
        <div>
          <div class="review-stars">${"★".repeat(currentRating)}</div>
          <p class="review-text">“${reviewerComments}”</p>
        </div>
        <div class="review-author">
          <div class="author-avatar">${reviewerName.charAt(0).toUpperCase()}</div>
          <div class="author-info">
            <h5>${reviewerName}</h5>
            <small>${reviewerTreatment} • Verified</small>
          </div>
        </div>
      `;
      reviewsContainer.prepend(card);
    }

    alert("Thank you! Your review has been submitted. If you have a Google account, please also share it on Google Maps to help others in need!");
    if (reviewModal) reviewModal.classList.remove("show");
  });
}

// Load saved on-site reviews on page load
function loadSavedReviews() {
  const reviews = JSON.parse(localStorage.getItem("clinicPatientReviews") || "[]");
  if (reviewsContainer && reviews.length > 0) {
    reviews.forEach(r => {
      const card = document.createElement("div");
      card.className = "review-card";
      card.innerHTML = `
        <div>
          <div class="review-stars">${"★".repeat(r.rating || 5)}</div>
          <p class="review-text">“${r.comment}”</p>
        </div>
        <div class="review-author">
          <div class="author-avatar">${(r.name || "P").charAt(0).toUpperCase()}</div>
          <div class="author-info">
            <h5>${r.name}</h5>
            <small>${r.treatment || "Patient"} • Verified</small>
          </div>
        </div>
      `;
      reviewsContainer.prepend(card);
    });
  }
}

// ================= 5. MOBILE NAVIGATION TOGGLE =================
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

// ================= 6. AWARDS LIGHTBOX PREVIEW MODAL =================
const awardPreviewModal = document.getElementById("awardPreviewModal");
const awardModalImg = document.getElementById("awardModalImg");
const awardModalCaption = document.getElementById("awardModalCaption");
const closeAwardPreviewModal = document.getElementById("closeAwardPreviewModal");

function bindAwardFigures() {
  document.querySelectorAll(".awards-grid figure").forEach(figure => {
    figure.removeEventListener("click", figure._clickHandler);
    figure._clickHandler = () => {
      const img = figure.querySelector("img");
      const caption = figure.querySelector("figcaption");
      if (img && awardPreviewModal && awardModalImg) {
        awardModalImg.src = img.src;
        awardModalImg.alt = img.alt || "Award Preview";
        if (awardModalCaption) {
          awardModalCaption.textContent = caption ? caption.textContent : "";
        }
        awardPreviewModal.classList.add("show");
        awardPreviewModal.setAttribute("aria-hidden", "false");
      }
    };
    figure.addEventListener("click", figure._clickHandler);
  });
}

bindAwardFigures();

// Dynamic Gallery Loader from Admin Uploads
function loadDynamicGallery() {
  const awardsGrid = document.getElementById("awardsGrid");
  if (!awardsGrid) return;

  // Remove previously rendered uploads so deletions in admin are reflected
  awardsGrid.querySelectorAll(".custom-gallery-figure").forEach(f => f.remove());

  // Photos now come live from Firebase (shared for all visitors)
  let customImages = Array.isArray(window.__galleryPhotos) ? window.__galleryPhotos : [];
  if (!Array.isArray(customImages) || !customImages.length) {
    bindAwardFigures();
    return;
  }

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Prepend uploaded images to awards grid (newest first)
  [...customImages].reverse().forEach(item => {
    if (!item || !item.dataUrl) return;

    const fig = document.createElement("figure");
    fig.id = `custom-gallery-${item.id}`;
    fig.className = "custom-gallery-figure";
    fig.style.position = "relative";
    fig.style.cursor = "pointer";

    fig.innerHTML = `
      <img src="${item.dataUrl}" alt="${esc(item.title || 'Clinic Gallery')}" loading="lazy">
      <figcaption>
        <span class="badge bg-primary text-white me-1" style="font-size:10px;vertical-align:middle">${esc(item.category || 'Clinical Photo')}</span>
        ${esc(item.title || 'MANI Physio Gallery')}
      </figcaption>
    `;
    awardsGrid.prepend(fig);
  });

  bindAwardFigures();
}

if (closeAwardPreviewModal && awardPreviewModal) {
  closeAwardPreviewModal.addEventListener("click", () => {
    awardPreviewModal.classList.remove("show");
    awardPreviewModal.setAttribute("aria-hidden", "true");
  });
}

if (awardPreviewModal) {
  awardPreviewModal.addEventListener("click", (e) => {
    if (e.target === awardPreviewModal) {
      awardPreviewModal.classList.remove("show");
      awardPreviewModal.setAttribute("aria-hidden", "true");
    }
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  setupReviewEngine();
  loadSavedReviews();
  loadDynamicGallery();

  // Subscribe to Firebase gallery: updates live for every visitor when admin uploads/deletes
  const startGallerySync = () => {
    window.galleryStore.subscribe(photos => {
      // Firestore returns newest-first, same as the loader expects
      window.__galleryPhotos = photos;
      loadDynamicGallery();
    });
  };
  if (window.galleryStore) startGallerySync();
  else window.addEventListener("galleryStoreReady", startGallerySync, { once: true });

  // Keep manual text date input empty so placeholder 'DD/MM/YYYY (e.g. 25/10/2026)' is visible for typing
  const dateInput = document.getElementById("date");
  if (dateInput && dateInput.type === "date") {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
    if (!dateInput.value) {
      dateInput.value = today;
    }
  }
});

