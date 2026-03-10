<template>
  <v-main>
    <v-container class="py-10">

      <h1 class="mb-6">Vuetify Grid Alignment Test</h1>

      <!-- CENTER ALIGN TEST -->
      <v-row class="mb-10" justify="center" align="center" style="height:200px; background:#eef5fb">
        <v-col cols="3">
          <v-sheet class="box">A</v-sheet>
        </v-col>

        <v-col cols="3">
          <v-sheet class="box">B</v-sheet>
        </v-col>

        <v-col cols="3">
          <v-sheet class="box">C</v-sheet>
        </v-col>
      </v-row>

      <!-- SPACE BETWEEN TEST -->
      <v-row class="mb-10" justify="space-between" align="center" style="height:200px; background:#eef5fb">
        <v-col cols="3">
          <v-sheet class="box">Left</v-sheet>
        </v-col>

        <v-col cols="3">
          <v-sheet class="box">Center</v-sheet>
        </v-col>

        <v-col cols="3">
          <v-sheet class="box">Right</v-sheet>
        </v-col>
      </v-row>

      <!-- ALIGN TOP -->
      <v-row class="mb-10" align="start" style="height:200px; background:#eef5fb">
        <v-col cols="4">
          <v-sheet class="box tall">Top</v-sheet>
        </v-col>

        <v-col cols="4">
          <v-sheet class="box">Middle</v-sheet>
        </v-col>

        <v-col cols="4">
          <v-sheet class="box short">Bottom</v-sheet>
        </v-col>
      </v-row>

      <!-- ALIGN BOTTOM -->
      <v-row align="end" style="height:200px; background:#eef5fb">
        <v-col cols="4">
          <v-sheet class="box tall">Tall</v-sheet>
        </v-col>

        <v-col cols="4">
          <v-sheet class="box">Normal</v-sheet>
        </v-col>

        <v-col cols="4">
          <v-sheet class="box short">Short</v-sheet>
        </v-col>
      </v-row>

    </v-container>
  </v-main>
</template>

<script setup lang="ts">
</script>

<style scoped>

.box {
  background: #2f5d9f;
  color: white;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.tall {
  height: 120px;
}

.short {
  height: 40px;
}

</style>