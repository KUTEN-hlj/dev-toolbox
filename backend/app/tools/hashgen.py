import hashlib

from app.tools.base import BaseTool


class HashGenTool(BaseTool):
    slug = "hash-gen"
    name = "密码哈希生成"
    description = "生成 MD5 / SHA1 / SHA256 / SHA512 哈希值"
    category = "安全"

    async def run(self, text: str, **kwargs) -> str:
        algorithms = {
            "md5": hashlib.md5,
            "sha1": hashlib.sha1,
            "sha256": hashlib.sha256,
            "sha512": hashlib.sha512,
        }
        data = text.encode("utf-8")
        lines = ["输入: " + text, ""]
        for name, algo in algorithms.items():
            h = algo(data).hexdigest()
            lines.append(f"{name.upper():>8}: {h}")
        return "\n".join(lines)
