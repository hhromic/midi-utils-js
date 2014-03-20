/**
 * MidiLedsController v1.0 - A very simple MIDI to RGB LED strip controller for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Constructor
    function MidiLedsController(noteColors, noteMin, noteMax, ledsData) {
        EventEmitter.call(this);

        // Instance variables
        this._noteColors = noteColors;
        this._noteMin = noteMin;
        this._noteMax = noteMax;
        this._ledsData = ledsData;

        // Create internal state arrays
        this._leds = {start: [], decay: []}
        for (var i=0; i<(noteMax - noteMin + 1); i++) {
            this._leds.start.push(-1);
            this._leds.decay.push(undefined);
        }
    }

    // We are an event emitter
    MidiLedsController.prototype = Object.create(EventEmitter.prototype);

    // Cache variable for prototype
    var proto = MidiLedsController.prototype;

    // Compute next leds frame
    proto._computeNextFrame = function (time) {
        var redraw = false;
        for (var led=0; led<(this._noteMax - this._noteMin + 1); led++) {
            if (this._leds.start[led] == 0)
                this._leds.start[led] = time;
            if (this._leds.start[led] > 0) {
                var elapsed = time - this._leds.start[led];
                var factor = (1 - (elapsed / 15000)) * (this._leds.decay[led] == 'slowDecay' ? 1 : 0.65);
                if (factor >= 0) {
                    var r = Math.floor(((this._ledsData[led] >> 16) & 0xFF) * factor);
                    var g = Math.floor(((this._ledsData[led] >> 8) & 0xFF) * factor);
                    var b = Math.floor((this._ledsData[led] & 0xFF) * factor);

                    var newValue = (r << 16) + (g << 8) + b;
                    if (newValue != this._ledsData[led]) {
                        redraw = true;
                        this._ledsData[led] = newValue;
                    }
                }
                else this._leds.start[led] = -1;
            }
        }
        return redraw;
    }

    // Process a Midi Note On message
    proto.noteOn = function (channel, note, velocity) {
        if (channel < 0x0 || channel > 0xF || note < this._noteMin || note > this._noteMax || velocity < 0x00 || velocity > 0x7F)
            return false;
        var color = this._noteColors.mapNoteRGB(note, velocity);
        this._ledsData[note - this._noteMin] = (color.r << 16) + (color.g << 8) + color.b;
        this._leds.start[note - this._noteMin] = 0;
        this._leds.decay[note - this._noteMin] = 'slowDecay';
        return true;
    }

    // Process a Midi Note Off message
    proto.noteOff = function (channel, note) {
        if (channel < 0x0 || channel > 0xF || note < this._noteMin || note > this._noteMax)
            return false;
        this._leds.decay[note - this._noteMin] = 'fastDecay';
        return true;
    }

    // Signal a clock ticket for the leds controller
    proto.tick = function(time) {
        if (this._computeNextFrame(time))
            this.emit('frame');
    }

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return MidiLedsController;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = MidiLedsController;
    }
    else {
        this.MidiLedsController = MidiLedsController;
    }
}.call(this));
