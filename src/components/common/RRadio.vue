<template>
  <!-- radio button -->
  <div class="krds-check-area">
    <div class="krds-form-check medium">
      <input type="radio" name="rdo_2-1" id="rdo_2-2">
      <label for="rdo_2-2">사이즈 : medium</label>
    </div>
    <div class="krds-form-check large">
      <input type="radio" name="rdo_2-1" id="rdo_2-3">
      <label for="rdo_2-3">사이즈 : large</label>
    </div>
  </div>
  <!-- //radio button -->
  <!-- radio button -->
  <div class="krds-check-area">
    <div class="krds-form-chip">
      <input type="radio" class="radio" name="rdo_chip" id="rdo_chip_1">
      <label class="krds-form-chip-outline" for="rdo_chip_1">chip 상태 : default </label>
    </div>
    <div class="krds-form-chip">
      <input type="radio" class="radio" name="rdo_chip" id="rdo_chip_2" checked>
      <label class="krds-form-chip-outline" for="rdo_chip_2">chip 상태 : checked </label>
    </div>
    <div class="krds-form-chip">
      <input type="radio" class="radio" name="rdo_chip" id="rdo_chip_3" disabled>
      <label class="krds-form-chip-outline" for="rdo_chip_3">chip 상태 :disabled </label>
    </div>
  </div>
  <!-- //radio button -->
  <!-- radio button -->
  <div class="fieldset">
    <div class="form-group">
      <div class="form-conts">
        <div class="krds-check-area">
          <div class="krds-form-check">
            <input type="radio" name="rdo_1" id="rdo_1">
            <label for="rdo_1">기본</label>
          </div>
          <div class="krds-form-check">
            <input type="radio" name="rdo_1" id="rdo_2" checked>
            <label for="rdo_2">선택됨</label>
          </div>
          <div class="krds-form-check">
            <input type="radio" name="rdo_1" id="rdo_3" disabled>
            <label for="rdo_3">비활성화</label>
          </div>
          <div class="krds-form-check">
            <input type="radio" name="rdo_1a" id="rdo_4" disabled checked>
            <label for="rdo_4">선택된 비활성화</label>
          </div>
        </div>
      </div>
    </div>

    <div class="form-group">
      <div class="form-conts">
        <div class="krds-check-area chk-column">
          <div class="krds-form-check ">
            <input type="radio" name="rdo_1" id="rdo_1-1" checked>
            <label for="rdo_1-1">라디오버튼</label>
            <div class="krds-form-check-cnt">
              <p class="krds-form-check-p">
                부가적인 설명이 들어갑니다.
              </p>
            </div>
          </div>
          <div class="krds-form-check">
            <input type="radio" name="rdo_1" id="rdo_1-2">
            <label for="rdo_1-2">라디오버튼</label>
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
  <!-- //radio button -->
</template>
