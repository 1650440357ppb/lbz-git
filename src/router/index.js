// 引入依赖
import Vue from 'vue';
import Router from 'vue-router';
import webStorageCache from 'web-storage-cache';


// 引入组件
import Home from '@/components/page/Home';
import Manage from '@/components/page/Manage';
import Project from '@/components/page/Project';
import Attend from '@/components/page/Attend';
import Worker from '@/components/page/Worker';
import Safety from '@/components/page/Safety';
import Contract from '@/components/page/Contract';
import Payroll from '@/components/page/Payroll';
import Organizal from '@/components/page/Organizal';
import Blacklist from '@/components/page/Blacklist';
import Setting from '@/components/page/Setting';
import Publish from '@/components/page/Publish';
import Prove from '@/components/page/Prove';

import Login from '@/components/page/Login';
import Forget from '@/components/page/Forget';
import Register from '@/components/page/Register';

Vue.use(Router)

const router = new Router({
    routes: [
        { path: '/', name: '', component: Home, meta: { requireLogin: true },
            children: [
                { path: '/', name: 'Manage', component: Manage, meta: { requireLogin: true } },
                { path: 'project', name: 'Project', component: Project, meta: { requireLogin: true } },
                { path: 'attend', name: 'Attend', component: Attend, meta: { requireLogin: true } },
                { path: 'worker', name: 'Worker', component: Worker, meta: { requireLogin: true } },
                { path: 'safety', name: 'Safety', component: Safety, meta: { requireLogin: true } },
                { path: 'contract', name: 'Contract', component: Contract, meta: { requireLogin: true } },
                { path: 'payroll', name: 'Payroll', component: Payroll, meta: { requireLogin: true } },
                { path: 'organizal', name: 'Organizal', component: Organizal, meta: { requireLogin: true } },
                { path: 'blacklist', name: 'Blacklist', component: Blacklist, meta: { requireLogin: true } },
                { path: 'setting', name: 'Setting', component: Setting, meta: { requireLogin: true } },
                { path: 'publish', name: 'Publish', component: Publish, meta: { requireLogin: true } },
                { path: 'prove', name: 'Prove', component: Prove, meta: { requireLogin: true } }
            ]
        },
        { path: '/login', name: 'Login', component: Login },
        { path: '/register', name: 'Register', component: Register },
        { path: '/forget', name: 'Forget', component: Forget }
    ]
});

let wsCache = new webStorageCache();

// 设置路由拦截
router.beforeEach((to, from, next) => {
    if (to.meta.requireLogin) {
        let isAdmin = wsCache.get("_uid") || wsCache.get("_cid");
        if (isAdmin) {
            next();
        } else {
            next({
                path: '/login',
                query: {
                    redirect: to.fullPath
                }
            })
        }
    } else {
        next();
    }
 });

export default router;