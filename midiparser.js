/**
 * MidiParser v1.0 - A very simple event-driven Midi messages parser for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 *
 * Messages: http://www.midi.org/techspecs/midimessages.php
 * GM1 Sound Set: http://www.midi.org/techspecs/gm1sound.php
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // GM1 drum note names
    var _gm1drums = {
        0x23: 'Acoustic Bass Drum',
        0x24: 'Bass Drum 1',
        0x25: 'Side Stick',
        0x26: 'Acoustic Snare',
        0x27: 'Hand Clap',
        0x28: 'Electric Snare',
        0x29: 'Low Floor Tom',
        0x2A: 'Closed Hi Hat',
        0x2B: 'High Floor Tom',
        0x2C: 'Pedal Hi-Hat',
        0x2D: 'Low Tom',
        0x2E: 'Open Hi-Hat',
        0x2F: 'Low-Mid Tom',
        0x30: 'Hi-Mid Tom',
        0x31: 'Crash Cymbal 1',
        0x32: 'High Tom',
        0x33: 'Ride Cymbal 1',
        0x34: 'Chinese Cymbal',
        0x35: 'Ride Bell',
        0x36: 'Tambourine',
        0x37: 'Splash Cymbal',
        0x38: 'Cowbell',
        0x39: 'Crash Cymbal 2',
        0x3A: 'Vibraslap',
        0x3B: 'Ride Cymbal 2',
        0x3C: 'Hi Bongo',
        0x3D: 'Low Bongo',
        0x3E: 'Mute Hi Conga',
        0x3F: 'Open Hi Conga',
        0x40: 'Low Conga',
        0x41: 'High Timbale',
        0x42: 'Low Timbale',
        0x43: 'High Agogo',
        0x44: 'Low Agogo',
        0x45: 'Cabasa',
        0x46: 'Maracas',
        0x47: 'Short Whistle',
        0x48: 'Long Whistle',
        0x49: 'Short Guiro',
        0x4A: 'Long Guiro',
        0x4B: 'Claves',
        0x4C: 'Hi Wood Block',
        0x4D: 'Low Wood Block',
        0x4E: 'Mute Cuica',
        0x4F: 'Open Cuica',
        0x50: 'Mute Triangle',
        0x51: 'Open Triangle'
    };

    // GM1 note names
    var _gm1notes = {
        0x00: 'C-2',
        0x01: 'C#-2',
        0x02: 'D-2',
        0x03: 'D#-2',
        0x04: 'E-2',
        0x05: 'F-2',
        0x06: 'F#-2',
        0x07: 'G-2',
        0x08: 'G#-2',
        0x09: 'A-2',
        0x0A: 'A#-2',
        0x0B: 'B-2',
        0x0C: 'C-1',
        0x0D: 'C#-1',
        0x0E: 'D-1',
        0x0F: 'D#-1',
        0x10: 'E-1',
        0x11: 'F-1',
        0x12: 'F#-1',
        0x13: 'G-1',
        0x14: 'G#-1',
        0x15: 'A-1',
        0x16: 'A#-1',
        0x17: 'B-1',
        0x18: 'C0',
        0x19: 'C#0',
        0x1A: 'D0',
        0x1B: 'D#0',
        0x1C: 'E0',
        0x1D: 'F0',
        0x1E: 'F#0',
        0x1F: 'G0',
        0x20: 'G#0',
        0x21: 'A0',
        0x22: 'A#0',
        0x23: 'B0',
        0x24: 'C1',
        0x25: 'C#1',
        0x26: 'D1',
        0x27: 'D#1',
        0x28: 'E1',
        0x29: 'F1',
        0x2A: 'F#1',
        0x2B: 'G1',
        0x2C: 'G#1',
        0x2D: 'A1',
        0x2E: 'A#1',
        0x2F: 'B1',
        0x30: 'C2',
        0x31: 'C#2',
        0x32: 'D2',
        0x33: 'D#2',
        0x34: 'E2',
        0x35: 'F2',
        0x36: 'F#2',
        0x37: 'G2',
        0x38: 'G#2',
        0x39: 'A2',
        0x3A: 'A#2',
        0x3B: 'B2',
        0x3C: 'C3',
        0x3D: 'C#3',
        0x3E: 'D3',
        0x3F: 'D#3',
        0x40: 'E3',
        0x41: 'F3',
        0x42: 'F#3',
        0x43: 'G3',
        0x44: 'G#3',
        0x45: 'A3',
        0x46: 'A#3',
        0x47: 'B3',
        0x48: 'C4',
        0x49: 'C#4',
        0x4A: 'D4',
        0x4B: 'D#4',
        0x4C: 'E4',
        0x4D: 'F4',
        0x4E: 'F#4',
        0x4F: 'G4',
        0x50: 'G#4',
        0x51: 'A4',
        0x52: 'A#4',
        0x53: 'B4',
        0x54: 'C5',
        0x55: 'C#5',
        0x56: 'D5',
        0x57: 'D#5',
        0x58: 'E5',
        0x59: 'F5',
        0x5A: 'F#5',
        0x5B: 'G5',
        0x5C: 'G#5',
        0x5D: 'A5',
        0x5E: 'A#5',
        0x5F: 'B5',
        0x60: 'C6',
        0x61: 'C#6',
        0x62: 'D6',
        0x63: 'D#6',
        0x64: 'E6',
        0x65: 'F6',
        0x66: 'F#6',
        0x67: 'G6',
        0x68: 'G#6',
        0x69: 'A6',
        0x6A: 'A#6',
        0x6B: 'B6',
        0x6C: 'C7',
        0x6D: 'C#7',
        0x6E: 'D7',
        0x6F: 'D#7',
        0x70: 'E7',
        0x71: 'F7',
        0x72: 'F#7',
        0x73: 'G7',
        0x74: 'G#7',
        0x75: 'A7',
        0x76: 'A#7',
        0x77: 'B7',
        0x78: 'C8',
        0x79: 'C#8',
        0x7A: 'D8',
        0x7B: 'D#8',
        0x7C: 'E8',
        0x7D: 'F8',
        0x7E: 'F#8',
        0x7F: 'G8'
    };

    // GM1 family names
    var _gm1families = {
        0x00: 'Piano',
        0x08: 'Chromatic Percussion',
        0x10: 'Organ',
        0x18: 'Guitar',
        0x20: 'Bass',
        0x28: 'Strings',
        0x30: 'Ensemble',
        0x38: 'Brass',
        0x40: 'Reed',
        0x48: 'Pipe',
        0x50: 'Synth Lead',
        0x58: 'Synth Pad',
        0x60: 'Synth Effects',
        0x68: 'Ethnic',
        0x70: 'Percussive',
        0x78: 'Sound Effects'
    };

    // GM1 program names
    var _gm1programs = {
        0x00: 'Acoustic Grand Piano',
        0x01: 'Bright Acoustic Piano',
        0x02: 'Electric Grand Piano',
        0x03: 'Honky-tonk Piano',
        0x04: 'Electric Piano 1',
        0x05: 'Electric Piano 2',
        0x06: 'Harpsichord',
        0x07: 'Clavi',
        0x08: 'Celesta',
        0x09: 'Glockenspiel',
        0x0A: 'Music Box',
        0x0B: 'Vibraphone',
        0x0C: 'Marimba',
        0x0D: 'Xylophone',
        0x0E: 'Tubular Bells',
        0x0F: 'Dulcimer',
        0x10: 'Drawbar Organ',
        0x11: 'Percussive Organ',
        0x12: 'Rock Organ',
        0x13: 'Church Organ',
        0x14: 'Reed Organ',
        0x15: 'Accordion',
        0x16: 'Harmonica',
        0x17: 'Tango Accordion',
        0x18: 'Acoustic Guitar (nylon)',
        0x19: 'Acoustic Guitar (steel)',
        0x1A: 'Electric Guitar (jazz)',
        0x1B: 'Electric Guitar (clean)',
        0x1C: 'Electric Guitar (muted)',
        0x1D: 'Overdriven Guitar',
        0x1E: 'Distortion Guitar',
        0x1F: 'Guitar harmonics',
        0x20: 'Acoustic Bass',
        0x21: 'Electric Bass (finger)',
        0x22: 'Electric Bass (pick)',
        0x23: 'Fretless Bass',
        0x24: 'Slap Bass 1',
        0x25: 'Slap Bass 2',
        0x26: 'Synth Bass 1',
        0x27: 'Synth Bass 2',
        0x28: 'Violin',
        0x29: 'Viola',
        0x2A: 'Cello',
        0x2B: 'Contrabass',
        0x2C: 'Tremolo Strings',
        0x2D: 'Pizzicato Strings',
        0x2E: 'Orchestral Harp',
        0x2F: 'Timpani',
        0x30: 'String Ensemble 1',
        0x31: 'String Ensemble 2',
        0x32: 'SynthStrings 1',
        0x33: 'SynthStrings 2',
        0x34: 'Choir Aahs',
        0x35: 'Voice Oohs',
        0x36: 'Synth Voice',
        0x37: 'Orchestra Hit',
        0x38: 'Trumpet',
        0x39: 'Trombone',
        0x3A: 'Tuba',
        0x3B: 'Muted Trumpet',
        0x3C: 'French Horn',
        0x3D: 'Brass Section',
        0x3E: 'SynthBrass 1',
        0x3F: 'SynthBrass 2',
        0x40: 'Soprano Sax',
        0x41: 'Alto Sax',
        0x42: 'Tenor Sax',
        0x43: 'Baritone Sax',
        0x44: 'Oboe',
        0x45: 'English Horn',
        0x46: 'Bassoon',
        0x47: 'Clarinet',
        0x48: 'Piccolo',
        0x49: 'Flute',
        0x4A: 'Recorder',
        0x4B: 'Pan Flute',
        0x4C: 'Blown Bottle',
        0x4D: 'Shakuhachi',
        0x4E: 'Whistle',
        0x4F: 'Ocarina',
        0x50: 'Lead 1 (square)',
        0x51: 'Lead 2 (sawtooth)',
        0x52: 'Lead 3 (calliope)',
        0x53: 'Lead 4 (chiff)',
        0x54: 'Lead 5 (charang)',
        0x55: 'Lead 6 (voice)',
        0x56: 'Lead 7 (fifths)',
        0x57: 'Lead 8 (bass + lead)',
        0x58: 'Pad 1 (new age)',
        0x59: 'Pad 2 (warm)',
        0x5A: 'Pad 3 (polysynth)',
        0x5B: 'Pad 4 (choir)',
        0x5C: 'Pad 5 (bowed)',
        0x5D: 'Pad 6 (metallic)',
        0x5E: 'Pad 7 (halo)',
        0x5F: 'Pad 8 (sweep)',
        0x60: 'FX 1 (rain)',
        0x61: 'FX 2 (soundtrack)',
        0x62: 'FX 3 (crystal)',
        0x63: 'FX 4 (atmosphere)',
        0x64: 'FX 5 (brightness)',
        0x65: 'FX 6 (goblins)',
        0x66: 'FX 7 (echoes)',
        0x67: 'FX 8 (sci-fi)',
        0x68: 'Sitar',
        0x69: 'Banjo',
        0x6A: 'Shamisen',
        0x6B: 'Koto',
        0x6C: 'Kalimba',
        0x6D: 'Bag pipe',
        0x6E: 'Fiddle',
        0x6F: 'Shanai',
        0x70: 'Tinkle Bell',
        0x71: 'Agogo',
        0x72: 'Steel Drums',
        0x73: 'Woodblock',
        0x74: 'Taiko Drum',
        0x75: 'Melodic Tom',
        0x76: 'Synth Drum',
        0x77: 'Reverse Cymbal',
        0x78: 'Guitar Fret Noise',
        0x79: 'Breath Noise',
        0x7A: 'Seashore',
        0x7B: 'Bird Tweet',
        0x7C: 'Telephone Ring',
        0x7D: 'Helicopter',
        0x7E: 'Applause',
        0x7F: 'Gunshot',
    };

    // Constructor
    function MidiParser() {
        EventEmitter.call(this);
    }

    // We are an event emitter
    MidiParser.prototype = Object.create(EventEmitter.prototype);

    // Prototype shortcut
    var proto = MidiParser.prototype;

    // Get a GM1 drum note name
    proto.getGM1DrumNoteName = function (note) {
        return _gm1drums[note];
    }

    // Get a GM1 note name
    proto.getGM1NoteName = function (note) {
        return _gm1notes[note];
    }

    // Get a GM1 program family name
    proto.getGM1FamilyName = function (number) {
        return _gm1families[Math.floor(number / 0x8) * 0x8];
    }

    // Get a GM1 program name
    proto.getGM1ProgramName = function (number) {
        return _gm1programs[number];
    }

    // Parse the bytes of a Midi message and emit parsing events
    proto.parse = function (bytes) {
        if (bytes instanceof Uint8Array && bytes.length > 0) {
            var status = bytes[0] & 0xF0;
            var channel = bytes[0] & 0x0F;
            switch (status) {
                case 0x80: // Note Off event
                    if (bytes.length > 1) {
                        var note = bytes[1] & 0x7F;
                        var velocity = bytes[2] & 0x7F;
                        this.emit('note-off', channel, note, velocity);
                    }
                    return;
                case 0x90: // Note On event
                    if (bytes.length > 2) {
                        var note = bytes[1] & 0x7F;
                        var velocity = bytes[2] & 0x7F;
                        if (velocity > 0x00)
                            this.emit('note-on', channel, note, velocity);
                        else
                            this.emit('note-off', channel, note, velocity);
                    }
                    return;
                case 0xA0: // Polyphonic Key Pressure (Aftertouch)
                    if (bytes.length > 2) {
                        var note = bytes[1] & 0x7F;
                        var pressure = bytes[2] & 0x7F;
                        this.emit('key-pressure', channel, note, pressure);
                    }
                    return;
                case 0xB0: // Control Change
                    if (bytes.length > 2) {
                        var control = bytes[1] & 0x7F;
                        var value = bytes[2] & 0x7F;
                        switch (control) {
                            case 0x00: // Bank Select (MSB)
                                this.emit('bank-select', channel, value);
                                return;
                            case 0x01: // Modulation Wheel (MSB)
                                this.emit('mod-wheel', channel, value);
                                return;
                            case 0x02: // Breath Controller (MSB)
                                this.emit('breath-controller', channel, value);
                                return;
                            case 0x04: // Foot Controller (MSB)
                                this.emit('foot-controller', channel, value);
                                return;
                            case 0x05: // Portamento Time (MSB)
                                this.emit('portamento-time', channel, value);
                                return;
                            case 0x07: // Channel Volume (MSB)
                                this.emit('volume', channel, value);
                                return;
                            case 0x08: // Balance (MSB)
                                this.emit('balance', channel, value);
                                return;
                            case 0x0A: // Pan (MSB)
                                this.emit('pan', channel, value);
                                return;
                            case 0x0B: // Expression Controller (MSB)
                                this.emit('expression-controller', channel, value);
                                return;
                            case 0x0C: // Effect Control 1 (MSB)
                                this.emit('effect-control-1', channel, value);
                                return;
                            case 0x0D: // Effect Control 2 (MSB)
                                this.emit('effect-control-2', channel, value);
                                return;
                            case 0x10: // General Purpose Controller 1 (MSB)
                                this.emit('gp-controller-1', channel, value);
                                return;
                            case 0x11: // General Purpose Controller 2 (MSB)
                                this.emit('gp-controller-2', channel, value);
                                return;
                            case 0x12: // General Purpose Controller 3 (MSB)
                                this.emit('gp-controller-3', channel, value);
                                return;
                            case 0x13: // General Purpose Controller 4 (MSB)
                                this.emit('gp-controller-4', channel, value);
                                return;
                            case 0x20: // Bank Select (LSB)
                                this.emit('bank-select-fine', channel, value);
                                return;
                            case 0x21: // Modulation Wheel (LSB)
                                this.emit('mod-wheel-fine', channel, value);
                                return;
                            case 0x22: // Breath Controller (LSB)
                                this.emit('breath-controller-fine', channel, value);
                                return;
                            case 0x24: // Foot Controller (LSB)
                                this.emit('foot-controller-fine', channel, value);
                                return;
                            case 0x25: // Portamento Time (LSB)
                                this.emit('portamento-time-fine', channel, value);
                                return;
                            case 0x27: // Channel Volume (LSB)
                                this.emit('volume-fine', channel, value);
                                return;
                            case 0x28: // Balance (LSB)
                                this.emit('balance-fine', channel, value);
                                return;
                            case 0x2A: // Pan (LSB)
                                this.emit('pan-fine', channel, value);
                                return;
                            case 0x2B: // Expression Controller (LSB)
                                this.emit('expression-controller-fine', channel, value);
                                return;
                            case 0x2C: // Effect Control 1 (LSB)
                                this.emit('effect-control-1-fine', channel, value);
                                return;
                            case 0x2D: // Effect Control 2 (LSB)
                                this.emit('effect-control-2-fine', channel, value);
                                return;
                            case 0x30: // General Purpose Controller 1 (LSB)
                                this.emit('gp-controller-1-fine', channel, value);
                                return;
                            case 0x31: // General Purpose Controller 2 (LSB)
                                this.emit('gp-controller-2-fine', channel, value);
                                return;
                            case 0x32: // General Purpose Controller 3 (LSB)
                                this.emit('gp-controller-3-fine', channel, value);
                                return;
                            case 0x33: // General Purpose Controller 4 (LSB)
                                this.emit('gp-controller-4-fine', channel, value);
                                return;
                            case 0x40: // Damper Pedal (Sustain)
                                if (value < 0x40)
                                    this.emit('damper-off', channel);
                                else
                                    this.emit('damper-on', channel);
                                return;
                            case 0x41: // Portamento
                                if (value < 0x40)
                                    this.emit('portamento-off', channel);
                                else
                                    this.emit('portamento-on', channel);
                                return;
                            case 0x42: // Sostenuto
                                if (value < 0x40)
                                    this.emit('sostenuto-off', channel);
                                else
                                    this.emit('sostenuto-on', channel);
                                return;
                            case 0x43: // Soft Pedal
                                if (value < 0x40)
                                    this.emit('soft-off', channel);
                                else
                                    this.emit('soft-on', channel);
                                return;
                            case 0x44: // Legato Footswitch
                                if (value < 0x40)
                                    this.emit('legato-off', channel);
                                else
                                    this.emit('legato-on', channel);
                                return;
                            case 0x45: // Hold 2
                                if (value < 0x40)
                                    this.emit('hold2-off', channel);
                                else
                                    this.emit('hold2-on', channel);
                                return;
                            case 0x46: // Sound Controller 1
                                this.emit('sound-variation', channel, value);
                                return;
                            case 0x47: // Sound Controller 2
                                this.emit('timbre-intensity', channel, value);
                                return;
                            case 0x48: // Sound Controller 3
                                this.emit('release-time', channel, value);
                                return;
                            case 0x49: // Sound Controller 4
                                this.emit('attack-time', channel, value);
                                return;
                            case 0x4A: // Sound Controller 5
                                this.emit('brightness', channel, value);
                                return;
                            case 0x4B: // Sound Controller 6
                                this.emit('decay-time', channel, value);
                                return;
                            case 0x4C: // Sound Controller 7
                                this.emit('vibrato-rate', channel, value);
                                return;
                            case 0x4D: // Sound Controller 8
                                this.emit('vibrato-depth', channel, value);
                                return;
                            case 0x4E: // Sound Controller 9
                                this.emit('vibrato-delay', channel, value);
                                return;
                            case 0x4F: // Sound Controller 10
                                this.emit('snd-controller-10', channel, value);
                                return;
                            case 0x50: // General Purpose Controller 5
                                this.emit('gp-controller-5', channel, value);
                                return;
                            case 0x51: // General Purpose Controller 6
                                this.emit('gp-controller-6', channel, value);
                                return;
                            case 0x52: // General Purpose Controller 7
                                this.emit('gp-controller-7', channel, value);
                                return;
                            case 0x53: // General Purpose Controller 8
                                this.emit('gp-controller-8', channel, value);
                                return;
                            case 0x54: // Portamento Control
                                this.emit('portamento', channel, value);
                                return;
                            case 0x5B: // Effects 1 Depth
                                this.emit('reverb-depth', channel, value);
                                return;
                            case 0x5C: // Effects 2 Depth
                                this.emit('tremolo-depth', channel, value);
                                return;
                            case 0x5D: // Effects 3 Depth
                                this.emit('chorus-depth', channel, value);
                                return;
                            case 0x5E: // Effects 4 Depth
                                this.emit('detune-depth', channel, value);
                                return;
                            case 0x5F: // Effects 5 Depth
                                this.emit('phaser-depth', channel, value);
                                return;
                            case 0x78: // All Sound Off
                                this.emit('all-sound-off', channel);
                                return;
                            case 0x79: // Reset All Controllers
                                this.emit('reset-all-controllers', channel);
                                return;
                            case 0x7B: // All Notes Off
                                this.emit('all-notes-off', channel);
                                return;
                        }
                    }
                    this.emit('unknown-control-change', channel, control, value);
                    return;
                case 0xC0: // Program Change
                    if (bytes.length > 1) {
                        var number = bytes[1] & 0x7F;
                        this.emit('program-change', channel, number);
                    }
                    return;
                case 0xD0: // Channel Pressure (After-touch)
                    if (bytes.length > 1) {
                        var pressure = bytes[1] & 0x7F;
                        this.emit('channel-pressure', channel, pressure);
                    }
                    return;
                case 0xE0: // Pitch Bend Change
                    if (bytes.length > 2) {
                        var msb = bytes[1] & 0x7F;
                        var lsb = bytes[2] & 0x7F;
                        this.emit('pitch-bend', channel, (msb << 7) + lsb);
                    }
                    return;
            }
            this.emit('unknown-message', bytes);
            return;
        }
    }

    // Expose either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return MidiParser;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = MidiParser;
    }
    else {
        this.MidiParser = MidiParser;
    }
}.call(this));
