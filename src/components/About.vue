<template>
  <div>
      <div id="backdrop" class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-20" @click="$emit('exit')"></div>
      <div class="absolute h-full w-full top-0 left-0 z-30 ">
        <div class="w-full h-full flex items-center">
            <div class="p-10 bg-white rounded-lg mx-auto">
                <div class="flex flex-row items-center mb-4">
                    <h5 class="text-xl flex-auto font-bold mr-8"><span class="text-gray-400">About</span> donut <span class="text-teal-500">editor</span></h5>
                    <span class="text-red-400 hover:text-red-700 fas fa-times cursor-pointer" @click="$emit('exit')">x</span>
                </div>

                <div class="max-w-lg mb-4">
                    <p class="text-sm text-gray-700">Donut Editor is a patch editor for the Donut firmware running on the EL-ONE hardware synthesizer.</p>
                    <p class="text-sm text-gray-500">Copyright &copy; 2022 Dani&euml;l Kamp. All rights reserved.</p>
                </div>

                <div class="max-w-lg">
                    <h6 class="text-lg font-bold">Version history</h6>
                    <div v-for="version in versions" :key="versions.indexOf(version)" class="p-1 py-2">
                        <b>{{version.version}}</b>: <span>{{version.description}}</span>
                        <ul class="list-disc ml-4 text-sm">
                            <li v-for="change in version.changes" :key="version.changes.indexOf(change)">{{change}}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
            versions: [
                {version: "1.0", description: "Initial release.", changes: ["Added initial set of objects", "Added import and export features"], date: ""},
                {version: "1.1", description: "Feature update.", changes: ["Added modulator link amounts", "Added Stereo Delay effect", "Added Sampler source"], date: "15-04-2022"},
            ]
        }
    },
    methods: {
        add() {
            this.$emit('done', {cc: this.cc, channel: this.channel});
        }
    }
}
</script>

<style>

</style>