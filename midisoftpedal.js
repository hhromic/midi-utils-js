/**
 * MidiSoftPedal v1.0 - A very simple event-driven Midi Soft Pedal processor for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Constructor
    function MidiSoftPedal() {
        this._softenFactor = 2/3;

        // Create internal pedals state object
        this._pedals = [];
        for (var i=0; i<16; i++)
            this._pedals[i] = {
                pressed: false
            };

        // Setup event handlers
        this._handlers = {
            'note-on': undefined,   // channel, note, velocity
            'soft-off': undefined,  // channel
            'soft-on': undefined    // channel
        };
    }

    // Cache variable for prototype
    var proto = MidiSoftPedal.prototype;

    // Set the soften factor [0,1] for the pedal
    proto.setSoftenFactor = function (softenFactor) {
        if (softenFactor >= 0 && softenFactor <= 1) {
            this._softenFactor = softenFactor;
            return true;
        }
        return false;
    }

    // Assign an event handler to a pedalling event
    proto.on = function (event, handler) {
        if (typeof handler === 'function' && this._handlers.hasOwnProperty(event)) {
            this._handlers[event] = handler;
            return true;
        }
        return false;
    }

    // Emit pedalling events
    proto.emit = function (event, data1, data2, data3) {
        if (this._handlers.hasOwnProperty(event) && this._handlers[event] !== undefined) {
            switch (event) {
                case 'soft-off':
                case 'soft-on':
                    this._handlers[event](data1);
                    break;
                case 'note-off':
                    this._handlers[event](data1, data2);
                    break;
                case 'note-on':
                    this._handlers[event](data1, data2, data3);
                    break;
                default:
                    return false;
            }
            return true;
        }
        return false;
    }

    // Simulate pressing the soft pedal
    proto.press = function (channel) {
        if (channel < 0x0 || channel > 0xF)
            return false;
        this._pedals[channel].pressed = true;
        this.emit('soft-on', channel);
        return true;
    }

    // Simulate releasing the soft pedal
    proto.release = function (channel) {
        if (channel < 0x0 || channel > 0xF)
            return false;
        this._pedals[channel].pressed = false;
        this.emit('soft-off', channel);
        return true;
    }

    // Process a Midi Note On message
    proto.noteOn = function (channel, note, velocity) {
        if (channel < 0x0 || channel > 0xF || note < 0x00 || note > 0x7F || velocity < 0x00 || velocity > 0x7F)
            return false;
        if (this._pedals[channel].pressed)
            velocity = Math.round(velocity * this._softenFactor);
        this.emit('note-on', channel, note, velocity);
        return true;
    }

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return MidiSoftPedal;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = MidiSoftPedal;
    }
    else {
        this.MidiSoftPedal = MidiSoftPedal;
    }
}.call(this));
