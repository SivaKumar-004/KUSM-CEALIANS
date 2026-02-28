from langgraph.graph import StateGraph, END
from state import AgentState
from node import resilience_builder_node, stability_anchor_node, safety_net_node, debt_revival_node
from llm_node import llm_financial_intervention_node

def route_next_node(state: AgentState) -> str:
    """
    Conditional router to determine if we go to a specific track node
    or end the graph.
    """
    selected_track = state.get("agent_response", {}).get("selected_track", "")
    
    if selected_track == "Resilience Builder":
        return "resilience_builder"
    elif selected_track == "Stability Anchor":
        return "stability_anchor"
    elif selected_track == "Safety Net":
        return "safety_net"
    elif selected_track == "Debt Revival":
        return "debt_revival"
    
    return "end"

def create_financial_graph():
    """
    Creates and compiles the LangGraph workflow.
    """
    # 1. Initialize the state graph
    workflow = StateGraph(AgentState)
    
    # 2. Add our nodes
    workflow.add_node("intervention_agent", llm_financial_intervention_node)
    workflow.add_node("resilience_builder", resilience_builder_node)
    workflow.add_node("stability_anchor", stability_anchor_node)
    workflow.add_node("safety_net", safety_net_node)
    workflow.add_node("debt_revival", debt_revival_node)
    
    # 3. Define the flow 
    workflow.set_entry_point("intervention_agent")
    
    # 4. Conditional Edges from the intervention_agent
    workflow.add_conditional_edges(
        "intervention_agent",
        route_next_node,
        {
            "resilience_builder": "resilience_builder",
            "stability_anchor": "stability_anchor",
            "safety_net": "safety_net",
            "debt_revival": "debt_revival",
            "end": END
        }
    )
    
    workflow.add_edge("resilience_builder", END)
    workflow.add_edge("stability_anchor", END)
    workflow.add_edge("safety_net", END)
    workflow.add_edge("debt_revival", END)
    
    # 5. Compile the graph
    app = workflow.compile()
    
    return app

# Expose the compiled graph
graph_app = create_financial_graph()
