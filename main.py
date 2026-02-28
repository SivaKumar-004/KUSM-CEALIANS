import json
from graph import graph_app

def run_test(user_id: str, score: float = None):
    print(f"\n{'-'*50}")
    print(f"Testing Input -> User: '{user_id}', Score: {score}")
    
    # Initial input state
    initial_state = {
        "user_id": user_id,
        "score": score
    }
    
    # Invoke the LangGraph app
    result = graph_app.invoke(initial_state)
    
    # Extract and format the agent's JSON response
    final_output = result.get("agent_response", {})
    
    print("Agent JSON Output:")
    print(json.dumps(final_output, indent=2))
    print(f"{'-'*50}")

if __name__ == "__main__":
    print("Running Financial Intervention Agent Tests...")
    
    # Test Case 1: Resilience Builder (Score >= 75)
    run_test("user_A_resilience", 85)
    
    # Test Case 2: Stability Anchor (55 <= Score < 75)
    run_test("user_B_stability", 60)
    
    # Test Case 3: Safety Net (35 <= Score < 55)
    run_test("user_C_safety", 45)
    
    # Test Case 4: Debt Revival (Score < 35)
    run_test("user_D_debt", 20)
    
    # Test Case 5: Missing Score
    run_test("user_E_missing", None)
    
    # Test Case 6: Invalid Score (Out of bounds)
    run_test("user_F_invalid", -10)
