import SynthObject from "./SynthObject";

export default class MidiIn extends SynthObject {
    constructor(cc, channel, name = false) {
        if(!name) {
            name = "midi_" + cc;
        }
        super("MIDI CC " + cc, name, "midi", []);

        this.cc = cc;
        this.channel = channel;

    }
}