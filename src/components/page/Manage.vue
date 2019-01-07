<template>
  <div class="manage">
  	<el-row class="sum" :gutter="20">
  		<el-col :span="6">
  			<div class="left-sum one">
  				<i class="iconfont icon-jinlingyingcaiwangtubiao47"></i>
  			</div>
  			<div class="right-sum">
  				<span class="num">{{top.one}}</span>
  				<span>在建项目（个）</span>
  			</div>
  		</el-col>
  		<el-col :span="6">
  			<div class="left-sum two">
  				<i class="iconfont icon-renshu"></i>
  			</div>
  			<div class="right-sum">
  				<span class="num">{{top.two}}</span>
  				<span>在建项目工人总数（人）</span>
  			</div>
  		</el-col>
  		<el-col :span="6">
  			<div class="left-sum three">
  				<i class="iconfont icon-iconfontziliao"></i>
  			</div>
  			<div class="right-sum">
  				<span class="num">{{top.three}}</span>
  				<span>今日考勤人数（人）</span>
  			</div>
  		</el-col>
  		<el-col :span="6">
  			<div class="left-sum four">
  				<i class="iconfont icon-tongji"></i>
  			</div>
  			<div class="right-sum">
  				<span class="num">{{top.four}}</span>
  				<span>今日考勤异常人数（人）</span>
  			</div>
  		</el-col>
  	</el-row>
  	<el-row class="chart" :gutter="20">
  		<el-col :span="6">
  			<div class="chart-item">
  				<div class="chart-title">总项目情况</div>
					<div id="left" style="width: 100%;height: 80%;"></div>
  			</div>
  		</el-col>
  		<el-col :span="18">
  			<div class="chart-item">
  				<div class="chart-title">{{timer}}</div>
					<div id="right" style="width:96%;height: 80%;margin:auto;"></div>
  			</div>
  		</el-col>
  	</el-row>
  	<el-row class="showData" :gutter="20">
  		<el-col :span="12">
  			<div class="showData-wrapper">
  				<div class="showData-header">
  					<span class="showData-span">项目</span>
  					<el-select v-model="showData.left.val" @change="checkData">
  						<el-option v-for="item in leftData" :key="item" :value="item.id" :label="item.name"></el-option>
  					</el-select>
  				</div>
  				<div class="showData-content">
  					<div class="showData-info">
  						<el-progress type="circle" :show-text="false" :percentage="100"></el-progress>
  						<span class="showData-number">{{ showData.left.project }}</span>
  						<p>项目总人数（人）</p>
  					</div>
  					<div class="showData-info">
  						<el-progress type="circle" :show-text="false" :percentage="0"></el-progress>
  						<span class="showData-number">{{ showData.left.out }}</span>
  						<p>已离场人数（人）</p>
  					</div>
  				</div>
  			</div>
  		</el-col>
  		<el-col :span="12">
  			<div class="showData-wrapper">
  				<div class="showData-header">
  					<span class="showData-span">项目</span>
  					<el-select v-model="showData.right.val" @change="inprojectSearch">
  						<el-option v-for="item in rightData" :key="item" :value="item.id" :label="item.name"></el-option>
  					</el-select>
  					<span class="showData-span">日期</span>
  					<el-date-picker v-model="showData.right.time" @change="inprojectSearch" type="date" placeholder="选择日期"></el-date-picker>
  				</div>
  				<div class="showData-content" style="font-size: 0;">
  					<div class="showData-metro" style="background-color: #399bf3;">
  						<span class="showData-data">{{ showData.right.normal }}</span>
  						<p>该天考勤人数（人）</p>
  					</div>
  					<div class="showData-metro" style="background-color: #f15539;">
  						<span class="showData-data">{{ showData.right.error }}</span>
  						<p>该天考勤异常人数（人）</p>
  					</div>
  				</div>
  			</div>
  		</el-col>
  	</el-row>
  </div>
