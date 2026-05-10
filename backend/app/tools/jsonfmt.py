import json

from app.tools.base import BaseTool


class JSONFormatTool(BaseTool):
    slug = "json-format"
    name = "JSON 格式化"
    description = "压缩的 JSON 转成带缩进的可读格式"
    category = "格式化"

    async def run(self, text: str, **kwargs) -> str:
        data = json.loads(text)
        return json.dumps(data, ensure_ascii=False, indent=2)


class JSONMinifyTool(BaseTool):
    slug = "json-minify"
    name = "JSON 压缩"
    description = "去除 JSON 中的空白和换行，减小体积"
    category = "格式化"

    async def run(self, text: str, **kwargs) -> str:
        data = json.loads(text)
        return json.dumps(data, ensure_ascii=False, separators=(",", ":"))
