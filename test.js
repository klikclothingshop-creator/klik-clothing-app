const {chromium}=require('playwright');const U=process.argv[2];
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await c.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(U+'/admin');await p.fill('#pin',process.env.ADMIN_PIN||'');await p.click('#lg');await p.waitForSelector('#tb tr');
await p.fill('#f_name','Test Admin Sweater');await p.fill('#f_price','49');await p.fill('#f_category','Tops');await p.fill('#f_sizes','S, M');await p.fill('#f_images','https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80');await p.click('#sv');await p.waitForTimeout(800);
await p.setInputFiles('#csv','sample-rain-export.csv');await p.waitForSelector('#pv');await p.click('#pv');console.log(await p.textContent('#prev'));await p.click('#go');await p.waitForTimeout(800);console.log('count',await p.textContent('#cnt'));
await p.screenshot({path:'screenshots/admin.png',fullPage:false});
for(const [h,n] of [['#/','home'],['#/shop','shop'],['#/p/sample1','product']]){await p.goto(U+'/'+h);await p.waitForTimeout(2500);await p.screenshot({path:`screenshots/${n}.png`})}
await p.click('#add');await p.goto(U+'/#/cart');await p.waitForTimeout(800);await p.screenshot({path:'screenshots/cart.png'});await b.close()})();
