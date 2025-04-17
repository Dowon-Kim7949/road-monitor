<template>
  <div v-show="visible" class="popup-overlay" @click.self="onClickOutside">
    <div ref="popupContainerRef" class="popup-container" :style="popupStyle" :class="{ 'is-dragging': isDragging }">
      <div class="popup-header" @mousedown.prevent="startDrag" :style="{ cursor: isDragging ? 'grabbing' : 'grab' }">
        <div class="header-left">
          <span class="header-tag tag-level">{{ titleData.level }}</span>
          <span class="header-tag tag-status">{{ titleData.status }}</span>
          <span class="header-tag tag-coverage">{{ titleData.coverage }}</span>
        </div>
        <button class="close-button" @click="closePopup">&times;</button>
      </div>

      <div class="popup-body">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="(header, index) in tableHeaders" :key="`header-${index}`">
                {{ header.text }}
                <button v-if="header.filterable" class="filter-button" @click="emitFilter(header.key)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedData.length === 0">
              <td :colspan="tableHeaders.length" class="no-data">데이터가 없습니다.</td>
            </tr>
            <tr v-for="(row, rowIndex) in paginatedData" :key="`row-${rowIndex}`">
              <td v-for="(header, colIndex) in tableHeaders" :key="`cell-${rowIndex}-${colIndex}`">
                <template v-if="header.key === 'score'">
                  <span :style="{ color: getScoreColor(row[header.key]) }">{{ row[header.key] }}</span>
                </template>
                <template v-else-if="header.key === 'action'">
                  <button class="action-button" @click="emitAction(row)">
                    {{ row[header.key] || '상세 보기' }}
                  </button>
                </template>
                <template v-else>
                  {{ row[header.key] }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="popup-footer pagination-controls">
        <button
          class="pagination-button text-xs px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="currentPage === 1" @click="prevPage">
          이전
        </button>

        <template v-for="(page, index) in displayedPageNumbers" :key="`page-${index}`">
          <button v-if="typeof page === 'number'"
            class="pagination-button text-xs px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
            :class="{ 'active-page': page === currentPage }" :disabled="page === currentPage" @click="goToPage(page)">
            {{ page }}
          </button>
          <span v-else class="pagination-ellipsis">
            {{ page }} </span>
        </template>

        <button
          class="pagination-button text-xs px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="currentPage === totalPages" @click="nextPage">
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

// --- Props ---
const props = defineProps({
  visible: { type: Boolean, default: false },
  titleData: { type: Object, default: () => ({ /* ... */ }) },
  tableHeaders: { type: Array, default: () => [ /* ... */] },
  tableData: { type: Array, default: () => [ /* ... */] },
  closeOnOutsideClick: { type: Boolean, default: true },
  // ***** ADDED: Prop for items per page *****
  itemsPerPage: { type: Number, default: 10 }
});

// --- Emits ---
const emit = defineEmits(['update:visible', 'filter', 'action']);

// --- Refs ---
const popupContainerRef = ref(null); // Ref to access the popup container DOM element
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const initialTranslateX = ref(0); // Store the transform value when drag starts
const initialTranslateY = ref(0);
const currentTranslateX = ref(0); // Current transform value
const currentTranslateY = ref(0);
// --- Refs for Pagination ---
const currentPage = ref(1)
// --- Computed for Pagination ---
const totalPages = computed(() => {
  return Math.ceil(props.tableData.length / props.itemsPerPage);
});
// --- Computed Styles ---
const popupStyle = computed(() => ({
  // Apply transform for movement. Initial position is handled by CSS centering.
  transform: `translate(${currentTranslateX.value}px, ${currentTranslateY.value}px)`,
  // Prevent text selection while dragging header
  userSelect: isDragging.value ? 'none' : 'auto',
}));

// --- Drag Handlers ---
const startDrag = (event) => {
  // Only allow dragging with the left mouse button
  if (event.button !== 0) return;

  isDragging.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;

  // Store the current transform values when drag starts
  initialTranslateX.value = currentTranslateX.value;
  initialTranslateY.value = currentTranslateY.value;

  // Add global listeners to track mouse move and up events anywhere on the page
  document.addEventListener('mousemove', doDrag);
  document.addEventListener('mouseup', stopDrag);
};

const doDrag = (event) => {
  if (!isDragging.value) return;

  // Calculate the distance moved
  const dx = event.clientX - startX.value;
  const dy = event.clientY - startY.value;

  // Update the current transform values based on initial position + distance moved
  currentTranslateX.value = initialTranslateX.value + dx;
  currentTranslateY.value = initialTranslateY.value + dy;
};

const stopDrag = () => {
  if (!isDragging.value) return;

  isDragging.value = false;

  // Remove the global listeners
  document.removeEventListener('mousemove', doDrag);
  document.removeEventListener('mouseup', stopDrag);
};

const paginatedData = computed(() => {
  if (!props.tableData || props.tableData.length === 0) {
    return [];
  }
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return props.tableData.slice(start, end);
});

// Computed property for displaying page numbers like [1, '...', 4, 5, 6, '...', 10]
const displayedPageNumbers = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const maxVisibleButtons = 5; // Number of page buttons to show around current page
  const delta = Math.floor(maxVisibleButtons / 2);

  if (total <= 1) return []; // No pagination needed

  // Always include Prev/Next buttons externally, this calculates numbers/ellipsis
  const pages = [];

  // Add page 1
  pages.push(1);

  // Calculate the range of pages to display around the current page
  let rangeStart = Math.max(2, current - delta);
  let rangeEnd = Math.min(total - 1, current + delta);

  // Adjust range if near the beginning
  if (current - delta <= 2) { // If current page is close to the start
    rangeEnd = Math.min(total - 1, maxVisibleButtons);
  }
  // Adjust range if near the end
  if (current + delta >= total - 1) { // If current page is close to the end
    rangeStart = Math.max(2, total - maxVisibleButtons);
  }


  // Add start ellipsis if needed
  if (rangeStart > 2) {
    pages.push('...');
  }

  // Add page numbers in the calculated range
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Add end ellipsis if needed
  if (rangeEnd < total - 1) {
    pages.push('...');
  }

  // Add last page if total > 1
  if (total > 1) {
    // Avoid adding last page if it was already in the main range
    if (!pages.includes(total)) {
      pages.push(total);
    }
  }


  // Filter out potential duplicates of '...' if range is small and touches both ends
  // Or handle edge cases better in range calculation above.
  // For simplicity, let's assume range calculation is okay for now.

  return pages;
});

