<template>
  <div>
      <div id="backdrop" class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-20" @click="$emit('exit')"></div>
      <div class="absolute h-full w-full top-0 left-0 z-30">
        <div class="w-full h-full flex items-center">
            <div class="p-10 bg-white rounded-lg mx-auto">
                <div class="flex flex-row items-center mb-4">
                    <h5 class="text-xl flex-auto font-bold mr-8">Create a MIDI CC input</h5>
                    <span class="text-gray-500 hover:text-gray-700 fas fa-times cursor-pointer" @click="$emit('exit')">x</span>
                </div>

                <div class="flex flex-row items-center">
                    <label>
                        <small class="text-xs text-teal-600 font-bold">CC</small><br>
                        <input type="number" placeholder="CC" v-model="cc">
                    </label>
                    <label>
                        <small class="text-xs text-teal-600 font-bold">MIDI Channel</small><br>
                        <input type="number" placeholder="Channel" v-model="channel">
                    </label>
                </div>

                <div class="flex flex-row items-center mt-8">
                    <button class="font-bold text-teal-500" @click="add()">Add</button>
                    <span class="flex-auto"></span>
                    <button class="font-bold text-red" @click="$emit('exit')">Cancel</button>
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
            cc: null,
            channel: 0
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