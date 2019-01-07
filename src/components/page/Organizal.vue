<template>
	<div class="organizal">
	  <el-row class="tree-container self" style="position: relative;">
	    <el-col :span="4" class="left-bar" style="padding-bottom: 0;">
	      <div class="organizal-title">
	      	{{ name }}
	      </div>
        <el-dialog title="修改" :visible.sync="isEditStatus" size="tiny" :before-close="handleClose">
          <el-form class="organizal-form" ref="editDepts" :model="editDepts" :rules="rules.editDepts">
            <el-form-item label="部门原名称" label-width="100px">
              {{ editDepts.name }}
            </el-form-item>
            <el-form-item prop="newName" label="部门新名称" label-width="100px">
              <el-input type="text" :maxlength="6" v-model="editDepts.newName" placeholder="请输入部门新名称"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="isEditStatus = false">取 消</el-button>
            <el-button type="primary" @click="saveDeptChange">确 定</el-button>
          </span>
        </el-dialog>
        <el-dialog title="增加部门" :visible.sync="addDeptStatus" size="tiny" :before-close="addHandleClose">
          <el-form class="organizal-form" ref="addDepts" :model="buildDept" :rules="rules.buildDept">
            <el-form-item label="选择部门" label-width="100px">
              <el-select v-model="buildDept.idx" placeholder="不选择默认创建一级部门">
                <el-option v-for="item in leftbarData" :key="item" :label="item.text" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="name" label="部门名称" label-width="100px">
              <el-input type="text" v-model="buildDept.name" placeholder="请输入部门名称"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDeptStatus = false">取 消</el-button>
            <el-button type="primary" @click="addDeptChange">确 定</el-button>
          </span>
        </el-dialog>
	      <el-tree :data="leftbarData" style="padding-bottom: 70px;" :props="defaultProps" @node-click="handleNodeClick" :render-content="renderContent"></el-tree>
	    </el-col>
      <el-col :span="4" class="left-bar" style="position: absolute; left: 0; bottom: 0; padding-bottom: 0;">
        <div class="leftbar-btn">
          <el-button type="primary" @click="addDeptStatus = true">创建部门</el-button>
        </div>
      </el-col>
	    <el-col :span="20" class="right-bar">
	      <div class="right-bar-top">
	        {{ childrenDept }}
	        <el-button type="primary" class="right-bar-btns" @click="addMember">新增成员</el-button>
	      </div>
	      <el-table :data="tableData3">
	      	<el-table-column prop="idx" label="序号"></el-table-column>
	      	<el-table-column prop="name" label="姓名"></el-table-column>
	      	<el-table-column prop="job" label="职位"></el-table-column>
	      	<el-table-column prop="mobile" :show-overflow-tooltip="true" label="手机号码"></el-table-column>
	      	<el-table-column prop="email" :show-overflow-tooltip="true" label="邮箱"></el-table-column>
	      	<el-table-column label="操作">
	      		<template scope="scope">
	              <el-button type="text" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                <el-popover ref="deleteOrganizal{{$index}}" v-model="scope.row.delDeptMemberStatus" placement="top-start" width="200" trigger="click">
                  <p style="line-height: 36px;">该操作将不可恢复，是否删除？</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="scope.row.delDeptMemberStatus = false">取消</el-button> 
                    <el-button type="primary" size="mini" @click="deleteDeptMember">确定</el-button>
                  </div>
                </el-popover>
	              <el-button type="text" size="small" v-popover:deleteOrganizal{{$index}} @click="handleDelete(scope.$index, scope.row)">删除</el-button>
	            </template>
	      	</el-table-column>
	      </el-table>
	       <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="pageSum"></el-pagination> 
	    </el-col>
      <el-dialog title="新增成员" size="tiny" :visible.sync="newOrganizal">
	        <el-form class="organizal-form">
            <el-form-item label="部门" label-width="100px">
	             <el-cascader expand-trigger="hover" :options="options" v-model="selectedOptions2" @change="handleChange"></el-cascader>
	          </el-form-item>
	          <el-form-item label="姓名" label-width="100px">
	            <el-input v-model="dialogAddDeptMember.name" placeholder="请输入姓名"></el-input>
	          </el-form-item>
	          <el-form-item :show-overflow-tooltip="true" label="职位" label-width="100px">
	            <el-input v-model="dialogAddDeptMember.job" placeholder="请输入职位"></el-input>
	          </el-form-item>
	          <el-form-item label="手机号码" label-width="100px">
	            <el-input v-model="dialogAddDeptMember.mobile" placeholder="请输入手机号码"></el-input>
	          </el-form-item>
	          <el-form-item :show-overflow-tooltip="true" label="邮箱" label-width="100px">
	            <el-input v-model="dialogAddDeptMember.email" placeholder="请输入邮箱"></el-input>
	          </el-form-item>
	          <el-form-item label-width="100px">
	            <el-button type="primary" @click="addDeptMember">保存</el-button>
	          </el-form-item>
	        </el-form>
	      </el-dialog>
	    <el-dialog title="编辑" size="tiny" :visible.sync="editOrganizal">
	        <el-form class="organizal-form">
            <el-form-item label="部门" label-width="100px">
	             {{ dialogOrganizal.dept }} 
	          </el-form-item>
	          <el-form-item label="姓名" label-width="100px">
	            <el-input v-model="dialogOrganizal.name" placeholder="请输入姓名"></el-input>
	          </el-form-item>
	          <el-form-item :show-overflow-tooltip="true" label="职位" label-width="100px">
	            <el-input v-model="dialogOrganizal.job" placeholder="请输入职位"></el-input>
	          </el-form-item>
	          <el-form-item label="手机号码" label-width="100px">
	            <el-input v-model="dialogOrganizal.mobile" placeholder="请输入手机号码"></el-input>
	          </el-form-item>
	          <el-form-item :show-overflow-tooltip="true" label="邮箱" label-width="100px">
	            <el-input v-model="dialogOrganizal.email" placeholder="请输入邮箱"></el-input>
	          </el-form-item>
	          <el-form-item label-width="100px">
	            <el-button type="primary" @click="saveDeptMember">保存</el-button>
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
    let checkDeptName = ( rule, value, callback ) => {
      if( value == this.editDepts.name ) return callback(new Error("部门名称未修改"));
      callback();
    };
    return {
      name: '',
      childrenDept: '部门管理',
      addDeptStatus: false,
      isEditStatus: false,
      tableData3: null,
      weekdayData: null,
      editOrganizal: false,
      newOrganizal: false,
      buildDept: {
        idx: '',
        name: ''
      },
      delDeptMemberStatus: false,
      delDeptMember: {
        idx: ''
      },
      pageSum: 0,
      selectValue: '',
      leftbarData: [],
      editDepts: {
        idx: '',
        name: '',
        newName: ''
      },
      rules: {
        editDepts: {
          newName: [
            { required: true, message: '请输入部门名称', trigger: 'blur' },
            { validator: checkDeptName, trigger: 'blur' }
          ]
        },
        buildDept: {
          name: [
            { required: true, message: '请输入部门名称', trigger: 'blur' }
          ]
        }
      },
      dialogAddDeptMember: {
        idx: '',
        name: '',
        job: '',
        mobile: '',
        email: ''
      },
      dialogOrganizal: {
        dept: '',
      	name: '',
        job: '',
        mobile: '',
        email: ''
      },
      defaultProps: {
        children: 'children',
        label: 'text'
      },
      options: [],
      selectedOptions2: [],
      teamId: ''
    }
  },
  beforeMount() {
    let self = this;
    // 获取项目考勤组树形结构
    $.ajax({ url: api.getOrganizalTree, type: 'GET', xhrFields: { withCredentials: true } }).done((res) => {
      self.leftbarData = res.data;
    })
		$.ajax({ url: api.getCompanyInfo, type: 'GET', data: { falg: 0 }, xhrFields: { withCredentials: true } }).done((res) => {
			self.name = res.data.at.name;
		})
  },
  methods: {
    addDeptMember() {
      let self = this;
      let idx = this.dialogAddDeptMember.idx;
      let name = this.dialogAddDeptMember.name;
      let job = this.dialogAddDeptMember.job;
      let mobile = this.dialogAddDeptMember.mobile;
      let email = this.dialogAddDeptMember.email;
      $.ajax({ url: api.addDeptMember, type: 'POST', data: { deptId: idx, name: name, job: job, phone: mobile, email: email }, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 1 ) {
            self.$message({ type: 'success', message: '增加成功!' });
            setTimeout(function() {
              location.reload();
            },1000);
          } else {
            self.$message({ type: 'error', message: '增加失败!' });
          }
      })
    },
    addMember() {
      let self = this;
      let data = [];
      $.ajax({ url: api.getOrganizalTree, type: 'GET', xhrFields: { withCredentials: true } }).done((res) => {
        for( let i = 0; i < res.data.length; i++ ) {
          if( res.data[i].children ) {
            let resData = {
              value: res.data[i].id,
              label: res.data[i].text,
              children: []
            }
            for( let j = 0; j < res.data[i].children.length; j++ ) {
              let children = {
                value: res.data[i].children[j].id,
                label: res.data[i].children[j].text
              }
              resData.children.push(children);
            }
            data.push(resData);
          } else {
            let resData = {
              value: res.data[i].id,
              label: res.data[i].text,
              disabled: true
            }
            data.push(resData);
          }
        }
        self.options = data;
      })
      this.newOrganizal = !this.newOrganizal;
    },
    handleChange(value) {
      this.dialogAddDeptMember.idx = value[1];
    },
    editDept(data) {
      let self = this;
      this.isEditStatus = !this.isEditStatus;
      let s = {
        idx: data.id,
        name: data.text,
        newName: ''
      }
      self.editDepts = s;
    },
    delDept(data) {
      let idx = data.id;
      let self = this;
      this.$confirm('此操作将不可恢复, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => { 
        $.ajax({ url: api.deleteDeptChange, type: 'POST', data: { id: idx }, xhrFields: { withCredentials: true } }).done((res) => {
          if( res.errCode == 1 ) {
            self.$message({ type: 'success', message: '删除成功!' });
            setTimeout(function() {
              location.reload();
            },1000);
          } else {
            self.$message({ type: 'error', message: '删除失败!' });
          }
        })
      });
    },
    saveDeptChange() {
      let self = this;
      let idx = this.editDepts.idx;
      let name = this.editDepts.newName;
      this.$refs.editDepts.validate((valid) => {
        if(valid) {
          console.log(idx,name)
          $.ajax({ url: api.saveDeptChange, type: 'POST', data: { id: idx, name: name }, xhrFields: { withCredentials: true } }).done((res) => {
            if( res.errCode == 1 ) {
              self.isEditStatus = !self.isEditStatus;
              self.$message({ showClose: true, message: '修改成功', type: 'success' });
              setTimeout(function() {
                location.reload();
              },1000);
            } else {
              self.$message({ showClose: true, message: '修改失败', type: 'error' });
            } 
          })
        } else {
          return false;
        }
      })
    },
    addDeptChange() {
      let self = this;
      let idx = this.buildDept.idx;
      let name = this.buildDept.name;
      let level;
      if(!idx) { level = 0 } else { level = 1 };
      this.$refs.addDepts.validate((valid) => {
        if(valid) {
          $.ajax({ url: api.addDeptChange, type: 'POST', data: { parent: idx, level: level, name: name }, xhrFields: { withCredentials: true } }).done((res) => {
            if( res.errCode == 1 ) {
              self.addDeptStatus = !self.addDeptStatus;
              self.$message({ showClose: true, message: '创建成功', type: 'success' });
              setTimeout(function() {
                location.reload();
              },1000);
            } else {
              self.$message({ showClose: true, message: '创建失败', type: 'error' });
            }
          })
        } else {
          return false;
        }
      })
    },
    handleClose() {
      this.isEditStatus = !this.isEditStatus;
    },
    addHandleClose() {
      this.addDeptStatus = !this.addDeptStatus;
    },
    renderContent(h, { node, data, store }) {
      return(
        <span class="organizal-input">
          <span>{node.label}</span>
          <span class="organizal-func">
            <span class="edit" on-click={ () => this.editDept(data) }>修改</span>
            <span on-click={ () => this.delDept(data) } >删除</span>
          </span>
        </span>
      )
    },
  	handleEdit(index, row) {
      let data = {
        dept: row.dept,
        deptId: row.deptId,
        id: row.id,
        job: row.job,
        name: row.name,
        mobile: row.mobile,
        email: row.email
      }
      this.dialogOrganizal = data;
      this.editOrganizal = !this.editOrganizal;
    },
    saveDeptMember() {
      let self = this;
      let dept = this.dialogOrganizal.deptId;
      let id = this.dialogOrganizal.id;
      let name = this.dialogOrganizal.name;
      let job = this.dialogOrganizal.job;
      let mobile = this.dialogOrganizal.mobile;
      let email = this.dialogOrganizal.email;
      $.ajax({ url: api.saveDeptMember, type: 'POST', data: { id: id, deptId: dept, name: name, job: job, phone: mobile, email: email },xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 1 ) {
          self.$message({ showClose: true, message: '修改成功', type: 'success' });
          self.editOrganizal = !self.editOrganizal;
        } else {
          self.$message({ showClose: true, message: '修改失败', type: 'error' });
        } 
      })
    },
    deleteDeptMember() {
      let self = this;
      let idx = this.delDeptMember.idx;
      $.ajax({ url: api.deleteDeptMember, type: 'POST', data: { id: idx }, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 1 ) {
          self.$message({ showClose: true, message: '删除成功', type: 'success' });
          setTimeout(function() {
            location.reload();
          },1000);
        } else {
          self.$message({ showClose: true, message: '删除失败', type: 'error' });
        }
      })
    },
    handleDelete(index, row) {
      this.delDeptMember.idx = row.id;
    },
    handleNodeClick(key) {
      this.childrenDept = key.text;
      this.teamId = key.id;
      let self = this;
      let data = [];
      $.ajax({ url: api.checkDeptMember, type: 'GET', data: { deptId: key.id, pageNum: 1, pageSize: 20 },xhrFields: { withCredentials: true } }).done((res) => {
        for( let i = 0; i < res.data.list.length; i++ ) {
          let listData = {
            idx: i+1,
            dept: key.text,
            deptId: res.data.list[i].deptId,
            id: res.data.list[i].id,
            job: res.data.list[i].job,
            name: res.data.list[i].name,
            mobile: res.data.list[i].phone,
            email: res.data.list[i].email
          }
          data.push(listData);
        }
        self.pageSum = res.data.total;
        self.tableData3 = data;
      })
    },
    handleCurrentChange(val) {
      let self = this;
      let data = [];
      let id = this.teamId;
      let text = this.childrenDept;
      $.ajax({ url: api.checkDeptMember, type: 'GET', data: { deptId: id, pageNum: val, pageSize: 20 },xhrFields: { withCredentials: true } }).done((res) => {
        for( let i = 0; i < res.data.list.length; i++ ) {
          let listData = {
            idx: i+1,
            dept: text,
            deptId: res.data.list[i].deptId,
            id: res.data.list[i].id,
            job: res.data.list[i].job,
            name: res.data.list[i].name,
            mobile: res.data.list[i].phone,
            email: res.data.list[i].email
          }
          data.push(listData);
        }
        self.pageSum = res.data.total;
        self.tableData3 = data;
      })
    }
  }
}
</script>
<style scoped>
.organizal .left-bar {
  position: relative;
  padding-bottom: 90px;
}
.organizal .leftbar-btn {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 16px 0;
  text-align: center;
  border-top: 1px solid #e1e8ed;
}
.organizal-title {
  padding: 28px 0;
	font-size: 14px;
	text-align: center;
	border-bottom: 1px solid #e1e8ed;
}
.tree-container .right-bar-top {
  position: relative;
  padding: 14px 0 30px;
}
.tree-container .right-bar-top .right-bar-btns {
  position: absolute;
  right: 0;
  top: 6px;
}  
.organizal-form {
	padding: 30px;
}
.organizal .el-pagination {
  padding: 30px 0 10px;
  text-align: right;
}
.organizal .icon {
  padding: 0 6px;
  font-size: 12px;
  color: #95a8bc;
  cursor: pointer;
}
.organizal-form {
  padding: 30px;
}
</style>

