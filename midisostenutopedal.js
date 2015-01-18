/**
 * MidiSostenutoPedal v1.0 - https://github.com/hhromic/midi-utils-js
 * A very simple event-driven MIDI sostenuto pedal emulator for JavaScript.
 * MIT license
 * Hugo Hromic - http://github.com/hhromic
 *
 * @requires EventEmitter
 */
/*jslint nomen: true*/

;(function () {
    'use strict';

    /**
     * Represents a MIDI sostenuto pedal emulator.
     *
     * @public
     * @constructor
     */
    function MidiSostenutoPedal() {
        EventEmitter.call(this);
        this._pressed = 0x0000;
        this._prePedalNotes = new Array(16);
        this._pedalNotes = new Array(16);
        this._heldNotes = new Array(16);
        for (var i=16; i--;) {
            this._prePedalNotes[i] = new Uint32Array(4);
            this._pedalNotes[i] = new Uint32Array(4);
            this._heldNotes[i] = new Uint32Array(4);
        }
    }

    // We are an event emitter
    MidiSostenutoPedal.prototype = Object.create(EventEmitter.prototype);

    // Shortcuts to improve speed and size
    var proto = MidiSostenutoPedal.prototype;

    /**
     * Simulates pressing the sostenuto pedal.
     *
     * @public
     * @param {number} channel - the MIDI channel.
     */
    proto.press = function (channel) {
        this._pressed |= 1 << (channel & 0xF);
        for (var i=4; i--;) // Transfer all channel pre-pedal notes to pedal notes
            this._pedalNotes[channel & 0xF][i] = this._prePedalNotes[channel & 0xF][i];
    }

    /**
     * Simulates releasing (depressing) the sostenuto pedal.
     *
     * @public
     * @param {number} channel - the MIDI channel.
     */
    proto.release = function (channel) {
        this._pressed &= ~(1 << (channel & 0xF));
        for (var i=128; i--;) { // Send Note Off messages for all channel held notes
            this._pedalNotes[channel & 0xF][i / 32] &= ~(1 << (i % 32)); // Reset channel pedal notes
            if ((this._heldNotes[channel & 0xF][i / 32] >> (i % 32)) & 1) {
                this._heldNotes[channel & 0xF][i / 32] &= ~(1 << (i % 32));
                this.emit('note-off', channel, i, 0x00);
            }
        }
    }

    /**
     * Processes and forwards a MIDI Note-On message.
     *
     * @public
     * @param {number} channel - the MIDI channel.
     * @param {number} note - the MIDI note.
     * @param {number} velocity - the velocity of the MIDI note.
     */
    proto.noteOn = function (channel, note, velocity) {
        this._prePedalNotes[channel & 0xF][(note & 0x7F) / 32] |= 1 << ((note & 0x7F) % 32); // Remember as channel pre-pedal note
        if ((this._pressed >> (channel & 0xF)) & 1) // If pedal pressed, reset channel held note
            this._heldNotes[channel & 0xF][(note & 0x7F) / 32] &= ~(1 << ((note & 0x7F) % 32));
        this.emit('note-on', channel, note, velocity);
    }

    /**
     * Processes and forwards (if necessary) a MIDI Note-Off message.
     *
     * @public
     * @param {number} channel - the MIDI channel.
     * @param {number} note - the MIDI note.
     * @param {number} velocity - the velocity of the MIDI note.
     */
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
