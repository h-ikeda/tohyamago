import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes, { setTitle } from './routes'

const history = createWebHistory()
const router = createRouter({ history, routes })
router.afterEach(setTitle)

createApp(App).use(router).mount(document.body)
