/* code that trained a BoeBot to follow a dark line path, identify a color corresponsing to a country,
calculate threshold from photo transistor to determine if object reflectivity corresponds to metal or not,
and communicate/recieve results to other BoeBots*/

#define Rx 17 // DOUT to pin 17 
#define Tx 16 // DIN to pin 16
const int ledY = 9; //button responds to pin 9
const int ledG = 10; //button responds to pin 10
const int ledW = 13; //
String continent;

const int TxPin = 14;//LCD screen pin
#include <SoftwareSerial.h>
SoftwareSerial mySerial = SoftwareSerial(255, TxPin);
//Pins for QTI connections on board
#define lineSensor1 47
#define lineSensor2 53
#define lineSensor3 52
#include <Servo.h> // Include servo library
Servo servoLeft;// Declare left and right servos
Servo servoRight;
#include <Wire.h> //setting up RGB sensor
#include "Adafruit_TCS34725.h"
#define redpin 45
#define greenpin 46
#define bluepin 44
#define commonAnode true
// our RGB -> eye-recognized gamma color
byte gammatable[256];// used to relate brightness to voltage

Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_50MS, TCS34725_GAIN_4X);

// setup for team communication
int values[] = { -1, -1, -1, -1, -1, -1};
int valuesStored = 0;
// when receiving values from xBee where c is the character from the xBee
void storeValue(char c) {
  if (valuesStored < 6 && c >= 97 && c <= 108) {
    if (values[(c - 97) / 2] == -1) {
      values[(c - 97) / 2] = (c + 1) % 2;
      valuesStored++;
    }
  }
}

String chal[7] = {"Nitrogen", "Health", "Medicine", "VR", "Science", "Brain", "Learning"};

