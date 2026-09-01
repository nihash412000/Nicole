const defaultState = {
  adminAuth: {
    email: "whiteandbrightlaundry786@gmail.com",
    password: "admin123"
  },
  contact: { 
    phone: "7418150911", 
    email: "whiteandbrightlaundry786@gmail.com",
    wallpaperUrl: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1400&q=80",
    smsApiKey: ""
  },
  schedule: [
    { day: "Mon - Sat", hours: "9:00 AM - 8:00 PM" },
    { day: "Sunday", hours: "9:00 AM - 2:00 PM" }
  ],
  fabrics: ["Cotton", "Silk", "Wool", "Linen", "Heavy Bed Sheet", "Light Bed Sheet"],
  services: ["Wash & Fold", "Ironing", "Wash & Ironing", "Dry Cleaning"],
  currentOrder: [],
  pendingOrders: [],
  reviews: [
    { id: "REV-1", author: "Kavitha R. (Thillai Nagar)", rating: 5, comment: "Prompt pickup and the ironing quality is exceptionally crisp. Highly recommend White & Bright in Trichy!", date: "2026-08-10", approved: true },
    { id: "REV-2", author: "Suresh Kumar (Cantonment)", rating: 5, comment: "Very polite staff and received SMS updates right on time for pickup.", date: "2026-08-14", approved: true }
  ],
  isAdminLoggedIn: false
};

let selectedRatingValue = 5;
let state = JSON.parse(localStorage.getItem('whiteBrightState')) || defaultState;

if (!state.fabrics.includes("Heavy Bed Sheet")) {
  state.fabrics.push("Heavy Bed Sheet");
}
if (!state.fabrics.includes("Light Bed Sheet")) {
  state.fabrics.push("Light Bed Sheet");
}

function persistState() {
  localStorage.setItem('whiteBrightState', JSON.stringify(state));
}

document.addEventListener("DOMContentLoaded", () => {
  renderContactInfo();
  renderWallpaper();
  renderSchedule();
  populateDropdowns();
  selectStar(5);
  renderPublishedReviews();
  if(state.isAdminLoggedIn) {
    showAdminPanel();
  }
});

function togglePasswordVisibility(inputId, btnId) {
  const passInput = document.getElementById(inputId);
  const toggleBtn = document.getElementById(btnId);
  if (passInput.type === "password") {
    passInput.type = "text";
    toggleBtn.innerText = "🙈";
  } else {
    passInput.type = "password";
    toggleBtn.innerText = "👁️";
  }
}

function handleAdminAuth() {
  if (state.isAdminLoggedIn) {
    showAdminPanel();
  } else {
    document.getElementById("loginModal").style.display = "flex";
  }
}

function closeLoginModal() {
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("loginError").style.display = "none";
}

function verifyAdminLogin() {
  const emailInput = document.getElementById("loginEmail").value.trim();
  const passInput = document.getElementById("loginPassword").value;

  if (emailInput === state.adminAuth.email && passInput === state.adminAuth.password) {
    state.isAdminLoggedIn = true;
    persistState();
    closeLoginModal();
    showAdminPanel();
  } else {
    document.getElementById("loginError").style.display = "block";
  }
}

function showAdminPanel() {
  document.getElementById("adminPanel").style.display = "block";
  document.getElementById("adminNavBtn").innerText = "⚙️ Admin Dashboard";
  renderAdminOrdersTable();
  renderAdminReviewsTable();
  populateAdminFields();
  document.getElementById("adminPanelContainer").scrollIntoView({ behavior: 'smooth' });
}

function logoutAdmin() {
  state.isAdminLoggedIn = false;
  persistState();
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("adminNavBtn").innerText = "Owner Admin Login";
  alert("Admin logged out.");
}

function changeAdminPassword() {
  const newPass = document.getElementById("newAdminPassword").value;
  if (!newPass || newPass.length < 4) {
    alert("Please enter a valid password (at least 4 characters).");
    return;
  }
  state.adminAuth.password = newPass;
  persistState();
  document.getElementById("newAdminPassword").value = "";
  alert("✅ Admin Password updated successfully!");
}

