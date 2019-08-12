
#include <SPI.h>
#include <Wire.h>

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED display TWI address
#define OLED_ADDR   0x3C
//#define OLED_ADDR   0x78

#define OLED_RESET 4
Adafruit_SSD1306 display(-1);

#if (SSD1306_LCDHEIGHT != 32)
#error("Height incorrect, please fix Adafruit_SSD1306.h!");
#endif

int counts=0;
void tube_impulse() { //procedure for capturing events from Geiger Kit
  counts++;
}

void setup() {
  Serial.begin(9600);
  // initialize and clear display

  pinMode(2, INPUT); // set pin INT0 input for capturing GM Tube events
  digitalWrite(2, HIGH); // turn on internal pullup resistors, solder C-INT on the PCB
  attachInterrupt(0, tube_impulse, RISING); //define external interrupts
  
  display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  display.clearDisplay();
  display.display();
  Serial.println("Privet");

  // display a pixel in each corner of the screen
  display.drawPixel(0, 0, WHITE);
  display.drawPixel(127, 0, WHITE);
  display.drawPixel(0, 45, WHITE);
  display.drawPixel(127, 45, WHITE);

  // display a line of text
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(35,8);
  display.print("0.45");
  
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(90,16);
  display.print("pCu/L");

  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(1,25);
  display.print("No WiFi Connection");
  // update display with all of the above graphics
  display.display();
}
//---------------------------------------------

void loop() {

Serial.println(counts);

int maxPx=(counts*127)/180;
Serial.println(maxPx);
if (counts != 0){
  for (int i=0; i<maxPx; i++){
    for (int j=0; j<5 ;j++){
    display.drawPixel(i, j, WHITE);
  }
  }
  display.display();
  delay(10);
    for (int i=0; i<maxPx; i++){
    for (int j=0; j<5 ;j++){
    display.drawPixel(i, j, BLACK);
  }
    }
  display.display();
 }
counts=0;

 delay(1000);
}

