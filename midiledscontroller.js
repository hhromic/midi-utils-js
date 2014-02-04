/**
 * MidiLedsController v1.0 - A very simple MIDI to RGB LED strip controller for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Constructor
    function MidiLedsController(numLeds, noteOnColors, noteOffColors) {
        this._numLeds = numLeds;
        this._noteOnColors = noteOnColors;
        this._noteOffColors = noteOffColors;
        this._noteOffset = 0x00;
        this._offVelocity = 0x00;

        // Setup event handlers
        this._handlers = {
            'led-output': undefined,  // led, r, g, b
        };
    }

    // Cache variable for prototype
    var proto = MidiLedsController.prototype;

    // Assign an event handler to a LED strip event
    proto.on = function (event, handler) {
        if (typeof handler === 'function' && this._handlers.hasOwnProperty(event)) {
            this._handlers[event] = handler;
            return true;
        }
        return false;
    }

    // Emit LED strip events
    proto.emit = function (event, data1, data2, data3, data4) {
        if (this._handlers.hasOwnProperty(event) && this._handlers[event] !== undefined) {
            switch (event) {
                case 'led-output':
                    this._handlers[event](data1, data2, data3, data4);
                    break;
                default:
                    return false;
            }
            return true;
        }
        return false;
    }

    // Set the offset to be substracted to every note
    proto.setNoteOffset = function (note) {
        if (note < 0x00 || note > 0x7F)
            return false;
        this._noteOffset = note;
        return true;
    }

    // Set the velocity value for 'note-off'
    proto.setOffVelocity = function (velocity) {
        if (velocity < 0x00 || velocity > 0x7F)
            return false;
        this._offVelocity = velocity;
        return true;
    }

    // Process a Midi Note On message
    proto.noteOn = function (channel, note, velocity) {
        if (channel < 0x0 || channel > 0xF || note < 0x00 || note > 0x7F || velocity < 0x00 || velocity > 0x7F)
            return false;
        var color = this._noteOnColors.mapNoteRGB(note, velocity);
        this.emit('led-output', note - this._noteOffset, color.r, color.g, color.b);
        return true;
    }

    // Process a Midi Note Off message
    proto.noteOff = function (channel, note) {
        if (channel < 0x0 || channel > 0xF || note < 0x00 || note > 0x7F)
            return false;
        var color = this._noteOffColors.mapNoteRGB(note, this._offVelocity);
        this.emit('led-output', note - this._noteOffset, color.r, color.g, color.b);
        return true;
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
