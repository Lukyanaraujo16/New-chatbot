self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  //console.log("Recebendo notificação push:", data);

  const title = data.title || "Nova Notificação";
  const options = {
    body: data.body || "Você tem uma nova mensagem.",
    icon: "/favicon.ico", // Ícone do sistema (favicon)
    badge: data.profilePicUrl || "/default-badge.png", // Badge personalizado (opcional)
    actions: [
      { action: "view", title: "Visualizar", icon: "/icons/view-icon.png" }, // Botão "Visualizar"
      { action: "dismiss", title: "Ignorar", icon: "/icons/dismiss-icon.png" }, // Botão "Ignorar"
    ],
    data: {
      url: "/tickets", // URL para a aba "tickets"
      type: data.type || "default",
    },
    vibrate: [100, 50, 100], // Padrão de vibração
    tag: "notification-tag", // Tag para evitar notificações duplicadas
    renotify: true, // Renotificar para a mesma tag
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  //console.log("Notificação clicada:", event.notification);
  event.notification.close();

  if (event.action === "view") {
    // Ação ao clicar em "Visualizar"
    event.waitUntil(clients.openWindow(event.notification.data.url));
  } else if (event.action === "dismiss") {
    // Ação ao clicar em "Ignorar"
    //console.log("Notificação ignorada.");
  } else {
    // Ação padrão ao clicar na notificação
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
