from typing import List, Optional
from datetime import datetime

from app.models import BBox, StormCell
from app.utils.geo import Grid


class BaseProvider:
    def get_ndvi(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        raise NotImplementedError

    def get_slope(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        raise NotImplementedError

    def get_fuel_type(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        raise NotImplementedError

    def get_cape(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        raise NotImplementedError

    def get_dewpoint_depression(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        raise NotImplementedError

    def get_cloud_base_height(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        raise NotImplementedError

    def get_low_level_rh(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        raise NotImplementedError

    def get_precip_efficiency(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        raise NotImplementedError

    def get_population_proximity(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        raise NotImplementedError

    def get_infrastructure_density(self, bbox: BBox, grid: Grid, when: datetime) -> Optional[List[List[float]]]:
        raise NotImplementedError

    def get_storm_cells(self, bbox: BBox, when: datetime) -> Optional[List[StormCell]]:
        raise NotImplementedError
