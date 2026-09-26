import { getLang, type Lang } from "@/lib/i18n";

/* The auth panel does not go through DICT.

   DICT is the legacy catalogue dictionary: it maps Georgian marketing copy to three
   languages by substring replacement, and it simply has no entries for most of the
   login and registration wording, which was written during the Next conversion. That
   is why the header translated but the panel underneath it stayed Georgian.

   Substring replacement is also the wrong tool for interface chrome. "ან" (or) and
   "და" (and) are two letters long; letting a generic replacer loose on button labels
   is how "შენახვა" once became "შLanguageხვა". These strings are therefore written
   out per language and looked up whole. */
export type AuthStrings = {
  title: string;
  loading: string;

  signInIntro: string;
  signUpIntro: string;
  resetIntro: string;

  email: string;
  password: string;
  fullName: string;
  phoneOpt: string;
  pwMin: string;
  marketing: string;

  signIn: string;
  register: string;
  sendLink: string;

  forgot: string;
  forgotLink: string;
  noAccount: string;
  haveAccount: string;
  remembered: string;

  googleBtn: string;
  or: string;
  showPw: string;
  hidePw: string;

  termsPre: string;
  termsLink: string;
  and: string;
  privacyLink: string;

  checking: string;
  sending: string;
  badCreds: string;
  signInFailed: string;
  signUpFailed: string;
  emailTaken: string;
  /** {email} is substituted. */
  accountCreated: string;
  /** {email} is substituted. */
  resetSent: string;
  linkBad: string;

  newPwTitle: string;
  newPwIntro: string;
  newPw: string;
  repeatPw: string;
  savePw: string;
  pwMismatch: string;
  pwUpdated: string;
  pwUpdateFailed: string;
};

const ka: AuthStrings = {
  title: "ჩემი კაბინეტი",
  loading: "იტვირთება…",

  signInIntro: "შედით იმ ელფოსტითა და პაროლით, რომლითაც დარეგისტრირდით.",
  signUpIntro: "შექმენით ანგარიში — შემდეგ თინა დაგამატებთ შეძენილ კურსზე.",
  resetIntro: "მიუთითეთ ელფოსტა — გამოგიგზავნით პაროლის აღდგენის ბმულს.",

  email: "ელფოსტა",
  password: "პაროლი",
  fullName: "სახელი და გვარი",
  phoneOpt: "ტელეფონი (სურვილისამებრ)",
  pwMin: "მინიმუმ 8 სიმბოლო",
  marketing: "მსურს სიახლეების და ფასდაკლებების მიღება ელფოსტით",

  signIn: "შესვლა",
  register: "რეგისტრაცია",
  sendLink: "ბმულის გამოგზავნა",

  forgot: "დაგავიწყდათ პაროლი?",
  forgotLink: "აღდგენა ელფოსტით",
  noAccount: "ჯერ არ გაქვთ ანგარიში?",
  haveAccount: "უკვე გაქვთ ანგარიში?",
  remembered: "გაგახსენდათ?",

  googleBtn: "Google-ით გაგრძელება",
  or: "ან",
  showPw: "პაროლის ჩვენება",
  hidePw: "პაროლის დამალვა",

  termsPre: "გაგრძელებით ეთანხმებით",
  termsLink: "წესებს",
  and: "და",
  privacyLink: "კონფიდენციალურობის პოლიტიკას",

  checking: "მოწმდება…",
  sending: "იგზავნება…",
  badCreds: "ელფოსტა ან პაროლი არასწორია (ან ელფოსტა ჯერ არ დაგიდასტურებიათ).",
  signInFailed: "შესვლა ვერ მოხერხდა: ",
  signUpFailed: "რეგისტრაცია ვერ მოხერხდა: ",
  emailTaken: "ასეთი ელფოსტა უკვე რეგისტრირებულია.",
  accountCreated: "ანგარიში შეიქმნა. დაადასტურეთ ელფოსტა — ბმული გაიგზავნა {email}-ზე.",
  resetSent: "თუ ასეთი ანგარიში არსებობს, აღდგენის ბმული გაიგზავნა {email}-ზე.",
  linkBad: "ბმული არასწორია ან ვადაგასულია. სცადეთ თავიდან.",

  newPwTitle: "ახალი პაროლი",
  newPwIntro: "შეიყვანეთ ახალი პაროლი თქვენი ანგარიშისთვის.",
  newPw: "ახალი პაროლი",
  repeatPw: "გაიმეორეთ პაროლი",
  savePw: "პაროლის შენახვა",
  pwMismatch: "პაროლები არ ემთხვევა.",
  pwUpdated: "პაროლი განახლდა. გადამისამართება…",
  pwUpdateFailed: "პაროლის შეცვლა ვერ მოხერხდა: ",
};

