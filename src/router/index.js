import {createRouter, createWebHistory} from "vue-router"
import TaskManager from "../views/TaskManagerView.vue"

const routes = [
  {
    path: "/",
    name: "TaskManager",
    component: TaskManager
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: () => import("../views/Calendar.vue"),
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
