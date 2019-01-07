<template>
	<div class="contract self">
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
	        <!-- <span class="contract-title">合同状态</span>
          <el-select class="contract-select" v-model="selectContract.status" placeholder="请选择">
            <el-option value="1" label="有效"></el-option>
            <el-option value="0" label="失效"></el-option>
          </el-select> -->
          <span class="contract-title">合同编号</span>
          <el-input class="contract-input" v-model="selectContract.number" placeholder="请输入合同编号"></el-input>
          <span class="contract-title">姓名</span>
          <el-input class="contract-input" v-model="selectContract.name" placeholder="请输入姓名"></el-input>
          <span class="contract-title">身份证号码</span>
          <el-input class="contract-input" v-model="selectContract.cardno" placeholder="请输入身份证号码"></el-input>
	        <el-button type="primary" :disabled="!idx" @click="findByLimit">搜索</el-button>
	      </div>
	      <el-table :data="tableData3" style="width: 100%">
          <el-table-column align="left" prop="idx" label="序号" width="70"></el-table-column>
          <el-table-column align="left" prop="nickName" label="姓名" width="80"></el-table-column>
          <el-table-column align="left" :show-overflow-tooltip="true" prop="cardno" label="身份证号"></el-table-column>
          <el-table-column align="left" :show-overflow-tooltip="true" prop="contractNumber" label="合同编号"></el-table-column>
          <el-table-column align="left" :show-overflow-tooltip="true" prop="submitTime" label="办理日期"></el-table-column>
          <el-table-column align="left" prop="contractStatus" label="合同状态"></el-table-column>
          <el-table-column align="left" label="操作" width="">
            <template scope="scope">
              <el-popover ref="deletePayroll{{$index}}" v-model="scope.row.delContractInfo" placement="top-start" width="200" trigger="click">
                <p style="line-height: 26px; padding: 6px 0;">将删除合同信息，该操作不可恢复，是否删除？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="scope.row.delContractInfo = false">取消</el-button>
                  <el-button type="primary" size="mini" @click="delContractInfo">确定</el-button>
                </div>
              </el-popover>
              <el-button type="text" size="small" @click="handleLook(scope.$index, scope.row)">查看</el-button>
              <el-button type="text" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button type="text" size="small" v-popover:deletePayroll{{$index}} @click="handleDelete(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageNum" :total="pageSum"></el-pagination>
	    </el-col>
	    <el-dialog title="编辑" size="tiny" :visible.sync="editContract">
        <el-form class="contract-form" id="contractForm" method="POST" enctype="multipart/form-data">
          <el-form-item label="姓名" label-width="100px">
            {{ dialogContract.name }}
            <input type="hidden" name="memberName" :value="dialogContract.name" />
            <input type="hidden" name="id" :value="dialogContract.id" />
            <input type="hidden" name="memberId" :value="dialogContract.memberId" />
            <input type="hidden" name="teamId" :value="dialogContract.teamId" />
            <input type="hidden" name="projectId" :value="dialogContract.projectId" />
          </el-form-item>
          <el-form-item label="身份证号码" label-width="100px">
            {{ dialogContract.cardno }}
          </el-form-item>
          <el-form-item label="上传合同" label-width="100px">
            <el-upload :action="uploadContract" name="file" :on-remove="handleRemove" :auto-upload="false" :with-credentials="true">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">请上传有效劳动合同扫描件或照片，仅支持PDF、JPG、PNG三种文件格式。<a href="#">劳动合同模板下载</a></div>
              </el-upload>
            </el-form-item>
          <el-form-item label="办理日期" label-width="100px">
            <el-date-picker v-model="dialogContract.time" name="contractDate" type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="合同状态" label-width="100px">
            <el-radio-group name="state" v-model="dialogContract.status">
              <el-radio value="0" label="无效"></el-radio>
              <el-radio value="1" label="有效"></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="失效日期" label-width="100px">
            <el-date-picker v-model="dialogContract.lostTime" name="contractExpire" type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
          <el-form-item label-width="100px">
            <el-button type="primary" @click="saveContractInfo">保存</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <el-dialog title="查看" size="tiny" :visible.sync="lookContract">
        <el-form class="contract-form">
          <el-form-item label="姓名" label-width="100px">
            {{ lookContracts.name }}
          </el-form-item>
          <el-form-item label="身份证号码" label-width="100px">
            {{ lookContracts.cardno }}
          </el-form-item>
          <el-form-item label="合同编号" label-width="100px">
            {{ lookContracts.number }}
          </el-form-item>
          <el-form-item label="合同状态" label-width="100px">
            {{ lookContracts.status}} <!-- <el-button type="primary">下载合同</el-button>-->
          </el-form-item>
          <el-form-item label="办理日期" label-width="100px">
            {{ lookContracts.time }}
          </el-form-item>
          <el-form-item label="失效日期" label-width="100px">
            {{ lookContracts.lostTime }}
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
			tableData3: null,
			visible2: false,
      pageSum: null,
      pageNum: null,
			editContract: false,
			lookContract: false,
			selectValue: '',
			selectContract: {
				name: '',
				number: '',
				cardno: '',
				status: ''
			},
			dialogContract: {
        id: '',
        projectId: '',
        teamId: '',
        memberId: '',
        name: '',
        cardno: '',
        number: '',
        status: 1,
        lostTime: '',
        time: '',
      },
      lookContracts: {
        name: '',
        cardno: '',
        number: '',
        status: 1,
        lostTime: '',
        time: '',
      },
      projectId: '',
      contractId: '',
			leftbarData: [],
			defaultProps: {
        children: 'nodes',
        label: 'text'
      },
      idx: '',
      uploadContract: ''
		}
	},
	created() {
    this.uploadContract = api.uploadContract;
    let self = this;
    $.ajax({ url: api.projectTreeGet, type: 'GET', data: {state: 1},xhrFields: { withCredentials: true } }).done((res) => {
      self.leftbarData = res.data.list;
    });
	},
	methods: {
    findByLimit() {
      let self = this;
      let idx = this.idx;
      let mockData = [];
      let respondData = { teamId: idx };
      let { name, number,cardno,status } = this.selectContract;
      if(name) respondData['memberName'] = name;
      if(number) respondData['contractNo'] = number;
      if(cardno) respondData['memberCardno'] = cardno;
      if(status) respondData['state'] = status;
      $.ajax({ url: api.getContractInfo, type: 'GET', data: respondData, xhrFields: { withCredentials: true } }).done((res) => {
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            idx: i+1,
            id: res.data.list[i].id,
            projectId: res.data.list[i].projectId,
            teamId:res.data.list[i].teamId,
            memberId: res.data.list[i].memberId,
            nickName: res.data.list[i].memberName,
            cardno: res.data.list[i].memberCardno,
            submitTime: res.data.list[i].contractDate,
            lostTime: res.data.list[i].contractExpire,
            contractNumber: res.data.list[i].contractNo,
            contractStatus: res.data.list[i].state ? res.data.list[i].state = '有效' : res.data.list[i].state = '失效'
          };
          mockData.push(resData)
        }
        self.tableData3 = mockData;
        self.pageSum = res.data.total;
        self.pageNum = res.data.pageSize;
      })
    },
    handleRemove(file, fileList) {},
    saveContractInfo() {
      let self = this;
      let { time, lostTime } = this.dialogContract;
      time = `${new Date(time).getFullYear()}-${new Date(time).getMonth()+1}-${new Date(time).getDate()}`;
      lostTime = `${new Date(lostTime).getFullYear()}-${new Date(lostTime).getMonth()+1}-${new Date(lostTime).getDate()}`;
      let formData = new FormData($('#contractForm')[0]);
      formData.append('contractDate', time );
      formData.append('contractExpire', lostTime );
      $.ajax({ url: api.saveContractInfo, type: 'POST', data: formData, processData: false, contentType: false, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 1 ) {
          self.$message({ showClose: true, message: '修改成功', type: 'success' });
          setTimeout(() => location.reload(), 1000);
        } else {
          self.$message({ showClose: true, message: res.errMsg, type: 'error' });
        }
      })
    },
    delContractInfo() {
      let self = this;
      let idx = this.contractId;
      if(!idx) return self.$message({ showClose: true, message: '该成员未上传合同', type: 'error' });
      $.ajax({ url: api.delContractInfo, type: 'POST', data: { id: idx },xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 1 ) {
          self.$message({ showClose: true, message: '删除成功', type: 'success' });
          setTimeout(() => location.reload(), 1000);
        } else {
          self.$message({ showClose: true, message: '删除失败', type: 'error' });
        }
      })
    },
		handleLook(index, row) {
			let data = {
        name: row.nickName,
        cardno: row.cardno,
        number: row.contractNumber,
        status: row.contractStatus,
        lostTime: row.lostTime,
        time: row.submitTime
      }
      this.lookContracts = data;
			this.lookContract = !this.lookContract;
		},
		handleEdit(index, row) {
      let self = this;
      this.dialogContract = null;
      let data = {
        id: row.id,
        projectId: self.projectId,
        teamId: row.teamId,
        memberId: row.memberId,
        name: row.nickName,
        cardno: row.cardno,
        number: row.contractNumber,
        status: row.contractStatus,
        lostTime: row.lostTime,
        time: row.submitTime,
      }
      this.dialogContract = data;
      this.editContract = !this.editContract;
    },
    handleDelete(index, row) {
      this.contractId = row.id;
    },
    projectToggle() {
      let self = this;
      let value = this.selectValue;
      $.ajax({ url: api.projectTreeGet, type: 'GET', data: {state: value },xhrFields: { withCredentials: true } }).done((res) => {
        self.leftbarData = res.data.list;
      })
    },
    handleNodeClick(data) {
      let self = this;
      if(!data.tid) return;
      self.idx = data.tid;
      self.projectId = data.pid;
      let mockData = [];
      $.ajax({ url: api.getContractInfo, type: 'GET', data: { teamId: data.tid, pageNum: 1, pageSize: 20 },xhrFields: { withCredentials: true } }).done((res) => {
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            idx: i+1,
            id: res.data.list[i].id,
            projectId: res.data.list[i].projectId,
            teamId:res.data.list[i].teamId,
            memberId: res.data.list[i].memberId,
            nickName: res.data.list[i].memberName,
            cardno: res.data.list[i].memberCardno,
            submitTime: res.data.list[i].contractDate,
            lostTime: res.data.list[i].contractExpire,
            contractNumber: res.data.list[i].contractNo,
            contractStatus: res.data.list[i].state ? res.data.list[i].state = '有效' : res.data.list[i].state = '失效'
          };
          mockData.push(resData)
        }
        self.tableData3 = mockData;
        self.pageSum = res.data.total;
        self.pageNum = res.data.pageSize;
      })
    },
    handleCurrentChange(val) {
      let self = this;
      let idx = this.idx;
      if( !idx ) return;
      let jsonData = [];
      $.ajax({ url: api.getContractInfo, type: 'GET', data: { teamId: idx, pageNum: val, pageSize: 20 },xhrFields: { withCredentials: true } }).done((res) => {
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            idx: i + 1,
            id: res.data.list[i].id,
            projectId: res.data.list[i].projectId,
            teamId:res.data.list[i].teamId,
            memberId: res.data.list[i].memberId,
            nickName: res.data.list[i].memberName,
            cardno: res.data.list[i].memberCardno,
            submitTime: res.data.list[i].contractDate,
            lostTime: res.data.list[i].contractExpire,
            contractNumber: res.data.list[i].contractNo,
            contractStatus: res.data.list[i].state ? res.data.list[i].state = '有效' : res.data.list[i].state = '失效'
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
.contract .contract-select {
  width: 13%;
}
.tree-container .right-bar-top {
  padding-bottom: 16px;
}
.contract-title {
  padding: 0 10px;
  font-size: 14px;
  line-height: 36px;
}
.contract-form {
  padding: 30px;
}
.contract-input {
	width: 13%;
}
.contract .el-pagination {
  padding: 30px 0 10px;
  text-align: right;
}
</style>