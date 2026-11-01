const u=id=>`https://images.unsplash.com/${id}?w=800&q=80&auto=format&fit=crop`;
const S=['XS','S','M','L','XL'];
const items=[
['Linen Wrap Midi Dress',78,'Dresses',['Sage','Sand'],'photo-1595777457583-95e059d581b8',1,'Breezy wrap silhouette in washed linen with a tie waist.'],
['Floral Tiered Maxi Dress',92,'Dresses',['Blush Floral'],'photo-1572804013309-59a88b7e92f1',1,'Romantic tiered maxi with flutter sleeves.'],
['Satin Slip Dress',68,'Dresses',['Champagne','Black'],'photo-1566174053879-31528523f8ae',0,'Bias-cut satin slip for evenings out.'],
['Ribbed Knit Cardigan',58,'Tops',['Oat','Cocoa'],'photo-1434389677669-e08b4cac3105',1,'Cozy cropped cardigan with pearl buttons.'],
['Silk Button-Up Blouse',74,'Tops',['Ivory','Dusty Rose'],'photo-1551163943-3f6a855d1153',0,'Relaxed fit washable silk blouse.'],
['Everyday Cotton Tee',28,'Tops',['White','Black','Heather'],'photo-1521572163474-6864f9cf17ab',0,'Soft, slightly boxy staple tee.'],
['High-Rise Wide Leg Jeans',88,'Bottoms',['Light Wash','Indigo'],'photo-1541099649105-f69ad21f3246',1,'Flattering high rise with a full wide leg.'],
['Pleated Midi Skirt',62,'Bottoms',['Mocha','Olive'],'photo-1583496661160-fb5886a0aaaa',0,'Fluid pleats that move beautifully.'],
['Tailored Linen Trousers',72,'Bottoms',['Natural','Black'],'photo-1594633312681-425c7b97ccd1',0,'Easy pull-on trousers with a crisp drape.'],
['Oversized Wool Blazer',128,'Outerwear',['Camel','Charcoal'],'photo-1591047139829-d91aecb6caea',1,'Relaxed shoulder blazer in a wool blend.'],
['Woven Straw Tote',48,'Accessories',['Natural'],'photo-1590874103328-eac38a683ce7',0,'Roomy hand-woven tote with leather handles.'],
['Gold Layered Necklace',38,'Accessories',['Gold'],'photo-1599643478518-a784e5dc4c8f',0,'Dainty layered chains, tarnish resistant.']];
module.exports=items.map((x,i)=>({id:'sample'+(i+1),name:x[0],price:x[1],category:x[2],colors:x[3],sizes:x[2]==='Accessories'?['One Size']:S,images:[u(x[4])],featured:!!x[5],description:x[6]+' (Sample product)',sku:'KLIK-S'+(100+i),qty:10,sample:true,source:'sample'}));
