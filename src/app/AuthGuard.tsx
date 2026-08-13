import { useSyncExternalStore } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

function useAuthHydrated() {
  return useSyncExternalStore(
    (onStoreChange) => useAuthStore.persist.onFinishHydration(onStoreChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  // DEV PREVIEW ONLY: "?preview=1" (or hash "#preview") skips the login wall so
  // unauthenticated reviewers can navigate the whole app. NOT for production.
  const preview =
    import.meta.env.DEV &&
    (new URLSearchParams(window.location.search).has("preview") ||
      window.location.hash.includes("preview"));

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthHydrated();

  if (preview) return <>{children}</>;

  if (!hydrated) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "var(--dim)",
          fontSize: 13,
        }}
      >
        Loading authentication…
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
