<template>
  <div class="footer">
		&copy; 2015-{{ years }} <span class="link">鲁班长（深圳）科技有限公司</span>
	</div>
</template>
<script>
export default {
	data() {
		let years = new Date().getFullYear();
		return {
			years: years
		}
	}
}
</script>
<style scoped>
	.footer {
		position: fixed;
		bottom: 0;
		z-index: 1999;
		width: calc( 100% - 220px );
		height: 34px;
		line-height: 34px;
		background-color: #fff;
		font-size: 12px;
		color: #333;
		text-align: center;
	}
	.link {
		color: #61a9f4;
	}
</style>
