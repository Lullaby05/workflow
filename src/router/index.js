import { createRouter, createWebHashHistory } from 'vue-router';

const viewport = {
  content: 'width=device-width, initial-scale=1.0, user-scalable=no',
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/workspace',
    },
    {
      path: '/workspace',
      name: 'workspace',
      component: () => import('@/views/workspace/WorkSpace.vue'),
      children: [
        {
          path: 'forms',
          name: 'forms',
          component: () => import('@/views/workspace/oa/FromsApp.vue'),
          meta: { title: 'wflow-pro | OA审批', viewport: viewport },
        },
        {
          path: 'submit',
          name: 'submit',
          component: () => import('@/views/workspace/oa/MySubmit.vue'),
          meta: { title: 'wflow-pro | 我发起的', viewport: viewport },
        },
        {
          path: 'cc',
          name: 'cc',
          component: () => import('@/views/workspace/oa/CcMe.vue'),
          meta: { title: 'wflow-pro | 抄送我的', viewport: viewport },
        },
        {
          path: 'unfinished',
          name: 'unfinished',
          component: () => import('@/views/workspace/oa/UnFinished.vue'),
          meta: { title: 'wflow-pro | 未完成的', viewport: viewport },
        },
        {
          path: 'unfinishedForOperation',
          name: 'unfinishedForOperation',
          component: () =>
            import('@/views/workspace/oa/unfinishedForOperation.vue'),
          meta: { title: 'wflow-pro | 未完成的', viewport: viewport },
        },
        {
          path: 'finished',
          name: 'finished',
          component: () => import('@/views/workspace/oa/Finished.vue'),
          meta: { title: 'wflow-pro | 未完成的', viewport: viewport },
        },
        {
          path: 'instances',
          name: 'instances',
          component: () => import('@/views/admin/ProcessInstanceManage.vue'),
          meta: { title: 'wflow-pro | 数据管理', viewport: viewport },
        },
        {
          path: 'formsPanel',
          name: 'formsPanel',
          component: () => import('@/views/admin/FormsPanel.vue'),
          meta: { title: 'wflow-pro | 表单列表', viewport: viewport },
        },
        {
          path: 'formsPanelForOperation',
          name: 'formsPanelForOperation',
          component: () =>
            import('@/views/admin/forOperation/formsPanelForOperation.vue'),
          meta: { title: 'wflow-pro | 表单列表', viewport: viewport },
        },
      ],
    },
    {
      path: '/mbinitiate',
      name: 'mbinitiate',
      component: () => import('@/views/workspace/MbInitiateProcess.vue'),
      meta: { title: 'wflow-pro | 发起审批', viewport: viewport },
    },
    {
      path: '/mbInstance',
      name: 'mbInstance',
      component: () => import('@/views/workspace/MbInstanceViewer.vue'),
      meta: { title: 'wflow-pro | 流程详情', viewport: viewport },
    },
    {
      path: '/admin/design',
      name: 'design',
      component: () => import('@/views/admin/FormProcessDesign.vue'),
      meta: { title: 'wflow-pro | 表单流程设计', viewport: viewport },
    },
    {
      path: '/admin/designForOperation',
      name: 'designForOperation',
      component: () =>
        import('@/views/admin/forOperation/FormProcessDesign.vue'),
      meta: { title: 'wflow-pro | 表单流程设计', viewport: viewport },
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  if (to.meta.content) {
    let head = document.getElementByTagName('head');
    let meta = document.createElemnet('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
    head[0].appendChild(meta);
  }
  next();
  sessionStorage.setItem('router-path', to.path);
});

export default router;
