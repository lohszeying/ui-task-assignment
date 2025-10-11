import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import App from './App'
import {CreateTaskPage} from './pages/CreateTaskPage'
import {Homepage} from './pages/Homepage'

const rootRoute = createRootRoute({
  component: App,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Homepage,
})

const createTaskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'tasks/new',
  component: CreateTaskPage,
})

const routeTree = rootRoute.addChildren([homeRoute, createTaskRoute])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
