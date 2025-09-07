import Home from './views/Home.vue';

export function setTitle(to, from) {
  let { title } = to.meta
  if (!title) title = '一般社団法人遠山郷応援会'
  else title += ' | 一般社団法人遠山郷応援会'
  document.title = title
}

export default [{
  path: '/',
  component: Home,
  props: route => ({ hash: route.hash })
}, {
  path: '/public_notices',
  component: () => import('./views/PublicNotices.vue'),
  meta: {
    title: '公告',
  },
}, {
  path: '/articles',
  component: () => import('./views/Articles.vue'),
  meta: {
    fullscreen: true,
    title: '定款',
  },
}, {
  path: '/purpose',
  component: () => import('./views/Purpose.vue'),
  meta: {
    title: '活動趣旨',
  },
}, {
  path: '/notation',
  component: () => import('./views/Notation.vue'),
  meta: {
    title: '特定商取引法に基づく表記',
  },
}, {
  path: '/membership',
  component: () => import('./views/Membership.vue'),
  meta: {
    title: '入会案内',
  },
}]
