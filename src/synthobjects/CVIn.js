import SynthObject from "./SynthObject";

export default class CvIn extends SynthObject {
    constructor(name, cv, type) {
        super(name, "cv_" + cv, "cv", []);

        this.cc = cv;
        this.sig_type = type; // trigger, gate, cv

    }
}