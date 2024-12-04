## FeedWise IoT Project Code

### ESP32 Code

**Directory**: `esp32_code/main/main.c`

**Functionality**:

- initializes HX711 and RC522 sensors
- initializes standard and 360 servo motors
- connects to wifi for making http post requests to aws database and handling post requests from flutter app.
- on RFID card detection, servo motors activated based on validity of time interval and weight threshold conditions.

**Resources**:

- RC522 library: https://github.com/abobija/esp-idf-rc522
- HX711 library: https://github.com/UncleRus/esp-idf-lib/tree/master/components/hx711
- Servo library: https://github.com/Melek-Cherif/motor_control_esp32/tree/main/components/servo_motor

## Flutter App Code

**Main Directory**: `flutter_application/lib`

- `main.dart` runs the application

**Sub Directories**:

- `/charts`
  - contains bar chart and line chart code that appear on data page.
  - both widgets use http get requests to fetch from database.
- `/models`
  - creates one class for each of the two tables in the database to accept response.
  - creates a settings model to hold user specified settings.
- `/pages`
  - home page with logo
  - settings page for user specifications
  - data page for viewing the feeding trends or forcing dispension
  - main page organizes the 3 page options to visibly show the chosen screen
