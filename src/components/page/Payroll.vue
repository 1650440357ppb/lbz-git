<template>
  <div class="payroll">
    <el-row class="tree-container self" style="position: relative;">
      <el-col :span="4" class="left-bar">
        <el-select class="left-bar-select" v-model="selectValue" placeholder="进行中的项目" @change="projectToggle">
          <el-option label="进行中的项目" value="1"></el-option>
          <el-option label="已结束的项目" value="2"></el-option>
        </el-select>
        <el-tree :data="leftbarData" :props="defaultProps" style="padding-bottom: 130px;" @node-click="handleNodeClick"></el-tree>
      </el-col>
      <el-col :span="4" class="left-bar" style="position: absolute; left: 0; bottom: 0; padding-bottom: 0;">
        <div class="paytroll-btns">
          <el-button type="primary" @click="uploadExcel = true">上传薪资报表</el-button>
          <el-button type="primary" @click="downloadExcel = true">下载薪资报表</el-button>
        </div>
        <el-dialog title="上传薪资报表" size="tiny" :visible.sync="uploadExcel">
          <el-form class="payroll-form" id="payrollForm" method="POST" enctype="multipart/form-data">
            <el-form-item label="选择考勤组" label-width="100px">
              <!-- <el-select name="name" v-model="uploadPayroll.projectName" placeholder="请选择项目">
                <el-option v-for="item in dialogUploadPayrollExcel.projectList" :key="item" :label="item.name" :value="item.teamId"></el-option>
              </el-select> -->
              <el-cascader name="name" :options="options" v-model="uploadPayroll.projectName" placeholder="请选择考勤组"></el-cascader>
            </el-form-item>
            <el-form-item label="薪资报表" label-width="100px">
              <el-upload :action="fileUrl" name="excelFile" :on-preview="handlePreview" :auto-upload="false" :with-credentials="true" :on-remove="handleRemove" >
                <el-button size="small" type="primary" :disabled="!uploadPayroll.projectName">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">薪资报表以制定的模板为准，否则将无法读取报表数据。<a href="../../assets/薪资管理模板.xls" target="_blank">薪资报表模板下载</a></div>
              </el-upload>
            </el-form-item>
            <el-form-item label="薪资月份" label-width="100px">
              <el-date-picker name="time" v-model="uploadPayroll.time" type="date" placeholder="选择日期"></el-date-picker>
            </el-form-item>
            <el-form-item label-width="100px">
              <el-button type="primary" @click="uploadPayrollExcel" v-if="uploadPayroll.fileList.length == 0">上传</el-button>
              <el-button type="primary" @click="uploadExcel = false" v-else>完成</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
        <el-dialog title="下载薪资报表" size="tiny" :visible.sync="downloadExcel">
          <el-form style="padding: 30px;">
            <el-form-item label="选择考勤组" label-width="100px">
              <el-cascader name="name" :options="options" v-model="downloadPayroll.projectName" placeholder="请选择考勤组"></el-cascader>
            </el-form-item>
            <el-form-item label="选择月份" label-width="100px">
              <el-date-picker name="time" v-model="downloadPayroll.time" type="month" placeholder="选择日期"></el-date-picker>
            </el-form-item>
            <el-form-item label="" label-width="100px">
              <el-button type="primary" @click="downloadPayrollExcel">下载</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
      </el-col>
      <el-col :span="20" class="right-bar">
        <div class="right-bar-top">
          <el-date-picker v-model="selectMonth" type="month" placeholder="选择月份"></el-date-picker>
          <span class="payroll-title">发放状态</span>
          <el-select class="payroll-select" v-model="selectPayroll.status" placeholder="请选择">
            <el-option value="1" label="已发放"></el-option>
            <el-option value="0" label="未发放"></el-option>
          </el-select>
          <span class="payroll-title">姓名</span>
          <el-input class="payroll-input" v-model="selectPayroll.name" placeholder="请输入姓名"></el-input>
          <span class="payroll-title">身份证号码</span>
          <el-input class="payroll-input" v-model="selectPayroll.cardno" placeholder="请输入身份证号码"></el-input>
          <el-button type="primary" :disabled="!pageIdx" @click="searchMonthData">搜索</el-button>
        </div>
        <el-table :data="tableData3" style="width: 100%;">
          <el-table-column align="left" prop="idx" label="序号" width="70"></el-table-column>
          <el-table-column align="left" prop="nickName" label="姓名" width="80"></el-table-column>
          <el-table-column align="left" prop="cardno" :show-overflow-tooltip="true" label="身份证号"></el-table-column>
          <el-table-column align="left" prop="paytime" :show-overflow-tooltip="true" label="发放时间"></el-table-column>
          <el-table-column align="left" prop="shouldpay" label="应发工资"></el-table-column>
          <el-table-column align="left" prop="factpay" label="实发工资"></el-table-column>
          <el-table-column align="left" prop="bank" :show-overflow-tooltip="true" label="开户行"></el-table-column>
          <el-table-column align="left" prop="bankno" :show-overflow-tooltip="true" label="银行账户"></el-table-column>
          <el-table-column align="left" prop="paystatus" label="发放状态"></el-table-column>
          <el-table-column align="left" label="操作" width="120">
            <template scope="scope">
              <el-popover ref="deletePayroll{{$index}}" v-model="scope.row.visible2" placement="top-start" width="200" trigger="click">
                <p style="line-height: 36px;">该操作将不可恢复，是否删除？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="scope.row.visible2 = false">取消</el-button>
                  <el-button type="primary" size="mini" @click="delPayRollInfo">确定</el-button>
                </div>
              </el-popover>
              <el-button type="text" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button type="text" size="small" v-popover:deletePayroll{{$index}} @click="handleDelete(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="prev, pager, next" v-show="pageIdx!==null" @current-change="CurrentChange" :page-size="pageNum" :total="pageSum"></el-pagination>
      </el-col>
      <el-dialog title="编辑" size="tiny" :visible.sync="editPayroll">
        <el-form class="payroll-form">
          <el-form-item label="姓名" label-width="100px">
            {{ dialogPayroll.name }}
          </el-form-item>
          <el-form-item label="身份证号码" label-width="100px">
            {{ dialogPayroll.cardno }}
          </el-form-item>
          <el-form-item label="开户行" label-width="100px">
            <el-input v-model="dialogPayroll.bank" placeholder="请输入开户行"></el-input>
          </el-form-item>
          <el-form-item label="银行账户" label-width="100px">
            <el-input v-model="dialogPayroll.bankno" placeholder="请输入银行账户"></el-input>
          </el-form-item>
          <el-form-item label="应发工资" label-width="100px">
            <el-input v-model="dialogPayroll.shouldpay" placeholder="请输入应发工资">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="实发工资" label-width="100px">
            <el-input v-model="dialogPayroll.factpay" placeholder="请输入实发工资">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="发放时间" label-width="100px">
            <el-date-picker v-model="dialogPayroll.paytime" type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="发放状态" label-width="100px">
            <el-radio-group v-model="dialogPayroll.paystatus">
              <el-radio label="未发放" value="未发放"></el-radio>
              <el-radio label="已发放" value="已发放"></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label-width="100px">
            <el-button type="primary" @click="editPayrollInfo">保存</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-row>
  </div>
