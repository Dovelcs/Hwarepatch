from dataclasses import dataclass, field


@dataclass
class Component:
    designator: str
    device: str
    footprint: str
    x: float
    y: float
    layer: str
    value: str = ''
    bom: dict = field(default_factory=dict)
    rotation: float = 0
