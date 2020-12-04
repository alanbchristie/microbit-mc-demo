/**
 * "Hands-Free Battery Tester"
 * 
 * ...for AA Alkaline batteries
 * 
 * A main-loop that monitors the analogue value on PIN-0 every few seconds. When it looks like a voltage is applied (i.e. anything above 0.5V) it displays either a "smile" or "frown" depending on the condition.
 * 
 * A voltage greater than 1.35V (voltage-threshold-good') is used to indicate a "healthy" battery.
 * 
 * The indication is "held" for a few seconds when the battery is removed.
 * 
 * A "pull-down" resistor between PIN-0 and GND is required for this to work otherwise PIN-0 floats, typically to 3V. The example uses a 1M-ohm resistor - large enough to pull PIN-0 to ground but large enough not draw any significant current from the attached battery.
 */
// Reads the analogue value from PIN-0 and returns the "calibrated" voltage (a float)
function getvoltage () {
    reading = pins.analogReadPin(AnalogPin.P0)
    voltagenow = reading / pin0at1v
    return voltagenow
}
// Given a calibrated voltage this function returns the new peak value.
function setpeak (num: number) {
    if (num > voltagepeak) {
        voltagepeak = voltagenow
    }
    return voltagepeak
}
// Given a "calibrated" voltage this method returns true if the voltage is sufficient to consider that a battery is actually attached.
function isconnected (num: number) {
    if (num >= connectedvoltage) {
        return true
    }
    return false
}
// Displays a "sad face" - usually called when a battery of poor condition is attached.
function displaybad () {
    led.setBrightness(64)
    basic.showIcon(IconNames.Sad)
}
// Displays a "smiley face" - usually called when a battery of good condition is attached.
function displaygood () {
    led.setBrightness(64)
    basic.showIcon(IconNames.Happy)
}
// Displays the application icon (low luminosity)
function displayicon () {
    led.setBrightness(16)
    basic.showLeds(`
        . . # . .
        . # # # .
        . . # . .
        . . . . .
        . # # # .
        `)
}
// Initialises control variables and displays the application icon (a +/- symbol)
let voltagepeak = 0
let voltagenow = 0
let reading = 0
let pin0at1v = 0
let connectedvoltage = 0
let idlecount = 0
let idleclearthreshold = 1
connectedvoltage = 0.5
let voltagethresholdgood = 1.35
pin0at1v = 311.5
displayicon()
basic.forever(function () {
    basic.pause(2000)
    voltagenow = getvoltage()
    if (isconnected(voltagenow)) {
        voltagepeak = setpeak(voltagenow)
        if (voltagepeak >= voltagethresholdgood) {
            displaygood()
        } else {
            displaybad()
        }
        if (idlecount != 0) {
            idlecount = 0
        }
    } else {
        if (voltagepeak != 0) {
            voltagepeak = 0
        }
        if (idlecount < idleclearthreshold) {
            idlecount += 1
        }
        if (idlecount == idleclearthreshold) {
            displayicon()
        }
    }
})
