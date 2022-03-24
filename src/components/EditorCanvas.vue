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
                    v-if="['modulator', 'midi'].includes(obj.type)"
                    @mousedown="createConnectionStart('source', obj, 'output', $event)"
                    @mouseup="createConnectionEnd(objects.indexOf(obj), 'output', $event)">
                </span>
            </div>
        </div>

        <svg class="h-full w-full">
            <line v-for="line in links" :key="links.indexOf(line)" :x1="line.source.position.x" :y1="line.source.position.y" :x2="line.destination.position.x" :y2="line.destination.position.y" stroke="black" @dblclick="removeConnection(line)" />
            <line :x1="connectionMaker.start.x" :y1="connectionMaker.start.y" :x2="connectionMaker.current.x" :y2="connectionMaker.current.y" stroke="grey" />
        </svg>
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
import MidiIn from "../synthobjects/MidiIn";

export default {
    data() {
        return {
            modulators: [],
            sources: [],
            midiIns: [],
            links: [],
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
            }
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

            if(this.connecting.from === "source") {
                this.links.push({source: from, destination: to});
            } else {
                this.links.push({source: to, destination: from});
            }

            to.links++;
            from.links++;

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
        export() {
            let dump = {};
            dump["parameters"] = [];
            dump["mod_links"] = [];

            let store_to_parameters = this.modulators.concat(this.sources);
            for(let voice = 0; voice < 12; voice++) {
                for(let i = 0; i < store_to_parameters.length; i++) {
                    for(let j = 0; j < store_to_parameters[i].parameters.length; j++) {
                        dump["parameters"].push({
                            key: store_to_parameters[i].parameters[j].name,
                            base_value: store_to_parameters[i].parameters[j].value,
                            value: store_to_parameters[i].parameters[j].value,
                            voice: voice
                        });
                    }
                }

                for(let i = 0; i < this.links.length; i++) {
                    dump["mod_links"].push({
                        source: this.links[i].source.name,
                        destination: this.links[i].destination.name,
                        amount: 1.0,
                        voice: voice
                    });
                }
            }

            return dump;
        },
        import(data) {
            console.log(data);
            for(let i = 0; i < data.parameters.length; i++) {
                if(this.findParameterObject(data.parameters[i].key)) {
                    this.findParameterObject(data.parameters[i].key).value = data.parameters[i].value;
                }
            }

            for(let i = 0; i < data.mod_links.length; i++) {
                let dest = this.findParameterObject(data.mod_links[i].destination);
                let src = this.findModSource(data.mod_links[i].source);

                if(dest && dest.links == 0) {
                    this.links.push({source: src, destination: dest});
                    dest.links++;
                    src.links++;

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
        }
    },
    computed: {
        objects() {
            return this.modulators.concat(this.sources).concat(this.midiIns);
        }
    }
}
</script>

<style>

</style>