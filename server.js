const express=require('express'),fs=require('fs'),path=require('path'),multer=require('multer');
const app=express();const PIN=process.env.ADMIN_PIN||String(Math.floor(100000+Math.random()*900000));if(!process.env.ADMIN_PIN)console.log('ADMIN_PIN not set; temporary admin PIN for this run: '+PIN);const DB=path.join(__dirname,'data.json');
const load=()=>JSON.parse(fs.readFileSync(DB));const save=d=>fs.writeFileSync(DB,JSON.stringify(d,null,1));
if(!fs.existsSync(DB))save(require('./seed.js'));
app.use(express.json({limit:'5mb'}));app.use(express.static(path.join(__dirname,'public')));
const auth=(q,r,n)=>q.get('x-pin')===PIN?n():r.status(401).json({error:'bad pin'});
const up=multer({storage:multer.diskStorage({destination:path.join(__dirname,'public/uploads'),filename:(q,f,cb)=>cb(null,Date.now()+'-'+f.originalname.replace(/[^\w.]/g,''))}),limits:{fileSize:8e6}});
const clean=p=>({id:p.id||('p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)),name:String(p.name||'Untitled'),price:+p.price||0,category:p.category||'New Arrivals',sizes:[].concat(p.sizes||[]).filter(Boolean),colors:[].concat(p.colors||[]).filter(Boolean),description:p.description||'',images:[].concat(p.images||[]).filter(Boolean),sku:p.sku||'',qty:p.qty==null||p.qty===''?null:+p.qty,featured:!!p.featured,sample:!!p.sample,source:p.source||'manual'});
app.get('/api/products',(q,r)=>r.json(load()));
app.post('/api/login',(q,r)=>r.json({ok:q.body.pin===PIN}));
app.post('/api/products',auth,(q,r)=>{const d=load(),p=clean(q.body);d.push(p);save(d);r.json(p)});
app.put('/api/products/:id',auth,(q,r)=>{const d=load(),i=d.findIndex(x=>x.id===q.params.id);if(i<0)return r.sendStatus(404);d[i]=clean({...d[i],...q.body,id:d[i].id});save(d);r.json(d[i])});
app.delete('/api/products/:id',auth,(q,r)=>{save(load().filter(x=>x.id!==q.params.id));r.json({ok:true})});
app.delete('/api/samples',auth,(q,r)=>{save(load().filter(x=>!x.sample));r.json({ok:true})});
app.post('/api/import',auth,(q,r)=>{const d=load();let added=0,updated=0;for(const raw of q.body.products||[]){const p=clean({...raw,source:'rain-csv'});const i=p.sku?d.findIndex(x=>x.sku&&x.sku===p.sku):-1;if(i>=0){d[i]=clean({...d[i],...raw,id:d[i].id,images:p.images.length?p.images:d[i].images,source:'rain-csv'});updated++}else{d.push(p);added++}}save(d);r.json({added,updated})});
app.post('/api/upload',auth,up.single('image'),(q,r)=>r.json({url:'/uploads/'+q.file.filename}));
app.get(['/admin','/admin/'],(q,r)=>r.sendFile(path.join(__dirname,'public/admin.html')));
app.get('/api/backup',(q,r)=>q.query.pin===PIN?r.attachment('data.json').json(load()):r.sendStatus(401));

// ---- Stripe Checkout ----
const RAWKEY=process.env.STRIPE_SECRET_KEY||process.env.STRIPE_TEST_SECRET_KEY||'';
const KEY=/^(sk|rk)_(test|live)_/.test(RAWKEY)?RAWKEY:'';
if(RAWKEY&&!KEY)console.log('Stripe key ignored: it must be a SECRET key (sk_test_/sk_live_), not a publishable pk_ key. Demo checkout active.');
const stripe=KEY?require('stripe')(KEY):null;const SHIP=parseInt(process.env.SHIPPING_FLAT_CENTS||'800',10);
const PAID=path.join(__dirname,'paid-sessions.json');const paidSet=()=>{try{return new Set(JSON.parse(fs.readFileSync(PAID)))}catch{return new Set()}};
app.get('/api/config',(q,r)=>r.json({stripe:!!stripe,testMode:KEY.includes('_test_'),shippingCents:SHIP}));
const origin=q=>(q.get('x-forwarded-proto')||q.protocol)+'://'+q.get('host');
app.post('/api/checkout',async(q,r)=>{if(!stripe)return r.status(400).json({error:'Stripe not configured'});
 try{const d=load();const items=(q.body.items||[]).slice(0,50);const line_items=[];
 for(const it of items){const p=d.find(x=>x.id===it.id);const n=Math.max(1,Math.min(20,parseInt(it.q)||1));if(!p||!(p.price>0))continue;
  const opts=[it.sz,it.co].filter(v=>v&&(p.sizes.includes(v)||p.colors.includes(v)));const img=(p.images||[]).filter(u=>/^https:\/\//.test(u)).slice(0,1);
  line_items.push({quantity:n,price_data:{currency:'usd',unit_amount:Math.round(p.price*100),product_data:{name:p.name+(opts.length?' ('+opts.join(' / ')+')':''),images:img,metadata:{product_id:p.id,size:it.sz||'',color:it.co||''}}}})}
 if(!line_items.length)return r.status(400).json({error:'Bag is empty'});const o=origin(q);
 const s=await stripe.checkout.sessions.create({mode:'payment',line_items,allow_promotion_codes:true,automatic_tax:{enabled:false},
  shipping_address_collection:{allowed_countries:['US']},phone_number_collection:{enabled:true},
  shipping_options:[{shipping_rate_data:{display_name:'Local pickup',type:'fixed_amount',fixed_amount:{amount:0,currency:'usd'}}},{shipping_rate_data:{display_name:'Standard shipping',type:'fixed_amount',fixed_amount:{amount:SHIP,currency:'usd'}}}],
  success_url:o+'/#/success?session_id={CHECKOUT_SESSION_ID}',cancel_url:o+'/#/cart'});
 r.json({url:s.url})}catch(e){console.log('checkout error:',e.message);r.status(500).json({error:'Could not start checkout'})}});
app.get('/api/order/:sid',async(q,r)=>{if(!stripe)return r.sendStatus(400);
 try{const s=await stripe.checkout.sessions.retrieve(q.params.sid,{expand:['line_items.data.price.product']});
 if(s.payment_status==='paid'){const done=paidSet();if(!done.has(s.id)){const d=load();for(const li of s.line_items.data){const pid=li.price.product.metadata.product_id;const p=d.find(x=>x.id===pid);if(p&&p.qty!=null)p.qty=Math.max(0,p.qty-li.quantity)}save(d);done.add(s.id);fs.writeFileSync(PAID,JSON.stringify([...done]))}}
 r.json({id:s.id,paid:s.payment_status==='paid',total:s.amount_total,shipping:s.shipping_cost&&s.shipping_cost.amount_total,email:s.customer_details&&s.customer_details.email,items:s.line_items.data.map(l=>({name:l.description,q:l.quantity,amount:l.amount_total}))})}catch(e){r.status(404).json({error:'Order not found'})}});
app.get('/api/orders',auth,async(q,r)=>{if(!stripe)return r.json({stripe:false,orders:[]});
 try{const l=await stripe.checkout.sessions.list({status:'complete',limit:25,expand:['data.line_items']});
 r.json({stripe:true,orders:l.data.map(s=>({id:s.id,created:s.created,total:s.amount_total,paid:s.payment_status,name:s.customer_details&&s.customer_details.name,email:s.customer_details&&s.customer_details.email,phone:s.customer_details&&s.customer_details.phone,shipping:s.shipping_cost&&s.shipping_cost.amount_total,address:(s.collected_information&&s.collected_information.shipping_details||s.shipping_details||{}).address||null,items:(s.line_items?s.line_items.data:[]).map(x=>({name:x.description,q:x.quantity,amount:x.amount_total}))}))})}catch(e){console.log('orders error:',e.message);r.status(500).json({error:'Could not load orders'})}});
app.get('/healthz',(q,r)=>r.send('ok'));
const PORT=process.env.PORT||3000;app.listen(PORT,()=>console.log('Klik on '+PORT));
