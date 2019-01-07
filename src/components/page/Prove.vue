<template>
  <div class="prove">
    <div class="oneStep" v-show="process == 0">
      <el-form ref="oneStepValidate" id="prove-form-one" method="POST" enctype="multipart/form-data" :model="oneStep" :rules="rules.oneStep">
        <div class="prove-title">上传营业执照</div>
        <el-form-item label="营业执照" label-width="152px">
          <el-upload :action="fileUrl" name="licenseImg" :auto-upload="false" :with-credentials="true" :before-upload="uploadImage">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">支持jpg、jpeg、bmp、png格式图片，大小不得超过2MB</div>
          </el-upload>
        </el-form-item>
        <div class="prove-title">填写基本信息</div>
        <el-form-item prop="name" label="名称" label-width="152px">
          <el-input v-model="oneStep.name" name="organizationName" placeholder="必须与营业执照一致"></el-input>
        </el-form-item>
        <el-form-item prop="code" label="社会统一信用代码" label-width="152px">
          <el-input v-model="oneStep.code" name="organizationCode" placeholder="必须与营业执照一致"></el-input>
        </el-form-item>
        <el-form-item prop="leading" label="法人、代表人/负责人" label-width="152px">
          <el-input v-model="oneStep.leading" name="master" placeholder="如属分支机构请填写执照上明确的负责人，否则一律是法定代表人"></el-input>
        </el-form-item>
        <el-form-item label="企业类型" label-width="152px">
          <el-select v-model="oneStep.kind" name="type" style="width: 100%;" placeholder="请选择企业类型">
            <el-option value="开发单位"></el-option>
            <el-option value="监理单位"></el-option>
            <el-option value="施工单位"></el-option>
            <el-option value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="办公电话" label-width="152px">
          <el-input v-model="oneStep.phone" name="contactNumber" placeholder="包括区号、电话、分机号，以“-”隔开"></el-input>
        </el-form-item>
        <el-form-item prop="money" label="注册资金" label-width="152px">
          <el-input v-model.number="oneStep.money" name="fund" placeholder="请输入注册资金数额">
            <template slot="append">万元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="开户银行" label-width="152px">
          <el-input v-model="oneStep.bank" name="bank" placeholder="请输入开户银行"></el-input>
        </el-form-item>
        <el-form-item label="银行账户" label-width="152px">
          <el-input v-model="oneStep.idcard" name="bankNum" placeholder="请输入银行账户"></el-input>
        </el-form-item>
        <el-form-item prop="address" label="公司详细地址" label-width="152px">
          <el-input v-model="oneStep.address" name="address" placeholder="请输入公司详细地址"></el-input>
        </el-form-item>
        <el-form-item prop="linkman" label="联系人" label-width="152px">
          <el-input v-model="oneStep.linkman" name="contacts" placeholder="请输入联系人"></el-input>
        </el-form-item>
        <el-form-item prop="moblie" label="联系人电话" label-width="152px">
          <el-input v-model.number="oneStep.moblie" name="mobilePhone" placeholder="请输入联系人电话"></el-input>
        </el-form-item>
        <el-form-item class="oneStep-btn">
          <el-button type="primary" @click="firstStep">下一步</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="twoStep" v-show="process == 1">
      <el-form ref="twoStepValidate" id="prove-form-two" :model="twoStep" :rules="rules.twoStep">
        <div class="prove-title">企业账号设置</div>
        <el-form-item prop="companyEmailAddress" label="企业邮箱" label-width="152px">
          <el-input v-model="twoStep.companyEmailAddress" name="account" placeholder="请输入企业邮箱"></el-input>
        </el-form-item>
        <el-form-item prop="encode" label="邮箱验证码" label-width="152px" class="prove-position">
          <el-input v-model="twoStep.encode" name="emsCode" placeholder="请输入验证码"></el-input>
          <div class="prove-absolute">
            <span class="verify-send-btn" v-if="twoStep.verifyTime==null" @click="sendMessageCode(60)">发送验证码</span>
            <span class="verify-send-tip" v-else>重新发送( {{ twoStep.verifyTime }} )</span>
          </div>
        </el-form-item>
        <el-form-item prop="submitPassword" label="设置密码" label-width="152px">
          <el-input type="password" v-model="twoStep.submitPassword" placeholder="请输入密码(6~20位)"></el-input>
        </el-form-item>
        <el-form-item prop="repeatPassword" label="确认密码" label-width="152px">
          <el-input type="password" name="password" v-model="twoStep.repeatPassword" placeholder="确认密码"></el-input>
        </el-form-item>
        <el-form-item class="twoStep-btn">
          <el-button @click="lastStep">上一步</el-button>
          <el-button type="primary" @click="secondStep">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="threeStep" v-show="process == 2">
      <img class="finish-image" src="../resource/forget/finish.png">
      <span class="finish-text">“{{companyName}}”认证申请已提交，请等待审核!</span>
    </div>
  </div>
