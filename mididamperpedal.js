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

        // Setup event handlers
        this._handlers = {
            'note-on': undefined,
            'note-off': undefined,
            'sustain-on': undefined,
            'sustain-off': undefined
        };
    }

    // Cache variable for prototype
    var proto = MidiDamperPedal.prototype;

    // Assign an event handler to a pedalling event
    proto.on = function (event, handler) {
        if (typeof handler === 'function' && this._handlers.hasOwnProperty(event))
            this._handlers[event] = handler;
    }

    // Emit pedalling events
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
                case 'note-on':
                    this._handlers[event](data1, data2, data3);
                    break;
                default:
            }
        }
    }

    // Simulate pressing the damper pedal
    proto.press = function (channel) {
        if (channel < 0 || channel > 15)
            return;
        this._pedals[channel].pressed = true;
        this.emit('sustain-on', channel);
    }

    // Simulate releasing the damper pedal
    proto.release = function (channel) {
        if (channel < 0 || channel > 15)
            return;
        this._pedals[channel].pressed = false;
        for (var note in this._pedals[channel].heldNotes) {
            if (this._pedals[channel].heldNotes[note]) {
                this.emit('note-off', channel, note);
                this._pedals[channel].heldNotes[note] = false;
            }
        }
        this.emit('sustain-off', channel);
    }

    // Process a Midi Note On message
    proto.noteOn = function (channel, note, velocity) {
        if (channel < 0 || channel > 15 || note < 0 || note > 127 || velocity < 0 || velocity > 127)
            return;
        if (this._pedals[channel].heldNotes[note])
            this._pedals[channel].heldNotes[note] = false;
        this.emit('note-on', channel, note, velocity);
    }

    // Process a Midi Note Off message
    proto.noteOff = function (channel, note) {
        if (channel < 0 || channel > 15 || note < 0 || note > 127)
            return;
        if (this._pedals[channel].pressed)
            this._pedals[channel].heldNotes[note] = true;
        else
            this.emit('note-off', channel, note);
    }

    // Expose the class either via AMD, CommonJS or the global object
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
