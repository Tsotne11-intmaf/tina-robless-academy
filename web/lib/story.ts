/* The timeline on "ჩემ შესახებ".

   The entries stay in the code so the page reads correctly against an empty
   database, exactly like the rest of the site's wording. The list row records
   only the order, and only once Tina has added, moved or removed something -
   until then these ids are the order. Both the page and the route that grows the
   list read it from here, so an entry inserted between two built-in ones lands
   where she put it rather than at the end. */

export const STORY_LIST = "list.story";

export type StoryEntry = {
  id: string;
  title: string;
  text: string;
  /* Where this entry's wording used to be saved. The whole <li> was one editable
     block under the page's own text keys, and what was typed there was written
     to the database but never read back - so anything Tina wrote before is
     picked up from the old key rather than left orphaned. */
  was?: string;
};

export const STORY: StoryEntry[] = [
  {
    id: "s1",
    title: "წელი — დაიწყო ფრჩხილების კეთება",
    text: "სად და ვისთან ისწავლა.",
    was: "t.about.9",
  },
  {
    id: "s2",
    title: "წელი — გახსნა სტუდია თბილისში",
    text: "უბანი, ფოკუსი გრძელ ნაშენზე.",
    was: "t.about.10",
  },
  {
    id: "s3",
    title: "2026 — CMC მსოფლიო ჩემპიონატი, პაესტუმი",
    text: "38-ე მსოფლიო ჩემპიონატი, საქართველოს წარმომადგენელი და Georgia Nails-ის პრეზიდენტი.",
    was: "t.about.11",
  },
  {
    id: "s4",
    title: "წელი — პირველი სტუდენტები",
    text: "სტუდიაში ინდივიდუალური სწავლება იწყება.",
    was: "t.about.12",
  },
  {
    id: "s5",
    title: "წელი — Tina Robless TikTok-სა და Instagram-ზე",
    text: "ნამუშევრები 200K+ ნახვას აღწევს; უცხოეთიდან სტუდენტები ონლაინ გაკვეთილებს ითხოვენ.",
    was: "t.about.13",
  },
  {
    id: "s6",
    title: "2026 — Tina Robless Nail Academy",
    text: "კურსები ონლაინ გამოდის სერტიფიკატებით.",
    was: "t.about.14",
  },
];

export const STORY_IDS = STORY.map((s) => s.id);
