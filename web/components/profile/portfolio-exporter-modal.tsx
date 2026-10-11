'use client';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { exportCitation, type PaperSummary } from '@/lib/api';
const html = (value: string) => value.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));
export function PortfolioExporterModal({ authorName, papers, isOpen, onClose }: { authorName: string; papers: PaperSummary[]; isOpen: boolean; onClose: () => void }) {
  const [format,setFormat]=useState('markdown'),[code,setCode]=useState(''),[error,setError]=useState(''),[pending,setPending]=useState(false);
  const close=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(!isOpen)return;const previous=document.activeElement as HTMLElement;close.current?.focus();return()=>previous?.focus();},[isOpen]);
  useEffect(()=>{if(!isOpen)return;let active=true;setError('');setPending(true);
    async function generate(){
      if(format==='bib'){const citations=await Promise.all(papers.map(async paper=>{const result=await exportCitation(paper.paper_id,'bib');if(!result.data?.content)throw new Error(`No citation available for ${paper.title}.`);return result.data.content;}));return citations.join('\n\n');}
      if(format==='html')return `<section>\n<h2>${html(authorName)} — Publications</h2>\n<ul>\n${papers.map(paper=>`<li>${html(paper.title)}${paper.publication_date?` (${new Date(paper.publication_date).getFullYear()})`:''}${paper.doi?` — DOI: ${html(paper.doi)}`:''}</li>`).join('\n')}\n</ul>\n</section>`;
      return `# Publications by ${authorName}\n\n${papers.map(paper=>`- ${paper.title}${paper.publication_date?` (${new Date(paper.publication_date).getFullYear()})`:''}${paper.doi?` — DOI: ${paper.doi}`:''}`).join('\n')}`;
    }
    generate().then(value=>{if(active)setCode(value);}).catch(cause=>{if(active){setCode('');setError(cause.message);}}).finally(()=>{if(active)setPending(false);});return()=>{active=false;};
  },[isOpen,format,papers,authorName]);
  if(!isOpen)return null;
  async function copy(){try{await navigator.clipboard.writeText(code);setError('Copied to clipboard.');}catch{setError('Clipboard access failed. You can select and copy the text below.');}}
  function download(){const url=URL.createObjectURL(new Blob([code],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=`researchhub-publications.${format==='markdown'?'md':format}`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <div className="fixed inset-0 z-[150] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Export your publications" onKeyDown={event=>{if(event.key==='Escape')onClose();if(event.key==='Tab'){const targets=event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),textarea');if(event.shiftKey&&document.activeElement===targets[0]){event.preventDefault();targets[targets.length-1]?.focus();}else if(!event.shiftKey&&document.activeElement===targets[targets.length-1]){event.preventDefault();targets[0]?.focus();}}}}><section className="w-full max-w-xl space-y-5 rounded-lg border border-line bg-paper p-6 dark:bg-darkCard"><div className="flex items-center justify-between gap-4"><h2 className="font-serif text-3xl">Your work, to take away.</h2><button ref={close} onClick={onClose} aria-label="Close publication export"><X size={22}/></button></div><p className="text-sm text-muted">Exports the {papers.length} publication records currently linked to your profile.</p><div className="rh-feed-tabs">{['markdown','bib','html'].map(value=><button key={value} aria-pressed={value===format} onClick={()=>setFormat(value)}>{value==='bib'?'BibTeX':value.toUpperCase()}</button>)}</div><label className="block text-sm">Publication export<textarea readOnly value={pending?'Preparing your records…':code} rows={8} className="mt-2 w-full rounded border border-line bg-canvas p-3 font-mono text-xs dark:bg-darkPanel"/></label>{error?<p role="status" className="text-sm">{error}</p>:null}<div className="flex gap-5 text-sm"><button disabled={pending||!code} onClick={copy}>Copy text ↗</button><button disabled={pending||!code} onClick={download}>Download file ↗</button></div></section></div>;
}
