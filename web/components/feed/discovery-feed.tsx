'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Compass, RotateCcw } from 'lucide-react';
import { getGlobalFeed, type PaperSummary } from '@/lib/api';
import { PaperCard } from '@/components/papers/paper-card';
import { Button } from '@/components/ui/button';

export function DiscoveryFeed() {
  const [papers,setPapers]=useState<PaperSummary[]>([]);
  const [cursor,setCursor]=useState<string|null>(null);
  const [hasMore,setHasMore]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [sort,setSort]=useState('selected');
  const generation=useRef(0);
  const load=useCallback(async(nextCursor?:string)=>{
    const request=++generation.current;setLoading(true);setError('');
    try{
      const result=await getGlobalFeed({cursor:nextCursor,limit:12});
      if(request!==generation.current)return;
      setPapers(current=>nextCursor?[...current,...(result.data||[])]:result.data||[]);
      setCursor(result.pagination?.next_cursor||null);setHasMore(Boolean(result.pagination?.has_more));
    }catch(cause){if(request===generation.current)setError(cause instanceof Error?cause.message:'Unable to load research.');}
    finally{if(request===generation.current)setLoading(false);}
  },[]);
  useEffect(()=>{void load();return()=>{generation.current++;};},[load]);
  const ordered=[...papers].sort((a,b)=>sort==='latest'?new Date(b.publication_date||0).getTime()-new Date(a.publication_date||0).getTime():sort==='cited'?(b.citation_count||0)-(a.citation_count||0):0);
  return <div className="rh-feed-layout">
    <section aria-label="Research publications" aria-busy={loading}>
      <div className="rh-feed-toolbar"><span>ON YOUR READING DESK</span><div className="rh-feed-tabs" aria-label="Sort loaded publications">{[['selected','For you'],['latest','Latest'],['cited','Most cited']].map(([value,label])=><button key={value} type="button" aria-pressed={sort===value} onClick={()=>setSort(value)}>{label}</button>)}</div></div>
      <p className="rh-load-status" role="status">{loading?'Opening the reading room…':error?'The reading room couldn’t connect.':papers.length?`${papers.length} publications on your desk · ${sort==='selected'?'selected by your interests and connections':'sorted within this loaded set'}`:'Your reading desk is ready for its first publication.'}</p>
      {error?<div className="rh-empty" role="alert"><RotateCcw size={26}/><h2>A moment between chapters.</h2><p>{error}</p><button type="button" onClick={()=>load(cursor&&papers.length?cursor:undefined)}>Try again ↗</button></div>:null}
      <div className="rh-feed-list">{ordered.map(paper=><PaperCard key={paper.paper_id} paper={paper} onDismiss={()=>setPapers(current=>current.filter(item=>item.paper_id!==paper.paper_id))}/>)}</div>
      {!loading&&!error&&!papers.length?<div className="rh-empty"><BookOpen size={30}/><h2>Every good idea starts somewhere.</h2><p>Explore a field or share a publication. Following researchers brings their work to your desk.</p><Link href="/search">Find your first paper ↗</Link></div>:null}
      {hasMore&&!error?<div className="mt-6 flex justify-center"><Button variant="secondary" disabled={loading} onClick={()=>load(cursor||undefined)}>{loading?'Opening more research…':'More for your reading desk'} <ArrowUpRight size={14}/></Button></div>:null}
    </section>
    <aside className="rh-feed-aside" aria-label="Ideas to explore">
      <h2 className="rh-aside-heading"><Compass size={15}/> FOLLOW YOUR CURIOSITY</h2>
      <div className="rh-topic-list">{['Computer science','Climate & environment','Physics','Biological sciences','Engineering'].map((field,index)=><Link key={field} href={`/search?q=${encodeURIComponent(field)}`}><span>0{index+1}</span>{field}<ArrowUpRight size={12} className="ml-auto"/></Link>)}</div>
      <div className="rh-aside-note"><span aria-hidden="true">✳</span><h2>Ideas travel<br/>better together.</h2><p>A question asked in the right room can become your next collaboration.</p><Link href="/questions">Ask the community <ArrowUpRight size={14}/></Link></div>
    </aside>
  </div>;
}
