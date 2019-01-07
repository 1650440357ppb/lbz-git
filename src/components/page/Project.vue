<template>
  <div class="project self">
      <el-row class="tree-container">
        <el-col :span="4" class="left-bar">
          <el-select class="left-bar-select" v-model="selectValue" placeholder="进行中的项目" @change="projectToggle">
            <el-option label="进行中的项目" value="1"></el-option>
            <el-option label="未开始的项目" value="0"></el-option>
          </el-select>
          <ul class="left-menu-list">
            <li v-for="item in leftMenuList" :key="item" @click="changeProjectPage(item.pid)">{{ item.text }}</li>
          </ul>
          <div class="left-menu-btns">
            <el-button type="primary" @click="buildProject">创建考勤项目组</el-button>
          </div>
        </el-col>
        <el-col :span="20" class="right-bar">
          <!-- 项目下的考勤组列表 -->
          <div v-show="rightMenuList.status">
            <div class="main-right-top">
              <!-- 设置 -->
              <el-dialog title="项目设置" :visible.sync="configProject" class="projectConfig">
                <el-form :model="rightBuilding.form">
                  <p style="padding: 20px 0 20px 50px;color:#53A0EA">项目信息</p>
                  <el-form-item prop="projectName" label="项目名称" :label-width="formLabelWidth" required >
                    <el-input v-model="dialog.name" auto-complete="off" placeholder="请输入项目名称(16字以内)" class="createProjectWidth"></el-input>
                  </el-form-item>
                  <el-form-item label="项目密码" :label-width="formLabelWidth">
                    <el-input v-model="dialog.attend_passwd" auto-complete="off" placeholder="请输入项目密码(6-20位)" class="createProjectWidth"></el-input>
                    <!-- <el-checkbox-group v-model="form.type">
                      <el-checkbox label="密码覆盖至考勤组" v-model="dialog.syn_state" name="type"></el-checkbox>
                      <p style="line-height:20px" >提示:密码覆盖后，本项目内的考勤组考勤密码将同步修改，与项目密码一致</p>
                    </el-checkbox-group> -->
                  </el-form-item>
                  <el-form-item label="修改地址" :label-width="formLabelWidth" required>
                    <el-button type="primary" @click="dialogForm1Visible = true">点击修改</el-button>
                  </el-form-item>
                  <el-form-item label="允许偏差范围" :label-width="formLabelWidth">
                    <el-select v-model="dialog.scope" placeholder="请选择" class="mwidth" v-if="!diy">
                      <el-option
                        v-for="item in optionsRange" :key="item" :label="item.label" :value="item.value">
                      </el-option>
                    </el-select>
                    <el-input type="text" v-model="dialog.scope" v-else style="width: 217px;" placeholder="请输入允许偏差范围">
                      <template slot="append">米</template>
                    </el-input>
                    <el-button type="text" v-show="!diy" @click="diy=!diy">自定义</el-button>
                    <el-button type="text" v-show="diy" @click="diy=!diy">系统预设</el-button>
                  </el-form-item>
                  <div class="shezhen-async" v-show="dialog.city_id == 291">
                    <p style="padding:0px 0 20px 50px;color:#53A0EA">同步项目</p>
                    <p class="sync_msg">提示：为了符合深圳市建筑行业实名制与分账制标准， 请链接点击链接 <a target="_Blank" href="http://ticwr.thit.com.cn/">深圳市建筑业实名制和分账制管理平台</a>进行项目注册。审核通过将会收短信，在上述系统中点击项目管理->项目修改->获取工程编号，设备管理里面获取授权账号、授权密钥、设备序号。</p>
                    <el-row>
                      <el-col :span="12" style="width:48%">
                        <el-form-item label="工程编号" label-width="100px">
                          <el-input type="text" v-model="dialog.third_project_id" placeholder="请输入工程编号"></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12" style="width:48%">
                        <el-form-item label="设备序号" label-width="100px">
                          <el-input type="text" v-model="dialog.client_serial" placeholder="请输入设备序号"></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="12" style="width:48%">
                        <el-form-item label="授权账号" label-width="100px">
                          <el-input type="text" v-model="dialog.api_key" placeholder="授权账号"></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12" style="width:48%">
                        <el-form-item label="授权秘钥" label-width="100px">
                          <el-input type="text" v-model="dialog.api_secret" placeholder="请输入授权秘钥"></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>
                </el-form>
                <div slot="footer" class="dialog-footer" id="centerBut">
                  <el-button type="primary" @click="saveConfigProject">保 存</el-button>
                  <el-button type="danger" @click="ednProjectAttend">结束考勤</el-button>
                </div>
              </el-dialog>
              <!-- 地图 -->
              <el-dialog :visible.sync="dialogForm1Visible" id="mapdilog">
                <el-form :model="form1" style="padding: 30px; margin-bottom: 10px;">
                  <el-form-item label="所在地址" label-width="100px">
                    <el-select v-model="dialog.province_id" @change="locate(),getProjectCity()">
                      <el-option v-for="item in projectArea.province" :key="item" :value="item.areaId" :label="item.areaName"></el-option>
                    </el-select>
                    <el-select v-model="dialog.city_id" @change="locate(),isShenzhen()">
                      <el-option v-for="item in projectArea.city" :key="item" :value="item.areaId" :label="item.areaName"></el-option>
                    </el-select>
                    <el-select v-model="dialog.area_id" @change="locate" class="createSelectWidth">
                      <el-option v-for="item in projectArea.area" :key="item" :value="item.areaId" :label="item.areaName"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="详细地址" label-width="100px">
                    <el-input v-model="dialog.address" auto-complete="off" @change="locate" placeholder="请输入详细地址"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <baidu-map ak="BpR5AdexRg7RKVlsjAHw1LhunGfSKBbG" :map-click="true" :auto-resize="true" @moving="syncCenterAndZoom" @moveend="syncCenterAndZoom" @zoomend="syncCenterAndZoom">
                      <bm-view class="map" style="height: 340px;"></bm-view>
                      <bm-local-search style="display: none;" :keyword="dialog.location" :auto-viewport="true"></bm-local-search>
                    </baidu-map>
                  </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                  <!-- <el-button @click="dialogForm1Visible = false">取 消</el-button> -->
                  <el-button type="primary" @click="dialogForm1Visible = false">确定</el-button>
                </div>
              </el-dialog>
              <p class="projectName">项目:<span>{{ rightTopInfo.name }}</span>
                <el-tooltip class="item" effect="dark" placement="right">
                  <span slot="content">{{dialog.syn_state ? '项目密码未覆盖' : '项目密码已覆盖'}}</span>   
                  <el-button type="text"  @click="configProjectFunc"><i class="el-icon-setting"></i></el-button>
                </el-tooltip>
              </p>
              <p class="address">
                <i class="iconfont icon-dizhi"></i>
                地址:<span>{{rightTopInfo.address}}</span>
                 <i class="iconfont icon-icon"></i>
                考勤范围:<span>{{rightTopInfo.scope}}米</span>
                 <i class="iconfont icon-jinlingyingcaiwangtubiao54"></i>
                考勤状态:<span>{{rightTopInfo.state}}</span>
                 <i class="iconfont icon-synchronize"></i>
                同步状态:<span>{{rightTopInfo.syn_state}}</span>
              </p>
              <p class="projectId">
                考勤编码:<span>{{rightTopInfo.attend_code}}</span>
                考勤密码:<span>{{rightTopInfo.attend_passwd}}</span>
              </p>
              <el-button type="primary" @click="addAttendTeam" class="addAttendTeam">添加考勤组</el-button>
            </div>
            <!-- 添加考勤组 -->
            <el-dialog title="添加考勤组" :visible.sync="dialogStatus.addAttendTeam">
              <el-form style="padding: 30px;" ref="addAttendTeamForm" :model="rightBuilding.addTeamForm" :rules="rightBuilding.addTeamRules.form">
                <el-form-item label="考勤组名称" label-width="100px">
                  <el-input type="text" v-model="rightBuilding.addTeamForm.projectName" placeholder="请输入考勤组名称(6个字以内)"></el-input>
                </el-form-item>
                <el-form-item label="考勤密码" label-width="100px">
                  <el-input type="text" v-model="rightBuilding.addTeamForm.attendPassword" placeholder="请输入考勤密码(6-20位)"></el-input>
                </el-form-item>
              </el-form>
                <span slot="footer" class="dialog-footer">
                  <el-button @click="dialogStatus.addAttendTeam = false">取 消</el-button>
                  <el-button type="primary" @click="saveAddAttendTeam">确 定</el-button>
                </span>
            </el-dialog>
            <el-table :data="rightMenuList.teamList">
              <el-table-column type="index" label="序号" align="center" width="90"></el-table-column>
              <el-table-column prop="teamName" label="考勤组名称" align="center"></el-table-column>
              <el-table-column prop="code" label="考勤编号" align="center"></el-table-column>
              <el-table-column prop="passwd" label="考勤密码" align="center"></el-table-column>
              <el-table-column prop="nums" label="成员数" align="center"></el-table-column>
              <el-table-column prop="" label="操作">
                <template scope="scope">
                  <el-button type="text" size="small" @click="toPreviewTeamMember(scope.$index, scope.row)">查看</el-button>
                  <el-button type="text" size="small" @click="editRightMenuList(scope.$index, scope.row)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 编辑 -->
            <el-dialog title="编辑" :visible.sync="dialogStatus.editRightMenuList">
              <el-form style="padding: 30px;">
                <el-form-item label="考勤组名称" label-width="100px">
                  <el-input type="text" v-model="dialog.teamName" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="考勤密码" label-width="100px">
                  <el-input type="text" v-model="dialog.passwd" placeholder="请输入"></el-input>
                </el-form-item>
              </el-form>
                <span slot="footer" class="dialog-footer">
                  <el-button @click="dialogStatus.editRightMenuList = false">取 消</el-button>
                  <el-button type="primary" @click="saveRightMenuList">确 定</el-button>
                </span>
            </el-dialog>
          </div>
          <!-- 考勤组中的人员列表 -->
          <div v-show="rightPersonList.status">
            <el-dialog size="tiny" title="移动" :visible.sync="dialogStatus.moveToOtherTeam">
              <div style="padding: 30px;">
                <p>将工人移动到：</p>
                <el-radio-group style="display: block; padding: 10px 0;" v-model="rightPersonList.moveToTeam">
                  <el-radio v-for="item in rightPersonList.teamList" :key="item" style="display: block; padding: 6px 0; margin: 0;" :label="item.id">{{item.name}}</el-radio>
                </el-radio-group>
                <span slot="footer" class="dialog-footer">
                  <el-button @click="dialogStatus.moveToOtherTeam = false">取 消</el-button>
                  <el-button type="primary" @click="saveMoveToOtherTeam">确 定</el-button>
                </span>
              </div>
            </el-dialog>
            <div style="padding: 16px 0 26px 0;">
              <el-breadcrumb separator=">">
                <el-breadcrumb-item :to="{ path: '/' }">{{ rightTopInfo.name }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ rightTopInfo.teamName}}</el-breadcrumb-item>
               
              </el-breadcrumb>
            </div>
            <el-table :data="rightPersonList.personList"  class="show-table" @selection-change="batchMove">
              <el-table-column type="selection" width="80"> </el-table-column>
              <el-table-column type="index" label="序号" width="80"></el-table-column>
              <el-table-column prop="member_name" label="姓名" width="120"></el-table-column>
              <el-table-column prop="memeber_cardno" label="身份证号" width="200"></el-table-column>
              <el-table-column prop="emp_company" label="所属单位" width="270"></el-table-column>
              <el-table-column prop="job_name_text" label="工种" width="160"></el-table-column>
              <el-table-column prop="contract_status" label="劳动合同" width="140"></el-table-column>
              <el-table-column prop="contract_status" label="安全培训" width="140"></el-table-column>
              <el-table-column prop="" label="操作" width="120">
                <template scope="scope">
                  <el-button type="text" size="small" @click.stop="moveToOtherTeam(scope.$index, scope.row)">移动</el-button>
                  <el-popover ref="delPerson{{$index}}" v-model="scope.row.popover" placement="top" width="200" trigger="click">
                    <div style="padding: 10px 0;">本操作将不可恢复，是否删除？</div>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" type="text" @click.stop="removeFromTeam = false">取消</el-button>
                      <el-button type="primary" size="mini" @click.stop="removeFromTeam">确定</el-button>
                    </div>
                  </el-popover>
                  <el-button v-popover:delPerson{{$index}} type="text" size="small" @click.stop="removeToTeam(scope.$index, scope.row)">移除</el-button>
                </template>
              </el-table-column>

            </el-table>
            <el-button type="primary" @click.stop="batchMoveFunc">移动</el-button>
            <!-- 分页 -->
            <div class="block show-page" >
              <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :total="pageSum" :page-size="pageNum"> </el-pagination>
            </div>
          </div>
          <!-- 创建考勤项目 -->
          <div v-show="rightBuilding.status">
            <div v-show="rightBuilding.form.status">
              <div class="createdProject">创建考勤项目</div>
              <el-form ref="rightBuildingForm" :model="rightBuilding.form" :rules="rightBuilding.rules.form" class="createProject">
                <el-form-item prop="projectName" label="项目名称" label-width="110px">
                  <el-input type="text" v-model="rightBuilding.form.projectName" class="createProjectWidth"></el-input>
                </el-form-item>
                <el-form-item prop="projectPassword" label="项目密码" label-width="110px">
                  <el-input type="text" v-model="rightBuilding.form.projectPassword" class="createProjectWidth"></el-input>
                </el-form-item>
                <el-form-item prop="location" label="所在地区" label-width="110px">
                  <el-select v-model="rightBuilding.form.province" @change="location(),getProjectCity()" class="createSelectWidth">
                    <el-option v-for="item in projectArea.province" :key="item" :value="item.areaId" :label="item.areaName"></el-option>
                  </el-select>
                  <el-select v-model="rightBuilding.form.city" @change="location(),isShenzhen()" class="createSelectWidth">
                    <el-option v-for="item in projectArea.city" :key="item" :value="item.areaId" :label="item.areaName"></el-option>
                  </el-select>
                  <el-select v-model="rightBuilding.form.area" @change="location" class="createSelectWidth">
                    <el-option v-for="item in projectArea.area" :key="item" :value="item.areaId" :label="item.areaName"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item prop="address" label="详细地址" label-width="110px">
                  <el-input type="text" v-model="rightBuilding.form.address" @change="location" class="createProjectWidth"></el-input>
                </el-form-item>
                <el-form-item label="" label-width="0">
                  <baidu-map ak="BpR5AdexRg7RKVlsjAHw1LhunGfSKBbG" :map-click="true" :auto-resize="true" @moving="syncCenterAndZoom" @moveend="syncCenterAndZoom" @zoomend="syncCenterAndZoom">
                    <bm-view class="map"></bm-view>
                    <bm-local-search style="display: none;" :auto-viewport="true" :keyword="rightBuilding.form.location"></bm-local-search>
                  </baidu-map>
                </el-form-item>
                <el-form-item prop="deviation" label="允许偏差范围" label-width="110px">
                  <el-select type="text" v-model="rightBuilding.form.deviation">
                    <el-option value="300" label="300米"></el-option>
                    <el-option value="500" label="500米"></el-option>
                    <el-option value="1000" label="1000米"></el-option>
                    <!-- <el-option value="" label="400米">不限制范围</el-option> -->
                  </el-select>
                </el-form-item>
                <el-form-item label="" label-width="0">
                  <el-button @click="rightBuilding.status = false">取消</el-button>
                  <el-button type="primary" v-show="!rightBuilding.shenzhen" @click="newProjectBuilding">创建</el-button>
                  <el-button type="primary" v-show="rightBuilding.shenzhen" @click="toShenzhenPage">下一步</el-button>
                </el-form-item>
              </el-form>
            </div>
            <div v-show="!rightBuilding.form.status">
              <div>
                <div class="async-top">同步项目</div>
                <hr class="async-border">
                <div class="async-info">为了符合深圳市建筑行业实名制与分账制标准，请链接点击链接<a target="_Blank" href="http://ticwr.thit.com.cn/">深圳市建筑业实名制和分账制管理平台</a>进行项目注册。审核通过将会收短信，在上述系统中点击项目管理->项目修改->获取工程编号，设备管理里面获取授权账号、授权密钥、设备序号。</div>
              </div>
              <div>
                <el-form>
                  <el-row>
                    <el-col :span="12">
                      <el-form-item label="工程编号" label-width="100px">
                        <el-input type="text" v-model="rightBuilding.async.one" placeholder="请输入工程编号"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="设备序号" label-width="100px">
                        <el-input type="text" v-model="rightBuilding.async.two" placeholder="请输入设备序号"></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="12">
                      <el-form-item label="设备序号" label-width="100px">
                        <el-input type="text" v-model="rightBuilding.async.three" placeholder="请输入设备序号"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="授权秘钥" label-width="100px">
                        <el-input type="text" v-model="rightBuilding.async.four" placeholder="请输入授权秘钥"></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
              <div>
                <el-button @click="rightBuilding.form.status = true">上一步</el-button>
                <el-button @click="rightBuilding.async.status = !rightBuilding.async.status">暂不同步</el-button>
                <!-- 填写完表单之后出现的完成按钮 -->
                <el-button v-if="!rightBuilding.async.status" :disabled="calculator" type="primary" @click="newShenZhenProject">完成</el-button>
                <!-- 直接点击暂不完成之后出现的完成按钮 -->
                <el-button v-else type="primary" @click="newProjectBuilding">完成</el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
  </div>
