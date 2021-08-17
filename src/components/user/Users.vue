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
					<el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
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
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
						<!-- 删除按钮 -->
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
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

		<!-- 添加用户的对话框 -->
		<el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
			<!-- 内容主体区域 -->
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
				<!-- 下面的prop是验证规则的属性，这里的prop是加在el-form-item上 -->
				<el-form-item label="用户名" prop="username">
					<!-- 绑定到表单的数据项上 -->
					<el-input v-model="addForm.username"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input v-model="addForm.password"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<!-- 绑定到表单的数据项上 -->
					<el-input v-model="addForm.email"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="mobile">
					<!-- 绑定到表单的数据项上 -->
					<el-input v-model="addForm.mobile"></el-input>
				</el-form-item>
			</el-form>
			<!-- 底部区域 -->
			<span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
		</el-dialog>

		<!-- 修改用户对话框	-->
		<el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%">
			<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
				<!-- 这里的用户名没有校验规则，所以去掉prop -->
				<el-form-item label="用户名">
					<el-input v-model="editForm.username" disabled></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editForm.email"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="mobile">
					<el-input v-model="editForm.mobile"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: "Users",
	data() {
		// 验证邮箱的规则
		var checkEmail = (rule, value, cb) => {
			// 验证邮箱的正则表达式
			const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

			if (regEmail.test(value)) {
				// 合法的邮箱
				return cb()
			}
			// 这里cb是个回调函数
			cb(new Error('请输入合法的邮箱'))
		}

		// 验证手机号的规则
		var checkMobile = (rule, value, cb) => {
			// 验证手机号的正则表达式
			const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

			if(regMobile.test(value)) {
				return cb()
			}
			cb(new Error('请输入合法的手机号'))
		}

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
			total: 0,
			// 控制添加用户对话框的显示与隐藏
			addDialogVisible: false,
			// 添加用户的表单数据
			addForm: {
				username: '',
				password: '',
				email: '',
				mobile: ''
			},
			// 添加表单的验证规则对象
			addFormRules: {
				username: [
						// trigger: 触发时机：当失去焦点时
					{required: true, message: '请输入用户名', trigger: 'blur'},
					{min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur'}
				],
				password: [
					{required: true, message: '请输入密码', trigger: 'blur'},
					{min: 6, max: 15, message: '用户名的长度在6~15个字符之间', trigger: 'blur'}
				],
				email: [
					{required: true, message: '请输入邮箱', trigger: 'blur'},
					{validator: checkEmail, trigger: 'blur'}
				],
				mobile: [
					{required: true, message: '请输入手机号', trigger: 'blur'},
					{validator: checkMobile, trigger: 'blur'}
				]
			},
			// 控制修改用户对话框的显示与隐藏
			editDialogVisible: false,
			// 查询到的用户信息对象
			editForm: {},
			// 修改表单的验证规则对象
			editFormRules: {
				email: [
					{required: true, message: '请输入用户邮箱', trigger: 'blur'},
					{validator: checkEmail, trigger: 'blur'}
				],
				mobile: [
					{required: true, message: '请输入用户手机号', trigger: 'blur'},
					{validator: checkMobile, trigger: 'blur'}
				]
			}
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
			const {data: res} = await this.$http.get('users', {params: this.queryInfo})
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
		},
		// 监听添加用户对话框的关闭事件
		addDialogClosed() {
			this.$refs.addFormRef.resetFields()
		},
		// 点击按钮，添加新用户
		addUser() {
			this.$refs.addFormRef.validate(async valid => {
				// console.log(valid);
				if (!valid) return
				// 可以发起添加用户的网络请求
				const { data: res} = await this.$http.post('users', this.addForm)

				if (res.meta.status !== 201) {
					this.$message.error('添加用户失败！')
				}
				this.$message.success('添加用户成功！')
				// 隐藏添加用户的对话框
				this.addDialogVisible = false
				// 重新获取用户列表数据
				await this.getUserList()
 			})
		},
		// 展示编辑用户的对话框
		async showEditDialog(id) {
			// console.log(id);
			// 下面把:去掉，因为是动态数据值，后面应该用字符串拼接
			// 通过解构赋值的形式将data解构出来，重命名为res
			const { data: res} = await this.$http.get('users/' + id)

			if (res.meta.status !== 200) {
				return this.$message.error('修改用户信息失败！')
			}
			this.editForm = res.data
			this.editDialogVisible = true
		},
		// 修改用户信息并提交
		editUserInfo() {
			this.$refs.editFormRef.validate(async valid => {
				// console.log(valid);
				if (!valid) return
				// 发起修改用户信息的数据请求，并且下面的put请求是根据API文档来写的
				const { data: res} = await this.$http.put('users/' + this.editForm.id, {
					email: this.editForm.email,
					mobile: this.editForm.mobile
				})
				if (res.meta.status !== 200) {
					this.$message.error('更新用户信息失败！')
				}

				// 更新成功后，需要关闭对话框
				this.editDialogVisible = false
				// 刷新列表数据
				await this.getUserList()
				// 提示修改成功
				this.$message.success('更新用户信息成功！')
			})
		},
		// 根据Id删除对应的用户信息
		async removeUserById(id) {
			// console.log(id);
			// 弹框询问用户是否删除数据
			const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示',
					{ // 下面是配置文本
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			// 如果用户确认删除，则返回的字符串 confirm
			// 如果用户取消了删除，则返回值为字符串 cancel
			// console.log(confirmResult);

			if (confirmResult !== 'confirm') {
				// 注意这里要return
				return this.$message.info('已取消删除')
			}
			// console.log('确认了删除');
			const {data: res} = await this.$http.delete('users/' + id)

			if (res.meta.status !== 200) {
				return this.$message.error('删除用户失败！')
			}

			this.$message.success('删除用户成功')
			// 删除成功后，还要重新获取列表数据
			await this.getUserList()
		}
	}
}
</script>

<style scoped>

</style>