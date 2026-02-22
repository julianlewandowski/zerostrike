from typing import List

from app.config import AppConfig
from app.utils.geo import clamp


def score_consequence(
    population: List[List[float]],
    infrastructure: List[List[float]],
    config: AppConfig,
) -> List[List[float]]:
    values = []
    for r_idx, row in enumerate(population):
        out_row = []
        for c_idx, pop_val in enumerate(row):
            infra_val = infrastructure[r_idx][c_idx]

            score = (
                config.consequence_population_weight * clamp(pop_val, 0.0, 1.0)
                + config.consequence_infra_weight * clamp(infra_val, 0.0, 1.0)
            )
            out_row.append(clamp(score, 0.0, 1.0))
        values.append(out_row)
    return values