void setup() {
  pinMode(TxPin, OUTPUT);
  mySerial.begin(9600);
  mySerial.write(12);
  pinMode(ledY, OUTPUT);//signal sent
  pinMode(ledG, OUTPUT); //signal recieved
  pinMode(ledW, OUTPUT);// bright light for signaling
  Serial.begin(9600);//start the serial monitor so we can view the output
  Serial2.begin (9600); // Set data rate to 9600 bps
  servoLeft.attach(11);  // Attach left servo to pin 11
  servoRight.attach(12); //Attach right servo to pin 12
  if (tcs.begin()) //RGB sensor check
  {
    //Serial.println("Found /sensor");
  }
  else {
    Serial.println("No TCS34725 found ... check your connections");
    while (1); // halt!
  }

}
int result;
void loop() {
  /* if(Serial2.available())
    { // Is XBee available?
     char incoming = Serial2 . read (); // Read character ,
     Serial . println (incoming ); // send to Serial Monitor
     digitalWrite(ledG, HIGH);//Turn green LED on
     delay(50);
     digitalWrite(ledG, LOW);//Turn green LED off
    }*/
  int qti1 = RCTime(lineSensor1);//Calls funtion 'RCTime' Request reading from QTI sensor at pin 'linesensor1' saves value in variable 'qti1'
  int qti2 = RCTime(lineSensor2);//Calls funtion 'RCTime' Request reading from QTI sensor at pin 'linesensor2' saves value in variable 'qti2'
  int qti3 = RCTime(lineSensor3);//Calls funtion 'RCTime' Request reading from QTI sensor at pin 'linesensor3' saves value in variable 'qti3'
  boolean q1 = isDark(qti1); //determine if each sensor is detecting dark or light
  boolean q2 = isDark(qti2);
  boolean q3 = isDark(qti3);
  // Full speed forward
  servoLeft.writeMicroseconds(1650);  // Left wheel counterclockwise
  servoRight.writeMicroseconds(1350); // Right wheel clockwise
  if (q1 && q2 && q3) //all dark(hash)
  {
    servoLeft.writeMicroseconds(1500); //movement stops
    servoRight.writeMicroseconds(1500);
    delay(500);
    servoLeft.writeMicroseconds(1300);//Turn left
    servoRight.writeMicroseconds(1300);
    delay(800);
    servoLeft.writeMicroseconds(1650); //move forward
    servoRight.writeMicroseconds(1350);
    delay(225);
    servoLeft.writeMicroseconds(1500); //movement stops
    servoRight.writeMicroseconds(1500);
    servoRight.detach();
    servoLeft.detach();

    digitalWrite(ledW, HIGH);
    delay(500);

    digitalWrite(TxPin, HIGH);//turn LCD on High
//    mySerial.write(12);//clear
    delay(500);//required delay

    long t1 = decay(8);//checks decay time read from pin 8
    Serial.print(t1);
    if (isShiny(t1)) //determines if reflective
    {
      char outgoing = 'd'; // send 1 if metallic
      digitalWrite(ledY, HIGH);// Turn yellow LED on
      delay(50);
      digitalWrite(ledY, LOW);//Turn yellow LED off
      Serial2.print ( outgoing );
      mySerial.write(128);
      Serial.print("1 case met");
      mySerial.print("1 ");
      delay(30);
      result = 1;
    }
    else
    {
      char outgoing = 'c'; // send 0 if not metallic
      digitalWrite(ledY, HIGH);// Turn yellow LED on
      delay(50);
      digitalWrite(ledY, LOW);//Turn yellow LED off
      Serial2.print ( outgoing );
      mySerial.write(128);
      Serial.print("0 case met");
      mySerial.print("0 ");
      delay(30);
      result = 0;
    }


//    digitalWrite(TxPin, LOW);//turn LCD off
    digitalWrite(ledW, LOW);//Turn white LED off
    delay(50);

    //Sets up RGB sensor
#if defined(ARDUINO_ARCH_ESP32)
    ledcAttachPin(redpin, 45);
    ledcSetup(1, 12000, 8);
    ledcAttachPin(greenpin, 46);
    ledcSetup(2, 12000, 8);
    ledcAttachPin(bluepin, 44);
    ledcSetup(3, 12000, 8);
#else
    pinMode(redpin, OUTPUT);
    pinMode(greenpin, OUTPUT);
    pinMode(bluepin, OUTPUT);
#endif
    //gammatables to convert brightness to voltage
    for (int i = 0; i < 256; i++) {
      float x = i;
      x /= 255;
      x = pow(x, 2.5);
      x *= 255;

      if (commonAnode) {
        gammatable[i] = 255 - x;
      } else {
        gammatable[i] = x;
      }
    }

    float red, green, blue;

    tcs.setInterrupt(false);// turn on LED

    delay(500);

    tcs.getRGB(&red, &green, &blue);

    tcs.setInterrupt(true);// turn off LED

    Serial.print("\n");

    int r = int(red); //gets numeric value for each color
    int g = int(green);
    int b = int(blue);
    digitalWrite(TxPin, HIGH);
    if( r<110 && g<90 && b<82) //gray threshold
    {
      mySerial.print("S. America");//country
      char outgoing = 'W'; // signifies gray
      digitalWrite(ledY, HIGH);// Turn yellow LED on
      delay(50);
      digitalWrite(ledY, LOW);//Turn yellow LED off
      Serial2.print ( outgoing );
      continent = "S. America";

    }
    else if(r<120 && g<97 && b<50) //yellow threshold
    {
      mySerial.print("Africa");//country
      char outgoing = 'Y'; // signifies yellow
      digitalWrite(ledY, HIGH);// Turn yellow LED on
      delay(50);
      digitalWrite(ledY, LOW);//Turn yellow LED off
      Serial2 . print ( outgoing );
      continent = "Africa";
    }
    else if(r<137 && g<70 && b<85) //purple threshold
    {
      mySerial.print("Australia");//country
      char outgoing = 'P'; // signifies puple
      digitalWrite(ledY, HIGH);// Turn yellow LED on
      delay(50);
      digitalWrite(ledY, LOW);//Turn yellow LED off
      Serial2 . print ( outgoing );
      continent = "Australia";
    }
   else if(r<190 && g<60 && b<55)//Red threshold
    {
      mySerial.print("Asia");//country
      char outgoing = 'R'; // signifies red
      digitalWrite(ledY, HIGH);// Turn yellow LED on
      delay(50);
      digitalWrite(ledY, LOW);//Turn yellow LED off
      Serial2 . print ( outgoing );
      continent = "Asia";

    }
    else if(r<95 && g<90 && b<115) //Blue threshold
    {
      mySerial.print("Europe");//country
      char outgoing = 'B'; // signifies blue
      digitalWrite(ledY, HIGH);// Turn yellow LED on
      delay(50);
      digitalWrite(ledY, LOW);//Turn yellow LED off
      Serial2 . print ( outgoing );
      continent = "Europe";
    }
    else if(r<100 && g<115 && b<65)//green threshold
    {
      mySerial.print("N.America"); //country
      char outgoing = 'G'; // signifies green
      digitalWrite(ledY, HIGH);// Turn yellow LED on
      delay(50);
      digitalWrite(ledY, LOW);//Turn yellow LED off
      Serial2 . print ( outgoing );
      continent = "N. America";
    }
    else
    { //doesn't fall into known color threshold
      mySerial.print("NA");
      Serial.print("R:\t"); Serial.print(int(red));
      Serial.print("\tG:\t"); Serial.print(int(green));
      Serial.print("\tB:\t"); Serial.print(int(blue));

    }//controls RGB LED
#if defined(ARDUINO_ARCH_ESP32)
    ledcWrite(1, gammatable[(int)red]);
    ledcWrite(2, gammatable[(int)green]);
    ledcWrite(3, gammatable[(int)blue]);
#else
    analogWrite(redpin, gammatable[(int)red]);
    analogWrite(greenpin, gammatable[(int)green]);
    analogWrite(bluepin, gammatable[(int)blue]);
#endif
    delay(3000);
    mySerial.write(12);//clear
    long timestamp = millis();
    while (1) {

      char c =  Serial2.read();
      storeValue(c);
      
      char outgoing = 'z';
      if (result == 1) {
        outgoing = 'd';
      }
      else {
        outgoing = 'c';
      }
      storeValue(outgoing);
      if (millis() - timestamp > 3000)
      {
        Serial2.print(outgoing);
        timestamp = millis();
      }



      //valuesStored = 6;  //used for testing

      if (valuesStored == 6) {
        int teamSum = getSum();
        //   teamSum = 0; //used for testing
        mySerial.write(12);
        delay(5);
        mySerial.print(String(result) + "," + String(teamSum) + "," + continent + "," + chal[teamSum]);
        while (1);
      }


    } // closes infinite loop

  }

  else if (q1 && !q3) //sense left but not right
  {
    servoLeft.writeMicroseconds(1400); //wheels clockwise, turn left
    servoRight.writeMicroseconds(1400);
  }
  else if (q3 && !q1) //sense right but not left
  {
    servoLeft.writeMicroseconds(1600);//wheels counterclockwise, turn right
    servoRight.writeMicroseconds(1600);
  }
  delay(50);


}

