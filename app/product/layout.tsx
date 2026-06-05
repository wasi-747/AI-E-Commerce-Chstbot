import StoreLayoutWrapper from "@/components/StoreLayoutWrapper";

export default function ProductLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StoreLayoutWrapper>{children}</StoreLayoutWrapper>;
}
