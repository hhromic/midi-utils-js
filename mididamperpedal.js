/**
 * MidiDamperPedal v1.0 - https://github.com/hhromic/midi-utils-js
 * A very simple event-driven MIDI damper pedal emulator for JavaScript.
 * MIT license
 * Hugo Hromic - http://github.com/hhromic
 *
 * @requires EventEmitter
 */
/*jslint nomen: true */

;(function () {
    'use strict';

    /**
     * Represents a MIDI damper pedal emulator.
     *
     * @public
     * @constructor
     */
    function MidiDamperPedal() {
        EventEmitter.call(this);
        this._pressed = 0x0000;
        this._heldNotes = new Array(16);
        for (var i=16; i--;)
            this._heldNotes[i] = new Uint32Array(4);
    }

    // We are an event emitter
    MidiDamperPedal.prototype = Object.create(EventEmitter.prototype);

    // Shortcuts to improve speed and size
    var proto = MidiDamperPedal.prototype;

    /**
     * Simulates pressing the damper pedal.
     *
     * @public
     * @param {number} channel - the MIDI channel.
     */
    proto.press = function (channel) {
        this._pressed |= 1 << (channel & 0xF);
    }

    /**
     * Simulates releasing (depressing) the damper pedal.
     *
     * @public
     * @param {number} channel - the MIDI channel.
     */
    proto.release = function (channel) {
        this._pressed &= ~(1 << (channel & 0xF));
        for (var i=128; i--;) { // Send Note-Off messages for all held notes of the channel
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
        if ((this._heldNotes[channel & 0xF][(note & 0x7F) / 32] >> ((note & 0x7F) % 32)) & 1)
            this._heldNotes[channel & 0xF][(note & 0x7F) / 32] &= ~(1 << ((note & 0x7F) % 32)); // Reset channel held note
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
        if ((this._pressed >> (channel & 0xF)) & 1) // If pedal pressed, hold channel Note-Off message
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
