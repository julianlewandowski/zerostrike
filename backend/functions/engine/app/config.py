from dataclasses import dataclass

# Default bounding box for Northern California (Lightning Complex region)
DEFAULT_BBOX = (-124.5, 36.0, -118.0, 39.5)

# Replay window for the 2020 California Lightning Complex siege
DEFAULT_START = "2020-08-15T00:00:00Z"
DEFAULT_END = "2020-08-19T23:00:00Z"


@dataclass(frozen=True)
class AppConfig:
    grid_resolution_deg: float = 0.05
    horizon_hours: int = 6
    threat_threshold: float = 0.44
    simulate_step_hours: int = 6
    routing_top_n: int = 20
    routing_drone_count: int = 5
    routing_speed_kmh: float = 120.0
    routing_range_km: float = 200.0

    fuel_layer_weight: float = 0.4
    atmospheric_layer_weight: float = 0.4
    consequence_layer_weight: float = 0.2

    # Fuel sub-weights
    fuel_ndvi_weight: float = 0.5
    fuel_slope_weight: float = 0.3
    fuel_type_weight: float = 0.2

    # Atmospheric sub-weights
    atmo_cape_weight: float = 0.3
    atmo_dewpoint_dep_weight: float = 0.25
    atmo_cloud_base_weight: float = 0.2
    atmo_low_rh_weight: float = 0.2
    atmo_precip_eff_weight: float = 0.05

    # Consequence sub-weights
    consequence_population_weight: float = 0.6
    consequence_infra_weight: float = 0.4

    # Priority thresholds
    priority_critical: float = 0.485
    priority_high: float = 0.465
    priority_medium: float = 0.448
