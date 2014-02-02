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
            'note-off': undefined,
            'note-on': undefined,
            'sustain-off': undefined,
            'sustain-on': undefined,
            'unknown': undefined
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
                    this._handlers[event](data1);
                    break;
                case 'note-off':
                    this._handlers[event](data1, data2);
                    break;
                case 'unknown':
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

    // Parse the bytes of a Midi message and emit parsing events
    proto.parse = function (bytes) {
        if (bytes instanceof Uint8Array && bytes.length > 0) {
            var status = bytes[0] & 0x0000000f0;
            var channel = bytes[0] & 0x0000000f;
            switch (status) {
                case 0x80: // Note-off
                    if (bytes.length > 1) {
                        var note = bytes[1];
                        this.emit('note-off', channel, note);
                    }
                    break;
                case 0x90: // Note-on
                    if (bytes.length > 2) {
                        var note = bytes[1];
                        var velocity = bytes[2];
                        if (velocity > 0)
                            this.emit('note-on', channel, note, velocity);
                        else
                            this.emit('note-off', channel, note);
                    }
                    break;
                case 0xB0: // Control Change (CC)
                    if (bytes.length > 2) {
                        var control = bytes[1];
                        var value = bytes[2];
                        switch (control) {
                            case 0x40: // Damper Pedal (Sustain)
                                if (value < 64)
                                    this.emit('sustain-off', channel);
                                else
                                    this.emit('sustain-on', channel);
                                break;
                            default:
                                this.emit('unknown', bytes[1], bytes[2], bytes[3]);
                        }
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
