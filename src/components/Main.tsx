"use client";
import Header from "@/components/Header";
import { PropsWithChildren } from "react";
import { QueryClientProvider } from "react-query";
import { QueryClient } from "react-query";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import Authorized from "./Authorized";
import SignIn from "./SignIn";

const queryClient = new QueryClient();

export interface MainProps {
  session: Session | null;
}

const Main: React.FC<PropsWithChildren<MainProps>> = ({
  children,
  session,
}) => {
  if (session == null) {
    return (
      <MainContent session={null}>
        <SignIn />
      </MainContent>
    );
  }

  return (
    <SessionProvider session={session}>
      <MainContent session={session}>
        <Authorized>{children}</Authorized>
      </MainContent>
    </SessionProvider>
  );
};

const MainContent: React.FC<PropsWithChildren<{ session: Session | null }>> = ({
  children,
  session,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Header session={session} />
      <main className="mx-auto h-full md:container">{children}</main>
    </QueryClientProvider>
  );
};

export default Main;
