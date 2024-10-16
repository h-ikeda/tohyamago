import PublicNotices from './views/PublicNotices.vue'
import Articles from './views/Articles.vue'
import Purpose from './views/Purpose.vue'

export default [{
  path: '/public_notices',
  component: PublicNotices,
}, {
  path: '/articles',
  component: Articles,
}, {
  path: '/purpose',
  component: Purpose,
}]
