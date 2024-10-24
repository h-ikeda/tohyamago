import Home from './views/Home.vue';

export default [{
  path: '/',
  component: Home,
}, {
  path: '/public_notices',
  component: () => import('./views/PublicNotices.vue'),
}, {
  path: '/articles',
  component: () => import('./views/Articles.vue'),
  meta: {
    fullscreen: true,
  },
}, {
  path: '/purpose',
  component: () => import('./views/Purpose.vue'),
}, {
  path: '/notation',
  component: () => import('./views/Notation.vue'),
}]
