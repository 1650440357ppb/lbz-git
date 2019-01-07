<template>
  <div class="_wrapper">
    <top></top>
    <div class="content">
      <el-row>
        <el-col :span="15">
          <img src="../resource/common/main.png" alt="" class="login-images">
        </el-col>
        <el-col :span="7">
          <div class="forget-wrapper">
            <div class="forget-header">
              <span class="forget-title">找回密码</span>
              <router-link class="forget-link" to="/login">返回登录</router-link>
            </div>
            <!-- 找回密码01：输入手机号码或企业邮箱 -->
            <div class="forget-form" v-show="progress.stepOne">
              <el-form ref="theStepOne" :model="stepOne" :rules="rules.stepOne">
                <el-form-item prop="moblieOrEmail">
                  <el-input v-model="stepOne.moblieOrEmail" placeholder="请输入手机号码"></el-input>
                </el-form-item>
                <el-form-item prop="verifyCode" class="forget-position">
                  <el-input v-model="stepOne.verifyCode" :maxlength='4' placeholder="请输入验证码"></el-input>
                  <img :src="stepOne.verifyUrl" class="forget-absolute" @click="changeVerifyUrl">
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" class="forget-button" @click="toNextStep">下一步</el-button>
                </el-form-item>
              </el-form>
            </div>
            <!-- 找回密码02：如果输入企业邮箱则发送验证邮件 -->
            <div class="forget-form" v-show="progress.emailVerify">
              <div class="sendToEmail">
                <img class="successImage" src="../resource/forget/finish.png">
                <span class="successText">找回密码链接已发送至您的企业邮箱{{emailVerify.emailAddress}}，请<a class="targetToEmail" target="_blank" :href="emailVerify.emailWebsite">进入邮箱</a>修改</span>
              </div>
            </div>
            <!-- 找回密码02：如果输入手机号码则进行短信验证码找回 -->
            <div class="forget-form" v-show="progress.moblieVerify">
              <el-form ref="theMoblieVerify" :model="moblieVerify" :rules="rules.moblieVerify">
                <el-form-item prop="messageCode" class="forget-position">
                  <el-input v-model="moblieVerify.messageCode" :maxlength="6" placeholder="请输入短信验证码"></el-input>
                  <div class="forget-absolute">
                    <span class="verify-send-btn" v-if="moblieVerify.verifyTime==null" @click="sendMessageCode(60)">发送验证码</span>
                    <span class="verify-send-tip" v-else>重新发送( {{ moblieVerify.verifyTime }} )</span>
                  </div>
                </el-form-item>
                <el-form-item prop="submitPassword">
                  <el-input type="password" v-model="moblieVerify.submitPassword" :maxlength="20" placeholder="新密码（6~20位）"></el-input>
                </el-form-item>
                <el-form-item prop="confirmPassword">
                  <el-input type="password" v-model="moblieVerify.confirmPassword" :maxlength="20" placeholder="确认密码"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" class="forget-button" @click="moblieVerifyFunc">下一步</el-button>
                </el-form-item>
              </el-form>
            </div>
            <!-- 找回密码03：从邮箱验证链接进入 -->
            <div class="forget-form" v-show="progress.emailChange">
              <el-form :model="emailVerify" :rules="rules.emailVerify" ref="emailChange">
                <el-form-item prop="submitPassword">
                  <el-input v-model="emailVerify.submitPassword" type="password" :maxlength="20" placeholder="新密码（6~20位）"></el-input>
                </el-form-item>
                <el-form-item prop="confirmPassword">
                  <el-input v-model="emailVerify.confirmPassword" type="password" :maxlength="20" placeholder="确认密码"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" class="forget-button" @click="emailChange()">确认修改</el-button>
                </el-form-item>
              </el-form>
            </div>
            <!-- 找回密码04：修改成功，显示结果 -->
            <div class="forget-form" v-show="progress.finishChange">
              <img class="finish-image" src="../resource/forget/finish.png">
              <span class="finish-text">密码修改成功，快去登录吧！</span>
              <router-link class="finish-link" to="/login">登录</router-link>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <bottom></bottom>
  </div>