function selectStar(rating) {
  selectedRatingValue = rating;
  const stars = document.querySelectorAll("#starPicker .star");
  stars.forEach((star, idx) => {
    if (idx < rating) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

function submitCustomerReview() {
  const author = document.getElementById("reviewAuthor").value.trim();
  const comment = document.getElementById("reviewComment").value.trim();

  if (!author || !comment) {
    alert("Please provide your name and feedback comment.");
    return;
  }

  const newReview = {
    id: "REV-" + Math.floor(1000 + Math.random() * 9000),
    author,
    rating: selectedRatingValue,
    comment,
    date: new Date().toISOString().split('T')[0],
    approved: false
  };

  state.reviews.push(newReview);
  persistState();

  document.getElementById("reviewAuthor").value = "";
  document.getElementById("reviewComment").value = "";
  selectStar(5);

  alert("Thank you for your feedback! Your review has been submitted for admin approval.");
  renderAdminReviewsTable();
}

function renderPublishedReviews() {
  const container = document.getElementById("publishedReviewsGrid");
  const approvedList = state.reviews.filter(r => r.approved);

  if (approvedList.length === 0) {
    container.innerHTML = `<p style="color:var(--slate-muted); text-align:center; grid-column:1/-1;">No reviews published yet. Be the first to leave a review!</p>`;
    return;
  }

  container.innerHTML = approvedList.map(r => `
    <div class="review-card">
      <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
      <div>
        <span class="review-author">${r.author}</span>
        <span class="review-date">${r.date}</span>
      </div>
      <p class="review-comment">"${r.comment}"</p>
    </div>
  `).join('');
}

function renderAdminReviewsTable() {
  const tbody = document.getElementById("adminReviewsTable");
  if (!state.reviews || state.reviews.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:var(--slate-muted);">No customer reviews submitted.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.reviews.map(r => `
    <tr>
      <td><strong>${r.author}</strong></td>
      <td style="color:var(--star-amber);">${'★'.repeat(r.rating)}</td>
      <td>${r.comment}</td>
      <td><small>${r.date}</small></td>
      <td><span class="status-badge ${r.approved ? 'status-approved' : 'status-pending'}">${r.approved ? 'Published' : 'Pending Approval'}</span></td>
      <td>
        ${!r.approved ? `<button class="btn btn-success btn-sm" onclick="toggleReviewApproval('${r.id}', true)">Approve & Publish</button>` : `<button class="btn btn-secondary btn-sm" onclick="toggleReviewApproval('${r.id}', false)">Unpublish</button>`}
        <button class="btn btn-danger btn-sm" style="margin-top:4px;" onclick="deleteReview('${r.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function toggleReviewApproval(reviewId, approveStatus) {
  const rev = state.reviews.find(r => r.id === reviewId);
  if (rev) {
    rev.approved = approveStatus;
    persistState();
    renderAdminReviewsTable();
    renderPublishedReviews();
  }
}

function deleteReview(reviewId) {
  if (confirm("Are you sure you want to delete this review?")) {
    state.reviews = state.reviews.filter(r => r.id !== reviewId);
    persistState();
    renderAdminReviewsTable();
    renderPublishedReviews();
  }
}

async function sendMobileSMS(customerPhone, customerName, orderId, pickupTime) {
  const formattedTime = pickupTime.replace("T", " ");
  const smsMessage = `Hello ${customerName}, your laundry pickup for Order ${orderId} is scheduled for ${formattedTime}. Thank you, White & Bright Laundry Trichy!`;

  if (state.contact.smsApiKey) {
    try {
      await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": state.contact.smsApiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "route": "q",
          "message": smsMessage,
          "language": "english",
          "numbers": customerPhone
        })
      });
      console.log("SMS Gateway triggered successfully.");
    } catch (err) {
      console.error("SMS API Error:", err);
    }
  }
}

function sendAdminEmailIntimation(order) {
  const adminEmail = state.contact.email || "whiteandbrightlaundry786@gmail.com";
  const subject = encodeURIComponent(`New Laundry Order Alert: ${order.id}`);
  const itemsFormatted = order.items.map(i => `- ${i.quantity}x ${i.fabric} (${i.service})`).join('\n');
  const body = encodeURIComponent(
    `Hello Admin,\n\nA new laundry order request has been placed on the website.\n\n` +
    `Order ID: ${order.id}\n` +
    `Customer Name: ${order.name}\n` +
    `Phone Number: ${order.phone}\n` +
    `Address: ${order.address}\n` +
    `Location: ${order.location}\n\n` +
    `Items:\n${itemsFormatted}\n\n` +
    `Please log in to your dashboard to schedule the pickup time.`
  );
  
  window.open(`mailto:${adminEmail}?subject=${subject}&body=${body}`, '_blank');
}

