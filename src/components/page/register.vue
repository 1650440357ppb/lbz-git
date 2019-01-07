<template>
  <div class="_wrapper">
    <div class="_header">
        <el-row>
            <el-col :span="20">
              <img src="../resource/common/logo.png" class="_logo">
              <span class="_text">鲁班长工人管理平台</span>
            </el-col>
            <el-col :span="4">
              <div class="register-link">已有账号？<router-link class="link" to="/login">点击登录</router-link></div>
            </el-col>
        </el-row>
    </div>
    <div class="_content" v-if="!registerSuccess">
      <el-form ref="registerValidate" class="register" :model="register" :rules="rules.register">
        <div class="register-title">注册管理员</div>
        <el-form-item prop="phone" label="手机号码" label-width="100px">
          <el-input v-model="register.phone" :maxlength='11' placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-form-item prop="picture" label="图片验证码" label-width="100px" class="register-position">
          <el-input v-model="register.picture" :maxlength='4' placeholder="请输入图片验证码"></el-input>
          <img :src="verify.verifyUrl" class="register-absolute" @click="changeVerifyUrl">
        </el-form-item>
        <el-form-item prop="message" label="短信验证码" label-width="100px" class="register-position">
          <el-input v-model="register.message" :maxlength='6' placeholder="请输入短信验证码"></el-input>
          <div class="register-absolute">
            <span class="verify-send-btn" v-if="verify.verifyTime==null" @click="sendMessageCode(60)">发送验证码</span>
            <span class="verify-send-tip" v-else>重新发送( {{ verify.verifyTime }} )</span>
          </div>
        </el-form-item>
        <el-form-item prop="loginpwd" label="登录密码" label-width="100px">
          <el-input type="password" :maxlength='20' v-model="register.loginpwd" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item prop="againpwd" label="确认密码" label-width="100px">
          <el-input type="password" :maxlength='20' v-model="register.againpwd" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item class="register-margin">
          <i :class="{'agree-image':chooseAgree,'disagree-image':!chooseAgree}" @click="agreeTerm()"></i>
          <span class="register-text">我同意鲁班长<router-link to="#" class="register-alink">注册条款</router-link></span>
        </el-form-item>
        <el-form-item class="register-margin">
          <el-button type="primary" class="register-button" @click="registerSubmit" :disabled="!chooseAgree">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="_content" v-else>
      <div class="register">
        <div class="register-title">注册管理员</div>
        <div class="register-finish">
          <img src="../resource/register/finish.png" class="finish-image">
          <span class="finish-text">注册成功！快去登录吧</span>
          <router-link class="finish-link" to="/login">登录</router-link>
        </div>
      </div>
    </div>
    <bottom></bottom>
  </div>
