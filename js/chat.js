/**
 * RGC AI Assistant - 8-Step Guided Railway Grievance Registration Engine
 * Completely automated interactive flow without bottom text input bar.
 */

document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.getElementById('chat-container');
  if (!chatContainer) return;

  // Flow State Storage
  let registrationData = {
    pnr: '1234567890',
    passengerName: 'Mohit Sharma',
    trainNo: '12932',
    trainName: 'Ahmedabad Express',
    coach: 'B2',
    seat: '34',
    boarding: 'Vadodara',
    destination: 'Udaipur',
    journeyDate: '25-Aug-2026',
    email: '',
    mobile: '',
    otp: '',
    description: '',
    imageSrc: null,
    token: ''
  };

  // Start Step 1 automatically
  renderStep1();

  // =========================================================================
  // STEP 1: INITIALIZING CHAT
  // =========================================================================
  function renderStep1() {
    renderBotBubble(
      "Welcome to RGC AI, your smart railway grievance assistant. I can help you register and track railway complaints quickly.",
      "10:30 AM",
      `
        <button class="flow-btn" id="btn-step1-start">
          <span>📝</span> I Want to Register a Complaint
        </button>
      `
    );

    document.getElementById('btn-step1-start')?.addEventListener('click', (e) => {
      e.target.disabled = true;
      renderUserBubble("I Want to Register a Complaint", getCurrentTime());
      setTimeout(renderStep2, 600);
    });
  }

  // =========================================================================
  // STEP 2: PNR VERIFICATION
  // =========================================================================
  function renderStep2() {
    const inputCardId = 'pnr-input-card-' + Date.now();
    renderBotBubble(
      "Please enter your 10-digit PNR number to verify your journey details.",
      getCurrentTime(),
      `
        <div class="inline-input-card" id="${inputCardId}">
          <div class="inline-input-group">
            <input type="text" class="inline-field" id="pnr-field" placeholder="Enter 10-digit PNR Number" maxlength="10" value="1234567890">
            <button class="inline-submit-btn" id="pnr-submit-btn">Verify PNR</button>
          </div>
        </div>
      `
    );

    const submitBtn = document.getElementById('pnr-submit-btn');
    const pnrField = document.getElementById('pnr-field');

    submitBtn?.addEventListener('click', () => {
      const pnrVal = pnrField.value.trim();
      if (!pnrVal || pnrVal.length < 10) {
        showToast("Please enter a valid 10-digit PNR number");
        return;
      }
      registrationData.pnr = pnrVal;
      document.getElementById(inputCardId).style.display = 'none';
      renderUserBubble(pnrVal, getCurrentTime());

      // Show Journey Details Card
      setTimeout(() => {
        renderBotBubble("Journey details found.", getCurrentTime());
        
        // PNR Details Card
        const pnrCardHtml = `
          <div class="pnr-details-card">
            <div class="pnr-card-header">
              <div style="font-weight: 700; color: #1e3a8a;">🚆 Journey Verification</div>
              <span class="pnr-tag">PNR: ${registrationData.pnr}</span>
            </div>
            <div class="pnr-grid">
              <div>
                <div class="pnr-item-label">Passenger Name</div>
                <div class="pnr-item-val">${registrationData.passengerName}</div>
              </div>
              <div>
                <div class="pnr-item-label">Train No & Name</div>
                <div class="pnr-item-val">${registrationData.trainNo} - ${registrationData.trainName}</div>
              </div>
              <div>
                <div class="pnr-item-label">Coach & Seat</div>
                <div class="pnr-item-val">Coach ${registrationData.coach} / Seat ${registrationData.seat}</div>
              </div>
              <div>
                <div class="pnr-item-label">Boarding Station</div>
                <div class="pnr-item-val">${registrationData.boarding}</div>
              </div>
              <div>
                <div class="pnr-item-label">Destination</div>
                <div class="pnr-item-val">${registrationData.destination}</div>
              </div>
              <div>
                <div class="pnr-item-label">Journey Date</div>
                <div class="pnr-item-val">${registrationData.journeyDate}</div>
              </div>
            </div>
          </div>
        `;
        
        renderBotBubble(
          "Please confirm that the above details are correct.",
          getCurrentTime(),
          `
            ${pnrCardHtml}
            <button class="flow-btn" id="btn-pnr-confirm">
              <span>✅</span> Continue
            </button>
          `
        );

        document.getElementById('btn-pnr-confirm')?.addEventListener('click', (e) => {
          e.target.disabled = true;
          renderUserBubble("Journey Details Confirmed", getCurrentTime());
          setTimeout(renderStep3, 600);
        });

      }, 600);
    });
  }

  // =========================================================================
  // STEP 3: EMAIL VERIFICATION
  // =========================================================================
  function renderStep3() {
    const inputCardId = 'email-input-card-' + Date.now();
    renderBotBubble(
      "Please enter your email address for complaint updates and notifications.",
      getCurrentTime(),
      `
        <div class="inline-input-card" id="${inputCardId}">
          <div class="inline-input-group">
            <input type="email" class="inline-field" id="email-field" placeholder="Enter Email Address" value="mohit@example.com">
            <button class="inline-submit-btn" id="email-submit-btn">Submit Email</button>
          </div>
        </div>
      `
    );

    const submitBtn = document.getElementById('email-submit-btn');
    const emailField = document.getElementById('email-field');

    submitBtn?.addEventListener('click', () => {
      const emailVal = emailField.value.trim();
      if (!emailVal || !emailVal.includes('@')) {
        showToast("Please enter a valid email address");
        return;
      }
      registrationData.email = emailVal;
      document.getElementById(inputCardId).style.display = 'none';
      renderUserBubble(emailVal, getCurrentTime());

      setTimeout(() => {
        renderBotBubble("Email received successfully.", getCurrentTime());
        setTimeout(renderStep4, 700);
      }, 500);
    });
  }

  // =========================================================================
  // STEP 4: MOBILE NUMBER VERIFICATION
  // =========================================================================
  function renderStep4() {
    const inputCardId = 'mobile-input-card-' + Date.now();
    renderBotBubble(
      "Please enter your registered mobile number.",
      getCurrentTime(),
      `
        <div class="inline-input-card" id="${inputCardId}">
          <div class="inline-input-group">
            <input type="tel" class="inline-field" id="mobile-field" placeholder="Enter 10-digit Mobile Number" maxlength="10" value="9876543210">
            <button class="inline-submit-btn" id="mobile-submit-btn">Send OTP</button>
          </div>
        </div>
      `
    );

    const submitBtn = document.getElementById('mobile-submit-btn');
    const mobileField = document.getElementById('mobile-field');

    submitBtn?.addEventListener('click', () => {
      const mobileVal = mobileField.value.trim();
      if (!mobileVal || mobileVal.length < 10) {
        showToast("Please enter a 10-digit mobile number");
        return;
      }
      registrationData.mobile = mobileVal;
      document.getElementById(inputCardId).style.display = 'none';
      renderUserBubble(mobileVal, getCurrentTime());

      setTimeout(() => {
        renderBotBubble("An OTP has been sent to your mobile number.", getCurrentTime());
        setTimeout(renderStep5, 700);
      }, 500);
    });
  }

  // =========================================================================
  // STEP 5: OTP VERIFICATION
  // =========================================================================
  function renderStep5() {
    const inputCardId = 'otp-input-card-' + Date.now();
    renderBotBubble(
      "Please enter the 4-digit verification OTP sent to your phone.",
      getCurrentTime(),
      `
        <div class="inline-input-card" id="${inputCardId}">
          <div class="inline-input-group">
            <input type="text" class="inline-field" id="otp-field" placeholder="Enter 4-digit OTP" maxlength="4" value="1234">
            <button class="inline-submit-btn" id="otp-submit-btn">Verify OTP</button>
          </div>
        </div>
      `
    );

    const submitBtn = document.getElementById('otp-submit-btn');
    const otpField = document.getElementById('otp-field');

    submitBtn?.addEventListener('click', () => {
      const otpVal = otpField.value.trim();
      if (!otpVal || otpVal.length < 4) {
        showToast("Please enter 4-digit OTP");
        return;
      }
      registrationData.otp = otpVal;
      document.getElementById(inputCardId).style.display = 'none';
      renderUserBubble(otpVal, getCurrentTime());

      setTimeout(() => {
        renderBotBubble("✅ Verification completed successfully.\nPassenger identity has been verified.", getCurrentTime());
        setTimeout(renderStep6, 800);
      }, 500);
    });
  }

  // =========================================================================
  // STEP 6: COMPLAINT REGISTRATION FORM
  // =========================================================================
  function renderStep6() {
    const formCardId = 'complaint-form-card-' + Date.now();
    const fileInputId = 'file-input-' + Date.now();

    renderBotBubble(
      "Please describe your complaint in detail. You may also upload an image as supporting evidence.",
      getCurrentTime(),
      `
        <div class="complaint-form-card" id="${formCardId}">
          <label class="form-label">Complaint Details (Maximum 300 words)</label>
          <textarea class="form-textarea" id="complaint-textarea" placeholder="Describe your issue here... (e.g. Washroom in Coach B2 requires cleaning and water supply issue)"></textarea>
          
          <label class="form-label">Upload Evidence</label>
          <input type="file" id="${fileInputId}" accept="image/jpeg,image/png,image/jpg" style="display:none;">
          <div class="upload-dropzone" id="dropzone-area">
            <div class="upload-icon">📷</div>
            <div class="upload-title" id="upload-status-text">[ Upload Image ]</div>
            <div class="upload-sub">Supported Formats: JPG, JPEG, PNG (Max Size: 5 MB)</div>
          </div>

          <button class="flow-btn" id="btn-submit-complaint" style="width: 100%; justify-content: center;">
            <span>🚀</span> Submit Complaint
          </button>
        </div>
      `
    );

    const fileInput = document.getElementById(fileInputId);
    const dropzone = document.getElementById('dropzone-area');
    const uploadText = document.getElementById('upload-status-text');
    const submitBtn = document.getElementById('btn-submit-complaint');
    const textarea = document.getElementById('complaint-textarea');

    dropzone?.addEventListener('click', () => fileInput.click());

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          registrationData.imageSrc = event.target.result;
          uploadText.textContent = "✅ Image Attached: " + file.name;
          showToast("Photo attached successfully!");
        };
        reader.readAsDataURL(file);
      }
    });

    submitBtn?.addEventListener('click', () => {
      const descText = textarea.value.trim() || "Cleanliness and maintenance grievance reported in Coach B2.";
      registrationData.description = descText;

      document.getElementById(formCardId).style.display = 'none';
      renderUserBubble(descText, getCurrentTime(), registrationData.imageSrc);

      setTimeout(renderStep7, 600);
    });
  }

  // =========================================================================
  // STEP 7: AI PROCESSING ANIMATION
  // =========================================================================
  function renderStep7() {
    const aiCardId = 'ai-card-' + Date.now();
    renderBotBubble(
      "AI engine is processing your request...",
      getCurrentTime(),
      `
        <div class="ai-processing-card" id="${aiCardId}">
          <div class="ai-step-list">
            <div class="ai-step-item active" id="ai-s1">
              <div class="ai-step-spinner"></div>
              <span>Analyzing complaint text & severity...</span>
            </div>
            <div class="ai-step-item" id="ai-s2">
              <div class="ai-step-spinner" style="display:none;"></div>
              <span>Classifying complaint category...</span>
            </div>
            <div class="ai-step-item" id="ai-s3">
              <div class="ai-step-spinner" style="display:none;"></div>
              <span>Assigning appropriate division department...</span>
            </div>
            <div class="ai-step-item" id="ai-s4">
              <div class="ai-step-spinner" style="display:none;"></div>
              <span>Generating complaint reference token...</span>
            </div>
          </div>
        </div>
      `
    );

    // Simulate step progression
    setTimeout(() => {
      setAiStepDone('ai-s1', '✅ Complaint text analyzed');
      setAiStepActive('ai-s2');
    }, 700);

    setTimeout(() => {
      setAiStepDone('ai-s2', '✅ Category: On-Board Housekeeping & Hygiene');
      setAiStepActive('ai-s3');
    }, 1400);

    setTimeout(() => {
      setAiStepDone('ai-s3', '✅ Assigned: Western Railway Control Room');
      setAiStepActive('ai-s4');
    }, 2100);

    setTimeout(() => {
      setAiStepDone('ai-s4', '✅ Reference Token Generated!');
      setTimeout(renderStep8, 700);
    }, 2800);
  }

  function setAiStepDone(id, text) {
    const el = document.getElementById(id);
    if (el) {
      el.className = 'ai-step-item done';
      el.innerHTML = `<span>${text}</span>`;
    }
  }

  function setAiStepActive(id) {
    const el = document.getElementById(id);
    if (el) {
      el.className = 'ai-step-item active';
      const spinner = el.querySelector('.ai-step-spinner');
      if (spinner) spinner.style.display = 'block';
    }
  }

  // =========================================================================
  // STEP 8: COMPLAINT REGISTERED SUCCESSFULLY
  // =========================================================================
  function renderStep8() {
    const tokenNum = 'RGC-2026-' + Math.floor(10000 + Math.random() * 90000);
    registrationData.token = tokenNum;
    const timeStr = getCurrentTime();

    // Save record to LocalStorage for track.html
    const record = {
      refId: tokenNum,
      pnr: registrationData.pnr,
      mobile: registrationData.mobile,
      email: registrationData.email,
      passengerName: registrationData.passengerName,
      category: 'Cleanliness & Coach Hygiene',
      description: registrationData.description,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: timeStr,
      status: 'Action In Progress',
      assignedTo: 'Coach B2 OBHS Supervisor'
    };

    saveRecordToStorage(record);

    renderBotBubble(
      "Your complaint has been forwarded to the concerned department.\nPlease save the complaint token for future reference and status tracking.",
      timeStr,
      `
        <div class="token-card">
          <div class="token-icon">✅</div>
          <div class="token-title">Complaint Registered Successfully</div>
          
          <div class="token-number-box">
            <div style="font-size: 0.76rem; color: #047857; text-transform: uppercase; font-weight: 700;">Token Number</div>
            <div class="token-val">${tokenNum}</div>
          </div>
          
          <div style="font-size: 0.84rem; color: #065f46; margin-bottom: 12px;">
            Registration Time: <strong>${timeStr}</strong>
          </div>

          <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
            <a href="track.html?id=${tokenNum}" class="flow-btn" style="text-decoration: none;">
              <span>📢</span> Track Status
            </a>
            <button class="flow-btn" id="btn-register-another" style="background: linear-gradient(135deg, #10b981, #059669);">
              <span>🔄</span> Register Another Complaint
            </button>
          </div>
        </div>
      `
    );

    document.getElementById('btn-register-another')?.addEventListener('click', () => {
      chatContainer.innerHTML = '';
      renderStep1();
    });
  }

  // Helper Functions
  function renderBotBubble(text, timeStr, customHtml = '') {
    const row = document.createElement('div');
    row.className = 'message-row bot';

    const formattedText = text.replace(/\n/g, '<br>');

    row.innerHTML = `
      <div class="bot-avatar">
        <svg viewBox="0 0 24 24">
          <path d="M12 2a2 2 0 0 1 2 2v1h1a3 3 0 0 1 3 3v3h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1v2a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1V8a3 3 0 0 1 3-3h1V4a2 2 0 0 1 2-2zm-3 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
        </svg>
      </div>
      <div class="message-content">
        <div class="message-bubble">
          ${formattedText}
          ${customHtml}
        </div>
        <div class="message-meta">${timeStr}</div>
      </div>
    `;

    chatContainer.appendChild(row);
    scrollToBottom();
  }

  function renderUserBubble(text, timeStr, imageSrc = null) {
    const row = document.createElement('div');
    row.className = 'message-row user';

    let imgHtml = '';
    if (imageSrc) {
      imgHtml = `<div class="attachment-preview"><img src="${imageSrc}" alt="Attached evidence" /></div>`;
    }

    row.innerHTML = `
      <div class="message-content">
        <div class="message-bubble">
          ${text}
          ${imgHtml}
        </div>
        <div class="message-meta">${timeStr} <span class="read-receipt">✓✓</span></div>
      </div>
    `;

    chatContainer.appendChild(row);
    scrollToBottom();
  }

  function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  }

  function saveRecordToStorage(record) {
    let stored = JSON.parse(localStorage.getItem('rgc_complaints') || '[]');
    stored.unshift(record);
    localStorage.setItem('rgc_complaints', JSON.stringify(stored));
  }
});
