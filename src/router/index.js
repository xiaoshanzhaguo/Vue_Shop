import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../components/Login"
import Home from "../components/Home"
import Welcome from "../components/Welcome";

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login'},
  { path: '/login', component: Login },
  { path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{path: '/welcome', component: Welcome}]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next() 放行  next('/login') 强制跳转

  if (to.path == '/login') return next();   // 如果访问的是登录页，直接放行
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 这里的return是终止运行的意思？
  if (!tokenStr) return next('/login')
  next()
})

export default router
