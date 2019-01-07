<template>
	<div class="safeTrain self">
	  <el-row class="tree-container" style="position: relative;">
	    <el-col :span="4" class="left-bar">
	      <el-select class="left-bar-select" v-model="selectValue" placeholder="进行中的项目" @change="projectToggle">
	        <el-option label="进行中的项目" value="1"></el-option>
	        <el-option label="已结束的项目" value="2"></el-option>
	      </el-select>
	      <el-tree :data="leftbarData" style="padding-bottom: 130px;" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
	    </el-col>
      <el-col :span="4" class="left-bar" style="position: absolute; bottom: 0; left: 0; padding-bottom: 0;">
        <div class="safeTrain-btns">
          <el-dialog style="text-align: left;" title="匹配培训课程" size="tiny" :visible.sync="chooseTrainClass.status">
            <div style=" position: relative;">
              <transition name="fade">
                <el-row style="position: absolute; top: 0; right: 0; z-index: 50; width: 70%; height: 100%; background-color: #fff; border-left: 1px solid #dedede;" v-show="chooseTrainClass.chooseWorker">
                  <el-col :span="8" style="height: 100%;">
                    <div style="width: 100%; height: 100%; background-color: #f4fbfe; cursor: pointer;">
                      <div style="padding: 20px 0; text-align: center;" v-for="item in chooseTrainClass.teamList" :key="item" @click="selectTeamId(item.teamId)">{{ item.name }}</div>
                    </div>
                  </el-col>
                  <el-col :span="16">
                    <el-table :data="chooseTrainClass.memberList" @selection-change="handleSelectionChange">
                      <el-table-column type="selection" width="40"> </el-table-column>
                      <el-table-column label="姓名" prop="memberName"></el-table-column>
                    </el-table>
                    <div style="padding: 36px 0 24px; text-align: center;">
                      <el-button @click="quitChooseWorker">取消</el-button>
                      <el-button type="primary" @click="saveChooseWorker">确定</el-button>
                    </div>
                    <el-pagination style="padding: 0; text-align: center;" small layout="prev, pager, next" :total="chooseTrainClass.pageSum" @current-change="currentChange"></el-pagination>
                  </el-col>
                </el-row>
              </transition>
              <el-form style="padding: 30px;" id="safeCourseForm" method="POST" enctype="multipart/form-data">
                <el-form-item label="项目" label-width="100px">
                  <el-select v-model="chooseTrainClass.projectId" @change="selectProjectId">
                    <el-option v-for="item in chooseTrainClass.projectList" :key="item" :value="item.teamId" :label="item.name"></el-option>
                  </el-select>
                  <input type="hidden" name="projectId" :value="chooseTrainClass.projectId" />
                  <input type="hidden" name="teamId" :value="chooseTrainClass.teamId" />
                   <input type="hidden" name="couseId" :value="chooseTrainClass.classId" /> 
                  <input type="hidden" name="ids" :value="chooseTrainClass.member" />
                </el-form-item>
                <el-form-item label="培训课程" label-width="100px">
                  <el-select v-model="chooseTrainClass.classId">
                    <el-option v-for="item in chooseTrainClass.classList" :key="item" :value="item.id" :label="item.name"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="工人" label-width="100px">
                  <el-button type="primary" @click="chooseWorker">请选择工人</el-button>
                  <div style="margin-top: 12px; padding: 6px; border: 1px solid #e1e6e7; border-radius: 6px;" v-show="chooseTrainClass.candiDate.length > 0">
                    <el-tag style="margin: 0 4px;" v-for="item in chooseTrainClass.candiDate" :key="item" type="primary">{{ item.memberName }}</el-tag>
                  </div>
                </el-form-item>
                <el-form-item label="培训时间" label-width="100px">
                  <el-date-picker name="eduTime" v-model="chooseTrainClass.timer" type="month" placeholder="请选择培训时间"> </el-date-picker>
                </el-form-item>
                <el-form-item name="state" label="培训状态" label-width="100px">
                  <el-radio-group v-model="chooseTrainClass.done">
                    <el-radio label="0">未培训</el-radio>
                    <el-radio label="1">已培训</el-radio>
                  </el-radio-group>
                </el-form-item>
                 <el-form-item label="上传现场照片" label-width="100px">
                  <el-upload :action="fileUrl" name="eduPhoto" list-type="picture-card" :with-credentials="true" :auto-upload="false" :on-remove="handleRemove">
                    <i class="el-icon-plus"></i>
                  </el-upload>
                </el-form-item> 
                <el-form-item label="" label-width="100px">
                  <el-button type="primary" @click="saveChooseTrainClass">保存</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-dialog>
          <el-button type="primary" @click="chooseTrainClass.status = true" style="margin-bottom: 10px;">匹配培训课程</el-button>
          <el-dialog style="text-align: left;" title="课程管理" size="tiny" :visible.sync="manageTrainClass.status">
            <div style="position: relative;">
              <div style="position: absolute; top: 0; left: 0; z-index: 50; width: 100%; background-color: #fff; border-bottom: 1px solid #dedede;" v-show="manageTrainClass.addClassForm.status">
                <el-form style="padding: 30px;" enctype="multipart/form-data" methods="post">
                  <el-form-item label="培训课程" label-width="80px">
                    <el-input type="text" v-model="manageTrainClass.addClassForm.name" placeholder="请输入培训课程名称"></el-input>
                  </el-form-item>
                  <el-form-item label="培训机构" label-width="80px">
                    <el-input type="text" v-model="manageTrainClass.addClassForm.train" placeholder="请输入培训机构"></el-input>
                  </el-form-item>
                  <el-form-item label="培训内容" label-width="80px">
                    <el-input type="text" v-model="manageTrainClass.addClassForm.content" placeholder="请输入培训内容"></el-input>
                  </el-form-item>
                  <el-form-item label="培训老师" label-width="80px">
                    <el-input type="text" v-model="manageTrainClass.addClassForm.teacher" placeholder="请输入培训老师"></el-input>
                  </el-form-item>
                  <el-form-item label="培训课时" label-width="80px">
                    <el-input type="text" v-model="manageTrainClass.addClassForm.period" placeholder="请输入培训课时"></el-input>
                  </el-form-item>
                  <el-form-item label="培训地址" label-width="80px">
                    <el-input type="text" v-model="manageTrainClass.addClassForm.address" placeholder="请输入培训地址"></el-input>
                  </el-form-item>
                  <el-form-item label-width="10px">
                    <el-button type="primary" @click="saveManageTrainClass">确认添加</el-button>
                    <el-button @click="manageTrainClass.addClassForm.status = false">取消</el-button>
                  </el-form-item>
                </el-form>
              </div>
              <div style="position: relative;padding-bottom:90px;" v-if="manageTrainClass.classList.length > 0">
                <div style="padding: 10px 0; text-align: center;">
                  <span>培训课程</span>
                  <el-input style="width: 30%;" type="text" v-model="searchCourse" placeholder="请输入课程名称"></el-input>
                  <el-button type="primary" @click="findCourseByLimit">搜索</el-button>
                </div>
                <el-collapse v-model="manageTrainClass.activeName" accordion>
                  <el-collapse-item v-for="(item, index) in manageTrainClass.classList" :key="item" :name="index">
                    <template slot="title">
                      <div style="display: inline-block; position: relative; padding: 1px 0 0; width: calc( 100% - 21px ); height: 43px;">{{ item.name }} <el-button type="text" style="position: absolute; top: 9px; right: 15px; margin: 0;" size="small" @click.stop="delCourseOne(item.id)">删除</el-button></div>
                    </template>
                    <div>
                      <div style="float: left; width: 50%;">培训机构：{{ item.train }}</div>
                      <div style="float: left; width: 50%;">培训老师：{{ item.teacher }}</div>
                    </div>
                    <div>
                      <div style="float: left; width: 50%;">培训课程：{{ item.name }}</div>
                      <div style="float: left; width: 50%;">培训课时：{{ item.period }}</div>
                    </div>
                    <div>
                      <div style="float: left; width: 50%;">培训内容：{{ item.content }}</div>
                      <div style="float: left; width: 50%;">培训地址：{{ item.address }}</div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
                <div style="position: absolute;left: 0; bottom: 0; width: calc( 100% - 20px ); padding: 20px 10px;">
                  <el-button type="primary" @click="manageTrainClass.addClassForm.status = true">添加课程</el-button>
                  <!-- 字段缺少页面码数 -->
                   <el-pagination style="float: right; padding-top: 10px;" small @current-change="CurrentChange" layout="prev, pager, next" :page-size="selectsafeTrain.pageNum" :total="selectsafeTrain.pageSum"></el-pagination> 
                </div>
              </div>
              <div v-else style="padding: 30px;">
                <div style="width: 100%;">
                  <div style="padding: 150px 0; text-align: center;">
                    <div style="line-height: 32px;">暂无课程，请添加课程</div>
                    <el-button type="primary" @click="manageTrainClass.addClassForm.status = true">添加课程</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-dialog>
          <el-button type="primary" @click="manageTrainClass.status = true">课程管理</el-button>
        </div>
      </el-col>
	    <el-col :span="20" class="right-bar">
	      <div class="right-bar-top">
	        <span class="safeTrain-title">培训课程</span>
          <el-select class="safeTrain-select" v-model="selectsafeTrain.listName" placeholder="请选择培训课程">
            <el-option v-for="item in selectsafeTrain.list" :key="item" :value="item.id" :label="item.name"></el-option>
          </el-select>
	        <span class="safeTrain-title">姓名</span>
	        <el-input class="safeTrain-input" v-model="selectsafeTrain.name" placeholder="请输入姓名"></el-input>
          <!-- <span class="safeTrain-title">培训状态</span>
	        <el-select class="safeTrain-select" v-model="selectsafeTrain.status" placeholder="请选择">
	          <el-option value="0" label="未培训"></el-option>
	           <el-option value="1" label="已培训"></el-option>
	        </el-select> -->
	        <span class="safeTrain-title">身份证号码</span>
	        <el-input class="safeTrain-input" v-model="selectsafeTrain.cardno" placeholder="请输入身份证号码"></el-input>
	        <el-button type="primary" :disabled="!pageIdx" @click="findByLimit">搜索</el-button>
	      </div>
	      <el-table :data="tableData3" style="width: 100%">
          <el-table-column align="left" prop="idx" label="序号" width="70"></el-table-column>
          <el-table-column align="left" prop="nickName" label="姓名" width="80"></el-table-column>
          <el-table-column align="left" prop="cardno" label="身份证号" width="180"></el-table-column>
          <el-table-column align="left" :show-overflow-tooltip="true" prop="trainOutfit" label="培训机构"></el-table-column>
          <el-table-column align="left" :show-overflow-tooltip="true" prop="trainCourse" label="课程"></el-table-column>
          <el-table-column align="left" prop="period" label="课时" width="70"></el-table-column>
          <el-table-column align="left" :show-overflow-tooltip="true" prop="trainContent" label="培训内容"></el-table-column>
          <el-table-column align="left" :show-overflow-tooltip="true" prop="trainAddress" label="培训地址"></el-table-column>
          <el-table-column align="left" :show-overflow-tooltip="true" prop="trainTime" label="培训时间"></el-table-column>
          <el-table-column align="left" prop="trainStatus" label="培训状态"></el-table-column>
          <el-table-column align="left" label="操作" width="180">
            <template scope="scope">
              <el-popover ref="deletePayroll" placement="top-start" width="200" trigger="click">
                <p style="line-height: 36px;">该操作将不可恢复，是否删除？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="visible2 = false">取消</el-button>
                  <el-button type="primary" size="mini" @click="delOneTrainInfo(scope.row)">确定</el-button>
                </div>
              </el-popover>
              <el-button type="text" size="small" @click="handleLook(scope.$index, scope.row)">查看</el-button>
              <!-- <el-button type="text" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button> -->
              <el-button type="text" size="small" v-popover:deletePayroll @click="handleDelete(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination layout="prev, pager, next" v-show="pageIdx!==null" @current-change="handleCurrentChange" :page-size="pageNum" :total="pageSum"></el-pagination>
	    </el-col>
	    <el-dialog title="编辑" size="tiny" :visible.sync="editsafeTrain">
        <el-form class="safeTrain-form" id="safeTrainForm" method="POST" enctype="multipart/form-data">
          <el-form-item label="姓名" label-width="100px">
            {{ dialogsafeTrain.name }}
            <input type="hidden" name="id" :value="dialogsafeTrain.eduId" />
            <input type="hidden" name="projectId" :value="dialogsafeTrain.projectId" />
            <input type="hidden" name="memberId" :value="dialogsafeTrain.memberId" />
            <input type="hidden" name="teamId" :value="dialogsafeTrain.teamId" />
          </el-form-item>
          <el-form-item label="培训课程" label-width="100px">
            <el-select name="couseId" v-model="dialogsafeTrain.course" placeholder="请选择培训课程" @change="lessonChange">
            	<el-option v-for="item in lesson" :key="item" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </el-form-item>
           <el-form-item label="培训课时" label-width="100px" v-show="dialogsafeTrain.course">
          	{{ lessonOne.classtime ? lessonOne.classtime : dialogsafeTrain.period }} 小时
          </el-form-item>
          <el-form-item label="培训内容" label-width="100px" v-show="dialogsafeTrain.course">
          	{{ lessonOne.content ? lessonOne.content : dialogsafeTrain.content }}
          </el-form-item>
          <el-form-item label="培训地址" label-width="100px" v-show="dialogsafeTrain.course">
          	{{ lessonOne.address ? lessonOne.address: dialogsafeTrain.address }}
          </el-form-item> 
          <el-form-item label="培训时间" label-width="100px">
            <el-date-picker name="eduTime" v-model="dialogsafeTrain.time" type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="培训状态" label-width="100px">
            <el-radio-group name="state" v-model="dialogsafeTrain.status">
              <el-radio label="0">未培训</el-radio>
              <el-radio label="1">已培训</el-radio>
            </el-radio-group>
          </el-form-item>
           <el-form-item label="上传现场图片" label-width="100px">
            <el-upload name="eduPhoto" :action="fileUrl" list-type="picture-card" :file-list="dialogsafeTrain.fileList" :auto-upload="false" :on-preview="handlePictureCardPreview" :on-remove="handleRemove">
  						<i class="el-icon-plus"></i>
						</el-upload>
           </el-form-item> 
          <el-form-item label-width="100px">
            <el-button type="primary" @click="saveTrainInfo">保存</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <el-dialog title="查看" size="tiny" :visible.sync="looksafeTrain">
        <el-form class="safeTrain-form">
          <el-form-item label="姓名" label-width="100px">
            {{ looksafeTrains.name }}
          </el-form-item>
          <el-form-item label="身份证号码" label-width="100px">
            {{ looksafeTrains.cardno }}
          </el-form-item>
          <el-form-item label="培训机构" label-width="100px">
            {{ looksafeTrains.outfit }}
          </el-form-item>
          <el-form-item label="课程" label-width="100px">
            {{ looksafeTrains.course }}
          </el-form-item>
          <el-form-item label="培训老师" label-width="100px">
            {{ looksafeTrains.teacher }}
          </el-form-item>
          <el-form-item label="课时" label-width="100px">
            {{ looksafeTrains.period }}
          </el-form-item>
          <el-form-item label="培训内容" label-width="100px">
            {{ looksafeTrains.content  }}
          </el-form-item>
          <el-form-item label="培训地址" label-width="100px">
            {{ looksafeTrains.address  }}
          </el-form-item>
          <el-form-item label="培训时间" label-width="100px">
            {{ looksafeTrains.time }}
          </el-form-item>
          <el-form-item label="培训状态" label-width="100px">
            {{ looksafeTrains.status }}
          </el-form-item>
           <el-form-item label="现场照片" label-width="100px">
            <img :src="looksafeTrains.image">
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
      searchCourse: '',
      chooseTrainClass: {
        pageSize: 10,
        pageAt: 1,
        pageSum: 0,
        status: false,
        projectId: '',
        teamId: '',
        classId: '',
        timer: '',
        done: '',
        member: [],
        dialog: false,
        imgSrc: '',
        chooseWorker: false,
        projectList: [],
        teamList: [],
        classList: [],
        memberList: [],
        candiDate: []
      },
      // 课程管理
      manageTrainClass: {
        pageSize: 10,
        pageAt: 1,
        pageSum: 60,
        status: false,
        addClassForm: {
          status: false,
          name: '',
          train: '',
          content: '',
          teacher: '',
          period: '',
          address: ''
        },
        activeName: 0,
        classList: []
      },
			tableData3: null,
			visible2: false,
      pageSum: null,
      pageNum: null,
      pageIdx: null,
      leftbarData: [],
			editsafeTrain: false,
			looksafeTrain: false,
			dialogImageUrl: '',
      dialogVisible: false,
			selectMonth: '',
			selectValue: '',
			selectsafeTrain: {
				name: '',
				cardno: '',
        status: '',
        list: [],
        listName: ''
			},
			dialogsafeTrain: {
        projectId: '',
        teamId: '',
        eduId: '',
        memberId: '',
        name: '',
        cardno: '',
        time: '',
        outfit: '',
        course: '',
        period: '',
        content: '',
        address: '',
        status: 1,
        fileList: []
      },
      looksafeTrains: {
        name: '',
        cardno: '',
        time: '',
        outfit: '',
        course: '',
        period: '',
        content: '',
        address: '',
        status: 1
      },
			leftbarData: [],
			defaultProps: {
        children: 'nodes',
        label: 'text'
      },
      lesson : {
        id : '',
        name: '',
        content: '',
        classtime: '',
        address: '',
      },
      lessonOne: {
        content: '',
        classtime: '',
        address: '',
      }
		}
	},
	created() {
    this.fileUrl = api.saveCourseInfo;
    let self = this;
    let teamData = [];
    let jsonData = [];
    let listData = [];
    $.ajax({ url: api.projectTreeGet, type: 'GET', data: {state: 1},xhrFields: { withCredentials: true } }).done((res) => {
      self.leftbarData = res.data.list;
      for( let i = 0; i < res.data.list.length; i++ ) {
        let resData = {
          teamId: res.data.list[i].pid,
          name: res.data.list[i].text,
          children: []
        }
        for( let j = 0; j < res.data.list[i].nodes.length; j++ ) {
          let nodeData = {
            teamId: res.data.list[i].nodes[j].tid,
            name: res.data.list[i].nodes[j].text
          }
          resData.children.push(nodeData);
        }
        jsonData.push(resData);
      }
      self.chooseTrainClass.projectList = jsonData;
    });
    $.ajax({ url: api.getCourseList, type: 'GET', data: { pageNum: 1, pageSize: 6 }, xhrFields: { withCredentials: true } }).done((res) => {
      for( let i = 0; i < res.data.list.length; i++ ) {
        let resData = {
          id: res.data.list[i].id_,
          name: res.data.list[i].edu_coursename, 
          content: res.data.list[i].edu_content, 
          train: res.data.list[i].edu_organization, 
          teacher: res.data.list[i].edu_teacher,
          period: res.data.list[i].edu_classhour, 
          address: res.data.list[i].edu_addr
        }
        listData.push(resData);
      }
      self.manageTrainClass.classList = listData;
      self.chooseTrainClass.classList = listData;
      self.selectsafeTrain.list = listData;
      self.selectsafeTrain.pageSum = res.data.total;
      self.selectsafeTrain.pageNum = res.data.pageSize;
    })
    $.ajax({ url: api.getTrainId, type: 'GET', xhrFields: { withCredentials: true } }).done((respond) => {
      self.pageIdx = respond.data;
      $.ajax({ url: api.getTrainList, type: 'GET', data: { teamId: respond.data, pageNum: 1, pageSize: 20 },xhrFields: { withCredentials: true } }).done((res) => {
        if( res.data.list == undefined) return self.$message({ type: 'error', message: '页面出错' });
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            idx: i + 1,
            id: res.data.list[i].id_,
            teamId: res.data.list[i].team_id,
            eduId: res.data.list[i].edu_id,
            memberId: res.data.list[i].member_id,
            nickName: res.data.list[i].member_name,
            cardno: res.data.list[i].member_card,
            trainTime: res.data.list[i].edu_time,
            trainOutfit: res.data.list[i].edu_organization,
            trainCourse: res.data.list[i].edu_coursename,
            period: res.data.list[i].edu_classhour,
            trainContent: res.data.list[i].edu_content,
            trainAddress: res.data.list[i].edu_addr,
            trainStatus: res.data.list[i].state ? res.data.list[i].state = '已培训' : res.data.list[i].state = '未培训',
            trainImages: res.data.list[i].edu_photo,
            trainTeacher: res.data.list[i].edu_teacher
          }
          teamData.push(resData);
        }
        self.tableData3 = teamData;
        self.pageSum = res.data.total;
        self.pageNum = res.data.pageSize;
      })
    })
	},
	methods: {
    CurrentChange(v) {
      let self = this;
      let listData = [];
      $.ajax({ url: api.getCourseList, type: 'GET', data: { pageNum: v, pageSize: 6 }, xhrFields: { withCredentials: true } }).done((res) => {
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            id: res.data.list[i].id_,
            name: res.data.list[i].edu_coursename, 
            content: res.data.list[i].edu_content, 
            train: res.data.list[i].edu_organization, 
            teacher: res.data.list[i].edu_teacher,
            period: res.data.list[i].edu_classhour, 
            address: res.data.list[i].edu_addr
          }
          listData.push(resData);
        }
        self.manageTrainClass.classList = listData;
        self.chooseTrainClass.classList = listData;
        self.selectsafeTrain.list = listData;
        self.selectsafeTrain.pageSum = res.data.total;
        self.selectsafeTrain.pageNum = res.data.pageSize;
      })
    },
    selectTeamId(v) {
      let self = this;
      this.chooseTrainClass.teamId = v;
      let jsonData = [];
      $.ajax({ url: api.getPayrollList, type: 'POST', data: { teamId: v, pageNum: 1, pageSize: 6 },xhrFields: { withCredentials: true } }).done((res) => {
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            memberId: res.data.list[i].id,
            memberName: res.data.list[i].memberName
          }
          jsonData.push(resData);
        }
        self.chooseTrainClass.memberList = jsonData;
        self.chooseTrainClass.pageSum = res.data.total;
      })
    },
    selectProjectId(v) {
      let self = this;
      let data = this.chooseTrainClass.projectList;
      for( let i = 0; i < data.length; i++ ) {
        if( v == data.list[i].teamId ) {
          self.chooseTrainClass.teamList = data.list[i].children;
        } 
      }
    },
    findByLimit() {
      let self = this;
      let id = this.pageIdx;
      let { name, cardno, status, listName } = this.selectsafeTrain;
      let respondData = { teamId: id, pageNum : 1, pageSize: 20 };
      let jsonData = [];
      if(name) respondData['memberName'] = name;
      if(cardno) respondData['memberCard'] = cardno;
      if(listName) respondData['eduId'] = listName;
      $.ajax({ url: api.getTrainList, type: 'GET', data: respondData, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.data.list == undefined) return self.$message({ type: 'error', message: '页面出错' });
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            idx: i + 1,
            id: res.data.list[i].id_,
            teamId: res.data.list[i].team_id,
            eduId: res.data.list[i].edu_id,
            memberId: res.data.list[i].member_id,
            nickName: res.data.list[i].member_name,
            cardno: res.data.list[i].member_card,
            trainTime: res.data.list[i].edu_time,
            trainOutfit: res.data.list[i].edu_organization,
            trainCourse: res.data.list[i].edu_coursename,
            period: res.data.list[i].edu_classhour,
            trainContent: res.data.list[i].edu_content,
            trainAddress: res.data.list[i].edu_addr,
            trainStatus: res.data.list[i].state ? res.data.list[i].state = '已培训' : res.data.list[i].state = '未培训',
            trainImages: res.data.list[i].edu_photo,
            trainTeacher: res.data.list[i].edu_teacher
          }
          jsonData.push(resData);
        }
        self.tableData3 = jsonData;
        self.pageSum = res.data.total;
        self.pageNum = res.data.pageSize;
      })
    },
    delOneTrainInfo(v) {
      let self = this;
      $.ajax({ url: api.delCourseOne, type: 'POST', data: { id: v.id }, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 0 ) {
          self.$message({ showClose: true, message: '删除成功', type: 'success' });
          setTimeout(() => { location.reload() }, 1000);
        } else {
          self.$message({ showClose: true, message: '删除失败', type: 'error' });
        }
      })
    },
    delCourseOne(v) {
      let self = this;
      $.ajax({ url: api.delCourseInfo, type: 'POST', data: { id: v }, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 0 ) {
          self.$message({ showClose: true, message: '删除成功', type: 'success' });
          setTimeout(() => { location.reload() }, 1000);
        } else {
          self.$message({ showClose: true, message: res.errMsg, type: 'error' });
        }
      })
    },
    findCourseByLimit() {
      let self = this;
      let value = this.searchCourse;
      let listData = [];
      // if(!value) return;
      $.ajax({ url: api.findCourseByLimit, type: 'GET', data: { coursename: value }, xhrFields: { withCredentials: true } }).done((res) => {
        for( let i = 0; i < res.data.list.length; i++ ) {
        let resData = {
          id: res.data.list[i].id_,
          name: res.data.list[i].edu_coursename, 
          content: res.data.list[i].edu_content, 
          train: res.data.list[i].edu_organization, 
          teacher: res.data.list[i].edu_teacher,
          period: res.data.list[i].edu_classhour, 
          address: res.data.list[i].edu_addr
        }
        listData.push(resData);
      }
      self.manageTrainClass.classList = listData;
      })
    },
    lessonChange(val) {
      let self = this;
      let lesson = this.lesson;
      for( let i = 0; i < lesson.length; i++ ) {
        if( lesson[i].id == val ) {
          let valData = {
            content: lesson[i].content,
            classtime: lesson[i].classtime,
            address: lesson[i].address,
          }
          self.lessonOne = valData;
        }
      }
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handlePictureCardPreview(file) {
       this.chooseTrainClass.imgSrc = file.url;
       this.chooseTrainClass.dialog = true;
    },
    saveChooseTrainClass() {
      console.log(this.chooseTrainClass)
      let formData = new FormData($('#safeCourseForm')[0]);
      $.ajax({ url: api.batchCourse, type: 'POST', data: formData, processData: false, contentType: false , traditional: true, xhrFields: { withCredentials: true } }).done((res) => {
        console.log(res)
      })
    },
    handleSelectionChange(val) {
      this.chooseTrainClass.candiDate = val;
    },
    saveChooseWorker() {
      let self = this;
      let candiDate = this.chooseTrainClass.candiDate;
      let listData = [];
      for( let i = 0; i < candiDate.length; i++ ) {
        listData.push(candiDate[i].memberId);
      }
      if(self.chooseTrainClass.member.length == 0) {
        self.chooseTrainClass.member.push(listData);
      } else {
        self.chooseTrainClass.member.concat(listData);
      }
      
      console.log(this.chooseTrainClass.member)
      this.chooseTrainClass.chooseWorker = !this.chooseTrainClass.chooseWorker;
    },
    saveManageTrainClass() {
      let self = this;
      let { projectId } = this.chooseTrainClass;
      let { name, train, content, teacher, period, address } = this.manageTrainClass.addClassForm;
      let formData = {
        projectId: projectId,
        eduTeacher: teacher,
        eduCoursename: name,
        eduClasshour: period,
        eduContent: content,
        eduAddr: address,
        eduOrganization: train
      };
      $.ajax({ url: api.addCourseInfo, type: 'POST', data: formData, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 0 ) {
          self.$message({ showClose: true, message: '新增成功', type: 'success' });
          setTimeout(() => { location.reload() }, 1000);
        } else {
          self.$message({ showClose: true, message: '删除失败', type: 'error' });
        }
      })
      // this.manageTrainClass.addClassForm.status = false;
    },
    quitChooseWorker() {
      this.chooseTrainClass.candiDate = [];
      this.chooseTrainClass.chooseWorker = !this.chooseTrainClass.chooseWorker;
    },
    chooseWorker() {
      let projectId = this.chooseTrainClass.projectId;
      if(!projectId) return;
      // 请求项目下的考勤组
      // $.ajax({ url: ..., type: 'GET', data: { teamId: '', pagesize: '', pageat: val } }).done((res) => {
      //   console.log(res)
      // })
      this.chooseTrainClass.chooseWorker = !this.chooseTrainClass.chooseWorker;
    },
    currentChange(val) {
      let self = this;
      let v = this.chooseTrainClass.teamId;
      let jsonData = [];
      $.ajax({ url: api.getPayrollList, type: 'POST', data: { teamId: v, pageNum: val, pageSize: 6 },xhrFields: { withCredentials: true } }).done((res) => {
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            memberId: res.data.list[i].id,
            memberName: res.data.list[i].memberName
          }
          jsonData.push(resData);
        }
        self.chooseTrainClass.memberList = jsonData;
        self.chooseTrainClass.pageSum = res.data.total;
      })
    },
    saveTrainInfo() {
      let self = this;
      let formData = new FormData($('#safeTrainForm')[0]);
      $.ajax({ url: api.saveCourseInfo, type: 'POST', data: formData, processData: false, contentType: false ,xhrFields: { withCredentials: true } }).done((res) => {
        console.log(res)
      })
    },
    handleCurrentChange(val) {
      let self = this;
      let idx = this.pageIdx;
      if( !idx ) return;
      let jsonData = [];
      $.ajax({ url: api.getTrainList, type: 'GET', data: { teamId: idx, pageNum: val, pageSize: 20 },xhrFields: { withCredentials: true } }).done((res) => {
        if( res.data.list == undefined) return self.$message({ type: 'error', message: '页面出错' });
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            idx: i + 1,
            id: res.data.list[i].id_,
            teamId: res.data.list[i].team_id,
            eduId: res.data.list[i].edu_id,
            memberId: res.data.list[i].member_id,
            nickName: res.data.list[i].member_name,
            cardno: res.data.list[i].member_card,
            trainTime: res.data.list[i].edu_time,
            trainOutfit: res.data.list[i].edu_organization,
            trainCourse: res.data.list[i].edu_coursename,
            period: res.data.list[i].edu_classhour,
            trainContent: res.data.list[i].edu_content,
            trainAddress: res.data.list[i].edu_addr,
            trainStatus: res.data.list[i].state ? res.data.list[i].state = '已培训' : res.data.list[i].state = '未培训',
            trainImages: res.data.list[i].edu_photo,
            trainTeacher: res.data.list[i].edu_teacher
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
    handlePictureCardPreview(file) {
       this.dialogImageUrl = file.url;
       this.dialogVisible = true;
    },
		handleLook(index, row) {
			let data = {
        name: row.nickName,
        cardno: row.cardno,
        time: row.trainTime,
        teacher: row.trainTeacher,
        image: row.trainImages,
        outfit: row.trainOutfit,
        course: row.trainCourse,
        period: row.period,
        content: row.trainContent,
        address: row.trainAddress,
        status: row.trainStatus
      }
      this.looksafeTrains = data;
			this.looksafeTrain = !this.looksafeTrain;
		},
		handleEdit(index, row) {
      let self = this;
      let data = {
        projectId: row.projectId,
        teamId: row.teamId,
        eduId: row.eduId,
        memberId: row.memberId,
        name: row.nickName,
        cardno: row.cardno,
        time: row.trainTime,
        outfit: row.trainOutfit,
        course: row.trainCourse,
        period: row.period,
        content: row.trainContent,
        address: row.trainAddress,
        status: row.trainStatus
      }
      let jsonData = [];
      $.ajax({ url: api.getCourseList, type: 'GET' ,xhrFields: { withCredentials: true }}).done((res) => {
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            id : res.data[i].id_,
            name: res.data[i].edu_coursename,
            content: res.data[i].edu_content,
            classtime: res.data[i].edu_classhour,
            address: res.data[i].edu_addr,
          }
          jsonData.push(resData)
        }
        self.lesson = jsonData;
      })
      this.dialogsafeTrain = data;
      this.editsafeTrain = !this.editsafeTrain;
    },
    handleDelete(index, row) {
      console.log(index, row);
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
      let idx = data.tid;
      self.pageIdx = idx;
      if( !idx ) return;
      let jsonData = [];
      $.ajax({ url: api.getTrainList, type: 'GET', data: { teamId: idx, pageNum: 1, pageSize: 20 },xhrFields: { withCredentials: true } }).done((res) => {
        if( res.data.list == undefined) return self.$message({ type: 'error', message: '页面出错' });
        for( let i = 0; i < res.data.list.length; i++ ) {
          let resData = {
            idx: i + 1,
            id: res.data.list[i].id_,
            teamId: res.data.list[i].team_id,
            eduId: res.data.list[i].edu_id,
            memberId: res.data.list[i].member_id,
            nickName: res.data.list[i].member_name,
            cardno: res.data.list[i].member_card,
            trainTime: res.data.list[i].edu_time,
            trainOutfit: res.data.list[i].edu_organization,
            trainCourse: res.data.list[i].edu_coursename,
            period: res.data.list[i].edu_classhour,
            trainContent: res.data.list[i].edu_content,
            trainAddress: res.data.list[i].edu_addr,
            trainStatus: res.data.list[i].state ? res.data.list[i].state = '已培训' : res.data.list[i].state = '未培训',
            trainImages: res.data.list[i].edu_photo,
            trainTeacher: res.data.list[i].edu_teacher
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
.safeTrain .left-bar {
  position: relative;
}
.safeTrain .safeTrain-btns {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 18px 0;
  text-align: center;
  border-top: 1px solid #e0e7ec;
}
.safeTrain-input, .safeTrain-select {
	width: 13%;
}
.safeTrain .el-button+.el-button {
  margin-left: 0;
}
.safeTrain .safeTrain-btns .el-button {
  margin: 0 5px;
}
.tree-container .right-bar-top {
  padding-bottom: 16px;
}
.safeTrain-title {
  padding: 0 10px;
  font-size: 14px;
  line-height: 36px;
}
.safeTrain-form {
  padding: 30px;
}
.safeTrain .el-pagination {
  padding: 30px 0 10px;
  text-align: right;
}
</style>