</template>
<script>
import api from '../script/api.js';
import { BaiduMap, BmView,  BmLocalSearch } from 'vue-baidu-map';
export default {
  data() {
    return {
      diy: false,
      // 分页
      pageSum: null,
      pageNum: null,
      pageIdx: null,
      // 地图
      dialogForm1Visible: false,
      form1: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      form1LabelWidth: '120px',
      keyword: '深圳市福田区',

     // 设置
      configProject: false,
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      formLabelWidth: '120px',
      valueRange: '',
      optionsRange: [{
        value: '300',
        label: '300米'
      }, {
        value: '500',
        label: '500米'
      }, {
        value: '1000',
        label: '1000米'
      }, {
        value: '0',
        label: '不限制范围'
      }],
      configProjectArea: {
        province: [],
        city: [],
        area: []
      },
      projectArea: {
        province: [],
        city: [],
        area: []
      },
      rightTopInfo: { },
      map: {
        center: { lng: 116.404, lat: 39.915 }
      },
      selectValue: '',
      leftMenuList: [],
      rightMenuList: {
        status: true,
        teamList: []
      },
      rightPersonList: {
        status: false,
        teamId: '',
        moveToTeam: '',
        teamList: [],
        personList: []
      },
      rightBuilding: {
        status: false,
        shenzhen: false,
        form : {
          status: true,
          projectName: '',
          projectPassword: '',
          province: '',
          city: '',
          area: '',
          location: '',
          address: '',
          deviation: '',
          thirdProjectId: '',
          apiKey: '',
          apiSecret: '',
          clientSerial: ''
        },
        addTeamForm: {
          sstatus: true,
          projectName: '',
          attendPassword: '',
          projectId: '',
          id: '',
          owner: ''
        },
        async: {
          status: false,
          one: '',
          two: '',
          three: '',
          four: ''
        },
        addTeamRules: {
          form: {
            projectName: [
              { required: true, message: '请输入项目名称', trigger: 'blur' }
            ],
            projectPassword: [
              { required: true, message: '请输入项目密码', trigger: 'blur' }
            ]
           
          }
        },
        rules: {
          form: {
            projectName: [
              { required: true, message: '请输入项目名称', trigger: 'blur' }
            ],
            projectPassword: [
              { required: true, message: '请输入项目密码', trigger: 'blur' }
            ],
            location: [
              { required: true, message: '请输入所在地区', trigger: 'blur' }
            ],
            address: [
              { required: true, message: '请输入详细地址', trigger: 'blur' }
            ],
            deviation: [
              { required: true, message: '请输入允许偏差范围', trigger: 'blur' }
            ]
          }
        }
      },
      dialog: {},
      dialogStatus: {
        editRightMenuList: false,
        moveToOtherTeam: false,
        addAttendTeam: false
      },
      popoverStatus: {
        delPerson: false,
        movePerson: false
      }
    }
  },
  created() {
    let self = this;
    $.ajax({ url: api.getProject, type: 'GET', xhrFields: { withCredentials: true } }).done((res) => {
      self.leftMenuList = res.data.list;
      let idx = res.data.list[0].pid;
      $.ajax({ url: api.getProjectInfo, type: 'GET', data:{ id: idx },xhrFields: { withCredentials: true } }).done((res)=>{
        if(res.errCode == 0){
          switch(res.data.state){
            case 0: 
            res.data.state = '未开始考勤';
            break;
            case 1:
            res.data.state = '正在考勤';
            break;
            case 2:
            res.data.state = '考勤结束';
            break;
          }
          switch(res.data.syn_state){
            case 0: 
            res.data.syn_state = '项目未同步';
            break;
            case 1:
            res.data.syn_state = '项目已同步';
            break;
            case 2:
            res.data.syn_state = '项目同步中';
            break;
          }
          self.rightTopInfo = res.data;
          self.projectId = self.rightTopInfo.id_;
        }
      })
      self.changeProjectPage(idx);
    })
  },
  computed: {
    // 深圳同步项目时所用到的属性
    calculator() {
      let { one, two, three, four } = this.rightBuilding.async;
      if( !one ) return true;
      if( !two ) return true;
      if( !three ) return true;
      if( !four ) return true;
      return false;
    }
  },
  methods: {
    locate() {
      let self = this;
      let { provinceText, province_id, cityText, city_id, areaText, area_id, address } = this.dialog;
      // 省市县三级联动
      $.ajax({ url: api.getProvince, type: 'GET', async: true, xhrFields: { withCredentials: true } }).done((res) => {
        self.projectArea.province = res.data.list;
        $.ajax({ url: api.getCitys, type: 'GET', async: true, data: { provinceId: province_id }, xhrFields: { withCredentials: true } }).done((res)=>{
          self.projectArea.city = res.data.list;
          $.ajax({ url: api.getArea, type: 'GET', async: true, data: { cityId: city_id }, xhrFields: { withCredentials: true } }).done((res) => {
            self.projectArea.area = res.data;
            // // 省市县三级联动字典
            let { province, city, area } = self.projectArea;
            province.forEach((e,i) => {
              if( e.areaId == province_id ) {
                // 省份的名字
                self.dialog.provinceText = e.areaName;
              }
            })
            city.forEach((e,i) => {
              if(e.areaId == city_id) {
                // 市的名字
                self.dialog.cityText = e.areaName;
              }
            })
            area.forEach((e,i) => {
              if(e.areaId == area_id) {
                // 县的名字
                self.dialog.areaText = e.areaName;
              }
            })
            let location = `${provinceText}${cityText}${areaText}${address}`;
            self.dialog.location = location;
          })
        })
      })
    },
    configProjectFunc() {
      let self = this;
      // 服务器返回的省市县id
      let { province_id, city_id, area_id } = this.rightTopInfo;
      // 省市县三级联动
      $.ajax({ url: api.getProvince, type: 'GET', async: true, xhrFields: { withCredentials: true } }).done((res) => {
        self.projectArea.province = res.data.list;
        $.ajax({ url: api.getCitys, type: 'GET', async: true, data: { provinceId: province_id }, xhrFields: { withCredentials: true } }).done((res)=>{
          self.projectArea.city = res.data.list;
          $.ajax({ url: api.getArea, type: 'GET', async: true, data: { cityId: city_id }, xhrFields: { withCredentials: true } }).done((res) => {
            self.projectArea.area = res.data;
            // // 省市县三级联动字典
            let { province, city, area } = self.projectArea;
            province.forEach((e,i) => {
              if( e.areaId == province_id ) {
                // 省份的名字
                self.rightTopInfo.provinceText = e.areaName;
              }
            })
            city.forEach((e,i) => {
              if(e.areaId == city_id) {
                // 市的名字
                self.rightTopInfo.cityText = e.areaName;
              }
            })
            area.forEach((e,i) => {
              if(e.areaId == area_id) {
                // 县的名字
                self.rightTopInfo.areaText = e.areaName;
              }
            })
            self.dialog = self.rightTopInfo;
            self.configProject = !self.configProject;
          })
        })
      })
      
    },
    /*
    *  选择非深圳或者未同步住建部时创建项目的方法
    */
    newProjectBuilding() {
      let self = this;
      // lng 纬度  lat 经度
      let { lng, lat } = this.map.center;
      // 接口赋值
      let { projectName, projectPassword, province, city, area, location, address, deviation } = this.rightBuilding.form;
      this.$refs.rightBuildingForm.validate((valid) => {
        if( valid ) {
          let formData = {
            name: projectName,
            provinceId: province,
            cityId: city,
            areaId: area,
            address: address,
            location: location,
            lonlat: lng,
            lonlat2: lat,
            scope: deviation
          }
          $.ajax({url: api.createNoSzProject , type: 'GET', data: formData, xhrFields: { withCredentials: true }}).done((res) => {
            // 处理ajax的回调
            if(res.state == 1){
              self.$message({ showClose:true, message: '创建项目成功！', typpe: 'success'});
              this.rightBuilding.status = !this.rightBuilding.status;
            }else{
              self.$message({showClose: true, message : res.msg , type: 'error'});
            }
          })
        } else {
          return false;
        }
      })
      // console.log('选择非深圳或者未同步住建部时创建项目的方法')
    },
    /*
    *  深圳且选择同步住建部时创建项目的方法
    */
    newShenZhenProject() {
      let self = this;
      // lng 纬度  lat 经度
      let { lng, lat } = this.map.center;
      // 接口赋值
      let { projectName, projectPassword, province, city, area, location, address, deviation, thirdProjectId, apiKey, apiSecret, clientSerial } = this.rightBuilding.form;
      this.$refs.rightBuildingForm.validate((res) =>{
          let formData = {
            name: projectName,
            provinceId: province,
            cityId: city,
            areaId: area,
            address: address,
            location: location,
            lonlat: lng,
            lonlat2: lat,
            scope: deviation,
            thirdProjectId: thirdProjectId,
            apiKey: apiKey,
            apiSecret: apiSecret,
            clientSerial: clientSerial
          }
          $.ajax({url: api.createNoSzProject, type: 'GET', data: formData, xhrFields: { withCredentials: true }}).done((res) => {
              if(res.state == 1){
                self.$message({ showClose:true, message: '创建项目成功！', typpe: 'success'});
                setTimeout(()=> {location.reload()},1000);
                this.rightBuilding.status = !this.rightBuilding.status;
              }else{
                self.$message({showClose: true, message : res.msg , type: 'error'});
              }
          })

      })
     
    },
    /**
     * 保存编辑考勤组的方法
     */
    saveRightMenuList() {
      let self = this;
      let value = this.dialog.passwd;
      let ename = this.dialog.teamName;
      let {code, id, name, owner, passwd, projectId, attendPasswd} = this.dialog;
      let formData = {
        id: id,
        owner: owner,
        name: ename,
        attendPasswd: value
      }
      $.ajax({url: api.saveEditAttend , type: 'GET', data: formData, xhrFields: { withCredentials: true }}).done((res) => {
        // 处理ajax的回调
        if(res.state == 1 ) {
          self.$message({ showClose:true, message: '修改成功！', typpe: 'success'});
          self.dialogStatus.editRightMenuList = !self.dialogStatus.editRightMenuList;
        }else{
          self.$message({showClose: true, message : res.msg , type: 'error'});
        }
      })
    },
    // 切换到深圳同步项目页面
    toShenzhenPage() {
      let self = this;
      this.$refs.rightBuildingForm.validate((valid) => {
        if( valid ) {
          self.rightBuilding.form.status = !self.rightBuilding.form.status;
        } else {
          return false;
        }
      })
    },
    // 判断是否项目所在地是否为深圳
    isShenzhen() {
      let city = this.rightBuilding.form.city;
      // console.log(city)
      if( !city ) return;
      if( city != 291 ) this.rightBuilding.shenzhen = false;
      else { this.rightBuilding.shenzhen = !this.rightBuilding.shenzhen;}
    },
    // 左侧导航栏切换栏目
    projectToggle() {
      let self = this;
      let value = this.selectValue;
      $.ajax({ url: api.getProject, type: 'GET', data: { state: value }, xhrFields: { withCredentials: true } }).done((res) => {
        self.leftMenuList = res.data.list;
      })
    },
    // 移动到别的考勤组
    moveToOtherTeam(index, row) {
      let self = this;
      let idx = this.rightPersonList.teamId;
      if(!idx) return;
      this.dialog = row;
      let jsonData = [];
      $.ajax({ url: api.getTeamList, type: 'GET', data: { id: idx }, xhrFields: { withCredentials: true } }).done((res) => {
        let arr = res.data;
        arr.forEach((e,i) => {
          let arrData = {
            id: e.id,
            name: e.teamName
          }
          jsonData.push(arrData);
        })
        self.rightPersonList.teamList = jsonData;
      })
      this.dialogStatus.moveToOtherTeam = true;
    },
    // 移动到别的考勤组的方法
    saveMoveToOtherTeam() {
      let self = this;
      let id = this.dialog.id_;
      console.log(id)
      if( !id ) return;
      let { teamId, moveToTeam } = this.rightPersonList;
      let formData = {
        id: id,
        teamId: moveToTeam
      };
      $.ajax({ url: api.moveToOtherTeam, type: 'POST', data: formData, traditional: true, xhrFields: { withCredentials: true} }).done((res) => {
        if( res.errCode == 0 ) {
          self.$message({ showClose: true, message: '移动考勤组成功', type: 'success' });
          self.dialogStatus.moveToOtherTeam = !self.dialogStatus.moveToOtherTeam;
          setTimeout(()=> {location.reload()},1000);
        } else {
          self.$message({ showClose: true, message: res.errMsg, type: 'error' });
        }
      })
    },
    //批量移动的方法
    batchMove(selection){
      let self = this;
      let idx = this.rightPersonList.teamId;
      if(!idx) return;
      let jsonData = [];
      $.ajax({ url: api.getTeamList, type: 'GET', data: { id: idx }, xhrFields: { withCredentials: true } }).done((res) => {
        let arr = res.data;
        arr.forEach((e,i) => {
          let arrData = {
            id: e.id,
            name: e.teamName
          }
          jsonData.push(arrData);
        })
        self.rightPersonList.teamList = jsonData;
      })
      let batchMoveId = [];
      
      for( let i = 0; i < selection.length; i ++ ){
        batchMoveId.push(selection[i].id_)
      }
      this.dialog.id_ = batchMoveId;
    },
    batchMoveFunc() {
      this.dialogStatus.moveToOtherTeam = !this.dialogStatus.moveToOtherTeam;
    },
    // 从该考勤组移除
    removeToTeam(index, row) {
      this.dialog = row;
    },
    removeFromTeam() {
      let self = this;
      let idx = this.dialog.id_;
      let teamId = this.rightPersonList.teamId;
      $.ajax({ url: api.removeFromTeam, type: 'POST', data: { id: idx }, xhrFields: { withCredentials: true} }).done((res) => {
        if( res.errCode == 0 ) {
          self.$message({ showClose: true, message: '删除成功', type: 'success' });
          setTimeout(() => { location.reload() }, 1000);
        } else {
          self.$message({ showClose: true, message: res.errMsg, type: 'error' });
        }
      })
    },
    // 编辑右侧弹窗
    editRightMenuList(index, row) {
      this.dialogStatus.editRightMenuList = true;
      this.dialog = row;
    },
    //添加考勤组弹框
    addAttendTeam(){
      this.dialogStatus.addAttendTeam = true;
    },
     //保存添加考勤组
    saveAddAttendTeam(){
      let self = this;
      // let value = this.rightBuilding.addTeamForm.attendPassword;
      // let addName = this.rightBuilding.addTeamForm.projectName;
      let {id, owner, projectId, projectName, attendPassword} = this.rightBuilding.addTeamForm;
      console.log(projectId)
      this.$refs.addAttendTeamForm.validate((valid) => {
        if(valid){
           let formData={
            id: id,
            owner: owner,
            name: projectName,
            attendPasswd: attendPassword,
            projectId: self.rightTopInfo.id_
          };
          $.ajax({ url: api.addAttendTeam, type: 'GET', data: formData, xhrFields: { withCredentials : true } }).done((res) => {
            if(res.state == 1 ){
              self.$message({ showClose: true, message: '创建考勤组成功', type: 'success' });
              self.dialogStatus.addAttendTeam = !self.dialogStatus.addAttendTeam;
              setTimeout(() => { location.reload() } , 1000);
            }else{
              self.$message({ showClose: true, message: res.errMsg, type: 'error' });
            }
          })

        }else{
          return false;
        }
      })
    },
     //分页
    handleCurrentChange(val){
      // console.log(val)
      let self = this;
      let idx = this.pageIdx;
      if(!idx) return;
      let formData = {
        teamId: idx,
        pageNum: val,
        pageSize: 20
      };
      $.ajax({ url: api.getTeamMember, type: 'GET', data: formData, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 0 ) {
          $.ajax({ url:api.getWorkerKey, type: 'GET', xhrFields: { withCredentials: true } }).done((ress) => {
            for( let i=0; i< res.data.list.length; i++){
              if(res.data.list[i].contract_status == 0){
                res.data.list[i].contract_status = "无效"
              }else{res.data.list[i].contract_status = "有效"}
              if(res.data.list[i].is_safety == 0){
                res.data.list[i].is_safety = "未培训"
              }else if(res.data.list[i].is_safety == 1){
                res.data.list[i].is_safety = "已培训"
              }else if(res.data.list[i].is_safety == 2){
                res.data.list[i].is_safety = "已通过"
              }else{
                 res.data.list[i].is_safety = "未通过"
              }
              for(let j = 0; j< ress.length;  j++){
                if(res.data.list[i].job_name == ress[j].value){
                  res.data.list[i].job_name_text = ress[j].label;
                  // console.log(1)
                }
              }
            }
          })
          self.rightPersonList.personList = res.data.list;
          self.pageSum = res.data.total;
          self.pageNum = res.data.pageSize;
          self.rightMenuList.status = self.rightBuilding.status = false;
          self.rightPersonList.status = true;
        }
      })
    },
    // 查看考勤组成员
    toPreviewTeamMember(index, row) {
      let self = this;
      let idx = row.id;
      self.rightTopInfo.teamName = row.teamName;
      this.pageIdx= idx;
      let formData = {
        teamId: idx,
        pageNum: 1,
        pageSize: 20
      };
      $.ajax({ url: api.getTeamMember, type: 'GET', data: formData, xhrFields: { withCredentials: true } }).done((res) => {
        if( res.errCode == 0 ) {
          $.ajax({ url: api.getWorkerKey, type: 'GET', xhrFields: { withCredentials: true } }).done((ress) => {
            for( let i=0; i< res.data.list.length; i++){
              if(res.data.list[i].contract_status == 0){
                res.data.list[i].contract_status = "无效"
              }else{res.data.list[i].contract_status = "有效"}
              if(res.data.list[i].is_safety == 0){
                res.data.list[i].is_safety = "未培训"
              }else if(res.data.list[i].is_safety == 1){
                res.data.list[i].is_safety = "已培训"
              }else if(res.data.list[i].is_safety == 2){
                res.data.list[i].is_safety = "已通过"
              }else{
                 res.data.list[i].is_safety = "未通过"
              }
              for(let j = 0; j< ress.length;  j++){
                if(res.data.list[i].job_name == ress[j].value){
                  res.data.list[i].job_name_text = ress[j].label;
                  // console.log(1)
                }
              }
            }
          })
          self.rightPersonList.personList = res.data.list;
          self.pageSum = res.data.total;
          self.pageNum = res.data.pageSize;
          self.rightMenuList.status = self.rightBuilding.status = false;
          self.rightPersonList.status = true;
        }
      })
    },
    changeProjectPage(v) {
      let self = this;
      this.rightPersonList.teamId = v;
      this.rightBuilding.status = this.rightPersonList.status = false;
      $.ajax({ url: api.getTeamList, type: 'GET', data: { id: v }, xhrFields: { withCredentials: true } }).done((res) => {
        self.rightMenuList.teamList = res.data;
        $.ajax({
          url: api.getProjectInfo,
          type: 'GET',
          data:{
            id: v
          },xhrFields: { withCredentials: true }
        }).done((res)=>{
          console.log(res)
          if(res.errCode == 0){
            switch(res.data.state){
              case 0: 
              res.data.state = '未开始考勤';
              break;
              case 1:
              res.data.state = '正在考勤';
              break;
              case 2:
              res.data.state = '考勤结束';
              break;
            }
            switch(res.data.syn_state){
              case 0: 
              res.data.syn_state = '项目未同步';
              break;
              case 1:
              res.data.syn_state = '项目已同步';
              break;
              case 2:
              res.data.syn_state = '项目同步中';
              break;
            }
            self.rightTopInfo = res.data;
          }
        })
      })
      this.rightMenuList.status = true;
    },
    // 创建考勤组中的百度地图切换视图
    location() {
      let self = this;
      let { province, city, area, address, location } = self.rightBuilding.form;
      let pid, cid, aid;
      this.rightBuilding.form.location = location;
      // if(!province) return;
      $.ajax({ url: api.getCitys, type: 'GET', async: true, data: { provinceId: province }, xhrFields: { withCredentials: true } }).done((res)=>{
        self.projectArea.city = res.data.list;
        $.ajax({ url: api.getArea, type: 'GET', async: true, data: { cityId: city }, xhrFields: { withCredentials: true } }).done((res) => {
          self.projectArea.area = res.data;
        })
      })
      for( let i = 0; i < self.projectArea.province.length; i++ ) {
        if( province == self.projectArea.province[i].areaId ) {
          self.rightBuilding.form.provinceText = self.projectArea.province[i].areaName
        }
      }
      for( let j = 0; j < self.projectArea.city.length; j++ ) {
        if( city == self.projectArea.city[j].areaId ) {
          self.rightBuilding.form.cityText = self.projectArea.city[j].areaName
        }
      }
      for( let k = 0; k < self.projectArea.area.length; k++ ) {
        if( area == self.projectArea.area[k].areaId ) {
          self.rightBuilding.form.areaText = self.projectArea.area[k].areaName
        }
      }
      let { provinceText, cityText, areaText } = self.rightBuilding.form;
      location = `${provinceText}${cityText}${areaText}${address}`;
      self.rightBuilding.form.location = location;
    },
    buildProject() {
      let self = this;
      $.ajax({
        url: api.getProvince,
        type: 'GET',
        xhrFields: { withCredentials: true }
      }).done((res) => {
        self.projectArea.province = res.data.list;
      })
      this.rightMenuList.status = this.rightPersonList.status = false;
      this.rightBuilding.status = !this.rightBuilding.status;
    },
    getProjectCity(value){
      
    },
    syncCenterAndZoom(e) {
      const {lng, lat} = e.target.getCenter()
      this.map.center.lng = lng
      this.map.center.lat = lat
    },

    // 项目设置
    configProject(){
      
      
    },

    //保存设置的方法
    saveConfigProject(){
      let self = this;
      let obj = this.dialog;
      let { lng, lat } = this.map.center;
      let saveData = {
        id: obj.id_,
        name: obj.name,
        attendCode: obj.attend_code,
        attendPasswd: obj.attend_passwd,
        provinceId: obj.province_id,
        cityId: obj.city_id,
        areaId: obj.area_id,
        address: obj.address,
        scope: obj.scope
      };
      if( lng !== 0 ) saveData.longitude = lng;
      if( lat !== 0 ) saveData.longitude = lat;
      if( lng !== 0 && lat !== 0 ) saveData.location = `${lat},${lng}`;
      if( obj.third_project_id ) saveData.thirdProjectId = obj.third_project_id;
      if( obj.client_serial ) saveData.clientSerial = obj.client_serial;
      if( obj.api_key ) saveData.apiKey = obj.api_key;
      if( obj.api_secret ) saveData.apiSecret = obj.api_secret;
      console.log(saveData)
      $.ajax({
        url: api.saveConfigProject,
        type: 'GET',
        data: saveData,
        xhrFields: { withCredentials: true }
      }).done((res)=>{
        if(res.state == 1 ) {
          self.$message({ showClose:true, message: '设置项目信息成功！', type: 'success'});
          // setTimeout(() => { location.reload() }, 1000);
        }else{
          self.$message({showClose: true, message : res.msg , type: 'error'});
        }
      })
    },

    //结束考勤项目
    ednProjectAttend(){
      let self = this;
      let id = this.rightTopInfo.id_;
      console.log(this.rightTopInfo)
      $.ajax({
        url: api.endProjectAttend,
        type: 'POST',
        data: {
          id: id
        },
        xhrFields: { withCredentials: true}
      }).done((res)=>{
        if(res.errCode == 0){
          self.$message({ showClose: true, message: '结束考勤项目成功', type: 'success' });
          setTimeout(() => { location.reload() }, 1000);
        }else{
          self.$message({ showClose: true, message: res.errMsg, type: 'error' });
        }
      })
    }
  },
  components: {
    BaiduMap, BmView, BmLocalSearch
  }
}
</script>
<style scoped>
.project .left-menu-list ul, .project .left-menu-list li {
  list-style: none;
}
.project .left-menu-list > li {
  height: 50px;
  line-height: 50px;
  text-align: center;
  border-bottom: 1px solid #e0e7ec;
  transition: color .2s;
  cursor: pointer;
}
.project .left-menu-list > li:hover {
  color: #22a2ff;
}
.project .left-menu-btns {
  padding: 10px 0;
  text-align: center;
}
.project .map {
  width: 100%;
  height: 400px;
}
.project .dialog-footer {
  text-align: right;
}
.project .createdProject{
  padding:8px 0 24px 0;
}
.project .main-right-top .address{
  font-size: 14px;
  color:#97a8be;
}
.project .main-right-top .address span,.project .main-right-top .projectId span{
  padding-right: 48px;
}
.project .main-right-top .projectName,.project .main-right-top .address,.project .main-right-top .projectId{
  padding-bottom: 10px;
}
.project .createProjectWidth{
  width: 380px;
}
.project .createSelectWidth{
  width:146px;
}
.project .show-table{
  margin-bottom: 20px;
}
.project .show-page{
  float:right;
}
.project .async-border{
  float: left;
  width: 103%;
  height: 1px;
  margin-left: -20px;
  background: #E0E7EC;
  border: none;
}
.project .async-top{
  padding: 10px 0 17px 0;
}
.project .async-info{
  font-size: 14px;
  color:#333;
  padding: 30px 0;
}
.project .async-info a{
  color: #5DA9F2;
}
.project .sync_msg{
  padding: 0px 54px 20px;
}
.project .smallTitle{
  margin: 10px 0 8px 0px;
}
.project .syncwidth{
  width:50%;
  float:left;
}
.project .dizhi{
  width:546px;
}
.project .el-dialog #centerBut{
  text-align: center;
}
.project .sync_msg a{
  color: #3799F2;
}
.project .main-right-top{
  position: relative;
}
.project .addAttendTeam{
  position:absolute;
  right:1px;
  top:36px;
}

</style>