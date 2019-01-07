<template>
  <div class="publish">
    <el-row class="nav-container">
      <el-col :span="4" class="left-bar">
        <ul class="publish-list">
          <li class="publish-item" @click="togglePublish(0)">发布公告</li>
          <li class="publish-item" @click="togglePublish(1)">查看历史公告</li>
        </ul>
      </el-col>
      <el-col :span="20" class="self">
        <div class="right-bar">
          <div class="right-bar-content" v-show="!publishItem">
            <el-form class="publish-form">
              <el-form-item label="收件组" label-width="80px">
                <el-cascader :options="options" v-model="selectedOptions" placeholder="请选择收件组"> </el-cascader>
              </el-form-item>
              <el-form-item label="正文" label-width="80px">
                <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 8}" placeholder="请输入公告内容(200字以内)" v-model="textarea"> </el-input>
              </el-form-item>
              <el-form-item label-width="80px">
                <el-button type="primary" @click="sendOption">发送</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="right-bar-content" v-show="publishItem">
            <div class="right-bar-top">
              <el-cascader :options="options" v-model="selectedOptions" placeholder="请选择收件组"> </el-cascader>
              <!-- <el-date-picker v-model="selectMonth" type="date" placeholder="选择月份"></el-date-picker> -->
              <el-button type="primary" @click="checkOption">搜索</el-button>
            </div>
            <el-collapse v-model="activeName" accordion v-show="noticeList.length !== 0">
              <el-collapse-item v-for="item in noticeList" :key="item" :name="item.id">
                <template slot="title">
                  {{ item.title }}
                  <span class="publish-time">{{ item.time }}</span>
                </template>
                <div>内容：{{ item.text }}</div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import api from '../script/api.js'
export default {
  data() {
    return {
      publishItem: 0,
      selectedOptions: [],
      textarea: '',
      activeName: '',
      selectMonth: '',
      options: [],
      noticeList: []
    }
  },
  created() {
    this.dialogSetting();
  },
  methods: {
    sendOption() {
      let self = this;
      let val = this.selectedOptions;
      let txt = this.textarea;
      $.ajax({ url: api.publishNotice, type: 'POST', data: { teams: val[1], text: txt },xhrFields: { withCredentials: true } }).done((res) => {
        if(res.errCode >= 0) {
          self.$message({
            showClose: true,
            message: '发布成功',
            type: 'success'
          }); 
        } else {
          self.$message({
            showClose: true,
            message: '发布失败',
            type: 'error'
          }); 
        }
      })
    },
    checkOption() {
      let self = this;
      let val = this.selectedOptions;
      let data = [];
      $.ajax({ url: api.getNoticeList + '/' + val[1], type: 'GET', data: { teamId: val[1], pageNum: 1, pageSize: 10 },xhrFields: { withCredentials: true } }).done((res) => {
        for( let i = 0; i < res.data.list.length; i++ ) {
          let listData = {
            idx: i,
            title: res.data.list[i].text.length > 40 ? res.data.list[i].text.substring(0,40) + '...' : res.data.list[i].text,
            text: res.data.list[i].text,
            time: res.data.list[i].updateTime
          }
          data.push(listData);
        }
        self.noticeList = data;
      })
    },
    handleNodeClick(data,checked) {
     console.log(data,checked)
    },
    togglePublish(val) {
      this.publishItem = val;
    },
    handleCheckChange(value) {
      let data = this.rightbarData;
      if (value.nodes) return;
      for( let i = 0; i < data.length; i++ ) {
        if(data[i].id == value.tid) {
          data.splice(i,1);
          return;
        }
      }
      let item = {
        id: value.tid,
        text: value.text
      };
      data.push(item);
    },
    dialogSetting() {
      let self = this;
      let data = [];
      $.ajax({ url: api.projectTreeGet, type: 'GET', xhrFields: { withCredentials: true } }).done((res) => {
        for( let i = 0; i < res.data.list.length; i++ ) {
          let listData = {
            label: res.data.list[i].text,
            value: res.data.list[i].pid,
            children: []
          }
          for( let j = 0; j < res.data.list[i].nodes.length; j++ ) {
            if(res.data.list[i].pid == res.data.list[i].nodes[j].pid) {
              let nodesData =  {
                label: res.data.list[i].nodes[j].text,
                value: res.data.list[i].nodes[j].tid
              };
              listData.children.push(nodesData);
            }
          }
          data.push(listData);
        }
        self.options = data;
      });
    },
    clearRightData(idx) {
      let self = this;
      let data = this.rightbarData;
      for( let i = 0; i < data.length; i++ ) {
        if( data[i].id == idx ) {
          data.splice(i,1);
        }
      }
    }
  }
}
</script>
<style scoped>
.publish ul, .publish li {
  list-style: none;
}
.publish-item {
  height: 54px;
  line-height: 54px;
  font-size: 14px;
  border-bottom: 1px solid #dfe6ec;
  text-align: center;
  cursor: pointer;
  transition: color .4s;
}
.publish-item:hover {
  color: #3a99f2;
}
.publish .right-bar-content {
  padding: 16px 20px;
}
.publish .right-bar-btns {
  text-align: center;
}
.publish .right-bar-btn {
  width: 120px;
}
.publish .left-tree {
  height: 400px;
  overflow: hidden;
  overflow-y: scroll;
  background-color: #f5fafe;
}
.publish .publish-right-item {
  position: relative;
  padding: 8px 0;
}
.publish .publish-right-item .icon {
  position: absolute;
  right: 12px;
  font-size: 10px;
  cursor: pointer;
}
.publish-form {
  width: 500px;
}
.publish .right-bar-top {
  padding-bottom: 16px;
}
.publish .el-collapse-item {
  position: relative;
}
.publish .publish-time {
  position: absolute;
  top: 0;
  right: 15px;
}
.publish .right-bar {
  min-height: 300px;
}

/*定义滚动条宽高及背景，宽高分别对应横竖滚动条的尺寸*/
.publish .left-tree::-webkit-scrollbar{
    width: 8px;
    height: 8px;
    border: none;
    background-color: #fff;
}
/*定义滚动条的轨道，内阴影及圆角*/
.publish .left-tree::-webkit-scrollbar-track{
    -webkit-box-shadow: none;
    background-color: transparent;
}
/*定义滑块，内阴影及圆角*/
.publish .left-tree::-webkit-scrollbar-thumb{
    height: 20px;
    border-radius: 8px;
    background-color: #999;
}
</style>