/** RUNLAB — Google Apps Script backend
 * Deploy as Web App: Execute as Me; Access Anyone.
 * IMPORTANT: Set Script Property RUNLAB_SECRET to a long random secret.
 * Never put the secret in public GitHub source.
 */
const BOOKS = {
  a: '15Vj5BtU41sf_r_r9I0DWZDVAhTDrnrkpQDOFkuvA454',
  h: '10eUPwmdqOvtatK1lGJgWhJoDoQVpUPfHKKXedYn37BA'
};
const TAB = 'RUNLAB SYNC';
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const secret = PropertiesService.getScriptProperties().getProperty('RUNLAB_SECRET');
    if (!secret || String(body.token || '') !== secret) throw Error('Tidak dibenarkan');
    const action = body.action;
    if (action === 'pull') {
      const out = {};
      for (const who of ['a','h']) {
        const rows = SpreadsheetApp.openById(BOOKS[who]).getSheetByName(TAB).getDataRange().getValues();
        out[who] = rows.slice(1).filter(r => r[0]).map(r => ({
          id:String(r[0]),date:String(r[1]),who,kind:String(r[3]),type:String(r[4]),
          km:Number(r[5])||0,minutes:Number(r[6])||0,hr:r[7]||null,rpe:r[8]||null,
          status:String(r[9]),notes:String(r[10]||'')
        }));
      }
      return reply({ok:true,rows:out});
    }
    if (action === 'push') {
      const entries = body.entries;
      if (!Array.isArray(entries) || entries.length > 200) throw Error('Had 200 rekod');
      const counts={a:0,h:0};
      for (const who of ['a','h']) {
        const sheet=SpreadsheetApp.openById(BOOKS[who]).getSheetByName(TAB);
        const last=sheet.getLastRow();
        const existing=last>1?sheet.getRange(2,1,last-1,1).getValues().map(r=>String(r[0])):[];
        const lookup=new Map(existing.map((id,i)=>[id,i+2]));
        for (const x of entries.filter(x=>x.who===who)) {
          const id=String(x.id||'').slice(0,120);
          const date=String(x.date||'');
          if (!id || !/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) continue;
          const row=[id,date,who,String(x.kind||'log').slice(0,40),
            String(x.type||'').slice(0,100),Number(x.km)||0,Number(x.minutes)||0,
            Number(x.hr)||'',Number(x.rpe)||'',String(x.status||'').slice(0,30),
            String(x.notes||'').slice(0,500),new Date().toISOString()];
          if (lookup.has(id)) sheet.getRange(lookup.get(id),1,1,12).setValues([row]);
          else {sheet.appendRow(row);lookup.set(id,sheet.getLastRow())}
          counts[who]++;
        }
      }
      return reply({ok:true,counts});
    }
    throw Error('Tindakan tidak sah');
  } catch(err) {return reply({ok:false,error:String(err.message||err)})}
}
function reply(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}
