import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const child=spawn(process.execPath,['node_modules/@angular/cli/bin/ng.js','serve','--host','127.0.0.1','--port','14200'],{stdio:['ignore','pipe','pipe']});
let logs='';for(const stream of [child.stdout,child.stderr])stream.on('data',b=>{logs=(logs+b).slice(-4000);});
let browser;
const types=['COMMUNITIES','SENSORS','READINGS','ALERTS','EVENTS','SENSOR_STATUS','CLIMATE_STATISTICS','EXECUTIVE'].map(id=>({id,name:id}));
const violations=[];
try {
  let ready=false;for(let i=0;i<90;i++){if(await fetch('http://127.0.0.1:14200').then(r=>r.ok).catch(()=>false)){ready=true;break;}await delay(500);}
  assert.ok(ready,logs);browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL??'msedge'});
  for(const role of ['Administrator','Operator','Viewer']){
    const page=await browser.newPage({viewport:{width:1440,height:1000}});const reports=[];const errors=[];let historyFailure=role==='Administrator';
    page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(({role})=>localStorage.setItem('climate-monitoring.session',JSON.stringify({accessToken:'browser-test-session',expiresAt:new Date(Date.now()+3600000).toISOString(),user:{id:'11111111-1111-4111-8111-111111111111',username:'tester',email:'test@example.com',role,isActive:true}})),{role});
    await page.route('**/runtime-config.json',route=>route.fulfill({json:{production:false,apiUrl:'http://127.0.0.1:18090',realtime:{enabled:false,hubUrl:'http://127.0.0.1:18090/hubs/monitoring'}}}));
    await page.route('**/api/**',route=>{
      const pathname=new URL(route.request().url()).pathname;
      if(pathname.endsWith('/types'))return route.fulfill({json:types});
      if(pathname.endsWith('/generate')){
        const body=route.request().postDataJSON();reports.unshift({id:'44444444-4444-4444-8444-444444444444',type:body.type,parameters:body.filters,status:'COMPLETED',progress:100,userName:'tester',generatedAt:new Date().toISOString(),rowCount:1,fileName:'climate.pdf',downloadedAt:null,error:null});
        return route.fulfill({status:202,json:reports[0]});
      }
      if(pathname.endsWith('/download'))return route.fulfill({headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="climate.pdf"'},body:Buffer.from('%PDF-1.7\n%%EOF')});
      if(pathname.endsWith('/reports')){
        if(historyFailure){historyFailure=false;return route.fulfill({status:503,json:{status:503,title:'Test dependency unavailable'}});}
        return route.fulfill({json:{items:reports,total:reports.length,page:1,pageSize:25}});
      }
      return route.fulfill({json:[]});
    });
    await page.goto('http://127.0.0.1:14200/reports');await page.getByRole('heading',{name:'Reportes',exact:true}).waitFor();
    assert.equal(await page.getByRole('button',{name:'Generar PDF',exact:true}).count(),role==='Viewer'?0:1);
    if(role==='Administrator'){
      await page.getByText('No se pudo consultar el historial. Se reintentará automáticamente.',{exact:true}).waitFor();
      await page.getByRole('button',{name:'Actualizar',exact:true}).click();
      await page.getByText('No se pudo consultar el historial. Se reintentará automáticamente.',{exact:true}).waitFor({state:'hidden'});
    }
    await page.getByText('Aún no hay reportes.',{exact:true}).waitFor();
    if(role!=='Viewer'){
      await page.locator('select[name="type"]').selectOption('READINGS');
      assert.equal(await page.locator('select[name="sensor"]').count(),1);
      assert.equal(await page.locator('input[name="municipality"]').count(),0);
      await page.getByRole('button',{name:'Generar PDF',exact:true}).click();
      await page.getByText('Este reporte requiere ambas fechas.',{exact:true}).waitFor();
      assert.equal(await page.locator('form').getAttribute('aria-describedby'),'reports-error');
      await page.locator('select[name="type"]').selectOption('COMMUNITIES');
      assert.equal(await page.locator('select[name="sensor"]').count(),0);
      assert.equal(await page.locator('input[name="municipality"]').count(),1);
      await page.getByRole('button',{name:'Generar PDF',exact:true}).click();await page.getByRole('button',{name:'Detalle',exact:true}).waitFor();
      assert.equal(await page.getByRole('button',{name:'Descargar PDF',exact:true}).count(),role==='Administrator'?1:0);
      if(role==='Administrator'){
        const download=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar PDF',exact:true}).click();assert.equal((await download).suggestedFilename(),'climate.pdf');
      }
    }
    for(const width of [1440,375]){
      await page.setViewportSize({width,height:900});await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
      const result=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa', 'wcag22aa']}}));
      violations.push({role,width,violations:result.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}))});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');
    }
    assert.deepEqual(errors,[]);await page.close();
  }
  await mkdir('test-results/browser',{recursive:true});await writeFile('test-results/browser/reports-accessibility.json',JSON.stringify(violations,null,2));
  assert.ok(violations.every(x=>x.violations.length===0),JSON.stringify(violations));
  console.log('PASS reports UI: three roles, generation, download, mobile layout, six axe accessibility scans. API responses mocked; PDFs validated separately with real services.');
} finally {
  await browser?.close();if(child.exitCode===null&&child.signalCode===null){child.kill();await once(child,'exit');}
}