</template>
<script>
import bottom from './template/Bottom';
import api from '../script/api.js';
export default {
  data() {
    let checkMobliephone = ( rule, value, callback ) => {
      // 检测输入的手机号码是否已注册
      let self = this;
      $.ajax({ url: api.checkPhonenum, type: 'POST', data: { mobile: self.register.phone } }).done((res) => {
        if( res.errCode !== 1 ) {
          callback(new Error('该手机号码已注册'));
          self.isRegister = !self.isRegister;
          return;
        }
        callback();
      })
    };
    let checkPictureVerify = ( rule, value, callback ) => {
      // 检测图片验证码是否正确
      let self = this;
      $.ajax({ url: api.checkPictureVerify, data: { code: self.register.picture }, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode !== 1 ) return callback(new Error('验证码错误'));
        callback();
      })
    };
    let checkPassword = ( rule, value, callback ) => {
      // 检测两次输入密码是否一致
      if ( value !== this.register.loginpwd ) return callback(new Error('两次密码输入不一致，请重新输入'));
      callback();
    };
    let checkMessageCode = ( rule, value, callback ) => {
      let mobile = this.register.phone;
      $.ajax({ url: api.checkMessageCode, type: 'POST', data: { mobile: mobile, id: 'sms', smsCode: value }, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode !== 0 ) return callback(new Error(res.errMsg));
        callback();
      })
    };
    return {
      chooseAgree: true, // 是否同意注册条款
      registerSuccess: false, // 注册完成之后切换页面
      isRegister: false,
      verify: {
        verifyUrl: '',   // 图片验证码刷新地址
        verifyTime: null,// 短信验证码剩余发送时间
      },
      register: {
        phone: '', picture: '', message: '', loginpwd: '', againpwd: ''
      },
      rules: {
        register: {
          phone: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { min: 11, max: 11, message: '请输入11位手机号码', trigger: 'blur' },
            { validator: checkMobliephone, trigger: 'blur' }
          ],
          picture: [
            { required: true, message: '请输入验证码', trigger: 'blur' },
            { min: 4, max: 4, message: '请输入4位验证码', trigger: 'blur' },
            { validator: checkPictureVerify, trigger: 'blur' }
          ],
          message: [
            { required: true, message: '请输入短信验证码', trigger: 'blur' },
            { min: 6, max: 6, message: '请输入6位短信验证码', trigger: 'blur' },
            { validator: checkMessageCode, trigger: 'blur' }
          ],
          loginpwd: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 20, message: '密码长度应在6~20位之间', trigger: 'blur' }
          ],
          againpwd: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 20, message: '密码长度应在6~20位之间', trigger: 'blur' },
            { validator: checkPassword, trigger: 'blur' }
          ]
        }
      }
    }
  },
  created() {
    let num = Math.random();
    this.verify.verifyUrl = `${api.pictureVerify}?${num}`;
  },
  methods: {
    registerSubmit() {
      // 发送管理员注册请求
      let self = this;
      this.$refs.registerValidate.validate((valid) => {
        if(valid) {
          $.ajax({ url: api.registerSubmit, type: 'POST', data: {
            mobile: self.register.phone, smsCode: self.register.message, passwd: self.register.loginpwd
          } }).done((res) => {
            if( res.errCode !== 0 && res.errCode > 100 ) {
              self.$message({ showClose: true, message: res.errMsg, type: 'error' });
            } else if ( res.errCode !== 0 && res.errCode < 0 ) {
              self.$message({ showClose: true, message: '账户已存在', type: 'error' });
            } else {
              self.registerSuccess = !self.registerSuccess;
            }
          })
        } else { return false }
      });
    },
    // 点击刷新图片验证码
    changeVerifyUrl() {
      let num = Math.random();
      this.verify.verifyUrl = `${api.pictureVerify}?${num}`;
    },
    // 发送短信验证码
    sendMessageCode(speed) {
      let self = this;
      let timer = speed;
      let val = this.register.phone;
      let mobliePattern = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
      if( !val || val == '' ) {
        self.$message({ showClose: true, message: '手机号码不能为空', type: 'error' });
        return;
      }
      if( !mobliePattern.test(val) ) {
        self.$message({ showClose: true, message: '请输入正确的手机号码', type: 'error' });
        return;
      }
      if( self.isRegister ) {
        self.$message({ showClose: true, message: '已注册手机号不能再注册', type: 'error' });
        return;
      }
      // 验证码倒计时
      $.ajax({ url: api.sendMessageCode, type: 'POST', data: { id: 'sms', mobile: val }, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode !== 1 ) {
          self.$message({ showClose: true, message: '发送失败', type: 'error' });
        } else {
          let t = setInterval(function() {
            if ( timer > 0 ) { timer -= 1; self.verify.verifyTime = timer; }
            else { clearInterval(t); self.verify.verifyTime = null; }
          }, 1000);
        }
      })
      
    },
    // 切换是否同意注册条款
    agreeTerm() {
      this.chooseAgree = !this.chooseAgree;
    }
  },
  components: {
    top, bottom
  }
}
</script>
<style>
._header {
  width: 100%;
  max-width: 1136px;
  margin: auto;
  padding: 80px 0 20px;
}
._logo {
  vertical-align: top;
}
._text {
  display: inline-block;
  padding-left: 20px;
  margin-top: 16px;
  margin-left: 20px;
  font-size: 30px;
  font-weight: lighter;
  line-height: 30px;
  border-left: 2px solid #fff;
  color: #fff;
}
._content {
  width: 100%;
  max-width: 1136px;
  margin: auto;
  margin-bottom: 120px;
  padding-bottom: 60px;
  background-color: #fff;
  border-radius: 4px;
}
.register {
  width: 400px;
  margin: auto;
  padding: 40px 30px;
}
.register-title {
  margin-bottom: 30px;
  font-size: 24px;
  text-align: center;
  color: #333;
}
.register-link {
	padding-top: 48px;
	padding-right: 6px;
	text-align: right;
	font-size: 14px;
	line-height: 14px;
	color: #c7fffd;
}
.register-link .link {
	transition: color .2s cubic-bezier(.645,.045,.355,1);
	color: #c7fffd;
	text-decoration: none;
}
.register-link .link:hover {
	color: #fff;
}
.register .el-form-item__label {
  height: 46px;
  padding: 0;
  padding-right: 20px;
  line-height: 46px;
}
.register .el-form-item__label::before {
  display: none;
}
.register .el-input__inner {
  height: 46px;
  padding: 14px;
}
.register .el-form-item__error {
  position: static;
  top: 0;
  left: 0;
  padding-top: 10px;
  line-height: 12px;
}
.register .el-form-item__error::before {
  display: inline-block;
  vertical-align: top;
  content: '';
  width: 14px;
  height: 14px;
  margin-right: 6px;
  background: url('../resource/common/warn.png') no-repeat center center;
  background-size: 14px 14px;
}
.register-position {
  position: relative;
}
.register-absolute {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 110px;
  height: 44px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
.verify-send-btn {
  display: block;
  width: 110px;
  height: 44px;
  line-height: 44px;
  text-align: center;
  background-color: #3a99f2;
  color: #fff;
  cursor: pointer;
}
.verify-send-tip {
  display: block;
  width: 110px;
  height: 44px;
  line-height: 44px;
  text-align: center;
  background-color: #e1e1e1;
  color: #fff;
  cursor: not-allowed;
}
.register-margin {
  margin-left: 100px;
}
.register-margin .el-form-item__content {
  line-height: 14px;
}
.register-text {
  vertical-align: top;
  color: #97a8be;
}
.register-alink {
  color: #333;
  text-decoration: none;
}
.register-button {
	width: 100%;
	height: 46px;
	background-color: #3a99f2;
}
.agree-image {
	display: inline-block;
	width: 14px;
	height: 14px;
	background: url("../resource/register/agree.png")no-repeat top center;
	background-size: 100% 100%;
	vertical-align: top;
	cursor: pointer;
}
.disagree-image {
	display: inline-block;
	width: 14px;
	height: 14px;
	background: url("../resource/register/disagree.png")no-repeat top center;
	background-size: 100% 100%;
	vertical-align: top;
	cursor: pointer;
}
.register-finish {
	text-align: center;
}
.finish-image {
	display: block;
	margin: auto;
	padding: 30px 0;
}
.finish-text {
	font-size: 14px;
	color: #999;
}
.finish-link {
	display: block;
	width: 300px;
	height: 46px;
	margin: 30px auto;
	text-align: center;
	line-height: 46px;
	background-color: #3a99f2;
	color: #fff;
	border-radius: 4px;
	text-decoration: none;
}
</style>