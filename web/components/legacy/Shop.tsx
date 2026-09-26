/* Generated from the legacy single-file app: <main data-page="shop">.
   Markup and styling are faithful to the original. Interactive behaviour is not
   wired here: the legacy inline handlers called globals that do not exist in this
   app (1 dropped), so they are reconnected deliberately rather than guessed at. */
export default function ShopPage() {
  return (
    <>
      
      <section className="shop" style={{minHeight: "70vh", display: "flex", alignItems: "center"}}>
        <div className="wrap">
          <div className="crumbs" style={{textAlign: "left"}}><a href="#home">მთავარი</a> / მაღაზია</div>
          <p className="ka" data-edit="t.shop.1">Coming soon</p>
          <h1 style={{marginBottom: "14px"}} data-edit="t.shop.2">მაღაზია — მალე გაიხსნება</h1>
          <p data-edit="t.shop.3">ფორმები, ფუნჯები, ფრეზები და მასალები, რომლებსაც თინა ყველა კურსში იყენებს, პლუს მისი რჩეული გრძელი ნამუშევრებისთვის. დატოვეთ ელფოსტა და გახსნისას პირველი გაიგებთ.</p>
          <div className="shop-items" aria-hidden="true">
            <div className="shop-item">ფორმები</div>
            <div className="shop-item">ფუნჯები</div>
            <div className="shop-item">ფრეზები</div>
            <div className="shop-item">სასტარტო ნაკრები</div>
          </div>
          <form className="notify">
            <input type="email" placeholder="თქვენი ელფოსტა" aria-label="თქვენი ელფოსტა" required />
            <button type="submit">შემატყობინე</button>
          </form>
          <p style={{marginTop: "28px", fontSize: ".9rem"}} data-edit="t.shop.4">მანამდე თითოეული კურსის გვერდზე ზუსტად არის ჩამოთვლილი, რას იყენებს თინა, ბმულებით.</p>
        </div>
      </section>
      
    </>
  );
}
