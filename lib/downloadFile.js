export const downloadAuthFile = async ({ path, accessToken, fallbackFilename = "download" }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    });
  
    if (!res.ok) {
      let message = "Download failed. Please try again.";
      try {
        const body = await res.json();
        message = body?.message || message;
      } catch {
        // response wasn't JSON (likely a binary error page) — keep default message
      }
      throw new Error(message);
    }
  
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const filename = res.headers.get("Content-Disposition")?.match(/filename="?([^"]+)"?/)?.[1] || fallbackFilename;
  
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };