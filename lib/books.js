export const GENRES = [
  "Fiction",
  "Mystery",
  "Science Fiction",
  "Fantasy",
  "Non-fiction",
  "Poetry"
];

export const OUT_OF_STOCK_ID = "the-silent-orchard";
export const LOW_STOCK_THRESHOLD = 3;

export const BOOKS = [
  {
    id: "the-lantern-keeper",
    title: "The Lantern Keeper",
    author: "Mara Ellison",
    genre: "Fiction",
    priceCents: 1699,
    stock: 12,
    cover: "#2F5D50",
    description:
      "On a storm-cut island, the last lighthouse keeper takes in a runaway who knows more about the wreck of 1952 than she admits. A patient, generous novel about the people who keep watch."
  },
  {
    id: "north-of-the-tideline",
    title: "North of the Tideline",
    author: "Jonah Brekke",
    genre: "Fiction",
    priceCents: 1450,
    stock: 7,
    cover: "#3E5C7A",
    description:
      "Three siblings return to their father's fishing village to sell the family boat and end up staying for one more season. Warm, funny and quietly heartbreaking."
  },
  {
    id: "the-silent-orchard",
    title: "The Silent Orchard",
    author: "Ines Calloway",
    genre: "Mystery",
    priceCents: 1800,
    stock: 0,
    cover: "#6B3A3A",
    description:
      "Every apple tree in Harrow Orchard stopped fruiting the year Lydia Marsh disappeared. Thirty years later, a soil surveyor finds something buried under the oldest row."
  },
  {
    id: "a-murder-in-maple-lane",
    title: "A Murder in Maple Lane",
    author: "Theo Brandt",
    genre: "Mystery",
    priceCents: 1299,
    stock: 5,
    cover: "#8A5A2B",
    description:
      "A retired crossword setter notices that the clues in her neighbour's newspaper have been changed by hand. The first cosy mystery in the Maple Lane series."
  },
  {
    id: "the-glass-cartographer",
    title: "The Glass Cartographer",
    author: "Priya Okafor",
    genre: "Science Fiction",
    priceCents: 2100,
    stock: 9,
    cover: "#2B4B6F",
    description:
      "A mapmaker aboard a generation ship discovers that the star charts she has been drawing for twenty years describe a route that does not exist."
  },
  {
    id: "signals-from-kepler",
    title: "Signals from Kepler",
    author: "Dev Raman",
    genre: "Science Fiction",
    priceCents: 1575,
    stock: 3,
    cover: "#44446B",
    description:
      "A radio astronomer and her teenage son decode a repeating signal that seems to answer questions before they are asked. Smart, tense and surprisingly tender."
  },
  {
    id: "the-ember-crown",
    title: "The Ember Crown",
    author: "Saoirse Vale",
    genre: "Fantasy",
    priceCents: 1999,
    stock: 8,
    cover: "#7A3F22",
    description:
      "The crown of the mountain kingdom burns whoever wears it unworthily. The blacksmith's apprentice who forged its replacement is about to find out why."
  },
  {
    id: "roots-and-rivers",
    title: "Roots and Rivers",
    author: "Hal Whitcombe",
    genre: "Non-fiction",
    priceCents: 2400,
    stock: 6,
    cover: "#4F6B3A",
    description:
      "A field guide to how forests and rivers shape each other, from beaver dams to old-growth floodplains, illustrated with the author's own survey sketches."
  },
  {
    id: "the-quiet-workshop",
    title: "The Quiet Workshop",
    author: "Noor Haddad",
    genre: "Non-fiction",
    priceCents: 1725,
    stock: 10,
    cover: "#5A4A3A",
    description:
      "Conversations with twelve craftspeople, from a violin maker to a bookbinder, about patience, mistakes and the tools they would never give up."
  },
  {
    id: "small-hours",
    title: "Small Hours",
    author: "Elena Morrow",
    genre: "Poetry",
    priceCents: 1100,
    stock: 4,
    cover: "#3A5F5F",
    description:
      "Forty short poems written between midnight and dawn over one winter. Spare, precise and full of kitchen light."
  }
];

export function findBook(id, books = BOOKS) {
  return books.find((book) => book.id === id) || null;
}

export function filterBooks(books, { q = "", genre = "" } = {}) {
  const needle = q.trim().toLowerCase();
  return books.filter((book) => {
    const matchesGenre = !genre || genre === "All" || book.genre === genre;
    const matchesQuery =
      !needle ||
      book.title.toLowerCase().includes(needle) ||
      book.author.toLowerCase().includes(needle);
    return matchesGenre && matchesQuery;
  });
}

export function formatPrice(cents) {
  return "$" + (cents / 100).toFixed(2);
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stockLabel(stock) {
  if (stock <= 0) return "Out of stock";
  if (stock <= LOW_STOCK_THRESHOLD) return `Only ${stock} left`;
  return "In stock";
}
