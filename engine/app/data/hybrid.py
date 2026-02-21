from datetime import datetime
from typing import List

from app.data.base import BaseProvider
from app.models import BBox, StormCell
from app.utils.geo import Grid


class HybridProvider(BaseProvider):
    def __init__(self, real: BaseProvider, synthetic: BaseProvider) -> None:
        self.real = real
        self.synthetic = synthetic

    def _fallback(self, value, fallback):
        return value if value is not None else fallback

    def get_ndvi(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        return self._fallback(self.real.get_ndvi(bbox, grid, when), self.synthetic.get_ndvi(bbox, grid, when))

    def get_slope(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        return self._fallback(self.real.get_slope(bbox, grid, when), self.synthetic.get_slope(bbox, grid, when))

    def get_fuel_type(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        return self._fallback(self.real.get_fuel_type(bbox, grid, when), self.synthetic.get_fuel_type(bbox, grid, when))

    def get_cape(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        return self._fallback(self.real.get_cape(bbox, grid, when), self.synthetic.get_cape(bbox, grid, when))

    def get_dewpoint_depression(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        return self._fallback(
            self.real.get_dewpoint_depression(bbox, grid, when),
            self.synthetic.get_dewpoint_depression(bbox, grid, when),
        )

    def get_cloud_base_height(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        return self._fallback(
            self.real.get_cloud_base_height(bbox, grid, when),
            self.synthetic.get_cloud_base_height(bbox, grid, when),
        )

    def get_low_level_rh(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        return self._fallback(self.real.get_low_level_rh(bbox, grid, when), self.synthetic.get_low_level_rh(bbox, grid, when))

    def get_precip_efficiency(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        return self._fallback(
            self.real.get_precip_efficiency(bbox, grid, when),
            self.synthetic.get_precip_efficiency(bbox, grid, when),
        )

    def get_population_proximity(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        return self._fallback(
            self.real.get_population_proximity(bbox, grid, when),
            self.synthetic.get_population_proximity(bbox, grid, when),
        )

    def get_infrastructure_density(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        return self._fallback(
            self.real.get_infrastructure_density(bbox, grid, when),
            self.synthetic.get_infrastructure_density(bbox, grid, when),
        )

    def get_storm_cells(self, bbox: BBox, when: datetime) -> List[StormCell]:
        return self._fallback(self.real.get_storm_cells(bbox, when), self.synthetic.get_storm_cells(bbox, when))
