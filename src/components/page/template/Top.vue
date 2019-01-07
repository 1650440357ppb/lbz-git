<template>
    <div class="header">
        <el-row>
            <el-col :span="24">
                <img src="../../resource/common/logo.png" class="logo">
                <span class="text">鲁班长工人管理平台</span>
            </el-col>
        </el-row>
    </div>
</template>
<script>
    // 登录注册找回密码的头部
    export default {}
</script>
<style>
.header {
    width: 100%;
    max-width: 1684px;
    margin: auto;
    padding: 80px 0 168px;
}
.logo {
    vertical-align: top;
}
.text {
    display: inline-block;
    padding-left: 20px;
    margin-top: 16px;
    margin-left: 20px;
    font-size: 30px;
    font-weight: lighter;
    line-height: 30px;
    border-left: 2px solid #fff;
    color: #fff;
}
</style>
