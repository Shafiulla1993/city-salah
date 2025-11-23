// src/lib/toast.js
import { toast } from "react-toastify";

export const notify = {
  success: (msg, opts = {}) => toast.success(msg, { icon: "✔️", ...opts }),
  error:   (msg, opts = {}) => toast.error(msg, { icon: "❌", ...opts }),
  warning: (msg, opts = {}) => toast.warning(msg, { icon: "⚠️", ...opts }),
  info:    (msg, opts = {}) => toast.info(msg, { icon: "ℹ️", ...opts }),
  loading: (msg) => {
    const id = toast.info(msg, {
      icon: "⏳",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      hideProgressBar: true,
    });
    return id;
  },
};
