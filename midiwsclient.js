/**
 * MidiWsClient v1.0 - A very simple event-driven Midi WebSocket client for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Constructor
    function MidiWsClient(wsUrl) {
        EventEmitter.call(this);
        this._wsUrl = wsUrl;
        this._ws = undefined;
    }

    // We are an event emitter
    MidiWsClient.prototype = Object.create(EventEmitter.prototype);

    // Prototype shortcut
    var proto = MidiWsClient.prototype;

    // Start a WebSocket connection for Midi data
    proto.start = function () {
        if (typeof this._ws === 'undefined' || this._ws.readyState == WebSocket.CLOSED) {
            var midiWsClient = this;
            this.emit('connecting', this._wsUrl);
            this._ws = new WebSocket(this._wsUrl);
            this._ws.binaryType = 'arraybuffer';
            this._ws.onopen = function (open) {
                midiWsClient.emit('connect', open);
            };
            this._ws.onclose = function (close) {
                midiWsClient.emit('disconnect', close);
            };
            this._ws.onerror = function (error) {
                midiWsClient.emit('error', error);
            };
            this._ws.onmessage = function (message) {
                midiWsClient.emit('message', new Uint8Array(message.data));
            };
        }
    }

    // Stop the WebSocket connection
    proto.stop = function () {
        if (typeof this._ws !== 'undefined' && this._ws.readyState != WebSocket.CLOSED)
            this._ws.close();
    }

    // Send a Midi message to the WebSocket connection
    proto.send = function (bytes) {
        if (typeof this._ws !== 'undefined' && this._ws.readyState == WebSocket.OPEN && bytes instanceof Uint8Array && bytes.length > 0)
            this._ws.send(bytes);
    }

    // Expose either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return MidiWsClient;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = MidiWsClient;
    }
    else {
        this.MidiWsClient = MidiWsClient;
    }
}.call(this));
