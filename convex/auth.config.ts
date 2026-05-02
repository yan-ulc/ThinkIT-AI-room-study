const authConfig = {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://charming-wildcat-89.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};

export default authConfig;
