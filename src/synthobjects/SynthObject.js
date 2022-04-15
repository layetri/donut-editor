export default class SynthObject {
    constructor(display, name, type, parameters) {
        this.name = name;
        this.display = display;
        this.parameters = [];
        this.type = type;
        this.voice_group = 0;
        this.initpos = {x: 0, y: 0}
        
        for(let i = 0; i < parameters.length; i++) {
            this.parameters.push({name: name + "_" + parameters[i], value: 0.00, position: {x: 0, y: 0}, links: 0});
        }

        this.links = 0;
        this.position = {x: 0, y: 0}
        this.randomPos();
    }

    randomPos() {
        if (this.type === "modulator") {
            this.initpos = { x: Math.random() * (window.innerWidth - 200) / 2, y: 50 + (Math.random() * (window.innerHeight - 250)) }
        } else {
            this.initpos = { x: ((Math.random() * (window.innerWidth - 200) / 2) + window.innerWidth / 2) - 100, y: 50 + (Math.random() * (window.innerHeight - 250)) }
        }

        this.position = { x: this.initpos.x + 150, y: this.initpos.y + 70 };
        for (let i = 0; i < this.parameters.length; i++) {
            this.parameters[i].position = { x: this.initpos.x, y: (this.initpos.y + 40) + i * 20 };
        }
    }

    setVoiceGroup(group) {
        this.voice_group = group;
    }

    setPosition(x, y, name) {
        if(name === "output") {
            this.position = {x: x, y: y};
        } else {
            this.parameters.find(p => {
                return p.name === name;
            }).position = {x: x, y: y};
        }
    }

    get(name) {
        if(name === "output") {
            return this;
        } else {
            return this.parameters.find(p => {
                return p.name === name;
            });
        }
    }
}