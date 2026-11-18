/* sw */

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            const reg = await navigator.serviceWorker.register("/sw.js", {
                updateViaCache: "none",
            });

            // Проверяем обновление SW не чаще раза в час и при возврате в приложение.
            setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
            document.addEventListener("visibilitychange", () => {
                if (!document.hidden) reg.update().catch(() => {});
            });
        } catch (e) {}
    });
}
