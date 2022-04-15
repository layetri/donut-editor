import SynthObject from "./SynthObject";

export default class WaveShaper extends SynthObject {
    constructor(display, name) {
        super(display, name, "source", ["harmonics", "base_frequency", "amount", "detune", "detune_range", "transpose"]);
    }
}