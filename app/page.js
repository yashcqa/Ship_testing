import Catalogue from "@/components/Catalogue";

export default function HomePage() {
  return (
    <>
      <section className="hero" data-testid="hero">
        <h1 className="hero__title">Good books, carefully shelved.</h1>
        <p className="hero__text">
          Ten titles we'd hand to a friend, from island novels to field guides. Free shipping on every order.
        </p>
      </section>
      <Catalogue />
    </>
  );
}
