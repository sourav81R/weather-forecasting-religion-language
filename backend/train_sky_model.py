from __future__ import annotations

import argparse
from pathlib import Path

SKY_CLASSES = ["clear_sky", "rain_clouds", "storm_clouds", "overcast"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train CNN model for sky image weather recognition.")
    parser.add_argument(
        "--dataset-dir",
        type=str,
        required=True,
        help="Path to dataset root with class folders: clear_sky, rain_clouds, storm_clouds, overcast",
    )
    parser.add_argument("--epochs", type=int, default=12, help="Training epochs (default: 12)")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size (default: 32)")
    parser.add_argument("--learning-rate", type=float, default=1e-3, help="Learning rate (default: 0.001)")
    return parser.parse_args()


def main() -> int:
    try:
        import tensorflow as tf
    except Exception as exc:  # pragma: no cover - dependency gate
        raise SystemExit(f"TensorFlow is required for training: {exc}")

    args = parse_args()
    dataset_dir = Path(args.dataset_dir).resolve()
    if not dataset_dir.exists():
        raise SystemExit(f"Dataset directory not found: {dataset_dir}")

    missing = [name for name in SKY_CLASSES if not (dataset_dir / name).exists()]
    if missing:
        raise SystemExit(
            "Dataset is missing required class folders: "
            + ", ".join(missing)
            + ". Expected folders: clear_sky, rain_clouds, storm_clouds, overcast."
        )

    image_size = (224, 224)
    train_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_dir,
        labels="inferred",
        label_mode="int",
        class_names=SKY_CLASSES,
        image_size=image_size,
        batch_size=args.batch_size,
        shuffle=True,
        validation_split=0.2,
        subset="training",
        seed=42,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_dir,
        labels="inferred",
        label_mode="int",
        class_names=SKY_CLASSES,
        image_size=image_size,
        batch_size=args.batch_size,
        shuffle=True,
        validation_split=0.2,
        subset="validation",
        seed=42,
    )

    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(buffer_size=autotune)
    val_ds = val_ds.prefetch(buffer_size=autotune)

    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input(shape=(224, 224, 3)),
            tf.keras.layers.Rescaling(1.0 / 255.0),
            tf.keras.layers.Conv2D(32, (3, 3), activation="relu"),
            tf.keras.layers.MaxPooling2D(pool_size=(2, 2)),
            tf.keras.layers.Conv2D(64, (3, 3), activation="relu"),
            tf.keras.layers.MaxPooling2D(pool_size=(2, 2)),
            tf.keras.layers.Conv2D(128, (3, 3), activation="relu"),
            tf.keras.layers.MaxPooling2D(pool_size=(2, 2)),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(128, activation="relu"),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(len(SKY_CLASSES), activation="softmax"),
        ]
    )

    optimizer = tf.keras.optimizers.Adam(learning_rate=args.learning_rate)
    model.compile(
        optimizer=optimizer,
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    print(f"Training sky CNN model on {dataset_dir}")
    model.fit(train_ds, validation_data=val_ds, epochs=max(1, args.epochs), verbose=1)

    loss, acc = model.evaluate(val_ds, verbose=0)
    model_dir = Path(__file__).resolve().parent / "models"
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = model_dir / "sky_classifier.h5"
    model.save(model_path)

    print("Sky model training complete.")
    print(f"Validation loss: {loss:.4f}")
    print(f"Validation accuracy: {acc:.4f}")
    print(f"Saved model: {model_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

