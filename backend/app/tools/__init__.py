from app.tools.base import BaseTool, tool_registry

# 编解码
from app.tools.base64 import Base64EncodeTool, Base64DecodeTool
from app.tools.urlcodec import URLEncodeTool, URLDecodeTool

# 格式化
from app.tools.jsonfmt import JSONFormatTool, JSONMinifyTool

# 调试
from app.tools.jwtdebug import JWTDecodeTool
from app.tools.regextest import RegexTestTool

# 时间
from app.tools.cronparser import CronParserTool

# 安全
from app.tools.hashgen import HashGenTool

# 注册
tool_registry.register(Base64EncodeTool())
tool_registry.register(Base64DecodeTool())
tool_registry.register(URLEncodeTool())
tool_registry.register(URLDecodeTool())
tool_registry.register(JSONFormatTool())
tool_registry.register(JSONMinifyTool())
tool_registry.register(JWTDecodeTool())
tool_registry.register(CronParserTool())
tool_registry.register(RegexTestTool())
tool_registry.register(HashGenTool())
