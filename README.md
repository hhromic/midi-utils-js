MIDI Utilities for JavaScript
=============================

This is a very simple collection of MIDI data utilities for JavaScript. They are meant to work with raw MIDI data (e.g. bytes), not with MIDI devices themselves. These libraries do not depend on any 3rd-party library so far.

For connecting to MIDI devices and receiving/sending MIDI data, I can suggest the very good [node-midi](http://github.com/justinlatimer/node-midi) Node library. Check it out!

For using any of the libraries, you simply need to include the relevant JavaScript file into your HTML page (or 'require' it if using Node). For example:

```html
<script src="midiparser.js"></script>
<script src="mididamperpedal.js"></script>
<script src="midisostenutopedal.js"></script>
<script src="midisoftpedal.js"></script>
<script src="midicolors.js"></script>
<script src="midiledscontroller.js"></script>
```

MidiParser class
----------------

A very simple event-driven Midi messages parser for JavaScript. This class parses raw MIDI bytes arrays (must be ```Uint8Array``` objects) and generates relevant higher-level MIDI events. You must add your own event handlers for it to do anything useful. The following example illustrates all events that can be handled in the current version:

```javascript
var mp = new MidiParser();
mp.on('note-off', function (channel, note) {
    console.log('Note-Off on channel %d. Note: %d', channel, note);
});
mp.on('note-on', function (channel, note, velocity) {
    console.log('Note-On on channel %d. Note %d with velocity %d',
        channel, note, velocity);
});
mp.on('key-pressure', function (channel, note, pressure) {
    console.log('Key pressure on channel %d. Note %d with pressure %d',
        channel, note, pressure);
});
mp.on('program-change', function (channel, number) {
    console.log('Program Change on channel %d. Number: %d',
        channel, number);
});
mp.on('channel-pressure', function (channel, pressure) {
    console.log('Channel pressure on channel %d. Pressure %d',
        channel, pressure);
});
mp.on('pitch-wheel', function (channel, position) {
    console.log('Pitch Wheel on channel %d. Position: %d',
        channel, position);
});
mp.on('sustain-off', function (channel) {
    console.log('Damper Pedal released on channel %d', channel);
});
mp.on('sustain-on', function (channel) {
    console.log('Damper Pedal pressed on channel %d', channel);
});
mp.on('sostenuto-off', function (channel) {
    console.log('Sostenuto Pedal released on channel %d', channel);
});
mp.on('sostenuto-on', function (channel) {
    console.log('Sostenuto Pedal pressed on channel %d', channel);
});
mp.on('soft-off', function (channel) {
    console.log('Soft Pedal released on channel %d', channel);
});
mp.on('soft-on', function (channel) {
    console.log('Soft Pedal pressed on channel %d', channel);
});
mp.on('unknown', function (byte1, byte2, byte3) {
    console.log('Unknown event with bytes [%d, %d, %d].',
        byte1, byte2, byte3);
});

// Test some events
mp.parse(new Uint8Array([144, 24, 100]));
mp.parse(new Uint8Array([177, 64, 127]));
mp.parse(new Uint8Array([145, 36, 0]));
```

**Note:** this parser handles the special case of a ```note-on``` with velocity = 0 as a ```note-off``` event, this way you do not need to worry about semantics. See the third example test event.

The events ```key-pressure``` and ```channel-pressure``` are commonly known as _Poly Aftertouch_ and _Aftertouch_ respectively in the MIDI world.

The MidiParser class also provides convenient standard General Midi 1 (GM1) note -> name, drum note -> name, program number -> name and program number -> family name static mappings. For example:

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
mdp.on('sustain-off', function (channel) {
    console.log('Damper Pedal released on channel %d', channel);
});
mdp.on('sustain-on', function (channel) {
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
mp.on('sustain-off', function (channel) {
    mdp.release(channel);
});
mp.on('sustain-on', function (channel) {
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
---------------------

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
---------------------

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

MidiColors class
----------------

A very simple Midi notes to colors mapper for JavaScript. This class provides color mappings to MIDI notes, according to different mapping algorithms and color tables. Please see the following example usage:

```javascript
var mc = new MidiColors();

// Get available color mapper algorithms and color maps
var colorMappers = mc.getColorMappers();
var colorMaps = mc.getColorMaps();

// Set a particular combination of the above
mc.setColorMapper('color-map');
mc.setColorMap('jameson1884'); // use the 'id' attribute given by getColorMaps()

// Some mapper algorithms work over note ranges
// Standard 88-keys piano range: 0x15 <= note <= 0x6C
mc.setNoteMin(0x15);
mc.setNoteMax(0x6C);

// Then map some colors to some notes
// Hint: some mapping algorithms consider the velocity value too
// RGB stands for (red,green,blue) and HSL for (hue,saturation,lightness)
var col1 = mc.mapNoteRGB(0x18, 0x64); // arguments: note, velocity
var col2 = mc.mapNoteHSL(0x18, 0x7F);
```

The available color mapping algorithms are as follows:

* ```color-map```: map colors according to the configured color map. The lightness is scaled according to the velocity value of the note.
* ```color-map-fixed```: same as the above, but a fixed lightness is used instead of a velocity-based lightness.
* ```rainbow```: map colors according to a generated rainbow coloring pattern. The lightness is scaled according to the velocity value of the note. This algorithm maps the rainbow range according to the configured min/max note values. The color map setting has no effect.
* ```rainbow-fixed```: same as the above, but a fixed lightness is used instead of a velocity-based lightness.

More information about the color maps can be found in [this website](http://rhythmiclight.com/archives/ideas/colorscales.html). These color scales were transcribed by [this work](http://mudcu.be/midi-js/js/MusicTheory.Synesthesia.js). Thanks for that!

MidiLedsController class
------------------------

A very simple MIDI to RGB LED strip controller for JavaScript. This class computes RGB values for a strip of LEDs using MIDI ```note-on``` and ````note-off``` messages together with two respective MidiColors instances. The controller also can apply a note offset to each input ```note-on``` and configure a velocity to be used for ```note-off``` events.  Please see the following example usage:

```javascript
// First some MidiColors mappings
var mcNoteOn = new MidiColors();
var mcNoteOff = new MidiColors();
mcNoteOn.setNoteMin(0x15); mcNoteOff.setNoteMin(0x15);  // 88-keys
mcNoteOn.setNoteMax(0x6C); mcNoteOff.setNoteMax(0x6C);  // piano setting
mcNoteOn.setColorMapper('rainbow');   // Let's try a rainbow effect
mcNoteOff.setColorMapper('rainbow');  // If OffVelocity=0, this doesn't matter

// Second the MidiLedsController with basic raw console output
var mlc = new MidiLedsController(88, mcNoteOn, mcNoteOff);
mlc.setNoteOffset(0x15);   // Minimum note for an 88-keys piano
mlc.setOffVelocity(0x0A);  // If >0x00: LEDs will be 'off' with dimmed light
mlc.on('led-output', function (led, r, g, b) {
    console.log('LED %d is now R=%d, G=%d, B=%d.', led, r, g, b);
    // Your real RGB LED strip can be driven here...
});

// Finally a MidiParser to send some events (pedals can be added too!)
var mp = new MidiParser();
mp.on('note-on', function (channel, note, velocity) {
    mlc.noteOn(channel, note, velocity);
});
mp.on('note-off', function (channel, note) {
    mlc.noteOff(channel, note);
});

// Test some events, check the LEDs output values
mp.parse(new Uint8Array([144, 30, 100]));
mp.parse(new Uint8Array([144, 60, 80]));
mp.parse(new Uint8Array([144, 90, 127]));
mp.parse(new Uint8Array([144, 30, 0]));
mp.parse(new Uint8Array([144, 60, 0]));
mp.parse(new Uint8Array([144, 90, 0]));
```

Acknowledgements
----------------

Many thanks go to my excellent beta tester friend and pianist Mario Arias ([@2xMcK](http://github.com/2xMcK)). You can see him performing in [this video](http://youtu.be/MI8koEcOBh0) and also in [this video](http://youtu.be/-pT2aPDNLjI). Kudos for all the feedback!
