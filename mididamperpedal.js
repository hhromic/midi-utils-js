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
        this._pedals[channel & 0xF].pressed = true;
    }

    // Simulate releasing the damper pedal
    proto.release = function (channel) {
        this._pedals[channel & 0xF].pressed = false;
        for (var note in this._pedals[channel].heldNotes) {
            if (this._pedals[channel & 0xF].heldNotes[note]) {
                this._pedals[channel & 0xF].heldNotes[note] = false;
                this.emit('note-off', channel, note);
            }
        }
    }

    // Process a Midi Note On message
    proto.noteOn = function (channel, note, velocity) {
        if (this._pedals[channel & 0xF].heldNotes[note & 0x7F])
            this._pedals[channel & 0xF].heldNotes[note & 0x7F] = false;
        this.emit('note-on', channel, note, velocity);
    }

    // Process a Midi Note Off message
    proto.noteOff = function (channel, note) {
        if (this._pedals[channel & 0xF].pressed)
            this._pedals[channel & 0xF].heldNotes[note & 0x7F] = true;
        else
            this.emit('note-off', channel, note);
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
