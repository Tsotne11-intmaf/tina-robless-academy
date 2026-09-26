/* Generated from the legacy <header>. Interactive bits reconnected separately. */
export default function SiteHeader() {
  return (
    <header>
      
        <div className="wrap nav">
          <a className="logo" href="#home">Tina&nbsp;<span>Robless</span></a>
          <ul>
            <li><a href="#catalog" data-nav="catalog">კურსები</a></li>
            <li><a href="#certificates" data-nav="certificates">სერტიფიკატები</a></li>
            <li><a href="#students" data-nav="students">სტუდენტები</a></li>
            <li><a href="#about" data-nav="about">ჩემ შესახებ</a></li>
            <li><a href="#shop" data-nav="shop">მაღაზია <span className="soon-tag">მალე</span></a></li>
            <li className="m-only"><a href="#login">ჩემი კაბინეტი</a></li>
            <li className="m-only"><a className="btn btn-plum" href="#catalog">კურსების ნახვა</a></li>
            
            <li className="m-only lang-li"><div className="lang" aria-label="ენა"><button data-lang="en" aria-pressed="false">EN</button><button data-lang="ka" aria-pressed="true">ქარ</button><button data-lang="ru" aria-pressed="false">RU</button><button data-lang="el" aria-pressed="false">EL</button></div></li>
          </ul>
          <div className="nav-right">
            <div className="lang" aria-label="ენა"><button data-lang="en" aria-pressed="false">EN</button><button data-lang="ka" aria-pressed="true">ქარ</button><button data-lang="ru" aria-pressed="false">RU</button><button data-lang="el" aria-pressed="false">EL</button></div>
            <a href="#login" style={{fontWeight: "500"}}>ჩემი კაბინეტი</a>
            <a className="btn btn-plum" href="#catalog">კურსების ნახვა</a>
            <button className="menu-btn" aria-label="მენიუს გახსნა">☰</button>
          </div>
        </div>
      
    </header>
  );
}
