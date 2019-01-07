<template>
  <div class="topbar">
    <div class="topbar-left">
			<span class="name">{{ company.name }}</span>
			<span class="proving" v-if="company.status == 0">还未认证？<router-link :to="{path: 'prove',query: { isReal: company.status }}">马上认证</router-link></span>
			<span class="proving" v-else-if="company.status == 2"><router-link :to="{path: 'prove',query: { companyName: company.name, isReal: company.status }}">认证中</router-link></span>
			<i class="pass" v-else></i>
		</div>
		<div class="topbar-right">
			<el-popover popper-class="topbar-right-popover" ref="Import" placement="bottom" width="200" trigger="click">
				<div v-if="project.length > 0">
					<el-radio-group v-model="importProject">
						<el-radio v-for="item in project" :key="item" :label="item.id">{{ item.name }}</el-radio>
					</el-radio-group>
					<div class="importProject-btns">
						<el-button type="primary" size="small" @click="importProjectFunc">导入项目</el-button>
					</div>
				</div>
				<span class="empty" v-else>暂无可导入项目</span>
			</el-popover>
			<el-popover popper-class="topbar-right-popover" ref="Building" placement="bottom" width="200" trigger="click">
				<ul class="topbar-right-list" v-if="lists.length > 0">
					<li v-for="item in lists" :key="item" @click="switchCompany(item.id)">{{ item.company }}</li>
					<li @click="buildCompany.status = true">创建公司</li>
				</ul>
				<ul class="topbar-right-list" v-else>
					<span class="empty">暂无公司</span>
					<li @click="buildCompany.status = true">创建公司</li>
				</ul>
			</el-popover>
			<span class="import" v-popover:Import>导入项目<i class="iconfont icon icon-daoru"></i></span>
			<span class="build" v-popover:Building>创建/切换公司<i class="icon el-icon-d-caret"></i></span>
			<span class="exit" @click="modalShow = true">退出<i class="icon el-icon-more"></i></span>			
		</div>
		<el-dialog title="创建公司" :visible.sync="buildCompany.status" size="tiny" :before-close="handleClose">
			<el-form class="self" ref="buildCompany" :model="buildCompany" :rules="rules.buildCompany">
				<el-form-item prop="name" label="公司名称" label-width="80px">
					<el-input v-model="buildCompany.name" placeholder="请输入公司名称" ></el-input>
				</el-form-item>
				<el-form-item prop="shortName" label="公司简称" label-width="80px">
					<el-input v-model="buildCompany.shortName" placeholder="请输入公司简称" ></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="buildCompany.status = false">取 消</el-button>
				<el-button type="primary" @click="buildCompanyFunc">确 定</el-button>
			</span>
		</el-dialog>
		<el-dialog title="提示" :visible.sync="modalShow" size="tiny" :before-close="handleClose">
			<span>是否确认退出？</span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="modalShow = false">取 消</el-button>
				<el-button type="primary" @click="exitLogin">确 定</el-button>
			</span>
		</el-dialog>
  </div>
