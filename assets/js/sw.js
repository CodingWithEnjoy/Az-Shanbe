self.addEventListener("install", () => {
  console.log("Service Worker: Installed");
});

self.addEventListener("activate", () => {
  console.log("Service Worker: Activated");
});
