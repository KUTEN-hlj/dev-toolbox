import base64

from app.tools.base import BaseTool


class Base64EncodeTool(BaseTool):
    slug = "base64-encode"
    name = "Base64 编码"
    description = "将文本字符串编码为 Base64 格式"
    category = "编解码"

    async def run(self, text: str, **kwargs) -> str:
        return base64.b64encode(text.encode("utf-8")).decode("utf-8")


class Base64DecodeTool(BaseTool):
    slug = "base64-decode"
    name = "Base64 解码"
    description = "将 Base64 字符串解码为原始文本"
    category = "编解码"

    async def run(self, text: str, **kwargs) -> str:
        try:
            return base64.b64decode(text.encode("utf-8")).decode("utf-8")
        except Exception:
            raise ValueError("无效的 Base64 字符串，请检查输入")
