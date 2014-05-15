/**
 * MidiSostenutoPedal v1.0 - A very simple event-driven Midi Sostenuto Pedal processor for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Constructor
    function MidiSostenutoPedal() {
        EventEmitter.call(this);
        this._pressed = 0x0000;
        this._prePedalNotes = new Array(16);
        this._pedalNotes = new Array(16);
        this._heldNotes = new Array(16);
        for (var i=0; i<16; i++) {
            this._prePedalNotes[i] = new Uint32Array(4);
            this._pedalNotes[i] = new Uint32Array(4);
            this._heldNotes[i] = new Uint32Array(4);
        }
    }

    // We are an event emitter
    MidiSostenutoPedal.prototype = Object.create(EventEmitter.prototype);

    // Prototype shortcut
    var proto = MidiSostenutoPedal.prototype;

    // Simulate pressing the sostenuto pedal
    proto.press = function (channel) {
        this._pressed |= 1 << (channel & 0xF);
        for (var i=0; i<4; i++) // Transfer all channel pre-pedal notes to pedal notes
            this._pedalNotes[channel & 0xF][i] = this._prePedalNotes[channel & 0xF][i];
    }

    // Simulate releasing the sostenuto pedal
    proto.release = function (channel) {
        this._pressed &= ~(1 << (channel & 0xF));
        for (var i=0; i<128; i++) { // Send Note Off messages for all channel held notes
            this._pedalNotes[channel & 0xF][i / 32] &= ~(1 << (i % 32)); // Reset channel pedal notes
            if ((this._heldNotes[channel & 0xF][i / 32] >> (i % 32)) & 1) {
                this._heldNotes[channel & 0xF][i / 32] &= ~(1 << (i % 32));
                this.emit('note-off', channel, i, 0x00);
            }
        }
    }

    // Process a Midi Note On message
    proto.noteOn = function (channel, note, velocity) {
        this._prePedalNotes[channel & 0xF][(note & 0x7F) / 32] |= 1 << ((note & 0x7F) % 32); // Remember as channel pre-pedal note
        if ((this._pressed >> (channel & 0xF)) & 1) // If pedal pressed, reset channel held note
            this._heldNotes[channel & 0xF][(note & 0x7F) / 32] &= ~(1 << ((note & 0x7F) % 32));
        this.emit('note-on', channel, note, velocity);
    }

    // Process a Midi Note Off message
    proto.noteOff = function (channel, note, velocity) {
        this._prePedalNotes[channel & 0xF][(note & 0x7F) / 32] &= ~(1 << ((note & 0x7F) % 32)); // Reset channel pre-pedal note
        if (((this._pressed >> (channel & 0xF)) & 1) && ((this._pedalNotes[channel & 0xF][(note & 0x7F) / 32] >> ((note & 0x7F) % 32)) & 1))
            this._heldNotes[channel & 0xF][(note & 0x7F) / 32] |= 1 << ((note & 0x7F) % 32);
        else
            this.emit('note-off', channel, note, velocity);
    }

    // Expose either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return MidiSostenutoPedal;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = MidiSostenutoPedal;
    }
    else {
        this.MidiSostenutoPedal = MidiSostenutoPedal;
    }
}.call(this));
