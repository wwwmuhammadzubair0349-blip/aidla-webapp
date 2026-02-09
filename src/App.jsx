import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";

import RequireAuth from "./Components/RequireAuth";
import RequireAdmin from "./Components/Requireadmin";

import Home from "./pages/home";
import About from "./pages/about";
import Blogs from "./pages/blogs";
import BlogPost from "./pages/BlogPost";
import News from "./pages/News";
import NewsPost from "./pages/NewsPost"; // ✅ NEW
import FAQs from "./pages/FAQs";
import Contact from "./pages/Contact";

import Signup from "./pages/signup";
import Login from "./pages/login";

import Dashboard from "./pages/Dashboard";
import ChooseSide from "./pages/ChooseSide";

import AdminDashboard from "./pages/AdminDashboard";
import AdminBlogs from "./pages/adminblogs";
import HomeManager from "./pages/admin/HomeManager";
import AdminShopManagement from "./pages/admin/AdminShopManagement";
import AdminPurchaseRequests from "./pages/admin/adminpurchaserequests";
import AdminInquiries from "./pages/admin/admininquiries";
import AdminNewsManager from "./pages/admin/AdminNewsManager"; // ✅ NEW

import Shop from "./pages/shop/shop";
import Cart from "./pages/shop/cart";
import Purchase from "./pages/shop/purchase";
import ShopHistory from "./pages/shop/shophistory";

import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />

        <Route path="/about" element={<About />} />

        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:slug" element={<BlogPost />} />

        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsPost />} /> {/* ✅ NEW */}

        <Route path="/faqs" element={<FAQs />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* User Protected */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/choose-side"
          element={
            <RequireAuth>
              <ChooseSide />
            </RequireAuth>
          }
        />
        <Route
          path="/shop"
          element={
            <RequireAuth>
              <Shop />
            </RequireAuth>
          }
        />
        <Route
          path="/cart"
          element={
            <RequireAuth>
              <Cart />
            </RequireAuth>
          }
        />
        <Route
          path="/purchase"
          element={
            <RequireAuth>
              <Purchase />
            </RequireAuth>
          }
        />
        <Route
          path="/shop-history"
          element={
            <RequireAuth>
              <ShopHistory />
            </RequireAuth>
          }
        />

        {/* Admin Protected */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/blogs"
          element={
            <RequireAdmin>
              <AdminBlogs />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/homemanager"
          element={
            <RequireAdmin>
              <HomeManager />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/inquiries"
          element={
            <RequireAdmin>
              <AdminInquiries />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/news"
          element={
            <RequireAdmin>
              <AdminNewsManager />
            </RequireAdmin>
          }
        /> {/* ✅ NEW */}

        <Route
          path="/admin/shop"
          element={
            <RequireAdmin>
              <AdminShopManagement />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/purchases"
          element={
            <RequireAdmin>
              <AdminPurchaseRequests />
            </RequireAdmin>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
