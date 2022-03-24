import SynthObject from "./SynthObject";

export default class MidiIn extends SynthObject {
    constructor(cc, channel) {
        super("MIDI CC " + cc, "midi_" + cc, "midi", []);

        this.cc = cc;
        this.channel = channel;

    }
}