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
        EventEmitter.call(this);

        // Default soften factor value
        this._softenFactor = 2/3;

        // Create internal pedals state object
        this._pedals = [];
        for (var i=0; i<16; i++)
            this._pedals[i] = {
                pressed: false
            };
    }

    // We are an event emitter
    MidiSoftPedal.prototype = Object.create(EventEmitter.prototype);

    // Prototype shortcut
    var proto = MidiSoftPedal.prototype;

    // Set the soften factor [0,1] for the pedal
    proto.setSoftenFactor = function (softenFactor) {
        if (softenFactor >= 0 && softenFactor <= 1)
            this._softenFactor = softenFactor;
    }

    // Simulate pressing the soft pedal
    proto.press = function (channel) {
        this._pedals[channel & 0xF].pressed = true;
    }

    // Simulate releasing the soft pedal
    proto.release = function (channel) {
        this._pedals[channel & 0xF].pressed = false;
    }

    // Process a Midi Note On message
    proto.noteOn = function (channel, note, velocity) {
        if (this._pedals[channel & 0xF].pressed)
            velocity = Math.round((velocity & 0x7F) * this._softenFactor);
        this.emit('note-on', channel, note, velocity);
    }

    // Expose either via AMD, CommonJS or the global object
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
