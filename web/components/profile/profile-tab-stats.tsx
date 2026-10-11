'use client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { PublicResearcherProfile } from '@/lib/api';
export function ProfileTabStats({profile}:{profile:PublicResearcherProfile}) {
 const papers=profile.papers||[];
 const totals=[['Publications',papers.length],['Citations',papers.reduce((sum,paper)=>sum+(paper.citation_count||0),0)],['Reads',profile.total_reads??papers.reduce((sum,paper)=>sum+(paper.view_count||0),0)],['Downloads',papers.reduce((sum,paper)=>sum+(paper.download_count||0),0)]];
 return <section className="rh-profile-record"><p className="rh-micro">YOUR RESEARCH IN THIS ROOM</p><h2>Work leaves a record.</h2><p>These totals describe publications linked to your ResearchHub profile. Citation counts are stored metadata; reads and downloads are recorded by this app.</p><dl>{totals.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{Number(value).toLocaleString()}</dd></div>)}</dl><p>Time-series data and external impact verification are not available yet.</p><Link href="/submit">Add your next publication <ArrowUpRight size={15}/></Link></section>;
}
