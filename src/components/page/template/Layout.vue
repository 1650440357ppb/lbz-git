<template>
	<el-row class="layout">
		<el-col :span="4" class="sidebar">
			<div class="brand">
				<img src="../../resource/logo.png">
				<span class="txt">鲁班长工人管理信息平台</span>
			</div>
			<el-menu mode="vertical" default-active="/" router>
				<el-menu-item :key="item" v-for="(item,index) in menu" :index="item.url" @click="addToBookmark(item)" style="padding-left: 50px;"><i :class="item.icon"></i>{{item.message}}</el-menu-item>
			</el-menu>
		</el-col>
		<el-col :span="20" class="layout-content" id="layout">
			<layout-top></layout-top>
			<div class="bookmark">
				<div class="bookmark-left btns">
					<i class="el-icon-caret-left"></i>
				</div>
				<div class="bookmark-content">
					<ul class="bookmark-list">
						<router-link class="bookmark-item" active-class="is-active" :key="item" v-for="item in bookmark" tag="li" :to="item.url">{{ item.message }}<i class="icon el-icon-circle-close" @click.stop="removeFromBookmark(item)" v-if="item.url!=='/'"></i></router-link>
					</ul>
				</div>
				<div class="bookmark-right">
					<div class="bookmark-right-btns">
						<el-popover popper-class="bookmark-right-popover" ref="More" placement="bottom" width="200" trigger="click">
							<div class="popover-item" @click="closeOtherTabCard">关闭其他选项卡</div>
							<div class="popover-item" @click="closeAllTabCard">关闭全部选项卡</div>
						</el-popover>
						<div class="bookmark-more" v-popover:More>更多操作<i class="icon el-icon-caret-bottom"></i></div>
						<div class="bookmark-right-btn">
							<i class="el-icon-caret-right"></i> 
						</div>
					</div>
				</div>
			</div>
			<div class="wrapper">
				<transition name="fade" mode="out-in">
					<router-view></router-view>
				</transition>
			</div>
			<layout-bottom></layout-bottom>
		</el-col>
	</el-row>
