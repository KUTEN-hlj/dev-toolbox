from pydantic import BaseModel


class ToolInfo(BaseModel):
    slug: str
    name: str
    description: str
    category: str = "其他"


class ToolInput(BaseModel):
    text: str
    pattern: str = ""
    flags: str = ""


class ToolOutput(BaseModel):
    result: str
