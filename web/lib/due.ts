/* How long is left before a deadline, in words.

   Past it, it says so rather than counting into the negative: "ვადა გასულია −3
   დღე" tells a student nothing they can act on. */
/* Green with five days or more to go, amber under that, red once the time has
   passed. The wording drops to hours inside the last day, where "დარჩა 0 დღე"
   would be both true and useless. */
const CALM_DAYS = 5;

export function timeLeft(due: number | null | undefined) {
  if (!due) return null;
  const ms = due - Date.now();
  if (ms <= 0) return { text: "ვადა გასულია", late: true, soon: false };
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(ms / 86400000);
  const text = hours < 24 ? `დარჩა ${hours} საათი` : `დარჩა ${days} დღე`;
  return { text, late: false, soon: days < CALM_DAYS };
}

/* The deadline itself, spelled out.

   Written by hand rather than through toLocaleDateString: browsers ship little
   or no Georgian date data, so asking for "ka-GE" quietly returned "October 4"
   to a student reading a Georgian page. */
const MONTHS = [
  "იანვრის", "თებერვლის", "მარტის", "აპრილის", "მაისის", "ივნისის",
  "ივლისის", "აგვისტოს", "სექტემბრის", "ოქტომბრის", "ნოემბრის", "დეკემბრის",
];

export function dueDate(due: number) {
  const d = new Date(due);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${hh}:${mm}`;
}
