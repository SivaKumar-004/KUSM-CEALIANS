from typing import Dict, Any
from state import AgentState

def financial_intervention_node(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph routing node to determine the financial intervention track based strictly 
    on the precomputed financial score.
    """
    user_id = state.get("user_id", "")
    score = state.get("score")
    
    response = {
        "user_id": user_id,
        "selected_track": "",
        "recommended_actions": [],
        "escalation_required": False,
        "missing_data": []
    }
    
    if score is None or not isinstance(score, (int, float)) or score < 0 or score > 100:
        response["missing_data"].append("score")
        return {"agent_response": response}

    if score >= 75:
        response["selected_track"] = "Resilience Builder"
        # We handle proactive actions later in the next node
        response["recommended_actions"] = [
            "Proactive Govt scheme auto-enrollment",
            "Proactive SIP setup for retirement",
            "Proactive weekly financial tips subscription",
            "Proactive health cover top-up purchase",
            "Proactive expense review execution"
        ]
    elif 55 <= score < 75:
        response["selected_track"] = "Stability Anchor"
        response["recommended_actions"] = [
            "Proactive EMI restructuring flag",
            "Proactive auto-apply for PMJJBY/PMSBY",
            "Proactive weekly micro-learning subscription",
            "Proactive financial counselor alert",
            "Proactive bill payment setup",
            "Proactive 7-day budgeting challenge"
        ]
    elif 35 <= score < 55:
        response["selected_track"] = "Safety Net"
        response["recommended_actions"] = [
            "Proactive emergency fund challenge",
            "Proactive debt helpline connection",
            "Proactive welfare scheme application (food subsidy, PMGKY)",
            "Proactive block-level officer alert",
            "Proactive urgent financial literacy push",
            "Proactive payment deferral setup"
        ]
    else: 
        response["selected_track"] = "Debt Revival"
        response["recommended_actions"] = [
            "Proactive debt management service connection",
            "Proactive one-time settlement (OTS) application",
            "Proactive urgent block-level officer alert",
            "Proactive emergency ration scheme application",
            "Proactive credit freeze initiation",
            "Proactive daily motivational messaging",
            "Proactive debt consolidation simulation"
        ]
        response["escalation_required"] = True

    return {"agent_response": response}

def resilience_builder_node(state: AgentState) -> Dict[str, Any]:
    """
    Proactive node specific to the Resilience Builder track. 
    It prepares the data and actionable state for the 5 key tasks.
    """
    # 1) Auto enroll PMJJBY/PMSBY/APY (Pre-fill data)
    user_name = state.get("user_name", "Jane Doe")
    age = state.get("user_age", 30)
    
    # 2) Monthly SIP to close retirement gap
    gap = state.get("retirement_gap", 2500000) # Mock gap: 25L
    sip_amount = int(gap / (15 * 12)) if age < 50 else int(gap / (5 * 12)) # simple logic
    
    resilience_activities = {
        "govt_scheme": {
            "status": "pending",
            "form": {
                "name": user_name,
                "age": age,
                "scheme": "PMJJBY"
            }
        },
        "sip_setup": {
            "status": "pending",
            "retirement_gap": gap,
            "recommended_sip": sip_amount
        },
        "weekly_tips": {
            "status": "pending"
        },
        "health_cover": {
            "status": "pending",
            "plans": [
                {"id": "plan1", "name": "HealthSuraksha Base", "cover": "₹5 Lakhs", "premium": "₹450/mo"},
                {"id": "plan2", "name": "HealthSuraksha Plus", "cover": "₹15 Lakhs", "premium": "₹900/mo"}
            ]
        },
        "expense_review": {
            "status": "generated",
            "report": [
                {"category": "Broadband", "observation": "Overpaying for premium local plan", "action": "Switch to basic tier", "savings": "₹1200/mo"},
                {"category": "Subscriptions", "observation": "Inactive Gym Membership", "action": "Cancel subscription", "savings": "₹2000/mo"}
            ]
        }
    }
    
    return {"resilience_activities": resilience_activities}

def stability_anchor_node(state: AgentState) -> Dict[str, Any]:
    """
    Proactive node specific to the Stability Anchor track. 
    It prepares the data and actionable state for the 6 key tasks.
    """
    user_name = state.get("user_name", "Jane Doe")
    monthly_income = state.get("monthly_income", 50000)
    monthly_emi = state.get("monthly_emi", 25000)
    
    # 1) Flag high EMI ratio
    emi_ratio = monthly_emi / monthly_income if monthly_income > 0 else 0
    is_high_emi = emi_ratio > 0.4
    
    stability_activities = {
        "emi_restructure": {
            "status": "pending",
            "is_high": is_high_emi,
            "ratio_pct": int(emi_ratio * 100),
            "current_emi": monthly_emi,
            "suggested_emi": int(monthly_emi * 0.75) if is_high_emi else monthly_emi
        },
        "insurance": {
            "status": "pending",
            "scheme": "PMJJBY",
            "message": "Urgent: You are not covered. Auto-apply now for family protection."
        },
        "micro_learning": {
            "status": "pending",
            "videos": [
                {"id": 1, "title": "Debt vs Income Basics", "duration": "2m 15s"},
                {"id": 2, "title": "How to Lower Interest", "duration": "3m 40s"},
                {"id": 3, "title": "Emergency Funds 101", "duration": "1m 50s"}
            ]
        },
        "counselor_alert": {
            "status": "pending"
        },
        "bill_reminders": {
            "status": "pending",
            "bills": [
                {"name": "Electricity Board", "due": "12th Oct", "amount": "₹1,450"},
                {"name": "Credit Card", "due": "15th Oct", "amount": "₹5,200"},
                {"name": "Internet Broadband", "due": "18th Oct", "amount": "₹899"}
            ]
        },
        "budget_challenge": {
            "status": "pending",
            "opted_in": False,
            "days": 7,
            "daily_goal": "₹500"
        }
    }
    
    return {"stability_activities": stability_activities}

def safety_net_node(state: AgentState) -> Dict[str, Any]:
    """
    Proactive node specific to the Safety Net track.
    Computes data for emergency funds, helplines, schemes, officers, literacy, and deferrals.
    """
    user_name = state.get("user_name", "Jane Doe")
    monthly_emi = state.get("monthly_emi", 25000)

    safety_net_activities = {
        "emergency_fund": {
            "status": "pending",
            "goal": monthly_emi * 3 if monthly_emi > 0 else 50000,
            "message": "Build a 3-month safety net."
        },
        "helpline": {
            "status": "pending",
            "phone": "1800-DEBT-HELP"
        },
        "welfare_schemes": {
            "status": "pending",
            "schemes": [
                {"name": "Food Subsidy Program", "eligibility": "Likely Eligible"},
                {"name": "PMGKY Relief", "eligibility": "Eligible"}
            ],
            "prefill_name": user_name
        },
        "officer_alert": {
            "status": "triggered",
            "log": "Officer notified in your designated block/area."
        },
        "literacy_push": {
            "status": "pending",
            "videos": [
                {"id": "sn1", "title": "Avoiding Loan Sharks", "duration": "1m 45s"},
                {"id": "sn2", "title": "Understanding Compound Interest Traps", "duration": "2m 10s"}
            ]
        },
        "payment_deferral": {
            "status": "pending",
            "bills": [
                {"name": "Personal Loan EMI", "amount": f"₹{monthly_emi}"},
                {"name": "Utility Bill", "amount": "₹2,100"}
            ]
        }
    }
    
    return {"safety_net_activities": safety_net_activities}

def debt_revival_node(state: AgentState) -> Dict[str, Any]:
    """
    Proactive node specific to the Debt Revival (Crisis) track.
    Focuses on freezing debt, OTS, immediate block officer connection, and daily motivation.
    """
    user_name = state.get("user_name", "Jane Doe")
    monthly_emi = state.get("monthly_emi", 25000)

    debt_revival_activities = {
        "debt_management": {
            "status": "pending",
            "step_by_step": [
                "1. Assessing total outstanding",
                "2. Identifying minimum viable sustenance amounts",
                "3. Freezing accumulated interest requests"
            ]
        },
        "ots_application": {
            "status": "pending",
            "known_debt": monthly_emi * 24, # Mock logic
            "offer_amount": int(monthly_emi * 24 * 0.45) # Offering to settle at 45%
        },
        "officer_alert_urgent": {
            "status": "triggered",
            "log": "URGENT: Officer notified - Priority Visit Scheduled for assistance."
        },
        "emergency_ration": {
            "status": "pending",
            "message": "Immediate short-term emergency ration application ready.",
            "prefill_name": user_name
        },
        "credit_freeze": {
            "status": "active",
            "warning": "CRITICAL: Taking new loans will worsen your situation. Credit requests have been frozen."
        },
        "motivation": {
            "status": "active",
            "quote": "\"Every mountain is climbable step by step. We are with you.\"",
            "tip": "Today, avoid any non-essential purchase, no matter how small."
        },
        "consolidation_sim": {
            "status": "pending",
            "current_emis": monthly_emi,
            "projected_consolidated_emi": int(monthly_emi * 0.6)
        }
    }
    
    return {"debt_revival_activities": debt_revival_activities}
