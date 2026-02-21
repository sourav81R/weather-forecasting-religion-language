# Weather Forecasting (GitHub Pages Ready)

This repository is now configured for static deployment on GitHub Pages.

## Deployment

1. Push to the `main` branch.
2. In GitHub: `Settings` -> `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Wait for the `Deploy GitHub Pages` workflow to complete.

Site URL format:

`https://<username>.github.io/weather-forecasting-religion-language/`

## Notes

- The Pages version uses frontend-only weather fetching from OpenWeather.
- API keys are included in the frontend for static hosting fallback.
- You can still run Flask locally if needed using `python main.py`.
