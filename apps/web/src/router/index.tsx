import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Home } from "../pages/Home";
import { Chat } from "../pages/Chat";
import { Products } from "../pages/Products";
import { ProductDetail } from "../pages/ProductDetail";
import { Compare } from "../pages/Compare";
import { Cart } from "../pages/Cart";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "chat/:conversationId?", element: <Chat /> },
      { path: "products", element: <Products /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "compare", element: <Compare /> },
      { path: "cart", element: <Cart /> },
    ],
  },
]);
