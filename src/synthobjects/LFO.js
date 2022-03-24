import SynthObject from "./SynthObject";

export default class LFO extends SynthObject {
    constructor(display, name) {
        super(display, name, "modulator", ["rate", "sync"]);
    }
}