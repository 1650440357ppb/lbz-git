<template>
	<div class="blanklist">
	  <el-row class="tree-container self">
	    <el-col :span="4" class="left-bar">
	      <div class="blanklist-title">
	      	{{name}}<br>
	      	（黑名单）
	      </div>
	      <ul class="blanklist-list">
	      	<li class="blanklist-item" @click="chooseBlanklistKind('打架闹事')">打架闹事</li>
	      	<li class="blanklist-item" @click="chooseBlanklistKind('盗窃')">盗窃</li>
	      	<li class="blanklist-item" @click="chooseBlanklistKind('损坏公物')">损坏公物</li>
	      	<li class="blanklist-item" @click="chooseBlanklistKind('在逃人员')">在逃人员</li>
	      	<li class="blanklist-item" @click="chooseBlanklistKind('其他')">其他</li>
	      </ul>
				<div class="left-bar-btns">
					<el-button type="primary" @click="addBlanklist = true">添加人员</el-button>
				</div>
	    </el-col>
	    <el-col :span="20" class="right-bar">
	      <div class="right-bar-top">
	        <span>{{ rightBar }}</span>
	        <el-button class="blanklist-btns" type="primary" @click="openCloudBlackList">黑名单库</el-button>
	      </div>
	      <el-table :data="tableData3" v-if="!selfBlackList">
	      	<el-table-column prop="idx" label="序号" width="120"></el-table-column>
	      	<el-table-column prop="name" label="姓名" width="120"></el-table-column>
	      	<el-table-column prop="cardno" :show-overflow-tooltip="true" label="身份证号码"></el-table-column>
	      	<el-table-column prop="from" :show-overflow-tooltip="true" label="来源"></el-table-column>
	      	<el-table-column label="操作">
	      		<template scope="scope">
	              <el-button type="text" size="small" @click="handlePreview(scope.$index, scope.row)">查看</el-button>
	              <el-button type="text" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
								<el-popover ref="deleteblanklist{{$index}}" v-model="scope.row.deleteBlanklist" placement="top-start" width="200" trigger="click">
									<p style="line-height: 36px;">解除黑名单后云端也将删除该黑名单人员信息。是否解除黑名单？</p>
									<div style="text-align: right; margin: 0">
										<el-button size="mini" type="text" @click="scope.row.deleteBlanklist = false">取消</el-button>
										<el-button type="primary" size="mini" @click="deletePersonFromBlanklist">确定</el-button>
									</div>
								</el-popover>
	              <el-button type="text" size="small" v-popover:deleteblanklist{{$index}} @click.stop="handleDelete(scope.$index, scope.row)">解除黑名单</el-button>
	            </template>
	      	</el-table-column>
	      </el-table>
				<el-table :data="selfBlackList" v-else>
	      	<el-table-column prop="idx" label="序号" width="120"></el-table-column>
	      	<el-table-column prop="name" label="姓名" width="120"></el-table-column>
	      	<el-table-column prop="cardno" :show-overflow-tooltip="true" label="身份证号码"></el-table-column>
	      	<el-table-column prop="from" :show-overflow-tooltip="true" label="来源"></el-table-column>
	      	<el-table-column label="操作">
	      		<template scope="scope">
	              <el-button type="text" size="small" @click="handlePreview(scope.$index, scope.row)">查看</el-button>
	              <el-button type="text" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
								<el-popover ref="deleteblanklist{{$index}}" v-model="scope.row.deleteBlanklist" placement="top-start" width="200" trigger="click">
									<p style="line-height: 36px;">解除黑名单后云端也将删除该黑名单人员信息。是否解除黑名单？</p>
									<div style="text-align: right; margin: 0">
										<el-button size="mini" type="text" @click="scope.row.deleteBlanklist = false">取消</el-button>
										<el-button type="primary" size="mini" @click="deletePersonFromBlanklist">确定</el-button>
									</div>
								</el-popover>
	              <el-button type="text" size="small" v-popover:deleteblanklist{{$index}} @click="handleDelete(scope.$index, scope.row)">解除黑名单</el-button>
	            </template>
	      	</el-table-column>
	      </el-table>
	      <!-- <el-pagination layout="prev, pager, next" :total="pageSum"></el-pagination> -->
	    </el-col>
			<el-dialog title="添加人员" size="small" :visible.sync="addBlanklist">
		    <el-form class="blanklist-form" ref="addBlanklist" :model="dialogAddBlanklist" :rules="rules.dialogAddBlanklist">
		      <el-form-item prop="name" label="姓名" label-width="100px">
		        <el-input type="text" class="maxWidth" v-model="dialogAddBlanklist.name" placeholder="请输入姓名"></el-input>
		      </el-form-item>
		      <el-form-item prop="cardno" label="身份证" label-width="100px">
		        <el-input type="text" class="maxWidth" v-model="dialogAddBlanklist.cardno" placeholder="请输入身份证"></el-input>
		      </el-form-item>
		      <el-form-item prop="kind" label="选择类型" label-width="100px">
		        <el-select v-model="dialogAddBlanklist.kind" placeholder="选择类型">
		        	<el-option value="打架闹事" label="打架闹事"></el-option>
		          <el-option value="盗窃" label="盗窃"></el-option>
		          <el-option value="损坏公物" label="损坏公物"></el-option>
		          <el-option value="在逃人员" label="在逃人员"></el-option>
		          <el-option value="其他" label="其他"></el-option>
		         </el-select>
		      </el-form-item>
		      <el-form-item label="描述" label-width="100px">
		        <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 8}" placeholder="请输入描述(200字以内)" v-model="dialogAddBlanklist.desc"> </el-input>
		       </el-form-item>
		      <el-form-item label-width="100px">
		        <el-button type="primary" @click="addPersonToBlanklist">添加</el-button>
		      </el-form-item>
		    </el-form>
	    </el-dialog>
	    <el-dialog title="编辑" size="small" :visible.sync="editBlanklist">
	    	<el-row>
	    		<el-col :span="11" style="text-align: center;">
	    			<img class="blanklist-avatar" :src="dialogblanklist.avatar" alt="">
	    		</el-col>
	    		<el-col :span="13">
		        <el-form class="blanklist-form">
		          <el-form-item label="姓名" label-width="100px">
		            {{ dialogblanklist.name }}
		          </el-form-item>
		          <el-form-item label="身份证" label-width="100px">
		            {{ dialogblanklist.cardno }}
		          </el-form-item>
		          <el-form-item label="选择类型" label-width="100px">
		            <el-select v-model="dialogblanklist.kind" placeholder="选择类型">
		            	<el-option value="打架闹事" label="打架闹事"></el-option>
		            	<el-option value="盗窃" label="盗窃"></el-option>
		            	<el-option value="损坏公物" label="损坏公物"></el-option>
		            	<el-option value="在逃人员" label="在逃人员"></el-option>
		            	<el-option value="其他" label="其他"></el-option>
		            </el-select>
		          </el-form-item>
		          <el-form-item label="描述" label-width="100px">
		            <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 8}" placeholder="请输入描述(200字以内)" v-model="dialogblanklist.desc"> </el-input>
		          </el-form-item>
		          <el-form-item label-width="100px">
		            <el-button type="primary" @click="saveEditBlanklist">保存</el-button>
		          </el-form-item>
		        </el-form>
	        </el-col>
	      </el-row>
	    </el-dialog>
	    <el-dialog title="查看" size="small" :visible.sync="previewBlanklist">
	    	<el-row>
	    		<el-col :span="11" style="text-align: center;">
	    			<img class="blanklist-avatar" :src="dialogblanklist.avatar" alt="">
	    		</el-col>
	    		<el-col :span="13">
		        <el-form class="blanklist-form">
		          <el-form-item label="姓名" label-width="100px">
		            {{ dialogblanklist.name }}
		          </el-form-item>
		          <el-form-item label="身份证" label-width="100px">
		            {{ dialogblanklist.cardno }}
		          </el-form-item>
		          <el-form-item label="类型" label-width="100px">
		            {{ dialogblanklist.kind }}
		          </el-form-item>
		          <el-form-item label="描述" label-width="100px">
		            {{ dialogblanklist.desc}}
		          </el-form-item>
		        </el-form>
	        </el-col>
	      </el-row>
	    </el-dialog>
			<el-dialog size="small" :visible.sync="cloudBlackList.status">
				<template slot="title"><span class="cloud-name">云黑名单</span><span class="cloud-extra">（同步黑名单至企业账户）</span></template>
				<el-row style="background-color: #f4fbfe;">
					<el-col :span="5">
						<ul class="blanklist-list">
							<li class="blanklist-item" @click="chooseCloudBlanklistKind('打架闹事')">打架闹事</li>
							<li class="blanklist-item" @click="chooseCloudBlanklistKind('盗窃')">盗窃</li>
							<li class="blanklist-item" @click="chooseCloudBlanklistKind('损坏公物')">损坏公物</li>
							<li class="blanklist-item" @click="chooseCloudBlanklistKind('在逃人员')">在逃人员</li>
							<li class="blanklist-item" @click="chooseCloudBlanklistKind('其他')">其他</li>
						</ul>
					</el-col>
					<el-col :span="19" style="background-color: #fff;">
						<div style="padding: 10px 0;text-align: center;">
							<span style="padding: 0 6px;">姓名</span>
							<el-input type="text" style="width: 25%;" placeholder="请输入姓名"></el-input>
							<span style="padding: 0 6px;">身份证号码</span>
							<el-input type="text" style="width: 25%;" placeholder="请输入身份证号码"></el-input>
							<el-button type="primary">搜索</el-button>
						</div>
						<el-table :data="cloudBlackList.list" stripe style="width: 100%" @selection-change="handleSelectionChange">
							<el-table-column type="selection" width="40"></el-table-column>
    					<el-table-column prop="idx" label="序号" width="70"></el-table-column>
							<el-table-column prop="name" label="姓名" width="80"></el-table-column>
							<el-table-column prop="cardno" :show-overflow-tooltip="true" label="身份证号码"></el-table-column>
							<el-table-column prop="from" :show-overflow-tooltip="true" label="来源"></el-table-column>
  					</el-table>
						<div class="clear" style="padding: 20px 8px;">
							<el-button style="float: left;" type="primary" size="small" @click="saveCloudBlackList">同步</el-button>
							<el-pagination style="float: right; padding:4px;" small layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageNum" :total="pageSum"></el-pagination>
						</div>
					</el-col>
				</el-row>
			</el-dialog>
	  </el-row>
  </div>
