from typing import List

from app.config import AppConfig
from app.utils.geo import clamp


def score_atmospheric(
    cape: List[List[float]],
    dewpoint_dep: List[List[float]],
    cloud_base_km: List[List[float]],
    low_level_rh: List[List[float]],
    precip_eff: List[List[float]],
    config: AppConfig,
) -> List[List[float]]:
    values = []
    for r_idx, row in enumerate(cape):
        out_row = []
        for c_idx, cape_val in enumerate(row):
            dpd_val = dewpoint_dep[r_idx][c_idx]
            cbh_val = cloud_base_km[r_idx][c_idx]
            rh_val = low_level_rh[r_idx][c_idx]
            pe_val = precip_eff[r_idx][c_idx]

            cape_score = clamp((cape_val - 500.0) / 2000.0, 0.0, 1.0)
            dpd_score = clamp(dpd_val / 20.0, 0.0, 1.0)
            cbh_score = clamp((cbh_val - 1.0) / 3.0, 0.0, 1.0)
            rh_score = clamp((50.0 - rh_val) / 40.0, 0.0, 1.0)
            pe_score = clamp((0.5 - pe_val) / 0.5, 0.0, 1.0)

            score = (
                config.atmo_cape_weight * cape_score
                + config.atmo_dewpoint_dep_weight * dpd_score
                + config.atmo_cloud_base_weight * cbh_score
                + config.atmo_low_rh_weight * rh_score
                + config.atmo_precip_eff_weight * pe_score
            )
            out_row.append(clamp(score, 0.0, 1.0))
        values.append(out_row)
    return values
