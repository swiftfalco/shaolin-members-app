export const msalConfig = {
  auth: {
    clientId:
      "d90eb939-cbda-452f-88c9-88b881501c8c",

    authority:
      "https://skfinstructor.ciamlogin.com/4d93244f-08b1-40da-8d66-6587137cf091",

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