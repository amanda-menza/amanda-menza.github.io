# Amanda Menza Portfolio Repository

This repository collects several course, capstone, and application projects. It is organized as a portfolio/source archive rather than one single deployable application, so each top-level folder has its own stack, setup steps, and maintenance notes.

## Repository map

| Path | Contents | Main stack |
| --- | --- | --- |
| `abroad-hub/` | Study-abroad application management platform with student, administrator, partner, faculty, SSO, MFA, document, recommendation-letter, and prerequisite workflows. | Django REST Framework, PostgreSQL, Next.js, TypeScript |
| `recipe-sharing-flask-app/` | Social recipe-sharing web app with login/signup, recipe creation and editing, photo uploads, bookmarks, ratings, follower feeds, and a merch page. | Flask, SQLAlchemy, Jinja, SQLite |
| `feedwise-iot-smart-feeder/` | Smart dog-feeder prototype with ESP32 firmware and a Flutter monitoring/control app. | ESP-IDF C, Flutter/Dart |
| `java-bazaar-coursework/` | Java coursework projects, including a descendant-tree warmup and Bazaar game implementation. | Java, Gradle, JavaFX, JUnit |
| `computer-architecture-c-assembly/` | Small C, assembly, and Java architecture exercises. | C, assembly, Java |
| `java-algorithm-practice/` | Algorithmic problem-solving exercises from Java APT practice. | Java |
| `ece-fundamentals-cpp/` | Embedded/robotics sketch for a Boe-Bot style project. | Arduino C++ |

## Quick start by project

### Abroad Hub

```bash
cd abroad-hub/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

```bash
cd abroad-hub/frontend
npm install
npm run dev
```

See `abroad-hub/README.md` for environment variables, backend/frontend responsibilities, test commands, and security notes.

### Recipe Sharing Flask App

```bash
cd recipe-sharing-flask-app
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app recipe run --debug
```

See `recipe-sharing-flask-app/README.md` for routes, data model notes, and maintenance details.

### FeedWise

```bash
cd feedwise-iot-smart-feeder/flutter_application
flutter pub get
flutter run
```

The ESP32 firmware lives in `feedwise-iot-smart-feeder/esp32_code/` and expects ESP-IDF plus the RFID, HX711, and servo components described in `feedwise-iot-smart-feeder/README.md`.

### Java Bazaar Coursework

```bash
cd java-bazaar-coursework/DescendantTree
gradle test
gradle run
```

```bash
cd java-bazaar-coursework/GameProject/Bazaar
gradle test
gradle run
```

See `java-bazaar-coursework/README.md`, `java-bazaar-coursework/DescendantTree/README.md`, and `java-bazaar-coursework/GameProject/README.md` for project-specific details.

## Documentation index

- `abroad-hub/README.md` explains the full-stack Abroad Hub application.
- `abroad-hub/backend/README.md` covers Django setup, environment variables, API responsibilities, and security notes.
- `abroad-hub/frontend/README.md` covers the Next.js frontend structure, scripts, and testing.
- `recipe-sharing-flask-app/README.md` covers the Flask recipe-sharing app setup, features, routes, and data model.
- `feedwise-iot-smart-feeder/README.md` covers firmware, Flutter app structure, hardware dependencies, and setup notes.
- `java-bazaar-coursework/README.md` maps the Java coursework projects and generated artifacts.
- `java-bazaar-coursework/DescendantTree/README.md` documents the descendant-tree CLI assignment.
- `java-bazaar-coursework/GameProject/README.md` documents the Bazaar game project and milestone files.
- `computer-architecture-c-assembly/README.md`, `java-algorithm-practice/README.md`, and `ece-fundamentals-cpp/README.md` describe the smaller exercise folders.
