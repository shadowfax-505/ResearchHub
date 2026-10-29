'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { login, register, forgotPassword } from '@/lib/api';

export function AuthPanel({kind}:{kind:'login'|'signup'}) {
  const router=useRouter();const [forgot,setForgot]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(pending)return;const form=new FormData(event.currentTarget);setPending(true);setError('');setMessage('');
    try{
      if(forgot){await forgotPassword(String(form.get('email')));setMessage('If that email is registered, reset instructions are queued for delivery.');return;}
      if(kind==='login')await login(String(form.get('username')),String(form.get('password')));
      else await register({username:String(form.get('username')),email:String(form.get('email')),full_name:String(form.get('full_name')),password:String(form.get('password'))});
      const target=new URLSearchParams(window.location.search).get('returnTo');
      router.replace((target?.startsWith('/')&&!target.startsWith('//')&&!target.startsWith('/login')?target:'/feed') as Route);router.refresh();
    }catch(cause){setError(cause instanceof Error?cause.message:'Unable to sign in. Please try again.');}
    finally{setPending(false);}
  }
  return <div className="rh-auth-layout"><aside className="rh-auth-note"><BookOpen size={34} strokeWidth={1}/><p>A place for<br/><em>what comes next.</em></p><span>GOOD QUESTIONS.<br/>BETTER COMPANY.</span><div className="rh-auth-art" aria-hidden="true">{Array.from({length:9},(_,i)=><i key={i} style={{transform:`rotate(${i*12-48}deg)`}}/>)}</div></aside>
    <div className="rh-auth-card"><p className="rh-micro">{forgot?'A FRESH START':kind==='login'?'YOUR DESK IS WAITING':'PULL UP A CHAIR'}</p><h2>{forgot?'Forgot your password?':kind==='login'?'Back to your ideas.':'Make yourself at home.'}</h2><p className="rh-auth-intro">{forgot?'We’ll help you find your way back.':kind==='login'?'Sign in to your papers, people, and possibilities.':'Save good research. Ask better questions. Find your people.'}</p>
      <form onSubmit={submit} className="rh-auth-form" aria-busy={pending}>
        {kind==='signup'&&!forgot?<label>Your full name<input name="full_name" autoComplete="name" maxLength={255} required placeholder="Ada Lovelace"/></label>:null}
        {kind==='signup'||forgot?<label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@university.edu"/></label>:null}
        {!forgot?<><label>{kind==='login'?'Username or email':'Choose a username'}<input name="username" autoComplete="username" required placeholder={kind==='login'?'Username or email':'Letters and numbers, 3–30 characters'} pattern={kind==='signup'?'[a-zA-Z0-9]{3,30}':undefined} maxLength={kind==='signup'?30:255}/></label><label>Password<input name="password" type="password" autoComplete={kind==='login'?'current-password':'new-password'} required minLength={kind==='signup'?8:1} placeholder="Password"/></label></>:null}
        {error?<p role="alert" className="rh-form-error">{error}</p>:null}{message?<p role="status" className="rh-form-message">{message}</p>:null}
        <button type="submit" disabled={pending} className="rh-auth-submit">{pending?'One moment…':forgot?'Send reset instructions':kind==='login'?'Sign in':'Create your account'}<ArrowUpRight size={17}/></button>
        {kind==='login'?<button type="button" className="rh-auth-text-button" onClick={()=>{setForgot(!forgot);setMessage('');setError('');}}>{forgot?'Back to sign in':'Forgot your password?'}</button>:null}
      </form>
      <p className="rh-auth-switch">{kind==='login'?'New around here?':'Already have a desk?'} <Link href={kind==='login'?'/signup':'/login'}>{kind==='login'?'Join the room':'Sign in'} ↗</Link></p>
    </div>
  </div>;
}
