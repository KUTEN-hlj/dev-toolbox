import logging
import traceback

from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.operation_log import OperationLog
from app.tools.base import tool_registry
from app.schemas.tool import ToolInput

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tools", tags=["工具"])


def _log_operation(db: Session, user: User | None, tool_slug: str, input_text: str, ip: str):
    log = OperationLog(
        user_id=user.id if user else None,
        tool_name=tool_slug,
        action="execute",
        input_summary=input_text[:200] if input_text else "",
        ip_address=ip,
    )
    db.add(log)
    db.commit()


@router.get("/")
def list_tools():
    return {"tools": tool_registry.list_all()}


@router.post("/{slug}")
async def run_tool(
    slug: str,
    body: ToolInput,
    request: Request,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    tool = tool_registry.get(slug)
    if tool is None:
        return {"error": f"未找到工具: {slug}"}

    try:
        result = await tool.run(body.text, pattern=body.pattern, flags=body.flags)
        _log_operation(db, user, slug, body.text, request.client.host if request.client else "")
        return {"result": result}
    except ValueError as e:
        return {"error": str(e)}
    except Exception:
        logger.error("工具执行失败: %s\n%s", slug, traceback.format_exc())
        return {"error": "工具执行出错"}
