import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Building2, AlignLeft, GraduationCap, CheckCircle2, FlaskConical, Users, Plus, X, Trash2, Briefcase, BookOpen, Code2, Globe2, FileText, Download, Calendar } from 'lucide-react';
import { PublicResearcherProfile, Education, Experience, Skill, Language, Discipline, addEducation, deleteEducation, addExperience, deleteExperience, addSkill, deleteSkill, addLanguage, deleteLanguage, addDiscipline, deleteDiscipline, getAuthorPapers } from '@/lib/api';
import { PaperCard } from '@/components/papers/paper-card';
import { PortfolioExporterModal } from './portfolio-exporter-modal';
import { OfficeHoursModal } from './office-hours-modal';
import { CoauthorGraph } from './coauthor-graph';
import { TaxonomyTagCloud } from './taxonomy-tag-cloud';
import { ReviewerVelocityCard } from './reviewer-velocity-card';

export function ProfileTabOverview({ profile, onUpdate }: { profile: PublicResearcherProfile, onUpdate?: () => void }) {
  const [addingEdu, setAddingEdu] = useState(false);
  const [addingExp, setAddingExp] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);
  const [addingLang, setAddingLang] = useState(false);
  const [addingDisc, setAddingDisc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.user_id) return;
    getAuthorPapers(profile.user_id).then(res => {
      if (res?.data) setPapers(res.data);
    }).catch(console.error);
  }, [profile?.user_id]);

  // Forms
  const [eduForm, setEduForm] = useState({ institution: '', degree: '', field_of_study: '', start_year: '', end_year: '' });
  const [expForm, setExpForm] = useState({ company: '', position: '', start_date: '', end_date: '', description: '' });
  const [skillForm, setSkillForm] = useState('');
  const [langForm, setLangForm] = useState({ language_name: '', proficiency: 'Fluent' });
  const [discForm, setDiscForm] = useState('');

  const handleAdd = async (apiCall: Promise<any>, closeFn: () => void) => {
    setLoading(true);
    try {
      await apiCall;
      if (onUpdate) onUpdate();
      closeFn();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (apiCall: Promise<any>) => {
    try {
      await apiCall;
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const [selectedYear, setSelectedYear] = useState('All Years');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showOfficeHoursModal, setShowOfficeHoursModal] = useState(false);

  const filteredPapers = papers.filter(p => {
    if (selectedYear === 'All Years') return true;
    const year = p.publication_date ? new Date(p.publication_date).getFullYear().toString() : '';
    if (selectedYear === '2023 & earlier') {
      return Number(year) <= 2023 || !year;
    }
    return year === selectedYear;
  });

  return (
    <div className="w-full">
      <div className={`grid gap-6 ${!profile.is_verified ? 'lg:grid-cols-[1fr_300px]' : 'w-full'}`}>
        
        {/* Introduction */}
        <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-ink dark:text-darkInk">Introduction</h2>
            <button
              type="button"
              onClick={() => setShowOfficeHoursModal(true)}
              className="px-3 py-1 bg-teal-600 text-white rounded font-bold text-xs hover:bg-teal-500 transition flex items-center gap-1.5"
            >
              <Calendar size={13} /> Book Office Hours
            </button>
          </div>
          {profile.bio ? (
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">{profile.bio}</p>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line p-8 text-center dark:border-darkLine">
               <AlignLeft size={32} className="mb-3 text-slate-300 dark:text-slate-600" />
               <p className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Add an introduction to tell other researchers more about you.</p>
               <Button variant="secondary" size="sm">Add introduction</Button>
            </div>
          )}
        </section>
        
        {!profile.is_verified && (
          <div className="space-y-6">
            <section className="relative rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
              <Button variant="ghost" className="absolute right-2 top-2 h-8 w-8 text-muted px-0"><Plus className="rotate-45" size={16} /></Button>
              <div className="flex flex-col items-center text-center">
                 <CheckCircle2 className="text-primary" size={48} />
                 <h3 className="mt-4 text-lg font-black leading-tight">{profile.full_name?.split(' ')[0] || profile.username}, you&apos;re not verified yet</h3>
                 <p className="mt-2 text-sm text-muted dark:text-darkMuted">Confirm your institutional email address to get your Verified Badge.</p>
                 <Button variant="secondary" className="mt-4 w-full">Verify now</Button>
              </div>
            </section>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-6">
        <TaxonomyTagCloud />
        <ReviewerVelocityCard />
        <CoauthorGraph authorName={profile?.full_name || profile?.username || 'Scholar'} />
        {/* Research & Publications */}
        {papers.length > 0 && (
          <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-black text-ink dark:text-darkInk flex items-center gap-2">
                <FileText size={20} /> Research & Publications ({filteredPapers.length})
              </h2>
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  className="px-3 py-1 bg-primary text-white rounded-full text-xs font-bold transition flex items-center gap-1 shrink-0 hover:bg-primaryDark"
                >
                  <Download size={12} /> Export Portfolio
                </button>
                <span className="text-xs font-bold text-slate-500 mr-1">Year:</span>
                {['All Years', '2026', '2025', '2024', '2023 & earlier'].map(year => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectedYear(year)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition border ${
                      selectedYear === year
                        ? 'bg-primary text-white border-primary'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-primary dark:bg-darkPanel dark:border-darkLine dark:text-slate-300'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredPapers.map(paper => (
                <PaperCard key={paper.paper_id} paper={paper} />
              ))}
            </div>
          </section>
        )}

        {/* Current Affiliation */}
        <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
          <h2 className="mb-4 text-xl font-black text-ink dark:text-darkInk">Current affiliation</h2>
          {profile.affiliation ? (
            <div className="flex gap-4">
               <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-darkPanel">
                  <Building2 size={24} className="text-slate-400" />
               </div>
               <div>
                  <h3 className="font-bold">{profile.affiliation}</h3>
                  {profile.department && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{profile.department}</p>}
                  {profile.position_title && <p className="text-sm text-slate-500 mt-1">{profile.position_title}</p>}
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line p-8 text-center dark:border-darkLine">
               <Building2 size={32} className="mb-3 text-slate-300 dark:text-slate-600" />
               <p className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Add your current affiliation to connect with colleagues.</p>
               <Button variant="secondary" size="sm">Add affiliation</Button>
            </div>
          )}
        </section>

        {/* Disciplines */}
        <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-ink dark:text-darkInk flex items-center gap-2"><BookOpen size={20}/> Disciplines</h2>
            {!addingDisc && <Button variant="ghost" size="sm" onClick={() => setAddingDisc(true)}><Plus size={16} /> Add</Button>}
          </div>
          {addingDisc && (
             <div className="mb-4 p-4 border rounded-lg bg-slate-50 dark:bg-darkPanel dark:border-darkLine flex gap-2">
               <input type="text" placeholder="Discipline name" className="flex-1 p-2 border rounded text-sm" value={discForm} onChange={e => setDiscForm(e.target.value)} />
               <Button size="sm" disabled={loading} onClick={() => handleAdd(addDiscipline(discForm), () => { setAddingDisc(false); setDiscForm(''); })}>Save</Button>
               <Button variant="ghost" size="sm" onClick={() => setAddingDisc(false)}>Cancel</Button>
             </div>
          )}
          {profile.disciplines && profile.disciplines.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.disciplines.map(d => (
                <div key={d.discipline_id} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm font-medium">
                  {d.discipline_name}
                  <button onClick={() => handleDelete(deleteDiscipline(d.discipline_id!))} className="text-red-500 hover:text-red-700"><X size={14}/></button>
                </div>
              ))}
            </div>
          ) : !addingDisc && (
            <p className="text-sm text-slate-500">No disciplines added yet.</p>
          )}
        </section>

        {/* Skills & Languages */}
        <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-ink dark:text-darkInk flex items-center gap-2"><Code2 size={18}/> Skills</h2>
                {!addingSkill && <Button variant="ghost" size="sm" onClick={() => setAddingSkill(true)}><Plus size={16} /> Add</Button>}
              </div>
              {addingSkill && (
                <div className="mb-4 flex gap-2">
                  <input type="text" placeholder="Skill name" className="flex-1 p-2 border rounded text-sm w-full" value={skillForm} onChange={e => setSkillForm(e.target.value)} />
                  <Button size="sm" disabled={loading} onClick={() => handleAdd(addSkill(skillForm), () => { setAddingSkill(false); setSkillForm(''); })}>Save</Button>
                </div>
              )}
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(s => (
                    <div key={s.skill_id} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-sm font-medium border border-line dark:border-darkLine">
                      {s.skill_name}
                      <button onClick={() => handleDelete(deleteSkill(s.skill_id!))} className="text-red-500 hover:text-red-700"><X size={14}/></button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-500">No skills added yet.</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-ink dark:text-darkInk flex items-center gap-2"><Globe2 size={18}/> Languages</h2>
                {!addingLang && <Button variant="ghost" size="sm" onClick={() => setAddingLang(true)}><Plus size={16} /> Add</Button>}
              </div>
              {addingLang && (
                <div className="mb-4 flex flex-col gap-2">
                  <input type="text" placeholder="Language" className="p-2 border rounded text-sm" value={langForm.language_name} onChange={e => setLangForm({...langForm, language_name: e.target.value})} />
                  <select className="p-2 border rounded text-sm" value={langForm.proficiency} onChange={e => setLangForm({...langForm, proficiency: e.target.value})}>
                    <option>Native</option><option>Fluent</option><option>Intermediate</option><option>Beginner</option>
                  </select>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={loading} onClick={() => handleAdd(addLanguage(langForm.language_name, langForm.proficiency), () => { setAddingLang(false); setLangForm({language_name:'', proficiency:'Fluent'}); })}>Save</Button>
                    <Button variant="ghost" size="sm" onClick={() => setAddingLang(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              {profile.languages && profile.languages.length > 0 ? (
                <div className="space-y-2">
                  {profile.languages.map(l => (
                    <div key={l.language_id} className="flex items-center justify-between bg-slate-50 dark:bg-darkPanel p-2 rounded border border-line dark:border-darkLine">
                      <div>
                        <p className="text-sm font-bold">{l.language_name}</p>
                        <p className="text-xs text-muted">{l.proficiency}</p>
                      </div>
                      <button onClick={() => handleDelete(deleteLanguage(l.language_id!))} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-500">No languages added yet.</p>}
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-ink dark:text-darkInk flex items-center gap-2"><GraduationCap size={24}/> Education</h2>
            {!addingEdu && <Button variant="ghost" size="sm" onClick={() => setAddingEdu(true)}><Plus size={16} /> Add</Button>}
          </div>
          {addingEdu && (
             <div className="mb-6 p-4 border rounded-lg bg-slate-50 dark:bg-darkPanel dark:border-darkLine grid gap-3">
               <input type="text" placeholder="Institution" className="p-2 border rounded text-sm" value={eduForm.institution} onChange={e => setEduForm({...eduForm, institution: e.target.value})} />
               <div className="grid grid-cols-2 gap-3">
                 <input type="text" placeholder="Degree (e.g. PhD)" className="p-2 border rounded text-sm" value={eduForm.degree} onChange={e => setEduForm({...eduForm, degree: e.target.value})} />
                 <input type="text" placeholder="Field of Study" className="p-2 border rounded text-sm" value={eduForm.field_of_study} onChange={e => setEduForm({...eduForm, field_of_study: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <input type="number" min="1900" max="2100" maxLength={4} placeholder="Start Year" className="p-2 border rounded text-sm" value={eduForm.start_year} onChange={e => setEduForm({...eduForm, start_year: e.target.value})} />
                 <input type="number" min="1900" max="2100" maxLength={4} placeholder="End Year" className="p-2 border rounded text-sm" value={eduForm.end_year} onChange={e => setEduForm({...eduForm, end_year: e.target.value})} />
               </div>
               <div className="flex gap-2">
                 <Button size="sm" disabled={loading} onClick={() => handleAdd(addEducation({
                   institution: eduForm.institution,
                   degree: eduForm.degree,
                   field_of_study: eduForm.field_of_study,
                   start_year: eduForm.start_year ? parseInt(eduForm.start_year) : undefined,
                   end_year: eduForm.end_year ? parseInt(eduForm.end_year) : undefined
                 }), () => { setAddingEdu(false); setEduForm({ institution: '', degree: '', field_of_study: '', start_year: '', end_year: '' }); })}>Save</Button>
                 <Button variant="ghost" size="sm" onClick={() => setAddingEdu(false)}>Cancel</Button>
               </div>
             </div>
          )}
          {profile.education && profile.education.length > 0 ? (
            <div className="space-y-4">
              {profile.education.map(e => (
                <div key={e.education_id} className="flex gap-4">
                  <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-darkPanel">
                    <GraduationCap size={20} className="text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                       <h3 className="font-bold">{e.institution}</h3>
                       <button onClick={() => handleDelete(deleteEducation(e.education_id!))} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{e.degree} {e.field_of_study ? `in ${e.field_of_study}` : ''}</p>
                    <p className="text-sm text-muted">{e.start_year} - {e.end_year || 'Present'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : !addingEdu && (
            <p className="text-sm text-slate-500">No education history added yet.</p>
          )}
        </section>

        {/* Experience */}
        <section className="rounded-soft border border-line bg-paper p-6 shadow-stitch dark:border-darkLine dark:bg-darkCard">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-ink dark:text-darkInk flex items-center gap-2"><Briefcase size={20}/> Experience</h2>
            {!addingExp && <Button variant="ghost" size="sm" onClick={() => setAddingExp(true)}><Plus size={16} /> Add</Button>}
          </div>
          {addingExp && (
             <div className="mb-6 p-4 border rounded-lg bg-slate-50 dark:bg-darkPanel dark:border-darkLine grid gap-3">
               <input type="text" placeholder="Company/Institution" className="p-2 border rounded text-sm" value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} />
               <input type="text" placeholder="Position" className="p-2 border rounded text-sm" value={expForm.position} onChange={e => setExpForm({...expForm, position: e.target.value})} />
               <div className="grid grid-cols-2 gap-3">
                 <input type="date" placeholder="Start Date" className="p-2 border rounded text-sm" value={expForm.start_date} onChange={e => setExpForm({...expForm, start_date: e.target.value})} />
                 <input type="date" placeholder="End Date" className="p-2 border rounded text-sm" value={expForm.end_date} onChange={e => setExpForm({...expForm, end_date: e.target.value})} />
               </div>
               <textarea placeholder="Description" className="p-2 border rounded text-sm" value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} />
               <div className="flex gap-2">
                 <Button size="sm" disabled={loading} onClick={() => handleAdd(addExperience({
                   company: expForm.company,
                   position: expForm.position,
                   start_date: expForm.start_date || undefined,
                   end_date: expForm.end_date || undefined,
                   description: expForm.description || undefined
                 }), () => { setAddingExp(false); setExpForm({ company: '', position: '', start_date: '', end_date: '', description: '' }); })}>Save</Button>
                 <Button variant="ghost" size="sm" onClick={() => setAddingExp(false)}>Cancel</Button>
               </div>
             </div>
          )}
          {profile.experience && profile.experience.length > 0 ? (
            <div className="space-y-4">
              {profile.experience.map(e => (
                <div key={e.experience_id} className="flex gap-4 border-b border-line dark:border-darkLine pb-4 last:border-0 last:pb-0">
                  <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-darkPanel">
                    <Building2 size={20} className="text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                       <h3 className="font-bold">{e.position}</h3>
                       <button onClick={() => handleDelete(deleteExperience(e.experience_id!))} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{e.company}</p>
                    <p className="text-sm text-muted">{e.start_date ? new Date(e.start_date).toLocaleDateString() : ''} - {e.end_date ? new Date(e.end_date).toLocaleDateString() : 'Present'}</p>
                    {e.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : !addingExp && (
            <p className="text-sm text-slate-500">No experience added yet.</p>
          )}
        </section>

      </div>

      <PortfolioExporterModal
        authorName={profile.full_name || profile.username || 'Researcher'}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      <OfficeHoursModal
        scholarName={profile.full_name || profile.username || 'Researcher'}
        isOpen={showOfficeHoursModal}
        onClose={() => setShowOfficeHoursModal(false)}
      />

      <CoauthorGraph authorName={profile.full_name || profile.username || 'Researcher'} />
    </div>
  );
}
