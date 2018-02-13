/** Load WLAN credentials from EEPROM */
void loadCredentials() {
  EEPROM.begin(512);
  EEPROM.get(0, ssid);
  EEPROM.get(0+sizeof(ssid), password);
  char ok[2+1];
  EEPROM.get(0+sizeof(ssid)+sizeof(password), thingName);
  EEPROM.get(0+sizeof(ssid)+sizeof(password)+sizeof(thingName), rgbOrder);
  EEPROM.get(0+sizeof(ssid)+sizeof(password)+sizeof(thingName)+sizeof(rgbOrder), ok);
  EEPROM.get(0+sizeof(ssid)+sizeof(password)+sizeof(thingName)+sizeof(rgbOrder)+sizeof(ok), ledLength);
  EEPROM.end();
  if (String(ok) != String("OK")) {
    ssid[0] = 0;
    password[0] = 0;
  }
  Serial.println("Recovered credentials:");
  Serial.println(ssid);
  Serial.println(strlen(password)>0?"********":"<no password>");
}

/** Store WLAN credentials to EEPROM */
void saveCredentials() {
  EEPROM.begin(512);
  EEPROM.put(0, ssid);
  EEPROM.put(0+sizeof(ssid), password);
  EEPROM.put(0+sizeof(ssid)+sizeof(password), thingName);
  EEPROM.put(0+sizeof(ssid)+sizeof(password)+sizeof(thingName), rgbOrder);
  char ok[2+1] = "OK";
  EEPROM.put(0+sizeof(ssid)+sizeof(password)+sizeof(thingName)+sizeof(rgbOrder), ok);
  EEPROM.put(0+sizeof(ssid)+sizeof(password)+sizeof(thingName)+sizeof(rgbOrder)+sizeof(ok), ledLength);
  EEPROM.commit();
  EEPROM.end();
}




