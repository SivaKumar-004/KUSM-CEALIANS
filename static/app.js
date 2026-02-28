document.addEventListener('DOMContentLoaded', () => {

    const analyzeBtn = document.getElementById('btn-analyze');
    const displayScore = document.getElementById('display-score');
    const loading = document.getElementById('loading');
    const resultsContainer = document.getElementById('results-container');
    const trackName = document.getElementById('track-name');
    const resiliencePanel = document.getElementById('resilience-panel');
    const displayName = document.getElementById('display-name');

    // Tab Switching Logic
    window.switchTab = (tab) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById('tabbtn-' + tab).classList.add('active');
        document.getElementById('tab-' + tab).classList.add('active');
    };

    // Activity Log Logic
    let logCount = 0;
    window.logActivity = (message) => {
        const list = document.getElementById('activity-log-list');
        const emptyLog = document.getElementById('empty-log');
        if (emptyLog) emptyLog.remove();

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const li = document.createElement('li');
        li.style.cssText = "padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 13px;";
        li.innerHTML = `<span style="color:var(--text-muted); width: 80px; display:inline-block;">[${time}]</span> <span style="font-weight:500;">${message}</span>`;
        list.prepend(li);

        logCount++;
        const badge = document.getElementById('log-badge');
        if (badge) badge.textContent = logCount;
    };

    // Action Overrides injection
    const injectOverrides = () => {
        const footers = document.querySelectorAll('.action-footer');
        footers.forEach(f => {
            if (!f.querySelector('.override-actions')) {
                const div = document.createElement('div');
                div.className = "override-actions";
                div.innerHTML = `
                    <button class="btn-mini defer" onclick="window.overrideAction(this, 'defer')">Defer</button>
                    <button class="btn-mini dismiss" onclick="window.overrideAction(this, 'dismiss')">Dismiss</button>
                `;
                f.appendChild(div);
            }
        });
    };

    window.overrideAction = (btn, type) => {
        const card = btn.closest('.activity-card');
        const title = card.querySelector('h3').textContent;
        // Fade out and remove
        card.style.opacity = '0.5';
        setTimeout(() => { card.style.display = 'none'; }, 200);

        if (type === 'defer') {
            window.logActivity(`User deferred action: ${title}. Rescheduled for next week.`);
            showToast("Action deferred");
        } else {
            window.logActivity(`User dismissed action: ${title}. Removed from profile.`);
            showToast("Action dismissed");
        }
    };

    // Show only 3 cards initially
    function showTrackCards(panelId) {
        const panel = document.getElementById(panelId);
        const cards = panel.querySelectorAll('.activity-card');
        cards.forEach((card, index) => {
            card.style.opacity = '1'; // reset opacity
            if (index < 3) {
                card.classList.remove('deferred-card');
                card.style.display = 'flex';
            } else {
                card.classList.add('deferred-card');
                card.style.display = 'none';
            }
        });
    }

    // Simulate next week
    document.getElementById('btn-simulate-week')?.addEventListener('click', () => {
        const hiddenCards = document.querySelectorAll('.activity-card.deferred-card');
        if (hiddenCards.length === 0) {
            showToast("No more actions scheduled for next week.");
            return;
        }
        hiddenCards.forEach(c => {
            c.classList.remove('deferred-card');
            c.style.display = 'flex';
        });
        window.logActivity("Simulated Week 2: Future actions have now been unlocked.");
        showToast("Week 2 Activated!");
    });

    // Show Toast Notification
    const showToast = (message) => {
        const toast = document.getElementById('toast');
        document.getElementById('toast-msg').textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 4000);
    };

    // Auto Format Currency
    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    // Call API Route
    async function apiCall(endpoint, payload) {
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload || {})
            });
            return await res.json();
        } catch (e) {
            console.error(e);
            showToast("Network Error!");
        }
    }

    // Populate Custom 4-Paths Logic Based on Track
    function populatePaths(track) {
        document.getElementById('paths-container').classList.remove('hidden');

        const pathACard = document.querySelector('.path-a');
        const pathBCard = document.querySelector('.path-b');
        const pathCCard = document.querySelector('.path-c');
        const pathDCard = document.querySelector('.path-d');

        pathACard.classList.add('hidden');
        pathBCard.classList.add('hidden');
        pathCCard.classList.add('hidden');
        pathDCard.classList.add('hidden');

        const pathA = document.getElementById('path-a-text');
        const pathB = document.getElementById('path-b-text');
        const pathC = document.getElementById('path-c-text');
        const pathD = document.getElementById('path-d-text');

        if (track === "Resilience Builder") {
            pathACard.classList.remove('hidden');
            pathA.textContent = "Your score shows outstanding financial health. Keep building wealth!";
        } else if (track === "Stability Anchor") {
            pathBCard.classList.remove('hidden');
            pathB.textContent = "Resource: Debt snowball vs avalanche method guide.";
        } else if (track === "Safety Net") {
            pathCCard.classList.remove('hidden');
            pathC.textContent = "Challenge: Save ₹500 every week for the next month.";
        } else if (track === "Debt Revival") {
            pathDCard.classList.remove('hidden');
            pathD.textContent = "Retry: Speak to our free human counselor when you are ready.";
        }
    }

    analyzeBtn.addEventListener('click', async () => {
        // Collect UI Inputs
        const name = document.getElementById('input-name').value;
        const age = parseInt(document.getElementById('input-age').value);
        const score = parseFloat(document.getElementById('input-score').value);
        const gap = parseInt(document.getElementById('input-gap').value);
        const income = parseInt(document.getElementById('input-income').value);
        const emi = parseInt(document.getElementById('input-emi').value);

        displayName.textContent = name;
        displayScore.textContent = score;

        // UI Reset
        resultsContainer.classList.add('hidden');
        loading.classList.remove('hidden');

        // Trigger Agent API via LangGraph
        const payload = {
            user_id: name.toLowerCase().replace(" ", "_"),
            user_name: name,
            age: age,
            score: score,
            retirement_gap: gap,
            monthly_income: income,
            monthly_emi: emi
        };

        const data = await apiCall('/api/analyze', payload);
        loading.classList.add('hidden');

        if (data && data.agent_response) {
            resultsContainer.classList.remove('hidden');
            trackName.textContent = data.agent_response.selected_track;

            // Populate the new 4-Path customization
            populatePaths(data.agent_response.selected_track);

            const stabilityPanel = document.getElementById('stability-panel');
            const safetyPanel = document.getElementById('safety-panel');
            const debtPanel = document.getElementById('debt-panel');

            // Hide all panels initially
            resiliencePanel.classList.add('hidden');
            stabilityPanel.classList.add('hidden');
            safetyPanel.classList.add('hidden');
            debtPanel.classList.add('hidden');

            if (data.agent_response.selected_track === "Resilience Builder" && data.resilience_activities) {
                resiliencePanel.classList.remove('hidden');
                populateResilienceData(data.resilience_activities);
                showTrackCards('resilience-panel');
                setTimeout(() => window.logActivity("System analyzed expenses in background and generated review."), 600);
            } else if (data.agent_response.selected_track === "Stability Anchor" && data.stability_activities) {
                stabilityPanel.classList.remove('hidden');
                populateStabilityData(data.stability_activities);
                showTrackCards('stability-panel');
                setTimeout(() => window.logActivity("Identified high EMI risk. Plan restructure initiated."), 600);
            } else if (data.agent_response.selected_track === "Safety Net" && data.safety_net_activities) {
                safetyPanel.classList.remove('hidden');
                populateSafetyNetData(data.safety_net_activities);
                showTrackCards('safety-panel');
                setTimeout(() => window.logActivity(data.safety_net_activities.officer_alert.log), 600);
            } else if (data.agent_response.selected_track === "Debt Revival" && data.debt_revival_activities) {
                debtPanel.classList.remove('hidden');
                populateDebtRevivalData(data.debt_revival_activities);
                showTrackCards('debt-panel');
                setTimeout(() => window.logActivity(data.debt_revival_activities.officer_alert_urgent.log), 600);
                setTimeout(() => window.logActivity("Background credit freeze ping sent to bureaus."), 1200);
            }

            // Inject mini override buttons
            injectOverrides();
        }
    });

    // Populate data inside the resilience panels dynamically
    function populateResilienceData(activities) {
        // 1. Govt Scheme
        document.querySelectorAll('.d-name').forEach(e => e.textContent = activities.govt_scheme.form.name);
        document.querySelectorAll('.d-age').forEach(e => e.textContent = activities.govt_scheme.form.age);

        // 2. SIP Gap
        document.getElementById('d-gap').textContent = formatCurrency(activities.sip_setup.retirement_gap);
        document.getElementById('d-sip').textContent = formatCurrency(activities.sip_setup.recommended_sip) + '/mo';

        // 3. Health Cover (generate list)
        const planList = document.getElementById('plan-list-container');
        planList.innerHTML = '';
        activities.health_cover.plans.forEach(plan => {
            planList.innerHTML += `
                <div class="plan-item">
                    <div class="plan-details">
                        <h4>${plan.name}</h4>
                        <small>Cover: ${plan.cover} | ${plan.premium}</small>
                    </div>
                    <button class="btn-action" onclick="window.triggerBuyInsurance()">Buy Now</button>
                </div>
            `;
        });

        // 4. Expense Review (generate rows)
        const expenseList = document.getElementById('expense-list-container');
        expenseList.innerHTML = '';
        activities.expense_review.report.forEach(rep => {
            expenseList.innerHTML += `
                <tr>
                    <td><strong>${rep.category}</strong></td>
                    <td style="color:#6B7280; font-size: 13px;">${rep.observation}</td>
                    <td style="color:#10B981; font-weight:600;">${rep.savings}</td>
                    <td><button class="btn-small" onclick="window.triggerExpenseAction(this)">${rep.action}</button></td>
                </tr>
            `;
        });
    }

    // Attach Event Handlers for Proactive Actions
    document.getElementById('btn-enroll-scheme').addEventListener('click', async (e) => {
        const btn = e.target;
        btn.textContent = "Processing...";
        btn.disabled = true;
        const res = await apiCall('/api/enroll_scheme');
        showToast(res.message);
        btn.textContent = "Actioned ✅";
        btn.style.background = "var(--success)";
    });

    document.getElementById('btn-start-sip').addEventListener('click', async (e) => {
        const btn = e.target;
        btn.textContent = "Calculating...";
        btn.disabled = true;
        const res = await apiCall('/api/start_sip');
        showToast(res.message);
        btn.textContent = "SIP Active ✅";
        btn.style.background = "var(--success)";
    });

    document.getElementById('btn-toggle-tips').addEventListener('change', async (e) => {
        if (e.target.checked) {
            const res = await apiCall('/api/toggle_tips');
            showToast(res.message);
        }
    });

    // Global Handlers for Dynamically generated Content
    window.triggerBuyInsurance = async () => {
        const res = await apiCall('/api/buy_insurance');
        showToast(res.message);
    };

    window.triggerExpenseAction = async (btn) => {
        btn.textContent = "Done";
        btn.style.background = "#D1FAE5";
        btn.style.color = "#065F46";
        const res = await apiCall('/api/expense_action');
        showToast(res.message);
    };

    function populateStabilityData(activities) {
        // 1. EMI Restructure
        const emiMsg = document.getElementById('emi-msg');
        if (activities.emi_restructure.is_high) {
            emiMsg.innerHTML = `Your EMI is <strong>${activities.emi_restructure.ratio_pct}%</strong> of your income (₹${formatCurrency(activities.emi_restructure.current_emi)}). That's above the 40% safe limit.`;
        } else {
            emiMsg.innerHTML = `Your EMI is <strong>${activities.emi_restructure.ratio_pct}%</strong> of your income. This is within safe limits.`;
            document.getElementById('btn-restructure-emi').style.display = 'none';
        }

        // 2. Govt Scheme
        document.getElementById('insurance-msg').textContent = activities.insurance.message;

        // 3. Videos
        const videoList = document.getElementById('video-thumbs-container');
        videoList.innerHTML = '';
        activities.micro_learning.videos.forEach(v => {
            videoList.innerHTML += `
                <div style="flex:1; background:#F3F4F6; border-radius:8px; padding:10px; text-align:center; cursor:pointer;" onclick="showToast('Playing video: ${v.title}')">
                    <i class="fa-solid fa-circle-play" style="font-size:24px; color:var(--primary); margin-bottom:5px;"></i>
                    <div style="font-size:11px; font-weight:600; color:#0B0F19;">${v.title}</div>
                    <div style="font-size:10px; color:#4B5563;">${v.duration}</div>
                </div>
            `;
        });

        // 4. Bills
        const billList = document.getElementById('bill-list-container');
        billList.innerHTML = '';
        activities.bill_reminders.bills.forEach(bill => {
            billList.innerHTML += `
                <div class="plan-item">
                    <div class="plan-details">
                        <h4>${bill.name}</h4>
                        <small>Due: ${bill.due}</small>
                    </div>
                    <strong>${bill.amount}</strong>
                </div>
            `;
        });

        // 5. Challenge
        const tracker = document.getElementById('challenge-tracker');
        tracker.innerHTML = '';
        for (let i = 1; i <= activities.budget_challenge.days; i++) {
            tracker.innerHTML += `
                <div style="flex:1; background:#F9FAFB; border:1px solid var(--border); border-radius:6px; text-align:center; padding:8px 0;">
                    <div style="font-size:10px; color:var(--text-muted);">Day</div>
                    <div style="font-weight:700;">${i}</div>
                </div>
            `;
        }
    }

    // Stability Anchor Handlers
    document.getElementById('btn-restructure-emi')?.addEventListener('click', async (e) => {
        const btn = e.target;
        btn.textContent = "Processing..."; btn.disabled = true;
        const res = await apiCall('/api/restructure_emi');
        showToast(res.message);
        btn.textContent = "Plan Initiated ✅"; btn.style.background = "var(--success)";
    });

    document.getElementById('btn-apply-insurance')?.addEventListener('click', async (e) => {
        const btn = e.target;
        btn.textContent = "Applying..."; btn.disabled = true;
        const res = await apiCall('/api/apply_insurance_urgent');
        showToast(res.message);
        btn.textContent = "Applied ✅"; btn.style.background = "var(--success)";
    });

    document.getElementById('btn-toggle-micro')?.addEventListener('change', async (e) => {
        if (e.target.checked) {
            const res = await apiCall('/api/toggle_micro_learning');
            showToast(res.message);
        }
    });

    document.getElementById('btn-counselor')?.addEventListener('click', async (e) => {
        const res = await apiCall('/api/connect_counselor');
        showToast(res.message);
    });

    document.getElementById('btn-reminders')?.addEventListener('click', async (e) => {
        const btn = e.target;
        const res = await apiCall('/api/setup_bill_reminders');
        showToast(res.message);
        btn.textContent = "Reminders Set ✅"; btn.style.background = "var(--success)";
    });

    document.getElementById('btn-budget')?.addEventListener('click', async (e) => {
        const btn = e.target;
        btn.textContent = "Enrolling..."; btn.disabled = true;
        const res = await apiCall('/api/enroll_budget_challenge');
        showToast(res.message);
        btn.textContent = "Challenge Started ✅"; btn.style.background = "var(--success)";
    });

    // Safety Net Populate Function
    function populateSafetyNetData(activities) {
        document.getElementById('safety-ef-goal').textContent = formatCurrency(activities.emergency_fund.goal);
        document.getElementById('safety-ef-msg').textContent = activities.emergency_fund.message;
        document.getElementById('safety-phone').textContent = activities.helpline.phone;

        document.querySelectorAll('.ws-name').forEach(e => e.textContent = activities.welfare_schemes.prefill_name);

        const welfareList = document.getElementById('welfare-list-container');
        welfareList.innerHTML = '';
        activities.welfare_schemes.schemes.forEach(s => {
            welfareList.innerHTML += `
                <div class="plan-item">
                    <div class="plan-details">
                        <h4>${s.name}</h4>
                        <small style="color:var(--success); font-weight:600;">${s.eligibility}</small>
                    </div>
                </div>
            `;
        });

        const videoList = document.getElementById('safety-video-container');
        videoList.innerHTML = '';
        activities.literacy_push.videos.forEach(v => {
            videoList.innerHTML += `
                <div style="flex:1; background:#F3F4F6; border-radius:8px; padding:10px; text-align:center; cursor:pointer;" onclick="showToast('Playing video: ${v.title}')">
                    <i class="fa-solid fa-circle-play" style="font-size:24px; color:var(--primary); margin-bottom:5px;"></i>
                    <div style="font-size:11px; font-weight:600;">${v.title}</div>
                    <div style="font-size:10px; color:var(--text-muted);">${v.duration}</div>
                </div>
            `;
        });

        const deferralList = document.getElementById('deferral-list-container');
        deferralList.innerHTML = '';
        activities.payment_deferral.bills.forEach(b => {
            deferralList.innerHTML += `
                <tr>
                    <td><strong>${b.name}</strong></td>
                    <td style="color:#DC2626; font-weight:600;">${b.amount}</td>
                    <td><button class="btn-small defer-btn" onclick="window.triggerDefer(this)">Defer</button></td>
                </tr>
            `;
        });
    }

    // Safety Net Handlers
    document.getElementById('btn-start-ef')?.addEventListener('click', async (e) => {
        const btn = e.target;
        btn.textContent = "Starting..."; btn.disabled = true;
        const res = await apiCall('/api/start_emergency_fund');
        showToast(res.message);
        btn.textContent = "Auto-save active ✅"; btn.style.background = "var(--success)";
    });

    document.getElementById('btn-call-helpline')?.addEventListener('click', async (e) => {
        const res = await apiCall('/api/call_debt_helpline');
        showToast(res.message);
    });

    document.getElementById('btn-apply-welfare')?.addEventListener('click', async (e) => {
        const btn = e.target;
        btn.textContent = "Submitting..."; btn.disabled = true;
        const res = await apiCall('/api/apply_welfare_scheme');
        showToast(res.message);
        btn.textContent = "Submitted ✅"; btn.style.background = "var(--success)";
    });

    window.triggerDefer = async (btn) => {
        btn.textContent = "Deferred";
        btn.style.background = "#F3E8FF";
        btn.style.color = "#7E22CE";
        const res = await apiCall('/api/defer_payment');
        showToast(res.message);
    };

    // Debt Revival Populate Function
    function populateDebtRevivalData(activities) {
        document.getElementById('dr-ots-debt').textContent = formatCurrency(activities.ots_application.known_debt);
        document.getElementById('dr-ots-offer').textContent = formatCurrency(activities.ots_application.offer_amount);

        const dmcSteps = document.getElementById('dmc-steps');
        dmcSteps.innerHTML = activities.debt_management.step_by_step.join("<br/>");

        document.querySelectorAll('.dr-r-name').forEach(e => e.textContent = activities.emergency_ration.prefill_name);

        document.getElementById('dr-cs-current').textContent = formatCurrency(activities.consolidation_sim.current_emis);
        document.getElementById('dr-cs-new').textContent = formatCurrency(activities.consolidation_sim.projected_consolidated_emi);

        document.getElementById('dr-quote').textContent = activities.motivation.quote;
        document.getElementById('dr-tip').textContent = activities.motivation.tip;
    }

    // Debt Revival Handlers
    document.getElementById('btn-apply-ots')?.addEventListener('click', async (e) => {
        const btn = e.target;
        btn.textContent = "Submitting..."; btn.disabled = true;
        const res = await apiCall('/api/apply_ots');
        showToast(res.message);
        btn.textContent = "Offer Sent ✅"; btn.style.background = "var(--success)";
    });

    document.getElementById('btn-start-dmc')?.addEventListener('click', async (e) => {
        const btn = e.target;
        const res = await apiCall('/api/start_debt_counseling');
        showToast(res.message);
        btn.textContent = "Connecting ✅"; btn.style.background = "var(--success)";
    });

    document.getElementById('btn-apply-ration')?.addEventListener('click', async (e) => {
        const btn = e.target;
        btn.textContent = "Processing..."; btn.disabled = true;
        const res = await apiCall('/api/apply_emergency_ration');
        showToast(res.message);
        btn.textContent = "Sent Urgent Request ✅"; btn.style.background = "var(--success)";
    });

    document.getElementById('btn-consolidate')?.addEventListener('click', async (e) => {
        const btn = e.target;
        btn.textContent = "Drafting..."; btn.disabled = true;
        const res = await apiCall('/api/consolidate_debt');
        showToast(res.message);
        btn.textContent = "Proposal Sent ✅"; btn.style.background = "var(--success)";
    });

    // Review Modal Logic
    const btnOpenReview = document.getElementById('btn-open-review');
    const btnCloseReview = document.getElementById('btn-close-review');
    const reviewModal = document.getElementById('review-modal');
    const starBtns = document.querySelectorAll('.star-btn');
    let currentRating = 0;

    btnOpenReview.addEventListener('click', () => {
        reviewModal.classList.remove('hidden');
    });

    btnCloseReview.addEventListener('click', () => {
        reviewModal.classList.add('hidden');
    });

    // Close if clicked outside content
    reviewModal.addEventListener('click', (e) => {
        if (e.target === reviewModal) {
            reviewModal.classList.add('hidden');
        }
    });

    starBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentRating = parseInt(e.target.getAttribute('data-val'));
            starBtns.forEach(star => {
                if (parseInt(star.getAttribute('data-val')) <= currentRating) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
        });
    });

    document.getElementById('btn-submit-review').addEventListener('click', () => {
        const name = document.getElementById('review-name').value;
        const text = document.getElementById('review-text').value;

        if (currentRating === 0 || !name || !text) {
            alert('Please provide a rating, name, and review text.');
            return;
        }

        // Mock Submission 
        btnOpenReview.innerHTML = '<i class="fa-solid fa-check"></i> Review Submitted';
        btnOpenReview.disabled = true;
        btnOpenReview.style.background = 'var(--success)';

        reviewModal.classList.add('hidden');
        showToast('Review submitted successfully! Thank you.');

        // Reset form
        currentRating = 0;
        starBtns.forEach(star => star.classList.remove('active'));
        document.getElementById('review-name').value = '';
        document.getElementById('review-text').value = '';
    });
});
