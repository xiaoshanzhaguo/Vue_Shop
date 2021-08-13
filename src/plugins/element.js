import Vue from 'vue'
// import { Button } from 'element-ui'
// import { Form, FormItem,} from "element-ui";
// import {Input} from "element-ui";
// // 导入弹框提示组件(它需要进行全局挂载)
// import {Message} from "element-ui";

import {
    Button,
    Form,
    FormItem,
    Input,
    Message,
    Container,
    Header,
    Aside,
    Main,
    Menu,
    Submenu,
    MenuItem
} from 'element-ui'

// 注册为全局组件
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
