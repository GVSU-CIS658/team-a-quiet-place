<template>
  <div>
    <input type="radio" id="t0" value="Winter" v-model="season" />
    <label for="t0">Winter</label>
    <input type="radio" id="t1" value="Spring" v-model="season" />
    <label for="t1">Spring</label>
    <input type="radio" id="t2" value="Summer" v-model="season" />
    <label for="t2">Summer</label>
    <input type="radio" id="t3" value="Fall" v-model="season" />
    <label for="t3">Fall</label>
    <p>You chose {{ season }}</p>
    <select v-model="season">
      <option value="Winter">Winter</option>
      <option value="Spring">Spring</option>
      <option value="Summer">Summer</option>
      <option value="Fall">Fall</option>
    </select>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
const season = ref("Fall");
</script>