</template>
<script>
import api from '../script/api.js';
import chart from 'echarts';
export default {
	data() {
		return {
			top: { one: '0', two: '0', three: '0', four: '0' },
			timer: '',
			leftData: [],
			rightData: [],
			timeData: [],
			showData: {
				left: { val: "", project: 0, out: 0 },
				right: { val: "", normal: 0, error: 0, time: '' }
			}
		}
	},
	created() {
		let self = this;
		let time;
		let projectSum = 0; let peopleSum = 0; let todaySum = 0; let errorSum = 0;
		$.ajax({ url: api.manageData, type: 'GET', xhrFields: { withCredentials: true } }).done((res) => {
			let doing = res.data.inproject;
			for( let i = 0; i < doing.length; i++ ) {
				if( doing[i].attend ) {
					todaySum += doing[i].attend.count;
					errorSum += doing[i].attend.fail;
				}
				peopleSum += doing[i].sumNum;
				projectSum = i + 1;
			}
			self.top.one = projectSum;
			self.top.two = peopleSum;
			self.top.three = todaySum;
			self.top.four = errorSum;
			self.leftData = self.rightData = doing;
			self.showData.left.val = self.showData.right.val = doing[0].name;
			self.showData.left.project = doing[0].sumNum;
			self.showData.left.out = doing[0].outNum;
			if( doing[0].attend ) {
				self.showData.right.normal = doing[0].attend.count;
				self.showData.right.error = doing[0].attend.fail;
			} else {
				self.showData.right.normal = self.showData.right.error = 0;
			}
		})
		self.timer = `${new Date().getFullYear()}年${new Date().getMonth()+1}月份项目整体出勤率`;
	},
	mounted() {
		let leftChart = chart.init(document.getElementById('left'));
		let rightChart = chart.init(document.getElementById('right'));
		function getMonthHasDay() {
			let years = new Date().getFullYear();
			let months = new Date().getMonth() + 1;
			let fate = new Date(years,months,0).getDate();
			let timeData = [];
			for( let i = 1; i <= fate; i ++ ) {
				timeData.push(i);
			}
			return timeData;
		}
		let timeData = getMonthHasDay();
		$.ajax({ url: api.manageData, type: 'GET', xhrFields: { withCredentials: true } }).done((res) => {
			let option = {
				tooltip : { trigger: 'item', formatter: "{b} : {c} ({d}%)" },
				legend: { x : 'center', y : 'bottom', data:['在建项目','已完成项目','未开始项目'] },
				color: ['#399bf3','#f1ce39','#dde4e9'],
				toolbox: { 
					show : true, 
					feature : {  
						mark : { show: true }, 
						dataView : { show: true, readOnly: false },
						magicType : { show: true, type: ['pie', 'funnel'] },
						restore : { show: true },
						saveAsImage : { show: true }
					}
				},
				calculable : true,
				series : [{
					name:'总项目情况',
					type:'pie',
					center : ['50%', '50%'],
					label: {
						normal: { show: true, formatter: '{c}', position: 'inside' },
						emphasis: { show: false }
					},
					lableLine: {
						normal: { show: false },
						emphasis: { show: false }
					},
					data:[
						{value:res.data.inproject.length, name:'在建项目'},
						{value:res.data.onproject.length, name:'已完成项目'},
						{value:res.data.atproject.length, name:'未开始项目'}
					]
				}]
			};
			let pushData = [];
			let nameData = [];
			for( let i = 0; i < res.data.inproject.length; i++ ) {
				let inprojectData = {
					name: res.data.inproject[i].name,
					type: 'line',
					data: res.data.inproject[i].rate
				}
				nameData.push(res.data.inproject[i].name);
				pushData.push(inprojectData);
			}
			let charts = {
				tooltip: { trigger: 'item', formatter: "{b}日<br/> 出勤率 {c}%" },
				legend: { data: nameData },
				toolbox: { 
					show: true,
					feature: {
						mark: { show: false },
						dataView: { show: true, readOnly: true },
						magicType: { show: true, type: ['line', 'bar'] },
						restore: { show: false },
						saveAsImage: { show: true }
					}
				},
				color: ['#399bf3','#f1ce39','#dde4e9','#f15539','#3ac1f3'],
				calculable: false,
				xAxis: [{ type: 'category', boundaryGap: false, data: timeData }],
				yAxis: [{ type: 'value', axisLabel: { formatter: '{value} %' } }],
				series: pushData
			};
			leftChart.setOption(option);
			rightChart.setOption(charts);
		})
	},
	methods: {
		checkData(value) {
			let self = this;
			let list = this.leftData;
			for( let i = 0; i < list.length; i++ ) {
				if( value == list[i].id ) {
					self.showData.left.project = list[i].sumNum;
					self.showData.left.out = list[i].outNum;
				}
			}
		},
		inprojectSearch() {
			let self = this;
			let value = this.showData.right.val;
			let timer = this.showData.right.time;
			let year, month, day
			if(timer == '') {
				year = new Date().getFullYear();
				month = new Date().getMonth() + 1 > 10 ? new Date().getMonth() + 1 : '0' + (new Date().getMonth() + 1);
				day = new Date().getDate() > 10 ? new Date().getDate() : '0' + new Date().getDate();
			} else {
				year = new Date(timer).getFullYear();
				month = new Date(timer).getMonth() + 1 > 10 ? new Date(timer).getMonth() + 1 : '0' + (new Date(timer).getMonth() + 1);
				day = new Date(timer).getDate() > 10 ? new Date(timer).getDate() : '0' + new Date(timer).getDate();
			};
			let fate = `${year}-${month}-${day}`;
			$.ajax({ url: api.manageData, type: 'POST', data: { Id: value, Passwd: fate }, xhrFields: { withCredentials: true } }).done((res) => {
				if( res.data[0] ) {
					self.showData.right.normal = res.data[0].count;
					self.showData.right.error = res.data[0].fail;
				} else {
					self.showData.right.normal = self.showData.right.error = 0;
				}
			})
		}
	}
}
</script>
<style scoped>
.sum {
	margin-bottom: 30px;
}
.sum .left-sum, .sum .right-sum {
	float: left;
	height: 100px;
	text-align: center;
	background-color: #fff;
}
.sum .left-sum {
	width: 40%;
	line-height: 100px;
	color: #fff;
}
.sum .left-sum.one {
	background-color: #399bf3;
}
.sum .left-sum.two {
	background-color: #3ac1f3;
}
.sum .left-sum.three {
	background-color: #f1ce39;
}
.sum .left-sum.four {
	background-color: #f15539;
}
.left-sum .iconfont {
	font-size: 40px;
}
.sum .right-sum {
	width: 60%;
	color: #94a4b6;
}
.sum .right-sum span {
	display: block;
	font-size: 12px;
}
.sum .right-sum .num {
	font-size: 36px;
	line-height: 64px;
}
.sum:before, .sum:after {
	display: table;
	content: '';
}
.chart {
	margin-bottom: 30px;
}
.chart-item {
	height: 360px;
	background-color: #fff;
}
.chart-item .chart-title {
	font-size: 16px;
	padding-top: 20px;
	padding-bottom: 10px;
	text-align: center;
}
.showData-wrapper {
	background-color: #fff;
}
.showData-header {
	padding: 16px 0;
	text-align: center;
	background-color: #f4fbfe;
}
.showData-header .el-select, .showData-header .el-date-editor {
	width: 24%;
}
.showData-content {
	height: 270px;
	text-align: center;
}
.showData-span {
	padding: 0 12px;
	font-size: 14px;
}
.showData-info {
	position: relative;
	display: inline-block;
	padding: 50px 66px;
}
.showData-info .showData-number {
	position: absolute;
	top: 50px;
	left: 66px;
	display: block;
	width: 126px;
	height: 126px;
	text-align: center;
	line-height: 126px;
}
.showData-info p {
	font-size: 12px;
	line-height: 42px;
}
.showData-metro {
	display: inline-block;
	width: 40%;
	height: 170px;
	margin: 50px 4% 0 1%;
	text-align: left;
	color: #fff;
}
.showData-data {
	padding-left: 48px;
	font-size: 36px;
	line-height: 120px;
}
.showData-metro p {
	padding-left: 48px;
	font-size: 12px;
}
</style>
