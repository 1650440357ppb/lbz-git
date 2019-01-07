<template>
  <div class="setting">
    <el-row class="nav-container">
      <el-col :span="4" class="left-bar">
        <ul class="setting-list">
          <li class="setting-item" @click="toggleSetting(0)">修改企业信息</li>
          <li class="setting-item" @click="toggleSetting(1)">修改密码</li>
        </ul>
      </el-col>
      <el-col :span="20" class="self">
        <div class="right-bar-title">{{ !settingItem ? '修改企业信息': '修改密码' }}</div>
        <div class="right-bar">
          <div class="right-bar-content" v-show="!settingItem">
            <el-form ref="editInformationFunc" :model="editForm.editInformation" :rules="rules.editInformation">
              <el-form-item label="办公电话" label-width="152px">
                <el-input v-model="editForm.editInformation.phone" placeholder="包括区号、电话、分机号，以“-”隔开"></el-input>
              </el-form-item>
              <el-form-item prop="money" label="注册资金" label-width="152px">
                <el-input v-model="editForm.editInformation.money" placeholder="请输入注册资金数额">
                  <template slot="append">万元</template>
                </el-input>
              </el-form-item>
              <el-form-item label="开户银行" label-width="152px">
                <el-input v-model="editForm.editInformation.bank" placeholder="请输入开户银行"></el-input>
              </el-form-item>
              <el-form-item label="银行账户" label-width="152px">
                <el-input v-model="editForm.editInformation.idcard" placeholder="请输入银行账户"></el-input>
              </el-form-item>
              <el-form-item prop="address" label="公司详细地址" label-width="152px">
                <el-input v-model="editForm.editInformation.address" placeholder="请输入公司详细地址"></el-input>
              </el-form-item>
              <el-form-item class="right-bar-btns">
                <el-button type="primary" class="right-bar-btn" @click="saveInformation">保存</el-button>
              </el-form-item>              
            </el-form>
          </div>
          <div class="right-bar-content" v-show="settingItem">
            <el-form ref="editPasswordFunc" :model="editForm.editPassword" :rules="rules.editPassword">
              <el-form-item prop="oldPassword" label="旧密码" label-width="152px">
                <el-input type="password" v-model="editForm.editPassword.oldPassword" placeholder="请输入旧密码"></el-input>
              </el-form-item>
              <el-form-item prop="newPassword" label="新密码" label-width="152px">
                <el-input type="password" v-model="editForm.editPassword.newPassword" placeholder="请输入6~20位的新密码"></el-input>
              </el-form-item>
              <el-form-item prop="checkNewPassword" label="确认密码" label-width="152px">
                <el-input type="password" v-model="editForm.editPassword.checkNewPassword" placeholder="请再次输入密码"></el-input>
              </el-form-item>
              <el-form-item class="right-bar-btns">
                <el-button type="primary" class="right-bar-btn" @click="saveChangePassword">保存</el-button>
              </el-form-item>              
            </el-form>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import api from '../script/api.js';
export default {
  data() {
    let checkOldPasswords = ( rule, value, callback ) => {
      if( value == this.editForm.editPassword.oldPassword ) return callback(new Error("新密码与原密码不能相同"));
      callback();
    };
    let checkNewPasswords = ( rule, value, callback ) => {
      if( value !== this.editForm.editPassword.newPassword ) return callback(new Error("两次密码输入不一致，请重新输入"));
      callback();
    };
    return {
      settingItem: 0,
      editForm: {
        editInformation: {
          phone: '', money: '', bank: '', idcard: '', address: ''
        },
        editPassword: {
          oldPassword: '', newPassword: '', checkNewPassword: ''
        }
      },
      rules: {
        editPassword: {
          oldPassword: [
            { required: true, message: '请输入旧密码', trigger: 'blur' }
          ],
          newPassword: [
            { required: true, message: '请输入新密码', trigger: 'blur' },
            { min: 6, max: 20, message: '请输入长度为6~20位的密码', trigger: 'blur' },
            { validator: checkOldPasswords, trigger: 'blur' }
          ],
          checkNewPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: checkNewPasswords, trigger: 'blur' }
          ]
        },
        editInformation: {
          money: [
            { required: true, message: '请输入注册资金数额', trigger: 'blur' }
          ],
          address: [
            { required: true, message: '请输入公司详细地址', trigger: 'blur' }
          ]
        },
        
      }
    }
  },
  methods: {
    toggleSetting(val) {
      this.settingItem = val;
    },
    saveInformation() {
      let self = this;
      this.$refs.editInformationFunc.validate((valid) => {
        if(valid) {
          $.ajax({ url: api.saveInformation, type: 'POST', data: {
            bank: self.editForm.editInformation.bank, bankNum: self.editForm.editInformation.idcard, fund: self.editForm.editInformation.money, contactNumber: self.editForm.editInformation.phone, licenseImage: self.editForm.editInformation.address
          }, xhrFields: { withCredentials: true } }).done( (res) => {
            if( res.errCode !==1 ) {
              self.$message({ showClose: true, message: res.errMsg, type: 'error' });
            } else {
              self.$message({ showClose: true, message: res.errMsg, type: 'success' });
            }
          })
        } else {
          return false;
        }
      })
    },
    saveChangePassword() {
      let self = this;
      this.$refs.editPasswordFunc.validate((valid) => {
        if(valid) {
          $.ajax({ url: api.editAccountPwd, type: 'POST', data: {
            id: self.editForm.editPassword.oldPassword, passwd: self.editForm.editPassword.newPassword
          }, xhrFields: { withCredentials: true } }).done( (res) => {
            if( res.errCode !==1 ) {
              self.$message({ showClose: true, message: res.errMsg, type: 'error' });
            } else {
              self.$message({ showClose: true, message: res.errMsg, type: 'success' });
            }
          })
          
        } else {
          return false;
        }
      })
    }
  }
}
</script>
<style scoped>
.setting ul, .setting li {
  list-style: none;
}
.setting-item {
  height: 54px;
  line-height: 54px;
  font-size: 14px;
  border-bottom: 1px solid #dfe6ec;
  text-align: center;
  cursor: pointer;
  transition: color .4s;
}
.setting-item:hover {
  color: #3a99f2;
}
.right-bar-title {
  height: 68px;
  padding-left: 34px;
  line-height: 70px;
  background-color: #fff;
  border-bottom: 1px solid #dfe6ec;
}
.right-bar-content {
  width: 540px;
  padding: 16px 20px;
}
.right-bar-btns {
  text-align: center;
}
.right-bar-btn {
  width: 120px;
}
</style>