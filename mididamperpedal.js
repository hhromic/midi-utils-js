/**
 * MidiDamperPedal v1.0 - A very simple event-driven Midi Damper Pedal processor for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Constructor
    function MidiDamperPedal() {
        EventEmitter.call(this);
        this._pressed = 0x0000;
        this._heldNotes = new Array(16);
        for (var i=16; i--;)
            this._heldNotes[i] = new Uint32Array(4);
    }

    // We are an event emitter
    MidiDamperPedal.prototype = Object.create(EventEmitter.prototype);

    // Prototype shortcut
    var proto = MidiDamperPedal.prototype;

    // Simulate pressing the damper pedal
    proto.press = function (channel) {
        this._pressed |= 1 << (channel & 0xF);
    }

    // Simulate releasing the damper pedal
    proto.release = function (channel) {
        this._pressed &= ~(1 << (channel & 0xF));
        for (var i=128; i--;) { // Send Note Off messages for all channel held notes
            if ((this._heldNotes[channel & 0xF][i / 32] >> (i % 32)) & 1) {
                this._heldNotes[channel & 0xF][i / 32] &= ~(1 << (i % 32));
                this.emit('note-off', channel, i, 0x00);
            }
        }
    }

    // Process a Midi Note On message
    proto.noteOn = function (channel, note, velocity) {
        if ((this._heldNotes[channel & 0xF][(note & 0x7F) / 32] >> ((note & 0x7F) % 32)) & 1)
            this._heldNotes[channel & 0xF][(note & 0x7F) / 32] &= ~(1 << ((note & 0x7F) % 32)); // Reset channel held note
        this.emit('note-on', channel, note, velocity);
    }

    // Process a Midi Note Off message
    proto.noteOff = function (channel, note, velocity) {
        if ((this._pressed >> (channel & 0xF)) & 1) // If pedal pressed, hold channel Note Off message
            this._heldNotes[channel & 0xF][(note & 0x7F) / 32] |= 1 << ((note & 0x7F) % 32);
        else
            this.emit('note-off', channel, note, velocity);
    }

    // Expose either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return MidiDamperPedal;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = MidiDamperPedal;
    }
    else {
        this.MidiDamperPedal = MidiDamperPedal;
    }
}.call(this));
