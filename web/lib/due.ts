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

/* The deadline itself, for the line under the countdown. */
export function dueDate(due: number) {
  return new Date(due).toLocaleDateString("ka-GE", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
