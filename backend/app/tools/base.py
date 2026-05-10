from abc import ABC, abstractmethod
from typing import Any


class BaseTool(ABC):
    slug: str = ""
    name: str = ""
    description: str = ""
    category: str = "其他"

    @abstractmethod
    async def run(self, text: str, **kwargs) -> str:
        ...

    def to_info(self) -> dict:
        return {
            "slug": self.slug,
            "name": self.name,
            "description": self.description,
            "category": self.category,
        }


class ToolRegistry:
    def __init__(self):
        self._tools: dict[str, BaseTool] = {}

    def register(self, tool: BaseTool):
        self._tools[tool.slug] = tool

    def get(self, slug: str) -> BaseTool | None:
        return self._tools.get(slug)

    def list_all(self) -> list[dict]:
        return [t.to_info() for t in self._tools.values()]

    def list_by_category(self) -> dict[str, list[dict]]:
        cats: dict[str, list[dict]] = {}
        for t in self._tools.values():
            cats.setdefault(t.category, []).append(t.to_info())
        return cats


tool_registry = ToolRegistry()
