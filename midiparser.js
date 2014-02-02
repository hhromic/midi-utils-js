/**
 * MidiParser v1.0 - A very simple event-driven Midi messages parser for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Constructor
    function MidiParser() {
        // Setup event handlers
        this._handlers = {
            'note-off': undefined,          // channel, note
            'note-on': undefined,           // channel, note, velocity
            'key-pressure': undefined,      // channel, note, pressure
            'program-change': undefined,    // channel, number
            'channel-pressure': undefined,  // channel, pressure
            'pitch-wheel': undefined,       // channel, position
            'sustain-off': undefined,       // channel
            'sustain-on': undefined,        // channel
            'sostenuto-off': undefined,     // channel
            'sostenuto-on': undefined,      // channel
            'soft-off': undefined,          // channel
            'soft-on': undefined,           // channel
            'unknown': undefined            // byte1, byte2, byte3
        };
    }

    // Cache variable for prototype
    var proto = MidiParser.prototype;

    // Assign an event handler to a parsing event
    proto.on = function (event, handler) {
        if (typeof handler === 'function' && this._handlers.hasOwnProperty(event)) {
            this._handlers[event] = handler;
            return true;
        }
        return false;
    }

    // Emit parsing events
    proto.emit = function (event, data1, data2, data3) {
        if (this._handlers.hasOwnProperty(event) && this._handlers[event] !== undefined) {
            switch (event) {
                case 'sustain-off':
                case 'sustain-on':
                case 'sostenuto-off':
                case 'sostenuto-on':
                case 'soft-off':
                case 'soft-on':
                    this._handlers[event](data1);
                    break;
                case 'note-off':
                case 'program-change':
                case 'channel-pressure':
                case 'pitch-wheel':
                    this._handlers[event](data1, data2);
                    break;
                case 'note-on':
                case 'key-pressure':
                case 'unknown':
                    this._handlers[event](data1, data2, data3);
                    break;
                default:
                    return false;
            }
            return true;
        }
        return false;
    }

    // Parse the bytes of a Midi message and emit parsing events
    proto.parse = function (bytes) {
        if (bytes instanceof Uint8Array && bytes.length > 0) {
            var status = bytes[0] & 0xF0;
            var channel = bytes[0] & 0x0F;
            switch (status) {
                case 0x80: // Note Off
                    if (bytes.length > 1) {
                        var note = bytes[1] & 0x7F;
                        this.emit('note-off', channel, note);
                    }
                    break;
                case 0x90: // Note On
                    if (bytes.length > 2) {
                        var note = bytes[1] & 0x7F;
                        var velocity = bytes[2] & 0x7F;
                        if (velocity > 0x00)
                            this.emit('note-on', channel, note, velocity);
                        else
                            this.emit('note-off', channel, note);
                    }
                    break;
                case 0xA0: // Polyphonic Key Pressure
                    if (bytes.length > 2) {
                        var note = bytes[1] & 0x7F;
                        var pressure = bytes[2] & 0x7F;
                        this.emit('key-pressure', channel, note, pressure);
                    }
                    break;
                case 0xB0: // Control Change (CC)
                    if (bytes.length > 2) {
                        var control = bytes[1] & 0x7F;
                        var value = bytes[2] & 0x7F;
                        switch (control) {
                            case 0x40: // Damper Pedal (Sustain)
                                if (value < 0x40)
                                    this.emit('sustain-off', channel);
                                else
                                    this.emit('sustain-on', channel);
                                break;
                            case 0x42: // Sostenuto Pedal
                                if (value < 0x40)
                                    this.emit('sostenuto-off', channel);
                                else
                                    this.emit('sostenuto-on', channel);
                                break;
                            case 0x43: // Soft Pedal
                                if (value < 0x40)
                                    this.emit('soft-off', channel);
                                else
                                    this.emit('soft-on', channel);
                                break;
                            default:
                                this.emit('unknown', bytes[1], bytes[2], bytes[3]);
                        }
                    }
                    break;
                case 0xC0: // Program Change (PC)
                    if (bytes.length > 1) {
                        var number = bytes[1] & 0x7F;
                        this.emit('program-change', channel, number);
                    }
                    break;
                case 0xD0: // Channel Pressure
                    if (bytes.length > 1) {
                        var pressure = bytes[1] & 0x7F;
                        this.emit('channel-pressure', channel, pressure);
                    }
                    break;
                case 0xE0: // Pitch Wheel
                    if (bytes.length > 2) {
                        var msb = bytes[1] & 0x7F;
                        var lsb = bytes[2] & 0x7F;
                        this.emit('pitch-wheel', channel, (msb << 7) + lsb);
                    }
                    break;
                default:
                    this.emit('unknown', bytes[1], bytes[2], bytes[3]);
            }
        }
    }

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return MidiParser;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = MidiParser;
    }
    else {
        this.MidiParser = MidiParser;
    }
}.call(this));
