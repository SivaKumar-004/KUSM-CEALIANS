from typing import TypedDict, Dict, Any, Optional

class AgentState(TypedDict):
    """
    Represents the state of our LangGraph.
    """
    user_id: str
    score: Optional[float]
    
    # Extended context for the proactive UI
    user_name: Optional[str]
    user_age: Optional[int]
    retirement_gap: Optional[int] # e.g. amount in Rupees to fill the gap
    
    monthly_income: Optional[int]
    monthly_emi: Optional[int]
    
    # This captures the original output JSON structured appropriately 
    agent_response: Dict[str, Any]
    
    # This captures the proactive interactive tasks for Resilience Builder
    resilience_activities: Dict[str, Any]
    
    # This captures the proactive interactive tasks for Stability Anchor
    stability_activities: Dict[str, Any]

    # This captures the proactive interactive tasks for Safety Net
    safety_net_activities: Dict[str, Any]

    # This captures the proactive interactive tasks for Debt Revival
    debt_revival_activities: Dict[str, Any]