</template>
<script>
import layoutTop from './Header';
import layoutBottom from './Footer';
export default {
	data() {
		return {
			menu: [
				{ message: '首页', url: '/', icon: 'iconfont icon-shouye' },
				{ message: '项目管理', url: '/project', icon: 'iconfont icon-xiangmuguanli' },
				{ message: '考勤报表', url: '/attend', icon: 'iconfont icon-form' },
				{ message: '工人资料', url: '/worker', icon: 'iconfont icon-iconfontziliao' },
				{ message: '安全培训', url: '/safety', icon: 'iconfont icon-peixun' },
				{ message: '合同管理', url: '/contract', icon: 'iconfont icon-icon04' },
				{ message: '薪资管理', url: '/payroll', icon: 'iconfont icon-xinzi' },
				{ message: '部门管理', url: '/organizal', icon: 'iconfont icon-zuzhi' },
				{ message: '黑名单', url: '/blacklist', icon: 'iconfont icon-heimingdan' },
				{ message: '发布公告', url: '/publish', icon: 'iconfont icon-gonggao' },
				{ message: '设置', url: '/setting', icon: 'el-icon-setting' }
			],
			bookmark: [
				{ message: '首页', url: '/' }
			]
		}
	},
	created() {
		let menu = this.menu;
		let mark = this.bookmark;
		let uri = this.$route.fullPath;
		for( let i = 0; i < menu.length; i++ ) {
			if( menu[i].url == uri && uri !== '/' ) mark.push(menu[i])
		}
	},
	methods: {
		addToBookmark(item) {
			let mark = this.bookmark;
			for( let i = 0; i < mark.length; i++ ) {
				if( mark[i].message == item.message || mark[i].url == item.url ) return;
			}
			mark.push(item);
		},
		removeFromBookmark(item) {
			this.bookmark.splice(this.bookmark.indexOf(item),1);
			let url = this.bookmark[this.bookmark.length-1].url;
			this.$router.push(url);
		},
		closeAllTabCard() {
			this.bookmark = [{ message: '首页', url: '/' }];
			this.$router.push('/');
		},
		closeOtherTabCard() {
			let self = this;
			let menu = this.menu;
			let mark = this.bookmark;
			let uri = this.$route.fullPath;
			for( let i = 0; i < menu.length; i++ ) {
				if( menu[i].url == uri && uri !== '/' ) {
					self.bookmark = [{ message: '首页', url: '/' }];
					self.bookmark.push(menu[i]);
				}
			}
		}
	},
	components: {
		layoutTop, layoutBottom
	}
}
</script>
<style scoped>
.layout {
	height: 100%;
}
.wrapper {
	padding: 30px;
	padding-bottom: 70px;
	background-color: #e8ecf1;
}
.sidebar {
	position: fixed;
	overflow-y: scroll;
	max-width: 220px;
	height: 100%;
	background-color: #3a99f2;
}
.brand {
	padding: 32px 0 40px;
	text-align: center;
}
.brand .txt {
	display: block;
	padding-top: 10px;
	color: #fff;
}
.sidebar .el-menu {
	padding-bottom: 40px;
	background-color: #3a99f2;
	color: #fff;
}
.sidebar .el-menu-item, .sidebar .el-menu-item.is-active {
	color: #fff;
}
.sidebar .el-menu-item.is-active {
	background-color: #3387d6;
}
.menu {
	padding-bottom: 40px;
}
.iconfont {
	margin-right: 6px;
	font-size: 14px;
}
.layout-content {
	width: calc( 100% - 220px );
	min-width: 83.33333%;
	height: 100%;
}
.bookmark {
	position: relative;
	height: 46px;
	line-height: 46px;
	font-size: 16px;
	background-color: #f5fafe;
}
.bookmark-left {
	position: absolute;
	top: 0;
	left: 0;
	width: 40px;
	height: 44px;
	text-align: center;
	background-color: #fff;
	color: #999;
	border: 1px solid #dfe6ec;
}
.bookmark-right {
	position: absolute;
	top: 0;
	right: 0;
	width: 160px;
	height: 46px;
	background-color: #fff;
	color: #999;
}
.bookmark-right-btns {
	height: 46px;
	font-size: 0;
}
.bookmark-right-btns .bookmark-more {
	display: inline-block;
	vertical-align: top;
	width: 118px;
	height: 44px;
	font-size: 14px;
	text-align: center;
	border: 1px solid #dfe6ec;
	cursor: pointer;
}
.bookmark-right-btns .bookmark-more:hover, .bookmark-right-btns .bookmark-more:focus {
	position: relative;
	z-index: 4;
	border-color: #dfe6ec;
	color: #3a99f2;
}
.bookmark-right-btns .bookmark-more .icon {
	padding-left: 4px;
}
.bookmark-right-btns .bookmark-right-btn {
	display: inline-block;
	width: 39px;
	height: 44px;
	margin-left: -1px;
	font-size: 14px;
	border: 1px solid #dfe6ec;
	text-align: center;
}
.bookmark-right-popover .popover-item {
	height: 40px;
	line-height: 40px;
	font-size: 14px;
	text-align: center;
	cursor: pointer;
}
.bookmark-right-popover .popover-item:hover {
	background-color: #e4e8f1;
}
.bookmark-content ul, .bookmark-content li {
	list-style: none;
}
.bookmark-content {
	width: calc(100% - 42px);
	overflow: hidden;
	padding-left: 42px;
}
.bookmark-list{
	height: 46px;
	font-size: 0;
}
.bookmark-item {
	position: relative;
	display: inline-block;
	height: 44px;
	margin-left: -1px;
	padding: 0 20px;
	padding-right: 40px;
	border: 1px solid #dfe6ec;
	color: #978abe;
	font-size: 14px;
	cursor: pointer;
}
.bookmark-item .icon {
	position: absolute;
	top: 16px;
	right: 16px;
	font-size: 14px;
}
.bookmark-item:hover, .bookmark-item.router-link-exact-active.is-active {
	background-color: #3a99f2;
	border-color: #3a99f2;
	color: #fefefe;
}
.bookmark-item:first-child {
	width: 58px;
	padding: 0;
	background-color: #fff;
	text-align: center;
	border: 1px solid #dfe6ec;
}
.bookmark-item:first-child:hover {
	background-color: #3a99f2;
	border-color: #3a99f2;
	color: #fff;
}
</style>