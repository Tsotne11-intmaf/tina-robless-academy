/* How long is left before a deadline, in words.

   Past it, it says so rather than counting into the negative: "ვადა გასულია −3
   დღე" tells a student nothing they can act on. */
export function timeLeft(due: number | null | undefined) {
  if (!due) return null;
  const ms = due - Date.now();
  if (ms <= 0) return { text: "ვადა გასულია", late: true, soon: false };
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(ms / 86400000);
  if (hours < 24) return { text: `დარჩა ${hours} საათი`, late: false, soon: true };
  return { text: `დარჩა ${days} დღე`, late: false, soon: days <= 2 };
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
