// libraries:
/*
	adafruit/Adafruit DHT Unified@^1.0.0
	adafruit/Adafruit Unified Sensor@^1.1.15
	adafruit/DHT sensor library@^1.4.6
  https://github.com/me-no-dev/ESPAsyncWebServer.git
*/
//
// wifi
#include <WiFi.h>
#include <WiFiMulti.h>

// server
#include <FS.h>
#include <SPIFFS.h>
#include <ESPAsyncWebServer.h>
#include <DNSServer.h>
#include <AsyncTCP.h>
#include <ESPmDNS.h>
#include "esp_task_wdt.h"
//
// sensors
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

#define DHTPIN 13    // Digital pin connected to the DHT sensor 
#define DHTTYPE    DHT11     // DHT 22 (AM2302)

DHT_Unified dht(DHTPIN, DHTTYPE);

uint32_t delayMS;


// server
AsyncWebServer server(80);
DNSServer dnsServer;

// tasks

TaskHandle_t waterTask;
bool wateringPlants = false;
// requests

auto onLastReadings = [] (AsyncWebServerRequest *request) {
 esp_task_wdt_reset();
  /*
  int co2 = backendProxyGetCo2();
  float temperature = backendProxyGetTemperature();
  float humidity = backendProxyGetHumidity();
*/
  //String payload = String(co2)+"," + String(temperature) + "," + String(humidity);
  //


  // toma lecturas del DHT11
  // Delay between measurements.
  //delay(delayMS);
  // Get temperature event and print its value.
  sensors_event_t event;
  float temp;
  float hum;
  dht.temperature().getEvent(&event);
  if (isnan(event.temperature)) {
    Serial.println(F("Error reading temperature!"));
  }
  else {
    Serial.print(F("Temperature: "));
    Serial.print(event.temperature);
    Serial.println(F("°C"));
    temp = event.temperature;
  }
  // Get humidity event and print its value.
  dht.humidity().getEvent(&event);
  if (isnan(event.relative_humidity)) {
    Serial.println(F("Error reading humidity!"));
  }
  else {
    Serial.print(F("Humidity: "));
    Serial.print(event.relative_humidity);
    Serial.println(F("%"));
    hum = event.relative_humidity;
  }

  // toma lecturas del sensor humedad en el suelo
  int capacitiveReadings = analogRead(32);

  delay(2);

  if (!isnan(event.relative_humidity) && !isnan(event.temperature) && capacitiveReadings) {
    String payload = String(hum)+ "," + String(temp) + "," + String(capacitiveReadings); //"50,24,1350";
    Serial.printf("sending device last readings: %s\n", payload.c_str());
    request->send(200, "text/plain", payload);

  } else {
    request->send(404);
  }

  /* esp_restart(); */
};

