import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <SignIn
        routing="path"
        path="/sign-in"
        appearance={{
          variables: {
            colorPrimary: "#15803d",
            colorText: "#171717",
            colorBackground: "#ffffff",
            colorInputBackground: "#ffffff",
            colorNeutral: "#f4f4f5",
          },
          elements: {
            rootBox: "mx-auto",
            card: "bg-card border border-border",
          },
        }}
      />
    </div>
  );
}
