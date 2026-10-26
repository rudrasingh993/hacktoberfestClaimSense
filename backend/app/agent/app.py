from typing import Any
from app.agent.guards import (
    enforce_gate1_tool_allowlist,
    enforce_gate2_argument_validation,
    check_workflow_order
)
from app.agent.tools import TOOLS
from app.exceptions import ClaimSenseException, SecurityGateError
from app.config import settings

class ClaimSenseAgent:
    """Python-hosted local agent with three security gates, workflow order enforcement, and bounded loops."""

    def __init__(self):
        self.max_steps = settings.max_agent_steps
        self.tool_registry = TOOLS

    def execute_tool_call(
        self,
        tool_name: str,
        arguments: dict[str, Any],
        current_workflow_stage: str = "validate_estimate_inputs"
    ) -> dict[str, Any]:
        """Executes a tool call passing through all three security gates."""
        try:
            # Gate 1: Tool allowlist
            valid_tool = enforce_gate1_tool_allowlist(tool_name)
            
            # Gate 2: Argument validation
            valid_args = enforce_gate2_argument_validation(valid_tool, arguments)
            
            # Gate 3: Workflow order lock
            check_workflow_order(valid_tool, current_workflow_stage)
            
            # Safe Execution
            tool_fn = self.tool_registry[valid_tool]
            result = tool_fn(**valid_args)
            
            # Serialize result if pydantic model
            if hasattr(result, "model_dump"):
                result_data = result.model_dump()
            else:
                result_data = result
                
            return {
                "status": "success",
                "tool": valid_tool,
                "result": result_data
            }
            
        except SecurityGateError as e:
            return {
                "status": "blocked",
                "gate": e.details.get("gate", "Security Gate"),
                "message": e.message,
                "details": e.details
            }
        except ClaimSenseException as e:
            return {
                "status": "error",
                "code": e.code,
                "message": e.message,
                "details": e.details
            }
        except Exception as e:
            return {
                "status": "fatal_error",
                "message": f"Unexpected execution error: {str(e)}"
            }

agent = ClaimSenseAgent()
