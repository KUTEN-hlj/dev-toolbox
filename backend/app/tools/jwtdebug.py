import json
from jose import jwt
from jose.exceptions import JWTError as JOSEError

from app.tools.base import BaseTool


class JWTDecodeTool(BaseTool):
    slug = "jwt-decode"
    name = "JWT 调试器"
    description = "解析 JWT Token，查看 Header 和 Payload（不验证签名）"
    category = "调试"

    async def run(self, text: str, **kwargs) -> str:
        token = text.strip()
        lines = []
        # 分段解码 header / payload
        try:
            header = jwt.get_unverified_header(token)
            lines.append("=== Header ===")
            lines.append(json.dumps(header, ensure_ascii=False, indent=2))
        except JOSEError as e:
            return f"Header 解析失败: {e}"

        try:
            payload = jwt.decode(token, "", options={"verify_signature": False})
            lines.append("")
            lines.append("=== Payload ===")
            lines.append(json.dumps(payload, ensure_ascii=False, indent=2))
        except JOSEError as e:
            return f"Payload 解析失败: {e}"

        try:
            claims = jwt.get_unverified_claims(token)
            if claims:
                # 检查过期时间
                if "exp" in claims:
                    from datetime import datetime, timezone
                    exp_time = datetime.fromtimestamp(claims["exp"], tz=timezone.utc)
                    now = datetime.now(timezone.utc)
                    status = "已过期" if exp_time < now else "有效"
                    lines.append("")
                    lines.append(f"=== 过期时间: {exp_time.isoformat()} ({status}) ===")
                if "iat" in claims:
                    iat_time = datetime.fromtimestamp(claims["iat"], tz=timezone.utc)
                    lines.append(f"=== 签发时间: {iat_time.isoformat()} ===")
        except Exception:
            pass

        return "\n".join(lines)
