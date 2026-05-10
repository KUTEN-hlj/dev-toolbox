from urllib.parse import quote, unquote

from app.tools.base import BaseTool


class URLEncodeTool(BaseTool):
    slug = "url-encode"
    name = "URL 编码"
    description = "对 URL 特殊字符进行百分号编码"
    category = "编解码"

    async def run(self, text: str, **kwargs) -> str:
        return quote(text, safe="")


class URLDecodeTool(BaseTool):
    slug = "url-decode"
    name = "URL 解码"
    description = "将百分号编码的 URL 还原为原始字符串"
    category = "编解码"

    async def run(self, text: str, **kwargs) -> str:
        return unquote(text)
