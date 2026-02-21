from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class BBox(BaseModel):
    min_lon: float
    min_lat: float
    max_lon: float
    max_lat: float


class SimRequest(BaseModel):
    bbox: Optional[BBox] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    step_hours: Optional[int] = None
    data_mode: Literal["hybrid", "real", "synthetic"] = "hybrid"
    threshold: Optional[float] = None


class StormCell(BaseModel):
    id: str
    center_lat: float
    center_lon: float
    radius_km: float
    speed_kmh: float
    bearing_deg: float


class GridMeta(BaseModel):
    resolution_deg: float
    rows: int
    cols: int
    bbox: BBox


class LayerResponse(BaseModel):
    meta: GridMeta
    layers: dict


class ThreatCollection(BaseModel):
    type: str = Field(default="FeatureCollection")
    features: List[dict]
