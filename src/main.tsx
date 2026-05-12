import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 이전 서비스 워커 및 캐시 제거 (레포지토리 이름 변경 대응)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

// 캐시 스토리지 강제 삭제
if ('caches' in window) {
  caches.keys().then((names) => {
    for (const name of names) {
      caches.delete(name);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
