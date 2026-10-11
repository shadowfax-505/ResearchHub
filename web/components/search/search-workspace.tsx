'use client';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowUpRight, Search, SlidersHorizontal } from 'lucide-react';
import { unifiedSearch, getSearchFacets, type PaperSummary } from '@/lib/api';
import { PaperCard } from '@/components/papers/paper-card';

const types = [['publications','Publications'],['researchers','Researchers'],['authors','Authors'],['questions','Questions'],['projects','Projects'],['jobs','Opportunities'],['journals','Journals'],['topics','Topics']];
type DirectoryItem = { paper_id?:number; user_id?:number; author_id?:number; question_id?:number; project_id?:number; job_id?:number; entity_id?:number; entity_type?:string; slug?:string; title?:string; name?:string; full_name?:string; keyword?:string; headline?:string; description?:string; bio?:string; body?:string; affiliation?:string; location?:string; country?:string; employer?:string; answer_count?:number };
type Facet = { id:string|number; name:string; count:number };
type Facets = { fields?:Facet[]; journals?:Facet[]; publication_types?:Facet[]; languages?:Facet[] };
const filterKeys = ['sort','field_id','journal_id','year_from','year_to','publication_type','is_open_access','is_peer_reviewed','has_full_text'];

export function SearchWorkspace({initialQuery=''}:{initialQuery?:string}) {
  const [draft,setDraft]=useState(initialQuery),[query,setQuery]=useState(initialQuery);
  const [type,setType]=useState('publications'),[filters,setFilters]=useState<Record<string,string>>({sort:'relevance'});
  const [items,setItems]=useState<DirectoryItem[]>([]),[facets,setFacets]=useState<Facets>({});
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[ready,setReady]=useState(false);
  const [offset,setOffset]=useState(0),[more,setMore]=useState(false);
  const generation=useRef(0);
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const initial=params.get('q')||initialQuery;setDraft(initial);setQuery(initial);
    if(types.some(([key])=>key===params.get('type')))setType(params.get('type')!);
    const next:Record<string,string>={sort:'relevance'};filterKeys.forEach(key=>{if(params.get(key))next[key]=params.get(key)!;});setFilters(next);setReady(true);
  },[initialQuery]);
  const load=useCallback(async(nextOffset=0)=>{
    const id=++generation.current;setLoading(true);setError('');
    try{
      const result=await unifiedSearch(query,type,{...filters,offset:nextOffset,limit:12});
      if(id!==generation.current)return;
      setItems(current=>nextOffset?[...current,...(result.data||[])]:result.data||[]);setMore(Boolean(result.pagination?.has_more));setOffset(nextOffset);
      const params=new URLSearchParams({q:query,type,...filters});window.history.replaceState(null,'',`/search?${params}`);
    }catch(cause){if(id===generation.current)setError(cause instanceof Error?cause.message:'Search could not connect.');}
    finally{if(id===generation.current)setLoading(false);}
  },[query,type,filters]);
  useEffect(()=>{if(!ready)return;setItems([]);setMore(false);void load();return()=>{generation.current++;};},[load,ready]);
  useEffect(()=>{if(!ready||type!=='publications')return;let active=true;getSearchFacets(query).then(result=>{if(active)setFacets(result.data||{});}).catch(()=>{if(active)setFacets({});});return()=>{active=false;};},[query,type,ready]);
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const next=draft.trim();if(next===query)void load();else setQuery(next);}
  function update(key:string,value:string){setFilters(current=>{const next={...current};if(value)next[key]=value;else delete next[key];return next;});}
  const activeFilters=Object.entries(filters).filter(([key,value])=>key!=='sort'&&value).length;
  function destination(item:DirectoryItem):Route|undefined{
    if(type==='researchers'&&item.slug)return `/researchers/${item.slug}` as Route;
    if(type==='authors')return `/authors/${item.author_id}` as Route;
    if(type==='questions')return `/questions?question=${item.question_id}` as Route;
    if(type==='projects')return '/projects';
    if(type==='jobs')return `/jobs/${item.job_id}` as Route;
    if(type==='topics')return `/search?q=${encodeURIComponent(item.name||'')}` as Route;
  }
  return <div className="rh-search-workspace">
    <form className="rh-search-form" onSubmit={submit} role="search"><Search size={22} strokeWidth={1.4}/><label className="sr-only" htmlFor="research-query">Search publications, people, or ideas</label><input id="research-query" value={draft} onChange={event=>setDraft(event.target.value)} maxLength={500} placeholder="What are you curious about?"/><button type="submit" disabled={loading}>Search <ArrowUpRight size={17}/></button></form>
    <div className="rh-search-types" aria-label="Result type">{types.map(([key,label])=><button type="button" key={key} aria-pressed={type===key} onClick={()=>setType(key)}>{label}</button>)}</div>
    <div className="rh-search-grid">
      <section aria-label="Search results" aria-busy={loading}>
        <div className="rh-results-heading"><span className="rh-micro">{query?`EXPLORING “${query}”`:'AN OPEN INVITATION TO EXPLORE'}</span><span role="status">{loading?'Finding connections…':error?'Connection interrupted':`${items.length} results loaded`}</span></div>
        {error?<div className="rh-empty" role="alert"><h2>A question worth trying again.</h2><p>{error}</p><button onClick={()=>load(offset||0)}>Try again ↗</button></div>:null}
        <div className="rh-search-results">{items.map((item,index)=>type==='publications'?<PaperCard key={item.paper_id} paper={item as PaperSummary}/>:<article className="rh-directory-card" key={`${type}-${item.user_id||item.author_id||item.question_id||item.project_id||item.job_id||item.entity_id||index}`}>
          <span className="rh-directory-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><div><p className="rh-micro">{type==='researchers'?'RESEARCHER':item.entity_type||type.replace(/s$/,'')}</p><h2>{destination(item)?<Link href={destination(item)!}>{item.full_name||item.title||item.name||item.keyword}<ArrowUpRight size={18}/></Link>:item.full_name||item.title||item.name||item.keyword}</h2><p>{item.headline||item.affiliation||item.description||item.bio||item.body||item.employer||'ResearchHub directory record'}</p>{item.country||item.location?<small>{item.country||item.location}</small>:null}</div>
        </article>)}</div>
        {!loading&&!error&&!items.length?<div className="rh-empty"><span className="rh-empty-star" aria-hidden="true">✳</span><h2>Leave room for a different question.</h2><p>Try a broader phrase, another result type, or fewer filters.</p><button onClick={()=>{setDraft('');setQuery('');setFilters({sort:'relevance'});}}>Start exploring ↗</button></div>:null}
        {more&&!error?<button className="rh-more-results" disabled={loading} onClick={()=>load(offset+12)}>{loading?'Finding more…':'Continue exploring'} <ArrowUpRight size={16}/></button>:null}
      </section>
      <aside className="rh-search-filters"><details open><summary><SlidersHorizontal size={15}/> Refine your reading {activeFilters?<span>{activeFilters}</span>:null}</summary><div className="rh-filter-controls">
        <label>Order<select value={filters.sort||'relevance'} onChange={event=>update('sort',event.target.value)}><option value="relevance">Selected relevance</option><option value="newest">Most recent</option><option value="citations">Most cited</option><option value="reads">Most read</option></select></label>
        {type==='publications'?<>
          <label>Field<select value={filters.field_id||''} onChange={event=>update('field_id',event.target.value)}><option value="">Every discipline</option>{facets.fields?.map(field=><option key={field.id} value={field.id}>{field.name} · {field.count}</option>)}</select></label>
          <label>Journal<select value={filters.journal_id||''} onChange={event=>update('journal_id',event.target.value)}><option value="">Every journal</option>{facets.journals?.map(journal=><option key={journal.id} value={journal.id}>{journal.name}</option>)}</select></label>
          <div className="rh-filter-years"><label>From year<input type="number" min={1000} max={3000} value={filters.year_from||''} onChange={event=>update('year_from',event.target.value)} placeholder="Any"/></label><label>To year<input type="number" min={1000} max={3000} value={filters.year_to||''} onChange={event=>update('year_to',event.target.value)} placeholder="Any"/></label></div>
          <label>Publication type<select value={filters.publication_type||''} onChange={event=>update('publication_type',event.target.value)}><option value="">Every format</option>{facets.publication_types?.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          {[['is_open_access','Open access'],['is_peer_reviewed','Peer reviewed'],['has_full_text','Full text available']].map(([key,label])=><label className="rh-filter-check" key={key}><input type="checkbox" checked={filters[key]==='1'} onChange={event=>update(key,event.target.checked?'1':'')}/>{label}</label>)}
        </>:<p className="rh-filter-note">Search by name, topic, or an idea. Publication filters are available in the Publications tab.</p>}
        <button className="rh-filter-reset" onClick={()=>setFilters({sort:'relevance'})}>Reset filters ↗</button>
      </div></details><div className="rh-search-note"><span aria-hidden="true">↗</span><p>Follow an idea.<br/><em>See where it takes you.</em></p></div></aside>
    </div>
  </div>;
}
