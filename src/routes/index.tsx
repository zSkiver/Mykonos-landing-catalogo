import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { SiteLayout } from '@/layouts/SiteLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// A home entra no bundle inicial; o resto é dividido por rota.
import Home from '@/pages/Home';

const Catalog = lazy(() => import('@/pages/Catalog'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));
const Offers = lazy(() => import('@/pages/Offers'));
const About = lazy(() => import('@/pages/About'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const Login = lazy(() => import('@/pages/admin/Login'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const ProductsAdmin = lazy(() => import('@/pages/admin/ProductsAdmin'));
const ProductEditor = lazy(() => import('@/pages/admin/ProductEditor'));
const OffersAdmin = lazy(() => import('@/pages/admin/OffersAdmin'));
const CategoriesAdmin = lazy(() => import('@/pages/admin/CategoriesAdmin'));
const BrandsAdmin = lazy(() => import('@/pages/admin/BrandsAdmin'));
const SettingsAdmin = lazy(() => import('@/pages/admin/SettingsAdmin'));
const UsersAdmin = lazy(() => import('@/pages/admin/UsersAdmin'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'catalogo', element: <Catalog /> },
      { path: 'catalogo/:categoria', element: <Catalog /> },
      { path: 'produto/:slug', element: <ProductPage /> },
      { path: 'ofertas', element: <Offers /> },
      { path: 'sobre', element: <About /> },
      { path: 'contato', element: <ContactPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/admin/login', element: <Login /> },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'produtos', element: <ProductsAdmin /> },
      {
        path: 'ofertas',
        element: (
          <ProtectedRoute require="canManageOffers">
            <OffersAdmin />
          </ProtectedRoute>
        ),
      },
      {
        path: 'produtos/novo',
        element: (
          <ProtectedRoute require="canCreateProduct">
            <ProductEditor />
          </ProtectedRoute>
        ),
      },
      {
        path: 'produtos/:id',
        element: (
          <ProtectedRoute require="canEditProduct">
            <ProductEditor />
          </ProtectedRoute>
        ),
      },
      {
        path: 'categorias',
        element: (
          <ProtectedRoute require="canManageCategories">
            <CategoriesAdmin />
          </ProtectedRoute>
        ),
      },
      {
        path: 'marcas',
        element: (
          <ProtectedRoute require="canManageBrands">
            <BrandsAdmin />
          </ProtectedRoute>
        ),
      },
      {
        path: 'configuracoes',
        element: (
          <ProtectedRoute require="canManageContent">
            <SettingsAdmin />
          </ProtectedRoute>
        ),
      },
      {
        path: 'usuarios',
        element: (
          <ProtectedRoute require="canManageUsers">
            <UsersAdmin />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
