<template>
  <div>
      <div class="bg-gray-50 h-screen w-screen">
          <div class="fixed px-4 mt-4 w-full flex flex-row items-center z-40">
            <h4 class="text-lg">donut <span class="text-teal-400">editor</span></h4>

            <div class="flex-auto"></div>

            <input class="bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-sm hover:shadow-md text-gray-600 text-sm text-center" v-model="presetName" placeholder="Preset name">

            <div class="flex-auto"></div>

            <div class="bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-sm hover:shadow-md text-gray-500 font-bold text-sm cursor-pointer mr-4" @click="openFile">
                import
            </div>
            <div class="bg-teal-400 hover:bg-teal-500 px-4 py-2 rounded-lg shadow-sm hover:shadow-md text-white font-bold text-sm cursor-pointer" @click="exportHandler">
                export
            </div>
          </div>

          <EditorCanvas ref="editor" />

          <div class="fixed bottom-0 w-full p-4 flex flex-row items-center">
              <div class="flex-auto"></div>
                <div class="bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-sm hover:shadow-md text-gray-500 font-bold text-sm cursor-pointer mr-4" @click="addingMidiInput = true">
                    + midi input
                </div>
                <div class="bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-sm hover:shadow-md text-gray-500 font-bold text-sm cursor-pointer mr-4" @click="addKeyboardControls">
                    + keyboard controls
                </div>
                <div class="bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-sm hover:shadow-md text-gray-500 font-bold text-sm cursor-pointer mr-4" @click="addCVControls">
                    + cv controls
                </div>
                <div class="bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-sm hover:shadow-md text-gray-500 font-bold text-sm cursor-pointer mr-4" @click="clearAll">
                    x <span class="text-red-500">clear</span>
                </div>
              <div class="flex-auto"></div>
          </div>

          <MidiInputModal v-if="addingMidiInput" @done="createMidiInput" />
          <ImportModal v-if="openImportModal" />
          <a id="downloadAnchorElem" style="display:none"></a>
          <input type="file" id="importPreset" style="display:none" @change="readFile">
      </div>
  </div>
</template>

<script>
import EditorCanvas from "./EditorCanvas.vue";
import MidiInputModal from "./MidiInput";

export default {
    components: {
        EditorCanvas,
        MidiInputModal
    },
    data() {
        return {
            presetName: "Untitled",
            file: null,
            addingMidiInput: false,
            allowKeyboardControlsAdd: true,
            allowCVControlsAdd: true
        }
    },
    methods: {
        createMidiInput({cc, channel}) {
            this.$refs.editor.createMidiInput(cc, channel);
            this.addingMidiInput = false;
        },
        addKeyboardControls() {
            if(this.allowKeyboardControlsAdd) {
                this.$refs.editor.createKeyboardControls();
                this.allowKeyboardControlsAdd = false;
            }
        },
        addCVControls() {
            if(this.allowCVControlsAdd) {
                this.$refs.editor.createCVControls();
                this.allowCVControlsAdd = false;
            }
        },
        importHandler(e) {
            this.$refs.editor.import(JSON.parse(e.target.result));
        },
        exportHandler() {
            // Credits: https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
            let data = this.$refs.editor.export();
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
            var dlAnchorElem = document.getElementById('downloadAnchorElem');
            dlAnchorElem.setAttribute("href",     dataStr     );
            dlAnchorElem.setAttribute("download", this.presetName.toLowerCase().replace(" ", "_") + ".donutpreset");
            dlAnchorElem.click();
        },
        openFile() {
            var input = document.getElementById('importPreset');
            input.click();
        },
        readFile(e) {
            let file = e.target.files[0];

            this.presetName = file.name.replace(".donutpreset", "");

            var reader = new FileReader();
            reader.onload = this.importHandler;
            reader.readAsText(file);
        },
        clearAll() {
            this.$refs.editor.clearAll();
        },
        toggleDelete() {
            this.$refs.editor.toggleDelete();
        }
    }
}
</script>

<style>

</style>