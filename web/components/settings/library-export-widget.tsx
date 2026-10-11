'use client';
import { useState } from 'react';
import { ArrowDownToLine } from 'lucide-react';
import { getSavedPapers } from '@/lib/api';
export function LibraryExportWidget() {
 const [pending,setPending]=useState(false),[status,setStatus]=useState('');
 async function download(format:'csv'|'json'){
  setPending(true);setStatus('');
  try{
   const result=await getSavedPapers();const rows=(result.data||[]).map(p=>({paper_id:p.paper_id,title:p.title,doi:p.doi||'',collection:p.collection_name||'Saved Papers',saved_at:p.saved_at||'',authors:(p.authors||[]).map((a:{full_name?:string})=>a.full_name).join('; ')}));
   const csv=(value:unknown)=>{const raw=String(value??'');const safe=/^[\s]*[=+@-]/.test(raw)?`'${raw}`:raw;return `"${safe.replaceAll('"','""')}"`;};
   const keys=['paper_id','title','doi','collection','saved_at','authors'];
   const text=format==='json'?JSON.stringify(rows,null,2):[keys.join(','),...rows.map(row=>keys.map(key=>csv(row[key as keyof typeof row])).join(','))].join('\r\n');
   const url=URL.createObjectURL(new Blob([text],{type:format==='json'?'application/json':'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=`researchhub-library.${format}`;link.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus(`Exported ${rows.length} saved publications.`);
  }catch(error){setStatus(error instanceof Error?error.message:'Unable to export your library.');}finally{setPending(false);}
 }
 return <section className="rh-export-library"><div><ArrowDownToLine size={20}/><h3>Take your library with you.</h3><p>Download your saved papers, author names, and collection assignments.</p></div><div><button disabled={pending} onClick={()=>download('csv')}>Export CSV ↗</button><button disabled={pending} onClick={()=>download('json')}>Export JSON ↗</button></div>{status?<p role="status">{status}</p>:null}</section>;
}
