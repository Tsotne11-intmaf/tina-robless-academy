/* Generated from the legacy single-file app: <main data-page="login">.
   Markup and styling are faithful to the original. Interactive behaviour is not
   wired here: the legacy inline handlers called globals that do not exist in this
   app (13 dropped), so they are reconnected deliberately rather than guessed at. */
export default function LoginPage() {
  return (
    <>
      
      <section className="lms"><div className="wrap">
        <div className="login-box">
          <h1>ჩემი კაბინეტი</h1>
      
          <div data-auth="in">
            <p>შედით Google-ით ან იმ ელფოსტითა და პაროლით, რომლითაც დარეგისტრირდით.</p>
            <button type="button" className="btn btn-google"><svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" /><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" /><path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" /><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" /></svg> Google-ით შესვლა</button>
            <div className="auth-or"><span>ან</span></div>
            <form>
              <div className="field"><label htmlFor="lg-email">ელფოსტა</label><input id="lg-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>
              <div className="field"><label htmlFor="lg-pass">პაროლი</label><div className="pass-wrap"><input id="lg-pass" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required /><button type="button" className="pass-eye" aria-label="პაროლის ჩვენება" title="პაროლის ჩვენება"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1.8 12S5.7 5.2 12 5.2 22.2 12 22.2 12 18.3 18.8 12 18.8 1.8 12 1.8 12Z" /><circle cx="12" cy="12" r="3.1" /></svg></button></div></div>
              <button className="btn btn-plum" type="submit">შესვლა</button>
            </form>
            <p className="hint">დაგავიწყდათ პაროლი? <a className="btn-link" href="#login">აღდგენა ელფოსტით</a></p>
            <p className="hint">ჯერ არ გაქვთ ანგარიში? <a className="btn-link" href="#login">რეგისტრაცია</a></p>
          </div>
      
          <div data-auth="up" hidden>
            <p>შექმენით ანგარიში — შემდეგ თინა დაგამატებთ შეძენილ კურსზე.</p>
            <button type="button" className="btn btn-google"><svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" /><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" /><path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" /><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" /></svg> Google-ით რეგისტრაცია</button>
            <div className="auth-or"><span>ან შეავსეთ ფორმა</span></div>
            <form>
              <div className="field"><label htmlFor="su-name">სახელი და გვარი</label><input id="su-name" name="full_name" autoComplete="name" required /></div>
              <div className="field"><label htmlFor="su-email">ელფოსტა</label><input id="su-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>
              <div className="field"><label htmlFor="su-phone">ტელეფონი (სურვილისამებრ)</label><input id="su-phone" name="phone" type="tel" autoComplete="tel" placeholder="+995 5xx xxx xxx" /></div>
              <div className="field"><label htmlFor="su-pass">პაროლი</label><div className="pass-wrap"><input id="su-pass" name="password" type="password" autoComplete="new-password" minLength={8} placeholder="მინიმუმ 8 სიმბოლო" required /><button type="button" className="pass-eye" aria-label="პაროლის ჩვენება" title="პაროლის ჩვენება"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1.8 12S5.7 5.2 12 5.2 22.2 12 22.2 12 18.3 18.8 12 18.8 1.8 12 1.8 12Z" /><circle cx="12" cy="12" r="3.1" /></svg></button></div></div>
              <label className="auth-check"><input type="checkbox" name="marketing_ok" /> მსურს სიახლეების და ფასდაკლებების მიღება ელფოსტით</label>
              <button className="btn btn-plum" type="submit">რეგისტრაცია</button>
            </form>
            <p className="hint">უკვე გაქვთ ანგარიში? <a className="btn-link" href="#login">შესვლა</a></p>
          </div>
      
          <div data-auth="reset" hidden>
            <p>მიუთითეთ ელფოსტა — გამოგიგზავნით პაროლის აღდგენის ბმულს.</p>
            <form>
              <div className="field"><label htmlFor="rs-email">ელფოსტა</label><input id="rs-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>
              <button className="btn btn-plum" type="submit">ბმულის გამოგზავნა</button>
            </form>
            <p className="hint">გაგახსენდათ? <a className="btn-link" href="#login">შესვლა</a></p>
          </div>
      
          <div data-auth="new" hidden>
            <p>შეიყვანეთ ახალი პაროლი.</p>
            <form>
              <div className="field"><label htmlFor="np-pass">ახალი პაროლი</label><div className="pass-wrap"><input id="np-pass" name="password" type="password" autoComplete="new-password" minLength={8} placeholder="მინიმუმ 8 სიმბოლო" required /><button type="button" className="pass-eye" aria-label="პაროლის ჩვენება" title="პაროლის ჩვენება"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1.8 12S5.7 5.2 12 5.2 22.2 12 22.2 12 18.3 18.8 12 18.8 1.8 12 1.8 12Z" /><circle cx="12" cy="12" r="3.1" /></svg></button></div></div>
              <button className="btn btn-plum" type="submit">პაროლის შენახვა</button>
            </form>
          </div>
      
          <p className="auth-msg" id="auth-msg" hidden></p>
          <p className="hint" style={{fontSize: ".8rem"}}>გაგრძელებით ეთანხმებით <a className="btn-link" href="#terms">წესებს</a> და <a className="btn-link" href="#privacy">კონფიდენციალურობის პოლიტიკას</a>.</p>
          <p className="hint">ჯერ არ გაქვთ კურსი? <a className="btn-link" href="#courses">კურსების ნახვა</a></p>
        </div>
      </div></section>
      
    </>
  );
}
