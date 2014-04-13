/**
 * MidiLeds v1.0 - An ADSR/canvas-based Midi Leds display for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Default settings
    var _defaults = {
        attackTime: 1000, // in milliseconds
        decayTime: 3000, // in milliseconds
        sustainLevel: 0.5, // 0..1 (float)
        releaseTime: 500, // in milliseconds
        colorMapper: 0, // 0..1
        noteColorMap: 0, // 0..12
        ignoreVelocity: false,
        baseBrightness: 0x00, // 0x00..0xFF
    };

    // Color mappers
    var _colorMappers = [
        function (instance, note, velocity) { // Note color map based
            var noteColor = _noteColorMaps[instance.noteColorMap][note % 12];
            return [noteColor[0], noteColor[1], Math.round((velocity / 0x7F) * noteColor[2])];
        },
        function (instance, note, velocity) { // Rainbow based
            return [
                Math.round((note - instance._noteMin) * (0xFF / instance._numLeds)),
                0xFF, Math.round((velocity / 0x7F) * 0xFF)
            ];
        }
    ];

    // Note color maps (HSV 8-bits format)
    // Taken (& adapted) from: http://mudcu.be/midi-js/js/MusicTheory.Synesthesia.js
    var _noteColorMaps = [
        [[0, 245, 250], [10, 240, 250], [20, 238, 248], [32, 209, 248], [42, 192, 245], [69, 232, 220], [96, 220, 143], [122, 207, 145], [136, 209, 156], [150, 209, 161], [194, 227, 125], [214, 240, 125]], // aeppli1940
        [[0, 245, 250], [9, 238, 245], [20, 238, 248], [35, 235, 248], [42, 192, 245], [51, 192, 225], [96, 220, 143], [122, 207, 145], [176, 230, 130], [222, 225, 168], [231, 232, 217], [240, 235, 174]], // belmont1944
        [[176, 230, 130], [122, 207, 145], [96, 220, 143], [56, 189, 145], [42, 192, 245], [34, 192, 245], [20, 238, 248], [0, 245, 250], [0, 240, 158], [231, 232, 217], [194, 227, 125], [214, 240, 125]], // bertrand1734
        [[0, 245, 250], [0, 240, 158], [20, 238, 248], [35, 235, 248], [42, 192, 245], [51, 192, 225], [96, 220, 143], [115, 197, 166], [214, 240, 125], [231, 232, 217], [243, 225, 215], [0, 245, 250]], // bishop1893
        [[176, 230, 130], [196, 235, 133], [214, 240, 125], [236, 245, 192], [0, 245, 250], [20, 238, 248], [32, 209, 248], [42, 192, 245], [49, 220, 220], [56, 189, 145], [76, 207, 151], [96, 220, 143]], // field1816
        [[42, 192, 245], [96, 220, 143], [122, 207, 145], [150, 209, 161], [214, 240, 125], [231, 232, 217], [234, 232, 161], [0, 245, 250], [7, 243, 209], [7, 243, 209], [5, 240, 248], [19, 240, 243]], // helmholtz1910
        [[0, 245, 250], [9, 238, 245], [20, 238, 248], [34, 192, 245], [42, 192, 245], [96, 220, 143], [122, 207, 145], [176, 230, 130], [194, 227, 125], [214, 240, 125], [222, 225, 168], [231, 232, 217]], // jameson1844
        [[0, 243, 194], [0, 245, 250], [9, 238, 245], [20, 238, 248], [42, 192, 245], [51, 192, 225], [96, 220, 143], [122, 207, 145], [176, 230, 130], [207, 209, 135], [231, 232, 217], [234, 232, 161]], // klein1930
        [[0, 245, 250], [10, 240, 250], [20, 238, 248], [32, 209, 248], [42, 192, 245], [96, 220, 143], [136, 227, 143], [176, 230, 130], [196, 235, 133], [214, 240, 125], [223, 238, 176], [231, 232, 217]], // newton1704
        [[0, 245, 250], [0, 240, 158], [9, 238, 245], [20, 238, 248], [42, 192, 245], [56, 189, 145], [96, 220, 143], [115, 197, 166], [122, 207, 145], [214, 240, 125], [176, 230, 130], [231, 232, 217]], // rimington1893
        [[0, 245, 250], [231, 232, 217], [42, 192, 245], [174, 89, 133], [150, 209, 161], [0, 240, 158], [176, 230, 130], [20, 238, 248], [214, 240, 125], [96, 220, 143], [174, 89, 133], [150, 209, 161]], // scriabin1911
        [[0, 186, 104], [0, 245, 250], [20, 238, 248], [34, 192, 245], [42, 192, 245], [96, 220, 143], [122, 207, 145], [176, 230, 130], [214, 240, 125], [231, 232, 217], [0, 186, 104], [0, 0, 7]], // seemann1881
        [[51, 192, 225], [96, 220, 143], [122, 207, 145], [176, 230, 130], [214, 240, 125], [231, 232, 217], [231, 225, 110], [0, 240, 158], [0, 245, 250], [20, 238, 248], [44, 110, 240], [42, 192, 245]] // zieverink2004
    ];

    // Convert HSV (8-bits) to RGB
    // Taken (& adapted) from: http://stackoverflow.com/a/17243070
    function _hsv8ToRgb(hsv8) {
        var h, s, v, r, g, b, i, f, p, q, t;
        h = hsv8[0] / 0xFF, s = hsv8[1] / 0xFF, v = hsv8[2] / 0xFF;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return [Math.floor(r * 0xFF), Math.floor(g * 0xFF), Math.floor(b * 0xFF)];
    }

    // Constructor
    function MidiLeds(noteMin, noteMax) {
        this._noteMin = noteMin;
        this._noteMax = noteMax;
        this._numLeds = noteMax - noteMin + 1;
        this._canvas = undefined;
        this._envelopes = new Object(null);

        // Initialise leds array
        this._leds = new Array();
        for (var i=0; i<this._numLeds; i++)
            this._leds.push(0x0);

        // Initialise controllers state
        this.resetAllControllers();
    }

    // Prototype shortcut
    var proto = MidiLeds.prototype;

    // Paint Leds state into the canvas
    proto._show = function () {
        if (typeof this._canvas === 'undefined')
            return;
        this._leds.forEach(function (led, index, array) {
            if (((led >> 24) & 0xFF) == 0x00) { // led should be painted?
                var rgb = _hsv8ToRgb([(led >> 16) & 0xFF, (led >> 8) & 0xFF, led & 0xFF]);
                this._canvas.ctx.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
                this._canvas.ctx.fillRect(this._canvas.ledWidth * index, 0,
                    this._canvas.ledWidth - 1, this._canvas.ledHeight);
                array[index] |= 0xFF000000; // mark led as painted
            }
        }, this);
    }

    // Use a given canvas element for Leds display
    proto.useCanvas = function (canvas) {
        this._canvas = {
            ledWidth: canvas.getAttribute('width') / this._numLeds,
            ledHeight: canvas.getAttribute('height') / 1,
            ctx: canvas.getContext('2d')
        };
    }

    // Process a Note-On event
    proto.noteOn = function (note, velocity) {
        if (note >= this._noteMin && note <= this._noteMax) {
            if (!(note in this._envelopes))
                this._envelopes[note] = {
                    time: 0,
                    state: 'ATTACK',
                    target: 1.0,
                    output: 0.0,
                    attackRate: 1.0 / this.attackTime,
                    decayRate: (1.0 - this.sustainLevel) / this.decayTime,
                    sustainLevel: this.sustainLevel,
                    releaseStart: 0.0,
                    releaseRate: 0.0,
                    releaseTime: this.releaseTime,
                    hsv8: _colorMappers[this.colorMapper](this, note,
                              this.ignoreVelocity ? 0x7F : velocity),
                };

            // Re-trigger the note
            this._envelopes[note].time = 0;
            this._envelopes[note].state = 'ATTACK';
            this._envelopes[note].target = 1.0;
        }
    }

    // Process a Note-Off event
    proto.noteOff = function (note) {
        if (note >= this._noteMin && note <= this._noteMax)
            if (note in this._envelopes) {
                this._envelopes[note].time = 0;
                this._envelopes[note].state = 'RELEASE';
                this._envelopes[note].target = 0.0;
                this._envelopes[note].releaseStart = this._envelopes[note].output;
                this._envelopes[note].releaseRate =
                    this._envelopes[note].releaseStart / this._envelopes[note].releaseTime;
            }
    }

    // Turn all Leds off
    proto.allLedsOff = function () {
        this._envelopesQueue.splice();
        this._leds.forEach(function (led, index, array) {
            array[index] = 0x0;
        });
    }

    // Reset color mappers and ADSR envelope values
    proto.resetAllControllers = function () {
        this.attackTime = _defaults.attackTime;
        this.decayTime = _defaults.decayTime;
        this.sustainLevel = _defaults.sustainLevel;
        this.releaseTime = _defaults.releaseTime;
        this.colorMapper = _defaults.colorMapper;
        this.noteColorMap = _defaults.noteColorMap;
        this.ignoreVelocity = _defaults.ignoreVelocity;
        this.baseBrightness = _defaults.baseBrightness;
    }

    // Process a clock tick signal
    // ADSR taken (& adapted) from: https://github.com/thestk/stk/blob/master/src/ADSR.cpp
    proto.tick = function (time) {
        for (var note in this._envelopes) {
            //console.log('Note ' + note);
            var envelope = this._envelopes[note];

            // Envelope timing
            if (envelope.time == 0)
                envelope.time = time;
            var envelopeTime = time - envelope.time;

            // Envelope state
            switch (envelope.state) {
                case 'ATTACK':
                    if (isFinite(envelope.attackRate))
                        envelope.output = envelopeTime * envelope.attackRate;
                    else envelope.output = envelope.target;
                    if (envelope.output >= envelope.target) {
                        envelope.output = envelope.target;
                        envelope.time = 0;
                        envelope.state = 'DECAY';
                        envelope.target = envelope.sustainLevel;
                    }
                    break;
                case 'DECAY':
                    if (isFinite(envelope.decayRate))
                        envelope.output = 1.0 - (envelopeTime * envelope.decayRate);
                    else envelope.output = envelope.target;
                    if (envelope.output <= envelope.target) {
                        envelope.output = envelope.target;
                        envelope.time = 0;
                        envelope.state = 'SUSTAIN';
                    }
                    break;
                case 'SUSTAIN':
                    envelope.time = 0;
                    continue;
                case 'RELEASE':
                    if (isFinite(envelope.releaseRate))
                        envelope.output = envelope.releaseStart - (envelopeTime * envelope.releaseRate);
                    else envelope.output = envelope.target;
                    if (envelope.output <= envelope.target) {
                        envelope.output = envelope.target;
                        envelope.time = 0;
                        envelope.state = 'IDLE';
                    }
                    break;
            }

            // Set the led color and keep base brightness
            var brightness = Math.round(envelope.hsv8[2] * envelope.output);
            if (brightness < this.baseBrightness)
                brightness = this.baseBrightness;
            this._leds[note - this._noteMin] =
                (envelope.hsv8[0] << 16) + (envelope.hsv8[1] << 8) + brightness;

            // Envelope ready to be dropped?
            if (envelope.state == 'IDLE')
                delete this._envelopes[note];
        }
        this._show();
    }

    // Expose either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return MidiLeds;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = MidiLeds;
    }
    else {
        this.MidiLeds = MidiLeds;
    }
}.call(this));