</template>
<script>
import api from '../script/api.js';
export default {
  data() {
    let checkSubmitPassword = ( rule, value, callback ) => {
      if( value !== this.twoStep.submitPassword ) return callback( new Error('两次密码输入不一致，请重新输入') );
      callback();
    }
    return {
      process: null,
      companyName: '',
      fileUrl: '',
      oneStep: {
        name: '', code: '', leading: '', kind: '',
        phone: '', money: '', bank: '', idcard: '',
        address: '', linkman: '', moblie: '', uploadImage: false
      },
      twoStep: {
        companyEmailAddress: '', encode: '', submitPassword: '', repeatPassword: '', tip: null, verifyTime: null
      },
      rules: {
        oneStep: {
          name: [
            { required: true, message: '请输入企业名称', trigger: 'blur' }
          ],
          code: [
            { required: true, message: '请输入社会统一信用代码', trigger: 'blur' }
          ],
          leading: [
            { required: true, message: '请输入法人、代表人/负责人', trigger: 'blur' }
          ],
          money: [
            { required: true, message: '请输入注册资金' },
            { type: 'number', message: '请输入数字格式的注册资金' }
          ],
          address: [
            { required: true, message: '请输入公司详细地址', trigger: 'blur' }
          ],
          linkman: [
            { required: true, message: '请输入联系人', trigger: 'blur' }
          ],
          moblie: [
            { required: true, message: '请输入联系方式' },
            { type: 'number', message: '请输入正确的联系方式' }
          ]
        },
        twoStep: {
          companyEmailAddress: [
            { required: true, message: '请输入企业邮箱', trigger: 'blur' },
            { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
          ], 
          encode: [
            { required: true, message: '请输入验证码', trigger: 'blur' }
          ],
          submitPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 20, message: '请输入长度在6~20位之间的密码', trigger: 'blur' }
          ],
          repeatPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: checkSubmitPassword, trigger: 'blur' }
          ]
        }
      }
    }
  },
  created() {
    this.fileUrl = api.companyProve;
    this.companyName = this.$route.query.companyName;
    this.process = this.$route.query.isReal;
  },
  methods: {
    firstStep() {
      let self = this;
      this.$refs.oneStepValidate.validate((valid) => {
        if(valid) {
          self.process = 1;
        } else {
          return false;
        }
      })
    },
    secondStep() {
      let self = this;
      this.$refs.twoStepValidate.validate((valid) => {
        if(valid) {
          let formData = new FormData($('#prove-form-one')[0]);
          formData.append("account", self.twoStep.companyEmailAddress );
          formData.append("emsCode", self.twoStep.encode );
          formData.append("password", self.twoStep.repeatPassword );
          $.ajax({ url: api.companyProve, type: 'POST', data: formData, processData: false, contentType: false }).done((res) => {
            if( res.errCode == 1 ) {
              self.process = 2;
            } else {
              self.$message({ type: 'error', message: '提交失败!' });
            }
          })
          
        } else {
          return false;
        }
      })
    },
    uploadImage() {
      console.log("yeye");
      return true;
    },
    lastStep() {
      this.process = 0;
    },
    // 发送短信验证码
    sendMessageCode(speed) {
      let self = this;
      let timer = speed;
      let email = this.twoStep.companyEmailAddress;
      if(!email) return;
      // 验证码倒计时
      $.ajax({ url: api.sendEmailCode, type: 'GET', data: { mail: email }, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 0 ) {
          self.$message({ type: 'success', message: '发送成功!' });
          let t = setInterval(function() {
            if ( timer > 0 ) { timer -= 1; self.twoStep.verifyTime = timer; }
            else { clearInterval(t); self.twoStep.verifyTime = null; }
          }, 1000);
        } else {
          self.$message({ type: 'error', message: '发送失败!' });
        }
      })
      
    },
     // 由于elementUI出现bug，无法借助框架，使用自己的代码进行表单验证
    checkCompanyEmail() {
      let self = this;
      let value = this.twoStep.companyEmailAddress;
      let emailPattern = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
      if( value == '' || value == undefined ) { self.twoStep.tip = '请输入企业邮箱'; return }
      if( !emailPattern.test(value) ) { self.twoStep.tip = '请输入正确的邮箱地址'; return }
      self.twoStep.tip = null;
    }
  }
}
</script>
<style scoped>
.prove {
  min-height: 480px;
  padding: 50px 30px;
  background-color: #fff;
}
.prove-title {
  font-size: 16px;
  font-weight: bold;
  line-height: 40px;
  color: #339af2;
}
.oneStep, .twoStep {
  width: 590px;
  margin: auto;
}
.oneStep-btn {
  width: 120px;
  margin: auto;
}
.oneStep-btn .el-button {
  width: 100%;
}
.twoStep-btn {
  width: 300px;
  margin: auto;
}
.twoStep-btn .el-button {
  width: 120px;
}
</style>
<style>
.prove .el-form-item__error {
  position: static;
  top: 0;
  left: 0;
  padding-top: 10px;
  line-height: 12px;
}
.prove .el-form-item__error::before {
  display: inline-block;
  vertical-align: top;
  content: '';
  width: 14px;
  height: 14px;
  margin-right: 6px;
  background: url('../resource/common/warn.png') no-repeat center center;
  background-size: 14px 14px;
}
.prove-position {
  position: relative;
}
.prove-absolute {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 110px;
  height: 34px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
.verify-send-btn {
  display: block;
  width: 110px;
  height: 34px;
  line-height: 34px;
  text-align: center;
  background-color: #3a99f2;
  color: #fff;
  cursor: pointer;
}
.verify-send-tip {
  display: block;
  width: 110px;
  height: 34px;
  line-height: 34px;
  text-align: center;
  background-color: #e1e1e1;
  color: #fff;
  cursor: not-allowed;
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
</style>
