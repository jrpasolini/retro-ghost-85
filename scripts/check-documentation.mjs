import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('..',import.meta.url));
const required=['README.md','README.pt-BR.md','LICENSE','CREDITS.md','THIRD_PARTY_NOTICES.md','CONTRIBUTING.md','docs/README.md','docs/ARCHITECTURE.md','docs/DEPLOYMENT.md','docs/ASSETS.md','docs/RELEASE_REVIEW.md','docs/archive/README.md','workers/narrator/README.md','public/licenses/MIT.txt','public/licenses/chakra-petch-OFL.txt','public/licenses/press-start-2p-OFL.txt'];
const errors=[];
for(const name of required)if(!existsSync(path.join(root,name)))errors.push('Missing '+name);
const pkg=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));
const lock=JSON.parse(readFileSync(path.join(root,'package-lock.json'),'utf8'));
if(pkg.license!=='MIT')errors.push('Package license must be MIT');
if(pkg.version!==lock.version||pkg.version!==lock.packages[''].version)errors.push('Package and lockfile versions differ');
if(!readFileSync(path.join(root,'src/i18n/content.ts'),'utf8').includes('DEFAULT_LANGUAGE: Idioma = "en-US"'))errors.push('English must remain the fresh-visit default');
if(readFileSync(path.join(root,'LICENSE'),'utf8')!==readFileSync(path.join(root,'public/licenses/MIT.txt'),'utf8'))errors.push('Distributed MIT notice differs');
let media=0;
const inventory=readFileSync(path.join(root,'docs/ASSETS.md'),'utf8');
for(const match of inventory.matchAll(/\| \[([^\]]+)\]\([^)]+\) \| \d+ \| `([a-f0-9]{64})` \|/g)){
  const file=path.join(root,match[1]);media++;
  if(!existsSync(file)||createHash('sha256').update(readFileSync(file)).digest('hex')!==match[2])errors.push('Media checksum changed: '+match[1]);
}
if(media!==20)errors.push('Expected twenty preserved media records');
const current=required.filter(name=>name.endsWith('.md'));
let links=0;
for(const name of current){
 const source=readFileSync(path.join(root,name),'utf8');
 for(const match of source.matchAll(/\]\(([^)]+)\)/g)){
  let href=match[1].trim().replace(/^<|>$/g,'');
  if(/^(?:https?:|mailto:|#|data:)/.test(href))continue;
  href=decodeURIComponent(href.split('#')[0]);if(!href)continue;
  links++;
  if(!existsSync(path.resolve(root,path.dirname(name),href)))errors.push(`${name}: broken local link ${href}`);
 }
}
for(const name of ['README.md','README.pt-BR.md','workers/narrator/README.md','.env.example','src/config.ts']){
 if(/To be determined\.|A definir\.|does not call (?:it|this) yet|still uses the local narration stub/.test(readFileSync(path.join(root,name),'utf8')))errors.push('Obsolete active documentation: '+name);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Documentation, license, English default, ${links} local links and ${media} media checksums verified.`);