void setup () {
  Serial.begin(115200);
  while (!Serial) { ; }

  pinMode(12, OUTPUT);
  dht.begin();
  Serial.println(F("DHTxx Unified Sensor Example"));
  // Print temperature sensor details.
  sensor_t sensor;
  dht.temperature().getSensor(&sensor);
  Serial.println(F("------------------------------------"));
  Serial.println(F("Temperature Sensor"));
  Serial.print  (F("Sensor Type: ")); Serial.println(sensor.name);
  Serial.print  (F("Driver Ver:  ")); Serial.println(sensor.version);
  Serial.print  (F("Unique ID:   ")); Serial.println(sensor.sensor_id);
  Serial.print  (F("Max Value:   ")); Serial.print(sensor.max_value); Serial.println(F("°C"));
  Serial.print  (F("Min Value:   ")); Serial.print(sensor.min_value); Serial.println(F("°C"));
  Serial.print  (F("Resolution:  ")); Serial.print(sensor.resolution); Serial.println(F("°C"));
  Serial.println(F("------------------------------------"));
  // Print humidity sensor details.
  dht.humidity().getSensor(&sensor);
  Serial.println(F("Humidity Sensor"));
  Serial.print  (F("Sensor Type: ")); Serial.println(sensor.name);
  Serial.print  (F("Driver Ver:  ")); Serial.println(sensor.version);
  Serial.print  (F("Unique ID:   ")); Serial.println(sensor.sensor_id);
  Serial.print  (F("Max Value:   ")); Serial.print(sensor.max_value); Serial.println(F("%"));
  Serial.print  (F("Min Value:   ")); Serial.print(sensor.min_value); Serial.println(F("%"));
  Serial.print  (F("Resolution:  ")); Serial.print(sensor.resolution); Serial.println(F("%"));
  Serial.println(F("------------------------------------"));
  // Set delay between sensor readings based on sensor details.
  delayMS = sensor.min_delay / 1000;

  // wifi AP

  IPAddress apIP(8, 8, 8, 8);

  /* WiFi.mode(WIFI_AP_STA); */
  WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
  String apName = "ecoxfera";//ap_name + String(ESP_getChipId(), HEX);
  WiFi.softAP(apName.c_str());

  Serial.print("AP_IP:    ");
  Serial.println(WiFi.softAPIP());
  Serial.println(apName);
  Serial.println(WiFi.softAPgetHostname());
  Serial.println(WiFi.softAPSSID());
  Serial.println(WiFi.getMode());

  // server

  //dnsServer.start(53, "*", WiFi.softAPIP());
  if (!MDNS.begin("ecoxfera")) {
    Serial.println("Error setting up MDNS responder!");
    // while (1) {
    //   delay(1000);
    // }
  }
  Serial.println("mDNS responder started");
  SPIFFS.begin();
  yield();

  server.serveStatic("/", SPIFFS, "/");
  server.on("/", HTTP_GET, [] (AsyncWebServerRequest * request) {
      Serial.println("someone connected!");
      request->send(SPIFFS, "/index.html");
  });
  server.on("/deviceReadings", HTTP_GET, onLastReadings);
  server.onNotFound(notFound);
  server.onRequestBody(handleBody);
  server.begin();

  MDNS.addService("http", "tcp", 80);


  //task
  xTaskCreatePinnedToCore(
      onWaterPlants,
      "water plants",
      20000,
      NULL,
      1,
      &waterTask,
      0);
}

void loop () {
 // dnsServer.processNextRequest();

  if (wateringPlants) {
    Serial.println("regando plantas");
    regarPlantas();
    wateringPlants = false;
  }

  //regarPlantas();
  // toma lecturas del DHT11
  // Delay between measurements.
  //delay(delayMS);
  // Get temperature event and print its value.
  /*
  sensors_event_t event;
  dht.temperature().getEvent(&event);
  if (isnan(event.temperature)) {
    Serial.println(F("Error reading temperature!"));
  }
  else {
    Serial.print(F("Temperature: "));
    Serial.print(event.temperature);
    Serial.println(F("°C"));
  }
  // Get humidity event and print its value.
  dht.humidity().getEvent(&event);
  if (isnan(event.relative_humidity)) {
    Serial.println(F("Error reading humidity!"));
  }
  else {
    Serial.print(F("Humidity: "));
    Serial.print(event.relative_humidity);
    Serial.println(F("%"));
  }

  // toma lecturas del sensor humedad en el suelo
  int capacitiveReadings = analogRead(32);
  delay(1000);
  Serial.printf("Humedad suelo valor: %i \n", capacitiveReadings);
  */
}

void regarPlantas () {
  // prende 15 sec y apaga 5sec
  // el relay del motor

  digitalWrite(12, LOW);
  delay(5000);
  digitalWrite(12, HIGH);
  yield();
  //delay(5000);

}

// server
void notFound(AsyncWebServerRequest* request) {
  request->send(404, "text/plain", "Not found");
}
void handleBody(AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
  //request->send(404, "text/plain", "Not found");
  for(size_t i=0; i<len; i++){
    Serial.write(data[i]);
  }
}

// water plants task
void onWaterPlants (void * pvParameters) {
  // Block for 30 secs.
  const TickType_t xDelay = 60000 / portTICK_PERIOD_MS;
  while (true) {

    wateringPlants = true;
    vTaskDelay(xDelay);
  }
}
