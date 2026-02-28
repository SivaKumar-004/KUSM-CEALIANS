import os
from dotenv import load_dotenv
load_dotenv()

from typing import Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from state import AgentState

# Pydantic schema enforcing strict output constraints
class InterventionOutput(BaseModel):
    user_id: str = Field(description="The user's ID")
    selected_track: str = Field(description="The selected track name")
    recommended_actions: list[str] = Field(description="List of recommended actions")
    escalation_required: bool = Field(description="Whether escalation is required")
    missing_data: list[str] = Field(description="List of missing data fields, if any")

SYSTEM_PROMPT = """You are a Financial Intervention Execution Agent inside a multi-agent LangGraph workflow.

You receive only a precomputed financial score (0–100).

You do NOT:
Calculate scores
Infer financial ratios
Assume income, debt, savings, or insurance status
Fabricate eligibility conditions
Invent government scheme benefits

You MUST:
Route user to a track based strictly on score
Generate intervention-level actions appropriate for that track
Avoid assumptions beyond score
Return structured JSON only

If score is missing or invalid, return "I’m not certain due to insufficient data."

TRACK ROUTING RULES (FIXED):
score >= 75 -> "Resilience Builder"
55 <= score < 75 -> "Stability Anchor"
35 <= score < 55 -> "Safety Net"
score < 35 -> "Debt Revival"

TRACK INTERVENTION RULES:
1. Resilience Builder (Goal: Strengthen financial growth) -> Suggest portfolio diversification review, Suggest insurance coverage review, Suggest pension planning review, Suggest long-term wealth automation setup. escalation=false.
2. Stability Anchor (Goal: Prevent decline) -> Suggest expense monitoring, Suggest EMI optimization review, Suggest insurance coverage check, Suggest financial literacy reinforcement. escalation=false.
3. Safety Net (Goal: Stabilize vulnerability) -> Recommend emergency fund creation, Recommend review of welfare eligibility, Recommend debt exposure review, Suggest financial counselling access. escalation=false.
4. Debt Revival (Goal: Crisis management) -> Recommend structured debt management consultation, Recommend strict expense freeze plan, Recommend repayment prioritization strategy. escalation=true.

OUTPUT FORMAT:
Return strict JSON matching the instructions.
{format_instructions}
"""

def llm_financial_intervention_node(state: AgentState) -> Dict[str, Any]:
    """
    Alternative LangGraph Node using an LLM to generate the output instead of strict Python code.
    Use this if you absolutely want to pass the prompt through Langchain/OpenAI.
    """
    user_id = state.get("user_id", "")
    score = state.get("score")
    
    # 1. Setup the LLM and Parser
    # (Requires export OPENAI_API_KEY="...")
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    parser = JsonOutputParser(pydantic_object=InterventionOutput)
    
    # 2. Wire up the prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "user_id: {user_id}\nscore: {score}")
    ])
    
    prompt = prompt.partial(format_instructions=parser.get_format_instructions())
    
    # 3. Create the Chain
    chain = prompt | llm | parser
    
    # 4. Invoke the LLM
    try:
        response = chain.invoke({
            "user_id": user_id, 
            "score": score if score is not None else "null"
        })
        return {"agent_response": response}
    except Exception as e:
        # Fallback if the LLM fails to return strict JSON
        return {
            "agent_response": {
                "user_id": user_id,
                "selected_track": "",
                "recommended_actions": [],
                "escalation_required": False,
                "missing_data": ["score"]
            }
        }
