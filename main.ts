/**
 * "Hands-Free Battery Tester"
 * 
 * ...for AA Alkaline batteries
 * 
 * A main-loop that monitors the analogue value on PIN-0 every few seconds. When it looks like a voltage is applied (i.e. anything above 0.5v) it displays either a "tick" or "cross" depending on the condition.
 * 
 * A voltage greater than 1.4v (voltage-threshold-good') is used to indicate a "healthy" battery with a "tick".
 * 
 * The indication is "held" for a few seconds when the battery is removed.
 * 
 * A "pull-down" resistor between PIN-0 and GND is required for this to work otherwise PIN-0 floats, typically to 3v. The example uses a 1M-ohm resistor - large enough to pull PIN-0 to ground but large enough not draw any significant current from the attached battery.
 */
function getvoltage () {
    reading = pins.analogReadPin(AnalogPin.P0)
    voltagenow = reading / pin0at1v
    return voltagenow
}
function setpeak (num: number) {
    if (num > voltagepeak) {
        voltagepeak = voltagenow
    }
    return voltagepeak
}
function isconnected (num: number) {
    if (num >= connectedvoltage) {
        return true
    }
    return false
}
function displaybad () {
    led.setBrightness(128)
    basic.showIcon(IconNames.No)
}
function displaygood () {
    led.setBrightness(128)
    basic.showIcon(IconNames.Yes)
}
function displayicon () {
    led.setBrightness(32)
    basic.showLeds(`
        . . # . .
        . # # # .
        . . # . .
        . . . . .
        . # # # .
        `)
}
let voltagepeak = 0
let voltagenow = 0
let reading = 0
let pin0at1v = 0
let connectedvoltage = 0
let idlecount = 0
let idleclearthreshold = 1
connectedvoltage = 0.5
let voltagethresholdgood = 1.4
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
