MIDI Utilities for JavaScript
=============================

This is a very simple collection of MIDI data utilities for JavaScript. They are meant to process raw MIDI data, i.e. bytes, not with MIDI devices themselves. These libraries do not depend on any 3rd-party libraries so far (with the exception of an EventEmitter when not using Node).

For connecting to MIDI devices and receiving/sending MIDI data, I can suggest the very good [node-midi](http://github.com/justinlatimer/node-midi) Node library. Check it out!

To use any of the libraries you simply need to include the relevant JavaScript file into your HTML page (or 'require' it if using Node). For example:

```html
<script src="midiparser.js"></script>
<script src="mididamperpedal.js"></script>
<script src="midisostenutopedal.js"></script>
<script src="midisoftpedal.js"></script>
```

Please note that most of the classes are *event emitters* and rely on an existing EventEmitter object implementation to inherit/use. For example if you want to use the MidiParser class:

* If using Node, this object comes built-in and can be easily used like this:

```javascript
var EventEmitter = require('events').EventEmitter;
var MidiParser = require('./midiparser');
var mp = new MidiParser();
```

* If using the browser or other environments, you can use the very good ([EventEmitter](http://github.com/Wolfy87/EventEmitter)) from Oliver Caldwell ([Wolfy87](http://github.com/Wolfy87)) by simply loading it before any other class in this package:

```html
<script src="eventemitter.min.js"></script>
<script src="midiparser.js"></script>
```

MidiParser class
----------------

A very simple event-driven MIDI messages parser for JavaScript. This class parses raw MIDI bytes arrays (must be ```Uint8Array``` objects) and generates relevant higher-level MIDI events. You must add your own event handlers for it to do anything useful. The following example illustrates how to handle some events:

```javascript
var mp = new MidiParser();
mp.on('note-off', function (channel, note, velocity) {
    console.log('Note-Off on channel %d. Note: %d with velocity %d',
        channel, note, velocity);
});
mp.on('note-on', function (channel, note, velocity) {
    console.log('Note-On on channel %d. Note %d with velocity %d',
        channel, note, velocity);
});
mp.on('damper-off', function (channel) {
    console.log('Damper Pedal released on channel %d', channel);
});
mp.on('damper-on', function (channel) {
    console.log('Damper Pedal pressed on channel %d', channel);
});

// Test some events
mp.parse(new Uint8Array([144, 24, 100]));
mp.parse(new Uint8Array([177, 64, 127]));
mp.parse(new Uint8Array([145, 36, 0]));
```

**Note:** this parser handles the special case of a ```note-on``` event with zero velocity as a ```note-off``` event, this way you do not need to worry about semantics. See the output from the third example test.

The full list of supported MIDI events and handler arguments is below:

* ```note-off``` and ```note-on``` with (channel, note, velocity) arguments.
* ```key-pressure``` with (channel, note, pressure) arguments. This event is commonly known as _Poly Aftertouch_ in the MIDI world.
* ```program-change``` with (channel, number) arguments.
* ```channel-pressure``` with (channel, pressure) arguments. This event is commonly known as _Aftertouch_ in the MIDI world.
* ```pitch-bend``` with (channel, value) arguments. The value already merges the MSB and LSB bytes, providing the full 14 bits bend value.
* ```bank-select```, ```mod-wheel```, ```breath-controller```, ```foot-controller```, ```portamento-time```, ```volume```, ```balance```, ```pan```, ```expression-controller```, ```effect-control-1```, ```effect-control-2```, ```gp-controller-1```, ```gp-controller-2```, ```gp-controller-3```, ```gp-controller-4```, ```bank-select-fine```, ```mod-wheel-fine```, ```breath-controller-fine```, ```foot-controller-fine```, ```portamento-time-fine```, ```volume-fine```, ```balance-fine```, ```pan-fine```, ```expression-controller-fine```, ```effect-control-1-fine```, ```effect-control-2-fine```, ```gp-controller-1-fine```, ```gp-controller-2-fine```, ```gp-controller-3-fine```, ```gp-controller-4-fine```, ```sound-variation```, ```timbre-intensity```, ```release-time```, ```attack-time```, ```brightness```, ```decay-time```, ```vibrato-rate```, ```vibrato-depth```, ```vibrato-delay```, ```snd-controller-10```, ```gp-controller-5```, ```gp-controller-6```, ```gp-controller-7```, ```gp-controller-8```, ```portamento```, ```reverb-depth```, ```tremolo-depth```, ```chorus-depth```, ```detune-depth``` and ```phaser-depth``` with (channel, value) arguments. These are all Control Change (CC) MIDI events.
* ```damper-off```, ```damper-on```, ```portamento-off```, ```portamento-on```, ```sostenuto-off```, ```sostenuto-on```, ```soft-off```, ```soft-on```, ```legato-off```, ```legato-on```, ```hold2-off``` and ```hold2-on``` with (channel) argument. These are all binary valued Control Change (CC) MIDI events commonly associated with instrument pedals.
* ```all-sound-off```, ```reset-all-controllers``` and ```all-notes-off``` with (channel) argument. These are all Control Change (CC) MIDI events.
* ```unknown-control-change``` with (channel, control, value) arguments. If a Control Change (CC) MIDI event is received but can not be parsed, it is passed cleanly using this event handler.
* ```unknown-message``` with (bytes) argument. If the MIDI bytes array can not be parsed, it is passed cleanly using this event handler.

The MidiParser class also provides convenient standard General Midi 1 (GM1) note-to-name, drumNote-to-name, programNumber-to-name and programNumber-to-familyName static mappings. For example:

```javascript
var mp = new MidiParser();
console.log(mp.getGM1NoteName(0x50));      // note
console.log(mp.getGM1DrumNoteName(0x40));  // note
console.log(mp.getGM1ProgramName(0x10));   // program number
console.log(mp.getGM1FamilyName(0x20));    // program number
```

MidiDamperPedal class
---------------------

A very simple event-driven Midi Damper Pedal processor for JavaScript. This class emulates the behaviour of a Damper Pedal by controlling the passage of ```note-on``` and ```note-off``` messages. This pedal's working is detailed in [this Wikipedia article](http://en.wikipedia.org/wiki/Sustain_pedal).

When the pedal is pressed, ```note-off``` messages are held until the pedal is released, then they are all replayed back. This class works like an event filter designed to easily work together with the MidiParser or other pedal processing classes, however you can use it standalone too. See usage example:

```javascript
// First the MidiDamperPedal
var mdp = new MidiDamperPedal();
mdp.on('note-off', function (channel, note) {
    console.log('Note-Off on channel %d. Note %d.', channel, note);
});
mdp.on('note-on', function (channel, note, velocity) {
    console.log('Note-On on channel %d. Note %d with velocity %d',
        channel, note, velocity);
});
mdp.on('damper-off', function (channel) {
    console.log('Damper Pedal released on channel %d', channel);
});
mdp.on('damper-on', function (channel) {
    console.log('Damper Pedal pressed on channel %d', channel);
});

// Now the MidiParser and redirect events to the damper pedal
var mp = new MidiParser();
mp.on('note-off', function (channel, note) {
    mdp.noteOff(channel, note);
});
mp.on('note-on', function (channel, note, velocity) {
    mdp.noteOn(channel, note, velocity);
});
mp.on('damper-off', function (channel) {
    mdp.release(channel);
});
mp.on('damper-on', function (channel) {
    mdp.press(channel);
});
mp.on('unknown', function (byte1, byte2, byte3) {
    console.log('Unknown event with bytes [%d, %d, %d].',
        byte1, byte2, byte3);
});

// Test some events, check the order of damper pedal emitted events
mp.parse(new Uint8Array([176, 64, 127]));
mp.parse(new Uint8Array([144, 24, 100]));
mp.parse(new Uint8Array([144, 24, 0]));
mp.parse(new Uint8Array([144, 36, 90]));
mp.parse(new Uint8Array([144, 36, 0]));
mp.parse(new Uint8Array([176, 64, 0]));
```

MidiSostenutoPedal class
------------------------

A very simple event-driven Midi Sostenuto Pedal processor for JavaScript. This class emulates the behaviour of a Sostenuto Pedal by controlling the passage of ```note-on``` and ```note-off``` messages. This pedal is detailed in [this Wikipedia article](http://en.wikipedia.org/wiki/Sostenuto).

When the pedal is depressed, ```note-on``` messages without a corresponding ```note-off``` are remembered until the pedal is pressed (pre-pedal held notes). Then, all further ```note-off``` messages are passed except for those of the pre-pedal notes, which are held. When the pedal is released, all the held ```note-off``` messages are replayed back. This class works like an event filter designed to easily work together with the MidiParser or other pedal processing classes, however you can use it standalone too. See usage example:

```javascript
// First the MidiSostenutoPedal
var msp = new MidiSostenutoPedal();
msp.on('note-on', function (channel, note, velocity) {
    console.log('Note-On on channel %d. Note %d with velocity %d',
        channel, note, velocity);
});
msp.off('note-on', function (channel, note, velocity) {
    console.log('Note-Off on channel %d. Note %d.', channel, note);
});
msp.on('sostenuto-off', function (channel) {
    console.log('Sostenuto Pedal released on channel %d', channel);
});
msp.on('sostenuto-on', function (channel) {
    console.log('Sostenuto Pedal pressed on channel %d', channel);
});

// Now the MidiParser and redirect events to the sostenuto pedal
var mp = new MidiParser();
mp.on('note-off', function (channel, note) {
    msp.noteOff(channel, note);
});
mp.on('note-on', function (channel, note, velocity) {
    msp.noteOn(channel, note, velocity);
});
mp.on('soft-off', function (channel) {
    msp.release(channel);
});
mp.on('soft-on', function (channel) {
    msp.press(channel);
});
mp.on('unknown', function (byte1, byte2, byte3) {
    console.log('Unknown event with bytes [%d, %d, %d].',
        byte1, byte2, byte3);
});

// Test some events, check the order of sostenuto pedal emitted events
mp.parse(new Uint8Array([144, 24, 100]));
mp.parse(new Uint8Array([176, 66, 127]));
mp.parse(new Uint8Array([144, 24, 0]));
mp.parse(new Uint8Array([144, 36, 90]));
mp.parse(new Uint8Array([144, 36, 0]));
mp.parse(new Uint8Array([176, 66, 0]));
```

MidiSoftPedal class
-------------------

A very simple event-driven Midi Soft Pedal processor for JavaScript. This class emulates the behaviour of a Soft Pedal by controlling the passage of ```note-on``` messages. This pedal is detailed in [this Wikipedia article](http://en.wikipedia.org/wiki/Soft_pedal).

When the pedal is pressed, all velocities of incoming ```note-on``` messages are scaled using a ```softenFactor``` setting (defaulted to 2/3). This class works like an event filter designed to easily work together with the MidiParser or other pedal processing classes, however you can use it standalone too. See usage example:

```javascript
// First the MidiSoftPedal
var msp = new MidiSoftPedal();
msp.setSoftenFactor(0.5); // Optionally set a custom soften factor
msp.on('note-on', function (channel, note, velocity) {
    console.log('Note-On on channel %d. Note %d with velocity %d',
        channel, note, velocity);
});
msp.on('soft-off', function (channel) {
    console.log('Soft Pedal released on channel %d', channel);
});
msp.on('soft-on', function (channel) {
    console.log('Soft Pedal pressed on channel %d', channel);
});

// Now the MidiParser and redirect events to the soft pedal
var mp = new MidiParser();
mp.on('note-off', function (channel, note) {
    console.log('Note-Off on channel %d. Note %d.', channel, note);
});
mp.on('note-on', function (channel, note, velocity) {
    msp.noteOn(channel, note, velocity);
});
mp.on('soft-off', function (channel) {
    msp.release(channel);
});
mp.on('soft-on', function (channel) {
    msp.press(channel);
});
mp.on('unknown', function (byte1, byte2, byte3) {
    console.log('Unknown event with bytes [%d, %d, %d].',
        byte1, byte2, byte3);
});

// Test some events, check the velocity values of soft pedal emitted events
mp.parse(new Uint8Array([144, 24, 100]));
mp.parse(new Uint8Array([144, 24, 0]));
mp.parse(new Uint8Array([176, 67, 127]));
mp.parse(new Uint8Array([144, 24, 100]));
mp.parse(new Uint8Array([144, 24, 0]));
mp.parse(new Uint8Array([176, 67, 0]));
mp.parse(new Uint8Array([144, 24, 100]));
mp.parse(new Uint8Array([144, 24, 0]));
```

**Note:** the ```note-on``` event from the soft pedal will have the modified velocities if the pedal is pressed.

Acknowledgements
----------------

Many thanks go to my excellent beta tester friend and pianist Mario Arias ([@2xMcK](http://github.com/2xMcK)). You can see him performing in [this video](http://youtu.be/MI8koEcOBh0) and also in [this video](http://youtu.be/-pT2aPDNLjI). Kudos for all the feedback!
