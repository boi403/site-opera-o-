export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout "passe-through". A proteção por login/role fica em
  // app/admin/(protected)/layout.tsx, que não inclui /admin/login.
  return <>{children}</>;
}
