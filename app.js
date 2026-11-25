const PRODUCTS = [
  {sku:"HH-001",name:"น้ำผึ้งดอกไม้ป่า",size:"ขนาด 250 กรัม",price:159,desc:"กลิ่นหอมละมุน รสหวานกลมกล่อม เหมาะสำหรับชงเครื่องดื่ม",image:"images/honey-jar.svg",tag:"BEST SELLER"},
  {sku:"HH-002",name:"น้ำผึ้งดอกลำไย",size:"ขนาด 500 กรัม",price:279,desc:"รสหวานเข้มข้น หอมเป็นเอกลักษณ์ เหมาะสำหรับติดครัวไว้",image:"images/honey-jar-large.svg",tag:"FAMILY SIZE"}
];
let cart = JSON.parse(localStorage.getItem("hh_cart") || "[]");
const $ = id => document.getElementById(id);
const money = n => "฿" + Number(n).toLocaleString("th-TH");
function saveCart(){localStorage.setItem("hh_cart",JSON.stringify(cart));renderCart()}
function renderProducts(){
  $("productGrid").innerHTML=PRODUCTS.map(p=>`<article class="product-card"><div class="product-image"><span class="sku-tag">${p.tag}</span><img src="${p.image}" alt="${p.name}"></div><div class="product-info"><h3>${p.name}</h3><p>${p.desc}</p><div class="product-foot"><div class="price">${money(p.price)} <small>/ ${p.size.replace("ขนาด ","")}</small></div><button class="add-button" data-add="${p.sku}">＋ เพิ่มลงตะกร้า</button></div></div></article>`).join("");
  document.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>{let item=cart.find(x=>x.sku===b.dataset.add);item?item.qty++:cart.push({sku:b.dataset.add,qty:1});saveCart();toast("เพิ่มสินค้าลงตะกร้าแล้ว")}));
}
function renderCart(){
  $("cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);
  if(!cart.length){$("cartItems").innerHTML='<div class="empty">🛒<br><br>ยังไม่มีสินค้าในตะกร้า</div>';$("cartTotal").textContent=money(0);return}
  $("cartItems").innerHTML=cart.map(x=>{let p=PRODUCTS.find(p=>p.sku===x.sku);return `<div class="cart-row"><img src="${p.image}" alt=""><div><b>${p.name}</b><small>${p.size} · ${money(p.price)}</small><div class="qty"><button data-minus="${p.sku}">−</button><span>${x.qty}</span><button data-plus="${p.sku}">＋</button></div></div><button class="remove" data-remove="${p.sku}">ลบ</button></div>`}).join("");
  $("cartTotal").textContent=money(cart.reduce((s,x)=>s+PRODUCTS.find(p=>p.sku===x.sku).price*x.qty,0));
  document.querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>{let x=cart.find(x=>x.sku===b.dataset.minus);x.qty--;if(x.qty<=0)cart=cart.filter(y=>y.sku!==b.dataset.minus);saveCart()});
  document.querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>{cart.find(x=>x.sku===b.dataset.plus).qty++;saveCart()});
  document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{cart=cart.filter(x=>x.sku!==b.dataset.remove);saveCart()});
}
function openCart(){$("cartDrawer").classList.add("show");$("drawerBackdrop").classList.add("show")}
function closeCart(){$("cartDrawer").classList.remove("show");$("drawerBackdrop").classList.remove("show")}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2300)}
$("cartOpen").onclick=openCart;$("cartClose").onclick=closeCart;$("drawerBackdrop").onclick=closeCart;
$("checkoutOpen").onclick=()=>{if(!cart.length){toast("กรุณาเลือกสินค้าก่อน");return}closeCart();$("checkoutSummary").innerHTML=cart.map(x=>{let p=PRODUCTS.find(p=>p.sku===x.sku);return `${p.name} × ${x.qty} = ${money(p.price*x.qty)}`}).join("<br>")+`<hr>ยอดรวมสินค้า: <b>${$("cartTotal").textContent}</b>`;$("checkoutModal").classList.add("show")};
$("checkoutClose").onclick=()=>$("checkoutModal").classList.remove("show");
$("checkoutModal").addEventListener("click",e=>{if(e.target===$("checkoutModal"))$("checkoutModal").classList.remove("show")});
$("checkoutForm").onsubmit=async e=>{
  e.preventDefault();if(!cart.length)return;
  const fd=new FormData(e.target),items=cart.map(x=>{let p=PRODUCTS.find(p=>p.sku===x.sku);return {sku:p.sku,product:p.name,qty:x.qty,unitPrice:p.price}});
  const order={orderId:"HH"+Date.now().toString().slice(-8),createdAt:new Date().toLocaleString("th-TH"),customer:fd.get("customer"),phone:fd.get("phone"),address:fd.get("address"),note:fd.get("note"),items,total:items.reduce((s,x)=>s+x.qty*x.unitPrice,0),status:"รอหยิบสินค้า",tracking:""};
  let orders=JSON.parse(localStorage.getItem("hh_orders")||"[]");orders.unshift(order);localStorage.setItem("hh_orders",JSON.stringify(orders));
  const endpoint=window.HONEY_CONFIG?.GOOGLE_SHEETS_URL;
  if(endpoint){try{await fetch(endpoint,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(order)})}catch(err){console.warn("Google Sheets sync failed",err)}}
  cart=[];saveCart();e.target.reset();$("checkoutModal").classList.remove("show");
  toast("รับคำสั่งซื้อแล้ว เลขที่ "+order.orderId);
  alert("สั่งซื้อสำเร็จ!\\nเลขที่คำสั่งซื้อ: "+order.orderId+"\\nยอดสินค้า: "+money(order.total)+(endpoint?"\\nส่งข้อมูลไปยัง Google Sheets แล้ว":"\\nหมายเหตุ: ยังไม่ได้เชื่อม Google Sheets"));
};
renderProducts();renderCart();
