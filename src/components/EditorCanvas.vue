<template>
    <div class="absolute z-9 select-none w-full h-full top-0 left-0" @mouseup="clearMouseEvents">
        <div v-for="obj in objects" :ref="obj.name" :key="objects.indexOf(obj)" class="absolute z-10 bg-gray-400 text-white font-bold w-max border-x-8 border-gray-700 mb-4 shadow-md">
            <div class="flex flex-row items-center -ml-2 -mr-3">
                <div>
                    <div class="px-10 py-2 cursor-drag" @mousedown.prevent="dragMouseDown(obj, obj.name, $event)">
                        {{obj.display}}
                    </div>

                
                    <div class="flex flex-col flex-auto mb-4" v-if="obj.parameters.length > 0">
                        <div class="white-text text-xs font-light flex flex-row items-center" v-for="parameter in obj.parameters" :key="obj.parameters.indexOf(parameter)">
                            <span class="p-1 relative rounded-full mr-1 cursor-pointer" :class="parameter.links > 0 ? 'bg-green-500' : 'bg-red-500'" @mousedown="createConnectionStart('destination', obj, parameter.name, $event)" @mouseup="createConnectionEnd(objects.indexOf(obj), parameter.name, $event)"></span>
                            <span @dblclick="editValue(objects.indexOf(obj), parameter.name)" class="mr-2">{{parameter.name}}</span>
                            <input type="text" class="text-xs font-white font-bold bg-transparent w-8" v-model="parameter.value">
                        </div>
                        <div class="mb-4"></div>
                    </div>
                </div>

                <span class="p-2 relative rounded-full cursor-pointer"
                    :class="obj.links > 0 ? 'bg-green-500' : 'bg-red-500'"
                    v-if="['modulator', 'midi', 'cv'].includes(obj.type)"
                    @mousedown="createConnectionStart('source', obj, 'output', $event)"
                    @mouseup="createConnectionEnd(objects.indexOf(obj), 'output', $event)">
                </span>
            </div>
        </div>

        <svg class="h-full w-full">
            <line v-for="line in links" :key="links.indexOf(line)" :x1="line.source.position.x" :y1="line.source.position.y" :x2="line.destination.position.x" :y2="line.destination.position.y" stroke="black" stroke-width="3" @dblclick="removeConnection(links.indexOf(line))" @contextmenu.prevent="openLinkEditor(links.indexOf(line), $event)" />
            <text v-for="line in links" :key="links.indexOf(line)" class="font-bold text-sm" paint-order="stroke" stroke="#ffffff" stroke-width="3px" :x="((line.destination.position.x + line.source.position.x) / 2) - 10" :y="((line.destination.position.y + line.source.position.y) / 2) + 5">{{ line.amount }}</text>
            <line :x1="connectionMaker.start.x" :y1="connectionMaker.start.y" :x2="connectionMaker.current.x" :y2="connectionMaker.current.y" stroke="grey" />
        </svg>

        <input type="text" ref="linkAmountEditingField" class="absolute bg-white p-2 shadow-md rounded-lg text-xs z-30" :style="{display: linkAmountEditor.active ? '' : 'none'}" autofocus v-model="links[editLinkAmount].amount" v-if="links.length > 0" @keydown.enter="linkAmountEditor.active = false" />
    </div>
</template>

<script>

// One object hasmany [inputs, parameters]
// One object hasone [output]

import LFO from "../synthobjects/LFO";
import ADSR from "../synthobjects/ADSR";
import WaveShaper from "../synthobjects/WaveShaper";
import WaveTable from "../synthobjects/WaveTable";
import Tensions from "../synthobjects/Tensions";
import Sampler from "../synthobjects/Sampler";
import MidiIn from "../synthobjects/MidiIn";
import CvIn from "../synthobjects/CVIn";
import Voice from "../synthobjects/Voice";
import StereoDelay from "../synthobjects/StereoDelay";