const en: AuthStrings = {
  title: "My account",
  loading: "Loading…",

  signInIntro: "Sign in with the email and password you registered with.",
  signUpIntro: "Create an account — Tina will then add you to the course you bought.",
  resetIntro: "Enter your email and we will send you a password reset link.",

  email: "Email",
  password: "Password",
  fullName: "Full name",
  phoneOpt: "Phone (optional)",
  pwMin: "At least 8 characters",
  marketing: "I would like to receive news and discounts by email",

  signIn: "Sign in",
  register: "Register",
  sendLink: "Send link",

  forgot: "Forgot your password?",
  forgotLink: "Reset it by email",
  noAccount: "Do not have an account yet?",
  haveAccount: "Already have an account?",
  remembered: "Remembered it?",

  googleBtn: "Continue with Google",
  or: "or",
  showPw: "Show password",
  hidePw: "Hide password",

  termsPre: "By continuing you agree to the",
  termsLink: "Terms",
  and: "and",
  privacyLink: "Privacy Policy",

  checking: "Checking…",
  sending: "Sending…",
  badCreds: "Wrong email or password (or the email has not been confirmed yet).",
  signInFailed: "Could not sign in: ",
  signUpFailed: "Could not register: ",
  emailTaken: "That email is already registered.",
  accountCreated: "Account created. Confirm your email — a link was sent to {email}.",
  resetSent: "If such an account exists, a recovery link was sent to {email}.",
  linkBad: "That link is invalid or has expired. Please request a new one.",

  newPwTitle: "New password",
  newPwIntro: "Enter a new password for your account.",
  newPw: "New password",
  repeatPw: "Repeat password",
  savePw: "Save password",
  pwMismatch: "The passwords do not match.",
  pwUpdated: "Password updated. Redirecting…",
  pwUpdateFailed: "Could not change the password: ",
};

const ru: AuthStrings = {
  title: "Мой кабинет",
  loading: "Загрузка…",

  signInIntro: "Войдите с той почтой и паролем, с которыми вы регистрировались.",
  signUpIntro: "Создайте аккаунт — затем Тина добавит вас на приобретённый курс.",
  resetIntro: "Укажите почту — мы отправим ссылку для восстановления пароля.",

  email: "Эл. почта",
  password: "Пароль",
  fullName: "Имя и фамилия",
  phoneOpt: "Телефон (необязательно)",
  pwMin: "Минимум 8 символов",
  marketing: "Хочу получать новости и скидки по почте",

  signIn: "Войти",
  register: "Регистрация",
  sendLink: "Отправить ссылку",

  forgot: "Забыли пароль?",
  forgotLink: "Восстановить по почте",
  noAccount: "Ещё нет аккаунта?",
  haveAccount: "Уже есть аккаунт?",
  remembered: "Вспомнили?",

  googleBtn: "Продолжить с Google",
  or: "или",
  showPw: "Показать пароль",
  hidePw: "Скрыть пароль",

  termsPre: "Продолжая, вы соглашаетесь с",
  termsLink: "Правилами",
  and: "и",
  privacyLink: "Политикой конфиденциальности",

  checking: "Проверка…",
  sending: "Отправка…",
  badCreds: "Неверная почта или пароль (или почта ещё не подтверждена).",
  signInFailed: "Не удалось войти: ",
  signUpFailed: "Не удалось зарегистрироваться: ",
  emailTaken: "Эта почта уже зарегистрирована.",
  accountCreated: "Аккаунт создан. Подтвердите почту — ссылка отправлена на {email}.",
  resetSent: "Если такой аккаунт существует, ссылка для восстановления отправлена на {email}.",
  linkBad: "Ссылка недействительна или устарела. Запросите новую.",

  newPwTitle: "Новый пароль",
  newPwIntro: "Введите новый пароль для вашего аккаунта.",
  newPw: "Новый пароль",
  repeatPw: "Повторите пароль",
  savePw: "Сохранить пароль",
  pwMismatch: "Пароли не совпадают.",
  pwUpdated: "Пароль обновлён. Перенаправление…",
  pwUpdateFailed: "Не удалось изменить пароль: ",
};

