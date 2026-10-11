'use client';
import { useId, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Bookmark, FileText, MoreHorizontal, Quote } from 'lucide-react';
import { createFeedAction, exportCitation, followAuthor, followResearcher, getCollections, recommendPaper, requestFullText, savePaper, submitReport, type CollectionSummary, type PaperSummary } from '@/lib/api';

function authorName(author: NonNullable<PaperSummary['authors']>[number]) {return author.full_name||author.name||'Unnamed author';}
export function PaperCard({paper,featured=false,onDismiss}:{paper:PaperSummary;featured?:boolean;onDismiss?:()=>void}){
  const id=useId();
  const [status,setStatus]=useState('');const [pending,setPending]=useState(false);
  const [recommended,setRecommended]=useState(false);const [saved,setSaved]=useState(false);
  const [saveOpen,setSaveOpen]=useState(false);const [collections,setCollections]=useState<CollectionSummary[]>([]);
  const [collection,setCollection]=useState('Saved Papers');const [reportOpen,setReportOpen]=useState(false);
  const [imageFailed,setImageFailed]=useState(false);
  const authors=[...(paper.authors||[])].sort((a,b)=>(a.author_order||0)-(b.author_order||0));const lead=authors[0];
  async function action(task:()=>Promise<unknown>,success:string){
    if(pending)return;setPending(true);setStatus('');
    try{await task();setStatus(success);}catch(error){setStatus(error instanceof Error?error.message:'This action could not be completed.');}finally{setPending(false);}
  }
  async function openSave(){
    setSaveOpen(value=>!value);if(saveOpen)return;
    try{const result=await getCollections();setCollections(result.data||[]);}catch(error){setStatus(error instanceof Error?error.message:'Unable to load your library.');}
  }
  async function save(event:FormEvent<HTMLFormElement>){event.preventDefault();await action(async()=>{await savePaper(paper.paper_id,collection.trim()||'Saved Papers');setSaved(true);setSaveOpen(false);},`Saved to ${collection.trim()||'Saved Papers'}.`);}
  async function cite(format='bib'){
    await action(async()=>{const result=await exportCitation(paper.paper_id,format);const text=result.data?.content||result.data?.citation||result.citation||result.content;if(!text)throw new Error('This record has no citation to export.');await navigator.clipboard.writeText(text);},`${format==='bib'?'BibTeX':format.toUpperCase()} citation copied.`);
  }
  async function follow(){await action(async()=>{if(!lead)throw new Error('There is no linked author record yet.');if(lead.claimed_user_id)await followResearcher(lead.claimed_user_id);else await followAuthor(lead.author_id);},lead?`Following ${authorName(lead)}.`:'');}
  async function report(event:FormEvent<HTMLFormElement>){event.preventDefault();const data=new FormData(event.currentTarget);await action(async()=>{await submitReport({target_type:'paper',target_id:paper.paper_id,reason_code:String(data.get('reason')||'other'),details:String(data.get('details')||'')});setReportOpen(false);},'Your report has been submitted for review.');}
  const date=paper.publication_date?new Date(paper.publication_date).toLocaleDateString('en-GB',{month:'short',year:'numeric'}):'Undated';
  return <article className="rh-publication" aria-labelledby={`${id}-title`}>
    <div className="rh-paper-meta"><span className="rh-paper-type"><FileText size={12}/>{paper.publication_type||(featured?'preprint':'article')}</span>{paper.is_open_access?<span>OPEN ACCESS</span>:null}<span className="rh-paper-date">{date}</span></div>
    {paper.cover_image_url&&!imageFailed?<Link href={`/papers/${paper.paper_id}`} tabIndex={-1} aria-hidden="true"><img className="rh-paper-cover" src={paper.cover_image_url} alt="" loading="lazy" onError={()=>setImageFailed(true)}/></Link>:null}
    <h2 className="rh-paper-title" id={`${id}-title`}><Link href={`/papers/${paper.paper_id}`}>{paper.title}</Link></h2>
    {paper.abstract?<p className="rh-paper-abstract">{paper.abstract}</p>:null}
    <div className="rh-paper-authors">{authors.length?authors.slice(0,5).map((author,index)=><span key={`${author.author_id}-${index}`}><Link href={author.claimed_profile_slug?`/researchers/${author.claimed_profile_slug}`:`/authors/${author.author_id}`}>{authorName(author)}</Link>{index<Math.min(authors.length,5)-1?' · ':''}</span>):<span>Author details not provided</span>}{authors.length>5?<span>+{authors.length-5} more</span>:null}</div>
    {paper.journal_name?<p className="rh-paper-journal">{paper.journal_name}</p>:null}
    <div className="rh-paper-bottom"><div className="rh-paper-metrics"><span><strong>{(paper.citation_count||0).toLocaleString()}</strong> citations</span><span><strong>{(paper.view_count||0).toLocaleString()}</strong> reads</span></div><div className="rh-paper-actions">
      <button type="button" className="rh-paper-action" aria-expanded={saveOpen} onClick={openSave} disabled={pending}><Bookmark size={14} fill={saved?'currentColor':'none'}/>{saved?'Saved':'Save'}</button>
      <button type="button" className="rh-paper-action" onClick={()=>cite()} disabled={pending}><Quote size={14}/>Cite</button>
      <details className="rh-paper-more"><summary aria-label={`More actions for ${paper.title}`}><MoreHorizontal size={18}/></summary><div><button disabled={pending} onClick={()=>action(()=>requestFullText(paper.paper_id),'Full-text email request queued. Delivery depends on email configuration.')}>Request full text</button><button disabled={pending} onClick={follow}>Follow author</button><button disabled={pending||recommended} onClick={()=>action(async()=>{await recommendPaper(paper.paper_id);setRecommended(true);},'Publication recommended.')}>{recommended?'Recommended':'Recommend'}</button><button disabled={pending} onClick={()=>action(()=>navigator.clipboard.writeText(`${location.origin}/papers/${paper.paper_id}`),'Paper link copied.')}>Copy link</button><button disabled={pending} onClick={()=>cite('ris')}>Export RIS citation</button><button disabled={pending} onClick={()=>action(async()=>{await createFeedAction(paper.paper_id,'not_interested');onDismiss?.();},'Your feed preference was saved.')}>Not interested</button><button onClick={()=>setReportOpen(value=>!value)}>Report a concern</button></div></details>
      <Link href={`/papers/${paper.paper_id}`} className="rh-paper-action" aria-label={`Read ${paper.title}`}><ArrowUpRight size={16}/></Link>
    </div></div>
    {saveOpen?<div className="rh-paper-save"><form onSubmit={save}><div className="min-w-0 flex-1"><label htmlFor={`${id}-collection`}>Save to your reading library</label><input id={`${id}-collection`} list={`${id}-collections`} value={collection} maxLength={100} onChange={event=>setCollection(event.target.value)} placeholder="Collection name" className="w-full"/><datalist id={`${id}-collections`}>{collections.map(item=><option key={item.collection_id||item.name} value={item.name}/>)}</datalist></div><button type="submit" disabled={pending}>Save</button></form></div>:null}
    {reportOpen?<form onSubmit={report} className="rh-paper-save space-y-3"><label htmlFor={`${id}-reason`}>What should the moderation team review?</label><select id={`${id}-reason`} name="reason" className="w-full border border-line bg-paper p-2 text-xs"><option value="copyright">Copyright concern</option><option value="spam">Spam or misleading information</option><option value="harassment">Harassment</option><option value="other">Other</option></select><label htmlFor={`${id}-details`}>Details</label><textarea id={`${id}-details`} name="details" required maxLength={2000} className="w-full border border-line bg-paper p-2 text-xs"/><button type="submit" disabled={pending}>Submit report</button></form>:null}
    {status?<p className="rh-paper-feedback" role="status">{status}</p>:null}
  </article>;
}