</template>
<script>
import api from '../script/api.js';
import top from './template/Top';
import bottom from './template/Bottom';
export default {
  data() {
    let discernType = ( rule, value, callback ) => {
      let mobliePattern = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
      // let emailPattern = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
      if( !mobliePattern.test(value) || value.length == 11 ) return callback(new Error("请输入正确的手机号码"))
      callback();
    }
    let checkPictureVerify = ( rule, value, callback ) => {
      // 检测图片验证码是否正确
      let self = this;
      let val = value;
      if(!self.isCheckPicture) {
        $.ajax({ url: api.checkPictureVerify, type: 'GET', data: { code: val }, xhrFields: { withCredentials: true }, crossDomain: true } ).done((res) => {
          if( res.errCode == 102 ) return callback(new Error('验证码错误'));
          callback();
          self.isCheckPicture = !self.isCheckPicture;
        })
      } else { callback(); }
    };
    let checkSamePassword = ( rule, value, callback ) => {
      let self = this;
      if( value !== this.moblieVerify.submitPassword ) return callback(new Error('两次密码输入不一致，请重新输入'));
      callback();
    };
    return {
      isCheckPicture: false,
      progress: { stepOne: true, moblieVerify: false, emailVerify: false, emailChange: false, finishChange: false },
      stepOne: { moblieOrEmail: '', verifyCode: '', verifyUrl: '' },
      emailVerify: { emailAddress: '', emailWebsite: '', submitPassword: '', confirmPassword: '' },
      moblieVerify: { messageCode: '', submitPassword: '', confirmPassword: '', tip: null, verifyTime: null },
      rules: {
        stepOne: {
          moblieOrEmail: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { validator: discernType, trigger: 'blur' }
          ],
          verifyCode: [
            { required: true, message: '请输入验证码', trigger: 'blur' },
            { min: 4, max: 4, message: '请输入4位验证码', trigger: 'blur' },
            { validator: checkPictureVerify, trigger: 'blur' }
          ]
        },
        moblieVerify: {
          messageCode: [
            { required: true, message: '请输入验证码', trigger: 'blur' },
            { min: 6, max: 6, message: '请输入4位验证码', trigger: 'blur' }
          ],
          submitPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 20, message: '请输入长度在6~20位之间的密码', trigger: 'blur' }
          ],
          confirmPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 20, message: '请输入长度在6~20位之间的密码', trigger: 'blur' },
            { validator: checkSamePassword, trigger: 'blur' }
          ]
        },
        emailVerify: {
          submitPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 20, message: '请输入长度在6~20位之间的密码', trigger: 'blur' }
          ],
          confirmPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 20, message: '请输入长度在6~20位之间的密码', trigger: 'blur' },
            { validator: checkSamePassword, trigger: 'blur' }
          ]
        }
      }
    }
  },
  created() {
    let num = Math.random();
    this.stepOne.verifyUrl = `${api.pictureVerify}?${num}`;
  },
  methods: {
    // 点击刷新图片验证码
    changeVerifyUrl() {
      let num = Math.random();
      this.stepOne.verifyUrl = `${api.pictureVerify}?${num}`;
    },
    // 找回密码01：输入手机号码或企业邮箱
    toNextStep() {
      let self = this;
      let mobliePattern = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
      // let emailPattern = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
      let value = this.stepOne.moblieOrEmail;
      this.$refs.theStepOne.validate((valid) => {
        if(valid) {
          if( mobliePattern.test(value) ) self.progress.moblieVerify = !self.progress.moblieVerify;
          // if( emailPattern.test(value) ) self.emailVerifyFunc(value);
          self.progress.stepOne = !self.progress.stepOne;
        } else { return false }
      })
    },
    // 找回密码02：如果输入企业邮箱则发送验证邮件
    emailVerifyFunc(email) {
      let self = this;
      // 进入邮箱步骤应向后端请求发送邮件的事件



      let address = {
        'qq.com': 'http://mail.qq.com', 'gmail.com': 'http://mail.google.com',
        'sina.com': 'http://mail.sina.com.cn', '163.com': 'http://mail.163.com',
        '126.com': 'http://mail.126.com', 'yeah.net': 'http://www.yeah.net/',
        'sohu.com': 'http://mail.sohu.com/', 'tom.com': 'http://mail.tom.com/',
        'sogou.com': 'http://mail.sogou.com/', '139.com': 'http://mail.10086.cn/',
        'hotmail.com': 'http://www.hotmail.com', 'live.com': 'http://login.live.com/',
        'live.cn': 'http://login.live.cn/', 'live.com.cn': 'http://login.live.com.cn',
        '189.com': 'http://webmail16.189.cn/webmail/', 'yahoo.com.cn': 'http://mail.cn.yahoo.com/',
        'yahoo.cn': 'http://mail.cn.yahoo.com/', 'eyou.com': 'http://www.eyou.com/',
        '21cn.com': 'http://mail.21cn.com/', '188.com': 'http://www.188.com/',
        'foxmail.com': 'http://www.foxmail.com', 'outlook.com': 'http://www.outlook.com'
      }
      // 用户输入邮箱格式化
      let emailWebsite = (String(email).split('@'))[1];
      let emailName = (String(email).split('@'))[0];
      // 邮箱超链接跳转
      for( let i in address ) {
        if( i == emailWebsite ) {
          self.emailVerify.emailWebsite = address[i];
        }
      };
      if( emailName.length > 3 ) {
        let start = emailName.length-1;
        let end = emailName.length;
        let _first = emailName.substring(0,1);
        let _last = emailName.substring(start,end);
        let emailAddress = _first + '***' + _last + '@' + emailWebsite;
        self.emailVerify.emailAddress = emailAddress;
      } else {
        self.emailVerify.emailAddress = email;
      }
      self.progress.emailVerify = !self.progress.emailVerify;
    },
    // 找回密码02：如果输入手机号码则进行短信验证码找回
    moblieVerifyFunc() {
      let self = this;
      let { moblieOrEmail, verifyCode } = this.stepOne;
      let { messageCode, submitPassword, confirmPassword } = this.moblieVerify;
      this.$refs.theMoblieVerify.validate((valid) => {
        if (valid) {
          // 此处保留向后端发送修改密码的代码
          $.ajax({ url: api.forgetPassword, type: 'GET', data: { mobile: moblieOrEmail, verfiyCode: verifyCode, code: messageCode, passwd: submitPassword, password_again: confirmPassword  }, xhrFields: { withCredentials: true }, crossDomain: true }).done((res) => {
            if(res.data.state == 1) {
              self.progress.moblieVerify = !self.progress.moblieVerify;
              self.progress.finishChange = !self.progress.finishChange;
            } else {
              self.$message({ showClose: true, message: res.data.msg, type: 'error' });
            }
          })
        } else {
          return false;
        }
      })
    },
    // 找回密码03：从邮箱验证链接进入
    emailChange() {
      let self = this;
      this.$refs.emailChange.validate((valid) => {
        if(valid) {
        // 此处保留向后端发送修改密码的代码


          self.progress.emailChange = !self.progress.emailChange;
          self.progress.finishChange = !self.progress.finishChange;
        } else {
          return false;
        }
      })
    },
    // 发送短信验证码
    sendMessageCode(speed) {
      let self = this;
      let timer = speed;
      let val = this.stepOne.moblieOrEmail;
      $.ajax({ url: api.sendMessageCode, type: 'POST', data: { id: 'sms', mobile: val }, xhrFields: { withCredentials: true }, crossDomain: true }).done((res) => {
        if( res.errCode !== 1 ) {
          self.$message({ showClose: true, message: '发送失败', type: 'error' });
        } else {
           let t = setInterval(function() {
            if ( timer > 0 ) { timer -= 1; self.moblieVerify.verifyTime = timer; }
            else { clearInterval(t); self.moblieVerify.verifyTime = null; }
          }, 1000);
        }
      })
    }
  },
  components: {
    top, bottom
  }
}
</script>
<style>
.content {
  width: 100%;
  max-width: 1200px;
  margin: auto;
  padding-bottom: 156px;
}
.forget-wrapper {
  margin-top: 30px;
  background-color: #fff;
  border-radius: 4px;
}
.forget {
  padding: 30px;
}
.forget-header {
  height: 60px;
  line-height: 60px;
  background-color: #fff;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom: 1px solid #cdcdd0;
}
.forget-header:before, .forget-header:after {
  display: block;
  content: "";
  width: 0;
  height: 0;
  clear: both;
}
.forget-title {
  padding-left: 30px;
  font-size: 18px;
  color: #3a99f2;
}
.forget-link {
  float: right;
  padding-right: 30px;
  font-size: 14px;
  color: #999;
  text-decoration: none;
  transition: color .2s cubic-bezier(.645, .045, .355, 1);
}
.forget-link:hover {
  color: #777;
}
.forget-form {
  min-height: 294px;
  padding: 30px;
}
.forget-form .el-input__inner {
  height: 46px;
  padding: 14px;
}
.forget-position {
  position: relative;
}
.forget-absolute {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 110px;
  height: 44px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
.forget-button {
	width: 100%;
	height: 46px;
	background-color: #3a99f2;
}
.forget-wrapper .el-form-item__label {
  height: 46px;
  padding: 0;
  padding-right: 20px;
  line-height: 46px;
}
.forget-wrapper .el-form-item__label::before {
  display: none;
}
.forget-wrapper .el-input__inner {
  height: 46px;
  padding: 14px;
}
.forget-wrapper .el-form-item__error {
  position: static;
  top: 0;
  left: 0;
  padding-top: 10px;
  line-height: 12px;
  transition: all .5s cubic-bezier(0, 1, 0.5, 1);
}
.forget-wrapper .el-form-item__error::before {
  display: inline-block;
  vertical-align: top;
  content: '';
  width: 14px;
  height: 14px;
  margin-right: 6px;
  background: url('../resource/common/warn.png') no-repeat center center;
  background-size: 14px 14px;
}
.sendToEmail {
  padding: 0 30px;
  text-align: center;
  font-size: 14px;
}
.targetToEmail {
  color: #3a99f2;
  text-decoration: none;
}
.successImage {
  display: block;
  margin: auto;
  padding: 34px 0;
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
.finish {
  text-align: center;
}
.finish-image {
  display: block;
  margin: auto;
  padding: 30px 0;
}
.finish-text {
  display: block;
  padding-bottom: 30px;
  text-align: center;
  font-size: 14px;
  color: #999;
}
.finish-link {
  display: block;
  width: 100%;
  height: 46px;
  line-height: 46px;
  background-color: #3a99f2;
  color: #fff;
  text-align: center;
  text-decoration: none;
  outline: transparent;
}
</style>