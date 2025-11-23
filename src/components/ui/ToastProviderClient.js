// src/components/ui/ToastProviderClient.js
"use client";

import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProviderClient() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      draggable
      pauseOnHover
      pauseOnFocusLoss
      transition={Slide}
      theme="dark"
      toastClassName={() =>
        "rounded-xl shadow-md text-white font-medium px-4 py-3 border border-white/20"
      }
      bodyClassName={() => "text-sm font-medium"}
      style={{
        paddingTop: "70px",
        paddingRight: "15px",
        paddingLeft: "15px",
        zIndex: 999999,
      }}
    />
  );
}
