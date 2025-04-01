<template>
  <!-- checkbox -->
  <div class="fieldset">
    <div class="form-group">
      <div class="form-conts">
        <div class="krds-check-area">
          <div class="krds-form-check">
            <input type="checkbox" name="chk_1" id="chk_1">
            <label for="chk_1">기본</label>
          </div>
          <div class="krds-form-check">
            <input type="checkbox" name="chk_1" id="chk_2" checked>
            <label for="chk_2">선택됨</label>
          </div>
          <div class="krds-form-check">
            <input type="checkbox" name="chk_1" id="chk_3" disabled>
            <label for="chk_3">비활성화</label>
          </div>
          <div class="krds-form-check">
            <input type="checkbox" name="chk_1" id="chk_4" disabled checked>
            <label for="chk_4">선택된 비활성화</label>
          </div>
        </div>
      </div>
    </div>

    <div class="form-group">
      <div class="form-conts">
        <div class="krds-check-area chk-column">
          <div class="krds-form-check ">
            <input type="checkbox" id="chk_additional_1" checked>
            <label for="chk_additional_1">체크박스</label>
            <div class="krds-form-check-cnt">
              <p class="krds-form-check-p">
                부가적인 설명이 들어갑니다.
              </p>
            </div>
          </div>
          <div class="krds-form-check">
            <input type="checkbox" id="chk_additional_2">
            <label for="chk_additional_2">체크박스</label>
            <div class="krds-form-check-cnt">
              <p class="krds-form-check-p">
                부가적인 설명이 들어갑니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- //checkbox -->
  <!-- checkbox -->
  <div class="krds-check-area">
    <div class="krds-form-check medium">
      <input type="checkbox" id="chk_1-2a">
      <label for="chk_1-2a">사이즈 : medium</label>
    </div>
    <div class="krds-form-check large">
      <input type="checkbox" id="chk_1-3a">
      <label for="chk_1-3a">사이즈 : large</label>
    </div>
  </div>
  <!-- //checkbox -->
  <!-- checkbox -->
  <div class="krds-check-area">
    <div class="krds-form-chip">
      <input type="checkbox" class="checkbox" id="chk_chip_1">
      <label class="krds-form-chip-outline" for="chk_chip_1">chip 상태 : default</label>
    </div>
    <div class="krds-form-chip">
      <input type="checkbox" class="checkbox" id="chk_chip_2" checked>
      <label class="krds-form-chip-outline" for="chk_chip_2">chip 상태 : checked</label>
    </div>
    <div class="krds-form-chip">
      <input type="checkbox" class="checkbox" id="chk_chip_3" disabled>
      <label class="krds-form-chip-outline" for="chk_chip_3">chip 상태 : disabled</label>
    </div>
  </div>
  <!-- //checkbox -->
</template>
