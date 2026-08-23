/** @type {import('next').NextConfig} */
const nextConfig = {
  // Nome de pasta diferente do padrão ".next": nesta máquina, a pasta
  // ".next" fica travada (EPERM) entre reinícios do servidor de
  // desenvolvimento, provavelmente por antivírus/indexador prendendo
  // handles de arquivo. Usar outro nome evita o problema de vez.
  distDir: ".next-build",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
