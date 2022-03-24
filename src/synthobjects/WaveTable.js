import SynthObject from "./SynthObject";

export default class WaveTable extends SynthObject {
    constructor(display, name) {
        super(display, name, "source", ["shape", "amount", "base_frequency", "detune"]);
    }
}