export default {
    data() {
        return {
            modulators: [],
            sources: [],
            effects: [],
            midiIns: [],
            cvIns: [],
            links: [],
            editLinkAmount: 0,
            linkAmountEditor: {active: false, x: 0, y:0},
            editing: "",
            connecting: {from: "", name: "", object: null},
            positions: {
                clientX: undefined,
                clientY: undefined,
                movementX: 0,
                movementY: 0,
                element: null,
                object: null
            },
            connectionMaker: {
                start: {x: 0, y: 0},
                current: {x: 0, y: 0}
            },
            voice: null
        }
    },
    created() {
        this.modulators.push(new LFO("LFO 1", "lfo1"));
        this.modulators.push(new LFO("LFO 2", "lfo2"));
        this.modulators.push(new ADSR("ADSR 1", "adsr1"));
        this.modulators.push(new ADSR("ADSR 2", "adsr2"));

        this.sources.push(new WaveShaper("WaveShaper 1", "ws1"));
        this.sources.push(new WaveShaper("WaveShaper 2", "ws2"));
        this.sources.push(new WaveTable("WaveTable 1", "wt1"));
        this.sources.push(new WaveTable("WaveTable 2", "wt2"));
        this.sources.push(new Tensions("Tensions", "ks"));
        this.sources.push(new Sampler("Sampler", "sampler"));

        this.effects.push(new StereoDelay("StereoDelay", "fx_delay"));

        this.voice = new Voice();
    },
    mounted() {
        for(let i = 0; i < this.objects.length; i++) {
            this.$refs[this.objects[i].name][0].style.top = this.objects[i].initpos.y + "px";
            this.$refs[this.objects[i].name][0].style.left = this.objects[i].initpos.x + "px";
        }
    },
    methods: {
        editValue(parameter) {
            this.editing = parameter;
        },
        openLinkEditor(link, event) {
            this.editLinkAmount = link;

            let el = this.$refs.linkAmountEditingField;
            el.style.left = event.clientX + "px";
            el.style.top = event.clientY + "px";
            this.linkAmountEditor.active = true;
        },
        dragMouseDown(obj, obj_ref, event) {
            event.preventDefault();
            // get the mouse cursor position at startup:
            this.positions.clientX = event.clientX
            this.positions.clientY = event.clientY
            this.positions.element = this.$refs[obj_ref][0];
            this.positions.object = obj;
            document.onmousemove = this.elementDrag
            document.onmouseup = this.closeDragElement
        },
        elementDrag(event) {
            event.preventDefault();
            this.positions.movementX = this.positions.clientX - event.clientX
            this.positions.movementY = this.positions.clientY - event.clientY
            this.positions.clientX = event.clientX
            this.positions.clientY = event.clientY

            for(let i = 0; i < this.positions.object.parameters.length; i++) {
                this.positions.object.parameters[i].position.x -= this.positions.movementX;
                this.positions.object.parameters[i].position.y -= this.positions.movementY;
            }

            this.positions.object.position.x -= this.positions.movementX;
            this.positions.object.position.y -= this.positions.movementY;

            // set the element's new position:
            this.positions.element.style.top = (this.positions.element.getBoundingClientRect().top - this.positions.movementY) + 'px'
            this.positions.element.style.left = (this.positions.element.getBoundingClientRect().left - this.positions.movementX) + 'px'
        },
        closeDragElement () {
            this.clearMouseEvents();
            this.positions.element = null;
        },
        createConnectionStart(from, obj, name, event) {
            this.connectionMaker.start.x = event.clientX;
            this.connectionMaker.start.y =  event.clientY;
            this.connectionMaker.current.x = event.clientX;
            this.connectionMaker.current.y =  event.clientY;

            this.connecting.from = from;
            this.connecting.object = this.objects.indexOf(obj);
            this.connecting.name = name;

            obj.setPosition(event.clientX, event.clientY, name);
            document.onmousemove = this.createConnectionDrag;
        },
        createConnectionDrag(event) {
            this.connectionMaker.current.x = event.clientX;
            this.connectionMaker.current.y = event.clientY;
        },
        createConnectionEnd(obj, name, event) {
            this.objects[obj].setPosition(event.clientX, event.clientY, name);
            
            let to = this.objects[obj].get(name);
            let from = this.objects[this.connecting.object].get(this.connecting.name);

            if(to.name !== from.name) {
                if(this.connecting.from === "source") {
                    this.links.push({source: from, destination: to, amount: 1.0});
                } else {
                    this.links.push({source: to, destination: from, amount: 1.0});
                }

                to.links++;
                from.links++;
            }

            this.clearMouseEvents();
        },
        clearMouseEvents() {
            document.onmouseup = null
            document.onmousemove = null
            this.connectionMaker.start = {x: 0, y: 0};
            this.connectionMaker.current = {x: 0, y: 0};
        },
        createMidiInput(num, channel) {
            this.midiIns.push(new MidiIn(num, channel));
        },
        setPosition(name, position) {
            this.$refs[name][0].style.top = position.y;
            this.$refs[name][0].style.left = position.x;
        },
        setPxPosition(name, position) {
            this.$refs[name][0].style.top = position.y + "px";
            this.$refs[name][0].style.left = position.x + "px";
        },
        export() {
            let dump = {};
            dump["parameters"] = [];
            dump["mod_links"] = [];
            dump["midi_cc"] = [];
            dump["editorconfig"] = [];

            // Store voice-specific parameters
            let store_to_parameters = this.modulators.concat(this.sources).concat([this.voice]);
            for(let voice = 0; voice < 12; voice++) {
                for(let i = 0; i < store_to_parameters.length; i++) {
                    for(let j = 0; j < store_to_parameters[i].parameters.length; j++) {
                        dump["parameters"].push({
                            key: store_to_parameters[i].parameters[j].name,
                            base_value: Number(store_to_parameters[i].parameters[j].value),
                            value: Number(store_to_parameters[i].parameters[j].value),
                            voice: voice
                        });
                    }
                }

                // Store modulator links
                for(let i = 0; i < this.links.length; i++) {
                    dump["mod_links"].push({
                        source: this.links[i].source.name,
                        destination: this.links[i].destination.name,
                        amount: this.links[i].amount,
                        voice: voice
                    });
                }                
            }

            // Store global parameters (like fx etc)
            for(let i = 0; i < this.effects.length; i++) {
                for(let j = 0; j < this.effects[i].parameters.length; j++) {
                    dump["parameters"].push({
                        key: this.effects[i].parameters[j].name,
                        base_value: Number(this.effects[i].parameters[j].value),
                        value: Number(this.effects[i].parameters[j].value),
                        voice: 0
                    });
                }
            }
            
            for(let i = 0; i < this.midiIns.length; i++) {
                dump["midi_cc"].push({
                    cc: this.midiIns[i].cc,
                    channel: this.midiIns[i].channel,
                    name: this.midiIns[i].name
                });
            }

            for(let i = 0; i < this.objects.length; i++) {
                let o = {
                    name: this.objects[i].name,
                    parameters: [],
                    object_position: {
                        x: this.$refs[this.objects[i].name][0].style.left,
                        y: this.$refs[this.objects[i].name][0].style.top
                    },
                    position: this.objects[i].position
                };

                for(let j = 0; j < this.objects[i].parameters.length; j++) {
                    o.parameters.push({
                        name: this.objects[i].parameters[j].name,
                        position: this.objects[i].parameters[j].position,
                    });
                }

                dump["editorconfig"].push(o);
            }

            return dump;
        },
        import(data) {
            if(data.midi_cc) {
                for(let i = 0; i < data.midi_cc.length; i++) {
                    this.createMidiInput(data.midi_cc[i].cc, data.midi_cc[i].channel);
                }
            }

            for(let i = 0; i < data.parameters.length; i++) {
                if(this.findParameterObject(data.parameters[i].key)) {
                    this.findParameterObject(data.parameters[i].key).value = data.parameters[i].base_value;
                }
            }
            
            if(data.editorconfig) {
                for(let i = 0; i < data.editorconfig.length; i++) {
                    let o = this.objects.find(s => {
                        return s.name === data.editorconfig[i].name;
                    });

                    this.setPosition(data.editorconfig[i].name, data.editorconfig[i].object_position);
                    o.initpos = data.editorconfig[i].object_position;

                    o.position = data.editorconfig[i].position;
                    for(let j = 0; j < data.editorconfig[i].parameters.length; j++) {
                        let p = data.editorconfig[i].parameters[j];
                        o.setPosition(p.position.x, p.position.y, p.name);
                    }
                }
            }

            if(data.mod_links) {
                for(let i = 0; i < data.mod_links.length; i++) {
                    let dest = this.findParameterObject(data.mod_links[i].destination);
                    let src = this.findModSource(data.mod_links[i].source);

                    if(dest && src && dest.links == 0) {
                        this.links.push({source: src, destination: dest, amount: data.mod_links[i].amount});
                        dest.links++;
                        src.links++;

                    }
                }
            }
        },
        findParameterObject(name) {
            for(let i = 0; i < this.objects.length; i++) {
                let r = this.objects[i].parameters.find(p => {
                    return p.name === name;
                });
                if(r) {
                    return r;
                }
            }
        },
        findModSource(name) {
            return this.objects.find(o => {
                return o.name === name;
            });
        },
        createKeyboardControls() {

        },
        createCVControls() {
            let cv = new CvIn("sync", 1, "trigger");
            this.cvIns.push(cv);
            this.setPxPosition(cv.name, cv.initpos);
        },
        clearAll() {
            this.links = [];
            for(let i = 0; i < this.objects.length; i++) {
                this.objects[i].links = 0;
                for(let j = 0; j < this.objects[i].parameters.length; j++) {
                    this.objects[i].parameters[j].links = 0;
                }
            }
        },
        removeConnection(link) {
            this.links[link].source.links--;
            this.links[link].destination.links--;
            this.links.splice(link, 1);
        }
    },
    computed: {
        objects() {
            return this.modulators.concat(this.sources).concat(this.midiIns).concat(this.cvIns).concat(this.effects).concat([this.voice]);
        }
    }
}
</script>

<style>

</style>