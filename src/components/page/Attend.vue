<template>
  <el-row class="tree-container">
    <el-col :span="4" class="left-bar">
      <el-select class="left-bar-select" v-model="selectValue" placeholder="进行中的项目" @change="projectToggle">
        <el-option label="进行中的项目" value="1"></el-option>
        <el-option label="已结束的项目" value="2"></el-option>
      </el-select>
      <el-tree :data="leftbarData" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
    </el-col>
    <el-col :span="20" class="right-bar">
      <div class="right-bar-top">
        <el-date-picker v-model="selectMonth" type="month" placeholder="选择月份"></el-date-picker>
        <el-button type="primary" :disabled="!teamIdentity" @click="searchMonthData">搜索</el-button>
      </div>
      <el-table ref="formData" :data="formData" fit border style="width: 100%" height="800" @cell-click="checkNameAtInfo">
        <el-table-column fixed prop="name" label="姓名" width="80" header-align="center"></el-table-column>
        <el-table-column label="当月合计" width="300" align="center">
          <el-table-column prop="sum" label="出勤天数" width="100" align="center"></el-table-column>
          <el-table-column prop="normal" label="正常天数" width="100" align="center"></el-table-column>
          <el-table-column prop="error" label="异常天数" width="100" align="center"></el-table-column>          
        </el-table-column>
        <el-table-column label="日期" header-align="center">
          <el-table-column v-for="item in weekdayData" :key="item" :label="item.num" :prop="item.nowday" align="center" width="80"></el-table-column>
        </el-table-column>
        <el-table-column fixed="right" label="当月合计" width="112" header-align="center">
          <el-table-column prop="hour" label="累计时长" width="112" align="center"></el-table-column>          
        </el-table-column>
      </el-table>
      <el-dialog size="tiny" :visible.sync="dialogStatus">
        <span slot="title">
          {{ dialog.name }}{{ dialog.date }}考勤明细
        </span>
        <span v-if="dialog.pari == undefined || dialog.pari.length == 0">当天无考勤记录</span>
        <span v-else v-for="item in dialog.pari" :key="item" style="display: inline-block; padding:8px;">{{ item }}</span>
      </el-dialog>
      <el-dialog size="tiny" :visible.sync="monthDialogStatus">
        <span slot="title">
          {{ monthDialog.name }}考勤明细
        </span>
        <el-table :data="monthDialog.dates">
          <el-table-column prop="id" label="日期" width="70"></el-table-column>
          <el-table-column prop="pari" label="考勤记录"></el-table-column>
        </el-table>
      </el-dialog>
    </el-col>
  </el-row>