// --- Lifecycle and Watchers ---

// Reset position when popup becomes visible again
watch(() => props.visible, (newValue) => {
  if (newValue) {
    // Reset position to center (or initial) when shown
    // Optional: Center calculation (might need nextTick if dimensions aren't ready)
    // nextTick(() => { centerPopup(); });
    // For simplicity, reset transform to 0, assuming CSS handles initial centering
    currentTranslateX.value = 0;
    currentTranslateY.value = 0;
    initialTranslateX.value = 0;
    initialTranslateY.value = 0;
    currentPage.value = 1; // Reset to first page
  } else {
    // Clean up dragging state if popup is hidden externally
    if (isDragging.value) {
      stopDrag(); // Ensure listeners are removed
    }
  }
});

// ***** ADDED: Watch for data changes to reset pagination *****
watch(() => props.tableData, () => {
  currentPage.value = 1; // Reset to first page if data changes
}, { deep: true }); // Use deep watch if tableData structure might change internally


// --- Methods ---
function closePopup() {
  emit('update:visible', false);
}

function onClickOutside() {
  // Only close if enabled and not currently dragging
  if (props.closeOnOutsideClick && !isDragging.value) {
    closePopup();
  }
}


function getScoreColor(score) {
  if (score >= 80) return 'green';
  if (score >= 60) return 'orange';
  return 'red';
}