const el: AuthStrings = {
  title: "Ο λογαριασμός μου",
  loading: "Φόρτωση…",

  signInIntro: "Συνδεθείτε με το email και τον κωδικό με τα οποία εγγραφήκατε.",
  signUpIntro:
    "Δημιουργήστε λογαριασμό — στη συνέχεια η Tina θα σας προσθέσει στο μάθημα που αγοράσατε.",
  resetIntro: "Δώστε το email σας και θα σας στείλουμε σύνδεσμο επαναφοράς κωδικού.",

  email: "Email",
  password: "Κωδικός",
  fullName: "Ονοματεπώνυμο",
  phoneOpt: "Τηλέφωνο (προαιρετικό)",
  pwMin: "Τουλάχιστον 8 χαρακτήρες",
  marketing: "Θέλω να λαμβάνω νέα και εκπτώσεις μέσω email",

  signIn: "Σύνδεση",
  register: "Εγγραφή",
  sendLink: "Αποστολή συνδέσμου",

  forgot: "Ξεχάσατε τον κωδικό σας;",
  forgotLink: "Επαναφορά μέσω email",
  noAccount: "Δεν έχετε λογαριασμό ακόμη;",
  haveAccount: "Έχετε ήδη λογαριασμό;",
  remembered: "Τον θυμηθήκατε;",

  googleBtn: "Συνέχεια με Google",
  or: "ή",
  showPw: "Εμφάνιση κωδικού",
  hidePw: "Απόκρυψη κωδικού",

  termsPre: "Συνεχίζοντας αποδέχεστε τους",
  termsLink: "Όρους",
  and: "και",
  privacyLink: "Πολιτική Απορρήτου",

  checking: "Έλεγχος…",
  sending: "Αποστολή…",
  badCreds: "Λάθος email ή κωδικός (ή το email δεν έχει επιβεβαιωθεί ακόμη).",
  signInFailed: "Η σύνδεση απέτυχε: ",
  signUpFailed: "Η εγγραφή απέτυχε: ",
  emailTaken: "Αυτό το email έχει ήδη εγγραφεί.",
  accountCreated:
    "Ο λογαριασμός δημιουργήθηκε. Επιβεβαιώστε το email — στάλθηκε σύνδεσμος στο {email}.",
  resetSent:
    "Αν υπάρχει τέτοιος λογαριασμός, στάλθηκε σύνδεσμος επαναφοράς στο {email}.",
  linkBad: "Ο σύνδεσμος είναι άκυρος ή έχει λήξει. Ζητήστε νέον.",

  newPwTitle: "Νέος κωδικός",
  newPwIntro: "Εισαγάγετε νέο κωδικό για τον λογαριασμό σας.",
  newPw: "Νέος κωδικός",
  repeatPw: "Επαναλάβετε τον κωδικό",
  savePw: "Αποθήκευση κωδικού",
  pwMismatch: "Οι κωδικοί δεν ταιριάζουν.",
  pwUpdated: "Ο κωδικός ενημερώθηκε. Ανακατεύθυνση…",
  pwUpdateFailed: "Δεν ήταν δυνατή η αλλαγή του κωδικού: ",
};

const TABLE: Record<Lang, AuthStrings> = { ka, en, ru, el };

export async function getAuthStrings(): Promise<AuthStrings> {
  return TABLE[await getLang()];
}
