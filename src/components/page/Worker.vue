<template>
	<div class="worker self">
		<el-row class="tree-container" style="position: relative;">
	    <el-col :span="4" class="left-bar">
	      <el-select class="left-bar-select" v-model="selectValue" placeholder="进行中的项目" @change="projectToggle">
	        <el-option label="进行中的项目" value="1"></el-option>
	        <el-option label="已结束的项目" value="2"></el-option>
	      </el-select>
	      <el-tree :data="leftbarData" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
	    </el-col>
	    <el-col :span="4" style="position: absolute; left: 0; bottom: 0;">
	    	<div style="padding: 20px 0; text-align: center;">
	    		<el-button type="primary" @click="rightContent = true">已离场人员</el-button>
	    	</div>
	    </el-col>
	    <el-col :span="20" class="right-bar">
	    	<div v-show="!rightContent">
	    		<div class="right-bar-top">
	          <span class="worker-title">姓名</span>
	          <el-input class="worker-input" v-model="searchByLimit.name" placeholder="请输入姓名"></el-input>
	          <span class="worker-title">身份证号码</span>
	          <el-input class="worker-input" v-model="searchByLimit.cardno" placeholder="请输入身份证号码"></el-input>
		        <el-button type="primary" :disabled="!workerList.teamId" @click="findByLimit">搜索</el-button>
		      </div>
		      <el-table :data="workerList.list" style="width: 100%">
	          <el-table-column align="left" prop="idx" label="序号" width="70"></el-table-column>
	          <el-table-column align="left" prop="member_name" label="姓名" width="80"></el-table-column>
	          <el-table-column align="left" :show-overflow-tooltip="true" prop="memeber_cardno" label="身份证号"></el-table-column>
	          <el-table-column align="left" :show-overflow-tooltip="true" prop="member_mobile" label="手机号"></el-table-column>
	          <el-table-column align="left" :show-overflow-tooltip="true" prop="emp_company" label="所属单位"></el-table-column>
	          <el-table-column align="left" prop="job_name_text" label="工种"></el-table-column>
	          <el-table-column align="left" prop="contract_status_text" label="劳动合同"></el-table-column>
	          <el-table-column align="left" prop="is_safety_text" label="安全培训"></el-table-column>
	          <el-table-column align="left" prop="is_state_text" label="是否离场"></el-table-column>
	          <el-table-column align="left" label="操作" width="">
	            <template scope="scope">
	              <el-button type="text" size="small" @click="handlePreview(scope.$index, scope.row)">查看</el-button>
	              <el-button type="text" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
	            </template>
	          </el-table-column>
	        </el-table>
	        <el-dialog title="编辑" :visible.sync="dialogEdit.status">
	        	<el-row style="padding: 30px; padding-bottom: 0;">
	        		<el-col :span="12">
	        			<img :src="dialogEdit.content.card_font" style="margin-bottom: 30px;" alt="">
	        			<img :src="dialogEdit.content.card_back" alt="">
	        		</el-col>
	        		<el-col :span="12">
	        			<el-form id="editWorkerInfo">
	        				<el-form-item label="姓名" label-width="100px">
	        					{{ dialogEdit.content.member_name }}
	        				</el-form-item>
	        				<el-form-item label="身份证号" label-width="100px">
	        					{{ dialogEdit.content.memeber_cardno }}
	        				</el-form-item>
	        				<el-form-item label="劳动合同" label-width="100px">
	        					{{ dialogEdit.content.contract_status_text }}
	        				</el-form-item>
	        				<el-form-item label="安全培训" label-width="100px">
	        					{{ dialogEdit.content.is_safety_text }}
	        				</el-form-item>
	        				<el-form-item label="所属单位" label-width="100px">
	        					{{ dialogEdit.content.emp_company }}
	        				</el-form-item>
	        				<el-form-item label="工种" label-width="100px">
	        					<el-select v-model="dialogEdit.content.job_name" placeholder="请选择工种">
	        						<el-option v-for="item in dialogEdit.dict" :key="item" :label="item.label" :value="item.value"></el-option>
	        					</el-select>
	        				</el-form-item>
	        				<el-form-item label="人员类型" label-width="100px">
	        					<el-select v-model="dialogEdit.content.job_typename" placeholder="请选择人员类型">
	        						<el-option label="一般作业人员" value="1"></el-option>
	        						<el-option label="特种作业人员" value="2"></el-option>
	        						<el-option label="项目管理人员" value="3"></el-option>
	        						<el-option label="其他人员" value="4"></el-option>
	        					</el-select>
	        				</el-form-item>
	        				<el-form-item label="开户银行" label-width="100px">
	        					<el-input type="text" v-model="dialogEdit.content.emp_bankname" placeholder="请输入银行账户"></el-input>
	        				</el-form-item>
	        				<el-form-item label="账户" label-width="100px">
	        					<el-input type="text" v-model="dialogEdit.content.emp_cardnum" placeholder="请输入银行账户"></el-input>
	        				</el-form-item>
	        				<el-form-item label="重要人员" label-width="100px">
	        					<el-radio-group v-model="dialogEdit.content.cwr_iskeypsn">
	        						<el-radio :label="1">是</el-radio>
	        						<el-radio :label="0">否</el-radio>
	        					</el-radio-group>
	        				</el-form-item>
	        				<el-form-item label="是否离场" label-width="100px">
	        					<el-radio-group v-model="dialogEdit.content.is_state">
	        						<el-radio :label="1">是</el-radio>
	        						<el-radio :label="0">否</el-radio>
	        					</el-radio-group>
	        				</el-form-item>
	        				<el-form-item v-if="dialogEdit.content.is_state" label="离场凭证" label-width="100px">
	        					<el-upload :action="dialogEdit.uploadUrlSuffix" name="isStateImg" :auto-upload="false" :file-list="dialogEdit.fileUrl" :with-credentials="true">
	        						<el-button type="primary" size="small">点击上传</el-button>
	        						<div slot="tip" class="el-upload__tip">上传提示</div>
	        					</el-upload>
	        				</el-form-item>
	        				<el-form-item v-if="dialogEdit.content.is_state" label="离场评分" label-width="100px">
	        					<el-rate style="margin-top: 6px;" v-model="dialogEdit.content.score"></el-rate>
	        				</el-form-item>
	        				<el-form-item v-if="dialogEdit.content.is_state" label="评价" label-width="100px">
	        					<el-input type="textarea" v-model="dialogEdit.content.evaluate" :row="3" placeholder="请输入评价内容"></el-input>
	        				</el-form-item>
	        			</el-form>
	        		</el-col>
	        	</el-row>
	        	<div style="padding: 10px 0 30px; text-align: center;">
	        		<el-button @click="dialogEdit.status = false">取消</el-button>
	        		<el-button type="primary" @click="saveEditWorkerInfo">保存</el-button>
	        	</div>
	        </el-dialog>
	        <el-dialog title="查看" :visible.sync="dialogPreview.status">
	        	<el-row style="padding: 30px;">
	        		<el-col :span="12" style="font-size: 0;">
	        			<img :src="dialogPreview.content.card_font" style="margin-bottom: 30px;" alt="">
	        			<img :src="dialogPreview.content.card_back" alt="">
	        		</el-col>
	        		<el-col :span="12">
	        			<el-form>
	        				<el-form-item label="姓名" label-width="100px">{{ dialogPreview.content.member_name }}</el-form-item>
	        				<el-form-item label="身份证号" label-width="100px">{{ dialogPreview.content.memeber_cardno }}</el-form-item>
	        				<el-form-item label="劳动合同" label-width="100px">{{ dialogPreview.content.contract_status_text }}</el-form-item>
	        				<el-form-item label="安全培训" label-width="100px">{{ dialogPreview.content.is_safety_text }}</el-form-item>
	        				<el-form-item label="所属单位" label-width="100px">{{ dialogPreview.content.emp_company }}</el-form-item>
	        				<el-form-item label="工种" label-width="100px">{{ dialogPreview.content.job_name_text }}</el-form-item>
	        				<el-form-item label="人员类型" label-width="100px">{{ dialogPreview.content.job_typename_text }}</el-form-item>
	        				<el-form-item label="开户银行" label-width="100px">{{ dialogPreview.content.emp_bankname }}</el-form-item>
	        				<el-form-item label="账户" label-width="100px">{{ dialogPreview.content.emp_cardnum }}</el-form-item>
	        				<el-form-item label="重要人员" label-width="100px">{{ dialogPreview.content.cwr_iskeypsn_text }}</el-form-item>
	        				<el-form-item label="是否离场" label-width="100px">{{ dialogPreview.content.is_state_text }}</el-form-item>
		        			<el-form-item label="离场凭证" label-width="100px" v-if="dialogPreview.content.is_state">
		        				<el-button type="primary" size="small" v-if="dialogPreview.content.is_state_img" @click="downloadProof(dialogPreview.content.is_state_img)">下载凭证</el-button>
		        				<span v-else>未上传离场凭证</span>
		        			</el-form-item>
		        			<el-form-item label="离场评分" label-width="100px" v-if="dialogPreview.content.is_state"><el-rate v-model="dialogPreview.content.score" disabled style="margin-top: 6px;"></el-rate></el-form-item>
		        			<el-form-item label="评价" label-width="100px" v-if="dialogPreview.content.is_state">{{ dialogPreview.content.evaluate }}</el-form-item>
	        				<el-form-item label="" label-width="100px"><el-button type="primary" @click="downloadWorkerInfo(dialogPreview.content.id_)">下载工人资料</el-button></el-form-item>
	        			</el-form>
	        		</el-col>
	        	</el-row>
	        </el-dialog>
	        <div style="position: relative; padding: 30px 0;">
	        	<el-button type="primary" @click="downloadWorkersInfo">下载工人资料</el-button>
	        	<el-pagination style="position: absolute; top: 30px; right: 0;" layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="workerList.pageSize" :total="workerList.pageNum"></el-pagination>
	        </div>
	    	</div>
	    	<div v-show="rightContent">
	    		<div class="right-bar-top">
	    			<span class="worker-title">已离场人员</span>
	    			<span class="worker-title">项目</span>
	    			<el-select v-model="searchByLimit.project" @change="checkAwayTeamMember">
	    				<el-option v-for="item in leftbarData" :key="item" :label="item.text" :value="item.pid"></el-option>
	    			</el-select>
	    		</div>
	    		<el-table :data="awayList.list">
	    			<el-table-column prop="idx" label="序号" width="70"></el-table-column>
	    			<el-table-column prop="member_name" label="姓名"></el-table-column>
	    			<el-table-column prop="memeber_cardno" :show-overflow-tooltip="true" label="身份证号"></el-table-column>
	    			<el-table-column prop="member_mobile" label="手机号"></el-table-column>
	    			<el-table-column prop="emp_company" :show-overflow-tooltip="true"  label="所属单位"></el-table-column>
	    			<el-table-column prop="job_name_text" label="工种"></el-table-column>
	    			<el-table-column prop="contract_status_text" label="劳动合同"></el-table-column>
	    			<el-table-column prop="is_safety_text" label="安全培训"></el-table-column>
	    			<el-table-column prop="score_text" label="离场评分"></el-table-column>
	    			<el-table-column prop="" label="操作">
	    				<template scope="scope">
	    					<el-button type="text" @click="handlePreviewAway(scope.$index,scope.row)">查看</el-button>
	    				</template>
	    			</el-table-column>
	    		</el-table>
	    		<div style="position: relative; padding: 30px 0;">
	    			<el-pagination style="position: absolute; top: 30px; right: 0;" layout="prev, pager, next" @current-change="handleCurrentChanges" :page-size="awayList.pageNum" :total="awayList.pageSum"></el-pagination>
	    		</div>
	    		<el-dialog title="查看" :visible.sync="handlePreviewAwayWorker.status">
	    			<el-row style="padding: 30px;">
	    				<el-col :span="12">
	    					<img :src="handlePreviewAwayWorker.content.card_font" style="margin-bottom: 30px;" alt="">
	        			<img :src="handlePreviewAwayWorker.content.card_back" alt="">
	    				</el-col>
	    				<el-col :span="12">
	    					<el-form>
	    						<el-form-item label="姓名" label-width="100px">{{ handlePreviewAwayWorker.content.member_name }}</el-form-item>
	    						<el-form-item label="身份证号" label-width="100px">{{ handlePreviewAwayWorker.content.memeber_cardno }}</el-form-item>
	    						<el-form-item label="劳动合同" label-width="100px">{{ handlePreviewAwayWorker.content.contract_status_text }}</el-form-item>
	    						<el-form-item label="安全培训" label-width="100px">{{ handlePreviewAwayWorker.content.is_safety_text }}</el-form-item>
	    						<el-form-item label="所属单位" label-width="100px">{{ handlePreviewAwayWorker.content.emp_company }}</el-form-item>
	    						<el-form-item label="工种" label-width="100px">{{ handlePreviewAwayWorker.content.job_name_text }}</el-form-item>
	    						<el-form-item label="人员类型" label-width="100px">{{ handlePreviewAwayWorker.content.job_typename_text }}</el-form-item>
	    						<el-form-item label="开户银行" label-width="100px">{{ handlePreviewAwayWorker.content.emp_bankname }}</el-form-item>
	    						<el-form-item label="账户" label-width="100px">{{ handlePreviewAwayWorker.content.emp_cardnum }}</el-form-item>
	    						<el-form-item label="重要人员" label-width="100px">{{ handlePreviewAwayWorker.content.cwr_iskeypsn_text }}</el-form-item>
	    						<el-form-item label="是否离场" label-width="100px">{{ handlePreviewAwayWorker.content.is_state_text }}</el-form-item>
	    						<el-form-item label="离场凭证" label-width="100px"><el-button type="primary" size="small" @click="downloadProof(handlePreviewAwayWorker.content.is_state_img)">下载凭证</el-button></el-form-item>
	    						<el-form-item label="离场评分" label-width="100px"><el-rate v-model="handlePreviewAwayWorker.content.score" disabled style="margin-top: 6px;"></el-rate></el-form-item>
	    						<el-form-item label="评价" label-width="100px">{{ handlePreviewAwayWorker.content.evaluate }}</el-form-item>
	    						<el-form-item label="" label-width="100px">
	    							<el-button type="primary" @click="downloadWorkerInfo(handlePreviewAwayWorker.content.id_)">下载工人资料</el-button>
	    						</el-form-item>
	    					</el-form>
	    				</el-col>
	    			</el-row>
	    		</el-dialog>
	    	</div>
	    </el-col>
	   </el-row>
	</div>
