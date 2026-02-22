from typing import List

from app.config import AppConfig
from app.utils.geo import clamp


def score_fuel(ndvi: List[List[float]], slope: List[List[float]], fuel_type: List[List[float]], config: AppConfig) -> List[List[float]]:
    values = []
    for r_idx, row in enumerate(ndvi):
        out_row = []
        for c_idx, ndvi_val in enumerate(row):
            slope_val = slope[r_idx][c_idx]
            fuel_val = fuel_type[r_idx][c_idx]

            slope_norm = clamp(slope_val / 40.0, 0.0, 1.0)
            fuel_norm = clamp(fuel_val, 0.0, 1.0)

            score = (
                config.fuel_ndvi_weight * clamp(ndvi_val, 0.0, 1.0)
                + config.fuel_slope_weight * slope_norm
                + config.fuel_type_weight * fuel_norm
            )
            out_row.append(clamp(score, 0.0, 1.0))
        values.append(out_row)
    return values
