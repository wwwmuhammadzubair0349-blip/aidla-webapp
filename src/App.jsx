import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "../Components/Layout";

import RequireAuth from "../src/Components/RequireAuth";
import RequireAdmin from "../src/Components/Requireadmin";

import Home from "../src/pages/home";
import About from "../src/pages/about";
import Blogs from "../src/pages/blogs";
import BlogPost from "../src/pages/BlogPost";
import News from "../src/pages/News";
import NewsPost from "../src/pages/NewsPost"; // ✅ NEW
import FAQs from "../src/pages/FAQs";
import Contact from "../src/pages/Contact";

import Signup from "../src/pages/signup";
import Login from "../src/pages/login";

import Dashboard from "../src/pages/Dashboard";
import ChooseSide from "../src/pages/ChooseSide";

import AdminDashboard from "../src/pages/AdminDashboard";
import AdminBlogs from "../src/pages/adminblogs";
import HomeManager from "../src/pages/admin/HomeManager";
import AdminShopManagement from "../src/pages/admin/AdminShopManagement";
import AdminPurchaseRequests from "../src/pages/admin/adminpurchaserequests";
import AdminInquiries from "../src/pages/admin/admininquiries";
import AdminNewsManager from "../src/pages/admin/AdminNewsManager"; // ✅ NEW

import Shop from "../src/pages/shop/shop";
import Cart from "../src/pages/shop/cart";
import Purchase from "../src/pages/shop/purchase";
import ShopHistory from "../src/pages/shop/shophistory";

import NotFound from "../src/pages/NotFound";

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
