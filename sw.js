self.addEventListener('install', () => {
  // Required for install prompt support
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', () => {
  console.log('Service Worker: Activated');
});
