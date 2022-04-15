import SynthObject from "./SynthObject";

export default class Sampler extends SynthObject {
    constructor(display, name) {
        super(display, name, "source", ["amount", "direction", "transpose"]);
    }
}