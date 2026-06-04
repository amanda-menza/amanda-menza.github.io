# Amanda Menza Portfolio Repository

This repository collects several course, capstone, and application projects. It is organized as a portfolio/source archive rather than one single deployable application, so each top-level folder has its own stack, setup steps, and maintenance notes.

## Repository map

| Path | Contents | Main stack |
| --- | --- | --- |
| `abroad-hub-main/` | Study-abroad application management platform with student, administrator, partner, faculty, SSO, MFA, document, recommendation-letter, and prerequisite workflows. | Django REST Framework, PostgreSQL, Next.js, TypeScript |
| `IoT_FeedWise/` | Smart dog-feeder prototype with ESP32 firmware and a Flutter monitoring/control app. | ESP-IDF C, Flutter/Dart |
| `Futatsu-main/` | Java coursework projects, including a descendant-tree warmup and Bazaar game implementation. | Java, Gradle, JavaFX, JUnit |
| `Computer Architecture: Assembly & C/` | Small C, assembly, and Java architecture exercises. | C, assembly, Java |
| `APTs-Java/` | Algorithmic problem-solving exercises from Java APT practice. | Java |
| `ECE Fundamentals: C++/` | Embedded/robotics sketch for a Boe-Bot style project. | Arduino C++ |

## Quick start by project

### Abroad Hub

```bash
cd abroad-hub-main/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

```bash
cd abroad-hub-main/frontend
npm install
npm run dev
```

See `abroad-hub-main/README.md` for environment variables, backend/frontend responsibilities, test commands, and security notes.

### FeedWise

```bash
cd IoT_FeedWise/flutter_application
flutter pub get
flutter run
```

The ESP32 firmware lives in `IoT_FeedWise/esp32_code/` and expects ESP-IDF plus the RFID, HX711, and servo components described in `IoT_FeedWise/README.md`.

### Futatsu Java Projects

```bash
cd Futatsu-main/DescendantTree
gradle test
gradle run
```

```bash
cd Futatsu-main/GameProject/Bazaar
gradle test
gradle run
```

See `Futatsu-main/README.md`, `Futatsu-main/DescendantTree/README.md`, and `Futatsu-main/GameProject/README.md` for project-specific details.

## Documentation index

- `abroad-hub-main/README.md` explains the full-stack Abroad Hub application.
- `abroad-hub-main/backend/README.md` covers Django setup, environment variables, API responsibilities, and security notes.
- `abroad-hub-main/frontend/README.md` covers the Next.js frontend structure, scripts, and testing.
- `IoT_FeedWise/README.md` covers firmware, Flutter app structure, hardware dependencies, and setup notes.
- `Futatsu-main/README.md` maps the Java coursework projects and generated artifacts.
- `Futatsu-main/DescendantTree/README.md` documents the descendant-tree CLI assignment.
- `Futatsu-main/GameProject/README.md` documents the Bazaar game project and milestone files.
- `Computer Architecture: Assembly & C/README.md`, `APTs-Java/README.md`, and `ECE Fundamentals: C++/README.md` describe the smaller exercise folders.

## Cleanup performed

The repository has been cleaned so generated, machine-local, or vendored build/runtime artifacts are ignored going forward. The cleanup removed:

- `.DS_Store` files throughout the repo.
- `Futatsu-main/out/` and `Futatsu-main/DescendantTree/out/`.
- `Futatsu-main/GameProject/Bazaar/bin/` and `Futatsu-main/GameProject/Bazaar/out/`.
- `Futatsu-main/GameProject/*.jar`, except Gradle wrapper artifacts.
- `Futatsu-main/GameProject/Bazaar/javafx-sdk-21.0.5/`.
- `Futatsu-main/.idea/`, `Futatsu-main/DescendantTree/.idea/`, `Futatsu-main/GameProject/.idea/`, and `Futatsu-main/GameProject/Bazaar/.idea/`.

The cleanup also:

- Converted `abroad-hub-main/backend/requirements.txt` to UTF-8.
- Trimmed the commented default Flutter template block from `IoT_FeedWise/flutter_application/pubspec.yaml`.
- Replaced the machine-specific ESP-IDF component path with the `ESP_IDF_LIB_PATH` environment variable in `IoT_FeedWise/esp32_code/CMakeLists.txt`.
- Renamed ` APTs: Java/` to `APTs-Java/`.

The Gradle wrapper jars in `gradle/wrapper/` are kept, but this repository does not currently track `gradlew` scripts. Generate and commit those scripts if you want wrapper-based commands on fresh clones.

## Suggested repository hygiene

- Keep source, tests, docs, lockfiles, and small assignment instructions in git.
- Exclude local OS files, IDE caches, build outputs, compiled classes, generated archives, and vendored SDKs.
- Prefer reproducible setup commands over committing generated output.
- If the repository is meant to be a GitHub Pages site, add an actual site entry point such as `index.html` or a static-site build workflow; currently it reads more like a portfolio code archive than a Pages app.
