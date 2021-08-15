<template>
	<div>
		<!-- 面包屑导航区 -->
		<el-breadcrumb separator="/">
			<!-- 下面的/home是按需修改的 -->
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 搜索与添加区域 -->
			<el-row :gutter="20">
				<el-col :span="9">
					<el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
						<el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary">添加用户</el-button>
				</el-col>
			</el-row>

			<!-- 用户列表区域	-->
			<!--	下面是指定数据源 -->
			<el-table :data="userlist" border stripe>
				<el-table-column type="index"></el-table-column>
				<el-table-column label="姓名" prop="username"></el-table-column>
				<el-table-column label="邮箱" prop="email"></el-table-column>
				<el-table-column label="电话" prop="mobile"></el-table-column>
				<el-table-column label="角色" prop="role_name"></el-table-column>
				<el-table-column label="状态">
					<template v-slot="scope">
						<!--{{scope.row}}-->
						<el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
					</template>
				</el-table-column>
				<!-- 这里prop没有具体的数据源，因此把它删掉 -->
				<el-table-column label="操作" width="180px">
					<template v-slot="scope">
						<!-- 修改按钮 -->
						<el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
						<!-- 删除按钮 -->
						<el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
						<!-- 分配角色按钮 -->
						<el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
							<el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>

			<!-- 分页区域 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
					:current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
					layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</el-card>
	</div>
</template>

<script>
export default {
	name: "Users",
	data() {
		return {
			// 获取用户列表的参数列表
			queryInfo: {
				query: '',
				// 当前的页数
				pagenum: 1,
				// 当前每页显示多少条数据
				pagesize: 2
			},
			userlist: [],
			total: 0
		}
	},
	created() {
		this.getUserList()
	},
	methods: {
		async getUserList() {
			// 第一个参数：path地址，第二个参数：对象，一些参数
			// 下面的get请求会返回一个Promise对象，用async和await来优化这次异步操作
			// 既然使用了await，就会得到一个数据对象
			const { data: res} = await this.$http.get('users', {params: this.queryInfo})
			if (res.meta.status != 200) {
				return this.$message.error('获取用户列表失败！')
			}
			this.userlist = res.data.users
			this.total = res.data.total
			console.log(res);
		},
		// 监听 pagesize 改变的事件
		handleSizeChange(newSize) {
			// console.log(newSize);
			this.queryInfo.pagesize = newSize
			this.getUserList()
		},
		// 监听 页码值 改变的事件
		handleCurrentChange(newPage) {
			// console.log(newPage);
			this.queryInfo.pagenum = newPage
			this.getUserList()
		},
		// 监听 switch 开关状态的改变
		async userStateChanged(userinfo) {
			// console.log(userinfo);
			// 下面修改成模板字符串-反引号
			// 下面结构出一个data数据，重命名为res
			const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
			if (res.meta.status !== 200) {
				// 修改失败时，还需要再把数据修改回去
				userinfo.mg_state = !userinfo.mg_state
				return this.$message.error('更新用户状态失败！')
			}
			// 提示更新成功！
			this.$message.success('更新用户状态成功！')
		}
	}
}
</script>

<style scoped>

</style>