function emitFilter(columnKey) {
  if (isDragging.value) return; // Prevent accidental clicks during drag
  console.log('Filter clicked for:', columnKey);
  emit('filter', columnKey);
}

function emitAction(rowData) {
  if (isDragging.value) return; // Prevent accidental clicks during drag
  console.log('Action clicked for row:', rowData);
  emit('action', rowData);
}

// --- Pagination Methods ---
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function goToPage(pageNumber) {
  // Check if the input is actually a number (to ignore clicks on '...')
  if (typeof pageNumber === 'number' && pageNumber !== currentPage.value) {
    currentPage.value = pageNumber;
  }
}

// --- Cleanup ---
// Ensure listeners are removed if the component is unmounted while dragging
onBeforeUnmount(() => {
  if (isDragging.value) {
    document.removeEventListener('mousemove', doDrag);
    document.removeEventListener('mouseup', stopDrag);
  }
});

</script>

<style scoped>
.popup-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0);
  /* Keep centering for initial placement */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 700px;
  max-height: 58.3vh;
  min-height: 58.3vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.1s linear;
}

.popup-container.is-dragging {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  transition: none;
}


/* Header Styles */
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
  user-select: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-tag {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #ddd;
}

.tag-level {
  background-color: #e9ecef;
  color: #495057;
}

.tag-status {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.tag-coverage {
  background-color: #e9ecef;
  color: #495057;
}


.close-button {
  background: none;
  border: none;
  font-size: 24px;
  font-weight: bold;
  color: #6c757d;
  cursor: pointer;
  padding: 0 5px;
}

.close-button:hover {
  color: #343a40;
}

/* Body Styles */
.popup-body {
  padding: 0;
  overflow-y: auto;
  flex-grow: 1;
}

/* Table Styles */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 13px;
  vertical-align: middle;
}

.data-table th:last-child,
.data-table td:last-child {
  text-align: center;
}

.data-table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background-color: #f1f3f5;
}

.no-data {
  text-align: center;
  color: #6c757d;
  padding: 20px;
}

/* Specific Cell Styles */
.action-button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  font-size: 13px;
}

.action-button:hover {
  color: #0056b3;
}

.filter-button {
  background: none;
  border: none;
  padding: 0 0 0 5px;
  margin: 0;
  vertical-align: middle;
  cursor: pointer;
  color: #6c757d;
}

.filter-button svg {
  display: block;
}

.filter-button:hover {
  color: #343a40;
}

.popup-footer {
  padding: 10px 15px;
  border-top: 1px solid #eee;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
  /* Center pagination controls */
  align-items: center;
  gap: 5px;
  /* Spacing between buttons/ellipsis */
}

.pagination-button {
  /* Use provided classes directly in template, or define base styles here */
  /* Example of base style if not using utility classes directly: */
  /* font-size: 0.75rem; /* text-xs */
  /* padding: 0.25rem 0.75rem; /* px-3 py-1 */
  /* border: 1px solid #ccc; */
  /* border-radius: 0.25rem; /* rounded */
  /* cursor: pointer; */
  background-color: white;
  /* Default background */
  transition: background-color 0.2s ease;
  color: #333;
  /* Default text color */
}

.pagination-button:hover:not(:disabled) {
  background-color: #e9ecef;
  /* hover:bg-gray-200 */
  /* color: white; */
  /* hover:text-white - gray-100 background might make white text hard to read, adjust as needed */
}

.pagination-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-button.active-page {
  background-color: #007bff;
  /* Example active color (Bootstrap primary) */
  color: white;
  border-color: #007bff;
  cursor: default;
}

.pagination-ellipsis {
  padding: 0.25rem 0.5rem;
  color: #6c757d;
  /* Gray color for ellipsis */
  cursor: default;
}
</style>
