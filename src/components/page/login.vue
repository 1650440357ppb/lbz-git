<template>
  <div class="_wrapper">
    <top></top>
    <div class="content">
      <el-row>
        <el-col :span="15">
          <img src="../resource/common/main.png">
        </el-col>
        <el-col :span="7">
          <el-tabs class="login" v-model="defaultSelect">
            <el-tab-pane label="管理员登录" name="admin">
              <el-form class="login-form" ref="adminSubmit" :model="login.admin" :rules="rules.admin">
                <el-form-item prop="phone">
                  <el-input v-model="login.admin.phone" :maxlength='11' placeholder="请输入手机号"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input type="password" v-model="login.admin.password" :maxlength='20' placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click.enter="adminLogin">提交</el-button>
                  <input type="hidden" @keyup.enter.native="adminLogin">
                </el-form-item>
                <div class="extra">
                  <span>没有账号？<router-link to="/register">注册新账号</router-link></span>
                  <router-link to="/forget" class="right">忘记密码</router-link>
                </div>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="企业登录" name="company">
              <el-form class="login-form" ref="companySubmit" :model="login.company" :rules="rules.company">
                <el-form-item prop="email">
                  <el-input v-model="login.company.email" placeholder="请输入企业邮箱"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input type="password" v-model="login.company.password" :maxlength='20' placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="companyLogin">提交</el-button>
                  <input type="hidden" @keyup.enter.native="companyLogin">
                </el-form-item>
                <div class="extra">
                  <router-link to="/forget" class="right">忘记密码</router-link>
                </div>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <bottom></bottom>
  </div>
</template>
<script>
import api from '../script/api.js';
import webStorageCache from 'web-storage-cache';
import md5 from 'md5';
import top from './template/Top';
import bottom from './template/Bottom';

let wsCache = new webStorageCache();

export default {
  data() {
    return {
      defaultSelect: "admin",
      login: {
        admin: { phone: '', password: '' },
        company: { email: '', password: '' }
      },
      rules: {
        admin: {
          phone: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { min: 11, max: 11, message: '请输入11位手机号码', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 20, message: '请输入长度在6~20位之间的密码', trigger: 'blur' }
          ]
        },
        company: {
          email: [
            { required: true, message: '请输入企业邮箱', trigger: 'blur' },
            { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 20, message: '请输入长度在6~20位之间的密码', trigger: 'blur' }
          ]
        }
      }
    }
  },
  methods: {
    adminLogin() {
      let self = this;
      this.$refs.adminSubmit.validate((valid) => {
        if(valid) {
          $.ajax({ url: api.adminLogin, type: 'POST', data: { 
            mobile: self.login.admin.phone, passwd: self.login.admin.password 
          }, xhrFields: { withCredentials: true }  }).done((res) => {
            res.errMsg == '改账号不存在' ? res.errMsg = '该账号不存在' : res.errMsg;
            if( res.errCode !== 1 ) { self.$message({ showClose: true, message: res.errMsg, type: 'error'}); }
            else {
              let _id = res.data.user.id;
              wsCache.set('identifyCode',_id);
              wsCache.set("_uid",md5(_id),{ exp: 1800 });
              self.$router.push('/');
            }
          })
        } else { return false }
      })
    },
    companyLogin() {
      let self = this;
      this.$refs.companySubmit.validate((valid) => {
        if(valid) {
          $.ajax({ url: api.companyLogin, type: 'POST', data: { 
            account: self.login.company.email, password: self.login.company.password 
          }, xhrFields: { withCredentials: true }  }).done((res) => {
            res.errMsg == '改账号不存在' ? res.errMsg = '该账号不存在' : res.errMsg;
            if( res.errCode !== 1 ) { self.$message({ showClose: true, message: res.errMsg, type: 'error'}); }
            else {
              let _id = res.data.user.id;
              wsCache.set('identifyCode',_id);
              wsCache.set("_cid",md5(_id),{ exp: 1800 });
              self.$router.push('/');
            }
          })
        } else { return false }
      })
    }
  },
  created() {
    if(wsCache.get("_uid") || wsCache.get("_cid")) this.$router.push('/');
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
.login {
  margin-top: 30px;
  background-color: #fff;
  border-radius: 4px;
}
.login .el-tabs__active-bar {
  height: 1px;
}
.login .el-tabs__nav {
  display: flex;
  width: 100%;
}
.login .el-tabs__item {
  flex: 0 0 50%;
  height: 60px;
  line-height: 60px;
  font-size: 18px;
  text-align: center;
}
.login .el-form-item {
  margin-bottom: 20px;
}
.login .el-button {
  width: 100%;
  height: 46px;
}
.login-form {
  position: relative;
  min-height: 293px;
  padding: 15px 30px 30px;
}
.login-form .el-input__inner {
  height: 46px;
  line-height: 46px;
  padding: 14px;
}
.login-form .el-form-item__error {
  position: static;
  top: 0;
  left: 0;
  padding-top: 10px;
  line-height: 12px;
}
.login-form .el-form-item__error::before {
  display: inline-block;
  vertical-align: top;
  content: '';
  width: 14px;
  height: 14px;
  margin-right: 6px;
  background: url('../resource/common/warn.png') no-repeat center center;
  background-size: 14px 14px;
}
.extra {
  position: absolute;
  bottom: 16px;
  width: 290px;
  font-size: 12px;
}
.extra::before, .extra::after {
  display: block;
  content: '';
  width: 0;
  height: 0;
  clear: both;
}
.extra a {
  color: #333;
  text-decoration: none;
  transition: color .2s cubic-bezier(.645,.045,.355,1);
}
.extra a:hover {
  color: #3a99f2;
}
.extra .right {
  float: right;
}
</style>