</template>
<script>
import api from '../script/api.js';

export default {
  data() {
    return {
      fileUrl: '',
      options: [],
      tableData3: null,
      weekdayData: null,
      pageSum: null,
      pageNum: null,
      pageIdx: null,
      uploadExcel: false,
      downloadExcel: false,
      editPayroll: false,
      selectValue: '',
      selectMonth: '',
      selectPayroll: {
        status: '',
        name: '',
        cardno: ''
      },
      uploadPayroll: {
        val: '',
        fileList: [],
        time: '',
        projectName: []
      },
      downloadPayroll: {
        projectName: [],
        time: ''
      },
      dialogPayroll: {
        name: '',
        cardno: '',
        bank: '',
        bankno: '',
        shouldpay: '',
        factpay: '',
        paytime: '',
        paystatus: 1
      },
      leftbarData: [],
      defaultProps: {
        children: 'nodes',
        label: 'text'
      },
      personId: '',
      dialogUploadPayrollExcel: {
        projectList: []
      }
    }
  },
  created() {
    let self = this;
    let jsonData = [];
    let listData = [];
    $.ajax({ url: api.projectTreeGet, type: 'GET', data: {state: 1},xhrFields: { withCredentials: true } }).done((res) => {
      self.leftbarData = res.data.list;
      for( let i = 0; i < res.data.list.length; i++ ) {
        let resData = {
          teamId: res.data.list[i].pid,
          name: res.data.list[i].text
        }
        listData.push(resData);
      }
      self.dialogUploadPayrollExcel.projectList = listData;
    });
    $.ajax({ url: api.getPayrollId, type: 'GET', xhrFields: { withCredentials: true } }).done((respond) => {
      self.pageIdx = respond.data;
       if( respond.errCode == 0 && respond.data ) {
        $.ajax({ url: api.getPayrollList, type: 'GET', data: { teamId: respond.data, pageNum: 1, pageSize: 20 }, xhrFields: { withCredentials: true } }).done((res) => {
           for( let i = 0; i < res.data.list.length; i++ ) {
             let resData = {
              idx: i + 1,
              id: res.data.list[i].id_,
              projectId: res.data.list[i].project_id,
              teamId: res.data.list[i].team_id,
              memberId: res.data.list[i].member_id,
              nickName: res.data.list[i].member_name,
              cardno: res.data.list[i].memeber_cardno,
              paytime: res.data.list[i].pay_time,
              shouldpay: res.data.list[i].pay_gross,
              factpay: res.data.list[i].pay_net,
              bank: res.data.list[i].pay_bankname,
              bankno: res.data.list[i].pay_cardnum,
              paystatus: res.data.list[i].pay_status ? res.data.list[i].pay_status = '已发放' : res.data.list[i].pay_status = '未发放'
            }
             jsonData.push(resData);
          }
          self.tableData3 = jsonData;
          self.pageSum = res.data.total;
          self.pageNum = res.data.pageSize;
        })
      }
    })
    this.dialogSetting();
  },
  beforeMount() {
    let self = this;
    // 获取项目考勤组树形结构
    $.ajax({ url: api.projectTreeGet, type: 'GET', data: {state: 1}, xhrFields: { withCredentials: true } }).done((res) => {
      self.leftbarData = res.data.list;
    })
  },
  methods: {
    dialogSetting() {
      let self = this;
      let data = [];
      $.ajax({ url: api.projectTreeGet, type: 'GET', data: {state: 1}, xhrFields: { withCredentials: true } }).done((res) => {
        for( let i = 0; i < res.data.list.length; i++ ) {
          let listData = {
            label: res.data.list[i].text,
            value: res.data.list[i].pid,
            children: []
          }
          for( let j = 0; j < res.data.list[i].nodes.length; j++ ) {
            if(res.data.list[i].pid == res.data.list[i].nodes[j].pid) {
              let nodesData =  {
                label: res.data.list[i].nodes[j].text,
                value: res.data.list[i].nodes[j].tid
              };
              listData.children.push(nodesData);
            }
          }
          data.push(listData);
        }
        self.options = data;
      });
    },
    downloadPayrollExcel() {
      let idx = this.downloadPayroll.projectName[1];
      $.ajax({ url: api.downloadPayrollExcel, type: 'GET', data: { teamId: idx }, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 0 ) {
          window.location.href = res.data;
        } else {
          self.$message({ type: 'error', message: '操作频繁，请稍后重试' })
        }
      })
    },
    uploadPayrollExcel() {
      let self = this;
      var formData = new FormData($("#payrollForm")[0]);
      let year = new Date(self.uploadPayroll.time).getFullYear();
      let month = new Date(self.uploadPayroll.time).getMonth() + 1;
      formData.append('projectId', self.uploadPayroll.projectName[0]);
      formData.append('teamId', self.uploadPayroll.projectName[1]);
      formData.append('payYear', year );
      formData.append('payMonth', month);
      $.ajax({ url: api.uploadPayrollExcel+'?bus=XZ', type: 'POST', data: formData, processData: false, contentType: false ,xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 0 ) {
          let resData = {
            name: res.data.name,
            url: res.data.url
          }
          self.uploadPayroll.fileList.push(resData)
          self.$message({ showClose: true, type: 'success', message: '上传成功' });
          setTimeout( () => { self.uploadExcel = !self.uploadExcel}, 1000 );
        } else {
          self.$message({ showClose: true, message: res.errMsg, type: 'error' });
        }
      })
    },
    editPayrollInfo() {
      let self = this;
      let { projectId, teamId, id, memberId,name,cardno,paytime,shouldpay,factpay,bank,bankno,paystatus } = this.dialogPayroll;
      paytime = `${new Date(paytime).getFullYear()}-${new Date(paytime).getMonth()+1}-${new Date(paytime).getDate()}`
      paystatus == "已发放" ? paystatus = 1 : paystatus = 0
      $.ajax({ url: api.editPayrollInfo, type: 'POST', data: { memberName:name,id: id,projectId:projectId,teamId:teamId,memberId:memberId,memberCardno:cardno,payBankname:bank,payCardnum:bankno,payGross:shouldpay,payNet:factpay,payTime:paytime,payStatus:paystatus },xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 0 ) {
          self.$message({ showClose: true, message: '修改成功', type: 'success' });
          self.editPayroll = !self.editPayroll;
          setTimeout(() => location.reload(), 1000);
        } else {
          self.$message({ showClose: true, message: res.errMsg, type: 'error' });
        }
      })
    },
    delPayRollInfo() {
      let self = this;
      let idx = this.personId;
      if( !idx ) return;
      $.ajax({ url: api.delPayRollInfo, type: 'POST', data: { id: idx },xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 0 ) {
          self.$message({ showClose: true, message: '删除成功', type: 'success' });
          setTimeout(() => location.reload(), 1000);
        } else {
          self.$message({ showClose: true, message: res.errMsg, type: 'error' });
        }
      })
    },
    CurrentChange(val) {
      let self = this;
      let idx = this.pageIdx;
      if( !idx ) return;
      let jsonData = [];
      $.ajax({ url: api.getPayrollList, type: 'GET', data: { teamId: idx, pageNum: val, pageSize: 20 },xhrFields: { withCredentials: true } }).done((res) => {
        if( res.data.list == undefined) return self.$message({ type: 'error', message: '页面出错' });
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            idx: i + 1,
            id: res.data.list[i].id_,
            projectId: res.data.list[i].project_id,
            teamId: res.data.list[i].team_id,
            memberId: res.data.list[i].member_id,
            nickName: res.data.list[i].member_name,
            cardno: res.data.list[i].memeber_cardno,
            paytime: res.data.list[i].pay_time,
            shouldpay: res.data.list[i].pay_gross,
            factpay: res.data.list[i].pay_net,
            bank: res.data.list[i].pay_bankname,
            bankno: res.data.list[i].pay_cardnum,
            paystatus: res.data.list[i].pay_status ? res.data.list[i].pay_status = '已发放' : res.data.list[i].pay_status = '未发放'
          }
          jsonData.push(resData);
        }
        self.tableData3 = jsonData;
        self.pageSum = res.data.total;
        self.pageNum = res.data.pageSize;
      })
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleEdit(index, row) {
      let data = {
        id: row.id,
        projectId: row.projectId,
        teamId: row.teamId,
        memberId:row.memberId,
        name: row.nickName,
        cardno: row.cardno,
        bank: row.bank,
        bankno: row.bankno,
        shouldpay: row.shouldpay,
        factpay: row.factpay,
        paytime: row.paytime,
        paystatus: row.paystatus
      }
      this.dialogPayroll = data;
      this.editPayroll = !this.editPayroll;
    },
    handleDelete(index, row) {
      this.personId = row.id;
    },
    handleNodeClick(data) {
      let self = this;
      let idx = data.tid;
      self.pageIdx = idx;
      if(!data.tid) return;
      let jsonData = [];
      $.ajax({ url: api.getPayrollList, type: 'GET', data: { teamId: idx, pageNum: 1, pageSize: 20 },xhrFields: { withCredentials: true } }).done((res) => {
        if( res.data.list == undefined) return self.$message({ type: 'error', message: '页面出错' });
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            idx: i + 1,
            id: res.data.list[i].id_,
            projectId: res.data.list[i].project_id,
            teamId: res.data.list[i].team_id,
            memberId: res.data.list[i].member_id,
            nickName: res.data.list[i].member_name,
            cardno: res.data.list[i].memeber_cardno,
            paytime: res.data.list[i].pay_time,
            shouldpay: res.data.list[i].pay_gross,
            factpay: res.data.list[i].pay_net,
            bank: res.data.list[i].pay_bankname,
            bankno: res.data.list[i].pay_cardnum,
            paystatus: res.data.list[i].pay_status ? res.data.list[i].pay_status = '已发放' : res.data.list[i].pay_status = '未发放'
          }
          jsonData.push(resData);
        }
        self.tableData3 = jsonData;
        self.pageSum = res.data.total;
        self.pageNum = res.data.pageSize;
      })
    },
    projectToggle() {
      let self = this;
      let value = this.selectValue;
      $.ajax({ url: api.projectTreeGet, type: 'GET', data: {state: value },xhrFields: { withCredentials: true } }).done((res) => {
        self.leftbarData = res.data.list;
      })
    },
    searchMonthData() {
      let self = this;
      let timer = this.selectMonth;
      let { name, cardno, status } = this.selectPayroll;
      let idx = self.pageIdx;
      let jsonData = [];
      let respondData = { teamId: idx, pageNum: 1, pageSize: 20 };
      if(name) respondData['memberName'] = name;
      if(cardno) respondData['memberCardno'] = cardno;
      if(status) respondData['payStatus'] = status;
      if(timer) { respondData['payYear'] = new Date(timer).getFullYear(); respondData['payMonth'] = new Date(timer).getMonth() + 1 };
      $.ajax({ url: api.checkPayrollList, type: 'GET', data: respondData, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.data.list == undefined) return self.$message({ type: 'error', message: '页面出错' });
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            idx: i + 1,
            id: res.data.list[i].id_,
            projectId: res.data.list[i].project_id,
            teamId: res.data.list[i].team_id,
            memberId: res.data.list[i].member_id,
            nickName: res.data.list[i].member_name,
            cardno: res.data.list[i].memeber_cardno,
            paytime: res.data.list[i].pay_time,
            shouldpay: res.data.list[i].pay_gross,
            factpay: res.data.list[i].pay_net,
            bank: res.data.list[i].pay_bankname,
            bankno: res.data.list[i].pay_cardnum,
            paystatus: res.data.list[i].pay_status ? res.data.list[i].pay_status = '已发放' : res.data.list[i].pay_status = '未发放'
          }
          jsonData.push(resData);
        }
        self.tableData3 = jsonData;
        self.pageSum = res.data.total;
        self.pageNum = res.data.pageSize;
      })
    }
  }
}
</script>
<style scoped>
.payroll .left-bar {
  position: relative;
}
.payroll .paytroll-btns {
  width: 100%;
  padding: 18px 0 0;
  text-align: center;
  border-top: 1px solid #e0e7ec;
}
.payroll .el-button+.el-button {
  margin-left: 0;
}
.payroll .paytroll-btns .el-button {
  margin: 0 5px 18px;
}
.tree-container .right-bar-top {
  padding-bottom: 16px;
}
.payroll-title {
  padding: 0 10px;
  font-size: 14px;
  line-height: 36px;
}
.payroll-form {
  padding: 30px;
}
.payroll-select {
  width: 100px;
}
.payroll-input {
  width: 13%;
}
.payroll .el-pagination {
  padding: 30px 0 10px;
  text-align: right;
}
</style>

