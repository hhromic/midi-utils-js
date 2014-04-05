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

        // Create a note slots object to be cloned
        var noteSlots = [];
        for (var i=0; i<128; i++)
            noteSlots[i] = false;

        // Create internal pedals state object
        this._pedals = [];
        for (var i=0; i<16; i++) {
            this._pedals[i] = {
                pressed: false,
                heldNotes: Object.create(noteSlots)
            };
        }
    }

    // We are an event emitter
    MidiDamperPedal.prototype = Object.create(EventEmitter.prototype);

    // Prototype shortcut
    var proto = MidiDamperPedal.prototype;

    // Simulate pressing the damper pedal
    proto.press = function (channel) {
        if (channel < 0x0 || channel > 0xF)
            return false;
        this._pedals[channel].pressed = true;
        this.emit('damper-on', channel);
        return true;
    }

    // Simulate releasing the damper pedal
    proto.release = function (channel) {
        if (channel < 0x0 || channel > 0xF)
            return false;
        this._pedals[channel].pressed = false;
        for (var note in this._pedals[channel].heldNotes) {
            if (this._pedals[channel].heldNotes[note]) {
                this._pedals[channel].heldNotes[note] = false;
                this.emit('note-off', channel, note);
            }
        }
        this.emit('damper-off', channel);
        return true;
    }

    // Process a Midi Note On message
    proto.noteOn = function (channel, note, velocity) {
        if (channel < 0x0 || channel > 0xF || note < 0x00 || note > 0x7F || velocity < 0x00 || velocity > 0x7F)
            return false;
        if (this._pedals[channel].heldNotes[note])
            this._pedals[channel].heldNotes[note] = false;
        this.emit('note-on', channel, note, velocity);
        return true;
    }

    // Process a Midi Note Off message
    proto.noteOff = function (channel, note) {
        if (channel < 0x0 || channel > 0xF || note < 0x00 || note > 0x7F)
            return false;
        if (this._pedals[channel].pressed)
            this._pedals[channel].heldNotes[note] = true;
        else
            this.emit('note-off', channel, note);
        return true;
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
