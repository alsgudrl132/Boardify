export default function ({ store, redirect, route }) {
  if (route.path === "/login" || route.path === "/register") {
    if (process.client) {
      const token = localStorage.getItem("authToken");
      if (token) {
        return redirect("/");
      }
    }
  }
}
