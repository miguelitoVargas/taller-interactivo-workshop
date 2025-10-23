

#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiUdp.h>
#include <OSCMessage.h>

// Wifi variables
const char* ssid = "Nexxt_5A2178";//"T_C"; //
const char* pswd = "12345678";//"Ch0c0l4t1n4"; //

WiFiMulti wifiMulti;

// udp variables
WiFiUDP Udp;
// const IPAddress outIp(192,168,1,2);        // remote IP of your computer
const IPAddress outIp(192,168,0,102);        // remote IP of your computer
const unsigned int outPort = 7400;          // remote port to receive OSC
const unsigned int localPort = 7500;          // remote port to receive OSC

// srf05 variables
int echoPin = 12;
int trigPin = 13;

long duration;
int distance;
void setup () {
  Serial.begin(115200);
  while (!Serial) { ; }

  // setup distance pins
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  // setup wifi
  wifiMulti.addAP(ssid, pswd);

  while (wifiMulti.run() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  /*
  Serial.println("starting UDP");
  Udp.begin(localPort);
  Serial.printf("Local port: %i \n", localPort);
  */
}

void loop () {
  // clear the trigger
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);


  // set trigger high for 10us
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // read the echo pin
  duration = pulseIn(echoPin, HIGH);

  // get the distance
  // distance= duration*0.034/2;
  distance= duration/29/2;

  Serial.printf("distance in cm: %i \n", distance);
  delay(400);
  // Serial.printf("motion state is: %i \n", motionState);
  sendMessage();
}

void sendMessage () {
  OSCMessage msg("/distance");
  msg.add(distance);
  Udp.beginPacket(outIp, outPort);
  msg.send(Udp);
  Udp.endPacket();
  msg.empty();
  yield();
}












