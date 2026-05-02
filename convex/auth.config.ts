const domain = process.env.CLERK_JWT_ISSUER_DOMAIN;
const authConfig = {
  providers: [
    {
      domain: (domain && domain.startsWith("http")) 
        ? domain 
        : "https://charming-wildcat-89.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};

export default authConfig;
