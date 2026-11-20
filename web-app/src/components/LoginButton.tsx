import { useMsal } from "@azure/msal-react";

export default function LoginButton() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect({
      scopes: ["openid", "profile", "email"],
    });
  };

  return (
    <button onClick={handleLogin}>
      Sign In
    </button>
  );
}