function sendDirectMessage(customerPhone, customerName, orderId, pickupTime) {
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
  const text = encodeURIComponent(`Hello ${customerName}, your White & Bright Laundry pickup for Order ${orderId} is confirmed for ${pickupTime.replace("T", " ")}.`);
  
  window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
}

function sendReviewRequestMessage(customerPhone, customerName) {
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
  const text = encodeURIComponent(`Hello ${customerName}, thank you for choosing White & Bright Laundry! Please take a moment to leave us a review on our website: ${window.location.href}#writeReviewCard`);
  
  window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
}

function submitOrderForApproval() {
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const email = document.getElementById("custEmail").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const location = document.getElementById("custLocation").value.trim();

  if (!name || !phone || !address || !location) {
    alert("Please fill in all mandatory fields: Name, Phone Number, Address, and Tiruchirappalli Location details.");
    return;
  }

  const fullLocationText = (address + " " + location).toLowerCase();
  const validKeywords = ["tiruchirappalli", "trichy", "thillai nagar", "srirangam", "cantonment", "kk nagar", "woraiyur", "tennur", "ponmalai", "palakkarai", "bheema nagar", "kattur", "tvk kovil", "thiruverumbur"];
  
  const isValidLocation = validKeywords.some(keyword => fullLocationText.includes(keyword));

  if (!isValidLocation) {
    const confirmTrichy = confirm("📍 Notice: Doorstep pickup and delivery service is strictly allowed for Tiruchirappalli (Trichy) city only. If your address is in Tiruchirappalli, please click OK to proceed. Otherwise, click Cancel.");
    if (!confirmTrichy) return;
  }

  if (state.currentOrder.length === 0) {
    alert("Please add at least one item to your order.");
    return;
  }

  const orderRecord = {
    id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
    name, 
    phone, 
    email: email || "N/A", 
    address, 
    location: location.toLowerCase().includes("trichy") || location.toLowerCase().includes("tiruchirappalli") ? location : `${location}, Tiruchirappalli`,
    items: [...state.currentOrder],
    assignedPickupTime: "",
    status: "Pending Pickup Decision"
  };

  state.pendingOrders.push(orderRecord);
  state.currentOrder = [];
  persistState();
  renderOrderSummary();
  renderAdminOrdersTable();

  sendAdminEmailIntimation(orderRecord);

  alert(`Order ${orderRecord.id} submitted! An email notification has been generated for the Admin, who will set your pickup time.`);
}

async function updateOrderStatus(orderId, newStatus) {
  const ord = state.pendingOrders.find(o => o.id === orderId);
  if (!ord) return;

  if (newStatus === 'Approved') {
    const timeInput = document.getElementById(`pickupInput_${orderId}`).value;
    if (!timeInput) {
      alert("Please specify/decide the pickup time for the customer before accepting!");
      return;
    }
    ord.assignedPickupTime = timeInput;
    ord.status = "Approved & Time Assigned";

    await sendMobileSMS(ord.phone, ord.name, ord.id, timeInput);
    alert(`✅ Order ${orderId} accepted! Assigned pickup time (${timeInput.replace("T", " ")}) confirmed for ${ord.name}. Notification queued.`);
  } else {
    ord.status = "Rejected";
    alert(`Order ${orderId} rejected.`);
  }

  persistState();
  renderAdminOrdersTable();
}

