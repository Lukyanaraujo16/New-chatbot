(() => {
  const shouldBypass = (input) => {
    try {
      const url =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";
      const u = url.toLowerCase();
      return (
        u.includes("autoriza") ||
        u.includes("licenca") ||
        u.includes("licen\u00e7a") ||
        u.includes("license") ||
        u.includes("validar") ||
        u.includes("webhook")
      );
    } catch (_) {
      return false;
    }
  };

  const payload = {
    success: true,
    valid: true,
    licenseValid: true,
    message: "OK",
    data: { success: true, valid: true, licenseValid: true },
  };

  const makeResponse = () =>
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  if (typeof window !== "undefined") {
    window.__LICENSE_VALID__ = true;
  }

  // fetch
  if (typeof window !== "undefined" && typeof window.fetch === "function") {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      if (shouldBypass(input)) {
        return Promise.resolve(makeResponse());
      }
      return originalFetch(input, init);
    };
  }

  // XMLHttpRequest
  if (typeof window !== "undefined" && typeof window.XMLHttpRequest === "function") {
    const XHR = window.XMLHttpRequest;
    const open = XHR.prototype.open;
    const send = XHR.prototype.send;

    XHR.prototype.open = function (method, url, ...rest) {
      this.__licenseBypassUrl = url;
      return open.call(this, method, url, ...rest);
    };

    XHR.prototype.send = function (body) {
      if (shouldBypass(this.__licenseBypassUrl)) {
        try {
          const xhr = this;
          const json = JSON.stringify(payload);
          Object.defineProperty(xhr, "readyState", { value: 4 });
          Object.defineProperty(xhr, "status", { value: 200 });
          Object.defineProperty(xhr, "responseText", { value: json });
          Object.defineProperty(xhr, "response", { value: json });
          if (typeof xhr.onreadystatechange === "function") xhr.onreadystatechange();
          if (typeof xhr.onload === "function") xhr.onload();
          return;
        } catch (_) {
          // fallthrough
        }
      }
      return send.call(this, body);
    };
  }
})();
