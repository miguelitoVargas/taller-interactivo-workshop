/*
 * libraries:
 * cnmat/OSC@^1.0.0
 */

#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiUdp.h>
#include <OSCMessage.h>

// Wifi variables
const char* ssid = "ROUTER_SSID";//
const char* pswd = "ROUTER_PSWD";//

WiFiMulti wifiMulti;

// udp variables
WiFiUDP Udp;
//
// ip de la app
const IPAddress outIp(192,168,0,101);        // remote IP of your computer
const unsigned int outPort = 7400;          // remote port to receive OSC
const unsigned int localPort = 7500;          // remote port to receive OSC


int micReadings = 0;
void setup () {
  Serial.begin(115200);
  while (!Serial) { ; }


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

}

void loop () {

  micReadings = analogRead(32);

  Serial.printf("mic sensor reading:  %i \n", micReadings);

  delay(200);
  OSCMessage msg("/mic");
  msg.add(micReadings);
  Udp.beginPacket(outIp, outPort);
  msg.send(Udp);
  Udp.endPacket();
  msg.empty();
  Serial.println("osc message sent");
  yield();
}

