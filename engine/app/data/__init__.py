from typing import Literal

from app.data.synthetic import SyntheticProvider
from app.data.real import RealProvider
from app.data.hybrid import HybridProvider


def get_provider(mode: Literal["hybrid", "real", "synthetic"]):
    if mode == "real":
        return RealProvider()
    if mode == "synthetic":
        return SyntheticProvider()
    return HybridProvider(real=RealProvider(), synthetic=SyntheticProvider())
