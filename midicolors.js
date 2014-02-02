/**
 * MidiColors v1.0 - A very simple Midi notes to colors mapper for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * Notes color maps taken from:
 * http://mudcu.be/midi-js/js/MusicTheory.Synesthesia.js
 * MIT license
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Color mappers
    var _colorMappers = {
        'color-map': function (instance, note, velocity) {
            var origColor = instance._colorMapCache[note];
            return {
                h: origColor.h, s: origColor.s,
                l: (velocity / 127) * origColor.l
            };
        },
        'color-map-fixed': function (instance, note, velocity) {
            return instance._colorMapCache[note];
        },
        'rainbow': function (instance, note, velocity) {
            return {
                h: (note - instance._noteMin ) *
                    (360 / (instance._noteMax - instance._noteMin + 1)),
                s: 1, l: (velocity / 127) * 0.50
            };
        },
        'rainbow-fixed': function (instance, note, velocity) {
            return {
                h: (note - instance._noteMin ) *
                    (360 / (instance._noteMax - instance._noteMin + 1)),
                s: 1, l: 0.5
            };
        }
    }

    // Note color Maps
    var _colorMaps = {
        'newton1704': {
            name: 'Isaac Newton (1704)',
            notes: { // H, S, L
                0: [ 0, 96, 51 ], // C
                1: undefined, // C#
                2: [ 29, 94, 52 ], // D
                3: undefined, // D#
                4: [ 60, 90, 60 ], // E
                5: [ 135, 76, 32 ], // F
                6: undefined, // F#
                7: [ 248, 82, 28 ], // G
                8: undefined, // G#
                9: [ 302, 88, 26 ], // A
                10: undefined, // A#
                11: [ 325, 84, 46 ] // B
            }
        },
        'bertrand1734': {
            name: 'Louis Bertrand Castel (1734)',
            notes: {
                0: [ 248, 82, 28 ],
                1: [ 172, 68, 34 ],
                2: [ 135, 76, 32 ],
                3: [ 79, 59, 36 ],
                4: [ 60, 90, 60 ],
                5: [ 49, 90, 60 ],
                6: [ 29, 94, 52 ],
                7: [ 360, 96, 51 ],
                8: [ 1, 89, 33 ],
                9: [ 325, 84, 46 ],
                10: [ 273, 80, 27 ],
                11: [ 302, 88, 26 ]
            }
        },
        'field1816': {
            name: 'George Field (1816)',
            notes: {
                0: [ 248, 82, 28 ],
                1: undefined,
                2: [ 302, 88, 26 ],
                3: undefined,
                4: [ 360, 96, 51 ],
                5: [ 29, 94, 52 ],
                6: undefined,
                7: [ 60, 90, 60 ],
                8: undefined,
                9: [ 79, 59, 36 ],
                10: undefined,
                11: [ 135, 76, 32 ]
            }
        },
        'jameson1884': {
            name: 'D. D. Jameson (1844)',
            notes: {
                0: [ 360, 96, 51 ],
                1: [ 14, 91, 51 ],
                2: [ 29, 94, 52 ],
                3: [ 49, 90, 60 ],
                4: [ 60, 90, 60 ],
                5: [ 135, 76, 32 ],
                6: [ 172, 68, 34 ],
                7: [ 248, 82, 28 ],
                8: [ 273, 80, 27 ],
                9: [ 302, 88, 26 ],
                10: [ 313, 78, 37 ],
                11: [ 325, 84, 46 ]
            }
        },
        'seemann1881': {
            name: 'Theodor Seemann (1881)',
            notes: {
                0: [ 0, 58, 26 ],
                1: [ 360, 96, 51 ],
                2: [ 29, 94, 52 ],
                3: [ 49, 90, 60 ],
                4: [ 60, 90, 60 ],
                5: [ 135, 76, 32 ],
                6: [ 172, 68, 34 ],
                7: [ 248, 82, 28 ],
                8: [ 302, 88, 26 ],
                9: [ 325, 84, 46 ],
                10: [ 0, 58, 26 ],
                11: [ 0, 0, 3 ]
            }
        },
        'rimington1893': {
            name: 'A. Wallace Rimington (1893)',
            notes: {
                0: [ 360, 96, 51 ],
                1: [ 1, 89, 33 ],
                2: [ 14, 91, 51 ],
                3: [ 29, 94, 52 ],
                4: [ 60, 90, 60 ],
                5: [ 79, 59, 36 ],
                6: [ 135, 76, 32 ],
                7: [ 163, 62, 40 ],
                8: [ 172, 68, 34 ],
                9: [ 302, 88, 26 ],
                10: [ 248, 82, 28 ],
                11: [ 325, 84, 46 ]
            }
        },
        'bishop1893': {
            name: 'Bainbridge Bishop (1893)',
            notes: {
                0: [ 360, 96, 51 ],
                1: [ 1, 89, 33 ],
                2: [ 29, 94, 52 ],
                3: [ 50, 93, 52 ],
                4: [ 60, 90, 60 ],
                5: [ 73, 73, 55 ],
                6: [ 135, 76, 32 ],
                7: [ 163, 62, 40 ],
                8: [ 302, 88, 26 ],
                9: [ 325, 84, 46 ],
                10: [ 343, 79, 47 ],
                11: [ 360, 96, 51 ]
            }
        },
        'helmholtz1910': {
            name: 'H. von Helmholtz (1910)',
            notes: {
                0: [ 60, 90, 60 ],
                1: [ 135, 76, 32 ],
                2: [ 172, 68, 34 ],
                3: [ 211, 70, 37 ],
                4: [ 302, 88, 26 ],
                5: [ 325, 84, 46 ],
                6: [ 330, 84, 34 ],
                7: [ 360, 96, 51 ],
                8: [ 10, 91, 43 ],
                9: [ 10, 91, 43 ],
                10: [ 8, 93, 51 ],
                11: [ 28, 89, 50 ]
            }
        },
        'scriabin1911': {
            name: 'Alexander Scriabin (1911)',
            notes: {
                0: [ 360, 96, 51 ],
                1: [ 325, 84, 46 ],
                2: [ 60, 90, 60 ],
                3: [ 245, 21, 43 ],
                4: [ 211, 70, 37 ],
                5: [ 1, 89, 33 ],
                6: [ 248, 82, 28 ],
                7: [ 29, 94, 52 ],
                8: [ 302, 88, 26 ],
                9: [ 135, 76, 32 ],
                10: [ 245, 21, 43 ],
                11: [ 211, 70, 37 ]
            }
        },
        'klein1930': {
            name: 'Adrian Bernard Klein (1930)',
            notes: {
                0: [ 0, 91, 40 ],
                1: [ 360, 96, 51 ],
                2: [ 14, 91, 51 ],
                3: [ 29, 94, 52 ],
                4: [ 60, 90, 60 ],
                5: [ 73, 73, 55 ],
                6: [ 135, 76, 32 ],
                7: [ 172, 68, 34 ],
                8: [ 248, 82, 28 ],
                9: [ 292, 70, 31 ],
                10: [ 325, 84, 46 ],
                11: [ 330, 84, 34 ]
            }
        },
        'aeppli1940': {
            name: 'August Aeppli (1940)',
            notes: {
                0: [ 0, 96, 51 ],
                1: undefined,
                2: [ 29, 94, 52 ],
                3: undefined,
                4: [ 60, 90, 60 ],
                5: undefined,
                6: [ 135, 76, 32 ],
                7: [ 172, 68, 34 ],
                8: undefined,
                9: [ 211, 70, 37 ],
                10: [ 273, 80, 27 ],
                11: [ 302, 88, 26 ]
            }
        },
        'belmont1944': {
            name: 'I. J. Belmont (1944)',
            notes: {
                0: [ 360, 96, 51 ],
                1: [ 14, 91, 51 ],
                2: [ 29, 94, 52 ],
                3: [ 50, 93, 52 ],
                4: [ 60, 90, 60 ],
                5: [ 73, 73, 55 ],
                6: [ 135, 76, 32 ],
                7: [ 172, 68, 34 ],
                8: [ 248, 82, 28 ],
                9: [ 313, 78, 37 ],
                10: [ 325, 84, 46 ],
                11: [ 338, 85, 37 ]
            }
        },
        'zieverink2004': {
            name: 'Steve Zieverink (2004)',
            notes: {
                0: [ 73, 73, 55 ],
                1: [ 135, 76, 32 ],
                2: [ 172, 68, 34 ],
                3: [ 248, 82, 28 ],
                4: [ 302, 88, 26 ],
                5: [ 325, 84, 46 ],
                6: [ 326, 79, 24 ],
                7: [ 1, 89, 33 ],
                8: [ 360, 96, 51 ],
                9: [ 29, 94, 52 ],
                10: [ 62, 78, 74 ],
                11: [ 60, 90, 60 ]
            }
        }
    };

    // Converts a hue/sat/lum into a 24-bit RGB color code.
    // Input: 0 <= hue <= 360, 0 <= sat <= 1, 0 <= lum <= 1
    // Function taken from:
    // http://www.autohotkey.com/board/topic/82545-lib-lossless-conversion-hsl-tofrom-rgb/
    function _hsl2rgb(color) {
        var i24 = 0xFFFFFF;

        // Transform the decimal inputs into 24-bit integers. Integer arithmetic is nice..
        var sat = ( color.s * i24 ) & i24;
        var lum = ( color.l * i24 ) & i24;
        var hue = ( color.h * 0xB60B60 >> 8 ) & i24;

        // Determine the chroma value and put it in the 'sat' var since the saturation
        // value is not used after this
        sat = lum + Math.round( sat * ( i24 - Math.abs( i24 - lum - lum ) ) / 0x1FFFFFE );

        // Calculate the base values for red and blue (green's base value is the hue)
        var red = hue < 0xAAAAAA ? hue + 0x555555 : hue - 0xAAAAAA;
        var blu = hue < 0x555555 ? hue + 0xAAAAAA : hue - 0x555555;

        // Run the blue value through the cases
        if ( blu < 0x2AAAAB )
            blu = sat + 2 * ( i24 - 6 * blu ) * ( lum - sat ) / i24 >> 16;
        else if ( blu < 0x800000 )
            blu = sat >> 16;
        else if ( blu < 0xAAAAAA )
            blu = sat + 2 * ( i24 - 6 * ( 0xAAAAAA - blu ) ) * ( lum - sat ) / i24 >> 16;
        else
            blu = 2 * lum - sat >> 16;

        // Run the red value through the cases
        if ( red < 0x2AAAAB )
            red = sat + 2 * ( i24 - 6 * red ) * ( lum - sat ) / i24 >> 16;
        else if ( red < 0x800000 )
            red = sat >> 16;
        else if ( red < 0xAAAAAA )
            red = sat + 2 * ( i24 - 6 * ( 0xAAAAAA - red ) ) * ( lum - sat ) / i24 >> 16;
        else
            red = 2 * lum - sat >> 16;

        // Run the green value through the cases
        if ( hue < 0x2AAAAB )
            hue = sat + 2 * ( i24 - 6 * hue ) * ( lum - sat ) / i24 >> 16;
        else if ( hue < 0x800000 )
            hue = sat >> 16;
        else if ( hue < 0xAAAAAA )
            hue = sat + 2 * ( i24 - 6 * ( 0xAAAAAA - hue ) ) * ( lum - sat ) / i24 >> 16;
        else
            hue = 2 * lum - sat >> 16;

        // Return RGB object
        return {r: red, g: hue, b: blu};
    }

    // Get all keys for an object
    function _getKeys(object) {
        var keys = [];
        for (var key in object)
            keys.push(key);
        return keys;
    }

    // Generate Midi notes to colors map cache
    function _genColorMapCache(colorMap) {
        // HSL color blender
        function blend(a, b) {
        return [(a[0] * 0.5 + b[0] * 0.5 + 0.5) >> 0, 
            (a[1] * 0.5 + b[1] * 0.5 + 0.5) >> 0,
            (a[2] * 0.5 + b[2] * 0.5 + 0.5) >> 0]
        };

        // Generate color cache for all possible Midi notes
        var cache = [];
        for (var note=0; note<128; note++) {
            var hslArray = _colorMaps[colorMap].notes[note % 12];
            if (hslArray === undefined) {
                hslArray = blend(_colorMaps[colorMap].notes[(note - 1) % 12],
                    _colorMaps[colorMap].notes[(note + 1) % 12]);
            }
            cache.push({h: hslArray[0], s: hslArray[1] / 100, l: hslArray[2] / 100});
        }
        return cache;
    }

    // Constructor
    function MidiColors() {
        this._colorMapper = _getKeys(_colorMappers)[0];
        this._colorMapCache = _genColorMapCache(_getKeys(_colorMaps)[0]);
        this._noteMin = 0;
        this._noteMax = 127;
    }

    // Cache variable for prototype
    var proto = MidiColors.prototype;

    // Get all available color mapper algorithms
    proto.getColorMappers = function () {
        return _getKeys(_colorMappers);
    }

    // Set the color mapper algorithm to use
    proto.setColorMapper = function (colorMapper) {
        if (_colorMappers.hasOwnProperty(colorMapper)) {
            this._colorMapper = colorMapper;
             return true;
        }
        return false;
    }

    // Get all available color maps
    proto.getColorMaps = function () {
        var colorMaps = [];
        for (var colorMap in _colorMaps) {
            colorMaps.push({id: colorMap, name: _colorMaps[colorMap].name})
        }
        return colorMaps;
    }

    // Set the color map to use for mapping Midi notes to colors
    proto.setColorMap = function (colorMap) {
        if (_colorMaps.hasOwnProperty(colorMap)) {
            this._colorMap = colorMap;
            this._colorMapCache = _genColorMapCache(this._colorMap);
            return true;
        }
        return false;
    }

    // Set the minimum note number
    proto.setNoteMin = function (note) {
        if (note < 0 || note > this._noteMax)
            return false;
        this._noteMin = note;
        return true;
    }

    // Set the maximum note number
    proto.setNoteMax = function (note) {
        if (note < this._noteMin || note > 127)
            return false;
        this._noteMax = note;
        return true;
    }

    // Maps a color (RGB) to a note according to set mapper algorithm (and color map)
    proto.mapNoteRGB = function (note, velocity) {
        return _hsl2rgb(this.mapNoteHSL(note, velocity));
    }

    // Maps a color (HSL) to a note according to set mapper algorithm (and color map)
    proto.mapNoteHSL = function (note, velocity) {
        if (note < this._noteMin || note > this._noteMax || velocity < 0 || velocity > 127)
            return {h: 0, s:0, l:0}
        return _colorMappers[this._colorMapper](this, note, velocity);
    }

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return MidiColors;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = MidiColors;
    }
    else {
        this.MidiColors = MidiColors;
    }
}.call(this));
