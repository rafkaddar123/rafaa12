import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Video, 
  FileText, 
  Lightbulb, 
  Calendar as CalendarIcon, 
  Settings, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Sparkles,
  Trash2,
  Save,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Markdown from 'react-markdown';
import { Project, ProjectStatus, Idea } from './types';
import { generateVideoIdeas, generateScriptOutline, optimizeTitle } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'scripts' | 'ideas'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('vco_projects');
    const savedIdeas = localStorage.getItem('vco_ideas');
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedIdeas) setIdeas(JSON.parse(savedIdeas));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('vco_projects', JSON.stringify(projects));
    localStorage.setItem('vco_ideas', JSON.stringify(ideas));
  }, [projects, ideas]);

  const addProject = (title: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title,
      description: '',
      status: 'Idea',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      script: '',
      tags: []
    };
    setProjects([...projects, newProject]);
    setIsAddingProject(false);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
  };

  const addIdea = (content: string) => {
    const newIdea: Idea = {
      id: Date.now().toString(),
      content,
      createdAt: new Date().toISOString()
    };
    setIdeas([newIdea, ...ideas]);
  };

  const handleAiAction = async (action: 'ideas' | 'outline' | 'title', input: string) => {
    setAiLoading(true);
    try {
      let res = '';
      if (action === 'ideas') res = await generateVideoIdeas(input);
      if (action === 'outline') res = await generateScriptOutline(input);
      if (action === 'title') res = await optimizeTitle(input);
      setAiResponse(res);
    } catch (error) {
      console.error(error);
      setAiResponse('حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.');
    } finally {
      setAiLoading(false);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Idea': return 'bg-slate-100 text-slate-600';
      case 'Scripting': return 'bg-blue-100 text-blue-600';
      case 'Filming': return 'bg-amber-100 text-amber-600';
      case 'Editing': return 'bg-purple-100 text-purple-600';
      case 'Published': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans flex flex-row-reverse" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-slate-200 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Video size={24} />
          </div>
          <h1 className="font-bold text-lg tracking-tight">منظم المحتوى</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="لوحة التحكم" 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setSelectedProject(null); }} 
          />
          <SidebarItem 
            icon={<Video size={20} />} 
            label="المشاريع" 
            active={activeTab === 'projects'} 
            onClick={() => { setActiveTab('projects'); setSelectedProject(null); }} 
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            label="السكربتات" 
            active={activeTab === 'scripts'} 
            onClick={() => { setActiveTab('scripts'); setSelectedProject(null); }} 
          />
          <SidebarItem 
            icon={<Lightbulb size={20} />} 
            label="بنك الأفكار" 
            active={activeTab === 'ideas'} 
            onClick={() => { setActiveTab('ideas'); setSelectedProject(null); }} 
          />
        </nav>

        <div className="mt-auto">
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">مساعد الذكاء الاصطناعي</span>
            </div>
            <p className="text-xs text-indigo-900/70 leading-relaxed mb-3">
              استخدم قوة Gemini لتوليد أفكار وسكربتات بضغطة زر.
            </p>
            <button 
              onClick={() => setActiveTab('ideas')}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
            >
              جرب الآن
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'نظرة عامة'}
              {activeTab === 'projects' && 'مشاريع الفيديو'}
              {activeTab === 'scripts' && 'محرر السكربتات'}
              {activeTab === 'ideas' && 'بنك الأفكار'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {format(new Date(), 'EEEE, d MMMM yyyy', { locale: ar })}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="بحث..." 
                className="pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
              />
            </div>
            <button 
              onClick={() => setIsAddingProject(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm"
            >
              <Plus size={18} />
              مشروع جديد
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {selectedProject ? (
            <ProjectDetail 
              project={selectedProject} 
              onBack={() => setSelectedProject(null)} 
              onUpdate={updateProject}
              onDelete={deleteProject}
              onAiAction={handleAiAction}
              aiLoading={aiLoading}
              aiResponse={aiResponse}
              setAiResponse={setAiResponse}
            />
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  projects={projects} 
                  ideas={ideas} 
                  onSelectProject={setSelectedProject} 
                />
              )}
              {activeTab === 'projects' && (
                <ProjectList 
                  projects={projects} 
                  onSelectProject={setSelectedProject} 
                  getStatusColor={getStatusColor}
                />
              )}
              {activeTab === 'scripts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.filter(p => p.status !== 'Published').map(project => (
                    <div 
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <FileText size={20} />
                        </div>
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md", getStatusColor(project.status))}>
                          {project.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                      <p className="text-slate-500 text-xs mt-2 line-clamp-2">
                        {project.script || 'لا يوجد سكربت مكتوب بعد...'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'ideas' && (
                <IdeaBoard 
                  ideas={ideas} 
                  onAddIdea={addIdea} 
                  onAiAction={handleAiAction}
                  aiLoading={aiLoading}
                  aiResponse={aiResponse}
                  setAiResponse={setAiResponse}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isAddingProject && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6">إنشاء مشروع فيديو جديد</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addProject(formData.get('title') as string);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">عنوان الفيديو</label>
                    <input 
                      name="title"
                      required
                      autoFocus
                      type="text" 
                      placeholder="مثلاً: كيف تبدأ في البرمجة" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                  >
                    إنشاء المشروع
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsAddingProject(false)}
                    className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-indigo-50 text-indigo-600 font-bold" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <span className={cn("transition-colors", active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
      {active && <motion.div layoutId="active-pill" className="mr-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
    </button>
  );
}

function Dashboard({ projects, ideas, onSelectProject }: { projects: Project[], ideas: Idea[], onSelectProject: (p: Project) => void }) {
  const stats = [
    { label: 'مشاريع نشطة', value: projects.filter(p => p.status !== 'Published').length, icon: <Video className="text-blue-600" />, color: 'bg-blue-50' },
    { label: 'تم نشرها', value: projects.filter(p => p.status === 'Published').length, icon: <CheckCircle2 className="text-emerald-600" />, color: 'bg-emerald-50' },
    { label: 'أفكار جديدة', value: ideas.length, icon: <Lightbulb className="text-amber-600" />, color: 'bg-amber-50' },
    { label: 'سكربتات قيد العمل', value: projects.filter(p => p.status === 'Scripting').length, icon: <FileText className="text-purple-600" />, color: 'bg-purple-50' },
  ];

  const recentProjects = [...projects].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.color)}>
              {stat.icon}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">آخر المشاريع</h3>
            <button className="text-indigo-600 text-sm font-medium hover:underline">عرض الكل</button>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            {recentProjects.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentProjects.map(project => (
                  <div 
                    key={project.id} 
                    onClick={() => onSelectProject(project)}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                        <Video size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{project.title}</p>
                        <p className="text-xs text-slate-500">تاريخ الاستحقاق: {project.dueDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md", 
                        project.status === 'Published' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                      )}>
                        {project.status}
                      </span>
                      <ChevronRight size={18} className="text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Video size={32} />
                </div>
                <p className="text-slate-500 text-sm">لا توجد مشاريع حالياً. ابدأ بإضافة مشروع جديد!</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">الجدول الزمني</h3>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 h-[400px] flex flex-col items-center justify-center text-center">
            <CalendarIcon size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-500 text-sm">سيظهر هنا تقويم النشر الخاص بك قريباً.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectList({ projects, onSelectProject, getStatusColor }: { projects: Project[], onSelectProject: (p: Project) => void, getStatusColor: (s: ProjectStatus) => string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, i) => (
        <motion.div 
          key={project.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelectProject(project)}
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <Video size={24} />
            </div>
            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md", getStatusColor(project.status))}>
              {project.status}
            </span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
          <p className="text-slate-500 text-sm line-clamp-2 mb-6">{project.description || 'لا يوجد وصف لهذا المشروع بعد.'}</p>
          
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock size={14} />
              <span className="text-xs">{project.dueDate}</span>
            </div>
            <div className="flex -space-x-2 space-x-reverse">
              {[1, 2].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ProjectDetail({ 
  project, 
  onBack, 
  onUpdate, 
  onDelete, 
  onAiAction, 
  aiLoading, 
  aiResponse, 
  setAiResponse 
}: { 
  project: Project, 
  onBack: () => void, 
  onUpdate: (p: Project) => void, 
  onDelete: (id: string) => void,
  onAiAction: (action: 'ideas' | 'outline' | 'title', input: string) => void,
  aiLoading: boolean,
  aiResponse: string | null,
  setAiResponse: (s: string | null) => void
}) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [status, setStatus] = useState(project.status);
  const [dueDate, setDueDate] = useState(project.dueDate);
  const [script, setScript] = useState(project.script);

  const handleSave = () => {
    onUpdate({
      ...project,
      title,
      description,
      status,
      dueDate,
      script
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 w-full"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all"
          >
            <Save size={18} />
            حفظ التغييرات
          </button>
          <button 
            onClick={() => { if(confirm('هل أنت متأكد من حذف هذا المشروع؟')) onDelete(project.id); onBack(); }}
            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-indigo-600" />
              السكربت
            </h3>
            <textarea 
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="ابدأ بكتابة السكربت هنا..."
              className="w-full h-96 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-sm leading-relaxed resize-none"
            />
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => onAiAction('outline', title)}
                disabled={aiLoading}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
              >
                <Sparkles size={14} />
                توليد مخطط بالذكاء الاصطناعي
              </button>
            </div>
          </div>

          {aiResponse && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold flex items-center gap-2">
                    <Sparkles size={18} />
                    اقتراح الذكاء الاصطناعي
                  </h4>
                  <button onClick={() => setAiResponse(null)} className="text-white/60 hover:text-white">إغلاق</button>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <Markdown>{aiResponse}</Markdown>
                </div>
                <button 
                  onClick={() => { setScript(script + '\n\n' + aiResponse); setAiResponse(null); }}
                  className="mt-6 w-full py-2 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors"
                >
                  إضافة إلى السكربت
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <h3 className="text-lg font-bold mb-6">تفاصيل المشروع</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">الحالة</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none"
                >
                  <option value="Idea">فكرة</option>
                  <option value="Scripting">كتابة السكربت</option>
                  <option value="Filming">تصوير</option>
                  <option value="Editing">مونتاج</option>
                  <option value="Published">تم النشر</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">تاريخ النشر المستهدف</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">الوصف</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none resize-none"
                  placeholder="وصف مختصر للفيديو..."
                />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
            <h4 className="text-indigo-900 font-bold text-sm mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              تحسين العنوان
            </h4>
            <p className="text-indigo-900/60 text-xs mb-4">هل تريد عنواناً أكثر جاذبية؟ دع الذكاء الاصطناعي يقترح عليك بدائل.</p>
            <button 
              onClick={() => onAiAction('title', title)}
              disabled={aiLoading}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {aiLoading ? 'جاري التحليل...' : 'تحسين العنوان'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function IdeaBoard({ 
  ideas, 
  onAddIdea, 
  onAiAction, 
  aiLoading, 
  aiResponse, 
  setAiResponse 
}: { 
  ideas: Idea[], 
  onAddIdea: (c: string) => void,
  onAiAction: (action: 'ideas' | 'outline' | 'title', input: string) => void,
  aiLoading: boolean,
  aiResponse: string | null,
  setAiResponse: (s: string | null) => void
}) {
  const [newIdea, setNewIdea] = useState('');
  const [niche, setNiche] = useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h3 className="text-lg font-bold mb-4">أضف فكرة سريعة</h3>
          <div className="flex gap-3">
            <input 
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="اكتب فكرتك هنا..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button 
              onClick={() => { if(newIdea) onAddIdea(newIdea); setNewIdea(''); }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              حفظ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ideas.map((idea, i) => (
            <motion.div 
              key={idea.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 relative group"
            >
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
              <p className="text-slate-800 text-sm leading-relaxed">{idea.content}</p>
              <p className="text-[10px] text-slate-400 mt-4">{format(new Date(idea.createdAt), 'd MMMM yyyy', { locale: ar })}</p>
            </motion.div>
          ))}
          {ideas.length === 0 && (
            <div className="md:col-span-2 p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <Lightbulb size={48} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500">لا توجد أفكار بعد. ابدأ بتدوين أفكارك أو استخدم الذكاء الاصطناعي!</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <Sparkles size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">مولد الأفكار الذكي</h3>
          <p className="text-indigo-100 text-sm mb-8 leading-relaxed">أدخل مجالك وسيقوم Gemini باقتراح 5 أفكار فيديوهات إبداعية لك.</p>
          
          <div className="space-y-4">
            <input 
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="مثلاً: الطبخ، التقنية، السفر..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button 
              onClick={() => onAiAction('ideas', niche)}
              disabled={aiLoading || !niche}
              className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg disabled:opacity-50"
            >
              {aiLoading ? 'جاري التوليد...' : 'توليد الأفكار'}
            </button>
          </div>
        </div>

        {aiResponse && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-indigo-600 flex items-center gap-2">
                <Sparkles size={18} />
                الأفكار المقترحة
              </h4>
              <button onClick={() => setAiResponse(null)} className="text-slate-400 hover:text-slate-600">إغلاق</button>
            </div>
            <div className="prose prose-sm max-w-none text-slate-700">
              <Markdown>{aiResponse}</Markdown>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
