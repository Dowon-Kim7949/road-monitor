<template>
  <!-- text input -->
  <div class="fieldset">
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="consult_name">레이블</label>
      </div>
      <div class="form-conts">
        <input type="text" id="consult_name" class="krds-input" placeholder="플레이스홀더">
      </div>
      <p class="form-hint">도움말</p>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="consult_name2">레이블</label>
      </div>
      <div class="form-conts">
        <input type="text" id="consult_name2" class="krds-input" placeholder="플레이스홀더" value="readonly" readonly>
      </div>
      <p class="form-hint">도움말</p>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="consult_name3">레이블</label>
      </div>
      <div class="form-conts">
        <input type="text" id="consult_name3" class="krds-input" placeholder="플레이스홀더" value="disabled" disabled>
      </div>
      <p class="form-hint">도움말</p>
    </div>
    <!-- //폼그룹 -->
  </div>
  <!-- //text input -->
  <!-- text input -->
  <div class="fieldset">
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="consult_name21">레이블</label>
      </div>
      <div class="form-conts is-error">
        <input type="text" id="consult_name21" class="krds-input" placeholder="플레이스홀더" value="에러">
      </div>
      <p class="form-hint-invalid">에러 메시지</p>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="consult_name22">레이블</label>
      </div>
      <div class="form-conts is-success">
        <input type="text" id="consult_name22" class="krds-input" placeholder="플레이스홀더" value="성공">
      </div>
      <p class="form-hint-success">성공 메시지</p>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="consult_name23">레이블</label>
      </div>
      <div class="form-conts is-information">
        <input type="text" id="consult_name23" class="krds-input" placeholder="플레이스홀더" value="정보">
      </div>
      <p class="form-hint-information">정보 메시지</p>
    </div>
    <!-- //폼그룹 -->
  </div>
  <!-- //text input -->
  <!-- text input -->
  <div class="fieldset">
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="consult_name31">레이블</label>
      </div>
      <div class="form-conts">
        <input type="text" id="consult_name31" class="krds-input small" placeholder="플레이스홀더">
      </div>
      <p class="form-hint">도움말</p>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="consult_name32">레이블</label>
      </div>
      <div class="form-conts">
        <input type="text" id="consult_name32" class="krds-input medium" placeholder="플레이스홀더">
      </div>
      <p class="form-hint">도움말</p>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="consult_name33">레이블</label>
      </div>
      <div class="form-conts">
        <input type="text" id="consult_name33" class="krds-input large" placeholder="플레이스홀더">
      </div>
      <p class="form-hint">도움말</p>
    </div>
    <!-- //폼그룹 -->
  </div>
  <!-- //text input -->
  <!-- text input -->
  <div class="fieldset">
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="login_pw">레이블</label>
      </div>
      <div class="form-conts btn-ico-wrap">
        <input type="password" id="login_pw" class="krds-input" placeholder="8-12자의 영문자, 숫자, 특수문자 조합"
          value="1234567890">
        <button type="button" class="krds-btn medium icon">
          <span class="sr-only">입력한 비밀번호 보기</span>
          <i class="svg-icon ico-pw-visible"></i>
        </button>
      </div>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="login_pw2">레이블</label>
      </div>
      <div class="form-conts btn-ico-wrap">
        <input type="text" id="login_pw2" class="krds-input" placeholder="8-12자의 영문자, 숫자, 특수문자 조합" value="1234567890">
        <button type="button" class="krds-btn medium icon">
          <span class="sr-only">입력한 비밀번호 가리기</span>
          <i class="svg-icon ico-pw-visible-on"></i>
        </button>
      </div>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="form_delete">레이블</label>
      </div>
      <div class="form-conts btn-ico-wrap" data-delete="true">
        <input type="text" id="form_delete" class="krds-input" placeholder="내용을 입력하세요">
        <button type="button" class="krds-btn medium icon pure btn-delete-input">
          <span class="sr-only">내용 삭제</span>
          <i class="svg-icon ico-delete-fill"></i>
        </button>
      </div>
    </div>
    <!-- //폼그룹 -->
    <!-- 폼그룹 -->
    <div class="form-group">
      <div class="form-tit">
        <label for="form_btn_multiple">레이블</label>
      </div>
      <div class="form-conts btn-ico-wrap" data-delete="true">
        <input type="password" id="form_btn_multiple" class="krds-input" placeholder="8-12자의 영문자, 숫자, 특수문자 조합"
          value="1234567890">
        <div class="btn-group">
          <button type="button" class="krds-btn medium icon pure btn-delete-input">
            <span class="sr-only">내용 삭제</span>
            <i class="svg-icon ico-delete-fill"></i>
          </button>
          <button type="button" class="krds-btn medium icon">
            <span class="sr-only">입력한 비밀번호 보기</span>
            <i class="svg-icon ico-pw-visible"></i>
          </button>
        </div>
      </div>
    </div>
    <!-- //폼그룹 -->
  </div>
  <!-- //text input -->
</template>
