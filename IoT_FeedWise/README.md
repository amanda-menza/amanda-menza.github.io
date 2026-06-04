# FeedWise IoT Smart Feeder

FeedWise is an IoT pet-feeding prototype made of two connected parts:

- ESP32 firmware that reads RFID and weight sensors, controls servo motors, and communicates with a remote database/API.
- A Flutter app that displays feeding data and allows users to adjust feeder settings or force a dispense action.

## Project structure

| Path | Purpose |
| --- | --- |
| `esp32_code/` | ESP-IDF firmware project for the feeder hardware. |
| `esp32_code/main/main.c` | Main firmware entry point: sensor setup, Wi-Fi, HTTP communication, RFID handling, weight thresholds, and servo control. |
| `esp32_code/main/idf_component.yml` | ESP-IDF component manifest. |
| `flutter_application/` | Flutter mobile app. |
| `flutter_application/lib/pages/` | Home, data, settings, and navigation pages. |
| `flutter_application/lib/charts/` | Bar and line chart widgets for feeding trends. |
| `flutter_application/lib/models/` | Data models for settings, detection data, and weight data. |
| `flutter_application/assets/` | App logo assets. |

## Hardware responsibilities

The firmware coordinates:

- RC522 RFID reads to identify an animal/card.
- HX711 weight measurements to evaluate feed amount.
- Standard and continuous-rotation servo motors for dispenser movement.
- Wi-Fi connection and HTTP requests to the backend/database.
- Time-window and weight-threshold checks before dispensing.

## Firmware setup

Install ESP-IDF, then configure the project from `esp32_code/`:

```bash
cd esp32_code
idf.py set-target esp32
idf.py menuconfig
idf.py build
idf.py flash monitor
```

External component references:

- RC522: `https://github.com/abobija/esp-idf-rc522`
- HX711: `https://github.com/UncleRus/esp-idf-lib/tree/master/components/hx711`
- Servo: `https://github.com/Melek-Cherif/motor_control_esp32/tree/main/components/servo_motor`

If you use `esp-idf-lib`, set `ESP_IDF_LIB_PATH` before building:

```bash
export ESP_IDF_LIB_PATH=/path/to/esp-idf-lib
```

## Flutter app setup

Install Flutter, then run:

```bash
cd flutter_application
flutter pub get
flutter run
```

Useful commands:

```bash
flutter analyze
flutter test
flutter build ios
flutter build apk
```

## App screens

- `home_page.dart` displays the branded home screen.
- `data_page.dart` fetches and visualizes feeding data.
- `settings_page.dart` lets the user update feeding configuration.
- `main_page.dart` organizes the app-level navigation.

## Data flow

1. The ESP32 detects RFID input and reads feeder weight.
2. Firmware checks configured time and weight rules.
3. If dispensing is allowed, the servo system activates.
4. Firmware posts feeding events and measurements to the remote service.
5. The Flutter app fetches those records and renders trends/settings.

## Maintenance notes

- Keep `.DS_Store` files out of git.
- Keep generated Flutter build output, `.dart_tool/`, and platform build caches out of git.
- Document the production API/database endpoint before handing the project to another developer.
