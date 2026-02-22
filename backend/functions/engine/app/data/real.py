from datetime import datetime
from typing import List, Optional

from app.data.base import BaseProvider
from app.models import BBox, StormCell
from app.utils.geo import Grid


class RealProvider(BaseProvider):
    """
    Placeholder provider for real data sources (HRRR, Sentinel, FIRMS, NOAA).
    Returns None so hybrid mode can fall back to synthetic data.
    """

    def get_ndvi(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        return None

    def get_slope(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        return None

    def get_fuel_type(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        return None

    def get_cape(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        return None

    def get_dewpoint_depression(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        return None

    def get_cloud_base_height(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        return None

    def get_low_level_rh(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        return None

    def get_precip_efficiency(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        return None

    def get_population_proximity(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        return None

    def get_infrastructure_density(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        return None

    def get_storm_cells(self, bbox: BBox, when: datetime) -> Optional[List[StormCell]]:
        return None
