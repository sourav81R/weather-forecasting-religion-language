from __future__ import annotations

import argparse
import json

from backend.services.ml_prediction_service import ml_prediction_service


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Train and persist weather ML models from Open-Meteo archive data."
    )
    parser.add_argument("--lat", type=float, required=True, help="Latitude (e.g. 22.57)")
    parser.add_argument("--lon", type=float, required=True, help="Longitude (e.g. 88.36)")
    parser.add_argument(
        "--days",
        type=int,
        default=540,
        help="Historical lookback window in days (default: 540)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    metrics = ml_prediction_service.train_models_for_location(
        latitude=args.lat,
        longitude=args.lon,
        lookback_days=args.days,
    )
    print("Model training complete.")
    print(json.dumps(metrics, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

