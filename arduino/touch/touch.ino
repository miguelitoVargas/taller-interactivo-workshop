// https://github.com/CNMAT/OSC

#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiUdp.h>
#include <OSCMessage.h>

// Wifi variables
const char* ssid = "Nexxt_5A2178";//"T_C"; //
const char* pswd ="12345678";//"Ch0c0l4t1n4"; // 

WiFiMulti wifiMulti;

// udp variables
WiFiUDP Udp;
//192.168.143.10
//const IPAddress outIp(192,168,1,6);        // remote IP of your computer
const IPAddress outIp(192,168,0,102);        // remote IP of your computer
// const IPAddress outIp(192,168,143,10);        // remote IP of your computer
const unsigned int outPort = 7400;          // remote port to receive OSC
const unsigned int localPort = 7500;          // remote port to receive OSC


int thresholds[] = { 10, 10, 10, 10 };
int readings[4];
void setup () {
  Serial.begin(115200);
  while (!Serial) { ; }

  // setup wifi
  wifiMulti.addAP(ssid, pswd);

  /*
  while (wifiMulti.run() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
*/
  /*
  Serial.println("starting UDP");
  Udp.begin(localPort);
  Serial.printf("Local port: %i \n", localPort);
  */
}

void loop () {
  // arriba
  readings[0] = touchRead(4);
  Serial.printf("lectura es %i: \n", readings[0]);
  delay(500);
  // abajo
  /*
  readings[1] = touchRead(13);
  // izquierda
  readings[2] = touchRead(2);
  // derecha
  readings[3] = touchRead(15);


  if (readings[0] < thresholds[0]) {
    sendOSCMessage("arriba");
  }
  if (readings[1] < thresholds[1]) {
    sendOSCMessage("abajo");
  }
  if (readings[2] < thresholds[2]) {
    sendOSCMessage("izquierda");
  }
  if (readings[3] < thresholds[3]) {
    sendOSCMessage("derecha");
  }
  Serial.printf("readings arriba: %i \n", readings[0]);
  Serial.printf("readings abajo: %i \n", readings[1]);
  Serial.printf("readings izquierda: %i \n", readings[2]);
  Serial.printf("readings derecha: %i \n", readings[3]);
  delay(200);
  */
}

void sendOSCMessage (String cualPlanta) {
  OSCMessage msg("/plant");
  msg.add(cualPlanta.c_str());
  Udp.beginPacket(outIp, outPort);
  msg.send(Udp);
  Udp.endPacket();
  msg.empty();
  yield();
  Serial.printf("mensaje enviado: %s \n", cualPlanta.c_str());
}
