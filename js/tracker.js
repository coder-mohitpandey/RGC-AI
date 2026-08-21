/**
 * RGC AI Assistant - Live Complaint Tracking Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('tracker-search-form');
  const searchInput = document.getElementById('tracker-input');
  const resultsContainer = document.getElementById('tracker-results');

  if (!searchForm || !searchInput || !resultsContainer) return;

  // Preload default demo complaint if none in storage
  seedDefaultComplaints();

  // Check URL params for auto-search
  const urlParams = new URLSearchParams(window.location.search);
  const refQuery = urlParams.get('id') || urlParams.get('pnr');
  if (refQuery) {
    searchInput.value = refQuery;
    performSearch(refQuery);
  } else {
    // Show latest complaint by default if available
    const stored = JSON.parse(localStorage.getItem('rgc_complaints') || '[]');
    if (stored.length > 0) {
      renderComplaintDetails(stored[0]);
    }
  }

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      performSearch(query);
    }
  });

  function performSearch(query) {
    const stored = JSON.parse(localStorage.getItem('rgc_complaints') || '[]');
    const match = stored.find(c => 
      c.refId.toLowerCase() === query.toLowerCase() || 
      c.pnr.toLowerCase() === query.toLowerCase()
    );

    if (match) {
      renderComplaintDetails(match);
    } else {
      resultsContainer.innerHTML = `
        <div style="background: #ffffff; padding: 24px; border-radius: 20px; text-align: center; color: #64748b;">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🔍</div>
          <h3 style="color: #1e293b; font-size: 1.1rem; margin-bottom: 6px;">No Complaint Found</h3>
          <p style="font-size: 0.9rem;">We couldn't find any active complaint matching <strong>"${query}"</strong>.</p>
          <p style="font-size: 0.85rem; margin-top: 8px; color: #94a3b8;">Try entering PNR: <strong>1234567890</strong> or Ref ID: <strong>RGC-2026-89412</strong></p>
        </div>
      `;
    }
  }

  function renderComplaintDetails(item) {
    resultsContainer.innerHTML = `
      <div class="tracker-search-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <div>
            <span style="background: #dbeafe; color: #1e3a8a; padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 700;">ACTIVE GRIEVANCE</span>
            <h2 style="font-size: 1.3rem; color: #1e293b; margin-top: 6px;">${item.refId}</h2>
            <p style="font-size: 0.85rem; color: #64748b;">Registered on ${item.date} at ${item.time}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.8rem; color: #64748b;">PNR Number</div>
            <div style="font-size: 1.05rem; font-weight: 700; color: #2563eb;">${item.pnr}</div>
          </div>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; font-size: 0.9rem;">
          <div style="display: flex; gap: 16px; margin-bottom: 6px;">
            <span style="color: #64748b; font-weight: 500;">Category:</span>
            <span style="color: #1e293b; font-weight: 600;">${item.category}</span>
          </div>
          <div style="display: flex; gap: 16px;">
            <span style="color: #64748b; font-weight: 500;">Assigned Unit:</span>
            <span style="color: #1e293b; font-weight: 600;">${item.assignedTo}</span>
          </div>
        </div>

        <h3 style="font-size: 1rem; color: #1e293b; margin-bottom: 12px;">Live Status Timeline</h3>

        <div class="status-timeline">
          <div class="timeline-step completed">
            <div class="step-icon">✓</div>
            <div class="step-content">
              <div class="step-title">Grievance Registered</div>
              <div class="step-desc">Complaint captured via RGC AI Assistant and validated against railway passenger database.</div>
              <div class="step-time">${item.date} ${item.time}</div>
            </div>
          </div>

          <div class="timeline-step completed">
            <div class="step-icon">✓</div>
            <div class="step-content">
              <div class="step-title">Assigned to Onboard Supervisor</div>
              <div class="step-desc">Alert dispatched to Division Control Room and On-Board Housekeeping Staff (OBHS).</div>
              <div class="step-time">Actioned 5 mins later</div>
            </div>
          </div>

          <div class="timeline-step active">
            <div class="step-icon">⚡</div>
            <div class="step-content">
              <div class="step-title">Action In Progress</div>
              <div class="step-desc">Railway staff is currently attending to the issue at coach B4. Expected resolution within 20 mins.</div>
              <div class="step-time">Live Status</div>
            </div>
          </div>

          <div class="timeline-step">
            <div class="step-icon">4</div>
            <div class="step-content">
              <div class="step-title">Resolution & Passenger Feedback</div>
              <div class="step-desc">Verification SMS & feedback code will be sent upon completion.</div>
              <div class="step-time">Pending</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function seedDefaultComplaints() {
    let existing = JSON.parse(localStorage.getItem('rgc_complaints') || '[]');
    if (existing.length === 0) {
      existing = [
        {
          refId: 'RGC-2026-89412',
          pnr: '1234567890',
          mobile: '9876543210',
          category: 'Cleanliness & OBHS',
          description: 'Coach B4 washroom needs cleaning',
          date: '21 Aug 2026',
          time: '10:31 AM',
          status: 'Action In Progress',
          assignedTo: 'OBHS Team (Western Railway)'
        }
      ];
      localStorage.setItem('rgc_complaints', JSON.stringify(existing));
    }
  }
});