</template>
<script>
import api from '../script/api.js';
export default {
  data() {
    return {
			name: '',
			rightBar: '黑名单',
			cloudBlackList: {
				status: false,
				list: [],
				selectList: []
			},
			tableData3: null,
			selfBlackList: null,
			weekdayData: null,
			addBlanklist: false,
      editBlanklist: false,
			deleteBlanklist: false,
      previewBlanklist: false,
      pageSum: '',
			leftbarData: [],
			dialogAddBlanklist: {
      	name: '',
        cardno: '',
        desc: '',
        kind: ''
			},
			rules: {
				dialogAddBlanklist: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					],
					cardno: [
						{ required: true, message: '请输入身份证号码', trigger: 'blur' },
						{ min: 18, max: 18, message: '请输入18位身份证号码', trigger: 'blur' }
					],
					kind: [
						{ required: true, message: '请选择类型', trigger: 'blur' }
					]
				},
			},
      dialogblanklist: {
				id: '',
      	name: '',
        cardno: '',
        desc: '',
        from: '',
        avatar: '',
        kind: ''
      },
			deletePersonId: null,
			pageNum: null,
			pageSum: null
    }
	},
	created() {
		let self = this;
			$.ajax({ url: api.getCompanyInfo, type: 'GET', data: { falg: 0 }, xhrFields: { withCredentials: true } }).done((res) => {
				self.name = res.data.at.name;
			})
	},
  beforeMount() {
		let self = this;
		let data = [];
    // 获取项目考勤组树形结构
    $.ajax({ url: api.checkBlackList, type: 'GET', xhrFields: { withCredentials: true } }).done((res) => {
      if( res.errCode == 0 ) {
				for( let i = 0; i < res.data.list.length; i++ ) {
					let resData = {
						id: res.data.list[i].id_,
						idx: i + 1,
						name: res.data.list[i].name,
						cardno: res.data.list[i].cardno,
						kind: res.data.list[i].summary,
						desc: res.data.list[i].description,
						from: res.data.list[i].oaCompanyName
					}
					data.push(resData);
				}
				self.tableData3 = data;
			}
    })
  },
  methods: {
		handleCurrentChange(val) {
      let self = this;
			let data = [];
			$.ajax({ url: api.checkCloudBlankList, type: 'GET', data: { pageNum: val, pageSize: 10 }, xhrFields: { withCredentials: true } }).done((res) => {
				if( res.errCode == 0 ) {
					if( !res.data.list ) return;
					for( let i = 0; i < res.data.list.length; i++ ) {
						let resData = {
							id: res.data.list[i].id_,
							idx: i + 1,
							name: res.data.list[i].name,
							cardno: res.data.list[i].cardno,
							kind: res.data.list[i].summary,
							desc: res.data.list[i].description,
							from: res.data.list[i].oaCompanyName
						}
						data.push(resData);
					}
					self.cloudBlackList.list = data;
				}
        self.pageSum = res.data.total;
        self.pageNum = res.data.pageSize;
      })
    },
		chooseBlanklistKind(value) {
			this.rightBar = value;
			let self = this;
			let val = value;
			let data = this.tableData3;
			let mockData = []
			for( let i = 0; i < data.length; i++ ) {
				if( data[i].kind == val ) {
					data[i].idx = i + 1;
					mockData.push(data[i]);
				}
			}
			this.selfBlackList = mockData;
		},
		openCloudBlackList() {
			let self = this;
			let data = [];
			$.ajax({ url: api.checkCloudBlankList, type: 'GET', data: { pageNum: 1, pageSize: 10 }, xhrFields: { withCredentials: true } }).done((res) => {
				if( res.errCode == 0 ) {
					if( !res.data.list ) return;
					for( let i = 0; i < res.data.list.length; i++ ) {
						let resData = {
							id: res.data.list[i].id_,
							idx: i + 1,
							name: res.data.list[i].name,
							cardno: res.data.list[i].cardno,
							kind: res.data.list[i].summary,
							desc: res.data.list[i].description,
							from: res.data.list[i].oaCompanyName
						}
						data.push(resData);
					}
					self.cloudBlackList.list = data;
				}
				self.pageSum = res.data.total;
        self.pageNum = res.data.pageSize;
			})
			this.cloudBlackList.status = !this.cloudBlackList.status;
		},
		chooseCloudBlanklistKind(val) {
			this.rightBar = val;
		},
		handleSelectionChange(val) {
			let self = this;
			let data = [];
			val.forEach((e,i) => {
				data.push(e.id);
			})
			self.cloudBlackList.selectList = data;
		},
		saveCloudBlackList() {
			let self = this;
			let data = this.cloudBlackList.selectList;
			$.ajax({ url: api.syncCloudOaBlacklist, type: 'POST', data: { id: data }, traditional: true, xhrFields: { withCredentials: true } }).done((res) => {
				if( res.errCode == 0 ) {
					self.$message({ showClose: true, message: '同步成功', type: 'success' });
					setTimeout(function() {
            location.reload();
          },1000);
				} else {
					self.$message({ showClose: true, message: '同步失败', type: 'error' });
				}
			})
		},
		addPersonToBlanklist() {
			let self = this;
			let name = this.dialogAddBlanklist.name;
			let cardno = this.dialogAddBlanklist.cardno;
			let kind = this.dialogAddBlanklist.kind;
			let desc = this.dialogAddBlanklist.desc;
			let data = [];
			this.$refs.addBlanklist.validate((valid) => {
				if(valid) {
					$.ajax({ url: api.addPersonToBlanklist, type: 'POST', data: {name: name, cardno: cardno, summary: kind, description: desc }, xhrFields: { withCredentials: true } }).done((res) => {
						if( res.errCode == 0 ) {
							self.$message({ showClose: true, message: '添加成功', type: 'success' });
						} else {
							self.$message({ showClose: true, message: res.errMsg, type: 'error' });
						}
						self.addBlanklist = !self.addBlanklist;
					})
				} else {
					return false;
				}
			})
		},
		saveEditBlanklist() {
			let self = this;
			let idx = this.dialogblanklist.id;
			console.log(idx)
			let kind = this.dialogblanklist.kind;
			let desc = this.dialogblanklist.desc;
			$.ajax({ url: api.editBlackList, type: 'POST', data: { id: idx, summary: kind, description: desc }, xhrFields: { withCredentials: true } }).done((res) => {
				if( res.errCode == 0 ) {
					self.$message({ showClose: true, message: '修改成功', type: 'success' });
				} else {
					self.$message({ showClose: true, message: res.errMsg, type: 'error' });
				}
				self.editBlanklist = !self.editBlanklist;
			})
		},
  	handlePreview(index, row) {
  		let data = {
      	name: row.name,
        cardno: row.cardno,
        desc: row.desc,
        from: row.from,
        avatar: row.avatar,
        kind: row.kind
      }
      this.dialogblanklist = data;
  		this.previewBlanklist = !this.previewBlanklist;
  	},
  	handleEdit(index, row) {
      let data = {
      	name: row.name,
        cardno: row.cardno,
        desc: row.desc,
        id: row.id,
        avatar: row.avatar,
        kind: row.kind
      }
      this.dialogblanklist = data;
      this.editBlanklist = !this.editBlanklist;
    },
    handleDelete(index, row) {
			this.deletePersonId = row.id;
			// this.deleteBlanklist = !this.deleteBlanklist;
    },
		deletePersonFromBlanklist() {
			let self = this;
			let idx = this.deletePersonId;
			$.ajax({ url: api.deletePersonFromBlanklist, type: 'POST', data: { id: idx }, xhrFields: { withCredentials: true } }).done((res) => {
				if( res.errCode == 0 ) {
					self.$message({ showClose: true, message: '删除成功', type: 'success' });
					setTimeout(() => { location.reload() }, 1000);
				} else {
					self.$message({ showClose: true, message: res.errMsg, type: 'error' });
				}
			})
		}
  }
}
</script>
<style scoped>
.blanklist .left-bar {
	position: relative;
	min-height: 600px;
  padding-bottom: 90px;
}
.blanklist .left-bar-btns {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 16px 0;
  text-align: center;
  border-top: 1px solid #e1e8ed;
}
.blanklist ul, .blanklist li {
	list-style: none;
}
.blanklist-item {
	padding: 0 26px;
	line-height: 50px;
	font-size: 14px;
	color: #333;
	border-bottom: 1px solid #e1e8ed;
	cursor: pointer;
	transition: color .4s;
}
.blanklist .maxWidth {
	max-width: 217px;
}
.blanklist-item:hover {
	color: #399bf3;
}
.blanklist-title {
	padding: 20px 0;
	font-size: 14px;
	text-align: center;
	border-bottom: 1px solid #e1e8ed;
}
.blanklist .right-bar-top {
  position: relative;
  padding: 16px;
  padding-left: 0;
  margin-bottom: 20px;
}
.blanklist .blanklist-btns {
	position: absolute;
	top: 9px;
	right: 0;
}
.blanklist-form {
	padding: 30px 20px 30px 0;
}
.blanklist .el-pagination {
  padding: 30px 0 10px;
  text-align: right;
}
.blanklist-avatar {
	margin: 30px;
	width: 210px;
	height: 210px;
	border: 1px solid #e1e8ed;
}
.blanklist .cloud-name {
	color: #fff;
}
.blanklist .cloud-extra {
	color: #fff;
	font-size: 12px;
}
</style>

