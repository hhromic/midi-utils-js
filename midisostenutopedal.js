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

        // Create a note slots object to be cloned
        var noteSlots = [];
        for (var i=0; i<128; i++)
            noteSlots[i] = false;

        // Create internal pedals state object
        this._pedals = [];
        for (var i=0; i<16; i++) {
            this._pedals[i] = {
                pressed: false,
                prePedalNotes: Object.create(noteSlots),
                pedalNotes: Object.create(noteSlots),
                heldNotes: Object.create(noteSlots)
            };
        }
    }

    // We are an event emitter
    MidiSostenutoPedal.prototype = Object.create(EventEmitter.prototype);

    // Prototype shortcut
    var proto = MidiSostenutoPedal.prototype;

    // Simulate pressing the sostenuto pedal
    proto.press = function (channel) {
        this._pedals[channel & 0xF].pressed = true;
        for (var note in this._pedals[channel & 0xF].prePedalNotes)
            if (this._pedals[channel & 0xF].prePedalNotes[note])
                this._pedals[channel & 0xF].pedalNotes[note] = true;
    }

    // Simulate releasing the sostenuto pedal
    proto.release = function (channel) {
        this._pedals[channel & 0xF].pressed = false;
        for (var note in this._pedals[channel & 0xF].pedalNotes) {
            this._pedals[channel & 0xF].pedalNotes[note] = false;
            if (this._pedals[channel & 0xF].heldNotes[note]) {
                this._pedals[channel & 0xF].heldNotes[note] = false;
                this.emit('note-off', channel, note);
            }
        }
    }

    // Process a Midi Note On message
    proto.noteOn = function (channel, note, velocity) {
        this._pedals[channel & 0xF].prePedalNotes[note & 0x7F] = true;
        if (this._pedals[channel & 0xF].pressed)
            this._pedals[channel & 0xF].heldNotes[note & 0x7F] = false;
        this.emit('note-on', channel, note, velocity);
    }

    // Process a Midi Note Off message
    proto.noteOff = function (channel, note) {
        this._pedals[channel & 0xF].prePedalNotes[note & 0x7F] = false;
        if (this._pedals[channel & 0xF].pressed && this._pedals[channel & 0xF].pedalNotes[note & 0x7F])
            this._pedals[channel & 0xF].heldNotes[note & 0x7F] = true;
        else
            this.emit('note-off', channel, note);
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
