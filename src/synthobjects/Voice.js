import SynthObject from "./SynthObject";

export default class Voice extends SynthObject {
    constructor() {
        super("Voice", "voice", "voice", ["master"]);
    }
}