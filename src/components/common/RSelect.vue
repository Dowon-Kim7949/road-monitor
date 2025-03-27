<template>
  <!-- select -->
  <div class="fieldset">
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="select_name">레이블</label>
      </div>
      <div class="form-conts">
        <select id="select_name" class="krds-form-select" title="선택">
          <option value="">항목1</option>
          <option value="">항목2</option>
          <option value="">항목3</option>
          <option value="">항목4</option>
        </select>
      </div>
      <p class="form-hint">도움말</p>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="select_name4">레이블</label>
      </div>
      <div class="form-conts">
        <select id="select_name4" class="krds-form-select completed" title="선택">
          <option value="" selected>선택완료 상태</option>
          <option value="">항목2</option>
          <option value="">항목3</option>
          <option value="">항목4</option>
        </select>
      </div>
      <p class="form-hint">도움말</p>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="select_error">레이블</label>
      </div>
      <div class="form-conts">
        <select id="select_error" class="krds-form-select is-error" title="선택">
          <option value="">항목1</option>
          <option value="">항목2</option>
          <option value="">항목3</option>
          <option value="">항목4</option>
        </select>
      </div>
      <p class="form-hint-invalid">도움말</p>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="select_name3">레이블</label>
      </div>
      <div class="form-conts">
        <select id="select_name3" class="krds-form-select" title="선택" disabled>
          <option value="">disabled</option>
          <option value="">항목2</option>
          <option value="">항목3</option>
          <option value="">항목4</option>
        </select>
      </div>
      <p class="form-hint">도움말</p>
    </div>
    <!-- //폼그룹 -->
  </div>
  <!-- //select -->
  <div class="fieldset">
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="select_error">레이블</label>
      </div>
      <div class="form-conts">
        <select id="select_error" class="krds-form-select is-error" title="선택">
          <option value="">항목1</option>
          <option value="">항목2</option>
          <option value="">항목3</option>
          <option value="">항목4</option>
        </select>
      </div>
      <p class="form-hint-invalid">도움말</p>
    </div>
    <!-- //폼그룹 -->
  </div>
  <!-- select -->
  <select id="select_sorting" class="krds-form-select-sort" title="선택">
    <option value="">항목1</option>
    <option value="">항목2</option>
    <option value="">항목3</option>
    <option value="">항목4</option>
  </select>
  <select id="select_sorting_large" class="krds-form-select-sort large" title="선택">
    <option value="" selected>항목1</option>
    <option value="">항목2</option>
    <option value="">항목3</option>
  </select>
  <select id="select_sorting_medium" class="krds-form-select-sort medium" title="선택">
    <option value="">항목1</option>
    <option value="" selected>항목2</option>
    <option value="">항목3</option>
  </select>
  <select id="select_sorting_small" class="krds-form-select-sort small" title="선택">
    <option value="">항목1</option>
    <option value="">항목2</option>
    <option value="" selected>항목3</option>
  </select>
  <!-- //select -->
  <!-- select -->
  <div class="fieldset">
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="select_size_small">레이블</label>
      </div>
      <div class="form-conts">
        <select id="select_size_small" class="krds-form-select large" title="선택">
          <option value="" selected>large</option>
          <option value="">medium</option>
          <option value="">small</option>
        </select>
      </div>
      <p class="form-hint">도움말</p>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="select_size_medium">레이블</label>
      </div>
      <div class="form-conts">
        <select id="select_size_medium" class="krds-form-select medium" title="선택">
          <option value="">large</option>
          <option value="" selected>medium</option>
          <option value="">small</option>
        </select>
      </div>
      <p class="form-hint">도움말</p>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="select_size_large">레이블</label>
      </div>
      <div class="form-conts">
        <select id="select_size_large" class="krds-form-select small" title="선택">
          <option value="">large</option>
          <option value="">medium</option>
          <option value="" selected>small</option>
        </select>
      </div>
      <p class="form-hint">도움말</p>
    </div>
    <!-- //폼그룹 -->
  </div>
  <!-- //select -->
</template>
