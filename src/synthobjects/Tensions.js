import SynthObject from "./SynthObject";

export default class Tensions extends SynthObject {
    constructor(display, name) {
        super(display, name, "source", ["amount", "delaytime", "feedback", "filter_cutoff", "transpose"]);
    }
}