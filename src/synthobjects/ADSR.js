import SynthObject from "./SynthObject";

export default class ADSR extends SynthObject {
    constructor(display, name) {
        super(display, name, "modulator", ["attack", "decay", "sustain", "release"]);
    }
}