function renderAdminOrdersTable() {
  const tbody = document.getElementById("adminOrdersTable");
  if (!tbody) return;

  if (!state.pendingOrders || state.pendingOrders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:var(--slate-muted);">No orders to display.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.pendingOrders.map(o => {
    let statusClass = o.status.includes("Approved") ? "status-approved" : o.status === "Rejected" ? "status-rejected" : "status-pending";
    let itemListHtml = o.items.map(i => `${i.quantity}x ${i.fabric} (${i.service})`).join('<br>');
    return `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td><strong>${o.name}</strong><br>📞 ${o.phone}<br><small style="color:var(--slate-muted);">✉️ ${o.email}</small></td>
        <td>${o.address}<br><small style="color:var(--accent-aqua);">📍 ${o.location}</small></td>
        <td><small>${itemListHtml}</small></td>
        <td>
          <input type="datetime-local" id="pickupInput_${o.id}" class="form-control" style="font-size:0.8rem; padding:4px;" value="${o.assignedPickupTime || ''}">
        </td>
        <td><span class="status-badge ${statusClass}">${o.status}</span></td>
        <td>
          <button class="btn btn-success btn-sm" onclick="updateOrderStatus('${o.id}', 'Approved')">Assign & Accept</button>
          ${o.assignedPickupTime ? `<button class="btn btn-whatsapp btn-sm" style="margin-top:4px;" onclick="sendDirectMessage('${o.phone}', '${o.name}', '${o.id}', '${o.assignedPickupTime}')">📱 Send SMS / WhatsApp</button>` : ''}
          <button class="btn btn-secondary btn-sm" style="margin-top:4px;" onclick="sendReviewRequestMessage('${o.phone}', '${o.name}')">⭐ Request Review</button>
          <button class="btn btn-danger btn-sm" style="margin-top:4px;" onclick="updateOrderStatus('${o.id}', 'Rejected')">Reject</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderContactInfo() {
  document.getElementById("displayPhone").innerText = state.contact.phone;
  document.getElementById("displayEmail").innerText = state.contact.email;
}

function renderWallpaper() {
  document.getElementById("heroBanner").style.backgroundImage = `url('${state.contact.wallpaperUrl}')`;
}

function renderSchedule() {
  document.getElementById("scheduleDisplay").innerHTML = state.schedule.map(s => 
    `<li style="display:flex; justify-content:space-between; margin-bottom:0.5rem;"><span style="color:var(--slate-muted);">${s.day}</span><strong>${s.hours}</strong></li>`
  ).join('');
}

function populateDropdowns() {
  document.getElementById("fabricSelect").innerHTML = state.fabrics.map(f => `<option value="${f}">${f}</option>`).join('');
  document.getElementById("serviceSelect").innerHTML = state.services.map(s => `<option value="${s}">${s}</option>`).join('');
}

function addItemToOrder() {
  const fabric = document.getElementById("fabricSelect").value;
  const service = document.getElementById("serviceSelect").value;
  const quantity = parseInt(document.getElementById("itemQuantity").value) || 1;
  state.currentOrder.push({ fabric, service, quantity });
  renderOrderSummary();
}

function renderOrderSummary() {
  const container = document.getElementById("orderItemsList");
  if (state.currentOrder.length === 0) {
    container.innerHTML = `<p style="color: var(--slate-muted); font-size: 0.9rem;">No items added yet.</p>`;
    return;
  }

  container.innerHTML = state.currentOrder.map((item, index) => `
    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.9rem;">
      <div><strong>${item.quantity}x ${item.fabric}</strong> (${item.service})</div>
      <div><span style="color:red; cursor:pointer; margin-left:8px;" onclick="removeItem(${index})">&times;</span></div>
    </div>
  `).join('');
}

function removeItem(index) {
  state.currentOrder.splice(index, 1);
  renderOrderSummary();
}

function populateAdminFields() {
  document.getElementById("adminPhone").value = state.contact.phone;
  document.getElementById("adminEmail").value = state.contact.email;
  document.getElementById("adminFabrics").value = state.fabrics.join(", ");
  document.getElementById("smsApiKey").value = state.contact.smsApiKey || "";
  document.getElementById("adminWallpaper").value = state.contact.wallpaperUrl;
}

function saveContactSettings() {
  state.contact.phone = document.getElementById("adminPhone").value.trim();
  state.contact.email = document.getElementById("adminEmail").value.trim();
  state.contact.smsApiKey = document.getElementById("smsApiKey").value.trim();
  state.contact.wallpaperUrl = document.getElementById("adminWallpaper").value.trim();
  
  const fabricsInput = document.getElementById("adminFabrics").value;
  if (fabricsInput) {
    state.fabrics = fabricsInput.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }
  
  persistState();
  renderContactInfo();
  renderWallpaper();
  populateDropdowns();
  alert("✅ Business details, fabric list, and SMS settings updated successfully!");
}