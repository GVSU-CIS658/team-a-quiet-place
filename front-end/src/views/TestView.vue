<template>
  <v-container fluid class="test-page pa-6">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold mb-2">Test Page</h1>
      <p class="text-body-1 text-medium-emphasis">
        This page is just for checking that routing and layout are working.
      </p>
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <v-card rounded="xl" elevation="2" class="pa-6">
          <div class="text-h6 font-weight-bold mb-3">Route check</div>
          <div class="text-body-1 mb-4">
            If you can see this card, then <strong>TestView.vue</strong> is
            rendering correctly.
          </div>

          <v-chip color="success" variant="tonal" class="mr-2 mb-2">
            Route works
          </v-chip>
          <v-chip color="primary" variant="tonal" class="mr-2 mb-2">
            Vuetify works
          </v-chip>
          <v-chip color="secondary" variant="tonal" class="mb-2">
            Layout works
          </v-chip>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="2" class="pa-6">
          <div class="text-h6 font-weight-bold mb-3">Quick navigation</div>

          <div class="d-flex flex-column ga-3">
            <v-btn color="primary" rounded="xl" :to="{ name: 'home' }">
              Go Home
            </v-btn>

            <v-btn variant="outlined" rounded="xl" :to="{ name: 'login' }">
              Go Login
            </v-btn>

            <v-btn variant="outlined" rounded="xl" :to="{ name: 'signup' }">
              Go Signup
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="2" class="pa-6 mt-6">
      <div class="text-h6 font-weight-bold mb-3">Sample content</div>

      <v-row>
        <v-col
          cols="12"
          sm="6"
          lg="4"
          v-for="item in testItems"
          :key="item.title"
        >
          <v-card rounded="lg" variant="tonal" class="pa-4 h-100">
            <div class="text-subtitle-1 font-weight-bold mb-2">
              {{ item.title }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ item.description }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <v-btn
      icon="mdi-filter-variant"
      color="primary"
      size="large"
      elevation="8"
      class="filter-fab"
      @click="filterDialog = true"
    />

    <v-dialog v-model="filterDialog" max-width="420">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          Test Filter
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="filters.keyword"
            label="Keyword"
            variant="outlined"
            rounded="lg"
            class="mb-3"
          />

          <v-select
            v-model="filters.type"
            :items="typeOptions"
            label="Type"
            variant="outlined"
            rounded="lg"
            class="mb-3"
          />

          <v-switch
            v-model="filters.onlyOpen"
            label="Only show open"
            color="primary"
            hide-details
          />
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-btn variant="text" @click="resetFilters"> Reset </v-btn>

          <v-spacer />

          <v-btn variant="text" @click="filterDialog = false"> Cancel </v-btn>

          <v-btn color="primary" rounded="xl" @click="applyFilters">
            Apply
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";

const filterDialog = ref(false);

const typeOptions = ["Library", "Cafe", "Study spot", "Outdoor"];

const filters = reactive({
  keyword: "",
  type: "",
  onlyOpen: false,
});

const testItems = [
  {
    title: "Kirkhof",
    description: "A simple test card to verify the page layout is rendering.",
  },
  {
    title: "Library",
    description: "Another card to make sure the grid and spacing look right.",
  },
  {
    title: "Coffee Spot",
    description:
      "Useful for checking your visual style before real data is added.",
  },
];

function resetFilters() {
  filters.keyword = "";
  filters.type = "";
  filters.onlyOpen = false;
}

function applyFilters() {
  console.log("Test filters:", { ...filters });
  filterDialog.value = false;
}
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background: #f6f8fc;
}

.page-header {
  max-width: 720px;
}

.filter-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
}

@media (max-width: 600px) {
  .filter-fab {
    right: 16px;
    bottom: 16px;
  }
}
</style>
