from datetime import datetime, timezone
from croniter import croniter

from app.tools.base import BaseTool


class CronParserTool(BaseTool):
    slug = "cron-parser"
    name = "Cron 表达式解析"
    description = "解析 Cron 表达式，查看下次执行时间和可读描述"
    category = "时间"

    async def run(self, text: str, **kwargs) -> str:
        expr = text.strip()
        try:
            cron = croniter(expr, datetime.now(timezone.utc))
        except ( ValueError):
            return f"无效的 Cron 表达式: {expr}"

        lines = [f"表达式: {expr}", ""]
        lines.append("接下来 5 次执行时间:")
        for i in range(5):
            next_time = cron.get_next(datetime)
            lines.append(f"  {i + 1}. {next_time.strftime('%Y-%m-%d %H:%M:%S')} (UTC)")

        # 解释每个字段的意思
        fields = expr.strip().split()
        if len(fields) in (5, 6):
            field_names = ["分钟", "小时", "日", "月", "星期"]
            if len(fields) == 6:
                field_names.insert(0, "秒")
            lines.append("")
            lines.append("字段说明:")
            for name, val in zip(field_names, fields):
                lines.append(f"  {name}: {val}")

        return "\n".join(lines)