</template>
<script>
	import api from '../script/api.js';
	export default {
		data() {
			return {
				rightContent: false,
				dialogPreview: {
					status: false,
					content: {}
				},
				searchByLimit: {
					name: '',
					cardno: '',
					project: []
				},
				handlePreviewAwayWorker: {
					status: false,
					content: {}
				},
				dialogEdit: {
					status: false,
					uploadUrl: '',
					uploadUrlSuffix: '',
					content: {},
					dict: [],
					fileUrl: []
				},
				awayList: {
					list: [],
					pageNum: '',
					pageSum: '',
					projectId: ''
				},
				workerList: {
					list: [],
					pageNum: '',
					pageSum: '',
					teamId: '',
					projectId: ''
				},
				selectValue: '',
				leftbarData: [],
				defaultProps: {
          children: 'nodes',
          label: 'text'
        },
			}
		},
		created() {
			let self = this;
      $.ajax({ url: api.projectTreeGet, type: 'GET', data: {state: 1},xhrFields: { withCredentials: true } }).done((res) => {
        self.leftbarData = res.data.list;
      })
		},
		methods: {
			findByLimit() {
				let self = this;
				let { name, cardno } = this.searchByLimit;
				let formData = { teamId: self.workerList.teamId };
				if( name ) formData.name = name;
				if( cardno ) formData.cardno = cardno;
				$.ajax({ url: api.findWorkerByLimit, type: 'GET', data: formData, xhrFields: { withCredentials: true } }).done((res) => {
					for( let i = 0; i < res.data.list.length; i++ ) {
	  				switch (res.data.list[i].job_typename) {
	  					case 1:
	  						res.data.list[i].job_typename_text = '一般作业人员';
	  						break;
	  					case 2:
	  						res.data.list[i].job_typename_text = '特种作业人员';
	  						break;
	  					case 3:
	  						res.data.list[i].job_typename_text = '项目管理人员';
	  						break;
	  					case 4:
	  						res.data.list[i].job_typename_text = '其他人员';
	  						break;
	  				};
	  				res.data.list[i].idx = i + 1;
	  				res.data.list[i].cwr_iskeypsn_text = res.data.list[i].cwr_iskeypsn == 0 ? '否' : '是';
	  				res.data.list[i].is_state_text = res.data.list[i].is_state == 0 ? '未离场' : '已离场';
	  				res.data.list[i].is_safety_text = res.data.list[i].is_safety == 0 ? '未培训' : '已培训';
	  				res.data.list[i].contract_status_text = res.data.list[i].contract_status == 0 ? '无效' : '有效';
	  				res.data.list[i].score = Math.abs(res.data.list[i].score);
	  				res.data.list[i].score_text = `${Math.abs(res.data.list[i].score)}星`;
	  			}
	  			$.ajax({ url: api.getWorkerKey, type: 'GET', xhrFields: { withCredentials: true } }).done((ress) => {
	  				self.dialogEdit.dict = ress;
	  				for( let i = 0; i < res.data.list.length; i++ ) {
	  					for( let j = 0; j < ress.length; j++ ) {
	  						if( ress[j].value == res.data.list[i].job_name ) {
	  							res.data.list[i].job_name_text = ress[j].label;
	  						}
	  					}
		  			}
	  			});
	  			self.workerList.list = res.data.list;
					self.workerList.pageSum = parseInt(res.data.total);
					self.workerList.pageNum = parseInt(res.data.pageSize);
				})
			},
			saveEditWorkerInfo() {
				let obj = this.dialogEdit.content;
				let formData = new FormData($("#editWorkerInfo")[0]);
				formData.append("id", obj.id_);
				formData.append('jobName', obj.job_name);
				formData.append('jobTypename', obj.job_typename);
				formData.append('empBankname', obj.emp_bankname);
				formData.append('empCategory', obj.emp_category);
				formData.append('cwrIskeypsn', obj.cwr_iskeypsn);
				formData.append('isState', obj.is_state);
				formData.append('score', obj.score);
				formData.append('evaluate', obj.evaluate);
				$.ajax({ url: api.saveEditWorker, type: 'POST', data: formData, processData: false, contentType: false }).done((res) => {
					if( res.errCode == 0 ) {
						self.$message({ type: 'success', message: '保存成功' });
					} else {
						self.$message({ type: 'error', message: res.errMsg });
					}
				})
			},
			handlePreviewAway(index, row) {
				this.handlePreviewAwayWorker.content = row;
				this.handlePreviewAwayWorker.status = !this.handlePreviewAwayWorker.status;
			},
			checkAwayTeamMember(value) {
				let self = this;
				this.awayList.projectId = value;
				$.ajax({ url: api.awayOaTeamMember, type: 'GET', data: { projectId: value, pageNum: 1, pageSize: 20 }, xhrFields: { withCredentials: true } }).done((res) => {
					for( let i = 0; i < res.data.list.length; i++ ) {
	  				switch (res.data.list[i].job_typename) {
	  					case 1:
	  						res.data.list[i].job_typename_text = '一般作业人员';
	  						break;
	  					case 2:
	  						res.data.list[i].job_typename_text = '特种作业人员';
	  						break;
	  					case 3:
	  						res.data.list[i].job_typename_text = '项目管理人员';
	  						break;
	  					case 4:
	  						res.data.list[i].job_typename_text = '其他人员';
	  						break;
	  				};
	  				res.data.list[i].idx = i + 1;
	  				res.data.list[i].cwr_iskeypsn_text = res.data.list[i].cwr_iskeypsn == 0 ? '否' : '是';
	  				res.data.list[i].is_state_text = res.data.list[i].is_state == 0 ? '未离场' : '已离场';
	  				res.data.list[i].is_safety_text = res.data.list[i].is_safety == 0 ? '未培训' : '已培训';
	  				res.data.list[i].contract_status_text = res.data.list[i].contract_status == 0 ? '无效' : '有效';
	  				res.data.list[i].score = Math.abs(res.data.list[i].score);
	  				res.data.list[i].score_text = `${Math.abs(res.data.list[i].score)}星`;
	  			}
      	$.ajax({ url: api.getWorkerKey, type: 'GET', xhrFields: { withCredentials: true } }).done((ress) => {
      		for( let i = 0; i < res.data.list.length; i++ ) {
      			for( let j = 0; j < ress.length; j++ ) {
      				if( res.data.list[i].job_name == ress[j].value ) {
      					res.data.list[i].job_name_text = ress[j].label;
      				}
      			}
      		}
      	});
				self.awayList.list = res.data.list;
				self.awayList.pageSum = parseInt(res.data.total);
				self.awayList.pageNum = parseInt(res.data.pageSize);
				})
			},
			downloadWorkersInfo() {
				let self = this;
				let idx = this.workerList.teamId;
				if( !idx ) return;
				$.ajax({ url: api.downWorkerInfoBatch, type: 'GET', data: { teamId: idx }, xhrFields: { withCredentials: true } }).done((res) => {
					if( res.errCode == 0 ) {
						window.location.href = res.data;
					} else {
						self.$message({ type: 'error', message: res.errMsg });
					}
				})
			},
			handlePreview(index, row) {
				this.dialogPreview.content = row;
				this.dialogPreview.status = !this.dialogPreview.status;
			},
			handleEdit(index, row) {
				let self = this;
				$.ajax({ url: api.getWorkerKey, type: 'GET', xhrFields: { withCredentials: true } }).done((res) => {
					self.dialogEdit.dict = res;
					self.dialogEdit.content = row;
					self.dialogEdit.status = !self.dialogEdit.status;
					self.dialogEdit.uploadUrlSuffix = `${self.dialogEdit.uploadUrl}?mid=${row.id_}`;
				})
			},
			projectToggle() {
	      let self = this;
	      let value = this.selectValue;
	      $.ajax({ url: api.projectTreeGet, type: 'GET', data: {state: value },xhrFields: { withCredentials: true } }).done((res) => {
	        self.leftbarData = res.data.list;
	      })
	    },
	    downloadProof(uri) {
	    	window.location.href = uri;
	    },
	    downloadWorkerInfo(id) {
	    	let self = this;
	    	$.ajax({ url: api.downWorkerInfo, type: 'GET', data: { id: id },xhrFields: { withCredentials: true } }).done((res) => {
	    		if( res.errCode == 0 ) {
	    			window.location.href = res.data;
	    		} else {
	    			self.$message({ type: 'error', message: '下载工人资料失败' });
	    		}
	    	})
	    },
	  	handleNodeClick(data) {
	  		let self = this;
	  		self.rightContent = false;
	  		self.workerList.projectId = data.pid;
	  		self.workerList.teamId = data.tid;
	  		$.ajax({ url: api.getWorkerInfo, type: 'GET', data: { teamId: data.tid, pageNum: 1, pageSize: 20 },xhrFields: { withCredentials: true } }).done((res) => {
	  			for( let i = 0; i < res.data.list.length; i++ ) {
	  				switch (res.data.list[i].job_typename) {
	  					case 1:
	  						res.data.list[i].job_typename_text = '一般作业人员';
	  						break;
	  					case 2:
	  						res.data.list[i].job_typename_text = '特种作业人员';
	  						break;
	  					case 3:
	  						res.data.list[i].job_typename_text = '项目管理人员';
	  						break;
	  					case 4:
	  						res.data.list[i].job_typename_text = '其他人员';
	  						break;
	  				};
	  				res.data.list[i].idx = i + 1;
	  				res.data.list[i].cwr_iskeypsn_text = res.data.list[i].cwr_iskeypsn == 0 ? '否' : '是';
	  				res.data.list[i].is_state_text = res.data.list[i].is_state == 0 ? '未离场' : '已离场';
	  				res.data.list[i].is_safety_text = res.data.list[i].is_safety == 0 ? '未培训' : '已培训';
	  				res.data.list[i].contract_status_text = res.data.list[i].contract_status == 0 ? '无效' : '有效';
	  				res.data.list[i].score = Math.abs(res.data.list[i].score);
	  				res.data.list[i].score_text = `${Math.abs(res.data.list[i].score)}星`;
	  			}
	  			$.ajax({ url: api.getWorkerKey, type: 'GET', xhrFields: { withCredentials: true } }).done((ress) => {
	  				self.dialogEdit.dict = ress;
	  				for( let i = 0; i < res.data.list.length; i++ ) {
	  					for( let j = 0; j < ress.length; j++ ) {
	  						if( ress[j].value == res.data.list[i].job_name ) {
	  							res.data.list[i].job_name_text = ress[j].label;
	  							self.workerList.list = res.data.list;
					  			self.workerList.pageSum = parseInt(res.data.total);
					  			self.workerList.pageNum = parseInt(res.data.pageSize);
					  			self.dialogEdit.uploadUrl = `${api.uploadPayrollExcel}?bus=GR?pid=${data.pid}`;
	  						}
	  					}
		  			}
	  			})
	  		})
	  	},
	  	handleCurrentChange(value) {
	  		let self = this;
	  		self.rightContent = false;
	  		let idx = self.workerList.teamId;
	  		$.ajax({ url: api.getWorkerInfo, type: 'GET', data: { teamId: idx, pageNum: value, pageSize: 20 },xhrFields: { withCredentials: true } }).done((res) => {
	  			for( let i = 0; i < res.data.list.length; i++ ) {
	  				switch (res.data.list[i].job_typename) {
	  					case 1:
	  						res.data.list[i].job_typename_text = '一般作业人员';
	  						break;
	  					case 2:
	  						res.data.list[i].job_typename_text = '特种作业人员';
	  						break;
	  					case 3:
	  						res.data.list[i].job_typename_text = '项目管理人员';
	  						break;
	  					case 4:
	  						res.data.list[i].job_typename_text = '其他人员';
	  						break;
	  				};
	  				res.data.list[i].idx = i + 1;
	  				res.data.list[i].cwr_iskeypsn_text = res.data.list[i].cwr_iskeypsn == 0 ? '否' : '是';
	  				res.data.list[i].is_state_text = res.data.list[i].is_state == 0 ? '未离场' : '已离场';
	  				res.data.list[i].is_safety_text = res.data.list[i].is_safety == 0 ? '未培训' : '已培训';
	  				res.data.list[i].contract_status_text = res.data.list[i].contract_status == 0 ? '无效' : '有效';
	  				res.data.list[i].score = Math.abs(res.data.list[i].score);
	  				res.data.list[i].score_text = `${Math.abs(res.data.list[i].score)}星`;
	  			}
	  			$.ajax({ url: api.getWorkerKey, type: 'GET', xhrFields: { withCredentials: true } }).done((ress) => {
	  				self.dialogEdit.dict = ress;
	  				for( let i = 0; i < res.data.list.length; i++ ) {
	  					for( let j = 0; j < ress.length; j++ ) {
	  						if( ress[j].value == res.data.list[i].job_name ) {
	  							res.data.list[i].job_name_text = ress[j].label;
	  							self.workerList.list = res.data.list;
					  			self.workerList.pageSum = parseInt(res.data.total);
					  			self.workerList.pageNum = parseInt(res.data.pageSize);
					  			self.dialogEdit.uploadUrl = `${api.uploadPayrollExcel}?bus=GR?pid=${data.pid}`;
	  						}
	  					}
		  			}
	  			})
	  		})
	  	},
	  	handleCurrentChanges(value) {
	  		let self = this;
	  		let idx = this.awayList.projectId;
				$.ajax({ url: api.awayOaTeamMember, type: 'GET', data: { projectId: idx, pageNum: value, pageSize: 20 }, xhrFields: { withCredentials: true } }).done((res) => {
					for( let i = 0; i < res.data.list.length; i++ ) {
	  				switch (res.data.list[i].job_typename) {
	  					case 1:
	  						res.data.list[i].job_typename_text = '一般作业人员';
	  						break;
	  					case 2:
	  						res.data.list[i].job_typename_text = '特种作业人员';
	  						break;
	  					case 3:
	  						res.data.list[i].job_typename_text = '项目管理人员';
	  						break;
	  					case 4:
	  						res.data.list[i].job_typename_text = '其他人员';
	  						break;
	  				};
	  				res.data.list[i].idx = i + 1;
	  				res.data.list[i].cwr_iskeypsn_text = res.data.list[i].cwr_iskeypsn == 0 ? '否' : '是';
	  				res.data.list[i].is_state_text = res.data.list[i].is_state == 0 ? '未离场' : '已离场';
	  				res.data.list[i].is_safety_text = res.data.list[i].is_safety == 0 ? '未培训' : '已培训';
	  				res.data.list[i].contract_status_text = res.data.list[i].contract_status == 0 ? '无效' : '有效';
	  				res.data.list[i].score = Math.abs(res.data.list[i].score);
	  				res.data.list[i].score_text = `${Math.abs(res.data.list[i].score)}星`;
	  			}
      	$.ajax({ url: api.getWorkerKey, type: 'GET', xhrFields: { withCredentials: true } }).done((ress) => {
      		for( let i = 0; i < res.data.list.length; i++ ) {
      			for( let j = 0; j < ress.length; j++ ) {
      				if( res.data.list[i].job_name == ress[j].value ) {
      					res.data.list[i].job_name_text = ress[j].label;
      				}
      			}
      		}
      	});
				self.awayList.list = res.data.list;
				self.awayList.pageSum = parseInt(res.data.total);
				self.awayList.pageNum = parseInt(res.data.pageSize);
				})
	  	}
		}
	}
</script>
<style>
.worker .right-bar-top {
	padding: 10px 0 20px;
}
.worker-title {
  padding: 0 10px;
  font-size: 14px;
  line-height: 36px;
}
.worker-input {
	width: 13%;
}
</style>