</template>
<script>
import api from '../script/api.js';
export default {
  data() {
    return {
      formData: [],
      jsonData: [],
      dialogStatus: false,
      dialog: {},
      monthDialogStatus: false,
      monthDialog: {},
      weekdayData: null,
      selectValue: '',
      teamIdentity: '',
      selectMonth: '',
      leftbarData: [],
      calenderData: [],
      defaultProps: {
        children: 'nodes',
        label: 'text'
      },
      times: []
    }
  },
  beforeMount() {
    let self = this;
    // 获取项目考勤组树形结构
    $.ajax({ url: api.projectTreeGet, type: 'GET', data: {state: 1},xhrFields: { withCredentials: true } }).done((res) => {
      self.leftbarData = res.data.list;
    })
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let fate = new Date(year,month,0).getDate();
    let weekday = ['日','一','二','三','四','五','六'];
    // 获取每个月第一天为星期几
    let arr = [];
    for( let i = 1; i <= fate; i++ ) {
      let str = String(i);
      let data = { 'nowday': 'sumTiem' + str, num: weekday[new Date(`${year}/${month}/${i}`).getDay()] + ' ' + str }
      arr.push(data)
    }
    this.weekdayData = arr;
  },
  methods: {
    checkNameAtInfo(row, column, cell, event) {
      let self = this;
      let formData = this.formData;
      let jsonData = this.jsonData;
      if( column.label == '姓名' ) {
        // 当月考勤记录
        for( let i = 0; i < jsonData.length; i++ ) {
          if( row.id == jsonData[i].id ) {
            self.monthDialog = jsonData[i];
            self.monthDialogStatus = !self.monthDialogStatus;
          }
        }
      } else {
        // 一天考勤记录
        for( let i = 0; i < formData.length; i++ ) {
          if( row.id == formData[i].id ) {
            for( let j = 0; j < jsonData.length; j ++ ) {
              if( row.id == jsonData[j].id ) {
                for( let k = 0; k < jsonData[j].dates.length; k++ ) {
                  if( column.property.substring(7,9) == jsonData[j].dates[k].id ) {
                    self.dialog = jsonData[j].dates[k];
                    self.dialog.name = jsonData[j].name;
                    self.dialogStatus = !self.dialogStatus;
                  }
                }
              }
            }
          }
        }
      }
    },
    currentTableRow(row) {
      let r = this.$refs.formData.setCurrentRow(row);
      console.log(r)
    },
    handleNodeClick(data) {
      if(!data.tid) return;
      this.teamIdentity = data.tid;
      let self = this;
      let year = new Date().getFullYear();
      let month = new Date().getMonth() + 1;
      let fate = new Date(year,month,0).getDate();
      month = month < 10 ? '0' + month : month;
      let start = year + '-' + month + '-01';
      let end = year + '-' + month + '-' + fate;
      let resData = [];
      let TiemData = [];
      $.ajax({ url: api.attendFormData, type: 'GET', data: { teamId: data.tid, startDate: start, endDate: end },xhrFields: { withCredentials: true } }).done((res) => {
        self.jsonData = res.data;
        let obj = res;
        let result = [];
        Object.keys(obj.data).forEach((i) => {
          // result[i] = [];
          let item = {};
          Object.keys(obj.data[i]['dates']).forEach((j) => {
              let c = obj.data[i]['dates'][j];
              let k = '';
              if( c.sumTiem == -2 ) { k = '' }
              else if ( c.sumTiem == -1 ) { k = '异常' }
              else if ( c.sumTiem >= 0 ) { k = '√' }
              item['sumTiem' + c.id] = k;
              item.name = obj.data[i].name;
              item.id = obj.data[i].id;
              item.normal = (obj.data[i].yesCount >= 0 ? obj.data[i].yesCount = obj.data[i].yesCount : obj.data[i].yesCount = 0) + '天';
              item.error = (obj.data[i].errCount >= 0 ? obj.data[i].errCount = obj.data[i].errCount : obj.data[i].errCount = 0) + '天';
              item.sum = ((obj.data[i].yesCount >= 0 ? obj.data[i].yesCount = obj.data[i].yesCount : obj.data[i].yesCount = 0) + (obj.data[i].errCount >= 0 ? obj.data[i].errCount = obj.data[i].errCount : obj.data[i].errCount = 0)) + '天';
              item.hour = (obj.data[i].sumHours >= 0 ? obj.data[i].sumHours = obj.data[i].sumHours : obj.data[i].sumHours = 0) + '小时';
           });
           result.push(item);
        });
        self.formData = result;
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
      let teamId = this.teamIdentity;
      let timer = this.selectMonth;
      let year, month, fate, start, end;
      if( timer == '' || !timer ) {
        year = new Date().getFullYear();
        month = new Date().getMonth() + 1;
        fate = new Date(year,month,0).getDate();
      } else {
        year = new Date(timer).getFullYear();
        month = new Date(timer).getMonth() + 1;
        fate = new Date(year,month,0).getDate();
      }
      month = month < 10 ? '0' + month : month;
      start = year + '-' + month + '-01';
      end = year + '-' + month + '-' + fate;
      $.ajax({ url: api.attendFormData, type: 'GET', data: { teamId: teamId, startDate: start, endDate: end },xhrFields: { withCredentials: true } }).done((res) => {
        let obj = res;
        let result = [];
        Object.keys(obj.data).forEach((i) => {
          let item = {};
          Object.keys(obj.data[i]['dates']).forEach((j) => {
              let c = obj.data[i]['dates'][j];
              let k = '';
              if( c.sumTiem == -2 ) { k = '' }
              else if ( c.sumTiem == -1 ) { k = '异常' }
              else if ( c.sumTiem >= 0 ) { k = '√' }
              item['sumTiem' + c.id] = k;
              item.name = obj.data[i].name;
              item.id = obj.data[i].id;
              item.normal = (obj.data[i].yesCount >= 0 ? obj.data[i].yesCount = obj.data[i].yesCount : obj.data[i].yesCount = 0) + '天';
              item.error = (obj.data[i].errCount >= 0 ? obj.data[i].errCount = obj.data[i].errCount : obj.data[i].errCount = 0) + '天';
              item.sum = ((obj.data[i].yesCount >= 0 ? obj.data[i].yesCount = obj.data[i].yesCount : obj.data[i].yesCount = 0) + (obj.data[i].errCount >= 0 ? obj.data[i].errCount = obj.data[i].errCount : obj.data[i].errCount = 0)) + '天';
              item.hour = (obj.data[i].sumHours >= 0 ? obj.data[i].sumHours = obj.data[i].sumHours : obj.data[i].sumHours = 0) + '小时';
           });
           result.push(item);
        });
        self.formData = result;
      })
    }
  }
}
</script>
<style scoped>
.tree-container .right-bar-top {
  padding-bottom: 16px;
}
</style>

