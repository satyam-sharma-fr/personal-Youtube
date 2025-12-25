import { convexAuthNextjsMiddleware, createRouteMatcher } from "@convex-dev/auth/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/signin"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (!isPublicRoute(request) && !(await convexAuth.isAuthenticated())) {
    return Response.redirect(new URL("/signin", request.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

