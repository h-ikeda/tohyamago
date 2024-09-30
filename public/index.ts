import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './routes'

const history = createWebHistory()
createApp(App).use(createRouter({ history, routes })).mount(document.body)
