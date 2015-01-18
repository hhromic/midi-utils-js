/**
 * MidiSoftPedal v1.0 - https://github.com/hhromic/midi-utils-js
 * A very simple event-driven MIDI soft pedal emulator for JavaScript.
 * MIT license
 * Hugo Hromic - http://github.com/hhromic
 *
 * @requires EventEmitter
 */
/*jslint nomen: true*/

;(function () {
    'use strict';

    /**
     * Represents a MIDI soft pedal emulator.
     *
     * @public
     * @constructor
     */
    function MidiSoftPedal() {
        EventEmitter.call(this);
        this._softenFactor = 2/3;
        this._pressed = 0x0000;
    }

    // We are an event emitter
    MidiSoftPedal.prototype = Object.create(EventEmitter.prototype);

    // Shortcuts to improve speed and size
    var proto = MidiSoftPedal.prototype;

    /**
     * Gets the current soften factor of the pedal.
     *
     * @public
     * @returns {number} - the current soften factor [0,1].
     */
    proto.getSoftenFactor = function () {
        return this._softenFactor;
    }

    /**
     * Sets the soften factor for the pedal.
     *
     * @public
     * @param {number} softenFactor - the soften factor to set [0,1].
     */
    // Set the soften factor [0,1] for the pedal
    proto.setSoftenFactor = function (softenFactor) {
        if (softenFactor >= 0 && softenFactor <= 1)
            this._softenFactor = softenFactor;
    }

    /**
     * Simulates pressing the soft pedal.
     *
     * @public
     * @param {number} channel - the MIDI channel.
     */
    proto.press = function (channel) {
        this._pressed |= 1 << (channel & 0xF);
    }

    /**
     * Simulates releasing (depressing) the soft pedal.
     *
     * @public
     * @param {number} channel - the MIDI channel.
     */
    proto.release = function (channel) {
        this._pressed &= ~(1 << (channel & 0xF));
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
        if ((this._pressed >> (channel & 0xF)) & 1)
            this.emit('note-on', channel, note, Math.round(velocity * this._softenFactor));
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
