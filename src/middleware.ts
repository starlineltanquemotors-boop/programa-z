export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/leads/:path*", "/seguimiento/:path*", "/ventas/:path*", "/inventario/:path*", "/postventa/:path*", "/bancos/:path*", "/marketing/:path*", "/vendedores/:path*", "/taller/:path*", "/configuracion/:path*"],
};
