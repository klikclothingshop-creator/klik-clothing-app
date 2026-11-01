const {chromium}=require('playwright');const U=process.argv[2],sfx=process.argv[3]||'';
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true});const p=await c.newPage();
await p.goto(U+'/');await p.waitForTimeout(3000);await p.screenshot({path:'screenshots/home'+sfx+'.png'});
await p.goto(U+'/#/p/sample1');await p.waitForTimeout(2500);await p.screenshot({path:'screenshots/product'+sfx+'.png'});await b.close()})();
