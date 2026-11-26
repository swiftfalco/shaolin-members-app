export const msalConfig = {
  auth: {
    clientId:
      "e64195fc-d123-4492-95ce-13909a1a20ce",

    authority:
      "https://skfinstructor.ciamlogin.com/4d93244f-08b1-40da-8d66-6587137cf091/",

    knownAuthorities: [
      "skfinstructor.ciamlogin.com",
    ],

    redirectUri:
      window.location.origin,
  },

  cache: {
    cacheLocation: "localStorage",
  },
};