import SynthObject from "./SynthObject";

export default class StereoDelay extends SynthObject {
    constructor(display, name) {
        super(display, name, "effect", ["amount", "delay_time_left", "delay_time_right", "feedback_left", "feedback_right"]);
    }
}