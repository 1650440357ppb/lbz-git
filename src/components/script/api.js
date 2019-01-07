'use strict';
/*
** 用于储存项目所需的api接口
** host为目标域名
*/

// let host = 'http://118.176.17.146:8081'  
let host = 'http://192.168.0.170:8081'  

let api = {
    /* 首页 */
    manageData: host + '/gethome',

    /* 项目管理 */
    getProject: host + '/project/get', // 项目管理获取侧边栏
    getTeamList: host + '/team/getProjectMember',  //  获取项目下的考勤组详细信息
    getTeamMember: host + '/oaTeamMember/queryOaTeamMemberListPage', // 获取考勤组下的成员列表
    moveToOtherTeam: host + '/oaTeamMember/moveToOtherOaTeamBatch', // 移动到别的考勤组以及批量操作
    removeFromTeam: host + '/oaTeamMember/awayOaTeamMember', // 从考勤组中删除
    saveEditAttend: host + '/team/updTeam',   //保存编辑考勤组
    createNoSzProject: host+ '/project/addProject', //创建非深圳项目
    getProjectInfo: host+ '/project/getOaProjectInfo',//查询项目基本信息
    getProvince: host + '/project/selectProvince',  //获取省份
    getCitys: host + '/project/selectCity',   //获取城市 provinceId=1
    getArea: host + '/project/selectArea',    //获取县区 cityId=89
    configProject: host + '/project/selectProject',  //项目设置
    saveConfigProject: host+ '/project/updProject',  //保存项目设置
    endProjectAttend: host+ '/project/endProject', //结束考勤项目
    addAttendTeam: host+ '/team/addTeam',  //添加考勤组


    /* 图片验证码 */
    checkPictureVerify: host + '/checkPictureVerify',  // 校验图片验证码
    pictureVerify: host + '/pictureVerify.jpg',  // 生成图片验证码

    /* 短信验证码 */
    sendMessageCode: host + '/sms',         // 发送短信验证码
    checkMessageCode: host + '/verifySms',  // 校验短信验证码

    /* 邮箱验证码 */
    sendEmailCode: host + '/email/sendCompanyCode', // 发送邮箱验证码  参数：mail - email

    adminLogin: host + '/member/login',          // 管理员登录
    companyLogin: host + '/company/login',    // 企业邮箱登录
    checkPhonenum: host + '/member/isRegister',      // 验证手机号码是否已注册
    registerSubmit: host + '/member/register',        // 发起注册请求
    forgetPassword: host + '/member/getPasswd',  // 找回密码
    companyProve: host + '/company/approve', // 企业认证


    getCompanyInfo: host + '/company/getCompanys',  // 获取账户内创建的公司信息
    buildCompany: host + '/company/insert',   // 创建公司
    switchCompany: host + '/company/change',  // 切换公司
    importProject: host + '/project/getMobileProject',  // 导入手机项目
    exitLoginStatus: host + '/member/ExitMember', // 退出登录状态

    /* 部门管理 */
    getOrganizalTree: host + '/dept/getTree', // 获取部门树形
    checkDeptMember: host + '/deptemp/getPage', // 获取部门成员
    addDeptChange: host + '/dept/insert', // 增加部门
    saveDeptChange: host + '/dept/update', // 修改部门名称
    deleteDeptChange: host + '/dept/delete', // 删除部门
    addDeptMember: host + '/deptemp/insert',  // 增加部门成员
    saveDeptMember: host + '/deptemp/update', // 修改部门成员信息
    deleteDeptMember: host + '/deptemp/delete', // 删除部门成员

    /* 安全培训 */
    getTrainId: host + '/courseEdu/getMaxOateamId', // 获取培训id
    getTrainList: host + '/courseEdu/queryOaCourseEduListPage', //获取安全培训
    getCourseList: host + '/course/queryOaCourseListPage', // 获取培训课程
    saveCourseInfo: host + '/courseEdu/update', // 编辑培训信息/上传现场照片
    addCourseInfo: host + '/course/insert', // 添加培训课程
    batchCourse: host + '/courseEdu/updateBatch', // 匹配培训课程
    findCourseByLimit : host + '/course/queryOaCourseByCourseameListPage', // 按照名称搜索培训课程
    delCourseOne: host + '/courseEdu/deleteOaCourseEduById', // 删除培训记录
    delCourseInfo: host + '/course/deleteOaCourseById', // 删除培训课程

    /* 合同管理 */
    getContractInfo: host + '/contract/getList',  // 查询合同
    saveContractInfo: host + '/contract/update', // 修改合同
    delContractInfo: host + '/contract/delete', // 删除合同
    uploadContract: host + '/contract/upload', // 上传合同


    /* 黑名单 */
    checkBlackList: host + '/oablacklist/queryOaBlacklistByLocalListPage',  // 查询黑名单
    addPersonToBlanklist: host + '/oablacklist/addOaBlacklist', // 添加黑名单
    deletePersonFromBlanklist: host + '/oablacklist/delOaBlacklist', // 删除黑名单
    editBlackList: host + '/oablacklist/editOaBlacklist', // 编辑黑名单
    checkCloudBlankList: host + '/oablacklist/queryOaBlacklistByCloudListPage', // 查询云黑名单
    syncCloudOaBlacklist: host + '/oablacklist/syncCloudOaBlacklist', // 同步云黑名单

    /* 薪资管理 */
    getPayrollId: host + '/payroll/getMaxOateamId', // 获取id
    getPayrollList: host + '/payroll/queryOaPayrollListPage', // 获取薪资列表
    editPayrollInfo: host + '/payroll/update', // 编辑薪资信息
    delPayRollInfo: host + '/payroll/deleteOaPayrollId', // 删除薪资信息
    uploadPayrollExcel: host + '/file/upload', //上传薪资报表
    downloadPayrollExcel: host + '/payroll/downloadByTeamId', // 下载薪资列表
    checkPayrollList: host + '/payroll/queryOaPayrollByConditionListPage', // 查询薪资发送记录

    /* 设置页面 */
    saveInformation: host + '/company/update',  // 修改企业信息
    editAccountPwd: host + '/member/updatePwb', // 修改密码

    /* 发布公告 */
    publishNotice: host + '/notice/addNotice',  // 发布公告
    getNoticeList : host + '/notice/getList',  // 查询历史公告信息

     /* 工人资料 */
    getWorkerInfo: host + '/team/queryOaTeamListPage',  //获取工人资料
    downWorkerInfoBatch: host + '/member/downloadByTeamId',   //下载工人资料  批量
    downWorkerInfo: host + '/member/downloadById',   //下载工人资料  单个
    getWorkerKey: host + '/dict/job',  //获取工种字典
    saveEditWorker: host + '/oaTeamMember/editOaTeamMember', //保存编辑工人资料
    awayOaTeamMember: host + '/oaTeamMember/queryOaTeamMemberByAwayListPage', // 已离场人员
    findWorkerByLimit: host + '/team/queryOaTeamByConditionListPage', // 条件查询

    projectTreeGet: host + '/project/getTree',        // 项目考勤组树形结构
    attendFormData: host + '/attend/getTeam'        // 考勤报表数据


};

export default api;