</template>
<script>
import api from '../../script/api.js';
import webStorageCache from 'web-storage-cache';
export default {
  data() {
    return {
		buildCompany: {
			status: false,
			name: '',
			shortName: ''
		},
		rules: {
			buildCompany: {
				name: [
					{ required: true, message: '请输入公司名称', trigger: 'blur' }
				],
				shortName: [
					{ required: true, message: '请输入公司简称', trigger: 'blur' }
				]
			}
		},
		company: {
			name: '',
			status: null
		},
		lists: [],
		project: [],
		importProject: '',
		modalShow: false,
		isReal: 0
    }
  },
	created() {
		this.getCompany(0);
		this.getImportProject();
	},
	methods: {
		exitLogin() {
			let self = this;
			let wsCache = new webStorageCache();
			if(wsCache.get('_uid')) wsCache.delete('_uid');
			if(wsCache.get('_cid')) wsCache.delete('_cid');
			this.modalShow = false;
			setTimeout(function() {
				self.$router.push('/login');
			},1000);
		},
		switchCompany(k) {
			let self = this;
			$.ajax({ url: api.switchCompany, type: 'GET', data: { id: k }, xhrFields: { withCredentials: true } }).done((res) => {
				if( res.errCode == 1 ) {
					self.getCompany()
				}
				location.reload();
			})
		},
		importProjectFunc() {
			let self = this;
			let value = this.importProject;
			if(!value) {
				this.$message({ showClose: true, message: '请选择项目导入', type: 'error' });
				return;
			}
			$.ajax({ url: api.importProject, type: 'GET', data: { id: value }, xhrFields: { withCredentials: true } }).done((res) => {
				if( res.state == 1 ) {
					self.$message({ showClose: true, message: '导入成功', type: 'success' });
					location.reload();
				} else {
					self.$message({ showClose: true, message: '导入失败', type: 'error' });
				}
			})
		},
		buildCompanyFunc() {
			let self = this;
			this.$refs.buildCompany.validate((valid) => {
				if(valid) {
					let name = self.buildCompany.name;
					let short = self.buildCompany.shortName;
					$.ajax({ url: api.buildCompany, type: 'POST', data: { name: name, shortName: short }, xhrFields: { withCredentials: true } }).done((res) => {
						if( res.errCode == 1 ) { 
							self.$message({ message: '创建成功', type: 'success' }); 
							self.getCompany(1);
							self.buildCompany.status = false
						} else { this.$message.error('创建失败'); }
					})
				} else {
					return false;
				}
			})
		},
		handleClose() {
			if(this.buildCompany.status) this.buildCompany.status = false;
			if(this.modalShow) this.modalShow = false;
		},
		getImportProject() {
			let self = this;
			let list = [];
			$.ajax({ url: api.importProject, type: 'GET', xhrFields: { withCredentials: true } }).done((res) => {
				for( let i = 0; i < res.data.length; i++ ) {
					let resData = {
						id: res.data[i].id,
						name: res.data[i].name
					}
					list.push(resData);
				}
				self.project = list;
			})
		},
		getCompany(s) {
			if(!s) s = 0;
			let self = this;
			let list = [];
			let wsCache = new webStorageCache();
			let identifyCode = wsCache.get('identifyCode');
			if(!identifyCode) return;
			$.ajax({ url: api.getCompanyInfo, type: 'GET', data: { falg: s }, xhrFields: { withCredentials: true } }).done((res) => {
				for( let i = 0; i < res.data.companys.length; i++ ) {
					let resData = {
						id: res.data.companys[i].id,
						company: res.data.companys[i].name
					}
					list.push(resData);
				}
				let data = {
					name: res.data.at.name,
					status: res.data.at.isReal
				};
				self.lists = list;
				self.company = data;
			})
		}
	}
}
</script>
<style>
	.topbar {
		padding: 16px 32px;
		font-size: 20px;
		line-height: 26px;
		color: #333;
	}
	.topbar::before, .topbar::after {
		display: block;
		content: "";
		width: 0;
		height: 0;
		clear: both;
	}
	.topbar-left {
		float: left;
		height: 26px;
	}
	.topbar-left .name {
		vertical-align: top;
	}
	.topbar-left .proving {
		font-size: 14px;
	}
	.topbar-left .proving > a {
		color: #333;
		text-decoration: none;
		transition: color .4s;
	}
	.topbar-left .pass {
		display: inline-block;
		width: 52px;
		height: 20px;
		padding: 3px 0;
		background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAUCAYAAAAgCAWkAAADoElEQVRYhc3Xe2iXVRgH8M9vLjVaN8vIrPZHEl0oKqpVEFRSWBG1oD9KDYSIBQW1optF0o36Iyoq+kNMulgUNEpmtKCsyNhK7K6oBWI3qGVuc+wmrT+e8+rZ2+9nG2TzCy/veZ/3nOc83/NczjmV5s4+VbASl6K+JB/APXi62qDJQFtTw652pQqZl7Dw33RgGHX/qWUTx1Rsw6q2poa2gszhuAz3Yw7+St9dwjujqOAmPDgJRo8HrZXmzr7VOAfTk/Bz4ZmNNQYtwpM4eO/bNyH01uECQWQNFuBstYnAchwrPLR5Lxs4EUzNE/xikeDjQS8ewAa8lsnfxo8ilgtURKieL0L4G1FgFmd9Hk//z0vfHdiEW/Acfk86ZuA3EfbX4oRMx0hOZgZ+HgeRDvyEG5LSHEP4Ff2ZrA6f4V28jmPwCrZgaeqzBo0ZmeMwP+k7Kr034GHcjmlikXKM5mSmjIPIW7gktVtKRsOpuKbKRFuEJ+EQfCsqokyW5+CcNGatSAOCUA8eqWVcTiZf5VNEOORox+UYFCExgsNKfZagG3el/8Ucq5PBQ4LsTCzLxm0S3i7wGH4QnvtYRMOdicxWHJj0jVm0OhGDhOskBV/j5qxfRyIyIArE2iSfWSLTKOr+p/goPZ9gHXakOe5GJ/INrivNWWCh8N5WUZy24SCRjzfiXrHPjUG98MBcESLfZ5M8g504V4RWfyKyPht/ZknfH7get5YnErkEJwrPjyYjN+KkUt/ZaEr2bRchuENU0eU4wNgig/DMh6m9IL1bcUdqP5+M68EZJSL1mFfF6J1VZEQFvA8NwsNzxeovxbM4FI9m/QdxpfDybJHT0zBLeKmcl+rwcmo344jUfsLu1R3E6SKuc7T458bZhy9FvgylZzg9i0UUTBGluUXkxXe4UGzGD+G9pKsdp+EsfIU/RV51p3mKnNyF4jjzJq7GOyI3CsxLE5Y3x/1FrjWU5F3JyGJvqYijUXEcegNHizI7gKtE/jSm8S8mQuuS0SOiCvakPptxfBo7X+yNBXoLMrPwSxK2iuPKnvCBWM1aWC88UElERo3d4OCLNO+RJXm/yIf9xEIMicXrEZHQk/RNt/sINoYMXIcVqX0bnqph6EpcsQcik4XB/Aj/qvAK4ZkVYrcucJGI+X2RCAxXu88swgvZ9zJRGPZVEgVaq5EhjhNLRJIV2I73RVJO9qWswFRR5drzy1ktnCwqTre4gY73VP2/Ib82/w18YvCOtG3E0QAAAABJRU5ErkJggg==") no-repeat center center;
	}
	.topbar-right {
		float: right;
		height: 26px;
		line-height: 26px;
		font-size: 0;
	}
	.topbar-right span {
		transition: color .4s;
		font-size: 16px;
		cursor: pointer;
	}
	.topbar-right .import, .topbar-right .build {
		margin-right: 52px;
	}
	.topbar-right span:hover, .topbar-left .proving > a:hover {
		color: #3a99f2;
	}
	.topbar-right .icon {
		margin-left: 4px;
		font-size: 14px;
	}
</style>
