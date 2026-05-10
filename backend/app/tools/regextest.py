import re

from app.tools.base import BaseTool


class RegexTestTool(BaseTool):
    slug = "regex-test"
    name = "正则测试器"
    description = "测试正则表达式，查看匹配结果和捕获组"
    category = "调试"

    async def run(self, text: str, pattern: str = "", flags: str = "", **kwargs) -> str:
        if not pattern:
            return "请提供正则表达式 pattern 参数"

        flag_map = {"i": re.IGNORECASE, "m": re.MULTILINE, "s": re.DOTALL, "x": re.VERBOSE}
        flag_val = 0
        for f in flags:
            if f in flag_map:
                flag_val |= flag_map[f]

        try:
            regex = re.compile(pattern, flag_val)
        except re.error as e:
            return f"正则表达式语法错误: {e}"

        lines = [f"正则: /{pattern}/{flags}", f"测试文本: {text}", ""]

        # findall
        matches = regex.findall(text)
        if not matches:
            lines.append("没有匹配结果")
        else:
            lines.append(f"共 {len(matches)} 处匹配:")
            for idx, m in enumerate(matches, 1):
                lines.append(f"  [{idx}] {m}")

        return "\n".join(lines)