// getSum() helper method
int getSum() {
  int val = 0;
  for (int i = 0; i < 6; i++) {
    val += values[i];
  }
  return val;
}


//Defines funtion 'RCTime' to read value from QTI sensor
long RCTime(int sensorIn)
{

  long duration = 0;
  pinMode(sensorIn, OUTPUT); // Sets pin as OUTPUT
  digitalWrite(sensorIn, HIGH); // Pin HIGH
  delay(1); // Waits for 1 millisecond
  pinMode(sensorIn, INPUT); // Sets pin as INPUT
  digitalWrite(sensorIn, LOW); // Pin LOW

  while (digitalRead(sensorIn)) { // Waits for the pin to go LOW
    duration++;

  }
  return duration; // Returns the duration of the pulse
}
boolean isDark(long val)
{
  boolean check;
  if (val >= 100) //dark area(line) detected
  {
    check = true;

  }
  else
  {
    check = false;
  }
  return check;//returns whether value denotes dark or light
}
long decay(int pin) // ..returns decay time
{
  pinMode(pin, OUTPUT);
  digitalWrite(pin, HIGH);
  delay(1);
  pinMode(pin, INPUT);
  digitalWrite(pin, LOW);
  long time  = micros();// Mark the time
  while (digitalRead(pin)); // Wait for voltage < threshold
  time = micros() - time; // Calculate decay time
  return time; // Return decay time
}
boolean isShiny(long dTime)// recieves decay time
{
  boolean check;
  if (dTime > 1650) //threshold values for non-metal
  {  
    return false;// not metal
  }
  else
  {
    return true;//metal
  }

}
